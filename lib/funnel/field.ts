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
export function counterFor(order: number, total: number = FIELD_CARDS): number {
  const o = clamp01(order);
  return o >= 0.98 ? 0 : Math.round(total * (1 - o));
}

/*
  L2 (user testing): at 390px the 18 notes piled on top of each other and
  each worry showed twice. On a phone each worry is on the field once, and
  starts in its own slot of a two-column grid.
*/
export const NARROW_FIELD = 640;

export function fieldCount(viewportW: number, worries: number): number {
  return viewportW < NARROW_FIELD ? worries : FIELD_CARDS;
}

export function gridSlot(i: number, n: number, w: number, top: number, bottom: number): { x: number; y: number } {
  const cols = 2;
  const rows = Math.max(1, Math.ceil(n / cols));
  const col = i % cols;
  const row = Math.floor(i / cols);
  return { x: ((col + 0.5) * w) / cols, y: top + ((row + 0.5) * (bottom - top)) / rows };
}

/** The vertical band the notes drift in: under the hero's controls, above the bottom edge. */
export function fieldBand(controlsBottom: number, viewportH: number): [number, number] {
  const top = Math.max(controlsBottom + 40, viewportH * 0.42);
  return [top, Math.max(top + 120, viewportH - 50)];
}

/*
  Sorting, worry by worry. Each worry gets its own stretch of the scroll,
  staggered down the list, so the notes check off one after another while
  the counter falls: worry 0 is done halfway down the sort space, worry 8
  just as the counter reaches 0. Within its stretch the progress is eased,
  and it follows the scroll exactly in both directions.
*/
export const SORT_STAGGER = 0.06;
export const SORT_SPAN = 0.5;

/** 0-1 smooth ramp of x between a and b. */
function ramp(x: number, a: number, b: number): number {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** How far worry k (0-8) has sorted at overall sort progress `order`. */
export function worryProgress(order: number, k: number): number {
  const start = k * SORT_STAGGER;
  return ramp(clamp01(order), start, start + SORT_SPAN);
}

export type Morph = {
  /** The messy note's card (background, border). */
  card: number;
  /** The ✓. */
  check: number;
  /** What FreeFlow did with it. */
  status: number;
  /** The worry's second copy, which merges into the row and fades. */
  copy: number;
  /** The note's tilt. */
  tilt: number;
  /** How far the text has moved right to make room for the ✓. */
  shift: number;
};

/** A note's look at worry progress p: card first fades, then the ✓, then the status. */
export function morph(p: number): Morph {
  const q = clamp01(p);
  return {
    card: 1 - ramp(q, 0.4, 0.8),
    check: ramp(q, 0.55, 0.9),
    status: ramp(q, 0.78, 1),
    copy: 1 - ramp(q, 0.45, 0.9),
    tilt: 1 - ramp(q, 0, 0.8),
    shift: ramp(q, 0.5, 0.9),
  };
}
