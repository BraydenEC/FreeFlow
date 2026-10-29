/*
  Guardrails for /chat: the things the assistant must never do.

  Each guard is checked before any content rule, against normalised text
  (lower-case, accents stripped, punctuation as spaces; see engine.normalize).
  A guard that fires replaces the answer entirely, so a real question that
  also contains a card number is answered as a secret first.

  guard-secret has no triggers of its own: it fires whenever redaction removed
  something, which keeps one definition of "secret" (lib/chat/redact.ts).

  Off-topic is an explicit list of subjects, never "the message has no FreeFlow
  words". Anything the rules miss must come back as a no-match so a new rule
  can be written for it; a broad off-topic net would swallow exactly those.
*/

import type { GuardRule } from "./types";

export const OFF_TOPIC_TRIGGERS: RegExp[] = [
  /\b(weather|temperature|raining|sunny|snowing)\b/,
  /\b(football|soccer|basketball|baseball|nba|nfl|world cup)\b/,
  /\b(tell me a joke|a joke|jokes)\b/,
  /\b(recipe|recipes|cooking)\b/,
  /\b(homework|my essay)\b/,
  /\b(python|javascript|wordpress|photoshop|minecraft)\b/,
  /\b(girlfriend|boyfriend|dating)\b/,
  /\b(meaning of life|capital of|who won)\b/,
];

export const GUARD_RULES: GuardRule[] = [
  {
    id: "guard-secret",
    triggers: [],
    answer:
      "Please don't share passwords, card numbers or keys here. I've removed it from this conversation, and FreeFlow will never ask you for one. To change your password, use \"Forgot password\" on the sign-in page.",
    links: [{ label: "Reset your password", href: "/forgot-password" }],
  },
  {
    id: "guard-tax-advice",
    triggers: [
      /\b(should|can|do) i\b.*\b(regime|regimen|resico|honorarios|persona fisica|persona moral|actividad empresarial)\b/,
      /\b(switch|change|move|register)\b.*\b(regime|regimen|resico|honorarios)\b/,
      /\bhow much\b.*\b(tax|taxes|isr|iva)\b.*\b(owe|pay)\b/,
      /\b(file|filing)\b.*\b(tax|taxes|declaracion|return)\b/,
      /\b(legal advice|lawyer|lawsuit|sue)\b/,
    ],
    answer:
      "I can explain how FreeFlow calculates IVA and ISR withholding, but I can't tell you which tax regime to choose, how much you owe, or give legal advice. An accountant is the right person for that. If a figure in FreeFlow looks wrong, submit a ticket.",
  },
  {
    id: "guard-human",
    triggers: [
      /\b(real|actual|live) (person|human|agent|someone)\b/,
      /\b(talk|speak|chat) (to|with) (a |an |the )?(human|person|someone|owner|agent|support)\b/,
      /\bare you (a )?(human|real|bot|robot|person)\b/,
    ],
    answer:
      "I'm an automated guide, not a person. If you'd like FreeFlow's owner to look at this, submit a ticket and the owner will reply by email.",
  },
  {
    id: "guard-other-account",
    triggers: [
      /\b(coworker|co worker|colleague|friend|employee|someone else|another user|other users?|another person|other people)( s)?\b.*\b(account|projects?|data|invoices?|dashboard|email|forecast)\b/,
      /\blog ?in as\b/,
    ],
    answer:
      "I can only help with your own account. Each FreeFlow account sees only its own projects and data, so I can't show or discuss anyone else's.",
  },
  {
    id: "guard-account-change",
    triggers: [
      /\b(can|could|would|will) you (please )?(delete|remove|change|update|edit|reset|mark|close|move|refund|cancel)\b/,
      /\bplease (delete|remove|change|update|edit|reset|mark|close|refund|cancel)\b/,
      /\b(delete|remove|change|update|edit|reset|mark|close|cancel)\b.{0,40}\bfor me\b/,
    ],
    answer:
      "I can't change anything in your account myself. Tell me what you're trying to do and I'll walk you through doing it, or submit a ticket if it isn't something you can do in FreeFlow.",
  },
  {
    id: "guard-off-topic",
    triggers: OFF_TOPIC_TRIGGERS,
    answer:
      "I can only help with FreeFlow: problems with the app, how a feature works, or pricing and technical questions.",
  },
];
