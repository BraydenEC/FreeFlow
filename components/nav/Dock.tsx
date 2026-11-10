"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { DOCK_GROUPS, type DockIcon } from "@/lib/nav/dock";
import { iconSize } from "@/lib/nav/magnify";

/*
  The Dock: every page, one round button at the bottom of the screen.

  At rest it is a single button, bottom-centre, on every page. Hovering it with
  a mouse, or clicking or tapping it, opens every page in four groups.
  Icons grow as the mouse passes over them (as on a Mac), a label shows on
  hover and on keyboard focus, and a dot marks the page you're on. It closes
  350 ms after the mouse leaves, on a tap outside, on Escape (focus returns to
  the button) and after you navigate.

  No magnification on touch or under prefers-reduced-motion; those visitors
  get the plain base size. At 375 px the open Dock scrolls sideways inside
  itself, never the page.
*/

const BASE = 48;

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

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export default function Dock() {
  const pathname = usePathname();
  // Open on the page it was opened on: navigating anywhere closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const [calm, setCalm] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const iconRefs = useRef<HTMLSpanElement[]>([]);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Hover-opening widens the centred bar, which moves the toggle out from under
  // the mouse. Until `armed`, page icons ignore the pointer, so a click aimed
  // at the toggle can't land on a page and navigate away.
  const [armed, setArmed] = useState(true);
  const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navId = useId();

  // Reduced motion: no magnification and no transitions.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setCalm(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const resetSizes = useCallback(() => {
    for (const el of iconRefs.current) el?.style.setProperty("--s", `${BASE}px`);
  }, []);

  const close = useCallback(() => {
    setOpenOn(null);
    resetSizes();
  }, [resetSizes]);

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
    if (armTimer.current) clearTimeout(armTimer.current);
  }, []);

  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    if (open) return;
    setArmed(false);
    if (armTimer.current) clearTimeout(armTimer.current);
    armTimer.current = setTimeout(() => setArmed(true), 450);
    setOpenOn(pathname);
  };

  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    resetSizes();
    leaveTimer.current = setTimeout(close, 350);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!open || calm || e.pointerType !== "mouse") return;
    for (const el of iconRefs.current) {
      if (!el) continue;
      const r = el.parentElement!.getBoundingClientRect();
      el.style.setProperty("--s", `${iconSize(e.clientX - (r.left + r.width / 2))}px`);
    }
  };

  let index = 0;
  const motion = calm ? "" : "transition-[width,height] duration-100 ease-out";

  return (
    <div
      ref={wrapRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className="fixed bottom-4 left-1/2 z-40 flex max-w-[calc(100vw-24px)] -translate-x-1/2 flex-col items-center"
    >
      <div
        onPointerMove={onPointerMove}
        className={`border-hairline flex max-w-full items-end rounded-[22px] border bg-[rgba(15,15,15,0.72)] shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl ${
          open ? "gap-1.5 px-2.5 py-2" : "p-1.5"
        }`}
      >
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={navId}
          aria-label={open ? "Close pages" : "Open pages"}
          onClick={() => {
            // A click that arrives just after hover opened the Dock was aimed
            // at opening it: keep it open.
            if (open && !armed) setArmed(true);
            else if (open) close();
            else setOpenOn(pathname);
          }}
          className="focus-visible:ring-accent group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white focus-visible:ring-2 focus-visible:outline-none"
        >
          <Glyph dark>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M5 12h14M12 5v14" />}
          </Glyph>
        </button>

        {/* Scrolling sideways (for 375 px screens) clips vertically too, so the
            nav carries 80 px of transparent headroom, pulled back up with a
            negative margin, for the labels and the magnified icons. */}
        <nav
          id={navId}
          aria-label="Pages"
          hidden={!open}
          className={`-mt-20 -mb-2 flex min-w-0 items-end gap-1.5 overflow-x-auto pt-20 pb-2 ${armed ? "" : "pointer-events-none"}`}
        >
          {DOCK_GROUPS.map((group) => (
            <div key={group.id} role="group" aria-label={group.label} className="flex items-end gap-1.5">
              <span aria-hidden className="bg-hairline mx-1 mb-1.5 h-9 w-px shrink-0 self-end" />
              {group.items.map((item) => {
                const i = index++;
                const current = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className="group relative flex shrink-0 flex-col items-center focus-visible:outline-none"
                  >
                    {/* The label is the link's accessible name too: visually it
                        appears only on hover and keyboard focus. */}
                    <span
                      className="pointer-events-none absolute bottom-[calc(100%+10px)] rounded-md bg-white px-2 py-1 text-xs font-semibold whitespace-nowrap text-black opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      {item.label}
                    </span>
                    <span
                      ref={(el) => {
                        if (el) iconRefs.current[i] = el;
                      }}
                      style={{ "--s": `${BASE}px` } as React.CSSProperties}
                      className={`flex h-[var(--s)] w-[var(--s)] items-center justify-center rounded-[13px] border bg-[#111] group-focus-visible:ring-2 group-focus-visible:ring-white ${motion} ${
                        current ? "border-[var(--color-status-progress)]" : "border-hairline group-hover:border-[#525252]"
                      }`}
                    >
                      <Glyph>{ICONS[item.icon]}</Glyph>
                    </span>
                    <span
                      aria-hidden
                      className={`mt-1 h-1 w-1 rounded-full ${current ? "bg-[var(--color-status-progress)]" : "bg-transparent"}`}
                    />
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
