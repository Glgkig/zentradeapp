import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Eye, EyeOff, Shield, Loader2, Zap, BookOpen, Brain,
  ShieldAlert, ChevronDown, Sparkles, TrendingUp,
} from "lucide-react";
import zentradeLogo from "@/assets/zentrade-logo.png";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const LoginPage = () => {
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

  return (
    <div className="min-h-screen bg-[#0A0A0F] overflow-x-hidden" dir="rtl">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full bg-cyan-500/[0.07] blur-[150px]" />
        <div className="absolute bottom-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full bg-purple-500/[0.05] blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.03] blur-[200px]" />
      </div>

      {/* Minimal nav */}
      <nav className="relative z-10 flex items-center justify-between px-5 md:px-10 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 overflow-hidden">
            <img src={zentradeLogo} alt="ZenTrade" className="h-6 w-6 object-contain" />
          </div>
          <span className="font-heading text-lg font-bold text-foreground">ZenTrade</span>
        </div>
        <Link to="/signup" className="text-xs text-foreground/60 hover:text-primary transition-colors">
          אין לך חשבון? <span className="font-semibold text-primary">הירשם</span>
        </Link>
      </nav>

      {/* ===== HERO + AUTH FORM ===== */}
      <section className="relative z-10 flex items-center justify-center min-h-[calc(100vh-60px)] px-4 pb-16">
        <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Right — Text */}
          <div className="text-center lg:text-right order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] md:text-xs font-medium text-primary">Powered by AI</span>
            </div>

            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.15] text-foreground">
              היתרון הסטטיסטי שלך
              <br />
              <span className="bg-gradient-to-l from-cyan-400 via-primary to-purple-400 bg-clip-text text-transparent">
                מתחיל כאן.
              </span>
            </h1>

            <p className="mt-4 text-sm md:text-base leading-relaxed text-foreground/70 max-w-md mx-auto lg:mx-0">
              יומן מסחר חכם, מנטור AI צמוד וניהול סיכונים מתקדם.
              <br className="hidden md:block" />
              תפסיק להמר, תתחיל לסחור.
            </p>

            {/* Trust stats */}
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-sm mx-auto lg:mx-0">
              {[
                { value: "+12K", label: "סוחרים פעילים" },
                { value: "94%", label: "שביעות רצון" },
                { value: "-38%", label: "הפסדים מיותרים" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                  <p className="font-heading text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[9px] text-foreground/50 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Left — Auth Card */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 shadow-2xl shadow-cyan-500/[0.05]">
              <div className="text-center mb-6">
                <h2 className="font-heading text-xl font-bold text-foreground">התחבר לחשבון</h2>
                <p className="mt-1 text-xs text-foreground/50">הכנס את הפרטים שלך כדי להמשיך</p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-foreground/60">אימייל</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="name@example.com"
                    dir="ltr"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-foreground text-left placeholder:text-foreground/20 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-foreground/60">סיסמה</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      placeholder="••••••••"
                      dir="ltr"
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 pr-11 text-sm text-foreground text-left placeholder:text-foreground/20 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-white/10 bg-white/5 accent-cyan-500"
                    />
                    <span className="text-[11px] text-foreground/40">זכור אותי</span>
                  </label>
                  <Link to="/forgot-password" className="text-[11px] text-cyan-400 hover:underline">שכחת סיסמה?</Link>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-gradient-to-l from-cyan-500 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-xl hover:shadow-cyan-500/35 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "מתחבר..." : "היכנס לחשבון"}
                </button>
              </form>

              <p className="mt-5 text-center text-[11px] text-foreground/40">
                אין לך חשבון?{" "}
                <Link to="/signup" className="text-cyan-400 hover:underline font-medium">הירשם עכשיו</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll indicator */}
      <div className="relative z-10 flex flex-col items-center gap-1 pb-8 -mt-8">
        <span className="text-[10px] text-foreground/30">גלול למטה</span>
        <ChevronDown className="h-4 w-4 text-foreground/30 animate-bounce" />
      </div>

      {/* ===== PRODUCT SHOWCASE ===== */}
      <section className="relative z-10 px-4 md:px-8 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden shadow-2xl shadow-cyan-500/[0.05]">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="text-[10px] text-foreground/30 bg-white/[0.04] rounded-md px-4 py-1">app.zentrade.io/dashboard</span>
              </div>
            </div>

            {/* App preview image */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&q=80"
                alt="ZenTrade Dashboard Preview"
                className="w-full h-[250px] md:h-[400px] object-cover"
                loading="lazy"
              />
              {/* Gradient fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/30 to-transparent" />

              {/* Floating badge */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs text-foreground/70">AI Active — Real-time Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VALUE PROPOSITION ===== */}
      <section className="relative z-10 px-4 md:px-8 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3">למה ZenTrade?</p>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              כל מה שסוחר <span className="text-cyan-400">מקצועי</span> צריך
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {[
              {
                icon: BookOpen,
                title: "יומן מסחר אוטומטי",
                desc: "הזנת עסקאות בשניות עם זיהוי פקודות קולי וטקסטואלי.",
                color: "cyan",
              },
              {
                icon: Brain,
                title: "מנטור AI צמוד",
                desc: "ניתוח בזמן אמת של הגרפים והפסיכולוגיה שלך כדי למנוע טעויות.",
                color: "purple",
              },
              {
                icon: ShieldAlert,
                title: "הגנת הון ברזל",
                desc: "Kill Switch מובנה ומחשבוני סיכון ששומרים עליך מ-Revenge Trading.",
                color: "rose",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 md:p-7 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.05]"
              >
                <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-l from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${
                  card.color === "cyan" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
                  card.color === "purple" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                  "bg-rose-500/10 border-rose-500/20 text-rose-400"
                }`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-foreground mb-2">{card.title}</h3>
                <p className="text-xs text-foreground/60 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="mt-14 text-center">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-cyan-500 to-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 transition-all hover:shadow-2xl hover:shadow-cyan-500/35 hover:brightness-110 active:scale-[0.97]"
            >
              <Zap className="h-4 w-4" />
              התחל בחינם — ללא כרטיס אשראי
            </Link>
            <p className="mt-3 text-[10px] text-foreground/30">הגדרה תוך 2 דקות • 14 ימי ניסיון חינם</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-4 py-6 text-center">
        <p className="text-[10px] text-foreground/30">© 2025 ZenTrade. כל הזכויות שמורות.</p>
      </footer>
    </div>
  );
};

export default LoginPage;
