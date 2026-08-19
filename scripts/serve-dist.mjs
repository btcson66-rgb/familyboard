import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("dist");
const port = Number(process.env.PORT || 4321);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml; charset=utf-8",
};

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  const relative = normalize(pathname).replace(/^([/\\])+/, "");
  let file = join(root, relative || "index.html");

  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, "index.html");
    if (!resolve(file).startsWith(root)) throw new Error("Path outside dist");
    const fileInfo = await stat(file);
    response.writeHead(200, {
      "content-type": types[extname(file)] || "application/octet-stream",
      "content-length": fileInfo.size,
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`FamilyBoard test server listening on http://127.0.0.1:${port}`);
});
