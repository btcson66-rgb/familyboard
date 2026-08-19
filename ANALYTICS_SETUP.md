# FamilyBoard Analytics Setup

## Required dedicated resource

- Existing company Analytics account: `accounts/399522869`
- Required property: `FamilyBoard`
- Required web stream: `FamilyBoard Web`
- Default URL: `https://familyboard.win/`
- Deployment variable: `PUBLIC_GA4_MEASUREMENT_ID`

The 2026-08-19 account read-back found the existing RoomFeng, WorthCalc and FunnyTools properties but no FamilyBoard property. The authorized create attempt returned `HTTP 403: Request had insufficient authentication scopes` because the current token has `analytics.readonly`, not `analytics.edit`. No fake property, stream or Measurement ID was created.

## Privacy boundary

- Public content may load GA4 only when a real production Measurement ID is configured.
- `/app/` never loads GA4 by default.
- Tool events may contain event names and page/tool identifiers only, never entered values.
- Household names, addresses, assets, notes, documents, emergency data, subscriptions and financial values must never be sent.

Current live read-back: public site GA4 absent (expected while pending); `/app/` GA4 absent (required and passing).
