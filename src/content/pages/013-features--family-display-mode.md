---
title: "Family Display Mode — Turn an Old Tablet into a Household Dashboard | FamilyBoard"
description: "Use a tablet-friendly full-screen view for today’s events, chores, maintenance alerts and household notices without buying dedicated family calendar hardware."
route: "/features/family-display-mode/"
primaryIntent: "use an old tablet as a family dashboard"
primaryKeyword: "family dashboard tablet"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-19"
nextStep: "Try Display mode on a spare tablet or old phone before buying dedicated family-dashboard hardware — add it to the home screen for a near-app experience."
related:
  - "/features/home-dashboard/"
  - "/features/household-calendar/"
  - "/features/emergency-information-organizer/"
  - "/features/free-home-management-app/"
faq:
  - question: "Does the family display show sensitive contacts or documents?"
    answer: "No. Display mode only renders three record types — open household tasks, today's events, and upcoming maintenance. Contacts, warranties, subscriptions and documents don't appear on this screen at all, regardless of any sensitivity flag."
  - question: "How often does the display update?"
    answer: "The app reloads its underlying data about once a minute while the tab is open, and immediately when the browser tab becomes visible again after being backgrounded. The \"refreshes every minute\" label on the display reflects that actual timer."
  - question: "Can I turn an old tablet into a dedicated FamilyBoard screen?"
    answer: "Yes. FamilyBoard is a Progressive Web App with a standalone display mode, so a compatible browser lets you add it to the device's home screen and launch it without browser address bars or tabs, similar to a dedicated app."
  - question: "Should I worry about what task titles say if the display is visible to guests?"
    answer: "It's worth a moment's thought. Display mode limits which record types show (no contacts, warranties or documents), but it doesn't screen individual task or event titles for sensitive wording, so anything you title a task will be visible to anyone who can see the screen."
contentVersion: 1
---
# A simplified, low-sensitivity view built for a shared screen

Dedicated family-display hardware exists, but many homes already have an old tablet doing nothing. `FamilyBoard`'s Display tab renders the same underlying records in a simplified, large-type layout meant for exactly that — a kitchen counter, a hallway mount, a screen more than one person walks past.

## Exactly three things appear on it

Display mode shows the household name, today's formatted date, and three cards: household tasks (up to six open tasks, each showing the title, assigned owner or "Anyone" if unassigned, and due status), today's events (up to six events whose start time falls today, each with a formatted time), and "Coming up" (maintenance tasks sorted by next-due date, showing up to six). That's the complete list — no warranties, no subscriptions, no documents, and no emergency contacts appear on this screen at all, sensitive or not, because those record types simply aren't part of what Display mode renders.

## "Refreshes every minute" is a real, specific number

The badge at the top of the display reads "Shared view · refreshes every minute," and that's not a marketing phrase — the app underneath reloads its data from the local database on a 60-second timer while the tab stays open, plus immediately whenever the browser tab becomes visible again. That means a task completed on your phone shows up on the wall display within a minute if both are pointed at the same browser profile and the display's tab is active, though in practice Display mode is most useful as a read-only board rather than something you update from itself.

## Why it's honest to call this "low-sensitivity," not "safe for anyone"

The footer text says private records and sensitive contacts are hidden from this display — true, in the sense that contacts (sensitive or not) never render here at all, along with warranties, subscriptions, documents and notes fields. But a task title itself could still reveal something you'd rather a houseguest not read on the wall ("pick up prescription refill"). Display mode limits which record types appear; it doesn't screen individual task titles for sensitivity, so it's worth a moment's thought about what you title a task if the display tablet sits somewhere visitors pass.

## Turning a spare tablet into a display

Because FamilyBoard is a PWA with a standalone display mode declared in its manifest, a compatible browser can add it to a device's home screen and launch it without browser chrome, closer to a dedicated app than a bookmarked tab. Point an old tablet's browser at the Display tab, add it to the home screen, and prop it up — no separate hardware purchase or app-store account required.

## A worked example

A household mounts an old 8-inch tablet in the kitchen. It shows "The Garcia Household," today's date, three open tasks under "Household tasks" (trash day owner unassigned, a bill to pay assigned to one parent, a school form due), one event under "Today's events" (a 4 PM pickup), and under "Coming up," the next maintenance item — an HVAC filter check due in five days. Nobody has to open the full app to see the day's shape; anyone walking past the kitchen gets the same read.
