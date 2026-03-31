import {
  Bot, Shield, TrendingUp, Activity, AlertTriangle, CheckCircle2,
  BarChart3, Target, Eye, ArrowUpRight, ArrowDownRight, Clock,
  Newspaper, ChevronLeft, Zap,
} from "lucide-react";

const HomeDashboard = ({ userName }: { userName: string }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : "ערב טוב";

  return (
    <div className="mx-auto max-w-6xl space-y-4 md:space-y-5">

      {/* ===== AI Greeting Card ===== */}
      <div className="rounded-2xl border border-primary/15 bg-gradient-to-l from-primary/[0.04] to-transparent p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="font-heading text-lg md:text-xl font-bold text-foreground">
                {greeting}, <span className="text-primary">{userName}</span>!
              </h2>
              <span className="flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-[10px] font-medium text-accent">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                שומר הראש: פעיל
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              היום אנחנו מתמקדים במסחר ממושמע. אני מחובר לבורסה ומודד את רמת המתח שלך בכל רגע.
              תזכור: <span className="text-primary font-medium">&ldquo;לא לקחת עסקה זה גם חלק מהמסחר.&rdquo;</span>
            </p>
          </div>
        </div>
      </div>

      {/* ===== Mission Control Row ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {/* P&L */}
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="P&L יומי"
          value="+$1,247"
          sub="+8.3% מההון"
          positive
        />
        {/* Risk Shield */}
        <div className="rounded-2xl border border-border bg-secondary/30 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground">הגנה יומית</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-heading text-lg md:text-xl font-bold text-foreground">$150</span>
            <span className="text-[10px] text-muted-foreground">/ $500</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-accent transition-all" style={{ width: "30%" }} />
          </div>
          <p className="text-[9px] md:text-[10px] text-accent mt-2 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            30% — בטווח בטוח
          </p>
        </div>
        {/* Stress Meter */}
        <div className="rounded-2xl border border-border bg-secondary/30 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground">מד מתח פסיכולוגי</span>
          </div>
          <div className="flex items-center gap-4">
            <StressMeter value={32} />
            <div>
              <p className="text-sm font-semibold text-accent">נמוך</p>
              <p className="text-[10px] text-muted-foreground">מצב מנטלי יציב ✓</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Chart + AI Vision ===== */}
      <div className="rounded-2xl border border-border bg-secondary/30 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 md:px-5">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-xs md:text-sm font-semibold text-foreground">EUR/USD — M15</span>
            <span className="text-[10px] text-accent font-medium">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">1.0847</span>
            <span className="text-[10px] text-accent flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" />+0.12%
            </span>
          </div>
        </div>

        <div className="relative p-4 md:p-5">
          {/* Mock Chart */}
          <div className="flex items-end gap-[3px] h-40 md:h-56">
            {chartData.map((c, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-[1px]">
                <div className="w-px bg-muted-foreground/20" style={{ height: `${c.wick}%` }} />
                <div className={`w-full rounded-sm ${c.bull ? "bg-accent/70" : "bg-destructive/60"}`} style={{ height: `${c.body}%` }} />
                <div className="w-px bg-muted-foreground/20" style={{ height: `${c.lwick}%` }} />
              </div>
            ))}
          </div>

          {/* AI Annotations */}
          <div className="absolute top-8 right-[15%] md:right-[20%]">
            <div className="rounded-lg border border-accent/30 bg-accent/10 backdrop-blur-sm px-2.5 py-1.5 text-[9px] md:text-[10px] text-accent font-medium shadow-sm">
              ✅ זיהוי בולען (Engulfing) — אישור setup לונג
            </div>
          </div>
          <div className="absolute top-20 md:top-28 left-[10%] md:left-[25%]">
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 backdrop-blur-sm px-2.5 py-1.5 text-[9px] md:text-[10px] text-destructive font-medium shadow-sm">
              ⚠️ פריצת שווא (Fakeout) — הימנע מכניסה
            </div>
          </div>
          <div className="absolute bottom-8 left-[5%] md:left-[15%]">
            <div className="rounded-lg border border-primary/30 bg-primary/10 backdrop-blur-sm px-2.5 py-1.5 text-[9px] md:text-[10px] text-primary font-medium shadow-sm flex items-center gap-1">
              <Newspaper className="h-3 w-3" />
              15 דקות להודעת ריבית (CPI) — אל תסחור
            </div>
          </div>
        </div>
      </div>

      {/* ===== Watchlist + Goals Row ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Watchlist */}
        <div className="rounded-2xl border border-border bg-secondary/30 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-xs md:text-sm font-semibold text-foreground">רשימת מעקב</span>
          </div>
          <div className="space-y-2">
            {watchlist.map((item) => (
              <div key={item.pair} className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{item.pair}</span>
                  <span className="text-[9px] text-muted-foreground">{item.timeframe}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground">{item.price}</span>
                  <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${item.change > 0 ? "text-accent" : "text-destructive"}`}>
                    {item.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {item.change > 0 ? "+" : ""}{item.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="rounded-2xl border border-border bg-secondary/30 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs md:text-sm font-semibold text-foreground">יעדים להיום</span>
          </div>
          <div className="space-y-4">
            <GoalProgress label="יעד רווח יומי" current={1247} target={2000} unit="$" color="accent" />
            <GoalProgress label="עסקאות שבוצעו" current={5} target={10} unit="" color="primary" />
            <GoalProgress label="Win Rate להיום" current={71} target={65} unit="%" color="accent" exceeded />
          </div>
        </div>
      </div>

      {/* ===== Recent Activity Feed ===== */}
      <div className="rounded-2xl border border-border bg-secondary/30 p-4 md:p-5">
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
              <tr className="border-b border-border text-[10px] md:text-xs text-muted-foreground">
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
                <tr key={i} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 pr-2 font-semibold text-foreground">{t.pair}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${
                      t.direction === "Long" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                    }`}>
                      {t.direction === "Long" ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                      {t.direction}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{t.entry}</td>
                  <td className="text-muted-foreground">{t.exit}</td>
                  <td className={`font-semibold ${t.pnl > 0 ? "text-accent" : "text-destructive"}`}>
                    {t.pnl > 0 ? "+" : ""}{t.pnl}$
                  </td>
                  <td className="py-2.5 pl-2 text-muted-foreground">{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Auto-import badge */}
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
          <Zap className="h-3 w-3 text-primary" />
          <span className="text-[9px] md:text-[10px] text-muted-foreground">העסקאות מיובאות אוטומטית מחשבון הברוקר שלך</span>
        </div>
      </div>
    </div>
  );
};

/* ===== Sub Components ===== */

const MetricCard = ({ icon, label, value, sub, positive }: {
  icon: React.ReactNode; label: string; value: string; sub: string; positive?: boolean;
}) => (
  <div className="rounded-2xl border border-border bg-secondary/30 p-4 md:p-5">
    <div className="flex items-center gap-2 mb-3">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${positive ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
        {icon}
      </div>
      <span className="text-[10px] md:text-xs font-medium text-muted-foreground">{label}</span>
    </div>
    <p className={`font-heading text-2xl md:text-3xl font-bold ${positive ? "text-accent" : "text-destructive"}`}>{value}</p>
    <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
  </div>
);

const GoalProgress = ({ label, current, target, unit, color, exceeded }: {
  label: string; current: number; target: number; unit: string; color: string; exceeded?: boolean;
}) => {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] md:text-xs font-medium text-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground">
          {unit}{current} / {unit}{target}
          {exceeded && <span className="text-accent mr-1">🎯 עברת את היעד!</span>}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div className={`h-2 rounded-full bg-${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const StressMeter = ({ value }: { value: number }) => {
  const circumference = 97.4;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative h-14 w-14">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--accent))" strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-accent">{value}%</span>
    </div>
  );
};

/* ===== Static Data ===== */

const chartData = Array.from({ length: 40 }, (_, i) => ({
  body: 15 + Math.random() * 35,
  wick: 5 + Math.random() * 15,
  lwick: 3 + Math.random() * 12,
  bull: Math.random() > (i > 25 ? 0.35 : 0.5),
}));

const watchlist = [
  { pair: "EUR/USD", price: "1.0847", change: 0.12, timeframe: "M15" },
  { pair: "BTC/USDT", price: "67,234", change: -1.3, timeframe: "H1" },
  { pair: "NQ (Nasdaq)", price: "18,432", change: 0.45, timeframe: "M5" },
  { pair: "GBP/JPY", price: "192.34", change: -0.28, timeframe: "M30" },
  { pair: "AAPL", price: "$198.52", change: 1.2, timeframe: "D1" },
];

const recentTrades = [
  { pair: "EUR/USD", direction: "Long", entry: "1.0832", exit: "1.0851", pnl: 342, time: "10:32" },
  { pair: "BTC/USDT", direction: "Short", entry: "67,890", exit: "67,801", pnl: 89, time: "11:15" },
  { pair: "NQ", direction: "Long", entry: "18,390", exit: "18,320", pnl: -210, time: "13:45" },
  { pair: "GBP/JPY", direction: "Short", entry: "192.80", exit: "192.52", pnl: 128, time: "14:20" },
  { pair: "EUR/USD", direction: "Long", entry: "1.0840", exit: "1.0898", pnl: 898, time: "15:45" },
];

export default HomeDashboard;
