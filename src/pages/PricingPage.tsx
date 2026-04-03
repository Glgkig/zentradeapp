import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Crown, Zap, Check, X,
  ArrowRight, Sparkles, Star, ChevronLeft, Gem, Loader2,
} from "lucide-react";

const freePlan = {
  name: "ZenTrade Lite",
  nameEn: "LITE",
  price: "0",
  icon: Zap,
  features: [
    "10 עסקאות בחודש",
    "יומן מסחר בסיסי",
    "סטטיסטיקות שבועיות",
    "התראות מייל",
  ],
  missing: [
    "מנטור AI מתקדם",
    "Kill Switch הגנת הון",
    "AI Chart Vision",
    "ייצוא PDF מקצועי",
    "תמיכה בעדיפות",
  ],
};

const proPlan = {
  name: "ZenTrade Pro",
  nameEn: "PRO",
  price: "99",
  icon: Crown,
  checkoutUrl: "https://buy.polar.sh/polar_cl_C8RPN9FyyA6Ifof8Uav33GXwhG9rl1XOZOSYK233F52",
  features: [
    "עסקאות ללא הגבלה",
    "יומן מסחר מתקדם",
    "מנטור AI מתקדם",
    "Kill Switch הגנת הון",
    "AI Chart Vision",
    "סטטיסטיקות Real-Time",
    "בקטסטינג מלא",
    "ייצוא PDF מקצועי",
    "תמיכה בעדיפות",
  ],
  missing: [],
};

const promaxPlan = {
  name: "ZenTrade ProMax",
  nameEn: "PROMAX",
  price: "199",
  icon: Gem,
  checkoutUrl: "https://buy.polar.sh/polar_cl_rpnrx1LvsNvatMh0ZAwvl36XMpwSoPnZZaZnD1RxaAe",
  features: [
    "הכול ב-Pro +",
    "API גישה מלאה",
    "מנטור 1:1 אישי",
    "חוקי ברזל מותאמים",
    "VIP טלגרם",
    "תמיכה 24/7",
    "גישה מוקדמת לפיצ׳רים",
  ],
  missing: [],
};

const PricingPage = () => {
  const navigate = useNavigate();
  const { isPro } = useSubscription();
  const { user } = useAuth();

  const buildCheckoutUrl = (baseUrl: string) => {
    if (!user) return "/login";
    const params = new URLSearchParams();
    // Pass user ID and email as metadata so webhook can identify the user
    params.set("metadata[supabase_user_id]", user.id);
    if (user.email) params.set("customer_email", user.email);
    params.set("success_url", `${window.location.origin}/success`);
    return `${baseUrl}?${params.toString()}`;
  };

  const handleCheckout = (baseUrl: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    window.location.href = buildCheckoutUrl(baseUrl);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      {/* Ambient */}
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-200px] left-[-100px] w-[500px] h-[500px] bg-accent/[0.04] rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 md:py-20">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground/50 hover:text-foreground text-sm mb-10 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          חזור
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/15 px-4 py-1.5 mb-5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-bold text-accent font-mono">PRICING</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            בחר את התוכנית{" "}
            <span className="bg-gradient-to-l from-accent via-yellow-400 to-accent bg-clip-text text-transparent">
              שלך
            </span>
          </h1>
          <p className="text-muted-foreground/50 text-sm md:text-base max-w-md mx-auto">
            שדרג את המסחר שלך עם הכלים המתקדמים ביותר בשוק
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {/* Free Card */}
          <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl p-7 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/20 border border-border/50">
                <Zap className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">{freePlan.name}</p>
                <p className="text-[10px] text-muted-foreground/30 font-mono">{freePlan.nameEn}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">₪0</span>
                <span className="text-sm text-muted-foreground/30">/חודש</span>
              </div>
            </div>

            <div className="space-y-3 flex-1 mb-6">
              {freePlan.features.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-[13px] text-foreground/70">{f}</span>
                </div>
              ))}
              {freePlan.missing.map((f) => (
                <div key={f} className="flex items-center gap-3 opacity-40">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/20">
                    <X className="h-3 w-3 text-muted-foreground/50" />
                  </div>
                  <span className="text-[13px] text-muted-foreground/50 line-through">{f}</span>
                </div>
              ))}
            </div>

            <button
              disabled
              className="w-full rounded-2xl border border-border/50 bg-secondary/30 py-3.5 text-sm font-semibold text-muted-foreground/40 cursor-not-allowed"
            >
              {isPro ? "תוכנית קודמת" : "תוכנית נוכחית"}
            </button>
          </div>

          {/* Pro Card */}
          <div className="relative rounded-3xl border border-primary/25 bg-card/50 backdrop-blur-xl p-7 flex flex-col shadow-lg shadow-primary/[0.05]">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-primary/15 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 shadow-lg shadow-primary/30">
                <Star className="h-3 w-3 text-primary-foreground fill-primary-foreground" />
                <span className="text-[11px] font-bold text-primary-foreground">הכי פופולרי</span>
              </div>
            </div>

            <div className="relative flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 border border-primary/20">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">{proPlan.name}</p>
                <p className="text-[10px] text-primary font-mono font-bold">{proPlan.nameEn}</p>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">₪{proPlan.price}</span>
                <span className="text-sm text-muted-foreground/30">/חודש</span>
              </div>
            </div>

            <div className="relative space-y-3 flex-1 mb-6">
              {proPlan.features.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-[13px] text-foreground/80 font-medium">{f}</span>
                </div>
              ))}
            </div>

            {isPro ? (
              <button
                disabled
                className="relative w-full rounded-2xl bg-primary/10 border border-primary/20 py-3.5 text-sm font-bold text-primary cursor-not-allowed"
              >
                ✓ תוכנית נוכחית
              </button>
            ) : (
              <button
                onClick={() => handleCheckout(proPlan.checkoutUrl)}
                className="relative flex items-center justify-center gap-2.5 w-full rounded-2xl bg-primary text-primary-foreground py-3.5 text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
              >
                <Crown className="h-4 w-4" />
                שדרג ל-Pro
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
            )}
          </div>

          {/* ProMax Card */}
          <div className="relative rounded-3xl border border-accent/20 bg-card/50 backdrop-blur-xl p-7 flex flex-col">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-accent/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 border border-accent/20">
                <Gem className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">{promaxPlan.name}</p>
                <p className="text-[10px] text-accent font-mono font-bold">{promaxPlan.nameEn}</p>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">₪{promaxPlan.price}</span>
                <span className="text-sm text-muted-foreground/30">/חודש</span>
              </div>
            </div>

            <div className="relative space-y-3 flex-1 mb-6">
              {promaxPlan.features.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-[13px] text-foreground/80 font-medium">{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCheckout(promaxPlan.checkoutUrl)}
              className="relative flex items-center justify-center gap-2.5 w-full rounded-2xl bg-accent/15 border border-accent/20 text-accent py-3.5 text-sm font-bold hover:bg-accent/25 transition-all duration-200 active:scale-[0.98]"
            >
              <Gem className="h-4 w-4" />
              הצטרף ל-ProMax
              <ArrowRight className="h-4 w-4 rotate-180" />
            </button>
          </div>
        </div>

        {/* Bottom trust */}
        <div className="text-center mt-10">
          <p className="text-[11px] text-muted-foreground/25 font-mono">
            ביטול בכל עת • ללא התחייבות • תשלום מאובטח דרך Polar
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
