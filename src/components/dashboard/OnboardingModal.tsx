import { useState } from "react";
import {
  Bot, ChevronLeft, ChevronRight, Sparkles, ShieldAlert,
  CheckCircle2, Brain, Flame, Target, Heart, Lock,
} from "lucide-react";

type StepOption = { value: string; label: string; desc: string; emoji: string };
type Step = {
  id: string; question: string; subtitle: string; icon: React.ReactNode; iconColor: string;
  type?: "number"; placeholder?: string; prefix?: string; options?: StepOption[];
};

const steps: Step[] = [
  {
    id: "weakness",
    question: "בכנות, מהי החולשה הפסיכולוגית הכי גדולה ששורפת לך חשבונות?",
    subtitle: "אין פה שיפוטיות. אני צריך לדעת מה לשמור עליך ממנו.",
    icon: <Flame className="h-5 w-5" />,
    iconColor: "destructive",
    options: [
      { value: "revenge", label: "מסחר נקמה", desc: "נכנס לעסקה כדי 'להחזיר' הפסד — בלי סטאפ אמיתי", emoji: "🔥" },
      { value: "fomo", label: "פומו וכניסה מוקדמת", desc: "רואה נר ירוק ומיד קופץ — בלי לחכות לאישור", emoji: "⚡" },
      { value: "stoploss", label: "הזזת סטופ-לוס", desc: "מרחיק את הסטופ כדי 'לתת לעסקה מקום' — ומפסיד יותר", emoji: "📉" },
      { value: "overlev", label: "מינוף יתר", desc: "נכנס בגדול כי 'הפעם אני בטוח' — ומוחק חשבון", emoji: "💣" },
    ],
  },
  {
    id: "propfail",
    question: "כמה פעמים נכשלת באתגר פראפ (Prop Firm) רק בגלל חוסר משמעת?",
    subtitle: "לא בגלל אסטרטגיה — בגלל הראש.",
    icon: <Target className="h-5 w-5" />,
    iconColor: "primary",
    options: [
      { value: "0", label: "אף פעם", desc: "עדיין לא ניסיתי או עברתי בהצלחה", emoji: "✅" },
      { value: "1-3", label: "1-3 פעמים", desc: "כואב, אבל עדיין לומד", emoji: "😤" },
      { value: "4-10", label: "4-10 פעמים", desc: "כבר הבנתי שהבעיה זה לא הסטרטגיה", emoji: "😞" },
      { value: "lost_count", label: "הפסקתי לספור", desc: "...וזו בדיוק הסיבה שאתה פה. אין מה להתבייש.", emoji: "💔" },
    ],
  },
  {
    id: "reaction",
    question: "איך אתה מגיב אחרי הפסד כואב?",
    subtitle: "התגובה שלך אחרי הפסד היא הדבר שקובע אם תשרוד בשוק.",
    icon: <Brain className="h-5 w-5" />,
    iconColor: "primary",
    options: [
      { value: "jump", label: "קופץ מיד לעסקה חדשה", desc: "חייב להחזיר את הכסף — עכשיו", emoji: "🏃" },
      { value: "freeze", label: "קופא מול המסך", desc: "מפחד לגעת בכלום, הלב דופק חזק", emoji: "🧊" },
      { value: "double", label: "מכפיל כמות כדי להחזיר", desc: "מגדיל פוזיציה כי 'זו ההזדמנות לתקן'", emoji: "💀" },
    ],
  },
  {
    id: "lockout",
    question: "מהו סכום ההפסד היומי שבו אתה רוצה שאנעל לך את הפלטפורמה ואשלח אותך לנוח?",
    subtitle: "זה קו האדום שלך. ברגע שתגיע אליו — אני נועל הכל. בלי פשרות.",
    icon: <Lock className="h-5 w-5" />,
    iconColor: "destructive",
    type: "number",
    placeholder: "300",
    prefix: "$",
  },
];

interface OnboardingModalProps {
  userName: string;
  onComplete: () => void;
}

const OnboardingModal = ({ userName, onComplete }: OnboardingModalProps) => {
  const [phase, setPhase] = useState<"greeting" | "steps" | "done">("greeting");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = (stepId: string, value: string) => {
    setAnswers({ ...answers, [stepId]: value });
  };

  const canProceed = () => !!answers[steps[currentStep].id];

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else setPhase("done");
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#050508]/90 backdrop-blur-2xl" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/[0.04]"
            style={{
              width: `${100 + i * 60}px`,
              height: `${100 + i * 60}px`,
              top: `${10 + i * 15}%`,
              left: `${5 + i * 16}%`,
              animation: `float ${8 + i * 2}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
        <style>{`@keyframes float { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-30px) scale(1.1); } }`}</style>
      </div>

      <div className="relative z-10 w-full max-w-lg max-h-[94vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-700">
        <div className="rounded-3xl border border-border/60 bg-secondary/80 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden">

          {/* Top gradient accent */}
          <div className="h-1 w-full bg-gradient-to-l from-primary via-accent to-primary" />

          <div className="p-6 md:p-8">

            {/* ===== Greeting Phase ===== */}
            {phase === "greeting" && (
              <div className="text-center py-4">
                {/* AI Avatar */}
                <div className="mx-auto mb-8 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-28 w-28 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "3s" }} />
                  </div>
                  <div className="relative flex h-24 w-24 mx-auto items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/25 shadow-[0_0_40px_hsl(217_72%_53%/0.15)]">
                    <Bot className="h-12 w-12 text-primary" />
                  </div>
                  <span className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent border-2 border-secondary shadow-[0_0_10px_hsl(160_60%_45%/0.4)]">
                    <Heart className="h-3 w-3 text-accent-foreground" />
                  </span>
                </div>

                <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground leading-relaxed">
                  ברוך הבא למקום הבטוח שלך,
                  <br />
                  <span className="text-primary">{userName}</span>.
                </h2>

                <div className="mt-6 mx-auto max-w-sm rounded-2xl border border-border/50 bg-muted/20 p-5">
                  <p className="text-sm leading-[2] text-muted-foreground">
                    לפני שנתחיל לסחור, אני צריך
                    <span className="text-primary font-medium"> להכיר את השדים שלך </span>
                    כדי שאוכל להגן עליך מפניהם.
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground/60 leading-relaxed">
                    אני שואל כי אכפת לי. ככל שתהיה כנה יותר — כך אגן עליך טוב יותר.
                  </p>
                </div>

                <button
                  onClick={() => setPhase("steps")}
                  className="mt-8 inline-flex items-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-[0_4px_30px_hsl(217_72%_53%/0.3)] transition-all hover:shadow-[0_4px_40px_hsl(217_72%_53%/0.45)] hover:bg-primary/90 active:scale-[0.97]"
                >
                  <Sparkles className="h-4 w-4" />
                  אני מוכן. בואו נתחיל.
                </button>
              </div>
            )}

            {/* ===== Steps Phase ===== */}
            {phase === "steps" && (() => {
              const step = steps[currentStep];
              const isNumber = step.type === "number";
              return (
                <div>
                  {/* Progress */}
                  <div className="mb-2 flex items-center gap-1.5">
                    {steps.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-700 ${
                          i < currentStep ? "bg-accent" : i === currentStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 mb-6">שאלה {currentStep + 1} מתוך {steps.length}</p>

                  {/* Question Card */}
                  <div className={`rounded-2xl border p-5 mb-6 ${
                    step.iconColor === "destructive"
                      ? "border-destructive/20 bg-destructive/[0.03]"
                      : "border-primary/15 bg-primary/[0.02]"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        step.iconColor === "destructive"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {step.icon}
                      </div>
                      <div>
                        <h3 className="font-heading text-sm md:text-base font-bold text-foreground leading-relaxed">{step.question}</h3>
                        <p className="mt-1.5 text-[10px] md:text-xs text-muted-foreground leading-relaxed">{step.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  {!isNumber && step.options && (
                    <div className="space-y-2.5">
                      {step.options.map((opt) => {
                        const selected = answers[step.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleSelect(step.id, opt.value)}
                            className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-right transition-all duration-300 ${
                              selected
                                ? "border-primary/40 bg-primary/[0.06] shadow-[0_0_25px_hsl(217_72%_53%/0.06)]"
                                : "border-border/50 bg-muted/10 hover:bg-muted/25 hover:border-border"
                            }`}
                          >
                            <span className="text-lg mt-0.5">{opt.emoji}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                                {selected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                              </div>
                              <p className="text-[10px] md:text-xs text-muted-foreground mt-1 leading-relaxed">{opt.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Number input for lockout */}
                  {isNumber && (
                    <div className="space-y-4">
                      <div className="relative">
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">{step.prefix}</span>
                        <input
                          type="number"
                          value={answers[step.id] || ""}
                          onChange={(e) => handleSelect(step.id, e.target.value)}
                          placeholder={step.placeholder}
                          className="w-full rounded-2xl border border-destructive/20 bg-destructive/[0.03] py-5 pr-14 pl-5 text-3xl font-bold text-foreground text-center placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div className="rounded-xl border border-destructive/15 bg-destructive/[0.03] p-3 flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                          ברגע שתגיע לסכום הזה — <span className="text-destructive font-semibold">אני נועל הכל</span>. לא משנה מה תגיד לי. זה בשבילך.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="mt-8 flex items-center justify-between">
                    <button
                      onClick={prev}
                      disabled={currentStep === 0}
                      className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-medium text-muted-foreground transition-all hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                      הקודם
                    </button>
                    <button
                      onClick={next}
                      disabled={!canProceed()}
                      className="flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed"
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
                <div className="mx-auto mb-6 relative">
                  <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-accent/10 border border-accent/20 shadow-[0_0_30px_hsl(160_60%_45%/0.15)]">
                    <Heart className="h-10 w-10 text-accent" />
                  </div>
                </div>
                <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground">אני מבין אותך.</h2>
                <p className="mt-2 text-primary font-heading text-base font-semibold">מעכשיו, אתה לא לבד.</p>
                <div className="mt-6 mx-auto max-w-sm rounded-2xl border border-border/50 bg-muted/15 p-4">
                  <p className="text-xs text-muted-foreground leading-[1.8]">
                    כל המידע שנתת לי נשמר בצורה מאובטחת ומוצפנת. אני אשתמש בו רק כדי להגן עליך בזמן אמת.
                  </p>
                </div>
                <button
                  onClick={onComplete}
                  className="mt-8 inline-flex items-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-[0_4px_30px_hsl(217_72%_53%/0.3)] transition-all hover:shadow-[0_4px_40px_hsl(217_72%_53%/0.45)] hover:bg-primary/90 active:scale-[0.97]"
                >
                  <Sparkles className="h-4 w-4" />
                  בוא ניכנס הביתה
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
