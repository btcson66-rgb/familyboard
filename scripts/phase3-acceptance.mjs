import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const distRoot = resolve("dist");
const reviewDate = "2026-09-24";
const reopened = new Map([
  ["power-outage-home-preparedness", "household-power-outage-event-log"],
  ["storm-preparation-home-checklist", "household-storm-readiness-review"],
  ["emergency-supply-inventory", "emergency-supply-inventory-audit"],
  ["organize-utility-account-information", "household-utility-provider-service-handoff-log"],
  ["move-out-home-records", "move-out-condition-record-generator"],
  ["home-care-service-complaint-resolution", "home-care-complaint-response-resolution-log"],
]);
const newSlug = "year-end-cleaning-checklist";
const requiredRoutes = [
  ...[...reopened.keys()].map((slug) => `/zh-tw/guides/${slug}/`),
  `/zh-tw/checklists/${newSlug}/`,
];
const duplicateRoutes = [
  "/zh-tw/tools/household-storm-readiness-review/",
  "/zh-tw/tools/emergency-supply-inventory-audit/",
  "/zh-tw/tools/household-power-outage-event-log/",
];

function routeToFile(route) {
  return join(distRoot, route.replace(/^\//, ""), "index.html");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function assertEditorialSource(slug, workbenchSlug, section) {
  const file = join("src", "content", "pages-zh-tw", `${slug}.md`);
  const markdown = await readFile(file, "utf8");
  assert(markdown.includes(`lastReviewedAt: "${reviewDate}"`), `${file} has the wrong review date.`);
  assert(markdown.includes(`workbenchSlug: "${workbenchSlug}"`), `${file} has the wrong embedded workbench.`);
  assert(markdown.includes("## 這份指南不做什麼") || markdown.includes("## 這份清單不做什麼"), `${file} is missing its explicit non-goals.`);
  assert((markdown.match(new RegExp(`查核日期[：\\s]+${reviewDate}`, "g")) || []).length >= 2, `${file} needs at least two dated source checks.`);
  assert((markdown.match(/https:\/\//g) || []).length >= 2, `${file} needs at least two official source URLs.`);
  assert(/^\|[^\n]+\|\r?\n\|\s*:?-{3,}/m.test(markdown), `${file} is missing a compact printable table.`);
  assert(!markdown.includes("](/zh-tw/tools/"), `${file} links from an indexable page to a noindex tool.`);
  assert(markdown.includes(section), `${file} is missing its source/review section.`);
}

for (const [slug, workbenchSlug] of reopened) {
  await assertEditorialSource(slug, workbenchSlug, "## 官方來源與本次查核");
}
await assertEditorialSource(newSlug, "cleaning-schedule-generator", "## 官方來源與本次查核");

const policy = JSON.parse(await readFile("src/config/indexability-policy.json", "utf8"));
assert(policy.indexableRoutes.length === 109, `Expected 109 indexable routes, found ${policy.indexableRoutes.length}.`);
assert(new Set(policy.indexableRoutes).size === 109, "Indexability policy contains duplicate routes.");
for (const route of requiredRoutes) assert(policy.indexableRoutes.includes(route), `${route} is missing from indexability policy.`);
for (const route of duplicateRoutes) assert(!policy.indexableRoutes.includes(route), `${route} duplicate must remain noindex.`);
assert(!policy.indexableRoutes.some((route) => /familyboard-.*-tutorial/.test(route)), "A product tutorial route entered the indexable policy.");

const generated = JSON.parse(await readFile("src/generated/sitemap-pages.json", "utf8"));
const generatedIndexable = generated.filter((item) => item.indexable && !item.redirectTo).map((item) => item.route).sort();
assert(JSON.stringify(generatedIndexable) === JSON.stringify([...policy.indexableRoutes].sort()), "Generated sitemap manifest does not exactly match indexability policy.");

for (const route of requiredRoutes) {
  const html = await readFile(routeToFile(route), "utf8");
  assert(html.includes('<meta name="robots" content="index,follow,'), `${route} is not index,follow.`);
  assert(html.includes(`<link rel="canonical" href="https://familyboard.win${route}">`), `${route} has the wrong canonical.`);
  assert(html.includes("guide-workbench"), `${route} does not render the embedded workbench.`);
  assert(html.includes("儲存至 App"), `${route} does not render the save-to-App control.`);
  assert(/<table>/.test(html), `${route} does not render a printable table.`);
}

const powerHtml = await readFile(routeToFile("/zh-tw/guides/power-outage-home-preparedness/"), "utf8");
assert(powerHtml.includes('hreflang="zh-TW"') && powerHtml.includes('hreflang="en"'), "Power-outage guide lost reciprocal hreflang.");
const yearEndHtml = await readFile(routeToFile(`/zh-tw/checklists/${newSlug}/`), "utf8");
assert(!yearEndHtml.includes('rel="alternate" hreflang='), "Language-exclusive year-end checklist must not emit hreflang.");

for (const route of duplicateRoutes) {
  const html = await readFile(routeToFile(route), "utf8");
  assert(html.includes('<meta name="robots" content="noindex,follow">'), `${route} duplicate no longer has noindex,follow.`);
}

for (const route of ["/zh-tw/", "/zh-tw/checklists/"]) {
  const html = await readFile(routeToFile(route), "utf8");
  assert(html.includes(`/zh-tw/checklists/${newSlug}/`), `${route} is missing the year-end checklist link.`);
}

const css = await readFile("src/styles/global.css", "utf8");
assert(/tr[\s\S]*?break-inside:\s*avoid/.test(css), "Print CSS does not protect table rows from page breaks.");

console.log("Phase 3 acceptance: 109 policy routes; 6 reopened guides + 1 language-exclusive checklist; duplicates noindex; workbenches, sources, print tables, canonicals and hreflang verified.");
