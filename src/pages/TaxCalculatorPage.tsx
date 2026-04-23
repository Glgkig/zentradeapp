import { useState, useMemo } from "react";
import {
  Calculator, TrendingUp, TrendingDown, DollarSign, Percent,
  ArrowDownRight, Download, FileText, Info, CalendarDays, Loader2,
  Sparkles, Brain,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ===== PDF Generation via HTML→Canvas ===== */
const generatePDF = async (data: TaxData) => {
  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  // Create off-screen container with the PDF layout
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 794px; /* A4 at 96dpi */
    font-family: 'Heebo', 'Arial', sans-serif;
    direction: rtl;
    background: #0C0C12;
    color: #F5F5FA;
    padding: 0;
  `;

  const gold = "#D4AF37";
  const cyan = "#00D2E6";
  const greenC = "#22C583";
  const redC = "#DC4646";
  const mutedC = "#82829A";
  const cardBg = "#16161E";
  const dividerC = "#28282D";

  const netColor = data.netGain >= 0 ? greenC : redC;
  const finalColor = data.netAfterTax >= 0 ? greenC : redC;
  const effectiveRate = data.profit > 0 ? ((data.taxOwed / data.profit) * 100).toFixed(1) : "0.0";

  container.innerHTML = `
    <div style="min-height: 1123px; position: relative; padding-bottom: 60px;">
      <!-- Header -->
      <div style="background: #101018; padding: 28px 40px 24px; border-bottom: 3px solid ${gold};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="text-align: right;">
            <div style="font-size: 28px; font-weight: 900; color: #F5F5FA; letter-spacing: 1px;">ZenTrade</div>
            <div style="font-size: 11px; color: ${gold}; margin-top: 2px; font-weight: 600;">AI-Powered Trading Analytics</div>
          </div>
          <div style="text-align: left;">
            <div style="font-size: 20px; font-weight: 800; color: #F5F5FA;">דו״ח מס רווחי הון</div>
            <div style="font-size: 11px; color: ${mutedC}; margin-top: 4px;">שנת מס: ${data.taxYear} · תאריך: ${new Date().toLocaleDateString("he-IL")}</div>
          </div>
        </div>
      </div>

      <div style="padding: 28px 40px;">
        ${data.traderName || data.brokerage ? `
        <!-- Trader Info -->
        <div style="background: ${cardBg}; border-radius: 12px; padding: 18px 24px; margin-bottom: 20px; border-top: 2px solid ${cyan};">
          <div style="font-size: 11px; color: ${mutedC}; margin-bottom: 10px; font-weight: 700;">פרטי סוחר</div>
          <div style="display: flex; gap: 40px; font-size: 14px;">
            ${data.traderName ? `<div><span style="color: ${mutedC}; font-size: 12px;">שם: </span><span style="color: #F5F5FA; font-weight: 700;">${data.traderName}</span></div>` : ""}
            ${data.brokerage ? `<div><span style="color: ${mutedC}; font-size: 12px;">ברוקר: </span><span style="color: #F5F5FA; font-weight: 700;">${data.brokerage}</span></div>` : ""}
          </div>
        </div>
        ` : ""}

        <!-- Summary Cards -->
        <div style="display: flex; gap: 14px; margin-bottom: 24px;">
          <div style="flex:1; background: ${cardBg}; border-radius: 12px; padding: 20px; text-align: center; border-top: 2px solid ${greenC};">
            <div style="font-size: 12px; color: ${mutedC}; margin-bottom: 8px;">רווח גולמי</div>
            <div style="font-size: 22px; font-weight: 900; color: ${greenC};">+$${data.profit.toLocaleString()}</div>
          </div>
          <div style="flex:1; background: ${cardBg}; border-radius: 12px; padding: 20px; text-align: center; border-top: 2px solid ${redC};">
            <div style="font-size: 12px; color: ${mutedC}; margin-bottom: 8px;">הפסד גולמי</div>
            <div style="font-size: 22px; font-weight: 900; color: ${redC};">-$${data.loss.toLocaleString()}</div>
          </div>
          <div style="flex:1; background: ${cardBg}; border-radius: 12px; padding: 20px; text-align: center; border-top: 2px solid ${mutedC};">
            <div style="font-size: 12px; color: ${mutedC}; margin-bottom: 8px;">עמלות ברוקר</div>
            <div style="font-size: 22px; font-weight: 900; color: ${mutedC};">-$${data.commissions.toLocaleString()}</div>
          </div>
        </div>

        <!-- Breakdown Table -->
        <div style="background: ${cardBg}; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-top: 2px solid ${gold};">
          <div style="font-size: 15px; font-weight: 800; color: #F5F5FA; margin-bottom: 16px;">פירוט חישוב מס</div>
          <div style="border-top: 1px solid ${dividerC}; padding-top: 12px;">

            <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-radius: 8px;">
              <div style="font-size: 13px; color: ${mutedC};">רווח גולמי</div>
              <div style="font-size: 14px; font-weight: 700; color: ${greenC};">+$${data.profit.toLocaleString()}</div>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-radius: 8px;">
              <div style="font-size: 13px; color: ${mutedC};">הפסד גולמי</div>
              <div style="font-size: 14px; font-weight: 700; color: ${redC};">-$${data.loss.toLocaleString()}</div>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-radius: 8px;">
              <div style="font-size: 13px; color: ${mutedC};">עמלות ברוקר</div>
              <div style="font-size: 14px; font-weight: 700; color: ${mutedC};">-$${data.commissions.toLocaleString()}</div>
            </div>

            <div style="border-top: 1px dashed ${dividerC}; margin: 8px 0;"></div>

            <div style="display: flex; justify-content: space-between; padding: 12px; background: #1C1C26; border-radius: 8px; margin-bottom: 6px;">
              <div style="font-size: 14px; font-weight: 800; color: #F5F5FA;">רווח נטו לפני מס</div>
              <div style="font-size: 16px; font-weight: 900; color: ${netColor};">${data.netGain >= 0 ? "+" : ""}$${data.netGain.toLocaleString()}</div>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-radius: 8px;">
              <div style="font-size: 13px; color: ${mutedC};">מס רווחי הון (25%)</div>
              <div style="font-size: 14px; font-weight: 700; color: ${gold};">-$${data.taxOwed.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>

            <div style="border-top: 1px dashed ${dividerC}; margin: 8px 0;"></div>

            <div style="display: flex; justify-content: space-between; padding: 14px; background: #1C1C26; border-radius: 10px; border: 1.5px solid ${gold};">
              <div style="font-size: 15px; font-weight: 900; color: #F5F5FA;">רווח נקי סופי</div>
              <div style="font-size: 20px; font-weight: 900; color: ${finalColor};">${data.netAfterTax >= 0 ? "+" : ""}$${data.netAfterTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
          </div>
        </div>

        <!-- Effective Rate -->
        <div style="background: ${cardBg}; border-radius: 12px; padding: 16px 24px; margin-bottom: 24px; border-top: 2px solid ${cyan}; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 13px; color: ${mutedC};">שיעור מס אפקטיבי</div>
          <div style="font-size: 22px; font-weight: 900; color: ${cyan};">${effectiveRate}%</div>
        </div>

        <!-- Disclaimer -->
        <div style="text-align: center; font-size: 10px; color: #46465A; line-height: 1.8; padding: 0 20px;">
          <div>⚠️ מחשבון זה הינו לצורכי הערכה בלבד ואינו מהווה ייעוץ מס.</div>
          <div>שיעור המס בפועל עשוי להשתנות. מומלץ להתייעץ עם רואה חשבון מוסמך.</div>
        </div>
      </div>

      <!-- Footer -->
      <div style="position: absolute; bottom: 0; left: 0; right: 0; border-top: 1px solid ${dividerC}; padding: 12px 40px; text-align: center;">
        <div style="font-size: 10px; color: ${mutedC};">ZenTrade · AI-Powered Trading Analytics · zentrade.app</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: "#0C0C12",
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfW = 210;
    const pdfH = (canvas.height * pdfW) / canvas.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfW, Math.min(pdfH, 297));
    pdf.save(`ZenTrade_Tax_Report_${data.taxYear}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
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
    } catch (e) {
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
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/25 shadow-[0_0_16px_rgba(245,158,11,0.12)]">
            <div className="absolute inset-[-3px] rounded-2xl bg-accent/5 blur-md" />
            <Calculator className="relative h-5 w-5 text-accent drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
          </div>
          <div>
            <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">מחשבון מס רווחי הון</h1>
            <p className="text-[11px] md:text-xs text-muted-foreground/50">חישוב מס 25% על רווחי הון בישראל</p>
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-accent to-yellow-400 px-5 py-2.5 text-xs font-black text-[#0a0a0a] shadow-lg shadow-accent/20 hover:shadow-accent/35 hover:brightness-110 active:scale-[0.97] disabled:opacity-50 transition-all"
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
  <div className={`relative overflow-hidden rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-xl ${
    highlight
      ? "border-primary/20 bg-gradient-to-br from-primary/[0.08] to-transparent shadow-[0_0_20px_rgba(0,212,170,0.06)]"
      : color.includes("profit")
        ? "border-profit/12 bg-gradient-to-br from-profit/[0.05] to-transparent"
        : color.includes("loss")
          ? "border-loss/12 bg-gradient-to-br from-loss/[0.05] to-transparent"
          : color.includes("accent")
            ? "border-accent/12 bg-gradient-to-br from-accent/[0.05] to-transparent"
            : "border-white/[0.06] bg-white/[0.02]"
  }`}>
    <div className={`absolute top-0 left-0 right-0 h-[2px] ${
      highlight ? "bg-gradient-to-l from-transparent via-primary/50 to-transparent" :
      color.includes("profit") ? "bg-gradient-to-l from-transparent via-profit/40 to-transparent" :
      color.includes("loss") ? "bg-gradient-to-l from-transparent via-loss/40 to-transparent" :
      color.includes("accent") ? "bg-gradient-to-l from-transparent via-accent/40 to-transparent" :
      "bg-gradient-to-l from-transparent via-white/10 to-transparent"
    }`} />
    <div className="flex items-center gap-2 mb-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05]">
        {icon}
      </div>
      <span className="text-[10px] text-muted-foreground/50">{label}</span>
    </div>
    <p className={`text-lg md:text-xl font-black font-mono ${color}`}>{value}</p>
    {sub && <p className="text-2xs text-muted-foreground/30 mt-1">{sub}</p>}
  </div>
);

export default TaxCalculatorPage;
