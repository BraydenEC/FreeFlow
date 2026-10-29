/*
  Secret redaction for /chat.

  Runs on every user message before it is shown back and again on the server
  before anything is saved, so a pasted card number or key never reaches the
  database. Deliberately narrow: a help desk for an invoicing app is full of
  ordinary numbers (amounts, dates, phone numbers, invoice runs, project ids),
  and blanking those would make the transcripts useless to the person reading
  them.

  What counts as a secret:
  - a card number: 13–19 digits written as one run (this also catches an
    18-digit CLABE, which is a bank account and should go too), or written in
    card-shaped groups (4-4-4-4, 4-6-5 …) that pass the Luhn check. A list of
    invoice numbers, dates or a spaced phone number is grouped differently and
    is left alone.
  - an API key or token: sk-/pk-/rk- prefixes in any case, AWS access keys,
    JWTs, whatever follows "Bearer", and a 32+ character run that mixes
    letters and digits (no dashes, so slugs and UUIDs survive)
  - whatever follows "password:", "password is", "contraseña es" and similar,
    including a quoted value with spaces — but not "the password is required"
*/

const REMOVED = "[removed]";

const PASSWORD =
  /\b(password|passwd|contraseña|contrasena)(\s*[:=]\s*|\s+(?:is|es)\s*:?\s*)(?!(?:required|wrong|incorrect|invalid|not|too|correct|expired|reset|missing|empty|case)\b)("[^"]*"|'[^']*'|\S+)/gi;
const BEARER = /\b(bearer)\s+\S+/gi;
const JWT = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
const PREFIXED_KEY = /\b(?:sk|pk|rk)[-_][A-Za-z0-9_-]{8,}/gi;
const AWS_KEY = /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g;
const LONG_TOKEN = /\b(?=[A-Za-z_]*\d)(?=\d*[A-Za-z])[A-Za-z0-9_]{32,}\b/g;
const DIGIT_RUN = /\b\d(?:[ -]?\d){12,18}\b/g;

function luhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

function isCardGrouping(groups: string[]): boolean {
  const lens = groups.map((g) => g.length);
  const fours = lens.slice(0, -1).every((l) => l === 4) && lens[lens.length - 1] >= 1 && lens[lens.length - 1] <= 4;
  const amex = lens.length === 3 && lens[0] === 4 && lens[1] === 6 && (lens[2] === 4 || lens[2] === 5);
  return fours || amex;
}

function redactDigits(match: string): string {
  const groups = match.split(/[ -]/);
  if (groups.length === 1) return REMOVED;
  const digits = groups.join("");
  return isCardGrouping(groups) && luhn(digits) ? REMOVED : match;
}

export function redact(text: string): { text: string; redacted: boolean } {
  const out = text
    .replace(PASSWORD, (_m, word: string, sep: string) => `${word}${sep}${REMOVED}`)
    .replace(BEARER, (_m, word: string) => `${word} ${REMOVED}`)
    .replace(JWT, REMOVED)
    .replace(PREFIXED_KEY, REMOVED)
    .replace(AWS_KEY, REMOVED)
    .replace(LONG_TOKEN, REMOVED)
    .replace(DIGIT_RUN, redactDigits);
  return { text: out, redacted: out !== text };
}
