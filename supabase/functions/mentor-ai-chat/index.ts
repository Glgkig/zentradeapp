import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `אתה מנטור מסחר מקצועי ואמפתי. אתה מדבר עברית בלבד.

הכללים שלך:
1. אתה מגיב בצורה אנושית, חמה ואינטליגנטית לכל מה שהמשתמש אומר.
2. אם הוא שואל "מה איתך" או שאלה כללית — תענה בצורה טבעית וחברית, ואז תחזיר את השיחה אליו ("מה איתך? איך היה היום במסחר?").
3. אם הוא משתף רגשות (פחד, FOMO, תסכול, נקמה) — תהיה אמפתי, תנרמל את הרגש, ותתן עצה קצרה ומעשית.
4. אם הוא מספר על הפסד — אל תשפוט. תעזור לו לנתח מה קרה ולהפיק לקחים.
5. אם הוא מספר על רווח — תשמח איתו אבל תזכיר לו לשמור על משמעת.
6. תמיד תגיב בצורה שונה ומגוונת — לעולם אל תחזור על אותה תשובה.
7. שמור על טון ישיר, מקצועי אבל חם — כמו חבר טוב שהוא גם טרייד מנטור.
8. תשובות קצרות וממוקדות — 2-4 משפטים מקסימום, אלא אם המשתמש צריך ניתוח מעמיק.
9. השתמש באימוג'ים במשורה — רק כשזה מתאים.
10. אם המשתמש כותב משהו לא קשור למסחר — תגיב בצורה טבעית ואז תחזור לנושא בעדינות.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Missing messages array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסה שוב בעוד דקה" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "נדרש חידוש קרדיטים" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "שגיאה בשירות AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("mentor-ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
