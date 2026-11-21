"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { answer } from "@/lib/chat/engine";
import { guessIntake } from "@/lib/chat/intake";
import { redact } from "@/lib/chat/redact";
import { canSendMore, shouldOfferTicket } from "@/lib/chat/session";
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
  third is typed. Since user testing (M2) the text box is there from the
  start and the buttons are shortcuts: a question typed straight away gets
  its category and area from its own words (lib/chat/intake.ts). Signed-out
  visitors can ask too; only saving and tickets need an account. The
  conversation survives a reload (sessionStorage, this tab only). Answers come from the rule engine running right here in the
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

const GREETING =
  "Hi, this is FreeFlow's help desk. What do you need help with?";
const NOTICE =
  "Conversations are saved so FreeFlow's owner can fix problems. Don't paste passwords or card numbers.";
const FILED = "Filed. The owner reads every ticket and will email you.";

const DESCRIBE_PROMPT: Record<Category, string> = {
  broken: "In a sentence, what happened?",
  how_to: "In a sentence, what are you trying to do?",
  pricing_technical: "What's your question?",
  feedback:
    "Tell me what happened, or what you'd like to see. I'll file it for the owner.",
};

function newId(): string {
  return crypto.randomUUID();
}

const STORE_KEY = "freeflow:help-desk";

type Stored = {
  sessionId: string;
  step: Step;
  category: Category | null;
  area: Area | null;
  bubbles: Bubble[];
  messages: string[];
  ratings: Record<number, boolean>;
};

export default function ChatWindow({ userEmail, signedIn = true }: { userEmail: string; signedIn?: boolean }) {
  const [sessionId, setSessionId] = useState(newId);
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<Category | null>(null);
  const [area, setArea] = useState<Area | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([
    { role: "bot", text: GREETING },
  ]);
  const [messages, setMessages] = useState<string[]>([]);
  // Keyed by bubble index, so the same rule answering twice is rated twice.
  const [ratings, setRatings] = useState<Record<number, boolean>>({});
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{
    text: string;
    signIn?: boolean;
  } | null>(null);

  // Saves run one at a time, in order, and a response that arrives after the
  // user has moved on (a new conversation, or a filed ticket) is ignored.
  const chain = useRef<Promise<unknown>>(Promise.resolve());
  const current = useRef({ sessionId, filed: false });
  const inputRef = useRef<HTMLInputElement>(null);

  // M2: a reload wiped the conversation. Restore it after hydration.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Stored;
      if (!saved.sessionId || !Array.isArray(saved.bubbles) || saved.step === "filed") return;
      current.current = { sessionId: saved.sessionId, filed: false };
      setSessionId(saved.sessionId); // eslint-disable-line react-hooks/set-state-in-effect
      setStep(saved.step === "preview" ? "chat" : saved.step);
      setCategory(saved.category);
      setArea(saved.area);
      setBubbles(saved.bubbles);
      setMessages(saved.messages ?? []);
      setRatings(saved.ratings ?? {});
    } catch {
      // Corrupt or blocked storage: start fresh.
    }
  }, []);

  useEffect(() => {
    try {
      if (messages.length === 0 || step === "filed") window.sessionStorage.removeItem(STORE_KEY);
      else {
        const data: Stored = { sessionId, step, category, area, bubbles, messages, ratings };
        window.sessionStorage.setItem(STORE_KEY, JSON.stringify(data));
      }
    } catch {
      // Storage full or blocked: the conversation just won't survive a reload.
    }
  }, [sessionId, step, category, area, bubbles, messages, ratings]);

  const answered = bubbles.some((b) => b.role === "bot" && b.reply);
  const lastAnswer = bubbles.reduce<number>(
    (found, b, i) => (b.role === "bot" && b.reply ? i : found),
    -1,
  );
  const lastBubble = lastAnswer >= 0 ? bubbles[lastAnswer] : null;
  const offerInline =
    lastBubble?.role === "bot" && lastBubble.reply
      ? shouldOfferTicket(lastBubble.reply, ratings[lastAnswer])
      : false;
  const atCap = !canSendMore(messages.length);
  const lastBotText =
    [...bubbles].reverse().find((b) => b.role === "bot")?.text ?? "";

  function ratingList(source: Record<number, boolean>, list: Bubble[]) {
    return Object.entries(source).flatMap(([i, up]) => {
      const b = list[Number(i)];
      return b && b.role === "bot" && b.reply?.ruleId
        ? [{ ruleId: b.reply.ruleId, up }]
        : [];
    });
  }

  type SaveOpts = {
    msgs: string[];
    list: Bubble[];
    rated: Record<number, boolean>;
    fileTicket: boolean;
    cat?: Category;
    ar?: Area;
  };

  /** Resolves to the HTTP status, or 0 when nothing was sent or the network failed. */
  function save(opts: SaveOpts): Promise<number> {
    const run = chain.current.then(() => sendSave(opts));
    chain.current = run.catch(() => undefined);
    return run;
  }

  async function sendSave(opts: SaveOpts): Promise<number> {
    const cat = opts.cat ?? category;
    const ar = opts.ar ?? area;
    // Signed out, answers still work; nothing is saved.
    if (!signedIn || !cat || !ar || opts.msgs.length === 0) return 0;
    const sid = sessionId;
    const stale = () =>
      current.current.sessionId !== sid ||
      (current.current.filed && !opts.fileTicket);
    try {
      const res = await fetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sessionId,
          category: cat,
          area: ar,
          messages: opts.msgs,
          ratings: ratingList(opts.rated, opts.list),
          fileTicket: opts.fileTicket,
        }),
      });
      if (res.ok || stale()) return res.status;
      if (res.status === 401) {
        setNotice({
          text: "Your session expired. Sign in again.",
          signIn: true,
        });
      } else if (res.status === 409) {
        setNotice({ text: "This conversation already has a ticket." });
      } else if (res.status === 429) {
        setNotice({ text: "Saving too fast. Wait a moment and try again." });
      } else {
        setNotice({
          text: "Couldn't save this conversation. Your answers still work.",
        });
      }
      return res.status;
    } catch {
      if (!stale()) {
        setNotice({
          text: "Couldn't save this conversation. Your answers still work.",
        });
      }
      return 0;
    }
  }

  function pickCategory(c: Category) {
    setCategory(c);
    setBubbles((b) => [
      ...b,
      { role: "user", text: CATEGORY_LABELS[c] },
      { role: "bot", text: "Which part of FreeFlow?" },
    ]);
    setStep("area");
    inputRef.current?.focus();
  }

  function pickArea(a: Area) {
    setArea(a);
    setBubbles((b) => [
      ...b,
      { role: "user", text: AREA_LABELS[a] },
      { role: "bot", text: DESCRIBE_PROMPT[category ?? "broken"] },
    ]);
    setStep("describe");
    // M13: focus went to the page body after each chip.
    inputRef.current?.focus();
  }

  function send() {
    const raw = draft.trim();
    if (!raw || busy || atCap) return;
    // Typed before choosing: the words choose (M2).
    const guess = guessIntake(raw);
    const cat = category ?? guess.category;
    const ar = area ?? guess.area;
    if (!category) setCategory(cat);
    if (!area) setArea(ar);
    setDraft("");
    const shown = redact(raw).text;
    const msgs = [...messages, raw];
    setMessages(msgs);

    if (cat === "feedback") {
      setBubbles((b) => [...b, { role: "user", text: shown }]);
      setStep("preview");
      return;
    }

    const reply = answer({ category: cat, area: ar, text: raw });
    const list: Bubble[] = [
      ...bubbles,
      { role: "user", text: shown },
      { role: "bot", text: reply.answer, reply },
    ];
    setBubbles(list);
    setStep("chat");
    void save({ msgs, list, rated: ratings, fileTicket: false, cat, ar });
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
    const status = await save({
      msgs: messages,
      list: bubbles,
      rated: ratings,
      fileTicket: true,
    });
    setBusy(false);
    // 409 means a ticket for this conversation is already on file (a lost
    // response, a second tab): either way the user's ticket exists.
    if (status === 200 || status === 409) {
      current.current.filed = true;
      setNotice(null);
      setStep("filed");
    }
  }

  function restart() {
    const id = newId();
    current.current = { sessionId: id, filed: false };
    setSessionId(id);
    setBusy(false);
    setStep("category");
    setCategory(null);
    setArea(null);
    setBubbles([{ role: "bot", text: GREETING }]);
    setMessages([]);
    setRatings({});
    setDraft("");
    setNotice(null);
    try {
      window.sessionStorage.removeItem(STORE_KEY);
    } catch {
      // Nothing stored.
    }
  }

  const chip =
    "border-hairline text-ink hover:border-ink-faint rounded-full border px-3 py-2 text-sm transition-colors";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="sr-only" aria-live="polite">
        {lastBotText}
      </p>
      <ol className="space-y-3">
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
                      <Link
                        key={l.href}
                        href={l.href}
                        className="text-accent-soft underline underline-offset-2"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </p>
                )}
                {b.reply?.ruleId && step !== "filed" && signedIn && (
                  <div className="text-ink-muted mt-2 flex items-center gap-2 text-xs">
                    <span>Did this help?</span>
                    {[true, false].map((up) => (
                      <button
                        key={String(up)}
                        type="button"
                        onClick={() => rate(i, up)}
                        aria-pressed={ratings[i] === up}
                        aria-label={up ? "Helpful" : "Not helpful"}
                        className={`min-h-11 rounded-lg border px-3 py-1 sm:min-h-0 ${
                          ratings[i] === up
                            ? "border-ink bg-ink text-app"
                            : "border-hairline"
                        }`}
                      >
                        {up ? "Yes" : "No"}
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
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Or pick a topic">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={chip}
              onClick={() => pickCategory(c)}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      )}

      {step === "area" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <button
              key={a}
              type="button"
              className={chip}
              onClick={() => pickArea(a)}
            >
              {AREA_LABELS[a]}
            </button>
          ))}
        </div>
      )}

      {step === "preview" && (
        <section className="border-hairline bg-surface mt-4 rounded-xl border p-4 text-sm">
          <h2 className="text-ink font-semibold">Submit a ticket</h2>
          {!signedIn ? (
            <p className="text-ink-muted mt-1">
              Tickets need an account, so the owner can reply.{" "}
              <Link href="/login?next=/chat" className="text-accent-soft underline underline-offset-2">
                Sign in
              </Link>{" "}
              or email <a className="text-ink underline" href="mailto:braydenemeryc@gmail.com">braydenemeryc@gmail.com</a>.
            </p>
          ) : (
          <>
          <p className="text-ink-muted mt-1">
            This conversation goes to FreeFlow&apos;s owner, with anything
            secret already removed.
          </p>
          <p className="text-ink-muted mt-2">
            Will be sent from{" "}
            <span className="text-ink">
              {userEmail || "your account email"}
            </span>
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
            </div>
          </>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {category !== "feedback" && (
              <button
                type="button"
                onClick={() => {
                  setNotice(null);
                  setStep("chat");
                }}
                disabled={busy}
                className="border-hairline text-ink rounded-lg border px-3 py-2 disabled:opacity-60"
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

      {step !== "preview" && step !== "filed" && (
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
                offerInline
                  ? "border-ink text-ink"
                  : "border-hairline text-ink-muted"
              }`}
            >
              Still stuck? Submit a ticket
            </button>
          )}
          {atCap ? (
            <p className="text-ink-muted text-sm">
              This conversation has reached its limit. Submit a ticket, or start
              a new conversation.{" "}
              <button
                type="button"
                onClick={restart}
                className="text-ink underline underline-offset-2"
              >
                Start a new conversation
              </button>
            </p>
          ) : (
            <div className="flex gap-2">
              <label htmlFor="chat-input" className="sr-only">
                Your message
              </label>
              <input
                id="chat-input"
                ref={inputRef}
                value={draft}
                onChange={(e) =>
                  setDraft(e.target.value.slice(0, MAX_MESSAGE_CHARS))
                }
                maxLength={MAX_MESSAGE_CHARS}
                placeholder={
                  step === "category" || step === "area"
                    ? "Type your question…"
                    : step === "describe"
                      ? "Type your answer…"
                      : "Type a follow-up…"
                }
                autoComplete="off"
                className="border-hairline bg-surface text-ink min-h-11 min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-sm"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="bg-ink text-app rounded-xl px-4 text-sm font-medium disabled:opacity-40"
              >
                Send
              </button>
            </div>
          )}
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
            <Link
              href="/login"
              className="text-accent-soft underline underline-offset-2"
            >
              Sign in
            </Link>
          )}
        </p>
      )}

      <p className="text-ink-muted mt-6 text-xs">{NOTICE}</p>
    </div>
  );
}
