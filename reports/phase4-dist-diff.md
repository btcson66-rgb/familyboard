# Phase 4 dependency update: output comparison

Baseline: v1.7.0 production source (`8cbec35`), archived before changing dependencies as `phase4-before-v1.7.0-dist.zip` (SHA-256 `55A5CFA94F385E498FAB43F737E2A08FA0F5F80644AFAE4DBF64FEC516830ECD`). The later v1.7.0 CI hotfix changed only E2E tests, not generated site content.

Candidate: v1.7.1 after exact dependency pins and patched lockfile.

| Comparison | Baseline | Candidate | Difference |
|---|---:|---:|---:|
| HTML routes (including `404.html`) | 1,026 | 1,026 | 0 added, 0 removed |
| Sitemap XML files (index plus segments) | 11 | 11 | 0 files or bytes changed |
| Robots meta across HTML routes | 1,026 | 1,026 | 0 changed |
| Indexable URLs in sitemap/policy | 109/109 | 109/109 | 0 |
| English source content files | 506 | 506 | 0 |

The comparison keys each generated `.html` path in the ZIP against `dist/`, compares all 11 `sitemap*.xml` files byte-for-byte, and compares the exact `<meta name="robots" ...>` element for each HTML file. The output is unchanged on all three required dimensions. Bundled asset filenames and implementation bytes may change with the dependency update; they are outside the HTML-route/sitemap/robots acceptance contract.

Dependency maintenance: all 17 former `latest` specifiers are exact versions. Astro moved from the locked `7.2.3` to `7.3.4` (minor), with patched transitive packages; no direct major upgrade was required. `npm audit` and `npm audit --omit=dev` report 0 vulnerabilities as of 2026-09-24. The full repository check, Phase 2/3 static acceptance, and browser E2E are the behavior gates.
