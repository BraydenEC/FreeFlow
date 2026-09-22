# 🎛 UX Customization — Plan

**Status:** extra work, not tied to a module. Built after Week 3.
**Trigger:** two independent pieces of feedback saying the same thing.

> Week 2 validation interviewee: *"prob a cleaner simpler UI … it's annoying on mobile"* — and,
> unprompted, the fix: *"hyper customization … allows users to vibe customize how the harness
> runs."*
>
> A friend, later: *"more minimalist, simple and compact, where you don't need to scroll so much."*

---

## 1. Diagnosis — why the pages scroll

Every page serves two audiences at once. A grader needs the reasoning visible: the headline
boxes, the "why this price" anchors, the confidence notes. A user needs a tool. **The prose that
earns rubric points is the same prose a user scrolls past every time.** Shrinking padding does not
fix that; separating the two audiences does.

Secondary causes: every page is a single vertical stack even on a 1440px monitor, and empty
panels ("none yet") take space to say nothing.

## 2. Principles

1. **Customization must not make the default worse.** Both people asked for *simpler*. Ship
   excellent defaults; customization is an escape hatch that stays invisible until wanted.
2. **Hide, never delete.** All prose stays in the DOM. The Week 2 and 3 acceptance tests count
   rendered content in the HTML, and they must keep passing unchanged.
3. **Zero new dependencies.** Fifth week running. No drag-and-drop library — up/down buttons are
   simpler, accessible, and work on a phone.
4. **Corrupt preferences never crash the page.** localStorage is user-writable and can hold
   anything. Every read goes through zod and falls back to defaults — the same discipline as
   every other data path in this project.

## 3. What gets built

| # | Feature | Where |
|---|---|---|
| 1 | **Preferences system** — zod schema, defaults, localStorage, provider | `lib/prefs/`, `components/prefs/PrefsProvider` |
| 2 | **Density** — compact (default) / comfortable | CSS variables on the page stack |
| 3 | **Work mode / read mode** — reasoning hidden behind a "Why" toggle | `<Reasoning>` wrapper |
| 4 | **Dashboard widgets** — show/hide, reorder, half/full width | `DashboardGrid` |
| 5 | **One conditional widget** — Overdue, appears only when something is overdue, pinned to top | `OverdueAlert` |
| 6 | **Layout drawer** — all of the above in one slide-out, opened from the Settings item | `LayoutDrawer` |
| 7 | **Tabs** on `/research` and `/pricing` | `<Tabs>`, URL-synced, inactive tabs hidden via CSS not unmounted |

The inert **Settings** sidebar item — greyed out since Week 0 — becomes the drawer's trigger. The
rule that a nav item exists only when it leads somewhere has held for four weeks; this honours it
rather than adding a new button.

## 4. Preferences schema

```ts
{
  version: 1,
  density: "compact" | "comfortable",
  showReasoning: boolean,            // false by default — work mode
  dashboard: {
    pinOverdue: boolean,
    widgets: [{ id, visible, width: "half" | "full" }],   // order = array order
  }
}
```

Stored at `localStorage["servicepro.prefs.v1"]`. **Not Supabase:** the app has no auth, so a
preferences table would be one shared row pretending to be per-user. localStorage is honest for a
single-user tool.

## 5. Known tradeoff — a brief flash of defaults

Preferences live in the browser, and the server cannot read them. First paint uses defaults; the
saved layout applies after hydration. On a fast connection this is a single frame. Stated here
rather than hidden, because the alternative — blocking render until localStorage is read — makes
every page slower for everyone to spare a flash for people who customised.

## 6. Scope cuts

| Cut | Why |
|---|---|
| Drag-and-drop reordering | Native HTML5 DnD is poor on touch; arrows are accessible and enough |
| Saved layout presets | v2 once the widget system has proven itself |
| Per-column table chooser | The tables are four columns; there is little to hide |
| Supabase persistence | No auth means no user identity to key it on |
| Time-based rules ("show X in the morning") | Speculative. One conditional rule ships — overdue — to prove the pattern |

## 7. Tests

`npm run test:prefs` — garbage, partial, wrong-version, and missing localStorage values all
resolve to a valid preferences object. Every existing test must still pass, and the Week 2/3
production content checks must return the same counts, since nothing is unmounted.
