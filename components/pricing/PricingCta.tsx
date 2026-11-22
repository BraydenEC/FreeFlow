"use client";

import Link from "next/link";
import { useCta } from "@/components/funnel/useCta";

/* /pricing's one call to action: sign up, or open the dashboard when signed in. */
export default function PricingCta() {
  const cta = useCta();
  return (
    <Link
      href={cta.href}
      className="bg-accent text-app focus-visible:ring-accent inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
    >
      {cta.label} →
    </Link>
  );
}
