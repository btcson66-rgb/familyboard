# Performance report

The public site uses static Astro HTML, a system/self-hosted variable font and no hydrated JavaScript on ordinary guide text. React loads only for tools, search, print controls and `/app/`. AdSense rendering is off, GA4 is environment-gated and affiliate cards use plain links with no third-party ad script.

Representative production Lighthouse measurements are recorded after the custom-domain deployment so CDN, TLS and compression are included. The build artifact must remain far below the GitHub Pages 1 GB limit.

## 2026-08-19 release artifact baseline

Lighthouse was run against the exact static release artifact on local HTTP before HTTPS certificate provisioning completed:

| Category | Score |
|---|---:|
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

- Largest Contentful Paint: 1.1 s
- Cumulative Layout Shift: 0
- Total Blocking Time: 0 ms
- Raw result: `reports/lighthouse-home.json`

These are artifact-level results, not a claim about production CDN/TLS performance. The live-domain run remains part of the post-certificate monitor.
