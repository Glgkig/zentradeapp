import { corsHeaders } from "npm:@supabase/supabase-js/cors";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

const countryFlags: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", CAD: "🇨🇦",
  AUD: "🇦🇺", NZD: "🇳🇿", CHF: "🇨🇭", CNY: "🇨🇳",
};

const regionMap: Record<string, string> = {
  USD: "ארה״ב", EUR: "אירופה", GBP: "בריטניה", JPY: "יפן",
  CAD: "קנדה", AUD: "אוסטרליה", NZD: "ניו זילנד", CHF: "שוויץ", CNY: "סין",
};

const hebrewTitles: Record<string, string> = {
  "Non-Farm Employment Change": "שינוי תעסוקה שלא בחקלאות (NFP)",
  "Unemployment Rate": "שיעור אבטלה",
  "CPI": "מדד מחירים לצרכן",
  "Core CPI": "מדד מחירים ליבה",
  "Federal Funds Rate": "ריבית הפד",
  "FOMC": "ועדת השוק הפתוח",
  "GDP": "תוצר מקומי גולמי",
  "Retail Sales": "מכירות קמעונאיות",
  "ISM Manufacturing PMI": "מדד PMI ייצור ISM",
  "ISM Services PMI": "מדד PMI שירותים ISM",
  "PPI": "מדד מחירי יצרן",
  "Crude Oil Inventories": "מלאי נפט גולמי",
  "Initial Jobless Claims": "תביעות אבטלה שבועיות",
  "ADP Employment Change": "שינוי תעסוקה ADP",
  "Consumer Confidence": "אמון צרכנים",
  "Consumer Sentiment": "סנטימנט צרכנים",
  "Existing Home Sales": "מכירות בתים קיימים",
  "New Home Sales": "מכירות בתים חדשים",
  "Building Permits": "היתרי בנייה",
  "Durable Goods Orders": "הזמנות מוצרים בני קיימא",
  "Trade Balance": "מאזן סחר",
  "Industrial Production": "ייצור תעשייתי",
  "PCE Price Index": "מדד PCE",
  "Core PCE": "מדד PCE ליבה",
  "JOLTS Job Openings": "משרות פתוחות JOLTS",
  "Average Hourly Earnings": "שכר ממוצע לשעה",
  "Interest Rate Decision": "החלטת ריבית",
  "Nonfarm Payrolls": "תעסוקה שלא בחקלאות (NFP)",
  "PMI": "מדד מנהלי רכש",
  "Manufacturing PMI": "מדד PMI ייצור",
  "Services PMI": "מדד PMI שירותים",
  "ECB Interest Rate Decision": "החלטת ריבית ECB",
  "BOE Interest Rate Decision": "החלטת ריבית בנק אנגליה",
  "BOJ Interest Rate Decision": "החלטת ריבית בנק יפן",
};

function translateTitle(title: string): string {
  // Exact match first
  if (hebrewTitles[title]) return hebrewTitles[title];
  // Partial match
  for (const [key, val] of Object.entries(hebrewTitles)) {
    if (title.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return title;
}

function mapImpact(impact: string): string {
  const l = (impact || "").toLowerCase();
  if (l === "high" || l === "3") return "high";
  if (l === "medium" || l === "2") return "medium";
  return "low";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!FMP_API_KEY) throw new Error("FMP_API_KEY not configured");

    // Fetch from today to 30 days ahead
    const today = new Date();
    const from = today.toISOString().split("T")[0];
    const to = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const url = `https://financialmodelingprep.com/api/v3/economic_calendar?from=${from}&to=${to}&apikey=${FMP_API_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });

    if (!res.ok) throw new Error(`FMP API returned ${res.status}`);

    const raw = await res.json();

    if (!Array.isArray(raw)) throw new Error("Unexpected FMP response format");

    const events = raw.map((e: any) => ({
      title: e.event || e.title || "",
      titleHe: translateTitle(e.event || e.title || ""),
      country: e.currency || e.country || "",
      flag: countryFlags[e.currency] || countryFlags[e.country] || "🌍",
      region: regionMap[e.currency] || regionMap[e.country] || e.country || "",
      date: e.date || "",
      impact: mapImpact(e.impact || ""),
      forecast: e.estimate != null ? String(e.estimate) : e.forecast || null,
      previous: e.previous != null ? String(e.previous) : null,
      actual: e.actual != null ? String(e.actual) : null,
      change: e.change != null ? Number(e.change) : null,
    }));

    // Sort chronologically
    events.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return new Response(JSON.stringify({ events, source: "fmp-live" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("fmp-economic-calendar error:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Unknown error", source: "error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
