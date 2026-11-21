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
  // H5: every user tester's brief stated a flat budget, and all of them came
  // back as "rate not found". A fixed total is read, never computed.
  fixed_total: z
    .number()
    .nullable()
    .describe("A flat budget or fixed fee for the whole job as a plain number, in the brief's own currency, never converted. Null if the brief gives only an hourly rate or no amount."),
  currency: z
    .string()
    .nullable()
    .describe("ISO 4217 code (USD, MXN, EUR…) of the brief's money, only when stated by code, name (pesos, dollars) or an unambiguous symbol (€, £). A bare $ is null."),
  client_type: z
    .enum(["company", "individual"])
    .nullable()
    .describe("company when the client says it is one (persona moral, SA de CV, S. de R.L., LLC, Inc); individual for persona física. Null if not stated."),
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

/** Value of an extracted project. Mirrors projectValue() for the dashboard: a fixed total wins. */
export function extractionValue(fields: CoreExtraction): number | null {
  if (fields.fixed_total !== null && fields.fixed_total !== undefined) return fields.fixed_total;
  if (fields.hourly_rate === null || fields.hours_logged === null) return null;
  return fields.hourly_rate * fields.hours_logged;
}

/*
  M9: model notes said things like "status was inferred as in_progress" and
  "hours_logged is null". The prompt now asks for plain words; this catches
  any that slip through, at display time.
*/
const PLAIN: [RegExp, string][] = [
  [/\bproject_name\b/g, "project name"],
  [/\bhourly_rate\b/g, "hourly rate"],
  [/\bhours_logged\b/g, "hours worked"],
  [/\bfixed_total\b/g, "budget"],
  [/\bclient_type\b/g, "client type"],
  [/\bconfidence_note\b/g, "note"],
  [/\bin_progress\b/g, "in progress"],
  [/\bawaiting_review\b/g, "awaiting review"],
  [/\binvoice_sent\b/g, "invoice sent"],
  [/\bis null\b/g, "wasn't found"],
  [/\b(?:was|is) set to null\b/g, "was left empty"],
  [/\bnull\b/g, "empty"],
];

export function plainNote(note: string): string {
  return PLAIN.reduce((s, [re, word]) => s.replace(re, word), note);
}
