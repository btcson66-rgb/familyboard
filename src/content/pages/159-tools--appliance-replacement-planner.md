---
title: "Free Appliance Replacement Planner | Build a Household Watch List"
description: "Create an appliance replacement watch list using known age, repair history, condition and household disruption without predicting exact failure dates."
route: "/tools/appliance-replacement-planner/"
primaryIntent: "decide which appliances deserve replacement planning"
primaryKeyword: "appliance replacement planner"
cluster: "tools"
pageType: "tool"
indexable: true
depthVerified: false
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-19"
nextStep: "Run the planner, and for anything flagged Review, save its dimensions and connection type alongside the repair history so a real replacement search is ready to go if you need it."
related:
  - "/guides/appliance-replacement-planning/"
  - "/guides/household-replacement-reserve/"
  - "/tools/appliance-age-calculator/"
  - "/features/home-dashboard/"
faq:
  - question: "What's the difference between the planner's \"Monitor\" and \"Review\" results?"
    answer: "Monitor means your appliance is marked as working normally and more than two years remain in the planning horizon you set. Review means either the condition isn't normal or your horizon is nearly used up — it's a prompt to look at the appliance now, not a statement that it has failed."
  - question: "Does the recent repair estimate change whether I get Monitor or Review?"
    answer: "No. The repair estimate is shown back to you for reference, but only your reported condition and how much time is left in your chosen planning horizon determine the flag. A large repair cost with \"Working normally\" still selected and years left on the horizon will still show Monitor."
  - question: "What does the \"planning horizon\" actually represent?"
    answer: "It's a number of years you choose yourself — how long you personally intend to plan around keeping this appliance — not a manufacturer-published lifespan figure. The planner has no built-in lifespan data; it only compares the appliance's current age against whatever horizon you enter."
  - question: "My appliance got a Review flag but it seems fine — what should I actually do?"
    answer: "Check its real condition, gather its repair history, and get an actual replacement quote if you're seriously weighing the decision. Review only means \"look at this one now\" — it doesn't mean the appliance has failed or needs to be replaced immediately."
contentVersion: 1
---
# Appliance Replacement Planner

This planner does not tell you to replace equipment on a fixed birthday. It compares how much of your own planning horizon is left against the condition you report, and gives you one of two flags: keep monitoring, or go review it now.

## What goes in, and how the flag is decided

Give the planner the appliance's name, its purchase date, a planning horizon in years — how long you personally intend to plan around this appliance, not a manufacturer figure — your assessment of its current condition (working normally, watch: performance changed, or repair decision pending), and a recent repair estimate if one applies.

From the purchase date it calculates the appliance's current age. It subtracts that age from your planning horizon to get the time remaining in your own plan. The flag comes down to two conditions checked together: if you've marked the appliance as working normally and more than two years remain in your horizon, the result reads **Monitor**. Otherwise — whether because the condition isn't "working normally" or because your horizon is running out regardless of condition — the result reads **Review**. The repair estimate you enter is carried through to the result for your own reference, but it does not by itself change which of the two flags you get.

## Worked example

A refrigerator purchased January 10, 2020, checked today with a 12-year planning horizon and "Working normally" selected, is roughly 6.6 years old — leaving about 5.4 years in the horizon. Since that's more than two years and the condition is normal, the result is **Monitor**. The same refrigerator purchased January 10, 2015 instead, checked with the same 12-year horizon, is about 11.6 years old with only 0.4 years remaining — even with "Working normally" still selected, the result flips to **Review**, because the horizon itself is nearly used up.

## What the planner can't determine

It has no diagnostic access to the appliance and no manufacturer lifespan data — it only works with the age, horizon, condition, and repair figure you type in. It can't tell you whether a repair is worth the cost, what a real replacement would cost today, or whether the unit is actually failing. A **Review** flag means "go look at this one," not "this is broken."

## What a Review flag should lead to

Once something is flagged for review, the next steps are outside the planner: check the appliance's actual condition, pull its repair history, and get a real replacement quote if you're seriously considering it. Record the appliance's dimensions and connection type while you're looking at it, since that's exactly the information you'll need if a replacement search does become necessary later.

## Choosing a planning horizon that means something

There's no universally correct number to enter for the planning horizon — it's meant to reflect how long you actually intend to think about this specific appliance before revisiting the decision, not a manufacturer lifespan claim. A household in a starter home might set a short horizon on an appliance they expect to replace anyway; a household that just renovated a kitchen might set a much longer one. Revisit the horizon itself occasionally, since a number chosen five years ago may no longer reflect your actual plans.
