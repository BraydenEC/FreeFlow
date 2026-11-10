import { z } from "zod";
import { ROADMAP_IDS } from "@/lib/venture/roadmap";
import { JOB_ORDER } from "@/lib/funnel/jobs";

/*
  What an anonymous visitor may send to the three Week 6 write routes:
  POST /api/funnel, /api/launch-list and /api/roadmap/vote.

  Strict, so no extra column can be slipped in, and bounded, because these
  routes take writes from anyone. The database checks the same limits again
  (supabase/week6_venture.sql).
*/

export const FUNNEL_EVENTS = ["try_free_click", "round_played", "story_complete", "night_sorted"] as const;

export const LAUNCH_SOURCES = ["morning", "game_end", "footer"] as const;

/** The consent wording the launch-list checkbox shows, by version. */
export const CONSENT_VERSION = "2026-11-09";

export const FunnelEventSchema = z.strictObject({
  event: z.enum(FUNNEL_EVENTS),
  job: z.enum(JOB_ORDER as [string, ...string[]]).optional(),
  visitId: z.uuid(),
});

export const LaunchListSchema = z.strictObject({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .pipe(z.email()),
  consent: z.literal(true),
  source: z.enum(LAUNCH_SOURCES),
});

export const VoteSchema = z.strictObject({
  itemId: z.enum(ROADMAP_IDS as [string, ...string[]]),
  voterKey: z.uuid(),
});
