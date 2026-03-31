import { useState } from "react";
import { Shield, BookOpen, BarChart3, TrendingUp, ChevronDown } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* ===== Hero / Auth Section ===== */}
      <section className="relative flex min-h-screen flex-col lg:flex-row">
        {/* Right Side — Auth Form */}
        <div className="flex w-full items-center justify-center px-6 py-16 lg:w-[42%] lg:py-0">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="mb-10">
              <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
                ZenTrade
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isLogin ? "התחבר לחשבון שלך" : "צור חשבון חדש"}
              </p>
            </div>

            {/* Card */}
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-card-foreground/60">
                      שם מלא
                    </label>
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
                  <label className="mb-1 block text-xs font-medium text-card-foreground/60">
                    אימייל
                  </label>
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
                  <label className="mb-1 block text-xs font-medium text-card-foreground/60">
                    סיסמה
                  </label>
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
                    <button type="button" className="text-xs text-primary hover:underline">
                      שכחת סיסמה?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
                >
                  {isLogin ? "היכנס למערכת" : "צור חשבון"}
                </button>
              </form>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-card-foreground/10" />
                <span className="text-[11px] text-card-foreground/35">או המשך עם</span>
                <div className="h-px flex-1 bg-card-foreground/10" />
              </div>

              {/* Social */}
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

              {/* Footer */}
              <p className="mt-5 text-center text-xs text-card-foreground/40">
                {isLogin ? "אין לך חשבון?" : "כבר יש לך חשבון?"}{" "}
                <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
                  {isLogin ? "הירשם עכשיו" : "התחבר"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Left Side — Brand Hook */}
        <div className="relative hidden w-[58%] items-center justify-center lg:flex">
          {/* Subtle gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/[0.07] via-transparent to-accent/[0.04]" />

          <div className="relative z-10 max-w-lg px-12">
            {/* Shield graphic */}
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>

            <h2 className="font-heading text-4xl font-bold leading-tight text-foreground">
              תסחר חכם יותר,
              <br />
              <span className="text-primary">לא קשה יותר</span>
            </h2>

            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              המערכת ששומרת על המשמעת שלך ומונעת הפסדים מיותרים.
            </p>

            {/* Stats row */}
            <div className="mt-10 flex gap-8">
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

            {/* Mini chart graphic */}
            <div className="mt-10 rounded-xl border border-border bg-secondary/50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">ביצועי חשבון</span>
                <div className="flex items-center gap-1 text-accent">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">+12.4%</span>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-16">
                {[40, 55, 35, 60, 50, 70, 45, 75, 65, 80, 70, 90, 85, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-primary/20 transition-all"
                    style={{ height: `${h}%` }}
                  >
                    <div
                      className="w-full rounded-sm bg-primary"
                      style={{ height: `${Math.min(100, h + 10)}%` }}
                    />
                  </div>
                ))}
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

      {/* ===== Features Section ===== */}
      <section className="border-t border-border bg-secondary/30 px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              למה סוחרים בוחרים ב-ZenTrade?
            </h2>
            <p className="mt-3 text-muted-foreground">
              כלים חכמים שעוזרים לך לסחור בביטחון
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="הגנה מ-FOMO"
              description="חסימת עסקאות בזמן אמת כדי לשמור על החשבון שלך."
              color="primary"
            />
            {/* Card 2 */}
            <FeatureCard
              icon={<BookOpen className="h-6 w-6" />}
              title="יומן מסחר חכם"
              description="תיעוד אוטומטי של העסקאות שלך בלי אקסלים."
              color="accent"
            />
            {/* Card 3 */}
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="בדיקת אסטרטגיות"
              description="תבדוק מה עובד לפני שאתה מסכן כסף."
              color="primary"
            />
          </div>
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

const FeatureCard = ({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "accent";
}) => (
  <div className="group rounded-2xl border border-border bg-secondary/50 p-6 transition-all hover:border-primary/20 hover:bg-secondary/80">
    <div
      className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${
        color === "primary" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
      }`}
    >
      {icon}
    </div>
    <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
  </div>
);

export default AuthPage;
