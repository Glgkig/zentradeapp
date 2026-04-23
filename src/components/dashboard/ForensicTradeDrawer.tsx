import { useState, useRef, useCallback } from "react";
import {
  X, ArrowUpRight, ArrowDownRight, Plus, CheckCircle2, Mic, MicOff,
  Loader2, Sparkles, Brain, Shield, Clock, TrendingUp, AlertTriangle,
  Target, Zap, ChevronDown, ChevronUp, Star, Eye, BarChart2, Flame,
  ImagePlus, Monitor,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/* ===== Config ===== */
const CONFLUENCE_GROUPS = [
  {
    label: "מבנה שוק",
    icon: "📐",
    items: ["Break of Structure (BOS)", "Change of Character (CHoCH)", "Higher High / Lower Low", "Market Structure Shift"],
  },
  {
    label: "זונות מחיר",
    icon: "🧲",
    items: ["Order Block", "FVG (Fair Value Gap)", "Supply Zone", "Demand Zone", "Breaker Block", "Mitigation Block"],
  },
  {
    label: "נזילות",
    icon: "💧",
    items: ["Liquidity Sweep", "Stop Hunt", "Equal Highs / Lows", "Previous High/Low Grab"],
  },
  {
    label: "כניסה",
    icon: "🎯",
    items: ["Premium / Discount Zone", "Optimal Trade Entry (OTE)", "Fibonacci Retracement", "Confluence of Levels"],
  },
  {
    label: "אינדיקטורים",
    icon: "📊",
    items: ["EMA Cross", "Volume Spike", "RSI Divergence", "MACD Signal"],
  },
];

const ALL_CONFLUENCES = CONFLUENCE_GROUPS.flatMap(g => g.items);

const SESSIONS = [
  { id: "asian",    label: "Asian",    emoji: "🌏", time: "00-08 UTC" },
  { id: "london",   label: "London",   emoji: "🇬🇧", time: "08-16 UTC" },
  { id: "overlap",  label: "Overlap",  emoji: "⚡", time: "13-16 UTC" },
  { id: "new-york", label: "New York", emoji: "🗽", time: "13-21 UTC" },
  { id: "pre-market", label: "Pre-Mkt", emoji: "🌅", time: "11-13 UTC" },
];

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1H", "4H", "Daily", "Weekly"];

const MARKET_CONDITIONS = [
  { id: "trending-up",   label: "טרנד עולה",      emoji: "📈" },
  { id: "trending-down", label: "טרנד יורד",      emoji: "📉" },
  { id: "ranging",       label: "דשדוש",          emoji: "↔️" },
  { id: "volatile",      label: "תנודתי",         emoji: "⚡" },
  { id: "pre-news",      label: "לפני חדשות",     emoji: "📰" },
  { id: "post-news",     label: "אחרי חדשות",     emoji: "💥" },
];

const RULES = [
  { id: "session", label: "כניסה בתוך שעות המסחר שלי", icon: Clock },
  { id: "structure", label: "מבנה שוק ברור בכיוון הכניסה", icon: TrendingUp },
  { id: "sl_defined", label: "סטופ-לוס מוגדר לפני הכניסה", icon: Shield },
  { id: "rr", label: "יחס R:R מינימום 1:2", icon: Target },
  { id: "no_fomo", label: "כניסה ללא FOMO / ריגוש", icon: Flame },
  { id: "plan", label: "הייתה תזה מוגדרת לפני הכניסה", icon: Brain },
  { id: "higher_tf", label: "אישור מ-Timeframe גבוה יותר", icon: Eye },
  { id: "no_revenge", label: "לא מסחר נקמה אחרי הפסד", icon: AlertTriangle },
];

const EMOTIONS = [
  { label: "רגוע", emoji: "😌" },
  { label: "ממוקד", emoji: "🎯" },
  { label: "בטוח", emoji: "💪" },
  { label: "FOMO", emoji: "😰" },
  { label: "חמדן", emoji: "🤑" },
  { label: "פחד", emoji: "😨" },
  { label: "לחץ", emoji: "😤" },
  { label: "עייף", emoji: "😴" },
];

interface ForensicTradeDrawerProps {
  open: boolean;
  onClose: () => void;
}

type RecordingState = "idle" | "recording" | "processing";

const ForensicTradeDrawer = ({ open, onClose }: ForensicTradeDrawerProps) => {
  const isMobile = useIsMobile();
  const { user, profile } = useAuth();

  // Form state
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [asset, setAsset] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [thesis, setThesis] = useState("");
  const [quickDesc, setQuickDesc] = useState("");
  const [selectedConfluences, setSelectedConfluences] = useState<string[]>([]);
  const [rulesFollowed, setRulesFollowed] = useState<Record<string, boolean | null>>({});
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [rating, setRating] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["מבנה שוק", "זונות מחיר", "נזילות"]);
  const [session, setSession] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("");
  const [marketCondition, setMarketCondition] = useState<string>("");
  const [chartPreviews, setChartPreviews] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI state
  const [aiExtracting, setAiExtracting] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiScore, setAiScore] = useState<{ score: number; issues: string[]; passes: string[] } | null>(null);
  const [saving, setSaving] = useState(false);

  // Recording
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const toggleConfluence = (c: string) =>
    setSelectedConfluences(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const toggleGroup = (label: string) =>
    setExpandedGroups(prev => prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]);

  const toggleRule = (id: string, val: boolean) =>
    setRulesFollowed(prev => ({ ...prev, [id]: prev[id] === val ? null : val }));

  /* ===== AI: Extract from description ===== */
  const handleAiExtract = async () => {
    if (!quickDesc.trim()) { toast.error("כתוב תיאור עסקה לפני מילוי אוטומטי"); return; }
    setAiExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke("trade-ai-extract", {
        body: { description: quickDesc },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const ext = data?.extracted;
      if (ext) {
        if (ext.asset) setAsset(ext.asset);
        if (ext.direction === "long" || ext.direction === "short") setDirection(ext.direction);
        if (ext.price != null) setEntryPrice(String(ext.price));
        toast.success("השדות מולאו אוטומטית ✨");
      }

      // Auto-detect confluences from description
      await detectConfluences(quickDesc);
    } catch (err: any) {
      toast.error(err?.message || "שגיאה");
    } finally {
      setAiExtracting(false);
    }
  };

  /* ===== AI: Auto-detect confluences from text ===== */
  const detectConfluences = async (text: string) => {
    if (!text.trim()) return;
    try {
      const { data } = await supabase.functions.invoke("mentor-ai-chat", {
        body: {
          messages: [{
            role: "user",
            content: `אתה מומחה לניתוח טכני. קרא את תיאור העסקה הבא וזהה אילו confluences/אישורים מהרשימה מוזכרים או מרומזים.

תיאור: "${text}"

רשימת confluences אפשריים: ${ALL_CONFLUENCES.join(", ")}

החזר JSON בפורמט: {"confluences": ["שם1", "שם2"]}
רק confluences שמוזכרים בתיאור. אל תוסיף דברים שלא קיימים בטקסט.`,
          }],
          systemPrompt: "You are a trading analyst. Respond only with valid JSON.",
        },
      });

      if (data?.message) {
        try {
          const jsonMatch = data.message.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.confluences && Array.isArray(parsed.confluences)) {
              const valid = parsed.confluences.filter((c: string) => ALL_CONFLUENCES.includes(c));
              if (valid.length > 0) {
                setSelectedConfluences(prev => [...new Set([...prev, ...valid])]);
                toast.success(`זוהו ${valid.length} אישורים אוטומטית 🎯`);
              }
            }
          }
        } catch {}
      }
    } catch {}
  };

  /* ===== Image Upload ===== */
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !user?.id) return;
    setUploadingImage(true);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "png";
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await supabase.storage
          .from("trade-charts")
          .upload(path, file, { upsert: true });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage
          .from("trade-charts")
          .getPublicUrl(data.path);
        uploaded.push(publicUrl);
      }
      setChartPreviews(prev => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} גרף הועלה! 📸`);
    } catch {
      toast.error("שגיאה בהעלאת תמונה — בדוק שה-bucket קיים");
    } finally {
      setUploadingImage(false);
    }
  };

  /* ===== AI: Analyze rule compliance ===== */
  const handleAiAnalyze = async () => {
    if (!thesis.trim() && !quickDesc.trim()) {
      toast.error("כתוב תיאור או תזה לפני הניתוח");
      return;
    }
    setAiAnalyzing(true);
    setAiScore(null);
    try {
      const tradingStyle = profile?.trading_style || "לא צוין";
      const sessions = (profile as any)?.trading_sessions?.join(", ") || "לא צוין";
      const rulesText = RULES.map(r => `- ${r.label}`).join("\n");

      const { data } = await supabase.functions.invoke("mentor-ai-chat", {
        body: {
          messages: [{
            role: "user",
            content: `אתה מנטור מסחר מקצועי. נתח את העסקה הבאה ובדוק אם הסוחר עמד בחוקים.

**פרטי הסוחר:**
- סגנון מסחר: ${tradingStyle}
- שעות מסחר: ${sessions}
- אישורים שנבחרו: ${selectedConfluences.join(", ") || "אין"}

**תיאור העסקה:**
${quickDesc || thesis}

**חוקי המסחר לבדיקה:**
${rulesText}

**בדוק:**
1. האם יש מספיק אישורים לכניסה?
2. האם הכניסה נראית מתוכננת או אימפולסיבית?
3. מה הסיכונים שלא נלקחו בחשבון?

החזר JSON:
{
  "score": 75,
  "passes": ["חוק שעבר", "חוק נוסף"],
  "issues": ["בעיה 1", "בעיה 2"],
  "verdict": "משפט קצר בעברית"
}`,
          }],
          systemPrompt: "אתה מנטור מסחר. ענה אך ורק ב-JSON תקני.",
        },
      });

      if (data?.message) {
        try {
          const jsonMatch = data.message.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setAiScore({
              score: parsed.score || 0,
              issues: parsed.issues || [],
              passes: parsed.passes || [],
            });

            // Auto-fill rules based on AI verdict
            if (parsed.passes) {
              const ruleUpdates: Record<string, boolean> = {};
              RULES.forEach(rule => {
                const passed = parsed.passes.some((p: string) =>
                  p.includes(rule.label.split(" ")[0]) || rule.label.toLowerCase().includes(p.toLowerCase().slice(0, 5))
                );
                if (passed) ruleUpdates[rule.id] = true;
              });
              setRulesFollowed(prev => ({ ...prev, ...ruleUpdates }));
            }
          }
        } catch {}
      }
    } catch (err: any) {
      toast.error(err?.message || "שגיאה בניתוח");
    } finally {
      setAiAnalyzing(false);
    }
  };

  /* ===== Voice recording ===== */
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.start();
      setRecordingState("recording");
    } catch { toast.error("לא ניתן לגשת למיקרופון"); }
  }, []);

  const stopRecording = useCallback(async () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;
    return new Promise<void>((resolve) => {
      mediaRecorder.onstop = async () => {
        setRecordingState("processing");
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        mediaRecorder.stream.getTracks().forEach(t => t.stop());
        try {
          const base64DataUrl = await new Promise<string>((res, rej) => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result as string);
            reader.onerror = () => rej(new Error("Failed to read audio"));
            reader.readAsDataURL(audioBlob);
          });
          const { data, error } = await supabase.functions.invoke("fal-whisper", {
            body: { audio_url: base64DataUrl },
          });
          if (error) throw error;
          if (data?.text?.trim()) {
            setThesis(prev => prev ? prev + " " + data.text.trim() : data.text.trim());
            toast.success("התמלול הושלם!");
            await detectConfluences(data.text.trim());
          } else { toast.warning("לא זוהה טקסט"); }
        } catch (err: any) {
          toast.error(err?.message || "שגיאת תמלול");
        } finally { setRecordingState("idle"); resolve(); }
      };
      mediaRecorder.stop();
    });
  }, []);

  /* ===== Save trade ===== */
  const handleSave = async () => {
    if (!asset.trim() || !entryPrice) { toast.error("נא למלא נכס ומחיר כניסה"); return; }
    if (!user?.id) { toast.error("לא מחובר"); return; }
    setSaving(true);
    try {
      const rulesScore = Object.values(rulesFollowed).filter(v => v === true).length;
      const totalRules = RULES.length;

      const { error } = await supabase.from("trades").insert({
        user_id: user.id,
        symbol: asset.trim().toUpperCase(),
        entry_price: parseFloat(entryPrice),
        exit_price: null,
        stop_loss: stopLoss ? parseFloat(stopLoss) : null,
        take_profit: takeProfit ? parseFloat(takeProfit) : null,
        lot_size: lotSize ? parseFloat(lotSize) : 1,
        status: "open",
        direction,
        entry_time: new Date().toISOString(),
        notes: thesis || quickDesc || null,
        setup_type: selectedConfluences[0] || null,
        confirmations: selectedConfluences,
        followed_rules: rulesScore === totalRules,
        psychology_notes: selectedEmotion || null,
        rating: rating || null,
        timeframe: timeframe || null,
        screenshots: chartPreviews.length > 0 ? chartPreviews : null,
        tags: ["manual", session, marketCondition].filter(Boolean),
      });

      if (error) throw error;
      toast.success("העסקה נפתחה בהצלחה! 🎉");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "שגיאת שמירה");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const passedRules = Object.values(rulesFollowed).filter(v => v === true).length;
  const failedRules = Object.values(rulesFollowed).filter(v => v === false).length;
  const rrRatio = entryPrice && stopLoss && takeProfit
    ? Math.abs((parseFloat(takeProfit) - parseFloat(entryPrice)) / (parseFloat(entryPrice) - parseFloat(stopLoss))).toFixed(1)
    : null;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

      <div className={`fixed z-[71] overflow-y-auto bg-[#0d0d12] animate-in duration-300 ${
        isMobile
          ? "inset-x-0 bottom-0 max-h-[94vh] rounded-t-3xl border-t border-primary/15 slide-in-from-bottom-full"
          : "inset-y-0 right-0 w-[500px] border-l border-white/[0.06] slide-in-from-right-full"
      }`}>
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-l from-transparent via-primary/50 to-transparent" />

        {isMobile && <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-white/10" /></div>}

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-[#0d0d0d]/95 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-foreground">יומן מסחר חכם</h2>
              <p className="text-[10px] text-muted-foreground/40 font-mono">AI-POWERED TRADE LOG</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Stats pills */}
            {passedRules > 0 && (
              <div className="flex items-center gap-1 rounded-lg bg-profit/10 border border-profit/15 px-2 py-1">
                <CheckCircle2 className="h-3 w-3 text-profit" />
                <span className="text-[10px] font-bold text-profit">{passedRules}</span>
              </div>
            )}
            {selectedConfluences.length > 0 && (
              <div className="flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/15 px-2 py-1">
                <Zap className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold text-primary">{selectedConfluences.length}</span>
              </div>
            )}
            <button onClick={onClose} className="haptic-press flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-muted-foreground/40 hover:text-foreground transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5 pb-8">

          {/* ===== AI Quick Entry ===== */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-bold text-primary font-mono uppercase">כניסה מהירה עם AI</span>
            </div>
            <textarea
              rows={2}
              value={quickDesc}
              onChange={e => setQuickDesc(e.target.value)}
              placeholder="תאר את העסקה... למשל: נכנסתי לשורט NQ על Order Block ב-FVG אחרי BOS"
              className="w-full rounded-xl border border-primary/15 bg-white/[0.03] px-4 py-3 text-[12px] text-foreground placeholder:text-muted-foreground/25 outline-none focus:border-primary/40 resize-none transition-all leading-relaxed"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAiExtract}
                disabled={aiExtracting || !quickDesc.trim()}
                className="haptic-press flex-1 flex items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 py-2.5 text-[12px] font-bold text-primary hover:bg-primary/20 disabled:opacity-40 transition-all"
              >
                {aiExtracting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                מלא אוטומטי
              </button>
              <button
                onClick={handleAiAnalyze}
                disabled={aiAnalyzing || (!quickDesc.trim() && !thesis.trim())}
                className="haptic-press flex-1 flex items-center justify-center gap-2 rounded-xl border border-accent/25 bg-accent/8 py-2.5 text-[12px] font-bold text-accent hover:bg-accent/15 disabled:opacity-40 transition-all"
              >
                {aiAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
                נתח חוקים
              </button>
            </div>
          </div>

          {/* ===== AI Score ===== */}
          {aiScore && (
            <div className={`rounded-2xl border p-4 space-y-3 ${
              aiScore.score >= 70 ? "border-profit/20 bg-profit/[0.04]" :
              aiScore.score >= 40 ? "border-accent/20 bg-accent/[0.04]" :
              "border-loss/20 bg-loss/[0.04]"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground/60 font-mono uppercase">ניתוח AI</span>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-black ${aiScore.score >= 70 ? "text-profit" : aiScore.score >= 40 ? "text-accent" : "text-loss"}`}>
                    {aiScore.score}
                  </span>
                  <span className="text-[10px] text-muted-foreground/40">/100</span>
                </div>
              </div>
              {aiScore.passes.length > 0 && (
                <div className="space-y-1">
                  {aiScore.passes.slice(0, 3).map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-profit/80">
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      {p}
                    </div>
                  ))}
                </div>
              )}
              {aiScore.issues.length > 0 && (
                <div className="space-y-1">
                  {aiScore.issues.slice(0, 3).map((issue, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-loss/80">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      {issue}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== Asset + Direction ===== */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-[10px] font-semibold text-muted-foreground/40 mb-1.5 block font-mono uppercase">נכס</label>
              <input
                type="text"
                value={asset}
                onChange={e => setAsset(e.target.value.toUpperCase())}
                placeholder="NQ, BTC..."
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-[13px] font-bold text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30 transition-all text-center"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-semibold text-muted-foreground/40 mb-1.5 block font-mono uppercase">כיוון</label>
              <div className="grid grid-cols-2 gap-2 h-[48px]">
                <button
                  onClick={() => setDirection("long")}
                  className={`haptic-press flex items-center justify-center gap-1.5 rounded-xl border text-[12px] font-bold transition-all ${
                    direction === "long"
                      ? "border-profit/30 bg-gradient-to-b from-profit/15 to-profit/5 text-profit shadow-[0_0_16px_rgba(0,212,100,0.2)]"
                      : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 hover:bg-white/[0.04] hover:border-profit/15"
                  }`}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" /> LONG
                </button>
                <button
                  onClick={() => setDirection("short")}
                  className={`haptic-press flex items-center justify-center gap-1.5 rounded-xl border text-[12px] font-bold transition-all ${
                    direction === "short"
                      ? "border-loss/30 bg-gradient-to-b from-loss/15 to-loss/5 text-loss shadow-[0_0_16px_rgba(239,68,68,0.2)]"
                      : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 hover:bg-white/[0.04] hover:border-loss/15"
                  }`}
                >
                  <ArrowDownRight className="h-3.5 w-3.5" /> SHORT
                </button>
              </div>
            </div>
          </div>

          {/* ===== Prices ===== */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground/40 mb-1.5 block font-mono uppercase">מחיר כניסה</label>
              <input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="Entry"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground/40 mb-1.5 block font-mono uppercase">לוט / כמות</label>
              <input type="number" value={lotSize} onChange={e => setLotSize(e.target.value)} placeholder="0.01" step="0.01"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-loss/50 mb-1.5 block font-mono uppercase">Stop Loss</label>
              <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)} placeholder="SL"
                className="w-full rounded-xl border border-loss/15 bg-loss/[0.04] px-3 py-3 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-loss/30 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-profit/50 mb-1.5 block font-mono uppercase">Take Profit</label>
              <input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} placeholder="TP"
                className="w-full rounded-xl border border-profit/15 bg-profit/[0.04] px-3 py-3 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-profit/30 transition-all" />
            </div>
          </div>

          {/* RR Ratio live calc */}
          {rrRatio && (
            <div className={`flex items-center justify-between rounded-xl border px-4 py-2.5 ${
              parseFloat(rrRatio) >= 2 ? "border-profit/20 bg-profit/[0.05]" : "border-loss/20 bg-loss/[0.05]"
            }`}>
              <span className="text-[11px] text-muted-foreground/50 font-mono">יחס R:R</span>
              <span className={`text-[15px] font-black font-mono ${parseFloat(rrRatio) >= 2 ? "text-profit" : "text-loss"}`}>
                1 : {rrRatio}
              </span>
            </div>
          )}

          {/* ===== Timeframe + Session ===== */}
          <div className="space-y-3">
            {/* Timeframe */}
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground/40 mb-2 block font-mono uppercase flex items-center gap-1.5">
                <Monitor className="h-3 w-3" /> טיים-פריים
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TIMEFRAMES.map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(prev => prev === tf ? "" : tf)}
                    className={`haptic-press rounded-lg border px-3 py-2 min-h-[36px] text-[11px] font-mono font-bold transition-all ${
                      timeframe === tf
                        ? "border-primary/30 bg-primary/12 text-primary"
                        : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 hover:bg-white/[0.04]"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Session */}
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground/40 mb-2 block font-mono uppercase flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> סשן מסחר
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SESSIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSession(prev => prev === s.id ? "" : s.id)}
                    className={`haptic-press flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                      session === s.id
                        ? "border-accent/30 bg-accent/10 text-accent"
                        : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                    <span className="text-[9px] opacity-50 font-mono">{s.time}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Market Condition */}
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground/40 mb-2 block font-mono uppercase flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" /> מצב שוק
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MARKET_CONDITIONS.map(mc => (
                  <button
                    key={mc.id}
                    onClick={() => setMarketCondition(prev => prev === mc.id ? "" : mc.id)}
                    className={`haptic-press flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                      marketCondition === mc.id
                        ? "border-primary/25 bg-primary/8 text-primary"
                        : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span>{mc.emoji}</span>
                    <span>{mc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ===== Thesis + Voice ===== */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-semibold text-muted-foreground/40 font-mono uppercase">תזה (Thesis)</label>
              <button
                onClick={() => recordingState === "recording" ? stopRecording() : startRecording()}
                disabled={recordingState === "processing"}
                className={`haptic-press flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  recordingState === "recording" ? "bg-loss/15 text-loss border border-loss/30 animate-pulse" :
                  recordingState === "processing" ? "bg-primary/10 text-primary border border-primary/20" :
                  "bg-white/[0.04] text-muted-foreground/50 border border-white/[0.08] hover:text-primary hover:border-primary/20"
                }`}
              >
                {recordingState === "recording" ? <><MicOff className="h-3 w-3" /> עצור</> :
                 recordingState === "processing" ? <><Loader2 className="h-3 w-3 animate-spin" /> מתמלל...</> :
                 <><Mic className="h-3 w-3" /> 🎙️ Voice</>}
              </button>
            </div>
            <textarea
              rows={3}
              value={thesis}
              onChange={e => setThesis(e.target.value)}
              placeholder="למה אני נכנס? מה ה-edge שלי? מה רואה בגרף?"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[12px] text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30 resize-none transition-all leading-relaxed"
            />
          </div>

          {/* ===== Chart Screenshot ===== */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground/40 mb-2 block font-mono uppercase flex items-center gap-1.5">
              <ImagePlus className="h-3 w-3" /> צילום גרף
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleImageUpload(e.target.files)}
            />
            {chartPreviews.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {chartPreviews.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`גרף ${i + 1}`} className="h-20 w-32 object-cover rounded-xl border border-white/[0.08]" />
                    <button
                      onClick={() => setChartPreviews(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 left-1 h-5 w-5 rounded-full bg-loss/80 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="haptic-press w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] py-3 text-[12px] text-muted-foreground/40 hover:border-primary/25 hover:text-primary/60 hover:bg-primary/[0.03] transition-all"
            >
              {uploadingImage
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> מעלה...</>
                : <><ImagePlus className="h-3.5 w-3.5" /> לחץ להוספת צילום גרף</>
              }
            </button>
          </div>

          {/* ===== Confluences ===== */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-semibold text-muted-foreground/40 font-mono uppercase flex items-center gap-1.5">
                <Zap className="h-3 w-3" /> אישורים ({selectedConfluences.length})
              </label>
              {selectedConfluences.length > 0 && (
                <button onClick={() => setSelectedConfluences([])} className="text-[9px] text-muted-foreground/30 hover:text-loss transition-colors">
                  נקה הכל
                </button>
              )}
            </div>
            <div className="space-y-2">
              {CONFLUENCE_GROUPS.map(group => (
                <div key={group.label} className="rounded-xl border border-white/[0.05] overflow-hidden">
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[13px]">{group.icon}</span>
                      <span className="text-[11px] font-semibold text-foreground/60">{group.label}</span>
                      {group.items.filter(i => selectedConfluences.includes(i)).length > 0 && (
                        <span className="rounded-full bg-primary/20 text-primary text-[9px] font-bold px-1.5 py-0.5">
                          {group.items.filter(i => selectedConfluences.includes(i)).length}
                        </span>
                      )}
                    </div>
                    {expandedGroups.includes(group.label) ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/30" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/30" />}
                  </button>
                  {expandedGroups.includes(group.label) && (
                    <div className="flex flex-wrap gap-1.5 p-3 pt-2">
                      {group.items.map(c => {
                        const selected = selectedConfluences.includes(c);
                        return (
                          <button key={c} onClick={() => toggleConfluence(c)}
                            className={`haptic-press flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                              selected ? "border-primary/30 bg-primary/12 text-primary shadow-[0_0_8px_rgba(0,212,170,0.15)]" : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/45 hover:bg-white/[0.05]"
                            }`}
                          >
                            {selected && <CheckCircle2 className="h-2.5 w-2.5" />}
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ===== Rules Checker ===== */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-3.5 w-3.5 text-accent" />
              <label className="text-[10px] font-semibold text-muted-foreground/40 font-mono uppercase">חוקי מסחר</label>
              {(passedRules > 0 || failedRules > 0) && (
                <div className="flex items-center gap-1.5 mr-auto">
                  <span className="text-[10px] text-profit font-bold">✓ {passedRules}</span>
                  <span className="text-muted-foreground/20">|</span>
                  <span className="text-[10px] text-loss font-bold">✗ {failedRules}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {RULES.map(rule => {
                const val = rulesFollowed[rule.id];
                return (
                  <div key={rule.id} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 transition-all ${
                    val === true ? "border-profit/20 bg-profit/[0.04]" :
                    val === false ? "border-loss/20 bg-loss/[0.04]" :
                    "border-white/[0.05] bg-white/[0.02]"
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <rule.icon className={`h-3.5 w-3.5 shrink-0 ${val === true ? "text-profit" : val === false ? "text-loss" : "text-muted-foreground/30"}`} />
                      <span className={`text-[11px] font-medium ${val === true ? "text-profit/80" : val === false ? "text-loss/70 line-through" : "text-foreground/60"}`}>
                        {rule.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toggleRule(rule.id, true)}
                        className={`h-7 w-7 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all ${val === true ? "bg-profit/20 text-profit border border-profit/30" : "bg-white/[0.04] text-muted-foreground/30 border border-white/[0.06] hover:border-profit/20 hover:text-profit"}`}>
                        ✓
                      </button>
                      <button onClick={() => toggleRule(rule.id, false)}
                        className={`h-7 w-7 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all ${val === false ? "bg-loss/20 text-loss border border-loss/30" : "bg-white/[0.04] text-muted-foreground/30 border border-white/[0.06] hover:border-loss/20 hover:text-loss"}`}>
                        ✗
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===== Emotion + Rating ===== */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground/40 mb-2 block font-mono uppercase">מצב רגשי</label>
              <div className="flex flex-wrap gap-1.5">
                {EMOTIONS.map(e => (
                  <button key={e.label} onClick={() => setSelectedEmotion(prev => prev === e.label ? "" : e.label)}
                    className={`haptic-press rounded-xl border px-2 py-1.5 text-[11px] transition-all ${
                      selectedEmotion === e.label ? "border-primary/30 bg-primary/10 text-foreground" : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 hover:bg-white/[0.04]"
                    }`}
                  >
                    {e.emoji} {e.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground/40 mb-2 block font-mono uppercase">דירוג עסקה</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setRating(prev => prev === n ? 0 : n)}
                    className={`haptic-press h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                      rating >= n ? "text-accent" : "text-muted-foreground/20 hover:text-muted-foreground/40"
                    }`}
                  >
                    <Star className={`h-5 w-5 ${rating >= n ? "fill-accent" : ""}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ===== Summary bar ===== */}
          {(selectedConfluences.length > 0 || passedRules > 0) && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-[16px] font-black text-primary">{selectedConfluences.length}</p>
                  <p className="text-[9px] text-muted-foreground/40 font-mono">CONF</p>
                </div>
                <div className="h-8 w-px bg-white/[0.06]" />
                <div className="text-center">
                  <p className="text-[16px] font-black text-profit">{passedRules}</p>
                  <p className="text-[9px] text-muted-foreground/40 font-mono">RULES</p>
                </div>
                {rrRatio && <>
                  <div className="h-8 w-px bg-white/[0.06]" />
                  <div className="text-center">
                    <p className={`text-[16px] font-black ${parseFloat(rrRatio) >= 2 ? "text-profit" : "text-loss"}`}>1:{rrRatio}</p>
                    <p className="text-[9px] text-muted-foreground/40 font-mono">R:R</p>
                  </div>
                </>}
              </div>
              <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 ${
                selectedConfluences.length >= 3 && passedRules >= 5 ? "bg-profit/10 border border-profit/20" : "bg-accent/8 border border-accent/15"
              }`}>
                <BarChart2 className={`h-3.5 w-3.5 ${selectedConfluences.length >= 3 && passedRules >= 5 ? "text-profit" : "text-accent"}`} />
                <span className={`text-[11px] font-bold ${selectedConfluences.length >= 3 && passedRules >= 5 ? "text-profit" : "text-accent"}`}>
                  {selectedConfluences.length >= 3 && passedRules >= 5 ? "כניסה חזקה" : "כניסה סבירה"}
                </span>
              </div>
            </div>
          )}

          {/* ===== Submit ===== */}
          <button
            onClick={handleSave}
            disabled={saving || !asset.trim() || !entryPrice}
            className="haptic-press w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-primary to-emerald-500 py-4 text-[14px] font-bold text-black transition-all hover:brightness-110 disabled:opacity-40 shadow-lg shadow-primary/20 min-h-[56px]"
          >
            {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> שומר...</> : <><Plus className="h-5 w-5" /> פתח עסקה</>}
          </button>

        </div>
      </div>
    </>
  );
};

export default ForensicTradeDrawer;
