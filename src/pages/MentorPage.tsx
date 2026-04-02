import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Send, Bot, Sparkles, Shield, Heart, Flame, AlertTriangle, Zap, Trophy, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message { id: number; role: "assistant" | "user"; content: string; time: string; }

type RecordingState = "idle" | "recording" | "processing";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-ai-chat`;

const tiltPills = [
  { text: "נקמה בשוק", icon: Flame, color: "loss" as const, full: "בא לי לנקום בשוק אחרי הפסד" },
  { text: "שברתי חוקים", icon: AlertTriangle, color: "warn" as const, full: "שברתי את כל החוקים שלי היום" },
  { text: "FOMO מטורף", icon: Zap, color: "warn" as const, full: "אני בפומו מטורף, רואה הכל עולה בלעדיי" },
  { text: "חרדה מהשוק", icon: Heart, color: "info" as const, full: "אני מרגיש חרדה מהשוק, לא מצליח לסחור" },
  { text: "לא מצליח לעצור", icon: Shield, color: "warn" as const, full: "אני לא מצליח לעצור לסחור, עושה אובר-טריידינג" },
  { text: "מחקתי פראפ", icon: Trophy, color: "loss" as const, full: "מחקתי אתגר פראפ, אני מרגיש מרוסק" },
];

const pillColors = {
  loss: { bg: "bg-loss/5 hover:bg-loss/10 border-loss/10", text: "text-loss/60 group-hover:text-loss", icon: "text-loss/40" },
  warn: { bg: "bg-yellow-400/5 hover:bg-yellow-400/10 border-yellow-400/10", text: "text-yellow-400/60 group-hover:text-yellow-400", icon: "text-yellow-400/40" },
  info: { bg: "bg-primary/5 hover:bg-primary/10 border-primary/10", text: "text-primary/60 group-hover:text-primary", icon: "text-primary/40" },
};

const getTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const MentorPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", content: "אני פה איתך. בלי פילטרים.\n\nספר לי מה עובר עליך, או לחץ על המיקרופון. השוק לא יברח.", time: getTime() },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isStreaming]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const streamChat = async (allMessages: Message[]) => {
    setIsStreaming(true);
    let assistantContent = "";

    // Add empty assistant message
    const assistantId = Date.now() + 1;
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "", time: getTime() }]);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok || !resp.body) {
        const errData = resp.headers.get("content-type")?.includes("json")
          ? await resp.json()
          : { error: `HTTP ${resp.status}` };
        toast.error(errData.error || "שגיאה בשירות AI");
        // Remove empty assistant message
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        setIsStreaming(false);
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
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m)
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Flush remaining
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || !raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m)
              );
            }
          } catch {}
        }
      }
    } catch (err: any) {
      toast.error(`שגיאה: ${err?.message || String(err)}`);
      setMessages(prev => prev.filter(m => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
    }
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: text.trim(), time: getTime() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    streamChat(updated);
  };

  // Voice recording
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
    } catch {
      toast.error("לא ניתן לגשת למיקרופון. בדוק הרשאות.");
    }
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
          if (error) { toast.error(`שגיאה: ${error.message}`); return; }
          if (data?.error) { toast.error(data.error); return; }
          if (data?.text?.trim()) {
            sendMessage(data.text.trim());
            toast.success("התמלול הושלם!");
          } else {
            toast.warning("לא זוהה טקסט. נסה שוב.");
          }
        } catch (err: any) {
          toast.error(`שגיאה: ${err?.message || String(err)}`);
        } finally {
          setRecordingState("idle");
          setRecordingDuration(0);
          resolve();
        }
      };
      mr.stop();
    });
  }, [messages]);

  const toggleRecording = () => {
    if (recordingState === "recording") stopRecording();
    else if (recordingState === "idle") startRecording();
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-56px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="shrink-0 px-1 pt-1 pb-3">
        <div className="rounded-2xl border border-[#00D4AA]/15 bg-gradient-to-r from-[#00D4AA]/[0.04] to-transparent backdrop-blur-sm px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-[-3px] rounded-xl bg-[#00D4AA]/10 animate-pulse" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00D4AA]/15 to-[#00D4AA]/5 border border-[#00D4AA]/20 shadow-[0_0_15px_rgba(0,212,170,0.15)]">
                <Bot className="h-5 w-5 text-[#00D4AA]" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight">המנטור האישי</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA]/40" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4AA]" />
                </span>
                <p className="text-[10px] text-[#00D4AA]/60 font-mono font-medium tracking-widest">AI MENTOR · ONLINE</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-1 space-y-3 scrollbar-none">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"} relative z-10`}>
            {msg.role === "assistant" ? (
              <div className="flex items-end gap-2 max-w-[88%] md:max-w-[78%]">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00D4AA]/10 to-[#00D4AA]/5 border border-[#00D4AA]/15 mb-1 shadow-[0_0_8px_rgba(0,212,170,0.1)]">
                  <Sparkles className="h-3 w-3 text-[#00D4AA]/70" />
                </div>
                <div>
                  <div className="rounded-2xl rounded-br-sm border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] px-4 py-3 shadow-lg">
                    <div className="text-[12px] text-foreground/80 leading-relaxed prose prose-sm prose-invert max-w-none 
                      prose-p:my-1 prose-p:text-foreground/75 prose-strong:text-foreground prose-strong:font-bold
                      prose-ul:my-1 prose-li:text-foreground/70 prose-li:my-0.5">
                      <ReactMarkdown>{msg.content || "..."}</ReactMarkdown>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground/25 mt-1 mr-2 font-mono">{msg.time}</p>
                </div>
              </div>
            ) : (
              <div className="max-w-[82%] md:max-w-[72%]">
                <div className="rounded-2xl rounded-bl-sm bg-gradient-to-br from-[#00D4AA]/12 to-[#00D4AA]/6 border border-[#00D4AA]/15 px-4 py-3 shadow-[0_0_15px_rgba(0,212,170,0.08)]">
                  <p className="text-[12px] text-foreground/90 leading-relaxed">{msg.content}</p>
                </div>
                <p className="text-[9px] text-muted-foreground/25 mt-1 ml-2 text-left font-mono">{msg.time}</p>
              </div>
            )}
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-end relative z-10">
            <div className="flex items-end gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#00D4AA]/8 border border-[#00D4AA]/12 mb-1">
                <Sparkles className="h-3 w-3 text-[#00D4AA]/50" />
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]/40 animate-bounce" style={{ animationDelay: `${i * 150}ms`, animationDuration: "0.8s" }} />
                  ))}
                  <span className="text-[10px] text-[#00D4AA]/30 mr-1.5 font-mono">חושב...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Tilt Pills */}
      <div className="shrink-0 px-1 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {tiltPills.map((pill, index) => {
            const colors = pillColors[pill.color];
            return (
              <button
                key={pill.text}
                onClick={() => sendMessage(pill.full)}
                disabled={isStreaming}
                className={`haptic-press group flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-1 fill-mode-both disabled:opacity-40 ${colors.bg}`}
                style={{ animationDelay: `${index * 60}ms`, animationDuration: '300ms' }}
              >
                <pill.icon className={`h-3 w-3 shrink-0 ${colors.icon}`} />
                <span className={`text-[10px] font-semibold ${colors.text}`}>{pill.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 px-1 pb-1.5 pt-2">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="relative flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-white/[0.01] px-3 py-2.5 focus-within:border-[#00D4AA]/20 transition-all duration-300 focus-within:shadow-[0_0_20px_rgba(0,212,170,0.08)]"
        >
          {/* Mic Button */}
          <button
            type="button"
            onClick={toggleRecording}
            disabled={recordingState === "processing" || isStreaming}
            className={`haptic-press group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 overflow-hidden ${
              recordingState === "recording"
                ? "bg-gradient-to-br from-loss/20 to-loss/10 border border-loss/40 text-loss shadow-[0_0_18px_rgba(239,68,68,0.3)]"
                : recordingState === "processing"
                ? "bg-gradient-to-br from-[#00D4AA]/15 to-[#00D4AA]/5 border border-[#00D4AA]/30 text-[#00D4AA] cursor-wait shadow-[0_0_12px_rgba(0,212,170,0.2)]"
                : "bg-gradient-to-br from-[#00D4AA]/10 to-[#00D4AA]/5 border border-[#00D4AA]/20 text-[#00D4AA]/60 hover:text-[#00D4AA] hover:border-[#00D4AA]/40 hover:shadow-[0_0_20px_rgba(0,212,170,0.25)]"
            }`}
          >
            {recordingState === "recording" ? (
              <span className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-loss/30" />
                <MicOff className="relative h-4 w-4" />
              </span>
            ) : recordingState === "processing" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mic className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            )}
          </button>

          {recordingState === "recording" ? (
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-loss/50" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-loss" />
                </span>
                <span className="text-xs text-loss font-mono font-bold tracking-wider">{formatDuration(recordingDuration)}</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-[1.5px] h-6">
                {Array.from({ length: 35 }, (_, i) => (
                  <div key={i} className="w-[1.5px] rounded-full bg-loss/40" style={{ height: `${15 + Math.sin(i * 0.8) * 40 + Math.random() * 30}%`, animation: `waveform ${0.4 + Math.random() * 0.3}s ease-in-out ${i * 25}ms infinite alternate` }} />
                ))}
              </div>
              <button type="button" onClick={toggleRecording}
                className="haptic-press flex h-8 items-center gap-1.5 rounded-lg bg-loss/10 border border-loss/25 px-3 text-loss text-[11px] font-semibold hover:bg-loss/20 transition-all">
                <Send className="h-3 w-3 rotate-180" />
                <span>שלח</span>
              </button>
            </div>
          ) : recordingState === "processing" ? (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-[#00D4AA] font-mono font-semibold">מתמלל...</span>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]/50 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
              </div>
            </div>
          ) : (
            <>
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="ספר לי מה עובר עליך..."
                disabled={isStreaming}
                className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground/25 outline-none px-1 font-medium disabled:opacity-50"
              />
              <button type="submit" disabled={!input.trim() || isStreaming}
                className={`haptic-press flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                  input.trim() && !isStreaming
                    ? "bg-gradient-to-br from-[#00D4AA]/15 to-[#00D4AA]/5 border border-[#00D4AA]/25 text-[#00D4AA] hover:shadow-[0_0_15px_rgba(0,212,170,0.2)]"
                    : "bg-white/[0.02] border border-white/[0.05] text-muted-foreground/15 cursor-not-allowed"
                }`}
              >
                <Send className="h-4 w-4 rotate-180" />
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default MentorPage;
