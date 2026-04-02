import { useState, useEffect, useRef, useCallback } from "react";
import { createChart, CandlestickSeries, type IChartApi, type ISeriesApi, type CandlestickData, type Time } from "lightweight-charts";
import {
  Play, Pause, SkipForward, Rewind,
  TrendingUp, Target, BarChart3, ArrowUpRight, ArrowDownRight,
  Zap, Timer,
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
    // skip weekends
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
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [visibleCount, setVisibleCount] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pnl, setPnl] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [tradeCount, setTradeCount] = useState(0);
  const [wins, setWins] = useState(0);

  const speeds = [1, 2, 5, 10];

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#0F0F13" },
        textColor: "rgba(255,255,255,0.4)",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      crosshair: {
        vertLine: { color: "rgba(0,212,170,0.3)", labelBackgroundColor: "#00D4AA" },
        horzLine: { color: "rgba(0,212,170,0.3)", labelBackgroundColor: "#00D4AA" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.06)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.06)",
        timeVisible: false,
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#00D4AA",
      downColor: "#FF3366",
      borderUpColor: "#00D4AA",
      borderDownColor: "#FF3366",
      wickUpColor: "rgba(0,212,170,0.6)",
      wickDownColor: "rgba(255,51,102,0.6)",
    });

    series.setData(allCandles.slice(0, 60));
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(chartContainerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, []);

  // Update chart when visibleCount changes
  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.setData(allCandles.slice(0, visibleCount));
    }
  }, [visibleCount]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= allCandles.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const handleTrade = useCallback((direction: "long" | "short") => {
    const currentCandle = allCandles[visibleCount - 1];
    if (!currentCandle) return;

    const result = (Math.random() - 0.45) * 200;
    const isWin = result > 0;
    const roundedResult = Math.round(result * 100) / 100;

    setPnl((prev) => Math.round((prev + roundedResult) * 100) / 100);
    setTradeCount((prev) => prev + 1);
    if (isWin) setWins((prev) => prev + 1);
    setWinRate(() => Math.round(((wins + (isWin ? 1 : 0)) / (tradeCount + 1)) * 100));

    toast(isWin ? "✅ עסקה מוצלחת!" : "❌ עסקה הפסדית", {
      description: `${direction === "long" ? "Long" : "Short"} @ ${currentCandle.close.toFixed(2)} · ${isWin ? "+" : ""}$${roundedResult.toFixed(2)}`,
    });
  }, [visibleCount, wins, tradeCount]);

  const handleStep = () => {
    setVisibleCount((prev) => Math.min(prev + 1, allCandles.length));
  };

  const handleRewind = () => {
    setVisibleCount((prev) => Math.max(prev - 10, 10));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#0F0F13" }}>

      {/* ── Top Stats Bar ── */}
      <div className="shrink-0 flex items-center gap-3 px-3 py-2.5 border-b border-border/10">
        <div className="flex items-center gap-2 mr-auto">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/15">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">סימולטור בקטסט</p>
            <p className="text-2xs text-muted-foreground/40 font-mono">NAS100 · Daily</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-border/20 bg-card/40 backdrop-blur-md px-3 py-1.5 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/50" />
            <div className="text-right">
              <p className="text-2xs text-muted-foreground/40">רווח/הפסד</p>
              <p className={cn("text-sm font-bold font-mono", pnl >= 0 ? "text-primary" : "text-destructive")}>
                {pnl >= 0 ? "+" : ""}{"$"}{pnl.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/20 bg-card/40 backdrop-blur-md px-3 py-1.5 flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-muted-foreground/50" />
            <div className="text-right">
              <p className="text-2xs text-muted-foreground/40">אחוז הצלחה</p>
              <p className="text-sm font-bold font-mono text-foreground">{winRate}%</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/20 bg-card/40 backdrop-blur-md px-3 py-1.5 flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/50" />
            <div className="text-right">
              <p className="text-2xs text-muted-foreground/40">עסקאות</p>
              <p className="text-sm font-bold font-mono text-foreground">{tradeCount}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/20 bg-card/40 backdrop-blur-md px-3 py-1.5 flex items-center gap-2">
            <Timer className="h-3.5 w-3.5 text-muted-foreground/50" />
            <div className="text-right">
              <p className="text-2xs text-muted-foreground/40">נר</p>
              <p className="text-sm font-bold font-mono text-muted-foreground/70">{visibleCount}/{allCandles.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="flex-1 min-h-0 relative">
        <div ref={chartContainerRef} className="absolute inset-0" />
      </div>

      {/* ── Bottom Control Panel ── */}
      <div className="shrink-0 border-t border-border/10 px-4 py-3 flex items-center justify-between gap-4">

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRewind}
            className="haptic-press flex h-9 w-9 items-center justify-center rounded-lg border border-border/20 bg-card/40 text-muted-foreground/60 hover:text-foreground hover:border-border/40 transition-all"
          >
            <Rewind className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              "haptic-press flex h-11 w-11 items-center justify-center rounded-xl border transition-all",
              isPlaying
                ? "border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
                : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 mr-[-2px]" />}
          </button>

          <button
            onClick={handleStep}
            className="haptic-press flex h-9 w-9 items-center justify-center rounded-lg border border-border/20 bg-card/40 text-muted-foreground/60 hover:text-foreground hover:border-border/40 transition-all"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          {/* Speed selector */}
          <div className="flex items-center gap-1 mr-2 rounded-lg border border-border/15 bg-card/30 p-0.5">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={cn(
                  "haptic-press rounded-md px-2.5 py-1 text-2xs font-bold font-mono transition-all",
                  speed === s
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-muted-foreground/40 hover:text-foreground border border-transparent"
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Execution Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTrade("long")}
            className="haptic-press flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-6 py-2.5 text-primary hover:bg-primary/20 hover:border-primary/40 transition-all active:scale-95 group"
          >
            <ArrowUpRight className="h-4 w-4 group-hover:translate-y-[-1px] transition-transform" />
            <div className="text-right">
              <span className="text-xs font-bold block">BUY</span>
              <span className="text-2xs font-mono opacity-60">Long</span>
            </div>
          </button>

          <button
            onClick={() => handleTrade("short")}
            className="haptic-press flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-6 py-2.5 text-destructive hover:bg-destructive/20 hover:border-destructive/40 transition-all active:scale-95 group"
          >
            <ArrowDownRight className="h-4 w-4 group-hover:translate-y-[1px] transition-transform" />
            <div className="text-right">
              <span className="text-xs font-bold block">SELL</span>
              <span className="text-2xs font-mono opacity-60">Short</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BacktestingPage;
