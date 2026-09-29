import type { HeadlineVariant } from "./types";

/*
  A/B headline logic — pure, so the page and the tests share it.

  The "test" here is deliberately not an analytics experiment (that needs
  traffic the product does not have — see the scope cut). It is a chooser: given
  the variants for a named test and the id the user picked, return the winner.
  The choice is what gets persisted to marketing_assets.
*/

/**
 * Return the chosen headline for a test.
 * - If `chosenId` names a variant in that test, that variant wins.
 * - If the test exists but `chosenId` is unknown/empty, the first variant is the
 *   default winner (never null when the test has variants).
 * - If no variant belongs to `test`, returns null — nothing to choose.
 */
export function pickHeadlineWinner(
  headlines: HeadlineVariant[],
  test: string,
  chosenId: string | null | undefined,
): HeadlineVariant | null {
  const variants = headlines.filter((h) => h.test === test);
  if (variants.length === 0) return null;
  const chosen = variants.find((h) => h.id === chosenId);
  return chosen ?? variants[0];
}

/** The distinct A/B tests present in a headline list, in first-seen order. */
export function headlineTests(headlines: HeadlineVariant[]): string[] {
  const seen: string[] = [];
  for (const h of headlines) {
    if (!seen.includes(h.test)) seen.push(h.test);
  }
  return seen;
}
