import fs from "node:fs";
import path from "node:path";
import { countBodyWords } from "./lib/word-count.mjs";

const directory = path.resolve("src/content/pages");
const files = fs.readdirSync(directory).filter((file) => file.endsWith(".md"));
const minimumCorePages = 200;
const records = [];
const errors = [];
const hedgingPatterns = [
  "Do not invent a fixed universal interval",
  "The exact list depends on",
];
// Navigational entry points, exempt from the body-length floor only. See the
// matching set in scripts/import-master.mjs.
const structuralRoutes = new Set(["/", "/features/"]);

function frontmatterValue(frontmatter, key) {
  const raw =
    frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, "m"))?.[1]?.trim() ||
    "";
  if (/^".*"$/.test(raw)) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw.slice(1, -1);
    }
  }
  return raw;
}

for (const file of files) {
  const raw = fs.readFileSync(path.join(directory, file), "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const frontmatter = match?.[1] || "";
  const body = raw.slice(match?.[0].length || 0);
  const record = {
    file,
    title: frontmatterValue(frontmatter, "title"),
    description: frontmatterValue(frontmatter, "description"),
    route: frontmatterValue(frontmatter, "route"),
    keyword: frontmatterValue(frontmatter, "primaryKeyword"),
    cluster: frontmatterValue(frontmatter, "cluster"),
    pageType: frontmatterValue(frontmatter, "pageType"),
    indexable: frontmatterValue(frontmatter, "indexable") === "true",
    depthVerified: frontmatterValue(frontmatter, "depthVerified") === "true",
    redirectTo: frontmatterValue(frontmatter, "redirectTo"),
    faqCount: (frontmatter.match(/^\s*- question:\s/gm) || []).length,
    wordCount: countBodyWords(body),
    body,
  };
  records.push(record);

  if (!record.title || !record.description || !record.route)
    errors.push(`${file}: missing metadata`);
  if (!record.redirectTo && !/^# [^#]/m.test(body))
    errors.push(`${file}: missing H1`);
  if (/\b(TODO|FIXME|Lorem ipsum|example\.com|localhost)\b/i.test(raw))
    errors.push(`${file}: placeholder`);
  if (/Contextual CTA/i.test(raw))
    errors.push(`${file}: contains the Contextual CTA authoring artifact`);

  if (record.indexable && record.pageType === "content") {
    // depthVerified is an additional requirement, never an escape hatch from the
    // word floor. A page marked verified still has to be 500+ words.
    if (record.wordCount < 500 && !structuralRoutes.has(record.route))
      errors.push(
        `${file}: indexable content has ${record.wordCount} body words; minimum is 500`,
      );
    if (!record.depthVerified && !structuralRoutes.has(record.route))
      errors.push(
        `${file}: indexable content is not marked **Depth:** verified in the master`,
      );
    if (record.faqCount < 3 && !structuralRoutes.has(record.route))
      errors.push(
        `${file}: indexable content has ${record.faqCount} FAQ entries; minimum is 3`,
      );
    for (const pattern of hedgingPatterns) {
      if (body.includes(pattern))
        errors.push(`${file}: indexable content contains hedging pattern: ${pattern}`);
    }
  }
}

for (const key of ["title", "description", "route"]) {
  const seen = new Map();
  for (const item of records) {
    if (seen.has(item[key]))
      errors.push(
        `duplicate ${key}: ${item[key]} (${seen.get(item[key])}, ${item.file})`,
      );
    seen.set(item[key], item.file);
  }
}

const core = files.filter((file) => /^\d{3}-/.test(file));
if (core.length < minimumCorePages)
  errors.push(
    `expected at least ${minimumCorePages} core content files, found ${core.length}`,
  );

const clusterTable = Object.entries(Object.groupBy(records, (item) => item.cluster))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([cluster, pages]) => ({
    cluster,
    pages: pages.length,
    averageWords: Number(
      (pages.reduce((total, page) => total + page.wordCount, 0) / pages.length).toFixed(
        1,
      ),
    ),
    indexable: pages.filter((page) => page.indexable).length,
  }));

console.log("Content audit by cluster:");
console.table(clusterTable);

if (errors.length) {
  console.error([...new Set(errors)].join("\n"));
  process.exit(1);
}

console.log(
  `Content audit PASS: ${files.length} pages, ${core.length} core pages (minimum ${minimumCorePages}), ${records.filter((record) => record.indexable).length} indexable.`,
);
