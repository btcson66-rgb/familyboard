# Performance report

Measured on 2026-08-20 against the exact `dist/` production artifact over local HTTP with Lighthouse 13.4.1 mobile simulation. These are artifact results, not claims about production CDN or TLS latency.

| Representative view | Route | Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS | TBT |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Homepage | `/` | 100 | 100 | 100 | 100 | 0.75 s | 0.90 s | 0.000 | 0 ms |
| Long guide | `/guides/home-maintenance-schedule/` | 100 | 100 | 100 | 100 | 0.75 s | 0.90 s | 0.000 | 0 ms |
| Interactive tool | `/tools/warranty-expiration-calculator/` | 97 | 100 | 100 | 100 | 1.43 s | 2.40 s | 0.000 | 0 ms |
| Printable | `/templates/printable-home-inventory-template/` | 98 | 100 | 100 | 100 | 1.58 s | 2.25 s | 0.000 | 0 ms |
| App dashboard shell | `/app/` | 91 | 100 | 100 | 66 | 1.95 s | 3.31 s | 0.000 | 0 ms |
| Family-display shell | `/app/?view=display` | 91 | 100 | 100 | 66 | 1.95 s | 3.30 s | 0.000 | 0 ms |

All representative performance scores meet the plan’s `>= 90` launch gate. The app’s SEO score is intentionally lower because `/app/` is private-state UI with `noindex,follow`; it is excluded from the sitemap and is not an SEO landing page.

The app and display measurements use a clean browser profile, so Lighthouse sees the first-run local shell. The full populated display is covered by Playwright. Public guides remain static HTML; React loads only for tools, search, print controls and the app. Ad rendering is disabled, GA4 is environment-gated and no analytics code loads in `/app/`.

Raw evidence:

- `reports/lighthouse-home.json`
- `reports/lighthouse-guide.json`
- `reports/lighthouse-tool.json`
- `reports/lighthouse-printable.json`
- `reports/lighthouse-app.json`
- `reports/lighthouse-display.json`

Known production follow-up: repeat the six-route run after HTTPS provisioning so CDN, TLS and cache headers are measured separately from this artifact baseline.
