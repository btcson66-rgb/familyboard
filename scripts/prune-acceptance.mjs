import fs from "node:fs";
import path from "node:path";

const root = path.resolve("dist");
const manifestPath = path.resolve("src/generated/sitemap-pages.json");

if (!fs.existsSync(root)) throw new Error("dist/ missing; run npm run build first");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const normalizeRoute = (route) =>
  route === "/" ? "/" : `/${route.replace(/^\/+|\/+$/g, "")}/`;
const htmlPath = (route) =>
  route === "/"
    ? path.join(root, "index.html")
    : path.join(root, ...normalizeRoute(route).split("/").filter(Boolean), "index.html");
const readHtml = (route) => fs.readFileSync(htmlPath(route), "utf8");
const metaRobots = (html) =>
  html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1] ?? "";

const sitemapFiles = fs
  .readdirSync(root)
  .filter((name) => /^sitemap-(en|zh-tw)-[a-z]+\.xml$/.test(name));
if (!sitemapFiles.length) throw new Error("split sitemap files missing");
const sitemapXml = sitemapFiles
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("");
const sitemapRoutes = new Set(
  [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    normalizeRoute(new URL(match[1]).pathname),
  ),
);

const expectedIndexable = manifest.filter(
  (entry) => entry.indexable && !entry.redirectTo,
);
if (sitemapRoutes.size > 150)
  throw new Error(`sitemap has ${sitemapRoutes.size} URLs; expected <= 150`);
if (sitemapRoutes.size !== expectedIndexable.length)
  throw new Error(
    `sitemap count ${sitemapRoutes.size} does not match manifest ${expectedIndexable.length}`,
  );

let noindexCount = 0;
for (const entry of manifest) {
  const route = normalizeRoute(entry.route);
  const file = htmlPath(route);
  if (!fs.existsSync(file)) throw new Error(`${route}: rendered HTML missing`);
  const robots = metaRobots(readHtml(route));
  if (entry.indexable && !entry.redirectTo) {
    if (!sitemapRoutes.has(route)) throw new Error(`${route}: indexable but missing from sitemap`);
    if (robots.includes("noindex")) throw new Error(`${route}: indexable but rendered noindex`);
  } else {
    noindexCount += 1;
    if (sitemapRoutes.has(route)) throw new Error(`${route}: noindex route present in sitemap`);
    if (robots !== "noindex,follow")
      throw new Error(`${route}: expected noindex,follow, received ${robots || "missing"}`);
  }
}

for (const route of ["/app/", "/zh-tw/app/"]) {
  const html = readHtml(route);
  if (metaRobots(html) !== "noindex,follow")
    throw new Error(`${route}: private app must remain noindex,follow`);
  if (sitemapRoutes.has(route)) throw new Error(`${route}: private app present in sitemap`);
}

const alternateLinks = (html) =>
  [...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g)]
    .map((match) => ({ lang: match[1], href: match[2] }));
for (const entry of expectedIndexable) {
  const route = normalizeRoute(entry.route);
  const sourceUrl = new URL(route, "https://familyboard.win").toString();
  for (const link of alternateLinks(readHtml(route)).filter((item) => item.lang !== "x-default")) {
    const targetRoute = normalizeRoute(new URL(link.href).pathname);
    if (!sitemapRoutes.has(targetRoute))
      throw new Error(`${route}: hreflang target is not indexable: ${targetRoute}`);
    const reciprocal = alternateLinks(readHtml(targetRoute)).some(
      (candidate) => candidate.href === sourceUrl,
    );
    if (!reciprocal) throw new Error(`${route}: hreflang target is not reciprocal: ${targetRoute}`);
  }
}

if (!fs.existsSync(path.join(root, "_redirects")))
  throw new Error("dist/_redirects missing; reviewed Cloudflare redirects were not built");

console.log(
  `Prune acceptance PASS: ${sitemapRoutes.size} indexable, ${noindexCount} content routes noindex and rendered, private apps excluded, hreflang reciprocal.`,
);
