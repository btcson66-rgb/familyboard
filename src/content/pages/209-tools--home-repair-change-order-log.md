---
title: "Home Repair Change Order Log | Cost, Time and Written Approval"
description: "Record repair additions, deletions and substitutions with written evidence, cost and schedule effects, owners and close-out—without replacing the signed contract."
route: "/tools/home-repair-change-order-log/"
primaryIntent: "reconcile written home repair changes against the original project scope, cost and schedule"
primaryKeyword: "home repair change order log"
cluster: "tools"
pageType: "tool"
indexable: true
depthVerified: true
publishedAt: "2026-08-23"
lastReviewedAt: "2026-08-23"
nextStep: "Build a dated change ledger now, then reconcile the result against the original documents before the next payment or close-out review."
related:
  - "/guides/contractor-records/"
  - "/tools/home-service-provider-verification-log/"
  - "/guides/renovation-records/"
  - "/guides/home-improvement-receipts/"
faq:
  - question: "Does the generated log amend my contract or count as a signature?"
    answer: "No. It is a private household record. It cannot identify or bind parties, prove authority or delivery, create a signature or satisfy a local change-order rule. Preserve and use the original written documents required for the project."
  - question: "Which changes are included in the accepted total?"
    answer: "Only rows marked approved in writing or completed, and only when both cost and schedule effects are numeric. Proposed rows remain visible but excluded; declined rows use zero. The total is arithmetic, not a decision about what is valid or due."
  - question: "What if a change has no price increase but delays the project?"
    answer: "Enter `0` for cost and the signed number of days for schedule once the effect is written and approved. Money and time are intentionally separate fields."
  - question: "Can I use `pending` on an approved change?"
    answer: "No. Approval without a resolved cost and time effect is ambiguous for this record. Keep the row proposed until both effects and the written decision pointer can be entered, even if one effect is zero."
  - question: "Does completed status mean I accepted the work or waived defects?"
    answer: "No. It means only that the household linked its chosen close-out evidence. The contract, inspections, qualified assessments and applicable law determine acceptance, defects, safety, compliance and warranty consequences."
contentVersion: 1
---
# Home repair change order log

A home repair can drift away from its original agreement one conversation at a time. A material is unavailable, an opening reveals a hidden condition, the household removes an item, or the provider proposes a different method. Without a versioned record, the final invoice and completion date can become impossible to reconcile with what everyone remembers.

This free browser tool preserves an original arithmetic baseline and one row per proposed, approved, declined or completed change. It validates dates and IDs, requires accepted changes to have numeric cost and schedule effects, and gives every open change one owner-led evidence action. Processing stays in the browser.

It does not create or amend a contract, capture a signature, prove authorization, decide whether a charge is valid or due, inspect work, approve permits, determine compliance, calculate tax or insurance treatment, or resolve a dispute. The signed originals and responsible sources control.

**Ready to reconcile a real project? [Jump to the Home Repair Change Order Log](#tool-heading).**

## Freeze the original project baseline first

Enter a private project label, not a full address. The original agreement date is the date on the signed contract or accepted estimate that forms the baseline. The record date is when the household reconciles all change rows; it cannot be in the future or earlier than the baseline.

The baseline evidence field should identify the exact version and its scope in safe language: `signed contract C-1; replace listed cabinet fronts; excludes electrical relocation and wall repair`. Include the protected document pointer but not signatures, private contacts, payment credentials or a home address.

Enter the original agreed amount and planned duration only when those figures exist in the referenced baseline. Use zero where duration was not expressed as calendar days and explain that limitation in the baseline. Do not invent a duration to make the arithmetic look complete.

The tool supports a currency label so the output is readable, but it performs simple arithmetic only. It does not apply tax, financing, allowances, retainage, escalation, exchange rates or payment law.

## Create one row for each distinct change

Each change row uses ten fields:

`ID | request date | requested by role | exact addition, deletion or substitution | reason or observed trigger | cost effect | schedule effect in days | written decision or close-out evidence | owner | status`

Use stable IDs such as `CHG-1`, `CHG-2` and `CHG-3`. A change date must fall between the original agreement and the record date. `Requested by role` can be `household project owner`, `contractor project lead` or `building manager`; avoid a person's private contact information.

Describe the change narrowly. `Substitute sink model A with model B, including revised mounting hardware` is auditable. `Kitchen extras` is not. The reason should preserve an attributable fact: `model A unavailable per supplier notice SUP-2` or `concealed damaged backing observed after authorized opening; PHOTO-7`. It should not assert fraud, fault, safety or legal responsibility.

## Record cost and time as separate signed effects

Cost and time answer different questions. Enter a number without a currency symbol for cost and an integer number of calendar days for schedule. Positive numbers increase the baseline, negative numbers reduce it and zero records no accepted effect. A proposed row may use `pending` until the written effect exists.

Approved and completed rows must use numeric values for both fields. Declined or withdrawn rows must use zero for both because they do not enter the accepted arithmetic total. If the parties are still discussing whether a deletion deserves a credit, leave the row proposed rather than guessing a negative amount.

The output sums only `Approved in writing—not yet completed` and `Completed—close-out evidence linked` rows into the accepted change total. It also shows how many proposed effects remain pending. This is an arithmetic snapshot, not an invoice validation or conclusion about legal entitlement.

## Use four statuses with evidence boundaries

`Proposed—awaiting written scope, price or time` means at least one decision input remains open. It may contain proposed numbers or `pending`, but it is excluded from accepted totals.

`Approved in writing—not yet completed` means the household has a protected pointer to the written decision required by its workflow and has recorded numeric cost and time effects. The tool does not verify signatures, authority or legal validity.

`Declined or withdrawn—with reason recorded` preserves the decision history and uses zero accepted cost and time. Do not delete it; a decline can explain why an earlier drawing or message was not built.

`Completed—close-out evidence linked` means the row points to the household's stated completion evidence. It does not certify workmanship, concealed conditions, permit compliance, inspection, safety, acceptance or warranty.

## Every open change needs exactly one next evidence action

Proposed and approved-but-not-completed rows are still open. Each needs exactly one action row:

`open change ID | next written or close-out evidence | owner | due date`

A proposed action might be `obtain revised itemized proposal showing credit, tax treatment and schedule effect`. An approved action might be `complete walkthrough of the changed cabinet scope and preserve dated punch-list evidence`. The due date must fall between the record date and next household review.

The due date is an organizational control. It does not extend a contract notice, cancellation, permit, inspection, insurance, warranty, payment or dispute deadline. Those dates must come from the controlling source.

## Written change rules depend on the actual location and agreement

The [Federal Trade Commission](https://consumer.ftc.gov/articles/how-avoid-home-improvement-scam) advises getting detailed written estimates and contracts and preserving promises made in conversations. The California Contractors State License Board's [home-improvement contract guidance](https://www2.cslb.ca.gov/Consumers/Hire_A_Contractor/Home_Improvement_Contracts/What_Is_A_Contract.aspx) says covered California price or scope changes require a written change order signed before the change. Massachusetts publishes a different state-specific contract framework that also calls for written, mutually agreed modifications.

These examples show why location matters; they are not a universal contract rule. Check the original agreement and the current consumer, contractor, building and legal sources for the project's jurisdiction. A FamilyBoard status cannot satisfy a writing, signature, delivery or notice requirement.

## Do not use a payment or site photo as automatic approval

A payment may be relevant evidence, but the tool does not infer which scope it accepted or whether it was required. A site photo may show appearance, but it cannot prove hidden work, code compliance or safety. Keep invoice, payment, message, photo, inspection and approval evidence as distinct protected sources.

If work starts before a change is reconciled, record that observable fact without retroactively marking the change approved. If a dispute exists, do not alter earlier rows. Preserve versions and obtain advice about the applicable notice and resolution process.

## Protect the household and project evidence

The form blocks common phone, email, full numeric identifier, address, password, access-code, payment-card, bank, government-ID, licence, policy, claim and signature patterns. Automated screening cannot recognize every private fact, so inspect the output before sharing it.

Use pointers such as `CHANGE-CHG-2`, `PHOTO-7`, `INVOICE-I4` and `APPROVAL-A2`. Keep original contracts, signatures, invoices, full provider details and dispute files in access-controlled storage. A shared household summary rarely needs the exact home address or bank transaction number.

## Close the project without erasing its changes

When all changes are completed or declined, reconcile the final scope, accepted arithmetic total, final invoice, payments, inspections, product and warranty records, punch list and continuing tasks. Differences should remain visible with an explanation rather than being silently forced to match.

Use [contractor records](/guides/contractor-records/) for the full evidence structure, the [provider verification log](/tools/home-service-provider-verification-log/) for pre-hire source checks and [home-improvement receipts](/guides/home-improvement-receipts/) for project purchase evidence.

## Commercial recommendations stay outside the record

A future affiliate area may present clearly labelled project software, document storage, materials or provider-discovery categories beside the educational page. It cannot appear inside the form or output, mark a change approved, change the total, satisfy evidence or imply that a sponsored provider is authorized for the work.

**Next step:** enter the exact original agreement pointer, then add one row for every proposed addition, deletion, substitution or schedule effect without overwriting the baseline.
