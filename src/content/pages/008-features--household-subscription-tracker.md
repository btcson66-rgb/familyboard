---
title: "Household Subscription Tracker for Renewals, Costs and Cancellation Notes | FamilyBoard"
description: "Track household subscriptions, renewal dates, billing frequency, ownership and cancellation notes in one private list."
route: "/features/household-subscription-tracker/"
primaryIntent: "track household subscriptions and renewals"
primaryKeyword: "household subscription tracker"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-22"
nextStep: "Add your three most expensive recurring subscriptions first, check the annualized total, and mark anything you no longer use as cancelled."
related:
  - "/features/family-task-manager/"
  - "/features/home-dashboard/"
  - "/features/private-family-organizer/"
  - "/features/free-home-management-app/"
faq:
  - question: "How is the annualized subscription total calculated?"
    answer: "FamilyBoard multiplies each active subscription's cost by a fixed factor based on its billing frequency — 52 for weekly, 12 for monthly, 4 for quarterly, and 1 for annual — then sums records only within the same currency. USD, TWD and JPY remain separate because the app does not fetch exchange rates."
  - question: "Does FamilyBoard remind me before a subscription renews?"
    answer: "Not automatically as a standalone alert. The review-before-days field records how much notice you'd want, but the practical way to get a real reminder on the dashboard is to create a task due that many days before the renewal date."
  - question: "Is it safe to store my credit card number in the payment method note?"
    answer: "No — don't. That field's help text explicitly says never to store card numbers or passwords there. It's meant for a household-readable note like \"billed to the joint checking account,\" not actual payment credentials, which belong in a dedicated password manager."
  - question: "What happens when I mark a subscription as cancelled?"
    answer: "Its status changes to \"cancelled,\" which removes it from the active-subscription dashboard count and annualized totals. The record itself is not deleted, so its entered details stay available and you can reactivate it later. FamilyBoard does not automatically record a dedicated cancellation date."
contentVersion: 1
---
# Subscriptions are household obligations, not just line items

A subscription tracker often gets treated as a pure budgeting tool. Cost matters, but the operational questions matter just as much: who owns the account, does it renew monthly or annually, where do you actually manage it, and is it tied to something the whole household depends on? `FamilyBoard`'s Subscriptions tab keeps those details together instead of scattering them between a budgeting app and memory.

## What a subscription record holds

The English quick-add form captures the service name, category (defaulting to "Household"), a non-negative cost, currency (defaulting to USD), billing frequency (monthly, annual, weekly or quarterly), next renewal date, a non-negative review-lead-time in days before renewal (defaulting to 14), an owner, a management URL, and a payment-method note. The Traditional Chinese interface defaults to the category 家庭 and currency TWD. The payment-note help text explicitly says: "Never store card numbers or passwords." It can identify an account in general terms — "household Visa" — without becoming a place to store the actual number.

## The annualized total is computed live

Above the subscription list, the tab shows annualized active totals separated by currency. The calculation is straightforward — weekly costs are multiplied by 52, monthly by 12, quarterly by 4, and annual by 1 — and is recomputed when the data changes. Adding, cancelling or reactivating a subscription changes the corresponding currency total immediately. FamilyBoard does not fetch exchange rates and never adds USD, TWD and JPY into a misleading combined number.

## A worked example of the annualized math

Say a household has three active USD subscriptions: a $15.99/month streaming service, an $89.99/quarterly pest-control plan, and a $6.49/week meal-kit box. The USD annualized total is (15.99 × 12) + (89.99 × 4) + (6.49 × 52) = $889.32. If the same household also records a TWD 1,200 annual service, the notice shows `TWD 1,200 · USD 889.32`; it does not call the sum 2,089.32 because those numbers are different currencies.

## Marking a subscription cancelled instead of deleting it

Each subscription card has a button that toggles between "Mark cancelled" and "Reactivate." Cancelling doesn't delete the record — it changes its status to "cancelled," which removes it from the active-subscription count on the dashboard and from the annualized totals while keeping the entered cost, renewal, owner, category, URL and notes. The current record does not have a dedicated cancellation-date field, so write a date in Notes before cancelling if that history matters. Active records are shown first by nearest renewal date, followed by cancelled records.

## Reviewing before renewal

The review-before-days field is the tracker's version of a heads-up: set it to how many days before a renewal date you'd want to reconsider the service. FamilyBoard doesn't currently turn that into an automatic dashboard alert on its own, so the reliable pattern is pairing a subscription with a task due that many days before the renewal date — the task then shows up in the normal overdue/upcoming logic on the dashboard.

## What it deliberately doesn't do

It doesn't charge, cancel, or contact any service on your behalf — the management URL field just stores where you'd go to do that yourself. It doesn't detect duplicate subscriptions or suggest cheaper alternatives. And it never asks for or stores payment credentials; the payment-method note is a household reminder field, not a wallet.
