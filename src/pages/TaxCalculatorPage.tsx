import { useState } from "react";
import { Calculator, TrendingUp, TrendingDown, DollarSign, Percent, ArrowDownRight } from "lucide-react";

const TaxCalculatorPage = () => {
  const [grossProfit, setGrossProfit] = useState("12500");
  const [grossLoss, setGrossLoss] = useState("4200");
  const [commissions, setCommissions] = useState("380");

  const profit = parseFloat(grossProfit) || 0;
  const loss = parseFloat(grossLoss) || 0;
  const comm = parseFloat(commissions) || 0;
  const netGain = profit - loss - comm;
  const taxRate = 0.25;
  const taxOwed = netGain > 0 ? netGain * taxRate : 0;
  const netAfterTax = netGain - taxOwed;

  return (
    <div className="mx-auto max-w-[900px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
            <Calculator className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">מחשבון מס רווחי הון</h1>
            <p className="text-[11px] md:text-xs text-muted-foreground/50">חישוב מס 25% על רווחי הון בישראל · שנת המס 2026</p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="glass-card p-5 md:p-6 mb-4">
        <h2 className="text-[13px] font-bold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-accent/60" />
          נתוני מסחר
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-2xs font-semibold text-profit/60 mb-1.5 block font-mono uppercase">רווח גולמי ($)</label>
            <div className="relative">
              <TrendingUp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-profit/30" />
              <input
                type="number"
                value={grossProfit}
                onChange={(e) => setGrossProfit(e.target.value)}
                className="w-full rounded-xl border border-profit/15 bg-profit/[0.03] pl-4 pr-10 py-3 text-[14px] font-bold text-foreground font-mono outline-none focus:border-profit/30 transition-all min-h-[48px]"
              />
            </div>
          </div>
          <div>
            <label className="text-2xs font-semibold text-loss/60 mb-1.5 block font-mono uppercase">הפסד גולמי ($)</label>
            <div className="relative">
              <TrendingDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-loss/30" />
              <input
                type="number"
                value={grossLoss}
                onChange={(e) => setGrossLoss(e.target.value)}
                className="w-full rounded-xl border border-loss/15 bg-loss/[0.03] pl-4 pr-10 py-3 text-[14px] font-bold text-foreground font-mono outline-none focus:border-loss/30 transition-all min-h-[48px]"
              />
            </div>
          </div>
          <div>
            <label className="text-2xs font-semibold text-muted-foreground/50 mb-1.5 block font-mono uppercase">עמלות ברוקר ($)</label>
            <div className="relative">
              <ArrowDownRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20" />
              <input
                type="number"
                value={commissions}
                onChange={(e) => setCommissions(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-4 pr-10 py-3 text-[14px] font-bold text-foreground font-mono outline-none focus:border-primary/30 transition-all min-h-[48px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Gross Profit */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-profit/10">
              <TrendingUp className="h-4 w-4 text-profit" />
            </div>
            <span className="text-[11px] text-muted-foreground/50">רווח גולמי</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-profit font-mono">+${profit.toLocaleString()}</p>
        </div>

        {/* Gross Loss */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-loss/10">
              <TrendingDown className="h-4 w-4 text-loss" />
            </div>
            <span className="text-[11px] text-muted-foreground/50">הפסד גולמי</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-loss font-mono">-${loss.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Commissions */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/20">
              <DollarSign className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <span className="text-[11px] text-muted-foreground/50">עמלות</span>
          </div>
          <p className="text-xl font-bold text-muted-foreground font-mono">-${comm.toLocaleString()}</p>
        </div>

        {/* Tax Owed */}
        <div className="glass-card p-5 border-accent/15">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10">
              <Percent className="h-4 w-4 text-accent" />
            </div>
            <span className="text-[11px] text-muted-foreground/50">מס (25%)</span>
          </div>
          <p className="text-xl font-bold text-accent font-mono">${taxOwed.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-2xs text-muted-foreground/30 mt-1">מס רווחי הון ישראלי</p>
        </div>

        {/* Net Profit */}
        <div className={`glass-card p-5 ${netAfterTax >= 0 ? "border-profit/15" : "border-loss/15"}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${netAfterTax >= 0 ? "bg-profit/10" : "bg-loss/10"}`}>
              <DollarSign className={`h-4 w-4 ${netAfterTax >= 0 ? "text-profit" : "text-loss"}`} />
            </div>
            <span className="text-[11px] text-muted-foreground/50">רווח נקי אחרי מס</span>
          </div>
          <p className={`text-xl font-bold font-mono ${netAfterTax >= 0 ? "text-profit" : "text-loss"}`}>
            {netAfterTax >= 0 ? "+" : ""}${netAfterTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="glass-card p-5">
        <h3 className="text-[12px] font-bold text-foreground mb-4 font-mono">פירוט חישוב</h3>
        <div className="space-y-2.5">
          {[
            { label: "רווח גולמי", value: `+$${profit.toLocaleString()}`, color: "text-profit" },
            { label: "הפסד גולמי", value: `-$${loss.toLocaleString()}`, color: "text-loss" },
            { label: "עמלות ברוקר", value: `-$${comm.toLocaleString()}`, color: "text-muted-foreground" },
            { label: "רווח נטו לפני מס", value: `${netGain >= 0 ? "+" : ""}$${netGain.toLocaleString()}`, color: netGain >= 0 ? "text-profit" : "text-loss", bold: true },
            { label: "מס רווחי הון (25%)", value: `-$${taxOwed.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "text-accent" },
            { label: "רווח נקי סופי", value: `${netAfterTax >= 0 ? "+" : ""}$${netAfterTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: netAfterTax >= 0 ? "text-profit" : "text-loss", bold: true },
          ].map((row, i) => (
            <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-3 ${row.bold ? "bg-white/[0.04] border border-white/[0.06]" : "bg-white/[0.02]"}`}>
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
          מומלץ להתייעץ עם רואה חשבון מוסמך.
        </p>
      </div>
    </div>
  );
};

export default TaxCalculatorPage;
