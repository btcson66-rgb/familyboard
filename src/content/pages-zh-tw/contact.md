---
title: "聯絡 FamilyBoard｜錯誤回報、內容更正、無障礙與資安通報"
description: "用繁體中文回報 FamilyBoard 功能錯誤、內容更正、無障礙問題、隱私疑慮或安全漏洞；包含需提供與不可公開的資料。"
route: "/zh-tw/contact/"
alternateRoute: "/contact/"
locale: "zh-TW"
primaryIntent: "聯絡 FamilyBoard 並安全回報問題"
primaryKeyword: "聯絡 FamilyBoard"
cluster: "support"
pageType: "support"
indexable: true
publishedAt: "2026-08-22"
lastReviewedAt: "2026-08-22"
related:
  - "/zh-tw/privacy/"
  - "/zh-tw/features/free-home-management-app/"
  - "/zh-tw/"
contentVersion: 1
faq:
  - question: "沒有 GitHub 帳號也可以查看 FamilyBoard 的公開回報嗎？"
    answer: "可以查看既有公開 issue，但目前要新增 issue 仍需要 GitHub 帳號。FamilyBoard 現階段沒有公開客服信箱或即時客服。"
  - question: "回報 App 問題時可以附上備份檔嗎？"
    answer: "不可以。備份可能包含完整家庭資料；請只提供瀏覽器與裝置類型、App 版本、操作步驟、錯誤文字及不含敏感資料的畫面。"
  - question: "疑似安全漏洞應該貼在公開 issue 嗎？"
    answer: "不應該。請使用 GitHub Security Advisories 的私人漏洞回報入口，不要在公開 issue 揭露攻擊步驟、金鑰或敏感重現資料。"
---

# 聯絡 FamilyBoard：先選對回報管道，也保護自己的家庭資料

FamilyBoard 目前使用公開 GitHub repository 處理一般產品、內容與無障礙問題；疑似安全漏洞則使用 GitHub Security Advisories 的私人通報入口。兩種管道用途不同，請不要把安全漏洞或家庭敏感資料貼進公開 issue。

FamilyBoard 現階段沒有即時客服、電話客服或公開客服信箱，也不承諾固定回覆時間。若問題涉及人身安全、火災、漏電、瓦斯、醫療或正在發生的緊急狀況，請直接聯絡所在地的正式緊急服務或合格專業人員，不要等待網站回覆。

## 功能錯誤、無障礙問題與一般建議

請前往[新增 FamilyBoard 公開 issue](https://github.com/btcson66-rgb/familyboard/issues/new)，在標題先說明問題類型，例如「繁中 App：備份驗證後文字被截斷」或「行動版：鍵盤無法操作某個按鈕」。內文建議包含：

- 發生問題的公開頁網址，或 App 的功能區名稱；
- 你原本預期會發生什麼，以及實際結果；
- 可重複的操作步驟，越短越好；
- 瀏覽器名稱與版本、作業系統、桌機或手機；
- 畫面上的完整錯誤文字；
- 是否能在重新整理後再次出現。

截圖可以協助理解畫面問題，但請先遮住家庭名稱、成員姓名、電話、電子郵件、序號、訂閱費用、文件位置與任何私人備註。不要為了回報而建立包含真實個資的示範紀錄；使用「測試冰箱」「家庭成員 A」等虛構資料即可。

## 內容錯誤與台灣在地資訊更正

如發現日期、法規、官方連結、設備安全說明或 App 功能描述錯誤，請在公開 issue 提供：

1. 頁面網址與有問題的段落標題；
2. 哪一句需要修正，以及原因；
3. 能直接支持修正的可靠來源；
4. 若資料具有地區限制，請說明適用國家、縣市、住宅類型或設備型號。

涉及台灣法規或公共安全時，優先提供主管機關、全國法規資料庫、原廠手冊或正式標準來源。FamilyBoard 不會只因一篇未署名部落格或商品頁寫了某個數字，就把它改成全體使用者通用的指引。

## 隱私問題

若問題是公開網站的 GA4、Cookie、聯盟連結、本機 App 資料界線或隱私政策文字，請先閱讀[繁中隱私權政策](/zh-tw/privacy/)。一般政策更正可以使用公開 issue，但請只描述公開頁面或程式行為。

不要附上 JSON 備份、加密備份、家庭總表 CSV、真實聯絡人清單、發票、保證書、合約或任何帳號資料。FamilyBoard 沒有必要取得這些內容才能了解一般隱私問題。

## 安全漏洞請使用私人通報

若你發現可能讓其他使用者受影響的程式漏洞、繞過安全邊界的方法、惡意程式注入、供應鏈問題或其他需要避免公開細節的風險，請使用[GitHub 私人漏洞回報](https://github.com/btcson66-rgb/familyboard/security/advisories/new)。

私人通報建議包含受影響版本、最小重現步驟、預期影響與可行的緩解方式。不要測試不屬於你的資料、帳號或裝置，也不要在公開 issue、社群貼文或搜尋結果中先公布可被直接利用的細節。

## 回報前可以先做的四項檢查

1. 確認網址是 `https://familyboard.win/`，不是第三方轉載或舊的測試站。
2. 查看[繁中 App 使用教學](/zh-tw/features/free-home-management-app/)，確認功能目前是否真的支援。
3. 若問題只發生在某個瀏覽器，記下版本與是否使用無痕模式；不要直接清除網站資料。
4. 在任何重設、清除或還原動作前，先匯出一份新的 JSON 備份。

## 回覆與處理界線

公開 issue 可以讓其他使用者看見進度與解法，但 GitHub 需要帳號才能新增回報。FamilyBoard 會依問題嚴重度、可重現性與影響範圍處理，不提供保證時效，也不透過 issue 判定保固、法律、保險、醫療或緊急處置責任。

## 常見問題

### 沒有 GitHub 帳號也可以查看 FamilyBoard 的公開回報嗎？

可以查看既有公開 issue，但目前要新增 issue 仍需要 GitHub 帳號。FamilyBoard 現階段沒有公開客服信箱或即時客服。

### 回報 App 問題時可以附上備份檔嗎？

不可以。備份可能包含完整家庭資料；請只提供瀏覽器與裝置類型、App 版本、操作步驟、錯誤文字及不含敏感資料的畫面。

### 疑似安全漏洞應該貼在公開 issue 嗎？

不應該。請使用 GitHub Security Advisories 的私人漏洞回報入口，不要在公開 issue 揭露攻擊步驟、金鑰或敏感重現資料。

**下一步：** 一般功能或內容問題請開啟[公開 issue](https://github.com/btcson66-rgb/familyboard/issues/new)；疑似漏洞請改用[私人安全通報](https://github.com/btcson66-rgb/familyboard/security/advisories/new)。
