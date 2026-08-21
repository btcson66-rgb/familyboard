---
title: "Household Emergency Information Organizer — Contacts, Utilities and Instructions | FamilyBoard"
description: "Keep important household emergency contacts, utility notes, pet information and operational instructions in one clear local-first record."
route: "/features/emergency-information-organizer/"
primaryIntent: "organize family emergency information"
primaryKeyword: "household emergency information organizer"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-19"
nextStep: "Add the contacts another trusted person would actually need under pressure — mark anything genuinely private as sensitive so it's excluded from handoff and display automatically."
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
contentVersion: 1
---
# A contact list built to be found fast, not admired

The Emergency tab is FamilyBoard's contact list, deliberately scoped narrower than a general address book: it exists to hold the people and services a household — or someone standing in for it — needs to reach quickly, with one field that decides whether a given contact is safe to show on a shared screen.

## What a contact record holds

The quick-add form asks for a name or service (required), a category (defaulting to "Household contact" — plumber, utility, pediatrician, neighbor), phone, email, operational notes, and a visibility toggle. That toggle is the field worth understanding: marking a contact "sensitive" is a boolean flag with real consequences elsewhere in the app, not just a label.

## What "sensitive" actually controls

A contact's `sensitive` flag does two concrete things. First, on the Emergency tab itself, a sensitive contact's card gets a "Private" status badge instead of "Shareable," so you can see at a glance which entries are flagged. Second — and this is the part that matters — the household handoff briefing filters contacts through `!item.sensitive` before including them, so a sensitive contact is excluded from the printable handoff sheet by default, regardless of which sharing profile is active. The form's help text says this outright: "Sensitive contacts are excluded from shared display and handoff by default."

## Not the same as Household Members

It's worth distinguishing this tab from the separate Members list. Members are the people who live in and use the household — they get assigned as owners of tasks, maintenance and subscriptions. Emergency contacts are the outside people and services the household might need to reach: a plumber, a pediatrician, a trusted neighbor, a utility company's outage line. The two lists don't overlap or reference each other.

## A worked example

A household adds "Neighbor — Sarah (unit 4B)," category "Trusted neighbor," phone recorded, notes "has spare key, feeds cat if we're away," sensitive left off — this is exactly the kind of contact worth sharing on a handoff sheet for a house sitter. Separately, they add "Dad — medical directive holder," category "Family," phone and email recorded, notes referencing a health situation, sensitive turned on. The neighbor appears on any printed handoff or shared display; the family medical contact does not, because the sensitive flag excludes it from both by design, not by an extra step you have to remember each time.

## What FamilyBoard is honest about not being

The Emergency tab carries a standing notice: "FamilyBoard organizes contacts; it does not replace current official local emergency guidance." It's a private, local list of who to call — it doesn't connect to emergency services, doesn't verify phone numbers are current, and doesn't push any alert. Keeping it useful means revisiting it occasionally as numbers and providers change; nothing in the app currently prompts that review automatically the way maintenance due-dates do.

## Where the data actually lives

Like every other record type in FamilyBoard, contacts are written to this browser's local IndexedDB database — there's no server copy, no account tied to the list, and no other device that can see it unless you deliberately move it there. That's worth knowing before you decide how much to store here: a phone number is low-risk if this device is lost, but a note describing a family member's medical condition deserves the same caution you'd give any sensitive information kept on a single device. Exporting a JSON backup from Settings preserves the whole contact list, including the sensitive flag on each entry, so a restore recreates the same visibility rules rather than exposing everything by default.
