/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import {
  Sparkles, ChevronLeft, Check,
  Crosshair, Wallet, Brain,
  User, Clock, ShieldAlert, TrendingUp, BarChart3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";

/* ─── Step definitions ─────────────────────────────────────────────── */
type StepType = "text" | "single" | "multi";

interface StepDef {
  id: string;
  icon: React.ElementType;
  color: string;        // tailwind color token for accent
  title: string;
  subtitle: string;
  type: StepType;
  options?: { value: string; label: string; desc?: string; emoji: string }[];
  placeholder?: string;
}

const STEPS: StepDef[] = [
  {
    id: "name", icon: User, color: "primary",
    type: "text",
    title: "מה שמך המלא?",
    subtitle: "נשתמש בשמך כדי לדבר איתך בצורה אישית",
    placeholder: "ישראל ישראלי",
  },
  {
    id: "tradingMethods", icon: Crosshair, color: "primary",
    type: "multi",
    title: "באיזה שיטות מסחר אתה משתמש?",
    subtitle: "ניתן לסמן יותר מאחד",
    options: [
      { value: "smc",           label: "SMC",            desc: "Smart Money — Liquidity, BOS, CHoCH",  emoji: "🏦" },
      { value: "ict",           label: "ICT",            desc: "FVG, Order Blocks, Kill Zones",        emoji: "🎯" },
      { value: "price-action",  label: "Price Action",   desc: "נרות, תבניות, S&R",                   emoji: "📊" },
      { value: "supply-demand", label: "Supply & Demand",desc: "אזורי היצע וביקוש",                   emoji: "⚖️" },
      { value: "indicators",    label: "אינדיקטורים",    desc: "RSI, MACD, Bollinger, EMA",           emoji: "📈" },
      { value: "wyckoff",       label: "Wyckoff",        desc: "Accumulation, Distribution",          emoji: "🔬" },
      { value: "elliott",       label: "Elliott Wave",   desc: "גלי אליוט, Fibonacci",                emoji: "🌊" },
      { value: "harmonics",     label: "Harmonics",      desc: "Gartley, Bat, Butterfly",             emoji: "🦋" },
      { value: "volume",        label: "Volume Profile", desc: "POC, VAH, VAL",                       emoji: "📦" },
      { value: "order-flow",    label: "Order Flow",     desc: "DOM, Footprint, Delta",               emoji: "🔄" },
      { value: "scalping",      label: "Scalping",       desc: "עסקאות שניות עד דקות",               emoji: "⚡" },
      { value: "news",          label: "News Trading",   desc: "מסחר על דוחות כלכליים",              emoji: "📰" },
      { value: "algo",          label: "אלגו / בוט",     desc: "EAs, Pine Script, אוטומציה",         emoji: "🤖" },
    ],
  },
  {
    id: "instruments", icon: BarChart3, color: "primary",
    type: "multi",
    title: "באיזה נכסים אתה סוחר?",
    subtitle: "בחר את כל סוגי הנכסים שאתה סוחר",
    options: [
      { value: "forex",       label: "Forex",      desc: "EUR/USD, GBP/JPY…",          emoji: "💱" },
      { value: "indices",     label: "מדדים",      desc: "NAS100, S&P500, DAX",        emoji: "📉" },
      { value: "crypto",      label: "קריפטו",     desc: "BTC, ETH, Altcoins",         emoji: "₿"  },
      { value: "stocks",      label: "מניות",      desc: "AAPL, TSLA, מניות ארה״ב",   emoji: "🏢" },
      { value: "commodities", label: "סחורות",     desc: "זהב, נפט, כסף",             emoji: "🥇" },
      { value: "futures",     label: "Futures",    desc: "ES, NQ, CL, GC",             emoji: "📜" },
    ],
  },
  {
    id: "sessions", icon: Clock, color: "primary",
    type: "multi",
    title: "באיזה סשנים אתה סוחר?",
    subtitle: "בחר את כל הסשנים שבהם אתה פעיל",
    options: [
      { value: "asia",        label: "אסיה",           desc: "00:00–09:00 IL",        emoji: "🌏" },
      { value: "london-open", label: "פתיחת לונדון",   desc: "09:00–11:00 IL",        emoji: "🇬🇧" },
      { value: "london",      label: "לונדון",          desc: "09:00–18:00 IL",        emoji: "🏦" },
      { value: "ny-open",     label: "פתיחת ניו יורק", desc: "15:30–17:30 IL",        emoji: "🗽" },
      { value: "ny",          label: "ניו יורק",        desc: "15:30–23:00 IL",        emoji: "🇺🇸" },
      { value: "overlap",     label: "חפיפה EU/US",     desc: "15:30–18:00 IL 🔥",    emoji: "⚡" },
      { value: "premarket",   label: "Pre-Market",      desc: "13:00–15:30 IL",        emoji: "⏰" },
    ],
  },
  {
    id: "minConfirmations", icon: ShieldAlert, color: "primary",
    type: "single",
    title: "כמה אישורים לפני כניסה לעסקה?",
    subtitle: "כמה קריטריונים חייבים להתקיים לפני שאתה לוחץ Buy/Sell",
    options: [
      { value: "1", label: "1 אישור",    desc: "תגובה מהירה, יותר עסקאות",            emoji: "1️⃣" },
      { value: "2", label: "2 אישורים",  desc: "איזון בין מהירות לאיכות",             emoji: "2️⃣" },
      { value: "3", label: "3 אישורים",  desc: "סטנדרט מקובל אצל רוב הסוחרים",       emoji: "3️⃣" },
      { value: "4", label: "4 אישורים",  desc: "סבלני, פחות עסקאות, יותר ביטחון",    emoji: "4️⃣" },
      { value: "5", label: "5+ אישורים", desc: "רק Setup מושלם — כל הכוכבים מסתדרים",emoji: "5️⃣" },
    ],
  },
  {
    id: "experienceYears", icon: TrendingUp, color: "primary",
    type: "single",
    title: "כמה שנים אתה סוחר?",
    subtitle: "עוזר לנו להתאים את רמת הניתוח והעצות",
    options: [
      { value: "0-6m", label: "פחות מחצי שנה", desc: "מתחיל — לומד את הבסיס",                  emoji: "🌱" },
      { value: "6m-1", label: "חצי שנה – שנה",  desc: "מכיר את הבסיס, בונה שיטה",              emoji: "📚" },
      { value: "1-2",  label: "1 – 2 שנים",      desc: "יש לי שיטה, עובד על עקביות",            emoji: "🔧" },
      { value: "2-5",  label: "2 – 5 שנים",      desc: "מנוסה, מחפש לשפר ביצועים",              emoji: "📈" },
      { value: "5-10", label: "5 – 10 שנים",     desc: "ותיק, ראיתי הרבה מחזורים",              emoji: "🏆" },
      { value: "10+",  label: "10+ שנים",         desc: "מקצועי — מסחר חלק מרכזי בחיי",          emoji: "🎖️" },
    ],
  },
  {
    id: "accountType", icon: Wallet, color: "primary",
    type: "single",
    title: "איזה סוג חשבון אתה מנהל?",
    subtitle: "נתאים את ניהול הסיכונים, ההתראות והכללים בהתאם",
    options: [
      { value: "funded",   label: "Funded Account",  desc: "FTMO, Funded Next — Drawdown מוגבל", emoji: "🏆" },
      { value: "prop",     label: "Prop Firm",        desc: "חשבון של החברה, Split רווחים",       emoji: "🏢" },
      { value: "personal", label: "חשבון אישי",       desc: "הון עצמי — גמישות מלאה",            emoji: "💼" },
      { value: "demo",     label: "Demo / תרגול",     desc: "בלי כסף אמיתי, בונה מיומנות",       emoji: "🎓" },
    ],
  },
  {
    id: "weaknesses", icon: Brain, color: "primary",
    type: "multi",
    title: "מה החולשות הפסיכולוגיות שלך?",
    subtitle: "ה-AI ישתמש בזה כדי לזהות דפוסים — היה כנה עם עצמך",
    options: [
      { value: "overtrading",    label: "Overtrading",           desc: "פותח יותר מדי עסקאות",          emoji: "📊" },
      { value: "fomo",           label: "FOMO",                  desc: "קופץ מפחד לפספס",               emoji: "😨" },
      { value: "cutting-wins",   label: "חותך רווחים מוקדם",    desc: "סוגר לפני שהגיע ליעד",          emoji: "✂️" },
      { value: "moving-sl",      label: "מזיז סטופ-לוס",        desc: "מרחיק SL כשהולך נגדו",          emoji: "🎯" },
      { value: "revenge",        label: "Revenge Trading",       desc: "עסקה מיד אחרי הפסד מכעס",      emoji: "😤" },
      { value: "oversize",       label: "פוזיציה גדולה מדי",    desc: "מסכן יותר מדי בעסקה אחת",      emoji: "💥" },
      { value: "missing",        label: "מפספס Setups",          desc: "רואה Setup אחרי שהוא קורה",    emoji: "👀" },
      { value: "impatience",     label: "חוסר סבלנות",          desc: "נכנס לפני כל האישורים",         emoji: "⏰" },
      { value: "no-journal",     label: "לא מתעד עסקאות",       desc: "לא לומד מטעויות",               emoji: "📓" },
      { value: "plan-deviation", label: "סטייה מהפלן",          desc: "עסקאות שלא עומדות בקריטריונים", emoji: "🗺️" },
    ],
  },
];

/* ─── Component ─────────────────────────────────────────────────────── */
interface OnboardingModalProps {
  userName: string;
  onComplete: () => void;
}

const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const { updateProfile, user } = useAuth();
  const { setUserProfile } = useUserProfile();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"fwd" | "bwd">("fwd");
  const [visible, setVisible] = useState(true);
  const [values, setValues] = useState<Record<string, any>>({});
  const [completing, setCompleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const current = STEPS[step];
  const val = values[current.id];
  const progress = ((step) / STEPS.length) * 100;

  const isValid = () => {
    if (current.type === "text") return typeof val === "string" && val.trim().length >= 2;
    if (current.type === "single") return !!val;
    if (current.type === "multi") return Array.isArray(val) && val.length > 0;
    return false;
  };

  /* ── Animated step transition ── */
  const goTo = (nextStep: number, direction: "fwd" | "bwd") => {
    setVisible(false);
    setDir(direction);
    setTimeout(() => {
      setStep(nextStep);
      setVisible(true);
    }, 180);
  };

  const handleSingle = (v: string) => setValues(prev => ({ ...prev, [current.id]: v }));
  const handleMulti  = (v: string) => setValues(prev => {
    const arr: string[] = prev[current.id] || [];
    return { ...prev, [current.id]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] };
  });

  const handleNext = async () => {
    if (!isValid()) return;
    if (step < STEPS.length - 1) { goTo(step + 1, "fwd"); return; }

    setCompleting(true);
    const v = values;
    const fullName = (v.name as string)?.trim() || "";
    const methodsArr: string[] = v.tradingMethods || [];
    const legacyStyle = methodsArr.includes("smc") || methodsArr.includes("ict")
      ? "day_trading" : methodsArr.includes("scalping") ? "scalping" : "swing";

    // Save to DB first
    await updateProfile({
      onboarding_completed: true,
      full_name:            fullName || null,
      trading_style:        legacyStyle,
      trading_methods:      methodsArr,
      primary_instruments:  v.instruments    || [],
      trading_sessions:     v.sessions       || [],
      min_confirmations:    v.minConfirmations ? parseInt(v.minConfirmations) : null,
      experience_years:     v.experienceYears || null,
      account_type:         v.accountType    || null,
      weaknesses:           v.weaknesses     || [],
    } as any);

    setUserProfile({
      name: fullName, tradingMethods: methodsArr,
      instruments: v.instruments || [], sessions: v.sessions || [],
      minConfirmations: v.minConfirmations ? parseInt(v.minConfirmations) : null,
      accountType: v.accountType || "", experienceYears: v.experienceYears || "",
      weaknesses: v.weaknesses || [], riskPerTrade: "", tradingStyle: legacyStyle,
    });

    // Mark in localStorage AFTER DB save — then dismiss
    if (user?.id) localStorage.setItem(`zentrade-onboarded-${user.id}`, "1");

    setShowSuccess(true);
    setTimeout(() => { onComplete(); }, 2500);
  };

  /* ── Focus name input when arriving on step 0 ── */
  useEffect(() => {
    if (step === 0 && visible) setTimeout(() => nameRef.current?.focus(), 250);
  }, [step, visible]);

  /* ── Success screen ── */
  if (showSuccess) {
    const firstName = (values.name as string)?.split(" ")[0] || "";
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" dir="rtl">
        <div className="absolute inset-0 bg-[#08080E]/99 backdrop-blur-xl" />
        <div className="relative z-10 text-center max-w-sm px-4 animate-in zoom-in-95 fade-in duration-600">
          <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-40" />
            <div className="absolute inset-2 rounded-full bg-primary/10 border border-primary/20" />
            <Check className="relative h-12 w-12 text-primary" strokeWidth={2.5} />
          </div>
          <h1 className="font-heading text-3xl font-black text-foreground mb-3">
            {firstName ? `ברוך הבא, ${firstName}! 🎯` : "הפרופיל מוכן! 🎯"}
          </h1>
          <p className="text-sm text-muted-foreground/55 leading-relaxed">
            ה-AI מכיר אותך עכשיו ויוכל לנתח את המסחר שלך בצורה מדויקת.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2">
            {[0,120,240].map(d => (
              <span key={d} className="h-2 w-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Main render ── */
  const multiVal: string[] = Array.isArray(val) ? val : [];

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#08080E]/98 backdrop-blur-xl" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/[0.025] blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg sm:rounded-3xl bg-[#0D0D14] border-0 sm:border sm:border-white/[0.08] shadow-2xl shadow-primary/[0.04] flex flex-col max-h-[95dvh] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-l from-transparent via-primary/50 to-transparent hidden sm:block" />

        {/* ── Top: logo + progress ── */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          {/* Step pills row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-500 ${
                    i === step
                      ? "w-6 h-2 bg-primary"
                      : i < step
                      ? "w-2 h-2 bg-primary/50"
                      : "w-2 h-2 bg-white/[0.08]"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/30 font-bold">
              {step + 1} / {STEPS.length}
            </span>
          </div>

          {/* Thin progress line */}
          <div className="h-px bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-primary to-primary/60 transition-all duration-500 ease-out"
              style={{ width: `${progress + (100 / STEPS.length)}%` }}
            />
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div
          className={`flex-1 overflow-y-auto px-6 pb-2 transition-all duration-180 ${
            visible
              ? "opacity-100 translate-y-0"
              : dir === "fwd"
              ? "opacity-0 translate-y-3"
              : "opacity-0 -translate-y-3"
          }`}
          style={{ scrollbarWidth: "none" }}
        >
          {/* Step header */}
          <div className="text-center py-6">
            <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-5 shadow-[0_0_24px_rgba(0,212,170,0.15)]">
              <div className="absolute inset-[-4px] rounded-2xl bg-primary/5 blur-[12px]" />
              <current.icon className="relative h-6 w-6 text-primary drop-shadow-[0_0_6px_rgba(0,212,170,0.5)]" />
            </div>
            <h2 className="font-heading text-[22px] font-black text-foreground mb-2 leading-snug">
              {current.title}
            </h2>
            <p className="text-xs text-muted-foreground/45 leading-relaxed max-w-xs mx-auto">
              {current.subtitle}
            </p>
            {current.type === "multi" && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1">
                <div className="flex gap-0.5">
                  {[0,1,2].map(i => (
                    <div key={i} className={`h-1.5 w-1.5 rounded-full ${i < multiVal.length ? "bg-primary" : "bg-white/10"}`} />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-primary/60">
                  {multiVal.length > 0 ? `${multiVal.length} נבחרו` : "בחירה מרובה"}
                </span>
              </div>
            )}
          </div>

          {/* ── Text input ── */}
          {current.type === "text" && (
            <div className="mb-4">
              <input
                ref={nameRef}
                type="text"
                placeholder={current.placeholder}
                value={(val as string) || ""}
                onChange={e => setValues(prev => ({ ...prev, [current.id]: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && isValid() && handleNext()}
                className="w-full rounded-2xl border border-white/[0.09] bg-white/[0.04] px-5 py-4 text-[15px] font-semibold text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary/35 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)] transition-all text-right"
              />
            </div>
          )}

          {/* ── Single select ── */}
          {current.type === "single" && (
            <div className="space-y-2 mb-4">
              {current.options!.map(opt => {
                const sel = val === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSingle(opt.value)}
                    className={`group w-full text-right rounded-2xl border px-4 py-3.5 transition-all duration-200 ${
                      sel
                        ? "border-primary/35 bg-gradient-to-l from-primary/[0.12] to-primary/[0.05] shadow-[0_0_20px_hsl(var(--primary)/0.08)]"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl shrink-0 leading-none">{opt.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-bold leading-none mb-1 ${sel ? "text-primary" : "text-foreground"}`}>
                          {opt.label}
                        </p>
                        {opt.desc && (
                          <p className="text-[10px] text-muted-foreground/40 leading-snug">{opt.desc}</p>
                        )}
                      </div>
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                        sel ? "border-primary bg-primary scale-110" : "border-white/[0.15] group-hover:border-white/30"
                      }`}>
                        {sel && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Multi select — 2-col grid for large lists ── */}
          {current.type === "multi" && (
            <div className={`mb-4 ${current.options!.length > 6 ? "grid grid-cols-2 gap-2" : "space-y-2"}`}>
              {current.options!.map(opt => {
                const sel = multiVal.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleMulti(opt.value)}
                    className={`group w-full text-right rounded-xl border px-3 py-3 transition-all duration-200 ${
                      sel
                        ? "border-primary/35 bg-gradient-to-l from-primary/[0.12] to-primary/[0.05]"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0 leading-none">{opt.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[12px] font-bold truncate ${sel ? "text-primary" : "text-foreground"}`}>
                          {opt.label}
                        </p>
                        {opt.desc && current.options!.length <= 6 && (
                          <p className="text-[9px] text-muted-foreground/35 leading-snug mt-0.5">{opt.desc}</p>
                        )}
                      </div>
                      <div className={`flex h-4.5 w-4.5 h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                        sel ? "border-primary bg-primary scale-105" : "border-white/[0.12] group-hover:border-white/25"
                      }`}>
                        {sel && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer: navigation ── */}
        <div className="px-6 pb-6 pt-3 shrink-0 border-t border-white/[0.04]">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={() => goTo(step - 1, "bwd")}
                className="flex items-center justify-center gap-1 rounded-xl bg-white/[0.04] border border-white/[0.07] w-11 h-11 text-muted-foreground/50 hover:text-foreground hover:bg-white/[0.07] transition-all"
                aria-label="חזור"
              >
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!isValid() || completing}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl h-12 text-sm font-bold text-primary-foreground disabled:opacity-25 transition-all active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)",
                boxShadow: isValid() ? "0 4px 24px hsl(var(--primary)/0.25)" : "none",
              }}
            >
              {completing ? (
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {step === STEPS.length - 1 ? <Sparkles className="h-4 w-4" /> : null}
                  {step === STEPS.length - 1 ? "סיים והתחל לסחור" : "הבא ←"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
