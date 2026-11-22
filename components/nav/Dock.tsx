"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AUTH_ROUTES, DOCK_GROUPS, type DockIcon } from "@/lib/nav/dock";

/*
  The Dock: every page, one round button in the bottom-right corner.

  At rest it is a single button. Hovering it with a mouse, or clicking or
  tapping it, opens every page in two labelled groups, Your tools and About
  FreeFlow. The icon under the mouse grows a little (a CSS transform, so no
  layout work), every icon carries its name underneath, and a border marks the
  page you're on. A clicked link pulses until its page arrives. It closes
  350 ms after the mouse leaves, on a tap outside, on Escape (focus returns to
  the button) and after you navigate.

  User testing (H3) changed three things. Names are always visible, because
  touch users never hover. The button sits in the corner, not over the middle
  of forms. And it stays away from the sign-in pages and from the Settings
  sheet (body[data-sheet="open"], see globals.css). On a phone the open Dock
  wraps into rows instead of scrolling sideways behind a half-cut icon.

  Speed: the toggle sits at the right-hand end, so opening the Dock on hover
  never moves it out from under the mouse, and clicks work immediately (the
  old 450 ms "arming" pause is gone). Icons no longer resize on every mouse
  move, and the bar has no backdrop blur, which was costly to repaint.
*/


const ICONS: Record<DockIcon, React.ReactNode> = {
  demo: <path d="M6 4l13 8-13 8z" />,
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  core: (
    <>
      <path d="M4 6h16M4 12h10M4 18h7" />
      <path d="M17 15l3 3-3 3" />
    </>
  ),
  help: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  research: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.5-4.5" />
    </>
  ),
  product: (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
    </>
  ),
  pricing: (
    <path d="M12 3v18M17 7.5c0-1.9-2.2-3-5-3s-5 1.1-5 3 2 2.6 5 3.5 5 1.6 5 3.5-2.2 3-5 3-5-1.1-5-3" />
  ),
  marketing: (
    <>
      <path d="M4 10v4l11 5V5z" />
      <path d="M15 9a3 3 0 0 1 0 6" />
    </>
  ),
  docs: (
    <>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5M10 13h6M10 17h6" />
    </>
  ),
  support: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  roadmap: <path d="M5 21V4m0 1h12l-2.5 4L17 13H5" />,
};

function Glyph({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`h-[46%] w-[46%] fill-none ${dark ? "stroke-black" : "stroke-[#e5e5e5]"}`}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/* A ring that pulses on the clicked link until its page arrives. */
function PendingRing() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <span aria-hidden className="absolute inset-0 animate-pulse rounded-[13px] border-2 border-white/70" />;
}

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export default function Dock() {
  const pathname = usePathname();
  // Open on the page it was opened on: navigating anywhere closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const wrapRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navId = useId();

  const close = useCallback(() => setOpenOn(null), []);

  // Tap or click outside, and Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useEffect(() => () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, []);

  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    if (open) return;
    setOpenOn(pathname);
  };

  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    leaveTimer.current = setTimeout(close, 350);
  };

  if (AUTH_ROUTES.includes(pathname)) return null;


  return (
    <div
      ref={wrapRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      data-dock
      className="fixed right-3 bottom-3 z-40 flex max-w-[calc(100vw-24px)] flex-col items-end sm:right-5 sm:bottom-5"
    >
      <div
        className={`border-hairline flex max-w-full flex-col-reverse items-end rounded-[22px] border bg-[#0f0f0f] shadow-[0_12px_40px_rgba(0,0,0,0.7)] sm:flex-row-reverse sm:items-end ${
          open ? "gap-2 px-2.5 py-2" : "p-1.5"
        }`}
      >
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={navId}
          aria-label={open ? "Close pages" : "Open pages"}
          onClick={() => (open ? close() : setOpenOn(pathname))}
          className="focus-visible:ring-accent group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white focus-visible:ring-2 focus-visible:outline-none"
        >
          <Glyph dark>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M5 12h14M12 5v14" />}
          </Glyph>
        </button>

        <nav
          id={navId}
          aria-label="Pages"
          hidden={!open}
          className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end"
        >
          {DOCK_GROUPS.map((group) => (
            <div key={group.id} role="group" aria-label={group.label} className="flex flex-col gap-1">
              <span className="text-ink-faint px-1 text-[11px] font-medium tracking-wide uppercase">
                {group.label}
              </span>
              <div className="flex flex-wrap items-end gap-1.5">
              {group.items.map((item) => {
                const current = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className="group relative flex w-[64px] shrink-0 flex-col items-center focus-visible:outline-none"
                  >
                    <span
                      className={`relative flex h-12 w-12 items-center justify-center rounded-[13px] border bg-[#111] group-focus-visible:ring-2 group-focus-visible:ring-white motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:scale-110 ${
                        current ? "border-[var(--color-status-progress)]" : "border-hairline group-hover:border-[#525252]"
                      }`}
                    >
                      <Glyph>{ICONS[item.icon]}</Glyph>
                      <PendingRing />
                    </span>
                    {/* Always visible: touch users never hover (H3). */}
                    <span
                      className={`mt-1 max-w-full truncate text-center text-[11px] leading-tight ${current ? "text-ink font-semibold" : "text-ink-muted group-hover:text-ink"}`}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
