---
title: "居家照護費用差異教學｜先核對來源，再判斷帳務問題｜FamilyBoard"
description: "用 FamilyBoard 居家照護費用、服務與付款差異紀錄，分開比對服務證據、明細、給付狀態、付款、修正與退款，不直接判定應付金額。"
route: "/zh-tw/guides/familyboard-home-care-billing-discrepancy-tutorial/"
alternateRoute: "/guides/familyboard-home-care-billing-discrepancy-tutorial/"
locale: "zh-TW"
primaryIntent: "協助台灣家庭以相同幣別核對居家照護服務期間、計畫、明細費用、給付、付款與帳戶結果，不把算術差額當成欠款或退款"
primaryKeyword: "居家照護費用差異教學"
cluster: "records-emergency"
pageType: content
indexable: true
depthVerified: true
publishedAt: "2026-08-29"
lastReviewedAt: "2026-08-29"
nextStep: "建立一筆相同幣別的檢查列，先與受保護的計畫、服務及帳戶來源比較，再提出問題。"
related:
  - "/zh-tw/tools/home-care-charge-service-payment-discrepancy-log/"
  - "/zh-tw/tools/home-care-visit-scope-service-result-log/"
  - "/zh-tw/tools/home-care-payment-refund-collection-notice-log/"
  - "/zh-tw/guides/home-care-service-fees-and-billing/"
faq:
  - question: "帳單減去預期金額就是我應該支付的錢嗎？"
    answer: "不是，那只是輸入數字的同幣別算術；真正責任要看目前提供者、契約、給付、付款與帳戶來源。"
  - question: "家庭行事曆可以證明服務沒有發生嗎？"
    answer: "不可以。行事曆只能指出待查事件，應取得負責的實際服務或驗證來源。"
  - question: "ABN 是帳單或拒付通知嗎？"
    answer: "不是。不同文件回答不同問題，應保留來源上的正式名稱與程序。"
  - question: "什麼時候可以說退款完成？"
    answer: "要分別看到負責來源的修正，以及付款或帳戶實際入帳結果。"
contentVersion: 1
---

# 居家照護費用差異教學：先核對來源，再判斷帳務問題

居家照護帳單通常同時牽涉服務計畫或契約、授權、實際服務、提供者明細、付款方處理結果、家庭付款與後續修正。把所有數字壓成一個「餘額」，會看不出到底是服務、費率、給付、部分負擔、付款入帳還是退款仍未確認。免費的[居家照護費用、服務與付款差異紀錄](/zh-tw/tools/home-care-charge-service-payment-discrepancy-log/)可以把來源接起來，但不宣告欠款、有效索賠或應退金額。

## 先選一段服務期間與一種幣別

使用 `HOME-CARE-CHARGE-2026-A` 這類安全代號，限定一段服務期間。在負責系統核對受保護的人與帳戶關係，FamilyBoard 只留下安全期間指標。每個版本只使用一種幣別，工具不會把美元、台幣或其他幣別互相換算，也不能取代付款方或會計來源。

基準日是納入檢查的最早計畫、服務、費用或通知版本；目前複查日是家庭實際比對來源的日期；下一個檢查點只是家庭提醒，不是申訴、催收、付款或訴訟期限。看到現行通知要立即閱讀。

## 把計畫、授權、服務與帳單分開

依序查看：目前計畫或契約要提供什麼、授權或給付決定允許什麼、負責來源記錄實際發生什麼、提供者明細列了什麼、付款方如何處理、家庭付款是否入帳，以及修正或退款是否真的發生。家庭行事曆不是正式訪視紀錄；已付款的理賠也不代表提供者正確登錄家庭付款；提供者帳單更不能自行決定給付。

每一層使用安全代號與版本，缺少的層次保持待確認。若需要訪視細節，可連結[居家照護訪視範圍與服務結果紀錄](/zh-tw/tools/home-care-visit-scope-service-result-log/)，不要把照護內容重複貼到費用列。

## 四個金額欄位只是查核訊號

工具的 `EXP` 是目前來源所說的家庭預期責任，`BILLED` 是提供者明細上的金額，`PAID` 是付款來源實際觀察到的付款，`ADJUSTED` 是已觀察到的退款或折抵。帳單減預期的結果只是同幣別算術，不能證明多收、欠款、資格、損害或可退款。

如果金額不同，保留每個數字來自哪份文件與哪個版本。新明細出現時建立新的觀察，不要覆蓋舊數字。若收到付款、退款或催收通知，改用[居家照護付款、退款與催收通知紀錄](/zh-tw/tools/home-care-payment-refund-collection-notice-log/)保存另一條回應途徑。

## Medicare、Medicaid 與私人安排不能混用規則

Original Medicare 居家健康給付、Medicaid 居家與社區服務、管理式照護、私人照護及私費契約各有來源與條件。ABN、Medicare Summary Notice、Explanation of Benefits、居家健康變更通知、提供者發票與催收信回答不同問題。請保留文件確切名稱，依現行來源指示處理。

不要把「符合條件的服務可能零元」套到私人照護或 Medicaid 列，也不要把一般估價稱作 ABN。若費用問題同時是服務抱怨或給付覆議，建立互相連結但各自獨立的紀錄，因決定者與期限可能不同。FamilyBoard 不判定給付、醫療必要性、法律責任或期限。

## 交接前先保護照護與付款資料

使用安全別名與來源代號；完整帳單、帳號、卡號、診斷、照護筆記、地址、簽名、通知與私人對話應留在受保護位置。分享前確認收件人只需要期間、來源角色、金額欄位與下一步。FamilyBoard 是 local-first，不是帳務檔案庫或付款服務，清除瀏覽器資料前先匯出受保護備份。

每次複查可用三個問題收尾：這個數字由哪份現行文件提出、這項服務由哪個來源確認、最後的帳戶結果是否真的入帳？若其中一題沒有答案，就保留待確認狀態並指定下一個負責人。不要為了讓總額看起來一致而刪掉修正版、拒付、取消或未入帳紀錄；日期與版本正是日後交接時最有用的線索。

未來若出現資料夾或掃描器等聯盟商品，必須在帳務核對與申訴指示之外，不能用購買證明費用、改變給付或保證退款。

**常見問題：**
- Q：帳單減預期就是我欠的錢嗎？
  A：不是，這只是輸入數字的算術，真正結果由現行來源決定。
- Q：行事曆能證明訪視沒發生嗎？
  A：不能，請取得負責的實際服務或驗證來源。
- Q：ABN 是帳單或拒付嗎？
  A：不是，各文件有不同目的與程序。
- Q：退款何時算完成？
  A：負責來源的修正與付款或帳戶實際入帳都要分別觀察到。
