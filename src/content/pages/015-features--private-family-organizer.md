---
title: "Private Family Organizer — Local-First, Offline and No Account Required | FamilyBoard"
description: "A household organizer that stores records in your browser, works offline, needs no account, and gives you password-protected backups you control."
route: "/features/private-family-organizer/"
primaryIntent: "find a local-first, offline, no-account family organizer"
primaryKeyword: "private family organizer"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-19"
nextStep: "Open the app without creating an account, add one real record, and export a JSON backup — that three-step loop is the entire trust model in action."
related:
  - "/features/free-home-management-app/"
  - "/features/household-handoff/"
  - "/features/emergency-information-organizer/"
  - "/features/home-dashboard/"
faq:
  - question: "Does FamilyBoard require an account or email address to use?"
    answer: "No. The onboarding flow only asks for a household name and, optionally, member names. There's no email, password or account creation step — the household record is created directly in your browser's local database."
  - question: "Does FamilyBoard actually work with no internet connection?"
    answer: "Yes, once loaded. It's a Progressive Web App with a service worker, and because every read and write goes to the local IndexedDB database rather than a remote server, the core screens continue working offline after the app has been opened and cached."
  - question: "How are encrypted backups actually protected?"
    answer: "An encrypted backup uses PBKDF2-SHA256 to derive a key from your password with 310,000 iterations, then encrypts the data with AES-256-GCM. Losing the password means losing access to that specific encrypted export — there's no recovery mechanism for a forgotten backup password."
  - question: "Can I use FamilyBoard across two devices, like my phone and laptop?"
    answer: "Not automatically — there's no account or cloud sync, so each browser profile has its own independent local database. To move data between devices, export a JSON backup on one and restore it on the other; that's a manual, one-time transfer, not ongoing sync."
  - question: "What happens if I clear my browser data without a backup?"
    answer: "You lose the household database — there's no server-side copy to recover it from. This is why FamilyBoard's Settings screen actively warns when your last backup is more than seven days old, or when none has ever been made."
contentVersion: 1
---
# Local-first, offline and no-account are one design decision, not three features

A household organizer knows a surprising amount about how your family actually lives: when you travel, what you own, who your emergency contacts are, which services you pay for. `FamilyBoard`'s answer to that is architectural, not a policy promise — the app is built with Dexie (a wrapper around the browser's built-in IndexedDB) as its only datastore. There is no server-side database behind it, no login, and no network request that carries your household data anywhere. That single design choice is what "local-first," "offline" and "no-account" all describe from three different angles.

## What "no account" means in practice

Opening the app for the first time shows one form: a home name and, optionally, a comma-separated list of household members. Submitting it creates a household record and writes it to the local database immediately — there's no email verification step, no password to set, and no server round-trip. The onboarding screen's own heading says it plainly: "Set up your home without creating an account." The top bar of the running app carries a permanent reminder of the same fact: "Local data · no app analytics."

## What "offline" means in practice

FamilyBoard is a Progressive Web App with a service worker and a web manifest declaring a standalone display mode. Once loaded and cached, the core screens keep working without a network connection, because every read and write goes to the local IndexedDB database rather than a remote API — there's nothing to wait on. This is also why the app requests persistent storage from the browser (a button in Settings triggers `navigator.storage.persist()`) — it's asking the browser not to silently evict the database under storage pressure, which matters more for an app with no server copy to fall back to.

## What "local-first" means for backup, concretely

Because there's no server copy, backup is not an optional extra — it's the only recovery path if a device fails or browser storage is cleared. Settings can export a full JSON backup of every record, optionally encrypted with a password using PBKDF2-SHA256 key derivation at 310,000 iterations and AES-256-GCM encryption — real, named cryptographic primitives, not a marketing claim. Restoring a backup offers merge (add to what's there) or replace (wipe and restore) modes; choosing replace automatically downloads a safety snapshot of your current data first, before anything is overwritten, so a restore mistake doesn't destroy data you hadn't backed up yet.

## The bulk-edit path: master CSV

Beyond the JSON backup, Settings also offers a household "master table" — export every record to a single CSV, edit it in a spreadsheet, and import it back in merge or append mode, with a preview step that surfaces validation errors before anything commits. This is the same local-only principle applied to bulk editing: your data leaves the browser only as a file you explicitly download, not as a background sync.

## One household per browser profile — the honest limit

The app reads `data.households[0]` — the first household in the local database — as the household you're using. There's no multi-household switcher and no cross-device sync built in: a household created in one browser profile on one device doesn't appear in another browser or another device unless you export a JSON backup from the first and restore it into the second. That's the real tradeoff behind "no account": nothing to log into also means nothing to sync through.

## What local-first does not protect against

Local storage isn't the same as invincible storage. Anyone who can unlock your device and open your browser can potentially see your data, the same as any other locally-stored information — FamilyBoard doesn't add its own login screen or device-level lock. Use your device's own passcode and encryption, and treat the encrypted JSON backup's password as the thing actually protecting an exported file that leaves the device.
