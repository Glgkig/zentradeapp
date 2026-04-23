import { useEffect, useState } from "react";
import ZenTradeLogo from "@/components/ZenTradeLogo";

/* ── static particle data (computed once) ── */
const PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (360 / 14) * i + (i % 2 === 0 ? 8 : -8);
  const dist = 70 + (i % 3) * 30;
  const rad = (angle * Math.PI) / 180;
  return {
    id: i,
    tx: Math.round(Math.cos(rad) * dist),
    ty: Math.round(Math.sin(rad) * dist),
    size: 2 + (i % 3),
    delay: (i % 4) * 0.06,
    color: i % 3 === 0 ? "#22d3ee" : i % 3 === 1 ? "#a78bfa" : "#c4b5fd",
  };
});

const FEATURES = [
  { icon: "📓", label: "יומן מסחר" },
  { icon: "🧠", label: "AI מנטור" },
  { icon: "📊", label: "סטטיסטיקות" },
];

interface Props { onComplete: () => void }

const FirstLoginScreen = ({ onComplete }: Props) => {
  const [phase, setPhase] = useState(0);
  // 0=black, 1=scan+grid, 2=logo, 3=text, 4=cta, 5=exiting
  const [rings, setRings] = useState<number[]>([]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 120);
    const t2 = setTimeout(() => {
      setPhase(2);
      // spawn rings in waves
      setRings([0]);
      setTimeout(() => setRings(r => [...r, 1]), 220);
      setTimeout(() => setRings(r => [...r, 2]), 420);
      setTimeout(() => setRings(r => [...r, 3]), 650);
    }, 900);
    const t3 = setTimeout(() => setPhase(3), 2100);
    const t4 = setTimeout(() => setPhase(4), 3400);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  const handleEnter = () => {
    setPhase(5);
    setTimeout(onComplete, 750);
  };

  const isExiting = phase === 5;

  return (
    <>
      <style>{`
        @keyframes ztScan {
          0%   { top: -2px; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 0.7; }
          100% { top: 100vh; opacity: 0; }
        }
        @keyframes ztGrid {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ztLogoIn {
          0%   { transform: scale(0.15) rotate(-6deg); filter: blur(24px) brightness(4); opacity: 0; }
          55%  { transform: scale(1.12) rotate(1deg); filter: blur(0) brightness(1.6); opacity: 1; }
          75%  { transform: scale(0.97) rotate(0deg); filter: blur(0) brightness(1); }
          100% { transform: scale(1) rotate(0deg); filter: blur(0) brightness(1); opacity: 1; }
        }
        @keyframes ztRing {
          0%   { transform: translate(-50%,-50%) scale(0.4); opacity: 0.9; }
          100% { transform: translate(-50%,-50%) scale(3.2); opacity: 0; }
        }
        @keyframes ztParticle {
          0%   { opacity: 1; transform: translate(-50%,-50%) translate(0,0) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%,-50%) translate(var(--ptx),var(--pty)) scale(0); }
        }
        @keyframes ztTitle {
          0%   { opacity: 0; transform: translateY(18px); filter: blur(12px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes ztSubtitle {
          0%   { opacity: 0; transform: translateY(10px) skewY(-1.5deg); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0) skewY(0); filter: blur(0); }
        }
        @keyframes ztPill {
          0%   { opacity: 0; transform: translateY(14px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ztCta {
          0%   { opacity: 0; transform: translateY(20px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ztCtaGlow {
          0%,100% { box-shadow: 0 0 22px rgba(124,58,237,0.5), 0 0 50px rgba(124,58,237,0.2); }
          50%      { box-shadow: 0 0 36px rgba(124,58,237,0.8), 0 0 80px rgba(124,58,237,0.35), 0 0 120px rgba(34,211,238,0.15); }
        }
        @keyframes ztCorner {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ztExit {
          0%   { opacity: 1; transform: scale(1); filter: brightness(1); }
          25%  { opacity: 1; transform: scale(1.02); filter: brightness(2.5); }
          100% { opacity: 0; transform: scale(0.94); filter: brightness(0); }
        }
        @keyframes ztLogoFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes ztHudLine {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
      `}</style>

      {/* ── Fullscreen overlay ── */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden select-none"
        style={{
          background: "#030307",
          animation: isExiting ? "ztExit 0.75s cubic-bezier(0.4,0,1,1) forwards" : undefined,
        }}
      >
        {/* Grid bg */}
        {phase >= 1 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139,92,246,0.055) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139,92,246,0.055) 1px, transparent 1px)
              `,
              backgroundSize: "56px 56px",
              animation: "ztGrid 2.5s ease forwards",
            }}
          />
        )}

        {/* Radial vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 65% 65% at 50% 50%, transparent 30%, #030307 85%)" }}
        />

        {/* Ambient glow behind logo */}
        {phase >= 2 && (
          <div
            className="absolute pointer-events-none"
            style={{
              width: 420, height: 420,
              top: "50%", left: "50%",
              transform: "translate(-50%, -55%)",
              background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(79,70,229,0.08) 45%, transparent 70%)",
              filter: "blur(24px)",
            }}
          />
        )}

        {/* ── Scan line ── */}
        {phase >= 1 && (
          <div
            className="absolute inset-x-0 h-[2px] pointer-events-none"
            style={{
              top: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.9) 30%, rgba(34,211,238,0.7) 70%, transparent 100%)",
              animation: "ztScan 1.1s cubic-bezier(0.4,0,0.6,1) forwards",
              boxShadow: "0 0 12px rgba(124,58,237,0.7), 0 0 24px rgba(124,58,237,0.3)",
            }}
          />
        )}

        {/* ── Main content ── */}
        <div className="relative flex flex-col items-center" style={{ gap: "20px" }}>

          {/* Logo zone */}
          <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>

            {/* Expanding rings */}
            {rings.map(i => (
              <div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 110,
                  height: 110,
                  top: "50%",
                  left: "50%",
                  border: `1.5px solid rgba(${i % 2 === 0 ? "139,92,246" : "34,211,238"},${0.7 - i * 0.1})`,
                  animation: `ztRing ${1.4 + i * 0.15}s cubic-bezier(0.2,0.6,0.4,1) forwards`,
                }}
              />
            ))}

            {/* Particle sparks */}
            {phase >= 2 && PARTICLES.map(p => (
              <div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: p.size,
                  height: p.size,
                  top: "50%",
                  left: "50%",
                  background: p.color,
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                  "--ptx": `${p.tx}px`,
                  "--pty": `${p.ty}px`,
                  animation: `ztParticle 0.9s cubic-bezier(0.15,0.85,0.3,1) ${p.delay}s forwards`,
                } as React.CSSProperties & Record<string, string>}
              />
            ))}

            {/* The Logo */}
            {phase >= 2 && (
              <div
                style={{
                  animation: phase >= 4
                    ? "ztLogoFloat 3.5s ease-in-out infinite"
                    : "ztLogoIn 1s cubic-bezier(0.34,1.3,0.64,1) forwards",
                }}
              >
                <ZenTradeLogo size={96} />
              </div>
            )}
          </div>

          {/* ── Text block ── */}
          {phase >= 3 && (
            <div className="flex flex-col items-center" style={{ gap: "8px" }}>
              {/* HUD line above title */}
              <div
                style={{
                  height: 1,
                  width: 180,
                  background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)",
                  transformOrigin: "center",
                  animation: "ztHudLine 0.6s ease forwards",
                  marginBottom: 6,
                }}
              />

              <h1
                className="font-black tracking-tight"
                style={{
                  fontSize: "clamp(36px, 8vw, 52px)",
                  background: "linear-gradient(135deg, #ffffff 30%, #c4b5fd 65%, #22d3ee 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "ztTitle 0.7s cubic-bezier(0.2,0.8,0.4,1) forwards",
                  textShadow: undefined,
                }}
              >
                ZenTrade
              </h1>

              <p
                className="font-semibold tracking-[0.3em] uppercase"
                style={{
                  fontSize: "clamp(11px, 2vw, 14px)",
                  color: "rgba(167,139,250,0.55)",
                  animation: "ztSubtitle 0.6s ease 0.15s both",
                }}
              >
                הקוקפיט שלך מוכן
              </p>

              {/* HUD line below */}
              <div
                style={{
                  height: 1,
                  width: 180,
                  background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.35), transparent)",
                  transformOrigin: "center",
                  animation: "ztHudLine 0.6s ease 0.2s both",
                  marginTop: 4,
                }}
              />
            </div>
          )}

          {/* ── Feature pills ── */}
          {phase >= 3 && (
            <div className="flex items-center gap-2.5">
              {FEATURES.map((f, i) => (
                <div
                  key={f.label}
                  className="flex items-center gap-1.5 rounded-full"
                  style={{
                    padding: "6px 14px",
                    background: "rgba(124,58,237,0.07)",
                    border: "1px solid rgba(124,58,237,0.22)",
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 12,
                    fontWeight: 600,
                    animation: `ztPill 0.5s cubic-bezier(0.2,0.8,0.4,1) ${0.1 + i * 0.1}s both`,
                  }}
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── CTA Button ── */}
          {phase >= 4 && (
            <button
              onClick={handleEnter}
              className="relative font-black text-white rounded-2xl transition-transform active:scale-95"
              style={{
                marginTop: 8,
                padding: "14px 40px",
                fontSize: "clamp(13px, 2.5vw, 15px)",
                letterSpacing: "0.05em",
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0891b2 100%)",
                border: "1px solid rgba(139,92,246,0.45)",
                animation: "ztCta 0.6s cubic-bezier(0.2,0.8,0.4,1) forwards, ztCtaGlow 2.5s ease 0.6s infinite",
              }}
            >
              <span className="relative z-10">כנס לשוק ←</span>
            </button>
          )}

          {/* Skip */}
          {phase >= 2 && !isExiting && (
            <button
              onClick={handleEnter}
              className="absolute -bottom-14 text-[11px] font-medium transition-opacity hover:opacity-80"
              style={{ color: "rgba(255,255,255,0.18)", animation: "ztPill 0.5s ease 1.5s both" }}
            >
              דלג
            </button>
          )}
        </div>

        {/* ── HUD corner brackets ── */}
        {phase >= 2 && (
          <>
            {[
              { pos: "top-5 left-5",  borderStyle: { borderTop: "1.5px solid rgba(124,58,237,0.45)", borderLeft: "1.5px solid rgba(124,58,237,0.45)" } },
              { pos: "top-5 right-5", borderStyle: { borderTop: "1.5px solid rgba(124,58,237,0.45)", borderRight: "1.5px solid rgba(124,58,237,0.45)" } },
              { pos: "bottom-5 left-5",  borderStyle: { borderBottom: "1.5px solid rgba(34,211,238,0.3)", borderLeft: "1.5px solid rgba(34,211,238,0.3)" } },
              { pos: "bottom-5 right-5", borderStyle: { borderBottom: "1.5px solid rgba(34,211,238,0.3)", borderRight: "1.5px solid rgba(34,211,238,0.3)" } },
            ].map(({ pos, borderStyle }, i) => (
              <div
                key={i}
                className={`absolute w-8 h-8 pointer-events-none ${pos}`}
                style={{
                  borderRadius: 2,
                  animation: `ztCorner 0.4s ease ${0.1 + i * 0.07}s both`,
                  ...borderStyle,
                }}
              />
            ))}
          </>
        )}

        {/* ── Bottom status line ── */}
        {phase >= 3 && (
          <div
            className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-2 pointer-events-none"
            style={{ animation: "ztSubtitle 0.5s ease 0.3s both" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #4ade80" }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", letterSpacing: "0.15em" }}>
              SYSTEM ONLINE
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default FirstLoginScreen;
