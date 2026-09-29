import type { Provenance } from "@/lib/marketing/types";

/*
  Provenance, on every generated card. The Week 1/2 discipline applied to
  marketing copy: model-written and seed-written content are indistinguishable
  on the page unless one of them says which it is, and the weaker claim (seed
  content standing in for a live generation) is the one that must be loud.
*/

const STYLES: Record<Provenance, string> = {
  model: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
  heuristic: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
};

const LABEL: Record<Provenance, string> = {
  model: "AI-generated",
  heuristic: "seed copy",
};

const TITLE: Record<Provenance, string> = {
  model: "Written live by claude-opus-5 for this session.",
  heuristic: "Built-in seed copy — shown because live generation was not run or was unavailable.",
};

export default function ProvenanceBadge({
  provenance,
  className = "",
}: {
  provenance: Provenance;
  className?: string;
}) {
  return (
    <span
      title={TITLE[provenance]}
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset ${STYLES[provenance]} ${className}`}
    >
      {LABEL[provenance]}
    </span>
  );
}
