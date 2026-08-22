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
      "<loc>https://familyboard.win/zh-tw/privacy/</loc>",
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
      "週、月、季與年繳費用",
    ],
  },
  {
    path: "/zh-tw/tools/emergency-contact-sheet-generator/",
    require: [
      "家庭緊急聯絡表產生器",
      'hreflang="en"',
      "警察報案：110",
      "119 報案要領",
    ],
  },
  {
    path: "/zh-tw/privacy/",
    require: [
      "FamilyBoard 隱私權政策",
      'hreflang="en"',
      "家庭資料不會傳到 FamilyBoard",
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
    path: "/zh-tw/features/free-home-management-app/",
    require: [
      "FamilyBoard 使用教學",
      'hreflang="en"',
      "家庭資料總表 CSV",
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
