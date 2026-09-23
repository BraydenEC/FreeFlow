import type { Assumption, Segment, Tier } from "@/types/pricing";

/*
  Tiers, segments, and assumptions.

  Every price here is anchored to a competitor figure fetched and dated in
  Week 2 (docs/week2/RESEARCH_FINDINGS.md), not chosen because it looked
  plausible. Inventing prices is the exact failure this module invites, and the
  research already did the work to avoid it.
*/

/*
  FX rate, fixed and dated rather than live.

  A live rate needs an API, a key, and a dependency, and nobody checks whether
  it is current anyway. A stated rate with a date is more honest: the reader can
  see exactly how stale it is.
*/
export const USD_TO_MXN = 17.21;
export const FX_DATE = "2026-09-19";
export const FX_SOURCE = "https://open.er-api.com/v6/latest/USD";

export function toMxn(usd: number): number {
  return usd * USD_TO_MXN;
}

/* ---------------------------------------------------------------------------
   Tiers
   --------------------------------------------------------------------------- */

export const TIERS: Tier[] = [
  {
    id: "solo",
    name: "Solo",
    monthlyUsd: 0,
    audience: "One freelancer, up to 3 active projects",
    // Phrased as upkeep because that is what the Week 2 interviewee said he
    // would actually pay for: "someone dedicated to building it and constantly
    // gave updates to it".
    pitch: "Free forever, and kept working. The tracker stays current with SAT changes whether or not you pay.",
    includes: [
      "Up to 3 active projects",
      "Time and deadline tracking",
      "Brief extraction (/core)",
      "No CFDI issuance",
    ],
    anchor:
      "Harvest is free forever for 1 seat and 2 projects. A paid entry tier loses to free before the argument starts, so Solo is free and beats it by one project.",
    anchorSourceUrl: "https://www.getharvest.com/pricing",
  },
  {
    id: "pro",
    name: "Pro",
    monthlyUsd: 14,
    audience: "A freelancer billing hourly or on retainer, in Mexico",
    pitch:
      "One system instead of two. Projects, hours, and a CFDI that is legally an invoice — maintained as the rules change.",
    includes: [
      "Unlimited projects",
      "CFDI 4.0 issuance via an authorized PAC",
      "Materialidad evidence linked to each invoice",
      "Everything in Solo",
    ],
    // The strongest pricing argument the research produced.
    anchor:
      "A Segment A freelancer today pays for a tracker and an invoicing tool separately: Harvest Teams at $9/mo plus Alegra Inicial at $187 MXN (~$11/mo) is about $20/mo. Pro replaces both at $14.",
    anchorSourceUrl: "https://www.alegra.com/mexico/precios/",
  },
  {
    id: "studio",
    name: "Studio",
    monthlyUsd: 12,
    audience: "2–5 people working under one name",
    pitch:
      "Per seat, so it scales with the team. See across everyone and find which work is actually profitable.",
    includes: [
      "Everything in Pro, per seat",
      "Cross-person project view",
      "Per-person profitability",
      "Minimum 2 seats",
    ],
    anchor:
      "Priced below Pro per seat because volume should cost less per head, and well under Bonsai's $59/user/mo top monthly tier.",
    anchorSourceUrl: "https://www.hellobonsai.com/pricing",
  },
  {
    id: "project",
    name: "Project",
    monthlyUsd: 9,
    audience: "Fixed-price work, billed per job rather than per month",
    // The pitch cannot be "replaces two tools", because this person only uses
    // one of the two. It has to be the thing they actually buy, which the
    // Week 2 interviewee named himself: someone keeping it current.
    pitch:
      "For one-time projects. Fewer invoices, each one legally correct — and kept correct as the SAT rules move.",
    includes: [
      "Unlimited projects",
      "CFDI 4.0 issuance via an authorized PAC",
      "Contract and payment link on every project",
      "No time tracking — it is not what you bill on",
    ],
    // Honest anchor: their alternative is NOT the two-tool stack Pro replaces.
    // They do not reconcile hours, so they are only buying invoicing. Pricing
    // against the full stack would be pricing against a cost they never had.
    anchor:
      "A fixed-price seller does not reconcile hours, so their real alternative is an invoicing tool alone: Alegra Inicial at 187 MXN (~$10.87/mo). Project is $9 and also holds the contract and the payment record.",
    anchorSourceUrl: "https://www.alegra.com/mexico/precios/",
  },
];

export function tierById(id: Tier["id"]): Tier {
  const t = TIERS.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown tier: ${id}`);
  return t;
}

/* ---------------------------------------------------------------------------
   Segments
   --------------------------------------------------------------------------- */

export const SEGMENTS: Segment[] = [
  {
    id: "freelancer",
    name: "Hourly / retainer freelancer (Mexico)",
    description:
      "Designer, developer, or consultant billing by time across roughly 3–8 concurrent clients. Has hours to reconcile and needs a CFDI every time they invoice.",
    defaultTier: "pro",
  },
  {
    id: "studio",
    name: "Small studio (2–5 people)",
    description:
      "Two to five freelancers working under one name. The same problem multiplied, plus a need to see across people.",
    defaultTier: "studio",
  },
  {
    id: "project",
    name: "Fixed-price, per-project freelancer",
    description:
      "Sells one-time work — installs, builds, launches — priced per job rather than by the hour or on retainer. Few invoices, each one large, each one needing to be a valid CFDI. Excluded from the Week 3 model; see below for what changed.",
    defaultTier: "project",
  },
];

/*
  The segment that is deliberately NOT modelled.

  This is not a hypothetical. The Week 2 validation conversation was with
  exactly this person, and a revenue model that counted him would be fiction
  from its first input.
*/
export const EXCLUDED_SEGMENT = {
  name: "Fixed-price, one-time sellers",
  quote:
    "I sell 1 time install shit so not a retainer model and it's always priced per job too so I haven't had a problem with tracking",
  why: "No recurring workflow to subscribe to, no hours to reconcile, no repeat invoicing rhythm. A per-seat monthly subscription does not fit this person, and he said so directly when asked.",
  source: "Week 2 human validation conversation, recorded verbatim",

  /*
    Revised after the full interview transcript was reviewed.

    The original exclusion rested on one sentence. The transcript contained
    another, from the same person, pointing the opposite way — and the second
    one is about why he would buy rather than build:

      "with a lot of products it's just a degrading asset, the code starts to
       rot from day 1 of being shipped ... if there was someone dedicated to
       building [it] and constantly gave updates to it I'd def rather use his
       and just do minor tweaking than build my own from scratch."

    So he is a subscription customer who sells one-time work. Those are not in
    conflict: what recurs is not his billing, it is the maintenance he is
    renting. The original reasoning confused the two.
  */
  revised: {
    on: "2026-09-23",
    stillTrue:
      "The original objection holds where it was aimed. He has no hours to reconcile and no repeat invoicing rhythm, so the Pro pitch — one system instead of two — does not describe him. He is buying one tool, not replacing two.",
    whatChanged:
      "He described, unprompted, wanting to rent something maintained rather than build it. That is a recurring purchase, and it is what the Project tier sells: the rules staying current, not a workflow to log into every day.",
    effectOnModel:
      "None. The Week 3 revenue model is unchanged and still excludes this segment — base remains $32,261 ARR, exactly as submitted. This segment is priced and estimated separately so no figure in that packet moves.",
  },
};

/* ---------------------------------------------------------------------------
   Assumptions — every input, with what breaks if it is wrong
   --------------------------------------------------------------------------- */

export const ASSUMPTIONS: Assumption[] = [
  {
    id: "pro-price",
    label: "Pro at $14/month",
    value: "$14 USD · " + Math.round(toMxn(14)) + " MXN",
    ifWrong:
      "If freelancers will not pay more than the tracker alone, Pro has to sit near $9 and the whole model loses roughly a third of its revenue.",
    sourceUrl: "https://www.alegra.com/mexico/precios/",
    confidence: "verified",
  },
  {
    id: "solo-free",
    label: "Solo is free",
    value: "$0",
    ifWrong:
      "If free users never convert, Solo is pure cost. The model assumes a conversion share rather than treating free users as revenue.",
    sourceUrl: "https://www.getharvest.com/pricing",
    confidence: "verified",
  },
  {
    id: "fx",
    label: "FX rate",
    value: `1 USD = ${USD_TO_MXN} MXN (${FX_DATE})`,
    ifWrong:
      "Peso prices drift with the rate. Stated and dated rather than live, so staleness is visible.",
    sourceUrl: FX_SOURCE,
    confidence: "verified",
  },
  {
    id: "churn",
    label: "Monthly churn",
    value: "5% base · 9% conservative · 3% optimistic",
    ifWrong:
      "Churn compounds. At 9% monthly, 100 accounts become 31 within a year rather than 54 — the single largest lever in this model.",
    sourceUrl: null,
    confidence: "estimated",
  },
  {
    id: "growth",
    label: "Monthly account growth",
    value: "8% base · 2% conservative · 15% optimistic",
    ifWrong:
      "No acquisition data exists. This is a guess, and the Week 2 interviewee said his own hardest problem was 'getting clients' — acquisition is not solved by having a product.",
    sourceUrl: null,
    confidence: "estimated",
  },
  {
    id: "paid-share",
    label: "Share of freelancers on Pro rather than free Solo",
    value: "35% base · 12% conservative · 55% optimistic",
    ifWrong:
      "The most flattering number in the model. Free-to-paid conversion for solo tools is usually low single digits, and the base case here is deliberately generous.",
    sourceUrl: null,
    confidence: "estimated",
  },
  {
    id: "annual-share",
    label: "Share paying annually",
    value: "30% base",
    ifWrong:
      "Annual billing is discounted, so a higher annual share lowers MRR while improving retention. Pulls in both directions.",
    sourceUrl: null,
    confidence: "estimated",
  },
  {
    id: "seats",
    label: "Seats per studio",
    value: "3",
    ifWrong:
      "Studio revenue scales linearly with this. The segment is defined as 2–5 people, so 3 is the midpoint rather than a measurement.",
    sourceUrl: null,
    confidence: "estimated",
  },
  {
    id: "pac-cost",
    label: "PAC stamping cost — NOT MODELLED",
    value: "omitted",
    ifWrong:
      "Issuing a CFDI has a real per-stamp cost through an authorized PAC. No sourced figure was available, so it is left out rather than guessed. Every revenue number here is therefore gross, not net.",
    sourceUrl: null,
    confidence: "estimated",
  },
];
