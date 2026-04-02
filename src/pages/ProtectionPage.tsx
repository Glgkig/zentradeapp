import { useState, useMemo } from "react";
import {
  Shield, Lock, AlertTriangle, ShieldCheck, ShieldAlert, TrendingDown,
  Calculator, CheckSquare, Square, Target, Crosshair, Gauge,
  Ban, Power, Zap, Flame, Eye,
} from "lucide-react";
import { toast } from "sonner";

/* ===== Gauge Component ===== */
const DrawdownGauge = ({ current, limit }: { current: number; limit: number }) => {
  const pct = Math.min(Math.abs(current) / limit, 1);
  const deg = pct * 180;
  const color =
    pct < 0.4 ? "hsl(var(--profit))" :
    pct < 0.7 ? "hsl(45, 100%, 50%)" :
    "hsl(var(--loss))";
  const bgColor =
    pct < 0.4 ? "hsl(var(--profit) / 0.08)" :
    pct < 0.7 ? "hsla(45, 100%, 50%, 0.08)" :
    "hsl(var(--loss) / 0.08)";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[200px] h-[105px] overflow-hidden">
        {/* Background arc */}
        <div className="absolute inset-0 w-[200px] h-[200px] rounded-full border-[12px] border-white/[0.04]"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }} />
        {/* Active arc */}
        <div
          className="absolute inset-0 w-[200px] h-[200px] rounded-full border-[12px] border-transparent transition-all duration-1000 ease-out"
          style={{
            borderTopColor: color,
            borderRightColor: deg > 90 ? color : "transparent",
            transform: `rotate(${Math.min(deg, 180)}deg)`,
            clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        />
        {/* Center text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <p className="text-2xl font-black font-mono" style={{ color }}>
            -${Math.abs(current)}
          </p>
          <p className="text-2xs text-muted-foreground/40 font-mono">
            מתוך -${limit}
          </p>
        </div>
      </div>
      {/* Status bar */}
      <div className="w-full mt-3 rounded-xl overflow-hidden h-2" style={{ background: "hsl(var(--muted) / 0.1)" }}>
        <div
          className="h-full rounded-xl transition-all duration-1000 ease-out"
          style={{ width: `${pct * 100}%`, background: color, boxShadow: `0 0 12px ${color}` }}
        />
      </div>
      <div className="flex justify-between w-full mt-1.5 px-1">
        <span className="text-2xs text-muted-foreground/30 font-mono">$0</span>
        <span className="text-2xs font-mono" style={{ color: pct > 0.7 ? color : "hsl(var(--muted-foreground) / 0.3)" }}>
          {(pct * 100).toFixed(0)}%
        </span>
        <span className="text-2xs text-muted-foreground/30 font-mono">-${limit}</span>
      </div>
    </div>
  );
};

/* ===== Main Page ===== */
const ProtectionPage = () => {
  const [dailyLoss] = useState(-250);
  const [drawdownLimit] = useState(500);
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  // Position calculator
  const [accountSize, setAccountSize] = useState("50000");
  const [riskPct, setRiskPct] = useState("1");
  const [stopDistance, setStopDistance] = useState("25");

  const positionSize = useMemo(() => {
    const acc = parseFloat(accountSize) || 0;
    const risk = parseFloat(riskPct) || 0;
    const stop = parseFloat(stopDistance) || 1;
    const riskAmount = acc * (risk / 100);
    return (riskAmount / stop).toFixed(2);
  }, [accountSize, riskPct, stopDistance]);

  // Iron rules
  const [rules, setRules] = useState([
    { id: 1, text: "אין מסחר בזמן חדשות אדומות (High Impact)", checked: false },
    { id: 2, text: "סיכון מקסימלי לעסקה — 1% מהתיק", checked: false },
    { id: 3, text: "המתנה לסטאפ ברור (SMC / FVG) בלבד", checked: false },
    { id: 4, text: "לא להזיז סטופ לוס אחרי כניסה", checked: false },
    { id: 5, text: "מקסימום 3 עסקאות מפסידות רצופות — עצירה", checked: false },
    { id: 6, text: "תיעוד כל עסקה ביומן לפני הבאה", checked: false },
  ]);

  const toggleRule = (id: number) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, checked: !r.checked } : r));
  };

  const allChecked = rules.every(r => r.checked);
  const checkedCount = rules.filter(r => r.checked).length;

  const handleKillSwitch = () => {
    setKillSwitchActive(true);
    toast.success("🔒 נעילת מסחר הופעלה — ללא עסקאות חדשות עד חצות", { duration: 5000 });
  };

  return (
    <div className="mx-auto max-w-[960px] space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-loss/8 border border-loss/12">
          <Shield className="h-5 w-5 text-loss/70" />
        </div>
        <div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-foreground">חמ״ל ניהול סיכונים</h1>
          <p className="text-2xs text-muted-foreground/40">Risk Management & Capital Protection</p>
        </div>
      </div>

      {/* ===== KILL SWITCH ===== */}
      <div className="relative rounded-2xl border border-loss/10 bg-white/[0.02] backdrop-blur-md p-5 md:p-6 overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-loss/[0.04] rounded-full blur-[80px] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {/* Left: Gauge */}
          <div className="flex-1 w-full max-w-[260px]">
            <DrawdownGauge current={dailyLoss} limit={drawdownLimit} />
          </div>

          {/* Right: Info + Kill Switch */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-loss/60" />
                <h2 className="text-[14px] font-bold text-foreground">מגן הפסד יומי</h2>
                <span className="text-2xs font-mono text-muted-foreground/30 bg-white/[0.03] border border-white/[0.06] rounded-md px-2 py-0.5">
                  DAILY DRAWDOWN
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                ברגע שההפסד היומי יגיע ל-<span className="text-loss font-bold font-mono">-${drawdownLimit}</span>,
                המערכת תחסום אוטומטית כל פעולת מסחר חדשה עד חצות.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "הפסד היום", value: `-$${Math.abs(dailyLoss)}`, color: "text-loss" },
                { label: "נותר", value: `$${drawdownLimit - Math.abs(dailyLoss)}`, color: "text-profit" },
                { label: "סטטוס", value: killSwitchActive ? "נעול 🔒" : "פעיל", color: killSwitchActive ? "text-loss" : "text-profit" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
                  <p className="text-2xs text-muted-foreground/35 mb-0.5">{s.label}</p>
                  <p className={`text-[13px] font-black font-mono ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Kill Switch Button */}
            <button
              onClick={handleKillSwitch}
              disabled={killSwitchActive}
              className={`haptic-press w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-[13px] font-bold transition-all duration-300 min-h-[52px] ${
                killSwitchActive
                  ? "bg-loss/10 border border-loss/20 text-loss/60 cursor-not-allowed"
                  : "bg-loss/8 border border-loss/15 text-loss hover:bg-loss/15 hover:shadow-[0_0_30px_hsl(var(--loss)/0.15)] active:scale-[0.98]"
              }`}
            >
              {killSwitchActive ? (
                <><Lock className="h-4.5 w-4.5" /><span>יומן נעול להיום</span></>
              ) : (
                <><Power className="h-4.5 w-4.5" /><span>🔒 נעל יומן להיום (Kill Switch)</span></>
              )}
            </button>
            {!killSwitchActive && (
              <p className="text-2xs text-muted-foreground/25 text-center">
                מונע הזנת עסקאות חדשות כדי למנוע Revenge Trading
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ===== POSITION SIZE CALCULATOR ===== */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-5 md:p-6 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/[0.04] rounded-full blur-[60px] pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/8 border border-primary/12">
              <Calculator className="h-4 w-4 text-primary/70" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-foreground">מחשבון גודל פוזיציה חכם</h2>
              <p className="text-2xs text-muted-foreground/30 font-mono">SMART POSITION SIZER</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <CalcInput
              label="גודל תיק"
              sublabel="ACCOUNT SIZE"
              value={accountSize}
              onChange={setAccountSize}
              prefix="$"
              icon={<Target className="h-3.5 w-3.5 text-muted-foreground/30" />}
            />
            <CalcInput
              label="סיכון באחוזים"
              sublabel="RISK %"
              value={riskPct}
              onChange={setRiskPct}
              prefix="%"
              icon={<AlertTriangle className="h-3.5 w-3.5 text-muted-foreground/30" />}
            />
            <CalcInput
              label="מרחק לסטופ"
              sublabel="SL DISTANCE (PTS)"
              value={stopDistance}
              onChange={setStopDistance}
              prefix="pts"
              icon={<Crosshair className="h-3.5 w-3.5 text-muted-foreground/30" />}
            />
          </div>

          {/* Result */}
          <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
                <Gauge className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xs text-muted-foreground/40">המלצת גודל פוזיציה</p>
                <p className="text-[11px] text-muted-foreground/30">
                  סיכון: <span className="text-foreground/60 font-mono">${((parseFloat(accountSize) || 0) * (parseFloat(riskPct) || 0) / 100).toFixed(0)}</span>
                </p>
              </div>
            </div>
            <div className="text-center md:text-left">
              <p className="text-3xl font-black font-mono text-primary" style={{ textShadow: "0 0 20px hsl(var(--primary) / 0.3)" }}>
                {positionSize}
              </p>
              <p className="text-2xs text-primary/50 font-mono font-bold">LOTS</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== IRON RULES CHECKLIST ===== */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-5 md:p-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 w-60 h-32 bg-accent/[0.03] rounded-full blur-[80px] pointer-events-none" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/8 border border-accent/12">
                <ShieldCheck className="h-4 w-4 text-accent/70" />
              </div>
              <div>
                <h2 className="text-[14px] font-bold text-foreground">חוקי ברזל</h2>
                <p className="text-2xs text-muted-foreground/30 font-mono">PRE-TRADE CHECKLIST</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-2xs font-bold font-mono ${allChecked ? "text-profit" : "text-muted-foreground/30"}`}>
                {checkedCount}/{rules.length}
              </span>
              <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(checkedCount / rules.length) * 100}%`,
                    background: allChecked ? "hsl(var(--profit))" : "hsl(var(--accent))",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            {rules.map((rule) => (
              <button
                key={rule.id}
                onClick={() => toggleRule(rule.id)}
                className={`haptic-press w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-right transition-all duration-200 min-h-[48px] group ${
                  rule.checked
                    ? "border-profit/12 bg-profit/[0.03] hover:bg-profit/[0.06]"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1]"
                }`}
              >
                {rule.checked ? (
                  <CheckSquare className="h-4 w-4 text-profit shrink-0 transition-transform group-active:scale-90" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground/20 shrink-0 transition-transform group-active:scale-90" />
                )}
                <span className={`text-[12px] font-medium transition-colors ${
                  rule.checked ? "text-foreground/80 line-through decoration-profit/30" : "text-foreground/60"
                }`}>
                  {rule.text}
                </span>
              </button>
            ))}
          </div>

          {allChecked && (
            <div className="mt-4 rounded-xl border border-profit/15 bg-profit/[0.04] p-3 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ShieldCheck className="h-5 w-5 text-profit" />
              <div>
                <p className="text-[12px] font-bold text-profit">כל חוקי הברזל אושרו ✓</p>
                <p className="text-2xs text-profit/50">אתה מוכן למסחר אחראי.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== EMERGENCY SELF-EXCLUSION ===== */}
      <div className="rounded-2xl border border-loss/8 bg-loss/[0.02] backdrop-blur-md p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-loss/[0.03] to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-loss/10 border border-loss/15">
              <Ban className="h-4.5 w-4.5 text-loss/60" />
            </div>
            <div>
              <h3 className="text-[12px] font-bold text-foreground/80">כפתור מצוקה — נעילה עצמית</h3>
              <p className="text-2xs text-muted-foreground/35">נעילת חשבון מסחר ל-24 שעות. ללא אפשרות ביטול.</p>
            </div>
          </div>
          <button
            onClick={() => toast.error("🚨 חשבון נעול ל-24 שעות", { duration: 5000 })}
            className="haptic-press flex items-center gap-2 rounded-xl bg-loss/10 border border-loss/15 px-5 py-2.5 text-[11px] font-bold text-loss hover:bg-loss/20 hover:shadow-[0_0_20px_hsl(var(--loss)/0.15)] transition-all active:scale-95 min-h-[44px] whitespace-nowrap"
          >
            <Flame className="h-3.5 w-3.5" />
            <span className="font-mono">LOCK 24H</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===== Calc Input ===== */
const CalcInput = ({
  label, sublabel, value, onChange, prefix, icon,
}: {
  label: string; sublabel: string; value: string; onChange: (v: string) => void; prefix: string; icon: React.ReactNode;
}) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1.5">
      {icon}
      <label className="text-[11px] font-semibold text-foreground/60">{label}</label>
    </div>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] font-bold text-foreground font-mono placeholder:text-muted-foreground/15 outline-none focus:border-primary/20 focus:ring-1 focus:ring-primary/10 transition-all min-h-[44px]"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xs font-bold text-muted-foreground/25 font-mono">
        {prefix}
      </span>
    </div>
    <p className="text-2xs text-muted-foreground/20 font-mono mt-0.5">{sublabel}</p>
  </div>
);

export default ProtectionPage;
