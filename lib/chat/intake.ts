import type { Area, Category } from "./types";

/*
  M2: testers had to click two chips before a text box appeared. Now the box
  is there from the start, and a question typed without choosing gets its
  category and area from its own words. The chips still work as shortcuts,
  and the engine's any-scope pass still catches a wrong guess.
*/

const AREA_WORDS: [Area, RegExp][] = [
  ["forecast", /\bforecast|expected income|pron[oó]stico|next month/],
  ["brief", /\bbrief|paste|extract|core\b/],
  ["pricing", /\bpric|cost|plan\b|plans\b|subscription|tier|charge|pay for|precio|cuesta|lifetime/],
  ["account", /\baccount|password|sign ?in|log ?in|sign ?up|email|setting|currency|delete my|cuenta/],
  ["research", /\bresearch|competitor|benchmark/],
  ["marketing", /\bmarketing|campaign|a\/b/],
  ["projects", /\bproject|mark paid|unpaid|paid|invoice|client|deadline|fixed fee|hourly|status|csv|export|bulk|shortcut/],
  ["dashboard", /\bdashboard|widget|summary|earnings|overdue|layout/],
];

export function guessIntake(text: string): { category: Category; area: Area } {
  const t = text.toLowerCase();
  const category: Category =
    /\b(feedback|suggest|suggestion|complain|complaint|i wish|would be nice|please add)\b/.test(t)
      ? "feedback"
      : /\b(broken|error|bug|crash|stuck|missing|lost|wrong|not working|doesn'?t work|won'?t|can'?t|cannot|isn'?t|no funciona|no me deja)\b/.test(t)
        ? "broken"
        : /\b(price|pricing|cost|costs|free|charge|charged|subscription|plan|security|secure|encrypt|privacy|data|api|stripe|precio|cuesta)\b/.test(t)
          ? "pricing_technical"
          : "how_to";
  const area = AREA_WORDS.find(([, re]) => re.test(t))?.[0] ?? "other";
  return { category, area };
}
