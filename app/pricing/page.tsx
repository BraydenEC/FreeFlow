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

/*
  /pricing — tiers, segments, simulator, assumptions, saved scenarios.

  Unlike /research, which is a document, this page is an instrument: numbers
  move as you drag. The headline figures are computed from the scenario presets
  at render time so the prose cannot drift from the model.
*/

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pricing & Revenue Simulator — FreeFlow",
  description:
    "Three tiers anchored to verified competitor pricing, two customer segments, and a revenue model whose assumptions are stated rather than hidden.",
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
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
            <header className="max-w-3xl">
              <h1 className="page-title">
                Pricing &amp; Revenue Simulator
              </h1>
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
            </header>

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
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                FreeFlow is free while it is early — every feature, for
                everyone. What follows is the model it intends to move to, with
                each price anchored to a competitor that was actually checked
                and every assumption labelled. It is published now so that
                nobody has to guess later.
              </p>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                If it is useful to you in the meantime, there is an{" "}
                <Link
                  href="/support"
                  className="text-ink underline-offset-4 hover:underline"
                >
                  optional donation
                </Link>{" "}
                that covers hosting and keeps the SAT rules current. It buys
                nothing and unlocks nothing.
              </p>
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
                  reduced — it encodes what the Week 2 validation conversation
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
                initial={tab ?? "simulator"}
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
                  {
                    id: "project",
                    label: "Per-project",
                    content: <ProjectSegmentPanel />,
                  },
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
