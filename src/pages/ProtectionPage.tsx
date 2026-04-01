import { useState } from "react";
import {
  Shield, Lock, AlertTriangle, Zap, Ban,
  ShieldCheck, ShieldAlert, TrendingDown, Activity,
  Newspaper, Timer, Power, ChevronDown,
} from "lucide-react";

const ProtectionPage = () => {
  const [drawdownLimit, setDrawdownLimit] = useState("500");
  const [hardLock, setHardLock] = useState(false);
  const [maxTrades, setMaxTrades] = useState("5");
  const [newsShield, setNewsShield] = useState(true);
  const [newsBuffer, setNewsBuffer] = useState("30");
  const [activated, setActivated] = useState(false);

  return (
    <div className="mx-auto max-w-[900px]">
      {/* Header */}
      <div className="relative mb-3 rounded-sm border border-border/10 bg-card p-3 md:p-4 overflow-hidden">
        <div className="relative">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-loss/6 border border-loss/10">
              <Shield className="h-3.5 w-3.5 text-loss/60" />
            </div>
            <h1 className="font-heading text-[14px] md:text-[15px] font-bold text-foreground">הגדרות שומר הראש</h1>
          </div>
          <p className="text-2xs text-muted-foreground/35 leading-relaxed max-w-lg mb-3">
            החוזה היומי שלך. הגדר גבולות — ה-AI יאכוף ללא פשרות.
          </p>
          <div className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 ${
            activated ? "border-profit/15 bg-profit/5" : "border-yellow-400/10 bg-yellow-400/4"
          }`}>
            {activated ? (
              <>
                <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profit/50" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-profit" /></span>
                <Lock className="h-3 w-3 text-profit/60" />
                <span className="text-2xs font-bold text-profit/70 font-mono">PROTECTION: ACTIVE</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-3 w-3 text-yellow-400/60" />
                <span className="text-2xs font-bold text-yellow-400/60 font-mono">PENDING CONFIG</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {/* Hard Stop */}
        <div className={`rounded-sm border overflow-hidden transition-all ${hardLock ? "border-loss/15" : "border-border/8"} bg-card`}>
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            <TrendingDown className="h-3.5 w-3.5 text-loss/50" />
            <div>
              <h2 className="text-[11px] font-bold text-foreground/80">הגנת הפסד יומי מקסימלי</h2>
              <p className="text-2xs text-muted-foreground/30 font-mono">HARD STOP — NO BYPASS</p>
            </div>
          </div>
          <div className="px-3 pb-3 space-y-2.5">
            <div>
              <label className="text-2xs font-semibold text-foreground/50 mb-1 block font-mono">DRAWDOWN LIMIT</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground/25 font-mono">$</span>
                <input type="number" value={drawdownLimit} onChange={(e) => setDrawdownLimit(e.target.value)} disabled={hardLock}
                  className="w-full rounded-sm border border-border/10 bg-background px-3 pr-7 py-2 text-[12px] font-bold text-foreground font-mono placeholder:text-muted-foreground/15 outline-none focus:border-primary/20 disabled:opacity-30 transition-all"
                />
              </div>
            </div>
            <div className={`rounded-sm border p-3 transition-all ${hardLock ? "border-loss/15 bg-loss/[0.03]" : "border-border/6 bg-muted/[0.02]"}`}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Lock className={`h-3 w-3 ${hardLock ? "text-loss/60" : "text-muted-foreground/25"}`} />
                  <span className="text-[10px] font-bold text-foreground/70">Hard Lock</span>
                </div>
                <button onClick={() => setHardLock(!hardLock)} className={`relative w-9 h-5 rounded-sm border transition-all ${hardLock ? "bg-loss/20 border-loss/25" : "bg-muted/15 border-border/15"}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-sm transition-all ${hardLock ? "right-0.5 bg-loss" : "right-[18px] bg-muted-foreground/25"}`} />
                </button>
              </div>
              <div className="flex items-start gap-1">
                <AlertTriangle className="h-2.5 w-2.5 text-loss/30 shrink-0 mt-0.5" />
                <p className="text-2xs text-loss/30 leading-relaxed">הפעלת נעילה = אין שינויים עד חצות. אין דרך חזרה.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overtrading */}
        <div className="rounded-sm border border-border/8 bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            <Activity className="h-3.5 w-3.5 text-primary/50" />
            <div>
              <h2 className="text-[11px] font-bold text-foreground/80">הגנת עסקאות יתר</h2>
              <p className="text-2xs text-muted-foreground/30 font-mono">OVERTRADING GUARD</p>
            </div>
          </div>
          <div className="px-3 pb-3 space-y-2">
            <div>
              <label className="text-2xs font-semibold text-foreground/50 mb-1 block font-mono">MAX DAILY TRADES</label>
              <div className="relative">
                <select value={maxTrades} onChange={(e) => setMaxTrades(e.target.value)}
                  className="w-full rounded-sm border border-border/10 bg-background px-3 py-2 text-[12px] font-bold text-foreground font-mono appearance-none outline-none focus:border-primary/20 transition-all"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (<option key={n} value={n}>{n} עסקאות</option>))}
                </select>
                <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/20 pointer-events-none" />
              </div>
            </div>
            <div className="rounded-sm border border-primary/6 bg-primary/[0.02] p-2 flex items-start gap-1.5">
              <Zap className="h-3 w-3 text-primary/30 shrink-0 mt-0.5" />
              <p className="text-2xs text-primary/40 leading-relaxed">חסימת פוזיציות חדשות ברגע שתגיע למכסה.</p>
            </div>
          </div>
        </div>

        {/* News Shield */}
        <div className="rounded-sm border border-border/8 bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            <Newspaper className="h-3.5 w-3.5 text-yellow-400/50" />
            <div>
              <h2 className="text-[11px] font-bold text-foreground/80">חומת חדשות</h2>
              <p className="text-2xs text-muted-foreground/30 font-mono">NEWS SHIELD</p>
            </div>
          </div>
          <div className="px-3 pb-3 space-y-2">
            <div className="flex items-center justify-between rounded-sm border border-border/6 bg-muted/[0.02] p-2.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className={`h-3 w-3 ${newsShield ? "text-profit/50" : "text-muted-foreground/20"}`} />
                <span className="text-[10px] font-bold text-foreground/70">CPI / ריבית</span>
              </div>
              <button onClick={() => setNewsShield(!newsShield)} className={`relative w-9 h-5 rounded-sm border transition-all ${newsShield ? "bg-profit/15 border-profit/20" : "bg-muted/15 border-border/15"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-sm transition-all ${newsShield ? "right-0.5 bg-profit" : "right-[18px] bg-muted-foreground/25"}`} />
              </button>
            </div>
            {newsShield && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                <label className="text-2xs font-semibold text-foreground/50 mb-1 block font-mono">LOCK BUFFER</label>
                <div className="relative">
                  <select value={newsBuffer} onChange={(e) => setNewsBuffer(e.target.value)}
                    className="w-full rounded-sm border border-border/10 bg-background px-3 py-2 text-[12px] font-bold text-foreground font-mono appearance-none outline-none focus:border-primary/20 transition-all"
                  >
                    <option value="15">15 דק׳</option>
                    <option value="30">30 דק׳</option>
                    <option value="60">60 דק׳</option>
                  </select>
                  <Timer className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/20 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Emergency */}
        <div className="rounded-sm border border-loss/10 bg-loss/[0.02] p-3">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="h-3.5 w-3.5 text-loss/50" />
            <div>
              <h2 className="text-[11px] font-bold text-foreground/80">כפתור מצוקה</h2>
              <p className="text-2xs text-muted-foreground/30 font-mono">SELF-EXCLUSION</p>
            </div>
          </div>
          <p className="text-2xs text-muted-foreground/35 leading-relaxed mb-3">
            מרגיש שאיבדת שליטה? נעילת חשבון ל-24 שעות. ללא ביטול.
          </p>
          <button className="haptic-press flex items-center justify-center gap-1.5 rounded-sm bg-loss/10 border border-loss/15 px-4 py-2.5 text-[10px] font-bold text-loss/70 hover:bg-loss/15 transition-all w-full sm:w-auto min-h-[40px]">
            <Power className="h-3.5 w-3.5" />
            <span className="font-mono">LOCK 24H</span>
          </button>
        </div>

        {/* Activate */}
        <button
          onClick={() => setActivated(true)}
          className={`haptic-press w-full flex items-center justify-center gap-2 rounded-sm border py-3 text-[12px] font-bold transition-all min-h-[44px] ${
            activated
              ? "bg-profit/8 border-profit/15 text-profit"
              : "bg-primary/8 border-primary/15 text-primary hover:bg-primary/12"
          }`}
        >
          {activated ? (
            <><ShieldCheck className="h-4 w-4" /><span className="font-mono">SHIELD ACTIVE ✓</span></>
          ) : (
            <><Shield className="h-4 w-4" /><span>הפעל חומת מגן</span></>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProtectionPage;
