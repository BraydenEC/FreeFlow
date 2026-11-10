/*
  The /demo story clock: one night, from 11:47 pm to 8:00 am, driven by how
  far the visitor has scrolled (0 at the top, 1 at the end). Clamped, and it
  only ever moves forward through the night.
*/

const START = 23 * 60 + 47; // 11:47 pm, in minutes after midnight
const END = 24 * 60 + 8 * 60; // 8:00 am the next morning
const SPAN = END - START;

const clamp = (p: number) => Math.min(1, Math.max(0, Number.isFinite(p) ? p : 0));

/** Minutes since the story began (11:47 pm), for a scroll progress. */
export function storyMinutes(progress: number): number {
  return Math.round(clamp(progress) * SPAN);
}

export function clockFor(progress: number): string {
  const t = (START + storyMinutes(progress)) % (24 * 60);
  const h24 = Math.floor(t / 60);
  const m = t % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
}
