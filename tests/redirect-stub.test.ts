import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { createRedirectStub } from "../src/lib/redirect-stub";

const consolidations = [
  ["/guides/chore-chart-for-adults/", "/guides/family-chore-system/"],
] as const;

const master = fs.readFileSync("docs/launch-content-master.md", "utf8");

function blockForSlug(slug: string) {
  const slugField = `**Slug:** \`${slug}\``;
  const start = master.indexOf(slugField);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(master.indexOf(slugField, start + slugField.length)).toBe(-1);
  const end = master.indexOf("\n## Page ", start);
  return master.slice(start, end < 0 ? master.length : end);
}

describe("consolidated-route redirect stub", () => {
  it("uses the target for canonical, refresh and the visible link without public integrations", () => {
    const stub = createRedirectStub("/features/home-organizer/");

    expect(stub).toEqual({
      canonicalPath: "/features/home-organizer/",
      indexable: false,
      robots: "noindex,follow",
      publicIntegrationsEnabled: false,
      refreshContent: "0; url=/features/home-organizer/",
      heading: "This page has moved",
      linkHref: "/features/home-organizer/",
    });
  });

  it.each(consolidations)(
    "declares the exact consolidation for %s and retains its recoverable body",
    (source, target) => {
      const block = blockForSlug(source);

      expect(block).toContain(`**Redirects to:** \`${target}\``);
      expect(block).toMatch(/\n# [^\n]+/);
    },
  );

  it("does not leave redirect sources in suggested internal links", () => {
    const sourceRoutes = new Set<string>(
      consolidations.map(([source]) => source),
    );
    const linkedSources = [
      ...master.matchAll(/^\*\*Suggested internal links:\*\*\s*([^\n]+)$/gm),
    ].flatMap((match) =>
      [...match[1].matchAll(/`(\/[^`]+)`/g)]
        .map((routeMatch) => routeMatch[1])
        .filter((route) => sourceRoutes.has(route)),
    );

    expect(linkedSources).toEqual([]);
  });

  it("does not confuse the feature household-handoff page with the guide stub", () => {
    expect(blockForSlug("/features/household-handoff/")).not.toContain(
      "**Redirects to:**",
    );
  });
});
