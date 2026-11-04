import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { heuristicExtract } from "@/lib/core/heuristic";
import { buildUserMessage, SYSTEM_PROMPT } from "@/lib/core/prompt";
import { CoreExtractionSchema, withRealDeadline, type ExtractionResult } from "@/lib/core/schema";

/*
  Extraction orchestration.

  Same null-safe pattern proven in Week 0: a missing key is a supported state,
  not an error. Constructing the SDK client at module scope would throw during
  `next build` when ANTHROPIC_API_KEY is absent — failing the deployment before
  the fallback could ever run.

  One deliberate difference from Week 0: the result always names which path
  produced it. Week 0's fallback was invisible, and production silently served
  mock data for six deployments. Degradation here is observable by design.
*/

/** No NEXT_PUBLIC_ prefix — this key must never be inlined into client JS. */
function getApiKey(): string | null {
  const key = process.env.ANTHROPIC_API_KEY;
  return key && key.trim() ? key.trim() : null;
}

export function isModelConfigured(): boolean {
  return getApiKey() !== null;
}

/** ISO date in UTC, used to resolve relative expressions like "end of month". */
function todayIso(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export async function extractCore(
  brief: string,
  now: Date,
): Promise<ExtractionResult> {
  const result = await runExtraction(brief, now);
  return { ...result, fields: withRealDeadline(result.fields) };
}

async function runExtraction(
  brief: string,
  now: Date,
): Promise<ExtractionResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      fields: heuristicExtract(brief, now),
      extractor: "heuristic",
      fallbackReason: "No ANTHROPIC_API_KEY configured on the server.",
    };
  }

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      // Extraction is a well-specified task with a fixed schema, so low effort
      // keeps latency around a second — which matters for a form the user is
      // waiting on, and for a live demo.
      output_config: {
        effort: "low",
        format: zodOutputFormat(CoreExtractionSchema),
      },
      messages: [
        { role: "user", content: buildUserMessage(brief, todayIso(now)) },
      ],
    });

    // parsed_output is null when the response failed schema validation.
    // Treat that as a model failure and fall back rather than shipping a
    // half-populated card.
    if (!response.parsed_output) {
      return {
        fields: heuristicExtract(brief, now),
        extractor: "heuristic",
        fallbackReason: "Model response did not match the expected schema.",
      };
    }

    return { fields: response.parsed_output, extractor: "model" };
  } catch (error) {
    // Typed most-specific-first. Each branch produces a message the user can
    // act on, rather than a stack trace.
    let reason = "Unexpected error calling the model.";

    if (error instanceof Anthropic.AuthenticationError) {
      reason = "The configured ANTHROPIC_API_KEY was rejected.";
    } else if (error instanceof Anthropic.RateLimitError) {
      reason = "Model rate limit reached; try again shortly.";
    } else if (error instanceof Anthropic.BadRequestError) {
      reason = `Model rejected the request: ${error.message}`;
    } else if (error instanceof Anthropic.APIConnectionError) {
      reason = "Could not reach the model API.";
    } else if (error instanceof Anthropic.APIError) {
      reason = `Model API error ${error.status}.`;
    }

    console.warn("[core] Model extraction failed, using heuristic:", reason);

    return {
      fields: heuristicExtract(brief, now),
      extractor: "heuristic",
      fallbackReason: reason,
    };
  }
}
