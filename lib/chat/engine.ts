/*
  The /chat rule engine. Pure and deterministic, so the browser can answer
  instantly and the server can replay a conversation to compute what was said
  instead of trusting the client's copy.

  Order for every message:
    1. redact     anything secret is removed; if something was, guard-secret
    2. guards     the things the assistant must never do (guards.ts)
    3. match      the best content rule for this category and area
    4. no match   an honest "no answer yet", with a ticket offered

  Scoring: 1 point per keyword present as a word (plural -s/-es allowed),
  3 per phrase present. The best score must reach MIN_SCORE. Ties go to the
  narrower rule (fewer categories plus areas), then to the earlier one in the
  file, so moving a rule up is how to prefer it.
*/

import { GUARD_RULES } from "./guards";
import { redact } from "./redact";
import { CONTENT_RULES } from "./rules";
import { AREAS, CATEGORIES, type Area, type Category, type EngineReply, type Rule } from "./types";

const MIN_SCORE = 2;

export const NO_MATCH_ANSWER =
  "I don't have an answer for that yet. You can submit a ticket and the owner will look at it.";

export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9$]+/g, " ")
    .trim();
}

function width(scope: readonly string[] | "any", all: readonly string[]): number {
  return scope === "any" ? all.length : scope.length;
}

function inScope<T extends string>(scope: T[] | "any", value: T): boolean {
  return scope === "any" || scope.includes(value);
}

function score(rule: Rule, words: Set<string>, padded: string): number {
  let s = 0;
  for (const k of rule.keywords) {
    if (words.has(k) || words.has(`${k}s`) || words.has(`${k}es`)) s += 1;
  }
  for (const p of rule.phrases ?? []) {
    if (padded.includes(` ${p} `)) s += 3;
  }
  return s;
}

export function answer(input: { category: Category; area: Area; text: string }): EngineReply {
  const { text: clean, redacted } = redact(input.text);
  const norm = normalize(clean);

  const guard = redacted
    ? GUARD_RULES.find((g) => g.id === "guard-secret")
    : GUARD_RULES.find((g) => g.triggers.some((t) => t.test(norm)));
  if (guard) {
    return {
      kind: "guardrail",
      ruleId: guard.id,
      answer: guard.answer,
      links: guard.links ?? [],
      offerTicket: guard.id !== "guard-off-topic",
    };
  }

  const words = new Set(norm.split(" ").filter(Boolean));
  const padded = ` ${norm} `;
  let best: { rule: Rule; score: number } | null = null;
  for (const rule of CONTENT_RULES) {
    if (!inScope(rule.categories, input.category) || !inScope(rule.areas, input.area)) continue;
    const s = score(rule, words, padded);
    if (s < MIN_SCORE) continue;
    if (
      !best ||
      s > best.score ||
      (s === best.score &&
        width(rule.categories, CATEGORIES) + width(rule.areas, AREAS) <
          width(best.rule.categories, CATEGORIES) + width(best.rule.areas, AREAS))
    ) {
      best = { rule, score: s };
    }
  }

  if (best) {
    return {
      kind: "rule",
      ruleId: best.rule.id,
      answer: best.rule.answer,
      links: best.rule.links ?? [],
      offerTicket: best.rule.offerTicket ?? false,
    };
  }

  return { kind: "no_match", ruleId: null, answer: NO_MATCH_ANSWER, links: [], offerTicket: true };
}
