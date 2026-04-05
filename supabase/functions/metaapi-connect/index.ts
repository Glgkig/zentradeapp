import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const METAAPI_TOKEN = Deno.env.get("METAAPI_TOKEN")!;
const METAAPI_BASE = "https://mt-provisioning-api-v1.agiliumtrade.ai";
const METAAPI_CLIENT_BASE = "https://mt-client-api-v1.agiliumtrade.ai";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;
    const body = await req.json();
    const { action } = body;

    // Action: list accounts
    if (action === "list-accounts") {
      const resp = await fetch(`${METAAPI_BASE}/users/current/accounts`, {
        headers: { "auth-token": METAAPI_TOKEN },
      });
      const data = await resp.json();
      if (!resp.ok) {
        return new Response(JSON.stringify({ error: data.message || "MetaApi error" }), {
          status: resp.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ accounts: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: add account
    if (action === "add-account") {
      const { login, password, serverName, platform, name } = body;
      if (!login || !password || !serverName || !platform) {
        return new Response(JSON.stringify({ error: "Missing required fields: login, password, serverName, platform" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const resp = await fetch(`${METAAPI_BASE}/users/current/accounts`, {
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
          platform: platform, // "mt4" or "mt5"
          type: "cloud",
          magic: 0,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        return new Response(JSON.stringify({ error: data.message || "Failed to add account" }), {
          status: resp.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ account: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: get trade history
    if (action === "get-history") {
      const { accountId, startTime, endTime } = body;
      if (!accountId) {
        return new Response(JSON.stringify({ error: "Missing accountId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Ensure account is deployed
      const deployResp = await fetch(`${METAAPI_BASE}/users/current/accounts/${accountId}/deploy`, {
        method: "POST",
        headers: { "auth-token": METAAPI_TOKEN },
      });
      // 204 = already deployed, 200 = deploying — both are fine
      if (!deployResp.ok && deployResp.status !== 204) {
        const txt = await deployResp.text();
        console.error("Deploy error:", txt);
      } else {
        await deployResp.text(); // consume body
      }

      // Wait a bit for deployment
      await new Promise((r) => setTimeout(r, 2000));

      const start = startTime || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const end = endTime || new Date().toISOString();

      const historyResp = await fetch(
        `${METAAPI_CLIENT_BASE}/users/current/accounts/${accountId}/history-deals/time/${start}/${end}`,
        { headers: { "auth-token": METAAPI_TOKEN } }
      );
      const historyData = await historyResp.json();
      if (!historyResp.ok) {
        return new Response(JSON.stringify({ error: historyData.message || "Failed to fetch history" }), {
          status: historyResp.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ deals: historyData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: get account info
    if (action === "account-info") {
      const { accountId } = body;
      if (!accountId) {
        return new Response(JSON.stringify({ error: "Missing accountId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const resp = await fetch(
        `${METAAPI_CLIENT_BASE}/users/current/accounts/${accountId}/account-information`,
        { headers: { "auth-token": METAAPI_TOKEN } }
      );
      const data = await resp.json();
      if (!resp.ok) {
        return new Response(JSON.stringify({ error: data.message || "Failed to get account info" }), {
          status: resp.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ info: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use: list-accounts, add-account, get-history, account-info" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("MetaApi function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
