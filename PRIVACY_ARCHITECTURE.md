# Privacy and security architecture

## Data and storage

Households, members, assets, maintenance tasks/events, household tasks/events, warranties, subscriptions, contacts, document references, handoff settings and app settings are stored in IndexedDB in the browser. V1 has no household-data API or account database.

## What leaves the device

Public route requests and ordinary hosting logs leave the device. When the production GA4 ID exists, public pages may send generic page and tool events; `/app/` omits the GA4 loader. User-entered tool values and app records are never analytics parameters. Affiliate links send the normal destination request only after a user chooses the clearly labeled external link.

## Backups

Plain backups are versioned JSON and readable by anyone with the file. Optional encrypted backups use PBKDF2-SHA-256 with a random 16-byte salt and 310,000 iterations to derive an AES-256-GCM key, plus a random 12-byte IV. Passwords are not stored and cannot be recovered. Restore validates structure, previews the selected mode, and creates a safety snapshot before replacement.

## Threat assumptions and limitations

Someone who can unlock the device/browser profile may access local records. Browser storage can be cleared, devices can fail and storage persistence is browser-controlled. V1 therefore treats exports as a core operation and does not claim browser storage is an archival backup. Document records store references only; attachments are not shipped in v1.

Family display and handoff views exclude sensitive contacts, serial numbers, document details, subscription costs, private notes and backup contents by default. Future sync requires a separate threat model and policy update before launch.

