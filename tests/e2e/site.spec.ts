import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

test("public SEO, keyboard and five production tools work", async ({
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
  test.setTimeout(90_000);
  for (const route of [
    "/",
    "/guides/home-maintenance-schedule/",
    "/tools/appliance-age-calculator/",
    "/tools/move-out-condition-record-generator/",
    "/tools/home-emergency-drill-record-generator/",
    "/templates/printable-home-inventory-template/",
    "/pricing/",
    "/zh-tw/",
    "/zh-tw/guides/home-maintenance-schedule/",
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
    "/zh-tw/guides/digital-home-inventory-backup/",
    "/zh-tw/guides/move-out-home-records/",
    "/zh-tw/guides/home-evacuation-information/",
    "/zh-tw/guides/home-maintenance-log/",
    "/zh-tw/guides/appliance-replacement-planning/",
    "/zh-tw/guides/room-by-room-home-inventory/",
    "/zh-tw/guides/cleaning-schedule/",
    "/zh-tw/features/household-handoff/",
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

test("Traditional Chinese pages are indexable, paired and functional", async ({
  page,
}) => {
  test.setTimeout(90_000);
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

  for (const localized of [
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
      route: "/zh-tw/features/household-handoff/",
      alternate: "/features/household-handoff/",
      heading: "家庭交接清單教學：讓別人接得住，也不要一次看見所有資料",
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
      heading: "產品保固追蹤教學：把保證書、收據與設備期限連在一起",
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
      route: "/zh-tw/features/free-home-management-app/",
      alternate: "/features/free-home-management-app/",
      heading: "FamilyBoard 使用教學：先建立一套會持續使用的家庭管理流程",
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
