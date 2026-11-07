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
    card-shaped groups (4-4-4-4, 4-6-5 …) that pass the Luhn check, even with
    other digits beside it (a CVV, an expiry, an invoice number). A list of
    invoice numbers, dates or a spaced phone number is grouped differently and
    is left alone.
  - an API key or token: sk-/pk-/rk- prefixes in any case, AWS access keys,
    JWTs, whatever follows "Bearer", and a 32+ character run that mixes
    letters and digits (no dashes, so slugs and UUIDs survive)
  - whatever follows "password:", "password is", "contraseña es" and similar,
    including a quoted value with spaces — but not a complaint such as "the
    password is required" or "mi contraseña es incorrecta"
*/

const REMOVED = "[removed]";

const PASSWORD =
  /\b(password|passwd|contraseña|contrasena)(\s*[:=]\s*|\s+(?:is|es)\s*:?\s*)(?!(?:required|wrong|incorrect|invalid|not|too|correct|expired|reset|missing|empty|case|broken|still|locked|blocked|rejected|failing|lost|gone|weak|incorrecta|incorrecto|invalida|inválida|mala|erronea|errónea|equivocada|caducada|expirada|requerida|bloqueada|muy|no)\b)("[^"]*"|'[^']*'|\S+)/gi;
const BEARER = /\b(bearer)\s+\S+/gi;
const JWT = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
const PREFIXED_KEY = /\b(?:sk|pk|rk)[-_][A-Za-z0-9_-]{8,}/gi;
const AWS_KEY = /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g;
const LONG_TOKEN = /\b(?=[A-Za-z_]*\d)(?=\d*[A-Za-z])[A-Za-z0-9_]{32,}\b/g;
const DIGIT_SEQUENCE = /\b\d+(?:[ .-]\d+)*\b/g;

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

/** The card inside a run of digit groups starting at `start`, as its end index, or -1. */
function cardEnd(groups: string[], start: number): number {
  for (let end = groups.length; end > start; end--) {
    const slice = groups.slice(start, end);
    const digits = slice.join("");
    if (digits.length < 13 || digits.length > 19) continue;
    if (slice.length === 1 || (isCardGrouping(slice) && luhn(digits))) return end;
  }
  return -1;
}

/** Removes only the card, so an invoice number or CVV beside it can't hide it. */
function redactDigits(match: string): string {
  const parts = match.split(/([ .-])/);
  const groups = parts.filter((_, i) => i % 2 === 0);
  let out = "";
  let i = 0;
  while (i < groups.length) {
    if (i > 0) out += parts[i * 2 - 1];
    const end = cardEnd(groups, i);
    out += end === -1 ? groups[i] : REMOVED;
    i = end === -1 ? i + 1 : end;
  }
  return out;
}

export function redact(text: string): { text: string; redacted: boolean } {
  // A decomposed ñ (common when pasting from a Mac) must still match "contraseña".
  const composed = text.normalize("NFC");
  const out = composed
    .replace(PASSWORD, (_m, word: string, sep: string) => `${word}${sep}${REMOVED}`)
    .replace(BEARER, (_m, word: string) => `${word} ${REMOVED}`)
    .replace(JWT, REMOVED)
    .replace(PREFIXED_KEY, REMOVED)
    .replace(AWS_KEY, REMOVED)
    .replace(LONG_TOKEN, REMOVED)
    .replace(DIGIT_SEQUENCE, redactDigits);
  return { text: out, redacted: out !== composed };
}
