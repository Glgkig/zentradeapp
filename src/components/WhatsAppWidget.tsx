import { useState, useRef, useEffect } from "react";
import { X, Send, Phone } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  time: string;
}

const now = () => new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

const initialMessages: Message[] = [
  { id: 1, text: "שלום! ברוכים הבאים ל-ZenTrade 👋", sender: "bot", time: now() },
  { id: 2, text: "איך נוכל לעזור לך היום עם מערכת המסחר שלנו?", sender: "bot", time: now() },
];

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now(), text, sender: "user", time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: "תודה על ההודעה! הצוות שלנו יחזור אליך בהקדם 🙏", sender: "bot", time: now() },
      ]);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-1 w-[340px] overflow-hidden rounded-2xl shadow-2xl border border-border/20 animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#075E54" }}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">ZenTrade Support</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[11px] text-green-200">Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-1 transition-colors hover:bg-white/20">
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex h-[300px] flex-col gap-2 overflow-y-auto p-4 scrollbar-none" style={{ backgroundColor: "#ECE5DD" }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-xl px-3 py-2 text-[13px] leading-relaxed shadow-sm ${
                    msg.sender === "bot"
                      ? "rounded-tl-sm bg-white text-gray-800"
                      : "rounded-tr-sm text-white"
                  }`}
                  style={msg.sender === "user" ? { backgroundColor: "#DCF8C6", color: "#1a1a1a" } : undefined}
                >
                  <p>{msg.text}</p>
                  <p className={`mt-1 text-[10px] text-end ${msg.sender === "bot" ? "text-gray-400" : "text-gray-500"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t bg-white px-3 py-2.5" style={{ borderColor: "#d1d5db" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="הקלד הודעה..."
              className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-[#25D366]/40"
              dir="rtl"
            />
            <button
              onClick={sendMessage}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
              style={{ backgroundColor: "#25D366" }}
            >
              <Send className="h-4 w-4 text-white -rotate-45" />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-transform duration-200 hover:scale-110"
        style={{ backgroundColor: "#25D366" }}
      >
        {/* Custom icon: speech bubble + phone */}
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <path d="M9.5 10.5 11 13l3-5" />
        </svg>
        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-md bg-card px-3 py-1 text-xs font-medium text-foreground shadow-lg border border-border opacity-0 transition-opacity group-hover:opacity-100">
          Support
        </span>
      </button>
    </div>
  );
};

export default WhatsAppWidget;
