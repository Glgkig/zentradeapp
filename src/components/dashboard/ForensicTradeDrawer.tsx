import { useState, useRef, useCallback } from "react";
import { X, ArrowUpRight, ArrowDownRight, Plus, CheckCircle2, Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const confluences = [
  "FVG (Fair Value Gap)",
  "Liquidity Sweep",
  "Order Block",
  "Break of Structure",
  "Supply / Demand Zone",
  "Divergence",
  "EMA Cross",
  "Volume Spike",
];

interface ForensicTradeDrawerProps {
  open: boolean;
  onClose: () => void;
}

type RecordingState = "idle" | "recording" | "processing";

const ForensicTradeDrawer = ({ open, onClose }: ForensicTradeDrawerProps) => {
  const isMobile = useIsMobile();
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [selectedConfluences, setSelectedConfluences] = useState<string[]>([]);
  const [thesis, setThesis] = useState("");
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [quickDesc, setQuickDesc] = useState("");
  const [aiExtracting, setAiExtracting] = useState(false);
  const [asset, setAsset] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [lotSize, setLotSize] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const toggleConfluence = (c: string) => {
    setSelectedConfluences((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setRecordingState("recording");
    } catch {
      toast.error("לא ניתן לגשת למיקרופון. בדוק הרשאות.");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    return new Promise<void>((resolve) => {
      mediaRecorder.onstop = async () => {
        setRecordingState("processing");
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach((t) => t.stop());

        try {
          // Convert blob to base64 Data URL
          const base64DataUrl = await new Promise<string>((res, rej) => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result as string);
            reader.onerror = () => rej(new Error("Failed to read audio blob"));
            reader.readAsDataURL(audioBlob);
          });

          const { data, error } = await supabase.functions.invoke("fal-whisper", {
            body: { audio_url: base64DataUrl },
          });

          if (error) {
            console.error("Invoke error:", error);
            toast.error(`שגיאת שרת: ${error.message || JSON.stringify(error)}`);
            return;
          }

          if (data?.error) {
            console.error("API error:", data.error, data.details);
            toast.error(`שגיאת API: ${data.error}${data.details ? ' — ' + data.details : ''}`);
            return;
          }

          if (data?.text && data.text.trim()) {
            setThesis((prev) => (prev ? prev + " " + data.text.trim() : data.text.trim()));
            toast.success("התמלול הושלם!");
          } else {
            toast.warning("לא זוהה טקסט בהקלטה. נסה שוב.");
          }
        } catch (err: any) {
          console.error("Whisper error:", err);
          toast.error(`שגיאה: ${err?.message || String(err)}`);
        } finally {
          setRecordingState("idle");
          resolve();
        }
      };
      mediaRecorder.stop();
    });
  }, []);

  const toggleRecording = () => {
    if (recordingState === "recording") {
      stopRecording();
    } else if (recordingState === "idle") {
      startRecording();
    }
  };

  const handleAiExtract = async () => {
    if (!quickDesc.trim()) {
      toast.error("כתוב תיאור עסקה לפני מילוי אוטומטי");
      return;
    }
    setAiExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke("trade-ai-extract", {
        body: { description: quickDesc },
      });
      if (error) {
        toast.error(`שגיאה: ${error.message}`);
        return;
      }
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      const ext = data?.extracted;
      if (ext) {
        if (ext.asset) setAsset(ext.asset);
        if (ext.direction === "long" || ext.direction === "short") setDirection(ext.direction);
        if (ext.price != null) setEntryPrice(String(ext.price));
        toast.success("השדות מולאו אוטומטית ✨");
      } else {
        toast.warning("לא הצלחתי לחלץ נתונים מהטקסט");
      }
    } catch (err: any) {
      toast.error(`שגיאה: ${err?.message || String(err)}`);
    } finally {
      setAiExtracting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed z-[71] overflow-y-auto bg-card border-white/[0.08] animate-in duration-300 ${
          isMobile
            ? "inset-x-0 bottom-0 max-h-[92vh] rounded-t-3xl border-t slide-in-from-bottom-full"
            : "inset-y-0 right-0 w-[480px] border-l slide-in-from-right-full"
        }`}
      >
        {/* Mobile handle */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/15" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 border border-accent/20">
              <Plus className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">עסקה חדשה</h2>
              <p className="text-2xs text-muted-foreground/40">כניסה פורנזית מדויקת</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="haptic-press flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-muted-foreground/40 hover:text-foreground transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* AI Quick Extract */}
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 space-y-3">
            <label className="text-2xs font-semibold text-primary/70 mb-1 block font-mono uppercase">תיאור עסקה מהיר</label>
            <textarea
              rows={2}
              value={quickDesc}
              onChange={(e) => setQuickDesc(e.target.value)}
              placeholder="למשל: נכנסתי ללונג על נאסדק במחיר 18500"
              className="w-full rounded-xl border border-primary/15 bg-white/[0.03] px-4 py-3 text-[12px] text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/30 resize-none transition-all leading-relaxed"
            />
            <button
              onClick={handleAiExtract}
              disabled={aiExtracting || !quickDesc.trim()}
              className="haptic-press w-full flex items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 py-3 text-[13px] font-bold text-primary transition-all hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
            >
              {aiExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>מעבד...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>✨ מילוי אוטומטי (AI)</span>
                </>
              )}
            </button>
          </div>

          {/* Asset */}
          <div>
            <label className="text-2xs font-semibold text-muted-foreground/50 mb-1.5 block font-mono uppercase">נכס</label>
            <input
              type="text"
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              placeholder="EUR/USD, BTC, NQ..."
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30 transition-all min-h-[48px]"
            />
          </div>

          {/* Direction */}
          <div>
            <label className="text-2xs font-semibold text-muted-foreground/50 mb-1.5 block font-mono uppercase">כיוון</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDirection("long")}
                className={`haptic-press flex items-center justify-center gap-2 rounded-xl border py-3 text-[13px] font-bold transition-all min-h-[48px] ${
                  direction === "long"
                    ? "border-profit/30 bg-profit/10 text-profit"
                    : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 hover:bg-white/[0.04]"
                }`}
              >
                <ArrowUpRight className="h-4 w-4" />
                לונג (Long)
              </button>
              <button
                onClick={() => setDirection("short")}
                className={`haptic-press flex items-center justify-center gap-2 rounded-xl border py-3 text-[13px] font-bold transition-all min-h-[48px] ${
                  direction === "short"
                    ? "border-loss/30 bg-loss/10 text-loss"
                    : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 hover:bg-white/[0.04]"
                }`}
              >
                <ArrowDownRight className="h-4 w-4" />
                שורט (Short)
              </button>
            </div>
          </div>

          {/* Price Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs font-semibold text-muted-foreground/50 mb-1.5 block font-mono uppercase">מחיר כניסה</label>
              <input
                type="number"
                placeholder="Entry"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30 transition-all min-h-[48px]"
              />
            </div>
            <div>
              <label className="text-2xs font-semibold text-muted-foreground/50 mb-1.5 block font-mono uppercase">לוט / כמות</label>
              <input
                type="number"
                placeholder="0.01"
                step="0.01"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30 transition-all min-h-[48px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs font-semibold text-loss/60 mb-1.5 block font-mono uppercase">סטופ-לוס (SL)</label>
              <input
                type="number"
                placeholder="Stop Loss"
                className="w-full rounded-xl border border-loss/15 bg-loss/[0.03] px-4 py-3 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-loss/30 transition-all min-h-[48px]"
              />
            </div>
            <div>
              <label className="text-2xs font-semibold text-profit/60 mb-1.5 block font-mono uppercase">טייק-פרופיט (TP)</label>
              <input
                type="number"
                placeholder="Take Profit"
                className="w-full rounded-xl border border-profit/15 bg-profit/[0.03] px-4 py-3 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-profit/30 transition-all min-h-[48px]"
              />
            </div>
          </div>

          {/* Thesis with Mic */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-2xs font-semibold text-muted-foreground/50 font-mono uppercase">התזה (Thesis)</label>
              <button
                onClick={toggleRecording}
                disabled={recordingState === "processing"}
                className={`haptic-press flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                  recordingState === "recording"
                    ? "bg-loss/15 text-loss border border-loss/30 animate-pulse"
                    : recordingState === "processing"
                    ? "bg-primary/10 text-primary border border-primary/20 cursor-wait"
                    : "bg-white/[0.04] text-muted-foreground/60 border border-white/[0.08] hover:bg-white/[0.08] hover:text-foreground"
                }`}
              >
                {recordingState === "recording" ? (
                  <>
                    <MicOff className="h-3.5 w-3.5" />
                    <span>מקליט...</span>
                  </>
                ) : recordingState === "processing" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>מעבד...</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-3.5 w-3.5" />
                    <span>הקלט</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={3}
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="למה אני נכנס? מה הסטאפ? מה ה-edge שלי?"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[12px] text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30 resize-none transition-all leading-relaxed"
            />
          </div>

          {/* Confluences */}
          <div>
            <label className="text-2xs font-semibold text-muted-foreground/50 mb-2 block font-mono uppercase">אישורים (Confluences)</label>
            <div className="flex flex-wrap gap-2">
              {confluences.map((c) => {
                const selected = selectedConfluences.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleConfluence(c)}
                    className={`haptic-press flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-medium transition-all ${
                      selected
                        ? "border-primary/25 bg-primary/10 text-primary"
                        : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 hover:bg-white/[0.04]"
                    }`}
                  >
                    {selected && <CheckCircle2 className="h-3 w-3" />}
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button className="haptic-press w-full flex items-center justify-center gap-2 rounded-2xl bg-accent border border-accent/30 py-4 text-[14px] font-bold text-accent-foreground transition-all hover:bg-accent/90 gold-glow min-h-[56px]">
            <Plus className="h-5 w-5" />
            פתח עסקה
          </button>
        </div>
      </div>
    </>
  );
};

export default ForensicTradeDrawer;
