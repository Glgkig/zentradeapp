import { useEffect, useRef, useState } from "react";
import { BarChart2, Search, ChevronDown, Info } from "lucide-react";

const SYMBOLS = [
  { group: "פיוצ'רס", items: [
    { symbol: "CME_MINI:NQ1!", label: "NQ (Nasdaq Futures)" },
    { symbol: "CME_MINI:ES1!", label: "ES (S&P Futures)" },
    { symbol: "CBOT_MINI:YM1!", label: "YM (Dow Futures)" },
    { symbol: "CME:RTY1!", label: "RTY (Russell Futures)" },
    { symbol: "NYMEX:CL1!", label: "CL (Crude Oil)" },
    { symbol: "COMEX:GC1!", label: "GC (Gold)" },
  ]},
  { group: "מניות", items: [
    { symbol: "NASDAQ:AAPL", label: "AAPL" },
    { symbol: "NASDAQ:TSLA", label: "TSLA" },
    { symbol: "NASDAQ:NVDA", label: "NVDA" },
    { symbol: "NASDAQ:MSFT", label: "MSFT" },
    { symbol: "NYSE:SPY", label: "SPY" },
    { symbol: "NASDAQ:QQQ", label: "QQQ" },
  ]},
  { group: "פורקס", items: [
    { symbol: "FX:EURUSD", label: "EUR/USD" },
    { symbol: "FX:GBPUSD", label: "GBP/USD" },
    { symbol: "FX:USDJPY", label: "USD/JPY" },
    { symbol: "FX:XAUUSD", label: "XAU/USD (Gold)" },
    { symbol: "FX:GBPJPY", label: "GBP/JPY" },
    { symbol: "FX:AUDUSD", label: "AUD/USD" },
  ]},
  { group: "קריפטו", items: [
    { symbol: "BINANCE:BTCUSDT", label: "BTC/USD" },
    { symbol: "BINANCE:ETHUSDT", label: "ETH/USD" },
    { symbol: "BINANCE:SOLUSDT", label: "SOL/USD" },
  ]},
];

const TIMEFRAMES = [
  { value: "1",    label: "1 דקה" },
  { value: "3",    label: "3 דקות" },
  { value: "5",    label: "5 דקות" },
  { value: "15",   label: "15 דקות" },
  { value: "30",   label: "30 דקות" },
  { value: "60",   label: "שעה" },
  { value: "240",  label: "4 שעות" },
  { value: "D",    label: "יומי" },
  { value: "W",    label: "שבועי" },
];

const BacktestingPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [symbol, setSymbol] = useState("CME_MINI:NQ1!");
  const [timeframe, setTimeframe] = useState("60");
  const [searchInput, setSearchInput] = useState("");
  const [showSymbolPanel, setShowSymbolPanel] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

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
      interval: timeframe,
      timezone: "Asia/Jerusalem",
      theme: "dark",
      style: "1",
      locale: "he_IL",
      backgroundColor: "rgba(10, 10, 15, 1)",
      gridColor: "rgba(255, 255, 255, 0.02)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: true,
      withdateranges: true,
      range: "ALL",
      studies: [
        "STD;EMA",
        "STD;Volume",
        "STD;RSI",
      ],
      show_popup_button: true,
      popup_width: "1000",
      popup_height: "650",
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
  }, [symbol, timeframe]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSymbol(searchInput.trim().toUpperCase());
      setSearchInput("");
      setShowSymbolPanel(false);
    }
  };

  const activeSymbolLabel =
    SYMBOLS.flatMap(g => g.items).find(s => s.symbol === symbol)?.label || symbol;

  return (
    <div className="flex flex-col h-full gap-3 p-2 md:p-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
            <BarChart2 className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-foreground">בקטסט</h1>
            <p className="text-2xs text-muted-foreground/50">נתונים אמיתיים · עשרות שנים אחורה · Bar Replay מובנה</p>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(v => !v)}
          className="haptic-press flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card/50 text-muted-foreground hover:text-accent hover:border-accent/20 transition-all"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── How to use Bar Replay ── */}
      {showInfo && (
        <div className="shrink-0 rounded-xl border border-accent/20 bg-accent/[0.04] px-4 py-3 flex items-start gap-3">
          <span className="text-lg shrink-0">🎯</span>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-accent">איך עושים בקטסט אמיתי?</p>
            <p className="text-2xs text-muted-foreground/60 leading-relaxed">
              בגרף למטה — לחץ על אייקון <strong className="text-foreground/70">⏪ Bar Replay</strong> בסרגל הכלים העליון (או Shift+R).
              בחר תאריך בגרף כדי "לחזור בזמן". לאחר מכן לחץ Play ▶ כדי לראות את השוק מתפתח נר-נר.
              ניתן לעצור בכל רגע, לסמן על הגרף ולרשום בייומן.
            </p>
          </div>
          <button onClick={() => setShowInfo(false)} className="text-muted-foreground/30 hover:text-muted-foreground text-xs shrink-0">✕</button>
        </div>
      )}

      {/* ── Controls bar ── */}
      <div className="shrink-0 flex items-center gap-2 flex-wrap">

        {/* Symbol picker */}
        <div className="relative">
          <button
            onClick={() => setShowSymbolPanel(v => !v)}
            className="haptic-press flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 px-3 py-2 text-xs font-semibold text-foreground hover:border-accent/30 transition-all"
          >
            <span className="font-mono text-accent">{activeSymbolLabel}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground/40" />
          </button>

          {showSymbolPanel && (
            <div className="absolute top-full mt-1 right-0 z-50 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-white/[0.08] bg-[#0d0d12] shadow-2xl overflow-hidden">
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 p-2 border-b border-white/[0.06]">
                <Search className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 mr-1" />
                <input
                  autoFocus
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="הקלד סימבול מותאם אישית..."
                  className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/25 outline-none"
                />
                <button type="submit" className="text-2xs text-accent font-bold px-2">עבור</button>
              </form>
              {/* Groups */}
              <div className="max-h-72 overflow-y-auto p-2 space-y-2">
                {SYMBOLS.map(group => (
                  <div key={group.group}>
                    <p className="text-[9px] font-bold text-muted-foreground/30 font-mono uppercase px-2 mb-1">{group.group}</p>
                    <div className="space-y-0.5">
                      {group.items.map(s => (
                        <button
                          key={s.symbol}
                          onClick={() => { setSymbol(s.symbol); setShowSymbolPanel(false); }}
                          className={`w-full text-right px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            symbol === s.symbol
                              ? "bg-accent/10 text-accent"
                              : "text-foreground/60 hover:bg-white/[0.04] hover:text-foreground"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timeframe buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`haptic-press rounded-lg border px-2.5 py-1.5 text-[11px] font-mono font-bold transition-all ${
                timeframe === tf.value
                  ? "border-accent/30 bg-accent/12 text-accent"
                  : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 hover:bg-white/[0.04] hover:text-foreground"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <div
        className="flex-1 rounded-2xl border border-border/20 bg-[#0a0a0f] overflow-hidden"
        style={{ minHeight: "calc(100vh - 260px)" }}
        onClick={() => setShowSymbolPanel(false)}
      >
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
};

export default BacktestingPage;
