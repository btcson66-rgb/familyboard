---
title: "Home Care Charge, Service and Payment Discrepancy Log"
description: "Compare home-care services, itemized charges, benefit status, payments, corrections and refunds without storing account numbers or private care details."
route: "/tools/home-care-charge-service-payment-discrepancy-log/"
primaryIntent: "reconcile a home-care service period, current plan or contract version, actual service evidence, itemized charges, benefit status, household payment responsibility and the later correction, refund or credit result without storing private care or account data"
primaryKeyword: "home care billing discrepancy log"
cluster: "tools"
pageType: "tool"
indexable: true
depthVerified: true
publishedAt: "2026-08-27"
lastReviewedAt: "2026-08-27"
nextStep: "Generate the default version, confirm that one reviewed row and one account-result-pending row remain visibly separate, and compare the USD 40 billed-minus-expected arithmetic signal with the protected sources. Do not treat it as an amount owed or refundable."
related:
  - "/tools/home-care-visit-scope-service-result-log/"
  - "/tools/home-care-service-interruption-backup-continuity-log/"
  - "/tools/home-care-service-plan-change-notice-log/"
  - "/tools/home-care-complaint-response-resolution-log/"
  - "/privacy/"
faq:
  - question: "Does the billed-minus-expected number show what I owe?"
    answer: "No. It is same-currency arithmetic on the values entered. The current provider, contract, benefit, payer and payment sources determine the real responsibility and result."
  - question: "Does Medicare always make home care free?"
    answer: "No. Medicare states $0 for covered home health services, subject to the benefit's eligibility and coverage rules; durable medical equipment can have cost sharing. Private personal care, Medicaid HCBS and other arrangements use different sources."
  - question: "Is an ABN the same as a bill or denial?"
    answer: "No. The CMS ABN is a specific Original Medicare fee-for-service beneficiary notice used under defined possible-noncoverage circumstances. A bill, MSN, EOB, HHCCN and appeal decision answer different questions."
  - question: "Can I use my calendar as proof that a visit did not occur?"
    answer: "A calendar can point to an event to review, but it should not be represented as the provider's official visit record, electronic visit-verification result or payer decision. Obtain the responsible actual-service source."
  - question: "When is a refund complete?"
    answer: "Record the provider or payer decision, correction or credit and then the actual payment or account result. A promise or posted correction is not automatically money received."
  - question: "Should I paste an itemized bill, card number or care note here?"
    answer: "No. Keep complete billing, payment and care records in a protected system and enter only safe source, version, amount and result codes."
  - question: "What if the charge question is also a service complaint or benefit appeal?"
    answer: "Keep the routes separate. Link them by a safe event code, but preserve each responsible source, notice, receipt, deadline and result independently."
contentVersion: 1
---
# Home care charge, service and payment discrepancy log

A home-care bill can look simple while depending on several different sources: the current plan of care or service agreement, an authorization or benefit decision, the service that actually occurred, a provider's itemized statement, a payer's claim or benefit result, the amount a household was expected to pay, the amount it actually paid, and any later correction, refund or credit. When those sources are collapsed into one spreadsheet cell called `balance`, it becomes hard to tell whether the open question concerns the service, the rate, coverage, cost sharing, payment posting or the final account result.

This free browser tool creates a private household source index for one review period. It preserves the responsible provider, program, contract, benefit and payment sources; the protected person, service period and account relationship; current controlling versions; actual-service evidence; cancellation, no-show, interruption or adjustment category; itemized charge and benefit status; person or household review; expected payment-responsibility source; question and complaint or appeal route; four same-currency amount markers; provider correction; payer result; payment; refund or credit; actual account result; unresolved item; owner; target date; and reopen condition.

The tool does not determine coverage, medical necessity, eligibility, a valid charge, a correct code, an amount owed, a refund, a tax result, fraud, damages or a legal deadline. It does not submit a claim, appeal, complaint or payment. Its arithmetic only adds the numbers you enter. A positive `billed minus expected` result is a review signal, not proof that the provider overcharged or that the difference is refundable. If care or safety is at risk, preserve continuity first and use the responsible care or emergency source before reviewing a statement.

**Need a dated chain between actual service and the final account result, without copying a bill or care record into a general household tool? [Jump to the Home Care Charge, Service and Payment Discrepancy Log](#tool-heading).**

## Begin with one service period and one currency

Create a safe reference such as `HOME-CARE-CHARGE-2026-A`. Choose the context that most closely matches the review: Medicare home health charge or notice, Medicaid home- and community-based services benefit or cost sharing, private-pay home-care contract, delivered-service and itemized-charge difference, cancellation or no-show charge, plan or authorization change, payment or refund result, or provider correction and external review.

Use one currency for the entire version. The workbench can total USD, TWD or a user-selected other currency label, but it never converts between currencies. If a service arrangement produces bills in more than one currency, make separate versions and use the responsible exchange-rate or accounting source outside FamilyBoard.

The baseline date is the earliest service, contract, authorization, fee or notice version included. The current review date is when the household actually compared the sources. The next checkpoint limits open follow-up. These are household review dates, not claim-submission, appeal, payment, collection or lawsuit deadlines. Read every current notice immediately.

Do not start with the provider's bottom-line balance. First identify the protected person and exact service period outside the tool, then match that relationship to a safe period code. Next open the current plan, authorization, contract, fee schedule or notice that controlled that period. Only then compare actual service, the provider's itemized statement, payer status and household payment.

## Twelve columns preserve the full source chain

Enter one versioned service-and-charge question per line:

`ID | safe person alias and charge context | responsible provider, program, contract, benefit or payment source | protected person, service-period and account-relationship match plus source checked date YYYY-MM-DD | current plan, authorization, contract, fee or notice version | actual service evidence plus cancellation, no-show or adjustment category | itemized charge, bill or statement, provider source and benefit status | person or household review, expected payment-responsibility source, question and complaint or appeal route | EXP=number; BILLED=number; PAID=number; ADJUSTED=number; provider correction, benefit, payment, refund or credit, actual account result, unresolved item and reopen rule | owner role | target or outcome date YYYY-MM-DD | one of the twelve exact statuses`

The protected-source checked date must fall between the baseline and current review. Open statuses require a target from the current review through the next checkpoint. Reviewed, completed or not-applicable statuses require an outcome date from the baseline through the current review. Each row needs a unique ID, and a version accepts no more than 14 rows.

The four amount markers have narrow meanings. `EXP` is the household's expected responsibility according to the source currently being reviewed; `BILLED` is the amount shown by the provider source; `PAID` is payment actually observed in the responsible payment source; and `ADJUSTED` is a refund or credit actually observed. These numbers do not overwrite the underlying documents. When an amount is disputed, preserve which source produced it and keep the row open.

## The twelve statuses reveal which evidence layer is still missing

1. **Home-care charge or statement signal received—safety, continuity and source classification pending:** a question exists, but the household has not yet checked whether service continuity or immediate care needs require action.
2. **Safety and service-continuity source recorded—responsible service, contract, program or payment source pending:** urgent needs have an accountable route, while the sources controlling the charge remain unclear.
3. **Responsible sources recorded—protected person, service period and account relationship pending:** a provider, program or contract has been found, but the statement has not been matched safely to the correct relationship and period.
4. **Person, service period and account relationship recorded—current plan, authorization, contract, fee or notice version pending:** the correct relationship is known, while the controlling document version remains open.
5. **Current controlling versions recorded—actual service evidence and cancellation, no-show or adjustment category pending:** the planned or authorized service is known, but what actually occurred has not been attributed.
6. **Actual service evidence recorded—itemized charge, bill or statement and benefit status pending:** service evidence exists, but the charge and payer result are not yet reconciled.
7. **Charge and benefit status recorded—person or household review and payment-responsibility source pending:** itemized amounts are visible, while expected household responsibility is not yet tied to a current source.
8. **Review and responsibility source recorded—provider correction, benefit result, payment, refund or credit and actual account result pending:** the question is defined, but the real account outcome remains open.
9. **Service, version, charge, benefit, payment or rights conflict—responsible review pending:** two or more sources disagree and an accountable provider, payer, program, appeal or complaint route must review the difference.
10. **Source, version, actual service, charge, benefit, household responsibility and actual account result reviewed:** the entire current chain is linked with no hidden pending result.
11. **Responsible account result received—correction, payment, refund or credit, custody and reopen condition recorded:** a responsible result has been observed and preserved with the trigger for another review.
12. **Not applicable—reason and reopen event recorded:** the source or process does not apply to this version, and the service, fee, statement, benefit or payment change that would make it relevant is named.

A row in status ten or eleven does not mean a government program approved the service, the household agrees with every decision, the provider admitted an error, a debt is valid or all appeal rights have ended. It means the household can point to the source chain and the actual observed account result.

## Planned, authorized, delivered and billed are different facts

A plan of care or service agreement describes intended service. An authorization can limit what a payer or program has approved. A scheduled visit shows intention to deliver. Actual-service evidence shows what a responsible source says occurred. An itemized provider statement shows what the provider charged. A claim status, Medicare Summary Notice, Explanation of Benefits or program statement shows a payer's processing result. A receipt shows payment received. None automatically proves all the others.

Use the [Home Care Visit Scope and Service Result Log](/tools/home-care-visit-scope-service-result-log/) to preserve a particular visit's responsible arrival or departure source, authorized scope, exception and later provider result. Use the [Home Care Service Interruption, Backup and Continuity Log](/tools/home-care-service-interruption-backup-continuity-log/) when a visit was cancelled, missed or replaced and immediate continuity matters. Link those records with safe event IDs instead of duplicating care details here.

A household calendar can help someone remember what to inspect, but it should not be represented as a provider's official visit record, an electronic visit-verification result or a payer's claim decision. Likewise, a timesheet does not by itself prove coverage, and a claim marked paid does not prove that the provider posted the household payment correctly.

For cancellation and no-show questions, identify whose action the responsible source attributes and which contract or program rule controls the charge. Do not infer responsibility from an empty calendar slot. A worker absence, a person's refusal, a provider cancellation, a hospitalization, weather disruption and an agency scheduling error may have different service and payment consequences. FamilyBoard deliberately avoids deciding among them.

## Medicare covers qualifying home health services under specific conditions

The current [Medicare home health coverage page](https://www.medicare.gov/coverage/home-health-services) says a beneficiary pays $0 for covered home health services under Original Medicare and generally pays 20% of the Medicare-approved amount for covered durable medical equipment after the Part B deductible. It also says the home health agency should explain what Medicare will pay, what Medicare will not pay, and how much the beneficiary may owe before services begin.

That statement is not a universal rule for every service delivered in a home. Medicare home health has eligibility, certification, plan-of-care, provider and covered-service requirements. Custodial or personal care by itself, private-duty arrangements, independent caregivers, Medicaid HCBS and private-pay home-care contracts can operate under different rules. First confirm that the service actually falls within the current Medicare home health benefit before using the $0 covered-service statement.

For a Medicare-certified home health agency, the patient-rights Conditions of Participation in 42 CFR § 484.50 include financial information about the extent to which payment may be expected from Medicare, Medicaid or other federally funded programs, charges the individual may have to pay, and changes in payment information. The responsible agency documentation controls; FamilyBoard does not certify compliance.

If the provider believes Original Medicare may not pay for an item or service, the [CMS Advance Beneficiary Notice of Noncoverage page](https://www.cms.gov/medicare/forms-notices/beneficiary-notices-initiative/ffs-abn) explains the purpose of Form CMS-R-131. An ABN is not the same as a bill, a Medicare Summary Notice, an Explanation of Benefits or a final appeal result. It is a specific notice used in the Original Medicare fee-for-service setting under defined circumstances. Do not treat a generic cost estimate or a managed-care denial letter as an ABN.

CMS also maintains a separate [Home Health Change of Care Notice](https://www.cms.gov/medicare/forms-notices/beneficiary-notices-initiative/ffs-hhccn) for certain reductions or terminations of previously provided home health services due to an agency or physician or allowed-practitioner decision. An HHCCN concerns a change in care; it is not interchangeable with an ABN, an itemized statement or a benefit appeal decision. Preserve the exact notice type and current instructions in the protected source.

## A bill, MSN, EOB, ABN and HHCCN answer different questions

A provider bill or statement asks for or reports account activity from the provider. An itemized bill explains charges at a more granular level. A Medicare Summary Notice reports Original Medicare claims and decisions; it is not a bill. An Explanation of Benefits commonly reports how an insurer or plan processed a claim; it also is not necessarily a bill. An ABN addresses possible noncoverage before or in connection with furnishing an item or service under its applicable rules. An HHCCN addresses a qualifying home health change of care.

Store each as a separate source and version. If the itemized statement shows one amount, the MSN or EOB shows a different allowed or denied result, and the household receipt shows a third amount paid, do not force them into one `final` number. Record the four safe markers, preserve the responsible documents outside FamilyBoard and keep the actual account result open until the provider and payer sources have been reconciled.

A corrected claim is not automatically a corrected provider statement. A payer reprocessing result is not automatically a household refund. A provider credit is not a refund until the responsible account or payment source shows what occurred. Status eight exists specifically to preserve that final gap.

## Medicaid HCBS rules vary by state, program and delivery system

Medicaid home- and community-based services can be delivered through managed care, fee-for-service programs, waivers and other state-specific arrangements. Covered services, authorization units, cost sharing, notices, electronic visit verification, claim processing, grievance routes, appeal rights and continuation rules can differ. Use the current state Medicaid agency, managed-care plan, waiver or program notice and provider agreement.

Do not copy a Medicare rule into a Medicaid row. Do not assume that an electronic visit-verification event proves that a specific service was billable, or that a provider charge means the program authorized it. Conversely, a household may have a service-quality complaint even when a claim was paid. Keep benefit appeal, provider billing question and service complaint as separate routes when they have different decision-makers.

If an adverse benefit determination is involved, read the current notice immediately. The [Medicare complaint guide](https://www.medicare.gov/providers-services/claims-appeals-complaints/complaints) similarly distinguishes complaints about care or provider service from appeals about coverage or payment. A customer-service ticket or provider correction request does not preserve an appeal deadline automatically.

## Private-pay home care starts with the current written agreement

For private-pay personal care, companion care, homemaker service, respite or other home-care arrangements, the written contract, rate sheet, service plan, cancellation terms, minimum-hour rule, holiday rate, travel charge, deposit, refund provision and local consumer or licensing rules may control. Confirm the version that applied to the service period and whether the household received notice of a fee change.

Compare an itemized statement with the contract version and actual-service source. A difference can arise from hours, rate, visit type, shift differential, cancellation category, minimum charge, credit, prior balance or payment posting. Identifying a category is not a legal conclusion. Ask the responsible provider for an itemized explanation and preserve its attributable response.

Do not enter a credit-card number, bank account, check image, full receipt number or payment portal credential into this tool. `PAYMENT-P2 observed` is enough for the household index. Use a protected financial record for the complete receipt and payment evidence.

## Expected, billed, paid and adjusted must remain separate

Suppose the current contract and benefit source lead the household to expect USD 80, while the provider statement shows USD 120. The tool can display a USD 40 arithmetic difference. It cannot tell whether the expected source is current, whether the statement includes another service, whether a payer has not processed a claim, whether the contract permits the charge, or whether USD 40 is owed or refundable.

If the household already paid USD 120, record `PAID=120` only after observing the responsible payment source. If the provider later posts a USD 40 credit, record `ADJUSTED=40` in a new or updated reviewed version only after observing the credit. If a check or electronic refund is issued, preserve the actual receipt or deposit result separately. `Refund promised` is not the same as `refund received`.

Negative arithmetic can also require review. If billed is lower than expected, the household should not assume a windfall or volunteer a payment without understanding the source. The provider might issue another statement, a payer might reprocess the claim, or the expected amount might have been wrong. Use neutral labels and a next checkpoint.

## The person or household review is a separate evidence layer

The person receiving service may have information about whether a visit occurred, but the household coordinator should not pressure that person to reconstruct private care details inside a general billing log. Preserve a safe participation pointer and use an accessible, authorized process. A family member's assumption is not automatically the person's statement or legal authority.

Payment responsibility also needs a source. It might come from a current Medicare or Medicaid notice, plan document, provider contract, fee schedule, cost-sharing notice or qualified benefits counselor. Do not derive it solely from a prior month's bill. Record `expected responsibility source obtained` and keep the actual source protected.

When the person disputes a service or charge, keep the question neutral: `statement includes service category not matched to actual-service source` is safer than accusing a named worker of fraud. Send the necessary facts through the responsible provider, payer, program-integrity, complaint or appeal process. FamilyBoard is not the investigative record.

## Close the row only after the actual account result is observed

A provider can acknowledge a question without correcting the statement. A corrected statement can arrive while a payer result remains pending. A payer can approve reprocessing while the provider account still shows the old balance. A provider can post a credit that has not been refunded. Each is useful progress, but none should be rewritten as the final account result.

For a completed version, record an attributable result such as `provider corrected statement observed; payer result B7 received; payment posting reviewed; credit observed; actual account result reviewed; protected custody C2; reopen if another statement carries the prior balance`. Preserve any unresolved collection or appeal route separately.

If a statement appears resolved and a later bill restores the disputed amount, create a new version linked to the earlier result. Do not overwrite the prior source. Version history is often what makes a long billing conversation understandable.

Use the [Home Care Service Plan Change and Notice Log](/tools/home-care-service-plan-change-notice-log/) when a plan, authorization, recurring schedule, fee or notice changes. Use the [Home Care Complaint, Response and Resolution Log](/tools/home-care-complaint-response-resolution-log/) when dissatisfaction, grievance intake, investigation, corrective action and later service improvement need their own chain. A billing appeal and a service complaint may coexist, but neither should silently close the other.

## Privacy protects both the person and the integrity of the review

The workbench rejects patterns resembling names, email addresses, full phone numbers, addresses, provider or worker names, health or care details, exact times or locations, long account, member, claim, case, invoice or receipt identifiers, card or bank data, allegation or evidence text, signatures, credentials and private correspondence. Amount markers and ISO review dates are allowed only in their designated forms.

Keep full plans, authorizations, contracts, fee schedules, bills, MSNs, EOBs, ABNs, HHCCNs, receipts, bank evidence, complaint text and appeal submissions in the responsible protected system. In FamilyBoard, use source IDs such as `PLAN-C3`, `STATEMENT-B5`, `BENEFIT-R2`, `PAYMENT-P4` and `RESULT-A6`.

No automatic validator can prove that a source belongs to the correct person, that a service occurred, that a code is accurate or that a payer decision is lawful. The generated output is a review checklist. Compare it with current original sources and store it only where intended household roles can access it.

## Future affiliate items must not influence a payment or rights decision

A future affiliate area may show clearly labeled general document folders, scanners, labels or offline storage after the complete review workflow. It must not sit between a person and safety instructions, benefit notices, appeal steps, complaint routes, payment decisions or refund follow-up. It must not use care, billing or dispute details for targeting.

No product can prove coverage, validate a charge, preserve an appeal automatically, win a dispute, produce a refund or prevent collection. Commercial links must stay optional, separated from the tool result, and subordinate to the official provider, payer, contract and rights sources.
