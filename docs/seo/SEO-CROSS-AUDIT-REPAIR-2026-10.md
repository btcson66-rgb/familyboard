# SEO-CROSS-AUDIT-AND-REPAIR-2026-10 — familyboard

**RESULT:**

PARTIAL：local verified；正式交付／部署狀態見下列欄位，未證實 search outcome。

**SITE:**

familyboard.win

**BING BASELINE:**

外部連結不足；Known 119 / Indexed 69 / Warning 42 / Excluded 8；沒有 current metadata recommendation。（使用者任務書提供歷史報表，沒有假設console已更新）

**AHREFS BASELINE:**

short description 36。（同上）

**CURRENT PRODUCTION BASELINE:**

HTML/anchor+sitemap collection 112 content URLs；home-anchor reachable 112（raw CF endpoint計數可能含1）；unique sitemap 109；fetch errors 0。

**GSC BASELINE:**

2026-08-18–2026-10-04，3 clicks / 1061 impressions；CTR 0.28%。ZIP SHA-256 a22ccf21ee00e053aefc89445b9a15d1de10c47df45fd47931f54f8d6b22143b。query/page/country/device 為獨立 aggregate，不虛构 joint query-page。

**CONFIRMED ISSUES:**

既有 annual subscription cost owner 精簡 title，摘要描述 price+frequency 輸入與 yearly/monthly/five-year 輸出。保留三個 10-02 active targets，不改私密 App、noindex、PWA、routing 或 analytics。Windows checkout CSV CRLF 造成 deterministic gate 失敗，已以原 git blob bytes 恢復，不修改下載內容或演算法。

**STALE ISSUES:**

工具歷史數量與 current production 不一致的部分保留 STALE_CRAWL / DIFFERENT_THRESHOLD；未訪問console設定不標為已修。

**INTENTIONAL CONDITIONS:**

109 indexable owners + 私密 apps/offline noindex；public crawler只發現112 URL，repo postbuild另驗1026 HTML routes、913 content noindex；crawler reachability≠所有build routes。

**ROOT CAUSES:**

多數長度warning是門檻差異；annual conversion snippet可更精確。

**FIXES:**

既有 annual subscription cost owner 精簡 title，摘要描述 price+frequency 輸入與 yearly/monthly/five-year 輸出。保留三個 10-02 active targets，不改私密 App、noindex、PWA、routing 或 analytics。Windows checkout CSV CRLF 造成 deterministic gate 失敗，已以原 git blob bytes 恢復，不修改下載內容或演算法。

**FILES CHANGED:**

.gitignore、docs/launch-content-master.md、reports/content-quality.md、reports/indexing/INDEXING-RECOVERY-REPORT.md、reports/indexing/boilerplate-ratio.csv、reports/indexing/contextual-inlinks.csv、reports/indexing/gsc-after-deploy.md、reports/indexing/gsc-current-indexing.csv、reports/indexing/priority-indexing-urls.csv、reports/indexing/production-qa.csv、reports/indexing/url-set-diff.csv、reports/url-inventory.csv、src/content/pages/161-tools--annual-subscription-cost-calculator.md、src/generated/search-index.json；新增 crawler/compare/fixture、CSV、本報告及GSC evidence（raw response gzip僅本機）。

**SITEMAP BEFORE / AFTER:**

109 / 109（production baseline / local output）。Invalid canonical/indexable200 members after=0；active empty errors after=0。

**INDEXABLE BEFORE / AFTER:**

109 / 109 canonical eligibility rows；主表以sitemap authority和compare為準，非Google索引數。

**NOINDEX BEFORE / AFTER:**

3 / 3；source政策沒有重開或移除。

**4XX BEFORE / AFTER:**

0 / 0 content routes；CF email endpoint原raw404為INFO，source mailto+Cloudflare transformation，保留raw證據。

**5XX BEFORE / AFTER:**

0 / 0。

**BROKEN LINKS BEFORE / AFTER:**

0 / 0 content edges。

**SHORT DESCRIPTION BEFORE / AFTER:**

48 / 47（en120/zh70 advisory；不為字數改無關內容）。

**DUPLICATE DESCRIPTION BEFORE / AFTER:**

0 / 0。

**TITLE ISSUES BEFORE / AFTER:**

length signals 57 / 56；missing 0 / 0；duplicate 0 / 0。

**HREFLANG:**

after indexable groups anomalies=0；locale/canonical/robots比對維持；noindex private groups不當成索引缺陷。

**INDEXNOW:**

現有管線保持；本輪沒有manual submit。

**INTERNAL LINKS:**

after broken=0 / redirect edges=0；orphan-like=0為discovery signal，未批量footer補鏈。FunnyTools所有重要indexable有2+distinct來源（代表contextual需人讀）。

**BUILD:**

PASS (local logs)

**TESTS:**

lint/typecheck/unit40/40/content/similarity/build/prune/indexing/link/monitor906/906/phase2/phase3 PASS；完整E2E14 tests含1000+route axe sweep執行中，最終結果另見測試狀態。

**SEO CRAWL:**

見 evidence/optimization-regression.json 或 evidence/regression.json；local comparison

**PRODUCTION READBACK:**

基線已取得；modified output未部署，NOT_VERIFIED_AFTER_DEPLOY。

**COMMIT:**

待最後測試後commit

**PR:**

待最後測試後Draft PR

**DEPLOYMENT:**

NOT_DEPLOYED；RoomFeng/WorthCalc須依公司規範由老闆審核PR。

**REMAINING RISKS:**

GSC匯出為三個月aggregate且最後日期10-04；沒有comparable final query-page分群與因果證據。rawCF edge與HTML content分開。RoomFeng crawl config未登入Ahrefs驗證。既有實驗歸因限制保留。

**WHAT BING SHOULD SEE NEXT:**

成功部署後重新crawl可取得修復後有效sitemap/摘要；告知變更是submission signal，不承諾warning即時消失。

**WHAT AHREFS SHOULD SEE NEXT:**

依Domain/Prefix範圍重新crawl，確認工具專案scope與crawl limits；intentional noindex不要求清零。

**MANUAL ACTION REQUIRED:**

Review concrete Draft PR；RoomFeng key已設定，部署後再驗證publickey/changed submit。

資料來源：使用者任務書、四份GSC ZIP、保存之production response與source。技術參考：[IndexNow protocol](https://www.indexnow.org/documentation)、[Google snippet guidance](https://developers.google.com/search/docs/appearance/snippet)。
