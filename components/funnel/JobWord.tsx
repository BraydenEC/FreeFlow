"use client";

import { useEffect, useRef, useState } from "react";
import { CHOICE_ORDER, choiceAccentVar, choiceName, choiceWord } from "@/lib/funnel/choice";
import { useJob } from "@/components/funnel/JobContext";

/*
  The job word in the /demo headline is the picker: "I'm a freelancer," with
  a dotted underline and a small caret. Tapping it opens "What do you do?"
  with six swatches (the five jobs and Brayden's own); each says its name on
  hover or focus. Escape, a tap outside or a pick closes it, and focus goes
  back to the word. Square edges, like the rest of the new front page.
*/

export default function JobWord() {
  const { choice, setChoice } = useJob();
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(0);
  const wordRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !wordRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        wordRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span className="relative inline-block">
      <button
        ref={wordRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="job-picker"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex cursor-pointer items-baseline gap-[0.08em] border-b-2 border-dotted border-[color-mix(in_srgb,var(--job)_70%,transparent)] leading-[0.9] focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-[var(--job)]"
      >
        <em
          key={entered}
          className="font-[family-name:var(--font-display-serif)] font-normal text-[var(--job)] normal-case motion-safe:animate-[job-word-in_0.5s_cubic-bezier(0.2,0.9,0.2,1)]"
        >
          {choiceWord(choice)}
        </em>
        <span
          aria-hidden
          className="translate-y-[-0.9em] text-[0.22em] font-semibold text-[var(--job)] motion-safe:transition-transform"
          style={{ rotate: open ? "180deg" : "0deg" }}
        >
          ↓
        </span>
      </button>
      <span
        ref={panelRef}
        id="job-picker"
        role="group"
        aria-label="What do you do?"
        hidden={!open}
        className="absolute top-[calc(100%+14px)] left-0 z-30 flex flex-col gap-2.5 border border-[#2a2a2a] bg-[#0d0d0df2] px-4 pt-3.5 pb-6 text-xs font-medium tracking-normal whitespace-nowrap normal-case backdrop-blur-md [&[hidden]]:hidden"
      >
        <span className="text-ink-muted text-[10px] font-semibold tracking-[0.14em] uppercase">What do you do?</span>
        <span className="flex gap-2">
          {CHOICE_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c === "brayden" ? "Brayden's own (video editor)" : choiceName(c)}
              aria-pressed={choice === c}
              onClick={(e) => {
                setChoice(c, { x: e.clientX, y: e.clientY });
                setEntered((n) => n + 1);
                setOpen(false);
                wordRef.current?.focus({ preventScroll: true });
              }}
              className={`group relative grid size-[34px] cursor-pointer place-items-center rounded-full border-2 focus-visible:outline-2 focus-visible:outline-white ${choice === c ? "border-white" : "border-transparent"}`}
            >
              <i
                className="block size-5 rounded-full"
                style={{
                  background: `var(${choiceAccentVar(c)})`,
                  boxShadow: c === "brayden" ? `inset 0 0 0 2px #0a0a0a, 0 0 0 1px var(${choiceAccentVar(c)})` : undefined,
                }}
              />
              <span className="text-ink-muted pointer-events-none absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:transition-opacity">
                {choiceName(c)}
              </span>
            </button>
          ))}
        </span>
      </span>
    </span>
  );
}
