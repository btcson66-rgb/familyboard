---
title: "Home Maintenance Tracker with Recurring Schedules and Service History | FamilyBoard"
description: "Track recurring home maintenance, completion dates, service history, costs and the assets each task belongs to."
route: "/features/maintenance-tracker/"
primaryIntent: "find home maintenance tracking software"
primaryKeyword: "home maintenance tracker"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-22"
nextStep: "Add one recurring maintenance task linked to a real asset, complete it once, and watch the next-due date and completion history build automatically from there."
related:
  - "/features/home-inventory-tracker/"
  - "/features/home-dashboard/"
  - "/features/household-documents-organizer/"
  - "/features/free-home-management-app/"
faq:
  - question: "What happens to the next-due date when I complete a maintenance task?"
    answer: "If the task has a repeat interval set (in months), completing it logs today's date as an event and moves the next-due date forward by that many months, adjusted so it always lands on a real calendar day. If the interval is zero, it still logs the event but clears the next-due date; the maintenance task itself does not receive a separate completed status."
  - question: "Can I log the cost of a maintenance visit?"
    answer: "The maintenance event created by pressing Complete starts with cost 0 and a blank note. You can fill those in afterward through the household master CSV export in Settings, which includes cost and notes columns for every maintenance event. The event has no currency field, so the card displays a plain number rather than assuming USD or another currency."
  - question: "What's the difference between linking a task to an asset versus a home area?"
    answer: "An asset link ties the task to one specific record, like a named dishwasher or water heater, and the maintenance card identifies that asset by name. A home area (like \"yard\" or \"gutters\") is for maintenance that doesn't belong to a single tracked item. FamilyBoard does not currently provide a unified asset-detail screen that combines every linked record."
  - question: "Does FamilyBoard tell me how often I should do a given maintenance task?"
    answer: "No. The instructions source field records where your interval came from — a manual page, a manufacturer's site, a technician's recommendation — but FamilyBoard doesn't supply or look up recommended intervals itself. You set the next-due date and repeat interval based on what you've found."
  - question: "Will I get a reminder when maintenance is due?"
    answer: "Only inside the app. Due and overdue maintenance shows on the Today dashboard and the Maintenance tab whenever you open FamilyBoard, but there's no email, push notification or SMS — nothing fires while the browser is closed."
contentVersion: 1
---
# Stop relying on "I think we did that recently"

Household maintenance often fails because the information is incomplete, not because the work is hard. Someone remembers changing a filter "a while ago." A technician visited, but the invoice is buried in email. `FamilyBoard`'s Maintenance tab exists to replace that guesswork with a dated record tied to the actual thing being maintained.

## What a maintenance task actually stores

The quick-add form asks for a title, a related asset (from your Assets list), a home area (for maintenance that isn't tied to one specific asset, like "gutters" or "yard"), an owner, a next-due date, a repeat interval in months, a priority (normal, high or low), and an instructions source — a place to note "owner's manual page 14" or "HVAC company recommendation" so the interval has a traceable origin instead of being invented. Underneath, the record also carries a trigger type of date, interval-after-completion, seasonal or manual; the quick-add form sets this automatically — if you enter a repeat interval greater than zero it becomes interval-after-completion, otherwise it's date. Seasonal and manual trigger types exist on the record and can be set through the Settings master CSV for tasks that don't fit either automatic pattern.

## What happens when you press Complete

Each maintenance card has a "Complete" button. Pressing it does two things: it adds a maintenance event with today's date (cost starts at zero and notes start blank, ready for you to edit through the master CSV if you want to log what a technician charged), and if the task has a repeat interval, it recalculates the next-due date by adding that many months to today, clamped so a task completed on the 31st lands on the last valid day of a shorter month rather than erroring. A task with no interval still logs a completion event, then clears its next-due date; it does not gain a separate "completed" task status.

## The card shows real history, not just a status

Below the title and due-status badge, each maintenance card shows the linked asset or home area, owner, priority, instructions source, task notes, a running completion count, and up to the five most recent completion events with their dates and any recorded cost. The event cost is displayed as a plain number because maintenance events do not store a currency code; write the currency convention in the task notes or master data if your household could confuse it. A task you've completed nine times shows its five newest entries right on the card — no separate report to run.

## A worked example

"Clean condenser coils" is linked to the Refrigerator asset, owned by one household member, home area left blank since it's tied to the asset, next due September 1, interval 6 months, priority normal, instructions source "manufacturer support page." On September 1 it shows as due; pressing Complete that day logs the event and sets the new next-due date to March 1. After four completions, the card shows "4 completions" and the four dates — a real service history for that one appliance instead of a memory of "we do that sometimes."

## Flexible schedules for work that doesn't fit a fixed date

Not everything belongs on a clean monthly or seasonal cadence. Some maintenance is condition-based — "inspect and clean if needed" rather than a guaranteed six-month job. The priority field gives that record a visible high, normal or low label on its maintenance card, but it does not change dashboard order or create an alert. A condition-based item without a next-due date will not appear in the dashboard's seven-day maintenance list, so pair it with a dated task when a real follow-up deadline matters.

## The honest limits

FamilyBoard doesn't send a push notification or email when a task comes due — the due-soon and overdue statuses only appear when you open the app, on the Today dashboard or the Maintenance tab itself. There's no built-in library of manufacturer-recommended intervals; the instructions source field is where you record where your interval came from, but the app doesn't look it up for you. And for anything involving gas lines, electrical panels or structural work, FamilyBoard is a record of who came and what was done — not a substitute for hiring a licensed professional.
