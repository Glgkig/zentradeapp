import { useSubscription } from "@/contexts/SubscriptionContext";
import { Crown, Lock, Sparkles, X, Check, Zap, Brain, Shield, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: Zap, text: "עסקאות ללא הגבלה" },
  { icon: Brain, text: "מנטור AI מתקדם" },
  { icon: Shield, text: "Kill Switch הגנת הון" },
  { icon: FileText, text: "ייצוא PDF מקצועי" },
];

const PaywallModal = () => {
  const { paywallFeature, closePaywall } = useSubscription();
  const navigate = useNavigate();

  if (!paywallFeature) return null;

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md animate-in fade-in duration-200" onClick={closePaywall} />
      <div className="fixed inset-0 z-[91] flex items-center justify-center p-4" dir="rtl">
        <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0C0C14] shadow-2xl shadow-black/60 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 paywall-modal">

          {/* Top accent line */}
          <div className="h-[2px] w-full bg-gradient-to-l from-transparent via-accent/60 to-transparent" />

          {/* Ambient glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 bg-accent/[0.08] rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-36 bg-primary/[0.05] rounded-full blur-[70px] pointer-events-none" />

          {/* Close */}
          <button onClick={closePaywall}
            className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-muted-foreground/40 hover:text-foreground transition-all z-10">
            <X className="h-4 w-4" />
          </button>

          <div className="relative px-7 pt-8 pb-7 text-center">

            {/* Trial badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 mb-5">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold text-primary font-mono">7 ימי ניסיון חינם</span>
            </div>

            {/* Lock icon */}
            <div className="relative mx-auto mb-4 w-fit">
              <div className="absolute -inset-3 rounded-3xl bg-accent/15 blur-xl animate-pulse" />
              <div className="relative flex h-18 w-18 h-[72px] w-[72px] mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-accent/25 to-accent/5 border border-accent/25 shadow-[0_0_24px_rgba(245,158,11,0.2)]">
                <Lock className="h-7 w-7 text-accent" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg font-extrabold text-foreground mb-1 leading-tight">
              {paywallFeature} —{" "}
              <span className="bg-gradient-to-l from-accent to-yellow-300 bg-clip-text text-transparent">Pro בלבד</span>
            </h2>
            <p className="text-[12px] text-muted-foreground/45 leading-relaxed mb-5 max-w-xs mx-auto">
              שדרג ל-ZenTrade Pro וקבל גישה מלאה לכל הכלים המתקדמים
            </p>

            {/* Features */}
            <div className="space-y-2 mb-5 text-right">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.03] px-3.5 py-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/12 shrink-0">
                    <Icon className="h-3.5 w-3.5 text-primary/70" />
                  </div>
                  <span className="text-[12px] font-medium text-foreground/70 flex-1">{text}</span>
                  <Check className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                </div>
              ))}
            </div>

            {/* Price + CTA */}
            <div className="rounded-2xl border border-accent/15 bg-accent/[0.05] p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground/40 font-mono">ZenTrade Pro</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-foreground">₪99</span>
                    <span className="text-[11px] text-muted-foreground/40">/חודש</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-primary">7 ימים חינם</p>
                  <p className="text-[9px] text-muted-foreground/30 font-mono">ללא חיוב עד לאחר הניסיון</p>
                </div>
              </div>
              <button
                onClick={() => { closePaywall(); navigate("/pricing"); }}
                className="haptic-press flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-l from-accent to-yellow-400 py-3 text-sm font-black text-[#0a0a0a] shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:brightness-110 transition-all active:scale-[0.97]"
              >
                <Crown className="h-4 w-4" />
                התחל ניסיון חינם
              </button>
            </div>

            <p className="text-[10px] text-muted-foreground/20 font-mono">
              ביטול בכל עת • ללא התחייבות
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaywallModal;
