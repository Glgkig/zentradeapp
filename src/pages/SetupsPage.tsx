import { useState } from "react";
import {
  Crosshair, Target, TrendingUp, Eye, X,
  CheckCircle2, BarChart3, Sparkles, Shield, Edit3,
  Plus, Zap, Award, ChevronLeft,
} from "lucide-react";

/* ===== SMC Setup Data ===== */
const setups = [
  {
    id: 1,
    name: "איסוף נזילות (Liquidity Sweep)",
    icon: Target,
    tags: ["SMC", "High Probability", "15m Timeframe"],
    winRate: 72,
    totalProfit: 4200,
    trades: 45,
    profitable: true,
    rules: [
      "זיהוי Equal Highs/Lows מעל/מתחת לאזור נזילות",
      "המתנה לסוויפ מעבר לרמה עם נר rejection",
      "כניסה בחזרה מתחת/מעל לרמה המקורית",
      "סטופ מעבר לפתיל של נר הסוויפ",
      "יעד: אזור הביקוש/היצע הקרוב ביותר",
    ],
    aiInsight: "הסטאפ הזה מייצר לך את הרווח הגבוה ביותר. 78% מהעסקאות המוצלחות נפתחו בסשן ניו-יורק. המשך להתמקד שם.",
  },
  {
    id: 2,
    name: "כניסת FVG (Fair Value Gap)",
    icon: Zap,
    tags: ["ICT", "Trend Continuation", "5m Timeframe"],
    winRate: 58,
    totalProfit: 1850,
    trades: 60,
    profitable: true,
    rules: [
      "זיהוי FVG בגוף של 3 נרות רצופים",
      "וידוא שה-FVG נמצא בכיוון המגמה הראשית",
      "כניסה כשהמחיר חוזר למלא את ה-Gap",
      "סטופ מתחת/מעל ל-FVG",
      "יעד: High/Low האחרון",
    ],
    aiInsight: "ב-15 העסקאות האחרונות, ה-FVG-ים שעבדו הכי טוב היו אלו עם גודל של לפחות 10 פיפס. FVG-ים קטנים יותר נוטים להיכשל.",
  },
  {
    id: 3,
    name: "שבירת מבנה (BOS)",
    icon: BarChart3,
    tags: ["Reversal", "1H Timeframe"],
    winRate: 35,
    totalProfit: -450,
    trades: 28,
    profitable: false,
    rules: [
      "זיהוי שבירת High/Low אחרון בנר סגור",
      "המתנה ל-Retest של אזור השבירה",
      "וידוא Change of Character (CHoCH) לפני כניסה",
      "סטופ מתחת ל-Swing Low האחרון",
    ],
    aiInsight: "אחוז ההצלחה נמוך מ-40%. שקול לשלב עם Orderblock או FVG לפני כניסה כדי לשפר את הדיוק. 60% מההפסדים קרו בימי שני.",
  },
];

const bestSetup = setups.reduce((a, b) => a.totalProfit > b.totalProfit ? a : b);

/* ===== Win Rate Ring ===== */
const WinRateRing = ({ rate, profitable }: { rate: number; profitable: boolean }) => {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (rate / 100) * circ;
  const color = profitable ? "hsl(160, 60%, 45%)" : "hsl(350, 80%, 55%)";

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="hsl(0,0%,12%)" strokeWidth="3" />
        <circle
          cx="22" cy="22" r={r} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-[11px] font-extrabold" style={{ color }}>
        {rate}%
      </span>
    </div>
  );
};

/* ===== Page ===== */
const SetupsPage = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = setups.find(s => s.id === selectedId) || null;

  return (
    <div className="mx-auto max-w-[1280px]" dir="rtl">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-black text-foreground tracking-tight mb-1">
            ספר מהלכים <span className="text-muted-foreground/40 font-medium text-lg">(Playbook)</span>
          </h1>
          <p className="text-xs text-muted-foreground/50">
            ניהול ומעקב אחרי אסטרטגיות המסחר שלך
          </p>
        </div>
        <button className="haptic-press group flex items-center gap-2 self-start rounded-xl bg-[hsl(45,80%,50%)]/10 border border-[hsl(45,80%,50%)]/20 px-5 py-2.5 text-xs font-bold text-[hsl(45,80%,50%)] hover:bg-[hsl(45,80%,50%)]/20 transition-all duration-300 min-h-[44px]">
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          סטאפ חדש
        </button>
      </div>

      {/* ── Best Setup Banner ── */}
      <div className="mb-6 rounded-2xl border border-[hsl(45,80%,50%)]/15 bg-[hsl(45,80%,50%)]/[0.04] backdrop-blur-md px-5 py-3.5 flex items-center gap-3">
        <Award className="h-5 w-5 text-[hsl(45,80%,50%)] shrink-0" />
        <p className="text-xs font-bold text-foreground/80">
          הסטאפ הרווחי ביותר:{" "}
          <span className="text-[hsl(45,80%,50%)]">{bestSetup.name}</span>
          <span className="text-accent font-extrabold mr-2">(+₪{bestSetup.totalProfit.toLocaleString()})</span>
        </p>
      </div>

      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {setups.map((s, index) => {
          const Icon = s.icon;
          const profitColor = s.profitable ? "text-accent" : "text-destructive";
          const glowClass = s.profitable
            ? "hover:border-accent/25 hover:shadow-[0_0_30px_hsl(160,60%,45%,0.08)]"
            : "hover:border-destructive/25 hover:shadow-[0_0_30px_hsl(350,80%,55%,0.08)]";

          return (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`haptic-press group text-right rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md ${glowClass} transition-all duration-400 overflow-hidden animate-in fade-in slide-in-from-bottom-3 fill-mode-both`}
              style={{ animationDelay: `${index * 80}ms`, animationDuration: "500ms" }}
            >
              {/* Card Header */}
              <div className="p-5 pb-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.profitable ? "bg-accent/10 border border-accent/15" : "bg-destructive/10 border border-destructive/15"}`}>
                      <Icon className={`h-5 w-5 ${s.profitable ? "text-accent" : "text-destructive"}`} />
                    </div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-white transition-colors leading-tight max-w-[180px]">
                      {s.name}
                    </h3>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {s.tags.map(tag => (
                    <span key={tag} className="rounded-full bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 text-[9px] font-semibold text-muted-foreground/60 backdrop-blur-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Row */}
              <div className="px-5 pb-4">
                <div className="flex items-center gap-4">
                  <WinRateRing rate={s.winRate} profitable={s.profitable} />
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground/40 font-medium">רווח כולל</span>
                      <span className={`text-sm font-extrabold ${profitColor}`}>
                        {s.totalProfit >= 0 ? "+" : ""}{s.totalProfit.toLocaleString()}$
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground/40 font-medium">עסקאות</span>
                      <span className="text-sm font-bold text-foreground/70">{s.trades}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider + Action */}
              <div className="border-t border-white/[0.05] px-5 py-3 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground/30 font-medium flex items-center gap-1">
                  <Eye className="h-3 w-3" /> צפה בעסקאות
                </span>
                <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-accent group-hover:-translate-x-1 transition-all duration-300" />
              </div>
            </button>
          );
        })}
      </div>

      {/* ══ Detail Drawer ══ */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setSelectedId(null)}
          />

          <div className="fixed z-50 animate-in duration-300
            inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl
            md:inset-y-0 md:right-0 md:left-auto md:w-[520px] md:max-h-none md:rounded-t-none md:rounded-r-none md:rounded-l-3xl
            md:slide-in-from-right-full slide-in-from-bottom-full
            border-t md:border-t-0 md:border-l border-white/[0.08]
            bg-[#0A0A0F] overflow-y-auto
          " dir="rtl">
            {/* Mobile handle */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/15" />
            </div>

            {/* Close bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedId(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] text-muted-foreground/50 hover:text-foreground transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
                <span className="text-[10px] text-muted-foreground/30 font-medium">פרטי סטאפ</span>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${selected.profitable ? "bg-accent/10 border border-accent/15" : "bg-destructive/10 border border-destructive/15"}`}>
                  <selected.icon className={`h-5 w-5 ${selected.profitable ? "text-accent" : "text-destructive"}`} />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-extrabold text-foreground tracking-tight">
                    {selected.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {selected.tags.map(tag => (
                      <span key={tag} className="text-[8px] font-semibold text-muted-foreground/40 bg-white/[0.04] rounded-full px-2 py-0.5 border border-white/[0.06]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2.5 px-5 mb-5">
              {[
                { label: "Win Rate", value: `${selected.winRate}%`, color: selected.profitable ? "text-accent" : "text-destructive" },
                { label: "רווח כולל", value: `${selected.totalProfit >= 0 ? "+" : ""}$${selected.totalProfit.toLocaleString()}`, color: selected.profitable ? "text-accent" : "text-destructive" },
                { label: "עסקאות", value: selected.trades.toString(), color: "text-foreground/70" },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                  <p className="text-[8px] text-muted-foreground/30 font-medium mb-1">{s.label}</p>
                  <p className={`text-sm font-extrabold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Rules */}
            <div className="px-5 mb-5">
              <div className="flex items-center gap-1.5 mb-3">
                <Shield className="h-3.5 w-3.5 text-primary/50" />
                <h3 className="text-[11px] font-bold text-foreground/70">חוקי כניסה</h3>
              </div>
              <div className="space-y-1.5">
                {selected.rules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-2.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-accent/8 border border-accent/10 mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-accent/60" />
                    </div>
                    <p className="text-[10px] md:text-[11px] text-muted-foreground/60 leading-relaxed font-medium">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="px-5 mb-5">
              <div className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary/50" />
                  <h3 className="text-[11px] font-bold text-foreground/70">תובנות AI</h3>
                </div>
                <p className="text-[10px] md:text-[11px] text-muted-foreground/60 leading-[1.9]">
                  {selected.aiInsight}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 px-5 py-4 border-t border-white/[0.06] bg-[#0A0A0F]/90 backdrop-blur-md flex items-center gap-2">
              <button className="interactive-btn flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/20 py-2.5 text-[11px] font-bold text-primary hover:bg-primary/15 transition-all duration-300 min-h-[44px]">
                <Edit3 className="h-3.5 w-3.5" />
                ערוך סטאפ
              </button>
              <button
                onClick={() => setSelectedId(null)}
                className="interactive-btn flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/[0.05] border border-white/[0.08] py-2.5 text-[11px] font-bold text-muted-foreground/50 hover:text-foreground transition-all duration-300 min-h-[44px]"
              >
                סגור
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SetupsPage;
