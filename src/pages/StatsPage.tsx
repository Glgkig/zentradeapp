import { useMemo } from "react";
import {
  TrendingUp, TrendingDown, Clock, Target, Flame, Brain,
  BarChart3, Activity, Zap, PieChart, Calendar, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart as RePieChart, Pie,
} from "recharts";

/* ===== Mock Data ===== */
const topMetrics = [
  { label: "תוחלת חיובית", sublabel: "EXPECTANCY", value: "+$45.20", sub: "ממוצע לעסקה", color: "text-profit", icon: <TrendingUp className="h-4 w-4" />, glow: "profit" },
  { label: "גורם רווח", sublabel: "PROFIT FACTOR", value: "2.1", sub: "רווח ÷ הפסד", color: "text-profit", icon: <BarChart3 className="h-4 w-4" />, glow: "profit" },
  { label: "Drawdown מקסימלי", sublabel: "MAX DRAWDOWN", value: "-8.5%", sub: "שפל חודשי", color: "text-loss", icon: <TrendingDown className="h-4 w-4" />, glow: "loss" },
  { label: "זמן ממוצע בעסקה", sublabel: "AVG HOLD TIME", value: "45 דק׳", sub: "מכניסה ליציאה", color: "text-primary", icon: <Clock className="h-4 w-4" />, glow: "primary" },
];

// Day×Hour heatmap data (06:00–22:00)
const heatDays = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const heatHours = Array.from({ length: 17 }, (_, i) => i + 6); // 6..22
const heatMap: Record<string, number[]> = {
  "ראשון":  [0,120,250,80,0,-45,180,60,-190,-75,45,0,-30,0,0,0,0],
  "שני":    [0,90,160,310,55,0,70,-80,-280,-150,0,65,-40,0,0,0,0],
  "שלישי":  [0,340,95,200,130,40,0,-60,-170,15,85,0,-25,50,0,0,0],
  "רביעי":  [0,0,145,75,290,110,50,0,-95,-320,0,35,0,-55,0,0,0],
  "חמישי":  [0,185,270,150,60,0,-110,-200,-350,-85,0,0,70,0,-40,0,0],
  "שישי":   [0,0,0,95,140,0,60,0,0,-45,120,80,0,-35,0,0,0],
  "שבת":    [0,0,0,0,0,0,0,0,75,110,0,55,-60,0,0,0,0],
};

const heatCellColor = (pnl: number) => {
  if (pnl >= 250) return "bg-profit/55";
  if (pnl >= 100) return "bg-profit/30";
  if (pnl > 0) return "bg-profit/14";
  if (pnl === 0) return "bg-white/[0.025]";
  if (pnl >= -100) return "bg-loss/14";
  if (pnl >= -200) return "bg-loss/28";
  return "bg-loss/45";
};

const dayOfWeekData = [
  { name: "ראשון", winRate: 65 },
  { name: "שני", winRate: 72 },
  { name: "שלישי", winRate: 68 },
  { name: "רביעי", winRate: 61 },
  { name: "חמישי", winRate: 58 },
  { name: "שישי", winRate: 20 },
];

const longShortData = [
  { name: "Long", value: 3000, fill: "hsl(var(--profit))" },
  { name: "Short", value: 1250, fill: "hsl(var(--loss))" },
];


/* ===== Custom Tooltip ===== */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#111116] px-3 py-2 shadow-xl text-right">
      <p className="text-[11px] font-bold text-foreground mb-0.5">{label}</p>
      <p className="text-[10px] text-profit font-mono font-bold">{payload[0].value}%</p>
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#111116] px-3 py-2 shadow-xl text-right">
      <p className="text-[11px] font-bold text-foreground">{payload[0].name}</p>
      <p className="text-[10px] font-mono font-bold" style={{ color: payload[0].payload.fill }}>
        +${payload[0].value.toLocaleString()}
      </p>
    </div>
  );
};

/* ===== Main Page ===== */
const StatsPage = () => {
  const totalPnl = longShortData.reduce((s, d) => s + d.value, 0);
  const longPct = ((longShortData[0].value / totalPnl) * 100).toFixed(0);

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

      {/* ===== 1. TOP METRICS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {topMetrics.map((m) => (
          <div
            key={m.sublabel}
            className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-4 overflow-hidden group hover:border-white/[0.1] transition-all duration-300"
          >
            <div className={`absolute top-0 left-0 w-20 h-20 bg-${m.glow}/[0.04] rounded-full blur-[40px] pointer-events-none`} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className={`${m.color} opacity-50`}>{m.icon}</div>
                <span className="text-2xs text-muted-foreground/40 font-mono">{m.sublabel}</span>
              </div>
              <p className={`text-xl md:text-2xl font-black font-mono ${m.color}`}>{m.value}</p>
              <p className="text-2xs text-muted-foreground/35 mt-1">{m.sub}</p>
              <p className="text-[10px] font-semibold text-foreground/60 mt-0.5">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== 2. DAY×HOUR HEATMAP ===== */}
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
            <div className="hidden md:flex items-center gap-2.5 text-[8px] text-muted-foreground/30">
              <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-sm bg-profit/35" /> רווח</span>
              <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-sm bg-loss/35" /> הפסד</span>
              <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-sm bg-white/[0.03]" /> ריק</span>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-none">
            <div className="min-w-[480px]">
              {/* Hour headers */}
              <div className="flex items-center gap-px mr-14 mb-px">
                {heatHours.map(h => (
                  <div key={h} className="flex-1 text-center text-[7px] text-muted-foreground/25 font-mono py-0.5">
                    {h.toString().padStart(2, "0")}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {heatDays.map(day => {
                const row = heatMap[day];
                const total = row.reduce((s, v) => s + v, 0);
                return (
                  <div key={day} className="flex items-center gap-px mb-px">
                    <div className="w-14 shrink-0 flex items-center justify-between pr-1">
                      <span className="text-[9px] text-foreground/50 font-medium">{day}</span>
                      <span className={`text-[7px] font-bold font-mono ${total >= 0 ? "text-profit/60" : "text-loss/60"}`}>
                        {total >= 0 ? "+" : ""}{total}
                      </span>
                    </div>
                    {row.map((pnl, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-6 md:h-7 rounded-[3px] flex items-center justify-center cursor-pointer transition-all hover:scale-110 hover:z-10 ${heatCellColor(pnl)}`}
                        title={`${day} ${(i + 6).toString().padStart(2, "0")}:00 — ${pnl === 0 ? "ריק" : `${pnl > 0 ? "+" : ""}$${pnl}`}`}
                      >
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

      {/* ===== 3. CHARTS ROW ===== */}
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
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground) / 0.4)", fontSize: 10 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground) / 0.25)", fontSize: 9 }}
                    tickFormatter={v => `${v}%`}
                    width={35}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.06)" }} />
                  <Bar dataKey="winRate" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {dayOfWeekData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.winRate >= 50 ? "hsl(var(--profit))" : "hsl(var(--loss))"}
                        fillOpacity={entry.winRate >= 50 ? 0.7 : 0.6}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Friday warning */}
            <div className="mt-3 rounded-xl border border-loss/10 bg-loss/[0.03] p-2.5 flex items-start gap-2">
              <Brain className="h-3.5 w-3.5 text-loss/60 shrink-0 mt-0.5" />
              <p className="text-2xs text-muted-foreground/50 leading-relaxed">
                <span className="text-loss font-bold">שים לב:</span> Win Rate בשישי עומד על <span className="text-loss font-bold font-mono">20%</span> בלבד. שקול להימנע ממסחר בימי שישי.
              </p>
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
                  <Pie
                    data={longShortData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {longShortData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </RePieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-black font-mono text-foreground">62%</p>
                <p className="text-2xs text-muted-foreground/40">Win Rate</p>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="rounded-xl bg-profit/[0.04] border border-profit/10 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <ArrowUpRight className="h-3 w-3 text-profit" />
                  <span className="text-2xs text-muted-foreground/40">Long</span>
                </div>
                <p className="text-[15px] font-black font-mono text-profit">+$3,000</p>
                <p className="text-[8px] text-profit/50 font-mono">{longPct}% מהרווח</p>
              </div>
              <div className="rounded-xl bg-loss/[0.04] border border-loss/10 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <ArrowDownRight className="h-3 w-3 text-loss" />
                  <span className="text-2xs text-muted-foreground/40">Short</span>
                </div>
                <p className="text-[15px] font-black font-mono text-loss">+$1,250</p>
                <p className="text-[8px] text-loss/50 font-mono">{100 - parseInt(longPct)}% מהרווח</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="rounded-2xl border border-primary/10 bg-primary/[0.03] backdrop-blur-md p-4 flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 shrink-0">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-primary mb-0.5">תובנת AI מתקדמת</p>
          <p className="text-2xs text-muted-foreground/50 leading-relaxed">
            הנתונים מראים שה-Win Rate שלך ב<span className="text-profit font-bold">עסקאות Long</span> גבוה משמעותית.
            תוחלת הרווח שלך חיובית ב-<span className="text-profit font-bold font-mono">$45.20</span> לעסקה.
            נקודת חולשה: <span className="text-loss font-bold">ימי שישי</span> — מומלץ להפחית חשיפה או לא לסחור בכלל.
            ה-Drawdown המקסימלי החודשי (<span className="text-loss font-mono font-bold">-8.5%</span>) בגבולות הסביר לחשבון ממומן.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
