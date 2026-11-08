---
title: "Free Home Inventory Tracker App | Appliances, Serial Numbers & Warranties | FamilyBoard"
description: "Track household appliances, electronics, serial numbers, purchase receipts, warranties, and maintenance history locally in your browser—free, private, no account required."
route: "/features/home-inventory-tracker/"
primaryIntent: "find a home inventory tracker"
primaryKeyword: "home inventory tracker"
cluster: "product"
pageType: "content"
indexable: true
depthVerified: true
publishedAt: "2026-08-19"
lastReviewedAt: "2026-11-08"
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

**Quick summary:** Use `FamilyBoard`'s free local-first home inventory tracker to record appliances, electronics, vehicles, and home systems by room, brand, model, serial number, purchase date, and status (`active`, `watch`, or `archived`). Every record stays in your browser's local database with zero signup and links directly to your maintenance schedules, warranty expiration dates, and receipt references, or exports to CSV/JSON for offline backup.

## What an asset record actually holds

The quick-add form on the Assets tab asks for a name, category (defaulting to "Appliance"), location, brand, model, serial number, purchase date and notes — eight fields, only the name required. The underlying asset record reserves several more fields for detail you can add later: purchase price, seller, installed date, a manual reference, and a status of active, watch or archived. Those extra fields aren't on the quick-add form, but they're part of every asset record and can be filled in through the household master CSV export in Settings — export to a spreadsheet, add the purchase price and manual link column by column, then import it back.

## Watch and Archive, not delete

Every asset card carries two buttons: "Watch" and "Archive." Watch flips the status to "watch" and the card gets an "attention" style — a way to flag an item you're keeping an eye on (a washing machine making a new noise, a roof patch you're monitoring) without creating a formal maintenance task for it yet. Archive sets the status to "archived," which removes it from the active-asset count on the dashboard and from the dropdown lists used when creating new maintenance, warranty or document records, without deleting its history.

## Why connect inventory to maintenance, warranties and documents

An asset by itself is just a name and a serial number. The reason to record one in FamilyBoard rather than a plain spreadsheet is that maintenance tasks, warranties and document references all reference an asset by its ID, and the related screens show the asset's name next to each entry. Complete a maintenance task on the dishwasher and the completion log identifies the dishwasher; add a warranty for the same asset and the warranty card shows its name instead of only a provider. FamilyBoard does not currently provide a single asset-detail screen that gathers all those records in one panel, so move between the relevant tabs and use the shared asset name as the connecting thread.

When the written warranty gives a start date and term, use the [warranty expiration date calculator](/tools/warranty-expiration-calculator/) to create a review date, then keep that result beside the source document rather than treating the calculated date as coverage proof.

## A worked example

A household adds "Dishwasher" as an asset: category Appliance, location Kitchen, brand Bosch, model SHP878, serial number recorded from the inner door frame, purchase date the day it was installed, notes "installed by contractor, drain hose routed under sink." Later, in Settings, they export the master CSV and fill in purchase price ($899) and manual reference (a link to the PDF they saved). They then create a maintenance task titled "Clean filter and check door seal" linked to that same asset, and a warranty record for the same asset with the manufacturer's two-year term and a receipt reference pointing to a folder in their email. All three records now show "Dishwasher" as their connecting thread. They remain on separate tabs rather than opening into one combined asset history, but the consistent asset name makes the relationship visible wherever each record is listed.

## Keep detail proportional to value

Not every item earns eight fields. A modest lamp might get a name and a location; nothing forces you to complete every field. A dishwasher, water heater or car is worth the extra ten minutes because a serial number, purchase price and manual reference are exactly what you'd need to find fast during a claim, a repair call or a resale.

## Build it gradually, and know the limits

Add one room or one category at a time rather than trying to catalog the whole house in one sitting. And keep the honest limits in mind: everything lives in this browser's local database, there's no photo-upload field on the asset record itself (photos would need to be referenced as a document instead), and if you use a different browser or device, this asset list doesn't follow you there automatically — export a JSON backup from Settings if you want to move it.

## Quick reference: what to write in each asset field

| Field | What to write | Why it helps later |
|---|---|---|
| Name | The plain name you would say aloud, such as "Kitchen dishwasher" | Finds the right record when several appliances share a brand |
| Category | Appliance, electronics, vehicle or home system | Keeps the list sortable when it grows |
| Location | Room or area, such as "Garage" | Tells a repair person or family member where to look |
| Brand and model | Copy exactly from the nameplate | Needed for manuals, parts and warranty questions |
| Serial number | Copy from the nameplate, checking 0 versus O | Often requested for a warranty claim or insurance report |
| Purchase date | Use the receipt or order date | Anchors warranty and age calculations |
| Notes | Where the receipt and manual are kept | Points to evidence without storing the file itself |

## What insurers say a home inventory is for

The Insurance Information Institute (Triple-I) explains that [an up-to-date home inventory can help you settle an insurance claim faster, verify losses for an income tax return and buy the right amount of coverage](https://www.iii.org/article/how-to-create-a-home-inventory). Its checklist asks for each item's description, make and model, serial number, price and place of purchase. Those are the same fields in this tracker's quick-add form, so recording them for the appliances and electronics that would be costly to replace already gives you the raw material an insurer or agent is likely to ask about. The National Association of Insurance Commissioners adds, in its [disaster-preparedness consumer alert](https://content.naic.org/article/consumer-insight-disaster-preparedness) (published in 2014), that higher-value items such as jewelry, electronics or collectibles may exceed standard policy limits, so the inventory is also a prompt to ask your insurer about coverage. Neither source says what your own policy will pay; that depends on the policy.

## Why local-first helps both claims readiness and privacy

FamilyBoard keeps asset records in IndexedDB inside your own browser; there is no account and no household-data server, so serial numbers and purchase prices are not sent to FamilyBoard. That is a privacy advantage for a list that doubles as a map of what is valuable in your home. It is not a backup: a browser profile can be cleared or lost with the device, and Triple-I recommends keeping a copy of the inventory somewhere outside the home. After you add items, export the JSON (or password-encrypted JSON) backup from Settings and store it in a place that would survive a fire or flood.
