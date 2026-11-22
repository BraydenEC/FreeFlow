import { redirect } from "next/navigation";

/*
  /support: the donation page now lives on /pricing (lib/support.ts holds the
  amounts, the perk and the questions). Old links land on that section.
*/
export default function SupportPage() {
  redirect("/pricing#support");
}
