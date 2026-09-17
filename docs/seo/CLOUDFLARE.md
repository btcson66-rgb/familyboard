# Cloudflare configuration for familyboard.win

FamilyBoard is served by GitHub Pages, which cannot issue HTTP redirects, set
response headers, or serve Brotli on its own. Cloudflare currently sits in front
of the domain in **DNS-only** mode, so none of its features are active either.

Turning the proxy on (the orange cloud) is what makes the items below possible.
Everything here is optional — the site is correct without it — but each item
removes a real limitation that the static host cannot fix from inside the repo.

## 0. Enable the proxy

In Cloudflare → DNS, switch the apex `A`/`AAAA` records and the `www` `CNAME`
from *DNS only* (grey) to *Proxied* (orange).

Before doing this, confirm in the repository's **Settings → Pages** that the
custom domain is verified and HTTPS is enforced. Then set Cloudflare → SSL/TLS →
Overview to **Full (strict)**. Any weaker mode (Flexible in particular) creates a
redirect loop with Pages' own HTTPS enforcement, and Flexible additionally serves
the origin over plain HTTP.

Verify after the switch, before going further:

```
curl -sSI https://familyboard.win/            # expect 200 and a cf-ray header
curl -sSI https://www.familyboard.win/        # expect 301 to the apex
curl -sS  https://familyboard.win/robots.txt  # expect the sitemap line
```

## 1. Real 301 redirects for merged pages

Two routes are duplicates that were merged into richer pages. They currently ship
as `noindex` HTML stubs with `<meta http-equiv="refresh">` and a canonical to the
target. Google does follow those and treats them as redirects, but they are
weaker than a 301, they cost a full page load, and they keep two thin pages in the
crawl.

Cloudflare → Rules → **Redirect Rules**, one rule, type *Dynamic*:

| Field | Value |
|---|---|
| Expression | `http.request.uri.path in {"/guides/familyboard-household-task-load-calculator-tutorial/" "/zh-tw/guides/familyboard-household-task-load-calculator-tutorial/"}` |
| Target URL | `concat("https://familyboard.win", regex_replace(http.request.uri.path, "familyboard-household-task-load-calculator-tutorial", "familyboard-task-load-calculator-tutorial"))` |
| Status | 301 |
| Preserve query string | on |

Verify:

```
curl -sSI https://familyboard.win/guides/familyboard-household-task-load-calculator-tutorial/ | head -3
# expect: HTTP/2 301  +  location: .../guides/familyboard-task-load-calculator-tutorial/
```

Once these return 301, the HTML stubs are dead weight. Remove them by deleting the
`redirectTo` entries from `docs/launch-content-master.md` and the matching zh-TW
page in `src/content/pages-zh-tw/`, then rebuild — but only after confirming the
301s are live, or the URLs will 404 for anyone holding the old link.

## 2. Compression

GitHub Pages serves gzip but not Brotli. Cloudflare → Speed → Optimization →
Content Optimization: enable **Brotli**. On this site's HTML and on the tool
bundle, Brotli is roughly 15–20% smaller than gzip at no cost.

## 3. Cache the fingerprinted assets properly

Everything Astro emits under `/_astro/` carries a content hash in its filename, so
it is safe to cache permanently. Cloudflare → Rules → **Cache Rules**:

| Field | Value |
|---|---|
| Expression | `starts_with(http.request.uri.path, "/_astro/")` |
| Cache eligibility | Eligible for cache |
| Edge TTL | 1 year |
| Browser TTL | 1 year |

Do **not** add a blanket long TTL for HTML. A second rule keeps the crawlable
surface fresh, which matters while Google is still working through the sitemap:

| Field | Value |
|---|---|
| Expression | `http.request.uri.path matches "\\.(html\|xml\|txt)$" or ends_with(http.request.uri.path, "/")` |
| Edge TTL | 1 hour |
| Browser TTL | respect origin |

Never cache `/app/` or `/zh-tw/app/` aggressively — they are the private,
local-first application shells, and they are `noindex` by design.

## 4. Do not enable

- **Rocket Loader** — it defers and reorders scripts, which breaks Astro's island
  hydration. The tool pages are server-rendered and enable their controls on
  hydration; Rocket Loader can leave them disabled.
- **Email Address Obfuscation** on content pages — it rewrites markup at the edge
  and its injected script has shown up as unexpected DOM in crawls.
- **Auto Minify** — deprecated by Cloudflare, and the build already minifies.
- **Bot Fight Mode** — its challenges can be served to legitimate crawlers.
  Verified-bot allowances do not cover every crawler that matters here.

## 5. After enabling

Re-run the repository's own live checks against production:

```
npm run monitor:live
```

and re-inspect one URL per sitemap segment in Search Console, since a proxy change
alters what Googlebot sees at the network layer.
