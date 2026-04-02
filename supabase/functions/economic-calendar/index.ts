import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Forex Factory free JSON feed
const FF_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";

// Country name → flag emoji map
const countryFlags: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", CAD: "🇨🇦",
  AUD: "🇦🇺", NZD: "🇳🇿", CHF: "🇨🇭", CNY: "🇨🇳",
};

// Hebrew translation for common event titles
const hebrewTitles: Record<string, string> = {
  "Non-Farm Employment Change": "שינוי תעסוקה שלא בחקלאות (NFP)",
  "Unemployment Rate": "שיעור אבטלה",
  "CPI m/m": "מדד מחירים לצרכן (חודשי)",
  "CPI y/y": "מדד מחירים לצרכן (שנתי)",
  "Core CPI m/m": "מדד מחירים ליבה (חודשי)",
  "Core CPI y/y": "מדד מחירים ליבה (שנתי)",
  "Federal Funds Rate": "ריבית הפד",
  "FOMC Statement": "הצהרת ועדת השוק הפתוח (FOMC)",
  "FOMC Press Conference": "מסיבת עיתונאים של הפד",
  "FOMC Meeting Minutes": "פרוטוקול ישיבת הפד",
  "GDP q/q": "תוצר מקומי גולמי (רבעוני)",
  "GDP y/y": "תוצר מקומי גולמי (שנתי)",
  "Advance GDP q/q": "תמ״ג מקדים (רבעוני)",
  "Preliminary GDP q/q": "תמ״ג ראשוני (רבעוני)",
  "Retail Sales m/m": "מכירות קמעונאיות (חודשי)",
  "Core Retail Sales m/m": "מכירות קמעונאיות ליבה (חודשי)",
  "ISM Manufacturing PMI": "מדד PMI ייצור ISM",
  "ISM Services PMI": "מדד PMI שירותים ISM",
  "PPI m/m": "מדד מחירי יצרן (חודשי)",
  "Core PPI m/m": "מדד מחירי יצרן ליבה (חודשי)",
  "Crude Oil Inventories": "מלאי נפט גולמי",
  "Unemployment Claims": "תביעות אבטלה שבועיות",
  "ADP Non-Farm Employment Change": "שינוי תעסוקה ADP",
  "CB Consumer Confidence": "אמון צרכנים CB",
  "Prelim UoM Consumer Sentiment": "סנטימנט צרכנים (מישיגן)",
  "Existing Home Sales": "מכירות בתים קיימים",
  "New Home Sales": "מכירות בתים חדשים",
  "Building Permits": "היתרי בנייה",
  "Durable Goods Orders m/m": "הזמנות מוצרים בני קיימא",
  "Core Durable Goods Orders m/m": "הזמנות מוצרים בני קיימא ליבה",
  "Trade Balance": "מאזן סחר",
  "Current Account": "חשבון שוטף",
  "Industrial Production m/m": "ייצור תעשייתי (חודשי)",
  "Philly Fed Manufacturing Index": "מדד ייצור פילדלפיה",
  "Empire State Manufacturing Index": "מדד ייצור אמפייר סטייט",
  "Flash Manufacturing PMI": "מדד PMI ייצור מקדים",
  "Flash Services PMI": "מדד PMI שירותים מקדים",
  "ECB Press Conference": "מסיבת עיתונאים ECB",
  "Main Refinancing Rate": "ריבית ECB",
  "Monetary Policy Statement": "הצהרת מדיניות מוניטרית",
  "Official Bank Rate": "ריבית בנק אנגליה",
  "BOE Monetary Policy Summary": "סיכום מדיניות BOE",
  "BOJ Policy Rate": "ריבית בנק יפן",
  "BOC Rate Statement": "הצהרת ריבית בנק קנדה",
  "Overnight Rate": "ריבית בנק קנדה",
  "Employment Change": "שינוי תעסוקה",
  "Ivey PMI": "מדד Ivey PMI",
  "RBNZ Rate Statement": "הצהרת ריבית RBNZ",
  "Official Cash Rate": "ריבית רשמית",
  "RBA Rate Statement": "הצהרת ריבית RBA",
  "Cash Rate": "ריבית מזומן",
  "SNB Policy Rate": "ריבית בנק שוויץ",
  "CPI Flash Estimate y/y": "מדד CPI ראשוני (שנתי)",
  "Core CPI Flash Estimate y/y": "מדד CPI ליבה ראשוני (שנתי)",
  "German Prelim CPI m/m": "מדד CPI גרמניה מקדים",
  "French Prelim CPI m/m": "מדד CPI צרפת מקדים",
  "Spanish Flash CPI y/y": "מדד CPI ספרד ראשוני",
};

const categoryMap: Record<string, string> = {
  USD: "ארה״ב", EUR: "אירופה", GBP: "בריטניה", JPY: "יפן",
  CAD: "קנדה", AUD: "אוסטרליה", NZD: "ניו זילנד", CHF: "שוויץ", CNY: "סין",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const res = await fetch(FF_URL);
    if (!res.ok) throw new Error(`FF API returned ${res.status}`);

    const rawEvents = await res.json();

    // Filter: only "High" impact, exclude Israeli events (ILS not in FF anyway)
    const highImpact = rawEvents
      .filter((e: any) => e.impact === "High")
      .map((e: any) => {
        const heTitle = hebrewTitles[e.title] || e.title;
        const flag = countryFlags[e.country] || "🌍";
        const region = categoryMap[e.country] || e.country;

        return {
          title: e.title,
          titleHe: heTitle,
          country: e.country,
          flag,
          region,
          date: e.date,       // ISO date string
          impact: "high",
          forecast: e.forecast || null,
          previous: e.previous || null,
          actual: e.actual || null,
        };
      });

    return new Response(JSON.stringify({ events: highImpact }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("economic-calendar error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
