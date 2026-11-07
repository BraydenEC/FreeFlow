import { randomBytes } from "node:crypto";
import { NewProjectSchema, toRow, type NewProjectInput } from "@/lib/projects/schema";

/*
  Grader demo accounts: who they are and what they start with.

  /chat is signed-in only, so each grader gets a login of their own and can't
  see or disturb another's work. Real sign-ups still start empty; only these
  accounts get sample projects, and each one is labelled "Sample:".

  Used by scripts/demo-accounts.ts, which holds a key that bypasses RLS. Every
  action here goes through isDemoEmail, so no other account can be reached.
*/

const DEMO_EMAIL = /^grader[1-9]\d*@freeflow\.website$/;

export function demoEmail(n: number): string {
  return `grader${n}@freeflow.website`;
}

export function isDemoEmail(email: string): boolean {
  return DEMO_EMAIL.test(email);
}

/** The secret key is only ever sent to a real Supabase project over https. */
export function isProjectUrl(value: string): boolean {
  return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(value);
}

export type DemoLogin = { email: string; password: string };

export type DemoStore = {
  listUsers(): Promise<{ id: string; email: string }[]>;
  createUser(email: string, password: string): Promise<string>;
  setPassword(id: string, password: string): Promise<void>;
  replaceProjects(id: string, rows: Record<string, unknown>[]): Promise<void>;
  deleteUser(id: string): Promise<void>;
};

function addDays(today: string, days: number): string {
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/*
  One of everything the dashboard reacts to, with dates relative to the day the
  script runs: live work, an overdue alert, money due, money paid this month, a
  company client for retenciones, and both billing models.
*/
export function sampleProjects(today: string): Record<string, unknown>[] {
  const open: NewProjectInput[] = [
    { name: "Sample: Brand refresh", client: "Casa Norte", status: "in_progress", deadline: addDays(today, 10), billing: "fixed", invoice_total: 2400, client_tax_type: "persona_moral", payment_terms_days: 30 },
    { name: "Sample: Website build", client: "Taller Luz", status: "in_progress", deadline: addDays(today, 21), billing: "hourly", hours_logged: 38, hourly_rate: 60, client_tax_type: "persona_fisica" },
    { name: "Sample: Product photos", client: "Mercado Sur", status: "awaiting_review", deadline: addDays(today, 5), billing: "fixed", invoice_total: 900 },
    { name: "Sample: Annual report design", client: "Fundacion Rio", status: "contracted", deadline: addDays(today, 45), billing: "fixed", invoice_total: 3200, contract_signed_on: addDays(today, -3) },
    { name: "Sample: Landing page copy", client: "Kilo Studio", status: "invoice_sent", deadline: addDays(today, -6), billing: "fixed", invoice_total: 650, payment_terms_days: 30 },
    { name: "Sample: Logo package", client: "Cafe Alba", status: "overdue", deadline: addDays(today, -12), billing: "fixed", invoice_total: 1200 },
  ];
  const parse = (p: NewProjectInput) => toRow(NewProjectSchema.parse(p));

  const firstOfMonth = `${today.slice(0, 7)}-01`;
  const threeDaysAgo = addDays(today, -3);
  const paid = {
    ...parse({ name: "Sample: Pitch deck", client: "Orbita Labs", status: "invoice_sent", deadline: addDays(today, -15), billing: "fixed", invoice_total: 1500 }),
    is_paid: true,
    paid_at: threeDaysAgo < firstOfMonth ? firstOfMonth : threeDaysAgo,
  };
  return [...open.map(parse), paid];
}

function newPassword(): string {
  return randomBytes(18).toString("base64url");
}

/*
  Creates whichever of the numbered accounts don't exist yet. An existing
  account is left exactly as it is unless `reset` is set, so running this again
  can't wipe a grader's work or invalidate a login already handed out.
  Returns only the logins set by this run.
*/
export async function provision(
  store: DemoStore,
  opts: { count: number; today: string; reset?: boolean },
): Promise<DemoLogin[]> {
  const existing = await store.listUsers();
  const logins: DemoLogin[] = [];

  for (let n = 1; n <= opts.count; n++) {
    const email = demoEmail(n);
    const found = existing.find((u) => u.email === email);
    if (found && !opts.reset) continue;

    const password = newPassword();
    try {
      const id = found ? found.id : await store.createUser(email, password);
      if (found) await store.setPassword(id, password);
      await store.replaceProjects(id, sampleProjects(opts.today));
    } catch (e) {
      throw new Error(`${email}: ${(e as Error).message}`);
    }
    logins.push({ email, password });
  }
  return logins;
}

/** Deletes every demo account, whatever the count was. Returns their addresses. */
export async function removeAll(store: DemoStore): Promise<string[]> {
  const targets = (await store.listUsers()).filter((u) => isDemoEmail(u.email));
  for (const user of targets) await store.deleteUser(user.id);
  return targets.map((u) => u.email);
}

/** The block saved for the owner to copy into the submission. */
export function credentialsBlock(logins: DemoLogin[], today: string): string {
  const lines = logins.map((l) => `| ${l.email} | ${l.password} |`);
  return [
    `## Set on ${today}`,
    "",
    "Sign in at https://www.freeflow.website/login",
    "",
    "| Email | Password |",
    "|---|---|",
    ...lines,
    "",
  ].join("\n");
}
