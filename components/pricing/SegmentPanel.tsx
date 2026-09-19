import { EXCLUDED_SEGMENT, SEGMENTS } from "@/lib/pricing/tiers";
import TierBadge from "@/components/pricing/TierBadge";

/*
  Who this is for — and, more usefully, who it is not for.

  The excluded segment is given equal visual weight rather than a footnote. It
  comes from the Week 2 validation conversation with a real person who said
  plainly that this product does not fit how he works, and a revenue model that
  quietly counted him would be fiction from its first input.
*/

export default function SegmentPanel() {
  return (
    <section aria-labelledby="segments-heading" className="space-y-4">
      <div>
        <h2 id="segments-heading" className="text-lg font-semibold">
          Two segments — and one that is not a customer
        </h2>
        <p className="text-ink-muted mt-1 text-sm">
          Defined by billing model rather than by size, because billing model is
          what determines whether a subscription fits at all.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {SEGMENTS.map((s) => (
          <article
            key={s.id}
            className="border-hairline bg-surface rounded-xl border p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">{s.name}</h3>
              <TierBadge tier={s.defaultTier} />
            </div>
            <p className="text-ink-muted mt-2 text-sm leading-relaxed">
              {s.description}
            </p>
          </article>
        ))}
      </div>

      {/* Deliberately the same size as the segments above it. */}
      <article className="rounded-xl border border-rose-400/30 bg-rose-400/5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">
            Not a customer: {EXCLUDED_SEGMENT.name}
          </h3>
          <span className="rounded-full bg-rose-400/10 px-2 py-0.5 text-[11px] font-medium text-rose-300 ring-1 ring-rose-400/20 ring-inset">
            excluded from the model
          </span>
        </div>

        <blockquote className="border-hairline text-ink mt-3 border-l-2 pl-3 text-sm italic">
          &ldquo;{EXCLUDED_SEGMENT.quote}&rdquo;
        </blockquote>

        <p className="text-ink-muted mt-3 text-sm leading-relaxed">
          {EXCLUDED_SEGMENT.why}
        </p>
        <p className="text-ink-faint mt-2 text-xs">
          {EXCLUDED_SEGMENT.source}. He is not counted anywhere in the revenue
          model below, and there is no option to add him back — a flattering
          number one click away is still a flattering number.
        </p>
      </article>
    </section>
  );
}
