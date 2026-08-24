---
title: "Appliance Service History: Visits, Work, Parts and Follow-Up"
description: "Build an appliance service history that separates requests, estimates, technician findings, authorized work, parts, invoices and household follow-up."
route: "/guides/service-history/"
primaryIntent: "build an evidence-based service history for household appliances and systems"
primaryKeyword: "appliance service history"
cluster: "inventory-warranty"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-24"
nextStep: "Open the Appliance Service Visit Log for the active visit, then carry only the source-linked events and open follow-up into the asset's long-term history."
related:
  - "/tools/appliance-service-visit-log/"
  - "/guides/repair-history/"
  - "/guides/how-to-track-product-warranties/"
  - "/guides/appliance-inventory/"
faq:
  - question: "How is a service history different from a repair history?"
    answer: "Repair history focuses on a failure, diagnosis, repair and recurrence. Service history is broader: requests, estimates, inspections, maintenance, installation, repair, parts, invoices, callbacks and household follow-up. A repair can be one event within the larger service timeline."
  - question: "Does a service invoice prove that maintenance was done correctly?"
    answer: "No. It proves only what the invoice actually states. Preserve the service report, attributable work description, part pointer and household follow-up separately. FamilyBoard cannot inspect workmanship or certify safety, quality or compliance."
  - question: "Does using an independent repair shop automatically void a US warranty?"
    answer: "Not automatically. FTC guidance says a manufacturer generally cannot require branded parts or service solely to maintain coverage unless they are provided free or a waiver applies, but damage caused by outside parts or service and the actual written terms may still matter. This is US-specific information, not a global rule or a coverage decision."
  - question: "What should I record before authorizing extra work?"
    answer: "Preserve the original scope, provider finding, proposed addition, price or pricing basis, schedule effect, parts description, approving role and dated authorization source. Do not overwrite the original estimate."
  - question: "When should a service visit be marked closed?"
    answer: "After the provider's completion evidence and the household's dated follow-up are both linked, or after a documented deferral or handoff. An appointment, estimate, arrival, verbal statement or invoice alone is not the whole outcome."
contentVersion: 2
---
# Appliance service history: turn each visit into a record the next visit can use

An appointment confirmation proves that a visit was scheduled. An invoice proves that a provider charged for something. Neither one, by itself, tells the next person what the household observed, which product was serviced, what the provider found, what work the household authorized, which part was installed or whether the result held after the technician left.

An appliance service history connects those facts to one asset over time. It includes routine service, inspection, diagnosis, repair, installation, callback and post-visit observation. The useful unit is not a vague line such as `technician came — $180`; it is a source-linked event that another household member, provider or warranty reviewer can understand without relying on memory.

**Recording a visit now? [Use the free Appliance Service Visit Log](/tools/appliance-service-visit-log/).**

## Keep five layers separate

One service visit can generate five different layers of information:

1. **Household observation:** what was seen, heard, smelled, displayed or interrupted before anyone diagnosed the cause.
2. **Requested scope and estimate:** what the household asked the provider to inspect, the estimate basis and any disclosed diagnostic, travel or administrative charge.
3. **Provider finding:** the attributable diagnosis, test result or recommendation in the service report.
4. **Authorized and completed work:** what the household actually approved, what the provider says was done, and which part or setting changed.
5. **Household follow-up:** the dated condition after return to normal use, including a recurring symptom, incomplete work or a separate warranty issue.

Do not rewrite the first observation after receiving a diagnosis. `Unit stopped after 12 minutes and displayed E7` remains a household observation. `Provider report says fan-motor fault` is a separate provider finding. The distinction makes it possible to see later whether the same symptom returned or whether a new provider reached a different conclusion.

## Verify who is arriving without turning the history into a rating page

Search advertising, a familiar logo or a brand name in a business title does not prove that a provider is the manufacturer or an authorized service center. Before sharing an address, product identifier or payment information, start from the manufacturer's official support channel or independently verify the business identity, service role, contact source and estimate terms.

The record should state the role the source actually supports: `manufacturer service team`, `retailer-arranged provider`, `independent appliance repair business` or `building maintenance contractor`. Do not change `independent` to `authorized` because a person arrived in a branded shirt. Equally, do not use FamilyBoard notes to accuse or rank a provider. Preserve objective sources and move a real dispute into the appropriate protected process.

## Capture the estimate before the scope changes

Write down what the estimate includes, what it excludes, whether a diagnostic or travel charge applies, whether approval is required before additional work and how changed scope will be confirmed. Preserve the actual estimate rather than copying a total into a note. A total without scope cannot show whether a later invoice reflects added work, a different part or a fee that was disclosed before the visit.

If the provider recommends extra work during the visit, create a new source-linked event: the observed finding, proposed addition, price or basis, schedule effect, household decision and approving role. Do not overwrite the original request. The [home repair change order log](/tools/home-repair-change-order-log/) is better for a larger project with multiple scope changes; the service visit log is for one appliance or system visit.

## Record parts precisely without exposing a full identifier

For a replaced part, preserve the provider's description, part-number pointer, new or refurbished status if stated, quantity, stated coverage or workmanship terms and any removed-part disposition that matters. Use the exact service-document wording; do not infer that a compatible part is original equipment, that an installed part is new or that a verbal promise creates a particular warranty.

The shareable timeline needs only a safe pointer such as `PART-P2` or `SERVICE-S4`. Full serial numbers, claim identifiers, technician names, phone numbers, addresses, signatures and payment credentials remain in protected evidence.

## Separate completed work from a successful household recheck

`Work completed` should mean the provider supplied a service record describing what it says was done. It does not mean the problem is resolved, the product is safe or the household accepts every conclusion. Keep that event open until the household performs the appropriate normal-use observation allowed by the manufacturer and any safety instruction.

If the same symptom returns, add a new dated observation and link the earlier visit. Do not alter the old entry to say the repair failed. If a different symptom appears, keep it distinct. This structure lets the [repair history guide](/guides/repair-history/) reveal recurrence without turning a household record into a technical diagnosis.

## Warranty, service contract and repair-work promises are different sources

The US Federal Trade Commission's [consumer warranty guidance](https://consumer.ftc.gov/articles/warranties) advises keeping the written warranty and receipt and checking who handles claims, what repair costs may apply and whether shipping or labor is included. It also explains that US federal law generally does not let a manufacturer require specific branded parts or service merely to keep warranty coverage unless they are provided free or the FTC grants a waiver. Damage actually caused by an outside part or service can still be a different issue, and state law may add protections.

Do not turn that US rule into a worldwide statement, and do not assume every post-sale service promise is the original product warranty. The FTC's [Businessperson's Guide to Federal Warranty Law](https://www.ftc.gov/business-guidance/resources/businesspersons-guide-federal-warranty-law) distinguishes warranties on services from written warranties on consumer goods and explains that parts and workmanship may be treated differently depending on what the written terms cover.

For any location, preserve the purchase-time warranty, separately paid service contract, current estimate, service report, parts terms and provider promise as separate sources. A FamilyBoard entry cannot decide which document controls.

## Use one asset timeline, not one household-wide receipt pile

Keep each service event linked to the exact appliance or system. A household-wide folder named `repairs` makes it hard to answer whether the refrigerator was serviced twice or whether one invoice belonged to the freezer. A private asset label connects installation, routine maintenance, warranty claims, recall work, repair visits and replacement without exposing complete product identifiers.

Use event types such as `request`, `estimate`, `arrival`, `inspection`, `finding`, `authorization`, `work`, `part`, `invoice`, `household recheck`, `callback` and `handoff`. A long timeline stays scannable because every event has a purpose, source and date.

## Convert every open recommendation into owned work

`Watch this next season` is not a usable follow-up. Record what the provider actually recommended, where that statement lives, which household role will review it and the household checkpoint date. The date is an internal reminder, not a manufacturer interval, legal deadline or prediction of failure.

If a provider says the equipment should not be used, or the household observes smoke, fuel odor, overheating, electric shock, injury or another urgent condition, follow current manufacturer, product-safety authority, emergency and qualified professional guidance. Do not continue testing to improve the record.

## Add older history selectively and preserve unknowns

Start with the most recent significant visit and any current open recommendation. Older invoices can be added when they answer a real question. Mark uncertain fields as unknown and link the source you have; do not invent the part, diagnosis or completion date from a bank transaction or calendar entry.

A reconstructed entry should say `invoice confirms service on 2024-05-18; detailed scope unavailable`, not `annual maintenance completed` unless a source supports that wording. Evidence quality matters more than a cosmetically complete timeline.

## Commercial recommendations must not influence the service record

A future affiliate area may show clearly labelled storage supplies, label makers, replacement filters or household record products. It cannot select a provider, label a business authorized, recommend a repair, infer a diagnosis, change the service scope, decide whether to approve work, mark a visit complete or suggest that a purchase changes warranty rights.
