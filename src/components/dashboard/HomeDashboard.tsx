import { useState } from "react";
import {
  Brain, TrendingUp, Flame, Target, ArrowUpRight, ArrowDownRight,
  Sparkles, Loader2, BarChart3, Crosshair, Zap, Plug,
  FolderOpen,
} from "lucide-react";
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useTrades, useTradeStats } from "@/hooks/useTrades";

/* ── Market Hours Logic (Israel Time) ── */
function getMarketStatus(): { open: boolean; label: string } {
  const now = new Date();
  const israelStr = now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" });
  const israel = new Date(israelStr);
  const day = israel.getDay();
  const hours = israel.getHours();
  const minutes = israel.getMinutes();
  const timeNum = hours * 60 + minutes;

  const isUsDST = (() => {
    const month = israel.getMonth();
    if (month > 2 && month < 10) return true;
    if (month === 2) return israel.getDate() >= 10;
    if (month === 10) return israel.getDate() <= 3;
    return false;
  })();

  const isSaturday = day === 6;
  const isFriday = day === 5;
  const isSunday = day === 0;

  const forexOpen = (() => {
    if (isSaturday) return false;
    if (isFriday && timeNum >= 23 * 60) return false;
    if (isSunday && timeNum < 23 * 60) return false;
    return true;
  })();

  const usOpenMin = isUsDST ? 16 * 60 + 30 : 17 * 60 + 30;
  const usCloseMin = isUsDST ? 23 * 60 : 24 * 60;
  const isWeekday = day >= 1 && day <= 5;
  const usOpen = isWeekday && timeNum >= usOpenMin && timeNum < usCloseMin;

  if (!forexOpen) return { open: false, label: "השוק סגור — סוף שבוע" };
  if (usOpen) return { open: true, label: "השוק פתוח — וול סטריט פעיל" };
  if (isWeekday && timeNum < usOpenMin) {
    const hLeft = Math.floor((usOpenMin - timeNum) / 60);
    const mLeft = (usOpenMin - timeNum) % 60;
    return { open: true, label: `פורקס פתוח — וול סטריט נפתח בעוד ${hLeft > 0 ? hLeft + " שעות " : ""}${mLeft} דקות` };
  }
  return { open: true, label: "פורקס פתוח" };
}

/* ── Empty State ── */
const DashboardEmptyState = ({ onConnectBroker }: { onConnectBroker: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
    {/* Glowing icon */}
    <div className="relative mb-6">
      <div className="absolute -inset-4 rounded-full bg-primary/[0.08] blur-[30px] animate-pulse" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
        <FolderOpen className="h-9 w-9 text-primary/40" />
      </div>
    </div>

    <h2 className="text-lg md:text-xl font-bold text-foreground mb-2">היומן שלכם ריק</h2>
    <p className="text-sm text-muted-foreground/50 max-w-md mb-8 leading-relaxed">
      הגיע הזמן להתחיל לתעד את המסע שלכם. חברו את חשבון המסחר שלכם כדי לסנכרן עסקאות אוטומטית ולקבל תובנות AI.
    </p>

    <button
      onClick={onConnectBroker}
      className="haptic-press flex items-center gap-2.5 rounded-2xl bg-primary text-primary-foreground px-6 py-3.5 text-sm font-bold transition-all hover:bg-primary/90 cyan-glow min-h-[48px]"
    >
      <Plug className="h-4.5 w-4.5" />
      חברו את חשבון המסחר (Broker)
    </button>

    <p className="text-[10px] text-muted-foreground/25 mt-4 font-mono">או הוסיפו עסקה ידנית מכפתור ״עסקה חדשה״</p>
  </div>
);

/* ── Component ── */
const HomeDashboard = ({ userName, onOpenTrade, onConnectBroker }: { userName: string; onOpenTrade?: () => void; onConnectBroker?: () => void }) => {
  const marketStatus = getMarketStatus();
  const { userProfile } = useUserProfile();
  const [aiBriefing, setAiBriefing] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Real data from DB
  const { data: trades = [], isLoading } = useTrades();
  const stats = useTradeStats();

  const hasTrades = trades.length > 0;

  // Build monthly P&L from real data
  const monthlyData = (() => {
    if (!hasTrades) return [];
    const months: Record<string, number> = {};
    const closedTrades = trades.filter(t => t.status === "closed" && t.pnl != null);
    closedTrades.forEach(t => {
      const d = new Date(t.entry_time);
      const key = d.toLocaleDateString("he-IL", { month: "short", year: "2-digit" });
      months[key] = (months[key] || 0) + (t.pnl ?? 0);
    });
    return Object.entries(months).map(([month, pnl]) => ({ month, pnl })).reverse().slice(0, 12);
  })();

  // Build setup performance from real data
  const setupData = (() => {
    if (!hasTrades) return [];
    const map: Record<string, { pnl: number; wins: number; total: number }> = {};
    trades.filter(t => t.status === "closed" && t.setup_type).forEach(t => {
      const name = t.setup_type!;
      if (!map[name]) map[name] = { pnl: 0, wins: 0, total: 0 };
      map[name].pnl += t.pnl ?? 0;
      map[name].total += 1;
      if ((t.pnl ?? 0) > 0) map[name].wins += 1;
    });
    return Object.entries(map).map(([name, d]) => ({
      name,
      pnl: d.pnl,
      wr: d.total > 0 ? Math.round((d.wins / d.total) * 100) : 0,
      trades: d.total,
    })).sort((a, b) => b.pnl - a.pnl).slice(0, 5);
  })();

  // Recent trades (last 5)
  const recentTrades = trades.slice(0, 5);

  const handleAiAnalyst = async () => {
    setAiLoading(true);
    setAiBriefing("");
    try {
      const { data, error } = await supabase.functions.invoke("dashboard-ai-analyst", {
        body: {
          winRate: stats.winRate,
          profitFactor: stats.profitFactor,
          totalPnl: stats.totalPnl,
        },
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
    <div className="mx-auto max-w-[1400px] space-y-4 p-2 md:p-4">

      {/* ═══════ TOP: Welcome ═══════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground tracking-tight">
            שלום, {userName}. <span className={marketStatus.open ? "text-primary" : "text-destructive"}>{marketStatus.label}</span>
          </h1>
          {userProfile.weakness && (
            <p className="text-xs text-accent/70 mt-1 font-medium">
              🎯 זכור — המטרה שלך היום היא להתגבר על ה-{
                userProfile.weakness === "overtrading" ? "Overtrading" :
                userProfile.weakness === "fomo" ? "FOMO" :
                userProfile.weakness === "cutting-winners" ? "חיתוך רווחים מוקדם" :
                userProfile.weakness === "moving-sl" ? "הזזת סטופ-לוס" : ""
              }.
            </p>
          )}
          <p className="text-xs text-muted-foreground/50 mt-0.5 font-mono">
            {new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {hasTrades && !aiBriefing ? (
          <button
            onClick={handleAiAnalyst}
            disabled={aiLoading}
            className="haptic-press flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-2.5 text-primary hover:bg-primary/15 hover:border-primary/30 transition-all group"
          >
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 group-hover:animate-pulse" />}
            <span className="text-xs font-bold">{aiLoading ? "מנתח..." : "✨ קבל סקירת אנליסט AI"}</span>
          </button>
        ) : null}
      </div>

      {/* AI Insight Banner */}
      {aiBriefing && (
        <div className="relative rounded-2xl border border-primary/15 bg-primary/[0.04] backdrop-blur-md p-4 overflow-hidden">
          <div className="absolute top-0 left-0 w-60 h-60 bg-primary/[0.06] rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/[0.04] rounded-full blur-[60px]" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 shrink-0 mt-0.5">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-2xs font-bold text-primary/60 font-mono mb-1">AI INSIGHT</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{aiBriefing}</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ EMPTY STATE ═══════ */}
      {!isLoading && !hasTrades && (
        <DashboardEmptyState onConnectBroker={onConnectBroker || (() => {})} />
      )}

      {/* ═══════ KPI CARDS (only with data) ═══════ */}
      {hasTrades && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Monthly P&L */}
            <div className="group rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-4 hover:border-primary/20 hover:bg-card/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xs text-muted-foreground/50 font-medium">רווח כולל</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <p className={`text-2xl font-bold font-mono tracking-tight ${stats.totalPnl >= 0 ? "text-primary" : "text-destructive"}`}>
                {stats.totalPnl >= 0 ? "+" : ""}${Math.abs(stats.totalPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-2xs text-muted-foreground/40 font-mono">{stats.totalTrades} עסקאות סגורות</span>
              </div>
            </div>

            {/* Win Rate */}
            <div className="group rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-4 hover:border-primary/20 hover:bg-card/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xs text-muted-foreground/50 font-medium">אחוז הצלחה</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-primary font-mono tracking-tight">{stats.winRate.toFixed(0)}%</p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-2xs text-muted-foreground/40 font-mono">{stats.totalTrades} עסקאות</span>
              </div>
            </div>

            {/* Profit Factor */}
            <div className="group rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-4 hover:border-primary/20 hover:bg-card/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xs text-muted-foreground/50 font-medium">יחס סיכוי-סיכון</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/50">
                  <BarChart3 className="h-3.5 w-3.5 text-foreground/60" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground font-mono tracking-tight">{stats.profitFactor.toFixed(1)}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-2xs text-muted-foreground/40 font-mono">Profit Factor</span>
              </div>
            </div>

            {/* Open Trades */}
            <div className="group rounded-2xl border border-accent/15 bg-accent/[0.04] backdrop-blur-md p-4 hover:border-accent/25 hover:bg-accent/[0.07] transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xs text-muted-foreground/50 font-medium">עסקאות פתוחות</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                  <Flame className="h-3.5 w-3.5 text-accent" />
                </div>
              </div>
              <p className="text-2xl font-bold text-accent font-mono tracking-tight">{stats.openTrades}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-2xs text-accent/50 font-mono">פוזיציות חיות</span>
              </div>
            </div>
          </div>

          {/* ═══════ MIDDLE ROW: Equity + Setups ═══════ */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            {/* Monthly P&L Bar Chart — 3/5 */}
            <div className="lg:col-span-3 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">רווח / הפסד חודשי</span>
                </div>
                <span className="text-2xs text-muted-foreground/30 font-mono">מבוסס נתונים אמיתיים</span>
              </div>
              {monthlyData.length > 0 ? (
                <div className="h-[220px] -mr-2 -ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} interval={0} />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: "hsl(220, 6%, 14%)", opacity: 0.5 }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const val = payload[0].value as number;
                          const positive = val >= 0;
                          return (
                            <div className="rounded-lg border border-border/50 bg-card/90 backdrop-blur-md px-3 py-2 shadow-xl">
                              <p className="text-2xs text-muted-foreground/60 font-mono">{payload[0].payload.month}</p>
                              <p className={`text-sm font-bold font-mono ${positive ? "text-primary" : "text-destructive"}`}>
                                {positive ? "+" : ""}${Math.abs(val).toLocaleString()}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="pnl" radius={[6, 6, 0, 0]} maxBarSize={36}>
                        {monthlyData.map((entry, index) => (
                          <Cell key={index} fill={entry.pnl >= 0 ? "hsl(160, 100%, 42%)" : "hsl(0, 72%, 55%)"} fillOpacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[220px] flex items-center justify-center">
                  <p className="text-xs text-muted-foreground/30">אין נתונים חודשיים עדיין</p>
                </div>
              )}
            </div>

            {/* Setup Performance — 2/5 */}
            <div className="lg:col-span-2 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-4">
              <div className="flex items-center gap-2 mb-4">
                <Crosshair className="h-4 w-4 text-accent" />
                <span className="text-sm font-bold text-foreground">ביצועי סטאפים</span>
              </div>
              {setupData.length > 0 ? (
                <div className="space-y-2.5">
                  {setupData.map((s, i) => {
                    const positive = s.pnl >= 0;
                    return (
                      <div key={i} className="group flex items-center justify-between rounded-xl border border-border/20 bg-card/30 px-3 py-2.5 hover:bg-card/60 transition-all">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${positive ? "bg-primary/10" : "bg-destructive/10"}`}>
                            <Zap className={`h-3.5 w-3.5 ${positive ? "text-primary" : "text-destructive"}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{s.name}</p>
                            <p className="text-2xs text-muted-foreground/40 font-mono">{s.trades} עסקאות · {s.wr}% WR</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold font-mono shrink-0 ${positive ? "text-primary" : "text-destructive"}`}>
                          {positive ? "+" : ""}${Math.abs(s.pnl).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Crosshair className="h-6 w-6 text-muted-foreground/15 mb-2" />
                  <p className="text-xs text-muted-foreground/30">הוסיפו סטאפים לעסקאות לראות ביצועים</p>
                </div>
              )}
            </div>
          </div>

          {/* ═══════ BOTTOM: Recent Trades Table ═══════ */}
          <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground/60" />
                <span className="text-sm font-bold text-foreground">עסקאות אחרונות</span>
              </div>
              {onOpenTrade && (
                <button
                  onClick={onOpenTrade}
                  className="haptic-press flex items-center gap-1.5 rounded-lg border border-accent/20 bg-accent/[0.06] px-3 py-1.5 text-2xs font-bold text-accent hover:bg-accent/15 transition-all"
                >
                  <span>+ עסקה חדשה</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2 px-4 py-2 border-b border-border/10 text-2xs font-mono text-muted-foreground/40 uppercase tracking-wider">
              <span>נכס</span>
              <span>כיוון</span>
              <span>סטאפ</span>
              <span>תאריך</span>
              <span className="text-left">רווח / הפסד</span>
            </div>

            {recentTrades.length > 0 ? recentTrades.map((trade, i) => {
              const positive = (trade.pnl ?? 0) >= 0;
              return (
                <div key={trade.id} className="grid grid-cols-5 gap-2 px-4 py-3 border-b border-border/[0.06] hover:bg-card/40 transition-colors group">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/30">
                      <span className="text-2xs font-bold text-foreground/70 font-mono">{trade.symbol.slice(0, 2)}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground font-mono">{trade.symbol}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-2xs font-bold ${
                      trade.direction === "long" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                    }`}>
                      {trade.direction === "long" ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                      {trade.direction === "long" ? "Long" : "Short"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground/60 flex items-center">{trade.setup_type || "—"}</span>
                  <span className="text-xs text-muted-foreground/40 font-mono flex items-center">
                    {new Date(trade.entry_time).toLocaleDateString("he-IL", { day: "numeric", month: "short" })}
                  </span>
                  <span className={`text-sm font-bold font-mono flex items-center ${positive ? "text-primary" : "text-destructive"}`}>
                    {trade.pnl != null ? `${positive ? "+" : ""}$${Math.abs(trade.pnl).toLocaleString()}` : "—"}
                  </span>
                </div>
              );
            }) : (
              <div className="py-10 text-center">
                <p className="text-xs text-muted-foreground/30">אין עסקאות עדיין</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HomeDashboard;
