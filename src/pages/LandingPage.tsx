import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import ZenTradeLogo from "@/components/ZenTradeLogo";
import {
  ArrowUpRight, ArrowDownRight, Brain, Shield,
  Zap, TrendingUp, Check, Lock, Star, ChevronLeft,
  AlertTriangle, Flame, HeartCrack, Play, X, Sparkles,
  BarChart3, Target, Clock, Eye,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════════ */

const useMousePos = () => {
  const ref = useRef({ x: 0.5, y: 0.5 });
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    let rafId: number;
    const h = (e: MouseEvent) => {
      ref.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => forceUpdate(n => n + 1));
    };
    window.addEventListener("mousemove", h, { passive: true });
    return () => { window.removeEventListener("mousemove", h); cancelAnimationFrame(rafId); };
  }, []);
  return ref.current;
};

const useScrollReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = "1";
          (e.target as HTMLElement).style.transform = "translateY(0)";
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );
    els.forEach(el => {
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = "translateY(42px)";
      (el as HTMLElement).style.transition = "opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)";
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
};

const useCountUp = (target: number, duration = 1800) => {
  const [count, setCount] = useState(0);
  const triggered = useRef(false);
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !triggered.current) {
        triggered.current = true;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (elRef.current) observer.observe(elRef.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, elRef] as const;
};

/* ═══════════════════════════════════════════════════════════
   CUSTOM CURSOR GLOW
═══════════════════════════════════════════════════════════ */
const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMove, { passive: true });

    let raf: number;
    const animate = () => {
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.12;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.12;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${targetRef.current.x}px, ${targetRef.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener("mousemove", handleMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="hidden lg:block">
      {/* Dot */}
      <div ref={dotRef} className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(96,165,250,0.9)", boxShadow: "0 0 8px 2px rgba(59,130,246,0.6)" }} />
      {/* Ring */}
      <div ref={ringRef} className="fixed top-0 left-0 z-[9998] pointer-events-none"
        style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(59,130,246,0.35)", animation: "cursor-ring 2.5s ease-in-out infinite" }} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   FLOATING WIN NOTIFICATIONS
═══════════════════════════════════════════════════════════ */
const FLOAT_ITEMS = [
  { text: "+$1,240", sub: "XAUUSD · WIN", color: "#4ade80", delay: 0 },
  { text: "+$680",   sub: "NQ1! · WIN",   color: "#4ade80", delay: 2.8 },
  { text: "73% WR",  sub: "7 day streak", color: "#60a5fa", delay: 5.2 },
  { text: "+$2,105", sub: "BTC · WIN",    color: "#4ade80", delay: 8 },
  { text: "AI ניתח", sub: "EURUSD trade", color: "#a78bfa", delay: 11 },
  { text: "+$390",   sub: "GBP/JPY · WIN",color: "#4ade80", delay: 14 },
];

const FloatingWins = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {FLOAT_ITEMS.map((item, i) => (
      <div key={i}
        className="absolute flex items-center gap-2 rounded-xl border backdrop-blur-xl px-3 py-2"
        style={{
          left: `${8 + (i % 3) * 30}%`,
          bottom: `${10 + (i % 4) * 18}%`,
          borderColor: item.color + "30",
          background: `rgba(0,0,0,0.7)`,
          boxShadow: `0 0 16px ${item.color}18`,
          animation: `float-win-card 5.5s ease-in-out ${item.delay}s infinite`,
          opacity: 0,
        }}>
        <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: item.color }} />
        <div>
          <p className="text-[11px] font-black font-mono" style={{ color: item.color }}>{item.text}</p>
          <p className="text-[8px] font-mono opacity-40 text-white">{item.sub}</p>
        </div>
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   ANIMATED CANVAS
═══════════════════════════════════════════════════════════ */
const TradingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number, t = 0;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const candles: { o: number; h: number; l: number; c: number }[] = [];
    let p = 0.45;
    for (let i = 0; i < 80; i++) {
      const ch = (Math.random() - 0.46) * 0.035;
      const o = p, c = p + ch;
      candles.push({ o, c, h: Math.max(o, c) + Math.random() * 0.012, l: Math.min(o, c) - Math.random() * 0.012 });
      p = c;
    }
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00025, vy: -0.00008 - Math.random() * 0.00015,
      size: 0.8 + Math.random() * 1.8, alpha: 0.03 + Math.random() * 0.08,
    }));

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#06060f";
      ctx.fillRect(0, 0, W, H);

      [
        { x: 0.75, y: 0.35, r: 0.55, c: "rgba(29,78,216,0.07)" },
        { x: 0.15, y: 0.6,  r: 0.4,  c: "rgba(67,56,202,0.05)" },
        { x: 0.5,  y: 0.9,  r: 0.35, c: "rgba(124,58,237,0.04)" },
      ].forEach(g => {
        const grad = ctx.createRadialGradient(g.x*W, g.y*H, 0, g.x*W, g.y*H, g.r*Math.max(W,H));
        grad.addColorStop(0, g.c); grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      });

      ctx.strokeStyle = "rgba(255,255,255,0.008)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 70) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += 56) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      const pts: [number, number][] = [];
      for (let x = 0; x <= W + 10; x += 5) {
        pts.push([x, H*0.52 + Math.sin(x*0.012+t*0.5)*H*0.08 + Math.sin(x*0.005+t*0.18)*H*0.12 + Math.sin(x*0.035+t*0.9)*H*0.025]);
      }
      ctx.beginPath();
      pts.forEach(([x,y],i) => i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y));
      ctx.strokeStyle = "rgba(29,78,216,0.18)"; ctx.lineWidth = 1.5; ctx.stroke();

      const fillGrad = ctx.createLinearGradient(0, H*0.3, 0, H);
      fillGrad.addColorStop(0, "rgba(29,78,216,0.06)");
      fillGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.moveTo(pts[0][0], H);
      pts.forEach(([x,y]) => ctx.lineTo(x,y));
      ctx.lineTo(pts[pts.length-1][0], H);
      ctx.closePath(); ctx.fillStyle = fillGrad; ctx.fill();

      const cZone = { x: W*0.55, y: H*0.6, w: W*0.45, h: H*0.32 };
      const cW = 10, gap = 5;
      const scroll = (t*15) % ((cW+gap)*candles.length);
      candles.forEach((c,i) => {
        const cx = cZone.x + i*(cW+gap) - scroll;
        if (cx < cZone.x-20 || cx > cZone.x+cZone.w+20) return;
        const scY = (v: number) => cZone.y + (1-(v-0.2)/0.5)*cZone.h;
        const alpha = 0.15;
        const col = c.c>=c.o ? `rgba(124,58,237,${alpha})` : `rgba(79,70,229,${alpha*0.7})`;
        ctx.strokeStyle = col; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx+cW/2, scY(c.h)); ctx.lineTo(cx+cW/2, scY(c.l)); ctx.stroke();
        ctx.fillStyle = col;
        ctx.fillRect(cx, scY(Math.max(c.o,c.c)), cW, Math.max(1, scY(Math.min(c.o,c.c))-scY(Math.max(c.o,c.c))));
      });

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -0.01) p.y = 1.01;
        if (p.x < -0.01) p.x = 1.01; if (p.x > 1.01) p.x = -0.01;
        ctx.beginPath(); ctx.arc(p.x*W, p.y*H, p.size, 0, Math.PI*2);
        ctx.fillStyle = `rgba(96,165,250,${p.alpha})`; ctx.fill();
      });

      const tickers = ["+$1,240","73% WR","1:2.8 R:R","BOS","OB","FVG","XAUUSD","+2.4%","FOMC","NQ1!","ICT","SMC"];
      tickers.forEach((tk,i) => {
        const xBase = (W*0.08*i + (i%2===0 ? t*10 : W-t*8)) % (W+200) - 100;
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(96,165,250,0.045)";
        ctx.fillText(tk, xBase, H*(0.05+i*0.08));
      });

      t += 0.007;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
};

/* ═══════════════════════════════════════════════════════════
   ANIMATED PHONE SCREENS (cycles every 4.5s)
═══════════════════════════════════════════════════════════ */

/** Screen 0 — Live chart analysis drawing in real-time */
const PhoneScreen0 = ({ active }: { active: boolean }) => {
  const [drawLine, setDrawLine] = useState(false);
  const [showWin, setShowWin] = useState(false);
  useEffect(() => {
    if (!active) { setDrawLine(false); setShowWin(false); return; }
    const t1 = setTimeout(() => setDrawLine(true), 300);
    const t2 = setTimeout(() => setShowWin(true), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);
  const candles = [
    [10,30,22,20,24],[20,26,17,15,18],[32,23,14,13,16],
    [44,19,11,9,12],[56,13,7,6,8],[68,9,4,3,5],
    [80,6,2,1.5,3],[92,4,1,0.8,1.5],[108,3,0.5,0.3,1],
  ];
  return (
    <div className="bg-[#08080f] px-2.5 pb-3 space-y-2" dir="rtl">
      <div className="flex items-center justify-between py-1.5">
        <p className="text-[9px] font-black text-white/70">ניתוח עסקה · XAUUSD</p>
        <div className="flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/20 px-1.5 py-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[6px] text-blue-400 font-mono font-bold">LIVE</span>
        </div>
      </div>
      <div className="rounded-2xl border border-amber-400/20 overflow-hidden" style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.06) 0%,rgba(29,78,216,0.04) 100%)" }}>
        <div className="p-2.5">
          <div className="h-14 rounded-xl bg-white/[0.02] border border-white/[0.04] p-1 mb-2 overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 160 36" preserveAspectRatio="none">
              {[9,18,27].map(y => <line key={y} x1="0" y1={y} x2="160" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="2,4" />)}
              {candles.map(([x,o,c,l,h], i) => {
                const bull = c < o;
                const clr = bull ? "rgba(34,197,94,0.75)" : "rgba(239,68,68,0.7)";
                return (
                  <g key={i} style={{ opacity: drawLine ? 1 : 0, transition: `opacity 0.2s ${i*0.12}s` }}>
                    <line x1={x} y1={h} x2={x} y2={l} stroke={clr} strokeWidth="0.8" />
                    <rect x={x-2.5} y={Math.min(o,c)} width="5" height={Math.max(0.5,Math.abs(o-c))} fill={clr} rx="0.5" />
                  </g>
                );
              })}
              <polyline
                points="8,32 20,27 32,23 44,19 56,13 68,8 80,5 92,3 110,2 130,1.2 155,0.5"
                fill="none" stroke="rgba(34,197,94,0.65)" strokeWidth="1.5" strokeLinecap="round"
                strokeDasharray="500"
                style={{ strokeDashoffset: drawLine ? 0 : 500, transition: "stroke-dashoffset 2.3s cubic-bezier(0.4,0,0.2,1)" }}
              />
              {drawLine && <circle cx="44" cy="19" r="2.5" fill="rgba(96,165,250,0.85)" style={{ filter:"drop-shadow(0 0 3px rgba(96,165,250,0.6))" }} />}
              {showWin && <>
                <line x1="0" y1="2" x2="160" y2="2" stroke="rgba(34,197,94,0.22)" strokeWidth="0.5" strokeDasharray="4,3" />
                <rect x="128" y="0.2" width="28" height="4" rx="1" fill="rgba(34,197,94,0.12)" />
                <text x="142" y="3.2" fill="rgba(34,197,94,0.75)" fontSize="2.6" textAnchor="middle" fontFamily="monospace">TP ✓</text>
              </>}
            </svg>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-[22px] font-black font-mono leading-none transition-all duration-700 ${showWin ? "text-profit opacity-100" : "opacity-0"}`}>+$1,240</p>
            <span className={`text-[7px] font-bold rounded-full px-1.5 py-0.5 transition-all duration-700 ${showWin ? "bg-profit/10 border border-profit/20 text-profit" : "bg-amber-400/10 border border-amber-400/20 text-amber-400"}`}>
              {showWin ? "WIN ✓" : "ניתוח..."}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-1.5">
            {[["כניסה","2,318"],["יציאה","2,347"],["R:R","1:3.2"]].map(([l,v]) => (
              <div key={l} className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-1 text-center">
                <p className="text-[5px] text-white/20 font-mono">{l}</p>
                <p className="text-[8px] font-bold text-white/60 font-mono">{v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-white/[0.04] px-2.5 py-1.5">
          <div className="rounded-lg bg-blue-500/[0.06] border border-blue-500/10 p-1.5">
            <p className="text-[5px] font-bold text-blue-400/60 font-mono uppercase mb-0.5">AI INSIGHT</p>
            <p className="text-[7px] text-white/35 leading-relaxed">FVG ב-1H, BOS ברור. כניסה על ה-OB בדיוק.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Screen 1 — AI Mentor chat with sequential messages */
const PhoneScreen1 = ({ active }: { active: boolean }) => {
  const [msgStep, setMsgStep] = useState(0);
  useEffect(() => {
    if (!active) { setMsgStep(0); return; }
    const t1 = setTimeout(() => setMsgStep(1), 400);
    const t2 = setTimeout(() => setMsgStep(2), 1300);
    const t3 = setTimeout(() => setMsgStep(3), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);
  return (
    <div className="bg-[#08080f] px-2.5 pb-3" dir="rtl">
      <div className="flex items-center gap-1.5 py-1.5 border-b border-white/[0.04] mb-2">
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500/60 to-purple-600/40 border border-blue-500/30 flex items-center justify-center text-[10px]">🤖</div>
        <div>
          <p className="text-[8px] font-bold text-white/70">ZenTrade AI</p>
          <p className="text-[6px] text-blue-400 font-mono">● מחובר · מנתח</p>
        </div>
        <div className="mr-auto text-[6px] text-white/20 font-mono">GPT-4o</div>
      </div>
      <div className="space-y-2">
        <div style={{ opacity: msgStep >= 1 ? 1 : 0, transform: msgStep >= 1 ? "translateY(0)" : "translateY(6px)", transition: "opacity 0.4s, transform 0.4s" }}>
          <div className="max-w-[80%] rounded-xl rounded-tr-sm bg-white/[0.06] border border-white/[0.06] px-2.5 py-1.5">
            <p className="text-[7.5px] text-white/70 leading-relaxed">למה אני ממשיך להפסיד על EURUSD?</p>
          </div>
        </div>
        {msgStep === 2 && (
          <div className="flex justify-end">
            <div className="rounded-xl rounded-tl-sm bg-blue-500/10 border border-blue-500/15 px-3 py-1.5">
              <div className="flex gap-1 items-center">
                {[0,0.15,0.3].map((d,i) => <div key={i} className="h-1 w-1 rounded-full bg-blue-400/60 animate-bounce" style={{ animationDelay:`${d}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div style={{ opacity: msgStep >= 3 ? 1 : 0, transform: msgStep >= 3 ? "translateY(0)" : "translateY(6px)", transition: "opacity 0.4s, transform 0.4s" }} className="flex justify-end">
          <div className="rounded-xl rounded-tl-sm bg-blue-500/10 border border-blue-500/15 px-2.5 py-2 max-w-[88%]">
            <p className="text-[7px] font-bold text-blue-400 mb-1.5">ZenTrade AI</p>
            {[
              { icon: "⚠️", text: "73% הפסדים — כניסה בגוף נר" },
              { icon: "🎯", text: "London KZ — Win Rate 68%" },
              { icon: "⏰", text: "אחרי 14:00 — WR 23% בלבד" },
            ].map((item,i) => (
              <div key={i} className="flex items-center gap-1 rounded-md bg-white/[0.04] px-1.5 py-0.5 mb-0.5 last:mb-0">
                <span className="text-[8px]">{item.icon}</span>
                <span className="text-[6.5px] text-white/55">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Screen 2 — Stats with animated bar chart + streak */
const PhoneScreen2 = ({ active }: { active: boolean }) => {
  const [barFill, setBarFill] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  useEffect(() => {
    if (!active) { setBarFill(false); setShowStreak(false); return; }
    const t1 = setTimeout(() => setBarFill(true), 350);
    const t2 = setTimeout(() => setShowStreak(true), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);
  const bars = [35,55,40,80,45,90,60,75,50,85,70,95];
  return (
    <div className="bg-[#08080f] px-2.5 pb-3 space-y-2" dir="rtl">
      <div className="flex items-center justify-between py-1.5">
        <p className="text-[9px] font-black text-white/70">סטטיסטיקות</p>
        <span className="text-[7px] text-profit font-mono font-bold">+23.4% החודש</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { l:"Win Rate", v:"73%", c:"text-profit", b:"bg-profit/[0.08] border-profit/20" },
          { l:"Profit Factor", v:"2.41", c:"text-blue-400", b:"bg-blue-400/[0.08] border-blue-400/20" },
        ].map(k => (
          <div key={k.l} className={`rounded-xl border p-2.5 ${k.b}`}>
            <p className="text-[6px] text-white/25 mb-0.5">{k.l}</p>
            <p className={`text-[20px] font-black font-mono leading-none ${k.c}`}>{k.v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
        <p className="text-[7px] text-white/25 mb-1.5">רווח חודשי</p>
        <div className="flex items-end gap-0.5 h-12">
          {bars.map((h,i) => (
            <div key={i} className="flex-1 rounded-t-sm"
              style={{
                height: barFill ? `${h}%` : "3%",
                background: i % 4 === 1 ? "rgba(239,68,68,0.5)" : "rgba(34,197,94,0.6)",
                transition: `height 0.6s ease-out ${i*50}ms`,
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ opacity: showStreak ? 1 : 0, transform: showStreak ? "translateY(0)" : "translateY(6px)", transition: "opacity 0.5s, transform 0.5s" }}
        className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-2 flex items-center gap-2">
        <span className="text-[18px]">🔥</span>
        <div>
          <p className="text-[8px] font-black text-amber-400">7 יום רצוף!</p>
          <p className="text-[6.5px] text-white/25">רצף ניצחון — שיא אישי</p>
        </div>
      </div>
    </div>
  );
};

const PHONE_SCREENS_DATA = [
  { dot: "#f59e0b", Comp: PhoneScreen0 },
  { dot: "#60a5fa", Comp: PhoneScreen1 },
  { dot: "#4ade80", Comp: PhoneScreen2 },
];

const AnimatedPhoneScreen = () => {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => {
      setFading(true);
      setTimeout(() => { setIdx(i => (i + 1) % PHONE_SCREENS_DATA.length); setFading(false); }, 380);
    }, 4600);
    return () => clearInterval(iv);
  }, []);
  const { Comp } = PHONE_SCREENS_DATA[idx];
  return (
    <div className="relative bg-[#08080f] overflow-hidden" style={{ minHeight: 380 }}>
      <div className="flex justify-center gap-1 pt-2 pb-1">
        {PHONE_SCREENS_DATA.map((s, i) => (
          <div key={i} className="rounded-full transition-all duration-300"
            style={{ width: i === idx ? 14 : 4, height: 4, background: i === idx ? s.dot : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>
      <div style={{ opacity: fading ? 0 : 1, transform: fading ? "translateY(8px)" : "translateY(0)", transition: "opacity 0.35s ease, transform 0.35s ease" }}>
        <Comp active={!fading} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PHONE MOCKUP (with scanner)
═══════════════════════════════════════════════════════════ */
const PhoneMockup = ({ mouseX = 0.5, mouseY = 0.5 }: { mouseX?: number; mouseY?: number }) => {
  const rx = (mouseX - 0.5) * 22;
  const ry = (mouseY - 0.5) * 16;
  return (
    <div className="relative select-none flex items-center justify-center" style={{ perspective: "1400px" }}>
      <div className="absolute w-96 h-96 rounded-full bg-blue-600/15 blur-[120px]" />
      <div className="absolute w-64 h-64 rounded-full bg-indigo-500/10 blur-[90px] translate-x-24 translate-y-24" />

      <div className="relative z-10 w-[230px]"
        style={{
          transform: `rotateY(${-14 + rx * 0.15}deg) rotateX(${5 + ry * -0.1}deg) rotateZ(1deg)`,
          filter: "drop-shadow(0 80px 160px rgba(0,0,0,0.9))",
          transition: "transform 0.1s ease-out",
        }}>
        <div className="rounded-[40px] border-[7px] border-white/10 bg-[#08080f] overflow-hidden relative"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.04)" }}>

          {/* Scanner line */}
          <div className="absolute inset-x-0 h-[2px] pointer-events-none z-20"
            style={{
              background: "linear-gradient(to right, transparent, rgba(59,130,246,0.8), transparent)",
              boxShadow: "0 0 12px 2px rgba(59,130,246,0.4)",
              animation: "scan-line 3.5s linear infinite",
            }} />

          <div className="flex justify-center pt-2.5 pb-1 bg-[#08080f]">
            <div className="w-[80px] h-[22px] rounded-full bg-black border border-white/[0.06] flex items-center justify-end pr-2.5 gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
              <div className="h-2 w-2 rounded-full bg-white/[0.07]" />
            </div>
          </div>

          <AnimatedPhoneScreen />
        </div>
        <div className="absolute -left-[6px] top-28 w-[5px] h-9 rounded-l-md bg-white/[0.07]" />
        <div className="absolute -left-[6px] top-44 w-[5px] h-16 rounded-l-md bg-white/[0.07]" />
        <div className="absolute -right-[6px] top-36 w-[5px] h-14 rounded-r-md bg-white/[0.07]" />
      </div>

      {/* Floating labels */}
      <div className="absolute -left-6 top-1/4 flex flex-col gap-2 z-20">
        <div className="flex items-center gap-1.5 rounded-xl border border-profit/25 bg-black/80 backdrop-blur-xl px-2.5 py-1.5 shadow-xl">
          <span className="h-1.5 w-1.5 rounded-full bg-profit animate-pulse" />
          <span className="text-[9px] font-bold text-profit font-mono">AI מנתח</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-amber-400/25 bg-black/80 backdrop-blur-xl px-2.5 py-1.5 shadow-xl">
          <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
          <span className="text-[9px] font-bold text-amber-400 font-mono">+23.4% החודש</span>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   WAVEFORM BARS (שירים מגניבים — The Rhythm)
═══════════════════════════════════════════════════════════ */
const WaveformBars = ({ count = 48, color = "#3b82f6", height = 64 }: { count?: number; color?: string; height?: number }) => (
  <div className="flex items-end gap-[2px]" style={{ height }}>
    {Array.from({ length: count }).map((_, i) => {
      const delay = (i / count) * 1.6;
      const duration = 0.6 + (Math.sin(i * 0.7) * 0.3 + 0.5) * 0.8;
      return (
        <div key={i} className="flex-1 rounded-t-sm"
          style={{
            background: `linear-gradient(to top, ${color}40, ${color}cc)`,
            transformOrigin: "bottom",
            animation: `waveform-rise ${duration}s ease-in-out ${delay}s infinite`,
            boxShadow: `0 0 4px ${color}30`,
            minWidth: 3,
          }} />
      );
    })}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   TICKER TAPE
═══════════════════════════════════════════════════════════ */
const TAPE = ["SUPPORTING ELITE PLATFORMS","•","BINANCE","•","FOREX.COM","•","TOPSTEPX","•","NINJATRADER","•","INTERACTIVE BROKERS","•","TRADELOCKER","•","METATRADER 5","•","TRADINGVIEW","•","RITHMIC","•"];

const TickerTape = () => (
  <div className="relative overflow-hidden border-y border-white/[0.04] py-3.5"
    style={{ background: "rgba(6,6,15,0.8)", backdropFilter: "blur(20px)" }}>
    <div className="absolute inset-y-0 left-0 w-32 z-10"
      style={{ background: "linear-gradient(to right, #06060f, transparent)" }} />
    <div className="absolute inset-y-0 right-0 w-32 z-10"
      style={{ background: "linear-gradient(to left, #06060f, transparent)" }} />
    <div className="flex animate-ticker whitespace-nowrap">
      {[...TAPE, ...TAPE].map((t, i) => (
        <span key={i}
          className={`mx-5 text-[10px] tracking-[0.25em] font-mono ${t === "•" ? "text-blue-500/30" : "font-semibold"}`}
          style={{ color: t === "•" ? undefined : "rgba(255,255,255,0.18)" }}>{t}</span>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   SECTION DIVIDER
═══════════════════════════════════════════════════════════ */
const SectionDivider = ({ color = "rgba(59,130,246,0.12)" }: { color?: string }) => (
  <div className="relative h-px mx-auto max-w-6xl">
    <div className="absolute inset-0" style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)` }} />
    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
      style={{ background: color, boxShadow: `0 0 12px 4px ${color}` }} />
  </div>
);

/* ═══════════════════════════════════════════════════════════
   TRADER VITAL SIGNS — Cinematic EKG Monitor
═══════════════════════════════════════════════════════════ */

// The full emotional journey path — complex multi-peak waveform
const EKG_PATH = "M 0,80 L 40,80 L 55,80 L 60,72 L 65,80 L 80,80 L 90,80 L 100,20 L 108,95 L 116,10 L 124,80 L 135,80 L 150,80 L 160,55 L 170,80 L 185,80 L 200,80 L 215,80 L 220,68 L 228,80 L 235,80 L 250,80 L 260,80 L 270,5 L 278,100 L 286,2 L 294,80 L 310,80 L 320,80 L 340,80 L 355,45 L 365,80 L 380,80 L 400,80 L 410,80 L 415,70 L 422,80 L 430,80 L 450,80 L 460,30 L 470,90 L 478,18 L 486,80 L 500,80 L 520,80 L 530,80 L 545,80 L 555,100 L 565,108 L 578,115 L 592,105 L 608,80 L 625,80 L 645,80 L 660,108 L 672,118 L 688,112 L 700,80 L 720,80 L 740,80 L 755,68 L 762,80 L 772,80 L 790,80 L 800,80 L 810,20 L 818,95 L 826,12 L 834,80 L 850,80 L 870,80 L 880,65 L 888,80 L 900,80";

const EMOTION_MARKERS = [
  { x: 40,  label: "שיעמום",      color: "#94a3b8", sub: "BOREDOM" },
  { x: 116, label: "FOMO",        color: "#fbbf24", sub: "FEAR OF MISSING OUT" },
  { x: 270, label: "WIN",         color: "#4ade80", sub: "EUPHORIA" },
  { x: 365, label: "ביטחון יתר", color: "#f59e0b", sub: "OVERCONFIDENCE" },
  { x: 478, label: "TILT",        color: "#ef4444", sub: "EMOTIONAL TRADE" },
  { x: 592, label: "נקמה",        color: "#dc2626", sub: "REVENGE TRADING" },
  { x: 700, label: "BLOWUP",      color: "#7f1d1d", sub: "ACCOUNT DAMAGE" },
  { x: 826, label: "החלטה",       color: "#818cf8", sub: "RESET" },
];

const VITALS = [
  { label: "HEART RATE",   value: "94 BPM",  sub: "EMOTIONAL FREQUENCY", color: "#ef4444", trend: "↑" },
  { label: "P&L PRESSURE", value: "-$1,240", sub: "REVENGE CYCLE ACTIVE", color: "#f87171", trend: "↓" },
  { label: "RISK LEVEL",   value: "CRITICAL", sub: "POSITION SIZE 4X",   color: "#fbbf24", trend: "⚠" },
  { label: "PSYCH SCORE",  value: "23 / 100", sub: "TILT DETECTED",      color: "#a78bfa", trend: "↓" },
];

const TraderVitalSigns = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const [activeMarker, setActiveMarker] = useState<number>(-1);
  const [scanX, setScanX] = useState(0);
  const [started, setStarted] = useState(false);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const DURATION = 6000;

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.25 });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const animate = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = (now - startTimeRef.current) % DURATION;
      const pct = elapsed / DURATION;
      setScanX(pct * 100);
      // Activate nearest marker
      const px = pct * 900;
      const nearest = EMOTION_MARKERS.reduce((best, m, i) => {
        const d = Math.abs(m.x - px);
        return d < best.d ? { d, i } : best;
      }, { d: Infinity, i: -1 });
      if (nearest.d < 30) setActiveMarker(nearest.i);
      else setActiveMarker(-1);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [started]);

  const pathLen = 1800;

  return (
    <section className="py-24 px-4 relative overflow-hidden" ref={containerRef}>
      <style>{`
        @keyframes ekgScan {
          0%   { stroke-dashoffset: ${pathLen}; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes vitalPulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
        @keyframes scanGlow {
          0%,100% { box-shadow: 0 0 8px rgba(34,211,238,0.8); }
          50%      { box-shadow: 0 0 20px rgba(34,211,238,1), 0 0 40px rgba(34,211,238,0.5); }
        }
        @keyframes markerAppear {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes flatline {
          0%,100% { opacity: 0.3; }
          50%      { opacity: 0.8; }
        }
        @keyframes barDance {
          0%,100% { transform: scaleY(0.3); }
          50%      { transform: scaleY(1); }
        }
      `}</style>

      {/* Deep bg */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(239,68,68,0.04) 0%, rgba(124,58,237,0.03) 50%, transparent 80%)" }} />
      </div>

      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-12" data-reveal>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ boxShadow: "0 0 8px #ef4444" }} />
            <span className="text-[10px] font-mono font-bold text-red-400 tracking-widest uppercase">TRADER VITAL SIGNS · LIVE MONITORING</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            כל סוחר מתנגן<br />
            <span style={{
              background: "linear-gradient(135deg, #fbbf24 0%, #ef4444 40%, #a78bfa 80%, #818cf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>אותה מנגינה</span>
          </h2>
          <p className="text-[15px] max-w-xl mx-auto leading-relaxed text-white/40">
            FOMO, ביטחון יתר, נקמה, BLOWUP — זה לא חולשה.<br />
            זה הפיזיולוגיה של כל סוחר ללא יומן. <span className="text-white/60 font-semibold">ZenTrade שובר את הלולאה.</span>
          </p>
        </div>

        {/* ── Main Monitor ── */}
        <div className="rounded-3xl overflow-hidden mb-6" data-reveal
          style={{
            background: "linear-gradient(145deg, #020208, #050510)",
            border: "1px solid rgba(239,68,68,0.15)",
            boxShadow: "0 0 80px rgba(239,68,68,0.06), 0 0 160px rgba(124,58,237,0.04), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}>

          {/* Monitor chrome */}
          <div className="flex items-center justify-between px-5 py-3 border-b"
            style={{ background: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.1)" }}>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
              </div>
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">TRADER EMOTION EKG · ניתוח רגשי</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[9px] font-mono text-white/15">PATIENT: ANONYMOUS TRADER</span>
              <span className="flex items-center gap-1.5 text-[9px] font-mono text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" style={{ animation: "vitalPulse 1s ease-in-out infinite" }} />
                LIVE
              </span>
            </div>
          </div>

          {/* Grid + EKG */}
          <div className="relative p-4 sm:p-6" style={{ background: "rgba(0,8,0,0.4)" }}>
            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]"
              style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)", backgroundSize: "100% 3px" }} />

            <svg ref={svgRef} viewBox="0 0 900 130" className="w-full" style={{ height: "clamp(120px, 18vw, 180px)" }}>
              <defs>
                <linearGradient id="ekgGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#94a3b8" stopOpacity="0.6" />
                  <stop offset="25%"  stopColor="#4ade80" stopOpacity="0.9" />
                  <stop offset="50%"  stopColor="#fbbf24" stopOpacity="1" />
                  <stop offset="70%"  stopColor="#ef4444" stopOpacity="1" />
                  <stop offset="85%"  stopColor="#dc2626" stopOpacity="1" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
                </linearGradient>
                <filter id="ekgGlow" x="-5%" y="-50%" width="110%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <clipPath id="scanClip">
                  <rect x="0" y="0" width={`${scanX}%`} height="130" />
                </clipPath>
              </defs>

              {/* Horizontal grid lines */}
              {[20, 40, 65, 85, 105].map(y => (
                <line key={y} x1="0" y1={y} x2="900" y2={y}
                  stroke="rgba(74,222,128,0.06)" strokeWidth="0.5" strokeDasharray="4 4" />
              ))}
              {/* Vertical grid lines */}
              {Array.from({ length: 18 }).map((_, i) => (
                <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="130"
                  stroke="rgba(74,222,128,0.04)" strokeWidth="0.5" />
              ))}

              {/* Ghost path (dim) */}
              <path d={EKG_PATH} stroke="rgba(74,222,128,0.08)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

              {/* Animated revealed path */}
              {started && (
                <path d={EKG_PATH}
                  stroke="url(#ekgGrad)" strokeWidth="2.5" fill="none"
                  strokeLinecap="round" strokeLinejoin="round"
                  filter="url(#ekgGlow)"
                  clipPath="url(#scanClip)"
                />
              )}

              {/* Scan cursor dot */}
              {started && scanX > 0 && (
                <circle cx={`${scanX}%`} cy="80" r="4" fill="#22d3ee"
                  style={{ filter: "drop-shadow(0 0 6px #22d3ee) drop-shadow(0 0 12px rgba(34,211,238,0.8))" }} />
              )}

              {/* Emotion marker dots + labels */}
              {EMOTION_MARKERS.map((m, i) => {
                const revealed = (scanX / 100) * 900 > m.x;
                const active = activeMarker === i;
                return (
                  <g key={i} style={{ opacity: revealed ? 1 : 0.15, transition: "opacity 0.3s" }}>
                    <circle cx={m.x} cy="80" r={active ? 6 : 4} fill={m.color}
                      style={{ filter: active ? `drop-shadow(0 0 8px ${m.color})` : undefined, transition: "r 0.2s" }} />
                    <text x={m.x} y={m.x > 700 ? 68 : (i % 2 === 0 ? 65 : 100)}
                      textAnchor="middle" fontSize="7.5" fill={m.color}
                      fontFamily="monospace" fontWeight="900" letterSpacing="0.5">
                      {m.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Active marker overlay */}
            {activeMarker >= 0 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-mono font-bold pointer-events-none"
                style={{
                  background: EMOTION_MARKERS[activeMarker].color + "20",
                  border: `1px solid ${EMOTION_MARKERS[activeMarker].color}50`,
                  color: EMOTION_MARKERS[activeMarker].color,
                  boxShadow: `0 0 16px ${EMOTION_MARKERS[activeMarker].color}30`,
                }}>
                ▶ {EMOTION_MARKERS[activeMarker].sub}
              </div>
            )}
          </div>

          {/* Vitals row */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-t" style={{ borderColor: "rgba(239,68,68,0.08)" }}>
            {VITALS.map((v, i) => (
              <div key={i} className="px-4 py-4 border-r last:border-r-0" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1">{v.label}</p>
                <div className="flex items-end gap-1.5">
                  <span className="text-[18px] font-black leading-none" style={{ color: v.color, textShadow: `0 0 12px ${v.color}60` }}>
                    {v.value}
                  </span>
                  <span className="text-[12px] font-bold mb-0.5" style={{ color: v.color + "80" }}>{v.trend}</span>
                </div>
                <p className="text-[9px] font-mono text-white/20 mt-1">{v.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── THE SOUND OF DATA — Spotify-style waveform ── */}
        <div className="rounded-3xl overflow-hidden" data-reveal
          style={{
            background: "linear-gradient(145deg, #030309, #060614)",
            border: "1px solid rgba(124,58,237,0.12)",
            boxShadow: "0 0 60px rgba(124,58,237,0.05)",
          }}>

          <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "rgba(124,58,237,0.08)" }}>
            <div>
              <p className="text-[8px] font-mono text-purple-400/40 uppercase tracking-[0.3em] mb-1">THE SOUND OF DATA</p>
              <h3 className="text-[20px] font-black text-white">קצב הכסף שלך</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5 items-end h-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-1 rounded-t-sm bg-purple-400"
                    style={{
                      height: `${40 + i * 12}%`,
                      animation: `barDance ${0.5 + i * 0.1}s ease-in-out infinite`,
                      animationDelay: `${i * 0.07}s`,
                    }} />
                ))}
              </div>
              <span className="text-[9px] font-mono text-purple-400/50 uppercase tracking-widest">ANALYZING...</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { label: "Win Rate Frequency", color: "#818cf8", desc: "תדר הניצחונות שלך" },
                { label: "P&L Amplitude",      color: "#4ade80", desc: "עוצמת הרווח/הפסד" },
                { label: "Emotion Signal",     color: "#f59e0b", desc: "אות פסיכולוגי" },
              ].map(({ label, color, desc }, ci) => (
                <div key={ci}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-mono uppercase tracking-wider" style={{ color: color + "70" }}>{label}</p>
                    <p className="text-[8px] text-white/20">{desc}</p>
                  </div>
                  {/* Spotify-style bars */}
                  <div className="flex items-end gap-[2px]" style={{ height: 64 }}>
                    {Array.from({ length: 40 }).map((_, i) => {
                      const h = 15 + Math.abs(Math.sin(i * 0.8 + ci)) * 70 + Math.abs(Math.sin(i * 0.3)) * 15;
                      const spd = 0.4 + Math.sin(i * 0.5) * 0.2 + 0.2;
                      return (
                        <div key={i} className="flex-1 rounded-t-sm"
                          style={{
                            background: `linear-gradient(to top, ${color}30, ${color}cc)`,
                            boxShadow: `0 0 4px ${color}20`,
                            transformOrigin: "bottom",
                            animation: `barDance ${spd}s ease-in-out ${(i * 0.04) % 0.6}s infinite`,
                            minWidth: 2,
                            height: `${h}%`,
                          }} />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.04]">
              <p className="text-[13px] text-white/30 leading-relaxed">
                ZenTrade הופך את הנתונים שלך למנגינה שאפשר לקרוא.
                <span className="text-white/50"> כל עסקה מוסיפה נדבך לתמונה האמיתית.</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   SABOTAGE SECTION
═══════════════════════════════════════════════════════════ */
const sabotageItems = [
  {
    icon: AlertTriangle, color: "amber", tag: "FOMO",
    title: "כניסה ללא אישור",
    body: "ישבת שעות מול הגרף. כלום לא קרה. מתוך שיעמום ו-FOMO טהור, כפית על עצמך עסקה. ידעת שזה לא ה-Setup שלך. אבל נכנסת בכל זאת.",
    quote: "\"זה נראה טוב מספיק...\"",
  },
  {
    icon: Flame, color: "red", tag: "TILT",
    title: "עסקת הנקמה",
    body: "לקחת הפסד תקין, אבל האגו שלך לא יכול היה לסבול את זה. הכפלת את גודל הלוט כדי לחזור את ההפסד — ושברת כל כלל ניהול סיכון שיש לך.",
    quote: "\"רק הפעם הזאת...\"",
  },
  {
    icon: HeartCrack, color: "violet", tag: "GUILT",
    title: "תחושת ה'בזבזתי'",
    body: "סגרת את הפלטפורמה אחרי יום חרוב. אותה אשמה כבדה מושכת כלפי מטה. כי ידעת בדיוק מה היית צריך לעשות. ופשוט לא עשית את זה.",
    quote: "\"למה אני עושה את זה לעצמי?\"",
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; glow: string; dot: string }> = {
  amber:  { border: "rgba(245,158,11,0.2)",  bg: "rgba(245,158,11,0.04)",  text: "rgba(251,191,36,0.85)",  glow: "rgba(245,158,11,0.08)",  dot: "#f59e0b" },
  red:    { border: "rgba(239,68,68,0.2)",   bg: "rgba(239,68,68,0.04)",   text: "rgba(248,113,113,0.85)", glow: "rgba(239,68,68,0.08)",   dot: "#ef4444" },
  violet: { border: "rgba(29,78,216,0.25)",  bg: "rgba(29,78,216,0.05)",   text: "rgba(96,165,250,0.85)",  glow: "rgba(29,78,216,0.08)",   dot: "#60a5fa" },
};

const TiltCard = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateZ(6px)`;
    ref.current.style.boxShadow = `${-x * 20}px ${-y * 20}px 40px rgba(0,0,0,0.3)`;
  }, []);
  const handleLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateZ(0)";
    ref.current.style.boxShadow = "";
  }, []);
  return (
    <div ref={ref} className={className} style={{ ...style, transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
      onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
};

const SabotageSection = () => (
  <section className="py-28 px-6">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16 max-w-2xl mx-auto" data-reveal>
        <span className="text-[9px] font-bold text-red-400/50 font-mono tracking-widest uppercase">THE CYCLE OF SABOTAGE</span>
        <h2 className="text-4xl md:text-5xl font-black text-white mt-4 mb-5 leading-tight">
          הטעויות שאתה
          <br />
          <span style={{ background: "linear-gradient(to left, #f87171, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            חוזר עליהן שוב ושוב
          </span>
        </h2>
        <p className="text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.48)" }}>
          לא בגלל שאתה סוחר גרוע. בגלל שאף אחד אף פעם לא מאלץ אותך להסתכל על האמת.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {sabotageItems.map((item) => {
          const c = colorMap[item.color];
          const Icon = item.icon;
          return (
            <TiltCard key={item.tag}
              className="rounded-3xl p-8 space-y-5 relative overflow-hidden cursor-default"
              style={{ border: `1px solid ${c.border}`, background: c.bg, backdropFilter: "blur(40px)" }}>
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 20%, ${c.glow}, transparent 60%)` }} />
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold font-mono tracking-widest uppercase" style={{ color: c.text }}>
                    {item.tag}
                  </span>
                  <div className="h-10 w-10 rounded-2xl flex items-center justify-center"
                    style={{ border: `1px solid ${c.border}`, background: "rgba(0,0,0,0.4)" }}>
                    <Icon className="h-5 w-5" style={{ color: c.dot }} />
                  </div>
                </div>
                <h3 className="text-[22px] font-black text-white leading-snug">{item.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {item.body}
                </p>
                <div className="rounded-xl border px-4 py-3" style={{ borderColor: c.border, background: "rgba(0,0,0,0.35)" }}>
                  <p className="text-[13px] italic" style={{ color: c.text }}>{item.quote}</p>
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>

      <div className="text-center" data-reveal>
        <div className="inline-flex items-center gap-4 rounded-2xl border border-white/[0.06] px-8 py-4"
          style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)" }}>
          <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          <p className="text-[14px] font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>
            ZenTrade שובר את המעגל הזה — נר אחד, עסקה אחת בכל פעם.
          </p>
          <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════
   BENTO FEATURES
═══════════════════════════════════════════════════════════ */
const AutomationBox = () => (
  <TiltCard className="glass-feature col-span-2 p-8 space-y-5 cursor-default">
    <div className="flex items-start justify-between">
      <div>
        <span className="text-[9px] font-bold text-blue-400/50 font-mono tracking-widest uppercase">FACTS VAULT · עובדות בלבד</span>
        <h3 className="text-2xl font-black text-white mt-1">אי אפשר לרמות את הנתונים.</h3>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/[0.08]">
        <Zap className="h-6 w-6 text-blue-400" />
      </div>
    </div>
    <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
      אנחנו שולפים את הנתונים הגולמיים ישירות מהברוקר שלך. אתה לא יכול לזייף את מחיר הכניסה שלך, לא יכול לתפעל את ה-Win Rate שלך. המספרים הם מוחלטים.
    </p>
    <div className="flex items-center gap-3 overflow-hidden">
      {["BROKER API","→","PARSER","→","DATABASE","→","JOURNAL"].map((s,i) => (
        <div key={i} className={`flex-1 text-center ${s==="→"?"text-blue-500/30 text-sm flex-none":""}`}>
          {s !== "→" ? (
            <div className="rounded-xl border border-blue-500/15 bg-blue-500/[0.05] px-2 py-2">
              <p className="text-[8px] font-mono font-bold text-blue-400/60 truncate">{s}</p>
            </div>
          ) : <span className="text-blue-500/30 font-mono">→</span>}
        </div>
      ))}
    </div>
    <div className="flex items-center gap-2">
      <Check className="h-3.5 w-3.5 text-blue-400" />
      <span className="text-[12px] text-blue-400/70 font-mono">0 הקלדות ידניות · עדכון בזמן אמת · ללא שגיאות אנושיות</span>
    </div>
  </TiltCard>
);

const SuperCardsBox = () => (
  <TiltCard className="glass-feature row-span-2 p-8 space-y-5 cursor-default">
    <span className="text-[9px] font-bold text-indigo-400/50 font-mono tracking-widest uppercase">NARRATIVE JOURNAL · הנרטיב</span>
    <h3 className="text-2xl font-black text-white">ספר את הסיפור.</h3>
    <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
      אל תרשום רק את העסקה. ספר את הסיפור. למה היית לחוץ? למה הזזת את ה-Stop Loss? כתוב את זה בכספת הזכוכית המוצפנת שלך.
    </p>
    <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.04] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black text-white font-mono">NQ1!</span>
        <span className="text-[8px] font-bold text-profit">+$840</span>
      </div>
      <div className="h-12 rounded-lg bg-white/[0.02] border border-white/[0.04]">
        <svg width="100%" height="100%" viewBox="0 0 160 48" preserveAspectRatio="none">
          <polyline points="0,40 25,32 45,35 70,18 90,22 115,10 140,13 160,6"
            stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div className="space-y-1.5">
        {["התוצאה","הביקורת","התיקון"].map((l,i) => (
          <div key={l} className={`rounded-lg border px-2.5 py-1.5 ${
            i===0 ? "border-profit/10 bg-profit/[0.04]" :
            i===1 ? "border-amber-400/10 bg-amber-400/[0.03]" :
            "border-indigo-500/10 bg-indigo-500/[0.04]"
          }`}>
            <p className="text-[6px] font-mono font-bold text-white/20 uppercase mb-0.5">{l}</p>
            <div className="h-1 rounded-full bg-white/[0.06]" style={{ width: `${60+i*15}%` }} />
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Check className="h-3.5 w-3.5 text-indigo-400" />
      <span className="text-[12px] text-indigo-400/70 font-mono">Super Cards · כרטיס לכל עסקה</span>
    </div>
  </TiltCard>
);

const AICoachBox = () => (
  <TiltCard className="glass-feature p-6 space-y-4 cursor-default">
    <div className="flex items-center justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/[0.08]">
        <Brain className="h-5 w-5 text-blue-400" />
      </div>
      <Lock className="h-4 w-4 text-blue-400/40" />
    </div>
    <div>
      <span className="text-[9px] font-bold text-blue-400/50 font-mono tracking-widest uppercase">AI INTERROGATION · חקירה</span>
      <h3 className="text-xl font-black text-white mt-0.5">ה-AI שחוקר אותך.</h3>
    </div>
    <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
      ה-AI Coach האישי שלך — מנתח את היומן הכתוב שלך. מזהה מתי אתה עוזב את כללי ה-SMC שלך ופועל מרגש.
    </p>
    <div className="rounded-xl border border-blue-500/15 bg-blue-500/[0.05] p-2.5 space-y-1.5">
      {["מזהה FOMO בזמן אמת","מנתח Win Rate לפי סשן","מזהה Revenge Trading","מאתר דפוסי הפסד חוזרים"].map(t => (
        <div key={t} className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-400/60" />
          <span className="text-[10px] text-white/40 font-mono">{t}</span>
        </div>
      ))}
    </div>
  </TiltCard>
);

const AntiTiltBox = () => (
  <TiltCard className="glass-feature p-6 space-y-4 cursor-default">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/[0.08]">
      <Shield className="h-5 w-5 text-red-400" />
    </div>
    <div>
      <span className="text-[9px] font-bold text-red-400/50 font-mono tracking-widest uppercase">ANTI-TILT TECH</span>
      <h3 className="text-xl font-black text-white mt-0.5">Kill Switch אוטומטי.</h3>
    </div>
    <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
      מגבלת הפסד יומי, Tilt Detection, ו-FOMO alerts. כשהאמיגדלה מנסה להשתלט — ZenTrade עוצרת.
    </p>
    <div className="space-y-1">
      <div className="flex justify-between text-[9px] font-mono">
        <span className="text-white/20">הפסד יומי</span>
        <span className="text-amber-400/70">$127 / $300</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all" style={{ width: "42%" }} />
      </div>
      <p className="text-[8px] text-white/15 font-mono">42% מהמגבלה</p>
    </div>
  </TiltCard>
);

/* ═══════════════════════════════════════════════════════════
   COMPARISON
═══════════════════════════════════════════════════════════ */
const ComparisonSection = () => (
  <section className="py-28 px-6">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16" data-reveal>
        <span className="text-[9px] font-bold text-white/20 font-mono tracking-widest uppercase">THE DARK REALITY</span>
        <h2 className="text-4xl font-black text-white mt-3 mb-4">אתה עדיין עובד ככה?</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before */}
        <TiltCard className="rounded-3xl border border-red-500/15 p-8 space-y-6 cursor-default"
          style={{ background: "rgba(239,68,68,0.03)" }}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <span className="text-sm">😓</span>
            </div>
            <p className="font-black text-white/50 text-lg">הדרך הישנה</p>
          </div>
          <div className="rounded-2xl border border-red-500/10 bg-white/[0.01] overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
              <span className="text-[9px] text-white/20 font-mono">journal_v7_final_FINAL.xlsx</span>
            </div>
            <div className="p-2">
              <div className="grid grid-cols-5 gap-px text-[7px] font-mono">
                {["תאריך","זוג","כניסה","יציאה","P&L"].map(h => (
                  <div key={h} className="bg-white/[0.04] px-1.5 py-1 text-white/20 font-bold">{h}</div>
                ))}
                {["04/16","XAUUSD","","","?"].map((c,i) => (
                  <div key={i} className={`px-1.5 py-1 text-white/15 ${c===""?"bg-red-500/5 border border-red-500/10":"bg-white/[0.01]"}`}>
                    {c==="" ? <span className="text-red-400/30">⚠</span> : c}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <ul className="space-y-2">
            {["הקלדה ידנית של כל פרט","שגיאות אנושיות בנתונים","אין ניתוח פסיכולוגי","אין insights אוטומטיים","זמן = כסף = אובד"].map(t => (
              <li key={t} className="flex items-center gap-2 text-[12px] text-white/30">
                <span className="text-red-500/50">✗</span> {t}
              </li>
            ))}
          </ul>
        </TiltCard>

        {/* After */}
        <TiltCard className="rounded-3xl border border-blue-500/20 p-8 space-y-6 relative overflow-hidden cursor-default"
          style={{ background: "linear-gradient(135deg, rgba(29,78,216,0.06) 0%, rgba(67,56,202,0.04) 100%)" }}>
          <div className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(circle at 70% 30%, rgba(29,78,216,0.12), transparent 60%)" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center overflow-hidden">
                <ZenTradeLogo size={26} transparent />
              </div>
              <p className="font-black text-white text-lg">ZenTrade</p>
            </div>
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.05] p-3 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-white font-mono">XAUUSD</span>
                <span className="text-[9px] font-bold text-profit bg-profit/10 border border-profit/15 rounded-full px-2 py-0.5">+$1,240</span>
              </div>
              <p className="text-[8px] text-white/25 font-mono mt-1">✓ נרשם אוטומטית · AI ניתח · הושלם</p>
            </div>
            <ul className="space-y-2">
              {["רישום אוטומטי מלא מהברוקר","ניתוח AI פסיכולוגי מוצפן","Super Cards ויזואליות לכל עסקה","Insights בזמן אמת","Kill Switch מובנה ל-Tilt"].map(t => (
                <li key={t} className="flex items-center gap-2 text-[12px] text-white/60">
                  <span className="text-blue-400">✓</span> {t}
                </li>
              ))}
            </ul>
          </div>
        </TiltCard>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════
   LIVE PROOF — Animated stats
═══════════════════════════════════════════════════════════ */
const testimonials = [
  { name: "אלון מ.", role: "SMC Trader · 3 שנים", text: "אחרי שבוע אחד הבנתי שאני מסחר נקמה כל יום ג׳ אחרי הפסד. ה-AI ראה את זה לפני שאני. זה שינה הכל.", pnl: "+31%" },
  { name: "נועה ש.", role: "ICT · Prop Trader",   text: "הכרטיסים ברמה אחרת לגמרי. כל עסקה מתועדת כמו מאמר מקצועי. ה-AI מזהה מתי אני יוצאת מה-Playbook שלי.", pnl: "+18%" },
  { name: "יוסי ב.", role: "Forex · 5 שנים",     text: "הכי חשוב שהכל אוטומטי. אני לא מבזבז יותר 20 דקות ביום על הקלדת נתונים. מתמקד רק ב-edge.", pnl: "+44%" },
];

const LiveProof = () => {
  const [traders, tradersRef] = useCountUp(2400);
  const [trades, tradesRef] = useCountUp(187500);
  const [winRate, winRateRef] = useCountUp(73);

  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Live stat counters */}
        <div className="rounded-3xl border border-white/[0.06] p-10 mb-16 relative overflow-hidden" data-reveal
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(40px)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08), transparent 60%)" }} />
          {/* Holographic top border */}
          <div className="absolute top-0 inset-x-0 h-[1px] holo-border" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <span ref={tradersRef} className="block text-[52px] font-black font-mono leading-none"
                style={{ background: "linear-gradient(to bottom, #fff, rgba(255,255,255,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {traders.toLocaleString()}+
              </span>
              <p className="text-[11px] font-mono mt-2" style={{ color: "rgba(255,255,255,0.42)" }}>סוחרים פעילים</p>
            </div>
            <div>
              <span ref={tradesRef} className="block text-[52px] font-black font-mono leading-none"
                style={{ background: "linear-gradient(to bottom, #60a5fa, rgba(96,165,250,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {trades.toLocaleString()}+
              </span>
              <p className="text-[11px] font-mono mt-2" style={{ color: "rgba(255,255,255,0.42)" }}>עסקאות נותחו</p>
            </div>
            <div>
              <span ref={winRateRef} className="block text-[52px] font-black font-mono leading-none"
                style={{ background: "linear-gradient(to bottom, #4ade80, rgba(74,222,128,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {winRate}%
              </span>
              <p className="text-[11px] font-mono mt-2" style={{ color: "rgba(255,255,255,0.42)" }}>שיפור ממוצע ב-Win Rate</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   SOCIAL PROOF TOASTS
═══════════════════════════════════════════════════════════ */
const PROOF_ITEMS = [
  { name: "שגורי מ.", action: "נרשם עכשיו", emoji: "👋", color: "#60a5fa" },
  { name: "דנה ל.", action: "שילמה Pro", emoji: "💎", color: "#a78bfa" },
  { name: "אורי כ.", action: "הצטרף לפרימיום", emoji: "🚀", color: "#4ade80" },
  { name: "יעל ב.", action: "ביצעה עסקה ראשונה", emoji: "✅", color: "#4ade80" },
  { name: "רון א.", action: "פתח חשבון", emoji: "🌟", color: "#f59e0b" },
  { name: "מיכל ש.", action: "שדרגה לPro", emoji: "👑", color: "#f59e0b" },
  { name: "תומר נ.", action: "סגר רצף של 5 ימים", emoji: "🔥", color: "#ef4444" },
  { name: "עמית ה.", action: "נרשם עכשיו", emoji: "👋", color: "#60a5fa" },
];

const SocialProofToasts = () => {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(i => (i + 1) % PROOF_ITEMS.length);
        setVisible(true);
      }, 500);
    }, 3800);
    return () => clearInterval(iv);
  }, []);

  const item = PROOF_ITEMS[current];
  return (
    <div
      className="fixed bottom-24 right-5 z-[80] pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.95)",
        transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div className="flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-2xl shadow-2xl"
        style={{
          borderColor: item.color + "25",
          background: "rgba(8,8,20,0.92)",
          boxShadow: `0 0 30px ${item.color}12`,
          minWidth: 220,
        }}>
        <span className="text-xl">{item.emoji}</span>
        <div>
          <p className="text-[12px] font-bold text-white leading-none">{item.name}</p>
          <p className="text-[10px] mt-0.5 font-mono" style={{ color: item.color + "cc" }}>{item.action}</p>
        </div>
        <div className="mr-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: item.color }} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   INFINITE TESTIMONIALS CAROUSEL
═══════════════════════════════════════════════════════════ */
const ALL_TESTIMONIALS = [
  { name: "אלון מ.", role: "SMC · 3 שנים", text: "אחרי שבוע ראיתי שאני עושה מסחר נקמה כל יום ג׳. ה-AI ראה את זה לפני שאני.", pnl: "+31%", stars: 5 },
  { name: "נועה ש.", role: "ICT · Prop Trader", text: "כל עסקה מתועדת כמו מאמר מקצועי. ה-AI מזהה מתי אני יוצאת מה-Playbook.", pnl: "+18%", stars: 5 },
  { name: "יוסי ב.", role: "Forex · 5 שנים", text: "לא מבזבז 20 דקות ביום על הקלדות. הכל אוטומטי. מתמקד רק ב-edge.", pnl: "+44%", stars: 5 },
  { name: "רחל כ.", role: "NQ Futures", text: "ה-Kill Switch הציל אותי פעמיים מ-Revenge Trading. פשוטו כמשמעו שמר על ההון שלי.", pnl: "+22%", stars: 5 },
  { name: "דניאל פ.", role: "XAUUSD Scalper", text: "הסטטיסטיקות הראו לי שאני מפסיד 80% מהפסדים אחרי 14:00. הפסקתי לסחור אחה\"צ.", pnl: "+67%", stars: 5 },
  { name: "שירה ל.", role: "מתחילה · 6 חודשים", text: "כמתחילה — חיסכתי חודשים של טעויות. ה-AI מסביר מה קרה בכל עסקה ולמה.", pnl: "+12%", stars: 5 },
  { name: "מתן א.", role: "Crypto · DeFi", text: "Super Cards ברמה אחרת. כל עסקה נראית כמו דוח מקצועי. מרשים לקחת screenshot.", pnl: "+39%", stars: 5 },
  { name: "מיכל ה.", role: "Swing Trader", text: "הייתי על סף ויתור. אחרי ZenTrade הבנתי שיש לי edge אמיתי — רק הפסיכולוגיה קיצצה.", pnl: "+28%", stars: 5 },
];

const TestimonialsCarousel = () => {
  // Exactly 2 identical sets → animate -50% → perfect seamless loop, zero blank space
  const setA = ALL_TESTIMONIALS;
  const setB = ALL_TESTIMONIALS;
  const track = [...setA, ...setB];

  const Card = ({ t, idx }: { t: typeof ALL_TESTIMONIALS[0]; idx: number }) => (
    <div
      key={idx}
      className="rounded-2xl border border-white/[0.07] p-5 space-y-3"
      style={{
        background: "rgba(255,255,255,0.025)",
        backdropFilter: "blur(20px)",
        // 300px on desktop, 82vw on mobile so 1 fits nicely
        width: "clamp(260px, 82vw, 320px)",
        flexShrink: 0,
        marginLeft: 8,
        marginRight: 8,
      }}
    >
      <div className="flex gap-0.5">
        {Array.from({ length: t.stars }).map((_, n) => (
          <Star key={n} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-[12px] leading-relaxed text-white/55">"{t.text}"</p>
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
        <div>
          <p className="text-[12px] font-bold text-white/80">{t.name}</p>
          <p className="text-[10px] font-mono text-white/30">{t.role}</p>
        </div>
        <span className="text-[15px] font-black text-profit font-mono">{t.pnl}</span>
      </div>
    </div>
  );

  return (
    <section className="py-20 relative" style={{ overflow: "hidden" }}>
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-32 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #06060f 50%, transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-16 md:w-32 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #06060f 50%, transparent)" }} />

      <div className="max-w-6xl mx-auto px-6 mb-10" data-reveal>
        <div className="text-center">
          <p className="text-[11px] font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(96,165,250,0.45)" }}>מה סוחרים אומרים</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">2,400+ סוחרים. תוצאות אמיתיות.</h2>
          <p className="text-[14px] mt-3 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.35)" }}>
            ממתחילים ועד Prop Traders מקצועיים — כולם מדווחים על שיפור מדיד.
          </p>
        </div>
      </div>

      {/*
        Track = setA + setB (identical halves).
        Keyframe moves 0% → -50% = scrolls exactly through setA.
        At -50% the visual position is identical to 0% → seamless jump-reset.
        Duration calc: 8 cards × ~336px ≈ 2688px at 60px/s ≈ 45s.
      */}
      <div
        style={{
          display: "flex",
          width: "max-content",
          animation: "carousel-loop 45s linear infinite",
          willChange: "transform",
        }}
        onMouseEnter={e => (e.currentTarget.style.animationPlayState = "paused")}
        onMouseLeave={e => (e.currentTarget.style.animationPlayState = "running")}
      >
        {track.map((t, i) => <Card key={i} t={t} idx={i} />)}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   FAQ SECTION
═══════════════════════════════════════════════════════════ */
const FAQ_ITEMS = [
  {
    q: "האם ZenTrade מתחבר לברוקר שלי אוטומטית?",
    a: "כן. ZenTrade תומך ב-MetaTrader 4/5, Binance, TradingView, TopStepX, TradeLocker, Rithmic, IBKR ועוד. העסקאות מיובאות אוטומטית — אין הזנה ידנית.",
  },
  {
    q: "מה ה-AI Mentor בעצם עושה?",
    a: "ה-AI מנתח את כל העסקאות שלך, מזהה דפוסים פסיכולוגיים (FOMO, נקמה, ביטחון יתר), ונותן תובנות ממוקדות. כמו מאמן פרטי שיודע כל עסקה שביצעת.",
  },
  {
    q: "מה זה Kill Switch?",
    a: "Kill Switch הוא כלי הגנה שאתה מגדיר מראש. אם הגעת למקסימום הפסד יומי — הפלטפורמה נסגרת אוטומטית. אין דרך לעקוף. מגן עליך מ-Revenge Trading בדיוק ברגע הכי קשה.",
  },
  {
    q: "כמה זה עולה?",
    a: "7 ימי ניסיון חינם ללא כרטיס אשראי. אחרי הניסיון — ₪99/חודש לגישה מלאה לכל הכלים. ניתן לבטל בכל עת.",
  },
  {
    q: "האם הנתונים שלי מאובטחים?",
    a: "כן. הכל מוצפן עם SSL 256-bit. הנתונים שלך לא נמכרים ולא משותפים. אתה הבעלים הבלעדי של המידע.",
  },
  {
    q: "האם זה מתאים למתחילים?",
    a: "בהחלט. ZenTrade בנוי גם למתחילים שרוצים לבנות הרגלים נכונים מהיום הראשון, וגם לפרו-טריידרים מנוסים שרוצים edge סטטיסטי.",
  },
];

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-20 px-6" data-reveal>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[11px] font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(96,165,250,0.45)" }}>שאלות נפוצות</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">הכל שקוף. אין הפתעות.</h2>
        </div>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i}
              className="rounded-2xl border overflow-hidden transition-all duration-300"
              style={{
                borderColor: open === i ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.06)",
                background: open === i ? "rgba(96,165,250,0.04)" : "rgba(255,255,255,0.02)",
              }}>
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-right gap-4"
                onClick={() => setOpen(open === i ? null : i)}>
                <span className="text-[14px] font-semibold text-white/80">{item.q}</span>
                <div className="shrink-0 h-6 w-6 rounded-lg flex items-center justify-center border transition-all duration-300"
                  style={{
                    borderColor: open === i ? "rgba(96,165,250,0.3)" : "rgba(255,255,255,0.08)",
                    background: open === i ? "rgba(96,165,250,0.1)" : "transparent",
                    transform: open === i ? "rotate(45deg)" : "none",
                  }}>
                  <span className="text-[14px] leading-none" style={{ color: open === i ? "rgb(96,165,250)" : "rgba(255,255,255,0.3)" }}>+</span>
                </div>
              </button>
              <div style={{ height: open === i ? "auto" : 0, overflow: "hidden", transition: "height 0.3s" }}>
                <p className="px-6 pb-5 text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   SLIDE TO REGISTER BUTTON
═══════════════════════════════════════════════════════════ */
const SlideToRegister = ({ onSuccess }: { onSuccess: () => void }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [x, setX] = useState(0);
  const [done, setDone] = useState(false);
  const startX = useRef(0);

  const trackWidth = 340;
  const thumbSize = 56;
  const maxX = trackWidth - thumbSize - 8;

  const handleStart = (clientX: number) => {
    if (done) return;
    setDragging(true);
    startX.current = clientX - x;
  };

  const handleMove = (clientX: number) => {
    if (!dragging) return;
    const newX = Math.max(0, Math.min(maxX, clientX - startX.current));
    setX(newX);
    if (newX >= maxX - 4) {
      setDone(true);
      setDragging(false);
      setTimeout(() => {
        onSuccess();
        setTimeout(() => { setDone(false); setX(0); }, 800);
      }, 400);
    }
  };

  const handleEnd = () => {
    if (done) return;
    setDragging(false);
    setX(0);
  };

  const progress = Math.min(1, x / maxX);

  return (
    <div className="flex justify-center">
      <div
        ref={trackRef}
        className="relative rounded-2xl overflow-hidden select-none touch-none"
        style={{
          width: trackWidth, height: 68,
          background: done ? "rgba(74,222,128,0.15)" : "rgba(29,78,216,0.12)",
          border: `1px solid ${done ? "rgba(74,222,128,0.3)" : "rgba(29,78,216,0.3)"}`,
          transition: "background 0.4s, border-color 0.4s",
        }}
        onMouseMove={e => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchMove={e => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        {/* Progress fill */}
        <div className="absolute inset-y-0 right-0 transition-all duration-75"
          style={{
            width: `${(x + thumbSize) / trackWidth * 100}%`,
            background: done
              ? "linear-gradient(to left, rgba(74,222,128,0.25), rgba(74,222,128,0.05))"
              : "linear-gradient(to left, rgba(29,78,216,0.3), rgba(29,78,216,0.05))",
            borderRadius: "inherit",
          }} />

        {/* Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: done ? 0 : Math.max(0, 1 - progress * 2.5) }}>
          <span className="text-[13px] font-bold tracking-wide"
            style={{ color: "rgba(96,165,250,0.6)" }}>
            ← החלק להתחלה חינם
          </span>
        </div>
        {done && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[13px] font-black text-profit">✓ מצוין! מעביר אותך...</span>
          </div>
        )}

        {/* Thumb */}
        <div
          ref={thumbRef}
          className="absolute top-1.5 bottom-1.5 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-shadow touch-none select-none"
          style={{
            right: trackWidth - thumbSize - 4 - x,
            width: thumbSize,
            background: done ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#1d4ed8,#4338ca)",
            boxShadow: done ? "0 0 20px rgba(34,197,94,0.5)" : "0 0 20px rgba(29,78,216,0.5)",
            transition: dragging ? "none" : "right 0.35s cubic-bezier(0.16,1,0.3,1), background 0.4s",
          }}
          onMouseDown={e => handleStart(e.clientX)}
          onTouchStart={e => handleStart(e.touches[0].clientX)}
        >
          {done
            ? <span className="text-[20px]">✓</span>
            : <ChevronLeft className="h-5 w-5 text-white" />
          }
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   AUTH MODAL (inline — lightweight)
═══════════════════════════════════════════════════════════ */
const AuthModalInline = ({ mode, onClose }: { mode: "login" | "register"; onClose: () => void }) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm rounded-3xl border border-white/[0.08] bg-[#08080f] shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
          <div className="h-[2px] w-full holo-border" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full blur-[80px] pointer-events-none"
            style={{ background: "rgba(59,130,246,0.08)" }} />
          <div className="relative p-7">
            <button onClick={onClose} className="absolute top-4 left-4 h-8 w-8 flex items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/40 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
            <div className="text-center mb-7">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center border border-blue-500/25 bg-blue-500/10 overflow-hidden">
                  <ZenTradeLogo size={38} transparent />
                </div>
              </div>
              <h2 className="text-xl font-black text-white">{mode === "login" ? "ברוך הבא חזרה" : "צור חשבון חינם"}</h2>
              <p className="text-[12px] text-white/30 mt-1">{mode === "login" ? "היכנס לחשבון ZenTrade שלך" : "7 ימים ניסיון · ללא כרטיס אשראי"}</p>
            </div>
            <button
              onClick={() => navigate(mode === "login" ? "/login" : "/signup")}
              className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white transition-all hover:brightness-110 mb-3"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #4338ca)", boxShadow: "0 0 30px rgba(29,78,216,0.4)" }}>
              {mode === "login" ? "כניסה ←" : "התחל בחינם ←"}
            </button>
            <p className="text-center text-[11px] text-white/25">
              {mode === "login" ? "אין חשבון?" : "יש לך חשבון?"}{" "}
              <button className="text-blue-400/70 hover:text-blue-400 underline transition-colors"
                onClick={() => navigate(mode === "login" ? "/signup" : "/login")}>
                {mode === "login" ? "הירשם חינם" : "כנס"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   TYPING TEXT  — reveals text char by char on scroll-in
═══════════════════════════════════════════════════════════ */
const TypingText = ({ text, delayMs = 0 }: { text: string; delayMs?: number }) => {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);
  useEffect(() => {
    if (!started) return;
    let i = 0;
    const tid = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(iv);
      }, 38);
      return () => clearInterval(iv);
    }, delayMs);
    return () => clearTimeout(tid);
  }, [started, text, delayMs]);
  return <span ref={ref}>{displayed || "\u200B"}</span>;
};

/* ═══════════════════════════════════════════════════════════
   AVATAR STACK  — social proof row
═══════════════════════════════════════════════════════════ */
const AvatarStack = () => (
  <div className="flex items-center gap-3">
    <div className="flex" style={{ direction: "ltr" }}>
      {["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444"].map((c, i) => (
        <div key={i}
          className="h-8 w-8 rounded-full border-2 border-[#06060f] flex items-center justify-center text-[11px] font-black text-white"
          style={{ background: c, marginLeft: i === 0 ? 0 : -10, zIndex: 5 - i }}>
          {["א","נ","י","ר","ד"][i]}
        </div>
      ))}
    </div>
    <div>
      <p className="text-[11px] font-bold text-white/60">2,400+ סוחרים כבר בפנים</p>
      <div className="flex gap-0.5 mt-0.5">
        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />)}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   DEMO MODAL  — "צפה בדמו חי" opens this
═══════════════════════════════════════════════════════════ */
const DemoModal = ({ onClose }: { onClose: () => void }) => (
  <>
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xl" onClick={onClose} />
    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#08080f] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="h-[2px] w-full holo-border" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-48 rounded-full blur-[80px] pointer-events-none"
          style={{ background: "rgba(59,130,246,0.1)" }} />
        <button onClick={onClose}
          className="absolute top-4 left-4 h-8 w-8 flex items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/40 hover:text-white transition-colors z-10">
          <X className="h-4 w-4" />
        </button>
        <div className="relative p-6 pt-4 text-center">
          <p className="text-[9px] font-mono text-blue-400/50 uppercase tracking-widest mb-1">LIVE DEMO</p>
          <h3 className="text-xl font-black text-white mb-1">ZenTrade בפעולה</h3>
          <p className="text-[12px] text-white/30 mb-6">מחזור אוטומטי בין 3 מסכים — גרף חי, AI Mentor, סטטיסטיקות</p>
          <div className="flex justify-center mb-6">
            <PhoneMockup mouseX={0.5} mouseY={0.5} />
          </div>
          <button onClick={onClose}
            className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #4338ca)", boxShadow: "0 0 30px rgba(29,78,216,0.4)" }}>
            רוצה לנסות — התחל בחינם ←
          </button>
        </div>
      </div>
    </div>
  </>
);

/* ═══════════════════════════════════════════════════════════
   HOW IT WORKS — 3 steps
═══════════════════════════════════════════════════════════ */
const HowItWorksSection = ({ onStart }: { onStart: () => void }) => (
  <section className="py-24 px-6" data-reveal>
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-14">
        <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(96,165,250,0.45)" }}>HOW IT WORKS</span>
        <h2 className="text-3xl md:text-4xl font-black text-white mt-2">3 צעדים לאמת</h2>
        <p className="text-[14px] mt-3 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.35)" }}>
          מחיבור הברוקר ועד insight ראשון — פחות מ-5 דקות
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-[52px] right-[20%] left-[20%] h-px pointer-events-none"
          style={{ background: "linear-gradient(to left, transparent, rgba(59,130,246,0.25), transparent)" }} />

        {[
          {
            step: "01", Icon: Zap, color: "#3b82f6",
            title: "חבר את הברוקר",
            desc: "30 שניות. MT5, Binance, TradingView, IBKR ועוד 8 פלטפורמות. חיבור API פשוט — ואז שכח ממנו.",
          },
          {
            step: "02", Icon: TrendingUp, color: "#4ade80",
            title: "סחר כרגיל",
            desc: "ZenTrade מתעד אוטומטית כל עסקה — כניסה, יציאה, P&L, זמן, גודל לוט. אפס הקלדות ידניות.",
          },
          {
            step: "03", Icon: Brain, color: "#a78bfa",
            title: "AI חושף את האמת",
            desc: "לאחר כל סשן ה-AI מזהה patterns פסיכולוגיים, חוזק ה-edge שלך, ואיפה הכסף נדלף.",
          },
        ].map(({ step, Icon, color, title, desc }, i) => (
          <div key={i} className="relative flex flex-col items-center text-center group">
            <div className="relative h-[104px] w-[104px] mb-6 flex items-center justify-center rounded-3xl transition-all duration-300 group-hover:scale-105"
              style={{
                border: `1px solid ${color}25`,
                background: `${color}0a`,
                boxShadow: `0 0 0 0 ${color}20`,
              }}>
              <Icon className="h-9 w-9" style={{ color }} />
              <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg"
                style={{ background: color, color: "#06060f" }}>
                {step}
              </div>
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `0 0 30px ${color}25` }} />
            </div>
            <h3 className="text-[18px] font-black text-white mb-2">{title}</h3>
            <p className="text-[12px] leading-relaxed max-w-[220px]" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <button onClick={onStart}
          className="group relative overflow-hidden rounded-2xl px-8 py-4 text-[14px] font-bold text-white transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #1d4ed8, #4338ca)", boxShadow: "0 0 40px rgba(29,78,216,0.35)" }}>
          <span className="relative z-10 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            התחל עכשיו — חינם ל-7 ימים
            <ChevronLeft className="h-4 w-4" />
          </span>
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [heroTraders, heroTradersRef] = useCountUp(2400, 2200);
  const [heroWinRate, heroWinRateRef] = useCountUp(73, 2000);
  const mouse = useMousePos();
  useScrollReveal();

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="relative bg-[#06060f] text-white overflow-x-hidden" dir="rtl">
      <TradingCanvas />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />

      <SocialProofToasts />
      {authModal && <AuthModalInline mode={authModal} onClose={() => setAuthModal(null)} />}
      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}

      <div className="relative" style={{ zIndex: 2 }}>

        {/* ── NAV ── */}
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrollY > 30 ? "border-b border-white/[0.05]" : ""}`}
          style={{ backdropFilter: scrollY > 30 ? "blur(40px)" : undefined, background: scrollY > 30 ? "rgba(6,6,15,0.88)" : undefined }}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-center overflow-hidden">
                <ZenTradeLogo size={32} transparent />
              </div>
              <span className="text-[18px] font-black tracking-tight">ZenTrade</span>
            </div>
            {/* Links */}
            <div className="hidden md:flex items-center gap-8">
              {[["תכונות","#features"],["מחירים","/pricing"],["דמו","/demo"]].map(([l,h]) => (
                <Link key={l} to={h} className="text-[13px] text-white/30 hover:text-white/70 transition-colors font-medium">{l}</Link>
              ))}
            </div>
            {/* CTAs */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAuthModal("login")}
                className="text-[13px] text-white/30 hover:text-white/60 transition-colors font-medium hidden sm:block">
                כניסה
              </button>
              <button
                onClick={() => setAuthModal("register")}
                className="group relative overflow-hidden rounded-xl px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, rgba(29,78,216,0.9), rgba(67,56,202,0.9))", boxShadow: "0 0 20px rgba(29,78,216,0.35)" }}>
                <span className="relative z-10">התחל בחינם</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="min-h-screen flex items-center pt-20 md:pt-24 pb-10 relative">
          <FloatingWins />
          <div className="max-w-6xl mx-auto px-6 w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
              {/* Left */}
              <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">

                {/* Badge — typing animation */}
                <div className="inline-flex items-center gap-2.5 rounded-full border border-red-500/20 px-4 py-2"
                  style={{ background: "rgba(239,68,68,0.06)", backdropFilter: "blur(20px)" }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                  <span className="text-[10px] font-bold text-red-400/80 font-mono tracking-[0.1em] uppercase min-w-0">
                    <TypingText text="תפסיק לשקר לעצמך למה הגעת ל-Stop Loss" />
                  </span>
                  <span className="h-[12px] w-[1.5px] bg-red-400/60 rounded-full animate-pulse flex-shrink-0" />
                </div>

                {/* Headline */}
                <div className="space-y-1">
                  <h1 className="text-[32px] sm:text-[40px] md:text-[54px] font-black leading-[1.0] tracking-tight text-white">
                    לא פוצצת את החשבון
                    <br />
                    בגלל אסטרטגיה גרועה.
                  </h1>
                  <h1 className="text-[32px] sm:text-[40px] md:text-[54px] font-black leading-[1.0] tracking-tight">
                    <span style={{ WebkitTextFillColor: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.22)" }}>
                      פוצצת אותו בגלל רגע אחד של{" "}
                    </span>
                    <span className="relative inline-block" style={{
                      background: "linear-gradient(90deg, #f87171 0%, #fb923c 25%, #fbbf24 50%, #f87171 75%, #fb923c 100%)",
                      backgroundSize: "300% auto",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "shimmer-lr 3s linear infinite",
                    }}>
                      חולשה.
                    </span>
                  </h1>
                </div>

                {/* Sub — 3 bullet points */}
                <ul className="space-y-2.5 max-w-[460px]">
                  {[
                    { icon: Brain,  color: "#60a5fa", text: "AI שמנתח כל עסקה ומגלה מה האמת מאחוריה" },
                    { icon: Shield, color: "#4ade80", text: "Kill Switch שמגן עליך מ-Revenge Trading ברגע הכי קשה" },
                    { icon: Target, color: "#a78bfa", text: "סטטיסטיקות שחושפות בדיוק איפה ה-edge שלך דולף" },
                  ].map(({ icon: Icon, color, text }) => (
                    <li key={text} className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                        style={{ background: color + "15", border: `1px solid ${color}25` }}>
                        <Icon className="h-3.5 w-3.5" style={{ color }} />
                      </div>
                      <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.58)" }}>{text}</span>
                    </li>
                  ))}
                </ul>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Kill Switch", color: "#ef4444" },
                    { label: "AI Mentor", color: "#60a5fa" },
                    { label: "Super Cards", color: "#a78bfa" },
                    { label: "Auto Import", color: "#4ade80" },
                    { label: "Prop Ready", color: "#f59e0b" },
                  ].map(({ label, color }, i) => (
                    <span key={label}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold font-mono"
                      style={{
                        border: `1px solid ${color}25`,
                        background: color + "0d",
                        color: color + "cc",
                        animation: `pill-in 0.4s ease both`,
                        animationDelay: `${i * 80}ms`,
                      }}>
                      <span className="h-1 w-1 rounded-full" style={{ background: color }} />
                      {label}
                    </span>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button
                    onClick={() => setAuthModal("register")}
                    className="group relative overflow-hidden rounded-2xl px-8 py-4 text-[15px] font-bold text-white transition-all hover:scale-[1.02] hover:shadow-2xl"
                    style={{ background: "linear-gradient(135deg, #1d4ed8, #4338ca)", boxShadow: "0 0 40px rgba(29,78,216,0.45), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                    <span className="relative z-10 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      התחל לבנות משמעת — 7 ימים חינם
                      <ChevronLeft className="h-4 w-4" />
                    </span>
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                  <button
                    onClick={() => setDemoOpen(true)}
                    className="group flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-5 py-[13px] text-[13px] font-semibold text-white/50 hover:text-white/90 hover:bg-white/[0.08] hover:border-white/[0.18] transition-all">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>צפה בדמו חי</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>

                {/* Avatar stack + trust */}
                <div className="flex flex-col gap-2">
                  <AvatarStack />
                  <div className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.16)" }}>
                    <Lock className="h-3 w-3" />
                    <span>SSL מוצפן · ללא כרטיס אשראי · ביטול בכל עת</span>
                  </div>
                </div>

                {/* Stats row — animated countup */}
                <div className="flex items-center gap-5 sm:gap-8 pt-3 border-t border-white/[0.05]">
                  <div>
                    <p className="text-[18px] sm:text-[22px] font-black font-mono"
                      style={{ background: "linear-gradient(to bottom, #fff, rgba(255,255,255,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      <span ref={heroTradersRef}>{heroTraders.toLocaleString()}</span>+
                    </p>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>סוחרים פעילים</p>
                  </div>
                  <div>
                    <p className="text-[18px] sm:text-[22px] font-black font-mono"
                      style={{ background: "linear-gradient(to bottom, #4ade80, rgba(74,222,128,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      <span ref={heroWinRateRef}>{heroWinRate}</span>%
                    </p>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>שיפור Win Rate</p>
                  </div>
                  <div>
                    <p className="text-[18px] sm:text-[22px] font-black font-mono"
                      style={{ background: "linear-gradient(to bottom, #fbbf24, rgba(251,191,36,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      7 ימים
                    </p>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>ניסיון חינם</p>
                  </div>
                </div>
              </div>

              {/* Right — Phone with parallax */}
              <div className="flex justify-center lg:justify-end order-1 lg:order-2">
                <div className="hidden lg:block">
                  <PhoneMockup mouseX={mouse.x} mouseY={mouse.y} />
                </div>
                <div className="lg:hidden" style={{ transform: "scale(0.65)", transformOrigin: "top center", marginBottom: "-30%" }}>
                  <PhoneMockup mouseX={0.5} mouseY={0.5} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <HowItWorksSection onStart={() => setAuthModal("register")} />

        <SectionDivider color="rgba(59,130,246,0.12)" />

        {/* ── TICKER ── */}
        <TickerTape />

        <SectionDivider color="rgba(239,68,68,0.12)" />

        {/* ── CYCLE OF SABOTAGE ── */}
        <SabotageSection />

        <SectionDivider color="rgba(59,130,246,0.15)" />

        {/* ── THE RHYTHM (שירים מגניבים) ── */}
        <TraderVitalSigns />

        <SectionDivider />

        {/* ── BENTO FEATURES ── */}
        <section id="features" className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16" data-reveal>
              <span className="text-[9px] font-bold font-mono tracking-widest uppercase" style={{ color: "rgba(96,165,250,0.5)" }}>
                ROOM OF TRUTH · חדר האמת
              </span>
              <h2 className="text-4xl font-black text-white mt-3 mb-4">כלים שמכריחים אותך להיות טוב יותר</h2>
              <p className="text-[15px] max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.42)" }}>
                לא עוד גיליון אקסל. לא עוד ניחושים. רק נתונים מוחלטים, ניתוח AI, ושיפור מתמיד.
              </p>
            </div>

            <style>{`
              .glass-feature {
                border-radius: 24px;
                border: 1px solid rgba(255,255,255,0.06);
                background: rgba(255,255,255,0.02);
                backdrop-filter: blur(40px);
                overflow: hidden;
                position: relative;
              }
              .glass-feature::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 24px;
                background: radial-gradient(circle at 0% 0%, rgba(255,255,255,0.025), transparent 60%);
                pointer-events: none;
              }
            `}</style>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2"><AutomationBox /></div>
              <div className="row-span-2"><SuperCardsBox /></div>
              <AICoachBox />
              <AntiTiltBox />
            </div>
          </div>
        </section>

        <SectionDivider color="rgba(239,68,68,0.1)" />

        {/* ── COMPARISON ── */}
        <ComparisonSection />

        <SectionDivider color="rgba(59,130,246,0.12)" />

        {/* ── LIVE PROOF + STATS ── */}
        <LiveProof />

        <SectionDivider color="rgba(96,165,250,0.12)" />

        {/* ── TESTIMONIALS CAROUSEL ── */}
        <TestimonialsCarousel />

        <SectionDivider />

        {/* ── FAQ ── */}
        <FAQSection />

        <SectionDivider color="rgba(29,78,216,0.15)" />

        {/* ── FINAL CTA ── */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center" data-reveal>
            <div className="rounded-3xl border border-blue-500/15 p-12 md:p-16 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(29,78,216,0.07) 0%, rgba(67,56,202,0.04) 100%)", backdropFilter: "blur(40px)" }}>
              <div className="absolute top-0 inset-x-0 h-[2px] holo-border" />
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(29,78,216,0.15), transparent 60%)" }} />

              <div className="relative z-10 space-y-6">
                <div className="flex justify-center gap-3 mb-2">
                  <WaveformBars count={12} color="#3b82f6" height={28} />
                  <WaveformBars count={12} color="#4ade80" height={28} />
                  <WaveformBars count={12} color="#3b82f6" height={28} />
                </div>

                <p className="text-[11px] font-mono tracking-widest uppercase" style={{ color: "rgba(96,165,250,0.4)" }}>THE COMMITMENT</p>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  האם אתה מוכן לסחור
                  <br />
                  <span style={{ background: "linear-gradient(to left, #60a5fa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    כמו מכונה?
                  </span>
                </h2>
                <p className="text-[15px] max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
                  הצטרף לסוחרי העלית שמתייחסים לפסיכולוגיה שלהם כנכס הגדול ביותר — ומוכיחים את זה עם נתונים.
                </p>

                <div className="flex justify-center gap-12 py-4 border-y border-white/[0.05]">
                  {[["2,400+","סוחרים פעילים"],["73%","שיפור ממוצע ב-Win Rate"],["₪0","ללא כרטיס אשראי"]].map(([v,l]) => (
                    <div key={l} className="text-center">
                      <p className="text-[24px] font-black font-mono text-white">{v}</p>
                      <p className="text-[11px] font-mono mt-0.5" style={{ color: "rgba(255,255,255,0.48)" }}>{l}</p>
                    </div>
                  ))}
                </div>

                {/* Slide to register */}
                <div className="pt-2">
                  <SlideToRegister onSuccess={() => setAuthModal("register")} />
                  <p className="text-[11px] font-mono mt-4" style={{ color: "rgba(255,255,255,0.35)" }}>
                    או לחץ כאן:{" "}
                    <button onClick={() => setAuthModal("register")}
                      className="text-blue-400/70 hover:text-blue-400 underline transition-colors">
                      התחל בחינם ←
                    </button>
                  </p>
                </div>

                <p className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>
                  ללא כרטיס אשראי · SSL מוצפן · ביטול בכל עת
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/[0.04] py-10 px-6"
          style={{ background: "rgba(6,6,15,0.8)", backdropFilter: "blur(20px)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl border border-blue-500/25 bg-blue-500/10 flex items-center justify-center overflow-hidden">
                  <ZenTradeLogo size={26} transparent />
                </div>
                <span className="font-black text-white">ZenTrade</span>
                <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>© 2026</span>
              </div>
              <div className="flex items-center gap-8">
                {[["תנאי שימוש","/terms"],["מחירים","/pricing"],["כניסה","/login"]].map(([l,h]) => (
                  <Link key={l} to={h}
                    className="text-[12px] font-mono transition-colors"
                    style={{ color: "rgba(255,255,255,0.18)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.18)")}>
                    {l}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.12)" }}>
                <Lock className="h-3 w-3" />
                <span>256-bit SSL Encrypted</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
