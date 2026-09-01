---
title: "Caregiver Handoff Source and Authorization Log"
description: "Create a private caregiver-handoff index for current source, authority, minimum access, daily logistics and observed acceptance without exposing care details."
route: "/tools/caregiver-handoff-source-authorization-log/"
primaryIntent: "document caregiver-handoff sources, recipient authority, minimum access, daily logistics and observed acceptance without storing care details"
primaryKeyword: "caregiver handoff checklist"
cluster: "tools"
pageType: "tool"
indexable: true
depthVerified: true
publishedAt: "2026-08-26"
lastReviewedAt: "2026-08-26"
nextStep: "Generate the source-and-authorization index, then verify the current source, minimum recipient scope, actual protected access and caregiver acceptance before the care period starts."
related:
  - "/guides/caregiver-handoff-checklist/"
  - "/tools/home-care-visit-scope-service-result-log/"
  - "/guides/household-medical-information-organization/"
  - "/guides/emergency-information-sheet/"
  - "/guides/household-admin-backup-person/"
  - "/privacy/"
faq:
  - question: "What does the caregiver handoff log store?"
    answer: "It stores safe aliases and source, version, authority-scope, access, logistics, action, owner, date and status observations. It should not store names, diagnoses, medicines, instructions, locations, schedules, authority documents or credentials."
  - question: "Can the tool decide whether a family member or caregiver is authorized?"
    answer: "No. The responsible provider, agency, program and applicable process determine the scope. The tool records only a safe source pointer and the result that was actually observed."
  - question: "Can I paste a care plan or medication list into the rows?"
    answer: "No. Keep those contents in the current protected source. Record only that the version was matched and accessible to the recipient within the responsible scope."
  - question: "Why does a mapped handoff remain open while briefing or acceptance is pending?"
    answer: "A complete source map does not prove that the receiving caregiver was briefed, could open the protected source or accepted the defined period and scope. Status eight preserves that waiting state."
  - question: "Does a submitted respite or home-care request count as a result?"
    answer: "No. A submission is an action. Close a responsible-result row only after an attributable response is observed, custody is recorded and the next-care or reopen condition is stated."
  - question: "What should I do if two instructions conflict?"
    answer: "Keep the row open, record a safe conflict pointer and route it to the responsible provider, agency, case manager or qualified source. Do not choose, combine or reinterpret the instructions in this tool."
  - question: "Does FamilyBoard send or store the generated handoff?"
    answer: "The workbench runs in the browser and does not submit the form to FamilyBoard. You control any copy you save or share and must use an appropriate protected location."
contentVersion: 1
---
# Caregiver handoff source and authorization log

A caregiver handoff may connect a person receiving care, a family coordinator, a temporary substitute, a home-care worker, a discharge team, a case manager, a transport source and several protected instructions. Those participants do not automatically share the same authority or information. This free browser tool creates a dated index for a safe care-person alias, responsible source, protected person match, current routine or source-issued plan version, recipient authority and minimum scope, actual access and custody, daily logistics source, briefing or acceptance action, conflict route, owner and result date.

It does not verify a caregiver, provider, agency, case manager or representative; grant, revoke or interpret authority; authenticate a person; retrieve, create, upload or transfer a care plan or medical record; generate or interpret medication, feeding, swallowing, transfer, mobility, toileting, bathing, wound, device, behavioral, emergency or clinical instructions; diagnose, triage or assess capacity; submit a long-term-care, home-care, respite, transport, discharge or insurance request; determine eligibility or benefit levels; book service; make a payment; contact anyone; track a location; or calculate a program, provider, plan or legal deadline. Use the current responsible provider, agency, case manager, program, qualified professional and emergency service for real decisions and results.

**Ready to replace `the next caregiver knows the routine` with a dated source, authority, access and acceptance record? [Jump to the Caregiver Handoff Source and Authorization Log](#tool-heading).**

## Create one version for one care period

Use a safe review code such as `CAREGIVER-HANDOFF-2026-A` and a protected person alias such as `CARE-PERSON-A`. Choose the context that actually starts the review: first handoff, temporary substitute or respite, discharge or care transition, home-care agency or worker change, dependent-support handoff, appointment transport, routine or service change, or an authority, instruction or safety conflict.

The baseline is the version used at the start of this review. The current review date says when the responsible sources were checked. The next checkpoint bounds unresolved household follow-up. It is not an appointment, care-plan, discharge, service-start, benefit, appeal, authorization or legal deadline.

The source map may use safe codes for the current provider, discharge team, case manager, agency, program, protected plan, household routine and emergency route. Do not type names, birth dates, addresses, phone numbers, email addresses, diagnoses, symptoms, allergies, medicines, doses, feeding or swallowing details, transfer or mobility steps, toileting or bathing details, behavioral or mental-health information, detailed locations or schedules, access or security codes, provider names, case or insurance numbers, payment information, authority documents, signatures, credentials or private messages.

## Each row has twelve source, authority and acceptance fields

Enter one source-and-handoff relationship per line:

`ID | safe care-person alias, handoff purpose and care context | responsible provider, agency, case manager, program or household source and scope | protected person-match evidence plus source checked date YYYY-MM-DD | current routine, plan or instruction version observation | recipient authority, minimum information scope and participation observation | actual access, custody and return observation | daily logistics, care, service and escalation sources | briefing, caregiver acceptance, observed result, conflict and responsible review route | owner role | target or outcome date YYYY-MM-DD | one of the twelve listed statuses`

The protected source-check date must fall from the baseline through the current review. An open row needs a target date from the current review through the next checkpoint. A closed row needs an observed result date from the baseline through the current review. One dated version supports at most 14 rows.

Use safe observations such as `protected person matched to current agency source; evidence CARE-A-MATCH2; checked 2026-08-26`, `current plan version opened in protected source; contents not copied`, `recipient scope reviewed by responsible agency`, `temporary access tested; return process mapped` and `caregiver briefing recorded; acceptance result awaiting agency coordinator`. Do not paste the underlying identity, care, authority or location content.

## Twelve statuses preserve source, authority, access and acceptance

1. **Caregiver-handoff purpose recorded—care context pending:** the household knows why a handoff is needed but has not defined the current care period or setting.
2. **Care context recorded—responsible care source pending:** the period is defined while the provider, agency, case manager, program or household source remains open.
3. **Responsible care source recorded—protected person match pending:** a source is named, but the intended person and source have not been compared through the protected process.
4. **Protected person match recorded—current routine, plan or instruction version pending:** a safe match pointer exists while the current version remains unresolved.
5. **Current routine, plan or instruction version recorded—recipient authority and minimum scope pending:** a current version was observed while recipient permission and necessary scope remain open.
6. **Recipient authority and minimum scope recorded—actual access and custody pending:** the responsible process supplied a scope, but the intended recipient has not demonstrated access or custody.
7. **Access and custody tested—care, logistics, service and escalation sources pending:** the protected path worked while one or more operational or escalation sources remain unmapped.
8. **Care, logistics, service and escalation sources mapped—caregiver briefing or acceptance pending:** the source map exists, but briefing or acceptance remains an open action rather than a completed handoff.
9. **Identity, version, authority, instruction or safety conflict—provider, agency or qualified review pending:** sources disagree or an identity, authority, access, instruction or safety issue needs the named responsible route.
10. **Source, protected person match, version, authority, access and handoff reviewed:** the dated row links the responsible source, protected match, current version, recipient scope, actual access, care/logistics sources and handoff or reopen condition without an unresolved gap.
11. **Responsible handoff result received—custody and next-care condition recorded:** an attributable result was observed, current-version custody is known and the next-care or reopen event is recorded.
12. **Not applicable—reason and reopen event recorded:** the relationship does not currently apply and the row says which care, provider, agency, authority or household change reopens it.

The first nine statuses remain open. The final three close only this dated review. A new caregiver, authority, care setting, provider or agency, case manager, routine, plan or instruction version, access path, logistics source, transport arrangement, recipient preference, emergency route, caregiver-capacity change or conflict creates a new version rather than erasing history.

## A caregiver label does not create authority

The [HHS family-and-friends guidance](https://www.hhs.gov/hipaa/for-individuals/family-members-friends/index.html) explains circumstances in which a covered provider may share information directly relevant to a person's involvement in care or payment. The [HHS family-access guidance](https://www.hhs.gov/hipaa/for-professionals/faq/2069/under-hipaa-when-can-a-family-member/index.html) separately discusses personal representatives and written authorizations. The tool therefore never treats `spouse`, `parent`, `adult child`, `emergency contact`, `caregiver` or `home-care worker` as a universal permission.

Record who supplied the scope, what minimum category was needed and what result was observed. Keep the actual identity evidence, authorization, signature, court or legal material and protected information in the responsible system. If scope is unclear or sources conflict, use the ninth status and name the provider, agency, case manager or qualified route that must decide.

## Keep source-issued care instructions in their protected source

The [CDC's care-plan guidance](https://www.cdc.gov/caregiving/guidelines/index.html) shows that an actual care plan can contain sensitive conditions, treatments, medicines, providers, coverage and contacts. The tool records only a version and access observation. It must never become a second copy of that clinical or personal content.

Do not enter medicine names or doses; food, feeding or swallowing instructions; lifting, transfer or mobility steps; toileting or bathing details; wound or device instructions; behavioral or de-escalation steps; clinical thresholds; or emergency directions. Record `current qualified-source instruction opened` and the responsible escalation route. If the source is missing, stale, inaccessible or contradictory, the affected row remains open.

## Separate household routines from qualified care sources

A household source may control arrival, key handoff, laundry, meal-delivery logistics, transport coordination or a safe communication channel. A qualified provider, agency, therapist, case manager or program may control a care plan, service plan or professional instruction. A household preference cannot silently replace the qualified source, and a provider instruction does not prove that transportation or home access is ready.

Map each category to its actual source. The eighth status means those sources are mapped while the recipient's briefing or acceptance is still pending. It cannot claim that service started, care was performed or a caregiver accepted responsibility.

## Test actual access, custody and the return route

`Link sent`, `folder shared` and `printed copy prepared` are actions. Test the intended protected route with the intended role and record whether the current version opened. For a temporary arrangement, record the return or access-end process. The tool does not grant, revoke or delete access; the responsible account, provider, agency or document custodian must perform and confirm that work.

If a caregiver can open a file but the current source or intended person cannot be matched, the handoff is not reviewed. If the source is matched but the caregiver lacks the necessary protected access, the handoff is not reviewed. The status sequence keeps those gaps visible.

## A discharge checklist or application is not service acceptance

The [Medicare discharge-planning checklist](https://www.medicare.gov/publications/11376-your-discharge-planning-checklist.pdf) supports patient and caregiver participation in transition planning. Still, a discharge document, caregiver briefing, referral, receiving-provider response, agency acceptance and actual start of care are separate observations. Preserve each responsible source and result.

Likewise, `respite inquiry sent`, `home-care application submitted`, `case manager assigned` and `provider contacted` are not interchangeable with approved, scheduled, accepted or delivered service. The tool cannot determine eligibility, benefit level, service availability or safety. Use the current program or agency response.

## Briefing, acceptance and responsible result remain separate

A briefing records that defined sources and logistics were presented. Caregiver acceptance records the recipient's stated acceptance of the defined period and scope. A responsible result records what a provider, agency, program or handoff process actually confirmed. Do not close a row because a family member believes that the recipient understood it.

The receiving caregiver can demonstrate the protected source they would use, the route for a missing instruction and the boundary of their assigned logistics without repeating private content in the tool. Record the safe result and evidence pointer. If the demonstration exposes a gap, keep the row open with an owner and target date.

For agency-delivered visits, the handoff result and visit result remain separate. Use the [Home Care Visit Scope and Service Result Log](/tools/home-care-visit-scope-service-result-log/) to preserve the current service-plan or contract version, official arrival-and-departure evidence pointer, service-scope observation, exception action and agency response without copying worker or care details.

## Caregiver support and respite need their own responsible source

The [Administration for Community Living's caregiver-support overview](https://acl.gov/programs/support-caregivers/national-family-caregiver-support-program) describes information, access assistance, counseling, training, respite and limited supplemental services through participating programs. Local availability and eligibility vary. Map the responsible program and record only the inquiry, response or service result actually observed.

Do not use the log to pressure a caregiver into accepting work beyond their stated capacity. A capacity concern should open a planning, respite, agency or qualified-support route. For an emergency or urgent health concern, use the current source-issued emergency instructions and local emergency services.

## The privacy gate rejects care and identity details

The browser validates the twelve fields, exact status, unique ID, source-check date, open and closed date windows and the evidence required for reviewed, result, conflict and not-applicable rows. It also rejects patterns that look like contact details, names, identifiers, diagnoses, symptoms, allergies, medicines, doses, feeding or swallowing details, transfer or mobility content, toileting or bathing details, behavior or mental-health content, detailed locations or schedules, access codes, provider names, case or coverage identifiers, payment information, authority documents, credentials or private messages.

Validation is a local drafting guard, not proof that information is accurate, complete, lawful, current or accepted. Save the generated index in your own protected process and compare it with the current responsible sources before every real handoff.

## Product recommendations stay outside the care decision

A future affiliate area may display clearly labelled, non-personalized document sleeves, labels or general household organizers after the result. It must not interrupt an emergency or access step, imply medical suitability, imitate a provider or agency recommendation, target protected care details or make a purchase necessary to complete the handoff.
