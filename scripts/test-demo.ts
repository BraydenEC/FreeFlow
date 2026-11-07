/*
  Grader demo account tests.
  Run: npm run test:demo

  The script behind these runs against the live project with a key that
  bypasses every RLS policy, so the failures worth catching are the ones that
  touch someone else: the owner's account, a real user's projects, or a
  grader's work wiped by a second run. The network is the only thing faked.
*/

import {
  demoEmail,
  isDemoEmail,
  isProjectUrl,
  credentialsBlock,
  provision,
  removeAll,
  sampleProjects,
  type DemoStore,
} from "@/lib/demo/accounts";

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}${detail ? "  —  " + detail : ""}`);
  }
}

type FakeUser = { id: string; email: string; password: string };

function fakeStore(initial: FakeUser[] = []) {
  const users = [...initial];
  const projects = new Map<string, Record<string, unknown>[]>();
  const store: DemoStore = {
    async listUsers() {
      return users.map(({ id, email }) => ({ id, email }));
    },
    async createUser(email, password) {
      const user = { id: `u-${users.length + 1}`, email, password };
      users.push(user);
      return user.id;
    },
    async setPassword(id, password) {
      users.find((u) => u.id === id)!.password = password;
    },
    async replaceProjects(id, rows) {
      projects.set(id, rows);
    },
    async deleteUser(id) {
      users.splice(users.findIndex((u) => u.id === id), 1);
      projects.delete(id);
    },
  };
  return { store, users, projects };
}

const TODAY = "2026-11-20";
const owner: FakeUser = { id: "owner", email: "owner@elsewhere.test", password: "owner-password" };

console.log("\nWhich accounts count as demo accounts");
assert("numbered address is a demo account", isDemoEmail("grader2@freeflow.website"));
assert("the generator's own output is recognised", isDemoEmail(demoEmail(7)));
assert("a real user is not", !isDemoEmail("braydencredeur@gmail.com"));
assert("no number, not a demo account", !isDemoEmail("grader@freeflow.website"));
assert("a lookalike domain is not", !isDemoEmail("grader1@freeflow.website.evil.test"));
assert("a prefix before the name is not", !isDemoEmail("xgrader1@freeflow.website"));

console.log("\nWhere the secret key may be sent");
assert("a Supabase project URL is accepted", isProjectUrl("https://abcdefgh.supabase.co"));
assert("plain http is refused", !isProjectUrl("http://abcdefgh.supabase.co"));
assert("a lookalike host is refused", !isProjectUrl("https://abcdefgh.supabase.co.evil.test"));
assert("a non-URL is refused", !isProjectUrl("abcdefgh"));

console.log("\nSample projects");
const rows = sampleProjects(TODAY);
assert("every project is labelled as a sample", rows.every((r) => String(r.name).startsWith("Sample:")));
assert("something is overdue, so the alert shows", rows.some((r) => r.status === "overdue" && !r.is_paid));
assert("something is awaiting payment", rows.some((r) => r.status === "invoice_sent" && !r.is_paid));
assert("something is live, so Active Projects isn't zero", rows.some((r) => r.status === "in_progress" && !r.is_paid));
assert("something was paid this month, so earnings show", rows.some((r) => r.is_paid && String(r.paid_at).startsWith("2026-11")));
assert("a company client, so retenciones show", rows.some((r) => r.client_tax_type === "persona_moral"));
assert("both billing models appear", rows.some((r) => r.invoice_total === null) && rows.some((r) => r.invoice_total !== null));
assert("paid projects always carry a date (database rule)", rows.every((r) => r.is_paid === (r.paid_at !== null)));
const firstOfMonth = sampleProjects("2026-11-01").find((r) => r.is_paid);
assert("on the 1st, the payment still lands in this month", String(firstOfMonth?.paid_at).startsWith("2026-11"), String(firstOfMonth?.paid_at));

console.log("\nFirst run");
{
  const { store, users, projects } = fakeStore([owner]);
  const made = await provision(store, { count: 3, today: TODAY });
  assert("creates three accounts", made.length === 3 && users.length === 4);
  assert("uses the numbered addresses", made.map((m) => m.email).join() === [1, 2, 3].map(demoEmail).join());
  assert("each password is different", new Set(made.map((m) => m.password)).size === 3);
  assert("passwords are long", made.every((m) => m.password.length >= 20));
  assert("each account gets sample projects", users.filter((u) => u.id !== "owner").every((u) => (projects.get(u.id) ?? []).length === rows.length));
  assert("the owner gets none", !projects.has("owner"));
  assert("the owner's password is untouched", owner.password === "owner-password");
}

console.log("\nSecond run");
{
  const { store, users, projects } = fakeStore([owner]);
  const first = await provision(store, { count: 2, today: TODAY });
  const graderOne = users.find((u) => u.email === demoEmail(1))!;
  const theirWork = [{ name: "grader's own project" }];
  projects.set(graderOne.id, theirWork);
  const before = graderOne.password;

  const again = await provision(store, { count: 2, today: TODAY });
  assert("nothing new to report", again.length === 0);
  assert("a grader's password survives", graderOne.password === before);
  assert("a grader's work survives", projects.get(graderOne.id) === theirWork);
  assert("no duplicate accounts", users.length === 3);

  const more = await provision(store, { count: 3, today: TODAY });
  assert("raising the count adds only the missing account", more.length === 1 && more[0].email === demoEmail(3));
  assert("and still leaves the others alone", projects.get(graderOne.id) === theirWork);

  const reset = await provision(store, { count: 2, today: TODAY, reset: true });
  assert("reset reports new logins", reset.length === 2 && reset[0].password !== first[0].password);
  assert("reset really changes the password", graderOne.password === reset[0].password);
  assert("reset restores the sample projects", projects.get(graderOne.id)?.length === rows.length);
  assert("reset leaves the owner alone", owner.password === "owner-password" && !projects.has("owner"));
}

console.log("\nRemoving them");
{
  const { store, users } = fakeStore([owner, { id: "real", email: "client@elsewhere.test", password: "x" }]);
  await provision(store, { count: 3, today: TODAY });
  const removed = await removeAll(store);
  assert("removes every demo account", removed.length === 3);
  assert("keeps everyone else", users.map((u) => u.id).join() === "owner,real");
}

console.log("\nFailures and output");
{
  const { store } = fakeStore();
  store.replaceProjects = async () => {
    throw new Error("insert refused");
  };
  let message = "";
  try {
    await provision(store, { count: 1, today: TODAY });
  } catch (e) {
    message = (e as Error).message;
  }
  assert("a failed seed names the account and the cause", message.includes(demoEmail(1)) && message.includes("insert refused"), message);
}
{
  const block = credentialsBlock([{ email: demoEmail(1), password: "pw-one" }], TODAY);
  assert("the output lists each login", block.includes(demoEmail(1)) && block.includes("pw-one"));
  assert("the output says where to sign in", block.includes("https://www.freeflow.website/login"));
}

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
