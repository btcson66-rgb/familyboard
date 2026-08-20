# Accessibility report

## Automated evidence

Playwright + axe ran on desktop Chromium and a Pixel 7 profile for the English homepage, long guide, interactive tool, printable and free-product page, plus the Traditional Chinese homepage, guide and interactive tool.

- Serious violations: 0
- Critical violations: 0
- Lighthouse accessibility: 100 on all nine representative performance routes
- Command evidence: `npm run e2e` — 7 passed, 1 intentionally skipped duplicate mobile lifecycle

## Keyboard and focus checklist

- Skip link is the first keyboard target and moves focus to `#main-content`.
- All app navigation controls, forms, export/restore actions and public tool actions use native interactive elements.
- `:focus-visible` provides a three-pixel high-contrast outline.
- The destructive reset remains disabled until the exact household name is entered.
- No modal or custom dialog is shipped; therefore there is no focus trap to validate.

## Forms, results and errors

- Inputs have programmatic labels and required fields use native validation.
- Calculator/generator output is inside `aria-live="polite"`.
- Save, validation, import and backup results use status or alert roles.
- IndexedDB, quota, invalid backup and wrong-password failures return actionable text and do not instruct users to clear existing storage.

## Print and screen-reader structure

- Printable tables use `<thead>` and `<th scope="col">`.
- Heading-order normalization prevents skipped heading levels in generated content.
- Print media hides navigation/actions and preserves worksheet tables.
- English and Traditional Chinese pages expose the correct document language, reciprocal language links on paired pages and localized skip/navigation labels.
- App and shared-display views use semantic headings; sensitive fields are excluded from handoff/display output.

## Known limitations and manual follow-up

- Native browser file pickers, download dialogs and print-preview UI are platform-owned and cannot be fully audited by axe.
- Complete spoken-output quality still needs one manual smoke test with NVDA or VoiceOver on production.
- A physical mobile browser install/update flow remains a production follow-up; the automated test covers service-worker offline reload.
