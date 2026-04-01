import { useState, useMemo } from "react";
import {
  Mic, Play, ChevronDown, ChevronUp, Calendar,
  ArrowUpRight, ArrowDownRight, Brain, AlertTriangle,
  Target, Clock, Volume2, RefreshCw,
  Search, BarChart3, Sparkles, TrendingUp, Award,
} from "lucide-react";

/* ===== Trade Data ===== */
const trades = [
  {
    id: 1, pair: "EUR/USD", dir: "Long" as const, entry: 1.0842, exit: 1.0887,
    pnl: 450, entryTime: "09:32", exitTime: "11:15", date: "30/03/2026",
    grade: "A+", psyTag: "לפי תוכנית המסחר", psyType: "good" as const,
    hasAudio: true, autoSync: true, rr: "1:3.2", lots: 0.5,
    aiNote: "עסקה מצוינת. נכנסת לפי הסטאפ, שמרת על הסטופ, ונתת לרווח לרוץ. ככה סוחרים ממושמעים.",
    slMoved: false,
  },
  {
    id: 2, pair: "GBP/USD", dir: "Short" as const, entry: 1.2715, exit: 1.2680,
    pnl: 280, entryTime: "14:05", exitTime: "15:42", date: "30/03/2026",
    grade: "B", psyTag: "הזזת סטופ-לוס", psyType: "warning" as const,
    hasAudio: false, autoSync: true, rr: "1:2.1", lots: 0.3,
    aiNote: "זיהיתי שהזזת את הסטופ-לוס פעם אחת במהלך העסקה. למרות שהרווחת, זו התנהגות מסוכנת שנוגדת את הסטאפ שהגדרת.",
    slMoved: true,
  },
  {
    id: 3, pair: "XAU/USD", dir: "Long" as const, entry: 2185.40, exit: 2178.20,
    pnl: -360, entryTime: "16:22", exitTime: "16:48", date: "29/03/2026",
    grade: "F", psyTag: "מסחר נקמה", psyType: "danger" as const,
    hasAudio: true, autoSync: true, rr: "-1:1.8", lots: 0.8,
    aiNote: "עסקה זו נפתחה 4 דקות אחרי הפסד קודם. זהו מסחר נקמה קלאסי. הגדלת את הלוט פי 2.6 מהרגיל. המערכת הייתה צריכה לנעול אותך.",
    slMoved: true,
  },
  {
    id: 4, pair: "BTC/USD", dir: "Long" as const, entry: 87420, exit: 88150,
    pnl: 730, entryTime: "10:10", exitTime: "13:55", date: "29/03/2026",
    grade: "A", psyTag: "לפי תוכנית המסחר", psyType: "good" as const,
    hasAudio: false, autoSync: true, rr: "1:2.8", lots: 0.1,
    aiNote: "סבלנות מצוינת. חיכית לאישור ונכנסת בזמן הנכון. הסטופ נשמר במקום.",
    slMoved: false,
  },
  {
    id: 5, pair: "NAS100", dir: "Short" as const, entry: 18542, exit: 18610,
    pnl: -204, entryTime: "15:31", exitTime: "15:58", date: "28/03/2026",
    grade: "D", psyTag: "כניסה מוקדמת מפומו", psyType: "danger" as const,
    hasAudio: true, autoSync: false, rr: "-1:1", lots: 0.4,
    aiNote: "נכנסת לפני אישור הנר. זיהיתי דפוס FOMO — הכניסה בוצעה 12 שניות אחרי תנועה חדה. תמיד תחכה לסגירת נר.",
    slMoved: false,
  },
  {
    id: 6, pair: "EUR/JPY", dir: "Long" as const, entry: 162.45, exit: 163.10,
    pnl: 520, entryTime: "08:15", exitTime: "10:30", date: "28/03/2026",
    grade: "A", psyTag: "לפי תוכנית המסחר", psyType: "good" as const,
    hasAudio: false, autoSync: true, rr: "1:3.5", lots: 0.3,
    aiNote: "ביצוע מושלם. הסטאפ עבד כמתוכנן, יחס R:R מעולה.",
    slMoved: false,
  },
];

const gradeConfig: Record<string, { color: string; glow: string }> = {
  "A+": { color: "text-accent", glow: "shadow-[0_0_12px_hsl(var(--accent)/0.3)]" },
  "A":  { color: "text-accent", glow: "shadow-[0_0_12px_hsl(var(--accent)/0.3)]" },
  "B":  { color: "text-primary", glow: "shadow-[0_0_12px_hsl(var(--primary)/0.3)]" },
  "C":  { color: "text-yellow-400", glow: "" },
  "D":  { color: "text-orange-400", glow: "" },
  "F":  { color: "text-destructive", glow: "shadow-[0_0_12px_hsl(var(--destructive)/0.3)]" },
};

const psyStyles = {
  good: "text-accent/90 bg-accent/8 border-accent/20",
  warning: "text-yellow-400/90 bg-yellow-400/8 border-yellow-400/20",
  danger: "text-destructive/90 bg-destructive/8 border-destructive/20",
};

/* ===== Page ===== */
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
      {/* ── Hero Header ── */}
      <div className="relative mb-6 rounded-2xl border border-border/40 bg-gradient-to-bl from-secondary/60 via-secondary/30 to-transparent p-5 md:p-7 overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-primary/[0.07] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-accent/[0.05] blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h1 className="font-heading text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
                יומן מסחר חכם
              </h1>
            </div>
            <p className="text-[11px] md:text-xs text-muted-foreground/70 leading-relaxed max-w-sm">
              כל העסקאות מנותחות אוטומטית ע״י ה-AI — תובנות, דפוסים פסיכולוגיים, וציוני משמעת
            </p>
          </div>
          <button className="interactive-btn group flex items-center gap-2 self-start rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-[11px] font-bold text-primary hover:bg-primary/20 hover:border-primary/30 hover:shadow-[0_0_15px_hsl(var(--primary)/0.1)] transition-all duration-300 min-h-[44px]">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <Mic className="h-3 w-3" />
            </div>
            הקלט יומן קולי
          </button>
        </div>

        {/* Filters */}
        <div className="relative flex flex-wrap gap-2 mt-5 pt-4 border-t border-border/20">
          <FilterSelect value={assetFilter} onChange={setAssetFilter}>
            <option value="all">כל הנכסים</option>
            {[...new Set(trades.map(t => t.pair))].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </FilterSelect>

          <FilterSelect value={psyFilter} onChange={setPsyFilter}>
            <option value="all">כל העסקאות</option>
            <option value="mistakes">טעויות פסיכולוגיות</option>
            <option value="plan">לפי תוכנית</option>
          </FilterSelect>

          <button className="rounded-xl border border-border/30 bg-muted/10 px-3.5 py-2 text-[10px] md:text-[11px] text-muted-foreground/60 flex items-center gap-1.5 hover:text-foreground hover:border-border/50 transition-all duration-300">
            <Calendar className="h-3 w-3" />
            טווח תאריכים
          </button>
        </div>
      </div>

      {/* ── Summary Strip ── */}
      <div className="grid grid-cols-3 gap-2.5 md:gap-3 mb-6">
        <SummaryCard
          value={`${weekPnl >= 0 ? "+" : ""}${weekPnl.toLocaleString()}$`}
          label="P&L שבועי"
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          accent={weekPnl >= 0 ? "accent" : "destructive"}
        />
        <SummaryCard
          value={`${winRate}%`}
          label="אחוז הצלחה"
          icon={<Target className="h-3.5 w-3.5" />}
          accent="primary"
        />
        <SummaryCard
          value="A-"
          label="ציון משמעת AI"
          icon={<Award className="h-3.5 w-3.5" />}
          accent="primary"
        />
      </div>

      {/* ── Trade List ── */}
      <div className="space-y-2">
        {filtered.map((t) => {
          const expanded = expandedId === t.id;
          const gc = gradeConfig[t.grade] || gradeConfig["C"];

          return (
            <div
              key={t.id}
              className={`group rounded-2xl border overflow-hidden transition-all duration-300 ${
                expanded
                  ? "border-border/50 bg-secondary/40 shadow-lg shadow-background/50"
                  : "border-border/25 bg-secondary/15 hover:border-border/40 hover:bg-secondary/25"
              }`}
            >
              {/* Row */}
              <button
                onClick={() => setExpandedId(expanded ? null : t.id)}
                className="w-full flex items-center gap-2.5 md:gap-3 px-3.5 md:px-5 py-3.5 md:py-4 text-right transition-all"
              >
                {/* Direction Icon */}
                <div className={`flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl border backdrop-blur-sm ${
                  t.dir === "Long"
                    ? "border-accent/15 bg-accent/8"
                    : "border-destructive/15 bg-destructive/8"
                }`}>
                  {t.dir === "Long"
                    ? <ArrowUpRight className="h-4 w-4 text-accent" />
                    : <ArrowDownRight className="h-4 w-4 text-destructive" />
                  }
                </div>

                {/* Pair + Date */}
                <div className="text-right min-w-0">
                  <p className="text-xs md:text-[13px] font-bold text-foreground tracking-wide">{t.pair}</p>
                  <p className="text-[8px] md:text-[9px] text-muted-foreground/40 mt-0.5 font-medium">{t.date} · {t.entryTime}</p>
                </div>

                {/* P&L */}
                <div className="mr-auto md:mr-0 md:flex-1 text-left md:text-center">
                  <p className={`text-sm md:text-base font-extrabold tracking-tight ${t.pnl > 0 ? "text-accent" : "text-destructive"}`}>
                    {t.pnl > 0 ? "+" : ""}{t.pnl}$
                  </p>
                  <p className="text-[7px] md:text-[8px] text-muted-foreground/30 font-medium">R:R {t.rr}</p>
                </div>

                {/* Grade */}
                <div className={`hidden sm:flex shrink-0 h-8 w-8 items-center justify-center rounded-xl border border-border/20 bg-muted/20 text-[10px] font-black ${gc.color} ${gc.glow}`}>
                  {t.grade}
                </div>

                {/* Psy Tag */}
                <span className={`hidden md:flex shrink-0 rounded-lg border px-2.5 py-1 text-[8px] font-semibold ${psyStyles[t.psyType]}`}>
                  {t.psyTag}
                </span>

                {/* Indicators */}
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                  {t.hasAudio && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/8 border border-primary/15 text-primary/60">
                      <Volume2 className="h-2.5 w-2.5" />
                    </span>
                  )}
                  {t.autoSync && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted/20 border border-border/15 text-muted-foreground/40">
                      <RefreshCw className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>

                {/* Chevron */}
                <div className={`shrink-0 transition-transform duration-300 ${expanded ? "rotate-180" : ""} text-muted-foreground/30`}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>

              {/* Mobile badges */}
              <div className="flex sm:hidden items-center gap-1.5 px-3.5 pb-2.5 -mt-1">
                <span className={`rounded-lg border px-2 py-0.5 text-[8px] font-black ${gc.color} bg-muted/15 border-border/20`}>{t.grade}</span>
                <span className={`rounded-lg border px-2 py-0.5 text-[7px] font-semibold ${psyStyles[t.psyType]}`}>{t.psyTag}</span>
                {t.hasAudio && <Volume2 className="h-3 w-3 text-primary/40" />}
                {t.autoSync && <RefreshCw className="h-3 w-3 text-muted-foreground/25" />}
              </div>

              {/* ── Expanded Detail ── */}
              {expanded && (
                <div className="border-t border-border/15 bg-gradient-to-b from-muted/[0.04] to-transparent px-4 md:px-6 py-5 animate-in slide-in-from-top-2 fade-in duration-300">
                  {/* Chart */}
                  <TradeChartContainer trade={t} />

                  {/* Detail Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
                    {[
                      { label: "שעת כניסה", value: t.entryTime, icon: <Clock className="h-3 w-3" /> },
                      { label: "שעת יציאה", value: t.exitTime, icon: <Clock className="h-3 w-3" /> },
                      { label: "R:R", value: t.rr, icon: <Target className="h-3 w-3" /> },
                      { label: "לוט", value: t.lots.toString(), icon: <BarChart3 className="h-3 w-3" /> },
                    ].map((d) => (
                      <div key={d.label} className="rounded-xl border border-border/15 bg-muted/[0.05] p-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground/40 mb-1.5">
                          {d.icon}
                          <span className="text-[8px] font-medium">{d.label}</span>
                        </div>
                        <p className="text-xs font-bold text-foreground">{d.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI Analysis */}
                  <div className={`rounded-2xl border p-4 flex items-start gap-3 ${
                    t.psyType === "good"
                      ? "border-accent/12 bg-accent/[0.03]"
                      : t.psyType === "warning"
                        ? "border-yellow-400/12 bg-yellow-400/[0.03]"
                        : "border-destructive/12 bg-destructive/[0.03]"
                  }`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      t.psyType === "good" ? "bg-accent/12" : t.psyType === "warning" ? "bg-yellow-400/12" : "bg-destructive/12"
                    }`}>
                      <Brain className={`h-4 w-4 ${
                        t.psyType === "good" ? "text-accent" : t.psyType === "warning" ? "text-yellow-400" : "text-destructive"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-foreground/80 mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-primary/50" />
                        ניתוח ה-AI
                      </p>
                      <p className="text-[10px] md:text-[11px] text-muted-foreground/80 leading-[1.9]">{t.aiNote}</p>
                      {t.slMoved && (
                        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-destructive/8 border border-destructive/10 px-2.5 py-1.5 text-[8px] text-destructive/80 font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          סטופ-לוס הוזז במהלך העסקה
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audio */}
                  {t.hasAudio && (
                    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary/[0.03] px-4 py-3">
                      <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 border border-primary/20 text-primary hover:bg-primary/20 transition-all duration-300">
                        <Play className="h-3.5 w-3.5 mr-[-1px]" />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-end gap-[2px] h-5">
                          {Array.from({ length: 45 }, (_, i) => (
                            <div key={i} className="flex-1 rounded-full bg-primary/25" style={{ height: `${15 + Math.random() * 85}%` }} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[9px] text-muted-foreground/50 shrink-0 font-medium">0:42</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/15 border border-border/20 mb-4">
            <Search className="h-6 w-6 text-muted-foreground/25" />
          </div>
          <p className="text-sm text-muted-foreground/40 font-medium">אין עסקאות שמתאימות לפילטר</p>
        </div>
      )}
    </div>
  );
};

/* ── Sub-Components ── */

const FilterSelect = ({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="rounded-xl border border-border/25 bg-muted/10 px-3.5 py-2 text-[10px] md:text-[11px] text-foreground/80 font-medium appearance-none focus:border-primary/40 focus:outline-none transition-all duration-300 hover:bg-muted/20"
  >
    {children}
  </select>
);

const SummaryCard = ({ value, label, icon, accent }: { value: string; label: string; icon: React.ReactNode; accent: string }) => (
  <div className="relative rounded-2xl border border-border/25 bg-secondary/20 p-3.5 md:p-5 text-center overflow-hidden group hover:border-border/40 transition-all duration-300">
    <div className={`absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-30 ${
      accent === "accent" ? "bg-accent/20" : accent === "destructive" ? "bg-destructive/20" : "bg-primary/20"
    }`} />
    <div className="relative">
      <div className={`flex items-center justify-center gap-1 mb-1 ${
        accent === "accent" ? "text-accent" : accent === "destructive" ? "text-destructive" : "text-primary"
      }`}>
        {icon}
      </div>
      <p className={`text-lg md:text-2xl font-extrabold tracking-tight ${
        accent === "accent" ? "text-accent" : accent === "destructive" ? "text-destructive" : "text-foreground"
      }`}>
        {value}
      </p>
      <p className="text-[8px] md:text-[9px] text-muted-foreground/40 mt-1 font-medium tracking-wide">{label}</p>
    </div>
  </div>
);

/* ── Realistic TradingView-Style Chart ── */
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateCandles = (id: number, bull: boolean, tf: string) => {
  const tfSeed = tf === "15m" ? 1 : tf === "1H" ? 2 : tf === "4H" ? 3 : tf === "1D" ? 4 : 5;
  const seed = id * 100 + tfSeed * 7;
  const count = tf === "15m" ? 80 : tf === "1H" ? 60 : tf === "4H" ? 45 : 30;
  const candles: { o: number; h: number; l: number; c: number }[] = [];
  let price = 50 + seededRandom(seed) * 20;
  const vol = tf === "15m" ? 0.6 : tf === "1H" ? 1.0 : tf === "4H" ? 1.4 : 2.0;

  for (let i = 0; i < count; i++) {
    const trend = bull
      ? (i < count * 0.3 ? -0.1 : i < count * 0.6 ? 0.5 : i < count * 0.8 ? 0.3 : -0.1)
      : (i < count * 0.3 ? 0.2 : i < count * 0.6 ? -0.4 : i < count * 0.8 ? -0.3 : 0.1);
    const volatility = (0.8 + seededRandom(seed * 10 + i * 7) * 1.5) * vol;
    const change = (seededRandom(seed * 5 + i * 13) - 0.45 + trend * 0.3) * volatility;
    const o = price;
    const c = price + change;
    const wick = seededRandom(seed * 3 + i * 17) * 0.8 * vol;
    const h = Math.max(o, c) + wick;
    const l = Math.min(o, c) - wick;
    candles.push({ o, h, l, c });
    price = c;
  }
  return candles;
};

type TradeData = typeof trades[0];
const TIMEFRAMES = ["5m", "15m", "1H", "4H", "1D"] as const;

const TradeChartContainer = ({ trade }: { trade: TradeData }) => {
  const [tf, setTf] = useState("1H");

  return (
    <div className="relative rounded-2xl border border-border/20 bg-[hsl(0,0%,3%)] overflow-hidden mb-5 h-56 md:h-80">
      {/* Timeframe selector */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-0.5 z-20">
        {TIMEFRAMES.map((t) => (
          <button
            key={t}
            onClick={(e) => { e.stopPropagation(); setTf(t); }}
            className={`rounded-md px-2 py-0.5 text-[7px] font-bold border transition-all duration-200 cursor-pointer ${
              tf === t
                ? "bg-primary/20 text-primary border-primary/25 shadow-[0_0_8px_hsl(var(--primary)/0.15)]"
                : "bg-[hsl(0,0%,8%)] text-muted-foreground/40 border-[hsl(0,0%,12%)] hover:text-muted-foreground/60 hover:bg-[hsl(0,0%,10%)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <TradingViewChart trade={trade} timeframe={tf} />
    </div>
  );
};

const TradingViewChart = ({ trade, timeframe }: { trade: TradeData; timeframe: string }) => {
  const candles = useMemo(() => generateCandles(trade.id, trade.pnl > 0, timeframe), [trade.id, trade.pnl, timeframe]);
  const allPrices = candles.flatMap(c => [c.h, c.l]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const range = maxP - minP || 1;

  const toY = (p: number) => 90 - ((p - minP) / range) * 75;

  // Key levels
  const entryIdx = 18 + Math.floor(seededRandom(trade.id * 77) * 5);
  const exitIdx = 45 + Math.floor(seededRandom(trade.id * 33) * 8);
  const entryPrice = candles[entryIdx]?.c ?? 50;
  const exitPrice = candles[Math.min(exitIdx, candles.length - 1)]?.c ?? 50;

  // Support/resistance zones
  const supportLevel = minP + range * (0.15 + seededRandom(trade.id * 55) * 0.1);
  const resistanceLevel = maxP - range * (0.1 + seededRandom(trade.id * 44) * 0.1);

  // EMA line
  const emaPoints = candles.reduce<number[]>((acc, c, i) => {
    if (i === 0) return [c.c];
    const k = 2 / (12 + 1);
    acc.push(c.c * k + acc[i - 1] * (1 - k));
    return acc;
  }, []);
  const emaPath = emaPoints.map((p, i) => {
    const x = 2 + (i / (candles.length - 1)) * 96;
    return `${i === 0 ? "M" : "L"}${x},${toY(p)}`;
  }).join(" ");

  const candleW = 96 / candles.length;

  return (
    <div className="relative w-full h-full">
      {/* Grid */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {/* Horizontal grid lines */}
        {[20, 35, 50, 65, 80].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(0,0%,12%)" strokeWidth="0.15" strokeDasharray="1,1" />
        ))}
        {/* Vertical grid lines */}
        {[15, 30, 45, 60, 75, 90].map(x => (
          <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="hsl(0,0%,12%)" strokeWidth="0.15" strokeDasharray="1,1" />
        ))}

        {/* Support zone */}
        <rect x="0" y={toY(supportLevel + range * 0.03)} width="100" height={Math.abs(toY(supportLevel) - toY(supportLevel + range * 0.03))} fill="hsl(160,60%,45%)" opacity="0.04" />
        <line x1="0" y1={toY(supportLevel)} x2="100" y2={toY(supportLevel)} stroke="hsl(160,60%,45%)" strokeWidth="0.2" strokeDasharray="1.5,1" opacity="0.3" />

        {/* Resistance zone */}
        <rect x="0" y={toY(resistanceLevel)} width="100" height={Math.abs(toY(resistanceLevel - range * 0.03) - toY(resistanceLevel))} fill="hsl(0,72%,51%)" opacity="0.04" />
        <line x1="0" y1={toY(resistanceLevel)} x2="100" y2={toY(resistanceLevel)} stroke="hsl(0,72%,51%)" strokeWidth="0.2" strokeDasharray="1.5,1" opacity="0.3" />

        {/* EMA line */}
        <path d={emaPath} fill="none" stroke="hsl(45,100%,60%)" strokeWidth="0.3" opacity="0.4" />

        {/* Candles */}
        {candles.map((c, i) => {
          const x = 2 + i * candleW;
          const cx = x + candleW * 0.5;
          const isUp = c.c >= c.o;
          const color = isUp ? "hsl(160,60%,45%)" : "hsl(0,72%,51%)";
          const bodyTop = toY(Math.max(c.o, c.c));
          const bodyH = Math.max(0.4, Math.abs(toY(c.o) - toY(c.c)));

          return (
            <g key={i}>
              {/* Wick */}
              <line x1={cx} y1={toY(c.h)} x2={cx} y2={toY(c.l)} stroke={color} strokeWidth="0.15" opacity="0.7" />
              {/* Body */}
              <rect
                x={x + candleW * 0.15}
                y={bodyTop}
                width={candleW * 0.7}
                height={bodyH}
                fill={isUp ? color : color}
                opacity={isUp ? 0.85 : 0.75}
                rx="0.1"
              />
            </g>
          );
        })}

        {/* Entry marker */}
        <line
          x1={2 + entryIdx * candleW + candleW * 0.5}
          y1={toY(entryPrice) - 1}
          x2={2 + entryIdx * candleW + candleW * 0.5}
          y2={toY(entryPrice) + 1}
          stroke="hsl(217,72%,53%)"
          strokeWidth="0.3"
        />
        <circle
          cx={2 + entryIdx * candleW + candleW * 0.5}
          cy={toY(entryPrice)}
          r="0.8"
          fill="hsl(217,72%,53%)"
          opacity="0.9"
        />
        {/* Entry horizontal line */}
        <line
          x1={2 + entryIdx * candleW + candleW * 0.5}
          y1={toY(entryPrice)}
          x2="98"
          y2={toY(entryPrice)}
          stroke="hsl(217,72%,53%)"
          strokeWidth="0.15"
          strokeDasharray="0.8,0.5"
          opacity="0.5"
        />

        {/* Exit marker */}
        <line
          x1={2 + Math.min(exitIdx, candles.length - 1) * candleW + candleW * 0.5}
          y1={toY(exitPrice) - 1}
          x2={2 + Math.min(exitIdx, candles.length - 1) * candleW + candleW * 0.5}
          y2={toY(exitPrice) + 1}
          stroke={trade.pnl > 0 ? "hsl(160,60%,45%)" : "hsl(0,72%,51%)"}
          strokeWidth="0.3"
        />
        <circle
          cx={2 + Math.min(exitIdx, candles.length - 1) * candleW + candleW * 0.5}
          cy={toY(exitPrice)}
          r="0.8"
          fill={trade.pnl > 0 ? "hsl(160,60%,45%)" : "hsl(0,72%,51%)"}
          opacity="0.9"
        />

        {/* Trade zone highlight */}
        <rect
          x={2 + entryIdx * candleW}
          y="5"
          width={(Math.min(exitIdx, candles.length - 1) - entryIdx) * candleW}
          height="90"
          fill={trade.pnl > 0 ? "hsl(160,60%,45%)" : "hsl(0,72%,51%)"}
          opacity="0.03"
        />
      </svg>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(0,0%,3%)]/60 via-transparent to-transparent pointer-events-none" />

      {/* Top labels */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
        <span className="rounded-md bg-[hsl(0,0%,6%)]/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-foreground border border-[hsl(0,0%,15%)]">{trade.pair}</span>
        <span className={`rounded-md backdrop-blur-md px-2 py-0.5 text-[9px] font-bold border ${
          trade.dir === "Long" ? "bg-accent/15 text-accent border-accent/10" : "bg-destructive/15 text-destructive border-destructive/10"
        }`}>{trade.dir}</span>
        <span className="rounded-md bg-yellow-400/10 backdrop-blur-md px-2 py-0.5 text-[8px] font-semibold text-yellow-400/70 border border-yellow-400/10">EMA 12</span>
      </div>

      {/* Bottom entry/exit badges */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between z-10">
        <span className="rounded-lg bg-primary/15 backdrop-blur-md px-2.5 py-1 text-[8px] font-bold text-primary border border-primary/15 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          כניסה: {trade.entry}
        </span>
        <span className={`rounded-lg backdrop-blur-md px-2.5 py-1 text-[8px] font-bold border flex items-center gap-1 ${
          trade.pnl > 0 ? "bg-accent/15 text-accent border-accent/15" : "bg-destructive/15 text-destructive border-destructive/15"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${trade.pnl > 0 ? "bg-accent" : "bg-destructive"}`} />
          יציאה: {trade.exit}
        </span>
      </div>

      {/* Right-side price scale */}
      <div className="absolute top-4 bottom-8 right-0 w-8 flex flex-col justify-between items-end pr-1.5 z-10 pointer-events-none">
        {[maxP, maxP - range * 0.25, maxP - range * 0.5, maxP - range * 0.75, minP].map((p, i) => (
          <span key={i} className="text-[6px] text-muted-foreground/25 font-mono">{p.toFixed(1)}</span>
        ))}
      </div>
    </div>
  );
};

export default JournalPage;
