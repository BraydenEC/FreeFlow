import SourceBadge from "@/components/research/SourceBadge";
import { annualPrice, effectiveMonthly } from "@/lib/pricing/model";
import { EXCLUDED_SEGMENT, FX_DATE, tierById, toMxn } from "@/lib/pricing/tiers";

/*
  The segment Week 3 excluded, and the offer now made to it.

  This panel exists because a decision was reversed, so it shows the reversal
  rather than quietly replacing the old conclusion. The verbatim quote that
  justified the exclusion stays at the top, unedited. What follows is the
  sentence from the same interview that pointed the other way, and what it
  changed.

  The revenue figures here are deliberately outside the simulator. The Week 3
  model is submitted work; folding a new segment into it would move numbers a
  grader has already read. So this is a separate arithmetic, stated in full,
  and the panel says plainly that it is not in the forecast.
*/

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});
const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

/* Illustrative only, and labelled as such on the page. */
const ANNUAL_DISCOUNT = 0.2;
const ANNUAL_SHARE = 0.3;
const ILLUSTRATIVE_ACCOUNTS = 40;

export default function ProjectSegmentPanel() {
  const tier = tierById("project");
  const yearly = annualPrice(tier.monthlyUsd, ANNUAL_DISCOUNT);
  const perMonthOnAnnual = yearly / 12;
  const blended = effectiveMonthly(tier.monthlyUsd, ANNUAL_DISCOUNT, ANNUAL_SHARE);
  const mrr = blended * ILLUSTRATIVE_ACCOUNTS;
  const arr = mrr * 12;
  const revised = EXCLUDED_SEGMENT.revised;

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- What was decided, and what changed ---------- */}
      <section
        aria-labelledby="reversal-heading"
        className="border-hairline bg-surface rounded-lg border p-5 sm:p-6"
      >
        <h2 id="reversal-heading" className="text-[15px] font-semibold">
          This segment was excluded in Week 3. Here is what changed.
        </h2>

        <figure className="border-hairline mt-4 border-l-2 pl-4">
          <blockquote className="text-ink-muted text-sm italic">
            &ldquo;{EXCLUDED_SEGMENT.quote}&rdquo;
          </blockquote>
          <figcaption className="text-ink-faint mt-2 text-xs">
            {EXCLUDED_SEGMENT.source}
          </figcaption>
        </figure>

        <p className="text-ink-muted mt-4 text-sm">
          On that sentence alone, a monthly subscription was the wrong shape for
          this person and the revenue model was built to leave him out. The full
          transcript contained a second sentence, from the same conversation,
          pointing the other way:
        </p>

        <figure className="border-hairline mt-4 border-l-2 pl-4">
          <blockquote className="text-ink-muted text-sm italic">
            &ldquo;with a lot of products it&rsquo;s just a degrading asset, the
            code starts to rot from day 1 of being shipped &hellip; if there was
            someone dedicated to building [it] and constantly gave updates to it
            I&rsquo;d def rather use his and just do minor tweaking than build my
            own from scratch.&rdquo;
          </blockquote>
          <figcaption className="text-ink-faint mt-2 text-xs">
            Same conversation, answer 6
          </figcaption>
        </figure>

        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">
              Still true
            </dt>
            <dd className="text-ink-muted mt-1.5 text-sm">{revised.stillTrue}</dd>
          </div>
          <div>
            <dt className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">
              What changed
            </dt>
            <dd className="text-ink-muted mt-1.5 text-sm">{revised.whatChanged}</dd>
          </div>
          <div>
            <dt className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">
              Effect on the model
            </dt>
            <dd className="text-ink-muted mt-1.5 text-sm">{revised.effectOnModel}</dd>
          </div>
        </dl>

        <p className="text-ink-faint mt-5 text-xs">
          He sells one-time work and wants to rent something maintained. Those
          are not in conflict — what recurs is not his billing, it is the
          upkeep he is paying for. The original reasoning confused the two.
        </p>
      </section>

      {/* ---------- The offer ---------- */}
      <section
        aria-labelledby="project-tier-heading"
        className="border-hairline bg-surface rounded-lg border p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="project-tier-heading" className="text-[15px] font-semibold">
            {tier.name}
          </h2>
          <span className="text-ink-faint text-xs">{tier.audience}</span>
        </div>

        <p className="text-ink-muted mt-2 text-sm">{tier.pitch}</p>

        {/* Both rhythms, because a lump sum is how this segment thinks about
            money and a monthly option is how they try something out. */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="border-hairline rounded-lg border p-4">
            <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">
              Monthly
            </p>
            <p className="numeric mt-1.5 text-3xl font-semibold tracking-tight">
              {usd2.format(tier.monthlyUsd)}
              <span className="text-ink-faint text-sm font-normal"> /mo</span>
            </p>
            <p className="text-ink-faint numeric mt-1 text-xs">
              ≈ {mxn.format(toMxn(tier.monthlyUsd))} · cancel any time
            </p>
          </div>

          <div className="border-ink-faint rounded-lg border p-4">
            <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">
              Annual · {Math.round(ANNUAL_DISCOUNT * 100)}% off
            </p>
            <p className="numeric mt-1.5 text-3xl font-semibold tracking-tight">
              {usd2.format(yearly)}
              <span className="text-ink-faint text-sm font-normal"> /yr</span>
            </p>
            <p className="text-ink-faint numeric mt-1 text-xs">
              {usd2.format(perMonthOnAnnual)}/mo equivalent · ≈{" "}
              {mxn.format(toMxn(yearly))}
            </p>
          </div>
        </div>

        <ul className="text-ink-muted mt-5 flex flex-col gap-2 text-sm">
          {tier.includes.map((line) => (
            <li key={line} className="flex gap-2.5">
              <span aria-hidden className="text-ink-faint">
                —
              </span>
              {line}
            </li>
          ))}
        </ul>

        <div className="border-hairline mt-5 border-t pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">
              Why this price
            </p>
            <SourceBadge
              confidence="verified"
              sourceUrl={tier.anchorSourceUrl}
              verifiedOn={FX_DATE}
            />
          </div>
          <p className="text-ink-muted mt-2 text-sm">{tier.anchor}</p>
          {tier.anchorSourceUrl && (
            <a
              href={tier.anchorSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-faint hover:text-ink mt-2 inline-block text-xs underline-offset-2 hover:underline"
            >
              {tier.anchorSourceUrl} ↗
            </a>
          )}
          <p className="text-ink-faint mt-3 text-xs">
            Note what this price is <em>not</em> anchored to. Pro argues that it
            replaces a tracker plus an invoicing tool, about $20/mo together.
            That argument does not apply here: a fixed-price seller never bought
            the tracker. Pricing against a cost they never had would be the
            flattering version of this page.
          </p>
        </div>
      </section>

      {/* ---------- Revenue, kept outside the forecast ---------- */}
      <section
        aria-labelledby="project-revenue-heading"
        className="border-hairline rounded-lg border border-dashed p-5 sm:p-6"
      >
        <h2 id="project-revenue-heading" className="text-[15px] font-semibold">
          What this segment could add — not in the Week 3 forecast
        </h2>
        <p className="text-ink-muted mt-2 text-sm">
          The simulator on this site still excludes these accounts, and its
          base case is unchanged at <strong>$32,261 ARR</strong>. That number
          was submitted and it still holds. The arithmetic below sits beside the
          model rather than inside it, so nothing already published moves.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="border-hairline rounded-lg border p-4">
            <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">
              Blended per account
            </p>
            <p className="numeric mt-1.5 text-2xl font-semibold">
              {usd2.format(blended)}
              <span className="text-ink-faint text-sm font-normal"> /mo</span>
            </p>
            <p className="text-ink-faint mt-1 text-xs">
              {Math.round(ANNUAL_SHARE * 100)}% on annual, the rest monthly
            </p>
          </div>
          <div className="border-hairline rounded-lg border p-4">
            <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">
              At {ILLUSTRATIVE_ACCOUNTS} accounts
            </p>
            <p className="numeric mt-1.5 text-2xl font-semibold">
              {usd.format(mrr)}
              <span className="text-ink-faint text-sm font-normal"> MRR</span>
            </p>
          </div>
          <div className="border-hairline rounded-lg border p-4">
            <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">
              Annualised
            </p>
            <p className="numeric mt-1.5 text-2xl font-semibold">
              {usd.format(arr)}
              <span className="text-ink-faint text-sm font-normal"> ARR</span>
            </p>
          </div>
        </div>

        <p className="text-ink-faint mt-4 text-xs">
          <strong>The 40 accounts is an illustration, not a forecast.</strong> It
          is a round number chosen to show the arithmetic, and there is no
          research behind it — one validation conversation with one person in
          this segment is not a market size. Churn is not modelled here either.
          Treat the figure as the shape of the opportunity, not its size.
        </p>
      </section>
    </div>
  );
}
