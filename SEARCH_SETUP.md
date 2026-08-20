# FamilyBoard Search Setup

## Production search assets

- Canonical origin: `https://familyboard.win/`
- Robots: `https://familyboard.win/robots.txt`
- Sitemap: `https://familyboard.win/sitemap-index.xml`
- Sitemap source count: 219 indexable pages: 216 English and three independently written Traditional Chinese pages; `/app/`, offline and 404 routes are excluded as intended.
- Build audit: 222 HTML routes, no broken internal links, no duplicate route/title/description blockers.
- Locale audit: reciprocal `en`／`zh-TW`／`x-default` hreflang on direct pairs; untranslated English pages send the language switch to the Traditional Chinese home instead of inventing a translated route.

## Search Console execution record

On 2026-08-19 the authorized Search Console API successfully added `sc-domain:familyboard.win` (`HTTP 204`). A fresh 2026-08-20 read-back still returned `siteUnverifiedUser`; sitemap read-back returned `HTTP 403`. This confirms DNS ownership remains the gate rather than a public sitemap failure.

Do not repeatedly submit the sitemap. Submit it once after Google ownership verification succeeds, then monitor Google's `lastDownloaded`, warnings and errors.

## Representative indexability samples

The deployed HTTP origin returned 200 for the homepage, a feature, a guide, an interactive tool, a printable template and a hub. Their generated canonical URLs use the HTTPS production origin. `/app/` intentionally uses `noindex,follow`; public content routes are indexable.

## Learning loop

The Codex heartbeat `FamilyBoard 上線與成效巡檢` runs daily at 09:15 Asia/Taipei. The repository workflow `FamilyBoard Live Health` checks live availability twice per hour. GSC query/page data must remain marked unavailable until ownership, sitemap processing and actual impressions exist.
