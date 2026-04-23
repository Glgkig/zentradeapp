import { useState } from "react";
import { X, Mail, MessageCircle, Shield, FileText } from "lucide-react";

/* ── Modal ── */
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4" dir="rtl">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-card shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300 max-h-[80vh] flex flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 shrink-0">
        <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-white/[0.06] transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="overflow-y-auto px-5 py-4 text-[13px] text-muted-foreground/70 leading-relaxed space-y-3 scrollbar-none">
        {children}
      </div>
    </div>
  </div>
);

/* ── Privacy Policy Content ── */
const PrivacyContent = () => (
  <>
    <p className="text-foreground font-semibold">עדכון אחרון: אפריל 2026</p>
    <p>ZenTrade ("אנחנו") מחויבים להגנה על פרטיותך. מסמך זה מסביר אילו נתונים אנו אוספים, כיצד אנו משתמשים בהם ואיך אנו מגינים עליהם.</p>
    <div>
      <p className="text-foreground font-semibold mb-1">מה אנו אוספים</p>
      <ul className="list-disc list-inside space-y-1 mr-2">
        <li>פרטי חשבון: שם, כתובת מייל</li>
        <li>נתוני מסחר: עסקאות, סטטיסטיקות, הגדרות</li>
        <li>נתוני שימוש: דפים שנצפו, פעולות בפלטפורמה</li>
      </ul>
    </div>
    <div>
      <p className="text-foreground font-semibold mb-1">שימוש במידע</p>
      <ul className="list-disc list-inside space-y-1 mr-2">
        <li>מתן שירות ותמיכה</li>
        <li>שיפור הפלטפורמה</li>
        <li>שליחת עדכונים חשובים בלבד</li>
      </ul>
    </div>
    <div>
      <p className="text-foreground font-semibold mb-1">אבטחה</p>
      <p>כל הנתונים מוצפנים ב-AES-256 ומאוחסנים בשרתי Supabase עם הגנות מחמירות.</p>
    </div>
    <div>
      <p className="text-foreground font-semibold mb-1">הזכויות שלך</p>
      <p>תוכל לבקש מחיקת כל נתוניך בכל עת דרך עמוד ההגדרות או בפנייה לתמיכה.</p>
    </div>
  </>
);

/* ── Terms Content ── */
const TermsContent = () => (
  <>
    <p className="text-foreground font-semibold">עדכון אחרון: אפריל 2026</p>
    <p>השימוש בפלטפורמת ZenTrade מהווה הסכמה לתנאים הבאים.</p>
    <div>
      <p className="text-foreground font-semibold mb-1">השירות</p>
      <p>ZenTrade היא פלטפורמת יומן מסחר וניתוח. המידע המוצג אינו מהווה ייעוץ פיננסי. האחריות על החלטות המסחר חלה על המשתמש בלבד.</p>
    </div>
    <div>
      <p className="text-foreground font-semibold mb-1">מנוי ותשלום</p>
      <ul className="list-disc list-inside space-y-1 mr-2">
        <li>מנוי PRO מתחדש אוטומטית בתום התקופה</li>
        <li>ביטול אפשרי בכל עת דרך פורטל הלקוח</li>
        <li>אין החזרים על תקופות שהסתיימו</li>
      </ul>
    </div>
    <div>
      <p className="text-foreground font-semibold mb-1">איסורים</p>
      <ul className="list-disc list-inside space-y-1 mr-2">
        <li>שיתוף חשבון עם אחרים</li>
        <li>ניסיון לפרוץ או להנדס לאחור את המערכת</li>
        <li>שימוש מסחרי בנתונים ללא רשות</li>
      </ul>
    </div>
    <div>
      <p className="text-foreground font-semibold mb-1">שינויים בתנאים</p>
      <p>אנו רשאים לעדכן תנאים אלה. שינויים מהותיים יובאו לידיעתך במייל.</p>
    </div>
  </>
);

/* ── Contact Content ── */
const ContactContent = () => (
  <>
    <p>אנחנו כאן לעזור. ניתן ליצור איתנו קשר בכל אחת מהדרכים הבאות:</p>
    <div className="space-y-3 mt-2">
      <a href="mailto:support@zentrade.app"
        className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 hover:bg-white/[0.05] transition-colors group">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
          <Mail className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors">מייל תמיכה</p>
          <p className="text-[11px] text-muted-foreground/50">support@zentrade.app</p>
        </div>
      </a>
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366]/10 border border-[#25D366]/15">
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground">צ'אט תמיכה</p>
          <p className="text-[11px] text-muted-foreground/50">לחץ על כפתור הוואטסאפ הירוק בפינה</p>
        </div>
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <p className="text-[12px] text-muted-foreground/60 text-center">זמן תגובה ממוצע: עד 24 שעות</p>
      </div>
    </div>
  </>
);

/* ── Footer ── */
type ModalType = "privacy" | "terms" | "contact" | null;

const Footer = ({ minimal = false }: { minimal?: boolean }) => {
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <>
      <footer className={`shrink-0 border-t border-white/[0.04] ${minimal ? "px-4 py-2" : "px-6 py-3"}`} dir="rtl">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          <button
            onClick={() => setModal("privacy")}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors"
          >
            <Shield className="h-3 w-3" />
            מדיניות פרטיות
          </button>
          <span className="text-muted-foreground/15 text-[11px]">·</span>
          <button
            onClick={() => setModal("terms")}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors"
          >
            <FileText className="h-3 w-3" />
            תנאי שימוש
          </button>
          <span className="text-muted-foreground/15 text-[11px]">·</span>
          <button
            onClick={() => setModal("contact")}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors"
          >
            <Mail className="h-3 w-3" />
            יצירת קשר
          </button>
          {!minimal && (
            <>
              <span className="text-muted-foreground/15 text-[11px] hidden sm:inline">·</span>
              <span className="text-[11px] text-muted-foreground/20 hidden sm:inline font-mono">© 2026 ZenTrade</span>
            </>
          )}
        </div>
      </footer>

      {modal === "privacy"  && <Modal title="מדיניות פרטיות"  onClose={() => setModal(null)}><PrivacyContent /></Modal>}
      {modal === "terms"    && <Modal title="תנאי שימוש"       onClose={() => setModal(null)}><TermsContent /></Modal>}
      {modal === "contact"  && <Modal title="יצירת קשר"        onClose={() => setModal(null)}><ContactContent /></Modal>}
    </>
  );
};

export default Footer;
