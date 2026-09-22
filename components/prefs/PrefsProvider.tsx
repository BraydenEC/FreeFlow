"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { Prefs, WidgetId } from "@/lib/prefs/schema";
import {
  getServerSnapshot,
  getSnapshot,
  resetPrefs,
  setPrefs,
  subscribe,
} from "@/lib/prefs/store";

/*
  Preferences context, backed by useSyncExternalStore.

  During server render and hydration React reads getServerSnapshot, which is
  the defaults, so the first paint matches on both sides. Immediately after
  hydration React reads getSnapshot, which loads localStorage, and re-renders
  with the saved layout. That is the documented one-frame flash — the price of
  not blocking every page on a storage read.
*/

type PrefsContextValue = {
  prefs: Prefs;
  setDensity: (d: Prefs["density"]) => void;
  setShowReasoning: (v: boolean) => void;
  setPinOverdue: (v: boolean) => void;
  setWidgetVisible: (id: WidgetId, visible: boolean) => void;
  setWidgetWidth: (id: WidgetId, width: "half" | "full") => void;
  moveWidget: (id: WidgetId, direction: -1 | 1) => void;
  reset: () => void;
};

const PrefsContext = createContext<PrefsContextValue | null>(null);

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<PrefsContextValue>(
    () => ({
      prefs,
      setDensity: (density) => setPrefs((p) => ({ ...p, density })),
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
