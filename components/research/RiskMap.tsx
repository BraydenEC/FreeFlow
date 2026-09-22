import { RISKS } from "@/lib/research/data";
import { IMPACT_LABEL, LIKELIHOOD_LABEL } from "@/types/research";
import type { Risk } from "@/types/research";

/*
  Likelihood × impact risk map.

  CSS grid and inline SVG rather than a charting library — a 3×3 grid does not
  justify a dependency, and this project has added zero third-party packages
  since Week 1.

  The map includes risks to FreeFlow's own thesis, not just external threats.
  A risk map that only lists things other people might do is a marketing
  slide, and the highest-severity cell here is occupied by the possibility
  that the gap closes from the Mexican side — which would make this whole
  product unnecessary.
*/

function severity(r: Risk): number {
  return r.likelihood * r.impact;
}

/* Colour by severity rather than by category, so the eye lands on what
   matters rather than on what is being counted. */
function cellTone(sev: number): string {
  if (sev >= 9) return "bg-rose-400/10 ring-rose-400/25";
  if (sev >= 6) return "bg-amber-400/10 ring-amber-400/25";
  if (sev >= 3) return "bg-sky-400/10 ring-sky-400/20";
  return "bg-raised/40 ring-hairline";
}

function dotTone(sev: number): string {
  if (sev >= 9) return "bg-rose-400";
  if (sev >= 6) return "bg-amber-400";
  if (sev >= 3) return "bg-sky-400";
  return "bg-ink-faint";
}

export default function RiskMap() {
  // Impact descends down the page so "high impact" sits at the top, which is
  // how these are conventionally read.
  const rows = [3, 2, 1] as const;
  const cols = [1, 2, 3] as const;

  const ranked = [...RISKS].sort((a, b) => severity(b) - severity(a));

  return (
    <section aria-labelledby="risk-heading" className="space-y-4">
      <div>
        <h2 id="risk-heading" className="text-lg font-semibold">
          Risk map
        </h2>
        <p className="text-ink-muted mt-1 text-sm">
          Including risks to this project&rsquo;s own thesis. The top-right cell
          is the one that would make FreeFlow unnecessary.
        </p>
      </div>

      <div className="border-hairline bg-surface rounded-xl border p-5 sm:p-6">
        <div className="flex gap-3">
          {/* Y axis */}
          <div
            aria-hidden
            className="text-ink-faint flex w-6 shrink-0 items-center justify-center"
          >
            <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] tracking-wide uppercase">
              Impact →
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-[auto_repeat(3,minmax(0,1fr))] gap-2">
              {rows.map((impact) => (
                <div key={impact} className="contents">
                  <div className="text-ink-faint flex w-14 items-center justify-end pr-1 text-[11px]">
                    {IMPACT_LABEL[impact]}
                  </div>

                  {cols.map((likelihood) => {
                    const inCell = RISKS.filter(
                      (r) => r.impact === impact && r.likelihood === likelihood,
                    );
                    const sev = impact * likelihood;
                    return (
                      <div
                        key={`${impact}-${likelihood}`}
                        className={`min-h-[86px] rounded-lg p-2.5 ring-1 ring-inset ${cellTone(sev)}`}
                      >
                        <ul className="space-y-1.5">
                          {inCell.map((r) => (
                            <li
                              key={r.id}
                              className="flex items-start gap-1.5 text-[11px] leading-snug"
                            >
                              <span
                                aria-hidden
                                className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${dotTone(sev)}`}
                              />
                              <span className="text-ink">{r.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* X axis labels */}
              <div />
              {cols.map((l) => (
                <div
                  key={l}
                  className="text-ink-faint pt-1 text-center text-[11px]"
                >
                  {LIKELIHOOD_LABEL[l]}
                </div>
              ))}
            </div>

            <p
              aria-hidden
              className="text-ink-faint mt-1 text-center text-[11px] tracking-wide uppercase"
            >
              Likelihood →
            </p>
          </div>
        </div>

        {/* The map shows position; the list explains it. Both are needed —
            a dot in a grid is not an argument. */}
        <ol className="border-hairline mt-6 space-y-3 border-t pt-5">
          {ranked.map((r) => (
            <li key={r.id} className="flex gap-3">
              <span
                aria-hidden
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotTone(severity(r))}`}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {r.title}{" "}
                  <span className="text-ink-faint font-normal">
                    · {LIKELIHOOD_LABEL[r.likelihood].toLowerCase()} likelihood ·{" "}
                    {IMPACT_LABEL[r.impact].toLowerCase()} impact
                  </span>
                </p>
                <p className="text-ink-muted mt-0.5 text-sm leading-relaxed">
                  {r.note}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
