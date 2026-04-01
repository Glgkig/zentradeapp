import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

const SignupPage = () => {
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

      // Update profile with name
      await updateProfile({ full_name: name.trim() });

      // Fire welcome email (non-blocking)
      supabase.functions.invoke("send-welcome-email", {
        body: { full_name: name.trim(), email },
      }).catch(() => {});

      toast.success("החשבון נוצר בהצלחה!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "שגיאה לא צפויה");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof FieldErrors) =>
    `w-full rounded-lg border ${errors[field] ? "border-red-500" : "border-border"} bg-muted/30 px-4 py-3 text-sm text-foreground text-left placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-primary/5">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">הצטרף ל-ZenTrade</h1>
            <p className="mt-2 text-sm text-muted-foreground">צור חשבון חדש והתחל לסחור חכם יותר</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/70">שם מלא</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }}
                placeholder="הכנס את שמך המלא"
                className={inputClass("name")}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/70">אימייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                placeholder="name@example.com"
                dir="ltr"
                className={inputClass("email") + " text-left"}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/70">סיסמה</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                  placeholder="לפחות 8 תווים"
                  dir="ltr"
                  className={inputClass("password") + " pr-11 text-left"}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/70">אימות סיסמה</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: undefined })); }}
                  placeholder="הזן שוב את הסיסמה"
                  dir="ltr"
                  className={inputClass("confirm") + " pr-11 text-left"}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "יוצר חשבון..." : "צור חשבון"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            כבר יש לך חשבון?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">התחבר</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
