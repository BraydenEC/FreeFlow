/*
  Secret redaction for /chat.

  Runs on every user message before it is shown back and again on the server
  before anything is saved, so a pasted card number or key never reaches the
  database. Deliberately narrow: a help desk for an invoicing app is full of
  ordinary numbers (amounts, dates, phone numbers, project counts), and
  blanking those would make the transcripts useless to the person reading them.

  What counts as a secret:
  - a card-like run of 13–19 digits, optionally split by single spaces/dashes
  - an API-key-shaped token (sk-/pk-/rk- prefixes, or a 32+ character run that
    mixes letters and digits)
  - whatever follows "password:", "password is", "contraseña:" and similar
*/

const REMOVED = "[removed]";

const CARD = /\b\d(?:[ -]?\d){12,18}\b/g;
const PREFIXED_KEY = /\b(?:sk|pk|rk)[-_][A-Za-z0-9_-]{8,}/g;
const LONG_TOKEN = /\b(?=[A-Za-z_-]*\d)(?=\d*[A-Za-z])[A-Za-z0-9_-]{32,}\b/g;
const PASSWORD = /\b(password|passwd|pwd|pw|contraseña|contrasena)(\s*(?:[:=]|\bis\b)\s*)\S+/gi;

export function redact(text: string): { text: string; redacted: boolean } {
  let out = text
    .replace(PASSWORD, (_m, word: string, sep: string) => `${word}${sep}${REMOVED}`)
    .replace(PREFIXED_KEY, REMOVED)
    .replace(LONG_TOKEN, REMOVED)
    .replace(CARD, REMOVED);
  // A password phrase can chain ("pw: password: abc"); one more pass catches
  // the value the first replacement exposed.
  out = out.replace(PASSWORD, (m, word: string, sep: string) =>
    m.endsWith(REMOVED) ? m : `${word}${sep}${REMOVED}`,
  );
  return { text: out, redacted: out !== text };
}
