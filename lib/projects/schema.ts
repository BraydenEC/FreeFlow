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

/*
  A real calendar date, not merely a parseable one.

  The obvious check — Number.isNaN(new Date(`${d}T00:00:00Z`).getTime()) — is
  what this used to do, and it is wrong. JavaScript rolls impossible dates
  over rather than rejecting them: "2026-02-31" becomes 3 March and reports
  itself as perfectly valid. A deadline silently moved three days is exactly
  the kind of quiet wrong answer this project has tried to avoid everywhere
  else, and it had been accepting them since the form was written.

  Round-tripping catches it. If any component comes back different from what
  went in, the date did not exist.
*/
export function isRealCalendarDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/*
  Links are checked for a scheme rather than run through a URL validator.
  The two that land here are a contract and a Stripe payment page, and the
  failure worth catching is a pasted "www.stripe.com/..." that renders as a
  relative path and silently 404s inside the app. Requiring http(s) catches
  that; anything stricter would reject working links for no benefit.
*/
const HTTP_URL = /^https?:\/\/\S+$/i;

/** An optional link: absent, empty, or a real absolute URL. */
const optionalUrl = z
  .union([z.literal(""), z.string().trim().max(500).regex(HTTP_URL, "Must start with http:// or https://")])
  .optional();

const nonNegative = z.coerce
  .number()
  .refine(Number.isFinite, "Must be a number")
  .min(0, "Cannot be negative");

export const NewProjectSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120),
    client: z.string().trim().min(1, "Client is required").max(120),
    status: z.enum([
      "contracted",
      "in_progress",
      "awaiting_review",
      "invoice_sent",
      "overdue",
    ]),
    deadline: z
      .string()
      .regex(ISO_DATE, "Deadline must be YYYY-MM-DD")
      .refine(isRealCalendarDate, "Not a real date"),
    billing: z.enum(["hourly", "fixed"]),
    hours_logged: nonNegative.max(9999.99).default(0),
    hourly_rate: nonNegative.max(999999.99).default(0),
    invoice_total: z.union([z.literal(""), nonNegative.max(99999999.99)]).optional(),
    contract_signed_on: z
      .union([
        z.literal(""),
        z
          .string()
          .regex(ISO_DATE, "Contract date must be YYYY-MM-DD")
          .refine(isRealCalendarDate, "Not a real date"),
      ])
      .optional(),
    contract_url: optionalUrl,
    payment_url: optionalUrl,
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

/** Empty string means "not provided" from a form; the column wants null. */
function orNull(v: string | undefined): string | null {
  return v === undefined || v === "" ? null : v;
}

/*
  The row an EDIT writes.

  Deliberately not toRow(). toRow sets is_paid false and paid_at null, because
  a new project has not been paid — correct on insert and destructive on
  update. Reusing it to edit a paid project would silently un-pay it and take
  the money back out of This Month's Earnings, which is the kind of quiet
  wrong answer this project keeps testing for. Payment state is owned by the
  mark-paid route and this mapping never touches it.
*/
export function toUpdateRow(p: NewProject) {
  const { is_paid, paid_at, ...editable } = toRow(p);
  void is_paid;
  void paid_at;
  return editable;
}

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
    contract_signed_on: orNull(p.contract_signed_on),
    contract_url: orNull(p.contract_url),
    payment_url: orNull(p.payment_url),
  };
}
