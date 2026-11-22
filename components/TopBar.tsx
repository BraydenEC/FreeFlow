"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SignOutButton from "@/components/auth/SignOutButton";
import { useSession } from "@/components/auth/SessionProvider";
import LayoutDrawer from "@/components/prefs/LayoutDrawer";
import Logo from "@/components/Logo";
import { AUTH_ROUTES, SITE_LINKS, TOP_LINKS } from "@/lib/nav/dock";

/*
  The application bar: the brand mark, Settings and the account.

  Every page lives in the Dock (components/nav/Dock.tsx). On desktop this bar
  also names the pages that matter to whoever is looking: a signed-in user's
  own tools (TOP_LINKS: Dashboard, Paste a brief, Help desk), or a visitor's
  product pages (SITE_LINKS: Features, Pricing, Roadmap, Help), with a sign-up
  button, the way product sites do. On a phone the Dock's grid does the job.

  Renders nothing on the auth pages. A bar advertising Settings and an account
  menu to someone who has neither is noise, and the sign-up page is
  deliberately the whole screen.
*/


export default function TopBar() {
  const pathname = usePathname();
  const user = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (AUTH_ROUTES.includes(pathname)) return null;


  return (
    <header className="border-hairline bg-surface relative z-30 border-b">
      <div className="flex h-14 items-center gap-1 px-3 sm:px-4">
        {/* Brand mark. A filled square with a notch — a shape rather than a
            letter, so it reads as a logo at 28px instead of as text. */}
        <Link
          href="/"
          aria-label="FreeFlow home"
          className="mr-2 flex shrink-0 items-center"
        >
          <Logo />
        </Link>

        <nav aria-label={user ? "Your tools" : "FreeFlow"} className="hidden items-center gap-1 sm:flex">
          {(user ? TOP_LINKS : SITE_LINKS).map((l) => {
            const current = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={current ? "page" : undefined}
                className={`focus-visible:ring-accent rounded-md px-2.5 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  current ? "text-ink bg-raised font-medium" : "text-ink-muted hover:text-ink hover:bg-raised"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="border-hairline ml-2 flex shrink-0 items-center gap-1 border-l pl-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-haspopup="dialog"
            aria-label="Settings"
            className="text-ink-muted hover:text-ink hover:bg-raised focus-visible:ring-accent flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-2.5 py-1.5 text-sm sm:min-h-0 sm:min-w-0 transition-colors focus-visible:ring-2 focus-visible:outline-none"
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
            <div className="flex items-center gap-1">
              <Link
                href="/login"
                className="text-ink-muted hover:text-ink flex min-h-11 items-center px-2 text-sm sm:min-h-0"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-accent text-app focus-visible:ring-accent flex min-h-11 items-center rounded-md px-3 text-sm font-semibold whitespace-nowrap focus-visible:ring-2 focus-visible:outline-none sm:min-h-9"
              >
                <span className="sm:hidden">Sign up</span>
                <span className="hidden sm:inline">Create a free account</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <LayoutDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
