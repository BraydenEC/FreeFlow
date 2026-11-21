"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { localToday } from "@/lib/projects/payment";

/*
  Records a payment against one project, or takes it back.

  Deliberately not a confirmation dialog. Marking something paid is a small,
  common, correctable action, and a freelancer reconciling a morning's
  payments should not have to dismiss six modals. Correctable is the point:
  every user tester (H4) clicked Mark paid and then looked for a way back, so
  a paid row now offers Mark unpaid in the same place. The real paid date is
  set in Edit ("Paid on").

  Mark paid sends the user's own calendar date. The server's UTC date would
  put a payment recorded late on the 31st into next month's earnings.

  What it does show is the failure: quietly reverting to an idle button on a
  server error would be the worst outcome, because the number it feeds is the
  month's earnings. router.refresh() re-runs the Server Component that
  computed the metrics, so the cards and the row update together.
*/
export default function MarkPaidButton({
  projectId,
  isPaid,
}: {
  projectId: string;
  isPaid: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/paid`,
        isPaid
          ? { method: "DELETE" }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paid_at: localToday() }),
            },
      );
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
        onClick={send}
        disabled={busy}
        className="border-hairline text-ink-muted hover:text-ink hover:border-ink-faint focus-visible:ring-accent rounded-md border px-2.5 py-1 text-xs whitespace-nowrap transition-colors disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
      >
        {busy ? "Saving…" : isPaid ? "Mark unpaid" : "Mark paid"}
      </button>
      {error && (
        <span role="alert" className="text-status-overdue text-[11px]">
          {error}
        </span>
      )}
    </div>
  );
}
