---
title: "FamilyBoard Event Duration Calculator Tutorial | Compare Two Observed Times"
description: "Learn how to use FamilyBoard's household event duration calculator with two observed timestamps, source notes and an honest result that does not replace an official outage, repair or notice record."
route: "/guides/familyboard-event-duration-calculator-tutorial/"
primaryIntent: "calculate elapsed time between two observed household timestamps without turning arithmetic into an official incident or service-duration claim"
primaryKeyword: "FamilyBoard household event duration calculator tutorial"
cluster: "household-operations"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-29"
lastReviewedAt: "2026-08-29"
nextStep: "Enter two real, clearly labelled observations, copy the elapsed-time result beside both source pointers and leave any official duration open until the responsible source confirms it."
related:
  - "/tools/household-event-duration-calculator/"
  - "/tools/household-event-source-index-log/"
  - "/tools/household-power-outage-event-log/"
  - "/guides/familyboard-event-source-index-tutorial/"
faq:
  - question: "What does the calculator actually measure?"
    answer: "It performs date-and-time arithmetic between two values you enter. It does not verify when an event began, when a provider fixed it or whether the result is an official duration."
  - question: "Which two timestamps should I enter?"
    answer: "Use two observed or source-supported moments with a clear meaning, such as “household first noticed” and “household saw service return.” Keep publication, notification, appointment and completion times separate when they answer different questions."
  - question: "Can I use the result for an insurance, landlord or utility claim?"
    answer: "Treat it as a household calculation aid only. Preserve the original notices, logs and provider records, and follow the responsible organisation's submission and evidence rules."
  - question: "What if the end time is earlier than the start time?"
    answer: "Stop and correct the entries or document a time-zone, overnight or source-version issue. Do not force a negative or reversed result to make a report look complete."
  - question: "Is an affiliate product required to calculate a duration?"
    answer: "No. The calculator is free and works with typed values. Any future product panel must remain outside the form, clearly disclosed and optional."
contentVersion: 1
---
# How to use FamilyBoard's household event duration calculator

Families often say “the outage lasted three hours” or “the repair took all day” when they are combining several different moments: a notice was posted, someone noticed a problem, a contractor arrived and a provider later reported completion. FamilyBoard's Household Event Duration Calculator handles the narrow arithmetic question—how much time lies between two entered timestamps—while keeping observation, source authority and formal results separate.

## Define the two moments before opening the tool

Write the question in one sentence. “How long between the first household observation and the first observation that the appliance operated again?” is testable. “How long was the repair?” may not be, because travel, diagnosis, parts ordering and authorised completion are different events.

Choose a start and end label that a second person can understand. Examples include `OUTAGE-A / first household observation` and `OUTAGE-A / power seen restored`, or `LEAK-B / first safe observation` and `LEAK-B / qualified work record received`. Use a neutral event code rather than an address, account number, claim number or person's name.

## Enter observed or source-supported times carefully

The calculator accepts two timestamps and returns elapsed days, hours and minutes. Enter the time zone or local context in your protected event record when it matters, especially around daylight-saving changes, travel or a device whose clock may be wrong. The displayed arithmetic is only as reliable as the values you entered.

Do not substitute a notification time for the moment a condition began. A text received at 10:15 proves the message was received then; it does not prove the leak started at 10:15. Likewise, a provider's “case closed” message may be a system event rather than the moment a household confirmed the condition changed. Keep those source meanings in separate notes.

## Pair the calculation with a source index

After running the tool, copy the result beside both source pointers in the [Household Event Source Index Log](/tools/household-event-source-index-log/). Record who observed each moment, when the source was checked and what remains unknown. If an outage has several changes, use the [Household Power Outage Event Log](/tools/household-power-outage-event-log/) or a repair evidence timeline instead of compressing the entire story into one number.

The result can say “16 hours 20 minutes between household observations.” It should not be rewritten as “the utility outage lasted 16 hours 20 minutes” unless the responsible utility's official record supports that exact claim. A duration calculation is an observation bridge, not an authority upgrade.

## Handle date and time errors as evidence gaps

If the end is earlier than the start, check whether the event crossed midnight, whether one device used a different time zone or whether a source was updated later. Correct the input only when you can explain why. Otherwise leave the row open with an evidence-gap note and ask the responsible source or qualified reviewer to clarify it.

Do not fill an unknown minute with `00` merely to obtain a neat result. “Around 9 a.m.” and “message timestamp 09:17” have different precision. Preserve the source's precision and say when the calculation is approximate. Never use the tool to calculate a legal notice deadline, service-level breach, medical interval, safety window, insurance coverage period or financial amount.

## Keep the output useful and private

The calculator runs on the current browser and does not read files, contact a provider or upload event details. The output may still become sensitive when copied into a download, message or printed report. Use safe IDs, remove addresses and account details, and keep the original notice, photograph, invoice or private conversation in its controlled location.

Future affiliate recommendations for clocks, sensors, outage radios or storage products must appear outside the calculation form, be clearly labelled and remain skippable. Buying an item cannot verify a timestamp, shorten an outage or close a disputed record.

**Next step:** calculate one pair of clearly named observations, save the result with both source pointers, and assign a reviewer for any official duration that the household still cannot prove.
