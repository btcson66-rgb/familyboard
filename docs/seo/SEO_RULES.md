# SEO / Public-Page Rules

These rules apply to any change touching a page a visitor or Googlebot can
reach on `familyboard.win`. They exist because this repo's content pipeline
has already leaked developer/AI instructions into production HTML once.

## Never render developer instructions into public pages

Never render developer instructions, editorial notes, AI prompts,
TODO text, placeholder copy, or implementation specifications
into user-facing production pages.

Before finishing any public-page change:
1. run the production build (`npm run build`);
2. run the content/SEO audit (`npm run audit:content`, `npm run audit:seo`);
3. inspect the rendered `dist/**/*.html` for accidental instruction leakage —
   not just the source markdown, since a comment or note in source can be
   legitimate while the same text in rendered HTML is not.

## Never fabricate data

Do not generate fake:
- reviews / ratings / release history / testimonials
- authors / statistics / citations / product usage claims.

If real data is not available, say "no data" — do not estimate or backfill.

## Do not mass-create or mass-delete pages

Do not mass-create or mass-delete SEO pages without explicit instruction.
A single optimization pass should not add more than a few pages, and never
without substantive, non-duplicate content.

## This repo's content pipeline (read before editing content)

`src/content/pages/` is generated — `scripts/import-master.mjs` deletes and
rebuilds it on every build (`npm run build` runs `import:content` first).
**Never edit `src/content/pages/*.md` directly — edit
`docs/launch-content-master.md`** (or, for the small set of pages defined
inline in the script itself — e.g. `/search/`, `/editorial-policy/`,
`/terms/` — edit `scripts/import-master.mjs`). Edits to
`src/content/pages/*.md` are silently discarded on the next build.

`src/content/pages-zh-tw/` is **not** generated and must be edited directly.

## Automated defense

`scripts/postbuild-audit.mjs` (`npm run audit:seo`, and automatically via the
`postbuild` npm hook) scans every built `dist/**/*.html` page for a set of
instruction-leak / placeholder phrases (see `instructionLeakPatterns` in that
file) and fails the build (non-zero exit) if any public page matches. It
allowlists routes that legitimately discuss editorial process, such as
`/editorial-policy/` — keep that list narrow and explicit. If you need to add
a new phrase to the leak scanner, or a new allowlisted route, do it there.

## Keep the footer small

`src/components/Footer.astro` carries **site-level destinations only**:
collections, product surfaces, company and legal. It must not carry per-article
links.

It previously carried 265 English / 433 Traditional Chinese deep links on every
page, which made the sitewide footer **67% of the average page's HTML** and spread
internal link equity across ~370 links per page. See
`docs/seo/RECOVERY-2026-09-17.md` for the measurements.

Crawl paths to individual pages are the job of:

- the collection hubs (`/guides/`, `/tools/`, `/checklists/`, `/templates/`,
  `/features/`, and their `/zh-tw/` counterparts), which list their own children —
  both locales must keep doing this;
- the curated `related` list in each page's front matter;
- `src/lib/cluster-links.ts`, which links every page to its nearest neighbours on
  its cluster ring so no page depends on a single inlink.

`scripts/indexing-audit.mjs` strips `<header|footer|nav|aside>` before counting
inlinks, so **footer links do not count as discovery** — adding links there does
not fix an orphan, it only adds boilerplate. The e2e suite asserts an exact footer
link count; if that assertion fails because links were added back, fix the footer
rather than the number.

## The sitemap is split on purpose

`scripts/split-sitemap.mjs` runs in the `postbuild` hook and splits the
`@astrojs/sitemap` output into ten per-locale, per-section segments, rewriting
`sitemap-index.xml` to match. Search Console reports coverage *per sitemap file*,
so the segments are what makes "which part of the site is Google skipping?"
answerable — do not collapse them back into one file.

The splitter post-processes the integration's own output, so hreflang alternates,
`lastmod` and the `filter`/`serialize` rules in `astro.config.mjs` remain the
single source of truth. `scripts/postbuild-audit.mjs` audits every segment and
checks hreflang reciprocity across the merged set.

## Traditional Chinese pages belong to one collection

`/zh-tw/` routes are owned by `src/content/pages-zh-tw/` and rendered by
`src/pages/zh-tw/[...slug].astro`. `scripts/import-master.mjs` drops any `/zh-tw/`
route from the English record set and throws if the master defines one with no
zh-TW counterpart. Do not remove that filter: the duplicates it prevents produced
54 conflicting entries in `src/generated/sitemap-pages.json`, cross-locale links
in the English hubs, and Traditional Chinese results in the English site search.

## Tool pages must server-render

`<ToolWorkbench>` is mounted with `client:load`, never `client:only`. Under
`client:only` the tool did not exist in the HTML at all and crawlers saw an empty
div on all 113 `/tools/` pages. The submit button ships `disabled` and enables on
mount so the pre-hydration window cannot produce a dead click; `client:visible`
deadlocks with that gate, because the element must be enabled before it is
scrolled into view.
