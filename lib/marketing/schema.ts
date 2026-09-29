import { z } from "zod";
import { REQUIRED_POSTS, REQUIRED_SCRIPTS } from "./types";

/*
  The shape the model must return. Calendar is NOT asked of the model — it is
  derived deterministically from the assets (buildCalendar), so the model cannot
  return a calendar that points at posts it did not write.
*/

export const SocialChannelSchema = z.enum(["x", "linkedin", "instagram", "reddit"]);

export const ModelPostSchema = z.object({
  channel: SocialChannelSchema,
  hook: z.string().min(1),
  body: z.string().min(1),
  cta: z.string().min(1),
});

export const ModelScriptSchema = z.object({
  title: z.string().min(1),
  durationSec: z.number().int().positive(),
  hook: z.string().min(1),
  body: z.string().min(1),
  cta: z.string().min(1),
});

export const ModelHeadlineSchema = z.object({
  test: z.string().min(1),
  text: z.string().min(1),
});

export const MarketingGenerationSchema = z.object({
  posts: z.array(ModelPostSchema).min(REQUIRED_POSTS),
  scripts: z.array(ModelScriptSchema).min(REQUIRED_SCRIPTS),
  headlines: z.array(ModelHeadlineSchema).min(4),
});

export type MarketingGeneration = z.infer<typeof MarketingGenerationSchema>;
