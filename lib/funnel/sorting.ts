import { JOBS, type JobId, type Worry } from "@/lib/funnel/jobs";

/*
  /demo chapter 1: the night's worries, as pure state.

  Worries spawn onto "your mind" from the job's list, up to nine at once. The
  visitor files them into FreeFlow one by one; after three, FreeFlow offers to
  handle the rest, which files everything and calms the night. When the list
  runs out it refills, so the worries keep coming until you let FreeFlow help.

  Each spawned worry gets its own instance id (`<worry id>#<n>`), so the same
  worry can come back after a refill without two items sharing a key.
*/

export const MAX_LIVE = 9;

export type SortState = {
  job: JobId;
  live: Worry[];
  filed: Worry[];
  queue: Worry[];
  calm: boolean;
  spawned: number;
};

export function startSort(job: JobId): SortState {
  return { job, live: [], filed: [], queue: [...JOBS[job].worries], calm: false, spawned: 0 };
}

const baseId = (w: Worry) => w.id.split("#")[0];

export function spawn(s: SortState): SortState {
  if (s.calm || s.live.length >= MAX_LIVE) return s;
  const onMind = new Set(s.live.map(baseId));
  let queue = s.queue.filter((w) => !onMind.has(w.id));
  if (queue.length === 0) queue = JOBS[s.job].worries.filter((w) => !onMind.has(w.id));
  if (queue.length === 0) return s;
  const [next, ...rest] = queue;
  const n = s.spawned + 1;
  return { ...s, live: [...s.live, { ...next, id: `${next.id}#${n}` }], queue: rest, spawned: n };
}

export function fileWorry(s: SortState, id: string): SortState {
  const w = s.live.find((x) => x.id === id);
  if (!w) return s;
  return { ...s, live: s.live.filter((x) => x.id !== id), filed: [...s.filed, w] };
}

export function handleRest(s: SortState): SortState {
  if (s.calm) return s;
  return { ...s, live: [], filed: [...s.filed, ...s.live], calm: true };
}

export function canOfferRest(s: SortState): boolean {
  return s.filed.length >= 3 && !s.calm;
}

export function stressLevel(s: SortState): number {
  return s.calm ? 0 : Math.min(s.live.length / MAX_LIVE, 1);
}
