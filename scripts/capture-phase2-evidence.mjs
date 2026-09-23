import { chromium } from "@playwright/test";
import { createReadStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const distRoot = resolve("dist");
const reportRoot = resolve("reports", "phase2");
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
await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Could not determine server port.");
const origin = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch();

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1 });
  for (const item of [
    ["/tools/warranty-expiration-calculator/", "warranty-calculator-en-print.png"],
    ["/zh-tw/tools/warranty-expiration-calculator/", "warranty-calculator-zh-print.png"],
  ]) {
    await page.goto(`${origin}${item[0]}`, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    await page.screenshot({ path: join(reportRoot, item[1]), fullPage: true });
    await page.emulateMedia({ media: "screen" });
  }
  for (const item of [
    ["/templates/printable-home-inventory-template/", "home-inventory-downloads.png", "home-inventory-print.png"],
    ["/checklists/printable-moving-checklist/", "moving-checklist-downloads.png", "moving-checklist-print.png"],
  ]) {
    await page.goto(`${origin}${item[0]}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: join(reportRoot, item[1]), fullPage: false });
    await page.emulateMedia({ media: "print" });
    await page.locator(".download-printable").screenshot({ path: join(reportRoot, item[2]) });
    await page.emulateMedia({ media: "screen" });
  }
  await page.close();
} finally {
  await browser.close();
  await new Promise((resolveClose, rejectClose) => server.close((error) => error ? rejectClose(error) : resolveClose()));
}

console.log(`Phase 2 browser evidence written to ${reportRoot}`);
