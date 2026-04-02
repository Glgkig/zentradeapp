import { useState, useEffect } from "react";
import {
  Bot, Shield, TrendingUp, Activity, CheckCircle2,
  BarChart3, Target, Eye, ArrowUpRight, ArrowDownRight, Clock,
  Newspaper, ChevronLeft, Zap, Mic, AlertTriangle, Lock,
  Sparkles, Loader2, Brain,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const HomeDashboard = ({ userName, onOpenTrade }: { userName: string; onOpenTrade?: () => void }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : "ערב טוב";

  const [aiBriefing, setAiBriefing] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiAnalyst = async () => {
    setAiLoading(true);
    setAiBriefing("");
    try {
      const { data, error } = await supabase.functions.invoke("dashboard-ai-analyst", {
        body: { winRate: 68, profitFactor: 2.4, totalPnl: 4250 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiBriefing(data.briefing);
    } catch (e: any) {
      toast.error(e.message || "שגיאה בניתוח AI");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-2">
      {/* ===== AI Chief Analyst Banner ===== */}
      <div className="rounded-sm border border-primary/15 bg-primary/[0.03] p-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent/[0.03] rounded-full blur-3xl" />
        <div className="relative z-10">
          {!aiBriefing ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary/10 border border-primary/15">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-foreground font-mono">AI CHIEF ANALYST</p>
                  <p className="text-2xs text-muted-foreground/40">סקירה מקצועית מבוססת נתוני הביצועים שלך</p>
                </div>
              </div>
              <button
                onClick={handleAiAnalyst}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 rounded-sm bg-primary/10 border border-primary/20 px-4 py-2 text-2xs font-bold text-primary transition-all hover:bg-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>חושב...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>✨ קבל סקירת אנליסט AI</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary/10 border border-primary/15">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-2xs font-bold text-primary/60 uppercase tracking-wider font-mono">AI CHIEF ANALYST — DAILY BRIEFING</p>
                  <button
                    onClick={() => setAiBriefing("")}
                    className="text-2xs text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
                  >
                    סגור
                  </button>
                </div>
                <p className="text-[12px] text-foreground/80 leading-relaxed">{aiBriefing}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Row 1: AI + Tilt + Protection ===== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        {/* AI Status */}
        <div className="md:col-span-5 rounded-sm border border-primary/10 bg-primary/[0.03] p-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.03] rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-start gap-2.5 mb-3">
              <div className="relative shrink-0">
                <div className="absolute inset-[-3px] rounded-sm bg-primary/8 ai-breathe" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 border border-primary/15">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="font-heading text-[13px] md:text-[14px] font-bold text-foreground">
                  {greeting}, <span className="text-primary">{userName}</span>
                </h2>
                <div className="inline-flex items-center gap-1 mt-1 rounded-sm bg-primary/8 border border-primary/10 px-1.5 py-0.5 text-2xs font-semibold text-primary">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <span className="font-mono">BODYGUARD: ACTIVE</span>
                </div>
              </div>
            </div>
            <div className="rounded-sm bg-muted/10 border border-border/8 p-2.5">
              <p className="text-[10px] text-muted-foreground leading-[1.8]">
                הסטופ-לוס מוגדר. ההגנה דרוכה.
                <br />
                <span className="text-primary font-medium">נשום עמוק, תחכה לסטאפ. אני פה.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tilt Meter */}
        <div className="md:col-span-3 rounded-sm border border-border/8 bg-card p-3">
          <div className="flex items-center gap-1.5 mb-3">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="text-2xs font-semibold text-muted-foreground font-mono">TILT METER</span>
          </div>
          <div className="flex flex-col items-center">
            <TiltGauge value={25} />
            <div className="mt-2 text-center">
              <p className="text-[11px] font-bold text-profit font-mono">CALM ✓</p>
              <p className="text-2xs text-muted-foreground/40">AI real-time assessment</p>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between rounded-sm bg-muted/8 px-2 py-1.5">
              <span className="text-2xs text-muted-foreground/40">זמן מאז עסקה</span>
              <span className="text-2xs font-semibold text-foreground font-mono">2H</span>
            </div>
            <div className="flex items-center justify-between rounded-sm bg-muted/8 px-2 py-1.5">
              <span className="text-2xs text-muted-foreground/40">סטריק</span>
              <span className="text-2xs font-semibold text-profit font-mono">3W ✓</span>
            </div>
          </div>
        </div>

        {/* Protection Limits */}
        <div className="md:col-span-4 rounded-sm border border-border/8 bg-card p-3">
          <div className="flex items-center gap-1.5 mb-3">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-2xs font-semibold text-muted-foreground font-mono">HARD LIMITS</span>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xs font-medium text-foreground/70">Daily Drawdown</span>
              <span className="text-2xs text-muted-foreground font-mono">$120 / $500</span>
            </div>
            <div className="h-1.5 w-full rounded-sm bg-muted/15 overflow-hidden">
              <div className="h-full rounded-sm bg-profit transition-all" style={{ width: "24%" }} />
            </div>
            <p className="text-2xs text-profit mt-1 flex items-center gap-0.5 font-mono">
              <CheckCircle2 className="h-2.5 w-2.5" />
              24% — SAFE ZONE
            </p>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xs font-medium text-foreground/70">Trades Used</span>
              <span className="text-2xs text-muted-foreground font-mono">2 / 5</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-sm transition-all ${i <= 2 ? "bg-primary" : "bg-muted/15"}`} />
              ))}
            </div>
          </div>

          <div className="rounded-sm border border-primary/10 bg-primary/[0.03] p-2 flex items-start gap-1.5">
            <Lock className="h-3 w-3 text-primary shrink-0 mt-0.5" />
            <p className="text-2xs text-muted-foreground/60 leading-relaxed">
              נשארו <span className="text-primary font-bold font-mono">3</span> כדורים בקנה. שמור עליהם.
            </p>
          </div>
        </div>
      </div>

      {/* ===== Row 2: Chart + Signals + Sentiment ===== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        {/* Chart */}
        <div className="md:col-span-5 rounded-sm border border-border/8 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/8 px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-3 w-3 text-primary" />
              <span className="text-2xs font-semibold text-foreground font-mono">EUR/USD — M15</span>
              <span className="flex items-center gap-0.5 text-2xs text-profit font-mono">
                <span className="h-1 w-1 rounded-full bg-profit animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-sm bg-muted/15 px-1.5 py-0.5 text-2xs text-muted-foreground font-mono">1.0847</span>
              <span className="text-2xs text-profit flex items-center gap-0.5 font-mono font-semibold">
                <ArrowUpRight className="h-2.5 w-2.5" />+0.12%
              </span>
            </div>
          </div>
          <div className="p-2">
            <div className="flex items-end gap-[1px] h-28 md:h-36">
              {chartData.map((c, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-[1px]">
                  <div className="w-px bg-muted-foreground/10" style={{ height: `${c.wick}%` }} />
                  <div className={`w-full rounded-[0.5px] ${c.bull ? "bg-profit/60" : "bg-loss/50"}`} style={{ height: `${c.body}%` }} />
                  <div className="w-px bg-muted-foreground/10" style={{ height: `${c.lwick}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Signals */}
        <div className="md:col-span-4 rounded-sm border border-border/8 bg-card p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-2xs font-semibold text-foreground font-mono">AI SIGNALS</span>
          </div>
          <div className="space-y-1">
            {[
              { icon: <CheckCircle2 className="h-2.5 w-2.5 text-profit" />, text: "Engulfing — אישור לונג", time: "3m", border: "border-profit/10 bg-profit/[0.03]" },
              { icon: <AlertTriangle className="h-2.5 w-2.5 text-loss" />, text: "פטיש מזויף — נפח נמוך", time: "8m", border: "border-loss/10 bg-loss/[0.03]" },
              { icon: <Newspaper className="h-2.5 w-2.5 text-primary" />, text: "CPI בעוד 15 דק׳ — אל תסחור", time: "12m", border: "border-primary/10 bg-primary/[0.03]" },
              { icon: <Eye className="h-2.5 w-2.5 text-profit" />, text: "GBP/USD — ביקוש חזק 1.2680", time: "20m", border: "border-profit/10 bg-profit/[0.03]" },
              { icon: <Shield className="h-2.5 w-2.5 text-primary" />, text: "סטופ הוזז ל-Break Even", time: "25m", border: "border-primary/10 bg-primary/[0.03]" },
            ].map((sig, i) => (
              <div key={i} className={`flex items-start gap-2 rounded-sm border ${sig.border} px-2 py-1.5`}>
                <div className="mt-0.5 shrink-0">{sig.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xs font-medium text-foreground/80 leading-snug">{sig.text}</p>
                  <p className="text-2xs text-muted-foreground/30 font-mono">{sig.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment + Stats */}
        <div className="md:col-span-3 space-y-2">
          <div className="rounded-sm border border-border/8 bg-card p-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <Activity className="h-3 w-3 text-primary" />
              <span className="text-2xs font-semibold text-foreground font-mono">SENTIMENT</span>
            </div>
            <div className="space-y-2">
              {[
                { pair: "EUR/USD", bull: 62 },
                { pair: "GBP/USD", bull: 45 },
                { pair: "BTC/USD", bull: 78 },
              ].map((s) => (
                <div key={s.pair}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-2xs font-semibold text-foreground font-mono">{s.pair}</span>
                    <span className="text-2xs text-muted-foreground/40 font-mono">{s.bull}%L</span>
                  </div>
                  <div className="flex h-1 rounded-sm overflow-hidden">
                    <div className="bg-profit/50 transition-all" style={{ width: `${s.bull}%` }} />
                    <div className="bg-loss/30 flex-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-sm border border-border/8 bg-card p-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-3 w-3 text-profit" />
              <span className="text-2xs font-semibold text-foreground font-mono">QUICK STATS</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {[
                { label: "Win Rate", value: "68%", color: "text-profit" },
                { label: "PF", value: "2.4", color: "text-profit" },
                { label: "Avg Win", value: "+$87", color: "text-profit" },
                { label: "Avg Loss", value: "-$36", color: "text-loss" },
              ].map((s) => (
                <div key={s.label} className="rounded-sm bg-muted/8 border border-border/6 p-1.5 text-center">
                  <p className={`text-[11px] font-bold ${s.color} font-mono`}>{s.value}</p>
                  <p className="text-2xs text-muted-foreground/30 font-mono">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Row 3: Watchlist + Goals + Voice + News ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2">
        {/* Watchlist */}
        <div className="sm:col-span-1 md:col-span-4 rounded-sm border border-border/8 bg-card p-2.5">
          <div className="flex items-center gap-1.5 mb-2">
            <Eye className="h-3 w-3 text-primary" />
            <span className="text-2xs font-semibold text-foreground font-mono">WATCHLIST</span>
          </div>
          <div className="space-y-0.5">
            {watchlist.map((item) => (
              <div key={item.pair} className="flex items-center justify-between rounded-sm bg-muted/5 border border-border/6 px-2 py-1.5 hover:bg-muted/10 cursor-pointer transition-all min-h-[36px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-foreground font-mono">{item.pair}</span>
                  <span className="text-2xs text-muted-foreground/30 bg-muted/10 rounded-sm px-1 font-mono">{item.tf}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xs font-mono text-muted-foreground/50">{item.price}</span>
                  <span className={`flex items-center gap-0.5 text-2xs font-bold font-mono ${item.chg > 0 ? "text-profit" : "text-loss"}`}>
                    {item.chg > 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                    {item.chg > 0 ? "+" : ""}{item.chg}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="sm:col-span-1 md:col-span-3 rounded-sm border border-border/8 bg-card p-2.5">
          <div className="flex items-center gap-1.5 mb-2">
            <Target className="h-3 w-3 text-primary" />
            <span className="text-2xs font-semibold text-foreground font-mono">DAILY GOALS</span>
          </div>
          <div className="space-y-3">
            <GoalBar label="יעד רווח" current={1247} target={2000} unit="$" />
            <GoalBar label="עסקאות" current={2} target={5} unit="" />
            <GoalBar label="Win Rate" current={100} target={65} unit="%" exceeded />
          </div>
        </div>


        {/* News Guard */}
        <div className="sm:col-span-1 md:col-span-3 rounded-sm border border-loss/15 bg-loss/[0.02] p-2.5">
          <div className="flex items-center gap-1.5 mb-2">
            <Newspaper className="h-3 w-3 text-loss" />
            <span className="text-2xs font-semibold text-foreground font-mono">NEWS GUARD</span>
          </div>
          <NewsCountdown />
          <div className="mt-2 rounded-sm border border-loss/10 bg-loss/[0.03] p-2">
            <p className="text-2xs text-muted-foreground/50 leading-relaxed">
              <span className="text-loss font-semibold">CPI</span> — נעילה <span className="text-loss font-semibold font-mono">10 דק׳</span> לפני ההודעה.
            </p>
          </div>
          <div className="mt-2 space-y-0.5">
            {[
              { name: "🔴 CPI — US", time: "15:30", critical: true },
              { name: "🟡 FOMC Minutes", time: "21:00", critical: false },
            ].map((ev, i) => (
              <div key={i} className={`flex items-center justify-between rounded-sm px-2 py-1 text-2xs ${ev.critical ? "bg-loss/6 border border-loss/10" : "bg-muted/8"}`}>
                <span className="text-foreground/60">{ev.name}</span>
                <span className={`font-mono ${ev.critical ? "text-loss font-semibold" : "text-muted-foreground/40"}`}>{ev.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Row 4: Recent Trades ===== */}
      <div className="rounded-sm border border-border/8 bg-card p-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-primary" />
            <span className="text-2xs font-semibold text-foreground font-mono">RECENT TRADES</span>
          </div>
          <button className="flex items-center gap-0.5 text-2xs text-primary font-medium hover:underline">
            הכל
            <ChevronLeft className="h-2.5 w-2.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[480px]">
            <thead>
              <tr className="border-b border-border/8 text-2xs text-muted-foreground/40 font-mono">
                <th className="pb-1.5 pr-2 font-medium">ASSET</th>
                <th className="pb-1.5 font-medium">DIR</th>
                <th className="pb-1.5 font-medium">ENTRY</th>
                <th className="pb-1.5 font-medium">EXIT</th>
                <th className="pb-1.5 font-medium">P&L</th>
                <th className="pb-1.5 pl-2 font-medium">TIME</th>
              </tr>
            </thead>
            <tbody className="text-2xs">
              {recentTrades.map((t, i) => (
                <tr key={i} className="border-b border-border/6 last:border-0 hover:bg-muted/5 transition-colors">
                  <td className="py-1.5 pr-2 font-semibold text-foreground font-mono">{t.pair}</td>
                  <td>
                    <span className={`inline-flex items-center gap-0.5 rounded-sm px-1 py-0.5 text-2xs font-semibold font-mono ${
                      t.dir === "Long" ? "bg-profit/8 text-profit" : "bg-loss/8 text-loss"
                    }`}>
                      {t.dir === "Long" ? <ArrowUpRight className="h-2 w-2" /> : <ArrowDownRight className="h-2 w-2" />}
                      {t.dir === "Long" ? "L" : "S"}
                    </span>
                  </td>
                  <td className="text-muted-foreground/50 font-mono">{t.entry}</td>
                  <td className="text-muted-foreground/50 font-mono">{t.exit}</td>
                  <td className={`font-bold font-mono ${t.pnl > 0 ? "text-profit" : "text-loss"}`}>
                    {t.pnl > 0 ? "+" : ""}{t.pnl}$
                  </td>
                  <td className="py-1.5 pl-2 text-muted-foreground/40 font-mono">{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex items-center gap-1 rounded-sm bg-primary/[0.03] border border-primary/6 px-2 py-1.5">
          <Zap className="h-2.5 w-2.5 text-primary/50" />
          <span className="text-2xs text-muted-foreground/40">העסקאות מיובאות אוטומטית מחשבון הברוקר</span>
        </div>
      </div>
    </div>
  );
};

/* ===== Sub Components ===== */

const TiltGauge = ({ value }: { value: number }) => {
  const angle = -90 + (value / 100) * 180;
  const getColor = () => {
    if (value < 35) return "hsl(var(--profit))";
    if (value < 65) return "hsl(45 90% 55%)";
    return "hsl(var(--loss))";
  };

  return (
    <div className="relative w-24 h-14 overflow-hidden">
      <svg viewBox="0 0 120 70" className="w-full h-full">
        <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" strokeLinecap="round" />
        <path d="M 10 65 A 50 50 0 0 1 43 18" fill="none" stroke="hsl(var(--profit))" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
        <path d="M 43 18 A 50 50 0 0 1 77 18" fill="none" stroke="hsl(45 90% 55%)" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
        <path d="M 77 18 A 50 50 0 0 1 110 65" fill="none" stroke="hsl(var(--loss))" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
        <line x1="60" y1="65" x2="60" y2="22" stroke={getColor()} strokeWidth="2" strokeLinecap="round" transform={`rotate(${angle}, 60, 65)`} style={{ transition: "all 1s ease-out" }} />
        <circle cx="60" cy="65" r="3.5" fill={getColor()} />
      </svg>
    </div>
  );
};

const GoalBar = ({ label, current, target, unit, exceeded }: {
  label: string; current: number; target: number; unit: string; exceeded?: boolean;
}) => {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-2xs font-medium text-foreground/60">{label}</span>
        <span className="text-2xs text-muted-foreground/40 font-mono">
          {unit === "$" ? `$${current}` : `${current}${unit}`} / {unit === "$" ? `$${target}` : `${target}${unit}`}
        </span>
      </div>
      <div className="h-1 w-full rounded-sm bg-muted/15">
        <div className="h-1 rounded-sm bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      {exceeded && <p className="text-2xs text-profit mt-0.5 font-mono">🎯 TARGET EXCEEDED</p>}
    </div>
  );
};

const NewsCountdown = () => {
  const [seconds, setSeconds] = useState(45 * 60 + 20);

  useEffect(() => {
    const interval = setInterval(() => { setSeconds((s) => (s > 0 ? s - 1 : 0)); }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center justify-center gap-1.5 my-2" dir="ltr">
      {[
        { val: pad(hrs), label: "H" },
        { val: pad(mins), label: "M" },
        { val: pad(secs), label: "S" },
      ].map((t, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="rounded-sm bg-loss/8 border border-loss/15 px-2 py-1.5 min-w-[36px] text-center">
            <span className="font-mono text-sm font-bold text-loss">{t.val}</span>
          </div>
          <span className="text-2xs text-muted-foreground/30 mt-0.5 font-mono">{t.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ===== Static Data ===== */
const chartData = Array.from({ length: 50 }, (_, i) => ({
  body: 12 + Math.sin(i * 0.3) * 15 + Math.random() * 20,
  wick: 3 + Math.random() * 12,
  lwick: 2 + Math.random() * 10,
  bull: Math.random() > (i > 30 ? 0.35 : 0.5),
}));

const watchlist = [
  { pair: "EUR/USD", price: "1.0847", chg: 0.12, tf: "M15" },
  { pair: "BTC/USDT", price: "67,234", chg: -1.3, tf: "H1" },
  { pair: "NQ", price: "18,432", chg: 0.45, tf: "M5" },
  { pair: "GBP/JPY", price: "192.34", chg: -0.28, tf: "M30" },
  { pair: "GOLD", price: "2,342", chg: 0.67, tf: "H4" },
];

const recentTrades = [
  { pair: "EUR/USD", dir: "Long", entry: "1.0832", exit: "1.0851", pnl: 342, time: "10:32" },
  { pair: "BTC/USDT", dir: "Short", entry: "67,890", exit: "67,801", pnl: 89, time: "11:15" },
  { pair: "NQ", dir: "Long", entry: "18,390", exit: "18,320", pnl: -210, time: "13:45" },
  { pair: "GBP/JPY", dir: "Short", entry: "192.80", exit: "192.52", pnl: 128, time: "14:20" },
  { pair: "EUR/USD", dir: "Long", entry: "1.0840", exit: "1.0898", pnl: 898, time: "15:45" },
];

export default HomeDashboard;
