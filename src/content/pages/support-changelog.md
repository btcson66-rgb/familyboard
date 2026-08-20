---
title: "FamilyBoard Changelog — Product and Content Updates"
description: "Track real FamilyBoard releases, fixes, migrations and meaningful site updates."
route: "/changelog/"
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
# Changelog

Do not pre-fill fake release history. Start with the real launch release.

Each release entry should include:

- release date;
- app version;
- added;
- changed;
- fixed;
- data migration notes, if any;
- known limitations.

Content updates belong here only when they represent meaningful site-wide work. Individual article review dates should stay on those articles.

## Version 1.4.0 — August 20, 2026

This data-durability release adds a single household master-table CSV for bulk review and editing, with a blank template, pre-import preview, row-level validation, stable-ID merge and safe append modes. Every import first downloads a complete JSON safety snapshot, then commits valid rows in one local database transaction. The app also adds browser durable-storage controls, stale-backup reminders, localized file selectors and relationship-integrity checks. CSV is intended for spreadsheet workflows; JSON and encrypted JSON remain the complete disaster-recovery formats.

## Version 1.3.0 — August 20, 2026

This interface and discoverability release adds a complete Traditional Chinese application at /zh-tw/app/, with localized onboarding, navigation, forms, dynamic status text, handoff, display and backup workflows sharing the same local database as the English interface. It also introduces the generated FamilyBoard brand mark, a clearer homepage and app visual hierarchy, direct-answer content blocks, Organization/WebSite/WebApplication structured data, bilingual app privacy monitoring and expanded desktop/mobile accessibility coverage.

## Version 1.2.3 — August 20, 2026

This analytics activation release connects the dedicated FamilyBoard GA4 property and Web stream through a protected build variable while preserving the analytics-free private application boundary.

## Version 1.2.0 — August 20, 2026

This bilingual discovery release adds a Traditional Chinese (Taiwan) locale foundation and three independently written, indexable pages: the FamilyBoard introduction, a Taiwan-focused home-maintenance schedule guide and a working warranty-expiration calculator. Direct English/zh-TW pairs publish reciprocal hreflang and x-default links, localized navigation, in-language article and FAQ structured data, Taiwan-government sources, CJK-aware content inventory and desktop/mobile accessibility coverage. The live monitor now checks both locales and sitemap inclusion.

## Version 1.1.0 — August 20, 2026

This reliability release adds a tested v1-to-v2 IndexedDB migration, migration history, metadata-only attachment records, authenticated backup metadata, validate-only backup summaries, restore-from-first-run, storage health, household member management, handoff profiles, maintenance history detail, tool copy/download/save-to-app actions, an explicit PWA update flow and pre-cached offline app assets. It also adds linting, full app-lifecycle E2E coverage, breadcrumb and article structured data, privacy-safe analytics events, complete URL inventory fields and six-route Lighthouse evidence. Public paid-product promotion was removed while the free product builds usage evidence.

## Version 1.0.0 — August 19, 2026

The first production release adds the complete local-first household dashboard, assets, maintenance history, tasks, calendar events, warranty and subscription records, emergency contacts, document references, handoff and family display modes, versioned backup/restore, encrypted exports, offline support, 200 launch content pages, 25 working public tools and 20 printable resources. Known limitation: v1 uses one household in one browser and does not provide cloud sync or accounts.
