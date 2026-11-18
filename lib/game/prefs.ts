import { STYLE_IDS, type StyleId } from "@/lib/game/engine";

/*
  What the game remembers in this browser: the personal best and the chosen
  obstacle style. Nothing else, and nothing leaves the browser. Every access
  is wrapped, so blocked storage (or node, in the tests) only loses the
  memory: the best reads as 0 and the style as the default.
*/

const BEST_KEY = "ff_gates_best";
const STYLE_KEY = "ff_game_style";
export const DEFAULT_STYLE: StyleId = "invoices";

const isStyle = (v: unknown): v is StyleId => typeof v === "string" && (STYLE_IDS as readonly string[]).includes(v);

export function readBest(): number {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(n: number): void {
  try {
    window.localStorage.setItem(BEST_KEY, String(n));
  } catch {
    // Blocked storage: the best just isn't remembered.
  }
}

export function readStyle(): StyleId {
  try {
    const v = window.localStorage.getItem(STYLE_KEY);
    return isStyle(v) ? v : DEFAULT_STYLE;
  } catch {
    return DEFAULT_STYLE;
  }
}

export function saveStyle(id: StyleId): void {
  try {
    window.localStorage.setItem(STYLE_KEY, id);
  } catch {
    // Blocked storage: the style resets next visit.
  }
}
