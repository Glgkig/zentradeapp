import { useState, useMemo } from "react";
import {
  Plus, Bot, Crosshair, TrendingUp, Eye, X,
  CheckCircle2, Clock, BarChart3, Sparkles, Target,
  ChevronLeft, Zap, Shield, Edit3,
} from "lucide-react";

/* ===== Seeded random for stable chart generation ===== */
const sr = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

/* ===== Setup Data ===== */
const setups = [
  {
    id: 1,
    name: "פריצת בוקר — נאסד״ק",
    pair: "NQ / US100",
    dir: "לונג" as const,
    tf: "M5",
    winRate: 72,
    trades: 34,
    avgRR: "1:2.8",
    volatility: "גבוהה",
    rules: [
      "ווליום מעל הממוצע של 20 נרות",
      "סגירת נר מעל ההתנגדות",
      "וידוא שאין הודעות כלכליות ב-30 דק׳",
      "RSI מעל 50 אך מתחת ל-70",
      "EMA 9 חוצה מעל EMA 21",
    ],
    aiActive: true,
    aiInsight: "ה-AI מזהה שהסטאפ הזה עובד לך הכי טוב בימי שלישי ורביעי, בין 15:30-17:00. שים לב לנטייה שלך להיכנס מוקדם מדי בימי שישי — אחוז ההצלחה שלך יורד ל-41% ביום שישי.",
    bestDay: "שלישי",
    bestTime: "15:30-17:00",
  },
  {
    id: 2,
    name: "Pullback לונג — EUR/USD",
    pair: "EUR/USD",
    dir: "לונג" as const,
    tf: "M15",
    winRate: 65,
    trades: 21,
    avgRR: "1:2.1",
    volatility: "בינונית",
    rules: [
      "חזרה ל-0.618 פיבונאצ׳י",
      "MACD חיובי ומתחזק",
      "סשן לונדון בלבד (08:00-12:00)",
      "אין דיברג׳נס שלילי ב-RSI",
    ],
    aiActive: true,
    aiInsight: "ב-3 העסקאות האחרונות, הזזת את הסטופ-לוס לפני שהמחיר הגיע ליעד. זה עלה לך $340 ברווחים פוטנציאליים. עבוד על סבלנות ביציאה.",
    bestDay: "רביעי",
    bestTime: "09:00-11:30",
  },
  {
    id: 3,
    name: "Breakdown שורט — זהב",
    pair: "XAU/USD",
    dir: "שורט" as const,
    tf: "H1",
    winRate: 58,
    trades: 15,
    avgRR: "1:1.8",
    volatility: "גבוהה",
    rules: [
      "שבירת תמיכה עם נפח מוגבר x1.5",
      "דיברג׳נס ב-RSI",
      "ללא חדשות כלכליות ב-30 דק׳",
      "מגמה יומית דובית",
    ],
    aiActive: false,
    aiInsight: "הסטאפ הזה לא פעיל כרגע. מהנתונים שלך, ב-3 החודשים האחרונים אחוז ההצלחה ירד מ-68% ל-58%. שקול לבדוק מחדש את הפרמטרים.",
    bestDay: "חמישי",
    bestTime: "14:00-16:00",
  },
  {
    id: 4,
    name: "ביטקוין ריברסל",
    pair: "BTC/USD",
    dir: "לונג" as const,
    tf: "H4",
    winRate: 61,
    trades: 12,
    avgRR: "1:3.5",
    volatility: "גבוהה מאוד",
    rules: [
      "Pin Bar באזור ביקוש שבועי",
      "ווליום ספייק x2 מהממוצע",
      "מגמה שבועית שורית",
      "BTC Dominance יורד",
    ],
    aiActive: true,
    aiInsight: "סטאפ מצוין עם R:R גבוה. שים לב: כל 4 העסקאות המוצלחות שלך נפתחו אחרי 3 נרות אדומים רצופים. זה הדפוס שלך — תחכה לו.",
    bestDay: "שני",
    bestTime: "10:00-14:00",
  },
  {
    id: 5,
    name: "London Open Scalp",
    pair: "GBP/USD",
    dir: "לונג" as const,
    tf: "M1",
    winRate: 74,
    trades: 48,
    avgRR: "1:1.5",
    volatility: "בינונית",
    rules: [
      "פתיחת לונדון 08:00 UTC בדיוק",
      "Range Breakout של הנר הראשון",
      "Spread מתחת ל-1.5 pip",
      "ללא חפיפה עם חדשות",
    ],
    aiActive: true,
    aiInsight: "זה הסטאפ הכי עקבי שלך. שמור עליו. שים לב שביום שישי הביצועים שלך בסטאפ הזה נחותים — שקול לדלג על שישי.",
    bestDay: "שלישי",
    bestTime: "08:00-09:30",
  },
  {
    id: 6,
    name: "Fakeout Reversal — נאסד״ק",
    pair: "NQ / US100",
    dir: "שורט" as const,
    tf: "M15",
    winRate: 55,
    trades: 9,
    avgRR: "1:2.2",
    volatility: "גבוהה",
    rules: [
      "פריצת שווא מעל High של היום הקודם",
      "נר rejection עם פתיל ארוך",
      "ווליום יורד בפריצה",
      "חזרה מתחת לרמה תוך 3 נרות",
    ],
    aiActive: false,
    aiInsight: "סטאפ חדש עם מעט נתונים. המשך לצבור עסקאות לפני שה-AI יוכל לתת תובנות מהימנות. מינימום 20 עסקאות נדרשות.",
    bestDay: "—",
    bestTime: "—",
  },
];

/* ===== Mini Chart SVG ===== */
const SetupChart = ({ id, bull }: { id: number; bull: boolean }) => {
  const candles = useMemo(() => {
    const count = 40;
    const arr: { o: number; h: number; l: number; c: number }[] = [];
    let price = 50 + sr(id * 100) * 20;
    for (let i = 0; i < count; i++) {
      const trend = bull
        ? (i < 15 ? -0.08 : i < 30 ? 0.4 : 0.15)
        : (i < 15 ? 0.1 : i < 30 ? -0.35 : -0.1);
      const vol = 0.9 + sr(id * 1000 + i * 7) * 1.2;
      const change = (sr(id * 500 + i * 13) - 0.45 + trend * 0.3) * vol;
      const o = price;
      const c = price + change;
      const w = sr(id * 300 + i * 17) * 0.6;
      arr.push({ o, h: Math.max(o, c) + w, l: Math.min(o, c) - w, c });
      price = c;
    }
    return arr;
  }, [id, bull]);

  const allP = candles.flatMap(c => [c.h, c.l]);
  const minP = Math.min(...allP);
  const maxP = Math.max(...allP);
  const range = maxP - minP || 1;
  const toY = (p: number) => 90 - ((p - minP) / range) * 80;
  const cw = 96 / candles.length;

  return (
    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      {[25, 50, 75].map(y => (
        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(0,0%,10%)" strokeWidth="0.2" />
      ))}
      {candles.map((c, i) => {
        const x = 2 + i * cw;
        const cx = x + cw * 0.5;
        const isUp = c.c >= c.o;
        const color = isUp ? "hsl(160,60%,45%)" : "hsl(0,72%,51%)";
        const bt = toY(Math.max(c.o, c.c));
        const bh = Math.max(0.5, Math.abs(toY(c.o) - toY(c.c)));
        return (
          <g key={i}>
            <line x1={cx} y1={toY(c.h)} x2={cx} y2={toY(c.l)} stroke={color} strokeWidth="0.2" opacity="0.6" />
            <rect x={x + cw * 0.15} y={bt} width={cw * 0.7} height={bh} fill={color} opacity={0.8} rx="0.1" />
          </g>
        );
      })}
    </svg>
  );
};

/* ===== Large Detail Chart ===== */
const DetailChart = ({ id, bull }: { id: number; bull: boolean }) => {
  const candles = useMemo(() => {
    const count = 70;
    const arr: { o: number; h: number; l: number; c: number }[] = [];
    let price = 50 + sr(id * 200) * 20;
    for (let i = 0; i < count; i++) {
      const trend = bull
        ? (i < 25 ? -0.05 : i < 45 ? 0.45 : i < 60 ? 0.2 : -0.05)
        : (i < 25 ? 0.1 : i < 45 ? -0.4 : i < 60 ? -0.2 : 0.05);
      const vol = 0.7 + sr(id * 2000 + i * 11) * 1.3;
      const change = (sr(id * 800 + i * 17) - 0.45 + trend * 0.3) * vol;
      const o = price;
      const c = price + change;
      const w = sr(id * 600 + i * 23) * 0.7;
      arr.push({ o, h: Math.max(o, c) + w, l: Math.min(o, c) - w, c });
      price = c;
    }
    return arr;
  }, [id, bull]);

  const allP = candles.flatMap(c => [c.h, c.l]);
  const minP = Math.min(...allP);
  const maxP = Math.max(...allP);
  const range = maxP - minP || 1;
  const toY = (p: number) => 92 - ((p - minP) / range) * 80;
  const cw = 96 / candles.length;

  // EMA
  const ema = candles.reduce<number[]>((acc, c, i) => {
    if (i === 0) return [c.c];
    const k = 2 / 15;
    acc.push(c.c * k + acc[i - 1] * (1 - k));
    return acc;
  }, []);
  const emaPath = ema.map((p, i) => `${i === 0 ? "M" : "L"}${2 + (i / (candles.length - 1)) * 96},${toY(p)}`).join(" ");

  // Entry zone
  const entryIdx = 30 + Math.floor(sr(id * 77) * 8);
  const entryPrice = candles[entryIdx]?.c ?? 50;

  return (
    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      {[20, 40, 60, 80].map(y => (
        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(0,0%,8%)" strokeWidth="0.15" strokeDasharray="1,1.5" />
      ))}
      {[20, 40, 60, 80].map(x => (
        <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="hsl(0,0%,8%)" strokeWidth="0.15" strokeDasharray="1,1.5" />
      ))}

      <path d={emaPath} fill="none" stroke="hsl(45,100%,60%)" strokeWidth="0.3" opacity="0.35" />

      {candles.map((c, i) => {
        const x = 2 + i * cw;
        const cx = x + cw * 0.5;
        const isUp = c.c >= c.o;
        const color = isUp ? "hsl(160,60%,45%)" : "hsl(0,72%,51%)";
        const bt = toY(Math.max(c.o, c.c));
        const bh = Math.max(0.4, Math.abs(toY(c.o) - toY(c.c)));
        return (
          <g key={i}>
            <line x1={cx} y1={toY(c.h)} x2={cx} y2={toY(c.l)} stroke={color} strokeWidth="0.15" opacity="0.6" />
            <rect x={x + cw * 0.1} y={bt} width={cw * 0.8} height={bh} fill={color} opacity={0.85} rx="0.08" />
          </g>
        );
      })}

      {/* Entry zone */}
      <line x1={2 + entryIdx * cw} y1={toY(entryPrice)} x2="98" y2={toY(entryPrice)} stroke="hsl(217,72%,53%)" strokeWidth="0.2" strokeDasharray="1,0.8" opacity="0.5" />
      <circle cx={2 + entryIdx * cw + cw * 0.5} cy={toY(entryPrice)} r="1" fill="hsl(217,72%,53%)" opacity="0.8" />
      <text x={96} y={toY(entryPrice) - 1.5} fill="hsl(217,72%,53%)" fontSize="2.5" textAnchor="end" opacity="0.7">כניסה</text>
    </svg>
  );
};

/* ===== Page ===== */
const SetupsPage = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = setups.find(s => s.id === selectedId) || null;

  return (
    <div className="mx-auto max-w-[1280px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4 md:mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15">
              <Crosshair className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
                הסטאפים שלי
              </h1>
              <p className="text-[10px] md:text-[11px] text-muted-foreground/40 leading-relaxed">
                ה-Playbook האישי שלך · <span className="text-accent font-semibold">{setups.length} סטאפים</span> · <span className="text-primary font-semibold">{setups.filter(s => s.aiActive).length} במעקב AI</span>
              </p>
            </div>
          </div>
        </div>
        <button className="haptic-press group flex items-center gap-2 self-start rounded-xl bg-primary/10 border border-primary/20 px-5 py-2.5 text-[11px] font-bold text-primary hover:bg-primary/20 hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.12)] transition-all duration-300 min-h-[44px]">
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          סטאפ חדש
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {setups.map((s, index) => (
          <button
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            className="haptic-press group text-right rounded-2xl border border-border/10 bg-card/50 hover:bg-card/80 hover:border-primary/15 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.06)] transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
            style={{ animationDelay: `${index * 60}ms`, animationDuration: '400ms' }}
          >
            {/* Chart thumbnail */}
            <div className="relative h-32 md:h-36 bg-background overflow-hidden">
              <SetupChart id={s.id} bull={s.dir === "לונג"} />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
              
              {/* Top row: AI badge + Direction */}
              <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between">
                {s.aiActive ? (
                  <div className="flex items-center gap-1.5 rounded-lg bg-accent/10 border border-accent/15 px-2 py-1 backdrop-blur-sm">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent/60" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                    </span>
                    <span className="text-[8px] font-bold text-accent">AI פעיל</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 rounded-lg bg-muted/20 border border-border/10 px-2 py-1 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
                    <span className="text-[8px] font-medium text-muted-foreground/40">ידני</span>
                  </div>
                )}
                <span className={`rounded-lg border px-2 py-1 text-[8px] font-bold backdrop-blur-sm ${
                  s.dir === "לונג"
                    ? "text-accent bg-accent/10 border-accent/15"
                    : "text-destructive bg-destructive/10 border-destructive/15"
                }`}>
                  {s.dir === "לונג" ? "↑" : "↓"} {s.dir}
                </span>
              </div>

              {/* Bottom pair label */}
              <div className="absolute bottom-2.5 right-2.5">
                <span className="rounded-lg bg-background/80 backdrop-blur-md px-2.5 py-1 text-[9px] font-bold text-foreground/80 border border-border/15 ticker-text">
                  {s.pair} · {s.tf}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-4 pt-3.5 pb-4">
              <h3 className="text-[13px] font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">
                {s.name}
              </h3>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <div className="rounded-lg bg-accent/[0.04] border border-accent/8 py-1.5 text-center">
                  <p className="text-[12px] font-bold text-accent">{s.winRate}%</p>
                  <p className="text-[7px] text-muted-foreground/40 font-medium">Win Rate</p>
                </div>
                <div className="rounded-lg bg-primary/[0.04] border border-primary/8 py-1.5 text-center">
                  <p className="text-[12px] font-bold text-primary">{s.avgRR}</p>
                  <p className="text-[7px] text-muted-foreground/40 font-medium">R:R</p>
                </div>
                <div className="rounded-lg bg-muted/[0.06] border border-border/8 py-1.5 text-center">
                  <p className="text-[12px] font-bold text-foreground/70">{s.trades}</p>
                  <p className="text-[7px] text-muted-foreground/40 font-medium">עסקאות</p>
                </div>
              </div>

              {/* Volatility + View hint */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${
                    s.volatility === "גבוהה מאוד" ? "bg-destructive" :
                    s.volatility === "גבוהה" ? "bg-orange-400" : "bg-accent"
                  }`} />
                  <span className="text-[9px] text-muted-foreground/40 font-medium">תנודתיות {s.volatility}</span>
                </div>
                <span className="text-[8px] text-primary/40 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <Eye className="h-2.5 w-2.5" /> פרטים
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ══ Detail Drawer / Bottom Sheet ══ */}
      {selected && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setSelectedId(null)}
          />

          {/* Panel — side drawer on desktop, bottom sheet on mobile */}
          <div className="fixed z-50 animate-in duration-300
            inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl
            md:inset-y-0 md:left-0 md:right-auto md:w-[560px] md:max-h-none md:rounded-t-none md:rounded-l-3xl
            md:slide-in-from-left-full slide-in-from-bottom-full
            border-t md:border-t-0 md:border-l border-border/20
            bg-[hsl(222,47%,5%)] overflow-y-auto
          ">
            {/* Mobile handle */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/15" />
            </div>

            {/* Close */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-[hsl(222,47%,5%)]/90 backdrop-blur-md border-b border-border/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedId(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/15 border border-border/15 text-muted-foreground/50 hover:text-foreground transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
                <span className="text-[10px] text-muted-foreground/30 font-medium">פרטי סטאפ</span>
              </div>
              {selected.aiActive && (
                <div className="flex items-center gap-1.5 rounded-lg bg-accent/8 border border-accent/12 px-2.5 py-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent/50" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                  </span>
                  <span className="text-[9px] font-bold text-accent/80">מעקב AI אקטיבי</span>
                </div>
              )}
            </div>

            {/* Large Chart */}
            <div className="relative h-44 md:h-56 bg-[hsl(0,0%,2%)] mx-4 mt-4 rounded-2xl border border-border/10 overflow-hidden">
              <DetailChart id={selected.id} bull={selected.dir === "לונג"} />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(0,0%,2%)]/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="rounded-md bg-[hsl(0,0%,5%)]/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-foreground/80 border border-[hsl(0,0%,12%)]">{selected.pair}</span>
                <span className="rounded-md bg-yellow-400/10 px-1.5 py-0.5 text-[7px] font-bold text-yellow-400/60 border border-yellow-400/10">EMA 14</span>
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[8px] font-bold text-primary border border-primary/15">
                  {selected.tf} · {selected.dir}
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="px-5 pt-5 pb-3">
              <h2 className="font-heading text-lg md:text-xl font-extrabold text-foreground tracking-tight mb-1">
                {selected.name}
              </h2>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground/40 font-medium">
                <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {selected.winRate}% הצלחה</span>
                <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> {selected.trades} עסקאות</span>
                <span className="flex items-center gap-1"><Target className="h-3 w-3" /> R:R {selected.avgRR}</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 px-5 mb-4">
              {[
                { label: "יום מיטבי", value: selected.bestDay },
                { label: "שעה מיטבית", value: selected.bestTime },
                { label: "תנודתיות", value: selected.volatility },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-border/10 bg-muted/[0.04] p-2.5 text-center">
                  <p className="text-[8px] text-muted-foreground/30 font-medium mb-1">{s.label}</p>
                  <p className="text-[11px] font-bold text-foreground/80">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Rules */}
            <div className="px-5 mb-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Shield className="h-3.5 w-3.5 text-primary/50" />
                <h3 className="text-[11px] font-bold text-foreground/70">חוקי ברזל לכניסה</h3>
              </div>
              <div className="space-y-1.5">
                {selected.rules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-xl border border-border/10 bg-muted/[0.03] px-3.5 py-2.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-accent/8 border border-accent/10 mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-accent/60" />
                    </div>
                    <p className="text-[10px] md:text-[11px] text-muted-foreground/60 leading-relaxed font-medium">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="px-5 mb-5">
              <div className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary/50" />
                  <h3 className="text-[11px] font-bold text-foreground/70">תובנות AI</h3>
                </div>
                <p className="text-[10px] md:text-[11px] text-muted-foreground/60 leading-[1.9]">
                  {selected.aiInsight}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 px-5 py-4 border-t border-border/10 bg-[hsl(222,47%,5%)]/90 backdrop-blur-md flex items-center gap-2">
              <button className="interactive-btn flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/20 py-2.5 text-[11px] font-bold text-primary hover:bg-primary/15 hover:shadow-[0_0_12px_hsl(var(--primary)/0.1)] transition-all duration-300 min-h-[44px]">
                <Edit3 className="h-3.5 w-3.5" />
                ערוך סטאפ
              </button>
              <button
                onClick={() => setSelectedId(null)}
                className="interactive-btn flex-1 flex items-center justify-center gap-2 rounded-xl bg-muted/10 border border-border/15 py-2.5 text-[11px] font-bold text-muted-foreground/50 hover:text-foreground transition-all duration-300 min-h-[44px]"
              >
                סגור
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SetupsPage;
