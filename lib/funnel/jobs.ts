/*
  The "I'm a freelance…" picker on /demo.

  Each job re-colours the funnel (an accent token in app/globals.css) and
  swaps its examples: the night's worries in chapter 1 and the projects in the
  chapter 5 game. A worry is the chaos as it sits in your head (`chaos`, with
  an optional `sub` line), and what it becomes once FreeFlow has it (`filedAs`
  and `status`). Statuses only describe things FreeFlow actually does today,
  and no status carries a money amount, so nothing here reads as a price.

  The video editor set comes from the founder's own trade.
*/

export type JobId = "designer" | "photographer" | "video-editor" | "writer" | "developer";

export type Worry = {
  id: string;
  chaos: string;
  sub?: string;
  tone: "red" | "yellow" | "plain";
  filedAs: string;
  status: string;
};

export type Job = {
  label: string;
  accentVar: string;
  worries: Worry[];
  gameProjects: string[];
};

export const JOB_ORDER: JobId[] = ["designer", "photographer", "video-editor", "writer", "developer"];

export const DEFAULT_JOB: JobId = "designer";

export const JOBS: Record<JobId, Job> = {
  designer: {
    label: "designer",
    accentVar: "--color-job-designer",
    worries: [
      { id: "logo-v7", chaos: "Logo v7 FINAL final", sub: "Client: any update?", tone: "red", filedAs: "Logo · Café Norte", status: "Review Thu" },
      { id: "deposit", chaos: "did the deposit land?", tone: "yellow", filedAs: "Deposit · 50%", status: "Paid 04/11" },
      { id: "brand-deck", chaos: "brand deck due fri", tone: "plain", filedAs: "Brand deck · Studio Lux", status: "Fri · 3 days" },
      { id: "contract", chaos: "contract.pdf… where", tone: "plain", filedAs: "Contract · Studio Lux", status: "Signed 02/11" },
      { id: "iva", chaos: "IVA ???", sub: "they keep 2/3?", tone: "red", filedAs: "IVA withheld", status: "Worked out" },
      { id: "new-client", chaos: "new client email", sub: "‘quick favor’", tone: "yellow", filedAs: "Poster · Mercado", status: "Brief added" },
      { id: "invoice-9", chaos: "invoice #9 overdue", sub: "12 days", tone: "red", filedAs: "Invoice #9", status: "Overdue · alert on" },
      { id: "january", chaos: "what do I earn in Jan?", tone: "plain", filedAs: "January forecast", status: "In the forecast" },
    ],
    gameProjects: ["Logo", "Brand deck", "Poster", "Menu design", "Packaging", "Website mockup"],
  },
  photographer: {
    label: "photographer",
    accentVar: "--color-job-photographer",
    worries: [
      { id: "wedding-raws", chaos: "wedding RAWs 400GB", sub: "editing…", tone: "yellow", filedAs: "Wedding · Ana & Luis", status: "Editing · Fri" },
      { id: "final-payment", chaos: "did they pay??", sub: "final payment", tone: "red", filedAs: "Final payment", status: "Overdue 4 days" },
      { id: "shoot-sat", chaos: "shoot sat 7am", tone: "plain", filedAs: "Product shoot · Mesa", status: "Sat · 5 days" },
      { id: "release", chaos: "model release.pdf", sub: "signed?", tone: "plain", filedAs: "Release form", status: "Linked" },
      { id: "isr", chaos: "ISR ???", sub: "10% or 1.25%?", tone: "red", filedAs: "ISR withheld", status: "Worked out" },
      { id: "video-addon", chaos: "‘can you also do video’", tone: "yellow", filedAs: "Video add-on", status: "Brief added" },
      { id: "deposit-dec", chaos: "deposit for Dec shoot", tone: "plain", filedAs: "Deposit · Dec", status: "Due in 7 days" },
      { id: "rent", chaos: "rent vs. next month", tone: "red", filedAs: "December forecast", status: "In the forecast" },
    ],
    gameProjects: ["Wedding", "Product shoot", "Headshots", "Event coverage", "Real estate", "Portrait session"],
  },
  "video-editor": {
    label: "video editor",
    accentVar: "--color-job-video-editor",
    worries: [
      { id: "export-98", chaos: "export failed at 98%", sub: "render again…", tone: "red", filedAs: "Wedding film · Ana & Luis", status: "Due Fri · 3 days" },
      { id: "v3", chaos: "client: ‘can we see a v3?’", tone: "yellow", filedAs: "Promo cut · Mesa", status: "Awaiting review" },
      { id: "wedding-pay", chaos: "when does the wedding edit pay?", tone: "plain", filedAs: "Wedding edit", status: "Pays in 30 days" },
      { id: "footage", chaos: "where's the footage link?", tone: "plain", filedAs: "Footage + contract · Tienda", status: "Linked" },
      { id: "music-video", chaos: "music video due… thu? fri?", tone: "red", filedAs: "Music video · Banda Sur", status: "Thu · 2 days" },
      { id: "iva", chaos: "IVA ???", sub: "they keep 2/3?", tone: "red", filedAs: "IVA withheld", status: "Worked out" },
      { id: "voice-note", chaos: "brief in a voice note", sub: "‘just a quick reel’", tone: "yellow", filedAs: "Reel · Café Norte", status: "Brief added" },
      { id: "invoice-4", chaos: "invoice #4 overdue", sub: "21 days", tone: "red", filedAs: "Invoice #4", status: "Overdue · alert on" },
      { id: "december", chaos: "can I take December off?", tone: "plain", filedAs: "December forecast", status: "In the forecast" },
    ],
    gameProjects: ["Wedding film", "Music video", "Promo cut", "Reel", "Short doc", "Event recap"],
  },
  writer: {
    label: "writer",
    accentVar: "--color-job-writer",
    worries: [
      { id: "articles", chaos: "4 articles by ???", tone: "red", filedAs: "Article pack · Blog MX", status: "Thu · 2 days" },
      { id: "invoice-12", chaos: "invoice #12 sent?", tone: "yellow", filedAs: "Invoice #12", status: "Sent · due 15th" },
      { id: "rate", chaos: "rate: per word??", tone: "plain", filedAs: "Rate · Agencia", status: "Saved on the project" },
      { id: "nda", chaos: "NDA somewhere", tone: "plain", filedAs: "NDA · Agencia", status: "Linked" },
      { id: "iva", chaos: "IVA ???", tone: "red", filedAs: "IVA withheld", status: "Worked out" },
      { id: "edits", chaos: "edits round 3", sub: "‘small changes’", tone: "yellow", filedAs: "Edits · round 3", status: "Due Mon" },
      { id: "ghosted", chaos: "client ghosted", sub: "30 days", tone: "red", filedAs: "Invoice #10", status: "Overdue · alert on" },
      { id: "december", chaos: "can I take Dec off?", tone: "plain", filedAs: "December forecast", status: "In the forecast" },
    ],
    gameProjects: ["Article pack", "Newsletter", "Website copy", "Case study", "Press release", "Ghostwritten post"],
  },
  developer: {
    label: "developer",
    accentVar: "--color-job-developer",
    worries: [
      { id: "bugfix", chaos: "bugfix asap!!", sub: "prod is down", tone: "red", filedAs: "Bugfix · Tienda", status: "Today" },
      { id: "milestone", chaos: "milestone 2 paid?", tone: "yellow", filedAs: "Milestone 2", status: "Invoice sent" },
      { id: "sow", chaos: "SOW v3.docx", tone: "plain", filedAs: "Scope of work", status: "Signed" },
      { id: "isr", chaos: "ISR ???", tone: "red", filedAs: "ISR withheld", status: "Worked out" },
      { id: "feature", chaos: "‘one more feature’", tone: "yellow", filedAs: "Change request", status: "Brief added" },
      { id: "net-60", chaos: "net-60 client", sub: "still waiting", tone: "red", filedAs: "Invoice · Logística", status: "Pays 03/12" },
      { id: "dollars", chaos: "paid in dollars, rent in pesos", tone: "plain", filedAs: "Currency", status: "Set once" },
      { id: "runway", chaos: "Q1 runway?", tone: "plain", filedAs: "Q1 forecast", status: "In the forecast" },
    ],
    gameProjects: ["Bugfix", "Landing page", "API integration", "Milestone 2", "Store setup", "Dashboard"],
  },
};
