import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, BarChart3, ChevronDown, Bot, Zap, Lock, X, Menu,
  FlaskConical, Mic, Newspaper, ArrowUp, Activity, AlertTriangle,
  CheckCircle2, TrendingUp, Quote,
} from "lucide-react";
import logoMt5 from "@/assets/logos/mt5.png";
import logoBinance from "@/assets/logos/binance.png";
import logoTradeLocker from "@/assets/logos/tradelocker.png";
import logoTradingView from "@/assets/logos/tradingview.png";
import logoRithmic from "@/assets/logos/rithmic.png";
import logoIbkr from "@/assets/logos/ibkr.png";
import logoTopstep from "@/assets/logos/topstep.png";
import logoForex from "@/assets/logos/forexcom.png";
import logoNinjaTrader from "@/assets/logos/ninjatrader.png";

/* ===== Main Page ===== */
const AuthPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const openModal = () => {
    setShowModal(true);
    setMobileMenu(false);
  };
  const closeModal = () => setShowModal(false);

  return (
    <div className="min-h-screen" dir="rtl">
      {/* ===== Sticky Navbar ===== */}
      <nav className="fixed top-0 right-0 left-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <span className="font-heading text-lg font-bold text-foreground">ZenTrade</span>
          
          {/* Desktop CTA */}
          <button
            onClick={openModal}
            className="hidden md:inline-flex rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
          >
            התחברות / הרשמה
          </button>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden relative flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 transition-all hover:bg-primary/20 active:scale-95"
          >
            {mobileMenu ? (
              <X className="h-4 w-4 text-primary" />
            ) : (
              <div className="flex flex-col items-center gap-[3px]">
                <span className="block h-[2px] w-4 rounded-full bg-primary transition-all" />
                <span className="block h-[2px] w-3 rounded-full bg-primary/60 transition-all" />
                <span className="block h-[2px] w-4 rounded-full bg-primary transition-all" />
              </div>
            )}
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent animate-pulse" />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenu && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-4 animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={openModal}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              התחברות / הרשמה
            </button>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>תמיכה</span>
              <span>מדיניות פרטיות</span>
              <span>תנאי שימוש</span>
            </div>
          </div>
        )}
      </nav>

      {/* ================================================ */}
      {/* S1 — Full-Width Hero                              */}
      {/* ================================================ */}
      <section className="relative flex min-h-screen flex-col lg:flex-row items-center pt-16">
        {/* Right — Typography & CTA */}
        <div className="flex w-full flex-col items-center justify-center px-4 py-12 md:px-6 md:py-20 lg:w-1/2 lg:items-start lg:px-16 lg:py-0">
          <div className="max-w-lg text-center lg:text-right">
            <div className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 md:px-4 md:py-1.5">
              <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              <span className="text-[10px] md:text-xs font-medium text-primary">AI Trading Bodyguard</span>
            </div>
            <h1 className="font-heading text-3xl font-extrabold leading-tight text-foreground md:text-4xl lg:text-5xl">
              שומר הראש
              <br />
              <span className="text-primary">הדיגיטלי שלך</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:mt-5 md:text-base lg:text-lg">
              המערכת ששומרת על המשמעת שלך, מונעת הפסדים מיותרים, ונותנת לך לסחור עם שקט נפשי מלא.
            </p>

            <button
              onClick={openModal}
              className="mt-6 md:mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/35 active:scale-[0.97]"
            >
              <Shield className="h-4 w-4 md:h-5 md:w-5" />
              התחל לסחור עם שומר ראש
            </button>
            <p className="mt-2 md:mt-3 text-[10px] md:text-xs text-muted-foreground/50">ללא כרטיס אשראי • הגדרה תוך 2 דקות</p>

            {/* Trust stats */}
            <div className="mt-8 md:mt-10 grid grid-cols-3 gap-2 md:gap-4">
              {[
                { value: "+12K", label: "סוחרים פעילים" },
                { value: "94%", label: "שביעות רצון" },
                { value: "-38%", label: "הפסדים מיותרים", accent: true },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-secondary/50 p-2 md:p-3 text-center">
                  <p className={`font-heading text-base md:text-xl font-bold ${s.accent ? "text-accent" : "text-foreground"}`}>{s.value}</p>
                  <p className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Left — AI Chat Bubble */}
        <div className="relative hidden w-1/2 items-center justify-center lg:flex">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/[0.06] via-transparent to-accent/[0.03]" />
          <div className="relative z-10 max-w-md px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-foreground">ZenTrade AI</span>
                  <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    פעיל
                  </span>
                </div>
                <div className="rounded-2xl rounded-tr-md bg-secondary border border-border p-5">
                  <p className="text-xs font-medium text-primary mb-2">נעים מאוד. אני מנטור ה-AI שלך.</p>
                  <p className="text-sm leading-[1.8] text-foreground/90">
                    ברוך הבא הביתה. תנשום. 🫁
                    <br /><br />
                    התפקיד שלי הוא לשמור עליך, על הכסף שלך ועל השקט הנפשי שלך.
                    <br /><br />
                    <span className="text-muted-foreground">
                      תשאיר את ה-FOMO והלחץ בחוץ, מהרגע שאתה פה — אנחנו דואגים לך.
                    </span>
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-1 px-2">
                  <TypingDots />
                  <span className="text-[10px] text-muted-foreground/40 mr-2">מקליד...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1 text-muted-foreground/40">
          <span className="text-[10px]">גלול למטה</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </section>

      {/* ================================================ */}
      {/* S2 — Sneak Peek Dashboard                        */}
      {/* ================================================ */}
      <section className="border-t border-border px-4 py-14 md:px-6 md:py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 text-center">
            <p className="mb-2 text-[10px] md:text-xs font-semibold uppercase tracking-widest text-primary">הצצה למערכת</p>
            <h2 className="font-heading text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
              תראה איך הביטחון הכלכלי שלך נראה מבפנים
            </h2>
            <p className="mt-2 md:mt-3 max-w-2xl mx-auto text-xs md:text-sm text-muted-foreground leading-relaxed">
              האפליקציה תוכננה על ידי סוחרים עבור סוחרים — כדי לספק חוויה לוגית, מהירה ומקצועית.
            </p>
          </div>

          <div className="mt-8 md:mt-12 rounded-2xl border border-border bg-secondary/40 overflow-hidden shadow-2xl shadow-black/30">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between border-b border-border px-3 py-2 md:px-5 md:py-3 bg-muted/20">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="font-heading text-xs md:text-sm font-bold text-foreground">ZenTrade</span>
                <div className="h-4 w-px bg-border hidden md:block" />
                <span className="text-[10px] md:text-xs text-muted-foreground hidden md:inline">דשבורד ראשי</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <span className="flex items-center gap-1 md:gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-2 py-0.5 md:px-3 md:py-1 text-[9px] md:text-[11px] font-medium text-accent">
                  <CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  <span className="hidden sm:inline">AI Status:</span> Active
                </span>
                <div className="flex items-center gap-1 md:gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 md:px-3 md:py-1">
                  <Shield className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary" />
                  <span className="text-[9px] md:text-[11px] font-medium text-primary"><span className="hidden sm:inline">Risk Shield:</span> ON</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 p-3 md:p-5">
              <div className="lg:col-span-8 space-y-3 md:space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  <DashStat label="רווח יומי" value="+$1,247" sub="+8.3%" positive />
                  <DashStat label="עסקאות היום" value="7" sub="3 פתוחות" />
                  <DashStat label="Win Rate" value="71%" sub="+5%" positive />
                  <DashStat label="Profit Factor" value="2.4" sub="מצוין" positive />
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-3 md:p-5">
                  <div className="mb-3 md:mb-4 flex items-center justify-between">
                    <span className="text-[10px] md:text-xs font-medium text-foreground">Equity Curve — 30 ימים</span>
                    <div className="flex items-center gap-1 text-accent">
                      <TrendingUp className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      <span className="text-[10px] md:text-xs font-semibold">+12.4%</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-[2px] md:gap-[3px] h-24 md:h-32">
                    {equityCurve.map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-primary/60 hover:bg-primary transition-colors" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-3 md:p-4">
                  <p className="text-[10px] md:text-xs font-medium text-foreground mb-2 md:mb-3">עסקאות אחרונות</p>
                  <div className="space-y-1.5 md:space-y-2">
                    {recentTrades.map((t, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 px-2.5 py-1.5 md:px-3 md:py-2 text-[10px] md:text-xs">
                        <span className="font-medium text-foreground">{t.pair}</span>
                        <span className={`font-semibold ${t.pnl > 0 ? "text-accent" : "text-destructive"}`}>
                          {t.pnl > 0 ? "+" : ""}{t.pnl}$
                        </span>
                        <span className="text-muted-foreground">{t.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-3 md:space-y-4">
                <div className="rounded-xl border border-border bg-muted/20 p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-2 md:mb-3">
                    <Activity className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    <span className="text-[10px] md:text-xs font-medium text-foreground">מד סטרס AI</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <StressMeter value={70} />
                    <div>
                      <p className="text-[10px] md:text-xs font-medium text-accent">רגוע</p>
                      <p className="text-[9px] md:text-[10px] text-muted-foreground">מצב מנטלי יציב</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-2 md:mb-3">
                    <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    <span className="text-[10px] md:text-xs font-medium text-foreground">Daily Drawdown</span>
                  </div>
                  <div className="mb-2 flex justify-between text-[9px] md:text-[10px] text-muted-foreground">
                    <span>$312 / $2,000</span>
                    <span>15.6%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-accent transition-all" style={{ width: "15.6%" }} />
                  </div>
                  <p className="text-[9px] md:text-[10px] text-accent mt-2">✓ בטווח בטוח</p>
                </div>

                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 md:p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] md:text-xs font-semibold text-destructive">Trade Blocked</p>
                      <p className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">Daily Drawdown Limit Reached.<br />Go rest. 🛑</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 md:p-4">
                  <div className="flex items-start gap-2">
                    <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] md:text-xs font-semibold text-primary">המלצת AI</p>
                      <p className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">ביצעת 3 עסקאות מוצלחות. מומלץ לעצור כאן ולנצל את היום הטוב. 🎯</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* S3 — Fading Carousel Integrations                */}
      {/* ================================================ */}
      <section className="border-t border-border bg-secondary/20 px-4 py-12 md:px-6 md:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-heading text-xl font-bold text-foreground md:text-2xl lg:text-3xl">
            מתחבר בלייב לבורסות המובילות
          </h2>
          <p className="mt-2 text-xs md:text-sm text-muted-foreground">חיבור API ישיר ואוטומטי לכל פלטפורמת מסחר</p>
          <FadingCarousel />
        </div>
      </section>

      {/* ================================================ */}
      {/* S4 — Founder's Story + Mid-Page CTA              */}
      {/* ================================================ */}
      <section className="border-t border-border px-4 py-14 md:px-6 md:py-20 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 md:mb-12 text-center">
            <p className="mb-2 text-[10px] md:text-xs font-semibold uppercase tracking-widest text-primary">השליחות שלנו</p>
            <h2 className="font-heading text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
              למה בניתי את ZenTrade: השליחות שלי לעזור לך
            </h2>
          </div>

          <div className="w-full">
            <div className="rounded-2xl border border-border bg-secondary/30 p-5 md:p-8">
              <Quote className="h-6 w-6 md:h-8 md:w-8 text-primary/30 mb-3 md:mb-4" />
              <p className="text-xs md:text-sm leading-[1.9] md:leading-[2] text-foreground/85">
                קוראים לי יהונתן, ואני המייסד של ZenTrade. במשך 5 השנים האחרונות הייתי עמוק בתוך השוחות של המסחר היומי. עברתי הכל – את הלילות הלבנים, את ההפסדים הכואבים של עסקאות נקמה, ואת התסכול המטורף של לדעת שיש לי אסטרטגיה מנצחת, אבל הפסיכולוגיה (הפומו והלחץ) פשוט שורפת לי את החשבון פעם אחר פעם.
              </p>
              <p className="mt-3 md:mt-4 text-xs md:text-sm leading-[1.9] md:leading-[2] text-foreground/85">
                הבנתי שסוחרים לא צריכים עוד אינדיקטור או עוד קורס, הם צריכים הגנה מעצמם. בניתי את ZenTrade מתוך כאב אישי עמוק ומתוך שליחות אמיתית: לתת לך את &#39;שומר הראש&#39; הטכנולוגי שאני כל כך הייתי צריך שיהיה לי.
              </p>
              <p className="mt-3 md:mt-4 text-xs md:text-sm leading-[1.9] md:leading-[2] text-foreground/85">
                אני לא פה כדי למכור לך אשליות של התעשרות מהירה. אני פה כדי לדאוג שאתה תפסיק להפסיד בגלל טעויות אנוש, תגן על ההון שלך, ותתחיל לסחור עם שקט נפשי של מכונה.
              </p>
              <p className="mt-3 md:mt-4 text-xs md:text-sm leading-[1.9] md:leading-[2] text-primary font-medium">
                זה הבית של הסוחרים הממושמעים.
              </p>
              <div className="mt-5 md:mt-6 pt-5 md:pt-6 border-t border-border flex items-center gap-3">
                <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs md:text-sm font-bold text-primary">י.</span>
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold text-foreground">יהונתן</p>
                  <p className="text-[10px] md:text-[11px] text-muted-foreground">מייסד ZenTrade • סוחר יומי מ-2021</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mid-Page CTA */}
          <div className="mt-10 md:mt-14 text-center">
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 md:px-8 md:py-3.5 text-xs md:text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.97]"
            >
              התחברות / הרשמה
            </button>
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* S5 — Bento Box Feature Arsenal                   */}
      {/* ================================================ */}
      <section className="border-t border-border bg-secondary/20 px-4 py-14 md:px-6 md:py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 md:mb-14 text-center">
            <p className="mb-2 text-[10px] md:text-xs font-semibold uppercase tracking-widest text-primary">ארסנל ה-AI</p>
            <h2 className="font-heading text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
              כל הכלים כדי לנצח את השוק <span className="text-primary">(ואת עצמך)</span>
            </h2>
          </div>

          <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <BentoCard className="md:col-span-2 lg:col-span-2" icon={<Zap className="h-5 w-5" />} iconColor="primary" title="חיבור API ישיר">
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">יבוא אוטומטי מלא. שכח מאקסלים. הכל מסתנכרן בלייב עם הברוקר שלך.</p>
              <div className="rounded-xl border border-border bg-muted/20 p-2.5 md:p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] md:text-[10px] text-muted-foreground">סנכרון חי</span>
                  <span className="text-[9px] md:text-[10px] text-accent flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3" /> מחובר</span>
                </div>
                <div className="space-y-1.5">
                  {["MT5 — EURUSD Buy +$342", "Binance — BTCUSDT Sell +$89", "TradeLocker — NQ Sell -$55"].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md bg-secondary/50 px-2 py-1 md:px-2.5 md:py-1.5 text-[9px] md:text-[10px] text-foreground/70">
                      <Zap className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary/50" />{t}
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>

            <BentoCard icon={<Lock className="h-5 w-5" />} iconColor="destructive" title="הגנת Prop Firm">
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">הגנה קשיחה על חשבונות ממומנים. ה-AI נועל אותך כשאתה מתקרב להפסד היומי המקסימלי.</p>
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-center">
                <Lock className="h-7 w-7 md:h-8 md:w-8 text-destructive mx-auto mb-1" />
                <p className="text-[10px] md:text-xs font-semibold text-destructive">חשבון נעול</p>
                <p className="text-[9px] md:text-[10px] text-muted-foreground">Max Daily Loss: $2,000 reached</p>
              </div>
            </BentoCard>

            <BentoCard icon={<BarChart3 className="h-5 w-5" />} iconColor="accent" title="Omni-Candle AI Vision">
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">ה-AI מנתח נרות יפנים ו-Heikin Ashi בלייב כדי לזהות מלכודות ותבניות פריצה.</p>
              <div className="rounded-xl border border-border bg-muted/20 p-2.5 md:p-3">
                <div className="flex items-end gap-[2px] h-14 md:h-16 mb-2">
                  {candleMockup.map((c, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className={`w-full rounded-sm ${c.bull ? "bg-accent/70" : "bg-destructive/70"}`} style={{ height: `${c.h}%` }} />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-accent">
                  <CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  <span>AI: תבנית פריצה מזוהה ב-EURUSD</span>
                </div>
              </div>
            </BentoCard>

            <BentoCard icon={<FlaskConical className="h-5 w-5" />} iconColor="primary" title="AI Backtesting">
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">תריץ את האסטרטגיה שלך על שנים של דאטה. ה-AI ינתח ויציע שיפורים.</p>
              <div className="rounded-xl border border-border bg-muted/20 p-2.5 md:p-3">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <MiniStat label="Profit Factor" value="2.8" />
                  <MiniStat label="Max Drawdown" value="4.2%" />
                  <MiniStat label="Total Trades" value="1,247" />
                  <MiniStat label="Win Rate" value="68%" />
                </div>
              </div>
            </BentoCard>

            <BentoCard icon={<Mic className="h-5 w-5" />} iconColor="accent" title="יומן קולי רגשי">
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">פשוט תדבר. ה-AI מנתח את רמת הלחץ בקול שלך.</p>
              <div className="rounded-xl border border-border bg-muted/20 p-2.5 md:p-3">
                <div className="flex items-center gap-1 h-8 md:h-10">
                  {waveform.map((h, i) => (
                    <div key={i} className="flex-1 rounded-full bg-accent/50" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <p className="text-[9px] md:text-[10px] text-muted-foreground mt-2 text-center">🎙️ ניתוח קולי: רמת סטרס נמוכה (32%)</p>
              </div>
            </BentoCard>

            <BentoCard icon={<Newspaper className="h-5 w-5" />} iconColor="primary" title="Economic News Guard">
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">יומן כלכלי חכם שמונע כניסה לעסקאות לפני הודעות CPI/FOMC.</p>
              <div className="rounded-xl border border-border bg-muted/20 p-2.5 md:p-3 space-y-1.5">
                {newsEvents.map((ev, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-md px-2 py-1 md:px-2.5 md:py-1.5 text-[9px] md:text-[10px] ${ev.critical ? "bg-destructive/10 border border-destructive/20" : "bg-muted/30"}`}>
                    <span className="text-foreground/70">{ev.name}</span>
                    <span className={ev.critical ? "text-destructive font-semibold" : "text-muted-foreground"}>{ev.time}</span>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* S6 — Final Hook & Footer CTA                     */}
      {/* ================================================ */}
      <section className="border-t border-border px-4 py-16 md:px-6 md:py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 md:mb-8 flex justify-center">
            <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl md:rounded-3xl bg-primary/10 border border-primary/20">
              <Shield className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            </div>
          </div>
          <h2 className="font-heading text-2xl font-bold leading-tight text-foreground md:text-3xl lg:text-4xl">
            לסחור לבד זה קשה ומסוכן.
          </h2>
          <h2 className="font-heading text-2xl font-bold leading-tight text-primary md:text-3xl lg:text-4xl mt-2">
            מהיום, יש לך מנטור ששומר עליך בכל שעה.
          </h2>
          <p className="mt-4 md:mt-5 text-xs md:text-base text-muted-foreground leading-relaxed">
            הצטרף לאלפי סוחרים שכבר סוחרים בביטחון, במשמעת ובשקט נפשי מלא.
          </p>
          <button
            onClick={openModal}
            className="mt-8 md:mt-10 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 md:px-10 md:py-4 text-sm md:text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]"
          >
            <ArrowUp className="h-4 w-4 md:h-5 md:w-5" />
            פתח חשבון מוגן עכשיו
          </button>
          <p className="mt-3 md:mt-4 text-[10px] md:text-xs text-muted-foreground/50">ללא כרטיס אשראי • הגדרה תוך 2 דקות</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 md:flex-row md:gap-4">
          <span className="font-heading text-sm font-semibold text-foreground">ZenTrade</span>
          <div className="flex items-center gap-4 md:gap-6 text-[10px] md:text-xs text-muted-foreground">
            <span>תנאי שימוש</span>
            <span>מדיניות פרטיות</span>
            <span>תמיכה</span>
          </div>
          <span className="text-[10px] md:text-xs text-muted-foreground">© 2026 ZenTrade. כל הזכויות שמורות.</span>
        </div>
      </footer>

      {/* ================================================ */}
      {/* AUTH MODAL                                        */}
      {/* ================================================ */}
      {showModal && <AuthModal onClose={closeModal} />}
    </div>
  );
};

/* ===== Auth Modal ===== */
const AuthModal = ({ onClose }: { onClose: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-[95%] max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-300">
        <div className="rounded-2xl border border-primary/20 bg-secondary/95 backdrop-blur-xl p-5 md:p-7 shadow-2xl shadow-primary/10">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 md:top-4 md:left-4 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-5 md:mb-6">
            <h2 className="font-heading text-lg md:text-xl font-bold text-foreground">ZenTrade</h2>
            <p className="mt-1 text-[10px] md:text-xs text-muted-foreground">
              {isLogin ? "התחבר לחשבון שלך" : "צור חשבון חדש"}
            </p>
          </div>

          {/* Toggle */}
          <div className="mb-5 md:mb-6 flex gap-1 rounded-xl bg-muted p-1">
            {["התחברות", "הרשמה"].map((label, idx) => {
              const active = idx === 0 ? isLogin : !isLogin;
              return (
                <button
                  key={label}
                  onClick={() => setIsLogin(idx === 0)}
                  className={`flex-1 rounded-lg py-2 text-xs md:text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Social SSO First */}
          <div className="space-y-2 md:space-y-2.5 mb-4 md:mb-5">
            <button className="flex w-full items-center justify-center gap-2 md:gap-3 rounded-xl border border-border bg-muted/30 py-2.5 md:py-3 text-xs md:text-sm font-medium text-foreground transition-all hover:bg-muted/60 hover:border-border/80">
              <GoogleIcon />
              המשך עם Google
            </button>
            <button className="flex w-full items-center justify-center gap-2 md:gap-3 rounded-xl border border-border bg-muted/30 py-2.5 md:py-3 text-xs md:text-sm font-medium text-foreground transition-all hover:bg-muted/60 hover:border-border/80">
              <AppleIcon />
              המשך עם Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4 md:mb-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] md:text-[11px] text-muted-foreground">או עם אימייל</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div>
                <label className="mb-1 block text-[10px] md:text-xs font-medium text-muted-foreground">שם מלא</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="הכנס את שמך"
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs md:text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-[10px] md:text-xs font-medium text-muted-foreground">אימייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                dir="ltr"
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs md:text-sm text-foreground text-left placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] md:text-xs font-medium text-muted-foreground">סיסמה</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs md:text-sm text-foreground text-left placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {isLogin && (
              <div className="text-left">
                <button type="button" className="text-[10px] md:text-xs text-primary hover:underline">שכחת סיסמה?</button>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-2.5 md:py-3 text-xs md:text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.98]"
            >
              {isLogin ? "היכנס לבית שלך" : "צור חשבון"}
            </button>
          </form>

          <p className="mt-4 md:mt-5 text-center text-[10px] md:text-xs text-muted-foreground/60">
            {isLogin ? "אין לך חשבון?" : "כבר יש לך חשבון?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
              {isLogin ? "הירשם עכשיו" : "התחבר"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

/* ===== Sub-Components ===== */

const GoogleIcon = () => (
  <svg className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const TypingDots = () => (
  <div className="flex items-center gap-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40"
        style={{ animation: `typing-dot 1.4s ease-in-out ${i * 0.2}s infinite` }}
      />
    ))}
    <style>{`
      @keyframes typing-dot {
        0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
        30% { opacity: 1; transform: translateY(-3px); }
      }
    `}</style>
  </div>
);

const StressMeter = ({ value }: { value: number }) => {
  const circumference = 97.4;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative h-14 w-14 md:h-16 md:w-16">
      <svg className="h-14 w-14 md:h-16 md:w-16 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(220 20% 18%)" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(160 60% 45%)" strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs md:text-sm font-bold text-accent">{value}%</span>
    </div>
  );
};

const DashStat = ({ label, value, sub, positive }: { label: string; value: string; sub: string; positive?: boolean }) => (
  <div className="rounded-xl border border-border bg-muted/20 p-2 md:p-3">
    <p className="text-[9px] md:text-[10px] text-muted-foreground mb-0.5 md:mb-1">{label}</p>
    <p className="font-heading text-sm md:text-lg font-bold text-foreground">{value}</p>
    <p className={`text-[9px] md:text-[10px] mt-0.5 ${positive ? "text-accent" : "text-muted-foreground"}`}>{sub}</p>
  </div>
);

const BentoCard = ({ children, icon, iconColor, title, className = "" }: {
  children: React.ReactNode;
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  className?: string;
}) => (
  <div className={`group rounded-2xl border border-border bg-secondary/40 p-4 md:p-6 transition-all duration-300 hover:border-primary/20 hover:bg-secondary/60 ${className}`}>
    <div className={`mb-2 md:mb-3 flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-${iconColor}/10 text-${iconColor}`}>
      {icon}
    </div>
    <h3 className="font-heading text-sm md:text-base font-semibold text-foreground mb-1.5 md:mb-2">{title}</h3>
    {children}
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-secondary/50 p-1.5 md:p-2">
    <p className="text-[8px] md:text-[9px] text-muted-foreground">{label}</p>
    <p className="text-xs md:text-sm font-bold text-foreground">{value}</p>
  </div>
);

const FadingCarousel = () => {
  const exchanges = [
    { name: "MetaTrader 5", logo: logoMt5 },
    { name: "Binance", logo: logoBinance },
    { name: "TradeLocker", logo: logoTradeLocker },
    { name: "TradingView", logo: logoTradingView },
    { name: "Rithmic", logo: logoRithmic },
    { name: "Interactive Brokers", logo: logoIbkr },
    { name: "TopstepX", logo: logoTopstep },
    { name: "Forex.com", logo: logoForex },
    { name: "NinjaTrader", logo: logoNinjaTrader },
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % exchanges.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 md:mt-10">
      <div className="relative h-24 md:h-28 flex items-center justify-center">
        {exchanges.map((ex, i) => (
          <div
            key={ex.name}
            className={`absolute flex items-center gap-3 md:gap-4 transition-all duration-700 ${
              i === activeIndex ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-xl md:rounded-2xl bg-card border border-border p-1.5 md:p-2 shadow-md">
              <img src={ex.logo} alt={ex.name} className="h-8 w-8 md:h-10 md:w-10 object-contain" loading="lazy" width={512} height={512} />
            </div>
            <span className="font-heading text-lg md:text-2xl font-bold text-foreground">{ex.name}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-3 md:mt-4">
        {exchanges.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-5 md:w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/* ===== Static Data ===== */

const equityCurve = [25, 30, 28, 35, 32, 40, 38, 45, 42, 48, 46, 52, 50, 55, 53, 58, 56, 62, 60, 65, 63, 68, 66, 72, 70, 75, 73, 78, 80, 85];

const recentTrades = [
  { pair: "EUR/USD", pnl: 342, time: "10:32" },
  { pair: "BTC/USDT", pnl: -89, time: "11:15" },
  { pair: "NQ", pnl: 567, time: "14:02" },
  { pair: "GBP/JPY", pnl: 128, time: "15:45" },
];

const candleMockup = [
  { h: 45, bull: true }, { h: 60, bull: true }, { h: 35, bull: false },
  { h: 70, bull: true }, { h: 40, bull: false }, { h: 55, bull: true },
  { h: 80, bull: true }, { h: 30, bull: false }, { h: 65, bull: true },
  { h: 75, bull: true }, { h: 50, bull: false }, { h: 85, bull: true },
  { h: 45, bull: false }, { h: 90, bull: true }, { h: 60, bull: true },
];

const waveform = [20, 45, 30, 60, 25, 70, 35, 55, 40, 80, 30, 65, 45, 50, 35, 75, 25, 60, 40, 55, 30, 70, 50, 45, 35, 65, 40, 55, 30, 80];

const newsEvents = [
  { name: "🔴 CPI — US", time: "15:30", critical: true },
  { name: "🟡 FOMC Minutes", time: "21:00", critical: true },
  { name: "🟢 GDP — EU", time: "12:00", critical: false },
  { name: "🟢 Retail Sales", time: "09:30", critical: false },
];

export default AuthPage;
