---
title: "Household Management Features — Assets, Maintenance, Warranties, Tasks and More | FamilyBoard"
description: "See how FamilyBoard organizes household assets, maintenance, warranties, subscriptions, tasks, emergency information, backups and family handoffs."
route: "/features/"
primaryIntent: "compare household management capabilities"
primaryKeyword: "household management app features"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-22"
nextStep: "If your biggest pain point is remembering upkeep, start with the Maintenance Tracker. If it is scattered receipts and models, start with Home Inventory."
related:
  - "/features/home-inventory-tracker/"
  - "/features/maintenance-tracker/"
  - "/features/household-handoff/"
  - "/features/private-family-organizer/"
  - "/features/free-home-management-app/"
faq:
  - question: "Do I need to fill in every field on every screen to get value from FamilyBoard?"
    answer: "No. Each quick-add form only requires one or two fields — an asset needs just a name, a task needs just a title. Purchase price, seller, manual reference and similar detail fields are optional and can be filled in later, including in bulk through the Settings CSV export."
  - question: "Which screen should a new household start with?"
    answer: "Add your assets first, since maintenance, warranties and documents all link back to an asset record. Start with the handful of appliances or systems you'd actually miss the receipt or manual for, then add maintenance and warranty records against them."
  - question: "Is there a mobile app, or is this only a website?"
    answer: "FamilyBoard is a Progressive Web App you use in your browser and can add to your phone or tablet's home screen for an app-like icon and standalone window. There's no separate native app, and no app-store account is involved."
contentVersion: 2
---
# One household dashboard, built around the work behind the calendar

A family calendar answers "what's happening and when." It doesn't answer "when did we last flush the water heater," "where's the dishwasher receipt," or "what does the new sitter need to know if we're both unreachable for a weekend." `FamilyBoard` is the twelve-screen app built for that second set of questions: Today, Members, Assets, Maintenance, Tasks, Warranties, Subscriptions, Emergency, Documents, Handoff, Display and Settings, all reading from one household database stored in this browser.

Below is what each section actually does, with a link to the full page for each.

## Today — the dashboard

Opening the app lands on four counters — overdue tasks, maintenance due within seven days, active assets, active subscriptions — plus two short lists: your next five open responsibilities and your next five maintenance items due soon, each with a one-click link to the full tab. See **[Home Dashboard](/features/home-dashboard/)**.

## Assets — the inventory

Every appliance, vehicle or system gets a record: name, category, location, brand, model, serial number, purchase date and notes from the quick-add form, plus purchase price, seller, installed date, manual reference and an active/watch/archived status field the record reserves for deeper tracking. Asset cards carry "Watch" and "Archive" buttons. See **[Home Inventory Tracker](/features/home-inventory-tracker/)**.

## Maintenance — the recurring work

A maintenance task links a title to an asset or home area, an owner, a next-due date, a repeat interval in months, a priority and an instructions source. Pressing "Complete" logs a maintenance event with today's date and rolls the next-due date forward by the interval; the card keeps the five most recent completions visible underneath. See **[Maintenance Tracker](/features/maintenance-tracker/)**.

## Warranties — coverage windows

A warranty record ties a provider, start date, end date, receipt reference and terms reference to an asset. The card flips to an "Expired" status the day after the end date passes and always reminds you that written terms control exact coverage. See **[Warranty Tracker](/features/warranty-tracker/)**.

## Subscriptions — recurring costs

Each subscription stores cost, currency, billing frequency, next renewal, a review-before-days lead time, an owner, a management URL and a payment note — deliberately not a card number. The subscriptions screen totals every active subscription's annualized cost live, so a weekly $12 lawn app and a $180 annual security plan land on the same yearly number. See **[Household Subscription Tracker](/features/household-subscription-tracker/)**.

## Tasks — one-off and recurring responsibilities

Tasks carry a title, an owner, a due date, a free-text recurrence note and completion status; a separate quick-add form on the same screen creates calendar events with a start time, end time and location. See **[Family Task Manager](/features/family-task-manager/)** and **[Household Calendar](/features/household-calendar/)**.

## Emergency — contacts that stay local

Emergency contacts hold name, category, phone, email, notes and a sensitive flag. Marking a contact sensitive removes it from the printable handoff sheet, but the record remains visible in the private Emergency tab and full backups. Family Display renders no contacts at all. See **[Emergency Information Organizer](/features/emergency-information-organizer/)**.

## Documents — where things actually are

A document record doesn't store a file; it stores a name, category, a plain-text location reference ("fireproof box, hallway closet"), a linked asset and a review date. See **[Household Documents Organizer](/features/household-documents-organizer/)**.

## Handoff and Display — for the rest of the household

Handoff mode builds a printable briefing from a sharing profile that toggles which record types to include; sensitive contacts, serial numbers, document details, subscription costs and private notes are always left out. Display mode renders a large-type, low-sensitivity view of today's tasks, today's events and upcoming maintenance, meant for a kitchen tablet. See **[Household Handoff](/features/household-handoff/)** and **[Family Display Mode](/features/family-display-mode/)**.

## Settings — backups, storage and the master table

Settings shows current storage usage against the browser's quota, lets you request persistent storage, and is where JSON backups (optionally password-encrypted) and a bulk-edit CSV export/import live — the CSV exposes every field on every record type, including the ones the quick-add forms don't ask for.

## What ties the twelve screens together

The spine of the product is that assets, maintenance, warranties and documents all reference each other by ID. A dishwasher asset, its descale-and-filter maintenance task, its two-year warranty and its manual-location document entry are four separate records that all point back to the same asset, so opening the dishwasher's context shows its full story rather than four disconnected lists. See **[Private Family Organizer](/features/private-family-organizer/)** for how the local-only storage model that makes all of this possible actually works, and **[Free Home Management App](/features/free-home-management-app/)** for what's included at no cost.
