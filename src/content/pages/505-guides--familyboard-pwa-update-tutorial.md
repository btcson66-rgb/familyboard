---
title: "FamilyBoard PWA Update Tutorial | Refresh Without Losing Local Data"
description: "Learn how FamilyBoard’s PWA update banner works, when to export a backup, and why updating the app does not mean clearing browser storage."
route: "/guides/familyboard-pwa-update-tutorial/"
primaryIntent: "understand FamilyBoard’s service-worker update prompt and reload safely"
primaryKeyword: "FamilyBoard PWA update"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-29"
lastReviewedAt: "2026-08-29"
nextStep: "Export when needed, choose Update now once, wait for the reload, and verify the version and a few representative records."
related: []
faq:
  - question: "Does pressing Update now erase the local household?"
    answer: "No. The service worker activates the new cached assets and the page reloads; it does not call the local database reset action."
  - question: "Should I export before updating?"
    answer: "Export first when the household has irreplaceable changes or the last backup is old, because browser storage and backups are separate risks."
  - question: "What if the update banner never appears?"
    answer: "It may mean no waiting service worker is ready, the browser is offline, or the installed version is current; continue using the app and keep backups."
  - question: "Is a PWA update cloud synchronization?"
    answer: "No. It updates app assets in the browser and does not upload or merge household records across devices."
contentVersion: 1
---
# How FamilyBoard’s PWA Update Prompt Works

FamilyBoard uses a browser service worker to cache the app shell and offer a controlled update. When a newer worker is waiting and the browser already controls the page, the app shows “A newer FamilyBoard version is ready” with an Update now button. Pressing it sends a skip-waiting message; after the new worker takes control, the page reloads. This changes app assets, not the household database. Updating is therefore a browser lifecycle event, while backup and recovery remain your responsibility.

## Read the banner before acting

An update prompt is not an emergency warning and does not mean the current data is corrupt. Check whether you are online, confirm the visible household name and note any important unsaved work. If the last JSON export is old or no backup exists, export a fresh copy first. The app’s storage-health card can show the last successful export, but the banner itself cannot see whether your downloaded file is stored safely.

## What happens when you choose Update now

The page tells the waiting service worker to activate, then listens for the controller change and reloads once. The browser fetches or serves the new static assets according to its cache policy. No account is created, no records are sent to a server and no merge or replace restore is triggered. A temporary reload or brief offline state is possible; wait for the page to settle before entering a new record. If the page does not return, keep the backup and reopen the known FamilyBoard URL in a supported browser profile.

## Keep app update separate from data maintenance

Do not clear site data to “finish” an update. Clearing browser storage can remove the local household and is a different, destructive action. Do not uninstall a PWA until you have exported and validated JSON. If you use an old tablet as a shared display, update it only after confirming which browser profile is the display and which one contains private administration records.

## Verify after the reload

Check the displayed app version, household name, one open task, today’s event and a recent maintenance item. Review that contact records and detailed notes remain in their private tabs; a reload should not turn the shared display into an administration screen. If something looks different, record the observation and compare the app version and backup date before editing. A successful reload proves that the new worker controls the page, not that every household decision is current.

Future affiliate panels for compatible tablets, storage media or password managers may appear with a clear disclosure and easy skip. They cannot guarantee an update, protect browser data or create sync. The free app remains useful with a supported browser, a controlled profile and a verified backup.

For a household that uses more than one browser, record the profile name, app version and last reload time for each device. This small maintenance note prevents one successfully refreshed tablet from being mistaken for a completed household update. If a device stays offline for several days, preserve its local records and schedule a short read-only review after connectivity returns. Do not repeatedly clear caches while troubleshooting; cache cleanup and data deletion have different consequences. A version check also cannot confirm that a downloaded JSON file is complete, readable or stored somewhere the family can retrieve. Keep those checks separate and name the person responsible for the follow-up.
