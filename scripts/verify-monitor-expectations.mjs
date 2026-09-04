// Verifies every live-monitor expectation against the freshly built dist/ output.
//
// Why this exists: the live monitor asserts literal strings on the production site.
// When a page's wording changes — or when an expectation is written from a draft that
// never shipped — the monitor turns red and stays red. A permanently red health check
// is worse than none: a real outage hides inside the noise. This script catches the
// same mismatch at PR time, offline, before anything is deployed.

import fs from "node:fs/promises";
import path from "node:path";
import { checks } from "./monitor-checks.mjs";

const distRoot = path.join(process.cwd(), "dist");

function distFileFor(urlPath) {
  const clean = urlPath.replace(/^\//, "");
  if (urlPath.endsWith("/")) return path.join(distRoot, clean, "index.html");
  return path.join(distRoot, clean);
}

const failures = [];
let checked = 0;

for (const check of checks) {
  const file = distFileFor(check.path);
  let body;

  try {
    body = await fs.readFile(file, "utf8");
  } catch {
    failures.push({ path: check.path, reason: `no built file at ${path.relative(distRoot, file)}` });
    continue;
  }

  checked += 1;
  const missing = check.require.filter((token) => !body.includes(token));
  const present = (check.forbid || []).filter((token) => body.includes(token));

  if (missing.length) failures.push({ path: check.path, reason: `missing: ${missing.join(" | ")}` });
  if (present.length) failures.push({ path: check.path, reason: `forbidden present: ${present.join(" | ")}` });
}

console.log(`Checked ${checked} of ${checks.length} monitor expectations against dist/.`);

if (failures.length) {
  console.error(`\n${failures.length} expectation(s) do not match the built output:\n`);
  for (const failure of failures) console.error(`  ${failure.path}\n    ${failure.reason}`);
  console.error(
    "\nEither the page wording changed (update scripts/monitor-checks.mjs) or the page " +
      "regressed (fix the content). Do not delete the expectation to get green.",
  );
  process.exit(1);
}

console.log("All live-monitor expectations match the built output.");
