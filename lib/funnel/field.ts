/*
  The /demo hero's worry field, as plain numbers.

  18 note cards (the choice's 9 worries, each twice: things you keep
  thinking about) drift in the band under the headline. Scrolling through
  the sort space pulls them into rows near the top of the screen: one row
  per worry, so the two copies of a worry merge into one. The "on your mind"
  counter falls from 18 to 0 as they sort.

  Rows sit in up to three 360 px columns; on a phone there is one column and
  each row's status goes on its own line, so the row is taller.
*/

export const FIELD_CARDS = 18;
export const COL_WIDTH = 360;
const TOP = 110;

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

export function sortedColumns(width: number): 1 | 2 | 3 {
  return Math.min(3, Math.max(1, Math.floor((width - 48) / COL_WIDTH))) as 1 | 2 | 3;
}

export function rowHeight(cols: number): number {
  return cols === 1 ? 42 : 34;
}

/** Where worry k (0-8) settles once sorted, in viewport pixels (text baseline). */
export function sortedTarget(k: number, width: number): { x: number; y: number } {
  const cols = sortedColumns(width);
  const left = Math.max(20, width / 2 - (cols * COL_WIDTH) / 2);
  return { x: left + (k % cols) * COL_WIDTH, y: TOP + Math.floor(k / cols) * rowHeight(cols) };
}

/** Notes still on your mind for a sort progress (0-1). Lands on 0 just before the end. */
export function counterFor(order: number): number {
  const o = clamp01(order);
  return o >= 0.98 ? 0 : Math.round(FIELD_CARDS * (1 - o));
}

/** The vertical band the notes drift in: under the hero's controls, above the bottom edge. */
export function fieldBand(controlsBottom: number, viewportH: number): [number, number] {
  const top = Math.max(controlsBottom + 40, viewportH * 0.42);
  return [top, Math.max(top + 120, viewportH - 50)];
}
