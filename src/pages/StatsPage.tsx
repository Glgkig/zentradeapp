import {
  Shield, TrendingUp, AlertTriangle, Clock, Target,
  Flame, Brain, BarChart3, ArrowUpRight, ArrowDownRight,
  CheckCircle2, XCircle, Zap, Activity, Award, TrendingDown,
} from "lucide-react";

/* ===== Heatmap Data ===== */
const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const hours = ["09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"];
const _h = (data: [number,number][]) => {
  const obj: Record<string, { pnl: number; trades: number }> = {};
  hours.forEach((h, i) => { obj[h] = { pnl: data[i]?.[0] ?? 0, trades: data[i]?.[1] ?? 0 }; });
  return obj;
};
const heatData: Record<string, Record<string, { pnl: number; trades: number }>> = {
  "ראשון": _h([[120,3],[250,5],[80,2],[0,0],[-45,1],[180,4],[60,2],[-190,3],[-75,2],[45,1],[0,0],[-30,1],[0,0],[0,0]]),
  "שני":   _h([[90,2],[160,3],[310,6],[55,1],[0,0],[70,2],[-80,2],[-280,4],[-150,3],[0,0],[65,2],[-40,1],[0,0],[0,0]]),
  "שלישי": _h([[340,5],[95,2],[200,4],[130,3],[40,1],[0,0],[-60,1],[-170,3],[15,1],[85,2],[0,0],[-25,1],[50,1],[0,0]]),
  "רביעי": _h([[0,0],[145,3],[75,2],[290,5],[110,2],[50,1],[0,0],[-95,2],[-320,5],[0,0],[35,1],[0,0],[-55,1],[0,0]]),
  "חמישי": _h([[185,4],[270,5],[150,3],[60,1],[0,0],[-110,2],[-200,3],[-350,6],[-85,2],[0,0],[0,0],[70,2],[0,0],[-40,1]]),
  "שישי":  _h([[0,0],[0,0],[95,2],[140,3],[0,0],[60,1],[0,0],[0,0],[-45,1],[120,3],[80,2],[0,0],[-35,1],[0,0]]),
  "שבת":   _h([[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[75,2],[110,3],[0,0],[55,1],[-60,2],[0,0],[0,0]]),
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
  const disciplineScore = 85;
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="mx-auto max-w-[1280px] space-y-3 md:space-y-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-lg md:text-xl font-bold text-foreground">סטטיסטיקות וביצועים</h1>
            <p className="text-[11px] md:text-xs text-muted-foreground">
              ניתוח מעמיק של ביצועי המסחר, משמעת, ודפוסים פסיכולוגיים
            </p>
          </div>
        </div>
      </div>

      {/* Top Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 md:mb-4">
        {[
          { label: "רווח נקי החודש", value: "+$3,020", sub: "131 עסקאות", color: "text-accent", icon: <TrendingUp className="h-3.5 w-3.5" />, borderColor: "border-accent/20" },
          { label: "Win Rate", value: "62%", sub: "81 מתוך 131", color: "text-primary", icon: <Target className="h-3.5 w-3.5" />, borderColor: "border-primary/20" },
          { label: "Profit Factor", value: "1.8", sub: "רווח/הפסד ממוצע", color: "text-accent", icon: <BarChart3 className="h-3.5 w-3.5" />, borderColor: "border-accent/20" },
          { label: "ציון משמעת", value: "85/100", sub: "ביצועים מעולים", color: "text-primary", icon: <Shield className="h-3.5 w-3.5" />, borderColor: "border-primary/20" },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl border ${item.borderColor} bg-secondary/20 p-2.5 md:p-3.5 transition-all duration-200 hover:bg-secondary/30`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`${item.color} opacity-60`}>{item.icon}</div>
              <span className="text-[9px] md:text-[10px] text-muted-foreground">{item.label}</span>
            </div>
            <p className={`text-lg md:text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-[8px] text-muted-foreground mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Row 1: Discipline + Revenge + Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">

        {/* Discipline Score - Premium Redesign */}
        <div className="md:col-span-4 rounded-xl border border-border/15 bg-secondary/15 p-4 md:p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-[11px] md:text-xs font-semibold text-foreground">מדד משמעת</span>
                <p className="text-[8px] text-muted-foreground">ניתוח שבועי</p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-accent/10 border border-accent/20 px-2 py-0.5">
              <Award className="h-2.5 w-2.5 text-accent" />
              <span className="text-[8px] text-accent font-semibold">מעולה</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            {/* Premium Radial Progress */}
            <div className="relative w-32 h-32 md:w-36 md:h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Background track */}
                <circle cx="60" cy="60" r="54" fill="none" strokeWidth="6" className="stroke-muted/15" />
                {/* Progress arc */}
                <circle
                  cx="60" cy="60" r="54" fill="none" strokeWidth="7"
                  strokeLinecap="round"
                  className="stroke-primary"
                  strokeDasharray={`${(disciplineScore / 100) * circumference} ${circumference}`}
                  style={{ filter: "drop-shadow(0 0 6px hsl(217 72% 53% / 0.4))" }}
                />
                {/* Glow overlay */}
                <circle
                  cx="60" cy="60" r="54" fill="none" strokeWidth="2"
                  strokeLinecap="round"
                  className="stroke-primary/30"
                  strokeDasharray={`${(disciplineScore / 100) * circumference} ${circumference}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{disciplineScore}</span>
                <span className="text-[9px] text-muted-foreground font-medium mt-0.5">מתוך 100</span>
              </div>
            </div>

            <div className="mt-4 w-full space-y-2">
              {[
                { label: "עמידה בסטופ-לוס", value: "95%", good: true, icon: <CheckCircle2 className="h-3 w-3" /> },
                { label: "עמידה במגבלת עסקאות", value: "88%", good: true, icon: <CheckCircle2 className="h-3 w-3" /> },
                { label: "מסחר נקמה", value: "2 מקרים", good: false, icon: <XCircle className="h-3 w-3" /> },
                { label: "הפרת חוקים", value: "2 השבוע", good: false, icon: <AlertTriangle className="h-3 w-3" /> },
              ].map((m) => (
                <div key={m.label} className={`flex items-center justify-between rounded-lg px-3 py-2 border transition-colors ${m.good ? "bg-accent/[0.04] border-accent/10 hover:bg-accent/[0.07]" : "bg-destructive/[0.04] border-destructive/10 hover:bg-destructive/[0.07]"}`}>
                  <div className="flex items-center gap-2">
                    <span className={m.good ? "text-accent" : "text-destructive"}>{m.icon}</span>
                    <span className="text-[9px] md:text-[10px] text-muted-foreground">{m.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${m.good ? "text-accent" : "text-destructive"}`}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenge Trading - Premium Redesign */}
        <div className="md:col-span-3 rounded-xl border border-destructive/15 bg-destructive/[0.02] p-4 md:p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/15">
                <Flame className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <span className="text-[11px] md:text-xs font-semibold text-foreground">עסקאות נקמה</span>
                <p className="text-[8px] text-muted-foreground">עלות חודשית</p>
              </div>
            </div>
          </div>

          {/* Big Loss Number */}
          <div className="text-center mb-5 py-4 rounded-xl bg-destructive/[0.06] border border-destructive/10">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <p className="text-3xl md:text-4xl font-bold text-destructive tracking-tight">-$340</p>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1 leading-relaxed max-w-[180px] mx-auto">
              כסף שהופסד מעסקאות שנפתחו מיד אחרי הפסד
            </p>
          </div>

          <div className="space-y-2">
            {[
              { label: "עסקאות נקמה", value: "7", sub: "החודש" },
              { label: "Win Rate בנקמה", value: "14%", sub: "1 מתוך 7" },
              { label: "ממוצע הפסד", value: "-$48.5", sub: "לעסקה" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-destructive/[0.04] border border-destructive/8 px-3 py-2.5 transition-colors hover:bg-destructive/[0.06]">
                <div>
                  <span className="text-[9px] md:text-[10px] text-muted-foreground block">{item.label}</span>
                  <span className="text-[7px] text-muted-foreground/60">{item.sub}</span>
                </div>
                <span className="text-[11px] font-bold text-destructive">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-destructive/15 bg-destructive/[0.04] p-3 flex items-start gap-2.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-destructive/15 shrink-0 mt-0.5">
              <Brain className="h-3 w-3 text-destructive" />
            </div>
            <p className="text-[8px] md:text-[9px] text-muted-foreground leading-relaxed">
              <span className="text-destructive font-semibold">תובנת AI:</span> 71% מעסקאות הנקמה שלך קרו בין 15:00-17:00. שקול נעילה אוטומטית.
            </p>
          </div>
        </div>

        {/* Classic Metrics - Premium Redesign */}
        <div className="md:col-span-5 rounded-xl border border-border/15 bg-secondary/15 p-4 md:p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 border border-accent/15">
                <BarChart3 className="h-4 w-4 text-accent" />
              </div>
              <div>
                <span className="text-[11px] md:text-xs font-semibold text-foreground">מדדים מרכזיים</span>
                <p className="text-[8px] text-muted-foreground">סיכום ביצועים</p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-accent/10 border border-accent/15 px-2 py-0.5">
              <Zap className="h-2.5 w-2.5 text-accent" />
              <span className="text-[8px] text-accent font-semibold">חיובי</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: "Win Rate", value: "62%", sub: "81/131 עסקאות", icon: <Target className="h-3.5 w-3.5" />, color: "text-accent", bgColor: "bg-accent/[0.06] border-accent/10" },
              { label: "Profit Factor", value: "1.8", sub: "יחס רווח/הפסד", icon: <TrendingUp className="h-3.5 w-3.5" />, color: "text-accent", bgColor: "bg-accent/[0.06] border-accent/10" },
              { label: "Average R:R", value: "1:2.5", sub: "סיכון/תגמול", icon: <BarChart3 className="h-3.5 w-3.5" />, color: "text-primary", bgColor: "bg-primary/[0.06] border-primary/10" },
              { label: "Sharpe Ratio", value: "1.42", sub: "יחס שארפ", icon: <Shield className="h-3.5 w-3.5" />, color: "text-primary", bgColor: "bg-primary/[0.06] border-primary/10" },
            ].map((m) => (
              <div key={m.label} className={`rounded-xl border p-3.5 text-center transition-all duration-200 hover:scale-[1.02] ${m.bgColor}`}>
                <div className={`flex justify-center mb-1.5 ${m.color} opacity-50`}>{m.icon}</div>
                <p className={`text-xl md:text-2xl font-bold ${m.color} tracking-tight`}>{m.value}</p>
                <p className="text-[8px] text-muted-foreground font-medium mt-0.5">{m.label}</p>
                <p className="text-[7px] text-muted-foreground/60 mt-0.5">{m.sub}</p>
              </div>
            ))}
          </div>

          {/* Monthly P&L Summary */}
          <div className="rounded-xl border border-border/15 bg-muted/[0.06] p-3.5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-foreground">P&L חודשי</p>
              <p className="text-[8px] text-muted-foreground">3 חודשים אחרונים</p>
            </div>
            <div className="space-y-2">
              {[
                { month: "ינואר", pnl: 1240, trades: 42 },
                { month: "פברואר", pnl: -320, trades: 38 },
                { month: "מרץ", pnl: 2100, trades: 51 },
              ].map((m) => (
                <div key={m.month} className={`flex items-center justify-between rounded-lg px-3 py-2 border transition-colors ${m.pnl >= 0 ? "bg-accent/[0.03] border-accent/8 hover:bg-accent/[0.06]" : "bg-destructive/[0.03] border-destructive/8 hover:bg-destructive/[0.06]"}`}>
                  <div className="flex items-center gap-2">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-md ${m.pnl >= 0 ? "bg-accent/15" : "bg-destructive/15"}`}>
                      {m.pnl > 0 ? <ArrowUpRight className="h-3 w-3 text-accent" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
                    </div>
                    <div>
                      <span className="text-[9px] md:text-[10px] text-foreground font-medium block">{m.month}</span>
                      <span className="text-[7px] text-muted-foreground">{m.trades} עסקאות</span>
                    </div>
                  </div>
                  <span className={`text-[11px] md:text-xs font-bold ${m.pnl > 0 ? "text-accent" : "text-destructive"}`}>
                    {m.pnl > 0 ? "+" : ""}{m.pnl.toLocaleString()}$
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Heatmap (Full Width) */}
      <div className="rounded-xl border border-border/15 bg-secondary/15 backdrop-blur-sm p-3 md:p-4">
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
