# Week 6 UX image prompt (for reference)

The course macro-prompt's "UX Image Generation Prompt" for Week 6, copied verbatim from the
Module 6 macro-prompts handout (page 2). Only this prompt text is reproduced; the handout
itself is course material and is not committed.

---

> Create a clean, modern UX mockup for a student-built web app page: Integrated Agentic
> Venture + Impact & Viability. The page should be practical, buildable in Next.js and
> Tailwind, and include clear sections for user input, AI/agent output, saved results,
> and testing evidence. Use a simple startup-product aesthetic. Avoid complex animations
> or expensive features.

---

## How Week 6 answers it

At the owner's request, the Week 6 mockup was **made by Claude as HTML and rendered to
PNG**, not drawn by an image generator. The rubric accepts "mockup or wireframe". The pages
are built from the throwaway prototypes the owner validated, so they match the planned
build rather than an image model's guess.

| Prompt asks for | Where it is in the mockup |
|---|---|
| User input | `/demo` chapter 1: pick your kind of work, sort the worries; the game's clicks and upgrades; the launch-list email field |
| AI/agent output | `/demo` chapter 2 ("Paste a brief" step, labelled as Claude with a fallback that you check); the agent map in `/docs` |
| Saved results | The FreeFlow panel's checked rows; `/dashboard` "Your work"; the "FreeFlow in public" counts |
| Testing evidence | `/docs` timeline (tests per week) and the testing summary row |

Where the prompt and the owner's direction differ, the owner's direction wins: `/demo` is a
scroll story with gentle motion, not a static dashboard. Every animation has a calm static
version under `prefers-reduced-motion`, and nothing in it needs a paid service.

Mockup sources: `docs/week6/mockup/*.html`. Rendered with `swift scripts/snap.swift`.
Images: `docs/week6/images/mockup-*.png`.
