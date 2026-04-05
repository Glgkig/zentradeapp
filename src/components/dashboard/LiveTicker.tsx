import { useMarketData, TickerItem } from "@/utils/marketApi";
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react";

const formatPrice = (price: number, symbol: string) => {
  if (symbol.includes("EUR") || symbol.includes("GBP")) {
    return price.toFixed(4);
  }
  if (price >= 1000) return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return price.toFixed(2);
};

const TickerItemDisplay = ({ item }: { item: TickerItem }) => {
  const positive = item.changePct >= 0;
  return (
    <div className="flex items-center gap-2.5 px-4 shrink-0">
      <span className="text-2xs font-bold text-foreground/80 font-mono whitespace-nowrap">{item.symbol}</span>
      <span className="text-2xs font-mono text-foreground/60">${formatPrice(item.price, item.symbol)}</span>
      <span className={`flex items-center gap-0.5 text-2xs font-bold font-mono whitespace-nowrap ${positive ? "text-primary" : "text-destructive"}`}>
        {positive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
        {positive ? "+" : ""}{item.changePct.toFixed(2)}%
      </span>
    </div>
  );
};

const LiveTicker = () => {
  const { data, isLive } = useMarketData();

  // Triple items for seamless infinite scroll — no gaps
  const items = [...data, ...data, ...data];

  return (
    <div className="relative w-full overflow-hidden border-b border-border/30 bg-card/60 backdrop-blur-md">
      {/* Live indicator */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1 rounded-md bg-card/90 px-1.5 py-0.5">
        {isLive ? (
          <>
            <Wifi className="h-2.5 w-2.5 text-primary" />
            <span className="text-[9px] font-mono text-primary font-bold">LIVE</span>
          </>
        ) : (
          <>
            <WifiOff className="h-2.5 w-2.5 text-muted-foreground/40" />
            <span className="text-[9px] font-mono text-muted-foreground/40">DEMO</span>
          </>
        )}
      </div>

      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card/60 to-transparent z-[5] pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-card/60 to-transparent z-[5] pointer-events-none" />

      {/* Scrolling track */}
      <div className="flex items-center py-1.5 animate-ticker">
        {items.map((item, i) => (
          <TickerItemDisplay key={`${item.symbol}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
};

export default LiveTicker;
