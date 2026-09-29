/*
  A tiny external store for the A/B headline choice, shaped for
  useSyncExternalStore — the same reason lib/prefs/store.ts exists: reading
  localStorage in an effect and calling setState is the cascading-render pattern
  React's lint flags. localStorage is an external system; this is the right tool,
  with a stable server snapshot so hydration never mismatches.

  The choice is a per-viewer convenience (which headline they picked), so it
  lives in localStorage. Persisting it to the account is a separate, explicit
  Save action against marketing_assets.
*/

const KEY = "freeflow.marketing.ab";
const EMPTY: Readonly<Record<string, string>> = Object.freeze({});

let current: Record<string, string> | null = null;
const listeners = new Set<() => void>();

function read(): Record<string, string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Record<string, string>;
    return {};
  } catch {
    return {};
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Record<string, string> {
  if (current === null) current = read();
  return current;
}

/** Stable reference for SSR and the first client render. */
export function getServerSnapshot(): Record<string, string> {
  return EMPTY;
}

export function setChoice(test: string, headlineId: string): void {
  const next = { ...getSnapshot(), [test]: headlineId };
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // A viewer with storage blocked still gets the in-memory choice this session.
  }
  for (const l of listeners) l();
}
