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

## v1.3.0 UI and localization baseline

Measured after the 2026-08-20 UI/UX and Traditional Chinese app release against the same production artifact. Homepage results remain excellent; the private app shells are reported separately because their `noindex` status intentionally lowers the Lighthouse SEO category.

| Representative view | Route | Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS | TBT |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| English homepage | `/` | 100 | 100 | 96 | 100 | 0.75 s | 0.90 s | 0.000 | 17 ms |
| Traditional Chinese homepage | `/zh-tw/` | 100 | 100 | 96 | 100 | 0.98 s | 1.05 s | 0.000 | 0 ms |
| English private app | `/app/` | 89 | 100 | 100 | 69 | 2.03 s | 3.45 s | 0.048 | 0 ms |
| Traditional Chinese private app | `/zh-tw/app/` | 87 | 100 | 100 | 69 | 2.10 s | 3.75 s | 0.041 | 0 ms |

The two public homepages meet the 90+ launch threshold. The interactive local-first app shells remain below 90 in simulated mobile performance and are a documented follow-up target; they have zero total blocking time and pass accessibility and best-practice checks at 100. The `69` app SEO scores are expected because both private app routes deliberately use `noindex,follow`, omit GA4 and advertising, and stay out of the sitemap.

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
- `reports/lighthouse-home-v1.3.0.json`
- `reports/lighthouse-zh-home-v1.3.0.json`
- `reports/lighthouse-app-v1.3.0-after.json`
- `reports/lighthouse-zh-app-v1.3.0-after.json`

Known production follow-up: repeat the nine-route run after HTTPS provisioning so CDN, TLS and cache headers are measured separately from this artifact baseline.
