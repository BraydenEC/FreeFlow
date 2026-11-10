/*
  Week 6 external testing, as shown on /docs and the /dashboard public tab.

  Both lists stay empty until five real testers have used FreeFlow (plan Task
  15). Nothing goes in here that a tester did not actually find or ask for, and
  testers are never named.
*/

export type BugRecord = { id: string; found: string; fixed: boolean };

export const BUGS: BugRecord[] = [];

export const TESTER_REQUESTS: string[] = [];
