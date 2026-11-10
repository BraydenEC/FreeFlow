/*
  "You said → we changed": the public record of feedback that changed FreeFlow.

  One source for /demo chapter 4, the "things you asked for, shipped" count on
  /dashboard and the /docs pages. Every entry is something a real person said
  and something that actually shipped, and `source` is the repo file that
  records it (scripts/test-venture.ts checks the file exists).

  `said` is reported speech, not a quote: nobody has given permission to be
  quoted on a public page, and nobody is named. Each speaker is "a freelancer
  friend".
*/

export type Change = {
  id: string;
  said: string;
  changed: string;
  source: string;
  date: string;
};

export const CHANGES: Change[] = [
  {
    id: "pricing-free-first",
    said: "A freelancer friend said to keep it free for as long as possible, and that he'd rather buy software outright than pay a subscription.",
    changed: "FreeFlow is free now. The plan for launch is a one-time purchase for full access, not a subscription.",
    source: "docs/week6/SOURCE_NOTES.md",
    date: "2026-11-09",
  },
  {
    id: "mobile-width",
    said: "A freelancer friend said all the information he wanted was there, but it was annoying to use on his phone.",
    changed: "The side rail that ate a phone's width was removed, so every page got its full width back.",
    source: "docs/week2/VALIDATION_CONVERSATION.md",
    date: "2026-09-22",
  },
  {
    id: "fixed-fee-default",
    said: "The same friend said he prices per job, not by the hour or on a retainer.",
    changed: "New projects start as a fixed fee instead of hourly.",
    source: "docs/week2/VALIDATION_CONVERSATION.md",
    date: "2026-09-22",
  },
  {
    id: "steady-updates",
    said: "Another freelancer friend said they would use it if it kept getting real updates, with new features and fixes.",
    changed: "Every change is now logged in public, and anyone can vote on what gets built next.",
    source: "docs/week6/SOURCE_NOTES.md",
    date: "2026-11-09",
  },
];

/*
  Matches the ways a price gets written: a currency sign before a number, MXN,
  "/mo" or "per month". No new Week 6 page states a price, so the content
  tests run every public string through this.
*/
export const PRICE_PATTERN = /\$\s?\d|\bMXN\b|\/mo\b|per month/i;
