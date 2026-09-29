"use client";

import { useState, useSyncExternalStore } from "react";
import type { ContentSet, SocialPost, VideoScript } from "@/lib/marketing/types";
import { pickHeadlineWinner, headlineTests } from "@/lib/marketing/ab";
import { toCsv } from "@/lib/export/csv";
import * as abStore from "@/lib/marketing/ab-store";
import ProvenanceBadge from "./ProvenanceBadge";

/*
  The interactive half of /marketing.

  Content lives in state because "Generate live" replaces it with model output.
  Everything else — copy, export, the A/B choice, save — operates on whatever
  content is currently shown, seed or model, so the page behaves identically
  whether or not the key is configured. The A/B choice reads through
  useSyncExternalStore (localStorage) rather than an effect, matching the prefs
  store, so hydration never mismatches.
*/

type SaveState = "idle" | "saving" | "saved" | "error";

export default function MarketingWorkbench({
  initialContent,
  modelConfigured,
  signedIn,
}: {
  initialContent: ContentSet;
  modelConfigured: boolean;
  signedIn: boolean;
}) {
  const [content, setContent] = useState<ContentSet>(initialContent);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const choices = useSyncExternalStore(
    abStore.subscribe,
    abStore.getSnapshot,
    abStore.getServerSnapshot,
  );

  async function generate() {
    setGenError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/marketing/generate", { method: "POST" });
      if (!res.ok) {
        setGenError("Generation failed — showing the current campaign.");
        return;
      }
      const next = (await res.json()) as ContentSet;
      setContent(next);
    } catch {
      setGenError("Network error — showing the current campaign.");
    } finally {
      setGenerating(false);
    }
  }

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
    } catch {
      // Clipboard blocked (insecure context, denied permission). Silent — the
      // text is still on screen to select by hand.
    }
  }

  function exportCsv() {
    const headers = ["kind", "id", "channel/title", "hook", "body", "cta"];
    const rows: (string | number | null)[][] = [
      ...content.posts.map((p) => ["post", p.id, p.channel, p.hook, p.body, p.cta]),
      ...content.scripts.map((s) => [
        "script",
        s.id,
        s.title,
        s.hook,
        s.body,
        s.cta,
      ]),
    ];
    const csv = toCsv(headers, rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "freeflow-marketing.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* ── Content band ─────────────────────────────────────────────── */}
      <section id="band-content" className="scroll-mt-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="page-title text-base">Content</h2>
            <ProvenanceBadge provenance={content.provenance} />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={generate}
              disabled={generating || !modelConfigured}
              title={
                modelConfigured
                  ? "Generate a fresh campaign with claude-opus-5"
                  : "No model key configured on this deployment — seed copy is shown"
              }
              className="bg-accent focus-visible:ring-accent rounded-lg px-3.5 py-2 text-sm font-semibold text-app transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
            >
              {generating ? "Generating…" : "Generate live"}
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="border-hairline text-ink-muted hover:text-ink hover:border-ink-faint focus-visible:ring-accent rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              Export CSV
            </button>
          </div>
        </div>
        {genError && (
          <p role="alert" className="text-status-overdue mt-2 text-xs">
            {genError}
          </p>
        )}
        {!modelConfigured && (
          <p className="text-ink-faint mt-2 text-xs">
            Showing built-in seed copy. With a model key set, “Generate live”
            writes a fresh campaign and labels it AI-generated.
          </p>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              provenance={content.provenance}
              copied={copiedId === p.id}
              onCopy={() => copy(p.id, `${p.hook}\n\n${p.body}\n\n${p.cta}`)}
              onSave={signedIn ? () => saveAsset("post", p, content.provenance) : null}
            />
          ))}
        </div>

        <h3 className="text-ink-muted mt-8 text-[11px] tracking-[0.14em] uppercase">
          Video scripts
        </h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {content.scripts.map((s) => (
            <ScriptCard
              key={s.id}
              script={s}
              provenance={content.provenance}
              copied={copiedId === s.id}
              onCopy={() => copy(s.id, `${s.title}\n\n${s.hook}\n\n${s.body}\n\n${s.cta}`)}
              onSave={signedIn ? () => saveAsset("script", s, content.provenance) : null}
            />
          ))}
        </div>
      </section>

      {/* ── Calendar band ────────────────────────────────────────────── */}
      <section id="band-calendar" className="scroll-mt-20">
        <h2 className="page-title text-base">14-day calendar</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {content.calendar.map((slot) => (
            <div
              key={slot.day}
              className="border-hairline bg-surface rounded-lg border p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-ink text-sm font-semibold">Day {slot.day}</span>
                <span className="text-ink-faint text-[10px] tracking-wider uppercase">
                  {slot.channel}
                </span>
              </div>
              <p className="text-ink-muted mt-2 text-xs leading-snug">{slot.theme}</p>
              <p className="text-ink-faint mt-1 text-[10px]">{slot.assetRef || "—"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── A/B band ─────────────────────────────────────────────────── */}
      <section id="band-ab" className="scroll-mt-20">
        <h2 className="page-title text-base">A/B headline test</h2>
        <p className="text-ink-muted mt-2 max-w-2xl text-sm">
          Pick the headline that wins each test. The choice is saved in this
          browser; “Save winner” records it to your account.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {headlineTests(content.headlines).map((test) => {
            const variants = content.headlines.filter((h) => h.test === test);
            const winner = pickHeadlineWinner(content.headlines, test, choices[test]);
            return (
              <div
                key={test}
                className="border-hairline bg-surface rounded-xl border p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-ink-faint text-[11px] tracking-[0.14em] uppercase">
                    Test: {test}
                  </span>
                  {signedIn && winner && (
                    <SaveWinnerButton
                      test={test}
                      winnerText={winner.text}
                      provenance={content.provenance}
                    />
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  {variants.map((v) => {
                    const isWinner = winner?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => abStore.setChoice(test, v.id)}
                        aria-pressed={isWinner}
                        className={`focus-visible:ring-accent block w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                          isWinner
                            ? "border-accent bg-accent/10 text-ink"
                            : "border-hairline text-ink-muted hover:text-ink hover:border-ink-faint"
                        }`}
                      >
                        <span className="text-ink-faint mr-2 text-[10px] tracking-wider uppercase">
                          {isWinner ? "winner" : "pick"}
                        </span>
                        {v.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

// ── Cards ───────────────────────────────────────────────────────────────

function PostCard({
  post,
  provenance,
  copied,
  onCopy,
  onSave,
}: {
  post: SocialPost;
  provenance: ContentSet["provenance"];
  copied: boolean;
  onCopy: () => void;
  onSave: (() => void) | null;
}) {
  return (
    <article className="border-hairline bg-surface flex flex-col rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <span className="text-ink-faint text-[11px] tracking-[0.14em] uppercase">
          {post.channel}
        </span>
        <ProvenanceBadge provenance={provenance} />
      </div>
      <p className="text-ink mt-3 text-sm font-semibold leading-snug">{post.hook}</p>
      <p className="text-ink-muted mt-2 flex-1 text-sm leading-relaxed">{post.body}</p>
      <p className="text-ink-faint mt-3 text-xs">{post.cta}</p>
      <CardActions copied={copied} onCopy={onCopy} onSave={onSave} />
    </article>
  );
}

function ScriptCard({
  script,
  provenance,
  copied,
  onCopy,
  onSave,
}: {
  script: VideoScript;
  provenance: ContentSet["provenance"];
  copied: boolean;
  onCopy: () => void;
  onSave: (() => void) | null;
}) {
  return (
    <article className="border-hairline bg-surface flex flex-col rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <span className="text-ink text-sm font-semibold">{script.title}</span>
        <span className="text-ink-faint text-[11px]">{script.durationSec}s</span>
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <ScriptLine label="Hook" value={script.hook} />
        <ScriptLine label="Body" value={script.body} />
        <ScriptLine label="CTA" value={script.cta} />
      </dl>
      <div className="mt-3 flex items-center justify-between">
        <ProvenanceBadge provenance={provenance} />
      </div>
      <CardActions copied={copied} onCopy={onCopy} onSave={onSave} />
    </article>
  );
}

function ScriptLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-faint text-[10px] tracking-wider uppercase">{label}</dt>
      <dd className="text-ink-muted leading-relaxed">{value}</dd>
    </div>
  );
}

function CardActions({
  copied,
  onCopy,
  onSave,
}: {
  copied: boolean;
  onCopy: () => void;
  onSave: (() => void) | null;
}) {
  return (
    <div className="border-hairline mt-4 flex items-center gap-2 border-t pt-3">
      <button
        type="button"
        onClick={onCopy}
        className="text-ink-muted hover:text-ink focus-visible:ring-accent rounded text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      {onSave && (
        <>
          <span className="text-ink-faint">·</span>
          <SaveButton onSave={onSave} />
        </>
      )}
    </div>
  );
}

function SaveButton({ onSave }: { onSave: () => void }) {
  const [state, setState] = useState<SaveState>("idle");
  return (
    <button
      type="button"
      onClick={async () => {
        setState("saving");
        try {
          await onSave();
          setState("saved");
        } catch {
          setState("error");
        }
      }}
      disabled={state === "saving"}
      className="text-ink-muted hover:text-ink focus-visible:ring-accent rounded text-xs font-medium transition-colors disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
    >
      {state === "saved" ? "Saved" : state === "error" ? "Retry" : state === "saving" ? "Saving…" : "Save"}
    </button>
  );
}

function SaveWinnerButton({
  test,
  winnerText,
  provenance,
}: {
  test: string;
  winnerText: string;
  provenance: ContentSet["provenance"];
}) {
  const [state, setState] = useState<SaveState>("idle");
  return (
    <button
      type="button"
      onClick={async () => {
        setState("saving");
        try {
          await saveAsset("headline", { test, text: winnerText }, provenance);
          setState("saved");
        } catch {
          setState("error");
        }
      }}
      disabled={state === "saving"}
      className="text-ink-muted hover:text-ink focus-visible:ring-accent rounded text-xs font-medium transition-colors disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
    >
      {state === "saved" ? "Saved" : state === "error" ? "Retry" : state === "saving" ? "Saving…" : "Save winner"}
    </button>
  );
}

// ── Save ────────────────────────────────────────────────────────────────

async function saveAsset(
  kind: "post" | "script" | "headline",
  content: Record<string, unknown>,
  provenance: ContentSet["provenance"],
): Promise<void> {
  const res = await fetch("/api/marketing/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, extractor: provenance, content }),
  });
  if (!res.ok) throw new Error("save failed");
}
