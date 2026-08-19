# Performance report

The public site uses static Astro HTML, a system/self-hosted variable font and no hydrated JavaScript on ordinary guide text. React loads only for tools, search, print controls and `/app/`. AdSense rendering is off, GA4 is environment-gated and affiliate cards use plain links with no third-party ad script.

Representative production Lighthouse measurements are recorded after the custom-domain deployment so CDN, TLS and compression are included. The build artifact must remain far below the GitHub Pages 1 GB limit.

