import Link from "next/link";
import AssumptionsTable from "@/components/pricing/AssumptionsTable";
import Reasoning from "@/components/prefs/Reasoning";
import Tabs from "@/components/prefs/Tabs";
import { Suspense } from "react";
import ProjectSegmentPanel from "@/components/pricing/ProjectSegmentPanel";
import PricingCalculator from "@/components/pricing/PricingCalculator";
import SavedScenarios from "@/components/pricing/SavedScenarios";
import SegmentPanel from "@/components/pricing/SegmentPanel";
import SubNav from "@/components/SubNav";
import TierCards from "@/components/pricing/TierCards";
import { getSavedScenarios } from "@/lib/pricing/saved";
import { computePricing } from "@/lib/pricing/model";
import { SCENARIOS } from "@/lib/pricing/scenarios";
import { DONATIONS_ENABLED, PER_PROJECT_PRICING_ENABLED } from "@/lib/flags";

/*
  Module 3's /pricing: tiers, segments, simulator, assumptions, saved scenarios.
  app/pricing/page.tsx shows it while PRICING_SIMULATOR_ENABLED is on.

  Unlike /research, which is a document, this page is an instrument: numbers
  move as you drag. The headline figures are computed from the scenario presets
  at render time so the prose cannot drift from the model.
*/


const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function SimulatorPricing({ tab }: { tab?: string }) {
  // An old link to a hidden tab (?tab=project) opens the Simulator instead.
  const tabs = ["simulator", "tiers", ...(PER_PROJECT_PRICING_ENABLED ? ["project"] : []), "assumptions", "saved"].map((id) => ({ id }));
  const initialTab = tab !== undefined && tabs.some((t) => t.id === tab) ? tab : "simulator";
  const saved = await getSavedScenarios();

  // Computed, not written — the claim below cannot drift from the model.
  const conservative = computePricing(SCENARIOS.conservative.inputs);
  const base = computePricing(SCENARIOS.base.inputs);
  const ratio = Math.round((conservative.arr / base.arr) * 100);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <SubNav />
      <main className="min-w-0 flex-1">
        <div className="relative">
          <div
            aria-hidden
            className="from-accent/8 pointer-events-none absolute inset-x-0 top-0 h-64 bg-linear-to-b to-transparent"
          />
          <div className="relative mx-auto max-w-6xl page-stack px-5 sm:px-8 lg:px-10">
            {/* H9: testers read the whole page and still couldn't say what
                FreeFlow costs. The answer now comes first, in one line. */}
            <header className="max-w-3xl">
              <h1 className="page-title">Pricing</h1>
              <p className="mt-3 text-xl leading-snug font-semibold">
                Free during early access: every feature, for everyone. At launch FreeFlow becomes a one-time
                purchase, and the price isn&rsquo;t set yet.
              </p>
              {/* M6: say plainly what FreeFlow doesn't do. */}
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                FreeFlow tracks the invoices you send from other tools. It doesn&rsquo;t create or send invoices
                yet, and it doesn&rsquo;t issue Mexican CFDI invoices.
              </p>
            </header>

            <div className="border-hairline border-t pt-6">
              <p className="text-ink-faint text-xs font-medium tracking-wide uppercase">Build log</p>
              <h2 className="mt-1 text-lg font-semibold">The pricing model behind the business</h2>
              <p className="text-ink-muted mt-1 max-w-3xl text-sm leading-relaxed">
                The rest of this page is analysis, not a price list: possible later models, a revenue simulator
                and the assumptions behind it, published so nobody has to guess later.
              </p>
              <div className="mt-3">
              <Reasoning label="Why this page is built the way it is">
                <p className="text-ink-muted text-sm leading-relaxed">
                  A pricing simulator is a machine for producing encouraging
                  numbers — you choose the inputs, so the output is whatever
                  you already believed. This one states every assumption,
                  anchors every price to a competitor that was actually
                  checked, and includes a pessimistic case that genuinely
                  hurts.
                </p>
              </Reasoning>
              </div>
            </div>

            {/*
              The page describes a model, not a bill. FreeFlow is free while it
              is gathering users, and leaving a page of prices standing without
              saying so would let a visitor conclude they are being charged.
              The analysis stays published because a product that intends to
              charge later and will not say what or when is asking people to
              find out the hard way.
            */}
            <aside className="border-hairline rounded-lg border border-dashed p-5">
              <p className="text-[15px] font-semibold">
                None of this is being charged today.
              </p>
              <p className="text-ink mt-2 text-sm leading-relaxed">
                The subscription tiers below are one possible long-term model, not something on sale. The plan
                for launch is a one-time purchase for full access, and today there are no limits on anything.
              </p>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                FreeFlow is free while it is early — every feature, for
                everyone. What follows is the model it intends to move to, with
                each price anchored to a competitor that was actually checked
                and every assumption labelled. It is published now so that
                nobody has to guess later.
              </p>
              {DONATIONS_ENABLED && (
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                If it is useful to you in the meantime, there is an{" "}
                <Link
                  href="/pricing#support"
                  className="text-ink underline-offset-4 hover:underline"
                >
                  optional donation
                </Link>{" "}
                that covers hosting and keeps the SAT rules current. It buys
                nothing and unlocks nothing.
              </p>
              )}
            </aside>

            <section
              aria-label="Headline"
              className="border-accent/30 bg-accent/5 rounded-xl border p-5 sm:p-6"
            >
              <p className="text-lg leading-relaxed font-medium">
                Base case is{" "}
                <span className="text-accent-soft numeric">
                  {usd.format(base.arr)}
                </span>{" "}
                ARR. The conservative case is{" "}
                <span className="numeric text-rose-300">
                  {usd.format(conservative.arr)}
                </span>{" "}
                — <span className="numeric">{ratio}%</span> of it, and falling.
              </p>
              <Reasoning className="mt-3">
                <p className="text-ink-muted text-sm leading-relaxed">
                  Both numbers come from the same model with different
                  assumptions. The conservative case is not the base case
                  reduced — it encodes what the validation interview
                  actually found: that most freelancers are content with a
                  spreadsheet, and that the one person interviewed said he
                  would not buy.
                </p>
              </Reasoning>
            </section>

            {/* Tabs hide inactive panels with CSS rather than unmounting
                them, so every content check still sees the full page. */}
            <Suspense fallback={null}>
              <Tabs
                initial={initialTab}
                tabs={[
                  { id: "simulator", label: "Simulator", content: <PricingCalculator /> },
                  {
                    id: "tiers",
                    label: "Tiers & segments",
                    content: (
                      <>
                        <TierCards />
                        <SegmentPanel />
                      </>
                    ),
                  },
                  // Hidden while per-project pricing is off (lib/pricing/tiers.ts).
                  ...(PER_PROJECT_PRICING_ENABLED
                    ? [{ id: "project", label: "Per-project", content: <ProjectSegmentPanel /> }]
                    : []),
                  { id: "assumptions", label: "Assumptions", content: <AssumptionsTable /> },
                  { id: "saved", label: "Saved", content: <SavedScenarios scenarios={saved} /> },
                ]}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
