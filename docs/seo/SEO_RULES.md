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
