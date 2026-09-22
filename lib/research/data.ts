import type { Benchmark, Player, Risk } from "@/types/research";

/*
  Curated research seed data.

  Every figure here was fetched from the source's own page on 2026-08-31 —
  not recalled, not estimated, not taken from a comparison article. Full
  write-up with methodology: docs/week2/RESEARCH_FINDINGS.md

  Three rules this file follows, and any future edit must too:

  1. LIST PRICE, NOT PROMOTIONAL PRICE. FreshBooks currently advertises 90%
     off for three months. Recording $2.30 as "the price" would be exactly the
     misleading precision this module exists to prevent.

  2. CONFIDENCE IS HONEST, NOT UNIFORM. Vendor pricing is `verified`. Mexican
     tax law is `reported`, because the sources are advisory blogs rather than
     SAT primary documentation. Behavioural claims about substitutes are
     `estimated`, because they are judgment.

  3. NO FIGURE WITHOUT A SOURCE. If it cannot be cited it ships marked
     unverified rather than dressed up with a plausible citation.
*/

export const VERIFIED_ON = "2026-08-31";

/* ---------------------------------------------------------------------------
   Five global benchmarks
   --------------------------------------------------------------------------- */

export const BENCHMARKS: Benchmark[] = [
  {
    id: "harvest",
    name: "Harvest",
    headline: "Free forever for one seat",
    detail:
      "Time tracking, invoicing, and expenses at no cost for a single user with two projects. For a solo freelancer this is a real competitor, not a trial — any pricing argument has to beat free.",
    pricing: "Free · Teams $9/seat/mo · Enterprise $14/seat/mo",
    sourceUrl: "https://www.getharvest.com/pricing",
    verifiedOn: VERIFIED_ON,
    confidence: "verified",
  },
  {
    id: "bonsai",
    name: "Bonsai",
    headline: "The widest feature surface",
    detail:
      "Proposals, contracts, invoicing, and time tracking in one product. Also the most expensive: $59/user/mo at the top monthly tier, with Elite requiring three seats minimum.",
    pricing: "$15–$59/user/mo monthly · $9–$49 annual",
    sourceUrl: "https://www.hellobonsai.com/pricing",
    verifiedOn: VERIFIED_ON,
    confidence: "verified",
  },
  {
    id: "freshbooks",
    name: "FreshBooks",
    headline: "Accounting-first, priced accordingly",
    detail:
      "Full small-business accounting rather than freelance project tracking. List pricing is $23–$70/mo; the site currently advertises 90% off for three months, which is a promotion and not the price.",
    pricing: "List: Lite $23 · Plus $43 · Premium $70/mo",
    sourceUrl: "https://www.freshbooks.com/pricing",
    verifiedOn: VERIFIED_ON,
    confidence: "verified",
  },
  {
    id: "toggl",
    name: "Toggl Track",
    headline: "States the gap in its own words",
    detail:
      'Its invoicing feature is described as "Generate and download PDF invoices." In Mexico a PDF is a picture of a fiscal document, not a fiscal document — this single line is the clearest statement of the gap FreeFlow targets.',
    pricing: "Free · Starter $9 · Premium $14/license/mo",
    sourceUrl: "https://toggl.com/track/pricing/",
    verifiedOn: VERIFIED_ON,
    confidence: "verified",
  },
  {
    id: "clockify",
    name: "Clockify",
    headline: "The cheapest paid entry point",
    detail:
      "Free for up to five users, with invoicing from $5.49/seat/mo. Sets the floor on what anyone can charge for time tracking plus invoicing.",
    pricing: "Free (5 users) · $3.99–$11.99/seat/mo annual",
    sourceUrl: "https://clockify.me/pricing",
    verifiedOn: VERIFIED_ON,
    confidence: "verified",
  },
];

/* ---------------------------------------------------------------------------
   Competitors and substitutes
   --------------------------------------------------------------------------- */

export const PLAYERS: Player[] = [
  // --- Global freelance suites and time trackers: projects yes, CFDI no ---
  {
    id: "harvest",
    name: "Harvest",
    category: "time_tracking",
    region: "global",
    pricing: "Free · $9–$14/seat/mo",
    projectTracking: true,
    cfdi: false,
    note: "Free tier is genuinely free forever: 1 seat, 2 projects. No mention of CFDI or SAT anywhere on the pricing page.",
    sourceUrl: "https://www.getharvest.com/pricing",
    verifiedOn: VERIFIED_ON,
    confidence: "verified",
  },
  {
    id: "bonsai",
    name: "Bonsai",
    category: "freelance_suite",
    region: "global",
    pricing: "$15–$59/user/mo",
    projectTracking: true,
    cfdi: false,
    note: "Broadest freelance feature set — proposals, contracts, invoicing. Tax content is US-specific (IRS deductions). No CFDI.",
    sourceUrl: "https://www.hellobonsai.com/pricing",
    verifiedOn: VERIFIED_ON,
    confidence: "verified",
  },
  {
    id: "freshbooks",
    name: "FreshBooks",
    category: "freelance_suite",
    region: "global",
    pricing: "$23–$70/mo (list)",
    projectTracking: true,
    cfdi: false,
    note: "Accounting-first. Currently discounted 90% for three months; list price recorded here. No Mexico or CFDI reference.",
    sourceUrl: "https://www.freshbooks.com/pricing",
    verifiedOn: VERIFIED_ON,
    confidence: "verified",
  },
  {
    id: "toggl",
    name: "Toggl Track",
    category: "time_tracking",
    region: "global",
    pricing: "Free · $9–$18/license/mo",
    projectTracking: true,
    cfdi: false,
    note: 'Invoicing is explicitly "download PDF invoices" — not a fiscal document under Mexican law.',
    sourceUrl: "https://toggl.com/track/pricing/",
    verifiedOn: VERIFIED_ON,
    confidence: "verified",
  },
  {
    id: "clockify",
    name: "Clockify",
    category: "time_tracking",
    region: "global",
    pricing: "Free · $3.99–$11.99/seat/mo",
    projectTracking: true,
    cfdi: false,
    note: "Cheapest paid tier in the survey. Invoicing from Standard. No CFDI.",
    sourceUrl: "https://clockify.me/pricing",
    verifiedOn: VERIFIED_ON,
    confidence: "verified",
  },

  // --- Mexican invoicing: CFDI yes, projects no ---
  {
    id: "alegra",
    name: "Alegra México",
    category: "invoicing_cfdi",
    region: "mexico",
    pricing: "$187–$524 MXN/mo",
    projectTracking: false,
    cfdi: true,
    note: "Unlimited CFDI on all tiers. Project management and time tracking are not listed on any plan.",
    sourceUrl: "https://www.alegra.com/mexico/precios/",
    verifiedOn: VERIFIED_ON,
    confidence: "verified",
  },
  {
    id: "facturama",
    name: "Facturama",
    category: "invoicing_cfdi",
    region: "mexico",
    pricing: "$110–$1,650 MXN",
    projectTracking: false,
    cfdi: true,
    note: "All CFDI types with timbrado, plus payroll and an API. Invoicing and fiscal compliance only.",
    sourceUrl: "https://facturama.mx/",
    verifiedOn: VERIFIED_ON,
    confidence: "verified",
  },
  {
    id: "gigstack",
    name: "gigstack",
    category: "invoicing_cfdi",
    region: "mexico",
    pricing: "~$890 MXN/mo (Pro)",
    projectTracking: false,
    cfdi: true,
    note: "The closest threat. Modern CFDI automation that issues invoices from payment events — meaning it assumes something else already tracked the work. States plainly that it does not include project management, time tracking, or freelancer client tools.",
    sourceUrl: "https://gigstack.pro/",
    verifiedOn: VERIFIED_ON,
    confidence: "verified",
  },

  // --- Substitutes: what people actually use. Weighted equally on purpose. ---
  {
    id: "spreadsheet",
    name: "Excel / Google Sheets",
    category: "substitute",
    region: "global",
    pricing: "Free",
    projectTracking: true,
    cfdi: false,
    note: "The real incumbent. Total flexibility, no learning curve, already open. A free tool that works beats a paid tool that works slightly better.",
    sourceUrl: null,
    verifiedOn: null,
    confidence: "estimated",
  },
  {
    id: "whatsapp-notes",
    name: "WhatsApp + notes app",
    category: "substitute",
    region: "mexico",
    pricing: "Free",
    projectTracking: false,
    cfdi: false,
    note: "Where the client conversation already happens, so the project details live there by default. Nothing is tracked; it is recalled.",
    sourceUrl: null,
    verifiedOn: null,
    confidence: "estimated",
  },
  {
    id: "contador",
    name: "Contador (accountant)",
    category: "substitute",
    region: "mexico",
    pricing: "~$500–$2,000 MXN/mo",
    projectTracking: false,
    cfdi: true,
    note: "Outsource the fiscal half entirely. Common in Mexico and it genuinely solves CFDI — but it does not touch project or deadline tracking, and the price range here is unsourced.",
    sourceUrl: null,
    verifiedOn: null,
    confidence: "estimated",
  },
];

/* ---------------------------------------------------------------------------
   Risks
   --------------------------------------------------------------------------- */

export const RISKS: Risk[] = [
  {
    id: "mx-adds-projects",
    title: "A Mexican CFDI vendor adds project tracking",
    likelihood: 3,
    impact: 3,
    note: "The likeliest way this gap closes. gigstack or Alegra adding a project table is a small step; a US vendor implementing SAT and PAC integration is not. This is the uncomfortable one, and it belongs at the top.",
  },
  {
    id: "spreadsheets-win",
    title: "Freelancers keep using spreadsheets",
    likelihood: 3,
    impact: 3,
    note: "Free, familiar, already open, and it never goes down. The default outcome for most tools in this category.",
  },
  {
    id: "global-adds-cfdi",
    title: "A global suite adds CFDI support",
    likelihood: 1,
    impact: 3,
    note: "Requires PAC integration and Mexican tax expertise. A regulatory moat rather than a feature gap, which is why none of the five surveyed have crossed it.",
  },
  {
    id: "cfdi-changes",
    title: "CFDI regulations change again",
    likelihood: 3,
    impact: 2,
    note: "Raised from medium to high likelihood on 2026-09-01. The 3.3 to 4.0 migration invalidated existing integrations once, and the CFF reform effective January 2026 changed the rules again — this time adding an evidentiary obligation rather than a schema field. Building on the spec means inheriting its churn, and the churn is demonstrably ongoing.",
  },
  {
    id: "market-small",
    title: "Market too small for global vendors to care",
    likelihood: 2,
    impact: 1,
    note: "Low impact because it is the reason the opportunity exists at all. It explains the gap's persistence rather than threatening it.",
  },
  {
    id: "capacity",
    title: "Single-developer capacity",
    likelihood: 3,
    impact: 2,
    note: "An honest constraint on a course project. CFDI integration is the hardest half and it has not been attempted.",
  },
];

/* ---------------------------------------------------------------------------
   Derived — computed, never hardcoded, so the page cannot contradict the data
   --------------------------------------------------------------------------- */

export function researchSummary() {
  const bothHalves = PLAYERS.filter((p) => p.projectTracking && p.cfdi);
  return {
    playersSurveyed: PLAYERS.length,
    withProjectTracking: PLAYERS.filter((p) => p.projectTracking).length,
    withCfdi: PLAYERS.filter((p) => p.cfdi).length,
    /** The whole argument in one number. */
    withBoth: bothHalves.length,
    substitutes: PLAYERS.filter((p) => p.category === "substitute").length,
    sourced: PLAYERS.filter((p) => p.sourceUrl !== null).length,
    verifiedOn: VERIFIED_ON,
  };
}
