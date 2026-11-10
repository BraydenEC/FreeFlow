"use client";

import { useId, useState } from "react";
import { COPY } from "@/lib/funnel/copy";

/*
  "Get notified when the lifetime version launches": the optional launch list.

  Consent is a required checkbox with exact wording; the address is used for
  nothing else. Signing up twice is a success ("already on the list"). With no
  database the route answers 503 and this says it couldn't save, without
  breaking the page. Never states a price.
*/

type State = "idle" | "sending" | "saved" | "already" | "invalid" | "failed";

const MESSAGES: Record<Exclude<State, "idle" | "sending">, string> = {
  saved: "You're on the list. One email, when it launches.",
  already: "You're already on the list.",
  invalid: "Please check your email address.",
  failed: "Couldn't save right now. Please try again later.",
};

export default function LaunchListForm({ source }: { source: "morning" | "game_end" | "footer" }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<State>("idle");
  const id = useId();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/launch-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent: true, source }),
      });
      const body = (await res.json().catch(() => ({}))) as { saved?: boolean; already?: boolean };
      if (res.ok && body.saved) setState(body.already ? "already" : "saved");
      else setState(res.status === 400 ? "invalid" : "failed");
    } catch {
      setState("failed");
    }
  }

  const done = state === "saved" || state === "already";

  return (
    <form onSubmit={submit} className="border-hairline bg-surface max-w-md rounded-xl border p-4" aria-describedby={`${id}-msg`}>
      <p className="text-sm font-semibold">{COPY.launchListCta}</p>
      {!done && (
        <>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label htmlFor={`${id}-email`} className="sr-only">
              Email
            </label>
            <input
              id={`${id}-email`}
              type="email"
              required
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="border-hairline focus-visible:ring-ink min-w-0 flex-1 rounded-lg border bg-black px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            />
            <button
              type="submit"
              disabled={!consent || state === "sending"}
              className="border-hairline focus-visible:ring-ink rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
            >
              {state === "sending" ? "Saving…" : "Notify me"}
            </button>
          </div>
          <label className="text-ink-muted mt-3 flex items-start gap-2 text-xs leading-relaxed">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 accent-[var(--job)]"
            />
            <span>Email me when the lifetime version launches. Nothing else.</span>
          </label>
        </>
      )}
      <p id={`${id}-msg`} role="status" className="text-ink-muted mt-2 min-h-4 text-xs">
        {state !== "idle" && state !== "sending" ? MESSAGES[state] : ""}
      </p>
    </form>
  );
}
