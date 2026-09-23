import { checks } from "./monitor-checks.mjs";
import fs from "node:fs";

const origin = process.env.FAMILYBOARD_ORIGIN || "https://familyboard.win";
const redirects = new Map(
  fs.readFileSync(new URL("../public/_redirects", import.meta.url), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts.length >= 3 && parts[2] === "301")
    .map(([from, to]) => [from, to]),
);


let failed = false;

for (const check of checks) {
  const url = new URL(check.path, origin);

  try {
    const redirectTarget = redirects.get(check.path);
    if (redirectTarget) {
      const response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(20_000),
        headers: { "user-agent": "FamilyBoard-Live-Monitor/1.0" },
      });
      const location = response.headers.get("location");
      const actualTarget = location ? new URL(location, url).pathname : "";
      const ok = response.status === 301 && actualTarget === redirectTarget;

      console.log(`${ok ? "PASS" : "FAIL"} ${response.status} ${url}`);
      if (!ok) console.error(`  redirect: expected ${redirectTarget}, got ${location || "none"}`);
      failed ||= !ok;
      continue;
    }

    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
      headers: { "user-agent": "FamilyBoard-Live-Monitor/1.0" },
    });
    const body = await response.text();
    const missing = check.require.filter((token) => !body.includes(token));
    const present = (check.forbid || []).filter((token) => body.includes(token));
    const actualLocs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort();
    const sitemapMismatch = check.exactLocs
      ? JSON.stringify(actualLocs) !== JSON.stringify(check.exactLocs)
      : false;
    const ok = response.ok && missing.length === 0 && present.length === 0 && !sitemapMismatch;

    console.log(`${ok ? "PASS" : "FAIL"} ${response.status} ${url}`);
    if (missing.length) console.error(`  missing: ${missing.join(", ")}`);
    if (present.length) console.error(`  forbidden: ${present.join(", ")}`);
    if (sitemapMismatch) console.error("  sitemap URL set differs from the reviewed manifest");
    failed ||= !ok;
  } catch (error) {
    failed = true;
    console.error(`FAIL ${url}: ${error.message}`);
  }
}

if (failed) process.exit(1);
