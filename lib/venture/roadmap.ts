import { DONATIONS_ENABLED } from "@/lib/flags";

/*
  The roadmap shown on /roadmap, with visitor upvotes.

  The ids are also listed in the roadmap_votes check constraint
  (supabase/week6_venture.sql), so a NEW item needs that constraint updated in
  Supabase first, or its votes are refused. "tester-requests" (a course item)
  was dropped from the page; the database still accepts it, harmlessly. The ids are what /api/roadmap/vote
  accepts, so changing one orphans its votes: add new items rather than
  renaming old ones.
*/

export type RoadmapBucket = "next" | "later" | "someday";

export type RoadmapItem = {
  id: string;
  title: string;
  detail: string;
  bucket: RoadmapBucket;
};

export const ROADMAP: RoadmapItem[] = [
  {
    id: "simpler-forecast",
    title: "A simpler forecast",
    detail: "One plain sentence first (what you can count on next month), with the detail underneath for when you want it.",
    bucket: "next",
  },
  {
    id: "one-time-launch",
    title: "The one-time purchase launch",
    detail: DONATIONS_ENABLED
      ? "Buy once, keep full access. Plenty of notice first, and donors get it free."
      : "Buy once, keep full access. Plenty of notice first, and the free version keeps working until then.",
    bucket: "next",
  },
  {
    id: "more-countries",
    title: "Tax and paperwork beyond Mexico",
    detail: "Withholding and paperwork rules for more places, starting with the US and Europe.",
    bucket: "later",
  },
  {
    id: "more-languages",
    title: "More languages",
    detail: "Spanish first, starting with the help desk.",
    bucket: "later",
  },
  {
    id: "more-currencies",
    title: "More currencies",
    detail: "More than today's eleven.",
    bucket: "later",
  },
  {
    id: "cfdi",
    title: "Legal Mexican e-invoices (CFDI)",
    detail: "Issued through an authorised provider, so an invoice from FreeFlow counts with the SAT.",
    bucket: "later",
  },
  {
    id: "leaderboard",
    title: "A game leaderboard and prize",
    detail: "Only once scores can be trusted. Today a score could be faked, so there is no leaderboard yet.",
    bucket: "later",
  },
  {
    id: "proof-of-work",
    title: "Proof of work on invoices",
    detail: "Attach what you delivered to the invoice that bills for it.",
    bucket: "someday",
  },
  {
    id: "studio-accounts",
    title: "Studio accounts",
    detail: "Several people working from one account.",
    bucket: "someday",
  },
];

export const ROADMAP_IDS: readonly string[] = ROADMAP.map((r) => r.id);
