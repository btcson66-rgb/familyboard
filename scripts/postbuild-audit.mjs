import fs from "node:fs";
import path from "node:path";

const root = path.resolve("dist");
const contentRoots = [
  path.resolve("src/content/pages"),
  path.resolve("src/content/pages-zh-tw"),
].filter((directory) => fs.existsSync(directory));
if (!fs.existsSync(root)) throw new Error("dist missing");

const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((item) =>
      item.isDirectory()
        ? walk(path.join(dir, item.name))
        : [path.join(dir, item.name)],
    );
const swPath = path.join(root, "sw.js");
if (fs.existsSync(swPath)) {
  const buildAssets = walk(path.join(root, "_astro"))
    .filter((file) => /\.(?:js|css|woff2?)$/i.test(file))
    .map((file) => `/${path.relative(root, file).replaceAll("\\", "/")}`);
  const coreAssets = [
    "/",
    "/app/",
    "/zh-tw/app/",
    "/offline/",
    "/manifest.webmanifest",
    "/favicon.svg",
    ...buildAssets,
  ];
  const source = fs
    .readFileSync(swPath, "utf8")
    .replace(
      /^const CORE = [\s\S]*?;\s*$/m,
      `const CORE = ${JSON.stringify(coreAssets)};`,
    );
  fs.writeFileSync(swPath, source);
}
const clean = (value) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|amp|quot|#39|lt|gt);/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const wordCount = (value) => {
  const cleaned = clean(value);
  const cjkCharacters =
    cleaned.match(
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu,
    )?.length || 0;
  const nonCjkWords = cleaned
    .replace(
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu,
      " ",
    )
    .split(/\s+/)
    .filter(Boolean).length;
  return cjkCharacters + nonCjkWords;
};
const frontmatterValue = (raw, key) =>
  (raw.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1] || "")
    .replace(/^"|"$/g, "")
    .replaceAll('\\"', '"');
const normalizeRoute = (route) =>
  route === "/" ? "/" : `/${route.replace(/^\/+|\/+$/g, "")}/`;

const contentByRoute = new Map();
for (const contentRoot of contentRoots) {
  for (const file of fs
    .readdirSync(contentRoot)
    .filter((name) => name.endsWith(".md"))) {
    const raw = fs.readFileSync(path.join(contentRoot, file), "utf8");
    const body = raw.replace(/^---[\s\S]*?---\s*/, "");
    const route = normalizeRoute(frontmatterValue(raw, "route"));
    contentByRoute.set(route, {
      cluster: frontmatterValue(raw, "cluster"),
      primaryKeyword: frontmatterValue(raw, "primaryKeyword"),
      lastReviewed: frontmatterValue(raw, "lastReviewedAt"),
      wordCount: wordCount(body),
    });
  }
}

const toolSource = fs.readFileSync("src/components/ToolWorkbench.tsx", "utf8");
const toolDefinitions = new Set(
  [...toolSource.matchAll(/^\s{2}"([a-z0-9-]+)":\s*\{/gm)].map(
    (match) => match[1],
  ),
);
const htmlFiles = walk(root).filter((file) => file.endsWith(".html"));
const errors = [];
const brokenLinks = [];
const placeholders = [];
const sourceWarnings = [];
const noContextualLink = [];
const records = [];

const routeFor = (file) => {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html"))
    return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative.replace(/\.html$/, "")}/`;
};
const targetExists = (target) => {
  const route = normalizeRoute(target);
  return route === "/"
    ? fs.existsSync(path.join(root, "index.html"))
    : fs.existsSync(path.join(root, route, "index.html")) ||
        fs.existsSync(
          path.join(root, `${route.replace(/^\/+|\/+$/g, "")}.html`),
        );
};

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const route = normalizeRoute(routeFor(file));
  const grab = (expression) => html.match(expression)?.[1]?.trim() || "";
  const title = clean(grab(/<title>([\s\S]*?)<\/title>/i));
  const description = grab(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const canonical = grab(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const h1Matches = [...html.matchAll(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/gi)];
  const h1 = clean(h1Matches[0]?.[1] || "");
  const indexable = !/name="robots"\s+content="noindex/i.test(html);
  const status = route === "/404/" ? 404 : 200;
  const meta = contentByRoute.get(route);
  const localeNeutralRoute = route.replace(/^\/zh-tw(?=\/)/, "");
  const routeType = localeNeutralRoute.startsWith("/tools/")
    ? "tool"
    : localeNeutralRoute.startsWith("/templates/") ||
        localeNeutralRoute.startsWith("/checklists/")
      ? "printable"
      : localeNeutralRoute.startsWith("/app/")
        ? "app"
        : route === "/404/"
          ? "error"
          : "page";
  const slug = route.split("/").filter(Boolean).at(-1) || "";
  const toolFunctional =
    routeType === "tool" && route !== "/tools/"
      ? toolDefinitions.has(slug)
      : "n/a";

  if (indexable && status === 200 && route !== "/offline/") {
    if (!title || !description || !canonical)
      errors.push(`${route}: missing metadata`);
    if (h1Matches.length !== 1)
      errors.push(`${route}: expected one H1, found ${h1Matches.length}`);
    if (!canonical.startsWith("https://familyboard.win/"))
      errors.push(`${route}: wrong canonical ${canonical}`);
    if (/github\.io|localhost|example\.com/i.test(html))
      errors.push(`${route}: leaked non-production origin`);
  }
  if (toolFunctional === false)
    errors.push(`${route}: no registered production tool definition`);
  if (/\b(TODO|FIXME|Lorem ipsum|example\.com|localhost)\b/i.test(html))
    placeholders.push(route);

  for (const match of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const target = match[1];
    if (/\.[a-z0-9]+\/?$/i.test(target)) continue;
    if (!targetExists(target)) brokenLinks.push(`${route} -> ${target}`);
  }
  const article = html.match(/<article[\s\S]*?<\/article>/i)?.[0] || "";
  if (
    meta &&
    !/(href="\/(?:app|tools|features|templates|checklists)\/)/i.test(article)
  )
    noContextualLink.push(route);
  if (
    route.startsWith("/guides/") &&
    route !== "/guides/" &&
    /\b(safety|emergency|legal|medical|insurance|electrical|gas|fire)\b/i.test(
      article,
    ) &&
    (/\b(?:every|within|after|at least|no more than)\s+\d+\s*(?:days?|months?|years?|hours?|degrees?)\b/i.test(
      article,
    ) ||
      /\b\d+\s*(?:days?|months?|years?|hours?|degrees?)\b.{0,30}(?:replacement interval|service interval|test interval|inspection interval)/i.test(
        article,
      )) &&
    !/href="https?:\/\//i.test(article) &&
    !/\b(manufacturer|official|qualified|written terms|local authority|professional)\b/i.test(
      article,
    )
  ) {
    sourceWarnings.push(route);
  }

  records.push({
    url: `https://familyboard.win${route}`,
    routeType,
    indexable,
    status,
    canonical,
    title,
    metaDescription: description,
    h1,
    cluster: meta?.cluster || "system",
    primaryKeyword: meta?.primaryKeyword || "",
    wordCount:
      meta?.wordCount ??
      wordCount(html.match(/<main[\s\S]*?<\/main>/i)?.[0] || html),
    toolFunctional,
    lastReviewed: meta?.lastReviewed || "",
  });
}

for (const key of ["title", "metaDescription", "canonical"]) {
  const seen = new Map();
  for (const row of records.filter(
    (item) => item.indexable && item.status === 200,
  )) {
    if (seen.has(row[key])) errors.push(`duplicate ${key}: ${row[key]}`);
    seen.set(row[key], row.url);
  }
}
errors.push(...new Set(brokenLinks));
errors.push(...placeholders.map((route) => `${route}: placeholder token`));

const sitemapFile = path.join(root, "sitemap-0.xml");
if (!fs.existsSync(sitemapFile)) errors.push("sitemap-0.xml missing");
else {
  const actual = new Set(
    [
      ...fs.readFileSync(sitemapFile, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g),
    ].map((match) => match[1]),
  );
  const expected = new Set(
    records
      .filter(
        (item) =>
          item.indexable &&
          item.status === 200 &&
          !["/app/", "/zh-tw/app/", "/offline/"].includes(new URL(item.url).pathname),
      )
      .map((item) => item.url),
  );
  for (const url of expected)
    if (!actual.has(url)) errors.push(`sitemap missing ${url}`);
  for (const url of actual)
    if (!expected.has(url)) errors.push(`sitemap unexpected ${url}`);
}

fs.mkdirSync("reports", { recursive: true });
const columns = [
  "url",
  "routeType",
  "indexable",
  "status",
  "canonical",
  "title",
  "metaDescription",
  "h1",
  "cluster",
  "primaryKeyword",
  "wordCount",
  "toolFunctional",
  "lastReviewed",
];
const csv = [
  columns.join(","),
  ...records.map((row) =>
    columns
      .map((key) => `"${String(row[key]).replaceAll('"', '""')}"`)
      .join(","),
  ),
].join("\n");
fs.writeFileSync("reports/url-inventory.csv", `${csv}\n`);

const clusterCounts = Object.entries(
  Object.groupBy(
    records.filter((item) => item.indexable && item.status === 200),
    (item) => item.cluster,
  ),
)
  .map(([cluster, rows]) => `- ${cluster}: ${rows.length}`)
  .join("\n");
const ranked = records
  .filter((item) => item.indexable && item.status === 200)
  .sort((a, b) => a.wordCount - b.wordCount);
const similarity = fs.existsSync("reports/content-similarity.json")
  ? JSON.parse(fs.readFileSync("reports/content-similarity.json", "utf8"))
  : [];
const keywordGroups = Object.groupBy(
  records.filter((item) => item.primaryKeyword),
  (item) => item.primaryKeyword.toLowerCase(),
);
const keywordDuplicates = Object.entries(keywordGroups).filter(
  ([, rows]) => rows.length > 1,
);
const uniqueErrors = [...new Set(errors)];
const report = `# Content quality report

Generated: ${new Date().toISOString()}

## Summary

- Indexable pages: ${ranked.length}
- Generated HTML routes: ${records.length}
- Duplicate metadata blockers: ${uniqueErrors.filter((item) => item.startsWith("duplicate ")).length}
- Broken internal links: ${new Set(brokenLinks).size}
- Placeholder findings: ${placeholders.length}
- Missing-source warnings on safety-sensitive numeric claims: ${sourceWarnings.length}
- Duplicate primary-keyword groups: ${keywordDuplicates.length}
- Pages without a contextual product/tool link: ${noContextualLink.length}
- Blocking audit findings: ${uniqueErrors.length}

## Indexable pages by cluster

${clusterCounts}

## Word-count range

- Lowest: ${ranked[0]?.url} (${ranked[0]?.wordCount ?? 0} words)
- Highest: ${ranked.at(-1)?.url} (${ranked.at(-1)?.wordCount ?? 0} words)

## Highest similarity pairs

${
  similarity
    .slice(0, 10)
    .map((item) => `- ${item.a} ↔ ${item.b}: ${item.score.toFixed(3)}`)
    .join("\n") || "- None above the reporting threshold."
}

## Safety-source warnings

${sourceWarnings.map((route) => `- ${route}`).join("\n") || "- None."}

## Duplicate primary keywords

${keywordDuplicates.map(([keyword, rows]) => `- ${keyword}: ${rows.map((item) => new URL(item.url).pathname).join(", ")}`).join("\n") || "- None."}

## Pages without contextual product/tool links

${noContextualLink.map((route) => `- ${route}`).join("\n") || "- None."}

## Blockers

${uniqueErrors.map((error) => `- ${error}`).join("\n") || "- None. SEO, sitemap, metadata, placeholder, tool-registration and internal-link gates passed."}
`;
fs.writeFileSync("reports/content-quality.md", report);

if (uniqueErrors.length) {
  console.error(uniqueErrors.join("\n"));
  process.exit(1);
}
console.log(
  `Post-build SEO/link/sitemap audit PASS: ${records.length} HTML routes, ${ranked.length} indexable.`,
);
