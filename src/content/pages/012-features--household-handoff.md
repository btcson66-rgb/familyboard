---
title: "Household Handoff — Make the Invisible Work of Running a Home Transferable | FamilyBoard"
description: "Create a concise household handoff showing upcoming obligations, recurring responsibilities, service contacts and the information another trusted person needs."
route: "/features/household-handoff/"
primaryIntent: "hand over household responsibilities to spouse, family member or caregiver"
primaryKeyword: "household handoff checklist"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-19"
nextStep: "Create a sharing profile for the next time someone else needs to know what's going on in your home, and check the generated sheet before printing or sharing it."
related:
  - "/features/emergency-information-organizer/"
  - "/features/family-task-manager/"
  - "/features/maintenance-tracker/"
  - "/features/private-family-organizer/"
faq:
  - question: "What's included in the handoff if I haven't set up a sharing profile?"
    answer: "The default view includes open tasks, all maintenance tasks, and non-sensitive contacts, but leaves out document locations. It's a conservative built-in default, not an unfiltered dump of every record."
  - question: "Can a sensitive contact ever appear on the handoff sheet?"
    answer: "No. Contacts marked sensitive are filtered out of every handoff profile, regardless of the \"include contacts\" toggle. This is a hard rule in how the sheet is generated, not a per-profile setting you could accidentally leave open."
  - question: "Does the handoff sheet show subscription costs or serial numbers?"
    answer: "No. The handoff's closing section explicitly states these are excluded: sensitive contacts, serial numbers, document details, subscription costs, private notes and backup contents. The sheet is built to show operational summaries, not financial or identifying detail."
  - question: "Can I have more than one handoff profile for different situations?"
    answer: "Yes. You can create multiple named profiles — for example, one for a short weekend trip and a broader one for an extended absence — each with its own include/exclude toggles and purpose note, and view whichever one fits the current situation."
contentVersion: 1
---
# A printable briefing built from your own records, not a fresh document

In many homes, one person becomes the unofficial operating system — they know which bill looks wrong, who to call about the heater, and what the technician said last time. FamilyBoard's Handoff tab turns that knowledge into a document by pulling directly from records you've already entered, filtered by an explicit set of privacy rules rather than a blanket export.

## The default view, with no profile created

If you haven't created a sharing profile, the handoff sheet uses a built-in default: it includes open tasks and all maintenance tasks and non-sensitive contacts, but leaves out document locations. That's a deliberately conservative starting point — useful information is shown, but nothing marked private and nothing document-related leaks in by default.

## Sharing profiles let you choose what's included

You can create a named profile — "Weekend sitter," "Emergency contact for Mom" — with a purpose note and four yes/no toggles: include open tasks, include maintenance, include non-sensitive contacts, include document locations. Each toggle maps directly to a filter: turning off "include contacts," for instance, empties the contacts section of the sheet entirely for that profile. Multiple profiles can exist for different situations — a short weekend trip briefing looks different from a longer absence one — though only one handoff sheet renders at a time, built from whichever profile you're viewing.

## What's always excluded, no matter what

Regardless of profile settings, the handoff sheet's closing section lists exactly what's intentionally left out: "Sensitive contacts, serial numbers, document details, subscription costs, private notes and backup contents." That's a hard boundary baked into how the sheet is built, not a toggle you can turn on — even with every include-flag set to yes, a contact marked sensitive never appears, and no field like serial number or subscription cost is ever pulled into the sheet.

## What the sheet actually shows

When maintenance is included, it lists up to ten maintenance tasks with their linked asset or home area and due status — not full history, just the operational summary someone would need to know what's coming up. Tasks show title, due status and owner. Contacts show name, category and phone number only — not email or notes. If documents are included, entries show name and location reference, not category or review date.

## Print, don't just view

The tab includes a "Print handoff" button that calls the browser's native print function on the rendered sheet, meant for households that want a physical copy — on the fridge, in a go-bag, or with a house sitter who won't be logging into the app at all.

## A worked example

Before a two-week trip, a household creates a profile named "House sitter — August," purpose "cat care and mail," with tasks and maintenance included, contacts included, documents left off. The generated sheet shows: any open task due during the trip window, upcoming maintenance like a scheduled HVAC filter check, the non-sensitive contacts (the vet, the trusted neighbor) with their phone numbers, and nothing else — no serial numbers, no subscription costs, no sensitive family contacts. They print it and leave it on the counter.
