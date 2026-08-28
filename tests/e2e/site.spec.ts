import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

test("public SEO, keyboard and eight production tools work", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/FamilyBoard/);
  await expect(page.locator("main h1:visible")).toHaveCount(1);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  for (const route of [
    "/tools/home-maintenance-schedule-generator/",
    "/tools/household-subscription-cost-calculator/",
    "/tools/room-inventory-generator/",
    "/tools/recurring-chore-planner/",
    "/tools/emergency-binder-generator/",
    "/tools/household-seasonal-reset-action-log/",
    "/tools/household-device-retirement-handoff-log/",
    "/tools/household-router-support-review-log/",
    "/tools/household-shopping-list-planner/",
    "/tools/household-account-list/",
    "/tools/household-responsibility-coverage-map/",
    "/tools/household-replacement-part-source-check-log/",
    "/tools/household-consumable-change-history-log/",
    "/tools/household-repair-evidence-timeline-log/",
    "/tools/household-insurance-claim-timeline-log/",
    "/tools/household-building-notice-response-log/",
    "/tools/rental-repair-request-log/",
    "/tools/household-school-closure-continuity-log/",
    "/tools/household-event-duration-calculator/",
    "/tools/household-event-source-index-log/",
    "/tools/household-decision-register/",
    "/tools/household-backup-recovery-checker/",
    "/tools/household-utility-bill-anomaly-log/",
    "/tools/household-time-window-overlap-checker/",
    "/tools/household-date-offset-planner/",
    "/tools/household-task-load-calculator/",
    "/tools/household-shopping-list-planner/",
    "/tools/household-responsibility-coverage-map/",
    "/tools/household-replacement-part-source-check-log/",
    "/tools/annual-subscription-cost-calculator/",
    "/tools/storage-unit-access-inventory-log/",
    "/tools/moving-box-handover-log/",
    "/tools/household-medical-information-source-handoff-log/",
    "/tools/caregiver-handoff-source-authorization-log/",
    "/tools/household-insurance-policy-source-version-log/",
    "/tools/household-school-record-source-handoff-log/",
    "/tools/household-mail-package-handoff-log/",
    "/tools/household-plant-care-handoff-log/",
    "/tools/household-meeting-agenda-action-log/",
    "/tools/household-pantry-expiry-review-log/",
    "/tools/household-trip-packing-handoff-log/",
    "/tools/move-in-checklist-generator/",
    "/tools/move-out-condition-record-generator/",
    "/tools/vacation-shutdown-checklist-generator/",
    "/tools/important-household-document-review/",
    "/tools/appliance-maintenance-checklist-generator/",
    "/tools/receipt-retention-organizer/",
    "/tools/household-backup-recovery-checker/",
    "/tools/household-time-window-overlap-checker/",
    "/tools/household-task-load-calculator/",
  ]) {
    await page.goto(route);
    await page.getByRole("button", { name: "Generate result" }).click();
    await expect(page.locator(".result")).not.toBeEmpty();
  }

  await page.goto("/tools/warranty-expiration-calculator/");
  await page.getByLabel("Purchase date").fill("2026-01-01");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Estimated term end");

  await page.goto("/templates/printable-home-inventory-template/");
  await expect(page.locator(".printable thead th")).toHaveCount(5);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".printable table")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Print this worksheet" }),
  ).toBeHidden();
  await page.emulateMedia({ media: "screen" });

  const sitemap = await (await page.request.get("/sitemap-0.xml")).text();
  expect(sitemap).not.toContain("/app/");
  expect(sitemap).not.toContain(
    "<loc>https://familyboard.win/offline/</loc>",
  );
  expect(sitemap).toContain(
    "<loc>https://familyboard.win/features/offline-household-organizer/</loc>",
  );
  for (const route of [
    "/guides/household-admin-day/",
    "/guides/service-provider-contact-list/",
    "/guides/household-shopping-staples/",
    "/zh-tw/guides/household-admin-day/",
    "/zh-tw/guides/service-provider-contact-list/",
    "/zh-tw/guides/household-shopping-staples/",
    "/features/local-first-home-organizer/",
    "/features/no-account-family-organizer/",
    "/features/household-operations-system/",
    "/zh-tw/features/local-first-home-organizer/",
    "/zh-tw/features/no-account-family-organizer/",
    "/zh-tw/features/household-operations-system/",
    "/zh-tw/guides/home-purchase-records/",
    "/zh-tw/guides/familyboard-warranty-expiration-calculator-tutorial/",
    "/zh-tw/guides/familyboard-household-subscription-cost-calculator-tutorial/",
    "/features/home-record-keeper/",
    "/zh-tw/features/home-record-keeper/",
    "/guides/household-handoff/",
    "/zh-tw/guides/household-handoff/",
    "/features/household-handoff/",
    "/zh-tw/features/household-handoff/",
    "/guides/family-emergency-contacts/",
    "/zh-tw/guides/family-emergency-contacts/",
    "/guides/what-spouse-needs-to-know/",
    "/zh-tw/guides/what-spouse-needs-to-know/",
    "/guides/recurring-household-tasks/",
    "/zh-tw/guides/recurring-household-tasks/",
    "/guides/subscription-renewal-tracker/",
    "/zh-tw/guides/subscription-renewal-tracker/",
    "/guides/chore-chart-for-adults/",
    "/zh-tw/guides/chore-chart-for-adults/",
    "/guides/familyboard-record-linking-tutorial/",
    "/zh-tw/guides/familyboard-record-linking-tutorial/",
    "/guides/familyboard-utility-bill-difference-tutorial/",
    "/zh-tw/guides/familyboard-utility-bill-difference-tutorial/",
    "/guides/familyboard-time-window-overlap-checker-tutorial/",
    "/zh-tw/guides/familyboard-time-window-overlap-checker-tutorial/",
    "/guides/familyboard-date-offset-planner-tutorial/",
    "/zh-tw/guides/familyboard-date-offset-planner-tutorial/",
    "/guides/familyboard-task-load-calculator-tutorial/",
    "/zh-tw/guides/familyboard-task-load-calculator-tutorial/",
    "/guides/familyboard-appliance-age-calculator-tutorial/",
    "/zh-tw/guides/familyboard-appliance-age-calculator-tutorial/",
    "/guides/familyboard-appliance-replacement-planner-tutorial/",
    "/zh-tw/guides/familyboard-appliance-replacement-planner-tutorial/",
    "/guides/familyboard-cleaning-schedule-generator-tutorial/",
    "/zh-tw/guides/familyboard-cleaning-schedule-generator-tutorial/",
    "/guides/familyboard-home-repair-closeout-checklist-tutorial/",
    "/zh-tw/guides/familyboard-home-repair-closeout-checklist-tutorial/",
    "/guides/familyboard-pet-record-source-handoff-tutorial/",
    "/zh-tw/guides/familyboard-pet-record-source-handoff-tutorial/",
    "/guides/familyboard-home-accessibility-walkthrough-log-tutorial/",
    "/zh-tw/guides/familyboard-home-accessibility-walkthrough-log-tutorial/",
    "/guides/familyboard-home-maintenance-cost-tracker-tutorial/",
    "/zh-tw/guides/familyboard-home-maintenance-cost-tracker-tutorial/",
    "/guides/familyboard-home-service-reminder-generator-tutorial/",
    "/zh-tw/guides/familyboard-home-service-reminder-generator-tutorial/",
    "/guides/familyboard-recurring-chore-planner-tutorial/",
    "/zh-tw/guides/familyboard-recurring-chore-planner-tutorial/",
    "/guides/familyboard-home-inventory-checklist-generator-tutorial/",
    "/zh-tw/guides/familyboard-home-inventory-checklist-generator-tutorial/",
    "/guides/familyboard-room-inventory-generator-tutorial/",
    "/zh-tw/guides/familyboard-room-inventory-generator-tutorial/",
    "/guides/familyboard-warranty-checklist-generator-tutorial/",
    "/zh-tw/guides/familyboard-warranty-checklist-generator-tutorial/",
    "/guides/familyboard-home-care-service-plan-change-notice-tutorial/",
    "/zh-tw/guides/familyboard-home-care-service-plan-change-notice-tutorial/",
    "/guides/familyboard-home-care-service-interruption-backup-continuity-tutorial/",
    "/zh-tw/guides/familyboard-home-care-service-interruption-backup-continuity-tutorial/",
    "/guides/familyboard-home-care-complaint-response-resolution-tutorial/",
    "/zh-tw/guides/familyboard-home-care-complaint-response-resolution-tutorial/",
    "/guides/familyboard-home-care-billing-discrepancy-tutorial/",
    "/zh-tw/guides/familyboard-home-care-billing-discrepancy-tutorial/",
    "/guides/familyboard-home-care-payment-refund-collection-notice-tutorial/",
    "/zh-tw/guides/familyboard-home-care-payment-refund-collection-notice-tutorial/",
    "/guides/familyboard-rental-security-deposit-move-out-tutorial/",
    "/zh-tw/guides/familyboard-rental-security-deposit-move-out-tutorial/",
    "/guides/familyboard-calendar-tutorial/",
    "/zh-tw/guides/familyboard-calendar-tutorial/",
    "/guides/familyboard-warranty-tracker-tutorial/",
    "/zh-tw/guides/familyboard-warranty-tracker-tutorial/",
    "/guides/familyboard-maintenance-tracker-tutorial/",
    "/zh-tw/guides/familyboard-maintenance-tracker-tutorial/",
    "/guides/familyboard-emergency-supply-inventory-audit-tutorial/",
    "/zh-tw/guides/familyboard-emergency-supply-inventory-audit-tutorial/",
    "/guides/familyboard-home-service-provider-verification-tutorial/",
    "/zh-tw/guides/familyboard-home-service-provider-verification-tutorial/",
    "/guides/familyboard-home-repair-change-order-tutorial/",
    "/zh-tw/guides/familyboard-home-repair-change-order-tutorial/",
    "/guides/familyboard-emergency-contact-sheet-generator-tutorial/",
    "/zh-tw/guides/familyboard-emergency-contact-sheet-generator-tutorial/",
    "/guides/familyboard-home-emergency-drill-record-tutorial/",
    "/zh-tw/guides/familyboard-home-emergency-drill-record-tutorial/",
    "/guides/familyboard-storm-readiness-review-tutorial/",
    "/zh-tw/guides/familyboard-storm-readiness-review-tutorial/",
    "/guides/familyboard-appliance-manual-source-check-tutorial/",
    "/zh-tw/guides/familyboard-appliance-manual-source-check-tutorial/",
    "/guides/familyboard-appliance-service-visit-tutorial/",
    "/zh-tw/guides/familyboard-appliance-service-visit-tutorial/",
    "/guides/familyboard-appliance-repair-callback-tutorial/",
    "/zh-tw/guides/familyboard-appliance-repair-callback-tutorial/",
    "/guides/familyboard-appliance-purchase-installation-tutorial/",
    "/zh-tw/guides/familyboard-appliance-purchase-installation-tutorial/",
    "/guides/familyboard-home-handoff-summary-generator-tutorial/",
    "/zh-tw/guides/familyboard-home-handoff-summary-generator-tutorial/",
    "/guides/familyboard-house-sitter-instruction-generator-tutorial/",
    "/zh-tw/guides/familyboard-house-sitter-instruction-generator-tutorial/",
    "/guides/familyboard-annual-subscription-cost-calculator-tutorial/",
    "/zh-tw/guides/familyboard-annual-subscription-cost-calculator-tutorial/",
    "/guides/familyboard-storage-unit-access-inventory-log-tutorial/",
    "/zh-tw/guides/familyboard-storage-unit-access-inventory-log-tutorial/",
    "/guides/familyboard-moving-box-handover-log-tutorial/",
    "/zh-tw/guides/familyboard-moving-box-handover-log-tutorial/",
    "/guides/familyboard-medical-information-source-handoff-tutorial/",
    "/zh-tw/guides/familyboard-medical-information-source-handoff-tutorial/",
    "/guides/familyboard-caregiver-handoff-source-authorization-tutorial/",
    "/zh-tw/guides/familyboard-caregiver-handoff-source-authorization-tutorial/",
    "/guides/familyboard-insurance-policy-source-version-tutorial/",
    "/zh-tw/guides/familyboard-insurance-policy-source-version-tutorial/",
    "/guides/familyboard-school-record-source-handoff-tutorial/",
    "/zh-tw/guides/familyboard-school-record-source-handoff-tutorial/",
    "/guides/familyboard-mail-package-handoff-log-tutorial/",
    "/zh-tw/guides/familyboard-mail-package-handoff-log-tutorial/",
    "/guides/familyboard-plant-care-handoff-log-tutorial/",
    "/zh-tw/guides/familyboard-plant-care-handoff-log-tutorial/",
    "/guides/familyboard-household-meeting-agenda-action-log-tutorial/",
    "/zh-tw/guides/familyboard-household-meeting-agenda-action-log-tutorial/",
    "/guides/familyboard-pantry-expiry-review-log-tutorial/",
    "/zh-tw/guides/familyboard-pantry-expiry-review-log-tutorial/",
    "/guides/familyboard-trip-packing-handoff-log-tutorial/",
    "/zh-tw/guides/familyboard-trip-packing-handoff-log-tutorial/",
    "/guides/familyboard-move-in-checklist-generator-tutorial/",
    "/zh-tw/guides/familyboard-move-in-checklist-generator-tutorial/",
    "/guides/familyboard-move-out-condition-report-generator-tutorial/",
    "/zh-tw/guides/familyboard-move-out-condition-report-generator-tutorial/",
    "/guides/familyboard-vacation-shutdown-checklist-generator-tutorial/",
    "/zh-tw/guides/familyboard-vacation-shutdown-checklist-generator-tutorial/",
    "/guides/familyboard-important-household-document-review-tutorial/",
    "/zh-tw/guides/familyboard-important-household-document-review-tutorial/",
    "/guides/familyboard-appliance-maintenance-checklist-generator-tutorial/",
    "/zh-tw/guides/familyboard-appliance-maintenance-checklist-generator-tutorial/",
    "/guides/familyboard-receipt-retention-organizer-tutorial/",
    "/zh-tw/guides/familyboard-receipt-retention-organizer-tutorial/",
    "/guides/familyboard-household-backup-recovery-checker-tutorial/",
    "/zh-tw/guides/familyboard-household-backup-recovery-checker-tutorial/",
    "/guides/familyboard-household-time-window-overlap-checker-tutorial/",
    "/zh-tw/guides/familyboard-household-time-window-overlap-checker-tutorial/",
    "/guides/familyboard-household-task-load-calculator-tutorial/",
    "/zh-tw/guides/familyboard-household-task-load-calculator-tutorial/",
    "/guides/familyboard-household-shopping-list-planner-tutorial/",
    "/zh-tw/guides/familyboard-household-shopping-list-planner-tutorial/",
    "/guides/familyboard-household-responsibility-coverage-map-tutorial/",
    "/zh-tw/guides/familyboard-household-responsibility-coverage-map-tutorial/",
    "/guides/familyboard-replacement-part-source-check-log-tutorial/",
    "/zh-tw/guides/familyboard-replacement-part-source-check-log-tutorial/",
    "/guides/familyboard-purchase-delivery-evidence-tutorial/",
    "/zh-tw/guides/familyboard-purchase-delivery-evidence-tutorial/",
    "/guides/familyboard-warranty-claim-evidence-log-tutorial/",
    "/zh-tw/guides/familyboard-warranty-claim-evidence-log-tutorial/",
    "/guides/familyboard-pet-sitter-instruction-generator-tutorial/",
    "/zh-tw/guides/familyboard-pet-sitter-instruction-generator-tutorial/",
    "/guides/familyboard-home-repair-cost-log-tutorial/",
    "/zh-tw/guides/familyboard-home-repair-cost-log-tutorial/",
    "/guides/familyboard-home-care-visit-scope-service-result-tutorial/",
    "/zh-tw/guides/familyboard-home-care-visit-scope-service-result-tutorial/",
    "/guides/familyboard-shared-device-privacy-review-tutorial/",
    "/zh-tw/guides/familyboard-shared-device-privacy-review-tutorial/",
    "/guides/familyboard-household-document-redaction-tutorial/",
    "/zh-tw/guides/familyboard-household-document-redaction-tutorial/",
    "/guides/familyboard-rental-home-maintenance-handoff-tutorial/",
    "/zh-tw/guides/familyboard-rental-home-maintenance-handoff-tutorial/",
    "/guides/familyboard-clothing-care-repair-log-tutorial/",
    "/zh-tw/guides/familyboard-clothing-care-repair-log-tutorial/",
    "/guides/familyboard-meal-prep-role-log-tutorial/",
    "/zh-tw/guides/familyboard-meal-prep-role-log-tutorial/",
    "/guides/familyboard-household-bill-source-status-tutorial/",
    "/zh-tw/guides/familyboard-household-bill-source-status-tutorial/",
    "/guides/familyboard-household-export-scope-review-tutorial/",
    "/zh-tw/guides/familyboard-household-export-scope-review-tutorial/",
    "/guides/familyboard-printout-download-retention-tutorial/",
    "/zh-tw/guides/familyboard-printout-download-retention-tutorial/",
    "/guides/familyboard-household-role-change-audit-tutorial/",
    "/zh-tw/guides/familyboard-household-role-change-audit-tutorial/",
    "/guides/familyboard-guest-service-visit-reset-tutorial/",
    "/zh-tw/guides/familyboard-guest-service-visit-reset-tutorial/",
    "/guides/familyboard-subscription-cancellation-result-review-tutorial/",
    "/zh-tw/guides/familyboard-subscription-cancellation-result-review-tutorial/",
    "/guides/familyboard-weekly-household-decision-review-tutorial/",
    "/zh-tw/guides/familyboard-weekly-household-decision-review-tutorial/",
    "/guides/familyboard-restore-merge-replace-tutorial/",
    "/zh-tw/guides/familyboard-restore-merge-replace-tutorial/",
    "/guides/familyboard-storage-health-warning-tutorial/",
    "/zh-tw/guides/familyboard-storage-health-warning-tutorial/",
    "/guides/familyboard-attachment-metadata-tutorial/",
    "/zh-tw/guides/familyboard-attachment-metadata-tutorial/",
    "/guides/familyboard-encrypted-backup-password-tutorial/",
    "/zh-tw/guides/familyboard-encrypted-backup-password-tutorial/",
    "/guides/familyboard-master-csv-edit-import-tutorial/",
    "/zh-tw/guides/familyboard-master-csv-edit-import-tutorial/",
    "/guides/familyboard-app-first-run-restore-tutorial/",
    "/zh-tw/guides/familyboard-app-first-run-restore-tutorial/",
    "/guides/familyboard-pwa-update-tutorial/",
    "/zh-tw/guides/familyboard-pwa-update-tutorial/",
    "/guides/familyboard-shared-display-privacy-tutorial/",
    "/zh-tw/guides/familyboard-shared-display-privacy-tutorial/",
    "/guides/familyboard-reset-local-household-tutorial/",
    "/zh-tw/guides/familyboard-reset-local-household-tutorial/",
    "/guides/familyboard-storage-open-error-tutorial/",
    "/zh-tw/guides/familyboard-storage-open-error-tutorial/",
    "/guides/familyboard-task-completion-tutorial/",
    "/zh-tw/guides/familyboard-task-completion-tutorial/",
    "/guides/familyboard-member-archive-tutorial/",
    "/zh-tw/guides/familyboard-member-archive-tutorial/",
    "/guides/familyboard-household-annual-review-generator-tutorial/",
    "/zh-tw/guides/familyboard-household-annual-review-generator-tutorial/",
    "/guides/familyboard-household-document-index-generator-tutorial/",
    "/zh-tw/guides/familyboard-household-document-index-generator-tutorial/",
    "/guides/familyboard-emergency-binder-generator-tutorial/",
    "/zh-tw/guides/familyboard-emergency-binder-generator-tutorial/",
    "/guides/familyboard-utility-bill-anomaly-log-tutorial/",
    "/zh-tw/guides/familyboard-utility-bill-anomaly-log-tutorial/",
    "/guides/familyboard-maintenance-delegation-map-tutorial/",
    "/zh-tw/guides/familyboard-maintenance-delegation-map-tutorial/",
    "/guides/familyboard-record-retention-decision-log-tutorial/",
    "/zh-tw/guides/familyboard-record-retention-decision-log-tutorial/",
    "/guides/familyboard-home-repair-closeout-checklist-tutorial/",
    "/zh-tw/guides/familyboard-home-repair-closeout-checklist-tutorial/",
    "/guides/familyboard-pet-record-source-handoff-tutorial/",
    "/zh-tw/guides/familyboard-pet-record-source-handoff-tutorial/",
    "/guides/familyboard-home-accessibility-walkthrough-log-tutorial/",
    "/zh-tw/guides/familyboard-home-accessibility-walkthrough-log-tutorial/",
    "/guides/familyboard-utility-bill-anomaly-log-tutorial/",
    "/zh-tw/guides/familyboard-utility-bill-anomaly-log-tutorial/",
    "/guides/familyboard-maintenance-delegation-map-tutorial/",
    "/zh-tw/guides/familyboard-maintenance-delegation-map-tutorial/",
    "/guides/familyboard-record-retention-decision-log-tutorial/",
    "/zh-tw/guides/familyboard-record-retention-decision-log-tutorial/",
    "/tools/household-date-offset-planner/",
    "/zh-tw/tools/household-date-offset-planner/",
    "/tools/household-task-load-calculator/",
    "/zh-tw/tools/household-task-load-calculator/",
    "/editorial-policy/",
    "/zh-tw/editorial-policy/",
    "/disclaimer/",
    "/zh-tw/disclaimer/",
    "/about/",
    "/zh-tw/about/",
    "/checklists/printable-home-maintenance-checklist/",
    "/zh-tw/checklists/printable-home-maintenance-checklist/",
    "/templates/printable-home-inventory-template/",
    "/zh-tw/templates/printable-home-inventory-template/",
    "/templates/printable-household-handoff-sheet/",
    "/zh-tw/templates/printable-household-handoff-sheet/",
    "/features/",
    "/zh-tw/features/",
    "/checklists/printable-monthly-home-checklist/",
    "/zh-tw/checklists/printable-monthly-home-checklist/",
    "/checklists/printable-seasonal-home-checklist/",
    "/zh-tw/checklists/printable-seasonal-home-checklist/",
    "/checklists/printable-emergency-binder-checklist/",
    "/zh-tw/checklists/printable-emergency-binder-checklist/",
    "/checklists/printable-moving-checklist/",
    "/zh-tw/checklists/printable-moving-checklist/",
    "/checklists/printable-pet-sitter-checklist/",
    "/zh-tw/checklists/printable-pet-sitter-checklist/",
    "/templates/printable-service-provider-list/",
    "/zh-tw/templates/printable-service-provider-list/",
    "/templates/printable-emergency-contacts/",
    "/zh-tw/templates/printable-emergency-contacts/",
    "/templates/",
    "/zh-tw/templates/",
    "/templates/printable-household-contacts/",
    "/zh-tw/templates/printable-household-contacts/",
    "/templates/printable-cleaning-schedule/",
    "/zh-tw/templates/printable-cleaning-schedule/",
    "/templates/printable-chore-chart/",
    "/zh-tw/templates/printable-chore-chart/",
    "/checklists/printable-house-sitter-checklist/",
    "/zh-tw/checklists/printable-house-sitter-checklist/",
    "/templates/printable-subscription-tracker/",
    "/zh-tw/templates/printable-subscription-tracker/",
    "/templates/printable-annual-renewals/",
    "/zh-tw/templates/printable-annual-renewals/",
    "/zh-tw/changelog/",
    "/zh-tw/pricing/",
    "/zh-tw/roadmap/",
    "/templates/printable-appliance-inventory/",
    "/zh-tw/templates/printable-appliance-inventory/",
    "/templates/printable-warranty-tracker/",
    "/zh-tw/templates/printable-warranty-tracker/",
    "/templates/printable-repair-log/",
    "/zh-tw/templates/printable-repair-log/",
    "/guides/",
    "/zh-tw/guides/",
    "/tools/",
    "/zh-tw/tools/",
    "/checklists/",
    "/zh-tw/checklists/",
  ]) {
    expect(sitemap).toContain(`<loc>https://familyboard.win${route}</loc>`);
  }
  await page.goto("/app/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex,follow",
  );
  await expect(page.locator('meta[name="google-adsense-account"]')).toHaveCount(
    0,
  );
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
});

test("representative routes have no serious accessibility violations", async ({
  page,
}) => {
  // The representative route matrix intentionally covers the growing public
  // library. Keep a generous ceiling so adding a substantive page does not
  // turn a complete accessibility sweep into a timeout on slower CI runners.
  test.setTimeout(600_000);
  for (const route of [
    "/",
    "/guides/home-maintenance-schedule/",
    "/guides/subscription-cancellation-refund-records/",
    "/guides/familyboard-offline-backup-restore/",
    "/guides/household-admin-day/",
    "/guides/service-provider-contact-list/",
    "/guides/household-shopping-staples/",
    "/zh-tw/guides/household-admin-day/",
    "/zh-tw/guides/service-provider-contact-list/",
    "/zh-tw/guides/household-shopping-staples/",
    "/features/local-first-home-organizer/",
    "/features/no-account-family-organizer/",
    "/features/household-operations-system/",
    "/zh-tw/features/local-first-home-organizer/",
    "/zh-tw/features/no-account-family-organizer/",
    "/zh-tw/features/household-operations-system/",
    "/zh-tw/guides/home-purchase-records/",
    "/zh-tw/guides/familyboard-warranty-expiration-calculator-tutorial/",
    "/zh-tw/guides/familyboard-household-subscription-cost-calculator-tutorial/",
    "/features/home-record-keeper/",
    "/zh-tw/features/home-record-keeper/",
    "/guides/household-handoff/",
    "/zh-tw/guides/household-handoff/",
    "/features/household-handoff/",
    "/tools/household-meeting-agenda-action-log/",
    "/tools/household-pantry-expiry-review-log/",
    "/tools/household-clothing-care-repair-log/",
    "/tools/household-meal-prep-role-log/",
    "/tools/household-trip-packing-handoff-log/",
    "/tools/move-in-checklist-generator/",
    "/tools/move-out-condition-record-generator/",
    "/tools/vacation-shutdown-checklist-generator/",
    "/tools/important-household-document-review/",
    "/tools/appliance-maintenance-checklist-generator/",
    "/tools/receipt-retention-organizer/",
    "/tools/household-bill-source-status-log/",
    "/tools/household-share-access-review-log/",
    "/tools/household-inventory-photo-capture-log/",
    "/tools/household-document-renewal-review-log/",
    "/tools/household-internet-incident-review-log/",
    "/tools/household-meter-reading-review-log/",
    "/tools/household-accessibility-walkthrough-log/",
    "/tools/household-recycling-handoff-log/",
    "/tools/household-donation-handoff-log/",
    "/tools/household-mail-package-handoff-log/",
    "/tools/household-plant-care-handoff-log/",
    "/tools/household-guest-arrival-prep-log/",
    "/tools/household-school-pickup-handoff-log/",
    "/tools/household-return-handoff-log/",
    "/tools/household-subscription-cancellation-handoff-log/",
    "/tools/household-service-appointment-handoff-log/",
    "/tools/household-weekly-reset-action-log/",
    "/tools/household-monthly-review-action-log/",
    "/tools/household-school-activity-handoff-log/",
    "/tools/household-home-access-handoff-log/",
    "/tools/household-schedule-conflict-review-log/",
    "/tools/household-maintenance-priority-review-log/",
    "/tools/household-maintenance-delegation-map/",
    "/tools/household-service-quote-comparison-log/",
    "/guides/familyboard-family-display-mode-setup/",
    "/guides/familyboard-browser-storage-maintenance/",
    "/guides/familyboard-seasonal-reset-tutorial/",
    "/guides/familyboard-device-retirement-tutorial/",
    "/guides/familyboard-shopping-list-planner-tutorial/",
    "/guides/familyboard-household-meeting-tutorial/",
    "/guides/familyboard-weekly-reset-action-tutorial/",
    "/guides/familyboard-school-closure-continuity-tutorial/",
    "/guides/familyboard-household-account-list-tutorial/",
    "/guides/familyboard-accessibility-walkthrough-tutorial/",
    "/guides/familyboard-household-handoff-tutorial/",
    "/guides/familyboard-insurance-claim-timeline-tutorial/",
    "/guides/familyboard-record-retrieval-drill-tutorial/",
    "/guides/familyboard-utility-provider-handoff-tutorial/",
    "/guides/familyboard-repair-punch-list-tutorial/",
    "/guides/familyboard-product-recall-action-tutorial/",
    "/guides/familyboard-home-maintenance-schedule-generator-tutorial/",
    "/guides/familyboard-household-decision-register-tutorial/",
    "/guides/monthly-home-maintenance-checklist/",
    "/guides/quarterly-home-maintenance-checklist/",
    "/guides/seasonal-home-maintenance-checklist/",
    "/guides/spring-home-maintenance-checklist/",
    "/guides/summer-home-maintenance-checklist/",
    "/guides/fall-home-maintenance-checklist/",
    "/guides/first-time-homeowner-maintenance-guide/",
    "/guides/apartment-maintenance-checklist/",
    "/guides/condo-maintenance-checklist/",
    "/guides/rental-home-maintenance-log/",
    "/guides/home-maintenance-records/",
    "/guides/home-repair-history/",
    "/guides/winter-home-maintenance-checklist/",
    "/guides/preventive-home-maintenance/",
    "/guides/maintenance-priorities/",
    "/guides/refrigerator-maintenance-checklist/",
    "/guides/freezer-maintenance-checklist/",
    "/guides/washing-machine-maintenance-checklist/",
    "/guides/home-maintenance-binder/",
    "/guides/home-maintenance-budget/",
    "/guides/home-maintenance-reminders/",
    "/guides/home-maintenance-after-vacation/",
    "/guides/move-in-maintenance-checklist/",
    "/guides/annual-home-review/",
    "/guides/dryer-maintenance-checklist/",
    "/guides/dishwasher-maintenance-checklist/",
    "/guides/oven-maintenance-checklist/",
    "/guides/home-maintenance-delegation/",
    "/guides/range-hood-maintenance-checklist/",
    "/guides/air-conditioner-maintenance-checklist/",
    "/guides/familyboard-utility-provider-handoff-tutorial/",
    "/guides/familyboard-vehicle-document-source-status-tutorial/",
    "/guides/familyboard-record-retrieval-drill-tutorial/",
    "/guides/familyboard-emergency-contact-verification-tutorial/",
    "/guides/familyboard-vehicle-document-source-status-tutorial/",
    "/guides/familyboard-repair-punch-list-tutorial/",
    "/guides/familyboard-product-recall-action-tutorial/",
    "/guides/familyboard-home-maintenance-schedule-generator-tutorial/",
    "/guides/familyboard-warranty-expiration-calculator-tutorial/",
    "/guides/familyboard-household-subscription-cost-calculator-tutorial/",
    "/guides/familyboard-free-home-management-app-tutorial/",
    "/guides/familyboard-private-family-organizer-tutorial/",
    "/guides/familyboard-home-dashboard-weekly-review-tutorial/",
    "/guides/familyboard-master-csv-edit-import/",
    "/guides/familyboard-maintenance-history-review/",
    "/guides/familyboard-subscription-renewal-review/",
    "/guides/familyboard-household-members-responsibilities-tutorial/",
    "/guides/familyboard-documents-source-review-tutorial/",
    "/guides/familyboard-emergency-information-privacy-tutorial/",
    "/guides/familyboard-backup-recovery-checker-tutorial/",
    "/guides/familyboard-event-duration-calculator-tutorial/",
    "/guides/familyboard-emergency-contact-verification-tutorial/",
    "/guides/familyboard-household-responsibility-coverage-tutorial/",
    "/guides/familyboard-replacement-part-source-check-tutorial/",
    "/guides/familyboard-guest-arrival-prep-tutorial/",
    "/guides/familyboard-donation-handoff-tutorial/",
    "/guides/familyboard-household-admin-backup-tutorial/",
    "/guides/familyboard-mail-package-handoff-tutorial/",
    "/guides/familyboard-plant-care-handoff-tutorial/",
    "/guides/familyboard-recycling-handoff-tutorial/",
    "/guides/familyboard-household-return-handoff-tutorial/",
    "/guides/familyboard-school-pickup-handoff-tutorial/",
    "/guides/familyboard-service-appointment-handoff-tutorial/",
    "/guides/familyboard-subscription-cancellation-handoff-tutorial/",
    "/guides/familyboard-school-activity-handoff-tutorial/",
    "/guides/familyboard-monthly-review-action-tutorial/",
    "/guides/familyboard-router-support-review-tutorial/",
    "/guides/familyboard-trip-handoff-tutorial/",
    "/guides/familyboard-meal-prep-tutorial/",
    "/tools/household-seasonal-reset-action-log/",
    "/tools/household-device-retirement-handoff-log/",
    "/tools/household-router-support-review-log/",
    "/tools/household-shopping-list-planner/",
    "/tools/household-account-list/",
    "/tools/household-responsibility-coverage-map/",
    "/tools/household-replacement-part-source-check-log/",
    "/tools/household-consumable-change-history-log/",
    "/tools/household-repair-evidence-timeline-log/",
    "/tools/household-insurance-claim-timeline-log/",
    "/tools/household-building-notice-response-log/",
    "/tools/rental-repair-request-log/",
    "/tools/household-school-closure-continuity-log/",
    "/tools/appliance-age-calculator/",
    "/tools/move-out-condition-record-generator/",
    "/tools/home-emergency-drill-record-generator/",
    "/tools/emergency-supply-inventory-audit/",
    "/tools/emergency-contact-verification-log/",
    "/tools/household-power-outage-event-log/",
    "/guides/power-outage-home-preparedness/",
    "/guides/familyboard-power-outage-event-log-tutorial/",
    "/guides/familyboard-water-leak-event-log-tutorial/",
    "/tools/household-water-leak-event-log/",
    "/tools/household-event-duration-calculator/",
    "/tools/household-event-source-index-log/",
    "/guides/familyboard-event-source-index-tutorial/",
    "/guides/familyboard-bill-review-tutorial/",
    "/guides/familyboard-internet-incident-tutorial/",
    "/guides/familyboard-meter-reading-tutorial/",
    "/guides/familyboard-share-access-tutorial/",
    "/guides/familyboard-photo-inventory-tutorial/",
    "/guides/familyboard-document-renewal-tutorial/",
    "/guides/familyboard-building-notice-response-tutorial/",
    "/guides/familyboard-rental-repair-request-tutorial/",
    "/guides/familyboard-repair-evidence-timeline-tutorial/",
    "/guides/familyboard-consumable-change-history-tutorial/",
    "/guides/familyboard-clothing-care-tutorial/",
    "/guides/familyboard-pantry-review-tutorial/",
    "/guides/familyboard-home-access-handoff-tutorial/",
    "/guides/familyboard-schedule-conflict-review-tutorial/",
    "/guides/familyboard-maintenance-priority-review-tutorial/",
    "/guides/familyboard-service-quote-comparison-tutorial/",
    "/guides/familyboard-old-tablet-display-tutorial/",
    "/guides/familyboard-browser-storage-cleanup-tutorial/",
    "/guides/water-leak-response-home-records/",
    "/tools/household-storm-readiness-review/",
    "/guides/storm-preparation-home-checklist/",
    "/tools/home-service-provider-verification-log/",
    "/guides/home-service-provider-list/",
    "/tools/home-repair-change-order-log/",
    "/guides/contractor-records/",
    "/tools/home-repair-punch-list/",
    "/guides/renovation-records/",
    "/tools/home-repair-closeout-checklist/",
    "/guides/home-improvement-receipts/",
    "/tools/warranty-claim-evidence-log/",
    "/guides/how-to-track-product-warranties/",
    "/tools/product-recall-action-log/",
    "/guides/product-registration-tracker/",
    "/tools/appliance-service-visit-log/",
    "/guides/service-history/",
    "/tools/appliance-repair-callback-log/",
    "/guides/repair-history/",
    "/tools/appliance-purchase-installation-record/",
    "/tools/purchase-delivery-evidence-log/",
    "/tools/moving-box-handover-log/",
    "/guides/moving-inventory/",
    "/tools/storage-unit-access-inventory-log/",
    "/guides/storage-unit-inventory/",
    "/tools/household-record-retrieval-drill-log/",
    "/guides/digital-home-binder/",
    "/tools/important-household-document-review/",
    "/guides/important-household-documents/",
    "/tools/household-record-retention-decision-log/",
    "/guides/how-long-to-keep-household-records/",
    "/tools/appliance-manual-source-check-log/",
    "/guides/organize-appliance-manuals/",
    "/tools/household-insurance-policy-source-version-log/",
    "/guides/organize-insurance-documents/",
    "/tools/household-utility-provider-service-handoff-log/",
    "/guides/organize-utility-account-information/",
    "/tools/caregiver-handoff-source-authorization-log/",
    "/tools/home-care-visit-scope-service-result-log/",
    "/tools/home-care-service-plan-change-notice-log/",
    "/tools/home-care-service-interruption-backup-continuity-log/",
    "/tools/home-care-complaint-response-resolution-log/",
    "/tools/home-care-charge-service-payment-discrepancy-log/",
    "/tools/home-care-payment-refund-collection-notice-log/",
    "/tools/rental-security-deposit-move-out-claim-log/",
    "/guides/caregiver-handoff-checklist/",
    "/guides/purchase-receipt-organizer/",
    "/guides/appliance-inventory/",
    "/templates/printable-home-inventory-template/",
    "/checklists/printable-home-maintenance-checklist/",
    "/zh-tw/checklists/printable-home-maintenance-checklist/",
    "/zh-tw/templates/printable-home-inventory-template/",
    "/templates/printable-household-handoff-sheet/",
    "/zh-tw/templates/printable-household-handoff-sheet/",
    "/pricing/",
    "/zh-tw/",
    "/zh-tw/guides/home-maintenance-schedule/",
    "/zh-tw/guides/subscription-cancellation-refund-records/",
    "/zh-tw/guides/automatic-renewal-charge-dispute-taiwan/",
    "/zh-tw/guides/familyboard-offline-backup-restore/",
    "/zh-tw/guides/familyboard-household-handoff-tutorial/",
    "/zh-tw/tools/household-meeting-agenda-action-log/",
    "/zh-tw/tools/household-pantry-expiry-review-log/",
    "/zh-tw/tools/household-clothing-care-repair-log/",
    "/zh-tw/tools/household-meal-prep-role-log/",
    "/zh-tw/tools/household-trip-packing-handoff-log/",
    "/zh-tw/tools/move-in-checklist-generator/",
    "/zh-tw/tools/move-out-condition-record-generator/",
    "/zh-tw/tools/vacation-shutdown-checklist-generator/",
    "/zh-tw/tools/important-household-document-review/",
    "/zh-tw/tools/appliance-maintenance-checklist-generator/",
    "/zh-tw/tools/receipt-retention-organizer/",
    "/zh-tw/tools/household-bill-source-status-log/",
    "/zh-tw/tools/household-share-access-review-log/",
    "/zh-tw/tools/household-inventory-photo-capture-log/",
    "/zh-tw/tools/household-document-renewal-review-log/",
    "/zh-tw/tools/household-internet-incident-review-log/",
    "/zh-tw/tools/household-meter-reading-review-log/",
    "/zh-tw/tools/household-accessibility-walkthrough-log/",
    "/zh-tw/tools/household-recycling-handoff-log/",
    "/zh-tw/tools/household-donation-handoff-log/",
    "/zh-tw/tools/household-mail-package-handoff-log/",
    "/zh-tw/tools/household-plant-care-handoff-log/",
    "/zh-tw/tools/household-guest-arrival-prep-log/",
    "/zh-tw/tools/household-school-pickup-handoff-log/",
    "/zh-tw/tools/household-return-handoff-log/",
    "/zh-tw/tools/household-subscription-cancellation-handoff-log/",
    "/zh-tw/tools/household-service-appointment-handoff-log/",
    "/zh-tw/tools/household-weekly-reset-action-log/",
    "/zh-tw/tools/household-monthly-review-action-log/",
    "/zh-tw/tools/household-school-activity-handoff-log/",
    "/zh-tw/tools/household-home-access-handoff-log/",
    "/zh-tw/tools/household-schedule-conflict-review-log/",
    "/zh-tw/tools/household-maintenance-priority-review-log/",
    "/zh-tw/tools/household-maintenance-delegation-map/",
    "/zh-tw/tools/household-service-quote-comparison-log/",
    "/zh-tw/guides/familyboard-family-display-mode-setup/",
    "/zh-tw/guides/familyboard-browser-storage-maintenance/",
    "/zh-tw/tools/household-seasonal-reset-action-log/",
    "/zh-tw/guides/familyboard-seasonal-reset-tutorial/",
    "/zh-tw/tools/household-device-retirement-handoff-log/",
    "/zh-tw/guides/familyboard-device-retirement-tutorial/",
    "/zh-tw/tools/household-router-support-review-log/",
    "/zh-tw/guides/familyboard-router-support-review-tutorial/",
    "/zh-tw/tools/household-shopping-list-planner/",
    "/zh-tw/tools/household-account-list/",
    "/zh-tw/guides/familyboard-shopping-list-planner-tutorial/",
    "/zh-tw/guides/familyboard-household-account-list-tutorial/",
    "/zh-tw/tools/household-responsibility-coverage-map/",
    "/zh-tw/guides/familyboard-household-responsibility-coverage-tutorial/",
    "/zh-tw/tools/household-replacement-part-source-check-log/",
    "/zh-tw/guides/familyboard-replacement-part-source-check-tutorial/",
    "/zh-tw/tools/household-consumable-change-history-log/",
    "/zh-tw/guides/familyboard-consumable-change-history-tutorial/",
    "/zh-tw/tools/household-repair-evidence-timeline-log/",
    "/zh-tw/tools/household-insurance-claim-timeline-log/",
    "/zh-tw/tools/household-decision-register/",
    "/zh-tw/tools/household-backup-recovery-checker/",
    "/zh-tw/tools/household-utility-bill-anomaly-log/",
    "/zh-tw/tools/household-time-window-overlap-checker/",
    "/zh-tw/tools/household-building-notice-response-log/",
    "/zh-tw/tools/rental-repair-request-log/",
    "/zh-tw/tools/household-school-closure-continuity-log/",
    "/zh-tw/guides/familyboard-repair-evidence-timeline-tutorial/",
    "/zh-tw/guides/household-admin-backup-person/",
    "/zh-tw/guides/home-contact-list/",
    "/zh-tw/guides/familyboard-household-admin-backup-tutorial/",
    "/zh-tw/guides/household-supplies-inventory/",
    "/zh-tw/guides/household-monthly-review/",
    "/zh-tw/guides/home-maintenance-calendar/",
    "/zh-tw/guides/household-account-list/",
    "/zh-tw/guides/annual-renewal-calendar/",
    "/zh-tw/guides/household-management-checklist/",
    "/zh-tw/guides/familyboard-household-meeting-tutorial/",
    "/zh-tw/guides/familyboard-pantry-review-tutorial/",
    "/zh-tw/guides/familyboard-clothing-care-tutorial/",
    "/zh-tw/guides/familyboard-meal-prep-tutorial/",
    "/zh-tw/guides/familyboard-trip-handoff-tutorial/",
    "/zh-tw/guides/familyboard-bill-review-tutorial/",
    "/zh-tw/guides/familyboard-share-access-tutorial/",
    "/zh-tw/guides/familyboard-photo-inventory-tutorial/",
    "/zh-tw/guides/familyboard-document-renewal-tutorial/",
    "/zh-tw/guides/familyboard-internet-incident-tutorial/",
    "/zh-tw/guides/familyboard-meter-reading-tutorial/",
    "/zh-tw/guides/familyboard-accessibility-walkthrough-tutorial/",
    "/zh-tw/guides/familyboard-recycling-handoff-tutorial/",
    "/zh-tw/guides/familyboard-donation-handoff-tutorial/",
    "/zh-tw/guides/familyboard-mail-package-handoff-tutorial/",
    "/zh-tw/guides/familyboard-plant-care-handoff-tutorial/",
    "/zh-tw/guides/familyboard-guest-arrival-prep-tutorial/",
    "/zh-tw/guides/familyboard-school-pickup-handoff-tutorial/",
    "/zh-tw/guides/familyboard-household-return-handoff-tutorial/",
    "/zh-tw/guides/familyboard-subscription-cancellation-handoff-tutorial/",
    "/zh-tw/guides/familyboard-service-appointment-handoff-tutorial/",
    "/zh-tw/guides/familyboard-weekly-reset-action-tutorial/",
    "/zh-tw/guides/familyboard-monthly-review-action-tutorial/",
    "/zh-tw/guides/familyboard-school-activity-handoff-tutorial/",
    "/zh-tw/guides/familyboard-home-access-handoff-tutorial/",
    "/zh-tw/guides/familyboard-schedule-conflict-review-tutorial/",
    "/zh-tw/guides/familyboard-maintenance-priority-review-tutorial/",
    "/zh-tw/guides/familyboard-service-quote-comparison-tutorial/",
    "/zh-tw/guides/familyboard-old-tablet-display-tutorial/",
    "/zh-tw/guides/familyboard-browser-storage-cleanup-tutorial/",
    "/zh-tw/guides/familyboard-free-home-management-app-tutorial/",
    "/zh-tw/guides/familyboard-private-family-organizer-tutorial/",
    "/zh-tw/guides/familyboard-home-dashboard-weekly-review-tutorial/",
    "/zh-tw/guides/familyboard-master-csv-edit-import/",
    "/zh-tw/guides/familyboard-maintenance-history-review/",
    "/zh-tw/guides/familyboard-subscription-renewal-review/",
    "/zh-tw/guides/familyboard-household-members-responsibilities-tutorial/",
    "/zh-tw/guides/familyboard-documents-source-review-tutorial/",
    "/zh-tw/guides/familyboard-emergency-information-privacy-tutorial/",
    "/zh-tw/guides/familyboard-backup-recovery-checker-tutorial/",
    "/zh-tw/guides/familyboard-event-duration-calculator-tutorial/",
    "/zh-tw/guides/familyboard-emergency-contact-verification-tutorial/",
    "/zh-tw/guides/familyboard-vehicle-document-source-status-tutorial/",
    "/zh-tw/guides/familyboard-record-retrieval-drill-tutorial/",
    "/zh-tw/guides/familyboard-utility-provider-handoff-tutorial/",
    "/zh-tw/guides/familyboard-repair-punch-list-tutorial/",
    "/zh-tw/guides/familyboard-product-recall-action-tutorial/",
    "/zh-tw/guides/familyboard-home-maintenance-schedule-generator-tutorial/",
    "/zh-tw/guides/familyboard-household-decision-register-tutorial/",
    "/zh-tw/guides/monthly-home-maintenance-checklist/",
    "/zh-tw/guides/quarterly-home-maintenance-checklist/",
    "/zh-tw/guides/seasonal-home-maintenance-checklist/",
    "/zh-tw/guides/spring-home-maintenance-checklist/",
    "/zh-tw/guides/summer-home-maintenance-checklist/",
    "/zh-tw/guides/fall-home-maintenance-checklist/",
    "/zh-tw/guides/first-time-homeowner-maintenance-guide/",
    "/zh-tw/guides/apartment-maintenance-checklist/",
    "/zh-tw/guides/condo-maintenance-checklist/",
    "/zh-tw/guides/rental-home-maintenance-log/",
    "/zh-tw/guides/home-maintenance-records/",
    "/zh-tw/guides/home-repair-history/",
    "/zh-tw/guides/winter-home-maintenance-checklist/",
    "/zh-tw/guides/preventive-home-maintenance/",
    "/zh-tw/guides/maintenance-priorities/",
    "/zh-tw/guides/refrigerator-maintenance-checklist/",
    "/zh-tw/guides/freezer-maintenance-checklist/",
    "/zh-tw/guides/washing-machine-maintenance-checklist/",
    "/zh-tw/guides/home-maintenance-binder/",
    "/zh-tw/guides/home-maintenance-budget/",
    "/zh-tw/guides/home-maintenance-reminders/",
    "/zh-tw/guides/home-maintenance-after-vacation/",
    "/zh-tw/guides/move-in-maintenance-checklist/",
    "/zh-tw/guides/annual-home-review/",
    "/zh-tw/guides/dryer-maintenance-checklist/",
    "/zh-tw/guides/dishwasher-maintenance-checklist/",
    "/zh-tw/guides/oven-maintenance-checklist/",
    "/zh-tw/guides/home-maintenance-delegation/",
    "/zh-tw/guides/range-hood-maintenance-checklist/",
    "/zh-tw/guides/air-conditioner-maintenance-checklist/",
    "/zh-tw/guides/microwave-maintenance-checklist/",
    "/zh-tw/guides/hvac-filter-tracker/",
    "/zh-tw/guides/furnace-maintenance-records/",
    "/zh-tw/guides/heat-pump-maintenance-records/",
    "/zh-tw/guides/water-heater-maintenance-records/",
    "/zh-tw/guides/dehumidifier-maintenance-records/",
    "/zh-tw/guides/air-purifier-filter-log/",
    "/zh-tw/guides/solar-panel-maintenance-records/",
    "/zh-tw/guides/smoke-alarm-records/",
    "/zh-tw/guides/fire-extinguisher-records/",
    "/zh-tw/guides/carbon-monoxide-alarm-records/",
    "/zh-tw/guides/humidifier-maintenance-guide/",
    "/zh-tw/guides/ceiling-fan-maintenance-checklist/",
    "/zh-tw/guides/bathroom-exhaust-fan-maintenance-checklist/",
    "/zh-tw/guides/water-softener-maintenance-records/",
    "/zh-tw/guides/ups-battery-backup-records/",
    "/zh-tw/guides/wifi-router-maintenance-records/",
    "/zh-tw/guides/water-filter-replacement-guide/",
    "/zh-tw/guides/coffee-maker-maintenance-guide/",
    "/zh-tw/guides/robot-vacuum-maintenance-guide/",
    "/zh-tw/guides/garbage-disposal-maintenance-guide/",
    "/zh-tw/guides/vacuum-cleaner-maintenance-guide/",
    "/zh-tw/guides/home-inventory-for-insurance/",
    "/zh-tw/guides/air-purifier-maintenance-guide/",
    "/zh-tw/guides/dehumidifier-maintenance-guide/",
    "/zh-tw/guides/home-inventory-checklist/",
    "/zh-tw/guides/photo-home-inventory/",
    "/zh-tw/guides/valuable-item-inventory/",
    "/zh-tw/guides/serial-number-tracker/",
    "/zh-tw/guides/electronics-inventory/",
    "/zh-tw/guides/warranty-expiration/",
    "/zh-tw/guides/appliance-lifespan-planning/",
    "/zh-tw/guides/travel-household-handoff/",
    "/zh-tw/guides/house-sitter-information/",
    "/zh-tw/guides/pet-sitter-information/",
    "/zh-tw/guides/household-replacement-reserve/",
    "/zh-tw/guides/emergency-binder/",
    "/zh-tw/guides/family-continuity-plan/",
    "/zh-tw/guides/utility-shutoff-information/",
    "/zh-tw/guides/divide-household-responsibilities/",
    "/zh-tw/guides/family-chore-system/",
    "/zh-tw/guides/household-weekly-reset/",
    "/zh-tw/guides/recurring-bills-tracker/",
    "/zh-tw/guides/pantry-restock-system/",
    "/zh-tw/guides/deep-cleaning-tracker/",
    "/zh-tw/guides/guest-preparation-checklist/",
    "/zh-tw/guides/vacation-home-shutdown-checklist/",
    "/zh-tw/guides/returning-home-after-travel-checklist/",
    "/zh-tw/guides/new-home-setup-checklist/",
    "/zh-tw/guides/moving-house-organizer/",
    "/zh-tw/features/free-home-management-app/",
    "/zh-tw/tools/warranty-expiration-calculator/",
    "/zh-tw/tools/home-maintenance-schedule-generator/",
    "/zh-tw/tools/household-subscription-cost-calculator/",
    "/zh-tw/tools/emergency-contact-sheet-generator/",
    "/zh-tw/tools/appliance-age-calculator/",
    "/zh-tw/tools/home-maintenance-cost-tracker/",
    "/zh-tw/tools/home-repair-cost-log/",
    "/zh-tw/tools/home-service-reminder-generator/",
    "/zh-tw/tools/receipt-retention-organizer/",
    "/zh-tw/tools/household-annual-review-generator/",
    "/zh-tw/tools/move-in-checklist-generator/",
    "/zh-tw/tools/move-out-condition-record-generator/",
    "/zh-tw/tools/home-emergency-drill-record-generator/",
    "/zh-tw/tools/emergency-supply-inventory-audit/",
    "/zh-tw/tools/emergency-contact-verification-log/",
    "/zh-tw/tools/household-power-outage-event-log/",
    "/zh-tw/tools/household-water-leak-event-log/",
    "/zh-tw/tools/household-storm-readiness-review/",
    "/zh-tw/tools/home-service-provider-verification-log/",
    "/zh-tw/guides/home-service-provider-list/",
    "/zh-tw/tools/home-repair-change-order-log/",
    "/zh-tw/guides/contractor-records/",
    "/zh-tw/tools/home-repair-punch-list/",
    "/zh-tw/guides/renovation-records/",
    "/zh-tw/tools/home-repair-closeout-checklist/",
    "/zh-tw/guides/home-improvement-receipts/",
    "/zh-tw/tools/warranty-claim-evidence-log/",
    "/zh-tw/guides/how-to-track-product-warranties/",
    "/zh-tw/tools/product-recall-action-log/",
    "/zh-tw/guides/product-registration-tracker/",
    "/zh-tw/tools/appliance-service-visit-log/",
    "/zh-tw/guides/service-history/",
    "/zh-tw/tools/appliance-repair-callback-log/",
    "/zh-tw/guides/repair-history/",
    "/zh-tw/tools/appliance-purchase-installation-record/",
    "/zh-tw/tools/purchase-delivery-evidence-log/",
    "/zh-tw/tools/moving-box-handover-log/",
    "/zh-tw/guides/moving-inventory/",
    "/zh-tw/tools/storage-unit-access-inventory-log/",
    "/zh-tw/guides/storage-unit-inventory/",
    "/zh-tw/tools/household-record-retrieval-drill-log/",
    "/zh-tw/guides/digital-home-binder/",
    "/zh-tw/tools/important-household-document-review/",
    "/zh-tw/guides/important-household-documents/",
    "/zh-tw/tools/household-record-retention-decision-log/",
    "/zh-tw/guides/how-long-to-keep-household-records/",
    "/zh-tw/tools/appliance-manual-source-check-log/",
    "/zh-tw/guides/organize-appliance-manuals/",
    "/zh-tw/tools/household-insurance-policy-source-version-log/",
    "/zh-tw/guides/organize-insurance-documents/",
    "/zh-tw/tools/household-utility-provider-service-handoff-log/",
    "/zh-tw/guides/organize-utility-account-information/",
    "/zh-tw/tools/caregiver-handoff-source-authorization-log/",
    "/zh-tw/tools/home-care-visit-scope-service-result-log/",
    "/zh-tw/guides/home-care-service-visit-records/",
    "/zh-tw/tools/home-care-service-plan-change-notice-log/",
    "/zh-tw/guides/home-care-service-plan-changes/",
    "/zh-tw/tools/home-care-service-interruption-backup-continuity-log/",
    "/zh-tw/guides/home-care-service-interruption-backup-plan/",
    "/zh-tw/tools/home-care-complaint-response-resolution-log/",
    "/zh-tw/guides/home-care-service-complaint-resolution/",
    "/zh-tw/tools/home-care-charge-service-payment-discrepancy-log/",
    "/zh-tw/tools/home-care-payment-refund-collection-notice-log/",
    "/zh-tw/tools/rental-security-deposit-move-out-claim-log/",
    "/zh-tw/guides/home-care-service-fees-and-billing/",
    "/zh-tw/guides/home-care-refund-and-collection-notices/",
    "/zh-tw/guides/rental-security-deposit-move-out-claims/",
    "/zh-tw/guides/caregiver-handoff-checklist/",
    "/zh-tw/guides/purchase-receipt-organizer/",
    "/zh-tw/guides/appliance-inventory/",
    "/zh-tw/guides/computer-electronics-inventory/",
    "/zh-tw/guides/furniture-inventory/",
    "/zh-tw/tools/vacation-shutdown-checklist-generator/",
    "/zh-tw/tools/house-sitter-instruction-generator/",
    "/zh-tw/tools/pet-sitter-instruction-generator/",
    "/zh-tw/tools/home-handoff-summary-generator/",
    "/zh-tw/tools/annual-subscription-cost-calculator/",
    "/zh-tw/tools/emergency-binder-generator/",
    "/zh-tw/tools/cleaning-schedule-generator/",
    "/zh-tw/tools/appliance-replacement-planner/",
    "/zh-tw/tools/room-inventory-generator/",
    "/zh-tw/tools/warranty-checklist-generator/",
    "/zh-tw/tools/recurring-chore-planner/",
    "/zh-tw/tools/home-inventory-checklist-generator/",
    "/zh-tw/tools/household-document-index-generator/",
    "/zh-tw/tools/appliance-maintenance-checklist-generator/",
    "/zh-tw/privacy/",
    "/zh-tw/security/",
    "/zh-tw/affiliate-disclosure/",
    "/zh-tw/terms/",
    "/zh-tw/editorial-policy/",
    "/zh-tw/disclaimer/",
    "/zh-tw/about/",
    "/zh-tw/guides/digital-home-inventory-backup/",
    "/zh-tw/guides/move-out-home-records/",
    "/zh-tw/guides/home-evacuation-information/",
    "/zh-tw/guides/emergency-supply-inventory/",
    "/zh-tw/guides/emergency-information-sheet/",
    "/zh-tw/guides/power-outage-home-preparedness/",
    "/zh-tw/guides/water-leak-response-home-records/",
    "/zh-tw/guides/storm-preparation-home-checklist/",
    "/zh-tw/guides/home-maintenance-log/",
    "/zh-tw/guides/appliance-replacement-planning/",
    "/zh-tw/guides/room-by-room-home-inventory/",
    "/zh-tw/guides/cleaning-schedule/",
    "/zh-tw/features/household-handoff/",
    "/features/",
    "/zh-tw/features/",
    "/checklists/printable-monthly-home-checklist/",
    "/zh-tw/checklists/printable-monthly-home-checklist/",
    "/checklists/printable-seasonal-home-checklist/",
    "/zh-tw/checklists/printable-seasonal-home-checklist/",
    "/checklists/printable-emergency-binder-checklist/",
    "/zh-tw/checklists/printable-emergency-binder-checklist/",
    "/checklists/printable-moving-checklist/",
    "/zh-tw/checklists/printable-moving-checklist/",
    "/checklists/printable-pet-sitter-checklist/",
    "/zh-tw/checklists/printable-pet-sitter-checklist/",
    "/templates/printable-service-provider-list/",
    "/zh-tw/templates/printable-service-provider-list/",
    "/templates/printable-emergency-contacts/",
    "/zh-tw/templates/printable-emergency-contacts/",
    "/templates/",
    "/zh-tw/templates/",
    "/templates/printable-household-contacts/",
    "/zh-tw/templates/printable-household-contacts/",
    "/templates/printable-cleaning-schedule/",
    "/zh-tw/templates/printable-cleaning-schedule/",
    "/templates/printable-chore-chart/",
    "/zh-tw/templates/printable-chore-chart/",
    "/checklists/printable-house-sitter-checklist/",
    "/zh-tw/checklists/printable-house-sitter-checklist/",
    "/templates/printable-subscription-tracker/",
    "/zh-tw/templates/printable-subscription-tracker/",
    "/templates/printable-annual-renewals/",
    "/zh-tw/templates/printable-annual-renewals/",
    "/zh-tw/changelog/",
    "/zh-tw/pricing/",
    "/zh-tw/roadmap/",
    "/templates/printable-appliance-inventory/",
    "/zh-tw/templates/printable-appliance-inventory/",
    "/templates/printable-warranty-tracker/",
    "/zh-tw/templates/printable-warranty-tracker/",
    "/templates/printable-repair-log/",
    "/zh-tw/templates/printable-repair-log/",
    "/guides/",
    "/zh-tw/guides/",
    "/tools/",
    "/zh-tw/tools/",
    "/checklists/",
    "/zh-tw/checklists/",
    "/guides/family-emergency-contacts/",
    "/zh-tw/guides/family-emergency-contacts/",
    "/guides/what-spouse-needs-to-know/",
    "/zh-tw/guides/what-spouse-needs-to-know/",
    "/guides/recurring-household-tasks/",
    "/zh-tw/guides/recurring-household-tasks/",
    "/guides/subscription-renewal-tracker/",
    "/zh-tw/guides/subscription-renewal-tracker/",
    "/guides/chore-chart-for-adults/",
    "/zh-tw/guides/chore-chart-for-adults/",
    "/guides/familyboard-record-linking-tutorial/",
    "/zh-tw/guides/familyboard-record-linking-tutorial/",
    "/guides/familyboard-utility-bill-difference-tutorial/",
    "/zh-tw/guides/familyboard-utility-bill-difference-tutorial/",
    "/tools/household-time-window-overlap-checker/",
    "/tools/household-date-offset-planner/",
    "/tools/household-task-load-calculator/",
    "/zh-tw/tools/household-time-window-overlap-checker/",
    "/guides/familyboard-time-window-overlap-checker-tutorial/",
    "/zh-tw/guides/familyboard-time-window-overlap-checker-tutorial/",
    "/guides/familyboard-date-offset-planner-tutorial/",
    "/zh-tw/guides/familyboard-date-offset-planner-tutorial/",
    "/guides/familyboard-appliance-age-calculator-tutorial/",
    "/zh-tw/guides/familyboard-appliance-age-calculator-tutorial/",
    "/guides/familyboard-appliance-replacement-planner-tutorial/",
    "/zh-tw/guides/familyboard-appliance-replacement-planner-tutorial/",
    "/guides/familyboard-cleaning-schedule-generator-tutorial/",
    "/zh-tw/guides/familyboard-cleaning-schedule-generator-tutorial/",
    "/editorial-policy/",
    "/zh-tw/editorial-policy/",
    "/disclaimer/",
    "/zh-tw/disclaimer/",
    "/about/",
    "/zh-tw/about/",
    "/zh-tw/features/home-inventory-tracker/",
    "/zh-tw/features/family-task-manager/",
    "/zh-tw/features/home-dashboard/",
    "/zh-tw/features/maintenance-tracker/",
    "/zh-tw/features/warranty-tracker/",
    "/zh-tw/features/household-subscription-tracker/",
    "/zh-tw/features/household-calendar/",
    "/zh-tw/features/emergency-information-organizer/",
    "/zh-tw/features/family-display-mode/",
    "/zh-tw/features/household-documents-organizer/",
    "/zh-tw/features/private-family-organizer/",
    "/zh-tw/features/offline-household-organizer/",
    "/zh-tw/guides/how-to-track-product-warranties/",
    "/zh-tw/guides/organize-household-subscriptions/",
    "/zh-tw/guides/household-documents-organizer/",
    "/zh-tw/contact/",
    "/zh-tw/app/",
  ]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((item) =>
        ["serious", "critical"].includes(item.impact || ""),
      ),
      route,
    ).toEqual([]);
  }
});

test("Traditional Chinese pages are indexable, correctly localized and functional", async ({
  page,
}) => {
  // Keep the full Traditional Chinese route matrix intact as the library
  // grows; slower CI workers need more than the original v1 ceiling.
  test.setTimeout(600_000);
  await page.goto("/zh-tw/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://familyboard.win/zh-tw/",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", "https://familyboard.win/");
  await expect(
    page.getByRole("link", { name: "Switch to English" }),
  ).toHaveAttribute("href", "/");
  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(structuredData.join(" ")).toContain('"@type":"FAQPage"');
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "隱私權政策" }),
  ).toHaveAttribute("href", "/zh-tw/privacy/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "聯絡我們" }),
  ).toHaveAttribute("href", "/zh-tw/contact/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "資安說明" }),
  ).toHaveAttribute("href", "/zh-tw/security/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "聯盟行銷揭露" }),
  ).toHaveAttribute("href", "/zh-tw/affiliate-disclosure/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "使用條款" }),
  ).toHaveAttribute("href", "/zh-tw/terms/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家電修換決策教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/appliance-replacement-planning/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家電年齡計算器教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/familyboard-appliance-age-calculator-tutorial/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家電汰換規劃器教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/familyboard-appliance-replacement-planner-tutorial/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "清潔排程產生器教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/familyboard-cleaning-schedule-generator-tutorial/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "帳單差異紀錄教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/familyboard-utility-bill-anomaly-log-tutorial/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "維護分工地圖教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/familyboard-maintenance-delegation-map-tutorial/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "文件保存決策教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/familyboard-record-retention-decision-log-tutorial/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "修繕結案清單教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/familyboard-home-repair-closeout-checklist-tutorial/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "寵物紀錄交接教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/familyboard-pet-record-source-handoff-tutorial/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "居家動線複查教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/familyboard-home-accessibility-walkthrough-log-tutorial/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭財物清冊教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/room-by-room-home-inventory/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "清潔排程教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/cleaning-schedule/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭防災演練紀錄表" }),
  ).toHaveAttribute("href", "/zh-tw/tools/home-emergency-drill-record-generator/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭避難計畫教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/home-evacuation-information/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭緊急物資盤點表" }),
  ).toHaveAttribute("href", "/zh-tw/tools/emergency-supply-inventory-audit/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "緊急避難包清單教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/emergency-supply-inventory/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "緊急聯絡資料驗證" }),
  ).toHaveAttribute("href", "/zh-tw/tools/emergency-contact-verification-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭停電事件紀錄" }),
  ).toHaveAttribute("href", "/zh-tw/tools/household-power-outage-event-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "停電紀錄 App 教學" }),
  ).toHaveAttribute(
    "href",
    "/zh-tw/guides/familyboard-power-outage-event-log-tutorial/",
  );
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "停電復電後紀錄指南" }),
  ).toHaveAttribute(
    "href",
    "/zh-tw/guides/power-outage-recovery-household-records/",
  );
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭漏水事件紀錄" }),
  ).toHaveAttribute("href", "/zh-tw/tools/household-water-leak-event-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭事件時間計算器" }),
  ).toHaveAttribute("href", "/zh-tw/tools/household-event-duration-calculator/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭事件來源索引" }),
  ).toHaveAttribute("href", "/zh-tw/tools/household-event-source-index-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "事件來源索引 App 教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/familyboard-event-source-index-tutorial/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭公告來源查核指南" }),
  ).toHaveAttribute("href", "/zh-tw/guides/household-event-source-check-taiwan/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "漏水紀錄 App 教學" }),
  ).toHaveAttribute(
    "href",
    "/zh-tw/guides/familyboard-water-leak-event-log-tutorial/",
  );
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "漏水照片證據指南" }),
  ).toHaveAttribute(
    "href",
    "/zh-tw/guides/water-leak-photo-evidence-records/",
  );
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭颱風準備複查" }),
  ).toHaveAttribute("href", "/zh-tw/tools/household-storm-readiness-review/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "到府服務商查證紀錄" }),
  ).toHaveAttribute("href", "/zh-tw/tools/home-service-provider-verification-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "居家修繕追加變更紀錄" }),
  ).toHaveAttribute("href", "/zh-tw/tools/home-repair-change-order-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "居家修繕缺失複查表" }),
  ).toHaveAttribute("href", "/zh-tw/tools/home-repair-punch-list/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "居家修繕結案資料包" }),
  ).toHaveAttribute("href", "/zh-tw/tools/home-repair-closeout-checklist/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "產品保固申請紀錄表" }),
  ).toHaveAttribute("href", "/zh-tw/tools/warranty-claim-evidence-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "產品召回處置紀錄表" }),
  ).toHaveAttribute("href", "/zh-tw/tools/product-recall-action-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家電到府維修紀錄表" }),
  ).toHaveAttribute("href", "/zh-tw/tools/appliance-service-visit-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家電維修後復發紀錄" }),
  ).toHaveAttribute("href", "/zh-tw/tools/appliance-repair-callback-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家電購買與安裝紀錄", exact: true }),
  ).toHaveAttribute("href", "/zh-tw/tools/appliance-purchase-installation-record/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "購買與到貨證據紀錄" }),
  ).toHaveAttribute("href", "/zh-tw/tools/purchase-delivery-evidence-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "搬家箱件交接紀錄" }),
  ).toHaveAttribute("href", "/zh-tw/tools/moving-box-handover-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "搬家物品清單教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/moving-inventory/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "迷你倉進出與物品紀錄" }),
  ).toHaveAttribute("href", "/zh-tw/tools/storage-unit-access-inventory-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "迷你倉物品清單教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/storage-unit-inventory/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭文件查找演練" }),
  ).toHaveAttribute("href", "/zh-tw/tools/household-record-retrieval-drill-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭數位資料夾教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/digital-home-binder/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭重要文件盤點" }),
  ).toHaveAttribute("href", "/zh-tw/tools/important-household-document-review/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭重要文件清單" }),
  ).toHaveAttribute("href", "/zh-tw/guides/important-household-documents/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭文件保存決策" }),
  ).toHaveAttribute("href", "/zh-tw/tools/household-record-retention-decision-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭文件保存期限" }),
  ).toHaveAttribute("href", "/zh-tw/guides/how-long-to-keep-household-records/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家電說明書來源核對" }),
  ).toHaveAttribute("href", "/zh-tw/tools/appliance-manual-source-check-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家電說明書整理" }),
  ).toHaveAttribute("href", "/zh-tw/guides/organize-appliance-manuals/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭保單來源與版本核對" }),
  ).toHaveAttribute("href", "/zh-tw/tools/household-insurance-policy-source-version-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "保單整理教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/organize-insurance-documents/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "水電瓦斯網路交接紀錄" }),
  ).toHaveAttribute("href", "/zh-tw/tools/household-utility-provider-service-handoff-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "水電過戶與結清教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/organize-utility-account-information/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家電清冊教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/appliance-inventory/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "網購到貨與退換貨教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/purchase-receipt-organizer/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "保固申請與追蹤教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/how-to-track-product-warranties/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "產品註冊與召回教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/product-registration-tracker/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家電到府維修教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/service-history/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家電屢修不復教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/repair-history/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "緊急聯絡資料表教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/emergency-information-sheet/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭停電準備指南" }),
  ).toHaveAttribute("href", "/zh-tw/guides/power-outage-home-preparedness/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭漏水處理指南" }),
  ).toHaveAttribute("href", "/zh-tw/guides/water-leak-response-home-records/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "家庭防颱準備指南" }),
  ).toHaveAttribute("href", "/zh-tw/guides/storm-preparation-home-checklist/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "找水電與維修業者指南" }),
  ).toHaveAttribute("href", "/zh-tw/guides/home-service-provider-list/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "裝潢驗收紀錄教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/renovation-records/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "裝潢收據整理教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/home-improvement-receipts/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "裝潢追加工程教學" }),
  ).toHaveAttribute("href", "/zh-tw/guides/contractor-records/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "可列印居家保養檢查表" }),
  ).toHaveAttribute("href", "/zh-tw/checklists/printable-home-maintenance-checklist/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "可列印家庭財物清冊" }),
  ).toHaveAttribute("href", "/zh-tw/templates/printable-home-inventory-template/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "可列印家庭交接表" }),
  ).toHaveAttribute("href", "/zh-tw/templates/printable-household-handoff-sheet/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "功能總覽" }),
  ).toHaveAttribute("href", "/zh-tw/features/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "可列印每月家庭檢查表" }),
  ).toHaveAttribute("href", "/zh-tw/checklists/printable-monthly-home-checklist/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "可列印季節家庭檢查表" }),
  ).toHaveAttribute("href", "/zh-tw/checklists/printable-seasonal-home-checklist/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "可列印家電清冊" }),
  ).toHaveAttribute("href", "/zh-tw/templates/printable-appliance-inventory/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "可列印保固追蹤表" }),
  ).toHaveAttribute("href", "/zh-tw/templates/printable-warranty-tracker/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "可列印居家修繕紀錄表" }),
  ).toHaveAttribute("href", "/zh-tw/templates/printable-repair-log/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "繁中指南中心" }),
  ).toHaveAttribute("href", "/zh-tw/guides/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "繁中工具中心" }),
  ).toHaveAttribute("href", "/zh-tw/tools/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "繁中檢查表中心" }),
  ).toHaveAttribute("href", "/zh-tw/checklists/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "繁中範本中心" }),
  ).toHaveAttribute("href", "/zh-tw/templates/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "可列印家庭聯絡表" }),
  ).toHaveAttribute("href", "/zh-tw/templates/printable-household-contacts/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "可列印看家照護清單" }),
  ).toHaveAttribute("href", "/zh-tw/checklists/printable-house-sitter-checklist/");
  await expect(
    page.locator(".site-footer").getByRole("link", { name: "更新紀錄" }),
  ).toHaveAttribute("href", "/zh-tw/changelog/");

  for (const localized of [
    {
      route: "/zh-tw/features/",
      alternate: "/features/",
      heading: "FamilyBoard 功能總覽：把家庭管理分成看得懂、接得起來的工作",
    },
    {
      route: "/zh-tw/checklists/printable-monthly-home-checklist/",
      alternate: "/checklists/printable-monthly-home-checklist/",
      heading: "可列印每月家庭檢查表：30 分鐘整理下個月真正要注意的事",
    },
    {
      route: "/zh-tw/checklists/printable-seasonal-home-checklist/",
      alternate: "/checklists/printable-seasonal-home-checklist/",
      heading: "可列印季節家庭檢查表：讓季節提醒配合住家與設備",
    },
    {
      route: "/zh-tw/templates/printable-appliance-inventory/",
      alternate: "/templates/printable-appliance-inventory/",
      heading: "可列印家電清冊：把報修時會被問的資料放在找得到的位置",
    },
    {
      route: "/zh-tw/templates/printable-warranty-tracker/",
      alternate: "/templates/printable-warranty-tracker/",
      heading: "可列印保固追蹤表：先保留證據，再把複查安排在來得及的時間",
    },
    {
      route: "/zh-tw/templates/printable-repair-log/",
      alternate: "/templates/printable-repair-log/",
      heading: "可列印居家修繕紀錄表：把「修過了」寫成下一個人看得懂的歷程",
    },
    {
      route: "/zh-tw/guides/",
      alternate: "/guides/",
      heading: "繁中家庭管理指南：從下一個真實工作開始整理",
    },
    {
      route: "/zh-tw/tools/",
      alternate: "/tools/",
      heading: "免費家庭管理工具：先解決一個小問題，再留下可查證的結果",
    },
    {
      route: "/zh-tw/checklists/",
      alternate: "/checklists/",
      heading: "繁中可列印家庭檢查表：把今天要做的事寫成能交接的清單",
    },
    {
      route: "/zh-tw/checklists/printable-emergency-binder-checklist/",
      alternate: "/checklists/printable-emergency-binder-checklist/",
      heading: "可列印家庭緊急資料夾清單：先整理分頁，再決定誰需要看什麼",
    },
    {
      route: "/zh-tw/checklists/printable-moving-checklist/",
      alternate: "/checklists/printable-moving-checklist/",
      heading: "可列印搬家檢查表：把前後兩個住家的責任交接在同一條時間線上",
    },
    {
      route: "/zh-tw/checklists/printable-pet-sitter-checklist/",
      alternate: "/checklists/printable-pet-sitter-checklist/",
      heading: "可列印寵物照護檢查表：讓照護者知道今天要做什麼、異常找誰",
    },
    {
      route: "/zh-tw/templates/",
      alternate: "/templates/",
      heading: "繁中家庭範本中心：先選一張真的會被拿起來使用的紙",
    },
    {
      route: "/zh-tw/templates/printable-service-provider-list/",
      alternate: "/templates/printable-service-provider-list/",
      heading: "可列印家庭服務商清單：記住做過什麼，不把一次合作當成永久推薦",
    },
    {
      route: "/zh-tw/templates/printable-emergency-contacts/",
      alternate: "/templates/printable-emergency-contacts/",
      heading: "可列印家庭緊急聯絡表：先排好角色與備援，再決定哪一版可以分享",
    },
    {
      route: "/zh-tw/templates/printable-household-contacts/",
      alternate: "/templates/printable-household-contacts/",
      heading: "可列印家庭聯絡表：依角色找得到人，不把整本通訊錄攤在桌上",
    },
    {
      route: "/zh-tw/templates/printable-cleaning-schedule/",
      alternate: "/templates/printable-cleaning-schedule/",
      heading: "可列印清潔排程表：先維持住家，再把工作分給真正有時間的人",
    },
    {
      route: "/zh-tw/templates/printable-chore-chart/",
      alternate: "/templates/printable-chore-chart/",
      heading: "可列印家庭家務輪值表：把責任寫清楚，而不是把提醒都放在一個人身上",
    },
    {
      route: "/zh-tw/checklists/printable-house-sitter-checklist/",
      alternate: "/checklists/printable-house-sitter-checklist/",
      heading: "可列印看家照護清單：讓短期代班者知道每天要做什麼、何時求助",
    },
    {
      route: "/zh-tw/templates/printable-subscription-tracker/",
      alternate: "/templates/printable-subscription-tracker/",
      heading: "可列印訂閱追蹤表：看見真正的年成本與下一個決策日",
    },
    {
      route: "/zh-tw/templates/printable-annual-renewals/",
      alternate: "/templates/printable-annual-renewals/",
      heading: "可列印年度續訂月曆：先看決策窗口，再處理真正的到期日",
    },
    {
      route: "/zh-tw/changelog/",
      alternate: "/changelog/",
      heading: "FamilyBoard 更新紀錄：只記錄已完成且可驗證的改變",
    },
    {
      route: "/zh-tw/pricing/",
      alternate: "/pricing/",
      heading: "FamilyBoard 免費使用：先把家庭工作整理好，不先要求付款",
    },
    {
      route: "/zh-tw/roadmap/",
      alternate: "/roadmap/",
      heading: "FamilyBoard 路線圖：先讓家庭資料可靠，再增加表面上的功能量",
    },
    {
      route: "/zh-tw/privacy/",
      alternate: "/privacy/",
      heading: "FamilyBoard 隱私權政策：公開網站與私密 App 是兩個不同空間",
    },
    {
      route: "/zh-tw/contact/",
      alternate: "/contact/",
      heading: "聯絡 FamilyBoard：先選對回報管道，也保護自己的家庭資料",
    },
    {
      route: "/zh-tw/security/",
      alternate: "/security/",
      heading: "FamilyBoard 資安說明：本機優先減少資料集中，但不等於沒有風險",
    },
    {
      route: "/zh-tw/affiliate-disclosure/",
      alternate: "/affiliate-disclosure/",
      heading: "FamilyBoard 聯盟行銷揭露：先讓你知道連結如何支持網站",
    },
    {
      route: "/zh-tw/terms/",
      alternate: "/terms/",
      heading: "FamilyBoard 使用條款：免費工具很實用，但仍有清楚的責任界線",
    },
    {
      route: "/zh-tw/editorial-policy/",
      alternate: "/editorial-policy/",
      heading: "FamilyBoard 編輯政策：每一頁都要回答一個真實的家庭問題",
    },
    {
      route: "/zh-tw/disclaimer/",
      alternate: "/disclaimer/",
      heading: "FamilyBoard 家庭資訊免責聲明：整理工具不是現場判斷",
    },
    {
      route: "/zh-tw/about/",
      alternate: "/about/",
      heading: "關於 FamilyBoard：讓家庭重要資訊有一個找得到的地方",
    },
    {
      route: "/zh-tw/checklists/printable-home-maintenance-checklist/",
      alternate: "/checklists/printable-home-maintenance-checklist/",
      heading: "可列印居家保養檢查表：先留下真正需要複查的線索",
    },
    {
      route: "/zh-tw/templates/printable-home-inventory-template/",
      alternate: "/templates/printable-home-inventory-template/",
      heading: "可列印家庭財物清冊範本：記下未來真的找得回來的資訊",
    },
    {
      route: "/zh-tw/templates/printable-household-handoff-sheet/",
      alternate: "/templates/printable-household-handoff-sheet/",
      heading: "可列印家庭交接表：讓責任換手，而不是把一堆資料丟給下一個人",
    },
    {
      route: "/zh-tw/guides/digital-home-inventory-backup/",
      alternate: "/guides/digital-home-inventory-backup/",
      heading: "FamilyBoard 備份還原教學：先證明檔案能用，再把它當成備份",
    },
    {
      route: "/zh-tw/guides/home-maintenance-log/",
      alternate: "/guides/home-maintenance-log/",
      heading: "居家保養紀錄教學：把「做過了」變成下次真的找得到的歷程",
    },
    {
      route: "/zh-tw/guides/appliance-replacement-planning/",
      alternate: "/guides/appliance-replacement-planning/",
      heading: "家電要修還是換？台灣家庭的汰換時機與查證流程",
    },
    {
      route: "/zh-tw/guides/room-by-room-home-inventory/",
      alternate: "/guides/room-by-room-home-inventory/",
      heading: "家庭財物清冊怎麼做？逐房間盤點、拍照與更新方法",
    },
    {
      route: "/zh-tw/guides/cleaning-schedule/",
      alternate: "/guides/cleaning-schedule/",
      heading: "家庭清潔排程怎麼排？依空間、時間容量與分工建立可持續週期",
    },
    {
      route: "/zh-tw/guides/move-out-home-records/",
      alternate: "/guides/move-out-home-records/",
      heading: "退租點交注意事項：把搬離住宅變成可核對、可結案的流程",
    },
    {
      route: "/zh-tw/guides/home-evacuation-information/",
      alternate: "/guides/home-evacuation-information/",
      heading: "家庭避難計畫怎麼做：先約定集合與聯絡，再用官方資訊更新路線",
    },
    {
      route: "/zh-tw/guides/emergency-supply-inventory/",
      alternate: "/guides/emergency-supply-inventory/",
      heading: "緊急避難包清單怎麼整理：從台灣官方指引變成家裡真的拿得走的物資",
    },
    {
      route: "/zh-tw/guides/emergency-information-sheet/",
      alternate: "/guides/emergency-information-sheet/",
      heading: "家庭緊急聯絡資料表怎麼做：先定義誰會看，再逐筆驗證",
    },
    {
      route: "/zh-tw/guides/power-outage-home-preparedness/",
      alternate: "/guides/power-outage-home-preparedness/",
      heading: "停電怎麼準備：台灣家庭需要的不是購物清單，而是一套可查證流程",
    },
    {
      route: "/zh-tw/guides/water-leak-response-home-records/",
      alternate: "/guides/water-leak-response-home-records/",
      heading: "家裡漏水怎麼辦：台灣家庭要先保安全，再建立可查證時間線",
    },
    {
      route: "/zh-tw/guides/storm-preparation-home-checklist/",
      alternate: "/guides/storm-preparation-home-checklist/",
      heading: "颱風來了家裡要準備什麼：台灣家庭要先對官方資訊，再做清單",
    },
    {
      route: "/zh-tw/guides/home-service-provider-list/",
      alternate: "/guides/home-service-provider-list/",
      heading: "找水電師傅或到府維修要注意什麼：先查身分、工作範圍與書面證據",
    },
    {
      route: "/zh-tw/guides/contractor-records/",
      alternate: "/guides/contractor-records/",
      heading: "裝潢追加工程怎麼記：先保留原約定，再逐筆記變更",
    },
    {
      route: "/zh-tw/features/household-handoff/",
      alternate: "/features/household-handoff/",
      heading: "家庭交接功能：從自己的紀錄產生摘要，不必另養一張過期清單",
    },
    {
      route: "/zh-tw/features/home-inventory-tracker/",
      alternate: "/features/home-inventory-tracker/",
      heading: "家庭資產清單 App 教學：先記錄「日後一定會找」的設備資料",
    },
    {
      route: "/zh-tw/features/family-task-manager/",
      alternate: "/features/family-task-manager/",
      heading: "家庭任務管理 App 教學：把「大家記得做」改成一位負責人與一個日期",
    },
    {
      route: "/zh-tw/features/home-dashboard/",
      alternate: "/features/home-dashboard/",
      heading: "家庭管理儀表板教學：先看懂數字，再決定今天要處理什麼",
    },
    {
      route: "/zh-tw/features/maintenance-tracker/",
      alternate: "/features/maintenance-tracker/",
      heading: "居家保養紀錄 App 教學：不要只排日期，要留下「真的做過」的證據",
    },
    {
      route: "/zh-tw/features/warranty-tracker/",
      alternate: "/features/warranty-tracker/",
      heading: "保固管理 App 教學：把「應該還有保固」變成可以查證的資料",
    },
    {
      route: "/zh-tw/features/household-subscription-tracker/",
      alternate: "/features/household-subscription-tracker/",
      heading: "家庭訂閱管理 App 教學：費用之外，更要知道誰負責與何時決定",
    },
    {
      route: "/zh-tw/features/household-calendar/",
      alternate: "/features/household-calendar/",
      heading: "家庭行事曆 App 教學：把到府服務與家庭時段放在真正需要的位置",
    },
    {
      route: "/zh-tw/features/emergency-information-organizer/",
      alternate: "/features/emergency-information-organizer/",
      heading: "家庭緊急聯絡人 App 教學：先讓資料找得到，再決定哪些可以交給別人",
    },
    {
      route: "/zh-tw/features/family-display-mode/",
      alternate: "/features/family-display-mode/",
      heading: "舊平板家庭電子看板教學：先釐清本機資料，再把共用畫面放上牆",
    },
    {
      route: "/zh-tw/features/household-documents-organizer/",
      alternate: "/features/household-documents-organizer/",
      heading: "家庭文件管理 App 教學：真正要管理的是「去哪裡找」，不是多複製一份檔案",
    },
    {
      route: "/zh-tw/features/private-family-organizer/",
      alternate: "/features/private-family-organizer/",
      heading: "隱私家庭管理 App：沒有雲端帳號，並不等於不用做安全管理",
    },
    {
      route: "/zh-tw/features/offline-household-organizer/",
      alternate: "/features/offline-household-organizer/",
      heading: "離線家庭管理 App 教學：不要等到停電或斷網才第一次測試",
    },
    {
      route: "/zh-tw/guides/how-to-track-product-warranties/",
      alternate: "/guides/how-to-track-product-warranties/",
      heading: "產品保固怎麼整理：先建立證據鏈，再處理報修申請",
    },
    {
      route: "/zh-tw/guides/product-registration-tracker/",
      alternate: "/guides/product-registration-tracker/",
      heading: "產品註冊與召回通知怎麼整理？台灣家庭查核流程",
    },
    {
      route: "/zh-tw/guides/service-history/",
      alternate: "/guides/service-history/",
      heading: "家電到府維修紀錄怎麼寫？預約、報價、零件與複查流程",
    },
    {
      route: "/zh-tw/guides/organize-household-subscriptions/",
      alternate: "/guides/organize-household-subscriptions/",
      heading: "家庭訂閱管理教學：在自動續約前看見費用、日期與負責人",
    },
    {
      route: "/zh-tw/guides/household-documents-organizer/",
      alternate: "/guides/household-documents-organizer/",
      heading: "家庭文件索引教學：記住原始文件在哪裡，不把 App 當成檔案庫",
    },
    {
      route: "/zh-tw/guides/household-admin-backup-person/",
      alternate: "/guides/household-admin-backup-person/",
      heading: "家庭行政備援者怎麼安排？讓家人真的接得上手",
    },
    {
      route: "/zh-tw/guides/home-contact-list/",
      alternate: "/guides/home-contact-list/",
      heading: "家庭聯絡人清單怎麼整理？把來源、用途與複查分開",
    },
    {
      route: "/zh-tw/guides/household-supplies-inventory/",
      alternate: "/guides/household-supplies-inventory/",
      heading: "家庭耗材清單怎麼做？先記「必須相容」，再記「放在哪裡」",
    },
    {
      route: "/zh-tw/guides/household-monthly-review/",
      alternate: "/guides/household-monthly-review/",
      heading: "家庭每月檢視怎麼做？把「還沒急」的事情提前看一眼",
    },
    {
      route: "/zh-tw/guides/home-maintenance-calendar/",
      alternate: "/guides/home-maintenance-calendar/",
      heading: "居家保養行事曆怎麼排？行事曆只回答「何時看」，不假裝回答「一定安全」",
    },
    {
      route: "/zh-tw/guides/household-account-list/",
      alternate: "/guides/household-account-list/",
      heading: "家庭帳戶清單怎麼整理？記錄「誰管理」，而不是複製「怎麼登入」",
    },
    {
      route: "/zh-tw/guides/annual-renewal-calendar/",
      alternate: "/guides/annual-renewal-calendar/",
      heading: "家庭年度續期行事曆怎麼做？在扣款之前，留一個真正能決定的時間",
    },
    {
      route: "/zh-tw/guides/household-management-checklist/",
      alternate: "/guides/household-management-checklist/",
      heading: "家庭管理清單怎麼列？先看五個責任區，再決定要不要建立紀錄",
    },
    {
      route: "/zh-tw/features/free-home-management-app/",
      alternate: "/features/free-home-management-app/",
      heading: "FamilyBoard 使用教學：先建立一套會持續使用的家庭管理流程",
    },
    {
      route: "/zh-tw/guides/familyboard-appliance-manual-source-check-tutorial/",
      alternate: "/guides/familyboard-appliance-manual-source-check-tutorial/",
      heading: "FamilyBoard 家電說明書來源複查教學：先對型號，再相信版本",
    },
    {
      route: "/zh-tw/guides/familyboard-appliance-service-visit-tutorial/",
      alternate: "/guides/familyboard-appliance-service-visit-tutorial/",
      heading: "FamilyBoard 家電服務到府紀錄教學：拆開範圍、發現與後續",
    },
    {
      route: "/zh-tw/guides/familyboard-appliance-repair-callback-tutorial/",
      alternate: "/guides/familyboard-appliance-repair-callback-tutorial/",
      heading: "FamilyBoard 家電維修回訪紀錄教學：症狀重現也不先猜責任",
    },
    {
      route: "/zh-tw/guides/familyboard-appliance-purchase-installation-tutorial/",
      alternate: "/guides/familyboard-appliance-purchase-installation-tutorial/",
      heading: "FamilyBoard 家電購買與安裝紀錄教學：把訂單、到貨與首次觀察分開",
    },
    {
      route: "/zh-tw/guides/familyboard-home-handoff-summary-generator-tutorial/",
      alternate: "/guides/familyboard-home-handoff-summary-generator-tutorial/",
      heading: "FamilyBoard 家庭交接摘要產生器教學：給下一個人安全的起點",
    },
    {
      route: "/zh-tw/guides/familyboard-house-sitter-instruction-generator-tutorial/",
      alternate: "/guides/familyboard-house-sitter-instruction-generator-tutorial/",
      heading: "FamilyBoard 看家照護指示產生器教學：準備清楚又保護隱私的短期交接",
    },
    {
      route: "/zh-tw/guides/familyboard-annual-subscription-cost-calculator-tutorial/",
      alternate: "/guides/familyboard-annual-subscription-cost-calculator-tutorial/",
      heading: "FamilyBoard 單一訂閱年費計算器教學：先把扣款週期換成可比較的數字",
    },
    {
      route: "/zh-tw/guides/familyboard-storage-unit-access-inventory-log-tutorial/",
      alternate: "/guides/familyboard-storage-unit-access-inventory-log-tutorial/",
      heading: "FamilyBoard 迷你倉進出與物品清冊教學：把「放在倉庫」拆成找得到的事件",
    },
    {
      route: "/zh-tw/guides/familyboard-moving-box-handover-log-tutorial/",
      alternate: "/guides/familyboard-moving-box-handover-log-tutorial/",
      heading: "FamilyBoard 搬家箱件交接紀錄教學：不要把整個搬家壓成「已送達」",
    },
    {
      route: "/zh-tw/guides/familyboard-medical-information-source-handoff-tutorial/",
      alternate: "/guides/familyboard-medical-information-source-handoff-tutorial/",
      heading: "FamilyBoard 家庭醫療資訊來源交接教學：把「在線上」變成可查找的安全路徑",
    },
    {
      route: "/zh-tw/guides/familyboard-caregiver-handoff-source-authorization-tutorial/",
      alternate: "/guides/familyboard-caregiver-handoff-source-authorization-tutorial/",
      heading: "FamilyBoard 照護者交接與授權教學：先畫清楚邊界，再交給下一個人",
    },
    {
      route: "/zh-tw/guides/familyboard-insurance-policy-source-version-tutorial/",
      alternate: "/guides/familyboard-insurance-policy-source-version-tutorial/",
      heading: "FamilyBoard 家庭保單來源與版本教學：先確定文件組，再談下一步",
    },
    {
      route: "/zh-tw/guides/familyboard-school-record-source-handoff-tutorial/",
      alternate: "/guides/familyboard-school-record-source-handoff-tutorial/",
      heading: "FamilyBoard 學校紀錄來源交接教學：把學籍、出缺席與同意文件放回正確來源",
    },
    {
      route: "/zh-tw/guides/familyboard-mail-package-handoff-log-tutorial/",
      alternate: "/guides/familyboard-mail-package-handoff-log-tutorial/",
      heading: "FamilyBoard 郵件包裹交接教學：出門期間記錄保管，不暴露地址與追蹤碼",
    },
    {
      route: "/zh-tw/guides/familyboard-plant-care-handoff-log-tutorial/",
      alternate: "/guides/familyboard-plant-care-handoff-log-tutorial/",
      heading: "FamilyBoard 植物照護交接教學：出門時記錄觀察與責任，不自行診斷",
    },
    {
      route: "/zh-tw/guides/familyboard-household-meeting-agenda-action-log-tutorial/",
      alternate: "/guides/familyboard-household-meeting-agenda-action-log-tutorial/",
      heading: "FamilyBoard 家庭會議議程與行動紀錄教學：把討論變成有人負責的下一步",
    },
    {
      route: "/zh-tw/guides/familyboard-pantry-expiry-review-log-tutorial/",
      alternate: "/guides/familyboard-pantry-expiry-review-log-tutorial/",
      heading: "FamilyBoard 食品櫃日期複查教學：記錄標示與輪替，不把日期當成安全結論",
    },
    {
      route: "/zh-tw/guides/familyboard-trip-packing-handoff-log-tutorial/",
      alternate: "/guides/familyboard-trip-packing-handoff-log-tutorial/",
      heading: "FamilyBoard 旅行打包與住家交接教學：把出發前後的責任分開記錄",
    },
    {
      route: "/zh-tw/guides/familyboard-move-in-checklist-generator-tutorial/",
      alternate: "/guides/familyboard-move-in-checklist-generator-tutorial/",
      heading: "FamilyBoard 搬入清單產生器教學：把第一天觀察留下來",
    },
    {
      route: "/zh-tw/guides/familyboard-move-out-condition-report-generator-tutorial/",
      alternate: "/guides/familyboard-move-out-condition-report-generator-tutorial/",
      heading: "FamilyBoard 搬出屋況報告產生器教學：分開記錄房間、鑰匙與交接證據",
    },
    {
      route: "/zh-tw/guides/familyboard-vacation-shutdown-checklist-generator-tutorial/",
      alternate: "/guides/familyboard-vacation-shutdown-checklist-generator-tutorial/",
      heading: "FamilyBoard 假期離家清單產生器教學：把住家交接和返家複查分開",
    },
    {
      route: "/zh-tw/guides/familyboard-important-household-document-review-tutorial/",
      alternate: "/guides/familyboard-important-household-document-review-tutorial/",
      heading: "FamilyBoard 重要家庭文件複查教學：找出缺件、版本與下一步",
    },
    {
      route: "/zh-tw/guides/familyboard-appliance-maintenance-checklist-generator-tutorial/",
      alternate: "/guides/familyboard-appliance-maintenance-checklist-generator-tutorial/",
      heading: "FamilyBoard 家電保養檢查表產生器教學：先找手冊，再安排複查",
    },
    {
      route: "/zh-tw/guides/familyboard-receipt-retention-organizer-tutorial/",
      alternate: "/guides/familyboard-receipt-retention-organizer-tutorial/",
      heading: "FamilyBoard 收據留存整理器教學：讓保固與退貨證明找得到",
    },
    {
      route: "/zh-tw/guides/familyboard-household-backup-recovery-checker-tutorial/",
      alternate: "/guides/familyboard-household-backup-recovery-checker-tutorial/",
      heading: "FamilyBoard 家庭備份復原檢查器教學：不要只看匯出日期",
    },
    {
      route: "/zh-tw/guides/familyboard-household-time-window-overlap-checker-tutorial/",
      alternate: "/guides/familyboard-household-time-window-overlap-checker-tutorial/",
      heading: "FamilyBoard 家庭時間窗口重疊檢查器教學：先算端點，再問正式來源",
    },
    {
      route: "/zh-tw/guides/familyboard-household-task-load-calculator-tutorial/",
      alternate: "/guides/familyboard-household-task-load-calculator-tutorial/",
      heading: "FamilyBoard 家庭家務負荷計算器教學：讓隱形工作可以被討論",
    },
    {
      route: "/zh-tw/guides/familyboard-household-shopping-list-planner-tutorial/",
      alternate: "/guides/familyboard-household-shopping-list-planner-tutorial/",
      heading: "FamilyBoard 家庭採買清單規劃器教學：讓補貨備忘可以被交接",
    },
    {
      route: "/zh-tw/guides/familyboard-household-responsibility-coverage-map-tutorial/",
      alternate: "/guides/familyboard-household-responsibility-coverage-map-tutorial/",
      heading: "FamilyBoard 家庭責任覆蓋地圖教學：讓交接不只靠一個人記得",
    },
    {
      route: "/zh-tw/guides/familyboard-replacement-part-source-check-log-tutorial/",
      alternate: "/guides/familyboard-replacement-part-source-check-log-tutorial/",
      heading: "FamilyBoard 替換零件來源查核紀錄教學：先確認相容，再開購物頁",
    },
    {
      route: "/zh-tw/guides/familyboard-purchase-delivery-evidence-tutorial/",
      alternate: "/guides/familyboard-purchase-delivery-evidence-tutorial/",
      heading: "FamilyBoard 購買到貨證據教學：記錄實際收到的內容",
    },
    {
      route: "/zh-tw/guides/familyboard-warranty-claim-evidence-log-tutorial/",
      alternate: "/guides/familyboard-warranty-claim-evidence-log-tutorial/",
      heading: "FamilyBoard 保固索賠證據紀錄教學：建立可追溯時間線",
    },
    {
      route: "/zh-tw/guides/familyboard-pet-sitter-instruction-generator-tutorial/",
      alternate: "/guides/familyboard-pet-sitter-instruction-generator-tutorial/",
      heading: "FamilyBoard 寵物照顧指示產生器教學：讓短期交接更清楚",
    },
    {
      route: "/zh-tw/guides/familyboard-home-repair-cost-log-tutorial/",
      alternate: "/guides/familyboard-home-repair-cost-log-tutorial/",
      heading: "FamilyBoard 居家修繕費用紀錄教學：先比範圍再決定支出",
    },
    {
      route: "/zh-tw/guides/familyboard-home-care-visit-scope-service-result-tutorial/",
      alternate: "/guides/familyboard-home-care-visit-scope-service-result-tutorial/",
      heading: "FamilyBoard 到府照護服務範圍與結果教學：分開記錄服務與觀察",
    },
    {
      route: "/zh-tw/guides/familyboard-shared-device-privacy-review-tutorial/",
      alternate: "/guides/familyboard-shared-device-privacy-review-tutorial/",
      heading: "FamilyBoard 共用裝置隱私複查教學：開始前先確認存取範圍",
    },
    {
      route: "/zh-tw/guides/familyboard-household-document-redaction-tutorial/",
      alternate: "/guides/familyboard-household-document-redaction-tutorial/",
      heading: "FamilyBoard 家庭文件遮罩教學：只分享真正需要的副本",
    },
    {
      route: "/zh-tw/guides/familyboard-rental-home-maintenance-handoff-tutorial/",
      alternate: "/guides/familyboard-rental-home-maintenance-handoff-tutorial/",
      heading: "FamilyBoard 租屋維修交接教學：保留清楚的修繕時間線",
    },
    {
      route: "/zh-tw/guides/familyboard-clothing-care-repair-log-tutorial/",
      alternate: "/guides/familyboard-clothing-care-repair-log-tutorial/",
      heading: "FamilyBoard 衣物洗標與修補紀錄教學：從來源到換季複查",
    },
    {
      route: "/zh-tw/guides/familyboard-meal-prep-role-log-tutorial/",
      alternate: "/guides/familyboard-meal-prep-role-log-tutorial/",
      heading: "FamilyBoard 家庭備餐分工教學：從餐次計畫到供餐後結果",
    },
    {
      route: "/zh-tw/guides/familyboard-household-bill-source-status-tutorial/",
      alternate: "/guides/familyboard-household-bill-source-status-tutorial/",
      heading: "FamilyBoard 家庭帳單來源追蹤教學：先核對來源，再記錄狀態",
    },
    {
      route: "/zh-tw/guides/familyboard-household-export-scope-review-tutorial/",
      alternate: "/guides/familyboard-household-export-scope-review-tutorial/",
      heading: "FamilyBoard 匯出範圍複查教學：只分享真正需要的資料",
    },
    {
      route: "/zh-tw/guides/familyboard-printout-download-retention-tutorial/",
      alternate: "/guides/familyboard-printout-download-retention-tutorial/",
      heading: "FamilyBoard 列印與下載副本留存教學：每一份都要有撤回日期",
    },
    {
      route: "/zh-tw/guides/familyboard-household-role-change-audit-tutorial/",
      alternate: "/guides/familyboard-household-role-change-audit-tutorial/",
      heading: "FamilyBoard 家庭角色變更稽核教學：更新下一個真正負責的人",
    },
    {
      route: "/zh-tw/guides/familyboard-guest-service-visit-reset-tutorial/",
      alternate: "/guides/familyboard-guest-service-visit-reset-tutorial/",
      heading: "FamilyBoard 訪客服務復原教學：把範圍、準備與離開後觀察分開",
    },
    {
      route: "/zh-tw/guides/familyboard-subscription-cancellation-result-review-tutorial/",
      alternate: "/guides/familyboard-subscription-cancellation-result-review-tutorial/",
      heading: "FamilyBoard 訂閱取消結果教學：把請求、結束日與帳單觀察分開",
    },
    {
      route: "/zh-tw/guides/familyboard-weekly-household-decision-review-tutorial/",
      alternate: "/guides/familyboard-weekly-household-decision-review-tutorial/",
      heading: "FamilyBoard 每週家庭決策複查教學：把檢視變成可交接的證據",
    },
    {
      route: "/zh-tw/guides/familyboard-restore-merge-replace-tutorial/",
      alternate: "/guides/familyboard-restore-merge-replace-tutorial/",
      heading: "FamilyBoard 備份還原合併與取代教學：選擇安全復原路徑",
    },
    {
      route: "/zh-tw/guides/familyboard-storage-health-warning-tutorial/",
      alternate: "/guides/familyboard-storage-health-warning-tutorial/",
      heading: "FamilyBoard 儲存健康警示教學：讀懂用量、配額與備份日期",
    },
    {
      route: "/zh-tw/guides/familyboard-attachment-metadata-tutorial/",
      alternate: "/guides/familyboard-attachment-metadata-tutorial/",
      heading: "FamilyBoard 附件中繼資料教學：只記索引，不上傳檔案",
    },
    {
      route: "/zh-tw/guides/familyboard-encrypted-backup-password-tutorial/",
      alternate: "/guides/familyboard-encrypted-backup-password-tutorial/",
      heading: "FamilyBoard 加密備份密碼教學：保護 JSON 匯出檔並保留復原能力",
    },
    {
      route: "/zh-tw/guides/familyboard-master-csv-edit-import-tutorial/",
      alternate: "/guides/familyboard-master-csv-edit-import-tutorial/",
      heading: "FamilyBoard 家庭總表 CSV 編輯匯入教學：先預覽，再更新資料",
    },
    {
      route: "/zh-tw/guides/familyboard-app-first-run-restore-tutorial/",
      alternate: "/guides/familyboard-app-first-run-restore-tutorial/",
      heading: "FamilyBoard 首次啟動復原教學：在新瀏覽器開啟既有家庭",
    },
    {
      route: "/zh-tw/guides/familyboard-pwa-update-tutorial/",
      alternate: "/guides/familyboard-pwa-update-tutorial/",
      heading: "FamilyBoard PWA 更新教學：重新載入但不清除本機資料",
    },
    {
      route: "/zh-tw/guides/familyboard-shared-display-privacy-tutorial/",
      alternate: "/guides/familyboard-shared-display-privacy-tutorial/",
      heading: "FamilyBoard 共用看板隱私教學：顯示任務，隱藏私密細節",
    },
    {
      route: "/zh-tw/guides/familyboard-reset-local-household-tutorial/",
      alternate: "/guides/familyboard-reset-local-household-tutorial/",
      heading: "FamilyBoard 清除本機家庭資料教學：確認備份後再重設",
    },
    {
      route: "/zh-tw/guides/familyboard-storage-open-error-tutorial/",
      alternate: "/guides/familyboard-storage-open-error-tutorial/",
      heading: "FamilyBoard 儲存無法開啟教學：先保護本機家庭資料再排查",
    },
    {
      route: "/zh-tw/guides/familyboard-task-completion-tutorial/",
      alternate: "/guides/familyboard-task-completion-tutorial/",
      heading: "FamilyBoard 任務完成教學：記錄已做的事，不誤稱外部結果",
    },
    {
      route: "/zh-tw/guides/familyboard-member-archive-tutorial/",
      alternate: "/guides/familyboard-member-archive-tutorial/",
      heading: "FamilyBoard 封存家庭成員教學：變更責任但保留歷史",
    },
  ]) {
    await page.goto(localized.route);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
    await expect(page.locator("h1")).toHaveText(localized.heading);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://familyboard.win${localized.route}`,
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]'),
    ).toHaveAttribute("href", `https://familyboard.win${localized.alternate}`);
    await expect(
      page.getByRole("link", { name: "Switch to English" }),
    ).toHaveAttribute("href", localized.alternate);
    await expect(page.locator(".recommendations")).toHaveCount(0);

    await page.goto(localized.alternate);
    await expect(
      page.locator('link[rel="alternate"][hreflang="zh-TW"]'),
    ).toHaveAttribute("href", `https://familyboard.win${localized.route}`);
  }

  await page.goto("/zh-tw/guides/household-event-source-check-taiwan/");
  await expect(page.locator("h1")).toHaveText(
    "家庭公告與來源怎麼查？台灣家庭事件紀錄的版本核對指南",
  );
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);

  await page.goto("/zh-tw/guides/familyboard-household-admin-backup-tutorial/");
  await expect(page.locator("h1")).toHaveText(
    "FamilyBoard 家庭行政交接怎麼用？備援角色實作教學",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://familyboard.win/guides/familyboard-household-admin-backup-tutorial/",
  );

  await page.goto("/zh-tw/guides/familyboard-household-account-list-tutorial/");
  await expect(page.locator("h1")).toHaveText(
    "FamilyBoard 家庭帳戶清單怎麼用？服務交接與搬家複查教學",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://familyboard.win/guides/familyboard-household-account-list-tutorial/",
  );

  await page.goto("/zh-tw/guides/familyboard-household-responsibility-coverage-tutorial/");
  await expect(page.locator("h1")).toHaveText(
    "FamilyBoard 家庭責任分工地圖怎麼用？主要角色、備援與複查教學",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://familyboard.win/guides/familyboard-household-responsibility-coverage-tutorial/",
  );

  await page.goto("/zh-tw/guides/familyboard-replacement-part-source-check-tutorial/");
  await expect(page.locator("h1")).toHaveText(
    "FamilyBoard 設備耗材與替換零件怎麼整理？來源核對 App 教學",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://familyboard.win/guides/familyboard-replacement-part-source-check-tutorial/",
  );

  await page.goto("/zh-tw/guides/familyboard-consumable-change-history-tutorial/");
  await expect(page.locator("h1")).toHaveText(
    "FamilyBoard 濾網多久更換怎麼記？家庭耗材歷程 App 教學",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://familyboard.win/guides/familyboard-consumable-change-history-tutorial/",
  );

  await page.goto("/zh-tw/guides/familyboard-repair-evidence-timeline-tutorial/");
  await expect(page.locator("h1")).toHaveText(
    "FamilyBoard 修繕前後怎麼留證據？家庭維修時間線 App 教學",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://familyboard.win/guides/familyboard-repair-evidence-timeline-tutorial/",
  );

  await page.goto("/zh-tw/guides/familyboard-insurance-claim-timeline-tutorial/");
  await expect(page.locator("h1")).toHaveText(
    "FamilyBoard 保險理賠事件怎麼整理？家庭事故時間線 App 教學",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://familyboard.win/guides/familyboard-insurance-claim-timeline-tutorial/",
  );

  await page.goto("/zh-tw/guides/familyboard-building-notice-response-tutorial/");
  await expect(page.locator("h1")).toHaveText(
    "FamilyBoard 大樓公告怎麼交接？家庭通知回覆時間線 App 教學",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://familyboard.win/guides/familyboard-building-notice-response-tutorial/",
  );

  await page.goto("/zh-tw/guides/familyboard-rental-repair-request-tutorial/");
  await expect(page.locator("h1")).toHaveText(
    "FamilyBoard 租屋修繕怎麼追蹤？通知房東與進屋交接 App 教學",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://familyboard.win/guides/familyboard-rental-repair-request-tutorial/",
  );

  await page.goto("/zh-tw/guides/familyboard-school-closure-continuity-tutorial/");
  await expect(page.locator("h1")).toHaveText(
    "FamilyBoard 停課怎麼安排？照顧接送與復課交接 App 教學",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://familyboard.win/guides/familyboard-school-closure-continuity-tutorial/",
  );

  await page.goto("/zh-tw/guides/familyboard-power-outage-event-log-tutorial/");
  await expect(page.locator("h1")).toHaveText(
    "FamilyBoard 停電事件紀錄 App 教學：保存時間線與來源，不猜測原因",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://familyboard.win/guides/familyboard-power-outage-event-log-tutorial/",
  );

  await page.goto("/zh-tw/guides/power-outage-recovery-household-records/");
  await expect(page.locator("h1")).toHaveText(
    "停電復電後怎麼整理家庭紀錄？先分流，再決定哪些要回查",
  );
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);

  await page.goto("/zh-tw/guides/familyboard-water-leak-event-log-tutorial/");
  await expect(page.locator("h1")).toHaveText(
    "FamilyBoard 家庭漏水紀錄怎麼用？先安全觀察，再複查修繕",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://familyboard.win/guides/familyboard-water-leak-event-log-tutorial/",
  );

  await page.goto("/zh-tw/guides/water-leak-photo-evidence-records/");
  await expect(page.locator("h1")).toHaveText(
    "漏水照片怎麼整理才有用？先安全，再建立可回查索引",
  );
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);

  await page.goto("/tools/warranty-expiration-calculator/");
  await expect(
    page.locator('link[rel="alternate"][hreflang="zh-TW"]'),
  ).toHaveAttribute(
    "href",
    "https://familyboard.win/zh-tw/tools/warranty-expiration-calculator/",
  );
  await expect(page.getByRole("link", { name: "切換至繁體中文" })).toHaveAttribute(
    "href",
    "/zh-tw/tools/warranty-expiration-calculator/",
  );

  await page.goto("/zh-tw/tools/warranty-expiration-calculator/");
  await page.getByLabel("保固起算日").fill("2026-01-31");
  await page
    .getByRole("spinbutton", { name: "保固月數", exact: true })
    .fill("1");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("2026年2月28日");
  await expect(page.locator(".result")).toContainText("預估期間終點");

  for (const localizedTool of [
    {
      route: "/zh-tw/tools/home-maintenance-schedule-generator/",
      alternate: "/tools/home-maintenance-schedule-generator/",
      heading: "免費居家保養排程產生器",
    },
    {
      route: "/zh-tw/tools/household-subscription-cost-calculator/",
      alternate: "/tools/household-subscription-cost-calculator/",
      heading: "家庭訂閱費用計算器",
    },
    {
      route: "/zh-tw/tools/emergency-contact-sheet-generator/",
      alternate: "/tools/emergency-contact-sheet-generator/",
      heading: "家庭緊急聯絡表產生器",
    },
    {
      route: "/zh-tw/tools/appliance-age-calculator/",
      alternate: "/tools/appliance-age-calculator/",
      heading: "家電年齡計算器",
    },
    {
      route: "/zh-tw/tools/home-maintenance-cost-tracker/",
      alternate: "/tools/home-maintenance-cost-tracker/",
      heading: "居家維護費用追蹤器",
    },
    {
      route: "/zh-tw/tools/home-repair-cost-log/",
      alternate: "/tools/home-repair-cost-log/",
      heading: "居家修繕費用紀錄表",
    },
    {
      route: "/zh-tw/tools/home-service-reminder-generator/",
      alternate: "/tools/home-service-reminder-generator/",
      heading: "到府服務提醒產生器",
    },
    {
      route: "/zh-tw/tools/receipt-retention-organizer/",
      alternate: "/tools/receipt-retention-organizer/",
      heading: "收據保存整理器",
    },
    {
      route: "/zh-tw/tools/household-annual-review-generator/",
      alternate: "/tools/household-annual-review-generator/",
      heading: "家庭年度總整理清單",
    },
    {
      route: "/zh-tw/tools/move-in-checklist-generator/",
      alternate: "/tools/move-in-checklist-generator/",
      heading: "搬入新家清單產生器",
    },
    {
      route: "/zh-tw/tools/move-out-condition-record-generator/",
      alternate: "/tools/move-out-condition-record-generator/",
      heading: "退租點交紀錄表產生器",
    },
    {
      route: "/zh-tw/tools/home-emergency-drill-record-generator/",
      alternate: "/tools/home-emergency-drill-record-generator/",
      heading: "家庭防災演練紀錄表產生器",
    },
    {
      route: "/zh-tw/tools/emergency-supply-inventory-audit/",
      alternate: "/tools/emergency-supply-inventory-audit/",
      heading: "家庭緊急物資盤點表",
    },
    {
      route: "/zh-tw/tools/emergency-contact-verification-log/",
      alternate: "/tools/emergency-contact-verification-log/",
      heading: "家庭緊急聯絡資料驗證紀錄",
    },
    {
      route: "/zh-tw/tools/household-power-outage-event-log/",
      alternate: "/tools/household-power-outage-event-log/",
      heading: "家庭停電紀錄表",
    },
    {
      route: "/zh-tw/tools/household-water-leak-event-log/",
      alternate: "/tools/household-water-leak-event-log/",
      heading: "家庭漏水事件紀錄表",
    },
    {
      route: "/zh-tw/tools/household-event-duration-calculator/",
      alternate: "/tools/household-event-duration-calculator/",
      heading: "家庭事件經過時間計算器",
    },
    {
      route: "/zh-tw/tools/household-event-source-index-log/",
      alternate: "/tools/household-event-source-index-log/",
      heading: "家庭事件來源索引紀錄",
    },
    {
      route: "/zh-tw/guides/familyboard-event-source-index-tutorial/",
      alternate: "/guides/familyboard-event-source-index-tutorial/",
      heading: "FamilyBoard 家庭事件來源索引怎麼用？公告、照片與交接的實作教學",
    },
    {
      route: "/zh-tw/guides/familyboard-bill-review-tutorial/",
      alternate: "/guides/familyboard-bill-review-tutorial/",
      heading: "FamilyBoard 家庭帳單怎麼追蹤？",
    },
    {
      route: "/zh-tw/guides/familyboard-internet-incident-tutorial/",
      alternate: "/guides/familyboard-internet-incident-tutorial/",
      heading: "FamilyBoard 家庭網路斷線怎麼記錄？先交接影響，再複查恢復",
    },
    {
      route: "/zh-tw/guides/familyboard-meter-reading-tutorial/",
      alternate: "/guides/familyboard-meter-reading-tutorial/",
      heading: "FamilyBoard 水電瓦斯表怎麼記錄？把人工觀察和帳單判定分開",
    },
    {
      route: "/zh-tw/guides/familyboard-share-access-tutorial/",
      alternate: "/guides/familyboard-share-access-tutorial/",
      heading: "FamilyBoard 家庭文件怎麼安全分享？",
    },
    {
      route: "/zh-tw/guides/familyboard-photo-inventory-tutorial/",
      alternate: "/guides/familyboard-photo-inventory-tutorial/",
      heading: "FamilyBoard 家庭財物怎麼拍照盤點？",
    },
    {
      route: "/zh-tw/guides/familyboard-document-renewal-tutorial/",
      alternate: "/guides/familyboard-document-renewal-tutorial/",
      heading: "FamilyBoard 家庭文件要不要更新？先做來源與複查，再決定下一步",
    },
    {
      route: "/zh-tw/guides/familyboard-building-notice-response-tutorial/",
      alternate: "/guides/familyboard-building-notice-response-tutorial/",
      heading: "FamilyBoard 大樓公告怎麼交接？家庭通知回覆時間線 App 教學",
    },
    {
      route: "/zh-tw/guides/familyboard-rental-repair-request-tutorial/",
      alternate: "/guides/familyboard-rental-repair-request-tutorial/",
      heading: "FamilyBoard 租屋修繕怎麼追蹤？通知房東與進屋交接 App 教學",
    },
    {
      route: "/zh-tw/guides/familyboard-repair-evidence-timeline-tutorial/",
      alternate: "/guides/familyboard-repair-evidence-timeline-tutorial/",
      heading: "FamilyBoard 修繕前後怎麼留證據？家庭維修時間線 App 教學",
    },
    {
      route: "/zh-tw/guides/familyboard-consumable-change-history-tutorial/",
      alternate: "/guides/familyboard-consumable-change-history-tutorial/",
      heading: "FamilyBoard 濾網多久更換怎麼記？家庭耗材歷程 App 教學",
    },
    {
      route: "/zh-tw/guides/familyboard-clothing-care-tutorial/",
      alternate: "/guides/familyboard-clothing-care-tutorial/",
      heading: "FamilyBoard 換季衣物怎麼整理？",
    },
    {
      route: "/zh-tw/guides/familyboard-pantry-review-tutorial/",
      alternate: "/guides/familyboard-pantry-review-tutorial/",
      heading: "FamilyBoard 食品櫃怎麼整理？",
    },
    {
      route: "/zh-tw/guides/familyboard-home-access-handoff-tutorial/",
      alternate: "/guides/familyboard-home-access-handoff-tutorial/",
      heading: "FamilyBoard 家庭進出怎麼交接？訪客、維修與歸還複查教學",
    },
    {
      route: "/zh-tw/guides/familyboard-schedule-conflict-review-tutorial/",
      alternate: "/guides/familyboard-schedule-conflict-review-tutorial/",
      heading: "FamilyBoard 家庭行程衝突怎麼處理？改期與分工 App 教學",
    },
    {
      route: "/zh-tw/guides/familyboard-maintenance-priority-review-tutorial/",
      alternate: "/guides/familyboard-maintenance-priority-review-tutorial/",
      heading: "FamilyBoard 居家維護優先順序怎麼排？觀察與交接 App 教學",
    },
    {
      route: "/zh-tw/guides/familyboard-service-quote-comparison-tutorial/",
      alternate: "/guides/familyboard-service-quote-comparison-tutorial/",
      heading: "FamilyBoard 居家服務報價怎麼比較？範圍與提問 App 教學",
    },
    {
      route: "/zh-tw/guides/familyboard-old-tablet-display-tutorial/",
      alternate: "/guides/familyboard-old-tablet-display-tutorial/",
      heading: "FamilyBoard 舊平板家庭看板怎麼用？每週維護 App 教學",
    },
    {
      route: "/zh-tw/guides/familyboard-browser-storage-cleanup-tutorial/",
      alternate: "/guides/familyboard-browser-storage-cleanup-tutorial/",
      heading: "FamilyBoard 瀏覽器資料清理前要做什麼？App 操作教學",
    },
    {
      route: "/zh-tw/guides/familyboard-shopping-list-planner-tutorial/",
      alternate: "/guides/familyboard-shopping-list-planner-tutorial/",
      heading: "FamilyBoard 採買清單怎麼用？從缺貨到到貨的家庭補貨教學",
    },
    {
      route: "/zh-tw/guides/familyboard-seasonal-reset-tutorial/",
      alternate: "/guides/familyboard-seasonal-reset-tutorial/",
      heading: "FamilyBoard 換季複查怎麼做？季節行動 App 教學",
    },
    {
      route: "/zh-tw/guides/familyboard-device-retirement-tutorial/",
      alternate: "/guides/familyboard-device-retirement-tutorial/",
      heading: "舊手機送人前要做什麼？FamilyBoard 裝置清除與交接教學",
    },
    {
      route: "/zh-tw/guides/familyboard-household-meeting-tutorial/",
      alternate: "/guides/familyboard-household-meeting-tutorial/",
      heading: "FamilyBoard 家庭會議怎麼開？",
    },
    {
      route: "/zh-tw/guides/familyboard-weekly-reset-action-tutorial/",
      alternate: "/guides/familyboard-weekly-reset-action-tutorial/",
      heading: "FamilyBoard 每週家庭整理怎麼做？5 分鐘複查與分工 App 教學",
    },
    {
      route: "/zh-tw/guides/familyboard-school-closure-continuity-tutorial/",
      alternate: "/guides/familyboard-school-closure-continuity-tutorial/",
      heading: "FamilyBoard 停課怎麼安排？照顧接送與復課交接 App 教學",
    },
    {
      route: "/zh-tw/guides/familyboard-household-account-list-tutorial/",
      alternate: "/guides/familyboard-household-account-list-tutorial/",
      heading: "FamilyBoard 家庭帳戶清單怎麼用？服務交接與搬家複查教學",
    },
    {
      route: "/zh-tw/guides/familyboard-accessibility-walkthrough-tutorial/",
      alternate: "/guides/familyboard-accessibility-walkthrough-tutorial/",
      heading: "FamilyBoard 居家動線怎麼做無障礙走讀？先記觀察，再安排重測",
    },
    {
      route: "/zh-tw/guides/familyboard-household-handoff-tutorial/",
      alternate: "/guides/familyboard-household-handoff-tutorial/",
      heading: "FamilyBoard 家庭交接怎麼用？",
    },
    {
      route: "/zh-tw/guides/familyboard-insurance-claim-timeline-tutorial/",
      alternate: "/guides/familyboard-insurance-claim-timeline-tutorial/",
      heading: "FamilyBoard 保險理賠事件怎麼整理？家庭事故時間線 App 教學",
    },
    {
      route: "/zh-tw/guides/familyboard-household-responsibility-coverage-tutorial/",
      alternate: "/guides/familyboard-household-responsibility-coverage-tutorial/",
      heading: "FamilyBoard 家庭責任分工地圖怎麼用？主要角色、備援與複查教學",
    },
    {
      route: "/zh-tw/guides/familyboard-replacement-part-source-check-tutorial/",
      alternate: "/guides/familyboard-replacement-part-source-check-tutorial/",
      heading: "FamilyBoard 設備耗材與替換零件怎麼整理？來源核對 App 教學",
    },
    {
      route: "/zh-tw/guides/familyboard-guest-arrival-prep-tutorial/",
      alternate: "/guides/familyboard-guest-arrival-prep-tutorial/",
      heading: "FamilyBoard 訪客到訪怎麼準備？把範圍、準備與復原分開",
    },
    {
      route: "/zh-tw/guides/familyboard-donation-handoff-tutorial/",
      alternate: "/guides/familyboard-donation-handoff-tutorial/",
      heading: "FamilyBoard 家庭物品捐贈轉贈怎麼交接？先記狀況，再確認收受結果",
    },
    {
      route: "/zh-tw/guides/familyboard-household-admin-backup-tutorial/",
      alternate: "/guides/familyboard-household-admin-backup-tutorial/",
      heading: "FamilyBoard 家庭行政交接怎麼用？備援角色實作教學",
    },
    {
      route: "/zh-tw/guides/familyboard-mail-package-handoff-tutorial/",
      alternate: "/guides/familyboard-mail-package-handoff-tutorial/",
      heading: "FamilyBoard 信件與包裹怎麼交接？先限定時段，再記實際結果",
    },
    {
      route: "/zh-tw/guides/familyboard-plant-care-handoff-tutorial/",
      alternate: "/guides/familyboard-plant-care-handoff-tutorial/",
      heading: "FamilyBoard 植物照護怎麼交接？先寫範圍，再回填實際結果",
    },
    {
      route: "/zh-tw/guides/familyboard-recycling-handoff-tutorial/",
      alternate: "/guides/familyboard-recycling-handoff-tutorial/",
      heading: "FamilyBoard 家庭垃圾與資源回收怎麼交接？先查公告，再記實際結果",
    },
    {
      route: "/zh-tw/guides/familyboard-household-return-handoff-tutorial/",
      alternate: "/guides/familyboard-household-return-handoff-tutorial/",
      heading: "FamilyBoard 網購退貨怎麼交接？先記來源，再複查寄回結果",
    },
    {
      route: "/zh-tw/guides/familyboard-school-pickup-handoff-tutorial/",
      alternate: "/guides/familyboard-school-pickup-handoff-tutorial/",
      heading: "FamilyBoard 放學接送怎麼交接？先定義範圍，再回填返家結果",
    },
    {
      route: "/zh-tw/guides/familyboard-service-appointment-handoff-tutorial/",
      alternate: "/guides/familyboard-service-appointment-handoff-tutorial/",
      heading: "FamilyBoard 服務預約交接教學：把預約、進場與結果分開記",
    },
    {
      route: "/zh-tw/guides/familyboard-time-window-overlap-checker-tutorial/",
      alternate: "/guides/familyboard-time-window-overlap-checker-tutorial/",
      heading: "FamilyBoard 時間窗口重疊檢查教學：不貼整份行事曆也能看懂結果",
    },
    {
      route: "/zh-tw/guides/familyboard-date-offset-planner-tutorial/",
      alternate: "/guides/familyboard-date-offset-planner-tutorial/",
      heading: "家庭日期偏移規劃器教學：把算出的日期變成可複查行動",
    },
    {
      route: "/zh-tw/guides/familyboard-task-load-calculator-tutorial/",
      alternate: "/guides/familyboard-task-load-calculator-tutorial/",
      heading: "家庭家務負荷計算器教學：先看見每週時間，再把分工談清楚",
    },
    {
      route: "/zh-tw/guides/familyboard-appliance-age-calculator-tutorial/",
      alternate: "/guides/familyboard-appliance-age-calculator-tutorial/",
      heading: "家電年齡計算器教學：先算清楚經過多久，再決定要查什麼",
    },
    {
      route: "/zh-tw/guides/familyboard-utility-bill-anomaly-log-tutorial/",
      alternate: "/guides/familyboard-utility-bill-anomaly-log-tutorial/",
      heading: "家庭水電帳單差異紀錄教學：把突然變高的金額變成可查問題",
    },
    {
      route: "/zh-tw/guides/familyboard-maintenance-delegation-map-tutorial/",
      alternate: "/guides/familyboard-maintenance-delegation-map-tutorial/",
      heading: "家庭維護分工地圖教學：把負責人、執行者與交接寫清楚",
    },
    {
      route: "/zh-tw/guides/familyboard-record-retention-decision-log-tutorial/",
      alternate: "/guides/familyboard-record-retention-decision-log-tutorial/",
      heading: "家庭文件保存決策紀錄教學：不要用一個年限取代來源查核",
    },
    {
      route: "/zh-tw/guides/familyboard-home-repair-closeout-checklist-tutorial/",
      alternate: "/guides/familyboard-home-repair-closeout-checklist-tutorial/",
      heading: "家庭修繕結案清單教學：把缺少的文件留在看得見的位置",
    },
    {
      route: "/zh-tw/guides/familyboard-pet-record-source-handoff-tutorial/",
      alternate: "/guides/familyboard-pet-record-source-handoff-tutorial/",
      heading: "寵物紀錄來源交接教學：不複製敏感資料也能找到正確版本",
    },
    {
      route: "/zh-tw/guides/familyboard-home-accessibility-walkthrough-log-tutorial/",
      alternate: "/guides/familyboard-home-accessibility-walkthrough-log-tutorial/",
      heading: "居家無障礙動線複查教學：先記觀察，再和實際使用者重測",
    },
    {
      route: "/zh-tw/guides/familyboard-household-annual-review-generator-tutorial/",
      alternate: "/guides/familyboard-household-annual-review-generator-tutorial/",
      heading: "家庭年度檢視產生器教學：把年度整理變成可追蹤證據",
    },
    {
      route: "/zh-tw/guides/familyboard-household-document-index-generator-tutorial/",
      alternate: "/guides/familyboard-household-document-index-generator-tutorial/",
      heading: "家庭文件索引產生器教學：建立找得到、又不複製機密的資料夾地圖",
    },
    {
      route: "/zh-tw/guides/familyboard-emergency-binder-generator-tutorial/",
      alternate: "/guides/familyboard-emergency-binder-generator-tutorial/",
      heading: "家庭緊急資料夾產生器教學：在壓力下仍找得到必要資訊",
    },
    {
      route: "/zh-tw/guides/familyboard-home-maintenance-cost-tracker-tutorial/",
      alternate: "/guides/familyboard-home-maintenance-cost-tracker-tutorial/",
      heading: "居家維護費用追蹤器教學：把收據整理成可複查歷程",
    },
    {
      route: "/zh-tw/guides/familyboard-home-service-reminder-generator-tutorial/",
      alternate: "/guides/familyboard-home-service-reminder-generator-tutorial/",
      heading: "居家服務提醒產生器教學：設定複查點，不把日期當成業者承諾",
    },
    {
      route: "/zh-tw/guides/familyboard-recurring-chore-planner-tutorial/",
      alternate: "/guides/familyboard-recurring-chore-planner-tutorial/",
      heading: "週期家事規劃器教學：建立能調整、也能交接的家庭節奏",
    },
    {
      route: "/zh-tw/guides/familyboard-home-inventory-checklist-generator-tutorial/",
      alternate: "/guides/familyboard-home-inventory-checklist-generator-tutorial/",
      heading: "家庭財物清冊產生器教學：先記錄能核對的物品與來源",
    },
    {
      route: "/zh-tw/guides/familyboard-room-inventory-generator-tutorial/",
      alternate: "/guides/familyboard-room-inventory-generator-tutorial/",
      heading: "房間物品清冊產生器教學：先把一個空間整理到找得到",
    },
    {
      route: "/zh-tw/guides/familyboard-warranty-checklist-generator-tutorial/",
      alternate: "/guides/familyboard-warranty-checklist-generator-tutorial/",
      heading: "保固資料檢查表產生器教學：在需要維修前保留購買證據",
    },
    {
      route: "/zh-tw/guides/familyboard-home-care-service-plan-change-notice-tutorial/",
      alternate: "/guides/familyboard-home-care-service-plan-change-notice-tutorial/",
      heading: "居家照護服務計畫變更通知教學：分開通知、版本與第一次實施",
    },
    {
      route: "/zh-tw/guides/familyboard-home-care-service-interruption-backup-continuity-tutorial/",
      alternate: "/guides/familyboard-home-care-service-interruption-backup-continuity-tutorial/",
      heading: "居家照護服務中斷與備援教學：先記錄缺口再談銜接",
    },
    {
      route: "/zh-tw/guides/familyboard-home-care-complaint-response-resolution-tutorial/",
      alternate: "/guides/familyboard-home-care-complaint-response-resolution-tutorial/",
      heading: "居家照護抱怨與回應教學：把回覆和實際改善分開",
    },
    {
      route: "/zh-tw/guides/familyboard-home-care-billing-discrepancy-tutorial/",
      alternate: "/guides/familyboard-home-care-billing-discrepancy-tutorial/",
      heading: "居家照護費用差異教學：先核對來源，再判斷帳務問題",
    },
    {
      route: "/zh-tw/guides/familyboard-home-care-payment-refund-collection-notice-tutorial/",
      alternate: "/guides/familyboard-home-care-payment-refund-collection-notice-tutorial/",
      heading: "居家照護付款退款催收通知教學：保存通知與實際帳戶結果",
    },
    {
      route: "/zh-tw/guides/familyboard-rental-security-deposit-move-out-tutorial/",
      alternate: "/guides/familyboard-rental-security-deposit-move-out-tutorial/",
      heading: "租屋押金搬出爭議教學：分開屋況、扣款與退款證據",
    },
    {
      route: "/zh-tw/guides/familyboard-calendar-tutorial/",
      alternate: "/guides/familyboard-calendar-tutorial/",
      heading: "FamilyBoard 家庭行事曆 App 教學：把提醒變成可複查事件",
    },
    {
      route: "/zh-tw/guides/familyboard-warranty-tracker-tutorial/",
      alternate: "/guides/familyboard-warranty-tracker-tutorial/",
      heading: "FamilyBoard 保固追蹤器 App 教學：先連結證據，再相信日期",
    },
    {
      route: "/zh-tw/guides/familyboard-maintenance-tracker-tutorial/",
      alternate: "/guides/familyboard-maintenance-tracker-tutorial/",
      heading: "FamilyBoard 維護追蹤器 App 教學：記錄工作與來源，不製造安全保證",
    },
    {
      route: "/zh-tw/guides/familyboard-emergency-supply-inventory-audit-tutorial/",
      alternate: "/guides/familyboard-emergency-supply-inventory-audit-tutorial/",
      heading: "FamilyBoard 緊急物資盤點稽核教學：核對物品、來源與下一步",
    },
    {
      route: "/zh-tw/guides/familyboard-home-service-provider-verification-tutorial/",
      alternate: "/guides/familyboard-home-service-provider-verification-tutorial/",
      heading: "FamilyBoard 居家服務商查核教學：先核對來源，再分享聯絡方式",
    },
    {
      route: "/zh-tw/guides/familyboard-home-repair-change-order-tutorial/",
      alternate: "/guides/familyboard-home-repair-change-order-tutorial/",
      heading: "FamilyBoard 居家修繕變更單教學：保留原範圍，再核對變更與核准",
    },
    {
      route: "/zh-tw/guides/familyboard-emergency-contact-sheet-generator-tutorial/",
      alternate: "/guides/familyboard-emergency-contact-sheet-generator-tutorial/",
      heading: "FamilyBoard 緊急聯絡表產生器教學：讓交接找得到，但不公開私密資料",
    },
    {
      route: "/zh-tw/guides/familyboard-home-emergency-drill-record-tutorial/",
      alternate: "/guides/familyboard-home-emergency-drill-record-tutorial/",
      heading: "FamilyBoard 居家緊急演練紀錄教學：測試交接，不測試勇氣",
    },
    {
      route: "/zh-tw/guides/familyboard-storm-readiness-review-tutorial/",
      alternate: "/guides/familyboard-storm-readiness-review-tutorial/",
      heading: "FamilyBoard 風暴準備複查教學：使用在地來源與可見缺口，不做通用分數",
    },
    {
      route: "/zh-tw/guides/familyboard-appliance-replacement-planner-tutorial/",
      alternate: "/guides/familyboard-appliance-replacement-planner-tutorial/",
      heading: "家電汰換規劃器教學：把「要不要換」拆成能查證的下一步",
    },
    {
      route: "/zh-tw/guides/familyboard-cleaning-schedule-generator-tutorial/",
      alternate: "/guides/familyboard-cleaning-schedule-generator-tutorial/",
      heading: "清潔排程產生器教學：先產生骨架，再改成你家做得到的節奏",
    },
    {
      route: "/zh-tw/guides/familyboard-subscription-cancellation-handoff-tutorial/",
      alternate: "/guides/familyboard-subscription-cancellation-handoff-tutorial/",
      heading: "FamilyBoard 訂閱怎麼取消與交接？先確認窗口，再複查正式結果",
    },
    {
      route: "/zh-tw/guides/familyboard-school-activity-handoff-tutorial/",
      alternate: "/guides/familyboard-school-activity-handoff-tutorial/",
      heading: "FamilyBoard 學校活動怎麼交接？同意表與用品截止日 App 教學",
    },
    {
      route: "/zh-tw/guides/familyboard-monthly-review-action-tutorial/",
      alternate: "/guides/familyboard-monthly-review-action-tutorial/",
      heading: "FamilyBoard 每月家庭檢視怎麼做？維護、備份與續期 App 教學",
    },
    {
      route: "/zh-tw/guides/familyboard-router-support-review-tutorial/",
      alternate: "/guides/familyboard-router-support-review-tutorial/",
      heading: "Wi-Fi 路由器多久要換？FamilyBoard 支援期限與汰換教學",
    },
    {
      route: "/zh-tw/guides/familyboard-trip-handoff-tutorial/",
      alternate: "/guides/familyboard-trip-handoff-tutorial/",
      heading: "FamilyBoard 旅行交接怎麼做？",
    },
    {
      route: "/zh-tw/guides/familyboard-meal-prep-tutorial/",
      alternate: "/guides/familyboard-meal-prep-tutorial/",
      heading: "FamilyBoard 一週備餐怎麼分工？",
    },
    {
      route: "/zh-tw/tools/household-storm-readiness-review/",
      alternate: "/tools/household-storm-readiness-review/",
      heading: "家庭颱風準備複查表",
    },
    {
      route: "/zh-tw/tools/home-service-provider-verification-log/",
      alternate: "/tools/home-service-provider-verification-log/",
      heading: "家庭到府服務商查證紀錄",
    },
    {
      route: "/zh-tw/tools/home-repair-change-order-log/",
      alternate: "/tools/home-repair-change-order-log/",
      heading: "居家修繕追加變更紀錄",
    },
    {
      route: "/zh-tw/tools/home-repair-punch-list/",
      alternate: "/tools/home-repair-punch-list/",
      heading: "居家修繕缺失複查表",
    },
    {
      route: "/zh-tw/guides/renovation-records/",
      alternate: "/guides/renovation-records/",
      heading: "裝潢驗收紀錄不是一張勾選表，而是一段有版本的複查歷史",
    },
    {
      route: "/zh-tw/tools/home-repair-closeout-checklist/",
      alternate: "/tools/home-repair-closeout-checklist/",
      heading: "居家修繕結案資料包檢查表",
    },
    {
      route: "/zh-tw/guides/home-improvement-receipts/",
      alternate: "/guides/home-improvement-receipts/",
      heading: "裝潢收據怎麼整理：一張發票不能代替整段工程證據",
    },
    {
      route: "/zh-tw/tools/warranty-claim-evidence-log/",
      alternate: "/tools/warranty-claim-evidence-log/",
      heading: "產品保固申請證據紀錄表",
    },
    {
      route: "/zh-tw/tools/product-recall-action-log/",
      alternate: "/tools/product-recall-action-log/",
      heading: "產品召回處置紀錄表",
    },
    {
      route: "/zh-tw/tools/appliance-service-visit-log/",
      alternate: "/tools/appliance-service-visit-log/",
      heading: "家電到府維修訪視紀錄表",
    },
    {
      route: "/zh-tw/tools/appliance-repair-callback-log/",
      alternate: "/tools/appliance-repair-callback-log/",
      heading: "家電維修後又壞紀錄表",
    },
    {
      route: "/zh-tw/guides/repair-history/",
      alternate: "/guides/repair-history/",
      heading: "家電修了又壞怎麼辦？送修三次、保固與維修紀錄",
    },
    {
      route: "/zh-tw/tools/appliance-purchase-installation-record/",
      alternate: "/tools/appliance-purchase-installation-record/",
      heading: "家電購買與安裝紀錄表",
    },
    {
      route: "/zh-tw/tools/purchase-delivery-evidence-log/",
      alternate: "/tools/purchase-delivery-evidence-log/",
      heading: "購買與到貨證據紀錄表",
    },
    {
      route: "/zh-tw/tools/moving-box-handover-log/",
      alternate: "/tools/moving-box-handover-log/",
      heading: "搬家箱件交接紀錄表",
    },
    {
      route: "/zh-tw/guides/moving-inventory/",
      alternate: "/guides/moving-inventory/",
      heading: "搬家物品清單要追蹤「誰在何時接到哪一箱」",
    },
    {
      route: "/zh-tw/tools/storage-unit-access-inventory-log/",
      alternate: "/tools/storage-unit-access-inventory-log/",
      heading: "迷你倉進出與物品紀錄表",
    },
    {
      route: "/zh-tw/guides/storage-unit-inventory/",
      alternate: "/guides/storage-unit-inventory/",
      heading: "迷你倉物品清單要回答「放哪裡、何時看過、後來怎麼變」",
    },
    {
      route: "/zh-tw/tools/household-record-retrieval-drill-log/",
      alternate: "/tools/household-record-retrieval-drill-log/",
      heading: "家庭文件查找與交接演練紀錄",
    },
    {
      route: "/zh-tw/guides/digital-home-binder/",
      alternate: "/guides/digital-home-binder/",
      heading: "家庭數位資料夾不是把所有檔案塞進同一個雲端硬碟",
    },
    {
      route: "/zh-tw/tools/important-household-document-review/",
      alternate: "/tools/important-household-document-review/",
      heading: "家庭重要文件適用性與來源盤點",
    },
    {
      route: "/zh-tw/guides/important-household-documents/",
      alternate: "/guides/important-household-documents/",
      heading: "家庭重要文件清單不是把所有證件影本集中在同一個資料夾",
    },
    {
      route: "/zh-tw/tools/household-record-retention-decision-log/",
      alternate: "/tools/household-record-retention-decision-log/",
      heading: "家庭紀錄保存與銷毀決策紀錄",
    },
    {
      route: "/zh-tw/guides/how-long-to-keep-household-records/",
      alternate: "/guides/how-long-to-keep-household-records/",
      heading: "家庭文件保存期限不是每個資料夾都填「五年」",
    },
    {
      route: "/zh-tw/tools/appliance-manual-source-check-log/",
      alternate: "/tools/appliance-manual-source-check-log/",
      heading: "家電說明書來源核對紀錄",
    },
    {
      route: "/zh-tw/guides/organize-appliance-manuals/",
      alternate: "/guides/organize-appliance-manuals/",
      heading: "家電說明書怎麼整理？先確認完整型號、官方來源與召回資訊",
    },
    {
      route: "/zh-tw/tools/household-insurance-policy-source-version-log/",
      alternate: "/tools/household-insurance-policy-source-version-log/",
      heading: "家庭保單來源與版本核對紀錄",
    },
    {
      route: "/zh-tw/guides/organize-insurance-documents/",
      alternate: "/guides/organize-insurance-documents/",
      heading: "保單怎麼整理？先分清保險契約、批單、續保通知與申訴來源",
    },
    {
      route: "/zh-tw/tools/household-utility-provider-service-handoff-log/",
      alternate: "/tools/household-utility-provider-service-handoff-log/",
      heading: "家庭公用事業供應與服務交接紀錄",
    },
    {
      route: "/zh-tw/guides/organize-utility-account-information/",
      alternate: "/guides/organize-utility-account-information/",
      heading: "水電過戶怎麼整理？先分清供應單位、戶名、結算與安全入口",
    },
    {
      route: "/zh-tw/guides/purchase-receipt-organizer/",
      alternate: "/guides/purchase-receipt-organizer/",
      heading: "網購到貨缺件或損壞怎麼辦？發票、拆封與退換貨紀錄",
    },
    {
      route: "/zh-tw/guides/appliance-inventory/",
      alternate: "/guides/appliance-inventory/",
      heading: "家電清冊怎麼做？型號、序號、發票與保固起算紀錄",
    },
    {
      route: "/zh-tw/tools/vacation-shutdown-checklist-generator/",
      alternate: "/tools/vacation-shutdown-checklist-generator/",
      heading: "旅行前住家檢查清單",
    },
    {
      route: "/zh-tw/tools/house-sitter-instruction-generator/",
      alternate: "/tools/house-sitter-instruction-generator/",
      heading: "看家注意事項產生器",
    },
    {
      route: "/zh-tw/tools/pet-sitter-instruction-generator/",
      alternate: "/tools/pet-sitter-instruction-generator/",
      heading: "寵物照護交接表產生器",
    },
    {
      route: "/zh-tw/tools/home-handoff-summary-generator/",
      alternate: "/tools/home-handoff-summary-generator/",
      heading: "家庭交接摘要產生器",
    },
    {
      route: "/zh-tw/tools/annual-subscription-cost-calculator/",
      alternate: "/tools/annual-subscription-cost-calculator/",
      heading: "訂閱年成本計算器",
    },
    {
      route: "/zh-tw/tools/emergency-binder-generator/",
      alternate: "/tools/emergency-binder-generator/",
      heading: "家庭緊急資料夾產生器",
    },
    {
      route: "/zh-tw/tools/cleaning-schedule-generator/",
      alternate: "/tools/cleaning-schedule-generator/",
      heading: "家庭清潔排程產生器",
    },
    {
      route: "/zh-tw/tools/appliance-replacement-planner/",
      alternate: "/tools/appliance-replacement-planner/",
      heading: "家電汰換評估表",
    },
    {
      route: "/zh-tw/tools/room-inventory-generator/",
      alternate: "/tools/room-inventory-generator/",
      heading: "房間物品清冊產生器",
    },
    {
      route: "/zh-tw/tools/warranty-checklist-generator/",
      alternate: "/tools/warranty-checklist-generator/",
      heading: "保固資料檢查表",
    },
    {
      route: "/zh-tw/tools/recurring-chore-planner/",
      alternate: "/tools/recurring-chore-planner/",
      heading: "家庭家事輪值表產生器",
    },
    {
      route: "/zh-tw/tools/home-inventory-checklist-generator/",
      alternate: "/tools/home-inventory-checklist-generator/",
      heading: "住宅財物盤點清單產生器",
    },
    {
      route: "/zh-tw/tools/household-document-index-generator/",
      alternate: "/tools/household-document-index-generator/",
      heading: "家庭文件索引產生器",
    },
    {
      route: "/zh-tw/tools/appliance-maintenance-checklist-generator/",
      alternate: "/tools/appliance-maintenance-checklist-generator/",
      heading: "家電保養清單產生器",
    },
    {
      route: "/zh-tw/tools/household-seasonal-reset-action-log/",
      alternate: "/tools/household-seasonal-reset-action-log/",
      heading: "家庭換季複查怎麼記？免費季節行動紀錄工具",
    },
    {
      route: "/zh-tw/tools/household-device-retirement-handoff-log/",
      alternate: "/tools/household-device-retirement-handoff-log/",
      heading: "舊手機要怎麼清除再送人？免費裝置退役交接工具",
    },
    {
      route: "/zh-tw/tools/household-router-support-review-log/",
      alternate: "/tools/household-router-support-review-log/",
      heading: "Wi-Fi 路由器支援期限怎麼查？免費家庭網路複查工具",
    },
    {
      route: "/zh-tw/tools/household-shopping-list-planner/",
      alternate: "/tools/household-shopping-list-planner/",
      heading: "家庭採買清單怎麼做？免費補貨與到貨複查工具",
    },
    {
      route: "/zh-tw/tools/household-account-list/",
      alternate: "/tools/household-account-list/",
      heading: "家庭帳戶清單工具",
    },
    {
      route: "/zh-tw/tools/household-responsibility-coverage-map/",
      alternate: "/tools/household-responsibility-coverage-map/",
      heading: "家庭責任分工地圖工具",
    },
    {
      route: "/zh-tw/tools/household-replacement-part-source-check-log/",
      alternate: "/tools/household-replacement-part-source-check-log/",
      heading: "家庭替換零件來源核對工具",
    },
    {
      route: "/zh-tw/tools/household-consumable-change-history-log/",
      alternate: "/tools/household-consumable-change-history-log/",
      heading: "家庭濾網與耗材更換歷程工具",
    },
    {
      route: "/zh-tw/tools/household-repair-evidence-timeline-log/",
      alternate: "/tools/household-repair-evidence-timeline-log/",
      heading: "家庭修繕證據時間線工具",
    },
    {
      route: "/zh-tw/tools/household-insurance-claim-timeline-log/",
      alternate: "/tools/household-insurance-claim-timeline-log/",
      heading: "家庭保險理賠事件時間線工具",
    },
    {
      route: "/zh-tw/tools/household-decision-register/",
      alternate: "/tools/household-decision-register/",
      heading: "家庭決定登錄工具",
    },
    {
      route: "/zh-tw/tools/household-backup-recovery-checker/",
      alternate: "/tools/household-backup-recovery-checker/",
      heading: "家庭備份與還原準備檢查器",
    },
    {
      route: "/zh-tw/tools/household-building-notice-response-log/",
      alternate: "/tools/household-building-notice-response-log/",
      heading: "家庭大樓公告回覆時間線工具",
    },
    {
      route: "/zh-tw/tools/rental-repair-request-log/",
      alternate: "/tools/rental-repair-request-log/",
      heading: "租屋修繕請求紀錄工具",
    },
    {
      route: "/zh-tw/tools/household-school-closure-continuity-log/",
      alternate: "/tools/household-school-closure-continuity-log/",
      heading: "停課家庭連續運作時間線工具",
    },
    {
      route: "/zh-tw/tools/household-time-window-overlap-checker/",
      alternate: "/tools/household-time-window-overlap-checker/",
      heading: "家庭時間窗口重疊檢查工具",
    },
    {
      route: "/zh-tw/tools/household-date-offset-planner/",
      alternate: "/tools/household-date-offset-planner/",
      heading: "家庭日期偏移規劃器",
    },
    {
      route: "/zh-tw/tools/household-task-load-calculator/",
      alternate: "/tools/household-task-load-calculator/",
      heading: "家庭家務負荷計算器",
    },
  ]) {
    await page.goto(localizedTool.route);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
    await expect(page.locator("h1")).toHaveText(localizedTool.heading);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://familyboard.win${localizedTool.route}`,
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]'),
    ).toHaveAttribute("href", `https://familyboard.win${localizedTool.alternate}`);
    await expect(
      page.getByRole("link", { name: "Switch to English" }),
    ).toHaveAttribute("href", localizedTool.alternate);
    await expect(page.locator(".recommendations")).toHaveCount(0);

    await page.goto(localizedTool.alternate);
    await expect(
      page.locator('link[rel="alternate"][hreflang="zh-TW"]'),
    ).toHaveAttribute("href", `https://familyboard.win${localizedTool.route}`);
  }

  await page.goto("/zh-tw/tools/household-task-load-calculator/");
  await page.getByLabel("重複家務明細").fill(
    "垃圾與回收 | 角色-A | 每週 | 20\n濾網狀態複查 | 角色-B | 每月 | 15",
  );
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("全部家務估計");
  await expect(page.locator(".result")).toContainText("角色-A");

  await page.goto("/zh-tw/tools/home-maintenance-schedule-generator/");
  await page.getByLabel("第一次複查日期").fill("2026-09-01");
  await page.getByLabel("整份清單複查頻率").selectOption("每季複查");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("2026年12月1日");
  await expect(page.locator(".result")).toContainText(
    "不是每項設備的保養週期",
  );

  await page.goto("/zh-tw/tools/household-subscription-cost-calculator/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("家庭年總額");
  await expect(page.locator(".result")).toContainText("51,030");

  await page.goto("/zh-tw/tools/emergency-contact-sheet-generator/");
  await page.getByLabel("本次複查日期").fill("2026-08-22");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("警察報案：110");
  await expect(page.locator(".result")).toContainText(
    "行動電話報案時優先說明案發地點",
  );

  await page.goto("/zh-tw/tools/appliance-age-calculator/");
  await page.getByLabel("家電名稱").fill("測試冰箱");
  await page.getByLabel("購買或安裝日期").fill("2020-01-15");
  await page.getByLabel("這個日期的依據").selectOption("安裝日（有紀錄）");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("測試冰箱目前年齡");
  await expect(page.locator(".result")).toContainText("安裝日（有紀錄）");
  await expect(page.locator(".result")).toContainText("不是故障機率或剩餘壽命");

  await page.goto("/zh-tw/tools/home-maintenance-cost-tracker/");
  await page.getByLabel("維護費用明細").fill(
    "2026-08-05 | 客廳冷氣檢修 | 1800 | 已完成\n2026-09-12 | 浴室抽風機更換 | 3200 | 已規劃\n格式錯誤",
  );
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("已完成：NT$1,800");
  await expect(page.locator(".result")).toContainText("已規劃：NT$3,200");
  await expect(page.locator(".result")).toContainText("未納入：第 3 行");

  await page.goto("/zh-tw/tools/home-repair-cost-log/");
  await page.getByLabel("修繕紀錄").fill(
    "2026-03-08 | 客廳冷氣 | 運轉後滴水 | 原廠服務站 | 1800 | 清潔排水管後正常\n2026-08-18 | 客廳冷氣 | 再次滴水 | 原廠服務站 | 950 | 調整排水坡度，持續觀察\n格式錯誤",
  );
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("實付總額：NT$2,750");
  await expect(page.locator(".result")).toContainText("客廳冷氣：2 筆，共 NT$2,750");
  await expect(page.locator(".result")).toContainText("未納入：第 3 行");

  await page.goto("/zh-tw/tools/home-service-reminder-generator/");
  await page.getByLabel("最晚完成日期").fill("2026-10-15");
  await page
    .getByRole("spinbutton", { name: "提前幾天開始聯絡／預約" })
    .fill("21");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("2026年9月24日");
  await expect(page.locator(".result")).toContainText("日期依據：使用說明書第 18 頁");
  await expect(page.locator(".result")).toContainText("不會發送通知或自動預約");

  await page.goto("/zh-tw/tools/receipt-retention-organizer/");
  await page.getByLabel("交易或完工日期").fill("2025-10-31");
  await page
    .getByRole("spinbutton", { name: "已查明的複查間隔（月）" })
    .fill("12");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("2026年10月31日");
  await expect(page.locator(".result")).toContainText("複查日不是銷毀日");
  await page.getByLabel("交易或完工日期").fill("2099-01-01");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("不能晚於今天");

  await page.goto("/zh-tw/tools/household-annual-review-generator/");
  await page.getByLabel("目前居住情境").selectOption("承租住宅");
  await page.getByLabel("本次查核日期").fill("2026-08-22");
  await page.getByLabel("下次年度複查日期").fill("2027-08-22");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("七個固定查核區");
  await expect(page.locator(".result")).toContainText("租約、現況／點交紀錄");
  await expect(page.locator(".result")).toContainText("驗證最新備份可以開啟");

  await page.goto("/zh-tw/tools/move-in-checklist-generator/");
  await page.getByLabel("居住身分").selectOption("承租人");
  await page.getByLabel("住宅型態").selectOption("公寓大廈");
  await page.getByLabel("點交或取得使用權日期").fill("2026-09-01");
  await page.getByLabel("正式搬入日期").fill("2026-09-03");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("2026年9月10日");
  await expect(page.locator(".result")).toContainText("2026年10月3日");
  await expect(page.locator(".result")).toContainText("租賃標的現況確認書");
  await expect(page.locator(".result")).toContainText("電梯搬運");

  await page.goto("/tools/move-out-condition-record-generator/");
  await page.getByLabel("Inspection date").fill("2026-08-23");
  await page.getByLabel("Planned or completed handover date").fill("2026-08-28");
  await page.getByLabel("Next follow-up date").fill("2026-09-02");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Disputed 1");
  await expect(page.locator(".result")).toContainText("KEY_001");
  await expect(page.locator(".result")).toContainText("unsigned working record");
  await page
    .getByLabel("Keys and access items")
    .fill("Front-door key | 2.5 | Return at handover | KEY_001");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "whole-number count from 0 to 99",
  );

  await page.goto("/zh-tw/tools/move-out-condition-record-generator/");
  await page.getByLabel("實際檢查日期").fill("2026-08-23");
  await page.getByLabel("預定或實際點交日期").fill("2026-08-28");
  await page.getByLabel("下次追蹤日期").fill("2026-09-02");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("有歧見待記錄 1 筆");
  await expect(page.locator(".result")).toContainText("KEY_001");
  await expect(page.locator(".result")).toContainText("不是簽名、責任認定");
  await page
    .getByLabel("鑰匙與門禁物品")
    .fill("門禁磁扣 | 1 | 門禁碼 1234 | KEY_002");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "偵測到可能的密碼、門禁碼、驗證碼",
  );

  await page.goto("/tools/home-emergency-drill-record-generator/");
  await page.getByLabel("Exercise date").fill("2026-08-23");
  await page.getByLabel("Next review or repeat date").fill("2026-09-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Needs follow-up 1");
  await expect(page.locator(".result")).toContainText("Not tested 1");
  await expect(page.locator(".result")).toContainText("not a safety certification");
  await page
    .getByRole("spinbutton", { name: "Observed exercise duration in minutes" })
    .fill("0");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "1 to 240 whole minutes",
  );

  await page.goto("/zh-tw/tools/home-emergency-drill-record-generator/");
  await page.getByLabel("實際演練日期").fill("2026-08-23");
  await page.getByLabel("下次複查或重做日期").fill("2026-09-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("需要追蹤 1 筆");
  await expect(page.locator(".result")).toContainText("未測試 1 筆");
  await expect(page.locator(".result")).toContainText("不是住宅安全認證");
  await page
    .getByLabel("失聯、通訊與會合查核")
    .fill("回家會合 | 門禁碼 1234 | 電話 | 未測試");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "偵測到可能的密碼、門禁碼、金融識別資料",
  );

  await page.goto("/tools/emergency-supply-inventory-audit/");
  await page.getByLabel("Physical review date").fill("2026-08-23");
  await page.getByLabel("Next inventory review date").fill("2026-09-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Ready and observed 2");
  await expect(page.locator(".result")).toContainText("Rotate or replace 1");
  await expect(page.locator(".result")).toContainText("Verify requirement 1");
  await expect(page.locator(".result")).toContainText("not a readiness score");
  await page
    .getByLabel("Follow-up for every unresolved ID")
    .fill("POWER-1 | Charge and test | Adult 1 | 2026-09-01");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "Add one follow-up row for every unresolved supply ID: CARE-1",
  );

  await page.goto("/zh-tw/tools/emergency-supply-inventory-audit/");
  await page.getByLabel("實際逐項檢查日期").fill("2026-08-23");
  await page.getByLabel("下次物資複查日期").fill("2026-09-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("已確認可用 2 筆");
  await expect(page.locator(".result")).toContainText("需輪替或更換 1 筆");
  await expect(page.locator(".result")).toContainText("需求待查核 1 筆");
  await expect(page.locator(".result")).toContainText("不是防災準備分數");
  await page
    .getByLabel("每個未完成識別碼的追蹤")
    .fill("POWER-1 | 充電後實測 | 成人甲 | 2026-09-01\nCARE-1 | 核對需求 | 計畫持有人 | 2026-02-31");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "需要真實的 YYYY-MM-DD 日期",
  );

  await page.goto("/tools/emergency-contact-verification-log/");
  await page.getByLabel("Review completed date").fill("2026-08-23");
  await page.getByLabel("Next contact review date").fill("2026-09-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "Confirmed with person or official source 2",
  );
  await expect(page.locator(".result")).toContainText("Awaiting confirmation 1");
  await expect(page.locator(".result")).toContainText(
    "not an emergency-readiness score",
  );
  await page.getByLabel("Follow-up for every unresolved ID").fill("");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "Add one follow-up row for every unresolved contact ID: CARE-1",
  );
  await page
    .getByLabel("Contact verification rows")
    .fill("LOCAL-1 | Trusted nearby contact | Protected source LOCAL-1 | Phone +1 555 123 4567 | Person confirmed role | 2026-08-22 | Private household card only | Confirmed with person or official source");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "appears to contain a full phone number or email address",
  );

  await page.goto("/zh-tw/tools/emergency-contact-verification-log/");
  await page.getByLabel("實際完成複查日期").fill("2026-08-23");
  await page.getByLabel("下次聯絡資料複查日期").fill("2026-09-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("已由本人或官方來源確認 2 筆");
  await expect(page.locator(".result")).toContainText("等待確認 1 筆");
  await expect(page.locator(".result")).toContainText("不是防災準備分數");
  await page
    .getByLabel("聯絡資料驗證列")
    .fill("LOCAL-1 | 在地可信任聯絡人 | 受保護來源 LOCAL-1 | 手機末兩碼 42 | 本人確認角色與分享範圍 | 2026-02-30 | 家庭私用 | 已由本人或官方來源確認");
  await page.getByLabel("每個未完成識別碼的追蹤").fill("");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "需要真實的 YYYY-MM-DD 驗證日期",
  );

  await page.goto("/tools/household-power-outage-event-log/");
  await page.getByLabel("First observed outage date").fill("2026-08-22");
  await page.getByLabel("Next household review date").fill("2026-08-24");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Observed; monitoring 1");
  await expect(page.locator(".result")).toContainText(
    "Official or qualified follow-up pending 1",
  );
  await expect(page.locator(".result")).toContainText(
    "Not yet recorded; no restoration prediction made",
  );
  await expect(page.locator(".result")).toContainText(
    "does not establish the outage cause or exact utility duration",
  );
  await page
    .getByLabel("First observed time (24-hour HH:MM)")
    .fill("25:00");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "24-hour time in HH:MM format",
  );

  await page.goto("/zh-tw/tools/household-power-outage-event-log/");
  await page.getByLabel("第一次觀察到停電的日期").fill("2026-08-22");
  await page.getByLabel("家庭下次複查日期").fill("2026-08-24");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("已觀察持續追蹤 1 筆");
  await expect(page.locator(".result")).toContainText(
    "等待官方或合格人員查核 1 筆",
  );
  await expect(page.locator(".result")).toContainText(
    "尚未記錄；工具未預測復電時間",
  );
  await expect(page.locator(".result")).toContainText(
    "不證明停電原因或台電計算時數",
  );
  await page.getByLabel("第一次觀察時間（24 小時 HH:MM）").fill("24:01");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "24 小時制 HH:MM 時間",
  );

  await page.goto("/tools/household-water-leak-event-log/");
  await page.getByLabel("First observed date").fill("2026-08-22");
  await page.getByLabel("Next household review date").fill("2026-08-24");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Qualified assessment pending 1");
  await expect(page.locator(".result")).toContainText("Observed; monitoring 1");
  await expect(page.locator(".result")).toContainText(
    "Not yet recorded; active water or spread remains under observation",
  );
  await expect(page.locator(".result")).toContainText(
    "does not diagnose where water originated",
  );
  await page.getByLabel("First observed time (24-hour HH:MM)").fill("25:10");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("24-hour time in HH:MM format");

  await page.goto("/zh-tw/tools/household-water-leak-event-log/");
  await page.getByLabel("第一次觀察日期").fill("2026-08-22");
  await page.getByLabel("家庭下次複查日期").fill("2026-08-24");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("等待合格人員查核 1 筆");
  await expect(page.locator(".result")).toContainText("已觀察持續追蹤 1 筆");
  await expect(page.locator(".result")).toContainText("尚未記錄；仍觀察出水或範圍變化");
  await expect(page.locator(".result")).toContainText("不診斷水從何處來");
  await page.getByLabel("第一次觀察時間（24 小時 HH:MM）").fill("24:10");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("24 小時 HH:MM 時間");

  await page.goto("/tools/household-event-duration-calculator/");
  await page.getByLabel("Safe event label").fill("OUTAGE-A");
  await page.getByLabel("First observed date").fill("2026-08-20");
  await page.getByLabel("First observed time (HH:MM)").fill("09:00");
  await page.getByLabel("Second observation or end date").fill("2026-08-20");
  await page.getByLabel("Second observation or end time (HH:MM)").fill("12:30");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "Elapsed time: 0 days, 3 hours, 30 minutes",
  );

  await page.goto("/zh-tw/tools/household-event-duration-calculator/");
  await page.getByLabel("事件安全代稱").fill("停電-A");
  await page.getByLabel("第一次觀察日期").fill("2026-08-20");
  await page.getByLabel("第一次觀察時間（HH:MM）").fill("09:00");
  await page.getByLabel("第二個觀察或結束日期").fill("2026-08-20");
  await page.getByLabel("第二個觀察或結束時間（HH:MM）").fill("12:30");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("經過時間：0 天 3 小時 30 分鐘");

  await page.goto("/tools/household-event-source-index-log/");
  await page.getByLabel("Safe event code").fill("LEAK-A");
  await page.getByLabel("Review date").fill("2026-08-20");
  await page.getByLabel("Responsible source and document role").fill("Building notice / update");
  await page.getByLabel("Observation or evidence pointer").fill("OBS-1; protected photo set");
  await page.getByLabel("Next step and owner").fill("Recheck source version | household owner");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("household event source index");
  await expect(page.locator(".result")).toContainText("authenticate a source");

  await page.goto("/zh-tw/tools/household-event-source-index-log/");
  await page.getByLabel("事件安全代號").fill("漏水-A");
  await page.getByLabel("本次核對日期").fill("2026-08-20");
  await page.getByLabel("負責來源與文件角色").fill("大樓公告／更新");
  await page.getByLabel("觀察或證據索引").fill("OBS-1；受保護照片組");
  await page.getByLabel("下一步與負責角色").fill("複查來源版本／家庭管理者");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("家庭事件來源索引");
  await expect(page.locator(".result")).toContainText("不驗證來源真偽");

  await page.goto("/tools/household-storm-readiness-review/");
  await page.getByLabel("Review date", { exact: true }).fill("2026-08-23");
  await page.getByLabel("Next household review date").fill("2026-08-25");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "Physically checked for this review 2",
  );
  await expect(page.locator(".result")).toContainText(
    "Authority or building confirmation open 1",
  );
  await expect(page.locator(".result")).toContainText(
    "not a risk score or safety certificate",
  );
  await page.getByLabel("Review date", { exact: true }).fill("2099-08-24");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "review date cannot be in the future",
  );

  await page.goto("/zh-tw/tools/household-storm-readiness-review/");
  await page.getByLabel("本次複查日期").fill("2026-08-23");
  await page.getByLabel("家庭下次複查日期").fill("2026-08-25");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("本次已實物查核 2 筆");
  await expect(page.locator(".result")).toContainText(
    "等待官方、管理或合格人員確認 1 筆",
  );
  await expect(page.locator(".result")).toContainText(
    "不是風險分數或安全認證",
  );
  await page.getByLabel("家庭下次複查日期").fill("2026-08-22");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "家庭下次複查日期不能早於本次複查",
  );

  await page.goto("/tools/home-service-provider-verification-log/");
  await page.getByLabel("Verification review date").fill("2026-08-23");
  await page.getByLabel("Next household review date").fill("2026-08-25");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "Identity and relevant scope checked 1",
  );
  await expect(page.locator(".result")).toContainText(
    "Credential, insurance or permission confirmation open 1",
  );
  await expect(page.locator(".result")).toContainText(
    "not a provider score or endorsement",
  );
  await page.getByLabel("Protected evidence location").fill("Call 555-123-4567");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "possible full phone number, email or complete numeric identifier",
  );

  await page.goto("/zh-tw/tools/home-service-provider-verification-log/");
  await page.getByLabel("本次查核日期").fill("2026-08-23");
  await page.getByLabel("家庭下次複查日期").fill("2026-08-25");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "身分與適用服務範圍已依來源記錄 1 筆",
  );
  await expect(page.locator(".result")).toContainText(
    "資格、保險、許可或管理確認中 1 筆",
  );
  await expect(page.locator(".result")).toContainText("不是業者分數或背書");
  await page.getByLabel("受保護的原始證據位置").fill("門禁碼 1234");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "憑證、地址、金融、身分、保單、簽名或私人推薦人資料",
  );

  await page.goto("/tools/home-repair-change-order-log/");
  await page.getByLabel("Original agreement date").fill("2026-08-20");
  await page.getByLabel("Change record date").fill("2026-08-23");
  await page.getByLabel("Next household review date").fill("2026-08-30");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Accepted change effect: +2,500");
  await expect(page.locator(".result")).toContainText("Reconciled arithmetic amount: 122,500");
  await expect(page.locator(".result")).toContainText("Accepted schedule effect: +2 calendar days");
  await expect(page.locator(".result")).toContainText("Pending proposed effects: 1");
  await expect(page.locator(".result")).toContainText("does not create or amend a contract");
  await page.getByLabel("Versioned change rows").fill(
    "CHG-1 | 2026-08-23 | Project owner | Add one shelf | Written request REQ-1 | pending | 1 | APPROVAL-1 | Project owner | Approved in writing—not yet completed",
  );
  await page.getByLabel("Follow-up for every open change ID").fill(
    "CHG-1 | Preserve close-out evidence | Project owner | 2026-08-28",
  );
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "Approved or completed change line 1 needs numeric cost and time effects",
  );

  await page.goto("/zh-tw/tools/home-repair-change-order-log/");
  await page.getByLabel("原約定日期").fill("2026-08-20");
  await page.getByLabel("本次變更紀錄日期").fill("2026-08-23");
  await page.getByLabel("家庭下次複查日期").fill("2026-08-30");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("已同意變更影響：+2,500");
  await expect(page.locator(".result")).toContainText("目前算術總額：122,500");
  await expect(page.locator(".result")).toContainText("已同意工期影響：+2 日曆天");
  await expect(page.locator(".result")).toContainText("仍為 pending 的提案效果：1 筆");
  await expect(page.locator(".result")).toContainText("不建立或變更契約");
  await page.getByLabel("有版本的追加變更列").fill(
    "CHG-1 | 2026-08-23 | 家庭工程負責人 | 取消一座上櫃 | 家庭書面決定 DEC-1 | 100 | 0 | 已拒絕 DEC-1 | 工程負責人 | 已拒絕或撤回，且已記理由",
  );
  await page.getByLabel("每個未結案變更 ID 的追蹤").fill("");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "已拒絕或撤回的變更第 1 行必須使用費用 0、工期 0",
  );

  await page.goto("/tools/home-repair-punch-list/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open items: 1");
  await expect(page.locator(".result")).toContainText("Closed or archived items: 1");
  await expect(page.locator(".result")).toContainText("does not inspect work or concealed conditions");
  await page.getByLabel("Versioned punch-list rows").fill(
    "PL-1 | Kitchen east cabinet | Door contacts adjacent panel during full opening | CONTRACT-C1 | 2026-08-23 | PHOTO-18 | Obtain written response and schedule a dated recheck | Project owner | 2026-08-22 | Observed—written response pending",
  );
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "needs a target or recheck date from this review",
  );

  await page.goto("/zh-tw/tools/home-repair-punch-list/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放：1 筆");
  await expect(page.locator(".result")).toContainText("已關閉或封存：1 筆");
  await expect(page.locator(".result")).toContainText("不檢查施工或隱蔽工程");
  await page.getByLabel("有版本的缺失複查列").fill(
    "PL-1 | 廚房東側櫃門 | 全開時碰到旁板 | CONTRACT-C1 | 2026-08-23 | PHOTO-18 | 取得書面回覆並安排有日期的再次查看 | 家庭工程負責人 | 2026-08-22 | 已觀察，等待書面回覆",
  );
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "目標或複查日必須從本次紀錄日起",
  );

  await page.goto("/tools/home-repair-closeout-checklist/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open requests or reviews: 2");
  await expect(page.locator(".result")).toContainText("Filed, not applicable or archived gaps: 1");
  await expect(page.locator(".result")).toContainText("does not inspect work");
  await page.getByLabel("Versioned close-out package rows").fill(
    "CO-1 | Final invoice | Final invoice linked to approved changes | CONTRACT-C1 and CHG-1 | Provider billing role | 2026-08-23 | INVOICE-04 | Preserve the received invoice and finish the household review | Household project owner | 2026-08-22 | Received—household review pending",
  );
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "needs a target date from this review",
  );

  await page.goto("/zh-tw/tools/home-repair-closeout-checklist/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍在索取或檢視：2 筆");
  await expect(page.locator(".result")).toContainText("已歸檔、不適用或封存缺件：1 筆");
  await expect(page.locator(".result")).toContainText("不檢查施工");
  await page.getByLabel("有版本的結案資料包列").fill(
    "CO-1 | 最後發票 | 連結已同意變更的最後發票 | CONTRACT-C1 與 CHG-1 | 業者請款角色 | 2026-08-23 | INVOICE-04 | 保存收到的發票並完成家庭檢視 | 家庭工程負責人 | 2026-08-22 | 已收到，等待家庭檢視",
  );
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "目標日必須從本次檢視日起",
  );

  await page.goto("/tools/warranty-claim-evidence-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open events: 3");
  await expect(page.locator(".result")).toContainText("Closed or handed-off events: 0");
  await expect(page.locator(".result")).toContainText("does not diagnose a product");
  await page.getByLabel("Versioned warranty-claim timeline events").fill(
    "WR-1 | Provider response | Provider acknowledged the request without a coverage position | Warranty-provider support role | 2026-08-23 | RESPONSE-R1 | Ask for an attributed written outcome after the scheduled review | Household asset owner | 2026-08-22 | Response received—source linked",
  );
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "needs a target date from this review",
  );

  await page.goto("/zh-tw/tools/warranty-claim-evidence-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放事件：3 筆");
  await expect(page.locator(".result")).toContainText("已結案或移交事件：0 筆");
  await expect(page.locator(".result")).toContainText("不診斷產品");
  await page.getByLabel("有版本的保固申請時間線事件").fill(
    "WR-1 | 業者回覆 | 業者確認收到申請但未表示保固涵蓋結論 | 保證提供者客服角色 | 2026-08-23 | RESPONSE-R1 | 於預定檢視後索取有來源的書面結果 | 家庭資產負責人 | 2026-08-22 | 已收到回覆，連結來源",
  );
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "目標日必須從本次檢視日起",
  );

  await page.goto("/tools/product-recall-action-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open actions: 2");
  await expect(page.locator(".result")).toContainText("Completed, not affected or no longer held: 0");
  await expect(page.locator(".result")).toContainText("does not search current recalls");
  await page.getByLabel("Versioned recall action rows").fill(
    "RC-1 | Official match response | Manufacturer source confirmed the protected unit is included and linked the current remedy instruction | Manufacturer recall role | 2026-08-23 | RESPONSE-RC1 | Preserve the current instruction and request the next attributed remedy step | Household asset owner | 2026-08-22 | Affected status confirmed—official source linked",
  );
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "needs a target date from this review",
  );

  await page.goto("/zh-tw/tools/product-recall-action-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放行動：2 筆");
  await expect(page.locator(".result")).toContainText("已完成、未受影響或家庭已不持有：0 筆");
  await expect(page.locator(".result")).toContainText("不查詢現行召回");
  await page.getByLabel("有版本的召回處置行動").fill(
    "RC-1 | 官方比對回覆 | 業者來源確認受保護產品在公告範圍並連結現行改善指示 | 業者召回角色 | 2026-08-23 | RESPONSE-RC1 | 保存現行指示並要求下一個有來源的改善步驟 | 家庭資產負責人 | 2026-08-22 | 已確認受影響，連結官方來源",
  );
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "目標日必須從本次複查日起",
  );

  await page.goto("/tools/appliance-service-visit-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open events: 2");
  await expect(page.locator(".result")).toContainText("Closed, deferred or handed-off events: 0");
  await expect(page.locator(".result")).toContainText("does not inspect or diagnose equipment");
  await page.getByLabel("Versioned service visit event rows").fill(
    "SV-1 | On-site finding | Provider report preserved an attributable finding without a household diagnosis | Independent repair provider service role | 2026-08-24 | SERVICE-S2 | Review the written finding and decide whether to authorize only the quoted scope | Household asset owner | 2026-08-23 | Visit finding recorded—decision pending",
  );
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "needs a target date from this review",
  );

  await page.goto("/zh-tw/tools/appliance-service-visit-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放事件：2 筆");
  await expect(page.locator(".result")).toContainText("已結案、暫緩或移交事件：0 筆");
  await expect(page.locator(".result")).toContainText("不檢驗或診斷設備");
  await page.getByLabel("有版本的服務訪視事件列").fill(
    "SV-1 | 到場發現 | 業者服務報告保存可歸屬的發現，家庭沒有自行診斷 | 獨立維修業者服務角色 | 2026-08-24 | SERVICE-S2 | 複查書面發現並只針對報價範圍決定是否授權 | 家庭資產負責人 | 2026-08-23 | 訪視發現已記錄，等待決定",
  );
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "目標日必須從本次檢視日起",
  );

  await page.goto("/tools/appliance-repair-callback-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open callback events: 2");
  await expect(page.locator(".result")).toContainText("Closed, separated, handed-off or deferred events: 0");
  await expect(page.locator(".result")).toContainText("does not inspect or diagnose equipment");
  await page.getByLabel("Versioned repair callback event rows").fill(
    "CB-1 | Provider response | Provider support source acknowledged the recurrence and proposed another inspection without deciding cause | Provider support role | 2026-08-24 | SERVICE-S2 | RESPONSE-C2 | Preserve the proposed scope before deciding whether to arrange another visit | Household asset owner | 2026-08-23 | Provider response recorded—scope decision pending",
  );
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "needs a target date from this review",
  );

  await page.goto("/zh-tw/tools/appliance-repair-callback-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放 callback 事件：2 筆");
  await expect(page.locator(".result")).toContainText("已結案、分流、移交、暫緩或拒絕事件：0 筆");
  await expect(page.locator(".result")).toContainText("不檢驗或診斷設備");
  await page.getByLabel("有版本的維修後 callback 事件列").fill(
    "CB-1 | 業者回覆 | 業者客服來源確認收到復發紀錄並提出再次檢查，不判定原因 | 業者客服角色 | 2026-08-24 | SERVICE-S2 | RESPONSE-C2 | 先保存業者提出的範圍，再決定是否安排到場 | 家庭資產負責人 | 2026-08-23 | 已記錄業者回覆，等待範圍決定",
  );
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "目標日必須從本次檢視日起",
  );

  await page.goto("/tools/appliance-purchase-installation-record/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open activation events: 2");
  await expect(page.locator(".result")).toContainText("Active, limited, transferred or returned events: 0");
  await expect(page.locator(".result")).toContainText("Purchase source recorded—delivery pending 1");
  await page.getByLabel("Next household evidence checkpoint").fill("2026-08-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );

  await page.goto("/zh-tw/tools/appliance-purchase-installation-record/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放啟用事件：2 筆");
  await expect(page.locator(".result")).toContainText("已啟用、有限歸檔、移轉或退貨事件：0 筆");
  await expect(page.locator(".result")).toContainText("已記錄購買來源，等待交貨 1 筆");
  await page.getByLabel("家庭下次證據查核點").fill("2026-08-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次檢視日",
  );

  await page.goto("/tools/purchase-delivery-evidence-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open purchase and delivery events: 2");
  await expect(page.locator(".result")).toContainText("Kept, completed or handed-off events: 0");
  await expect(page.locator(".result")).toContainText("Purchase source recorded—fulfillment pending 1");
  await page.getByLabel("Next household evidence checkpoint").fill("2026-08-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );

  await page.goto("/zh-tw/tools/purchase-delivery-evidence-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放購買與到貨事件：2 筆");
  await expect(page.locator(".result")).toContainText("已保留、完成或移交事件：0 筆");
  await expect(page.locator(".result")).toContainText("已記錄購買來源，等待履行 1 筆");
  await page.getByLabel("家庭下次證據查核點").fill("2026-08-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次檢視日",
  );

  await page.goto("/tools/moving-box-handover-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open moving-box events: 2");
  await expect(page.locator(".result")).toContainText("Reconciled, completed or handed-off events: 0");
  await expect(page.locator(".result")).toContainText("Packed and household-indexed—loading handoff pending 1");
  await page.getByLabel("Next box reconciliation checkpoint").fill("2026-08-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );

  await page.goto("/zh-tw/tools/moving-box-handover-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放箱件事件：2 筆");
  await expect(page.locator(".result")).toContainText("已核對、完成或移交事件：0 筆");
  await expect(page.locator(".result")).toContainText("已裝箱並建立家庭索引，等待裝載交接 1 筆");
  await page.getByLabel("下一個箱件核對點").fill("2026-08-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次檢視日",
  );

  await page.goto("/tools/storage-unit-access-inventory-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open storage events: 2");
  await expect(page.locator(".result")).toContainText("Reconciled, completed or handed-off events: 0");
  await expect(page.locator(".result")).toContainText("Baseline indexed—first placement reconciliation pending 1");
  await page.getByLabel("Next visit or inventory checkpoint").fill("2026-08-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );

  await page.goto("/zh-tw/tools/storage-unit-access-inventory-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放倉位事件：2 筆");
  await expect(page.locator(".result")).toContainText("已核對、完成或移交事件：0 筆");
  await expect(page.locator(".result")).toContainText("已建立基線索引，等待首次箱位核對 1 筆");
  await page.getByLabel("下一次訪視或物品核對點").fill("2026-08-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次檢視日",
  );

  await page.goto("/tools/household-record-retrieval-drill-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open prompts, attempts or corrections: 2");
  await expect(page.locator(".result")).toContainText("Passed, archived or handed-off rows: 0");
  await expect(page.locator(".result")).toContainText("Source located—current-source review pending 1");
  await page.getByLabel("Next correction or retest checkpoint").fill("2026-08-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current drill review date",
  );

  await page.goto("/zh-tw/tools/household-record-retrieval-drill-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放題目、嘗試或修正：2 筆");
  await expect(page.locator(".result")).toContainText("已通過、封存或移交：0 筆");
  await expect(page.locator(".result")).toContainText("已找到來源，等待最新來源核對 1 筆");
  await page.getByLabel("下一次修正或複測點").fill("2026-08-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次演練檢視日",
  );

  await page.goto("/tools/important-household-document-review/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open source, protection or replacement gaps: 2");
  await expect(page.locator(".result")).toContainText("Reconciled, not-applicable or archived rows: 0");
  await expect(page.locator(".result")).toContainText("Replacement or reconstruction route recorded—follow-up pending 1");
  await page.getByLabel("Next source or access checkpoint").fill("2026-08-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current coverage review date",
  );

  await page.goto("/zh-tw/tools/important-household-document-review/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放的來源、保護或補發缺口：2 筆");
  await expect(page.locator(".result")).toContainText("已核對、不適用或封存：0 筆");
  await expect(page.locator(".result")).toContainText("已記錄補發或重建路徑，等待後續 1 筆");
  await page.getByLabel("下一次來源或存取查核點").fill("2026-08-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次適用性盤點日",
  );

  await page.goto("/tools/household-record-retention-decision-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open source, trigger, screen or action rows: 2");
  await expect(page.locator(".result")).toContainText("Closed continued-retention, disposal, transfer or not-applicable rows: 0");
  await expect(page.locator(".result")).toContainText("Source located—current rule not yet reviewed 1");
  await page.getByLabel("Next policy or source checkpoint").fill("2026-08-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current decision review",
  );
  await page.goto("/tools/household-record-retention-decision-log/");
  await page.getByLabel("Protected originals, approvals and decision-evidence location").fill("account number 123456789");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("possible full phone number, email, address, account");

  await page.goto("/zh-tw/tools/household-record-retention-decision-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放的來源、事件、檢查或動作：2 筆");
  await expect(page.locator(".result")).toContainText("已結束本版的保存、處分、移交或不適用：0 筆");
  await expect(page.locator(".result")).toContainText("已找到來源，尚未核對目前規則 1 筆");
  await page.getByLabel("下一次規則或來源核點").fill("2026-08-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次保存決策檢視日",
  );

  await page.goto("/tools/appliance-manual-source-check-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open model, source, coverage, access or safety rows: 1");
  await expect(page.locator(".result")).toContainText("Reviewed, retired or not-applicable rows: 1");
  await expect(page.locator(".result")).toContainText("Source, coverage, access and notice routes reviewed 1");
  await page.getByLabel("Next source or access checkpoint").fill("2026-08-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );
  await page.goto("/tools/appliance-manual-source-check-log/");
  await page.getByLabel("Protected labels, full manuals, saved copies and review-history location").fill("account number 123456789");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("possible full phone, email, address, account");

  await page.goto("/zh-tw/tools/appliance-manual-source-check-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放的型號、來源、範圍、存取或安全列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對、退役或不適用列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對來源、範圍、存取與公告入口 1 筆");
  await page.getByLabel("下一次來源或存取核點").fill("2026-08-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次核對日",
  );

  await page.goto("/tools/household-insurance-policy-source-version-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open source, insurer, document, version, access or status rows: 1");
  await expect(page.locator(".result")).toContainText("Reviewed, ended or not-applicable rows: 1");
  await expect(page.locator(".result")).toContainText("Issued source, document relationship, access and status routes reviewed 1");
  await page.getByLabel("Next source or status checkpoint").fill("2026-08-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );
  await page.goto("/tools/household-insurance-policy-source-version-log/");
  await page.getByLabel("Protected issued policies, endorsements, notices and review-history location").fill("policy number 123456789");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("possible full phone number, email, policy, claim");

  await page.goto("/zh-tw/tools/household-insurance-policy-source-version-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放的來源、公司、文件、版本、存取或狀態列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對、終止或不適用列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對發行來源、文件關係、存取與狀態入口 1 筆");
  await page.getByLabel("下一次來源或狀態核點").fill("2026-08-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次保單來源核對日",
  );

  await page.goto("/tools/household-utility-provider-service-handoff-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open provider, responsibility, access, status, safety or confirmation rows: 1");
  await expect(page.locator(".result")).toContainText("Reviewed, completed or not-applicable rows: 1");
  await expect(page.locator(".result")).toContainText("Provider source, responsibility, access, status and handoff reviewed 1");
  await page.getByLabel("Next source or handoff checkpoint").fill("2026-08-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );
  await page.goto("/tools/household-utility-provider-service-handoff-log/");
  await page.getByLabel("Protected statements, confirmations, equipment and review-history location").fill("account number 123456789");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("possible full phone, email, address, utility account");

  await page.goto("/zh-tw/tools/household-utility-provider-service-handoff-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放的供應、責任、存取、狀態、安全或確認列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對、完成或不適用列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對供應來源、責任、存取、狀態與交接入口 1 筆");
  await page.getByLabel("下一次來源或交接核點").fill("2026-08-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次核對日",
  );

  await page.goto("/tools/household-vehicle-document-source-status-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open document, match, version, access, status, safety or result rows: 1");
  await expect(page.locator(".result")).toContainText("Reviewed, completed or not-applicable rows: 1");
  await expect(page.locator(".result")).toContainText("Source, vehicle match, version, access and status reviewed 1");
  await page.getByLabel("Next source or action checkpoint").fill("2026-08-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );
  await page.goto("/tools/household-vehicle-document-source-status-log/");
  await page.getByLabel("Protected title, registration, insurance, inspection, recall, lien, transaction and review-history location").fill("VIN number 1HGCM82633A004352");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("possible address, person, plate, VIN, vehicle, title");

  await page.goto("/zh-tw/tools/household-vehicle-document-source-status-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放的文件、車輛比對、版本、存取、狀態、安全或結果列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對、完成或不適用列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對來源、車輛比對、版本、存取與狀態 1 筆");
  await page.getByLabel("下一次來源或行動核點").fill("2026-08-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次車輛文件核對日",
  );

  await page.goto("/tools/household-pet-record-source-handoff-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open source, pet-match, version, access, handoff or result rows: 1");
  await expect(page.locator(".result")).toContainText("Reviewed, completed or not-applicable rows: 1");
  await expect(page.locator(".result")).toContainText("Source, pet match, version, access and handoff reviewed 1");
  await page.getByLabel("Next source, care or action checkpoint").fill("2026-08-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );
  await page.goto("/tools/household-pet-record-source-handoff-log/");
  await page.getByLabel("Protected registry, microchip, vaccination, veterinary, travel, boarding and review-history location").fill("medication name: example; dose: 5 mg");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("possible identity, address, chip, registry, vaccination, health, prescription, dose");

  await page.goto("/zh-tw/tools/household-pet-record-source-handoff-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放的來源、寵物比對、版本、存取、交接或結果列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對、完成或不適用列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對來源、寵物比對、版本、存取與交接 1 筆");
  await page.getByLabel("下一次來源、照護或行動核點").fill("2026-08-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次寵物紀錄核對日",
  );

  await page.goto("/tools/household-school-record-source-handoff-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open source, student-match, version, access, handoff or school-result rows: 1");
  await expect(page.locator(".result")).toContainText("Reviewed, completed or not-applicable rows: 1");
  await expect(page.locator(".result")).toContainText("Source, student match, version, access and handoff reviewed 1");
  await page.getByLabel("Next source, handoff or school-result checkpoint").fill("2026-08-23");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );
  await page.goto("/tools/household-school-record-source-handoff-log/");
  await page.getByLabel("Protected enrollment, assessment, support, health, consent and review-history location").fill("student name: example; grade: A");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("possible student identity, school, address, grade, attendance");

  await page.goto("/zh-tw/tools/household-school-record-source-handoff-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放的來源、學生比對、版本、存取、交接或校方結果列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對、完成或不適用列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對來源、學生比對、版本、存取與交接 1 筆");
  await page.getByLabel("下一次來源、交接或校方結果核點").fill("2026-08-23");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次家庭學校紀錄核對日",
  );

  await page.goto("/tools/household-medical-information-source-handoff-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open source, person-match, version, access, handoff or responsible-result rows: 1");
  await expect(page.locator(".result")).toContainText("Reviewed, completed or not-applicable rows: 1");
  await expect(page.locator(".result")).toContainText("Source, protected person match, version, access and handoff reviewed 1");
  await page.getByLabel("Next source, handoff or responsible-result checkpoint").fill("2026-08-25");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );
  await page.goto("/tools/household-medical-information-source-handoff-log/");
  await page.getByLabel("Protected provider, plan, pharmacy, record, authorization and review-history location").fill("patient name: example; medication name: aspirin");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("possible patient identity, provider, address, diagnosis, medication, dose, test");

  await page.goto("/zh-tw/tools/household-medical-information-source-handoff-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放的來源、本人比對、版本、存取、交接或負責結果列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對、完成或不適用列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對來源、受保護本人比對、版本、存取與交接 1 筆");
  await page.getByLabel("下一次來源、交接或負責結果核點").fill("2026-08-25");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次家庭醫療資訊核對日",
  );

  await page.goto("/tools/caregiver-handoff-source-authorization-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open source, person-match, version, authority, access, handoff or acceptance rows: 1");
  await expect(page.locator(".result")).toContainText("Reviewed, completed or not-applicable rows: 1");
  await expect(page.locator(".result")).toContainText("Source, protected person match, version, authority, access and handoff reviewed 1");
  await page.getByLabel("Next source, handoff or acceptance-result checkpoint").fill("2026-08-25");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );
  await page.goto("/tools/caregiver-handoff-source-authorization-log/");
  await page.getByLabel("Protected care-plan, authority, service, access and handoff-history location").fill("patient name: example; medication name: aspirin");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("possible care-recipient identity, provider, address, diagnosis, medication, dose, feeding, mobility");

  await page.goto("/zh-tw/tools/caregiver-handoff-source-authorization-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放的來源、本人比對、版本、權限、存取、交接或接受結果列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對、完成或不適用列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對來源、受保護本人比對、版本、權限、存取與交接 1 筆");
  await page.getByLabel("下一次來源、交接或接受結果核點").fill("2026-08-25");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次照護者交接核對日",
  );

  await page.goto("/tools/home-care-visit-scope-service-result-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open source, person-match, version, visit-evidence, exception or agency-result rows: 1");
  await expect(page.locator(".result")).toContainText("Reviewed, completed or not-applicable rows: 1");
  await expect(page.locator(".result")).toContainText("Source, protected person match, version, visit evidence and service result reviewed 1");
  await page.getByLabel("Next visit, exception or responsible-result checkpoint").fill("2026-08-25");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );
  await page.goto("/tools/home-care-visit-scope-service-result-log/");
  await page.getByLabel("Protected agency, service-plan, EVV, exception, complaint and review-history location").fill("patient name: example; medication name: aspirin; exact time: 08:15");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("possible care-recipient identity, provider, address, diagnosis, medication, dose, feeding, mobility, exact time or location");

  await page.goto("/zh-tw/tools/home-care-visit-scope-service-result-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放的來源、本人比對、版本、到訪證據、例外或服務單位結果列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對、完成或不適用列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對來源、受保護本人比對、版本、到訪證據與服務結果 1 筆");
  await page.getByLabel("下一次到訪、例外或負責結果核點").fill("2026-08-25");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次居家照護服務核對日",
  );

  await page.goto("/tools/home-care-service-plan-change-notice-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open source, version, notice, response, transition or review rows: 1");
  await expect(page.locator(".result")).toContainText("Reviewed, completed or not-applicable rows: 1");
  await expect(page.locator(".result")).toContainText("Change source, versions, notice, response, transition and first changed-service result reviewed 1");
  await page.getByLabel("Next notice, transition or first changed-service checkpoint").fill("2026-08-25");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );
  await page.goto("/tools/home-care-service-plan-change-notice-log/");
  await page.getByLabel("Protected plan, contract, notice, response, service-transition and review-history location").fill("patient name: example; medication name: aspirin; notice text: private");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("possible identity, provider, address, health or care, worker, exact time or location");

  await page.goto("/zh-tw/tools/home-care-service-plan-change-notice-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放的來源、版本、通知、回應、銜接或審查列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對、完成或不適用列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對變更來源、版本、通知、回應、銜接與首次新版服務結果 1 筆");
  await page.getByLabel("下一次通知、銜接或首次新版服務核點").fill("2026-08-25");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次核對日",
  );

  await page.goto("/tools/home-care-service-interruption-backup-continuity-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open safety, source, version, backup, replacement-service or review rows: 1");
  await expect(page.locator(".result")).toContainText("Reviewed, completed or not-applicable rows: 1");
  await expect(page.locator(".result")).toContainText("Interruption source, safety route, backup decision, replacement service and resumption result reviewed 1");
  await page.getByLabel("Next replacement-service, resumption or responsible-result checkpoint").fill("2026-08-25");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );
  await page.goto("/tools/home-care-service-interruption-backup-continuity-log/");
  await page.getByLabel("Protected schedule, contract, agency response, backup, actual-result and complaint-history location").fill("patient name: example; medication name: aspirin; exact time: 08:15");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("possible identity, provider, address, health or care, worker, interruption-cause, exact time or location");

  await page.goto("/zh-tw/tools/home-care-service-interruption-backup-continuity-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放的安全、來源、版本、備援、替代服務或審查列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對、完成或不適用列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對中斷來源、安全路徑、備援決定、替代服務與恢復結果 1 筆");
  await page.getByLabel("下一次替代服務、恢復或負責結果核點").fill("2026-08-25");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次核對日",
  );

  await page.goto("/tools/home-care-complaint-response-resolution-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open safety, source, intake, investigation, response, correction or review rows: 1");
  await expect(page.locator(".result")).toContainText("Reviewed, completed or not-applicable rows: 1");
  await expect(page.locator(".result")).toContainText("Concern source, intake, investigation, participation, response and actual improvement result reviewed 1");
  await page.getByLabel("Next investigation, response or actual-improvement checkpoint").fill("2026-08-25");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText(
    "cannot be earlier than the current review",
  );
  await page.goto("/tools/home-care-complaint-response-resolution-log/");
  await page.getByLabel("Protected event, receipt, investigation, response, correction, result and complaint-history location").fill("patient name: example; medication name: aspirin; complaint text: private");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("possible identity, provider, address, health or care, worker, exact time or location, case or cost, allegation or evidence or complaint text");

  await page.goto("/zh-tw/tools/home-care-complaint-response-resolution-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放的安全、來源、受理、調查、回覆、改善或審查列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對、完成或不適用列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對疑慮來源、受理、調查、本人參與、回覆與實際改善結果 1 筆");
  await page.getByLabel("下一次調查、回覆或實際改善結果核點").fill("2026-08-25");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不能早於本次核對日",
  );

  await page.goto("/tools/home-care-charge-service-payment-discrepancy-log/");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("Open source, version, service, charge, benefit, payment or review rows: 1");
  await expect(page.locator(".result")).toContainText("Reviewed, completed or not-applicable rows: 1");
  await expect(page.locator(".result")).toContainText("Source, version, actual service, charge, benefit, household responsibility and actual account result reviewed 1");
  await expect(page.locator(".result")).toContainText("Entered expected household responsibility total (arithmetic only): USD 200.00");
  await expect(page.locator(".result")).toContainText("Entered billed total (arithmetic only): USD 240.00");
  await expect(page.locator(".result")).toContainText("Entered paid total (arithmetic only): USD 120.00");
  await expect(page.locator(".result")).toContainText("Entered observed refund or credit total (arithmetic only): USD 0.00");
  await expect(page.locator(".result")).toContainText("Billed minus expected difference (arithmetic only, not an amount owed or refundable): USD 40.00");
  await page.getByLabel("Next correction, benefit or actual-account checkpoint").fill("2026-08-26");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("cannot be earlier than the current review");
  await page.goto("/tools/home-care-charge-service-payment-discrepancy-log/");
  await page.getByLabel("Protected service, contract, fee, statement, receipt, payment, benefit and dispute-history location").fill("patient name: example; card number: 4111111111111111");
  await page.getByRole("button", { name: "Generate result" }).click();
  await expect(page.locator(".result")).toContainText("possible full phone, email, account, member, case, statement, receipt, benefit, payment-instrument or other long numeric identifier");

  await page.goto("/zh-tw/tools/home-care-charge-service-payment-discrepancy-log/");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("仍開放的來源、版本、服務、費用、給付、付款或審查列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對、完成或不適用列：1 筆");
  await expect(page.locator(".result")).toContainText("已核對來源、版本、實際服務、費用、給付、家庭責任與實際帳務結果 1 筆");
  await expect(page.locator(".result")).toContainText("輸入列預期家庭責任合計（僅算術）：TWD 2,000.00");
  await expect(page.locator(".result")).toContainText("輸入列帳單金額合計（僅算術）：TWD 2,400.00");
  await expect(page.locator(".result")).toContainText("輸入列已付款合計（僅算術）：TWD 1,200.00");
  await expect(page.locator(".result")).toContainText("輸入列已觀察退費或折抵合計（僅算術）：TWD 0.00");
  await expect(page.locator(".result")).toContainText("帳單減預期差額（僅算術，不代表應付或可退）：TWD 400.00");
  await page.getByLabel("下一次更正、給付或實際帳務結果核點").fill("2026-08-26");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("不能早於本次核對日");

  await page.goto("/zh-tw/tools/vacation-shutdown-checklist-generator/");
  await page.getByLabel("離家日期").fill("2026-09-01");
  await page.getByLabel("預計返家日期").fill("2026-09-08");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("離家日數：7 天");
  await expect(page.locator(".result")).toContainText("貓咪｜代管：家庭照護者");
  await expect(page.locator(".result")).toContainText("不會查詢即時天氣");
  await page.getByLabel("需要交接的照護或收取事項").fill("貓咪 | 家庭照護者");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("第 1 行格式不完整");

  await page.goto("/zh-tw/tools/house-sitter-instruction-generator/");
  await page.getByLabel("看家開始日期").fill("2026-09-01");
  await page.getByLabel("預計結束日期").fill("2026-09-03");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("含首尾共 3 天");
  await expect(page.locator(".result")).toContainText(
    "收到通知時｜依管理規則領取包裹",
  );
  await expect(page.locator(".result")).toContainText("接受人／日期");
  await page
    .getByLabel("屋主／家庭主要聯絡方式")
    .fill("家庭主要聯絡人／門禁碼 1234");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "偵測到可能的密碼、門禁碼或驗證碼",
  );

  await page.goto("/zh-tw/tools/pet-sitter-instruction-generator/");
  await page.getByLabel("照護開始日期").fill("2026-09-01");
  await page.getByLabel("照護結束日期").fill("2026-09-03");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("米米｜貓｜可見辨識");
  await expect(page.locator(".result")).toContainText(
    "不計算食物份量、藥物劑量或治療方法",
  );
  await page
    .getByLabel("飼主已確認的照護工作")
    .fill("豆豆 | 每日 07:00 | 提供早餐");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "動物名字未出現在辨識資料",
  );

  await page.goto("/zh-tw/tools/home-handoff-summary-generator/");
  await page.getByLabel("本次交接用途").selectOption("主要整理人更換");
  await page.getByLabel("交接生效日期").fill("2026-09-01");
  await page.getByLabel("交接到期日期").fill("2026-09-30");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("主要整理人更換");
  await expect(page.locator(".result")).toContainText(
    "逐項確認正式負責人、權限、文件位置與未結事項",
  );
  await expect(page.locator(".result")).toContainText("明確排除");
  await page.getByLabel("本次明確納入的資料類別").fill("帳號密碼");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "不應納入一般交接摘要",
  );

  await page.goto("/zh-tw/tools/appliance-replacement-planner/");
  await page.getByLabel("已知購買、交付或安裝日期").fill("2020-08-22");
  await page.getByLabel("下次人工複查日期").fill("2026-11-22");
  await page
    .getByLabel("目前查核狀況")
    .selectOption("已有書面維修估價待評估");
  await page
    .getByRole("spinbutton", { name: "目前書面維修估價（新台幣，可填 0）" })
    .fill("6000");
  await page
    .getByRole("spinbutton", { name: "目前替代方案書面報價（新台幣，可填 0）" })
    .fill("30000");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("家電汰換查證卡");
  await expect(page.locator(".result")).toContainText("20%");
  await expect(page.locator(".result")).toContainText("金額比例只是把兩份目前輸入");
  await page
    .getByLabel("目前查核狀況")
    .selectOption("有安全警示、召回或應停用跡象");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("安全優先");

  await page.goto("/zh-tw/tools/room-inventory-generator/");
  await page.getByLabel("房間類型").selectOption("廚房");
  await page.getByLabel("本次盤點用途").selectOption("保險資料準備");
  await page.getByLabel("本次盤點日期").fill("2026-08-22");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("單一房間盤點工作表");
  await expect(page.locator(".result")).toContainText("第一輪：依實際走動順序完成區帶");
  await expect(page.locator(".result")).toContainText("實際保單要求的其他資料");
  await expect(page.locator(".result")).toContainText("咖啡器材");

  await page.goto("/zh-tw/tools/warranty-checklist-generator/");
  await page.getByLabel("交易日期").fill("2026-08-01");
  await page.getByLabel("依書面內容確認的起算日").fill("2026-08-12");
  await page.getByLabel("下次人工複查日期").fill("2027-07-12");
  await page
    .getByLabel("產品登錄要求的查核結果")
    .selectOption("書面內容要求登錄但尚未完成");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("保固資料查核卡");
  await expect(page.locator(".result")).toContainText("待辦：回到實際書面條款確認期限");
  await expect(page.locator(".result")).toContainText("不計算到期日");

  await page.goto("/zh-tw/tools/annual-subscription-cost-calculator/");
  await page.getByLabel("目前每次實際扣款金額").fill("0");
  await page.getByLabel("真正扣款週期").selectOption("每月");
  await page.getByLabel("目前價格階段").selectOption("促銷或免費試用仍有效");
  await page
    .getByLabel("促銷結束後每次標準扣款（非促銷可填同額）")
    .fill("320");
  await page.getByLabel("促銷或免費試用結束日（非促銷可留空）").fill("2026-09-10");
  await page.getByLabel("已核對的下次扣款／續約日").fill("2026-09-30");
  await page.getByRole("spinbutton", { name: "預留幾天做續約決定" }).fill("10");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("標準價年化：NT$3,840");
  await expect(page.locator(".result")).toContainText("2026年9月20日");
  await expect(page.locator(".result")).toContainText("無法以目前 0 元價格計算百分比");

  await page.goto("/zh-tw/tools/emergency-binder-generator/");
  await page.getByLabel("本次全家核對日期").fill("2026-08-22");
  await page.getByLabel("下次全家複查日期").fill("2027-02-22");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("可分享的家庭防災卡");
  await expect(page.locator(".result")).toContainText("火災、救護與急難救助：119");
  await expect(page.locator(".result")).toContainText("只放位置索引的受保護部分");
  await page
    .getByLabel("家庭與必要服務聯絡")
    .fill("家庭主要聯絡 | 家人 | 門禁碼 1234");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("不應放入可分享防災卡");

  await page.goto("/zh-tw/tools/cleaning-schedule-generator/");
  await page.getByLabel("第一輪開始日期").fill("2026-08-22");
  await page.getByRole("spinbutton", { name: "全家每天可用分鐘" }).fill("20");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("超出目前每日容量 10 分鐘");
  await expect(page.locator(".result")).toContainText("2026年8月22日｜廚房");
  await expect(page.locator(".result")).toContainText("平均件數不等於公平");
  await page
    .getByLabel("安全、健康或能力限制")
    .fill("清潔用品 | 漂白水與鹽酸混用");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("混用的危險描述");

  await page.goto("/zh-tw/tools/recurring-chore-planner/");
  await page.getByLabel("下次一起複查日期").fill("2026-09-05");
  await page
    .getByRole("spinbutton", { name: "這一輪從名單第幾位開始" })
    .fill("2");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText(
    "晚餐後廚房復位 — 大人 B",
  );
  await expect(page.locator(".result")).toContainText(
    "輪流分配只平衡項目數",
  );

  await page.goto("/zh-tw/tools/home-inventory-checklist-generator/");
  await page.getByLabel("要盤點的空間").fill("廚房\nkitchen\n客房");
  await page.getByLabel("本次盤點日期").fill("2026-08-22");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("空間數：2");
  await expect(page.locator(".result")).toContainText("高單價小家電");
  await expect(page.locator(".result")).toContainText("客房（自訂空間，使用通用分類）");
  await expect(page.locator(".result")).toContainText("不會估算現值");

  await page.goto("/zh-tw/tools/household-document-index-generator/");
  await page.getByLabel("原始文件主要位置").fill("家庭文件夾");
  await page.getByLabel("備份或替代取得位置").fill("家庭文件夾");
  await page.getByLabel("下次索引複查日期").fill("2026-09-30");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("家庭文件索引初稿");
  await expect(page.locator(".result")).toContainText("主要位置與備份位置完全相同");
  await expect(page.locator(".result")).toContainText("不是檔案庫");

  await page.goto("/zh-tw/tools/appliance-maintenance-checklist-generator/");
  await page.getByLabel("家電種類").selectOption("除濕機");
  await page.getByLabel("本次複查日期").fill("2026-08-22");
  await page.getByRole("button", { name: "產生結果" }).click();
  await expect(page.locator(".result")).toContainText("公開召回或檢修訊息");
  await expect(page.locator(".result")).toContainText("不要把這份清單當成拆解");

  const sitemap = await (await page.request.get("/sitemap-0.xml")).text();
  expect(sitemap).toContain("https://familyboard.win/zh-tw/");
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/home-maintenance-schedule/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/warranty-expiration-calculator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/home-maintenance-schedule-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-subscription-cost-calculator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/emergency-contact-sheet-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/household-replacement-reserve/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/emergency-binder/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/family-continuity-plan/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/utility-shutoff-information/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/divide-household-responsibilities/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/family-chore-system/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/household-weekly-reset/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/recurring-bills-tracker/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/pantry-restock-system/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/deep-cleaning-tracker/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/guest-preparation-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/vacation-home-shutdown-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/returning-home-after-travel-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/new-home-setup-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/moving-house-organizer/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/appliance-age-calculator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/home-maintenance-cost-tracker/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/home-repair-cost-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/home-service-reminder-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/receipt-retention-organizer/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-annual-review-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/move-in-checklist-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/move-out-condition-record-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/move-out-condition-record-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/move-out-home-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/home-emergency-drill-record-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/home-emergency-drill-record-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/home-evacuation-information/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/emergency-supply-inventory-audit/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/emergency-supply-inventory-audit/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/emergency-supply-inventory/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/emergency-contact-verification-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/emergency-contact-verification-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/household-power-outage-event-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-power-outage-event-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/power-outage-home-preparedness/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-power-outage-event-log-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-power-outage-event-log-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/power-outage-recovery-household-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-water-leak-event-log-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-water-leak-event-log-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/water-leak-photo-evidence-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/household-water-leak-event-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-water-leak-event-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/household-event-duration-calculator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/household-utility-bill-anomaly-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-event-duration-calculator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-utility-bill-anomaly-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/household-time-window-overlap-checker/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-time-window-overlap-checker/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/household-event-source-index-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-event-source-index-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-event-source-index-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-event-source-index-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-bill-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-bill-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-internet-incident-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-internet-incident-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-meter-reading-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-meter-reading-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-share-access-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-share-access-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-photo-inventory-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-photo-inventory-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-document-renewal-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-document-renewal-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-building-notice-response-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-building-notice-response-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-rental-repair-request-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-rental-repair-request-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-repair-evidence-timeline-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-repair-evidence-timeline-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-consumable-change-history-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-consumable-change-history-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-clothing-care-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-clothing-care-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-pantry-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-pantry-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-home-access-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-home-access-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-schedule-conflict-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-schedule-conflict-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-maintenance-priority-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-maintenance-priority-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-service-quote-comparison-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-service-quote-comparison-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/household-maintenance-delegation-map/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-maintenance-delegation-map/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-old-tablet-display-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-old-tablet-display-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-browser-storage-cleanup-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-browser-storage-cleanup-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-shopping-list-planner-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-shopping-list-planner-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-purchase-delivery-evidence-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-purchase-delivery-evidence-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-warranty-claim-evidence-log-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-warranty-claim-evidence-log-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-pet-sitter-instruction-generator-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-pet-sitter-instruction-generator-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-home-repair-cost-log-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-home-repair-cost-log-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-home-care-visit-scope-service-result-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-home-care-visit-scope-service-result-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-shared-device-privacy-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-shared-device-privacy-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-household-document-redaction-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-household-document-redaction-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-rental-home-maintenance-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-rental-home-maintenance-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-clothing-care-repair-log-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-clothing-care-repair-log-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-meal-prep-role-log-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-meal-prep-role-log-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-household-bill-source-status-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-household-bill-source-status-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-household-export-scope-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-household-export-scope-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-printout-download-retention-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-printout-download-retention-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-household-role-change-audit-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-household-role-change-audit-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-guest-service-visit-reset-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-guest-service-visit-reset-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-subscription-cancellation-result-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-subscription-cancellation-result-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-weekly-household-decision-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-weekly-household-decision-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-restore-merge-replace-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-restore-merge-replace-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-storage-health-warning-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-storage-health-warning-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-attachment-metadata-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-attachment-metadata-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-encrypted-backup-password-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-encrypted-backup-password-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-master-csv-edit-import-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-master-csv-edit-import-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-app-first-run-restore-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-app-first-run-restore-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-pwa-update-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-pwa-update-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-shared-display-privacy-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-shared-display-privacy-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-reset-local-household-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-reset-local-household-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-seasonal-reset-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-seasonal-reset-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-device-retirement-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-device-retirement-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-household-meeting-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-household-meeting-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-weekly-reset-action-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-weekly-reset-action-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-school-closure-continuity-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-school-closure-continuity-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-household-account-list-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-household-account-list-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-household-responsibility-coverage-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-household-responsibility-coverage-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-replacement-part-source-check-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-replacement-part-source-check-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-guest-arrival-prep-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-guest-arrival-prep-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-donation-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-donation-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-household-admin-backup-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-household-admin-backup-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-mail-package-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-mail-package-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-plant-care-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-plant-care-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-recycling-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-recycling-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-household-return-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-household-return-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-school-pickup-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-school-pickup-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-service-appointment-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-service-appointment-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-subscription-cancellation-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-subscription-cancellation-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-school-activity-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-school-activity-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-monthly-review-action-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-monthly-review-action-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-router-support-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-router-support-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-trip-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-trip-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-meal-prep-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-meal-prep-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-accessibility-walkthrough-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-accessibility-walkthrough-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-household-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-household-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-insurance-claim-timeline-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-insurance-claim-timeline-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/household-decision-register/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-decision-register/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/household-backup-recovery-checker/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-backup-recovery-checker/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-utility-provider-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-repair-punch-list-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-product-recall-action-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-home-maintenance-schedule-generator-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-household-decision-register-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/monthly-home-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/quarterly-home-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/seasonal-home-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/spring-home-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/summer-home-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/fall-home-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/first-time-homeowner-maintenance-guide/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/apartment-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/condo-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/rental-home-maintenance-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/home-maintenance-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/home-repair-history/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/winter-home-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/preventive-home-maintenance/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/maintenance-priorities/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/refrigerator-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/freezer-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/washing-machine-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/home-maintenance-binder/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/home-maintenance-budget/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/home-maintenance-reminders/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/home-maintenance-after-vacation/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/move-in-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/annual-home-review/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/dryer-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/dishwasher-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/oven-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/home-maintenance-delegation/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/range-hood-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/air-conditioner-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-vehicle-document-source-status-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-record-retrieval-drill-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-emergency-contact-verification-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-vehicle-document-source-status-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-repair-punch-list-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-product-recall-action-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-home-maintenance-schedule-generator-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-warranty-expiration-calculator-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-household-subscription-cost-calculator-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-free-home-management-app-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-private-family-organizer-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-home-dashboard-weekly-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-master-csv-edit-import/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-maintenance-history-review/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-subscription-renewal-review/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-household-members-responsibilities-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-documents-source-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-emergency-information-privacy-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-backup-recovery-checker-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-event-duration-calculator-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/familyboard-emergency-contact-verification-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-free-home-management-app-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-private-family-organizer-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-home-dashboard-weekly-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-master-csv-edit-import/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-maintenance-history-review/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-subscription-renewal-review/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-household-members-responsibilities-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-documents-source-review-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-emergency-information-privacy-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-backup-recovery-checker-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-event-duration-calculator-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-emergency-contact-verification-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-vehicle-document-source-status-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-record-retrieval-drill-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-utility-provider-handoff-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-repair-punch-list-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-product-recall-action-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-home-maintenance-schedule-generator-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/familyboard-household-decision-register-tutorial/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/monthly-home-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/quarterly-home-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/seasonal-home-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/spring-home-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/summer-home-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/fall-home-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/first-time-homeowner-maintenance-guide/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/apartment-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/condo-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/rental-home-maintenance-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/home-maintenance-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/home-repair-history/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/winter-home-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/preventive-home-maintenance/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/maintenance-priorities/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/refrigerator-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/freezer-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/washing-machine-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/home-maintenance-binder/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/home-maintenance-budget/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/home-maintenance-reminders/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/home-maintenance-after-vacation/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/move-in-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/annual-home-review/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/dryer-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/dishwasher-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/oven-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/home-maintenance-delegation/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/range-hood-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/air-conditioner-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/household-event-source-check-taiwan/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/water-leak-response-home-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/household-storm-readiness-review/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-storm-readiness-review/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/storm-preparation-home-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/home-service-provider-verification-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/home-service-provider-verification-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/home-service-provider-list/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/home-repair-change-order-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/home-repair-change-order-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/contractor-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/home-repair-punch-list/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/home-repair-punch-list/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/renovation-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/home-repair-closeout-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/home-repair-closeout-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/home-improvement-receipts/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/warranty-claim-evidence-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/warranty-claim-evidence-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/product-recall-action-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/product-recall-action-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/product-registration-tracker/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/appliance-service-visit-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/appliance-service-visit-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/service-history/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/appliance-repair-callback-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/appliance-repair-callback-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/repair-history/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/appliance-purchase-installation-record/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/appliance-purchase-installation-record/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/purchase-delivery-evidence-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/purchase-delivery-evidence-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/moving-box-handover-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/moving-box-handover-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/moving-inventory/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/storage-unit-access-inventory-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/storage-unit-access-inventory-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/storage-unit-inventory/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/household-record-retrieval-drill-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-record-retrieval-drill-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/digital-home-binder/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/digital-home-binder/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/important-household-document-review/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/important-household-document-review/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/important-household-documents/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/important-household-documents/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/household-record-retention-decision-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-record-retention-decision-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/how-long-to-keep-household-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/how-long-to-keep-household-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/appliance-manual-source-check-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/appliance-manual-source-check-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/organize-appliance-manuals/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/organize-appliance-manuals/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/household-insurance-policy-source-version-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-insurance-policy-source-version-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/organize-insurance-documents/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/organize-insurance-documents/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/tools/household-utility-provider-service-handoff-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-utility-provider-service-handoff-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/guides/organize-utility-account-information/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/organize-utility-account-information/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/purchase-receipt-organizer/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/appliance-inventory/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/computer-electronics-inventory/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/furniture-inventory/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/microwave-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/hvac-filter-tracker/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/furnace-maintenance-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/heat-pump-maintenance-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/water-heater-maintenance-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/dehumidifier-maintenance-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/air-purifier-filter-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/solar-panel-maintenance-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/smoke-alarm-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/fire-extinguisher-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/carbon-monoxide-alarm-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/humidifier-maintenance-guide/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/ceiling-fan-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/bathroom-exhaust-fan-maintenance-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/water-softener-maintenance-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/ups-battery-backup-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/wifi-router-maintenance-records/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/water-filter-replacement-guide/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/coffee-maker-maintenance-guide/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/robot-vacuum-maintenance-guide/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/garbage-disposal-maintenance-guide/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/vacuum-cleaner-maintenance-guide/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/home-inventory-for-insurance/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/air-purifier-maintenance-guide/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/dehumidifier-maintenance-guide/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/home-inventory-checklist/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/photo-home-inventory/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/valuable-item-inventory/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/serial-number-tracker/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/electronics-inventory/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/warranty-expiration/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/appliance-lifespan-planning/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/travel-household-handoff/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/house-sitter-information/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/pet-sitter-information/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/emergency-information-sheet/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/vacation-shutdown-checklist-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/house-sitter-instruction-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/pet-sitter-instruction-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/home-handoff-summary-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/annual-subscription-cost-calculator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/emergency-binder-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/cleaning-schedule-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/appliance-replacement-planning/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/room-by-room-home-inventory/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/cleaning-schedule/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/appliance-replacement-planner/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/room-inventory-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/warranty-checklist-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/recurring-chore-planner/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/home-inventory-checklist-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/household-document-index-generator/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/appliance-maintenance-checklist-generator/",
  );
  expect(sitemap).toContain("https://familyboard.win/zh-tw/privacy/");
  expect(sitemap).toContain("https://familyboard.win/zh-tw/security/");
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/affiliate-disclosure/",
  );
  expect(sitemap).toContain("https://familyboard.win/zh-tw/terms/");
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/digital-home-inventory-backup/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/home-maintenance-log/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/features/household-handoff/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/features/home-inventory-tracker/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/features/family-task-manager/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/features/home-dashboard/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/features/maintenance-tracker/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/features/warranty-tracker/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/features/household-subscription-tracker/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/features/household-calendar/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/features/emergency-information-organizer/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/features/family-display-mode/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/features/household-documents-organizer/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/features/private-family-organizer/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/features/offline-household-organizer/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/how-to-track-product-warranties/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/organize-household-subscriptions/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/household-documents-organizer/",
  );
  expect(sitemap).toContain("https://familyboard.win/zh-tw/contact/");
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/features/free-home-management-app/",
  );
  expect(sitemap).not.toContain("https://familyboard.win/zh-tw/app/");

  await page.goto("/zh-tw/app/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex,follow",
  );
  await expect(page.locator('meta[name="google-adsense-account"]')).toHaveCount(0);
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "不用註冊帳號，立即建立家庭工作區。" }),
  ).toBeVisible();
  await expect(page.getByLabel("家庭名稱")).toBeVisible();
  await expect(page.getByRole("link", { name: "English" })).toHaveAttribute(
    "href",
    "/app/",
  );
  await page.getByLabel("家庭名稱").fill("繁中測試家庭");
  await page.getByRole("button", { name: "建立本機家庭" }).click();
  await expect(page.getByRole("heading", { name: "今日總覽" })).toBeVisible();
  await expect(page.getByText("目前有網路")).toBeVisible();
  await expect(page.getByText("離線 App 快取已就緒")).toBeVisible();
  await page.getByRole("button", { name: "家庭資產" }).click();
  await page.getByLabel("資產名稱").fill("測試冰箱");
  await page.getByLabel("序號").fill("ZH-ASSET-001");
  await page.getByLabel("備註", { exact: true }).fill("廚房左側插座");
  await page.getByRole("button", { name: "新增紀錄" }).click();
  const assetCard = page.locator(".app-card").filter({ hasText: "測試冰箱" });
  await expect(assetCard).toContainText("購買日 未填日期");
  await expect(assetCard).not.toContainText("purchased");
  await expect(assetCard).toContainText("序號： ZH-ASSET-001");
  await expect(assetCard).toContainText("備註： 廚房左側插座");

  await page.getByRole("button", { name: "保養維護" }).click();
  await expect(page.getByLabel("完成後間隔月數")).toHaveAttribute("min", "0");
  await page.getByLabel("保養工作").fill("檢查冰箱散熱區");
  await page.getByLabel("關聯資產").selectOption({ label: "測試冰箱" });
  await page.getByLabel("完成後間隔月數").fill("6");
  await page.getByLabel("優先順序").selectOption("high");
  await page.getByLabel("操作說明來源").fill("原廠手冊第 12 頁");
  await page.getByLabel("備註", { exact: true }).fill("先確認通風空間");
  await page.getByRole("button", { name: "新增紀錄" }).click();
  const maintenanceCard = page.locator(".app-card").filter({ hasText: "檢查冰箱散熱區" });
  await expect(maintenanceCard).toContainText("優先順序： 高");
  await expect(maintenanceCard).toContainText("來源： 原廠手冊第 12 頁");
  await expect(maintenanceCard).toContainText("備註： 先確認通風空間");
  await maintenanceCard.getByRole("button", { name: "標記完成" }).click();
  await expect(maintenanceCard).toContainText("完成 1 次");
  await expect(maintenanceCard).toContainText("完成於");

  await page.getByRole("button", { name: "任務" }).click();
  await page.getByLabel("家庭責任").fill("較晚任務");
  await page.getByLabel("到期日").fill("2026-12-31");
  await page.getByLabel("重複週期備註").fill("每年依正式日期重建");
  await page.getByLabel("備註", { exact: true }).first().fill("晚任務備註");
  await page.getByRole("button", { name: "新增紀錄" }).first().click();
  await expect(page.locator(".app-card").filter({ hasText: "較晚任務" })).toContainText(
    "晚任務備註",
  );
  await page.getByLabel("家庭責任").fill("較早任務");
  await page.getByLabel("到期日").fill("2026-09-01");
  await page.getByRole("button", { name: "新增紀錄" }).first().click();
  const localToday = await page.evaluate(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  await page.getByLabel("事件名稱").fill("設備到府測試");
  await page.getByLabel("開始日期").fill(`${localToday}T18:00`);
  await page.getByLabel("截止日期").fill(`${localToday}T17:00`);
  await page.getByRole("button", { name: "新增紀錄" }).last().click();
  await expect(page.getByRole("alert")).toHaveText(
    "結束時間必須晚於開始時間。",
  );
  await expect(
    page.locator(".app-card").filter({ hasText: "設備到府測試" }),
  ).toHaveCount(0);
  await page.getByLabel("截止日期").fill(`${localToday}T19:00`);
  await page.getByLabel("備註", { exact: true }).last().fill("事件備註可見");
  await page.getByRole("button", { name: "新增紀錄" }).last().click();
  const eventCard = page.locator(".app-card").filter({ hasText: "設備到府測試" });
  await expect(eventCard).toContainText("截止日");
  await expect(eventCard).toContainText("事件備註可見");
  await page.getByRole("button", { name: "今日總覽" }).click();
  const responsibilities = page
    .locator(".app-card")
    .filter({ hasText: "接下來的責任" });
  await expect(responsibilities.locator("strong")).toHaveText([
    "較早任務",
    "較晚任務",
  ]);

  await page.getByRole("button", { name: "保固" }).click();
  await expect(page.getByLabel("資產")).toHaveAttribute("required", "");
  await page.getByLabel("資產").selectOption({ label: "測試冰箱" });
  await page.getByLabel("提供者").fill("測試原廠");
  await page.getByLabel("開始日期").fill("2026-01-01");
  await page.getByLabel("截止日期").fill("2028-01-01");
  await page.getByLabel("收據位置或索引").fill("雲端/收據/冰箱.pdf");
  await page.getByLabel("條款或手冊索引").fill("紙本保固資料夾 A");
  await page.getByLabel("備註", { exact: true }).fill("門板序號已核對");
  await page.getByRole("button", { name: "新增紀錄" }).click();
  const warrantyCard = page.locator(".app-card").filter({ hasText: "測試原廠" });
  await expect(warrantyCard).toContainText("保障期間：");
  await expect(warrantyCard).toContainText("收據： 雲端/收據/冰箱.pdf");
  await expect(warrantyCard).toContainText("實際保障範圍以書面條款為準。");
  await expect(warrantyCard).toContainText("條款： 紙本保固資料夾 A");
  await expect(warrantyCard).toContainText("門板序號已核對");

  await page.getByRole("button", { name: "訂閱" }).click();
  await expect(page.getByLabel("幣別")).toHaveValue("TWD");
  await expect(page.getByLabel("費用")).toHaveAttribute("min", "0");
  await expect(page.getByLabel("提前幾天複查")).toHaveAttribute("min", "0");
  await page.getByLabel("服務名稱").fill("測試影音");
  await page.getByLabel("費用").fill("100");
  await page.getByLabel("下次續約日").fill("2026-12-31");
  await page.getByLabel("提前幾天複查").fill("30");
  await page.getByLabel("管理網址").fill("https://familyboard.win/");
  await page.getByLabel("非敏感付款備註").fill("家庭共同卡");
  await page.getByLabel("備註", { exact: true }).fill("年度檢查畫質方案");
  await page.getByRole("button", { name: "新增紀錄" }).click();
  await expect(page.locator(".notice")).toContainText("TWD 1,200");
  const twdCard = page.locator(".app-card").filter({ hasText: "測試影音" });
  await expect(twdCard).toContainText("分類： 家庭");
  await expect(twdCard).toContainText("複查日 2026年12月1日");
  await expect(twdCard.getByRole("link", { name: "開啟服務管理頁" })).toHaveAttribute(
    "href",
    "https://familyboard.win/",
  );

  await page.getByLabel("服務名稱").fill("測試雲端");
  await page.getByLabel("費用").fill("12");
  await page.getByLabel("幣別").selectOption("USD");
  await page.getByLabel("計費週期").selectOption("annual");
  await page.getByRole("button", { name: "新增紀錄" }).click();
  await expect(page.locator(".notice")).toContainText("TWD 1,200 · USD 12");
  await twdCard.getByRole("button", { name: "標記為已取消" }).click();
  await expect(page.locator(".notice")).not.toContainText("TWD 1,200");
  await expect(page.locator(".notice")).toContainText("USD 12");
  await expect(twdCard).toContainText("已取消");

  await page.getByRole("button", { name: "緊急聯絡" }).click();
  await expect(
    page.getByText(
      "敏感聯絡人仍會出現在這個私密分頁與完整備份，但不會進入交接摘要；家庭看板完全不顯示聯絡人。",
    ),
  ).toBeVisible();
  await page.getByLabel("人員或服務單位").fill("測試管理室");
  await page.getByLabel("分類").fill("社區");
  await page.getByLabel("電話").fill("02-1234-5678");
  await page.getByLabel("電子郵件").fill("desk@example.test");
  await page.getByRole("button", { name: "新增紀錄" }).click();
  const shareableContact = page.locator(".app-card").filter({ hasText: "測試管理室" });
  await expect(shareableContact).toContainText("可分享");
  await expect(shareableContact.getByRole("link", { name: "02-1234-5678" })).toHaveAttribute(
    "href",
    "tel:0212345678",
  );
  await expect(shareableContact.getByRole("link", { name: "desk@example.test" })).toHaveAttribute(
    "href",
    "mailto:desk@example.test",
  );
  await page.getByLabel("人員或服務單位").fill("私人醫療窗口");
  await page.getByLabel("分類").fill("家庭");
  await page.getByLabel("電話").fill("0912-345-678");
  await page.getByLabel("操作備註").fill("不可交接的私人備註");
  await page.getByLabel("顯示範圍").selectOption("true");
  await page.getByRole("button", { name: "新增紀錄" }).click();
  await expect(
    page.locator(".app-card").filter({ hasText: "私人醫療窗口" }),
  ).toContainText("私密");

  await page.getByRole("button", { name: "文件" }).click();
  await page.getByLabel("紀錄名稱").fill("測試保單");
  await page.getByLabel("原始文件存放位置").fill("加密雲端/保險");
  await page.getByLabel("關聯資產").selectOption({ label: "測試冰箱" });
  await page.getByLabel("複查日期").fill("2027-01-15");
  await page.getByLabel("備註", { exact: true }).fill("內含敏感保單編號");
  await page.getByRole("button", { name: "新增紀錄" }).click();
  const documentCard = page.locator(".app-card").filter({ hasText: "測試保單" });
  await expect(documentCard).toContainText("加密雲端/保險");
  await expect(documentCard).toContainText("複查日： 到期日 2027年1月15日");
  await expect(documentCard).toContainText("內含敏感保單編號");
  await page.getByLabel("紀錄名稱").fill("更晚文件");
  await page.getByLabel("原始文件存放位置").fill("紙本文件盒/B");
  await page.getByLabel("複查日期").fill("2028-01-15");
  await page.getByRole("button", { name: "新增紀錄" }).click();
  await expect(
    page.locator(".app-card").filter({ hasText: "更晚文件" }),
  ).toBeVisible();
  await page.getByLabel("紀錄名稱").fill("無日期文件");
  await page.getByLabel("原始文件存放位置").fill("紙本文件盒/C");
  await page.getByRole("button", { name: "新增紀錄" }).click();
  await expect(
    page.locator(".app-card").filter({ hasText: "無日期文件" }),
  ).toBeVisible();
  await expect(page.locator(".app-main > .app-grid .app-card h2")).toHaveText([
    "測試保單",
    "更晚文件",
    "無日期文件",
  ]);

  await page.getByRole("button", { name: "交接" }).click();
  await expect(page.getByText("繁中測試家庭 家庭交接摘要")).toBeVisible();
  await page.getByLabel("設定檔名稱").fill("週末保母");
  await page.getByLabel("用途").fill("週末照顧測試");
  await page.getByLabel("包含文件位置").selectOption("yes");
  await page.getByRole("button", { name: "新增紀錄" }).click();
  await expect(
    page.getByRole("option", { name: "週末保母 — 週末照顧測試" }),
  ).toBeAttached();
  await expect(page.getByLabel("設定檔名稱")).toHaveValue("");
  const handoffSheet = page.locator(".handoff-sheet");
  await expect(handoffSheet).toContainText("測試保單");
  await expect(handoffSheet).toContainText("加密雲端/保險");
  await expect(handoffSheet).toContainText("測試冰箱");
  await expect(handoffSheet).toContainText("複查日： 2027年1月15日");
  await expect(handoffSheet).not.toContainText("內含敏感保單編號");
  await expect(handoffSheet).toContainText("測試管理室");
  await expect(handoffSheet).not.toContainText("私人醫療窗口");
  await page.getByLabel("設定檔名稱").fill("長期照護");
  await page.getByLabel("用途").fill("長期交班測試");
  await page.getByLabel("包含保養工作").selectOption("no");
  await page.getByRole("button", { name: "新增紀錄" }).click();
  await expect(
    page.getByRole("option", { name: "長期照護 — 長期交班測試" }),
  ).toBeAttached();
  await page
    .getByLabel("交接設定檔")
    .selectOption({ label: "長期照護 — 長期交班測試" });
  await expect(page.getByText("設定檔：長期照護 ·")).toBeVisible();
  await expect(handoffSheet).not.toContainText("加密雲端/保險");
  await page.getByRole("button", { name: "看板", exact: true }).click();
  const displayTasks = page.locator(".app-card").filter({ hasText: "家庭任務" });
  await expect(displayTasks.locator("strong")).toHaveText([
    "較早任務",
    "較晚任務",
  ]);
  await expect(page.locator(".display-mode")).toContainText("設備到府測試");
  await expect(page.locator(".display-mode")).not.toContainText("事件備註可見");
  await expect(page.locator(".display-mode")).not.toContainText("測試管理室");
  await expect(page.locator(".display-mode")).not.toContainText("私人醫療窗口");
  await expect(page.locator(".display-mode")).toContainText(
    "這個看板不顯示聯絡人、詳細備註與其他私密紀錄類型；任務與事件標題仍會顯示。",
  );
  await page.getByRole("button", { name: "設定" }).click();
  await expect(page.getByRole("heading", { name: "匯出備份" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "家庭資料總表" })).toBeVisible();
  await expect(page.getByText("選擇家庭總表 CSV 並預覽")).toBeVisible();
  await expect(page.getByText("App 版本：")).toBeVisible();
});

test("complete local app lifecycle survives backup, reset, restore and offline reload", async ({
  page,
  context,
}, testInfo) => {
  test.setTimeout(90_000);
  test.skip(
    testInfo.project.name !== "chromium",
    "One full browser lifecycle is sufficient; public smoke runs in every project.",
  );

  await page.goto("/app/");
  await expect(
    page.getByRole("heading", { name: /Set up your home/ }),
  ).toBeVisible();
  await page.getByLabel("Home name").fill("E2E Home");
  await page.getByLabel("Household members").fill("Alex");
  await page.getByRole("button", { name: "Create local household" }).click();
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();

  await page.getByRole("button", { name: "Members" }).click();
  await page.getByLabel("Member name").fill("Sam");
  await page.getByRole("button", { name: "Add record" }).click();
  await expect(page.getByRole("heading", { name: "Sam" })).toBeVisible();

  await page.getByRole("button", { name: "Assets" }).click();
  await page.getByLabel("Asset name").fill("Refrigerator");
  await page.getByLabel("Brand").fill("Test Brand");
  await page.getByRole("button", { name: "Add record" }).click();
  await expect(
    page.getByRole("heading", { name: "Refrigerator" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Maintenance" }).click();
  await page.getByLabel("Maintenance task").fill("Clean refrigerator coils");
  await page.getByLabel("Related asset").selectOption({ index: 1 });
  await page.getByLabel("Repeat months after completion").fill("6");
  await page.getByRole("button", { name: "Add record" }).click();
  await page.getByRole("button", { name: "Complete" }).click();
  await expect(page.getByText("1 completions")).toBeVisible();
  await expect(page.getByText(/Completed /).last()).toBeVisible();

  await page.getByRole("button", { name: "Warranties" }).click();
  await page
    .getByRole("combobox", { name: "Asset" })
    .selectOption({ index: 1 });
  await page.getByLabel("Provider").fill("Test Warranty Co");
  await page.getByLabel("Ends").fill("2027-08-19");
  await page.getByRole("button", { name: "Add record" }).click();
  await expect(page.getByText("Test Warranty Co")).toBeVisible();

  await page.getByRole("button", { name: "Subscriptions" }).click();
  await page.getByLabel("Service").fill("Household Test Service");
  await page.getByLabel("Cost").fill("12");
  await page.getByRole("button", { name: "Add record" }).click();
  await expect(
    page.getByRole("heading", { name: "Household Test Service" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Tasks" }).click();
  await page.getByLabel("Responsibility").fill("Take bins out");
  await page.getByRole("button", { name: "Add record" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Take bins out" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Handoff" }).click();
  await expect(page.getByText("E2E Home household handoff")).toBeVisible();
  await expect(page.getByText("Take bins out")).toBeVisible();
  await expect(page.getByText("Clean refrigerator coils")).toBeVisible();

  await page.getByRole("button", { name: "Display" }).click();
  await expect(
    page.getByText("Shared view · refreshes every minute"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Household tasks" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Settings" }).click();
  const masterDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export master CSV" }).click();
  const masterDownload = await masterDownloadPromise;
  const masterPath = await masterDownload.path();
  expect(masterPath).toBeTruthy();
  const masterText = await readFile(masterPath!, "utf8");
  expect(masterText).toContain("familyboard-master-v1");
  expect(masterText).toContain("Refrigerator");
  expect(masterText).toContain("Clean refrigerator coils");

  await page
    .locator('input[type="file"][aria-label="Import master CSV for preview"]')
    .setInputFiles(masterPath!);
  await expect(page.getByRole("heading", { name: "Import preview" })).toBeVisible();
  await expect(page.getByText(/0 new · \d+ updates/)).toBeVisible();
  const safetyDownloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download safety snapshot and import" })
    .click();
  const safetyDownload = await safetyDownloadPromise;
  expect(await safetyDownload.path()).toBeTruthy();
  await expect(page.getByText(/Master import complete/)).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const download = await downloadPromise;
  const backupPath = await download.path();
  expect(backupPath).toBeTruthy();
  await expect(page.getByText(/Backup exported/)).toBeVisible();

  await page.getByLabel(/Type “E2E Home” to confirm/).fill("E2E Home");
  await page.getByRole("button", { name: "Delete local data" }).click();
  await expect(
    page.getByRole("heading", { name: /Set up your home/ }),
  ).toBeVisible();
  await page
    .locator('input[type="file"][aria-label="Backup file"]')
    .setInputFiles(backupPath!);
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  await page.reload();
  await expect(page.getByText("E2E Home").first()).toBeVisible();

  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  await expect(page.getByText("Offline now")).toBeVisible();
  await expect(page.getByText("Offline app cache ready")).toBeVisible();
  await context.setOffline(false);
});

test("first connected visit precaches both app shells for offline opening", async ({
  page,
  context,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "One service-worker lifecycle is sufficient; public smoke runs in every project.",
  );

  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  try {
    await page.goto("/zh-tw/app/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "不用註冊帳號，立即建立家庭工作區。" }),
    ).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
