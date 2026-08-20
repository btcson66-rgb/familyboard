import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
    "/zh-tw/tools/warranty-expiration-calculator/",
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

  const sitemap = await (await page.request.get("/sitemap-0.xml")).text();
  expect(sitemap).toContain("https://familyboard.win/zh-tw/");
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/guides/home-maintenance-schedule/",
  );
  expect(sitemap).toContain(
    "https://familyboard.win/zh-tw/tools/warranty-expiration-calculator/",
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
  await page.getByRole("button", { name: "設定" }).click();
  await expect(page.getByRole("heading", { name: "匯出備份" })).toBeVisible();
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
  await page.getByLabel("Backup file").setInputFiles(backupPath!);
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  await page.reload();
  await expect(page.getByText("E2E Home").first()).toBeVisible();

  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  await context.setOffline(false);
});
