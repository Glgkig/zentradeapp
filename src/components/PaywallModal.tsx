import { useSubscription, POLAR_URL } from "@/contexts/SubscriptionContext";
import { Crown, Lock, Sparkles, X, Zap } from "lucide-react";

const PaywallModal = () => {
  const { paywallFeature, closePaywall } = useSubscription();

  if (!paywallFeature) return null;

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={closePaywall} />
      <div className="fixed inset-0 z-[91] flex items-center justify-center p-4" dir="rtl">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0C0C12]/95 backdrop-blur-2xl shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
          {/* Ambient glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-accent/[0.08] rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 right-0 w-[200px] h-[200px] bg-primary/[0.05] rounded-full blur-[80px] pointer-events-none" />

          {/* Close */}
          <button
            onClick={closePaywall}
            className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-muted-foreground/40 hover:text-foreground transition-all z-10"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="relative px-8 pt-10 pb-8 text-center">
            {/* Icon */}
            <div className="mx-auto mb-5 relative">
              <div className="absolute inset-0 rounded-3xl bg-accent/20 blur-xl animate-pulse" />
              <div className="relative flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-gradient-to-br from-accent/20 to-accent/[0.05] border border-accent/20">
                <Lock className="h-8 w-8 text-accent" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-foreground mb-2">
              פתח את{" "}
              <span className="bg-gradient-to-l from-accent via-yellow-400 to-accent bg-clip-text text-transparent">
                {paywallFeature}
              </span>
            </h2>
            <p className="text-sm text-muted-foreground/60 leading-relaxed mb-6">
              שדרג ל-ZenTrade Pro וקבל את היתרון האולטימטיבי בשוק.
              <br />
              כל הכלים המתקדמים, ללא הגבלה.
            </p>

            {/* Features preview */}
            <div className="space-y-2.5 mb-7 text-right">
              {[
                "עסקאות ללא הגבלה",
                "מנטור AI מתקדם",
                "Kill Switch הגנת הון",
                "ייצוא PDF מקצועי",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.05] px-4 py-2.5">
                  <Sparkles className="h-3.5 w-3.5 text-accent/70 shrink-0" />
                  <span className="text-[12px] font-medium text-foreground/70">{f}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href={POLAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full rounded-2xl bg-gradient-to-l from-accent via-yellow-500 to-accent py-3.5 px-6 text-sm font-bold text-black shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
            >
              <Crown className="h-4.5 w-4.5" />
              שדרג ל-Pro עכשיו
            </a>

            <p className="text-[10px] text-muted-foreground/25 mt-3 font-mono">
              ביטול בכל עת • ללא התחייבות
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaywallModal;
