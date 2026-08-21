---
title: "Household Account List: Know Which Services Exist Without Storing Passwords in the Wrong Place"
description: "Create a household account index with service name, account owner, support link and renewal information while keeping credentials in a password manager."
route: "/guides/household-account-list/"
primaryIntent: "list household services and account owners without storing passwords"
primaryKeyword: "household account list"
cluster: "household-operations"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-19"
nextStep: "Build the account map first — provider, owner, and what happens at a move — and handle credential continuity separately with a dedicated password manager."
related:
  - "/guides/organize-household-subscriptions/"
  - "/guides/recurring-bills-tracker/"
  - "/guides/home-contact-list/"
  - "/features/household-subscription-tracker/"
faq:
  - question: "What's the difference between a household account list and a contact list?"
    answer: "An account list tracks services and providers the household has an account with — who owns the login, what happens at a move, how to reach support. A contact list tracks people and companies to call. A utility company might appear in both: the account list holds the account ownership details, the contact list holds the phone number for when something's wrong right now."
  - question: "Should I store full account numbers in a household account list?"
    answer: "No. The last four digits are usually enough to confirm you're looking at the right account, the same convention many providers use to verify identity by phone. Keep the complete number in a dedicated password manager if it needs to exist anywhere at all, not in a record that might be shared or printed."
  - question: "How does FamilyBoard actually keep sensitive information out of a shared handoff?"
    answer: "Contacts can be flagged as sensitive, and FamilyBoard's handoff export filters out any contact marked that way before building a shareable snapshot, so it can't accidentally end up in a printed or shared sheet. The account list should follow the same no-credentials rule even though it's tracked as a separate record type."
  - question: "What should an account record say about moving to a new address?"
    answer: "Note which category the service falls into: follows you automatically, needs an active transfer request, or needs to be closed and reopened at the new address. Even a one-line note like \"requires 2 weeks' notice to transfer\" turns a move into a checklist instead of a scramble of last-minute calls."
  - question: "What if only one person in the household has access to a critical account?"
    answer: "Record the household's actual emergency-access process — not the password, but where it's stored and how a trusted second person could reach it if the usual owner were unavailable. Critical single-owner accounts, like the one controlling smart locks or the home internet, are exactly where this planning matters most."
contentVersion: 1
---
# An account list answers "whose login is this under," not "who do we call"

Internet, utilities, insurance portals, streaming services, smart-home platforms, retailer warranties — a modern household holds accounts with dozens of providers, often split across different family members' logins, and the question that actually matters in an emergency or a move isn't a phone number — that's the [contact list](/guides/home-contact-list/)'s job — it's which provider, under which login, controlled by whom.

## What belongs on an account record

- **Provider and service** — the company and what they provide.
- **Account owner** — whose name, email or login the account actually runs under. This is often the single most useful field: a service under a former partner's email, or a parent's login for something the whole household now depends on, is exactly the situation that turns into a crisis without this recorded.
- **Account reference** — the account or customer number, but see below on how much of it to actually store.
- **Support and management links** — the customer-service number and the account-management URL, so acting on the record doesn't require first finding a login page.
- **What happens at a move** — whether the service transfers to a new address, needs to be closed and reopened, or requires a final reading or deposit refund process.

## Store enough of the account number to be useful, not the whole thing

A full account number isn't necessary for most household purposes and adds risk if the list is ever printed or shown on a shared screen — the last four digits are usually enough to confirm you're looking at the right account when calling support, the same convention many providers use themselves to verify identity over the phone. Keep the complete number, if it needs to exist anywhere at all, in a dedicated password manager rather than the household-wide record.

## Passwords do not belong in this list, and here's the actual mechanism that enforces it

This isn't just advice — it's how FamilyBoard's contact records actually work. A contact can be flagged `sensitive`, and FamilyBoard's handoff export explicitly filters out any contact marked that way before building a shareable snapshot, so a sensitive entry never ends up in a printed or shared handoff sheet by accident. The account list should follow the same principle even though it's tracked as a separate record type: no passwords, no security-question answers, no backup codes, no private keys, ever, in any field, regardless of how the record gets shared later.

## What happens at a move deserves its own note, not an assumption

Some services follow you (a streaming subscription, most insurance), some need to be actively transferred (internet, sometimes utilities), and some need to be closed and reopened at the new address entirely (many local utilities). Recording which category each account falls into — even a one-line note like "requires 2 weeks' notice to transfer service" — turns a move from a scramble of phone calls into a checklist, since this is exactly the kind of detail that's easy to know while living at an address and easy to forget the moment a move is actually happening.

## Continuity for critical, single-owner accounts

If a service is critical to the household and only one person has access — the internet account, a smart-home platform controlling locks or cameras — note the household's actual emergency-access process: not the password itself, but where it lives and how another trusted person would get to it if the usual owner were unavailable. This is the account-list version of the backup-person planning that belongs on every genuinely critical household responsibility.

## Review the list when ownership actually changes

An account that changes hands — a service moved to a new email, a subscription transferred to someone else in the household — needs its record updated the same day, not "eventually." An account list a year out of date on ownership is worse than no list, because it actively points to the wrong person.

## Start with the accounts that would actually cause a problem if forgotten

Not every account needs a full record on day one. Start with the ones where forgetting the owner or the process would genuinely disrupt the household: the primary internet and utility accounts, insurance policies, and anything controlling home security or smart-home devices. A minor retailer login can wait — the account list earns its keep on the handful of accounts where "who owns this" actually matters in a crisis or a move, not on cataloguing every login a household has ever created.

## Overlap with the subscription list is expected, and fine

A streaming account or a cloud-storage plan might reasonably appear on both the [subscription list](/guides/organize-household-subscriptions/), because it has a cost and a renewal date, and the account list, because it has a specific owner and login. That overlap isn't a data-modeling mistake — the two lists answer different questions about the same service, and a household using both gets more coverage than picking just one.
