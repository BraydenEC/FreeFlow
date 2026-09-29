# FreeFlow — Brand System

**Source of truth.** The palette lives in [`app/globals.css`](../../app/globals.css)
as `@theme` tokens; this file explains it. Colour changes happen in `globals.css`
and nowhere else. This document describes what is true in the code, not an
aspiration.

---

## How this was resolved (Week 4, Phase 2)

The brand was ambiguous before this week. Two reviewed commits took the interface
**monochrome** (`8545113` "Theme: monochrome palette", `9e5ff31` "FreeFlow:
rename, and a monochrome typographic interface"). Two days later an unrelated
feature commit (`92ff738` "Projects: edit and delete") carried a stale
`globals.css` that silently reverted the palette back to the old indigo-on-slate
tokens — and reverted the `FreeFlow → ServicePro` comment header with it.

So the live site was running indigo by accident, while every commit message and
the interface's design intent said monochrome. Phase 2 restored the intended
monochrome tokens and made `globals.css` the documented, single source of truth
so a feature commit cannot quietly undo the brand again. The white-on-white
button defect the original monochrome commit fixed (`text-app` on filled
buttons) survived the regression and is still in place — verified before
restoring the white accent.

---

## Palette

The interface is **black-and-white by design**. Colour is reserved for one job:
communicating project status. A monochrome canvas makes those four status
colours the only colour on screen, so they read as meaning rather than
decoration.

### Surfaces — layered back to front

| Token | Hex | Role |
|---|---|---|
| `--color-app` | `#000000` | Page canvas |
| `--color-surface` | `#000000` | Sidebar, cards, table container |
| `--color-raised` | `#111111` | Table header, row hover |
| `--color-hairline` | `#262626` | 1px borders — sharp grey |

Depth comes from hairlines, not from tinted fills. Cards sit on black and are
defined by their border.

### Ink

| Token | Hex | Role |
|---|---|---|
| `--color-ink` | `#ffffff` | Headings, metric values |
| `--color-ink-muted` | `#a3a3a3` | Labels, client names |
| `--color-ink-faint` | `#525252` | Meta text |

### Accent — pure white

| Token | Hex | Role |
|---|---|---|
| `--color-accent` | `#ffffff` | Active state, filled primary buttons |
| `--color-accent-soft` | `#e5e5e5` | Secondary emphasis, hover text |

**Rule:** a filled button is `bg-accent` (white) and must pair with `text-app`
(black) for its label. White text on a white accent is invisible — this was the
one defect the monochrome pass caught. Non-filled accent uses (`text-accent-soft`,
`bg-accent/10`) are safe on the black canvas.

### Status colours — the only colour on screen

| Token | Hex | State |
|---|---|---|
| `--color-status-progress` | `#60a5fa` (blue) | In Progress |
| `--color-status-review` | `#fcd34d` (yellow) | Awaiting Review |
| `--color-status-sent` | `#34d399` (mint) | Invoice Sent |
| `--color-status-overdue` | `#f87171` (red) | Overdue |

These four are the entire colour budget. Nothing else in the product is coloured.

---

## Typography

- **Sans:** Geist Sans (`--font-sans`), for all interface text.
- **Mono:** Geist Mono (`--font-mono`), for figures where alignment matters.
- **Tabular numerals:** the `.numeric` utility (`font-variant-numeric:
  tabular-nums`) so money aligns down a column — `$4,837.50` and `$1,100.00`
  share digit width.
- **Labels vs. values:** in an interface with no colour and no icons,
  letterspacing separates a label from a value. `.page-title` and column headers
  are `uppercase` with `letter-spacing: 0.1em`. Letterspacing is used *only* for
  labels, never for emphasis.

Density is user-controlled (`data-density="compact" | "comfortable"`), changing
only section gap and base type size; everything else scales from there.

---

## Logo / brand mark

A **filled white rounded square** (`bg-ink`, 28px, `rounded-md`) holding a black
glyph — a flag/notch shape drawn as an SVG path, not a letter — so it reads as a
mark at small sizes rather than as text. It inverts with the theme: white square,
black glyph on the black canvas. Rendered in
[`components/TopBar.tsx`](../../components/TopBar.tsx). The wordmark "FreeFlow"
is set in the sans face; the product name is one word, capital F and capital F.

---

## Voice

FreeFlow speaks the way the pricing simulator behaves: **plain, specific, and
unwilling to flatter.** The validated persona (the Week 2 interviewee — a
per-project installer who finds clients by cold outreach) does not respond to
generic freelancer-hustle copy. The rules:

1. **Say what it is before asking for anything.** The landing headline —
   "Know what is coming, not just what you are owed" — states the product's one
   idea before any signup ask.
2. **Concrete over aspirational.** "See which invoices are late" beats "unlock
   your financial freedom." Name the task, not the feeling.
3. **Never claim what isn't built.** Marketing copy traces to real features (the
   feature map) or the validated persona. Generated copy is labelled as
   generated — the same `extractor: model | heuristic` provenance the product
   already uses.
4. **Honest about being free.** The product is free while it grows, with an
   optional donation. Say that; don't dress it as a limited-time offer.
5. **Lowercase energy, capital precision.** Conversational tone, but numbers,
   currencies, and product names are exact.

---

## Reach

Universal and accessible across countries, with the near-term focus on **the US
and Latin America** — which is why the product carries eleven currencies and
Mexican tax handling (IVA, retenciones, RESICO) rather than a single locale.
