---
title: "Household Emergency Information Organizer — Contacts, Utilities and Instructions | FamilyBoard"
description: "Keep household emergency contacts and operational notes in a clear local-first list, with honest limits for private entries, handoff sharing and backups."
route: "/features/emergency-information-organizer/"
primaryIntent: "organize family emergency information"
primaryKeyword: "household emergency information organizer"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-22"
nextStep: "Add the contacts another trusted person would actually need under pressure. Mark private entries sensitive so they stay out of handoff sheets, then protect the app and every full backup because both still contain them."
related:
  - "/features/household-handoff/"
  - "/features/private-family-organizer/"
  - "/features/family-display-mode/"
  - "/features/free-home-management-app/"
faq:
  - question: "What does marking a contact \"sensitive\" actually change?"
    answer: "Two things: the contact's card shows a \"Private\" badge instead of \"Shareable\" on the Emergency tab, and it's automatically excluded from the household handoff briefing regardless of which sharing profile is active. It has no effect on where the contact appears within your own private view of the app."
  - question: "Are emergency contacts the same as household members?"
    answer: "No. Members are the people in your household who get assigned as owners of tasks and maintenance. Emergency contacts are outside people or services — a plumber, a doctor, a neighbor with a spare key — kept in a separate list that doesn't connect to the Members tab."
  - question: "Does FamilyBoard call emergency services or send alerts?"
    answer: "No. It's a private, local organizer for contact information you already have. It doesn't dial, text, verify numbers, or connect to any emergency-services system, and it explicitly does not replace official local emergency guidance."
  - question: "Will FamilyBoard tell me if a contact's phone number is outdated?"
    answer: "No, there's no verification or review reminder built into the Emergency tab currently. Numbers and providers change over time, so it's worth revisiting this list occasionally the same way you'd review any other household record."
contentVersion: 2
---
# A contact list built to be found fast, not admired

The Emergency tab is FamilyBoard's contact list, deliberately scoped narrower than a general address book: it exists to hold the people and services a household needs to reach quickly. Its visibility field controls handoff inclusion; it does not encrypt or hide a contact inside the private app.

## What a contact record holds

The quick-add form asks for a name or service (required), a category (defaulting to "Household contact" — plumber, utility, pediatrician, neighbor), phone, email, operational notes, and a visibility toggle. Saved cards are sorted by category and name, and a recorded phone number or email address becomes a tap-to-call or tap-to-email link. FamilyBoard does not verify that either contact method is current.

## What "sensitive" actually controls

A contact's `sensitive` flag has one sharing control and one visible cue. The card gets a "Private" badge instead of "Shareable," and the handoff builder filters sensitive contacts out even when the chosen profile includes contacts. The contact is still fully visible on the Emergency tab, still present in JSON backups and the Settings master-table CSV, and still recoverable when a full backup is restored. Family Display renders no contacts at all, so the sensitive flag makes no difference there.

## Not the same as Household Members

It's worth distinguishing this tab from the separate Members list. Members are the people who live in and use the household — they get assigned as owners of tasks, maintenance and subscriptions. Emergency contacts are the outside people and services the household might need to reach: a plumber, a pediatrician, a trusted neighbor, a utility company's outage line. The two lists don't overlap or reference each other.

## A worked example

A household adds "Neighbor — Sarah (unit 4B)," category "Trusted neighbor," phone recorded, notes "has spare key, feeds cat if we're away," sensitive left off. The neighbor can appear on a handoff sheet whose sharing profile includes contacts. Separately, they add "Dad — medical directive holder," category "Family," phone and email recorded, notes referencing a health situation, sensitive turned on. That second contact stays out of every handoff sheet, but remains readable in the Emergency tab and full backups. Neither contact appears on Family Display because that screen renders no contact records.

## What FamilyBoard is honest about not being

The Emergency tab carries a standing notice: "FamilyBoard organizes contacts; it does not replace current official local emergency guidance." It's a private, local list of who to call — it doesn't connect to emergency services, doesn't verify phone numbers are current, and doesn't push any alert. Keeping it useful means revisiting it occasionally as numbers and providers change; nothing in the app currently prompts that review automatically the way maintenance due-dates do.

## Where the data actually lives

Like every other record type in FamilyBoard, contacts are written to this browser's local IndexedDB database — there's no server copy, no account tied to the list, and no other device can see it unless you deliberately move a backup there. A phone number may be lower sensitivity than a note describing a family member's health, but both are readable by someone who can open this browser profile. Exporting JSON preserves the whole contact list, including private contacts and their notes. Encryption can protect the backup file at rest; the restored records are readable again inside the app.
