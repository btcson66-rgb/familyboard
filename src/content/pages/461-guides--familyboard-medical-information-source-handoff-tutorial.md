---
title: "FamilyBoard Medical Information Source Handoff Tutorial | Keep Health Records Findable"
description: "Learn how to use FamilyBoard's Household Medical Information Source and Handoff Log to track source owners, versions, access observations and next actions without copying diagnoses or treatment details."
route: "/guides/familyboard-medical-information-source-handoff-tutorial/"
primaryIntent: "learn to map medical-record, medication-list, referral and care-handoff sources without storing clinical content or making health decisions"
primaryKeyword: "FamilyBoard medical information source handoff tutorial"
cluster: "records-emergency"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-29"
lastReviewedAt: "2026-08-29"
nextStep: "Map one protected source, version and responsible role, then leave clinical questions to the provider or qualified professional."
related: []
faq:
  - question: "Does this log store or interpret diagnoses, test results or medication instructions?"
    answer: "No. It stores safe source pointers and observations; clinical content and decisions stay with the responsible health source."
  - question: "Does a source map authorise a family member to access a patient portal?"
    answer: "No. Permission, identity verification and consent are controlled by the provider, patient and applicable process."
  - question: "Can the tool request a correction or transfer of records?"
    answer: "No. It can record that a request or action was made; the provider's actual response remains a separate result."
  - question: "Is a successful lookup medical advice?"
    answer: "No. Finding a current source does not diagnose, interpret or recommend treatment."
contentVersion: 1
---
# How to Use FamilyBoard's Household Medical Information Source and Handoff Log

Families often say “the records are online” without knowing which portal, clinic, pharmacy or care role owns the current version. The free [Household Medical Information Source and Handoff Log](/tools/household-medical-information-source-handoff-log/) creates a dated map of sources, access observations and handoff actions without copying diagnoses, test values or treatment instructions. It does not sign in to a portal, interpret a result, reconcile medicines, authorise a caregiver or replace urgent medical help.

## Begin with purpose, not a diagnosis

Use a neutral code such as `MEDICAL-SOURCES-2026-A` and choose one bounded context: a provider-record lookup, a correction or transfer, a current medication-list source, a discharge transition, or a referral and coverage source. Write the household role and purpose, not a person's name, birth date, record number or condition. A purpose says what must be found; it does not state what a clinician should decide.

## Build a source map with safe pointers

The source-map field can reference a provider records office, patient portal, pharmacy, official plan or protected person-match evidence with codes such as `PORTAL-V2` or `PROVIDER-RECORDS-S1`. Keep portal credentials, consent documents, addresses, diagnoses, doses and test results in the responsible protected system. A public URL can identify an official process, but it should not include a private session link or a person's identifier.

## Use the twelve-field row to preserve layers

Each row contains an ID, safe person alias and purpose, responsible source and scope, protected person-match evidence plus checked date, current version observation, access/custody observation, clinical or official status source, household handoff or action, conflict or qualified review route, owner role, target or outcome date and status. The long format is deliberate: it prevents “portal opened” from being mistaken for “the right person's current record was confirmed.”

## Treat access as an observation, not permission

Record what an authorised role actually saw: a current document title, a dated list version or a provider's response route. Do not infer that a family relationship grants portal access. The patient, provider and applicable consent process control identity and permission. If a recipient cannot open the protected source, leave the row waiting for access rather than copying the clinical content into the shared field.

## Keep medical, pharmacy and coverage sources separate

A prescription list, a clinic note, a test report and an insurer status page answer different questions. Link them by safe IDs and dates, but do not merge them into a generated “health summary.” If two sources conflict, choose the conflict status and name the provider, pharmacist, health plan or qualified review route that must resolve it. FamilyBoard cannot decide which source is clinically correct.

## Record actions and results separately

If someone submits a records request, asks for a correction, schedules a transfer or briefs a caregiver, record that action and its date. Do not mark the result complete until the responsible source actually responds. For urgent symptoms, medication reactions, injury or danger, contact local emergency services or qualified health professionals first; this log is not an emergency channel.

## Privacy, backup and local-first limits

The tool runs in the browser and creates an index rather than a medical repository. Export before clearing browser data, protect the original records and limit each handoff to the minimum necessary scope. Do not place private health content in analytics events or future affiliate placements. Any product link must remain outside the medical workflow, be clearly disclosed and never imply clinical safety or suitability.

## Eight-question closeout

Is the purpose neutral and bounded? Are the responsible sources named without private identifiers? Is the protected person match recorded separately? Is the current version dated? Is access observation distinct from permission? Are pharmacy, clinical and coverage sources separate? Are actions still open until the responsible result arrives? Did the household avoid copying or interpreting clinical content? If not, leave the handoff open.
