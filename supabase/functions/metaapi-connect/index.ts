import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const METAAPI_TOKEN = Deno.env.get("METAAPI_TOKEN")!;
const METAAPI_BASE = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";
const FALLBACK_REGIONS = ["london", "new-york", "vint-hill", "singapore"];

async function parseResponseBody(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;
  }
  return fallback;
}

async function getAccountDetails(accountId: string) {
  const response = await fetch(`${METAAPI_BASE}/users/current/accounts/${accountId}`, {
    headers: { "auth-token": METAAPI_TOKEN },
  });
  const payload = await parseResponseBody(response);
  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, "Failed to load account details"));
  }
  return payload as Record<string, any>;
}

function getClientBases(account: Record<string, any>) {
  const regions = new Set<string>();
  const addRegion = (value: unknown) => {
    if (typeof value === "string" && value.trim()) {
      regions.add(value.trim());
    }
  };

  addRegion(account.region);
  for (const replica of account.accountReplicas ?? []) addRegion(replica?.region);
  for (const connection of account.connections ?? []) addRegion(connection?.region);
  for (const fallbackRegion of FALLBACK_REGIONS) addRegion(fallbackRegion);

  return Array.from(regions).map((region) => ({
    region,
    baseUrl: `https://mt-client-api-v1.${region}.agiliumtrade.ai`,
  }));
}

async function waitForAccountReady(accountId: string, timeoutMs = 45000) {
  const startedAt = Date.now();
  let latestAccount: Record<string, any> | null = null;

  while (Date.now() - startedAt < timeoutMs) {
    latestAccount = await getAccountDetails(accountId);

    if (latestAccount.state === "DEPLOYED" && latestAccount.connectionStatus === "CONNECTED") {
      return latestAccount;
    }

    await new Promise((resolve) => setTimeout(resolve, 2500));
  }

  return latestAccount;
}

async function requestFromClientApi(accountId: string, path: string, account: Record<string, any>) {
  let lastError = "Failed to fetch MetaApi data";
  let lastStatus = 504;

  for (const candidate of getClientBases(account)) {
    const response = await fetch(`${candidate.baseUrl}/users/current/accounts/${accountId}/${path}`, {
      headers: { "auth-token": METAAPI_TOKEN },
    });
    const payload = await parseResponseBody(response);

    if (response.ok) {
      return { ok: true as const, payload, region: candidate.region };
    }

    lastError = extractErrorMessage(payload, lastError);
    lastStatus = response.status;

    const shouldTryNextRegion = /not connected to broker yet|does not match the account region|timeout/i.test(lastError);
    if (!shouldTryNextRegion) {
      return { ok: false as const, error: lastError, status: lastStatus, region: candidate.region };
    }
  }

  return { ok: false as const, error: lastError, status: lastStatus };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "list-accounts") {
      const response = await fetch(`${METAAPI_BASE}/users/current/accounts`, {
        headers: { "auth-token": METAAPI_TOKEN },
      });
      const payload = await parseResponseBody(response);
      if (!response.ok) {
        return new Response(JSON.stringify({ error: extractErrorMessage(payload, "MetaApi error") }), {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ accounts: payload }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "add-account") {
      const { login, password, serverName, platform, name } = body;
      if (!login || !password || !serverName || !platform) {
        return new Response(JSON.stringify({ error: "Missing required fields: login, password, serverName, platform" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const response = await fetch(`${METAAPI_BASE}/users/current/accounts`, {
        method: "POST",
        headers: {
          "auth-token": METAAPI_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login,
          password,
          name: name || `ZenTrade-${login}`,
          server: serverName,
          platform,
          type: "cloud",
          magic: 0,
        }),
      });
      const payload = await parseResponseBody(response);

      if (!response.ok) {
        const errMsg = extractErrorMessage(payload, "Failed to add account");
        console.error("MetaAPI add-account error:", response.status, JSON.stringify(payload));

        // If account already exists — fetch existing account list and find it
        if (response.status === 409 || /already exists|duplicate/i.test(errMsg)) {
          const listRes = await fetch(`${METAAPI_BASE}/users/current/accounts`, {
            headers: { "auth-token": METAAPI_TOKEN },
          });
          const accounts = await parseResponseBody(listRes) as any[];
          const existing = Array.isArray(accounts)
            ? accounts.find((a: any) => String(a.login) === String(login) && a.server === serverName)
            : null;
          if (existing) {
            return new Response(JSON.stringify({ account: existing }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }

        return new Response(JSON.stringify({ error: errMsg }), {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ account: payload }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-history") {
      const { accountId, startTime, endTime } = body;
      if (!accountId) {
        return new Response(JSON.stringify({ error: "Missing accountId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const deployResponse = await fetch(`${METAAPI_BASE}/users/current/accounts/${accountId}/deploy`, {
        method: "POST",
        headers: { "auth-token": METAAPI_TOKEN },
      });

      if (!deployResponse.ok && deployResponse.status !== 204) {
        const deployPayload = await parseResponseBody(deployResponse);
        console.error("MetaApi deploy error:", deployPayload);
      } else {
        await deployResponse.text();
      }

      const account = await waitForAccountReady(accountId);
      if (!account || account.state !== "DEPLOYED" || account.connectionStatus !== "CONNECTED") {
        return new Response(JSON.stringify({
          deals: [],
          pending: true,
          state: account?.state ?? null,
          connectionStatus: account?.connectionStatus ?? null,
          message: "Account is still connecting to broker. Please retry in a few seconds.",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const start = startTime || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const end = endTime || new Date().toISOString();
      const path = `history-deals/time/${encodeURIComponent(start)}/${encodeURIComponent(end)}`;
      const result = await requestFromClientApi(accountId, path, account);

      if (!result.ok) {
        return new Response(JSON.stringify({
          error: result.error,
          state: account.state ?? null,
          connectionStatus: account.connectionStatus ?? null,
          region: account.region ?? null,
        }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ deals: result.payload, region: result.region }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "account-info") {
      const { accountId } = body;
      if (!accountId) {
        return new Response(JSON.stringify({ error: "Missing accountId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const account = await waitForAccountReady(accountId);
      if (!account || account.state !== "DEPLOYED" || account.connectionStatus !== "CONNECTED") {
        return new Response(JSON.stringify({
          info: null,
          pending: true,
          state: account?.state ?? null,
          connectionStatus: account?.connectionStatus ?? null,
          message: "Account is still connecting to broker. Please retry in a few seconds.",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await requestFromClientApi(accountId, "account-information", account);
      if (!result.ok) {
        return new Response(JSON.stringify({
          error: result.error,
          state: account.state ?? null,
          connectionStatus: account.connectionStatus ?? null,
          region: account.region ?? null,
        }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ info: result.payload, region: result.region }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("MetaApi function error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
