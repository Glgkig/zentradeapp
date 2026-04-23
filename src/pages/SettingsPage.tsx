import { useState } from "react";
import AvatarPicker, { UserAvatar } from "@/components/AvatarPicker";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  Shield, User, Globe, Lock, ChevronDown, ChevronRight,
  Sparkles, Save, Camera,
  Eye, EyeOff, Palette, Key, Zap, Link2, Plus, Check,
  Sun, Moon, LogOut, Trash2, Settings2, Crown, WifiOff, ArrowUpRight,
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

/* ─────────────────────────────────────────────
   TAB CONFIG — each tab has its own color
───────────────────────────────────────────── */
const tabs = [
  { id: "profile",      label: "פרופיל",        icon: User,      color: "#60a5fa", desc: "זהות, שם וסגנון מסחר" },
  { id: "connectivity", label: "חיבורים",        icon: Link2,     color: "#4ade80", desc: "ברוקרים ו-API" },
  { id: "preferences",  label: "העדפות מסחר",   icon: Settings2, color: "#a78bfa", desc: "סיכון, מטבע ואזור זמן" },
  { id: "appearance",   label: "נראות",          icon: Palette,   color: "#f59e0b", desc: "ערכת צבעים ותצוגה" },
  { id: "security",     label: "מנוי ואבטחה",   icon: Shield,    color: "#f87171", desc: "תוכנית, סיסמה ואבטחה" },
] as const;
type TabId = (typeof tabs)[number]["id"];

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const cur = tabs.find(t => t.id === activeTab)!;

  return (
    <div className="mx-auto max-w-[1100px] p-2 md:p-4 space-y-4">

      {/* ── Page Header ── */}
      <div className="relative rounded-2xl border border-white/[0.06] overflow-hidden px-5 py-4"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(40px)" }}>
        <div className="absolute top-0 inset-x-0 h-[1px]" style={{ background: "linear-gradient(to right, transparent, rgba(96,165,250,0.4), transparent)" }} />
        <div className="absolute top-0 left-0 w-40 h-20 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(96,165,250,0.06), transparent 70%)" }} />
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl shrink-0"
            style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
            <Settings2 className="h-5 w-5" style={{ color: "#60a5fa" }} />
            <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: "0 0 20px rgba(96,165,250,0.15)" }} />
          </div>
          <div>
            <h1 className="text-[17px] font-black text-foreground tracking-tight">מרכז שליטה</h1>
            <p className="text-[11px] text-foreground/35 mt-0.5">
              {cur.desc}
            </p>
          </div>
          <div className="mr-auto hidden md:flex items-center gap-2">
            {tabs.map(t => (
              <div key={t.id} className="h-1.5 w-1.5 rounded-full transition-all duration-300"
                style={{ background: t.id === activeTab ? t.color : "rgba(255,255,255,0.08)", boxShadow: t.id === activeTab ? `0 0 6px ${t.color}` : "none" }} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">

        {/* ── Tab Sidebar ── */}
        <div className="md:w-[220px] shrink-0 space-y-1.5">
          <div className="rounded-2xl border border-white/[0.05] bg-black/40 backdrop-blur-md p-2 space-y-0.5">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 text-right"
                  style={active ? {
                    background: tab.color + "0f",
                    border: `1px solid ${tab.color}20`,
                  } : { border: "1px solid transparent" }}>
                  {/* Active left bar */}
                  {active && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-l-full"
                      style={{ background: tab.color, boxShadow: `0 0 10px ${tab.color}` }} />
                  )}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all"
                    style={active
                      ? { background: tab.color + "20", border: `1px solid ${tab.color}30` }
                      : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <tab.icon className="h-3.5 w-3.5 transition-all"
                      style={{ color: active ? tab.color : "rgba(255,255,255,0.25)" }} />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-[12px] font-semibold leading-none"
                      style={{ color: active ? tab.color : "rgba(255,255,255,0.45)" }}>
                      {tab.label}
                    </p>
                    <p className="text-[9px] mt-0.5 truncate hidden md:block"
                      style={{ color: active ? tab.color + "70" : "rgba(255,255,255,0.18)" }}>
                      {tab.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick usage card */}
          <div className="hidden md:block rounded-2xl border overflow-hidden"
            style={{ borderColor: "rgba(245,158,11,0.15)", background: "rgba(245,158,11,0.03)" }}>
            <div className="h-[1px] w-full" style={{ background: "linear-gradient(to right, transparent, rgba(245,158,11,0.4), transparent)" }} />
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-400" />
                <span className="text-[11px] font-bold text-foreground/80">ZenTrade Pro</span>
              </div>
              {[
                { label: "ברוקרים", val: "2 / 9" },
                { label: "AI תובנות", val: "∞", accent: true },
                { label: "סטאפים", val: "6 / ∞" },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-[9px] text-foreground/30">{row.label}</span>
                  <span className={`text-[9px] font-bold ${row.accent ? "text-amber-400" : "text-foreground/60"}`}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content Area ── */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile"      && <ProfileTab />}
          {activeTab === "connectivity" && <ConnectivityTab />}
          {activeTab === "preferences"  && <PreferencesTab />}
          {activeTab === "appearance"   && <AppearanceTab />}
          {activeTab === "security"     && <SecurityTab />}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SHARED PRIMITIVES
───────────────────────────────────────────── */
const Section = ({ color = "#60a5fa", icon: Icon, title, sub, children }: {
  color?: string; icon: React.ElementType; title: string; sub?: string; children: React.ReactNode;
}) => (
  <div className="rounded-2xl border overflow-hidden"
    style={{ borderColor: color + "18", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(30px)" }}>
    <div className="h-[1.5px] w-full" style={{ background: `linear-gradient(to right, transparent, ${color}50, transparent)` }} />
    <div className="px-5 pt-4 pb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: color + "15", border: `1px solid ${color}25` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-foreground leading-none">{title}</h3>
          {sub && <p className="text-[9px] text-foreground/30 mt-0.5">{sub}</p>}
        </div>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-foreground/35">{label}</label>
    {children}
  </div>
);

const SelectField = ({ options, value, onChange }: {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (v: string) => void;
}) => (
  <div className="relative">
    <select value={value} onChange={e => onChange?.(e.target.value)} className="settings-input appearance-none pr-9">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/20" />
  </div>
);

const Toggle = ({ label, sub, defaultChecked, accent = "#4ade80" }: { label: string; sub?: string; defaultChecked?: boolean; accent?: string }) => {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-center justify-between rounded-xl border px-4 py-3 cursor-pointer transition-all duration-200 min-h-[48px]"
      style={on ? { borderColor: accent + "18", background: accent + "06" } : { borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}
      onClick={() => setOn(!on)}>
      <div>
        <p className="text-[12px] font-medium text-foreground">{label}</p>
        {sub && <p className="text-[9px] text-foreground/30 mt-0.5">{sub}</p>}
      </div>
      <div className={`relative h-6 w-11 rounded-full transition-all duration-300 shrink-0`}
        style={{ background: on ? accent : "rgba(255,255,255,0.08)", boxShadow: on ? `0 0 10px ${accent}50` : "none" }}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300 ${on ? "right-1" : "right-[22px]"}`} />
      </div>
    </div>
  );
};

const SaveButton = ({ onClick, saving }: { onClick?: () => void; saving?: boolean }) => (
  <button onClick={onClick} disabled={saving}
    className="haptic-press w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-[13px] font-bold transition-all duration-300 min-h-[48px] disabled:opacity-50"
    style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.25)", color: "hsl(var(--primary))", boxShadow: "0 0 20px hsl(var(--primary) / 0.05)" }}>
    {saving
      ? <span className="animate-spin h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full" />
      : <Save className="h-4 w-4" />}
    {saving ? "שומר..." : "שמור שינויים"}
  </button>
);

/* ─────────────────────────────────────────────
   PROFILE TAB
───────────────────────────────────────────── */
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
    if (error) toast.error("שגיאה בשמירה");
    else toast.success("הפרופיל עודכן ✓");
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
      {/* Identity card */}
      <Section color="#60a5fa" icon={User} title="זהות הסוחר" sub="שם, תמונה ופרטי חשבון">
        <div className="flex items-start gap-4 mb-5 p-4 rounded-xl"
          style={{ background: "rgba(96,165,250,0.04)", border: "1px solid rgba(96,165,250,0.1)" }}>
          <div className="relative shrink-0">
            <UserAvatar avatarUrl={profile?.avatar_url} userName={name || userName} size="lg"
              className="rounded-2xl border-2 border-blue-400/20" />
            <button onClick={() => setAvatarPickerOpen(true)}
              className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-xl transition-all"
              style={{ background: "#60a5fa", boxShadow: "0 0 12px rgba(96,165,250,0.5)" }}>
              <Camera className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-black text-foreground">{name || userName || "סוחר חדש"}</p>
            <p className="text-[11px] text-foreground/40 mt-0.5 truncate" dir="ltr">{userEmail}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="rounded-lg px-2.5 py-1 text-[9px] font-bold"
                style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa" }}>
                ✦ Pro
              </span>
              <span className="rounded-lg px-2.5 py-1 text-[9px] font-bold"
                style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.15)", color: "#4ade80" }}>
                ✓ מאומת
              </span>
            </div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="שם מלא">
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="השם שלך" className="settings-input" />
          </Field>
          <Field label="אימייל">
            <input type="text" value={userEmail} readOnly dir="ltr" className="settings-input opacity-40 cursor-not-allowed" />
          </Field>
          <Field label="רמת ניסיון">
            <SelectField value={experience} onChange={setExperience} options={[
              { value: "junior",  label: "Junior — מתחיל (0-1 שנה)" },
              { value: "senior",  label: "Senior — מנוסה (1-3 שנים)" },
              { value: "pro",     label: "Pro — מקצועי (3+ שנים)" },
            ]} />
          </Field>
          <Field label="סגנון מסחר">
            <SelectField value={tradingStyle} onChange={setTradingStyle} options={[
              { value: "smc",          label: "SMC — Smart Money Concepts" },
              { value: "ict",          label: "ICT — Inner Circle Trader" },
              { value: "price-action", label: "Price Action" },
              { value: "indicators",   label: "מבוסס אינדיקטורים" },
            ]} />
          </Field>
        </div>
      </Section>

      <SaveButton onClick={handleSave} saving={saving} />
      <AvatarPicker open={avatarPickerOpen} onOpenChange={setAvatarPickerOpen} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   CONNECTIVITY TAB
───────────────────────────────────────────── */
const brokersData = [
  { name: "TradingView",          color: "#2962FF", logo: logoTradingView },
  { name: "TradeLocker",          color: "#00E676", logo: logoTradeLocker },
  { name: "MetaTrader 5",         color: "#4A90D9", logo: logoMt5 },
  { name: "Binance",              color: "#F0B90B", logo: logoBinance },
  { name: "TopstepX",             color: "#1DB954", logo: logoTopstep },
  { name: "Rithmic",              color: "#FF6B35", logo: logoRithmic },
  { name: "NinjaTrader",          color: "#E84E0F", logo: logoNinjaTrader },
  { name: "Interactive Brokers",  color: "#DC143C", logo: logoIbkr },
  { name: "Forex.com",            color: "#0891B2", logo: logoForex },
];

const ConnectivityTab = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const hasKey = apiKey.length > 10;

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">

      {/* Status bar */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.12)" }}>
        <div className="h-2 w-2 rounded-full bg-[#4ade80] animate-pulse" style={{ boxShadow: "0 0 6px #4ade80" }} />
        <p className="text-[11px] text-foreground/60">
          <span className="font-bold text-[#4ade80]">0 ברוקרים מחוברים</span>
          <span className="mx-2 text-foreground/20">·</span>
          חבר ברוקר אחד כדי להתחיל לייבא עסקאות אוטומטית
        </p>
      </div>

      {/* Broker grid */}
      <Section color="#4ade80" icon={Link2} title="פלטפורמות מסחר" sub="חבר עד 9 ברוקרים שונים">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {brokersData.map((broker) => (
            <div key={broker.name}
              className="group flex items-center gap-3 rounded-xl border px-3 py-3 transition-all hover:border-white/[0.1] cursor-pointer"
              style={{ background: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border overflow-hidden"
                style={{ background: broker.color + "22", borderColor: broker.color + "30" }}>
                <img src={broker.logo} alt={broker.name} className="h-7 w-7 object-contain" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground/80 truncate">{broker.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <WifiOff className="h-2.5 w-2.5 text-foreground/20" />
                  <p className="text-[9px] text-foreground/25">לא מחובר</p>
                </div>
              </div>
              <button className="haptic-press shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[9px] font-bold transition-all opacity-0 group-hover:opacity-100"
                style={{ background: "#4ade8015", border: "1px solid #4ade8025", color: "#4ade80" }}
                onClick={() => toast.info(`חיבור ל-${broker.name} בקרוב`)}>
                <Plus className="h-2.5 w-2.5" />
                חבר
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* API Key */}
      <Section color="#60a5fa" icon={Key} title="מפתחות API" sub="גישה לשירותים חיצוניים">
        <div className="rounded-xl border p-4 space-y-3"
          style={{ borderColor: hasKey ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-foreground/80">FAL API Key</span>
              <span className="rounded-full px-2 py-0.5 text-[8px] font-bold flex items-center gap-1"
                style={hasKey
                  ? { background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }
                  : { background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                <span className={`h-1.5 w-1.5 rounded-full ${hasKey ? "bg-[#4ade80] animate-pulse" : "bg-[#f87171]"}`} />
                {hasKey ? "מחובר" : "לא מחובר"}
              </span>
            </div>
            <button onClick={() => setShowApiKey(!showApiKey)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border transition-all"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>
              {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <input type={showApiKey ? "text" : "password"} value={apiKey} onChange={e => setApiKey(e.target.value)}
            placeholder="הכנס מפתח API..." dir="ltr" className="settings-input font-mono text-[11px]" />
          <p className="text-[9px] text-foreground/20">משמש לזיהוי קולי ותמלול אוטומטי של עסקאות</p>
        </div>
      </Section>
    </div>
  );
};

/* ─────────────────────────────────────────────
   PREFERENCES TAB
───────────────────────────────────────────── */
const PreferencesTab = () => {
  const [riskPct, setRiskPct] = useState(1);
  const [currency, setCurrency] = useState("usd");
  const [timezone, setTimezone] = useState("asia_jerusalem");

  const riskLevel = riskPct <= 1 ? { label: "שמרן", color: "#4ade80" }
    : riskPct <= 2 ? { label: "מאוזן", color: "#fbbf24" }
    : riskPct <= 3.5 ? { label: "אגרסיבי", color: "#f97316" }
    : { label: "מסוכן", color: "#f87171" };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">

      {/* Risk */}
      <Section color="#a78bfa" icon={Sparkles} title="ניהול סיכונים" sub="סיכון ברירת מחדל לכל עסקה">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-foreground/50">סיכון ברירת מחדל לעסקה</span>
            <div className="flex items-center gap-2">
              <span className="rounded-lg px-3 py-1 text-[14px] font-black font-mono"
                style={{ background: riskLevel.color + "15", color: riskLevel.color, border: `1px solid ${riskLevel.color}25` }}>
                {riskPct}%
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: riskLevel.color + "12", color: riskLevel.color }}>
                {riskLevel.label}
              </span>
            </div>
          </div>

          {/* Colored track slider */}
          <div className="relative">
            <input type="range" min={0.25} max={5} step={0.25} value={riskPct}
              onChange={e => setRiskPct(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: riskLevel.color }} />
            <div className="flex justify-between text-[8px] text-foreground/20 mt-1.5 font-mono">
              <span>0.25% — שמרן</span>
              <span>2.5%</span>
              <span>5% — מסוכן</span>
            </div>
          </div>

          {/* Risk segments visualization */}
          <div className="flex gap-1 h-1.5">
            {[...Array(20)].map((_, i) => {
              const segVal = (i + 1) * 0.25;
              const filled = segVal <= riskPct;
              const color = segVal <= 1 ? "#4ade80" : segVal <= 2 ? "#fbbf24" : segVal <= 3.5 ? "#f97316" : "#f87171";
              return (
                <div key={i} className="flex-1 rounded-full transition-all duration-200"
                  style={{ background: filled ? color : "rgba(255,255,255,0.05)", boxShadow: filled ? `0 0 4px ${color}60` : "none" }} />
              );
            })}
          </div>
        </div>
      </Section>

      {/* Currency & TZ */}
      <Section color="#60a5fa" icon={Globe} title="מטבע ואזור זמן" sub="הגדרות תצוגה עולמיות">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="מטבע תצוגה">
            <div className="flex gap-2">
              {[{ value: "usd", label: "$ דולר", flag: "🇺🇸" }, { value: "ils", label: "₪ שקל", flag: "🇮🇱" }].map(c => (
                <button key={c.value} onClick={() => setCurrency(c.value)}
                  className="haptic-press flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 text-[11px] font-semibold transition-all min-h-[44px]"
                  style={currency === c.value
                    ? { background: "rgba(96,165,250,0.1)", borderColor: "rgba(96,165,250,0.25)", color: "#60a5fa" }
                    : { background: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
                  <span>{c.flag}</span>{c.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="אזור זמן מסחר">
            <SelectField value={timezone} onChange={setTimezone} options={[
              { value: "asia_jerusalem",   label: "🇮🇱 ירושלים (GMT+3)" },
              { value: "america_new_york", label: "🇺🇸 ניו יורק (GMT-4)" },
              { value: "europe_london",    label: "🇬🇧 לונדון (GMT+1)" },
              { value: "asia_tokyo",       label: "🇯🇵 טוקיו (GMT+9)" },
            ]} />
          </Field>
        </div>
      </Section>

      {/* Data Sync */}
      <Section color="#4ade80" icon={Sparkles} title="נתונים וסנכרון" sub="ניהול שמירה ועדכונים">
        <div className="space-y-2">
          <Toggle label="סנכרון אוטומטי" sub="עדכון נתונים כל 5 שניות" defaultChecked accent="#4ade80" />
          <Toggle label="שמירת היסטוריה" sub="שמור את כל העסקאות בענן" defaultChecked accent="#60a5fa" />
          <Toggle label="התראות Push" sub="קבל התראות על עסקאות חדשות" accent="#a78bfa" />
        </div>
      </Section>

      <SaveButton />
    </div>
  );
};

/* ─────────────────────────────────────────────
   APPEARANCE TAB
───────────────────────────────────────────── */
const AppearanceTab = () => {
  const [accentColor, setAccentColor] = useState("cyan");

  const accents = [
    { id: "cyan",   label: "Neon Cyan",       hex: "#00d4aa", glow: "rgba(0,212,170,0.3)" },
    { id: "blue",   label: "Electric Blue",    hex: "#3b82f6", glow: "rgba(59,130,246,0.3)" },
    { id: "purple", label: "Deep Purple",      hex: "#a78bfa", glow: "rgba(167,139,250,0.3)" },
    { id: "gold",   label: "Matte Gold",       hex: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
    { id: "red",    label: "Crimson Red",      hex: "#f87171", glow: "rgba(248,113,113,0.3)" },
    { id: "white",  label: "Pure White",       hex: "#e5e7eb", glow: "rgba(229,231,235,0.3)" },
  ];

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">

      {/* Theme */}
      <Section color="#f59e0b" icon={Palette} title="מצב תצוגה" sub="בחר בין Dark ל-Light Mode">
        <div className="grid grid-cols-2 gap-3">
          {/* Dark (active) */}
          <button className="relative flex flex-col items-center gap-2 rounded-xl border py-5 overflow-hidden transition-all"
            style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)", boxShadow: "0 0 20px rgba(245,158,11,0.05)" }}>
            <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full"
              style={{ background: "#f59e0b", boxShadow: "0 0 8px rgba(245,158,11,0.5)" }}>
              <Check className="h-2.5 w-2.5 text-black" />
            </div>
            <div className="w-16 h-10 rounded-lg bg-[#06060f] border border-white/[0.12] flex items-center justify-center">
              <Moon className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-[11px] font-bold text-amber-400">Dark Mode</span>
            <span className="text-[8px] text-foreground/30">פעיל</span>
          </button>
          {/* Light (coming soon) */}
          <button onClick={() => toast.info("Light Mode יהיה זמין בקרוב ☀️")}
            className="flex flex-col items-center gap-2 rounded-xl border py-5 transition-all hover:border-white/[0.1] opacity-50 cursor-not-allowed"
            style={{ background: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="w-16 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <Sun className="h-4 w-4 text-yellow-500" />
            </div>
            <span className="text-[11px] font-semibold text-foreground/40">Light Mode</span>
            <span className="text-[8px] rounded-md bg-white/[0.05] px-2 py-0.5 text-foreground/20 border border-white/[0.06]">בקרוב</span>
          </button>
        </div>
      </Section>

      {/* Accent Color */}
      <Section color="#a78bfa" icon={Sparkles} title="צבע דגש" sub="הצבע המוביל של הממשק שלך">
        <div className="grid grid-cols-3 gap-2.5">
          {accents.map(a => (
            <button key={a.id} onClick={() => { setAccentColor(a.id); toast.success(`צבע שונה ל-${a.label}`); }}
              className="relative flex flex-col items-center gap-2 rounded-xl border py-4 transition-all"
              style={accentColor === a.id
                ? { borderColor: a.hex + "40", background: a.hex + "0c", boxShadow: `0 0 16px ${a.hex}15` }
                : { borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
              {accentColor === a.id && (
                <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full"
                  style={{ background: a.hex, boxShadow: `0 0 8px ${a.glow}` }}>
                  <Check className="h-2.5 w-2.5 text-black" />
                </div>
              )}
              <div className="h-9 w-9 rounded-full shadow-lg transition-all"
                style={{ background: a.hex, boxShadow: accentColor === a.id ? `0 0 20px ${a.glow}` : "none" }} />
              <span className="text-[9px] font-semibold text-foreground/50">{a.label}</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SECURITY TAB
───────────────────────────────────────────── */
const SecurityTab = () => {
  const { signOut } = useAuth();
  const { isPro, openCustomerPortal } = useSubscription();

  const proFeatures = [
    "AI Mentor — ניתוח פסיכולוגי",
    "Kill Switch — הגנת הון מלאה",
    "Super Cards — כרטיסי עסקה",
    "ייבוא אוטומטי מ-9 ברוקרים",
    "ייצוא PDF לרואה חשבון",
    "אין הגבלה על עסקאות",
  ];

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">

      {/* Plan */}
      <Section color={isPro ? "#f59e0b" : "#60a5fa"} icon={Crown} title="תוכנית מנוי" sub="פרטי החבילה הפעילה">
        <div className="rounded-xl border p-4 mb-4"
          style={isPro
            ? { borderColor: "rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.05)" }
            : { borderColor: "rgba(96,165,250,0.15)", background: "rgba(96,165,250,0.03)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={isPro ? { background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)" } : { background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
                {isPro ? <Crown className="h-5 w-5 text-amber-400" /> : <Zap className="h-5 w-5 text-blue-400" />}
              </div>
              <div>
                <p className="text-[14px] font-black text-foreground">{isPro ? "ZenTrade Pro" : "ZenTrade Lite"}</p>
                <p className="text-[9px] text-foreground/35 mt-0.5">{isPro ? "כל הפיצ׳רים · ללא הגבלת AI" : "גישה בסיסית בלבד"}</p>
              </div>
            </div>
            {isPro
              ? <button onClick={openCustomerPortal}
                  className="haptic-press flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition-all"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
                  <ArrowUpRight className="h-3 w-3" />
                  נהל מנוי
                </button>
              : <button onClick={() => window.location.href = "/pricing"}
                  className="haptic-press flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition-all"
                  style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b" }}>
                  <Crown className="h-3 w-3" />
                  שדרג ל-Pro
                </button>
            }
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {proFeatures.map(f => (
              <div key={f} className="flex items-center gap-1.5">
                <Check className="h-3 w-3 shrink-0" style={{ color: isPro ? "#f59e0b" : "rgba(255,255,255,0.15)" }} />
                <span className="text-[10px]" style={{ color: isPro ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Security */}
      <Section color="#f87171" icon={Lock} title="אבטחת חשבון" sub="סיסמה ואימות דו-שלבי">
        <div className="space-y-2">
          <ActionRow icon={Lock} label="שנה סיסמה" sub="מומלץ לשנות כל 3 חודשים"
            onClick={() => toast.info("שינוי סיסמה יהיה זמין בקרוב")} />
          <ActionRow icon={Shield} label="אימות דו-שלבי (2FA)" sub="מוסיף שכבת אבטחה נוספת"
            badge="כבוי" badgeColor="#f87171"
            onClick={() => toast.info("2FA יהיה זמין בקרוב")} />
        </div>
      </Section>

      {/* Danger */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(248,113,113,0.15)", background: "rgba(248,113,113,0.03)" }}>
        <div className="h-[1.5px] w-full" style={{ background: "linear-gradient(to right, transparent, rgba(248,113,113,0.4), transparent)" }} />
        <div className="px-5 pt-4 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.2)" }}>
              <Shield className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-foreground">אזור מסוכן</h3>
              <p className="text-[9px] text-foreground/30">פעולות בלתי הפיכות</p>
            </div>
          </div>
          <div className="space-y-2">
            <button onClick={signOut}
              className="haptic-press flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-right transition-all hover:bg-white/[0.03] min-h-[48px]"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
              <LogOut className="h-4 w-4 text-foreground/35" />
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-foreground/70">יציאה מהמערכת</p>
                <p className="text-[9px] text-foreground/25">תצא מכל המכשירים</p>
              </div>
            </button>
            <button className="haptic-press flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-right transition-all hover:bg-red-500/[0.06] min-h-[48px]"
              style={{ borderColor: "rgba(248,113,113,0.12)", background: "rgba(248,113,113,0.03)" }}
              onClick={() => toast.error("פנה לתמיכה למחיקת חשבון")}>
              <Trash2 className="h-4 w-4 text-red-400/60" />
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-red-400/70">מחיקת חשבון</p>
                <p className="text-[9px] text-red-400/30">פעולה בלתי הפיכה — כל הנתונים יימחקו</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   ACTION ROW
───────────────────────────────────────────── */
const ActionRow = ({ icon: Icon, label, sub, badge, badgeColor = "#60a5fa", onClick }: {
  icon: React.ElementType; label: string; sub: string; badge?: string; badgeColor?: string; onClick?: () => void;
}) => (
  <button onClick={onClick}
    className="haptic-press flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-all hover:bg-white/[0.03] group min-h-[48px]"
    style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <Icon className="h-3.5 w-3.5 text-foreground/35 group-hover:text-foreground/60 transition-colors" />
      </div>
      <div className="text-right">
        <p className="text-[12px] font-semibold text-foreground/80">{label}</p>
        <p className="text-[9px] text-foreground/25 mt-0.5">{sub}</p>
      </div>
    </div>
    {badge
      ? <span className="rounded-full px-2.5 py-0.5 text-[9px] font-bold"
          style={{ background: badgeColor + "15", color: badgeColor, border: `1px solid ${badgeColor}25` }}>
          {badge}
        </span>
      : <ChevronRight className="h-3.5 w-3.5 text-foreground/15 rotate-180 group-hover:text-foreground/35 transition-colors" />
    }
  </button>
);

export default SettingsPage;
