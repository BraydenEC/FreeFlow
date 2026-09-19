import Link from "next/link";
import TierBadge from "@/components/pricing/TierBadge";
import { FEATURE_GROUPS } from "@/lib/product/features";

/*
  The feature map.

  Built and planned are visually separated rather than interleaved, because a
  map that blends them reads as a larger product than exists. Anything marked
  built links to the route where it actually runs, so the claim is checkable in
  one click.
*/

export default function FeatureMap() {
  return (
    <div className="space-y-8">
      {FEATURE_GROUPS.map((group) => {
        const built = group.features.filter((f) => f.status === "built");
        const planned = group.features.filter((f) => f.status === "planned");

        return (
          <section
            key={group.id}
            aria-labelledby={`group-${group.id}`}
            className="border-hairline bg-surface rounded-xl border"
          >
            <div className="border-hairline border-b px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id={`group-${group.id}`} className="text-[15px] font-semibold">
                  {group.name}
                </h2>
                <span className="text-ink-faint text-xs">
                  {built.length} built
                  {planned.length > 0 && ` · ${planned.length} planned`}
                </span>
              </div>
              <p className="text-ink-muted mt-1 text-sm leading-relaxed">
                {group.purpose}
              </p>
            </div>

            <ul>
              {[...built, ...planned].map((f) => (
                <li
                  key={f.id}
                  className={`border-hairline border-t px-5 py-4 first:border-t-0 sm:px-6 ${
                    f.status === "planned" ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        {f.name}
                        {f.status === "planned" && (
                          <span className="bg-raised text-ink-faint rounded-full px-2 py-0.5 text-[11px] font-normal">
                            planned
                          </span>
                        )}
                      </p>
                      <p className="text-ink-muted mt-1 max-w-2xl text-sm leading-relaxed">
                        {f.description}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {f.tier && <TierBadge tier={f.tier} />}
                      {f.shippedIn && (
                        <span className="text-ink-faint text-[11px]">
                          {f.shippedIn}
                        </span>
                      )}
                      {f.route && (
                        <Link
                          href={f.route}
                          className="text-accent-soft hover:bg-accent/10 focus-visible:ring-accent rounded px-1.5 py-0.5 text-[11px] underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        >
                          open
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
