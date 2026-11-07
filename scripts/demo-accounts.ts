/*
  Creates, resets or removes the grader demo accounts on the live project.

  Run it yourself, in your own terminal window:

    npm run demo:accounts                 three accounts, skipping any that exist
    npm run demo:accounts -- --count 5    more accounts
    npm run demo:accounts -- --reset      new passwords and fresh sample projects
    npm run demo:accounts -- --delete     remove every grader account and its data

  It asks for the project URL and the secret (service_role) key, both from
  Supabase → Project Settings → API. The key is held in memory for this run and
  never written anywhere. Logins go to demo-accounts.local.md, which git ignores:
  this repository is public, so they must never be committed.
*/

import { appendFileSync, chmodSync } from "node:fs";
import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";
import {
  credentialsBlock,
  isDemoEmail,
  isProjectUrl,
  provision,
  removeAll,
  type DemoStore,
} from "@/lib/demo/accounts";

const OUTPUT = "demo-accounts.local.md";

function ask(question: string, hidden = false): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
    if (hidden) {
      (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = () => {};
    }
  });
}

function fail(message: string): never {
  console.error(`\n${message}`);
  process.exit(1);
}

function liveStore(url: string, key: string): DemoStore {
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return {
    async listUsers() {
      const all: { id: string; email: string }[] = [];
      const perPage = 1000;
      for (let page = 1; ; page++) {
        const { data, error } = await db.auth.admin.listUsers({ page, perPage });
        if (error) throw new Error(error.message);
        all.push(...data.users.map((u) => ({ id: u.id, email: u.email ?? "" })));
        if (data.users.length < perPage) return all;
      }
    },
    async createUser(email, password) {
      if (!isDemoEmail(email)) throw new Error("refusing a non-demo address");
      const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
      if (error) throw new Error(error.message);
      return data.user.id;
    },
    async setPassword(id, password) {
      const { error } = await db.auth.admin.updateUserById(id, { password });
      if (error) throw new Error(error.message);
    },
    async replaceProjects(id, rows) {
      const cleared = await db.from("projects").delete().eq("user_id", id);
      if (cleared.error) throw new Error(cleared.error.message);
      const added = await db.from("projects").insert(rows.map((r) => ({ ...r, user_id: id })));
      if (added.error) throw new Error(added.error.message);
    },
    async deleteUser(id) {
      const { error } = await db.auth.admin.deleteUser(id);
      if (error) throw new Error(error.message);
    },
  };
}

const args = process.argv.slice(2);
const reset = args.includes("--reset");
const remove = args.includes("--delete");
const countAt = args.indexOf("--count");
const count = countAt === -1 ? 3 : Number(args[countAt + 1]);
if (!Number.isInteger(count) || count < 1 || count > 20) fail("--count must be a number from 1 to 20.");
if (reset && remove) fail("Choose --reset or --delete, not both.");

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? (await ask("Supabase project URL: "))).trim();
if (!isProjectUrl(url)) fail("That isn't a project URL. It looks like https://abcdefgh.supabase.co");
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? (await ask("Secret key (hidden as you type): ", true))).trim();
if (!key) fail("No key entered.");

const store = liveStore(url, key);

try {
  if (remove) {
    const confirm = await ask("Delete every grader account, with its projects and tickets? Type delete: ");
    if (confirm !== "delete") fail("Nothing deleted.");
    const removed = await removeAll(store);
    console.log(removed.length ? `Removed: ${removed.join(", ")}` : "No grader accounts found.");
  } else {
    const today = new Date().toISOString().slice(0, 10);
    const logins = await provision(store, { count, today, reset });
    if (logins.length === 0) {
      console.log("Nothing to do: those accounts already exist. Use --reset for new passwords and fresh samples.");
    } else {
      appendFileSync(OUTPUT, credentialsBlock(logins, today) + "\n");
      chmodSync(OUTPUT, 0o600);
      console.log(`Done: ${logins.map((l) => l.email).join(", ")}`);
      console.log(`Logins saved to ${OUTPUT}. Git ignores that file; keep it out of the repository.`);
    }
  }
} catch (e) {
  fail(`Stopped: ${(e as Error).message}\nAccounts made before this point have no saved login. Fix the cause, then run again with --reset.`);
}
