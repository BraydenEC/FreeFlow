"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BriefToProject from "@/components/core/BriefToProject";
import ExtractorBadge from "@/components/core/ExtractorBadge";
import { usePrefs } from "@/components/prefs/PrefsProvider";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, formatMonthDay, formatRelativeDeadline } from "@/lib/format";
import { extractionValue, type ExtractionResult } from "@/lib/core/schema";
import { readDraft, writeDraft } from "@/lib/core/draft";
import { CURRENCIES, isCurrencyCode } from "@/lib/currency";

const SAMPLE_BRIEF = `Hi — following up on the redesign we discussed. Need it done by Nov 14. We agreed $85/hr, I've tracked about 22 hours so far.

— Dana, Northwind Co`;

type SaveState = "idle" | "saving" | "saved" | "error";

/** Renders one extracted field, or an explicit "not found" rather than a blank. */
function Field({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | null;
  hint?: string;
}) {
  return (
    <div className="border-hairline flex items-baseline justify-between gap-4 border-b py-3 last:border-b-0">
      <span className="text-ink-muted text-xs tracking-wide uppercase">
        {label}
      </span>
      {value === null ? (
        <span className="text-ink-faint text-sm italic">not found</span>
      ) : (
        <span className="text-right text-sm">
          {value}
          {hint && <span className="text-ink-faint block text-xs">{hint}</span>}
        </span>
      )}
    </div>
  );
}

export default function CoreWorkbench() {
  const router = useRouter();
  const { currency } = usePrefs().prefs;
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedBrief, setSavedBrief] = useState("");
  const [added, setAdded] = useState(false);

  const trimmed = brief.trim();

  // H6/M8: the brief and its result survive a reload until the project is
  // added. Read after mount, so the server render and the first client render
  // agree.
  useEffect(() => {
    const draft = readDraft(window.sessionStorage);
    if (!draft) return;
    setBrief(draft.brief); // eslint-disable-line react-hooks/set-state-in-effect
    if (draft.result) {
      setResult(draft.result);
      setSavedBrief(draft.brief.trim());
    }
  }, []);

  useEffect(() => {
    writeDraft(window.sessionStorage, added ? null : { brief, result });
  }, [brief, result, added]);

  // A result that hasn't become a project yet: ask before leaving the page.
  useEffect(() => {
    if (!result || added) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [result, added]);

  async function handleExtract(event?: React.FormEvent) {
    event?.preventDefault();
    if (!trimmed || extracting) return;

    setExtracting(true);
    setError(null);
    setResult(null);
    setSaveState("idle");
    setAdded(false);

    try {
      const response = await fetch("/api/core/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: trimmed }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Extraction failed.");
        return;
      }

      setResult(payload as ExtractionResult);
      setSavedBrief(trimmed);
    } catch {
      setError("Could not reach the extraction service.");
    } finally {
      setExtracting(false);
    }
  }

  async function handleSave() {
    if (!result || saveState === "saving") return;

    setSaveState("saving");
    setError(null);

    try {
      const response = await fetch("/api/core/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_input: savedBrief,
          extractor: result.extractor,
          fields: result.fields,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? "Save failed.");
        setSaveState("error");
        return;
      }

      setSaveState("saved");
      // Re-render the server component so the new row appears in Recent briefs.
      router.refresh();
    } catch {
      setError("Could not reach the save service.");
      setSaveState("error");
    }
  }

  const fields = result?.fields;
  const value = fields ? extractionValue(fields) : null;
  const now = new Date();
  // Amounts show in the brief's own currency when it names one; never converted.
  const briefCurrency = fields?.currency && isCurrencyCode(fields.currency) ? fields.currency : null;
  const money = briefCurrency ?? currency;
  const currencyClash = fields?.currency && fields.currency !== currency ? fields.currency : null;

  // One way forward (H5): adding the project also keeps the brief in Recent briefs.
  function onAdded() {
    setAdded(true);
    void handleSave();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ---------- Intake ---------- */}
      <form
        onSubmit={handleExtract}
        className="border-hairline bg-surface rounded-xl border p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[15px] font-semibold">
            <span className="text-accent-soft mr-2">1</span>Paste the brief
          </h2>
          <button
            type="button"
            onClick={() => setBrief(SAMPLE_BRIEF)}
            className="text-ink-faint hover:text-ink-muted text-xs underline underline-offset-2"
          >
            use example
          </button>
        </div>

        <label htmlFor="brief" className="sr-only">
          Project brief
        </label>
        <textarea
          id="brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleExtract();
          }}
          rows={9}
          maxLength={8000}
          placeholder="Paste a client email, a message, or notes from a call…"
          className="border-hairline bg-app text-ink placeholder:text-ink-faint focus:border-accent focus:ring-accent/30 mt-4 w-full resize-y rounded-lg border p-3 text-sm focus:ring-2 focus:outline-none"
        />

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={!trimmed || extracting}
            className="bg-accent rounded-lg px-4 py-2.5 text-sm font-semibold text-app transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {extracting ? "Reading…" : "Read the brief"}
          </button>
          {/* A keyboard shortcut means nothing on a phone (M7). */}
          <span className="text-ink-faint hidden text-xs [@media(hover:hover)]:inline">⌘ + Enter</span>
          <span className="text-ink-faint ml-auto text-xs">
            {brief.length}/8000
          </span>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-rose-400/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-rose-400/20 ring-inset"
          >
            {error}
          </p>
        )}
      </form>

      {/* ---------- Output ---------- */}
      <section className="border-hairline bg-surface rounded-xl border p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[15px] font-semibold">
            <span className="text-accent-soft mr-2">2</span>What FreeFlow read
          </h2>
          {result && <ExtractorBadge extractor={result.extractor} />}
        </div>

        {!fields ? (
          <p className="text-ink-faint py-16 text-center text-sm">
            {extracting
              ? "Reading the brief…"
              : "The structured project will appear here."}
          </p>
        ) : (
          <>
            <div className="mt-4">
              <Field label="Project" value={fields.project_name} />
              <Field label="Client" value={fields.client} />
              {fields.fixed_total !== null && (
                <Field label="Budget" value={`${formatCurrency(fields.fixed_total, money)} fixed`} />
              )}
              {(fields.fixed_total === null || fields.hourly_rate !== null) && (
                <Field
                  label="Rate"
                  value={
                    fields.hourly_rate === null
                      ? null
                      : `${formatCurrency(fields.hourly_rate, money)} / hr`
                  }
                />
              )}
              {fields.currency && (
                <Field
                  label="Currency"
                  value={fields.currency}
                  hint={isCurrencyCode(fields.currency) ? CURRENCIES[fields.currency].label : undefined}
                />
              )}
              {fields.client_type && (
                <Field
                  label="Client type"
                  value={fields.client_type === "company" ? "Company" : "Individual"}
                  hint={fields.client_type === "company" ? "Tax withheld if you invoice in Mexico" : undefined}
                />
              )}
              <Field
                label="Hours logged"
                value={
                  fields.hours_logged === null ? null : String(fields.hours_logged)
                }
              />
              <Field
                label="Deadline"
                value={
                  fields.deadline === null
                    ? null
                    : formatMonthDay(fields.deadline)
                }
                hint={
                  fields.deadline
                    ? formatRelativeDeadline(fields.deadline, now)
                    : undefined
                }
              />
              <div className="border-hairline flex items-baseline justify-between gap-4 border-b py-3">
                <span className="text-ink-muted text-xs tracking-wide uppercase">
                  Status
                </span>
                <StatusBadge status={fields.status} />
              </div>
            </div>

            {/* A fixed total is read; rate × hours is calculated, and says so. */}
            <div className="mt-4">
              <p className="text-ink-muted text-xs tracking-wide uppercase">
                Project value
              </p>
              <p className="numeric mt-1 text-2xl font-semibold tracking-tight">
                {value === null ? (
                  <span className="text-ink-faint text-base font-normal italic">
                    add a budget, or a rate and hours
                  </span>
                ) : (
                  formatCurrency(value, money)
                )}
              </p>
              {value !== null && fields.fixed_total === null && (
                <p className="text-ink-faint mt-1 text-xs">
                  {fields.hours_logged}h × {formatCurrency(fields.hourly_rate!, money)}, calculated
                </p>
              )}
              {currencyClash && (
                <p className="mt-2 rounded-lg bg-amber-400/10 px-3 py-2 text-xs text-amber-200 ring-1 ring-amber-400/20 ring-inset">
                  This brief is in {currencyClash}, and your account is in {currency}. FreeFlow doesn&apos;t convert, so
                  check the amount before adding it.
                </p>
              )}
            </div>

            <p className="text-ink-muted border-hairline mt-4 border-t pt-4 text-xs leading-relaxed">
              {fields.confidence_note}
            </p>

            {result?.fallbackReason && (
              <p className="mt-3 rounded-lg bg-amber-400/10 px-3 py-2 text-xs text-amber-200 ring-1 ring-amber-400/20 ring-inset">
                Pattern matching was used: {result.fallbackReason}
              </p>
            )}

            {/* Keyed so a re-run starts from the new result, not the last one. */}
            <BriefToProject
              key={JSON.stringify(fields)}
              fields={fields}
              onCreated={onAdded}
              className="border-hairline mt-5 border-t pt-4"
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => handleExtract()}
                disabled={extracting}
                className="text-ink-faint hover:text-ink text-xs underline underline-offset-2 disabled:opacity-40"
              >
                Read it again
              </button>
              {saveState === "error" && (
                <span className="text-ink-faint text-xs">The project was added; the brief wasn&apos;t kept in Recent briefs.</span>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
