import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("נא למלא את כל השדות");
      return;
    }

    // Rate limiting
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-primary/5">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">התחבר ל-ZenTrade</h1>
            <p className="mt-2 text-sm text-muted-foreground">הכנס לחשבון שלך</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/70">אימייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="name@example.com"
                dir="ltr"
                className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground text-left placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/70">סיסמה</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 pr-11 text-sm text-foreground text-left placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-muted/30 text-primary focus:ring-primary/20 accent-primary"
                />
                <span className="text-xs text-muted-foreground">זכור אותי</span>
              </label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">שכחת סיסמה?</Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "מתחבר..." : "היכנס לחשבון"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            אין לך חשבון?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">הירשם עכשיו</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
