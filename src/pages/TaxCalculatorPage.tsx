import { useState, useMemo } from "react";
import {
  Calculator, TrendingUp, TrendingDown, DollarSign, Percent,
  ArrowDownRight, Download, FileText, Info, CalendarDays, Loader2,
  Sparkles, Brain,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ===== PDF Generation ===== */
const generatePDF = async (data: TaxData) => {
  // Dynamic import to keep bundle lean
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 20;
  const contentW = W - margin * 2;
  let y = margin;

  // Colors
  const dark = [10, 10, 11] as [number, number, number];
  const gold = [212, 175, 55] as [number, number, number];
  const white = [240, 240, 245] as [number, number, number];
  const muted = [140, 140, 155] as [number, number, number];
  const green = [34, 197, 130] as [number, number, number];
  const red = [220, 70, 70] as [number, number, number];

  // Background
  doc.setFillColor(...dark);
  doc.rect(0, 0, W, 297, "F");

  // Header bar
  doc.setFillColor(20, 20, 22);
  doc.rect(0, 0, W, 44, "F");
  doc.setFillColor(...gold);
  doc.rect(0, 43.5, W, 0.5, "F");

  // Title
  doc.setFontSize(22);
  doc.setTextColor(...white);
  doc.text("ZenTrade", W - margin, 18, { align: "right" });
  doc.setFontSize(10);
  doc.setTextColor(...muted);
  doc.text(`Tax Report · ${data.taxYear}`, W - margin, 28, { align: "right" });
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString("he-IL")}`, margin, 28);

  y = 56;

  // Summary cards row
  const cardW = (contentW - 8) / 3;
  const cards = [
    { label: "Gross Profit", value: `+$${data.profit.toLocaleString()}`, color: green },
    { label: "Gross Loss", value: `-$${data.loss.toLocaleString()}`, color: red },
    { label: "Commissions", value: `-$${data.commissions.toLocaleString()}`, color: muted },
  ];

  cards.forEach((card, i) => {
    const x = margin + i * (cardW + 4);
    doc.setFillColor(20, 20, 22);
    doc.roundedRect(x, y, cardW, 28, 3, 3, "F");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(card.label, x + cardW / 2, y + 10, { align: "center" });
    doc.setFontSize(14);
    doc.setTextColor(...(card.color as [number, number, number]));
    doc.text(card.value, x + cardW / 2, y + 22, { align: "center" });
  });

  y += 40;

  // Detailed breakdown table
  doc.setFillColor(20, 20, 22);
  doc.roundedRect(margin, y, contentW, 120, 3, 3, "F");

  doc.setFontSize(11);
  doc.setTextColor(...white);
  doc.text("Calculation Breakdown", W - margin - 8, y + 12, { align: "right" });

  // Divider
  doc.setDrawColor(40, 40, 45);
  doc.line(margin + 8, y + 18, W - margin - 8, y + 18);

  const rows = [
    { label: "Gross Profit (רווח גולמי)", value: `+$${data.profit.toLocaleString()}`, color: green },
    { label: "Gross Loss (הפסד גולמי)", value: `-$${data.loss.toLocaleString()}`, color: red },
    { label: "Broker Commissions (עמלות)", value: `-$${data.commissions.toLocaleString()}`, color: muted },
    { label: "Net Gain Before Tax (רווח נטו)", value: `${data.netGain >= 0 ? "+" : ""}$${data.netGain.toLocaleString()}`, color: data.netGain >= 0 ? green : red, bold: true },
    { label: "Capital Gains Tax 25% (מס רווחי הון)", value: `-$${data.taxOwed.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: gold },
    { label: "Net After Tax (רווח נקי סופי)", value: `${data.netAfterTax >= 0 ? "+" : ""}$${data.netAfterTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: data.netAfterTax >= 0 ? green : red, bold: true },
  ];

  let ry = y + 28;
  rows.forEach((row, i) => {
    if ((row as any).bold) {
      doc.setFillColor(30, 30, 35);
      doc.roundedRect(margin + 6, ry - 5, contentW - 12, 14, 2, 2, "F");
    }
    doc.setFontSize(9);
    doc.setTextColor(...(row as any).bold ? white : muted);
    doc.text(row.label, W - margin - 12, ry + 2, { align: "right" });
    doc.setTextColor(...(row.color as [number, number, number]));
    doc.setFontSize((row as any).bold ? 11 : 9);
    doc.text(row.value, margin + 12, ry + 2);
    ry += 16;
  });

  y += 130;

  // Additional info
  if (data.traderName || data.brokerage) {
    doc.setFillColor(20, 20, 22);
    doc.roundedRect(margin, y, contentW, 32, 3, 3, "F");
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    if (data.traderName) {
      doc.text(`Trader: ${data.traderName}`, W - margin - 8, y + 12, { align: "right" });
    }
    if (data.brokerage) {
      doc.text(`Brokerage: ${data.brokerage}`, W - margin - 8, y + 22, { align: "right" });
    }
    y += 40;
  }

  // Disclaimer
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 90);
  const disclaimer = "This report is for estimation purposes only and does not constitute tax advice. Actual tax rates may vary based on individual circumstances. Please consult a qualified accountant.";
  doc.text(disclaimer, W / 2, 275, { align: "center", maxWidth: contentW });

  // Footer
  doc.setDrawColor(40, 40, 45);
  doc.line(margin, 285, W - margin, 285);
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text("ZenTrade · AI-Powered Trading Analytics", W / 2, 290, { align: "center" });

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

      {/* Disclaimer */}
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
