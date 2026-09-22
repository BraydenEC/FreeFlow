"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SignOutButton from "@/components/auth/SignOutButton";
import { useSession } from "@/components/auth/SessionProvider";
import LayoutDrawer from "@/components/prefs/LayoutDrawer";
import { NAV_ITEMS } from "@/lib/nav";

/*
  The application bar.

  Holds what is global rather than page-specific: the brand, the layout
  settings, and the account. Page navigation lives in the sidebar on wide
  screens; below `md` the sidebar is hidden and the nav appears here as a
  horizontal scroller, because a fixed 64px rail on a phone spends scarce
  width on chrome. "Annoying on mobile" was the Week 2 interviewee's words.

  Renders nothing on the auth pages. A bar advertising Settings and an account
  menu to someone who has neither is noise, and the sign-up page is
  deliberately the whole screen.
*/

const AUTH_ROUTES = ["/signup", "/login", "/verify-email"];

export default function TopBar() {
  const pathname = usePathname();
  const user = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (AUTH_ROUTES.includes(pathname)) return null;

  return (
    <header className="border-hairline bg-surface sticky top-0 z-30 border-b">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="bg-ink text-app flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold">
            F
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Free<span className="text-ink-muted">Flow</span>
          </span>
        </Link>

        {/* Phone navigation. Hidden from md up, where the sidebar takes over.
            aria-hidden is wrong here — it is the only nav at this width — so
            the sidebar carries the "Main" label and this one is "Sections". */}
        <nav
          aria-label="Sections"
          className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 md:hidden"
        >
          {NAV_ITEMS.filter((i) => i.href).map((item) => (
            <Link
              key={item.label}
              href={item.href!}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-medium tracking-[0.08em] whitespace-nowrap uppercase transition-colors ${
                pathname === item.href
                  ? "bg-raised text-ink"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 md:gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-haspopup="dialog"
            className="text-ink-muted hover:text-ink hover:bg-raised focus-visible:ring-accent rounded-md px-2.5 py-1.5 text-[11px] font-medium tracking-[0.08em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            Settings
          </button>

          {user ? (
            <div className="border-hairline flex items-center gap-2.5 border-l pl-2 md:pl-3">
              <span
                className="text-ink-faint hidden max-w-40 truncate text-xs md:block"
                title={user.email ?? undefined}
              >
                {user.email}
              </span>
              <SignOutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="border-hairline text-ink-muted hover:text-ink border-l pl-3 text-[11px] font-medium tracking-[0.08em] uppercase"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      <LayoutDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
