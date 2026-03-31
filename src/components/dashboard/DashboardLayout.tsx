import { useState, useEffect } from "react";
import {
  LayoutDashboard, BookOpen, Bot, FlaskConical, ShieldCheck,
  LogOut, ChevronDown, Plug, Menu, X, Settings, Sun, Moon,
  Crosshair, PieChart, History,
} from "lucide-react";
import SettingsPage from "@/pages/SettingsPage";
import SetupsPage from "@/pages/SetupsPage";
import StatsPage from "@/pages/StatsPage";
import HomeDashboard from "@/components/dashboard/HomeDashboard";
import OnboardingModal from "@/components/dashboard/OnboardingModal";

const navItems = [
  { id: "dashboard", label: "דשבורד ראשי", icon: LayoutDashboard },
  { id: "setups", label: "הסטאפים שלי", icon: Crosshair },
  { id: "journal", label: "יומן מסחר", icon: BookOpen },
  { id: "stats", label: "סטטיסטיקות וביצועים", icon: PieChart },
  { id: "mentor", label: "מנטור AI", icon: Bot },
  { id: "backtesting", label: "בקטסטינג", icon: History },
  { id: "protection", label: "הגדרות הגנה", icon: ShieldCheck },
  { id: "settings", label: "הגדרות", icon: Settings },
];

const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const renderContent = () => {
    if (activeNav === "dashboard") return <HomeDashboard userName="יהונתן" />;
    if (activeNav === "settings") return <SettingsPage />;
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
      {/* ===== Mobile Overlay ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== Sidebar ===== */}
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-[260px] flex-col border-l border-border bg-sidebar/80 backdrop-blur-xl transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/25">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground tracking-tight">ZenTrade</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  setSidebarOpen(false);
                }}
                className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary/12 text-primary shadow-[inset_0_0_20px_hsl(217_72%_53%/0.06)]"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <item.icon className={`h-[18px] w-[18px] transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                {item.label}
                {active && (
                  <span className="mr-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(217_72%_53%/0.6)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border px-3 py-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-[18px] w-[18px]" />
            התנתק
          </button>
        </div>
      </aside>

      {/* ===== Main Area ===== */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-border bg-sidebar/50 backdrop-blur-lg px-4 py-3 md:px-6">
          {/* Right side: mobile hamburger + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 md:hidden"
            >
              <Menu className="h-4 w-4 text-primary" />
            </button>
            <h1 className="font-heading text-sm font-semibold text-foreground md:text-base">
              {navItems.find((n) => n.id === activeNav)?.label}
            </h1>
          </div>

          {/* Left: AI Status + Connect Broker + Theme + Profile */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* AI Status Badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="text-[11px] font-medium text-accent">סטטוס AI: פעיל</span>
            </div>

            {/* Connect Broker */}
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-[11px] font-medium text-foreground transition-all hover:bg-muted/60 hover:border-border/80 md:px-4 md:py-2 md:text-xs">
              <Plug className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">חבר ברוקר</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/20 text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
              title={dark ? "מצב בהיר" : "מצב כהה"}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* User Profile */}
            <button className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-2.5 py-1.5 transition-all hover:bg-muted/40 md:px-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary md:h-8 md:w-8">
                י
              </div>
              <div className="hidden md:block text-right">
                <p className="text-xs font-semibold text-foreground leading-none">יהונתן</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">חשבון Pro</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          {renderContent()}
        </main>
      </div>
      {showOnboarding && (
        <OnboardingModal userName="יהונתן" onComplete={completeOnboarding} />
      )}
    </div>
  );
};

export default DashboardLayout;
