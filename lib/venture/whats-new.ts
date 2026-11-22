/*
  "What's new" on /roadmap: user-facing changes, newest first.

  One plain line each, in the words a freelancer would use, dated by when the
  change shipped (git history). Add to the top; never rewrite history.
*/

export type Change = { date: string; title: string };

export const WHATS_NEW: Change[] = [
  { date: "2026-11-22", title: "Pricing is simple now: free for everyone, with optional donations. Donors get the paid version free." },
  { date: "2026-11-22", title: "Dashboard totals and the CSV export remind you to check figures against your own records." },
  { date: "2026-11-22", title: "A Features page and this roadmap, so you can see what FreeFlow does and what's coming." },
  { date: "2026-11-21", title: "Mark paid can be undone, and you can set the date the money actually arrived." },
  { date: "2026-11-21", title: "Paste a brief reads budgets, currencies, and whether the client is a company." },
  { date: "2026-11-21", title: "The project form shows every problem at once, in plain words, and keeps your draft." },
  { date: "2026-11-21", title: "The help desk answers typed questions straight away, with or without an account." },
  { date: "2026-11-21", title: "Invoices count as late after their payment terms, not on the deadline." },
  { date: "2026-11-18", title: "A small flying game on the home page: remember your jobs, answer the gates." },
  { date: "2026-11-12", title: "A new home page: one night, from 11:47 pm to morning." },
  { date: "2026-11-04", title: "The CSV export works out withholding even on projects without a tax type." },
  { date: "2026-09-24", title: "A six-month cash-flow forecast: what's coming, not just what's owed." },
  { date: "2026-09-24", title: "Eleven currencies, written the way your region writes them." },
  { date: "2026-09-24", title: "Export every project to CSV, with the withholding already worked out." },
  { date: "2026-09-23", title: "Forgot your password? You can reset it yourself." },
  { date: "2026-09-22", title: "New projects start as a fixed fee, the way most freelancers bill." },
];
