"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { Prefs, WidgetId } from "@/lib/prefs/schema";
import {
  getServerSnapshot,
  getSnapshot,
  peek,
  resetPrefs,
  setPrefs,
  setRemoteSync,
  subscribe,
} from "@/lib/prefs/store";

/*
  Preferences context, backed by useSyncExternalStore.

  Signed out: during server render and hydration React reads getServerSnapshot
  (the defaults), then getSnapshot loads localStorage and re-renders with the
  saved layout. That is the documented one-frame flash — the price of not
  blocking every page on a storage read.

  Signed in: the layout passes the user's server row as `initial`. Both
  snapshots return it, so the first paint is already the saved layout and
  there is no flash. Every change is debounced and PUT to /api/prefs; if no
  row exists yet, the local prefs are pushed up once so a visitor's choices
  from before they had an account survive.
*/

type PrefsContextValue = {
  prefs: Prefs;
  setDensity: (d: Prefs["density"]) => void;
  setCurrency: (c: Prefs["currency"]) => void;
  setShowReasoning: (v: boolean) => void;
  setPinOverdue: (v: boolean) => void;
  setWidgetVisible: (id: WidgetId, visible: boolean) => void;
  setWidgetWidth: (id: WidgetId, width: "half" | "full") => void;
  moveWidget: (id: WidgetId, direction: -1 | 1) => void;
  reset: () => void;
};

const PrefsContext = createContext<PrefsContextValue | null>(null);

const SYNC_DELAY_MS = 600;

function putPrefs(prefs: Prefs): void {
  fetch("/api/prefs", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prefs),
    keepalive: true,
  }).catch(() => {
    /* offline or signed out mid-session — localStorage still has it */
  });
}

export function PrefsProvider({
  initial,
  scope,
  children,
}: {
  /** The user's saved row, or null when signed out or no row exists yet. */
  initial: Prefs | null;
  /** User id, or null when signed out. Changing it reseeds the store. */
  scope: string | null;
  children: React.ReactNode;
}) {
  const prefs = useSyncExternalStore(
    subscribe,
    () => getSnapshot(initial, scope),
    () => getServerSnapshot(initial),
  );

  // Install the sync hook for the lifetime of a signed-in session.
  useEffect(() => {
    if (!scope) {
      setRemoteSync(null);
      return;
    }
    let timer: ReturnType<typeof setTimeout> | null = null;
    setRemoteSync((next) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => putPrefs(next), SYNC_DELAY_MS);
    });
    // First sign-in with no server row: migrate whatever the browser had.
    if (!initial) putPrefs(peek());
    return () => {
      if (timer) clearTimeout(timer);
      setRemoteSync(null);
    };
  }, [scope, initial]);

  const value = useMemo<PrefsContextValue>(
    () => ({
      prefs,
      setDensity: (density) => setPrefs((p) => ({ ...p, density })),
      setCurrency: (currency) => setPrefs((p) => ({ ...p, currency })),
      setShowReasoning: (showReasoning) => setPrefs((p) => ({ ...p, showReasoning })),
      setPinOverdue: (pinOverdue) =>
        setPrefs((p) => ({ ...p, dashboard: { ...p.dashboard, pinOverdue } })),
      setWidgetVisible: (id, visible) =>
        setPrefs((p) => ({
          ...p,
          dashboard: {
            ...p.dashboard,
            widgets: p.dashboard.widgets.map((w) =>
              w.id === id ? { ...w, visible } : w,
            ),
          },
        })),
      setWidgetWidth: (id, width) =>
        setPrefs((p) => ({
          ...p,
          dashboard: {
            ...p.dashboard,
            widgets: p.dashboard.widgets.map((w) =>
              w.id === id ? { ...w, width } : w,
            ),
          },
        })),
      moveWidget: (id, direction) =>
        setPrefs((p) => {
          const list = [...p.dashboard.widgets];
          const i = list.findIndex((w) => w.id === id);
          const j = i + direction;
          if (i < 0 || j < 0 || j >= list.length) return p;
          [list[i], list[j]] = [list[j], list[i]];
          return { ...p, dashboard: { ...p.dashboard, widgets: list } };
        }),
      reset: resetPrefs,
    }),
    [prefs],
  );

  return (
    <PrefsContext.Provider value={value}>
      {/* data-density drives the CSS variables in globals.css */}
      <div data-density={prefs.density} className="contents">
        {children}
      </div>
    </PrefsContext.Provider>
  );
}

export function usePrefs(): PrefsContextValue {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used inside <PrefsProvider>");
  return ctx;
}
