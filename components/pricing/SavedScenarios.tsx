import { computePricing } from "@/lib/pricing/model";
import type { SavedScenario } from "@/lib/pricing/saved";

/*
  Saved scenarios, each recomputed on render.

  The stored figure and a fresh computation from the stored inputs are compared
  here. If the pricing maths ever changes, a saved scenario stops matching and
  the page says so — which turns every saved row into a regression test that
  runs whenever somebody looks at the page.
*/

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function SavedScenarios({
  scenarios,
}: {
  scenarios: SavedScenario[];
}) {
  return (
    <section aria-labelledby="saved-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="saved-heading" className="text-lg font-semibold">
            Saved scenarios
          </h2>
          <p className="text-ink-muted mt-1 text-sm">
            Each one stores its inputs as well as its result, and is recomputed
            when this page renders.
          </p>
        </div>
        <span className="text-ink-faint shrink-0 text-xs">
          {scenarios.length === 0 ? "none yet" : `${scenarios.length} saved`}
        </span>
      </div>

      <div className="border-hairline bg-surface rounded-xl border">
        {scenarios.length === 0 ? (
          <p className="text-ink-faint px-5 py-8 text-center text-sm">
            Adjust the simulator above and save a scenario to see it here.
          </p>
        ) : (
          <ul>
            {scenarios.map((s) => {
              const fresh = computePricing(s.inputs);
              const matches = Math.abs(fresh.arr - s.arr) < 0.02;

              return (
                <li
                  key={s.id}
                  className="border-hairline space-y-2 border-t px-5 py-4 first:border-t-0 sm:px-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-ink-faint text-xs">
                        {s.inputs.freelancers} freelancers ·{" "}
                        {s.inputs.studios} studios ·{" "}
                        {Math.round(s.inputs.monthlyChurn * 100)}% churn
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="numeric text-sm font-medium">
                        {usd.format(s.arr)}
                        <span className="text-ink-faint font-normal"> ARR</span>
                      </p>
                      <p
                        className={`text-[11px] ${matches ? "text-emerald-300" : "text-rose-300"}`}
                      >
                        {matches
                          ? "recomputes identically"
                          : `recomputes to ${usd.format(fresh.arr)} — model changed`}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
