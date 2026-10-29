/*
  Shared types for /chat, FreeFlow's guided help assistant.

  The assistant is a rule engine, not a model: every answer a user sees comes
  from a Rule or a GuardRule written into this repository, and the rule's id is
  shown under the answer. The intake vocabulary below is the whole of what the
  first two questions can say, so a rule can be scoped to exactly the
  situations it was written for.
*/

export const CATEGORIES = ["broken", "how_to", "pricing_technical", "feedback"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  broken: "Something isn't working",
  how_to: "How do I use…",
  pricing_technical: "Pricing or technical",
  feedback: "Feedback or complaint",
};

export const AREAS = [
  "dashboard",
  "forecast",
  "projects",
  "brief",
  "research",
  "pricing",
  "marketing",
  "account",
  "other",
] as const;
export type Area = (typeof AREAS)[number];

export const AREA_LABELS: Record<Area, string> = {
  dashboard: "Dashboard",
  forecast: "Forecast",
  projects: "Projects",
  brief: "Brief extraction",
  research: "Research",
  pricing: "Pricing & plans",
  marketing: "Marketing",
  account: "Account & settings",
  other: "Other",
};

export type Link = { label: string; href: string };

export type Rule = {
  /** kebab-case, unique across content and guard rules. */
  id: string;
  categories: Category[] | "any";
  areas: Area[] | "any";
  /** Single normalised words; one point each. */
  keywords: string[];
  /** Multi-word normalised phrases; weighted higher than keywords. */
  phrases?: string[];
  answer: string;
  links?: Link[];
  followUp?: string;
  /** True when the answer can't fully solve it, so a ticket is offered inline. */
  offerTicket?: boolean;
};

export type GuardRule = {
  id: `guard-${string}`;
  triggers: RegExp[];
  answer: string;
  links?: Link[];
};

export type ReplyKind = "rule" | "guardrail" | "no_match";

export type EngineReply = {
  kind: ReplyKind;
  ruleId: string | null;
  answer: string;
  links: Link[];
  offerTicket: boolean;
};

export type Outcome = "answered" | "no_match" | "guardrail" | "ticket";

export type Turn = {
  role: "user" | "bot";
  text: string;
  ruleId?: string | null;
  kind?: ReplyKind;
};

export type Rating = { ruleId: string; up: boolean };

export const MAX_MESSAGE_CHARS = 2000;
