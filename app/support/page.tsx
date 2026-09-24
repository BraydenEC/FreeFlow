import type { Metadata } from "next";
import Link from "next/link";
import SubNav from "@/components/SubNav";
import DonateButton from "@/components/support/DonateButton";
import {
  isDonationConfigured,
  SUGGESTED_AMOUNTS,
  WHAT_IT_DOES_NOT_BUY,
  WHAT_IT_FUNDS,
} from "@/lib/support";

export const metadata: Metadata = {
  title: "Support FreeFlow — free while we grow",
  description:
    "FreeFlow is free to use. Donations cover hosting, the domain, and keeping the SAT rules current.",
};

export const dynamic = "force-dynamic";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function SupportPage() {
  const configured = isDonationConfigured();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <SubNav />

      <main className="min-w-0 flex-1">
        <div className="relative mx-auto max-w-4xl page-stack px-5 sm:px-8 lg:px-10">
          <header className="max-w-2xl">
            <h1 className="page-title">Support FreeFlow</h1>
            <p className="text-ink-muted mt-3 text-sm leading-relaxed">
              FreeFlow is free. Every feature, for everyone, with no plan to
              put today&rsquo;s features behind a price later. The product is
              early and the useful thing right now is people using it, not
              revenue from the few who would pay before it has proven itself.
            </p>
            <p className="text-ink-muted mt-3 text-sm leading-relaxed">
              It does cost money to run, though, so if it is saving you
              something there is a button below. It is optional, it changes
              nothing about your account, and nothing here is gated behind it.
            </p>
          </header>

          {/* ---------- The ask ---------- */}
          <section
            aria-labelledby="amounts-heading"
            className="border-hairline bg-surface rounded-lg border p-5 sm:p-6"
          >
            <h2 id="amounts-heading" className="text-[15px] font-semibold">
              {configured ? "Pick an amount" : "Donations are not set up yet"}
            </h2>

            {configured ? (
              <>
                <p className="text-ink-muted mt-2 text-sm">
                  These are what the project actually spends, not tiers.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {SUGGESTED_AMOUNTS.map((a) => (
                    <div
                      key={a.usd}
                      className="border-hairline flex flex-col rounded-lg border p-4"
                    >
                      <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">
                        {a.label}
                      </p>
                      <p className="numeric mt-1.5 text-2xl font-semibold tracking-tight">
                        {usd.format(a.usd)}
                      </p>
                      <p className="text-ink-faint mt-1.5 flex-1 text-xs">
                        {a.covers}
                      </p>
                      <DonateButton
                        amountUsd={a.usd}
                        variant="quiet"
                        className="mt-4 justify-center"
                      >
                        Give {usd.format(a.usd)}
                      </DonateButton>
                    </div>
                  ))}
                </div>

                <div className="border-hairline mt-5 flex flex-wrap items-center gap-3 border-t pt-5">
                  <DonateButton>Choose your own amount</DonateButton>
                  <span className="text-ink-faint text-xs">
                    Handled by Stripe. FreeFlow never sees your card.
                  </span>
                </div>
              </>
            ) : (
              <p className="text-ink-muted mt-2 text-sm">
                The payment link has not been configured on this deployment, so
                there is nothing to click yet. Everything else on this page is
                still true: the product is free and it stays that way while it
                is early.
              </p>
            )}
          </section>

          {/* ---------- Where it goes ---------- */}
          <div className="grid gap-4 lg:grid-cols-2">
            <section
              aria-labelledby="funds-heading"
              className="border-hairline bg-surface rounded-lg border p-5 sm:p-6"
            >
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

            <section
              aria-labelledby="notbuy-heading"
              className="border-hairline rounded-lg border border-dashed p-5 sm:p-6"
            >
              <h2 id="notbuy-heading" className="text-[15px] font-semibold">
                What it does not buy
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
              <p className="text-ink-faint mt-4 text-xs">
                Saying this plainly matters more than the money. A donation
                that quietly bought influence would be a subscription wearing a
                different word.
              </p>
            </section>
          </div>

          {/* ---------- The honest bit about later ---------- */}
          <section
            aria-labelledby="later-heading"
            className="border-hairline bg-surface rounded-lg border p-5 sm:p-6"
          >
            <h2 id="later-heading" className="text-[15px] font-semibold">
              Will this always be free?
            </h2>
            <p className="text-ink-muted mt-3 text-sm leading-relaxed">
              Honestly: no, probably not forever. The intention is to charge
              eventually, and rather than being vague about it the whole model
              is already public — what the tiers would be, what each price is
              anchored to, and the revenue it would produce. You can read it
              on the{" "}
              <Link
                href="/pricing"
                className="text-ink underline-offset-4 hover:underline"
              >
                pricing page
              </Link>
              .
            </p>
            <p className="text-ink-muted mt-3 text-sm leading-relaxed">
              Nothing there is being charged today. It is published because a
              product that plans to charge later and will not say what or when
              is asking you to find out the hard way.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
