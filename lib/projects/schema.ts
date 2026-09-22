import { z } from "zod";

/*
  The shape of a new project, as the form submits it and the API validates it.

  Mirrors the CHECK constraints in supabase/schema.sql so a bad payload is
  refused with a readable message before the database refuses it with an
  opaque one. Two billing models, one nullable column, exactly as the table:

    hourly — hours × rate, invoice_total null
    fixed  — invoice_total set; hours and rate may still be logged

  Money and hours are coerced from strings because that is what a form sends.
  Coercion is bounded: nothing negative, nothing non-finite, and a fixed fee
  must be positive — a $0 project is a mistake, not a plan.
*/

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const nonNegative = z.coerce
  .number()
  .refine(Number.isFinite, "Must be a number")
  .min(0, "Cannot be negative");

export const NewProjectSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120),
    client: z.string().trim().min(1, "Client is required").max(120),
    status: z.enum(["in_progress", "awaiting_review", "invoice_sent", "overdue"]),
    deadline: z
      .string()
      .regex(ISO_DATE, "Deadline must be YYYY-MM-DD")
      .refine((d) => !Number.isNaN(new Date(`${d}T00:00:00Z`).getTime()), "Not a real date"),
    billing: z.enum(["hourly", "fixed"]),
    hours_logged: nonNegative.max(9999.99).default(0),
    hourly_rate: nonNegative.max(999999.99).default(0),
    invoice_total: z.union([z.literal(""), nonNegative.max(99999999.99)]).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.billing === "fixed") {
      if (v.invoice_total === "" || v.invoice_total === undefined || v.invoice_total <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["invoice_total"],
          message: "A fixed-fee project needs a total above 0",
        });
      }
    } else if (v.hourly_rate <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["hourly_rate"],
        message: "An hourly project needs a rate above 0",
      });
    }
  });

export type NewProjectInput = z.input<typeof NewProjectSchema>;
export type NewProject = z.output<typeof NewProjectSchema>;

/** The row the API inserts. One place decides how billing maps to columns. */
export function toRow(p: NewProject) {
  return {
    name: p.name,
    client: p.client,
    status: p.status,
    deadline: p.deadline,
    hours_logged: p.hours_logged,
    hourly_rate: p.hourly_rate,
    invoice_total: p.billing === "fixed" ? p.invoice_total : null,
    is_paid: false,
    paid_at: null,
  };
}
