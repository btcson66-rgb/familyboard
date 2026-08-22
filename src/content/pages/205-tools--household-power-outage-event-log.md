---
title: "Household Power Outage Event Log | Record Times, Evidence and Follow-Up"
description: "Document a household power outage with observed times, official-source evidence, system IDs, four statuses and owner-linked follow-up—without guessing the cause or safety outcome."
route: "/tools/household-power-outage-event-log/"
primaryIntent: "record a household power outage timeline, observed system conditions, sources and follow-up ownership"
primaryKeyword: "power outage event log"
cluster: "tools"
pageType: "tool"
indexable: true
depthVerified: true
publishedAt: "2026-08-23"
lastReviewedAt: "2026-08-23"
nextStep: "Create one event record from observations you can support, then close each unresolved ID only after a new check and preserved evidence."
related:
  - "/guides/power-outage-home-preparedness/"
  - "/guides/emergency-supply-inventory/"
  - "/guides/ups-battery-backup-records/"
  - "/tools/emergency-contact-verification-log/"
faq:
  - question: "Does this log calculate the official outage duration?"
    answer: "No. It preserves the household's first-observed and restoration-observed timestamps. Those may differ from the utility's event boundaries, and an approximate observation is not converted into an official duration."
  - question: "Can the tool tell me whether refrigerated food or medicine is safe?"
    answer: "No. It can preserve time, temperature and source pointers for later review, but it does not know the product, storage history, local conditions or current authority guidance. Use the responsible health authority, label, pharmacist, clinician or manufacturer for the actual decision."
  - question: "What should I enter as the cause of the outage?"
    answer: "There is no cause field. Record the responsible utility's current statement as source evidence if one exists. Do not turn a neighbor's theory, a tripped device or the size of the affected area into a cause claim."
  - question: "Why does every open observation need one follow-up row?"
    answer: "An open status without an owner and date is easy to forget. The exact ID connects the observed condition to one next evidence-based action, one responsible role and a deadline within the review window."
  - question: "Can this record prove a compensation, insurance or liability claim?"
    answer: "No. It may help preserve household observations and source references, but eligibility, causation, notice, proof and deadlines depend on the responsible provider, contract, policy and law. Keep original evidence and obtain authoritative guidance."
contentVersion: 1
---
# Household power outage event log

A power outage is easy to remember as one event and hard to reconstruct as evidence. One person noticed the lights at 9:15, another checked the utility page ten minutes later, the refrigerator stayed closed, internet service returned after the lights, and one appliance behaved differently the next morning. Without a dated record, those facts become a single vague memory: “the power was out for a while.”

This free browser tool creates a household operations record from what someone actually observed. It keeps the event stage, first-observed time, restoration-observed time, official-source reference, system conditions, actions already taken, support-plan pointers and owner-linked follow-up in one readable result. It does not monitor the grid, contact a utility, read smart-meter data or inspect household equipment.

The distinction matters. A household timestamp is not necessarily the utility's official outage start. Lights returning does not prove every circuit, appliance or provider service is stable. An observation about a refrigerator does not decide whether its contents are safe. The log protects these boundaries instead of converting incomplete evidence into a confident answer.

**Recording a real event? [Jump to the outage log](#tool-heading).**

## Use one record for one outage event and one household scope

Start with a private household label rather than a street address. `Maple household` or `Apartment A` is enough to identify an export among family records. The tool rejects common account and credential language because a printable event summary should not become another copy of a utility account, access code or medical file.

Choose the scope that best matches the evidence available now:

- an area or utility event shown by an official source;
- a building or shared service affected;
- one dwelling or part of it affected; or
- scope not yet established.

These options describe observations, not causes. If neighbors also appear dark and the utility map shows an incident, the household can record both sources. If a common hallway has power but one dwelling does not, record that difference without concluding that a breaker, wiring fault or unpaid account caused it. Diagnosis belongs to the responsible utility, building manager or qualified electrical professional.

Keep separate events separate. A brief interruption on Monday and a second event on Wednesday should not share a single start and restoration time. A building generator test and a utility outage also have different evidence and ownership even if both interrupt a device.

## First observed is not the same as official start

The form asks for a date and a 24-hour `HH:MM` time. Enter when someone first noticed the condition or the timestamp supported by the named source. If a household member woke at 07:00 and found clocks blinking, do not silently claim the outage began at 03:12 because that is the last time shown on one device. Write that the start is an estimate in the source/evidence text and preserve the device observation separately.

The tool checks that the timestamp is a real calendar date and time and is not in the future. It deliberately does not compute “official outage duration.” The household may have noticed the event after it began, and the utility may define interruption and restoration differently. If a formal duration matters, obtain it from the responsible provider and keep that record beside—not overwritten by—the household log.

For an ongoing outage, leave both restoration fields blank. When supply is actually observed again, change the stage and enter both the restoration date and time. A restoration timestamp cannot precede the first observation or lie in the future. The wording remains “restoration observed” because a light turning on is evidence of that moment, not certification that all systems are stable.

## The three record stages prevent premature closure

`Outage ongoing; facts still being observed` is for an active interruption. It permits system rows such as `Observed; monitoring` and requires a next action for every row that has not been closed.

`Supply restoration observed; household checks open` means someone has seen power return but the household has not finished checking the systems that matter. A router may need an ordinary connection test, a freezer record may require a health-authority review, or an appliance may remain off pending its manual or a qualified assessment. Restoration is a transition, not automatic close-out.

`Household close-out review complete` is strict. Every system row must already say `Closed after recheck`, and therefore no open action can remain. Use this only after the new observation and supporting record exist. Changing a status to make the form pass is not evidence.

## Name the official source, channel and date checked

The source field should answer: which responsible organization or household record did you consult, by what channel, and when? A useful entry is `Utility official outage page checked 2026-08-23; protected report reference OUTAGE-1.` A weak entry is `the internet said it was down.`

Use the utility serving the actual address, a building management notice for a shared system, or a local emergency authority for public hazards. Search results, neighborhood chat messages and social posts can help locate an official source but should not silently become the authority. If the source later changes, preserve both timestamps rather than rewriting the first record as though the later statement had always been known.

Do not paste the service address, account number, meter number, full case number or login details into the export. Keep sensitive proof in a protected folder and use a stable event pointer such as `OUTAGE-1`. The log is designed to remain useful when printed or shared with another household coordinator.

## Seven fields turn a symptom list into traceable observations

Each system line follows this structure:

`ID | area or system | first observed condition | source/evidence | household action already taken | owner/observer | status`

The ID uses 2–20 letters, numbers or hyphens, such as `POWER-1`, `COLD-1` or `ROUTER-1`. Every ID must be unique. Reuse the same ID in its one follow-up row so the next action cannot attach to the wrong system.

The area/system field identifies the operational unit: dwelling supply, lighting, refrigerator and freezer, home network, accessibility support, security equipment or another real household dependency. Avoid vague labels such as `everything`.

The condition field records what was visible or otherwise supported: `ordinary outlets unavailable at first check` or `router status lights absent while dwelling supply was unavailable`. It should not say `wiring failed` unless a qualified source established that conclusion.

The evidence field can name an official page timestamp, a dated photo index, a device indicator or a protected temperature record. The action-already-taken field describes history, not advice: `official page checked and event reference saved` is safer and more auditable than inventing an electrical procedure.

## Four statuses describe workflow, not safety

`Observed; monitoring` means the condition was recorded during an active event and will be checked again. It does not mean the condition is harmless.

`Official or qualified follow-up pending` is for a question that the household should not answer from a generic web tool. Food and medication decisions, power-dependent care plans, exposed wiring, repeated breaker behavior and equipment damage are examples where a current responsible source may be needed.

`Restored; recheck pending` means the relevant service appears to have returned but the household has not yet completed its planned check. It avoids the common mistake of equating one light with every device being ready.

`Closed after recheck` means the household performed the identified check, retained enough evidence to support the result and has no open work for that row. It is not a safety certification, repair approval or provider service-level finding.

The result counts statuses only as a workflow summary. Three closed convenience devices do not outweigh one open power-dependent support issue. There is no readiness score.

## Keep household-specific support details in their authoritative plans

The optional support section uses four fields:

`support category | authoritative plan or instructions location | observed impact only | responsible role`

Use categories such as communication, mobility support, temperature-sensitive supplies, caregiving or pet care. Put the actual plan in the protected source maintained with the person, clinician, pharmacist, manufacturer, provider or other qualified authority. The public tool should contain a pointer such as `protected care record CARE-1`, not a diagnosis, medication dose, device setting or private identity detail.

This keeps the outage record useful to a household coordinator while avoiding a dangerous copy problem. If the care plan changes, the source remains the authority. The event log only shows that the plan was consulted and what impact was observed.

## Food, medicine and equipment need evidence—not a universal verdict

The U.S. Centers for Disease Control and Prevention identifies carbon monoxide, food and water, medication, extreme temperature and electrical hazards as distinct outage concerns in its [power-outage safety guidance](https://www.cdc.gov/natural-disasters/response/what-to-do-protect-yourself-during-a-power-outage.html). That page includes U.S.-specific thresholds and emergency contacts. A household elsewhere must use its own current health and emergency authorities.

The log therefore records inputs without returning a safe/unsafe answer. For cold storage, preserve the first-observed time, whether doors remained closed, any reliable temperature evidence, the item or container reference and the authority consulted. For medicine, follow the label and current pharmacist, clinician or manufacturer guidance. For a power-dependent device, follow its manufacturer and individual support plan. Do not convert a generic timer into a medical or food-safety decision.

Portable generators and other fuel-burning equipment create a separate carbon-monoxide risk. CDC says never to run a generator or gasoline-powered engine inside a home, basement or garage and warns that fumes can accumulate in enclosed or partially enclosed spaces. The [EPA's outage and indoor-air guidance](https://www.epa.gov/emergencies-iaq/power-outages-and-indoor-air-quality-iaq) is another authoritative planning source. The event log does not calculate generator placement or approve an installation; retain manufacturer, local fire-safety and qualified installation guidance.

## Every unresolved ID gets exactly one next action

The follow-up format is:

`unresolved ID | next evidence-based action | owner or role | due date YYYY-MM-DD`

Every status except `Closed after recheck` requires one row. Missing actions, duplicate IDs and actions attached to already-closed observations are rejected. A due date may be the outage date because some source checks are same-day; it cannot be earlier than the event or later than the record's next-review date.

A good action identifies the new evidence required. `Check again` is vague. `Recheck the utility official status at the household's planned interval and save the new source timestamp` is testable. `Decide whether food is safe` is too broad; `compare the recorded time and temperature evidence with the responsible health authority's current guidance and preserve the decision source` keeps the boundary clear.

One action can include several orderly steps, but one owner remains accountable for closing the ID. If the next review shows a different condition, preserve the earlier row and create a new dated record rather than editing history into a cleaner story.

## The privacy screen reduces risk but cannot recognize every secret

The tool blocks common credentials, account identifiers, full-address language and unnecessary medical or device detail. This is a final warning layer, not permission to paste sensitive data until the filter complains. A distinctive nickname, case fragment or storage path may still reveal more than intended in a particular household.

Calculation happens in the browser. Copying, downloading, printing or saving the result into the FamilyBoard App creates a new copy controlled by the user. Review recipients, storage, backups and disposal. If an insurer, landlord, utility or government office needs proof, preserve original files and submit only through that organization's verified process.

Future disclosed affiliate recommendations must remain outside the form and result, never obscure current official links, and never imply that buying a generator, battery or monitoring product makes a household prepared. This record can be completed without purchasing anything.

## A careful close-out has three layers

First, reconcile the event: observation timestamps, official source, system rows and actions. Second, update the underlying household systems: contact directory, backup-power checks, emergency supplies, equipment records and care-plan pointers. Third, preserve the event in a protected location with a stable name and review whether any shared copies should be replaced or destroyed.

Use the [power outage preparedness guide](/guides/power-outage-home-preparedness/) to build the pre-event household workflow. Use the [emergency supply inventory audit](/tools/emergency-supply-inventory-audit/) to check physical supplies against a current plan, and the [emergency contact verification log](/tools/emergency-contact-verification-log/) to verify utility and support contacts without duplicating their full details.

**Next step:** enter one real event using the earliest supportable observation, name the official source and create one follow-up for every open system ID. Do not select close-out until each row has been rechecked and its evidence is preserved.
