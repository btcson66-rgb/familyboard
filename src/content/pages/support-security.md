---
title: "Security and Local-First Architecture | FamilyBoard"
description: "Learn how FamilyBoard uses local browser storage, backups, optional encryption and data-minimization principles, plus the limits users should understand."
route: "/security/"
primaryIntent: "support FamilyBoard users"
primaryKeyword: ""
cluster: "support"
pageType: "support"
indexable: true
depthVerified: false
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-19"
related: []
faq: []
contentVersion: 1
---
# Security without impossible promises

No web application should claim to be “unhackable” or “100% secure.” FamilyBoard instead documents the controls that are implemented today, reduces centralized collection and explains the responsibilities that remain with the person controlling the device. This page was technically reviewed on August 22, 2026.

## Where household records live

Core records created in `/app/` are stored in IndexedDB inside the current browser profile. FamilyBoard has no login service, household cloud database or synchronization API receiving a second copy. Public tools also calculate locally. Choosing “Save to app” places a result in a same-origin localStorage inbox that the app then consumes; it does not upload the result to a FamilyBoard server.

This local-first boundary reduces the impact of a centralized household-data breach, but it is not a device-security control. Anyone able to unlock the device and browser profile may be able to read local records. Malware, over-privileged extensions, device theft and unprotected exported files remain risks. FamilyBoard does not add a separate app PIN or multi-user permission system, so shared devices should use appropriately protected operating-system accounts or browser profiles.

## Plain, encrypted and spreadsheet exports

A plain JSON export is a complete and portable backup, but its contents are readable. The household master CSV is also plaintext and can concentrate records from multiple parts of the app; it is designed for spreadsheet review and bulk editing, not as a complete disaster-recovery format.

Encrypted JSON exports are produced in the browser with the Web Crypto API. The current format uses PBKDF2-SHA-256 with 310,000 iterations to derive a 256-bit key from the password, then AES-256-GCM to encrypt and authenticate the backup and its required metadata. Each export uses fresh random salt and initialization-vector values. FamilyBoard never receives the password or keeps a recovery key.

Encryption protects an exported file from being read without its password. It cannot repair a compromised device, make a weak password strong or recover a damaged file. A forgotten encrypted-backup password cannot be reset by FamilyBoard. Test a new backup before relying on it, keep at least one copy away from the original device and do not treat the Downloads folder as an archive.

## Browser storage is not a backup

The app can ask the browser for persistent storage, but the browser decides whether to grant it. Clearing site data, deleting a browser profile, using private browsing, storage eviction, device loss or hardware failure can still remove local records. Export before a bulk import, reset or major update, and periodically verify that a backup can pass the app's preview and restore checks.

## Shared views and printed output

Display and handoff modes intentionally narrow the information shown instead of exposing the entire app. Users must still review names, contact details, schedules, document locations and notes before showing a screen or handing over a printout. Once information is printed, downloaded or sent through another service, that copy is outside FamilyBoard's control.

## Analytics and private-app separation

Public-site analytics permits only the `tool_complete` and `affiliate_outbound` event names, with a tool slug or product category. The analytics initializer refuses to run on `/app/` and `/zh-tw/app/`. Form values, household records and backup contents are not approved analytics parameters.

## Responsible vulnerability reporting

Suspected injection, data-boundary, backup-validation or supply-chain vulnerabilities should not be posted with exploitable details in a public issue. Use the [private GitHub Security Advisory form](https://github.com/btcson66-rgb/familyboard/security/advisories/new), limit testing to systems and data you control, and include the affected version, minimal reproduction steps and impact. FamilyBoard does not currently publish a bug-bounty or payment promise.
