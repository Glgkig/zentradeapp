import { useState, useRef, useEffect } from "react";
import { X, Send, Phone, Video } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  time: string;
}

const now = () => new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

const initialMessages: Message[] = [
  { id: 1, text: "שלום! ברוכים הבאים ל-ZenTrade 👋", sender: "bot", time: now() },
  { id: 2, text: "איך נוכל לעזור לך היום?", sender: "bot", time: now() },
];

const WA_GREEN = "#25D366";
const WA_TEAL = "#128C7E";
const WA_BG = "#ECE5DD";
const WA_SENT = "#DCF8C6";

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getAutoReply = (text: string): string => {
    const t = text.toLowerCase();
    if (t.match(/שלום|היי|הי|בוקר|ערב|צהריים/)) return "שלום! 😊 איך אני יכול לעזור לך היום?";
    if (t.match(/מנוי|pro|פרו|תשלום|מחיר|עלות|לשלם|subscription/)) return "לשדרוג ל-PRO ניתן ללחוץ על 'שדרג PRO' בתפריט, או לגשת לדף התמחור. יש לך שאלות נוספות על התוכניות?";
    if (t.match(/לא עובד|בעיה|שגיאה|error|bug|קרס|נתקע/)) return "אני מצטער לשמוע! 🙏 תוכל לתאר בדיוק מה קרה? איזה דף/פיצ'ר לא עובד? נסה גם לרענן את הדף (F5) ולבדוק את החיבור לאינטרנט.";
    if (t.match(/סיסמה|שכחתי|התחברות|login|כניסה|נכנס/)) return "לאיפוס סיסמה — לחץ על 'שכחתי סיסמה' בעמוד ההתחברות ותקבל מייל לאיפוס. אם המייל לא מגיע, בדוק בתיקיית הספאם.";
    if (t.match(/יומן|עסקה|להוסיף|trade|מסחר/)) return "להוספת עסקה — לחץ על כפתור '+' בפינה הימנית העליונה בכל מסך. מלא את הפרטים ולחץ שמור. אפשר גם לייבא עסקאות מ-MT4/MT5 אוטומטית.";
    if (t.match(/מנטור|ai|בינה|צ'אט|chat/)) return "המנטור AI זמין בתפריט הצד תחת 'מנטור AI'. הוא מנתח את המסחר שלך ונותן עצות בזמן אמת. זמין למנויי PRO.";
    if (t.match(/ברוקר|mt4|mt5|חיבור|connect/)) return "לחיבור ברוקר — לחץ על אייקון הפלאג בסרגל העליון ובחר את הפלטפורמה שלך (MT4/MT5). תצטרך שם שרת, מספר חשבון וסיסמה.";
    if (t.match(/סטטיסטיק|ניתוח|גרף|דוח|report|stats/)) return "הסטטיסטיקות זמינות בתפריט תחת 'סטטיסטיקות'. שם תמצא ניתוח מלא של ביצועיך — Win Rate, P&L, Drawdown ועוד.";
    if (t.match(/מס|tax|רשות המסים|מחשבון/)) return "מחשבון המס נמצא בתפריט תחת 'מחשבון מס'. הוא מחשב אוטומטית את המס על רווחי ההון שלך לפי חוק ישראלי (25%).";
    if (t.match(/תודה|תודות|מעולה|נהדר|סבבה|כיף/)) return "בשמחה! 😊 אם צריך עוד עזרה, אנחנו כאן. בהצלחה במסחר! 🚀";
    if (t.match(/טלפון|לדבר|לשוחח|אנושי|נציג/)) return "כרגע השירות הוא דיגיטלי בלבד. אם הבעיה דחופה או מורכבת — שלח את הפרטים כאן ונחזור אליך בהקדם.";
    return "תודה על פנייתך! 🙏 הצוות שלנו ייצור איתך קשר בהקדם. אם מדובר בבעיה דחופה, תאר אותה בפירוט ונטפל מיד.";
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now(), text, sender: "user", time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: getAutoReply(text), sender: "bot", time: now() },
      ]);
    }, 1200 + Math.random() * 600);
  };

  return (
    <div className="fixed bottom-6 left-4 z-[99] flex flex-col items-start gap-3" dir="rtl">

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          className="mb-1 w-[320px] sm:w-[360px] flex flex-col overflow-hidden rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300"
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-3 py-2.5" style={{ backgroundColor: WA_TEAL }}>
            {/* Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: WA_GREEN }}>
              <svg viewBox="0 0 32 32" className="h-6 w-6" fill="white">
                <path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.65 4.87 1.9 6.99L2 30l7.22-1.88A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.82-1.59l-.42-.25-4.29 1.12 1.15-4.17-.27-.44A11.44 11.44 0 0 1 4.5 16C4.5 9.6 9.6 4.5 16 4.5S27.5 9.6 27.5 16 22.4 27.5 16 27.5zm6.27-8.56c-.34-.17-2.02-1-2.34-1.11-.32-.11-.55-.17-.78.17-.23.34-.9 1.11-1.1 1.34-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.7-2.01-1.9-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.78-1.88-1.07-2.58-.28-.68-.57-.59-.78-.6h-.66c-.23 0-.6.09-.91.43-.31.34-1.2 1.17-1.2 2.85s1.22 3.3 1.39 3.53c.17.23 2.4 3.67 5.82 5.14.81.35 1.45.56 1.94.72.82.26 1.56.22 2.15.13.65-.1 2.02-.83 2.3-1.63.29-.8.29-1.49.2-1.63-.08-.14-.31-.23-.65-.4z"/>
              </svg>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white leading-none">ZenTrade Support</p>
              <p className="text-[11px] text-white/70 mt-0.5">Online</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                <Video className="h-4 w-4 text-white/80" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                <Phone className="h-4 w-4 text-white/80" />
              </button>
              <button onClick={() => setIsOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                <X className="h-4 w-4 text-white/80" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-3 scrollbar-none"
            style={{
              backgroundColor: WA_BG,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b2beba' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              minHeight: "280px",
              maxHeight: "320px",
            }}
          >
            {/* Date chip */}
            <div className="flex justify-center my-1">
              <span className="rounded-lg px-3 py-1 text-[10px] font-medium text-gray-600" style={{ backgroundColor: "#D9F2E6" }}>
                היום
              </span>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-start" : "justify-end"}`}>
                <div
                  className="max-w-[78%] rounded-lg px-3 py-1.5 shadow-sm"
                  style={{
                    backgroundColor: msg.sender === "bot" ? "#ffffff" : WA_SENT,
                    borderRadius: msg.sender === "bot" ? "0px 8px 8px 8px" : "8px 0px 8px 8px",
                  }}
                >
                  <p className="text-[13px] text-gray-800 leading-relaxed">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span className="text-[10px] text-gray-400">{msg.time}</span>
                    {msg.sender === "user" && (
                      <svg viewBox="0 0 16 11" className="h-2.5 w-4" fill="none">
                        <path d="M1 5.5L4.5 9L10 1" stroke="#53bdeb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 5.5L9.5 9L15 1" stroke="#53bdeb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-end">
                <div className="rounded-lg px-3 py-2 shadow-sm" style={{ backgroundColor: "#fff", borderRadius: "0px 8px 8px 8px" }}>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: "#90a4ae",
                          animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Bar */}
          <div className="flex items-center gap-2 px-2 py-2" style={{ backgroundColor: WA_BG, borderTop: "1px solid #ccc" }}>
            <div className="flex flex-1 items-center rounded-full bg-white px-4 py-2 shadow-sm">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="הקלד הודעה"
                className="flex-1 bg-transparent text-[13px] text-gray-800 placeholder:text-gray-400 outline-none"
                dir="rtl"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: input.trim() ? WA_GREEN : WA_TEAL }}
            >
              <Send className="h-4 w-4 text-white" style={{ transform: "rotate(180deg)" }} />
            </button>
          </div>
        </div>
      )}

      {/* ── FAB ── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-200 hover:scale-110"
        style={{ backgroundColor: WA_GREEN, boxShadow: "0 4px 20px rgba(37,211,102,0.4)" }}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <svg viewBox="0 0 32 32" className="h-7 w-7" fill="white">
            <path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.65 4.87 1.9 6.99L2 30l7.22-1.88A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.82-1.59l-.42-.25-4.29 1.12 1.15-4.17-.27-.44A11.44 11.44 0 0 1 4.5 16C4.5 9.6 9.6 4.5 16 4.5S27.5 9.6 27.5 16 22.4 27.5 16 27.5zm6.27-8.56c-.34-.17-2.02-1-2.34-1.11-.32-.11-.55-.17-.78.17-.23.34-.9 1.11-1.1 1.34-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.7-2.01-1.9-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.78-1.88-1.07-2.58-.28-.68-.57-.59-.78-.6h-.66c-.23 0-.6.09-.91.43-.31.34-1.2 1.17-1.2 2.85s1.22 3.3 1.39 3.53c.17.23 2.4 3.67 5.82 5.14.81.35 1.45.56 1.94.72.82.26 1.56.22 2.15.13.65-.1 2.02-.83 2.3-1.63.29-.8.29-1.49.2-1.63-.08-.14-.31-.23-.65-.4z"/>
          </svg>
        )}
        {/* Unread badge */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">1</span>
        )}
      </button>
    </div>
  );
};

export default WhatsAppWidget;
