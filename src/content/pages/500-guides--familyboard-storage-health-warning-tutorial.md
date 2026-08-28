---
title: "FamilyBoard Storage Health Warning Tutorial | Read Usage, Quota and Backup Age"
description: "Learn how FamilyBoard reports browser storage usage, quota, persistent storage and backup age, and what to do when a household warning appears."
route: "/guides/familyboard-storage-health-warning-tutorial/"
primaryIntent: "interpret FamilyBoard storage usage, quota, persistence and backup-age warnings"
primaryKeyword: "FamilyBoard storage health warning"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-29"
lastReviewedAt: "2026-08-29"
nextStep: "Read all four storage signals, export a fresh JSON file, validate it, and write down where the durable copy is kept."
related: []
faq:
  - question: "Does a large quota mean my data is backed up?"
    answer: "No. Quota is a browser estimate; only an exported JSON backup gives you a portable recovery copy."
  - question: "What does “Not guaranteed by this browser” mean?"
    answer: "The browser has not granted persistent storage, so it may still clear site data under its own storage policy."
  - question: "Is a seven-day backup warning an error?"
    answer: "No. It is a prompt to export a fresh recovery JSON because household records may have changed since the last export."
  - question: "Should I clear browser storage to fix a warning?"
    answer: "No. Clearing site data can remove the local household; export and verify a backup before any browser maintenance."
contentVersion: 1
---
# How to Read FamilyBoard’s Storage Health Panel

FamilyBoard is a local-first app: the household database lives in the browser that is open now. The Storage health card shows four different signals that are easy to confuse: estimated bytes used, the browser-managed quota, whether persistent storage was granted, and the age of the last successful JSON export. These signals describe risk; they do not certify that a backup exists. A warning is a prompt to make a controlled copy and review your browser setup, not an invitation to delete data.

## Usage and quota answer different questions

Storage used is the browser’s estimate of space consumed by this site. Quota is the amount the browser currently makes available to the origin, and some browsers report only a browser-managed quota. Neither value is a count of household records, a cloud allowance or a prediction of how long data will survive. A small database can still be important, while a large quota does not protect it from profile deletion, private-mode behavior, device loss or a browser policy change. Treat the numbers as an early signal and keep a portable export.

## Persistent storage is protection, not a backup

The panel asks whether the browser reports persistent storage as Granted or Not guaranteed by this browser. When it is not guaranteed, FamilyBoard offers Request durable storage through the browser’s `navigator.storage.persist()` permission. A browser may grant or decline that request according to its policy, engagement signals and device conditions. Even when granted, persistent storage cannot recover a stolen device, a deleted profile or a file that was never exported. Install the PWA where appropriate, keep the browser updated and continue exporting JSON on a schedule.

## Treat the backup-age warning as a decision checkpoint

FamilyBoard records the time of the last successful JSON export. If no export is recorded, the panel says to export JSON before adding irreplaceable records. If the last export is at least seven days old, it shows the age and asks for a fresh copy. This is deliberately simple: the app does not know whether a record is important, whether the downloaded file is on a second device or whether a provider changed. Export plain JSON for portability or encrypted JSON when the file must be protected in transit; store the password separately and test that you can open the file.

## A safe response sequence

1. Stop entering high-value changes while you investigate the warning.
2. Export a JSON backup from the Export backup card and confirm the download completed.
3. Place the file in a durable, access-controlled location outside the browser profile.
4. Use Validate backup without restoring to confirm the export time, schema and record count.
5. If persistent storage is not guaranteed, request it once and note the browser’s response.
6. Record the next review date; do not clear site data as a “cleanup” step.

## Know what the panel cannot tell you

The panel cannot measure whether an external drive is healthy, prove that a backup file is uncorrupted after you move it, or decide how many copies your household needs. It cannot see another device’s database. Review a restored copy in an isolated browser only when you have a reason and a safety snapshot plan. Keep credentials, full bills and private conversations in their controlled sources; FamilyBoard stores household pointers and records locally, not a remote archive.

Optional affiliate panels for storage media, labels or backup folders may be shown beside this guide later with a clear disclosure and an easy skip. They must not imply that buying a product grants persistence or replaces the free export workflow.
