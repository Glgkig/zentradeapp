import {
  Shield, TrendingUp, AlertTriangle, Clock, Target,
  Flame, Brain, BarChart3, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

/* ===== Heatmap Data ===== */
const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"];
const hours = ["09", "10", "11", "12", "13", "14", "15", "16", "17"];
const heatData: Record<string, Record<string, number>> = {
  "ראשון": { "09": 2, "10": 3, "11": 1, "12": 0, "13": -1, "14": 2, "15": 1, "16": -2, "17": -1 },
  "שני":   { "09": 1, "10": 2, "11": 3, "12": 1, "13": 0, "14": 1, "15": -1, "16": -3, "17": -2 },
  "שלישי": { "09": 3, "10": 1, "11": 2, "12": 2, "13": 1, "14": 0, "15": -1, "16": -2, "17": 0 },
  "רביעי": { "09": 0, "10": 2, "11": 1, "12": 3, "13": 2, "14": 1, "15": 0, "16": -1, "17": -3 },
  "חמישי": { "09": 2, "10": 3, "11": 2, "12": 1, "13": 0, "14": -1, "15": -2, "16": -3, "17": -1 },
};

const heatColor = (v: number) => {
  if (v >= 3) return "bg-accent/70";
  if (v >= 2) return "bg-accent/45";
  if (v >= 1) return "bg-accent/20";
  if (v === 0) return "bg-muted/30";
  if (v >= -1) return "bg-destructive/20";
  if (v >= -2) return "bg-destructive/40";
  return "bg-destructive/60";
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
            <span className="text-[10px] md:text-xs font-semibold text-foreground">מפת רווחיות לפי שעות</span>
          </div>
          <div className="flex items-center gap-2 text-[8px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[2px] bg-accent/50" /> רווחי</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-[2px] bg-destructive/50" /> הפסדי</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[400px]">
            {/* Hours header */}
            <div className="flex items-center gap-1 mb-1 pr-14">
              {hours.map((h) => (
                <div key={h} className="flex-1 text-center text-[8px] md:text-[9px] text-muted-foreground font-mono">{h}:00</div>
              ))}
            </div>

            {/* Grid rows */}
            {days.map((day) => (
              <div key={day} className="flex items-center gap-1 mb-1">
                <span className="w-12 shrink-0 text-[9px] md:text-[10px] text-muted-foreground text-left">{day}</span>
                {hours.map((h) => (
                  <div
                    key={h}
                    className={`flex-1 h-6 md:h-7 rounded-[4px] transition-all duration-200 hover:scale-110 hover:z-10 cursor-pointer ${heatColor(heatData[day][h])}`}
                    title={`${day} ${h}:00 — ${heatData[day][h] > 0 ? "+" : ""}${heatData[day][h]}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-primary/15 bg-primary/[0.04] p-2.5 flex items-start gap-2">
          <Brain className="h-3 w-3 text-primary shrink-0 mt-0.5" />
          <p className="text-[8px] md:text-[9px] text-muted-foreground leading-relaxed">
            <span className="text-primary font-semibold">תובנת AI:</span> ה-AI מזהה הפסדים קבועים בין 16:00 ל-17:00. מומלץ להפעיל נעילה אוטומטית בשעות אלו.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
