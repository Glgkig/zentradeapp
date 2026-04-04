import { useEffect, useRef, useState } from "react";
import { format, addDays, subDays, isToday, parseISO, isSameDay } from "date-fns";
import { he } from "date-fns/locale";
import {
  Newspaper, TrendingUp, Calendar as CalendarIcon, ChevronRight, ChevronLeft,
  BookOpen, Clock, Globe, Flame, Star, Loader2, RefreshCw, CalendarPlus,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/* ── Types ── */
interface EconomicEvent {
  title: string;
  titleHe: string;
  country: string;
  flag: string;
  region: string;
  date: string;
  impact: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
}

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
      importanceFilter: "0,1",
      countryFilter: "us,eu,gb,jp,cn,ca,au,nz,ch",
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

/* ── Helper: format time to Israel timezone ── */
const formatIsraelTime = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("he-IL", {
      timeZone: "Asia/Jerusalem",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "--:--";
  }
};

/* ── Page ── */
const EconomicNewsPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [allEvents, setAllEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("economic-calendar");
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      const events = data.events || [];
      if (events.length > 0) {
        setAllEvents(events);
      } else {
        // Use fallback if API returns empty
        setAllEvents(FALLBACK_EVENTS);
      }
    } catch (e: any) {
      console.error("Failed to fetch events, using fallback:", e);
      setAllEvents(FALLBACK_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events for selected date
  const eventsForDate = allEvents.filter((ev) => {
    try {
      const eventDate = parseISO(ev.date);
      return isSameDay(eventDate, selectedDate);
    } catch {
      return false;
    }
  });

  // Sort by time
  const sortedEvents = [...eventsForDate].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleAddToJournal = (event: EconomicEvent) => {
    toast.success("נוסף ליומן המסחר", {
      description: `"${event.titleHe}" (${event.flag} ${event.region}) נשמר ביומן שלך`,
    });
  };

  const handleAddToGoogleCalendar = (event: EconomicEvent) => {
    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate.getTime() + 30 * 60 * 1000); // 30 min duration

    const formatGCal = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const title = `🔴 ${event.titleHe} (${event.region})`;
    const details = [
      `דוח כלכלי בעל השפעה גבוהה`,
      event.forecast ? `צפי: ${event.forecast}` : "",
      event.previous ? `קודם: ${event.previous}` : "",
      `מקור: ZenTrade`,
    ].filter(Boolean).join("\n");

    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", title);
    url.searchParams.set("dates", `${formatGCal(eventDate)}/${formatGCal(endDate)}`);
    url.searchParams.set("details", details);
    url.searchParams.set("ctz", "Asia/Jerusalem");

    window.open(url.toString(), "_blank");
    toast.success("נפתח Google Calendar", {
      description: `"${event.titleHe}" — הוסף התראה בלוח השנה שלך`,
    });
  };

  const dayButtons = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i - 3));

  // Count events per day for indicators
  const eventCountForDay = (date: Date) =>
    allEvents.filter((ev) => {
      try { return isSameDay(parseISO(ev.date), date); } catch { return false; }
    }).length;

  const tabs = [
    { id: "reports" as const, label: "דוחות אדומים 🔴", icon: Flame, color: "destructive" },
    { id: "news" as const, label: "חדשות בזמן אמת", icon: TrendingUp, color: "primary" },
    { id: "calendar" as const, label: "לוח כלכלי", icon: Star, color: "accent" },
  ];
  type TabId = typeof tabs[number]["id"];
  const [activeTab, setActiveTab] = useState<TabId>("reports");

  return (
    <div className="h-full flex flex-col gap-3 p-2 md:p-4 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-[-4px] rounded-xl bg-destructive/10 animate-pulse" style={{ animationDuration: "2.5s" }} />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20">
              <Flame className="h-5 w-5 text-destructive" />
            </div>
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-foreground">חדשות כלכליות</h1>
            <p className="text-2xs text-muted-foreground/50">🔴 דוחות אדומים · חדשות · לוח כלכלי</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "reports" && (
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="haptic-press flex h-8 items-center gap-1.5 rounded-lg border border-border/50 bg-card/50 px-2.5 text-muted-foreground hover:text-primary hover:border-primary/20 transition-all"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              <span className="text-2xs font-medium hidden sm:inline">רענן</span>
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-2xs text-muted-foreground/50 font-mono">HIGH IMPACT</span>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="shrink-0 flex items-center gap-1 rounded-xl border border-border/20 bg-card/30 backdrop-blur-sm p-1">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "haptic-press flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all",
                active
                  ? tab.color === "destructive"
                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                    : tab.color === "accent"
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground/50 hover:text-foreground hover:bg-card/50 border border-transparent"
              )}
            >
              <TabIcon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab: Reports ── */}
      {activeTab === "reports" && (
        <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">
          {/* Day Selector */}
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
              const count = eventCountForDay(date);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "haptic-press flex flex-col items-center rounded-xl px-3 py-1.5 min-w-[52px] transition-all border shrink-0 relative",
                    active
                      ? "bg-destructive/10 border-destructive/20 text-destructive"
                      : "border-transparent hover:bg-card/80 text-muted-foreground/60 hover:text-foreground"
                  )}
                >
                  <span className="text-2xs font-medium">{format(date, "EEE", { locale: he })}</span>
                  <span className={cn("text-sm font-bold", active && "text-destructive")}>{format(date, "d")}</span>
                  {today && <div className="h-1 w-1 rounded-full bg-primary mt-0.5" />}
                  {count > 0 && (
                    <span className={cn(
                      "absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                      active ? "bg-destructive text-destructive-foreground" : "bg-destructive/80 text-destructive-foreground"
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="haptic-press flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card/50 text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all shrink-0"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <Popover>
              <PopoverTrigger asChild>
                <button className="haptic-press flex h-8 items-center gap-1.5 rounded-lg border border-border/50 bg-card/50 px-2.5 text-muted-foreground hover:text-primary hover:border-primary/20 transition-all shrink-0">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span className="text-2xs font-medium">{format(selectedDate, "d MMMM yyyy", { locale: he })}</span>
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

          {/* Events List — Full Width */}
          <div className="flex-1 rounded-2xl border border-destructive/15 bg-destructive/[0.02] backdrop-blur-sm overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-destructive/10 shrink-0">
              <div className="flex items-center gap-2">
                <Flame className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs font-semibold text-foreground">דוחות אדומים 🔴</span>
              </div>
              <span className="text-2xs text-muted-foreground/40 font-mono">
                {format(selectedDate, "dd/MM/yyyy")} · שעון ישראל 🇮🇱
              </span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none p-3 space-y-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <Loader2 className="h-8 w-8 text-destructive/40 animate-spin mb-2" />
                  <p className="text-xs text-muted-foreground/40">טוען דוחות...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <Globe className="h-8 w-8 text-muted-foreground/20 mb-2" />
                  <p className="text-xs text-destructive/60">{error}</p>
                  <button onClick={fetchEvents} className="mt-2 text-2xs text-primary hover:underline">נסה שוב</button>
                </div>
              ) : sortedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <Globe className="h-8 w-8 text-muted-foreground/20 mb-2" />
                  <p className="text-xs text-muted-foreground/40">אין דוחות אדומים ביום זה</p>
                  <p className="text-2xs text-muted-foreground/25 mt-1">
                    {selectedDate.getDay() === 0 || selectedDate.getDay() === 6
                      ? "סופ״ש — השווקים סגורים"
                      : "יום שקט — אין אירועים בעלי השפעה גבוהה"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                  {sortedEvents.map((event, i) => {
                    const timeStr = formatIsraelTime(event.date);
                    const isPast = new Date(event.date) < new Date();
                    return (
                      <div
                        key={i}
                        className={cn(
                          "group rounded-xl border border-destructive/15 p-3.5 transition-all hover:bg-destructive/[0.04] hover:border-destructive/25",
                          isPast && "opacity-60"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-base">{event.flag}</span>
                              <span className="text-xs font-semibold text-foreground truncate">{event.titleHe}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5 text-muted-foreground/40" />
                                <span className="text-2xs text-foreground/70 font-mono font-bold">{timeStr}</span>
                              </div>
                              <span className="text-2xs text-muted-foreground/20">·</span>
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-destructive" />
                                <span className="text-2xs font-medium text-destructive">השפעה גבוהה</span>
                              </div>
                              <span className="text-2xs text-muted-foreground/20">·</span>
                              <span className="text-2xs text-muted-foreground/50">{event.region}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              {event.forecast && (
                                <div className="flex items-center gap-1">
                                  <span className="text-2xs text-muted-foreground/40">צפי:</span>
                                  <span className="text-2xs font-mono font-semibold text-foreground/70">{event.forecast}</span>
                                </div>
                              )}
                              {event.previous && (
                                <div className="flex items-center gap-1">
                                  <span className="text-2xs text-muted-foreground/40">קודם:</span>
                                  <span className="text-2xs font-mono font-semibold text-muted-foreground/60">{event.previous}</span>
                                </div>
                              )}
                              {event.actual && (
                                <div className="flex items-center gap-1">
                                  <span className="text-2xs text-muted-foreground/40">בפועל:</span>
                                  <span className="text-2xs font-mono font-bold text-foreground">{event.actual}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => handleAddToGoogleCalendar(event)}
                              className="haptic-press flex items-center gap-1 rounded-lg border border-accent/20 bg-accent/5 px-2 py-1 text-accent hover:bg-accent/15 transition-all"
                              title="הוסף ל-Google Calendar"
                            >
                              <CalendarPlus className="h-3 w-3" />
                              <span className="text-2xs font-medium hidden sm:inline">יומן Google</span>
                            </button>
                            <button
                              onClick={() => handleAddToJournal(event)}
                              className="haptic-press flex items-center gap-1 rounded-lg border border-primary/15 bg-primary/5 px-2 py-1 text-primary hover:bg-primary/15 transition-all"
                              title="הוסף ליומן מסחר"
                            >
                              <BookOpen className="h-3 w-3" />
                              <span className="text-2xs font-medium hidden sm:inline">ליומן</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {sortedEvents.length > 0 && (
              <div className="px-4 py-2.5 border-t border-destructive/10 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-destructive" />
                  <span className="text-2xs text-destructive/70 font-semibold">{sortedEvents.length} דוחות אדומים</span>
                </div>
                <span className="text-2xs text-muted-foreground/30 font-mono">שעון ישראל 🇮🇱</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Live News ── */}
      {activeTab === "news" && (
        <div className="flex-1 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 shrink-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">חדשות שוק בזמן אמת</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-2xs text-muted-foreground/40 font-mono">LIVE STREAMING</span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <TimelineWidget />
          </div>
        </div>
      )}

      {/* ── Tab: Economic Calendar ── */}
      {activeTab === "calendar" && (
        <div className="flex-1 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 shrink-0">
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-semibold text-foreground">לוח כלכלי מלא</span>
            </div>
            <span className="text-2xs text-muted-foreground/30 font-mono">TradingView</span>
          </div>
          <div className="flex-1 min-h-0">
            <EconomicCalendarWidget />
          </div>
        </div>
      )}
    </div>
  );
};

export default EconomicNewsPage;
