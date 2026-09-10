import fs from "node:fs";

export function normalizeMarkdownNewlines(raw) {
  return raw.replace(/\r\n?/g, "\n");
}

export function readMarkdown(filePath) {
  return normalizeMarkdownNewlines(fs.readFileSync(filePath, "utf8"));
}
