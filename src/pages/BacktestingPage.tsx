import { useState, useEffect, useRef, useCallback } from "react";
import { createChart, CandlestickSeries, type IChartApi, type CandlestickData, type Time } from "lightweight-charts";
import {
  Play, Pause, SkipForward, Rewind, FastForward,
  TrendingUp, Target, BarChart3, ArrowUpRight, ArrowDownRight,
  Zap, Timer, Activity, Crosshair, Clock, Brain,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ── Generate realistic NAS100 OHLC data ── */
const generateOHLC = (count: number): CandlestickData[] => {
  const data: CandlestickData[] = [];
  let price = 18200;
  const baseDate = new Date("2026-01-05");

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    if (date.getDay() === 0 || date.getDay() === 6) {
      price += (Math.random() - 0.48) * 30;
      continue;
    }

    const volatility = 40 + Math.random() * 80;
    const trend = Math.sin(i * 0.04) * 15 + (Math.random() - 0.47) * 20;
    const open = price;
    const close = open + trend;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;

    const timeStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    data.push({
      time: timeStr as Time,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    });

    price = close;
  }
  return data;
};

const allCandles = generateOHLC(200);

/* ── Component ── */
const BacktestingPage = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);

  const [visibleCount, setVisibleCount] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pnl, setPnl] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [tradeCount, setTradeCount] = useState(0);
  const [wins, setWins] = useState(0);
  const [lastTrade, setLastTrade] = useState<{ dir: string; result: number } | null>(null);

  const speeds = [1, 2, 5, 10];
  const currentCandle = allCandles[visibleCount - 1];
  const prevCandle = allCandles[visibleCount - 2];
  const priceChange = currentCandle && prevCandle ? currentCandle.close - prevCandle.close : 0;

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "rgba(255,255,255,0.35)",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.02)" },
        horzLines: { color: "rgba(255,255,255,0.02)" },
      },
      crosshair: {
        vertLine: { color: "rgba(0,212,170,0.25)", labelBackgroundColor: "#00D4AA" },
        horzLine: { color: "rgba(0,212,170,0.25)", labelBackgroundColor: "#00D4AA" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.04)",
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.04)",
        timeVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#00D4AA",
      downColor: "#FF3366",
      borderUpColor: "#00D4AA",
      borderDownColor: "#FF3366",
      wickUpColor: "rgba(0,212,170,0.5)",
      wickDownColor: "rgba(255,51,102,0.5)",
    });

    series.setData(allCandles.slice(0, 60));
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    });
    ro.observe(chartContainerRef.current);

    return () => { ro.disconnect(); chart.remove(); };
  }, []);

  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.setData(allCandles.slice(0, visibleCount));
    }
  }, [visibleCount]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= allCandles.length) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, 800 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const handleTrade = useCallback((direction: "long" | "short") => {
    const candle = allCandles[visibleCount - 1];
    if (!candle) return;

    const result = (Math.random() - 0.45) * 200;
    const isWin = result > 0;
    const rounded = Math.round(result * 100) / 100;

    setPnl((prev) => Math.round((prev + rounded) * 100) / 100);
    setTradeCount((prev) => prev + 1);
    if (isWin) setWins((prev) => prev + 1);
    setWinRate(() => Math.round(((wins + (isWin ? 1 : 0)) / (tradeCount + 1)) * 100));
    setLastTrade({ dir: direction === "long" ? "Long" : "Short", result: rounded });

    toast(isWin ? "✅ עסקה מוצלחת!" : "❌ עסקה הפסדית", {
      description: `${direction === "long" ? "Long" : "Short"} @ ${candle.close.toFixed(2)} · ${isWin ? "+" : ""}$${rounded.toFixed(2)}`,
    });
  }, [visibleCount, wins, tradeCount]);

  const handleStep = () => setVisibleCount((prev) => Math.min(prev + 1, allCandles.length));
  const handleRewind = () => setVisibleCount((prev) => Math.max(prev - 10, 10));

  const progress = (visibleCount / allCandles.length) * 100;

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-2xl md:rounded-none" style={{ background: "#0A0A0F" }}>

      {/* ── Top Header ── */}
      <div className="shrink-0 px-3 py-2 md:px-4 md:py-2.5 border-b border-white/[0.06]">
        {/* Row 1: Title + Live Price */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
              <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] md:text-[13px] font-bold text-foreground">סימולטור בקטסט</p>
              <p className="text-[8px] md:text-2xs text-muted-foreground/30 font-mono">NAS100 · Daily</p>
            </div>
          </div>

          {/* Live Price Ticker */}
          {currentCandle && (
            <div className="flex items-center gap-2">
              <div className="text-left">
                <p className="text-[13px] md:text-[16px] font-black font-mono text-foreground">
                  {currentCandle.close.toFixed(2)}
                </p>
                <p className={cn("text-[8px] md:text-2xs font-bold font-mono", priceChange >= 0 ? "text-profit" : "text-loss")}>
                  {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)} ({((priceChange / (prevCandle?.close || 1)) * 100).toFixed(2)}%)
                </p>
              </div>
              <div className={cn("flex h-6 w-6 items-center justify-center rounded-lg", priceChange >= 0 ? "bg-profit/10" : "bg-loss/10")}>
                {priceChange >= 0
                  ? <ArrowUpRight className="h-3 w-3 text-profit" />
                  : <ArrowDownRight className="h-3 w-3 text-loss" />
                }
              </div>
            </div>
          )}
        </div>

        {/* Row 2: KPI Cards - scrollable on mobile */}
        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {[
            { label: "P&L", value: `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(0)}`, color: pnl >= 0 ? "text-profit" : "text-loss", icon: <TrendingUp className="h-3 w-3" /> },
            { label: "Win Rate", value: `${winRate}%`, color: "text-foreground", icon: <Target className="h-3 w-3" /> },
            { label: "עסקאות", value: `${tradeCount}`, color: "text-foreground", icon: <BarChart3 className="h-3 w-3" /> },
            { label: "נר", value: `${visibleCount}/${allCandles.length}`, color: "text-muted-foreground/60", icon: <Timer className="h-3 w-3" /> },
          ].map((kpi) => (
            <div key={kpi.label} className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 md:px-2.5 md:py-1.5 shrink-0">
              <span className="text-muted-foreground/30">{kpi.icon}</span>
              <div>
                <p className="text-[7px] md:text-[8px] text-muted-foreground/35 leading-none">{kpi.label}</p>
                <p className={cn("text-[10px] md:text-[11px] font-bold font-mono leading-tight", kpi.color)}>{kpi.value}</p>
              </div>
            </div>
          ))}

          {/* Last trade indicator */}
          {lastTrade && (
            <div className={cn(
              "flex items-center gap-1 rounded-lg border px-2 py-1.5 shrink-0 animate-in fade-in slide-in-from-right-2 duration-300",
              lastTrade.result >= 0 ? "border-profit/15 bg-profit/[0.04]" : "border-loss/15 bg-loss/[0.04]"
            )}>
              <Crosshair className={cn("h-3 w-3", lastTrade.result >= 0 ? "text-profit/60" : "text-loss/60")} />
              <div>
                <p className="text-[7px] text-muted-foreground/30">{lastTrade.dir}</p>
                <p className={cn("text-[10px] font-bold font-mono", lastTrade.result >= 0 ? "text-profit" : "text-loss")}>
                  {lastTrade.result >= 0 ? "+" : ""}${lastTrade.result.toFixed(0)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-1 rounded-full bg-white/[0.04] overflow-hidden">
          <div
            className="h-full rounded-full bg-primary/50 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="flex-1 min-h-0 relative">
        <div ref={chartContainerRef} className="absolute inset-0" />

        {/* Floating speed badge */}
        {isPlaying && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/15 px-2 py-1 animate-in fade-in duration-200">
            <Activity className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[9px] font-bold font-mono text-primary">{speed}x</span>
          </div>
        )}
      </div>

      {/* ── Bottom Controls ── */}
      <div className="shrink-0 border-t border-white/[0.06] px-3 py-2 md:px-4 md:py-3">
        {/* Mobile: stacked layout / Desktop: side by side */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">

          {/* Playback row */}
          <div className="flex items-center justify-center md:justify-start gap-1.5 md:gap-2">
            <button
              onClick={handleRewind}
              className="haptic-press flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-muted-foreground/50 hover:text-foreground hover:border-white/[0.12] transition-all active:scale-90"
            >
              <Rewind className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                "haptic-press flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl border transition-all active:scale-90",
                isPlaying
                  ? "border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 shadow-[0_0_15px_hsl(var(--accent)/0.15)]"
                  : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 shadow-[0_0_15px_hsl(var(--primary)/0.15)]"
              )}
            >
              {isPlaying ? <Pause className="h-4 w-4 md:h-5 md:w-5" /> : <Play className="h-4 w-4 md:h-5 md:w-5 mr-[-1px]" />}
            </button>

            <button
              onClick={handleStep}
              className="haptic-press flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-muted-foreground/50 hover:text-foreground hover:border-white/[0.12] transition-all active:scale-90"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>

            {/* Speed pills */}
            <div className="flex items-center gap-0.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-0.5 mr-1">
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={cn(
                    "haptic-press rounded-lg px-2 py-1 text-[9px] md:text-2xs font-bold font-mono transition-all",
                    speed === s
                      ? "bg-primary/15 text-primary border border-primary/20"
                      : "text-muted-foreground/30 hover:text-foreground/60 border border-transparent"
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Trade buttons row */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => handleTrade("long")}
              className="haptic-press flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl border border-profit/20 bg-profit/[0.06] px-4 md:px-6 py-2.5 text-profit hover:bg-profit/15 hover:border-profit/30 hover:shadow-[0_0_20px_hsl(var(--profit)/0.1)] transition-all active:scale-95"
            >
              <ArrowUpRight className="h-4 w-4" />
              <div className="text-right">
                <span className="text-[11px] md:text-xs font-bold block">BUY</span>
                <span className="text-[8px] md:text-2xs font-mono opacity-50">Long</span>
              </div>
            </button>

            <button
              onClick={() => handleTrade("short")}
              className="haptic-press flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl border border-loss/20 bg-loss/[0.06] px-4 md:px-6 py-2.5 text-loss hover:bg-loss/15 hover:border-loss/30 hover:shadow-[0_0_20px_hsl(var(--loss)/0.1)] transition-all active:scale-95"
            >
              <ArrowDownRight className="h-4 w-4" />
              <div className="text-right">
                <span className="text-[11px] md:text-xs font-bold block">SELL</span>
                <span className="text-[8px] md:text-2xs font-mono opacity-50">Short</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacktestingPage;
