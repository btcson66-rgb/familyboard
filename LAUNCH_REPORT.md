# FamilyBoard Launch Report

Last updated: 2026-08-19 (Asia/Taipei)

This report separates deployed evidence from provider work that still requires an authenticated owner session.

| Launch gate | Status | Evidence |
|---|---|---|
| Production domain | `https://familyboard.win/` | Canonical production origin in every build |
| Domain registered in Cloudflare | PASS | Active `familyboard.win` zone read back through the Cloudflare API |
| GitHub account/org domain verification | PENDING | Requires the repository owner's authenticated GitHub settings session |
| GitHub Pages deployed | PASS | Actions run `32220891664` completed build, Playwright and deploy jobs successfully |
| GitHub Pages custom domain | PASS | Pages API returns `cname: familyboard.win`; HTTP origin returns the deployed site |
| Cloudflare apex DNS | PASS | Four official GitHub Pages A records and four AAAA records returned by Google Public DNS |
| `www` DNS/redirect | PASS | `www` CNAME points to `btcson66-rgb.github.io`; HTTP returns 301 to the apex |
| HTTPS certificate | PENDING | GitHub certificate provisioning is still in progress; HTTP content is live |
| Enforce HTTPS | PENDING | Will be enabled only after GitHub exposes a valid certificate |
| Canonical origin audit | PASS | Build audit passed all 219 HTML routes; live representative pages use `https://familyboard.win/` canonicals |
| `robots.txt` | PASS | Live HTTP 200 and declares only `sitemap-index.xml` |
| Production sitemap | PASS | Live HTTP 200; generated index contains the production sitemap |
| GSC Domain Property | PENDING | API addition returned 204; read-back permission is `siteUnverifiedUser`, so DNS ownership verification is still required |
| GSC sitemap submitted | NO | Google returns 403 until ownership verification is complete |
| GA4 FamilyBoard property | PENDING | Existing company account found; create call returned 403 because current OAuth lacks `analytics.edit` |
| GA4 FamilyBoard Web stream | PENDING | Cannot create before the property exists |
| GA4 Measurement ID installed | NO | No real `G-...` identifier exists; no placeholder was invented |
| GA4 production traffic verified | NO | Measurement is not installed yet |
| Private `/app/` GA4 exclusion | PASS | Live `/app/` has `noindex,follow`, no GA4 tag and no AdSense tag |
| Bing Webmaster Tools | DEFERRED | Import after GSC ownership and sitemap are working |
| AdSense technical connection | PASS | Public pages expose `ca-pub-7052036786750044` account meta; `ads.txt` is live; ad script remains disabled |
| AdSense review requested | PENDING | AdSense OAuth client is disabled and no controllable authenticated browser is available |
| Affiliate recommendations | READY, DISABLED | Compliant disclosure/link system exists, but activation requires a confirmed program/tag registered for this site |

## Product and quality evidence

- 200 plan-authored core pages plus 16 support pages.
- 219 generated HTML routes, including the local-first application and offline/404 routes.
- 25 distinct interactive tools and 20 printable resources.
- Content, route, metadata, similarity, internal-link, unit, accessibility and browser tests pass.
- The CI release runs six Playwright checks across desktop Chromium and Pixel 7 before deployment.
- Household values remain in browser IndexedDB and are excluded from public analytics and advertising code.

## Release evidence

- Repository: `https://github.com/btcson66-rgb/familyboard`
- Current release: `v1.0.2`
- Deployed commit: the commit identified by the signed-off `v1.0.2` tag
- Backup tag: `backup/pre-v1.0.2`
- Local backup: `D:\Fable company\backups\familyboard-pre-v1.0.2-20260819-140500.zip`

Provider approval is not guaranteed. AdSense review commonly depends on both technical access and Google's qualitative policy review.
