---
title: "Privacy Policy — What FamilyBoard Collects and What Never Leaves Your Device"
description: "What the public site measures, which third parties are involved, and why household records in the FamilyBoard app never reach a server. Written to be checkable."
route: "/privacy/"
primaryIntent: "support FamilyBoard users"
primaryKeyword: ""
cluster: "support"
pageType: "support"
indexable: true
depthVerified: false
publishedAt: "2026-08-19"
lastReviewedAt: "2026-08-19"
related: []
faq: []
contentVersion: 1
---
# Privacy Policy

FamilyBoard has two clearly separated halves, and they are governed differently. This page describes both, and it describes what the site does today rather than what it might do later.

- The **public website** at `familyboard.win` publishes guides, calculators and printables. It uses Google Analytics 4 and is being prepared to show Google advertising.
- The **private app** at `/app/` and `/zh-tw/app/` stores your household records in your own browser. It loads no analytics and no advertising code at all.

## Household records never reach a server

Household members, asset names, maintenance records, warranty details, subscriptions, contacts, documents and emergency notes are written to your browser's own IndexedDB storage on your device. FamilyBoard has no account system, no household database and no server that receives these records. Nobody operating FamilyBoard can read them, because they are never transmitted.

The practical consequence is that your data is exactly as private, and exactly as fragile, as your browser profile. Clearing site data, losing the device or using a different browser means those records are gone. Export a JSON backup, or an encrypted JSON backup, and keep it somewhere durable.

## What the public site measures

The public pages load Google Analytics 4. It records ordinary web-analytics information such as pages viewed, approximate location derived from IP address, device and browser type, and how you arrived at the site. FamilyBoard configures GA4 with IP anonymisation on and Google Signals off.

Beyond page views, the site sends exactly two custom events, and they carry nothing you typed:

- `tool_complete`, with the slug of the tool — for example `warranty-expiration-calculator` — so we know which tools people finish.
- `affiliate_outbound`, with a product category, if you click a labelled affiliate link.

Values you enter into a calculator, generator or printable are processed in your browser and are not sent anywhere. The analytics code refuses to run on any `/app/` path, so nothing in the private app is measured, and the event allow-list rejects any parameter other than the tool slug and the category.

## Cookies and third-party vendors

Google Analytics sets cookies on the public site to distinguish visitors and sessions.

FamilyBoard's publisher identifier is `pub-9117672212804270` and the site publishes an `ads.txt` file naming Google as an authorised seller. No advertising is displayed at the time of writing: the Google AdSense script is loaded on public pages so the site can be verified for review, but no ad slot renders anywhere and no ad is served. The script is not loaded in the private app, on the offline page, on the error page, or on redirect pages. When advertising is enabled, Google and its partners will use cookies or similar technologies to serve and measure ads, including personalised advertising where you have permitted it.

You can control this independently of FamilyBoard:

- Google's own description of how it uses information from sites that use its services is published at [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).
- Ad personalisation can be turned off at [myadcenter.google.com](https://myadcenter.google.com/).
- Your browser's own settings can block or delete cookies, which will not stop the private app from working, because it does not depend on them.

Advertising and affiliate links never appear inside the private app, the household handoff views or the print-only sheets.

## Affiliate links

Some public pages may carry clearly labelled affiliate links, marked `rel="sponsored nofollow noopener"`. Following one takes you to a third-party retailer whose own privacy policy then applies. FamilyBoard records only that a link in a given product category was clicked, never which page you were on or anything about you.

## Attachments and offline caching

Attachment records in the app are references and metadata describing your original documents; the originals stay wherever you keep them. A service worker caches the app shell and pages you have already visited so the app keeps working offline. That cache lives on your device and is cleared when you clear site data.

## No sync today

FamilyBoard does not send household records to any sync service. If that ever changes, this page will be updated before such a service launches, and the change will be visible in the site changelog.

## Questions and corrections

Reach us through the [contact page](/contact/). Please do not include household records, document contents, account numbers or emergency details in any message — we do not need them to answer a question, and a support channel is the wrong place for them.
