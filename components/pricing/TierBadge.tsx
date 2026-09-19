import type { TierId } from "@/types/pricing";

/*
  Which tier a capability belongs to. Used on both /product and /pricing so the
  feature map and the pricing table cannot describe the same feature
  differently.
*/

const STYLES: Record<TierId, { label: string; className: string }> = {
  solo: { label: "Solo", className: "bg-slate-400/10 text-slate-300 ring-slate-400/20" },
  pro: { label: "Pro", className: "bg-indigo-400/10 text-indigo-300 ring-indigo-400/20" },
  studio: { label: "Studio", className: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20" },
};

export default function TierBadge({
  tier,
  className = "",
}: {
  tier: TierId;
  className?: string;
}) {
  const s = STYLES[tier];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset ${s.className} ${className}`}
    >
      {s.label}
    </span>
  );
}
