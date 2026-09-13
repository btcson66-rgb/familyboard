# FAMILYBOARD-INDEXING-RECOVERY-001 — final post-deploy evidence

Generated: 2026-09-13T12:58:03.837Z
Mode: POST-DEPLOY LIVE production + GSC readback
Implementation merge SHA: 752fb29dcebf4759e58f80462e28cb0ae88110b2
Production deploy SHA: 6b6696266268dae4a5fe343eb5e3703141ad577d

## Outcome

This recovery kept new URL expansion frozen, repaired discovery paths and duplicate-route handling, and was deployed successfully. It does not claim that Google has indexed all production URLs; the current GSC Page Indexing report is still dated 2026-09-04 and the new sitemap remains pending processing.

## A–N current evidence

- **A. Repo technically indexable:** 1016 candidate URLs after the two-locale merge redirect.
- **B. Production sitemap:** 1016 URLs in the live sitemap.
- **C. GSC known URLs:** 132.
- **D. GSC indexed URLs:** 115.
- **E. Current GSC categories:** 890 production sitemap URLs are not in the current GSC known set; 17 known URLs are not indexed; Discovered-not-indexed=0; Crawled-not-indexed=0; noindex=14; redirect=3; canonical conflicts in the audited sitemap=0; semantic candidates=9.
- **F. Three root causes:** (1) GSC sitemap lifecycle is pending/stale: API lastDownloaded=null, isPending=true, UI status was unable to read and discovered 0; (2) the original site graph had five contextual orphans and hub navigation did not cover the collection paths; (3) duplicate task-load routes and an old route in Footer/zh-TW home created weak discovery and redirect-stub links.
- **G. Actual source changes:** docs/launch-content-master.md, src/components/Footer.astro, src/pages/index.astro, src/pages/[...slug].astro, src/pages/zh-tw/[...slug].astro, src/pages/zh-tw/index.astro, src/content/pages-zh-tw/familyboard-household-task-load-calculator-tutorial.md, src/content/pages/081-guides--home-inventory-checklist.md, scripts/indexing-audit.mjs, scripts/monitor-checks.mjs, tests/e2e/site.spec.ts, package.json.
- **H. Merged pages:** English /guides/familyboard-household-task-load-calculator-tutorial/ and zh-TW /zh-tw/guides/familyboard-household-task-load-calculator-tutorial/ now redirect to the richer task-load tutorials.
- **I. Redirects:** the two merged content routes use the existing noindex redirect-stub contract; host/protocol redirects remain infrastructure 301s.
- **J. Maintained noindex:** /app/, /zh-tw/app/, /offline/ and redirect stubs remain noindex. Current live sitemap audit found accidental noindex=0.
- **K. Content strengthened:** the homepage now explains collection paths and trust/product boundaries; the guides hub is grouped by household job; plant-care log and household-account tool metadata separate their jobs; no bulk content expansion was made.
- **L. Contextual inlinks:** before (recorded baseline) 0=5, 1=314, 2=163; candidate after 0=0, 1=317, 2=160; live production after deploy 0=0, 1=317, 2=160; full distribution is in contextual-inlinks.csv.
- **M. GSC sitemap:** lastSubmitted=2026-09-13T12:50:44.846Z; lastDownloaded=null; status=registered_pending / UI unable to fetch; warnings=0; errors=0; discovered URLs=0. The sitemap was submitted exactly once after production deploy; no repeat submission was made.
- **N. Google-dependent waiting:** Google must re-download the sitemap, recrawl changed hub/home/redirect HTML, refresh URL Inspection, and make its own indexing decisions. A post-deploy GSC snapshot is therefore recorded as pending rather than fabricated.

## Gates

| Gate | Result | Evidence |
|---|---:|---|
| Production crawlable / sitemap HTTP 200 | PASS | sitemap-integrity.csv |
| Robots allow + sitemap declaration | PASS | live robots.txt |
| Sitemap redirects | 0 | sitemap-integrity.csv |
| Sitemap noindex | 0 | sitemap-integrity.csv |
| Canonical conflicts | 0 | sitemap-integrity.csv |
| Indexable contextual orphans | 0 live post-deploy; candidate=0 | contextual-inlinks.csv |
| Priority pages with 3+ contextual sources | PASS | contextual-inlinks.csv |
| Semantic collisions classified | PASS | semantic-intent-collision.csv |
| New URL expansion | PASS — frozen | no new landing-page family added |

## Hub architecture

Existing collection hubs are used for guides, tools, features, checklists and templates. They now cross-link through relevant next-layer cards; the guides hub groups existing pages under maintenance, appliances, inventory-warranty, records-emergency, household-operations, tools, product and support. No new hub URLs were created.

## Inspection and QA

gsc-inspection-sample.csv contains up to 10 indexed controls, all saved noindex examples, all saved redirect examples, and explicit zero-row notes for current discovered/crawled categories. production-qa.csv covers the homepage, collection hubs, guides, tools, zh-TW pages, app noindex surfaces and historical GSC noindex samples. No Request Indexing action was sent.

## Deployment boundary

POST-DEPLOY-VERIFICATION.md and gsc-after-deploy.md record the required post-merge production readback. Production deploy workflow: https://github.com/btcson66-rgb/familyboard/actions/runs/34755968752


## Exact URL-set note

The live URL-set diff contains 890 production sitemap URLs absent from the saved GSC known set. The candidate repo diff contains 890 candidate URLs absent from that set; six saved known URLs are outside the current production sitemap (including host redirects and private/search surfaces), so the exact intersection differs from the simple 1,018 minus 132 size gap.
