import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield, User, Globe, Lock, Bell, ChevronDown, ChevronRight,
  AlertTriangle, Volume2, Mail, Smartphone, Sparkles, Save,
  Eye, Palette, CreditCard, Key, Database, Zap, Link2, Plus, Check, X,
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
  { id: "profile", label: "פרופיל", icon: User },
  { id: "connections", label: "חיבורים", icon: Link2 },
  { id: "preferences", label: "העדפות", icon: Globe },
  { id: "rules", label: "חוקי ברזל", icon: Shield },
  { id: "notifications", label: "התראות", icon: Bell },
] as const;

type TabId = (typeof tabs)[number]["id"];

const SettingsPage = () => {
  const { profile, user } = useAuth();
  const userEmail = user?.email || "";
  const userName = profile?.full_name || "סוחר";
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <div className="mx-auto max-w-[1100px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-foreground">הגדרות</h1>
          <p className="text-[10px] md:text-[11px] text-muted-foreground/40">
            נהל את החשבון, חוקי הגנה, התראות והעדפות
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        {/* Sidebar Tabs */}
        <div className="md:w-[220px] shrink-0">
          <div className="flex md:flex-col rounded-2xl border border-border/10 bg-card/50 p-1.5 md:p-2 gap-0.5 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`haptic-press flex items-center gap-2 md:gap-2.5 rounded-xl px-2.5 md:px-3 py-2 md:py-2.5 text-[11px] md:text-[12px] font-medium transition-all duration-200 whitespace-nowrap md:w-full ${
                    active
                      ? "bg-primary/10 text-primary border border-primary/12"
                      : "text-muted-foreground/50 hover:bg-muted/15 hover:text-foreground border border-transparent"
                  }`}
                >
                  <div className={`flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-lg transition-colors ${
                    active ? "bg-primary/15" : "bg-muted/10"
                  }`}>
                    <tab.icon className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground/40"}`} />
                  </div>
                  <span className="flex-1 text-right hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.label}</span>
                  {active && <ChevronRight className="h-3 w-3 text-primary/40 rotate-180 hidden md:block" />}
                </button>
              );
            })}
          </div>

          {/* Quick Info Card — hidden on mobile */}
          <div className="hidden md:block mt-3 rounded-2xl border border-border/10 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Zap className="h-3.5 w-3.5 text-accent" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-foreground">תוכנית Pro</p>
                <p className="text-[8px] text-muted-foreground/40">כל הפיצ׳רים פתוחים</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-muted-foreground/40">סטאפים</span>
                <span className="text-foreground/60 font-semibold">6 / ∞</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-muted-foreground/40">ברוקרים</span>
                <span className="text-foreground/60 font-semibold">2 / 9</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-muted-foreground/40">AI תובנות</span>
                <span className="text-accent font-semibold">ללא הגבלה</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "connections" && <ConnectionsTab />}
          {activeTab === "preferences" && <PreferencesTab />}
          {activeTab === "rules" && <RulesTab />}
          {activeTab === "notifications" && <NotificationsTab />}
        </div>
      </div>
    </div>
  );
};

/* ===== Profile Tab ===== */
const ProfileTab = () => {
  const { profile, user } = useAuth();
  const userEmail = user?.email || "";
  const userName = profile?.full_name || "סוחר";

  return (
  <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
    {/* Avatar + Name */}
    <div className="rounded-2xl border border-border/10 bg-card/50 p-5">
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/12 border border-primary/15 text-2xl font-bold text-primary">
            {userName.charAt(0)}
          </div>
          <button className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15 border border-primary/20 text-primary hover:bg-primary/25 transition-all">
            <Eye className="h-3 w-3" />
          </button>
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-foreground">{userName}</h3>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5">{userEmail}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="rounded-md bg-primary/10 border border-primary/12 px-2 py-0.5 text-[8px] font-bold text-primary">Pro</span>
            <span className="rounded-md bg-accent/10 border border-accent/12 px-2 py-0.5 text-[8px] font-bold text-accent">מאומת</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="שם מלא">
          <Input value={userName} placeholder="השם שלך" />
        </Field>
        <Field label="אימייל">
          <Input value={userEmail} placeholder="name@example.com" dir="ltr" />
        </Field>
      </div>
    </div>

    {/* Security */}
    <div className="rounded-2xl border border-border/10 bg-card/50 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/15">
          <Key className="h-3.5 w-3.5 text-muted-foreground/50" />
        </div>
        <h3 className="text-[12px] font-semibold text-foreground">אבטחה</h3>
      </div>

      <div className="space-y-2">
        <button className="haptic-press flex w-full items-center justify-between rounded-xl border border-border/10 bg-muted/[0.04] px-4 py-3 transition-all hover:bg-muted/10 hover:border-primary/12 group min-h-[48px]">
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
            <div className="text-right">
              <p className="text-[11px] font-semibold text-foreground/80">שנה סיסמה</p>
              <p className="text-[8px] text-muted-foreground/30">עדכון אחרון: לפני 30 יום</p>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/20 rotate-180 group-hover:text-primary/40 transition-colors" />
        </button>

        <button className="haptic-press flex w-full items-center justify-between rounded-xl border border-border/10 bg-muted/[0.04] px-4 py-3 transition-all hover:bg-muted/10 hover:border-primary/12 group min-h-[48px]">
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
            <div className="text-right">
              <p className="text-[11px] font-semibold text-foreground/80">אימות דו-שלבי (2FA)</p>
              <p className="text-[8px] text-muted-foreground/30">לא מופעל</p>
            </div>
          </div>
          <span className="rounded-md bg-destructive/10 border border-destructive/12 px-2 py-0.5 text-[8px] font-bold text-destructive">כבוי</span>
        </button>
      </div>
    </div>

    <SaveButton />
  </div>
);

/* ===== Connections Tab ===== */
const brokers = [
  { name: "TradingView", short: "TV", color: "#2962FF", connected: true, logo: logoTradingView },
  { name: "TradeLocker", short: "TL", color: "#00E676", connected: false, logo: logoTradeLocker },
  { name: "MetaTrader 5", short: "MT5", color: "#4A90D9", connected: true, logo: logoMt5 },
  { name: "Binance", short: "BN", color: "#F0B90B", connected: false, logo: logoBinance },
  { name: "TopstepX", short: "TS", color: "#1DB954", connected: false, logo: logoTopstep },
  { name: "Rithmic", short: "R+", color: "#FF6B35", connected: false, logo: logoRithmic },
  { name: "NinjaTrader", short: "NT", color: "#E84E0F", connected: false, logo: logoNinjaTrader },
  { name: "Interactive Brokers", short: "IB", color: "#DC143C", connected: false, logo: logoIbkr },
  { name: "Forex.com", short: "FX", color: "#0891B2", connected: false, logo: logoForex },
];

const ConnectionsTab = () => {
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
      {/* Header CTA */}
      <button className="haptic-press w-full flex items-center justify-center gap-2 rounded-xl bg-primary/12 border border-primary/20 py-3 text-[12px] font-bold text-primary hover:bg-primary/20 hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)] transition-all duration-300 min-h-[48px]">
        <Plus className="h-4 w-4" />
        הוסף חשבון מסחר
      </button>

      {/* Connected Accounts */}
      <div className="rounded-2xl border border-border/10 bg-card/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
              <Link2 className="h-3.5 w-3.5 text-accent/60" />
            </div>
            <h3 className="text-[12px] font-semibold text-foreground">חשבונות מחוברים</h3>
          </div>
          <span className="rounded-md bg-accent/10 border border-accent/12 px-2 py-0.5 text-[8px] font-bold text-accent">
            {brokers.filter(b => b.connected).length} פעילים
          </span>
        </div>

        <div className="space-y-2">
          {brokers.filter(b => b.connected).map((broker) => (
            <div key={broker.name} className="flex items-center justify-between rounded-xl border border-accent/12 bg-accent/[0.03] px-4 py-3 transition-all min-h-[48px]">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 overflow-hidden shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${broker.color}dd, ${broker.color}88)` }}
                >
                  <img src={broker.logo} alt={broker.name} className="h-7 w-7 object-contain" loading="lazy" />
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-foreground/80">{broker.name}</p>
                  <p className="text-[8px] text-accent">● מחובר ופעיל</p>
                </div>
              </div>
              <button className="haptic-press flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 border border-destructive/15 text-destructive/60 hover:bg-destructive/20 transition-all">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* All Brokers - Circular Layout */}
      <div className="rounded-2xl border border-border/10 bg-card/50 p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/15">
            <Database className="h-3.5 w-3.5 text-muted-foreground/50" />
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-foreground">פלטפורמות מסחר נתמכות</h3>
            <p className="text-[8px] text-muted-foreground/35">לחץ על פלטפורמה לחיבור</p>
          </div>
        </div>

        {/* Orbital Layout */}
        <div className="relative mx-auto w-full max-w-[320px] aspect-square" style={{ perspective: "800px" }}>
          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
          </div>

          {/* Rotating Orbit Container */}
          <div className="absolute inset-0" style={{ animation: "spin-orbit 30s linear infinite" }}>
            {/* Orbit Ring */}
            <div className="absolute inset-4 rounded-full border border-dashed border-muted-foreground/8" />
            <div className="absolute inset-10 rounded-full border border-dashed border-muted-foreground/5" />

            {/* Broker Icons in Circle */}
            {brokers.map((broker, i) => {
              const angle = (i / brokers.length) * 2 * Math.PI - Math.PI / 2;
              const radius = 42;
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);

              return (
                <button
                  key={broker.name}
                  onClick={() => setSelectedBroker(selectedBroker === broker.name ? null : broker.name)}
                  className="haptic-press absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 hover:scale-110 z-20"
                  style={{ left: `${x}%`, top: `${y}%`, animation: "counter-spin-orbit 30s linear infinite" }}
                  title={broker.name}
                >
                  <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl border overflow-hidden shadow-lg transition-all duration-300 ${
                    broker.connected
                      ? "border-accent/30 shadow-[0_0_12px_hsl(var(--accent)/0.3)]"
                      : "border-white/8 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  }`}
                    style={{ background: `linear-gradient(135deg, ${broker.color}cc, ${broker.color}66)` }}
                  >
                    <img src={broker.logo} alt={broker.name} className="h-8 w-8 object-contain" loading="lazy" />
                    {broker.connected && (
                      <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent border-2 border-background">
                        <Check className="h-2.5 w-2.5 text-background" />
                      </div>
                    )}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <span className="rounded-md bg-card border border-border/20 px-2 py-0.5 text-[8px] font-semibold text-foreground/70 shadow-lg">
                      {broker.name}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Connecting Lines from center to each broker */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
              {brokers.map((broker, i) => {
                const angle = (i / brokers.length) * 2 * Math.PI - Math.PI / 2;
                const radius = 42;
                const x = 50 + radius * Math.cos(angle);
                const y = 50 + radius * Math.sin(angle);
                return (
                  <line
                    key={broker.name}
                    x1="50" y1="50" x2={x} y2={y}
                    stroke={broker.connected ? "hsl(var(--accent))" : "hsl(var(--muted-foreground) / 0.06)"}
                    strokeWidth={broker.connected ? "0.3" : "0.15"}
                    strokeDasharray={broker.connected ? "none" : "1,1"}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Selected Broker Detail */}
      {selectedBroker && (() => {
        const broker = brokers.find(b => b.name === selectedBroker)!;
        return (
          <div className="rounded-2xl border border-primary/12 bg-primary/[0.02] p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 overflow-hidden shadow-lg"
                style={{ background: `linear-gradient(135deg, ${broker.color}dd, ${broker.color}77)` }}
              >
                <img src={broker.logo} alt={broker.name} className="h-9 w-9 object-contain" loading="lazy" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-foreground">{broker.name}</h3>
                <p className="text-[9px] text-muted-foreground/40">
                  {broker.connected ? "מחובר ומסנכרן עסקאות" : "לא מחובר — לחץ לחיבור"}
                </p>
              </div>
            </div>

            {!broker.connected ? (
              <div className="space-y-3">
                <Field label="API Key">
                  <Input value="" placeholder="הכנס API Key..." dir="ltr" />
                </Field>
                <Field label="Secret Key">
                  <Input value="" placeholder="הכנס Secret Key..." dir="ltr" />
                </Field>
                <button className="haptic-press w-full flex items-center justify-center gap-2 rounded-xl bg-primary/15 border border-primary/20 py-3 text-[12px] font-bold text-primary hover:bg-primary/25 transition-all min-h-[48px]">
                  <Link2 className="h-4 w-4" />
                  חבר את {broker.name}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-accent/10 bg-accent/[0.03] px-4 py-2.5">
                  <span className="text-[10px] text-muted-foreground/50">סטטוס</span>
                  <span className="text-[10px] font-bold text-accent">● פעיל ומסנכרן</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/10 bg-muted/[0.03] px-4 py-2.5">
                  <span className="text-[10px] text-muted-foreground/50">עסקאות מיובאות</span>
                  <span className="text-[10px] font-bold text-foreground/70 font-mono">247</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/10 bg-muted/[0.03] px-4 py-2.5">
                  <span className="text-[10px] text-muted-foreground/50">סנכרון אחרון</span>
                  <span className="text-[10px] font-bold text-foreground/70 font-mono">לפני 3 דקות</span>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

/* ===== Preferences Tab ===== */
const PreferencesTab = () => (
  <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
    <div className="rounded-2xl border border-border/10 bg-card/50 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/15">
          <Globe className="h-3.5 w-3.5 text-muted-foreground/50" />
        </div>
        <h3 className="text-[12px] font-semibold text-foreground">שפה ואזור</h3>
      </div>
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
    </div>

    <div className="rounded-2xl border border-border/10 bg-card/50 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/15">
          <Palette className="h-3.5 w-3.5 text-muted-foreground/50" />
        </div>
        <h3 className="text-[12px] font-semibold text-foreground">תצוגה</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="מטבע תצוגה">
          <Select
            defaultValue="usd"
            options={[
              { value: "usd", label: "USD ($)" },
              { value: "eur", label: "EUR (€)" },
              { value: "gbp", label: "GBP (£)" },
              { value: "ils", label: "ILS (₪)" },
            ]}
          />
        </Field>
        <Field label="פורמט תאריך">
          <Select
            defaultValue="dd_mm"
            options={[
              { value: "dd_mm", label: "DD/MM/YYYY" },
              { value: "mm_dd", label: "MM/DD/YYYY" },
              { value: "yyyy_mm", label: "YYYY-MM-DD" },
            ]}
          />
        </Field>
      </div>
    </div>

    <div className="rounded-2xl border border-border/10 bg-card/50 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/15">
          <Database className="h-3.5 w-3.5 text-muted-foreground/50" />
        </div>
        <h3 className="text-[12px] font-semibold text-foreground">נתונים</h3>
      </div>
      <div className="space-y-2">
        <Toggle label="סנכרון אוטומטי" sub="עדכון נתונים כל 5 שניות" defaultChecked />
        <Toggle label="שמירת היסטוריה" sub="שמור את כל העסקאות ב-Cloud" defaultChecked />
      </div>
    </div>

    <SaveButton />
  </div>
);

/* ===== Rules Tab ===== */
const RulesTab = () => (
  <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
    {/* Warning Banner */}
    <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/12 shrink-0">
        <Shield className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-[12px] font-bold text-foreground mb-0.5">חוקי ברזל — שומר הראש</p>
        <p className="text-[9px] text-muted-foreground/50 leading-relaxed">
          החוקים האלה מגנים עליך מפני עצמך. שינויים ייכנסו לתוקף רק מהיום הבא.
        </p>
      </div>
    </div>

    {/* Loss Limits */}
    <div className="rounded-2xl border border-border/10 bg-card/50 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive/60" />
        </div>
        <h3 className="text-[12px] font-semibold text-foreground">מגבלות הפסד</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="הפסד יומי מקסימלי">
          <Input value="500" placeholder="סכום" type="number" prefix="$" />
        </Field>
        <Field label="מקסימום הפסד לעסקה בודדת">
          <Input value="100" placeholder="סכום" type="number" prefix="$" />
        </Field>
      </div>
    </div>

    {/* Trading Limits */}
    <div className="rounded-2xl border border-border/10 bg-card/50 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <CreditCard className="h-3.5 w-3.5 text-primary/60" />
        </div>
        <h3 className="text-[12px] font-semibold text-foreground">מגבלות מסחר</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
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
      </div>
    </div>

    {/* Hard Locks */}
    <div className="rounded-2xl border border-border/10 bg-card/50 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
          <Lock className="h-3.5 w-3.5 text-accent/60" />
        </div>
        <h3 className="text-[12px] font-semibold text-foreground">נעילות קשיחות</h3>
      </div>
      <div className="space-y-2">
        <Toggle label="חסימה קשיחה" sub="לא ניתן לביטול בזמן מסחר" defaultChecked />
        <Toggle label="חסימה לפני חדשות" sub="30 דקות לפני CPI / FOMC / NFP" defaultChecked />
        <Toggle label="נעילת Revenge Trading" sub="חסימה אוטומטית אחרי 2 הפסדים רצופים" />
      </div>
    </div>

    <SaveButton />
  </div>
);

/* ===== Notifications Tab ===== */
const NotificationsTab = () => (
  <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
    {/* Channels Overview */}
    <div className="rounded-2xl border border-border/10 bg-card/50 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Bell className="h-3.5 w-3.5 text-primary/60" />
        </div>
        <h3 className="text-[12px] font-semibold text-foreground">ערוצי התראות</h3>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: <Smartphone className="h-4 w-4" />, label: "פוש", active: true },
          { icon: <Mail className="h-4 w-4" />, label: "אימייל", active: true },
          { icon: <Volume2 className="h-4 w-4" />, label: "קולי", active: false },
        ].map((ch) => (
          <div key={ch.label} className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all cursor-pointer ${
            ch.active
              ? "bg-primary/[0.06] border-primary/15 text-primary"
              : "bg-muted/[0.04] border-border/8 text-muted-foreground/30"
          }`}>
            {ch.icon}
            <span className="text-[9px] font-semibold">{ch.label}</span>
            <span className={`h-1 w-1 rounded-full ${ch.active ? "bg-accent" : "bg-muted-foreground/15"}`} />
          </div>
        ))}
      </div>
    </div>

    {/* Notification Types */}
    <div className="rounded-2xl border border-border/10 bg-card/50 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/15">
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground/50" />
        </div>
        <h3 className="text-[12px] font-semibold text-foreground">סוגי התראות</h3>
      </div>
      <div className="space-y-2">
        <Toggle label="התראות פוש" sub="ישירות לטלפון בזמן אמת" defaultChecked />
        <Toggle label="סיכום יומי באימייל" sub="סיכום ביצועים כל ערב" defaultChecked />
        <Toggle label="התראות קוליות" sub="המנטור ידבר כשיזהה סיכון גבוה" />
        <Toggle label="לפני אירועי חדשות" sub="30 דקות לפני אירוע כלכלי משמעותי" defaultChecked />
        <Toggle label="עדכוני AI" sub="כשה-AI מזהה דפוס חדש או תובנה חשובה" defaultChecked />
      </div>
    </div>

    <SaveButton />
  </div>
);

/* ===== Shared Components ===== */

const SaveButton = () => (
  <button className="haptic-press w-full flex items-center justify-center gap-2 rounded-xl bg-primary/12 border border-primary/20 py-3 text-[12px] font-bold text-primary hover:bg-primary/20 hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)] transition-all duration-300 min-h-[48px]">
    <Save className="h-4 w-4" />
    שמור שינויים
  </button>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-[10px] md:text-[11px] font-semibold text-muted-foreground/50">{label}</label>
    {children}
  </div>
);

const Input = ({ value, placeholder, type = "text", dir, prefix }: {
  value: string; placeholder: string; type?: string; dir?: string; prefix?: string;
}) => (
  <div className="relative">
    {prefix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground/40">{prefix}</span>}
    <input
      type={type}
      defaultValue={value}
      placeholder={placeholder}
      dir={dir}
      className={`w-full rounded-xl border border-border/10 bg-muted/[0.06] py-2.5 text-[12px] text-foreground placeholder:text-muted-foreground/20 focus:border-primary/25 focus:outline-none focus:ring-1 focus:ring-primary/15 focus:bg-primary/[0.02] transition-all min-h-[44px] ${prefix ? "px-7" : "px-3.5"}`}
    />
  </div>
);

const Select = ({ options, defaultValue }: { options: { value: string; label: string }[]; defaultValue?: string }) => (
  <div className="relative">
    <select
      defaultValue={defaultValue}
      className="w-full appearance-none rounded-xl border border-border/10 bg-muted/[0.06] px-3.5 py-2.5 text-[12px] text-foreground focus:border-primary/25 focus:outline-none focus:ring-1 focus:ring-primary/15 focus:bg-primary/[0.02] transition-all min-h-[44px]"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/30" />
  </div>
);

const Toggle = ({ label, sub, defaultChecked }: { label: string; sub?: string; defaultChecked?: boolean }) => {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200 min-h-[48px] cursor-pointer ${
      on ? "bg-primary/[0.03] border-primary/10 hover:bg-primary/[0.05]" : "bg-muted/[0.03] border-border/8 hover:bg-muted/[0.06]"
    }`} onClick={() => setOn(!on)}>
      <div>
        <p className="text-[11px] md:text-[12px] font-medium text-foreground">{label}</p>
        {sub && <p className="text-[9px] text-muted-foreground/35 mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); setOn(!on); }}
        className={`relative h-6 w-11 rounded-full transition-all duration-300 ${on ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)]" : "bg-muted/30"}`}
      >
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300 ${on ? "right-1" : "right-[22px]"}`} />
      </button>
    </div>
  );
};

export default SettingsPage;
