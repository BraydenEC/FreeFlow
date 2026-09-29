import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { PERSONA } from "./persona";
import { SEED_CONTENT } from "./content";
import { buildCalendar, validateContentSet } from "./generate";
import { MarketingGenerationSchema } from "./schema";
import type { ContentSet } from "./types";
import { REQUIRED_POSTS, REQUIRED_SCRIPTS } from "./types";

/*
  Marketing generation orchestration — the I/O half.

  Same null-safe, provenance-labelled contract as lib/core/extract.ts. A missing
  key is a supported state: the page still renders a full campaign, labelled
  `heuristic`, from SEED_CONTENT. When the model runs and returns valid content,
  it is labelled `model`. Invalid model output falls back rather than shipping a
  short or empty campaign.

  The calendar is never asked of the model; it is derived from whatever posts and
  scripts come back, so a slot can never reference an asset that does not exist.
*/

function getApiKey(): string | null {
  const key = process.env.ANTHROPIC_API_KEY;
  return key && key.trim() ? key.trim() : null;
}

export function isModelConfigured(): boolean {
  return getApiKey() !== null;
}

const SYSTEM_PROMPT = `You are a marketing copywriter for FreeFlow, a free web app that helps freelancers track projects and forecast the cash coming from work they have not invoiced yet.

Write in FreeFlow's voice: plain, specific, and unwilling to flatter. Name the task, not the feeling. Never claim a feature that is not described to you. The product is free while it grows, with an optional donation — say that honestly, never as a fake limited-time offer. Numbers, currencies and product names are exact.

Ground every line in the persona you are given. Do not invent a different audience.

Return ${REQUIRED_POSTS} social posts across x, linkedin, instagram and reddit; ${REQUIRED_SCRIPTS} short-form video scripts (each with a hook, body and CTA, 30-60 seconds); and at least 4 headline variants forming at least two A/B pairs that share a "test" name (two variants per test).`;

function buildUserMessage(): string {
  return [
    "PERSONA (validated from a real interview — do not contradict it):",
    `- Who: ${PERSONA.role}`,
    `- Finds work by: ${PERSONA.acquisition}`,
    `- Bills: ${PERSONA.billing}`,
    `- In their words: "${PERSONA.quote}"`,
    `- Buying insight: ${PERSONA.insight}`,
    "",
    "DO NOT:",
    ...PERSONA.antiPatterns.map((a) => `- ${a}`),
    "",
    "REAL FEATURES you may reference: cash-flow forecast weighted by project stage; fixed-fee-first project entry; 11 currencies with no hidden conversion; Mexican tax handled (IVA, retenciones, RESICO); CSV export with retenciones calculated; overdue invoices flagged; free while we grow with an optional donation.",
  ].join("\n");
}

/**
 * Generate a marketing campaign. Always resolves to a valid ContentSet:
 * model-labelled when the model produced valid content, heuristic-labelled
 * (SEED_CONTENT) otherwise.
 */
export async function generateCampaign(): Promise<ContentSet> {
  const apiKey = getApiKey();
  if (!apiKey) return SEED_CONTENT;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      output_config: {
        effort: "low",
        format: zodOutputFormat(MarketingGenerationSchema),
      },
      messages: [{ role: "user", content: buildUserMessage() }],
    });

    if (!response.parsed_output) return SEED_CONTENT;

    const g = response.parsed_output;
    const posts = g.posts.map((p, i) => ({
      id: `post-${String(i + 1).padStart(2, "0")}`,
      ...p,
    }));
    const scripts = g.scripts.map((s, i) => ({
      id: `script-${String(i + 1).padStart(2, "0")}`,
      ...s,
    }));
    const headlines = g.headlines.map((h, i) => ({ id: `hl-${i + 1}`, ...h }));

    const set: ContentSet = {
      provenance: "model",
      posts,
      scripts,
      calendar: buildCalendar(posts, scripts),
      headlines,
    };

    // The same validator the tests use. If the model returned something that
    // would render short or empty, prefer the complete seed campaign.
    if (validateContentSet(set).length > 0) return SEED_CONTENT;
    return set;
  } catch (error) {
    const reason =
      error instanceof Anthropic.APIError
        ? `Model API error ${error.status}.`
        : "Unexpected error calling the model.";
    console.warn("[marketing] Generation failed, using seed content:", reason);
    return SEED_CONTENT;
  }
}
