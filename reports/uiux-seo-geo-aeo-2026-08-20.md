# FamilyBoard UI/UX、SEO、GEO、AEO 優化報告

日期：2026-08-20（Asia/Taipei）

## 本次已完成

- 建立完整 `/zh-tw/app/`，涵蓋初始設定、導覽、家庭資產、保養、任務、保固、訂閱、聯絡人、文件、交接、家庭看板、備份與還原。
- 英文與繁中 App 使用相同網域與相同 IndexedDB；切換語言不複製、不上傳、也不清除家庭資料。
- 兩個 App 路徑均維持 `noindex,follow`，排除 sitemap、GA4 與 AdSense。
- 重新設計 App 資訊層級、側邊導覽、狀態摘要、卡片、表單收合、行動版水平導覽、44px 操作目標與鍵盤焦點。
- 生成並整合 FamilyBoard 品牌圖，壓縮為 256 × 256、44 KB 的透明 PNG。
- 英文與繁中首頁新增可直接擷取的「一分鐘快速解答」內容區塊，回答產品定義、資料存放與價格。
- 首頁補上 `Organization` 與 `WebSite` JSON-LD；全站頁面關聯到同一組網站與組織實體；App schema 補上版本、免費狀態、瀏覽器條件與發行者。
- 擴充自動化檢查：繁中 App 語言、Logo、noindex、分析／廣告排除、sitemap 排除與每週 UI/UX/SEO/GEO/AEO 回歸。

## 驗證事實

- TypeScript/Astro：0 errors。
- ESLint：0 warnings。
- Vitest：9 passed。
- Playwright：7 passed、1 個重複的 mobile lifecycle 案例依設計跳過。
- axe：英文／繁中首頁、內容、工具與繁中 App 在桌面和行動版均無 serious/critical finding。
- 建置後稽核：223 HTML routes、219 indexable、0 blocking findings。

## 效果邊界

- 已證明：頁面可建置、可操作、結構化資料可解析、語言與隱私邊界存在、公開內容可被技術性檢索。
- 尚未證明：Google 已建立索引、關鍵字排名提升、自然流量增加、AI Overview／ChatGPT／Perplexity 已引用，或 AdSense 已核准。
- 後續判斷必須使用 GSC、GA4、URL Inspection 與可重現的 AI 引用查核，不以 sitemap、crawler request 或 schema 通過代替成效。

## 官方依據

- Google：生成式 AI 搜尋仍以基礎 SEO、獨特且以人為本的內容為核心，不需要 AEO/GEO 技巧或額外 AI 文字檔：https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google：`WebSite` structured data 是首頁提供站名偏好的重要訊號：https://developers.google.com/search/docs/appearance/site-names
- Google：`Organization` structured data 可協助辨識組織與 Logo：https://developers.google.com/search/docs/appearance/structured-data/organization
- Google：正確 structured data 只提供資格與理解訊號，不保證 rich result 或排名：https://developers.google.com/search/docs/appearance/structured-data/sd-policies

## 下一輪判斷條件

1. 等 GSC 出現第一批有效 impressions/query/page 資料，再優先改善有曝光但 CTR 低的頁面。
2. 每週一比較首頁、繁中首頁、英文 App、繁中 App 的 Lighthouse、axe 與互動回歸。
3. 累積至少 28 天自然數據後，再決定是否擴充第二批繁中公開內容；不以翻譯頁數作 KPI。
4. 以 GSC 的生成式 AI 報表或可重現的實際引用證據判斷 GEO/AEO 成效；沒有資料就記錄「無資料」。
