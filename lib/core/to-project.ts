import { PROJECT_STATUSES } from "@/lib/core/schema";
import type { NewProjectInput } from "@/lib/projects/schema";

/*
  A brief's fields, as the project form's starting values.

  What the brief did not say stays blank so the form's own validation asks for
  it: a guessed client or deadline would be a project that looks read from the
  brief but wasn't. A stated budget means a fixed fee, filled in (H5); a rate
  alone means hourly work; with neither the form opens on its usual fixed fee.
  A stated company client (persona moral, SA de CV, LLC) sets the tax type,
  so withholding isn't skipped silently.

  The H5 fields are optional: extractions saved before them still map.
*/

export type ExtractedFields = {
  project_name: string;
  client: string | null;
  hourly_rate: number | null;
  hours_logged: number | null;
  fixed_total?: number | null;
  currency?: string | null;
  client_type?: "company" | "individual" | null;
  deadline: string | null;
  status: string;
};

type Status = (typeof PROJECT_STATUSES)[number];

export function extractionToProject(f: ExtractedFields): NewProjectInput {
  const fixed = f.fixed_total ?? null;
  return {
    name: f.project_name,
    client: f.client ?? "",
    status: PROJECT_STATUSES.includes(f.status as Status) ? (f.status as Status) : "in_progress",
    deadline: f.deadline ?? "",
    billing: fixed !== null || f.hourly_rate === null ? "fixed" : "hourly",
    hours_logged: (f.hours_logged ?? "") as unknown as number,
    hourly_rate: (f.hourly_rate ?? "") as unknown as number,
    invoice_total: (fixed ?? "") as unknown as number,
    contract_signed_on: "",
    contract_url: "",
    payment_url: "",
    client_tax_type:
      f.client_type === "company" ? "persona_moral" : f.client_type === "individual" ? "persona_fisica" : "",
    payment_terms_days: "",
  };
}
