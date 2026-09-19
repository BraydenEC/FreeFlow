import SourceBadge from "@/components/research/SourceBadge";
import { TIERS, toMxn } from "@/lib/pricing/tiers";

/*
  The three tiers.

  Each card carries its price anchor — the competitor figure the price was set
  against — with a source link. A pricing page that states numbers without
  saying where they came from is the same failure as a research page that
  states findings without citations, and Week 2 already built the badge for it.
*/

const mxn = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export default function TierCards() {
  return (
    <section aria-labelledby="tiers-heading" className="space-y-4">
      <div>
        <h2 id="tiers-heading" className="text-lg font-semibold">
          Three tiers
        </h2>
        <p className="text-ink-muted mt-1 text-sm">
          Every price is anchored to a competitor figure fetched and dated in
          the Week 2 research, not chosen because it looked plausible.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {TIERS.map((t) => (
          <article
            key={t.id}
            className={`flex flex-col rounded-xl border p-5 sm:p-6 ${
              t.id === "pro"
                ? "border-accent/40 bg-accent/5"
                : "border-hairline bg-surface"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold">{t.name}</h3>
              {t.id === "pro" && (
                <span className="bg-accent/15 text-accent-soft rounded-full px-2 py-0.5 text-[11px] font-medium">
                  the differentiated tier
                </span>
              )}
            </div>

            <p className="numeric mt-3 text-3xl font-semibold tracking-tight">
              {t.monthlyUsd === 0 ? "Free" : `$${t.monthlyUsd}`}
              {t.monthlyUsd > 0 && (
                <span className="text-ink-muted text-sm font-normal">
                  {t.id === "studio" ? "/seat/mo" : "/mo"}
                </span>
              )}
            </p>
            {t.monthlyUsd > 0 && (
              <p className="text-ink-faint numeric text-xs">
                ≈ {mxn.format(toMxn(t.monthlyUsd))} MXN
              </p>
            )}

            <p className="text-ink-muted mt-3 text-xs">{t.audience}</p>
            <p className="text-ink mt-3 text-sm leading-relaxed">{t.pitch}</p>

            <ul className="mt-4 flex-1 space-y-1.5">
              {t.includes.map((line) => (
                <li key={line} className="flex gap-2 text-sm">
                  <span aria-hidden className="text-accent-soft">
                    ·
                  </span>
                  <span className="text-ink-muted">{line}</span>
                </li>
              ))}
            </ul>

            <div className="border-hairline mt-4 space-y-2 border-t pt-4">
              <p className="text-ink-faint text-xs leading-relaxed">
                <strong className="text-ink-muted">Why this price.</strong>{" "}
                {t.anchor}
              </p>
              <SourceBadge
                confidence="verified"
                sourceUrl={t.anchorSourceUrl}
                verifiedOn="2026-08-31"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
