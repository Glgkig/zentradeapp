import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Eye, EyeOff, Loader2, Brain, Shield, Zap, TrendingUp, Sparkles, ChevronLeft,
  BarChart2, Lock, Star, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import ZenTradeLogo from "@/components/ZenTradeLogo";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

/* ═══════════════════════════════════════════════════════
   LOGIN LOBBY — CINEMATIC
═══════════════════════════════════════════════════════ */

const PERKS = [
  { icon: Brain,      color: "#a78bfa", label: "AI מנטור",       detail: "ניתוח פסיכולוגי בזמן אמת" },
  { icon: TrendingUp, color: "#4ade80", label: "יומן חכם",       detail: "תובנות אוטומטיות" },
  { icon: BarChart2,  color: "#fbbf24", label: "סטטיסטיקות",     detail: "Win Rate, PF, Drawdown" },
  { icon: Shield,     color: "#f87171", label: "Kill Switch",    detail: "הגנה אוטומטית על ההון" },
];

const MOCK_TRADES = [
  { sym: "NQ", dir: "LONG",  pnl: +842,  time: "09:32" },
  { sym: "ES", dir: "SHORT", pnl: -215,  time: "10:14" },
  { sym: "GC", dir: "LONG",  pnl: +1320, time: "11:05" },
  { sym: "CL", dir: "SHORT", pnl: +560,  time: "13:47" },
];

const SOCIAL_PROOFS = [
  "🇮🇱 סוחר מתל אביב התחבר לפני דקה",
  "📈 12 עסקאות תועדו היום",
  "🏆 Win Rate ממוצע: 67%",
];

const TESTIMONIALS = [
  { name: "אורי כ.", avatar: "א", color: "#7c3aed", stars: 5, text: "הבנתי שאני מפסיד כל פעם ב-15:30." },
  { name: "מיכל ג.", avatar: "מ", color: "#0891b2", stars: 5, text: "ה-AI מנטור שינה לי את המיינדסט." },
  { name: "דוד ל.",  avatar: "ד", color: "#059669", stars: 5, text: "ראיתי דברים שלא ידעתי עליהם שנים." },
];

const LoginLobby = ({ onContinue }: { onContinue: () => void }) => {
  const [vis, setVis] = useState(false);
  const [tick, setTick] = useState(0);
  // Live money counter — starts at a realistic base and ticks up
  const [liveProfit, setLiveProfit] = useState(4_827_340);

  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setInterval(() => setTick(v => (v + 1) % 3), 3500); return () => clearInterval(t); }, []);
  useEffect(() => {
    const t = setInterval(() => {
      // Add random $50–$800 every 1.2s to simulate live trading profits
      setLiveProfit(v => v + Math.floor(Math.random() * 750 + 50));
    }, 1200);
    return () => clearInterval(t);
  }, []);

  const fly = (i: number, axis: "Y" | "X" = "Y") => ({
    opacity: vis ? 1 : 0,
    transform: vis ? "translate(0,0)" : axis === "Y" ? "translateY(28px)" : "translateX(-18px)",
    transition: `opacity 0.7s ${i * 0.08}s, transform 0.7s ${i * 0.08}s cubic-bezier(0.2,0.8,0.4,1)`,
  });

  return (
    <>
      <style>{`
        @keyframes loginGlow {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 0.8; transform: scale(1.08); }
        }
        @keyframes loginFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes loginTickIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes loginShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes loginBorderPulse {
          0%,100% { border-color: rgba(8,145,178,0.25); box-shadow: 0 0 20px rgba(8,145,178,0.1); }
          50%      { border-color: rgba(8,145,178,0.5);  box-shadow: 0 0 40px rgba(8,145,178,0.25), 0 0 80px rgba(124,58,237,0.1); }
        }
      `}</style>

      <div className="min-h-screen bg-[#04040d] flex flex-col overflow-x-hidden relative" dir="rtl">

        {/* ── Background ── */}
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(8,145,178,0.11) 0%, transparent 65%)", animation: "loginGlow 8s ease-in-out infinite" }} />
          <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 65%)", animation: "loginGlow 10s ease-in-out infinite 2s" }} />
          <div className="absolute top-[35%] right-[45%] w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(74,222,128,0.04) 0%, transparent 65%)", animation: "loginGlow 12s ease-in-out infinite 4s" }} />
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(8,145,178,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(8,145,178,0.035) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, #04040d 90%)" }} />
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="absolute rounded-full animate-pulse"
              style={{
                left: `${(i * 41 + 7) % 100}%`, top: `${(i * 61 + 13) % 100}%`,
                width: 1 + (i % 3) * 0.8, height: 1 + (i % 3) * 0.8,
                background: ["#22d3ee","#a78bfa","#4ade80","#f9a8d4"][i % 4],
                opacity: 0.04 + (i % 5) * 0.02,
                animationDuration: `${4 + (i % 7)}s`, animationDelay: `${(i % 9) * 0.35}s`,
              }} />
          ))}
        </div>

        {/* ── Live money ticker ── */}
        <div className="relative z-20 flex items-center justify-center gap-3 py-2 border-b border-white/[0.04]"
          style={{ background: "rgba(74,222,128,0.05)" }}>
          <div className="relative">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px #4ade80" }} />
            <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-green-400 animate-ping opacity-50" />
          </div>
          <span className="text-[12px] font-mono font-bold text-white/50">
            💰 רווח מתועד היום ב-ZenTrade:{" "}
            <span className="text-green-400" style={{ textShadow: "0 0 10px rgba(74,222,128,0.6)" }}>
              ${liveProfit.toLocaleString()}
            </span>
          </span>
        </div>

        {/* ── Navbar ── */}
        <nav className="relative z-20 flex items-center justify-between px-5 sm:px-8 py-4 border-b border-white/[0.04] backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden"
              style={{ background: "rgba(8,145,178,0.12)", border: "1px solid rgba(8,145,178,0.25)" }}>
              <ZenTradeLogo size={30} transparent />
            </div>
            <div>
              <span className="font-black text-[16px] text-white tracking-tight">ZenTrade</span>
              <span className="text-[9px] font-mono text-white/20 block leading-none tracking-widest">TRADING PLATFORM</span>
            </div>
          </div>
          <Link to="/signup"
            className="flex items-center gap-1.5 text-[12px] font-semibold text-white/40 hover:text-white/80 transition-colors rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 hover:border-white/[0.12]">
            <span>צור חשבון</span>
            <ChevronLeft className="h-3 w-3" />
          </Link>
        </nav>

        {/* ── Main layout ── */}
        <div className="relative z-10 flex-1 flex flex-col xl:flex-row items-center max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 gap-10 xl:gap-16">

          {/* ════ LEFT COLUMN ════ */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Welcome badge */}
            <div className="flex items-center gap-2.5 mb-6 w-fit rounded-full px-3.5 py-2"
              style={{ background: "rgba(8,145,178,0.08)", border: "1px solid rgba(8,145,178,0.22)", ...fly(0) }}>
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-cyan-400" style={{ boxShadow: "0 0 8px #22d3ee" }} />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-60" />
              </div>
              <span className="text-[11px] font-mono font-bold text-cyan-300 tracking-wide">ברוך הבא חזרה · המשך מאיפה שעצרת</span>
            </div>

            {/* Headline */}
            <div style={fly(1)}>
              <h1 className="font-black leading-[1.1] mb-5" style={{ fontSize: "clamp(34px, 5vw, 58px)" }}>
                <span className="text-white">הקוקפיט שלך</span><br />
                <span style={{
                  background: "linear-gradient(135deg, #67e8f9 0%, #22d3ee 30%, #818cf8 70%, #a78bfa 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "loginShimmer 4s linear infinite",
                }}>מחכה לך</span>
              </h1>
              <p className="text-[15px] text-white/40 leading-relaxed max-w-lg mb-8">
                התחבר וחזור לנתח, לתעד ולשפר את הביצועים שלך.<br />
                <span className="text-white/20">המסחר החכם שלך ממשיך.</span>
              </p>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
              {PERKS.map(({ icon: Icon, color, label, detail }, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl px-3.5 py-3"
                  style={{ background: color + "0a", border: `1px solid ${color}20`, ...fly(3 + i, "X") }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0"
                    style={{ background: color + "15", border: `1px solid ${color}28` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-white">{label}</p>
                    <p className="text-[10px] text-white/30">{detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" style={fly(8)}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-full flex items-center justify-center font-black text-[10px] text-white shrink-0"
                      style={{ background: t.color + "30", border: `1px solid ${t.color}50` }}>{t.avatar}</div>
                    <div>
                      <p className="text-[11px] font-bold text-white/70">{t.name}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.stars }).map((_, j) => <Star key={j} className="h-2 w-2 fill-amber-400 text-amber-400" />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/30 leading-relaxed">"{t.text}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* ════ RIGHT COLUMN ════ */}
          <div className="xl:w-[420px] w-full flex flex-col gap-5" style={fly(1)}>

            {/* Dashboard preview */}
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-cyan-900/20"
              style={{
                border: "1px solid rgba(8,145,178,0.25)",
                background: "linear-gradient(145deg, rgba(13,13,26,0.95), rgba(8,8,18,0.98))",
                animation: "loginBorderPulse 4s ease-in-out infinite, loginFloat 6s ease-in-out infinite",
              }}>
              {/* Chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.05]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="text-[10px] text-white/15 font-mono mr-auto">ZenTrade · יומן מסחר</span>
              </div>
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-px bg-white/[0.04] mx-4 mt-4 rounded-2xl overflow-hidden">
                {[
                  { label: "P&L היום", val: "+$2,507", color: "#4ade80" },
                  { label: "Win Rate", val: "71%",     color: "#22d3ee" },
                  { label: "עסקאות",  val: "4",        color: "#a78bfa" },
                ].map((k, i) => (
                  <div key={i} className="flex flex-col items-center py-3 px-2" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <span className="text-[13px] font-black" style={{ color: k.color }}>{k.val}</span>
                    <span className="text-[9px] text-white/25 font-mono">{k.label}</span>
                  </div>
                ))}
              </div>
              {/* Trades */}
              <div className="px-4 py-3 space-y-1.5">
                <p className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-widest mb-2">עסקאות אחרונות</p>
                {MOCK_TRADES.map((tr, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: tr.pnl > 0 ? "rgba(74,222,128,0.06)" : "rgba(248,113,113,0.06)", border: `1px solid ${tr.pnl > 0 ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)"}` }}>
                    <span className="text-[11px] font-black text-white/70 w-7">{tr.sym}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md"
                      style={{ background: tr.dir === "LONG" ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)", color: tr.dir === "LONG" ? "#4ade80" : "#f87171" }}>
                      {tr.dir}
                    </span>
                    <span className="text-[9px] text-white/20 font-mono mr-auto">{tr.time}</span>
                    <div className="flex items-center gap-0.5">
                      {tr.pnl > 0 ? <ArrowUpRight className="h-3 w-3 text-green-400" /> : <ArrowDownRight className="h-3 w-3 text-red-400" />}
                      <span className="text-[12px] font-black" style={{ color: tr.pnl > 0 ? "#4ade80" : "#f87171" }}>
                        {tr.pnl > 0 ? "+" : ""}{tr.pnl}$
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* AI */}
              <div className="mx-4 mb-4 rounded-2xl px-3 py-2.5"
                style={{ background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.14)" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Brain className="h-3 w-3 text-cyan-400" />
                  <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider">AI מנטור</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  "Win Rate שלך השבוע עלה ל-71%. ה-LONG ב-NQ היה המהלך הטוב ביותר."
                </p>
              </div>
            </div>

            {/* CTA card */}
            <div className="rounded-3xl p-5"
              style={{
                background: "linear-gradient(145deg, rgba(8,145,178,0.1), rgba(79,70,229,0.07), rgba(124,58,237,0.05))",
                border: "1px solid rgba(8,145,178,0.22)",
                boxShadow: "0 8px 40px rgba(8,145,178,0.12)",
              }}>

              {/* Social proof ticker */}
              <div className="flex items-center gap-2 mb-4 h-7 overflow-hidden">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 animate-pulse" />
                <span key={tick} className="block text-[11px] text-cyan-300/70 font-mono"
                  style={{ animation: "loginTickIn 0.4s ease forwards" }}>
                  {SOCIAL_PROOFS[tick]}
                </span>
              </div>

              <div className="h-px bg-gradient-to-l from-transparent via-cyan-500/20 to-transparent mb-4" />

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[16px] font-black text-white">ברוך הבא חזרה</p>
                  <p className="text-[11px] text-white/30">הכנס לחשבון ZenTrade שלך</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden"
                  style={{ background: "rgba(8,145,178,0.12)", border: "1px solid rgba(8,145,178,0.25)" }}>
                  <ZenTradeLogo size={38} transparent />
                </div>
              </div>

              <button onClick={onContinue}
                className="group relative w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-[15px] font-black text-white overflow-hidden transition-all active:scale-[0.98] hover:brightness-115 mb-3"
                style={{
                  background: "linear-gradient(135deg, #0891b2 0%, #4f46e5 50%, #7c3aed 100%)",
                  boxShadow: "0 0 40px rgba(8,145,178,0.4), 0 4px 24px rgba(0,0,0,0.5)",
                }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)", backgroundSize: "200% auto", animation: "loginShimmer 1.5s linear infinite" }} />
                <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform relative z-10" />
                <span className="relative z-10">התחבר לחשבון</span>
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform relative z-10" />
              </button>

              <div className="flex items-center justify-center gap-5">
                {[{ icon: Shield, t: "SSL מאובטח" }, { icon: Zap, t: "מהיר · תוך שניות" }, { icon: Lock, t: "פרטיות מלאה" }].map(({ icon: Icon, t }) => (
                  <div key={t} className="flex items-center gap-1">
                    <Icon className="h-2.5 w-2.5 text-white/20" />
                    <span className="text-[9px] font-mono text-white/20">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════
   LOGIN FORM
═══════════════════════════════════════════════════════ */
const LoginPage = () => {
  const [step, setStep] = useState<"lobby" | "form">("lobby");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const attemptsRef = useRef(0);
  const lockUntilRef = useRef(0);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  useEffect(() => {
    document.documentElement.classList.remove("light");
    return () => {
      const saved = localStorage.getItem("zentrade-theme");
      if (saved === "light") document.documentElement.classList.add("light");
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("נא למלא את כל השדות"); return; }
    if (Date.now() < lockUntilRef.current) {
      const remaining = Math.ceil((lockUntilRef.current - Date.now()) / 60000);
      setError(`יותר מדי ניסיונות. נסה שוב בעוד ${remaining} דקות`);
      return;
    }
    setSubmitting(true);
    try {
      const { error: authError } = await signIn(email, password);
      if (authError) {
        attemptsRef.current++;
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          lockUntilRef.current = Date.now() + LOCKOUT_MS;
          attemptsRef.current = 0;
          setError("יותר מדי ניסיונות. נסה שוב בעוד 15 דקות");
        } else if (authError.message === "Email not confirmed") {
          setError("נא לאמת את כתובת האימייל שלך תחילה");
        } else if (authError.message === "Invalid login credentials") {
          setError("אימייל או סיסמה שגויים");
        } else {
          setError(authError.message);
        }
        return;
      }
      attemptsRef.current = 0;
      toast.success("התחברת בהצלחה!");
      navigate("/dashboard");
    } catch {
      setError("בעיית חיבור. בדוק את האינטרנט ונסה שוב");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "lobby") return <LoginLobby onContinue={() => setStep("form")} />;

  return (
    <div className="min-h-screen bg-[#04040d] flex flex-col items-center justify-center px-4 overflow-hidden relative" dir="rtl">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-160px] left-[-80px] w-[500px] h-[500px] rounded-full bg-cyan-600/[0.07] blur-[140px]" />
        <div className="absolute bottom-[-160px] right-[-80px] w-[440px] h-[440px] rounded-full bg-purple-500/[0.05] blur-[130px]" />
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(8,145,178,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(8,145,178,0.03) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }} />
      </div>

      <nav className="fixed top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 bg-[#04040d]/85 backdrop-blur-xl border-b border-white/[0.05]">
        <button onClick={() => setStep("lobby")}
          className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[13px] font-semibold text-white/75 hover:text-white hover:bg-white/[0.07] transition-all active:scale-95">
          <ChevronLeft className="h-4 w-4" />
          <span>חזרה</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden"
            style={{ background: "rgba(8,145,178,0.12)", border: "1px solid rgba(8,145,178,0.25)" }}>
            <ZenTradeLogo size={22} transparent />
          </div>
          <span className="text-sm font-bold text-white">ZenTrade</span>
        </div>
        <Link to="/signup" className="text-[12px] font-medium text-cyan-400 hover:underline">הירשם</Link>
      </nav>

      <div className="relative z-10 w-full max-w-sm mt-16">
        <div className="h-[2px] w-full rounded-t-full bg-gradient-to-l from-transparent via-cyan-500/60 to-transparent" />
        <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d18]/90 backdrop-blur-2xl p-7 shadow-2xl shadow-black/60">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 relative w-fit">
              <div className="absolute inset-0 rounded-xl bg-cyan-500/20 blur-lg scale-150" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden"
                style={{ background: "rgba(8,145,178,0.15)", border: "1px solid rgba(8,145,178,0.3)" }}>
                <ZenTradeLogo size={40} transparent />
              </div>
            </div>
            <h2 className="text-xl font-extrabold text-white">ברוך הבא חזרה</h2>
            <p className="text-[11px] text-white/30 mt-1">הכנס את הפרטים שלך</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/[0.08] px-4 py-2.5 text-[12px] text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-white/40">אימייל</label>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="name@example.com" dir="ltr" autoComplete="email"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white text-left placeholder:text-white/20 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-white/40">סיסמה</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••" dir="ltr" autoComplete="current-password"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 pr-11 text-sm text-white text-left placeholder:text-white/20 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-white/10 bg-white/5 accent-cyan-500" />
                <span className="text-[11px] text-white/30">זכור אותי</span>
              </label>
              <Link to="/forgot-password" className="text-[11px] text-cyan-400 hover:underline">שכחת סיסמה?</Link>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full rounded-xl py-3.5 text-sm font-black text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
              style={{
                background: "linear-gradient(135deg, #0891b2 0%, #4f46e5 50%, #7c3aed 100%)",
                boxShadow: "0 0 24px rgba(8,145,178,0.3)",
              }}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> מתחבר...</> : <><Sparkles className="h-4 w-4" /> היכנס לחשבון</>}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] text-white/25">
            אין לך חשבון?{" "}
            <Link to="/signup" className="text-cyan-400 hover:underline font-semibold">הירשם עכשיו</Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mt-5">
          {[{ icon: Shield, text: "מאובטח SSL" }, { icon: Zap, text: "מהיר · תוך שניות" }].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-white/20">
              <Icon className="h-3 w-3" />
              <span className="text-[10px] font-mono">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
