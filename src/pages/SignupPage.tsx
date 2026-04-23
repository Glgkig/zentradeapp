import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Eye, EyeOff, Shield, Loader2, Zap, Brain, TrendingUp,
  Sparkles, ChevronLeft, Check, BarChart2, Lock, Star,
} from "lucide-react";
import ZenTradeLogo from "@/components/ZenTradeLogo";

/* ═══════════════════════════════════════════════════════
   SIGNUP LOBBY
═══════════════════════════════════════════════════════ */

const PERKS = [
  {
    icon: Brain,
    color: "#818cf8",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
    label: "AI מנטור אישי",
    detail: "מנתח את דפוסי המסחר שלך ומזהה חולשות פסיכולוגיות בזמן אמת",
    tag: "GPT-4o",
  },
  {
    icon: TrendingUp,
    color: "#4ade80",
    bg: "rgba(74,222,128,0.07)",
    border: "rgba(74,222,128,0.18)",
    label: "יומן מסחר חכם",
    detail: "תיעוד אוטומטי של כל עסקה עם סטטיסטיקות מעמיקות ותובנות",
    tag: "אוטומטי",
  },
  {
    icon: BarChart2,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.07)",
    border: "rgba(245,158,11,0.18)",
    label: "סטטיסטיקות מתקדמות",
    detail: "Win Rate, Profit Factor, Drawdown, ניתוח לפי שעות וימים",
    tag: "Pro",
  },
  {
    icon: Shield,
    color: "#f87171",
    bg: "rgba(248,113,113,0.07)",
    border: "rgba(248,113,113,0.18)",
    label: "Kill Switch",
    detail: "עוצר אוטומטי שמגן על ההון שלך כשמגיעים לסף הפסד יומי",
    tag: "הגנה",
  },
  {
    icon: Lock,
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.07)",
    border: "rgba(34,211,238,0.18)",
    label: "אבטחה מלאה",
    detail: "הצפנת SSL, אחסון מאובטח, ללא שיתוף נתונים עם צד שלישי",
    tag: "SSL",
  },
];

const STATS = [
  { value: "2,400+", label: "סוחרים פעילים" },
  { value: "94%",    label: "שיפור בביצועים" },
  { value: "7 ימים", label: "ניסיון חינם" },
];

const TESTIMONIALS = [
  { name: "אורי כ.", text: "אחרי שבוע עם ZenTrade הבנתי שאני מפסיד כל פעם ב-15:30. שיניתי לגמרי.", stars: 5 },
  { name: "מיכל ג.", text: "ה-AI מנטור שינה לי את המיינדסט. עכשיו אני סוחרת עם ראש יותר קר.", stars: 5 },
  { name: "דוד ל.", text: "הסטטיסטיקות גרמו לי לראות דברים שלא ידעתי עליהם שנים.", stars: 5 },
];

const SignupLobby = ({ onContinue }: { onContinue: () => void }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  const fade = (delay: number) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.65s ${delay}s, transform 0.65s ${delay}s`,
  });

  return (
    <div className="min-h-screen bg-[#05050e] flex flex-col overflow-hidden relative" dir="rtl">

      {/* ── Background effects ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full bg-purple-700/[0.06] blur-[160px]" />
        <div className="absolute bottom-[-150px] left-[-80px] w-[500px] h-[500px] rounded-full bg-blue-600/[0.05] blur-[140px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-cyan-500/[0.04] blur-[100px]" />
        {/* grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        {/* particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute rounded-full animate-pulse"
            style={{
              left: `${(i * 37 + 11) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              width: 1.5 + (i % 2),
              height: 1.5 + (i % 2),
              background: i % 3 === 0 ? "#a78bfa" : i % 3 === 1 ? "#22d3ee" : "#60a5fa",
              opacity: 0.06 + (i % 4) * 0.025,
              animationDuration: `${3.5 + (i % 6)}s`,
              animationDelay: `${(i % 8) * 0.4}s`,
            }} />
        ))}
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 overflow-hidden">
            <ZenTradeLogo size={26} transparent />
          </div>
          <span className="font-black text-[15px] text-white tracking-tight">ZenTrade</span>
        </div>
        <Link to="/login" className="text-[12px] font-semibold text-white/40 hover:text-white/70 transition-colors">
          יש לי חשבון ←
        </Link>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full px-4 py-8 gap-8">

        {/* ── LEFT: Hero ── */}
        <div className="flex-1 flex flex-col justify-center" style={fade(0)}>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/08 px-3 py-1.5 w-fit mb-5"
            style={{ background: "rgba(139,92,246,0.08)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: "0 0 6px #4ade80" }} />
            <span className="text-[11px] font-mono font-bold text-purple-300 tracking-wide">LIVE · 2,400+ סוחרים פעילים</span>
          </div>

          <h1 className="text-[32px] sm:text-[42px] font-black text-white leading-[1.15] mb-4">
            הקוקפיט של<br />
            <span style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #22d3ee 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>הסוחר המודרני</span>
          </h1>

          <p className="text-[14px] text-white/40 leading-relaxed mb-7 max-w-md">
            יומן מסחר חכם, AI מנטור אישי, סטטיסטיקות מעמיקות וכלי הגנה על ההון —
            הכל במקום אחד, בעברית, מותאם לסוחר הישראלי.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-6 mb-8" style={fade(0.1)}>
            {STATS.map((s, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[20px] font-black text-white">{s.value}</span>
                <span className="text-[10px] text-white/30 font-mono">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="space-y-2.5" style={fade(0.2)}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="flex h-8 w-8 rounded-full items-center justify-center shrink-0 font-black text-[11px] text-white"
                  style={{ background: `hsl(${i * 60 + 200},60%,25%)`, border: `1px solid hsl(${i * 60 + 200},60%,35%)` }}>
                  {t.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold text-white/70">{t.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <Star key={j} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-white/35 leading-relaxed">"{t.text}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Features + CTA ── */}
        <div className="lg:w-[400px] flex flex-col gap-4" style={fade(0.05)}>

          {/* Features card */}
          <div className="rounded-3xl border border-white/[0.07] bg-[#0d0d1a]/80 backdrop-blur-2xl p-5 shadow-2xl shadow-black/50">
            <p className="text-[11px] font-mono font-bold text-white/25 uppercase tracking-widest mb-4">מה תקבל</p>
            <div className="space-y-2">
              {PERKS.map(({ icon: Icon, color, bg, border, label, detail, tag }, i) => (
                <div key={i}
                  style={{
                    background: bg,
                    borderColor: border,
                    opacity: vis ? 1 : 0,
                    transform: vis ? "translateX(0)" : "translateX(12px)",
                    transition: `opacity 0.5s ${0.1 + i * 0.07}s, transform 0.5s ${0.1 + i * 0.07}s`,
                  }}
                  className="flex items-center gap-3 rounded-2xl border px-3.5 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                    style={{ background: color + "18", border: `1px solid ${color}30` }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-bold text-white">{label}</p>
                      <span className="text-[9px] font-mono font-bold rounded-full px-1.5 py-0.5"
                        style={{ background: color + "18", color, border: `1px solid ${color}30` }}>{tag}</span>
                    </div>
                    <p className="text-[10px] text-white/30 leading-relaxed mt-0.5">{detail}</p>
                  </div>
                  <Check className="h-3.5 w-3.5 shrink-0" style={{ color: color + "aa" }} />
                </div>
              ))}
            </div>
          </div>

          {/* CTA card */}
          <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-500/[0.06] to-blue-500/[0.04] backdrop-blur-xl p-5 shadow-xl shadow-purple-500/10"
            style={fade(0.3)}>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/25 overflow-hidden">
                <ZenTradeLogo size={34} transparent />
              </div>
              <div>
                <p className="text-[14px] font-black text-white">ZenTrade</p>
                <p className="text-[10px] text-white/30">7 ימי ניסיון · ללא כרטיס אשראי</p>
              </div>
            </div>

            <div className="h-px bg-gradient-to-l from-transparent via-purple-500/20 to-transparent mb-4" />

            <button
              onClick={onContinue}
              className="group w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-[14px] font-black text-white transition-all active:scale-[0.98] hover:brightness-110 mb-3"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0891b2 100%)",
                boxShadow: "0 0 30px rgba(124,58,237,0.35), 0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              צור חשבון חינמי
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-4">
              {[{ icon: Shield, t: "מאובטח SSL" }, { icon: Zap, t: "בטל בכל עת" }, { icon: Lock, t: "פרטיות מלאה" }].map(({ icon: Icon, t }) => (
                <div key={t} className="flex items-center gap-1 text-white/20">
                  <Icon className="h-2.5 w-2.5" />
                  <span className="text-[9px] font-mono">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
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
