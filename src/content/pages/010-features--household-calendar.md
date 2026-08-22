---
title: "Simple Household Calendar Connected to Tasks and Home Responsibilities | FamilyBoard"
description: "Use a lightweight household calendar for events that relate to home tasks, maintenance and family responsibilities without turning the product into another calendar clone."
route: "/features/household-calendar/"
primaryIntent: "simple household calendar inside a broader home system"
primaryKeyword: "household calendar"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-22"
nextStep: "Keep using your everyday calendar for personal scheduling. Add a household event here only when it's genuinely tied to a home record — a service appointment, a delivery window, a handoff period."
related:
  - "/features/family-task-manager/"
  - "/features/home-dashboard/"
  - "/features/family-display-mode/"
  - "/features/free-home-management-app/"
faq:
  - question: "Does the household calendar sync with Google Calendar or Outlook?"
    answer: "No. Events created in FamilyBoard exist only in this browser's local database, like every other record in the app. There's no calendar sync, import from, or export to an external calendar service."
  - question: "Can I create a recurring event, like a weekly pickup?"
    answer: "Events don't have a recurrence field. For something that repeats, a task with a due date and a free-text recurrence note (\"weekly\") is the closer fit, but the note is only a label: completing the task does not create its next date, so you must create the next occurrence yourself."
  - question: "Will I get a reminder before an event starts?"
    answer: "No. There's no notification, alarm or reminder tied to events — the start and end time are stored for reference and display, but nothing alerts you as the time approaches."
  - question: "How is an event different from a task with a due date?"
    answer: "An event has a specific start and end time and no owner or completion status — it either happened or it didn't. A task has a due date, an assigned owner, a completion button and an optional recurrence note, built for tracking who's responsible for what."
  - question: "Does an event entered on one device appear on another device?"
    answer: "No. FamilyBoard has no cloud or cross-device sync. Another tab or window using the same browser profile can read the same local database, but a phone and a wall tablet each have separate data unless you deliberately move a backup between them."
contentVersion: 2
---
# A small calendar for the events that belong to your home records

There are excellent dedicated calendar apps already, and `FamilyBoard` isn't trying to replace Google Calendar or Apple Calendar. Its calendar exists on the Tasks tab for a narrower reason: to hold the events that make more sense sitting next to your household records than buried in a personal calendar full of unrelated meetings.

## What an event record actually stores

The event quick-add form — the second form on the Tasks tab, below the task form — asks for a title (required), a start date and time (required), an end date and time, a location, and notes. If an end is supplied, the form requires it to be later than the start instead of quietly saving an impossible range. That's the entire event record: `HouseholdEvent` has exactly those five fields plus the standard id and timestamps. There's no recurrence field, owner field or reminder setting.

## Events are not tasks, and the app keeps them visibly separate

On the Tasks tab, event cards are marked with a distinct "Calendar event" tag and sorted by start time. Events don't have a due-status badge or a Complete button — an event either happens at its scheduled time or it doesn't, so there's nothing to mark done. If you need an event to also generate a follow-up responsibility ("confirm the technician the day before"), that's a separate task you create yourself, since the two record types don't auto-link. The current quick-entry interface also has no event edit or delete control; correct a saved event through the Settings master-table workflow or restore a known-good backup.

## Where events show up

Beyond the Tasks tab list, Display mode shows up to six events for the current local calendar date, in start-time order. That includes an event starting today and an overnight or multi-day event that started earlier but has an end time today or later. An event that started yesterday with no end time does not remain on the board indefinitely. The Today dashboard itself does not list events.

## A worked example

A household schedules an HVAC technician: title "HVAC technician visit," starts at 2:00 PM on a specific date, ends at 4:00 PM, location "home — front door access," notes "gate code 4471, dog will be crated." On the day, this event shows on the Tasks tab with the full location and note. Display mode shows only its time and title, so the gate code stays off that shared view. The title itself is still public to anyone near the screen, so it should not contain sensitive detail. Separately, the HVAC unit's maintenance record can hold the completion after the visit; the event and maintenance record do not auto-link.

## What it deliberately doesn't do

It doesn't sync with Google Calendar, Outlook or iCloud, and it doesn't sync two devices running FamilyBoard. Events exist only in the current browser profile's local database. It doesn't send a notification before an event starts. And it doesn't support recurring events the way a full calendar app does — a weekly recycling pickup is better represented as a task with a recurrence note, but that note still does not calculate or create the next task automatically.
