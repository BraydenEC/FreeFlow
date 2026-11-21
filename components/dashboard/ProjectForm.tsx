"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { usePrefs } from "@/components/prefs/PrefsProvider";
import { localToday, paidDateChanged } from "@/lib/projects/payment";
import { blankProject, projectErrors, type FieldError, type NewProjectInput } from "@/lib/projects/schema";
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
  interviewee: "I sell 1 time install [jobs] so not a retainer model and it's
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

const blank = () => blankProject();

// Fields under "More details" on a new project (H7: the form opened on 12).
const EXTRA_FIELDS = ["status", "contract_signed_on", "contract_url", "payment_terms_days", "client_tax_type", "payment_url"];

// A half-filled new project survives a reload (M8). Per tab, never synced.
const DRAFT_KEY = "freeflow:new-project";

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
  prefill,
  createLabel = "+ New project",
  primary = false,
  onCreated,
  onClose,
}: {
  defaultOpen?: boolean;
  /** Present for an edit, absent for a create. An edit always starts open. */
  project?: Project;
  /** Starting values for a create, such as a project read from a brief. */
  prefill?: NewProjectInput;
  /** The closed button's text for a create. */
  createLabel?: string;
  /** Style the closed button as the page's main action. */
  primary?: boolean;
  onCreated?: () => void;
  /** Called when an edit finishes, so EditProject can take the form away. */
  onClose?: () => void;
}) {
  const editing = project !== undefined;
  const { prefs } = usePrefs();
  const router = useRouter();
  const id = useId();
  const [open, setOpen] = useState(editing || defaultOpen);
  const [form, setForm] = useState<NewProjectInput>(() =>
    project ? fromProject(project) : (prefill ?? blank()),
  );
  // Payment isn't part of the PATCH body (that route never touches it), so
  // Paid on is kept apart and saved through the paid route. Shown only once a
  // project is paid: an unpaid project has no date to correct.
  const [paidOn, setPaidOn] = useState(project?.paidAt ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<{ message: string; field: string | null } | null>(null);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [busy, setBusy] = useState(false);
  const [more, setMore] = useState(editing);
  const formRef = useRef<HTMLFormElement>(null);
  const [baseline, setBaseline] = useState(form);
  const focusOnOpen = useRef(editing);
  const usesDraft = !editing && !prefill;

  function close() {
    setOpen(false);
    onClose?.();
  }

  function openForm() {
    focusOnOpen.current = true;
    setOpen(true);
  }

  const focusField = (field: string) =>
    setTimeout(() => {
      const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${field}"]`);
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 0);

  // H7/M13: every problem at once, and the cursor on the first.
  function showErrors(list: FieldError[]) {
    setErrors(list);
    if (list.some((e) => EXTRA_FIELDS.includes(e.field))) setMore(true);
    if (list[0]) focusField(list[0].field);
  }

  // M13: opening the form puts the cursor in it, not on the page body.
  useEffect(() => {
    if (open && focusOnOpen.current) {
      focusOnOpen.current = false;
      focusField("name");
    }
  }, [open]);

  // M7: "+ New project" near the top of a phone screen links to #new-project.
  useEffect(() => {
    if (editing || prefill) return;
    const check = () => {
      if (window.location.hash === "#new-project") openForm();
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [editing, prefill]);

  // M8: restore a half-filled new project.
  useEffect(() => {
    if (!usesDraft) return;
    try {
      const raw = window.sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        // Restoring from storage after hydration, as Roadmap does.
        setForm({ ...blank(), ...(JSON.parse(raw) as Partial<NewProjectInput>) }); // eslint-disable-line react-hooks/set-state-in-effect
        setOpen(true);
      }
    } catch {
      // Blocked or corrupt storage: start blank.
    }
  }, [usesDraft]);

  const dirty = open && JSON.stringify(form) !== JSON.stringify(baseline);

  // M8: keep it as it is typed.
  useEffect(() => {
    if (!usesDraft) return;
    try {
      if (dirty) window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      else window.sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // Storage full or blocked: no draft, the form still works.
    }
  }, [usesDraft, dirty, form]);

  // M8: unsaved changes ask before the page goes away.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function set<K extends keyof NewProjectInput>(key: K, value: NewProjectInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    // A field stops being flagged as soon as it is edited.
    setErrors((list) => list.filter((e) => e.field !== key));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const problems = projectErrors(form);
    if (problems.length > 0) {
      showErrors(problems);
      return;
    }
    setErrors([]);
    setBusy(true);
    try {
      // The paid date first: if it is refused, nothing has been saved yet.
      if (editing && paidDateChanged(project, paidOn)) {
        const paid = await fetch(`/api/projects/${project.id}/paid`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paid_at: paidOn }),
        });
        if (!paid.ok) {
          const json = (await paid.json().catch(() => ({}))) as { error?: string };
          showErrors([{ field: "paid_at", message: json.error ?? "Could not save the paid date." }]);
          return;
        }
      }
      const res = await fetch(
        editing ? `/api/projects/${project.id}` : "/api/projects",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const json = (await res.json()) as { error?: string; errors?: FieldError[] };
      if (!res.ok) {
        if (json.errors?.length) showErrors(json.errors);
        else setError({ message: json.error ?? "Could not save.", field: null });
        return;
      }
      setBaseline(form);
      // Only a create clears the fields. After an edit the form closes and
      // the row it edited is the record of what happened.
      if (!editing) {
        const fresh = prefill ?? blank();
        setBaseline(fresh);
        setForm(fresh);
        setMore(false);
        onCreated?.();
      }
      close();
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
      close();
      router.refresh();
    } catch {
      setError({ message: "Network error — try again.", field: null });
    } finally {
      setBusy(false);
    }
  }

  // 16px text on phones, or iOS zooms into every field it focuses (M7).
  const input =
    "bg-raised border-hairline text-ink placeholder:text-ink-faint focus-visible:ring-accent aria-invalid:border-status-overdue w-full rounded-lg border px-3 py-2 text-base sm:text-sm focus-visible:ring-2 focus-visible:outline-none";
  const label = "text-ink-muted text-xs";
  const bad = (field: string) => errors.some((e) => e.field === field) || undefined;
  const err = (field: string) => {
    const found = errors.find((e) => e.field === field);
    return found ? (
      <span id={`${id}-${field}-error`} className="text-status-overdue text-xs">
        {found.message}
      </span>
    ) : null;
  };

  if (!open) {
    // An edit's button lives in EditProject, so it can stay on the row while
    // the form opens underneath it.
    if (editing) return null;
    return (
      <button
        type="button"
        id={prefill ? undefined : "new-project"}
        onClick={openForm}
        className={
          primary
            ? "bg-accent text-app focus-visible:ring-accent min-h-11 rounded-lg px-4 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none sm:min-h-0"
            : "border-hairline text-ink-muted hover:text-ink hover:border-ink-faint focus-visible:ring-accent min-h-11 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none sm:min-h-0"
        }
      >
        {createLabel}
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      id={editing || prefill ? undefined : "new-project"}
      onSubmit={onSubmit}
      // M13: Escape closes the form, as it does the Settings sheet.
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          setErrors([]);
          close();
        }
      }}
      aria-labelledby={`${id}-title`}
      className="border-hairline bg-surface w-full rounded-xl border p-5 sm:p-6"
      noValidate
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 id={`${id}-title`} className="text-[15px] font-semibold">
          {editing ? "Edit project" : "New project"}
        </h3>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setErrors([]);
            close();
          }}
          className="text-ink-faint hover:text-ink text-xs"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={label}>Project name</span>
          <input data-field="name" aria-invalid={bad("name")} aria-describedby={bad("name") ? `${id}-name-error` : undefined} className={input} value={form.name} onChange={(e) => set("name", e.target.value)} required maxLength={120} />
          {err("name")}
        </label>
        <label className="flex flex-col gap-1">
          <span className={label}>Client</span>
          <input data-field="client" aria-invalid={bad("client")} aria-describedby={bad("client") ? `${id}-client-error` : undefined} className={input} value={form.client} onChange={(e) => set("client", e.target.value)} required maxLength={120} />
          {err("client")}
        </label>
        <label className="flex flex-col gap-1">
          <span className={label}>Deadline</span>
          <input data-field="deadline" aria-invalid={bad("deadline")} aria-describedby={bad("deadline") ? `${id}-deadline-error` : undefined} type="date" className={input} value={form.deadline} onChange={(e) => set("deadline", e.target.value)} required />
          {err("deadline")}
        </label>

        {project?.isPaid && (
          <label className="flex flex-col gap-1">
            <span className={label}>Paid on</span>
            <input
              type="date"
              className={input}
              value={paidOn}
              data-field="paid_at"
              aria-invalid={bad("paid_at")}
              max={localToday()}
              onChange={(e) => setPaidOn(e.target.value)}
            />
            {err("paid_at")}
          </label>
        )}

        <fieldset className="flex flex-col gap-2 sm:col-span-2">
          <legend className={label}>Billing</legend>
          <div className="flex gap-4 text-sm" role="radiogroup">
            {(["fixed", "hourly"] as const).map((b) => (
              <label key={b} className="flex min-h-11 items-center gap-2 sm:min-h-0">
                <input type="radio" className="h-5 w-5 sm:h-4 sm:w-4" name={`${id}-billing`} checked={form.billing === b} onChange={() => set("billing", b)} />
                {b === "hourly" ? "Hourly" : "Fixed fee"}
              </label>
            ))}
          </div>
        </fieldset>

        {form.billing === "hourly" ? (
          <>
            <label className="flex flex-col gap-1">
              <span className={label}>Hours logged</span>
              <input data-field="hours_logged" aria-invalid={bad("hours_logged")} aria-describedby={bad("hours_logged") ? `${id}-hours_logged-error` : undefined} type="number" inputMode="decimal" min={0} step="0.25" className={input} value={String(form.hours_logged ?? "")} onChange={(e) => set("hours_logged", e.target.value as unknown as number)} />
              {err("hours_logged")}
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>Hourly rate ({prefs.currency})</span>
              <input data-field="hourly_rate" aria-invalid={bad("hourly_rate")} aria-describedby={bad("hourly_rate") ? `${id}-hourly_rate-error` : undefined} type="number" inputMode="decimal" min={0} step="0.01" className={input} value={String(form.hourly_rate ?? "")} onChange={(e) => set("hourly_rate", e.target.value as unknown as number)} />
              {err("hourly_rate")}
            </label>
          </>
        ) : (
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className={label}>Fixed total ({prefs.currency})</span>
            <input data-field="invoice_total" aria-invalid={bad("invoice_total")} aria-describedby={bad("invoice_total") ? `${id}-invoice_total-error` : undefined} type="number" inputMode="decimal" min={0} step="0.01" className={input} value={String(form.invoice_total ?? "")} onChange={(e) => set("invoice_total", e.target.value as unknown as number)} />
            {err("invoice_total")}
          </label>
        )}
      </div>

      {!more ? (
        <button
          type="button"
          onClick={() => setMore(true)}
          className="text-ink-muted hover:text-ink mt-4 min-h-11 text-sm underline underline-offset-2 sm:min-h-0"
        >
          More details: status, contract, payment terms, client type
        </button>
      ) : (
      <div className="border-hairline mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={label}>Status</span>
          <select data-field="status" aria-invalid={bad("status")} aria-describedby={bad("status") ? `${id}-status-error` : undefined} className={input} value={form.status} onChange={(e) => set("status", e.target.value as NewProjectInput["status"])}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={label}>Contract signed</span>
          <input data-field="contract_signed_on" aria-invalid={bad("contract_signed_on")} aria-describedby={bad("contract_signed_on") ? `${id}-contract_signed_on-error` : undefined}
            type="date"
            className={input}
            value={form.contract_signed_on ?? ""}
            onChange={(e) => set("contract_signed_on", e.target.value)}
          />
          {err("contract_signed_on")}
        </label>
        <label className="flex flex-col gap-1">
          <span className={label}>Contract link</span>
          <input data-field="contract_url" aria-invalid={bad("contract_url")} aria-describedby={bad("contract_url") ? `${id}-contract_url-error` : undefined}
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
          <input data-field="payment_terms_days" aria-invalid={bad("payment_terms_days")} aria-describedby={bad("payment_terms_days") ? `${id}-payment_terms_days-error` : undefined}
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
          <select data-field="client_tax_type" aria-invalid={bad("client_tax_type")} aria-describedby={bad("client_tax_type") ? `${id}-client_tax_type-error` : undefined}
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
          <input data-field="payment_url" aria-invalid={bad("payment_url")} aria-describedby={bad("payment_url") ? `${id}-payment_url-error` : undefined}
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
      )}

      {error && (
        <p role="alert" className="text-status-overdue mt-4 text-sm">
          {error.message}
        </p>
      )}
      {/* Beside the button that was just pressed, so it is never off-screen (H7). */}
      {errors.length > 0 && (
        <p role="alert" className="text-status-overdue mt-4 text-sm">
          {errors.length === 1 ? "One field needs attention" : `${errors.length} fields need attention`}:{" "}
          {errors.map((e) => e.message).join(". ")}.
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {/*
          Delete asks twice, unlike Mark paid which asks not at all. The
          difference is recoverability: a payment recorded in error is undone
          with Mark unpaid and its date fixed in Paid on, a deleted project is gone and there is no undo. So the
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
              className="text-ink-faint hover:text-status-overdue min-h-11 text-xs transition-colors sm:min-h-0"
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
