# FamilyBoard deployment

## Production

- Repository: `btcson66-rgb/familyboard`
- Branch: `main`
- Preflight: `npm ci && node scripts/generate-icons.mjs && npm run preflight`
- Build: `npm run build`
- Artifact: `dist/`
- Host: GitHub Pages Actions
- Canonical domain: `https://familyboard.win/`

The deploy workflow runs lint, type checks, unit tests, content and similarity audits, the production build and Playwright before publishing. Repository variables may provide the public GA4 Measurement ID, AdSense publisher ID and affiliate tag; privileged Google, Cloudflare or GitHub credentials must never be stored in the repository.

Environment/config values:

- `PUBLIC_GA4_MEASUREMENT_ID`: leave empty until a real FamilyBoard GA4 web stream exists.
- `PUBLIC_ADSENSE_PUBLISHER_ID`: public `pub-...` identifier used for ownership metadata only; visible ad rendering remains disabled until approval.
- `PUBLIC_AMAZON_ASSOCIATES_TAG`: leave empty until FamilyBoard is registered for the confirmed Associates account. A non-empty tag enables contextual blocks.

## DNS and custom domain

Configure GitHub Pages with `familyboard.win` before the DNS cutover and keep `public/CNAME` equal to `familyboard.win`.

Cloudflare DNS is DNS-only during certificate provisioning:

- Apex A: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- Apex AAAA: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
- `www` CNAME: `btcson66-rgb.github.io`
- Preserve the GitHub `_github-pages-challenge-...` TXT ownership record.

Wait for the Pages health API to report `is_https_eligible: true` and for the certificate to exist, then enable HTTPS enforcement in repository Pages settings. Verify the apex and `www` behavior, certificate hostname, canonical, robots, sitemap, app noindex and representative routes over HTTPS.

## Rollback

Before every main push, create a zip snapshot, `backup/pre-vX.Y.Z` tag and release version tag only after `npm run preflight` passes. To roll back, identify the last healthy release tag, create a normal revert commit (do not reset shared history), rerun preflight and let Actions redeploy. Do not change indexed slugs as a rollback shortcut.

## Domain changes

Change the central Astro `site`, brand configuration, CNAME, sitemap/robots references, GitHub Pages custom domain, Cloudflare DNS and GSC properties as one migration. Add redirects before changing public canonicals.
