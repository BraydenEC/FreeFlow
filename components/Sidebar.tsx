/*
  Sidebar navigation.

  Week 0 shipped this as purely presentational: one route existed, so every
  item was an inert <span> rather than an href="#" link that goes nowhere.

  Week 1 adds a second real route. Items with an `href` are now genuine links
  with an active state driven by the current pathname; the rest keep the
  original inert treatment. The rule is unchanged — a link exists only if it
  leads somewhere.
*/

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href?: string;
};

/* Inline SVGs rather than an icon package: zero dependencies, zero network
   requests, and they inherit currentColor so active/dimmed states just work. */
const iconProps = {
  className: "h-[18px] w-[18px] shrink-0",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Core",
    href: "/core",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="3.25" />
        <path d="M12 2.75v3M12 18.25v3M21.25 12h-3M5.75 12h-3M18.36 5.64l-2.12 2.12M7.76 16.24l-2.12 2.12M18.36 18.36l-2.12-2.12M7.76 7.76 5.64 5.64" />
      </svg>
    ),
  },
  {
    label: "Research",
    href: "/research",
    icon: (
      <svg {...iconProps}>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 4.5 4.5" />
      </svg>
    ),
  },
  {
    label: "Product",
    href: "/product",
    icon: (
      <svg {...iconProps}>
        <path d="M12 2.5 3.5 7v10L12 21.5 20.5 17V7Z" />
        <path d="M3.5 7 12 11.5 20.5 7M12 11.5v10" />
      </svg>
    ),
  },
  {
    label: "Pricing",
    href: "/pricing",
    icon: (
      <svg {...iconProps}>
        <path d="M12 2.5v19M16.5 6.5H9.75a2.75 2.75 0 0 0 0 5.5h4.5a2.75 2.75 0 0 1 0 5.5H7" />
      </svg>
    ),
  },
  {
    label: "Projects",
    icon: (
      <svg {...iconProps}>
        <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2.5h9A1.5 1.5 0 0 1 21 10v7.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5Z" />
      </svg>
    ),
  },
  {
    label: "Time Tracking",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 1.75" />
      </svg>
    ),
  },
  {
    label: "Settings",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-1 1.47V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9.1 19.4a1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.47-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9.1a1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.6 1.6 0 0 0 1.77.32H9a1.6 1.6 0 0 0 1-1.47V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.32 1.77V9a1.6 1.6 0 0 0 1.47 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.47 1Z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-hairline bg-surface flex w-16 shrink-0 flex-col border-r md:w-60">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-4 md:px-5">
        <span className="bg-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white">
          S
        </span>
        <span className="hidden text-[15px] font-semibold tracking-tight md:inline">
          Service<span className="text-accent-soft">Pro</span>
        </span>
      </div>

      <nav aria-label="Main" className="flex flex-col gap-1 px-2 py-4 md:px-3">
        {NAV_ITEMS.map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`focus-visible:ring-accent flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                pathname === item.href
                  ? "bg-accent/10 text-accent-soft"
                  : "text-ink-muted hover:bg-raised/50 hover:text-ink"
              }`}
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          ) : (
            <span
              key={item.label}
              aria-disabled="true"
              className="text-ink-faint/70 flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium"
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </span>
          ),
        )}
      </nav>

      {/* Single-user context — no auth this sprint, so this is a static stamp
          rather than a session-backed account menu. */}
      <div className="border-hairline mt-auto hidden border-t p-4 md:block">
        <div className="flex items-center gap-2.5">
          <span className="bg-raised text-ink-muted flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
            BC
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium">Brayden C.</p>
            <p className="text-ink-faint truncate text-[11px]">Freelance</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
