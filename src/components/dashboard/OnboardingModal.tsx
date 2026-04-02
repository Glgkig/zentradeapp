import { useState } from "react";
import { Sparkles, ChevronLeft, Check, Crosshair, Wallet, Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";

const steps = [
  {
    id: "tradingStyle" as const,
    icon: Crosshair,
    title: "מה סגנון המסחר העיקרי שלך?",
    subtitle: "נשתמש בזה כדי להתאים את ה-Playbook שלך",
    options: [
      { value: "smc", label: "SMC", desc: "Smart Money Concepts — Liquidity Sweeps, BOS, CHoCH" },
      { value: "ict", label: "ICT", desc: "Inner Circle Trader — FVG, Order Blocks, Kill Zones" },
      { value: "price-action", label: "Price Action", desc: "נרות, תבניות מחיר, Support & Resistance" },
      { value: "indicators", label: "אינדיקטורים", desc: "RSI, MACD, Bollinger Bands, Moving Averages" },
    ],
  },
  {
    id: "accountType" as const,
    icon: Wallet,
    title: "איזה סוג חשבון אתה מנהל?",
    subtitle: "נתאים את ניהול הסיכונים בהתאם",
    options: [
      { value: "funded", label: "Funded Account", desc: "חשבון ממומן — כללים קפדניים, Drawdown מוגבל" },
      { value: "personal", label: "חשבון אישי", desc: "הון עצמי — גמישות מלאה בניהול" },
      { value: "demo", label: "Demo", desc: "חשבון תרגול — בלי סיכון אמיתי" },
    ],
  },
  {
    id: "weakness" as const,
    icon: Brain,
    title: "מה החולשה הפסיכולוגית הכי גדולה שלך?",
    subtitle: "ה-AI ישים דגש מיוחד על זה בניתוח שלך",
    options: [
      { value: "overtrading", label: "Overtrading", desc: "פותח יותר מדי עסקאות — לא יודע לעצור" },
      { value: "fomo", label: "FOMO", desc: "נכנס לעסקאות מפחד לפספס — בלי אישור" },
      { value: "cutting-winners", label: "חותך רווחים מוקדם", desc: "סוגר עסקה רווחית לפני שהיא מגיעה ליעד" },
      { value: "moving-sl", label: "מזיז סטופ-לוס", desc: "משנה את הסטופ במהלך העסקה — מגדיל סיכון" },
    ],
  },
];

interface OnboardingModalProps {
  userName: string;
  onComplete: () => void;
}

const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const { updateProfile } = useAuth();
  const { userProfile, updateField, setUserProfile } = useUserProfile();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [completing, setCompleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentStep = steps[step];
  const selectedValue = selections[currentStep.id] || "";
  const StepIcon = currentStep.icon;

  const handleSelect = (value: string) => {
    setSelections(prev => ({ ...prev, [currentStep.id]: value }));
  };

  const handleNext = async () => {
    if (!selectedValue) return;

    updateField(currentStep.id, selectedValue as any);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Final step — save everything
      setCompleting(true);
      const finalProfile = {
        ...userProfile,
        tradingStyle: (selections.tradingStyle || userProfile.tradingStyle) as any,
        accountType: (selections.accountType || userProfile.accountType) as any,
        weakness: (selections.weakness || selectedValue) as any,
      };
      setUserProfile(finalProfile);

      // Save to DB too
      const styleMap: Record<string, string> = {
        "smc": "day_trading", "ict": "day_trading",
        "price-action": "swing", "indicators": "swing",
      };
      await updateProfile({
        onboarding_completed: true,
        trading_style: styleMap[finalProfile.tradingStyle] || "day_trading",
      });

      setShowSuccess(true);
      setTimeout(() => onComplete(), 2000);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  if (showSuccess) {
    const weaknessLabel = steps[2].options.find(o => o.value === (selections.weakness || userProfile.weakness))?.label || "";
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" dir="rtl">
        <div className="absolute inset-0 bg-[#0A0A0F]/98 backdrop-blur-xl" />
        <div className="relative z-10 text-center animate-in zoom-in-95 fade-in duration-500 max-w-md">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/15 border border-accent/20 mx-auto mb-6">
            <Check className="h-10 w-10 text-accent" />
          </div>
          <h1 className="font-heading text-3xl font-black text-foreground mb-3">הפרופיל מוכן! 🎯</h1>
          <p className="text-sm text-muted-foreground/60 leading-relaxed">
            המערכת מותאמת אישית. המטרה שלך:{" "}
            <span className="text-accent font-bold">להתגבר על ה-{weaknessLabel}</span>
          </p>
          <div className="mt-6 flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-[#0A0A0F]/98 backdrop-blur-xl" />

      {/* Decorative glows */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-60 h-60 rounded-full bg-accent/[0.03] blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`h-2.5 rounded-full transition-all duration-500 ${
                i === step ? "w-10 bg-primary" : i < step ? "w-6 bg-accent" : "w-6 bg-white/[0.08]"
              }`} />
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15 mx-auto mb-5">
            <StepIcon className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-heading text-xl md:text-2xl font-black text-foreground mb-2">
            {currentStep.title}
          </h2>
          <p className="text-xs text-muted-foreground/50">{currentStep.subtitle}</p>
        </div>

        {/* Options */}
        <div className="space-y-2.5 mb-8">
          {currentStep.options.map((opt) => {
            const isSelected = selectedValue === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-right rounded-2xl border p-4 transition-all duration-300 group ${
                  isSelected
                    ? "border-primary/30 bg-primary/[0.08] shadow-[0_0_25px_hsl(var(--primary)/0.08)]"
                    : "border-white/[0.06] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-bold mb-0.5 transition-colors ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground/45 leading-relaxed">{opt.desc}</p>
                  </div>
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all mr-3 ${
                    isSelected ? "border-primary bg-primary" : "border-white/[0.15] bg-transparent"
                  }`}>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] px-5 py-3 text-xs font-bold text-muted-foreground/60 hover:text-foreground transition-all"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
              חזור
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!selectedValue || completing}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-30 hover:bg-primary/90 transition-all active:scale-[0.97]"
          >
            {completing ? (
              <span className="animate-spin h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {step === steps.length - 1 ? "סיים והתחל לעבוד" : "הבא"}
              </>
            )}
          </button>
        </div>

        {/* Step counter */}
        <p className="text-center text-[10px] text-muted-foreground/25 mt-4 font-medium">
          שלב {step + 1} מתוך {steps.length}
        </p>
      </div>
    </div>
  );
};

export default OnboardingModal;
