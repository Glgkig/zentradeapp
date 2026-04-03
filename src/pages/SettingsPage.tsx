import { useState } from "react";
import AvatarPicker, { UserAvatar } from "@/components/AvatarPicker";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Shield, User, Globe, Lock, Bell, ChevronDown, ChevronRight,
  AlertTriangle, Volume2, Mail, Smartphone, Sparkles, Save, Camera,
  Eye, EyeOff, Palette, CreditCard, Key, Database, Zap, Link2, Plus, Check, X,
  Sun, Moon, LogOut, Trash2, Settings2,
} from "lucide-react";
import logoTradingView from "@/assets/logos/tradingview-full.png";
import logoTradeLocker from "@/assets/logos/tradelocker-full.png";
import logoMt5 from "@/assets/logos/mt5-full.png";
import logoBinance from "@/assets/logos/binance-full.png";
import logoTopstep from "@/assets/logos/topstepx-full.png";
import logoRithmic from "@/assets/logos/rithmic-full.png";
import logoNinjaTrader from "@/assets/logos/ninjatrader-full.png";
import logoIbkr from "@/assets/logos/ibkr-full.png";
import logoForex from "@/assets/logos/forex-full.png";

/* ===== Tab Config ===== */
const tabs = [
  { id: "profile", label: "פרופיל סוחר", icon: User },
  { id: "connectivity", label: "קישוריות", icon: Key },
  { id: "preferences", label: "העדפות מסחר", icon: Settings2 },
  { id: "appearance", label: "נראות וחוויה", icon: Palette },
  { id: "security", label: "מנוי ואבטחה", icon: Shield },
] as const;

type TabId = (typeof tabs)[number]["id"];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <div className="mx-auto max-w-[1100px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15">
          <Settings2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-foreground">מרכז שליטה</h1>
          <p className="text-[10px] md:text-[11px] text-foreground/40">
            הגדרות חשבון, קישוריות, העדפות ואבטחה
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        {/* Sidebar Tabs */}
        <div className="md:w-[210px] shrink-0">
          <div className="flex md:flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-1.5 md:p-2 gap-0.5 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`haptic-press flex items-center gap-2 md:gap-2.5 rounded-xl px-2.5 md:px-3 py-2 md:py-2.5 text-[11px] md:text-[12px] font-medium transition-all duration-200 whitespace-nowrap md:w-full ${
                    active
                      ? "bg-primary/10 text-primary border border-primary/12"
                      : "text-foreground/40 hover:bg-white/[0.04] hover:text-foreground/70 border border-transparent"
                  }`}
                >
                  <div className={`flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-lg transition-colors ${
                    active ? "bg-primary/15" : "bg-white/[0.04]"
                  }`}>
                    <tab.icon className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-foreground/30"}`} />
                  </div>
                  <span className="flex-1 text-right hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.label}</span>
                  {active && <ChevronRight className="h-3 w-3 text-primary/40 rotate-180 hidden md:block" />}
                </button>
              );
            })}
          </div>

          {/* Quick Info Card */}
          <div className="hidden md:block mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Zap className="h-3.5 w-3.5 text-accent" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-foreground">ZenTrade Pro</p>
                <p className="text-[8px] text-foreground/30">כל הפיצ׳רים פתוחים</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                { label: "סטאפים", value: "6 / ∞" },
                { label: "ברוקרים", value: "2 / 9" },
                { label: "AI תובנות", value: "ללא הגבלה", accent: true },
              ].map(i => (
                <div key={i.label} className="flex items-center justify-between text-[9px]">
                  <span className="text-foreground/30">{i.label}</span>
                  <span className={`font-semibold ${i.accent ? "text-accent" : "text-foreground/60"}`}>{i.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "connectivity" && <ConnectivityTab />}
          {activeTab === "preferences" && <PreferencesTab />}
          {activeTab === "appearance" && <AppearanceTab />}
          {activeTab === "security" && <SecurityTab />}
        </div>
      </div>
    </div>
  );
};

/* ===== Glass Card ===== */
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-5 ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05]">
      <Icon className="h-3.5 w-3.5 text-foreground/50" />
    </div>
    <div>
      <h3 className="text-[12px] font-semibold text-foreground">{title}</h3>
      {sub && <p className="text-[8px] text-foreground/30">{sub}</p>}
    </div>
  </div>
);

/* ===== Profile Tab ===== */
const ProfileTab = () => {
  const { profile, user, updateProfile } = useAuth();
  const userEmail = user?.email || "";
  const userName = profile?.full_name || "";
  const [name, setName] = useState(userName);
  const [experience, setExperience] = useState("senior");
  const [tradingStyle, setTradingStyle] = useState(profile?.trading_style || "smc");
  const [saving, setSaving] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({ full_name: name, trading_style: tradingStyle });
    setSaving(false);
    if (error) {
      toast.error("שגיאה בשמירה");
    } else {
      toast.success("הפרופיל עודכן בהצלחה ✓");
    }
  };

  return (
    <>
      <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
        {/* Avatar + Identity Card */}
        <GlassCard>
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <UserAvatar avatarUrl={profile?.avatar_url} userName={name || userName} size="lg" className="rounded-2xl border border-primary/15" />
              <button
                onClick={() => setAvatarPickerOpen(true)}
                className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15 border border-primary/20 text-primary hover:bg-primary/25 transition-all"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-foreground">{name || userName || "סוחר חדש"}</h3>
              <p className="text-[10px] text-foreground/40 mt-0.5">{userEmail}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="rounded-md bg-primary/10 border border-primary/12 px-2 py-0.5 text-[8px] font-bold text-primary">Pro</span>
                <span className="rounded-md bg-accent/10 border border-accent/12 px-2 py-0.5 text-[8px] font-bold text-accent">מאומת</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="שם מלא">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="השם שלך"
                className="settings-input"
              />
            </Field>
            <Field label="אימייל">
              <input
                type="text"
                value={userEmail}
                readOnly
                dir="ltr"
                className="settings-input cursor-not-allowed opacity-50"
              />
            </Field>
            <Field label="רמת ניסיון">
              <SelectField
                value={experience}
                onChange={setExperience}
                options={[
                  { value: "junior", label: "Junior — מתחיל" },
                  { value: "senior", label: "Senior — מנוסה" },
                  { value: "pro", label: "Pro — מקצועי" },
                ]}
              />
            </Field>
            <Field label="סגנון מסחר">
              <SelectField
                value={tradingStyle}
                onChange={setTradingStyle}
                options={[
                  { value: "smc", label: "SMC — Smart Money" },
                  { value: "ict", label: "ICT — Inner Circle" },
                  { value: "price-action", label: "Price Action" },
                  { value: "indicators", label: "אינדיקטורים" },
                ]}
              />
            </Field>
          </div>
        </GlassCard>

        <SaveButton onClick={handleSave} saving={saving} />
      </div>
      <AvatarPicker open={avatarPickerOpen} onOpenChange={setAvatarPickerOpen} />
    </>
  );
};

/* ===== Connectivity Tab ===== */
const brokers = [
  { name: "TradingView", color: "#2962FF", connected: true, logo: logoTradingView },
  { name: "TradeLocker", color: "#00E676", connected: false, logo: logoTradeLocker },
  { name: "MetaTrader 5", color: "#4A90D9", connected: true, logo: logoMt5 },
  { name: "Binance", color: "#F0B90B", connected: false, logo: logoBinance },
  { name: "TopstepX", color: "#1DB954", connected: false, logo: logoTopstep },
  { name: "Rithmic", color: "#FF6B35", connected: false, logo: logoRithmic },
  { name: "NinjaTrader", color: "#E84E0F", connected: false, logo: logoNinjaTrader },
  { name: "Interactive Brokers", color: "#DC143C", connected: false, logo: logoIbkr },
  { name: "Forex.com", color: "#0891B2", connected: false, logo: logoForex },
];

const ConnectivityTab = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const hasKey = apiKey.length > 10;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
      {/* API Key Section */}
      <GlassCard>
        <SectionHeader icon={Key} title="מפתחות API" sub="ניהול מפתחות גישה לשירותים חיצוניים" />

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-foreground/80">FAL API Key</span>
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold ${
                hasKey
                  ? "bg-[hsl(160,70%,48%)]/10 text-[hsl(160,70%,48%)] border border-[hsl(160,70%,48%)]/15"
                  : "bg-destructive/10 text-destructive border border-destructive/15"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${hasKey ? "bg-[hsl(160,70%,48%)] animate-pulse" : "bg-destructive"}`} />
                {hasKey ? "מחובר" : "לא מחובר"}
              </div>
            </div>
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-foreground/40 hover:text-foreground/70 transition-colors"
            >
              {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <input
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="הכנס את מפתח ה-API שלך..."
            dir="ltr"
            className="settings-input font-mono text-[11px]"
          />
          <p className="text-[8px] text-foreground/20 mt-2">מפתח ה-API משמש לזיהוי קולי ותמלול אוטומטי של עסקאות</p>
        </div>
      </GlassCard>

      {/* Broker Connections */}
      <GlassCard>
        <SectionHeader icon={Link2} title="חשבונות מסחר" sub="חבר את פלטפורמות המסחר שלך" />

        <div className="space-y-2">
          {brokers.map((broker) => (
            <div key={broker.name} className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all min-h-[48px] ${
              broker.connected
                ? "bg-[hsl(160,70%,48%)]/[0.03] border-[hsl(160,70%,48%)]/12"
                : "bg-white/[0.01] border-white/[0.06] hover:border-white/[0.1]"
            }`}>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${broker.color}cc, ${broker.color}66)` }}
                >
                  <img src={broker.logo} alt={broker.name} className="h-7 w-7 object-contain" loading="lazy" />
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-foreground/80">{broker.name}</p>
                  <p className={`text-[8px] ${broker.connected ? "text-[hsl(160,70%,48%)]" : "text-foreground/20"}`}>
                    {broker.connected ? "● מחובר ופעיל" : "לא מחובר"}
                  </p>
                </div>
              </div>
              {broker.connected ? (
                <button className="haptic-press flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 border border-destructive/15 text-destructive/60 hover:bg-destructive/20 transition-all">
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <button className="haptic-press flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/15 px-3 py-1.5 text-[9px] font-bold text-primary hover:bg-primary/20 transition-all">
                  <Plus className="h-3 w-3" />
                  חבר
                </button>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

/* ===== Preferences Tab ===== */
const PreferencesTab = () => {
  const [riskPct, setRiskPct] = useState(1);
  const [currency, setCurrency] = useState("usd");
  const [timezone, setTimezone] = useState("asia_jerusalem");

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
      {/* Risk Default */}
      <GlassCard>
        <SectionHeader icon={Shield} title="ניהול סיכונים" sub="ברירת מחדל לסיכון בעסקה" />

        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-foreground/50">סיכון ברירת מחדל לעסקה</span>
            <span className="rounded-lg bg-primary/10 border border-primary/15 px-3 py-1 text-[14px] font-bold text-primary font-mono">
              {riskPct}%
            </span>
          </div>
          <input
            type="range"
            min={0.25}
            max={5}
            step={0.25}
            value={riskPct}
            onChange={e => setRiskPct(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-white/[0.06] accent-[hsl(160,100%,42%)] cursor-pointer [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_8px_hsl(160,100%,42%,0.4)]"
          />
          <div className="flex justify-between text-[8px] text-foreground/20 mt-1">
            <span>0.25%</span>
            <span>5%</span>
          </div>
        </div>
      </GlassCard>

      {/* Currency & Timezone */}
      <GlassCard>
        <SectionHeader icon={Globe} title="מטבע ואזור זמן" />
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="מטבע תצוגה">
            <div className="flex gap-2">
              {[
                { value: "usd", label: "USD $" },
                { value: "ils", label: "ILS ₪" },
              ].map(c => (
                <button
                  key={c.value}
                  onClick={() => setCurrency(c.value)}
                  className={`haptic-press flex-1 rounded-xl border py-2.5 text-[11px] font-semibold transition-all min-h-[44px] ${
                    currency === c.value
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-white/[0.02] border-white/[0.06] text-foreground/40 hover:border-white/[0.1]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="אזור זמן מסחר">
            <SelectField
              value={timezone}
              onChange={setTimezone}
              options={[
                { value: "asia_jerusalem", label: "ירושלים (GMT+3)" },
                { value: "america_new_york", label: "ניו יורק (GMT-4)" },
                { value: "europe_london", label: "לונדון (GMT+1)" },
              ]}
            />
          </Field>
        </div>
      </GlassCard>

      {/* Data Sync */}
      <GlassCard>
        <SectionHeader icon={Database} title="נתונים וסנכרון" />
        <div className="space-y-2">
          <Toggle label="סנכרון אוטומטי" sub="עדכון נתונים כל 5 שניות" defaultChecked />
          <Toggle label="שמירת היסטוריה" sub="שמור את כל העסקאות בענן" defaultChecked />
        </div>
      </GlassCard>

      <SaveButton />
    </div>
  );
};

/* ===== Appearance Tab ===== */
const AppearanceTab = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [accentColor, setAccentColor] = useState("cyan");

  const accents = [
    { id: "cyan", label: "Neon Cyan", color: "160 100% 42%" },
    { id: "gold", label: "Matte Gold", color: "43 72% 52%" },
    { id: "purple", label: "Electric Purple", color: "270 80% 60%" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
      {/* Dark/Light Toggle */}
      <GlassCard>
        <SectionHeader icon={Palette} title="מצב תצוגה" />
        <div className="flex gap-3">
          <button
            onClick={() => setDarkMode(true)}
            className={`haptic-press flex-1 flex flex-col items-center gap-2.5 rounded-xl border py-5 transition-all ${
              darkMode
                ? "bg-primary/10 border-primary/20 shadow-[0_0_15px_hsl(160,100%,42%,0.08)]"
                : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]"
            }`}
          >
            <Moon className={`h-6 w-6 ${darkMode ? "text-primary" : "text-foreground/30"}`} />
            <span className={`text-[11px] font-semibold ${darkMode ? "text-primary" : "text-foreground/40"}`}>Dark Mode</span>
          </button>
          <button
            onClick={() => { setDarkMode(false); toast.info("מצב בהיר יהיה זמין בקרוב"); setDarkMode(true); }}
            className={`haptic-press flex-1 flex flex-col items-center gap-2.5 rounded-xl border py-5 transition-all ${
              !darkMode
                ? "bg-primary/10 border-primary/20"
                : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]"
            }`}
          >
            <Sun className={`h-6 w-6 ${!darkMode ? "text-primary" : "text-foreground/30"}`} />
            <span className={`text-[11px] font-semibold ${!darkMode ? "text-primary" : "text-foreground/40"}`}>Light Mode</span>
          </button>
        </div>
      </GlassCard>

      {/* Accent Color */}
      <GlassCard>
        <SectionHeader icon={Sparkles} title="צבע דגש" sub="בחר את הצבע המוביל של הממשק" />
        <div className="grid grid-cols-3 gap-3">
          {accents.map(a => (
            <button
              key={a.id}
              onClick={() => { setAccentColor(a.id); toast.success(`צבע דגש שונה ל-${a.label}`); }}
              className={`haptic-press relative flex flex-col items-center gap-2 rounded-xl border py-4 transition-all ${
                accentColor === a.id
                  ? "border-white/[0.15] bg-white/[0.04]"
                  : "border-white/[0.06] bg-white/[0.01] hover:border-white/[0.1]"
              }`}
            >
              <div
                className="h-8 w-8 rounded-full shadow-lg"
                style={{
                  backgroundColor: `hsl(${a.color})`,
                  boxShadow: accentColor === a.id ? `0 0 16px hsl(${a.color} / 0.4)` : "none",
                }}
              />
              <span className="text-[9px] font-semibold text-foreground/50">{a.label}</span>
              {accentColor === a.id && (
                <div className="absolute top-2 left-2 flex h-4 w-4 items-center justify-center rounded-full bg-white/10">
                  <Check className="h-2.5 w-2.5 text-foreground/70" />
                </div>
              )}
            </button>
          ))}
        </div>
      </GlassCard>

      <SaveButton />
    </div>
  );
};

/* ===== Security Tab ===== */
const SecurityTab = () => {
  const { signOut } = useAuth();
  const { isPro, subscriptionStatus, openCustomerPortal } = useSubscription();

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
      {/* Plan Status */}
      <GlassCard>
        <SectionHeader icon={Zap} title="מנוי פעיל" />
        <div className="flex items-center gap-4 rounded-xl border border-accent/15 bg-accent/[0.03] p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 border border-accent/15">
            <CreditCard className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-foreground">
              {isPro ? "ZenTrade Pro" : "ZenTrade Lite"}
            </p>
            <p className="text-[9px] text-foreground/30 mt-0.5">
              {isPro ? "כל הפיצ׳רים פתוחים • ללא הגבלת AI" : "תוכנית בסיסית • שדרג לפרו"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isPro && (
              <button
                onClick={openCustomerPortal}
                className="haptic-press rounded-lg bg-primary/10 border border-primary/15 px-3 py-1.5 text-[9px] font-bold text-primary hover:bg-primary/20 transition-all"
              >
                נהל מנוי
              </button>
            )}
            {!isPro && (
              <button
                onClick={() => window.location.href = "/pricing"}
                className="haptic-press rounded-lg bg-accent/10 border border-accent/15 px-3 py-1.5 text-[9px] font-bold text-accent hover:bg-accent/20 transition-all"
              >
                שדרוג
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Security Actions */}
      <GlassCard>
        <SectionHeader icon={Lock} title="אבטחת חשבון" />
        <div className="space-y-2">
          <ActionRow icon={Lock} label="שנה סיסמה" sub="עדכון אחרון: לפני 30 יום" onClick={() => toast.info("שינוי סיסמה בקרוב")} />
          <ActionRow icon={Shield} label="אימות דו-שלבי (2FA)" sub="לא מופעל" badge="כבוי" badgeColor="destructive" onClick={() => toast.info("2FA בקרוב")} />
        </div>
      </GlassCard>

      {/* Danger Zone */}
      <GlassCard className="border-destructive/10">
        <SectionHeader icon={AlertTriangle} title="אזור מסוכן" />
        <div className="space-y-2">
          <button
            onClick={signOut}
            className="haptic-press flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-all hover:bg-white/[0.04] min-h-[48px]"
          >
            <LogOut className="h-4 w-4 text-foreground/40" />
            <span className="text-[11px] font-semibold text-foreground/70">יציאה מהמערכת</span>
          </button>
          <button className="haptic-press flex w-full items-center gap-3 rounded-xl border border-destructive/10 bg-destructive/[0.02] px-4 py-3 transition-all hover:bg-destructive/[0.05] min-h-[48px]">
            <Trash2 className="h-4 w-4 text-destructive/60" />
            <span className="text-[11px] font-semibold text-destructive/70">מחיקת חשבון</span>
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

/* ===== Shared Components ===== */

const ActionRow = ({ icon: Icon, label, sub, badge, badgeColor = "primary", onClick }: {
  icon: React.ElementType; label: string; sub: string; badge?: string; badgeColor?: string; onClick?: () => void;
}) => (
  <button onClick={onClick} className="haptic-press flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-all hover:bg-white/[0.04] group min-h-[48px]">
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-foreground/30 group-hover:text-foreground/60 transition-colors" />
      <div className="text-right">
        <p className="text-[11px] font-semibold text-foreground/80">{label}</p>
        <p className="text-[8px] text-foreground/25">{sub}</p>
      </div>
    </div>
    {badge ? (
      <span className={`rounded-md bg-${badgeColor}/10 border border-${badgeColor}/12 px-2 py-0.5 text-[8px] font-bold text-${badgeColor}`}>
        {badge}
      </span>
    ) : (
      <ChevronRight className="h-3.5 w-3.5 text-foreground/15 rotate-180 group-hover:text-foreground/30 transition-colors" />
    )}
  </button>
);

const SaveButton = ({ onClick, saving }: { onClick?: () => void; saving?: boolean }) => (
  <button
    onClick={onClick}
    disabled={saving}
    className="haptic-press w-full flex items-center justify-center gap-2 rounded-xl bg-primary/12 border border-primary/20 py-3 text-[12px] font-bold text-primary hover:bg-primary/20 hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)] transition-all duration-300 min-h-[48px] disabled:opacity-50"
  >
    {saving ? (
      <span className="animate-spin h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full" />
    ) : (
      <Save className="h-4 w-4" />
    )}
    {saving ? "שומר..." : "שמור שינויים"}
  </button>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-[10px] md:text-[11px] font-semibold text-foreground/40">{label}</label>
    {children}
  </div>
);

const SelectField = ({ options, value, onChange }: {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (v: string) => void;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={e => onChange?.(e.target.value)}
      className="settings-input appearance-none"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/20" />
  </div>
);

const Toggle = ({ label, sub, defaultChecked }: { label: string; sub?: string; defaultChecked?: boolean }) => {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200 min-h-[48px] cursor-pointer ${
      on ? "bg-primary/[0.03] border-primary/10 hover:bg-primary/[0.05]" : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
    }`} onClick={() => setOn(!on)}>
      <div>
        <p className="text-[11px] md:text-[12px] font-medium text-foreground">{label}</p>
        {sub && <p className="text-[9px] text-foreground/30 mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={e => { e.stopPropagation(); setOn(!on); }}
        className={`relative h-6 w-11 rounded-full transition-all duration-300 ${on ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)]" : "bg-white/[0.08]"}`}
      >
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300 ${on ? "right-1" : "right-[22px]"}`} />
      </button>
    </div>
  );
};

export default SettingsPage;
