import { useState, useRef, useEffect } from "react";
import { Mic, Send, Bot, Sparkles, Shield, Heart, Flame, AlertTriangle, Zap, Trophy, ChevronLeft } from "lucide-react";

interface Message { id: number; role: "ai" | "user"; text: string; time: string; }

const tiltPills = [
  { text: "נקמה בשוק", icon: Flame, color: "loss" as const, full: "בא לי לנקום בשוק" },
  { text: "שברתי חוקים", icon: AlertTriangle, color: "warn" as const, full: "שברתי את כל החוקים שלי" },
  { text: "FOMO מטורף", icon: Zap, color: "warn" as const, full: "אני בפומו מטורף" },
  { text: "חרדה מהשוק", icon: Heart, color: "info" as const, full: "אני מרגיש חרדה מהשוק" },
  { text: "לא מצליח לעצור", icon: Shield, color: "warn" as const, full: "אני לא מצליח לעצור לסחור" },
  { text: "מחקתי פראפ", icon: Trophy, color: "loss" as const, full: "מחקתי אתגר פראפ" },
];

const pillColors = {
  loss: { bg: "bg-loss/5 hover:bg-loss/10 border-loss/10", text: "text-loss/60 group-hover:text-loss", icon: "text-loss/40" },
  warn: { bg: "bg-yellow-400/5 hover:bg-yellow-400/10 border-yellow-400/10", text: "text-yellow-400/60 group-hover:text-yellow-400", icon: "text-yellow-400/40" },
  info: { bg: "bg-primary/5 hover:bg-primary/10 border-primary/10", text: "text-primary/60 group-hover:text-primary", icon: "text-primary/40" },
};

const aiResponses: Record<string, string> = {
  "בא לי לנקום בשוק": "אני שומע אותך. הרגש הזה אנושי. אבל בוא נעצור: האם העסקה הבאה מהראש, או מהבטן?\n\nהסטטיסטיקה שלך: אחרי הפסד, 73% מהעסקאות הבאות גם הפסידו.\n\n**מה אני מציע:** הפסקה של 15 דקות. צא מהמסך. חזור כשאתה נושם.",
  "שברתי את כל החוקים שלי": "עצם שאתה אומר את זה בקול — צעד ענק. רוב הסוחרים לא מודים.\n\n1. **כמה חוקים נשברו?**\n2. **מה הטריגר?**\n\nאני לא שופט. אני עוזר לך להבין את הדפוס.",
  "אני בפומו מטורף": "FOMO — פחד לפספס. שאלה: **יש לך סטאפ מוגדר?** אם לא — אתה לא מפספס כלום.\n\nהשוק פתוח מחר. הכסף שתפסיד מכניסה בלי סטאפ לא חוזר.",
  "מחקתי אתגר פראפ": "זה מרגיש כמו סוף העולם. אבל **אתגר פראפ הוא לא הקריירה שלך.** מה שחשוב:\n- נתח מה קרה\n- זהה את רגע אובדן השליטה\n- בנה תוכנית עם גבולות ברורים",
  "אני מרגיש חרדה מהשוק": "חרדה מהשוק = תגובה נורמלית. ההבדל: **לחץ בריא** vs **חרדה משתקת**.\n\n**תרגיל:** 4 שניות שאיפה, 4 עצירה, 4 נשיפה. חזור 3 פעמים. אני ממתין.",
  "אני לא מצליח לעצור לסחור": "Overtrading = סימן לסחר מרגש, לא מתוכנית.\n\n- כמה עסקאות היום?\n- כמה היו בתוכנית?\n\nזה דפוס נוירולוגי. אפשר לשבור אותו.",
};

const defaultAiResponse = "אני שומע אותך. ספר עוד — אני כאן, בלי שיפוט.";

const getTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const MentorPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "ai", text: "אני פה איתך. בלי פילטרים.\n\nספר לי מה עובר עליך, או לחץ על המיקרופון. השוק לא יברח.", time: getTime() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: text.trim(), time: getTime() }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "ai", text: aiResponses[text.trim()] || defaultAiResponse, time: getTime() }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 600);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-56px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="shrink-0 px-1 pt-1 pb-3">
        <div className="rounded-sm border border-border/10 bg-card px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-[-2px] rounded-sm bg-primary/6 ai-breathe" />
              <div className="relative flex h-8 w-8 items-center justify-center rounded-sm bg-primary/8 border border-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="font-heading text-[12px] font-bold text-foreground">המנטור האישי</h1>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary/60" />
                </span>
                <p className="text-2xs text-muted-foreground/40 font-mono">SAFE SPACE · NO JUDGMENT</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-1 space-y-2 scrollbar-none">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"} relative z-10`}>
            {msg.role === "ai" ? (
              <div className="flex items-end gap-1.5 max-w-[85%] md:max-w-[75%]">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-primary/6 border border-primary/8 mb-1">
                  <Sparkles className="h-2.5 w-2.5 text-primary/50" />
                </div>
                <div>
                  <div className="rounded-sm rounded-br-none border border-border/10 bg-card px-3 py-2">
                    {msg.text.split("\n").map((line, i) => {
                      if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="text-[10px] font-bold text-foreground/80 mt-1.5 mb-0.5">{line.replace(/\*\*/g, "")}</p>;
                      if (line.startsWith("- ")) return <p key={i} className="text-2xs text-muted-foreground/60 leading-[1.8] pr-2">• {line.slice(2)}</p>;
                      if (line.match(/^\d+\./)) return <p key={i} className="text-2xs text-muted-foreground/60 leading-[1.8]">{line}</p>;
                      if (line === "") return <div key={i} className="h-1.5" />;
                      return <p key={i} className="text-2xs text-muted-foreground/60 leading-[1.8]">{line}</p>;
                    })}
                  </div>
                  <p className="text-2xs text-muted-foreground/20 mt-0.5 mr-1 font-mono">{msg.time}</p>
                </div>
              </div>
            ) : (
              <div className="max-w-[80%] md:max-w-[70%]">
                <div className="rounded-sm rounded-bl-none bg-primary/8 border border-primary/10 px-3 py-2">
                  <p className="text-[10px] text-foreground/80 leading-[1.8]">{msg.text}</p>
                </div>
                <p className="text-2xs text-muted-foreground/20 mt-0.5 ml-1 text-left font-mono">{msg.time}</p>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-end relative z-10">
            <div className="flex items-end gap-1.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-primary/6 border border-primary/8 mb-1">
                <Sparkles className="h-2.5 w-2.5 text-primary/50" />
              </div>
              <div className="rounded-sm border border-border/10 bg-card px-3 py-2">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1 w-1 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: `${i * 150}ms`, animationDuration: "0.8s" }} />
                  ))}
                  <span className="text-2xs text-muted-foreground/20 mr-1 font-mono">...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Tilt Pills */}
      <div className="shrink-0 px-1 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
          {tiltPills.map((pill, index) => {
            const colors = pillColors[pill.color];
            return (
              <button
                key={pill.text}
                onClick={() => sendMessage(pill.full)}
                className={`haptic-press group flex items-center justify-center gap-1 rounded-sm border px-1.5 py-2 transition-all animate-in fade-in slide-in-from-bottom-1 fill-mode-both ${colors.bg}`}
                style={{ animationDelay: `${index * 60}ms`, animationDuration: '300ms' }}
              >
                <pill.icon className={`h-2.5 w-2.5 shrink-0 ${colors.icon}`} />
                <span className={`text-2xs font-semibold ${colors.text}`}>{pill.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 px-1 pb-1.5 pt-1.5">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="relative flex items-center gap-2 rounded-sm border border-border/10 bg-card px-2.5 py-2 focus-within:border-primary/15 transition-all"
        >
          <button
            type="button"
            onClick={() => setIsRecording(!isRecording)}
            className={`haptic-press flex h-8 w-8 shrink-0 items-center justify-center rounded-sm transition-all ${
              isRecording
                ? "bg-loss/10 border border-loss/20 text-loss"
                : "bg-muted/10 border border-border/10 text-muted-foreground/30 hover:text-primary hover:bg-primary/8 hover:border-primary/15"
            }`}
          >
            <Mic className={`h-3.5 w-3.5 ${isRecording ? "animate-pulse" : ""}`} />
          </button>

          {isRecording ? (
            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-1 shrink-0">
                <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                <span className="text-2xs text-primary font-mono font-semibold">0:04</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-[1.5px] h-6">
                {Array.from({ length: 35 }, (_, i) => (
                  <div key={i} className="w-[1.5px] rounded-full bg-primary/40" style={{ height: `${15 + Math.sin(i * 0.8) * 40 + Math.random() * 30}%`, animation: `waveform ${0.4 + Math.random() * 0.3}s ease-in-out ${i * 25}ms infinite alternate` }} />
                ))}
              </div>
              <button type="button" onClick={() => { setIsRecording(false); sendMessage("(קולי) אני מרגיש לחוץ, הפסדתי שתי עסקאות"); }}
                className="haptic-press flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-primary/10 border border-primary/15 text-primary">
                <Send className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <>
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="ספר לי מה עובר עליך..."
                className="flex-1 bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground/20 outline-none px-1 font-medium"
              />
              <button type="submit" disabled={!input.trim()}
                className={`haptic-press flex h-8 w-8 shrink-0 items-center justify-center rounded-sm transition-all ${
                  input.trim() ? "bg-primary/10 border border-primary/20 text-primary" : "bg-muted/5 border border-border/6 text-muted-foreground/10 cursor-not-allowed"
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
