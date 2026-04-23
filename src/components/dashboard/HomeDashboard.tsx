import { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain, TrendingUp, Flame, Target, ArrowUpRight, ArrowDownRight,
  Sparkles, Loader2, BarChart3, Crosshair, Zap, Plug,
  FolderOpen, PlayCircle, BarChart2,
} from "lucide-react";
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, ReferenceLine, CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useTrades, useTradeStats } from "@/hooks/useTrades";

/* ── Animated Counter Hook ── */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>();
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    startRef.current = null;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(target * ease);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else setValue(target);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

/* ── Sparkline ── */
const SPARKLINE_COLORS = {
  primary: "#3b82f6",
  accent: "#F59E0B",
  muted: "rgba(255,255,255,0.25)",
  loss: "#ef4444",
};

const Sparkline = ({ data, color, gradientId }: { data: number[]; color: string; gradientId: string }) => {
  if (data.length < 2) return null;
  const pts = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={pts} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${gradientId})`} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

/* ── Confetti ── */
const CONFETTI_COLORS = ["#00D4AA", "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#A78BFA"];

const Confetti = ({ active, onDone }: { active: boolean; onDone: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.4 - canvas.height * 0.2,
      w: Math.random() * 9 + 4,
      h: Math.random() * 5 + 2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.18,
      vx: (Math.random() - 0.5) * 3.5,
      vy: Math.random() * 3 + 1.5,
      opacity: 1,
    }));

    const startTime = Date.now();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - startTime;

      let allGone = true;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.rotation += p.rotSpeed;
        if (elapsed > 1800) p.opacity = Math.max(0, p.opacity - 0.018);
        if (p.opacity > 0) allGone = false;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (!allGone && elapsed < 4000) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        onDoneRef.current();
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9999]" />;
};

/* ── Market Hours Logic (Israel Time) ── */
function getMarketStatus(): { open: boolean; label: string } {
  const now = new Date();
  const israelStr = now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" });
  const israel = new Date(israelStr);
  const day = israel.getDay();
  const hours = israel.getHours();
  const minutes = israel.getMinutes();
  const timeNum = hours * 60 + minutes;

  const isUsDST = (() => {
    const month = israel.getMonth();
    if (month > 2 && month < 10) return true;
    if (month === 2) return israel.getDate() >= 10;
    if (month === 10) return israel.getDate() <= 3;
    return false;
  })();

  const isSaturday = day === 6;
  const isFriday = day === 5;
  const isSunday = day === 0;

  const forexOpen = (() => {
    if (isSaturday) return false;
    if (isFriday && timeNum >= 23 * 60) return false;
    if (isSunday && timeNum < 23 * 60) return false;
    return true;
  })();

  const usOpenMin = isUsDST ? 16 * 60 + 30 : 17 * 60 + 30;
  const usCloseMin = isUsDST ? 23 * 60 : 24 * 60;
  const isWeekday = day >= 1 && day <= 5;
  const usOpen = isWeekday && timeNum >= usOpenMin && timeNum < usCloseMin;

  if (!forexOpen) return { open: false, label: "השוק סגור — סוף שבוע" };
  if (usOpen) return { open: true, label: "השוק פתוח — וול סטריט פעיל" };
  if (isWeekday && timeNum < usOpenMin) {
    const hLeft = Math.floor((usOpenMin - timeNum) / 60);
    const mLeft = (usOpenMin - timeNum) % 60;
    return { open: true, label: `פורקס פתוח — וול סטריט נפתח בעוד ${hLeft > 0 ? hLeft + " שעות " : ""}${mLeft} דקות` };
  }
  return { open: true, label: "פורקס פתוח" };
}

/* ── Demo Data ── */
const DEMO_TRADES = [
  { id: "d1", symbol: "EURUSD", direction: "long", pnl: 342.50, status: "closed", setup_type: "Breakout", entry_time: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: "d2", symbol: "GOLD", direction: "long", pnl: 780.00, status: "closed", setup_type: "Trend Follow", entry_time: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "d3", symbol: "NAS100", direction: "short", pnl: -215.00, status: "closed", setup_type: "Reversal", entry_time: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "d4", symbol: "GBPUSD", direction: "long", pnl: 128.75, status: "closed", setup_type: "Breakout", entry_time: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: "d5", symbol: "BTCUSD", direction: "short", pnl: -89.00, status: "closed", setup_type: "Scalp", entry_time: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: "d6", symbol: "SPX500", direction: "long", pnl: 540.00, status: "closed", setup_type: "Trend Follow", entry_time: new Date(Date.now() - 86400000 * 6).toISOString() },
  { id: "d7", symbol: "EURUSD", direction: "short", pnl: 195.25, status: "closed", setup_type: "Reversal", entry_time: new Date(Date.now() - 86400000 * 8).toISOString() },
  { id: "d8", symbol: "GOLD", direction: "long", pnl: -310.00, status: "closed", setup_type: "Breakout", entry_time: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: "d9", symbol: "NAS100", direction: "long", pnl: 920.00, status: "closed", setup_type: "Trend Follow", entry_time: new Date(Date.now() - 86400000 * 12).toISOString() },
  { id: "d10", symbol: "USDJPY", direction: "long", pnl: 0, status: "open", setup_type: "Scalp", entry_time: new Date(Date.now() - 3600000).toISOString() },
  { id: "d11", symbol: "GBPJPY", direction: "short", pnl: 0, status: "open", setup_type: "Reversal", entry_time: new Date(Date.now() - 7200000).toISOString() },
];

/* ── Empty State ── */
const DashboardEmptyState = ({ onConnectBroker, onDemo }: { onConnectBroker: () => void; onDemo: () => void }) => (
  <div className="space-y-6 py-4" dir="rtl">

    {/* Hero Section */}
    <div className="relative rounded-2xl border border-primary/12 bg-gradient-to-br from-primary/[0.06] via-transparent to-accent/[0.03] p-6 md:p-8 overflow-hidden text-center">
      <div className="absolute top-0 right-0 w-72 h-40 bg-primary/[0.08] rounded-full blur-[70px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-32 bg-accent/[0.05] rounded-full blur-[60px] pointer-events-none" />

      <div className="relative">
        <div className="flex justify-center mb-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-[0_0_24px_rgba(0,212,170,0.2)]">
            <BarChart2 className="h-8 w-8 text-primary" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl md:text-2xl font-extrabold text-foreground mb-2 tracking-tight">
          התחילו לנתח את המסחר שלכם
        </h2>
        <p className="text-sm text-muted-foreground/50 max-w-sm mx-auto leading-relaxed mb-6">
          חברו ברוקר אחד ו-ZenTrade יסנכרן את כל העסקאות שלכם אוטומטית — ותקבלו תובנות AI מיידיות.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onConnectBroker}
            className="haptic-press flex items-center gap-2.5 rounded-xl bg-primary text-[#0d1a17] px-6 py-3.5 text-sm font-black transition-all hover:brightness-110 shadow-[0_0_20px_rgba(0,212,170,0.3)] hover:shadow-[0_0_28px_rgba(0,212,170,0.5)] min-h-[48px]"
          >
            <Plug className="h-4 w-4 stroke-[2.5]" />
            חברו ברוקר
          </button>
          <button
            onClick={onDemo}
            className="haptic-press flex items-center gap-2.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-foreground/70 transition-all hover:bg-white/[0.07] min-h-[48px]"
          >
            <PlayCircle className="h-4 w-4" />
            צפה בהדגמה
          </button>
        </div>
      </div>
    </div>

    {/* Feature preview cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[
        {
          icon: "📊",
          title: "KPI בזמן אמת",
          desc: "Win Rate, Profit Factor, Drawdown — מעודכנים אחרי כל עסקה",
          preview: (
            <div className="flex gap-2 mt-2">
              {[{ v: "73%", l: "Win Rate", c: "text-primary" }, { v: "2.4", l: "PF", c: "text-primary" }, { v: "3.1%", l: "DD", c: "text-destructive" }].map(k => (
                <div key={k.l} className="flex-1 rounded-lg bg-white/[0.04] px-2 py-1.5 text-center">
                  <p className={`text-[13px] font-black font-mono ${k.c}`}>{k.v}</p>
                  <p className="text-[8px] text-muted-foreground/30 font-mono">{k.l}</p>
                </div>
              ))}
            </div>
          ),
          color: "border-primary/12 bg-primary/[0.02]",
        },
        {
          icon: "🧠",
          title: "מנטור AI אישי",
          desc: "ניתוח פסיכולוגי של כל עסקה ותובנות לשיפור ביצועים",
          preview: (
            <div className="mt-2 rounded-lg bg-white/[0.04] border border-white/[0.05] p-2.5">
              <p className="text-[9px] text-primary/60 font-mono mb-1">AI MENTOR</p>
              <p className="text-[10px] text-foreground/50 leading-relaxed">
                "ראיתי שאתה נכנס אחרי שעות המסחר שלך — זה גרם ל-3 הפסדים אחרונים..."
              </p>
            </div>
          ),
          color: "border-accent/10 bg-accent/[0.02]",
        },
        {
          icon: "🔥",
          title: "מפת חום ביצועים",
          desc: "ראה באילו ימים ושעות אתה מרוויח הכי הרבה",
          preview: (
            <div className="mt-2 grid grid-cols-7 gap-0.5">
              {[3,1,0,-1,2,4,1,0,2,-1,3,1,0,2].map((v, i) => (
                <div key={i} className={`h-4 rounded-sm ${v > 2 ? "bg-primary/60" : v > 0 ? "bg-primary/25" : v === 0 ? "bg-white/[0.04]" : "bg-destructive/25"}`} />
              ))}
            </div>
          ),
          color: "border-white/[0.06] bg-white/[0.01]",
        },
      ].map((f) => (
        <div key={f.title} className={`rounded-2xl border p-4 ${f.color}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{f.icon}</span>
            <span className="text-[13px] font-bold text-foreground/80">{f.title}</span>
          </div>
          <p className="text-[11px] text-muted-foreground/40 leading-relaxed">{f.desc}</p>
          {f.preview}
        </div>
      ))}
    </div>

    {/* Broker logos row */}
    <div className="text-center">
      <p className="text-[10px] text-muted-foreground/25 font-mono mb-3 uppercase tracking-wider">תואם לכל הפלטפורמות המובילות</p>
      <div className="flex items-center justify-center gap-3 flex-wrap opacity-30">
        {["MT4", "MT5", "Binance", "TV", "IBKR", "Rithmic"].map(b => (
          <span key={b} className="text-[10px] font-mono font-bold text-foreground/60 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-lg">{b}</span>
        ))}
      </div>
    </div>
  </div>
);

/* ── Component ── */
const HomeDashboard = ({ userName, onOpenTrade, onConnectBroker }: { userName: string; onOpenTrade?: () => void; onConnectBroker?: () => void }) => {
  const marketStatus = getMarketStatus();
  const { userProfile } = useUserProfile();
  const [aiBriefing, setAiBriefing] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const prevTradesLengthRef = useRef<number>(-1);

  const { data: realTrades = [], isLoading } = useTrades();
  const realStats = useTradeStats();

  const trades = demoMode ? DEMO_TRADES as typeof realTrades : realTrades;
  const stats = demoMode ? (() => {
    const closed = DEMO_TRADES.filter(t => t.status === "closed");
    const wins = closed.filter(t => t.pnl > 0);
    const totalPnl = closed.reduce((s, t) => s + t.pnl, 0);
    const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(closed.filter(t => t.pnl < 0).reduce((s, t) => s + t.pnl, 0));
    return {
      totalPnl,
      winRate: closed.length > 0 ? (wins.length / closed.length) * 100 : 0,
      profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit,
      totalTrades: closed.length,
      openTrades: DEMO_TRADES.filter(t => t.status === "open").length,
    };
  })() : realStats;

  const hasTrades = trades.length > 0;

  /* ── Confetti trigger: new profitable closed trade ── */
  useEffect(() => {
    if (!hasTrades) return;
    const prev = prevTradesLengthRef.current;
    if (prev >= 0 && trades.length > prev) {
      const newest = trades[0];
      if (newest && newest.status === "closed" && (newest.pnl ?? 0) > 0) {
        setShowConfetti(true);
        toast.success(`🎉 עסקת רווח! +$${(newest.pnl ?? 0).toFixed(2)}`);
      }
    }
    prevTradesLengthRef.current = trades.length;
  }, [trades, hasTrades]);

  /* ── Sparkline data ── */
  const closedTrades = trades.filter(t => t.status === "closed" && t.pnl != null);

  // Equity curve: cumulative PnL over last 12 closed trades
  const equitySparkline = (() => {
    const last = closedTrades.slice(-12);
    let cum = 0;
    return last.map(t => { cum += t.pnl ?? 0; return cum; });
  })();

  // Win rate sparkline: rolling over last 12 trades
  const winRateSparkline = (() => {
    const last = closedTrades.slice(-12);
    return last.map((_, i) => {
      const window = last.slice(0, i + 1);
      const wins = window.filter(t => (t.pnl ?? 0) > 0).length;
      return window.length > 0 ? (wins / window.length) * 100 : 0;
    });
  })();

  // Profit factor sparkline: raw PnL per trade
  const pfSparkline = (() => {
    return closedTrades.slice(-12).map(t => t.pnl ?? 0);
  })();

  /* ── Annual P&L (12 months of current year) ── */
  const MONTH_LABELS = ["ינו׳","פבר׳","מרץ","אפר׳","מאי","יונ׳","יול׳","אוג׳","ספט׳","אוק׳","נוב׳","דצמ׳"];
  const currentYear = new Date().getFullYear();

  const annualData = (() => {
    const totals = Array(12).fill(0);
    closedTrades.forEach(t => {
      const d = new Date(t.entry_time);
      if (d.getFullYear() === currentYear) {
        totals[d.getMonth()] += t.pnl ?? 0;
      }
    });
    let cumulative = 0;
    return totals.map((pnl, i) => {
      cumulative += pnl;
      return { month: MONTH_LABELS[i], pnl: parseFloat(pnl.toFixed(2)), cumulative: parseFloat(cumulative.toFixed(2)) };
    });
  })();

  const annualTotal = annualData.reduce((s, d) => s + d.pnl, 0);
  const annualPositive = annualTotal >= 0;
  const bestMonth = annualData.reduce((a, b) => b.pnl > a.pnl ? b : a, annualData[0] ?? { month: "", pnl: 0 });
  const worstMonth = annualData.reduce((a, b) => b.pnl < a.pnl ? b : a, annualData[0] ?? { month: "", pnl: 0 });
  const hasAnnualData = closedTrades.some(t => new Date(t.entry_time).getFullYear() === currentYear);

  /* ── Setup performance ── */
  const setupData = (() => {
    if (!hasTrades) return [];
    const map: Record<string, { pnl: number; wins: number; total: number }> = {};
    trades.filter(t => t.status === "closed" && t.setup_type).forEach(t => {
      const name = t.setup_type!;
      if (!map[name]) map[name] = { pnl: 0, wins: 0, total: 0 };
      map[name].pnl += t.pnl ?? 0;
      map[name].total += 1;
      if ((t.pnl ?? 0) > 0) map[name].wins += 1;
    });
    return Object.entries(map).map(([name, d]) => ({
      name, pnl: d.pnl, wr: d.total > 0 ? Math.round((d.wins / d.total) * 100) : 0, trades: d.total,
    })).sort((a, b) => b.pnl - a.pnl).slice(0, 5);
  })();

  const recentTrades = trades.slice(0, 5);

  /* ── Trading streak (consecutive days with trades) ── */
  const tradingStreak = (() => {
    if (closedTrades.length === 0) return 0;
    const days = [...new Set(closedTrades.map(t => t.entry_time.split("T")[0]))].sort().reverse();
    let count = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diff = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 1) count++;
      else break;
    }
    return count;
  })();

  /* ── Animated counters ── */
  const animatedPnl = useCountUp(stats.totalPnl);
  const animatedWr = useCountUp(stats.winRate);
  const animatedPf = useCountUp(stats.profitFactor);
  const animatedOpen = useCountUp(stats.openTrades);

  const handleAiAnalyst = async () => {
    setAiLoading(true);
    setAiBriefing("");
    try {
      const { data, error } = await supabase.functions.invoke("dashboard-ai-analyst", {
        body: { winRate: stats.winRate, profitFactor: stats.profitFactor, totalPnl: stats.totalPnl },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiBriefing(data.briefing);
    } catch (e) {
      toast.error(e.message || "שגיאה בניתוח AI");
    } finally {
      setAiLoading(false);
    }
  };

  const handleConfettiDone = useCallback(() => setShowConfetti(false), []);

  /* ── Daily PnL (today's closed trades) ── */
  const dailyPnl = (() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return closedTrades
      .filter(t => t.entry_time.startsWith(todayStr))
      .reduce((s, t) => s + (t.pnl ?? 0), 0);
  })();

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 p-2 md:p-4 page-enter">
      <Confetti active={showConfetti} onDone={handleConfettiDone} />

      {/* ═══════ COMMAND BAR ═══════ */}
      <div className="relative rounded-2xl overflow-hidden obsidian-command-bar"
        style={{
          background: "rgba(0,0,0,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 0 0 1px rgba(59,130,246,0.06), 0 24px 48px rgba(0,0,0,0.6)",
        }}>
        {/* Terminal grid */}
        <div className="absolute inset-0 terminal-grid opacity-60 pointer-events-none" />
        {/* Blue top edge */}
        <div className="absolute top-0 inset-x-0 h-[1px]"
          style={{ background: "linear-gradient(to right, transparent, rgba(59,130,246,0.5), transparent)" }} />
        {/* Blue ambient glow */}
        <div className="absolute top-0 right-0 w-72 h-24 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4">
          {/* Identity */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 border text-[9px] font-black font-mono uppercase tracking-widest ${
                marketStatus.open
                  ? "border-blue-500/25 bg-blue-500/10 text-blue-400"
                  : "border-red-500/25 bg-red-500/10 text-red-400"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${marketStatus.open ? "bg-blue-400" : "bg-red-400"}`} />
                {marketStatus.label}
              </div>
              <span className="text-[9px] font-mono text-foreground/30 uppercase tracking-widest">
                {new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </div>
            <h1 className="text-[22px] font-black text-foreground leading-tight tracking-tight">
              שלום, <span style={{ color: "#60a5fa", textShadow: "0 0 20px rgba(59,130,246,0.4)" }}>{userName}</span>
            </h1>
            {userProfile.weaknesses?.[0] && (
              <p className="text-[11px] text-foreground/40 mt-1 flex items-center gap-1.5">
                <span>🎯</span>
                <span>מטרת היום: {
                  userProfile.weaknesses[0] === "overtrading" ? "לא לסחור יותר מ-3 עסקאות" :
                  userProfile.weaknesses[0] === "fomo" ? "להמתין לסטאפ מושלם" :
                  userProfile.weaknesses[0] === "cutting-winners" ? "לתת לרווחים לרוץ" :
                  userProfile.weaknesses[0] === "moving-sl" ? "לא להזיז את ה-SL" : ""
                }</span>
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {tradingStreak >= 2 && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.2)" }}>
                <span className="text-base leading-none">🔥</span>
                <div>
                  <p className="text-[11px] font-black text-orange-400 leading-none">{tradingStreak} ימים</p>
                  <p className="text-[7px] font-mono text-orange-400/40 uppercase">streak</p>
                </div>
              </div>
            )}
            {hasTrades && !aiBriefing && (
              <button onClick={handleAiAnalyst} disabled={aiLoading}
                className="haptic-press flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-black transition-all"
                style={{
                  background: "rgba(59,130,246,0.12)",
                  border: "1px solid rgba(59,130,246,0.25)",
                  color: "#93c5fd",
                  boxShadow: aiLoading ? "none" : "0 0 20px rgba(59,130,246,0.1)",
                }}>
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {aiLoading ? "מנתח..." : "סקירת AI"}
              </button>
            )}
            {onOpenTrade && (
              <button onClick={onOpenTrade}
                className="haptic-press flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-black text-white dark:text-white transition-all"
                style={{
                  background: "hsl(var(--primary))",
                  boxShadow: "0 0 24px rgba(59,130,246,0.3)",
                }}>
                <Zap className="h-4 w-4" />
                עסקה חדשה
              </button>
            )}
          </div>
        </div>

        {/* ── THE BIG 3 ── */}
        {hasTrades && (
          <div className="grid grid-cols-3 border-t border-border/20">
            {/* 1. Total Balance / PnL */}
            <div className="relative px-3 sm:px-5 py-3 sm:py-4 border-l border-border/20">
              <p className="text-[8px] sm:text-[9px] font-black font-mono uppercase tracking-widest text-foreground/30 mb-1">P&L כולל</p>
              <p className="text-[15px] sm:text-[22px] md:text-[28px] font-black font-mono leading-none tabular-nums truncate"
                style={{
                  color: stats.totalPnl >= 0 ? "#60a5fa" : "#f87171",
                  textShadow: stats.totalPnl >= 0 ? "0 0 24px rgba(59,130,246,0.5)" : "0 0 24px rgba(239,68,68,0.5)",
                }}>
                {animatedPnl >= 0 ? "+" : ""}${Math.abs(animatedPnl).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <div className="hidden sm:flex items-center gap-1.5 mt-1">
                <span className="text-[9px] text-foreground/30 font-mono">{stats.totalTrades} עסקאות</span>
                <span className="text-foreground/15">·</span>
                <span className="text-[9px] font-mono" style={{ color: "#60a5fa" }}>WR {animatedWr.toFixed(0)}%</span>
              </div>
              <p className="sm:hidden text-[8px] text-foreground/30 font-mono mt-0.5">{stats.totalTrades} עסקאות</p>
            </div>

            {/* 2. Daily PnL */}
            <div className="relative px-3 sm:px-5 py-3 sm:py-4 border-l border-border/20">
              <p className="text-[8px] sm:text-[9px] font-black font-mono uppercase tracking-widest text-foreground/30 mb-1">P&L היום</p>
              <p className="text-[15px] sm:text-[22px] md:text-[28px] font-black font-mono leading-none tabular-nums truncate"
                style={{
                  color: dailyPnl >= 0 ? "#4ade80" : "#f87171",
                  textShadow: dailyPnl >= 0 ? "0 0 24px rgba(74,222,128,0.4)" : "0 0 24px rgba(239,68,68,0.4)",
                }}>
                {dailyPnl >= 0 ? "+" : ""}${Math.abs(dailyPnl).toFixed(0)}
              </p>
              <p className="text-[8px] sm:text-[9px] text-foreground/30 font-mono mt-1">
                {closedTrades.filter(t => t.entry_time.startsWith(new Date().toISOString().split("T")[0])).length} עסקאות היום
              </p>
            </div>

            {/* 3. Open Positions */}
            <div className="relative px-3 sm:px-5 py-3 sm:py-4">
              <p className="text-[8px] sm:text-[9px] font-black font-mono uppercase tracking-widest text-foreground/30 mb-1">פוזיציות</p>
              <p className="text-[15px] sm:text-[22px] md:text-[28px] font-black font-mono leading-none tabular-nums text-foreground">
                {Math.round(animatedOpen)}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                {Array.from({ length: Math.min(stats.openTrades, 6) }, (_, i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-blue-400/60 animate-pulse"
                    style={{ animationDelay: `${i * 150}ms`, boxShadow: "0 0 4px rgba(59,130,246,0.6)" }} />
                ))}
                {stats.openTrades === 0 && <span className="text-[8px] sm:text-[9px] text-foreground/25 font-mono">אין</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Insight Banner */}
      {aiBriefing && (
        <div className="relative rounded-2xl border border-primary/15 bg-primary/[0.04] backdrop-blur-md p-4 overflow-hidden">
          <div className="absolute top-0 left-0 w-60 h-60 bg-primary/[0.06] rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/[0.04] rounded-full blur-[60px]" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 shrink-0 mt-0.5">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-2xs font-bold text-primary/60 font-mono mb-1">AI INSIGHT</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{aiBriefing}</p>
            </div>
          </div>
        </div>
      )}

      {/* Demo banner */}
      {demoMode && (
        <div className="flex items-center justify-between rounded-xl border border-accent/20 bg-accent/[0.05] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-accent">מצב הדגמה — נתונים מדומים</span>
          </div>
          <button onClick={() => setDemoMode(false)} className="text-[10px] font-mono text-accent/60 hover:text-accent underline underline-offset-2">יציאה</button>
        </div>
      )}

      {/* ═══════ EMPTY STATE ═══════ */}
      {!isLoading && !hasTrades && !demoMode && (
        <DashboardEmptyState onConnectBroker={onConnectBroker || (() => {})} onDemo={() => setDemoMode(true)} />
      )}

      {/* ═══════ KPI CARDS ═══════ */}
      {hasTrades && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

            {/* Total P&L */}
            {(() => {
              const pos = stats.totalPnl >= 0;
              const c = pos ? { main: "#60a5fa", glow: "rgba(59,130,246,0.18)", bg: "rgba(59,130,246,0.05)", border: "rgba(59,130,246,0.18)", top: "rgba(59,130,246,0.5)" }
                             : { main: "#f87171", glow: "rgba(239,68,68,0.18)", bg: "rgba(239,68,68,0.05)", border: "rgba(239,68,68,0.18)", top: "rgba(239,68,68,0.5)" };
              return (
                <div className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] cursor-default"
                  style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 4px 32px ${c.glow}` }}>
                  <div className="h-[1.5px] w-full" style={{ background: `linear-gradient(to right, transparent, ${c.top}, transparent)` }} />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-black font-mono uppercase tracking-widest" style={{ color: c.main + "80" }}>P&L כולל</span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: c.main + "15", border: `1px solid ${c.main}25` }}>
                        <TrendingUp className="h-3.5 w-3.5" style={{ color: c.main }} />
                      </div>
                    </div>
                    <p className="text-[26px] font-black font-mono tracking-tight leading-none mb-1"
                      style={{ color: c.main, textShadow: `0 0 28px ${c.glow}` }}>
                      {animatedPnl >= 0 ? "+" : ""}${Math.abs(animatedPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-[9px] font-mono mb-3" style={{ color: c.main + "50" }}>{stats.totalTrades} עסקאות</p>
                    <div className="-mx-4 -mb-4">
                      <Sparkline data={equitySparkline} color={c.main} gradientId="sg-pnl" />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Win Rate */}
            {(() => {
              const wr = stats.winRate;
              const c = wr >= 55 ? { main: "#4ade80", glow: "rgba(74,222,128,0.15)", bg: "rgba(74,222,128,0.04)", border: "rgba(74,222,128,0.16)", top: "rgba(74,222,128,0.45)" }
                       : wr >= 45 ? { main: "#fbbf24", glow: "rgba(251,191,36,0.15)", bg: "rgba(251,191,36,0.04)", border: "rgba(251,191,36,0.16)", top: "rgba(251,191,36,0.45)" }
                                  : { main: "#f87171", glow: "rgba(248,113,113,0.15)", bg: "rgba(248,113,113,0.04)", border: "rgba(248,113,113,0.16)", top: "rgba(248,113,113,0.45)" };
              return (
                <div className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] cursor-default"
                  style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 4px 32px ${c.glow}` }}>
                  <div className="h-[1.5px] w-full" style={{ background: `linear-gradient(to right, transparent, ${c.top}, transparent)` }} />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-black font-mono uppercase tracking-widest" style={{ color: c.main + "80" }}>Win Rate</span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: c.main + "15", border: `1px solid ${c.main}25` }}>
                        <Target className="h-3.5 w-3.5" style={{ color: c.main }} />
                      </div>
                    </div>
                    <p className="text-[26px] font-black font-mono tracking-tight leading-none mb-1"
                      style={{ color: c.main, textShadow: `0 0 28px ${c.glow}` }}>
                      {animatedWr.toFixed(0)}%
                    </p>
                    <div className="h-1 rounded-full mb-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(animatedWr, 100)}%`, background: c.main, boxShadow: `0 0 8px ${c.main}` }} />
                    </div>
                    <div className="-mx-4 -mb-4">
                      <Sparkline data={winRateSparkline} color={c.main} gradientId="sg-wr" />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Profit Factor */}
            {(() => {
              const pf = stats.profitFactor;
              const c = { main: "#a78bfa", glow: "rgba(167,139,250,0.15)", bg: "rgba(167,139,250,0.04)", border: "rgba(167,139,250,0.16)", top: "rgba(167,139,250,0.45)" };
              const pfLabel = pf >= 2 ? "מצוין" : pf >= 1.5 ? "טוב" : pf >= 1 ? "סביר" : "חלש";
              return (
                <div className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] cursor-default"
                  style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 4px 32px ${c.glow}` }}>
                  <div className="h-[1.5px] w-full" style={{ background: `linear-gradient(to right, transparent, ${c.top}, transparent)` }} />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-black font-mono uppercase tracking-widest" style={{ color: c.main + "80" }}>Profit Factor</span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: c.main + "15", border: `1px solid ${c.main}25` }}>
                        <BarChart3 className="h-3.5 w-3.5" style={{ color: c.main }} />
                      </div>
                    </div>
                    <p className="text-[26px] font-black font-mono tracking-tight leading-none mb-1"
                      style={{ color: c.main, textShadow: `0 0 28px ${c.glow}` }}>
                      {animatedPf.toFixed(2)}
                    </p>
                    <span className="inline-block rounded-md px-2 py-0.5 text-[8px] font-bold mb-3" style={{ background: c.main + "15", color: c.main, border: `1px solid ${c.main}20` }}>
                      {pfLabel}
                    </span>
                    <div className="-mx-4 -mb-4">
                      <Sparkline data={pfSparkline} color={c.main} gradientId="sg-pf" />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Open Trades */}
            {(() => {
              const open = stats.openTrades;
              const c = { main: "#fbbf24", glow: "rgba(251,191,36,0.15)", bg: "rgba(251,191,36,0.04)", border: "rgba(251,191,36,0.16)", top: "rgba(251,191,36,0.45)" };
              return (
                <div className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] cursor-default"
                  style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: open > 0 ? `0 4px 32px ${c.glow}` : undefined }}>
                  <div className="h-[1.5px] w-full" style={{ background: `linear-gradient(to right, transparent, ${c.top}, transparent)` }} />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-black font-mono uppercase tracking-widest" style={{ color: c.main + "80" }}>פוזיציות פתוחות</span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: c.main + "15", border: `1px solid ${c.main}25` }}>
                        <Flame className="h-3.5 w-3.5" style={{ color: c.main }} />
                      </div>
                    </div>
                    <p className="text-[26px] font-black font-mono tracking-tight leading-none mb-1"
                      style={{ color: open > 0 ? c.main : "rgba(255,255,255,0.25)", textShadow: open > 0 ? `0 0 28px ${c.glow}` : undefined }}>
                      {Math.round(animatedOpen)}
                    </p>
                    <p className="text-[9px] font-mono mb-3" style={{ color: c.main + "50" }}>
                      {open === 0 ? "אין פוזיציות" : `${open} עסקה${open !== 1 ? "ות" : ""} פתוחה`}
                    </p>
                    <div className="flex gap-1.5 flex-wrap min-h-[8px]">
                      {Array.from({ length: Math.min(open, 8) }, (_, i) => (
                        <span key={i} className="h-2 w-2 rounded-full animate-pulse"
                          style={{ background: c.main, boxShadow: `0 0 6px ${c.main}`, animationDelay: `${i * 120}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ═══════ MIDDLE ROW: Equity + Setups ═══════ */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-3 rounded-2xl p-4 overflow-hidden obsidian-card">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" style={{ color: "#60a5fa" }} />
                  <span className="text-sm font-bold text-foreground">רווח / הפסד שנתי</span>
                  <span className="text-[9px] text-foreground/30 font-mono border border-border/40 rounded-md px-1.5 py-0.5">{currentYear}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                  style={{
                    background: annualPositive ? "rgba(59,130,246,0.08)" : "rgba(239,68,68,0.08)",
                    border: `1px solid ${annualPositive ? "rgba(59,130,246,0.2)" : "rgba(239,68,68,0.2)"}`,
                  }}>
                  <span className="text-[11px] font-bold font-mono"
                    style={{ color: annualPositive ? "#60a5fa" : "#f87171" }}>
                    {annualPositive ? "+" : ""}${Math.abs(annualTotal).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Mini stats */}
              {hasAnnualData && (
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1.5 rounded-lg px-2 py-1"
                    style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}>
                    <ArrowUpRight className="h-3 w-3" style={{ color: "#60a5fa" }} />
                    <span className="text-[9px] text-foreground/40">הטוב: </span>
                    <span className="text-[9px] font-bold font-mono" style={{ color: "#60a5fa" }}>{bestMonth.month} +${Math.abs(bestMonth.pnl).toFixed(0)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg px-2 py-1"
                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}>
                    <ArrowDownRight className="h-3 w-3 text-red-400" />
                    <span className="text-[9px] text-foreground/40">הגרוע: </span>
                    <span className="text-[9px] font-bold text-red-400 font-mono">{worstMonth.month} ${worstMonth.pnl.toFixed(0)}</span>
                  </div>
                </div>
              )}

              {/* Chart */}
              <div className="h-[175px] -mr-2 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={annualData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }} barCategoryGap="20%">
                    <CartesianGrid vertical={false} stroke="hsl(220,10%,18%)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: "hsl(220, 10%, 45%)", fontFamily: "monospace" }}
                      interval={0}
                    />
                    <YAxis hide domain={["auto", "auto"]} />
                    <ReferenceLine y={0} stroke="hsl(220,10%,28%)" strokeWidth={1} />
                    <Tooltip
                      cursor={{ fill: "hsl(220, 6%, 12%)", opacity: 0.6, radius: 6 }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const val = payload[0].value as number;
                        const pos = val >= 0;
                        return (
                          <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-md px-3 py-2 shadow-2xl">
                            <p className="text-[10px] text-muted-foreground/50 font-mono mb-0.5">{payload[0].payload.month} {currentYear}</p>
                            <p className={`text-[13px] font-bold font-mono ${pos ? "text-primary" : "text-destructive"}`}>
                              {pos ? "+" : ""}${Math.abs(val).toLocaleString()}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={28}>
                      {annualData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.pnl > 0 ? "#00D4AA" : entry.pnl < 0 ? "hsl(0,72%,55%)" : "hsl(220,10%,30%)"}
                          fillOpacity={entry.pnl === 0 ? 0.2 : 0.85}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {!hasAnnualData && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground/30">אין עסקאות ב-{currentYear} עדיין</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-4">
              <div className="flex items-center gap-2 mb-4">
                <Crosshair className="h-4 w-4 text-accent" />
                <span className="text-sm font-bold text-foreground">ביצועי סטאפים</span>
              </div>
              {setupData.length > 0 ? (
                <div className="space-y-2.5">
                  {setupData.map((s, i) => {
                    const positive = s.pnl >= 0;
                    return (
                      <div key={i} className="group flex items-center justify-between rounded-xl border border-border/20 bg-card/30 px-3 py-2.5 hover:bg-card/60 transition-all">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${positive ? "bg-primary/10" : "bg-destructive/10"}`}>
                            <Zap className={`h-3.5 w-3.5 ${positive ? "text-primary" : "text-destructive"}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{s.name}</p>
                            <p className="text-2xs text-muted-foreground/40 font-mono">{s.trades} עסקאות · {s.wr}% WR</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold font-mono shrink-0 ${positive ? "text-primary" : "text-destructive"}`}>
                          {positive ? "+" : ""}${Math.abs(s.pnl).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Crosshair className="h-6 w-6 text-muted-foreground/15 mb-2" />
                  <p className="text-xs text-muted-foreground/30">הוסיפו סטאפים לעסקאות לראות ביצועים</p>
                </div>
              )}
            </div>
          </div>

          {/* ═══════ BOTTOM: Recent Trades Cards ═══════ */}
          <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/15">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <BarChart3 className="h-3.5 w-3.5" style={{ color: "#60a5fa" }} />
                </div>
                <span className="text-[13px] font-bold text-foreground">עסקאות אחרונות</span>
                {recentTrades.length > 0 && (
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold font-mono"
                    style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                    {recentTrades.length}
                  </span>
                )}
              </div>
              {onOpenTrade && (
                <button onClick={onOpenTrade}
                  className="haptic-press flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all"
                  style={{ background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.15)", color: "hsl(var(--primary))" }}>
                  <span>+ עסקה חדשה</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-border/[0.08]">
              {recentTrades.length > 0 ? recentTrades.map((trade) => {
                const pos = (trade.pnl ?? 0) >= 0;
                const pnlColor = pos ? "#4ade80" : "#f87171";
                const dirColor = trade.direction === "long" ? "#60a5fa" : "#f87171";
                return (
                  <div key={trade.id}
                    className="group flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-all cursor-default"
                    style={{ borderRight: `3px solid ${pnlColor}40` }}>
                    {/* Symbol badge */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black text-[12px] font-mono"
                      style={{ background: pnlColor + "12", border: `1px solid ${pnlColor}20`, color: pnlColor }}>
                      {trade.symbol.slice(0, 3)}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-bold text-foreground font-mono">{trade.symbol}</span>
                        <span className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[8px] font-bold"
                          style={{ background: dirColor + "12", color: dirColor, border: `1px solid ${dirColor}20` }}>
                          {trade.direction === "long" ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                          {trade.direction === "long" ? "LONG" : "SHORT"}
                        </span>
                        {trade.setup_type && (
                          <span className="hidden sm:inline text-[8px] text-foreground/25 font-mono border border-border/20 rounded px-1.5 py-0.5">
                            {trade.setup_type}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-foreground/30 font-mono">
                        {new Date(trade.entry_time).toLocaleDateString("he-IL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {/* P&L */}
                    <div className="text-right shrink-0">
                      <p className="text-[17px] font-black font-mono"
                        style={{ color: pnlColor, textShadow: `0 0 16px ${pnlColor}60` }}>
                        {trade.pnl != null ? `${pos ? "+" : ""}$${Math.abs(trade.pnl).toFixed(0)}` : "—"}
                      </p>
                      <p className="text-[8px] font-mono" style={{ color: pnlColor + "60" }}>
                        {pos ? "WIN" : "LOSS"}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-12 text-center">
                  <p className="text-[12px] text-foreground/25">אין עסקאות עדיין</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomeDashboard;
