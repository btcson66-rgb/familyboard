# GSC performance status

- Status: **GSC_AUTH_MISSING**
- Date-only Search Analytics probe: attempted for the last complete 28-day window (`2026-08-11`–`2026-09-07`) and 90-day window (`2026-06-10`–`2026-09-07`), but blocked before the API call because readonly authentication was missing.
- Date range result: no rows can be interpreted; the probe status is `GSC_AUTH_MISSING`, not `GSC_OK_NO_DATA`.
- Current GSC performance rows: UNKNOWN.
- Search Console property access: UNKNOWN.
- No current position, CTR, clicks, impressions or query expansion is claimed.

The blocker is local credential availability, not an observed zero-row Search Analytics response. Restore the existing readonly OAuth client/token paths before treating the site as GSC_OK_NO_DATA.
