import type { CoreExtraction } from "@/lib/core/schema";

/*
  Deterministic extractor — the fallback when no model key is configured or the
  API call fails.

  This is not trying to beat the model. It exists so the page always returns a
  valid, honestly-labelled result: the app builds and deploys with no
  credentials, and a demo never dies on a network error. What it cannot find,
  it reports as null and names in the confidence note — the same contract the
  model is held to.
*/

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function iso(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/**
 * Find a deadline. Handles "Nov 14", "November 14th", "11/14/2026", "2026-11-14".
 * Year-less dates resolve to the next future occurrence, matching the model's rule.
 */
function findDeadline(text: string, today: Date): string | null {
  const isoMatch = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) return isoMatch[0];

  const slash = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (slash) {
    const month = Number(slash[1]);
    const day = Number(slash[2]);
    let year = slash[3] ? Number(slash[3]) : today.getUTCFullYear();
    if (year < 100) year += 2000;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      if (!slash[3] && new Date(Date.UTC(year, month - 1, day)) < today) year += 1;
      return iso(year, month, day);
    }
  }

  const named = text.match(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?\b/i,
  );
  if (named) {
    const month = MONTHS[named[1].toLowerCase()];
    const day = Number(named[2]);
    let year = named[3] ? Number(named[3]) : today.getUTCFullYear();
    if (!named[3] && new Date(Date.UTC(year, month - 1, day)) < today) year += 1;
    return iso(year, month, day);
  }

  return null;
}

/** Hourly rate. Handles "$85/hr", "85 an hour", "85 USD per hour", "$85 hourly". */
function findRate(text: string): number | null {
  const patterns = [
    /\$\s*(\d+(?:\.\d+)?)\s*(?:\/|\s*per\s+|\s+an?\s+)\s*(?:hr|hour)/i,
    /(\d+(?:\.\d+)?)\s*(?:usd)?\s*(?:\/|\s*per\s+|\s+an?\s+)\s*(?:hr|hour)/i,
    /(?<!(?:flat|fixed)\s)(?:rate|hourly)\D{0,12}?\$?\s*(\d+(?:\.\d+)?)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return Number(m[1]);
  }
  return null;
}

const NUM = "[$€£]?\\s*\\d[\\d,]*(?:\\.\\d+)?";
const toNumber = (raw: string) => Number(raw.replace(/[$€£\s,]/g, ""));
// An amount followed by an hours word is a rate or a duration, not a budget.
const HOURLY_AFTER = /^\s*(?:usd|mxn|eur|dollars?|pesos?)?\s*(?:\/\s*h|per\s+h|an?\s+hour|hourly|hours?\b|hrs?\b|horas?\b|por\s+hora)/i;

/** A flat budget. Handles "budget 800 usd", "$1,800 flat", "8,500 MXN", "fixed fee of €2,400" (H5). */
function findFixedTotal(text: string): number | null {
  const patterns = [
    new RegExp(`(?:budget|presupuesto|fixed fee|flat fee|flat rate)\\D{0,20}?(${NUM})`, "i"),
    new RegExp(`(${NUM})\\s*(?:usd|mxn|eur|dollars|pesos)?\\s*(?:flat|fixed)\\b`, "i"),
    new RegExp(`(${NUM})\\s*(?:usd|mxn|eur|cad|gbp|cop|ars|brl|clp|pen|uyu|pesos|dollars)\\b`, "i"),
    new RegExp(`\\bpor\\s+([$€£]\\s*\\d[\\d,]*(?:\\.\\d+)?)`, "i"),
  ];
  for (const p of patterns) {
    const m = p.exec(text);
    if (!m) continue;
    const after = text.slice(m.index + m[0].length);
    if (HOURLY_AFTER.test(after) || HOURLY_AFTER.test(text.slice(m.index + m[0].indexOf(m[1]) + m[1].length))) continue;
    const value = toNumber(m[1]);
    if (value > 0) return value;
  }
  return null;
}

/** The brief's currency, only when it says so: a bare "$" could be several. */
function findCurrency(text: string): string | null {
  const code = text.match(/\b(usd|mxn|eur|cad|gbp|cop|ars|brl|clp|pen|uyu)\b/i);
  if (code) return code[1].toUpperCase();
  if (/\bpesos?\b/i.test(text)) return "MXN";
  if (/\bdollars?\b|\bd[oó]lares\b/i.test(text)) return "USD";
  if (text.includes("€")) return "EUR";
  if (text.includes("£")) return "GBP";
  return null;
}

/** Company or individual, only when stated (persona moral, SA de CV, LLC…). */
function findClientType(text: string): "company" | "individual" | null {
  if (/persona\s+moral|\bs\.?\s?a\.?\s+de\s+c\.?\s?v\b|\bs\.?\s+de\s+r\.?\s?l\b|\bllc\b|\binc\b|\bcorp\b/i.test(text)) return "company";
  if (/persona\s+f[ií]sica/i.test(text)) return "individual";
  return null;
}

/** Hours logged. Deliberately requires an hours word so it can't grab the rate. */
function findHours(text: string): number | null {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b(?!\w)/i,
    /(?:logged|tracked|worked|spent|billed)\D{0,20}?(\d+(?:\.\d+)?)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const value = Number(m[1]);
      // Guard against matching the rate when phrased "$85/hr" — that number is
      // already claimed by findRate, and hours are rarely three digits.
      if (value > 0 && value < 10000) return value;
    }
  }
  return null;
}

/** Client name. Looks for sign-offs and explicit "for X" / "with X" phrasing. */
function findClient(text: string): string | null {
  const patterns = [
    /(?:^|\n)\s*[-—–]{1,2}\s*(?:[A-Z][a-z]+,\s*)?([A-Z][\w&.\-]*(?:\s+[A-Z][\w&.\-]*){0,3})\s*$/m,
    /\b(?:for|with|client(?:\s+is)?:?)\s+([A-Z][\w&.\-]*(?:\s+[A-Z][\w&.\-]*){0,2}(?:\s+(?:Inc|LLC|Ltd|Co|Corp|Studio|Labs|Group)\.?)?)/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      const candidate = m[1].trim().replace(/[.,]$/, "");
      if (candidate.length > 1 && candidate.length < 60) return candidate;
    }
  }
  return null;
}

/*
  Words that can precede a project noun but are never part of its name.
  Without this trim, "following up on the redesign" yields "Up On The Redesign":
  the pattern happily swallows prepositions and articles on its way backwards.
*/
const NAME_STOPWORDS = new Set([
  "the", "a", "an", "on", "in", "of", "for", "with", "up", "to", "and",
  "our", "your", "my", "their", "this", "that", "following", "about",
  "re", "regarding", "discussed", "is", "was", "at", "by", "from",
]);

/** Drop leading stopwords so only the descriptive part of the phrase survives. */
function trimLeadingStopwords(phrase: string): string {
  const words = phrase.trim().split(/\s+/);
  while (words.length > 1 && NAME_STOPWORDS.has(words[0].toLowerCase())) {
    words.shift();
  }
  return words.join(" ");
}

const PROJECT_NOUNS =
  "redesign|rebuild|build|website|site|app|campaign|audit|migration|integration|refresh|launch|sprint|project";

/** Project name. Prefers a noun phrase, else falls back to a trimmed opener. */
function findProjectName(text: string): string {
  // Capture at most two words before the project noun, then trim stopwords.
  const noun = text.match(
    new RegExp(`\\b((?:[\\w-]+\\s+){0,2}(?:${PROJECT_NOUNS}))\\b`, "i"),
  );
  if (noun?.[1]) {
    const trimmed = trimLeadingStopwords(noun[1]);
    if (trimmed) return titleCase(trimmed);
  }

  const firstLine = text.trim().split(/[\n.!?]/)[0] ?? "";
  const words = trimLeadingStopwords(
    firstLine.trim().split(/\s+/).slice(0, 6).join(" "),
  );
  return titleCase(words || "Untitled Project");
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function findStatus(text: string, deadline: string | null, today: Date): CoreExtraction["status"] {
  const t = text.toLowerCase();
  if (/\binvoice(d|\s+sent)?\b|\bbilled\b/.test(t)) return "invoice_sent";
  if (/\breview\b|\bfeedback\b|\bapprov/.test(t)) return "awaiting_review";
  if (/\boverdue\b|\blate\b|\bpast due\b|\bbehind\b/.test(t)) return "overdue";
  if (deadline && new Date(`${deadline}T00:00:00Z`) < today) return "overdue";
  return "in_progress";
}

export function heuristicExtract(brief: string, today: Date): CoreExtraction {
  const deadline = findDeadline(brief, today);
  const fixed_total = findFixedTotal(brief);
  const hourly_rate = fixed_total === null ? findRate(brief) : null;
  const hours_logged = findHours(brief);
  const client = findClient(brief);

  const missing: string[] = [];
  if (client === null) missing.push("client");
  if (fixed_total === null) {
    if (hourly_rate === null) missing.push("hourly rate or budget");
    if (hours_logged === null) missing.push("hours logged");
  }
  if (deadline === null) missing.push("deadline");

  const confidence_note =
    missing.length === 0
      ? "Pattern matching found all fields; project name and status were inferred from wording."
      : `Pattern matching could not find: ${missing.join(", ")}. Those fields are left empty rather than guessed.`;

  return {
    project_name: findProjectName(brief),
    client,
    hourly_rate,
    hours_logged,
    fixed_total,
    currency: findCurrency(brief),
    client_type: findClientType(brief),
    deadline,
    status: findStatus(brief, deadline, today),
    confidence_note,
  };
}
