import { chromium } from "@playwright/test";
import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const checkOnly = process.argv.includes("--check");
const distRoot = resolve("dist");
const outputRoot = resolve("public", "downloads");
const fixedPdfDate = "D:20260923000000+00'00'";

const downloads = [
  {
    route: "/templates/printable-home-inventory-template/",
    baseName: "familyboard-home-inventory-template",
    landscape: true,
    columns: [
      "Room / 房間",
      "Item / 品項",
      "Brand / model / 品牌／型號",
      "Serial number / 序號",
      "Purchase date / 購買日期",
      "Receipt / photo reference / 收據／照片索引",
      "Notes / 備註",
    ],
  },
  {
    route: "/checklists/printable-moving-checklist/",
    baseName: "familyboard-moving-checklist",
    landscape: false,
    columns: [
      "When / 時程",
      "Task / 工作",
      "Owner / 負責人",
      "Contact / account / 聯絡／帳戶",
      "Complete / 完成",
    ],
  },
];

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
};

function csvBuffer(columns) {
  const escape = (value) => `"${value.replaceAll('"', '""')}"`;
  const rows = [columns, ...Array.from({ length: 20 }, () => columns.map(() => ""))];
  return Buffer.from(`\uFEFF${rows.map((row) => row.map(escape).join(",")).join("\n")}\n`, "utf8");
}

function normalizePdfMetadata(buffer) {
  const latin = buffer.toString("latin1");
  const datesNormalized = latin.replace(/D:\d{14}[+-]\d{2}'\d{2}'/g, (match) => {
    if (match.length !== fixedPdfDate.length) {
      throw new Error(`Unexpected PDF date length: ${match}`);
    }
    return fixedPdfDate;
  });
  const nodeIds = new Map();
  let nextNodeId = 1;
  const idsNormalized = datesNormalized.replace(/node\d{8}/g, (nodeId) => {
    if (!nodeIds.has(nodeId)) {
      nodeIds.set(nodeId, `node${String(nextNodeId).padStart(8, "0")}`);
      nextNodeId += 1;
    }
    return nodeIds.get(nodeId);
  });
  const normalized = idsNormalized.replace(
    /\/Limits \[\(node\d{8}\) \(node\d{8}\)\]\n\/Names \[([^\]]+)\]/g,
    (_match, body) => {
      const pairs = [...body.matchAll(/\((node\d{8})\) (\d+ \d+ R)/g)]
        .map((match) => ({ id: match[1], reference: match[2] }))
        .sort((a, b) => a.id.localeCompare(b.id));
      if (pairs.length === 0) throw new Error("Could not normalize the PDF name tree.");
      return `/Limits [(${pairs[0].id}) (${pairs.at(-1).id})]\n/Names [${pairs.map((pair) => `(${pair.id}) ${pair.reference}`).join(" ")}]`;
    },
  );
  return Buffer.from(normalized, "latin1");
}

async function writeOrCompare(path, expected) {
  if (!checkOnly) {
    await writeFile(path, expected);
    return "written";
  }
  const actual = await readFile(path);
  if (!actual.equals(expected)) {
    throw new Error(`${path} is not deterministic; run npm run build:downloads and commit the result.`);
  }
  return "matched";
}

async function startServer() {
  const server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
    const relative = normalize(pathname).replace(/^([/\\])+/, "");
    let file = join(distRoot, relative || "index.html");
    try {
      if (!resolve(file).startsWith(distRoot)) throw new Error("Path outside dist");
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const info = await stat(file);
      response.writeHead(200, {
        "content-type": contentTypes[extname(file)] || "application/octet-stream",
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
  if (!address || typeof address === "string") throw new Error("Could not determine test server port.");
  return { server, origin: `http://127.0.0.1:${address.port}` };
}

await stat(join(distRoot, "index.html"));
await mkdir(outputRoot, { recursive: true });
const { server, origin } = await startServer();
const browser = await chromium.launch();

try {
  for (const item of downloads) {
    const csv = csvBuffer(item.columns);
    const csvPath = join(outputRoot, `${item.baseName}.csv`);
    const csvStatus = await writeOrCompare(csvPath, csv);

    const page = await browser.newPage();
    await page.goto(`${origin}${item.route}`, { waitUntil: "networkidle" });
    await page.waitForSelector(".download-printable .printable");
    await page.emulateMedia({ media: "print" });
    await page.addStyleTag({
      content: `
        @page { size: A4 ${item.landscape ? "landscape" : "portrait"}; margin: 10mm; }
        .article > :not(.download-printable) { display: none !important; }
        .download-printable, .download-printable .printable { display: block !important; }
        .download-printable .printable { width: 100%; border: 0; box-shadow: none; padding: 0; }
        .download-printable h2 { margin: 0 0 4mm; font-size: 16pt; }
        .download-printable p { margin: 0 0 4mm; font-size: 9pt; }
        .download-printable table { table-layout: fixed; margin: 0; font-size: ${item.landscape ? "7.5pt" : "8.5pt"}; }
        .download-printable th, .download-printable td { padding: 3px; overflow-wrap: anywhere; }
        .download-printable tr { break-inside: avoid; page-break-inside: avoid; }
      `,
    });
    const rawPdf = await page.pdf({
      format: "A4",
      landscape: item.landscape,
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
    });
    await page.close();
    const pdf = normalizePdfMetadata(rawPdf);
    const pageCount = (pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
    if (pageCount < 1 || pageCount > 2) {
      throw new Error(`${item.baseName}.pdf has ${pageCount} pages; expected 1-2.`);
    }
    if (pdf.length >= 500 * 1024) {
      throw new Error(`${item.baseName}.pdf is ${pdf.length} bytes; expected under 500 KB.`);
    }
    const pdfPath = join(outputRoot, `${item.baseName}.pdf`);
    const pdfStatus = await writeOrCompare(pdfPath, pdf);
    console.log(`${item.baseName}: CSV ${csvStatus}; PDF ${pdfStatus}, ${pageCount} page(s), ${pdf.length} bytes`);
  }
} finally {
  await browser.close();
  await new Promise((resolveClose, rejectClose) => server.close((error) => error ? rejectClose(error) : resolveClose()));
}
