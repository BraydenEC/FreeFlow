import { DEFAULT_JOB, JOBS, JOB_ORDER, NEUTRAL_WORRIES, type JobId, type Worry } from "@/lib/funnel/jobs";

/*
  What the visitor picked with the job word on /demo.

  The page starts neutral ("I'm a freelancer", warm grey) with a general mix
  of worries. The picker then offers the five jobs plus "Brayden's own", the
  founder's night as a video editor in his own grey.

  A choice is not a job: the database only knows the five jobs, so neutral
  sends no job with an event, and Brayden's own counts as video editor.
  Chapters that need a job's examples (the game) use contentJob, which falls
  back to the default job while neutral.
*/

export type Choice = "freelancer" | JobId | "brayden";

export const DEFAULT_CHOICE: Choice = "freelancer";

/** The six swatches, in order. */
export const CHOICE_ORDER: Exclude<Choice, "freelancer">[] = [...JOB_ORDER, "brayden"];

export function isChoice(v: unknown): v is Choice {
  return v === "freelancer" || v === "brayden" || (typeof v === "string" && (JOB_ORDER as string[]).includes(v));
}

export function jobForChoice(c: Choice): JobId | null {
  if (c === "freelancer") return null;
  if (c === "brayden") return "video-editor";
  return c;
}

export function contentJob(c: Choice): JobId {
  return jobForChoice(c) ?? DEFAULT_JOB;
}

/** The word in the headline: "freelancer", or the job's label. */
export function choiceWord(c: Choice): string {
  return c === "freelancer" ? "freelancer" : JOBS[contentJob(c)].label;
}

/** What comes before the word, so the line reads "I'm a freelancer" or "I'm a freelance designer". */
export function choicePrefix(c: Choice): string {
  return c === "freelancer" ? "I'm a " : "I'm a freelance ";
}

/** The swatch's name. */
export function choiceName(c: Choice): string {
  return c === "brayden" ? "Brayden's own" : choiceWord(c);
}

export function choiceAccentVar(c: Choice): string {
  if (c === "freelancer") return "--color-job-neutral";
  if (c === "brayden") return "--color-job-brayden";
  return JOBS[c].accentVar;
}

export function worriesFor(c: Choice): Worry[] {
  return c === "freelancer" ? NEUTRAL_WORRIES : JOBS[contentJob(c)].worries;
}
