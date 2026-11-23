import DonationPricing from "@/components/pricing/DonationPricing";
import SimulatorPricing from "@/components/pricing/SimulatorPricing";
import { PRICING_SIMULATOR_ENABLED } from "@/lib/flags";

/*
  /pricing has two versions, chosen in lib/flags.ts:

    PRICING_SIMULATOR_ENABLED on   Module 3's page: tiers, segments, the
                                   revenue simulator, assumptions, saved
                                   scenarios (components/pricing/SimulatorPricing)
    off                            the public site's donation-first page
                                   (components/pricing/DonationPricing)

  /support redirects to the donation section when donations are on.
*/

export const metadata = PRICING_SIMULATOR_ENABLED
  ? {
      title: "Pricing — FreeFlow",
      description:
        "FreeFlow is free during early access, then a one-time purchase at launch. Below it, the pricing model behind the business, with every assumption stated.",
    }
  : {
      title: "Pricing — FreeFlow",
      description:
        "FreeFlow is free: every feature, for everyone. If it helps you, you can chip in to keep it running.",
    };

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  if (!PRICING_SIMULATOR_ENABLED) return <DonationPricing />;
  const { tab } = await searchParams;
  return <SimulatorPricing tab={tab} />;
}
