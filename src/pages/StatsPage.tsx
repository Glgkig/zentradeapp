import {
  TrendingUp, TrendingDown, Clock, Target,
  BarChart3, Activity, Zap, PieChart, Calendar, ArrowUpRight, ArrowDownRight,
  Brain, FolderOpen,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart as RePieChart, Pie,
} from "recharts";
import { useTrades, useTradeStats } from "@/hooks/useTrades";

interface TooltipEntry { value: number; name: string; payload: Record<string, unknown>; fill?: string; }
interface ChartTooltipProps { active?: boolean; payload?: TooltipEntry[]; label?: string; }

/* ===== Custom Tooltip ===== */
const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#111116] px-3 py-2 shadow-xl text-right">
      <p className="text-[11px] font-bold text-foreground mb-0.5">{label}</p>
      <p className="text-[10px] text-profit font-mono font-bold">{payload[0].value}%</p>
    </div>
  );
};

const PieTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#111116] px-3 py-2 shadow-xl text-right">
      <p className="text-[11px] font-bold text-foreground">{payload[0].name}</p>
      <p className="text-[10px] font-mono font-bold" style={{ color: payload[0].payload.fill }}>
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  );
};

const heatCellColor = (pnl: number) => {
  if (pnl >= 500) return "bg-profit/80 shadow-[0_0_6px_rgba(0,212,170,0.4)]";
  if (pnl >= 250) return "bg-profit/55";
  if (pnl >= 100) return "bg-profit/32";
  if (pnl > 0) return "bg-profit/16";
  if (pnl === 0) return "bg-white/[0.03]";
  if (pnl >= -100) return "bg-loss/16";
  if (pnl >= -250) return "bg-loss/32";
  return "bg-loss/55 shadow-[0_0_6px_rgba(239,68,68,0.3)]";
};

/* ===== Main Page ===== */
const StatsPage = () => {
  const { data: trades = [], isLoading } = useTrades();
  const stats = useTradeStats();
  const hasTrades = trades.filter(t => t.status === "closed").length > 0;

  // Compute real data
  const closedTrades = trades.filter(t => t.status === "closed");

  // Avg hold time
  const avgHoldTime = (() => {
    const withExit = closedTrades.filter(t => t.exit_time);
    if (withExit.length === 0) return "—";
    const totalMs = withExit.reduce((s, t) => s + (new Date(t.exit_time!).getTime() - new Date(t.entry_time).getTime()), 0);
    const avgMin = Math.round(totalMs / withExit.length / 60000);
    if (avgMin < 60) return `${avgMin} דק׳`;
    return `${Math.floor(avgMin / 60)} שע׳ ${avgMin % 60} דק׳`;
  })();

  // Max drawdown
  const maxDrawdown = (() => {
    if (closedTrades.length === 0) return "—";
    let peak = 0, dd = 0, maxDd = 0;
    closedTrades.sort((a, b) => new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()).forEach(t => {
      peak += t.pnl ?? 0;
      if (peak > dd) dd = peak;
      const cur = dd - peak;
      if (cur > maxDd) maxDd = cur;
    });
    return maxDd > 0 ? `-$${maxDd.toLocaleString()}` : "$0";
  })();

  // Day of week win rate
  const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"];
  const dayOfWeekData = dayNames.map((name, i) => {
    const dayTrades = closedTrades.filter(t => new Date(t.entry_time).getDay() === i);
    const wins = dayTrades.filter(t => (t.pnl ?? 0) > 0);
    return { name, winRate: dayTrades.length > 0 ? Math.round((wins.length / dayTrades.length) * 100) : 0 };
  });

  // Long vs Short
  const longPnl = closedTrades.filter(t => t.direction === "long").reduce((s, t) => s + Math.abs(t.pnl ?? 0), 0);
  const shortPnl = closedTrades.filter(t => t.direction === "short").reduce((s, t) => s + Math.abs(t.pnl ?? 0), 0);
  const totalPnlAbs = longPnl + shortPnl;
  const longPct = totalPnlAbs > 0 ? Math.round((longPnl / totalPnlAbs) * 100) : 50;

  const longShortData = [
    { name: "Long", value: longPnl, fill: "hsl(var(--profit))" },
    { name: "Short", value: shortPnl, fill: "hsl(var(--loss))" },
  ];

  // Heatmap
  const heatDays = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const heatHours = Array.from({ length: 17 }, (_, i) => i + 6);
  const heatMap: Record<string, number[]> = {};
  heatDays.forEach(day => { heatMap[day] = new Array(17).fill(0); });
  closedTrades.forEach(t => {
    const d = new Date(t.entry_time);
    const dayIdx = d.getDay();
    const dayName = heatDays[dayIdx === 0 ? 0 : dayIdx === 6 ? 6 : dayIdx];
    const hour = d.getHours();
    if (hour >= 6 && hour <= 22) {
      heatMap[dayName][hour - 6] += t.pnl ?? 0;
    }
  });

  const topMetrics = [
    { label: "תוחלת חיובית", sublabel: "EXPECTANCY", value: stats.totalTrades > 0 ? `${stats.totalPnl >= 0 ? "+" : ""}$${(stats.totalPnl / stats.totalTrades).toFixed(2)}` : "—", sub: "ממוצע לעסקה", color: "text-profit", icon: <TrendingUp className="h-4 w-4" />, glow: "profit" },
    { label: "גורם רווח", sublabel: "PROFIT FACTOR", value: stats.profitFactor > 0 ? stats.profitFactor.toFixed(1) : "—", sub: "רווח ÷ הפסד", color: "text-profit", icon: <BarChart3 className="h-4 w-4" />, glow: "profit" },
    { label: "Drawdown מקסימלי", sublabel: "MAX DRAWDOWN", value: maxDrawdown, sub: "שפל", color: "text-loss", icon: <TrendingDown className="h-4 w-4" />, glow: "loss" },
    { label: "זמן ממוצע בעסקה", sublabel: "AVG HOLD TIME", value: avgHoldTime, sub: "מכניסה ליציאה", color: "text-primary", icon: <Clock className="h-4 w-4" />, glow: "primary" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!hasTrades) {
    return (
      <div className="mx-auto max-w-[1100px] space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-lg md:text-xl font-bold text-foreground">סטטיסטיקות וביצועים</h1>
            <p className="text-2xs text-muted-foreground/40">Analytics & Performance Engine</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-primary/[0.08] blur-[30px] animate-pulse" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <FolderOpen className="h-9 w-9 text-primary/40" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">אין נתונים סטטיסטיים עדיין</h2>
          <p className="text-sm text-muted-foreground/50 max-w-md leading-relaxed">
            הוסיפו עסקאות סגורות כדי לראות ניתוח ביצועים מפורט, מפת חום, והתפלגות לונג/שורט.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-foreground">סטטיסטיקות וביצועים</h1>
          <p className="text-2xs text-muted-foreground/40">Analytics & Performance Engine</p>
        </div>
      </div>

      {/* 1. TOP METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {topMetrics.map((m) => (
          <div key={m.sublabel} className={`relative rounded-2xl border overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl
            ${m.glow === "profit" ? "border-profit/12 bg-gradient-to-br from-profit/[0.04] to-transparent hover:shadow-profit/10"
            : m.glow === "loss" ? "border-loss/12 bg-gradient-to-br from-loss/[0.04] to-transparent hover:shadow-loss/10"
            : "border-primary/12 bg-gradient-to-br from-primary/[0.04] to-transparent hover:shadow-primary/10"}`}
          >
            {/* Top accent line */}
            <div className={`h-[2px] w-full ${
              m.glow === "profit" ? "bg-gradient-to-l from-transparent via-profit/40 to-transparent"
              : m.glow === "loss" ? "bg-gradient-to-l from-transparent via-loss/40 to-transparent"
              : "bg-gradient-to-l from-transparent via-primary/40 to-transparent"
            }`} />
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] text-muted-foreground/35 font-mono uppercase tracking-wider">{m.sublabel}</span>
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg opacity-60 ${
                  m.glow === "profit" ? "bg-profit/12" : m.glow === "loss" ? "bg-loss/12" : "bg-primary/12"
                }`}>
                  <div className={m.color}>{m.icon}</div>
                </div>
              </div>
              <p className={`text-[18px] sm:text-[22px] font-black font-mono leading-none mb-1 truncate ${m.color}`}>{m.value}</p>
              <p className="text-[10px] font-semibold text-foreground/55">{m.label}</p>
              <p className="text-[9px] text-muted-foreground/30 mt-0.5 hidden sm:block">{m.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. HEATMAP */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-3 md:p-4 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-48 h-32 bg-primary/[0.03] rounded-full blur-[80px] pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/12">
                <Calendar className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <div>
                <h2 className="text-[12px] font-bold text-foreground">מפת רווחיות — יום × שעה</h2>
                <p className="text-[8px] text-muted-foreground/30 font-mono">PERFORMANCE HEATMAP</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-none">
            <div className="min-w-[480px]">
              <div className="flex items-center gap-px mr-14 mb-px">
                {heatHours.map(h => (
                  <div key={h} className="flex-1 text-center text-[7px] text-muted-foreground/25 font-mono py-0.5">{h.toString().padStart(2, "0")}</div>
                ))}
              </div>
              {heatDays.map(day => {
                const row = heatMap[day];
                const total = row.reduce((s, v) => s + v, 0);
                return (
                  <div key={day} className="flex items-center gap-px mb-px">
                    <div className="w-14 shrink-0 flex items-center justify-between pr-1">
                      <span className="text-[9px] text-foreground/50 font-medium">{day}</span>
                      <span className={`text-[7px] font-bold font-mono ${total >= 0 ? "text-profit/60" : "text-loss/60"}`}>
                        {total !== 0 ? `${total >= 0 ? "+" : ""}${total}` : ""}
                      </span>
                    </div>
                    {row.map((pnl, i) => (
                      <div key={i} className={`flex-1 h-6 md:h-7 rounded-[3px] flex items-center justify-center cursor-pointer transition-all hover:scale-110 hover:z-10 ${heatCellColor(pnl)}`}
                        title={`${day} ${(i + 6).toString().padStart(2, "0")}:00 — ${pnl === 0 ? "ריק" : `${pnl > 0 ? "+" : ""}$${pnl}`}`}>
                        {pnl !== 0 && (
                          <span className={`text-[6px] font-bold font-mono ${pnl > 0 ? "text-profit" : "text-loss"}`}>
                            {pnl > 0 ? "+" : ""}{pnl}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHARTS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bar Chart: Performance by Day */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-profit/[0.03] rounded-full blur-[60px] pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-profit/8 border border-profit/12">
                <BarChart3 className="h-4 w-4 text-profit/70" />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-foreground">ביצועים לפי ימי השבוע</h2>
                <p className="text-2xs text-muted-foreground/30 font-mono">WIN RATE BY DAY</p>
              </div>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData} barCategoryGap="20%">
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground) / 0.4)", fontSize: 10 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground) / 0.25)", fontSize: 9 }} tickFormatter={v => `${v}%`} width={35} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.06)" }} />
                  <Bar dataKey="winRate" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {dayOfWeekData.map((entry, i) => (
                      <Cell key={i} fill={entry.winRate >= 50 ? "hsl(var(--profit))" : "hsl(var(--loss))"} fillOpacity={entry.winRate >= 50 ? 0.7 : 0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Donut: Long vs Short */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-5 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/[0.03] rounded-full blur-[60px] pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/8 border border-primary/12">
                <PieChart className="h-4 w-4 text-primary/70" />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-foreground">לונג מול שורט</h2>
                <p className="text-2xs text-muted-foreground/30 font-mono">LONG VS SHORT P&L</p>
              </div>
            </div>
            <div className="h-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={longShortData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {longShortData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-black font-mono text-foreground">{stats.winRate.toFixed(0)}%</p>
                <p className="text-2xs text-muted-foreground/40">Win Rate</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="rounded-xl bg-profit/[0.04] border border-profit/10 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <ArrowUpRight className="h-3 w-3 text-profit" />
                  <span className="text-2xs text-muted-foreground/40">Long</span>
                </div>
                <p className="text-[15px] font-black font-mono text-profit">${longPnl.toLocaleString()}</p>
                <p className="text-[8px] text-profit/50 font-mono">{longPct}%</p>
              </div>
              <div className="rounded-xl bg-loss/[0.04] border border-loss/10 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <ArrowDownRight className="h-3 w-3 text-loss" />
                  <span className="text-2xs text-muted-foreground/40">Short</span>
                </div>
                <p className="text-[15px] font-black font-mono text-loss">${shortPnl.toLocaleString()}</p>
                <p className="text-[8px] text-loss/50 font-mono">{100 - longPct}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
