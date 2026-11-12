# /demo redesign: decisions so far (working notes, 2026-11-12)

Draft notes from the brainstorm, not yet the approved design. The game is still being
brainstormed; the full design document comes after it.

**Approved prototype to build from:** `.superpowers/brainstorm/14321-1794510973/content/neutral-start.html`
(git-ignored; copy kept alongside earlier rounds).

## Owner's decisions (his words in quotes)

- **Inspiration:** landonorris.com, made his own. The front screen should not feel like "a
  generic page generated in the same typical claude format". React plus animation add-ons.
- **Hero (prototype B, "Current"):** chosen as "the most unique". The visitor's worries
  drift as note cards; the mouse or finger is a current that pushes them; scrolling pulls
  them into neat FreeFlow rows with ✓ and what FreeFlow did; an "on your mind" counter
  drops to zero.
- **Background (prototype A):** contour lines across the whole page, tangled at the top,
  calming into waves as you scroll.
- **After the hero:** a pinned "NOW IT ALL *flows.*" screen (version 2, "Glow": NOW IT ALL
  tightens into place, *flows.* fills with colour like ink).
- **Ending (version 3, "Band"):** full-width band "START FREE · *now →*" between hairlines;
  on hover the colour rises through the band. "It stands out, hard to miss." No rounded
  "Claude Code typical" buttons anywhere; top-right link is plain text.
- **Calmer top:** owner agreed the first screen was too much. Kept the hook; the job word is
  the picker (tap it to open the colours); counter appears once scrolling starts; "Sort it
  for me" only for keyboard users.
- **Worries below the hook:** fewer (18) and only in the space under the headline.
- **Headline wrap:** the job word and its comma never split across lines.
- **Neutral start:** the page opens in a soft warm grey (#c9c6bf) as "I'M A *freelancer*",
  with a general mix of worries and no job selected. Picking a job gives "I'M A FREELANCE
  *job*" in that job's colour.
- **His own colour:** a sixth swatch, "Brayden's own", neutral grey (#a3a3a3), which shows
  his night as a video editor (mockup 1).
- **Story:** the original loose "slash" line from prototype A, moved **below** the
  statement (not through it), blended: behind the text, softer, translucent, in the page
  colour, drawing itself on scroll; "— Brayden" under it.

## My calls so far (stated to the owner, open to override)

- GSAP + ScrollTrigger for scroll animation, Lenis for smooth scroll, inside the existing
  Next.js/React app.
- Reduced motion: sorted list, calm lines, finished line, no drift.

## Still open

- The game (brainstorming next).
- Whether chapters between the story and the end (walkthrough, "You said, we changed",
  launch list) stay, and in what form, now that the page flows hero → flows → story → band.
