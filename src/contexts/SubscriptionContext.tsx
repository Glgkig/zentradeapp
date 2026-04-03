import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface SubscriptionContextType {
  isPro: boolean;
  setPro: (val: boolean) => void;
  showPaywall: (featureName: string) => void;
  paywallFeature: string | null;
  closePaywall: () => void;
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
  const [isPro, setIsPro] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("zentrade-pro") === "true";
    }
    return false;
  });
  const [paywallFeature, setPaywallFeature] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("zentrade-pro", isPro ? "true" : "false");
  }, [isPro]);

  const setPro = useCallback((val: boolean) => setIsPro(val), []);
  const showPaywall = useCallback((featureName: string) => setPaywallFeature(featureName), []);
  const closePaywall = useCallback(() => setPaywallFeature(null), []);

  return (
    <SubscriptionContext.Provider value={{ isPro, setPro, showPaywall, paywallFeature, closePaywall }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
