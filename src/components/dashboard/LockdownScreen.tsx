import { useState, useEffect } from "react";
import { Lock, ShieldOff } from "lucide-react";

interface LockdownScreenProps {
  unlocksAt: Date;
  onUnlock: () => void;
}

const LockdownScreen = ({ unlocksAt, onUnlock }: LockdownScreenProps) => {
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00" });
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const tick = () => {
      const diff = unlocksAt.getTime() - Date.now();
      if (diff <= 0) {
        onUnlock();
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [unlocksAt, onUnlock]);

  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      dir="rtl"
      style={{ background: "#000000" }}
    >
      {/* Slow red pulse background */}
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms]"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(220,38,38,0.08) 0%, transparent 70%)",
          opacity: pulse ? 1 : 0.3,
        }}
      />

      {/* Terminal grid */}
      <div className="absolute inset-0 terminal-grid opacity-30 pointer-events-none" />

      {/* Shield icon */}
      <div className="relative mb-8">
        <div
          className="absolute inset-[-16px] rounded-3xl blur-2xl transition-opacity duration-[2000ms]"
          style={{ background: "rgba(220,38,38,0.15)", opacity: pulse ? 1 : 0.4 }}
        />
        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-3xl"
          style={{
            background: "rgba(220,38,38,0.06)",
            border: "1px solid rgba(220,38,38,0.25)",
            boxShadow: "0 0 40px rgba(220,38,38,0.1), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <Lock className="h-10 w-10" style={{ color: "#ef4444", filter: "drop-shadow(0 0 8px rgba(239,68,68,0.6))" }} />
        </div>
      </div>

      {/* Title */}
      <p
        className="text-[11px] font-mono font-black uppercase tracking-[0.3em] mb-3"
        style={{ color: "rgba(239,68,68,0.7)" }}
      >
        SYSTEM LOCKED
      </p>
      <h1
        className="text-[22px] font-black text-white text-center mb-2 leading-tight"
        style={{ textShadow: "0 0 30px rgba(255,255,255,0.1)" }}
      >
        הגעת למגבלת ההפסד היומית
      </h1>

      {/* AI message */}
      <div
        className="max-w-sm mx-auto text-center px-6 py-4 rounded-2xl mb-10 mt-4"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderTopColor: "rgba(239,68,68,0.15)",
        }}
      >
        <p className="text-[13px] text-white/50 leading-relaxed">
          החשיבה שלך פגועה כרגע מהפסדים. ZenTrade נועל את הפלטפורמה כדי להגן על ההון שלך.
          <span className="block mt-2 text-white/30 text-[12px]">התרחק מהגרפים. תחזור מחר עם ראש צלול.</span>
        </p>
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-1 font-mono" dir="ltr">
        {[timeLeft.h, timeLeft.m, timeLeft.s].map((unit, i) => (
          <div key={i} className="flex items-center gap-1">
            <div
              className="flex items-center justify-center rounded-xl px-4 py-3 min-w-[64px]"
              style={{
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.15)",
                boxShadow: "0 0 20px rgba(59,130,246,0.05)",
              }}
            >
              <span
                className="text-[36px] font-black tabular-nums"
                style={{ color: "#60a5fa", textShadow: "0 0 20px rgba(59,130,246,0.5)" }}
              >
                {unit}
              </span>
            </div>
            {i < 2 && (
              <span className="text-[28px] font-black mb-1" style={{ color: "rgba(59,130,246,0.3)" }}>:</span>
            )}
          </div>
        ))}
      </div>
      <p
        className="text-[9px] font-mono uppercase tracking-[0.25em] mt-3"
        style={{ color: "rgba(59,130,246,0.35)" }}
      >
        UNTIL UNLOCK
      </p>

      {/* Bottom hint */}
      <div className="absolute bottom-8 flex items-center gap-2">
        <ShieldOff className="h-3.5 w-3.5" style={{ color: "rgba(255,255,255,0.1)" }} />
        <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.1)" }}>
          ZENTRADE TILT PROTECTION · ACTIVE
        </span>
      </div>
    </div>
  );
};

export default LockdownScreen;
