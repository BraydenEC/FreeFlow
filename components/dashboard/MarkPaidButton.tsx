"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Records a payment against one project.

  Deliberately not a confirmation dialog. Marking something paid is a small,
  common, correctable action, and a freelancer reconciling a morning's
  payments should not have to dismiss six modals. What it does show is the
  failure — quietly reverting to an idle button on a server error would be the
  worst outcome, because the number it feeds is the month's earnings.

  router.refresh() re-runs the Server Component that computed the metrics, so
  the summary cards and the row update together from one source rather than
  the row moving while the total above it lags.
*/
export default function MarkPaidButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markPaid() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/paid`, {
        method: "POST",
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setError(json.error ?? "Could not update.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={markPaid}
        disabled={busy}
        className="border-hairline text-ink-muted hover:text-ink hover:border-ink-faint focus-visible:ring-accent rounded-md border px-2.5 py-1 text-xs whitespace-nowrap transition-colors disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
      >
        {busy ? "Saving…" : "Mark paid"}
      </button>
      {error && (
        <span role="alert" className="text-status-overdue text-[11px]">
          {error}
        </span>
      )}
    </div>
  );
}
