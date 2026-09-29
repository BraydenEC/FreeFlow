import {
  CAMPAIGN_DAYS,
  REQUIRED_POSTS,
  REQUIRED_SCRIPTS,
  type CalendarSlot,
  type ContentSet,
  type SocialPost,
  type VideoScript,
} from "./types";

/*
  Pure content logic — no React, no I/O, no Anthropic import.

  The generate route calls buildCalendar / validateContentSet on model output,
  and the tests call them on the seed content. Same code both ways, so a passing
  test means the page renders valid content.
*/

const CALENDAR_THEMES = [
  "Problem: what's owed vs. what's coming",
  "Feature: the cash-flow forecast",
  "Persona: billed per project",
  "Proof: honest, weighted numbers",
  "Reach: currencies and Mexican tax",
  "Pricing: free while we grow",
  "Objection: rent, don't build",
] as const;

/**
 * Derive a 14-day campaign calendar from the available assets. Deterministic:
 * same input always yields the same schedule, always CAMPAIGN_DAYS long, always
 * referencing a real asset. Scripts (fewer, heavier) are spaced across the two
 * weeks rather than clustered.
 */
export function buildCalendar(
  posts: SocialPost[],
  scripts: VideoScript[],
): CalendarSlot[] {
  const slots: CalendarSlot[] = [];
  // No content at all: still return a full, empty-but-valid skeleton so the
  // page never renders a short calendar.
  const hasPosts = posts.length > 0;
  const hasScripts = scripts.length > 0;

  // Days that carry a video, evenly spread when scripts exist (e.g. 3 scripts
  // over 14 days -> roughly days 4, 9, 14).
  const videoDays = new Set<number>();
  if (hasScripts) {
    for (let i = 0; i < scripts.length; i++) {
      const day = Math.round(((i + 1) * CAMPAIGN_DAYS) / scripts.length);
      videoDays.add(Math.min(CAMPAIGN_DAYS, Math.max(1, day)));
    }
  }

  let postCursor = 0;
  let scriptCursor = 0;

  for (let day = 1; day <= CAMPAIGN_DAYS; day++) {
    const theme = CALENDAR_THEMES[(day - 1) % CALENDAR_THEMES.length];
    if (videoDays.has(day) && hasScripts) {
      const script = scripts[scriptCursor % scripts.length];
      scriptCursor++;
      slots.push({ day, channel: "video", theme, assetRef: script.id });
    } else if (hasPosts) {
      const post = posts[postCursor % posts.length];
      postCursor++;
      slots.push({ day, channel: post.channel, theme, assetRef: post.id });
    } else {
      slots.push({ day, channel: "x", theme, assetRef: "" });
    }
  }
  return slots;
}

/**
 * Validate a content set. Returns a list of human-readable problems; an empty
 * list means it is safe to render and save. Used on model output before it is
 * trusted, and asserted against the seed content in tests.
 */
export function validateContentSet(set: ContentSet): string[] {
  const errors: string[] = [];

  if (set.posts.length < REQUIRED_POSTS) {
    errors.push(
      `expected at least ${REQUIRED_POSTS} posts, got ${set.posts.length}`,
    );
  }
  if (set.scripts.length < REQUIRED_SCRIPTS) {
    errors.push(
      `expected at least ${REQUIRED_SCRIPTS} scripts, got ${set.scripts.length}`,
    );
  }
  if (set.calendar.length !== CAMPAIGN_DAYS) {
    errors.push(
      `calendar must be exactly ${CAMPAIGN_DAYS} days, got ${set.calendar.length}`,
    );
  }

  // Every post field must be non-empty — a blank hook is worse than no post.
  for (const p of set.posts) {
    if (!p.id || !p.hook.trim() || !p.body.trim() || !p.cta.trim()) {
      errors.push(`post ${p.id || "(no id)"} has an empty field`);
    }
  }
  for (const s of set.scripts) {
    if (
      !s.id ||
      !s.title.trim() ||
      !s.hook.trim() ||
      !s.body.trim() ||
      !s.cta.trim()
    ) {
      errors.push(`script ${s.id || "(no id)"} has an empty field`);
    }
    if (s.durationSec <= 0) {
      errors.push(`script ${s.id} has a non-positive duration`);
    }
  }

  // Calendar days must be the full 1..CAMPAIGN_DAYS set, no gaps or repeats.
  const days = new Set(set.calendar.map((c) => c.day));
  for (let d = 1; d <= CAMPAIGN_DAYS; d++) {
    if (!days.has(d)) errors.push(`calendar is missing day ${d}`);
  }

  // Every calendar slot must point at an asset that exists.
  const assetIds = new Set([
    ...set.posts.map((p) => p.id),
    ...set.scripts.map((s) => s.id),
  ]);
  for (const slot of set.calendar) {
    if (slot.assetRef && !assetIds.has(slot.assetRef)) {
      errors.push(`day ${slot.day} references unknown asset ${slot.assetRef}`);
    }
  }

  // Headlines come in A/B pairs — at least one complete pair to test.
  const byTest = new Map<string, number>();
  for (const h of set.headlines) {
    if (!h.text.trim()) errors.push(`headline ${h.id} is empty`);
    byTest.set(h.test, (byTest.get(h.test) ?? 0) + 1);
  }
  const hasPair = [...byTest.values()].some((n) => n >= 2);
  if (!hasPair) errors.push("no A/B headline pair (need two variants sharing a test)");

  return errors;
}

/** A one-line summary for the page header and tests. */
export function contentSummary(set: ContentSet): {
  posts: number;
  scripts: number;
  calendarDays: number;
  headlines: number;
  provenance: ContentSet["provenance"];
  valid: boolean;
} {
  return {
    posts: set.posts.length,
    scripts: set.scripts.length,
    calendarDays: set.calendar.length,
    headlines: set.headlines.length,
    provenance: set.provenance,
    valid: validateContentSet(set).length === 0,
  };
}
