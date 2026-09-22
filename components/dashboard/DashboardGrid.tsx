"use client";

import { usePrefs } from "@/components/prefs/PrefsProvider";
import type { WidgetId } from "@/lib/prefs/schema";

/*
  Arranges dashboard widgets by preference.

  Each widget's content is server-rendered and passed in as a prop, so this
  component decides only order, visibility, and width — it never fetches. The
  overdue widget is special-cased: when pinning is on and there is something
  overdue, it moves to the top regardless of saved order, because a layout
  that hides an overdue invoice under a research panel has its priorities
  wrong.

  Half-width widgets pair up on wide screens and stack on narrow ones. That
  two-column arrangement is where most of the vertical scrolling went.
*/

export default function DashboardGrid({
  widgets,
  hasOverdue,
}: {
  widgets: Record<WidgetId, React.ReactNode>;
  hasOverdue: boolean;
}) {
  const { prefs } = usePrefs();

  let ordered = prefs.dashboard.widgets.filter((w) => w.visible);

  if (prefs.dashboard.pinOverdue && hasOverdue) {
    const ov = ordered.find((w) => w.id === "overdue");
    ordered = [
      ...(ov ? [ov] : [{ id: "overdue" as const, visible: true, width: "full" as const }]),
      ...ordered.filter((w) => w.id !== "overdue"),
    ];
  }

  // The overdue widget renders nothing when nothing is overdue; skip its slot
  // so an empty cell does not leave a gap in the grid.
  ordered = ordered.filter((w) => w.id !== "overdue" || hasOverdue);

  return (
    <div className="grid gap-[var(--section-gap,2rem)] lg:grid-cols-2">
      {ordered.map((w) => (
        <div
          key={w.id}
          className={w.width === "full" ? "lg:col-span-2" : "lg:col-span-1"}
        >
          {widgets[w.id]}
        </div>
      ))}
    </div>
  );
}
