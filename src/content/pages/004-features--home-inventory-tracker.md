---
title: "Private Home Inventory Tracker for Appliances, Electronics and Household Assets | FamilyBoard"
description: "Create a practical home inventory with model numbers, serial numbers, purchase details, warranties, maintenance and local records."
route: "/features/home-inventory-tracker/"
primaryIntent: "find a home inventory tracker"
primaryKeyword: "home inventory tracker"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-19"
nextStep: "Add the first appliance or vehicle you'd hate to lose the receipt or serial number for, then export the master CSV from Settings to fill in purchase price and manual reference."
related:
  - "/features/maintenance-tracker/"
  - "/features/warranty-tracker/"
  - "/features/household-documents-organizer/"
  - "/features/free-home-management-app/"
faq:
  - question: "What fields does the quick-add form for an asset actually ask for?"
    answer: "Name (required), category, location, brand, model, serial number, purchase date and notes. Purchase price, seller, installed date, manual reference and status aren't on that form — they're part of the asset record and can be added by exporting the household master CSV from Settings, editing it in a spreadsheet, and importing it back."
  - question: "What's the difference between \"Watch\" and \"Archive\" on an asset card?"
    answer: "Watch flags an active asset you're monitoring — it stays fully active but gets a visual \"attention\" marker. Archive removes an asset from active counts and from dropdown lists on other screens, for items that are gone, replaced or no longer relevant, without deleting its history."
  - question: "Can I upload a photo of the appliance to its record?"
    answer: "The asset record itself doesn't have a photo field. If a photo matters — a nameplate, a receipt, a manual page — the practical option is to add it as a document reference pointing to where you've stored the file, then link that document to the asset."
  - question: "Does archiving an asset delete its maintenance history or warranty?"
    answer: "No. Archiving only changes the asset's status field. Its linked maintenance tasks, completion events, warranties and documents remain in the database; they simply won't show that asset in \"active\" dropdown lists on other tabs going forward."
contentVersion: 1
---
# A useful home inventory is not a list of everything you own

Trying to catalog every household object is one of the fastest ways to abandon a home inventory project. `FamilyBoard`'s Assets tab is built around a narrower goal: give the things that create cost, maintenance or responsibility a real record, and let that record connect to everything else — maintenance, warranties and documents — instead of sitting alone.

## What an asset record actually holds

The quick-add form on the Assets tab asks for a name, category (defaulting to "Appliance"), location, brand, model, serial number, purchase date and notes — eight fields, only the name required. The underlying asset record reserves several more fields for detail you can add later: purchase price, seller, installed date, a manual reference, and a status of active, watch or archived. Those extra fields aren't on the quick-add form, but they're part of every asset record and can be filled in through the household master CSV export in Settings — export to a spreadsheet, add the purchase price and manual link column by column, then import it back.

## Watch and Archive, not delete

Every asset card carries two buttons: "Watch" and "Archive." Watch flips the status to "watch" and the card gets an "attention" style — a way to flag an item you're keeping an eye on (a washing machine making a new noise, a roof patch you're monitoring) without creating a formal maintenance task for it yet. Archive sets the status to "archived," which removes it from the active-asset count on the dashboard and from the dropdown lists used when creating new maintenance, warranty or document records, without deleting its history.

## Why connect inventory to maintenance, warranties and documents

An asset by itself is just a name and a serial number. The reason to record one in FamilyBoard rather than a plain spreadsheet is that maintenance tasks, warranties and document references all reference an asset by its ID, and every screen that lists them shows the asset's name next to the entry. Complete a maintenance task on the dishwasher, and that completion is visible from the dishwasher's context, not just as an isolated log line. Add a warranty for the same asset, and the warranty screen shows the asset name in its header instead of a bare provider name.

## A worked example

A household adds "Dishwasher" as an asset: category Appliance, location Kitchen, brand Bosch, model SHP878, serial number recorded from the inner door frame, purchase date the day it was installed, notes "installed by contractor, drain hose routed under sink." Later, in Settings, they export the master CSV and fill in purchase price ($899) and manual reference (a link to the PDF they saved). They then create a maintenance task titled "Clean filter and check door seal" linked to that same asset, and a warranty record for the same asset with the manufacturer's two-year term and a receipt reference pointing to a folder in their email. All three records now show "Dishwasher" as their connecting thread — opening any one of them gives context for the other two through the asset name and linked records.

## Keep detail proportional to value

Not every item earns eight fields. A modest lamp might get a name and a location; nothing forces you to complete every field. A dishwasher, water heater or car is worth the extra ten minutes because a serial number, purchase price and manual reference are exactly what you'd need to find fast during a claim, a repair call or a resale.

## Build it gradually, and know the limits

Add one room or one category at a time rather than trying to catalog the whole house in one sitting. And keep the honest limits in mind: everything lives in this browser's local database, there's no photo-upload field on the asset record itself (photos would need to be referenced as a document instead), and if you use a different browser or device, this asset list doesn't follow you there automatically — export a JSON backup from Settings if you want to move it.
