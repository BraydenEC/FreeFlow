import { z } from "zod";
import { isRealCalendarDate } from "@/lib/projects/schema";

/*
  The extraction contract.

  One schema, three consumers: the Anthropic structured-output format, the
  deterministic fallback extractor, and the API route's response validation.
  Defining it once means the model path and the heuristic path cannot drift
  into producing different shapes — which matters because the UI renders both
  through the same card.
*/

export const PROJECT_STATUSES = [
  "in_progress",
  "awaiting_review",
  "invoice_sent",
  "overdue",
] as const;

/*
  Nullable fields are a deliberate design decision, not laziness.

  A brief that never mentions an hourly rate should produce `hourly_rate: null`
  and say so in the confidence note. The alternative — letting the model pick a
  plausible-looking number — produces a record that is confidently wrong, and
  the user has no way to tell which figures were read and which were invented.
  For a tool whose entire job is transcription, inventing data is the worst
  possible failure.
*/
export const CoreExtractionSchema = z.object({
  project_name: z
    .string()
    .describe("Short descriptive name for the project, in title case."),
  client: z
    .string()
    .nullable()
    .describe("The client or company commissioning the work. Null if absent."),
  hourly_rate: z
    .number()
    .nullable()
    .describe("Hourly rate as a plain number, in whatever currency the brief uses, never converted. Null if not stated."),
  hours_logged: z
    .number()
    .nullable()
    .describe("Hours worked so far as a number. Null if not stated."),
  deadline: z
    .string()
    .nullable()
    .describe("Deadline as an ISO calendar date, YYYY-MM-DD. Null if absent."),
  status: z
    .enum(PROJECT_STATUSES)
    .describe("Current project state inferred from the brief."),
  confidence_note: z
    .string()
    .describe(
      "One sentence naming anything missing, ambiguous, or inferred rather than stated.",
    ),
});

export type CoreExtraction = z.infer<typeof CoreExtractionSchema>;

/** Which code path produced an extraction. Reported, never hidden. */
export type ExtractorKind = "model" | "heuristic";

export type ExtractionResult = {
  fields: CoreExtraction;
  extractor: ExtractorKind;
  /** Populated when the model was attempted and failed, so the UI can explain itself. */
  fallbackReason?: string;
};

/**
 * The schema asks for an ISO date but can't enforce a real one, and the result
 * card can't render anything else. A deadline that isn't one is reported as
 * not found, the same as a brief that never gave a date.
 */
export function withRealDeadline(fields: CoreExtraction): CoreExtraction {
  if (fields.deadline === null || isRealCalendarDate(fields.deadline)) return fields;
  return { ...fields, deadline: null };
}

/** Value of an extracted project. Mirrors projectValue() for the dashboard. */
export function extractionValue(fields: CoreExtraction): number | null {
  if (fields.hourly_rate === null || fields.hours_logged === null) return null;
  return fields.hourly_rate * fields.hours_logged;
}
