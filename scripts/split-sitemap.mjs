// Splits the single sitemap @astrojs/sitemap emits into semantic segments.
//
// Why: Google Search Console reports coverage (indexed / not indexed, and the
// reason) per sitemap file. One 508 KB sitemap carrying all 1,016 URLs gives a
// single undifferentiated number, which is exactly the state this site was stuck
// in — 1,016 submitted, 132 known, and no way to see which section Google was
// skipping. Segmented files turn that into a per-section readout, and smaller
// files are also less likely to stall on fetch.
//
// This runs on the integration's own output, so hreflang alternates, lastmod and
// the filter/serialize rules in astro.config.mjs are preserved verbatim; only the
// grouping changes. Hreflang pairs may span files — Google reads the whole index,
// so alternates do not need to sit in the same sitemap as their source URL.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("dist");
const source = path.join(root, "sitemap-0.xml");

if (!fs.existsSync(source)) {
  console.error("split-sitemap: dist/sitemap-0.xml not found — run the build first.");
  process.exit(1);
}

const xml = fs.readFileSync(source, "utf8");
const header = xml.match(/^([\s\S]*?)<url>/)?.[1] ?? "";
const blocks = [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)].map((match) => match[0]);

if (!blocks.length) {
  console.error("split-sitemap: no <url> entries found in sitemap-0.xml.");
  process.exit(1);
}

// Order matters: the first matching section wins.
const sections = [
  { name: "guides", test: (p) => p.startsWith("/guides/") },
  { name: "tools", test: (p) => p.startsWith("/tools/") },
  { name: "printables", test: (p) => p.startsWith("/checklists/") || p.startsWith("/templates/") },
  { name: "features", test: (p) => p.startsWith("/features/") },
  { name: "core", test: () => true },
];

const groups = new Map();
for (const block of blocks) {
  const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
  if (!loc) {
    console.error(`split-sitemap: <url> entry without <loc>: ${block.slice(0, 120)}`);
    process.exit(1);
  }
  const pathname = new URL(loc).pathname;
  const isZh = pathname === "/zh-tw/" || pathname.startsWith("/zh-tw/");
  const locale = isZh ? "zh-tw" : "en";
  const sectionPath = isZh ? pathname.replace(/^\/zh-tw/, "") || "/" : pathname;
  const section = sections.find((candidate) => candidate.test(sectionPath)).name;
  const key = `sitemap-${locale}-${section}.xml`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(block);
}

// Remove any segment files from an earlier build whose section is now empty, so a
// stale file can never stay referenced or served.
for (const existing of fs.readdirSync(root)) {
  if (/^sitemap-(en|zh-tw)-[a-z]+\.xml$/.test(existing) && !groups.has(existing)) {
    fs.unlinkSync(path.join(root, existing));
  }
}

const latestLastmod = (entries) =>
  entries
    .map((block) => block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1])
    .filter(Boolean)
    .sort()
    .at(-1);

const names = [...groups.keys()].sort();
for (const name of names) {
  const entries = groups.get(name);
  fs.writeFileSync(path.join(root, name), `${header}${entries.join("")}</urlset>`);
}

const indexBody = names
  .map((name) => {
    const lastmod = latestLastmod(groups.get(name));
    return `<sitemap><loc>https://familyboard.win/${name}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</sitemap>`;
  })
  .join("");

fs.writeFileSync(
  path.join(root, "sitemap-index.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexBody}</sitemapindex>`,
);

fs.unlinkSync(source);

const total = names.reduce((sum, name) => sum + groups.get(name).length, 0);
console.log(`Sitemap split into ${names.length} segments (${total} URLs):`);
for (const name of names) console.log(`  ${String(groups.get(name).length).padStart(4)}  ${name}`);
