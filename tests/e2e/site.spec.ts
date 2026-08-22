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
  expect(sitemap).not.toContain("/offline/");
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
  for (const route of [
    "/",
    "/guides/home-maintenance-schedule/",
    "/tools/appliance-age-calculator/",
    "/templates/printable-home-inventory-template/",
    "/pricing/",
    "/zh-tw/",
    "/zh-tw/guides/home-maintenance-schedule/",
    "/zh-tw/features/free-home-management-app/",
    "/zh-tw/tools/warranty-expiration-calculator/",
    "/zh-tw/tools/home-maintenance-schedule-generator/",
    "/zh-tw/tools/household-subscription-cost-calculator/",
    "/zh-tw/tools/emergency-contact-sheet-generator/",
    "/zh-tw/privacy/",
    "/zh-tw/security/",
    "/zh-tw/affiliate-disclosure/",
    "/zh-tw/terms/",
    "/zh-tw/guides/digital-home-inventory-backup/",
    "/zh-tw/guides/home-maintenance-log/",
    "/zh-tw/features/household-handoff/",
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
      route: "/zh-tw/features/household-handoff/",
      alternate: "/features/household-handoff/",
      heading: "家庭交接清單教學：讓別人接得住，也不要一次看見所有資料",
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
  await page.getByRole("button", { name: "家庭資產" }).click();
  await expect(page.getByLabel("資產名稱")).toBeVisible();
  await page.getByRole("button", { name: "交接" }).click();
  await expect(page.getByText("繁中測試家庭 家庭交接摘要")).toBeVisible();
  await page.getByLabel("設定檔名稱").fill("週末保母");
  await page.getByLabel("用途").fill("週末照顧測試");
  await page.getByRole("button", { name: "新增紀錄" }).click();
  await expect(
    page.getByRole("option", { name: "週末保母 — 週末照顧測試" }),
  ).toBeAttached();
  await expect(page.getByLabel("設定檔名稱")).toHaveValue("");
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
  await context.setOffline(false);
});
