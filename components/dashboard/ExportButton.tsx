"use client";

import { useState } from "react";

/*
  Downloads the project list as CSV.

  A plain anchor would be simpler, but a failed download through an anchor is
  invisible — the browser either saves a file or silently does nothing, and
  "nothing happened" is the worst possible feedback on an action somebody is
  about to rely on for their taxes. Fetching first means a refusal can be read
  and shown.
*/
export default function ExportButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/projects/export");
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setError(json.error ?? "Could not export.");
        return;
      }

      // Take the server's filename rather than rebuilding it here, so the two
      // cannot drift.
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = /filename="([^"]+)"/.exec(disposition);
      const filename = match?.[1] ?? "freeflow-projects.csv";

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="border-hairline text-ink-muted hover:text-ink hover:border-ink-faint focus-visible:ring-accent rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
      >
        {busy ? "Preparing…" : "Export CSV"}
      </button>
      {error && (
        <span role="alert" className="text-status-overdue text-xs">
          {error}
        </span>
      )}
    </span>
  );
}
