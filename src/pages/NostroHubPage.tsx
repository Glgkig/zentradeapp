import { useState, useEffect } from "react";
import {
  Building2, ExternalLink, ChevronRight, X, Zap,
  CheckCircle2, TrendingDown, Target, Activity,
  Flame, Globe, Calendar,
  BookOpen, Brain, ChevronDown, ChevronUp, Lock,
  BarChart3, Banknote, Search, Loader2, AlertCircle,
  Newspaper, ShieldAlert, ShieldCheck, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/* ═══════════════════════════════════════════════════════════
   DATA MODEL
═══════════════════════════════════════════════════════════ */
interface RuleItem {
  label: string;
  value: string;
  detail?: string;
  severity?: "safe" | "warn" | "danger" | "neutral";
}

interface RuleSection {
  id: string;
  title: string;
  icon: typeof Target;
  color: string;
  rules: RuleItem[];
}

interface AccountTier {
  size: string;
  sizeRaw: number; // in USD
  price: number;
  phase1: { profitTarget: number; dailyLoss: number; maxDrawdown: number; maxDays: number | null; minDays: number };
  phase2?: { profitTarget: number; dailyLoss: number; maxDrawdown: number; maxDays: number | null; minDays: number };
  funded: { dailyLoss: number; maxDrawdown: number; profitSplit: number };
}

interface PropFirm {
  id: string;
  name: string;
  tagline: string;
  country: string;
  founded: string;
  specialty: string;
  accentHex: string;
  borderHex: string;
  bgHex: string;
  affiliateUrl: string;
  tiers: AccountTier[];
  ruleSections: RuleSection[];
  psychologyNote: string;
  failRate: number; // %
  badge?: string;
  logoUrl?: string;
}

/* ─── FIRMS DATA ─── */
const FIRMS: PropFirm[] = [
  {
    id: "ftmo",
    name: "FTMO",
    tagline: "הסטנדרט המוביל בתעשייה — 2-פאזות",
    country: "🇨🇿 צ׳כיה",
    founded: "2015",
    specialty: "פורקס, מניות, קריפטו, סחורות",
    accentHex: "#3b82f6",
    borderHex: "rgba(59,130,246,0.2)",
    bgHex: "rgba(59,130,246,0.05)",
    affiliateUrl: "https://ftmo.com?ref=zentrade",
    badge: "🏆 מוביל עולמי",
    logoUrl: "https://www.google.com/s2/favicons?domain=ftmo.com&sz=64",
    psychologyNote: "90% נכשלים ב-FTMO לא בגלל חוסר ידע בניתוח. הם נכשלים כי הם מאבדים שליטה ביום אחד — עסקת נקמה אחת שמוציאה אותם מהמגבלה היומית. ה-AI Journal של ZenTrade מזהה Tilt Patterns בטרם הם מתרחשים.",
    failRate: 87,
    tiers: [
      { size: "$10K",  sizeRaw: 10000,  price: 155,  phase1: { profitTarget: 10, dailyLoss: 5, maxDrawdown: 10, maxDays: 30, minDays: 4 }, phase2: { profitTarget: 5, dailyLoss: 5, maxDrawdown: 10, maxDays: 60, minDays: 4 }, funded: { dailyLoss: 5, maxDrawdown: 10, profitSplit: 80 } },
      { size: "$25K",  sizeRaw: 25000,  price: 250,  phase1: { profitTarget: 10, dailyLoss: 5, maxDrawdown: 10, maxDays: 30, minDays: 4 }, phase2: { profitTarget: 5, dailyLoss: 5, maxDrawdown: 10, maxDays: 60, minDays: 4 }, funded: { dailyLoss: 5, maxDrawdown: 10, profitSplit: 80 } },
      { size: "$50K",  sizeRaw: 50000,  price: 345,  phase1: { profitTarget: 10, dailyLoss: 5, maxDrawdown: 10, maxDays: 30, minDays: 4 }, phase2: { profitTarget: 5, dailyLoss: 5, maxDrawdown: 10, maxDays: 60, minDays: 4 }, funded: { dailyLoss: 5, maxDrawdown: 10, profitSplit: 80 } },
      { size: "$100K", sizeRaw: 100000, price: 540,  phase1: { profitTarget: 10, dailyLoss: 5, maxDrawdown: 10, maxDays: 30, minDays: 4 }, phase2: { profitTarget: 5, dailyLoss: 5, maxDrawdown: 10, maxDays: 60, minDays: 4 }, funded: { dailyLoss: 5, maxDrawdown: 10, profitSplit: 80 } },
      { size: "$200K", sizeRaw: 200000, price: 1080, phase1: { profitTarget: 10, dailyLoss: 5, maxDrawdown: 10, maxDays: 30, minDays: 4 }, phase2: { profitTarget: 5, dailyLoss: 5, maxDrawdown: 10, maxDays: 60, minDays: 4 }, funded: { dailyLoss: 5, maxDrawdown: 10, profitSplit: 80 } },
    ],
    ruleSections: [
      {
        id: "targets", title: "יעדי רווח", icon: Target, color: "#22c55e",
        rules: [
          { label: "יעד רווח — פאזה 1", value: "10%", detail: "עליך להשיג 10% מגובה החשבון בפאזה הראשונה", severity: "neutral" },
          { label: "יעד רווח — פאזה 2", value: "5%", detail: "פאזה שנייה קלה יותר — 5% בלבד", severity: "safe" },
          { label: "פיצול רווח (Funded)", value: "80%–90%", detail: "מתחיל ב-80%, עולה ל-90% עם ה-Scaling Plan", severity: "safe" },
          { label: "Scaling Plan", value: "עד $2,000,000", detail: "חשבון גדל ב-25% כל 2 חודשים בביצועים עקביים", severity: "safe" },
        ],
      },
      {
        id: "drawdown", title: "מגבלות Drawdown", icon: TrendingDown, color: "#ef4444",
        rules: [
          { label: "הפסד יומי מקסימלי", value: "5% מהיתרה", detail: "נמדד מגובה החשבון בתחילת היום (EOD Equity)", severity: "danger" },
          { label: "Drawdown כולל מקסימלי", value: "10% סטטי", detail: "מחושב מה-Balance הראשוני — לא Trailing", severity: "warn" },
          { label: "סוג Drawdown", value: "Static (EOD)", detail: "נמדד לפי ה-Equity בסוף יום — פוזיציות פתוחות לא נספרות", severity: "safe" },
        ],
      },
      {
        id: "trading", title: "כללי מסחר", icon: Activity, color: "#60a5fa",
        rules: [
          { label: "ימי מסחר מינימום — פאזה 1", value: "4 ימים", detail: "חייב לסחור לפחות 4 ימים שונים", severity: "neutral" },
          { label: "ימי מסחר מינימום — פאזה 2", value: "4 ימים", detail: "אותו כלל חל גם בפאזה 2", severity: "neutral" },
          { label: "מקסימום ימים — פאזה 1", value: "30 יום", detail: "חייב להשלים את הפאזה תוך 30 יום קלנדריים", severity: "warn" },
          { label: "מקסימום ימים — פאזה 2", value: "60 יום", detail: "חייב להשלים את הפאזה 2 תוך 60 יום", severity: "warn" },
          { label: "Funded — מגבלת זמן", value: "אין", detail: "בחשבון הממומן אין הגבלת זמן", severity: "safe" },
          { label: "החזקה בסוף שבוע", value: "מותר", detail: "ניתן להחזיק פוזיציות דרך Swap/Weekend", severity: "safe" },
          { label: "החזקה דרך חדשות", value: "מותר (בסיכון)", detail: "אין איסור, אך FTMO עוקב אחר ניהול סיכון", severity: "warn" },
        ],
      },
      {
        id: "consistency", title: "כללי עקביות", icon: BarChart3, color: "#f59e0b",
        rules: [
          { label: "Consistency Rule", value: "לא קיים", detail: "FTMO אינה דורשת עקביות פורמלית בין ימים", severity: "safe" },
          { label: "ניהול סיכון (שיקול דעת)", value: "מומלץ Max 1–2% לעסקה", detail: "אין חוק כתוב, אך תבניות Revenge Trading נצפות", severity: "neutral" },
        ],
      },
      {
        id: "restrictions", title: "הגבלות ואיסורים", icon: Lock, color: "#ef4444",
        rules: [
          { label: "HFT / EA מהיר", value: "אסור", detail: "אסור להשתמש ב-Bots שמבצעים עסקאות במהירות גבוהה", severity: "danger" },
          { label: "Copy Trading", value: "אסור בין חשבונות FTMO", detail: "אסור להעתיק עסקאות בין חשבונות שונים של FTMO", severity: "danger" },
          { label: "Arbitrage / Grid", value: "אסור", detail: "אסטרטגיות Latency Arbitrage וGrid Trading אסורות", severity: "danger" },
          { label: "Martingale", value: "אסור", detail: "הכפלת לוט אחרי הפסדים היא הפרת כללים", severity: "danger" },
          { label: "מסחר רגיל (Swing/Day)", value: "מותר לחלוטין", detail: "כל אסטרטגיית מסחר ידנית מותרת", severity: "safe" },
        ],
      },
      {
        id: "payout", title: "משיכות ותנאים", icon: Banknote, color: "#22c55e",
        rules: [
          { label: "מחזור משיכה ראשון", value: "אחרי 30 יום", detail: "ניתן למשוך לאחר 30 יום מהיום הראשון בחשבון Funded", severity: "neutral" },
          { label: "תדירות משיכות", value: "כל 14 יום", detail: "לאחר המשיכה הראשונה, ניתן למשוך כל שבועיים", severity: "safe" },
          { label: "שיטת תשלום", value: "Bank Transfer, Crypto, Wise", detail: "מגוון אמצעי תשלום זמינים", severity: "safe" },
          { label: "הוצאת הפסד מהכיס", value: "לא — המקסימום הוא עלות האתגר", detail: "אתה לא מסתכן מעבר לעלות הרכישה", severity: "safe" },
        ],
      },
    ],
  },
  {
    id: "topstep",
    name: "TopstepX",
    tagline: "מוביל הפיוצ׳רס — NQ, ES, CL, Gold",
    country: "🇺🇸 ארה״ב",
    founded: "2012",
    specialty: "פיוצ׳רס בלבד (CME, NYMEX, COMEX)",
    accentHex: "#22c55e",
    borderHex: "rgba(34,197,94,0.2)",
    bgHex: "rgba(34,197,94,0.05)",
    affiliateUrl: "https://topstepx.com?ref=zentrade",
    badge: "⚡ פיוצ׳רס #1",
    logoUrl: "https://www.google.com/s2/favicons?domain=topstepx.com&sz=64",
    psychologyNote: "הסוחר הממוצע ב-TopstepX נשרף על ה-Trailing Drawdown — שהוא מחמיר יותר ממה שנראה. ברגע שהחשבון מגיע לשיא חדש, המגבלה עולה גם היא. ZenTrade עוקב אחר ה-High Water Mark שלך בזמן אמת.",
    failRate: 91,
    tiers: [
      { size: "$50K",  sizeRaw: 50000,  price: 99,  phase1: { profitTarget: 6, dailyLoss: 2, maxDrawdown: 4, maxDays: null, minDays: 1 }, funded: { dailyLoss: 2, maxDrawdown: 4, profitSplit: 90 } },
      { size: "$100K", sizeRaw: 100000, price: 149, phase1: { profitTarget: 6, dailyLoss: 2, maxDrawdown: 3, maxDays: null, minDays: 1 }, funded: { dailyLoss: 2, maxDrawdown: 3, profitSplit: 90 } },
      { size: "$150K", sizeRaw: 150000, price: 199, phase1: { profitTarget: 6, dailyLoss: 2, maxDrawdown: 3, maxDays: null, minDays: 1 }, funded: { dailyLoss: 2, maxDrawdown: 3, profitSplit: 90 } },
    ],
    ruleSections: [
      {
        id: "targets", title: "יעדי רווח", icon: Target, color: "#22c55e",
        rules: [
          { label: "יעד רווח (Combine)", value: "6% מהחשבון", detail: "יעד אחד בלבד — אין פאזה 2", severity: "safe" },
          { label: "פיצול רווח", value: "90%", detail: "מהיום הראשון בחשבון ממומן", severity: "safe" },
          { label: "Scaling Plan", value: "עד $500K", detail: "חשבון גדל עם ביצועים עקביים", severity: "safe" },
        ],
      },
      {
        id: "drawdown", title: "מגבלות Drawdown", icon: TrendingDown, color: "#ef4444",
        rules: [
          { label: "הפסד יומי מקסימלי ($50K)", value: "$1,000", detail: "מגבלת הפסד יומי — Trailing מה-Peak", severity: "danger" },
          { label: "הפסד יומי מקסימלי ($100K)", value: "$2,000", detail: "Trailing — עולה עם רווחים", severity: "danger" },
          { label: "Max Trailing Drawdown ($50K)", value: "$2,000", detail: "⚠ TRAILING — זז עם Peak Balance שלך!", severity: "danger" },
          { label: "Max Trailing Drawdown ($100K)", value: "$3,000", detail: "⚠ TRAILING — הכי מסוכן לסוחרי Swing", severity: "danger" },
          { label: "סוג Drawdown", value: "Trailing (Intraday)", value2: "— המסוכן ביותר", detail: "מחושב ב-Intraday — פוזיציות פתוחות נספרות כהפסד!", severity: "danger" },
        ] as RuleItem[],
      },
      {
        id: "trading", title: "כללי מסחר", icon: Activity, color: "#60a5fa",
        rules: [
          { label: "מינימום ימי מסחר", value: "1 יום בלבד", detail: "ניתן לעבור בתוך יום אחד!", severity: "safe" },
          { label: "מגבלת זמן", value: "אין", detail: "Combine ללא הגבלת זמן — הקצב שלך", severity: "safe" },
          { label: "כלים מותרים", value: "פיוצ׳רס CME בלבד", detail: "NQ, ES, YM, RTY, CL, GC, SI, ZB ועוד", severity: "neutral" },
          { label: "החזקה לילה/שבוע", value: "מותר ב-Funded", detail: "בשלב ה-Combine — חייב לסגור לפני קנייה (תלוי פלטפורמה)", severity: "warn" },
        ],
      },
      {
        id: "consistency", title: "כללי עקביות", icon: BarChart3, color: "#f59e0b",
        rules: [
          { label: "Consistency Rule", value: "לא קיים", detail: "TopstepX לא דורשת עקביות בין ימים", severity: "safe" },
          { label: "מינימום יום מסחר", value: "לא קיים", detail: "ניתן לרווח הכל ביום אחד", severity: "safe" },
        ],
      },
      {
        id: "restrictions", title: "הגבלות ואיסורים", icon: Lock, color: "#ef4444",
        rules: [
          { label: "EA / בוטים", value: "מותר (בחלק מהתוכניות)", detail: "בדוק את תנאי הפלטפורמה הספציפית", severity: "warn" },
          { label: "News Trading", value: "מותר", detail: "אין הגבלה על מסחר סביב חדשות", severity: "safe" },
          { label: "Copy Trading", value: "מותר (עם אישור)", detail: "Copy Trading בין חשבונות שאינם TopstepX — מותר", severity: "safe" },
          { label: "Martingale", value: "אסור", detail: "הכפלת גודל לוט אסורה", severity: "danger" },
        ],
      },
      {
        id: "payout", title: "משיכות ותנאים", icon: Banknote, color: "#22c55e",
        rules: [
          { label: "משיכה ראשונה", value: "אחרי 15 יום מסחר ממומן", detail: "15 ימי מסחר פעיל בחשבון הממומן", severity: "neutral" },
          { label: "תדירות משיכות", value: "שבועי", detail: "ניתן לבקש משיכה כל שבוע לאחר 15 הימים", severity: "safe" },
          { label: "שיטת תשלום", value: "ACH, Wire, PayPal, Crypto", detail: "מגוון אמצעים", severity: "safe" },
        ],
      },
    ],
  },
  {
    id: "fundingpips",
    name: "Funding Pips",
    tagline: "ללא הגבלת זמן · Consistency Rule",
    country: "🇦🇪 דובאי",
    founded: "2022",
    specialty: "פורקס, מניות, קריפטו, מדדים",
    accentHex: "#3b82f6",
    borderHex: "rgba(59,130,246,0.2)",
    bgHex: "rgba(59,130,246,0.05)",
    affiliateUrl: "https://fundingpips.com?ref=zentrade",
    logoUrl: "https://www.google.com/s2/favicons?domain=fundingpips.com&sz=64",
    psychologyNote: "Funding Pips מחילה Consistency Rule — היום הכי רווחי שלך לא יכול לחרוג מ-40% מסך הרווח הכולל. סוחרים שמרוויחים הכל ביום אחד ואז מפסידים — נכשלים אפילו עם Win Rate גבוה. ZenTrade מזהה ימים 'חריגים' שמאיימים על ה-Consistency.",
    failRate: 85,
    tiers: [
      { size: "$5K",   sizeRaw: 5000,   price: 45,  phase1: { profitTarget: 8, dailyLoss: 5, maxDrawdown: 10, maxDays: null, minDays: 3 }, phase2: { profitTarget: 5, dailyLoss: 5, maxDrawdown: 10, maxDays: null, minDays: 3 }, funded: { dailyLoss: 5, maxDrawdown: 10, profitSplit: 85 } },
      { size: "$10K",  sizeRaw: 10000,  price: 75,  phase1: { profitTarget: 8, dailyLoss: 5, maxDrawdown: 10, maxDays: null, minDays: 3 }, phase2: { profitTarget: 5, dailyLoss: 5, maxDrawdown: 10, maxDays: null, minDays: 3 }, funded: { dailyLoss: 5, maxDrawdown: 10, profitSplit: 85 } },
      { size: "$25K",  sizeRaw: 25000,  price: 150, phase1: { profitTarget: 8, dailyLoss: 5, maxDrawdown: 10, maxDays: null, minDays: 3 }, phase2: { profitTarget: 5, dailyLoss: 5, maxDrawdown: 10, maxDays: null, minDays: 3 }, funded: { dailyLoss: 5, maxDrawdown: 10, profitSplit: 85 } },
      { size: "$50K",  sizeRaw: 50000,  price: 245, phase1: { profitTarget: 8, dailyLoss: 5, maxDrawdown: 10, maxDays: null, minDays: 3 }, phase2: { profitTarget: 5, dailyLoss: 5, maxDrawdown: 10, maxDays: null, minDays: 3 }, funded: { dailyLoss: 5, maxDrawdown: 10, profitSplit: 85 } },
      { size: "$100K", sizeRaw: 100000, price: 430, phase1: { profitTarget: 8, dailyLoss: 5, maxDrawdown: 10, maxDays: null, minDays: 3 }, phase2: { profitTarget: 5, dailyLoss: 5, maxDrawdown: 10, maxDays: null, minDays: 3 }, funded: { dailyLoss: 5, maxDrawdown: 10, profitSplit: 85 } },
    ],
    ruleSections: [
      {
        id: "targets", title: "יעדי רווח", icon: Target, color: "#22c55e",
        rules: [
          { label: "יעד רווח — פאזה 1", value: "8%", severity: "neutral" },
          { label: "יעד רווח — פאזה 2", value: "5%", severity: "safe" },
          { label: "פיצול רווח", value: "85%", severity: "safe" },
        ],
      },
      {
        id: "drawdown", title: "מגבלות Drawdown", icon: TrendingDown, color: "#ef4444",
        rules: [
          { label: "הפסד יומי מקסימלי", value: "5% סטטי מהיתרה ההתחלתית", detail: "מחושב מה-Balance הקבוע — לא מה-Equity של היום", severity: "warn" },
          { label: "Drawdown כולל מקסימלי", value: "10% סטטי", severity: "warn" },
          { label: "סוג Drawdown", value: "Static", severity: "safe" },
        ],
      },
      {
        id: "consistency", title: "⚠ כלל עקביות (חשוב!)", icon: BarChart3, color: "#f59e0b",
        rules: [
          { label: "Consistency Rule", value: "יום מסחר מקסימלי ≤ 40% מסה״כ הרווח", detail: "⚠ אם הרווחת $800 ב-1 יום מתוך $1000 סה״כ — הפרת את הכלל!", severity: "danger" },
          { label: "מינימום ימי מסחר", value: "3 ימים בכל פאזה", severity: "neutral" },
          { label: "מגבלת זמן", value: "אין! נסחר בקצב שלך", severity: "safe" },
        ],
      },
      {
        id: "restrictions", title: "הגבלות ואיסורים", icon: Lock, color: "#ef4444",
        rules: [
          { label: "EA / אוטומציה", value: "מותר (לא HFT)", severity: "safe" },
          { label: "News Trading", value: "מותר", severity: "safe" },
          { label: "Martingale", value: "אסור", severity: "danger" },
          { label: "Copy Trading", value: "מותר", severity: "safe" },
        ],
      },
      {
        id: "payout", title: "משיכות", icon: Banknote, color: "#22c55e",
        rules: [
          { label: "משיכה ראשונה", value: "לאחר 14 יום ממומן", severity: "neutral" },
          { label: "תדירות", value: "כל 14 יום", severity: "safe" },
          { label: "שיטת תשלום", value: "Crypto, Wire, PayPal", severity: "safe" },
        ],
      },
    ],
  },
  {
    id: "thefundedtrader",
    name: "The Funded Trader",
    tagline: "Scaling עד $1.5M · Swing ו-Day Trading",
    country: "🇺🇸 ארה״ב",
    founded: "2021",
    specialty: "פורקס, מדדים, סחורות, קריפטו",
    accentHex: "#f59e0b",
    borderHex: "rgba(245,158,11,0.2)",
    bgHex: "rgba(245,158,11,0.05)",
    affiliateUrl: "https://thefundedtrader.com?ref=zentrade",
    badge: "📈 Scaling Plan",
    logoUrl: "https://www.google.com/s2/favicons?domain=thefundedtrader.com&sz=64",
    psychologyNote: "TFT מחייבת מינימום 5 ימי מסחר — וכאן טמון הכישלון. סוחרים שמרוויחים מהר ורוצים לסיים מוקדם מדי מוצאים שהם חייבים 'למלא' ימים — ואז עושים עסקאות בורדום. ZenTrade מנהל את לוח הזמנים שלך ומתריע כשאתה מסחר 'ללא Setup'.",
    failRate: 89,
    tiers: [
      { size: "$25K",  sizeRaw: 25000,  price: 210, phase1: { profitTarget: 10, dailyLoss: 4, maxDrawdown: 8, maxDays: 35, minDays: 5 }, phase2: { profitTarget: 5, dailyLoss: 4, maxDrawdown: 8, maxDays: 60, minDays: 5 }, funded: { dailyLoss: 4, maxDrawdown: 8, profitSplit: 80 } },
      { size: "$50K",  sizeRaw: 50000,  price: 340, phase1: { profitTarget: 10, dailyLoss: 4, maxDrawdown: 8, maxDays: 35, minDays: 5 }, phase2: { profitTarget: 5, dailyLoss: 4, maxDrawdown: 8, maxDays: 60, minDays: 5 }, funded: { dailyLoss: 4, maxDrawdown: 8, profitSplit: 80 } },
      { size: "$100K", sizeRaw: 100000, price: 540, phase1: { profitTarget: 10, dailyLoss: 4, maxDrawdown: 8, maxDays: 35, minDays: 5 }, phase2: { profitTarget: 5, dailyLoss: 4, maxDrawdown: 8, maxDays: 60, minDays: 5 }, funded: { dailyLoss: 4, maxDrawdown: 8, profitSplit: 80 } },
      { size: "$200K", sizeRaw: 200000, price: 970, phase1: { profitTarget: 10, dailyLoss: 4, maxDrawdown: 8, maxDays: 35, minDays: 5 }, phase2: { profitTarget: 5, dailyLoss: 4, maxDrawdown: 8, maxDays: 60, minDays: 5 }, funded: { dailyLoss: 4, maxDrawdown: 8, profitSplit: 80 } },
    ],
    ruleSections: [
      { id: "targets", title: "יעדי רווח", icon: Target, color: "#22c55e", rules: [
        { label: "יעד פאזה 1", value: "10%", severity: "neutral" },
        { label: "יעד פאזה 2", value: "5%", severity: "safe" },
        { label: "פיצול רווח", value: "80% → 90%", detail: "Scaling Plan מעלה את הפיצול ל-90%", severity: "safe" },
        { label: "Scaling עד", value: "$1,500,000", severity: "safe" },
      ]},
      { id: "drawdown", title: "מגבלות Drawdown", icon: TrendingDown, color: "#ef4444", rules: [
        { label: "הפסד יומי מקסימלי", value: "4% (נמוך!)", detail: "⚠ 4% בלבד — מחמיר יותר מהמתחרים", severity: "danger" },
        { label: "Drawdown כולל", value: "8%", severity: "warn" },
        { label: "סוג", value: "Static EOD", severity: "safe" },
      ]},
      { id: "trading", title: "כללי מסחר", icon: Activity, color: "#60a5fa", rules: [
        { label: "מינימום ימים — פאזה 1", value: "5 ימים", severity: "warn" },
        { label: "מקסימום ימים — פאזה 1", value: "35 ימים", severity: "warn" },
        { label: "מינימום ימים — פאזה 2", value: "5 ימים", severity: "warn" },
        { label: "מקסימום ימים — פאזה 2", value: "60 ימים", severity: "warn" },
        { label: "Funded — זמן", value: "ללא הגבלה", severity: "safe" },
      ]},
      { id: "restrictions", title: "הגבלות", icon: Lock, color: "#ef4444", rules: [
        { label: "EA / אוטומציה", value: "מותר", severity: "safe" },
        { label: "News Trading", value: "מותר", severity: "safe" },
        { label: "Martingale", value: "אסור", severity: "danger" },
      ]},
      { id: "payout", title: "משיכות", icon: Banknote, color: "#22c55e", rules: [
        { label: "משיכה ראשונה", value: "לאחר 30 יום", severity: "neutral" },
        { label: "תדירות", value: "כל 14 יום", severity: "safe" },
        { label: "תשלום", value: "Crypto, Wire, PayPal", severity: "safe" },
      ]},
    ],
  },
  {
    id: "alphacapital",
    name: "Alpha Capital Group",
    tagline: "מימון מיידי · חד-שלבי · ללא הגבלת זמן",
    country: "🇬🇧 בריטניה",
    founded: "2021",
    specialty: "פורקס, מדדים, מניות, סחורות",
    accentHex: "#f43f5e",
    borderHex: "rgba(244,63,94,0.2)",
    bgHex: "rgba(244,63,94,0.05)",
    affiliateUrl: "https://alphacapitalgroup.uk?ref=zentrade",
    logoUrl: "https://www.google.com/s2/favicons?domain=alphacapitalgroup.uk&sz=64",
    psychologyNote: "Alpha Capital מציעה מסלול חד-שלבי שנראה קל — 10% Target ללא לחץ זמן. הבעיה: בלי פאזה 2, סוחרים לא מפתחים ממשמעת ארוכת טווח. הם 'מרגישים קל' ולוקחים סיכונים גבוהים. ZenTrade מחייב אותך לכתוב Post-Trade Review גם כשאתה בפאזה חד-שלבית.",
    failRate: 82,
    tiers: [
      { size: "$10K",  sizeRaw: 10000,  price: 79,  phase1: { profitTarget: 10, dailyLoss: 5, maxDrawdown: 10, maxDays: null, minDays: 1 }, funded: { dailyLoss: 5, maxDrawdown: 10, profitSplit: 80 } },
      { size: "$25K",  sizeRaw: 25000,  price: 149, phase1: { profitTarget: 10, dailyLoss: 5, maxDrawdown: 10, maxDays: null, minDays: 1 }, funded: { dailyLoss: 5, maxDrawdown: 10, profitSplit: 80 } },
      { size: "$50K",  sizeRaw: 50000,  price: 249, phase1: { profitTarget: 10, dailyLoss: 5, maxDrawdown: 10, maxDays: null, minDays: 1 }, funded: { dailyLoss: 5, maxDrawdown: 10, profitSplit: 80 } },
      { size: "$100K", sizeRaw: 100000, price: 449, phase1: { profitTarget: 10, dailyLoss: 5, maxDrawdown: 10, maxDays: null, minDays: 1 }, funded: { dailyLoss: 5, maxDrawdown: 10, profitSplit: 80 } },
    ],
    ruleSections: [
      { id: "targets", title: "יעדי רווח", icon: Target, color: "#22c55e", rules: [
        { label: "יעד רווח (חד-שלבי)", value: "10%", detail: "פאזה אחת בלבד — הגיע ל-10% ואתה ממומן", severity: "neutral" },
        { label: "פיצול רווח", value: "80%", severity: "safe" },
      ]},
      { id: "drawdown", title: "מגבלות Drawdown", icon: TrendingDown, color: "#ef4444", rules: [
        { label: "הפסד יומי", value: "5%", severity: "warn" },
        { label: "Drawdown כולל", value: "10%", severity: "warn" },
        { label: "סוג", value: "Static EOD", severity: "safe" },
      ]},
      { id: "trading", title: "כללי מסחר", icon: Activity, color: "#60a5fa", rules: [
        { label: "מינימום ימים", value: "1 יום בלבד", severity: "safe" },
        { label: "מגבלת זמן", value: "אין", severity: "safe" },
        { label: "News Trading", value: "מותר", severity: "safe" },
        { label: "Overnight", value: "מותר", severity: "safe" },
      ]},
      { id: "restrictions", title: "הגבלות", icon: Lock, color: "#ef4444", rules: [
        { label: "EA / אוטומציה", value: "מותר", severity: "safe" },
        { label: "Martingale", value: "אסור", severity: "danger" },
        { label: "HFT", value: "אסור", severity: "danger" },
      ]},
      { id: "payout", title: "משיכות", icon: Banknote, color: "#22c55e", rules: [
        { label: "משיכה ראשונה", value: "לאחר 30 יום", severity: "neutral" },
        { label: "תדירות", value: "כל 14 יום", severity: "safe" },
      ]},
    ],
  },
];

/* ═══════════════════════════════════════════════════════════
   ACTIVE CHALLENGE (localStorage)
═══════════════════════════════════════════════════════════ */
const LS_KEY = "zentrade-nostro-challenge";

export interface ActiveChallenge {
  firmId: string;
  firmName: string;
  accentHex: string;
  tierSize: string;
  tierSizeRaw: number;
  phase: 1 | 2;
  startDate: string;
  currentPnL: number;
  dailyPnL: number;
  dailyLossLimit: number;
  maxDrawdownLimit: number;
  profitTarget: number;
}

export const loadChallenge = (): ActiveChallenge | null => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); }
  catch { return null; }
};

export const saveChallenge = (c: ActiveChallenge | null) => {
  if (c) localStorage.setItem(LS_KEY, JSON.stringify(c));
  else localStorage.removeItem(LS_KEY);
};

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const fmt = (n: number) => `$${n.toLocaleString()}`;
const pct = (n: number) => `${n}%`;

const severityStyle = (s?: RuleItem["severity"]) => {
  switch (s) {
    case "danger":  return { dot: "#ef4444", text: "text-red-400/70" };
    case "warn":    return { dot: "#f59e0b", text: "text-amber-400/70" };
    case "safe":    return { dot: "#22c55e", text: "text-emerald-400/60" };
    default:        return { dot: "rgba(96,165,250,0.6)", text: "text-white/50" };
  }
};

/* ═══════════════════════════════════════════════════════════
   FIRM LIST CARD (Left Panel)
═══════════════════════════════════════════════════════════ */
const FirmListCard = ({
  firm, selected, hasChallenge, onClick,
}: { firm: PropFirm; selected: boolean; hasChallenge: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-full text-right rounded-2xl border p-4 transition-all duration-300 group"
    style={{
      borderColor: selected ? firm.accentHex + "60" : hasChallenge ? firm.accentHex + "30" : "rgba(255,255,255,0.06)",
      background: selected ? firm.bgHex : "rgba(255,255,255,0.02)",
      boxShadow: selected ? `0 0 24px ${firm.accentHex}15` : undefined,
    }}
  >
    <div className="flex items-center gap-3">
      {/* Logo / Initials badge */}
      <div className="h-10 w-10 rounded-xl flex items-center justify-center overflow-hidden border shrink-0"
        style={{ background: firm.accentHex + "15", borderColor: firm.borderHex }}>
        {firm.logoUrl
          ? <img src={firm.logoUrl} alt={firm.name} className="h-7 w-7 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          : <span className="text-[13px] font-black" style={{ color: firm.accentHex }}>{firm.name.slice(0, 2).toUpperCase()}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[13px] font-black text-white truncate">{firm.name}</span>
          {firm.badge && <span className="text-[8px] shrink-0">{firm.badge.split(" ")[0]}</span>}
          {hasChallenge && <span className="h-1.5 w-1.5 rounded-full animate-pulse shrink-0" style={{ background: firm.accentHex }} />}
        </div>
        <p className="text-[9px] text-white/25 font-mono truncate">{firm.country} · {firm.specialty}</p>
      </div>
      <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${selected ? "text-white/50 rotate-90" : "text-white/20 group-hover:text-white/40"}`} />
    </div>

    {/* Fail rate pill */}
    <div className="mt-3 flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-red-600/70 to-red-400/70" style={{ width: `${firm.failRate}%` }} />
      </div>
      <span className="text-[8px] font-mono text-red-400/50">{firm.failRate}% נכשלים</span>
    </div>
  </button>
);

/* ═══════════════════════════════════════════════════════════
   TIER COMPARISON TABLE
═══════════════════════════════════════════════════════════ */
const TierTable = ({ firm, selectedTierIdx, onSelect }: {
  firm: PropFirm; selectedTierIdx: number; onSelect: (i: number) => void;
}) => (
  <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
    {/* Header */}
    <div className="grid text-[9px] font-bold font-mono text-white/20 uppercase tracking-wider bg-white/[0.03]"
      style={{ gridTemplateColumns: "1fr 0.8fr 0.8fr 0.8fr 0.8fr 0.7fr" }}>
      {["גודל חשבון","מחיר","הפסד יומי","Max DD","יעד P1","פיצול"].map(h => (
        <div key={h} className="px-3 py-2.5 border-l border-white/[0.04] first:border-l-0 text-center">{h}</div>
      ))}
    </div>
    {/* Rows */}
    {firm.tiers.map((tier, i) => {
      const isSelected = i === selectedTierIdx;
      const dailyAmt = (tier.phase1.dailyLoss / 100) * tier.sizeRaw;
      const ddAmt = (tier.phase1.maxDrawdown / 100) * tier.sizeRaw;
      return (
        <div
          key={tier.size}
          onClick={() => onSelect(i)}
          className="grid text-[11px] font-mono border-t border-white/[0.04] cursor-pointer transition-all"
          style={{
            gridTemplateColumns: "1fr 0.8fr 0.8fr 0.8fr 0.8fr 0.7fr",
            background: isSelected ? firm.accentHex + "0d" : undefined,
          }}
        >
          <div className="px-3 py-3 font-black" style={{ color: isSelected ? firm.accentHex : "rgba(255,255,255,0.6)" }}>
            {isSelected && <span className="mr-1 text-[8px]">▶</span>}{tier.size}
          </div>
          <div className="px-3 py-3 text-center text-white/40">${tier.price}</div>
          <div className="px-3 py-3 text-center text-red-400/70">{fmt(dailyAmt)}</div>
          <div className="px-3 py-3 text-center text-amber-400/70">{fmt(ddAmt)}</div>
          <div className="px-3 py-3 text-center text-emerald-400/70">{pct(tier.phase1.profitTarget)}</div>
          <div className="px-3 py-3 text-center text-white/40">{tier.funded.profitSplit}%</div>
        </div>
      );
    })}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   RULES DEEP DIVE
═══════════════════════════════════════════════════════════ */
const RulesDeepDive = ({ section }: { section: RuleSection }) => {
  const [open, setOpen] = useState(true);
  const Icon = section.icon;

  return (
    <div className="rounded-2xl border border-white/[0.05] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-white/[0.02]"
        style={{ background: section.color + "08" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center"
            style={{ background: section.color + "15", border: `1px solid ${section.color}30` }}>
            <Icon className="h-3.5 w-3.5" style={{ color: section.color }} />
          </div>
          <span className="text-[12px] font-bold text-white/70">{section.title}</span>
          <span className="text-[9px] font-mono text-white/20">{section.rules.length} כללים</span>
        </div>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-white/20" /> : <ChevronDown className="h-3.5 w-3.5 text-white/20" />}
      </button>

      {open && (
        <div className="border-t border-white/[0.04]">
          {section.rules.map((rule, idx) => {
            const s = severityStyle(rule.severity);
            return (
              <div key={idx} className={`flex items-start gap-3 px-4 py-3 ${idx > 0 ? "border-t border-white/[0.03]" : ""} hover:bg-white/[0.01] transition-colors`}>
                <div className="h-2 w-2 rounded-full mt-1.5 shrink-0" style={{ background: s.dot }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] text-white/40 font-mono leading-tight">{rule.label}</span>
                    <span className={`text-[12px] font-bold font-mono shrink-0 ${s.text}`}>{rule.value}</span>
                  </div>
                  {rule.detail && (
                    <p className="text-[10px] text-white/20 mt-0.5 leading-relaxed">{rule.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PSYCHOLOGY HOOK
═══════════════════════════════════════════════════════════ */
const PsychologyHook = ({ firm }: { firm: PropFirm }) => (
  <div className="rounded-2xl border border-red-500/15 overflow-hidden">
    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-red-500/10 bg-red-500/[0.04]">
      <Flame className="h-4 w-4 text-red-400" />
      <span className="text-[11px] font-bold text-red-400/80">למה 90% נכשלים ב-{firm.name}</span>
    </div>
    <div className="px-4 py-4 space-y-3">
      <p className="text-[13px] text-white/40 leading-relaxed">{firm.psychologyNote}</p>
      <div className="flex items-start gap-2 rounded-xl border border-blue-500/15 bg-blue-500/[0.05] px-3.5 py-3">
        <Brain className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
        <p className="text-[11px] text-white/50 leading-relaxed">
          <span className="font-bold text-blue-400">ZenTrade AI</span> מנטר את דפוסי ה-Tilt שלך, מתריע על חריגות, ומחייב אותך לכתוב Post-Trade Review — הכלי היחיד שמנגד לכישלון הפסיכולוגי.
        </p>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   AFFILIATE CTA
═══════════════════════════════════════════════════════════ */
const AffiliateCTA = ({ firm, tier, onActivate, isActive }: {
  firm: PropFirm; tier: AccountTier; onActivate: () => void; isActive: boolean;
}) => (
  <div className="rounded-2xl border p-5 space-y-4 relative overflow-hidden"
    style={{ borderColor: firm.accentHex + "30", background: `linear-gradient(135deg, ${firm.accentHex}08, rgba(0,0,0,0))` }}>
    {/* Glow */}
    <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${firm.accentHex}10, transparent 60%)` }} />

    <div className="relative z-10 space-y-3">
      <div className="text-center space-y-1">
        <p className="text-[10px] font-mono uppercase tracking-widest text-white/20">הצעד הבא שלך</p>
        <h3 className="text-[17px] font-black text-white">
          התחל Evaluation ב-{firm.name} — {tier.size}
        </h3>
        <p className="text-[11px] text-white/30">
          {tier.price && `$${tier.price} · `}
          {firm.tiers[0].phase2 ? "2 פאזות" : "חד-שלבי"} · {tier.funded.profitSplit}% פיצול רווח
        </p>
      </div>

      {/* Primary affiliate button */}
      <a
        href={firm.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 w-full rounded-2xl py-4 text-[14px] font-black text-white transition-all hover:scale-[1.02] hover:opacity-95"
        style={{ background: `linear-gradient(135deg, ${firm.accentHex}, ${firm.accentHex}bb)`, boxShadow: `0 0 40px ${firm.accentHex}35, inset 0 1px 0 rgba(255,255,255,0.15)` }}
      >
        <Zap className="h-4.5 w-4.5" />
        התחל Evaluation — {firm.name}
        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
      </a>

      {/* Trust strip */}
      <div className="flex items-center justify-center gap-1 text-[9px] font-mono text-white/15">
        <Lock className="h-2.5 w-2.5" />
        <span>קישור Affiliate מאובטח · ללא עלות נוספת · ZenTrade תומך בך</span>
      </div>

      {/* Activate in journal */}
      <div className="border-t border-white/[0.05] pt-3">
        <button
          onClick={onActivate}
          disabled={isActive}
          className="flex items-center justify-center gap-2 w-full rounded-xl border py-3 text-[12px] font-bold transition-all hover:bg-white/[0.04]"
          style={{
            borderColor: isActive ? firm.accentHex + "40" : "rgba(255,255,255,0.08)",
            color: isActive ? firm.accentHex : "rgba(255,255,255,0.4)",
          }}
        >
          {isActive ? (
            <><CheckCircle2 className="h-3.5 w-3.5" />אתגר פעיל ביומן</>
          ) : (
            <><BookOpen className="h-3.5 w-3.5" />הפעל מעקב ביומן ZenTrade</>
          )}
        </button>
        {!isActive && (
          <p className="text-center text-[9px] text-white/15 font-mono mt-1.5">
            סנכרן כללים → קבל התראות בזמן אמת על Drawdown
          </p>
        )}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   ACTIVE CHALLENGE MINI BANNER (top of detail panel)
═══════════════════════════════════════════════════════════ */
const ChallengeMiniStatus = ({ challenge, onClear }: { challenge: ActiveChallenge; onClear: () => void }) => {
  const dailyPct = Math.min(100, Math.abs(Math.min(0, challenge.dailyPnL)) / challenge.dailyLossLimit * 100);
  const totalPct = Math.min(100, Math.abs(Math.min(0, challenge.currentPnL)) / challenge.maxDrawdownLimit * 100);
  const profitPct = Math.min(100, Math.max(0, challenge.currentPnL / challenge.profitTarget * 100));
  const bar = (p: number, type: "profit" | "loss") => {
    if (type === "profit") return p > 80 ? "#22c55e" : "#60a5fa";
    return p > 80 ? "#ef4444" : p > 50 ? "#f59e0b" : "#22c55e";
  };

  return (
    <div className="rounded-2xl border mb-4 p-4 space-y-3" style={{ borderColor: challenge.accentHex + "40", background: challenge.accentHex + "08" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: challenge.accentHex }} />
          <span className="text-[10px] font-bold font-mono uppercase text-white/50 tracking-wider">אתגר פעיל · {challenge.firmName} {challenge.tierSize}</span>
        </div>
        <button onClick={onClear} className="text-white/15 hover:text-white/40 transition-colors"><X className="h-3 w-3" /></button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "יעד רווח", pct: profitPct, val: fmt(Math.round(challenge.currentPnL)), type: "profit" as const },
          { label: "הפסד יומי", pct: dailyPct,  val: fmt(Math.round(challenge.dailyLossLimit)), type: "loss" as const },
          { label: "Drawdown", pct: totalPct,   val: fmt(Math.round(challenge.maxDrawdownLimit)), type: "loss" as const },
        ].map(({ label, pct: p, val, type }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-[8px] font-mono text-white/25">
              <span>{label}</span><span>{p.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${p}%`, background: bar(p, type) }} />
            </div>
            <p className="text-[7px] text-white/15 font-mono">מגבלה: {val}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SCRAPED FIRM RESULT CARD
═══════════════════════════════════════════════════════════ */
interface ScrapedFirm {
  firmName: string;
  firmNameHe: string;
  country: string;
  specialty: string;
  summary: string;
  tiers: {
    size: string; sizeRaw: number; price: number;
    phase1ProfitTarget: number; phase1DailyLoss: number; phase1MaxDrawdown: number;
    phase1MaxDays: number | null; phase1MinDays: number;
    phase2ProfitTarget?: number; hasPhase2: boolean; profitSplit: number;
  }[];
  rules: {
    drawdownType: string; drawdownTypeHe: string;
    newsTrading: { allowed: boolean; details: string };
    overnightHolding: { allowed: boolean; details: string };
    weekendHolding: { allowed: boolean; details: string };
    consistencyRule: { exists: boolean; details: string };
    eaAllowed: { allowed: boolean; details: string };
    copyTrading: { allowed: boolean; details: string };
    martingale: { allowed: boolean; details: string };
    hft: { allowed: boolean; details: string };
    minTradingDays: string;
    timeLimitDays: string | null;
    payoutFrequency: string;
    payoutMethods: string;
    firstPayoutAfter: string;
    scalesUpTo?: string;
    additionalRules: string[];
    hiddenRisks: string[];
  };
  psychologyNote: string;
  affiliateUrl: string;
  failRate: number;
}

const AllowedBadge = ({ allowed, label }: { allowed: boolean; label?: string }) => (
  <span className={`inline-flex items-center gap-1 text-[9px] font-bold rounded-full px-2 py-0.5 ${
    allowed ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
  }`}>
    {allowed ? <ShieldCheck className="h-2.5 w-2.5" /> : <ShieldAlert className="h-2.5 w-2.5" />}
    {label || (allowed ? "מותר" : "אסור")}
  </span>
);

const ScrapedResultCard = ({
  data,
  onActivate,
  isActive,
}: { data: ScrapedFirm; onActivate: (d: ScrapedFirm) => void; isActive: boolean }) => {
  const r = data.rules;

  const newsColor = r.newsTrading.allowed ? "#22c55e" : "#ef4444";
  const newsBg    = r.newsTrading.allowed ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)";
  const newsBorder= r.newsTrading.allowed ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.3)";

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="rounded-2xl border border-blue-500/20 p-5 space-y-3" style={{ background: "rgba(59,130,246,0.05)" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-10 w-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-[13px] font-black text-blue-400">
                {data.firmName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-[18px] font-black text-white">{data.firmName}</h3>
                <p className="text-[10px] text-white/30 font-mono">{data.country} · {data.specialty}</p>
              </div>
            </div>
            <p className="text-[12px] text-white/40 leading-relaxed">{data.summary}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-mono text-red-400/60">{data.failRate}% נכשלים</p>
          </div>
        </div>
      </div>

      {/* ⚡ News Trading — the critical rule, most prominent */}
      <div className="rounded-2xl border p-4 space-y-2" style={{ borderColor: newsBorder, background: newsBg }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" style={{ color: newsColor }} />
            <span className="text-[12px] font-black text-white">מסחר בזמן דוחות (News Trading)</span>
          </div>
          <AllowedBadge allowed={r.newsTrading.allowed} label={r.newsTrading.allowed ? "מותר ✓" : "אסור ✗"} />
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{r.newsTrading.details}</p>
        {!r.newsTrading.allowed && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2">
            <ShieldAlert className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-red-400/80 font-medium">
              ZenTrade ישלח התראה כשתנסה לסחור בזמן NFP, CPI, FOMC ואירועי High Impact אחרים.
            </p>
          </div>
        )}
      </div>

      {/* Account tiers table */}
      {data.tiers.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-white/20 font-mono uppercase tracking-widest">גדלי חשבון</p>
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="grid text-[9px] font-bold font-mono text-white/20 uppercase tracking-wider bg-white/[0.03]"
              style={{ gridTemplateColumns: "1fr 0.7fr 0.8fr 0.8fr 0.7fr 0.7fr" }}>
              {["גודל","מחיר","הפסד יומי","Max DD","יעד P1","פיצול"].map(h => (
                <div key={h} className="px-2.5 py-2 text-center border-l border-white/[0.04] first:border-l-0">{h}</div>
              ))}
            </div>
            {data.tiers.map((tier, i) => (
              <div key={i} className="grid text-[11px] font-mono border-t border-white/[0.04] hover:bg-white/[0.01]"
                style={{ gridTemplateColumns: "1fr 0.7fr 0.8fr 0.8fr 0.7fr 0.7fr" }}>
                <div className="px-2.5 py-2.5 font-black text-blue-400">{tier.size}</div>
                <div className="px-2.5 py-2.5 text-center text-white/40">${tier.price}</div>
                <div className="px-2.5 py-2.5 text-center text-red-400/70">{tier.phase1DailyLoss}%</div>
                <div className="px-2.5 py-2.5 text-center text-amber-400/70">{tier.phase1MaxDrawdown}%</div>
                <div className="px-2.5 py-2.5 text-center text-emerald-400/70">{tier.phase1ProfitTarget}%</div>
                <div className="px-2.5 py-2.5 text-center text-white/40">{tier.profitSplit}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules grid */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-white/20 font-mono uppercase tracking-widest">כל הכללים בעברית</p>
        <div className="grid grid-cols-1 gap-2">
          {/* Key rule rows */}
          {[
            { label: "סוג Drawdown", value: r.drawdownTypeHe, severity: (r.drawdownType === "Trailing" ? "danger" : "safe") as RuleItem["severity"] },
            { label: "מינימום ימי מסחר", value: r.minTradingDays, severity: "neutral" as RuleItem["severity"] },
            { label: "מגבלת זמן", value: r.timeLimitDays || "אין מגבלת זמן", severity: (r.timeLimitDays ? "warn" : "safe") as RuleItem["severity"] },
            { label: "משיכה ראשונה", value: r.firstPayoutAfter, severity: "neutral" as RuleItem["severity"] },
            { label: "תדירות משיכות", value: r.payoutFrequency, severity: "safe" as RuleItem["severity"] },
            { label: "שיטות תשלום", value: r.payoutMethods, severity: "safe" as RuleItem["severity"] },
          ].map(({ label, value, severity }) => {
            const s = severityStyle(severity);
            return (
              <div key={label} className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.01] px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
                  <span className="text-[11px] text-white/35 font-mono">{label}</span>
                </div>
                <span className={`text-[11px] font-bold font-mono ${s.text}`}>{value}</span>
              </div>
            );
          })}
        </div>

        {/* Boolean rules */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "החזקה לילה", ...r.overnightHolding },
            { label: "החזקה שבוע", ...r.weekendHolding },
            { label: "EA / בוטים", ...r.eaAllowed },
            { label: "Copy Trading", ...r.copyTrading },
            { label: "Martingale", allowed: !r.martingale.allowed, details: r.martingale.details },
            { label: "HFT", allowed: !r.hft.allowed, details: r.hft.details },
          ].map(({ label, allowed, details }) => (
            <div key={label} className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30 font-mono">{label}</span>
                <AllowedBadge allowed={allowed} />
              </div>
              <p className="text-[9px] text-white/20 leading-relaxed">{details}</p>
            </div>
          ))}
        </div>

        {/* Consistency rule — highlighted if exists */}
        {r.consistencyRule.exists && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3 space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] font-bold text-amber-400">⚠ כלל עקביות קיים</span>
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed">{r.consistencyRule.details}</p>
          </div>
        )}
      </div>

      {/* Hidden risks */}
      {r.hiddenRisks?.length > 0 && (
        <div className="rounded-2xl border border-red-500/15 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-red-400" />
            <span className="text-[12px] font-bold text-red-400/80">סיכונים מוסתרים — מה שפירמות לא אומרות</span>
          </div>
          <div className="space-y-2">
            {r.hiddenRisks.map((risk, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400/60 mt-1.5 shrink-0" />
                <p className="text-[11px] text-white/40 leading-relaxed">{risk}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Psychology note */}
      <div className="rounded-2xl border border-red-500/15 overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-red-500/10 bg-red-500/[0.04]">
          <Flame className="h-4 w-4 text-red-400" />
          <span className="text-[11px] font-bold text-red-400/80">למה 90% נכשלים ב-{data.firmName}</span>
        </div>
        <div className="px-4 py-4 space-y-3">
          <p className="text-[12px] text-white/40 leading-relaxed">{data.psychologyNote}</p>
          <div className="flex items-start gap-2 rounded-xl border border-blue-500/15 bg-blue-500/[0.05] px-3.5 py-3">
            <Brain className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-white/50 leading-relaxed">
              <span className="font-bold text-blue-400">ZenTrade AI</span> מנטר את הכללים האלו בזמן אמת ומתריע לפני כל הפרה.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-blue-500/25 p-5 space-y-3 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(0,0,0,0))" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.12), transparent 60%)" }} />
        <div className="relative z-10 space-y-3">
          <a href={data.affiliateUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full rounded-2xl py-4 text-[14px] font-black text-white transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", boxShadow: "0 0 40px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
            <Zap className="h-4 w-4" />
            התחל Evaluation — {data.firmName}
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
          <button
            onClick={() => onActivate(data)}
            disabled={isActive}
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] py-3 text-[12px] font-bold text-white/40 hover:text-white/60 transition-all disabled:opacity-50"
          >
            {isActive ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />אתגר פעיל ביומן</> : <><BookOpen className="h-3.5 w-3.5" />הפעל מעקב ביומן ZenTrade</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SMART SCRAPER PANEL
═══════════════════════════════════════════════════════════ */
type ScraperState = "idle" | "loading" | "done" | "error";

const SmartScraperPanel = ({
  onActivateScraped,
  scrapedActiveId,
}: {
  onActivateScraped: (d: ScrapedFirm) => void;
  scrapedActiveId: string | null;
}) => {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<ScraperState>("idle");
  const [result, setResult] = useState<ScrapedFirm | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleScrape = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    // Basic URL validation
    if (!trimmed.startsWith("http")) {
      setErrorMsg("הכנס כתובת URL מלאה (כולל https://)");
      setState("error");
      return;
    }
    setState("loading");
    setResult(null);
    setErrorMsg("");
    try {
      const { data, error } = await supabase.functions.invoke("smooth-action", {
        body: { url: trimmed },
      });
      if (error || !data?.success) {
        setErrorMsg(data?.error || error?.message || "שגיאה לא ידועה");
        setState("error");
        return;
      }
      setResult(data.data as ScrapedFirm);
      setState("done");
    } catch (e: any) {
      setErrorMsg(e?.message || "שגיאת רשת — בדוק חיבור אינטרנט");
      setState("error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.04] p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-[15px] font-black text-white">Smart Scraper</h3>
            <p className="text-[10px] text-white/30 font-mono">חלץ כללים מכל פירמת Prop — מאיות האתר</p>
          </div>
        </div>

        <p className="text-[12px] text-white/35 leading-relaxed">
          לא רואה את הפירמה שלך ברשימה? הדבק את ה-URL של עמוד התנאים שלה (Terms / Rules / How It Works) — ה-AI יחלץ את כל הכללים ויתרגם לעברית תוך שניות.
        </p>

        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 focus-within:border-blue-500/40 transition-colors">
            <Search className="h-4 w-4 text-white/20 shrink-0" />
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleScrape()}
              placeholder="https://apextraderfunding.com/how-it-works"
              className="flex-1 bg-transparent text-[12px] text-white placeholder:text-white/15 outline-none font-mono"
              dir="ltr"
            />
            {url && (
              <button onClick={() => { setUrl(""); setState("idle"); setResult(null); }} className="text-white/20 hover:text-white/50 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={handleScrape}
            disabled={state === "loading" || !url.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold text-white transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", boxShadow: state === "loading" ? "none" : "0 0 24px rgba(59,130,246,0.35)" }}
          >
            {state === "loading" ? (
              <><Loader2 className="h-4 w-4 animate-spin" />סורק ומתרגם...</>
            ) : (
              <><Sparkles className="h-4 w-4" />סרוק וחלץ כללים בעברית</>
            )}
          </button>
        </div>

        {/* Example URLs */}
        <div className="space-y-1">
          <p className="text-[8px] font-mono text-white/15 uppercase tracking-wider">דוגמאות לכתובות:</p>
          {[
            "https://apextraderfunding.com/how-it-works",
            "https://myfundedfx.tech/terms-and-conditions",
            "https://e8markets.com/rules",
          ].map(ex => (
            <button
              key={ex}
              onClick={() => setUrl(ex)}
              className="block text-[9px] font-mono text-blue-400/40 hover:text-blue-400/70 transition-colors truncate max-w-full"
              dir="ltr"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {state === "error" && (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[12px] font-bold text-red-400">שגיאה בסריקה</p>
            <p className="text-[11px] text-white/40">{errorMsg}</p>
            <p className="text-[10px] text-white/20 font-mono">💡 נסה להדביק URL ספציפי יותר — עמוד Terms, Rules, או How It Works</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {state === "loading" && (
        <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4 animate-pulse">
          <div className="h-4 bg-white/[0.04] rounded-lg w-1/2" />
          <div className="h-3 bg-white/[0.03] rounded-lg w-3/4" />
          <div className="h-3 bg-white/[0.03] rounded-lg w-2/3" />
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-white/[0.02] rounded-xl" />)}
          </div>
          <div className="h-20 bg-white/[0.02] rounded-xl" />
          <p className="text-center text-[10px] text-white/20 font-mono">Firecrawl סורק → Claude מתרגם לעברית...</p>
        </div>
      )}

      {/* Result */}
      {state === "done" && result && (
        <ScrapedResultCard
          data={result}
          onActivate={onActivateScraped}
          isActive={scrapedActiveId === result.firmName}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
const NostroHubPage = () => {
  const [selectedFirmId, setSelectedFirmId] = useState<string>(FIRMS[0].id);
  const [selectedTierIdx, setSelectedTierIdx] = useState(1);
  const [challenge, setChallenge] = useState<ActiveChallenge | null>(loadChallenge);
  const [showConfirm, setShowConfirm] = useState(false);
  const [leftTab, setLeftTab] = useState<"library" | "scraper">("library");
  const [scrapedActiveId, setScrapedActiveId] = useState<string | null>(null);
  // Mobile: "list" shows left panel, "detail" shows right panel
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  useEffect(() => { saveChallenge(challenge); }, [challenge]);

  const firm = FIRMS.find(f => f.id === selectedFirmId) || FIRMS[0];
  const tier = firm.tiers[selectedTierIdx] || firm.tiers[0];
  const isActiveFirm = challenge?.firmId === firm.id;

  const activateFirm = () => {
    const dailyLoss  = (tier.phase1.dailyLoss / 100) * tier.sizeRaw;
    const maxDD      = (tier.phase1.maxDrawdown / 100) * tier.sizeRaw;
    const target     = (tier.phase1.profitTarget / 100) * tier.sizeRaw;
    setChallenge({
      firmId: firm.id, firmName: firm.name, accentHex: firm.accentHex,
      tierSize: tier.size, tierSizeRaw: tier.sizeRaw, phase: 1,
      startDate: new Date().toISOString(),
      currentPnL: 0, dailyPnL: 0,
      dailyLossLimit: dailyLoss, maxDrawdownLimit: maxDD, profitTarget: target,
    });
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 3000);
  };

  const activateScraped = (d: ScrapedFirm) => {
    const tier0 = d.tiers?.[0];
    if (!tier0) return;
    const dailyLoss = (tier0.phase1DailyLoss / 100) * tier0.sizeRaw;
    const maxDD     = (tier0.phase1MaxDrawdown / 100) * tier0.sizeRaw;
    const target    = (tier0.phase1ProfitTarget / 100) * tier0.sizeRaw;
    setChallenge({
      firmId: `scraped-${d.firmName}`, firmName: d.firmName, accentHex: "#3b82f6",
      tierSize: tier0.size, tierSizeRaw: tier0.sizeRaw, phase: 1,
      startDate: new Date().toISOString(),
      currentPnL: 0, dailyPnL: 0,
      dailyLossLimit: dailyLoss, maxDrawdownLimit: maxDD, profitTarget: target,
    });
    setScrapedActiveId(d.firmName);
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 3500);
  };

  const clearChallenge = () => {
    if (window.confirm("לסיים את מעקב האתגר ב-ZenTrade?")) { setChallenge(null); setScrapedActiveId(null); }
  };

  return (
    <div className="flex h-full overflow-hidden" dir="rtl">

      {/* ── LEFT: Firm List ── */}
      <div className={`${mobileView === "list" ? "flex" : "hidden"} md:flex w-full md:w-[240px] shrink-0 flex-col border-l border-white/[0.05] overflow-hidden`}>
        {/* Header */}
        <div className="px-3 pt-4 pb-3 shrink-0 border-b border-white/[0.04]">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-[13px] font-black text-white leading-none">Nostro Hub</h1>
              <p className="text-[8px] text-white/20 font-mono mt-0.5">מרכז Prop Firm</p>
            </div>
          </div>
          {challenge && (
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-400 font-mono truncate">{challenge.firmName} · {challenge.tierSize}</span>
            </div>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-2 shrink-0 border-b border-white/[0.04]">
          {[
            { id: "library", label: "ספרייה", icon: BookOpen },
            { id: "scraper", label: "Smart Scan", icon: Sparkles },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setLeftTab(t.id as typeof leftTab); if (t.id === "scraper") setMobileView("detail"); }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-bold transition-all ${
                leftTab === t.id
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-white/25 hover:text-white/50"
              }`}
            >
              <t.icon className="h-3 w-3" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Firm List */}
        {leftTab === "library" && (
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-none">
            {FIRMS.map(f => (
              <FirmListCard
                key={f.id}
                firm={f}
                selected={selectedFirmId === f.id && leftTab === "library"}
                hasChallenge={challenge?.firmId === f.id}
                onClick={() => { setSelectedFirmId(f.id); setSelectedTierIdx(1); setMobileView("detail"); }}
              />
            ))}
          </div>
        )}

        {/* Scraper tab in left panel — just the input */}
        {leftTab === "scraper" && (
          <div className="flex-1 overflow-y-auto p-3 scrollbar-none space-y-3">
            <div className="rounded-xl border border-blue-500/15 bg-blue-500/[0.04] p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <p className="text-[10px] font-bold text-blue-400">AI Smart Scraper</p>
              </div>
              <p className="text-[9px] text-white/25 leading-relaxed">חלץ כללים מכל פירמה — ראה פרטים בחלונית הימנית</p>
            </div>
            {FIRMS.map(f => (
              <button
                key={f.id}
                onClick={() => { setSelectedFirmId(f.id); setLeftTab("library"); setMobileView("detail"); }}
                className="w-full text-right text-[10px] font-mono text-white/20 hover:text-white/50 transition-colors py-1 px-2"
              >
                → {f.name}
              </button>
            ))}
          </div>
        )}

        {/* Bottom info */}
        <div className="shrink-0 border-t border-white/[0.04] p-3">
          <div className="rounded-xl border border-blue-500/10 bg-blue-500/[0.04] p-2.5 text-center space-y-0.5">
            <p className="text-[8px] font-bold text-blue-400/60 font-mono uppercase">עמלת Affiliate</p>
            <p className="text-[9px] text-white/25 leading-relaxed">כל רכישה דרך ZenTrade תומכת בפיתוח הפלטפורמה</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Detail Panel ── */}
      <div className={`${mobileView === "detail" ? "flex" : "hidden"} md:flex flex-1 flex-col overflow-hidden`}>
        {/* Mobile back button */}
        <div className="md:hidden flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.05] shrink-0">
          <button
            onClick={() => setMobileView("list")}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[12px] font-semibold text-white/60 hover:text-white transition-all"
          >
            <ChevronRight className="h-4 w-4" />
            <span>כל הפירמות</span>
          </button>
          <span className="text-[13px] font-bold text-white/80 mr-1">{firm.name}</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-none">
        <div className="p-4 space-y-4 max-w-3xl">

          {/* Confirm toast */}
          {showConfirm && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.08] px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-[12px] font-bold text-emerald-400">אתגר הופעל ביומן — תקבל התראות על הפרת כללים בזמן אמת</p>
            </div>
          )}

          {/* Smart Scraper panel — shown when scraper tab is active */}
          {leftTab === "scraper" ? (
            <SmartScraperPanel
              onActivateScraped={activateScraped}
              scrapedActiveId={scrapedActiveId}
            />
          ) : (
          <>
          {/* Active challenge mini status */}
          {isActiveFirm && challenge && (
            <ChallengeMiniStatus challenge={challenge} onClear={clearChallenge} />
          )}

          {/* Firm header */}
          <div className="rounded-2xl border p-5" style={{ borderColor: firm.borderHex, background: firm.bgHex }}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center overflow-hidden border"
                    style={{ background: firm.accentHex + "15", borderColor: firm.borderHex }}>
                    {firm.logoUrl
                      ? <img src={firm.logoUrl} alt={firm.name} className="h-9 w-9 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      : <span className="text-[15px] font-black" style={{ color: firm.accentHex }}>{firm.name.slice(0, 2).toUpperCase()}</span>
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[20px] font-black text-white">{firm.name}</h2>
                      {firm.badge && <span className="text-[10px] font-bold rounded-full px-2.5 py-1" style={{ background: firm.accentHex + "20", color: firm.accentHex }}>{firm.badge}</span>}
                    </div>
                    <p className="text-[11px] text-white/30 font-mono mt-0.5">{firm.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono text-white/20">
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{firm.country}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />מאז {firm.founded}</span>
                  <span className="flex items-center gap-1"><Activity className="h-3 w-3" />{firm.specialty}</span>
                </div>
              </div>
              <div className="text-right space-y-1 shrink-0">
                <div className="text-[11px] font-mono text-red-400/60">{firm.failRate}% נכשלים</div>
                <div className="text-[9px] text-white/15 font-mono">ממוצע תעשייתי</div>
              </div>
            </div>
          </div>

          {/* Tier comparison table */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-white/20 font-mono uppercase tracking-widest px-1">השוואת גדלי חשבון</p>
            <TierTable firm={firm} selectedTierIdx={selectedTierIdx} onSelect={setSelectedTierIdx} />
          </div>

          {/* Rules — full deep dive */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-white/20 font-mono uppercase tracking-widest px-1">כללים מלאים — A to Z</p>
            {firm.ruleSections.map((section) => (
              <RulesDeepDive key={section.id} section={section} />
            ))}
          </div>

          {/* Psychology hook */}
          <PsychologyHook firm={firm} />

          {/* Affiliate CTA */}
          <AffiliateCTA
            firm={firm}
            tier={tier}
            onActivate={activateFirm}
            isActive={isActiveFirm}
          />

          {/* Spacer */}
          <div className="h-4" />
          </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default NostroHubPage;
