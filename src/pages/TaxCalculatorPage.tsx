import { useState, useMemo } from "react";
import {
  Calculator, TrendingUp, TrendingDown, DollarSign, Percent,
  ArrowDownRight, Download, FileText, Info, CalendarDays, Loader2,
  Sparkles, Brain,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ===== Hebrew RTL helper for jsPDF ===== */
const hebrewText = (text: string): string => {
  // jsPDF doesn't support RTL — reverse character order for Hebrew display
  // Keep LTR segments (numbers, English) in correct order
  const segments: { text: string; isRTL: boolean }[] = [];
  let current = "";
  let currentIsRTL = false;

  for (const char of text) {
    const isHeb = /[\u0590-\u05FF]/.test(char);
    const isSpace = char === " ";

    if (current === "") {
      current = char;
      currentIsRTL = isHeb;
    } else if (isSpace || isHeb === currentIsRTL) {
      current += char;
    } else {
      segments.push({ text: current, isRTL: currentIsRTL });
      current = char;
      currentIsRTL = isHeb;
    }
  }
  if (current) segments.push({ text: current, isRTL: currentIsRTL });

  // Reverse overall order for RTL context, reverse Hebrew segments internally
  const reversed = [...segments].reverse();
  return reversed
    .map((s) => (s.isRTL ? [...s.text].reverse().join("") : s.text))
    .join("");
};

/* ===== PDF Generation ===== */
const generatePDF = async (data: TaxData) => {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const margin = 18;
  const contentW = W - margin * 2;
  let y = 0;

  // Colors
  const bg = [12, 12, 18] as [number, number, number];
  const cardBg = [22, 22, 30] as [number, number, number];
  const headerBg = [16, 16, 24] as [number, number, number];
  const gold = [212, 175, 55] as [number, number, number];
  const white = [245, 245, 250] as [number, number, number];
  const muted = [130, 130, 150] as [number, number, number];
  const dimmed = [90, 90, 110] as [number, number, number];
  const green = [34, 197, 130] as [number, number, number];
  const red = [220, 70, 70] as [number, number, number];
  const cyan = [0, 210, 230] as [number, number, number];

  // Full page background
  doc.setFillColor(...bg);
  doc.rect(0, 0, W, H, "F");

  // ====== HEADER SECTION ======
  doc.setFillColor(...headerBg);
  doc.rect(0, 0, W, 52, "F");

  // Gold accent line
  doc.setFillColor(...gold);
  doc.rect(0, 51, W, 1, "F");

  // ZenTrade branding (right-aligned for RTL)
  doc.setFontSize(26);
  doc.setTextColor(...white);
  doc.setFont("helvetica", "bold");
  doc.text("ZenTrade", W - margin, 20);

  doc.setFontSize(9);
  doc.setTextColor(...gold);
  doc.text("AI-Powered Trading Analytics", W - margin, 28, { align: "right" });

  // Report title
  doc.setFontSize(13);
  doc.setTextColor(...white);
  doc.text(hebrewText("דו״ח מס רווחי הון"), W - margin, 40, { align: "right" });

  // Date & year (left side)
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text(`Tax Year: ${data.taxYear}`, margin, 22);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString("he-IL")}`, margin, 30);

  y = 62;

  // ====== TRADER INFO CARD ======
  if (data.traderName || data.brokerage) {
    doc.setFillColor(...cardBg);
    doc.roundedRect(margin, y, contentW, 28, 3, 3, "F");

    // Subtle top accent
    doc.setFillColor(...cyan);
    doc.rect(margin, y, contentW, 0.6, "F");

    doc.setFontSize(8);
    doc.setTextColor(...dimmed);
    doc.text(hebrewText("פרטי סוחר"), W - margin - 8, y + 8, { align: "right" });

    doc.setDrawColor(40, 40, 50);
    doc.line(margin + 8, y + 12, W - margin - 8, y + 12);

    let infoY = y + 20;
    doc.setFontSize(9);

    if (data.traderName) {
      doc.setTextColor(...muted);
      doc.text(hebrewText("שם:"), W - margin - 8, infoY, { align: "right" });
      doc.setTextColor(...white);
      doc.text(hebrewText(data.traderName), W - margin - 22, infoY, { align: "right" });
    }
    if (data.brokerage) {
      doc.setTextColor(...muted);
      doc.text(hebrewText("ברוקר:"), W / 2, infoY, { align: "right" });
      doc.setTextColor(...white);
      doc.text(data.brokerage, W / 2 - 18, infoY, { align: "right" });
    }

    y += 36;
  }

  // ====== SUMMARY CARDS ROW ======
  const cardGap = 4;
  const cardW = (contentW - cardGap * 2) / 3;
  const summaryCards = [
    { label: hebrewText("רווח גולמי"), value: `+$${data.profit.toLocaleString()}`, color: green, accent: [34, 197, 130] as [number, number, number] },
    { label: hebrewText("הפסד גולמי"), value: `-$${data.loss.toLocaleString()}`, color: red, accent: [220, 70, 70] as [number, number, number] },
    { label: hebrewText("עמלות ברוקר"), value: `-$${data.commissions.toLocaleString()}`, color: muted, accent: [130, 130, 150] as [number, number, number] },
  ];

  summaryCards.forEach((card, i) => {
    const x = margin + i * (cardW + cardGap);
    doc.setFillColor(...cardBg);
    doc.roundedRect(x, y, cardW, 32, 3, 3, "F");

    // Top color accent
    doc.setFillColor(...card.accent);
    doc.rect(x + 6, y, cardW - 12, 0.5, "F");

    doc.setFontSize(8);
    doc.setTextColor(...dimmed);
    doc.text(card.label, x + cardW / 2, y + 11, { align: "center" });

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...card.color);
    doc.text(card.value, x + cardW / 2, y + 24, { align: "center" });
    doc.setFont("helvetica", "normal");
  });

  y += 42;

  // ====== DETAILED BREAKDOWN TABLE ======
  doc.setFillColor(...cardBg);
  doc.roundedRect(margin, y, contentW, 130, 3, 3, "F");

  // Gold accent
  doc.setFillColor(...gold);
  doc.rect(margin, y, contentW, 0.6, "F");

  // Section title
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...white);
  doc.text(hebrewText("פירוט חישוב מס"), W - margin - 10, y + 14, { align: "right" });
  doc.setFont("helvetica", "normal");

  doc.setDrawColor(40, 40, 50);
  doc.line(margin + 10, y + 20, W - margin - 10, y + 20);

  const tableRows = [
    { label: hebrewText("רווח גולמי"), value: `+$${data.profit.toLocaleString()}`, color: green },
    { label: hebrewText("הפסד גולמי"), value: `-$${data.loss.toLocaleString()}`, color: red },
    { label: hebrewText("עמלות ברוקר"), value: `-$${data.commissions.toLocaleString()}`, color: muted },
    { label: "", value: "", color: muted, divider: true },
    { label: hebrewText("רווח נטו לפני מס"), value: `${data.netGain >= 0 ? "+" : ""}$${data.netGain.toLocaleString()}`, color: data.netGain >= 0 ? green : red, bold: true },
    { label: hebrewText("מס רווחי הון (25%)"), value: `-$${data.taxOwed.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: gold },
    { label: "", value: "", color: muted, divider: true },
    { label: hebrewText("רווח נקי סופי"), value: `${data.netAfterTax >= 0 ? "+" : ""}$${data.netAfterTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: data.netAfterTax >= 0 ? green : red, bold: true, highlight: true },
  ];

  let ry = y + 30;
  tableRows.forEach((row) => {
    if ((row as any).divider) {
      doc.setDrawColor(35, 35, 45);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(margin + 12, ry, W - margin - 12, ry);
      doc.setLineDashPattern([], 0);
      ry += 4;
      return;
    }

    if ((row as any).highlight) {
      doc.setFillColor(30, 30, 40);
      doc.roundedRect(margin + 8, ry - 6, contentW - 16, 16, 2, 2, "F");
      // Gold border for final result
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin + 8, ry - 6, contentW - 16, 16, 2, 2, "S");
      doc.setLineWidth(0.2);
    } else if ((row as any).bold) {
      doc.setFillColor(28, 28, 38);
      doc.roundedRect(margin + 8, ry - 6, contentW - 16, 14, 2, 2, "F");
    }

    // Label (right side for RTL)
    doc.setFontSize((row as any).bold ? 10 : 9);
    doc.setTextColor(...((row as any).bold ? white : muted));
    doc.setFont("helvetica", (row as any).bold ? "bold" : "normal");
    doc.text(row.label, W - margin - 14, ry + 2, { align: "right" });

    // Value (left side)
    doc.setFontSize((row as any).bold ? 12 : 10);
    doc.setTextColor(...(row.color as [number, number, number]));
    doc.setFont("helvetica", "bold");
    doc.text(row.value, margin + 14, ry + 2);
    doc.setFont("helvetica", "normal");

    ry += (row as any).highlight ? 18 : 15;
  });

  y += 140;

  // ====== EFFECTIVE RATE BADGE ======
  const effectiveRate = data.profit > 0 ? ((data.taxOwed / data.profit) * 100).toFixed(1) : "0.0";
  doc.setFillColor(...cardBg);
  doc.roundedRect(margin, y, contentW, 22, 3, 3, "F");
  doc.setFillColor(...cyan);
  doc.rect(margin, y, contentW, 0.4, "F");

  doc.setFontSize(9);
  doc.setTextColor(...dimmed);
  doc.text(hebrewText("שיעור מס אפקטיבי"), W - margin - 10, y + 14, { align: "right" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...cyan);
  doc.text(`${effectiveRate}%`, margin + 14, y + 14);
  doc.setFont("helvetica", "normal");

  y += 30;

  // ====== DISCLAIMER ======
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 85);
  const disclaimerLines = [
    hebrewText("מחשבון זה הינו לצורכי הערכה בלבד ואינו מהווה ייעוץ מס."),
    hebrewText("שיעור המס בפועל עשוי להשתנות. מומלץ להתייעץ עם רואה חשבון מוסמך."),
  ];
  disclaimerLines.forEach((line, i) => {
    doc.text(line, W / 2, y + i * 5, { align: "center" });
  });

  // ====== FOOTER ======
  doc.setDrawColor(40, 40, 50);
  doc.line(margin, H - 14, W - margin, H - 14);
  doc.setFontSize(7);
  doc.setTextColor(...dimmed);
  doc.text("ZenTrade · AI-Powered Trading Analytics · zentrade.app", W / 2, H - 8, { align: "center" });

  doc.save(`ZenTrade_Tax_Report_${data.taxYear}.pdf`);
};

/* ===== Types ===== */
interface TaxData {
  profit: number;
  loss: number;
  commissions: number;
  netGain: number;
  taxOwed: number;
  netAfterTax: number;
  taxYear: string;
  traderName: string;
  brokerage: string;
}

/* ===== Component ===== */
const TaxCalculatorPage = () => {
  const [grossProfit, setGrossProfit] = useState("12500");
  const [grossLoss, setGrossLoss] = useState("4200");
  const [commissions, setCommissions] = useState("380");
  const [taxYear, setTaxYear] = useState("2026");
  const [traderName, setTraderName] = useState("");
  const [brokerage, setBrokerage] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const calc = useMemo(() => {
    const profit = parseFloat(grossProfit) || 0;
    const loss = parseFloat(grossLoss) || 0;
    const comm = parseFloat(commissions) || 0;
    const netGain = profit - loss - comm;
    const taxOwed = netGain > 0 ? netGain * 0.25 : 0;
    const netAfterTax = netGain - taxOwed;
    return { profit, loss, comm, netGain, taxOwed, netAfterTax };
  }, [grossProfit, grossLoss, commissions]);

  const effectiveRate = calc.profit > 0
    ? ((calc.taxOwed / calc.profit) * 100).toFixed(1)
    : "0.0";

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await generatePDF({
        profit: calc.profit,
        loss: calc.loss,
        commissions: calc.comm,
        netGain: calc.netGain,
        taxOwed: calc.taxOwed,
        netAfterTax: calc.netAfterTax,
        taxYear,
        traderName,
        brokerage,
      });
    } catch {
      // silently fail
    } finally {
      setDownloading(false);
    }
  };

  const handleAiCoach = async () => {
    setAiLoading(true);
    setAiAdvice("");
    try {
      const { data, error } = await supabase.functions.invoke("tax-ai-coach", {
        body: { profit: calc.profit, loss: calc.loss, commissions: calc.comm },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiAdvice(data.advice);
    } catch (e: any) {
      toast.error(e.message || "שגיאה בניתוח AI");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[900px]">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
            <Calculator className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">מחשבון מס רווחי הון</h1>
            <p className="text-[11px] md:text-xs text-muted-foreground/50">חישוב מס 25% על רווחי הון בישראל</p>
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 px-5 py-2.5 text-xs font-bold text-accent transition-all hover:bg-accent/20 active:scale-[0.97] disabled:opacity-50"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {downloading ? "מייצר PDF..." : "הורד דו״ח PDF"}
        </button>
      </div>

      {/* Trader Info + Year */}
      <div className="glass-card p-5 md:p-6 mb-4">
        <h2 className="text-[13px] font-bold text-foreground mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent/60" />
          פרטי סוחר
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-2xs font-semibold text-muted-foreground/50 mb-1.5 block">שם הסוחר (אופציונלי)</label>
            <input
              type="text"
              value={traderName}
              onChange={(e) => setTraderName(e.target.value)}
              placeholder="ישראל ישראלי"
              className="w-full rounded-xl border border-border bg-white/[0.03] px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/30 transition-all min-h-[48px]"
            />
          </div>
          <div>
            <label className="text-2xs font-semibold text-muted-foreground/50 mb-1.5 block">ברוקר (אופציונלי)</label>
            <input
              type="text"
              value={brokerage}
              onChange={(e) => setBrokerage(e.target.value)}
              placeholder="Interactive Brokers"
              className="w-full rounded-xl border border-border bg-white/[0.03] px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/30 transition-all min-h-[48px]"
            />
          </div>
          <div>
            <label className="text-2xs font-semibold text-muted-foreground/50 mb-1.5 block flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              שנת מס
            </label>
            <select
              value={taxYear}
              onChange={(e) => setTaxYear(e.target.value)}
              className="w-full rounded-xl border border-border bg-white/[0.03] px-4 py-3 text-[13px] text-foreground outline-none focus:border-primary/30 transition-all min-h-[48px] appearance-none cursor-pointer"
            >
              {["2026", "2025", "2024", "2023"].map((y) => (
                <option key={y} value={y} className="bg-card text-foreground">{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Financial Inputs */}
      <div className="glass-card p-5 md:p-6 mb-4">
        <h2 className="text-[13px] font-bold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-accent/60" />
          נתוני מסחר
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="רווח גולמי ($)"
            value={grossProfit}
            onChange={setGrossProfit}
            icon={<TrendingUp className="h-4 w-4 text-profit/30" />}
            borderColor="border-profit/15"
            bgColor="bg-profit/[0.03]"
          />
          <InputField
            label="הפסד גולמי ($)"
            value={grossLoss}
            onChange={setGrossLoss}
            icon={<TrendingDown className="h-4 w-4 text-loss/30" />}
            borderColor="border-loss/15"
            bgColor="bg-loss/[0.03]"
          />
          <InputField
            label="עמלות ברוקר ($)"
            value={commissions}
            onChange={setCommissions}
            icon={<ArrowDownRight className="h-4 w-4 text-muted-foreground/20" />}
            borderColor="border-white/[0.08]"
            bgColor="bg-white/[0.03]"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="רווח גולמי" value={`+$${calc.profit.toLocaleString()}`} color="text-profit" icon={<TrendingUp className="h-4 w-4 text-profit" />} />
        <StatCard label="הפסד גולמי" value={`-$${calc.loss.toLocaleString()}`} color="text-loss" icon={<TrendingDown className="h-4 w-4 text-loss" />} />
        <StatCard label="מס (25%)" value={`$${calc.taxOwed.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="text-accent" icon={<Percent className="h-4 w-4 text-accent" />} sub={`שיעור אפקטיבי: ${effectiveRate}%`} />
        <StatCard
          label="רווח נקי"
          value={`${calc.netAfterTax >= 0 ? "+" : ""}$${calc.netAfterTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          color={calc.netAfterTax >= 0 ? "text-profit" : "text-loss"}
          icon={<DollarSign className={`h-4 w-4 ${calc.netAfterTax >= 0 ? "text-profit" : "text-loss"}`} />}
          highlight
        />
      </div>

      {/* Breakdown */}
      <div className="glass-card p-5">
        <h3 className="text-[12px] font-bold text-foreground mb-4 font-mono flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-accent/50" />
          פירוט חישוב
        </h3>
        <div className="space-y-2">
          {[
            { label: "רווח גולמי", value: `+$${calc.profit.toLocaleString()}`, color: "text-profit" },
            { label: "הפסד גולמי", value: `-$${calc.loss.toLocaleString()}`, color: "text-loss" },
            { label: "עמלות ברוקר", value: `-$${calc.comm.toLocaleString()}`, color: "text-muted-foreground" },
            { label: "רווח נטו לפני מס", value: `${calc.netGain >= 0 ? "+" : ""}$${calc.netGain.toLocaleString()}`, color: calc.netGain >= 0 ? "text-profit" : "text-loss", bold: true },
            { label: "מסרווחי הון (25%)", value: `-$${calc.taxOwed.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "text-accent" },
            { label: "רווח נקי סופי", value: `${calc.netAfterTax >= 0 ? "+" : ""}$${calc.netAfterTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: calc.netAfterTax >= 0 ? "text-profit" : "text-loss", bold: true },
          ].map((row, i) => (
            <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors ${row.bold ? "bg-white/[0.04] border border-white/[0.06]" : "bg-white/[0.02] hover:bg-white/[0.03]"}`}>
              <span className={`text-[12px] ${row.bold ? "font-bold text-foreground" : "text-muted-foreground/60"}`}>{row.label}</span>
              <span className={`text-[13px] font-bold font-mono ${row.color}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Coach */}
      <div className="mt-4 flex flex-col items-center gap-4">
        <button
          onClick={handleAiCoach}
          disabled={aiLoading}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 px-6 py-3 text-sm font-bold text-foreground transition-all hover:from-primary/30 hover:to-accent/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
        >
          {aiLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>חושב...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-primary" />
              <span>✨ נתח יעילות (AI)</span>
            </>
          )}
        </button>

        {aiAdvice && (
          <div className="w-full rounded-2xl border border-primary/20 bg-primary/[0.05] p-5 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.2)] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider mb-1.5">AI Efficiency Coach</p>
                <p className="text-[13px] text-foreground/80 leading-relaxed">{aiAdvice}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 rounded-xl border border-white/[0.04] bg-white/[0.01] p-4">
        <p className="text-2xs text-muted-foreground/30 leading-relaxed">
          ⚠️ מחשבון זה הינו לצורכי הערכה בלבד ואינו מהווה ייעוץ מס. שיעור המס בפועל עשוי להשתנות בהתאם לנסיבות אישיות.
          מומלץ להתייעץ עם רואה חשבון מוסמך. הדו"ח הינו כלי עזר בלבד ואין להסתמך עליו כמסמך רשמי.
        </p>
      </div>
    </div>
  );
};

/* ===== Sub-Components ===== */

const InputField = ({ label, value, onChange, icon, borderColor, bgColor }: {
  label: string; value: string; onChange: (v: string) => void;
  icon: React.ReactNode; borderColor: string; bgColor: string;
}) => (
  <div>
    <label className="text-2xs font-semibold text-muted-foreground/50 mb-1.5 block font-mono uppercase">{label}</label>
    <div className="relative">
      <div className="absolute right-3 top-1/2 -translate-y-1/2">{icon}</div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border ${borderColor} ${bgColor} pl-4 pr-10 py-3 text-[14px] font-bold text-foreground font-mono outline-none focus:border-primary/30 transition-all min-h-[48px]`}
      />
    </div>
  </div>
);

const StatCard = ({ label, value, color, icon, sub, highlight }: {
  label: string; value: string; color: string; icon: React.ReactNode; sub?: string; highlight?: boolean;
}) => (
  <div className={`glass-card p-4 ${highlight ? "border-primary/20 ring-1 ring-primary/10" : ""}`}>
    <div className="flex items-center gap-2 mb-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05]">
        {icon}
      </div>
      <span className="text-[10px] text-muted-foreground/50">{label}</span>
    </div>
    <p className={`text-lg md:text-xl font-bold font-mono ${color}`}>{value}</p>
    {sub && <p className="text-2xs text-muted-foreground/30 mt-1">{sub}</p>}
  </div>
);

export default TaxCalculatorPage;
