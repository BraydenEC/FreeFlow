"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import SignInToSave from "@/components/auth/SignInToSave";
import { useSession } from "@/components/auth/SessionProvider";
import SourceBadge from "@/components/research/SourceBadge";
import type { ResearchExtraction, ExtractorKind } from "@/lib/research/schema";
import { CATEGORY_LABEL } from "@/types/research";
import type { Confidence, PlayerCategory } from "@/types/research";

/*
  Research intake — paste a note, get a structured record, save it.

  The extractor badge and the confidence badge are both shown before the save
  button, deliberately. The user should know which code path produced the
  record and how much weight it claims *before* committing it to the database,
  not after.
*/

type Result = {
  fields: ResearchExtraction;
  extractor: ExtractorKind;
  fallbackReason?: string;
};

const EXAMPLE =
  "gigstack automates CFDI 4.0 invoicing from payment events and reconciles daily against SAT, but states it does not include project management or time tracking. https://gigstack.pro/";

export default function ResearchIntake() {
  const user = useSession();
  /*
    router.refresh() re-runs the Server Component that reads research_records,
    so a saved record appears in the list below without a manual page reload.

    This was a real bug, reported as "it only saves the most recent record".
    The saves were persisting correctly the whole time and the list simply
    never re-rendered — so from the outside, saving looked like it silently
    failed. A save that works but shows nothing is indistinguishable from a
    save that does not work, which is the same lesson as the invisible
    fallbacks in Weeks 0 and 1: the user can only judge what the interface
    shows them.
  */
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [note, setNote] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function extract() {
    setBusy(true);
    setError(null);
    setSaved(false);
    setResult(null);
    try {
      const res = await fetch("/api/research/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.issues?.join(" ") ?? data.error ?? "Extraction failed.");
        return;
      }
      setResult(data);
    } catch {
      setError("Could not reach the extractor. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!result) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/research/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_input: note,
          ...result.fields,
          extractor: result.extractor,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.issues?.join(" ") ?? data.error ?? "Save failed.");
        return;
      }
      setSaved(true);
      // Pull the new record into the list below immediately.
      startRefresh(() => router.refresh());
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  const disabled = busy || note.trim().length === 0;

  return (
    <section aria-labelledby="intake-heading" className="space-y-4">
      <div>
        <h2 id="intake-heading" className="text-lg font-semibold">
          Research intake
        </h2>
        <p className="text-ink-muted mt-1 text-sm">
          Paste a note about a competitor, price, regulation, or behaviour. It
          is structured into a record and judged for confidence — including a
          URL check, since an invented citation is the worst thing this tool
          could produce.
        </p>
      </div>

      <div className="border-hairline bg-surface space-y-4 rounded-xl border p-5 sm:p-6">
        <div>
          <label htmlFor="research-note" className="sr-only">
            Research note
          </label>
          <textarea
            id="research-note"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={EXAMPLE}
            className="border-hairline bg-raised/40 text-ink placeholder:text-ink-faint focus-visible:ring-accent w-full resize-y rounded-lg border px-3.5 py-3 text-sm leading-relaxed focus-visible:ring-2 focus-visible:outline-none"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={extract}
              disabled={disabled}
              className="bg-accent focus-visible:ring-accent rounded-lg px-4 py-2 text-sm font-medium text-app transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
            >
              {busy ? "Structuring…" : "Structure note"}
            </button>
            <button
              type="button"
              onClick={() => setNote(EXAMPLE)}
              className="text-ink-faint hover:text-ink-muted focus-visible:ring-accent rounded text-xs underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
            >
              use the example
            </button>
            <span className="text-ink-faint ml-auto text-xs">
              {note.length}/8000
            </span>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-rose-400/10 px-3.5 py-2.5 text-sm text-rose-300 ring-1 ring-rose-400/20 ring-inset"
          >
            {error}
          </p>
        )}

        {result && (
          <div className="border-hairline bg-raised/30 space-y-3 rounded-lg border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{result.fields.title}</p>
                <p className="text-ink-faint text-xs">
                  {CATEGORY_LABEL[result.fields.category as PlayerCategory] ??
                    result.fields.category}{" "}
                  · {result.fields.region === "mexico" ? "Mexico" : "Global"}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${
                  result.extractor === "model"
                    ? "bg-indigo-400/10 text-indigo-300 ring-indigo-400/20"
                    : "bg-amber-400/10 text-amber-300 ring-amber-400/20"
                }`}
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${result.extractor === "model" ? "bg-indigo-400" : "bg-amber-400"}`}
                />
                {result.extractor === "model" ? "Claude" : "Pattern matching"}
              </span>
            </div>

            <p className="text-ink-muted text-sm leading-relaxed">
              {result.fields.summary}
            </p>

            <SourceBadge
              confidence={result.fields.confidence as Confidence}
              sourceUrl={result.fields.source_url}
              verifiedOn={null}
            />

            {result.fallbackReason && (
              <p className="text-ink-faint text-xs">
                Fell back to pattern matching: {result.fallbackReason}
              </p>
            )}

            <div className="border-hairline flex items-center gap-3 border-t pt-3">
              {user ? (
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || saved}
                  className="bg-accent/10 text-accent-soft hover:bg-accent/15 focus-visible:ring-accent rounded-lg px-3.5 py-2 text-xs font-medium transition-colors disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
                >
                  {saved ? "Saved ✓" : saving ? "Saving…" : "Save record"}
                </button>
              ) : (
                <SignInToSave />
              )}
              {saved && (
                <span className="text-ink-faint text-xs">
                  {isRefreshing
                    ? "Updating the list…"
                    : "Added to the list below."}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
