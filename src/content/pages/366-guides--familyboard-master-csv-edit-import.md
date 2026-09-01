---
title: "FamilyBoard Master CSV Tutorial | Edit and Import Household Records Safely"
description: "Learn how to export FamilyBoard's master CSV, edit only the intended fields, preview validation errors and import a safe household update without treating CSV as a backup."
route: "/guides/familyboard-master-csv-edit-import/"
primaryIntent: "use FamilyBoard's master CSV for deliberate bulk edits while preserving IDs, relationships and a recoverable local backup"
primaryKeyword: "FamilyBoard CSV import export tutorial"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-29"
lastReviewedAt: "2026-08-29"
nextStep: "Export one master CSV, change one low-risk field, review the preview, and keep both the original JSON backup and the edited file until the result is verified."
related:
  - "/features/private-family-organizer/"
  - "/features/free-home-management-app/"
  - "/guides/familyboard-offline-backup-restore/"
  - "/tools/household-document-index-generator/"
faq:
  - question: "Is the master CSV a complete backup?"
    answer: "No. It is a spreadsheet-friendly editing and review format. Keep a full JSON backup as the recovery copy because CSV cannot preserve every database detail or relationship safely."
  - question: "Can I rename the IDs while editing?"
    answer: "Do not rename IDs unless you understand every relationship that points to them. Stable IDs let FamilyBoard merge updates without creating duplicate records or broken references."
  - question: "Does import immediately overwrite the household?"
    answer: "No. The app shows a validation preview first. In replace workflows, it also downloads a safety snapshot before committing the change."
  - question: "Are CSV values uploaded to FamilyBoard?"
    answer: "No. Export, editing, validation and import happen in the current browser; the file leaves the browser only when you deliberately save or move it."
contentVersion: 1
---
# How to edit and import FamilyBoard's master CSV without losing context

The master CSV is useful when a household needs to correct many records in a spreadsheet, fill in optional fields that quick-add forms do not show, or review a complete table before a handoff. It is also easy to misuse: a spreadsheet can make a local database look like an ordinary flat list. This workflow keeps the CSV as a controlled edit surface while the JSON export remains the recovery copy.

## Start with a JSON safety snapshot

Open Settings and export a complete JSON backup before opening the master table. Give the file a dated, neutral name such as `FAMILYBOARD-BACKUP-2026-08-29.json`, store it somewhere private and do not edit it. The JSON file contains the household database in the format the app can restore; the CSV is designed for inspection and editing, not disaster recovery.

If the browser profile is the only place that holds the household, do not begin a bulk edit while storage is already uncertain. Check the app's storage status, close unrelated spreadsheet copies and keep the original backup until the imported result has been inspected. A download notification is not proof that a file was saved where you expect.

## Understand the table before changing a cell

The master table combines record types that normally live on separate tabs: assets, maintenance tasks and events, warranties, subscriptions, contacts, documents, members and handoff profiles. Each row carries a record type and a stable ID. Related records refer to an asset or another row by that ID, so sorting is harmless but casually replacing IDs is not.

Use the table to add a missing purchase price, manual reference, owner, status or source pointer only when the controlling document is available. Do not paste passwords, card numbers, full addresses, medical narratives or private messages into a column simply because it is convenient. A spreadsheet copy is still a copy of the household data and may be easier to forward than the browser profile.

## Make the smallest useful edit

Keep one change set per review: for example, add installation dates to three assets, correct the owner of two open tasks, or add a source code to maintenance rows. Record the reason and date in your own protected review note rather than hiding a narrative in an arbitrary CSV column. Do not change a status to “complete” because a request was sent; completion should still describe an observed result.

Preserve the header names and delimiter format produced by FamilyBoard. Avoid formulas, merged cells, automatic date conversion and copied formatting that a spreadsheet may turn into a different value. Check that dates remain in the app's expected format, amounts are numbers rather than currency strings, and blank optional fields stay blank. Exporting from a spreadsheet can also add a byte-order mark or alter line endings; use the app's preview to catch problems before import.

## Read the validation preview as a review step

Importing a file is a two-stage action. First, FamilyBoard parses the rows and reports validation errors, unknown record types, duplicate IDs or invalid relationships. Stop when the preview reports an error you do not understand. Fix the copy in the spreadsheet, not by guessing inside the app, and repeat the preview.

When the preview is clean, compare the row count and a few known records with the original app. Use merge when you intend to update or add rows alongside the current household; use replace only when you have deliberately chosen the edited file as the new source of truth. Replace creates a safety snapshot first, but it can still make a large, confusing state if the wrong file was selected.

## Verify relationships after the import

Open Today and the relevant tabs after the commit. Check one asset with a maintenance task, one warranty or subscription date, one owner and one document pointer. Confirm that the labels are readable, dates land in the intended tab and no row that should remain open was accidentally closed. If anything is wrong, do not keep editing the same file. Use the safety snapshot or the untouched JSON backup to recover, then investigate the specific field.

Keep the edited CSV only as long as the review requires. Delete or protect old copies according to the household's normal data-retention practice, especially if the file contains private contacts or purchase details. A local-first app keeps the data from FamilyBoard's server; it does not make every downloaded file harmless.

Future affiliate recommendations for spreadsheet software, label printers or storage media must remain outside the import controls, clearly disclosed and optional. A product cannot validate a relationship, repair a malformed row or make a backup recoverable.

**Next step:** export JSON, export the master CSV, change one clearly documented field, pass the preview, verify three related records and then decide whether the edited file still needs to exist.
