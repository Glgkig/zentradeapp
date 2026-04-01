import { useState, useMemo, useEffect, useRef } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Rewind, FastForward,
  Sparkles, TrendingUp, Target, BarChart3, ChevronDown, ChevronLeft, ChevronRight,
  Sunrise, Magnet, Zap, Waves, ArrowDownUp, Crosshair,
  Clock, DollarSign, AlertTriangle, Activity, Eye, Layers,
  Timer, Percent, TrendingDown, Award, Signal,
} from "lucide-react";

/* ===== Helpers ===== */
const sr = (seed: number) => { const x = Math.sin(seed) * 10000; return x - Math.floor(x); };

/* ===== Strategies ===== */
const strategies = [
  { id: 1, name: "פריצת בוקר", icon: Sunrise, pair: "NAS100", tf: "M5", desc: "פריצה מעל High של Pre-Market", winHist: 68, trades: 342 },
  { id: 2, name: "חזרת ממוצעים", icon: Magnet, pair: "EUR/USD", tf: "M15", desc: "Mean Reversion מ-Bollinger Bands", winHist: 61, trades: 287 },
  { id: 3, name: "מומנטום ברייקאוט", icon: Zap, pair: "BTC/USD", tf: "H1", desc: "פריצת התנגדות עם ווליום", winHist: 55, trades: 198 },
  { id: 4, name: "Range Scalp", icon: Waves, pair: "GBP/USD", tf: "M1", desc: "סקאלפינג בתוך טווח אסיאתי", winHist: 72, trades: 521 },
  { id: 5, name: "Reversal", icon: ArrowDownUp, pair: "XAU/USD", tf: "H4", desc: "היפוך מגמה באזורי ביקוש", winHist: 48, trades: 156 },
  { id: 6, name: "Sniper Entry", icon: Crosshair, pair: "EUR/JPY", tf: "M5", desc: "כניסה מדויקת מ-Order Block", winHist: 64, trades: 410 },
];

/* ===== Generate chart candles ===== */
const generateCandles = (strategyId: number, candleCount: number) => {
  const candles: { o: number; h: number; l: number; c: number; v: number }[] = [];
  let price = 50 + sr(strategyId * 200) * 30;
  for (let i = 0; i < candleCount; i++) {
    const phase = i / candleCount;
    const trend = phase < 0.3 ? -0.05 : phase < 0.5 ? 0.4 : phase < 0.75 ? 0.2 : -0.1;
    const vol = 0.6 + sr(strategyId * 1000 + i * 7) * 1.4;
    const change = (sr(strategyId * 500 + i * 13) - 0.45 + trend * 0.3) * vol;
    const o = price;
    const c = price + change;
    const w = sr(strategyId * 300 + i * 17) * 0.7;
    candles.push({ o, h: Math.max(o, c) + w, l: Math.min(o, c) - w, c, v: 30 + sr(strategyId * 700 + i * 23) * 70 });
    price = c;
  }
  return candles;
};

/* ===== Page ===== */
const BacktestingPage = () => {
  const [activeStrategy, setActiveStrategy] = useState(strategies[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [visibleCount, setVisibleCount] = useState(20);
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"strategies" | "results">("strategies");
  const totalCandles = 100;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allCandles = useMemo(() => generateCandles(activeStrategy.id, totalCandles), [activeStrategy.id]);
  const candles = allCandles.slice(0, visibleCount);

  // Playback
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setVisibleCount(prev => {
          if (prev >= totalCandles) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }, 600 / speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed]);

  const stepBack = () => setVisibleCount(prev => Math.max(5, prev - 1));
  const stepForward = () => setVisibleCount(prev => Math.min(totalCandles, prev + 1));
  const progress = (visibleCount / totalCandles) * 100;

  // Stats
  const wins = candles.filter((c) => c.c >= c.o).length;
  const losses = candles.length - wins;
  const winRate = Math.round((wins / candles.length) * 100);
  const pnl = Math.round(candles.reduce((s, c) => s + (c.c - c.o), 0) * 10);
  const dd = Math.round(Math.abs(Math.min(...candles.map((c, i) =>
    candles.slice(0, i + 1).reduce((s, cc) => s + (cc.c - cc.o), 0)
  ))) * 10 * -1) / 10;
  const avgRR = candles.length > 0 ? (Math.abs(pnl) / candles.length * 0.08).toFixed(1) : "0";
  const profitFactor = losses > 0 ? (wins / losses * 1.2).toFixed(2) : "∞";
  const sharpe = (pnl > 0 ? 1.4 + sr(activeStrategy.id * 99) * 0.8 : -0.3 + sr(activeStrategy.id * 77) * 0.5).toFixed(2);

  // Chart
  const allP = candles.flatMap(c => [c.h, c.l]);
  const minP = Math.min(...allP);
  const maxP = Math.max(...allP);
  const range = maxP - minP || 1;
  const toY = (p: number) => 88 - ((p - minP) / range) * 76;
  const cw = 96 / candles.length;

  // EMA
  const ema = candles.reduce<number[]>((acc, c, i) => {
    if (i === 0) return [c.c];
    const k = 2 / 15;
    acc.push(c.c * k + acc[i - 1] * (1 - k));
    return acc;
  }, []);
  const emaPath = ema.map((p, i) => `${i === 0 ? "M" : "L"}${2 + (i / (candles.length - 1)) * 96},${toY(p)}`).join(" ");

  // Bollinger bands (simple)
  const bb = candles.map((c, i) => {
    const slice = candles.slice(Math.max(0, i - 9), i + 1);
    const avg = slice.reduce((s, x) => s + x.c, 0) / slice.length;
    const std = Math.sqrt(slice.reduce((s, x) => s + (x.c - avg) ** 2, 0) / slice.length);
    return { upper: avg + std * 2, lower: avg - std * 2, mid: avg };
  });
  const bbUpperPath = bb.map((b, i) => `${i === 0 ? "M" : "L"}${2 + (i / (candles.length - 1)) * 96},${toY(b.upper)}`).join(" ");
  const bbLowerPath = bb.map((b, i) => `${i === 0 ? "M" : "L"}${2 + (i / (candles.length - 1)) * 96},${toY(b.lower)}`).join(" ");

  const maxVol = Math.max(...candles.map(c => c.v));

  // Equity curve
  const equity = candles.reduce<number[]>((acc, c) => {
    const last = acc.length > 0 ? acc[acc.length - 1] : 0;
    acc.push(last + (c.c - c.o) * 10);
    return acc;
  }, []);
  const eqMin = Math.min(...equity);
  const eqMax = Math.max(...equity);
  const eqRange = eqMax - eqMin || 1;
  const equityPath = equity.map((v, i) => `${i === 0 ? "M" : "L"}${(i / (equity.length - 1)) * 100},${100 - ((v - eqMin) / eqRange) * 80 - 10}`).join(" ");

  return (
    <div className="mx-auto max-w-[1600px] h-[calc(100vh-120px)] md:h-[calc(100vh-56px)] flex flex-col">
      {/* ── Compact Header Bar ── */}
      <div className="shrink-0 flex items-center justify-between border-b border-border/10 bg-secondary/5 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-primary/60" />
          <span className="text-[11px] font-bold text-foreground/80 font-heading">סימולטור בקטסטינג</span>
          <span className="text-[8px] text-muted-foreground/30 font-mono hidden md:inline">v2.1</span>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Status */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-primary/5 border border-primary/10">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            <span className="text-[8px] text-primary/70 font-semibold">AI Engine פעיל</span>
          </div>

          {/* Strategy badge */}
          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-sm bg-muted/10 border border-border/10">
            <span className="text-[9px] font-bold text-foreground/60 font-mono">{activeStrategy.pair}</span>
            <span className="text-[7px] text-muted-foreground/30">·</span>
            <span className="text-[8px] text-muted-foreground/40 font-mono">{activeStrategy.tf}</span>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="md:hidden flex items-center gap-1 rounded-sm bg-secondary/20 border border-border/15 px-2 py-1 text-[9px] font-bold text-foreground/50 haptic-press"
          >
            <Layers className="h-3 w-3" />
            {showPanel ? "גרף" : "פאנל"}
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">

        {/* ── Chart Section ── */}
        <div className={`flex-1 flex flex-col min-h-0 ${showPanel ? "hidden md:flex" : "flex"}`}>
          
          {/* Chart toolbar */}
          <div className="shrink-0 flex items-center justify-between px-2 py-1 border-b border-border/5 bg-[hsl(240,10%,3%)]">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-foreground/70">{activeStrategy.pair}</span>
              <span className="text-[7px] font-mono text-muted-foreground/30">{activeStrategy.tf}</span>
              <span className={`text-[9px] font-mono font-bold ${pnl >= 0 ? "text-profit" : "text-loss"}`}>
                {candles.length > 0 ? candles[candles.length - 1].c.toFixed(2) : "—"}
              </span>
              <span className={`text-[7px] font-mono ${pnl >= 0 ? "text-profit/60" : "text-loss/60"}`}>
                {pnl >= 0 ? "▲" : "▼"} {Math.abs(pnl / 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[7px] text-muted-foreground/25 font-mono">{visibleCount}/{totalCandles}</span>
              <span className="text-[7px] text-muted-foreground/15">|</span>
              <span className="text-[7px] text-muted-foreground/25 font-mono">{speed}x</span>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="flex-1 relative bg-[hsl(240,10%,2.5%)] min-h-[220px]">
            {/* AI scanning overlay */}
            <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-primary/5 border border-primary/8 backdrop-blur-sm">
              <Sparkles className="h-2.5 w-2.5 text-primary/50 animate-pulse" />
              <span className="text-[7px] text-primary/50 font-semibold">AI סורק דפוסים...</span>
            </div>

            {/* OHLC display */}
            {candles.length > 0 && (
              <div className="absolute top-2 right-2 z-20 flex items-center gap-2 text-[7px] font-mono text-muted-foreground/30">
                <span>O <span className="text-foreground/50">{candles[candles.length-1].o.toFixed(2)}</span></span>
                <span>H <span className="text-profit/60">{candles[candles.length-1].h.toFixed(2)}</span></span>
                <span>L <span className="text-loss/60">{candles[candles.length-1].l.toFixed(2)}</span></span>
                <span>C <span className="text-foreground/50">{candles[candles.length-1].c.toFixed(2)}</span></span>
              </div>
            )}

            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              {/* Grid lines */}
              {[15, 30, 45, 60, 75].map(y => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(220,8%,8%)" strokeWidth="0.08" />
              ))}
              {Array.from({ length: 10 }, (_, i) => 10 + i * 9).map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="95" stroke="hsl(220,8%,8%)" strokeWidth="0.08" />
              ))}

              {/* Bollinger Bands */}
              {candles.length > 2 && (
                <>
                  <path d={bbUpperPath} fill="none" stroke="hsl(220,60%,50%)" strokeWidth="0.12" opacity="0.15" />
                  <path d={bbLowerPath} fill="none" stroke="hsl(220,60%,50%)" strokeWidth="0.12" opacity="0.15" />
                </>
              )}

              {/* EMA line */}
              {candles.length > 1 && <path d={emaPath} fill="none" stroke="hsl(45,90%,55%)" strokeWidth="0.2" opacity="0.35" />}

              {/* Volume bars */}
              {candles.map((c, i) => {
                const x = 2 + i * cw;
                const isUp = c.c >= c.o;
                return (
                  <rect
                    key={`v${i}`}
                    x={x + cw * 0.15}
                    y={96 - (c.v / maxVol) * 6}
                    width={cw * 0.7}
                    height={(c.v / maxVol) * 6}
                    fill={isUp ? "hsl(var(--profit))" : "hsl(var(--loss))"}
                    opacity={0.1}
                  />
                );
              })}

              {/* Candlesticks */}
              {candles.map((c, i) => {
                const x = 2 + i * cw;
                const cx = x + cw * 0.5;
                const isUp = c.c >= c.o;
                const color = isUp ? "hsl(var(--profit))" : "hsl(var(--loss))";
                const bt = toY(Math.max(c.o, c.c));
                const bh = Math.max(0.3, Math.abs(toY(c.o) - toY(c.c)));
                return (
                  <g key={i}>
                    <line x1={cx} y1={toY(c.h)} x2={cx} y2={toY(c.l)} stroke={color} strokeWidth="0.12" opacity="0.6" />
                    <rect x={x + cw * 0.15} y={bt} width={cw * 0.7} height={bh} fill={color} opacity={0.9} rx="0.04" />
                  </g>
                );
              })}

              {/* Current price line */}
              {candles.length > 0 && (
                <>
                  <line
                    x1={2 + (candles.length - 1) * cw + cw}
                    y1={toY(candles[candles.length - 1].c)}
                    x2="100"
                    y2={toY(candles[candles.length - 1].c)}
                    stroke="hsl(var(--primary))"
                    strokeWidth="0.1"
                    strokeDasharray="0.4,0.3"
                    opacity="0.4"
                  />
                  <rect
                    x="94"
                    y={toY(candles[candles.length - 1].c) - 1.2}
                    width="6"
                    height="2.4"
                    fill="hsl(var(--primary))"
                    opacity="0.6"
                    rx="0.15"
                  />
                  <text
                    x="97"
                    y={toY(candles[candles.length - 1].c) + 0.4}
                    fill="hsl(var(--primary-foreground))"
                    fontSize="1.5"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {candles[candles.length - 1].c.toFixed(1)}
                  </text>
                </>
              )}
            </svg>

            {/* Price Y-axis */}
            <div className="absolute top-2 bottom-8 right-0.5 w-6 flex flex-col justify-between items-end pointer-events-none">
              {[maxP, maxP - range * 0.25, maxP - range * 0.5, maxP - range * 0.75, minP].map((p, i) => (
                <span key={i} className="text-[5px] text-muted-foreground/15 font-mono">{p.toFixed(1)}</span>
              ))}
            </div>
          </div>

          {/* ── Playback Controls ── */}
          <div className="shrink-0 border-t border-border/8 bg-[hsl(240,10%,3%)] px-3 py-2">
            {/* Progress bar */}
            <div
              className="relative h-[3px] bg-muted/10 mb-2 cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                setVisibleCount(Math.max(5, Math.round(pct * totalCandles)));
              }}
            >
              <div className="absolute inset-y-0 left-0 bg-primary/40 transition-all duration-200" style={{ width: `${progress}%` }} />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.4)] transition-all duration-200 opacity-0 group-hover:opacity-100"
                style={{ left: `${progress}%`, marginLeft: "-5px" }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                {[1, 2, 5, 10].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`rounded-sm px-1.5 py-0.5 text-[7px] font-bold font-mono border transition-all haptic-press ${
                      speed === s
                        ? "bg-primary/10 text-primary border-primary/15"
                        : "bg-transparent text-muted-foreground/25 border-transparent hover:text-muted-foreground/40"
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button onClick={stepBack} disabled={visibleCount <= 5}
                  className="flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground/30 hover:text-foreground/60 hover:bg-muted/10 transition-all disabled:opacity-15 haptic-press">
                  <SkipBack className="h-3 w-3" />
                </button>
                <button onClick={() => setVisibleCount(prev => Math.max(5, prev - 5))} disabled={visibleCount <= 5}
                  className="flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground/30 hover:text-foreground/60 hover:bg-muted/10 transition-all disabled:opacity-15 haptic-press">
                  <Rewind className="h-3 w-3" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex h-9 w-9 items-center justify-center rounded-sm border transition-all duration-200 haptic-press ${
                    isPlaying
                      ? "bg-primary/15 border-primary/25 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
                      : "bg-primary/8 border-primary/12 text-primary/80 hover:bg-primary/15"
                  }`}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 mr-[-1px]" />}
                </button>

                <button onClick={() => setVisibleCount(prev => Math.min(totalCandles, prev + 5))} disabled={visibleCount >= totalCandles}
                  className="flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground/30 hover:text-foreground/60 hover:bg-muted/10 transition-all disabled:opacity-15 haptic-press">
                  <FastForward className="h-3 w-3" />
                </button>
                <button onClick={stepForward} disabled={visibleCount >= totalCandles}
                  className="flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground/30 hover:text-foreground/60 hover:bg-muted/10 transition-all disabled:opacity-15 haptic-press">
                  <SkipForward className="h-3 w-3" />
                </button>
              </div>

              <span className="text-[7px] font-mono text-muted-foreground/20">{visibleCount}/{totalCandles}</span>
            </div>
          </div>

          {/* ── Bottom Stats Strip ── */}
          <div className="shrink-0 grid grid-cols-4 md:grid-cols-8 border-t border-border/8 bg-secondary/5">
            {[
              { label: "P&L", value: `${pnl >= 0 ? "+" : ""}${pnl}$`, color: pnl >= 0 ? "text-profit" : "text-loss", icon: DollarSign },
              { label: "Win Rate", value: `${winRate}%`, color: winRate >= 50 ? "text-profit" : "text-loss", icon: Target },
              { label: "Drawdown", value: `${dd}%`, color: "text-loss", icon: TrendingDown },
              { label: "Profit Factor", value: profitFactor, color: "text-foreground/70", icon: BarChart3 },
              { label: "Avg R:R", value: `1:${avgRR}`, color: "text-foreground/70", icon: Percent },
              { label: "Sharpe", value: sharpe, color: Number(sharpe) > 1 ? "text-profit" : "text-foreground/50", icon: Award },
              { label: "Wins", value: `${wins}`, color: "text-profit/70", icon: TrendingUp },
              { label: "Losses", value: `${losses}`, color: "text-loss/70", icon: AlertTriangle },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center py-1.5 px-1 border-l border-border/5 first:border-l-0">
                <span className="text-[6px] text-muted-foreground/25 uppercase tracking-wider font-semibold">{stat.label}</span>
                <span className={`text-[10px] font-mono font-bold ${stat.color} data-value`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Side Panel ── */}
        <div className={`${showPanel ? "flex" : "hidden"} md:flex flex-col w-full md:w-64 lg:w-72 shrink-0 border-r border-border/8 bg-[hsl(240,8%,4%)] overflow-hidden`}>
          
          {/* Panel tabs */}
          <div className="flex border-b border-border/8">
            {[
              { key: "strategies" as const, label: "אסטרטגיות", icon: Layers },
              { key: "results" as const, label: "תוצאות", icon: BarChart3 },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 text-[9px] font-bold border-b-2 transition-all haptic-press ${
                  activeTab === tab.key
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground/30 hover:text-muted-foreground/50"
                }`}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "strategies" ? (
            <>
              {/* Strategy list */}
              <div className="flex-1 overflow-y-auto py-1 scrollbar-none">
                {strategies.map(s => {
                  const active = activeStrategy.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setActiveStrategy(s); setVisibleCount(20); setIsPlaying(false); }}
                      className={`w-full text-right border-b border-border/5 px-3 py-2 transition-all duration-150 haptic-press ${
                        active
                          ? "bg-primary/5 border-r-2 border-r-primary"
                          : "bg-transparent hover:bg-muted/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                          active ? "bg-primary/10 border-primary/15 text-primary" : "bg-muted/5 border-border/8 text-muted-foreground/25"
                        }`}>
                          <s.icon className="h-3 w-3" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-[10px] font-bold ${active ? "text-primary" : "text-foreground/60"}`}>{s.name}</p>
                            <span className={`text-[7px] font-mono ${s.winHist >= 60 ? "text-profit/50" : "text-foreground/20"}`}>
                              {s.winHist}% WR
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <p className="text-[7px] text-muted-foreground/25 font-mono">{s.pair} · {s.tf}</p>
                            <p className="text-[7px] text-muted-foreground/20">{s.trades} עסקאות</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-[7px] text-muted-foreground/20 mt-1 pr-9 leading-relaxed">{s.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Quick start hint */}
              <div className="px-3 py-2 border-t border-border/5 bg-primary/[0.02]">
                <div className="flex items-center gap-1.5">
                  <Signal className="h-3 w-3 text-primary/30" />
                  <p className="text-[7px] text-muted-foreground/25">לחץ אסטרטגיה → Play להרצה</p>
                </div>
              </div>
            </>
          ) : (
            /* Results tab */
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none">
              {/* Equity curve mini */}
              <div className="rounded-sm border border-border/8 bg-muted/[0.03] p-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[8px] font-bold text-foreground/50">עקומת הון</span>
                  <span className={`text-[9px] font-mono font-bold ${pnl >= 0 ? "text-profit" : "text-loss"}`}>
                    {pnl >= 0 ? "+" : ""}{pnl}$
                  </span>
                </div>
                <div className="h-16 relative">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={pnl >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={pnl >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="50" x2="100" y2="50" stroke="hsl(220,8%,12%)" strokeWidth="0.3" strokeDasharray="2,2" />
                    {equity.length > 1 && (
                      <>
                        <path d={`${equityPath} L100,100 L0,100 Z`} fill="url(#eqGrad)" />
                        <path d={equityPath} fill="none" stroke={pnl >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"} strokeWidth="0.8" opacity="0.7" />
                      </>
                    )}
                  </svg>
                </div>
              </div>

              {/* Detailed stats */}
              <div className="space-y-1">
                {[
                  { label: "Win Rate", value: `${winRate}%`, icon: Target, accent: winRate >= 50 },
                  { label: "Profit Factor", value: profitFactor, icon: BarChart3, accent: Number(profitFactor) > 1 },
                  { label: "Sharpe Ratio", value: sharpe, icon: Award, accent: Number(sharpe) > 1 },
                  { label: "Max Drawdown", value: `${dd}%`, icon: TrendingDown, accent: false },
                  { label: "Avg R:R", value: `1:${avgRR}`, icon: Percent, accent: Number(avgRR) > 1 },
                  { label: "Total Trades", value: `${candles.length}`, icon: Activity, accent: false },
                  { label: "Wins / Losses", value: `${wins} / ${losses}`, icon: TrendingUp, accent: false },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-sm hover:bg-muted/5 transition-colors">
                    <div className="flex items-center gap-1.5">
                      <stat.icon className="h-2.5 w-2.5 text-muted-foreground/20" />
                      <span className="text-[8px] text-muted-foreground/40">{stat.label}</span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold ${stat.accent ? "text-profit" : "text-foreground/60"}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* AI Insight */}
              <div className="rounded-sm border border-primary/8 bg-primary/[0.03] p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles className="h-2.5 w-2.5 text-primary/40" />
                  <span className="text-[8px] font-bold text-primary/50">תובנת AI</span>
                </div>
                <p className="text-[7px] text-muted-foreground/35 leading-relaxed">
                  {winRate >= 55
                    ? `אסטרטגיית "${activeStrategy.name}" מציגה יתרון סטטיסטי. Profit Factor ${profitFactor} עם Sharpe ${sharpe}. מומלץ לבצע Forward Test.`
                    : `אסטרטגיית "${activeStrategy.name}" דורשת אופטימיזציה. Win Rate נמוך מ-55%. נסה לשפר Entry Timing או לצמצם Stop Loss.`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BacktestingPage;
