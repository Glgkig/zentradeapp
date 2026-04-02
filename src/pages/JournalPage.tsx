import { useState } from "react";
import {
  Search, ChevronDown, ArrowUpRight, ArrowDownRight,
  Sparkles, Brain, AlertTriangle, Clock, Target,
  BarChart3, Mic, Play, Volume2,
} from "lucide-react";

/* ===== Trade Data ===== */
const trades = [
  {
    id: 1, asset: "NAS100", dir: "Long" as const, entry: 18320, exit: 18410,
    pnl: 450, date: "03 אפריל, 14:30", tags: ["SMC", "FVG", "15m"],
    aiNote: "✨ AI: ניהול סיכונים מצוין. חתכת הפסד בזמן לפי התוכנית.",
    rr: "1:3.2", lots: 0.5, exitTime: "15:45", slMoved: false, hasAudio: true,
  },
  {
    id: 2, asset: "XAUUSD", dir: "Short" as const, entry: 2185.40, exit: 2172.10,
    pnl: 680, date: "03 אפריל, 09:15", tags: ["Liquidity Sweep", "1H"],
    aiNote: "✨ AI: כניסה מדויקת אחרי סוויפ נזילות. סבלנות מעולה.",
    rr: "1:2.8", lots: 0.3, exitTime: "11:30", slMoved: false, hasAudio: false,
  },
  {
    id: 3, asset: "EUR/USD", dir: "Long" as const, entry: 1.0842, exit: 1.0810,
    pnl: -150, date: "02 אפריל, 16:20", tags: ["BOS", "Reversal", "5m"],
    aiNote: "⚠️ AI: כניסה מוקדמת לפני אישור CHoCH. הזזת סטופ פעם אחת.",
    rr: "-1:1.2", lots: 0.4, exitTime: "16:48", slMoved: true, hasAudio: true,
  },
  {
    id: 4, asset: "BTC/USD", dir: "Long" as const, entry: 87420, exit: 88150,
    pnl: 730, date: "02 אפריל, 10:10", tags: ["SMC", "Order Block", "4H"],
    aiNote: "✨ AI: סבלנות מצוינת. חיכית לאישור ונכנסת בזמן הנכון.",
    rr: "1:2.8", lots: 0.1, exitTime: "13:55", slMoved: false, hasAudio: false,
  },
  {
    id: 5, asset: "GBP/USD", dir: "Short" as const, entry: 1.2715, exit: 1.2750,
    pnl: -210, date: "01 אפריל, 15:31", tags: ["FOMO", "Revenge Trade"],
    aiNote: "🚨 AI: מסחר נקמה. נפתח 4 דקות אחרי הפסד קודם. הלוט הוגדל פי 2.",
    rr: "-1:1", lots: 0.8, exitTime: "15:58", slMoved: true, hasAudio: true,
  },
  {
    id: 6, asset: "NAS100", dir: "Long" as const, entry: 18180, exit: 18295,
    pnl: 520, date: "01 אפריל, 08:15", tags: ["ICT", "FVG", "15m"],
    aiNote: "✨ AI: ביצוע מושלם. הסטאפ עבד כמתוכנן, יחס R:R מעולה.",
    rr: "1:3.5", lots: 0.3, exitTime: "10:30", slMoved: false, hasAudio: false,
  },
];

type FilterType = "all" | "long" | "short" | "win" | "loss";

const filterLabels: { key: FilterType; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "long", label: "לונג" },
  { key: "short", label: "שורט" },
  { key: "win", label: "מרוויחות" },
  { key: "loss", label: "מפסידות" },
];

const JournalPage = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const filtered = trades.filter(t => {
    if (filter === "long" && t.dir !== "Long") return false;
    if (filter === "short" && t.dir !== "Short") return false;
    if (filter === "win" && t.pnl <= 0) return false;
    if (filter === "loss" && t.pnl >= 0) return false;
    if (search && !t.asset.toLowerCase().includes(search.toLowerCase()) && !t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-[960px]" dir="rtl">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-black text-foreground tracking-tight mb-1">
            יומן מסחר חכם
          </h1>
          <p className="text-xs text-muted-foreground/50">כל עסקה מנותחת אוטומטית · AI תובנות · דפוסים פסיכולוגיים</p>
        </div>
        <button className="haptic-press group flex items-center gap-2 self-start rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all min-h-[44px]">
          <Mic className="h-4 w-4" />
          הקלט יומן קולי
        </button>
      </div>

      {/* ── Search & Filters ── */}
      <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חפש נכס או סטאפ..."
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pr-10 pl-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {filterLabels.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold transition-all duration-200 ${
                filter === f.key
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "bg-white/[0.04] text-muted-foreground/50 border border-white/[0.06] hover:text-foreground/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Trade Feed ── */}
      <div className="space-y-3">
        {filtered.map((t, index) => {
          const expanded = expandedId === t.id;
          const isWin = t.pnl > 0;
          const edgeColor = isWin ? "bg-accent" : "bg-destructive";

          return (
            <div
              key={t.id}
              className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${
                expanded
                  ? "border-white/[0.1] bg-white/[0.04] backdrop-blur-md"
                  : "border-white/[0.06] bg-white/[0.025] backdrop-blur-md hover:border-white/[0.1] hover:bg-white/[0.04]"
              }`}
              style={{ animationDelay: `${index * 50}ms`, animationDuration: "400ms" }}
            >
              {/* Color Edge */}
              <div className={`absolute top-0 bottom-0 right-0 w-[3px] ${edgeColor} rounded-r-full`} />

              {/* Main Row */}
              <button
                onClick={() => setExpandedId(expanded ? null : t.id)}
                className="w-full flex items-center gap-3 md:gap-5 px-5 pr-7 py-4 text-right"
              >
                {/* P&L */}
                <div className="shrink-0 w-20 md:w-24 text-left">
                  <p className={`text-lg md:text-xl font-black tracking-tight ${isWin ? "text-accent" : "text-destructive"}`}>
                    {isWin ? "+" : ""}{t.pnl}$
                  </p>
                  <p className="text-[8px] text-muted-foreground/30 font-medium mt-0.5">R:R {t.rr}</p>
                </div>

                {/* Asset + Date */}
                <div className="min-w-0 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${isWin ? "bg-accent/10" : "bg-destructive/10"}`}>
                      {t.dir === "Long"
                        ? <ArrowUpRight className={`h-3.5 w-3.5 ${isWin ? "text-accent" : "text-destructive"}`} />
                        : <ArrowDownRight className={`h-3.5 w-3.5 ${isWin ? "text-accent" : "text-destructive"}`} />
                      }
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {t.asset} <span className="text-muted-foreground/40 font-medium">• {t.dir === "Long" ? "לונג" : "שורט"}</span>
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground/40 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {t.date}
                  </p>
                </div>

                {/* Tags */}
                <div className="hidden md:flex flex-wrap gap-1.5 flex-1 justify-center">
                  {t.tags.map(tag => (
                    <span key={tag} className="rounded-full bg-white/[0.05] border border-white/[0.07] px-2.5 py-0.5 text-[9px] font-semibold text-muted-foreground/50 backdrop-blur-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* AI Insight Preview */}
                <div className="hidden lg:flex items-start gap-1.5 flex-1 max-w-[260px]">
                  <Sparkles className="h-3.5 w-3.5 text-primary/50 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground/50 leading-relaxed line-clamp-2">
                    {t.aiNote}
                  </p>
                </div>

                {/* Chevron */}
                <div className={`shrink-0 transition-transform duration-300 ${expanded ? "rotate-180" : ""} text-muted-foreground/25`}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>

              {/* Mobile tags */}
              <div className="flex md:hidden flex-wrap gap-1.5 px-5 pr-7 pb-2 -mt-1">
                {t.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-white/[0.05] border border-white/[0.07] px-2 py-0.5 text-[8px] font-semibold text-muted-foreground/50">
                    {tag}
                  </span>
                ))}
              </div>

              {/* ── Expanded Detail ── */}
              {expanded && (
                <div className="border-t border-white/[0.06] px-5 pr-7 py-5 animate-in slide-in-from-top-2 fade-in duration-300 space-y-4">
                  {/* Detail Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { label: "מחיר כניסה", value: t.entry.toLocaleString(), icon: <Target className="h-3 w-3" /> },
                      { label: "מחיר יציאה", value: t.exit.toLocaleString(), icon: <Target className="h-3 w-3" /> },
                      { label: "שעת יציאה", value: t.exitTime, icon: <Clock className="h-3 w-3" /> },
                      { label: "לוט", value: t.lots.toString(), icon: <BarChart3 className="h-3 w-3" /> },
                    ].map(d => (
                      <div key={d.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground/35 mb-1.5">
                          {d.icon}
                          <span className="text-[8px] font-medium">{d.label}</span>
                        </div>
                        <p className="text-xs font-bold text-foreground/80">{d.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chart Placeholder */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] h-32 flex items-center justify-center">
                    <p className="text-[10px] text-muted-foreground/25 font-medium">📊 גרף עסקה — בקרוב</p>
                  </div>

                  {/* AI Analysis */}
                  <div className={`rounded-2xl border p-4 flex items-start gap-3 ${
                    isWin
                      ? "border-accent/12 bg-accent/[0.03]"
                      : "border-destructive/12 bg-destructive/[0.03]"
                  }`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isWin ? "bg-accent/12" : "bg-destructive/12"}`}>
                      <Brain className={`h-4 w-4 ${isWin ? "text-accent" : "text-destructive"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-foreground/80 mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-primary/50" />
                        ניתוח ה-AI
                      </p>
                      <p className="text-[10px] md:text-[11px] text-muted-foreground/70 leading-[1.9]">{t.aiNote}</p>
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
                    <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary/[0.03] px-4 py-3">
                      <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 border border-primary/20 text-primary hover:bg-primary/20 transition-all">
                        <Play className="h-3.5 w-3.5 mr-[-1px]" />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-end gap-[2px] h-5">
                          {Array.from({ length: 45 }, (_, i) => (
                            <div key={i} className="flex-1 rounded-full bg-primary/25" style={{ height: `${15 + Math.sin(i * 0.5) * 40 + 30}%` }} />
                          ))}
                        </div>
                      </div>
                      <Volume2 className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                      <span className="text-[9px] text-muted-foreground/40 shrink-0 font-medium">0:42</span>
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/[0.08] mb-4">
            <Search className="h-6 w-6 text-muted-foreground/25" />
          </div>
          <p className="text-sm text-muted-foreground/40 font-medium">אין עסקאות שמתאימות לחיפוש</p>
        </div>
      )}
    </div>
  );
};

export default JournalPage;
