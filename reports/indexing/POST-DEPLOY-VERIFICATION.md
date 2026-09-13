# FAMILYBOARD-INDEXING-RECOVERY-002 — Post-Deploy Verification

Captured: 2026-09-13T12:58:03.133Z
Production: https://familyboard.win/
Production deploy SHA: `6b6696266268dae4a5fe343eb5e3703141ad577d`
Workflow: https://github.com/btcson66-rgb/familyboard/actions/runs/34755968752
Workflow conclusion: `success`
Build job: `103720278655` — full e2e passed in 45m36s
Deploy job: `103725785642` — Pages deploy passed in 9s

## Production readback

| Check | Result | Evidence |
|---|---:|---|
| Homepage HTTP / canonical / H1 / rendered body | PASS | 200; self-canonical; one H1; server HTML body present |
| `robots.txt` | PASS | HTTP 200; `User-agent: *`, `Allow: /`, sitemap declaration; no SEO-route block |
| Sitemap index | PASS | HTTP 200; points to `/sitemap-0.xml` |
| Child sitemap | PASS | HTTP 200; 1,016 `<loc>` entries |
| Sitemap URL set | PASS | 1,016 production URLs; old task-load routes absent |
| Sitemap lastmod | PASS | 11 substantive review dates; 1 URL at 2026-09-13, not a whole-site timestamp refresh |
| Sitemap integrity | PASS | 1,016/1,016 HTTP 200, indexable, self-canonical, server-rendered, H1/body present |
| Sitemap redirects / noindex / canonical conflicts | PASS | 0 / 0 / 0 |
| Contextual indexable orphans | PASS | 0 |
| Crawl depth | PASS | 1,016 reachable pages; maximum depth 2; no page over depth 3 |
| Production QA sample | PASS | 50 rows after adding 2 redirect samples; all checks pass |
| Hreflang | PASS | Reciprocal `en`, `zh-TW`, and `x-default` relationships in sampled and sitemap pages |

The live audit command was:

```text
npm run audit:indexing -- --live
Indexing audit PASS: repo=1016, sitemap=1016, orphans=0, sitemap redirects=0, sitemap noindex=0, canonical conflicts=0, GSC auth=PASS
```

QA coverage includes homepage, 8 collection hubs, 19 guides, 14 tools, 11 zh-TW pages, 2 private app pages, 6 historical GSC noindex samples, and 2 redirect samples. The two retired content URLs return HTTP 200 redirect stubs with `noindex,follow`, canonical targets to the new task-load tutorials, target HTTP 200/indexable, no sitemap membership, and no remaining internal links to the retired paths.

## URL-set result

| Set | Count | Source |
|---|---:|---|
| Repo technically indexable | 1,016 | candidate build metadata |
| Production sitemap | 1,016 | live sitemap readback |
| GSC known URLs | 132 | authenticated Page Indexing UI, latest data point 2026-09-04 |
| GSC indexed URLs | 115 | authenticated Page Indexing UI, latest data point 2026-09-04 |
| Production sitemap not known to GSC | 890 | exact URL-set intersection |
| Known but not indexed | 17 | GSC Page Indexing UI |
| Discovered - currently not indexed | 0 | GSC Page Indexing UI |
| Crawled - currently not indexed | 0 | GSC Page Indexing UI |
| GSC noindex category | 14 | GSC Page Indexing UI; live sitemap accidental noindex is 0 |
| GSC redirect category | 3 | GSC Page Indexing UI; live sitemap redirect is 0 |
| Live canonical conflicts | 0 | live sitemap integrity audit |
| Semantic collision candidates | 9 | semantic intent audit; all classified |

The 890 exact gap is not the arithmetic shortcut `1,016 - 132`: six saved GSC known URLs are outside the production sitemap, including the search/host-redirect surfaces. This remains a GSC discovery/readback gap, not a production sitemap integrity failure.

## Internal-link recovery

| Contextual inlinks | Before | After/live |
|---|---:|---:|
| 0 | 5 recorded candidate baseline; 6 live pre-deploy | 0 |
| 1 | 314 candidate baseline; 316 live pre-deploy | 317 |
| 2 | 163 candidate baseline; 162 live pre-deploy | 160 |
| 3+ | not recorded in the original summary | 539 |

The five candidate orphan pages were repaired through homepage, hub, grouped-resource, and relevant sibling links. The live crawl graph now has no indexable contextual orphan. Priority hub/source pages have 3+ relevant contextual sources, and all 1,016 pages are reachable within depth 2 in the generated crawl graph.

## Sitemap remediation decision

Production sitemap and robots were valid after deploy, but GSC still showed the exact stale lifecycle: `lastDownloaded=null`, `isPending=true`, status 0/“無法擷取”, and discovered URLs 0. Therefore the sitemap was submitted exactly once through the authenticated GSC UI at 2026-09-13; GSC API readback confirms `lastSubmitted=2026-09-13T12:50:44.846Z`.

Immediate after-submit readback remains: `lastDownloaded=null`, `isPending=true`, warnings 0, errors 0, discovered URLs 0. No second submission and no URL Inspection Request Indexing action was made.

## Scope controls

- New URL expansion stayed frozen; no new SEO landing-page family was added.
- No bulk URL Inspection or Request Indexing actions were sent.
- Existing intentional private/app and redirect-stub noindex behavior was retained.
- The two duplicate task-load routes were consolidated as redirect stubs; no other pages were merged or removed in this post-deploy phase.
- Full evidence is in `reports/indexing/`; the machine-readable files are the source of counts above.

## Google-dependent remainder

The remaining work cannot be proven locally: Google must download/process the newly submitted sitemap, update discovered URLs, recrawl changed HTML, refresh URL Inspection categories, and decide which pages merit indexing. Until that happens, the correct status is `GSC_REPORT_LAG`, not “all URLs indexed” and not “technical indexing failure.”
