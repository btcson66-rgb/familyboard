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
    path: "/zh-tw/guides/how-to-track-product-warranties/",
    require: [
      "產品保固追蹤教學",
      'hreflang="en"',
      "收據位置或索引",
      "消費者保護會",
    ],
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
