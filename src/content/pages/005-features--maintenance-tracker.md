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
lastReviewedAt: "2026-08-19"
nextStep: "Add one recurring maintenance task linked to a real asset, complete it once, and watch the next-due date and completion history build automatically from there."
related:
  - "/features/home-inventory-tracker/"
  - "/features/home-dashboard/"
  - "/features/household-documents-organizer/"
  - "/features/free-home-management-app/"
faq:
  - question: "What happens to the next-due date when I complete a maintenance task?"
    answer: "If the task has a repeat interval set (in months), completing it logs today's date as an event and moves the next-due date forward by that many months, adjusted so it always lands on a real calendar day. If the interval is zero, the task is simply marked completed with no new due date generated."
  - question: "Can I log the cost of a maintenance visit?"
    answer: "The maintenance event created by pressing Complete starts with a blank cost and note field. You can fill those in afterward through the household master CSV export in Settings, which includes cost and notes columns for every maintenance event."
  - question: "What's the difference between linking a task to an asset versus a home area?"
    answer: "An asset link ties the task to one specific record, like a named dishwasher or water heater, so its history shows on that asset's context. A home area (like \"yard\" or \"gutters\") is for maintenance that doesn't belong to a single tracked item — the card just shows the area name instead of an asset name."
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

Each maintenance card has a "Complete" button. Pressing it does two things: it adds a maintenance event with today's date (cost and notes start blank, ready for you to fill in through the CSV export if you want to log what a technician charged), and if the task has a repeat interval, it recalculates the next-due date by adding that many months to today, clamped so a task due-monthed from the 31st lands on the last valid day of a shorter month rather than erroring. A task with no interval — a one-time item — simply gets logged as completed without generating a new due date.

## The card shows real history, not just a status

Below the title and due-status badge, each maintenance card shows the linked asset or home area, the owner, the instructions source, a running completion count, and up to the five most recent completion events with their dates and any recorded cost. That means a task you've completed nine times shows its five newest entries right on the card — no separate report to run.

## A worked example

"Clean condenser coils" is linked to the Refrigerator asset, owned by one household member, home area left blank since it's tied to the asset, next due in three months, interval 6 months, priority normal, instructions source "Whirlpool support page." Six months later it shows as due; pressing Complete logs the event and pushes next-due out another six months automatically. Two years and four completions later, the card shows "4 completions" and the four most recent dates — a real service history for that one appliance instead of a memory of "we do that sometimes."

## Flexible schedules for work that doesn't fit a fixed date

Not everything belongs on a clean monthly or seasonal cadence. Some maintenance is condition-based — "inspect and clean if needed" rather than a guaranteed six-month job. The priority field is there to make sure a high-consequence, condition-based item (checking a water heater's relief valve, for instance) stays visible even without a hard due date forcing it onto the dashboard.

## The honest limits

FamilyBoard doesn't send a push notification or email when a task comes due — the due-soon and overdue statuses only appear when you open the app, on the Today dashboard or the Maintenance tab itself. There's no built-in library of manufacturer-recommended intervals; the instructions source field is where you record where your interval came from, but the app doesn't look it up for you. And for anything involving gas lines, electrical panels or structural work, FamilyBoard is a record of who came and what was done — not a substitute for hiring a licensed professional.
