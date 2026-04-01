import { useState, useMemo, useEffect, useRef } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Rewind, FastForward,
  Sparkles, TrendingUp, Target, BarChart3, ChevronDown,
  Sunrise, Magnet, Zap, Waves, ArrowDownUp, Crosshair,
  Clock, DollarSign, AlertTriangle,
} from "lucide-react";

/* ===== Helpers ===== */
const sr = (seed: number) => { const x = Math.sin(seed) * 10000; return x - Math.floor(x); };

/* ===== Strategies ===== */
const strategies = [
  { id: 1, name: "פריצת בוקר", icon: Sunrise, pair: "NAS100", tf: "M5", desc: "פריצה מעל High של Pre-Market" },
  { id: 2, name: "חזרת ממוצעים", icon: Magnet, pair: "EUR/USD", tf: "M15", desc: "Mean Reversion מ-Bollinger Bands" },
  { id: 3, name: "מומנטום ברייקאוט", icon: Zap, pair: "BTC/USD", tf: "H1", desc: "פריצת התנגדות עם ווליום" },
  { id: 4, name: "Range Scalp", icon: Waves, pair: "GBP/USD", tf: "M1", desc: "סקאלפינג בתוך טווח אסיאתי" },
  { id: 5, name: "Reversal", icon: ArrowDownUp, pair: "XAU/USD", tf: "H4", desc: "היפוך מגמה באזורי ביקוש" },
  { id: 6, name: "Sniper Entry", icon: Crosshair, pair: "EUR/JPY", tf: "M5", desc: "כניסה מדויקת מ-Order Block" },
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
  const [showPanel, setShowPanel] = useState(true);
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

  // Stats based on visible candles
  const wins = candles.filter((c) => c.c >= c.o).length;
  const winRate = Math.round((wins / candles.length) * 100);
  const pnl = Math.round(candles.reduce((s, c) => s + (c.c - c.o), 0) * 10);
  const dd = Math.round(Math.abs(Math.min(...candles.map((c, i) =>
    candles.slice(0, i + 1).reduce((s, cc) => s + (cc.c - cc.o), 0)
  ))) * 10 * -1) / 10;

  // Chart rendering helpers
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

  // Volume max
  const maxVol = Math.max(...candles.map(c => c.v));

  // Date labels
  const startDate = "01/01/2026";
  const currentDate = `${String(Math.min(visibleCount, 28)).padStart(2, "0")}/01/2026`;

  return (
    <div className="mx-auto max-w-[1400px] h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] flex flex-col -mt-1 md:-mt-4">
      {/* ── Header ── */}
      <div className="shrink-0 px-1 pt-1 pb-3 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <h1 className="font-heading text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
              סימולטור בקטסטינג
            </h1>
          </div>
          <p className="text-[11px] text-muted-foreground/40 font-medium">מכונת הזמן שלך — בדוק אסטרטגיות על נתונים היסטוריים</p>
        </div>
        {/* Mobile panel toggle */}
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="md:hidden flex items-center gap-1.5 rounded-xl bg-secondary/30 border border-border/20 px-3 py-2 text-[10px] font-bold text-foreground/60"
        >
          אסטרטגיות
          <ChevronDown className={`h-3 w-3 transition-transform ${showPanel ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 px-1">

        {/* ── Chart Area ── */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* AI scanning badge */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-lg bg-primary/8 border border-primary/12 px-2.5 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-primary/60 animate-pulse" />
            <span className="text-[8px] md:text-[9px] text-primary/60 font-semibold">ה-AI סורק את ההיסטוריה לחפש את הסטאפ שלך...</span>
          </div>

          {/* Strategy info */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
            <span className="rounded-md bg-[hsl(0,0%,5%)]/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-foreground/70 border border-[hsl(0,0%,12%)]">
              {activeStrategy.pair}
            </span>
            <span className="rounded-md bg-[hsl(0,0%,5%)]/80 backdrop-blur-md px-1.5 py-0.5 text-[8px] font-bold text-muted-foreground/40 border border-[hsl(0,0%,12%)]">
              {activeStrategy.tf}
            </span>
          </div>

          {/* Chart */}
          <div className="flex-1 rounded-2xl border border-border/15 bg-[hsl(0,0%,2%)] overflow-hidden relative min-h-[250px]">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              {/* Grid */}
              {[20, 35, 50, 65, 80].map(y => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(0,0%,8%)" strokeWidth="0.12" strokeDasharray="1,1.5" />
              ))}
              {Array.from({ length: 8 }, (_, i) => 12 + i * 11).map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="hsl(0,0%,8%)" strokeWidth="0.12" strokeDasharray="1,1.5" />
              ))}

              {/* EMA */}
              {candles.length > 1 && <path d={emaPath} fill="none" stroke="hsl(45,100%,60%)" strokeWidth="0.3" opacity="0.3" />}

              {/* Volume bars (bottom) */}
              {candles.map((c, i) => {
                const x = 2 + i * cw;
                const isUp = c.c >= c.o;
                return (
                  <rect
                    key={`v${i}`}
                    x={x + cw * 0.1}
                    y={95 - (c.v / maxVol) * 8}
                    width={cw * 0.8}
                    height={(c.v / maxVol) * 8}
                    fill={isUp ? "hsl(160,60%,45%)" : "hsl(0,72%,51%)"}
                    opacity={0.15}
                    rx="0.05"
                  />
                );
              })}

              {/* Candles */}
              {candles.map((c, i) => {
                const x = 2 + i * cw;
                const cx = x + cw * 0.5;
                const isUp = c.c >= c.o;
                const color = isUp ? "hsl(160,60%,45%)" : "hsl(0,72%,51%)";
                const bt = toY(Math.max(c.o, c.c));
                const bh = Math.max(0.35, Math.abs(toY(c.o) - toY(c.c)));
                return (
                  <g key={i}>
                    <line x1={cx} y1={toY(c.h)} x2={cx} y2={toY(c.l)} stroke={color} strokeWidth="0.15" opacity="0.65" />
                    <rect x={x + cw * 0.12} y={bt} width={cw * 0.76} height={bh} fill={color} opacity={0.85} rx="0.08" />
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
                    stroke="hsl(217,72%,53%)"
                    strokeWidth="0.15"
                    strokeDasharray="0.6,0.4"
                    opacity="0.5"
                  />
                  <rect
                    x="93"
                    y={toY(candles[candles.length - 1].c) - 1.5}
                    width="7"
                    height="3"
                    fill="hsl(217,72%,53%)"
                    opacity="0.7"
                    rx="0.3"
                  />
                  <text
                    x="96.5"
                    y={toY(candles[candles.length - 1].c) + 0.5}
                    fill="white"
                    fontSize="1.8"
                    textAnchor="middle"
                    opacity="0.9"
                  >
                    {candles[candles.length - 1].c.toFixed(1)}
                  </text>
                </>
              )}
            </svg>

            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[hsl(0,0%,2%)] to-transparent pointer-events-none" />

            {/* Price scale */}
            <div className="absolute top-3 bottom-12 right-1.5 w-7 flex flex-col justify-between items-end pointer-events-none">
              {[maxP, maxP - range * 0.25, maxP - range * 0.5, maxP - range * 0.75, minP].map((p, i) => (
                <span key={i} className="text-[6px] text-muted-foreground/20 font-mono">{p.toFixed(1)}</span>
              ))}
            </div>
          </div>

          {/* ── Playback Controls ── */}
          <div className="shrink-0 mt-3 mb-1">
            {/* Progress bar */}
            <div className="relative h-1 rounded-full bg-muted/15 mb-3 mx-1 overflow-hidden cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = ((e.clientX - rect.left) / rect.width);
                setVisibleCount(Math.max(5, Math.round(pct * totalCandles)));
              }}
            >
              <div className="absolute inset-y-0 left-0 rounded-full bg-primary/50 transition-all duration-300" style={{ width: `${progress}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-primary border-2 border-primary/30 shadow-[0_0_10px_hsl(var(--primary)/0.3)] transition-all duration-300" style={{ left: `${progress}%`, marginLeft: "-6px" }} />
            </div>

            {/* Date labels */}
            <div className="flex items-center justify-between text-[8px] text-muted-foreground/25 font-mono px-1 mb-3">
              <span>{startDate}</span>
              <span className="text-primary/50 font-semibold">{currentDate}</span>
              <span>28/01/2026</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 md:gap-3">
              {/* Step back */}
              <button
                onClick={stepBack}
                disabled={visibleCount <= 5}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/10 border border-border/15 text-muted-foreground/40 hover:text-foreground hover:bg-muted/20 transition-all disabled:opacity-20"
              >
                <SkipBack className="h-3.5 w-3.5" />
              </button>

              {/* Rewind */}
              <button
                onClick={() => setVisibleCount(prev => Math.max(5, prev - 5))}
                disabled={visibleCount <= 5}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/10 border border-border/15 text-muted-foreground/40 hover:text-foreground hover:bg-muted/20 transition-all disabled:opacity-20"
              >
                <Rewind className="h-3.5 w-3.5" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-300 ${
                  isPlaying
                    ? "bg-primary/20 border-primary/30 text-primary shadow-[0_0_25px_hsl(var(--primary)/0.2)]"
                    : "bg-primary/12 border-primary/20 text-primary hover:bg-primary/20 hover:shadow-[0_0_25px_hsl(var(--primary)/0.15)]"
                }`}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 mr-[-2px]" />}
              </button>

              {/* Fast forward */}
              <button
                onClick={() => setVisibleCount(prev => Math.min(totalCandles, prev + 5))}
                disabled={visibleCount >= totalCandles}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/10 border border-border/15 text-muted-foreground/40 hover:text-foreground hover:bg-muted/20 transition-all disabled:opacity-20"
              >
                <FastForward className="h-3.5 w-3.5" />
              </button>

              {/* Step forward */}
              <button
                onClick={stepForward}
                disabled={visibleCount >= totalCandles}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/10 border border-border/15 text-muted-foreground/40 hover:text-foreground hover:bg-muted/20 transition-all disabled:opacity-20"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </button>

              {/* Speed */}
              <div className="flex items-center gap-0.5 mr-2">
                {[1, 5, 10].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`rounded-lg px-2 py-1 text-[8px] font-bold border transition-all ${
                      speed === s
                        ? "bg-primary/15 text-primary border-primary/20"
                        : "bg-muted/8 text-muted-foreground/30 border-border/10 hover:text-muted-foreground/50"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Side Panel ── */}
        <div className={`${showPanel ? "flex" : "hidden"} md:flex flex-col w-full md:w-72 shrink-0 rounded-2xl border border-border/15 bg-secondary/15 backdrop-blur-sm overflow-hidden`}>
          {/* Panel header */}
          <div className="px-4 py-3.5 border-b border-border/10">
            <h2 className="text-[12px] font-bold text-foreground/80 mb-0.5">בחר אסטרטגיה למבחן</h2>
            <p className="text-[9px] text-muted-foreground/35 font-medium">לחץ על אסטרטגיה להרצה על נתונים היסטוריים</p>
          </div>

          {/* Strategy list */}
          <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-1.5 scrollbar-none">
            {strategies.map(s => {
              const active = activeStrategy.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => { setActiveStrategy(s); setVisibleCount(20); setIsPlaying(false); }}
                  className={`w-full text-right rounded-xl border p-3 transition-all duration-300 ${
                    active
                      ? "border-primary/20 bg-primary/8"
                      : "border-border/10 bg-transparent hover:bg-muted/10 hover:border-border/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                      active ? "bg-primary/12 border-primary/15 text-primary" : "bg-muted/10 border-border/10 text-muted-foreground/30"
                    }`}>
                      <s.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[11px] font-bold truncate ${active ? "text-primary" : "text-foreground/70"}`}>{s.name}</p>
                      <p className="text-[8px] text-muted-foreground/30 mt-0.5">{s.pair} · {s.tf}</p>
                    </div>
                    {active && (
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                      </span>
                    )}
                  </div>
                  <p className="text-[8px] text-muted-foreground/25 mt-1.5 pr-[42px] leading-relaxed">{s.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Live stats */}
          <div className="border-t border-border/10 px-4 py-3.5">
            <p className="text-[9px] font-bold text-foreground/50 mb-2.5 flex items-center gap-1.5">
              <BarChart3 className="h-3 w-3 text-primary/40" />
              תוצאות סימולציה
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-border/10 bg-muted/[0.04] p-2 text-center">
                <div className="flex items-center justify-center gap-0.5 mb-1">
                  <DollarSign className="h-2.5 w-2.5 text-accent/50" />
                </div>
                <p className={`text-[12px] font-extrabold ${pnl >= 0 ? "text-accent" : "text-destructive"}`}>
                  {pnl >= 0 ? "+" : ""}{pnl}$
                </p>
                <p className="text-[7px] text-muted-foreground/25 mt-0.5">רווח</p>
              </div>
              <div className="rounded-xl border border-border/10 bg-muted/[0.04] p-2 text-center">
                <div className="flex items-center justify-center gap-0.5 mb-1">
                  <Target className="h-2.5 w-2.5 text-primary/50" />
                </div>
                <p className="text-[12px] font-extrabold text-foreground/80">{winRate}%</p>
                <p className="text-[7px] text-muted-foreground/25 mt-0.5">Win Rate</p>
              </div>
              <div className="rounded-xl border border-border/10 bg-muted/[0.04] p-2 text-center">
                <div className="flex items-center justify-center gap-0.5 mb-1">
                  <AlertTriangle className="h-2.5 w-2.5 text-destructive/50" />
                </div>
                <p className="text-[12px] font-extrabold text-destructive/80">{dd}%</p>
                <p className="text-[7px] text-muted-foreground/25 mt-0.5">Drawdown</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[8px] text-muted-foreground/20">
              <span>{visibleCount} / {totalCandles} נרות</span>
              <span>·</span>
              <span>מהירות: {speed}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacktestingPage;
