import { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowUpRight, ArrowDownRight, X, Search,
  Brain, Zap,
  Image as ImageIcon, CheckCircle2, AlertTriangle, Loader2,
  Star, Shield, BarChart2, Save, TrendingUp, Building2, BookOpen,
  Wind, Flame, Crosshair, Moon, ChevronLeft, ChevronRight, Lightbulb, TriangleAlert,
  FlaskConical, ChevronDown, ChevronUp, TrendingDown, Clock, Activity,
} from "lucide-react";
import { loadChallenge, type ActiveChallenge } from "@/pages/NostroHubPage";
import { useTrades, useUpdateTrade } from "@/hooks/useTrades";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ── Helpers ── */
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("he-IL", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
const fmtTime = (s: string) =>
  new Date(s).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
const fmtShortDate = (s: string) =>
  new Date(s).toLocaleDateString("he-IL", { day: "2-digit", month: "short" });
const fmtMonthYear = (s: string) =>
  new Date(s).toLocaleDateString("he-IL", { month: "long", year: "numeric" });
const fmtPnl = (n: number | null) =>
  n != null ? `${n >= 0 ? "+" : ""}$${Math.abs(n).toFixed(2)}` : "—";

/* ── P&L Sparkline (cumulative equity curve) ── */
const PnlSparkline = ({ trades }: { trades: any[] }) => {
  const closed = [...trades]
    .filter(t => t.status === "closed" && t.pnl != null)
    .sort((a, b) => new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime());
  if (closed.length < 2) return null;
  let cum = 0;
  const pts = closed.map(t => { cum += t.pnl; return cum; });
  const min = Math.min(...pts), max = Math.max(...pts), range = max - min || 1;
  const W = 72, H = 24;
  const coords = pts.map((p, i) =>
    `${(i / (pts.length - 1)) * W},${H - ((p - min) / range) * (H - 2) - 1}`
  ).join(" ");
  const color = pts[pts.length - 1] >= 0 ? "#22c55e" : "#ef4444";
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" className="shrink-0 opacity-80">
      <polyline points={coords} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${H} ${coords} ${W},${H}`} fill={color} opacity="0.12" />
    </svg>
  );
};

/* ── Stats Header ── */
const StatsHeader = ({ trades }: { trades: any[] }) => {
  const closed = trades.filter(t => t.status === "closed");
  const wins = closed.filter(t => (t.pnl ?? 0) > 0);
  const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const winRate = closed.length > 0 ? Math.round((wins.length / closed.length) * 100) : 0;
  const withReflection = closed.filter(t => t.notes || t.psychology_notes).length;
  const reflectionPct = closed.length > 0 ? Math.round((withReflection / closed.length) * 100) : 0;
  const openCount = trades.filter(t => t.status === "open").length;

  const stats = [
    {
      label: "עסקאות",
      value: closed.length.toString(),
      color: "#60a5fa",
      sub: openCount > 0 ? `${openCount} פתוחות` : "סגורות",
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      color: winRate >= 55 ? "#22c55e" : winRate >= 45 ? "#f59e0b" : "#ef4444",
      sub: `${wins.length} ניצחונות`,
    },
    {
      label: "P&L כולל",
      value: fmtPnl(totalPnl),
      color: totalPnl >= 0 ? "#22c55e" : "#ef4444",
      sub: null,
      sparkline: true,
    },
    {
      label: "רפלקציות",
      value: `${reflectionPct}%`,
      color: "#a78bfa",
      sub: `${withReflection} / ${closed.length}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
      {stats.map(s => (
        <div key={s.label} className="relative rounded-2xl border border-white/[0.06] overflow-hidden px-3 py-3"
          style={{ background: "rgba(10,10,18,0.7)", backdropFilter: "blur(20px)" }}>
          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-[1px]"
            style={{ background: `linear-gradient(to left, transparent, ${s.color}55, transparent)` }} />
          <p className="text-[9px] font-mono uppercase tracking-wider text-white/25 mb-1.5">{s.label}</p>
          <div className="flex items-end justify-between gap-1">
            <p className="text-[20px] sm:text-[22px] font-black font-mono leading-none" style={{ color: s.color }}>
              {s.value}
            </p>
            {s.sparkline && <PnlSparkline trades={trades} />}
          </div>
          {s.sub && <p className="text-[9px] text-white/20 font-mono mt-1.5">{s.sub}</p>}
        </div>
      ))}
    </div>
  );
};

/* ── Month Group Header ── */
const MonthHeader = ({ label, trades }: { label: string; trades: any[] }) => {
  const closed = trades.filter(t => t.status === "closed");
  const wins = closed.filter(t => (t.pnl ?? 0) > 0);
  const monthPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const winRate = closed.length > 0 ? Math.round((wins.length / closed.length) * 100) : 0;

  return (
    <div className="flex items-center gap-3 pt-2 pb-1">
      <div className="h-[1px] flex-1 bg-white/[0.05]" />
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-bold text-white/40">{label}</span>
        <span className="text-[9px] font-mono text-white/20">{trades.length} עסקאות</span>
        {closed.length > 0 && (
          <>
            <span className="text-[9px] font-mono font-bold"
              style={{ color: winRate >= 50 ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.5)" }}>
              {winRate}% WR
            </span>
            <span className="text-[9px] font-mono font-bold"
              style={{ color: monthPnl >= 0 ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.5)" }}>
              {fmtPnl(monthPnl)}
            </span>
          </>
        )}
      </div>
      <div className="h-[1px] flex-1 bg-white/[0.05]" />
    </div>
  );
};

/* ── Trade Card ── */
const FolderCard = ({ trade, onClick }: { trade: any; onClick: () => void }) => {
  const isWin = (trade.pnl ?? 0) >= 0;
  const isOpen = trade.status === "open";
  const hasReflection = !!(trade.notes || trade.psychology_notes);
  const followedRules = (trade as any).followed_rules;
  const riskOk = trade.lot_size != null && trade.stop_loss != null;

  const pnlColor = isOpen ? "#60a5fa" : isWin ? "#22c55e" : "#ef4444";
  const borderColor = isOpen
    ? "rgba(96,165,250,0.2)"
    : isWin ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.16)";

  const rrRatio = trade.entry_price && trade.stop_loss && trade.take_profit
    ? Math.abs((trade.take_profit - trade.entry_price) / (trade.entry_price - trade.stop_loss)).toFixed(1)
    : null;

  return (
    <button
      onClick={onClick}
      className="group relative rounded-2xl text-right transition-all duration-200 hover:scale-[1.015] active:scale-[0.98] overflow-hidden w-full"
      style={{
        border: `1px solid ${borderColor}`,
        background: "rgba(10,10,18,0.85)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Left colored accent bar */}
      <div className="absolute top-0 right-0 w-[3px] h-full rounded-r-2xl"
        style={{ background: `linear-gradient(to bottom, ${pnlColor}90, ${pnlColor}20)` }} />

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle at 80% 30%, ${pnlColor}08, transparent 60%)` }} />

      <div className="relative pr-4 pl-3.5 py-3.5 space-y-2.5">

        {/* ── Row 1: Symbol + Direction + Status ── */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: pnlColor + "18", border: `1px solid ${pnlColor}35` }}>
              {trade.direction === "long"
                ? <ArrowUpRight className="h-3.5 w-3.5" style={{ color: pnlColor }} />
                : <ArrowDownRight className="h-3.5 w-3.5" style={{ color: pnlColor }} />}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-black text-white font-mono leading-none">{trade.symbol}</p>
              <p className="text-[9px] text-white/25 font-mono mt-0.5">{fmtShortDate(trade.entry_time)} · {fmtTime(trade.entry_time)}</p>
            </div>
          </div>
          {/* Status badge */}
          {isOpen ? (
            <span className="rounded-full px-2 py-0.5 text-[8px] font-bold shrink-0 animate-pulse"
              style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)", color: "#60a5fa" }}>● פתוח</span>
          ) : hasReflection ? (
            <span className="rounded-full px-2 py-0.5 text-[8px] font-bold shrink-0"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", color: "#22c55e" }}>✓ יומן</span>
          ) : (
            <span className="rounded-full px-2 py-0.5 text-[8px] font-bold shrink-0"
              style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.22)", color: "#fb923c" }}>✍ ממתין</span>
          )}
        </div>

        {/* ── Row 2: PnL + R:R ── */}
        <div className="flex items-center justify-between">
          <p className="text-[24px] font-black font-mono leading-none" style={{ color: pnlColor }}>
            {isOpen ? "—" : fmtPnl(trade.pnl)}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {rrRatio && !isOpen && (
              <span className="text-[9px] font-mono font-bold rounded-lg px-1.5 py-0.5"
                style={{
                  background: parseFloat(rrRatio) >= 2 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.06)",
                  color: parseFloat(rrRatio) >= 2 ? "rgba(34,197,94,0.8)" : "rgba(239,68,68,0.6)",
                  border: `1px solid ${parseFloat(rrRatio) >= 2 ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.12)"}`,
                }}>1:{rrRatio}R</span>
            )}
            {trade.rating && (
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} className={cn("h-2.5 w-2.5", trade.rating >= n ? "fill-amber-400 text-amber-400" : "text-white/10")} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-[1px] bg-white/[0.04]" />

        {/* ── Row 3: Info pills ── */}
        <div className="flex flex-wrap gap-1.5">
          {/* Direction */}
          <span className="text-[9px] font-bold px-2 py-1 rounded-lg"
            style={{
              background: trade.direction === "long" ? "rgba(96,165,250,0.08)" : "rgba(239,68,68,0.07)",
              color: trade.direction === "long" ? "rgba(96,165,250,0.8)" : "rgba(239,68,68,0.7)",
            }}>
            {trade.direction === "long" ? "↑ לונג" : "↓ שורט"}
          </span>
          {/* Timeframe */}
          {trade.timeframe && (
            <span className="text-[9px] font-bold px-2 py-1 rounded-lg bg-white/[0.04] text-white/40">
              {trade.timeframe}
            </span>
          )}
          {/* Setup */}
          {trade.setup_type && (
            <span className="text-[9px] font-bold px-2 py-1 rounded-lg bg-white/[0.04] text-white/40 max-w-[90px] truncate">
              {trade.setup_type}
            </span>
          )}
          {/* Lot size */}
          {trade.lot_size != null && (
            <span className="text-[9px] font-mono font-bold px-2 py-1 rounded-lg bg-white/[0.04] text-white/35">
              {trade.lot_size} lot
            </span>
          )}
        </div>

        {/* ── Row 4: Rules compliance + Risk ── */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Followed rules */}
          {followedRules === true && (
            <div className="flex items-center gap-1 rounded-lg px-2 py-1"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)" }}>
              <CheckCircle2 className="h-3 w-3 text-green-400" />
              <span className="text-[9px] font-bold text-green-400">חוקים ✓</span>
            </div>
          )}
          {followedRules === false && (
            <div className="flex items-center gap-1 rounded-lg px-2 py-1"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
              <AlertTriangle className="h-3 w-3 text-red-400" />
              <span className="text-[9px] font-bold text-red-400">חוקים ✗</span>
            </div>
          )}
          {/* Risk indicator */}
          {riskOk && (
            <div className="flex items-center gap-1 rounded-lg px-2 py-1"
              style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.15)" }}>
              <Shield className="h-3 w-3 text-purple-400" />
              <span className="text-[9px] font-bold text-purple-400">סיכון מוגדר</span>
            </div>
          )}
          {/* Psychology note preview */}
          {trade.psychology_notes && (
            <div className="flex items-center gap-1 rounded-lg px-2 py-1 min-w-0 max-w-full"
              style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.12)" }}>
              <Brain className="h-3 w-3 text-blue-400 shrink-0" />
              <span className="text-[9px] text-blue-300/70 truncate">{trade.psychology_notes}</span>
            </div>
          )}
        </div>

        {/* ── Row 5: Reflection note preview (if exists) ── */}
        {trade.notes && (
          <div className="rounded-xl px-3 py-2"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-[10px] text-white/35 leading-relaxed line-clamp-2 text-right">{trade.notes}</p>
          </div>
        )}

        {/* ── Row (last): Entry/Exit prices ── */}
        <div className="flex items-center justify-between text-[9px] font-mono text-white/20">
          <span>כניסה: <span className="text-white/35">{trade.entry_price?.toFixed(4) ?? "—"}</span></span>
          {!isOpen && <span>יציאה: <span className="text-white/35">{trade.exit_price?.toFixed(4) ?? "—"}</span></span>}
          {isOpen && <span className="text-blue-400/50 animate-pulse">● פעיל כרגע</span>}
        </div>

        {/* Bottom: click hint */}
        <div className="flex items-center justify-center gap-1 pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] text-white/20">לחץ לרפלקציה מלאה ←</span>
        </div>

      </div>
    </button>
  );
};

/* ── Section Divider ── */
const SectionTitle = ({ icon: Icon, label, color = "#60a5fa" }: { icon: any; label: string; color?: string }) => (
  <div className="flex items-center gap-2.5 pt-1">
    <div className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
      style={{ background: color + "18", border: `1px solid ${color}30` }}>
      <Icon className="h-3 w-3" style={{ color }} />
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: color + "bb" }}>{label}</span>
    <div className="flex-1 h-[1px]" style={{ background: color + "15" }} />
  </div>
);

/* ── Mood Selector ── */
const MOODS = [
  { id: "calm",    label: "רגוע",    icon: Wind,      color: "#22c55e", emoji: "😌" },
  { id: "focused", label: "ממוקד",   icon: Crosshair, color: "#60a5fa", emoji: "🎯" },
  { id: "anxious", label: "חרדתי",   icon: Zap,       color: "#f59e0b", emoji: "😰" },
  { id: "greedy",  label: "חמדן",    icon: Flame,     color: "#ef4444", emoji: "🔥" },
] as const;

/* ── Mistakes List ── */
const MISTAKES = [
  { id: "early_entry",  label: "כניסה מוקדמת" },
  { id: "late_entry",   label: "כניסה מאוחרת" },
  { id: "missed_exit",  label: "יציאה מפוספסת" },
  { id: "oversize",     label: "גודל גדול מדי" },
  { id: "no_sl",        label: "ללא Stop Loss" },
  { id: "revenge",      label: "מסחר נקמה" },
  { id: "fomo",         label: "FOMO" },
  { id: "no_plan",      label: "ללא תוכנית" },
] as const;

/* ── Screenshot Carousel ── */
const ScreenshotCarousel = ({ urls }: { urls: string[] }) => {
  const [idx, setIdx] = useState(0);
  if (!urls?.length) return (
    <div className="flex flex-col items-center justify-center h-32 rounded-2xl border border-dashed border-white/[0.07]">
      <ImageIcon className="h-5 w-5 text-white/10 mb-2" />
      <p className="text-[10px] text-white/20">אין צילום גרף</p>
    </div>
  );
  const labels = ["Setup", "Trigger", "Result"];
  return (
    <div className="space-y-2">
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.07]">
        <img src={urls[idx]} alt={labels[idx] || `גרף ${idx + 1}`} className="w-full object-cover" />
        {urls.length > 1 && (
          <>
            <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/60 hover:text-white disabled:opacity-20 transition-all">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setIdx(i => Math.min(urls.length - 1, i + 1))} disabled={idx === urls.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/60 hover:text-white disabled:opacity-20 transition-all">
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-1 text-[9px] font-bold bg-black/60 text-white/50">
              {labels[idx] || `${idx + 1}/${urls.length}`}
            </div>
          </>
        )}
      </div>
      {urls.length > 1 && (
        <div className="flex gap-1.5 justify-center">
          {urls.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className="rounded-full transition-all"
              style={{ width: i === idx ? 16 : 6, height: 4, background: i === idx ? "#60a5fa" : "rgba(255,255,255,0.15)" }} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Trade Room — Deep-Dive Side Drawer ── */
const TradeRoom = ({ trade, onClose, onSaved }: { trade: any; onClose: () => void; onSaved: () => void }) => {
  const isWin = (trade.pnl ?? 0) >= 0;
  const isOpen = trade.status === "open";
  const updateTrade = useUpdateTrade();
  const [visible, setVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Parse existing tags ──
  const existingTags: string[] = trade.tags || [];
  const getTag = (prefix: string) => existingTags.find(t => t.startsWith(prefix + ":"))?.slice(prefix.length + 1) || "";
  const hasTag = (val: string) => existingTags.includes(val);

  // ── State ──
  const [mood, setMood] = useState<string>(getTag("mood"));
  const [preSlept, setPreSlept] = useState(hasTag("pre:slept"));
  const [prePlan, setPrePlan] = useState(hasTag("pre:plan"));
  const [preNoRevenge, setPreNoRevenge] = useState(hasTag("pre:norevenge"));
  const [story, setStory] = useState(trade.notes || "");
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>(
    existingTags.filter(t => t.startsWith("mistake:")).map(t => t.slice(8))
  );
  const [mistakeNote, setMistakeNote] = useState(getTag("mistake_note"));
  const [lesson, setLesson] = useState(getTag("lesson"));
  const [lessonSaved, setLessonSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const pnlColor = isOpen ? "#60a5fa" : isWin ? "#22c55e" : "#ef4444";
  const rrRatio = trade.entry_price && trade.stop_loss && trade.take_profit
    ? Math.abs((trade.take_profit - trade.entry_price) / (trade.entry_price - trade.stop_loss)).toFixed(1)
    : null;

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  const toggleMistake = (id: string) => {
    setSelectedMistakes(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Rebuild tags: keep unrelated tags, replace structured ones
      const keepTags = existingTags.filter(t =>
        !t.startsWith("mood:") && !t.startsWith("pre:") &&
        !t.startsWith("mistake:") && !t.startsWith("mistake_note:") && !t.startsWith("lesson:")
      );
      const newTags = [
        ...keepTags,
        ...(mood ? [`mood:${mood}`] : []),
        ...(preSlept ? ["pre:slept"] : []),
        ...(prePlan ? ["pre:plan"] : []),
        ...(preNoRevenge ? ["pre:norevenge"] : []),
        ...selectedMistakes.map(m => `mistake:${m}`),
        ...(mistakeNote ? [`mistake_note:${mistakeNote}`] : []),
        ...(lesson ? [`lesson:${lesson.slice(0, 200)}`] : []),
      ];
      await updateTrade.mutateAsync({
        id: trade.id,
        notes: story || null,
        tags: newTags,
      } as any);
      if (lesson) { setLessonSaved(true); setTimeout(() => setLessonSaved(false), 2500); }
      toast.success("היומן נשמר ✓");
      onSaved();
    } catch (e: any) {
      toast.error("שגיאה: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80]" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 transition-opacity duration-300"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", opacity: visible ? 1 : 0 }}
        onClick={handleClose} />

      {/* Drawer */}
      <div ref={scrollRef} className="absolute top-0 right-0 h-full overflow-y-auto"
        style={{
          width: "min(max(50vw, 360px), 100vw)",
          background: "rgba(7,7,13,0.98)",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "-32px 0 80px rgba(0,0,0,0.7)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
        }}>

        {/* ── Sticky Header ── */}
        <div className="sticky top-0 z-10" style={{ background: "rgba(7,7,13,0.98)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="h-[2px]" style={{ background: `linear-gradient(to left, transparent, ${pnlColor}80, transparent)` }} />
          <div className="flex items-center justify-between px-5 py-3.5 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: pnlColor + "18", border: `1px solid ${pnlColor}35` }}>
                {trade.direction === "long"
                  ? <ArrowUpRight className="h-5 w-5" style={{ color: pnlColor }} />
                  : <ArrowDownRight className="h-5 w-5" style={{ color: pnlColor }} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[20px] font-black font-mono text-white leading-none">{trade.symbol}</span>
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold border"
                    style={{ background: pnlColor + "15", borderColor: pnlColor + "35", color: pnlColor }}>
                    {isOpen ? "פתוח" : isWin ? "WIN ✓" : "LOSS ✗"}
                  </span>
                  {mood && <span className="text-[16px]">{MOODS.find(m => m.id === mood)?.emoji}</span>}
                </div>
                <p className="text-[10px] text-white/25 font-mono mt-0.5 truncate">{fmtDate(trade.entry_time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleSave} disabled={saving}
                className="haptic-press flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-bold transition-all disabled:opacity-40"
                style={{ background: pnlColor + "15", border: `1px solid ${pnlColor}35`, color: pnlColor }}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                שמור
              </button>
              <button onClick={handleClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/40 hover:text-white/80 transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-5 space-y-5 pb-12">

          {/* ── 1. PnL Hero ── */}
          <div className="rounded-2xl p-4 text-center relative overflow-hidden"
            style={{ background: pnlColor + "0c", border: `1px solid ${pnlColor}22` }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 50% 0%, ${pnlColor}10, transparent 70%)` }} />
            <p className="text-[9px] text-white/20 font-mono mb-1">רווח / הפסד נקי</p>
            <p className="text-[44px] font-black font-mono leading-none" style={{ color: pnlColor }}>
              {isOpen ? "—" : fmtPnl(trade.pnl)}
            </p>
            {rrRatio && (
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="text-[11px] font-mono font-bold rounded-lg px-2 py-0.5"
                  style={{
                    background: parseFloat(rrRatio) >= 2 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                    color: parseFloat(rrRatio) >= 2 ? "#22c55e" : "#ef4444",
                  }}>R:R 1:{rrRatio}</span>
              </div>
            )}
          </div>

          {/* ── 2. Stats Grid ── */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "כניסה", value: trade.entry_price?.toFixed(4) || "—" },
              { label: "יציאה", value: trade.exit_price?.toFixed(4) || "—" },
              { label: "לוט", value: `${trade.lot_size ?? "—"}` },
              { label: "SL", value: trade.stop_loss?.toFixed(4) || "—" },
              { label: "TP", value: trade.take_profit?.toFixed(4) || "—" },
              { label: "TF", value: trade.timeframe || "—" },
            ].map(item => (
              <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/[0.05] px-3 py-2.5">
                <p className="text-[9px] text-white/20 font-mono mb-1">{item.label}</p>
                <p className="text-[11px] font-bold text-white/65 font-mono">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Rules + Rating */}
          {((trade as any).followed_rules != null || trade.rating) && (
            <div className="flex flex-wrap gap-2">
              {(trade as any).followed_rules === true && (
                <div className="flex items-center gap-1.5 rounded-xl border border-green-500/20 bg-green-500/[0.07] px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-[11px] font-bold text-green-400">חוקים נשמרו</span>
                </div>
              )}
              {(trade as any).followed_rules === false && (
                <div className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-[11px] font-bold text-red-400">חוקים הופרו</span>
                </div>
              )}
              {trade.rating && (
                <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={cn("h-3.5 w-3.5", trade.rating >= n ? "fill-amber-400 text-amber-400" : "text-white/10")} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 3. Screenshot Carousel ── */}
          <div className="space-y-2">
            <SectionTitle icon={BarChart2} label="גרף הסטאפ" color="#60a5fa" />
            <ScreenshotCarousel urls={trade.screenshots || []} />
          </div>

          {/* ══════════════════════════════════════
              PRE-TRADE SECTION
          ══════════════════════════════════════ */}
          <SectionTitle icon={Moon} label="לפני הכניסה — מצב הראש" color="#a78bfa" />

          {/* Mood Selector */}
          <div className="space-y-2">
            <p className="text-[10px] text-white/30 font-mono">איך הרגשתי לפני שנכנסתי?</p>
            <div className="grid grid-cols-4 gap-2">
              {MOODS.map(m => (
                <button key={m.id} onClick={() => setMood(mood === m.id ? "" : m.id)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl p-2.5 border transition-all duration-200"
                  style={{
                    borderColor: mood === m.id ? m.color + "60" : "rgba(255,255,255,0.06)",
                    background: mood === m.id ? m.color + "12" : "rgba(255,255,255,0.02)",
                    boxShadow: mood === m.id ? `0 0 16px ${m.color}20` : "none",
                  }}>
                  <span className="text-[20px] leading-none">{m.emoji}</span>
                  <span className="text-[9px] font-bold" style={{ color: mood === m.id ? m.color : "rgba(255,255,255,0.3)" }}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Pre-trade checklist */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
            <p className="text-[10px] text-white/30 font-mono">צ'קליסט לפני כניסה</p>
            {[
              { state: preSlept,     setState: setPreSlept,     label: "ישנתי לפחות 6 שעות" },
              { state: prePlan,      setState: setPrePlan,      label: "העסקה לפי התוכנית שלי" },
              { state: preNoRevenge, setState: setPreNoRevenge, label: "לא מסחר נקמה" },
            ].map(({ state, setState, label }) => (
              <button key={label} onClick={() => setState(!state)}
                className="flex items-center gap-3 w-full text-right transition-all">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all"
                  style={{
                    borderColor: state ? "#22c55e60" : "rgba(255,255,255,0.12)",
                    background: state ? "rgba(34,197,94,0.12)" : "transparent",
                  }}>
                  {state && <CheckCircle2 className="h-3 w-3 text-green-400" />}
                </div>
                <span className="text-[12px]" style={{ color: state ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* ══════════════════════════════════════
              THE STORY
          ══════════════════════════════════════ */}
          <SectionTitle icon={BookOpen} label="הסיפור של העסקה" color="#60a5fa" />

          <div className="rounded-2xl border border-blue-400/15 bg-blue-400/[0.03] p-4 space-y-2">
            <p className="text-[10px] text-blue-400/60 font-mono">למה נכנסתי? מה ראיתי? מה חשבתי?</p>
            <textarea rows={5} value={story} onChange={e => setStory(e.target.value)}
              placeholder="ה-1H הראה לי ... ראיתי rejection ב... החלטתי להיכנס כי ..."
              className="w-full bg-transparent text-[12px] text-white/70 placeholder:text-white/15 outline-none resize-none leading-relaxed" />
          </div>

          {/* ══════════════════════════════════════
              MISTAKES
          ══════════════════════════════════════ */}
          <SectionTitle icon={TriangleAlert} label="טעויות שעשיתי" color="#f59e0b" />

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {MISTAKES.map(m => {
                const selected = selectedMistakes.includes(m.id);
                return (
                  <button key={m.id} onClick={() => toggleMistake(m.id)}
                    className="rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-all duration-200"
                    style={{
                      borderColor: selected ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.07)",
                      background: selected ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.02)",
                      color: selected ? "#f59e0b" : "rgba(255,255,255,0.3)",
                      boxShadow: selected ? "0 0 12px rgba(245,158,11,0.15)" : "none",
                    }}>
                    {selected ? "✓ " : ""}{m.label}
                  </button>
                );
              })}
            </div>
            {selectedMistakes.length > 0 && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-3 space-y-2"
                style={{ boxShadow: "0 0 20px rgba(245,158,11,0.06)" }}>
                <p className="text-[10px] text-amber-400/60 font-mono">הסבר — מה בדיוק קרה?</p>
                <textarea rows={3} value={mistakeNote} onChange={e => setMistakeNote(e.target.value)}
                  placeholder="הכנסתי כי ראיתי תנועה חדה אבל לא ציפיתי ל..."
                  className="w-full bg-transparent text-[12px] text-white/70 placeholder:text-amber-400/15 outline-none resize-none leading-relaxed" />
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════
              LESSON — LETTER TO FUTURE SELF
          ══════════════════════════════════════ */}
          <SectionTitle icon={Lightbulb} label="מכתב לעצמי בעתיד" color="#a78bfa" />

          <div className={cn(
            "rounded-2xl border p-4 space-y-2 transition-all duration-500 relative",
            lessonSaved ? "border-blue-400/40" : "border-purple-400/15"
          )} style={{
            background: lessonSaved ? "rgba(96,165,250,0.05)" : "rgba(167,139,250,0.03)",
            boxShadow: lessonSaved ? "0 0 24px rgba(96,165,250,0.12)" : "none",
          }}>
            {lessonSaved && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[9px] font-bold text-blue-400"
                style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)" }}>
                <Lightbulb className="h-3 w-3" />
                Knowledge Saved ✓
              </div>
            )}
            <p className="text-[10px] text-purple-400/60 font-mono">
              "אני מבטיח לעצמי ש..."
            </p>
            <textarea rows={4} value={lesson} onChange={e => setLesson(e.target.value)}
              placeholder="בעסקה הבאה על זהב לפני חדשות — אני לא אכנס. אני אזכור ש..."
              className="w-full bg-transparent text-[12px] text-white/70 placeholder:text-purple-400/15 outline-none resize-none leading-relaxed" />
            <p className="text-[9px] text-white/15 font-mono text-left">{lesson.length}/200</p>
          </div>

          {/* ── Save Button ── */}
          <button onClick={handleSave} disabled={saving}
            className="haptic-press w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-[14px] font-bold text-black transition-all hover:brightness-110 disabled:opacity-40"
            style={{ background: `linear-gradient(to left, ${pnlColor}, ${pnlColor}cc)`, boxShadow: `0 8px 28px ${pnlColor}35` }}>
            {saving
              ? <><Loader2 className="h-5 w-5 animate-spin" /> שומר...</>
              : <><Save className="h-5 w-5" /> שמור יומן</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   KNOWLEDGE VAULT — Pattern Recognition Engine
══════════════════════════════════════════════════════ */
const KnowledgeVault = ({ trades }: { trades: any[] }) => {
  const [expanded, setExpanded] = useState(false);

  const closed = trades.filter(t => t.status === "closed");
  if (closed.length < 3) return null; // need enough data

  // ── Helper ──
  const winRate = (arr: any[]) => {
    if (!arr.length) return 0;
    return Math.round((arr.filter(t => (t.pnl ?? 0) > 0).length / arr.length) * 100);
  };

  // ── 1. Mistake frequency ──
  const mistakeCount: Record<string, { total: number; losses: number }> = {};
  const MISTAKE_LABELS: Record<string, string> = {
    early_entry: "כניסה מוקדמת", late_entry: "כניסה מאוחרת",
    missed_exit: "יציאה מפוספסת", oversize: "גודל גדול מדי",
    no_sl: "ללא Stop Loss", revenge: "מסחר נקמה",
    fomo: "FOMO", no_plan: "ללא תוכנית",
  };
  closed.forEach(t => {
    (t.tags || []).filter((tag: string) => tag.startsWith("mistake:")).forEach((tag: string) => {
      const key = tag.slice(8);
      if (!mistakeCount[key]) mistakeCount[key] = { total: 0, losses: 0 };
      mistakeCount[key].total++;
      if ((t.pnl ?? 0) <= 0) mistakeCount[key].losses++;
    });
  });
  const topMistakes = Object.entries(mistakeCount)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 3);

  // ── 2. Symbol performance ──
  const bySymbol: Record<string, any[]> = {};
  closed.forEach(t => {
    if (!bySymbol[t.symbol]) bySymbol[t.symbol] = [];
    bySymbol[t.symbol].push(t);
  });
  const symbolInsights = Object.entries(bySymbol)
    .filter(([, arr]) => arr.length >= 2)
    .map(([sym, arr]) => ({ sym, wr: winRate(arr), count: arr.length, pnl: arr.reduce((s, t) => s + (t.pnl ?? 0), 0) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // ── 3. Time of day ──
  const byHour: Record<string, any[]> = {};
  closed.forEach(t => {
    const h = new Date(t.entry_time).getHours();
    const slot = h < 10 ? "לפני 10:00" : h < 14 ? "10:00–14:00" : h < 18 ? "14:00–18:00" : "אחרי 18:00";
    if (!byHour[slot]) byHour[slot] = [];
    byHour[slot].push(t);
  });
  const timeInsights = Object.entries(byHour)
    .filter(([, arr]) => arr.length >= 2)
    .map(([slot, arr]) => ({ slot, wr: winRate(arr), count: arr.length }))
    .sort((a, b) => b.count - a.count);

  // ── 4. Mood correlations ──
  const byMood: Record<string, any[]> = {};
  closed.forEach(t => {
    const moodTag = (t.tags || []).find((tag: string) => tag.startsWith("mood:"));
    if (moodTag) {
      const mood = moodTag.slice(5);
      if (!byMood[mood]) byMood[mood] = [];
      byMood[mood].push(t);
    }
  });
  const moodInsights = Object.entries(byMood)
    .filter(([, arr]) => arr.length >= 2)
    .map(([mood, arr]) => ({ mood, wr: winRate(arr), count: arr.length }));

  // ── 5. Pre-checklist correlation ──
  const withChecklist = closed.filter(t => (t.tags || []).includes("pre:slept") && (t.tags || []).includes("pre:plan"));
  const withoutChecklist = closed.filter(t => !(t.tags || []).includes("pre:slept") || !(t.tags || []).includes("pre:plan"));
  const checklistWr = winRate(withChecklist);
  const noChecklistWr = winRate(withoutChecklist);
  const checklistLift = withChecklist.length >= 2 && withoutChecklist.length >= 2 ? checklistWr - noChecklistWr : null;

  // ── 6. Direction bias ──
  const longs = closed.filter(t => t.direction === "long");
  const shorts = closed.filter(t => t.direction === "short");
  const longWr = winRate(longs);
  const shortWr = winRate(shorts);

  // ── Build insight cards ──
  type Insight = { icon: any; color: string; title: string; body: string; severity: "warn" | "good" | "info" };
  const insights: Insight[] = [];

  // Top mistake
  if (topMistakes[0]) {
    const [key, { total, losses }] = topMistakes[0];
    const lossPct = Math.round((losses / total) * 100);
    insights.push({
      icon: TriangleAlert,
      color: lossPct >= 70 ? "#ef4444" : "#f59e0b",
      severity: lossPct >= 70 ? "warn" : "info",
      title: `הטעות הכי נפוצה שלך: ${MISTAKE_LABELS[key] || key}`,
      body: `חזרה ${total} פעמים — ${lossPct}% מהמקרים הסתיימו בהפסד`,
    });
  }

  // Weak symbol
  const weakSymbol = symbolInsights.filter(s => s.wr < 40 && s.count >= 3)[0];
  if (weakSymbol) {
    insights.push({
      icon: TrendingDown, color: "#ef4444", severity: "warn",
      title: `זהירות עם ${weakSymbol.sym}`,
      body: `WR ${weakSymbol.wr}% על ${weakSymbol.count} עסקאות · P&L: ${weakSymbol.pnl >= 0 ? "+" : ""}$${weakSymbol.pnl.toFixed(0)}`,
    });
  }

  // Strong symbol
  const strongSymbol = symbolInsights.filter(s => s.wr >= 60 && s.count >= 3)[0];
  if (strongSymbol) {
    insights.push({
      icon: TrendingUp, color: "#22c55e", severity: "good",
      title: `${strongSymbol.sym} — כוח שלך`,
      body: `WR ${strongSymbol.wr}% על ${strongSymbol.count} עסקאות · P&L: +$${strongSymbol.pnl.toFixed(0)}`,
    });
  }

  // Time of day
  const weakTime = timeInsights.filter(t => t.wr < 40 && t.count >= 3)[0];
  if (weakTime) {
    insights.push({
      icon: Clock, color: "#f59e0b", severity: "warn",
      title: `${weakTime.slot} — שעה חלשה`,
      body: `WR ${weakTime.wr}% על ${weakTime.count} עסקאות בשעות האלו`,
    });
  }

  // Mood correlation
  const badMood = moodInsights.filter(m => m.wr < 35 && m.count >= 2)[0];
  if (badMood) {
    const moodLabel = MOODS.find(m => m.id === badMood.mood);
    insights.push({
      icon: Brain, color: "#ef4444", severity: "warn",
      title: `כשאתה ${moodLabel?.label || badMood.mood} — ${moodLabel?.emoji || ""} תיזהר`,
      body: `WR ${badMood.wr}% על ${badMood.count} עסקאות במצב הזה`,
    });
  }

  // Checklist lift
  if (checklistLift !== null && checklistLift > 10) {
    insights.push({
      icon: CheckCircle2, color: "#22c55e", severity: "good",
      title: `הצ'קליסט עובד`,
      body: `WR ${checklistWr}% עם צ'קליסט לעומת ${noChecklistWr}% בלעדיו (+${checklistLift}%)`,
    });
  }

  // Direction bias
  if (longs.length >= 3 && shorts.length >= 3) {
    const better = longWr >= shortWr ? "לונג" : "שורט";
    const betterWr = longWr >= shortWr ? longWr : shortWr;
    const worseWr = longWr >= shortWr ? shortWr : longWr;
    if (Math.abs(longWr - shortWr) >= 15) {
      insights.push({
        icon: Activity, color: "#60a5fa", severity: "info",
        title: `${better} — הכיוון החזק שלך`,
        body: `WR ${betterWr}% vs ${worseWr}% בכיוון ההפוך`,
      });
    }
  }

  if (!insights.length) return null;

  const visibleInsights = expanded ? insights : insights.slice(0, 2);

  return (
    <div className="rounded-2xl border border-white/[0.07] overflow-hidden"
      style={{ background: "rgba(8,8,16,0.8)", backdropFilter: "blur(20px)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl"
            style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)" }}>
            <FlaskConical className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div>
            <p className="text-[12px] font-black text-white">Knowledge Vault</p>
            <p className="text-[9px] text-white/25 font-mono">{insights.length} תובנות מ-{closed.length} עסקאות</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-purple-400/60 rounded-lg px-2 py-0.5"
            style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}>
            AI Pattern
          </span>
          {insights.length > 2 && (
            <button onClick={() => setExpanded(!expanded)}
              className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/40 hover:text-white/70 transition-all">
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Insight cards */}
      <div className="p-3 space-y-2">
        {visibleInsights.map((ins, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl px-3 py-3 transition-all"
            style={{
              background: ins.color + "08",
              border: `1px solid ${ins.color}22`,
              boxShadow: ins.severity === "warn" ? `0 0 16px ${ins.color}0a` : "none",
            }}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5"
              style={{ background: ins.color + "15", border: `1px solid ${ins.color}30` }}>
              <ins.icon className="h-3.5 w-3.5" style={{ color: ins.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-white/85 leading-snug">{ins.title}</p>
              <p className="text-[10px] text-white/35 font-mono mt-0.5">{ins.body}</p>
            </div>
            {ins.severity === "warn" && (
              <span className="shrink-0 text-[8px] font-bold rounded-md px-1.5 py-0.5 mt-0.5"
                style={{ background: ins.color + "15", color: ins.color }}>!</span>
            )}
          </div>
        ))}

        {!expanded && insights.length > 2 && (
          <button onClick={() => setExpanded(true)}
            className="w-full text-center text-[10px] text-white/20 py-1.5 hover:text-white/40 transition-colors font-mono">
            + {insights.length - 2} תובנות נוספות
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Nostro Account Status Bar ── */
const NostroStatusBar = ({ trades }: { trades: any[] }) => {
  const [challenge, setChallenge] = useState<ActiveChallenge | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => { setChallenge(loadChallenge()); }, []);
  if (!challenge || dismissed) return null;

  const closedToday = trades.filter(t => {
    if (t.status !== "closed") return false;
    const d = new Date(t.created_at || t.entry_time || "");
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  });
  const dailyPnL = closedToday.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const totalPnL = trades.filter(t => t.status === "closed").reduce((s, t) => s + (t.pnl ?? 0), 0);

  const dailyLossUsedPct = Math.min(100, Math.abs(Math.min(0, dailyPnL)) / challenge.dailyLossLimit * 100);
  const totalDrawdownPct = Math.min(100, Math.abs(Math.min(0, totalPnL)) / challenge.maxDrawdownLimit * 100);
  const profitProgressPct = Math.min(100, Math.max(0, totalPnL / challenge.profitTarget * 100));

  const barColor = (pct: number, type: "profit" | "loss") => {
    if (type === "profit") return pct >= 100 ? "#22c55e" : "#a78bfa";
    return pct >= 80 ? "#ef4444" : pct >= 50 ? "#f59e0b" : "#22c55e";
  };

  const dailyAlert = dailyLossUsedPct >= 80;
  const ddAlert = totalDrawdownPct >= 80;

  return (
    <div className="shrink-0 rounded-2xl border overflow-hidden transition-all"
      style={{
        borderColor: (dailyAlert || ddAlert) ? "rgba(239,68,68,0.35)" : challenge.accentHex + "35",
        background: (dailyAlert || ddAlert) ? "rgba(239,68,68,0.05)" : challenge.accentHex + "08",
      }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: challenge.accentHex + "20" }}>
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5" style={{ color: challenge.accentHex }} />
          <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-white/50">
            אתגר פעיל · {challenge.firmName} {challenge.tierSize}
          </span>
          <span className="flex h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: challenge.accentHex }} />
        </div>
        <div className="flex items-center gap-3">
          {(dailyAlert || ddAlert) && (
            <div className="flex items-center gap-1 text-[9px] font-bold text-red-400 font-mono">
              <AlertTriangle className="h-3 w-3" />
              {dailyAlert ? "מגבלת הפסד יומי!" : "Drawdown גבוה!"}
            </div>
          )}
          <button onClick={() => setDismissed(true)} className="text-white/15 hover:text-white/40 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 px-4 py-3">
        {[
          { label: "יעד רווח", pct: profitProgressPct, amt: `${totalPnL >= 0 ? "+" : ""}$${Math.abs(totalPnL).toFixed(0)} / $${Math.round(challenge.profitTarget)}`, type: "profit" as const },
          { label: "הפסד יומי", pct: dailyLossUsedPct, amt: `$${Math.abs(dailyPnL).toFixed(0)} / $${Math.round(challenge.dailyLossLimit)}`, type: "loss" as const },
          { label: "Max DD", pct: totalDrawdownPct, amt: `$${Math.abs(Math.min(0, totalPnL)).toFixed(0)} / $${Math.round(challenge.maxDrawdownLimit)}`, type: "loss" as const },
        ].map(({ label, pct, amt, type }) => (
          <div key={label} className="space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono">
              <span className="text-white/25">{label}</span>
              <span className={type === "profit" ? "text-blue-400/70" : pct >= 80 ? "text-red-400/70" : "text-white/30"}>{pct.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: barColor(pct, type) }} />
            </div>
            <p className="text-[8px] text-white/15 font-mono">{amt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Main Page ── */
const JournalPage = () => {
  const { data: trades = [], isLoading, refetch } = useTrades();
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "open" | "win" | "loss">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => trades.filter(t => {
    if (search && !t.symbol?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "open") return t.status === "open";
    if (filter === "win") return (t.pnl ?? 0) > 0 && t.status === "closed";
    if (filter === "loss") return (t.pnl ?? 0) <= 0 && t.status === "closed";
    return true;
  }), [trades, filter, search]);

  // Group by month, newest first
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; trades: any[] }>();
    [...filtered]
      .sort((a, b) => new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime())
      .forEach(trade => {
        const key = trade.entry_time.slice(0, 7);
        if (!map.has(key)) map.set(key, { label: fmtMonthYear(trade.entry_time), trades: [] });
        map.get(key)!.trades.push(trade);
      });
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <div className="space-y-3 p-2 md:p-4" dir="rtl">

      {/* Nostro challenge tracker */}
      <NostroStatusBar trades={trades} />

      {/* Knowledge Vault */}
      <KnowledgeVault trades={trades} />

      {/* Page Header */}
      <div className="relative rounded-2xl border border-white/[0.06] overflow-hidden px-4 py-3.5 shrink-0"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(40px)" }}>
        <div className="absolute top-0 inset-x-0 h-[1px]"
          style={{ background: "linear-gradient(to right, transparent, rgba(96,165,250,0.4), transparent)" }} />
        <div className="absolute -top-6 -right-4 h-24 w-36 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(96,165,250,0.07), transparent 70%)" }} />
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl shrink-0"
            style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
            <BookOpen className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-[16px] font-black text-foreground">יומן מסחר</h1>
            <p className="text-[11px] text-white/30">{trades.length} עסקאות בכספת</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsHeader trades={trades} />

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש לפי סמל..."
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pr-9 pl-3 py-2.5 text-[12px] text-foreground placeholder:text-white/20 outline-none focus:border-blue-400/30 transition-all"
            dir="rtl"
          />
        </div>
        {/* Filter chips */}
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-0.5">
          {(["all", "open", "win", "loss"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "haptic-press rounded-xl border px-3 py-2 text-[11px] font-semibold transition-all whitespace-nowrap",
                filter === f
                  ? f === "win" ? "border-green-500/30 bg-green-500/10 text-green-400"
                    : f === "loss" ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : f === "open" ? "border-blue-400/30 bg-blue-400/10 text-blue-400"
                    : "border-white/[0.12] bg-white/[0.06] text-foreground"
                  : "border-white/[0.06] bg-white/[0.02] text-white/35 hover:bg-white/[0.04]"
              )}
            >
              {f === "all" ? `הכל` : f === "open" ? `פתוחות` : f === "win" ? `✓ רווח` : `✗ הפסד`}
            </button>
          ))}
          <span className="text-[10px] text-white/20 font-mono px-1 shrink-0">{filtered.length}</span>
        </div>
      </div>

      {/* Trade list grouped by month */}
      <div className="pb-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-blue-400/30 animate-spin mb-3" />
            <p className="text-xs text-white/20">טוען כספת...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] mb-4">
              <BookOpen className="h-7 w-7 text-white/10" />
            </div>
            <p className="text-sm font-bold text-white/30 mb-1">
              {search ? `לא נמצאו תוצאות עבור "${search}"` : "הכספת ריקה"}
            </p>
            <p className="text-xs text-white/15">
              {search ? "נסה סמל אחר" : "פתח עסקה ראשונה דרך יומן מסחר חכם"}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {grouped.map(([key, group]) => (
              <div key={key}>
                <MonthHeader label={group.label} trades={group.trades} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {group.trades.map(trade => (
                    <FolderCard key={trade.id} trade={trade} onClick={() => setSelectedTrade(trade)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trade Room */}
      {selectedTrade && (
        <TradeRoom
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onSaved={() => { refetch(); setSelectedTrade(null); }}
        />
      )}
    </div>
  );
};

export default JournalPage;
