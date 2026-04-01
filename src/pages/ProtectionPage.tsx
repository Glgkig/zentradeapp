import { useState } from "react";
import {
  Shield, Lock, AlertTriangle, Zap, Clock, Ban,
  ShieldCheck, ShieldAlert, TrendingDown, Activity,
  Newspaper, Timer, Power, ChevronDown,
} from "lucide-react";

/* ===== Page ===== */
const ProtectionPage = () => {
  const [drawdownLimit, setDrawdownLimit] = useState("500");
  const [hardLock, setHardLock] = useState(false);
  const [maxTrades, setMaxTrades] = useState("5");
  const [newsShield, setNewsShield] = useState(true);
  const [newsBuffer, setNewsBuffer] = useState("30");
  const [activated, setActivated] = useState(false);

  return (
    <div className="mx-auto max-w-[900px]">
      {/* ── Header ── */}
      <div className="relative mb-4 md:mb-6 rounded-2xl border border-border/20 bg-secondary/15 p-4 md:p-7 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-destructive/[0.03] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/8 border border-destructive/12">
              <Shield className="h-4.5 w-4.5 text-destructive/70" />
            </div>
            <h1 className="font-heading text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
              הגדרות שומר הראש
            </h1>
          </div>
          <p className="text-[11px] md:text-xs text-muted-foreground/45 leading-relaxed max-w-lg mb-4">
            החוזה היומי שלך מול השוק. הגדר את גבולות הגזרה שלך כעת, ה-AI יאכוף אותם ללא פשרות.
          </p>

          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 ${
            activated
              ? "border-accent/20 bg-accent/8"
              : "border-yellow-400/15 bg-yellow-400/6"
          }`}>
            {activated ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent/50" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <Lock className="h-3.5 w-3.5 text-accent/70" />
                <span className="text-[10px] font-bold text-accent/80">סטטוס הגנה: פעיל ומאכף</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-3.5 w-3.5 text-yellow-400/70" />
                <span className="text-[10px] font-bold text-yellow-400/70">סטטוס הגנה: ממתין לקינפוג</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        {/* ══ Module 1: Hard Stop ══ */}
        <div className={`rounded-2xl border overflow-hidden transition-all duration-500 ${
          hardLock
            ? "border-destructive/20 shadow-[0_0_30px_hsl(var(--destructive)/0.06)]"
            : "border-border/15"
        } bg-secondary/10`}>
          <div className="flex items-center gap-2 px-5 pt-5 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/8 border border-destructive/10">
              <TrendingDown className="h-4 w-4 text-destructive/60" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-foreground/85">הגנת הפסד יומי מקסימלי</h2>
              <p className="text-[9px] text-muted-foreground/35 font-medium">Hard Stop — הגבול שלא ניתן לעבור</p>
            </div>
          </div>

          <div className="px-5 pb-5 space-y-4">
            {/* Drawdown input */}
            <div>
              <label className="text-[10px] font-semibold text-foreground/60 mb-1.5 block">
                נעילת הפסד יומי (Drawdown Limit)
              </label>
              <div className="relative">
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-muted-foreground/30">$</span>
                <input
                  type="number"
                  value={drawdownLimit}
                  onChange={(e) => setDrawdownLimit(e.target.value)}
                  disabled={hardLock}
                  className="w-full rounded-xl border border-border/20 bg-[hsl(222,40%,8%)] px-4 pr-8 py-3 text-sm font-bold text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  placeholder="500"
                />
              </div>
            </div>

            {/* Hard Lock Toggle */}
            <div className={`rounded-xl border p-4 transition-all duration-300 ${
              hardLock ? "border-destructive/20 bg-destructive/[0.04]" : "border-border/10 bg-muted/[0.03]"
            }`}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className={`h-4 w-4 ${hardLock ? "text-destructive/70" : "text-muted-foreground/30"}`} />
                  <span className="text-[11px] font-bold text-foreground/80">נעילה קשיחה (Hard Lock)</span>
                </div>
                <button
                  onClick={() => setHardLock(!hardLock)}
                  className={`relative w-11 h-6 rounded-full border transition-all duration-300 ${
                    hardLock
                      ? "bg-destructive/25 border-destructive/30"
                      : "bg-muted/20 border-border/20"
                  }`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full transition-all duration-300 ${
                    hardLock
                      ? "right-0.5 bg-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.4)]"
                      : "right-[22px] bg-muted-foreground/30"
                  }`} />
                </button>
              </div>
              <div className="flex items-start gap-1.5 mt-2">
                <AlertTriangle className="h-3 w-3 text-destructive/40 shrink-0 mt-0.5" />
                <p className="text-[9px] text-destructive/40 leading-relaxed">
                  אזהרה: הפעלת נעילה קשיחה תמנע ממך לשנות את סכום ההפסד או לסחור עד חצות הלילה. אין דרך חזרה.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══ Module 2: Overtrading Guard ══ */}
        <div className="rounded-2xl border border-border/15 bg-secondary/10 overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-5 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/8 border border-primary/10">
              <Activity className="h-4 w-4 text-primary/60" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-foreground/85">הגנת עסקאות יתר</h2>
              <p className="text-[9px] text-muted-foreground/35 font-medium">Overtrading Guard — עצור לפני שזה מאוחר מדי</p>
            </div>
          </div>

          <div className="px-5 pb-5 space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-foreground/60 mb-1.5 block">
                מקסימום עסקאות ליום (Max Daily Trades)
              </label>
              <div className="relative">
                <select
                  value={maxTrades}
                  onChange={(e) => setMaxTrades(e.target.value)}
                  className="w-full rounded-xl border border-border/20 bg-[hsl(222,40%,8%)] px-4 py-3 text-sm font-bold text-foreground appearance-none outline-none focus:border-primary/30 transition-all"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n} עסקאות</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/25 pointer-events-none" />
              </div>
            </div>
            <div className="rounded-xl border border-primary/8 bg-primary/[0.03] p-3 flex items-start gap-2">
              <Zap className="h-3.5 w-3.5 text-primary/40 shrink-0 mt-0.5" />
              <p className="text-[9px] text-primary/50 leading-relaxed">
                ה-AI יחסום פתיחת פוזיציות חדשות ברגע שתגיע למכסה, כדי למנוע מסחר מתוך שעמום או פומו.
              </p>
            </div>
          </div>
        </div>

        {/* ══ Module 3: News Shield ══ */}
        <div className="rounded-2xl border border-border/15 bg-secondary/10 overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-5 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400/8 border border-yellow-400/10">
              <Newspaper className="h-4 w-4 text-yellow-400/60" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-foreground/85">חומת חדשות כלכליות</h2>
              <p className="text-[9px] text-muted-foreground/35 font-medium">News & Event Shield — הגנה מפני תנודתיות</p>
            </div>
          </div>

          <div className="px-5 pb-5 space-y-3">
            {/* Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border/10 bg-muted/[0.03] p-3.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`h-4 w-4 ${newsShield ? "text-accent/60" : "text-muted-foreground/25"}`} />
                <span className="text-[11px] font-bold text-foreground/75">הגנת CPI / ריבית אקטיבית</span>
              </div>
              <button
                onClick={() => setNewsShield(!newsShield)}
                className={`relative w-11 h-6 rounded-full border transition-all duration-300 ${
                  newsShield ? "bg-accent/20 border-accent/25" : "bg-muted/20 border-border/20"
                }`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full transition-all duration-300 ${
                  newsShield
                    ? "right-0.5 bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.4)]"
                    : "right-[22px] bg-muted-foreground/30"
                }`} />
              </button>
            </div>

            {/* Buffer time */}
            {newsShield && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <label className="text-[10px] font-semibold text-foreground/60 mb-1.5 block">
                  נעל פלטפורמה לפני ואחרי הודעת ״תיקייה אדומה״
                </label>
                <div className="relative">
                  <select
                    value={newsBuffer}
                    onChange={(e) => setNewsBuffer(e.target.value)}
                    className="w-full rounded-xl border border-border/20 bg-[hsl(222,40%,8%)] px-4 py-3 text-sm font-bold text-foreground appearance-none outline-none focus:border-primary/30 transition-all"
                  >
                    <option value="15">15 דקות</option>
                    <option value="30">30 דקות</option>
                    <option value="60">שעה</option>
                  </select>
                  <Timer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/25 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ Module 4: Emergency Tilt Button ══ */}
        <div className="rounded-2xl border border-destructive/12 bg-destructive/[0.03] p-5 md:p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/15">
              <Ban className="h-4 w-4 text-destructive/60" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-foreground/85">כפתור מצוקה (Self-Exclusion)</h2>
              <p className="text-[9px] text-muted-foreground/35 font-medium">מרגיש שאיבדת שליטה? עצור הכל עכשיו</p>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground/40 leading-relaxed mb-4 max-w-md">
            מרגיש שאיבדת שליטה? תן ל-AI לנתק אותך מהברוקר עכשיו. החשבון יינעל ל-24 שעות ואין אפשרות לבטל.
          </p>

          <button className="interactive-btn flex items-center justify-center gap-2 rounded-xl bg-destructive/15 border border-destructive/20 px-5 py-3 text-[11px] font-bold text-destructive/80 hover:bg-destructive/25 hover:border-destructive/30 hover:shadow-[0_0_20px_hsl(var(--destructive)/0.1)] transition-all duration-300 w-full sm:w-auto min-h-[48px]">
            <Power className="h-4 w-4" />
            נעל לי את החשבון ל-24 שעות
          </button>
        </div>

        {/* ══ Activate Shield Button ══ */}
        <button
          onClick={() => setActivated(true)}
          className={`interactive-btn w-full flex items-center justify-center gap-2.5 rounded-2xl border py-4 text-sm font-extrabold transition-all duration-500 min-h-[52px] ${
            activated
              ? "bg-accent/15 border-accent/25 text-accent shadow-[0_0_30px_hsl(var(--accent)/0.1)]"
              : "bg-primary/12 border-primary/20 text-primary hover:bg-primary/20 hover:shadow-[0_0_25px_hsl(var(--primary)/0.12)]"
          }`}
        >
          {activated ? (
            <>
              <ShieldCheck className="h-5 w-5" />
              חומת מגן פעילה ✓
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              הפעל חומת מגן
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProtectionPage;
