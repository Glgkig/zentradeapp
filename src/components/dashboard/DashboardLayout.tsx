import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Bot, ShieldCheck,
  LogOut, ChevronDown, Plug, Menu, X, Settings, Sun, Moon, Zap,
  Crosshair, PieChart, History, CheckCircle2, Flame, Eye, Crown, Star, Sparkles, Calendar,
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

import logoBinanceFull from "@/assets/logos/binance-full.png";
import logoTradeLockerFull from "@/assets/logos/tradelocker-full.png";
import logoTradingViewFull from "@/assets/logos/tradingview-full.png";
import logoMT5Full from "@/assets/logos/mt5-full.png";
import logoTopstepXFull from "@/assets/logos/topstepx-full.png";
import logoNinjaTraderFull from "@/assets/logos/ninjatrader-full.png";
import logoIBKRFull from "@/assets/logos/ibkr-full.png";
import logoForexFull from "@/assets/logos/forex-full.png";
import logoRithmicFull from "@/assets/logos/rithmic-full.png";

/* ===== Nav Config ===== */
const navItems = [
  { id: "dashboard", label: "דשבורד", icon: LayoutDashboard },
  { id: "setups", label: "סטאפים", icon: Crosshair },
  { id: "journal", label: "יומן", icon: BookOpen },
  { id: "stats", label: "סטטיסטיקות", icon: PieChart },
  { id: "mentor", label: "מנטור AI", icon: Bot },
  { id: "backtesting", label: "בקטסטינג", icon: History },
  { id: "protection", label: "הגנה", icon: ShieldCheck },
  
  { id: "settings", label: "הגדרות", icon: Settings },
];

const bottomTabs = [
  { id: "dashboard", label: "דשבורד", icon: LayoutDashboard },
  { id: "journal", label: "יומן", icon: BookOpen },
  { id: "mentor", label: "מנטור", icon: Bot },
  { id: "settings", label: "הגדרות", icon: Settings },
  { id: "more", label: "עוד", icon: Menu },
];

const brokers = [
  { name: "TradingView", initials: "TV", connected: false, account: null, logo: logoTradingViewFull },
  { name: "TradeLocker", initials: "TL", connected: true, account: "TL-7842", logo: logoTradeLockerFull },
  { name: "MetaTrader 5", initials: "M5", connected: false, account: null, logo: logoMT5Full },
  { name: "Binance", initials: "BN", connected: true, account: "BN-3291", logo: logoBinanceFull },
  { name: "TopstepX", initials: "TX", connected: false, account: null, logo: logoTopstepXFull },
  { name: "Rithmic", initials: "RI", connected: false, account: null, logo: logoRithmicFull },
  { name: "NinjaTrader", initials: "NT", connected: false, account: null, logo: logoNinjaTraderFull },
  { name: "Interactive Brokers", initials: "IB", connected: false, account: null, logo: logoIBKRFull },
  { name: "Forex.com", initials: "FX", connected: false, account: null, logo: logoForexFull },
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
    if (id === "more") { setMoreSheet(true); return; }
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
    if (activeNav === "calendar") return <CalendarPage />;
    return children || null;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden relative" dir="rtl">
      <div className="ambient-bg" />

      {/* ===== Desktop Sidebar ===== */}
      <aside className={`hidden md:flex h-full w-[220px] flex-col border-l border-border/8 bg-sidebar shrink-0 relative z-10 ${zenMode ? "zen-hidden" : "zen-visible"}`}>
        {/* Brand */}
        <div className="flex items-center px-4 py-3 border-b border-border/8">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-[-2px] rounded-sm bg-primary/6 ai-breathe" />
              <div className="relative flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 border border-primary/15">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div>
              <span className="font-heading text-[13px] font-bold text-foreground tracking-tight block">ZenTrade</span>
              <span className="text-2xs text-muted-foreground/30 font-mono">v2.4</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-px px-2 py-3 overflow-y-auto scrollbar-none">
          <p className="text-2xs font-semibold text-muted-foreground/25 uppercase tracking-[0.12em] px-2 mb-1.5">ניווט</p>
          {navItems.slice(0, 4).map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`haptic-press group flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-[11px] font-medium transition-all duration-150 ${
                  active
                    ? "bg-primary/8 text-primary border-r-2 border-primary"
                    : "text-muted-foreground/50 hover:bg-muted/10 hover:text-foreground"
                }`}
              >
                <item.icon className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground/30 group-hover:text-foreground/60"}`} />
                <span className="flex-1 text-right">{item.label}</span>
              </button>
            );
          })}

          <p className="text-2xs font-semibold text-muted-foreground/25 uppercase tracking-[0.12em] px-2 mt-3 mb-1.5">כלים</p>
          {navItems.slice(4).map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`haptic-press group flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-[11px] font-medium transition-all duration-150 ${
                  active
                    ? "bg-primary/8 text-primary border-r-2 border-primary"
                    : "text-muted-foreground/50 hover:bg-muted/10 hover:text-foreground"
                }`}
              >
                <item.icon className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground/30 group-hover:text-foreground/60"}`} />
                <span className="flex-1 text-right">{item.label}</span>
              </button>
            );
          })}

          {/* Broker Connect */}
          <div className="pt-2 mt-2 border-t border-border/6">
            <button
              onClick={() => setBrokerModal(true)}
              className="haptic-press group flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-[11px] font-medium text-muted-foreground/50 hover:bg-primary/6 hover:text-primary transition-all"
            >
              <Plug className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary" />
              <span className="flex-1 text-right">חבר ברוקר</span>
              <span className="rounded-sm bg-primary/10 border border-primary/10 px-1 py-px text-2xs font-bold text-primary font-mono">2</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border/6 px-2 py-2">
          <button
            onClick={() => navigate("/")}
            className="haptic-press flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-[11px] font-medium text-muted-foreground/30 hover:bg-destructive/6 hover:text-destructive transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            התנתק
          </button>
        </div>
      </aside>

      {/* ===== Main Area ===== */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        {/* Top Header — Compact */}
        <header className={`flex items-center justify-between glass-header px-2.5 py-1.5 md:px-4 md:py-2 shrink-0 relative z-50 ${zenMode ? "zen-hidden" : "zen-visible"}`}>
          <div className="flex items-center gap-2">
            {/* Mobile brand */}
            <div className="flex md:hidden items-center gap-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 border border-primary/15">
                <ShieldCheck className="h-3 w-3 text-primary" />
              </div>
              <span className="font-heading text-[11px] font-bold text-foreground">ZenTrade</span>
            </div>
            <h1 className="hidden md:block font-heading text-[12px] font-semibold text-foreground/70">
              {navItems.find((n) => n.id === activeNav)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-1">
            {/* Streak */}
            <div className="hidden sm:flex streak-badge items-center gap-1 rounded-sm border border-orange-500/20 bg-orange-500/6 px-2 py-1 cursor-default">
              <Flame className="h-2.5 w-2.5 text-orange-400" />
              <span className="text-2xs font-bold text-orange-400 font-mono">5D</span>
            </div>

            {/* AI Status */}
            <div className="hidden md:flex items-center gap-1.5 rounded-sm border border-primary/15 bg-primary/5 px-2 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <span className="text-2xs font-medium text-primary font-mono">AI ACTIVE</span>
            </div>

            {/* Upgrade */}
            <button
              onClick={() => setUpgradeModal(true)}
              className="haptic-press flex items-center gap-1 rounded-sm bg-primary px-2 py-1 text-2xs font-bold text-primary-foreground transition-all hover:bg-primary/90"
            >
              <Crown className="h-3 w-3" />
              <span className="hidden sm:inline">שדרוג</span>
            </button>

            {/* Zen */}
            <button
              onClick={() => setZenMode(!zenMode)}
              className={`haptic-press flex h-7 w-7 items-center justify-center rounded-sm border transition-all ${
                zenMode
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/15 bg-muted/10 text-muted-foreground/40 hover:text-primary hover:border-primary/15"
              }`}
              title={zenMode ? "צא ממצב פוקוס" : "מצב פוקוס"}
            >
              <Eye className="h-3.5 w-3.5" />
            </button>

            {/* Theme */}
            <button
              onClick={() => setDark(!dark)}
              className="haptic-press flex h-7 w-7 items-center justify-center rounded-sm border border-border/15 bg-muted/10 text-muted-foreground/40 hover:text-primary hover:border-primary/15 transition-all"
            >
              {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {/* User */}
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-1.5 rounded-sm border border-border/10 bg-muted/10 px-1.5 py-1 hover:bg-muted/20 transition-all"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 text-2xs font-bold text-primary font-mono">
                  Y
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-[10px] font-semibold text-foreground leading-none">יהונתן</p>
                  <p className="text-2xs text-muted-foreground/40 font-mono">PRO</p>
                </div>
                <ChevronDown className={`h-3 w-3 text-muted-foreground/30 hidden md:block transition-transform ${userMenu ? "rotate-180" : ""}`} />
              </button>

              {userMenu && (
                <>
                  <div className="fixed inset-0 z-[60] bg-background/50 md:bg-transparent" onClick={() => setUserMenu(false)} />
                  <div className="hidden md:block absolute left-0 md:left-auto md:right-0 top-full mt-1 w-52 z-[70] rounded-sm border border-border/15 bg-card shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
                    <UserMenuContent
                      onClose={() => setUserMenu(false)}
                      onSettings={() => { setUserMenu(false); setActiveNav("settings"); }}
                      onLogout={() => { setUserMenu(false); navigate("/"); }}
                    />
                  </div>
                  <div className="md:hidden fixed inset-x-0 bottom-0 z-[70] rounded-t-xl border-t border-border/15 bg-card animate-in slide-in-from-bottom duration-200 overflow-hidden">
                    <div className="flex justify-center pt-2 pb-1"><div className="w-8 h-0.5 rounded-full bg-muted-foreground/15" /></div>
                    <UserMenuContent
                      onClose={() => setUserMenu(false)}
                      onSettings={() => { setUserMenu(false); setActiveNav("settings"); }}
                      onLogout={() => { setUserMenu(false); navigate("/"); }}
                    />
                    <div className="px-3 pb-5 pt-1">
                      <button onClick={() => setUserMenu(false)} className="w-full rounded-sm bg-muted/10 border border-border/10 py-2.5 text-[11px] font-medium text-muted-foreground/50">סגור</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background p-2 pb-16 md:p-4 md:pb-4 relative">
          {renderContent()}
          {zenMode && (
            <button
              onClick={() => setZenMode(false)}
              className="fixed bottom-5 left-5 z-[80] flex items-center gap-1.5 rounded-sm border border-primary/20 bg-card px-3 py-2 shadow-lg haptic-press animate-in fade-in slide-in-from-bottom-4"
            >
              <Eye className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-foreground">יציאה מפוקוס</span>
            </button>
          )}
        </main>
      </div>

      {/* ===== Mobile Bottom Tab Bar ===== */}
      <nav className={`md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border/10 bg-sidebar/95 backdrop-blur-xl ${zenMode ? "zen-hidden" : "zen-visible"}`}>
        <div className="flex items-center justify-around px-1 pt-1 pb-[env(safe-area-inset-bottom,6px)]">
          {bottomTabs.map((tab) => {
            const active = tab.id !== "more" && activeNav === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNav(tab.id)}
                className={`haptic-press flex flex-col items-center gap-0.5 py-1 px-2.5 min-w-[48px] rounded-sm transition-all ${
                  active ? "text-primary" : "text-muted-foreground/30"
                }`}
              >
                <tab.icon className={`h-4 w-4 ${active ? "text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]" : ""}`} />
                <span className={`text-2xs font-semibold ${active ? "text-primary" : ""}`}>{tab.label}</span>
                {active && <span className="h-px w-3 bg-primary mt-0.5" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ===== "More" Bottom Sheet ===== */}
      {moreSheet && (
        <>
          <div className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm md:hidden" onClick={() => setMoreSheet(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 md:hidden rounded-t-xl border-t border-border/15 bg-card backdrop-blur-xl animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-center pt-2 pb-1"><div className="w-8 h-0.5 rounded-full bg-muted-foreground/15" /></div>
            <div className="px-3 pb-6 space-y-px">
              {navItems.filter(n => !bottomTabs.some(t => t.id === n.id)).map((item) => {
                const active = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-sm px-3 py-3 text-[12px] font-medium transition-all min-h-[44px] ${
                      active ? "bg-primary/8 text-primary" : "text-muted-foreground/60 hover:bg-muted/10"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={() => { setMoreSheet(false); setUpgradeModal(true); }}
                className="flex w-full items-center gap-2.5 rounded-sm px-3 py-3 text-[12px] font-medium text-primary min-h-[44px] bg-primary/5 hover:bg-primary/8"
              >
                <Crown className="h-4 w-4" />
                שדרג תוכנית
                <span className="mr-auto rounded-sm bg-primary/10 px-1.5 py-px text-2xs font-bold text-primary font-mono">PRO</span>
              </button>
              <button
                onClick={() => { setMoreSheet(false); setBrokerModal(true); }}
                className="flex w-full items-center gap-2.5 rounded-sm px-3 py-3 text-[12px] font-medium text-muted-foreground/60 min-h-[44px] hover:bg-muted/10"
              >
                <Plug className="h-4 w-4" />
                חבר ברוקר
              </button>
              <button
                onClick={() => { setMoreSheet(false); navigate("/"); }}
                className="flex w-full items-center gap-2.5 rounded-sm px-3 py-3 text-[12px] font-medium text-destructive/50 min-h-[44px] hover:bg-destructive/5"
              >
                <LogOut className="h-4 w-4" />
                התנתק
              </button>
            </div>
          </div>
        </>
      )}

      {/* ===== Broker Modal ===== */}
      {brokerModal && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setBrokerModal(false)} />
          <div className="hidden md:flex fixed inset-0 z-[61] items-center justify-center p-4">
            <BrokerModalContent onClose={() => setBrokerModal(false)} />
          </div>
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[61] max-h-[85vh] rounded-t-xl border-t border-border/15 bg-card animate-in slide-in-from-bottom duration-200 overflow-y-auto">
            <div className="flex justify-center pt-2 pb-1"><div className="w-8 h-0.5 rounded-full bg-muted-foreground/15" /></div>
            <BrokerModalContent onClose={() => setBrokerModal(false)} mobile />
          </div>
        </>
      )}

      {/* ===== Upgrade Modal ===== */}
      {upgradeModal && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setUpgradeModal(false)} />
          <div className="hidden md:flex fixed inset-0 z-[61] items-center justify-center p-4">
            <UpgradeModalContent onClose={() => setUpgradeModal(false)} />
          </div>
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[61] max-h-[90vh] rounded-t-xl border-t border-border/15 bg-card animate-in slide-in-from-bottom duration-200 overflow-y-auto">
            <div className="flex justify-center pt-2 pb-1"><div className="w-8 h-0.5 rounded-full bg-muted-foreground/15" /></div>
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

/* ===== User Menu ===== */
const UserMenuContent = ({ onClose, onSettings, onLogout }: { onClose: () => void; onSettings: () => void; onLogout: () => void }) => (
  <>
    <div className="px-3 py-2.5 border-b border-border/10">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-xs font-bold text-primary font-mono">Y</div>
        <div>
          <p className="text-[11px] font-bold text-foreground">יהונתן</p>
          <p className="text-2xs text-muted-foreground/40 font-mono">yonatan@email.com</p>
        </div>
      </div>
    </div>
    <div className="px-3 py-1.5 border-b border-border/8">
      <div className="flex items-center justify-between">
        <span className="text-2xs text-muted-foreground/40">תוכנית</span>
        <span className="rounded-sm bg-primary/8 border border-primary/10 px-1.5 py-px text-2xs font-bold text-primary font-mono">PRO</span>
      </div>
    </div>
    <div className="py-1">
      <button onClick={onClose} className="w-full flex items-center gap-2.5 px-3 py-2 text-right hover:bg-primary/5 transition-colors min-h-[40px]">
        <Zap className="h-3.5 w-3.5 text-primary/50" />
        <p className="text-[11px] font-medium text-foreground/70">שדרג חשבון</p>
      </button>
      <button onClick={onSettings} className="w-full flex items-center gap-2.5 px-3 py-2 text-right hover:bg-muted/10 transition-colors min-h-[40px]">
        <Settings className="h-3.5 w-3.5 text-muted-foreground/40" />
        <p className="text-[11px] font-medium text-foreground/70">הגדרות</p>
      </button>
      <div className="mx-3 my-0.5 border-t border-border/6" />
      <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-right hover:bg-destructive/5 transition-colors min-h-[40px]">
        <LogOut className="h-3.5 w-3.5 text-destructive/50" />
        <p className="text-[11px] font-medium text-destructive/60">התנתק</p>
      </button>
    </div>
  </>
);

/* ===== Broker Modal ===== */
const BrokerModalContent = ({ onClose, mobile }: { onClose: () => void; mobile?: boolean }) => {
  const connected = brokers.filter(b => b.connected);
  const disconnected = brokers.filter(b => !b.connected);

  return (
    <div className={mobile ? "" : "w-full max-w-md rounded-sm border border-border/15 bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden"}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary/8 border border-primary/10">
              <Plug className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-foreground">חיבורי ברוקר</h2>
              <p className="text-2xs text-muted-foreground/40">ניהול פלטפורמות מסחר</p>
            </div>
          </div>
          <button onClick={onClose} className="haptic-press flex h-7 w-7 items-center justify-center rounded-sm border border-border/15 bg-muted/10 text-muted-foreground/40 hover:text-foreground transition-all">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 rounded-sm bg-primary/5 border border-primary/8 px-2.5 py-1.5 flex items-center justify-between">
            <span className="text-2xs text-muted-foreground/40">מחוברות</span>
            <span className="text-[11px] font-bold text-primary font-mono">{connected.length}</span>
          </div>
          <div className="flex-1 rounded-sm bg-muted/8 border border-border/8 px-2.5 py-1.5 flex items-center justify-between">
            <span className="text-2xs text-muted-foreground/40">ממתינות</span>
            <span className="text-[11px] font-bold text-muted-foreground font-mono">{disconnected.length}</span>
          </div>
        </div>
      </div>

      {connected.length > 0 && (
        <div className="px-4 pb-2">
          <p className="text-2xs font-semibold text-muted-foreground/30 uppercase tracking-wider mb-1.5 font-mono">CONNECTED</p>
          <div className="space-y-1">
            {connected.map((b) => (
              <div key={b.name} className="flex items-center justify-between rounded-sm bg-primary/[0.03] border border-primary/8 px-3 py-2">
                <div className="flex items-center gap-2.5">
                  {(b as any).logo ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-sm overflow-hidden">
                      <img src={(b as any).logo} alt={b.name} className="h-7 w-7 object-cover rounded-sm" />
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary/8 text-2xs font-bold text-primary font-mono">{b.initials}</div>
                  )}
                  <div>
                    <p className="text-[11px] font-semibold text-foreground">{b.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="h-1 w-1 rounded-full bg-profit" />
                      <span className="text-2xs text-profit font-mono">{b.account}</span>
                    </div>
                  </div>
                </div>
                <CheckCircle2 className="h-3.5 w-3.5 text-profit" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pb-3">
        <p className="text-2xs font-semibold text-muted-foreground/30 uppercase tracking-wider mb-1.5 font-mono">AVAILABLE</p>
        <div className={`space-y-0.5 ${mobile ? "max-h-[35vh]" : "max-h-[30vh]"} overflow-y-auto scrollbar-none`}>
          {disconnected.map((b) => (
            <div key={b.name} className="flex items-center justify-between rounded-sm bg-muted/[0.03] border border-border/6 px-3 py-2 hover:bg-muted/8 group transition-all">
              <div className="flex items-center gap-2.5">
                {(b as any).logo ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-sm overflow-hidden">
                    <img src={(b as any).logo} alt={b.name} className="h-7 w-7 object-cover rounded-sm" />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-muted/10 border border-border/8 text-2xs font-bold text-muted-foreground/40 font-mono group-hover:text-primary/60">{b.initials}</div>
                )}
                <p className="text-[11px] font-medium text-muted-foreground/60 group-hover:text-foreground">{b.name}</p>
              </div>
              <button className="haptic-press rounded-sm bg-primary/6 border border-primary/10 px-2 py-1 text-2xs font-semibold text-primary/60 hover:bg-primary/12 hover:text-primary transition-all">חבר</button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border/6 px-4 py-2.5 flex items-center justify-between bg-muted/[0.02]">
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-2.5 w-2.5 text-muted-foreground/20" />
          <p className="text-2xs text-muted-foreground/20 font-mono">AES-256</p>
        </div>
        <button onClick={onClose} className="haptic-press rounded-sm bg-muted/8 border border-border/10 px-3 py-1.5 text-[10px] font-medium text-muted-foreground/50 hover:text-foreground transition-all">סגור</button>
      </div>
    </div>
  );
};

/* ===== Upgrade Modal ===== */
const plans = [
  {
    id: "basic", name: "בסיסי", nameEn: "STARTER", price: "40", icon: Zap,
    features: ["3 סטאפים", "יומן בסיסי", "סטטיסטיקות שבועיות", "התראות מייל"],
    missing: ["מנטור AI", "בקטסטינג"],
    cta: "התחל", popular: false,
  },
  {
    id: "pro", name: "Pro", nameEn: "PRO", price: "80", icon: Star,
    features: ["סטאפים ∞", "מנטור AI מתקדם", "Real-Time סטטיסטיקות", "בקטסטינג מלא", "Push + מייל", "ייצוא PDF"],
    missing: [],
    cta: "שדרג ל-Pro", popular: true,
  },
  {
    id: "vip", name: "VIP", nameEn: "VIP", price: "150", icon: Crown,
    features: ["הכול ב-Pro +", "API גישה מלאה", "מנטור 1:1", "חוקי ברזל מותאמים", "VIP טלגרם", "תמיכה 24/7", "גישה מוקדמת"],
    missing: [],
    cta: "הצטרף ל-VIP", popular: false,
  },
];

const UpgradeModalContent = ({ onClose, mobile }: { onClose: () => void; mobile?: boolean }) => (
  <div className={mobile ? "px-3 pb-6" : "w-full max-w-2xl rounded-sm border border-border/15 bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden p-5"}>
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-[14px] font-bold text-foreground">שדרוג תוכנית</h2>
        <p className="text-2xs text-muted-foreground/40 mt-0.5">בחר את התוכנית שמתאימה לך</p>
      </div>
      <button onClick={onClose} className="haptic-press flex h-7 w-7 items-center justify-center rounded-sm border border-border/15 bg-muted/10 text-muted-foreground/40 hover:text-foreground transition-all">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>

    {/* Plans Grid */}
    <div className={`grid ${mobile ? "grid-cols-1 gap-2" : "grid-cols-3 gap-2.5"}`}>
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`rounded-sm border p-3 transition-all ${
            plan.popular
              ? "border-primary/25 bg-primary/[0.04] shadow-[0_0_20px_hsl(var(--primary)/0.08)]"
              : "border-border/10 bg-muted/[0.03] hover:border-border/20"
          }`}
        >
          {plan.popular && (
            <div className="flex items-center gap-1 mb-2">
              <span className="rounded-sm bg-primary/10 border border-primary/15 px-1.5 py-px text-2xs font-bold text-primary font-mono">POPULAR</span>
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <plan.icon className={`h-4 w-4 ${plan.popular ? "text-primary" : "text-muted-foreground/40"}`} />
            <span className="text-[12px] font-bold text-foreground">{plan.name}</span>
            <span className="text-2xs text-muted-foreground/30 font-mono">{plan.nameEn}</span>
          </div>
          <div className="mb-3">
            <span className="text-xl font-bold text-foreground font-mono">₪{plan.price}</span>
            <span className="text-2xs text-muted-foreground/40">/חודש</span>
          </div>
          <div className="space-y-1 mb-3">
            {plan.features.map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-2xs text-muted-foreground/60">
                <CheckCircle2 className="h-2.5 w-2.5 text-profit shrink-0" />
                {f}
              </div>
            ))}
            {plan.missing?.map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-2xs text-muted-foreground/20 line-through">
                <X className="h-2.5 w-2.5 shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <button className={`haptic-press w-full rounded-sm py-2 text-[11px] font-bold transition-all ${
            plan.popular
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted/10 border border-border/10 text-foreground/60 hover:bg-muted/20"
          }`}>
            {plan.cta}
          </button>
        </div>
      ))}
    </div>

    {/* Social proof */}
    <div className="mt-3 flex items-center justify-center gap-2 text-2xs text-muted-foreground/25">
      <ShieldCheck className="h-3 w-3" />
      <span className="font-mono">+2,847 סוחרים · ביטול בכל עת</span>
    </div>
  </div>
);

export default DashboardLayout;
