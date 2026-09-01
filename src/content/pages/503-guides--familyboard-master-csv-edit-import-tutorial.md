---
title: "FamilyBoard Master CSV Edit and Import Tutorial | Preview Before Updating"
description: "Learn how to export, edit and preview FamilyBoard’s UTF-8 master CSV, choose merge or append behavior, and keep a JSON safety snapshot before import."
route: "/guides/familyboard-master-csv-edit-import-tutorial/"
primaryIntent: "edit a FamilyBoard master CSV safely and preview stable-ID updates before importing"
primaryKeyword: "FamilyBoard master CSV edit import"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-29"
lastReviewedAt: "2026-08-29"
nextStep: "Export a master CSV and a JSON backup, edit only a working copy, preview the rows, then document the import mode before applying it."
related: []
faq:
  - question: "Is the master CSV a complete backup?"
    answer: "No. It is for review and bulk editing; a JSON export is the complete disaster-recovery backup."
  - question: "What does merge use to find a row?"
    answer: "Merge uses the stable record ID, so changing that ID can create a new record or fail validation."
  - question: "Does FamilyBoard import a CSV immediately after choosing it?"
    answer: "No. The file is parsed and previewed first; rows with validation errors must be fixed before import."
  - question: "Why does the app download a safety snapshot?"
    answer: "It gives you a JSON copy of the current household before any approved CSV changes are written."
contentVersion: 1
---
# How to Edit and Import the FamilyBoard Master CSV

FamilyBoard’s master table is a UTF-8 CSV view of household records for spreadsheet review and controlled bulk editing. It is not a replacement for the complete JSON backup: some app state and recovery metadata are represented more fully in JSON. The safe sequence is export, edit a copy, preview, fix every validation error, download the pre-import safety snapshot and only then apply the import. This keeps a spreadsheet convenient without pretending it is a database editor.

## Export the current table first

Choose Export master CSV in the Household master table card. Keep the original export untouched and make a working copy in your spreadsheet application. The app also offers an empty template for planning new rows, but an empty template does not contain your household and should not be treated as a backup. Export a JSON file before a large edit so the recovery boundary is clear.

## Preserve IDs and inspect the columns

Each row has a record type, stable ID and fields appropriate to that collection. Merge finds existing rows by stable ID; do not sort a column into the ID, rename headers, remove required fields or paste formulas that export as unexpected values. Attachment rows contain metadata such as name, MIME type, size and location reference, not the underlying file. Keep credentials, signed URLs and full private documents out of the CSV. Use the preview’s warnings to notice skipped household descriptors or values that need a controlled source check.

## Choose merge or append deliberately

Merge updates matching IDs and adds valid new rows. It is suitable when you edited a known export and want those changes applied to the same household records. Append creates copies with new IDs, which can be useful when intentionally importing a separate set but can also create duplicates. Neither mode decides which value is newer. If two people edited separate exports, preserve both originals and resolve the conflict before importing.

## Read the preview before applying

Select Import master CSV for preview. FamilyBoard enforces a five-megabyte safety limit, parses the UTF-8 rows and shows new, updated and skipped counts. Warnings are not proof that a row is safe, and any validation error must be fixed before the apply button is enabled. Check dates, linked asset IDs, record types, empty required names and accidental private text. The app downloads a JSON safety snapshot immediately before a successful import; store it outside the browser and verify the download.

## Verify after import

After the success message, inspect a few updated rows in the relevant views, then export JSON again if the change matters. Record which CSV version was used, who reviewed the preview and whether merge or append was chosen. If a row is wrong, stop editing, keep the pre-import snapshot and original CSV, and restore deliberately. Future affiliate panels for spreadsheet software or folders may be optional and disclosed; they cannot validate household meaning or replace the JSON recovery copy.

Treat the preview as a change review rather than a formality. Compare the household name, expected row count and the specific fields you intended to change. If the file came from another device, note that its export date may be older than the current browser. Keep the original CSV, the edited copy and the safety snapshot together long enough to explain the result, then apply the household retention decision to temporary copies.
