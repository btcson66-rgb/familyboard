---
title: "FamilyBoard Attachment Metadata Tutorial | Track Pointers Without Uploading Files"
description: "Learn how FamilyBoard records attachment names, types, sizes and location references without uploading the underlying file, and how to review them safely."
route: "/guides/familyboard-attachment-metadata-tutorial/"
primaryIntent: "understand FamilyBoard attachment metadata fields and the boundary between pointers and uploaded files"
primaryKeyword: "FamilyBoard attachment metadata"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-29"
lastReviewedAt: "2026-08-29"
nextStep: "Review three attachment metadata rows, remove any secret tokens, and verify each pointer against the controlled original source."
related: []
faq:
  - question: "Does FamilyBoard upload my attachment file?"
    answer: "No. Attachment metadata stores a description and safe location reference; the underlying file remains in the location you control."
  - question: "Which metadata fields are available?"
    answer: "The record includes a name, MIME type, byte size and location reference, along with the app’s common record fields."
  - question: "Is metadata enough to recover a lost file?"
    answer: "No. It is an index, not a copy. Keep the original file in a durable location and back up that location separately."
  - question: "Can I put a secret download URL in the location field?"
    answer: "Avoid credentials, signed URLs and sensitive tokens. Use a safe pointer that helps an authorised person find the controlled source."
contentVersion: 1
---
# FamilyBoard Attachment Metadata Is an Index, Not an Upload

An attachment metadata record answers “what file should an authorised person look for, and where?” It does not answer “can FamilyBoard download or restore that file?” FamilyBoard stores the metadata locally in the browser: a human-readable name, a MIME type, a byte size and a location reference, plus the normal record ID and timestamps. The original PDF, image, scan or spreadsheet stays in the file system or service that your household controls. This boundary keeps the free local-first app useful without pretending to be a cloud drive.

## Record a safe pointer

Choose a name that distinguishes the item without exposing unnecessary personal details, such as “boiler warranty 2026” or “lease inspection photos.” MIME type describes the file format (`application/pdf`, `image/jpeg` and similar); it is a label, not a security guarantee. Size is the observed byte count at the time of entry and can become stale after editing. Location reference should point to an authorised folder, document index or protected source using a safe code. Do not paste passwords, private keys, temporary signed URLs, full medical narratives or card details into the record.

## Link metadata to the right household record

Use the document or asset index when the file supports a known item. A warranty scan can point to the appliance asset; an inspection image can point to a document entry or a maintenance event. Keep the relation explicit in the notes or related record rather than assuming that a similar file name is enough. If a file moves, update the pointer and record the date of the change. If a provider replaces a document, preserve the earlier observation before adding the new metadata so a later reviewer can tell which version was checked.

## Review before sharing or exporting

Metadata can reveal as much as a file name: a tenancy address, a child’s school, a medical category or a private provider. Before sharing a master CSV or JSON backup, review names, location references and notes. The app’s master table includes an `attachment` record type with name, MIME type, size and location reference; it is designed for review and controlled bulk editing, not for uploading file contents. JSON backup includes attachment metadata as part of the complete local recovery package. Encrypt a backup when the storage location is not already protected, and keep the password separate.

## A practical attachment check

1. Confirm the original file opens in its controlled source.
2. Compare its current name, format and byte size with the metadata row.
3. Replace a stale location reference without copying the file into FamilyBoard.
4. Check that the related asset, document or maintenance record is correct.
5. Export JSON after important metadata changes and validate the file.
6. If the original is missing, mark the pointer as unresolved and ask the authorised source for recovery.

## What the app does not promise

FamilyBoard does not scan your folders, sync attachments across devices, verify file integrity, enforce access permissions or recover a deleted original. A location reference is not proof that a person has permission to open the source. Use the source system’s sharing controls and keep sensitive files there. If a household role changes, update the safe pointer and handoff instructions rather than distributing a secret link.

Future affiliate panels may suggest folders, labels or scanning accessories near this guide, but they are optional and cannot secure, upload or restore a file. The useful free workflow is the honest index: a clear name, accurate metadata, a safe pointer and a separate durable backup of the original source.
