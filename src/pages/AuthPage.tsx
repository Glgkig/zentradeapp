import { useState, useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Shield, ChevronDown, Zap, Lock, X, Menu,
  Quote, Star, Brain, BookOpen,
  XCircle, ChevronRight, Sparkles, Eye, EyeOff,
  Calculator, Check, Loader2, BarChart3, TrendingUp,
} from "lucide-react";
import zentradeLogo from "@/assets/logo.jpg";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import logoMt4 from "@/assets/logos/mt4-new.png";
import logoMt5 from "@/assets/logos/mt5-new.jpg";
import logoBinance from "@/assets/logos/binance.png";
import logoTradeLocker from "@/assets/logos/tradelocker-new.jpg";
import logoTradingView from "@/assets/logos/tradingview-new.jpg";
import logoRithmic from "@/assets/logos/rithmic-new.jpg";
import logoIbkr from "@/assets/logos/ibkr-new.jpg";
import logoTopstep from "@/assets/logos/topstepx-new.jpg";
import logoForex from "@/assets/logos/forexcom-new.jpg";
import logoNinjaTrader from "@/assets/logos/ninjatrader-new.jpg";

/* ===== Hooks ===== */
const useScrolled = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return scrolled;
};

const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, isVisible };
};

const useTypewriter = (words: string[], speed = 80, pause = 2000) => {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    const current = words[wordIndex % words.length];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(current.slice(0, text.length + 1));
        if (text.length + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), pause);
        }
      } else {
        setText(current.slice(0, text.length - 1));
        if (text.length - 1 === 0) {
          setIsDeleting(false);
          setWordIndex(i => i + 1);
        }
      }
    }, isDeleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, speed, pause]);
  return text;
};

const useCountUp = (target: number, duration = 1500) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);
  return { count, ref };
};

const RevealSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

/* ===== Shimmer Button ===== */
const ShimmerButton = ({ children, onClick, className = "", variant = "primary" }: { children: React.ReactNode; onClick?: () => void; className?: string; variant?: "primary" | "outline" }) => (
  <button
    onClick={onClick}
    className={`group relative overflow-hidden rounded-xl font-bold transition-all duration-300 active:scale-[0.97] ${
      variant === "primary"
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:brightness-110"
        : "border border-border/60 bg-white/[0.03] text-foreground hover:border-primary/40 hover:bg-white/[0.06]"
    } ${className}`}
  >
    <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
  </button>
);

/* ===== Particles ===== */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1 + Math.random() * 2.5,
  duration: 6 + Math.random() * 10,
  delay: Math.random() * 8,
  opacity: 0.15 + Math.random() * 0.35,
}));

const Particles = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {PARTICLES.map(p => (
      <div key={p.id} className="absolute rounded-full bg-primary animate-pulse"
        style={{
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          opacity: p.opacity,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
        }} />
    ))}
  </div>
);

/* ===== Grid Background ===== */
const GridBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 opacity-[0.015]"
      style={{ backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/[0.06] rounded-full blur-[180px]" />
    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/[0.04] rounded-full blur-[130px]" />
    <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-destructive/[0.02] rounded-full blur-[100px]" />
    <Particles />
  </div>
);

/* ===== Dashboard Mockup ===== */
const DEMO_BARS = [
  { h: 55, profit: true }, { h: 30, profit: false }, { h: 75, profit: true },
  { h: 40, profit: false }, { h: 90, profit: true }, { h: 60, profit: true },
  { h: 20, profit: false }, { h: 85, profit: true }, { h: 45, profit: true },
  { h: 70, profit: true }, { h: 35, profit: false }, { h: 95, profit: true },
];
const DEMO_TRADES = [
  { pair: "EURUSD", dir: true, pnl: "+$420", setup: "SMC" },
  { pair: "GBPJPY", dir: false, pnl: "-$85", setup: "ICT" },
  { pair: "NAS100", dir: true, pnl: "+$1,240", setup: "OB" },
  { pair: "XAUUSD", dir: true, pnl: "+$380", setup: "FVG" },
];

const DashboardMockup = () => (
  <div className="relative w-full select-none" dir="rtl">
    {/* Browser chrome */}
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/15 bg-[#0d0f14]">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#111318] border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 mx-3 rounded-md bg-white/[0.04] border border-white/[0.06] px-3 py-1 text-center">
          <span className="text-[9px] text-white/20 font-mono">app.zentrade.io/dashboard</span>
        </div>
      </div>

      {/* App shell */}
      <div className="flex h-[340px] overflow-hidden">
        {/* Sidebar */}
        <div className="hidden sm:flex flex-col w-[52px] bg-[#0d0f14] border-l border-white/[0.06] items-center py-3 gap-3 shrink-0">
          <div className="h-7 w-7 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <div className="h-3 w-3 rounded-sm bg-primary/80" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-7 w-7 rounded-xl flex items-center justify-center ${i === 0 ? "bg-primary/10 border border-primary/20" : "bg-white/[0.03]"}`}>
              <div className={`h-3 w-3 rounded-sm ${i === 0 ? "bg-primary/60" : "bg-white/10"}`} />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden p-3 space-y-2.5 bg-[#0d0f14]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-white/80">שלום, יוסי. <span className="text-primary">🟢 שוק פתוח</span></div>
              <div className="text-[8px] text-white/25 font-mono mt-0.5">יום שני, 7 באפריל 2026</div>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/[0.08] px-2 py-1">
              <div className="h-2.5 w-2.5 text-primary">✨</div>
              <span className="text-[8px] font-bold text-primary">AI Analyst</span>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: "רווח כולל", val: "+$12,840", color: "text-primary", bg: "bg-primary/[0.06] border-primary/15" },
              { label: "אחוז הצלחה", val: "73%", color: "text-primary", bg: "bg-primary/[0.04] border-primary/10" },
              { label: "Profit Factor", val: "2.41", color: "text-white/70", bg: "bg-white/[0.02] border-white/[0.06]" },
              { label: "פוזיציות פתוחות", val: "3", color: "text-amber-400", bg: "bg-amber-400/[0.06] border-amber-400/15" },
            ].map((kpi) => (
              <div key={kpi.label} className={`rounded-xl border p-2 ${kpi.bg}`}>
                <div className="text-[7px] text-white/30 mb-1">{kpi.label}</div>
                <div className={`text-[12px] font-bold font-mono ${kpi.color}`}>{kpi.val}</div>
                {/* mini sparkline */}
                <div className="mt-1.5 flex items-end gap-px h-4">
                  {[4,7,5,9,6,8,10,7,9,11,8,12].map((h, i) => (
                    <div key={i} className={`flex-1 rounded-sm opacity-40 ${kpi.color === "text-primary" ? "bg-primary" : kpi.color === "text-amber-400" ? "bg-amber-400" : "bg-white"}`}
                      style={{ height: `${h * 0.9}px` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom: chart + trades */}
          <div className="grid grid-cols-5 gap-2 h-[150px]">
            {/* Bar chart */}
            <div className="col-span-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 overflow-hidden">
              <div className="text-[8px] font-bold text-white/50 mb-2">רווח / הפסד חודשי</div>
              <div className="flex items-end gap-1 h-[95px] pr-1">
                {DEMO_BARS.map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className={`w-full rounded-t-sm transition-all ${b.profit ? "bg-primary/70" : "bg-red-500/60"}`}
                      style={{ height: `${b.h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent trades */}
            <div className="col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 overflow-hidden">
              <div className="text-[8px] font-bold text-white/50 mb-2">עסקאות אחרונות</div>
              <div className="space-y-1.5">
                {DEMO_TRADES.map((t, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${t.dir ? "bg-primary" : "bg-red-400"}`} />
                      <span className="text-[8px] font-mono text-white/60">{t.pair}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[7px] text-white/25">{t.setup}</span>
                      <span className={`text-[8px] font-bold font-mono ${t.dir ? "text-primary" : "text-red-400"}`}>{t.pnl}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Floating badges */}
    <div className="absolute bottom-4 right-[-8px] flex flex-col gap-1.5 z-10">
      <div className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-black/80 backdrop-blur-md px-2.5 py-1.5 shadow-lg">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
        </span>
        <span className="text-[9px] font-bold text-primary">Kill Switch פעיל</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-black/80 backdrop-blur-md px-2.5 py-1.5 shadow-lg">
        <TrendingUp className="h-2.5 w-2.5 text-amber-400" />
        <span className="text-[9px] font-bold text-amber-400">+23.4% החודש</span>
      </div>
    </div>
  </div>
);

/* ===== Journal Mockup ===== */
const JournalMockup = () => (
  <div className="rounded-2xl bg-[#0d0f14] border border-white/[0.08] overflow-hidden shadow-2xl shadow-primary/10 select-none" dir="rtl">
    {/* Header bar */}
    <div className="flex items-center justify-between px-4 py-3 bg-[#111318] border-b border-white/[0.06]">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
          <span className="text-[10px]">📓</span>
        </div>
        <span className="text-[11px] font-bold text-white/70">יומן עסקאות</span>
      </div>
      <div className="flex gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
      </div>
    </div>
    {/* Toolbar */}
    <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.04] bg-white/[0.01]">
      <div className="rounded-lg bg-primary px-3 py-1.5 text-[9px] font-bold text-black">+ עסקה חדשה</div>
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[9px] text-white/40">סינון</div>
      <div className="mr-auto flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
        <span className="text-[9px] text-white/25 font-mono">חיפוש...</span>
      </div>
    </div>
    {/* Table header */}
    <div className="grid grid-cols-6 gap-2 px-4 py-2 border-b border-white/[0.04]">
      {["זוג","כיוון","כניסה","יציאה","סטופ","P&L"].map(h => (
        <div key={h} className="text-[8px] font-bold text-white/25 uppercase tracking-wider">{h}</div>
      ))}
    </div>
    {/* Rows */}
    {[
      { pair: "EURUSD", dir: "Long", entry: "1.0842", exit: "1.0891", sl: "1.0810", pnl: "+$420", profit: true, setup: "OB", tag: "ICT" },
      { pair: "XAUUSD", dir: "Long", entry: "2,318", exit: "2,347", sl: "2,300", pnl: "+$1,240", profit: true, setup: "FVG", tag: "SMC" },
      { pair: "GBPJPY", dir: "Short", entry: "191.20", exit: "190.85", sl: "191.60", pnl: "+$310", profit: true, setup: "CHoCH", tag: "ICT" },
      { pair: "NAS100", dir: "Long", entry: "17,840", exit: "17,780", sl: "17,800", pnl: "-$85", profit: false, setup: "MSB", tag: "SMC" },
      { pair: "USDJPY", dir: "Short", entry: "153.40", exit: "152.90", sl: "153.80", pnl: "+$500", profit: true, setup: "OB", tag: "PA" },
    ].map((row, i) => (
      <div key={i} className={`grid grid-cols-6 gap-2 px-4 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group ${i === 0 ? "bg-primary/[0.03]" : ""}`}>
        <div className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${row.profit ? "bg-primary" : "bg-red-400"}`} />
          <span className="text-[9px] font-mono font-bold text-white/80">{row.pair}</span>
        </div>
        <div>
          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${row.dir === "Long" ? "text-primary bg-primary/10" : "text-red-400 bg-red-400/10"}`}>{row.dir}</span>
        </div>
        <span className="text-[9px] font-mono text-white/50">{row.entry}</span>
        <span className="text-[9px] font-mono text-white/50">{row.exit}</span>
        <span className="text-[9px] font-mono text-red-400/60">{row.sl}</span>
        <span className={`text-[9px] font-bold font-mono ${row.profit ? "text-primary" : "text-red-400"}`}>{row.pnl}</span>
      </div>
    ))}
    {/* Footer stats */}
    <div className="flex items-center gap-4 px-4 py-3 bg-white/[0.01]">
      <div className="text-[8px] text-white/30 font-mono">5 עסקאות • Win Rate: <span className="text-primary font-bold">80%</span></div>
      <div className="mr-auto text-[9px] font-bold font-mono text-primary">סה"כ: +$2,385</div>
    </div>
  </div>
);

/* ===== AI Mentor Mockup ===== */
const MentorMockup = () => (
  <div className="rounded-2xl bg-[#0d0f14] border border-white/[0.08] overflow-hidden shadow-2xl shadow-primary/10 select-none" dir="rtl">
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 bg-[#111318] border-b border-white/[0.06]">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/60 to-cyan-600/40 border border-primary/30 flex items-center justify-center">
            <span className="text-sm">🤖</span>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-[#111318]" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-white/80">ZenTrade AI Mentor</div>
          <div className="text-[8px] text-primary">● מחובר • מוכן לניתוח</div>
        </div>
      </div>
      <div className="rounded-lg border border-white/[0.08] px-2 py-1 text-[8px] text-white/30 font-mono">GPT-4o</div>
    </div>

    {/* Chat messages */}
    <div className="p-4 space-y-3 min-h-[200px]">
      {/* User message */}
      <div className="flex justify-start">
        <div className="rounded-2xl rounded-tr-sm bg-white/[0.06] border border-white/[0.08] px-3 py-2 max-w-[80%]">
          <p className="text-[9px] text-white/70 leading-relaxed">למה אני ממשיך לפספס על EURUSD? רוב העסקאות שלי שם מפסידות</p>
        </div>
      </div>

      {/* AI response */}
      <div className="flex justify-end">
        <div className="rounded-2xl rounded-tl-sm bg-primary/10 border border-primary/20 px-3 py-2.5 max-w-[85%]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="h-3.5 w-3.5 rounded-full bg-primary/30 flex items-center justify-center text-[7px]">🤖</div>
            <span className="text-[7px] font-bold text-primary">ZenTrade AI</span>
          </div>
          <p className="text-[9px] text-white/75 leading-relaxed mb-2">
            ניתחתי את 23 העסקאות האחרונות שלך על EURUSD. מצאתי דפוס ברור —
          </p>
          <div className="space-y-1">
            {[
              { icon: "⚠️", text: "73% מהפסדים — כניסה בגוף הנר, לא ב-OB" },
              { icon: "🎯", text: "עסקאות London Kill Zone — Win Rate 68%" },
              { icon: "⏰", text: "אחרי 14:00 — Win Rate רק 23%" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2 py-1">
                <span className="text-[9px]">{item.icon}</span>
                <span className="text-[8px] text-white/60">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Typing indicator */}
      <div className="flex justify-end">
        <div className="rounded-2xl rounded-tl-sm bg-primary/[0.06] border border-primary/15 px-3 py-2">
          <div className="flex gap-1 items-center">
            <span className="text-[8px] text-white/30">מנתח...</span>
            {[0, 0.2, 0.4].map((d, i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: `${d}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Input bar */}
    <div className="border-t border-white/[0.06] px-4 py-3 flex items-center gap-2">
      <div className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
        <span className="text-[9px] text-white/20">שאל את ה-AI Mentor...</span>
      </div>
      <div className="h-7 w-7 rounded-xl bg-primary flex items-center justify-center">
        <span className="text-[10px] text-black font-bold">→</span>
      </div>
    </div>
  </div>
);

/* ===== Stats Mockup ===== */
const HEATMAP_VALS = [1,3,-1,2,4,0,3,-2,1,5,2,3,0,4,-1,2,3,1,4,2,-3,1,5,3,2,4,0,1,3,2];
const StatsMockup = () => (
  <div className="rounded-2xl bg-[#0d0f14] border border-white/[0.08] overflow-hidden shadow-2xl shadow-primary/10 select-none" dir="rtl">
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 bg-[#111318] border-b border-white/[0.06]">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center"><span className="text-[10px]">📊</span></div>
        <span className="text-[11px] font-bold text-white/70">סטטיסטיקות ביצועים</span>
      </div>
      <div className="flex gap-1">
        {["7d","30d","90d","1y"].map((p,i) => (
          <div key={p} className={`px-2 py-0.5 rounded text-[8px] font-mono ${i===1 ? "bg-primary/20 text-primary" : "text-white/25"}`}>{p}</div>
        ))}
      </div>
    </div>

    <div className="p-4 space-y-3">
      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Win Rate", val: "73%", sub: "+5% vs חודש קודם", up: true },
          { label: "Profit Factor", val: "2.41", sub: "מעולה", up: true },
          { label: "Avg R/R", val: "1:2.8", sub: "יעד: 1:2", up: true },
          { label: "Max DD", val: "3.2%", sub: "בטוח", up: false },
        ].map((k) => (
          <div key={k.label} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-2 text-center">
            <div className="text-[7px] text-white/30 mb-1">{k.label}</div>
            <div className="text-[14px] font-bold text-primary font-mono">{k.val}</div>
            <div className={`text-[7px] mt-0.5 ${k.up ? "text-primary/60" : "text-amber-400/60"}`}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Calendar heatmap */}
      <div>
        <div className="text-[8px] font-bold text-white/30 mb-2">יומן ביצועים — אפריל 2026</div>
        <div className="grid grid-cols-10 gap-1">
          {HEATMAP_VALS.map((v, i) => (
            <div key={i} className="h-5 w-full rounded"
              style={{ background: v > 3 ? "rgba(0,212,170,0.8)" : v > 0 ? `rgba(0,212,170,${v*0.2+0.1})` : v === 0 ? "rgba(255,255,255,0.05)" : `rgba(239,68,68,${Math.abs(v)*0.2+0.1})` }} />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="h-2 w-2 rounded-sm bg-red-500/50" /><span className="text-[7px] text-white/20">הפסד</span>
          <div className="h-2 w-2 rounded-sm bg-white/10" /><span className="text-[7px] text-white/20">יום ריק</span>
          <div className="h-2 w-2 rounded-sm bg-primary/70" /><span className="text-[7px] text-white/20">רווח</span>
        </div>
      </div>

      {/* Setup breakdown */}
      <div>
        <div className="text-[8px] font-bold text-white/30 mb-2">ביצוע לפי סטאפ</div>
        {[
          { name: "Order Block", wr: 82, pnl: "+$3,200", bar: 82 },
          { name: "FVG + Breaker", wr: 71, pnl: "+$1,840", bar: 71 },
          { name: "CHoCH + BOS", wr: 65, pnl: "+$980", bar: 65 },
          { name: "Kill Zone", wr: 58, pnl: "+$540", bar: 58 },
        ].map((s) => (
          <div key={s.name} className="flex items-center gap-2 py-1">
            <div className="text-[8px] text-white/50 w-24 shrink-0 truncate">{s.name}</div>
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary/40" style={{ width: `${s.bar}%` }} />
            </div>
            <div className="text-[8px] font-mono text-primary w-8 text-left">{s.wr}%</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ===== Kill Switch Mockup ===== */
const KillSwitchMockup = () => (
  <div className="rounded-2xl bg-[#0d0f14] border border-white/[0.08] overflow-hidden shadow-2xl shadow-primary/10 select-none" dir="rtl">
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 bg-[#111318] border-b border-white/[0.06]">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center"><span className="text-[10px]">🛡️</span></div>
        <span className="text-[11px] font-bold text-white/70">ניהול סיכונים — Bodyguard</span>
      </div>
      <span className="text-[8px] font-mono text-primary">● פעיל</span>
    </div>

    <div className="p-4 space-y-3">
      {/* Kill Switch status */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] font-bold text-white/70">Kill Switch יומי</div>
            <div className="text-[8px] text-white/30 mt-0.5">מופעל ב-3% הפסד יומי</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10">
            <span className="text-[16px]">🔒</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[8px]">
            <span className="text-white/30">הפסד יומי נוכחי</span>
            <span className="text-amber-400 font-bold font-mono">-$127 / -$300</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all" style={{ width: "42%" }} />
          </div>
          <div className="text-[7px] text-white/20">42% מהמגבלה • 2 עסקאות נוספות מותרות</div>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        <div className="text-[8px] font-bold text-white/30">התראות אחרונות</div>
        {[
          { icon: "⚠️", text: "FOMO Detection — זמן מהיר מדי מכניסה לכניסה", time: "לפני 12 דק", color: "text-amber-400" },
          { icon: "✅", text: "Win Streak 4 — מצוין! שמור על הקצב", time: "לפני 45 דק", color: "text-primary" },
          { icon: "🛡️", text: "Tilt Alert — הפסקה מומלצת אחרי 2 הפסדים", time: "אתמול", color: "text-blue-400" },
        ].map((a, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
            <span className="text-[11px] mt-0.5">{a.icon}</span>
            <div className="flex-1">
              <p className="text-[8px] text-white/60 leading-relaxed">{a.text}</p>
              <p className="text-[7px] text-white/20 mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Daily rules */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: "Max עסקאות", val: "8/10", ok: true },
          { label: "Max הפסד", val: "42%", ok: true },
          { label: "Win Rate היום", val: "75%", ok: true },
        ].map((r) => (
          <div key={r.label} className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2 text-center">
            <div className="text-[7px] text-white/25 mb-1">{r.label}</div>
            <div className={`text-[11px] font-bold font-mono ${r.ok ? "text-primary" : "text-red-400"}`}>{r.val}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ===== Tax Calculator Mockup ===== */
const TaxMockup = () => (
  <div className="rounded-2xl bg-[#0d0f14] border border-white/[0.08] overflow-hidden shadow-2xl shadow-primary/10 select-none" dir="rtl">
    <div className="flex items-center justify-between px-4 py-3 bg-[#111318] border-b border-white/[0.06]">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center"><span className="text-[10px]">🧮</span></div>
        <span className="text-[11px] font-bold text-white/70">מחשבון מס ישראלי</span>
      </div>
      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8px] text-amber-400 font-bold">25% מס רווחי הון</div>
    </div>

    <div className="p-4 space-y-3">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "רווח גולמי", val: "₪48,500", color: "text-primary" },
          { label: "חבות מס", val: "₪12,125", color: "text-amber-400" },
          { label: "נטו בכיס", val: "₪36,375", color: "text-primary" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-2.5 text-center">
            <div className="text-[7px] text-white/30 mb-1">{k.label}</div>
            <div className={`text-[12px] font-bold font-mono ${k.color}`}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
        <div className="text-[8px] font-bold text-white/40 mb-2">פירוט לפי חודש</div>
        {[
          { month: "ינואר", profit: "₪8,200", tax: "₪2,050" },
          { month: "פברואר", profit: "₪12,400", tax: "₪3,100" },
          { month: "מרץ", profit: "₪15,800", tax: "₪3,950" },
          { month: "אפריל", profit: "₪12,100", tax: "₪3,025" },
        ].map((row) => (
          <div key={row.month} className="flex items-center justify-between">
            <span className="text-[8px] text-white/40">{row.month}</span>
            <div className="flex-1 mx-3 h-1.5 rounded-full bg-white/[0.04]">
              <div className="h-full rounded-full bg-primary/40" style={{ width: `${parseInt(row.profit.replace(/\D/g,""))/200}%` }} />
            </div>
            <span className="text-[8px] font-mono text-primary w-14 text-left">{row.profit}</span>
            <span className="text-[8px] font-mono text-amber-400/60 w-14 text-left">{row.tax}</span>
          </div>
        ))}
      </div>

      {/* Export button */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl bg-primary/10 border border-primary/20 py-2 text-center">
          <span className="text-[9px] font-bold text-primary">📄 ייצוא PDF לרו"ח</span>
        </div>
        <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.08] py-2 text-center">
          <span className="text-[9px] text-white/40">📊 Excel</span>
        </div>
      </div>
    </div>
  </div>
);

/* ===== Broker Card ===== */
const BrokerCard = ({ broker }: { broker: { name: string; logo: string; category: string; color: string } }) => (
  <div
    className="shrink-0 group flex flex-col items-center gap-2.5 cursor-default transition-all duration-300 hover:-translate-y-1"
    onMouseEnter={e => (e.currentTarget.style.filter = `drop-shadow(0 8px 24px ${broker.color}40)`)}
    onMouseLeave={e => (e.currentTarget.style.filter = "")}
  >
    {/* Square logo box */}
    <div className="h-20 w-20 rounded-2xl border border-white/[0.08] overflow-hidden transition-all duration-300 group-hover:border-white/[0.18]">
      <img
        src={broker.logo}
        alt={broker.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    {/* Name */}
    <span className="text-[9px] font-semibold text-white/40 tracking-wide text-center font-mono">{broker.name}</span>
  </div>
);

/* ===== Floating Badge ===== */
const FloatingBadge = ({ text, icon: Icon, color = "primary" }: { text: string; icon: React.ElementType; color?: string }) => (
  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm
    ${color === "primary" ? "border-primary/30 bg-primary/10 text-primary" : "border-accent/30 bg-accent/10 text-accent"}`}>
    <Icon className="h-3 w-3" />
    {text}
  </div>
);

/* ===== Live Ticker Bar ===== */
const LiveTickerBar = () => {
  const items = [
    "🟢 דניאל +₪2,340 SMC Long EURUSD",
    "🟢 שירה +₪890 ICT Bearish OB GBPUSD",
    "🔴 אלון -₪120 Stop Loss מוגן",
    "🟢 יובל +₪4,100 Funded Account Pass",
    "🟢 נועה +₪670 Kill Zone Entry",
    "🔴 מתן Kill Switch פעיל — נמנע מהפסד",
    "🟢 עידן +₪1,800 FVG Fill Perfect",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="border-b border-primary/10 bg-primary/[0.02] py-2 overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="shrink-0 flex items-center gap-2 px-4 border-l border-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-[10px] font-bold text-primary font-mono tracking-widest">LIVE</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="flex gap-10 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
            {doubled.map((item, i) => (
              <span key={i} className="text-[11px] text-foreground/50 shrink-0">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


/* ===== Main Page ===== */
const AuthPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "register">("register");
  const [activeShowcase, setActiveShowcase] = useState(0);
  const scrolled = useScrolled();
  const typedText = useTypewriter(["SMC Traders", "ICT Traders", "Prop Firm Traders", "Price Action Traders"], 70, 1800);

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

  const { count: count1, ref: ref1 } = useCountUp(12000);
  const { count: count2, ref: ref2 } = useCountUp(94);
  const { count: count3, ref: ref3 } = useCountUp(9);

  return (
    <div className="min-h-screen bg-background" dir="rtl">

      {/* Live Ticker */}
      <LiveTickerBar />

      {/* ===== Navbar ===== */}
      <nav className={`sticky top-0 z-40 transition-all duration-500 ${scrolled ? "border-b border-border/40 bg-background/80 backdrop-blur-2xl shadow-lg shadow-black/20" : "bg-transparent border-b border-transparent"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/25 overflow-hidden shadow-[0_0_15px_rgba(0,212,170,0.15)]">
              <img src={zentradeLogo} alt="ZenTrade" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <span className="font-heading text-base font-extrabold text-foreground tracking-tight">ZenTrade</span>
              <span className="block text-[9px] text-primary/60 font-mono leading-none">AI TRADING OS</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-7">
            {[["#features","למה ZenTrade?"],["#inside","פיצ'רים"],["#brokers","ברוקרים"],["#testimonials","ביקורות"],["#pricing","תמחור"]].map(([href, label]) => (
              <a key={href} href={href} className="text-xs text-foreground/50 hover:text-primary transition-colors duration-200 font-medium">{label}</a>
            ))}
            <div className="h-4 w-px bg-border/50" />
            <button onClick={() => openModal("login")} className="text-xs font-semibold text-foreground/70 hover:text-primary transition-colors">התחברות</button>
            <ShimmerButton onClick={() => openModal("register")} className="px-5 py-2 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              הרשמה חינם
            </ShimmerButton>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden relative flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 transition-all hover:bg-primary/20">
            {mobileMenu ? <X className="h-4 w-4 text-primary" /> : <Menu className="h-4 w-4 text-primary" />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-2">
            {[["#features","למה ZenTrade?"],["#inside","פיצ'רים"],["#brokers","ברוקרים"],["#testimonials","ביקורות"],["#pricing","תמחור"]].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileMenu(false)} className="block py-2.5 text-sm text-foreground/70 border-b border-border/20">{label}</a>
            ))}
            <div className="pt-2 space-y-2">
              <button onClick={() => openModal("login")} className="w-full rounded-xl border border-border py-3 text-sm font-medium text-foreground">התחברות</button>
              <ShimmerButton onClick={() => openModal("register")} className="w-full py-3 text-sm">הרשמה חינם</ShimmerButton>
            </div>
          </div>
        )}
      </nav>

      {/* ================================================ */}
      {/* S1 — HERO                                         */}
      {/* ================================================ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <GridBackground />

        <div className="mx-auto max-w-7xl w-full px-4 md:px-8 py-16 md:py-0 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="text-center lg:text-right">

              <div className="flex justify-center lg:justify-start mb-6">
                <FloatingBadge text="SMC / ICT / Price Action Compatible" icon={Sparkles} />
              </div>

              <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.2rem] xl:text-6xl font-extrabold leading-[1.1] text-foreground">
                <span className="block text-foreground/80 mb-2">יומן מסחר לעידן</span>
                <span className="relative">
                  <span className="bg-gradient-to-l from-primary via-cyan-400 to-primary bg-clip-text text-transparent animate-pulse">
                    ה-Smart Money
                  </span>
                </span>
                <span className="block mt-3 text-2xl md:text-3xl font-bold text-foreground/60 min-h-[2.5rem]">
                  <span className="text-primary">{typedText}</span>
                  <span className="animate-pulse text-primary">|</span>
                </span>
              </h1>

              <p className="mt-6 text-sm md:text-base leading-relaxed text-foreground/55 max-w-xl mx-auto lg:mx-0 lg:mr-0">
                תפסיקו לבזבז שעות על אקסל. ZenTrade מסנכרן את העסקאות שלכם מכל ברוקר ומאפשר לתעד, לנתח ולשלוט ברגשות בעזרת AI מתקדם.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <ShimmerButton onClick={() => openModal("register")} className="w-full sm:w-auto px-8 py-4 text-sm md:text-base">
                  <Zap className="h-5 w-5" />
                  התחילו עכשיו — בחינם
                </ShimmerButton>
                <ShimmerButton onClick={() => openModal("login")} variant="outline" className="w-full sm:w-auto px-8 py-4 text-sm md:text-base">
                  התחברות
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </ShimmerButton>
              </div>
              <div className="mt-3 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <p className="text-[11px] text-foreground/35 font-mono">ללא כרטיס אשראי • הגדרה תוך 2 דקות</p>
              </div>
              <div className="mt-3 flex justify-center lg:justify-start">
                <a
                  href="/demo"
                  className="group inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 px-5 py-2.5 text-[13px] font-semibold text-primary/80 hover:text-primary"
                >
                  <Eye className="h-4 w-4" />
                  צפה בדמו חי — ללא הרשמה
                  <span className="text-[10px] font-bold bg-primary/15 text-primary rounded-full px-2 py-0.5">חינם</span>
                </a>
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-3 gap-3">
                {[
                  { ref: ref1, count: count1, suffix: "+", prefix: "", label: "סוחרים פעילים" },
                  { ref: ref2, count: count2, suffix: "%", prefix: "", label: "שביעות רצון" },
                  { ref: ref3, count: count3, suffix: "+", prefix: "", label: "פלטפורמות" },
                ].map((s, i) => (
                  <div key={i} ref={s.ref} className="group relative rounded-xl border border-primary/12 bg-gradient-to-br from-primary/[0.05] to-transparent p-3 text-center transition-all hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-l from-transparent via-primary/30 to-transparent" />
                    <p className="font-heading text-xl md:text-2xl font-extrabold text-primary drop-shadow-[0_0_10px_rgba(0,212,170,0.3)]">
                      {s.prefix}{s.count.toLocaleString()}{s.suffix}
                    </p>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground/40 mt-0.5 font-mono">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Dashboard Mockup */}
            <div className="hidden lg:block relative">
              <div className="absolute -inset-6 bg-primary/[0.04] rounded-3xl blur-2xl" />
              <DashboardMockup />
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1 text-muted-foreground/30">
          <span className="text-[10px]">גלול למטה</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </section>

      {/* ================================================ */}
      {/* S2 — PROBLEM / SOLUTION                           */}
      {/* ================================================ */}
      <section id="features" className="border-t border-border/20 px-4 py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-destructive/[0.03] rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[150px] pointer-events-none" />

        <div className="mx-auto max-w-6xl relative">
          <RevealSection>
            <div className="text-center mb-14">
              <FloatingBadge text="למה אתם מפסידים?" icon={Zap} />
              <h2 className="mt-4 font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                הבעיה הישנה{" "}
                <span className="bg-gradient-to-l from-primary to-cyan-400 bg-clip-text text-transparent">vs הפתרון החדש</span>
              </h2>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <RevealSection delay={100}>
              <div className="group relative rounded-2xl border border-destructive/20 bg-destructive/[0.03] p-7 h-full overflow-hidden transition-all duration-500 hover:border-destructive/40 hover:shadow-xl hover:shadow-destructive/10">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-l from-transparent via-destructive/50 to-transparent" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-destructive/[0.06] rounded-full blur-2xl group-hover:bg-destructive/10 transition-all" />
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <XCircle className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-5">הבעיה הישנה <span className="text-foreground/40 text-sm">(Manual Retail)</span></h3>
                <ul className="space-y-3.5">
                  {["תיעוד ידני גוזל שעות ולא מדויק","סחר רגשי מחסל חשבונות","חוסר הבנה של ה-Smart Money","אקסלים מבלבלים ולא עקביים","אין הגנה מפני Revenge Trading"].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-foreground/60">
                      <XCircle className="h-4 w-4 text-destructive/70 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealSection>

            <RevealSection delay={200}>
              <div className="group relative rounded-2xl border border-primary/25 bg-primary/[0.04] p-7 h-full overflow-hidden transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/15">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-l from-transparent via-primary/60 to-transparent" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/[0.08] rounded-full blur-2xl group-hover:bg-primary/15 transition-all" />
                <div className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground uppercase tracking-wider">הפתרון</div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-5">ה-Edge החדש <span className="text-primary text-sm">(ZenTrade)</span></h3>
                <ul className="space-y-3.5">
                  {["סנכרון אוטומטי מלא (9+ פלטפורמות)","Kill-Switch מופעל — הגנה מפני FOMO","פיענוח SMC/ICT אוטומטי מובנה","מנטור AI מותאם אישית 24/7","מחשבון מס ישראלי + דוח PDF"].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-foreground/80">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* S2.5 — WHAT'S INSIDE (Feature Deep Dive)          */}
      {/* ================================================ */}
      <section id="inside" className="border-t border-border/20 px-4 py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.025] rounded-full blur-[180px]" />
        </div>

        <div className="mx-auto max-w-6xl relative space-y-28">
          {/* Header */}
          <RevealSection>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-5">
                <span className="text-sm">🔍</span>
                <span className="text-xs font-bold text-primary font-mono tracking-widest">INSIDE THE APP</span>
              </div>
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground leading-tight">
                מה מחכה לכם{" "}
                <span className="bg-gradient-to-l from-primary via-cyan-400 to-primary bg-clip-text text-transparent">בפנים</span>
              </h2>
              <p className="mt-4 text-sm text-foreground/40 max-w-lg mx-auto">
                כלים שסוחרים מקצועיים משתמשים בהם — עכשיו נגישים לכולם
              </p>
            </div>
          </RevealSection>

          {/* Feature 1 — Journal (image right) */}
          <RevealSection>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="space-y-6 lg:order-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1">
                  <span className="text-sm">📓</span>
                  <span className="text-[10px] font-bold text-primary tracking-widest font-mono">TRADE JOURNAL</span>
                </div>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground leading-snug">
                  יומן עסקאות חכם<br/>
                  <span className="text-foreground/40 text-xl font-medium">עם סנכרון אוטומטי</span>
                </h3>
                <p className="text-sm text-foreground/55 leading-relaxed">
                  תפסיקו לרשום עסקאות ידנית. ZenTrade מתחבר ל-9+ פלטפורמות מסחר ומסנכרן הכל אוטומטית — כולל שעת כניסה, יציאה, סטופ-לוס, ו-P&L מדויק לשקל.
                </p>
                <ul className="space-y-3">
                  {[
                    { icon: "⚡", text: "סנכרון אוטומטי מ-MT4/MT5, Rithmic, TradingView ועוד" },
                    { icon: "🏷️", text: "תיוג אוטומטי לפי סטאפ — OB, FVG, CHoCH, Kill Zone" },
                    { icon: "📸", text: "צירוף סקרינשוט ישיר מ-TradingView לכל עסקה" },
                    { icon: "🔍", text: "חיפוש וסינון מתקדם — לפי זוג, כיוון, תאריך, סטאפ" },
                  ].map((f) => (
                    <li key={f.icon} className="flex items-center gap-3">
                      <span className="text-lg">{f.icon}</span>
                      <span className="text-sm text-foreground/65">{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:order-2 relative">
                <div className="absolute -inset-4 bg-primary/[0.04] rounded-3xl blur-2xl" />
                <div className="relative">
                  <JournalMockup />
                </div>
              </div>
            </div>
          </RevealSection>

          {/* Feature 2 — AI Mentor (image left) */}
          <RevealSection>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="relative lg:order-1">
                <div className="absolute -inset-4 bg-cyan-500/[0.04] rounded-3xl blur-2xl" />
                <div className="relative">
                  <MentorMockup />
                </div>
              </div>
              <div className="space-y-6 lg:order-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1">
                  <span className="text-sm">🤖</span>
                  <span className="text-[10px] font-bold text-cyan-400 tracking-widest font-mono">AI MENTOR</span>
                </div>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground leading-snug">
                  מנטור AI אישי<br/>
                  <span className="text-foreground/40 text-xl font-medium">זמין 24/7</span>
                </h3>
                <p className="text-sm text-foreground/55 leading-relaxed">
                  AI שמכיר אתכם. מנתח את ההיסטוריה שלכם, מזהה דפוסים שאתם לא רואים, ומייעץ בזמן אמת לפי הנתונים האמיתיים שלכם — לא תיאוריה כללית.
                </p>
                <ul className="space-y-3">
                  {[
                    { icon: "🧠", text: "ניתוח דפוסי כישלון אישיים — מה גורם לכם להפסיד" },
                    { icon: "📈", text: "זיהוי שעות ה-Peak Performance שלכם" },
                    { icon: "💬", text: "שיחה חופשית בעברית — כמו Trading Coach" },
                    { icon: "🎯", text: "המלצות Setup-ספציפיות לפי Win Rate היסטורי" },
                  ].map((f) => (
                    <li key={f.icon} className="flex items-center gap-3">
                      <span className="text-lg">{f.icon}</span>
                      <span className="text-sm text-foreground/65">{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </RevealSection>

          {/* Feature 3 — Stats (image right) */}
          <RevealSection>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="space-y-6 lg:order-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1">
                  <span className="text-sm">📊</span>
                  <span className="text-[10px] font-bold text-blue-400 tracking-widest font-mono">ANALYTICS</span>
                </div>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground leading-snug">
                  סטטיסטיקות מתקדמות<br/>
                  <span className="text-foreground/40 text-xl font-medium">שמסבירות מה קורה</span>
                </h3>
                <p className="text-sm text-foreground/55 leading-relaxed">
                  מעבר ל-Win Rate. ראו את ה-Equity Curve שלכם, יומן ביצועים לפי יום, ניתוח לפי סשן מסחר, ומי הסטאפ הרווחי ביותר שלכם.
                </p>
                <ul className="space-y-3">
                  {[
                    { icon: "🗓️", text: "יומן חום — ראו את ימי הרווח שלכם בגראף" },
                    { icon: "🏆", text: "דירוג סטאפים — מה עובד ומה לא" },
                    { icon: "⏰", text: "ניתוח לפי שעה וסשן — London, NY, Asian" },
                    { icon: "📉", text: "Drawdown Analysis — מתי לעצור ולנוח" },
                  ].map((f) => (
                    <li key={f.icon} className="flex items-center gap-3">
                      <span className="text-lg">{f.icon}</span>
                      <span className="text-sm text-foreground/65">{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:order-2 relative">
                <div className="absolute -inset-4 bg-blue-500/[0.04] rounded-3xl blur-2xl" />
                <div className="relative">
                  <StatsMockup />
                </div>
              </div>
            </div>
          </RevealSection>

          {/* Feature 4 — Kill Switch (image left) */}
          <RevealSection>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="relative lg:order-1">
                <div className="absolute -inset-4 bg-red-500/[0.04] rounded-3xl blur-2xl" />
                <div className="relative">
                  <KillSwitchMockup />
                </div>
              </div>
              <div className="space-y-6 lg:order-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1">
                  <span className="text-sm">🛡️</span>
                  <span className="text-[10px] font-bold text-red-400 tracking-widest font-mono">BODYGUARD</span>
                </div>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground leading-snug">
                  Kill Switch — הגנת הון<br/>
                  <span className="text-foreground/40 text-xl font-medium">24/7 אוטומטית</span>
                </h3>
                <p className="text-sm text-foreground/55 leading-relaxed">
                  הפיצ'ר שהיה יכול להציל אתכם מה-Blown Account. מגדירים מגבלת הפסד יומית — ואם מגיעים אליה, המערכת עוצרת אתכם. בלי שאלות.
                </p>
                <ul className="space-y-3">
                  {[
                    { icon: "🔒", text: "Kill Switch — נעילה אחרי הפסד יומי/שבועי" },
                    { icon: "🧘", text: "Tilt Detection — מזהה Revenge Trading" },
                    { icon: "⚠️", text: "FOMO Alert — מזהיר כשאתם נכנסים מהר מדי" },
                    { icon: "🎯", text: "Over-Trading Guard — מגביל מספר עסקאות ביום" },
                  ].map((f) => (
                    <li key={f.icon} className="flex items-center gap-3">
                      <span className="text-lg">{f.icon}</span>
                      <span className="text-sm text-foreground/65">{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </RevealSection>

          {/* Feature 5 — Tax (image right) */}
          <RevealSection>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="space-y-6 lg:order-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1">
                  <span className="text-sm">🧮</span>
                  <span className="text-[10px] font-bold text-amber-400 tracking-widest font-mono">TAX CALCULATOR</span>
                </div>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground leading-snug">
                  מחשבון מס ישראלי<br/>
                  <span className="text-foreground/40 text-xl font-medium">+ ייצוא לרו"ח</span>
                </h3>
                <p className="text-sm text-foreground/55 leading-relaxed">
                  חישוב מס רווחי הון אוטומטי לפי חוק הישראלי (25%). ייצוא PDF מלא שרואה חשבון יכול להגיש ישירות למס הכנסה.
                </p>
                <ul className="space-y-3">
                  {[
                    { icon: "💰", text: "חישוב אוטומטי של חבות מס 25% על רווחי הון" },
                    { icon: "📄", text: "ייצוא PDF מסודר — מוכן להגשה לרו\"ח" },
                    { icon: "📊", text: "פירוט לפי חודש, זוג, ואסטרטגיה" },
                    { icon: "🔄", text: "חישוב שיטת קיזוז הפסדים (ממוצע משוקלל)" },
                  ].map((f) => (
                    <li key={f.icon} className="flex items-center gap-3">
                      <span className="text-lg">{f.icon}</span>
                      <span className="text-sm text-foreground/65">{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:order-2 relative">
                <div className="absolute -inset-4 bg-amber-500/[0.04] rounded-3xl blur-2xl" />
                <div className="relative">
                  <TaxMockup />
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ================================================ */}
      {/* S3 — SHOWCASE                                     */}
      {/* ================================================ */}
      <section id="showcase" className="border-t border-border/20 px-4 py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

        <div className="mx-auto max-w-6xl relative">
          <RevealSection>
            <div className="text-center mb-14">
              <FloatingBadge text="הצצה לפנים" icon={Sparkles} />
              <h2 className="mt-4 font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                תראו מה <span className="bg-gradient-to-l from-primary to-cyan-400 bg-clip-text text-transparent">מחכה לכם</span> בפנים
              </h2>
            </div>
          </RevealSection>

          <div className="grid lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-2 space-y-2.5">
              {showcaseItems.map((item, i) => (
                <RevealSection key={item.title} delay={i * 80}>
                  <button
                    onMouseEnter={() => setActiveShowcase(i)}
                    onClick={() => setActiveShowcase(i)}
                    className={`w-full text-right rounded-xl border p-4 transition-all duration-300 group ${
                      activeShowcase === i
                        ? "border-primary/40 bg-primary/[0.07] shadow-lg shadow-primary/10"
                        : "border-border/30 bg-white/[0.01] hover:border-primary/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${activeShowcase === i ? "bg-primary/20 text-primary scale-110" : "bg-muted/20 text-foreground/40 group-hover:bg-primary/10 group-hover:text-primary/60"}`}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold transition-colors ${activeShowcase === i ? "text-primary" : "text-foreground/80"}`}>{item.title}</h4>
                        <p className="text-[11px] text-foreground/40 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  </button>
                </RevealSection>
              ))}
            </div>

            <RevealSection delay={200} className="lg:col-span-3">
              <div className="relative min-h-[420px]">
                {showcaseItems.map((item, i) => (
                  <div key={item.title} className={`absolute inset-0 rounded-2xl border overflow-hidden transition-all duration-500 ${
                    activeShowcase === i ? "opacity-100 z-30 border-primary/35 shadow-2xl shadow-primary/10 scale-100" : "opacity-0 z-10 scale-[0.98] pointer-events-none"
                  }`}>
                    <div className={`h-full bg-gradient-to-br ${item.accent} bg-card/50 backdrop-blur-sm p-7 flex flex-col`}>
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-l from-transparent via-primary/40 to-transparent" />
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/25">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                          <p className="text-xs text-primary/70 mt-0.5">{item.callout}</p>
                        </div>
                      </div>
                      <div className="space-y-2.5 flex-1">
                        {item.features.map((feature, fi) => (
                          <div key={fi} className="flex items-start gap-3 rounded-lg border border-border/20 bg-background/30 backdrop-blur-sm px-3 py-2.5 transition-all hover:border-primary/25 hover:bg-background/50">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                              <Check className="h-3 w-3" />
                            </div>
                            <span className="text-xs text-foreground/75 leading-relaxed">{feature}</span>
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
      {/* S4 — BROKERS                                      */}
      {/* ================================================ */}
      <section id="brokers" className="border-t border-border/20 px-4 py-16 md:py-24 relative overflow-hidden">
        {/* BG glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/[0.025] rounded-full blur-[150px]" />
        </div>

        <div className="mx-auto max-w-6xl relative">
          {/* Header */}
          <RevealSection>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-5">
                <span className="text-sm">🔌</span>
                <span className="text-xs font-bold text-primary font-mono tracking-widest">תאימות מלאה</span>
              </div>
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground leading-tight">
                סנכרון אוטומטי עם{" "}
                <span className="bg-gradient-to-l from-primary via-cyan-400 to-primary bg-clip-text text-transparent">כל הברוקרים</span>
              </h2>
              <p className="mt-4 text-sm text-foreground/40 max-w-md mx-auto">
                חברו פעם אחת — ZenTrade מסנכרן את כל העסקאות שלכם אוטומטית
              </p>
            </div>
          </RevealSection>

          {/* Stats row */}
          <RevealSection delay={100}>
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
              {[
                { val: "10+", label: "פלטפורמות" },
                { val: "100+", label: "ברוקרים נתמכים" },
                { val: "< 1 שנ'", label: "זמן סנכרון" },
              ].map((s) => (
                <div key={s.label} className="text-center rounded-2xl border border-border/30 bg-white/[0.02] py-4">
                  <div className="font-heading text-2xl font-extrabold text-primary">{s.val}</div>
                  <div className="text-[10px] text-foreground/40 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </RevealSection>

          {/* Marquee row 1 — right to left */}
          <RevealSection delay={150}>
            <div className="relative overflow-hidden mb-4">
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
              <div className="flex gap-6 animate-[marquee_32s_linear_infinite]">
                {[...brokerLogos.slice(0, 6), ...brokerLogos.slice(0, 6)].map((broker, i) => (
                  <BrokerCard key={i} broker={broker} />
                ))}
              </div>
            </div>

            {/* Marquee row 2 — left to right (reversed) */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
              <div className="flex gap-4 animate-marquee-reverse">
                {[...brokerLogos.slice(4), ...brokerLogos.slice(4)].map((broker, i) => (
                  <BrokerCard key={i} broker={broker} />
                ))}
              </div>
            </div>
          </RevealSection>

          {/* Bottom note */}
          <RevealSection delay={250}>
            <div className="mt-10 text-center">
              <p className="text-[11px] text-foreground/25 font-mono">
                + DXtrade • MatchTrader • cTrader • TopstepX • Apex • Earn2Trade ועוד...
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ================================================ */}
      {/* S5 — TESTIMONIALS                                  */}
      {/* ================================================ */}
      <section id="testimonials" className="border-t border-border/20 px-4 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <RevealSection>
            <div className="text-center mb-14">
              <FloatingBadge text="סוחרים אמיתיים, תוצאות אמיתיות" icon={Star} />
              <h2 className="mt-4 font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                סוחרים שהפסיקו להמר{" "}
                <span className="bg-gradient-to-l from-primary to-cyan-400 bg-clip-text text-transparent">והתחילו לעבוד חכם</span>
              </h2>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <RevealSection key={t.name} delay={i * 120}>
                <div className="group relative rounded-2xl border border-border/40 bg-white/[0.02] p-6 h-full flex flex-col overflow-hidden transition-all duration-400 hover:border-primary/25 hover:bg-primary/[0.03] hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-l from-transparent via-primary/0 to-transparent group-hover:via-primary/30 transition-all duration-500" />
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, s) => <Star key={s} className="h-3.5 w-3.5 fill-accent text-accent" />)}
                  </div>
                  <Quote className="h-5 w-5 text-primary/15 mb-2" />
                  <p className="text-sm text-foreground/80 leading-relaxed flex-1">"{t.quote}"</p>
                  <div className="mt-5 pt-4 border-t border-border/20 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center border border-primary/20 shadow-[0_0_10px_rgba(0,212,170,0.1)]">
                      <span className="text-sm font-bold text-primary">{t.avatar}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{t.name}</p>
                      <p className="text-[10px] text-foreground/50">{t.role}</p>
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
      <section id="pricing" className="border-t border-border/20 px-4 py-16 md:py-24 lg:py-32 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[120px]" />
        </div>

        <div className="mx-auto max-w-5xl relative">
          {/* Header */}
          <RevealSection>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-5">
                <span className="text-sm">💎</span>
                <span className="text-xs font-bold text-accent font-mono tracking-widest">PRICING</span>
              </div>
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground leading-tight">
                תוכניות שמתאימות{" "}
                <span className="bg-gradient-to-l from-accent via-yellow-400 to-accent bg-clip-text text-transparent">לכל שלב</span>
              </h2>
              <p className="mt-4 text-sm text-foreground/40 max-w-sm mx-auto">
                התחל בחינם ב-7 ימים מלאים. שדרג כשאתה מוכן.
              </p>
            </div>
          </RevealSection>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-4 items-stretch">
            {pricingPlans.map((plan, i) => (
              <RevealSection key={plan.id} delay={i * 100}>
                {plan.recommended ? (
                  /* ── PRO (recommended) — animated gradient border ── */
                  <div
                    className="relative h-full p-[1.5px] rounded-3xl"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary)), hsl(43 72% 52%), hsl(var(--primary)), hsl(43 72% 52%), hsl(var(--primary)))",
                      backgroundSize: "300% 100%",
                      animation: "gradientBorder 4s linear infinite",
                    }}
                  >
                    <div className="relative h-full rounded-3xl bg-[hsl(var(--background))] flex flex-col overflow-hidden">
                      {/* Top glow strip */}
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                      {/* Popular badge */}
                      <div className="absolute -top-px left-1/2 -translate-x-1/2">
                        <div className="flex items-center gap-1.5 rounded-b-2xl bg-primary px-5 py-1.5 shadow-lg shadow-primary/30">
                          <span className="text-[10px]">⚡</span>
                          <span className="text-[10px] font-bold text-primary-foreground tracking-widest">הכי פופולרי</span>
                        </div>
                      </div>

                      <div className="p-7 pt-10 flex flex-col h-full">
                        {/* Plan identity */}
                        <div className="mb-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 border border-primary/25 text-2xl shadow-[0_0_20px_rgba(0,212,170,0.15)]">
                              {plan.emoji}
                            </div>
                            <div>
                              <p className="text-xs font-black text-primary tracking-[0.2em] font-mono">{plan.name}</p>
                              <p className="text-base font-bold text-foreground mt-0.5">{plan.headline}</p>
                            </div>
                          </div>
                          <p className="text-[11px] text-foreground/40 leading-relaxed">{plan.sub}</p>
                        </div>

                        {/* Price */}
                        <div className="mb-7 pb-6 border-b border-primary/15">
                          <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-extrabold text-foreground tracking-tight">{plan.price}</span>
                            <span className="text-sm text-foreground/35 font-medium">/{plan.period}</span>
                          </div>
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 flex-1 mb-7">
                          {plan.features.map((f) => (
                            <li key={f.text} className="flex items-center gap-3">
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/25">
                                <Check className="h-3 w-3 text-primary" />
                              </div>
                              <span className={`text-[13px] ${f.highlight ? "text-foreground font-semibold" : "text-foreground/65"}`}>{f.text}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => openModal("register")}
                          className="w-full rounded-2xl bg-primary text-primary-foreground py-3.5 text-sm font-bold shadow-lg shadow-primary/25 hover:brightness-110 hover:shadow-primary/35 transition-all duration-200 active:scale-[0.98]"
                        >
                          {plan.cta}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : plan.id === "promax" ? (
                  /* ── PROP FIRM — dark gold premium card ── */
                  <div className="relative h-full rounded-3xl border border-accent/20 bg-gradient-to-b from-accent/[0.06] to-transparent flex flex-col overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:border-accent/35 hover:shadow-xl hover:shadow-accent/10">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

                    {/* Elite badge */}
                    <div className="absolute top-4 left-4">
                      <span className="flex items-center gap-1 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-[10px] font-bold text-accent tracking-widest">
                        👑 אליט
                      </span>
                    </div>

                    <div className="p-7 pt-12 flex flex-col h-full">
                      {/* Plan identity */}
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20 text-2xl">
                            {plan.emoji}
                          </div>
                          <div>
                            <p className="text-xs font-black text-accent tracking-[0.2em] font-mono">{plan.name}</p>
                            <p className="text-base font-bold text-foreground mt-0.5">{plan.headline}</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-foreground/40 leading-relaxed">{plan.sub}</p>
                      </div>

                      {/* Price */}
                      <div className="mb-7 pb-6 border-b border-accent/10">
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-extrabold text-foreground tracking-tight">{plan.price}</span>
                          <span className="text-sm text-foreground/35 font-medium">/{plan.period}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 flex-1 mb-7">
                        {plan.features.map((f) => (
                          <li key={f.text} className="flex items-center gap-3">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 border border-accent/20">
                              <Check className="h-3 w-3 text-accent" />
                            </div>
                            <span className={`text-[13px] ${f.highlight ? "text-foreground font-semibold" : "text-foreground/65"}`}>{f.text}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => openModal("register")}
                        className="w-full rounded-2xl bg-accent/15 border border-accent/25 text-accent py-3.5 text-sm font-bold hover:bg-accent/25 hover:border-accent/40 transition-all duration-200 active:scale-[0.98]"
                      >
                        {plan.cta}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── FREE — minimal clean card ── */
                  <div className="relative h-full rounded-3xl border border-border/30 bg-white/[0.02] flex flex-col overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:border-border/60 hover:bg-white/[0.04]">
                    {/* Free trial badge */}
                    <div className="absolute top-4 left-4">
                      <span className="flex items-center gap-1 rounded-full bg-primary/8 border border-primary/15 px-3 py-1 text-[10px] font-bold text-primary/80 tracking-widest">
                        🚀 חינם
                      </span>
                    </div>

                    <div className="p-7 pt-12 flex flex-col h-full">
                      {/* Plan identity */}
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/20 border border-border/40 text-2xl">
                            {plan.emoji}
                          </div>
                          <div>
                            <p className="text-xs font-black text-foreground/40 tracking-[0.2em] font-mono">{plan.name}</p>
                            <p className="text-base font-bold text-foreground mt-0.5">{plan.headline}</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-foreground/40 leading-relaxed">{plan.sub}</p>
                      </div>

                      {/* Price */}
                      <div className="mb-7 pb-6 border-b border-border/20">
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-extrabold text-foreground tracking-tight">{plan.price}</span>
                          <span className="text-sm text-foreground/35 font-medium">/{plan.period}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 flex-1 mb-7">
                        {plan.features.map((f) => (
                          <li key={f.text} className="flex items-center gap-3">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted/30 border border-border/30">
                              <Check className="h-3 w-3 text-foreground/50" />
                            </div>
                            <span className="text-[13px] text-foreground/55">{f.text}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => openModal("register")}
                        className="w-full rounded-2xl border border-border/40 bg-white/[0.04] text-foreground/60 py-3.5 text-sm font-semibold hover:border-primary/30 hover:text-foreground/80 transition-all duration-200 active:scale-[0.98]"
                      >
                        {plan.cta}
                      </button>
                    </div>
                  </div>
                )}
              </RevealSection>
            ))}
          </div>

          {/* Trust line */}
          <RevealSection delay={400}>
            <div className="text-center mt-10">
              <p className="text-[11px] text-foreground/25 font-mono tracking-wide">
                ביטול בכל עת • ללא התחייבות • תשלום מאובטח דרך Lemon Squeezy
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ================================================ */}
      {/* S7 — FAQ                                          */}
      {/* ================================================ */}
      <section id="faq" className="border-t border-border/20 px-4 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl">
          <RevealSection>
            <div className="text-center mb-12">
              <FloatingBadge text="FAQ" icon={Brain} />
              <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold text-foreground">שאלות נפוצות</h2>
            </div>
          </RevealSection>
          <RevealSection delay={150}>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border/30 bg-white/[0.02] px-5 transition-all hover:border-primary/20 data-[state=open]:border-primary/25 data-[state=open]:bg-primary/[0.03]">
                  <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-4">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-xs text-foreground/60 leading-relaxed pb-5">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </RevealSection>
        </div>
      </section>

      {/* ================================================ */}
      {/* S8 — FINAL CTA                                    */}
      {/* ================================================ */}
      <section className="border-t border-border/20 px-4 py-24 md:py-32 relative overflow-hidden">
        <GridBackground />
        <RevealSection>
          <div className="relative mx-auto max-w-2xl text-center z-10">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 border border-primary/25 overflow-hidden shadow-[0_0_30px_rgba(0,212,170,0.15)]">
                  <img src={zentradeLogo} alt="ZenTrade" className="h-14 w-14 object-contain" />
                </div>
              </div>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
              מוכנים להפוך
              <br />
              <span className="bg-gradient-to-l from-primary via-cyan-400 to-primary bg-clip-text text-transparent">לסוחרי &quot;כסף חכם&quot;?</span>
            </h2>
            <p className="mt-5 text-sm md:text-base text-foreground/55 leading-relaxed">הירשמו עכשיו ותעדו את העסקה הראשונה שלכם — בחינם.</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <ShimmerButton onClick={() => openModal("register")} className="px-12 py-4 text-base">
                <Zap className="h-5 w-5" />
                הירשמו עכשיו — בחינם
              </ShimmerButton>
            </div>
            <p className="mt-4 text-[11px] text-foreground/30 font-mono">ללא כרטיס אשראי • הגדרה תוך 2 דקות • ביטול בכל עת</p>

            {/* Trust badges */}
            <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
              {[["🔒","SSL מאובטח"],["🛡️","256-bit הצפנה"],["✅","GDPR Compliant"],["⚡","Uptime 99.9%"]].map(([emoji, label]) => (
                <div key={label} className="flex items-center gap-1.5 text-[11px] text-foreground/30">
                  <span>{emoji}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      <WhatsAppWidget />

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/20 px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2.5">
            <img src={zentradeLogo} alt="ZenTrade" className="h-5 w-5 object-contain rounded-md" />
            <span className="font-heading text-sm font-bold text-foreground">ZenTrade</span>
            <span className="text-xs text-foreground/40">• AI-Powered Trading OS</span>
          </div>
          <p className="text-[10px] text-foreground/25 font-mono">© 2026 ZenTrade. כל הזכויות שמורות.</p>
        </div>
      </footer>
      <Footer />

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
      if (error) { toast.error(error.message); } else { setResetSent(true); toast.success("נשלח קישור לאיפוס סיסמה"); }
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
    } catch (err) { toast.error((err as Error)?.message || "שגיאה לא צפויה"); } finally { setSubmitting(false); }
  };

  const inputCls = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-foreground/20 transition-all duration-200 focus:border-primary/50 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-primary/10 hover:border-white/[0.14]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" onClick={onClose} />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/[0.06] rounded-full blur-[130px] pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] max-h-[94vh] overflow-y-auto scrollbar-none">
        <div className="relative rounded-[28px] overflow-hidden border border-white/[0.1] shadow-2xl shadow-black/70">

          {/* Background */}
          <div className="absolute inset-0 bg-[#0B0B12]" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.05] via-transparent to-transparent" />
          {/* Top shimmer line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

          {/* Close button */}
          <button onClick={onClose}
            className="absolute top-4 left-4 z-20 flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-foreground/30 transition-all hover:border-white/[0.15] hover:bg-white/[0.08] hover:text-foreground/70">
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="relative p-7 md:p-8">

            {/* ── Header ── */}
            <div className="text-center mb-7">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-[-8px] rounded-3xl bg-primary/10 blur-xl" />
                  <div className="relative flex h-[54px] w-[54px] items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/30 overflow-hidden shadow-xl shadow-primary/20">
                    <img src={zentradeLogo} alt="ZenTrade" className="h-9 w-9 object-contain" />
                  </div>
                </div>
              </div>
              <h2 className="font-heading text-[22px] font-extrabold text-foreground tracking-tight">
                {forgotMode ? "איפוס סיסמה" : isLogin ? "ברוך הבא בחזרה" : "הצטרף ל-ZenTrade"}
              </h2>
              <p className="text-[11px] text-foreground/35 mt-1.5">
                {forgotMode
                  ? "נשלח לך קישור לאיפוס הסיסמה באימייל"
                  : isLogin
                  ? "התחבר לחשבון שלך ותמשיך לסחור"
                  : "הצטרף ל-12,000+ סוחרים מקצועיים — בחינם"}
              </p>
            </div>

            {/* ── Forgot password flow ── */}
            {forgotMode ? (
              resetSent ? (
                <div className="text-center py-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/25 bg-primary/10 shadow-lg shadow-primary/20">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1.5">הקישור נשלח!</p>
                  <p className="text-xs text-foreground/40 mb-5">בדוק את תיבת הדואר שלך</p>
                  <button onClick={() => { setForgotMode(false); setResetSent(false); }}
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                    חזרה להתחברות ←
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-foreground/40 uppercase tracking-wider">אימייל</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com" dir="ltr" className={`${inputCls} text-left`} />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitting ? "שולח..." : "שלח קישור לאיפוס"}
                  </button>
                  <p className="text-center">
                    <button type="button" onClick={() => setForgotMode(false)}
                      className="text-xs font-semibold text-primary/60 hover:text-primary transition-colors">
                      חזרה להתחברות
                    </button>
                  </p>
                </form>
              )
            ) : (
              <>
                {/* ── Tab switcher ── */}
                <div className="mb-6 flex rounded-2xl border border-white/[0.07] bg-white/[0.03] p-1 gap-1">
                  {([{ label: "התחברות", login: true }, { label: "הרשמה", login: false }] as const).map(({ label, login }) => (
                    <button key={label} onClick={() => setIsLogin(login)}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                        isLogin === login
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                          : "text-foreground/35 hover:text-foreground/60 hover:bg-white/[0.03]"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* ── Social buttons ── */}
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  <button onClick={handleGoogleSignIn} disabled={submitting}
                    className="flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.09] bg-white/[0.04] py-3 text-[12px] font-semibold text-foreground/65 transition-all hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-foreground active:scale-[0.97] disabled:opacity-50">
                    <GoogleIcon />
                    Google
                  </button>
                  <button
                    className="flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.09] bg-white/[0.04] py-3 text-[12px] font-semibold text-foreground/65 transition-all hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-foreground active:scale-[0.97]">
                    <AppleIcon />
                    Apple
                  </button>
                </div>

                {/* ── Divider ── */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-[10px] text-foreground/20 font-medium px-1">או המשך עם אימייל</span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {!isLogin && (
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold text-foreground/40 uppercase tracking-wider">שם מלא</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="הכנס את שמך" className={inputCls} />
                    </div>
                  )}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-foreground/40 uppercase tracking-wider">אימייל</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com" dir="ltr" className={`${inputCls} text-left`} />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-foreground/40 uppercase tracking-wider">סיסמה</label>
                      {isLogin && (
                        <button type="button" onClick={() => setForgotMode(true)}
                          className="text-[11px] text-primary/50 hover:text-primary transition-colors font-medium">
                          שכחת סיסמה?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" dir="ltr"
                        className={`${inputCls} text-left pr-12`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground/50 transition-colors p-1">
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button type="submit" disabled={submitting}
                    className="group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-55 flex items-center justify-center gap-2 mt-1"
                    style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, #3B82F6 100%)", boxShadow: "0 4px 24px hsl(var(--primary) / 0.25)" }}>
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitting ? "מעבד..." : isLogin ? "היכנס לחשבון" : "צור חשבון חינם"}
                  </button>
                </form>

                {/* Switch mode */}
                <p className="mt-5 text-center text-[11px] text-foreground/30">
                  {isLogin ? "אין לך חשבון?" : "כבר יש לך חשבון?"}{" "}
                  <button onClick={() => setIsLogin(!isLogin)}
                    className="text-primary font-bold hover:text-primary/80 transition-colors">
                    {isLogin ? "הירשם עכשיו" : "התחבר"}
                  </button>
                </p>

                {/* Demo link */}
                <div className="mt-4 text-center">
                  <a href="/demo" className="inline-flex items-center gap-1.5 text-[11px] text-foreground/30 hover:text-primary transition-colors font-medium">
                    <Eye className="h-3 w-3" />
                    רוצה לראות קודם? צפה בדמו חי ←
                  </a>
                </div>

                {/* Trust row */}
                <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-center gap-5">
                  {[
                    { icon: Lock,   label: "SSL מאובטח" },
                    { icon: Shield, label: "256-bit" },
                    { icon: Check,  label: "GDPR" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-[9px] text-foreground/20">
                      <Icon className="h-2.5 w-2.5" />
                      {label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== Icons ===== */
const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

/* ===== Static Data ===== */
const showcaseItems = [
  {
    title: "אנציקלופדיה של אסטרטגיות",
    desc: "תיעוד מקיף ל-SMC, ICT, Price Action, Order Flow.",
    callout: "כל אסטרטגיה. כל סטאפ. הכל מתועד ומנותח.",
    icon: <BookOpen className="h-5 w-5" />,
    features: ["תיעוד אוטומטי: BOS, CHoCH, FVG, Order Blocks","זיהוי Liquidity Sweeps ו-Inducement Zones","Entry Models: OTE, Breaker Blocks","Multi-Timeframe Analysis — מ-Monthly ועד 1M","תיוג חכם: Session, Kill Zones, News Events","השוואת ביצועים בין אסטרטגיות"],
    accent: "from-cyan-500/10 to-blue-600/10",
  },
  {
    title: "ניהול סיכונים חכם",
    desc: "ה-Kill-Switch שלכם מופעל. הגנה אוטומטית 24/7.",
    callout: "Kill-Switch פעיל — הגנת חשבון אוטומטית.",
    icon: <Shield className="h-5 w-5" />,
    features: ["Kill-Switch — נעילה אחרי הפסד יומי מוגדר","Tilt Detection בזמן אמת","מעקב Max Drawdown יומי / שבועי / חודשי","הגבלת עסקאות יומית (Over-Trading Protection)","Risk/Reward Ratio, Win Rate, Expectancy","FOMO Guard — חסימה בזמני חדשות High-Impact"],
    accent: "from-rose-500/10 to-red-600/10",
  },
  {
    title: "דוחות ביצועים מתקדמים",
    desc: "כל הדאטה שלכם, מכל הברוקרים, במקום אחד.",
    callout: "Win Rate, Profit Factor, Drawdown — אוטומטי.",
    icon: <BarChart3 className="h-5 w-5" />,
    features: ["Heatmap — ביצועים לפי יום ושעה","Profit Factor, Expectancy, Sharpe Ratio","השוואת Long vs Short","Win Rate לפי סטאפ, Session, Timeframe","גרפי Equity Curve עם Drawdown Overlay","דוחות שבועיים/חודשיים לייצוא PDF"],
    accent: "from-emerald-500/10 to-green-600/10",
  },
  {
    title: "מחשבון מס ישראלי",
    desc: "חישוב 25% מס רווחי הון — אוטומטי, מדויק, PDF.",
    callout: "חסכו שעות של חישובים — הכל אוטומטי.",
    icon: <Calculator className="h-5 w-5" />,
    features: ["חישוב 25% מס רווחי הון לפי חוק ישראלי","קיזוז הפסדים אוטומטי (Netting)","הפחתת עמלות ברוקר מהרווח החייב","ייצוא דוח PDF מקצועי לרואה חשבון","תמיכה במט\"ח, מניות, קריפטו, CFDs","חישוב שיעור מס אפקטיבי בזמן אמת"],
    accent: "from-yellow-500/10 to-amber-600/10",
  },
];

const brokerLogos = [
  { name: "MetaTrader 5",        logo: logoMt5,         category: "פלטפורמה", color: "#1565C0", logoBg: "transparent" },
  { name: "MetaTrader 4",        logo: logoMt4,         category: "פלטפורמה", color: "#0D47A1", logoBg: "transparent" },
  { name: "TradingView",         logo: logoTradingView, category: "פלטפורמה", color: "#1E88E5", logoBg: "transparent" },
  { name: "Rithmic",             logo: logoRithmic,     category: "נתונים",   color: "#00897B", logoBg: "transparent" },
  { name: "Interactive Brokers", logo: logoIbkr,        category: "ברוקר",   color: "#D32F2F", logoBg: "transparent" },
  { name: "TradeLocker",         logo: logoTradeLocker, category: "Prop Firm", color: "#7B1FA2", logoBg: "transparent" },
  { name: "TopstepX",            logo: logoTopstep,     category: "Prop Firm", color: "#F57C00", logoBg: "transparent" },
  { name: "Binance",             logo: logoBinance,     category: "קריפטו",  color: "#F59E0B", logoBg: "#111111" },
  { name: "Forex.com",           logo: logoForex,       category: "ברוקר",   color: "#1565C0", logoBg: "transparent" },
  { name: "NinjaTrader",         logo: logoNinjaTrader, category: "פלטפורמה", color: "#E53935", logoBg: "transparent" },
];

const testimonials = [
  { name: "דניאל כ.", avatar: "ד", role: "סוחר SMC Funded • FTMO", quote: "המערכת הצילה אותי מ-FOMO פעם אחר פעם. מאז שהתחלתי להשתמש ב-ZenTrade, ה-Win Rate שלי עלה ב-15%. התיעוד האוטומטי של סטאפים SMC חסך לי שעות." },
  { name: "שירה מ.", avatar: "ש", role: "Price Action Trader • 4 שנות ניסיון", quote: "העובדה שהמערכת נועלת אותי כשאני מתקרבת ל-Drawdown היומי הצילה לי את חשבון ה-Prop Firm. הניתוח של דפוסי Price Action פשוט מדהים." },
  { name: "אלון ר.", avatar: "א", role: "Order Flow Trader • קריפטו + מדדים", quote: "היומן האוטומטי חסך לי שעות כל שבוע. במקום לרשום עסקאות ידנית, אני מקבל ניתוח מלא עם תובנות AI. הסנכרון מ-Rithmic ו-TradingView עובד חלק." },
];

const pricingPlans = [
  {
    id: "free",
    badge: "ניסיון חינם",
    name: "LITE",
    headline: "7 ימים ללא עלות",
    sub: "ללא כרטיס אשראי",
    price: "₪0",
    period: "7 ימים",
    emoji: "🚀",
    color: "primary" as const,
    recommended: false,
    cta: "התחל עכשיו בחינם",
    features: [
      { text: "גישה מלאה ל-7 ימים", highlight: false },
      { text: "יומן מסחר מלא", highlight: false },
      { text: "מנטור AI", highlight: false },
      { text: "Kill Switch הגנת הון", highlight: false },
      { text: "ניתוח סטטיסטי", highlight: false },
    ],
  },
  {
    id: "pro",
    badge: "הכי פופולרי",
    name: "PRO",
    headline: "לסוחרים רציניים",
    sub: "הכלים שמקצוענים משתמשים בהם",
    price: "₪99",
    period: "חודש",
    emoji: "⚡",
    color: "primary" as const,
    recommended: true,
    cta: "שדרג ל-Pro עכשיו",
    features: [
      { text: "עסקאות ללא הגבלה", highlight: true },
      { text: "מנטור AI מתקדם", highlight: true },
      { text: "Bodyguard & FOMO Detection", highlight: false },
      { text: "מחשבון מס + ייצוא PDF", highlight: false },
      { text: "בקטסטינג מלא", highlight: false },
      { text: "ניתוח סטטיסטי Real-Time", highlight: false },
    ],
  },
  {
    id: "promax",
    badge: "אליט",
    name: "PROP FIRM",
    headline: "לסוחרים ממומנים",
    sub: "הגנה מלאה על חשבון Prop Firm",
    price: "₪199",
    period: "חודש",
    emoji: "👑",
    color: "accent" as const,
    recommended: false,
    cta: "הצטרף לאליט",
    features: [
      { text: "הכל בחבילת Pro +", highlight: true },
      { text: "הגנת Prop Firm מלאה", highlight: true },
      { text: "קבוצת VIP בטלגרם", highlight: false },
      { text: "גישה ל-API מלאה", highlight: false },
      { text: "תמיכה 24/7", highlight: false },
    ],
  },
];

const faqs = [
  { q: "האם המידע שלי מאובטח?", a: "בהחלט. אנחנו משתמשים בהצפנה מקצה לקצה (AES-256) ולא שומרים סיסמאות ברוקר. החיבור מתבצע דרך API keys עם הרשאות קריאה בלבד." },
  { q: "האם צריך לחבר את הברוקר ישירות?", a: "אפשר לחבר דרך API לסנכרון אוטומטי, אבל זה לא חובה. אפשר גם לייבא עסקאות ידנית או להעלות קבצי CSV." },
  { q: "איזה אסטרטגיות מסחר נתמכות?", a: "ZenTrade תומך בכל אסטרטגיה מודרנית: SMC, ICT, Price Action, Order Flow, קווי מגמה, תמיכה/התנגדות, ועוד." },
  { q: "האם השירות בחינם?", a: "יש חבילה חינמית שכוללת את רוב הכלים הבסיסיים. חבילות Premium מוסיפות ניתוח AI מתקדם, התראות בזמן אמת, והגנת Prop Firm." },
  { q: "באילו פלטפורמות אתם תומכים?", a: "MetaTrader 5, Binance, TradeLocker, TradingView, Rithmic, Interactive Brokers, TopstepX, NinjaTrader, Forex.com ועוד." },
];

export default AuthPage;
