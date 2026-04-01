import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("שדה חובה");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("כתובת אימייל לא תקינה");
      return;
    }

    setSubmitting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError("כתובת אימייל לא קיימת במערכת");
      } else {
        setSent(true);
      }
    } catch {
      setError("שגיאה לא צפויה, נסה שוב");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-primary/5">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">שכחת סיסמה?</h1>
            <p className="mt-2 text-sm text-muted-foreground">הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס</p>
          </div>

          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
              <p className="text-sm text-foreground font-medium">שלחנו לך אימייל לאיפוס סיסמה</p>
              <p className="text-xs text-muted-foreground">בדוק את תיבת הדואר שלך ולחץ על הקישור</p>
              <Link to="/login" className="inline-block mt-4 text-sm text-primary hover:underline">
                חזרה להתחברות
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground/70">אימייל</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="name@example.com"
                    dir="ltr"
                    className={`w-full rounded-lg border ${error ? "border-red-500" : "border-border"} bg-muted/30 px-4 py-3 text-sm text-foreground text-left placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "שולח..." : "שלח קישור לאיפוס"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                נזכרת בסיסמה?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">התחבר</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
