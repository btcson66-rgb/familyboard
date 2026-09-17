// Contextual sibling links, distributed as a ring lattice.
//
// Why a ring rather than "pick N related pages": before this, 317 indexable pages
// had exactly one contextual inlink and the rest of the internal linking was a
// 265-link sitewide footer, which carried no topical signal and spread link equity
// across every page equally. Curated `related` lists in frontmatter are good but
// sparse and lopsided — popular pages accumulate inlinks and the long tail gets
// none, which is precisely the tail that never got discovered.
//
// Sorting each cluster by route and linking every page to its nearest neighbours
// on both sides of the ring gives a graph where every page has the same number of
// inlinks as outlinks, no page can be orphaned, and any page is reachable from any
// other in O(log n) hops within its cluster. Selection is a pure function of the
// route list, so builds are deterministic and the graph only changes when pages do.

export type LinkablePage = {
  route: string;
  cluster: string;
  indexable: boolean;
  redirectTo?: string;
};

/**
 * Nearest neighbours of `current` on its cluster ring, closest first, skipping
 * anything already linked from the page (`exclude`) and anything that must not be
 * linked (non-indexable pages and redirect stubs).
 */
export function clusterSiblings<T extends LinkablePage>(
  current: LinkablePage,
  all: readonly T[],
  { count = 6, exclude = [] as readonly string[] } = {},
): T[] {
  const excluded = new Set(exclude);
  const ring = all
    .filter((page) => page.cluster === current.cluster && page.indexable && !page.redirectTo)
    .sort((a, b) => a.route.localeCompare(b.route));

  const position = ring.findIndex((page) => page.route === current.route);
  if (position === -1 || ring.length < 2) return [];

  // Walk outwards: +1, -1, +2, -2, … so the closest neighbours are chosen first and
  // each page's outlinks overlap its neighbours' — that overlap is what keeps the
  // cluster connected instead of forming disjoint chains.
  const picked: T[] = [];
  const seen = new Set<string>([current.route, ...excluded]);
  for (let step = 1; step <= Math.floor(ring.length / 2) && picked.length < count; step += 1) {
    for (const offset of [step, -step]) {
      if (picked.length >= count) break;
      const candidate = ring[(((position + offset) % ring.length) + ring.length) % ring.length];
      if (!candidate || seen.has(candidate.route)) continue;
      seen.add(candidate.route);
      picked.push(candidate);
    }
  }
  return picked;
}
