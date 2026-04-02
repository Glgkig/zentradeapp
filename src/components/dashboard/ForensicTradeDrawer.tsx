import { useState } from "react";
import { X, ArrowUpRight, ArrowDownRight, Plus, CheckCircle2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const confluences = [
  "FVG (Fair Value Gap)",
  "Liquidity Sweep",
  "Order Block",
  "Break of Structure",
  "Supply / Demand Zone",
  "Divergence",
  "EMA Cross",
  "Volume Spike",
];

interface ForensicTradeDrawerProps {
  open: boolean;
  onClose: () => void;
}

const ForensicTradeDrawer = ({ open, onClose }: ForensicTradeDrawerProps) => {
  const isMobile = useIsMobile();
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [selectedConfluences, setSelectedConfluences] = useState<string[]>([]);

  const toggleConfluence = (c: string) => {
    setSelectedConfluences((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel — bottom sheet on mobile, right slide on desktop */}
      <div
        className={`fixed z-[71] overflow-y-auto bg-card border-white/[0.08] animate-in duration-300 ${
          isMobile
            ? "inset-x-0 bottom-0 max-h-[92vh] rounded-t-3xl border-t slide-in-from-bottom-full"
            : "inset-y-0 right-0 w-[480px] border-l slide-in-from-right-full"
        }`}
      >
        {/* Mobile handle */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/15" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 border border-accent/20">
              <Plus className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">עסקה חדשה</h2>
              <p className="text-2xs text-muted-foreground/40">כניסה פורנזית מדויקת</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="haptic-press flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-muted-foreground/40 hover:text-foreground transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Asset */}
          <div>
            <label className="text-2xs font-semibold text-muted-foreground/50 mb-1.5 block font-mono uppercase">נכס</label>
            <input
              type="text"
              placeholder="EUR/USD, BTC, NQ..."
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30 transition-all min-h-[48px]"
            />
          </div>

          {/* Direction */}
          <div>
            <label className="text-2xs font-semibold text-muted-foreground/50 mb-1.5 block font-mono uppercase">כיוון</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDirection("long")}
                className={`haptic-press flex items-center justify-center gap-2 rounded-xl border py-3 text-[13px] font-bold transition-all min-h-[48px] ${
                  direction === "long"
                    ? "border-profit/30 bg-profit/10 text-profit"
                    : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 hover:bg-white/[0.04]"
                }`}
              >
                <ArrowUpRight className="h-4 w-4" />
                לונג (Long)
              </button>
              <button
                onClick={() => setDirection("short")}
                className={`haptic-press flex items-center justify-center gap-2 rounded-xl border py-3 text-[13px] font-bold transition-all min-h-[48px] ${
                  direction === "short"
                    ? "border-loss/30 bg-loss/10 text-loss"
                    : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 hover:bg-white/[0.04]"
                }`}
              >
                <ArrowDownRight className="h-4 w-4" />
                שורט (Short)
              </button>
            </div>
          </div>

          {/* Price Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs font-semibold text-muted-foreground/50 mb-1.5 block font-mono uppercase">מחיר כניסה</label>
              <input
                type="number"
                placeholder="Entry"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30 transition-all min-h-[48px]"
              />
            </div>
            <div>
              <label className="text-2xs font-semibold text-muted-foreground/50 mb-1.5 block font-mono uppercase">לוט / כמות</label>
              <input
                type="number"
                placeholder="0.01"
                step="0.01"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30 transition-all min-h-[48px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs font-semibold text-loss/60 mb-1.5 block font-mono uppercase">סטופ-לוס (SL)</label>
              <input
                type="number"
                placeholder="Stop Loss"
                className="w-full rounded-xl border border-loss/15 bg-loss/[0.03] px-4 py-3 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-loss/30 transition-all min-h-[48px]"
              />
            </div>
            <div>
              <label className="text-2xs font-semibold text-profit/60 mb-1.5 block font-mono uppercase">טייק-פרופיט (TP)</label>
              <input
                type="number"
                placeholder="Take Profit"
                className="w-full rounded-xl border border-profit/15 bg-profit/[0.03] px-4 py-3 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-profit/30 transition-all min-h-[48px]"
              />
            </div>
          </div>

          {/* Thesis */}
          <div>
            <label className="text-2xs font-semibold text-muted-foreground/50 mb-1.5 block font-mono uppercase">התזה (Thesis)</label>
            <textarea
              rows={3}
              placeholder="למה אני נכנס? מה הסטאפ? מה ה-edge שלי?"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[12px] text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/30 resize-none transition-all leading-relaxed"
            />
          </div>

          {/* Confluences */}
          <div>
            <label className="text-2xs font-semibold text-muted-foreground/50 mb-2 block font-mono uppercase">אישורים (Confluences)</label>
            <div className="flex flex-wrap gap-2">
              {confluences.map((c) => {
                const selected = selectedConfluences.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleConfluence(c)}
                    className={`haptic-press flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-medium transition-all ${
                      selected
                        ? "border-primary/25 bg-primary/10 text-primary"
                        : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 hover:bg-white/[0.04]"
                    }`}
                  >
                    {selected && <CheckCircle2 className="h-3 w-3" />}
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button className="haptic-press w-full flex items-center justify-center gap-2 rounded-2xl bg-accent border border-accent/30 py-4 text-[14px] font-bold text-accent-foreground transition-all hover:bg-accent/90 gold-glow min-h-[56px]">
            <Plus className="h-5 w-5" />
            פתח עסקה
          </button>
        </div>
      </div>
    </>
  );
};

export default ForensicTradeDrawer;
