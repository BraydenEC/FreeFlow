"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUTH_ROUTES, FOOTER_COLUMNS } from "@/lib/nav/dock";
import { CONTACT_EMAIL } from "@/lib/site";
import Logo from "@/components/Logo";

/*
  The site-wide footer: Product, Support and Legal columns (lib/nav/dock.ts),
  the contact address, and the one line about price. The sign-in pages are a
  single card and link Terms and Privacy from the form.
*/
export default function SiteFooter() {
  const pathname = usePathname();
  if (AUTH_ROUTES.includes(pathname)) return null;

  return (
    <footer className="border-hairline text-ink-faint mx-auto mt-16 max-w-7xl border-t px-5 py-10 text-xs sm:px-8 lg:px-10">
      <div className="grid gap-8 sm:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-3">
          <Link href="/" aria-label="FreeFlow home" className="inline-flex">
            <Logo wordmark />
          </Link>
          <p className="max-w-xs leading-relaxed">
            Projects, deadlines and the money coming in, for freelancers. Free while it grows.
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink w-fit">
            {CONTACT_EMAIL}
          </a>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading} className="flex flex-col gap-2">
            <p className="text-ink-muted font-semibold">{col.heading}</p>
            {col.links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-ink w-fit">
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
    </footer>
  );
}
