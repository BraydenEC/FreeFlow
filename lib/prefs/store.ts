import { DEFAULT_PREFS, type Prefs } from "@/lib/prefs/schema";
import { loadPrefs, savePrefs, clearPrefs } from "@/lib/prefs/storage";

/*
  A minimal external store for preferences, shaped for useSyncExternalStore.

  Why not useState + useEffect: reading localStorage in an effect and then
  calling setState is exactly the "cascading render" pattern React's lint rule
  flags, and it is the wrong tool. localStorage is an external system, and
  React provides useSyncExternalStore for precisely that — with a separate
  server snapshot so hydration never mismatches.

  getSnapshot must return the same reference while nothing has changed, or
  React will loop. So the current value is cached and only replaced on write.
*/

let current: Prefs | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Client snapshot. Loads from localStorage on first call, then caches. */
export function getSnapshot(): Prefs {
  if (current === null) current = loadPrefs();
  return current;
}

/** Server snapshot — and what the client uses during hydration. */
export function getServerSnapshot(): Prefs {
  return DEFAULT_PREFS;
}

export function setPrefs(next: Prefs | ((p: Prefs) => Prefs)): void {
  const value = typeof next === "function" ? next(getSnapshot()) : next;
  current = value;
  savePrefs(value);
  notify();
}

export function resetPrefs(): void {
  clearPrefs();
  current = DEFAULT_PREFS;
  notify();
}
