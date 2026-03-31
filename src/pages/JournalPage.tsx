import { useState } from "react";
import {
  Mic, Play, ChevronDown, ChevronUp, Filter, Calendar,
  ArrowUpRight, ArrowDownRight, Brain, AlertTriangle, CheckCircle2,
  TrendingUp, Target, Shield, Clock, Zap, Volume2, RefreshCw,
  Search, BarChart3,
} from "lucide-react";

/* ===== Trade Data ===== */
const trades = [
  {
    id: 1,
    pair: "EUR/USD",
    dir: "Long" as const,
    entry: 1.0842,
    exit: 1.0887,
    pnl: 450,
    entryTime: "09:32",
    exitTime: "11:15",
    date: "30/03/2026",
    grade: "A+",
    psyTag: "לפי תוכנית המסחר",
    psyType: "good" as const,
    hasAudio: true,
    autoSync: true,
    rr: "1:3.2",
    lots: 0.5,
    aiNote: "עסקה מצוינת. נכנסת לפי הסטאפ, שמרת על הסטופ, ונתת לרווח לרוץ. ככה סוחרים ממושמעים.",
    slMoved: false,
  },
  {
    id: 2,
    pair: "GBP/USD",
    dir: "Short" as const,
    entry: 1.2715,
    exit: 1.2680,
    pnl: 280,
    entryTime: "14:05",
    exitTime: "15:42",
    date: "30/03/2026",
    grade: "B",
    psyTag: "הזזת סטופ-לוס",
    psyType: "warning" as const,
    hasAudio: false,
    autoSync: true,
    rr: "1:2.1",
    lots: 0.3,
    aiNote: "זיהיתי שהזזת את הסטופ-לוס פעם אחת במהלך העסקה. למרות שהרווחת, זו התנהגות מסוכנת שנוגדת את הסטאפ שהגדרת.",
    slMoved: true,
  },
  {
    id: 3,
    pair: "XAU/USD",
    dir: "Long" as const,
    entry: 2185.40,
    exit: 2178.20,
    pnl: -360,
    entryTime: "16:22",
    exitTime: "16:48",
    date: "29/03/2026",
    grade: "F",
    psyTag: "מסחר נקמה",
    psyType: "danger" as const,
    hasAudio: true,
    autoSync: true,
    rr: "-1:1.8",
    lots: 0.8,
    aiNote: "עסקה זו נפתחה 4 דקות אחרי הפסד קודם. זהו מסחר נקמה קלאסי. הגדלת את הלוט פי 2.6 מהרגיל. המערכת הייתה צריכה לנעול אותך.",
    slMoved: true,
  },
  {
    id: 4,
    pair: "BTC/USD",
    dir: "Long" as const,
    entry: 87420,
    exit: 88150,
    pnl: 730,
    entryTime: "10:10",
    exitTime: "13:55",
    date: "29/03/2026",
    grade: "A",
    psyTag: "לפי תוכנית המסחר",
    psyType: "good" as const,
    hasAudio: false,
    autoSync: true,
    rr: "1:2.8",
    lots: 0.1,
    aiNote: "סבלנות מצוינת. חיכית לאישור ונכנסת בזמן הנכון. הסטופ נשמר במקום.",
    slMoved: false,
  },
  {
    id: 5,
    pair: "NAS100",
    dir: "Short" as const,
    entry: 18542,
    exit: 18610,
    pnl: -204,
    entryTime: "15:31",
    exitTime: "15:58",
    date: "28/03/2026",
    grade: "D",
    psyTag: "כניסה מוקדמת מפומו",
    psyType: "danger" as const,
    hasAudio: true,
    autoSync: false,
    rr: "-1:1",
    lots: 0.4,
    aiNote: "נכנסת לפני אישור הנר. זיהיתי דפוס FOMO — הכניסה בוצעה 12 שניות אחרי תנועה חדה. תמיד תחכה לסגירת נר.",
    slMoved: false,
  },
  {
    id: 6,
    pair: "EUR/JPY",
    dir: "Long" as const,
    entry: 162.45,
    exit: 163.10,
    pnl: 520,
    entryTime: "08:15",
    exitTime: "10:30",
    date: "28/03/2026",
    grade: "A",
    psyTag: "לפי תוכנית המסחר",
    psyType: "good" as const,
    hasAudio: false,
    autoSync: true,
    rr: "1:3.5",
    lots: 0.3,
    aiNote: "ביצוע מושלם. הסטאפ עבד כמתוכנן, יחס R:R מעולה.",
    slMoved: false,
  },
];

const gradeColors: Record<string, string> = {
  "A+": "text-accent border-accent/25 bg-accent/10",
  "A": "text-accent border-accent/25 bg-accent/10",
  "B": "text-primary border-primary/25 bg-primary/10",
  "C": "text-yellow-400 border-yellow-400/25 bg-yellow-400/10",
  "D": "text-orange-400 border-orange-400/25 bg-orange-400/10",
  "F": "text-destructive border-destructive/25 bg-destructive/10",
};

const psyColors = {
  good: "text-accent/80 bg-accent/[0.06] border-accent/15",
  warning: "text-yellow-400/80 bg-yellow-400/[0.06] border-yellow-400/15",
  danger: "text-destructive/80 bg-destructive/[0.06] border-destructive/15",
};

const JournalPage = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [assetFilter, setAssetFilter] = useState("all");
  const [psyFilter, setPsyFilter] = useState("all");

  const weekPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const winRate = Math.round((trades.filter(t => t.pnl > 0).length / trades.length) * 100);

  const filtered = trades.filter(t => {
    if (assetFilter !== "all" && t.pair !== assetFilter) return false;
    if (psyFilter === "mistakes" && t.psyType === "good") return false;
    if (psyFilter === "plan" && t.psyType !== "good") return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-[1280px]">
      {/* Header + Filters */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="font-heading text-lg md:text-xl font-bold text-foreground">יומן מסחר חכם</h1>
            <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">כל העסקאות מנותחות אוטומטית ע״י ה-AI</p>
          </div>
          <button className="flex items-center gap-1.5 self-start rounded-lg bg-primary/15 border border-primary/25 px-3 py-2 text-[11px] font-semibold text-primary hover:bg-primary/25 transition-all">
            <Mic className="h-3.5 w-3.5" />
            הקלט יומן קולי +
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-2">
          <select
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted/15 px-3 py-1.5 text-[10px] md:text-[11px] text-foreground appearance-none focus:border-primary focus:outline-none transition-all"
          >
            <option value="all">כל הנכסים</option>
            {[...new Set(trades.map(t => t.pair))].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={psyFilter}
            onChange={(e) => setPsyFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted/15 px-3 py-1.5 text-[10px] md:text-[11px] text-foreground appearance-none focus:border-primary focus:outline-none transition-all"
          >
            <option value="all">כל העסקאות</option>
            <option value="mistakes">טעויות פסיכולוגיות</option>
            <option value="plan">לפי תוכנית</option>
          </select>

          <button className="rounded-lg border border-border bg-muted/15 px-3 py-1.5 text-[10px] md:text-[11px] text-muted-foreground flex items-center gap-1.5 hover:text-foreground transition-all">
            <Calendar className="h-3 w-3" />
            טווח תאריכים
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
        <div className="rounded-xl border border-border bg-secondary/20 p-3 md:p-4 text-center">
          <p className={`text-base md:text-xl font-bold ${weekPnl >= 0 ? "text-accent" : "text-destructive"}`}>
            {weekPnl >= 0 ? "+" : ""}{weekPnl.toLocaleString()}$
          </p>
          <p className="text-[8px] md:text-[10px] text-muted-foreground mt-0.5">P&L שבועי</p>
        </div>
        <div className="rounded-xl border border-border bg-secondary/20 p-3 md:p-4 text-center">
          <p className="text-base md:text-xl font-bold text-foreground">{winRate}%</p>
          <p className="text-[8px] md:text-[10px] text-muted-foreground mt-0.5">אחוז הצלחה</p>
        </div>
        <div className="rounded-xl border border-border bg-secondary/20 p-3 md:p-4 text-center">
          <p className="text-base md:text-xl font-bold text-primary">A-</p>
          <p className="text-[8px] md:text-[10px] text-muted-foreground mt-0.5">ציון משמעת AI</p>
        </div>
      </div>

      {/* Trade List */}
      <div className="space-y-2">
        {filtered.map((t) => {
          const expanded = expandedId === t.id;
          return (
            <div key={t.id} className="rounded-xl border border-border/60 bg-secondary/20 overflow-hidden transition-all">
              {/* Collapsed Row */}
              <button
                onClick={() => setExpandedId(expanded ? null : t.id)}
                className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-3.5 text-right hover:bg-muted/10 transition-all"
              >
                {/* Asset + Direction */}
                <div className="flex items-center gap-2 min-w-0 shrink-0">
                  <div className={`flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg border ${
                    t.dir === "Long" ? "border-accent/20 bg-accent/8" : "border-destructive/20 bg-destructive/8"
                  }`}>
                    {t.dir === "Long"
                      ? <ArrowUpRight className="h-3.5 w-3.5 text-accent" />
                      : <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
                    }
                  </div>
                  <div className="text-right min-w-0">
                    <p className="text-[11px] md:text-xs font-bold text-foreground truncate">{t.pair}</p>
                    <p className="text-[8px] md:text-[9px] text-muted-foreground/50">{t.date} • {t.entryTime}</p>
                  </div>
                </div>

                {/* P&L */}
                <div className="mr-auto md:mr-0 md:flex-1 text-left md:text-center">
                  <p className={`text-xs md:text-sm font-bold ${t.pnl > 0 ? "text-accent" : "text-destructive"}`}>
                    {t.pnl > 0 ? "+" : ""}{t.pnl}$
                  </p>
                </div>

                {/* Grade Badge */}
                <span className={`hidden sm:flex shrink-0 rounded-md border px-2 py-0.5 text-[9px] font-bold ${gradeColors[t.grade]}`}>
                  {t.grade}
                </span>

                {/* Psy Tag */}
                <span className={`hidden md:flex shrink-0 rounded-md border px-2 py-0.5 text-[8px] font-medium ${psyColors[t.psyType]}`}>
                  {t.psyTag}
                </span>

                {/* Icons */}
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  {t.hasAudio && (
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary">
                      <Volume2 className="h-2.5 w-2.5" />
                    </span>
                  )}
                  {t.autoSync && (
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-muted/30 text-muted-foreground">
                      <RefreshCw className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>

                {/* Expand */}
                <div className="shrink-0 text-muted-foreground/40">
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {/* Mobile badges (below main row) */}
              <div className="flex sm:hidden items-center gap-1.5 px-3 pb-2 -mt-1">
                <span className={`rounded-md border px-1.5 py-0.5 text-[8px] font-bold ${gradeColors[t.grade]}`}>{t.grade}</span>
                <span className={`rounded-md border px-1.5 py-0.5 text-[7px] font-medium ${psyColors[t.psyType]}`}>{t.psyTag}</span>
                {t.hasAudio && <Volume2 className="h-3 w-3 text-primary/50" />}
                {t.autoSync && <RefreshCw className="h-3 w-3 text-muted-foreground/30" />}
              </div>

              {/* Expanded Detail */}
              {expanded && (
                <div className="border-t border-border/30 bg-muted/[0.03] px-3 md:px-5 py-4 animate-in slide-in-from-top-2 fade-in duration-200">
                  {/* Chart Placeholder */}
                  <div className="relative rounded-xl border border-border/40 bg-muted/10 overflow-hidden mb-4 h-32 md:h-44">
                    <TradeChart bull={t.pnl > 0} />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <span className="rounded bg-background/80 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-bold text-foreground border border-border/30">{t.pair}</span>
                      <span className={`rounded backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-bold border ${
                        t.dir === "Long" ? "bg-accent/20 text-accent border-accent/20" : "bg-destructive/20 text-destructive border-destructive/20"
                      }`}>{t.dir}</span>
                    </div>
                    {/* Entry/Exit markers */}
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                      <span className="rounded bg-primary/20 backdrop-blur-sm px-1.5 py-0.5 text-[7px] font-semibold text-primary border border-primary/20">
                        כניסה: {t.entry}
                      </span>
                      <span className={`rounded backdrop-blur-sm px-1.5 py-0.5 text-[7px] font-semibold border ${
                        t.pnl > 0 ? "bg-accent/20 text-accent border-accent/20" : "bg-destructive/20 text-destructive border-destructive/20"
                      }`}>
                        יציאה: {t.exit}
                      </span>
                    </div>
                  </div>

                  {/* Trade Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {[
                      { label: "שעת כניסה", value: t.entryTime, icon: <Clock className="h-3 w-3" /> },
                      { label: "שעת יציאה", value: t.exitTime, icon: <Clock className="h-3 w-3" /> },
                      { label: "R:R", value: t.rr, icon: <Target className="h-3 w-3" /> },
                      { label: "לוט", value: t.lots.toString(), icon: <BarChart3 className="h-3 w-3" /> },
                    ].map((d) => (
                      <div key={d.label} className="rounded-lg border border-border/30 bg-muted/10 p-2.5">
                        <div className="flex items-center gap-1 text-muted-foreground/50 mb-1">
                          {d.icon}
                          <span className="text-[8px]">{d.label}</span>
                        </div>
                        <p className="text-[11px] font-bold text-foreground">{d.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI Analysis */}
                  <div className={`rounded-xl border p-3.5 flex items-start gap-2.5 ${
                    t.psyType === "good"
                      ? "border-accent/15 bg-accent/[0.03]"
                      : t.psyType === "warning"
                        ? "border-yellow-400/15 bg-yellow-400/[0.03]"
                        : "border-destructive/15 bg-destructive/[0.03]"
                  }`}>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      t.psyType === "good" ? "bg-accent/15" : t.psyType === "warning" ? "bg-yellow-400/15" : "bg-destructive/15"
                    }`}>
                      <Brain className={`h-3.5 w-3.5 ${
                        t.psyType === "good" ? "text-accent" : t.psyType === "warning" ? "text-yellow-400" : "text-destructive"
                      }`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-foreground mb-1">ניתוח ה-AI:</p>
                      <p className="text-[9px] md:text-[10px] text-muted-foreground leading-[1.8]">{t.aiNote}</p>
                      {t.slMoved && (
                        <div className="mt-2 flex items-center gap-1 text-[8px] text-destructive/70">
                          <AlertTriangle className="h-3 w-3" />
                          סטופ-לוס הוזז במהלך העסקה
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audio Playback */}
                  {t.hasAudio && (
                    <div className="mt-3 flex items-center gap-3 rounded-lg border border-primary/15 bg-primary/[0.03] px-3 py-2.5">
                      <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/25 text-primary hover:bg-primary/25 transition-all">
                        <Play className="h-3 w-3 mr-[-1px]" />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-end gap-[2px] h-4">
                          {Array.from({ length: 40 }, (_, i) => (
                            <div key={i} className="flex-1 rounded-full bg-primary/30" style={{ height: `${20 + Math.random() * 80}%` }} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[9px] text-muted-foreground shrink-0">0:42</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-8 w-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground/50">אין עסקאות שמתאימות לפילטר</p>
        </div>
      )}
    </div>
  );
};

/* Mini chart for expanded view */
const TradeChart = ({ bull }: { bull: boolean }) => {
  const bars = Array.from({ length: 50 }, (_, i) => ({
    h: 20 + Math.random() * 50,
    up: bull ? (i > 25 ? Math.random() > 0.3 : Math.random() > 0.5) : (i > 25 ? Math.random() > 0.6 : Math.random() > 0.4),
  }));

  return (
    <div className="flex items-end gap-[1.5px] h-full px-4 pb-8 pt-8">
      {bars.map((b, i) => (
        <div
          key={i}
          className={`flex-1 rounded-[0.5px] ${b.up ? "bg-accent/30" : "bg-destructive/25"}`}
          style={{ height: `${b.h}%` }}
        />
      ))}
    </div>
  );
};

export default JournalPage;
