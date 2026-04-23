import { useEffect, useRef, useState } from "react";
import { LineChart, Search, Maximize2 } from "lucide-react";

const POPULAR_SYMBOLS = [
  { symbol: "NASDAQ:NQ1!", label: "NQ Futures" },
  { symbol: "CME_MINI:ES1!", label: "ES Futures" },
  { symbol: "BINANCE:BTCUSDT", label: "BTC/USD" },
  { symbol: "BINANCE:ETHUSDT", label: "ETH/USD" },
  { symbol: "FX:EURUSD", label: "EUR/USD" },
  { symbol: "FX:GBPUSD", label: "GBP/USD" },
  { symbol: "FX:USDJPY", label: "USD/JPY" },
  { symbol: "NASDAQ:AAPL", label: "AAPL" },
  { symbol: "NASDAQ:TSLA", label: "TSLA" },
  { symbol: "NYSE:SPY", label: "SPY" },
];

const TradingViewChartPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [symbol, setSymbol] = useState("NASDAQ:NQ1!");
  const [searchInput, setSearchInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "15",
      timezone: "Asia/Jerusalem",
      theme: "dark",
      style: "1",
      locale: "he_IL",
      backgroundColor: "rgba(13, 13, 18, 1)",
      gridColor: "rgba(255, 255, 255, 0.03)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: true,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container";
    wrapper.style.height = "100%";
    wrapper.style.width = "100%";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";

    wrapper.appendChild(widgetDiv);
    wrapper.appendChild(script);
    containerRef.current.appendChild(wrapper);
  }, [symbol]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSymbol(searchInput.trim().toUpperCase());
      setSearchInput("");
    }
  };

  return (
    <div className={`flex flex-col gap-3 p-2 md:p-4 ${isFullscreen ? "fixed inset-0 z-50 bg-[#0d0d12] p-0" : "h-full"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between shrink-0 ${isFullscreen ? "px-4 pt-3" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <LineChart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-foreground">גרף מסחר</h1>
            <p className="text-2xs text-muted-foreground/50">TradingView Advanced Chart</p>
          </div>
        </div>
        <button
          onClick={() => setIsFullscreen(f => !f)}
          className="haptic-press flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card/50 text-muted-foreground hover:text-primary hover:border-primary/20 transition-all"
          title="מסך מלא"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Symbol bar */}
      <div className={`flex items-center gap-2 shrink-0 flex-wrap ${isFullscreen ? "px-4" : ""}`}>
        {POPULAR_SYMBOLS.map(s => (
          <button
            key={s.symbol}
            onClick={() => setSymbol(s.symbol)}
            className={`haptic-press rounded-lg border px-3 py-1.5 text-[11px] font-mono font-semibold transition-all ${
              symbol === s.symbol
                ? "border-primary/30 bg-primary/12 text-primary"
                : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 hover:bg-white/[0.04] hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}

        {/* Custom symbol search */}
        <form onSubmit={handleSearch} className="flex items-center gap-1.5 mr-auto">
          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/30" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="חפש סימבול..."
              className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] pr-7 pl-3 text-[11px] text-foreground placeholder:text-muted-foreground/25 outline-none focus:border-primary/30 transition-all w-36"
            />
          </div>
          <button
            type="submit"
            className="haptic-press h-8 rounded-lg border border-primary/20 bg-primary/8 px-3 text-[11px] font-semibold text-primary hover:bg-primary/15 transition-all"
          >
            עבור
          </button>
        </form>
      </div>

      {/* Chart */}
      <div
        className={`rounded-2xl border border-border/30 bg-card/30 overflow-hidden flex-1 ${isFullscreen ? "mx-4 mb-4" : ""}`}
        style={{ minHeight: isFullscreen ? "calc(100vh - 140px)" : "calc(100vh - 220px)" }}
      >
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
};

export default TradingViewChartPage;
