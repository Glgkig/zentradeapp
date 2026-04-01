import {
  Shield, TrendingUp, AlertTriangle, Clock, Target,
  Flame, Brain, BarChart3, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

/* ===== Heatmap Data ===== */
const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"];
const hours = ["09", "10", "11", "12", "13", "14", "15", "16", "17"];
const heatData: Record<string, Record<string, { pnl: number; trades: number }>> = {
  "ראשון": { "09": { pnl: 120, trades: 3 }, "10": { pnl: 250, trades: 5 }, "11": { pnl: 80, trades: 2 }, "12": { pnl: 0, trades: 0 }, "13": { pnl: -45, trades: 1 }, "14": { pnl: 180, trades: 4 }, "15": { pnl: 60, trades: 2 }, "16": { pnl: -190, trades: 3 }, "17": { pnl: -75, trades: 2 } },
  "שני":   { "09": { pnl: 90, trades: 2 }, "10": { pnl: 160, trades: 3 }, "11": { pnl: 310, trades: 6 }, "12": { pnl: 55, trades: 1 }, "13": { pnl: 0, trades: 0 }, "14": { pnl: 70, trades: 2 }, "15": { pnl: -80, trades: 2 }, "16": { pnl: -280, trades: 4 }, "17": { pnl: -150, trades: 3 } },
  "שלישי": { "09": { pnl: 340, trades: 5 }, "10": { pnl: 95, trades: 2 }, "11": { pnl: 200, trades: 4 }, "12": { pnl: 130, trades: 3 }, "13": { pnl: 40, trades: 1 }, "14": { pnl: 0, trades: 0 }, "15": { pnl: -60, trades: 1 }, "16": { pnl: -170, trades: 3 }, "17": { pnl: 15, trades: 1 } },
  "רביעי": { "09": { pnl: 0, trades: 0 }, "10": { pnl: 145, trades: 3 }, "11": { pnl: 75, trades: 2 }, "12": { pnl: 290, trades: 5 }, "13": { pnl: 110, trades: 2 }, "14": { pnl: 50, trades: 1 }, "15": { pnl: 0, trades: 0 }, "16": { pnl: -95, trades: 2 }, "17": { pnl: -320, trades: 5 } },
  "חמישי": { "09": { pnl: 185, trades: 4 }, "10": { pnl: 270, trades: 5 }, "11": { pnl: 150, trades: 3 }, "12": { pnl: 60, trades: 1 }, "13": { pnl: 0, trades: 0 }, "14": { pnl: -110, trades: 2 }, "15": { pnl: -200, trades: 3 }, "16": { pnl: -350, trades: 6 }, "17": { pnl: -85, trades: 2 } },
};

const heatColor = (pnl: number) => {
  if (pnl >= 250) return "bg-accent/60 border-accent/30";
  if (pnl >= 100) return "bg-accent/35 border-accent/20";
  if (pnl > 0)    return "bg-accent/15 border-accent/10";
  if (pnl === 0)  return "bg-muted/20 border-border/10";
  if (pnl >= -100) return "bg-destructive/15 border-destructive/10";
  if (pnl >= -200) return "bg-destructive/30 border-destructive/15";
  return "bg-destructive/50 border-destructive/25";
};

const StatsPage = () => {
  return (
    <div className="mx-auto max-w-[1280px]">
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-heading text-lg md:text-xl font-bold text-foreground">סטטיסטיקות וביצועים</h1>
        <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
          ניתוח מעמיק של ביצועי המסחר, משמעת, ודפוסים פסיכולוגיים.
        </p>
      </div>

      {/* Row 1: Discipline + Revenge + Classic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">

        {/* Discipline Score */}
        <div className="md:col-span-4 rounded-xl border border-border/15 bg-secondary/15 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-foreground">מדד משמעת</span>
          </div>

          <div className="flex flex-col items-center">
            {/* Radial Progress */}
            <div className="relative w-28 h-28 md:w-32 md:h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8" className="stroke-muted/30" />
                <circle
                  cx="60" cy="60" r="52" fill="none" strokeWidth="8"
                  strokeLinecap="round"
                  className="stroke-primary"
                  strokeDasharray={`${(85 / 100) * 327} 327`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl md:text-3xl font-bold text-foreground">85</span>
                <span className="text-[9px] text-muted-foreground">/100</span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-[10px] text-accent font-semibold">ביצועים מעולים ✓</p>
              <p className="text-[9px] text-muted-foreground mt-1">הפרת חוקים השבוע: <span className="text-destructive font-semibold">2</span></p>
            </div>

            <div className="mt-3 w-full space-y-1.5">
              {[
                { label: "עמידה בסטופ-לוס", value: "95%", good: true },
                { label: "עמידה במגבלת עסקאות", value: "88%", good: true },
                { label: "מסחר נקמה", value: "2 מקרים", good: false },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between rounded-lg bg-muted/15 px-2.5 py-1.5">
                  <span className="text-[9px] text-muted-foreground">{m.label}</span>
                  <span className={`text-[9px] font-semibold ${m.good ? "text-accent" : "text-destructive"}`}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenge Trading Cost */}
        <div className="md:col-span-3 rounded-xl border border-destructive/20 bg-destructive/[0.02] p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10">
              <Flame className="h-3.5 w-3.5 text-destructive" />
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-foreground">עלות עסקאות נקמה</span>
          </div>

          <div className="text-center mb-4">
            <p className="text-3xl md:text-4xl font-bold text-destructive">-$340</p>
            <p className="text-[9px] text-muted-foreground mt-1.5 leading-relaxed">
              כסף שהופסד החודש מעסקאות שנפתחו מיד אחרי הפסד.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-destructive/[0.05] border border-destructive/10 px-2.5 py-2">
              <span className="text-[9px] text-muted-foreground">עסקאות נקמה החודש</span>
              <span className="text-[10px] font-bold text-destructive">7</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-destructive/[0.05] border border-destructive/10 px-2.5 py-2">
              <span className="text-[9px] text-muted-foreground">Win Rate בנקמה</span>
              <span className="text-[10px] font-bold text-destructive">14%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-destructive/[0.05] border border-destructive/10 px-2.5 py-2">
              <span className="text-[9px] text-muted-foreground">ממוצע הפסד לעסקת נקמה</span>
              <span className="text-[10px] font-bold text-destructive">-$48.5</span>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-destructive/15 bg-destructive/[0.04] p-2.5 flex items-start gap-2">
            <Brain className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
            <p className="text-[8px] md:text-[9px] text-muted-foreground leading-relaxed">
              <span className="text-destructive font-semibold">תובנת AI:</span> 71% מעסקאות הנקמה שלך קרו בין 15:00-17:00. שקול נעילה אוטומטית.
            </p>
          </div>
        </div>

        {/* Classic Metrics */}
        <div className="md:col-span-5 rounded-xl border border-border/15 bg-secondary/15 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
              <BarChart3 className="h-3.5 w-3.5 text-accent" />
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-foreground">מדדים מרכזיים</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: "Win Rate", value: "62%", icon: <Target className="h-3 w-3" />, color: "text-accent" },
              { label: "Profit Factor", value: "1.8", icon: <TrendingUp className="h-3 w-3" />, color: "text-accent" },
              { label: "Average R:R", value: "1:2.5", icon: <BarChart3 className="h-3 w-3" />, color: "text-primary" },
              { label: "Sharpe Ratio", value: "1.42", icon: <Shield className="h-3 w-3" />, color: "text-primary" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border border-border/50 bg-muted/10 p-3 text-center">
                <p className={`text-lg md:text-xl font-bold ${m.color}`}>{m.value}</p>
                <p className="text-[8px] md:text-[9px] text-muted-foreground mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Monthly P&L Summary */}
          <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
            <p className="text-[10px] font-semibold text-foreground mb-2">P&L חודשי</p>
            <div className="space-y-1.5">
              {[
                { month: "ינואר", pnl: 1240, trades: 42 },
                { month: "פברואר", pnl: -320, trades: 38 },
                { month: "מרץ", pnl: 2100, trades: 51 },
              ].map((m) => (
                <div key={m.month} className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground">{m.month} ({m.trades} עסקאות)</span>
                  <span className={`text-[10px] font-bold flex items-center gap-0.5 ${m.pnl > 0 ? "text-accent" : "text-destructive"}`}>
                    {m.pnl > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {m.pnl > 0 ? "+" : ""}{m.pnl}$
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Heatmap (Full Width) */}
      <div className="rounded-xl border border-border/15 bg-secondary/15 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <span className="text-[10px] md:text-xs font-semibold text-foreground">מפת רווחיות לפי שעות</span>
              <p className="text-[8px] text-muted-foreground">סה״כ רווח: <span className="text-accent font-semibold">+$2,430</span> · סה״כ הפסד: <span className="text-destructive font-semibold">-$1,785</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[8px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2.5 w-5 rounded-[3px] bg-accent/40" /> רווח</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-5 rounded-[3px] bg-destructive/40" /> הפסד</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-5 rounded-[3px] bg-muted/20" /> אין פעילות</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Hours header */}
            <div className="flex items-center gap-1.5 mb-2 pr-16">
              {hours.map((h) => (
                <div key={h} className="flex-1 text-center text-[8px] md:text-[9px] text-muted-foreground font-mono">{h}:00</div>
              ))}
            </div>

            {/* Grid rows */}
            {days.map((day) => {
              const dayTotal = hours.reduce((sum, h) => sum + heatData[day][h].pnl, 0);
              return (
                <div key={day} className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-14 shrink-0 flex flex-col">
                    <span className="text-[9px] md:text-[10px] text-foreground font-medium text-left">{day}</span>
                    <span className={`text-[7px] font-semibold text-left ${dayTotal >= 0 ? "text-accent" : "text-destructive"}`}>
                      {dayTotal >= 0 ? "+" : ""}{dayTotal}$
                    </span>
                  </div>
                  {hours.map((h) => {
                    const cell = heatData[day][h];
                    return (
                      <div
                        key={h}
                        className={`flex-1 h-10 md:h-12 rounded-md border transition-all duration-200 hover:scale-105 hover:z-10 cursor-pointer flex flex-col items-center justify-center gap-0.5 ${heatColor(cell.pnl)}`}
                        title={`${day} ${h}:00 — ${cell.pnl >= 0 ? "+" : ""}$${cell.pnl} (${cell.trades} עסקאות)`}
                      >
                        <span className={`text-[8px] md:text-[9px] font-bold ${cell.pnl > 0 ? "text-accent" : cell.pnl < 0 ? "text-destructive" : "text-muted-foreground/50"}`}>
                          {cell.pnl === 0 ? "—" : `${cell.pnl > 0 ? "+" : ""}${cell.pnl}$`}
                        </span>
                        {cell.trades > 0 && (
                          <span className="text-[6px] md:text-[7px] text-muted-foreground">{cell.trades} עס׳</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Column totals */}
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/10 pr-16">
              {hours.map((h) => {
                const colTotal = days.reduce((sum, day) => sum + heatData[day][h].pnl, 0);
                return (
                  <div key={h} className="flex-1 text-center">
                    <span className={`text-[8px] font-bold ${colTotal >= 0 ? "text-accent" : "text-destructive"}`}>
                      {colTotal >= 0 ? "+" : ""}{colTotal}$
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-primary/15 bg-primary/[0.04] p-2.5 flex items-start gap-2">
          <Brain className="h-3 w-3 text-primary shrink-0 mt-0.5" />
          <p className="text-[8px] md:text-[9px] text-muted-foreground leading-relaxed">
            <span className="text-primary font-semibold">תובנת AI:</span> ה-AI מזהה הפסדים קבועים בין 16:00 ל-17:00 (סה״כ <span className="text-destructive font-semibold">-$835</span>). 
            השעות הרווחיות ביותר שלך הן 09:00-11:00 (<span className="text-accent font-semibold">+$1,870</span>). מומלץ להפעיל נעילה אוטומטית אחרי 15:00.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
