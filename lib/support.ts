/*
  The donation funnel.

  FreeFlow is free while it gathers users. That is a deliberate stage, not an
  absence of a plan: the pricing work on /pricing is what the product intends
  to move to, and until then the only way to fund development is to ask.

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
    covers: "About a month of the model calls behind brief extraction.",
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
  "Keeping the SAT and CFDI rules current as they change — the part of this product that rots fastest if nobody maintains it.",
  "Hosting, the database, and the domain.",
  "Model usage for brief extraction, which costs money per request.",
] as const;

/** What donating does NOT buy. Said out loud so nobody assumes otherwise. */
export const WHAT_IT_DOES_NOT_BUY = [
  "Features. Everything in FreeFlow is available to everyone, donor or not.",
  "Priority support. There is no support queue to be at the front of.",
  "A say in the roadmap beyond what any user gets by asking.",
] as const;

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
