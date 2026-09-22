import { DEFAULT_PREFS, parsePrefs, type Prefs } from "@/lib/prefs/schema";

/*
  localStorage access, wrapped.

  Every call is try/catch because storage can throw: private windows, cleared
  site data, quota, or a browser that simply refuses. In all of those cases
  the page must render with defaults rather than fail.
*/

export const PREFS_KEY = "servicepro.prefs.v1";

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return parsePrefs(JSON.parse(raw));
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Prefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Storage unavailable. The in-memory state still applies for this session.
  }
}

export function clearPrefs(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFS_KEY);
  } catch {
    // Nothing to do.
  }
}
