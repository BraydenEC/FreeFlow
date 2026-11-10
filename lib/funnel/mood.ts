/*
  The /demo page's mood, from scroll progress (0 to 1).

  stress: full through chapter 1 (the night, up to 0.2), fading out by 0.35.
  morning: nothing until 0.85, then rising to full light at the end.
  Both drive CSS variables (--stress, --morning); under reduced motion the
  page still changes colour, it just doesn't animate between states.
*/

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function moodFor(progress: number): { stress: number; morning: number } {
  const p = clamp01(Number.isFinite(progress) ? progress : 0);
  const stress = p < 0.2 ? 1 : clamp01(1 - (p - 0.2) / 0.15);
  const morning = p < 0.85 ? 0 : clamp01((p - 0.85) / 0.15);
  return { stress, morning };
}
