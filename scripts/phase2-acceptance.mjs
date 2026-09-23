import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const distRoot = resolve("dist");
const targetLinks = [
  { locale: "EN", href: "/tools/warranty-expiration-calculator/", minimum: 8 },
  { locale: "zh-TW", href: "/zh-tw/tools/warranty-expiration-calculator/", minimum: 3 },
];

function routeToFile(route) {
  return join(distRoot, route.replace(/^\//, ""), "index.html");
}

function decodeEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/<[^>]+>/g, "")
    .trim();
}

const sitemap = JSON.parse(await readFile("src/generated/sitemap-pages.json", "utf8"));
const indexableRoutes = [...new Set(
  sitemap
    .filter((entry) => entry.indexable && !entry.redirectTo)
    .map((entry) => entry.route),
)];

for (const target of targetLinks) {
  const matches = [];
  for (const route of indexableRoutes) {
    const file = routeToFile(route);
    let html;
    try {
      html = await readFile(file, "utf8");
    } catch {
      continue;
    }
    const editorial = html.match(/<div class="editorial-content">([\s\S]*?)<\/div>/)?.[1] || "";
    const anchorPattern = /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    for (const match of editorial.matchAll(anchorPattern)) {
      if (match[1] === target.href) matches.push({ route, anchor: decodeEntities(match[2]) });
    }
  }
  const uniqueRoutes = new Set(matches.map((match) => match.route));
  console.log(`${target.locale} editorial links to ${target.href}: ${matches.length} link(s) from ${uniqueRoutes.size} indexable page(s)`);
  for (const match of matches) console.log(`  ${match.route} -> ${match.anchor}`);
  if (uniqueRoutes.size < target.minimum) {
    throw new Error(`${target.locale} needs ${target.minimum} indexable source pages; found ${uniqueRoutes.size}.`);
  }
}

const assets = [
  ["familyboard-home-inventory-template", 7],
  ["familyboard-moving-checklist", 5],
];

for (const [baseName, expectedColumns] of assets) {
  const pdfPath = join("public", "downloads", `${baseName}.pdf`);
  const csvPath = join("public", "downloads", `${baseName}.csv`);
  const pdf = await readFile(pdfPath);
  const csv = await readFile(csvPath);
  const pdfInfo = await stat(pdfPath);
  const pageCount = (pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
  const firstLine = csv.toString("utf8").replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0];
  const columnCount = [...firstLine.matchAll(/"(?:[^"]|"")*"(?:,|$)/g)].length;
  if (!pdf.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw new Error(`${baseName}.pdf is not a PDF.`);
  if (pdfInfo.size >= 500 * 1024) throw new Error(`${baseName}.pdf exceeds 500 KB.`);
  if (pageCount < 1 || pageCount > 2) throw new Error(`${baseName}.pdf has ${pageCount} pages.`);
  if (!csv.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]))) throw new Error(`${baseName}.csv lacks a UTF-8 BOM.`);
  if (columnCount !== expectedColumns) throw new Error(`${baseName}.csv has ${columnCount} columns; expected ${expectedColumns}.`);
  console.log(`${baseName}: PDF ${pageCount} page(s), ${pdfInfo.size} bytes; CSV BOM present, ${columnCount} columns`);
}

for (const route of ["/templates/printable-home-inventory-template/", "/checklists/printable-moving-checklist/"]) {
  const html = await readFile(routeToFile(route), "utf8");
  const buttons = ["Download PDF", "Download CSV (Excel)"].filter((label) => html.includes(`download>${label}</a>`));
  if (buttons.length !== 2) throw new Error(`${route} is missing one or more download links.`);
  console.log(`${route}: both download buttons present`);
}
