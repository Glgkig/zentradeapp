import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Forex Factory CDN — only provides current week + next week
const FF_THIS_WEEK = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
const FF_NEXT_WEEK = "https://nfs.faireconomy.media/ff_calendar_nextweek.json";

const countryFlags: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", CAD: "🇨🇦",
  AUD: "🇦🇺", NZD: "🇳🇿", CHF: "🇨🇭", CNY: "🇨🇳",
};

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
  "President Trump Speaks": "נאום נשיא ארה״ב",
  "Fed Chair Powell Speaks": "נאום יו״ר הפד פאוול",
  "Treasury Currency Report": "דו״ח מטבע משרד האוצר",
  "Consumer Credit m/m": "אשראי צרכני (חודשי)",
  "Final GDP q/q": "תמ״ג סופי (רבעוני)",
  "Personal Spending m/m": "הוצאות אישיות (חודשי)",
  "Personal Income m/m": "הכנסה אישית (חודשי)",
  "Core PCE Price Index m/m": "מדד PCE ליבה (חודשי)",
  "PCE Price Index y/y": "מדד PCE (שנתי)",
  "Michigan Consumer Sentiment": "סנטימנט צרכנים מישיגן",
  "JOLTS Job Openings": "משרות פתוחות JOLTS",
  "Average Hourly Earnings m/m": "שכר ממוצע לשעה (חודשי)",
};

const categoryMap: Record<string, string> = {
  USD: "ארה״ב", EUR: "אירופה", GBP: "בריטניה", JPY: "יפן",
  CAD: "קנדה", AUD: "אוסטרליה", NZD: "ניו זילנד", CHF: "שוויץ", CNY: "סין",
};

const impactMap: Record<string, string> = {
  High: "high", Medium: "medium", Low: "low", Holiday: "low",
};

interface RawEvent {
  title: string;
  impact: string;
  country: string;
  date: string;
  forecast?: string | null;
  previous?: string | null;
  actual?: string | null;
}

// Deterministic ID from event key fields
function eventId(e: RawEvent): string {
  const str = `${e.title}|${e.date}|${e.country}`;
  return btoa(new TextEncoder().encode(str).reduce((s, b) => s + String.fromCharCode(b), "")).slice(0, 40);
}

function mapEvents(rawEvents: RawEvent[]) {
  return rawEvents
    .filter((e) => e.impact === "High" || e.impact === "Medium")
    .map((e) => ({
      id: eventId(e),
      title: e.title,
      title_he: hebrewTitles[e.title] || e.title,
      country: e.country,
      flag: countryFlags[e.country] || "🌍",
      region: categoryMap[e.country] || e.country,
      event_date: e.date,
      impact: impactMap[e.impact] || "low",
      forecast: e.forecast || null,
      previous: e.previous || null,
      actual: e.actual || null,
    }));
}

// @ts-ignore — Deno global, not visible to VSCode's Node TS checker
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    // ── 1. Fetch live data from Forex Factory (this week + next week) ──
    const [thisRes, nextRes] = await Promise.all([
      fetch(FF_THIS_WEEK,  { signal: AbortSignal.timeout(8000) }),
      fetch(FF_NEXT_WEEK,  { signal: AbortSignal.timeout(8000) }).catch(() => null),
    ]);

    let rawLive: RawEvent[] = [];
    if (thisRes.ok) rawLive = [...rawLive, ...(await thisRes.json())];
    if (nextRes?.ok) rawLive = [...rawLive, ...(await nextRes.json())];

    const freshEvents = mapEvents(rawLive);

    // ── 2. Upsert fresh events into cache ──────────────────────────────
    if (freshEvents.length > 0) {
      await db.from("economic_events_cache").upsert(
        freshEvents.map((e) => ({ ...e, fetched_at: new Date().toISOString() })),
        { onConflict: "id" },
      );
    }

    // ── 3. Read 30-day window from cache (past 3 days → +30 days) ──────
    const from = new Date();
    from.setDate(from.getDate() - 3);
    const to = new Date();
    to.setDate(to.getDate() + 30);

    const { data: cached, error: dbErr } = await db
      .from("economic_events_cache")
      .select("*")
      .gte("event_date", from.toISOString())
      .lte("event_date", to.toISOString())
      .order("event_date", { ascending: true });

    if (dbErr) throw dbErr;

    // Shape the response to match what the frontend expects
    const events = (cached ?? []).map((r: Record<string, string | null>) => ({
      title:    r.title,
      titleHe:  r.title_he,
      country:  r.country,
      flag:     r.flag,
      region:   r.region,
      date:     r.event_date,
      impact:   r.impact,
      forecast: r.forecast,
      previous: r.previous,
      actual:   r.actual,
    }));

    return new Response(JSON.stringify({ events, source: "cache+live" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("economic-calendar error:", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message || "Unknown error", source: "error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
