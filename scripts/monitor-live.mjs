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
      "<loc>https://familyboard.win/guides/familyboard-warranty-expiration-calculator-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-home-maintenance-schedule-generator-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-household-decision-register-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/monthly-home-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/quarterly-home-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/seasonal-home-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/spring-home-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/summer-home-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/fall-home-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/first-time-homeowner-maintenance-guide/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/apartment-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/condo-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/rental-home-maintenance-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-maintenance-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-repair-history/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/winter-home-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/preventive-home-maintenance/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/maintenance-priorities/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/refrigerator-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/freezer-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/washing-machine-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-maintenance-binder/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-maintenance-budget/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-maintenance-reminders/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-maintenance-after-vacation/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/move-in-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/annual-home-review/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/dryer-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/dishwasher-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/oven-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-maintenance-delegation/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/range-hood-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/air-conditioner-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/microwave-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/hvac-filter-tracker/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/computer-electronics-inventory/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/furniture-inventory/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/furnace-maintenance-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/heat-pump-maintenance-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/water-heater-maintenance-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/dehumidifier-maintenance-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/air-purifier-filter-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/solar-panel-maintenance-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/smoke-alarm-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/fire-extinguisher-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/carbon-monoxide-alarm-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/humidifier-maintenance-guide/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/ceiling-fan-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/bathroom-exhaust-fan-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/water-softener-maintenance-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/ups-battery-backup-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/wifi-router-maintenance-records/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/water-filter-replacement-guide/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/coffee-maker-maintenance-guide/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/robot-vacuum-maintenance-guide/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/garbage-disposal-maintenance-guide/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/vacuum-cleaner-maintenance-guide/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-inventory-for-insurance/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/air-purifier-maintenance-guide/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/dehumidifier-maintenance-guide/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-inventory-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/photo-home-inventory/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/valuable-item-inventory/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/serial-number-tracker/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-household-subscription-cost-calculator-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-free-home-management-app-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-private-family-organizer-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-home-dashboard-weekly-review-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-master-csv-edit-import/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-maintenance-history-review/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-subscription-renewal-review/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-household-members-responsibilities-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-documents-source-review-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-emergency-information-privacy-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-backup-recovery-checker-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-event-duration-calculator-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-emergency-contact-verification-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-vehicle-document-source-status-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-record-retrieval-drill-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-utility-provider-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-repair-punch-list-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-product-recall-action-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-home-maintenance-schedule-generator-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-backup-recovery-checker/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-free-home-management-app-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-private-family-organizer-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-home-dashboard-weekly-review-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-master-csv-edit-import/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-maintenance-history-review/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-subscription-renewal-review/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-household-members-responsibilities-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-documents-source-review-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-emergency-information-privacy-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-backup-recovery-checker-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-event-duration-calculator-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-emergency-contact-verification-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-vehicle-document-source-status-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-record-retrieval-drill-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-utility-provider-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-repair-punch-list-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-product-recall-action-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-home-maintenance-schedule-generator-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-household-decision-register-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/monthly-home-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/quarterly-home-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/seasonal-home-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/spring-home-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/summer-home-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/fall-home-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/first-time-homeowner-maintenance-guide/</loc>",
      "<loc>https://familyboard.win/guides/apartment-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/condo-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/rental-home-maintenance-log/</loc>",
      "<loc>https://familyboard.win/guides/home-maintenance-records/</loc>",
      "<loc>https://familyboard.win/guides/home-repair-history/</loc>",
      "<loc>https://familyboard.win/guides/winter-home-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/preventive-home-maintenance/</loc>",
      "<loc>https://familyboard.win/guides/maintenance-priorities/</loc>",
      "<loc>https://familyboard.win/guides/refrigerator-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/freezer-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/washing-machine-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/home-maintenance-binder/</loc>",
      "<loc>https://familyboard.win/guides/home-maintenance-budget/</loc>",
      "<loc>https://familyboard.win/guides/home-maintenance-reminders/</loc>",
      "<loc>https://familyboard.win/guides/home-maintenance-after-vacation/</loc>",
      "<loc>https://familyboard.win/guides/move-in-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/annual-home-review/</loc>",
      "<loc>https://familyboard.win/guides/dryer-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/dishwasher-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/oven-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/home-maintenance-delegation/</loc>",
      "<loc>https://familyboard.win/guides/range-hood-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/guides/air-conditioner-maintenance-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-backup-recovery-checker/</loc>",
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
      "<loc>https://familyboard.win/guides/familyboard-emergency-contact-verification-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/emergency-information-sheet/</loc>",
      "<loc>https://familyboard.win/tools/household-power-outage-event-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-power-outage-event-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/power-outage-home-preparedness/</loc>",
      "<loc>https://familyboard.win/tools/household-water-leak-event-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-water-leak-event-log/</loc>",
      "<loc>https://familyboard.win/tools/household-event-duration-calculator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-event-duration-calculator/</loc>",
      "<loc>https://familyboard.win/tools/household-event-source-index-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-event-source-index-log/</loc>",
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
      "<loc>https://familyboard.win/guides/familyboard-repair-punch-list-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/renovation-records/</loc>",
      "<loc>https://familyboard.win/tools/home-repair-closeout-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-repair-closeout-checklist/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/home-improvement-receipts/</loc>",
      "<loc>https://familyboard.win/tools/warranty-claim-evidence-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/warranty-claim-evidence-log/</loc>",
      "<loc>https://familyboard.win/tools/product-recall-action-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/product-recall-action-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-product-recall-action-tutorial/</loc>",
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
      "<loc>https://familyboard.win/guides/familyboard-record-retrieval-drill-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-decision-register/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-decision-register/</loc>",
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
      "<loc>https://familyboard.win/guides/familyboard-utility-provider-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/organize-utility-account-information/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/organize-utility-account-information/</loc>",
      "<loc>https://familyboard.win/tools/household-vehicle-document-source-status-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-vehicle-document-source-status-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-vehicle-document-source-status-tutorial/</loc>",
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
      "<loc>https://familyboard.win/guides/familyboard-household-admin-backup-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-household-admin-backup-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-household-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-household-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-meeting-agenda-action-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-meeting-agenda-action-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-household-meeting-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-pantry-expiry-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-pantry-expiry-review-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-pantry-review-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-pantry-review-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-clothing-care-repair-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-clothing-care-repair-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-clothing-care-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-clothing-care-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-meal-prep-role-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-meal-prep-role-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-meal-prep-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-meal-prep-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-trip-packing-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-trip-packing-handoff-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-trip-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-trip-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-bill-source-status-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-bill-source-status-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-bill-review-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-bill-review-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-share-access-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-share-access-review-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-share-access-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-share-access-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-inventory-photo-capture-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-inventory-photo-capture-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-photo-inventory-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-photo-inventory-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-document-renewal-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-document-renewal-review-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-document-renewal-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-document-renewal-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-internet-incident-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-internet-incident-review-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-internet-incident-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-internet-incident-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-meter-reading-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-meter-reading-review-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-meter-reading-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-meter-reading-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-accessibility-walkthrough-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-accessibility-walkthrough-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-accessibility-walkthrough-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-accessibility-walkthrough-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-recycling-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-recycling-handoff-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-recycling-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-recycling-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-donation-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-donation-handoff-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-donation-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-donation-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-mail-package-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-mail-package-handoff-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-mail-package-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-mail-package-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-plant-care-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-plant-care-handoff-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-plant-care-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-plant-care-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-guest-arrival-prep-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-guest-arrival-prep-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-guest-arrival-prep-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-guest-arrival-prep-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-school-pickup-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-school-pickup-handoff-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-school-pickup-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-school-pickup-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-return-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-return-handoff-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-household-return-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-household-return-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-subscription-cancellation-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-subscription-cancellation-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-subscription-cancellation-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-service-appointment-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-service-appointment-handoff-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-service-appointment-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-service-appointment-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-subscription-cancellation-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-subscription-cancellation-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-school-activity-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-school-activity-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-monthly-review-action-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-monthly-review-action-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-weekly-reset-action-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-weekly-reset-action-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-weekly-reset-action-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-monthly-review-action-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-monthly-review-action-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-monthly-review-action-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-school-activity-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-school-activity-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-school-activity-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-home-access-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-home-access-handoff-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-home-access-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-home-access-handoff-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-schedule-conflict-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-schedule-conflict-review-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-schedule-conflict-review-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-schedule-conflict-review-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-maintenance-priority-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-maintenance-priority-review-log/</loc>",
      "<loc>https://familyboard.win/tools/household-maintenance-delegation-map/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-maintenance-delegation-map/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-maintenance-priority-review-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-maintenance-priority-review-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-service-quote-comparison-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-service-quote-comparison-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-service-quote-comparison-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-service-quote-comparison-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-family-display-mode-setup/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-family-display-mode-setup/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-old-tablet-display-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-old-tablet-display-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-browser-storage-maintenance/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-browser-storage-maintenance/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-browser-storage-cleanup-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-browser-storage-cleanup-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-seasonal-reset-action-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-seasonal-reset-action-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-seasonal-reset-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-seasonal-reset-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-device-retirement-handoff-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-device-retirement-handoff-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-device-retirement-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-device-retirement-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-router-support-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-router-support-review-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-router-support-review-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-router-support-review-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-shopping-list-planner/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-shopping-list-planner/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-shopping-list-planner-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-shopping-list-planner-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-household-meeting-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-household-meeting-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-weekly-reset-action-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-weekly-reset-action-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-school-closure-continuity-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-school-closure-continuity-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-household-account-list-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-household-account-list-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-responsibility-coverage-map/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-responsibility-coverage-map/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-household-responsibility-coverage-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-household-responsibility-coverage-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-replacement-part-source-check-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-replacement-part-source-check-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-replacement-part-source-check-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-replacement-part-source-check-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-consumable-change-history-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-consumable-change-history-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-consumable-change-history-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-consumable-change-history-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-repair-evidence-timeline-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-repair-evidence-timeline-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-repair-evidence-timeline-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-repair-evidence-timeline-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-insurance-claim-timeline-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-insurance-claim-timeline-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-insurance-claim-timeline-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-insurance-claim-timeline-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-building-notice-response-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-building-notice-response-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-building-notice-response-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-building-notice-response-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/rental-repair-request-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/rental-repair-request-log/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-rental-repair-request-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-rental-repair-request-tutorial/</loc>",
      "<loc>https://familyboard.win/tools/household-school-closure-continuity-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/household-school-closure-continuity-log/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-school-closure-continuity-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-power-outage-event-log-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-power-outage-event-log-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/power-outage-recovery-household-records/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-water-leak-event-log-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-water-leak-event-log-tutorial/</loc>",
      "<loc>https://familyboard.win/guides/familyboard-event-source-index-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/familyboard-event-source-index-tutorial/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/household-event-source-check-taiwan/</loc>",
      "<loc>https://familyboard.win/zh-tw/guides/water-leak-photo-evidence-records/</loc>",
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
    path: "/guides/familyboard-home-maintenance-schedule-generator-tutorial/",
    require: [
      "How to Use FamilyBoard's Home Maintenance Schedule Generator",
      "Choose cadence as a review rhythm",
      "not a manufacturer database",
    ],
  },
  {
    path: "/guides/familyboard-warranty-expiration-calculator-tutorial/",
    require: [
      "How to Use FamilyBoard's Warranty Expiration Calculator",
      "Understand the month-end rule",
      "cannot confirm scope, exclusions",
    ],
  },
  {
    path: "/guides/familyboard-household-subscription-cost-calculator-tutorial/",
    require: [
      "How to Use FamilyBoard's Household Subscription Cost Calculator",
      "Read the annualized math",
      "does not become a permanent claim",
    ],
  },
  {
    path: "/guides/familyboard-free-home-management-app-tutorial/",
    require: [
      "A practical first day with the free FamilyBoard home management app",
      "Step 4: export before scaling up",
      "no account wall",
    ],
  },
  {
    path: "/guides/familyboard-private-family-organizer-tutorial/",
    require: [
      "How to use FamilyBoard as a private family organizer",
      "Classify information before entering it",
      "does not prevent a user from copying",
    ],
  },
  {
    path: "/guides/familyboard-home-dashboard-weekly-review-tutorial/",
    require: [
      "A five-minute weekly review using the FamilyBoard home dashboard",
      "Read the four counters in order",
      "does not send push, email or text notifications",
    ],
  },
  {
    path: "/guides/familyboard-master-csv-edit-import/",
    require: [
      "How to edit and import FamilyBoard's master CSV",
      "Start with a JSON safety snapshot",
      "The master CSV is useful",
    ],
  },
  {
    path: "/guides/familyboard-maintenance-history-review/",
    require: [
      "How to review FamilyBoard maintenance history after a task",
      "Complete the action and capture the real event",
      "cannot make a dangerous task suitable",
    ],
  },
  {
    path: "/guides/familyboard-subscription-renewal-review/",
    require: [
      "How to review FamilyBoard subscriptions before a renewal charge",
      "Compare cost with a consistent convention",
      "does not prove that future billing has stopped",
    ],
  },
  {
    path: "/guides/familyboard-household-members-responsibilities-tutorial/",
    require: [
      "How to set up FamilyBoard household members and responsibilities",
      "Start with a responsibility map, not a people list",
      "Members are not an access-control list",
    ],
  },
  {
    path: "/guides/familyboard-documents-source-review-tutorial/",
    require: [
      "How to use FamilyBoard Documents to find the right source",
      "The Documents tab is a map, not a filing cabinet",
      "CSV is useful for deliberate edits",
    ],
  },
  {
    path: "/guides/familyboard-emergency-information-privacy-tutorial/",
    require: [
      "How to use FamilyBoard Emergency information without oversharing",
      "Separate outside contacts from household members",
      "There is no server copy or automatic multi-device sync",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-free-home-management-app-tutorial/",
    require: [
      "FamilyBoard 免費家庭管理 App 怎麼開始",
      "擴充前先匯出並測試備份",
      "沒有帳號牆",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-private-family-organizer-tutorial/",
    require: [
      "FamilyBoard 私人家庭管理 App 怎麼用",
      "先把資料分成三層",
      "不會阻止使用者複製或拍照",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-home-dashboard-weekly-review-tutorial/",
    require: [
      "FamilyBoard Today 儀表板每週怎麼複查",
      "先讀四項數字，再點進來源",
      "不會傳推播、簡訊或 Email",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-master-csv-edit-import/",
    require: [
      "FamilyBoard CSV 家庭資料總表怎麼編修",
      "先留一份不可編修的 JSON 安全快照",
      "把驗證預覽當成正式複查",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-maintenance-history-review/",
    require: [
      "FamilyBoard 維護紀錄完成後怎麼複查",
      "真正執行或看見結果後再按完成",
      "不能把危險工作變成適合 DIY",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-subscription-renewal-review/",
    require: [
      "FamilyBoard 訂閱續約前怎麼複查",
      "用一致方法比較年化費用",
      "都不是未來不扣款的證明",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-household-members-responsibilities-tutorial/",
    require: [
      "FamilyBoard 家庭成員與責任怎麼設定",
      "先列工作，再列成員",
      "Members 是責任標籤，不是存取控制表",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-documents-source-review-tutorial/",
    require: [
      "FamilyBoard 文件怎麼整理",
      "Documents 的任務是畫一張地圖",
      "CSV 方便有意識的批次編修",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-emergency-information-privacy-tutorial/",
    require: [
      "FamilyBoard 緊急資訊怎麼整理又不外洩",
      "先分清楚家庭成員與外部聯絡人",
      "沒有伺服器副本，也沒有自動跨裝置同步",
    ],
  },
  {
    path: "/guides/familyboard-backup-recovery-checker-tutorial/",
    require: [
      "How to use FamilyBoard's backup recovery checker",
      "Export an untouched snapshot",
      "without overwriting working data",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-backup-recovery-checker-tutorial/",
    require: [
      "FamilyBoard 備份還原檢查器怎麼用",
      "先決定最小必要範圍",
      "用副本測試，避免覆蓋工作資料",
    ],
  },
  {
    path: "/guides/familyboard-event-duration-calculator-tutorial/",
    require: [
      "How to use FamilyBoard's household event duration calculator",
      "Define the two moments before opening the tool",
      "does not replace an official outage",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-event-duration-calculator-tutorial/",
    require: [
      "家庭事件經過時間計算器怎麼用",
      "先把問題寫成兩個可觀察的時刻",
      "不會把算術結果升級成業者或政府的正式時數",
    ],
  },
  {
    path: "/guides/familyboard-emergency-contact-verification-tutorial/",
    require: [
      "How to verify emergency contacts without creating another risky contact list",
      "Start with the audience, not a giant master list",
      "without creating a duplicate directory",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-emergency-contact-verification-tutorial/",
    require: [
      "家庭緊急聯絡人怎麼驗證",
      "先決定這一份要給誰看",
      "不要把完整電話和地址複製到共用清單",
    ],
  },
  {
    path: "/guides/familyboard-vehicle-document-source-status-tutorial/",
    require: [
      "How to Use FamilyBoard for Vehicle Document Source Status",
      "Start with a private vehicle code",
      "does not decide whether driving is permitted",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-vehicle-document-source-status-tutorial/",
    require: [
      "汽車行照、保險與召回怎麼整理",
      "先建立不洩漏識別資料的車輛代號",
      "不會查車、登入監理系統",
    ],
  },
  {
    path: "/guides/familyboard-record-retrieval-drill-tutorial/",
    require: [
      "How to Use FamilyBoard for a Record Retrieval Drill",
      "Choose a small scope and a clear receiver",
      "does not certify completeness",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-record-retrieval-drill-tutorial/",
    require: [
      "家庭文件查找與交接演練怎麼做",
      "先選一個小範圍和明確收件人",
      "不要複製密碼、完整地址或私密原件",
    ],
  },
  {
    path: "/guides/familyboard-utility-provider-handoff-tutorial/",
    require: [
      "How to Use FamilyBoard for a Utility Provider Handoff",
      "Define one service and one property boundary",
      "does not identify a provider",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-utility-provider-handoff-tutorial/",
    require: [
      "水電、瓦斯與網路服務怎麼交接",
      "先選一項服務和一個房屋範圍",
      "不會自動找供應商、讀電表",
    ],
  },
  {
    path: "/guides/familyboard-repair-punch-list-tutorial/",
    require: [
      "How to build a home repair punch list that survives the final walkthrough",
      "Freeze the controlling scope first",
      "not a professional inspection",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-repair-punch-list-tutorial/",
    require: [
      "裝修驗收缺失清單怎麼做",
      "先固定目前有效的工程範圍",
      "不把清單當成驗收證明",
    ],
  },
  {
    path: "/guides/familyboard-product-recall-action-tutorial/",
    require: [
      "How to track a product recall without losing the safety instruction",
      "Treat messages as leads and notices as sources",
      "does not search live databases",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-product-recall-action-tutorial/",
    require: [
      "產品召回通知怎麼處理",
      "把轉傳訊息當線索，不當最後來源",
      "不會搜尋即時資料庫",
    ],
  },
  {
    path: "/guides/familyboard-home-maintenance-schedule-generator-tutorial/",
    require: [
      "How to use a home maintenance schedule generator without trusting a made-up interval",
      "Start with an asset inventory, not a blog checklist",
      "not a manufacturer database",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-home-maintenance-schedule-generator-tutorial/",
    require: [
      "家庭保養排程怎麼建立",
      "先盤點實際設備，不要抄網路清單",
      "不是原廠資料庫",
    ],
  },
  {
    path: "/guides/familyboard-household-decision-register-tutorial/",
    require: [
      "How to use FamilyBoard's household decision register without losing the reasoning",
      "Frame one question and one decision boundary",
      "does not vote",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-household-decision-register-tutorial/",
    require: [
      "家庭決策紀錄怎麼做",
      "一次只定義一個問題和一個範圍",
      "不投票、不替商品排名",
    ],
  },
  {
    path: "/zh-tw/guides/monthly-home-maintenance-checklist/",
    require: [
      "每月居家維護清單怎麼做",
      "五分鐘逐房間巡視",
      "不是驗屋",
    ],
  },
  {
    path: "/zh-tw/guides/quarterly-home-maintenance-checklist/",
    require: [
      "每季居家維護清單怎麼做",
      "回看三個月紀錄",
      "不複製通用答案",
    ],
  },
  {
    path: "/zh-tw/guides/seasonal-home-maintenance-checklist/",
    require: [
      "季節居家維護清單怎麼排",
      "梅雨、颱風、酷暑",
      "不是施工或安全指令",
    ],
  },
  {
    path: "/zh-tw/guides/spring-home-maintenance-checklist/",
    require: [
      "春季居家維護清單怎麼做",
      "梅雨前先看水會往哪裡走",
      "不是驗屋、施工或防水保證",
    ],
  },
  {
    path: "/zh-tw/guides/summer-home-maintenance-checklist/",
    require: [
      "夏季居家維護清單怎麼排",
      "建立冷氣與除濕的使用基準",
      "不是電氣檢查",
    ],
  },
  {
    path: "/zh-tw/guides/fall-home-maintenance-checklist/",
    require: [
      "秋季居家維護清單怎麼做",
      "颱風或豪雨後先留下可重現的觀察",
      "不是颱風預測、結構鑑定或暖氣施工指令",
    ],
  },
  {
    path: "/zh-tw/guides/first-time-homeowner-maintenance-guide/",
    require: [
      "第一次買房後要做什麼",
      "先盤點系統，再安排工作",
      "不是驗屋、設備診斷或施工指令",
    ],
  },
  {
    path: "/zh-tw/guides/apartment-maintenance-checklist/",
    require: [
      "租屋族公寓維護清單怎麼做",
      "把日常照護和修繕回報分成兩條線",
      "不是法律意見或自行修繕指令",
    ],
  },
  {
    path: "/zh-tw/guides/condo-maintenance-checklist/",
    require: [
      "大樓公寓維護清單怎麼分",
      "先把兩個範圍建成兩個來源群組",
      "不是建築鑑定、施工或法律意見",
    ],
  },
  {
    path: "/zh-tw/guides/rental-home-maintenance-log/",
    require: [
      "租屋維護紀錄怎麼寫",
      "一筆問題至少留下七個欄位",
      "不是法律意見，也不替租約判定責任",
    ],
  },
  {
    path: "/zh-tw/guides/home-maintenance-records/",
    require: [
      "居家維護紀錄要留什麼",
      "五個欄位先寫對",
      "抽屜裡有一疊發票",
    ],
  },
  {
    path: "/zh-tw/guides/home-repair-history/",
    require: [
      "居家修繕歷史怎麼整理",
      "先寫症狀，再放專業判斷",
      "不是建築鑑定、施工或法律意見",
    ],
  },
  {
    path: "/zh-tw/guides/winter-home-maintenance-checklist/",
    require: [
      "冬季居家維護清單怎麼做",
      "濕冷天先固定一條觀察路線",
      "不是屋頂、瓦斯、電氣、暖氣或結構維修指令",
    ],
  },
  {
    path: "/zh-tw/guides/preventive-home-maintenance/",
    require: [
      "預防性居家維護怎麼做",
      "先問「不做會怎樣」",
      "不是設備診斷、驗屋或安全評分",
    ],
  },
  {
    path: "/zh-tw/guides/maintenance-priorities/",
    require: [
      "居家維護優先順序怎麼排",
      "先分四個層級",
      "不是安全認證，也不是自動替家庭決定",
    ],
  },
  {
    path: "/zh-tw/guides/refrigerator-maintenance-checklist/",
    require: [
      "冰箱保養清單怎麼做",
      "每月查看冷藏與冷凍實際溫度",
      "不是冷媒、電氣或壓縮機維修指令",
    ],
  },
  {
    path: "/zh-tw/guides/freezer-maintenance-checklist/",
    require: [
      "冷凍庫保養清單怎麼做",
      "事先記錄停電時的流程",
      "不是食物安全判定或電氣維修指令",
    ],
  },
  {
    path: "/zh-tw/guides/washing-machine-maintenance-checklist/",
    require: [
      "洗衣機保養清單怎麼做",
      "前開門膠圈要留下乾燥習慣",
      "不是拆機、電氣或水管施工指令",
    ],
  },
  {
    path: "/zh-tw/guides/home-maintenance-binder/",
    require: [
      "居家維護資料夾怎麼整理",
      "來源地圖",
      "不是法律或安全認證",
    ],
  },
  {
    path: "/zh-tw/guides/home-maintenance-budget/",
    require: [
      "居家維護預算怎麼編",
      "把真實支出分清楚",
      "不是法律或財務建議",
    ],
  },
  {
    path: "/zh-tw/guides/home-maintenance-reminders/",
    require: [
      "居家維護提醒怎麼設定",
      "提醒不是完成證據",
      "不會發送推播、電子郵件或簡訊",
    ],
  },
  {
    path: "/zh-tw/guides/home-maintenance-after-vacation/",
    require: [
      "旅行返家後要檢查什麼",
      "五到十分鐘的短版回家檢查",
      "不是完整驗屋、設備診斷或安全認證",
    ],
  },
  {
    path: "/zh-tw/guides/move-in-maintenance-checklist/",
    require: [
      "搬入新家維護清單怎麼做",
      "第一週先認識住家",
      "不是專業檢查、結構評估或法律意見",
    ],
  },
  {
    path: "/zh-tw/guides/annual-home-review/",
    require: [
      "年度家庭總整理怎麼做",
      "把一年資料變成下一年的少量決策",
      "不是投資、債務或稅務建議",
    ],
  },
  {
    path: "/zh-tw/guides/dryer-maintenance-checklist/",
    require: [
      "烘衣機保養清單怎麼做",
      "每次使用後清理濾網",
      "不是消防、電氣或機械安全認證",
    ],
  },
  {
    path: "/zh-tw/guides/dishwasher-maintenance-checklist/",
    require: [
      "洗碗機保養清單怎麼做",
      "先清濾網",
      "FamilyBoard 用來保存型號、來源和歷史",
    ],
  },
  {
    path: "/zh-tw/guides/oven-maintenance-checklist/",
    require: [
      "烤箱保養清單怎麼做",
      "自清潔不是越常用越好",
      "瓦斯警訊更不能等待",
    ],
  },
  {
    path: "/zh-tw/guides/home-maintenance-delegation/",
    require: [
      "家庭維護工作怎麼分工",
      "分配下一步",
      "瓦斯、電氣箱、屋頂、結構與高處工作",
    ],
  },
  {
    path: "/zh-tw/guides/range-hood-maintenance-checklist/",
    require: [
      "抽油煙機保養清單怎麼做",
      "金屬油網和活性碳濾網不是同一件事",
      "油網和活性碳濾網不是同一件事",
    ],
  },
  {
    path: "/zh-tw/guides/air-conditioner-maintenance-checklist/",
    require: [
      "冷氣保養清單怎麼做",
      "濾網、排水與冷媒問題要分清楚",
      "先停止運轉並記下開始時間",
    ],
  },
  {
    path: "/zh-tw/guides/microwave-maintenance-checklist/",
    require: [
      "微波爐保養清單",
      'hreflang="en"',
      "波導罩不是裝飾片",
      "門扣與互鎖是安全部件",
    ],
  },
  {
    path: "/zh-tw/guides/hvac-filter-tracker/",
    require: [
      "冷氣濾網更換紀錄",
      'hreflang="en"',
      "尺寸、厚度與 MERV 是三件事",
      "每月查看不等於每月更換",
    ],
  },
  {
    path: "/zh-tw/guides/computer-electronics-inventory/",
    require: [
      "家庭 3C 財物清冊",
      'hreflang="en"',
      "序號與照片要互相對得上",
      "密碼、恢復碼與 Wi-Fi 設定不要混進清冊",
    ],
  },
  {
    path: "/zh-tw/guides/furniture-inventory/",
    require: [
      "家具清冊",
      'hreflang="en"',
      "寬深高要連同動線一起量",
      "租屋、搬家與轉售要用不同事件",
    ],
  },
  {
    path: "/zh-tw/guides/furnace-maintenance-records/",
    require: [
      "燃氣暖爐維護紀錄",
      'hreflang="en"',
      "一氧化碳警報是緊急事件",
      "把症狀寫成觀察，不寫成診斷",
    ],
  },
  {
    path: "/zh-tw/guides/heat-pump-maintenance-records/",
    require: [
      "熱泵維護紀錄",
      'hreflang="en"',
      "除霜循環要記錄開始、結束和環境",
      "沒有燃燒，不代表沒有安全界線",
    ],
  },
  {
    path: "/zh-tw/guides/water-heater-maintenance-records/",
    require: [
      "熱水器維護紀錄",
      'hreflang="en"',
      "把「查看」和「拆修」分清楚",
      "漏水與汰換規劃是兩條時間線",
    ],
  },
  {
    path: "/zh-tw/guides/dehumidifier-maintenance-records/",
    require: [
      "除濕機保養紀錄",
      'hreflang="en"',
      "把梅雨季的濕度、水箱與異常分開保存",
      "濕度讀數描述環境",
    ],
  },
  {
    path: "/zh-tw/guides/air-purifier-filter-log/",
    require: [
      "空氣清淨機濾網更換紀錄",
      'hreflang="en"',
      "不要只記「換過」",
      "清淨機不是污染源處理器",
    ],
  },
  {
    path: "/zh-tw/guides/solar-panel-maintenance-records/",
    require: [
      "家用太陽能板維護紀錄",
      'hreflang="en"',
      "發電趨勢和高處電氣風險分開",
      "颱風前後先確保人身與區域安全",
    ],
  },
  {
    path: "/zh-tw/guides/smoke-alarm-records/",
    require: [
      "煙霧警報器紀錄",
      'hreflang="en"',
      "每月測試、電池與汰換",
      "不要讓警報失效",
    ],
  },
  {
    path: "/zh-tw/guides/fire-extinguisher-records/",
    require: [
      "家用滅火器紀錄",
      'hreflang="en"',
      "先知道類別與位置",
      "滅火器永遠排在撤離之後",
    ],
  },
  {
    path: "/zh-tw/guides/carbon-monoxide-alarm-records/",
    require: [
      "一氧化碳警報器紀錄",
      'hreflang="en"',
      "警報響起先離開",
      "一氧化碳無色、無味",
    ],
  },
  {
    path: "/zh-tw/guides/humidifier-maintenance-guide/",
    require: [
      "加濕器使用與保養紀錄",
      'hreflang="en"',
      "濕度、水箱與燙傷界線分開處理",
      "不要讓室內相對濕度超過 50%",
    ],
  },
  {
    path: "/zh-tw/guides/ceiling-fan-maintenance-checklist/",
    require: [
      "吊扇保養清單",
      'hreflang="en"',
      "葉片、固定件、異音與高處工作要分開",
      "先讓人離開下方",
    ],
  },
  {
    path: "/zh-tw/guides/bathroom-exhaust-fan-maintenance-checklist/",
    require: [
      "浴室排風扇保養清單",
      'hreflang="en"',
      "把潮濕觀察和風管維修分開",
      "異味、冒煙與漏水要升級",
    ],
  },
  {
    path: "/zh-tw/guides/water-softener-maintenance-records/",
    require: [
      "軟水設備保養紀錄",
      'hreflang="en"',
      "把鹽桶、水質與管線責任分開",
      "水質感受不是檢驗結果",
    ],
  },
  {
    path: "/zh-tw/guides/ups-battery-backup-records/",
    require: [
      "UPS 不斷電系統電池紀錄",
      'hreflang="en"',
      "先記保護誰，再記停電結果",
      "不要用家庭紀錄做負載計算",
    ],
  },
  {
    path: "/zh-tw/guides/wifi-router-maintenance-records/",
    require: [
      "Wi‑Fi 路由器維護紀錄",
      'hreflang="en"',
      "更新韌體，但不要把密碼交給文章",
      "不要把 Wi‑Fi 密碼貼進家庭文章",
    ],
  },
  {
    path: "/zh-tw/guides/water-filter-replacement-guide/",
    require: [
      "家用濾水器更換紀錄",
      'hreflang="en"',
      "型號、流量與水質來源不要混成一句話",
      "規格相似不代表相容",
    ],
  },
  {
    path: "/zh-tw/guides/coffee-maker-maintenance-guide/",
    require: [
      "咖啡機清潔保養紀錄",
      'hreflang="en"',
      "水箱、除垢與奶泡系統分開追蹤",
      "日常清潔和除垢是兩條時間線",
    ],
  },
  {
    path: "/zh-tw/guides/robot-vacuum-maintenance-guide/",
    require: [
      "掃地機器人保養紀錄",
      'hreflang="en"',
      "集塵、濾網、滾刷和地圖資料分開",
      "卡住、過熱與異味要升級",
    ],
  },
  {
    path: "/zh-tw/guides/garbage-disposal-maintenance-guide/",
    require: [
      "廚房食物垃圾處理器保養指南",
      'hreflang="en"',
      "油脂、硬物與長纖維分開判斷",
      "重置按鈕是觀察點，不是修理完成",
    ],
  },
  {
    path: "/zh-tw/guides/vacuum-cleaner-maintenance-guide/",
    require: [
      "吸塵器保養指南",
      'hreflang="en"',
      "把濾網、集塵、軟管、滾刷和皮帶分開追蹤",
      "皮帶常被忽略",
    ],
  },
  {
    path: "/zh-tw/guides/home-inventory-for-insurance/",
    require: [
      "保險用家庭財物清冊怎麼做",
      'hreflang="en"',
      "Triple-I",
      "備份必須離開住家",
    ],
  },
  {
    path: "/zh-tw/guides/air-purifier-maintenance-guide/",
    require: [
      "空氣清淨機保養指南",
      'hreflang="en"',
      "CADR 與面積是選擇線索",
      "臭氧與健康界線",
    ],
  },
  {
    path: "/zh-tw/guides/dehumidifier-maintenance-guide/",
    require: [
      "除濕機保養指南",
      'hreflang="en"',
      "濕度讀值只是局部觀察",
      "水箱與滿水保護",
    ],
  },
  {
    path: "/zh-tw/guides/home-inventory-checklist/",
    require: [
      "家庭財物清冊檢查表",
      'hreflang="en"',
      "兩分鐘測試",
      "真正能完成的清冊",
    ],
  },
  {
    path: "/zh-tw/guides/photo-home-inventory/",
    require: [
      "家庭財物拍照清冊",
      'hreflang="en"',
      "三種照片各自解決不同問題",
      "檢查背景和 EXIF 隱私",
    ],
  },
  {
    path: "/zh-tw/guides/valuable-item-inventory/",
    require: [
      "高價物品清冊",
      'hreflang="en"',
      "購買價不等於目前價值",
      "來源與 provenance",
    ],
  },
  {
    path: "/zh-tw/guides/serial-number-tracker/",
    require: [
      "家電序號追蹤表",
      'hreflang="en"',
      "先分清型號與序號",
      "標籤照是校對證據",
    ],
  },
  {
    path: "/tools/household-backup-recovery-checker/",
    require: [
      "Household Backup Recovery Checker",
      "What the checker validates",
      "It never reads your files",
    ],
  },
  {
    path: "/zh-tw/tools/household-backup-recovery-checker/",
    require: [
      "家庭備份與還原準備檢查器",
      "工具會檢查什麼",
      "不會查看 IndexedDB",
    ],
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
    path: "/tools/household-event-duration-calculator/",
    require: [
      "Free Household Event Duration Calculator",
      'hreflang="zh-TW"',
      "not an official duration",
    ],
  },
  {
    path: "/tools/household-event-source-index-log/",
    require: [
      "Household Event Source Index Log",
      'hreflang="zh-TW"',
      "authenticate a source",
    ],
  },
  {
    path: "/guides/familyboard-bill-review-tutorial/",
    require: [
      "How to Use FamilyBoard for Household Bill Source Reviews",
      'hreflang="zh-TW"',
      "Separate due dates, actions and confirmation",
      "does not read an inbox",
    ],
  },
  {
    path: "/guides/familyboard-internet-incident-tutorial/",
    require: [
      "How to Use FamilyBoard for a Household Internet Incident Review",
      'hreflang="zh-TW"',
      "Recovery is a set of checks, not one light",
      "does not log in",
    ],
  },
  {
    path: "/guides/familyboard-meter-reading-tutorial/",
    require: [
      "How to Use FamilyBoard for Household Meter Reading Reviews",
      'hreflang="zh-TW"',
      "Safety comes before a clearer number",
      "does not read a meter automatically",
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
    path: "/guides/familyboard-record-retrieval-drill-tutorial/",
    require: [
      "FamilyBoard Record Retrieval Drill Tutorial",
      "one bounded question",
      "does not inspect files",
    ],
  },
  {
    path: "/guides/familyboard-emergency-contact-verification-tutorial/",
    require: [
      "How to Verify Emergency Contacts at Home",
      "Start with the audience, not a giant master list",
      "does not make a downloaded file a secure vault",
    ],
  },
  {
    path: "/guides/familyboard-repair-punch-list-tutorial/",
    require: [
      "How to Build a Home Repair Punch List",
      "Freeze the controlling scope first",
      "not a professional inspection or legal acceptance",
    ],
  },
  {
    path: "/guides/familyboard-product-recall-action-tutorial/",
    require: [
      "How to Track a Product Recall Safely",
      "Compare the exact unit privately",
      "does not search live databases",
    ],
  },
  {
    path: "/tools/household-decision-register/",
    require: [
      "Household Decision Register",
      'hreflang="zh-TW"',
      "Eight fields keep a decision honest",
      "does not vote for a family",
    ],
  },
  {
    path: "/zh-tw/tools/household-decision-register/",
    require: [
      "家庭決定登錄工具",
      'hreflang="en"',
      "八欄讓問題不會跳級",
      "不替家庭投票",
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
    path: "/guides/familyboard-utility-provider-handoff-tutorial/",
    require: [
      "FamilyBoard Utility Provider Handoff Tutorial",
      "Separate responsibility from action",
      "does not identify a provider",
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
    path: "/guides/familyboard-vehicle-document-source-status-tutorial/",
    require: [
      "FamilyBoard Vehicle Document Source Tutorial",
      "Build the source map by document type",
      "does not search a vehicle",
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
      "Separate promises, handoffs and actual results",
      "does not authenticate a notice",
    ],
  },
  {
    path: "/tools/rental-security-deposit-move-out-claim-log/",
    require: [
      "Rental Security Deposit Move-Out Claim Log",
      'hreflang="zh-TW"',
      "Use the log as an evidence index, not a legal claim",
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
      "Record decisions and open questions separately",
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
      "future affiliate placement",
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
      "Use the current source",
      "Assign the handoff and recheck after changes",
    ],
  },
  {
    path: "/tools/household-donation-handoff-log/",
    require: [
      "Household Donation Handoff Log",
      'hreflang="zh-TW"',
      "Record condition modestly",
      "Verify the receiving channel",
    ],
  },
  {
    path: "/tools/household-mail-package-handoff-log/",
    require: [
      "Mail and Package Handoff Log",
      'hreflang="zh-TW"',
      "Define the handoff window",
      "Assign custody and close with a result",
    ],
  },
  {
    path: "/tools/household-plant-care-handoff-log/",
    require: [
      "Plant Care Handoff Log",
      'hreflang="zh-TW"',
      "Use a safe reference",
      "Record observations, not diagnoses",
    ],
  },
  {
    path: "/tools/household-guest-arrival-prep-log/",
    require: [
      "Guest Arrival Preparation Log",
      'hreflang="zh-TW"',
      "Use a general scope",
      "Separate preparation from arrival results",
    ],
  },
  {
    path: "/tools/household-school-pickup-handoff-log/",
    require: [
      "School Pickup Handoff Log",
      'hreflang="zh-TW"',
      "Use a safe reference",
      "Separate expectations from observed results",
    ],
  },
  {
    path: "/tools/household-return-handoff-log/",
    require: [
      "Household Return Handoff Log",
      'hreflang="zh-TW"',
      "Use a safe reference",
      "Separate the policy window from the household action",
    ],
  },
  {
    path: "/tools/household-subscription-cancellation-handoff-log/",
    require: [
      "Household Subscription Cancellation Handoff Log",
      'hreflang="zh-TW"',
      "Use a safe reference",
      "Separate a window from an action",
    ],
  },
  {
    path: "/tools/household-service-appointment-handoff-log/",
    require: [
      "Household Service Appointment Handoff Log",
      'hreflang="zh-TW"',
      "Use a safe source map",
      "Separate preparation from arrival",
    ],
  },
  {
    path: "/tools/household-weekly-reset-action-log/",
    require: [
      "Household Weekly Reset Action Log",
      'hreflang="zh-TW"',
      "Review only what needs a decision",
      "Connect decisions to owners and evidence",
    ],
  },
  {
    path: "/tools/household-monthly-review-action-log/",
    require: [
      "Household Monthly Review Action Log",
      'hreflang="zh-TW"',
      "Review the system, not every detail",
      "Keep a next-month checkpoint",
    ],
  },
  {
    path: "/tools/household-school-activity-handoff-log/",
    require: [
      "Household School Activity Handoff Log",
      'hreflang="zh-TW"',
      "Use the school source as authority",
      "Separate preparation from participation",
    ],
  },
  {
    path: "/tools/household-home-access-handoff-log/",
    require: [
      "Household Home Access Handoff Log",
      'hreflang="zh-TW"',
      "Permission comes before the log",
      "Separate arrival, return and reset",
    ],
  },
  {
    path: "/tools/household-schedule-conflict-review-log/",
    require: [
      "Household Schedule Conflict Review Log",
      'hreflang="zh-TW"',
      "Keep original calendars in control",
      "Compare constraints before proposing a change",
    ],
  },
  {
    path: "/tools/household-maintenance-priority-review-log/",
    require: [
      "Household Maintenance Priority Review Log",
      'hreflang="zh-TW"',
      "Observe before you explain",
      "Keep priority as a household decision",
    ],
  },
  {
    path: "/tools/household-service-quote-comparison-log/",
    require: [
      "Household Service Quote Comparison Log",
      'hreflang="zh-TW"',
      "Compare scope before totals",
      "Treat household constraints as questions",
    ],
  },
  {
    path: "/tools/household-maintenance-delegation-map/",
    require: [
      "Free Home Maintenance Delegation Map",
      'hreflang="zh-TW"',
      "Separate outcome ownership from physical work",
      "Use safe source pointers",
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
    path: "/zh-tw/tools/household-event-duration-calculator/",
    require: [
      "家庭事件經過時間計算器",
      'hreflang="en"',
      "經過時間",
      "不代表官方時數",
    ],
  },
  {
    path: "/zh-tw/tools/household-event-source-index-log/",
    require: [
      "家庭事件來源索引紀錄",
      'hreflang="en"',
      "不驗證來源真偽",
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
    path: "/guides/familyboard-household-handoff-tutorial/",
    require: [
      "FamilyBoard Household Handoff Tutorial",
      'hreflang="zh-TW"',
      "Use the task, source and result layers",
      "does not grant access",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-household-handoff-tutorial/",
    require: [
      "FamilyBoard 家庭交接怎麼用",
      'lang="zh-TW"',
      'hreflang="en"',
      "先定義這次交接的時間與範圍",
      "接手者要實際做一次查找",
    ],
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
      'hreflang="en"',
      "從一個小目的開始",
      "決定、任務、結果要用不同詞",
    ],
  },
  {
    path: "/guides/familyboard-household-meeting-tutorial/",
    require: [
      "How to Use FamilyBoard for a Short Household Meeting",
      'hreflang="zh-TW"',
      "Give every topic the same path",
      "does not send invitations",
    ],
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
    path: "/guides/familyboard-pantry-review-tutorial/",
    require: [
      "How to Use FamilyBoard for Pantry Date and Rotation Reviews",
      'hreflang="zh-TW"',
      "Keep rotation separate from safety",
      "does not inspect food",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-pantry-review-tutorial/",
    require: [
      "FamilyBoard 食品櫃怎麼整理",
      'lang="zh-TW"',
      'hreflang="en"',
      "先選一個可以在十五分鐘內完成的範圍",
      "把標示日期和家庭計畫分開",
    ],
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
    path: "/guides/familyboard-clothing-care-tutorial/",
    require: [
      "How to Use FamilyBoard for Seasonal Clothing Care and Repair Handoffs",
      'hreflang="zh-TW"',
      "A handoff that survives a season change",
      "does not interpret a care symbol",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-clothing-care-tutorial/",
    require: [
      "FamilyBoard 換季衣物怎麼整理",
      'lang="zh-TW"',
      'hreflang="en"',
      "先選一個十五分鐘能完成的範圍",
      "觀察與計畫不能混在一起",
    ],
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
    path: "/guides/familyboard-meal-prep-tutorial/",
    require: [
      "FamilyBoard Meal Prep Tutorial",
      'hreflang="zh-TW"',
      "Distinguish plan, action and serving result",
      "does not generate recipes",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-meal-prep-tutorial/",
    require: [
      "FamilyBoard 一週備餐怎麼分工",
      'lang="zh-TW"',
      'hreflang="en"',
      "先選兩個可以完成的餐次",
      "計畫不是行動，行動也不是結果",
    ],
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
    path: "/guides/familyboard-trip-handoff-tutorial/",
    require: [
      "FamilyBoard Trip Handoff Tutorial",
      'hreflang="zh-TW"',
      "Separate plan, action and return result",
      "does not verify travel documents",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-trip-handoff-tutorial/",
    require: [
      "FamilyBoard 旅行交接怎麼做",
      'lang="zh-TW"',
      'hreflang="en"',
      "先選一個清楚的旅行窗口",
      "來源和家庭任務要分開",
    ],
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
      'hreflang="en"',
      "先從兩張近期文件開始",
      "到期日、付款行動與確認結果不同",
    ],
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
    path: "/guides/familyboard-share-access-tutorial/",
    require: [
      "How to Use FamilyBoard for Household Document Sharing Reviews",
      'hreflang="zh-TW"',
      "Separate plan, action and confirmation",
      "does not manage permissions",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-share-access-tutorial/",
    require: [
      "FamilyBoard 家庭文件怎麼安全分享",
      'lang="zh-TW"',
      'hreflang="en"',
      "先選一個真的需要交接的範圍",
      "寄出邀請不等於權限已生效",
    ],
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
    path: "/guides/familyboard-photo-inventory-tutorial/",
    require: [
      "How to Use FamilyBoard for a Photo Home Inventory Review",
      'hreflang="zh-TW"',
      "Make the sequence repeatable",
      "does not open a camera roll",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-photo-inventory-tutorial/",
    require: [
      "FamilyBoard 家庭財物怎麼拍照盤點",
      'lang="zh-TW"',
      'hreflang="en"',
      "先從客廳或一組家電開始",
      "共享前完成隱私檢查",
    ],
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
    path: "/guides/familyboard-document-renewal-tutorial/",
    require: [
      "How to Use FamilyBoard for Household Document Renewal Reviews",
      'hreflang="zh-TW"',
      "Describe observation, not a verdict",
      "does not determine validity",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-document-renewal-tutorial/",
    require: [
      "FamilyBoard 家庭文件要不要更新",
      'lang="zh-TW"',
      'hreflang="en"',
      "先挑一個小範圍",
      "三區測試與備份",
    ],
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
      'hreflang="en"',
      "先建立小範圍與安全代號",
      "恢復後不要只看一個指示燈",
    ],
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
      'hreflang="en"',
      "先選一個情境與安全代號",
      "人工抄錄時先顧安全",
    ],
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
    path: "/guides/familyboard-accessibility-walkthrough-tutorial/",
    require: [
      "FamilyBoard Accessibility Walkthrough Tutorial",
      'hreflang="zh-TW"',
      "Use observation language",
      "does not diagnose a person",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-accessibility-walkthrough-tutorial/",
    require: [
      "FamilyBoard 居家動線怎麼做無障礙走讀",
      'lang="zh-TW"',
      'hreflang="en"',
      "選一條實際會用到的路",
      "讓實際使用者參與重測",
    ],
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
    path: "/guides/familyboard-recycling-handoff-tutorial/",
    require: [
      "FamilyBoard Recycling Handoff Tutorial",
      'hreflang="zh-TW"',
      "Separate rule, preparation and observation",
      "does not classify an item",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-recycling-handoff-tutorial/",
    require: [
      "FamilyBoard 家庭垃圾與資源回收怎麼交接",
      'lang="zh-TW"',
      'hreflang="en"',
      "先選目前適用的公告來源",
      "用家庭會議修正流程",
    ],
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
    path: "/zh-tw/tools/household-mail-package-handoff-log/",
    require: [
      "家庭信件與包裹代收交接工具",
      'hreflang="en"',
      "先限定這次代收時段",
      "預期時段和實際代收要分開",
    ],
  },
  {
    path: "/zh-tw/tools/household-plant-care-handoff-log/",
    require: [
      "家庭植物照護交接工具",
      'hreflang="en"',
      "先建立安全代號",
      "把預期、行動和結果分開",
    ],
  },
  {
    path: "/zh-tw/tools/household-guest-arrival-prep-log/",
    require: [
      "家庭訪客到訪準備工具",
      'hreflang="en"',
      "用安全代號與一般範圍",
      "到訪後一定要複查",
    ],
  },
  {
    path: "/zh-tw/tools/household-school-pickup-handoff-log/",
    require: [
      "家庭接送交接工具",
      'hreflang="en"',
      "先使用家庭安全代號",
      "預期時段不是完成證明",
    ],
  },
  {
    path: "/zh-tw/tools/household-return-handoff-log/",
    require: [
      "家庭退貨交接工具",
      'hreflang="en"',
      "先使用家庭安全代號",
      "把家庭動作和實際結果分開",
    ],
  },
  {
    path: "/zh-tw/tools/household-subscription-cancellation-handoff-log/",
    require: [
      "家庭訂閱取消交接工具",
      'hreflang="en"',
      "先使用家庭安全代號",
      "把提醒、動作與結果分開",
    ],
  },
  {
    path: "/zh-tw/tools/household-service-appointment-handoff-log/",
    require: [
      "家庭服務預約交接工具",
      'hreflang="en"',
      "先用安全來源代號",
      "把準備、到場與完成分開",
    ],
  },
  {
    path: "/zh-tw/tools/household-weekly-reset-action-log/",
    require: [
      "家庭每週複查行動工具",
      'hreflang="en"',
      "先限定本週複查範圍",
      "把決定和執行分開",
    ],
  },
  {
    path: "/zh-tw/tools/household-monthly-review-action-log/",
    require: [
      "家庭每月檢視行動工具",
      'hreflang="en"',
      "先選一個月度範圍",
      "每月檢視不是逐項抄錄",
    ],
  },
  {
    path: "/zh-tw/tools/household-school-activity-handoff-log/",
    require: [
      "家庭學校活動交接工具",
      'hreflang="en"',
      "用安全活動代號開始",
      "同意、準備、提交和參與不是同一件事",
    ],
  },
  {
    path: "/zh-tw/tools/household-home-access-handoff-log/",
    require: [
      "家庭進出與歸還複查工具",
      'hreflang="en"',
      "用安全代號建立複查",
      "授權與觀察不是同一件事",
    ],
  },
  {
    path: "/zh-tw/tools/household-schedule-conflict-review-log/",
    require: [
      "家庭行程衝突複查工具",
      'hreflang="en"',
      "讓衝突可接手但不暴露生活模式",
      "聯盟商品不應影響決定",
    ],
  },
  {
    path: "/zh-tw/tools/household-maintenance-priority-review-log/",
    require: [
      "居家維護優先複查工具",
      'hreflang="en"',
      "先寫觀察，再寫要問的問題",
      "家庭優先順序不是專業安全評分",
    ],
  },
  {
    path: "/zh-tw/tools/household-service-quote-comparison-log/",
    require: [
      "居家服務報價比較工具",
      'hreflang="en"',
      "先比較範圍，再看金額",
      "把家庭限制寫成要問的問題",
    ],
  },
  {
    path: "/zh-tw/tools/household-maintenance-delegation-map/",
    require: [
      "家庭維護分工地圖工具",
      'hreflang="en"',
      "一列只放一個可觀察的下一步",
      "危險工作只分配「找正確來源」",
    ],
  },
  {
    path: "/guides/familyboard-donation-handoff-tutorial/",
    require: [
      "FamilyBoard Donation Handoff Tutorial",
      'hreflang="zh-TW"',
      "Record visible facts, not conclusions",
      "does not appraise an item",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-donation-handoff-tutorial/",
    require: [
      "FamilyBoard 家庭物品捐贈轉贈怎麼交接",
      'lang="zh-TW"',
      'hreflang="en"',
      "第一步：建立不含個資的安全 ID",
      "交接時只給最少必要資訊",
    ],
  },
  {
    path: "/guides/familyboard-mail-package-handoff-tutorial/",
    require: [
      "FamilyBoard Mail and Package Handoff Tutorial",
      'hreflang="zh-TW"',
      "Separate notice, collection and return review",
      "does not read letters",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-mail-package-handoff-tutorial/",
    require: [
      "FamilyBoard 信件與包裹怎麼交接",
      'lang="zh-TW"',
      'hreflang="en"',
      "限定外出與返家時間",
      "返家後做短複查",
    ],
  },
  {
    path: "/guides/familyboard-plant-care-handoff-tutorial/",
    require: [
      "FamilyBoard Plant Care Handoff Tutorial",
      'hreflang="zh-TW"',
      "Describe actions and observations separately",
      "does not diagnose disease",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-plant-care-handoff-tutorial/",
    require: [
      "FamilyBoard 植物照護怎麼交接",
      'lang="zh-TW"',
      'hreflang="en"',
      "限定外出與返家日期",
      "返家後做短複查",
    ],
  },
  {
    path: "/guides/familyboard-guest-arrival-prep-tutorial/",
    require: [
      "FamilyBoard Guest Arrival Preparation Tutorial",
      'hreflang="zh-TW"',
      "Limit the physical scope",
      "does not identify visitors",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-guest-arrival-prep-tutorial/",
    require: [
      "FamilyBoard 訪客到訪怎麼準備",
      'lang="zh-TW"',
      'hreflang="en"',
      "限定可以使用的範圍",
      "到訪後做復原複查",
    ],
  },
  {
    path: "/guides/familyboard-school-pickup-handoff-tutorial/",
    require: [
      "FamilyBoard School Pickup Handoff Tutorial",
      'hreflang="zh-TW"',
      "Separate plan, confirmation and return observation",
      "does not identify a child",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-school-pickup-handoff-tutorial/",
    require: [
      "FamilyBoard 放學接送怎麼交接",
      'lang="zh-TW"',
      'hreflang="en"',
      "分開放學、安親與課後活動",
      "返家後做短複查",
    ],
  },
  {
    path: "/guides/familyboard-household-return-handoff-tutorial/",
    require: [
      "FamilyBoard Household Return Handoff Tutorial",
      'hreflang="zh-TW"',
      "Separate eligibility, packing and dispatch",
      "does not calculate a legal deadline",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-household-return-handoff-tutorial/",
    require: [
      "FamilyBoard 網購退貨怎麼交接",
      'lang="zh-TW"',
      'hreflang="en"',
      "把平台政策放在受控來源",
      "寄回不是退款完成",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-subscription-cancellation-handoff-tutorial/",
    require: [
      "FamilyBoard 訂閱怎麼取消與交接",
      'lang="zh-TW"',
      "把條款和帳單來源留在受控位置",
      "提醒不等於取消生效",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/guides/familyboard-service-appointment-handoff-tutorial/",
    require: [
      "FamilyBoard Service Appointment Handoff Tutorial",
      'hreflang="zh-TW"',
      "Separate preparation, access and arrival",
      "does not contact a provider",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-service-appointment-handoff-tutorial/",
    require: [
      "FamilyBoard 服務預約怎麼交接",
      'lang="zh-TW"',
      'hreflang="en"',
      "把正式來源畫成地圖",
      "提醒、到場、結果",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-weekly-reset-action-tutorial/",
    require: [
      "FamilyBoard 每週家庭整理怎麼做",
      'lang="zh-TW"',
      'hreflang="en"',
      "建立安全來源地圖",
      "把提醒、行動與結果分三層",
    ],
  },
  {
    path: "/guides/familyboard-subscription-cancellation-handoff-tutorial/",
    require: [
      "FamilyBoard Subscription Cancellation Handoff Tutorial",
      'hreflang="zh-TW"',
      "Separate reminder, action and effect",
      "does not sign in",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-subscription-cancellation-handoff-tutorial/",
    require: [
      "FamilyBoard 訂閱怎麼取消與交接",
      'lang="zh-TW"',
      'hreflang="en"',
      "把條款和帳單來源留在受控位置",
      "提醒不等於取消生效",
    ],
  },
  {
    path: "/guides/familyboard-school-activity-handoff-tutorial/",
    require: [
      "FamilyBoard School Activity Handoff Tutorial",
      'hreflang="zh-TW"',
      "Separate decision, preparation and receipt",
      "does not submit a consent form",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-school-activity-handoff-tutorial/",
    require: [
      "FamilyBoard 學校活動怎麼交接",
      'lang="zh-TW"',
      'hreflang="en"',
      "建立通知、表單和結果來源",
      "填完同意表就算學校收到了嗎",
    ],
  },
  {
    path: "/guides/familyboard-monthly-review-action-tutorial/",
    require: [
      "FamilyBoard Monthly Household Review Tutorial",
      'hreflang="zh-TW"',
      "Separate finding, action and improvement",
      "does not audit every record",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-monthly-review-action-tutorial/",
    require: [
      "FamilyBoard 每月家庭檢視怎麼做",
      'lang="zh-TW"',
      'hreflang="en"',
      "建立安全來源地圖",
      "備份找得到就代表一定可以完整還原嗎",
    ],
  },
  {
    path: "/guides/familyboard-weekly-reset-action-tutorial/",
    require: [
      "How to Use FamilyBoard for a Five-Minute Weekly Reset",
      'hreflang="zh-TW"',
      "Sort by decision, not anxiety",
      "does not contact an external service",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-monthly-review-action-tutorial/",
    require: [
      "FamilyBoard 每月家庭檢視怎麼做",
      'lang="zh-TW"',
      "建立安全來源地圖",
      "核對備份與文件索引",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/guides/familyboard-school-activity-handoff-tutorial/",
    require: [
      "FamilyBoard 學校活動怎麼交接",
      'lang="zh-TW"',
      "建立不含學生個資的活動 ID",
      "區分五個容易混淆的事件",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/guides/familyboard-home-access-handoff-tutorial/",
    require: [
      "How to Use FamilyBoard for Home Access Handoffs",
      'hreflang="zh-TW"',
      "Separate permission, scope, observation and result",
      "does not authorize entry",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-home-access-handoff-tutorial/",
    require: [
      "FamilyBoard 家庭進出怎麼交接",
      'lang="zh-TW"',
      'hreflang="en"',
      "先分清楚授權、範圍、觀察與結果",
      "不要把到訪當成服務完成",
    ],
  },
  {
    path: "/guides/familyboard-schedule-conflict-review-tutorial/",
    require: [
      "How to Use FamilyBoard for Schedule Conflict Reviews",
      'hreflang="zh-TW"',
      "Decide whether there is a real conflict",
      "does not read Google Calendar",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-schedule-conflict-review-tutorial/",
    require: [
      "FamilyBoard 家庭行程衝突怎麼處理",
      'lang="zh-TW"',
      'hreflang="en"',
      "先判斷什麼是衝突，什麼只是提醒",
      "把提案、送出與結果分三層",
    ],
  },
  {
    path: "/guides/familyboard-maintenance-priority-review-tutorial/",
    require: [
      "How to Use FamilyBoard for Maintenance Priority Reviews",
      'hreflang="zh-TW"',
      "Write what was observed, not what you think caused it",
      "cannot inspect an appliance",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-maintenance-priority-review-tutorial/",
    require: [
      "FamilyBoard 居家維護優先順序怎麼排",
      'lang="zh-TW"',
      'hreflang="en"',
      "先記錄實際看到的事",
      "不要把家庭摘要變成維修教學",
    ],
  },
  {
    path: "/guides/familyboard-service-quote-comparison-tutorial/",
    require: [
      "How to Use FamilyBoard for Service Quote Comparisons",
      'hreflang="zh-TW"',
      "Compare the same scope before comparing totals",
      "not a provider directory",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-service-quote-comparison-tutorial/",
    require: [
      "FamilyBoard 居家服務報價怎麼比較",
      'lang="zh-TW"',
      'hreflang="en"',
      "逐份寫清楚服務範圍",
      "把差異變成問題",
    ],
  },
  {
    path: "/guides/familyboard-family-display-mode-setup/",
    require: [
      "FamilyBoard Family Display Mode Setup Guide",
      'hreflang="zh-TW"',
      "Decide which device owns the display",
      "Maintain the local record",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-family-display-mode-setup/",
    require: [
      "FamilyBoard 家庭看板設定教學",
      'hreflang="en"',
      "先決定哪台裝置是看板版本",
      "用固定節奏維護本機資料",
    ],
  },
  {
    path: "/guides/familyboard-old-tablet-display-tutorial/",
    require: [
      "How to Use FamilyBoard on an Old Tablet Display",
      'hreflang="zh-TW"',
      "Explain the local-device boundary",
      "does not share that database automatically",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-old-tablet-display-tutorial/",
    require: [
      "FamilyBoard 舊平板家庭看板怎麼用",
      'lang="zh-TW"',
      'hreflang="en"',
      "每週用同一時間核對三張卡片",
      "把重新整理限制告訴家人",
    ],
  },
  {
    path: "/guides/familyboard-browser-storage-maintenance/",
    require: [
      "FamilyBoard Browser Storage Maintenance",
      'hreflang="zh-TW"',
      "Identify the active local copy",
      "Verify, then decide what to remove",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-browser-storage-maintenance/",
    require: [
      "FamilyBoard 瀏覽器資料怎麼清理",
      'hreflang="en"',
      "先辨識正在使用的本機版本",
      "驗證檔案再決定要刪什麼",
    ],
  },
  {
    path: "/guides/familyboard-browser-storage-cleanup-tutorial/",
    require: [
      "How to Clean FamilyBoard Browser Data Safely",
      'hreflang="zh-TW"',
      "Identify the real source profile",
      "does not provide cloud recovery",
    ],
  },
  {
    path: "/guides/familyboard-shopping-list-planner-tutorial/",
    require: [
      "How to Use FamilyBoard as a Household Shopping List Planner",
      'hreflang="zh-TW"',
      "Give each row one purpose",
      "does not scan a refrigerator",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-shopping-list-planner-tutorial/",
    require: [
      "FamilyBoard 採買清單怎麼用",
      'lang="zh-TW"',
      'hreflang="en"',
      "每列只描述一個用途",
      "不會掃描冰箱",
    ],
  },
  {
    path: "/guides/familyboard-seasonal-reset-tutorial/",
    require: [
      "How to Use FamilyBoard for a Seasonal Household Reset",
      'hreflang="zh-TW"',
      "Build a source map before a task list",
      "does not fetch weather",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-seasonal-reset-tutorial/",
    require: [
      "FamilyBoard 換季複查怎麼做",
      'lang="zh-TW"',
      'hreflang="en"',
      "先畫出來源地圖",
      "不讀取天氣",
    ],
  },
  {
    path: "/guides/familyboard-device-retirement-tutorial/",
    require: [
      "What to Do Before Giving Away an Old Phone or Tablet with FamilyBoard",
      'hreflang="zh-TW"',
      "Keep erasure and custody separate",
      "does not operate the device",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-device-retirement-tutorial/",
    require: [
      "舊手機送人前要做什麼",
      'lang="zh-TW"',
      'hreflang="en"',
      "先分辨哪台裝置與哪份資料",
      "不會操作你的裝置",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-browser-storage-cleanup-tutorial/",
    require: [
      "FamilyBoard 瀏覽器資料清理前要做什麼",
      'lang="zh-TW"',
      'hreflang="en"',
      "在副本上做還原演練",
      "驗證新裝置再清理舊資料",
    ],
  },
  {
    path: "/tools/household-seasonal-reset-action-log/",
    require: [
      "Household Seasonal Reset Action Log",
      'hreflang="zh-TW"',
      "Record seasonal conditions",
      "without weather forecasts",
    ],
  },
  {
    path: "/zh-tw/tools/household-seasonal-reset-action-log/",
    require: [
      "家庭換季複查怎麼記",
      'hreflang="en"',
      "用 FamilyBoard 繁中工具記錄換季環境來源",
      "不把清單當成安全檢查或天氣預測",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-seasonal-reset-tutorial/",
    require: [
      "FamilyBoard 換季複查怎麼做",
      'lang="zh-TW"',
      'hreflang="en"',
      "先畫出來源地圖",
      "遇到安全疑問就轉交",
    ],
  },
  {
    path: "/tools/household-device-retirement-handoff-log/",
    require: [
      "Household Device Retirement and Handoff Log",
      'hreflang="zh-TW"',
      "Record protected device matches",
      "without putting passwords",
    ],
  },
  {
    path: "/zh-tw/tools/household-device-retirement-handoff-log/",
    require: [
      "舊手機要怎麼清除再送人",
      'hreflang="en"',
      "用 FamilyBoard 繁中工具整理裝置比對",
      "不輸入密碼或完整序號",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-device-retirement-tutorial/",
    require: [
      "舊手機送人前要做什麼",
      'lang="zh-TW"',
      'hreflang="en"',
      "先分辨哪台裝置與哪份資料",
      "把清除和交接分成兩個核點",
    ],
  },
  {
    path: "/tools/household-router-support-review-log/",
    require: [
      "Household Router Support Review Log",
      'hreflang="zh-TW"',
      "without storing Wi-Fi or admin passwords",
    ],
  },
  {
    path: "/zh-tw/tools/household-router-support-review-log/",
    require: [
      "Wi-Fi 路由器支援期限怎麼查",
      'hreflang="en"',
      "不輸入 Wi-Fi 或管理密碼",
      "不掃描網路、不測速",
    ],
  },
  {
    path: "/guides/familyboard-router-support-review-tutorial/",
    require: [
      "FamilyBoard Router Support Review Tutorial",
      'hreflang="zh-TW"',
      "Record observation and support separately",
      "does not scan a network",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-router-support-review-tutorial/",
    require: [
      "Wi-Fi 路由器多久要換",
      'lang="zh-TW"',
      'hreflang="en"',
      "把每一步留在本機家庭紀錄",
      "不會掃描 Wi-Fi",
    ],
  },
  {
    path: "/tools/household-shopping-list-planner/",
    require: [
      "Household Shopping List Planner",
      'hreflang="zh-TW"',
      "does not scan inventory, compare prices or store payment data",
    ],
  },
  {
    path: "/zh-tw/tools/household-shopping-list-planner/",
    require: [
      "家庭採買清單怎麼做",
      'hreflang="en"',
      "不讀庫存、不比價",
      "不保存地址或付款資料",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-shopping-list-planner-tutorial/",
    require: [
      "FamilyBoard 採買清單怎麼用",
      'lang="zh-TW"',
      'hreflang="en"',
      "從缺貨到到貨",
      "不會掃描冰箱",
    ],
  },
  {
    path: "/tools/household-account-list/",
    require: [
      "Household Account List",
      'hreflang="zh-TW"',
      "FamilyBoard never asks for passwords, verification codes, full identifiers or payment data",
    ],
  },
  {
    path: "/zh-tw/tools/household-account-list/",
    require: [
      "家庭帳戶清單工具：整理服務角色、來源與移轉複查",
      'hreflang="en"',
      "不輸入密碼、驗證碼、完整帳號、地址或付款資料",
      "不會替你判斷能否移轉或停用",
    ],
  },
  {
    path: "/guides/familyboard-household-account-list-tutorial/",
    require: [
      "How to Use FamilyBoard as a Household Account List",
      'hreflang="zh-TW"',
      "Build a dated source map",
      "does not read passwords",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-household-account-list-tutorial/",
    require: [
      "FamilyBoard 家庭帳戶清單怎麼用",
      'lang="zh-TW"',
      'hreflang="en"',
      "服務交接與搬家複查教學",
      "不會讀取密碼",
    ],
  },
  {
    path: "/guides/familyboard-household-responsibility-coverage-tutorial/",
    require: [
      "How to Use FamilyBoard for a Responsibility Coverage Map",
      'hreflang="zh-TW"',
      "Create the source map",
      "does not schedule people",
    ],
  },
  {
    path: "/tools/household-responsibility-coverage-map/",
    require: [
      "Household Responsibility Coverage Map",
      'hreflang="zh-TW"',
      "FamilyBoard does not schedule people, send reminders or decide legal responsibility",
    ],
  },
  {
    path: "/zh-tw/tools/household-responsibility-coverage-map/",
    require: [
      "家庭責任分工地圖工具",
      'hreflang="en"',
      "不排班、不傳送通知、不判定租約或照護責任",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-household-responsibility-coverage-tutorial/",
    require: [
      "FamilyBoard 家庭責任分工地圖怎麼用",
      'lang="zh-TW"',
      'hreflang="en"',
      "主要角色、備援與複查教學",
      "不會排班、不會通知家人",
    ],
  },
  {
    path: "/guides/familyboard-replacement-part-source-check-tutorial/",
    require: [
      "How to Use FamilyBoard to Check Replacement-Part Sources",
      'hreflang="zh-TW"',
      "Record the controlling source and observation",
      "does not read a rating plate",
    ],
  },
  {
    path: "/tools/household-replacement-part-source-check-log/",
    require: [
      "Household Replacement-Part Source Check Log",
      'hreflang="zh-TW"',
      "FamilyBoard does not identify models or guarantee fit",
    ],
  },
  {
    path: "/zh-tw/tools/household-replacement-part-source-check-log/",
    require: [
      "家庭替換零件來源核對工具",
      'hreflang="en"',
      "不辨識型號、不推薦品牌、不保證相容",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-replacement-part-source-check-tutorial/",
    require: [
      "FamilyBoard 設備耗材與替換零件怎麼整理",
      'lang="zh-TW"',
      'hreflang="en"',
      "來源核對 App 教學",
      "不會讀取銘牌、不會搜尋商店",
    ],
  },
  {
    path: "/tools/household-consumable-change-history-log/",
    require: [
      "Household Consumable Change History Log",
      'hreflang="zh-TW"',
      "does not turn one event into another",
    ],
  },
  {
    path: "/guides/familyboard-consumable-change-history-tutorial/",
    require: [
      "How to Use FamilyBoard for Consumable Change History",
      'hreflang="zh-TW"',
      "Keep source, observation and interval apart",
      "does not read equipment",
    ],
  },
  {
    path: "/zh-tw/tools/household-consumable-change-history-log/",
    require: [
      "家庭濾網與耗材更換歷程工具",
      'hreflang="en"',
      "不讀取設備、不判定故障、不決定更換週期",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-consumable-change-history-tutorial/",
    require: [
      "FamilyBoard 濾網多久更換怎麼記",
      'lang="zh-TW"',
      'hreflang="en"',
      "家庭耗材歷程 App 教學",
      "不會讀取設備、不會判定故障",
    ],
  },
  {
    path: "/tools/household-repair-evidence-timeline-log/",
    require: [
      "Household Repair Evidence Timeline Log",
      'hreflang="zh-TW"',
      "does not receive, inspect or store your photo",
    ],
  },
  {
    path: "/guides/familyboard-repair-evidence-timeline-tutorial/",
    require: [
      "How to Use FamilyBoard for a Repair Evidence Timeline",
      'hreflang="zh-TW"',
      "Preserve each transition",
      "does not upload or inspect photos",
    ],
  },
  {
    path: "/zh-tw/tools/household-repair-evidence-timeline-log/",
    require: [
      "家庭修繕證據時間線工具",
      'hreflang="en"',
      "不上傳照片也不判定成因責任",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-repair-evidence-timeline-tutorial/",
    require: [
      "FamilyBoard 修繕前後怎麼留證據",
      'lang="zh-TW"',
      'hreflang="en"',
      "家庭維修時間線 App 教學",
      "不會上傳或讀取照片",
    ],
  },
  {
    path: "/tools/household-insurance-claim-timeline-log/",
    require: [
      "Household Insurance Claim Timeline Log",
      'hreflang="zh-TW"',
      "does not decide coverage, liability, claim value or legal deadlines",
    ],
  },
  {
    path: "/zh-tw/tools/household-insurance-claim-timeline-log/",
    require: [
      "家庭保險理賠事件時間線工具",
      'hreflang="en"',
      "不判定承保、責任、理賠金額或法律期限",
    ],
  },
  {
    path: "/guides/familyboard-insurance-claim-timeline-tutorial/",
    require: [
      "FamilyBoard Insurance Claim Timeline Tutorial",
      'hreflang="zh-TW"',
      "Separate five evidence events",
      "does not file a claim",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-insurance-claim-timeline-tutorial/",
    require: [
      "FamilyBoard 保險理賠事件怎麼整理",
      'lang="zh-TW"',
      'hreflang="en"',
      "家庭事故時間線 App 教學",
      "不會上傳或讀取照片",
    ],
  },
  {
    path: "/tools/household-building-notice-response-log/",
    require: [
      "Household Building Notice Response Log",
      'hreflang="zh-TW"',
      "does not decide legal duties, lease effects, property-manager authority",
    ],
  },
  {
    path: "/guides/familyboard-building-notice-response-tutorial/",
    require: [
      "How to Use FamilyBoard for a Building Notice Response Timeline",
      'hreflang="zh-TW"',
      "Keep reply, permission and result apart",
      "does not grant entry",
    ],
  },
  {
    path: "/zh-tw/tools/household-building-notice-response-log/",
    require: [
      "家庭大樓公告回覆時間線工具",
      'hreflang="en"',
      "不判定法律義務、租約效果、管委會權限",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-building-notice-response-tutorial/",
    require: [
      "FamilyBoard 大樓公告怎麼交接",
      'lang="zh-TW"',
      'hreflang="en"',
      "家庭通知回覆時間線 App 教學",
      "不會判斷公告是否合法",
    ],
  },
  {
    path: "/tools/rental-repair-request-log/",
    require: [
      "Rental Repair Request Log",
      'hreflang="zh-TW"',
      "does not decide lease duties, liability, cost or safety",
    ],
  },
  {
    path: "/guides/familyboard-rental-repair-request-tutorial/",
    require: [
      "How to Use FamilyBoard for a Rental Repair Request Timeline",
      'hreflang="zh-TW"',
      "Describe what is observable",
      "does not contact a landlord",
    ],
  },
  {
    path: "/zh-tw/tools/rental-repair-request-log/",
    require: [
      "租屋修繕請求紀錄工具",
      'hreflang="en"',
      "不判定租約義務、責任、費用、進屋同意或安全",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-rental-repair-request-tutorial/",
    require: [
      "FamilyBoard 租屋修繕怎麼追蹤",
      'lang="zh-TW"',
      'hreflang="en"',
      "通知房東與進屋交接 App 教學",
      "不判斷房東責任",
    ],
  },
  {
    path: "/tools/household-school-closure-continuity-log/",
    require: [
      "Household School Closure Continuity Log",
      'hreflang="zh-TW"',
      "does not store child identities or school login data",
    ],
  },
  {
    path: "/zh-tw/tools/household-school-closure-continuity-log/",
    require: [
      "停課家庭連續運作時間線工具",
      'hreflang="en"',
      "不保存兒童身分或學校登入資料",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-school-closure-continuity-tutorial/",
    require: [
      "FamilyBoard 停課怎麼安排",
      'lang="zh-TW"',
      'hreflang="en"',
      "照顧接送與復課交接 App 教學",
      "不代替學校公告",
    ],
  },
  {
    path: "/guides/familyboard-school-closure-continuity-tutorial/",
    require: [
      "How to Use FamilyBoard During a School Closure or Schedule Change",
      'hreflang="zh-TW"',
      "Classify the source before planning",
      "does not sign in to a school system",
    ],
  },
  {
    path: "/guides/familyboard-power-outage-event-log-tutorial/",
    require: [
      "How to Use FamilyBoard for a Power Outage Record",
      'hreflang="zh-TW"',
      "does not monitor the grid",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-power-outage-event-log-tutorial/",
    require: [
      "FamilyBoard 家庭停電紀錄怎麼用",
      'lang="zh-TW"',
      "復電、設備與來源複查 App 教學",
      "不會推算台電的正式停電時數",
    ],
  },
  {
    path: "/zh-tw/guides/power-outage-recovery-household-records/",
    require: [
      "停電復電後怎麼整理家庭紀錄",
      'lang="zh-TW"',
      "食品、設備與官方來源分開複查",
      "不可碰觸或移動",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/guides/familyboard-water-leak-event-log-tutorial/",
    require: [
      "How to Use FamilyBoard for a Water Leak Record",
      'hreflang="zh-TW"',
      "does not inspect plumbing",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-water-leak-event-log-tutorial/",
    require: [
      "FamilyBoard 家庭漏水紀錄怎麼用",
      'lang="zh-TW"',
      "先安全觀察，再複查修繕",
      "不會檢查管線",
    ],
  },
  {
    path: "/guides/familyboard-event-source-index-tutorial/",
    require: [
      "How to Use FamilyBoard for a Household Event Source Index",
      'hreflang="zh-TW"',
      "does not copy documents",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-event-source-index-tutorial/",
    require: [
      "FamilyBoard 家庭事件來源索引怎麼用",
      'lang="zh-TW"',
      "不複製公告",
    ],
  },
  {
    path: "/zh-tw/guides/household-event-source-check-taiwan/",
    require: [
      "家庭公告與來源怎麼查",
      'lang="zh-TW"',
      "轉傳、截圖與搜尋結果",
    ],
  },
  {
    path: "/zh-tw/guides/water-leak-photo-evidence-records/",
    require: [
      "漏水照片怎麼整理才有用",
      'lang="zh-TW"',
      "安全拍攝與證據索引指南",
      "不要覆寫原始檔",
    ],
    forbid: ['rel="alternate"'],
  },
  {
    path: "/zh-tw/guides/household-admin-backup-person/",
    require: [
      "家庭行政備援者怎麼安排",
      'hreflang="en"',
      "家庭行政備援者的目的",
      "備援者需要的是在指定期間維持家庭運作的必要地圖",
    ],
  },
  {
    path: "/zh-tw/guides/home-contact-list/",
    require: [
      "家庭聯絡人清單怎麼整理",
      'hreflang="en"',
      "來源存在",
      "不會打電話",
    ],
  },
  {
    path: "/guides/familyboard-household-admin-backup-tutorial/",
    require: [
      "FamilyBoard Household Admin Backup Tutorial",
      'hreflang="zh-TW"',
      "Run a retrieval drill before the absence",
      "does not authenticate a helper",
    ],
  },
  {
    path: "/zh-tw/guides/familyboard-household-admin-backup-tutorial/",
    require: [
      "FamilyBoard 家庭行政交接怎麼用",
      'lang="zh-TW"',
      'hreflang="en"',
      "建立一個有期限的情境",
      "輸入先在目前瀏覽器處理",
    ],
  },
  {
    path: "/zh-tw/guides/household-supplies-inventory/",
    require: [
      "家庭耗材清單怎麼做",
      'hreflang="en"',
      "相容依據",
      "不會讀取櫥櫃、相機、購物平台或設備",
    ],
  },
  {
    path: "/zh-tw/guides/household-monthly-review/",
    require: [
      "家庭每月檢視怎麼做",
      'hreflang="en"',
      "未來 30 至 60 天",
      "不會讀取銀行、帳單平台、信箱或雲端檔案",
    ],
  },
  {
    path: "/zh-tw/guides/home-maintenance-calendar/",
    require: [
      "居家保養行事曆怎麼排",
      'hreflang="en"',
      "來源精度",
      "行事曆不是風險評估工具",
    ],
  },
  {
    path: "/zh-tw/guides/household-account-list/",
    require: [
      "家庭帳戶清單怎麼整理",
      'hreflang="en"',
      "誰管理",
      "不會讀取信箱、銀行、購物平台或智慧家庭裝置",
    ],
  },
  {
    path: "/zh-tw/guides/annual-renewal-calendar/",
    require: [
      "家庭年度續期行事曆怎麼做",
      'hreflang="en"',
      "檢視日",
      "不會連線到銀行、保險、政府、會員或服務平台",
    ],
  },
  {
    path: "/zh-tw/guides/household-management-checklist/",
    require: [
      "家庭管理清單怎麼列",
      'hreflang="en"',
      "五個責任區",
      "不會讀取設備、帳戶或文件",
    ],
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
