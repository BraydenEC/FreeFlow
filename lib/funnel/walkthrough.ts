/*
  /demo chapter 2: every worry has a place.

  Each step turns one worry into the built feature that answers it. The
  `featureName` must match a built feature's name in lib/product/features.ts
  exactly (scripts/test-funnel.ts checks), so the funnel can never advertise
  something that isn't built. "See it" goes to /product, which is public and
  lists every feature with its status.
*/

export type WalkthroughStep = {
  area: "money" | "paperwork" | "organization";
  worry: string;
  featureName: string;
  benefit: string;
  href: string;
};

export const WALKTHROUGH: WalkthroughStep[] = [
  // Money
  {
    area: "money",
    worry: "did they pay??",
    featureName: "Overdue alert",
    benefit: "Late payments pin themselves to the top. You stop finding out by remembering.",
    href: "/product",
  },
  {
    area: "money",
    worry: "can I take December off?",
    featureName: "Six-month cash-flow forecast",
    benefit: "See what lands each month, with money that's scheduled kept apart from money that's only likely.",
    href: "/product",
  },
  {
    area: "money",
    worry: "they pay… 30 days after? 60?",
    featureName: "Payment terms per project",
    benefit: "Each client's payment terms turn a deadline into the day the money actually arrives.",
    href: "/product",
  },
  {
    area: "money",
    worry: "wait, did I mark that paid?",
    featureName: "Record a payment",
    benefit: "Mark it paid once, and this month's earnings update themselves.",
    href: "/product",
  },
  {
    area: "money",
    worry: "paid in dollars, rent in pesos",
    featureName: "Eleven currencies",
    benefit: "Amounts written the way your region writes them.",
    href: "/product",
  },
  // Paperwork & tax
  {
    area: "paperwork",
    worry: "contract.pdf… where",
    featureName: "Contract and payment links",
    benefit: "The signed date, the contract and the payment link live on the project.",
    href: "/product",
  },
  {
    area: "paperwork",
    worry: "IVA ???",
    featureName: "Withholding handling",
    benefit: "If a company withholds IVA and ISR in Mexico, you see what actually reaches your bank.",
    href: "/product",
  },
  {
    area: "paperwork",
    worry: "my accountant wants a spreadsheet",
    featureName: "Export to CSV",
    benefit: "Every project in one file, with the withholding already worked out.",
    href: "/product",
  },
  // Organization
  {
    area: "organization",
    worry: "new client email",
    featureName: "Brief extraction",
    benefit: "Paste the message and get a project back. You check it before it's saved.",
    href: "/product",
  },
  {
    area: "organization",
    worry: "what's due this week?",
    featureName: "Project & deadline table",
    benefit: "Every project with its client, value, days left and status, in one table.",
    href: "/product",
  },
  {
    area: "organization",
    worry: "is my client list safe?",
    featureName: "Accounts and per-user data",
    benefit: "Your own private account. Nobody else can see your projects.",
    href: "/product",
  },
  {
    area: "organization",
    worry: "too much on one screen",
    featureName: "Saved layout preferences",
    benefit: "Arrange the dashboard once and it stays that way.",
    href: "/product",
  },
];
