import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Shield, ChevronDown, Zap, Lock, X, Menu,
  Mic, ArrowUp, AlertTriangle,
  TrendingUp, Quote, Star, Brain, BookOpen,
  XCircle, ChevronRight, Sparkles, Eye, EyeOff,
  Calculator, Check, Crown, Loader2, Target, Crosshair,
  BarChart3, Flame, Swords, LineChart,
} from "lucide-react";
import zentradeLogo from "@/assets/logo.jpg";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Broker logos
import logoMt5 from "@/assets/logos/mt5-full.png";
import logoBinance from "@/assets/logos/binance-full.png";
import logoTradeLocker from "@/assets/logos/tradelocker-full.png";
import logoTradingView from "@/assets/logos/tradingview-full.png";
import logoRithmic from "@/assets/logos/rithmic-full.png";
import logoIbkr from "@/assets/logos/ibkr-full.png";
import logoTopstep from "@/assets/logos/topstepx-full.png";
import logoForex from "@/assets/logos/forex-full.png";
import logoNinjaTrader from "@/assets/logos/ninjatrader-full.png";



/* ===== Scroll Animation Hook ===== */
const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, isVisible };
};

const RevealSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

/* ===== Main Page ===== */
const AuthPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "register">("register");
  const [activeShowcase, setActiveShowcase] = useState(0);

  useEffect(() => {
    document.documentElement.classList.remove("light");
    return () => {
      const saved = localStorage.getItem("zentrade-theme");
      if (saved === "light") document.documentElement.classList.add("light");
    };
  }, []);

  const openModal = (mode: "login" | "register" = "register") => {
    setModalMode(mode);
    setShowModal(true);
    setMobileMenu(false);
  };
  const closeModal = () => setShowModal(false);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* ===== Sticky Navbar ===== */}
      <nav className="fixed top-0 right-0 left-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 overflow-hidden">
              <img src={zentradeLogo} alt="ZenTrade" className="h-6 w-6 object-contain" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">ZenTrade</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-xs text-foreground/70 hover:text-foreground transition-colors">למה ZenTrade?</a>
            <a href="#showcase" className="text-xs text-foreground/70 hover:text-foreground transition-colors">תצוגה מקדימה</a>
            <a href="#brokers" className="text-xs text-foreground/70 hover:text-foreground transition-colors">ברוקרים</a>
            <a href="#testimonials" className="text-xs text-foreground/70 hover:text-foreground transition-colors">ביקורות</a>
            <a href="#pricing" className="text-xs text-foreground/70 hover:text-foreground transition-colors">תמחור</a>
            <div className="h-4 w-px bg-border" />
            <button onClick={() => openModal("login")} className="text-xs font-medium text-foreground hover:text-primary transition-colors">התחברות</button>
            <button onClick={() => openModal("register")} className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97] shadow-lg shadow-primary/20">הרשמה חינם</button>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden relative flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 transition-all hover:bg-primary/20 active:scale-95">
            {mobileMenu ? <X className="h-4 w-4 text-primary" /> : <div className="flex flex-col items-center gap-[3px]"><span className="block h-[2px] w-4 rounded-full bg-primary" /><span className="block h-[2px] w-3 rounded-full bg-primary/60" /><span className="block h-[2px] w-4 rounded-full bg-primary" /></div>}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-2">
            <a href="#features" onClick={() => setMobileMenu(false)} className="block py-2 text-sm text-foreground/70">למה ZenTrade?</a>
            <a href="#showcase" onClick={() => setMobileMenu(false)} className="block py-2 text-sm text-foreground/70">תצוגה מקדימה</a>
            <a href="#brokers" onClick={() => setMobileMenu(false)} className="block py-2 text-sm text-foreground/70">ברוקרים</a>
            <a href="#testimonials" onClick={() => setMobileMenu(false)} className="block py-2 text-sm text-foreground/70">ביקורות</a>
            <a href="#pricing" onClick={() => setMobileMenu(false)} className="block py-2 text-sm text-foreground/70">תמחור</a>
            <div className="h-px bg-border my-2" />
            <button onClick={() => openModal("login")} className="w-full rounded-xl border border-border py-3 text-sm font-medium text-foreground">התחברות</button>
            <button onClick={() => openModal("register")} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20">הרשמה חינם</button>
          </div>
        )}
      </nav>

      {/* ================================================ */}
      {/* S1 — HERO SECTION                                 */}
      {/* ================================================ */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-primary/[0.04] rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-destructive/[0.02] rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl w-full px-4 md:px-8 py-12 md:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-right">
              <RevealSection>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-6">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] md:text-xs font-medium text-primary">SMC / ICT / Price Action Compatible</span>
                </div>
              </RevealSection>

              <RevealSection delay={100}>
                <h1 className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl font-extrabold leading-[1.15] text-foreground">
                  מיומן מסחר ידני,
                  <br />
                  <span className="bg-gradient-to-l from-primary via-primary to-accent bg-clip-text text-transparent">
                    לארכיטקטורת SMC/ICT:
                  </span>
                  <br />
                  <span className="text-foreground/90">ה-Edge שלכם נבנה פה.</span>
                </h1>
              </RevealSection>

              <RevealSection delay={200}>
                <p className="mt-5 md:mt-6 text-sm md:text-base leading-relaxed text-foreground/70 max-w-xl mx-auto lg:mx-0 lg:mr-0">
                  תפסיקו לבזבז שעות על אקסל. ZenTrade מסנכרן אוטומטית את העסקאות שלכם מכל ברוקר ומאפשר לכם לתעד, לנתח ולשלוט ברגשות שלכם בעזרת תיעוד SMC, ICT, ו-Price Action חכם.
                </p>
              </RevealSection>

              <RevealSection delay={300}>
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                  <button onClick={() => openModal("register")} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm md:text-base font-bold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/35 active:scale-[0.97]">
                    <Zap className="h-4 w-4 md:h-5 md:w-5" />
                    התחילו עכשיו — בחינם
                  </button>
                  <button onClick={() => openModal("login")} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 px-8 py-4 text-sm md:text-base font-medium text-foreground transition-all hover:bg-secondary hover:border-border/80 active:scale-[0.97]">
                    התחברות
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </button>
                </div>
                <p className="mt-3 text-[10px] md:text-xs text-foreground/50">ללא כרטיס אשראי • הגדרה תוך 2 דקות</p>
              </RevealSection>

              <RevealSection delay={400}>
                <div className="mt-10 grid grid-cols-3 gap-3">
                  {[
                    { value: "+12K", label: "סוחרים פעילים" },
                    { value: "94%", label: "שביעות רצון" },
                    { value: "9+", label: "פלטפורמות נתמכות" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-3 text-center">
                      <p className="font-heading text-lg md:text-2xl font-bold text-primary">{s.value}</p>
                      <p className="text-[9px] md:text-[10px] text-foreground/60 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </RevealSection>
            </div>

            {/* Left — Hero Screenshot (Perspective angled) */}
            <RevealSection delay={200} className="hidden lg:block">
              <div className="relative" style={{ perspective: "1200px" }}>
                <div className="absolute -inset-6 bg-gradient-to-br from-primary/15 via-transparent to-accent/10 rounded-3xl blur-2xl" />
                <div
                  className="relative rounded-2xl border border-primary/30 overflow-hidden shadow-2xl shadow-primary/20 bg-card/50 backdrop-blur-sm p-8 md:p-12"
                  style={{ transform: "rotateY(-6deg) rotateX(2deg)" }}
                >
                  <div className="space-y-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-heading text-lg md:text-xl font-bold text-primary">ZenTrade Dashboard</span>
                      <img src={zentradeLogo} alt="ZenTrade" className="h-8 w-8 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Win Rate", value: "67.4%", color: "text-emerald-400" },
                        { label: "Profit Factor", value: "2.31", color: "text-primary" },
                        { label: "Expectancy", value: "+$142", color: "text-emerald-400" },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-xl border border-border/30 bg-background/40 p-3 text-center">
                          <p className={`text-lg md:text-xl font-bold ${stat.color}`}>{stat.value}</p>
                          <p className="text-[10px] text-foreground/50 mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="h-24 rounded-lg border border-border/20 bg-background/30 flex items-end justify-between px-3 pb-2 gap-1">
                      {[40, 55, 35, 70, 60, 80, 65, 90, 75, 85, 95, 88].map((h, i) => (
                        <div key={i} className={`w-full rounded-t ${h > 60 ? "bg-primary/60" : "bg-destructive/40"}`} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </RevealSection>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1 text-muted-foreground/40">
          <span className="text-[10px] text-foreground/40">גלול למטה</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </section>

      {/* ================================================ */}
      {/* S2 — PROBLEM / SOLUTION                           */}
      {/* ================================================ */}
      <section id="features" className="border-t border-border/30 px-4 py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-destructive/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-6xl relative">
          <RevealSection>
            <div className="text-center mb-12 md:mb-16">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">למה אתם מפסידים?</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                למה Retailers מפסידים?
                <br />
                <span className="text-primary">ולמה כסף חכם מנצח.</span>
              </h2>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* The Struggle Card */}
            <RevealSection delay={100}>
              <div className="group relative rounded-2xl border border-destructive/30 bg-destructive/[0.04] backdrop-blur-sm p-6 md:p-8 h-full transition-all duration-500 hover:border-destructive/50 hover:shadow-lg hover:shadow-destructive/10">
                <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-l from-transparent via-destructive/40 to-transparent" />
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                  <XCircle className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg md:text-xl font-bold text-foreground mb-4">הבעיה הישנה <span className="text-foreground/50 text-sm">(Manual Retail)</span></h3>
                <ul className="space-y-3">
                  {[
                    "תיעוד ידני גוזל שעות ולא מדויק",
                    "סחר רגשי מחסל חשבונות",
                    "חוסר הבנה של ה-Smart Money",
                    "אקסלים מבלבלים ולא עקביים",
                    "אין הגנה מפני Revenge Trading",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-foreground/70">
                      <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealSection>

            {/* The Solution Card */}
            <RevealSection delay={250}>
              <div className="group relative rounded-2xl border border-primary/30 bg-primary/[0.04] backdrop-blur-sm p-6 md:p-8 h-full transition-all duration-500 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-l from-transparent via-primary/40 to-transparent" />
                <div className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground uppercase tracking-wider">הפתרון</div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg md:text-xl font-bold text-foreground mb-4">ה-Edge החדש <span className="text-primary text-sm">(ZenTrade)</span></h3>
                <ul className="space-y-3">
                  {[
                    "סנכרון אוטומטי מלא (9+ פלטפורמות)",
                    "Kill-Switch מופעל — הגנה מפני FOMO",
                    "פיענוח SMC/ICT אוטומטי מובנה",
                    "מנטור AI מותאם אישית 24/7",
                    "מחשבון מס ישראלי + דוח PDF",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-foreground/80">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* S3 — VISUAL FEATURE SHOWCASE ("The Inside Peek")  */}
      {/* ================================================ */}
      <section id="showcase" className="border-t border-border/30 px-4 py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/[0.03] rounded-full blur-[150px] pointer-events-none" />

        <div className="mx-auto max-w-6xl relative">
          <RevealSection>
            <div className="text-center mb-12 md:mb-16">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">הצצה לפנים</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                תראו מה <span className="text-primary">מחכה לכם</span> בפנים
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-foreground/60">
                העבירו את העכבר על כל קטגוריה לתצוגה מקדימה
              </p>
            </div>
          </RevealSection>

          {/* Category tabs + Floating stack */}
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Tabs on right */}
            <div className="lg:col-span-2 space-y-3">
              {showcaseItems.map((item, i) => (
                <RevealSection key={item.title} delay={i * 100}>
                  <button
                    onMouseEnter={() => setActiveShowcase(i)}
                    onClick={() => setActiveShowcase(i)}
                    className={`w-full text-right rounded-xl border p-4 md:p-5 transition-all duration-400 ${
                      activeShowcase === i
                        ? "border-primary/40 bg-primary/[0.06] shadow-lg shadow-primary/10"
                        : "border-border/40 bg-card/30 hover:border-primary/20 hover:bg-card/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${activeShowcase === i ? "bg-primary/20 text-primary" : "bg-muted/30 text-foreground/50"}`}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 className={`font-heading text-sm md:text-base font-bold transition-colors ${activeShowcase === i ? "text-primary" : "text-foreground"}`}>
                          {item.title}
                        </h4>
                        <p className="text-[11px] md:text-xs text-foreground/50 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </button>
                </RevealSection>
              ))}
            </div>

            {/* Feature detail cards */}
            <RevealSection delay={200} className="lg:col-span-3">
              <div className="relative min-h-[400px] md:min-h-[500px]">
                {showcaseItems.map((item, i) => (
                  <div
                    key={item.title}
                    className={`absolute inset-0 rounded-2xl border overflow-hidden transition-all duration-500 ease-out ${
                      activeShowcase === i
                        ? "opacity-100 z-30 border-primary/40 shadow-2xl shadow-primary/10 scale-100"
                        : "opacity-0 z-10 scale-95 pointer-events-none"
                    }`}
                  >
                    <div className={`h-full bg-gradient-to-br ${item.accent} bg-card/50 backdrop-blur-sm p-6 md:p-8 flex flex-col`}>
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="font-heading text-lg md:text-xl font-bold text-foreground">{item.title}</h3>
                          <p className="text-xs text-foreground/50 mt-0.5">{item.callout}</p>
                        </div>
                      </div>

                      {/* Feature list */}
                      <div className="space-y-3 flex-1">
                        {item.features.map((feature, fi) => (
                          <div
                            key={fi}
                            className="flex items-start gap-3 rounded-lg border border-border/30 bg-background/40 backdrop-blur-sm p-3 transition-all hover:border-primary/30 hover:bg-background/60"
                          >
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-xs md:text-sm text-foreground/80 leading-relaxed">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* S4 — ALL-INCLUSIVE BROKER SUPPORT                  */}
      {/* ================================================ */}
      <section id="brokers" className="border-t border-border/30 bg-card/20 px-4 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <RevealSection>
            <div className="text-center mb-12 md:mb-16">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">תאימות מלאה</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                אחד מהם, כולם ביחד.
                <br />
                <span className="text-primary">תומך בכל הברוקרים המודרניים.</span>
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-foreground/60">
                תמיכה מקיפה ואוטומטית ב-10+ פלטפורמות וברוקרים מובילים בשוק (SMC/ICT compatible).
              </p>
            </div>
          </RevealSection>

          <RevealSection delay={200}>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 md:gap-6 max-w-4xl mx-auto">
              {brokerLogos.map((broker, i) => (
                <div
                  key={broker.name}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 md:p-5 transition-all duration-300 hover:border-primary/30 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-background/60 border border-border/30 p-2">
                    <img src={broker.logo} alt={broker.name} className="h-8 w-8 md:h-10 md:w-10 object-contain" loading="lazy" />
                  </div>
                  <span className="text-[9px] md:text-[10px] font-medium text-foreground/60 text-center">{broker.name}</span>
                </div>
              ))}
            </div>
          </RevealSection>

          <RevealSection delay={400}>
            <p className="text-center mt-8 text-xs text-foreground/40">
              + DXtrade, MatchTrader, cTrader ועוד...
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ================================================ */}
      {/* S5 — TESTIMONIALS                                  */}
      {/* ================================================ */}
      <section id="testimonials" className="border-t border-border/30 px-4 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <RevealSection>
            <div className="text-center mb-12 md:mb-16">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">סוחרים אמיתיים, תוצאות אמיתיות</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                סוחרים שהפסיקו להמר <span className="text-primary">והתחילו לעבוד חכם</span>
              </h2>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {testimonials.map((t, i) => (
              <RevealSection key={t.name} delay={i * 150}>
                <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 md:p-7 h-full flex flex-col transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                  <Quote className="h-5 w-5 text-primary/20 mb-3" />
                  <p className="text-xs md:text-sm text-foreground/90 leading-relaxed flex-1">"{t.quote}"</p>
                  <div className="mt-5 pt-4 border-t border-border/30 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center border border-primary/20">
                      <span className="text-sm font-bold text-primary">{t.avatar}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-[10px] text-foreground/60">{t.role}</p>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* S6 — PRICING                                      */}
      {/* ================================================ */}
      <section id="pricing" className="border-t border-border/30 bg-card/20 px-4 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <RevealSection>
            <div className="text-center mb-12 md:mb-16">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">תמחור</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                בחר את התוכנית <span className="text-primary">שמתאימה לך</span>
              </h2>
              <p className="mt-4 max-w-xl mx-auto text-sm md:text-base text-foreground/70">התחל בחינם ושדרג כשתרגיש מוכן</p>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <RevealSection key={plan.name} delay={i * 150}>
                <div className={`relative rounded-2xl border p-6 md:p-7 h-full flex flex-col transition-all duration-300 hover:shadow-xl ${
                  plan.recommended
                    ? "border-primary/50 bg-primary/[0.06] backdrop-blur-sm shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                    : "border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 hover:shadow-primary/5"
                }`}>
                  {plan.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[10px] font-bold text-primary-foreground uppercase tracking-wider flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      מומלץ
                    </span>
                  )}
                  <div className="text-center mb-5">
                    <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${plan.recommended ? "bg-primary/20" : "bg-primary/10"}`}>
                      {plan.icon}
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground">{plan.name}</h3>
                    <p className="text-[10px] text-foreground/50 mt-1">{plan.subtitle}</p>
                  </div>
                  <div className="text-center mb-5">
                    <span className="font-heading text-3xl md:text-4xl font-extrabold text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-xs text-foreground/50 mr-1">/{plan.period}</span>}
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-foreground/70">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => openModal("register")} className={`w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.97] ${
                    plan.recommended
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                      : "border border-border bg-secondary/50 text-foreground hover:bg-secondary"
                  }`}>
                    {plan.cta}
                  </button>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* S7 — FAQ                                          */}
      {/* ================================================ */}
      <section id="faq" className="border-t border-border/30 px-4 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl">
          <RevealSection>
            <div className="text-center mb-12 md:mb-16">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">FAQ</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">שאלות נפוצות</h2>
            </div>
          </RevealSection>
          <RevealSection delay={200}>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm px-5 md:px-6 transition-all hover:border-primary/20 data-[state=open]:border-primary/30 data-[state=open]:bg-card/60">
                  <AccordionTrigger className="text-sm md:text-base font-medium text-foreground hover:no-underline py-4 md:py-5">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-xs md:text-sm text-foreground/70 leading-relaxed pb-5">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </RevealSection>
        </div>
      </section>

      {/* ================================================ */}
      {/* S8 — FINAL CTA                                    */}
      {/* ================================================ */}
      <section className="border-t border-border/30 px-4 py-20 md:py-28 lg:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <RevealSection>
          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 overflow-hidden">
                <img src={zentradeLogo} alt="ZenTrade" className="h-12 w-12 md:h-14 md:w-14 object-contain" />
              </div>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-foreground">
              מוכנים להפוך
              <br />
              <span className="text-primary">לסוחרי &quot;כסף חכם&quot;?</span>
            </h2>
            <p className="mt-4 md:mt-5 text-sm md:text-base text-foreground/70 leading-relaxed">
              הירשמו עכשיו ותעדו את העסקה הראשונה שלכם — בחינם.
            </p>
            <button onClick={() => openModal("register")} className="mt-8 md:mt-10 inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 md:px-12 md:py-5 text-sm md:text-base font-bold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/35 active:scale-[0.97]">
              <Zap className="h-5 w-5" />
              הירשמו עכשיו — בחינם
            </button>
            <p className="mt-3 text-[10px] md:text-xs text-foreground/50">ללא כרטיס אשראי • הגדרה תוך 2 דקות</p>
          </div>
        </RevealSection>
      </section>

      {/* ===== WhatsApp Chat Widget ===== */}
      <WhatsAppWidget />

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/30 px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <img src={zentradeLogo} alt="ZenTrade" className="h-5 w-5 object-contain" />
            <span className="font-heading text-sm font-bold text-foreground">ZenTrade</span>
            <span className="text-xs text-foreground/60">• AI-Powered Trading Coach</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-foreground/60">
            <Link to="/terms" className="hover:text-foreground transition-colors">תנאי שימוש</Link>
          </div>
          <p className="text-[10px] text-foreground/40">© 2026 ZenTrade. כל הזכויות שמורות.</p>
        </div>
      </footer>

      {/* ===== AUTH MODAL ===== */}
      {showModal && <AuthModal onClose={closeModal} initialMode={modalMode} />}
    </div>
  );
};

/* ===== Auth Modal ===== */
const AuthModal = ({ onClose, initialMode }: { onClose: () => void; initialMode: "login" | "register" }) => {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, updateProfile } = useAuth();

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) { toast.error("שגיאה בהתחברות עם Google"); return; }
      if (result.redirected) return;
      toast.success("התחברת בהצלחה!");
      navigate("/dashboard");
    } catch { toast.error("שגיאה לא צפויה"); } finally { setSubmitting(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("הזן את כתובת האימייל שלך"); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) { toast.error(error.message); } else { setResetSent(true); toast.success("נשלח קישור לאיפוס סיסמה לאימייל שלך"); }
    } catch { toast.error("שגיאה לא צפויה"); } finally { setSubmitting(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) { toast.error(error.message === "Invalid login credentials" ? "אימייל או סיסמה לא נכונים" : error.message); return; }
        toast.success("התחברת בהצלחה!");
        navigate("/dashboard");
      } else {
        if (password.length < 6) { toast.error("הסיסמה חייבת להיות לפחות 6 תווים"); return; }
        const { error } = await signUp(email, password);
        if (error) { toast.error(error.message); return; }
        if (name) await updateProfile({ full_name: name });
        localStorage.removeItem("zentrade-onboarded");
        toast.success("החשבון נוצר בהצלחה!");
        navigate("/dashboard");
      }
    } catch (err: any) { toast.error(err?.message || "שגיאה לא צפויה"); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4" dir="rtl">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={onClose} />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-primary/[0.08] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-[95%] max-w-[420px] max-h-[90vh] overflow-y-auto scrollbar-none">
        <div className="relative rounded-3xl border border-border/30 bg-card/80 backdrop-blur-2xl p-6 md:p-8 shadow-2xl shadow-primary/[0.06] overflow-hidden">
          <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <button onClick={onClose} className="absolute top-3 left-3 md:top-4 md:left-4 rounded-xl p-2 text-foreground/30 hover:text-foreground hover:bg-muted/20 transition-all">
            <X className="h-4 w-4" />
          </button>

          <div className="relative text-center mb-6 md:mb-7">
            <div className="flex justify-center mb-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/10 overflow-hidden">
                <img src={zentradeLogo} alt="ZenTrade" className="h-8 w-8 object-contain" />
              </div>
            </div>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground">
              {forgotMode ? "איפוס סיסמה" : isLogin ? "ברוכים השבים" : "צור חשבון חדש"}
            </h2>
            <p className="text-[11px] text-foreground/40 mt-1">
              {forgotMode ? "נשלח לך קישור לאיפוס" : isLogin ? "התחבר לחשבון ZenTrade שלך" : "הצטרף ל-12,000+ סוחרים מקצועיים"}
            </p>
          </div>

          {forgotMode ? (
            resetSent ? (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">הקישור נשלח!</p>
                <p className="text-xs text-foreground/50">בדוק את תיבת האימייל שלך</p>
                <button onClick={() => { setForgotMode(false); setResetSent(false); }} className="mt-4 text-xs text-primary hover:underline">חזרה להתחברות</button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-foreground/50">אימייל</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" dir="ltr"
                    className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm text-foreground text-left placeholder:text-foreground/20 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <button type="submit" disabled={submitting} className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60">
                  {submitting ? "שולח..." : "שלח קישור לאיפוס"}
                </button>
                <p className="text-center"><button type="button" onClick={() => setForgotMode(false)} className="text-xs text-primary hover:underline">חזרה להתחברות</button></p>
              </form>
            )
          ) : (
            <>
              <div className="mb-6 flex gap-1 rounded-2xl bg-muted/20 border border-border/30 p-1">
                {[{ label: "התחברות", login: true }, { label: "הרשמה", login: false }].map(({ label, login }) => (
                  <button key={label} onClick={() => setIsLogin(login)} className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all duration-300 ${isLogin === login ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-foreground/40 hover:text-foreground/60"}`}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5 mb-5">
                <button onClick={handleGoogleSignIn} disabled={submitting} className="group flex w-full items-center justify-center gap-3 rounded-xl border border-border/40 bg-muted/10 py-3 text-xs font-medium text-foreground/80 transition-all hover:bg-muted/20 hover:border-border/60 disabled:opacity-60">
                  <GoogleIcon /> המשך עם Google
                </button>
                <button className="group flex w-full items-center justify-center gap-3 rounded-xl border border-border/40 bg-muted/10 py-3 text-xs font-medium text-foreground/80 transition-all hover:bg-muted/20 hover:border-border/60">
                  <AppleIcon /> המשך עם Apple
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-border/50" />
                <span className="text-[10px] text-foreground/30 font-medium">או עם אימייל</span>
                <div className="h-px flex-1 bg-border/50" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {!isLogin && (
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-foreground/50">שם מלא</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="הכנס את שמך"
                      className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-foreground/20 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-foreground/50">אימייל</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" dir="ltr"
                    className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm text-foreground text-left placeholder:text-foreground/20 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-foreground/50">סיסמה</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr"
                      className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 pr-11 text-sm text-foreground text-left placeholder:text-foreground/20 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground/50 transition-colors p-1">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {isLogin && (
                  <div className="text-left">
                    <button type="button" onClick={() => setForgotMode(true)} className="text-[11px] text-primary/80 hover:text-primary hover:underline transition-colors">שכחת סיסמה?</button>
                  </div>
                )}
                <button type="submit" disabled={submitting} className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "מעבד..." : isLogin ? "היכנס לחשבון" : "צור חשבון חינם"}
                </button>
              </form>

              <p className="mt-5 text-center text-[11px] text-foreground/30">
                {isLogin ? "אין לך חשבון?" : "כבר יש לך חשבון?"}{" "}
                <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">{isLogin ? "הירשם עכשיו" : "התחבר"}</button>
              </p>
              <div className="mt-5 flex items-center justify-center gap-4 text-[9px] text-foreground/20">
                <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> SSL מאובטח</span>
                <span>•</span><span>256-bit הצפנה</span><span>•</span><span>GDPR</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ===== Sub-Components ===== */
const GoogleIcon = () => (
  <svg className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

/* ===== Static Data ===== */

const showcaseItems = [
  {
    title: "אנציקלופדיה של אסטרטגיות",
    desc: "תיעוד מקיף ל-SMC, ICT, Price Action, Order Flow, קווי מגמה, ותמיכה.",
    callout: "כל אסטרטגיה. כל סטאפ. הכל מתועד ומנותח.",
    icon: <BookOpen className="h-5 w-5" />,
    features: [
      "תיעוד אוטומטי של סטאפים: BOS, CHoCH, FVG, Order Blocks",
      "זיהוי Liquidity Sweeps ו-Inducement Zones",
      "מעקב אחרי Entry Models: Optimal Trade Entry, Breaker Blocks",
      "תמיכה ב-Multi-Timeframe Analysis — מ-Monthly ועד 1M",
      "תיוג חכם: Session (London/NY), Kill Zones, News Events",
      "השוואת ביצועים בין אסטרטגיות שונות לאורך זמן",
    ],
    accent: "from-cyan-500/20 to-blue-600/20",
  },
  {
    title: "ניהול סיכונים חכם",
    desc: "ה-Kill-Switch שלכם מופעל. הגנה אוטומטית מפני Revenge Trading.",
    callout: "Kill-Switch פעיל — הגנת חשבון אוטומטית 24/7.",
    icon: <Shield className="h-5 w-5" />,
    features: [
      "Kill-Switch אוטומטי — נעילת מסחר אחרי הפסד יומי מוגדר",
      "התראות Tilt Detection בזמן אמת על סחר רגשי",
      "מעקב Max Drawdown יומי / שבועי / חודשי",
      "הגבלת כמות עסקאות יומית (Over-Trading Protection)",
      "דוח סיכונים אישי: Risk/Reward Ratio, Win Rate, Expectancy",
      "FOMO Guard — חסימה אוטומטית בזמני חדשות High-Impact",
    ],
    accent: "from-rose-500/20 to-red-600/20",
  },
  {
    title: "דוחות ביצועים מתקדמים",
    desc: "כל הדאטה שלכם, מכל הברוקרים, במקום אחד.",
    callout: "ניתוח Win Rate, Profit Factor, Drawdown ועוד.",
    icon: <BarChart3 className="h-5 w-5" />,
    features: [
      "Heatmap — ביצועים לפי יום ושעה (מתי אתם הכי רווחיים?)",
      "Profit Factor, Expectancy, Sharpe Ratio — הכל אוטומטי",
      "השוואת Long vs Short — ביצועים לפי כיוון עסקה",
      "ניתוח Win Rate לפי סטאפ, Session, ו-Timeframe",
      "גרפי Equity Curve עם Drawdown Overlay",
      "דוחות שבועיים/חודשיים מוכנים לייצוא PDF",
    ],
    accent: "from-emerald-500/20 to-green-600/20",
  },
  {
    title: "מחשבון מס ישראלי",
    desc: "חישוב 25% מס רווחי הון — אוטומטי, מדויק, עם דוח PDF.",
    callout: "חסכו שעות של חישובים — הכל אוטומטי.",
    icon: <Calculator className="h-5 w-5" />,
    features: [
      "חישוב 25% מס רווחי הון — לפי חוק ישראלי",
      "קיזוז הפסדים אוטומטי מול רווחים (Netting)",
      "הפחתת עמלות ברוקר מהרווח החייב במס",
      "ייצוא דוח PDF מקצועי — מוכן לרואה חשבון",
      "תמיכה במט\"ח, מניות, קריפטו ו-CFDs",
      "חישוב שיעור מס אפקטיבי בזמן אמת",
    ],
    accent: "from-yellow-500/20 to-amber-600/20",
  },
];

const brokerLogos = [
  { name: "MetaTrader 5", logo: logoMt5 },
  { name: "Binance", logo: logoBinance },
  { name: "TradeLocker", logo: logoTradeLocker },
  { name: "TradingView", logo: logoTradingView },
  { name: "Rithmic", logo: logoRithmic },
  { name: "Interactive Brokers", logo: logoIbkr },
  { name: "TopstepX", logo: logoTopstep },
  { name: "Forex.com", logo: logoForex },
  { name: "NinjaTrader", logo: logoNinjaTrader },
];

const testimonials = [
  {
    name: "דניאל כ.",
    avatar: "ד",
    role: "סוחר SMC Funded • FTMO",
    quote: "המערכת הצילה אותי מ-FOMO פעם אחר פעם. מאז שהתחלתי להשתמש ב-ZenTrade, ה-Win Rate שלי עלה ב-15%. התיעוד האוטומטי של סטאפים SMC חסך לי שעות.",
  },
  {
    name: "שירה מ.",
    avatar: "ש",
    role: "Price Action Trader • 4 שנות ניסיון",
    quote: "העובדה שהמערכת נועלת אותי כשאני מתקרבת ל-Drawdown היומי הצילה לי את חשבון ה-Prop Firm. הניתוח של דפוסי Price Action פשוט מדהים.",
  },
  {
    name: "אלון ר.",
    avatar: "א",
    role: "Order Flow Trader • קריפטו + מדדים",
    quote: "היומן האוטומטי חסך לי שעות כל שבוע. במקום לרשום עסקאות ידנית, אני מקבל ניתוח מלא עם תובנות AI. הסנכרון מ-Rithmic ו-TradingView עובד חלק.",
  },
];

const pricingPlans = [
  {
    name: "מתחיל",
    subtitle: "לסוחרים שרק מתחילים",
    price: "חינם",
    period: null,
    icon: <Zap className="h-5 w-5 text-primary" />,
    recommended: false,
    cta: "התחל בחינם",
    features: ["יומן מסחר בסיסי", "עד 30 עסקאות בחודש", "ניתוח סטטיסטי בסיסי", "לוח כלכלי"],
  },
  {
    name: "מקצוען",
    subtitle: "לסוחרים רציניים",
    price: "₪99",
    period: "חודש",
    icon: <Shield className="h-5 w-5 text-primary" />,
    recommended: true,
    cta: "שדרג למקצוען",
    features: ["עסקאות ללא הגבלה", "מנטור AI מתקדם", "Bodyguard & FOMO Detection", "מחשבון מס ישראלי + PDF", "יומן קולי Voice AI", "ניתוח סטטיסטי מלא"],
  },
  {
    name: "פרופ-פירם",
    subtitle: "לסוחרים ממומנים ומקצועיים",
    price: "₪199",
    period: "חודש",
    icon: <Crown className="h-5 w-5 text-primary" />,
    recommended: false,
    cta: "שדרג לאליט",
    features: ["הכל בחבילת מקצוען", "סימולטור בקטסטינג AI", "גישה ל-API מלאה", "הגנת Prop Firm אוטומטית", "קבוצת VIP בטלגרם", "תמיכה עדיפה 24/7"],
  },
];

const faqs = [
  { q: "האם המידע שלי מאובטח?", a: "בהחלט. אנחנו משתמשים בהצפנה מקצה לקצה (AES-256) ולא שומרים סיסמאות ברוקר. החיבור מתבצע דרך API keys עם הרשאות קריאה בלבד." },
  { q: "האם צריך לחבר את הברוקר ישירות?", a: "אפשר לחבר דרך API לסנכרון אוטומטי, אבל זה לא חובה. אפשר גם לייבא עסקאות ידנית או להעלות קבצי CSV." },
  { q: "איזה אסטרטגיות מסחר נתמכות?", a: "ZenTrade תומך בכל אסטרטגיה מודרנית: SMC, ICT, Price Action, Order Flow, קווי מגמה, תמיכה/התנגדות, ועוד. המערכת מזהה ומתעדת אוטומטית." },
  { q: "האם השירות בחינם?", a: "יש חבילה חינמית שכוללת את רוב הכלים הבסיסיים. חבילות Premium מוסיפות ניתוח AI מתקדם, התראות בזמן אמת, והגנת Prop Firm אוטומטית." },
  { q: "באילו פלטפורמות מסחר אתם תומכים?", a: "MetaTrader 5, Binance, TradeLocker, TradingView, Rithmic, Interactive Brokers, TopstepX, NinjaTrader, Forex.com ועוד. הרשימה מתרחבת כל הזמן." },
];

export default AuthPage;
