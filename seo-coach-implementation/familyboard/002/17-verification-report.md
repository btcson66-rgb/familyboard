# Verification report

002 verification completed in the isolated worktree.

- `npm.cmd run check`: PASS — lint, typecheck (0 errors), 24 unit tests, content audit, similarity audit, Astro build, post-build SEO/link/sitemap audit and monitor expectations.
- Build: 1,025 HTML routes; 1,018 indexable routes; sitemap 1,018 URLs.
- 001 QA: PASS — 0 broken route references and 0 route orphans excluding system routes.
- Contextual graph: PASS — 1,018 indexable pages; 5 pages have zero main-content inlinks (1 `CONTEXTUAL_ORPHAN` and 4 `FOOTER_DEPENDENT`) for review; global nav/header/footer excluded.
- Targeted browser QA: PASS on Chromium and Pixel 7 for all three selected pages; HTTP 200, canonical, H1, JSON-LD, bridge links, console and axe checks passed.
- Targeted layout QA: PASS on Chromium and Pixel 7; no horizontal overflow and no page errors on all three selected pages.
- Negative controls: PASS — 6 unrelated public pages contained none of the three new bridge markers.
- Private app regression: `/app/` and `/zh-tw/app/` remain noindex, outside the sitemap, without public analytics or SEO bridge content; Chromium lifecycle and first-connected-visit smoke passed, while the existing mobile lifecycle cases were skipped by the suite.
- Public SEO smoke: PASS on Chromium and Pixel 7 (2 tests).
- `git diff --check`: PASS.
- Full 001 accessibility matrix: `UNVERIFIED_FULL_SUITE` and not claimed as a full-suite pass.

Sitemap and route counts show no URL expansion. No redirect, canonical consolidation, noindex, delete, merge, or new URL operation was executed.

GSC status remains `GSC_AUTH_MISSING`; Google index status remains `UNKNOWN`.
