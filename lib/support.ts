/*
  The donation funnel.

  FreeFlow is free while it grows, and /pricing is built around asking for
  optional support. Someday it becomes a one-time purchase; until then,
  donations are the only way to fund it, and every donor gets the paid version
  free when it launches (DONOR_PERK).

  WHY A PAYMENT LINK RATHER THAN AN INTEGRATION
  A Stripe Checkout integration needs a secret key, a webhook endpoint, and a
  fourth dependency, and it would put this project's first card-handling
  surface into a codebase that has never needed one. A Payment Link is created
  in the Stripe dashboard, carries no secret, and is a URL. Everything that
  could go wrong with it goes wrong on Stripe's side, which is where it should.

  The trade is that the app never learns who donated. That is acceptable at
  this stage — nothing in the product is gated on donating, and building a
  ledger for a number that is currently zero would be building for a problem
  nobody has yet.

  DEGRADING WITHOUT THE URL
  DONATE_URL is optional, exactly like the Anthropic key. With it absent the
  support page still explains the situation and simply does not render a
  button, so a missing environment variable cannot produce a dead link or a
  broken deploy.
*/


export type SuggestedAmount = {
  usd: number;
  label: string;
  /** What this actually covers. Real costs, not invented tiers. */
  covers: string;
};

/*
  Amounts anchored to real running costs rather than picked because they look
  like pricing tiers. The figures below are what this project actually spends:
  a domain, a Supabase project, and model usage on /core.
*/
export const SUGGESTED_AMOUNTS: SuggestedAmount[] = [
  {
    usd: 5,
    label: "Coffee",
    covers: "About a month of the AI reading behind Paste a brief.",
  },
  {
    usd: 15,
    label: "A month of hosting",
    covers: "Roughly what the database and deployment cost to keep running.",
  },
  {
    usd: 50,
    label: "A year of the domain",
    covers: "Keeps freeflow.website registered and the certificates renewing.",
  },
];

/** What the money is for, stated plainly rather than as marketing. */
export const WHAT_IT_FUNDS = [
  "Keeping the Mexican tax rules (IVA and ISR withholding) current as they change, the part that goes stale fastest if nobody maintains it.",
  "Hosting, the database, and the domain.",
  "The AI reading behind Paste a brief, which costs money per request.",
] as const;

/** What donating does NOT buy. Said out loud so nobody assumes otherwise. */
export const WHAT_IT_DOES_NOT_BUY = [
  "Features today. Everything in FreeFlow is available to everyone, donor or not.",
  "Priority support. There is no support queue to be at the front of.",
  "A say in the roadmap beyond what any user gets by asking.",
] as const;

/** The one thank-you donors get. Repeated word for word wherever it is promised. */
export const DONOR_PERK =
  "Anyone who donates, any amount, before the paid version launches gets it free. Donate with the same email as your FreeFlow account so it can be matched.";

export type FaqEntry = { q: string; a: string };

/** /pricing's questions, in the order people ask them. No price for FreeFlow itself. */
export const PRICING_FAQ: FaqEntry[] = [
  {
    q: "Is FreeFlow really free?",
    a: "Yes. Every feature, for everyone, with no limits and no card needed. Donations are optional and unlock nothing.",
  },
  {
    q: "Will I have to pay later?",
    a: "At some point FreeFlow will become a one-time purchase, not a subscription. The price isn't set. You'll get plenty of notice before that happens, and nothing you have will be charged for unless you choose to buy it.",
  },
  {
    q: "What do donors get?",
    a: DONOR_PERK,
  },
  {
    q: "Can I take my data with me?",
    a: "Yes. The dashboard can export every project as a CSV at any time, free now and after the paid version launches.",
  },
  {
    q: "Does FreeFlow send invoices?",
    a: "No. FreeFlow tracks the invoices you send from other tools; it doesn't create or send invoices yet, and it doesn't issue Mexican CFDI invoices.",
  },
  {
    q: "Is my data private?",
    a: "Your projects are private to your account, protected by row-level security, and never sold or shared. The Privacy page says exactly what is kept.",
  },
];

/**
 * The Stripe Payment Link, or null when it is not configured.
 *
 * NEXT_PUBLIC_ because a payment link is a public URL by design — it is meant
 * to be shared. It carries no key and grants no access.
 */
export function getDonateUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_DONATE_URL?.trim();
  if (!url) return null;
  // A link without a scheme would render as a relative path and 404 inside
  // the app, which is the same failure the contract links guard against.
  return /^https:\/\/\S+$/i.test(url) ? url : null;
}

export function isDonationConfigured(): boolean {
  return getDonateUrl() !== null;
}
