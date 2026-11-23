/*
  Week 6 testing, as shown in the Testing section of /docs and the /dashboard
  public tab. Drawn from docs/week6/TEST_EVIDENCE.md and docs/ITERATION_LOG.md
  and written for a reader.

  Five external users in 1-on-1 observed think-aloud sessions, the full-site
  regression, and what changed afterwards. Nothing goes in here that a tester
  did not actually do, say or find, and testers are never named: each is
  identified by role and device only.
*/

export const TESTING_METHOD =
  "Five 1-on-1 observed think-aloud sessions, about 25 minutes each, signed out and then signed in, held Nov 1 – Nov 15 with freelancers using FreeFlow for the first time. Names are omitted.";

/* The testers' findings across all five sessions, every one fixed (Nov 19). */
export const TESTER_FINDINGS = { found: 35, fixed: 35 };

export type TesterIssue = { asked: string; fix: string };

export type TesterSession = {
  tester: string;
  role: string;
  device: string;
  date: string;
  tried: string;
  liked: string;
  issues: TesterIssue[];
};

export const TESTER_SESSIONS: TesterSession[] = [
  {
    tester: "Tester 1",
    role: "Founder, exterior property services",
    device: "Chrome",
    date: "Nov 1",
    tried: "Started signed out on /dashboard, signed up, added a project, marked it paid, pasted a client brief and asked the help desk how to send an invoice.",
    liked: "The fast two-field sign-up.",
    issues: [
      {
        asked: "The confirmation email took over a minute to find, in Spam.",
        fix: "The confirm page now leads with “Check your Spam folder” and an Open Gmail button. The sending-domain settings (SPF, DKIM, DMARC) are the owner’s step.",
      },
      {
        asked: "“Add project” seemed broken because its error appeared off-screen.",
        fix: "The form shows every problem at once, in plain words beside the button, with the cursor on the first.",
      },
      {
        asked: "Brief extraction took too many clicks.",
        fix: "One “Add to my projects” button replaces two, and the brief’s budget and currency come with it.",
      },
      {
        asked: "Clicked “+” on the signed-out dashboard expecting to start a project.",
        fix: "Signed out, /dashboard now explains what FreeFlow does and how to start, and the Dock names every tool.",
      },
      {
        asked: "“If I still have to go make the invoice somewhere else, I’d probably just stick to what I use.”",
        fix: "The copy now says up front that FreeFlow tracks invoices rather than sending them.",
      },
    ],
  },
  {
    tester: "Tester 2",
    role: "Psychologist",
    device: "Safari",
    date: "Nov 4",
    tried: "Explored the landing page, signed up, added two projects, tried brief extraction, asked the help desk two questions, switched currency to MXN and exported a CSV.",
    liked: "The worry notes, and Delete’s “Keep it”.",
    issues: [
      {
        asked: "Couldn’t undo an accidental “Mark paid”.",
        fix: "A paid row offers “Mark unpaid”, Edit has “Paid on”, and Mark paid uses your own date, not the server’s.",
      },
      {
        asked: "Expected the floating “+” to create something, not open a menu.",
        fix: "The Dock moved to the corner, shows every label in two groups, opens as a grid on phones, and the top bar names the tools on desktop.",
      },
      {
        asked: "A project said “9d late” while expected income still showed it in December.",
        fix: "An invoice now counts as late only after its payment terms, as the forecast assumes.",
      },
      {
        asked: "The “$” sign didn’t change after switching to MXN.",
        fix: "Amounts show explicit currency codes, with a note that FreeFlow never converts between currencies.",
      },
      {
        asked: "The help desk gave an off-topic answer.",
        fix: "The help desk routes questions to the right answer, takes a typed question straight away, works signed out and survives a reload.",
      },
      {
        asked: "“Which one actually puts it on my dashboard?” (Save to database vs. Create project).",
        fix: "The feature labels were unified, so each action has one name everywhere.",
      },
    ],
  },
  {
    tester: "Tester 3",
    role: "AI product builder",
    device: "Firefox",
    date: "Nov 10",
    tried: "Walked the dashboard by keyboard, stress-tested forms (120-character names, emoji, double-clicks, Back and refresh mid-form, edited project URLs), tried the /demo hero and checked settings across browsers.",
    liked: "Page speed, protection against double submits, and filters kept in the URL.",
    issues: [
      {
        asked: "“Sort it for me” couldn’t be clicked with a mouse until tabbed into.",
        fix: "It is now a visible, clickable button.",
      },
      {
        asked: "Keyboard focus was lost when drawers and errors opened.",
        fix: "Focus now moves into drawers and onto errors.",
      },
      {
        asked: "Long project names overflowed the table.",
        fix: "Table cells now wrap long text.",
      },
      {
        asked: "Raw backend validation text showed up in forms.",
        fix: "Forms check input first and explain problems in plain words.",
      },
      {
        asked: "A malformed project ID in the URL caused a 500 error.",
        fix: "Malformed IDs now return a 404.",
      },
      {
        asked: "Going Back or refreshing mid-form lost what was typed.",
        fix: "Form drafts are now kept for the session.",
      },
    ],
  },
  {
    tester: "Tester 4",
    role: "Marketing consultant",
    device: "Chrome",
    date: "Nov 12",
    tried: "Read every public page and legal link, signed up, created three projects (one with Mexican tax withholding), tested brief extraction in English and Spanish, and asked the help desk about pricing and privacy.",
    liked: "The home page’s voice, honest capability counts and accurate withholding maths.",
    issues: [
      {
        asked: "Couldn’t find a plain price on /pricing, which opened on a revenue simulator.",
        fix: "/pricing now says what FreeFlow costs first.",
      },
      {
        asked: "/privacy and /terms led to stock white 404 pages.",
        fix: "Privacy and Terms pages, a footer and a branded 404 page.",
      },
      {
        asked: "Class-project wording (“Week 3”, “rubric”) showed on customer pages.",
        fix: "Build-log pages are kept apart from customer pages, and the leftover copy was cleaned off the live site.",
      },
      {
        asked: "Totals were confusing ($1,200 / $1,392 / $1,144).",
        fix: "Figures are labelled gross, net and withheld.",
      },
    ],
  },
  {
    tester: "Tester 5",
    role: "Architect",
    device: "iPhone 13",
    date: "Nov 15",
    tried: "Ran the full flow in mobile Safari: signed up, created a flat-rate job and an overdue hourly project, edited one and marked one paid, ran brief extraction, used the help desk and switched currency.",
    liked: "No sideways scrolling, number keypads and inline editing.",
    issues: [
      {
        asked: "The floating “+” covered “No projects yet” and form controls.",
        fix: "Pages have room at the bottom for the Dock, “+” hides while a form is open, and “+ New project” sits at the top.",
      },
      {
        asked: "An empty “Add project” submit looked frozen, with the error off-screen.",
        fix: "Every problem shows beside the button, with the cursor on the first.",
      },
      {
        asked: "The search bar was squashed to one character.",
        fix: "Search is full-width on phones.",
      },
      {
        asked: "Inputs under 16px made iOS zoom in.",
        fix: "Inputs are 16px or larger, and tap targets at least 44×44px.",
      },
      {
        asked: "Reloading wiped an extracted brief.",
        fix: "Brief extractions are saved across reloads.",
      },
    ],
  },
];

export type RegressionCheck = { check: string; result: string };

export const REGRESSION = {
  run: "Latest run: Nov 18, after the redesigned front page, Answer gates and the scroll fix (3a620e6). The signed-in rows are from the Nov 10 run on the owner’s account.",
  checks: [
    { check: "npm test", result: "21 suites, 1,852 passed, 0 failed" },
    { check: "npm run lint, npm run build, npx tsc --noEmit", result: "All exit 0" },
    {
      check: "Every page live, signed out",
      result:
        "12 pages HTTP 200; /core redirects to sign-up. Since then the donations page /support was switched off on purpose: it now answers 404 and is gone from the Dock.",
    },
    {
      check: "Every page at 375px, signed out",
      result: "12 pages: document width 375, nothing wider than the screen, the Dock on each",
    },
    {
      check: "/demo live",
      result:
        "The hero sorts with the scroll; Answer gates starts with Space without scrolling the page and ends with focus on Play again; no console errors",
    },
    {
      check: "Signed in (Nov 10)",
      result:
        "/ and /login go to /dashboard; “Your work” shows the records from Supabase; the public tab is beside it; no sideways scrolling on any of 11 pages",
    },
    { check: "Live writes (Nov 10)", result: "Vote, duplicate vote, refused vote, “Try free” click; the counts rise" },
    {
      check: "Live after deploy 8",
      result:
        "16 public pages 200; /support and unknown URLs 404 (branded page); /core → /login?next=/core; /pricing, /dashboard and /chat show the new copy signed out",
    },
    {
      check: "Still to run",
      result: "The signed-in flows (Mark unpaid, Paid on, Add to my projects) on the owner’s account",
    },
  ] satisfies RegressionCheck[],
};

export type IterationGroup = {
  title: string;
  intro: string;
  items: string[];
  more?: { intro: string; items: string[] };
};

export const ITERATION_LOG: IterationGroup[] = [
  {
    title: "A fresh code review of the whole site before release",
    intro: "Four problems a visitor would hit, each fixed with a test that failed first:",
    items: [
      "Hovering opened the Dock and moved its button, so a click aimed at the button opened a page instead. Page icons now wait a moment before taking a click.",
      "A dragged worry stuttered because its shake animation fought the drag. Dragging now stops the shake.",
      "On phones, the worry panel blocked scrolling the page. Only the worries block it now.",
      "Three help-desk answers still described the old top bar and said FreeFlow sends no other email. They now match the site.",
    ],
    more: {
      intro: "Three smaller findings were re-graded by their effect and fixed too:",
      items: [
        "The first tap after a drag was ignored.",
        "A game round could be counted twice in the public numbers.",
        "Long worries were cut off on phones.",
      ],
    },
  },
  {
    title: "The owner’s own review",
    intro: "Three things the owner didn’t like, and what replaced them:",
    items: [
      "The front screen “feels like a generic page”. It was redesigned from playable mockups (Nov 12): the visitor’s worries drift under the headline, the page starts neutral, and START FREE ends it.",
      "The game needed to fit the story’s ending. Three rounds of playable prototypes led to Answer gates (Nov 18): fly and remember, with no setup before playing.",
      "The scroll sort “does not fit the flow of the page”. The notes now turn into checked rows with the scroll, one after another (Nov 18).",
    ],
  },
  {
    title: "Reviews of the redesign and the game",
    intro: "Each change got a fresh whole-branch code review; every important finding was fixed with a test that failed first:",
    items: [
      "Front page (Nov 12): the colour wave was hidden behind the page, a finger drag was taken by the browser, the job picker was cut off on a phone, and “Sort it for me” didn’t bring the rows into view.",
      "Answer gates (Nov 18): the game spilled past its border on phones, a finger scrolling past could start a run (and inflate the public “rounds played” count), and red was used for things that aren’t overdue. Five smaller findings were fixed too, including missed gates now showing the answer and screen readers hearing the answer options.",
    ],
  },
  {
    title: "From the external tests",
    intro: "The five testers’ 35 findings (above) were each fixed with a test that failed first, in six commits on Nov 19:",
    items: [
      "Mark paid can be undone and dated. A paid row offers “Mark unpaid”, Edit has “Paid on”, and Mark paid uses your own date, not the server’s.",
      "Briefs keep their budget. “budget 800 usd”, “$1,800 flat” and “8,500 MXN” are read as a fixed total with their currency, “persona moral” and “SA de CV” as a company client, and one “Add to my projects” button replaces two.",
      "The form shows every problem at once: in plain words, beside the button, with the cursor on the first. The deadline no longer defaults to today.",
      "The menu has names. The Dock moved to the corner, shows every label in two groups, opens as a grid on phones, and the top bar names the tools on desktop.",
      "Sign-up no longer looks like a dead end. The confirm page leads with “Check your Spam folder” and an Open Gmail button. The email settings themselves are the owner’s step.",
    ],
    more: {
      intro: "The rest:",
      items: [
        "/pricing says what FreeFlow costs first.",
        "An invoice is late after its payment terms, as the forecast assumes.",
        "The help desk takes a typed question straight away, works signed out and survives a reload.",
        "Privacy and Terms pages, a footer and a branded 404.",
        "Phone fixes.",
        "Sign-in checks and plain errors.",
      ],
    },
  },
];
