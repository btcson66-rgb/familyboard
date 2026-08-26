---
title: "Home Care Visit Scope and Service Result Log"
description: "Build a private home-care visit log for current service sources, arrival and departure evidence, scope exceptions and agency results without storing care details."
route: "/tools/home-care-visit-scope-service-result-log/"
primaryIntent: "document the official source, protected person match, current service scope, visit evidence, household observation, exception and responsible result for an in-home care visit without copying care or worker details"
primaryKeyword: "home care visit log"
cluster: "tools"
pageType: "tool"
indexable: true
depthVerified: true
publishedAt: "2026-08-26"
lastReviewedAt: "2026-08-26"
nextStep: "Generate one reviewed visit row and one open exception row. Compare the first with the current protected agency sources, then keep the second open until an attributable response is actually observed."
related:
  - "/guides/caregiver-handoff-checklist/"
  - "/tools/caregiver-handoff-source-authorization-log/"
  - "/guides/household-medical-information-organization/"
  - "/guides/household-admin-backup-person/"
  - "/privacy/"
faq:
  - question: "Is this an EVV or official home-care service log?"
    answer: "No. It does not capture or submit the official person, worker, service, exact date-time or location data. It is a private household index of safe source pointers and observed results."
  - question: "Can I enter a worker's name, employee number or exact clock-in time?"
    answer: "No. Keep worker identity and exact visit events in the responsible agency or program system. Record only a safe evidence pointer and whether it was observed."
  - question: "Does an arrival event prove that the authorized service was completed?"
    answer: "No. Scheduled service, assignment, arrival, departure, scope observation and responsible result are separate layers. An arrival record alone cannot close the visit review."
  - question: "What belongs in an exception row?"
    answer: "A safe exception category and evidence code, the responsible agency or program route, the household action, owner, target date and the response actually observed. Do not paste care, incident, worker or complaint details."
  - question: "Can FamilyBoard determine whether a visit was safe or billable?"
    answer: "No. The responsible care plan, agency, qualified professional, payer, program and official process control those determinations."
  - question: "Does reporting an exception close the row?"
    answer: "No. Reporting is an action. Keep the row open until the responsible result is observed, record custody is known and the next-visit or reopen condition is stated."
  - question: "When should I create a new version?"
    answer: "Create one when the agency, plan, contract, authorization, service window, worker role, visit-evidence system, scope, billing source, complaint route or next visit changes."
contentVersion: 1
---
# Home care visit scope and service result log

An in-home care visit can appear simple on a calendar while several different records control what actually happens. The household may have a schedule, the agency may have a service plan, the payer or public program may have an authorization, the worker may use an official arrival-and-departure process, and the family may observe that a visit was changed, shortened or missed. These records are related, but none automatically proves the others.

This free browser tool creates a dated household index for a safe care-person alias, responsible agency or program source, protected person match, current service-plan or contract version, service-window code, worker role, official arrival-and-departure evidence pointer, household scope observation, exception action, agency or program response, owner and result date. It deliberately does not collect the official EVV minimum data set, a worker's identity, exact time or location, the care delivered, a billing amount or a complaint narrative.

This household index is not an official EVV, service record, timesheet, payroll system, care plan, clinical chart, claim, incident report or complaint filing. It does not verify a worker or agency; authorize entry to a home; monitor a worker; read or submit agency, Medicaid or Medicare data; decide whether care was clinically correct; contact an agency; dispute a charge; file a complaint; or calculate a service, coverage, appeal or legal deadline. Use the current contract, care plan, responsible agency, program, qualified professional, official complaint process and local emergency service for real actions and outcomes.

**Ready to replace `the caregiver came today` with a source-controlled visit and result index? [Jump to the Home Care Visit Scope and Service Result Log](#tool-heading).**

## Create one review for one service relationship and period

Use a private code such as `HOME-CARE-VISIT-2026-A`. Define what caused the review: a first visit, routine service, a changed window or worker role, a missed or shortened visit, a new plan or authorization, a scope difference, a safety or incident escalation, or billing and complaint follow-up. The code is a household reference, not an official case, beneficiary, employee or claim number.

The baseline date marks the source version in use when this household review began. The current review date records when the source pointers were checked. The next checkpoint limits unresolved household follow-up. It is not the official visit time, a filing date, a notice deadline or a promise that an agency will respond by then.

Build a source map with safe codes for the current agency, service plan, contract, payer or program, official visit-evidence system and complaint route. Keep the actual names, identifiers, addresses, phone numbers, exact schedules, credentials and service details in the responsible protected systems.

## Each row has twelve evidence layers

Enter one visit relationship or exception per line:

`ID | safe care-person alias, visit purpose and context | responsible agency, program, contract source and scope | protected person-match evidence plus source checked date YYYY-MM-DD | current service-plan, contract or authorization version | service-window code, worker role and care-person participation source | official arrival/departure evidence pointer and household observation | authorized service-scope result, exception or incident pointer | communication, action, agency response, conflict or complaint route | owner role | target or outcome date YYYY-MM-DD | one of the twelve exact statuses`

The protected source-check date must fall from the baseline through the current review. The first nine statuses remain open and need a target from the current review through the next checkpoint. The last three close only this household review and need an outcome date from the baseline through the current review. One version accepts no more than 14 unique rows.

Safe observations include `current agency and protected person matched; evidence VISIT-A2`, `current service-plan scope opened`, `service-window code WINDOW-A and assigned role reviewed`, `official visit pointer EVV-A2 observed without copying time or location`, `authorized-scope exception recorded in protected source` and `agency response pending`. Do not paste the actual EVV event, worker name, GPS, care note, plan content, incident narrative, invoice or message.

## Twelve statuses separate visit source, evidence, exception and result

1. **Home-care visit purpose recorded—service context pending:** the household knows why it opened a row, but the current service situation remains undefined.
2. **Service context recorded—responsible agency or program source pending:** the visit situation is defined while the organization or program that controls the source remains unresolved.
3. **Responsible service source recorded—protected person match pending:** an agency, contract or program source is known, but it has not been matched to the intended person in the protected process.
4. **Protected person match recorded—current service-plan, contract or authorization version pending:** the safe match pointer exists while the controlling version remains open.
5. **Current service scope version recorded—service window, worker role and participation pending:** the current source version was observed, but the scheduled window code, assigned role or care-person participation source has not been reconciled.
6. **Service window, worker role and participation recorded—official arrival and departure evidence pending:** the planned visit is known while the attributable official visit evidence remains open.
7. **Arrival and departure evidence recorded—service scope and exception observation pending:** an official pointer was observed, but the household has not separated authorized scope, observation and any exception.
8. **Service scope and exception observation recorded—responsible agency or program result pending:** an exception was safely recorded and reported, but the responsible result remains open.
9. **Identity, timing, scope, safety or billing conflict—agency, program or qualified review pending:** one or more sources disagree and the named responsible route must decide.
10. **Source, protected person match, version, visit evidence and service result reviewed:** the dated row links all required layers, agency result, complaint or qualified route and reopen rule without an unresolved gap.
11. **Responsible service result received—record custody and next-visit condition recorded:** an attributable result was observed and the household knows where the protected record remains and what event reopens the row.
12. **Not applicable—reason and reopen event recorded:** the relationship does not currently apply and the service, contract, plan, visit or household change that reopens it is stated.

Changing the agency, program, care person, plan, contract, authorization, service window, worker role, participation source, visit-evidence system, service scope, billing source, complaint route or next visit creates a new version. Do not edit history to make a changed visit appear continuous.

## A calendar entry, clock-in and completed visit are different claims

A scheduled window is a plan. An agency assignment connects a role to that plan. An official clock-in or arrival record is an event in the responsible system. A household observation describes only what the household safely observed. A completed-service claim is a conclusion controlled by the applicable plan, agency, program and evidence. Keep all five separate.

`Scheduled`, `worker assigned`, `arrival recorded`, `family saw someone enter` and `authorized service delivered` are not synonyms. A visit can have an arrival record and still have an unresolved departure, scope or agency-result question. It can also have no household observer while the responsible system holds valid evidence. The tool does not choose between those sources. It preserves the disagreement and routes it.

Do not record exact arrival or departure times in the household index. Store a safe pointer such as `official visit event EVV-A2 observed` and let the responsible agency or program retain the actual event, identity and location.

## Official EVV contains data this tool intentionally avoids

The [Medicaid Electronic Visit Verification overview](https://www.medicaid.gov/medicaid/home-community-based-services/home-community-based-services-guidance-additional-resources/electronic-visit-verification) explains that states implement EVV for covered Medicaid personal-care and home-health services requiring an in-home visit. The federal [EVV frequently asked questions](https://www.medicaid.gov/federal-policy-guidance/downloads/faq051618.pdf) describe data associated with service type, the person receiving service, date, location, the person providing service and service start and end. State systems and operating details vary.

Those fields are precisely why FamilyBoard does not recreate EVV. It stores neither the actual person identifiers nor worker identifier, exact date-time event, address or location. It cannot submit, correct or certify an EVV record and should never be used to ask a worker to clock in, prove where a worker traveled or monitor movement.

If official EVV is missing or different from a household observation, use status nine. Record a safe conflict code and the agency, state program or qualified route responsible for review. Do not reconstruct an official event from memory inside FamilyBoard.

## Service plan, contract, authorization and visit evidence are separate

A care or service plan describes an authorized plan of care or support within its responsible system. A contract describes the relationship and terms between the parties. A payer or program authorization controls a particular coverage or service scope. Visit evidence records an event. A bill or claim asks for payment. None automatically proves that every other layer is current or correct.

The [Medicare home-health coverage page](https://www.medicare.gov/coverage/home-health-services) explains requirements for covered home-health services and the role of an ordered plan and a Medicare-certified agency in that program. Those rules should not be generalized to every private-duty, Medicaid, state, community or household arrangement. Record which program and source actually applies rather than writing `home care rules` as if one universal system exists.

When a service plan changes, open its current protected version and record only a version pointer. When a contract or authorization changes, add a new version. Never copy diagnoses, functional limits, medicines, care tasks, clinical notes or plan details into this household log.

Use the [Home Care Service Plan Change and Notice Log](/tools/home-care-service-plan-change-notice-log/) for the separate change chain: responsible issuer, before-and-after versions, effective service batch, formal notice, person participation or household response, transition and first changed-service result. Keep this visit log focused on what happened during a particular service event.

## Record an exception without writing a care narrative

An exception may be a missed visit, a materially changed window, early departure, unavailable official event, scope difference, unexpected substitution, safety concern or billing mismatch. The public-safe row needs only the category, safe evidence pointer, responsible action, owner and target date.

For example: `official departure evidence unavailable; exception EX-A2 reported to agency; response pending`. That preserves what still needs a result without naming the worker, revealing the care person, repeating a conversation or deciding who was at fault.

Do not use FamilyBoard for a clinical incident narrative. Health symptoms, injuries, medication events, care actions, photographs, audio, video and witness statements belong in the responsible emergency, provider, agency or official reporting process. For an urgent health or safety issue, use the current source-issued emergency route and local emergency services first. Household recordkeeping comes later.

## A household report is not an agency finding

`Family observed a shorter visit` records an observation. `Exception sent to agency` records an action. `Agency acknowledged receipt` records a response. `Agency corrected its record`, `program issued a decision` or `complaint authority closed the matter` are responsible results. Preserve each event instead of overwriting the first note with the last.

The row remains open while a responsible result is pending. It closes only when the attributable result has been observed, protected record custody is known and the next-visit or reopen condition is recorded. Closing a FamilyBoard row still does not prove that the external result was correct or that care quality was satisfactory.

## Notice and complaint routes belong to the responsible program

The [Medicare home-health change notice page](https://www.cms.gov/medicare/forms-notices/beneficiary-notices-initiative/ffs-hhccn) describes a specific notice used for certain Original Medicare plan-of-care changes. A household note cannot replace that notice or extend a right. The [Medicare rights and protections page](https://www.medicare.gov/basics/your-medicare-rights/get-help-with-your-rights-protections) describes complaint routes including State Survey Agencies for certain home-health quality or safety concerns. Other programs, plans, contracts and states can use different routes.

Record the current route from the agency, contract, program, notice or responsible authority. Do not copy a filing narrative, calculate a deadline or promise an outcome. If a bill, service scope and quality concern overlap, they may still require separate agency, payer, program, professional or complaint processes.

## Privacy is part of visit evidence design

The browser rejects patterns that look like names, contact information, recipient or worker identifiers, diagnoses, symptoms, medicines, doses, feeding or mobility details, exact times, precise locations, GPS, care notes, service-note content, billing values, photographs, recordings, signatures, credentials or private messages. It also requires exactly twelve fields, unique IDs, valid date windows and evidence appropriate to reviewed, exception, conflict, completed and not-applicable states.

Validation is only a drafting guard. A safe code can still point to the wrong source, and a household observation can still be mistaken. Compare the generated index with the current responsible sources and keep the output in a protected location appropriate to the household.

## Affiliate products stay outside the worker and care relationship

A future affiliate area may show clearly labelled general-purpose document folders, labels, portable scanners or offline storage after the full workflow. It must not target a person's care details, appear to be an agency or professional recommendation, interrupt an exception or safety route, suggest monitoring a worker, or imply that buying a product is required to prove a visit.

Recommendations must remain separate from the service relationship. Do not ask a worker to buy, sell, promote or accept a linked product during a visit, and do not use a purchase as a condition for service, access, complaint handling or a completed row.
