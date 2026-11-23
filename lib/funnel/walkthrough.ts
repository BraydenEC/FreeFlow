/*
  /demo chapter 2: every worry has a place.

  Each step turns one worry into the built feature that answers it. The
  `featureName` must match a built feature's name in lib/product/features.ts
  exactly (scripts/test-funnel.ts checks), so the funnel can never advertise
  something that isn't built. "See it" goes to that feature's section on
  /features (featureAnchor), which is built from this same list.
*/

export type WalkthroughStep = {
  area: "money" | "paperwork" | "organization";
  worry: string;
  featureName: string;
  benefit: string;
  /** A one-line sample of what it looks like in FreeFlow, shown labelled "Sample". */
  sample: string;
  /** Its section on /features. */
  href: string;
};

/** The three areas, in the order the home page and /features show them. */
export const WALKTHROUGH_AREAS: { id: WalkthroughStep["area"]; label: string }[] = [
  { id: "money", label: "Money" },
  { id: "paperwork", label: "Paperwork & tax" },
  { id: "organization", label: "Organization" },
];

/** The /features section id for a feature name: "Export to CSV" → "export-to-csv". */
export function featureAnchor(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const STEPS: Omit<WalkthroughStep, "href">[] = [
  // Money
  {
    area: "money",
    worry: "did they pay??",
    featureName: "Overdue alert",
    benefit: "Late payments pin themselves to the top. You stop finding out by remembering.",
    sample: "Invoice #9 · Overdue 12 days · pinned to the top",
  },
  {
    area: "money",
    worry: "can I take December off?",
    featureName: "Six-month cash-flow forecast",
    benefit: "See what lands each month, with money that's scheduled kept apart from money that's only likely.",
    sample: "December · scheduled and likely shown apart",
  },
  {
    area: "money",
    worry: "they pay… 30 days after? 60?",
    featureName: "Payment terms per project",
    benefit: "Each client's payment terms turn a deadline into the day the money actually arrives.",
    sample: "Deadline Fri 14 · net 30 · arrives Mon 17",
  },
  {
    area: "money",
    worry: "wait, did I mark that paid?",
    featureName: "Record a payment",
    benefit: "Mark it paid once, and this month's earnings update themselves.",
    sample: "Brand deck · Paid 04/11",
  },
  {
    area: "money",
    worry: "paid in dollars, rent in pesos",
    featureName: "Eleven currencies",
    benefit: "Amounts written the way your region writes them.",
    sample: "Amounts in your currency, your way",
  },
  // Paperwork & tax
  {
    area: "paperwork",
    worry: "contract.pdf… where",
    featureName: "Contract and payment links",
    benefit: "The signed date, the contract and the payment link live on the project.",
    sample: "Contract signed 02/11 · payment link saved",
  },
  {
    area: "paperwork",
    worry: "IVA ???",
    featureName: "Withholding handling",
    benefit: "If a company withholds IVA and ISR in Mexico, you see what actually reaches your bank.",
    sample: "IVA and ISR withheld · net worked out",
  },
  {
    area: "paperwork",
    worry: "my accountant wants a spreadsheet",
    featureName: "Export to CSV",
    benefit: "Every project in one file, with the withholding already worked out.",
    sample: "freeflow-projects.csv · withholding included",
  },
  // Organization
  {
    area: "organization",
    worry: "new client email",
    featureName: "Brief extraction",
    benefit: "Paste the message and get a project back. You check it before it's saved.",
    sample: "“quick favor” email → Poster · Mercado · due Fri",
  },
  {
    area: "organization",
    worry: "what's due this week?",
    featureName: "Project & deadline table",
    benefit: "Every project with its client, value, days left and status, in one table.",
    sample: "Client · value · days left · status",
  },
  {
    area: "organization",
    worry: "is my client list safe?",
    featureName: "Accounts and per-user data",
    benefit: "Your own private account. Nobody else can see your projects.",
    sample: "Only you can see your projects",
  },
  {
    area: "organization",
    worry: "too much on one screen",
    featureName: "Saved layout preferences",
    benefit: "Arrange the dashboard once and it stays that way.",
    sample: "Forecast first · table full width",
  },
];

export const WALKTHROUGH: WalkthroughStep[] = STEPS.map((step) => ({
  ...step,
  href: `/features#${featureAnchor(step.featureName)}`,
}));
