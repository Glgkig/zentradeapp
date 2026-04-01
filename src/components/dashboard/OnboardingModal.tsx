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
    icon: <Flame className="h-4 w-4" />, iconColor: "destructive",
    options: [
      { value: "revenge", label: "מסחר נקמה", desc: "נכנס לעסקה כדי 'להחזיר' הפסד", emoji: "🔥" },
      { value: "fomo", label: "פומו וכניסה מוקדמת", desc: "רואה נר ירוק וקופץ בלי אישור", emoji: "⚡" },
      { value: "stoploss", label: "הזזת סטופ-לוס", desc: "מרחיק את הסטופ ומפסיד יותר", emoji: "📉" },
      { value: "overlev", label: "מינוף יתר", desc: "נכנס בגדול כי 'הפעם אני בטוח'", emoji: "💣" },
    ],
  },
  {
    id: "propfail",
    question: "כמה פעמים נכשלת באתגר פראפ בגלל חוסר משמעת?",
    subtitle: "לא בגלל אסטרטגיה — בגלל הראש.",
    icon: <Target className="h-4 w-4" />, iconColor: "primary",
    options: [
      { value: "0", label: "אף פעם", desc: "עדיין לא ניסיתי או עברתי", emoji: "✅" },
      { value: "1-3", label: "1-3 פעמים", desc: "כואב, אבל לומד", emoji: "😤" },
      { value: "4-10", label: "4-10 פעמים", desc: "הבנתי שהבעיה זה לא הסטרטגיה", emoji: "😞" },
      { value: "lost_count", label: "הפסקתי לספור", desc: "...וזו בדיוק הסיבה שאתה פה", emoji: "💔" },
    ],
  },
  {
    id: "reaction",
    question: "איך אתה מגיב אחרי הפסד כואב?",
    subtitle: "התגובה שלך אחרי הפסד קובעת אם תשרוד.",
    icon: <Brain className="h-4 w-4" />, iconColor: "primary",
    options: [
      { value: "jump", label: "קופץ מיד לעסקה", desc: "חייב להחזיר את הכסף עכשיו", emoji: "🏃" },
      { value: "freeze", label: "קופא מול המסך", desc: "מפחד לגעת, הלב דופק", emoji: "🧊" },
      { value: "double", label: "מכפיל כמות", desc: "מגדיל פוזיציה כי 'זו ההזדמנות'", emoji: "💀" },
    ],
  },
  {
    id: "lockout",
    question: "מהו סכום ההפסד היומי שבו אנעל לך הכל?",
    subtitle: "זה קו האדום. ברגע שתגיע — אני נועל. בלי פשרות.",
    icon: <Lock className="h-4 w-4" />, iconColor: "destructive",
    type: "number", placeholder: "300", prefix: "$",
  },
];

interface OnboardingModalProps { userName: string; onComplete: () => void; }

const OnboardingModal = ({ userName, onComplete }: OnboardingModalProps) => {
  const [phase, setPhase] = useState<"greeting" | "steps" | "done">("greeting");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = (stepId: string, value: string) => setAnswers({ ...answers, [stepId]: value });
  const canProceed = () => !!answers[steps[currentStep].id];
  const next = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1); else setPhase("done"); };
  const prev = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6" dir="rtl">
      <div className="absolute inset-0 bg-[#050508]/90 backdrop-blur-xl" />

      <div className="relative z-10 w-full max-w-lg max-h-[94vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-500">
        <div className="rounded-sm border border-border/30 bg-card shadow-2xl overflow-hidden">
          <div className="h-px w-full bg-gradient-to-l from-primary via-primary/50 to-primary" />

          <div className="p-5 md:p-6">
            {/* Greeting */}
            {phase === "greeting" && (
              <div className="text-center py-4">
                <div className="mx-auto mb-6 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-primary/8 animate-ping" style={{ animationDuration: "3s" }} />
                  </div>
                  <div className="relative flex h-20 w-20 mx-auto items-center justify-center rounded-sm bg-primary/10 border border-primary/15">
                    <Bot className="h-10 w-10 text-primary" />
                  </div>
                </div>

                <h2 className="font-heading text-lg md:text-xl font-bold text-foreground">
                  ברוך הבא הביתה,
                  <br />
                  <span className="text-primary">{userName}</span>.
                </h2>

                <div className="mt-5 mx-auto max-w-sm rounded-sm border border-border/15 bg-muted/10 p-4">
                  <p className="text-[11px] leading-[1.9] text-muted-foreground">
                    לפני שנתחיל, אני צריך
                    <span className="text-primary font-medium"> להכיר את השדים שלך </span>
                    כדי להגן עליך מפניהם.
                  </p>
                </div>

                <button
                  onClick={() => setPhase("steps")}
                  className="mt-6 inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-[12px] font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  אני מוכן. נתחיל.
                </button>
              </div>
            )}

            {/* Steps */}
            {phase === "steps" && (() => {
              const step = steps[currentStep];
              const isNumber = step.type === "number";
              return (
                <div>
                  <div className="mb-1.5 flex items-center gap-1">
                    {steps.map((_, i) => (
                      <div key={i} className={`h-0.5 flex-1 rounded-sm transition-all ${i < currentStep ? "bg-profit" : i === currentStep ? "bg-primary" : "bg-muted/20"}`} />
                    ))}
                  </div>
                  <p className="text-2xs text-muted-foreground/30 mb-4 font-mono">{currentStep + 1}/{steps.length}</p>

                  <div className={`rounded-sm border p-3 mb-4 ${step.iconColor === "destructive" ? "border-loss/15 bg-loss/[0.02]" : "border-primary/10 bg-primary/[0.02]"}`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${step.iconColor === "destructive" ? "bg-loss/8 text-loss" : "bg-primary/8 text-primary"}`}>
                        {step.icon}
                      </div>
                      <div>
                        <h3 className="font-heading text-[12px] md:text-[13px] font-bold text-foreground leading-relaxed">{step.question}</h3>
                        <p className="mt-1 text-2xs text-muted-foreground/50 leading-relaxed">{step.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  {!isNumber && step.options && (
                    <div className="space-y-1.5">
                      {step.options.map((opt) => {
                        const selected = answers[step.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleSelect(step.id, opt.value)}
                            className={`flex w-full items-start gap-2.5 rounded-sm border p-3 text-right transition-all ${
                              selected ? "border-primary/25 bg-primary/[0.04]" : "border-border/10 bg-muted/5 hover:bg-muted/10 hover:border-border/20"
                            }`}
                          >
                            <span className="text-sm mt-0.5">{opt.emoji}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="text-[11px] font-semibold text-foreground">{opt.label}</p>
                                {selected && <CheckCircle2 className="h-3 w-3 text-primary" />}
                              </div>
                              <p className="text-2xs text-muted-foreground/50 mt-0.5 leading-relaxed">{opt.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {isNumber && (
                    <div className="space-y-3">
                      <div className="relative">
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-primary font-mono">{step.prefix}</span>
                        <input
                          type="number"
                          value={answers[step.id] || ""}
                          onChange={(e) => handleSelect(step.id, e.target.value)}
                          placeholder={step.placeholder}
                          className="w-full rounded-sm border border-loss/15 bg-loss/[0.02] py-4 pr-12 pl-4 text-2xl font-bold text-foreground text-center font-mono placeholder:text-muted-foreground/15 focus:border-primary focus:outline-none transition-all"
                        />
                      </div>
                      <div className="rounded-sm border border-loss/10 bg-loss/[0.02] p-2.5 flex items-start gap-2">
                        <ShieldAlert className="h-3.5 w-3.5 text-loss shrink-0 mt-0.5" />
                        <p className="text-2xs text-muted-foreground/50 leading-relaxed">
                          ברגע שתגיע לסכום — <span className="text-loss font-semibold">אני נועל הכל</span>. זה בשבילך.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <button onClick={prev} disabled={currentStep === 0} className="flex items-center gap-1 rounded-sm px-3 py-2 text-[11px] font-medium text-muted-foreground/50 hover:text-foreground disabled:opacity-15 transition-all">
                      <ChevronRight className="h-3 w-3" />
                      הקודם
                    </button>
                    <button onClick={next} disabled={!canProceed()} className="flex items-center gap-1.5 rounded-sm bg-primary px-5 py-2.5 text-[11px] font-bold text-primary-foreground disabled:opacity-20 transition-all hover:bg-primary/90 active:scale-[0.97]">
                      {currentStep === steps.length - 1 ? "סיים" : "הבא"}
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Done */}
            {phase === "done" && (
              <div className="text-center py-5">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-sm bg-profit/8 border border-profit/15 mb-4">
                  <Heart className="h-8 w-8 text-profit" />
                </div>
                <h2 className="font-heading text-lg font-bold text-foreground">אני מבין אותך.</h2>
                <p className="mt-1.5 text-primary font-heading text-[13px] font-semibold">מעכשיו, אתה לא לבד.</p>
                <div className="mt-4 mx-auto max-w-sm rounded-sm border border-border/10 bg-muted/8 p-3">
                  <p className="text-2xs text-muted-foreground/50 leading-[1.8]">
                    המידע נשמר בצורה מוצפנת. ישמש רק להגנה עליך בזמן אמת.
                  </p>
                </div>
                <button
                  onClick={onComplete}
                  className="mt-6 inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-[12px] font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  בוא ניכנס
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
