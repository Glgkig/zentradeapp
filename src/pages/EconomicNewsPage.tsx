import { useEffect, useRef, useState } from "react";
import { format, addDays, subDays, isToday, parseISO, isSameDay } from "date-fns";
import { he } from "date-fns/locale";
import {
  Newspaper, TrendingUp, Calendar as CalendarIcon, ChevronRight, ChevronLeft,
  BookOpen, Clock, Globe, Flame, Star, Loader2, RefreshCw, CalendarPlus, AlertTriangle,
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

/* ── Fallback mock data ── */
const today = new Date();
const todayStr = today.toISOString().split("T")[0];
const FALLBACK_EVENTS: EconomicEvent[] = [
  { title: "CPI m/m", titleHe: "מדד מחירים לצרכן (חודשי)", country: "USD", flag: "🇺🇸", region: "ארה״ב", date: `${todayStr}T10:30:00Z`, impact: "high", forecast: "0.3%", previous: "0.4%", actual: null },
  { title: "Unemployment Claims", titleHe: "תביעות אבטלה שבועיות", country: "USD", flag: "🇺🇸", region: "ארה״ב", date: `${todayStr}T12:30:00Z`, impact: "high", forecast: "212K", previous: "210K", actual: null },
  { title: "Main Refinancing Rate", titleHe: "ריבית ECB", country: "EUR", flag: "🇪🇺", region: "אירופה", date: `${todayStr}T11:45:00Z`, impact: "high", forecast: "4.50%", previous: "4.50%", actual: null },
  { title: "GDP q/q", titleHe: "תוצר מקומי גולמי (רבעוני)", country: "GBP", flag: "🇬🇧", region: "בריטניה", date: `${todayStr}T06:00:00Z`, impact: "medium", forecast: "0.2%", previous: "0.1%", actual: null },
  { title: "Retail Sales m/m", titleHe: "מכירות קמעונאיות (חודשי)", country: "USD", flag: "🇺🇸", region: "ארה״ב", date: `${todayStr}T12:30:00Z`, impact: "medium", forecast: "0.5%", previous: "0.6%", actual: null },
  { title: "BOJ Policy Rate", titleHe: "ריבית בנק יפן", country: "JPY", flag: "🇯🇵", region: "יפן", date: `${todayStr}T03:00:00Z`, impact: "high", forecast: "0.25%", previous: "0.25%", actual: null },
];

/* ── Event Card Component ── */
const EventCard = ({ event, onAddToCalendar, onAddToJournal }: { event: EconomicEvent; onAddToCalendar: (e: EconomicEvent) => void; onAddToJournal: (e: EconomicEvent) => void }) => {
  const timeStr = formatIsraelTime(event.date);
  const isPast = new Date(event.date) < new Date();

  return (
    <div
      className={cn(
        "group rounded-xl border p-3.5 transition-all",
        event.impact === "high"
          ? "border-destructive/20 hover:bg-destructive/[0.04] hover:border-destructive/30"
          : event.impact === "medium"
            ? "border-orange-400/20 hover:bg-orange-400/[0.04] hover:border-orange-400/30"
            : "border-border/20 hover:bg-card/50 hover:border-border/30",
        isPast && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">{event.flag}</span>
            <span className="text-xs font-semibold text-foreground truncate">{event.titleHe}</span>
            {/* Impact Badge */}
            <span className={cn(
              "shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border",
              event.impact === "high"
                ? "bg-destructive/10 text-destructive border-destructive/30 shadow-[0_0_8px_hsl(var(--destructive)/0.3)]"
                : event.impact === "medium"
                  ? "bg-orange-400/10 text-orange-400 border-orange-400/30"
                  : "bg-muted/50 text-muted-foreground border-border/30"
            )}>
              {event.impact === "high" ? "🔴 HIGH" : event.impact === "medium" ? "🟠 MED" : "⚪ LOW"}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5 text-muted-foreground/40" />
              <span className="text-2xs text-foreground/70 font-mono font-bold">{timeStr}</span>
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
            onClick={() => onAddToCalendar(event)}
            className="haptic-press flex items-center gap-1 rounded-lg border border-accent/20 bg-accent/5 px-2 py-1 text-accent hover:bg-accent/15 transition-all"
            title="הוסף ל-Google Calendar"
          >
            <CalendarPlus className="h-3 w-3" />
            <span className="text-2xs font-medium hidden sm:inline">יומן</span>
          </button>
          <button
            onClick={() => onAddToJournal(event)}
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
};

/* ── Page ── */
const EconomicNewsPage = () => {
  const [allEvents, setAllEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setSyncing(false);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("economic-calendar");
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      const events = data.events || [];
      if (events.length > 0) {
        setAllEvents(events);
      } else {
        setAllEvents(FALLBACK_EVENTS);
      }
    } catch (e: any) {
      console.error("Failed to fetch events, using fallback:", e);
      setSyncing(true);
      setAllEvents(FALLBACK_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const now = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(now);

  // Build 21-day range (-3 … +17)
  const dateRange = Array.from({ length: 21 }, (_, i) => addDays(now, i - 3));

  // Events for selected date
  const selectedEvents = allEvents
    .filter((ev) => { try { return isSameDay(parseISO(ev.date), selectedDate); } catch { return false; } })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Count events per day for dots
  const eventsPerDay = (d: Date) => allEvents.filter((ev) => { try { return isSameDay(parseISO(ev.date), d); } catch { return false; } });
  const highImpactOnDay = (d: Date) => eventsPerDay(d).some((ev) => ev.impact === "high");

  const dateBarRef = useRef<HTMLDivElement>(null);

  // Scroll to today on mount
  useEffect(() => {
    if (dateBarRef.current) {
      const todayEl = dateBarRef.current.querySelector("[data-today='true']");
      if (todayEl) todayEl.scrollIntoView({ inline: "center", behavior: "instant" as ScrollBehavior });
    }
  }, [allEvents]);

  const handleAddToJournal = (event: EconomicEvent) => {
    toast.success("נוסף ליומן המסחר", {
      description: `"${event.titleHe}" (${event.flag} ${event.region}) נשמר ביומן שלך`,
    });
  };

  const handleAddToGoogleCalendar = (event: EconomicEvent) => {
    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate.getTime() + 30 * 60 * 1000);
    const formatGCal = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
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
    toast.success("נפתח Google Calendar");
  };

  const tabs = [
    { id: "reports" as const, label: "דוחות אדומים 🔴", icon: Flame, color: "destructive" },
    { id: "news" as const, label: "חדשות בזמן אמת", icon: TrendingUp, color: "primary" },
    { id: "calendar" as const, label: "לוח כלכלי", icon: Star, color: "accent" },
  ];
  type TabId = typeof tabs[number]["id"];
  const [activeTab, setActiveTab] = useState<TabId>("reports");

  return (
    <div className="min-h-full flex flex-col gap-3 p-2 md:p-4">
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

      {/* ── Syncing Banner ── */}
      {syncing && activeTab === "reports" && (
        <div className="shrink-0 flex items-center gap-2 rounded-lg border border-orange-400/20 bg-orange-400/5 px-3 py-2">
          <Loader2 className="h-3.5 w-3.5 text-orange-400 animate-spin" />
          <span className="text-xs text-orange-400">מסנכרן נתוני לוח כלכלי... מציג נתונים לדוגמה</span>
        </div>
      )}

      {/* ── Tab: Reports (Today's Alerts + Upcoming) ── */}
      {activeTab === "reports" && (
        <div className="flex flex-col gap-3 pb-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-4">
              <Loader2 className="h-8 w-8 text-destructive/40 animate-spin mb-2" />
              <p className="text-xs text-muted-foreground/40">טוען דוחות...</p>
            </div>
          ) : (
            <>
              {/* ── Scrollable Date Bar ── */}
              <div className="shrink-0 rounded-2xl border border-border/20 bg-card/30 backdrop-blur-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/10">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground">בחר תאריך</span>
                  </div>
                  <span className="text-2xs text-muted-foreground/40 font-mono">שעון ישראל 🇮🇱</span>
                </div>
                <div ref={dateBarRef} className="flex gap-1 px-2 py-2.5 overflow-x-auto scrollbar-none snap-x snap-mandatory">
                  {dateRange.map((d) => {
                    const active = isSameDay(d, selectedDate);
                    const today = isToday(d);
                    const evCount = eventsPerDay(d).length;
                    const hasHigh = highImpactOnDay(d);
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    return (
                      <button
                        key={d.toISOString()}
                        data-today={today || undefined}
                        onClick={() => setSelectedDate(d)}
                        className={cn(
                          "haptic-press snap-center flex flex-col items-center shrink-0 w-[52px] rounded-xl py-2 gap-0.5 border transition-all",
                          active
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : today
                              ? "border-accent/20 bg-accent/[0.04] text-foreground"
                              : isWeekend
                                ? "border-transparent bg-muted/10 text-muted-foreground/40"
                                : "border-transparent text-muted-foreground/60 hover:bg-secondary/50"
                        )}
                      >
                        <span className="text-[9px] font-medium leading-none">
                          {format(d, "EEE", { locale: he })}
                        </span>
                        <span className={cn("text-base font-bold leading-none", active && "text-primary")}>
                          {format(d, "d")}
                        </span>
                        <span className="text-[8px] leading-none text-muted-foreground/40">
                          {format(d, "MMM", { locale: he })}
                        </span>
                        {/* Event indicator dots */}
                        <div className="flex items-center gap-0.5 h-2 mt-0.5">
                          {evCount > 0 && (
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              hasHigh ? "bg-destructive" : "bg-primary/60"
                            )} />
                          )}
                          {evCount > 2 && <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Events for selected date ── */}
              <div className="rounded-2xl border border-border/20 bg-card/20 backdrop-blur-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/10">
                  <div className="flex items-center gap-2">
                    {isToday(selectedDate) && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                    {!isToday(selectedDate) && <CalendarIcon className="h-3.5 w-3.5 text-primary" />}
                    <span className={cn("text-xs font-bold", isToday(selectedDate) ? "text-destructive" : "text-foreground")}>
                      {isToday(selectedDate) ? "התראות היום 🔴" : format(selectedDate, "EEEE, d בMMMM yyyy", { locale: he })}
                    </span>
                  </div>
                  <span className="text-2xs text-muted-foreground/30 font-mono">
                    {selectedEvents.length > 0 ? `${selectedEvents.length} דוחות` : ""}
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  {selectedEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-8">
                      <Globe className="h-7 w-7 text-muted-foreground/15 mb-2" />
                      <p className="text-xs text-muted-foreground/40">
                        {selectedDate.getDay() === 0 || selectedDate.getDay() === 6
                          ? "סופ״ש — השווקים סגורים"
                          : "אין דוחות ביום זה"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                      {selectedEvents.map((event, i) => (
                        <EventCard key={`sel-${i}`} event={event} onAddToCalendar={handleAddToGoogleCalendar} onAddToJournal={handleAddToJournal} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab: Live News ── */}
      {activeTab === "news" && (
        <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
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
        <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
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
