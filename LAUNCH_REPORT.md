# FamilyBoard Launch Report

Last updated: 2026-08-20 (Asia/Taipei)

This report separates deployed evidence from provider work that still requires an authenticated owner session.

| Launch gate | Status | Evidence |
|---|---|---|
| Production domain | `https://familyboard.win/` | Canonical production origin in every build |
| Domain registered in Cloudflare | PASS | Active `familyboard.win` zone read back through the Cloudflare API |
| GitHub account/org domain verification | PENDING | Requires the repository owner's authenticated GitHub settings session |
| GitHub Pages deployed | PASS | v1.2.0 Actions run `32331898941` completed build, Playwright and deploy jobs successfully |
| GitHub Pages custom domain | PASS | Pages API returns `cname: familyboard.win`; HTTP origin returns the deployed site |
| Cloudflare apex DNS | PASS | Four official GitHub Pages A records and four AAAA records returned by Google Public DNS |
| `www` DNS/redirect | PASS | `www` CNAME points to `btcson66-rgb.github.io`; HTTP returns 301 to the apex |
| HTTPS certificate | PASS | GitHub Pages certificate is approved for `familyboard.win` and `www.familyboard.win`, expiring 2026-11-18 |
| Enforce HTTPS | PASS | Pages API returns `https_enforced: true`; HTTP and `www` redirect to the canonical HTTPS apex |
| Canonical origin audit | PASS | Build audit passed 222 HTML routes and 219 indexable URLs; live English and Traditional Chinese representatives use `https://familyboard.win/` canonicals |
| `robots.txt` | PASS | Live HTTP 200 and declares only `sitemap-index.xml` |
| Production sitemap | PASS | Live HTTP 200; generated index contains the production sitemap |
| GSC Domain Property | PASS | Company service account completed Cloudflare DNS TXT verification and reads back `siteOwner` |
| GSC sitemap submitted | PASS, PROCESSING | Submit returned 204 and read-back 200 with zero warnings/errors; `isPending=true` and `lastDownloaded=null` are monitored without repeat submission |
| GA4 FamilyBoard property | PENDING | 2026-08-20 read-back found no FamilyBoard property in account `399522869`; current OAuth has `analytics.readonly`, not `analytics.edit` |
| GA4 FamilyBoard Web stream | PENDING | Cannot create before the property exists |
| GA4 Measurement ID installed | NO | No real `G-...` identifier exists; no placeholder was invented |
| GA4 production traffic verified | NO | Measurement is not installed yet |
| Private `/app/` GA4 exclusion | PASS | Live `/app/` has `noindex,follow`, no GA4 tag and no AdSense tag |
| Bing / IndexNow | READY FOR INITIAL SUBMISSION | Root verification key and guarded 219-URL bulk submission tool ship in v1.2.2; provider receipt is recorded after deployment |
| AdSense technical connection | PASS | Public pages expose `ca-pub-7052036786750044` account meta; `ads.txt` is live; ad script remains disabled |
| AdSense review requested | PENDING | AdSense OAuth client is disabled; a controllable browser is open at Google sign-in but still requires the owner's interactive login |
| Affiliate recommendations | READY, DISABLED | Compliant disclosure/link system exists, but activation requires a confirmed program/tag registered for this site |

## Product and quality evidence

- 216 indexable English content/support pages and three independently written Traditional Chinese indexable pages.
- 222 generated HTML routes, including the local-first application and offline/404 routes; 219 routes are indexable.
- 25 distinct interactive tools and 20 printable resources.
- Reciprocal English/Traditional Chinese hreflang pairs, localized FAQ schema, visible answers and Taiwan official sources are verified for the first Chinese tranche.
- Content, route, metadata, similarity, internal-link, localized-source, unit, accessibility and browser tests pass.
- The CI release runs seven Playwright checks; one duplicate mobile lifecycle case is deliberately skipped after equivalent coverage.
- Household values remain in browser IndexedDB and are excluded from public analytics and advertising code.

## Release evidence

- Repository: `https://github.com/btcson66-rgb/familyboard`
- Current release: `v1.2.2`
- Backup tag: `backup/pre-v1.2.2`
- Local backup: `D:\Fable company\backups\familyboard-v1.2.2-source-20260820-125853.zip`

Provider approval is not guaranteed. AdSense review commonly depends on both technical access and Google's qualitative policy review.
