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

  With accounts, the store has two sources:
    - signed out: localStorage, as before.
    - signed in:  the server row, passed in as `initial`. It is authoritative;
                  localStorage becomes a cache of it. Writes go to both and
                  are forwarded to the sync hook the provider installs.

  `scope` is the user id (or null). When it changes — sign in, sign out, or a
  different account on the same browser — the cached value is discarded and
  reseeded, so one user's layout never leaks into another's session.
*/

let current: Prefs | null = null;
let seededFor: string | null | undefined; // undefined = never seeded
let remoteSync: ((p: Prefs) => void) | null = null;

const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
  The client snapshot. Seeds from `initial` when provided (server row), else
  from localStorage. Reseeds whenever the scope changes.
*/
export function getSnapshot(initial: Prefs | null, scope: string | null): Prefs {
  if (current === null || seededFor !== scope) {
    seededFor = scope;
    if (initial) {
      current = initial;
      savePrefs(initial); // keep the local cache in step with the server
    } else {
      current = loadPrefs();
    }
  }
  return current;
}

/** What the server rendered with. Must match the client's first render. */
export function getServerSnapshot(initial: Prefs | null): Prefs {
  return initial ?? DEFAULT_PREFS;
}

/** Installed by the provider while a user is signed in; null otherwise. */
export function setRemoteSync(fn: ((p: Prefs) => void) | null): void {
  remoteSync = fn;
}

export function peek(): Prefs {
  return current ?? DEFAULT_PREFS;
}

export function setPrefs(next: Prefs | ((p: Prefs) => Prefs)): void {
  const value = typeof next === "function" ? next(peek()) : next;
  current = value;
  savePrefs(value);
  remoteSync?.(value);
  notify();
}

export function resetPrefs(): void {
  clearPrefs();
  current = DEFAULT_PREFS;
  remoteSync?.(DEFAULT_PREFS);
  notify();
}
