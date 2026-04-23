import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic, MicOff, Send, Bot, Sparkles, Shield, Heart, Flame,
  AlertTriangle, Zap, Trophy, Loader2, MessageCircle, Dumbbell,
  HelpCircle, TrendingDown, RotateCcw, Wind, Terminal, ChevronRight,
  TrendingUp, BarChart2, Brain, Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface Message {
  id: number;
  role: "assistant" | "user";
  content: string;
  time: string;
  widget?: WidgetData;
}

interface WidgetData {
  type: "trade_analysis" | "insight" | "warning";
  title: string;
  items: { label: string; value: string; color?: string }[];
}

type RecordingState = "idle" | "recording" | "processing";
type MoodLevel = "calm" | "stressed" | "tilt";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
═══════════════════════════════════════════════════════════ */
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-ai-chat`;

const TILT_KEYWORDS = ["נקמה", "מחקתי", "הפסדתי הכל", "כועס", "עצבני", "מרוסק", "הרגתי", "תיק", "מרגיש רע מאוד", "לא שווה"];
const STRESS_KEYWORDS = ["לחץ", "פחד", "חרד", "fomo", "פומו", "דאגה", "מפחד", "לא יודע", "שברתי", "overtrade", "אובר"];

function detectMood(messages: Message[]): MoodLevel {
  const text = messages.filter(m => m.role === "user").slice(-5).map(m => m.content.toLowerCase()).join(" ");
  if (TILT_KEYWORDS.some(k => text.includes(k.toLowerCase()))) return "tilt";
  if (STRESS_KEYWORDS.some(k => text.includes(k.toLowerCase()))) return "stressed";
  return "calm";
}

const moodConfig = {
  calm:     { label: "רגוע",        dot: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.18)" },
  stressed: { label: "עם לחץ",      dot: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.18)" },
  tilt:     { label: "⚠ TILT זהירות", dot: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.18)" },
};

const getTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 6) return "NIGHT SESSION";
  if (h < 12) return "MORNING BRIEF";
  if (h < 17) return "MIDDAY CHECK";
  if (h < 21) return "EVENING REVIEW";
  return "NIGHT WATCH";
};

function getQuickReplies(messages: Message[]) {
  const last = messages.filter(m => m.role === "user").slice(-3).map(m => m.content.toLowerCase()).join(" ");
  if (last.includes("הפסד") || last.includes("מחקתי") || last.includes("ירד")) return QUICK_REPLIES_LOSS;
  if (last.includes("fomo") || last.includes("פומו")) return QUICK_REPLIES_FOMO;
  return QUICK_REPLIES_DEFAULT;
}

const QUICK_REPLIES_DEFAULT = [
  { text: "ספר לי יותר", icon: MessageCircle },
  { text: "מה אני צריך לעשות עכשיו?", icon: HelpCircle },
  { text: "תן לי תרגיל מעשי", icon: Dumbbell },
];
const QUICK_REPLIES_LOSS = [
  { text: "איך אני מתאושש?", icon: RotateCcw },
  { text: "מה הייתי צריך לעשות אחרת?", icon: TrendingDown },
  { text: "תעזור לי לנתח את ההפסד", icon: HelpCircle },
];
const QUICK_REPLIES_FOMO = [
  { text: "איך מתמודדים עם FOMO?", icon: Wind },
  { text: "תן לי טכניקה להירגע", icon: Heart },
  { text: "מה הסיכון אם אכנס עכשיו?", icon: AlertTriangle },
];

/* ═══════════════════════════════════════════════════════════
   COMMAND CHIPS  (replace tilt pills)
═══════════════════════════════════════════════════════════ */
const COMMAND_CHIPS = [
  { text: "נתח את ה-Tilt שלי", icon: Activity, color: "#60a5fa", border: "rgba(59,130,246,0.2)", bg: "rgba(59,130,246,0.07)", full: "תנתח את דפוסי ה-Tilt שלי ותגיד לי מה הטריגרים הכי נפוצים" },
  { text: "סקור עסקת XAUUSD אחרונה", icon: BarChart2, color: "#60a5fa", border: "rgba(59,130,246,0.2)", bg: "rgba(59,130,246,0.07)", full: "תסקור את עסקת ה-XAUUSD האחרונה שלי וספר לי מה הייתי יכול לעשות טוב יותר" },
  { text: "נקמה בשוק", icon: Flame, color: "#f87171", border: "rgba(239,68,68,0.2)", bg: "rgba(239,68,68,0.06)", full: "בא לי לנקום בשוק אחרי הפסד" },
  { text: "שברתי חוקים", icon: AlertTriangle, color: "#fbbf24", border: "rgba(251,191,36,0.2)", bg: "rgba(251,191,36,0.06)", full: "שברתי את כל החוקים שלי היום" },
  { text: "FOMO מטורף", icon: Zap, color: "#fbbf24", border: "rgba(251,191,36,0.2)", bg: "rgba(251,191,36,0.06)", full: "אני בפומו מטורף, רואה הכל עולה בלעדיי" },
  { text: "לא מצליח לעצור", icon: Shield, color: "#fbbf24", border: "rgba(251,191,36,0.2)", bg: "rgba(251,191,36,0.06)", full: "אני לא מצליח לעצור לסחור, עושה אובר-טריידינג" },
  { text: "מחקתי פראפ", icon: Trophy, color: "#f87171", border: "rgba(239,68,68,0.2)", bg: "rgba(239,68,68,0.06)", full: "מחקתי אתגר פראפ, אני מרגיש מרוסק" },
  { text: "תסביר Win Rate", icon: Brain, color: "#60a5fa", border: "rgba(59,130,246,0.2)", bg: "rgba(59,130,246,0.07)", full: "הסבר לי בפירוט מה ה-Win Rate שלי אומר ואיך לשפר אותו" },
];

/* ═══════════════════════════════════════════════════════════
   THINKING PULSE
═══════════════════════════════════════════════════════════ */
const ThinkingPulse = () => (
  <div className="flex items-center gap-3 py-2 px-1" dir="ltr">
    <div className="relative flex h-7 w-7 shrink-0 items-center justify-center">
      <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "#3b82f6" }} />
      <div className="absolute inset-[3px] rounded-full animate-ping opacity-30" style={{ background: "#3b82f6", animationDelay: "0.3s" }} />
      <div className="relative h-3 w-3 rounded-full" style={{ background: "#3b82f6", boxShadow: "0 0 12px rgba(59,130,246,0.8)" }} />
    </div>
    <div className="flex items-end gap-[2px] h-5">
      {Array.from({ length: 24 }, (_, i) => (
        <div key={i}
          className="w-[2px] rounded-full"
          style={{
            background: `rgba(59,130,246,${0.3 + Math.sin(i * 0.5) * 0.3})`,
            height: `${20 + Math.sin(i * 0.7) * 60}%`,
            animation: `waveform ${0.5 + (i % 3) * 0.15}s ease-in-out ${i * 40}ms infinite alternate`,
            boxShadow: i % 4 === 0 ? "0 0 4px rgba(59,130,246,0.5)" : undefined,
          }} />
      ))}
    </div>
    <span className="text-[9px] font-mono text-blue-400/40 uppercase tracking-widest">ANALYZING</span>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   GLASS WIDGET (bento card injected into AI responses)
═══════════════════════════════════════════════════════════ */
const GlassWidget = ({ widget }: { widget: WidgetData }) => {
  const icons = { trade_analysis: BarChart2, insight: Brain, warning: AlertTriangle };
  const Icon = icons[widget.type];
  const borderColor = widget.type === "warning" ? "rgba(239,68,68,0.2)" : "rgba(59,130,246,0.18)";
  const bgColor = widget.type === "warning" ? "rgba(239,68,68,0.05)" : "rgba(59,130,246,0.05)";
  const iconColor = widget.type === "warning" ? "#f87171" : "#60a5fa";

  return (
    <div className="mt-3 rounded-xl overflow-hidden"
      style={{ border: `1px solid ${borderColor}`, background: bgColor, boxShadow: `0 0 20px ${bgColor}` }}>
      {/* Widget header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor }}>
        <Icon className="h-3 w-3 shrink-0" style={{ color: iconColor }} />
        <span className="text-[9px] font-black font-mono uppercase tracking-widest" style={{ color: iconColor }}>{widget.title}</span>
      </div>
      {/* Data grid */}
      <div className={cn("grid gap-[1px]", widget.items.length <= 2 ? "grid-cols-2" : widget.items.length <= 3 ? "grid-cols-3" : "grid-cols-2")}
        style={{ background: borderColor }}>
        {widget.items.map((item, i) => (
          <div key={i} className="px-3 py-2.5 flex flex-col mentor-panel"
            style={{ background: "rgba(0,0,0,0.7)" }}>
            <span className="text-[8px] font-mono text-white/25 uppercase tracking-widest mb-0.5">{item.label}</span>
            <span className="text-[13px] font-black font-mono" style={{ color: item.color || "rgba(255,255,255,0.8)" }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   TERMINAL MESSAGE ROW
═══════════════════════════════════════════════════════════ */
const TerminalMessage = ({ msg, isLast }: { msg: Message; isLast: boolean }) => {
  const isUser = msg.role === "user";

  return (
    <div className={cn("relative", !isLast && "border-b")} style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      {/* Left accent bar */}
      <div className="absolute top-0 bottom-0 right-0 w-[2px] rounded-r"
        style={{
          background: isUser
            ? "linear-gradient(to bottom, rgba(59,130,246,0.6), rgba(59,130,246,0.15))"
            : "linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)",
          boxShadow: isUser ? "0 0 8px rgba(59,130,246,0.4)" : undefined,
        }} />

      <div className="px-4 pr-6 py-4">
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-2" dir="ltr">
          <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>{msg.time}</span>
          <span className="text-[9px] font-black font-mono tracking-widest"
            style={{ color: isUser ? "#60a5fa" : "rgba(255,255,255,0.35)" }}>
            {isUser ? "YOU" : "COPILOT"}
          </span>
          {isUser && (
            <div className="h-px flex-1 opacity-30"
              style={{ background: "linear-gradient(to right, rgba(59,130,246,0.4), transparent)" }} />
          )}
          {!isUser && <div className="h-px flex-1 opacity-20" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.15), transparent)" }} />}
        </div>

        {/* Content */}
        {isUser ? (
          <p className="text-[13px] font-bold leading-relaxed"
            style={{ color: "#e0efff", textShadow: "0 0 20px rgba(59,130,246,0.15)" }}>
            {msg.content}
          </p>
        ) : (
          <div>
            <div className="text-[12.5px] text-white/80 leading-relaxed prose prose-invert max-w-none
              prose-p:my-1 prose-p:text-white/75 prose-p:text-[12.5px]
              prose-strong:text-white prose-strong:font-black
              prose-ul:my-1 prose-li:text-white/65 prose-li:my-0.5 prose-li:text-[12px]
              prose-h3:text-white prose-h3:font-black prose-h3:text-[13px] prose-h3:mt-2 prose-h3:mb-1
              prose-code:text-blue-300 prose-code:bg-blue-500/10 prose-code:rounded prose-code:px-1 prose-code:text-[11px]">
              <ReactMarkdown>{msg.content || "..."}</ReactMarkdown>
            </div>
            {msg.widget && <GlassWidget widget={msg.widget} />}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   WELCOME SCREEN  —  Terminal Boot
═══════════════════════════════════════════════════════════ */
const WelcomeScreen = ({ userName, onStart }: { userName: string; onStart: (msg: string) => void }) => {
  const [cursor, setCursor] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setCursor(p => !p), 600);
    return () => clearInterval(id);
  }, []);

  const starters = [
    { text: "היום היה יום קשה במסחר", icon: TrendingDown, color: "#f87171", border: "rgba(239,68,68,0.2)", bg: "rgba(239,68,68,0.06)" },
    { text: "יש לי FOMO ואני לא יודע מה לעשות", icon: Zap, color: "#fbbf24", border: "rgba(251,191,36,0.2)", bg: "rgba(251,191,36,0.06)" },
    { text: "רוצה לדון בסטאפ שלי", icon: BarChart2, color: "#60a5fa", border: "rgba(59,130,246,0.2)", bg: "rgba(59,130,246,0.07)" },
    { text: "אני מרגיש טוב — בואו נעשה סקירה", icon: TrendingUp, color: "#4ade80", border: "rgba(74,222,128,0.2)", bg: "rgba(74,222,128,0.06)" },
  ];

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4" dir="rtl">
      {/* Terminal header */}
      <div className="w-full max-w-md mb-8">
        <div className="rounded-2xl overflow-hidden mentor-panel"
          style={{ border: "1px solid rgba(59,130,246,0.15)", background: "rgba(0,0,0,0.6)", boxShadow: "0 0 40px rgba(59,130,246,0.06)" }}>

          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "rgba(59,130,246,0.1)", background: "rgba(59,130,246,0.04)" }}>
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
            </div>
            <span className="flex-1 text-center text-[9px] font-mono text-white/20 uppercase tracking-widest">ZENTRADE COPILOT · {getGreeting()}</span>
          </div>

          {/* Terminal body */}
          <div className="px-5 py-5 font-mono space-y-1.5" dir="ltr">
            <p className="text-[10px]"><span className="text-blue-400/60">sys</span><span className="text-white/20"> → </span><span className="text-white/50">COPILOT v2.0 initialized</span></p>
            <p className="text-[10px]"><span className="text-blue-400/60">ai</span><span className="text-white/20">  → </span><span className="text-white/50">Trading psychology engine: <span className="text-green-400/70">ONLINE</span></span></p>
            <p className="text-[10px]"><span className="text-blue-400/60">mem</span><span className="text-white/20"> → </span><span className="text-white/50">Context loaded for <span className="text-blue-300/80">{userName}</span></span></p>
            <p className="text-[10px] flex items-center gap-1">
              <span className="text-blue-400/60">→</span>
              <span className="text-white/30">awaiting input</span>
              <span className={cn("inline-block w-[7px] h-[11px] ml-0.5", cursor ? "bg-blue-400/60" : "bg-transparent")} />
            </p>
          </div>
        </div>
      </div>

      {/* AI Avatar */}
      <div className="relative mb-5">
        <div className="absolute inset-[-8px] rounded-2xl blur-[16px] animate-pulse" style={{ background: "rgba(59,130,246,0.12)" }} />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.22)", boxShadow: "0 0 24px rgba(59,130,246,0.15)" }}>
          <Bot className="h-7 w-7" style={{ color: "#60a5fa", filter: "drop-shadow(0 0 6px rgba(59,130,246,0.5))" }} />
        </div>
      </div>

      <p className="text-[17px] font-black text-white mb-1">{userName}</p>
      <p className="text-[11px] text-white/30 mb-8 font-mono">מוכן לנתח את המסחר שלך</p>

      {/* Starter prompts */}
      <div className="w-full max-w-sm space-y-2">
        <p className="text-[9px] text-white/20 font-mono uppercase tracking-widest mb-3 text-center">// בחר נקודת כניסה</p>
        {starters.map((s, i) => (
          <button key={i} onClick={() => onStart(s.text)}
            className="haptic-press group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right transition-all duration-200"
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              animationDelay: `${i * 80 + 200}ms`,
            }}>
            <s.icon className="h-4 w-4 shrink-0 transition-all" style={{ color: s.color }} />
            <span className="text-[12px] font-bold text-white/70 group-hover:text-white transition-colors">{s.text}</span>
            <ChevronRight className="h-3.5 w-3.5 mr-auto text-white/10 group-hover:text-white/30 group-hover:translate-x-[-2px] transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const MentorPage = () => {
  const { profile } = useAuth();
  const userName = profile?.full_name?.split(" ")[0] || "סוחר";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStats, setStreamStats] = useState<{ tokens: number; tps: number } | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [quickReplies, setQuickReplies] = useState<typeof QUICK_REPLIES_DEFAULT | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamStartRef = useRef<number>(0);
  const tokenCountRef = useRef<number>(0);

  const isWelcome = messages.length === 0;
  const mood = detectMood(messages);
  const moodCfg = moodConfig[mood];

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isStreaming]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const parseSSELine = useCallback((line: string): string | null => {
    if (!line.startsWith("data: ")) return null;
    const jsonStr = line.slice(6).trim();
    if (jsonStr === "[DONE]") return null;
    try {
      const parsed = JSON.parse(jsonStr);
      const delta = parsed.choices?.[0]?.delta?.content;
      if (typeof delta === "string") return delta;
    } catch { /* ignore */ }
    return null;
  }, []);

  const streamChat = useCallback(async (allMessages: Message[]) => {
    setIsStreaming(true);
    setStreamStats(null);
    setQuickReplies(null);
    streamStartRef.current = Date.now();
    tokenCountRef.current = 0;
    let assistantContent = "";

    const assistantId = Date.now() + 1;
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "", time: getTime() }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: allMessages.slice(-20).map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!resp.ok || !resp.body) {
        const errData = resp.headers.get("content-type")?.includes("json") ? await resp.json() : { error: `HTTP ${resp.status}` };
        toast.error(errData.error || "שגיאה בשירות AI");
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          const delta = parseSSELine(line);
          if (delta) {
            assistantContent += delta;
            tokenCountRef.current += 1;
            const elapsed = (Date.now() - streamStartRef.current) / 1000;
            if (elapsed > 0) setStreamStats({ tokens: tokenCountRef.current, tps: Math.round(tokenCountRef.current / elapsed) });
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m));
          }
        }
      }

      for (const raw of textBuffer.split("\n")) {
        const delta = parseSSELine(raw.replace(/\r$/, ""));
        if (delta) {
          assistantContent += delta;
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m));
        }
      }
    } catch (err: any) {
      toast.error(`שגיאה: ${err?.message || String(err)}`);
      setMessages(prev => prev.filter(m => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
      setTimeout(() => setStreamStats(null), 3000);
      setQuickReplies(getQuickReplies(allMessages));
    }
  }, [parseSSELine]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: text.trim(), time: getTime() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setQuickReplies(null);
    streamChat(updated);
  }, [isStreaming, messages, streamChat]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecordingDuration(0);
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.start();
      setRecordingState("recording");
      timerRef.current = setInterval(() => setRecordingDuration(p => p + 1), 1000);
    } catch { toast.error("לא ניתן לגשת למיקרופון."); }
  }, []);

  const stopRecording = useCallback(async () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    return new Promise<void>((resolve) => {
      mr.onstop = async () => {
        setRecordingState("processing");
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        mr.stream.getTracks().forEach(t => t.stop());
        try {
          const b64 = await new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onloadend = () => res(r.result as string);
            r.onerror = () => rej(new Error("read fail"));
            r.readAsDataURL(audioBlob);
          });
          const { data, error } = await supabase.functions.invoke("fal-whisper", { body: { audio_url: b64 } });
          if (error) { toast.error(`שגיאה: ${error.message}`); resolve(); return; }
          if (data?.error) { toast.error(data.error); resolve(); return; }
          if (data?.text?.trim()) { sendMessage(data.text.trim()); toast.success("התמלול הושלם!"); }
          else toast.warning("לא זוהה טקסט. נסה שוב.");
        } catch (err: any) { toast.error(`שגיאה: ${err?.message || String(err)}`); }
        finally { setRecordingState("idle"); setRecordingDuration(0); resolve(); }
      };
      mr.stop();
    });
  }, [sendMessage]);

  const toggleRecording = () => {
    if (recordingState === "recording") stopRecording();
    else if (recordingState === "idle") startRecording();
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto" dir="rtl">

      {/* ═══ HEADER ═══ */}
      <div className="shrink-0 px-1 pt-1 pb-3">
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3 mentor-panel"
          style={{
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(59,130,246,0.12)",
            boxShadow: "0 0 30px rgba(59,130,246,0.05)",
          }}>
          {/* Orb */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-xl blur-md animate-pulse" style={{ background: "rgba(59,130,246,0.15)" }} />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.22)" }}>
              <Bot className="h-5 w-5" style={{ color: "#60a5fa", filter: "drop-shadow(0 0 4px rgba(59,130,246,0.6))" }} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-black text-white">Co-Pilot</span>
              <span className="text-[9px] font-mono text-white/20">·</span>
              <span className="text-[9px] font-mono text-white/30">TRADING INTELLIGENCE</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5" dir="ltr">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute animate-ping inline-flex h-full w-full rounded-full opacity-50"
                  style={{ background: isStreaming ? "#3b82f6" : "#4ade80" }} />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full"
                  style={{ background: isStreaming ? "#3b82f6" : "#4ade80", boxShadow: `0 0 4px ${isStreaming ? "rgba(59,130,246,0.8)" : "rgba(74,222,128,0.8)"}` }} />
              </span>
              <span className="text-[9px] font-mono" style={{ color: isStreaming ? "#60a5fa" : "rgba(74,222,128,0.6)" }}>
                {isStreaming ? "GENERATING" : "ONLINE"}
              </span>
              {streamStats && (
                <span className="text-[9px] font-mono text-white/20">· {streamStats.tps} tok/s</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isWelcome && (
              <div className="rounded-lg px-2.5 py-1 text-[9px] font-black font-mono"
                style={{ background: moodCfg.bg, border: `1px solid ${moodCfg.border}`, color: moodCfg.dot }}>
                {moodCfg.label}
              </div>
            )}
            <div className="flex items-center gap-1 rounded-lg px-2 py-1"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <Terminal className="h-3 w-3 text-white/20" />
              <span className="text-[9px] font-mono text-white/20">{messages.length} LOG</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      {isWelcome ? (
        <WelcomeScreen userName={userName} onStart={sendMessage} />
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-none rounded-xl mentor-sidebar"
          style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
          {/* Terminal log label */}
          <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }} dir="ltr">
            <Terminal className="h-3 w-3 text-white/15" />
            <span className="text-[8px] font-mono text-white/15 uppercase tracking-widest">SESSION LOG</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.03)" }} />
            <span className="text-[8px] font-mono text-white/10">{new Date().toLocaleDateString("he-IL")}</span>
          </div>

          {/* Messages */}
          {messages.map((msg, i) => (
            <TerminalMessage key={msg.id} msg={msg} isLast={i === messages.length - 1} />
          ))}

          {/* Thinking pulse — only when AI content is empty (just started) */}
          {isStreaming && messages[messages.length - 1]?.content === "" && (
            <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2 mb-2" dir="ltr">
                <span className="text-[9px] font-mono text-white/20">{getTime()}</span>
                <span className="text-[9px] font-black font-mono tracking-widest text-blue-400/40">COPILOT</span>
              </div>
              <ThinkingPulse />
            </div>
          )}

          {/* Quick replies */}
          {quickReplies && !isStreaming && (
            <div className="px-4 py-3 flex flex-wrap gap-2 justify-start border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              <span className="text-[8px] font-mono text-white/15 uppercase tracking-widest w-full mb-1" dir="ltr">// SUGGESTED RESPONSES</span>
              {quickReplies.map((qr, i) => (
                <button key={i} onClick={() => sendMessage(qr.text)}
                  className="haptic-press flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all"
                  style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.15)", color: "#93c5fd" }}>
                  <qr.icon className="h-3 w-3 shrink-0" />
                  {qr.text}
                </button>
              ))}
            </div>
          )}

          <div ref={chatEndRef} className="h-2" />
        </div>
      )}

      {/* ═══ COMMAND CHIPS ═══ */}
      {!isWelcome && (
        <div className="shrink-0 pt-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 px-0.5">
            {COMMAND_CHIPS.map((chip, i) => (
              <button key={i}
                onClick={() => sendMessage(chip.full)}
                disabled={isStreaming}
                className="haptic-press shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2.5 min-h-[40px] text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all disabled:opacity-30"
                style={{ background: chip.bg, border: `1px solid ${chip.border}`, color: chip.color }}>
                <chip.icon className="h-3 w-3 shrink-0" style={{ color: chip.color }} />
                {chip.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ INPUT ═══ */}
      <div className="shrink-0 pt-2 pb-1">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="relative flex items-center gap-2 rounded-2xl px-3 py-2.5 transition-all duration-300 mentor-input"
          style={{
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: input ? "0 0 20px rgba(59,130,246,0.06)" : undefined,
          }}>

          {/* Mic */}
          <button type="button" onClick={toggleRecording}
            disabled={recordingState === "processing" || isStreaming}
            className="haptic-press relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300"
            style={recordingState === "recording" ? {
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
              boxShadow: "0 0 16px rgba(239,68,68,0.2)",
            } : recordingState === "processing" ? {
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              color: "#60a5fa",
            } : {
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.3)",
            }}>
            {recordingState === "recording" ? (
              <span className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/20" />
                <MicOff className="relative h-4 w-4" />
              </span>
            ) : recordingState === "processing" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>

          {/* Input / waveform */}
          {recordingState === "recording" ? (
            <div className="flex items-center gap-3 flex-1" dir="ltr">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400/50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
                </span>
                <span className="text-[11px] text-red-400 font-mono font-bold">{formatDuration(recordingDuration)}</span>
              </div>
              <div className="flex-1 flex items-end gap-[2px] h-6">
                {Array.from({ length: 32 }, (_, i) => (
                  <div key={i} className="w-[2px] rounded-full bg-red-400/40"
                    style={{ height: `${20 + Math.sin(i * 0.9) * 50}%`, animation: `waveform ${0.4 + Math.random() * 0.3}s ease-in-out ${i * 25}ms infinite alternate` }} />
                ))}
              </div>
              <button type="button" onClick={toggleRecording}
                className="haptic-press flex h-7 items-center gap-1 rounded-lg px-2.5 text-[10px] font-bold transition-all"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                <Send className="h-3 w-3" />
                שלח
              </button>
            </div>
          ) : recordingState === "processing" ? (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[11px] font-mono" style={{ color: "#60a5fa" }}>מתמלל...</span>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
            </div>
          ) : (
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="כתוב הודעה למנטור..."
              disabled={isStreaming}
              className="flex-1 bg-transparent text-[12.5px] text-white placeholder:text-white/20 outline-none disabled:opacity-40"
              dir="rtl"
            />
          )}

          {/* Send */}
          <button type="submit"
            disabled={!input.trim() || isStreaming || recordingState !== "idle"}
            className="haptic-press flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-25"
            style={input.trim() && !isStreaming ? {
              background: "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(29,78,216,0.9))",
              boxShadow: "0 0 16px rgba(59,130,246,0.3)",
            } : {
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            ) : (
              <Send className="h-4 w-4 text-white" style={{ transform: "scaleX(-1)" }} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MentorPage;
