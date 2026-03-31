import { useState } from "react";
import { Bot, ChevronLeft, ChevronRight, Sparkles, TrendingUp, BarChart3, DollarSign, ShieldAlert, CheckCircle2 } from "lucide-react";

const steps = [
  {
    id: "style",
    question: "מה סגנון המסחר שלך?",
    subtitle: "זה יעזור לנו לכוונן את חוקי ההגנה שלך",
    type: "buttons" as const,
    icon: <TrendingUp className="h-5 w-5" />,
    options: [
      { value: "scalping", label: "סקאלפינג", desc: "עסקאות קצרות של שניות עד דקות" },
      { value: "day", label: "מסחר יומי", desc: "פתיחה וסגירה באותו יום" },
      { value: "swing", label: "מסחר סווינג", desc: "עסקאות של ימים עד שבועות" },
    ],
  },
  {
    id: "markets",
    question: "על אילו שווקים אתה סוחר בעיקר?",
    subtitle: "ניתן לבחור יותר מאחד",
    type: "multi" as const,
    icon: <BarChart3 className="h-5 w-5" />,
    options: [
      { value: "forex", label: "פורקס", desc: "EUR/USD, GBP/JPY..." },
      { value: "crypto", label: "קריפטו", desc: "BTC, ETH, SOL..." },
      { value: "stocks", label: "מניות", desc: "AAPL, TSLA, NVDA..." },
      { value: "indices", label: "מדדים", desc: "NQ, ES, DAX..." },
    ],
  },
  {
    id: "target",
    question: "מהו יעד הרווח היומי הממוצע שלך?",
    subtitle: "מספר ריאלי שמתאים לגודל החשבון שלך",
    type: "number" as const,
    icon: <DollarSign className="h-5 w-5" />,
    placeholder: "500",
    prefix: "$",
  },
  {
    id: "redline",
    question: "מהו קו האדום שלך?",
    subtitle: "ההפסד היומי המקסימלי — מעבר אליו המערכת תנעל אותך כדי למנוע 'עסקאות נקמה'",
    type: "number" as const,
    icon: <ShieldAlert className="h-5 w-5" />,
    placeholder: "300",
    prefix: "$",
    highlight: true,
  },
];

interface OnboardingModalProps {
  userName: string;
  onComplete: () => void;
}

const OnboardingModal = ({ userName, onComplete }: OnboardingModalProps) => {
  const [phase, setPhase] = useState<"greeting" | "steps" | "done">("greeting");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const handleSelect = (stepId: string, value: string, multi?: boolean) => {
    if (multi) {
      const current = (answers[stepId] as string[]) || [];
      setAnswers({
        ...answers,
        [stepId]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      });
    } else {
      setAnswers({ ...answers, [stepId]: value });
    }
  };

  const canProceed = () => {
    const step = steps[currentStep];
    const ans = answers[step.id];
    if (step.type === "multi") return Array.isArray(ans) && ans.length > 0;
    return !!ans;
  };

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else setPhase("done");
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6" dir="rtl">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />

      <div className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-500">
        <div className="rounded-3xl border border-primary/15 bg-secondary/90 backdrop-blur-2xl p-6 md:p-8 shadow-2xl shadow-primary/5">

          {/* ===== Greeting Phase ===== */}
          {phase === "greeting" && (
            <div className="text-center py-4">
              <div className="mx-auto mb-6 relative">
                <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-primary/10 border border-primary/20">
                  <Bot className="h-10 w-10 text-primary" />
                </div>
                <span className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent border-2 border-secondary">
                  <span className="h-2 w-2 rounded-full bg-accent animate-ping absolute" />
                  <span className="h-2 w-2 rounded-full bg-accent relative" />
                </span>
              </div>

              <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground">
                ברוך הבא הביתה, <span className="text-primary">{userName}</span>!
              </h2>
              <p className="mt-4 text-sm leading-[1.9] text-muted-foreground max-w-md mx-auto">
                אני מנטור ה-AI שלך, והתפקיד שלי הוא לשמור על השקט הנפשי שלך ועל חשבון המסחר שלך.
                בוא נכיר קצת כדי שנוכל לבנות את <span className="text-primary font-medium">&lsquo;שומר הראש&rsquo;</span> המושלם עבורך.
              </p>

              <button
                onClick={() => setPhase("steps")}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.97]"
              >
                <Sparkles className="h-4 w-4" />
                בואו נתחיל
              </button>
            </div>
          )}

          {/* ===== Steps Phase ===== */}
          {phase === "steps" && (() => {
            const step = steps[currentStep];
            return (
              <div>
                {/* Progress */}
                <div className="mb-6 flex items-center gap-2">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        i <= currentStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mb-4">שלב {currentStep + 1} מתוך {steps.length}</p>

                {/* Icon + Question */}
                <div className={`flex items-start gap-3 mb-6 ${step.highlight ? "p-4 rounded-xl border border-destructive/20 bg-destructive/[0.03]" : ""}`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    step.highlight ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                  }`}>
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-heading text-base md:text-lg font-bold text-foreground">{step.question}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{step.subtitle}</p>
                  </div>
                </div>

                {/* Answer Area */}
                {(step.type === "buttons" || step.type === "multi") && (
                  <div className="space-y-2">
                    {step.options!.map((opt) => {
                      const selected = step.type === "multi"
                        ? ((answers[step.id] as string[]) || []).includes(opt.value)
                        : answers[step.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleSelect(step.id, opt.value, step.type === "multi")}
                          className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-right transition-all duration-200 ${
                            selected
                              ? "border-primary/40 bg-primary/8 shadow-[inset_0_0_20px_hsl(217_72%_53%/0.05)]"
                              : "border-border bg-muted/20 hover:bg-muted/40 hover:border-border/80"
                          }`}
                        >
                          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                            selected ? "border-primary bg-primary" : "border-muted-foreground/30"
                          }`}>
                            {selected && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{opt.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {step.type === "number" && (
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">{step.prefix}</span>
                    <input
                      type="number"
                      value={(answers[step.id] as string) || ""}
                      onChange={(e) => handleSelect(step.id, e.target.value)}
                      placeholder={step.placeholder}
                      className="w-full rounded-xl border border-border bg-muted/30 py-4 pr-10 pl-4 text-xl font-bold text-foreground placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-center"
                    />
                  </div>
                )}

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={prev}
                    disabled={currentStep === 0}
                    className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground transition-all hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                    הקודם
                  </button>
                  <button
                    onClick={next}
                    disabled={!canProceed()}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {currentStep === steps.length - 1 ? "סיים" : "הבא"}
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ===== Done Phase ===== */}
          {phase === "done" && (
            <div className="text-center py-6">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/10 border border-accent/20">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground">מעולה! הנתונים נשמרו 🎯</h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
                עכשיו, בוא נראה את הבית החדש שלך. כל ההגנות מוכנות ופועלות.
              </p>
              <button
                onClick={onComplete}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.97]"
              >
                <Sparkles className="h-4 w-4" />
                קח אותי הביתה
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
