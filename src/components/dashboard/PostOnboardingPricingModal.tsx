import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Crown, Zap, Check, X, ArrowRight, Sparkles, Gem, Star, CreditCard, Shield,
} from "lucide-react";

// Pro trial checkout — 7-day free trial configured in LemonSqueezy dashboard on the variant
const LS_CHECKOUT = {
  pro_trial: "https://zentradeapp.lemonsqueezy.com/checkout/buy/2996219f-d0ac-4e3e-b211-a7a2787008eb",
  pro: "https://zentradeapp.lemonsqueezy.com/checkout/buy/2996219f-d0ac-4e3e-b211-a7a2787008eb",
  promax: "https://zentradeapp.lemonsqueezy.com/checkout/buy/f13f7e97-3b20-42f4-858b-01130392bff4",
};

interface Props {
  onClose: () => void;
}

const PostOnboardingPricingModal = ({ onClose }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [visible, setVisible] = useState(true);

  const dismiss = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const buildUrl = (key: keyof typeof LS_CHECKOUT) => {
    if (!user) return null;
    const base = LS_CHECKOUT[key];
    const params = new URLSearchParams();
    if (user.email) params.set("checkout[email]", user.email);
    params.set("checkout[custom][user_id]", user.id);
    return `${base}?${params.toString()}`;
  };

  const handleCheckout = (key: keyof typeof LS_CHECKOUT) => {
    if (!user) { navigate("/login"); return; }
    const url = buildUrl(key);
    if (url) window.location.href = url;
  };

  return (
    <div
      className={`fixed inset-0 z-[110] flex items-center justify-center p-4 transition-all duration-300 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      dir="rtl"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={dismiss} />

      {/* Panel */}
      <div
        className={`relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-border/60 bg-card/95 backdrop-blur-2xl shadow-2xl transition-all duration-300 ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 left-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-secondary/40 text-muted-foreground hover:bg-secondary/70 hover:text-foreground transition-colors"
          aria-label="סגור"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/15 px-4 py-1.5 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary font-mono">🎉 ברוך הבא! בחר תוכנית</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              התחל את{" "}
              <span className="bg-gradient-to-l from-primary via-emerald-400 to-primary bg-clip-text text-transparent">
                7 הימים החינמיים
              </span>{" "}
              שלך
            </h2>
            <p className="text-muted-foreground/50 text-sm max-w-md mx-auto">
              נסה את כל הפיצ׳רים ללא הגבלה — ביטול מתי שתרצה, לפני שמחייבים אותך שקל אחד.
            </p>
          </div>

          {/* Trial banner */}
          <div className="flex items-center justify-center gap-6 rounded-2xl border border-primary/15 bg-primary/[0.05] px-5 py-3 mb-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary/60" />
              <span className="text-[12px] text-foreground/60">נדרש כרטיס אשראי</span>
            </div>
            <div className="h-4 w-px bg-border/40" />
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary/60" />
              <span className="text-[12px] text-foreground/60">ביטול חינם תוך 7 ימים</span>
            </div>
            <div className="h-4 w-px bg-border/40 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[12px] text-foreground/60">אחרי הניסיון — חיוב אוטומטי</span>
            </div>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">

            {/* Free / Lite */}
            <div className="rounded-2xl border border-border/40 bg-background/40 p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/20 border border-border/50">
                  <Zap className="h-[18px] w-[18px] text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">ZenTrade Lite</p>
                  <p className="text-[10px] text-muted-foreground/30 font-mono">LITE</p>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">₪0</span>
                <span className="text-xs text-muted-foreground/30 mr-1">/חודש</span>
              </div>
              <ul className="space-y-2 flex-1 mb-5">
                {["10 עסקאות בחודש", "יומן מסחר בסיסי", "סטטיסטיקות שבועיות", "התראות מייל"].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Check className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <span className="text-[12px] text-foreground/60">{f}</span>
                  </li>
                ))}
                {["מנטור AI מתקדם", "Kill Switch", "AI Chart Vision"].map(f => (
                  <li key={f} className="flex items-center gap-2 opacity-35">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted/20 shrink-0">
                      <X className="h-2.5 w-2.5 text-muted-foreground/50" />
                    </div>
                    <span className="text-[12px] text-muted-foreground/50 line-through">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={dismiss}
                className="w-full rounded-xl border border-border/40 bg-secondary/20 py-3 text-xs font-semibold text-muted-foreground/50 hover:bg-secondary/40 transition-colors"
              >
                המשך ללא ניסיון
              </button>
              <p className="text-center text-[10px] text-muted-foreground/30 mt-2">אפשר לשדרג מאוחר יותר</p>
            </div>

            {/* Pro Trial — highlighted */}
            <div className="relative rounded-2xl border border-primary/35 bg-background/40 p-5 flex flex-col shadow-xl shadow-primary/[0.1]">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-transparent pointer-events-none" />

              {/* Top badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                <div className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 shadow-lg shadow-primary/40">
                  <Star className="h-2.5 w-2.5 text-primary-foreground fill-primary-foreground" />
                  <span className="text-[10px] font-bold text-primary-foreground">7 ימים חינם!</span>
                </div>
              </div>

              <div className="relative flex items-center gap-3 mb-4 mt-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-primary/25">
                  <Crown className="h-[18px] w-[18px] text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">ZenTrade Pro</p>
                  <p className="text-[10px] text-primary font-mono font-bold">PRO</p>
                </div>
              </div>

              <div className="relative mb-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-primary">חינם</span>
                  <span className="text-xs text-muted-foreground/30">ל-7 ימים, אחר כך</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-bold text-foreground">₪99</span>
                  <span className="text-xs text-muted-foreground/30">/חודש</span>
                </div>
              </div>

              <div className="relative flex items-center gap-1.5 mb-4 mt-2 bg-primary/[0.07] border border-primary/15 rounded-xl px-3 py-2">
                <CreditCard className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                <span className="text-[11px] text-primary/70 font-medium">כרטיס נדרש — לא מחויב עד 7 ימים</span>
              </div>

              <ul className="relative space-y-2 flex-1 mb-5">
                {[
                  "עסקאות ללא הגבלה",
                  "יומן מסחר מתקדם",
                  "מנטור AI מתקדם",
                  "Kill Switch הגנת הון",
                  "AI Chart Vision",
                  "סטטיסטיקות Real-Time",
                  "ייצוא PDF מקצועי",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 shrink-0">
                      <Check className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <span className="text-[12px] text-foreground/80 font-medium">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout("pro_trial")}
                className="relative flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground py-3.5 text-sm font-bold shadow-lg shadow-primary/25 hover:brightness-110 transition-all active:scale-[0.98]"
              >
                <Crown className="h-4 w-4" />
                התחל ניסיון חינם
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
              <p className="text-center text-[10px] text-muted-foreground/35 mt-2">ביטול בכל עת — ללא דמי ביטול</p>
            </div>

            {/* ProMax */}
            <div className="relative rounded-2xl border border-accent/20 bg-background/40 p-5 flex flex-col">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-accent/10 via-transparent to-transparent pointer-events-none" />

              <div className="relative flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 border border-accent/20">
                  <Gem className="h-[18px] w-[18px] text-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">ZenTrade ProMax</p>
                  <p className="text-[10px] text-accent font-mono font-bold">PROMAX</p>
                </div>
              </div>

              <div className="relative mb-4">
                <span className="text-3xl font-bold text-foreground">₪199</span>
                <span className="text-xs text-muted-foreground/30 mr-1">/חודש</span>
              </div>

              <ul className="relative space-y-2 flex-1 mb-5">
                {[
                  "הכול ב-Pro +",
                  "API גישה מלאה",
                  "מנטור 1:1 אישי",
                  "חוקי ברזל מותאמים",
                  "VIP טלגרם",
                  "תמיכה 24/7",
                  "גישה מוקדמת לפיצ׳רים",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/15 shrink-0">
                      <Check className="h-2.5 w-2.5 text-accent" />
                    </div>
                    <span className="text-[12px] text-foreground/80 font-medium">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout("promax")}
                className="relative flex items-center justify-center gap-2 w-full rounded-xl bg-accent/15 border border-accent/25 text-accent py-3 text-xs font-bold hover:bg-accent/25 transition-all active:scale-[0.98]"
              >
                <Gem className="h-3.5 w-3.5" />
                הצטרף ל-ProMax
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              </button>
            </div>
          </div>

          {/* Footer trust */}
          <p className="text-center text-[10px] text-muted-foreground/25 font-mono">
            ביטול בכל עת • ללא התחייבות • תשלום מאובטח דרך Lemon Squeezy 🔒
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostOnboardingPricingModal;
