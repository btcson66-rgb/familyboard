# Security and privacy verification

- Private app route is `noindex,follow` and excluded from the sitemap.
- Private app omits GA4 and AdSense metadata/scripts.
- No household-data backend or account system exists.
- Backups are schema-validated; encrypted backup round-trip and wrong-password rejection are unit tested.
- Shared display and handoff suppress sensitive categories by default.
- Repository scans and CI must reject committed credential files.

