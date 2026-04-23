import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Eye, EyeOff, Loader2, Brain, Shield, Zap, TrendingUp, Sparkles, ChevronLeft,
} from "lucide-react";
import zentradeLogo from "@/assets/zentrade-logo.png";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

/* ═══════════════════════════════════════════════════════
   LOBBY — beautiful welcome screen before the form
═══════════════════════════════════════════════════════ */
const LOBBY_FEATURES = [
  { icon: Brain,      color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.2)",  title: "AI Mentor",         desc: "מנתח את הפסדים שלך בזמן אמת" },
  { icon: TrendingUp, color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.18)", title: "יומן מסחר",         desc: "תיעוד מלא ותובנות לכל עסקה" },
  { icon: Shield,     color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.18)", title: "Kill Switch",       desc: "הגנה אוטומטית על ההון שלך" },
  { icon: Zap,        color: "#a78bfa", bg: "rgba(167,139,250,0.08)",border: "rgba(167,139,250,0.18)",title: "סטטיסטיקות AI",    desc: "דוחות ביצועים מתקדמים" },
];

const LoginLobby = ({ onContinue }: { onContinue: () => void }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);
  return (
    <div className="min-h-screen bg-[#06060f] flex flex-col items-center justify-center px-4 overflow-hidden relative" dir="rtl">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-160px] right-[-80px] w-[500px] h-[500px] rounded-full bg-blue-600/[0.07] blur-[140px]" />
        <div className="absolute bottom-[-160px] left-[-80px] w-[440px] h-[440px] rounded-full bg-cyan-500/[0.05] blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-indigo-600/[0.03] blur-[180px]" />
        {/* Animated particles */}
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-blue-400 animate-pulse"
            style={{
              left: `${(i * 37 + 11) % 100}%`, top: `${(i * 53 + 7) % 100}%`,
              width: 1.5 + (i % 3), height: 1.5 + (i % 3),
              opacity: 0.06 + (i % 4) * 0.04,
              animationDuration: `${4 + (i % 6)}s`, animationDelay: `${(i % 8) * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s, transform 0.7s" }}
          className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl scale-150" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/25 shadow-lg shadow-blue-500/20 overflow-hidden">
              <img src={zentradeLogo} alt="ZenTrade" className="h-10 w-10 object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">ZenTrade</h1>
          <p className="text-sm text-white/35 mt-1 font-mono">פלטפורמת המסחר החכמה ביותר</p>
        </div>

        {/* Welcome headline */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.7s 0.1s, transform 0.7s 0.1s" }}
          className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-white leading-tight">
            ברוך הבא חזרה 👋
          </h2>
          <p className="text-sm text-white/35 mt-1">המשך לסחור חכם יותר</p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-2.5 mb-7">
          {LOBBY_FEATURES.map(({ icon: Icon, color, bg, border, title, desc }, i) => (
            <div key={i}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.96)",
                transition: `opacity 0.6s ${0.18 + i * 0.1}s, transform 0.6s ${0.18 + i * 0.1}s`,
                background: bg, border: `1px solid ${border}`,
              }}
              className="rounded-2xl p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl" style={{ background: bg, border: `1px solid ${border}` }}>
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                </div>
                <span className="text-[11px] font-bold text-white/80">{title}</span>
              </div>
              <p className="text-[10px] text-white/35 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.6s 0.6s, transform 0.6s 0.6s" }}>
          <button
            onClick={onContinue}
            className="group w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-500 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 transition-all active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            התחבר לחשבון
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <p className="text-center text-[11px] text-white/20 mt-4">
            אין לך חשבון?{" "}
            <Link to="/signup" className="text-blue-400 hover:underline font-semibold">הירשם עכשיו</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

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
    <div className="min-h-screen bg-[#06060f] flex flex-col items-center justify-center px-4 overflow-hidden relative" dir="rtl">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-160px] right-[-80px] w-[500px] h-[500px] rounded-full bg-blue-600/[0.07] blur-[140px]" />
        <div className="absolute bottom-[-160px] left-[-80px] w-[440px] h-[440px] rounded-full bg-cyan-500/[0.05] blur-[130px]" />
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
            <img src={zentradeLogo} alt="ZenTrade" className="h-5 w-5 object-contain" />
          </div>
          <span className="text-sm font-bold text-white">ZenTrade</span>
        </div>
        <Link to="/signup" className="text-[12px] font-medium text-blue-400 hover:underline">הירשם</Link>
      </nav>

      {/* Form card */}
      <div className="relative z-10 w-full max-w-sm mt-16">
        {/* Top line */}
        <div className="h-[2px] w-full rounded-t-full bg-gradient-to-l from-transparent via-blue-500/60 to-transparent mb-0" />
        <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d18]/90 backdrop-blur-2xl p-7 shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 relative w-fit">
              <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-lg scale-150" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/25 overflow-hidden">
                <img src={zentradeLogo} alt="ZenTrade" className="h-8 w-8 object-contain" />
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
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="name@example.com"
                dir="ltr"
                autoComplete="email"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white text-left placeholder:text-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-white/40">סיסמה</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  dir="ltr"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 pr-11 text-sm text-white text-left placeholder:text-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
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
              <Link to="/forgot-password" className="text-[11px] text-blue-400 hover:underline">שכחת סיסמה?</Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-l from-blue-600 to-cyan-500 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> מתחבר...</> : <>
                <Sparkles className="h-4 w-4" /> היכנס לחשבון
              </>}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] text-white/25">
            אין לך חשבון?{" "}
            <Link to="/signup" className="text-blue-400 hover:underline font-semibold">הירשם עכשיו</Link>
          </p>
        </div>

        {/* Trust line */}
        <div className="flex items-center justify-center gap-3 mt-5">
          {[
            { icon: Shield, text: "מאובטח SSL" },
            { icon: Zap, text: "מהיר · תוך שניות" },
          ].map(({ icon: Icon, text }) => (
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
