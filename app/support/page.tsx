import { notFound, redirect } from "next/navigation";
import { DONATIONS_ENABLED } from "@/lib/flags";

/*
  /support: the donation page lives on /pricing (lib/support.ts holds the
  amounts, the perk and the questions). Old links land on that section; with
  donations off (lib/flags.ts) there is no section, so it answers 404.
*/
export default function SupportPage() {
  if (!DONATIONS_ENABLED) notFound();
  redirect("/pricing#support");
}
