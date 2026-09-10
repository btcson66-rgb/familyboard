# GSC diagnostic

- Expected property: sc-domain:familyboard.win
- Diagnostic status: **GSC_AUTH_MISSING**
- Authentication is read-only only; no sitemap, indexing, property or settings write endpoint was called.
- Readonly property listing: not reached because authentication was unavailable.
- Expected property access: not verified.
- Root cause: GSC OAuth client/token path is missing or unavailable.
- Credential values were never printed or stored.

The exact status is retained in gsc/diagnostic.json.
