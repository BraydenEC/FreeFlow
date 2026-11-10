/*
  The Dock's magnification curve: an icon's size from its distance to the
  mouse pointer. Largest directly under the pointer, easing linearly back to
  the base size at `radius` px and staying there beyond it. Mouse only; touch
  and reduced-motion visitors always get the base size.
*/

export function iconSize(distancePx: number, base = 48, max = 78, radius = 150): number {
  const d = Math.abs(distancePx);
  const closeness = Math.max(0, 1 - d / radius);
  return base + closeness * (max - base);
}
