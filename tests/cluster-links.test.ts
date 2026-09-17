import { describe, expect, it } from "vitest";
import { clusterSiblings, type LinkablePage } from "../src/lib/cluster-links";

const page = (route: string, cluster = "maintenance", extra: Partial<LinkablePage> = {}): LinkablePage => ({
  route,
  cluster,
  indexable: true,
  ...extra,
});

const cluster = (size: number, prefix = "/guides/p") =>
  Array.from({ length: size }, (_, index) => page(`${prefix}${String(index).padStart(3, "0")}/`));

describe("clusterSiblings", () => {
  it("returns nothing when the page has no cluster peers", () => {
    const only = page("/guides/a/");
    expect(clusterSiblings(only, [only])).toEqual([]);
  });

  it("never links to itself, to non-indexable pages or to redirect stubs", () => {
    const current = page("/guides/b/");
    const all = [
      page("/guides/a/"),
      current,
      page("/guides/c/", "maintenance", { indexable: false }),
      page("/guides/d/", "maintenance", { redirectTo: "/guides/a/" }),
      page("/guides/e/"),
    ];
    const routes = clusterSiblings(current, all).map((item) => item.route);
    expect(routes).not.toContain("/guides/b/");
    expect(routes).not.toContain("/guides/c/");
    expect(routes).not.toContain("/guides/d/");
    expect(routes).toEqual(expect.arrayContaining(["/guides/a/", "/guides/e/"]));
  });

  it("stays inside the page's own cluster", () => {
    const current = page("/guides/b/", "appliances");
    const all = [page("/guides/a/", "maintenance"), current, page("/guides/c/", "appliances")];
    expect(clusterSiblings(current, all).map((item) => item.route)).toEqual(["/guides/c/"]);
  });

  it("honours the exclude list so curated related links are not repeated", () => {
    const ring = cluster(10);
    const current = ring[0];
    const excluded = [ring[1].route, ring[9].route];
    const routes = clusterSiblings(current, ring, { exclude: excluded }).map((item) => item.route);
    for (const route of excluded) expect(routes).not.toContain(route);
  });

  it("gives every page in a cluster an even share of inlinks", () => {
    const ring = cluster(60);
    const inlinks = new Map(ring.map((item) => [item.route, 0]));
    for (const current of ring)
      for (const sibling of clusterSiblings(current, ring, { count: 6 }))
        inlinks.set(sibling.route, (inlinks.get(sibling.route) ?? 0) + 1);

    const counts = [...inlinks.values()];
    expect(Math.min(...counts)).toBeGreaterThanOrEqual(1);
    // Even distribution is the whole point: no page may hoard link equity.
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(2);
  });

  it("is deterministic and capped at the requested count", () => {
    const ring = cluster(40);
    const first = clusterSiblings(ring[5], ring, { count: 6 }).map((item) => item.route);
    const second = clusterSiblings(ring[5], ring, { count: 6 }).map((item) => item.route);
    expect(first).toEqual(second);
    expect(first).toHaveLength(6);
    expect(new Set(first).size).toBe(6);
  });
});
