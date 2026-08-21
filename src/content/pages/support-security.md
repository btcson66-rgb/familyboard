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

No web application should claim to be “unhackable” or “100% secure.” `FamilyBoard` instead documents its architecture, minimizes centralized data collection and gives users control over backups.

## Local-first architecture

Core household data is stored in IndexedDB on the user's device in v1. There is no account database containing everyone's home information.

## Backup encryption

Where encrypted export is enabled, use the browser's Web Crypto API with modern standard primitives. Do not invent custom cryptography. Document the file format, key-derivation approach, authentication mode and limitations in the repository.

## Device security still matters

If another person can unlock the device and browser profile, locally stored household data may be accessible. Users should use device-level security appropriate to the sensitivity of their records.

## Shared display boundaries

Family display mode must intentionally exclude private documents, sensitive notes, serial numbers, account identifiers and emergency details unless the user explicitly chooses otherwise.

## Responsible disclosure

Add a simple security contact after the domain is established. Do not publish a bug-bounty promise unless a program actually exists.
