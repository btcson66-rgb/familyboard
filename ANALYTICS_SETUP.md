# FamilyBoard Analytics Setup

## Required dedicated resource

- Existing company Analytics account: `accounts/399522869`
- Required property: `FamilyBoard`
- Required web stream: `FamilyBoard Web`
- Default URL: `https://familyboard.win/`
- Deployment variable: `PUBLIC_GA4_MEASUREMENT_ID`

The 2026-08-20 account read-back found the existing company Analytics account but no FamilyBoard property. The current token scopes are `analytics.readonly` and `webmasters`; it cannot create a property because `analytics.edit` is absent. No fake property, stream or Measurement ID was created.

## Privacy boundary

- Public content may load GA4 only when a real production Measurement ID is configured.
- `/app/` never loads GA4 by default.
- Tool events may contain event names and page/tool identifiers only, never entered values.
- Household names, addresses, assets, notes, documents, emergency data, subscriptions and financial values must never be sent.

Current live read-back: public site GA4 absent (expected while pending); `/app/` GA4 absent (required and passing).
