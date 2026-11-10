/*
  The week-by-week timeline on /docs.

  One entry per week: what was built and the decision that mattered most, with
  the iterations and tests behind it. Drawn from docs/ITERATION_LOG.md and
  docs/week1-5/ITERATION_LOG.md and rewritten for a reader. No friend or tester
  names.
*/

export type WeekEntry = {
  week: number;
  title: string;
  built: string;
  decision: string;
  iterations: string[];
  tests: string;
};

export const TIMELINE: WeekEntry[] = [
  {
    week: 0,
    title: "The dashboard",
    built: "Projects, deadlines and cash flow in one dashboard, backed by Supabase with row-level security.",
    decision: "Supabase went from optional to mandatory, so the numbers on screen are your real projects.",
    iterations: [
      "The page was being prerendered once at build time, so deadlines would have gone stale. It now renders on every request.",
      "Production was serving sample data and looked perfect doing it. It was connected to the real database, and each page now records which data it is showing.",
      "Summary figures were made to come from the projects rather than being typed in.",
    ],
    tests: "Row-level security was checked by trying to read another account's projects, and failing.",
  },
  {
    week: 1,
    title: "Paste a brief",
    built: "Paste a client's message and get a structured project back, ready to check and save.",
    decision: "Build the rules-based reader first and keep it as the fallback, so a missing AI key is never an error.",
    iterations: [
      "Dates without a year, like \"March 3\", were landing in the past. They now roll forward to the next one.",
      "Project names were swallowing words like \"for\" and \"by\".",
      "A deploy audit found production wasn't running the AI reader at all, and fixed it.",
    ],
    tests: "Model latency was measured rather than assumed, and the fallback was tested with no key set.",
  },
  {
    week: 2,
    title: "Research",
    built: "A research page of competitors, prices and risks, each figure linked to its source or marked unsourced.",
    decision: "Every figure needs a source. Numbers written from memory were rejected outright.",
    iterations: [
      "A promotional competitor price was swapped for the real one, so the comparison wasn't flattering.",
      "The research changed the problem: Mexican freelancers run two systems because the law requires it, not because they're disorganised.",
      "An interview with a working freelancer argued against the product and was recorded anyway.",
    ],
    tests: "A new test found two of its own expectations were wrong, and they were fixed rather than the code bent to fit.",
  },
  {
    week: 3,
    title: "Pricing",
    built: "A pricing and revenue model with scenarios, a confidence level on every assumption and a live exchange rate.",
    decision: "The freelancer the model doesn't fit was excluded on purpose, with no toggle to add him back.",
    iterations: [
      "The pricing math was made pure and tested before any screen existed.",
      "The save route stopped trusting numbers sent from the browser and recalculates them itself.",
      "Saved scenarios became regression tests.",
    ],
    tests: "A tampering test caught an error in the test itself, which was fixed before the test was trusted.",
  },
  {
    week: 4,
    title: "Marketing",
    built: "A marketing page with a persona, a seed campaign, a content calendar and an A/B choice.",
    decision: "Make the brand true before marketing it. Writing the plan exposed a claim that wasn't.",
    iterations: [
      "The content calendar is built from rules, not generated.",
      "Claude's drafts are checked before they show, not trusted.",
      "A security pass covered everything Week 4 added.",
    ],
    tests: "The marketing logic was tested before the page existed, and the database round trip was verified live.",
  },
  {
    week: 5,
    title: "Help desk",
    built: "A guided help chat that answers from written rules, with a ticket form when it can't help.",
    decision: "No AI at runtime. Rules are written and tested during the build, and tickets go to a person.",
    iterations: [
      "A coverage pass wrote a rule for every question a user might reasonably ask.",
      "Persona tests and a live walkthrough found wrong answers, and real app bugs, which were fixed.",
      "A final code review caught ten problems before release.",
    ],
    tests: "807 chat assertions and more than 1,500 across all suites by the end of the week.",
  },
  {
    week: 6,
    title: "One venture",
    built: "The /demo story, the Dock, a public numbers tab, these docs and a roadmap anyone can vote on.",
    decision: "Free now, a one-time purchase later, and every number and change in public.",
    iterations: [
      "A freelancer friend's advice settled pricing: keep it free as long as possible, and no subscription.",
    ],
    tests: "Five external testers and a full-site regression. Results are added here after testing.",
  },
];
