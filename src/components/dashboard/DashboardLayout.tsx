import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Bot, ShieldCheck,
  LogOut, ChevronDown, Plug, Menu, X, Settings, Sun, Moon, Zap,
  Crosshair, PieChart, History, CheckCircle2,
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
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem("zentrade-onboarded") !== "true";
  });
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
    <div className="flex h-screen w-full overflow-hidden" dir="rtl">
      {/* ===== Desktop Sidebar (hidden on mobile) ===== */}
      <aside className="hidden md:flex h-full w-[260px] flex-col border-l border-border/15 bg-sidebar/80 backdrop-blur-xl shrink-0">
        {/* Brand */}
        <div className="flex items-center border-b border-border px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/25">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground tracking-tight">ZenTrade</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`interactive-btn group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary/12 text-primary shadow-[inset_0_0_20px_hsl(217_72%_53%/0.06)]"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <item.icon className={`h-[18px] w-[18px] transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                {item.label}
                {active && <span className="mr-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(217_72%_53%/0.6)]" />}
              </button>
            );
          })}
          {/* Broker Connect */}
          <div className="pt-2 mt-2 border-t border-border/40">
            <button
              onClick={() => setBrokerModal(true)}
              className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-primary/8 hover:text-primary"
            >
              <Plug className="h-[18px] w-[18px] text-muted-foreground group-hover:text-primary transition-colors" />
              חבר ברוקר
              <span className="mr-auto rounded bg-accent/15 px-1.5 py-0.5 text-[8px] font-bold text-accent">2</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-3 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-[18px] w-[18px]" />
            התנתק
          </button>
        </div>
      </aside>

      {/* ===== Main Area ===== */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between glass-header px-4 py-2.5 md:px-6 md:py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Mobile brand (replaces hamburger) */}
            <div className="flex md:hidden items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <span className="font-heading text-sm font-bold text-foreground">ZenTrade</span>
            </div>
            <h1 className="hidden md:block font-heading text-sm font-semibold text-foreground md:text-base">
              {navItems.find((n) => n.id === activeNav)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Status */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="text-[11px] font-medium text-accent">AI פעיל</span>
            </div>

            {/* Theme */}
            <button
              onClick={() => setDark(!dark)}
              className="interactive-btn flex h-10 w-10 md:h-9 md:w-9 items-center justify-center rounded-xl border border-border/20 bg-muted/15 text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:border-primary/20 hover:shadow-[0_0_12px_hsl(var(--primary)/0.1)]"
              title={dark ? "מצב בהיר" : "מצב כהה"}
            >
              {dark ? <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-45" /> : <Moon className="h-4 w-4 transition-transform duration-300 hover:-rotate-12" />}
            </button>

            {/* User */}
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-2 py-1.5 transition-all hover:bg-muted/40 md:px-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                  י
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-xs font-semibold text-foreground leading-none">יהונתן</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">חשבון Pro</p>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground hidden md:block transition-transform duration-200 ${userMenu ? "rotate-180" : ""}`} />
              </button>

              {/* User Dropdown — Bottom sheet on mobile, dropdown on desktop */}
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-40 bg-background/40 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none" onClick={() => setUserMenu(false)} />

                  {/* Desktop dropdown */}
                  <div className="hidden md:block absolute left-0 md:left-auto md:right-0 top-full mt-2 w-56 z-50 rounded-2xl border border-border/30 bg-secondary/95 backdrop-blur-xl shadow-2xl shadow-background/60 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <UserMenuContent
                      onClose={() => setUserMenu(false)}
                      onSettings={() => { setUserMenu(false); setActiveNav("settings"); }}
                      onLogout={() => { setUserMenu(false); navigate("/"); }}
                    />
                  </div>

                  {/* Mobile bottom sheet */}
                  <div className="md:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-border/20 bg-secondary/98 backdrop-blur-xl animate-in slide-in-from-bottom duration-300 overflow-hidden">
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
        <main className="flex-1 overflow-y-auto bg-background p-3 pb-20 md:p-6 md:pb-6">
          {renderContent()}
        </main>
      </div>

      {/* ===== Mobile Bottom Tab Bar ===== */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border/30 bg-sidebar/85 backdrop-blur-xl">
        <div className="flex items-center justify-around px-1 pt-1.5 pb-[env(safe-area-inset-bottom,8px)]">
          {bottomTabs.map((tab) => {
            const active = tab.id !== "more" && activeNav === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNav(tab.id)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[56px] rounded-xl transition-all duration-200 ${
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
const BrokerModalContent = ({ onClose, mobile }: { onClose: () => void; mobile?: boolean }) => (
  <div className={mobile ? "" : "w-full max-w-lg rounded-2xl border border-border/60 bg-secondary/95 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-4 duration-400"}>
    {!mobile && <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />}

    <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-[-3px] rounded-xl bg-primary/10 animate-pulse" style={{ animationDuration: "3s" }} />
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/25">
            <Plug className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">חיבורי ברוקר ו-API</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">חבר את פלטפורמת המסחר שלך</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="flex h-10 w-10 md:h-8 md:w-8 items-center justify-center rounded-xl md:rounded-lg border border-border/40 bg-muted/20 text-muted-foreground hover:text-foreground transition-all"
      >
        <X className="h-4 w-4" />
      </button>
    </div>

    <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/30 bg-muted/5">
      <span className="text-[10px] text-muted-foreground">
        <span className="text-accent font-semibold">{brokers.filter(b => b.connected).length}</span> מתוך {brokers.length} מחוברות
      </span>
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="text-[9px] text-accent font-medium">מוכן למסחר</span>
      </div>
    </div>

    <div className={mobile ? "max-h-[50vh] overflow-y-auto" : "max-h-[55vh] overflow-y-auto"}>
      {brokers.map((b, i) => (
        <div
          key={b.name}
          className={`flex items-center justify-between gap-3 px-5 py-4 md:py-3.5 transition-all hover:bg-primary/[0.03] min-h-[56px] md:min-h-0 ${
            i < brokers.length - 1 ? "border-b border-border/20" : ""
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex h-11 w-11 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl border text-[10px] font-bold ${
              b.connected
                ? "border-accent/25 bg-accent/10 text-accent"
                : "border-border/60 bg-muted/20 text-muted-foreground"
            }`}>
              {b.initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{b.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-flex h-1.5 w-1.5 rounded-full ${b.connected ? "bg-accent" : "bg-muted-foreground/30"}`} />
                <span className={`text-[9px] font-medium ${b.connected ? "text-accent" : "text-muted-foreground/40"}`}>
                  {b.connected ? `מחובר • ${b.account}` : "מנותק"}
                </span>
              </div>
            </div>
          </div>
          <button className={`shrink-0 rounded-xl md:rounded-lg px-4 py-2.5 md:px-3.5 md:py-1.5 text-[11px] md:text-[10px] font-semibold transition-all min-h-[44px] md:min-h-0 ${
            b.connected
              ? "border border-accent/20 bg-accent/[0.06] text-accent"
              : "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
          }`}>
            {b.connected ? "מחובר ✓" : "הגדר חיבור"}
          </button>
        </div>
      ))}
    </div>

    <div className="border-t border-border/30 px-5 py-3.5 md:py-3 flex items-center justify-between">
      <p className="text-[9px] text-muted-foreground/40">מוצפן בתקן AES-256</p>
      <button
        onClick={onClose}
        className="rounded-xl md:rounded-lg border border-border/40 bg-muted/15 px-4 py-2.5 md:px-3 md:py-1.5 text-[11px] md:text-[10px] font-medium text-muted-foreground hover:text-foreground transition-all min-h-[44px] md:min-h-0"
      >
        סגור
      </button>
    </div>
  </div>
);

export default DashboardLayout;
