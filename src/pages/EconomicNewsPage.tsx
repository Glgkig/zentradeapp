import { useEffect, useRef, useState, useCallback } from "react";
import { addDays, isSameDay, parseISO } from "date-fns";
import {
  TrendingUp, Calendar as CalendarIcon, ChevronRight, ChevronLeft,
  BookOpen, Clock, Globe, Flame, Loader2, RefreshCw, CalendarPlus,
  Landmark, Zap, Shield, Radio, BellRing, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface EconomicEvent {
  title: string;
  titleHe: string;
  country: string;
  flag: string;
  region: string;
  date: string;        // ISO string
  impact: "high" | "medium" | "low" | string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
}

/* ═══════════════════════════════════════════════════════════
   FALLBACK MOCK DATA  (API-ready shape)
═══════════════════════════════════════════════════════════ */
const today = new Date();
const todayStr = today.toISOString().split("T")[0];
const tomorrowStr = addDays(today, 1).toISOString().split("T")[0];

const FALLBACK_EVENTS: EconomicEvent[] = [
  { title: "Non-Farm Payrolls", titleHe: "שכר לא-חקלאי (NFP)", country: "USD", flag: "🇺🇸", region: "ארה״ב", date: `${todayStr}T12:30:00Z`, impact: "high", forecast: "190K", previous: "187K", actual: null },
  { title: "CPI m/m", titleHe: "מדד מחירים לצרכן (חודשי)", country: "USD", flag: "🇺🇸", region: "ארה״ב", date: `${todayStr}T12:30:00Z`, impact: "high", forecast: "0.3%", previous: "0.4%", actual: null },
  { title: "FOMC Statement", titleHe: "הצהרת הפד (FOMC)", country: "USD", flag: "🇺🇸", region: "ארה״ב", date: `${todayStr}T18:00:00Z`, impact: "high", forecast: "5.50%", previous: "5.50%", actual: null },
  { title: "Unemployment Claims", titleHe: "תביעות אבטלה שבועיות", country: "USD", flag: "🇺🇸", region: "ארה״ב", date: `${todayStr}T12:30:00Z`, impact: "high", forecast: "212K", previous: "210K", actual: null },
  { title: "Main Refinancing Rate", titleHe: "ריבית ECB", country: "EUR", flag: "🇪🇺", region: "אירופה", date: `${todayStr}T11:45:00Z`, impact: "high", forecast: "4.50%", previous: "4.50%", actual: null },
  { title: "GDP q/q", titleHe: "תוצר מקומי גולמי (רבעוני)", country: "GBP", flag: "🇬🇧", region: "בריטניה", date: `${todayStr}T06:00:00Z`, impact: "medium", forecast: "0.2%", previous: "0.1%", actual: null },
  { title: "Retail Sales m/m", titleHe: "מכירות קמעונאיות", country: "USD", flag: "🇺🇸", region: "ארה״ב", date: `${todayStr}T12:30:00Z`, impact: "medium", forecast: "0.5%", previous: "0.6%", actual: null },
  { title: "BOJ Policy Rate", titleHe: "ריבית בנק יפן (BOJ)", country: "JPY", flag: "🇯🇵", region: "יפן", date: `${todayStr}T03:00:00Z`, impact: "high", forecast: "0.25%", previous: "0.25%", actual: null },
  { title: "Trade Balance", titleHe: "מאזן סחר", country: "CAD", flag: "🇨🇦", region: "קנדה", date: `${tomorrowStr}T12:30:00Z`, impact: "medium", forecast: "-2.5B", previous: "-2.8B", actual: null },
  { title: "RBA Rate Decision", titleHe: "ריבית RBA אוסטרליה", country: "AUD", flag: "🇦🇺", region: "אוסטרליה", date: `${tomorrowStr}T03:30:00Z`, impact: "high", forecast: "4.35%", previous: "4.35%", actual: null },
];

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const formatIsraelTime = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleTimeString("he-IL", {
      timeZone: "Asia/Jerusalem",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch { return "--:--"; }
};

const HIGH_IMPACT_KEYWORDS = ["nfp", "fomc", "cpi", "gdp", "rate", "payroll", "inflation", "fed ", "federal", "ecb", "boj", "boe"];
const isMarketMover = (ev: EconomicEvent) =>
  ev.impact === "high" &&
  HIGH_IMPACT_KEYWORDS.some(k => ev.title.toLowerCase().includes(k));

/* ═══════════════════════════════════════════════════════════
   COUNTDOWN HOOK
═══════════════════════════════════════════════════════════ */
const useCountdown = (targetDate: string | null) => {
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    if (!targetDate) return;
    const tick = () => setDiff(Math.max(0, new Date(targetDate).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  const isPast = diff === 0;
  return { h, m, s, isPast, raw: diff };
};

/* ═══════════════════════════════════════════════════════════
   TRADINGVIEW WIDGETS  (unchanged)
═══════════════════════════════════════════════════════════ */
const TimelineWidget = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({ feedMode: "all_symbols", isTransparent: true, displayMode: "regular", width: "100%", height: "100%", colorTheme: "dark", locale: "he_IL" });
    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container";
    wrapper.style.cssText = "height:100%;width:100%";
    const inner = document.createElement("div");
    inner.className = "tradingview-widget-container__widget";
    inner.style.cssText = "height:100%;width:100%";
    wrapper.appendChild(inner);
    wrapper.appendChild(script);
    ref.current.appendChild(wrapper);
  }, []);
  return <div ref={ref} className="h-full w-full" />;
};

const EconomicCalendarWidget = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({ colorTheme: "dark", isTransparent: true, width: "100%", height: "100%", locale: "he_IL", importanceFilter: "0,1", countryFilter: "us,eu,gb,jp,cn,ca,au,nz,ch" });
    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container";
    wrapper.style.cssText = "height:100%;width:100%";
    const inner = document.createElement("div");
    inner.className = "tradingview-widget-container__widget";
    inner.style.cssText = "height:100%;width:100%";
    wrapper.appendChild(inner);
    wrapper.appendChild(script);
    ref.current.appendChild(wrapper);
  }, []);
  return <div ref={ref} className="h-full w-full" />;
};

/* ═══════════════════════════════════════════════════════════
   IMPACT DOT
═══════════════════════════════════════════════════════════ */
const ImpactDot = ({ impact }: { impact: string }) => {
  if (impact === "high") return (
    <span className="relative flex h-3 w-3 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-50" style={{ animationDuration: "1.4s" }} />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" style={{ boxShadow: "0 0 8px rgba(239,68,68,0.8)" }} />
    </span>
  );
  if (impact === "medium") return (
    <span className="relative flex h-3 w-3 shrink-0">
      <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400" style={{ boxShadow: "0 0 6px rgba(251,191,36,0.6)" }} />
    </span>
  );
  return <span className="flex h-3 w-3 shrink-0 rounded-full bg-white/10" />;
};

/* ═══════════════════════════════════════════════════════════
   HERO COUNTDOWN  — next high-impact event
═══════════════════════════════════════════════════════════ */
const HeroCountdown = ({ events }: { events: EconomicEvent[] }) => {
  const nextEvent = events
    .filter(ev => ev.impact === "high" && new Date(ev.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;

  const { h, m, s, isPast } = useCountdown(nextEvent?.date ?? null);
  const pad = (n: number) => String(n).padStart(2, "0");

  if (!nextEvent) return null;

  const isUrgent = !isPast && h === 0 && m < 30;

  return (
    <div
      className="relative rounded-2xl overflow-hidden shrink-0"
      style={{
        background: "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(10,10,20,0.7) 60%)",
        border: isUrgent ? "1px solid rgba(239,68,68,0.45)" : "1px solid rgba(239,68,68,0.18)",
        boxShadow: isUrgent
          ? "0 0 40px rgba(239,68,68,0.18), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 0 20px rgba(239,68,68,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* ambient glow blob */}
      <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(239,68,68,0.6) 0%, transparent 70%)" }} />

      <div className="relative flex items-center justify-between gap-4 px-5 py-4">
        {/* Left: label + event name */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Radio className="h-3 w-3 text-red-400 shrink-0" style={{ filter: "drop-shadow(0 0 4px rgba(239,68,68,0.8))" }} />
            <span className="text-[9px] font-black font-mono uppercase tracking-[0.2em] text-red-400/60">
              {isPast ? "LIVE NOW" : "הבא — HIGH IMPACT"}
            </span>
          </div>
          <p className="text-[17px] font-black text-white leading-tight truncate">{nextEvent.titleHe}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-base">{nextEvent.flag}</span>
            <span className="text-[11px] font-bold text-white/40 font-mono">{nextEvent.country}</span>
            <span className="text-white/15">·</span>
            <Clock className="h-3 w-3 text-white/25" />
            <span className="text-[11px] font-mono text-white/40">{formatIsraelTime(nextEvent.date)}</span>
            {nextEvent.forecast && (
              <>
                <span className="text-white/15">·</span>
                <span className="text-[10px] text-white/30 font-mono">צפי: <span className="text-white/60 font-bold">{nextEvent.forecast}</span></span>
              </>
            )}
          </div>
        </div>

        {/* Right: countdown digits */}
        <div className="shrink-0 flex items-center gap-1" dir="ltr">
          {isPast ? (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[13px] font-black text-red-400 font-mono">LIVE</span>
            </div>
          ) : (
            <>
              {[pad(h), pad(m), pad(s)].map((val, i) => (
                <>
                  <div key={i} className="flex flex-col items-center">
                    <div className="rounded-xl px-3 py-2 text-center"
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        minWidth: "44px",
                      }}>
                      <span className="text-[22px] font-black font-mono text-white tabular-nums leading-none">{val}</span>
                    </div>
                    <span className="text-[7px] font-mono text-white/20 mt-0.5 uppercase">
                      {i === 0 ? "שע'" : i === 1 ? "דק'" : "שנ'"}
                    </span>
                  </div>
                  {i < 2 && <span className="text-[18px] font-black text-red-500/40 pb-3 select-none">:</span>}
                </>
              ))}
            </>
          )}
        </div>
      </div>

      {/* progress bar — fills as event approaches (last 2h) */}
      {!isPast && h < 2 && (
        <div className="absolute bottom-0 inset-x-0 h-[2px]">
          <div className="h-full bg-gradient-to-l from-red-500/80 to-transparent transition-all duration-1000"
            style={{ width: `${Math.min(100, 100 - ((h * 60 + m) / 120) * 100)}%` }} />
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   AI INSIGHT BADGE
═══════════════════════════════════════════════════════════ */
const AiBadge = ({ event }: { event: EconomicEvent }) => {
  const notes: Record<string, string> = {
    "non-farm": "NFP — תנודתיות מקסימלית. ממוצע נע של 120 pips ב-EURUSD. מומלץ לסגור פוזיציות פתוחות לפני.",
    "cpi": "CPI — מזין ציפיות ריבית. מעל הצפי → דולר חזק. מוצר הצפי → ירידת דולר.",
    "fomc": "FOMC — ישיבת הפד. עצור. אל תיכנס לעסקה 30 דקות לפני ו-15 דקות אחרי.",
    "rate": "ריבית — האירוע הגדול ביותר של החודש. spread מתרחב. היזהר מ-slippage.",
    "gdp": "GDP — מעצב תמונת המאקרו. מפתיע לחיוב → מטבע מקומי עולה.",
    "default": "תנודתיות גבוהה צפויה. שקול לנהל פוזיציות פתוחות לפני הפרסום.",
  };
  const key = Object.keys(notes).find(k => event.title.toLowerCase().includes(k)) ?? "default";
  const text = notes[key];

  return (
    <div className="flex items-start gap-2 mt-2.5 rounded-xl px-3 py-2.5"
      style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}>
      <Zap className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" style={{ filter: "drop-shadow(0 0 4px rgba(59,130,246,0.6))" }} />
      <p className="text-[10px] text-blue-300/70 leading-relaxed">
        <span className="font-black text-blue-400">AI Alert: </span>{text}
      </p>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   EVENT CARD  — Radar style
═══════════════════════════════════════════════════════════ */
const EventCard = ({
  event,
  onAddToCalendar,
  onAddToJournal,
}: {
  event: EconomicEvent;
  onAddToCalendar: (e: EconomicEvent) => void;
  onAddToJournal: (e: EconomicEvent) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const isPast = new Date(event.date) < new Date();
  const isHigh = event.impact === "high";
  const isMed = event.impact === "medium";

  const borderColor = isHigh
    ? isPast ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.22)"
    : isMed
    ? "rgba(251,191,36,0.14)"
    : "rgba(255,255,255,0.05)";

  const bgColor = isHigh
    ? "rgba(239,68,68,0.04)"
    : isMed
    ? "rgba(251,191,36,0.03)"
    : "rgba(255,255,255,0.01)";

  const glowShadow = isHigh && !isPast
    ? "0 0 20px rgba(239,68,68,0.08), 0 2px 8px rgba(0,0,0,0.4)"
    : "0 1px 4px rgba(0,0,0,0.3)";

  return (
    <div
      className={cn("relative rounded-2xl transition-all duration-300 overflow-hidden", isPast && "opacity-40")}
      style={{ border: `1px solid ${borderColor}`, background: bgColor, boxShadow: glowShadow }}
    >
      {/* Side impact bar */}
      <div className="absolute right-0 inset-y-0 w-[3px] rounded-l-full"
        style={{
          background: isHigh
            ? "linear-gradient(to bottom, rgba(239,68,68,0.8), rgba(239,68,68,0.3))"
            : isMed
            ? "linear-gradient(to bottom, rgba(251,191,36,0.6), rgba(251,191,36,0.15))"
            : "rgba(255,255,255,0.04)",
          boxShadow: isHigh ? "0 0 8px rgba(239,68,68,0.5)" : undefined,
        }} />

      {/* Main row */}
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full text-right px-4 py-3.5"
      >
        <div className="flex items-center gap-3">
          {/* Impact dot */}
          <ImpactDot impact={event.impact} />

          {/* Time */}
          <div className="shrink-0 w-11 text-center">
            <span className="text-[11px] font-black font-mono text-white/50">{formatIsraelTime(event.date)}</span>
          </div>

          <div className="h-5 w-px bg-white/[0.06]" />

          {/* Flag + currency */}
          <div className="shrink-0 flex flex-col items-center w-8">
            <span className="text-[15px] leading-none">{event.flag}</span>
            <span className="text-[8px] font-black font-mono text-white/30 mt-0.5">{event.country}</span>
          </div>

          {/* Event name */}
          <div className="flex-1 min-w-0 text-right">
            <p className={cn(
              "text-[13px] font-bold leading-tight truncate",
              isHigh ? "text-white" : "text-white/70"
            )}>
              {event.titleHe}
            </p>
            {isHigh && (
              <span className="inline-flex items-center gap-1 mt-0.5 rounded-full px-1.5 py-[1px] text-[8px] font-black font-mono tracking-widest uppercase"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                ● HIGH IMPACT
              </span>
            )}
          </div>

          {/* Forecast/Actual pills */}
          <div className="shrink-0 flex items-center gap-1.5" dir="ltr">
            {event.actual != null ? (
              <div className="rounded-lg px-2 py-1 text-center"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <p className="text-[8px] font-mono text-green-400/50 mb-0.5">בפועל</p>
                <p className="text-[11px] font-black font-mono text-green-400">{event.actual}</p>
              </div>
            ) : event.forecast ? (
              <div className="rounded-lg px-2 py-1 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[8px] font-mono text-white/20 mb-0.5">צפי</p>
                <p className="text-[11px] font-bold font-mono text-white/50">{event.forecast}</p>
              </div>
            ) : null}
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2" dir="rtl">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "צפי", value: event.forecast, color: "rgba(255,255,255,0.5)" },
              { label: "קודם", value: event.previous, color: "rgba(255,255,255,0.35)" },
              { label: "בפועל", value: event.actual, color: "#22c55e" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl text-center py-2 px-1"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[8px] font-mono text-white/20 mb-0.5 uppercase">{label}</p>
                <p className="text-[13px] font-black font-mono" style={{ color: value ? color : "rgba(255,255,255,0.12)" }}>
                  {value ?? "—"}
                </p>
              </div>
            ))}
          </div>

          {/* AI Badge — only for high impact */}
          {isHigh && <AiBadge event={event} />}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onAddToCalendar(event)}
              className="haptic-press flex items-center gap-1.5 rounded-lg border border-amber-400/20 bg-amber-400/5 px-2.5 py-1.5 text-amber-400 hover:bg-amber-400/15 transition-all"
            >
              <CalendarPlus className="h-3 w-3" />
              <span className="text-[10px] font-bold">Google Calendar</span>
            </button>
            <button
              onClick={() => onAddToJournal(event)}
              className="haptic-press flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/5 px-2.5 py-1.5 text-blue-400 hover:bg-blue-500/15 transition-all"
            >
              <BookOpen className="h-3 w-3" />
              <span className="text-[10px] font-bold">שמור ביומן</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   DAY SECTION HEADER
═══════════════════════════════════════════════════════════ */
const DaySectionHeader = ({ date, events }: { date: string; events: EconomicEvent[] }) => {
  const d = new Date(date + "T12:00:00Z");
  const isNow = isSameDay(d, new Date());
  const highCount = events.filter(e => e.impact === "high").length;

  return (
    <div className="flex items-center gap-3 pt-2 pb-1">
      <div className="flex items-center gap-2">
        {isNow && <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />}
        <span className={cn("text-[11px] font-black font-mono uppercase tracking-widest",
          isNow ? "text-blue-400" : "text-white/25")}>
          {isNow ? "היום" : d.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "short" })}
        </span>
      </div>
      {highCount > 0 && (
        <span className="rounded-full px-2 py-0.5 text-[8px] font-black font-mono"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {highCount} HIGH
        </span>
      )}
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.05))" }} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
const EconomicNewsPage = () => {
  const [allEvents, setAllEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<"radar" | "calendar" | "news">("radar");
  const [impactFilter, setImpactFilter] = useState<"all" | "high" | "medium">("all");
  const [currencyFilter, setCurrencyFilter] = useState<"all" | "USD" | "EUR" | "GBP" | "JPY">("all");
  const dateBarRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [now] = useState(() => new Date());
  const dateRange = Array.from({ length: 37 }, (_, i) => addDays(now, i - 7));

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setSyncing(false);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("economic-calendar");
      if (fnError) throw fnError;
      const events = data?.events || [];
      setAllEvents(events.length > 0 ? events : FALLBACK_EVENTS);
      if (events.length === 0) setSyncing(true);
    } catch {
      setSyncing(true);
      setAllEvents(FALLBACK_EVENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  useEffect(() => {
    if (dateBarRef.current) {
      const el = dateBarRef.current.querySelector("[data-today='true']");
      el?.scrollIntoView({ inline: "center", behavior: "instant" as ScrollBehavior });
    }
  }, []);

  /* Events for selected date, with filters */
  const selectedEvents = allEvents
    .filter(ev => {
      try { return isSameDay(parseISO(ev.date), selectedDate); } catch { return false; }
    })
    .filter(ev => impactFilter === "all" || ev.impact === impactFilter)
    .filter(ev => currencyFilter === "all" || ev.country === currencyFilter)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  /* Group by date for multi-day view */
  const groupedByDate = allEvents
    .filter(ev => ev.impact === "high" || ev.impact === "medium")
    .reduce<Record<string, EconomicEvent[]>>((acc, ev) => {
      const d = ev.date.split("T")[0];
      if (!acc[d]) acc[d] = [];
      acc[d].push(ev);
      return acc;
    }, {});

  const highImpactOnDay = (d: Date) =>
    allEvents.some(ev => { try { return isSameDay(parseISO(ev.date), d) && ev.impact === "high"; } catch { return false; } });

  const handleAddToGoogleCalendar = (event: EconomicEvent) => {
    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate.getTime() + 30 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", `🔴 ${event.titleHe} (${event.region})`);
    url.searchParams.set("dates", `${fmt(eventDate)}/${fmt(endDate)}`);
    url.searchParams.set("details", [`דוח כלכלי בעל השפעה גבוהה`, event.forecast ? `צפי: ${event.forecast}` : "", event.previous ? `קודם: ${event.previous}` : "", "מקור: ZenTrade"].filter(Boolean).join("\n"));
    url.searchParams.set("ctz", "Asia/Jerusalem");
    window.open(url.toString(), "_blank");
    toast.success("נפתח Google Calendar");
  };

  const handleAddToJournal = (event: EconomicEvent) => {
    toast.success("נוסף ליומן המסחר", { description: `"${event.titleHe}" נשמר ביומן שלך` });
  };

  const tabs = [
    { id: "radar" as const, label: "Radar", icon: Radio, desc: "דוחות יומי" },
    { id: "news" as const, label: "חדשות", icon: TrendingUp, desc: "זמן אמת" },
    { id: "calendar" as const, label: "לוח", icon: CalendarIcon, desc: "כלכלי" },
  ];

  return (
    <div className="flex flex-col h-full gap-0" dir="rtl">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-red-500/15 blur-md" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <BellRing className="h-5 w-5 text-red-400" />
            </div>
          </div>
          <div>
            <h1 className="text-[17px] font-black text-white leading-tight">Institutional Radar</h1>
            <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest">Economic Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "radar" && (
            <button onClick={fetchEvents} disabled={loading}
              className="haptic-press flex h-8 w-8 items-center justify-center rounded-xl transition-all"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <RefreshCw className={cn("h-3.5 w-3.5 text-white/30", loading && "animate-spin text-blue-400")} />
            </button>
          )}
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-[9px] font-black font-mono text-red-400/70 uppercase tracking-widest">LIVE</span>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="px-4 pb-3 shrink-0">
        <div className="flex gap-1 rounded-2xl p-1"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn("haptic-press flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all")}
              style={activeTab === t.id ? {
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.25)",
                boxShadow: "0 0 16px rgba(59,130,246,0.12)",
              } : {
                border: "1px solid transparent",
              }}
            >
              <t.icon className={cn("h-3.5 w-3.5", activeTab === t.id ? "text-blue-400" : "text-white/25")} />
              <span className={cn("text-[12px] font-bold", activeTab === t.id ? "text-white" : "text-white/30")}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── RADAR TAB ── */}
      {activeTab === "radar" && (
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 scrollbar-none">

          {/* syncing banner */}
          {syncing && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 shrink-0"
              style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.14)" }}>
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="text-[10px] text-amber-400/70">מוצג מידע לדוגמה — API לא מחובר</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Radio className="h-4 w-4 text-red-400" />
                </div>
              </div>
              <p className="text-[11px] font-mono text-white/20 uppercase tracking-widest">טוען נתוני שוק...</p>
            </div>
          ) : (
            <>
              {/* Hero Countdown */}
              <HeroCountdown events={allEvents} />

              {/* Date strip */}
              <div className="rounded-2xl overflow-hidden shrink-0"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  <span className="text-[10px] font-black font-mono text-white/20 uppercase tracking-widest">בחר תאריך</span>
                  <div className="flex gap-1">
                    <button onClick={() => dateBarRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
                      className="h-6 w-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.04]"
                      style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                      <ChevronLeft className="h-3 w-3 text-white/25" />
                    </button>
                    <button onClick={() => dateBarRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
                      className="h-6 w-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.04]"
                      style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                      <ChevronRight className="h-3 w-3 text-white/25" />
                    </button>
                  </div>
                </div>
                <div ref={dateBarRef} className="flex gap-1.5 overflow-x-auto scrollbar-none px-3 py-2.5">
                  {dateRange.map((d, i) => {
                    const isSelected = isSameDay(d, selectedDate);
                    const isTod = isSameDay(d, now);
                    const hasHigh = highImpactOnDay(d);
                    return (
                      <button key={i} data-today={isTod ? "true" : undefined}
                        onClick={() => setSelectedDate(d)}
                        className="shrink-0 flex flex-col items-center rounded-xl px-3 py-2.5 min-w-[44px] min-h-[60px] transition-all"
                        style={isSelected ? {
                          background: "rgba(59,130,246,0.14)",
                          border: "1px solid rgba(59,130,246,0.3)",
                        } : {
                          background: "rgba(255,255,255,0.02)",
                          border: `1px solid ${isTod ? "rgba(255,255,255,0.1)" : "transparent"}`,
                        }}>
                        <span className={cn("text-[8px] font-mono uppercase",
                          isSelected ? "text-blue-400" : isTod ? "text-white/40" : "text-white/20")}>
                          {d.toLocaleDateString("he-IL", { weekday: "short" })}
                        </span>
                        <span className={cn("text-[15px] font-black font-mono",
                          isSelected ? "text-white" : "text-white/30")}>
                          {d.getDate()}
                        </span>
                        {hasHigh
                          ? <div className="h-1.5 w-1.5 rounded-full mt-0.5" style={{ background: "#ef4444", boxShadow: "0 0 4px rgba(239,68,68,0.8)" }} />
                          : <div className="h-1.5 w-1.5 rounded-full mt-0.5 opacity-0" />
                        }
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {(["all", "high", "medium"] as const).map(f => (
                  <button key={f} onClick={() => setImpactFilter(f)}
                    className="rounded-full px-3 py-1 text-[10px] font-bold transition-all"
                    style={impactFilter === f ? {
                      background: f === "high" ? "rgba(239,68,68,0.15)" : f === "medium" ? "rgba(251,191,36,0.12)" : "rgba(59,130,246,0.12)",
                      border: `1px solid ${f === "high" ? "rgba(239,68,68,0.3)" : f === "medium" ? "rgba(251,191,36,0.25)" : "rgba(59,130,246,0.25)"}`,
                      color: f === "high" ? "#f87171" : f === "medium" ? "#fbbf24" : "#60a5fa",
                    } : {
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.25)",
                    }}>
                    {f === "all" ? "הכל" : f === "high" ? "🔴 גבוה" : "🟠 בינוני"}
                  </button>
                ))}
                <div className="h-4 w-px bg-white/[0.06]" />
                {(["all", "USD", "EUR", "GBP", "JPY"] as const).map(c => (
                  <button key={c} onClick={() => setCurrencyFilter(c)}
                    className="rounded-full px-3 py-1 text-[10px] font-bold font-mono transition-all"
                    style={currencyFilter === c ? {
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.8)",
                    } : {
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.25)",
                    }}>
                    {c === "all" ? "כל המטבעות" : c}
                  </button>
                ))}
              </div>

              {/* Event list */}
              {selectedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <Shield className="h-10 w-10 text-white/[0.06]" />
                  <p className="text-[12px] font-mono text-white/20">אין אירועים ביום זה</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((ev, i) => (
                    <EventCard key={i} event={ev}
                      onAddToCalendar={handleAddToGoogleCalendar}
                      onAddToJournal={handleAddToJournal} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── NEWS TAB ── */}
      {activeTab === "news" && (
        <div className="flex-1 overflow-hidden px-4 pb-4">
          <div className="h-full rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
            <TimelineWidget />
          </div>
        </div>
      )}

      {/* ── CALENDAR TAB ── */}
      {activeTab === "calendar" && (
        <div className="flex-1 overflow-hidden px-4 pb-4">
          <div className="h-full rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
            <EconomicCalendarWidget />
          </div>
        </div>
      )}
    </div>
  );
};

export default EconomicNewsPage;
