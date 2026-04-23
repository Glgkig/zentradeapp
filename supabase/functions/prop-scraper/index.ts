import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXTRACT_PROMPT = `אתה מומחה לתנאי שימוש של חברות מימון מסחר (Prop Firms).
קיבלת תוכן מאתר של חברת Prop Firm.

חלץ את המידע הבא ב-JSON בדיוק בפורמט הזה (ענה רק JSON, ללא טקסט נוסף):

{
  "firmName": "שם החברה באנגלית",
  "firmNameHe": "שם החברה בעברית אם קיים, אחרת באנגלית",
  "country": "מדינת החברה + דגל emoji",
  "specialty": "סוגי הנכסים הנסחרים (פורקס, מדדים, קריפטו וכו׳)",
  "summary": "תיאור קצר של החברה בעברית (2-3 משפטים)",
  "tiers": [
    {
      "size": "גודל חשבון (למשל $50K)",
      "sizeRaw": 50000,
      "price": 149,
      "phase1ProfitTarget": 8,
      "phase1DailyLoss": 5,
      "phase1MaxDrawdown": 10,
      "phase1MaxDays": 30,
      "phase1MinDays": 3,
      "phase2ProfitTarget": 5,
      "phase2DailyLoss": 5,
      "phase2MaxDrawdown": 10,
      "hasPhase2": true,
      "profitSplit": 80
    }
  ],
  "rules": {
    "drawdownType": "Static | Trailing | Static EOD",
    "drawdownTypeHe": "סטטי | Trailing (נע) | סטטי סוף יום",
    "newsTrading": {
      "allowed": true,
      "details": "פירוט בעברית — האם מותר לסחור בזמן חדשות בעלות השפעה גבוהה (NFP, CPI, FOMC וכו׳)"
    },
    "overnightHolding": {
      "allowed": true,
      "details": "פירוט בעברית — האם מותר להחזיק פוזיציות מעבר לסגירת השוק"
    },
    "weekendHolding": {
      "allowed": true,
      "details": "פירוט בעברית — האם מותר להחזיק פוזיציות בסוף שבוע"
    },
    "consistencyRule": {
      "exists": false,
      "details": "פירוט בעברית — האם קיים כלל עקביות (למשל: יום רווח מקסימלי לא יעלה על X% מסה״כ הרווח)"
    },
    "eaAllowed": {
      "allowed": true,
      "details": "פירוט בעברית — האם בוטים ו-Expert Advisors מותרים"
    },
    "copyTrading": {
      "allowed": true,
      "details": "פירוט בעברית"
    },
    "martingale": {
      "allowed": false,
      "details": "פירוט בעברית"
    },
    "hft": {
      "allowed": false,
      "details": "פירוט בעברית"
    },
    "minTradingDays": "מספר ימי מסחר מינימום",
    "timeLimitDays": "מגבלת זמן בימים או null אם אין",
    "payoutFrequency": "תדירות משיכת רווחים בעברית",
    "payoutMethods": "שיטות תשלום בעברית",
    "firstPayoutAfter": "מתי ניתן למשוך לראשונה בעברית",
    "scalesUpTo": "גודל חשבון מקסימלי ב-Scaling Plan אם קיים",
    "additionalRules": [
      "כלל נוסף חשוב 1 בעברית",
      "כלל נוסף חשוב 2 בעברית"
    ],
    "hiddenRisks": [
      "סיכון מוסתר 1 שסוחרים לא שמים לב אליו בעברית",
      "סיכון מוסתר 2 בעברית"
    ]
  },
  "psychologyNote": "פסקה קצרה בעברית: למה 90% נכשלים בחברה הזו ואיך ZenTrade עוזר",
  "affiliateUrl": "https://example.com",
  "failRate": 87
}

אם מידע מסוים לא זמין, השתמש בערכי ברירת מחדל סבירים.
חשוב מאוד: כל הטקסט חייב להיות בעברית מקצועית וברורה.
ענה JSON בלבד, ללא markdown, ללא \`\`\`json.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "URL נדרש" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!firecrawlKey || !anthropicKey) {
      return new Response(JSON.stringify({ error: "מפתחות API חסרים" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    /* ── Step 1: Firecrawl — scrape URL → clean Markdown ── */
    const firecrawlRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    if (!firecrawlRes.ok) {
      const err = await firecrawlRes.text();
      console.error("Firecrawl error:", err);
      return new Response(JSON.stringify({ error: "שגיאה בגישה לאתר — ייתכן שהאתר חסום" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firecrawlData = await firecrawlRes.json();
    const markdown: string = firecrawlData?.data?.markdown || firecrawlData?.markdown || "";

    if (!markdown || markdown.length < 100) {
      return new Response(JSON.stringify({ error: "לא הצלחנו לקרוא את האתר — נסה עמוד Terms of Service ספציפי" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Truncate to first 12000 chars (Claude context limit consideration)
    const truncated = markdown.slice(0, 12000);

    /* ── Step 2: Claude — extract + translate to Hebrew ── */
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2500,
        system: EXTRACT_PROMPT,
        messages: [{
          role: "user",
          content: `תוכן האתר:\n\nURL: ${url}\n\n---\n\n${truncated}`,
        }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      console.error("Claude error:", err);
      return new Response(JSON.stringify({ error: "שגיאה בניתוח הנתונים" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const claudeData = await claudeRes.json();
    const rawText: string = claudeData?.content?.[0]?.text || "";

    let extracted: Record<string, unknown>;
    try {
      // Strip any accidental markdown fences
      const clean = rawText.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
      extracted = JSON.parse(clean);
    } catch {
      console.error("JSON parse failed:", rawText.slice(0, 500));
      return new Response(JSON.stringify({ error: "לא הצלחנו לנתח את תוצאות הסריקה — נסה URL ספציפי יותר (כגון /terms או /rules)" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data: extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("prop-scraper error:", err);
    return new Response(JSON.stringify({ error: "שגיאה לא צפויה — נסה שוב" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
