import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, CheckCircle2, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/* ===== Types ===== */
type ChatMessage = {
  id: string;
  role: "bot" | "user";
  content: string;
  chips?: { label: string; value: string }[];
  multiSelect?: boolean;
  inputType?: "text" | "number" | "textarea";
  inputPlaceholder?: string;
};

type QuestionDef = {
  id: string;
  botMessage: string;
  chips?: { label: string; value: string }[];
  multiSelect?: boolean;
  inputType?: "text" | "number" | "textarea";
  inputPlaceholder?: string;
};

/* ===== Questions ===== */
const questions: QuestionDef[] = [
  {
    id: "name",
    botMessage: "היי! 👋 אני ZenTrade AI — השומר שלך בשוק.\n\nלפני שנתחיל, ספר לי — מה השם שלך?",
    inputType: "text",
    inputPlaceholder: "הקלד את שמך...",
  },
  {
    id: "experience",
    botMessage: "נעים מאוד! 🤝\n\nכמה ניסיון יש לך במסחר?",
    chips: [
      { label: "🌱 מתחיל", value: "beginner" },
      { label: "📊 פחות משנה", value: "<1year" },
      { label: "📈 1-3 שנים", value: "1-3years" },
      { label: "🏆 3+ שנים", value: "3+years" },
    ],
  },
  {
    id: "risk",
    botMessage: "מעולה. עכשיו בוא נדבר על ניהול סיכונים — זה הלב של הכל 💎\n\nכמה אחוז מההון שלך אתה מוכן לסכן בעסקה בודדת?",
    chips: [
      { label: "1%", value: "1%" },
      { label: "2%", value: "2%" },
      { label: "3%", value: "3%" },
      { label: "✏️ אחוז מותאם", value: "custom" },
    ],
  },
  {
    id: "capital",
    botMessage: "מהו גודל התיק שלך, או כמה הון אתה מוכן להשקיע? 💰",
    chips: [
      { label: "עד $1,000", value: "<1k" },
      { label: "$1,000 - $5,000", value: "1k-5k" },
      { label: "$5,000 - $25,000", value: "5k-25k" },
      { label: "$25,000 - $100,000", value: "25k-100k" },
      { label: "$100,000+", value: "100k+" },
    ],
  },
  {
    id: "methodology",
    botMessage: "איזה סגנון מסחר הולך לך? בחר כמה שמתאימים 🎯",
    multiSelect: true,
    chips: [
      { label: "Price Action", value: "price-action" },
      { label: "SMC", value: "smc" },
      { label: "Supply & Demand", value: "supply-demand" },
      { label: "Order Blocks", value: "order-blocks" },
      { label: "אינדיקטורים", value: "indicators" },
      { label: "Elliott Wave", value: "elliott-wave" },
      { label: "אחר", value: "other" },
    ],
  },
  {
    id: "assets",
    botMessage: "על מה אתה סוחר? בחר את הנכסים שלך 📊",
    multiSelect: true,
    chips: [
      { label: "🌍 Forex", value: "forex" },
      { label: "📊 מדדים", value: "indices" },
      { label: "📈 מניות", value: "stocks" },
      { label: "₿ קריפטו", value: "crypto" },
      { label: "🥇 סחורות/זהב", value: "commodities" },
    ],
  },
  {
    id: "goal",
    botMessage: "שאלה אחרונה — ואולי הכי חשובה 🔥\n\nמה המטרה הכי גדולה שלך, או מה האתגר שהכי שורף אותך עכשיו במסחר?",
    inputType: "textarea",
    inputPlaceholder: "ספר לי מה עובר עליך...",
  },
];

/* ===== Component ===== */
interface OnboardingModalProps {
  userName: string;
  onComplete: () => void;
}

const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const { updateProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQ, setCurrentQ] = useState(-1); // -1 = not started
  const [userProfile, setUserProfile] = useState<Record<string, string | string[]>>({});
  const [inputValue, setInputValue] = useState("");
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [completed, setCompleted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  };

  // Start onboarding
  useEffect(() => {
    if (currentQ === -1) {
      setTyping(true);
      setTimeout(() => {
        const q = questions[0];
        setMessages([{
          id: "q-0",
          role: "bot",
          content: q.botMessage,
          chips: q.chips,
          multiSelect: q.multiSelect,
          inputType: q.inputType,
          inputPlaceholder: q.inputPlaceholder,
        }]);
        setCurrentQ(0);
        setTyping(false);
        scrollToBottom();
      }, 800);
    }
  }, []);

  const advanceToNext = (answerDisplay: string, profileKey: string, profileValue: string | string[]) => {
    // Add user message
    const userMsg: ChatMessage = { id: `u-${currentQ}`, role: "user", content: answerDisplay };
    setMessages((prev) => [...prev, userMsg]);
    setUserProfile((prev) => ({ ...prev, [profileKey]: profileValue }));
    setInputValue("");
    setMultiSelected([]);
    scrollToBottom();

    const nextIdx = currentQ + 1;

    if (nextIdx >= questions.length) {
      // All done — show summary
      setTyping(true);
      scrollToBottom();
      setTimeout(() => {
        const name = userProfile.name || answerDisplay;
        const summaryMsg: ChatMessage = {
          id: "summary",
          role: "bot",
          content: `🎉 מושלם, ${typeof name === 'string' ? name : ''}!\n\nהפרופיל שלך מוכן. הנה הסיכום:\n\n✅ ניסיון: ${userProfile.experience || profileValue}\n✅ סיכון לעסקה: ${userProfile.risk || ''}\n✅ גודל תיק: ${userProfile.capital || ''}\n✅ סגנון מסחר: ${Array.isArray(userProfile.methodology) ? userProfile.methodology.join(', ') : userProfile.methodology || ''}\n✅ נכסים: ${Array.isArray(userProfile.assets) ? userProfile.assets.join(', ') : userProfile.assets || ''}\n\nאני כאן בשבילך — לשמור, לנתח, ולדאוג שלא תחרוג מהתוכנית 🛡️\n\nבוא נתחיל לעבוד!`,
        };
        setMessages((prev) => [...prev, summaryMsg]);
        setTyping(false);
        setCompleted(true);
        scrollToBottom();
      }, 1200);
      return;
    }

    // Next question
    setTyping(true);
    scrollToBottom();
    setTimeout(() => {
      const q = questions[nextIdx];
      const botMsg: ChatMessage = {
        id: `q-${nextIdx}`,
        role: "bot",
        content: q.botMessage,
        chips: q.chips,
        multiSelect: q.multiSelect,
        inputType: q.inputType,
        inputPlaceholder: q.inputPlaceholder,
      };
      setMessages((prev) => [...prev, botMsg]);
      setCurrentQ(nextIdx);
      setTyping(false);
      scrollToBottom();
    }, 900);
  };

  const handleChipClick = (value: string, label: string) => {
    const q = questions[currentQ];
    if (q.multiSelect) {
      setMultiSelected((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    } else {
      advanceToNext(label, q.id, value);
    }
  };

  const handleSubmitMulti = () => {
    if (multiSelected.length === 0) return;
    const q = questions[currentQ];
    const labels = multiSelected.map((v) => q.chips?.find((c) => c.value === v)?.label || v);
    advanceToNext(labels.join("، "), q.id, multiSelected);
  };

  const handleSubmitInput = () => {
    if (!inputValue.trim()) return;
    const q = questions[currentQ];
    advanceToNext(inputValue.trim(), q.id, inputValue.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitInput();
    }
  };

  // Find current active question for input UI
  const activeQ = currentQ >= 0 && currentQ < questions.length ? questions[currentQ] : null;
  const isLastBotMsg = (msgId: string) => {
    const botMsgs = messages.filter((m) => m.role === "bot");
    return botMsgs[botMsgs.length - 1]?.id === msgId;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 md:p-6" dir="rtl">
      <div className="absolute inset-0 bg-[hsl(var(--background)/0.95)] backdrop-blur-xl" />

      <div className="relative z-10 w-full max-w-xl h-[90vh] md:h-[85vh] flex flex-col animate-in zoom-in-95 fade-in duration-500">
        <div className="flex flex-col h-full rounded-xl border border-border/20 bg-card shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/10 bg-card/80 backdrop-blur-sm">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/15">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full bg-profit border-2 border-card" />
            </div>
            <div>
              <h2 className="font-heading text-sm font-bold text-foreground">ZenTrade AI</h2>
              <p className="text-2xs text-muted-foreground/50">בונה את הפרופיל שלך...</p>
            </div>
            <div className="mr-auto flex items-center gap-1 px-2 py-1 rounded-md bg-primary/5 border border-primary/10">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-2xs text-primary font-semibold">{Math.min(currentQ + 1, 7)}/7</span>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 md:px-4 py-4 space-y-3 scrollbar-none">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                {/* Avatar */}
                {msg.role === "bot" ? (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/8 border border-primary/10 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/20 border border-border/10 mt-0.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}

                {/* Bubble */}
                <div className={`max-w-[80%] ${msg.role === "user" ? "ml-auto" : ""}`}>
                  <div className={`rounded-xl px-3.5 py-2.5 text-[12px] leading-[1.8] whitespace-pre-line ${
                    msg.role === "bot"
                      ? "bg-muted/10 border border-border/10 text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}>
                    {msg.content}
                  </div>

                  {/* Chips (only on last bot msg) */}
                  {msg.role === "bot" && msg.chips && isLastBotMsg(msg.id) && !completed && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.chips.map((chip) => {
                        const selected = msg.multiSelect
                          ? multiSelected.includes(chip.value)
                          : false;
                        return (
                          <button
                            key={chip.value}
                            onClick={() => handleChipClick(chip.value, chip.label)}
                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium border transition-all active:scale-[0.96] ${
                              selected
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-border/15 bg-card hover:border-primary/20 hover:bg-primary/5 text-foreground"
                            }`}
                          >
                            {chip.label}
                            {selected && <CheckCircle2 className="h-3 w-3 text-primary" />}
                          </button>
                        );
                      })}
                      {msg.multiSelect && multiSelected.length > 0 && (
                        <button
                          onClick={handleSubmitMulti}
                          className="inline-flex items-center gap-1 rounded-lg px-4 py-1.5 text-[11px] font-bold bg-primary text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.96]"
                        >
                          <Send className="h-3 w-3" />
                          אישור ({multiSelected.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex gap-2 animate-in fade-in duration-300">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="rounded-xl bg-muted/10 border border-border/10 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border/10 bg-card/80 backdrop-blur-sm px-3 md:px-4 py-3">
            {completed ? (
              <button
                onClick={async () => {
                  // Map onboarding answers to profile fields
                  const experienceMap: Record<string, number> = { "beginner": 0, "<1year": 1, "1-3years": 2, "3+years": 4 };
                  const capitalMap: Record<string, number> = { "<1k": 500, "1k-5k": 3000, "5k-25k": 15000, "25k-100k": 62500, "100k+": 150000 };
                  const styleMap: Record<string, string> = { "price-action": "day_trading", "smc": "day_trading", "indicators": "swing" };
                  
                  const updates: Record<string, any> = {
                    onboarding_completed: true,
                  };
                  if (userProfile.name && typeof userProfile.name === "string") updates.full_name = userProfile.name;
                  if (userProfile.experience && typeof userProfile.experience === "string") updates.experience_years = experienceMap[userProfile.experience] ?? 1;
                  if (userProfile.capital && typeof userProfile.capital === "string") updates.account_size = capitalMap[userProfile.capital] ?? null;
                  if (userProfile.assets && Array.isArray(userProfile.assets)) updates.primary_instruments = userProfile.assets;
                  if (userProfile.goal && typeof userProfile.goal === "string") updates.goals = userProfile.goal;
                  if (userProfile.methodology && Array.isArray(userProfile.methodology)) {
                    updates.trading_style = styleMap[userProfile.methodology[0]] ?? "day_trading";
                  }

                  await updateProfile(updates);
                  onComplete();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-[13px] font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
              >
                <Sparkles className="h-4 w-4" />
                בוא נתחיל לעבוד!
              </button>
            ) : activeQ?.inputType === "text" || activeQ?.inputType === "textarea" ? (
              <div className="flex items-end gap-2">
                {activeQ.inputType === "textarea" ? (
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={activeQ.inputPlaceholder}
                    rows={2}
                    className="flex-1 resize-none rounded-lg border border-border/15 bg-muted/5 px-3 py-2.5 text-[12px] text-foreground placeholder:text-muted-foreground/25 focus:border-primary/30 focus:outline-none transition-all"
                  />
                ) : (
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={activeQ.inputPlaceholder}
                    autoFocus
                    className="flex-1 rounded-lg border border-border/15 bg-muted/5 px-3 py-2.5 text-[12px] text-foreground placeholder:text-muted-foreground/25 focus:border-primary/30 focus:outline-none transition-all"
                  />
                )}
                <button
                  onClick={handleSubmitInput}
                  disabled={!inputValue.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-20 transition-all hover:bg-primary/90 active:scale-[0.95]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            ) : activeQ?.inputType === "number" ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={activeQ.inputPlaceholder}
                  autoFocus
                  className="flex-1 rounded-lg border border-border/15 bg-muted/5 px-3 py-2.5 text-[12px] text-foreground placeholder:text-muted-foreground/25 focus:border-primary/30 focus:outline-none transition-all font-mono"
                />
                <button
                  onClick={handleSubmitInput}
                  disabled={!inputValue.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-20 transition-all hover:bg-primary/90 active:scale-[0.95]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-center text-2xs text-muted-foreground/30 py-1">בחר אחת מהאפשרויות למעלה ☝️</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
