---
title: "FamilyBoard First-Run Restore Tutorial | Open an Existing Household Safely"
description: "Learn how to restore a FamilyBoard JSON backup during first-run onboarding, validate an encrypted file, and avoid creating a blank household before recovery."
route: "/guides/familyboard-app-first-run-restore-tutorial/"
primaryIntent: "restore an existing household during FamilyBoard onboarding without creating a blank duplicate"
primaryKeyword: "FamilyBoard first-run restore"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-29"
lastReviewedAt: "2026-08-29"
nextStep: "On a clean browser, identify one complete JSON backup, restore it through onboarding, review representative records and export the next recovery point."
related: []
faq:
  - question: "Do I need to create a blank household before restoring?"
    answer: "No. The onboarding screen offers Restore an existing household so you can validate and restore the file first."
  - question: "What happens if onboarding restore fails?"
    answer: "FamilyBoard reports the error and leaves data unchanged; check the file format or password through the controlled source."
  - question: "Does first-run restore support encrypted JSON?"
    answer: "Yes. Enter the password for the encrypted file; the app decrypts it in the browser before validation and replace restore."
  - question: "Is the first-run restore a cloud migration?"
    answer: "No. It restores a local database in the browser and does not create an account or sync data to a server."
contentVersion: 1
---
# Restore an Existing FamilyBoard Household on First Run

When opening FamilyBoard in a new browser, you do not have to create a blank household and copy records by hand. The onboarding screen includes Restore an existing household. It accepts a FamilyBoard JSON backup, validates the package before writing and uses replace restore for the empty first-run database. This is a local device setup step, not account creation or cloud migration. Keep the original backup available until you have checked the restored household.

## Prepare the right file

Find the most recent complete JSON export from the controlled backup location. Confirm its household name, export date and expected scope before selecting it. Plain JSON is readable; an encrypted export needs the password used at export time. Do not use a master CSV for onboarding recovery because CSV is a review and bulk-edit format, not the complete disaster-recovery package. If you are unsure which file is complete, preserve the candidates and decide before opening the new browser.

## Use onboarding validation boundaries

On the first-run screen, choose the password field only when the selected file is encrypted, then choose the backup file. FamilyBoard parses plain JSON or decrypts the authenticated package in the browser. Validation happens before records are written. A wrong password, malformed file or unsupported schema should show an error while leaving the current onboarding state untouched. Do not repeatedly create new blank households to test files; fix the source or password through the controlled process.

## Check the restored local state

After a successful restore, review the household name, member roles, a recent task, a calendar event, a maintenance row, a document pointer and attachment metadata. Confirm that sensitive locations still point to the authorised source and that the browser is the intended device. The app does not upload these records or notify other family members. If the backup is old, record what must be re-entered from a newer source rather than silently assuming the restore is current.

Do not begin a second large edit until the first-run review is complete. If the new browser and the source device both contain changes, preserve both JSON exports and write down which one is the comparison baseline. A successful onboarding message proves that the package was accepted; it does not prove that every field matches a newer source or that the device is protected from later browser cleanup.

Keep the first restored session focused on inspection, not on adding a second household or changing every old date at once.

## Protect the next recovery point

Export a fresh JSON backup after you finish the first-run review and store it outside the browser. If the device may be shared, keep the browser profile protected and follow the household’s local privacy rules. Browser data can still be cleared, a profile can be removed and a device can fail; successful onboarding is not proof of durability. Future optional affiliate panels for storage or password managers may appear with clear disclosure, but they cannot create sync or recover a missing file.
