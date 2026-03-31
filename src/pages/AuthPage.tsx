import { useState } from "react";
import {
  Shield,
  BookOpen,
  BarChart3,
  ChevronDown,
  Bot,
  Zap,
  Lock,
  CandlestickChart,
  FlaskConical,
  Mic,
  Newspaper,
  ArrowUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  XCircle,
} from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* ============================================= */}
      {/* SECTION 1 — Welcome Home Auth & AI Greeting   */}
      {/* ============================================= */}
      <section id="auth-top" className="relative flex min-h-screen flex-col lg:flex-row">
        {/* Right Side — Auth Form */}
        <div className="flex w-full items-center justify-center px-6 py-16 lg:w-[42%] lg:py-0">
          <div className="w-full max-w-sm">
            <div className="mb-10">
              <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
                ZenTrade
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isLogin ? "התחבר לחשבון שלך" : "צור חשבון חדש"}
              </p>
            </div>

            <div className="rounded-2xl bg-card p-7 shadow-xl shadow-black/20">
              {/* Toggle */}
              <div className="mb-6 flex gap-1 rounded-xl bg-card-foreground/5 p-1">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                    isLogin
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-card-foreground/50 hover:text-card-foreground/70"
                  }`}
                >
                  התחברות
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                    !isLogin
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-card-foreground/50 hover:text-card-foreground/70"
                  }`}
                >
                  הרשמה
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-card-foreground/60">שם מלא</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="הכנס את שמך"
                      className="w-full rounded-lg border border-card-foreground/10 bg-card-foreground/[0.03] px-3.5 py-2.5 text-sm text-card-foreground placeholder:text-card-foreground/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground/60">אימייל</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    dir="ltr"
                    className="w-full rounded-lg border border-card-foreground/10 bg-card-foreground/[0.03] px-3.5 py-2.5 text-sm text-card-foreground text-left placeholder:text-card-foreground/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground/60">סיסמה</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full rounded-lg border border-card-foreground/10 bg-card-foreground/[0.03] px-3.5 py-2.5 text-sm text-card-foreground text-left placeholder:text-card-foreground/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                {isLogin && (
                  <div className="text-left">
                    <button type="button" className="text-xs text-primary hover:underline">שכחת סיסמה?</button>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
                >
                  {isLogin ? "היכנס לבית שלך" : "צור חשבון"}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-card-foreground/10" />
                <span className="text-[11px] text-card-foreground/35">או המשך עם</span>
                <div className="h-px flex-1 bg-card-foreground/10" />
              </div>

              <div className="flex gap-3">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-card-foreground/10 py-2.5 text-sm text-card-foreground/70 transition-all hover:bg-card-foreground/[0.03] hover:border-card-foreground/20">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-card-foreground/10 py-2.5 text-sm text-card-foreground/70 transition-all hover:bg-card-foreground/[0.03] hover:border-card-foreground/20">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Apple
                </button>
              </div>

              <p className="mt-5 text-center text-xs text-card-foreground/40">
                {isLogin ? "אין לך חשבון?" : "כבר יש לך חשבון?"}{" "}
                <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
                  {isLogin ? "הירשם עכשיו" : "התחבר"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Left Side — AI Mentor Greeting */}
        <div className="relative hidden w-[58%] items-center justify-center lg:flex">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/[0.06] via-transparent to-accent/[0.03]" />

          <div className="relative z-10 max-w-lg px-12">
            {/* AI Avatar & Chat Bubble */}
            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">ZenTrade AI</span>
                  <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    פעיל
                  </span>
                </div>
                <div className="rounded-2xl rounded-tr-md bg-secondary border border-border p-4">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    ברוך הבא הביתה. 👋
                    <br />
                    <br />
                    אני מנטור ה-AI שלך. התפקיד שלי הוא לשמור על הכסף שלך ועל השקט הנפשי שלך.
                    <br />
                    <br />
                    <span className="text-muted-foreground">
                      תשאיר את ה-FOMO בחוץ, אנחנו דואגים לך.
                    </span>
                  </p>
                </div>
                <span className="mt-1.5 block text-[10px] text-muted-foreground/50">עכשיו</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-8 flex gap-8">
              <div>
                <p className="font-heading text-2xl font-bold text-foreground">+12K</p>
                <p className="text-xs text-muted-foreground">סוחרים פעילים</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="font-heading text-2xl font-bold text-foreground">94%</p>
                <p className="text-xs text-muted-foreground">שביעות רצון</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="font-heading text-2xl font-bold text-accent">-38%</p>
                <p className="text-xs text-muted-foreground">הפסדים מיותרים</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1 text-muted-foreground/40">
          <span className="text-[10px]">גלול למטה</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 2 — Sneak Peek Dashboard Mockup       */}
      {/* ============================================= */}
      <section className="border-t border-border px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">הצצה למערכת</p>
            <h2 className="font-heading text-3xl font-bold text-foreground lg:text-4xl">
              תראה איך השקט הנפשי שלך נראה מבפנים
            </h2>
          </div>

          {/* Dashboard Mockup */}
          <div className="rounded-2xl border border-border bg-secondary/50 overflow-hidden shadow-2xl shadow-black/20">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-border px-6 py-3">
              <div className="flex items-center gap-3">
                <span className="font-heading text-sm font-bold text-foreground">ZenTrade</span>
                <div className="h-4 w-px bg-border" />
                <span className="text-xs text-muted-foreground">דשבורד ראשי</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-[11px] font-medium text-accent">
                  <CheckCircle2 className="h-3 w-3" />
                  AI Status: Active
                </span>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-12 gap-4 p-6">
              {/* Left Column — P&L & Chart */}
              <div className="col-span-8 space-y-4">
                {/* P&L Cards Row */}
                <div className="grid grid-cols-3 gap-3">
                  <DashboardStat label="רווח יומי" value="+$1,247" trend="+8.3%" positive />
                  <DashboardStat label="עסקאות היום" value="7" trend="3 פתוחות" />
                  <DashboardStat label="Win Rate" value="71%" trend="+5% מאתמול" positive />
                </div>

                {/* Chart Area */}
                <div className="rounded-xl border border-border bg-muted/30 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">Equity Curve — 30 ימים</span>
                    <div className="flex items-center gap-1 text-accent">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold">+12.4%</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-1 h-28">
                    {[30, 35, 28, 42, 38, 45, 40, 52, 48, 55, 50, 58, 53, 60, 56, 65, 62, 68, 64, 72, 70, 75, 73, 78, 76, 82, 80, 85, 83, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-primary/70 transition-all hover:bg-primary"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column — AI & Alerts */}
              <div className="col-span-4 space-y-4">
                {/* AI Stress Meter */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">מד סטרס AI</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-16">
                      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(220 20% 18%)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(160 60% 45%)" strokeWidth="3" strokeDasharray="97.4" strokeDashoffset="29.2" strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-accent">70%</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-accent">רגוע</p>
                      <p className="text-[10px] text-muted-foreground">מצב מנטלי יציב</p>
                    </div>
                  </div>
                </div>

                {/* Drawdown Status */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">Daily Drawdown</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>$312 / $2,000</span>
                      <span>15.6%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-accent" style={{ width: "15.6%" }} />
                    </div>
                  </div>
                  <p className="text-[10px] text-accent">✓ בטווח בטוח</p>
                </div>

                {/* Alert Box */}
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-destructive">Trade Blocked</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Daily Drawdown Limit Reached.
                        <br />
                        Go rest. 🛑
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 3 — Integrations Marquee              */}
      {/* ============================================= */}
      <section className="border-t border-border bg-secondary/20 px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground lg:text-3xl">
              מתחבר ישירות לבורסות המובילות בעולם
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">סנכרון אוטומטי בלחיצת כפתור</p>
          </div>

          {/* Marquee */}
          <div className="overflow-hidden rounded-xl border border-border bg-muted/20 py-6">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...integrations, ...integrations].map((name, i) => (
                <div key={i} className="mx-6 flex items-center gap-2 text-muted-foreground/70">
                  <Zap className="h-4 w-4 text-primary/50" />
                  <span className="text-sm font-medium">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 4 — Ultimate AI Arsenal (Feature Grid)*/}
      {/* ============================================= */}
      <section className="border-t border-border px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">ארסנל ה-AI</p>
            <h2 className="font-heading text-3xl font-bold text-foreground lg:text-4xl">
              כל מה שאתה צריך כדי לנצח את השוק
              <br />
              <span className="text-primary">(ואת עצמך)</span>
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-border bg-secondary/40 p-6 transition-all duration-300 hover:border-primary/20 hover:bg-secondary/70"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.iconBg}`}>
                  {f.icon}
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 5 — Final Emotional Hook & Footer     */}
      {/* ============================================= */}
      <section className="border-t border-border bg-secondary/30 px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="font-heading text-3xl font-bold leading-tight text-foreground lg:text-4xl">
            לסחור לבד זה קשה.
            <br />
            <span className="text-primary">מהיום, יש לך שומר ראש אישי.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            הצטרף לאלפי סוחרים שכבר סוחרים בביטחון עם ZenTrade
          </p>
          <button
            onClick={scrollToTop}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
          >
            <ArrowUp className="h-4 w-4" />
            פתח חשבון חינם עכשיו
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-heading text-sm font-semibold text-foreground">ZenTrade</span>
          <span className="text-xs text-muted-foreground">© 2026 כל הזכויות שמורות</span>
        </div>
      </footer>
    </div>
  );
};

/* ===== Data ===== */

const integrations = ["MetaTrader 5", "TradeLocker", "Binance", "TopstepX", "TradingView", "Rithmic", "NinjaTrader"];

const features = [
  {
    icon: <Zap className="h-5 w-5 text-primary" />,
    iconBg: "bg-primary/10",
    title: "חיבור API ישיר",
    description: "יבוא עסקאות אוטומטי מלא. בלי אקסלים, הכל מסתנכרן בלייב.",
  },
  {
    icon: <Lock className="h-5 w-5 text-destructive" />,
    iconBg: "bg-destructive/10",
    title: "הגנת Prop Firm",
    description: "הגנה קשיחה על חשבונות ממומנים. ה-AI נועל אותך כשאתה מגיע להפסד היומי.",
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-accent" />,
    iconBg: "bg-accent/10",
    title: "Omni-Candle AI Vision",
    description: "ה-AI קורא נרות יפנים ו-Heikin Ashi בזמן אמת ומתריע על מלכודות.",
  },
  {
    icon: <FlaskConical className="h-5 w-5 text-primary" />,
    iconBg: "bg-primary/10",
    title: "AI Backtesting",
    description: "אל תנחש. תריץ את האסטרטגיה שלך על שנים של היסטוריה וה-AI ישפר אותה עבורך.",
  },
  {
    icon: <Mic className="h-5 w-5 text-accent" />,
    iconBg: "bg-accent/10",
    title: "יומן קולי רגשי",
    description: "פשוט תדבר, והמערכת תנתח את רמת הלחץ בקול שלך.",
  },
  {
    icon: <Newspaper className="h-5 w-5 text-primary" />,
    iconBg: "bg-primary/10",
    title: "Economic News Guard",
    description: "יומן כלכלי אקטיבי שמתריע ומונע כניסה לעסקאות לפני הודעות ריבית.",
  },
];

/* ===== Helper Components ===== */

const DashboardStat = ({
  label,
  value,
  trend,
  positive,
}: {
  label: string;
  value: string;
  trend: string;
  positive?: boolean;
}) => (
  <div className="rounded-xl border border-border bg-muted/30 p-3.5">
    <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
    <p className="font-heading text-lg font-bold text-foreground">{value}</p>
    <p className={`text-[10px] mt-0.5 ${positive ? "text-accent" : "text-muted-foreground"}`}>{trend}</p>
  </div>
);

export default AuthPage;
