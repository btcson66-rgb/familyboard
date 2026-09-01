---
title: "Family Display Mode — Turn an Old Tablet into a Household Dashboard | FamilyBoard"
description: "Use a tablet-friendly shared view for open tasks, today’s events and dated maintenance without buying dedicated family calendar hardware."
route: "/features/family-display-mode/"
primaryIntent: "use an old tablet as a family dashboard"
primaryKeyword: "family dashboard tablet"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-22"
nextStep: "Try Display mode on the device that will show it. Enter records there or restore a backup first; FamilyBoard does not sync data from your phone to a separate tablet."
related:
  - "/features/home-dashboard/"
  - "/features/household-calendar/"
  - "/features/emergency-information-organizer/"
  - "/features/free-home-management-app/"
faq:
  - question: "Does the family display show sensitive contacts or documents?"
    answer: "No. Display mode only renders three record types — open household tasks, today's events, and upcoming maintenance. Contacts, warranties, subscriptions and documents don't appear on this screen at all, regardless of any sensitivity flag."
  - question: "How often does the display update?"
    answer: "The app reloads the local database about once a minute while the tab is open, and when the browser tab becomes visible again. That can pick up changes from another tab using the same browser profile; it does not fetch changes from a different phone, tablet or account."
  - question: "Can I turn an old tablet into a dedicated FamilyBoard screen?"
    answer: "Yes, if the browser supports installing Progressive Web Apps. Add FamilyBoard to the tablet's home screen, launch it in its standalone window and open the Display tab. The app navigation remains available, and the tablet keeps its own local data rather than syncing another device."
  - question: "Should I worry about what task titles say if the display is visible to guests?"
    answer: "It's worth a moment's thought. Display mode limits which record types show (no contacts, warranties or documents), but it doesn't screen individual task or event titles for sensitive wording, so anything you title a task will be visible to anyone who can see the screen."
  - question: "Will a task completed on my phone disappear from the wall tablet automatically?"
    answer: "No. A phone and a separate tablet do not share FamilyBoard's local database. To keep the wall tablet current, update records on that tablet or deliberately transfer and restore a current backup; restoring replaces or merges data according to the option you choose."
contentVersion: 2
---
# A simplified, low-sensitivity view built for a shared screen

Dedicated family-display hardware exists, but many homes already have an old tablet doing nothing. `FamilyBoard`'s Display tab renders the same underlying records in a simplified, large-type layout meant for exactly that — a kitchen counter, a hallway mount, a screen more than one person walks past.

## Exactly three things appear on it

Display mode shows the household name, today's formatted date, and three cards. Household tasks are the first six open tasks sorted by due date, with dated work before undated work; each shows title, assigned owner or "Anyone," and due status. Today's events are the first six in start-time order, including an overnight or multi-day event whose recorded end has not passed the current local date. "Coming up" shows the first six maintenance items that actually have a next-due date, nearest first. No warranties, subscriptions, documents or emergency contacts appear because those record types are not rendered here.

## "Refreshes every minute" is a real, specific number

The badge at the top reads "Shared view · refreshes every minute." The app reloads its current browser profile's local database on a 60-second timer and when the tab becomes visible again. Another tab or window in the same browser storage environment can therefore be reflected on the next reload. A separate phone and wall tablet do not share IndexedDB, even if they use the same browser brand or operating-system account. There is no FamilyBoard cloud sync behind the timer.

## Why it's honest to call this "low-sensitivity," not "safe for anyone"

The footer states the boundary directly: contact records, detailed notes and other private record types are not shown, but task and event titles remain visible. A title such as "pick up prescription refill" may reveal more than you want a guest to read. Owner names, due status and event start times are visible too. Display mode reduces exposed fields; it does not classify wording or turn a shared tablet into a locked-down kiosk.

## Turning a spare tablet into a display

Because FamilyBoard is a PWA whose manifest requests a standalone window, a compatible browser can add it to a device's home screen and launch it without normal address bars or tabs. That is separate from the in-app Display tab: app navigation remains available, so this is a readable shared view rather than a tamper-proof kiosk. Populate the tablet's own database by entering records there or restoring a deliberate backup, then open Display. No app-store account or dedicated display purchase is required.

## A worked example

A household restores a reviewed backup onto an old 8-inch tablet, then opens Display in the kitchen. It shows "The Garcia Household," today's date, three open tasks in due-date order, one 4 PM pickup event and an HVAC filter check due in five days. The household updates records on that tablet during its weekly reset; changes made only on a parent's phone will not appear there automatically. Anyone walking past gets the same read, so titles are kept brief and non-sensitive.
