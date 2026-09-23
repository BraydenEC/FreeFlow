"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SignOutButton from "@/components/auth/SignOutButton";
import { useSession } from "@/components/auth/SessionProvider";
import LayoutDrawer from "@/components/prefs/LayoutDrawer";
import { PRIMARY_NAV } from "@/lib/nav";

/*
  The application bar: brand, the sections of the product, and the account.

  This is the primary navigation now. It used to be a left rail; a horizontal
  bar puts every section one click away at any width and gives the page its
  full width back, which is most of what "annoying on mobile" meant. The
  sidebar underneath is for sections of the current page, not of the product.

  Settings sits at the right end with the account, separated by a rule,
  because it acts on the application rather than navigating it.

  Renders nothing on the auth pages. A bar advertising Settings and an account
  menu to someone who has neither is noise, and the sign-up page is
  deliberately the whole screen.
*/

const AUTH_ROUTES = [
  "/signup",
  "/login",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

export default function TopBar() {
  const pathname = usePathname();
  const user = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (AUTH_ROUTES.includes(pathname)) return null;

  const link = (active: boolean) =>
    `flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none ${
      active ? "bg-raised text-ink font-medium" : "text-ink-muted hover:text-ink"
    }`;

  return (
    <header className="border-hairline bg-surface sticky top-0 z-30 border-b">
      <div className="flex h-14 items-center gap-1 px-3 sm:px-4">
        {/* Brand mark. A filled square with a notch — a shape rather than a
            letter, so it reads as a logo at 28px instead of as text. */}
        <Link
          href="/"
          aria-label="FreeFlow home"
          className="mr-2 flex shrink-0 items-center"
        >
          <span className="bg-ink flex h-7 w-7 items-center justify-center rounded-md">
            <svg viewBox="0 0 24 24" className="text-app h-4 w-4" aria-hidden>
              <path d="M4 20V7a3 3 0 0 1 3-3h13L4 20Z" fill="currentColor" />
            </svg>
          </span>
        </Link>

        <nav
          aria-label="Main"
          className="-mx-1 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto px-1"
        >
          {PRIMARY_NAV.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={link(pathname === item.href)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span
                key={item.label}
                aria-disabled="true"
                className="text-ink-faint/60 flex shrink-0 cursor-not-allowed items-center gap-2 px-2.5 py-1.5 text-sm"
              >
                {item.icon}
                <span>{item.label}</span>
              </span>
            ),
          )}
        </nav>

        <div className="border-hairline ml-2 flex shrink-0 items-center gap-1 border-l pl-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-haspopup="dialog"
            className="text-ink-muted hover:text-ink hover:bg-raised focus-visible:ring-accent flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0"
              aria-hidden
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-1 1.47V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9.1 19.4a1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.47-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9.1a1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.6 1.6 0 0 0 1.77.32H9a1.6 1.6 0 0 0 1-1.47V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.32 1.77V9a1.6 1.6 0 0 0 1.47 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.47 1Z" />
            </svg>
            <span className="hidden sm:inline">Settings</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <span
                className="text-ink-faint hidden max-w-36 truncate text-xs lg:block"
                title={user.email ?? undefined}
              >
                {user.email}
              </span>
              <SignOutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="text-ink-muted hover:text-ink px-2 text-sm"
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
