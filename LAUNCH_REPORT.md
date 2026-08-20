# FamilyBoard Launch Report

Last updated: 2026-08-20 (Asia/Taipei)

This report separates deployed evidence from provider work that still requires an authenticated owner session.

| Launch gate | Status | Evidence |
|---|---|---|
| Production domain | `https://familyboard.win/` | Canonical production origin in every build |
| Domain registered in Cloudflare | PASS | Active `familyboard.win` zone read back through the Cloudflare API |
| GitHub account/org domain verification | PENDING | Requires the repository owner's authenticated GitHub settings session |
| GitHub Pages deployed | PASS | GA4-enabled production rebuild run `32335009430` completed build, Playwright and deploy jobs successfully |
| GitHub Pages custom domain | PASS | Pages API returns `cname: familyboard.win`; HTTP origin returns the deployed site |
| Cloudflare apex DNS | PASS | Four official GitHub Pages A records and four AAAA records returned by Google Public DNS |
| `www` DNS/redirect | PASS | `www` CNAME points to `btcson66-rgb.github.io`; HTTP returns 301 to the apex |
| HTTPS certificate | PASS | GitHub Pages certificate is approved for `familyboard.win` and `www.familyboard.win`, expiring 2026-11-18 |
| Enforce HTTPS | PASS | Pages API returns `https_enforced: true`; HTTP and `www` redirect to the canonical HTTPS apex |
| Canonical origin audit | PASS | Build audit passed 223 HTML routes and 219 indexable URLs; live English and Traditional Chinese representatives use `https://familyboard.win/` canonicals |
| `robots.txt` | PASS | Live HTTP 200 and declares only `sitemap-index.xml` |
| Production sitemap | PASS | Live HTTP 200; generated index contains the production sitemap |
| GSC Domain Property | PASS | Company service account completed Cloudflare DNS TXT verification and reads back `siteOwner` |
| GSC sitemap submitted | PASS, PROCESSING | Submit returned 204 and read-back 200 with zero warnings/errors; `isPending=true` and `lastDownloaded=null` are monitored without repeat submission |
| GA4 FamilyBoard property | PASS | Analytics Admin API created and read back property `550742142` under account `399522869` |
| GA4 FamilyBoard Web stream | PASS | Analytics Admin API created and read back stream `15468194519`, display name `FamilyBoard Web`, default URL `https://familyboard.win/` |
| GA4 Measurement ID installed | PASS | GitHub variable `PUBLIC_GA4_MEASUREMENT_ID` reads back as `G-D624R3YVEV`; production English and Traditional Chinese HTML contain this exact ID |
| GA4 production traffic verified | PASS, INTERNAL VALIDATION INCLUDED | Browser collection request returned HTTP 204 and Realtime API returned data. Activation checks are marked `codex_launch_validation`; do not interpret them as natural traffic |
| Private App analytics exclusion | PASS | `/app/` and `/zh-tw/app/` build artifacts have `noindex,follow`, no GA4 tag and no AdSense tag; production verification follows the v1.3.0 deploy |
| Bing / IndexNow | RECEIVED, INDEXING UNKNOWN | Root verification key and guarded 219-URL bulk submission tool ship in v1.2.2; initial full submission returned HTTP 200. Receipt is not proof of indexing or ranking |
| AdSense technical connection | PASS | Public pages expose `ca-pub-7052036786750044` account meta; `ads.txt` is live; ad script remains disabled |
| AdSense review requested | PENDING | AdSense OAuth client is disabled; a controllable browser is open at Google sign-in but still requires the owner's interactive login |
| Affiliate recommendations | READY, DISABLED | Compliant disclosure/link system exists, but activation requires a confirmed program/tag registered for this site |

## Product and quality evidence

- 216 indexable English content/support pages and three independently written Traditional Chinese indexable pages.
- 223 generated HTML routes, including English and Traditional Chinese local-first application shells plus offline/404 routes; 219 routes are indexable.
- 25 distinct interactive tools and 20 printable resources.
- Reciprocal English/Traditional Chinese hreflang pairs, localized FAQ schema, visible answers and Taiwan official sources are verified for the first Chinese tranche.
- Content, route, metadata, similarity, internal-link, localized-source, unit, accessibility and browser tests pass.
- The CI release runs eight Playwright checks across desktop and mobile; one duplicate mobile lifecycle case is deliberately skipped after equivalent coverage.
- Household values remain in browser IndexedDB and are excluded from public analytics and advertising code.

## Release evidence

- Repository: `https://github.com/btcson66-rgb/familyboard`
- Release candidate: `v1.3.0` (production evidence is added after CI and live verification)

Provider approval is not guaranteed. AdSense review commonly depends on both technical access and Google's qualitative policy review.
