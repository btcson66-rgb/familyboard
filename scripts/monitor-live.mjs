const origin = process.env.FAMILYBOARD_ORIGIN || "https://familyboard.win";

const checks = [
  {
    path: "/",
    require: [
      '<html lang="en">',
      "<h1",
      "FamilyBoard",
      "/brand/familyboard-mark.png",
      "Understand FamilyBoard in under a minute",
      'rel="canonical"',
      'hreflang="zh-TW"',
    ],
  },
  {
    path: "/zh-tw/",
    require: [
      '<html lang="zh-TW">',
      "免費的家庭管理工具",
      'href="https://familyboard.win/zh-tw/"',
      'hreflang="en"',
      '"@type":"FAQPage"',
      "/zh-tw/app/",
      "一分鐘認識 FamilyBoard",
    ],
  },
  {
    path: "/robots.txt",
    require: ["Sitemap: https://familyboard.win/sitemap-index.xml"],
  },
  {
    path: "/sitemap-index.xml",
    require: ["<sitemapindex"],
  },
  {
    path: "/sitemap-0.xml",
    require: [
      "<loc>https://familyboard.win/</loc>",
      "<loc>https://familyboard.win/zh-tw/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-maintenance-schedule/</loc>",
      "<loc>https://familyboard.win/zh-tw/features/free-home-management-app/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/warranty-expiration-calculator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-maintenance-schedule-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-subscription-cost-calculator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/emergency-contact-sheet-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/appliance-age-calculator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-maintenance-cost-tracker/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-repair-cost-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-service-reminder-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/receipt-retention-organizer/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-annual-review-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/move-in-checklist-generator/</loc>",
      "<loc>https://familyboard.win/tools/move-out-condition-record-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/move-out-condition-record-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/move-out-home-records/</loc>",
      "<loc>https://familyboard.win/tools/home-emergency-drill-record-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-emergency-drill-record-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-evacuation-information/</loc>",
      "<loc>https://familyboard.win/tools/emergency-supply-inventory-audit/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/emergency-supply-inventory-audit/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/emergency-supply-inventory/</loc>",
      "<loc>https://familyboard.win/tools/emergency-contact-verification-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/emergency-contact-verification-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/emergency-information-sheet/</loc>",
      "<loc>https://familyboard.win/tools/household-power-outage-event-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-power-outage-event-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/power-outage-home-preparedness/</loc>",
      "<loc>https://familyboard.win/tools/household-water-leak-event-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-water-leak-event-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/water-leak-response-home-records/</loc>",
      "<loc>https://familyboard.win/tools/household-storm-readiness-review/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-storm-readiness-review/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/storm-preparation-home-checklist/</loc>",
      "<loc>https://familyboard.win/tools/home-service-provider-verification-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-service-provider-verification-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-service-provider-list/</loc>",
      "<loc>https://familyboard.win/tools/home-repair-change-order-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-repair-change-order-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/contractor-records/</loc>",
      "<loc>https://familyboard.win/tools/home-repair-punch-list/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-repair-punch-list/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/renovation-records/</loc>",
      "<loc>https://familyboard.win/tools/home-repair-closeout-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-repair-closeout-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-improvement-receipts/</loc>",
      "<loc>https://familyboard.win/tools/warranty-claim-evidence-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/warranty-claim-evidence-log/</loc>",
      "<loc>https://familyboard.win/tools/product-recall-action-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/product-recall-action-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/product-registration-tracker/</loc>",
      "<loc>https://familyboard.win/tools/appliance-service-visit-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/appliance-service-visit-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/service-history/</loc>",
      "<loc>https://familyboard.win/tools/appliance-repair-callback-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/appliance-repair-callback-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/repair-history/</loc>",
      "<loc>https://familyboard.win/tools/appliance-purchase-installation-record/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/appliance-purchase-installation-record/</loc>",
      "<loc>https://familyboard.win/tools/purchase-delivery-evidence-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/purchase-delivery-evidence-log/</loc>",
      "<loc>https://familyboard.win/tools/moving-box-handover-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/moving-box-handover-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/moving-inventory/</loc>",
      "<loc>https://familyboard.win/tools/storage-unit-access-inventory-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/storage-unit-access-inventory-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/storage-unit-inventory/</loc>",
      "<loc>https://familyboard.win/tools/household-record-retrieval-drill-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-record-retrieval-drill-log/</loc>",
      "<loc>https://familyboard.win/guides/digital-home-binder/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/digital-home-binder/</loc>",
      "<loc>https://familyboard.win/tools/important-household-document-review/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/important-household-document-review/</loc>",
      "<loc>https://familyboard.win/guides/important-household-documents/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/important-household-documents/</loc>",
      "<loc>https://familyboard.win/tools/household-record-retention-decision-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-record-retention-decision-log/</loc>",
      "<loc>https://familyboard.win/guides/how-long-to-keep-household-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/how-long-to-keep-household-records/</loc>",
      "<loc>https://familyboard.win/tools/appliance-manual-source-check-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/appliance-manual-source-check-log/</loc>",
      "<loc>https://familyboard.win/guides/organize-appliance-manuals/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/organize-appliance-manuals/</loc>",
      "<loc>https://familyboard.win/tools/household-insurance-policy-source-version-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-insurance-policy-source-version-log/</loc>",
      "<loc>https://familyboard.win/guides/organize-insurance-documents/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/organize-insurance-documents/</loc>",
      "<loc>https://familyboard.win/tools/household-utility-provider-service-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-utility-provider-service-handoff-log/</loc>",
      "<loc>https://familyboard.win/guides/organize-utility-account-information/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/organize-utility-account-information/</loc>",
      "<loc>https://familyboard.win/tools/household-vehicle-document-source-status-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-vehicle-document-source-status-log/</loc>",
      "<loc>https://familyboard.win/guides/organize-vehicle-documents-at-home/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/organize-vehicle-documents-at-home/</loc>",
      "<loc>https://familyboard.win/tools/household-pet-record-source-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-pet-record-source-handoff-log/</loc>",
      "<loc>https://familyboard.win/guides/organize-pet-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/organize-pet-records/</loc>",
      "<loc>https://familyboard.win/tools/household-school-record-source-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-school-record-source-handoff-log/</loc>",
      "<loc>https://familyboard.win/guides/organize-school-records-at-home/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/organize-school-records-at-home/</loc>",
      "<loc>https://familyboard.win/tools/household-medical-information-source-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-medical-information-source-handoff-log/</loc>",
      "<loc>https://familyboard.win/guides/household-medical-information-organization/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/household-medical-information-organization/</loc>",
      "<loc>https://familyboard.win/tools/caregiver-handoff-source-authorization-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/caregiver-handoff-source-authorization-log/</loc>",
      "<loc>https://familyboard.win/guides/caregiver-handoff-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/caregiver-handoff-checklist/</loc>",
      "<loc>https://familyboard.win/tools/home-care-visit-scope-service-result-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-care-visit-scope-service-result-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-care-service-visit-records/</loc>",
      "<loc>https://familyboard.win/tools/home-care-service-plan-change-notice-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-care-service-plan-change-notice-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-care-service-plan-changes/</loc>",
      "<loc>https://familyboard.win/tools/home-care-service-interruption-backup-continuity-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-care-service-interruption-backup-continuity-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-care-service-interruption-backup-plan/</loc>",
      "<loc>https://familyboard.win/tools/home-care-complaint-response-resolution-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-care-complaint-response-resolution-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-care-service-complaint-resolution/</loc>",
      "<loc>https://familyboard.win/tools/home-care-charge-service-payment-discrepancy-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-care-charge-service-payment-discrepancy-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-care-service-fees-and-billing/</loc>",
      "<loc>https://familyboard.win/tools/home-care-payment-refund-collection-notice-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-care-payment-refund-collection-notice-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-care-refund-and-collection-notices/</loc>",
      "<loc>https://familyboard.win/tools/rental-security-deposit-move-out-claim-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/rental-security-deposit-move-out-claim-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/rental-security-deposit-move-out-claims/</loc>",
      "<loc>https://familyboard.win/guides/subscription-cancellation-refund-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/subscription-cancellation-refund-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/automatic-renewal-charge-dispute-taiwan/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-offline-backup-restore/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-offline-backup-restore/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-household-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-meeting-agenda-action-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-meeting-agenda-action-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-household-meeting-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-pantry-expiry-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-pantry-expiry-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-pantry-review-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-clothing-care-repair-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-clothing-care-repair-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-clothing-care-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-meal-prep-role-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-meal-prep-role-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-meal-prep-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-trip-packing-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-trip-packing-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-trip-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-bill-source-status-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-bill-source-status-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-bill-review-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-share-access-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-share-access-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-share-access-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-inventory-photo-capture-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-inventory-photo-capture-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-photo-inventory-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-document-renewal-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-document-renewal-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-document-renewal-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-internet-incident-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-internet-incident-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-internet-incident-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-meter-reading-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-meter-reading-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-meter-reading-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-accessibility-walkthrough-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-accessibility-walkthrough-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-accessibility-walkthrough-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-recycling-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-recycling-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-recycling-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-donation-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-donation-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-donation-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/purchase-receipt-organizer/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/appliance-inventory/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/vacation-shutdown-checklist-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/house-sitter-instruction-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/pet-sitter-instruction-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-handoff-summary-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/annual-subscription-cost-calculator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/emergency-binder-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/cleaning-schedule-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/appliance-replacement-planning/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/room-by-room-home-inventory/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/cleaning-schedule/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/appliance-replacement-planner/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/room-inventory-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/warranty-checklist-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/recurring-chore-planner/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-inventory-checklist-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-document-index-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/appliance-maintenance-checklist-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/privacy/</loc>",
      "<loc>https://familyboard.win/zh-tw/security/</loc>",
      "<loc>https://familyboard.win/zh-tw/affiliate-disclosure/</loc>",
      "<loc>https://familyboard.win/zh-tw/terms/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/digital-home-inventory-backup/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-maintenance-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/features/household-handoff/</loc>",
      "<loc>https://familyboard.win/zh-tw/features/home-inventory-tracker/</loc>",
      "<loc>https://familyboard.win/zh-tw/features/family-task-manager/</loc>",
      "<loc>https://familyboard.win/zh-tw/features/home-dashboard/</loc>",
      "<loc>https://familyboard.win/zh-tw/features/maintenance-tracker/</loc>",
      "<loc>https://familyboard.win/zh-tw/features/warranty-tracker/</loc>",
      "<loc>https://familyboard.win/zh-tw/features/household-subscription-tracker/</loc>",
      "<loc>https://familyboard.win/zh-tw/features/household-calendar/</loc>",
      "<loc>https://familyboard.win/zh-tw/features/emergency-information-organizer/</loc>",
      "<loc>https://familyboard.win/zh-tw/features/family-display-mode/</loc>",
      "<loc>https://familyboard.win/zh-tw/features/household-documents-organizer/</loc>",
      "<loc>https://familyboard.win/zh-tw/features/private-family-organizer/</loc>",
      "<loc>https://familyboard.win/zh-tw/features/offline-household-organizer/</loc>",
      "<loc>https://familyboard.win/features/offline-household-organizer/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/how-to-track-product-warranties/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/organize-household-subscriptions/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/household-documents-organizer/</loc>",
      "<loc>https://familyboard.win/zh-tw/contact/</loc>",
    ],
    forbid: [
      "<loc>https://familyboard.win/app/</loc>",
      "<loc>https://familyboard.win/zh-tw/app/</loc>",
    ],
  },
  {
    path: "/ads.txt",
    require: ["pub-7052036786750044"],
  },
  {
    path: "/app/",
    require: ['name="robots" content="noindex,follow"', "FamilyBoard"],
    forbid: ["googletagmanager.com", "adsbygoogle"],
  },
  {
    path: "/zh-tw/app/",
    require: [
      '<html lang="zh-TW">',
      'name="robots" content="noindex,follow"',
      "不用註冊帳號，立即建立家庭工作區。",
      "/brand/familyboard-mark.png",
    ],
    forbid: ["googletagmanager.com", "adsbygoogle"],
  },
  {
    path: "/tools/home-maintenance-cost-tracker/",
    require: ["Home Maintenance Cost Tracker", 'rel="canonical"'],
  },
  {
    path: "/tools/move-out-condition-record-generator/",
    require: [
      "Move-Out Condition Report Generator",
      'hreflang="zh-TW"',
      "Write an observation, not a verdict",
      "unsigned working record",
    ],
  },
  {
    path: "/tools/home-emergency-drill-record-generator/",
    require: [
      "Home Emergency Drill Record Generator",
      'hreflang="zh-TW"',
      "Four statuses prevent false completion",
      "not a building inspection",
    ],
  },
  {
    path: "/tools/emergency-supply-inventory-audit/",
    require: [
      "Emergency Supply Inventory Audit",
      'hreflang="zh-TW"',
      "Unresolved rows cannot disappear without follow-up",
      "does not prescribe",
    ],
  },
  {
    path: "/tools/emergency-contact-verification-log/",
    require: [
      "Emergency Contact Verification Log",
      'hreflang="zh-TW"',
      "Safe channel hints prevent accidental duplication",
      "does not ask for the full phone number",
    ],
  },
  {
    path: "/tools/household-power-outage-event-log/",
    require: [
      "Household Power Outage Event Log",
      'hreflang="zh-TW"',
      "Four statuses describe workflow, not safety",
      "does not monitor the grid",
    ],
  },
  {
    path: "/guides/power-outage-home-preparedness/",
    require: [
      "Power Outage Preparedness at Home",
      'hreflang="zh-TW"',
      "Begin with consequences, not products",
      "cdc.gov/natural-disasters/response/what-to-do-protect-yourself-during-a-power-outage.html",
    ],
  },
  {
    path: "/tools/household-water-leak-event-log/",
    require: [
      "Household Water Leak Event Log",
      'hreflang="zh-TW"',
      "Four statuses describe workflow, not severity",
      "does not inspect pipes",
    ],
  },
  {
    path: "/guides/water-leak-response-home-records/",
    require: [
      "Water Leak Response Records",
      'hreflang="zh-TW"',
      "Keep four layers separate",
      "epa.gov/mold/brief-guide-mold-moisture-and-your-home",
    ],
  },
  {
    path: "/tools/household-storm-readiness-review/",
    require: [
      "Household Storm Readiness Review",
      'hreflang="zh-TW"',
      "Four statuses preserve the difference between checked and resolved",
      "does not fetch forecasts",
    ],
  },
  {
    path: "/guides/storm-preparation-home-checklist/",
    require: [
      "Storm Preparation Home Checklist",
      'hreflang="zh-TW"',
      "Create a source map before creating a task list",
      "weather.gov/nwr",
    ],
  },
  {
    path: "/tools/home-service-provider-verification-log/",
    require: [
      "Home Service Provider Verification Log",
      'hreflang="zh-TW"',
      "Use four statuses that describe verification work",
      "does not search registries",
    ],
  },
  {
    path: "/guides/home-service-provider-list/",
    require: [
      "Home Service Provider List",
      'hreflang="zh-TW"',
      "Registration, licence, insurance and skill are different claims",
      "consumer.ftc.gov/articles/how-avoid-home-improvement-scam",
    ],
  },
  {
    path: "/tools/home-repair-change-order-log/",
    require: [
      "Home Repair Change Order Log",
      'hreflang="zh-TW"',
      "Use four statuses with evidence boundaries",
      "does not create or amend a contract",
    ],
  },
  {
    path: "/guides/contractor-records/",
    require: [
      "Contractor Records for Home Repairs",
      'hreflang="zh-TW"',
      "A change order is a versioned decision",
      "consumer.ftc.gov/articles/how-avoid-home-improvement-scam",
    ],
  },
  {
    path: "/tools/home-repair-punch-list/",
    require: [
      "Home Repair Punch List",
      'hreflang="zh-TW"',
      "Five statuses keep reports and rechecks distinct",
      "does not inspect work",
    ],
  },
  {
    path: "/guides/renovation-records/",
    require: [
      "Renovation records should preserve the project chronology",
      'hreflang="zh-TW"',
      "A punch list is a controlled observation queue",
      "irs.gov/publications/p530",
    ],
  },
  {
    path: "/tools/home-repair-closeout-checklist/",
    require: [
      "Home Repair Close-Out Checklist",
      'hreflang="zh-TW"',
      "Five statuses preserve where the evidence really is",
      "certify completion or acceptance",
    ],
  },
  {
    path: "/guides/home-improvement-receipts/",
    require: [
      "A home-improvement receipt needs the project history around it",
      'hreflang="zh-TW"',
      "Preserve five evidence layers instead of one receipt folder",
      "irs.gov/publications/p530",
    ],
  },
  {
    path: "/tools/warranty-claim-evidence-log/",
    require: [
      "Warranty Claim Evidence Log",
      'hreflang="zh-TW"',
      "Use six statuses that describe evidence",
      "does not diagnose a product",
    ],
  },
  {
    path: "/guides/how-to-track-product-warranties/",
    require: [
      "How to track product warranties",
      'hreflang="zh-TW"',
      "Separate the six evidence layers",
      "consumer.ftc.gov/articles/warranties",
    ],
  },
  {
    path: "/tools/product-recall-action-log/",
    require: [
      "Product Recall Action Log",
      'hreflang="zh-TW"',
      "Seven statuses keep uncertainty visible",
      "does not search live recall databases",
    ],
  },
  {
    path: "/guides/product-registration-tracker/",
    require: [
      "A product registration record is a notification map",
      'hreflang="zh-TW"',
      "Read the actual warranty instead of repeating a registration myth",
      "cpsc.gov/FAQ/Registration-Forms",
    ],
  },
  {
    path: "/guides/warranty-expiration/",
    require: [
      "A warranty expiration date answers",
      "Do not assume registration is always irrelevant or always decisive",
      "full warranty",
    ],
  },
  {
    path: "/tools/appliance-service-visit-log/",
    require: [
      "Appliance Service Visit Log",
      'hreflang="zh-TW"',
      "Eight statuses keep work and evidence honest",
      "does not diagnose equipment",
    ],
  },
  {
    path: "/guides/service-history/",
    require: [
      "Appliance service history",
      'hreflang="zh-TW"',
      "Keep five layers separate",
      "consumer.ftc.gov/articles/warranties",
    ],
  },
  {
    path: "/tools/appliance-repair-callback-log/",
    require: [
      "Appliance Repair Callback Log",
      'hreflang="zh-TW"',
      "Nine statuses separate observation from remedy",
      "does not decide that an earlier repair failed",
    ],
  },
  {
    path: "/tools/appliance-purchase-installation-record/",
    require: [
      "Appliance Purchase and Installation Record",
      'hreflang="zh-TW"',
      "Nine statuses prevent a receipt from pretending to be activation",
      "written warranty owns its start method",
    ],
  },
  {
    path: "/tools/purchase-delivery-evidence-log/",
    require: [
      "Purchase and Delivery Evidence Log",
      'hreflang="zh-TW"',
      "Nine statuses separate a delivery scan from an outcome",
      "Mail, Internet, or Telephone Order Merchandise Rule business guide",
    ],
  },
  {
    path: "/tools/moving-box-handover-log/",
    require: [
      "Moving Box Handover Log",
      'hreflang="zh-TW"',
      "Nine statuses prevent premature closure",
      "private, versioned source map for those events",
    ],
  },
  {
    path: "/guides/moving-inventory/",
    require: [
      "A moving inventory checklist should track custody",
      'hreflang="zh-TW"',
      "Use three linked records",
      "Unless a customer selects Released Value",
    ],
  },
  {
    path: "/tools/storage-unit-access-inventory-log/",
    require: [
      "Storage Unit Access &amp; Inventory Log",
      'hreflang="zh-TW"',
      "Nine statuses separate access from inventory evidence",
      "Privacy screening supports",
    ],
  },
  {
    path: "/guides/storage-unit-inventory/",
    require: [
      "A storage unit inventory should show location and change",
      'hreflang="zh-TW"',
      "Keep five linked records",
      "Move-out has three separate outcomes",
    ],
  },
  {
    path: "/tools/household-record-retrieval-drill-log/",
    require: [
      "Household Record Retrieval Drill Log",
      'hreflang="zh-TW"',
      "Eight statuses keep finding, currentness and disclosure separate",
      "does not search a device",
    ],
  },
  {
    path: "/guides/digital-home-binder/",
    require: [
      "A digital home binder is an operating map",
      'hreflang="zh-TW"',
      "Build six linked layers",
      "Current, findable and shareable are three different checks",
    ],
  },
  {
    path: "/tools/important-household-document-review/",
    require: [
      "Important Household Document Review",
      'hreflang="zh-TW"',
      "Ten statuses separate scope, source, protection and replacement",
      "does not open, upload, authenticate, replace, renew or destroy a document",
    ],
  },
  {
    path: "/guides/important-household-documents/",
    require: [
      "An important household document earns a place because of a real decision",
      'hreflang="zh-TW"',
      "Ask five questions before adding any document class",
      "Current source, useful copy and accepted evidence are different",
    ],
  },
  {
    path: "/tools/household-record-retention-decision-log/",
    require: [
      "Household Record Retention Decision Log",
      'hreflang="zh-TW"',
      "Twelve statuses show what is known and what remains open",
      "It does not calculate a tax, legal, warranty, policy, court, benefit, employment, identity, medical or contractual deadline.",
    ],
  },
  {
    path: "/guides/how-long-to-keep-household-records/",
    require: [
      "A household record does not earn a disposal date from its filename",
      'hreflang="zh-TW"',
      "U.S. federal tax periods are conditional, not a three-year label",
      "Warranty expiry is one trigger, not automatic disposal",
    ],
  },
  {
    path: "/tools/appliance-manual-source-check-log/",
    require: [
      "Appliance Manual Source Check Log",
      'hreflang="zh-TW"',
      "Eleven statuses show what is known and what remains open",
      "It does not identify an appliance; move, open, disconnect or inspect equipment",
    ],
  },
  {
    path: "/guides/organize-appliance-manuals/",
    require: [
      "The right appliance manual is a source match, not merely a PDF",
      'hreflang="zh-TW"',
      "product-support record as the source map",
      "Recall and safety notices remain a separate current check",
    ],
  },
  {
    path: "/tools/household-insurance-policy-source-version-log/",
    require: [
      "Household Insurance Policy Source and Version Log",
      'hreflang="zh-TW"',
      "Eleven statuses distinguish discovery from a reviewed set",
      "It does not search for, authenticate, issue, renew, replace, cancel or change insurance",
    ],
  },
  {
    path: "/guides/organize-insurance-documents/",
    require: [
      "The current insurance record is an issued document set, not a renewal reminder",
      'hreflang="zh-TW"',
      "Assemble the issued document stack in controlling order",
      "Keep claim and complaint records connected but separate",
    ],
  },
  {
    path: "/tools/household-utility-provider-service-handoff-log/",
    require: [
      "Household Utility Provider and Service Handoff Log",
      'hreflang="zh-TW"',
      "Twelve statuses preserve the difference between discovery, request and result",
      "It does not search for a provider; validate a service area, address, meter, account, rate, bill, payment, deposit, contract, customer or authorization",
    ],
  },
  {
    path: "/guides/organize-utility-account-information/",
    require: [
      "How to organize utility account information without turning the index into a security risk",
      'hreflang="zh-TW"',
      "Separate portal access, billing state and service state",
      "Treat a move as a sequence of evidence, not one cancellation checkbox",
    ],
  },
  {
    path: "/tools/household-vehicle-document-source-status-log/",
    require: [
      "Household Vehicle Document Source and Status Log",
      'hreflang="zh-TW"',
      "Twelve statuses keep discovery, action and result separate",
      "It does not decode, identify, locate, inspect, appraise, insure, register, title, renew, transfer, sell, donate, export, scrap, repair or certify a vehicle",
    ],
  },
  {
    path: "/guides/organize-vehicle-documents-at-home/",
    require: [
      "Organize vehicle documents by authority, vehicle match and current status",
      'hreflang="zh-TW"',
      "Keep title, registration, insurance and inspection as separate evidence",
      "Record recall research and vehicle-specific remedy evidence separately",
    ],
  },
  {
    path: "/tools/household-pet-record-source-handoff-log/",
    require: [
      "Household Pet Record Source and Handoff Log",
      'hreflang="zh-TW"',
      "Twelve statuses preserve discovery, protected match, handoff and result",
      "It does not scan or search a microchip; identify an animal or owner",
    ],
  },
  {
    path: "/guides/organize-pet-records/",
    require: [
      "Organize pet records without turning the shared care sheet into a medical file",
      'hreflang="zh-TW"',
      "Treat a microchip, registry and owner contact record as three related layers",
      "Keep veterinary instructions in their issued source, not in app-generated prose",
    ],
  },
  {
    path: "/tools/household-school-record-source-handoff-log/",
    require: [
      "Household School Record Source and Handoff Log",
      'hreflang="zh-TW"',
      "Twelve statuses preserve discovery, protected match, handoff and result",
      "It does not sign in to a school, district, state, health, transport or activity system",
    ],
  },
  {
    path: "/guides/organize-school-records-at-home/",
    require: [
      "Organize school records without putting a student file on the household dashboard",
      'hreflang="zh-TW"',
      "official record and the household index as different systems",
      "Pickup and transport handoffs require",
    ],
  },
  {
    path: "/tools/household-medical-information-source-handoff-log/",
    require: [
      "Household Medical Information Source and Handoff Log",
      'hreflang="zh-TW"',
      "Twelve statuses preserve source, protected access and responsible result",
      "It does not sign in to a provider, health plan, pharmacy",
    ],
  },
  {
    path: "/guides/household-medical-information-organization/",
    require: [
      "Organize household medical information without building an unprotected shadow chart",
      'hreflang="zh-TW"',
      "The provider record, plan record and household index are different systems",
      "A current medication list belongs in a protected clinical handoff",
    ],
  },
  {
    path: "/tools/caregiver-handoff-source-authorization-log/",
    require: [
      "Caregiver Handoff Source and Authorization Log",
      'hreflang="zh-TW"',
      "Twelve statuses preserve source, authority, access and acceptance",
      "It does not verify a caregiver, provider, agency, case manager",
    ],
  },
  {
    path: "/guides/caregiver-handoff-checklist/",
    require: [
      "Build a caregiver handoff that another person can accept without exposing a care file",
      'hreflang="zh-TW"',
      "A caregiver title, permitted disclosure and personal-representative authority are different",
      "Briefing, caregiver acceptance and an observed handoff result are three events",
    ],
  },
  {
    path: "/tools/home-care-visit-scope-service-result-log/",
    require: [
      "Home Care Visit Scope and Service Result Log",
      'hreflang="zh-TW"',
      "Twelve statuses separate visit source, evidence, exception and result",
      "This household index is not an official EVV, service record, timesheet",
    ],
  },
  {
    path: "/tools/home-care-service-plan-change-notice-log/",
    require: [
      "Home Care Service Plan Change and Notice Log",
      'hreflang="zh-TW"',
      "A change signal, approved version, notice and first changed visit are separate",
      "HHCCN, ABN and NOMNC are not three names for one letter",
    ],
  },
  {
    path: "/tools/home-care-service-interruption-backup-continuity-log/",
    require: [
      "Home Care Service Interruption and Backup Log",
      'hreflang="zh-TW"',
      "Twelve statuses stop “backup arranged” from hiding what happened",
      "A missed visit record and a continuity record answer different questions",
    ],
  },
  {
    path: "/tools/home-care-complaint-response-resolution-log/",
    require: [
      "Home Care Complaint, Response and Resolution Log",
      'hreflang="zh-TW"',
      "An inquiry, complaint, appeal and regulator report are different records",
      "Complaint received, response issued and service improved are three claims",
    ],
  },
  {
    path: "/tools/home-care-charge-service-payment-discrepancy-log/",
    require: [
      "Home Care Charge, Service and Payment Discrepancy Log",
      'hreflang="zh-TW"',
      "A bill, MSN, EOB, ABN and HHCCN answer different questions",
      "Expected, billed, paid and adjusted must remain separate",
    ],
  },
  {
    path: "/tools/home-care-payment-refund-collection-notice-log/",
    require: [
      "Home Care Payment, Refund and Collection Notice Log",
      'hreflang="zh-TW"',
      "Separate payment, refund, collection and adverse notices",
      "does not authenticate a notice",
    ],
  },
  {
    path: "/tools/rental-security-deposit-move-out-claim-log/",
    require: [
      "Rental Security Deposit Move-Out Claim Log",
      'hreflang="zh-TW"',
      "Separate the lease, deposit, move-out notice",
      "does not calculate a deposit balance",
    ],
  },
  {
    path: "/guides/purchase-receipt-organizer/",
    require: [
      "A purchase receipt organizer should preserve the transaction around the receipt",
      'hreflang="zh-TW"',
      "Separate six evidence layers",
      "consumer.ftc.gov/online-shopping",
    ],
  },
  {
    path: "/guides/subscription-cancellation-refund-records/",
    require: [
      "Subscription Cancellation and Refund Records",
      'hreflang="zh-TW"',
      "Separate the six records",
      "A cancellation request is not the same as confirmation",
    ],
  },
  {
    path: "/guides/familyboard-offline-backup-restore/",
    require: [
      "FamilyBoard Offline Backup and Restore Guide",
      'hreflang="zh-TW"',
      "Start with a small private household space",
      "Test restore instead of trusting the filename",
    ],
  },
  {
    path: "/tools/household-meeting-agenda-action-log/",
    require: [
      "Household Meeting Agenda and Action Log",
      'hreflang="zh-TW"',
      "Short household meetings work best",
      "Decisions and open questions",
    ],
  },
  {
    path: "/tools/household-pantry-expiry-review-log/",
    require: [
      "Pantry and Household Consumables Expiry Review Log",
      'hreflang="zh-TW"',
      "Record an observation, not a safety verdict",
      "Future affiliate placement",
    ],
  },
  {
    path: "/tools/household-clothing-care-repair-log/",
    require: [
      "Clothing Care and Repair Review Log",
      'hreflang="zh-TW"',
      "Capture the source before choosing a treatment",
      "Future affiliate placement",
    ],
  },
  {
    path: "/tools/household-meal-prep-role-log/",
    require: [
      "Household Meal Preparation and Role Log",
      'hreflang="zh-TW"',
      "Plan a meal slot, not an entire lifestyle",
      "Future affiliate placement",
    ],
  },
  {
    path: "/tools/household-trip-packing-handoff-log/",
    require: [
      "Household Trip Packing and Handoff Log",
      'hreflang="zh-TW"',
      "Keep the travel window explicit",
      "Future affiliate placement",
    ],
  },
  {
    path: "/tools/household-bill-source-status-log/",
    require: [
      "Household Bill Source and Status Log",
      'hreflang="zh-TW"',
      "Record the source before the action",
      "Future affiliate placement",
    ],
  },
  {
    path: "/tools/household-share-access-review-log/",
    require: [
      "Household Share Access Review Log",
      'hreflang="zh-TW"',
      "Define the smallest useful scope",
      "Future affiliate placement",
    ],
  },
  {
    path: "/tools/household-inventory-photo-capture-log/",
    require: [
      "Household Inventory Photo Capture Log",
      'hreflang="zh-TW"',
      "Choose a small room or item scope",
      "Future affiliate placement",
    ],
  },
  {
    path: "/tools/household-document-renewal-review-log/",
    require: [
      "Household Document Renewal Review Log",
      'hreflang="zh-TW"',
      "Start with purpose, not a document number",
      "Future affiliate placement",
    ],
  },
  {
    path: "/tools/household-internet-incident-review-log/",
    require: [
      "Household Internet Outage Log",
      'hreflang="zh-TW"',
      "Define the affected scope",
      "Future affiliate placement",
    ],
  },
  {
    path: "/tools/household-meter-reading-review-log/",
    require: [
      "Household Meter Reading Log",
      'hreflang="zh-TW"',
      "Record what was visible from a safe position",
      "Future affiliate placement",
    ],
  },
  {
    path: "/tools/household-accessibility-walkthrough-log/",
    require: [
      "Home Accessibility Walkthrough Log",
      'hreflang="zh-TW"',
      "Start with one path",
      "Future affiliate placement",
    ],
  },
  {
    path: "/tools/household-recycling-handoff-log/",
    require: [
      "Household Recycling Handoff Log",
      'hreflang="zh-TW"',
      "Start with the collection source",
      "Privacy and future affiliate placement",
    ],
  },
  {
    path: "/tools/household-donation-handoff-log/",
    require: [
      "Household Donation Handoff Log",
      'hreflang="zh-TW"',
      "Start with the transfer purpose",
      "Privacy and future affiliate placement",
    ],
  },
  {
    path: "/guides/appliance-inventory/",
    require: [
      "Build an appliance inventory that survives delivery",
      'hreflang="zh-TW"',
      "Purchase, delivery and installation are three separate dates",
      "content.naic.org/consumer/home-inventory",
    ],
  },
  {
    path: "/guides/repair-history/",
    require: [
      "Appliance repair history",
      'hreflang="zh-TW"',
      "Do not let a percentage heuristic overwrite the evidence",
      "usa.gov/company-product-service-complaints",
    ],
  },
  {
    path: "/zh-tw/guides/home-maintenance-schedule/",
    require: [
      "居家保養排程怎麼做",
      'hreflang="en"',
      "https://www.nfa.gov.tw/",
      "https://www.bsmi.gov.tw/",
    ],
  },
  {
    path: "/zh-tw/tools/warranty-expiration-calculator/",
    require: [
      "免費保固到期日計算器",
      'hreflang="en"',
      "保固起算日",
      "消費者保護法",
    ],
  },
  {
    path: "/zh-tw/tools/home-maintenance-schedule-generator/",
    require: [
      "免費居家保養排程產生器",
      'hreflang="en"',
      "第一次複查日期",
      "家電選購與使用注意事項",
    ],
  },
  {
    path: "/zh-tw/tools/household-subscription-cost-calculator/",
    require: [
      "家庭訂閱費用計算器",
      'hreflang="en"',
      "家庭訂閱清單",
      "每週、每月、每季與每年扣款",
    ],
  },
  {
    path: "/zh-tw/tools/emergency-contact-sheet-generator/",
    require: [
      "家庭緊急聯絡表產生器",
      'hreflang="en"',
      "110 是警察報案專線",
      "119 報案要領",
    ],
  },
  {
    path: "/zh-tw/tools/appliance-age-calculator/",
    require: [
      "家電年齡計算器",
      'hreflang="en"',
      "購買或安裝日期",
      "家電選購與使用注意事項",
    ],
  },
  {
    path: "/zh-tw/tools/home-maintenance-cost-tracker/",
    require: [
      "居家維護費用追蹤器",
      'hreflang="en"',
      "維護費用明細",
      "已規劃不是已核准",
    ],
  },
  {
    path: "/zh-tw/tools/home-repair-cost-log/",
    require: [
      "居家修繕費用紀錄表",
      'hreflang="en"',
      "每一行固定六個欄位",
      "手機送修注意事項",
    ],
  },
  {
    path: "/zh-tw/tools/home-service-reminder-generator/",
    require: [
      "到府服務提醒產生器",
      'hreflang="en"',
      "建議聯絡／預約日",
      "週期來源比漂亮的循環排程更重要",
    ],
  },
  {
    path: "/zh-tw/tools/receipt-retention-organizer/",
    require: [
      "收據保存整理器",
      'hreflang="en"',
      "人工複查日",
      "雲端發票解決",
    ],
  },
  {
    path: "/zh-tw/tools/household-annual-review-generator/",
    require: [
      "家庭年度總整理清單",
      'hreflang="en"',
      "本次總整理負責角色",
      "備份要有驗證證據",
    ],
  },
  {
    path: "/zh-tw/tools/move-in-checklist-generator/",
    require: [
      "搬入新家清單產生器",
      'hreflang="en"',
      "點交或取得使用權日期",
      "住宅租賃契約書範本",
    ],
  },
  {
    path: "/zh-tw/tools/move-out-condition-record-generator/",
    require: [
      "退租點交紀錄表產生器",
      'hreflang="en"',
      "屋況觀察",
      "押金與費用不能從屋況欄自動換算",
    ],
  },
  {
    path: "/zh-tw/tools/home-emergency-drill-record-generator/",
    require: [
      "家庭防災演練紀錄表產生器",
      'hreflang="en"',
      "四種狀態是工作流程",
      "不是住宅安全證明",
    ],
  },
  {
    path: "/zh-tw/tools/emergency-supply-inventory-audit/",
    require: [
      "家庭緊急物資盤點表",
      'hreflang="en"',
      "四種狀態不會合成防災分數",
      "未來商品推薦不能反過來創造需求",
    ],
  },
  {
    path: "/zh-tw/tools/emergency-contact-verification-log/",
    require: [
      "家庭緊急聯絡資料驗證紀錄",
      'hreflang="en"',
      "這不是第二份電話簿",
      "四個狀態只描述工作",
    ],
  },
  {
    path: "/zh-tw/tools/household-power-outage-event-log/",
    require: [
      "家庭停電紀錄表",
      'hreflang="en"',
      "四種狀態只代表工作流程",
      "不推測停電原因",
    ],
  },
  {
    path: "/zh-tw/tools/household-water-leak-event-log/",
    require: [
      "家庭漏水事件紀錄表",
      'hreflang="en"',
      "四個狀態只管理工作",
      "不會讀取水表",
    ],
  },
  {
    path: "/zh-tw/tools/household-storm-readiness-review/",
    require: [
      "家庭颱風準備複查表",
      'hreflang="en"',
      "四種狀態只描述工作流程",
      "不讀取即時颱風",
    ],
  },
  {
    path: "/zh-tw/tools/home-service-provider-verification-log/",
    require: [
      "家庭到府服務商查證紀錄",
      'hreflang="en"',
      "四種狀態只描述流程",
      "不查政府資料",
    ],
  },
  {
    path: "/zh-tw/guides/home-service-provider-list/",
    require: [
      "找水電師傅或到府維修要注意什麼",
      'hreflang="en"',
      "商工登記查得到，只回答一部分問題",
      "全國消費者服務專線 1950",
    ],
  },
  {
    path: "/zh-tw/tools/home-repair-change-order-log/",
    require: [
      "居家修繕追加變更紀錄",
      'hreflang="en"',
      "四種狀態是證據流程",
      "不建立契約",
    ],
  },
  {
    path: "/zh-tw/guides/contractor-records/",
    require: [
      "裝潢追加工程怎麼記",
      'hreflang="en"',
      "現行官方範本怎麼處理工程變更",
      "2026 新制傳言不能寫成已經生效",
    ],
  },
  {
    path: "/zh-tw/tools/home-repair-punch-list/",
    require: [
      "居家修繕缺失複查表",
      'hreflang="en"',
      "五種狀態保存真正的進度",
      "不檢查施工",
    ],
  },
  {
    path: "/zh-tw/guides/renovation-records/",
    require: [
      "裝潢驗收紀錄不是一張勾選表",
      'hreflang="en"',
      "現行官方範本把完工通知和驗收分成不同節點",
      "全國消費者服務專線 1950",
    ],
  },
  {
    path: "/zh-tw/tools/home-repair-closeout-checklist/",
    require: [
      "居家修繕結案資料包檢查表",
      'hreflang="en"',
      "已提出索取和已收到不能混成同一狀態",
      "不認證完工",
    ],
  },
  {
    path: "/zh-tw/guides/home-improvement-receipts/",
    require: [
      "裝潢收據怎麼整理",
      'hreflang="en"',
      "台灣法律區分統一發票與普通收據",
      "房地合一稅需要的是整組證據",
    ],
  },
  {
    path: "/zh-tw/tools/warranty-claim-evidence-log/",
    require: [
      "產品保固申請證據紀錄表",
      'hreflang="en"',
      "六種狀態代表證據階段",
      "家庭複查日不能冒充法定 15 日",
    ],
  },
  {
    path: "/zh-tw/guides/how-to-track-product-warranties/",
    require: [
      "產品保固怎麼整理",
      'hreflang="en"',
      "先把六層資料分開",
      "商品安全資訊網",
    ],
  },
  {
    path: "/zh-tw/tools/product-recall-action-log/",
    require: [
      "產品召回處置紀錄表",
      'hreflang="en"',
      "七種狀態保留真正的不確定性",
      "不會連線查召回",
    ],
  },
  {
    path: "/zh-tw/guides/product-registration-tracker/",
    require: [
      "產品註冊與召回通知怎麼整理",
      'hreflang="en"',
      "先把四種不同事情拆開",
      "商品召回訊息列表",
    ],
  },
  {
    path: "/zh-tw/tools/appliance-service-visit-log/",
    require: [
      "家電到府維修訪視紀錄表",
      'hreflang="en"',
      "八種狀態表示不同證據階段",
      "不診斷、不驗證業者",
    ],
  },
  {
    path: "/zh-tw/guides/service-history/",
    require: [
      "家電到府維修紀錄怎麼寫",
      'hreflang="en"',
      "到場後把四種聲音分開",
      "手機送修注意事項",
    ],
  },
  {
    path: "/zh-tw/tools/appliance-repair-callback-log/",
    require: [
      "家電維修後又壞紀錄表",
      'hreflang="en"',
      "九種狀態表示不同證據階段",
      "不計算法律上的送修次數",
    ],
  },
  {
    path: "/zh-tw/tools/appliance-purchase-installation-record/",
    require: [
      "家電購買與安裝紀錄表",
      'hreflang="en"',
      "九種狀態避免過早宣稱完成",
      "保證書與發票要連結但不能合併",
    ],
  },
  {
    path: "/zh-tw/tools/purchase-delivery-evidence-log/",
    require: [
      "購買與到貨證據紀錄表",
      'hreflang="en"',
      "九種狀態不讓物流掃描冒充結果",
      "零售業等網路交易定型化契約應記載及不得記載事項",
    ],
  },
  {
    path: "/zh-tw/tools/moving-box-handover-log/",
    require: [
      "搬家箱件交接紀錄表",
      'hreflang="en"',
      "九種狀態避免過早寫成完成",
      "搬家貨運定型化契約應記載及不得記載事項",
    ],
  },
  {
    path: "/zh-tw/guides/moving-inventory/",
    require: [
      "搬家物品清單要追蹤",
      'hreflang="en"',
      "台灣搬家契約不能只留口頭報價",
      "定型化契約範本是訂約參考",
    ],
  },
  {
    path: "/zh-tw/tools/storage-unit-access-inventory-log/",
    require: [
      "迷你倉進出與物品紀錄表",
      'hreflang="en"',
      "九種狀態把進入倉位與看見物品分開",
      "不會把「有登記」",
    ],
  },
  {
    path: "/zh-tw/guides/storage-unit-inventory/",
    require: [
      "迷你倉物品清單要回答",
      'hreflang="en"',
      "一次建立五層資料",
      "退租要分成物品、空倉狀況與契約帳務",
    ],
  },
  {
    path: "/zh-tw/tools/household-record-retrieval-drill-log/",
    require: [
      "家庭文件查找與交接演練紀錄",
      'hreflang="en"',
      "八種狀態把「找到」與「可安全交接」分開",
      "不搜尋檔案",
    ],
  },
  {
    path: "/zh-tw/guides/digital-home-binder/",
    require: [
      "家庭數位資料夾不是把所有檔案塞進同一個雲端硬碟",
      'hreflang="en"',
      "一次建立六層",
      "查找演練不應變成交換密碼",
    ],
  },
  {
    path: "/zh-tw/tools/important-household-document-review/",
    require: [
      "家庭重要文件適用性與來源盤點",
      'hreflang="en"',
      "十種狀態把「適用」與「已經有檔案」分開",
      "不開啟、驗證、補發或保存任何文件",
    ],
  },
  {
    path: "/zh-tw/guides/important-household-documents/",
    require: [
      "家庭重要文件清單不是把所有證件影本集中在同一個資料夾",
      'hreflang="en"',
      "每一類文件先回答五個問題",
      "MyData 是取用來源，不是 FamilyBoard 雲端硬碟",
    ],
  },
  {
    path: "/zh-tw/tools/household-record-retention-decision-log/",
    require: [
      "家庭紀錄保存與銷毀決策紀錄",
      'hreflang="en"',
      "十二種狀態把來源、事件與結果分開",
      "工具不計算期限，也不銷毀紀錄",
    ],
  },
  {
    path: "/zh-tw/guides/how-long-to-keep-household-records/",
    require: [
      "家庭文件保存期限不是每個資料夾都填「五年」",
      'hreflang="en"',
      "綜合所得稅憑證要跟申報用途走",
      "七日解除權不是交易紀錄保存期限",
    ],
  },
  {
    path: "/zh-tw/tools/appliance-manual-source-check-log/",
    require: [
      "家電說明書來源核對紀錄",
      'hreflang="en"',
      "十一種狀態把型號、來源、文件與公告分開",
      "工具不辨識家電、不移動／拆開／斷開或檢查設備",
    ],
  },
  {
    path: "/zh-tw/guides/organize-appliance-manuals/",
    require: [
      "家電說明書怎麼整理",
      'hreflang="en"',
      "從製造商目前支援頁找",
      "召回、召修與安全公告一定要另外查",
    ],
  },
  {
    path: "/zh-tw/tools/household-insurance-policy-source-version-log/",
    require: [
      "家庭保單來源與版本核對紀錄",
      'hreflang="en"',
      "十一種狀態把公司、文件、版本、存取與爭議分開",
      "工具不搜尋、驗證、投保、承保、續保、換約、停效、復效、終止或變更保險",
    ],
  },
  {
    path: "/zh-tw/guides/organize-insurance-documents/",
    require: [
      "保單怎麼整理？先分清保險契約、批單、續保通知與申訴來源",
      'hreflang="en"',
      "保單不是單一 PDF，要保存發行文件的組成關係",
      "台灣保險申訴流程要連到目前官方來源",
    ],
  },
  {
    path: "/zh-tw/tools/household-utility-provider-service-handoff-log/",
    require: [
      "家庭公用事業供應與服務交接紀錄",
      'hreflang="en"',
      "十二種狀態分清找到來源、提出申請與實際完成",
      "工具不搜尋供應單位，不查地址、電號、水號、瓦斯／網路帳號或表號",
    ],
  },
  {
    path: "/zh-tw/guides/organize-utility-account-information/",
    require: [
      "水電過戶怎麼整理？先分清供應單位、戶名、結算與安全入口",
      'hreflang="en"',
      "台電的搬家結算、戶名變更與停電通報是不同流程",
      "電信爭議保留業者申訴與後續調處來源",
    ],
  },
  {
    path: "/zh-tw/tools/household-vehicle-document-source-status-log/",
    require: [
      "家庭車輛文件來源與狀態紀錄",
      'hreflang="en"',
      "十二種狀態分開找到文件、提出行動與看到結果",
      "工具不查車牌、車身號碼、引擎號碼、行照、車籍、駕照、保險、驗車、召回",
    ],
  },
  {
    path: "/zh-tw/guides/organize-vehicle-documents-at-home/",
    require: [
      "汽車行照、驗車、強制險與召回怎麼整理？台灣車輛文件清單",
      'hreflang="en"',
      "驗車日、預約、到場與合格結果是四件事",
      "召回研究要從車型線索走到受保護車輛比對",
    ],
  },
  {
    path: "/zh-tw/tools/household-pet-record-source-handoff-log/",
    require: [
      "家庭寵物紀錄來源與交接狀態表",
      'hreflang="en"',
      "十二種狀態分開找到來源、交接行動與負責結果",
      "工具不查晶片、不辨認飼主、不登入寵物登記或獸醫系統",
    ],
  },
  {
    path: "/zh-tw/guides/organize-pet-records/",
    require: [
      "寵物登記、晶片、疫苗與病歷怎麼整理？台灣家庭寵物紀錄指南",
      'hreflang="en"',
      "晶片、登記、飼主資料與登記證明是四層",
      "病歷、診斷與用藥指示留在獸醫來源",
    ],
  },
  {
    path: "/zh-tw/tools/household-school-record-source-handoff-log/",
    require: [
      "家庭學校紀錄來源與交接狀態表",
      'hreflang="en"',
      "十二種狀態分開找到來源、學生比對、交接與校方結果",
      "工具不登入學校、教育主管機關、健康、輔導、特教、交通、繳費或活動系統",
    ],
  },
  {
    path: "/zh-tw/guides/organize-school-records-at-home/",
    require: [
      "學籍、成績、健康與同意書怎麼整理？台灣家庭學校紀錄指南",
      'hreflang="en"',
      "學籍不是一份通用文件，要先分教育階段與負責來源",
      "交通、接送與放學授權是安全流程，不是一般聯絡表",
    ],
  },
  {
    path: "/zh-tw/tools/household-medical-information-source-handoff-log/",
    require: [
      "家庭醫療資訊來源與交接狀態表",
      'hreflang="en"',
      "十二種狀態分開來源、受保護存取與負責結果",
      "工具不登入健康存摺、院所、藥局、檢驗影像或保險系統",
    ],
  },
  {
    path: "/zh-tw/guides/household-medical-information-organization/",
    require: [
      "家庭醫療資料怎麼整理？健康存摺、病歷複製、用藥與照護交接指南",
      'hreflang="en"',
      "健康存摺、院所病歷與家庭索引是三套不同來源",
      "用藥清單要保持目前版本，但不能貼在共用表單",
    ],
  },
  {
    path: "/zh-tw/tools/caregiver-handoff-source-authorization-log/",
    require: [
      "照護者交接來源與授權狀態表",
      'hreflang="en"',
      "十二種狀態分開來源、權限、存取與接受結果",
      "工具不驗證照護者身分、不授予照護權限",
    ],
  },
  {
    path: "/zh-tw/guides/caregiver-handoff-checklist/",
    require: [
      "照護者交接怎麼做？作息、授權、長照服務、喘息與緊急升級指南",
      'hreflang="en"',
      "長照申請、到府評估、照顧計畫與服務開始是四個事件",
      "照護者身分、可接收資訊與可做決定是三種權限",
    ],
  },
  {
    path: "/zh-tw/tools/home-care-visit-scope-service-result-log/",
    require: [
      "居家照護服務到離場、範圍與結果紀錄表",
      'hreflang="en"',
      "十二種狀態分開到訪來源、證據、例外與負責結果",
      "家庭索引不是正式到離場、服務紀錄、工時或計費系統",
    ],
  },
  {
    path: "/zh-tw/guides/home-care-service-visit-records/",
    require: [
      "居家服務紀錄怎麼做？長照契約、到離場、服務範圍、例外與申訴指南",
      'lang="zh-TW"',
      "照顧計畫、契約、服務紀錄與家庭觀察是四套來源",
      "排定、到場、離場、服務例外與負責回覆是五個事件",
    ],
  },
  {
    path: "/zh-tw/tools/home-care-service-plan-change-notice-log/",
    require: [
      "居家服務方案變更與通知紀錄表",
      'hreflang="en"',
      "十二種狀態把「變更」拆成真正可核對的流程",
      "重新評估、照顧計畫、契約附件與排班通知不是同一件事",
    ],
  },
  {
    path: "/zh-tw/guides/home-care-service-plan-changes/",
    require: [
      "居家服務變更怎麼處理？照顧計畫、契約通知、換人、改時段與終止指南",
      'lang="zh-TW"',
      "先問「哪一層變了」，不要只問「改了什麼」",
      "收到、簽收、理解、同意與異議是五個不同狀態",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/home-care-service-interruption-backup-continuity-log/",
    require: [
      "居家服務臨時中斷與備援銜接紀錄表",
      'hreflang="en"',
      "十二種狀態分開訊號、安全、備援與實際結果",
      "未到事件與服務連續性是兩張不同表",
    ],
  },
  {
    path: "/zh-tw/guides/home-care-service-interruption-backup-plan/",
    require: [
      "居服員臨時沒來怎麼辦？取消、未到、備援、喘息與恢復服務指南",
      'lang="zh-TW"',
      "把「沒來」拆成七個可以核對的問題",
      "喘息服務可以詢問，但不能假設當天可用",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/home-care-complaint-response-resolution-log/",
    require: [
      "居家服務申訴、回覆與改善結果紀錄表",
      'hreflang="en"',
      "十二種狀態不要把「已回覆」藏在「已改善」裡",
      "已收件、已調查、已回覆、已改善是四件事",
    ],
  },
  {
    path: "/zh-tw/guides/home-care-service-complaint-resolution/",
    require: [
      "居家服務怎麼申訴？服務單位回覆、1966、地方主管機關、調處與改善結果指南",
      'lang="zh-TW"',
      "第二步先回答：你遇到的是哪一種問題？",
      "何時使用地方主管機關陳情、申訴或調處",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/home-care-charge-service-payment-discrepancy-log/",
    require: [
      "居家服務費用、帳單與付款差異紀錄表",
      'hreflang="en"',
      "十二種狀態顯示目前缺哪一層",
      "更正、折抵、退費與實際收到是四個結果",
    ],
  },
  {
    path: "/zh-tw/tools/home-care-payment-refund-collection-notice-log/",
    require: [
      "居家服務付款、退款、催收與不利通知紀錄表",
      'hreflang="en"',
      "把付款、退費、催收與不利通知拆成來源",
      "不驗證通知",
    ],
  },
  {
    path: "/zh-tw/tools/rental-security-deposit-move-out-claim-log/",
    require: [
      "租屋退租押金與扣款紀錄表",
      'hreflang="en"',
      "把租約、押金、退租通知、點交",
      "不判定房東或房客責任",
    ],
  },
  {
    path: "/zh-tw/guides/home-care-service-fees-and-billing/",
    require: [
      "居家服務費用怎麼核對？長照部分負擔、自費、收據、未遇、退費與申訴指南",
      'lang="zh-TW"',
      "先理解一張帳單背後的七份來源",
      "退費與折抵的追蹤終點是「實際結果」",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/guides/home-care-refund-and-collection-notices/",
    require: [
      "居家服務退款與催收通知怎麼看？付款、退費與異議交接指南",
      'lang="zh-TW"',
      "先把五種文件分開",
      "退款不是一個動詞，而是一條證據鏈",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/guides/rental-security-deposit-move-out-claims/",
    require: [
      "租屋退租押金被扣怎麼整理",
      'lang="zh-TW"',
      "建立安全文件地圖",
      "把扣款、退款與實際入帳拆成三條線",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/guides/subscription-cancellation-refund-records/",
    require: [
      "訂閱取消與退款紀錄怎麼做",
      'hreflang="en"',
      "先分開六種紀錄",
      "退款要分成申請、核准與入帳",
    ],
  },
  {
    path: "/zh-tw/guides/automatic-renewal-charge-dispute-taiwan/",
    require: [
      "台灣自動續約又扣款怎麼整理",
      'lang="zh-TW"',
      "先建立五個安全代號",
      "付款爭議與消費申訴是不同路徑",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/guides/familyboard-offline-backup-restore/",
    require: [
      "FamilyBoard 離線備份與還原教學",
      'hreflang="en"',
      "匯出備份並建立保管代號",
      "還原測試不能省略",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-household-handoff-tutorial/",
    require: [
      "FamilyBoard 家庭交接怎麼用",
      'lang="zh-TW"',
      "先定義這次交接的時間與範圍",
      "接手者要實際做一次查找",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/household-meeting-agenda-action-log/",
    require: [
      "家庭會議議程與待辦紀錄工具",
      'hreflang="en"',
      "家庭會議先有範圍，再有議程",
      "已決定與仍待確認要分開",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-household-meeting-tutorial/",
    require: [
      "FamilyBoard 家庭會議怎麼開",
      'lang="zh-TW"',
      "從一個小目的開始",
      "決定、任務、結果要用不同詞",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/household-pantry-expiry-review-log/",
    require: [
      "食品與家庭消耗品日期盤點工具",
      'hreflang="en"',
      "先記錄看見的事，不要急著下安全結論",
      "標示、來源與家庭計畫要分開",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-pantry-review-tutorial/",
    require: [
      "FamilyBoard 食品櫃怎麼整理",
      'lang="zh-TW"',
      "先選一個可以在十五分鐘內完成的範圍",
      "把標示日期和家庭計畫分開",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/household-clothing-care-repair-log/",
    require: [
      "衣物洗標與修補紀錄工具",
      'hreflang="en"',
      "先記錄洗標來源，再決定下一步",
      "洗標、原廠與家庭習慣要分開",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-clothing-care-tutorial/",
    require: [
      "FamilyBoard 換季衣物怎麼整理",
      'lang="zh-TW"',
      "先選一個十五分鐘能完成的範圍",
      "觀察與計畫不能混在一起",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/household-meal-prep-role-log/",
    require: [
      "家庭餐前準備與分工工具",
      'hreflang="en"',
      "先安排餐次與角色，不要把工具當成食譜",
      "計畫、行動與結果要分開",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-meal-prep-tutorial/",
    require: [
      "FamilyBoard 一週備餐怎麼分工",
      'lang="zh-TW"',
      "先選兩個可以完成的餐次",
      "計畫不是行動，行動也不是結果",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/household-trip-packing-handoff-log/",
    require: [
      "家庭旅行打包與住家交接工具",
      'hreflang="en"',
      "先把旅行範圍和日期說清楚",
      "交接計畫不等於交接結果",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-trip-handoff-tutorial/",
    require: [
      "FamilyBoard 旅行交接怎麼做",
      'lang="zh-TW"',
      "先選一個清楚的旅行窗口",
      "來源和家庭任務要分開",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/household-bill-source-status-log/",
    require: [
      "家庭帳單來源與到期追蹤工具",
      'hreflang="en"',
      "先記錄來源，再安排下一步",
      "到期日不等於付款結果",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-bill-review-tutorial/",
    require: [
      "FamilyBoard 家庭帳單怎麼追蹤",
      'lang="zh-TW"',
      "先從兩張近期文件開始",
      "到期日、付款行動與確認結果不同",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/household-share-access-review-log/",
    require: [
      "家庭文件分享權限複查工具",
      'hreflang="en"',
      "先縮小要分享的範圍",
      "暫時分享要先寫到期核點",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-share-access-tutorial/",
    require: [
      "FamilyBoard 家庭文件怎麼安全分享",
      'lang="zh-TW"',
      "先選一個真的需要交接的範圍",
      "寄出邀請不等於權限已生效",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/household-inventory-photo-capture-log/",
    require: [
      "家庭財物拍照盤點工具",
      'hreflang="en"',
      "先選一個小範圍",
      "拍完先做隱私檢查",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-photo-inventory-tutorial/",
    require: [
      "FamilyBoard 家庭財物怎麼拍照盤點",
      'lang="zh-TW"',
      "先從客廳或一組家電開始",
      "共享前完成隱私檢查",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/household-document-renewal-review-log/",
    require: [
      "家庭文件更新複查紀錄工具",
      'hreflang="en"',
      "先寫用途",
      "複查日期是家庭核點",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-document-renewal-tutorial/",
    require: [
      "FamilyBoard 家庭文件要不要更新",
      'lang="zh-TW"',
      "先挑一個小範圍",
      "三區測試與備份",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/household-internet-incident-review-log/",
    require: [
      "家庭網路中斷與恢復紀錄工具",
      'hreflang="en"',
      "先定義受影響的小範圍",
      "恢復後要分層複查",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-internet-incident-tutorial/",
    require: [
      "FamilyBoard 家庭網路斷線怎麼記錄",
      'lang="zh-TW"',
      "先建立小範圍與安全代號",
      "恢復後不要只看一個指示燈",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/household-meter-reading-review-log/",
    require: [
      "家庭水電瓦斯表讀數紀錄工具",
      'hreflang="en"',
      "在安全位置記錄看得到的內容",
      "比較觀察，不推算費用",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-meter-reading-tutorial/",
    require: [
      "FamilyBoard 水電瓦斯表怎麼記錄",
      'lang="zh-TW"',
      "先選一個情境與安全代號",
      "人工抄錄時先顧安全",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/household-accessibility-walkthrough-log/",
    require: [
      "居家無障礙動線走讀工具",
      'hreflang="en"',
      "先選一條小動線",
      "把障礙與不確定寫成看得到的事",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-accessibility-walkthrough-tutorial/",
    require: [
      "FamilyBoard 居家動線怎麼做無障礙走讀",
      'lang="zh-TW"',
      "選一條實際會用到的路",
      "讓實際使用者參與重測",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/household-recycling-handoff-log/",
    require: [
      "家庭垃圾與資源回收交接工具",
      'hreflang="en"',
      "先找目前適用的來源",
      "把「項目」和「規則問題」分開",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-recycling-handoff-tutorial/",
    require: [
      "FamilyBoard 家庭垃圾與資源回收怎麼交接",
      'lang="zh-TW"',
      "先選目前適用的公告來源",
      "把交接結果帶回家庭會議",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/tools/household-donation-handoff-log/",
    require: [
      "家庭物品捐贈轉贈交接工具",
      'hreflang="en"',
      "先寫清楚這列為什麼存在",
      "來源和物品觀察要分開",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-donation-handoff-tutorial/",
    require: [
      "FamilyBoard 家庭物品捐贈轉贈怎麼交接",
      'lang="zh-TW"',
      "先寫清楚這列為什麼存在",
      "用最少必要資訊做家庭交接",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/guides/purchase-receipt-organizer/",
    require: [
      "網購到貨缺件或損壞怎麼辦？發票、拆封與退換貨紀錄",
      'hreflang="en"',
      "七日解除權不是所有購買的通用試用期",
      "通訊交易解除權合理例外情事適用準則",
    ],
  },
  {
    path: "/zh-tw/guides/appliance-inventory/",
    require: [
      "家電清冊怎麼做",
      'hreflang="en"',
      "購買、交貨與安裝是三個不同事件",
      "電器買賣定型化契約應記載及不得記載事項",
    ],
  },
  {
    path: "/zh-tw/guides/repair-history/",
    require: [
      "家電修了又壞怎麼辦",
      'hreflang="en"',
      "送修三次的規則有明確前提",
      "電器買賣定型化契約應記載及不得記載事項",
    ],
  },
  {
    path: "/zh-tw/guides/home-evacuation-information/",
    require: [
      "家庭避難計畫怎麼做",
      'hreflang="en"',
      "避難收容處所是動態服務",
      "全民防災 e 點通",
    ],
  },
  {
    path: "/zh-tw/guides/emergency-supply-inventory/",
    require: [
      "緊急避難包清單怎麼整理",
      'hreflang="en"',
      "先分清楚",
      "臺灣全民安全指引",
    ],
  },
  {
    path: "/zh-tw/guides/emergency-information-sheet/",
    require: [
      "家庭緊急聯絡資料表怎麼做",
      'hreflang="en"',
      "台灣官方防災卡把聯絡",
      "離線備援不能只存在一支手機",
    ],
  },
  {
    path: "/zh-tw/guides/power-outage-home-preparedness/",
    require: [
      "停電怎麼準備",
      'hreflang="en"',
      "公寓大廈要把住戶、管理與台電三層分清楚",
      "1911",
    ],
  },
  {
    path: "/zh-tw/guides/water-leak-response-home-records/",
    require: [
      "家裡漏水怎麼辦",
      'hreflang="en"',
      "公共供水、大樓共用、室內設備不是同一個窗口",
      "1910",
    ],
  },
  {
    path: "/zh-tw/guides/storm-preparation-home-checklist/",
    require: [
      "颱風來了家裡要準備什麼",
      'hreflang="en"',
      "同一場颱風，要分開看風、雨、淹水與坡地警戒",
      "246.ardswc.gov.tw",
    ],
  },
  {
    path: "/zh-tw/tools/vacation-shutdown-checklist-generator/",
    require: [
      "旅行前住家檢查清單",
      'hreflang="en"',
      "需要交接的照護或收取事項",
      "不提供通用水電瓦斯關閉指令",
    ],
  },
  {
    path: "/zh-tw/tools/house-sitter-instruction-generator/",
    require: [
      "看家注意事項產生器",
      'hreflang="en"',
      "禁止事項與隱私界線",
      "門禁與密碼必須和可列印摘要分離",
    ],
  },
  {
    path: "/zh-tw/tools/pet-sitter-instruction-generator/",
    require: [
      "寵物照護交接表產生器",
      'hreflang="en"',
      "獸醫書面指示與就醫授權位置",
      "多隻動物要做交叉核對",
    ],
  },
  {
    path: "/zh-tw/tools/home-handoff-summary-generator/",
    require: [
      "家庭交接摘要產生器",
      'hreflang="en"',
      "本次明確納入的資料類別",
      "接受確認不是簽名而已",
    ],
  },
  {
    path: "/zh-tw/tools/annual-subscription-cost-calculator/",
    require: [
      "訂閱年成本計算器",
      'hreflang="en"',
      "真正扣款週期",
      "每 4 週不是每月",
    ],
  },
  {
    path: "/zh-tw/tools/emergency-binder-generator/",
    require: [
      "家庭緊急資料夾產生器",
      'hreflang="en"',
      "集合與失聯安排",
      "目的不是集中最多秘密",
    ],
  },
  {
    path: "/zh-tw/tools/cleaning-schedule-generator/",
    require: [
      "家庭清潔排程產生器",
      'hreflang="en"',
      "空間、時間與完成定義",
      "先算容量，再談意志力",
    ],
  },
  {
    path: "/zh-tw/guides/appliance-replacement-planning/",
    require: [
      "家電要修還是換？台灣家庭的汰換時機與查證流程",
      'hreflang="en"',
      "安全與召回優先於價格",
      "新機標價不等於可使用的替代總成本",
    ],
  },
  {
    path: "/zh-tw/guides/room-by-room-home-inventory/",
    require: [
      "家庭財物清冊怎麼做？逐房間盤點、拍照與更新方法",
      'hreflang="en"',
      "把房間切成看得見的區帶",
      "清單、照片與取得憑證要分開保存",
    ],
  },
  {
    path: "/zh-tw/guides/cleaning-schedule/",
    require: [
      "家庭清潔排程怎麼排？依空間、時間容量與分工建立可持續週期",
      'hreflang="en"',
      "用容量先判斷排程能不能成立",
      "分工要看負擔與安全",
    ],
  },
  {
    path: "/zh-tw/guides/move-out-home-records/",
    require: [
      "退租點交注意事項：把搬離住宅變成可核對、可結案的流程",
      'hreflang="en"',
      "共同點交要同時處理四張清單",
      "FamilyBoard 資料遷移順序",
    ],
  },
  {
    path: "/zh-tw/tools/appliance-replacement-planner/",
    require: [
      "家電汰換評估表",
      'hreflang="en"',
      "家庭自訂規劃年限",
      "維修估價要能回答",
    ],
  },
  {
    path: "/zh-tw/tools/room-inventory-generator/",
    require: [
      "房間物品清冊產生器",
      'hreflang="en"',
      "房間內的實際區帶",
      "用區帶建立不漏掃的路線",
    ],
  },
  {
    path: "/zh-tw/tools/warranty-checklist-generator/",
    require: [
      "保固資料檢查表",
      'hreflang="en"',
      "書面保固記載的起算方式",
      "保固不是只存一張發票",
    ],
  },
  {
    path: "/zh-tw/tools/recurring-chore-planner/",
    require: [
      "家庭家事輪值表產生器",
      'hreflang="en"',
      "這一輪從名單第幾位開始",
      "每人分到相同件數就代表公平嗎",
    ],
  },
  {
    path: "/zh-tw/tools/home-inventory-checklist-generator/",
    require: [
      "住宅財物盤點清單產生器",
      'hreflang="en"',
      "要盤點的空間",
      "照片、單據與災損資料是三種不同證據",
    ],
  },
  {
    path: "/zh-tw/tools/household-document-index-generator/",
    require: [
      "家庭文件索引產生器",
      'hreflang="en"',
      "備份或替代取得位置",
      "索引不應保存密碼",
    ],
  },
  {
    path: "/zh-tw/tools/appliance-maintenance-checklist-generator/",
    require: [
      "家電保養清單產生器",
      'hreflang="en"',
      "實際依據位置",
      "不同家電真的會產生不同清單",
    ],
  },
  {
    path: "/zh-tw/privacy/",
    require: [
      "FamilyBoard 隱私權政策",
      'hreflang="en"',
      "核心家庭紀錄會留在目前瀏覽器",
      "/zh-tw/contact/",
    ],
  },
  {
    path: "/zh-tw/contact/",
    require: [
      "聯絡 FamilyBoard",
      'hreflang="en"',
      "GitHub 私人漏洞回報",
      "/zh-tw/privacy/",
    ],
  },
  {
    path: "/zh-tw/security/",
    require: [
      "FamilyBoard 資安說明",
      'hreflang="en"',
      "PBKDF2-SHA-256、310,000 次迭代",
      "GitHub 私人漏洞回報",
    ],
  },
  {
    path: "/zh-tw/affiliate-disclosure/",
    require: [
      "FamilyBoard 聯盟行銷揭露",
      'hreflang="en"',
      "As an Amazon Associate I earn from qualifying purchases.",
      "/zh-tw/privacy/",
    ],
  },
  {
    path: "/zh-tw/terms/",
    require: [
      "FamilyBoard 使用條款",
      'hreflang="en"',
      "不是專業服務或正式證明",
      "/zh-tw/security/",
    ],
  },
  {
    path: "/zh-tw/guides/digital-home-inventory-backup/",
    require: [
      "FamilyBoard 備份還原教學",
      'hreflang="en"',
      "只驗證備份，不進行還原",
      "資通安全署",
    ],
  },
  {
    path: "/zh-tw/guides/home-maintenance-log/",
    require: [
      "居家保養紀錄教學",
      'hreflang="en"',
      "完成後間隔月數",
      "經濟部標準檢驗局",
    ],
  },
  {
    path: "/zh-tw/features/household-handoff/",
    require: [
      "家庭交接清單教學",
      'hreflang="en"',
      "交接設定檔",
      "敏感聯絡人",
    ],
  },
  {
    path: "/zh-tw/features/home-inventory-tracker/",
    require: [
      "家庭資產清單 App 教學",
      'hreflang="en"',
      "關注與封存不是刪除",
      "一個把同一資產所有保養、保固與文件集中顯示",
    ],
  },
  {
    path: "/zh-tw/features/family-task-manager/",
    require: [
      "家庭任務管理 App 教學",
      'hreflang="en"',
      "完成不會替你推測下一個日期",
      "不發推播、電子郵件或簡訊",
    ],
  },
  {
    path: "/zh-tw/features/home-dashboard/",
    require: [
      "家庭管理儀表板教學",
      'hreflang="en"',
      "有到期日的任務先顯示",
      "今天加七天",
    ],
  },
  {
    path: "/zh-tw/features/maintenance-tracker/",
    require: [
      "居家保養紀錄 App 教學",
      'hreflang="en"',
      "完成後間隔月數",
      "費用欄沒有幣別",
    ],
  },
  {
    path: "/zh-tw/features/warranty-tracker/",
    require: [
      "保固管理 App 教學",
      'hreflang="en"',
      "截止日正好是今天",
      "沒有統一詳情頁",
    ],
  },
  {
    path: "/zh-tw/features/household-subscription-tracker/",
    require: [
      "家庭訂閱管理 App 教學",
      'hreflang="en"',
      "年化費用怎麼算",
      "不會自動新增獨立的取消日期",
    ],
  },
  {
    path: "/zh-tw/features/household-calendar/",
    require: [
      "家庭行事曆 App 教學",
      'hreflang="en"',
      "結束時間必須晚於開始時間",
      "跨裝置不是同步",
    ],
  },
  {
    path: "/zh-tw/features/emergency-information-organizer/",
    require: [
      "家庭緊急聯絡人 App 教學",
      'hreflang="en"',
      "敏感標記只會讓卡片顯示私密狀態",
      "完整 JSON 備份",
    ],
  },
  {
    path: "/zh-tw/features/family-display-mode/",
    require: [
      "舊平板家庭電子看板教學",
      'hreflang="en"',
      "每分鐘重新整理",
      "不是跨裝置同步",
    ],
  },
  {
    path: "/zh-tw/features/household-documents-organizer/",
    require: [
      "家庭文件管理 App 教學",
      'hreflang="en"',
      "原始文件存放位置",
      "有日期的紀錄放在沒有日期的紀錄前",
    ],
  },
  {
    path: "/zh-tw/features/private-family-organizer/",
    require: [
      "隱私家庭管理 App",
      'hreflang="en"',
      "不載入 Google Analytics 4 或廣告程式碼",
      "PBKDF2-SHA-256",
    ],
  },
  {
    path: "/zh-tw/features/offline-household-organizer/",
    require: [
      "離線家庭管理 App 教學",
      'hreflang="en"',
      "離線 App 快取已就緒",
      "關掉網路前的五分鐘驗收",
    ],
  },
  {
    path: "/features/offline-household-organizer/",
    require: [
      "An offline household organizer should survive a real network test",
      'hreflang="zh-TW"',
      "Offline app cache ready",
      "five-minute offline acceptance test",
    ],
    forbid: ['http-equiv="refresh"'],
  },
  {
    path: "/zh-tw/guides/organize-household-subscriptions/",
    require: [
      "家庭訂閱管理教學",
      'hreflang="en"',
      "年化費用依幣別分開",
      "取消免費贈送或已訂閱",
    ],
  },
  {
    path: "/zh-tw/guides/household-documents-organizer/",
    require: [
      "家庭文件索引教學",
      'hreflang="en"',
      "原始文件存放位置",
      "資通安全署",
    ],
  },
  {
    path: "/zh-tw/features/free-home-management-app/",
    require: [
      "FamilyBoard 使用教學",
      'hreflang="en"',
      "CSV 家庭資料總表可以取代 JSON 備份嗎",
      "/zh-tw/app/",
    ],
  },
];

let failed = false;

for (const check of checks) {
  const url = new URL(check.path, origin);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
      headers: { "user-agent": "FamilyBoard-Live-Monitor/1.0" },
    });
    const body = await response.text();
    const missing = check.require.filter((token) => !body.includes(token));
    const present = (check.forbid || []).filter((token) => body.includes(token));
    const ok = response.ok && missing.length === 0 && present.length === 0;

    console.log(`${ok ? "PASS" : "FAIL"} ${response.status} ${url}`);
    if (missing.length) console.error(`  missing: ${missing.join(", ")}`);
    if (present.length) console.error(`  forbidden: ${present.join(", ")}`);
    failed ||= !ok;
  } catch (error) {
    failed = true;
    console.error(`FAIL ${url}: ${error.message}`);
  }
}

if (failed) process.exit(1);
