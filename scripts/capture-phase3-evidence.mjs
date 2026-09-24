import { chromium } from "@playwright/test";
import { createReadStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const distRoot = resolve("dist");
const reportRoot = resolve("reports", "phase3");
const pages = [
  ["/zh-tw/guides/power-outage-home-preparedness/", "power-outage-a4-table.png"],
  ["/zh-tw/guides/storm-preparation-home-checklist/", "storm-preparation-a4-table.png"],
  ["/zh-tw/guides/emergency-supply-inventory/", "emergency-supplies-a4-table.png"],
  ["/zh-tw/guides/organize-utility-account-information/", "utility-accounts-a4-table.png"],
  ["/zh-tw/guides/move-out-home-records/", "move-out-records-a4-table.png"],
  ["/zh-tw/guides/home-care-service-complaint-resolution/", "home-care-complaint-a4-table.png"],
  ["/zh-tw/checklists/year-end-cleaning-checklist/", "year-end-cleaning-a4-table.png"],
];
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

await mkdir(reportRoot, { recursive: true });
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  const relative = normalize(pathname).replace(/^([/\\])+/, "");
  let file = join(distRoot, relative || "index.html");
  try {
    if (!resolve(file).startsWith(distRoot)) throw new Error("Path outside dist");
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    const info = await stat(file);
    response.writeHead(200, {
      "content-type": types[extname(file)] || "application/octet-stream",
      "content-length": info.size,
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Could not determine server port.");
const origin = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch();

try {
  const page = await browser.newPage({ viewport: { width: 1240, height: 1000 }, deviceScaleFactor: 1 });
  for (const [route, fileName] of pages) {
    await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    const table = page.locator(".editorial-content table").first();
    if (await table.count() !== 1) throw new Error(`${route} does not have exactly one first printable table.`);
    const unsafeRows = await table.locator("tr").evaluateAll((rows) =>
      rows.filter((row) => getComputedStyle(row).breakInside !== "avoid").length,
    );
    if (unsafeRows > 0) throw new Error(`${route} has ${unsafeRows} table rows without break-inside: avoid.`);
    await table.screenshot({ path: join(reportRoot, fileName) });
    const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
    if (!pdf.subarray(0, 5).equals(Buffer.from("%PDF-")) || pdf.length < 10_000) {
      throw new Error(`${route} did not render a valid A4 PDF.`);
    }
    await page.emulateMedia({ media: "screen" });
    console.log(`${route}: ${pdf.length} byte A4 PDF; ${await table.locator("tr").count()} protected row(s)`);
  }
  await page.close();
} finally {
  await browser.close();
  await new Promise((done, reject) => server.close((error) => error ? reject(error) : done()));
}

console.log(`Phase 3 print screenshots written to ${reportRoot}`);
