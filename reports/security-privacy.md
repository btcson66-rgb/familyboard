# Security and privacy verification

- IndexedDB schema: v2 with retained v1 definition and tested non-destructive migration.
- Persisted objects: common IDs/timestamps/schema versions; migration ledger and metadata-only attachment store included.
- Backups: versioned Zod-validated JSON; merge/replace run transactionally; replace downloads a safety snapshot.
- Encrypted exports: PBKDF2-SHA-256, 310,000 iterations, random 16-byte salt, AES-256-GCM, random 12-byte IV and authenticated format/KDF/cipher metadata.
- Wrong password, malformed package and future-schema import tests: pass.
- Handoff: sensitive contacts excluded; document notes stripped; profile flags control included categories.
- Display: serials, contact details, documents, costs, notes and backup content are not rendered.
- Analytics: public wrapper allowlists only generic tool slug and affiliate category. `/app/` has no GA loader, AdSense metadata or affiliate block.
- Offline: production service worker pre-caches the app shell and hashed build assets; Playwright reloads a restored household while the browser context is offline.
- Storage health: app/schema version, record count, estimated usage/quota, persistence state, last backup and last restore are visible.
- Repository private vulnerability reporting: enabled and linked from the Contact page.

Residual risk: anyone who can access the unlocked browser profile may read local records; browser storage can be cleared or lost. Exported plain JSON is readable. A forgotten encrypted-backup password cannot be recovered. See `PRIVACY_ARCHITECTURE.md` for the full threat and future-boundary description.
