# FamilyBoard External Actions

Only the following provider-side actions remain. All site code, DNS records and deployment wiring that can be completed without an interactive owner login are already in place.

## 1. Google Search Console ownership

1. Open the existing company Search Console account.
2. Select the already-added Domain Property `familyboard.win`.
3. Obtain Google's actual DNS TXT verification value.
4. Add that exact TXT record to the active `familyboard.win` Cloudflare zone and keep it permanently.
5. Click Verify, then rerun `npm run gsc:bootstrap -- --apply` with the local OAuth path variables.

Expected completion evidence: permission is no longer `siteUnverifiedUser`, the sitemap submit call succeeds, and a subsequent sitemap GET returns Google state.

## 2. Google Analytics 4 edit authorization

The existing Analytics account is `accounts/399522869`; it currently contains the RoomFeng, WorthCalc and FunnyTools properties. Reauthorize the company OAuth client with `analytics.edit`, then run:

```powershell
$env:GA_OAUTH_CLIENT_PATH = 'D:\funnytools\api token\fable-ops-oauth-client.json'
$env:GA_OAUTH_TOKEN_PATH = 'D:\funnytools\api token\fable-ops-token.json'
$env:GA_ACCOUNT_ID = '399522869'
npm.cmd run ga4:bootstrap -- --apply
```

The script is idempotent and creates only:

- property display name: `FamilyBoard`;
- stream display name: `FamilyBoard Web`;
- default URL: `https://familyboard.win/`.

After a real Measurement ID is returned, set the GitHub repository variable `PUBLIC_GA4_MEASUREMENT_ID` and redeploy. Verify public Realtime traffic and recheck that `/app/` contains no GA4 tag.

## 3. AdSense site review

The public publisher identifier, account meta and `ads.txt` are installed; no visible ad script is enabled. The existing AdSense OAuth client currently returns `disabled_client`, so add `familyboard.win` and request review in an authenticated AdSense session. Record Google's exact site status after submission. Do not enable visible ads until Google approves the site.

## 4. Affiliate tracking identity

Confirm the program and tracking ID registered to use `familyboard.win`. An existing `funnytools-20` Amazon tag was found in another product, but it is deliberately not reused without confirmation that FamilyBoard is registered in that Associates account. Once confirmed, set `PUBLIC_AMAZON_ASSOCIATES_TAG`; the site then emits contextual links with disclosure and `rel="sponsored nofollow noopener"`.

## 5. GitHub verified domain and Bing

Verify `familyboard.win` in the repository owner's GitHub Pages domain settings when an authenticated session is available. After GSC is verified and its sitemap works, import or add the site to Bing Webmaster Tools and record the provider read-back.
