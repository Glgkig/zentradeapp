import { corsHeaders } from "npm:@supabase/supabase-js/cors";

const MASSIVE_API_KEY = Deno.env.get("MASSIVE_API_KEY") || "";

// Polygon.io-compatible REST API
const SYMBOLS = [
  { ticker: "X:BTCUSD", label: "BTC/USD", type: "crypto" },
  { ticker: "C:EURUSD", label: "EUR/USD", type: "forex" },
  { ticker: "C:GBPUSD", label: "GBP/USD", type: "forex" },
  { ticker: "X:ETHUSD", label: "ETH/USD", type: "crypto" },
  { ticker: "I:SPX", label: "S&P 500", type: "index" },
  { ticker: "I:NDX", label: "NASDAQ 100", type: "index" },
  { ticker: "C:XAUUSD", label: "XAU/USD", type: "commodity" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const results: any[] = [];

    // Try fetching from Polygon.io grouped daily endpoint
    const prevDate = new Date();
    prevDate.setDate(prevDate.getDate() - 1);
    // Skip weekends
    if (prevDate.getDay() === 0) prevDate.setDate(prevDate.getDate() - 2);
    if (prevDate.getDay() === 6) prevDate.setDate(prevDate.getDate() - 1);
    const dateStr = prevDate.toISOString().split("T")[0];

    // Fetch individual snapshots for crypto & forex
    const fetches = SYMBOLS.map(async (sym) => {
      try {
        let url: string;
        if (sym.type === "crypto") {
          // Snapshot for crypto
          url = `https://api.polygon.io/v2/snapshot/locale/global/markets/crypto/tickers/${sym.ticker}?apiKey=${MASSIVE_API_KEY}`;
        } else if (sym.type === "forex") {
          url = `https://api.polygon.io/v2/snapshot/locale/global/markets/forex/tickers/${sym.ticker}?apiKey=${MASSIVE_API_KEY}`;
        } else {
          // For indices, use previous close
          url = `https://api.polygon.io/v2/aggs/ticker/${sym.ticker}/prev?apiKey=${MASSIVE_API_KEY}`;
        }

        const resp = await fetch(url, {
          headers: { "Accept": "application/json" },
          signal: AbortSignal.timeout(5000),
        });

        if (!resp.ok) {
          await resp.text();
          return { symbol: sym.label, price: null, change: null, changePct: null };
        }

        const data = await resp.json();

        if (data.ticker) {
          // Snapshot response
          const t = data.ticker;
          const price = t.lastTrade?.p || t.min?.c || t.day?.c || 0;
          const prevClose = t.prevDay?.c || 0;
          const change = prevClose ? price - prevClose : 0;
          const changePct = prevClose ? ((change / prevClose) * 100) : 0;
          return { symbol: sym.label, price, change, changePct };
        } else if (data.results?.length) {
          // Aggs response
          const r = data.results[0];
          const price = r.c;
          const change = r.c - r.o;
          const changePct = r.o ? ((change / r.o) * 100) : 0;
          return { symbol: sym.label, price, change, changePct };
        }

        return { symbol: sym.label, price: null, change: null, changePct: null };
      } catch {
        return { symbol: sym.label, price: null, change: null, changePct: null };
      }
    });

    const fetchResults = await Promise.all(fetches);

    return new Response(JSON.stringify({ data: fetchResults }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
