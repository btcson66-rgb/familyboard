import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("cross-site quality guardrails", () => {
  it("keeps the PWA update action usable without blocking the page", async () => {
    const css = await readFile("src/styles/global.css", "utf8");

    expect(css).toMatch(/\.pwa-update\s*\{[^}]*pointer-events:\s*none/s);
    expect(css).toMatch(/\.pwa-update button\s*\{[^}]*pointer-events:\s*auto/s);
  });

  it("does not let an old save timer erase a newer status message", async () => {
    const source = await readFile("src/components/FamilyApp.tsx", "utf8");

    expect(source).toContain('current === transientMessage ? "" : current');
    expect(source).not.toContain('setTimeout(() => setMessage(""), 2400)');
  });
});
