import type { TierId } from "@/types/pricing";

/*
  Which tier a capability belongs to. Used on both /product and /pricing so the
  feature map and the pricing table cannot describe the same feature
  differently.
*/

/*
  Monochrome, like the rest of the interface. These were four tinted pills
  until the redesign, which this file was missed by — the tier name is the
  information and a colour per tier was never carrying any of it.
*/
const STYLES: Record<TierId, { label: string; className: string }> = {
  solo: { label: "Solo", className: "text-ink-muted ring-hairline" },
  pro: { label: "Pro", className: "text-ink ring-ink-faint" },
  studio: { label: "Studio", className: "text-ink-muted ring-hairline" },
  project: { label: "Project", className: "text-ink-muted ring-hairline" },
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
