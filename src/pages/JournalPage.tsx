import { useState, useMemo, useEffect, useRef } from "react";
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

/* ── Trade Room — Side Drawer ── */
const TradeRoom = ({ trade, onClose, onSaved }: { trade: any; onClose: () => void; onSaved: () => void }) => {
  const isWin = (trade.pnl ?? 0) >= 0;
  const isOpen = trade.status === "open";
  const updateTrade = useUpdateTrade();
  const [visible, setVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [outcome, setOutcome] = useState(trade.notes || "");
  const [audit, setAudit] = useState(trade.psychology_notes || "");
  const [fix, setFix] = useState(trade.tags?.find((t: string) => t.startsWith("fix:"))?.replace("fix:", "") || "");
  const [saving, setSaving] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  const rrRatio = trade.entry_price && trade.stop_loss && trade.take_profit
    ? Math.abs((trade.take_profit - trade.entry_price) / (trade.entry_price - trade.stop_loss)).toFixed(1)
    : null;

  const pnlColor = isOpen ? "#60a5fa" : isWin ? "#22c55e" : "#ef4444";

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
    <div className="fixed inset-0 z-[80]" dir="rtl">
      {/* Backdrop — dims but doesn't block the page */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Drawer panel — slides in from right */}
      <div
        ref={scrollRef}
        className="absolute top-0 right-0 h-full overflow-y-auto"
        style={{
          width: "min(520px, 100vw)",
          background: "rgba(8,8,14,0.97)",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "-24px 0 80px rgba(0,0,0,0.6)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Colored top strip */}
        <div className="sticky top-0 z-10" style={{ background: "rgba(8,8,14,0.97)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {/* accent line */}
          <div className="h-[2px] w-full" style={{ background: `linear-gradient(to left, transparent, ${pnlColor}70, transparent)` }} />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* direction icon */}
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
                    style={{
                      background: pnlColor + "15",
                      borderColor: pnlColor + "35",
                      color: pnlColor,
                    }}>
                    {isOpen ? "פתוח" : isWin ? "WIN ✓" : "LOSS ✗"}
                  </span>
                </div>
                <p className="text-[11px] text-white/30 font-mono mt-0.5 truncate">{fmtDate(trade.entry_time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleSave} disabled={saving}
                className="haptic-press flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold transition-all disabled:opacity-40"
                style={{ background: pnlColor + "15", border: `1px solid ${pnlColor}30`, color: pnlColor }}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">שמור</span>
              </button>
              <button onClick={handleClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/80 transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="px-5 py-4 space-y-4 pb-10">

          {/* Big PnL hero */}
          <div className="rounded-2xl p-4 text-center"
            style={{ background: pnlColor + "0d", border: `1px solid ${pnlColor}25` }}>
            <p className="text-[9px] text-white/25 font-mono mb-1">רווח / הפסד נקי</p>
            <p className="text-[42px] font-black font-mono leading-none" style={{ color: pnlColor }}>
              {isOpen ? "—" : fmtPnl(trade.pnl)}
            </p>
            {rrRatio && (
              <p className="text-[12px] font-mono mt-2" style={{ color: parseFloat(rrRatio) >= 2 ? "#22c55e99" : "#ef444499" }}>
                R:R 1:{rrRatio}
              </p>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "כניסה", value: trade.entry_price?.toFixed(5) || "—" },
              { label: "יציאה", value: trade.exit_price?.toFixed(5) || "—" },
              { label: "לוט", value: `${trade.lot_size ?? "—"}` },
              { label: "SL", value: trade.stop_loss?.toFixed(5) || "—" },
              { label: "TP", value: trade.take_profit?.toFixed(5) || "—" },
              { label: "TF", value: trade.timeframe || "—" },
            ].map(item => (
              <div key={item.label} className="rounded-xl bg-white/[0.025] border border-white/[0.05] px-3 py-2.5 text-right">
                <p className="text-[9px] text-white/20 font-mono mb-1">{item.label}</p>
                <p className="text-[11px] font-bold text-white/70 font-mono">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Identity row */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "כיוון", value: trade.direction === "long" ? "לונג ↑" : "שורט ↓" },
              { label: "תאריך", value: fmtShortDate(trade.entry_time) },
              { label: "שעה", value: fmtTime(trade.entry_time) },
              ...(trade.setup_type ? [{ label: "סטאפ", value: trade.setup_type }] : []),
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-1.5">
                <span className="text-[9px] text-white/25 font-mono">{item.label}:</span>
                <span className="text-[11px] font-bold text-white/70">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Rules + rating */}
          <div className="flex flex-wrap gap-2 items-center">
            {(trade as any).followed_rules === true && (
              <div className="flex items-center gap-1.5 rounded-xl border border-green-500/20 bg-green-500/[0.07] px-3 py-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                <span className="text-[11px] font-bold text-green-400">כל החוקים נשמרו</span>
              </div>
            )}
            {(trade as any).followed_rules === false && (
              <div className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                <span className="text-[11px] font-bold text-red-400">חוקים הופרו</span>
              </div>
            )}
            {trade.rating && (
              <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className={cn("h-3.5 w-3.5", trade.rating >= n ? "fill-amber-400 text-amber-400" : "text-white/10")} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chart screenshot */}
          {trade.screenshots?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] text-white/20 font-mono uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="h-3 w-3" /> גרף הסטאפ
              </p>
              {trade.screenshots.map((url: string, i: number) => (
                <img key={i} src={url} alt={`גרף ${i + 1}`}
                  className="w-full rounded-2xl border border-white/[0.06] object-cover" />
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-white/[0.05]" />
            <span className="text-[9px] text-white/20 font-mono uppercase tracking-widest">רפלקציה</span>
            <div className="h-[1px] flex-1 bg-white/[0.05]" />
          </div>

          {/* Reflection areas */}
          <GlassTextArea
            label="התוצאה — למה ניצחתי / הפסדתי?"
            icon={TrendingUp}
            placeholder="מה קרה בפועל? למה העסקה הלכה לכיוון הזה?"
            value={outcome}
            onChange={setOutcome}
            color={isWin ? "profit" : "loss"}
          />
          <GlassTextArea
            label="הביקורת — מה עשיתי טוב ומה לא?"
            icon={Zap}
            placeholder="מה בוצע מושלם? מה היה אפשר לעשות טוב יותר?"
            value={audit}
            onChange={setAudit}
            color="accent"
          />
          <GlassTextArea
            label="התיקון — מה אני עושה אחרת בסשן הבא?"
            icon={Brain}
            placeholder="מה השיעור הספציפי? מה לשנות בגישה, בכניסה, ביציאה?"
            value={fix}
            onChange={setFix}
            color="primary"
          />

          {/* Save */}
          <button onClick={handleSave} disabled={saving}
            className="haptic-press w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-[14px] font-bold text-black transition-all hover:brightness-110 disabled:opacity-40"
            style={{ background: `linear-gradient(to left, ${pnlColor}, ${pnlColor}bb)`, boxShadow: `0 8px 24px ${pnlColor}30` }}>
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
