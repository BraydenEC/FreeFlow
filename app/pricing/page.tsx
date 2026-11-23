import Link from "next/link";
import PricingCta from "@/components/pricing/PricingCta";
import DonateButton from "@/components/support/DonateButton";
import { CONTACT_EMAIL } from "@/lib/site";
import {
  DONOR_PERK,
  isDonationConfigured,
  PRICING_FAQ,
  SUGGESTED_AMOUNTS,
  WHAT_IT_DOES_NOT_BUY,
  WHAT_IT_FUNDS,
} from "@/lib/support";

/*
  /pricing: free, and how to support it.

  The answer comes first (H9: testers couldn't find what FreeFlow costs). Then
  the optional donation, what it pays for and what it doesn't buy, the honest
  note about charging someday, and the questions people ask. The old revenue
  model (tiers, simulator, assumptions) was course work and is no longer shown;
  its components stay in components/pricing.

  /support redirects here (#support).
*/

export const metadata = {
  title: "Pricing — FreeFlow",
  description:
    "FreeFlow is free: every feature, for everyone. If it helps you, you can chip in to keep it running.",
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function PricingPage() {
  const configured = isDonationConfigured();

  return (
    <main className="mx-auto max-w-4xl page-stack px-5 sm:px-8">
      <header className="max-w-2xl">
        <h1 className="page-title">Pricing</h1>
        <p className="mt-3 text-2xl leading-snug font-semibold tracking-tight">Free. Every feature, for everyone.</p>
        <p className="text-ink-muted mt-3 text-sm leading-relaxed">
          No limits, no trial and no card. FreeFlow is made by one freelancer and runs on donations while it grows.
          If it saves you time or money, you can chip in to keep it going.
        </p>
        {/* M6: say plainly what FreeFlow doesn't do. */}
        <p className="text-ink-muted mt-2 text-sm leading-relaxed">
          FreeFlow tracks the invoices you send from other tools. It doesn&rsquo;t create or send invoices yet, and it
          doesn&rsquo;t issue Mexican CFDI invoices.
        </p>
        <div className="mt-5">
          <PricingCta />
        </div>
      </header>

      {/* ---------- The ask ---------- */}
      <section
        id="support"
        aria-labelledby="support-heading"
        className="border-hairline bg-surface scroll-mt-20 rounded-lg border p-5 sm:p-6"
      >
        <h2 id="support-heading" className="text-[15px] font-semibold">
          Support FreeFlow
        </h2>
        {configured ? (
          <>
            <p className="text-ink-muted mt-2 text-sm">
              One-time, any amount. The suggestions are what the project actually spends.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {SUGGESTED_AMOUNTS.map((a) => (
                <div key={a.usd} className="border-hairline flex flex-col rounded-lg border p-4">
                  <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">{a.label}</p>
                  <p className="numeric mt-1.5 text-2xl font-semibold tracking-tight">{usd.format(a.usd)}</p>
                  <p className="text-ink-faint mt-1.5 flex-1 text-xs">{a.covers}</p>
                  <DonateButton amountUsd={a.usd} variant="quiet" className="mt-4 min-h-11 justify-center">
                    Give {usd.format(a.usd)}
                  </DonateButton>
                </div>
              ))}
            </div>
            <div className="border-hairline mt-5 flex flex-wrap items-center gap-3 border-t pt-5">
              <DonateButton className="min-h-11">Choose your own amount</DonateButton>
              <span className="text-ink-faint text-xs">Handled by Stripe. FreeFlow never sees your card.</span>
            </div>
          </>
        ) : (
          <p className="text-ink-muted mt-2 text-sm leading-relaxed">
            Donations open soon. Until then, the best support is telling a freelancer friend about FreeFlow, or{" "}
            <a className="text-ink underline-offset-4 hover:underline" href={`mailto:${CONTACT_EMAIL}?subject=FreeFlow%20feedback`}>
              telling me what&rsquo;s missing
            </a>
            .
          </p>
        )}
        <p className="text-ink-muted border-hairline mt-5 border-t pt-4 text-sm leading-relaxed">
          <span className="text-ink font-medium">A thank-you:</span> {DONOR_PERK}
        </p>
      </section>

      {/* ---------- Where it goes ---------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="funds-heading" className="border-hairline bg-surface rounded-lg border p-5 sm:p-6">
          <h2 id="funds-heading" className="text-[15px] font-semibold">
            What it pays for
          </h2>
          <ul className="text-ink-muted mt-3 flex flex-col gap-2.5 text-sm">
            {WHAT_IT_FUNDS.map((line) => (
              <li key={line} className="flex gap-2.5">
                <span aria-hidden className="text-ink-faint">
                  —
                </span>
                {line}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="notbuy-heading" className="border-hairline rounded-lg border border-dashed p-5 sm:p-6">
          <h2 id="notbuy-heading" className="text-[15px] font-semibold">
            What it doesn&rsquo;t buy
          </h2>
          <ul className="text-ink-muted mt-3 flex flex-col gap-2.5 text-sm">
            {WHAT_IT_DOES_NOT_BUY.map((line) => (
              <li key={line} className="flex gap-2.5">
                <span aria-hidden className="text-ink-faint">
                  —
                </span>
                {line}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ---------- Someday ---------- */}
      <section aria-labelledby="later-heading" className="max-w-2xl">
        <h2 id="later-heading" className="text-[15px] font-semibold">
          Will FreeFlow always be free?
        </h2>
        <p className="text-ink-muted mt-2 text-sm leading-relaxed">
          Probably not forever. At some point FreeFlow will become a one-time purchase, not a subscription, once it has
          more users and has earned it. The price isn&rsquo;t set. You&rsquo;ll get plenty of notice before anything
          changes, you can always export your data, and donors get the paid version free.
        </p>
      </section>

      {/* ---------- Questions ---------- */}
      <section aria-labelledby="faq-heading" className="max-w-2xl">
        <h2 id="faq-heading" className="text-[15px] font-semibold">
          Questions
        </h2>
        <dl className="border-hairline mt-3 divide-y divide-[var(--color-hairline)] border-y">
          {PRICING_FAQ.map((f) => (
            <div key={f.q} className="py-4">
              <dt className="text-sm font-medium">{f.q}</dt>
              <dd className="text-ink-muted mt-1 text-sm leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="text-ink-faint mt-4 text-xs">
          More in the <Link href="/terms#donations" className="underline-offset-4 hover:underline">Terms</Link> and on
          the <Link href="/privacy" className="underline-offset-4 hover:underline">Privacy</Link> page.
        </p>
      </section>
    </main>
  );
}
