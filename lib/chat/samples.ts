/*
  The training table for /chat.

  Each row is a question phrased the way a real user types it and the rule it
  must reach. The test suite runs every row through the engine, so a rule
  change that fixes one answer cannot quietly break another. Training sessions
  with the owner add rows here first (failing), then fix the rules.
*/

import type { Area, Category } from "./types";

export type Sample = { text: string; category: Category; area: Area; expect: string };

export const SAMPLES: Sample[] = [
  { text: "my forecast shows zero for next month", category: "broken", area: "forecast", expect: "forecast-zero" },
  { text: "forecast is empty even though I have projects", category: "broken", area: "forecast", expect: "forecast-zero" },
  { text: "what are payment terms", category: "how_to", area: "projects", expect: "payment-terms" },
  { text: "my client takes 60 days to pay, where do I set that", category: "how_to", area: "forecast", expect: "payment-terms" },
  { text: "how do I mark a project as paid", category: "how_to", area: "dashboard", expect: "record-payment" },
  { text: "client paid me but it still shows unpaid", category: "broken", area: "projects", expect: "record-payment" },
  { text: "why does it say overdue", category: "broken", area: "dashboard", expect: "overdue-alert" },
  { text: "the overdue alert won't go away", category: "broken", area: "dashboard", expect: "overdue-alert" },
  { text: "how do I add a project", category: "how_to", area: "projects", expect: "project-create-edit" },
  { text: "I need to change the deadline on a project", category: "how_to", area: "projects", expect: "project-create-edit" },
  { text: "how do I delete a project", category: "how_to", area: "projects", expect: "project-delete" },
  { text: "can't find where to remove a project", category: "broken", area: "projects", expect: "project-delete" },
  { text: "where do I put the contract link", category: "how_to", area: "projects", expect: "contract-links" },
  { text: "can I attach my stripe payment link", category: "how_to", area: "projects", expect: "contract-links" },
  { text: "brief extraction got the client wrong", category: "broken", area: "brief", expect: "brief-wrong-field" },
  { text: "I pasted the client email and the rate is wrong", category: "broken", area: "brief", expect: "brief-wrong-field" },
  { text: "it left the hours blank and says not sure", category: "broken", area: "brief", expect: "brief-unsure" },
  { text: "what does pattern matching mean on the result", category: "how_to", area: "brief", expect: "brief-unsure" },
  { text: "it set the deadline to next year instead of next friday", category: "broken", area: "brief", expect: "relative-dates" },
  { text: "the date it picked is wrong", category: "broken", area: "brief", expect: "relative-dates" },
  { text: "how do I change my currency to pesos", category: "how_to", area: "account", expect: "currencies" },
  { text: "can it convert dollars to euros", category: "pricing_technical", area: "other", expect: "currencies" },
  { text: "why is the amount in my bank lower than the invoice", category: "how_to", area: "dashboard", expect: "withholding-explained" },
  { text: "what are retenciones and how is the iva calculated", category: "pricing_technical", area: "other", expect: "withholding-explained" },
  { text: "how do I export to excel", category: "how_to", area: "dashboard", expect: "csv-export" },
  { text: "csv download isn't working", category: "broken", area: "dashboard", expect: "csv-export" },
  { text: "how do I hide a widget on the dashboard", category: "how_to", area: "dashboard", expect: "layout-prefs" },
  { text: "can I rearrange the layout", category: "how_to", area: "account", expect: "layout-prefs" },
  { text: "I can't log in", category: "broken", area: "account", expect: "sign-in" },
  { text: "never got the confirmation email", category: "broken", area: "account", expect: "sign-in" },
  { text: "I forgot my password", category: "broken", area: "account", expect: "password-reset" },
  { text: "the reset link doesn't work", category: "broken", area: "account", expect: "password-reset" },
  { text: "what is the research page for", category: "how_to", area: "research", expect: "research-page" },
  { text: "where do the competitor prices come from", category: "pricing_technical", area: "research", expect: "research-page" },
  { text: "is it free", category: "pricing_technical", area: "pricing", expect: "pricing-free" },
  { text: "cancel my subscription", category: "pricing_technical", area: "pricing", expect: "pricing-free" },
  { text: "I want a refund", category: "pricing_technical", area: "other", expect: "pricing-free" },
  { text: "what do the pro and studio tiers mean", category: "pricing_technical", area: "pricing", expect: "pricing-tiers" },
  { text: "how does the revenue simulator work", category: "how_to", area: "pricing", expect: "pricing-tiers" },
  { text: "how can I donate", category: "pricing_technical", area: "pricing", expect: "donations" },
  { text: "can I buy you a coffee", category: "pricing_technical", area: "other", expect: "donations" },
  { text: "can other users see my projects", category: "pricing_technical", area: "other", expect: "data-privacy" },
  { text: "is my data shared with other users", category: "pricing_technical", area: "account", expect: "data-privacy" },
  { text: "it's annoying on mobile", category: "broken", area: "other", expect: "mobile" },
  { text: "the table is cut off on my phone", category: "broken", area: "dashboard", expect: "mobile" },
  { text: "can I issue a CFDI from here", category: "how_to", area: "other", expect: "planned-cfdi" },
  { text: "como facturar desde freeflow", category: "how_to", area: "other", expect: "planned-cfdi" },
  { text: "can I add users to my team", category: "how_to", area: "account", expect: "planned-studio" },
  { text: "per person profitability for my studio", category: "how_to", area: "other", expect: "planned-studio" },
  { text: "delete my account", category: "how_to", area: "account", expect: "account-delete" },
  { text: "how do I close my account", category: "how_to", area: "account", expect: "account-delete" },
  { text: "generate live isn't working", category: "broken", area: "marketing", expect: "marketing-page" },
  { text: "how do I save a post", category: "how_to", area: "marketing", expect: "marketing-page" },
  { text: "unpaid invoices total looks wrong", category: "broken", area: "dashboard", expect: "dashboard-numbers" },
  { text: "this month's earnings are wrong", category: "broken", area: "dashboard", expect: "dashboard-numbers" },
  // Questions no rule should claim: they must come back for a new rule.
  { text: "the purple button on the moon page", category: "broken", area: "other", expect: "no_match" },
  { text: "no funciona la página", category: "broken", area: "other", expect: "no_match" },
  { text: "it crashed when I clicked something", category: "broken", area: "other", expect: "no_match" },
  { text: "can you integrate with quickbooks", category: "pricing_technical", area: "other", expect: "no_match" },
  { text: "my client threatened a lawsuit", category: "broken", area: "other", expect: "no_match" },
];
