"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { DEFAULT_JOB, JOBS, JOB_ORDER, type JobId } from "@/lib/funnel/jobs";

/*
  The visitor's kind of work, for the whole /demo funnel.

  Picking a job re-colours the funnel's accent (--job, one of the job tokens
  in app/globals.css) and swaps every example to that job's world. A wave of
  the new colour spreads from where they clicked, except under
  prefers-reduced-motion, where the colour simply changes. The choice lasts
  for the visit (sessionStorage, wrapped: blocked storage just means the
  default next time).
*/

type JobContextValue = {
  job: JobId;
  setJob: (j: JobId, origin?: { x: number; y: number }) => void;
};

const JobCtx = createContext<JobContextValue>({ job: DEFAULT_JOB, setJob: () => {} });

export const useJob = () => useContext(JobCtx);

type Wave = { key: number; x: number; y: number; color: string };

const isJob = (v: unknown): v is JobId => typeof v === "string" && (JOB_ORDER as string[]).includes(v);

export function JobProvider({ children }: { children: React.ReactNode }) {
  const [job, setJobState] = useState<JobId>(DEFAULT_JOB);
  const [wave, setWave] = useState<Wave | null>(null);
  const waveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore the visit's choice after mount, so server and client first render agree.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.sessionStorage.getItem("ff_job");
    } catch {
      stored = null;
    }
    if (isJob(stored) && stored !== DEFAULT_JOB) setJobState(stored); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => () => {
    if (waveTimer.current) clearTimeout(waveTimer.current);
  }, []);

  const setJob = (j: JobId, origin?: { x: number; y: number }) => {
    setJobState(j);
    try {
      window.sessionStorage.setItem("ff_job", j);
    } catch {
      // Not remembered for the visit; fine.
    }
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (origin && !calm) {
      setWave({ key: Date.now(), x: origin.x, y: origin.y, color: `var(${JOBS[j].accentVar})` });
      if (waveTimer.current) clearTimeout(waveTimer.current);
      waveTimer.current = setTimeout(() => setWave(null), 950);
    }
  };

  return (
    <JobCtx.Provider value={{ job, setJob }}>
      <div style={{ "--job": `var(${JOBS[job].accentVar})` } as React.CSSProperties} className="relative">
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
