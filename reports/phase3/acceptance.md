# Phase 3 本機驗收（v1.7.0）

驗收日期：2026-09-24。此文件只記錄本機結果；線上結果須在部署後另行驗證。

- `npm run check`：通過。TypeScript 0 錯誤、Vitest 40/40、英文 506 篇、繁中 516 篇、輸出 HTML 1,026 頁。
- `npm run audit:phase2`、`npm run audit:phase3:static`：通過。indexability policy 與 sitemap 均為 109 個 URL；連往 noindex 內容的禁用連結 0；新頁沒有錯誤的英文 hreflang。
- `npm run e2e`：9 通過、3 個原本限定桌面版的測試於 mobile 專案略過；沒有失敗。涵蓋桌面與手機版全站繁中／SEO／無障礙矩陣，以及兩篇重新開放索引指南存入 IndexedDB 後重載仍可見。
- `npm run evidence:phase3`：七頁均產出 A4 print-media 表格截圖（本目錄 PNG），表格列具 `break-inside: avoid`，PDF buffer 格式檢查通過。
- 既有三個同題頁 `household-storm-readiness-review`、`emergency-supply-inventory-audit`、`household-power-outage-event-log` 與所有 `familyboard-*-tutorial` 維持 noindex；本階段不自行決定 301。

本機測試不能證明 Cloudflare Pages 已發布或 GSC 已收錄；線上技術稽核與讀回另記。
