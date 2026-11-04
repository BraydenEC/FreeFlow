/*
  The /chat rule engine. Pure and deterministic, so the browser can answer
  instantly and the server can replay a conversation to compute what was said
  instead of trusting the client's copy.

  Order for every message:
    1. redact     anything secret is removed; if something was, guard-secret
    2. guards     the things the assistant must never do (guards.ts)
    3. match      the best content rule for this category and area
    4. no match   an honest "no answer yet", with a ticket offered

  Scoring: 1 point per keyword present as a word (plural -s/-es allowed), 2 if
  the rule marks it strong, 3 per phrase present. The best score must reach MIN_SCORE. Ties go to the
  narrower rule (fewer categories plus areas), then to the earlier one in the
  file, so moving a rule up is how to prefer it.

  Matching runs in widening passes, and the first to find a rule answers:
    a. exact      the whole message is "hi" or "thanks"
    b. in scope   rules for the category and area the user chose
    c. any scope  every rule, but needing OUT_OF_SCOPE_MIN, because someone who
                  picked the wrong button still asked a real question
    d. generic    troubleshooting and area overviews, in scope, so they never
                  outrank a specific answer
*/

import { GUARD_RULES } from "./guards";
import { redact } from "./redact";
import { CONTENT_RULES } from "./rules";
import { AREAS, CATEGORIES, type Area, type Category, type EngineReply, type Rule } from "./types";

const MIN_SCORE = 2;
const OUT_OF_SCOPE_MIN = 4;

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
    if (words.has(k) || words.has(`${k}s`) || words.has(`${k}es`)) s += rule.strong?.includes(k) ? 2 : 1;
  }
  for (const p of rule.phrases ?? []) {
    if (padded.includes(` ${p} `)) s += 3;
  }
  return s;
}

function bestRule(rules: Rule[], words: Set<string>, padded: string, min: number): Rule | null {
  let best: { rule: Rule; score: number } | null = null;
  for (const rule of rules) {
    const s = score(rule, words, padded);
    if (s < min) continue;
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
  return best?.rule ?? null;
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
  const specific = CONTENT_RULES.filter((r) => !r.generic);
  const rule =
    CONTENT_RULES.find((r) => r.exact?.includes(norm)) ??
    bestRule(
      specific.filter((r) => inScope(r.categories, input.category) && inScope(r.areas, input.area)),
      words,
      padded,
      MIN_SCORE,
    ) ??
    bestRule(specific, words, padded, OUT_OF_SCOPE_MIN) ??
    bestRule(
      CONTENT_RULES.filter((r) => r.generic && inScope(r.categories, input.category) && inScope(r.areas, input.area)),
      words,
      padded,
      MIN_SCORE,
    );

  if (rule) {
    return {
      kind: "rule",
      ruleId: rule.id,
      answer: rule.answer,
      links: rule.links ?? [],
      offerTicket: rule.offerTicket ?? false,
    };
  }

  return { kind: "no_match", ruleId: null, answer: NO_MATCH_ANSWER, links: [], offerTicket: true };
}
