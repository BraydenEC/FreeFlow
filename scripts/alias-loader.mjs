/*
  Minimal ESM resolve hook so plain `node` can import project modules that use
  the "@/..." path alias and extensionless specifiers.

  Exists because the filter tests need to execute the *real* application code
  rather than a copy of it. Copying the predicate into a test would test the
  copy, which for a week about the difference between an asserted result and a
  checked one would be self-defeating.

  No test framework and no bundler — a resolve hook is about twenty lines and
  this project has added one dependency in three weeks.
*/

import { pathToFileURL, fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const EXTENSIONS = [".ts", ".tsx", ".js", ".mjs"];

function resolveWithExtension(basePath) {
  if (existsSync(basePath) && path.extname(basePath)) return basePath;
  for (const ext of EXTENSIONS) {
    const candidate = basePath + ext;
    if (existsSync(candidate)) return candidate;
  }
  for (const ext of EXTENSIONS) {
    const candidate = path.join(basePath, "index" + ext);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const resolved = resolveWithExtension(
      path.join(ROOT, specifier.slice(2)),
    );
    if (resolved) return { url: pathToFileURL(resolved).href, shortCircuit: true };
  }

  if (specifier.startsWith(".") && context.parentURL) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    const resolved = resolveWithExtension(path.resolve(parentDir, specifier));
    if (resolved) return { url: pathToFileURL(resolved).href, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
