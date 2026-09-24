import { getDonateUrl } from "@/lib/support";

/*
  Sends someone to Stripe. Renders nothing when no link is configured, so a
  missing environment variable produces an absence rather than a dead button.

  A plain anchor, not a form or a client component: the whole transaction
  happens on Stripe, and there is nothing for this page to do afterwards.
*/
export default function DonateButton({
  amountUsd,
  children,
  variant = "primary",
  className = "",
}: {
  /** Pre-fills the amount where the payment link supports it. */
  amountUsd?: number;
  children: React.ReactNode;
  variant?: "primary" | "quiet";
  className?: string;
}) {
  const base = getDonateUrl();
  if (!base) return null;

  // Stripe payment links accept a prefilled amount for "customer chooses"
  // prices. Harmless where unsupported: Stripe ignores an unknown parameter.
  const href = amountUsd
    ? `${base}${base.includes("?") ? "&" : "?"}__prefilled_amount=${amountUsd * 100}`
    : base;

  const styles =
    variant === "primary"
      ? "bg-accent text-app rounded-lg px-4 py-2.5 text-sm font-semibold"
      : "border-hairline text-ink-muted hover:text-ink hover:border-ink-faint rounded-md border px-3 py-1.5 text-xs";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`focus-visible:ring-accent inline-flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none ${styles} ${className}`}
    >
      {children}
    </a>
  );
}
