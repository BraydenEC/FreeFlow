"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { DEFAULT_JOB, type JobId } from "@/lib/funnel/jobs";
import { DEFAULT_CHOICE, choiceAccentVar, contentJob, isChoice, jobForChoice, type Choice } from "@/lib/funnel/choice";

/*
  What the visitor picked with the job word, for the whole /demo funnel.

  The page starts neutral. A pick re-colours the funnel's accent (--job) and
  swaps the examples to that world. A wave of the new colour spreads from
  where they clicked, except under prefers-reduced-motion, where the colour
  simply changes. The pick lasts for the visit in session storage; blocked
  storage just means a neutral start next time.

  `job` is the job whose examples to show (the default job while neutral);
  `trackJob` is what an event may carry (nothing while neutral).
*/

type JobContextValue = {
  choice: Choice;
  setChoice: (c: Choice, origin?: { x: number; y: number }) => void;
  job: JobId;
  trackJob: JobId | undefined;
};

const JobCtx = createContext<JobContextValue>({
  choice: DEFAULT_CHOICE,
  setChoice: () => {},
  job: DEFAULT_JOB,
  trackJob: undefined,
});

export const useJob = () => useContext(JobCtx);

type Wave = { key: number; x: number; y: number; color: string };

export function JobProvider({ children }: { children: React.ReactNode }) {
  const [choice, setChoiceState] = useState<Choice>(DEFAULT_CHOICE);
  const [wave, setWave] = useState<Wave | null>(null);
  const waveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore the visit's pick after mount, so server and client first render agree.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.sessionStorage.getItem("ff_job");
    } catch {
      stored = null;
    }
    if (isChoice(stored) && stored !== DEFAULT_CHOICE) setChoiceState(stored); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => () => {
    if (waveTimer.current) clearTimeout(waveTimer.current);
  }, []);

  const setChoice = (c: Choice, origin?: { x: number; y: number }) => {
    setChoiceState(c);
    try {
      window.sessionStorage.setItem("ff_job", c);
    } catch {
      // Not remembered for the visit; fine.
    }
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (origin && !calm) {
      setWave({ key: Date.now(), x: origin.x, y: origin.y, color: `var(${choiceAccentVar(c)})` });
      if (waveTimer.current) clearTimeout(waveTimer.current);
      waveTimer.current = setTimeout(() => setWave(null), 950);
    }
  };

  const value: JobContextValue = {
    choice,
    setChoice,
    job: contentJob(choice),
    trackJob: jobForChoice(choice) ?? undefined,
  };

  return (
    <JobCtx.Provider value={value}>
      <div style={{ "--job": `var(${choiceAccentVar(choice)})` } as React.CSSProperties} className="relative">
        {wave && (
          <span
            key={wave.key}
            aria-hidden
            className="pointer-events-none fixed z-0 size-[300vmax] animate-[job-wave_0.9s_ease-out_forwards] rounded-full opacity-20"
            style={{ left: wave.x, top: wave.y, background: wave.color }}
          />
        )}
        {children}
      </div>
    </JobCtx.Provider>
  );
}
