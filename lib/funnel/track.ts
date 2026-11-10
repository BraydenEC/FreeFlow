import type { JobId } from "@/lib/funnel/jobs";

/*
  Fire-and-forget funnel events for /demo (POST /api/funnel).

  Anonymous: a random visit id kept in this tab's session storage, so one
  visit's events can be counted together, with no account, cookie or name.
  Never throws and never waits: if storage is blocked the id is per page
  load, and if the request fails nothing happens. The page must work with no
  database at all.
*/

export type FunnelEvent = "try_free_click" | "round_played" | "story_complete" | "night_sorted";

let pageVisitId: string | null = null;

function visitId(): string {
  try {
    const stored = window.sessionStorage.getItem("ff_visit");
    if (stored) return stored;
  } catch {
    // Storage blocked: fall back to one id for this page load.
  }
  pageVisitId ??= crypto.randomUUID();
  try {
    window.sessionStorage.setItem("ff_visit", pageVisitId);
  } catch {
    // Not remembered; fine.
  }
  return pageVisitId;
}

export function track(event: FunnelEvent, job?: JobId): void {
  try {
    void fetch("/api/funnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, job, visitId: visitId() }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Never let tracking break the page.
  }
}
