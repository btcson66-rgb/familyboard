# FamilyBoard 家庭資料總表指南

FamilyBoard 的資料仍只儲存在目前瀏覽器的 IndexedDB。家庭資料總表讓使用者把多種類型的紀錄匯出成一個 UTF-8 CSV，在試算表集中檢視或編輯，再安全匯回同一個家庭。

## 最安全的日常流程

1. 在「設定 → 家庭資料總表」下載目前總表。
2. 用 Excel、Google 試算表或 LibreOffice 編輯；保留 `format`、`recordType`、`id` 與關聯欄位。
3. 選擇 CSV 後先查看預覽、警告與逐列錯誤。
4. 日常更新使用「依穩定 ID 合併」；複製整批資料才使用「新增為新紀錄」。
5. 執行匯入時，FamilyBoard 會先自動下載完整 JSON 安全快照，再以單一 IndexedDB transaction 寫入。
6. 定期另存 JSON 或加密 JSON；它們才包含完整災難復原資料。

## 兩種匯入模式

- **依穩定 ID 合併**：相同 `recordType` + `id` 會更新，新的 ID 會新增。適合把剛匯出的檔案改完再匯回。
- **新增為新紀錄**：每列取得新 ID，檔案內的資產、成員、聯絡人及維護工作的關聯會一併重接。適合複製範本或另一批資料。

匯入前會阻擋未知類型、重複 ID、無效日期／數字／布林值、缺少必要欄位及找不到目標的關聯。檔案上限為 5 MB、5,000 列，避免意外耗盡瀏覽器資源。

## 格式與相容性

- `format` 必須是 `familyboard-master-v1`。
- `recordType` 支援成員、資產、維護工作／紀錄、任務、事件、保固、訂閱、聯絡人、文件、附件與交接設定。
- 家庭描述列供人工辨識，匯入時不會覆寫目前家庭設定。
- 匯出會保護以公式符號開頭的儲存格，降低試算表公式注入風險。
- 不要把 CSV 當成附件檔案備份；附件本體與全部設定請使用 JSON／加密 JSON。

## Browser storage note

The app can request persistent browser storage, but the browser makes the final decision. Keep an external JSON or encrypted JSON backup even when durable storage is granted.
