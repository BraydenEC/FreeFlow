/*
  Marketing content types.

  Pure data shapes shared by the seed content, the generate route, the
  validators, and the /marketing page. No React, no I/O here — the same shapes
  are rendered by the page and asserted by the tests.
*/

/** Where a piece of content came from — mirrors the /core provenance rule. */
export type Provenance = "model" | "heuristic";

export type ContentKind = "post" | "script" | "calendar" | "headline";

export type SocialChannel = "x" | "linkedin" | "instagram" | "reddit";

export type SocialPost = {
  id: string;
  channel: SocialChannel;
  /** The scroll-stopping first line. */
  hook: string;
  /** The post body. */
  body: string;
  /** The call to action. */
  cta: string;
};

export type VideoScript = {
  id: string;
  title: string;
  /** Target runtime in seconds — short-form. */
  durationSec: number;
  hook: string;
  body: string;
  cta: string;
};

export type CalendarSlot = {
  /** 1..14 — the day of a two-week campaign. */
  day: number;
  channel: SocialChannel | "video";
  theme: string;
  /** id of the post or script this slot publishes. */
  assetRef: string;
};

export type HeadlineVariant = {
  id: string;
  /** Which A/B pair this belongs to. */
  test: string;
  text: string;
};

export type ContentSet = {
  provenance: Provenance;
  posts: SocialPost[];
  scripts: VideoScript[];
  calendar: CalendarSlot[];
  headlines: HeadlineVariant[];
};

export const CAMPAIGN_DAYS = 14;
export const REQUIRED_POSTS = 10;
export const REQUIRED_SCRIPTS = 3;
