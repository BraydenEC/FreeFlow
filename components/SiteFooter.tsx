"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/nav/dock";
import { CONTACT_EMAIL } from "@/lib/site";

/*
  The site-wide footer (M5: only the home page had one, with no legal links).
  The sign-in pages are a single card and link Terms and Privacy from the form.
  The demo keeps its own fuller footer and gets this one under it.
*/
export default function SiteFooter() {
  const pathname = usePathname();
  if (AUTH_ROUTES.includes(pathname)) return null;

  return (
    <footer className="border-hairline text-ink-faint mx-auto mt-16 max-w-7xl border-t px-5 py-8 text-xs sm:px-8 lg:px-10">
      <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
        <Link href="/privacy" className="hover:text-ink">Privacy</Link>
        <Link href="/terms" className="hover:text-ink">Terms</Link>
        <Link href="/chat" className="hover:text-ink">Help desk</Link>
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink">Contact: {CONTACT_EMAIL}</a>
      </nav>
      <p className="mt-3">FreeFlow is free during early access.</p>
    </footer>
  );
}
