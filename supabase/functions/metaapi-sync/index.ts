import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const METAAPI_TOKEN = Deno.env.get("METAAPI_TOKEN")!;
const METAAPI_BASE = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";
const FALLBACK_REGIONS = ["london", "new-york", "vint-hill", "singapore"];

async function parseBody(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

async function getAccount(accountId: string) {
  const res = await fetch(`${METAAPI_BASE}/users/current/accounts/${accountId}`, {
    headers: { "auth-token": METAAPI_TOKEN },
  });
  const data = await parseBody(res);
  if (!res.ok) throw new Error(data?.message || "Failed to get account");
  return data as Record<string, any>;
}

function getClientBases(account: Record<string, any>) {
  const regions = new Set<string>();
  const add = (v: unknown) => { if (typeof v === "string" && v.trim()) regions.add(v.trim()); };
  add(account.region);
  for (const r of account.accountReplicas ?? []) add(r?.region);
  for (const c of account.connections ?? []) add(c?.region);
  for (const f of FALLBACK_REGIONS) add(f);
  return Array.from(regions).map(r => ({
    region: r,
    baseUrl: `https://mt-client-api-v1.${r}.agiliumtrade.ai`,
  }));
}

async function waitReady(accountId: string, timeoutMs = 50000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const acc = await getAccount(accountId);
    if (acc.state === "DEPLOYED" && acc.connectionStatus === "CONNECTED") return acc;
    await new Promise(r => setTimeout(r, 3000));
  }
  return await getAccount(accountId);
}

async function fetchDeals(accountId: string, account: Record<string, any>, startIso: string, endIso: string) {
  const path = `history-deals/time/${encodeURIComponent(startIso)}/${encodeURIComponent(endIso)}`;
  let lastError = "Could not reach account";
  for (const { baseUrl, region } of getClientBases(account)) {
    const res = await fetch(`${baseUrl}/users/current/accounts/${accountId}/${path}`, {
      headers: { "auth-token": METAAPI_TOKEN },
    });
    const data = await parseBody(res);
    if (res.ok) return { deals: data as any[], region };
    const msg = typeof data === "object" ? (data?.message || JSON.stringify(data)) : String(data);
    lastError = msg;
    if (/not connected|does not match|timeout/i.test(msg)) continue;
    throw new Error(msg);
  }
  throw new Error(lastError);
}

/** Map a MetaAPI closed deal to a trades row */
function dealToTrade(deal: any, userId: string) {
  const isClose = deal.entryType === "DEAL_ENTRY_OUT" || deal.entryType === "DEAL_ENTRY_INOUT";
  if (!isClose) return null;
  if (!deal.symbol) return null;
  if (!deal.price || deal.price <= 0) return null;
  if (!deal.volume || deal.volume <= 0) return null;

  const pnl = typeof deal.profit === "number" ? deal.profit : 0;
  const entryTime = deal.time || new Date().toISOString();

  return {
    user_id: userId,
    symbol: deal.symbol,
    entry_price: Number(deal.price),
    exit_price: Number(deal.price),
    entry_time: entryTime,
    lot_size: Number(deal.volume),
    profit: pnl,
    setup_type: null,
    psychology_notes: deal.comment || null,
    _key: `closed|${deal.symbol}|${entryTime}|${deal.volume}`,
  };
}

/** Map a MetaAPI open position to a trades row */
function positionToTrade(pos: any, userId: string) {
  if (!pos.symbol) return null;
  if (!pos.openPrice || pos.openPrice <= 0) return null;
  if (!pos.volume || pos.volume <= 0) return null;

  const entryTime = pos.time || new Date().toISOString();
  const unrealizedPnl = typeof pos.profit === "number" ? pos.profit : 0;

  return {
    user_id: userId,
    symbol: pos.symbol,
    entry_price: Number(pos.openPrice),
    exit_price: null,
    entry_time: entryTime,
    lot_size: Number(pos.volume),
    profit: unrealizedPnl,
    setup_type: null,
    psychology_notes: pos.comment || null,
    _key: `open|${pos.id || pos.symbol}|${entryTime}`,
  };
}

async function fetchPositions(accountId: string, account: Record<string, any>) {
  for (const { baseUrl } of getClientBases(account)) {
    const res = await fetch(`${baseUrl}/users/current/accounts/${accountId}/positions`, {
      headers: { "auth-token": METAAPI_TOKEN },
    });
    const data = await parseBody(res);
    if (res.ok) return (data as any[]) || [];
    const msg = typeof data === "object" ? (data?.message || "") : String(data);
    if (/not connected|does not match|timeout/i.test(msg)) continue;
    console.warn("positions fetch warning:", msg);
    return [];
  }
  return [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { accountId, userId, days = 90 } = body;

    if (!accountId) {
      return new Response(JSON.stringify({ error: "accountId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Deploy account
    const deployRes = await fetch(`${METAAPI_BASE}/users/current/accounts/${accountId}/deploy`, {
      method: "POST",
      headers: { "auth-token": METAAPI_TOKEN },
    });
    if (!deployRes.ok && deployRes.status !== 204) {
      console.warn("Deploy warning:", await parseBody(deployRes));
    } else {
      await deployRes.text();
    }

    // Wait for connection
    const account = await waitReady(accountId);
    if (account.state !== "DEPLOYED" || account.connectionStatus !== "CONNECTED") {
      return new Response(JSON.stringify({
        imported: 0,
        pending: true,
        message: "החשבון מתחבר לברוקר — נסה שוב בעוד כמה שניות",
        state: account.state,
        connectionStatus: account.connectionStatus,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Fetch closed deals AND open positions in parallel
    const [dealsResult, positions] = await Promise.all([
      fetchDeals(accountId, account, startTime, endTime).catch(() => ({ deals: [] as any[] })),
      fetchPositions(accountId, account).catch(() => [] as any[]),
    ]);

    const deals = dealsResult.deals || [];
    console.log(`Fetched ${deals.length} deals + ${positions.length} open positions`);

    // Map to trade rows
    const closedRows = deals.map(d => dealToTrade(d, userId)).filter(Boolean) as any[];
    const openRows = positions.map(p => positionToTrade(p, userId)).filter(Boolean) as any[];
    const rows = [...closedRows, ...openRows];

    console.log(`Valid rows: ${closedRows.length} closed + ${openRows.length} open`);

    if (rows.length === 0) {
      return new Response(JSON.stringify({
        imported: 0,
        message: "אין עסקאות לייבוא",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Dedup using _key field
    const seen = new Set<string>();
    const deduped = rows.filter(r => {
      if (seen.has(r._key)) return false;
      seen.add(r._key);
      return true;
    });

    // Check existing trades to avoid duplicates
    const { data: existing } = await supabase
      .from("trades")
      .select("entry_time, symbol, lot_size")
      .eq("user_id", userId);

    const existingKeys = new Set(
      (existing || []).map((r: any) => `${r.symbol}|${r.entry_time}|${r.lot_size}`)
    );

    const newRows = deduped
      .filter(r => !existingKeys.has(`${r.symbol}|${r.entry_time}|${r.lot_size}`))
      .map(({ _key, ...rest }) => rest); // remove _key before insert

    console.log(`New rows to insert: ${newRows.length}/${deduped.length}`);

    if (newRows.length === 0) {
      return new Response(JSON.stringify({
        imported: 0,
        message: "כל העסקאות כבר קיימות ביומן",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: inserted, error: insertErr } = await supabase
      .from("trades")
      .insert(newRows)
      .select("id");

    if (insertErr) {
      console.error("Insert error:", JSON.stringify(insertErr));
      return new Response(JSON.stringify({
        error: `שגיאת שמירה: ${insertErr.message}`,
        details: insertErr,
      }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update last_synced_at in broker_accounts
    await supabase
      .from("broker_accounts")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("metaapi_account_id", accountId);

    return new Response(JSON.stringify({
      imported: inserted?.length ?? newRows.length,
      closed: closedRows.length,
      open: openRows.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("metaapi-sync error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
