import SourceBadge from "@/components/research/SourceBadge";
import { ASSUMPTIONS } from "@/lib/pricing/tiers";

/*
  Every assumption, with what breaks if it is wrong.

  Reuses the Week 2 SourceBadge deliberately. A pricing assumption and a
  research claim are the same kind of object — a statement that might be wrong
  — and labelling them the same way keeps the standard consistent across the
  product rather than relaxing it when the numbers are ours.

  Most rows read `estimated`. That is the honest state of any revenue model and
  the page says so rather than burying it.
*/

export default function AssumptionsTable() {
  const estimated = ASSUMPTIONS.filter((a) => a.confidence === "estimated").length;

  return (
    <section aria-labelledby="assumptions-heading" className="space-y-4">
      <div>
        <h2 id="assumptions-heading" className="text-lg font-semibold">
          Assumptions
        </h2>
        <p className="text-ink-muted mt-1 text-sm leading-relaxed">
          <strong className="text-ink">
            {estimated} of {ASSUMPTIONS.length} are estimates, not measurements.
          </strong>{" "}
          A revenue model is mostly guesses; the useful part is saying which
          ones and what they would cost if wrong.
        </p>
      </div>

      <div className="border-hairline bg-surface overflow-hidden rounded-xl border">
        <table className="hidden w-full text-left text-sm md:table">
          <caption className="sr-only">
            Pricing assumptions with value, consequence if wrong, and confidence.
          </caption>
          <thead className="bg-raised/50 text-ink-muted text-xs tracking-wide uppercase">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">
                Assumption
              </th>
              <th scope="col" className="px-5 py-3 font-medium">
                If it is wrong
              </th>
              <th scope="col" className="px-5 py-3 font-medium">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody>
            {ASSUMPTIONS.map((a) => (
              <tr key={a.id} className="border-hairline border-t align-top">
                <th scope="row" className="px-5 py-4 font-normal">
                  <span className="text-ink block font-medium">{a.label}</span>
                  <span className="numeric text-ink-muted block text-xs">
                    {a.value}
                  </span>
                </th>
                <td className="text-ink-muted max-w-md px-5 py-4 text-xs leading-relaxed">
                  {a.ifWrong}
                </td>
                <td className="px-5 py-4">
                  <SourceBadge
                    confidence={a.confidence}
                    sourceUrl={a.sourceUrl}
                    verifiedOn={null}
                    className="flex-col items-start gap-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="md:hidden">
          {ASSUMPTIONS.map((a) => (
            <li
              key={a.id}
              className="border-hairline space-y-2 border-t px-5 py-4 first:border-t-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="numeric text-ink-muted text-xs">{a.value}</p>
                </div>
                <SourceBadge
                  confidence={a.confidence}
                  sourceUrl={a.sourceUrl}
                  verifiedOn={null}
                />
              </div>
              <p className="text-ink-muted text-xs leading-relaxed">{a.ifWrong}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
