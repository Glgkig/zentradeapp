import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_SYSTEM_PROMPT = `אתה ZenMentor — מנטור מסחר אישי בעברית. אתה מדבר רק עברית, תמיד, בכל מצב.

חוקים שאסור לשבור:
1. אף פעם אל תשתמש במספרים, כותרות, bullets, או רשימות. רק פסקאות טבעיות.
2. אל תתחיל תשובה במילים: "כמובן", "בהחלט", "שאלה מצוינת", "אני מבין", "בתור מנטור".
3. תשובה = 3-5 משפטים בלבד. לא יותר.
4. אל תמציא נתונים. אם לא קיבלת סטטיסטיקות — אל תדבר עליהן.
5. תמיד סיים עם שאלה אחת קצרה שמחזירה את הסוחר לחשיבה.

הסגנון שלך:
אתה מדבר כמו חבר טוב שהוא גם סוחר מנוסה. לא פסיכולוג, לא רובוט, לא מרצה. חם, ישיר, אמיתי. אם מישהו שבר חוקים — תגיד לו בעדינות אבל בישירות. אם הצליח — תחגוג איתו.

דוגמה לתשובה טובה:
שאלה: "שברתי את כל החוקים שלי היום"
תשובה: "זה יום שכל סוחר מכיר — הרגע שבו המוח מכבה את המשמעת ומתחיל לפעול על אוטומט. העובדה שאתה שם לב לזה עכשיו היא הצעד הכי חשוב. מה הרגשת לפני שסטית מהתוכנית — לחץ, שעמום, פחד להחמיץ?"

דוגמה נוספת:
שאלה: "הייתה לי עסקה מעולה היום"
תשובה: "יופי של עסקה, ממש. עכשיו השאלה החשובה — האם פעלת לפי התוכנית מראש, או שהיה גורם מזל שם? כי ההבדל בין הצלחה שאפשר לשחזר לבין הצלחה חד פעמית — הוא בדיוק הנקודה הזאת."`;


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Missing messages array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Supabase admin client ──
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // ── Identify user from JWT (optional — works without login too) ──
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await adminClient.auth.getUser(token);
    const userId = user?.id ?? null;

    // ── Fetch last 10 messages from chat_history (only if logged in) ──
    let dbHistory: { role: string; content: string }[] = [];
    if (userId) {
      const { data: historyRows } = await adminClient
        .from("chat_history")
        .select("role, content")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      dbHistory = historyRows ? [...historyRows].reverse() : [];
    }

    // ── Fetch trade stats (only if logged in) ──
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    type TradeRow = { pnl: number | null; entry_time: string };
    let tradeContext = "";

    if (userId) {
      const { data: allClosed } = await adminClient
        .from("trades")
        .select("pnl, entry_time")
        .eq("user_id", userId)
        .eq("status", "closed")
        .order("entry_time", { ascending: false })
        .limit(100);

      if (allClosed && allClosed.length > 0) {
        const rows = allClosed as TradeRow[];
        const totalTrades = rows.length;
        const winners = rows.filter((t) => (t.pnl ?? 0) > 0).length;
        const winRate = totalTrades > 0 ? Math.round((winners / totalTrades) * 100) : 0;

        const todayTrades = rows.filter((t) => t.entry_time >= todayISO);
        const todayPnl = todayTrades.reduce((sum: number, t: TradeRow) => sum + (t.pnl ?? 0), 0);

        let losingStreak = 0;
        for (const t of rows) {
          if ((t.pnl ?? 0) < 0) losingStreak++;
          else break;
        }

        const recent5 = rows.slice(0, 5);
        const recent5Pnl = recent5.reduce((sum: number, t: TradeRow) => sum + (t.pnl ?? 0), 0);

        tradeContext = `\n\n## נתוני מסחר בזמן אמת של המשתמש:
- אחוז ניצחונות כולל: ${winRate}% (${winners}/${totalTrades} עסקאות)
- רווח/הפסד היום: ${todayPnl >= 0 ? "+" : ""}${todayPnl.toFixed(2)}$
- רצף הפסדים נוכחי: ${losingStreak} עסקאות
- ביצועים 5 עסקאות אחרונות: ${recent5Pnl >= 0 ? "+" : ""}${recent5Pnl.toFixed(2)}$
- סה"כ עסקאות ב-DB: ${totalTrades}

השתמש בנתונים האלה כדי לתת תשובה מדויקת ואישית. אל תציין את הנתונים כרשימה — שלב אותם בתשובה בצורה טבעית.`;
      }
    }

    // ── Build system prompt with trade context ──
    const systemPrompt = BASE_SYSTEM_PROMPT + tradeContext;

    // ── Validate & deduplicate messages ──
    // Merge db history + new messages, avoiding double-counting
    const MAX_MESSAGES = 20;
    const incomingMessages: { role: string; content: string }[] = messages
      .slice(-MAX_MESSAGES)
      .filter(
        (m: { role: string; content: string }) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim()
      );

    // Use db history if it has more context, otherwise use what was sent
    const contextMessages =
      dbHistory.length > 0 ? dbHistory.slice(-MAX_MESSAGES) : incomingMessages;

    // Always include the latest user message if not already in context
    const lastIncoming = incomingMessages[incomingMessages.length - 1];
    const hasLastMsg =
      contextMessages.length > 0 &&
      contextMessages[contextMessages.length - 1].role === lastIncoming?.role &&
      contextMessages[contextMessages.length - 1].content === lastIncoming?.content;

    const finalMessages = hasLastMsg ? contextMessages : [...contextMessages, lastIncoming].filter(Boolean);

    if (finalMessages.length === 0) {
      return new Response(JSON.stringify({ error: "No valid messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Save user message to chat_history (only if logged in) ──
    if (userId) {
      const latestUserMsg = [...finalMessages].reverse().find((m) => m.role === "user");
      if (latestUserMsg) {
        await adminClient.from("chat_history").insert({
          user_id: userId,
          role: "user",
          content: latestUserMsg.content,
        });
      }
    }

    // ── Call Groq (OpenAI-compatible endpoint) ──
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const aiResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...finalMessages.map((m: { role: string; content: string }) => ({
              role: m.role,
              content: m.content,
            })),
          ],
          stream: true,
          max_tokens: 1024,
        }),
      }
    );

    if (!aiResponse.ok) {
      const t = await aiResponse.text();
      console.error("Google AI error:", aiResponse.status, t);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסה שוב בעוד דקה" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "שגיאה בשירות AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── TransformStream: intercept OpenAI-format SSE, accumulate, save to DB ──
    let assistantContent = "";
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        for (const line of text.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const jsonStr = trimmed.slice(6);
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) assistantContent += delta;
          } catch { /* ignore */ }
        }
        controller.enqueue(chunk);
      },
      flush() {
        if (userId && assistantContent.trim()) {
          adminClient.from("chat_history").insert({
            user_id: userId,
            role: "assistant",
            content: assistantContent.trim(),
          }).then(() => {}).catch((err: unknown) => console.error("Failed to save assistant message:", err));
        }
      },
    });

    return new Response(aiResponse.body!.pipeThrough(transformStream), {
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
