import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Eye, EyeOff, Shield, Loader2, Zap, Brain, TrendingUp,
  Sparkles, ChevronLeft, Check,
} from "lucide-react";
import ZenTradeLogo from "@/components/ZenTradeLogo";

/* ═══════════════════════════════════════════════════════
   SIGNUP LOBBY
═══════════════════════════════════════════════════════ */
const SIGNUP_PERKS = [
  { icon: Brain,      color: "#60a5fa", label: "AI Mentor",         detail: "ניתוח פסיכולוגי + דפוסי מסחר" },
  { icon: TrendingUp, color: "#4ade80", label: "יומן חכם",          detail: "תיעוד עסקאות + תובנות אוטומטיות" },
  { icon: Shield,     color: "#f59e0b", label: "Kill Switch",       detail: "הגנה על ההון — עוצר אוטומטי" },
  { icon: Zap,        color: "#a78bfa", label: "7 ימי ניסיון חינם", detail: "ללא כרטיס אשראי, בטל מתי שרוצה" },
];

const SignupLobby = ({ onContinue }: { onContinue: () => void }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);
  return (
    <div className="min-h-screen bg-[#06060f] flex flex-col items-center justify-center px-4 overflow-hidden relative" dir="rtl">
      {/* Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-160px] left-[-60px] w-[500px] h-[500px] rounded-full bg-purple-600/[0.07] blur-[140px]" />
        <div className="absolute bottom-[-120px] right-[-60px] w-[420px] h-[420px] rounded-full bg-blue-500/[0.05] blur-[130px]" />
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-blue-400 animate-pulse"
            style={{
              left: `${(i * 43 + 9) % 100}%`, top: `${(i * 57 + 13) % 100}%`,
              width: 1.5 + (i % 3), height: 1.5 + (i % 3),
              opacity: 0.05 + (i % 5) * 0.035,
              animationDuration: `${4 + (i % 7)}s`, animationDelay: `${(i % 9) * 0.35}s`,
            }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s, transform 0.7s" }}
          className="flex flex-col items-center mb-7">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl scale-150" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/25 overflow-hidden shadow-lg shadow-blue-500/20">
              <ZenTradeLogo size={52} transparent />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white">ZenTrade</h1>
          <div className="flex items-center gap-1.5 mt-2">
            <Sparkles className="h-3 w-3 text-blue-400" />
            <span className="text-[11px] text-blue-400 font-mono font-semibold">7 ימי ניסיון חינם</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(18px)", transition: "opacity 0.7s 0.1s, transform 0.7s 0.1s" }}
          className="text-center mb-6">
          <h2 className="text-[22px] font-extrabold text-white leading-tight">
            תתחיל לסחור{" "}
            <span className="bg-gradient-to-l from-cyan-400 to-blue-500 bg-clip-text text-transparent">חכם יותר</span>
          </h2>
          <p className="text-[12px] text-white/35 mt-1">הצטרף ל-2,400+ סוחרים שכבר משתמשים ב-ZenTrade</p>
        </div>

        {/* Perks */}
        <div className="space-y-2.5 mb-7">
          {SIGNUP_PERKS.map(({ icon: Icon, color, label, detail }, i) => (
            <div key={i}
              style={{
                opacity: vis ? 1 : 0,
                transform: vis ? "translateX(0)" : "translateX(16px)",
                transition: `opacity 0.55s ${0.15 + i * 0.08}s, transform 0.55s ${0.15 + i * 0.08}s`,
                borderColor: color + "22",
                background: color + "0a",
              }}
              className="flex items-center gap-3 rounded-2xl border px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0" style={{ background: color + "15", border: `1px solid ${color}28` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-white">{label}</p>
                <p className="text-[10px] text-white/35 leading-none mt-0.5">{detail}</p>
              </div>
              <Check className="h-4 w-4 shrink-0" style={{ color: color + "99" }} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.6s 0.55s, transform 0.6s 0.55s" }}>
          <button
            onClick={onContinue}
            className="group w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-500 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 transition-all active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            צור חשבון חינמי
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <p className="text-center text-[11px] text-white/20 mt-4">
            כבר יש לך חשבון?{" "}
            <Link to="/login" className="text-blue-400 hover:underline font-semibold">התחבר</Link>
          </p>
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
