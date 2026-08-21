---
title: "Digital Home Inventory Backup: Protect the Records That Describe Your Home"
description: "Back up a local-first home inventory with the 3-2-1 rule, understand what FamilyBoard's encrypted export actually does, and why no cloud means backups are your responsibility."
route: "/guides/digital-home-inventory-backup/"
primaryIntent: "back up a digital home inventory safely"
primaryKeyword: "home inventory backup"
cluster: "inventory-warranty"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-19"
nextStep: "Create your first encrypted backup soon after adding real records, store the password in a password manager, and check the \"last backup\" date on the dashboard regularly rather than trusting memory."
related:
  - "/guides/photo-home-inventory/"
  - "/guides/valuable-item-inventory/"
  - "/security/"
faq:
  - question: "Does FamilyBoard store my household data anywhere besides my own device?"
    answer: "No. Records are stored in the browser's IndexedDB on your device, with no account and no server-side database. There's no cloud copy — an exported backup file is the only additional copy that exists, and only if you create one."
  - question: "What encryption does FamilyBoard's backup export actually use?"
    answer: "PBKDF2-SHA256 with 310,000 iterations to derive a key from your password, and AES-256-GCM to encrypt the data — both standard algorithms accessed through the browser's built-in Web Crypto API, not custom cryptography. AES-GCM is an authenticated mode, meaning it can also detect if the file has been tampered with."
  - question: "What happens if I forget my encrypted backup's password?"
    answer: "The data can't be recovered. There's no password-reset mechanism for an encrypted export, because a system that could bypass a forgotten password would also be one that could access your data without it. Store the password in a password manager rather than relying on memory."
  - question: "How many backup copies do I actually need?"
    answer: "A widely used standard is three copies on two different types of storage, with at least one kept somewhere other than your primary device — for example, the live browser copy, an encrypted file on an external drive, and another encrypted copy in cloud storage or at a different physical location."
contentVersion: 1
---
# There is no cloud copy — the backup you make is the only one that exists

FamilyBoard stores household data in the browser's IndexedDB, on your own device. There's no account, no server database, and no cloud copy of your records sitting somewhere as a safety net. That's a real privacy advantage, but it comes with a direct consequence: if the device is lost, the browser data is cleared, or something else wipes local storage, whatever wasn't exported is genuinely gone. Backup isn't a nice-to-have here — it's the entire durability plan.

## What an export actually contains

Exporting creates a structured JSON file containing your household's records, tagged with a schema version so the app can read it back correctly even after future updates change the underlying data structure. You can export as plain JSON or as an encrypted file — and if you choose encryption, it isn't a vague promise; the app uses your password to derive a key via PBKDF2-SHA256 with 310,000 iterations, then encrypts the data with AES-256-GCM, an authenticated encryption mode that also detects tampering. This runs entirely through the browser's built-in Web Crypto API — no custom cryptography, no data sent anywhere to perform the encryption.

## The 3-2-1 rule, applied to a household inventory

A well-established backup practice — [three copies of your data, on two different types of storage media, with one copy kept somewhere other than the primary location](https://www.sentinelone.com/cybersecurity-101/cybersecurity/3-2-1-backup-strategy/) — applies directly here. For a household inventory, that might mean: the live copy in the browser, an encrypted export saved to an external drive, and a second encrypted export in cloud storage or on a device kept at another location. The point of the "different media, different location" structure is that no single failure — a stolen laptop, a house fire, a corrupted drive — can take out every copy at once.

## A password you forget means data you can't recover

Be clear-eyed about this tradeoff: if an encrypted backup's password is lost, there's no recovery mechanism that can decrypt it — that's what makes the encryption actually secure in the first place. A backup service that could recover a forgotten password would also be a backup service that could access your data without it. Store the password somewhere as durable as the backup itself, such as a password manager, rather than relying on memory for a file you might not need for months or years.

## A backup that's never been restored is an assumption, not a plan

It's tempting to treat "I exported a file" as the finish line, but the file is only proven to work once you've actually imported it back and confirmed the data looks right — ideally on a different device or browser profile than the one it came from. An export that silently failed, or a password typo you didn't catch, is only discoverable by actually testing the restore, not by assuming the export succeeded because the app didn't show an error.

## A stronger password matters more here than almost anywhere else

Because there's no account recovery process and no company holding a spare key, the encryption is genuinely only as strong as the password behind it — there's no separate security layer compensating for a weak one. A short or reused password undermines the real cryptography (310,000 PBKDF2 iterations and AES-256-GCM) sitting behind it; a longer, unique passphrase is what actually makes that cryptographic strength meaningful in practice, not just on paper.

## Export after real changes, not on an arbitrary calendar

The most useful moment to create a new backup is right after adding several real records — a home inventory pass, a batch of warranties, a renovation project — not on a fixed weekly or monthly schedule that might land between meaningful updates. A backup from before your most recent significant additions is better than nothing, but it's still missing exactly the records you'd most want back if something happened today.

## Make "last backup" a visible fact, not a remembered one

The most common way backup discipline fails isn't a technical problem — it's simply forgetting when the last one happened. Keeping a visible "last backup" date on the dashboard turns backup from something you have to remember into something you can check at a glance, the same way a car's fuel gauge works better than trying to remember how many miles you've driven since the last fill-up.
