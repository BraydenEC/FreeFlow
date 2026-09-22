import { z } from "zod";

/*
  User preferences — the shape, the defaults, and nothing else.

  localStorage is user-writable and can contain anything: a truncated write, a
  value from an older version, a hand-edited experiment. Every read goes
  through this schema and falls back to defaults on failure, so a corrupt
  preference can never take the page down. Same discipline as every other data
  path in this project.
*/

export const WIDGET_IDS = ["overdue", "metrics", "projects", "core", "research"] as const;
export type WidgetId = (typeof WIDGET_IDS)[number];

export const WIDGET_LABELS: Record<WidgetId, string> = {
  overdue: "Overdue alert",
  metrics: "Cash-flow metrics",
  projects: "Projects table",
  core: "Recent extractions",
  research: "Market research",
};

const WidgetSchema = z.object({
  id: z.enum(WIDGET_IDS),
  visible: z.boolean(),
  width: z.enum(["half", "full"]),
});

export const PrefsSchema = z.object({
  version: z.literal(1),
  density: z.enum(["compact", "comfortable"]),
  /** false = work mode. Reasoning prose is in the DOM but collapsed. */
  showReasoning: z.boolean(),
  dashboard: z.object({
    /** When true and anything is overdue, the overdue widget is forced to the top. */
    pinOverdue: z.boolean(),
    widgets: z.array(WidgetSchema),
  }),
});

export type Prefs = z.infer<typeof PrefsSchema>;
export type WidgetPref = z.infer<typeof WidgetSchema>;

/*
  Defaults are the product. Both people who asked for this asked for simpler,
  so the default is the compact, work-mode layout — customisation is an escape
  hatch, not a requirement.
*/
export const DEFAULT_PREFS: Prefs = {
  version: 1,
  density: "compact",
  showReasoning: false,
  dashboard: {
    pinOverdue: true,
    widgets: [
      { id: "overdue", visible: true, width: "full" },
      { id: "metrics", visible: true, width: "full" },
      { id: "projects", visible: true, width: "full" },
      { id: "core", visible: true, width: "half" },
      { id: "research", visible: true, width: "half" },
    ],
  },
};

/**
 * Parse anything into valid preferences.
 *
 * Returns defaults on any failure. Also repairs a partially valid object: if a
 * widget is missing from the saved list (because it was added in a later
 * version), it is appended with its default rather than silently dropped.
 */
export function parsePrefs(raw: unknown): Prefs {
  const result = PrefsSchema.safeParse(raw);
  if (!result.success) return DEFAULT_PREFS;

  const prefs = result.data;
  const seen = new Set(prefs.dashboard.widgets.map((w) => w.id));
  const missing = DEFAULT_PREFS.dashboard.widgets.filter((w) => !seen.has(w.id));

  // Deduplicate too — a hand-edited file could list a widget twice.
  const deduped: WidgetPref[] = [];
  const kept = new Set<WidgetId>();
  for (const w of prefs.dashboard.widgets) {
    if (!kept.has(w.id)) {
      deduped.push(w);
      kept.add(w.id);
    }
  }

  return {
    ...prefs,
    dashboard: { ...prefs.dashboard, widgets: [...deduped, ...missing] },
  };
}
