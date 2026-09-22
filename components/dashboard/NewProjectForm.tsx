"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import type { NewProjectInput } from "@/lib/projects/schema";

/*
  Add a project from the dashboard.

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
  { value: "in_progress", label: "In progress" },
  { value: "awaiting_review", label: "Awaiting review" },
  { value: "invoice_sent", label: "Invoice sent" },
  { value: "overdue", label: "Overdue" },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

const blank = (): NewProjectInput => ({
  name: "",
  client: "",
  status: "in_progress",
  deadline: todayIso(),
  billing: "fixed",
  hours_logged: "" as unknown as number,
  hourly_rate: "" as unknown as number,
  invoice_total: "",
});

export default function NewProjectForm({
  defaultOpen = false,
}: {
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  const [form, setForm] = useState<NewProjectInput>(blank);
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
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await res.json()) as { error?: string; field?: string | null };
      if (!res.ok) {
        setError({ message: json.error ?? "Could not save.", field: json.field ?? null });
        return;
      }
      setForm(blank());
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
        className="border-hairline text-ink-muted hover:text-ink hover:border-ink-faint focus-visible:ring-accent rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        + New project
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
          New project
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

      {error && error.field === null && (
        <p role="alert" className="text-status-overdue mt-4 text-sm">{error.message}</p>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={busy}
          className="bg-accent text-app focus-visible:ring-accent rounded-lg px-4 py-2 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
        >
          {busy ? "Saving…" : "Add project"}
        </button>
      </div>
    </form>
  );
}
