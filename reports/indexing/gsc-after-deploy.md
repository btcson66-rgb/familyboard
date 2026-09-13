# GSC after deploy

Status: GSC_REPORT_LAG — production is live and the sitemap remediation was accepted, but Google has not processed it yet.
Captured: 2026-09-13T12:58:03.133Z
Property: sc-domain:familyboard.win
Production deploy SHA: 6b6696266268dae4a5fe343eb5e3703141ad577d
Production deploy workflow: https://github.com/btcson66-rgb/familyboard/actions/runs/34755968752

## Sitemap readback

| Field | Value | Evidence |
|---|---|---|
| path | https://familyboard.win/sitemap-index.xml | GSC Sitemaps API |
| submitted before deploy | 2026-08-21T16:52:28.777Z | pre-deploy snapshot |
| submitted after deploy | 2026-09-13T12:50:44.846Z | GSC Sitemaps API readback after the single remediation submit |
| lastDownloaded | null | GSC Sitemaps API |
| status | registered pending / UI unable to fetch | GSC API + authenticated UI |
| isPending | true | GSC Sitemaps API |
| warnings | 0 | GSC Sitemaps API |
| errors | 0 | GSC Sitemaps API |
| discovered URLs | 0 | GSC Sitemaps API + GSC UI |

The authenticated GSC UI confirmed “已成功提交 Sitemap” and now shows submitted date 2026/9/13. Immediate UI readback still shows “無法擷取”, 0 discovered URLs, and no last-read timestamp. This is the one and only sitemap resubmission for this recovery. No Request Indexing action was sent.

## Page Indexing readback

The authenticated Page Indexing UI still reports its latest data point as 2026-09-04:

- Known URLs: 132
- Indexed: 115
- Not indexed: 17
- Excluded by noindex: 14
- Page with redirect: 3
- Discovered - currently not indexed: 0
- Crawled - currently not indexed: 0

These values are a post-deploy readback of the current GSC UI, not a claim that the new 1,016-URL sitemap has been processed. The 890 production sitemap URLs absent from the saved/current known set are therefore recorded as a discovery gap under `GSC_REPORT_LAG`, not as a technical sitemap failure.

The read-only URL Inspection sample also contains 10 indexed controls, all 14 saved noindex-category URLs, and all 3 saved redirect-category URLs. The API returned current crawl/indexing fields for those samples; the two zero-count categories have no URLs to sample. Detailed rows are in `gsc-inspection-sample.csv`.

## Waiting boundary

Google-dependent work remaining: download and process the sitemap, refresh discovered URL counts, recrawl the changed homepage/hubs/redirect targets, refresh URL Inspection data, and make independent indexing decisions. Do not resubmit the sitemap again or bulk-request indexing while this state is unchanged.
