import FeatureMap from "@/components/product/FeatureMap";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { featureSummary } from "@/lib/product/features";

/*
  /product — the feature map.

  A document like /research rather than an instrument: it is read, not
  operated. Counts are computed from the data so the page cannot claim more
  than exists.
*/

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Product Architecture — ServicePro",
  description:
    "What ServicePro does today, what each tier includes, and what remains unbuilt.",
};

export default async function ProductPage() {
  const s = featureSummary();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <div className="relative">
          <div
            aria-hidden
            className="from-accent/8 pointer-events-none absolute inset-x-0 top-0 h-64 bg-linear-to-b to-transparent"
          />
          <div className="relative mx-auto max-w-5xl space-y-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <header className="max-w-3xl">
              <h1 className="text-2xl font-semibold tracking-tight">
                Product Architecture
              </h1>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                Every capability, which tier it belongs to, and whether it
                actually exists. Anything marked built links to the route where
                it runs.
              </p>
            </header>

            <section
              aria-label="Feature summary"
              className="border-accent/30 bg-accent/5 rounded-xl border p-5 sm:p-6"
            >
              <p className="text-lg leading-relaxed font-medium">
                <span className="text-accent-soft numeric">{s.built}</span> of{" "}
                <span className="numeric">{s.total}</span> capabilities are
                built. <span className="numeric">{s.planned}</span> are not.
              </p>
              <p className="text-ink-muted mt-3 text-sm leading-relaxed">
                The unbuilt six are the ones that would justify the Pro and
                Studio tiers — CFDI issuance, materialidad evidence,
                withholding, and everything a studio needs beyond one person.
                Separating them out is deliberate: a feature map that blends
                intentions with shipped code reads as a larger product than
                exists.{" "}
                <Link
                  href="/pricing"
                  className="text-accent-soft underline underline-offset-2"
                >
                  See what each tier costs →
                </Link>
              </p>
            </section>

            <FeatureMap />
          </div>
        </div>
      </main>
    </div>
  );
}
