import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type Trade = Database["public"]["Tables"]["trades"]["Row"];
type TradeInsert = Database["public"]["Tables"]["trades"]["Insert"];
type TradeUpdate = Database["public"]["Tables"]["trades"]["Update"];

export const useTrades = (filters?: { status?: string; symbol?: string }) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trades", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];
      let query = supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_time", { ascending: false });

      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.symbol) query = query.eq("symbol", filters.symbol);

      const { data, error } = await query;
      if (error) throw error;
      return data as Trade[];
    },
    enabled: !!user?.id,
  });
};

export const useAddTrade = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (trade: Omit<TradeInsert, "user_id">) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("trades")
        .insert({ ...trade, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trades"] }),
  });
};

export const useUpdateTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TradeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("trades")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trades"] }),
  });
};

export const useDeleteTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trades").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trades"] }),
  });
};

export const useTradeStats = () => {
  const { data: trades = [] } = useTrades();

  const closedTrades = trades.filter((t) => t.status === "closed");
  const wins = closedTrades.filter((t) => (t.pnl ?? 0) > 0);
  const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 0;
  const losses = closedTrades.filter((t) => (t.pnl ?? 0) < 0);
  const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length : 0;
  const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;

  return { totalPnl, winRate, avgWin, avgLoss, profitFactor, totalTrades: closedTrades.length, openTrades: trades.filter(t => t.status === "open").length };
};
