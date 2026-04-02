import { useEffect, useRef } from "react";
import { Newspaper, TrendingUp, Calendar } from "lucide-react";

/* ── TradingView Timeline Widget ── */
const TimelineWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      feedMode: "all_symbols",
      isTransparent: true,
      displayMode: "regular",
      width: "100%",
      height: "100%",
      colorTheme: "dark",
      locale: "he_IL",
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
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
};

/* ── TradingView Economic Calendar Widget ── */
const EconomicCalendarWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      isTransparent: true,
      width: "100%",
      height: "100%",
      locale: "he_IL",
      importanceFilter: "-1,0,1",
      countryFilter: "us,eu,gb,jp,cn,il",
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
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
};

/* ── Page ── */
const EconomicNewsPage = () => {
  return (
    <div className="h-full flex flex-col gap-4 p-2 md:p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          <div className="absolute inset-[-4px] rounded-xl bg-primary/8 animate-pulse" style={{ animationDuration: "2.5s" }} />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
            <Newspaper className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground">חדשות כלכליות</h1>
          <p className="text-2xs text-muted-foreground/50 font-mono">LIVE MARKET NEWS & CALENDAR</p>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* News Timeline - 2/3 */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] shrink-0">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground font-mono">LIVE NEWS</span>
            <div className="mr-auto flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-2xs text-muted-foreground/40 font-mono">STREAMING</span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <TimelineWidget />
          </div>
        </div>

        {/* Economic Calendar - 1/3 */}
        <div className="lg:col-span-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] shrink-0">
            <Calendar className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-semibold text-foreground font-mono">ECONOMIC CALENDAR</span>
          </div>
          <div className="flex-1 min-h-0">
            <EconomicCalendarWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomicNewsPage;
