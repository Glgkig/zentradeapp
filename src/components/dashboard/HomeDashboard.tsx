import { useState } from "react";
import {
  Brain, TrendingUp, Flame, Target, Trophy, ArrowUpRight, ArrowDownRight,
  Sparkles, Loader2, BarChart3, Crosshair, Zap, ChevronLeft,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ── Monthly P&L data ── */
const monthlyData = [
  { month: "ינו׳", pnl: 1200 },
  { month: "פבר׳", pnl: 3800 },
  { month: "מרץ", pnl: -650 },
  { month: "אפר׳", pnl: 4250 },
  { month: "מאי", pnl: 2100 },
  { month: "יוני", pnl: -300 },
  { month: "יולי", pnl: 1850 },
  { month: "אוג׳", pnl: 3200 },
  { month: "ספט׳", pnl: 950 },
  { month: "אוק׳", pnl: 2700 },
  { month: "נוב׳", pnl: -420 },
  { month: "דצמ׳", pnl: 1600 },
];

/* ── Setup performance data ── */
const setups = [
  { name: "Liquidity Sweep", pnl: 2100, wr: 75, trades: 12 },
  { name: "FVG Entry", pnl: 1400, wr: 60, trades: 8 },
  { name: "BOS + Retracement", pnl: -300, wr: 40, trades: 5 },
  { name: "Order Block", pnl: 850, wr: 65, trades: 6 },
];

/* ── Recent trades ── */
const recentTrades = [
  { asset: "NAS100", direction: "Long", setup: "FVG", pnl: 450, time: "14:32" },
  { asset: "XAUUSD", direction: "Short", setup: "Liquidity Sweep", pnl: 120, time: "11:05" },
  { asset: "EURUSD", direction: "Long", setup: "Order Block", pnl: -85, time: "09:48" },
  { asset: "US30", direction: "Short", setup: "BOS + Retracement", pnl: 310, time: "16:21" },
  { asset: "GBPJPY", direction: "Long", setup: "FVG", pnl: -42, time: "08:15" },
];


/* ── Component ── */
const HomeDashboard = ({ userName, onOpenTrade }: { userName: string; onOpenTrade?: () => void }) => {
  const [aiBriefing, setAiBriefing] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiAnalyst = async () => {
    setAiLoading(true);
    setAiBriefing("");
    try {
      const { data, error } = await supabase.functions.invoke("dashboard-ai-analyst", {
        body: { winRate: 68, profitFactor: 1.8, totalPnl: 4250 },
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

      {/* ═══════ TOP: Welcome + AI Insight ═══════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground tracking-tight">
            שלום, {userName}. <span className="text-primary">השוק פתוח.</span>
          </h1>
          <p className="text-xs text-muted-foreground/50 mt-0.5 font-mono">
            {new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {!aiBriefing ? (
          <button
            onClick={handleAiAnalyst}
            disabled={aiLoading}
            className="haptic-press flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-2.5 text-primary hover:bg-primary/15 hover:border-primary/30 transition-all group"
          >
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
            )}
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

      {/* Static AI hint when no briefing loaded */}
      {!aiBriefing && !aiLoading && (
        <div className="rounded-2xl border border-accent/10 bg-accent/[0.03] backdrop-blur-md px-4 py-3 flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-accent shrink-0" />
          <p className="text-xs text-foreground/60">
            <span className="text-accent font-semibold">AI Insight:</span>{" "}
            אחוזי ההצלחה שלך גבוהים היום, אך העמלות נוגסות ברווח. הימנע מ-Overtrading.
          </p>
        </div>
      )}

      {/* ═══════ KPI CARDS ═══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Monthly P&L */}
        <div className="group rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-4 hover:border-primary/20 hover:bg-card/60 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xs text-muted-foreground/50 font-medium">רווח חודשי</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-primary font-mono tracking-tight">$4,250</p>
          <div className="flex items-center gap-1 mt-1.5">
            <ArrowUpRight className="h-3 w-3 text-primary" />
            <span className="text-2xs text-primary/70 font-mono font-semibold">+12% vs חודש שעבר</span>
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
          <p className="text-2xl font-bold text-primary font-mono tracking-tight">68%</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-2xs text-muted-foreground/40 font-mono">17 / 25 עסקאות</span>
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
          <p className="text-2xl font-bold text-foreground font-mono tracking-tight">1.8</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-2xs text-muted-foreground/40 font-mono">ממוצע חודשי</span>
          </div>
        </div>

        {/* Winning Streak */}
        <div className="group rounded-2xl border border-accent/15 bg-accent/[0.04] backdrop-blur-md p-4 hover:border-accent/25 hover:bg-accent/[0.07] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xs text-muted-foreground/50 font-medium">רצף מנצח</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
              <Flame className="h-3.5 w-3.5 text-accent" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-accent font-mono tracking-tight">4</p>
            <span className="text-sm text-accent/60 font-medium">ימים</span>
            <span className="text-lg">🔥</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <Trophy className="h-3 w-3 text-accent/50" />
            <span className="text-2xs text-accent/50 font-mono">שיא אישי: 7 ימים</span>
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
            <span className="text-2xs text-muted-foreground/30 font-mono">2026 · שנתי</span>
          </div>
          <div className="h-[220px] -mr-2 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }}
                />
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
                          {positive ? "+" : ""}{"$"}{Math.abs(val).toLocaleString()}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="pnl" radius={[6, 6, 0, 0]} maxBarSize={36}>
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.pnl >= 0 ? "hsl(160, 100%, 42%)" : "hsl(0, 72%, 55%)"}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Setup Performance — 2/5 */}
        <div className="lg:col-span-2 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-4">
          <div className="flex items-center gap-2 mb-4">
            <Crosshair className="h-4 w-4 text-accent" />
            <span className="text-sm font-bold text-foreground">ביצועי סטאפים</span>
          </div>
          <div className="space-y-2.5">
            {setups.map((s, i) => {
              const positive = s.pnl >= 0;
              return (
                <div
                  key={i}
                  className="group flex items-center justify-between rounded-xl border border-border/20 bg-card/30 px-3 py-2.5 hover:bg-card/60 transition-all"
                >
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

        {/* Table header */}
        <div className="grid grid-cols-5 gap-2 px-4 py-2 border-b border-border/10 text-2xs font-mono text-muted-foreground/40 uppercase tracking-wider">
          <span>נכס</span>
          <span>כיוון</span>
          <span>מודל כניסה</span>
          <span>שעה</span>
          <span className="text-left">רווח / הפסד</span>
        </div>

        {/* Table rows */}
        {recentTrades.map((trade, i) => {
          const positive = trade.pnl >= 0;
          return (
            <div
              key={i}
              className="grid grid-cols-5 gap-2 px-4 py-3 border-b border-border/[0.06] hover:bg-card/40 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/30">
                  <span className="text-2xs font-bold text-foreground/70 font-mono">
                    {trade.asset.slice(0, 2)}
                  </span>
                </div>
                <span className="text-xs font-semibold text-foreground font-mono">{trade.asset}</span>
              </div>

              <div className="flex items-center">
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-2xs font-bold ${
                  trade.direction === "Long"
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {trade.direction === "Long" ? (
                    <ArrowUpRight className="h-2.5 w-2.5" />
                  ) : (
                    <ArrowDownRight className="h-2.5 w-2.5" />
                  )}
                  {trade.direction}
                </span>
              </div>

              <span className="text-xs text-muted-foreground/60 flex items-center">{trade.setup}</span>

              <span className="text-xs text-muted-foreground/40 font-mono flex items-center">{trade.time}</span>

              <span className={`text-sm font-bold font-mono flex items-center ${positive ? "text-primary" : "text-destructive"}`}>
                {positive ? "+" : ""}${Math.abs(trade.pnl)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeDashboard;
