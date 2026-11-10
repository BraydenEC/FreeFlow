"use client";

import { Caveat } from "next/font/google";
import { useEffect, useState } from "react";

/*
  "Brayden", writing itself in handwriting under the founder's story.

  A clip-path reveal over 1.4 s, left to right, when `signed` turns true (the
  story scrolled into view, or a hover or tap). Under prefers-reduced-motion
  it is simply shown already signed. No photo, by the owner's choice.
*/

const caveat = Caveat({ subsets: ["latin"], weight: "600" });

export default function Signature({ signed }: { signed: boolean }) {
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setCalm(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const shown = signed || calm;

  return (
    <div className="mt-5">
      <p
        aria-label="Signed, Brayden"
        className={`${caveat.className} text-[64px] leading-none text-white`}
        style={{
          clipPath: shown ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
          transition: calm ? "none" : "clip-path 1.4s ease-in-out",
        }}
      >
        Brayden
      </p>
      <div aria-hidden className="bg-hairline mt-1 h-px w-52" />
    </div>
  );
}
