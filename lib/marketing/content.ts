import type {
  ContentSet,
  HeadlineVariant,
  SocialPost,
  VideoScript,
} from "./types";

/*
  Seed content.

  This is the heuristic fallback: real, on-brand copy that renders when the
  Claude key is absent and that the tests run against. When the generate route
  has a key it replaces this with model output labelled `model`; without one the
  page still shows a complete campaign labelled `heuristic`. Same contract as
  /core.

  Every line is grounded in the persona (docs/extras/VALIDATION_FINDINGS.md) or
  a built feature (lib/product/features.ts). Voice rules in docs/week4/BRAND.md.
*/

export const SEED_POSTS: SocialPost[] = [
  {
    id: "post-01",
    channel: "x",
    hook: "You know what you're owed. Do you know what's coming?",
    body: "FreeFlow forecasts the cash from projects you haven't invoiced yet — by expected pay date, not just the overdue pile.",
    cta: "Free while we grow → freeflow.website",
  },
  {
    id: "post-02",
    channel: "linkedin",
    hook: "Most invoice trackers answer 'what am I owed?'. That's the easy half.",
    body: "The freelancers I talked to already know their overdue total. What they can't see is next month. FreeFlow builds a cash-flow forecast from your pipeline — contracted, in progress, invoice sent — each weighted by how likely it is to land.",
    cta: "Try it free: freeflow.website",
  },
  {
    id: "post-03",
    channel: "x",
    hook: "Priced per job, not per hour? Same.",
    body: "FreeFlow opens on a fixed-fee project by default. Hourly exists if you need it, but you shouldn't have to fight the form to bill the way you actually work.",
    cta: "freeflow.website",
  },
  {
    id: "post-04",
    channel: "instagram",
    hook: "The freelancer's real question isn't 'who owes me?'",
    body: "It's 'will I make rent in March?' FreeFlow turns your project pipeline into a month-by-month forecast so the answer isn't a guess.",
    cta: "Link in bio — free to start.",
  },
  {
    id: "post-05",
    channel: "reddit",
    hook: "Built a free tool for freelancers who bill per project (not hourly)",
    body: "It tracks projects and forecasts the cash coming from work you haven't invoiced yet. Handles 11 currencies and Mexican tax (IVA, retenciones, RESICO) because half the people I built it for aren't in the US. No paywall — free while it grows, optional donation if it helps you.",
    cta: "freeflow.website — feedback welcome, roast the mobile view.",
  },
  {
    id: "post-06",
    channel: "linkedin",
    hook: "'I'd rather rent something maintained than build it myself.'",
    body: "That's a real freelancer I interviewed, explaining why a spreadsheet loses. FreeFlow is the maintained version: your projects, your forecast, your exports — kept current so you don't.",
    cta: "freeflow.website",
  },
  {
    id: "post-07",
    channel: "x",
    hook: "Freelancing across borders?",
    body: "FreeFlow speaks 11 currencies and doesn't convert them behind your back — a peso project stays in pesos. Mexican retenciones are worked out for you, RESICO included.",
    cta: "freeflow.website",
  },
  {
    id: "post-08",
    channel: "instagram",
    hook: "Export everything. Owe us nothing.",
    body: "Your project list, retenciones already calculated, as a clean CSV your accountant can open. FreeFlow is free while we grow — donate only if it earns it.",
    cta: "Link in bio.",
  },
  {
    id: "post-09",
    channel: "x",
    hook: "Overdue is a colour, not a surprise.",
    body: "FreeFlow flags late invoices in red and shows the forecast next to them, so a slow payer doesn't quietly wreck your month.",
    cta: "freeflow.website",
  },
  {
    id: "post-10",
    channel: "linkedin",
    hook: "A free tool that refuses to flatter you.",
    body: "FreeFlow won't tell you a maybe-project is guaranteed money. Every forecasted payment is weighted by its stage, so the number you plan against is honest, not hopeful.",
    cta: "See your forecast: freeflow.website",
  },
];

export const SEED_SCRIPTS: VideoScript[] = [
  {
    id: "script-01",
    title: "What's coming, not just what's owed",
    durationSec: 45,
    hook: "Every invoice app shows what you're owed. That's the number that's already late.",
    body: "Here's the one that matters: what's coming. FreeFlow reads your pipeline — contracted, in progress, invoice sent — and lays out the cash by the month you'll actually get it, each amount weighted by how likely it is to land. No wishful thinking, no inflated totals.",
    cta: "It's free while we grow. freeflow.website.",
  },
  {
    id: "script-02",
    title: "Built for how freelancers actually bill",
    durationSec: 40,
    hook: "I interviewed a freelancer who installs software per job. Fixed fee, contract up front, billed on completion.",
    body: "Every tracker assumed he billed hourly. He doesn't. So FreeFlow opens on a fixed-fee project, handles 11 currencies without converting them, and works out Mexican retenciones — RESICO included — so the tax isn't a second job.",
    cta: "Free to start: freeflow.website.",
  },
  {
    id: "script-03",
    title: "Free while we grow",
    durationSec: 30,
    hook: "FreeFlow has no paywall. None.",
    body: "It's free while we grow, because a tool nobody can afford to try is a tool nobody uses. If it makes your month easier, there's an optional donation button. If it doesn't, keep your money and tell us what's broken.",
    cta: "freeflow.website.",
  },
];

export const SEED_HEADLINES: HeadlineVariant[] = [
  {
    id: "hl-a1",
    test: "value-prop",
    text: "Know what is coming, not just what you are owed.",
  },
  {
    id: "hl-a2",
    test: "value-prop",
    text: "See next month's cash before it arrives.",
  },
  {
    id: "hl-b1",
    test: "audience",
    text: "For freelancers who bill per project.",
  },
  {
    id: "hl-b2",
    test: "audience",
    text: "The forecast your invoice app forgot.",
  },
];

/*
  The 14-day calendar is derived, not hand-typed, so it always references real
  assets and always has 14 days — see buildCalendar in generate.ts. Composing it
  here keeps content.ts the single export the page imports.
*/
import { buildCalendar } from "./generate";

export const SEED_CONTENT: ContentSet = {
  provenance: "heuristic",
  posts: SEED_POSTS,
  scripts: SEED_SCRIPTS,
  calendar: buildCalendar(SEED_POSTS, SEED_SCRIPTS),
  headlines: SEED_HEADLINES,
};
