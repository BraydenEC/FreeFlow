import { PROJECT_STATUSES } from "@/lib/core/schema";
import type { NewProjectInput } from "@/lib/projects/schema";

/*
  A brief's fields, as the project form's starting values.

  What the brief did not say stays blank so the form's own validation asks for
  it: a guessed client or deadline would be a project that looks read from the
  brief but wasn't. A rate means hourly work, and with no rate the form opens
  on its usual fixed fee, since extraction can't read a fee.
*/

export type ExtractedFields = {
  project_name: string;
  client: string | null;
  hourly_rate: number | null;
  hours_logged: number | null;
  deadline: string | null;
  status: string;
};

type Status = (typeof PROJECT_STATUSES)[number];

export function extractionToProject(f: ExtractedFields): NewProjectInput {
  return {
    name: f.project_name,
    client: f.client ?? "",
    status: PROJECT_STATUSES.includes(f.status as Status) ? (f.status as Status) : "in_progress",
    deadline: f.deadline ?? "",
    billing: f.hourly_rate === null ? "fixed" : "hourly",
    hours_logged: (f.hours_logged ?? "") as unknown as number,
    hourly_rate: (f.hourly_rate ?? "") as unknown as number,
    invoice_total: "",
    contract_signed_on: "",
    contract_url: "",
    payment_url: "",
    client_tax_type: "",
    payment_terms_days: "",
  };
}
