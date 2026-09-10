import { describe, expect, it } from "vitest";
import { normalizeMarkdownNewlines } from "../scripts/lib/markdown-source.mjs";

describe("content audit markdown parsing", () => {
  it.each(["\n", "\r\n", "\r"])(
    "normalizes %j frontmatter newlines before parsing",
    (newline) => {
      const source = [
        "---",
        'title: "測試"',
        'route: "/zh-tw/test/"',
        "---",
        "# 測試",
      ].join(newline);

      const normalized = normalizeMarkdownNewlines(source);
      const frontmatter = normalized.match(/^---\n([\s\S]*?)\n---\n?/)?.[1];

      expect(frontmatter).toContain('route: "/zh-tw/test/"');
    },
  );
});
