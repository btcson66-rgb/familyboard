# FamilyBoard deployment

## Production

- Repository: `btcson66-rgb/familyboard`
- Branch: `main`
- Build: `npm ci && node scripts/generate-icons.mjs && npm run build`
- Artifact: `dist/`
- Host: GitHub Pages Actions
- Canonical domain: `https://familyboard.win/`

The deploy workflow runs type checks, unit tests, content audit, similarity audit and the production build before publishing. Repository variables may provide the public GA4 Measurement ID, AdSense publisher ID and affiliate tag; privileged Google, Cloudflare or GitHub credentials must never be stored in the repository.

## DNS and custom domain

Configure GitHub Pages with `familyboard.win` before the DNS cutover. The apex uses GitHub Pages A/AAAA records through Cloudflare DNS. Keep the GitHub domain-verification TXT record. `www` may point to the Pages host but the apex remains canonical.

## Rollback

Open the last successful GitHub Pages deployment, identify the corresponding commit, then revert the faulty commit through a reviewed git change and let Actions redeploy. Release tags preserve known production points. Do not change indexed slugs as a rollback shortcut.

## Domain changes

Change the central Astro `site`, brand configuration, CNAME, sitemap/robots references, GitHub Pages custom domain, Cloudflare DNS and GSC properties as one migration. Add redirects before changing public canonicals.

