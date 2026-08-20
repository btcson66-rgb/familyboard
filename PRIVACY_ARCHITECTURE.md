# Privacy and security architecture

## Data and storage

Households, members, assets, maintenance tasks/events, household tasks/events, warranties, subscriptions, contacts, document references, attachment metadata, handoff profiles, settings and migration history are stored in IndexedDB in the browser. V1 has no household-data API or account database. Attachment binaries are not shipped; the current attachment table is metadata-only.

## What leaves the device

Public route requests and ordinary hosting logs leave the device. When the production GA4 ID exists, public pages may send generic page and tool events; `/app/` omits the GA4 loader. User-entered tool values and app records are never analytics parameters. Affiliate links send the normal destination request only after a user chooses the clearly labeled external link.

## Backups

Plain backups are versioned JSON and readable by anyone with the file. Optional encrypted backups use PBKDF2-SHA-256 with a random 16-byte salt and 310,000 iterations to derive an AES-256-GCM key, plus a random 12-byte IV. Format, KDF, cipher and iteration metadata are authenticated as AES-GCM additional data. Passwords are not stored and cannot be recovered. A validate-only picker shows schema, export time and record count without changing data. Restore validates first, runs transactionally, and creates a downloadable safety snapshot before replacement.

## Threat assumptions and limitations

Someone who can unlock the device/browser profile may access local records. Browser storage can be cleared, devices can fail and storage persistence is browser-controlled. V1 therefore treats exports as a core operation and does not claim browser storage is an archival backup. Document records store references only; attachments are not shipped in v1.

Family display and handoff views exclude sensitive contacts, serial numbers, subscription costs, private notes and backup contents by default. Handoff profiles can include only non-sensitive contacts and safe document-location fields; document notes are stripped. Any future sync feature requires a separate threat model and policy update before launch.

## Analytics boundary

Only the public site may load GA4 after a real Measurement ID is configured. The event wrapper allowlists `tool_complete` with a tool slug and `affiliate_outbound` with a generic product category. Tool inputs, calculation values, household names and IndexedDB values are never analytics parameters. `/app/` omits GA4, AdSense account metadata and affiliate components.

## Database and migration boundary

Dexie schema v1 remains registered for compatibility. Schema v2 adds the migration ledger and attachment-metadata store, then backfills `createdAt`, `updatedAt` and `schemaVersion` without deleting user records. An older fixture database is upgraded in automated tests; users are never told to clear storage as a migration strategy.
