import Link from "next/link";
import { featureSummary } from "@/lib/product/features";
import { isDonationConfigured } from "@/lib/support";

/*
  The public front page.

  Until now the root redirected a signed-out visitor straight to a sign-up
  form whose entire explanation was "a clean dashboard, your projects only".
  That asks for an email address before saying what the product is, which is
  the largest leak in a funnel whose stated goal is to gather users.

  The counts come from featureSummary() rather than being typed here, for the
  same reason /product derives them: a landing page that overstates what is
  built is the easiest thing in software to write by accident, and the hardest
  thing to notice afterwards.

  The section listing what is NOT built is deliberate and stays. A visitor who
  signs up expecting CFDI issuance and finds it missing is a worse outcome
  than one who never signs up — and every other page in this product labels
  its own uncertainty, so a marketing page that did not would be the one place
  the discipline broke.
*/

const PROBLEMS = [
  {
    title: "You invoiced $10,000 and received $9,533",
    body: "A persona moral withholds two thirds of the IVA and 10% of the ISR before paying you. FreeFlow shows both numbers, so the figure on your dashboard is the one that actually reaches your bank.",
  },
  {
    title: "The deadline and the invoice live in different tools",
    body: "A time tracker that cannot invoice, plus an invoicing tool that does not know your deadlines, is two subscriptions and two sources of truth. This is one.",
  },
  {
    title: "You find out you were not paid by remembering",
    body: "Overdue work surfaces itself and pins to the top of the dashboard. Nothing is late because you forgot to check.",
  },
];

const BUILT_HIGHLIGHTS = [
  "Projects, deadlines and cash flow in one dashboard",
  "Turn a client brief into a project with one paste",
  "Contract, payment link and retenciones on every project",
  "A layout you arrange once and it stays that way",
];

export default function LandingPage() {
  const s = featureSummary();
  const donations = isDonationConfigured();

  return (
    <main className="min-w-0 flex-1">
      <div className="relative">
        <div
          aria-hidden
          className="from-ink/[0.06] pointer-events-none absolute inset-x-0 top-0 h-80 bg-linear-to-b to-transparent"
        />

        <div className="relative mx-auto max-w-5xl page-stack px-5 sm:px-8 lg:px-10">
          {/* ---------- Hero ---------- */}
          <header className="max-w-3xl pt-6 sm:pt-10">
            <p className="text-ink-faint text-[11px] tracking-[0.14em] uppercase">
              For freelancers in Mexico
            </p>
            <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
              Know what you are owed, and what will actually arrive.
            </h1>
            <p className="text-ink-muted mt-4 text-base leading-relaxed">
              FreeFlow tracks your projects, deadlines and invoices in one
              place — and it understands retenciones, so it never tells you
              that you earned more than you did.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="bg-accent text-app focus-visible:ring-accent rounded-lg px-5 py-2.5 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
              >
                Create a free account
              </Link>
              <Link
                href="/product"
                className="border-hairline text-ink-muted hover:text-ink hover:border-ink-faint rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
              >
                See everything it does
              </Link>
            </div>

            <p className="text-ink-faint mt-4 text-xs">
              Free. No card, no trial that expires.{" "}
              {donations ? (
                <>
                  Funded by{" "}
                  <Link
                    href="/support"
                    className="text-ink-muted hover:text-ink underline-offset-4 hover:underline"
                  >
                    optional donations
                  </Link>
                  .
                </>
              ) : (
                <>Every feature, for everyone.</>
              )}
            </p>
          </header>

          {/* ---------- The problems ---------- */}
          <section aria-labelledby="problems-heading">
            <h2
              id="problems-heading"
              className="text-ink-faint text-[11px] tracking-[0.12em] uppercase"
            >
              What it is for
            </h2>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {PROBLEMS.map((p) => (
                <div
                  key={p.title}
                  className="border-hairline bg-surface rounded-lg border p-5"
                >
                  <h3 className="text-[15px] leading-snug font-semibold">
                    {p.title}
                  </h3>
                  <p className="text-ink-muted mt-2.5 text-sm leading-relaxed">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ---------- What exists ---------- */}
          <section
            aria-labelledby="built-heading"
            className="border-hairline bg-surface rounded-lg border p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="built-heading" className="text-[15px] font-semibold">
                Working today
              </h2>
              <span className="text-ink-faint numeric text-xs">
                {s.built} of {s.built + s.planned} planned capabilities
              </span>
            </div>
            <ul className="text-ink-muted mt-4 grid gap-2.5 text-sm sm:grid-cols-2">
              {BUILT_HIGHLIGHTS.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span aria-hidden className="text-ink-faint">
                    —
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </section>

          {/* ---------- What does not exist ---------- */}
          <section
            aria-labelledby="unbuilt-heading"
            className="border-hairline rounded-lg border border-dashed p-5 sm:p-6"
          >
            <h2 id="unbuilt-heading" className="text-[15px] font-semibold">
              What is not built yet
            </h2>
            <p className="text-ink-muted mt-2.5 text-sm leading-relaxed">
              FreeFlow does not issue CFDIs. Invoicing through an authorised
              PAC is one of the {s.planned} capabilities still on the list, and
              it needs a commercial contract that does not exist yet — so for
              now you issue the fiscal document elsewhere and track everything
              around it here.
            </p>
            <p className="text-ink-muted mt-2.5 text-sm leading-relaxed">
              That is worth knowing before you sign up rather than after. The
              full map of what is built and what is not is on the{" "}
              <Link
                href="/product"
                className="text-ink underline-offset-4 hover:underline"
              >
                product page
              </Link>
              , and the market research behind it is{" "}
              <Link
                href="/research"
                className="text-ink underline-offset-4 hover:underline"
              >
                published with sources
              </Link>
              .
            </p>
          </section>

          {/* ---------- Close ---------- */}
          <section className="border-hairline flex flex-wrap items-center justify-between gap-4 rounded-lg border p-5 sm:p-6">
            <div>
              <p className="text-[15px] font-semibold">
                It takes about ten seconds to start.
              </p>
              <p className="text-ink-muted mt-1 text-sm">
                An email and a password. Your dashboard starts empty and you
                add the first project.
              </p>
            </div>
            <Link
              href="/signup"
              className="bg-accent text-app focus-visible:ring-accent shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
            >
              Create a free account
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
