import { useState } from "react";
import {
  Shield, User, Globe, Lock, Bell, ChevronDown,
  AlertTriangle, Volume2, Mail, Smartphone,
} from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-heading text-lg md:text-xl font-bold text-foreground">הגדרות</h1>
        <p className="mt-0.5 text-[11px] md:text-xs text-muted-foreground">
          נהל את החשבון, חוקי הגנה והתראות.
        </p>
      </div>

      {/* Profile */}
      <Section title="פרופיל" icon={<User className="h-4 w-4" />}>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="שם מלא">
            <Input value="יהונתן" placeholder="השם שלך" />
          </Field>
          <Field label="אימייל">
            <Input value="yehonatan@zentrade.io" placeholder="name@example.com" dir="ltr" />
          </Field>
        </div>
        <button className="mt-3 flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted/50 transition-all">
          <Lock className="h-3 w-3 text-muted-foreground" />
          שנה סיסמה
        </button>
      </Section>

      {/* Preferences */}
      <Section title="העדפות" icon={<Globe className="h-4 w-4" />}>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="שפה">
            <Select
              defaultValue="he"
              options={[
                { value: "he", label: "עברית" },
                { value: "en", label: "English" },
                { value: "es", label: "Español" },
                { value: "fr", label: "Français" },
                { value: "de", label: "Deutsch" },
                { value: "ar", label: "العربية" },
              ]}
            />
          </Field>
          <Field label="אזור זמן">
            <Select
              defaultValue="asia_jerusalem"
              options={[
                { value: "asia_jerusalem", label: "Jerusalem (GMT+3)" },
                { value: "america_new_york", label: "New York (GMT-4)" },
                { value: "europe_london", label: "London (GMT+1)" },
                { value: "europe_berlin", label: "Berlin (GMT+2)" },
                { value: "asia_tokyo", label: "Tokyo (GMT+9)" },
                { value: "america_chicago", label: "Chicago (GMT-5)" },
              ]}
            />
          </Field>
        </div>
      </Section>

      {/* AI Rules */}
      <Section title="חוקי ברזל — שומר הראש" icon={<Shield className="h-4 w-4" />} highlight>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="הפסד יומי מקסימלי">
            <Input value="500" placeholder="סכום" type="number" prefix="$" />
          </Field>
          <Field label="מקסימום עסקאות ליום">
            <Input value="10" placeholder="מספר" type="number" />
          </Field>
          <Field label="זמן נעילת מסך">
            <Select
              defaultValue="12h"
              options={[
                { value: "1h", label: "שעה אחת" },
                { value: "4h", label: "4 שעות" },
                { value: "12h", label: "12 שעות" },
                { value: "midnight", label: "עד חצות" },
                { value: "24h", label: "24 שעות" },
              ]}
            />
          </Field>
          <Field label="מקסימום הפסד לעסקה בודדת">
            <Input value="100" placeholder="סכום" type="number" prefix="$" />
          </Field>
        </div>

        <div className="mt-4 space-y-2">
          <Toggle label="חסימה קשיחה" sub="לא ניתן לביטול בזמן מסחר" defaultChecked />
          <Toggle label="חסימה לפני חדשות" sub="30 דקות לפני CPI/FOMC" defaultChecked />
        </div>

        <div className="mt-4 rounded-lg border border-primary/15 bg-primary/[0.04] p-2.5 flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-[9px] md:text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-primary">שים לב:</span> שינוי בחוקים ייכנס לתוקף רק מהיום הבא.
          </p>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="התראות" icon={<Bell className="h-4 w-4" />}>
        <div className="space-y-2">
          <Toggle label="התראות פוש" sub="ישירות לטלפון" defaultChecked />
          <Toggle label="אימייל" sub="סיכום יומי ועדכוני מערכת" defaultChecked />
          <Toggle label="התראות קוליות" sub="המנטור ידבר כשיזהה סיכון" />
          <Toggle label="לפני אירועי חדשות" sub="30 דקות לפני אירוע כלכלי" defaultChecked />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { icon: <Smartphone className="h-4 w-4 text-primary" />, label: "פוש" },
            { icon: <Mail className="h-4 w-4 text-primary" />, label: "אימייל" },
            { icon: <Volume2 className="h-4 w-4 text-primary" />, label: "קולי" },
          ].map((ch) => (
            <div key={ch.label} className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/15 p-2.5">
              {ch.icon}
              <span className="text-[9px] text-muted-foreground">{ch.label}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

/* ===== Shared Components ===== */

const Section = ({ title, icon, highlight, children }: {
  title: string; icon: React.ReactNode; highlight?: boolean; children: React.ReactNode;
}) => (
  <div className={`rounded-xl border p-4 md:p-5 transition-all duration-300 ${
    highlight ? "border-primary/20 bg-primary/[0.02]" : "border-border/15 bg-secondary/15 backdrop-blur-sm"
  }`}>
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
        highlight ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground"
      }`}>
        {icon}
      </div>
      <h2 className="text-xs md:text-sm font-semibold text-foreground">{title}</h2>
    </div>
    {children}
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1 block text-[10px] md:text-[11px] font-medium text-muted-foreground">{label}</label>
    {children}
  </div>
);

const Input = ({ value, placeholder, type = "text", dir, prefix }: {
  value: string; placeholder: string; type?: string; dir?: string; prefix?: string;
}) => (
  <div className="relative">
    {prefix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground">{prefix}</span>}
    <input
      type={type}
      defaultValue={value}
      placeholder={placeholder}
      dir={dir}
      className={`w-full rounded-lg border border-border bg-muted/20 py-2 text-xs text-foreground placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all ${prefix ? "px-7" : "px-3"}`}
    />
  </div>
);

const Select = ({ options, defaultValue }: { options: { value: string; label: string }[]; defaultValue?: string }) => (
  <div className="relative">
    <select
      defaultValue={defaultValue}
      className="w-full appearance-none rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <ChevronDown className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
  </div>
);

const Toggle = ({ label, sub, defaultChecked }: { label: string; sub?: string; defaultChecked?: boolean }) => {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/10 px-3 py-2.5">
      <div>
        <p className="text-[11px] md:text-xs font-medium text-foreground">{label}</p>
        {sub && <p className="text-[9px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? "right-0.5" : "right-[18px]"}`} />
      </button>
    </div>
  );
};

export default SettingsPage;
