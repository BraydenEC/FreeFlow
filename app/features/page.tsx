import Link from "next/link";
import PricingCta from "@/components/pricing/PricingCta";
import { featureAnchor, WALKTHROUGH, WALKTHROUGH_AREAS } from "@/lib/funnel/walkthrough";

/*
  /features: everything FreeFlow does, for a visitor deciding whether to try it.

  Built from the same list as the home page's walkthrough
  (lib/funnel/walkthrough.ts), which is tested against the built features in
  lib/product/features.ts, so this page can only show what exists. Each
  feature has its own anchor; the home page's "See it" links land on it.
  /product redirects here (next.config.ts).
*/

export const metadata = {
  title: "Features — FreeFlow",
  description:
    "Overdue alerts, a six-month cash-flow forecast, Mexican withholding, CSV export and more. Everything FreeFlow does, all free.",
};

export default function FeaturesPage() {
  return (
    <main className="mx-auto max-w-5xl page-stack px-5 sm:px-8">
      <header className="max-w-2xl">
        <h1 className="page-title">Features</h1>
        <p className="mt-3 text-2xl leading-snug font-semibold tracking-tight">
          The money, the paperwork and the deadlines, out of your head.
        </p>
        <p className="text-ink-muted mt-3 text-sm leading-relaxed">
          Twelve things FreeFlow does today, every one of them free. Each starts from a worry freelancers told us they
          carry around.
        </p>
        <div className="mt-5">
          <PricingCta />
        </div>
      </header>

      {WALKTHROUGH_AREAS.map((area) => (
        <section key={area.id} aria-labelledby={`area-${area.id}`}>
          <h2 id={`area-${area.id}`} className="text-ink-faint text-[11px] font-semibold tracking-[0.08em] uppercase">
            {area.label}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {WALKTHROUGH.filter((s) => s.area === area.id).map((s) => (
              <article
                key={s.featureName}
                id={featureAnchor(s.featureName)}
                className="border-hairline bg-surface scroll-mt-20 rounded-xl border px-5 py-4 target:border-[var(--color-ink-faint)]"
              >
                <h3 className="text-[15px] font-semibold">{s.featureName}</h3>
                <p className="text-ink-faint mt-0.5 text-xs">For &ldquo;{s.worry}&rdquo;</p>
                <p className="text-ink-muted mt-2 text-sm leading-relaxed">{s.benefit}</p>
                <div className="border-hairline mt-3 flex items-center gap-2 rounded-lg border bg-black px-3 py-2 text-xs">
                  <span className="bg-raised text-ink-faint rounded px-1.5 py-0.5 text-[10px] tracking-[0.06em] uppercase">
                    Sample
                  </span>
                  <span className="min-w-0 truncate text-[#d4d4d4]">{s.sample}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      {/* M6: say plainly, where people decide, what FreeFlow doesn't do. */}
      <section aria-labelledby="not-yet" className="border-hairline max-w-2xl rounded-lg border border-dashed p-5 sm:p-6">
        <h2 id="not-yet" className="text-[15px] font-semibold">
          What FreeFlow doesn&rsquo;t do yet
        </h2>
        <ul className="text-ink-muted mt-3 flex flex-col gap-2 text-sm">
          <li>It tracks the invoices you send from other tools; it doesn&rsquo;t create or send invoices.</li>
          <li>It doesn&rsquo;t issue Mexican CFDI invoices.</li>
          <li>It&rsquo;s in English only for now.</li>
        </ul>
        <p className="text-ink-muted mt-3 text-sm">
          See what&rsquo;s coming, and vote for what you want first, on the{" "}
          <Link href="/roadmap" className="text-ink underline-offset-4 hover:underline">
            roadmap
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
