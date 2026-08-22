---
title: "FamilyBoard 隱私權政策｜家庭資料不上傳、Cookie 與網站分析說明"
description: "了解 FamilyBoard 公開網站與私密 App 的資料界線、GA4 與 Cookie、瀏覽器本機儲存、備份、聯盟連結及未來廣告原則。"
route: "/zh-tw/privacy/"
alternateRoute: "/privacy/"
locale: "zh-TW"
primaryIntent: "確認 FamilyBoard 如何處理個人資料與家庭紀錄"
primaryKeyword: "FamilyBoard 隱私權政策"
cluster: "support"
pageType: "support"
indexable: true
publishedAt: "2026-08-22"
lastReviewedAt: "2026-08-22"
related:
  - "/zh-tw/contact/"
  - "/zh-tw/features/free-home-management-app/"
  - "/zh-tw/"
contentVersion: 1
faq:
  - question: "FamilyBoard 會把我在 App 輸入的家庭資料上傳嗎？"
    answer: "不會。家庭成員、資產、保養、保固、訂閱、聯絡人、文件索引與交接資料都寫入目前瀏覽器的 IndexedDB；FamilyBoard 沒有接收這些紀錄的帳號或家庭資料伺服器。"
  - question: "公開網站有使用 Cookie 或分析工具嗎？"
    answer: "有。公開指南與工具頁使用 Google Analytics 4 了解頁面瀏覽與工具完成情形；私密的 /app/ 與 /zh-tw/app/ 不載入 GA4 或廣告程式碼。"
  - question: "清除瀏覽器資料後，FamilyBoard 可以幫我找回紀錄嗎？"
    answer: "不可以。FamilyBoard 沒有伺服器副本或帳號復原機制；清除網站資料、遺失裝置或更換瀏覽器前，必須先匯出 JSON 或加密 JSON 備份。"
  - question: "FamilyBoard 現在會在 App 裡顯示廣告或聯盟商品嗎？"
    answer: "不會。私密 App、家庭交接畫面與列印表單不放廣告或聯盟連結；公開內容頁目前也未啟用廣告，未來若啟用會維持清楚標示與內容分界。"
---

# FamilyBoard 隱私權政策：公開網站與私密 App 是兩個不同空間

**先說結論：** 你在 FamilyBoard App 輸入的核心家庭紀錄會留在目前瀏覽器，不會傳到 FamilyBoard 的伺服器。可被搜尋引擎找到的公開指南、計算器與範本則使用一般網站分析，以了解哪些內容真的有人使用。兩者採用不同的資料處理方式，本頁分開說明。

本政策描述的是 FamilyBoard **現在實際運作的狀態**，不是未來可能增加的功能。最後複查日期為 2026 年 8 月 22 日；若資料流程有實質改變，會先更新本頁與網站變更紀錄。

## 你在私密 App 輸入的資料不會傳到 FamilyBoard

`/app/` 與 `/zh-tw/app/` 是本機優先的家庭工作區。下列紀錄會寫入目前瀏覽器的 IndexedDB：

- 家庭名稱、成員與責任分工；
- 家電、設備、型號、序號與購買日期；
- 保養工作、完成歷程與維修備註；
- 保固、訂閱、家庭任務與行事曆事件；
- 緊急聯絡人、文件存放位置與交接設定；
- 備份狀態，以及匯入公開工具結果所需的本機資料。

FamilyBoard 目前沒有登入系統、家庭雲端資料庫或接收這些紀錄的 API。營運者看不到你輸入的內容，也無法替你從伺服器恢復資料。英文與繁中 App 共用同一個瀏覽器資料庫；切換語言不會建立第二份雲端副本。

這個設計降低集中保存家庭敏感資料的風險，但也把備份責任交還給使用者。清除網站資料、使用無痕模式、瀏覽器移除儲存空間、裝置故障或換一個瀏覽器，都可能讓本機紀錄消失。

## 備份、加密備份與家庭資料總表

設定頁可以匯出完整 JSON，也可以在瀏覽器內用密碼產生加密 JSON。加密過程在裝置上完成；FamilyBoard 不會收到密碼，也沒有可以重設密碼的金鑰保管服務。忘記加密備份密碼時，檔案無法由 FamilyBoard 代為解開。

家庭資料總表 CSV 是供試算表檢查與批次編輯的工作格式，不是完整災難復原備份。匯入 CSV 前，App 會先顯示驗證結果並下載安全快照。處理重要資料時，仍應保留一份獨立的 JSON 備份，並把備份存到你控制且有適當保護的位置。

## 公開網站會測量哪些資料？

FamilyBoard 的公開頁面使用 Google Analytics 4（GA4），因此會處理一般網站分析資訊，例如瀏覽頁面、裝置與瀏覽器類型、來源網站，以及由 IP 位址推導的大致地區。網站設定已要求 IP 匿名化並關閉 Google Signals。

除了基本頁面瀏覽，FamilyBoard 只允許兩種自訂事件，而且不帶入你在工具表單輸入的值：

1. `tool_complete`：只記錄完成了哪一個公開工具；
2. `affiliate_outbound`：未來點擊清楚標示的聯盟連結時，只記錄商品類別。

公開計算器與產生器仍在你的瀏覽器內運算。日期、名稱、費用、聯絡資料或自訂文字不會被放進上述分析事件。分析程式也會拒絕在 `/app/` 與 `/zh-tw/app/` 路徑執行。

## Cookie、Google 與第三方服務

GA4 會在公開網站使用 Cookie 或類似技術來區分造訪與工作階段。Google 如何處理使用其服務之網站傳送的資訊，可查看 Google 的[合作網站資料使用說明](https://policies.google.com/technologies/partner-sites?hl=zh-TW)。你也可以透過瀏覽器設定封鎖或清除 Cookie。

封鎖公開網站的分析 Cookie 不代表私密 App 就能永久保存資料；App 紀錄與分析 Cookie 是不同的瀏覽器儲存機制。若清除的是整個網站資料，IndexedDB 內的家庭紀錄也可能一起被刪除，因此操作前請先匯出備份。

## AdSense 與聯盟連結的界線

FamilyBoard 已登記 Google 發布商識別碼 `pub-7052036786750044`，但截至本頁複查日期，網站設定仍未開啟廣告顯示。未來若啟用 Google 廣告，Google 與合作夥伴可能使用 Cookie 或類似技術提供及衡量廣告；實際選項與個人化控制以 Google 當時提供的介面為準。

部分公開教學未來可能出現清楚標示的聯盟商品類別。聯盟連結會使用 `rel="sponsored nofollow noopener"`，點擊後由第三方零售商自己的隱私政策與交易條款管理。商品推薦、廣告與分析永遠不會放進私密 App、家庭交接畫面或列印專用表單。

## 離線快取與文件索引

FamilyBoard 的 Service Worker 會在裝置上快取 App 外殼與已造訪頁面，讓部分功能在離線時仍可開啟。快取同樣屬於瀏覽器本機資料，清除網站資料時可能被移除。

文件功能目前保存的是「原始文件放在哪裡」的索引與中繼資料，不會把保證書、合約、收據或身分文件上傳到 FamilyBoard。請把原始檔案保存在你選擇並控制的儲存位置。

## 目前沒有帳號同步

FamilyBoard 不會把家庭紀錄同步到其他裝置。若未來加入任何雲端同步、帳號或伺服器資料功能，必須在推出前重新檢視技術邊界、政策文字與使用者選擇，不能用今天的本機優先說明涵蓋不同的資料流程。

## 隱私問題、更正與聯絡方式

如需回報隱私問題或要求更正本頁，請使用[繁中聯絡頁](/zh-tw/contact/)。請不要在公開 GitHub issue 貼上家庭成員資料、聯絡方式、序號、文件內容、備份檔、帳號資訊或其他敏感資料；說明頁面網址、問題類型與可公開的重現步驟即可。

## 常見問題

### FamilyBoard 會把我在 App 輸入的家庭資料上傳嗎？

不會。家庭成員、資產、保養、保固、訂閱、聯絡人、文件索引與交接資料都寫入目前瀏覽器的 IndexedDB；FamilyBoard 沒有接收這些紀錄的帳號或家庭資料伺服器。

### 公開網站有使用 Cookie 或分析工具嗎？

有。公開指南與工具頁使用 Google Analytics 4 了解頁面瀏覽與工具完成情形；私密的 `/app/` 與 `/zh-tw/app/` 不載入 GA4 或廣告程式碼。

### 清除瀏覽器資料後，FamilyBoard 可以幫我找回紀錄嗎？

不可以。FamilyBoard 沒有伺服器副本或帳號復原機制；清除網站資料、遺失裝置或更換瀏覽器前，必須先匯出 JSON 或加密 JSON 備份。

### FamilyBoard 現在會在 App 裡顯示廣告或聯盟商品嗎？

不會。私密 App、家庭交接畫面與列印表單不放廣告或聯盟連結；公開內容頁目前也未啟用廣告，未來若啟用會維持清楚標示與內容分界。

**下一步：** 在輸入重要家庭紀錄前，先閱讀[繁中 App 使用教學](/zh-tw/features/free-home-management-app/)，並在完成第一批資料後立即匯出備份。
