import { useState } from "react";
import {
  Search, ChevronDown, ArrowUpRight, ArrowDownRight,
  Sparkles, Brain, AlertTriangle, Clock, Target,
  BarChart3, Mic, Play, Volume2, FolderOpen, Plug,
} from "lucide-react";
import { useTrades } from "@/hooks/useTrades";

type FilterType = "all" | "long" | "short" | "win" | "loss";

const filterLabels: { key: FilterType; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "long", label: "לונג" },
  { key: "short", label: "שורט" },
  { key: "win", label: "מרוויחות" },
  { key: "loss", label: "מפסידות" },
];

const JournalPage = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const { data: trades = [], isLoading } = useTrades();

  const filtered = trades.filter(t => {
    if (filter === "long" && t.direction !== "long") return false;
    if (filter === "short" && t.direction !== "short") return false;
    if (filter === "win" && (t.pnl ?? 0) <= 0) return false;
    if (filter === "loss" && (t.pnl ?? 0) >= 0) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.symbol.toLowerCase().includes(q) && !(t.tags || []).some(tag => tag.toLowerCase().includes(q))) return false;
    }
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

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && trades.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-primary/[0.08] blur-[30px] animate-pulse" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <FolderOpen className="h-9 w-9 text-primary/40" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">היומן שלכם ריק</h2>
          <p className="text-sm text-muted-foreground/50 max-w-md mb-6 leading-relaxed">
            הגיע הזמן להתחיל לתעד את המסע שלכם. הוסיפו עסקה ידנית או חברו את חשבון המסחר.
          </p>
        </div>
      )}

      {/* ── Trade Feed ── */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((t, index) => {
            const expanded = expandedId === t.id;
            const isWin = (t.pnl ?? 0) > 0;
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
                      {t.pnl != null ? `${isWin ? "+" : ""}$${Math.abs(t.pnl).toLocaleString()}` : "—"}
                    </p>
                    {t.pnl_pct != null && (
                      <p className="text-[8px] text-muted-foreground/30 font-medium mt-0.5">{t.pnl_pct.toFixed(1)}%</p>
                    )}
                  </div>

                  {/* Asset + Date */}
                  <div className="min-w-0 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${isWin ? "bg-accent/10" : "bg-destructive/10"}`}>
                        {t.direction === "long"
                          ? <ArrowUpRight className={`h-3.5 w-3.5 ${isWin ? "text-accent" : "text-destructive"}`} />
                          : <ArrowDownRight className={`h-3.5 w-3.5 ${isWin ? "text-accent" : "text-destructive"}`} />
                        }
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {t.symbol} <span className="text-muted-foreground/40 font-medium">• {t.direction === "long" ? "לונג" : "שורט"}</span>
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground/40 font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(t.entry_time).toLocaleDateString("he-IL", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="hidden md:flex flex-wrap gap-1.5 flex-1 justify-center">
                    {(t.tags || []).map(tag => (
                      <span key={tag} className="rounded-full bg-white/[0.05] border border-white/[0.07] px-2.5 py-0.5 text-[9px] font-semibold text-muted-foreground/50 backdrop-blur-sm">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Chevron */}
                  <div className={`shrink-0 transition-transform duration-300 ${expanded ? "rotate-180" : ""} text-muted-foreground/25`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {/* Mobile tags */}
                {(t.tags || []).length > 0 && (
                  <div className="flex md:hidden flex-wrap gap-1.5 px-5 pr-7 pb-2 -mt-1">
                    {(t.tags || []).map(tag => (
                      <span key={tag} className="rounded-full bg-white/[0.05] border border-white/[0.07] px-2 py-0.5 text-[8px] font-semibold text-muted-foreground/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* ── Expanded Detail ── */}
                {expanded && (
                  <div className="border-t border-white/[0.06] px-5 pr-7 py-5 animate-in slide-in-from-top-2 fade-in duration-300 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { label: "מחיר כניסה", value: t.entry_price.toLocaleString(), icon: <Target className="h-3 w-3" /> },
                        { label: "מחיר יציאה", value: t.exit_price?.toLocaleString() || "—", icon: <Target className="h-3 w-3" /> },
                        { label: "לוט", value: t.lot_size.toString(), icon: <BarChart3 className="h-3 w-3" /> },
                        { label: "סטאפ", value: t.setup_type || "—", icon: <Sparkles className="h-3 w-3" /> },
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

                    {t.notes && (
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                        <p className="text-[10px] text-muted-foreground/30 mb-1 font-medium">הערות</p>
                        <p className="text-xs text-foreground/70 leading-relaxed">{t.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No search results */}
      {!isLoading && trades.length > 0 && filtered.length === 0 && (
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
