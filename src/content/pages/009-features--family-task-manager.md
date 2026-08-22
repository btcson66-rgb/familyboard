---
title: "Family Task Manager for Chores and Household Responsibilities | FamilyBoard"
description: "Organize household chores and admin tasks by owner, due date, recurrence note and completion state."
route: "/features/family-task-manager/"
primaryIntent: "manage recurring household tasks"
primaryKeyword: "family task manager"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-22"
nextStep: "Create three recurring responsibilities that currently live only in someone's memory. If a task belongs to an appliance or subscription, mention it in the notes so the connection isn't lost."
related:
  - "/features/household-calendar/"
  - "/features/household-handoff/"
  - "/features/home-dashboard/"
  - "/features/free-home-management-app/"
faq:
  - question: "Does completing a recurring task automatically create the next one?"
    answer: "No. The recurrence field is a plain-text note (\"weekly,\" \"annual\") for your own reference, not an automation. The form's own help text says this directly: completing a task does not invent the next date. To preserve an honest completion record, complete the current task and create the next occurrence with its real date."
  - question: "Can I assign a task to more than one household member?"
    answer: "A task has a single owner field. If a responsibility genuinely needs shared visibility, a practical approach is choosing whichever person is accountable for making sure it happens, and using the notes field to record that others are involved."
  - question: "What's the difference between a task and a calendar event?"
    answer: "A task is an open-ended responsibility with an owner, a due date and a completion state. An event has a specific start and end time and location, with no owner or completion button — it's meant for things like appointments, not for ongoing responsibilities."
  - question: "Can I undo completing a task by mistake?"
    answer: "There's no undo button on the task card itself. If you complete a task in error, the practical fix is creating a new task with the correct details, since the completed record's timestamp reflects when you actually pressed Complete."
contentVersion: 1
---
# Household work includes far more than chores

Chore apps tend to focus on visible jobs: dishes, laundry, trash. Those matter, but the invisible administrative work of running a home — scheduling a repair, renewing a document, ordering a replacement filter, contacting a landlord, prepping for a trip — is just as real and far easier to lose track of. `FamilyBoard`'s Tasks tab treats both kinds the same way: a title, an owner, a due date, and a place to note how it repeats.

## What a task record holds

The quick-add form asks for a title (required), an owner from your household members, a due date, a repeat note, and free-text notes. The repeat field's help text is explicit about what it is and isn't: "Example: weekly. Completing does not invent the next date." That's an honest design choice — recurrence here is a label for humans to read, not an automated engine that recreates the task on a schedule. If you want a task to genuinely come back every week, you complete it and create the next instance yourself, or use it as a note reminding you what the pattern normally is.

## Completing a task is a one-way action

Each open task card shows a "Complete" button. Pressing it stamps the task with the current completion timestamp and changes its badge from a due-date status to "Complete." There's no undo or edit button on the card itself and no automatic next task generated — which is exactly what the recurrence-note help text warns you about. For genuinely recurring responsibilities, complete the current occurrence and create the next one with its real date. That takes another entry, but it keeps the completed record truthful.

## Give every responsibility a real owner

The owner field pulls from your Members list. Assigning "HVAC service" to one household member doesn't mean they personally have to do the physical work — it means they're the one responsible for making sure it happens, which is often the more useful commitment for administrative tasks like scheduling a technician or checking a contract renewal.

## Calendar events live on the same screen, but are a separate record type

The Tasks tab has a second quick-add form beneath the task one, for calendar events: title, start time, end time, location and notes. Events are a distinct record from tasks — they don't have an owner, a due-date status or a Complete button, since an event either happened at its time or didn't. They're meant for things with a specific start time, like a technician's appointment, rather than open-ended responsibilities.

## A worked example

A household creates a task "Renew car registration," owner assigned, due date set to the official deadline, recurrence note "annual, check official site for the current fee schedule," notes "last renewed online, confirmation emailed." The Today dashboard sorts dated open tasks from earliest to latest and displays up to five, so this task appears there when it is among the first five; once its date has passed, its label changes to overdue. After the renewal is actually finished, pressing Complete records the completion timestamp — a genuine record of when it was done, distinct from the note that just says how often it recurs.

## How tasks feed into handoff and display

Open tasks (not completed) are what the Handoff tab's default profile includes in a printable briefing, and what Display mode shows on a shared screen — both filtered to only what's still open, since a completed task isn't operationally useful to hand off.
