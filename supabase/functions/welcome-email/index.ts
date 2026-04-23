const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const html = (name: string, email: string) => `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ברוך הבא ל-ZenTrade</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; direction: rtl; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #111111; border: 1px solid #1f1f1f; border-radius: 24px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0d1f1a 0%, #0a1512 50%, #0d1f1a 100%); padding: 48px 40px 40px; text-align: center; position: relative; }
    .logo-ring { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: rgba(0,212,170,0.1); border: 1px solid rgba(0,212,170,0.2); border-radius: 18px; margin-bottom: 20px; }
    .logo-text { font-size: 28px; font-weight: 900; color: #00d4aa; letter-spacing: -1px; }
    .header h1 { font-size: 26px; font-weight: 800; color: #ffffff; margin-bottom: 8px; }
    .header p { color: rgba(255,255,255,0.4); font-size: 14px; line-height: 1.6; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,212,170,0.1); border: 1px solid rgba(0,212,170,0.2); border-radius: 100px; padding: 4px 14px; font-size: 11px; color: #00d4aa; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
    .body p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.8; margin-bottom: 16px; }
    .features { background: #161616; border: 1px solid #1f1f1f; border-radius: 16px; padding: 24px; margin: 24px 0; }
    .features h3 { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 16px; }
    .feature-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .feature-row:last-child { border-bottom: none; padding-bottom: 0; }
    .feature-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(0,212,170,0.08); border: 1px solid rgba(0,212,170,0.12); border-radius: 10px; font-size: 15px; flex-shrink: 0; }
    .feature-text { font-size: 13px; color: rgba(255,255,255,0.65); font-weight: 500; }
    .cta-block { text-align: center; margin: 28px 0; }
    .cta-btn { display: inline-block; background: #00d4aa; color: #000000; font-size: 14px; font-weight: 800; padding: 14px 36px; border-radius: 14px; text-decoration: none; letter-spacing: -0.2px; }
    .divider { height: 1px; background: #1f1f1f; margin: 28px 0; }
    .quote { background: linear-gradient(135deg, rgba(0,212,170,0.06), rgba(0,212,170,0.03)); border-right: 3px solid rgba(0,212,170,0.4); border-radius: 12px; padding: 16px 20px; margin: 24px 0; }
    .quote p { color: rgba(255,255,255,0.5); font-size: 13px; line-height: 1.7; font-style: italic; }
    .footer { padding: 24px 40px; border-top: 1px solid #1a1a1a; text-align: center; }
    .footer p { color: rgba(255,255,255,0.2); font-size: 11px; line-height: 1.8; }
    .footer a { color: rgba(0,212,170,0.5); text-decoration: none; }
    .social-row { display: flex; justify-content: center; gap: 12px; margin-bottom: 16px; }
    .social-btn { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: #1a1a1a; border: 1px solid #252525; border-radius: 10px; font-size: 16px; text-decoration: none; }
    .glow { text-shadow: 0 0 20px rgba(0,212,170,0.4); }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <!-- Header -->
    <div class="header">
      <div class="badge">✦ ברוך הבא למשפחה</div>
      <div class="logo-ring">
        <span class="logo-text">Z</span>
      </div>
      <h1 class="glow">ברוך הבא ל-ZenTrade 🎉</h1>
      <p>הצטרפת לפלטפורמת המסחר החכמה ביותר בשוק</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">היי ${name || "סוחר"} 👋</p>

      <p>
        אנחנו שמחים לקבל אותך למשפחת ZenTrade!
        החלטת לקחת את המסחר שלך לשלב הבא — וזה בדיוק המקום הנכון לעשות את זה.
      </p>

      <p>
        ב-ZenTrade תוכל לעקוב אחרי כל עסקה, לנתח את הדפוסים שלך, לקבל תובנות מבוססות AI,
        ולפתח משמעת מסחר אמיתית. כי בסוף, הכסף האמיתי נמצא בעקביות.
      </p>

      <!-- Features -->
      <div class="features">
        <h3>מה מחכה לך פנימה</h3>
        <div class="feature-row">
          <div class="feature-icon">📓</div>
          <div class="feature-text">יומן מסחר פורנזי — תעד ותנתח כל עסקה</div>
        </div>
        <div class="feature-row">
          <div class="feature-icon">🤖</div>
          <div class="feature-text">מנטור AI — קבל פידבק אישי על כל עסקה</div>
        </div>
        <div class="feature-row">
          <div class="feature-icon">📊</div>
          <div class="feature-text">סטטיסטיקות מתקדמות — הבן מה עובד ומה לא</div>
        </div>
        <div class="feature-row">
          <div class="feature-icon">🛡️</div>
          <div class="feature-text">Kill Switch — הגן על ההון שלך בזמן אמת</div>
        </div>
        <div class="feature-row">
          <div class="feature-icon">📈</div>
          <div class="feature-text">סימולטור Backtesting — בחן אסטרטגיות ללא סיכון</div>
        </div>
      </div>

      <!-- CTA -->
      <div class="cta-block">
        <a href="https://www.zentradeapp.com/dashboard" class="cta-btn">
          כנס ל-ZenTrade עכשיו ←
        </a>
      </div>

      <!-- Inspirational quote -->
      <div class="quote">
        <p>
          "הסוחרים הטובים ביותר בעולם לא מרוויחים יותר — הם מפסידים פחות.
          משמעת, תיעוד, ועקביות הם הנשק הסודי שלהם."
        </p>
      </div>

      <div class="divider"></div>

      <p style="font-size: 13px;">
        יש שאלות? אנחנו כאן בשבילך — תמיד אפשר לפנות אלינו בכל עניין.
        נשמח לשמוע ממך! 💚
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="social-row">
        <a href="https://t.me/zentrade" class="social-btn" title="Telegram">✈️</a>
        <a href="https://instagram.com/zentrade" class="social-btn" title="Instagram">📸</a>
        <a href="https://twitter.com/zentrade" class="social-btn" title="X">𝕏</a>
      </div>
      <p>
        נשלח אל ${email}<br />
        ZenTrade · פלטפורמת יומן המסחר המתקדמת<br />
        <a href="https://www.zentradeapp.com/unsubscribe">הסר מרשימת תפוצה</a> ·
        <a href="https://www.zentradeapp.com/privacy">מדיניות פרטיות</a>
      </p>
    </div>
  </div>

  <p style="text-align: center; color: rgba(255,255,255,0.1); font-size: 10px; margin-top: 20px; font-family: monospace;">
    © ${new Date().getFullYear()} ZenTrade. All rights reserved.
  </p>
</div>
</body>
</html>
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not set — skipping email send");
      return new Response(JSON.stringify({ sent: false, reason: "no api key" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ZenTrade <welcome@zentradeapp.com>",
        to: [email],
        subject: `ברוך הבא ל-ZenTrade${name ? `, ${name}` : ""} 🎉`,
        html: html(name || "", email),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ sent: false, error: data }), {
        status: 200, // don't fail the signup flow
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Welcome email sent to", email, data);
    return new Response(JSON.stringify({ sent: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("welcome-email error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
