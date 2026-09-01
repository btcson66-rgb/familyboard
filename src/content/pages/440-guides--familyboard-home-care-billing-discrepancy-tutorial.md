---
title: "Home Care Billing Discrepancy Tutorial | Reconcile Service and Payment Sources"
description: "Learn how to review a home-care billing discrepancy by separating service evidence, itemized charges, benefit decisions, payments, corrections and refunds."
route: "/guides/familyboard-home-care-billing-discrepancy-tutorial/"
primaryIntent: "use the home-care charge, service and payment discrepancy log to connect an actual service period, controlling plan, itemized charge, benefit status, payment and later account result without deciding what is owed"
primaryKeyword: "home care billing discrepancy tutorial"
cluster: "records-emergency"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-29"
lastReviewedAt: "2026-08-29"
related:
  - "/tools/home-care-charge-service-payment-discrepancy-log/"
  - "/tools/home-care-visit-scope-service-result-log/"
  - "/tools/home-care-payment-refund-collection-notice-log/"
  - "/guides/home-care-service-fees-and-billing/"
faq:
  - question: "Does billed minus expected tell me what I owe?"
    answer: "No. It is arithmetic on entered values; current provider, contract, benefit, payer and payment sources control the real result."
  - question: "Can a calendar prove that a visit did not occur?"
    answer: "No. It can identify a question, but obtain the responsible actual-service or verification source."
  - question: "Is an ABN the same as a bill or denial?"
    answer: "No. Each notice or statement has a different purpose and process."
  - question: "When is a refund complete?"
    answer: "After a responsible correction and the actual payment or account posting are observed separately."
contentVersion: 1
---
# Home Care Billing Discrepancy Tutorial: Reconcile Sources Before Calling a Balance Due

A home-care statement may depend on a plan or contract, an authorization, the service that actually occurred, an itemized provider bill, a payer claim result, a household payment and a later correction. A single number labelled “balance” hides which source is still unresolved. The free [Home Care Charge, Service and Payment Discrepancy Log](/tools/home-care-charge-service-payment-discrepancy-log/) helps connect those sources without declaring an amount owed, a valid claim or a refund.

## Begin with one service period and one currency

Use a safe code such as `HOME-CARE-CHARGE-2026-A` and choose one review period. Confirm the protected person and account relationship in the responsible system, then keep only a safe period pointer in FamilyBoard. Use one currency for each version; the arithmetic does not convert USD, TWD or another currency and cannot replace an accounting or payer source.

The baseline date is the earliest plan, service, fee or notice version included. The current review date is when the household compared the sources. A next checkpoint is a household reminder, not a claim, appeal, collection or lawsuit deadline. Read every current notice immediately.

## Keep planned, authorized, delivered and billed separate

Review the chain in this order:

1. **Plan or contract:** what service was intended under the current version.
2. **Authorization or benefit decision:** what a payer or program says it may cover.
3. **Actual service:** what an attributable provider or visit source says occurred.
4. **Itemized charge:** what the provider statement reports.
5. **Payer result:** how a claim, notice or benefit statement was processed.
6. **Payment:** what a payment source shows was actually posted.
7. **Correction or refund:** what the provider, payer or account source later changed.

A calendar reminder is not an official visit record. A paid claim does not prove the provider posted a household payment correctly. A provider statement does not decide coverage. Link each source with a safe code and leave the missing layer open.

## Use the four amount markers as signals, not conclusions

The tool can record `EXP` (expected household responsibility from the source being reviewed), `BILLED` (provider statement amount), `PAID` (payment actually observed) and `ADJUSTED` (refund or credit actually observed). A billed-minus-expected result is same-currency arithmetic only. It is a prompt to compare sources, not proof of overcharging, debt, eligibility, damages or a refundable amount.

If the values disagree, preserve which document produced each value and its version. Do not overwrite the old amount when a corrected statement arrives; add a new source observation. The [Home Care Payment, Refund and Collection Notice Log](/tools/home-care-payment-refund-collection-notice-log/) is useful when a notice or account handoff creates a separate response route.

## Distinguish Medicare, Medicaid and private arrangements

Original Medicare home-health coverage, Medicaid home- and community-based services, managed-care benefits, private-duty care and private-pay contracts do not share one universal billing rule. An ABN, Medicare Summary Notice, Explanation of Benefits, Home Health Change of Care Notice, provider invoice and collection letter answer different questions. Record the exact document and follow its current instructions through the responsible source.

Do not copy a $0 covered-service statement into a private-care or Medicaid row. Do not call a generic estimate an ABN. If a cost question is also a service complaint or benefit appeal, create separate linked rows because the decision-maker and deadline may differ. FamilyBoard does not determine coverage, medical necessity, legal responsibility or a deadline.

## Protect care, payment and identity information

Use safe aliases and source codes. Keep full bills, account numbers, card details, diagnoses, care notes, addresses, signatures, notices and correspondence in protected storage. Before sharing a row, confirm that the recipient needs only the period, source owner, amount marker and next action. FamilyBoard is local-first and does not become a billing archive or payment service; export a protected backup before clearing browser data.

Future affiliate products such as folders or scanners must stay outside billing review and appeal instructions. Buying a product cannot prove a charge, change a benefit decision or guarantee a refund.
