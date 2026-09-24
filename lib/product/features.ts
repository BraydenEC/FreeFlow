import type { TierId } from "@/types/pricing";

/*
  The product feature map.

  Every entry marked `built` corresponds to code in this repository, shipped in
  the week noted. Nothing is listed as built because it is planned or nearly
  done — a feature map that quietly includes intentions is a roadmap wearing a
  product's clothes, and this one is checkable against the commit history.
*/

export type FeatureStatus = "built" | "planned";

export type Feature = {
  id: string;
  name: string;
  description: string;
  status: FeatureStatus;
  /** Lowest tier that includes it. Null when not yet assigned. */
  tier: TierId | null;
  /** Which week shipped it, for anything already built. */
  shippedIn: string | null;
  /** Live route, where one exists. */
  route: string | null;
};

export type FeatureGroup = {
  id: string;
  name: string;
  purpose: string;
  features: Feature[];
};

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "track",
    name: "Track the work",
    purpose:
      "The question a freelancer opens the tool to answer: what am I owed, and what is due next.",
    features: [
      {
        id: "dashboard",
        name: "Cash-flow dashboard",
        description:
          "Unpaid invoices, this month's earnings, and active project count — all derived from the data rather than stored, so the cards cannot contradict the table beneath them.",
        status: "built",
        tier: "solo",
        shippedIn: "Week 0",
        route: "/",
      },
      {
        id: "projects",
        name: "Project & deadline table",
        description:
          "Client, financial value, days remaining, and one of four actionable statuses. Deadlines are computed against today rather than stored, so they never rot.",
        status: "built",
        tier: "solo",
        shippedIn: "Week 0",
        route: "/",
      },
      {
        id: "create-project",
        name: "Create, correct, and remove a project",
        description:
          "A project can be added from the dashboard and edited afterwards. Payment state is deliberately not editable here — it is owned by the mark-paid action, so an edit cannot quietly take money back out of the monthly earnings figure.",
        status: "built",
        tier: "solo",
        shippedIn: "After Week 3",
        route: "/",
      },
      {
        id: "mark-paid",
        name: "Record a payment",
        description:
          "Marks a project paid and dates it. The dashboard had computed this month's earnings from that flag since Week 0 with no way to set it, which made the headline number unmaintainable without database access.",
        status: "built",
        tier: "solo",
        shippedIn: "After Week 3",
        route: "/",
      },
      {
        id: "contract-record",
        name: "Contract and payment links",
        description:
          "A signed-contract date and links to the contract and the Stripe invoice. From the validation interview: the signature is what the interviewee credits with never having been stood up, and it had nowhere to live.",
        status: "built",
        tier: "project",
        shippedIn: "After Week 3",
        route: "/",
      },
      {
        id: "overdue-alert",
        name: "Overdue alert",
        description:
          "Appears only when something is actually overdue, and pins itself above everything else. A layout that hides a late invoice under a research panel has its priorities wrong.",
        status: "built",
        tier: "solo",
        shippedIn: "After Week 3",
        route: "/",
      },
      {
        id: "resilience",
        name: "Works without a database",
        description:
          "Every data path falls back rather than failing, and the page reports which path produced it. Not a feature anyone asks for, but the reason the product is demonstrable under failure.",
        status: "built",
        tier: "solo",
        shippedIn: "Week 0",
        route: "/",
      },
    ],
  },
  {
    id: "account",
    name: "Own your data",
    purpose:
      "Everything above belongs to somebody. Until accounts existed the product was a single shared dataset with the door open.",
    features: [
      {
        id: "accounts",
        name: "Accounts and per-user data",
        description:
          "Email sign-up, and row-level security scoped to the signed-in user on every table. A new account starts empty rather than showing demo data, because six fictional projects on the first screen would be a lie.",
        status: "built",
        tier: "solo",
        shippedIn: "After Week 3",
        route: "/signup",
      },
      {
        id: "password-reset",
        name: "Password reset",
        description:
          "Request a link, choose a new password. Could not be built until outbound mail worked; before that a locked-out user needed the database owner to intervene.",
        status: "built",
        tier: "solo",
        shippedIn: "After Week 3",
        route: "/forgot-password",
      },
      {
        id: "currency",
        name: "Eleven currencies",
        description:
          "Amounts are written the way your region writes them, not the way the United States does. One currency per account and nothing is ever converted, because summing across currencies would need live rates and an invented rate is worse than no feature.",
        status: "built",
        tier: "solo",
        shippedIn: "After Week 3",
        route: "/",
      },
      {
        id: "export",
        name: "Export to CSV",
        description:
          "Every project as a spreadsheet, with the retenciones already worked out where they apply and omitted entirely where they do not. A tracker you cannot export from is a tracker you cannot leave.",
        status: "built",
        tier: "solo",
        shippedIn: "After Week 3",
        route: "/",
      },
      {
        id: "preferences",
        name: "Saved layout preferences",
        description:
          "Density, which dashboard widgets appear, their order and width, and whether explanatory prose is shown. Stored against the account, so the layout follows the person rather than the browser.",
        status: "built",
        tier: "solo",
        shippedIn: "After Week 3",
        route: "/",
      },
    ],
  },
  {
    id: "plan",
    name: "See what is coming",
    purpose:
      "Everything else answers what happened or what is late. This is the part that answers whether next month is going to be fine.",
    features: [
      {
        id: "forecast",
        name: "Six-month cash-flow forecast",
        description:
          "Reads your deadlines and payment terms and projects what lands in each of the next six months, net of withholding. Reports what is scheduled and what is likely separately, because a single blended number hides which one you are reading.",
        status: "built",
        tier: "solo",
        shippedIn: "After Week 3",
        route: "/",
      },
      {
        id: "payment-terms",
        name: "Payment terms per project",
        description:
          "A deadline is not a payment date. Each project records how long its client takes to pay, falling back to your account default, so the forecast reflects how you actually get paid rather than an assumption.",
        status: "built",
        tier: "solo",
        shippedIn: "After Week 3",
        route: "/",
      },
    ],
  },
  {
    id: "capture",
    name: "Get the work in",
    purpose:
      "The failure mode of Week 0's product: a tracker nobody populates is worse than a spreadsheet, because the spreadsheet was already open.",
    features: [
      {
        id: "extraction",
        name: "Brief extraction",
        description:
          "Paste a client email and get a structured project: name, client, rate, hours, deadline, status, and a note saying what it was unsure about.",
        status: "built",
        tier: "solo",
        shippedIn: "Week 1",
        route: "/core",
      },
      {
        id: "relative-dates",
        name: "Relative date resolution",
        description:
          '"End of next month" becomes a real date, resolved against today. Pattern matching cannot do this, which is why the module calls a model.',
        status: "built",
        tier: "solo",
        shippedIn: "Week 1",
        route: "/core",
      },
      {
        id: "provenance",
        name: "Extraction provenance",
        description:
          "Every result states whether a model or pattern matching produced it, and that is stored on the saved row. Degradation announces itself instead of hiding.",
        status: "built",
        tier: "solo",
        shippedIn: "Week 1",
        route: "/core",
      },
    ],
  },
  {
    id: "evidence",
    name: "Know the market",
    purpose:
      "Evidence the problem is real, and that no surveyed product solves both halves of it.",
    features: [
      {
        id: "benchmarks",
        name: "Competitor & substitute analysis",
        description:
          "Eleven products and substitutes with verified pricing, filterable by category and region. Zero of them do both project tracking and CFDI.",
        status: "built",
        tier: "solo",
        shippedIn: "Week 2",
        route: "/research",
      },
      {
        id: "confidence",
        name: "Confidence on every claim",
        description:
          "Each factual row carries verified, reported, or estimated, and an unsourced claim renders visibly unsourced rather than passing as fact.",
        status: "built",
        tier: "solo",
        shippedIn: "Week 2",
        route: "/research",
      },
      {
        id: "riskmap",
        name: "Risk map",
        description:
          "Likelihood against impact, including the risks to this product's own thesis rather than only external threats.",
        status: "built",
        tier: "solo",
        shippedIn: "Week 2",
        route: "/research",
      },
    ],
  },
  {
    id: "money",
    name: "Price and plan",
    purpose: "Turning the venture into tiers and a revenue model that can be argued with.",
    features: [
      {
        id: "tiers",
        name: "Three tiers, anchored to real competitors",
        description:
          "Each price is justified against a competitor figure fetched and dated, not chosen because it looked plausible.",
        status: "built",
        tier: "solo",
        shippedIn: "Week 3",
        route: "/pricing",
      },
      {
        id: "calculator",
        name: "Revenue simulator",
        description:
          "MRR, ARR, blended ARPU, and a twelve-month projection that recompute live. Churn compounds and annual billing discounts properly — both are tested.",
        status: "built",
        tier: "solo",
        shippedIn: "Week 3",
        route: "/pricing",
      },
      {
        id: "assumptions",
        name: "Assumptions table",
        description:
          "Every input with its source, confidence, and what breaks if it is wrong. Most read estimated, which is the honest state of any revenue model.",
        status: "built",
        tier: "solo",
        shippedIn: "Week 3",
        route: "/pricing",
      },
    ],
  },
  {
    id: "cfdi",
    name: "Invoice legally in Mexico",
    purpose:
      "The gap the research found, and the reason the Pro tier can charge anything at all. None of this is built.",
    features: [
      {
        id: "cfdi-issue",
        name: "CFDI 4.0 issuance via a PAC",
        description:
          "Issue a legally valid electronic invoice through an authorized certification provider. This is the hard half and the actual differentiator.",
        status: "planned",
        tier: "pro",
        shippedIn: null,
        route: null,
      },
      {
        id: "materialidad",
        name: "Materialidad evidence",
        description:
          "Link hours and deliverables to each invoice. The CFF reform effective January 2026 means an invoice must be backed by proof the work happened — and a CFDI tool that never saw the work cannot produce it.",
        status: "planned",
        tier: "pro",
        shippedIn: null,
        route: null,
      },
      {
        id: "retenciones",
        name: "Withholding handling",
        description:
          "A company withholds two thirds of the IVA and either 10% or 1.25% of the ISR depending on your regime, so the invoice and the cash received differ. Every figure on the dashboard — including the forecast — is the one that reaches your bank.",
        status: "built",
        tier: "pro",
        shippedIn: "After Week 3",
        route: "/",
      },
    ],
  },
  {
    id: "team",
    name: "Work as a studio",
    purpose: "What Segment B needs beyond a single freelancer's view. Not built.",
    features: [
      {
        id: "seats",
        name: "Multiple seats",
        description: "More than one person on one account, each with their own projects.",
        status: "planned",
        tier: "studio",
        shippedIn: null,
        route: null,
      },
      {
        id: "cross-view",
        name: "Cross-person project view",
        description: "See every project across the studio, not one person at a time.",
        status: "planned",
        tier: "studio",
        shippedIn: null,
        route: null,
      },
      {
        id: "profitability",
        name: "Per-person profitability",
        description: "Which work actually makes money once the hours are counted.",
        status: "planned",
        tier: "studio",
        shippedIn: null,
        route: null,
      },
    ],
  },
];

/** Counts, computed rather than written, so the page cannot overstate itself. */
export function featureSummary() {
  const all = FEATURE_GROUPS.flatMap((g) => g.features);
  return {
    total: all.length,
    built: all.filter((f) => f.status === "built").length,
    planned: all.filter((f) => f.status === "planned").length,
    groups: FEATURE_GROUPS.length,
  };
}
