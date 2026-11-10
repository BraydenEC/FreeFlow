/*
  The journey: the agent map at the top of /docs.

  Seven steps from Start to Now, one per week of the build. Each card answers
  what the step was for, what was built and what changed, and names what
  powers it, so a reader can see where Claude is used, where plain rules are,
  and where a person decides. Card text is drawn from each week's packet and
  iteration log (docs/ITERATION_LOG.md, docs/week1-5/ITERATION_LOG.md).
*/

export type JourneyStep = {
  n: number;
  week: string;
  name: string;
  purpose: string;
  built: string;
  changed: string;
  poweredBy: string;
};

export const JOURNEY: JourneyStep[] = [
  {
    n: 1,
    week: "Week 0",
    name: "Dashboard",
    purpose: "See every project, deadline and payment in one place instead of across notes, chats and spreadsheets.",
    built: "The dashboard: projects, deadlines, what's unpaid, what's overdue and the money coming in, stored per account in Supabase.",
    changed: "Production was quietly showing sample data and looked perfect doing it. It was connected to the real database, and every page now records which data it is showing.",
    poweredBy: "Your own data · No AI",
  },
  {
    n: 2,
    week: "Week 1",
    name: "Paste a brief",
    purpose: "Turn a client's message into a project without retyping the dates, rate and scope.",
    built: "Paste a brief: Claude reads the message and fills in a project for you to check before it's saved.",
    changed: "The rules-based reader was built first and kept as the fallback, so the page still works with no AI key. A deploy audit found production wasn't calling Claude at all; that was fixed.",
    poweredBy: "Agent: Claude, with a rules fallback · You approve",
  },
  {
    n: 3,
    week: "Week 2",
    name: "Research",
    purpose: "Check the problem against the market before building more.",
    built: "The research page: competitors, prices and risks, each figure tied to a source or marked unsourced.",
    changed: "The research showed no tool handles both projects and Mexican e-invoicing, which sharpened the problem. An interview with a working freelancer argued against the product and was recorded anyway.",
    poweredBy: "Agent: Claude, with a fallback · Every figure needs a source",
  },
  {
    n: 4,
    week: "Week 3",
    name: "Pricing",
    purpose: "Work out whether FreeFlow could ever pay for itself.",
    built: "A pricing model with scenarios, confidence levels on every assumption, and a live exchange rate.",
    changed: "The freelancer the model doesn't fit was left out on purpose, with no toggle to add him back. The save route stopped trusting numbers sent from the browser.",
    poweredBy: "Rules, no AI",
  },
  {
    n: 5,
    week: "Week 4",
    name: "Marketing",
    purpose: "Plan how FreeFlow reaches the freelancers it's for.",
    built: "The marketing page: a persona, a seed campaign, a content calendar and an A/B choice.",
    changed: "Writing the plan exposed a brand claim that wasn't true, so the brand changed first. The calendar is derived from rules, and Claude's drafts are checked before they show.",
    poweredBy: "Agent: Claude, with a fallback · Checked before it shows",
  },
  {
    n: 6,
    week: "Week 5",
    name: "Help desk",
    purpose: "Answer users' questions about FreeFlow, and get the hard ones to a person.",
    built: "A guided help chat that answers from written rules, and a ticket form when it can't help.",
    changed: "No AI answers at runtime: every rule is written and tested during the build. Walkthroughs found real app bugs, which were fixed alongside the answers.",
    poweredBy: "Rules, no AI · Tickets reach a person",
  },
  {
    n: 7,
    week: "Week 6",
    name: "One venture",
    purpose: "Bring every piece together into one product people can find, try and help steer.",
    built: "The /demo story, the Dock, a public numbers tab and these docs, with a roadmap anyone can vote on.",
    changed: "Every change and every number is now public. Pricing is settled for now: free today, a one-time purchase later.",
    poweredBy: "Rules, no AI · Your votes steer it",
  },
];
