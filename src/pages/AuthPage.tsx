import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Shield, BarChart3, ChevronDown, Bot, Zap, Lock, X, Menu,
  FlaskConical, Mic, Newspaper, ArrowUp, Activity, AlertTriangle,
  CheckCircle2, TrendingUp, Quote, Star, Brain, BookOpen, Calendar,
  XCircle, ChevronRight, Sparkles, MapPin, Eye, EyeOff,
  Calculator, PlayCircle, Check, Crown,
} from "lucide-react";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ===== Main Page ===== */
const AuthPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "register">("register");
  const isEditorCanvas = false; // Disabled — was blocking buttons in preview iframe

  // Force dark mode on landing page
  useEffect(() => {
    document.documentElement.classList.remove("light");
    return () => {
      // Restore theme preference when leaving
      const saved = localStorage.getItem("zentrade-theme");
      if (saved === "light") document.documentElement.classList.add("light");
    };
  }, []);

  const openModal = (mode: "login" | "register" = "register") => {
    if (isEditorCanvas) return;
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">ZenTrade</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-xs text-foreground/70 hover:text-foreground transition-colors">למה ZenTrade?</a>
            <a href="#testimonials" className="text-xs text-foreground/70 hover:text-foreground transition-colors">ביקורות</a>
            <a href="#faq" className="text-xs text-foreground/70 hover:text-foreground transition-colors">שאלות נפוצות</a>
            <div className="h-4 w-px bg-border" />
            <button
              onClick={() => openModal("login")}
              className="text-xs font-medium text-foreground hover:text-primary transition-colors"
            >
              התחברות
            </button>
            <button
              onClick={() => openModal("register")}
              className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97] shadow-lg shadow-primary/20"
            >
              הרשמה חינם
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => !isEditorCanvas && setMobileMenu(!mobileMenu)}
            className="md:hidden relative flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 transition-all hover:bg-primary/20 active:scale-95"
          >
            {mobileMenu ? (
              <X className="h-4 w-4 text-primary" />
            ) : (
              <div className="flex flex-col items-center gap-[3px]">
                <span className="block h-[2px] w-4 rounded-full bg-primary" />
                <span className="block h-[2px] w-3 rounded-full bg-primary/60" />
                <span className="block h-[2px] w-4 rounded-full bg-primary" />
              </div>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {!isEditorCanvas && mobileMenu && (
          <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-2">
            <a href="#features" onClick={() => setMobileMenu(false)} className="block py-2 text-sm text-foreground/70">למה ZenTrade?</a>
            <a href="#testimonials" onClick={() => setMobileMenu(false)} className="block py-2 text-sm text-foreground/70">ביקורות</a>
            <a href="#faq" onClick={() => setMobileMenu(false)} className="block py-2 text-sm text-foreground/70">שאלות נפוצות</a>
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
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl w-full px-4 md:px-8 py-12 md:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Right — Text */}
            <div className="text-center lg:text-right">
              <RevealSection>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-6">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] md:text-xs font-medium text-primary">Powered by AI</span>
                </div>
              </RevealSection>

              <RevealSection delay={100}>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-foreground">
                  שדרג את המסחר שלך
                  <br />
                  <span className="bg-gradient-to-l from-primary via-primary to-accent bg-clip-text text-transparent">
                    עם אנליטיקס AI
                  </span>
                </h1>
              </RevealSection>

              <RevealSection delay={200}>
                <p className="mt-5 md:mt-6 text-sm md:text-base lg:text-lg leading-relaxed text-foreground/80 max-w-xl mx-auto lg:mx-0 lg:mr-0">
                  תפסיק לנחש. תן ל-AI שלנו לנתח את העסקאות שלך, לזהות את הטעויות, ולאמן אותך לרווחיות עקבית.
                </p>
              </RevealSection>

              <RevealSection delay={300}>
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                  <button
                    onClick={() => openModal("register")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm md:text-base font-bold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/35 active:scale-[0.97]"
                  >
                    <Zap className="h-4 w-4 md:h-5 md:w-5" />
                    התחל בחינם
                  </button>
                  <button
                    onClick={() => openModal("login")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 px-8 py-4 text-sm md:text-base font-medium text-foreground transition-all hover:bg-secondary hover:border-border/80 active:scale-[0.97]"
                  >
                    התחברות
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </button>
                </div>
                <p className="mt-3 text-[10px] md:text-xs text-foreground/50">ללא כרטיס אשראי • הגדרה תוך 2 דקות</p>
              </RevealSection>

              {/* Trust stats */}
              <RevealSection delay={400}>
                <div className="mt-10 grid grid-cols-3 gap-3">
                  {[
                    { value: "+12K", label: "סוחרים פעילים" },
                    { value: "94%", label: "שביעות רצון" },
                    { value: "-38%", label: "הפסדים מיותרים", accent: true },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-3 text-center">
                      <p className={`font-heading text-lg md:text-2xl font-bold ${s.accent ? "text-primary" : "text-foreground"}`}>{s.value}</p>
                      <p className="text-[9px] md:text-[10px] text-foreground/60 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </RevealSection>
            </div>

            {/* Left — Dashboard Preview */}
            <RevealSection delay={200} className="hidden lg:block">
              <div className="relative">
                {/* Glow behind */}
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 rounded-3xl blur-xl" />

                <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40">
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between border-b border-border/50 px-5 py-3 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <span className="font-heading text-sm font-bold text-foreground">ZenTrade</span>
                      <div className="h-4 w-px bg-border" />
                      <span className="text-xs text-foreground/60">דשבורד ראשי</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-[10px] font-medium text-accent">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                        AI Active
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-3">
                      <DashStat label="רווח יומי" value="+$1,247" sub="+8.3%" positive />
                      <DashStat label="עסקאות היום" value="7" sub="3 פתוחות" />
                      <DashStat label="Win Rate" value="71%" sub="+5%" positive />
                      <DashStat label="Profit Factor" value="2.4" sub="מצוין" positive />
                    </div>

                    {/* Chart */}
                    <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">Equity Curve — 30 ימים</span>
                        <div className="flex items-center gap-1 text-accent">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span className="text-xs font-semibold">+12.4%</span>
                        </div>
                      </div>
                      <div className="flex items-end gap-[3px] h-28">
                        {equityCurve.map((h, i) => (
                          <div key={i} className="flex-1 rounded-sm bg-primary/50 hover:bg-primary transition-colors" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-start gap-3">
                        <Bot className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-primary">המלצת AI</p>
                          <p className="text-[10px] text-foreground/70 mt-1">ביצעת 3 עסקאות מוצלחות. מומלץ לעצור כאן ולנצל את היום הטוב. 🎯</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
      {/* S2 — INTEGRATIONS MARQUEE                         */}
      {/* ================================================ */}
      <section className="border-t border-border/30 bg-card/30 px-4 py-10 md:py-14">
        <RevealSection>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs text-foreground/70 mb-6">מתחבר בלייב לבורסות המובילות</p>
            <FadingCarousel />
          </div>
        </RevealSection>
      </section>

      {/* ================================================ */}
      {/* S3 — WHY ZENTRADE (FEATURES)                      */}
      {/* ================================================ */}
      <section id="features" className="border-t border-border/30 px-4 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <RevealSection>
            <div className="text-center mb-12 md:mb-16">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">למה ZenTrade?</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                הכלים שמפרידים בין <span className="text-primary">מנצחים</span> למפסידים
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-foreground/70 leading-relaxed">
                שישה כלים קריטיים, פלטפורמה אחת. הכל מונע AI.
              </p>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((f, i) => (
              <RevealSection key={f.title} delay={i * 150}>
                <div className={`group relative rounded-2xl border bg-card/50 backdrop-blur-sm p-6 md:p-8 transition-all duration-500 hover:shadow-xl h-full ${
                  (f as any).highlight
                    ? "border-primary/40 hover:border-primary/60 hover:shadow-primary/10 ring-1 ring-primary/10"
                    : "border-border/50 hover:border-primary/30 hover:bg-card/80 hover:shadow-primary/5"
                }`}>
                  <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-l from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {(f as any).highlight && (
                    <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground uppercase tracking-wider">חדש</span>
                  )}
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-primary ${
                    (f as any).highlight ? "bg-primary/20" : "bg-primary/10"
                  }`}>
                    {f.icon}
                  </div>
                  <h3 className="font-heading text-base md:text-lg font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-xs md:text-sm text-foreground/70 leading-relaxed">{f.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>

          {/* What's NOT included */}
          <RevealSection delay={500}>
            <div className="mt-12 md:mt-16 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 md:p-8 max-w-3xl mx-auto">
              <h3 className="font-heading text-base md:text-lg font-bold text-foreground mb-4 text-center">מה לא תמצא כאן 🚫</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {notIncluded.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-xs md:text-sm text-foreground/70">
                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ================================================ */}
      {/* S4 — SOCIAL PROOF / TESTIMONIALS                  */}
      {/* ================================================ */}
      <section id="testimonials" className="border-t border-border/30 bg-card/20 px-4 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <RevealSection>
            <div className="text-center mb-12 md:mb-16">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">סוחרים אמיתיים, תוצאות אמיתיות</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                הם הפסיקו להפסיד. <span className="text-primary">מה איתך?</span>
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
      {/* S5 — FAQ                                          */}
      {/* ================================================ */}
      <section id="faq" className="border-t border-border/30 px-4 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl">
          <RevealSection>
            <div className="text-center mb-12 md:mb-16">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">FAQ</p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                שאלות נפוצות
              </h2>
            </div>
          </RevealSection>

          <RevealSection delay={200}>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm px-5 md:px-6 transition-all hover:border-primary/20 data-[state=open]:border-primary/30 data-[state=open]:bg-card/60">
                  <AccordionTrigger className="text-sm md:text-base font-medium text-foreground hover:no-underline py-4 md:py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs md:text-sm text-foreground/70 leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </RevealSection>
        </div>
      </section>

      {/* ================================================ */}
      {/* S6 — FINAL CTA                                    */}
      {/* ================================================ */}
      <section className="border-t border-border/30 px-4 py-20 md:py-28 lg:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <RevealSection>
          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <Shield className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              </div>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-foreground">
              מוכן להפסיק להפסיד כסף
              <br />
              <span className="text-primary">על סטאפים רעים?</span>
            </h2>
            <p className="mt-4 md:mt-5 text-sm md:text-base text-foreground/70 leading-relaxed">
              הצטרף ל-ZenTrade היום וקבל גישה מלאה למנטור AI, יומן מסחר חכם, ותובנות שוק — בחינם.
            </p>
            <button
              onClick={() => openModal("register")}
              className="mt-8 md:mt-10 inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 md:px-12 md:py-5 text-sm md:text-base font-bold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/35 active:scale-[0.97]"
            >
              <Zap className="h-5 w-5" />
              צור חשבון חינם
            </button>
            <p className="mt-3 text-[10px] md:text-xs text-foreground/50">ללא כרטיס אשראי • הגדרה תוך 2 דקות</p>
          </div>
        </RevealSection>
      </section>

      {/* ===== WhatsApp Chat Widget ===== */}
      {!isEditorCanvas && <WhatsAppWidget />}

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/30 px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
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
      {!isEditorCanvas && showModal && <AuthModal onClose={closeModal} initialMode={modalMode} />}
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
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("שגיאה בהתחברות עם Google");
        return;
      }
      if (result.redirected) return;
      toast.success("התחברת בהצלחה!");
      navigate("/dashboard");
    } catch {
      toast.error("שגיאה לא צפויה");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("הזן את כתובת האימייל שלך");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        setResetSent(true);
        toast.success("נשלח קישור לאיפוס סיסמה לאימייל שלך");
      }
    } catch {
      toast.error("שגיאה לא צפויה");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message === "Invalid login credentials" ? "אימייל או סיסמה לא נכונים" : error.message);
          return;
        }
        toast.success("התחברת בהצלחה!");
        navigate("/dashboard");
      } else {
        if (password.length < 6) {
          toast.error("הסיסמה חייבת להיות לפחות 6 תווים");
          return;
        }
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.message);
          return;
        }
        // Update profile with name if provided
        if (name) {
          await updateProfile({ full_name: name });
        }
        localStorage.removeItem("zentrade-onboarded");
        toast.success("החשבון נוצר בהצלחה!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err?.message || "שגיאה לא צפויה");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4" dir="rtl">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-[95%] max-w-md max-h-[90vh] overflow-y-auto">
        <div className="rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-xl p-5 md:p-7 shadow-2xl shadow-primary/10">
          <button onClick={onClose} className="absolute top-3 left-3 md:top-4 md:left-4 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <X className="h-5 w-5" />
          </button>

          <div className="text-center mb-5 md:mb-6">
            <div className="flex justify-center mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Shield className="h-5 w-5 text-primary" />
              </div>
            </div>
            <h2 className="font-heading text-lg md:text-xl font-bold text-foreground">ZenTrade</h2>
            <p className="mt-1 text-[10px] md:text-xs text-foreground/60">
              {forgotMode ? "איפוס סיסמה" : isLogin ? "התחבר לחשבון שלך" : "צור חשבון חדש"}
            </p>
          </div>

          {forgotMode ? (
            resetSent ? (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-sm text-foreground">נשלח קישור לאיפוס סיסמה לאימייל שלך</p>
                <p className="text-xs text-muted-foreground">בדוק את תיבת הדואר שלך ולחץ על הקישור</p>
                <button onClick={() => { setForgotMode(false); setResetSent(false); }} className="text-xs text-primary hover:underline">
                  חזרה להתחברות
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label className="mb-1 block text-[10px] md:text-xs font-medium text-foreground/70">אימייל</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" dir="ltr"
                    className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs md:text-sm text-foreground text-left placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <button type="submit" disabled={submitting} className="w-full rounded-xl bg-primary py-3 text-xs md:text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60">
                  {submitting ? "שולח..." : "שלח קישור לאיפוס"}
                </button>
                <p className="text-center">
                  <button type="button" onClick={() => setForgotMode(false)} className="text-xs text-primary hover:underline">חזרה להתחברות</button>
                </p>
              </form>
            )
          ) : (
            <>
          <div className="mb-5 md:mb-6 flex gap-1 rounded-xl bg-muted p-1">
            {[{ label: "התחברות", login: true }, { label: "הרשמה", login: false }].map(({ label, login }) => (
              <button
                key={label}
                onClick={() => setIsLogin(login)}
                className={`flex-1 rounded-lg py-2 text-xs md:text-sm font-medium transition-all duration-200 ${
                  isLogin === login ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            <button onClick={handleGoogleSignIn} disabled={submitting} className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-muted/30 py-3 text-xs md:text-sm font-medium text-foreground transition-all hover:bg-muted/60 disabled:opacity-60">
              <GoogleIcon />
              המשך עם Google
            </button>
            <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-muted/30 py-3 text-xs md:text-sm font-medium text-foreground transition-all hover:bg-muted/60">
              <AppleIcon />
              המשך עם Apple
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] text-foreground/50">או עם אימייל</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div>
                <label className="mb-1 block text-[10px] md:text-xs font-medium text-foreground/70">שם מלא</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="הכנס את שמך"
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs md:text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-[10px] md:text-xs font-medium text-foreground/70">אימייל</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" dir="ltr"
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs md:text-sm text-foreground text-left placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] md:text-xs font-medium text-foreground/70">סיסמה</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr"
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 pr-10 text-xs md:text-sm text-foreground text-left placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-left">
                <button type="button" onClick={() => setForgotMode(true)} className="text-[10px] md:text-xs text-primary hover:underline">שכחת סיסמה?</button>
              </div>
            )}

            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-primary py-3 text-xs md:text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60">
              {submitting ? "מעבד..." : isLogin ? "היכנס לחשבון" : "צור חשבון חינם"}
            </button>
          </form>

          <p className="mt-4 text-center text-[10px] md:text-xs text-foreground/50">
            {isLogin ? "אין לך חשבון?" : "כבר יש לך חשבון?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
              {isLogin ? "הירשם עכשיו" : "התחבר"}
            </button>
          </p>
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

const DashStat = ({ label, value, sub, positive }: { label: string; value: string; sub: string; positive?: boolean }) => (
  <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
    <p className="text-[9px] md:text-[10px] text-foreground/60 mb-1">{label}</p>
    <p className="font-heading text-sm md:text-lg font-bold text-foreground">{value}</p>
    <p className={`text-[9px] md:text-[10px] mt-0.5 ${positive ? "text-accent" : "text-foreground/60"}`}>{sub}</p>
  </div>
);

const FadingCarousel = () => {
  const exchanges = [
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
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % exchanges.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="relative h-20 flex items-center justify-center">
        {exchanges.map((ex, i) => (
          <div
            key={ex.name}
            className={`absolute flex items-center gap-3 transition-all duration-700 ${
              i === activeIndex ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-card border border-border p-2 shadow-md">
              <img src={ex.logo} alt={ex.name} className="h-8 w-8 md:h-10 md:w-10 object-contain" loading="lazy" width={512} height={512} />
            </div>
            <span className="font-heading text-lg md:text-2xl font-bold text-foreground">{ex.name}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {exchanges.map((_, i) => (
          <button key={i} onClick={() => setActiveIndex(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"}`} />
        ))}
      </div>
    </div>
  );
};

/* ===== Static Data ===== */

const equityCurve = [25, 30, 28, 35, 32, 40, 38, 45, 42, 48, 46, 52, 50, 55, 53, 58, 56, 62, 60, 65, 63, 68, 66, 72, 70, 75, 73, 78, 80, 85];

const features = [
  {
    icon: <Brain className="h-6 w-6" />,
    title: "מנטור AI למסחר",
    desc: "ה-AI מנתח את כל העסקאות שלך, מזהה דפוסים חוזרים, ונותן לך המלצות מותאמות אישית לשיפור הביצועים. כמו מאמן פרטי שזמין 24/7.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Mindset Guard & FOMO Detection",
    desc: "ה-AI שלנו לא רק מנתח גרפים — הוא מנתח אותך. על ידי מעקב אחרי התנהגות על המסך, תנועות עכבר חריגות ולחיצות מהירות, ZenTrade מזהה FOMO ומסחר אימפולסיבי בזמן אמת. אנחנו מתריעים ומתערבים לפני שתבצע עסקה רגשית שעלולה לפוצץ את החשבון.",
    highlight: true,
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "יומן מסחר חכם",
    desc: "יבוא אוטומטי של כל העסקאות ישירות מהברוקר. שכח מאקסלים ורישום ידני — הכל מתועד, מסווג ומנותח אוטומטית.",
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "לוח כלכלי ותובנות שוק",
    desc: "הכל מובנה בפלטפורמה אחת: לוח כלכלי חכם, התראות לפני אירועים קריטיים, וניתוח השפעה על הנכסים שאתה סוחר.",
  },
];

const notIncluded = [
  "מסחר רגשי — ה-AI ינעל אותך לפני שתעשה טעות",
  "אקסלים מבלבלים — הכל אוטומטי ודיגיטלי",
  "ניחושים — כל החלטה מבוססת על דאטה אמיתי",
  "בדידות — יש לך מנטור AI שתמיד לצידך",
];

const testimonials = [
  {
    name: "דניאל כ.",
    avatar: "ד",
    role: "סוחר פורקס • 3 שנות ניסיון",
    quote: "מאז שהתחלתי להשתמש ב-ZenTrade, ה-Win Rate שלי עלה ב-15%. ה-AI תפס לי דפוס של Revenge Trading שלא הייתי מודע לו. המנטור הזה שווה זהב.",
  },
  {
    name: "שירה מ.",
    avatar: "ש",
    role: "סקלפרית מדדים • Funded Trader",
    quote: "העובדה שהמערכת נועלת אותי כשאני מתקרבת ל-Drawdown היומי הצילה לי את חשבון ה-Prop Firm. פשוט חובה לכל סוחר ממומן.",
  },
  {
    name: "אלון ר.",
    avatar: "א",
    role: "סוחר קריפטו • 5 שנות ניסיון",
    quote: "היומן האוטומטי חסך לי שעות כל שבוע. במקום לרשום עסקאות ידנית, אני מקבל ניתוח מלא עם תובנות AI. זה כמו לשדרג מאקסל לפרארי.",
  },
];

const faqs = [
  {
    q: "האם המידע שלי מאובטח?",
    a: "בהחלט. אנחנו משתמשים בהצפנה מקצה לקצה (AES-256) ולא שומרים סיסמאות ברוקר. החיבור מתבצע דרך API keys עם הרשאות קריאה בלבד — אין לנו גישה לבצע עסקאות בחשבון שלך.",
  },
  {
    q: "האם צריך לחבר את הברוקר ישירות?",
    a: "אפשר לחבר דרך API לסנכרון אוטומטי, אבל זה לא חובה. אפשר גם לייבא עסקאות ידנית או להעלות קבצי CSV מהפלטפורמה שלך.",
  },
  {
    q: "איך ה-AI מנתח את העסקאות שלי?",
    a: "ה-AI מנתח דפוסי מסחר כגון שעות פעילות, זוגות מט\"ח מועדפים, גודל פוזיציות, זמני החזקה ועוד. הוא מזהה טעויות חוזרות (כמו Over-Trading או Revenge Trading) ונותן המלצות מותאמות אישית לשיפור.",
  },
  {
    q: "האם השירות בחינם?",
    a: "יש חבילה חינמית שכוללת את רוב הכלים הבסיסיים. חבילות Premium מוסיפות ניתוח AI מתקדם, התראות בזמן אמת, והגנת Prop Firm אוטומטית.",
  },
  {
    q: "באילו פלטפורמות מסחר אתם תומכים?",
    a: "אנחנו תומכים ב-MetaTrader 5, Binance, TradeLocker, TradingView, Rithmic, Interactive Brokers, TopstepX, NinjaTrader ועוד. רשימת הפלטפורמות מתרחבת כל הזמן.",
  },
];

export default AuthPage;
