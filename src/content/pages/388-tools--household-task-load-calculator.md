---
title: "Household Task Load Calculator | Free Weekly Chore Time Estimate"
description: "Estimate weekly household task time from frequency and minutes per occurrence, group it by neutral role code and keep the result local and non-judgmental."
route: "/tools/household-task-load-calculator/"
primaryIntent: "estimate recurring household time by role so a family can discuss capacity without treating minutes as a fairness score"
primaryKeyword: "household task load calculator"
cluster: "tools"
pageType: "tool"
indexable: true
depthVerified: true
publishedAt: "2026-08-29"
lastReviewedAt: "2026-08-29"
related: []
faq:
  - question: "What does the calculator estimate?"
    answer: "It multiplies each entered task's minutes per occurrence by a simple frequency factor, then totals the approximate weekly minutes for each role code and for the list as a whole."
  - question: "Does it decide who should do a task?"
    answer: "No. It only groups the labels you enter. Use the result to start a conversation, then assign a real owner in the FamilyBoard app or another system."
  - question: "Why is monthly work converted with 12/52?"
    answer: "Twelve monthly occurrences spread across fifty-two weeks is a transparent planning approximation. A real month can be shorter, longer or interrupted, so the estimate is not a timesheet."
  - question: "Can I include care, school or private work?"
    answer: "Use neutral role codes and broad task labels only. Keep names, addresses, health details, account information and private messages in the protected system that controls them."
contentVersion: 1
---
# Household Task Load Calculator: make recurring work visible without turning it into a score

Households usually count the visible action and miss the preparation around it. “Take out the recycling” may include checking the collection rule, sorting items, moving a bin and bringing it back. “Book a repair” may include finding the manual, waiting for a reply and confirming the result. FamilyBoard's free [Household Task Load Calculator](/tools/household-task-load-calculator/) makes one narrow part of that invisible work discussable: it converts the frequency and minutes that you enter into an approximate weekly total. It does not observe your home, measure anyone's effort or declare a fair split.

## Start with a neutral review code

Use a code such as `LOAD-REVIEW-2026-A`, not a person's name. The code lets a household refer to one conversation without putting a family member's identity into a shareable result. Keep the list focused on the question being discussed: a weekly reset, a new school term, a move or a change in work schedules. A narrow list is easier to correct than a grand total that quietly mixes every responsibility in the home.

## Enter one recurring task per line

The tool expects four fields separated by a vertical bar:

`task | role code | frequency | minutes per occurrence`

For example, `Trash and recycling | ROLE-A | weekly | 20` and `Filter condition review | ROLE-B | monthly | 15`. Use a role code such as `ROLE-A`, `ROLE-B` or `UNASSIGNED`; it is a planning label, not an identity check. Minutes are whole numbers from 1 to 1,440. Keep a preparation or follow-up task separate when it has a different frequency or owner. If a row has no owner yet, leave `UNASSIGNED` visible instead of hiding the gap inside somebody else's total.

## Understand the frequency factors

The calculation is deliberately inspectable. Daily becomes seven occurrences per week, weekly becomes one, fortnightly becomes 0.5 and monthly becomes 12/52. A monthly task that takes 15 minutes therefore contributes about 3.5 weekly minutes; it does not claim that every week contains the same work. The tool does not accept “sometimes,” infer a frequency from a sentence, add travel or waiting time, or convert a local collection rule into a schedule. If a task is one-off, keep it outside this recurring estimate and record it as a dated project or event.

## Read the role summary as a conversation starter

The result shows each line's weekly estimate, then groups those estimates by the role code that you supplied. A large number can mean frequent small actions, a single context-heavy responsibility or simply an overestimated duration. A small number can hide a high-stakes interruption. Ask the people doing the work which rows are missing preparation, which estimates should be measured once and which tasks should stay with one owner because learning the source takes time. Do not turn the summary into a leaderboard, a punishment or a demand that a person exceed a safe capacity.

## Turn the estimate into real FamilyBoard work

After the discussion, create or update a FamilyBoard task for the next concrete action: check the collection notice, confirm the appliance manual, or schedule the monthly review. Assign an owner, due date and evidence of completion in the app. Keep the calculator output as a dated planning note if it explains how the conversation started; it is separate from the task's actual completion history. The [Recurring Chore Planner](/tools/recurring-chore-planner/) can produce a simple rotation, while the [Responsibility Coverage Map](/tools/household-responsibility-coverage-map/) is better when the household needs a backup path for notice, planning, execution and follow-through.

## Revisit estimates when the household changes

Record the date and reason for a new estimate when a child starts school, a caregiver's availability changes, a move adds travel or a service becomes seasonal. Keep the earlier result as an observation instead of rewriting it to make a later split look continuous. One short measurement session can improve a guess, but it still does not capture every interruption or emotional load. If the list repeatedly exceeds what people can safely do, reduce scope, add a backup route or ask an appropriate service for help; do not solve a capacity problem by arguing over decimal places.

## Privacy and future recommendations

The calculation runs in the current browser and does not read the FamilyBoard app, a calendar or a household account. Before sharing, remove names, schedules, addresses, health information and private messages. If a future page shows a labelled planner, timer or printable category, it must sit outside the result, disclose any affiliate relationship and remain easy to ignore. A product cannot make a division fair, create a reminder or verify that a task was completed.

## A useful closeout

Save the review code, the exact rows, the date of the conversation and one next action. Then compare the estimate with what the responsible role actually observed during the next review. The value is not a perfect number; it is a shared vocabulary for work that was previously invisible, with enough context for the family to change the plan deliberately.
