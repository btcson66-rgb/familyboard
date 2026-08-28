---
title: "Private Family Organizer Tutorial | Local-First FamilyBoard Guide"
description: "Learn how to use FamilyBoard as a private family organizer: minimise sensitive data, understand browser storage, encrypt exports and share role-based handoffs."
route: "/guides/familyboard-private-family-organizer-tutorial/"
primaryIntent: "choose safe local records, manage privacy boundaries and transfer a FamilyBoard household without account sharing"
primaryKeyword: "private family organizer app tutorial"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-29"
lastReviewedAt: "2026-08-29"
nextStep: "Set one privacy boundary, add one role-owned record and perform a controlled backup transfer."
related:
  - "/features/private-family-organizer/"
  - "/features/household-handoff/"
  - "/features/emergency-information-organizer/"
  - "/guides/familyboard-share-access-tutorial/"
faq:
  - question: "Does local-first mean the device is automatically secure?"
    answer: "No. Anyone who can unlock the device and browser may see local records. Use the device's own security controls and share only what is needed."
  - question: "Can I use one FamilyBoard account on two phones?"
    answer: "There is no account or automatic sync. Move a household manually with a JSON backup and verify the restore on the receiving device."
  - question: "Should I store passwords or full medical details in the organizer?"
    answer: "No. Use a protected system for secrets and sensitive originals; FamilyBoard can hold a safe pointer and the responsible role."
  - question: "Does an encrypted backup have a password reset?"
    answer: "No. Keep the encryption password in a secure password manager; a forgotten password cannot be recovered by FamilyBoard."
contentVersion: 1
---
# How to use FamilyBoard as a private family organizer without oversharing

“Private” is a workflow decision, not a claim that a browser is invisible. FamilyBoard's [Private Family Organizer](/features/private-family-organizer/) keeps household records in the current browser's IndexedDB, avoids an app account and supports offline use after its shell is cached. The tradeoff is explicit custody: the household chooses what to enter, who can unlock the device, where exports go and how another device receives a copy.

## Classify information before entering it

Use FamilyBoard for coordination facts that benefit from a durable history: an asset label, a maintenance observation, a renewal review, a role-owned task or a protected document pointer. Keep passwords, payment credentials, full identity numbers, access codes, detailed medical information and private conversations in the system designed for them.

When a record needs context, write the minimum useful label. `Insurance policy source in protected folder; renewal review assigned` is safer than copying the policy number and full address into a shared task. A pointer helps an authorised role find the original without making a second sensitive archive.

## Understand the browser boundary

Local storage means there is no FamilyBoard server copy to log into from a new device. It also means a cleared browser profile, deleted site data or failed device can remove the only local database. Use the device's passcode, operating-system encryption and browser profile controls. Do not describe the app as a vault, identity service or guaranteed recovery system.

The app can request persistent storage, which may reduce automatic eviction risk, but the browser decides whether to grant it. Persistence does not protect against deliberate clearing, profile deletion or hardware failure. Export a backup before troubleshooting storage or installing a major browser update.

## Transfer a household without sharing an account

To move to another device, export a JSON backup from Settings, transfer the file through a channel you trust, and restore it in the receiving browser. Choose merge or replace deliberately and keep the safety snapshot created by the restore flow. Open several records after restoring and check that the receiving device is now the intended source of truth.

An encrypted export uses a password you provide. Store that password separately and never send it in the same message as the file. If the password is lost, the encrypted export is not recoverable by support. A plain export is easier to open but must be treated like the private household database itself.

## Make a role-based handoff

The [Household Handoff](/features/household-handoff/) view can explain what another person needs to do without sending the full database. Share a responsibility, source pointer, next checkpoint and boundary: `maintenance list reviewed; current warranty source located; next export due Friday`. Ask the receiver to repeat the source location and next action, not to request credentials.

When a role ends, remove access to the device or file, retire the relevant task and create a dated note about the handoff. Do not rewrite history to make an old assignee disappear; preserve the chronology and restrict the new copy to the people who still need it.

## Privacy checks before display or print

Family Display Mode is a large-type shared view, not an access-control layer. Before displaying it, remove names, schedules, medical details, addresses and access information that visitors do not need. A printed handoff has the same risk as a downloaded file; review the audience and destroy stale copies through the household's normal process.

Browser-only processing keeps the app from receiving household fields, but it does not prevent a user from copying or photographing them. Trust comes from minimisation, device security, source custody, backup discipline and a clear handoff—not from the word “local.”

## Affiliate content stays outside the private record

Future recommendations for storage, labels or backup media must sit outside the record editor with a clear disclosure and a skip option. A sponsored product cannot change a privacy flag, inspect your household, require an email or make a handoff safer by itself.

**Next step:** remove one unnecessary sensitive field, export a labelled backup and ask the next household role to complete a source-pointer handoff.
