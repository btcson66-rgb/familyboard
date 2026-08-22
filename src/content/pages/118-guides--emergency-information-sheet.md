---
title: "Emergency Information Sheet: Build, Verify and Share One Useful Page"
description: "Build a one-page emergency information sheet with verified contacts, audience-specific details, offline copies, privacy boundaries and review evidence."
route: "/guides/emergency-information-sheet/"
primaryIntent: "build and verify a one-page household emergency information sheet"
primaryKeyword: "emergency information sheet"
cluster: "records-emergency"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-23"
nextStep: "Verify one real contact and one official service source, generate the audit record, then replace every obsolete copy carrying those IDs."
related:
  - "/tools/emergency-contact-verification-log/"
  - "/tools/emergency-contact-sheet-generator/"
  - "/guides/emergency-binder/"
  - "/features/household-handoff/"
faq:
  - question: "What is the difference between an emergency information sheet and a full emergency binder?"
    answer: "The sheet is an audience-specific routing page with a few current contacts, coordination roles and protected-record pointers. The binder owns the deeper plans, source documents and sensitive details. The sheet should help an authorized reader reach the right source, not duplicate the whole binder."
  - question: "How can I tell whether a contact was really verified?"
    answer: "Record whether a person directly confirmed the role and sharing scope or whether an official-service contact was checked against the responsible organization's current source. Keep the date and evidence in a verification log; a plausible format or old printed copy is not verification."
  - question: "Should the verification log contain the actual phone number or email address?"
    answer: "No. Keep the actual detail in the protected source and use a safe hint plus stable ID in the log. That prevents the audit from becoming a second sensitive directory that can drift out of sync."
  - question: "Can one sheet be shared with family, caregivers and visitors?"
    answer: "Usually not safely. Create controlled versions for distinct audiences. A caregiver may need care and coordination contacts; a general household copy may need utility and building roles; a protected person-specific record may contain details that belong on neither shared sheet."
  - question: "Does a completed sheet guarantee that a person, phone network or service will be available?"
    answer: "No. It records a dated plan and verification evidence. It cannot contact anyone, test future network conditions, certify readiness or replace current local emergency services and official instructions."
contentVersion: 2
---
# Emergency information sheet: one page, one audience, verified sources

An emergency information sheet is a routing page, not a compressed household database. Its job is to help one intended reader identify the household, find the right current contact or plan, and reach protected details without searching through messages, bills and folders. The useful question is not “How much can fit on one page?” It is “What can this reader safely use under stress, and how do we know it is still current?”

That changes the workflow. Choose the audience and storage location first. Verify every contact against a person or responsible official source. Put only the minimum usable detail on the sheet. Point toward protected records for anything sensitive. Add a visible review date, replace superseded copies and test whether another intended user can actually find the current version.

## Start with the communication plan, not the layout

[Ready.gov's Family Emergency Communication Plan](https://www.ready.gov/sites/default/files/2020-03/family-emergency-communication-planning-document.pdf) asks households to write down contact and service information, give plan copies to household members, keep a central home copy, place information on phones and practice contacting the agreed out-of-town person. Taiwan's National Fire Agency similarly explains that communications may be disrupted and families should agree on contact methods, meeting locations and emergency contacts before an earthquake in its English [family evacuation planning guidance](https://www.nfa.gov.tw/eng/index.php?article_id=8960&code=list&flag=detail&ids=1371).

Those sources describe a plan, not merely a phone directory. A household needs to decide who checks in with whom, which alternative method to try, where people reunite, what an out-of-area contact is expected to do and where the authoritative local information lives. The one-page sheet is the portable, audience-specific view of those decisions. It cannot rescue a plan that the household never discussed.

Official emergency channels are location-specific and time-sensitive. Record the responsible authority and date checked. Never copy a number from a foreign template because it looks familiar. A household that travels or has members in different jurisdictions may need separate cards; one country's emergency number should not silently appear as a universal default.

## Define one reader before choosing the fields

A card carried by a child, a refrigerator sheet, a caregiver handoff and a locked medical envelope do not need the same content. Name the audience in the sheet header. If a document has several audiences, create several controlled versions rather than one overexposed master copy.

A shared household page might include:

- a short household or location label that its users understand;
- the current local emergency-services reference and the date it was checked;
- one primary household coordination role and one backup role;
- one agreed nearby meeting reference and one protected pointer to the wider plan;
- a trusted nearby or out-of-area contact, if that person has agreed;
- building management, utility outage, school, care or veterinary roles that the audience genuinely needs;
- a visible “verified on” date and the next review trigger.

It usually should not contain full government identifiers, insurance or utility account numbers, passwords, alarm or access codes, complete medical histories, detailed medication instructions, financial information or a vulnerable person's precise routine. Put those details in an appropriately protected, maintained source. The sheet can say `protected care plan: blue household folder` without copying the plan.

## Separate contact details from verification evidence

A phone number can be perfectly formatted and still belong to the wrong person. An official service number copied years ago can still look plausible. A contact sheet therefore needs two records: the protected source containing the actual contact detail, and a verification log explaining how its role and channel were confirmed.

For a person, confirmation should cover more than “Is this still your number?” Ask whether the person still accepts the intended role, which contact method they prefer, who may receive that detail and what they should do if reached. Consent to appear on a private family card is not consent to appear on a public notice or every caregiver handoff.

For a government, utility, building or service contact, verify against the responsible organization's current official website, current statement, contract channel or formal management notice. A search-result snippet, an old social post and a crowd-sourced directory are discovery leads, not the final evidence. Record the source name and check date so the next reviewer can repeat the check.

The free [Emergency Contact Verification Log](/tools/emergency-contact-verification-log/) records a stable contact ID, role, protected-source pointer, safe channel hint, verification evidence, verification date, sharing scope and status. It deliberately rejects full phone numbers and email addresses. The log proves what was reviewed without becoming another sensitive directory that must be reconciled later.

## Use stable IDs so updates reach every copy

Give important source records short identifiers such as `LOCAL-1`, `UTILITY-1` or `CARE-1`. Print the same ID beside the entry on each controlled sheet. When a number or role changes, the household can search copies for that ID rather than guessing where the old detail may remain.

An ID is not an account number or serial number. It is a household label. Keep it short and non-sensitive. A change log might say `UTILITY-1 verified from provider website; refrigerator and caregiver copies replaced` without exposing the actual number in a task list or calendar notification.

This also makes retirement visible. If a trusted neighbor moves away, mark `LOCAL-1` retired in the verification log, remove it from the protected source, replace every shared copy and only then close the action. Simply adding a new contact while the old copy remains on the refrigerator leaves two apparently valid answers.

## Build a shared layer and a protected layer

The shared layer is fast to reach and intentionally sparse. The protected layer owns full contact details, sensitive care information, documents and evidence. The sheet points from the first to the second only where its audience is authorized to follow.

FamilyBoard's app can store emergency contacts in the current browser and mark contacts as sensitive for household handoff filtering. That flag is a sharing rule, not encryption and not a guarantee against someone who can open the browser profile. A full JSON or CSV export may still contain those records. Review the generated handoff before sharing, and use device and file protection appropriate to the data.

The separate [Emergency Contact Sheet Generator](/tools/emergency-contact-sheet-generator/) formats actual household-entered contact rows into a printable sheet. Use it only after the source records have been checked. The verification-log tool has a different job: it records the review without collecting the numbers. Neither tool contacts the person, tests the network or decides which emergency service applies.

## A worked two-version household example

Suppose a household has two adults, a child, a dog and a regular caregiver. Its kitchen copy may show the location label, current official emergency-service reference, primary and backup family coordination roles, trusted nearby role, building management, electricity outage contact, veterinarian and the protected binder location. It avoids birth dates, account numbers, medical details and access codes.

The caregiver version can be even narrower: household coordination roles, child-care and veterinary contacts the caregiver is permitted to use, the meeting reference, and where to find the protected instructions. A private envelope may contain person-specific health or authorization material prepared with the appropriate source. The household does not photocopy that envelope onto the kitchen page merely because it is “emergency information.”

In the verification log, `LOCAL-1` is confirmed directly with the person and records the permitted audience. `UTILITY-1` is confirmed from the provider's current official source. `CARE-1` remains `Awaiting confirmation`, so it cannot appear on the new caregiver sheet. A named household coordinator receives a due date to close the gap before the next review.

## Review triggers are more reliable than a universal interval

There is no single review interval that makes every contact trustworthy. Choose a household cadence, but also update after events that change the source: moving, a new school or care provider, household membership changes, a person withdrawing consent, a building manager change, a utility account transition, a revised local emergency page, a new phone, a lost copy or a failed drill.

The review date must mean someone checked the source—not that the document was opened and saved. For each row, preserve who or what confirmed it and when. A future review date is a planning field; it is not proof the future check already happened.

After updating, replace or destroy obsolete paper copies, refresh offline files and update the protected app or binder source. Ask someone other than the editor to locate one contact and explain the backup method. If the person cannot find the right version, the information architecture failed even if every number is correct.

## Plan for phone, power and internet failure

A cloud bookmark is not an offline copy. A note stored on one locked phone may be unreachable to everyone else. A printed card can survive a power failure but may expose information if left in a public place. Use more than one appropriate format: a limited paper copy, a protected home record and the intended household members' devices where suitable.

Practice communication without creating a false alarm. Household members can locate the card, identify the primary and alternative method, and send a clearly announced test message to a consenting contact. Do not call emergency services as a drill. Record the observed result in a [household emergency exercise record](/tools/home-emergency-drill-record-generator/) and assign any gap.

## Accessibility and language are part of usability

Readable type, plain role labels, adequate contrast and a predictable field order matter under stress. A multilingual household may need separate language versions with the same stable IDs and review date, not tiny side-by-side text. A person who uses assistive technology may need an accessible digital copy as well as paper. A child may need role labels and an agreed action rather than a dense page written for adults.

Do not infer a person's support or communication needs. Confirm with the person and, where appropriate, their caregiver or qualified plan owner. The shared page can point to the protected support plan; it should not expose a diagnosis to everyone who can see the sheet.

## Keep commercial suggestions outside the emergency record

An emergency sheet does not need a product carousel between the official number and the family contact. If FamilyBoard later shows clearly disclosed affiliate suggestions on public educational pages, they must remain outside the form and generated result, never cover the tool and never determine which contact or device is “required.” The household plan and responsible authority define the need; a commercial relationship cannot validate it.
