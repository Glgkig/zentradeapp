import { corsHeaders } from "npm:@supabase/supabase-js/cors";

const MASSIVE_API_KEY = Deno.env.get("MASSIVE_API_KEY") || "";

// Use "previous close" endpoint which works on free Polygon.io tier
const SYMBOLS = [
  { ticker: "X:BTCUSD", label: "BTC/USD" },
  { ticker: "X:ETHUSD", label: "ETH/USD" },
  { ticker: "C:EURUSD", label: "EUR/USD" },
  { ticker: "C:GBPUSD", label: "GBP/USD" },
  { ticker: "C:XAUUSD", label: "XAU/USD" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const results = await Promise.all(
      SYMBOLS.map(async (sym) => {
        try {
          const url = `https://api.polygon.io/v2/aggs/ticker/${sym.ticker}/prev?adjusted=true&apiKey=${MASSIVE_API_KEY}`;
          const resp = await fetch(url, {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(8000),
          });

          if (!resp.ok) {
            const text = await resp.text();
            console.log(`${sym.ticker} error ${resp.status}: ${text}`);
            return { symbol: sym.label, price: null, change: null, changePct: null };
          }

          const data = await resp.json();
          console.log(`${sym.ticker} response:`, JSON.stringify(data).slice(0, 200));

          if (data.results?.length) {
            const r = data.results[0];
            const price = r.c; // close
            const change = r.c - r.o; // close - open
            const changePct = r.o ? ((change / r.o) * 100) : 0;
            return { symbol: sym.label, price, change, changePct };
          }

          return { symbol: sym.label, price: null, change: null, changePct: null };
        } catch (e: any) {
          console.log(`${sym.ticker} fetch error: ${e.message}`);
          return { symbol: sym.label, price: null, change: null, changePct: null };
        }
      })
    );

    return new Response(JSON.stringify({ data: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
