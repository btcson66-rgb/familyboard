---
title: "Home Dashboard for Maintenance, Warranties, Tasks and Renewals | FamilyBoard"
description: "A practical household dashboard that brings maintenance, warranties, recurring tasks, subscriptions and upcoming home responsibilities into one view."
route: "/features/home-dashboard/"
primaryIntent: "find a household dashboard or home command center"
primaryKeyword: "home dashboard"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-19"
nextStep: "Open the app, add two recurring responsibilities and one asset, then use the dashboard to see how scattered household tasks become a single actionable view."
related:
  - "/features/maintenance-tracker/"
  - "/features/warranty-tracker/"
  - "/features/family-display-mode/"
  - "/app/"
faq:
  - question: "How is \"maintenance due soon\" calculated?"
    answer: "It's any maintenance task whose next-due date falls within the next seven days from today, calculated fresh every time the Today tab loads. There's no setting to widen or narrow that window; tasks due further out are still visible in full on the Maintenance tab."
  - question: "Can I customize which cards or counters appear on the dashboard?"
    answer: "Not currently. The Today tab always shows the same four counters and the same two lists (next responsibilities, maintenance due). If you want a different view of the same data, the Family Display Mode offers a separate large-type layout built for a shared screen rather than a private one."
  - question: "Why doesn't the dashboard show warranties or subscriptions that are about to expire?"
    answer: "Those live on their own Warranties and Subscriptions tabs rather than as dashboard counters. A practical workaround is creating a task (\"Review water heater warranty\") with a due date before the expiration, so it surfaces on Today through the normal task-overdue logic."
  - question: "Does the dashboard update in real time if someone else edits a record?"
    answer: "FamilyBoard stores data in this browser only, so there's no other device or person editing the same database simultaneously. Within one browser, the dashboard reloads its data automatically about once a minute and whenever you return to the tab."
contentVersion: 1
---
# A home dashboard should tell you what needs attention, not just show pretty charts

Open `FamilyBoard` and the first screen you see — the Today tab — is four numbers and two short lists, not a chart or a decorative widget. That's a deliberate choice: a household dashboard's only job is answering "what needs attention right now," and every extra element competing for space on that screen makes the real answer slower to find.

## The four counters

Across the top of Today sit four figures, each recomputed from your actual records every time the page loads:

- **Overdue tasks** — the count of open tasks whose due date has already passed.
- **Maintenance due soon** — maintenance tasks whose next-due date falls within the next seven days.
- **Active assets** — every asset whose status isn't "archived."
- **Active subscriptions** — every subscription whose status is "active."

None of these are configurable thresholds you can tune; the seven-day maintenance window and the overdue/active definitions are fixed in the app itself. If you want a wider planning horizon, the full Maintenance and Tasks tabs list everything, not just what's imminent.

## The two lists beneath them

Below the counters are two cards. "Next responsibilities" shows your five soonest open tasks, each with its due-date label and assigned owner, and a button that jumps straight to the full Tasks tab. "Maintenance due" shows up to five maintenance items due within the same seven-day window, each labeled with its linked asset or home area and due-date status, with a button into the full Maintenance tab. If nothing is open, each card says so plainly instead of leaving a blank space — "Nothing needs your attention right now" for tasks, "No maintenance is due in the next seven days" for maintenance.

## A worked example

Suppose your household has a dishwasher maintenance task ("Clean filter and check seal," due in 4 days), an overdue task ("Renew car registration," due 3 days ago), a dryer maintenance task due in 40 days, and three active subscriptions. Today would show: Overdue tasks = 1, Maintenance due soon = 1 (only the dishwasher task falls inside seven days; the dryer task doesn't), Active assets = however many aren't archived, Active subscriptions = 3. The dryer task doesn't appear anywhere on Today until it crosses into that seven-day window — it's still fully visible on the Maintenance tab in the meantime.

## Why the dashboard doesn't try to show everything

A household with years of history can accumulate hundreds of completed maintenance events, closed tasks and expired warranties. Surfacing all of it on the first screen would bury the two or three things that actually need a decision this week. The Today tab intentionally shows only open, upcoming or overdue items; everything else lives one click away on its own tab, in full.

## What the dashboard does not do

It does not send a push notification, email or text — nothing fires while the browser is closed. It refreshes when you open the app, when you switch back to its browser tab, and on a background timer while it's open, but only because the underlying data reload runs on that schedule, not because of any external reminder system. It also doesn't show warranty expirations or subscription renewals as separate counters — those live on their own tabs, though an expiring warranty or subscription can still show up as a task if you've created one to review it.

## From dashboard to wall display

The same Today data — tasks, events, upcoming maintenance — can be shown in a simplified, larger-type layout meant to be read from across a room rather than clicked through. That's a separate mode built for a mounted tablet, not a setting on the dashboard itself; see Family Display Mode for how it differs.
