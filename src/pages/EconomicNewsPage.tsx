import { useEffect, useRef, useState } from "react";
import { format, addDays, subDays, isToday } from "date-fns";
import { he } from "date-fns/locale";
import {
  Newspaper, TrendingUp, Calendar as CalendarIcon, ChevronRight, ChevronLeft,
  BookOpen, Clock, Globe, Flame, AlertTriangle, Zap, Star,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ── TradingView Timeline Widget ── */
const TimelineWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      feedMode: "all_symbols",
      isTransparent: true,
      displayMode: "regular",
      width: "100%",
      height: "100%",
      colorTheme: "dark",
      locale: "he_IL",
    });

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container";
    wrapper.style.height = "100%";
    wrapper.style.width = "100%";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";

    wrapper.appendChild(widgetDiv);
    wrapper.appendChild(script);
    containerRef.current.appendChild(wrapper);
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
};

/* ── TradingView Economic Calendar Widget ── */
const EconomicCalendarWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      isTransparent: true,
      width: "100%",
      height: "100%",
      locale: "he_IL",
      importanceFilter: "-1,0,1",
      countryFilter: "us,eu,gb,jp,cn,il",
    });

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container";
    wrapper.style.height = "100%";
    wrapper.style.width = "100%";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";

    wrapper.appendChild(widgetDiv);
    wrapper.appendChild(script);
    containerRef.current.appendChild(wrapper);
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
};

/* ── Mock events for selected date ── */
const generateEventsForDate = (date: Date) => {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return []; // weekends

  const events = [
    { time: "09:30", title: "פתיחת שוק ארה״ב", impact: "high" as const, country: "🇺🇸", category: "שוק" },
    { time: "10:00", title: "מדד אמון צרכנים", impact: "high" as const, country: "🇺🇸", category: "מאקרו" },
    { time: "14:00", title: "דו״ח תעסוקה שבועי", impact: "medium" as const, country: "🇺🇸", category: "תעסוקה" },
    { time: "15:30", title: "מלאי נפט גולמי", impact: "medium" as const, country: "🇺🇸", category: "סחורות" },
    { time: "16:00", title: "הצהרת בנק ישראל", impact: "high" as const, country: "🇮🇱", category: "ריבית" },
    { time: "17:00", title: "מדד PMI ייצור", impact: "low" as const, country: "🇪🇺", category: "מאקרו" },
    { time: "20:00", title: "פרוטוקול ישיבת הפד", impact: "high" as const, country: "🇺🇸", category: "ריבית" },
  ];

  // Vary events based on date
  const seed = date.getDate() % 5;
  return events.slice(seed, seed + 4 + (date.getDate() % 3));
};

const impactConfig = {
  high: { label: "גבוה", color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", icon: Flame },
  medium: { label: "בינוני", color: "text-accent", bg: "bg-accent/10 border-accent/20", icon: AlertTriangle },
  low: { label: "נמוך", color: "text-muted-foreground", bg: "bg-muted/30 border-border", icon: Zap },
};

/* ── Page ── */
const EconomicNewsPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const events = generateEventsForDate(selectedDate);

  const handleAddToJournal = (eventTitle: string) => {
    toast.success("נוסף ליומן המסחר", {
      description: `"${eventTitle}" נשמר ביומן הפורנזי שלך`,
    });
  };

  const dayButtons = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i - 3);
    return date;
  });

  return (
    <div className="h-full flex flex-col gap-3 p-2 md:p-4 overflow-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-[-4px] rounded-xl bg-primary/8 animate-pulse" style={{ animationDuration: "2.5s" }} />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
              <Newspaper className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-foreground">חדשות כלכליות</h1>
            <p className="text-2xs text-muted-foreground/50">עדכונים בזמן אמת · לוח אירועים · ניתוח שוק</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-2xs text-muted-foreground/50 font-mono">LIVE</span>
        </div>
      </div>

      {/* ── Day Selector Bar ── */}
      <div className="shrink-0 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          className="haptic-press flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card/50 text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all shrink-0"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {dayButtons.map((date, i) => {
          const active = format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
          const today = isToday(date);
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={cn(
                "haptic-press flex flex-col items-center rounded-xl px-3 py-1.5 min-w-[52px] transition-all border shrink-0",
                active
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "border-transparent hover:bg-card/80 text-muted-foreground/60 hover:text-foreground"
              )}
            >
              <span className="text-2xs font-medium">{format(date, "EEE", { locale: he })}</span>
              <span className={cn("text-sm font-bold", active && "text-primary")}>{format(date, "d")}</span>
              {today && <div className="h-1 w-1 rounded-full bg-primary mt-0.5" />}
            </button>
          );
        })}

        <button
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          className="haptic-press flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card/50 text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all shrink-0"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* Calendar Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="haptic-press flex h-8 items-center gap-1.5 rounded-lg border border-border/50 bg-card/50 px-2.5 text-muted-foreground hover:text-primary hover:border-primary/20 transition-all shrink-0">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span className="text-2xs font-medium">{format(selectedDate, "d MMMM", { locale: he })}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* ── Main Grid ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">

        {/* ── Left: Events for Selected Day ── */}
        <div className="lg:col-span-4 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden flex flex-col min-h-[300px] lg:min-h-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 shrink-0">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-semibold text-foreground">אירועים כלכליים</span>
            </div>
            <span className="text-2xs text-muted-foreground/40 font-mono">
              {format(selectedDate, "dd/MM/yyyy")}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-none p-2 space-y-1.5">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Globe className="h-8 w-8 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground/40">אין אירועים ביום זה</p>
                <p className="text-2xs text-muted-foreground/25 mt-1">סופ״ש — השווקים סגורים</p>
              </div>
            ) : (
              events.map((event, i) => {
                const impact = impactConfig[event.impact];
                const ImpactIcon = impact.icon;
                return (
                  <div
                    key={i}
                    className={cn(
                      "group rounded-xl border p-3 transition-all hover:bg-card/80",
                      impact.bg
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{event.country}</span>
                          <span className="text-xs font-semibold text-foreground truncate">{event.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5 text-muted-foreground/40" />
                            <span className="text-2xs text-muted-foreground/50 font-mono">{event.time}</span>
                          </div>
                          <span className="text-2xs text-muted-foreground/30">·</span>
                          <div className="flex items-center gap-1">
                            <ImpactIcon className={cn("h-2.5 w-2.5", impact.color)} />
                            <span className={cn("text-2xs font-medium", impact.color)}>
                              השפעה {impact.label}
                            </span>
                          </div>
                          <span className="text-2xs text-muted-foreground/30">·</span>
                          <span className="text-2xs text-muted-foreground/40">{event.category}</span>
                        </div>
                      </div>

                      {/* Add to Journal */}
                      <button
                        onClick={() => handleAddToJournal(event.title)}
                        className="haptic-press opacity-0 group-hover:opacity-100 flex items-center gap-1 rounded-lg border border-primary/15 bg-primary/5 px-2 py-1 text-primary hover:bg-primary/15 transition-all shrink-0"
                        title="הוסף ליומן"
                      >
                        <BookOpen className="h-3 w-3" />
                        <span className="text-2xs font-medium hidden sm:inline">ליומן</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Summary footer */}
          {events.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border/20 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-destructive" />
                  <span className="text-2xs text-muted-foreground/50">
                    {events.filter(e => e.impact === "high").length} גבוה
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-accent" />
                  <span className="text-2xs text-muted-foreground/50">
                    {events.filter(e => e.impact === "medium").length} בינוני
                  </span>
                </div>
              </div>
              <span className="text-2xs text-muted-foreground/30">{events.length} אירועים</span>
            </div>
          )}
        </div>

        {/* ── Center: Live News ── */}
        <div className="lg:col-span-5 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden flex flex-col min-h-[400px] lg:min-h-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 shrink-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">חדשות שוק בזמן אמת</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-2xs text-muted-foreground/40 font-mono">LIVE</span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <TimelineWidget />
          </div>
        </div>

        {/* ── Right: Economic Calendar Widget ── */}
        <div className="lg:col-span-3 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden flex flex-col min-h-[400px] lg:min-h-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 shrink-0">
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-semibold text-foreground">לוח כלכלי</span>
            </div>
            <span className="text-2xs text-muted-foreground/30 font-mono">TradingView</span>
          </div>
          <div className="flex-1 min-h-0">
            <EconomicCalendarWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomicNewsPage;
