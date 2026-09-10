# Targeted mobile and accessibility QA

Targeted Playwright smoke passed for all three selected pages in both Chromium desktop and Pixel 7 mobile projects (2 tests passed). Each route returned HTTP 200 and passed canonical, one visible H1, JSON-LD presence, required contextual bridge links, no browser console errors, and axe-core with zero violations.

Routes: `/features/maintenance-tracker/`, `/features/warranty-tracker/`, `/guides/digital-home-binder/`.

The existing full 001 accessibility matrix remains `UNVERIFIED_FULL_SUITE`; this is a targeted pass only.
