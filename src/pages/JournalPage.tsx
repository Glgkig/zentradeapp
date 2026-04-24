import { useState, useMemo, useEffect } from "react";
import {
  ArrowUpRight, ArrowDownRight, X, Search,
  DollarSign, Target, Brain, Zap,
  Image as ImageIcon, CheckCircle2, AlertTriangle, Loader2,
  Star, Shield, BarChart2, Save, TrendingUp, Building2, BookOpen,
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

  const pnlColor = isOpen ? "#60a5fa" : isWin ? "#22c55e" : "#ef4444";
  const borderColor = isOpen
    ? "rgba(96,165,250,0.18)"
    : isWin ? "rgba(34,197,94,0.16)" : "rgba(239,68,68,0.13)";

  const rrRatio = trade.entry_price && trade.stop_loss && trade.take_profit
    ? Math.abs((trade.take_profit - trade.entry_price) / (trade.entry_price - trade.stop_loss)).toFixed(1)
    : null;

  return (
    <button
      onClick={onClick}
      className="group relative rounded-2xl text-right transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] overflow-hidden w-full"
      style={{
        border: `1px solid ${borderColor}`,
        background: "rgba(12,12,20,0.75)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Top colored accent bar */}
      <div className="absolute top-0 inset-x-0 h-[2px] rounded-t-2xl"
        style={{ background: `linear-gradient(to left, transparent, ${pnlColor}80, transparent)` }} />

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle at 20% 50%, ${pnlColor}09, transparent 65%)` }} />

      <div className="relative p-3.5 space-y-3">
        {/* Row 1: Symbol + direction + status */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: pnlColor + "18", border: `1px solid ${pnlColor}30` }}>
              {trade.direction === "long"
                ? <ArrowUpRight className="h-3.5 w-3.5" style={{ color: pnlColor }} />
                : <ArrowDownRight className="h-3.5 w-3.5" style={{ color: pnlColor }} />}
            </div>
            <p className="text-[14px] font-black text-white font-mono leading-none truncate">{trade.symbol}</p>
          </div>
          {/* Status badge */}
          {isOpen ? (
            <span className="rounded-full px-2 py-0.5 text-[8px] font-bold shrink-0 animate-pulse"
              style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)", color: "#60a5fa" }}>
              ● פתוח
            </span>
          ) : hasReflection ? (
            <span className="rounded-full px-2 py-0.5 text-[8px] font-bold shrink-0"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
              ✓ יומן
            </span>
          ) : (
            <span className="rounded-full px-2 py-0.5 text-[8px] font-bold shrink-0"
              style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.2)", color: "#fb923c" }}>
              ✍ ממתין
            </span>
          )}
        </div>

        {/* Row 2: PnL large + R:R */}
        <div className="flex items-baseline justify-between">
          <p className="text-[22px] font-black font-mono leading-none" style={{ color: pnlColor }}>
            {isOpen ? "—" : fmtPnl(trade.pnl)}
          </p>
          {rrRatio && !isOpen && (
            <span className="text-[9px] font-mono font-bold rounded-lg px-1.5 py-0.5"
              style={{
                background: parseFloat(rrRatio) >= 2 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.06)",
                color: parseFloat(rrRatio) >= 2 ? "rgba(34,197,94,0.7)" : "rgba(239,68,68,0.5)",
                border: `1px solid ${parseFloat(rrRatio) >= 2 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.1)"}`,
              }}>
              1:{rrRatio}R
            </span>
          )}
        </div>

        {/* Row 3: Date + stars/direction */}
        <div className="flex items-center justify-between">
          <p className="text-[9px] text-white/20 font-mono">
            {fmtShortDate(trade.entry_time)} · {fmtTime(trade.entry_time)}
          </p>
          {trade.rating ? (
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} className={cn("h-2.5 w-2.5", trade.rating >= n ? "fill-amber-400 text-amber-400" : "text-white/10")} />
              ))}
            </div>
          ) : (
            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-md"
              style={{
                background: trade.direction === "long" ? "rgba(96,165,250,0.08)" : "rgba(239,68,68,0.07)",
                color: trade.direction === "long" ? "rgba(96,165,250,0.6)" : "rgba(239,68,68,0.5)",
              }}>
              {trade.direction === "long" ? "LONG ↑" : "SHORT ↓"}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

/* ── Glass Text Area ── */
const GlassTextArea = ({
  label, icon: Icon, placeholder, value, onChange, color = "primary"
}: {
  label: string; icon: any; placeholder: string;
  value: string; onChange: (v: string) => void; color?: string;
}) => (
  <div className={cn(
    "rounded-2xl border p-4 space-y-2",
    color === "profit" ? "border-profit/15 bg-gradient-to-br from-profit/[0.03] to-transparent" :
    color === "loss" ? "border-loss/15 bg-gradient-to-br from-loss/[0.03] to-transparent" :
    color === "accent" ? "border-accent/15 bg-gradient-to-br from-accent/[0.03] to-transparent" :
    "border-primary/15 bg-gradient-to-br from-primary/[0.03] to-transparent"
  )}>
    <div className="flex items-center gap-2">
      <Icon className={cn("h-3.5 w-3.5", color === "profit" ? "text-profit" : color === "loss" ? "text-loss" : color === "accent" ? "text-accent" : "text-primary")} />
      <span className={cn("text-[10px] font-bold font-mono uppercase tracking-widest",
        color === "profit" ? "text-profit/70" : color === "loss" ? "text-loss/70" : color === "accent" ? "text-accent/70" : "text-primary/70"
      )}>{label}</span>
    </div>
    <textarea
      rows={3}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent text-[12px] text-foreground/80 placeholder:text-muted-foreground/20 outline-none resize-none leading-relaxed"
    />
  </div>
);

/* ── Trade Room (detail drawer) ── */
const TradeRoom = ({ trade, onClose, onSaved }: { trade: any; onClose: () => void; onSaved: () => void }) => {
  const isWin = (trade.pnl ?? 0) >= 0;
  const isOpen = trade.status === "open";
  const updateTrade = useUpdateTrade();

  const [outcome, setOutcome] = useState(trade.notes || "");
  const [audit, setAudit] = useState(trade.psychology_notes || "");
  const [fix, setFix] = useState(trade.tags?.find((t: string) => t.startsWith("fix:"))?.replace("fix:", "") || "");
  const [saving, setSaving] = useState(false);

  const rrRatio = trade.entry_price && trade.stop_loss && trade.take_profit
    ? Math.abs((trade.take_profit - trade.entry_price) / (trade.entry_price - trade.stop_loss)).toFixed(1)
    : null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const existingTags = (trade.tags || []).filter((t: string) => !t.startsWith("fix:"));
      await updateTrade.mutateAsync({
        id: trade.id,
        notes: outcome || null,
        tags: fix ? [...existingTags, `fix:${fix}`] : existingTags,
      } as any);
      toast.success("הרפלקציה נשמרה ✓");
      onSaved();
    } catch (e: any) {
      toast.error("שגיאה: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto" dir="rtl">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 min-h-screen p-3 md:p-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 pt-2 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onClose}
              className="haptic-press flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-muted-foreground hover:text-foreground transition-all shrink-0">
              <X className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-black text-foreground font-mono">{trade.symbol}</span>
                <span className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                  isOpen ? "bg-primary/10 border-primary/25 text-primary" :
                  isWin ? "bg-profit/10 border-profit/25 text-profit" : "bg-loss/10 border-loss/25 text-loss"
                )}>
                  {isOpen ? "פתוח" : isWin ? "WIN ✓" : "LOSS ✗"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/40 font-mono truncate">{fmtDate(trade.entry_time)}</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="haptic-press flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 md:px-4 py-2 text-[12px] font-bold text-primary hover:bg-primary/20 transition-all disabled:opacity-40 shrink-0">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">שמור רפלקציה</span>
            <span className="sm:hidden">שמור</span>
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* Identity */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-muted-foreground/40">זהות העסקה</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "נכס", value: trade.symbol, mono: true },
                { label: "כיוון", value: trade.direction === "long" ? "לונג ↑" : "שורט ↓", mono: false },
                { label: "תאריך", value: fmtShortDate(trade.entry_time), mono: true },
                { label: "שעה", value: fmtTime(trade.entry_time), mono: true },
                { label: "טיים-פריים", value: trade.timeframe || "—", mono: true },
                { label: "סטאפ", value: trade.setup_type || "—", mono: false },
              ].map(item => (
                <div key={item.label} className="rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2.5">
                  <p className="text-[9px] text-muted-foreground/30 font-mono mb-1">{item.label}</p>
                  <p className={cn("text-[12px] font-bold text-foreground/80", item.mono && "font-mono")}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Financials */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-3.5 w-3.5 text-accent/60" />
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-muted-foreground/40">פיננסים</span>
            </div>
            <div className={cn(
              "rounded-2xl border p-3 mb-3 text-center",
              isOpen ? "border-primary/20 bg-primary/[0.05]" :
              isWin ? "border-profit/20 bg-profit/[0.05]" : "border-loss/20 bg-loss/[0.05]"
            )}>
              <p className="text-[9px] text-muted-foreground/40 font-mono mb-1">רווח / הפסד נקי</p>
              <p className={cn("text-3xl font-black font-mono", isOpen ? "text-primary" : isWin ? "text-profit" : "text-loss")}>
                {isOpen ? "—" : fmtPnl(trade.pnl)}
              </p>
              {rrRatio && (
                <p className={cn("text-[11px] font-mono mt-1", parseFloat(rrRatio) >= 2 ? "text-profit/60" : "text-loss/60")}>
                  R:R 1:{rrRatio}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "כניסה", value: trade.entry_price?.toFixed(5) || "—" },
                { label: "יציאה", value: trade.exit_price?.toFixed(5) || "—" },
                { label: "Stop Loss", value: trade.stop_loss?.toFixed(5) || "—" },
                { label: "Take Profit", value: trade.take_profit?.toFixed(5) || "—" },
                { label: "לוט / כמות", value: `${trade.lot_size}` },
                { label: "סטטוס", value: isOpen ? "פתוח" : "סגור" },
              ].map(item => (
                <div key={item.label} className="rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                  <p className="text-[9px] text-muted-foreground/30 font-mono mb-0.5">{item.label}</p>
                  <p className="text-[11px] font-bold text-foreground/70 font-mono">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chart screenshot */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-muted-foreground/40">גרף הסטאפ</span>
            </div>
            {trade.screenshots?.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {trade.screenshots.map((url: string, i: number) => (
                  <img key={i} src={url} alt={`גרף ${i + 1}`}
                    className="w-full rounded-xl border border-white/[0.06] object-cover" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-28 rounded-xl border border-dashed border-white/[0.08] text-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground/15 mb-2" />
                <p className="text-[11px] text-muted-foreground/25">אין צילום גרף</p>
              </div>
            )}
            {trade.confirmations?.length > 0 && (
              <div className="mt-3">
                <p className="text-[9px] text-muted-foreground/30 font-mono mb-2">אישורים</p>
                <div className="flex flex-wrap gap-1">
                  {trade.confirmations.map((c: string) => (
                    <span key={c} className="rounded-lg border border-primary/15 bg-primary/8 px-2 py-0.5 text-[10px] text-primary/70">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rules + emotion */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-accent/60" />
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-muted-foreground/40">משמעת ורגש</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(trade as any).followed_rules === true && (
                <div className="flex items-center gap-1.5 rounded-xl border border-profit/20 bg-profit/[0.06] px-3 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-profit" />
                  <span className="text-[11px] font-bold text-profit">כל החוקים נשמרו</span>
                </div>
              )}
              {(trade as any).followed_rules === false && (
                <div className="flex items-center gap-1.5 rounded-xl border border-loss/20 bg-loss/[0.06] px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-loss" />
                  <span className="text-[11px] font-bold text-loss">חוקים הופרו</span>
                </div>
              )}
              {trade.psychology_notes && (
                <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <Brain className="h-3.5 w-3.5 text-primary/50" />
                  <span className="text-[11px] text-foreground/60">{trade.psychology_notes}</span>
                </div>
              )}
            </div>
            {trade.rating && (
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-muted-foreground/30 font-mono">דירוג:</p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className={cn("h-4 w-4", trade.rating >= n ? "fill-accent text-accent" : "text-muted-foreground/15")} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reflection boxes */}
          <GlassTextArea
            label="התוצאה — למה ניצחתי / הפסדתי?"
            icon={TrendingUp}
            placeholder="מה קרה בפועל? למה העסקה הלכה לכיוון הזה? האם הייתה הפתעה?"
            value={outcome}
            onChange={setOutcome}
            color={isWin ? "profit" : "loss"}
          />
          <GlassTextArea
            label="הביקורת — מה עשיתי טוב ומה לא?"
            icon={Zap}
            placeholder="מה בוצע בצורה מושלמת? מה היה אפשר לעשות טוב יותר?"
            value={audit}
            onChange={setAudit}
            color="accent"
          />
          <div className="md:col-span-2">
            <GlassTextArea
              label="התיקון — מה אני עושה אחרת בסשן הבא?"
              icon={Brain}
              placeholder="מה השיעור הספציפי מהעסקה הזו? מה לשנות בגישה, בכניסה, ביציאה?"
              value={fix}
              onChange={setFix}
              color="primary"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="mt-5 pb-8">
          <button onClick={handleSave} disabled={saving}
            className="haptic-press w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-primary to-primary/70 py-4 text-[14px] font-bold text-black transition-all hover:brightness-110 disabled:opacity-40 shadow-lg shadow-primary/20">
            {saving
              ? <><Loader2 className="h-5 w-5 animate-spin" /> שומר...</>
              : <><Save className="h-5 w-5" /> שמור רפלקציה</>}
          </button>
        </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 mt-2">
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
