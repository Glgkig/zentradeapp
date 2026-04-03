import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Crown, Check, Sparkles, ArrowRight, PartyPopper } from "lucide-react";

const SuccessPage = () => {
  const navigate = useNavigate();
  const { setPro } = useSubscription();
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Activate pro
    setPro(true);

    // Staggered animation
    const t1 = setTimeout(() => setStep(1), 300);
    const t2 = setTimeout(() => setStep(2), 800);
    const t3 = setTimeout(() => setStep(3), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [setPro]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden" dir="rtl">
      {/* Ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/[0.06] rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.04] rounded-full blur-[150px] pointer-events-none" />

      {/* Confetti-like particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-pulse"
            style={{
              background: i % 3 === 0 ? "hsl(43, 72%, 52%)" : i % 3 === 1 ? "hsl(160, 100%, 42%)" : "hsl(270, 70%, 60%)",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.15 + Math.random() * 0.2,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-md px-6">
        {/* Crown icon */}
        <div
          className={`mx-auto mb-6 transition-all duration-700 ${step >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-accent/25 blur-2xl animate-pulse" />
            <div className="relative flex h-24 w-24 mx-auto items-center justify-center rounded-3xl bg-gradient-to-br from-accent/25 to-accent/[0.05] border border-accent/25">
              <Crown className="h-12 w-12 text-accent" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className={`transition-all duration-700 delay-100 ${step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            ברוך הבא ל-
            <span className="bg-gradient-to-l from-accent via-yellow-400 to-accent bg-clip-text text-transparent">
              ZenTrade Pro
            </span>
            ! 🎉
          </h1>
          <p className="text-muted-foreground/60 text-base mb-8">
            הארסנל שלך פתוח לגמרי. הגיע הזמן לסחור כמו מקצוען.
          </p>
        </div>

        {/* Unlocked features */}
        <div className={`space-y-3 mb-8 transition-all duration-700 delay-200 ${step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {[
            "עסקאות ללא הגבלה",
            "מנטור AI מתקדם",
            "Kill Switch הגנת הון",
            "AI Chart Vision",
          ].map((f, i) => (
            <div
              key={f}
              className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-accent/10 px-5 py-3"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15">
                <Check className="h-3.5 w-3.5 text-accent" />
              </div>
              <span className="text-[13px] font-medium text-foreground/80">{f}</span>
              <Sparkles className="h-3 w-3 text-accent/40 mr-auto" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`transition-all duration-700 delay-300 ${step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2.5 w-full rounded-2xl bg-gradient-to-l from-accent via-yellow-500 to-accent py-4 text-sm font-bold text-black shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            התחל לסחור
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
