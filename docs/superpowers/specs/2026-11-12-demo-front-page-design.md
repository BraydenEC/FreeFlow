# /demo front page redesign: design

Date: 2026-11-12. Status: approved by the owner 2026-11-12 ("push now and we can iterate"); story keeps the full approved text.
Source of decisions: `docs/superpowers/specs/2026-11-12-demo-redesign-notes.md` and the approved
prototype `.superpowers/brainstorm/14321-1794510973/content/neutral-start.html` (git-ignored, local).

## Why

/demo is FreeFlow's one landing page (signed-out `/` shows the same component). The owner wants
the first screen to feel like his own, in the spirit of landonorris.com, and not "a generic page
generated in the same typical Claude format". The approved prototype does that. This round builds
the parts of it that are already approved, so the new front page can go live now. The game comes
later as its own update.

## Scope

**In (this update):**

1. **Hero ("Current")** replaces chapter 1 (`ChapterNight`). It's a worry field: the cursor or
   finger is a current that pushes the notes, and scrolling sorts them into ✓ rows.
2. **Contour background** across the whole page. It starts tangled and calms into waves as you
   scroll. It replaces the red "stress" edge glow.
3. **Neutral start and job word picker.** The page opens as "I'M A *freelancer*" in warm grey,
   and the job word opens a six-swatch picker (the five jobs plus "Brayden's own"). This replaces
   `JobPicker`.
4. **Pinned "NOW IT ALL *flows.*" screen** right after the hero.
5. **Founder story restyle:** large serif text, the loose slash line drawing itself below the
   text, then "— Brayden".
6. **End band "START FREE · *now →*"** replaces the morning chapter's rounded button.
7. **Top bar restyle:** the clock stays, and "Try FreeFlow free" becomes a plain square-edged
   text link.

**Not in (stays exactly as it works today, owner's choice 2026-11-12):** the walkthrough, "You
said, we changed" (proof), the game, the launch-list form, and the footer. Only their position on
the page changes, and only where noted below.

**Anti-goals:** rounded "typical" buttons in the new parts; any price; breaking the page for
reduced-motion, keyboard or phone users; a page that needs the database to work.

## Page order

Hero → (sort space) → NOW IT ALL flows → Walkthrough → Story → Proof → Game → End band
→ Launch list → Footer.

This is today's order with the new parts swapped in. The middle chapters keep their current look
inside the existing `max-w-5xl` column. The new parts are full width.

## The parts, as decided

**Hero.** It uses the eyebrow "FreeFlow · one night" and this headline, in heavy uppercase with
the job word and "head." in italic serif in the accent colour:

> I'm a *freelancer*, / and it's all / in my *head.*

The job word and its comma never split across lines. Picking a job turns the first line into
"I'm a freelance *designer*,". Under the headline: "Move through the mess. Then scroll." There is
no counter or sort button on the first screen. The counter "on your mind 18" appears bottom-right
once scrolling or sorting starts, and counts down to 0 as the notes sort. "Sort it for me"
appears only when it gets keyboard focus.

**Worry field.** 18 note cards drift in the space below the headline only. They're drawn on a
`<canvas>`, and cards whose worry is marked red get a red edge. The pointer pushes nearby cards
and leaves a short red streak on fast ones. Across a 130 vh "sort space" below the hero,
scrolling pulls every card into rows near the top: ✓, the worry, then what FreeFlow did (the
worry's `status`). The field fades out as the flows screen arrives.

**Job picker.** Tapping the job word opens a small square-edged panel, "What do you do?", with six
round swatches. Each swatch shows its name on hover or focus. The panel closes on Escape, on an
outside tap, or after a pick. A pick re-colours the page (the accent), swaps the worries and
re-seeds the field.

| Choice | Word shown | Accent | Worries |
|---|---|---|---|
| (start) neutral | freelancer | #c9c6bf | general mix |
| Designer | designer | #60a5fa | designer's |
| Photographer | photographer | #34d399 | photographer's |
| Video editor | video editor | #a78bfa | video editor's |
| Writer | writer | #fcd34d | writer's |
| Developer | developer | #f472b6 | developer's |
| Brayden's own | video editor | #a3a3a3 | video editor's (his night) |

**Contour background.** About 15 fixed, faint (#262626) SVG lines over the whole page. They're
tangled at the top and become calm waves as the page scrolls. The morning light at the end stays.

**NOW IT ALL flows.** A pinned screen roughly 220 vh tall. As you scroll, "NOW IT ALL" tightens
into place, from large and spaced to its normal size and spacing. "*flows.*" fills with the
accent colour from left to right, like ink.

**Story.** It uses the approved text in `lib/funnel/story.ts`, set in large serif, with the
mission and promise line in white. The loose slash line sits below the text, behind it and
translucent, in the accent colour, and draws itself as the story scrolls into view. Under it:
"— Brayden", then the P.S. with the email. "story_complete" is still tracked once.

**End band.** The eyebrow "8:00 am · good morning" and "Free while it grows." sit above a
full-width band between hairlines: "START FREE" in heavy type and "*now →*" in serif. On hover or
focus, the accent colour rises up through the band and the text turns black. It links to
/signup and tracks "try_free_click".

**Top bar.** The clock ("Tuesday · 11:47 pm") runs from 11:47 pm to 8:00 am as you scroll, as it
does today. "Try FreeFlow free" becomes uppercase text in a thin square border, still tracked.

## Constraints

- Next.js 16 app, inside the existing `DemoFunnel`. `/demo` stays canonical, and signed-out `/`
  renders the same component.
- The database only accepts the five job ids for events (`supabase/week6_venture.sql`).
  "Neutral" sends no job, and "Brayden's own" sends `video-editor`.
- No prices. Works with no database or AI key.
- **Reduced motion:** no drift and no smooth scroll. The hero shows the worries as a plain sorted
  list, the lines are drawn calm and still, the story line is already drawn, and "flows." is
  already filled.
- **Keyboard and screen readers:** the canvas is decorative (`aria-hidden`), and the same worries
  are in a visually hidden list. The job word is a real button with `aria-expanded`, and the
  swatches are real buttons with names. The keyboard-only "Sort it for me" does the full sort.
- **Phones (375 px):** no sideways scroll, the field works by touch drag without blocking page
  scroll, and the sorted rows fit on screen.

## My calls (overridable)

- GSAP + ScrollTrigger for scroll animation and Lenis for smooth scroll, as npm packages on /demo
  only. Smooth scroll is switched off under reduced motion.
- **The story keeps the full approved wording** from `lib/funnel/story.ts`, not the shortened
  text used in the prototype.
- **The handwritten "Brayden" signature is replaced** by the slash line plus "— Brayden", as in
  the prototype.
- **Repeated notes merge.** The 18 cards repeat the 9 worries, so when sorted, the two copies of
  each worry merge into one row (9 rows) instead of listing every worry twice.
- **Sorted rows use each worry's real status** (for example "Paid 04/11") rather than the
  prototype's fixed list.
- **The neutral worries are 9 picked from the jobs' lists**, matching the prototype's mix.
- **The red edge glow is retired.** Its tension now comes from the contour lines, and the morning
  light stays.
- **The launch-list form moves** from the morning chapter to directly under the end band.
- **"night_sorted" is tracked** the first time the field is fully sorted, by scroll or by the
  keyboard button.
- **While neutral, the unchanged game uses the designer's projects** (today's default), so it
  never goes blank.
- **The pick is remembered for the visit** (session storage, as today); a fresh visit starts
  neutral.
- **The colour wave on a pick stays** (already skipped under reduced motion), plus the job word
  sliding in.
- **Old chapter 1 code is removed:** `ChapterNight`, `JobPicker`, `Signature` and
  `lib/funnel/sorting.ts`, along with the tests that only checked them. The new hero gets its own
  tests.

## Left to the builder

Exact easing and timings, the canvas drawing details, row layout per screen width (the target is
3 columns on wide screens and 1 on phones), and how the pure logic is split into
`lib/funnel/*.ts` for plain-node tests.

## Done means

npm test, lint, build and `tsc` all pass. /demo and signed-out / are checked in Chrome on
desktop and at 375 px, with reduced motion on as well. All six picker choices work, and
keyboard-only use works. Then it's deployed and the live site is checked.
