import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Crown, Zap, Check, X,
  ArrowRight, Sparkles, Star, ChevronLeft, Gem,
} from "lucide-react";

const LS_CHECKOUT = {
  pro: "https://zentradeapp.lemonsqueezy.com/checkout/buy/2996219f-d0ac-4e3e-b211-a7a2787008eb",
  promax: "https://zentradeapp.lemonsqueezy.com/checkout/buy/f13f7e97-3b20-42f4-858b-01130392bff4",
};

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
  plan: "pro" as const,
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
  plan: "promax" as const,
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

  const handleCheckout = (plan: "pro" | "promax") => {
    if (!user) {
      navigate("/login");
      return;
    }
    const base = LS_CHECKOUT[plan];
    const params = new URLSearchParams();
    if (user.email) params.set("checkout[email]", user.email);
    params.set("checkout[custom][user_id]", user.id);
    window.location.href = `${base}?${params.toString()}`;
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
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto items-start">

          {/* Free Card */}
          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl p-7 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.08]">
                <Zap className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground/80">{freePlan.name}</p>
                <p className="text-[10px] text-muted-foreground/25 font-mono tracking-widest">{freePlan.nameEn}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-[38px] font-black text-foreground/60 leading-none">₪0</span>
                <span className="text-sm text-muted-foreground/25 mr-1">/חודש</span>
              </div>
            </div>

            <div className="space-y-2.5 flex-1 mb-7">
              {freePlan.features.map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.06] shrink-0">
                    <Check className="h-3 w-3 text-muted-foreground/50" />
                  </div>
                  <span className="text-[13px] text-foreground/55">{f}</span>
                </div>
              ))}
              {freePlan.missing.map((f) => (
                <div key={f} className="flex items-center gap-2.5 opacity-30">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.04] shrink-0">
                    <X className="h-3 w-3 text-muted-foreground/40" />
                  </div>
                  <span className="text-[13px] text-muted-foreground/40 line-through">{f}</span>
                </div>
              ))}
            </div>

            <button disabled className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] py-3.5 text-sm font-semibold text-muted-foreground/30 cursor-not-allowed">
              {isPro ? "תוכנית קודמת" : "תוכנית נוכחית"}
            </button>
          </div>

          {/* Pro Card — elevated */}
          <div className="relative rounded-3xl overflow-hidden flex flex-col md:-mt-4 md:-mb-4 shadow-2xl shadow-primary/20">
            {/* Glow border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-primary/30 via-primary/10 to-primary/5 pointer-events-none" />
            <div className="absolute inset-[1px] rounded-3xl bg-[#0d1a17] pointer-events-none" />

            {/* Popular badge */}
            <div className="relative z-10 flex justify-center pt-5">
              <div className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 shadow-lg shadow-primary/40">
                <Star className="h-3 w-3 text-[#0d1a17] fill-[#0d1a17]" />
                <span className="text-[11px] font-black text-[#0d1a17] tracking-wide">הכי פופולרי</span>
              </div>
            </div>

            <div className="relative z-10 p-7 pt-4 flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30 shadow-[0_0_16px_rgba(0,212,170,0.2)]">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-foreground">{proPlan.name}</p>
                  <p className="text-[10px] text-primary font-black font-mono tracking-widest">{proPlan.nameEn}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-[42px] font-black text-primary leading-none drop-shadow-[0_0_20px_rgba(0,212,170,0.4)]">₪{proPlan.price}</span>
                  <span className="text-sm text-primary/40 mr-1">/חודש</span>
                </div>
                <p className="text-[11px] text-primary/40 font-mono mt-1">7 ימי ניסיון חינם</p>
              </div>

              <div className="space-y-2.5 flex-1 mb-7">
                {proPlan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 border border-primary/20 shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-[13px] text-foreground/90 font-medium">{f}</span>
                  </div>
                ))}
              </div>

              {isPro ? (
                <button disabled className="w-full rounded-2xl bg-primary/15 border border-primary/25 py-4 text-sm font-bold text-primary cursor-not-allowed">
                  ✓ תוכנית נוכחית
                </button>
              ) : (
                <button
                  onClick={() => handleCheckout(proPlan.plan)}
                  className="haptic-press relative flex items-center justify-center gap-2.5 w-full rounded-2xl bg-primary text-[#0d1a17] py-4 text-sm font-black shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
                >
                  <Crown className="h-4 w-4" />
                  התחל ניסיון חינם
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </button>
              )}
            </div>
          </div>

          {/* ProMax Card */}
          <div className="relative rounded-3xl border border-accent/18 bg-gradient-to-br from-accent/[0.05] via-transparent to-transparent backdrop-blur-xl p-7 flex flex-col">
            <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-l from-transparent via-accent/40 to-transparent rounded-t-3xl" />

            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 border border-accent/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                <Gem className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">{promaxPlan.name}</p>
                <p className="text-[10px] text-accent/70 font-mono font-bold tracking-widest">{promaxPlan.nameEn}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-[38px] font-black text-foreground leading-none">₪{promaxPlan.price}</span>
                <span className="text-sm text-muted-foreground/30 mr-1">/חודש</span>
              </div>
            </div>

            <div className="space-y-2.5 flex-1 mb-7">
              {promaxPlan.features.map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 border border-accent/15 shrink-0">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-[13px] text-foreground/80 font-medium">{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCheckout(promaxPlan.plan)}
              className="haptic-press flex items-center justify-center gap-2.5 w-full rounded-2xl bg-gradient-to-l from-accent/20 to-accent/10 border border-accent/25 text-accent py-3.5 text-sm font-bold hover:from-accent/30 hover:to-accent/20 hover:border-accent/35 transition-all duration-200 active:scale-[0.98]"
            >
              <Gem className="h-4 w-4" />
              הצטרף ל-ProMax
              <ArrowRight className="h-4 w-4 rotate-180" />
            </button>
          </div>
        </div>

        {/* Bottom trust */}
        <div className="text-center mt-12">
          <div className="flex items-center justify-center gap-6 flex-wrap mb-3">
            {["ביטול בכל עת", "ללא התחייבות", "תשלום מאובטח SSL"].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-[11px] text-muted-foreground/30 font-mono">
                <Check className="h-3 w-3 text-primary/30" />
                {t}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/20 font-mono">Powered by Lemon Squeezy</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
