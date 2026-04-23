import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Eye, EyeOff, Shield, Loader2, Zap, Brain, TrendingUp,
  Sparkles, ChevronLeft, Check, BarChart2, Lock, Star,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import ZenTradeLogo from "@/components/ZenTradeLogo";

/* ═══════════════════════════════════════════════════════
   SIGNUP LOBBY — CINEMATIC
═══════════════════════════════════════════════════════ */

const PERKS = [
  { icon: Brain,      color: "#a78bfa", label: "AI מנטור",          detail: "ניתוח פסיכולוגי בזמן אמת" },
  { icon: TrendingUp, color: "#4ade80", label: "יומן חכם",          detail: "תובנות אוטומטיות לכל עסקה" },
  { icon: BarChart2,  color: "#fbbf24", label: "סטטיסטיקות Pro",    detail: "Win Rate, PF, Drawdown" },
  { icon: Shield,     color: "#f87171", label: "Kill Switch",       detail: "הגנה אוטומטית על ההון" },
  { icon: Lock,       color: "#22d3ee", label: "אבטחה מלאה",        detail: "SSL · ללא שיתוף נתונים" },
];

const TESTIMONIALS = [
  { name: "אורי כ.", avatar: "א", color: "#7c3aed", stars: 5, text: "הבנתי שאני מפסיד כל פעם ב-15:30. שיניתי לגמרי." },
  { name: "מיכל ג.", avatar: "מ", color: "#0891b2", stars: 5, text: "ה-AI מנטור שינה לי את המיינדסט לחלוטין." },
  { name: "דוד ל.",  avatar: "ד", color: "#059669", stars: 5, text: "ראיתי דברים שלא ידעתי עליהם שנים." },
];

/* Mini mock trade rows for the dashboard preview */
const MOCK_TRADES = [
  { sym: "NQ", dir: "LONG",  pnl: +842,  time: "09:32" },
  { sym: "ES", dir: "SHORT", pnl: -215,  time: "10:14" },
  { sym: "GC", dir: "LONG",  pnl: +1320, time: "11:05" },
  { sym: "CL", dir: "SHORT", pnl: +560,  time: "13:47" },
];

/* Animated number counter */
const Counter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.round(start));
    }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <>{val.toLocaleString()}{suffix}</>;
};

const SignupLobby = ({ onContinue }: { onContinue: () => void }) => {
  const [vis, setVis] = useState(false);
  const [tick, setTick] = useState(0);
  const [liveProfit, setLiveProfit] = useState(4_827_340);

  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setInterval(() => setTick(v => (v + 1) % 3), 3500); return () => clearInterval(t); }, []);
  useEffect(() => {
    const t = setInterval(() => {
      setLiveProfit(v => v + Math.floor(Math.random() * 750 + 50));
    }, 1200);
    return () => clearInterval(t);
  }, []);

  const fly = (i: number, axis: "Y" | "X" = "Y") => ({
    opacity: vis ? 1 : 0,
    transform: vis ? "translate(0,0)" : axis === "Y" ? "translateY(28px)" : "translateX(-18px)",
    transition: `opacity 0.7s ${i * 0.08}s, transform 0.7s ${i * 0.08}s cubic-bezier(0.2,0.8,0.4,1)`,
  });

  const SOCIAL_PROOFS = [
    "🇮🇱 סוחר מתל אביב הצטרף לפני 2 דקות",
    "📈 15 עסקאות תועדו היום ב-ZenTrade",
    "🏆 Win Rate ממוצע של משתמשים: 67%",
  ];

  return (
    <>
      <style>{`
        @keyframes lobbyGlow {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 0.8; transform: scale(1.08); }
        }
        @keyframes lobbyFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes lobbyTickIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lobbyTickOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-6px); }
        }
        @keyframes lobbyShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes lobbyBorderPulse {
          0%,100% { border-color: rgba(124,58,237,0.25); box-shadow: 0 0 20px rgba(124,58,237,0.1); }
          50%      { border-color: rgba(124,58,237,0.5);  box-shadow: 0 0 40px rgba(124,58,237,0.25), 0 0 80px rgba(34,211,238,0.1); }
        }
      `}</style>

      <div className="min-h-screen bg-[#04040d] flex flex-col overflow-x-hidden relative" dir="rtl">

        {/* ── Deep background ── */}
        <div className="pointer-events-none fixed inset-0">
          {/* Glow orbs */}
          <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)", animation: "lobbyGlow 8s ease-in-out infinite" }} />
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(8,145,178,0.09) 0%, transparent 65%)", animation: "lobbyGlow 10s ease-in-out infinite 2s" }} />
          <div className="absolute top-[35%] left-[45%] w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(74,222,128,0.05) 0%, transparent 65%)", animation: "lobbyGlow 12s ease-in-out infinite 4s" }} />
          {/* Grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }} />
          {/* Vignette */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, #04040d 90%)" }} />
          {/* Floating particles */}
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="absolute rounded-full animate-pulse"
              style={{
                left: `${(i * 41 + 7) % 100}%`,
                top: `${(i * 61 + 13) % 100}%`,
                width: 1 + (i % 3) * 0.8,
                height: 1 + (i % 3) * 0.8,
                background: ["#a78bfa","#22d3ee","#4ade80","#f9a8d4"][i % 4],
                opacity: 0.04 + (i % 5) * 0.02,
                animationDuration: `${4 + (i % 7)}s`,
                animationDelay: `${(i % 9) * 0.35}s`,
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
              style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <ZenTradeLogo size={30} transparent />
            </div>
            <div>
              <span className="font-black text-[16px] text-white tracking-tight">ZenTrade</span>
              <span className="text-[9px] font-mono text-white/20 block leading-none tracking-widest">TRADING PLATFORM</span>
            </div>
          </div>
          <Link to="/login"
            className="flex items-center gap-1.5 text-[12px] font-semibold text-white/40 hover:text-white/80 transition-colors rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 hover:border-white/[0.12]">
            <span>יש לי חשבון</span>
            <ChevronLeft className="h-3 w-3" />
          </Link>
        </nav>

        {/* ── Main layout ── */}
        <div className="relative z-10 flex-1 flex flex-col xl:flex-row items-center max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 gap-10 xl:gap-16">

          {/* ════ LEFT COLUMN ════ */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Live badge */}
            <div className="flex items-center gap-2.5 mb-6 w-fit rounded-full px-3.5 py-2"
              style={{ background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.2)", ...fly(0) }}>
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 8px #4ade80" }} />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping opacity-60" />
              </div>
              <span className="text-[11px] font-mono font-bold text-green-300 tracking-wide">LIVE · 2,400+ סוחרים פעילים עכשיו</span>
            </div>

            {/* Headline */}
            <div style={fly(1)}>
              <h1 className="font-black leading-[1.1] mb-5" style={{ fontSize: "clamp(34px, 5vw, 58px)" }}>
                <span className="text-white">הקוקפיט של</span><br />
                <span style={{
                  background: "linear-gradient(135deg, #c4b5fd 0%, #a78bfa 30%, #818cf8 60%, #22d3ee 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "lobbyShimmer 4s linear infinite",
                }}>הסוחר המודרני</span>
              </h1>
              <p className="text-[15px] text-white/40 leading-relaxed max-w-lg mb-8">
                יומן מסחר חכם · AI מנטור אישי · סטטיסטיקות מעמיקות · Kill Switch<br />
                <span className="text-white/20">הכל בעברית, מותאם לסוחר הישראלי.</span>
              </p>
            </div>

            {/* Animated stats */}
            <div className="flex items-center gap-8 mb-10" style={fly(2)}>
              {[
                { n: 2400, suf: "+", label: "סוחרים" },
                { n: 94,   suf: "%", label: "שיפור בביצועים" },
                { n: 7,    suf: " ימים", label: "ניסיון חינם" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-black text-white" style={{ fontSize: "clamp(22px, 3vw, 30px)" }}>
                    {vis ? <Counter target={s.n} suffix={s.suf} /> : "0"}
                  </span>
                  <span className="text-[10px] text-white/25 font-mono uppercase tracking-wider">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Perks list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
              {PERKS.map(({ icon: Icon, color, label, detail }, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl px-3.5 py-3"
                  style={{
                    background: color + "0a",
                    border: `1px solid ${color}20`,
                    ...fly(3 + i, "X"),
                  }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0"
                    style={{ background: color + "15", border: `1px solid ${color}28` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-white">{label}</p>
                    <p className="text-[10px] text-white/30">{detail}</p>
                  </div>
                  <Check className="h-3.5 w-3.5 shrink-0 mr-auto" style={{ color: color + "88" }} />
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" style={fly(9)}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-full flex items-center justify-center font-black text-[10px] text-white shrink-0"
                      style={{ background: t.color + "30", border: `1px solid ${t.color}50` }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white/70">{t.name}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.stars }).map((_, j) => (
                          <Star key={j} className="h-2 w-2 fill-amber-400 text-amber-400" />
                        ))}
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

            {/* Dashboard preview card */}
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/30"
              style={{
                border: "1px solid rgba(124,58,237,0.25)",
                background: "linear-gradient(145deg, rgba(13,13,26,0.95), rgba(8,8,18,0.98))",
                animation: "lobbyBorderPulse 4s ease-in-out infinite, lobbyFloat 6s ease-in-out infinite",
              }}>
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.05]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="text-[10px] text-white/15 font-mono mr-auto">ZenTrade · יומן מסחר</span>
              </div>

              {/* Mini KPIs */}
              <div className="grid grid-cols-3 gap-px bg-white/[0.04] mx-4 mt-4 rounded-2xl overflow-hidden">
                {[
                  { label: "P&L היום", val: "+$2,507", color: "#4ade80" },
                  { label: "Win Rate", val: "71%",     color: "#a78bfa" },
                  { label: "עסקאות",  val: "4",        color: "#22d3ee" },
                ].map((k, i) => (
                  <div key={i} className="flex flex-col items-center py-3 px-2"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <span className="text-[13px] font-black" style={{ color: k.color }}>{k.val}</span>
                    <span className="text-[9px] text-white/25 font-mono">{k.label}</span>
                  </div>
                ))}
              </div>

              {/* Trade rows */}
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
                      {tr.pnl > 0
                        ? <ArrowUpRight className="h-3 w-3 text-green-400" />
                        : <ArrowDownRight className="h-3 w-3 text-red-400" />}
                      <span className="text-[12px] font-black" style={{ color: tr.pnl > 0 ? "#4ade80" : "#f87171" }}>
                        {tr.pnl > 0 ? "+" : ""}{tr.pnl}$
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI chat preview */}
              <div className="mx-4 mb-4 rounded-2xl px-3 py-2.5"
                style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.15)" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Brain className="h-3 w-3 text-purple-400" />
                  <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-wider">AI מנטור</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  "שמתי לב שאתה מפסיד בממוצע 3x יותר בסשן האחה"צ. שקול לסגור פוזיציות לפני 14:00."
                </p>
              </div>
            </div>

            {/* CTA card */}
            <div className="rounded-3xl p-5"
              style={{
                background: "linear-gradient(145deg, rgba(124,58,237,0.1), rgba(79,70,229,0.07), rgba(8,145,178,0.05))",
                border: "1px solid rgba(124,58,237,0.22)",
                boxShadow: "0 8px 40px rgba(124,58,237,0.15)",
              }}>

              {/* Social proof ticker */}
              <div className="flex items-center gap-2 mb-4 h-7 overflow-hidden">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 animate-pulse" />
                <div className="relative flex-1 overflow-hidden">
                  <span key={tick} className="block text-[11px] text-purple-300/70 font-mono"
                    style={{ animation: "lobbyTickIn 0.4s ease forwards" }}>
                    {SOCIAL_PROOFS[tick]}
                  </span>
                </div>
              </div>

              <div className="h-px bg-gradient-to-l from-transparent via-purple-500/20 to-transparent mb-4" />

              {/* Offer */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[16px] font-black text-white">התחל חינם היום</p>
                  <p className="text-[11px] text-white/30">7 ימים · ללא כרטיס אשראי · בטל בכל עת</p>
                </div>
                <div className="flex -space-x-2">
                  {["#7c3aed","#0891b2","#059669"].map((c, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-[#04040d]"
                      style={{ background: c + "60", marginLeft: i > 0 ? "-8px" : 0 }} />
                  ))}
                  <div className="w-7 h-7 rounded-full border-2 border-[#04040d] flex items-center justify-center text-[8px] font-black text-white/50"
                    style={{ background: "rgba(255,255,255,0.05)", marginLeft: "-8px" }}>+2k</div>
                </div>
              </div>

              <button onClick={onContinue}
                className="group relative w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-[15px] font-black text-white overflow-hidden transition-all active:scale-[0.98] hover:brightness-115 mb-3"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 45%, #0891b2 100%)",
                  boxShadow: "0 0 40px rgba(124,58,237,0.4), 0 4px 24px rgba(0,0,0,0.5)",
                }}>
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)", backgroundSize: "200% auto", animation: "lobbyShimmer 1.5s linear infinite" }} />
                <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform relative z-10" />
                <span className="relative z-10">צור חשבון חינמי</span>
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform relative z-10" />
              </button>

              <div className="flex items-center justify-center gap-5">
                {[
                  { icon: Shield, t: "SSL מאובטח" },
                  { icon: Zap,    t: "בטל בכל עת" },
                  { icon: Lock,   t: "פרטיות מלאה" },
                ].map(({ icon: Icon, t }) => (
                  <div key={t} className="flex items-center gap-1 text-white/18">
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

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

const SignupPage = () => {
  const [step, setStep] = useState<"lobby" | "form">("lobby");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signUp, updateProfile } = useAuth();

  useEffect(() => {
    document.documentElement.classList.remove("light");
    return () => {
      const saved = localStorage.getItem("zentrade-theme");
      if (saved === "light") document.documentElement.classList.add("light");
    };
  }, []);

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!name.trim()) e.name = "שדה חובה";
    if (!email.trim()) e.email = "שדה חובה";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "כתובת אימייל לא תקינה";
    if (!password) e.password = "שדה חובה";
    else if (password.length < 8) e.password = "הסיסמה חייבת להכיל לפחות 8 תווים";
    if (!confirm) e.confirm = "שדה חובה";
    else if (password !== confirm) e.confirm = "הסיסמאות אינן תואמות";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        if (error.message.includes("already registered") || error.message.includes("already been registered")) {
          setErrors({ email: "כתובת האימייל כבר רשומה במערכת" });
        } else {
          toast.error(error.message);
        }
        return;
      }
      await updateProfile({ full_name: name.trim() });
      supabase.functions.invoke("welcome-email", {
        body: { name: name.trim(), email },
      }).catch(() => {});
      toast.success("החשבון נוצר בהצלחה!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.message || "שגיאה לא צפויה");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof FieldErrors) =>
    `w-full rounded-xl border ${errors[field] ? "border-red-500/60" : "border-white/[0.08]"} bg-white/[0.04] px-4 py-3 text-sm text-white text-left placeholder:text-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`;

  if (step === "lobby") return <SignupLobby onContinue={() => setStep("form")} />;

  return (
    <div className="min-h-screen bg-[#06060f] flex flex-col items-center justify-center px-4 overflow-hidden relative" dir="rtl">
      {/* Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-160px] left-[-60px] w-[500px] h-[500px] rounded-full bg-purple-600/[0.07] blur-[140px]" />
        <div className="absolute bottom-[-120px] right-[-60px] w-[420px] h-[420px] rounded-full bg-blue-500/[0.05] blur-[130px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 bg-[#06060f]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <button onClick={() => setStep("lobby")}
          className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-[13px] font-semibold text-white/75 hover:text-white hover:bg-white/[0.09] transition-all active:scale-95">
          <ChevronLeft className="h-4 w-4" />
          <span>חזרה</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 overflow-hidden">
            <ZenTradeLogo size={24} transparent />
          </div>
          <span className="text-sm font-bold text-white">ZenTrade</span>
        </div>
        <Link to="/login" className="text-[12px] font-medium text-blue-400 hover:underline">התחבר</Link>
      </nav>

      {/* Form card */}
      <div className="relative z-10 w-full max-w-sm mt-16">
        <div className="h-[2px] w-full rounded-t-full bg-gradient-to-l from-transparent via-blue-500/60 to-transparent" />
        <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d18]/90 backdrop-blur-2xl p-7 shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="mx-auto mb-3 relative w-fit">
              <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-lg scale-150" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/25 overflow-hidden">
                <ZenTradeLogo size={40} transparent />
              </div>
            </div>
            <h2 className="text-xl font-extrabold text-white">צור חשבון חינמי</h2>
            <div className="inline-flex items-center gap-1.5 mt-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5">
              <Sparkles className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] text-blue-400 font-mono">7 ימי ניסיון · ללא כרטיס אשראי</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-white/40">שם מלא</label>
              <input type="text" value={name}
                onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }}
                placeholder="הכנס את שמך המלא" autoComplete="name"
                className={inputClass("name")} />
              {errors.name && <p className="mt-1 text-[11px] text-red-400">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-white/40">אימייל</label>
              <input type="email" value={email} dir="ltr"
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                placeholder="name@example.com" autoComplete="email"
                className={inputClass("email")} />
              {errors.email && <p className="mt-1 text-[11px] text-red-400">{errors.email}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-white/40">סיסמה</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} dir="ltr"
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                  placeholder="לפחות 8 תווים" autoComplete="new-password"
                  className={inputClass("password") + " pr-11"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] text-red-400">{errors.password}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-white/40">אימות סיסמה</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} value={confirm} dir="ltr"
                  onChange={(e) => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: undefined })); }}
                  placeholder="הזן שוב את הסיסמה" autoComplete="new-password"
                  className={inputClass("confirm") + " pr-11"} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirm && <p className="mt-1 text-[11px] text-red-400">{errors.confirm}</p>}
            </div>

            <button type="submit" disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-l from-blue-600 to-cyan-500 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> יוצר חשבון...</> : <>
                <Sparkles className="h-4 w-4" /> צור חשבון חינמי
              </>}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] text-white/25">
            כבר יש לך חשבון?{" "}
            <Link to="/login" className="text-blue-400 hover:underline font-semibold">התחבר</Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mt-5">
          {[{ icon: Shield, text: "מאובטח SSL" }, { icon: Zap, text: "בטל בכל עת" }].map(({ icon: Icon, text }) => (
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

export default SignupPage;
