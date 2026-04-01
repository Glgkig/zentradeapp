import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Bot, ShieldCheck,
  LogOut, ChevronDown, Plug, Menu, X, Settings, Sun, Moon, Zap,
  Crosshair, PieChart, History, CheckCircle2, Flame, Eye, Crown, Star, Sparkles,
} from "lucide-react";
import SettingsPage from "@/pages/SettingsPage";
import SetupsPage from "@/pages/SetupsPage";
import StatsPage from "@/pages/StatsPage";
import JournalPage from "@/pages/JournalPage";
import MentorPage from "@/pages/MentorPage";
import HomeDashboard from "@/components/dashboard/HomeDashboard";
import OnboardingModal from "@/components/dashboard/OnboardingModal";
import BacktestingPage from "@/pages/BacktestingPage";
import ProtectionPage from "@/pages/ProtectionPage";

/* ===== Nav Config ===== */
const navItems = [
  { id: "dashboard", label: "דשבורד ראשי", icon: LayoutDashboard },
  { id: "setups", label: "הסטאפים שלי", icon: Crosshair },
  { id: "journal", label: "יומן מסחר", icon: BookOpen },
  { id: "stats", label: "סטטיסטיקות", icon: PieChart },
  { id: "mentor", label: "מנטור AI", icon: Bot },
  { id: "backtesting", label: "בקטסטינג", icon: History },
  { id: "protection", label: "הגדרות הגנה", icon: ShieldCheck },
  { id: "settings", label: "הגדרות", icon: Settings },
];

/* Bottom tab bar items — only the most critical 5 */
const bottomTabs = [
  { id: "dashboard", label: "דשבורד", icon: LayoutDashboard },
  { id: "journal", label: "יומן", icon: BookOpen },
  { id: "mentor", label: "מנטור", icon: Bot },
  { id: "protection", label: "הגנה", icon: ShieldCheck },
  { id: "more", label: "עוד", icon: Menu },
];

const brokers = [
  { name: "TradingView", initials: "TV", connected: false, account: null },
  { name: "TradeLocker", initials: "TL", connected: true, account: "TL-7842" },
  { name: "MetaTrader 5", initials: "M5", connected: false, account: null },
  { name: "Binance", initials: "BN", connected: true, account: "BN-3291" },
  { name: "TopstepX", initials: "TX", connected: false, account: null },
  { name: "Rithmic", initials: "RI", connected: false, account: null },
  { name: "NinjaTrader", initials: "NT", connected: false, account: null },
  { name: "Interactive Brokers", initials: "IB", connected: false, account: null },
  { name: "Forex.com", initials: "FX", connected: false, account: null },
];

/* ===== Layout ===== */
const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreSheet, setMoreSheet] = useState(false);
  const [brokerModal, setBrokerModal] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem("zentrade-onboarded") !== "true";
  });
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("zentrade-theme") !== "light";
    }
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("light", !dark);
    localStorage.setItem("zentrade-theme", dark ? "dark" : "light");
  }, [dark]);

  const completeOnboarding = () => {
    localStorage.setItem("zentrade-onboarded", "true");
    setShowOnboarding(false);
  };

  const handleNav = (id: string) => {
    if (id === "more") {
      setMoreSheet(true);
      return;
    }
    setActiveNav(id);
    setSidebarOpen(false);
    setMoreSheet(false);
  };

  const renderContent = () => {
    if (activeNav === "dashboard") return <HomeDashboard userName="יהונתן" />;
    if (activeNav === "setups") return <SetupsPage />;
    if (activeNav === "stats") return <StatsPage />;
    if (activeNav === "journal") return <JournalPage />;
    if (activeNav === "settings") return <SettingsPage />;
    if (activeNav === "mentor") return <MentorPage />;
    if (activeNav === "backtesting") return <BacktestingPage />;
    if (activeNav === "protection") return <ProtectionPage />;
    return children || (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <LayoutDashboard className="h-8 w-8 text-primary/60" />
          </div>
          <p className="font-heading text-lg font-semibold text-foreground/60">
            {navItems.find((n) => n.id === activeNav)?.label}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">התוכן ייבנה בשלב הבא</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden relative" dir="rtl">
      {/* Dynamic Ambient Background */}
      <div className="ambient-bg" />

      {/* ===== Desktop Sidebar (hidden on mobile) ===== */}
      <aside className={`hidden md:flex h-full w-[260px] flex-col border-l border-border/10 bg-sidebar/90 backdrop-blur-2xl shrink-0 relative z-10 ${zenMode ? "zen-hidden" : "zen-visible"}`}>
        {/* Brand */}
        <div className="flex items-center px-5 py-5 border-b border-border/8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-[-2px] rounded-xl bg-primary/8 ai-breathe" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 border border-primary/20">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <span className="font-heading text-[15px] font-bold text-foreground tracking-tight block">ZenTrade</span>
              <span className="text-[8px] text-muted-foreground/30 font-medium">Trading Psychology AI</span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto scrollbar-none">
          <p className="text-[8px] font-semibold text-muted-foreground/25 uppercase tracking-[0.1em] px-3.5 mb-2">ראשי</p>
          {navItems.slice(0, 4).map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`haptic-press group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary/10 text-primary border border-primary/12"
                    : "text-muted-foreground/60 hover:bg-muted/15 hover:text-foreground border border-transparent"
                }`}
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                  active ? "bg-primary/15" : "bg-muted/10 group-hover:bg-muted/20"
                }`}>
                  <item.icon className={`h-3.5 w-3.5 transition-colors ${active ? "text-primary" : "text-muted-foreground/40 group-hover:text-foreground/70"}`} />
                </div>
                <span className="flex-1 text-right">{item.label}</span>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(217_72%_53%/0.6)]" />}
              </button>
            );
          })}

          <p className="text-[8px] font-semibold text-muted-foreground/25 uppercase tracking-[0.1em] px-3.5 mt-4 mb-2">כלים</p>
          {navItems.slice(4).map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`haptic-press group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary/10 text-primary border border-primary/12"
                    : "text-muted-foreground/60 hover:bg-muted/15 hover:text-foreground border border-transparent"
                }`}
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                  active ? "bg-primary/15" : "bg-muted/10 group-hover:bg-muted/20"
                }`}>
                  <item.icon className={`h-3.5 w-3.5 transition-colors ${active ? "text-primary" : "text-muted-foreground/40 group-hover:text-foreground/70"}`} />
                </div>
                <span className="flex-1 text-right">{item.label}</span>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(217_72%_53%/0.6)]" />}
              </button>
            );
          })}

          {/* Broker Connect */}
          <div className="pt-3 mt-3 border-t border-border/8">
            <button
              onClick={() => setBrokerModal(true)}
              className="haptic-press group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-muted-foreground/60 transition-all duration-200 hover:bg-primary/8 hover:text-primary border border-transparent"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/10 group-hover:bg-primary/10 transition-colors">
                <Plug className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
              <span className="flex-1 text-right">חבר ברוקר</span>
              <span className="rounded-md bg-accent/10 border border-accent/12 px-1.5 py-0.5 text-[8px] font-bold text-accent">2</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border/8 px-3 py-3">
          <button
            onClick={() => navigate("/")}
            className="haptic-press flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-muted-foreground/40 transition-all hover:bg-destructive/8 hover:text-destructive"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/10 hover:bg-destructive/10 transition-colors">
              <LogOut className="h-3.5 w-3.5" />
            </div>
            התנתק
          </button>
        </div>
      </aside>

      {/* ===== Main Area ===== */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        {/* Top Header */}
        <header className={`flex items-center justify-between glass-header px-3 py-2 md:px-6 md:py-3 shrink-0 relative z-50 ${zenMode ? "zen-hidden" : "zen-visible"}`}>
          <div className="flex items-center gap-2">
            {/* Mobile brand */}
            <div className="flex md:hidden items-center gap-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-heading text-[13px] font-bold text-foreground">ZenTrade</span>
            </div>
            <h1 className="hidden md:block font-heading text-sm font-semibold text-foreground md:text-base">
              {navItems.find((n) => n.id === activeNav)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Discipline Streak Badge — hidden on very small */}
            <div className="hidden sm:flex group relative">
              <div className="streak-badge flex items-center gap-1 rounded-full border border-orange-500/25 bg-orange-500/8 px-2 md:px-3 py-1 md:py-1.5 cursor-default">
                <Flame className="h-3 w-3 text-orange-400" />
                <span className="text-[10px] md:text-[11px] font-bold text-orange-400">5 ימים</span>
              </div>
              <div className="absolute top-full mt-2 right-0 w-56 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-[80]">
                <div className="rounded-xl border border-border/30 bg-secondary/95 backdrop-blur-xl p-3 shadow-2xl">
                  <p className="text-[10px] font-semibold text-foreground mb-1">🔥 רצף משמעת</p>
                  <p className="text-[9px] text-muted-foreground leading-relaxed">5 ימים רצופים ללא הפרת חוקי הברזל. אתה פועל כמו צלף.</p>
                </div>
              </div>
            </div>

            {/* AI Status — hidden on mobile */}
            <div className="hidden md:flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="text-[11px] font-medium text-accent">AI פעיל</span>
            </div>

            {/* Upgrade Button — icon only on mobile */}
            <button
              onClick={() => setUpgradeModal(true)}
              className="haptic-press flex items-center gap-1.5 rounded-full bg-gradient-to-l from-primary via-primary to-ring px-2.5 py-1.5 md:px-3.5 text-[10px] md:text-[11px] font-bold text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300 hover:shadow-[0_0_28px_hsl(var(--primary)/0.5)] hover:scale-[1.03]"
            >
              <Crown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">שדרוג</span>
            </button>

            {/* Zen Mode Toggle */}
            <button
              onClick={() => setZenMode(!zenMode)}
              className={`haptic-press flex h-9 w-9 md:h-9 md:w-9 items-center justify-center rounded-xl border transition-all duration-300 ${
                zenMode
                  ? "border-primary/40 bg-primary/15 text-primary shadow-[0_0_16px_hsl(var(--primary)/0.2)]"
                  : "border-border/20 bg-muted/15 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20"
              }`}
              title={zenMode ? "צא ממצב פוקוס" : "מצב פוקוס"}
            >
              <Eye className="h-4 w-4" />
            </button>

            {/* Theme */}
            <button
              onClick={() => setDark(!dark)}
              className="interactive-btn flex h-9 w-9 md:h-9 md:w-9 items-center justify-center rounded-xl border border-border/20 bg-muted/15 text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
              title={dark ? "מצב בהיר" : "מצב כהה"}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* User */}
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-1.5 md:gap-2 rounded-xl border border-border bg-muted/20 px-1.5 py-1 md:px-3 md:py-1.5 transition-all hover:bg-muted/40"
              >
                <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg bg-primary/15 text-[10px] md:text-xs font-bold text-primary">
                  י
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-xs font-semibold text-foreground leading-none">יהונתן</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">חשבון Pro</p>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground hidden md:block transition-transform duration-200 ${userMenu ? "rotate-180" : ""}`} />
              </button>

              {userMenu && (
                <>
                  <div className="fixed inset-0 z-[60] bg-background/60 md:bg-transparent" onClick={() => setUserMenu(false)} />
                  <div className="hidden md:block absolute left-0 md:left-auto md:right-0 top-full mt-2 w-56 z-[70] rounded-2xl border border-border/30 bg-secondary shadow-2xl shadow-background/60 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <UserMenuContent
                      onClose={() => setUserMenu(false)}
                      onSettings={() => { setUserMenu(false); setActiveNav("settings"); }}
                      onLogout={() => { setUserMenu(false); navigate("/"); }}
                    />
                  </div>
                  <div className="md:hidden fixed inset-x-0 bottom-0 z-[70] rounded-t-3xl border-t border-border/20 bg-secondary animate-in slide-in-from-bottom duration-300 overflow-hidden">
                    <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-muted-foreground/15" /></div>
                    <UserMenuContent
                      onClose={() => setUserMenu(false)}
                      onSettings={() => { setUserMenu(false); setActiveNav("settings"); }}
                      onLogout={() => { setUserMenu(false); navigate("/"); }}
                    />
                    <div className="px-4 pb-6 pt-1">
                      <button onClick={() => setUserMenu(false)} className="w-full rounded-2xl bg-muted/15 border border-border/15 py-3.5 text-[12px] font-bold text-muted-foreground/60">
                        סגור
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background p-3 pb-20 md:p-6 md:pb-6 relative">
          {renderContent()}
          {/* Zen Mode exit floating button */}
          {zenMode && (
            <button
              onClick={() => setZenMode(false)}
              className="fixed bottom-6 left-6 z-[80] flex items-center gap-2 rounded-full border border-primary/30 bg-secondary/95 backdrop-blur-xl px-4 py-2.5 shadow-2xl transition-all duration-300 hover:bg-primary/15 hover:border-primary/40 haptic-press animate-in fade-in slide-in-from-bottom-4"
            >
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-semibold text-foreground">צא ממצב פוקוס</span>
            </button>
          )}
        </main>
      </div>

      {/* ===== Mobile Bottom Tab Bar ===== */}
      <nav className={`md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border/15 bg-sidebar/90 backdrop-blur-2xl ${zenMode ? "zen-hidden" : "zen-visible"}`}>
        <div className="flex items-center justify-around px-1 pt-1.5 pb-[env(safe-area-inset-bottom,8px)]">
          {bottomTabs.map((tab) => {
            const active = tab.id !== "more" && activeNav === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNav(tab.id)}
                className={`interactive-btn flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[56px] rounded-xl transition-all duration-200 ${
                  active ? "text-primary" : "text-muted-foreground/40"
                }`}
              >
                <tab.icon className={`h-5 w-5 ${active ? "text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]" : ""}`} />
                <span className={`text-[9px] font-semibold ${active ? "text-primary" : ""}`}>{tab.label}</span>
                {active && <span className="h-0.5 w-4 rounded-full bg-primary mt-0.5" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ===== "More" Bottom Sheet (mobile) ===== */}
      {moreSheet && (
        <>
          <div className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm md:hidden" onClick={() => setMoreSheet(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 md:hidden rounded-t-3xl border-t border-border/20 bg-secondary/98 backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full bg-muted-foreground/15" /></div>
            <div className="px-4 pb-8 space-y-1">
              {navItems.filter(n => !bottomTabs.some(t => t.id === n.id)).map((item) => {
                const active = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all min-h-[48px] ${
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/20"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
              {/* Broker connect */}
              <button
                onClick={() => { setMoreSheet(false); setBrokerModal(true); }}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-muted-foreground min-h-[48px] hover:bg-muted/20"
              >
                <Plug className="h-5 w-5" />
                חבר ברוקר
                <span className="mr-auto rounded bg-accent/15 px-1.5 py-0.5 text-[8px] font-bold text-accent">2</span>
              </button>
              {/* Logout */}
              <button
                onClick={() => { setMoreSheet(false); navigate("/"); }}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-destructive/60 min-h-[48px] hover:bg-destructive/8"
              >
                <LogOut className="h-5 w-5" />
                התנתק
              </button>
            </div>
          </div>
        </>
      )}

      {/* ===== Broker Modal — Bottom sheet on mobile, modal on desktop ===== */}
      {brokerModal && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setBrokerModal(false)}
          />
          {/* Desktop centered modal */}
          <div className="hidden md:flex fixed inset-0 z-[61] items-center justify-center p-4">
            <BrokerModalContent onClose={() => setBrokerModal(false)} />
          </div>
          {/* Mobile bottom sheet */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[61] max-h-[85vh] rounded-t-3xl border-t border-border/20 bg-secondary/98 backdrop-blur-xl animate-in slide-in-from-bottom duration-300 overflow-y-auto">
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-muted-foreground/15" /></div>
            <BrokerModalContent onClose={() => setBrokerModal(false)} mobile />
          </div>
        </>
      )}

      {/* ===== Upgrade Modal ===== */}
      {upgradeModal && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setUpgradeModal(false)} />
          
          {/* Desktop */}
          <div className="hidden md:flex fixed inset-0 z-[61] items-center justify-center p-4">
            <UpgradeModalContent onClose={() => setUpgradeModal(false)} />
          </div>
          {/* Mobile */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[61] max-h-[90vh] rounded-t-3xl border-t border-border/20 bg-card/98 backdrop-blur-xl animate-in slide-in-from-bottom duration-300 overflow-y-auto">
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-muted-foreground/15" /></div>
            <UpgradeModalContent onClose={() => setUpgradeModal(false)} mobile />
          </div>
        </>
      )}

      {showOnboarding && (
        <OnboardingModal userName="יהונתן" onComplete={completeOnboarding} />
      )}
    </div>
  );
};

/* ===== User Menu Content (shared between dropdown & bottom sheet) ===== */
const UserMenuContent = ({ onClose, onSettings, onLogout }: { onClose: () => void; onSettings: () => void; onLogout: () => void }) => (
  <>
    <div className="px-4 py-3.5 border-b border-border/15">
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 md:h-9 md:w-9 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary">י</div>
        <div>
          <p className="text-[13px] md:text-[12px] font-bold text-foreground">יהונתן</p>
          <p className="text-[10px] md:text-[9px] text-muted-foreground/50">yonatan@email.com</p>
        </div>
      </div>
    </div>
    <div className="px-4 py-2.5 border-b border-border/15">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/50">תוכנית נוכחית</span>
        <span className="rounded-md bg-primary/10 border border-primary/15 px-2 py-0.5 text-[9px] font-bold text-primary">Pro</span>
      </div>
    </div>
    <div className="py-1.5">
      <button onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 md:py-2.5 text-right hover:bg-primary/8 transition-colors min-h-[48px] md:min-h-0">
        <div className="flex h-8 w-8 md:h-7 md:w-7 items-center justify-center rounded-lg bg-accent/8 border border-accent/10">
          <Zap className="h-3.5 w-3.5 md:h-3 md:w-3 text-accent" />
        </div>
        <div>
          <p className="text-[12px] md:text-[11px] font-semibold text-foreground/80">שדרג חשבון</p>
          <p className="text-[9px] md:text-[8px] text-muted-foreground/35">עבור לתוכנית Premium</p>
        </div>
      </button>
      <button onClick={onSettings} className="w-full flex items-center gap-3 px-4 py-3 md:py-2.5 text-right hover:bg-muted/15 transition-colors min-h-[48px] md:min-h-0">
        <div className="flex h-8 w-8 md:h-7 md:w-7 items-center justify-center rounded-lg bg-muted/15 border border-border/10">
          <Settings className="h-3.5 w-3.5 md:h-3 md:w-3 text-muted-foreground/50" />
        </div>
        <div>
          <p className="text-[12px] md:text-[11px] font-semibold text-foreground/80">הגדרות</p>
          <p className="text-[9px] md:text-[8px] text-muted-foreground/35">ניהול חשבון ופרופיל</p>
        </div>
      </button>
      <div className="mx-4 my-1 border-t border-border/10" />
      <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 md:py-2.5 text-right hover:bg-destructive/8 transition-colors min-h-[48px] md:min-h-0">
        <div className="flex h-8 w-8 md:h-7 md:w-7 items-center justify-center rounded-lg bg-destructive/8 border border-destructive/10">
          <LogOut className="h-3.5 w-3.5 md:h-3 md:w-3 text-destructive/60" />
        </div>
        <p className="text-[12px] md:text-[11px] font-semibold text-destructive/70">התנתק</p>
      </button>
    </div>
  </>
);

/* ===== Broker Modal Content (shared between modal & bottom sheet) ===== */
const BrokerModalContent = ({ onClose, mobile }: { onClose: () => void; mobile?: boolean }) => {
  const connected = brokers.filter(b => b.connected);
  const disconnected = brokers.filter(b => !b.connected);

  return (
    <div className={mobile ? "" : "w-full max-w-md rounded-3xl border border-border/30 bg-card shadow-[0_30px_80px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-4 duration-400 overflow-hidden"}>

      {/* Header */}
      <div className="relative px-6 pt-6 pb-5">
        {!mobile && <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-[-3px] rounded-2xl bg-primary/8 ai-breathe" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15">
                <Plug className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-foreground">חיבורי ברוקר</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">נהל את פלטפורמות המסחר שלך</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="haptic-press flex h-9 w-9 items-center justify-center rounded-xl border border-border/20 bg-muted/10 text-muted-foreground/50 hover:text-foreground hover:bg-muted/25 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 rounded-xl bg-accent/[0.06] border border-accent/12 px-3 py-2 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">מחוברות</span>
            <span className="text-[12px] font-bold text-accent">{connected.length}</span>
          </div>
          <div className="flex-1 rounded-xl bg-muted/10 border border-border/12 px-3 py-2 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">ממתינות</span>
            <span className="text-[12px] font-bold text-muted-foreground">{disconnected.length}</span>
          </div>
        </div>
      </div>

      {/* Connected brokers */}
      {connected.length > 0 && (
        <div className="px-6 pb-3">
          <p className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">פעילות</p>
          <div className="space-y-1.5">
            {connected.map((b) => (
              <div key={b.name} className="flex items-center justify-between rounded-xl bg-accent/[0.04] border border-accent/10 px-3.5 py-3 transition-all hover:bg-accent/[0.07]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/12 border border-accent/15 text-[10px] font-bold text-accent">
                    {b.initials}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-foreground">{b.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_4px_hsl(var(--accent)/0.5)]" />
                      <span className="text-[9px] font-medium text-accent">{b.account}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-accent/10 px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-accent" />
                  <span className="text-[9px] font-semibold text-accent">מחובר</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disconnected brokers */}
      <div className="px-6 pb-4">
        <p className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">זמינות לחיבור</p>
        <div className={`space-y-1 ${mobile ? "max-h-[35vh] overflow-y-auto" : "max-h-[30vh] overflow-y-auto"} scrollbar-none`}>
          {disconnected.map((b) => (
            <div key={b.name} className="flex items-center justify-between rounded-xl bg-muted/[0.04] border border-border/8 px-3.5 py-2.5 transition-all hover:bg-muted/10 hover:border-primary/12 group">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/15 border border-border/15 text-[10px] font-bold text-muted-foreground/50 group-hover:text-primary/60 group-hover:border-primary/15 group-hover:bg-primary/[0.06] transition-colors">
                  {b.initials}
                </div>
                <p className="text-[12px] font-medium text-muted-foreground/70 group-hover:text-foreground transition-colors">{b.name}</p>
              </div>
              <button className="haptic-press rounded-lg bg-primary/8 border border-primary/15 px-3 py-1.5 text-[10px] font-semibold text-primary/70 hover:bg-primary/15 hover:text-primary transition-all">
                חבר
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/10 px-6 py-3.5 flex items-center justify-between bg-muted/[0.03]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3 text-muted-foreground/25" />
          <p className="text-[8px] text-muted-foreground/30">הצפנת AES-256 · מאובטח</p>
        </div>
        <button
          onClick={onClose}
          className="haptic-press rounded-xl bg-muted/10 border border-border/15 px-4 py-2 text-[11px] font-medium text-muted-foreground/60 hover:text-foreground hover:bg-muted/20 transition-all"
        >
          סגור
        </button>
      </div>
    </div>
  );
};

/* ===== Upgrade Modal Content ===== */
const plans = [
  {
    id: "basic",
    name: "בסיסי",
    nameEn: "STARTER",
    price: "40",
    monthly: "40",
    icon: Zap,
    features: [
      { text: "3 סטאפים פעילים", included: true },
      { text: "יומן מסחר בסיסי", included: true },
      { text: "סטטיסטיקות שבועיות", included: true },
      { text: "התראות מייל", included: true },
      { text: "מנטור AI", included: false },
      { text: "בקטסטינג", included: false },
    ],
    cta: "התחל עכשיו",
    popular: false,
    tier: 1,
  },
  {
    id: "pro",
    name: "Pro",
    nameEn: "PRO",
    price: "80",
    monthly: "80",
    icon: Star,
    features: [
      { text: "סטאפים ללא הגבלה", included: true },
      { text: "מנטור AI מתקדם", included: true },
      { text: "סטטיסטיקות Real-Time", included: true },
      { text: "בקטסטינג מלא", included: true },
      { text: "התראות Push + מייל", included: true },
      { text: "ייצוא דוחות PDF", included: true },
    ],
    cta: "שדרג ל-Pro",
    popular: true,
    tier: 2,
  },
  {
    id: "vip",
    name: "VIP",
    nameEn: "VIP",
    price: "150",
    monthly: "150",
    icon: Crown,
    features: [
      { text: "הכול ב-Pro +", included: true },
      { text: "API גישה מלאה", included: true },
      { text: "מנטור AI אישי 1:1", included: true },
      { text: "חוקי ברזל מותאמים", included: true },
      { text: "קבוצת VIP בטלגרם", included: true },
      { text: "תמיכה עדיפות 24/7", included: true },
      { text: "גישה מוקדמת לפיצ׳רים", included: true },
    ],
    cta: "הצטרף ל-VIP",
    popular: false,
    tier: 3,
  },
];

const UpgradeModalContent = ({ onClose, mobile }: { onClose: () => void; mobile?: boolean }) => (
  <div className={mobile ? "px-4 pb-8" : "w-full max-w-[780px] rounded-3xl border border-border/20 bg-card overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-500"}>
    
    {/* ── Hero Header ── */}
    <div className="relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[120px] bg-primary/10 rounded-full blur-[80px]" />
      
      <div className="relative px-8 pt-8 pb-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="haptic-press absolute top-5 left-5 flex h-8 w-8 items-center justify-center rounded-full border border-border/15 bg-muted/10 text-muted-foreground/40 hover:text-foreground hover:bg-muted/25 transition-all z-10"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-primary">שדרג את החוויה שלך</span>
          </div>
          <h2 className="text-[22px] font-extrabold text-foreground mb-1.5">
            בחר את התוכנית ש<span className="text-primary">תשנה לך</span> את המשחק
          </h2>
          <p className="text-[12px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
            הצטרף לאלפי טריידרים שכבר משתמשים ב-ZenTrade כדי לסחור חכם יותר
          </p>
        </div>
      </div>
    </div>

    {/* ── Plans Grid ── */}
    <div className={`px-6 pb-5 grid gap-4 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
      {plans.map((plan, i) => {
        const Icon = plan.icon;
        const isPro = plan.id === "pro";
        const isVip = plan.id === "vip";
        
        return (
          <div
            key={plan.id}
            className={`
              relative rounded-2xl p-[1px] transition-all duration-500 animate-in fade-in slide-in-from-bottom-3
              ${isPro
                ? "bg-gradient-to-b from-primary/60 via-primary/20 to-primary/5 shadow-[0_0_40px_hsl(var(--primary)/0.15)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.25)] scale-[1.03]"
                : isVip
                ? "bg-gradient-to-b from-accent/40 via-accent/15 to-accent/5 hover:shadow-[0_0_40px_hsl(var(--accent)/0.15)]"
                : "bg-gradient-to-b from-border/30 to-border/10 hover:from-border/50 hover:to-border/20"
              }
            `}
            style={{ animationDelay: `${i * 120}ms`, animationFillMode: "both" }}
          >
            <div className={`
              relative h-full rounded-[15px] p-5 flex flex-col
              ${isPro ? "bg-card/95" : "bg-card"}
            `}>
              {/* Popular badge */}
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 shadow-[0_4px_20px_hsl(var(--primary)/0.4)]">
                    <Star className="h-3 w-3 text-primary-foreground fill-primary-foreground" />
                    <span className="text-[10px] font-bold text-primary-foreground tracking-wide">הכי פופולרי</span>
                  </div>
                </div>
              )}

              {/* Tier indicator line */}
              <div className={`absolute top-0 right-5 left-5 h-[2px] rounded-full ${
                isPro ? "bg-primary/50" : isVip ? "bg-accent/40" : "bg-border/30"
              }`} />

              {/* Plan icon + name */}
              <div className="flex items-center gap-3 mt-2 mb-4">
                <div className={`
                  flex h-11 w-11 items-center justify-center rounded-2xl border transition-all
                  ${isPro 
                    ? "bg-primary/12 border-primary/20 shadow-[0_0_16px_hsl(var(--primary)/0.1)]" 
                    : isVip 
                    ? "bg-accent/10 border-accent/15" 
                    : "bg-muted/15 border-border/20"
                  }
                `}>
                  <Icon className={`h-5 w-5 ${isPro ? "text-primary" : isVip ? "text-accent" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-foreground leading-none">{plan.name}</h3>
                  <span className={`text-[8px] font-bold tracking-[0.15em] uppercase ${
                    isPro ? "text-primary/50" : isVip ? "text-accent/50" : "text-muted-foreground/30"
                  }`}>{plan.nameEn}</span>
                </div>
              </div>

              {/* Price block */}
              <div className="mb-5 pb-4 border-b border-border/10">
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-[36px] font-black leading-none tracking-tight ${
                    isPro ? "text-foreground" : isVip ? "text-foreground" : "text-foreground/80"
                  }`}>₪{plan.price}</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground/50 leading-tight">/חודש</span>
                  </div>
                </div>
                {isPro && (
                  <p className="text-[9px] text-primary/60 mt-1.5 font-medium">חיסכון של 20% בתוכנית שנתית</p>
                )}
                {isVip && (
                  <p className="text-[9px] text-accent/60 mt-1.5 font-medium">גישה בלעדית · מקומות מוגבלים</p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2.5 flex-1 mb-5">
                {plan.features.map((f) => (
                  <div key={f.text} className="flex items-center gap-2.5">
                    {f.included ? (
                      <div className={`flex h-4.5 w-4.5 items-center justify-center rounded-full ${
                        isPro ? "bg-primary/12" : isVip ? "bg-accent/10" : "bg-muted/15"
                      }`}>
                        <CheckCircle2 className={`h-3.5 w-3.5 ${
                          isPro ? "text-primary" : isVip ? "text-accent" : "text-muted-foreground/60"
                        }`} />
                      </div>
                    ) : (
                      <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-muted/8">
                        <X className="h-3 w-3 text-muted-foreground/20" />
                      </div>
                    )}
                    <span className={`text-[11px] ${
                      f.included ? "text-foreground/70" : "text-muted-foreground/25 line-through"
                    }`}>{f.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                className={`
                  haptic-press w-full rounded-xl py-3 text-[12px] font-bold transition-all duration-300 relative overflow-hidden group
                  ${isPro
                    ? "bg-primary text-primary-foreground shadow-[0_4px_24px_hsl(var(--primary)/0.3)] hover:shadow-[0_8px_32px_hsl(var(--primary)/0.5)] hover:scale-[1.02]"
                    : isVip
                    ? "bg-gradient-to-l from-accent/90 to-accent text-accent-foreground shadow-[0_4px_20px_hsl(var(--accent)/0.2)] hover:shadow-[0_8px_28px_hsl(var(--accent)/0.4)] hover:scale-[1.02]"
                    : "bg-muted/20 border border-border/25 text-foreground/70 hover:bg-muted/30 hover:border-border/40"
                  }
                `}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  {plan.cta}
                </span>
                {(isPro || isVip) && (
                  <div className="absolute inset-0 bg-gradient-to-l from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>

    {/* ── Social Proof + Footer ── */}
    <div className="border-t border-border/10 px-8 py-4 bg-muted/[0.03]">
      <div className="flex items-center justify-between">
        {/* Avatars + social proof */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 rtl:space-x-reverse">
            {["א", "מ", "ד", "ש"].map((letter, i) => (
              <div
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary/15 text-[9px] font-bold text-primary"
              >
                {letter}
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-semibold text-foreground/60">+2,847 טריידרים</p>
            <p className="text-[8px] text-muted-foreground/40">כבר משתמשים ב-ZenTrade Pro</p>
          </div>
        </div>
        
        {/* Trust badges */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/25" />
            <span className="text-[9px] text-muted-foreground/30">ביטול בכל עת</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-muted-foreground/25" />
            <span className="text-[9px] text-muted-foreground/30">הפעלה מיידית</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardLayout;
