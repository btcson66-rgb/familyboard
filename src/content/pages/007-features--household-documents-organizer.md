---
title: "Household Documents Organizer for Warranties, Manuals, Receipts and Home Records | FamilyBoard"
description: "Organize household document references around the home, asset or responsibility they belong to instead of relying on disconnected folders."
route: "/features/household-documents-organizer/"
primaryIntent: "organize household documents digitally"
primaryKeyword: "household documents organizer"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-22"
nextStep: "Add a document reference for the warranty or manual you'd have the hardest time finding again, and link it to the asset it belongs to."
related:
  - "/features/home-inventory-tracker/"
  - "/features/warranty-tracker/"
  - "/features/private-family-organizer/"
  - "/features/free-home-management-app/"
faq:
  - question: "Can I upload the actual PDF or photo to a document record?"
    answer: "No. The Documents tab stores a name, category, a text location reference, an asset link and a review date — not the file itself. The location reference field is where you note exactly where the real file lives, so you can find it again."
  - question: "What's a good location reference to write if my documents are just scattered in email?"
    answer: "Something specific enough to search for later: the sender, subject line and rough date (\"email from LG Support, subject 'Order Confirmation,' March 2026\") works better than \"in email,\" since you can search Gmail or Outlook directly for that phrase."
  - question: "What happens on the review date — does FamilyBoard remind me?"
    answer: "The Documents tab sorts dated records before undated ones and shows whether the review is overdue, due today or due on the formatted date. It does not put that review on the Today dashboard or send an alert, so pair consequential dates with a household task that has an owner and matching due date."
  - question: "Is my document backup safe if my browser data gets cleared?"
    answer: "Only if you've exported a JSON backup from Settings beforehand — that backup includes your document references and notes. Clearing browser data without a recent backup means losing the index, though any actual files you referenced (stored elsewhere) are unaffected."
contentVersion: 2
---
# A document index, not a file cabinet

A PDF named `IMG_4281.pdf` might be a receipt, but six months later nobody remembers what it was for. `FamilyBoard`'s Documents tab doesn't try to solve that by storing the file — it stores a short, structured pointer to where the real file already lives, linked to the household thing it's actually about.

## What a document record stores — and doesn't

The quick-add form asks for a record name, a category (defaulting to "Home record"), a location reference (required — where the original actually is), a related asset and a review date. That location reference is a plain-text field: "PDF in Downloads, filename dishwasher-manual.pdf," "printed folder in filing cabinet, tab 3," "email starred, subject 'Insurance renewal.'" There is no file-upload button on this form. The screen itself carries a permanent notice explaining why: "This v1 stores document references, not uploaded document files. Keep durable originals in storage you control." That's an intentional boundary, not a missing feature waiting to be discovered — FamilyBoard is an index of where things are, not a document vault.

## Linking a document to an asset is what makes it findable later

A document with no asset link is just a name and a location string, no more useful than a well-labeled folder. Link it to an asset, though, and it shows up alongside that asset's other records — the same connective pattern the Maintenance and Warranty tabs use. A "Water heater installation manual" document linked to the Water Heater asset becomes something you'd actually find again when a technician asks which model you have.

## The review date field is visible and sorted, but it is not a notification

Documents like insurance policies, service contracts or lease agreements benefit from a periodic look, not a one-time filing. Set the review date to the real decision point: a renewal window, notice deadline or scheduled accuracy check. The Documents tab puts dated records before undated records and describes each date as overdue, due today or due on the formatted date. It still does not add document reviews to the Today dashboard or send push, email or text alerts. If missing the date has consequences, create a separate household task with a real owner and matching due date.

## A worked example

After a plumbing repair, a household adds a document: name "Water heater repair invoice — March 2026," category "Service invoice," location reference "PDF attached to email from ABC Plumbing, starred," related asset "Water Heater," review date left blank since it's a one-time record. Separately, they add "Water heater manual" with category "Manuals," location reference "Downloads folder, filename whirlpool-wh-manual.pdf," same asset link. Now, opening the Water Heater asset gives context that neither a folder of PDFs nor a manufacturer's app would: the maintenance history, the warranty window and now two document references, all pointing at the same physical unit.

## Categories worth using

A small taxonomy holds up better than a large one: purchase records, warranties, manuals, service invoices, insurance references, utility information, emergency documents and property records cover most households without needing fifty categories nobody remembers the difference between.

## The honest limit

Because documents are references and not uploads, the durable copy of anything irreplaceable — a deed, a passport scan, an insurance policy — needs to live somewhere outside this browser too: cloud storage you control, a physical fireproof folder, or both. FamilyBoard's JSON backup (from Settings) preserves your document references and notes, but not files those references point to.
