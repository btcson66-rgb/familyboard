# FamilyBoard Search Setup

## Production search assets

- Canonical origin: `https://familyboard.win/`
- Robots: `https://familyboard.win/robots.txt`
- Sitemap: `https://familyboard.win/sitemap-index.xml`
- Sitemap source count: 216 indexable content/support pages; `/app/`, offline and 404 routes are excluded as intended.
- Build audit: 219 HTML routes, no broken internal links, no duplicate route/title/description blockers.

## Search Console execution record

On 2026-08-19 the authorized Search Console API successfully added `sc-domain:familyboard.win` (`HTTP 204`). Immediate read-back returned `siteUnverifiedUser`. Sitemap submission and read-back both returned `HTTP 403`, which confirms DNS ownership is the remaining gate rather than a public sitemap failure.

Do not repeatedly submit the sitemap. Submit it once after Google ownership verification succeeds, then monitor Google's `lastDownloaded`, warnings and errors.

## Representative indexability samples

The deployed HTTP origin returned 200 for the homepage, a feature, a guide, an interactive tool, a printable template and a hub. Their generated canonical URLs use the HTTPS production origin. `/app/` intentionally uses `noindex,follow`; public content routes are indexable.

## Learning loop

The Codex heartbeat `FamilyBoard 上線與成效巡檢` runs daily at 09:15 Asia/Taipei. The repository workflow `FamilyBoard Live Health` checks live availability twice per hour. GSC query/page data must remain marked unavailable until ownership, sitemap processing and actual impressions exist.
