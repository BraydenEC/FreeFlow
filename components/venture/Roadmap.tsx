"use client";

import { useEffect, useState } from "react";
import { ROADMAP, type RoadmapBucket } from "@/lib/venture/roadmap";

/*
  /docs V2 roadmap with upvotes.

  One vote per item per browser: an anonymous key (ff_voter, a random uuid)
  and the items voted for (ff_votes) live in browser storage. That is a courtesy,
  not a security boundary. Storage can be blocked (private windows, previews),
  so every read and write is wrapped and the page works without it; the vote
  then simply isn't remembered. Counts come from the server as props.
*/

const BUCKETS: { id: RoadmapBucket; label: string; note: string }[] = [
  { id: "next", label: "Next", note: "Being worked on soonest." },
  { id: "later", label: "Later", note: "Planned, after the next items." },
  { id: "someday", label: "Someday", note: "Ideas worth keeping." },
];

function readVoted(): string[] {
  try {
    const raw = window.localStorage.getItem("ff_votes");
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveVoted(ids: string[]) {
  try {
    window.localStorage.setItem("ff_votes", JSON.stringify(ids));
  } catch {
    // Storage blocked: the vote still counts, it just isn't remembered here.
  }
}

function voterKey(): string {
  let key: string | null = null;
  try {
    key = window.localStorage.getItem("ff_voter");
  } catch {
    key = null;
  }
  if (key) return key;
  const fresh = crypto.randomUUID();
  try {
    window.localStorage.setItem("ff_voter", fresh);
  } catch {
    // Not remembered: a new key next visit.
  }
  return fresh;
}

type Status = { id: string; text: string } | null;

export default function Roadmap({ votes }: { votes: Record<string, number> | null }) {
  const [voted, setVoted] = useState<string[]>([]);
  const [extra, setExtra] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);

  // Storage is read after mount so the server and first client render agree.
  useEffect(() => {
    const stored = readVoted();
    if (stored.length) setVoted(stored); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  async function vote(id: string) {
    if (voted.includes(id) || busy) return;
    setBusy(id);
    setStatus(null);
    try {
      const res = await fetch("/api/roadmap/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id, voterKey: voterKey() }),
      });
      const body = (await res.json().catch(() => ({}))) as { saved?: boolean; already?: boolean };
      if (res.ok && body.saved) {
        const next = [...voted, id];
        setVoted(next);
        saveVoted(next);
        if (!body.already) setExtra((e) => ({ ...e, [id]: (e[id] ?? 0) + 1 }));
        setStatus({ id, text: body.already ? "You'd already voted for this." : "Thanks, your vote counts." });
      } else {
        setStatus({ id, text: "Couldn't save your vote right now. Please try again later." });
      }
    } catch {
      setStatus({ id, text: "Couldn't save your vote right now. Please try again later." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {BUCKETS.map((b) => (
        <section key={b.id} aria-labelledby={`bucket-${b.id}`} className="flex flex-col gap-3">
          <div>
            <h3 id={`bucket-${b.id}`} className="text-sm font-semibold">
              {b.label}
            </h3>
            <p className="text-ink-faint text-xs">{b.note}</p>
          </div>
          <ul className="flex flex-col gap-2">
            {ROADMAP.filter((r) => r.bucket === b.id).map((r) => {
              const has = voted.includes(r.id);
              const count = votes === null ? null : (votes[r.id] ?? 0) + (extra[r.id] ?? 0);
              return (
                <li key={r.id} className="border-hairline bg-surface flex gap-3 rounded-xl border px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-ink-muted mt-0.5 text-xs leading-relaxed">{r.detail}</p>
                    {status?.id === r.id && (
                      <p role="status" className="text-ink-muted mt-1.5 text-xs">
                        {status.text}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => vote(r.id)}
                    disabled={has || busy === r.id}
                    aria-pressed={has}
                    aria-label={`Upvote ${r.title}${count === null ? "" : `, ${count} votes`}`}
                    className={`focus-visible:ring-accent flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-lg border text-xs focus-visible:ring-2 focus-visible:outline-none ${
                      has ? "border-[var(--color-status-progress)] text-[var(--color-status-progress)]" : "border-hairline text-ink-muted hover:text-ink"
                    }`}
                  >
                    <span aria-hidden>▲</span>
                    <span className="numeric">{count ?? "–"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
