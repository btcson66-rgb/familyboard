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
      "<loc>https://familyboard.win/zh-tw/tools/vacation-shutdown-checklist-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/house-sitter-instruction-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/pet-sitter-instruction-generator/</loc>",
      "<loc>https://familyboard.win/zh-tw/tools/home-handoff-summary-generator/</loc>",
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
