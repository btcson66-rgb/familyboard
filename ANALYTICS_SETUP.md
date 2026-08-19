# Analytics setup — FamilyBoard

Target Google configuration:

- GA4 property: `FamilyBoard`
- Web stream: `FamilyBoard Web`
- URL: `https://familyboard.win/`
- Repository variable: `PUBLIC_GA4_MEASUREMENT_ID`

The public layout loads GA4 only in a production build with a valid Measurement ID. The private `/app/` layout never loads the tag in v1. Allowed tool events contain only the tool slug and generic completion state—never names, addresses, asset details, serial numbers, notes, subscription values, emergency information, document data or backup contents.

Realtime traffic must be read back after production launch before this integration is marked verified.

