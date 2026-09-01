---
title: "Warranty Tracker for Appliances and Household Purchases | FamilyBoard"
description: "Track household warranty providers, receipt references, written terms and expiration windows before you need them."
route: "/features/warranty-tracker/"
primaryIntent: "find an appliance or product warranty tracker"
primaryKeyword: "warranty tracker"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-22"
nextStep: "Add a warranty for the newest significant purchase in your home while the receipt is still easy to find, and link it to that item's asset record."
related:
  - "/features/home-inventory-tracker/"
  - "/features/household-documents-organizer/"
  - "/features/maintenance-tracker/"
  - "/features/free-home-management-app/"
faq:
  - question: "How does FamilyBoard know if a warranty has expired?"
    answer: "It compares the warranty's end date to today's date every time you view the Warranties tab, and shows \"Expired\" once that date has passed. There's no manual status field to update — the badge is always computed live from the date you entered."
  - question: "Can I attach the actual PDF receipt or warranty card to the record?"
    answer: "Not directly on the warranty record. The receipt reference and terms reference fields are plain text describing where the original lives — an email folder, a physical drawer, a cloud storage link — rather than a file upload. Keep the actual document in storage you control."
  - question: "Does FamilyBoard tell me whether my warranty claim will be approved?"
    answer: "No, and it shouldn't be relied on for that. Every warranty card includes a reminder that written terms control exact coverage. FamilyBoard tracks the dates and where to find your paperwork; the manufacturer or retailer determines what's actually covered."
  - question: "What happens to a warranty record if I archive the linked asset?"
    answer: "The warranty record itself isn't deleted or hidden — it stays in your data and remains visible on the Warranties tab. Archiving only removes the asset from active dropdown lists used when creating new records."
contentVersion: 1
---
# The worst time to look for warranty information is after something stops working

Warranty paperwork is easy to ignore when a product is new. Months or years later, the details are spread across an email receipt, a PDF manual, a store loyalty account and a photo of a serial number nobody can find again. `FamilyBoard`'s Warranties tab exists to capture that information once, while it's easy, and tie it to the item it actually covers.

## What a warranty record holds

The quick-add form requires an asset link and an end date; provider, start date, receipt reference, terms reference and notes are all optional but recorded when you have them. The asset link is what makes a warranty a warranty rather than a floating note — pick "Dishwasher" from the asset dropdown and the warranty card's header shows "Dishwasher," not a generic entry.

## Status is computed, not typed in

You never mark a warranty as expired yourself. The card compares the end date against today's date every time you open the tab: if the end date has passed, the badge reads "Expired"; on the end date itself and before it, the badge reads "Ends" followed by the date. Warranties that have not expired are listed first by nearest end date, followed by expired records with the most recently expired first. The status and order update when you open the app; no manual status field is involved.

## The receipt reference field, and why it's just text

The receipt reference is a plain string field — "PDF in email, subject 'Order confirmation,' dated March 2025" or "printed receipt in kitchen drawer folder" both work. FamilyBoard doesn't store the receipt file itself in this field; it stores where to find it, which is the same local-reference approach the Documents tab uses. Every warranty card also carries a fixed reminder: "Written terms control exact coverage." The app surfaces the date window; it never claims to know what a specific manufacturer's terms actually promise.

## A worked example

A household buys a washing machine with a two-year manufacturer warranty starting on the installation date. They add the asset first (brand, model, serial number from the door frame and purchase date), then add a warranty: asset = the washing machine, provider = manufacturer, starts at the installation date, ends 24 months later, receipt reference = "email folder 'Appliances 2026'," and terms reference = "warranty card, kitchen drawer." Fourteen months in, the card reads "Ends [date 10 months out]" — a fast answer to "is the recorded period still open?" without digging through email. If the machine develops a drain problem in month 20, the warranty record and the maintenance history remain in their respective tabs under the same asset name.

## One asset name connects the records across tabs

Because a warranty links to an asset ID, and a maintenance completion event links to a maintenance task that can use the same asset ID, both records identify the same appliance. FamilyBoard currently has no unified asset-detail screen: you switch between Warranties and Maintenance and use the consistent asset name to connect them. The app records the paperwork location and service timeline; it does not decide whether the issue is covered or whether a claim is worthwhile.

## What FamilyBoard does not do

It does not read your warranty terms or tell you whether a specific repair is covered — the "written terms control" reminder on every card is there because coverage rules vary by provider, product and agreement. It does not track extended or third-party warranties differently from manufacturer warranties; you record whichever terms and provider apply. It also has no review-before field and does not notify you by email or push alert as an end date approaches. If you need action before expiry, create a separate task with a real owner and due date.
