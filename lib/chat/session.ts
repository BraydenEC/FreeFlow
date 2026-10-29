/*
  Session logic for /chat: what a conversation was, and what gets stored.

  The server never trusts the browser's copy of a conversation. It receives
  only what the user typed and replays it through the same deterministic
  engine, so the transcript, the rules that fired and the outcome are
  computed here, the same way on both sides.

  "Feedback or complaint" skips matching (the spec's step 4): those turns are
  the user's words only, and the route accepts them only when filed as a
  ticket (SessionRequestSchema).
*/

import { answer } from "./engine";
import { redact } from "./redact";
import {
  MAX_MESSAGE_CHARS,
  MAX_MESSAGES,
  type Area,
  type Category,
  type EngineReply,
  type Outcome,
  type Rating,
  type Turn,
} from "./types";

export function replay(category: Category, area: Area, userTexts: string[]): Turn[] {
  const turns: Turn[] = [];
  for (const raw of userTexts) {
    turns.push({ role: "user", text: redact(raw).text });
    if (category === "feedback") continue;
    const reply = answer({ category, area, text: raw });
    turns.push({ role: "bot", text: reply.answer, ruleId: reply.ruleId, kind: reply.kind });
  }
  return turns;
}

/** Most serious wins: ticket > no_match > guardrail > answered. */
export function outcomeFor(turns: Turn[], ticketFiled: boolean): Outcome {
  if (ticketFiled) return "ticket";
  const kinds = turns.filter((t) => t.role === "bot").map((t) => t.kind);
  if (kinds.includes("no_match")) return "no_match";
  if (kinds.includes("guardrail") && !kinds.includes("rule")) return "guardrail";
  return "answered";
}

export function needsTranscript(outcome: Outcome, ratings: Rating[]): boolean {
  return outcome !== "answered" || ratings.some((r) => !r.up);
}

/** A conversation that already became a ticket is frozen. */
export function canWrite(existing: { ticket_status: string | null } | null): boolean {
  return !existing || existing.ticket_status === null;
}

/**
 * The summary's opening line: the user's first message, redacted. Redaction
 * can make text longer ("password:a" → "password:[removed]"), so it is cut
 * back to the column's limit rather than failing the whole save.
 */
export function firstMessage(turns: Turn[]): string {
  return (turns.find((t) => t.role === "user")?.text ?? "").slice(0, MAX_MESSAGE_CHARS);
}

/** The ticket is offered inline after a no-match, a guard, or a thumbs-down. */
export function shouldOfferTicket(reply: EngineReply, rating: boolean | undefined): boolean {
  return reply.offerTicket || rating === false;
}

/** Filing a ticket adds no message, so a conversation at the cap can still file one. */
export function canSendMore(messageCount: number): boolean {
  return messageCount < MAX_MESSAGES;
}
