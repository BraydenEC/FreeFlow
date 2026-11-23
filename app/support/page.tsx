import { notFound, redirect } from "next/navigation";
import DonationPricing from "@/components/pricing/DonationPricing";
import { DONATIONS_ENABLED, PRICING_SIMULATOR_ENABLED } from "@/lib/flags";

/*
  /support: the donation page (lib/support.ts holds the amounts, the perk and
  the questions). While /pricing shows Module 3's revenue model, the whole
  donation page is here. With the simulator off it lives on /pricing, and old
  links land on its donation section. With donations off (lib/flags.ts) there
  is no donation page, so it answers 404.
*/

export const metadata = {
  title: "Support FreeFlow — FreeFlow",
  description: "FreeFlow is free: every feature, for everyone. If it helps you, you can chip in to keep it running.",
};

export default function SupportPage() {
  if (!DONATIONS_ENABLED) notFound();
  if (!PRICING_SIMULATOR_ENABLED) redirect("/pricing#support");
  return <DonationPricing heading="Support FreeFlow" />;
}
