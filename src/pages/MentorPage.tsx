import { useState, useRef, useEffect } from "react";
import {
  Mic, Send, Bot, Sparkles, Shield, Heart,
  Flame, AlertTriangle, Zap, Trophy, ChevronLeft,
} from "lucide-react";

/* ===== Types ===== */
interface Message {
  id: number;
  role: "ai" | "user";
  text: string;
  time: string;
}

/* ===== Tilt Pills ===== */
const tiltPills = [
  { text: "נקמה בשוק", icon: Flame, color: "destructive" as const, full: "בא לי לנקום בשוק" },
  { text: "שברתי חוקים", icon: AlertTriangle, color: "warning" as const, full: "שברתי את כל החוקים שלי" },
  { text: "FOMO מטורף", icon: Zap, color: "warning" as const, full: "אני בפומו מטורף" },
  { text: "חרדה מהשוק", icon: Heart, color: "info" as const, full: "אני מרגיש חרדה מהשוק" },
  { text: "לא מצליח לעצור", icon: Shield, color: "warning" as const, full: "אני לא מצליח לעצור לסחור" },
  { text: "מחקתי פראפ", icon: Trophy, color: "destructive" as const, full: "מחקתי אתגר פראפ" },
];

const pillColorMap = {
  destructive: {
    bg: "bg-destructive/6 hover:bg-destructive/12 border-destructive/12 hover:border-destructive/25",
    text: "text-destructive/70 group-hover:text-destructive",
    icon: "text-destructive/50",
  },
  warning: {
    bg: "bg-yellow-400/6 hover:bg-yellow-400/12 border-yellow-400/12 hover:border-yellow-400/25",
    text: "text-yellow-400/70 group-hover:text-yellow-400",
    icon: "text-yellow-400/50",
  },
  info: {
    bg: "bg-primary/6 hover:bg-primary/12 border-primary/12 hover:border-primary/25",
    text: "text-primary/70 group-hover:text-primary",
    icon: "text-primary/50",
  },
};

/* ===== AI Response Simulation ===== */
const aiResponses: Record<string, string> = {
  "בא לי לנקום בשוק": "אני שומע אותך. הרגש הזה — הרצון לתקן, להחזיר מה שהשוק לקח ממך — הוא אנושי לחלוטין. אבל בוא נעצור רגע ונשאל: האם העסקה הבאה שאתה מתכנן היא מהראש, או מהבטן?\n\nמסחר נקמה הוא הסיבה מספר 1 להפסדים מצטברים. הסטטיסטיקה שלך מראה שאחרי הפסד, ב-73% מהמקרים העסקה הבאה שלך גם הפסידה.\n\n**מה אני מציע:** קח הפסקה של 15 דקות. צא מהמסך. שתה מים. תחזור רק כשאתה יכול לנשום עמוק בלי לחשוב על הגרף.",
  "שברתי את כל החוקים שלי": "קודם כל — עצם זה שאתה אומר את זה בקול, שאתה מודע לזה, זה כבר צעד ענק. רוב הסוחרים ממשיכים בלי להודות.\n\nבוא נעשה סדר:\n1. **כמה חוקים נשברו היום?**\n2. **מה היה הטריגר?** — לחץ? שעמום? ניצחון קודם שנתן תחושת חוסר פגיעות?\n\nאני לא כאן כדי לשפוט. אני כאן כדי לעזור לך להבין את הדפוס, כי ברגע שתזהה אותו — תוכל לשבור אותו.",
  "אני בפומו מטורף": "FOMO — הפחד לפספס. זה אחד הרגשות הכי חזקים בשוק, ואתה לא לבד בזה.\n\nשאלה אחת: **האם יש לך סטאפ מוגדר לעסקה שאתה רוצה לפתוח?** אם התשובה היא לא, אתה לא מפספס כלום — אתה פשוט רואה תנועה ורוצה להיות חלק ממנה.\n\nהשוק פתוח מחר. ומחרתיים. וכל יום. ההזדמנות הבאה תבוא. אבל הכסף שתפסיד מכניסה בלי סטאפ? הוא לא חוזר.",
  "מחקתי אתגר פראפ": "אני יודע שזה מרגיש כמו סוף העולם. המון עבודה, זמן, כסף על האתגר — והכל נעלם.\n\nאבל תקשיב לי: **אתגר פראפ הוא לא הקריירה שלך.** זה כלי. אתה יכול לקנות עוד אחד. מה שאתה לא יכול לקנות זה את הביטחון העצמי שלך אם תמשיך להלקות את עצמך.\n\n**מה עכשיו?**\n- תנתח מה בדיוק קרה\n- תזהה את הרגע שבו איבדת שליטה\n- תבנה תוכנית חדשה עם גבולות יותר ברורים\n\nאני כאן אם אתה רוצה לעבור על זה ביחד.",
  "אני מרגיש חרדה מהשוק": "חרדה מהשוק היא תגובה נורמלית לסביבה של אי-ודאות. אתה שם כסף אמיתי על הקו — כמובן שזה מלחיץ.\n\nאבל יש הבדל בין **לחץ בריא** שמחדד אותך, לבין **חרדה משתקת** שגורמת לך לפחד מלפתוח עסקאות או להיכנס למצב של הקפאה.\n\n**תרגיל מהיר:** עצום עיניים. 4 שניות שאיפה, 4 שניות עצירה, 4 שניות נשיפה. חזור על זה 3 פעמים. אני ממתין כאן.",
  "אני לא מצליח לעצור לסחור": "Overtrading — סימן קלאסי לכך שאתה סוחר מרגש ולא מתוכנית.\n\nשאלות שעוזרות לי להבין:\n- **כמה עסקאות פתחת היום?**\n- **כמה מהן היו בתוכנית?**\n- **מה קורה כשאתה מנסה לסגור את המחשב?**\n\nאם אתה מרגיש שאתה לא יכול לעצור, זה לא חולשה — זה דפוס נוירולוגי שנבנה מחיפוש אחר דופמין. ואנחנו יכולים לשבור אותו.",
};

const defaultAiResponse = "אני שומע אותך. ספר לי עוד — אני כאן בשבילך, בלי שיפוט, בלי לחץ. כל מה שאתה אומר נשאר בינינו.";

const getTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

/* ===== Page Component ===== */
const MentorPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      text: "אני פה איתך. בלי פילטרים, בלי לשפוט.\n\nספר לי מה יושב עליך, או פשוט תלחץ על המיקרופון ותפרוק הכל. השוק לא יברח, אנחנו מנצחים את זה ביחד. 💙",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: text.trim(),
      time: getTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiText = aiResponses[text.trim()] || defaultAiResponse;
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        text: aiText,
        time: getTime(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] max-w-3xl mx-auto -mt-2 md:-mt-4">
      {/* ── Header ── */}
      <div className="shrink-0 px-1 pt-1 pb-4">
        <div className="relative rounded-2xl border border-border/20 bg-secondary/20 px-5 py-4 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-accent/[0.03] blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-base md:text-lg font-extrabold text-foreground tracking-tight">
                המנטור האישי שלך
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/70" />
                </span>
                <p className="text-[10px] md:text-[11px] text-muted-foreground/50 font-medium">
                  מרחב בטוח. נטול שיפוטיות. אני מקשיב
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div className="flex-1 overflow-y-auto px-1 space-y-3 scrollbar-none">
        {/* Ambient center glow */}
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-0">
          <div className="w-96 h-96 rounded-full bg-primary/[0.02] blur-[100px]" />
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"} relative z-10`}>
            {msg.role === "ai" && (
              <div className="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/8 border border-primary/10 mb-1">
                  <Sparkles className="h-3 w-3 text-primary/60" />
                </div>
                <div>
                  <div className="rounded-2xl rounded-br-md border border-border/15 bg-secondary/30 px-4 py-3">
                    {msg.text.split("\n").map((line, i) => {
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return <p key={i} className="text-[11px] md:text-xs font-bold text-foreground/90 mt-2 mb-1">{line.replace(/\*\*/g, "")}</p>;
                      }
                      if (line.startsWith("- ")) {
                        return <p key={i} className="text-[10px] md:text-[11px] text-muted-foreground/70 leading-[1.9] pr-3">• {line.slice(2)}</p>;
                      }
                      if (line.match(/^\d+\./)) {
                        return <p key={i} className="text-[10px] md:text-[11px] text-muted-foreground/70 leading-[1.9]">{line}</p>;
                      }
                      if (line === "") {
                        return <div key={i} className="h-2" />;
                      }
                      return <p key={i} className="text-[10px] md:text-[11px] text-muted-foreground/70 leading-[1.9]">{line}</p>;
                    })}
                  </div>
                  <p className="text-[8px] text-muted-foreground/25 mt-1 mr-2 font-medium">{msg.time}</p>
                </div>
              </div>
            )}

            {msg.role === "user" && (
              <div className="max-w-[80%] md:max-w-[70%]">
                <div className="rounded-2xl rounded-bl-md bg-primary/12 border border-primary/15 px-4 py-3">
                  <p className="text-[11px] md:text-xs text-foreground/85 leading-[1.8]">{msg.text}</p>
                </div>
                <p className="text-[8px] text-muted-foreground/25 mt-1 ml-2 text-left font-medium">{msg.time}</p>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-end relative z-10">
            <div className="flex items-end gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/8 border border-primary/10 mb-1">
                <Sparkles className="h-3 w-3 text-primary/60" />
              </div>
              <div className="rounded-2xl rounded-br-md border border-border/15 bg-secondary/30 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms`, animationDuration: "0.8s" }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-muted-foreground/30 mr-1">חושב...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Quick Actions Grid ── */}
      <div className="shrink-0 px-1 pt-3">
        <div className="grid grid-cols-3 gap-1.5">
          {tiltPills.map((pill, index) => {
            const colors = pillColorMap[pill.color];
            return (
              <button
                key={pill.text}
                onClick={() => sendMessage(pill.full)}
                className={`haptic-press group flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${colors.bg}`}
                style={{ animationDelay: `${index * 80}ms`, animationDuration: '400ms' }}
              >
                <pill.icon className={`h-3 w-3 shrink-0 ${colors.icon}`} />
                <span className={`text-[9px] md:text-[10px] font-semibold ${colors.text}`}>
                  {pill.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Input Area ── */}
      <div className="shrink-0 px-1 pb-2 pt-1">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2 rounded-2xl border border-border/25 bg-secondary/25 px-2 py-2">
          {/* Mic button */}
          <button
            type="button"
            onClick={() => setIsRecording(!isRecording)}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
              isRecording
                ? "bg-destructive/15 border border-destructive/25 text-destructive shadow-[0_0_20px_hsl(var(--destructive)/0.15)]"
                : "bg-primary/10 border border-primary/15 text-primary/60 hover:text-primary hover:bg-primary/15"
            }`}
          >
            <Mic className={`h-4 w-4 ${isRecording ? "animate-pulse" : ""}`} />
          </button>

          {/* Recording state */}
          {isRecording && (
            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-[10px] text-destructive/70 font-semibold">מקליט...</span>
              </div>
              <div className="flex-1 flex items-end gap-[1.5px] h-5">
                {Array.from({ length: 30 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-full bg-destructive/25 animate-pulse"
                    style={{
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 50}ms`,
                      animationDuration: "0.6s",
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRecording(false);
                  sendMessage("(הודעה קולית) אני מרגיש לחוץ היום מהשוק, הפסדתי שתי עסקאות ואני לא יודע אם להמשיך");
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/20 text-primary"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Text input */}
          {!isRecording && (
            <>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="דבר אליי, או הקלד כאן..."
                className="flex-1 bg-transparent text-[11px] md:text-xs text-foreground placeholder:text-muted-foreground/30 outline-none px-2 font-medium"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                  input.trim()
                    ? "bg-primary/15 border border-primary/25 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.1)]"
                    : "bg-muted/10 border border-border/15 text-muted-foreground/20"
                }`}
              >
                <Send className="h-3.5 w-3.5 rotate-180" />
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default MentorPage;
