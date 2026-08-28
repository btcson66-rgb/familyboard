---
title: "FamilyBoard Encrypted Backup Password Tutorial | Protect a JSON Export"
description: "Learn how FamilyBoard encrypted exports work, how to choose a recoverable password process, and how to validate the file without exposing household records."
route: "/guides/familyboard-encrypted-backup-password-tutorial/"
primaryIntent: "create and recover an encrypted FamilyBoard backup without losing the password"
primaryKeyword: "FamilyBoard encrypted backup password"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-29"
lastReviewedAt: "2026-08-29"
nextStep: "Choose a controlled password process, export one encrypted file, and validate it before treating it as a recovery copy."
related: []
faq:
  - question: "Can FamilyBoard recover a forgotten encrypted-backup password?"
    answer: "No. The password is required to decrypt the authenticated file and is never sent to FamilyBoard."
  - question: "Is an encrypted export the same as a cloud backup?"
    answer: "No. It is a protected local download; you still need a durable storage location and a second recovery copy."
  - question: "Should I email the password with the file?"
    answer: "No. Use a separate controlled channel and do not place the password in household records or the file name."
  - question: "Can I validate an encrypted backup without restoring it?"
    answer: "Yes. Enter the password and use the validate-only picker to check its export time, schema and record count without writing data."
contentVersion: 1
---
# How to Use a FamilyBoard Encrypted Backup Safely

An encrypted FamilyBoard export protects the contents of a JSON recovery file when the download is stored or moved outside the browser. In the app, encryption uses PBKDF2-SHA-256 and AES-256-GCM in the browser. The password is the recovery key: FamilyBoard does not upload it, keep a copy or reset it. A good workflow therefore treats password choice, file storage and a test decryption as three separate jobs. Encryption reduces exposure of the file; it does not create cloud sync or guarantee that the original browser survives.

## Choose a password process before exporting

Use a long, unique passphrase that your authorised household recovery role can retrieve from a password manager or another controlled method. Do not reuse a provider password, put a card number in it or write it into the FamilyBoard notes. The app rejects passwords shorter than ten characters, but a minimum is not a recommendation for a weak phrase. Decide who may access the recovery key, how that person is replaced and where the emergency instructions live before clicking Export encrypted.

## Export and separate the two items

In Export backup, enter the password twice in your own process, then choose Export encrypted. FamilyBoard downloads a file with an `.encrypted.json`-style name and records the successful export time. Move the file to a durable, access-controlled location and keep the password in a separate system. A file name should not reveal the password, household address or a sensitive record category. If the download is interrupted, export again and treat the newest completed file as the candidate, rather than assuming a partial download is usable.

## Test decryption without changing the household

Open Restore backup and enter the same password. Use Validate backup without restoring first. A valid file reports its export time, schema version and record count; no local table is cleared or updated. If the password is wrong, do not keep guessing inside a shared screen. Retrieve it through the agreed controlled process, check that you selected the intended file and try validation again. Never edit the encrypted bytes with a text editor or rename a file to imply that it has been tested.

## Plan for rotation and failure

When a recovery role changes, export a new encrypted file with a new password and retire the old copy according to your household retention decision. Keep an earlier file only when its scope and access are still understood. If the password is lost, the file cannot be decrypted by FamilyBoard; the practical response is to locate another valid export or an unencrypted backup, not to weaken the encryption. Keep a plain JSON copy only where its readable contents are acceptable and its access is controlled.

## What encryption does not cover

The browser still stores the live household locally, and a person who can open the app may be able to read records there. Encryption does not protect a screenshot, a copied note, a location reference or the original attachment file. Review sensitive names and pointers before sharing a backup. Future affiliate panels for password managers or storage media may appear with disclosure and an easy skip; buying a product cannot recover a forgotten password or replace the free validation workflow.
