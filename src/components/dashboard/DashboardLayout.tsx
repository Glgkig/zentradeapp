import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, POLAR_URL } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Bot, ShieldCheck,
  LogOut, ChevronDown, Plug, Menu, X, Settings, Sun, Moon, Zap,
  Crosshair, PieChart, History, CheckCircle2, Flame, Eye, Crown, Star, Sparkles, Newspaper,
  Calculator, Plus, ShieldAlert, TrendingUp, Brain, Clock, CandlestickChart, BarChart3, CalendarClock, LineChart, Shield,
} from "lucide-react";
import zentradeLogo from "@/assets/zentrade-z-logo.png";
import SettingsPage from "@/pages/SettingsPage";
import SetupsPage from "@/pages/SetupsPage";
import StatsPage from "@/pages/StatsPage";
import JournalPage from "@/pages/JournalPage";
import MentorPage from "@/pages/MentorPage";
import HomeDashboard from "@/components/dashboard/HomeDashboard";
import OnboardingModal from "@/components/dashboard/OnboardingModal";
import BacktestingPage from "@/pages/BacktestingPage";
import ProtectionPage from "@/pages/ProtectionPage";
import TaxCalculatorPage from "@/pages/TaxCalculatorPage";
import EconomicNewsPage from "@/pages/EconomicNewsPage";
import ForensicTradeDrawer from "@/components/dashboard/ForensicTradeDrawer";
import LiveTicker from "@/components/dashboard/LiveTicker";
import AvatarPicker, { UserAvatar } from "@/components/AvatarPicker";

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
const navSections = [
  {
    label: "ניווט",
    items: [
      { id: "dashboard", label: "דשבורד", icon: TrendingUp },
      { id: "setups", label: "סטאפים", icon: CandlestickChart },
      { id: "journal", label: "יומן פורנזי", icon: BookOpen },
      { id: "tax", label: "מחשבון מס", icon: Calculator },
      { id: "stats", label: "סטטיסטיקות", icon: BarChart3 },
      { id: "news", label: "חדשות כלכליות", icon: CalendarClock },
    ],
  },
  {
    label: "כלים",
    items: [
      { id: "tradingview", label: "גרף מסחר", icon: LineChart },
      { id: "mentor", label: "מנטור AI", icon: Brain },
      { id: "backtesting", label: "סימולטור", icon: Clock },
      { id: "protection", label: "הגנה", icon: Shield },
      { id: "settings", label: "הגדרות", icon: Settings },
    ],
  },
];

const allNavItems = navSections.flatMap((s) => s.items);

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
  const { profile, user, signOut, refreshProfile } = useAuth();
  const { isPro, showPaywall } = useSubscription();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [brokerModal, setBrokerModal] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [tradeDrawerOpen, setTradeDrawerOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("zentrade-theme") !== "light";
    }
    return true;
  });

  useEffect(() => {
    if (profile && !profile.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [profile]);

  useEffect(() => {
    document.documentElement.classList.toggle("light", !dark);
    localStorage.setItem("zentrade-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    if (!userMenu) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && !userMenuRef.current?.contains(target)) {
        setUserMenu(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [userMenu]);

  const completeOnboarding = async () => {
    setShowOnboarding(false);
    await refreshProfile();
  };

  const handleNav = (id: string) => {
    setActiveNav(id);
    setMobileNavOpen(false);
    setUserMenu(false);
  };

  const userName = profile?.full_name || "סוחר";
  const userEmail = user?.email || "";

  const renderContent = () => {
    if (activeNav === "dashboard") return <HomeDashboard userName={userName} onOpenTrade={() => setTradeDrawerOpen(true)} />;
    if (activeNav === "setups") return <SetupsPage />;
    if (activeNav === "stats") return <StatsPage />;
    if (activeNav === "journal") return <JournalPage />;
    if (activeNav === "settings") return <SettingsPage />;
    if (activeNav === "mentor") {
      if (!isPro) { showPaywall("מנטור AI"); setActiveNav("dashboard"); return <HomeDashboard userName={userName} onOpenTrade={() => setTradeDrawerOpen(true)} />; }
      return <MentorPage />;
    }
    if (activeNav === "backtesting") return <BacktestingPage />;
    if (activeNav === "protection") {
      if (!isPro) { showPaywall("הגנת הון — Kill Switch"); setActiveNav("dashboard"); return <HomeDashboard userName={userName} onOpenTrade={() => setTradeDrawerOpen(true)} />; }
      return <ProtectionPage />;
    }
    if (activeNav === "tax") return <TaxCalculatorPage />;
    if (activeNav === "news") return <EconomicNewsPage />;
    if (activeNav === "tradingview") return (
      <div className="flex items-center justify-center h-full min-h-[60vh] text-muted-foreground text-lg">
        בקרוב — גרף TradingView
      </div>
    );
    return children || null;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden relative" dir="rtl">
      <div className="ambient-bg" />

      {/* ===== Desktop Sidebar ===== */}
      <aside className={`hidden md:flex h-full w-[240px] flex-col bg-card/95 backdrop-blur-xl border-l border-border/50 shrink-0 relative z-10 ${zenMode ? "zen-hidden" : "zen-visible"}`}>
        {/* Brand */}
        <div className="flex items-center px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-[-3px] rounded-xl bg-primary/8 ai-breathe" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 overflow-hidden">
                <img src={zentradeLogo} alt="ZenTrade" className="h-7 w-7 object-contain" />
              </div>
            </div>
            <div>
              <span className="font-heading text-sm font-bold text-foreground tracking-tight block">ZenTrade</span>
              <span className="text-2xs text-muted-foreground/40 font-mono">v3.0 Elite</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-none">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="text-2xs font-semibold text-muted-foreground/30 uppercase tracking-[0.12em] px-3 mb-2">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`haptic-press group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-medium transition-all duration-200 ${
                        active
                          ? "bg-primary/10 text-primary border border-primary/15"
                          : "text-muted-foreground/60 hover:bg-secondary/50 hover:text-foreground border border-transparent"
                      }`}
                    >
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${active ? "bg-primary/15" : "bg-secondary/50 group-hover:bg-secondary"}`}>
                        <item.icon className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground/40 group-hover:text-foreground/60"}`} />
                      </div>
                      <span className="flex-1 text-right">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Broker Connect */}
          <div className="pt-2 border-t border-border/30">
            <button
              onClick={() => setBrokerModal(true)}
              className="haptic-press group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-medium text-muted-foreground/60 hover:bg-secondary/50 hover:text-primary transition-all"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/50 group-hover:bg-primary/10">
                <Plug className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary" />
              </div>
              <span className="flex-1 text-right">חבר ברוקר</span>
              <span className="rounded-lg bg-primary/10 border border-primary/15 px-1.5 py-0.5 text-2xs font-bold text-primary font-mono">2</span>
            </button>
          </div>
        </nav>


        {/* Footer */}
        <div className="border-t border-white/[0.04] px-3 py-3">
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="haptic-press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-medium text-muted-foreground/40 hover:bg-destructive/[0.06] hover:text-destructive transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            התנתק
          </button>
        </div>
      </aside>

      {/* ===== Main Area ===== */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        {/* Top Header */}
        <header className={`flex items-center justify-between glass-header px-3 py-2 md:px-5 md:py-3 shrink-0 relative z-50 ${zenMode ? "zen-hidden" : "zen-visible"}`}>
          <div className="flex items-center gap-2.5">
            {/* Mobile hamburger */}
            <button
              onClick={() => {
                navigator.vibrate?.(10);
                setUserMenu(false);
                setMobileNavOpen((prev) => !prev);
              }}
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? "סגור תפריט ניווט" : "פתח תפריט ניווט"}
              className="md:hidden haptic-press flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-secondary/50 text-muted-foreground hover:text-primary hover:border-primary/15 transition-all duration-200 active:scale-95"
            >
              {mobileNavOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
            {/* Mobile brand */}
            <div className="flex md:hidden items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 overflow-hidden">
                <img src={zentradeLogo} alt="ZenTrade" className="h-6 w-6 object-contain" />
              </div>
              <span className="font-heading text-[13px] font-bold text-foreground">ZenTrade</span>
            </div>
            <h1 className="hidden md:block font-heading text-sm font-semibold text-foreground/70">
              {allNavItems.find((n) => n.id === activeNav)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Bodyguard Badge — desktop only */}
            <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-primary/15 bg-primary/[0.06] px-3 py-1.5 cyan-glow">
              <ShieldAlert className="h-3 w-3 text-primary" />
              <span className="text-2xs font-bold text-primary font-mono">Bodyguard: ACTIVE 🛡️</span>
            </div>

            {/* Upgrade CTA — desktop only */}
            {!isPro && (
              <button
                onClick={() => navigate("/pricing")}
                className="hidden md:flex haptic-press items-center gap-1 rounded-lg border border-accent/20 bg-accent/[0.06] px-2 py-1 text-[10px] font-bold text-accent transition-all hover:bg-accent/15 hover:border-accent/30"
              >
                <Crown className="h-2.5 w-2.5" />
                <span>שדרג PRO</span>
              </button>
            )}

            {/* New Trade CTA */}
            <button
              onClick={() => setTradeDrawerOpen(true)}
              className="haptic-press flex items-center gap-1.5 rounded-xl bg-accent/15 border border-accent/25 px-2.5 py-1.5 md:px-3 text-2xs font-bold text-accent transition-all hover:bg-accent/25 gold-glow"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">עסקה חדשה</span>
            </button>

            {/* Zen — desktop only (mobile gets floating btn) */}
            <button
              onClick={() => setZenMode(!zenMode)}
              className={`hidden md:flex haptic-press h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                zenMode
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/50 bg-secondary/50 text-muted-foreground hover:text-primary hover:border-primary/15"
              }`}
              title={zenMode ? "צא ממצב פוקוס" : "מצב פוקוס"}
            >
              <Eye className="h-4 w-4" />
            </button>

            {/* Theme — desktop only */}
            <button
              onClick={() => setDark(!dark)}
              className="hidden md:flex haptic-press h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-secondary/50 text-muted-foreground hover:text-primary hover:border-primary/20 transition-all duration-300"
            >
              {dark ? <Sun className="h-4 w-4 transition-transform duration-300 rotate-0" /> : <Moon className="h-4 w-4 transition-transform duration-300 rotate-0" />}
            </button>

            {/* User */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  setUserMenu((prev) => !prev);
                }}
                aria-expanded={userMenu}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/30 px-2 py-1.5 hover:bg-secondary/60 transition-all"
              >
                <UserAvatar avatarUrl={profile?.avatar_url} userName={userName} size="sm" />
                <div className="hidden md:block text-right">
                  <p className="text-[11px] font-semibold text-foreground leading-none">{userName}</p>
                  {isPro && <p className="text-2xs text-accent font-mono font-bold">PRO</p>}
                </div>
                <ChevronDown className={`h-3 w-3 text-muted-foreground/30 hidden md:block transition-transform ${userMenu ? "rotate-180" : ""}`} />
              </button>

              {userMenu && (
                <div
                  className="absolute left-0 top-[calc(100%+0.6rem)] z-[90] w-[calc(100vw-1.5rem)] max-w-[22rem] overflow-hidden rounded-[1.5rem] border border-border/60 bg-card/95 shadow-2xl backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
                  role="menu"
                >
                  <div className="flex justify-center pt-3 pb-1">
                    <div className="h-1 w-10 rounded-full bg-muted/80" />
                  </div>
                  <UserMenuContent
                    userName={userName}
                    userEmail={userEmail}
                    avatarUrl={profile?.avatar_url}
                    onClose={() => setUserMenu(false)}
                    onSettings={() => { setUserMenu(false); setActiveNav("settings"); }}
                    onLogout={async () => { setUserMenu(false); await signOut(); navigate("/"); }}
                    onUpgrade={() => { setUserMenu(false); navigate("/pricing"); }}
                  />
                  <div className="px-4 pb-4 pt-2">
                    <button
                      onClick={() => setUserMenu(false)}
                      className="w-full rounded-2xl border border-border/60 bg-secondary/40 py-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary/70"
                    >
                      סגור
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Nav Dropdown */}
        <div
          className={`md:hidden relative z-40 origin-top overflow-hidden border-b border-border/50 bg-card/95 backdrop-blur-xl shadow-lg transition-all duration-300 ease-out ${
            mobileNavOpen
              ? "max-h-[85vh] translate-y-0 opacity-100"
              : "pointer-events-none max-h-0 -translate-y-2 opacity-0 border-b-0"
          }`}
        >
          <div className={`px-3 py-3 overflow-y-auto max-h-[80vh] scrollbar-none transition-transform duration-300 ease-out ${mobileNavOpen ? "translate-y-0" : "-translate-y-2"}`}>
            {/* Nav sections with labels */}
            {navSections.map((section, si) => (
              <div key={section.label} className={si > 0 ? "mt-3" : ""}>
                <p className="text-2xs font-semibold text-muted-foreground/30 uppercase tracking-[0.12em] px-3 mb-1.5">{section.label}</p>
                <div className="space-y-0.5">
                  {section.items.map((item, i) => {
                    const active = activeNav === item.id;
                    const delay = (si * section.items.length + i) * 30;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        style={{ transitionDelay: mobileNavOpen ? `${delay}ms` : "0ms" }}
                        className={`haptic-press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium min-h-[44px] transition-all duration-300 ${
                          mobileNavOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                        } ${
                          active ? "bg-primary/10 text-primary border border-primary/15" : "text-muted-foreground/60 hover:bg-secondary/50 hover:text-foreground border border-transparent"
                        }`}
                      >
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${active ? "bg-primary/15" : "bg-secondary/50"}`}>
                          <item.icon className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground/30"}`} />
                        </div>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Utilities row */}
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-2xs font-semibold text-muted-foreground/30 uppercase tracking-[0.12em] px-3 mb-1.5">מהיר</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDark(!dark)}
                  style={{ transitionDelay: mobileNavOpen ? `${allNavItems.length * 30}ms` : "0ms" }}
                  className={`haptic-press flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-medium min-h-[44px] border border-border/30 bg-secondary/30 text-muted-foreground/60 hover:bg-secondary/50 transition-all duration-300 ${
                    mobileNavOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                  }`}
                >
                  {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  {dark ? "בהיר" : "כהה"}
                </button>
                <button
                  onClick={() => { setMobileNavOpen(false); setZenMode(!zenMode); }}
                  style={{ transitionDelay: mobileNavOpen ? `${(allNavItems.length + 0.5) * 30}ms` : "0ms" }}
                  className={`haptic-press flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-medium min-h-[44px] border transition-all duration-300 ${
                    zenMode ? "border-primary/30 bg-primary/10 text-primary" : "border-border/30 bg-secondary/30 text-muted-foreground/60 hover:bg-secondary/50"
                  } ${mobileNavOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  פוקוס
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-2 space-y-1">
              <button
                onClick={() => { setMobileNavOpen(false); setBrokerModal(true); }}
                style={{ transitionDelay: mobileNavOpen ? `${(allNavItems.length + 1) * 30}ms` : "0ms" }}
                className={`haptic-press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted-foreground/60 min-h-[44px] hover:bg-secondary/50 transition-all duration-300 ${
                  mobileNavOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/50">
                  <Plug className="h-3.5 w-3.5 text-muted-foreground/30" />
                </div>
                חבר ברוקר
                <span className="mr-auto rounded-lg bg-primary/10 border border-primary/15 px-1.5 py-0.5 text-2xs font-bold text-primary font-mono">2</span>
              </button>
              <button
                onClick={() => { setMobileNavOpen(false); navigate("/pricing"); }}
                style={{ transitionDelay: mobileNavOpen ? `${(allNavItems.length + 2) * 30}ms` : "0ms" }}
                className={`haptic-press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold text-accent min-h-[44px] bg-accent/[0.06] border border-accent/15 hover:bg-accent/10 transition-all duration-300 gold-glow ${
                  mobileNavOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15">
                  <Crown className="h-3.5 w-3.5 text-accent" />
                </div>
                שדרג PRO
              </button>
              <button
                onClick={async () => { setMobileNavOpen(false); await signOut(); navigate("/"); }}
                style={{ transitionDelay: mobileNavOpen ? `${(allNavItems.length + 3) * 30}ms` : "0ms" }}
                className={`haptic-press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-destructive/50 min-h-[44px] hover:bg-destructive/[0.05] transition-all duration-300 ${
                  mobileNavOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                }`}
              >
                <LogOut className="h-3.5 w-3.5" />
                התנתק
              </button>
            </div>
          </div>
        </div>

        <LiveTicker />
        <main className="relative flex-1 overflow-y-auto bg-background p-3 md:p-6">
          {renderContent()}
          {zenMode && (
            <button
              onClick={() => setZenMode(false)}
              className="fixed bottom-5 left-5 z-[80] flex items-center gap-2 rounded-xl border border-primary/20 bg-card px-4 py-2.5 shadow-lg haptic-press animate-in fade-in slide-in-from-bottom-4"
            >
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-semibold text-foreground">יציאה מפוקוס</span>
            </button>
          )}
        </main>

        <div
          className={`md:hidden absolute inset-0 z-30 bg-background/55 transition-opacity duration-300 ${
            mobileNavOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setMobileNavOpen(false)}
        />
      </div>

      {/* ===== Forensic Trade Drawer ===== */}
      <ForensicTradeDrawer open={tradeDrawerOpen} onClose={() => setTradeDrawerOpen(false)} />

      {/* ===== Broker Modal ===== */}
      {brokerModal && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setBrokerModal(false)} />
          <div className="hidden md:flex fixed inset-0 z-[61] items-center justify-center p-4">
            <BrokerModalContent onClose={() => setBrokerModal(false)} />
          </div>
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[61] max-h-[85vh] rounded-t-3xl border-t border-white/[0.08] bg-card animate-in slide-in-from-bottom duration-200 overflow-y-auto">
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-muted-foreground/15" /></div>
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
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[61] max-h-[90vh] rounded-t-3xl border-t border-white/[0.08] bg-card animate-in slide-in-from-bottom duration-200 overflow-y-auto">
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-muted-foreground/15" /></div>
            <UpgradeModalContent onClose={() => setUpgradeModal(false)} mobile />
          </div>
        </>
      )}

      {showOnboarding && (
        <OnboardingModal userName={userName} onComplete={completeOnboarding} />
      )}
    </div>
  );
};

/* ===== User Menu ===== */
const UserMenuContent = ({ userName, userEmail, avatarUrl, onClose, onSettings, onLogout, onUpgrade }: { userName: string; userEmail: string; avatarUrl?: string | null; onClose: () => void; onSettings: () => void; onLogout: () => void; onUpgrade: () => void }) => {
  const { isPro } = useSubscription();
  return (
  <>
    <div className="border-b border-border/60 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <UserAvatar avatarUrl={avatarUrl} userName={userName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold text-foreground">{userName}</p>
          <p className="truncate text-2xs font-mono text-muted-foreground">{userEmail}</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-secondary/40 text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
          aria-label="סגור תפריט משתמש"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
    <div className="border-b border-border/50 px-4 py-2">
      <div className="flex items-center justify-between">
        <span className="text-2xs text-muted-foreground">תוכנית</span>
        <span className={`rounded-lg border px-2 py-0.5 text-2xs font-bold font-mono ${isPro ? "border-accent/20 bg-accent/10 text-accent" : "border-border/60 bg-secondary/40 text-muted-foreground"}`}>
          {isPro ? "PRO" : "LITE"}
        </span>
      </div>
    </div>
    <div className="py-1.5">
      <button onClick={onUpgrade} className="flex min-h-[48px] w-full items-center gap-3 px-4 py-2.5 text-right transition-colors hover:bg-secondary/60">
        <Zap className="h-4 w-4 text-accent" />
        <p className="text-[12px] font-medium text-foreground">שדרג חשבון</p>
      </button>
      <button onClick={onSettings} className="flex min-h-[48px] w-full items-center gap-3 px-4 py-2.5 text-right transition-colors hover:bg-secondary/60">
        <Settings className="h-4 w-4 text-muted-foreground" />
        <p className="text-[12px] font-medium text-foreground">הגדרות</p>
      </button>
      <div className="mx-4 my-1 border-t border-border/50" />
      <button onClick={onLogout} className="flex min-h-[48px] w-full items-center gap-3 px-4 py-2.5 text-right transition-colors hover:bg-destructive/10">
        <LogOut className="h-4 w-4 text-destructive" />
        <p className="text-[12px] font-medium text-destructive">התנתק</p>
      </button>
    </div>
  </>
  );
};

/* ===== Broker Modal ===== */
const BrokerModalContent = ({ onClose, mobile }: { onClose: () => void; mobile?: boolean }) => {
  const [view, setView] = useState<"list" | "connect">("list");
  const [connecting, setConnecting] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<Array<{ id: string; name: string; login: string; server: string; platform: string }>>([]);
  const [form, setForm] = useState({ platform: "mt5", serverName: "", login: "", password: "" });

  const connected = brokers.filter(b => b.connected);
  const disconnected = brokers.filter(b => !b.connected);

  const handleConnect = async () => {
    if (!form.serverName || !form.login || !form.password) {
      toast.error("נא למלא את כל השדות");
      return;
    }
    setConnecting(true);
    try {
      const { metaApi } = await import("@/utils/metaApi");
      const account = await metaApi.addAccount({
        login: form.login,
        password: form.password,
        serverName: form.serverName,
        platform: form.platform as "mt4" | "mt5",
        name: `ZenTrade-${form.login}`,
      });
      toast.success("החשבון חובר בהצלחה! 🎉");
      setConnectedAccounts(prev => [...prev, { id: account._id || account.id, name: account.name, login: form.login, server: form.serverName, platform: form.platform }]);
      setView("list");
      setForm({ platform: "mt5", serverName: "", login: "", password: "" });
    } catch (err: any) {
      toast.error(err?.message || "חיבור נכשל. בדוק את הפרטים ונסה שוב.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className={mobile ? "" : "w-full max-w-lg rounded-3xl border border-border/50 bg-card shadow-2xl shadow-black/30 animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden"}>
      {/* Header */}
      <div className="relative px-6 pt-6 pb-5 overflow-hidden">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-primary/[0.06] rounded-full blur-[80px] pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-primary/10 blur-md" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15">
                <Plug className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">{view === "connect" ? "חבר חשבון מסחר" : "חיבורי ברוקר"}</h2>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                {view === "connect" ? "הזן את פרטי חשבון MT4/MT5 שלך" : "סנכרון אוטומטי של עסקאות ונתונים"}
              </p>
            </div>
          </div>
          <button onClick={view === "connect" ? () => setView("list") : onClose} className="haptic-press flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-secondary/50 text-muted-foreground hover:text-foreground transition-all">
            {view === "connect" ? <ChevronDown className="h-4 w-4 rotate-90" /> : <X className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {view === "connect" ? (
        /* ===== Connection Form ===== */
        <div className="px-6 pb-6 space-y-4">
          {/* Platform Select */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground/60 mb-1.5">פלטפורמה</label>
            <div className="flex gap-2">
              {[
                { value: "mt4", label: "MT4" },
                { value: "mt5", label: "MT5" },
                { value: "ctrader", label: "cTrader" },
              ].map(p => (
                <button
                  key={p.value}
                  onClick={() => setForm(f => ({ ...f, platform: p.value }))}
                  className={`haptic-press flex-1 rounded-xl border py-2.5 text-[12px] font-bold transition-all ${
                    form.platform === p.value
                      ? "bg-primary/10 border-primary/25 text-primary cyan-glow"
                      : "bg-secondary/20 border-border/30 text-muted-foreground/50 hover:border-border/50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Server Name */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="text-[11px] font-semibold text-foreground/60">שם שרת ברוקר</label>
              <div className="group relative">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground/10 text-muted-foreground/30 text-[8px] font-bold cursor-help">?</div>
                <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover:block w-[200px] rounded-lg bg-card border border-border/50 p-2 text-[9px] text-muted-foreground/60 shadow-xl z-10">
                  ניתן למצוא את שם השרת בפלטפורמת המסחר שלך תחת File → Login או בהגדרות החשבון
                </div>
              </div>
            </div>
            <input
              type="text"
              value={form.serverName}
              onChange={e => setForm(f => ({ ...f, serverName: e.target.value }))}
              placeholder="לדוגמה: ICMarkets-Live01"
              dir="ltr"
              className="w-full rounded-xl border border-border/30 bg-secondary/20 px-4 py-2.5 text-[12px] text-foreground font-mono placeholder:text-muted-foreground/20 focus:border-primary/30 focus:bg-primary/[0.02] focus:outline-none transition-all"
            />
          </div>

          {/* Account Login */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground/60 mb-1.5">מספר חשבון</label>
            <input
              type="text"
              value={form.login}
              onChange={e => setForm(f => ({ ...f, login: e.target.value }))}
              placeholder="לדוגמה: 12345678"
              dir="ltr"
              className="w-full rounded-xl border border-border/30 bg-secondary/20 px-4 py-2.5 text-[12px] text-foreground font-mono placeholder:text-muted-foreground/20 focus:border-primary/30 focus:bg-primary/[0.02] focus:outline-none transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground/60 mb-1.5">סיסמה</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="סיסמת החשבון שלך"
              dir="ltr"
              className="w-full rounded-xl border border-border/30 bg-secondary/20 px-4 py-2.5 text-[12px] text-foreground font-mono placeholder:text-muted-foreground/20 focus:border-primary/30 focus:bg-primary/[0.02] focus:outline-none transition-all"
            />
          </div>

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="haptic-press w-full rounded-xl bg-primary text-primary-foreground py-3 text-[13px] font-bold transition-all hover:bg-primary/90 cyan-glow disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center gap-2"
          >
            {connecting ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                <span>מתחבר לברוקר... יוצר חיבור מאובטח</span>
              </>
            ) : (
              <>
                <Plug className="h-4 w-4" />
                <span>חבר חשבון</span>
              </>
            )}
          </button>

          {/* Security note */}
          <div className="flex items-center gap-2 justify-center pt-1">
            <ShieldCheck className="h-3 w-3 text-primary/40" />
            <p className="text-[9px] text-muted-foreground/25 font-mono">AES-256 encrypted · read-only access</p>
          </div>
        </div>
      ) : (
        /* ===== Broker List View ===== */
        <>
          {/* MetaApi Connected Accounts */}
          {connectedAccounts.length > 0 && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-profit animate-pulse" />
                <p className="text-[10px] font-bold text-profit/80 uppercase tracking-[0.15em] font-mono">LIVE CONNECTED</p>
                <div className="flex-1 h-px bg-profit/10" />
              </div>
              <div className="space-y-2">
                {connectedAccounts.map((a) => (
                  <div key={a.id} className="group flex items-center justify-between rounded-2xl border border-profit/15 bg-profit/[0.04] px-4 py-3.5 transition-all hover:bg-profit/[0.06]">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-profit/20 bg-profit/10 text-profit font-mono font-bold text-[11px]">
                        {a.platform.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{a.server}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-profit font-mono font-medium">{a.login}</span>
                          <span className="text-[9px] text-muted-foreground/30">•</span>
                          <span className="text-[10px] text-muted-foreground/40">Live</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-profit/10 px-2 py-1 text-[9px] font-bold text-profit font-mono uppercase">Active</span>
                      <CheckCircle2 className="h-4.5 w-4.5 text-profit" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Demo Connected */}
          {connected.length > 0 && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-profit animate-pulse" />
                <p className="text-[10px] font-bold text-profit/80 uppercase tracking-[0.15em] font-mono">CONNECTED</p>
                <div className="flex-1 h-px bg-profit/10" />
              </div>
              <div className="space-y-2">
                {connected.map((b) => (
                  <div key={b.name} className="group flex items-center justify-between rounded-2xl border border-profit/15 bg-profit/[0.04] px-4 py-3.5 transition-all hover:bg-profit/[0.06]">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden border border-border/30 bg-card shadow-sm">
                        <img src={b.logo} alt={b.name} className="h-10 w-10 object-cover rounded-xl" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{b.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-profit font-mono font-medium">{b.account}</span>
                          <span className="text-[9px] text-muted-foreground/30">•</span>
                          <span className="text-[10px] text-muted-foreground/40">Live</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-profit/10 px-2 py-1 text-[9px] font-bold text-profit font-mono uppercase">Active</span>
                      <CheckCircle2 className="h-4.5 w-4.5 text-profit" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Account CTA */}
          <div className="px-6 pb-4">
            <button
              onClick={() => setView("connect")}
              className="haptic-press w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/[0.03] py-4 text-[12px] font-bold text-primary hover:bg-primary/[0.06] hover:border-primary/30 transition-all"
            >
              <Plus className="h-4 w-4" />
              חבר חשבון MT4 / MT5
            </button>
          </div>

          {/* Available */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.15em] font-mono">AVAILABLE</p>
              <div className="flex-1 h-px bg-border/30" />
              <span className="text-[10px] text-muted-foreground/20 font-mono">{disconnected.length}</span>
            </div>
            <div className={`space-y-1.5 ${mobile ? "max-h-[25vh]" : "max-h-[24vh]"} overflow-y-auto scrollbar-none`}>
              {disconnected.map((b) => (
                <div key={b.name} className="group flex items-center justify-between rounded-xl border border-border/30 bg-secondary/20 px-4 py-3 hover:bg-secondary/40 hover:border-border/50 transition-all duration-200">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden border border-border/20 bg-card shadow-sm">
                      <img src={b.logo} alt={b.name} className="h-9 w-9 object-cover rounded-lg" />
                    </div>
                    <p className="text-[12px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{b.name}</p>
                  </div>
                  <button className="haptic-press rounded-xl bg-primary/10 border border-primary/15 px-4 py-2 text-[11px] font-bold text-primary hover:bg-primary/20 hover:border-primary/25 transition-all">
                    חבר
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/30 px-6 py-3.5 flex items-center justify-between bg-secondary/10">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10">
                <ShieldCheck className="h-3 w-3 text-primary/50" />
              </div>
              <p className="text-[10px] text-muted-foreground/30 font-mono">End-to-end AES-256 encryption</p>
            </div>
            <button onClick={onClose} className="haptic-press rounded-xl border border-border/50 bg-secondary/50 px-4 py-2 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-all">
              סגור
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ===== Upgrade Modal ===== */
const plans = [
  {
    id: "pro", name: "Pro", nameEn: "PRO", price: "99", icon: Star,
    features: ["סטאפים ∞", "מנטור AI מתקדם", "Real-Time סטטיסטיקות", "בקטסטינג מלא", "Push + מייל", "ייצוא PDF"],
    missing: [],
    cta: "שדרג ל-Pro", popular: true,
  },
  {
    id: "promax", name: "ProMax", nameEn: "PROMAX", price: "199", icon: Crown,
    features: ["הכול ב-Pro +", "API גישה מלאה", "מנטור 1:1", "חוקי ברזל מותאמים", "VIP טלגרם", "תמיכה 24/7", "גישה מוקדמת"],
    missing: [],
    cta: "הצטרף ל-ProMax", popular: false,
  },
];

const UpgradeModalContent = ({ onClose, mobile }: { onClose: () => void; mobile?: boolean }) => {
  return (
    <div className={mobile ? "px-4 pb-6" : "w-full max-w-lg rounded-2xl border border-primary/15 bg-[#0A0A0F] shadow-2xl shadow-primary/5 animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden p-6"}>
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-primary/[0.06] rounded-full blur-[100px] pointer-events-none" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-foreground">שדרוג תוכנית</h2>
          <p className="text-2xs text-muted-foreground/40 mt-1">בחר את התוכנית שמתאימה לך</p>
        </div>
        <button onClick={onClose} className="haptic-press flex h-8 w-8 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.04] text-muted-foreground/40 hover:text-foreground transition-all">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className={`grid ${mobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-3"}`}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-4 flex flex-col transition-all ${
              plan.popular
                ? "border-primary/25 bg-primary/[0.04] cyan-glow"
                : "border-primary/10 bg-primary/[0.02] hover:border-primary/20"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                <span className="rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground shadow-lg shadow-primary/30">מומלץ</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${plan.popular ? "bg-primary/15 border border-primary/20" : "bg-primary/[0.06] border border-primary/10"}`}>
                <plan.icon className={`h-4.5 w-4.5 ${plan.popular ? "text-primary" : "text-muted-foreground/50"}`} />
              </div>
              <div>
                <span className="text-[13px] font-bold text-foreground block">{plan.name}</span>
                <span className="text-[9px] text-muted-foreground/30 font-mono">{plan.nameEn}</span>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground font-mono">₪{plan.price}</span>
                <span className="text-2xs text-muted-foreground/40">/חודש</span>
              </div>
            </div>
            <div className="space-y-1.5 mb-4 flex-1">
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-2xs text-muted-foreground/60">
                  <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                  {f}
                </div>
              ))}
              {plan.missing?.map((f) => (
                <div key={f} className="flex items-center gap-2 text-2xs text-muted-foreground/20 line-through">
                  <X className="h-3 w-3 text-muted-foreground/10 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <button className={`haptic-press w-full rounded-xl py-2.5 text-[12px] font-bold transition-all min-h-[44px] ${
              plan.popular
                ? "bg-primary text-primary-foreground hover:bg-primary/90 cyan-glow"
                : "bg-primary/10 border border-primary/15 text-primary hover:bg-primary/20"
            }`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardLayout;
