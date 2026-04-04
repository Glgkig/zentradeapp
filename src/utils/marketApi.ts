import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
}

const MOCK_DATA: TickerItem[] = [
  { symbol: "BTC/USD", price: 64230, change: 780, changePct: 1.23 },
  { symbol: "ETH/USD", price: 3412, change: -45, changePct: -1.30 },
  { symbol: "EUR/USD", price: 1.0842, change: 0.0012, changePct: 0.11 },
  { symbol: "GBP/USD", price: 1.2715, change: -0.0023, changePct: -0.18 },
  { symbol: "XAU/USD", price: 2348, change: 18, changePct: 0.77 },
  { symbol: "S&P 500", price: 5243, change: 32, changePct: 0.61 },
  { symbol: "NASDAQ 100", price: 18456, change: -87, changePct: -0.47 },
];

const REFRESH_INTERVAL = 60_000; // 60 seconds

export function useMarketData() {
  const [data, setData] = useState<TickerItem[]>(MOCK_DATA);
  const [isLive, setIsLive] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data: resp, error } = await supabase.functions.invoke("market-data");
      if (error) throw error;
      if (resp?.error) throw new Error(resp.error);

      const items: TickerItem[] = (resp.data || [])
        .filter((d: any) => d.price != null)
        .map((d: any) => ({
          symbol: d.symbol,
          price: d.price,
          change: d.change ?? 0,
          changePct: d.changePct ?? 0,
        }));

      if (items.length > 0) {
        setData(items);
        setIsLive(true);
      }
      // If no valid items, keep mock data
    } catch {
      // Silent fallback to mock data
      setIsLive(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isLive };
}
