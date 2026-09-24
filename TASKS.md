# TASKS — familyboard.win

此檔追蹤 2026-09-23 附件 `04-familyboard/TASKS.md` 的 T1–T3 驗收。v1.7 任務書是本次變更的具體範圍；未列為本次 Phase 的季節性題目不冒充已完成。

## T1 — 收斂（v1.6.0–v1.6.2）

- [x] 使用 GSC 與完整內容產生 `prune-plan/`；62 組 MERGE 候選逐筆複核，僅接受同語系、同題的 6 組。
- [x] 已審核的內容保留可訪問；非索引頁以 `noindex,follow` 排除 sitemap，未批量刪檔。
- [x] Cloudflare Pages 正式服務 `familyboard.win`，核准的 301 生效；GitHub Pages 暫留作回退路徑。
- [x] 可索引 URL 109，低於 150 上限；sitemap 與 policy 完全一致。
- [x] Production `tech_audit.py` BLOCKER 0，hreflang 異常 0。
- [x] `/app/` 與 `/zh-tw/app/` 保持 noindex 且不在 sitemap；noindex 內容仍以 HTTP 200 可訪問。
- [x] 可索引頁至非索引內容的 link-policy 違規 0，繁中首頁 35 個不重複站內連結。

## T2 — 繁中季節性與在地內容（v1.7.0）

- [x] 六篇既有繁中在地指南完成官方來源、安全邊界、可列印表格與 App 儲存工作台後重新開放索引。
- [x] 唯一新 URL `/zh-tw/checklists/year-end-cleaning-checklist/` 完成並上線。
- [x] 年終清潔與兩篇重新開放指南的列印／App 保存流程經桌面及手機 E2E 驗證；正式站可訪問。
- [x] 三篇同題重複頁及產品教學頁維持 noindex；沒有跨語系 301。
- [ ] 冷氣換季保養、除濕機梅雨季等原始季節性排程題目：未列入 v1.7 任務書，留待獨立題目與證據審核；不得視為此次交付。

## T3 — 既有高曝光頁（v1.6.3）

- [x] 保固到期工具有 8 個英文可索引內容頁的編輯型內鏈；月底、閏年與跨年日期規則有測試。
- [x] Home inventory 與 moving checklist 各有實際 PDF、CSV 下載檔；PDF 為 A4 一頁，CSV 含 UTF-8 BOM，正式站四個 URL 均 200。
- [ ] `/guides/humidifier-maintenance-guide/` 的差異化內容：原始 T3 清單有列，但 v1.7 Phase 2 未授權直接改英文內容；此頁未在本次修改，另案處理。
- [ ] 排名改善：下次 GSC 判讀日 2026-10-21；在此之前不宣稱收錄或提升。

## v1.7 交付與待辦

- [x] Phase 1 v1.6.2 與 Phase 2 v1.6.3 各自 PR、備份、CI、部署與 production 驗收。
- [x] Phase 3 v1.7.0 PR、備份、CI；首次部署 E2E 失敗，測試專用 hotfix PR 後重新部署並通過 production 驗收。
- [ ] Phase 4 v1.7.1 依賴固定與安全修補：待 PR、CI、部署及 production 複驗完成後勾選。
- [ ] Benson 於 GSC 人工確認 `sitemap-index.xml`、移除舊的 `/sitemap.xml` 提交，並對七個新開放索引頁按配額要求建立索引；不要用「移除網址」處理 noindex。
- [ ] 2026-10-07 後，若正式站連續兩週穩定，再另案評估移除 `deploy.yml` 的 GitHub Pages 部署。
