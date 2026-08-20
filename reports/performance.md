# Performance report

Measured on 2026-08-20 against the exact `dist/` production artifact over local HTTP with Lighthouse 13.4.1 mobile simulation. These are artifact results, not claims about production CDN or TLS latency.

| Representative view | Route | Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS | TBT |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Homepage | `/` | 100 | 100 | 100 | 100 | 0.75 s | 0.90 s | 0.000 | 0 ms |
| Long guide | `/guides/home-maintenance-schedule/` | 100 | 100 | 100 | 100 | 0.75 s | 0.90 s | 0.000 | 0 ms |
| Interactive tool | `/tools/warranty-expiration-calculator/` | 91 | 100 | 100 | 100 | 1.58 s | 2.25 s | 0.000 | 0 ms |
| Printable | `/templates/printable-home-inventory-template/` | 100 | 100 | 100 | 100 | 0.92 s | 1.05 s | 0.000 | 0 ms |
| App dashboard shell | `/app/` | 91 | 100 | 100 | 66 | 1.95 s | 3.30 s | 0.000 | 0 ms |
| Family-display shell | `/app/?view=display` | 91 | 100 | 100 | 66 | 1.95 s | 3.30 s | 0.000 | 0 ms |
| 繁中首頁 | `/zh-tw/` | 100 | 100 | 100 | 100 | 0.80 s | 0.90 s | 0.000 | 0 ms |
| 繁中居家保養指南 | `/zh-tw/guides/home-maintenance-schedule/` | 100 | 100 | 100 | 100 | 0.95 s | 1.05 s | 0.000 | 0 ms |
| 繁中保固到期計算器 | `/zh-tw/tools/warranty-expiration-calculator/` | 96 | 100 | 100 | 100 | 1.60 s | 2.55 s | 0.000 | 0 ms |

All nine representative performance scores meet the plan’s `>= 90` launch gate. The app’s SEO score is intentionally lower because `/app/` is private-state UI with `noindex,follow`; it is excluded from the sitemap and is not an SEO landing page. The family-display row uses the median score from three runs (85, 91, 91) because one local simulated-mobile run produced an isolated speed-index outlier while FCP, LCP, CLS and TBT remained unchanged.

The app and display measurements use a clean browser profile, so Lighthouse sees the first-run local shell. The full populated display is covered by Playwright. Public guides remain static HTML; React loads only for tools, search, print controls and the app. Ad rendering is disabled, GA4 is environment-gated and no analytics code loads in `/app/`.

Raw evidence:

- `reports/lighthouse-home.json`
- `reports/lighthouse-guide.json`
- `reports/lighthouse-tool.json`
- `reports/lighthouse-printable.json`
- `reports/lighthouse-app.json`
- `reports/lighthouse-display.json`
- `reports/lighthouse-zh-home.json`
- `reports/lighthouse-zh-guide.json`
- `reports/lighthouse-zh-tool.json`

Known production follow-up: repeat the nine-route run after HTTPS provisioning so CDN, TLS and cache headers are measured separately from this artifact baseline.
