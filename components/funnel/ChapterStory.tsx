"use client";

import { useEffect, useRef, useState } from "react";
import { STORY } from "@/lib/funnel/story";
import { track } from "@/lib/funnel/track";
import { useJob } from "@/components/funnel/JobContext";
import Signature from "@/components/funnel/Signature";

/*
  /demo chapter 3, 1 am: quiet. (Story and purpose.)

  The founder's story in the first person, the mission and the promise to keep
  listening. It ends unsigned; "Brayden" writes itself when the story scrolls
  into view, or on hover or tap, then the P.S. Reading it to the end is
  recorded once as an anonymous "story_complete".
*/

export default function ChapterStory() {
  const { job } = useJob();
  const [signed, setSigned] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSigned(true);
        if (!tracked.current) {
          tracked.current = true;
          track("story_complete", job);
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [job]);

  const [psLabel, psEmail] = STORY.ps.split(": ");

  return (
    <section id="story" aria-labelledby="story-title" className="py-20">
      <div className="mx-auto max-w-[640px]">
        <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">Chapter 3</p>
        <h2 id="story-title" className="sr-only">
          Why I built FreeFlow
        </h2>
        <div className="mt-4 flex flex-col gap-5 text-lg leading-[1.75] text-[#d4d4d4]">
          {STORY.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <p className="font-medium text-white">
            {STORY.mission} {STORY.promise}
          </p>
        </div>
        <div ref={endRef} onPointerEnter={() => setSigned(true)} onClick={() => setSigned(true)}>
          <Signature signed={signed} />
        </div>
        <p className="text-ink-muted mt-4 text-sm">
          {psLabel}:{" "}
          <a href={`mailto:${psEmail}`} className="text-white underline-offset-4 hover:underline">
            {psEmail}
          </a>
        </p>
      </div>
    </section>
  );
}
