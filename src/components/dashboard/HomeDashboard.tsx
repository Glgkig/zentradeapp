import { useState, useEffect } from "react";
import {
  Bot, Shield, TrendingUp, Activity, CheckCircle2,
  BarChart3, Target, Eye, ArrowUpRight, ArrowDownRight, Clock,
  Newspaper, ChevronLeft, Zap, Mic, AlertTriangle, Lock,
} from "lucide-react";

const HomeDashboard = ({ userName }: { userName: string }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : "ערב טוב";

  return (
    <div className="mx-auto max-w-[1280px] space-y-4">

      {/* ===== Row 1: AI Pulse + Tilt Meter + Protection ===== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* 1. AI Pulse & Emotional State */}
        <div className="md:col-span-5 rounded-2xl border border-primary/15 bg-gradient-to-bl from-primary/[0.05] via-secondary/40 to-secondary/30 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/[0.04] rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-start gap-3.5 mb-4">
              {/* Pulsing AI Avatar */}
              <div className="relative shrink-0">
                <div className="absolute inset-[-4px] rounded-2xl bg-primary/10 animate-pulse" style={{ animationDuration: "3s" }} />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 border border-primary/20 shadow-[0_0_20px_hsl(217_72%_53%/0.12)]">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="font-heading text-base md:text-lg font-bold text-foreground">
                  {greeting}, <span className="text-primary">{userName}</span>
                </h2>
                <span className="inline-flex items-center gap-1.5 mt-1 rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 text-[9px] font-semibold text-accent">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                  שומר הראש: פעיל
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-muted/20 border border-border/50 p-4">
              <p className="text-xs md:text-sm text-muted-foreground leading-[1.9]">
                הסטופ-לוס שלך מוגדר וההגנה היומית דרוכה.
                <br />
                <span className="text-primary font-medium">נשום עמוק, תחכה לסטאפ שלך. אני פה.</span>
              </p>
              <p className="mt-2 text-[10px] text-muted-foreground/50 italic">
                "לא לקחת עסקה זה גם חלק מהמסחר."
              </p>
            </div>
          </div>
        </div>

        {/* 2. Psychological Tilt Meter */}
        <div className="md:col-span-3 rounded-2xl border border-border/15 bg-secondary/15 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Activity className="h-4 w-4 text-accent" />
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-muted-foreground">מד טילט פסיכולוגי</span>
          </div>

          <div className="flex flex-col items-center">
            <TiltGauge value={25} />
            <div className="mt-3 text-center">
              <p className="text-sm font-bold text-accent">רגוע ✓</p>
              <p className="text-[9px] text-muted-foreground mt-1">הערכת AI בזמן אמת</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2">
              <span className="text-[9px] text-muted-foreground">זמן מאז עסקה אחרונה</span>
              <span className="text-[10px] font-semibold text-foreground">שעתיים</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2">
              <span className="text-[9px] text-muted-foreground">סטריק רצוף</span>
              <span className="text-[10px] font-semibold text-accent">3 ניצחונות ✓</span>
            </div>
          </div>
        </div>

        {/* 3. Hard Protection Limits */}
        <div className="md:col-span-4 rounded-2xl border border-border/15 bg-secondary/15 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-muted-foreground">מגבלות הגנה קשיחות</span>
          </div>

          {/* Daily Loss */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-foreground">הפסד יומי מקסימלי</span>
              <span className="text-[10px] text-muted-foreground">$120 / $500</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-l from-accent to-accent/70 transition-all relative" style={{ width: "24%" }}>
                <div className="absolute inset-0 bg-white/10 animate-pulse" style={{ animationDuration: "2s" }} />
              </div>
            </div>
            <p className="text-[9px] text-accent mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              24% — בטווח בטוח
            </p>
          </div>

          {/* Trade Allowance */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-foreground">ניצולת עסקאות יומית</span>
              <span className="text-[10px] text-muted-foreground">2 / 5</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-3 flex-1 rounded-full transition-all ${
                    i <= 2 ? "bg-primary shadow-[0_0_6px_hsl(217_72%_53%/0.3)]" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-3 flex items-start gap-2">
            <Lock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-[9px] md:text-[10px] text-muted-foreground leading-relaxed">
              נשארו לך <span className="text-primary font-bold">3 כדורים בקנה</span> להיום. תשתמש בהם בחוכמה.
            </p>
          </div>
        </div>
      </div>

      {/* ===== Row 2: Chart + AI Signals + Sentiment ===== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Compact Chart */}
        <div className="md:col-span-5 rounded-2xl border border-border/15 bg-secondary/15 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/15 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] md:text-xs font-semibold text-foreground">EUR/USD — M15</span>
              <span className="flex items-center gap-1 text-[9px] text-accent font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                Live
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-muted/50 px-2 py-0.5 text-[9px] text-muted-foreground font-mono">1.0847</span>
              <span className="text-[9px] text-accent flex items-center gap-0.5 font-semibold">
                <ArrowUpRight className="h-3 w-3" />+0.12%
              </span>
            </div>
          </div>
          <div className="p-3 md:p-4">
            <div className="flex items-end gap-[2px] h-32 md:h-40">
              {chartData.map((c, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-[1px]">
                  <div className="w-px bg-muted-foreground/15" style={{ height: `${c.wick}%` }} />
                  <div className={`w-full rounded-[1px] ${c.bull ? "bg-accent/70" : "bg-destructive/55"} transition-colors`} style={{ height: `${c.body}%` }} />
                  <div className="w-px bg-muted-foreground/15" style={{ height: `${c.lwick}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live AI Signals Feed */}
        <div className="md:col-span-4 rounded-2xl border border-border/15 bg-secondary/15 backdrop-blur-sm p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-foreground">סיגנלים חיים מה-AI</span>
          </div>
          <div className="space-y-2">
            {[
              { icon: <CheckCircle2 className="h-3 w-3 text-accent shrink-0" />, text: "זיהוי בולען (Engulfing) — אישור setup לונג", time: "לפני 3 דק׳", border: "border-accent/20 bg-accent/[0.04]" },
              { icon: <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />, text: "נר פטיש מזויף — נפח מסחר נמוך", time: "לפני 8 דק׳", border: "border-destructive/20 bg-destructive/[0.04]" },
              { icon: <Newspaper className="h-3 w-3 text-primary shrink-0" />, text: "15 דקות להודעת CPI — אל תסחור", time: "לפני 12 דק׳", border: "border-primary/20 bg-primary/[0.04]" },
              { icon: <Eye className="h-3 w-3 text-accent shrink-0" />, text: "GBP/USD — אזור ביקוש חזק ב-1.2680", time: "לפני 20 דק׳", border: "border-accent/20 bg-accent/[0.04]" },
              { icon: <Shield className="h-3 w-3 text-primary shrink-0" />, text: "הגנת סטופ הוזזה ל-Break Even", time: "לפני 25 דק׳", border: "border-primary/20 bg-primary/[0.04]" },
            ].map((sig, i) => (
              <div key={i} className={`flex items-start gap-2.5 rounded-xl border ${sig.border} px-3 py-2.5 transition-all duration-200 hover:scale-[1.01] cursor-default`}>
                <div className="mt-0.5">{sig.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] md:text-[10px] font-medium text-foreground leading-relaxed">{sig.text}</p>
                  <p className="text-[8px] text-muted-foreground/50 mt-0.5">{sig.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Sentiment + Quick Stats */}
        <div className="md:col-span-3 space-y-4">
          {/* Sentiment */}
          <div className="rounded-2xl border border-border/15 bg-secondary/15 backdrop-blur-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-foreground">סנטימנט שוק</span>
            </div>
            <div className="space-y-3">
              {[
                { pair: "EUR/USD", bull: 62 },
                { pair: "GBP/USD", bull: 45 },
                { pair: "BTC/USD", bull: 78 },
              ].map((s) => (
                <div key={s.pair}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-semibold text-foreground">{s.pair}</span>
                    <span className="text-[8px] text-muted-foreground">{s.bull}% לונג</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden">
                    <div className="bg-accent/70 transition-all" style={{ width: `${s.bull}%` }} />
                    <div className="bg-destructive/50 flex-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Performance */}
          <div className="rounded-2xl border border-border/15 bg-secondary/15 backdrop-blur-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
              <span className="text-[10px] font-semibold text-foreground">ביצועים מהירים</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Win Rate", value: "68%", color: "text-accent" },
                { label: "Profit Factor", value: "2.4", color: "text-accent" },
                { label: "Avg Win", value: "+$87", color: "text-accent" },
                { label: "Avg Loss", value: "-$36", color: "text-destructive" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-muted/15 border border-border/30 p-2 text-center">
                  <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[8px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Row 3: Watchlist + Goals + Voice + News ===== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Watchlist */}
        <div className="md:col-span-4 rounded-2xl border border-border/15 bg-secondary/15 backdrop-blur-sm p-4 md:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">רשימת מעקב</span>
          </div>
          <div className="space-y-2">
            {watchlist.map((item) => (
              <div key={item.pair} className="flex items-center justify-between rounded-xl bg-muted/10 border border-border/15 px-3 py-2.5 transition-all duration-200 hover:bg-muted/20 hover:border-primary/15 cursor-pointer min-h-[48px]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{item.pair}</span>
                  <span className="text-[8px] text-muted-foreground/60 bg-muted/30 rounded px-1 py-0.5">{item.tf}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">{item.price}</span>
                  <span className={`flex items-center gap-0.5 text-[10px] font-bold ${item.chg > 0 ? "text-accent" : "text-destructive"}`}>
                    {item.chg > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {item.chg > 0 ? "+" : ""}{item.chg}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="md:col-span-3 rounded-2xl border border-border/15 bg-secondary/15 backdrop-blur-sm p-4 md:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">יעדים להיום</span>
          </div>
          <div className="space-y-4">
            <GoalBar label="יעד רווח" current={1247} target={2000} unit="$" color="accent" />
            <GoalBar label="עסקאות" current={2} target={5} unit="" color="primary" />
            <GoalBar label="Win Rate" current={100} target={65} unit="%" color="accent" exceeded />
          </div>
        </div>

        {/* Voice Journal */}
        <div className="md:col-span-2 rounded-2xl border border-border/15 bg-secondary/15 backdrop-blur-sm p-4 md:p-5 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <div className="absolute inset-[-8px] rounded-full bg-primary/5 animate-pulse" style={{ animationDuration: "2.5s" }} />
            <button className="interactive-btn relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/25 text-primary transition-all hover:bg-primary/20 hover:shadow-[0_0_30px_hsl(217_72%_53%/0.2)] active:scale-95">
              <Mic className="h-7 w-7" />
            </button>
          </div>
          <p className="text-xs font-semibold text-foreground mb-1">יומן קולי</p>
          <p className="text-[9px] text-muted-foreground leading-relaxed">
            מרגיש לחץ? תלחץ ותדבר אליי. אני אנתח את הקול שלך.
          </p>
        </div>

        {/* News Guard */}
        <div className="md:col-span-3 rounded-2xl border border-destructive/20 bg-destructive/[0.03] p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
              <Newspaper className="h-4 w-4 text-destructive" />
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-foreground">News Guard</span>
          </div>
          <NewsCountdown />
          <div className="mt-3 rounded-xl border border-destructive/15 bg-destructive/[0.04] p-3">
            <p className="text-[9px] md:text-[10px] text-muted-foreground leading-relaxed">
              <span className="text-destructive font-semibold">הודעת CPI</span> — המערכת תנעל פתיחת עסקאות חדשות <span className="text-destructive font-semibold">10 דקות</span> לפני ההודעה.
            </p>
          </div>
          <div className="mt-3 space-y-1.5">
            {[
              { name: "🔴 CPI — US", time: "15:30", critical: true },
              { name: "🟡 FOMC Minutes", time: "21:00", critical: false },
            ].map((ev, i) => (
              <div key={i} className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[9px] ${
                ev.critical ? "bg-destructive/10 border border-destructive/15" : "bg-muted/20"
              }`}>
                <span className="text-foreground/70">{ev.name}</span>
                <span className={ev.critical ? "text-destructive font-semibold" : "text-muted-foreground"}>{ev.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Row 4: Recent Activity Feed ===== */}
      <div className="rounded-2xl border border-border/15 bg-secondary/15 backdrop-blur-sm p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-xs md:text-sm font-semibold text-foreground">העסקאות האחרונות שלך</span>
          </div>
          <button className="flex items-center gap-1 text-[10px] text-primary font-medium hover:underline">
            ראה הכל
            <ChevronLeft className="h-3 w-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-border/15 text-[9px] md:text-[10px] text-muted-foreground">
                <th className="pb-2 pr-2 font-medium">נכס</th>
                <th className="pb-2 font-medium">כיוון</th>
                <th className="pb-2 font-medium">כניסה</th>
                <th className="pb-2 font-medium">יציאה</th>
                <th className="pb-2 font-medium">P&L</th>
                <th className="pb-2 pl-2 font-medium">שעה</th>
              </tr>
            </thead>
            <tbody className="text-[10px] md:text-xs">
              {recentTrades.map((t, i) => (
                <tr key={i} className="border-b border-border/10 last:border-0 interactive-row">
                  <td className="py-2.5 pr-2 font-semibold text-foreground">{t.pair}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${
                      t.dir === "Long" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                    }`}>
                      {t.dir === "Long" ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                      {t.dir}
                    </span>
                  </td>
                  <td className="text-muted-foreground font-mono">{t.entry}</td>
                  <td className="text-muted-foreground font-mono">{t.exit}</td>
                  <td className={`font-bold ${t.pnl > 0 ? "text-accent" : "text-destructive"}`}>
                    {t.pnl > 0 ? "+" : ""}{t.pnl}$
                  </td>
                  <td className="py-2.5 pl-2 text-muted-foreground">{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-primary/[0.04] border border-primary/10 px-3 py-2">
          <Zap className="h-3 w-3 text-primary" />
          <span className="text-[9px] md:text-[10px] text-muted-foreground">העסקאות מיובאות אוטומטית מחשבון הברוקר שלך</span>
        </div>
      </div>
    </div>
  );
};

/* ===== Sub Components ===== */

const TiltGauge = ({ value }: { value: number }) => {
  // Arc gauge: 0=calm(green), 50=anxious(yellow), 100=tilt(red)
  const angle = -90 + (value / 100) * 180;
  const getColor = () => {
    if (value < 35) return "hsl(var(--accent))";
    if (value < 65) return "hsl(45 90% 55%)";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="relative w-28 h-16 overflow-hidden">
      <svg viewBox="0 0 120 70" className="w-full h-full">
        {/* Background arc */}
        <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" strokeLinecap="round" />
        {/* Colored segments */}
        <path d="M 10 65 A 50 50 0 0 1 43 18" fill="none" stroke="hsl(var(--accent))" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
        <path d="M 43 18 A 50 50 0 0 1 77 18" fill="none" stroke="hsl(45 90% 55%)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
        <path d="M 77 18 A 50 50 0 0 1 110 65" fill="none" stroke="hsl(var(--destructive))" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
        {/* Needle */}
        <line
          x1="60" y1="65" x2="60" y2="20"
          stroke={getColor()}
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${angle}, 60, 65)`}
          style={{ transition: "all 1s ease-out" }}
        />
        <circle cx="60" cy="65" r="4" fill={getColor()} />
      </svg>
    </div>
  );
};

const GoalBar = ({ label, current, target, unit, color, exceeded }: {
  label: string; current: number; target: number; unit: string; color: string; exceeded?: boolean;
}) => {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-medium text-foreground">{label}</span>
        <span className="text-[9px] text-muted-foreground">
          {unit === "$" ? `$${current}` : `${current}${unit}`} / {unit === "$" ? `$${target}` : `${target}${unit}`}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div className={`h-2 rounded-full bg-${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      {exceeded && <p className="text-[9px] text-accent mt-1">🎯 עברת את היעד!</p>}
    </div>
  );
};

const NewsCountdown = () => {
  const [seconds, setSeconds] = useState(45 * 60 + 20);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center justify-center gap-2 my-3" dir="ltr">
      {[
        { val: pad(hrs), label: "שעות" },
        { val: pad(mins), label: "דקות" },
        { val: pad(secs), label: "שניות" },
      ].map((t, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 min-w-[44px] text-center">
            <span className="font-mono text-lg md:text-xl font-bold text-destructive">{t.val}</span>
          </div>
          <span className="text-[8px] text-muted-foreground mt-1">{t.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ===== Static Data ===== */

const chartData = Array.from({ length: 50 }, (_, i) => ({
  body: 12 + Math.sin(i * 0.3) * 15 + Math.random() * 20,
  wick: 3 + Math.random() * 12,
  lwick: 2 + Math.random() * 10,
  bull: Math.random() > (i > 30 ? 0.35 : 0.5),
}));

const watchlist = [
  { pair: "EUR/USD", price: "1.0847", chg: 0.12, tf: "M15" },
  { pair: "BTC/USDT", price: "67,234", chg: -1.3, tf: "H1" },
  { pair: "NQ", price: "18,432", chg: 0.45, tf: "M5" },
  { pair: "GBP/JPY", price: "192.34", chg: -0.28, tf: "M30" },
  { pair: "GOLD", price: "2,342", chg: 0.67, tf: "H4" },
];

const recentTrades = [
  { pair: "EUR/USD", dir: "Long", entry: "1.0832", exit: "1.0851", pnl: 342, time: "10:32" },
  { pair: "BTC/USDT", dir: "Short", entry: "67,890", exit: "67,801", pnl: 89, time: "11:15" },
  { pair: "NQ", dir: "Long", entry: "18,390", exit: "18,320", pnl: -210, time: "13:45" },
  { pair: "GBP/JPY", dir: "Short", entry: "192.80", exit: "192.52", pnl: 128, time: "14:20" },
  { pair: "EUR/USD", dir: "Long", entry: "1.0840", exit: "1.0898", pnl: 898, time: "15:45" },
];

export default HomeDashboard;
