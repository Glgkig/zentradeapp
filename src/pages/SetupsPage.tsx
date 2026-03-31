import { useState } from "react";
import {
  Plus, CheckSquare, Square, Bot, Crosshair, TrendingUp,
  BarChart3, Eye, Zap, ChevronLeft,
} from "lucide-react";

const setups = [
  {
    id: 1,
    name: "פריצת בוקר נאסד\"ק",
    pair: "NQ / US100",
    tf: "M5",
    winRate: 72,
    trades: 34,
    rules: ["נר אישור עם ווליום גבוה", "תמיכה חזקה ב-EMA 21", "RSI מתחת ל-30"],
    aiActive: true,
  },
  {
    id: 2,
    name: "Pullback לונג EUR/USD",
    pair: "EUR/USD",
    tf: "M15",
    winRate: 65,
    trades: 21,
    rules: ["חזרה ל-0.618 פיבונאצ'י", "MACD חיובי", "סשן לונדון בלבד"],
    aiActive: true,
  },
  {
    id: 3,
    name: "Breakdown שורט זהב",
    pair: "XAU/USD",
    tf: "H1",
    winRate: 58,
    trades: 15,
    rules: ["שבירת תמיכה עם נפח", "דיברג'נס ב-RSI", "ללא חדשות ב-30 דק׳"],
    aiActive: false,
  },
  {
    id: 4,
    name: "ביטקוין ריברסל",
    pair: "BTC/USD",
    tf: "H4",
    winRate: 61,
    trades: 12,
    rules: ["Pin Bar באזור ביקוש", "ווליום ספייק x2", "מגמה שבועית שורית"],
    aiActive: true,
  },
];

const SetupsPage = () => {
  return (
    <div className="mx-auto max-w-[1280px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-foreground">הסטאפים שלי (Playbook)</h1>
          <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
            נהל את אסטרטגיות המסחר שלך. ה-AI ינטר סטאפים פעילים בזמן אמת.
          </p>
        </div>
        <button className="flex items-center gap-1.5 self-start rounded-lg bg-primary px-3.5 py-2 text-[11px] md:text-xs font-semibold text-primary-foreground shadow-[0_0_15px_hsl(217_72%_53%/0.15)] hover:shadow-[0_0_25px_hsl(217_72%_53%/0.25)] transition-all">
          <Plus className="h-3.5 w-3.5" />
          הוסף סטאפ חדש
        </button>
      </div>

      {/* Setups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {setups.map((s) => (
          <div
            key={s.id}
            className="group rounded-xl border border-border bg-secondary/30 hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-200"
          >
            {/* Chart Thumbnail */}
            <div className="relative h-24 md:h-28 overflow-hidden rounded-t-xl bg-muted/20 border-b border-border/40">
              <MiniChart bull={s.winRate > 60} />
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <span className="rounded bg-background/80 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-bold text-foreground border border-border/30">{s.pair}</span>
                <span className="rounded bg-background/80 backdrop-blur-sm px-1.5 py-0.5 text-[8px] text-muted-foreground border border-border/30">{s.tf}</span>
              </div>
              {s.aiActive && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-primary/20 backdrop-blur-sm px-1.5 py-0.5 border border-primary/25">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <span className="text-[8px] font-semibold text-primary">AI מנטר</span>
                </div>
              )}
            </div>

            {/* Card Body */}
            <div className="p-3">
              <h3 className="text-[11px] md:text-xs font-bold text-foreground mb-2 truncate">{s.name}</h3>

              {/* Quick Stats */}
              <div className="flex items-center gap-3 mb-2.5">
                <span className="text-[9px] text-accent font-semibold">{s.winRate}% Win</span>
                <span className="text-[9px] text-muted-foreground">{s.trades} עסקאות</span>
              </div>

              {/* Rules Checklist */}
              <div className="space-y-1">
                {s.rules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <CheckSquare className="h-3 w-3 text-accent/60 shrink-0 mt-0.5" />
                    <span className="text-[9px] text-muted-foreground leading-snug">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/5 hover:border-primary/30 hover:bg-primary/[0.02] transition-all min-h-[200px] group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:shadow-[0_0_15px_hsl(217_72%_53%/0.15)] transition-all">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors">הוסף סטאפ חדש</span>
        </button>
      </div>
    </div>
  );
};

/* Mini chart component for thumbnails */
const MiniChart = ({ bull }: { bull: boolean }) => {
  const bars = Array.from({ length: 30 }, (_, i) => ({
    h: 15 + Math.random() * 55,
    up: bull ? Math.random() > 0.35 : Math.random() > 0.55,
  }));

  return (
    <div className="flex items-end gap-[1.5px] h-full px-3 pb-2 pt-4">
      {bars.map((b, i) => (
        <div
          key={i}
          className={`flex-1 rounded-[0.5px] ${b.up ? "bg-accent/40" : "bg-destructive/30"}`}
          style={{ height: `${b.h}%` }}
        />
      ))}
    </div>
  );
};

export default SetupsPage;
