import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionContextType {
  isPro: boolean;
  subscriptionStatus: string;
  setPro: (val: boolean) => void;
  showPaywall: (featureName: string) => void;
  paywallFeature: string | null;
  closePaywall: () => void;
  openCustomerPortal: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
};

const POLAR_CHECKOUT_URL = "https://buy.polar.sh/polar_cl_C8RPN9FyyA6Ifof8Uav33GXwhG9rl1XOZOSYK233F52";

export const POLAR_URL = POLAR_CHECKOUT_URL;

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [paywallFeature, setPaywallFeature] = useState<string | null>(null);

  const refreshSubscription = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("profiles")
      .select("is_pro, subscription_status")
      .eq("id", user.id)
      .single();

    if (data) {
      setIsPro(data.is_pro ?? false);
      setSubscriptionStatus(data.subscription_status ?? "free");
    }
  }, [user?.id]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  // Listen for realtime changes
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel("subscription-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData) {
            setIsPro(newData.is_pro ?? false);
            setSubscriptionStatus(newData.subscription_status ?? "free");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const setPro = useCallback((val: boolean) => setIsPro(val), []);
  const showPaywall = useCallback((featureName: string) => setPaywallFeature(featureName), []);
  const closePaywall = useCallback(() => setPaywallFeature(null), []);

  const openCustomerPortal = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase.functions.invoke("polar-customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Portal error:", err);
    }
  }, [user?.id]);

  return (
    <SubscriptionContext.Provider value={{ isPro, subscriptionStatus, setPro, showPaywall, paywallFeature, closePaywall, openCustomerPortal, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
