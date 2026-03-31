import { useState } from "react";
import {
  Shield, User, Globe, Clock, Lock, Bell, Plug, ChevronDown,
  CheckCircle2, AlertTriangle, Volume2, Mail, Smartphone,
} from "lucide-react";


const tabs = [
  { id: "account", label: "חשבון והעדפות", icon: User },
  { id: "rules", label: "חוקי ברזל - שומר הראש", icon: Shield },
  { id: "broker", label: "חיבורים לברוקר", icon: Plug },
  { id: "notifications", label: "התראות", icon: Bell },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">הגדרות מערכת</h1>
        <p className="mt-1 text-xs md:text-sm text-muted-foreground">
          נהל את החשבון שלך ואת חוקי ההגנה של מנטור ה-AI.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-muted/40 border border-border p-1 no-scrollbar">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 md:px-4 md:text-sm ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "account" && <AccountSettings />}
        {activeTab === "rules" && <RulesSettings />}
        {activeTab === "broker" && <BrokerSettings />}
        {activeTab === "notifications" && <NotificationSettings />}
      </div>
    </div>
  );
};

/* ===== Settings Card Wrapper ===== */
const SettingsCard = ({ title, subtitle, icon, children, highlight }: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  highlight?: boolean;
}) => (
  <div className={`rounded-2xl border p-5 md:p-6 transition-all ${
    highlight
      ? "border-primary/30 bg-primary/[0.03] shadow-[0_0_30px_hsl(217_72%_53%/0.04)]"
      : "border-border bg-secondary/30"
  }`}>
    <div className="flex items-start gap-3 mb-5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        highlight ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
      }`}>
        {icon}
      </div>
      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground md:text-base">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[10px] md:text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

/* ===== Shared Input Components ===== */
const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="mb-1.5 block text-[11px] md:text-xs font-medium text-muted-foreground">{children}</label>
);

const TextInput = ({ value, placeholder, type = "text", dir, prefix }: {
  value: string; placeholder: string; type?: string; dir?: string; prefix?: string;
}) => (
  <div className="relative">
    {prefix && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">{prefix}</span>
    )}
    <input
      type={type}
      defaultValue={value}
      placeholder={placeholder}
      dir={dir}
      className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 text-xs md:text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
        prefix ? "px-8" : "px-3.5"
      }`}
    />
  </div>
);

const SelectInput = ({ options, defaultValue }: { options: { value: string; label: string }[]; defaultValue?: string }) => (
  <div className="relative">
    <select
      defaultValue={defaultValue}
      className="w-full appearance-none rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-xs md:text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  </div>
);

const ToggleSwitch = ({ label, sublabel, defaultChecked }: { label: string; sublabel?: string; defaultChecked?: boolean }) => {
  const [checked, setChecked] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
      <div>
        <p className="text-xs md:text-sm font-medium text-foreground">{label}</p>
        {sublabel && <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? "right-0.5" : "right-[22px]"
          }`}
        />
      </button>
    </div>
  );
};

/* ===== Category A: Account ===== */
const AccountSettings = () => (
  <>
    <SettingsCard title="פרופיל" subtitle="פרטים אישיים" icon={<User className="h-4 w-4" />}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel>שם מלא</FieldLabel>
          <TextInput value="יהונתן" placeholder="השם שלך" />
        </div>
        <div>
          <FieldLabel>אימייל</FieldLabel>
          <TextInput value="yehonatan@zentrade.io" placeholder="name@example.com" dir="ltr" />
        </div>
      </div>
      <button className="mt-4 rounded-lg border border-border bg-muted/30 px-4 py-2 text-xs font-medium text-foreground transition-all hover:bg-muted/60">
        <Lock className="ml-1.5 inline h-3 w-3 text-muted-foreground" />
        שנה סיסמה
      </button>
    </SettingsCard>

    <SettingsCard title="העדפות מערכת" subtitle="שפה, אזור זמן ותצוגה" icon={<Globe className="h-4 w-4" />}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel>שפת מערכת</FieldLabel>
          <SelectInput
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
        </div>
        <div>
          <FieldLabel>אזור זמן</FieldLabel>
          <SelectInput
            defaultValue="asia_jerusalem"
            options={[
              { value: "asia_jerusalem", label: "Asia/Jerusalem (GMT+3)" },
              { value: "america_new_york", label: "America/New_York (GMT-4)" },
              { value: "europe_london", label: "Europe/London (GMT+1)" },
              { value: "europe_berlin", label: "Europe/Berlin (GMT+2)" },
              { value: "asia_tokyo", label: "Asia/Tokyo (GMT+9)" },
              { value: "america_chicago", label: "America/Chicago (GMT-5)" },
              { value: "australia_sydney", label: "Australia/Sydney (GMT+10)" },
            ]}
          />
        </div>
      </div>
    </SettingsCard>
  </>
);

/* ===== Category B: AI Rules ===== */
const RulesSettings = () => (
  <>
    <SettingsCard
      title="חוקי ברזל — שומר הראש"
      subtitle="הגדר חוקים קשיחים שהמנטור ה-AI שלך יאכוף בזמן אמת"
      icon={<Shield className="h-4 w-4" />}
      highlight
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel>הפסד יומי מקסימלי</FieldLabel>
          <TextInput value="500" placeholder="סכום בדולרים" type="number" prefix="$" />
        </div>
        <div>
          <FieldLabel>מקסימום עסקאות ליום</FieldLabel>
          <TextInput value="10" placeholder="מספר עסקאות" type="number" />
        </div>
        <div>
          <FieldLabel>זמן נעילת מסך</FieldLabel>
          <SelectInput
            defaultValue="12h"
            options={[
              { value: "1h", label: "שעה אחת" },
              { value: "4h", label: "4 שעות" },
              { value: "12h", label: "12 שעות" },
              { value: "midnight", label: "עד חצות" },
              { value: "24h", label: "24 שעות" },
            ]}
          />
        </div>
        <div>
          <FieldLabel>מקסימום הפסד לעסקה בודדת</FieldLabel>
          <TextInput value="100" placeholder="סכום בדולרים" type="number" prefix="$" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <ToggleSwitch
          label="הפעל חסימה קשיחה"
          sublabel="לא ניתן לביטול בזמן מסחר פעיל"
          defaultChecked={true}
        />
        <ToggleSwitch
          label="חסימת מסחר לפני אירועי חדשות"
          sublabel="מונע כניסה 30 דקות לפני CPI/FOMC"
          defaultChecked={true}
        />
      </div>

      <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-primary">שים לב:</span> שינוי בחוקי הברזל ייכנס לתוקף רק מהיום הבא. לא ניתן לשנות חוקים במהלך יום מסחר פעיל.
        </p>
      </div>
    </SettingsCard>
  </>
);

/* ===== Category C: Broker Connections ===== */
const brokers = [
  { name: "TradingView", connected: false, account: null },
  { name: "TradeLocker", connected: true, account: "TL-7842" },
  { name: "MetaTrader 5 (MT5)", connected: false, account: null },
  { name: "Binance", connected: true, account: "BN-3291" },
  { name: "TopstepX", connected: false, account: null },
  { name: "Rithmic", connected: false, account: null },
  { name: "NinjaTrader", connected: false, account: null },
  { name: "Interactive Brokers", connected: false, account: null },
  { name: "Forex.com", connected: false, account: null },
];

const brokerInitials: Record<string, string> = {
  "TradingView": "TV",
  "TradeLocker": "TL",
  "MetaTrader 5 (MT5)": "M5",
  "Binance": "BN",
  "TopstepX": "TX",
  "Rithmic": "RI",
  "NinjaTrader": "NT",
  "Interactive Brokers": "IB",
  "Forex.com": "FX",
};

const BrokerSettings = () => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  return (
    <SettingsCard title="חיבורים לברוקר ו-API" subtitle="נהל חיבורי API לפלטפורמות המסחר שלך" icon={<Plug className="h-4 w-4" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {brokers.map((b) => (
          <div
            key={b.name}
            className={`group relative rounded-2xl border p-4 transition-all duration-200 hover:scale-[1.01] ${
              b.connected
                ? "border-accent/25 bg-accent/[0.04] shadow-[0_0_20px_hsl(160_60%_45%/0.05)]"
                : "border-border bg-muted/10 hover:border-primary/20 hover:bg-primary/[0.02]"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-bold ${
                  b.connected
                    ? "border-accent/20 bg-accent/10 text-accent"
                    : "border-border bg-muted/30 text-muted-foreground"
                }`}>
                  {brokerInitials[b.name] || b.name.slice(0, 2)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{b.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${b.connected ? "bg-accent" : "bg-muted-foreground/40"}`} />
                    <span className={`text-[9px] font-medium ${b.connected ? "text-accent" : "text-muted-foreground/60"}`}>
                      {b.connected ? `מחובר • ${b.account}` : "מנותק"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* API Key Input */}
            {!b.connected && (
              <div className="mb-3">
                <input
                  type="password"
                  placeholder="הזן מפתח API"
                  value={apiKeys[b.name] || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, [b.name]: e.target.value })}
                  className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-[10px] md:text-xs text-foreground placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
            )}

            {/* Action Button */}
            <button
              className={`w-full rounded-lg py-2 text-[10px] md:text-xs font-semibold transition-all ${
                b.connected
                  ? "border border-accent/25 bg-accent/10 text-accent hover:bg-accent/20"
                  : "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(217_72%_53%/0.15)] hover:shadow-[0_0_20px_hsl(217_72%_53%/0.25)] hover:bg-primary/90"
              }`}
            >
              {b.connected ? "מחובר ✓" : "התחבר"}
            </button>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
};

/* ===== Category D: Notifications ===== */
const NotificationSettings = () => (
  <SettingsCard title="הגדרות התראות" subtitle="בחר איך ומתי לקבל עדכונים" icon={<Bell className="h-4 w-4" />}>
    <div className="space-y-3">
      <ToggleSwitch
        label="התראות פוש"
        sublabel="קבל התראות ישירות לטלפון"
        defaultChecked={true}
      />
      <ToggleSwitch
        label="התראות אימייל"
        sublabel="סיכום יומי ועדכוני מערכת"
        defaultChecked={true}
      />
      <ToggleSwitch
        label="התראות קוליות מה-AI"
        sublabel="המנטור ידבר אליך כשיזהה סטרס או סיכון"
        defaultChecked={false}
      />
      <ToggleSwitch
        label="התראה לפני אירועי חדשות"
        sublabel="עדכון 30 דקות לפני אירוע כלכלי משמעותי"
        defaultChecked={true}
      />
    </div>

    <div className="mt-5 grid grid-cols-3 gap-3">
      <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-muted/20 p-3">
        <Smartphone className="h-5 w-5 text-primary" />
        <span className="text-[10px] text-muted-foreground">פוש</span>
      </div>
      <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-muted/20 p-3">
        <Mail className="h-5 w-5 text-primary" />
        <span className="text-[10px] text-muted-foreground">אימייל</span>
      </div>
      <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-muted/20 p-3">
        <Volume2 className="h-5 w-5 text-primary" />
        <span className="text-[10px] text-muted-foreground">קולי</span>
      </div>
    </div>
  </SettingsCard>
);

export default SettingsPage;
