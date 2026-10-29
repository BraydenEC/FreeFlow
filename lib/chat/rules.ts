/*
  The content rules /chat answers from.

  Every answer here is a claim about FreeFlow, so each one is written from the
  code it describes, not from memory of what the feature was meant to do.
  The source is noted above each rule; when that code changes, the answer
  must change with it. Keywords and phrases are normalised (lower-case, no
  accents, no punctuation). A rule only competes when the user's first two
  intake answers fall inside its categories and areas.

  This file is meant to be edited: each training session with the owner turns
  a wrong answer into a sample in samples.ts and a fix here.
*/

import type { Rule } from "./types";

export const CONTENT_RULES: Rule[] = [
  // lib/forecast/model.ts — deadline + terms (30-day default), paid skipped, past-due is "late"
  {
    id: "forecast-zero",
    categories: ["broken", "how_to"],
    areas: ["forecast", "dashboard"],
    keywords: ["forecast", "zero", "empty", "nothing", "missing", "pronostico", "blank"],
    phrases: ["next month", "shows zero", "shows 0", "is empty", "not showing"],
    answer:
      "The forecast puts each unpaid project in the month its money is expected: the deadline plus payment terms, which are 30 days unless the project sets its own. So work due next month usually lands the month after. Paid projects aren't counted, and money already past its expected date shows as late rather than in a month.",
  },
  // lib/forecast/model.ts expectedPaymentDate; ProjectForm "Payment terms"; Settings "Default payment terms"
  {
    id: "payment-terms",
    categories: "any",
    areas: ["forecast", "projects", "dashboard", "account"],
    keywords: ["terms", "days", "default", "net"],
    phrases: ["payment terms", "net 30", "takes to pay", "days to pay", "pays late"],
    answer:
      "Payment terms are how many days after the deadline a client usually pays you. Set your default in Settings (top right), and override it on a project in its Payment terms field. The forecast uses them to decide which month each project's money lands in.",
  },
  // components/dashboard/MarkPaidButton.tsx; features "Record a payment"
  {
    id: "record-payment",
    categories: ["broken", "how_to"],
    areas: ["dashboard", "projects"],
    keywords: ["paid", "mark", "received", "earnings"],
    phrases: ["mark paid", "mark as paid", "got paid", "record a payment", "record payment", "client paid"],
    answer:
      "Use Mark paid on the project's row. It records the payment with today's date and counts it in this month's earnings. Payment isn't editable in the project form, so Mark paid is the way to record it.",
  },
  // app/page.tsx hasOverdue (unpaid and past deadline); components/dashboard/OverdueAlert.tsx
  {
    id: "overdue-alert",
    categories: ["broken", "how_to"],
    areas: ["dashboard", "projects"],
    keywords: ["overdue", "late", "alert", "warning", "pinned"],
    phrases: ["past due", "overdue alert", "says overdue", "say overdue", "shows overdue", "marked overdue"],
    answer:
      "A project counts as overdue when it isn't paid and its deadline has passed. The overdue alert only appears then, and it sits at the top of the dashboard so it can't be missed. Marking the project paid, or moving its deadline if the date was wrong, clears it.",
  },
  // components/dashboard/ProjectForm.tsx — "New project", "Edit project", "Save changes", Hourly / Fixed fee
  {
    id: "project-create-edit",
    categories: ["broken", "how_to"],
    areas: ["projects", "dashboard"],
    keywords: ["add", "create", "new", "edit", "change", "update", "rate", "fee", "hourly", "fixed"],
    phrases: ["new project", "add a project", "add project", "edit a project", "edit project", "change the deadline", "fixed fee"],
    answer:
      "Add a project with New project on the dashboard: name, client, status, deadline, and either hours and an hourly rate or a fixed fee. To change it later, open the project from its row, edit the fields and choose Save changes.",
  },
  // components/dashboard/ProjectForm.tsx onDelete → DELETE /api/projects/[id]
  {
    id: "project-delete",
    categories: ["broken", "how_to"],
    areas: ["projects", "dashboard"],
    keywords: ["delete", "remove", "trash"],
    phrases: ["delete a project", "delete project", "remove a project", "delete my project"],
    answer:
      "Open the project, go to the bottom of the form and choose Delete project, then confirm. Deleting can't be undone.",
  },
  // ProjectForm "Contract signed", "Contract link", "Stripe invoice or payment link"
  {
    id: "contract-links",
    categories: ["broken", "how_to"],
    areas: ["projects", "dashboard"],
    keywords: ["contract", "signed", "link", "links", "stripe", "signature", "url"],
    phrases: ["contract link", "payment link", "signed contract"],
    answer:
      "Each project has fields for the date the contract was signed, a link to the contract, and a Stripe invoice or payment link. Open the project and fill them in. FreeFlow stores the links; it doesn't create the contract or the invoice.",
  },
  // lib/core/extract.ts + heuristic.ts; features "Brief extraction", "Extraction provenance"
  {
    id: "brief-wrong-field",
    categories: ["broken", "how_to"],
    areas: ["brief", "projects"],
    keywords: ["brief", "extract", "extraction", "wrong", "field", "paste", "pasted", "misread"],
    phrases: ["client email", "wrong client", "wrong rate", "got it wrong", "read it wrong"],
    answer:
      "Brief extraction reads a pasted client email and fills in a project, but it can misread things. Check each field before you save and correct anything wrong. The result also says whether the AI model or pattern matching produced it.",
  },
  // lib/core/heuristic.ts — unknowns are null and named in the confidence note
  {
    id: "brief-unsure",
    categories: ["broken", "how_to"],
    areas: ["brief"],
    keywords: ["unsure", "note", "confidence", "blank", "heuristic", "pattern", "matching", "null"],
    phrases: ["not sure", "left blank", "pattern matching", "empty field"],
    answer:
      "When extraction can't find something, it leaves that field empty and says so in the note instead of guessing. Fill it in yourself. If the result says pattern matching, the AI model wasn't available, so the extraction is simpler.",
  },
  // lib/core/heuristic.ts — year-less dates resolve to the next future occurrence
  {
    id: "relative-dates",
    categories: ["broken", "how_to"],
    areas: ["brief", "projects"],
    keywords: ["date", "deadline", "friday", "monday", "tomorrow", "year", "relative", "wrong", "picked"],
    phrases: ["next friday", "next week", "end of the month", "wrong date", "wrong year"],
    answer:
      "Dates without a year are read as the next time that date comes around, and phrases like \"next Friday\" are worked out from the day you paste the brief. If it picked the wrong date, correct the deadline before saving.",
  },
  // lib/currency.ts — 11 currencies, one per account, never converted
  {
    id: "currencies",
    categories: "any",
    areas: "any",
    keywords: ["currency", "currencies", "dollar", "dollars", "peso", "pesos", "euro", "euros", "mxn", "usd", "convert", "conversion", "exchange", "symbol"],
    phrases: ["exchange rate", "wrong currency", "change currency", "change my currency"],
    answer:
      "FreeFlow supports eleven currencies: USD, MXN, COP, ARS, BRL, CLP, PEN, UYU, CAD, EUR and GBP. Each account uses one, chosen in Settings (top right), and amounts are never converted between currencies.",
  },
  // lib/tax/withholding.ts — applies when the client is persona moral; 2/3 IVA; ISR 10% general / 1.25% RESICO
  {
    id: "withholding-explained",
    categories: "any",
    areas: "any",
    keywords: ["withholding", "withheld", "retenciones", "retencion", "iva", "isr", "bank", "lower", "less", "net", "moral"],
    phrases: ["lower than", "less than the invoice", "persona moral", "what reaches", "in my bank"],
    answer:
      "When a company (persona moral) in Mexico pays you, it withholds two thirds of the IVA and part of the ISR: 10% under the general regime or 1.25% under RESICO. FreeFlow shows what actually reaches your bank, so it's lower than the invoice. Set the client type on the project and your regime in Settings.",
  },
  // components/dashboard/ExportButton.tsx → /api/export/projects
  {
    id: "csv-export",
    categories: "any",
    areas: ["dashboard", "projects", "other"],
    keywords: ["csv", "export", "spreadsheet", "excel", "download", "sheets"],
    phrases: ["google sheets", "export my projects"],
    answer:
      "Use the export button on the dashboard to download every project as a CSV file, which opens in Excel or Google Sheets. Retenciones are already worked out where they apply.",
  },
  // components/prefs/LayoutDrawer.tsx; features "Saved layout preferences"
  {
    id: "layout-prefs",
    categories: ["broken", "how_to"],
    areas: ["dashboard", "account"],
    keywords: ["layout", "widget", "widgets", "density", "hide", "order", "width", "arrange", "rearrange", "compact"],
    phrases: ["hide a widget", "move the", "dashboard layout"],
    answer:
      "Open Settings (top right) to choose the density, which dashboard widgets appear, their order and width, and whether explanations are shown. It's saved to your account, so the layout follows you to other devices.",
  },
  // app/(auth)/login, signup, verify-email
  {
    id: "sign-in",
    categories: ["broken", "how_to"],
    areas: ["account", "other"],
    keywords: ["sign", "login", "log", "logged", "verify", "verification", "confirm", "signup"],
    phrases: ["sign in", "log in", "logged out", "verify my email", "confirmation email", "cant log in"],
    answer:
      "Sign in with the email and password you signed up with. New accounts have to confirm their email first, so check your inbox and spam folder for the link. If you've forgotten the password, reset it.",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Reset your password", href: "/forgot-password" },
    ],
  },
  // app/(auth)/forgot-password, reset-password
  {
    id: "password-reset",
    categories: ["broken", "how_to"],
    areas: ["account", "other"],
    keywords: ["password", "reset", "forgot", "forgotten"],
    phrases: ["forgot my password", "reset my password", "change my password", "reset link"],
    answer:
      "Use Forgot password on the sign-in page, enter your email, and follow the link to choose a new password. If the email doesn't arrive within a few minutes, check your spam folder.",
    links: [{ label: "Reset your password", href: "/forgot-password" }],
  },
  // app/research; features "Competitor & substitute analysis", "Confidence on every claim", "Risk map"
  {
    id: "research-page",
    categories: ["how_to", "pricing_technical"],
    areas: ["research", "other"],
    keywords: ["research", "competitor", "competitors", "risk", "risks", "verified", "estimated", "sources", "prices"],
    phrases: ["risk map", "what is research", "research page", "come from"],
    answer:
      "Research compares eleven competing products and substitutes with sourced pricing, marks every claim as verified, reported or estimated, and maps the risks to FreeFlow. It's background on why FreeFlow is built the way it is; there's nothing to set up.",
    links: [{ label: "Research", href: "/research" }],
  },
  // app/pricing/page.tsx "free while it is early… None of this is being charged today"; lib/support.ts
  {
    id: "pricing-free",
    categories: "any",
    areas: "any",
    keywords: ["free", "cost", "costs", "price", "pay", "charge", "charged", "subscription", "cancel", "refund", "billing", "trial"],
    phrases: ["how much", "is it free", "cancel my subscription", "want a refund", "credit card"],
    answer:
      "FreeFlow is free while it grows: every feature, for everyone, and nothing is charged today. There's no subscription to cancel and nothing to refund. Donations are optional and don't unlock anything.",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Support FreeFlow", href: "/support" },
    ],
  },
  // lib/pricing/tiers.ts — Solo, Project, Pro, Studio; "The page describes a model, not a bill"
  {
    id: "pricing-tiers",
    categories: ["how_to", "pricing_technical"],
    areas: ["pricing", "other"],
    keywords: ["tier", "tiers", "pro", "studio", "solo", "plans", "model", "simulator", "mrr", "arr"],
    phrases: ["pricing page", "pro plan", "studio plan", "revenue simulator"],
    answer:
      "The Solo, Project, Pro and Studio tiers on the pricing page are the model FreeFlow intends to move to, not a bill. None of it is charged today. The simulator and the assumptions table show how those prices were worked out.",
    links: [{ label: "Pricing", href: "/pricing" }],
  },
  // app/support/page.tsx; lib/support.ts — real running costs, nothing gated on donating
  {
    id: "donations",
    categories: "any",
    areas: "any",
    keywords: ["donate", "donation", "donations", "tip", "coffee", "contribute"],
    phrases: ["support freeflow", "support the project", "i donate", "buy you a coffee", "make a donation"],
    answer:
      "Donations are optional and go to real running costs like hosting and the domain. They don't unlock any features. The Support page has the details.",
    links: [{ label: "Support FreeFlow", href: "/support" }],
  },
  // features "Accounts and per-user data" — RLS on every table; chat_sessions notice
  {
    id: "data-privacy",
    categories: "any",
    areas: "any",
    keywords: ["privacy", "private", "data", "shared", "secure", "security", "safe", "visible", "sell", "see"],
    phrases: ["other users", "who can see", "my data", "is my data"],
    answer:
      "Your projects and settings belong to your account and are protected by row-level security, so other users can't see them. Help conversations are saved so the owner can fix problems.",
  },
  // features note: the Week 2 persona's complaint was "annoying on mobile"
  {
    id: "mobile",
    categories: "any",
    areas: "any",
    keywords: ["mobile", "phone", "iphone", "android", "tablet", "screen", "tiny", "tap", "cut"],
    phrases: ["on my phone", "on mobile", "cut off", "too small"],
    answer:
      "FreeFlow runs in your phone's browser; there's no app to install. If something is cut off or hard to tap, submit a ticket saying which page, because mobile problems are exactly what the owner wants to fix.",
    offerTicket: true,
  },
  // lib/product/features.ts — CFDI issuance and materialidad evidence are planned
  {
    id: "planned-cfdi",
    categories: "any",
    areas: "any",
    keywords: ["cfdi", "factura", "facturar", "facturas", "pac", "timbrar", "timbre", "materialidad", "xml"],
    phrases: ["electronic invoice", "legal invoice", "issue an invoice", "send an invoice", "issue a cfdi", "como facturar", "emitir factura", "hacer factura"],
    answer:
      "Issuing CFDI invoices and materialidad evidence are not built yet. They're planned, and the Product page shows what's built and what isn't. For now FreeFlow tracks the work and the payment, so issue the CFDI with your usual provider.",
    links: [{ label: "Product", href: "/product" }],
    offerTicket: true,
  },
  // lib/product/features.ts — seats, cross-person view, per-person profitability are planned
  {
    id: "planned-studio",
    categories: "any",
    areas: "any",
    keywords: ["team", "teams", "seat", "seats", "studio", "invite", "collaborate", "collaborator", "profitability", "employees"],
    phrases: ["multiple users", "add a user", "add users", "per person", "my team"],
    answer:
      "Multiple seats, a cross-person project view and per-person profitability are not built yet. FreeFlow is one person per account today, and the Product page shows what's planned.",
    links: [{ label: "Product", href: "/product" }],
    offerTicket: true,
  },
  // No self-serve account deletion exists in app/ or app/api/
  {
    id: "account-delete",
    categories: "any",
    areas: ["account", "other"],
    keywords: ["delete", "close", "erase", "remove"],
    phrases: ["delete my account", "close my account", "remove my account", "delete my data"],
    answer:
      "You can't delete your account yourself in FreeFlow yet. Submit a ticket and the owner will delete it and confirm by email.",
    offerTicket: true,
  },
  // app/marketing; features "Marketing content engine", "A/B headline test"
  {
    id: "marketing-page",
    categories: ["broken", "how_to"],
    areas: ["marketing"],
    keywords: ["marketing", "posts", "post", "scripts", "script", "calendar", "headline", "generate", "campaign", "persona", "save", "copy"],
    phrases: ["generate live", "seed copy", "a b test", "ab test"],
    answer:
      "The Marketing page shows the persona, ten posts, three video scripts, a 14-day calendar and an A/B headline test. Generate live writes fresh copy with AI when it's available and falls back to seed copy, and every card says which one it is. You can copy, export and save them.",
    links: [{ label: "Marketing", href: "/marketing" }],
  },
  // features "Cash-flow dashboard" — derived, not stored
  {
    id: "dashboard-numbers",
    categories: ["broken", "how_to"],
    areas: ["dashboard"],
    keywords: ["dashboard", "unpaid", "earnings", "earned", "cards", "total", "number", "numbers", "active", "wrong"],
    phrases: ["this month", "unpaid invoices", "wrong number", "wrong total"],
    answer:
      "The dashboard cards are worked out from your projects every time you open it: unpaid invoices, what you earned this month from projects marked paid, and how many are active. If a number looks wrong, check each project's status and whether it's been marked paid.",
  },
];
