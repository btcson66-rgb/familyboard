---
title: "FamilyBoard Restore Merge vs Replace Tutorial | Choose a Safe Recovery Path"
description: "Learn when to merge or replace a FamilyBoard JSON backup, how validation and safety snapshots work, and how to avoid overwriting newer household records."
route: "/guides/familyboard-restore-merge-replace-tutorial/"
primaryIntent: "choose between merge and replace when restoring a FamilyBoard JSON backup"
primaryKeyword: "FamilyBoard merge or replace restore"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-29"
lastReviewedAt: "2026-08-29"
nextStep: "Validate one backup, compare its export date with the current household, and write a one-sentence reason before choosing merge or replace."
related: []
faq:
  - question: "What does merge restore do?"
    answer: "It validates the backup and updates records by their stable IDs while leaving records that are not in the file in place."
  - question: "When is replace restore appropriate?"
    answer: "Use it when the backup is the intended complete state, such as moving to a clean browser after checking its date and scope."
  - question: "Can FamilyBoard undo a replace restore?"
    answer: "The app downloads a safety snapshot before a replace restore, so keep that file somewhere durable in case you need to restore the previous state."
  - question: "Does validation change local data?"
    answer: "No. The validate-only picker reads the file and reports its schema and record count before any restore is applied."
contentVersion: 1
---
# FamilyBoard Restore: When to Merge and When to Replace

The safest restore choice depends on whether the backup is an addition to the current household or a complete replacement for it. FamilyBoard validates a JSON backup before writing it. **Merge** updates matching records by stable record ID and keeps current records that are absent from the file. **Replace** clears the local tables, downloads a safety snapshot first, and then writes the validated backup. The app cannot decide which copy is newer, so the household must compare dates, scope and the reason for the restore.

## Start with validation, not the restore button

Use the validate-only file picker in the Restore backup card before selecting a mode. For a plain JSON file, FamilyBoard reads the package and reports its export time, schema version and total records without changing the browser database. An encrypted file also needs the password used when it was created; a forgotten password cannot be recovered by the app. If validation fails, keep the current data in place, obtain a fresh copy from the controlled backup location and try again. Do not “fix” a JSON file in a text editor because a seemingly small change can invalidate its authenticated structure.

## Use merge for a cautious addition or device move

Merge is the conservative default when the current browser may contain newer work. It bulk-writes the records present in the backup by stable ID. Existing matching rows are updated, new rows are added, and rows that exist only in the current browser remain. This is useful when a household exported a backup from another device and wants to bring across a known set of records, or when a partial recovery file contains only the tables that were available at export time. Compare the export date with the last local backup first; merging an older copy can still replace newer values for IDs that appear in both files.

## Use replace for a deliberate clean reconstruction

Replace is for a clear recovery boundary: the chosen backup represents the complete household state that should exist in this browser. Before applying it, confirm the file name, export date, household identity and expected record count. FamilyBoard downloads `familyboard-safety-snapshot-<timestamp>.json` immediately before clearing local tables. Keep that snapshot outside the browser, and do not assume a download is safe until you can see it in your normal backup location. Replace is appropriate for a new browser profile, a controlled device migration or a recovery after confirming that the current database is corrupt. It is risky when the current browser contains unexported changes.

## Compare the two modes

| Question | Merge | Replace |
| --- | --- | --- |
| Records missing from the file | Stay in the browser | Are removed after the safety snapshot |
| Matching stable IDs | Updated by the backup | Recreated from the backup |
| Best fit | Add or reconcile a known copy | Rebuild from a complete, trusted copy |
| Main risk | An older row can overwrite a matching newer row | Unexported current records are cleared |

## Record the decision and verify the result

Write down why the mode was chosen, which export date was trusted and who checked the result. After restore, review the household name, members, a recent task, a document pointer and any attachment metadata. The app records the last restore time, but that timestamp does not prove that every row is correct. If something is missing, stop editing, keep both the source backup and the safety snapshot, and choose the next recovery action deliberately. Never delete the only copy while investigating.

The free app remains useful without a paid plan or an account. Future storage folders or backup products may appear in a clearly disclosed affiliate panel, but they cannot guarantee recovery and are optional. Your household should be able to validate, merge or replace using its own files and a controlled backup location.
