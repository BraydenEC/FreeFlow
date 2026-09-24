"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import type { NewProjectInput } from "@/lib/projects/schema";
import type { Project } from "@/types/project";

/*
  Create or correct a project.

  Collapsed behind one button so the default view stays compact; the empty
  state opens it. Validation happens on the server (lib/projects/schema.ts)
  and the first error comes back with the field it belongs to, so the form
  never duplicates the rules — it only displays the verdict.

  On success: router.refresh() re-runs the Server Component that fetched the
  projects, so the new row appears without a client-side cache to keep.

  Fixed fee is the default, and is listed first. The Week 2 validation
  interviewee: "I sell 1 time install shit so not a retainer model and it's
  always priced per job too." The hourly path stays, because the excluded
  segment work assumes it exists, but it is no longer what the form opens on.
*/

const STATUS_OPTIONS: { value: NewProjectInput["status"]; label: string }[] = [
  { value: "contracted", label: "Contract signed" },
  { value: "in_progress", label: "In progress" },
  { value: "awaiting_review", label: "Awaiting review" },
  { value: "invoice_sent", label: "Invoice sent" },
  { value: "overdue", label: "Overdue" },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

const blank = (): NewProjectInput => ({
  name: "",
  client: "",
  status: "contracted",
  deadline: todayIso(),
  billing: "fixed",
  hours_logged: "" as unknown as number,
  hourly_rate: "" as unknown as number,
  invoice_total: "",
  contract_signed_on: todayIso(),
  contract_url: "",
  payment_url: "",
  client_tax_type: "",
  payment_terms_days: "",
});

/* An existing row, back into the shape the form edits. Billing model is
   inferred the same way the table infers it: a fixed fee is the presence of
   invoiceTotal, and its absence means hourly. */
function fromProject(p: Project): NewProjectInput {
  return {
    name: p.name,
    client: p.client,
    status: p.status,
    deadline: p.deadline,
    billing: p.invoiceTotal === null ? "hourly" : "fixed",
    hours_logged: p.hoursLogged as unknown as number,
    hourly_rate: p.hourlyRate as unknown as number,
    invoice_total: (p.invoiceTotal ?? "") as unknown as number,
    contract_signed_on: p.contractSignedOn ?? "",
    contract_url: p.contractUrl ?? "",
    payment_url: p.paymentUrl ?? "",
    client_tax_type: p.clientTaxType ?? "",
    payment_terms_days: (p.paymentTermsDays ?? "") as unknown as number,
  };
}

export default function ProjectForm({
  defaultOpen = false,
  project,
}: {
  defaultOpen?: boolean;
  /** Present for an edit, absent for a create. */
  project?: Project;
}) {
  const editing = project !== undefined;
  const router = useRouter();
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  const [form, setForm] = useState<NewProjectInput>(() =>
    project ? fromProject(project) : blank(),
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<{ message: string; field: string | null } | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof NewProjectInput>(key: K, value: NewProjectInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(
        editing ? `/api/projects/${project.id}` : "/api/projects",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const json = (await res.json()) as { error?: string; field?: string | null };
      if (!res.ok) {
        setError({ message: json.error ?? "Could not save.", field: json.field ?? null });
        return;
      }
      // Only a create clears the fields. After an edit the form closes and
      // the row it edited is the record of what happened.
      if (!editing) setForm(blank());
      setOpen(false);
      router.refresh();
    } catch {
      setError({ message: "Network error — try again.", field: null });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!editing) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setError({ message: json.error ?? "Could not delete.", field: null });
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError({ message: "Network error — try again.", field: null });
    } finally {
      setBusy(false);
    }
  }

  const input =
    "bg-raised border-hairline text-ink placeholder:text-ink-faint focus-visible:ring-accent w-full rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none";
  const label = "text-ink-muted text-xs";
  const err = (field: string) =>
    error?.field === field ? (
      <span className="text-status-overdue text-xs">{error.message}</span>
    ) : null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          editing
            ? "border-hairline text-ink-muted hover:text-ink hover:border-ink-faint focus-visible:ring-accent rounded-md border px-2.5 py-1 text-xs whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none"
            : "border-hairline text-ink-muted hover:text-ink hover:border-ink-faint focus-visible:ring-accent rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        }
      >
        {editing ? "Edit" : "+ New project"}
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-labelledby={`${id}-title`}
      className="border-hairline bg-surface rounded-xl border p-5 sm:p-6"
      noValidate
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 id={`${id}-title`} className="text-[15px] font-semibold">
          {editing ? "Edit project" : "New project"}
        </h3>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="text-ink-faint hover:text-ink text-xs"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={label}>Project name</span>
          <input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} required maxLength={120} />
          {err("name")}
        </label>
        <label className="flex flex-col gap-1">
          <span className={label}>Client</span>
          <input className={input} value={form.client} onChange={(e) => set("client", e.target.value)} required maxLength={120} />
          {err("client")}
        </label>
        <label className="flex flex-col gap-1">
          <span className={label}>Status</span>
          <select className={input} value={form.status} onChange={(e) => set("status", e.target.value as NewProjectInput["status"])}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={label}>Deadline</span>
          <input type="date" className={input} value={form.deadline} onChange={(e) => set("deadline", e.target.value)} required />
          {err("deadline")}
        </label>

        <fieldset className="flex flex-col gap-2 sm:col-span-2">
          <legend className={label}>Billing</legend>
          <div className="flex gap-4 text-sm" role="radiogroup">
            {(["fixed", "hourly"] as const).map((b) => (
              <label key={b} className="flex items-center gap-1.5">
                <input type="radio" name={`${id}-billing`} checked={form.billing === b} onChange={() => set("billing", b)} />
                {b === "hourly" ? "Hourly" : "Fixed fee"}
              </label>
            ))}
          </div>
        </fieldset>

        {form.billing === "hourly" ? (
          <>
            <label className="flex flex-col gap-1">
              <span className={label}>Hours logged</span>
              <input type="number" inputMode="decimal" min={0} step="0.25" className={input} value={String(form.hours_logged ?? "")} onChange={(e) => set("hours_logged", e.target.value as unknown as number)} />
              {err("hours_logged")}
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>Hourly rate (USD)</span>
              <input type="number" inputMode="decimal" min={0} step="0.01" className={input} value={String(form.hourly_rate ?? "")} onChange={(e) => set("hourly_rate", e.target.value as unknown as number)} />
              {err("hourly_rate")}
            </label>
          </>
        ) : (
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className={label}>Fixed total (USD)</span>
            <input type="number" inputMode="decimal" min={0} step="0.01" className={input} value={String(form.invoice_total ?? "")} onChange={(e) => set("invoice_total", e.target.value as unknown as number)} />
            {err("invoice_total")}
          </label>
        )}
      </div>

      <div className="border-hairline mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={label}>Contract signed</span>
          <input
            type="date"
            className={input}
            value={form.contract_signed_on ?? ""}
            onChange={(e) => set("contract_signed_on", e.target.value)}
          />
          {err("contract_signed_on")}
        </label>
        <label className="flex flex-col gap-1">
          <span className={label}>Contract link</span>
          <input
            type="url"
            inputMode="url"
            placeholder="https://…"
            className={input}
            value={form.contract_url ?? ""}
            onChange={(e) => set("contract_url", e.target.value)}
          />
          {err("contract_url")}
        </label>
        <label className="flex flex-col gap-1">
          <span className={label}>Payment terms</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={365}
            placeholder="Account default"
            className={input}
            value={String(form.payment_terms_days ?? "")}
            onChange={(e) =>
              set("payment_terms_days", e.target.value as unknown as number)
            }
          />
          <span className="text-ink-faint text-[11px]">
            Days after the deadline this client pays. Blank uses your default.
          </span>
          {err("payment_terms_days")}
        </label>
        <label className="flex flex-col gap-1">
          <span className={label}>Client is a…</span>
          <select
            className={input}
            value={form.client_tax_type ?? ""}
            onChange={(e) =>
              set("client_tax_type", e.target.value as NewProjectInput["client_tax_type"])
            }
          >
            <option value="">Not recorded</option>
            <option value="persona_fisica">Persona física</option>
            <option value="persona_moral">Persona moral (company)</option>
          </select>
          <span className="text-ink-faint text-[11px]">
            A persona moral withholds IVA and ISR before paying.
          </span>
          {err("client_tax_type")}
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className={label}>Stripe invoice or payment link</span>
          <input
            type="url"
            inputMode="url"
            placeholder="https://…"
            className={input}
            value={form.payment_url ?? ""}
            onChange={(e) => set("payment_url", e.target.value)}
          />
          {err("payment_url")}
        </label>
      </div>

      {error && error.field === null && (
        <p role="alert" className="text-status-overdue mt-4 text-sm">{error.message}</p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {/*
          Delete asks twice, unlike Mark paid which asks not at all. The
          difference is recoverability: a payment recorded in error can be
          corrected, a deleted project is gone and there is no undo. So the
          destructive action states what it will destroy, by name, before it
          will do it.
        */}
        {editing ? (
          confirmingDelete ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-status-overdue text-xs">
                Delete &ldquo;{project.name}&rdquo; permanently?
              </span>
              <button
                type="button"
                onClick={onDelete}
                disabled={busy}
                className="border-status-overdue text-status-overdue rounded-md border px-2.5 py-1 text-xs disabled:opacity-40"
              >
                {busy ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-ink-faint hover:text-ink text-xs"
              >
                Keep it
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-ink-faint hover:text-status-overdue text-xs transition-colors"
            >
              Delete project
            </button>
          )
        ) : (
          <span />
        )}

        <button
          type="submit"
          disabled={busy}
          className="bg-accent text-app focus-visible:ring-accent rounded-lg px-4 py-2 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
        >
          {busy ? "Saving…" : editing ? "Save changes" : "Add project"}
        </button>
      </div>
    </form>
  );
}
