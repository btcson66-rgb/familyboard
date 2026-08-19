# FamilyBoard

FamilyBoard is a free, privacy-first household operations system. The public Astro site contains 200 purpose-specific launch pages, working browser tools and printable resources. The `/app/` PWA stores household data in IndexedDB without an account or household-data backend.

## Architecture

- Astro static output for public content and GitHub Pages.
- React islands only for the private app, search, tools and print controls.
- Dexie/IndexedDB with explicit schema versioning.
- Versioned JSON backup plus optional PBKDF2-SHA-256 / AES-256-GCM encryption.
- A service worker caches the app shell and previously fetched same-origin assets.
- Public GA4 is environment-gated; `/app/` does not load GA4.
- Ad rendering remains off until AdSense approval. Affiliate cards require a real public affiliate tag and remain contextual.

## Local development

```powershell
npm.cmd install
npm.cmd run import:content
npm.cmd run dev
```

The approved source is `docs/launch-content-master.md`. `scripts/import-master.mjs` preserves it and regenerates `src/content/pages/`; do not hand-edit generated content files.

## Verification

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run audit:content
npm.cmd run audit:similarity
npm.cmd run build
npm.cmd run e2e
```

## Adding content or functionality

Update the master editorial source for a new public page, then update the importer only when the metadata format changes. New tools require a distinct production definition in `src/components/ToolWorkbench.tsx`. Database changes require a new Dexie version and an upgrade test; never instruct users to clear site data as a migration strategy. Backup format changes require a compatibility reader and a new `formatVersion`.

## Current limitations

V1 supports one local household per browser profile. It has no accounts, cloud sync, server document storage or payment system. Document records are references to originals, not uploaded files.

