"use client";

import Link from "next/link";
import { useState } from "react";
import { answer } from "@/lib/chat/engine";
import { redact } from "@/lib/chat/redact";
import {
  AREAS,
  AREA_LABELS,
  CATEGORIES,
  CATEGORY_LABELS,
  MAX_MESSAGE_CHARS,
  type Area,
  type Category,
  type EngineReply,
} from "@/lib/chat/types";

/*
  The /chat guided conversation (mockup option A).

  Three intake questions as bot messages: the first two are tap buttons, the
  third is typed. Answers come from the rule engine running right here in the
  browser, so they are instant and cost nothing; the server replays the same
  messages through the same engine when it saves, rather than trusting this
  copy.

  Saving happens after every answer, every rating change, and when a ticket
  is filed. "Feedback or complaint" has no answer step: it goes straight to
  the ticket preview. Filing a ticket ends the conversation; anything after
  that is a new conversation with a new id.
*/

type Step = "category" | "area" | "describe" | "chat" | "preview" | "filed";

type Bubble =
  | { role: "user"; text: string }
  | { role: "bot"; text: string; reply?: EngineReply };

const GREETING = "Hi, I'm FreeFlow's automated guide. What do you need help with?";
const NOTICE =
  "Conversations are saved so FreeFlow's owner can fix problems. Don't paste passwords or card numbers.";
const FILED = "Filed. The owner reads every ticket and will email you.";

const DESCRIBE_PROMPT: Record<Category, string> = {
  broken: "In a sentence, what happened?",
  how_to: "In a sentence, what are you trying to do?",
  pricing_technical: "What's your question?",
  feedback: "Tell me what happened, or what you'd like to see. I'll file it for the owner.",
};

function newId(): string {
  return crypto.randomUUID();
}

export default function ChatWindow({ userEmail }: { userEmail: string }) {
  const [sessionId, setSessionId] = useState(newId);
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<Category | null>(null);
  const [area, setArea] = useState<Area | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([{ role: "bot", text: GREETING }]);
  const [messages, setMessages] = useState<string[]>([]);
  // Keyed by bubble index, so the same rule answering twice is rated twice.
  const [ratings, setRatings] = useState<Record<number, boolean>>({});
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; signIn?: boolean } | null>(null);

  const answered = bubbles.some((b) => b.role === "bot" && b.reply);
  const offerInline = (() => {
    const last = [...bubbles].reverse().find((b) => b.role === "bot" && "reply" in b && b.reply);
    return last && last.role === "bot" ? Boolean(last.reply?.offerTicket) : false;
  })();

  function ratingList(source: Record<number, boolean>, list: Bubble[]) {
    return Object.entries(source).flatMap(([i, up]) => {
      const b = list[Number(i)];
      return b && b.role === "bot" && b.reply?.ruleId ? [{ ruleId: b.reply.ruleId, up }] : [];
    });
  }

  async function save(opts: {
    msgs: string[];
    list: Bubble[];
    rated: Record<number, boolean>;
    fileTicket: boolean;
  }): Promise<boolean> {
    if (!category || !area || opts.msgs.length === 0) return false;
    try {
      const res = await fetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sessionId,
          category,
          area,
          messages: opts.msgs,
          ratings: ratingList(opts.rated, opts.list),
          fileTicket: opts.fileTicket,
        }),
      });
      if (res.ok) return true;
      if (res.status === 401) {
        setNotice({ text: "Your session expired. Sign in again.", signIn: true });
      } else if (res.status === 409) {
        setNotice({ text: "This conversation already has a ticket." });
      } else {
        setNotice({ text: "Couldn't save this conversation. Your answers still work." });
      }
    } catch {
      setNotice({ text: "Couldn't save this conversation. Your answers still work." });
    }
    return false;
  }

  function pickCategory(c: Category) {
    setCategory(c);
    setBubbles((b) => [
      ...b,
      { role: "user", text: CATEGORY_LABELS[c] },
      { role: "bot", text: "Which part of FreeFlow?" },
    ]);
    setStep("area");
  }

  function pickArea(a: Area) {
    setArea(a);
    setBubbles((b) => [
      ...b,
      { role: "user", text: AREA_LABELS[a] },
      { role: "bot", text: DESCRIBE_PROMPT[category ?? "broken"] },
    ]);
    setStep("describe");
  }

  function send() {
    const raw = draft.trim();
    if (!raw || !category || !area || busy) return;
    setDraft("");
    const shown = redact(raw).text;
    const msgs = [...messages, raw];
    setMessages(msgs);

    if (category === "feedback") {
      setBubbles((b) => [...b, { role: "user", text: shown }]);
      setStep("preview");
      return;
    }

    const reply = answer({ category, area, text: raw });
    const list: Bubble[] = [
      ...bubbles,
      { role: "user", text: shown },
      { role: "bot", text: reply.answer, reply },
    ];
    setBubbles(list);
    setStep("chat");
    void save({ msgs, list, rated: ratings, fileTicket: false });
  }

  function rate(index: number, up: boolean) {
    const rated = { ...ratings, [index]: up };
    setRatings(rated);
    void save({ msgs: messages, list: bubbles, rated, fileTicket: false });
  }

  async function fileTicket() {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    const ok = await save({ msgs: messages, list: bubbles, rated: ratings, fileTicket: true });
    setBusy(false);
    if (ok) setStep("filed");
  }

  function restart() {
    setSessionId(newId());
    setStep("category");
    setCategory(null);
    setArea(null);
    setBubbles([{ role: "bot", text: GREETING }]);
    setMessages([]);
    setRatings({});
    setDraft("");
    setNotice(null);
  }

  const chip =
    "border-hairline text-ink hover:border-ink-faint rounded-full border px-3 py-2 text-sm transition-colors";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <ol className="space-y-3" aria-live="polite">
        {bubbles.map((b, i) =>
          b.role === "user" ? (
            <li key={i} className="flex justify-end">
              <p className="bg-ink text-app max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm break-words">
                {b.text}
              </p>
            </li>
          ) : (
            <li key={i} className="flex">
              <div className="border-hairline bg-raised max-w-[85%] rounded-2xl rounded-bl-sm border px-4 py-3 text-sm leading-relaxed break-words">
                <p className="text-ink">{b.text}</p>
                {b.reply && b.reply.links.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {b.reply.links.map((l) => (
                      <Link key={l.href} href={l.href} className="text-accent-soft underline underline-offset-2">
                        {l.label}
                      </Link>
                    ))}
                  </p>
                )}
                {b.reply && (
                  <p className="text-ink-faint mt-2 text-[11px]">
                    {b.reply.ruleId ? `Answer from rule: ${b.reply.ruleId}` : "No rule matched"}
                  </p>
                )}
                {b.reply?.ruleId && step !== "filed" && (
                  <div className="text-ink-muted mt-2 flex items-center gap-2 text-xs">
                    <span>Did this help?</span>
                    {[true, false].map((up) => (
                      <button
                        key={String(up)}
                        type="button"
                        onClick={() => rate(i, up)}
                        aria-pressed={ratings[i] === up}
                        aria-label={up ? "Helpful" : "Not helpful"}
                        className={`rounded-lg border px-2.5 py-1 ${
                          ratings[i] === up ? "border-ink bg-ink text-app" : "border-hairline"
                        }`}
                      >
                        {up ? "👍" : "👎"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ),
        )}
      </ol>

      {step === "category" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" className={chip} onClick={() => pickCategory(c)}>
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      )}

      {step === "area" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <button key={a} type="button" className={chip} onClick={() => pickArea(a)}>
              {AREA_LABELS[a]}
            </button>
          ))}
        </div>
      )}

      {step === "preview" && (
        <section className="border-hairline bg-surface mt-4 rounded-xl border p-4 text-sm">
          <h2 className="text-ink font-semibold">Submit a ticket</h2>
          <p className="text-ink-muted mt-1">
            This conversation goes to FreeFlow&apos;s owner, with anything secret already removed.
          </p>
          <p className="text-ink-muted mt-2">
            Will be sent from <span className="text-ink">{userEmail || "your account email"}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fileTicket}
              disabled={busy}
              className="bg-ink text-app rounded-lg px-3 py-2 font-medium disabled:opacity-60"
            >
              {busy ? "Sending…" : "Submit ticket"}
            </button>
            {category !== "feedback" && (
              <button
                type="button"
                onClick={() => setStep("chat")}
                className="border-hairline text-ink rounded-lg border px-3 py-2"
              >
                Keep chatting
              </button>
            )}
          </div>
        </section>
      )}

      {step === "filed" && (
        <section className="border-hairline bg-surface mt-4 rounded-xl border p-4 text-sm">
          <p className="text-ink">{FILED}</p>
          <button
            type="button"
            onClick={restart}
            className="border-hairline text-ink mt-3 rounded-lg border px-3 py-2"
          >
            Start a new conversation
          </button>
        </section>
      )}

      {(step === "describe" || step === "chat") && (
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          {answered && (
            <button
              type="button"
              onClick={() => setStep("preview")}
              className={`mb-3 rounded-lg border px-3 py-2 text-sm ${
                offerInline ? "border-ink text-ink" : "border-hairline text-ink-muted"
              }`}
            >
              Still stuck? Submit a ticket
            </button>
          )}
          <div className="flex gap-2">
            <label htmlFor="chat-input" className="sr-only">
              Your message
            </label>
            <input
              id="chat-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_MESSAGE_CHARS))}
              maxLength={MAX_MESSAGE_CHARS}
              placeholder={step === "describe" ? "Type your answer…" : "Type a follow-up…"}
              autoComplete="off"
              className="border-hairline bg-surface text-ink min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="bg-ink text-app rounded-xl px-4 text-sm font-medium disabled:opacity-40"
            >
              Send
            </button>
          </div>
          {draft.length > MAX_MESSAGE_CHARS - 200 && (
            <p className="text-ink-faint mt-1 text-right text-xs">
              {draft.length} / {MAX_MESSAGE_CHARS}
            </p>
          )}
        </form>
      )}

      {notice && (
        <p className="text-ink-muted mt-3 text-sm" role="status">
          {notice.text}{" "}
          {notice.signIn && (
            <Link href="/login" className="text-accent-soft underline underline-offset-2">
              Sign in
            </Link>
          )}
        </p>
      )}

      <p className="text-ink-muted mt-6 text-xs">{NOTICE}</p>
    </div>
  );
}
