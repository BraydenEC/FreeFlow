/*
  Week 6 external testing, as shown on /docs and the /dashboard public tab.

  Five people outside the project used FreeFlow between Nov 1 and Nov 15.
  Nothing goes in here that a tester did not actually do, find or ask for, and
  testers are never named: each is identified by role and device only. Every
  issue they raised has been fixed, so each one is recorded as fixed.
*/

export type BugRecord = { id: string; found: string; fixed: boolean };

export type TesterIssue = { asked: string; fix: string };

export type TesterSession = {
  tester: string;
  role: string;
  device: string;
  date: string;
  tried: string;
  issues: TesterIssue[];
};

export const TESTER_SESSIONS: TesterSession[] = [
  {
    tester: "Tester 1",
    role: "Founder, exterior property services",
    device: "Chrome",
    date: "Nov 1",
    tried: "Started signed out on /dashboard, signed up, added a project, marked it paid, pasted a client brief and asked the help desk how to send an invoice.",
    issues: [
      {
        asked: "The confirmation email took over a minute to find, in Spam.",
        fix: "Set up SPF, DKIM and DMARC for the sending domain, and added clear Spam guidance on /verify-email.",
      },
      {
        asked: "“Add project” seemed broken because its error appeared off-screen.",
        fix: "Form errors now show inline, next to the field, and scroll into view.",
      },
      {
        asked: "Brief extraction took too many clicks.",
        fix: "One button now turns a pasted brief into a project.",
      },
      {
        asked: "Clicked “+” on the signed-out dashboard expecting to start a project.",
        fix: "The signed-out /dashboard now explains what FreeFlow does and how to start.",
      },
      {
        asked: "“If I still have to go make the invoice somewhere else, I’d probably just stick to what I use.”",
        fix: "Plain copy now says up front that FreeFlow tracks invoices rather than sending them.",
      },
    ],
  },
  {
    tester: "Tester 2",
    role: "Psychologist",
    device: "Safari",
    date: "Nov 4",
    tried: "Explored the landing page, signed up, added two projects, tried brief extraction, asked the help desk two questions, switched currency to MXN and exported a CSV.",
    issues: [
      {
        asked: "Couldn’t undo an accidental “Mark paid”.",
        fix: "Added an Undo toast, a “Mark unpaid” action and an editable paid date in Edit.",
      },
      {
        asked: "Expected the floating “+” to create something, not open a menu.",
        fix: "The Dock now has visible text labels and bottom padding so it never hides content.",
      },
      {
        asked: "The “$” sign didn’t change after switching to MXN.",
        fix: "Amounts now show explicit currency codes, with a note that FreeFlow doesn’t convert between currencies.",
      },
      {
        asked: "The help desk gave an off-topic answer.",
        fix: "Fixed how the help desk routes questions to its answers.",
      },
      {
        asked: "“Which one actually puts it on my dashboard?” (Save to database vs. Create project).",
        fix: "Unified the feature labels so each action has one name everywhere.",
      },
    ],
  },
  {
    tester: "Tester 3",
    role: "AI product builder",
    device: "Firefox",
    date: "Nov 10",
    tried: "Walked the dashboard by keyboard and stress-tested forms: 120-character names, emoji, double-clicks, Back and refresh mid-form, and edited project URLs.",
    issues: [
      {
        asked: "“Sort it for me” couldn’t be clicked with a mouse until tabbed into.",
        fix: "It is now a visible, clickable button.",
      },
      {
        asked: "Keyboard focus was lost when drawers and errors opened.",
        fix: "Focus now moves into drawers and onto errors, and returns when they close.",
      },
      {
        asked: "Long project names overflowed the table.",
        fix: "Table cells now wrap long text.",
      },
      {
        asked: "Raw backend validation text showed up in forms.",
        fix: "Forms now check input in the browser first and explain problems in plain words.",
      },
      {
        asked: "A malformed project ID in the URL caused a 500 error.",
        fix: "Malformed IDs now return a proper 404.",
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
    tried: "Read every public page and legal link, signed up, created three projects (one with Mexican tax withholding), tested brief extraction in English and Spanish, and asked about pricing and privacy.",
    issues: [
      {
        asked: "Couldn’t find a plain price on /pricing, which opened on a revenue simulator.",
        fix: "/pricing now opens with a one-line statement of what FreeFlow costs.",
      },
      {
        asked: "/privacy and /terms led to stock white 404 pages.",
        fix: "Published the Privacy Policy and Terms, and added a branded 404 page.",
      },
      {
        asked: "Class-project wording (“Week 3”, “rubric”) showed on customer pages.",
        fix: "Build-log pages are now separate from customer pages, and the leftover copy was cleaned off the live site.",
      },
      {
        asked: "Totals were confusing ($1,200 / $1,392 / $1,144).",
        fix: "Figures are now labelled gross, net and withheld.",
      },
    ],
  },
  {
    tester: "Tester 5",
    role: "Architect",
    device: "iPhone 13",
    date: "Nov 15",
    tried: "Ran the full flow in mobile Safari: signed up, created a flat-rate job and an overdue hourly project, edited and marked one paid, ran brief extraction, used the help desk and switched currency.",
    issues: [
      {
        asked: "The floating “+” covered “No projects yet” and form controls.",
        fix: "Pages now have 90px of bottom padding, the “+” hides while a form is open, and a “+ New project” button sits at the top.",
      },
      {
        asked: "An empty “Add project” submit looked frozen, with the error off-screen.",
        fix: "Errors now show next to the field and scroll into view.",
      },
      {
        asked: "The search bar was squashed to one character.",
        fix: "Search is full-width on phones.",
      },
      {
        asked: "Inputs under 16px made iOS zoom in.",
        fix: "All inputs are 16px or larger, and tap targets are at least 44×44px.",
      },
      {
        asked: "Reloading wiped an extracted brief.",
        fix: "Brief extractions are now saved across reloads.",
      },
    ],
  },
];

/* Every issue a tester raised, for the /dashboard "found / fixed" count. */
export const BUGS: BugRecord[] = TESTER_SESSIONS.flatMap((s, i) =>
  s.issues.map((issue, j) => ({ id: `t${i + 1}-${j + 1}`, found: issue.asked, fixed: true })),
);

export const TESTER_REQUESTS: string[] = [];
