import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  type ReactElement,
  type ReactNode,
} from "react";

export type AppLocale = "en" | "zh-TW";

const AppLocaleContext = createContext<AppLocale>("en");

const zhTw: Record<string, string> = {
  "Add record": "新增紀錄",
  "Saving…": "儲存中…",
  None: "無",
  "FamilyBoard local household dashboard": "FamilyBoard 本機家庭管理中心",
  "Opening your local household database…": "正在開啟這台裝置上的家庭資料庫…",
  "Opening local data…": "正在開啟本機資料…",
  "Local storage could not be opened": "無法開啟本機儲存空間",
  Today: "今日總覽",
  "What needs attention across this household.": "集中查看這個家庭目前需要處理的事項。",
  "Household members": "家庭成員",
  "People who can own household responsibilities.": "可負責家庭工作與交接事項的成員。",
  Assets: "家庭資產",
  "Appliances, vehicles and household systems worth remembering.": "整理值得保留型號、保固與維修紀錄的設備。",
  Maintenance: "保養維護",
  "Recurring work with a completion history.": "保存週期性工作、到期日與完成歷程。",
  "Tasks & calendar": "任務與行事曆",
  "One-off responsibilities and lightweight household events.": "管理單次責任與簡易家庭事件。",
  Warranties: "保固",
  "Coverage dates, receipt references and review points.": "整理保固期間、收據位置與複查時間。",
  Subscriptions: "訂閱",
  "Recurring household obligations and renewal dates.": "追蹤固定支出、負責人與續約日期。",
  "Emergency contacts": "緊急聯絡人",
  "Operational contacts and instructions—kept local.": "把重要聯絡方式與操作說明留在本機。",
  "Document index": "文件索引",
  "References to where household records live.": "記住重要家庭文件實際存放的位置。",
  "Household handoff": "家庭交接",
  "A readable briefing for the next person.": "產生下一位接手者看得懂的家庭摘要。",
  "Family display": "家庭看板",
  "A large, low-sensitivity household overview.": "適合共用螢幕的低敏感資訊總覽。",
  "Settings & backups": "設定與備份",
  "Data durability, exports and destructive actions.": "管理資料保存、匯出、還原與清除。",
  Members: "成員",
  Tasks: "任務",
  Emergency: "緊急聯絡",
  Documents: "文件",
  Handoff: "交接",
  Display: "看板",
  Settings: "設定",
  "App sections": "App 功能區",
  Home: "回到總覽",
  "Local data · no app analytics": "本機資料 · App 不載入分析追蹤",
  "Saved on this device": "資料儲存在這台裝置",
  "No account": "不需帳號",
  "Offline-ready": "可離線使用",
  "Saved locally on this device.": "已儲存在這台裝置。",
  "The browser storage quota is full. Export a backup, free space safely and try again.":
    "瀏覽器儲存空間已滿。請先匯出備份、安全釋放空間後再試一次。",
  "The record could not be saved. Your previous local data was left in place.":
    "無法儲存這筆紀錄；原有本機資料未被更動。",
  "Import them as local document-index notes or leave them in this browser for later.":
    "可以匯入本機文件索引，或先保留在這個瀏覽器中。",
  "Import saved results": "匯入已儲存結果",
  "Saved tool result": "已儲存的工具結果",
  "Stored in this FamilyBoard database": "儲存在這個 FamilyBoard 本機資料庫",
  "Add an asset": "新增家庭資產",
  "Asset name": "資產名稱",
  Category: "分類",
  Appliance: "家電",
  Location: "位置",
  Brand: "品牌",
  Model: "型號",
  "Serial number": "序號",
  "Shared display never shows this value.": "共用家庭看板不會顯示這項資料。",
  "Purchase date": "購買日期",
  Notes: "備註",
  active: "使用中",
  watch: "需留意",
  archived: "已封存",
  "No location": "未填位置",
  "Brand/model not recorded": "尚未記錄品牌或型號",
  "Clear watch": "取消留意",
  Watch: "標記留意",
  Archive: "封存",
  "Add maintenance": "新增保養工作",
  "Maintenance task": "保養工作",
  "Related asset": "關聯資產",
  "Home area": "居家區域",
  Owner: "負責人",
  "Next due": "下次到期日",
  "Repeat months after completion": "完成後間隔月數",
  Priority: "優先順序",
  normal: "一般",
  high: "高",
  low: "低",
  "Instructions source": "操作說明來源",
  "Manual, official support page or provider.": "例如原廠手冊、官方支援頁或服務商。",
  "Whole household": "全屋",
  Unassigned: "未指派",
  Source: "來源：",
  "Add manufacturer/provider source": "請補上原廠或服務商來源",
  Complete: "標記完成",
  "Add a warranty": "新增保固",
  Asset: "資產",
  Provider: "提供者",
  Starts: "開始日期",
  Ends: "截止日期",
  "Receipt location/reference": "收據位置或索引",
  "Terms/manual reference": "條款或手冊索引",
  "Unlinked warranty": "未連結資產的保固",
  Expired: "已過期",
  "Provider not recorded": "尚未記錄提供者",
  Receipt: "收據：",
  "Not recorded": "尚未記錄",
  "Written terms control exact coverage.": "實際保障範圍以書面條款為準。",
  "Add a subscription": "新增訂閱",
  Service: "服務名稱",
  Household: "家庭",
  Cost: "費用",
  Currency: "幣別",
  "Billing frequency": "計費週期",
  monthly: "每月",
  annual: "每年",
  weekly: "每週",
  quarterly: "每季",
  "Next renewal": "下次續約日",
  "Review days before": "提前幾天複查",
  "Management URL": "管理網址",
  "Non-sensitive payment note": "非敏感付款備註",
  "Never store card numbers or passwords.": "請勿儲存卡號或密碼。",
  cancelled: "已取消",
  Reactivate: "重新啟用",
  "Mark cancelled": "標記為已取消",
  "Annualized active total:": "有效訂閱年化總額：",
  "Add a contact": "新增聯絡人",
  "Person or service": "人員或服務單位",
  "Household contact": "家庭聯絡人",
  Phone: "電話",
  Email: "電子郵件",
  "Operational notes": "操作備註",
  Visibility: "顯示範圍",
  false: "可分享",
  true: "敏感",
  "Sensitive contacts are excluded from shared display and handoff by default.":
    "敏感聯絡人預設不會出現在共用看板與交接摘要。",
  Private: "私密",
  Shareable: "可分享",
  "FamilyBoard organizes contacts; it does not replace current official local emergency guidance.":
    "FamilyBoard 只協助整理聯絡資料，不能取代所在地最新的官方緊急指引。",
  "Add a document reference": "新增文件索引",
  "Record name": "紀錄名稱",
  "Home record": "家庭文件",
  "Where the original is stored": "原始文件存放位置",
  "Review date": "複查日期",
  "No asset link": "未連結資產",
  "This v1 stores document references, not uploaded document files. Keep durable originals in storage you control.":
    "目前版本只保存文件索引，不會上傳文件檔案。請把耐久副本保存在自己控制的儲存空間。",
  "No account needed": "不需建立帳號",
  "Set up your home without creating an account.": "不用註冊帳號，立即建立家庭工作區。",
  "Your core household records stay in this browser. Start with one home and the people who share it. Export a backup after adding anything important.":
    "核心家庭紀錄會保留在這個瀏覽器。先建立一個家庭與共同成員；加入重要資料後，請立即匯出備份。",
  "Home name": "家庭名稱",
  "Our home": "我們的家",
  "Optional, separated by commas": "選填，請用逗號分隔",
  "Browser data can be cleared and devices can fail. FamilyBoard will remind you to export backups.":
    "瀏覽器資料可能被清除，裝置也可能故障；FamilyBoard 會提醒你匯出備份。",
  "Creating local home…": "正在建立本機家庭…",
  "Create local household": "建立本機家庭",
  "Restore an existing household": "還原既有家庭資料",
  "Choose a FamilyBoard JSON backup. Validation happens before any records are written.":
    "選擇 FamilyBoard JSON 備份；系統會先驗證，再寫入任何紀錄。",
  "Password for encrypted backup": "加密備份密碼",
  "Backup file": "備份檔案",
  "Choose file": "選擇檔案",
  "No file selected": "尚未選擇檔案",
  "Restore failed. No data was changed.": "還原失敗，資料未被更動。",
  "Add a household member": "新增家庭成員",
  "Member name": "成員姓名",
  "Household role": "家庭角色",
  "Household member": "家庭成員",
  Archived: "已封存",
  Active: "使用中",
  "Overdue tasks": "逾期任務",
  "Maintenance due soon": "近期保養",
  "Active assets": "使用中資產",
  "Active subscriptions": "有效訂閱",
  "Next responsibilities": "接下來的責任",
  "View tasks": "查看任務",
  "Nothing needs your attention right now. Add a responsibility when you have something worth remembering.":
    "目前沒有需要處理的事項。遇到值得記住的工作時，再新增一筆責任。",
  "Maintenance due": "待處理保養",
  "View maintenance": "查看保養",
  "No maintenance is due in the next seven days.": "未來七天沒有到期的保養工作。",
  "Add a task": "新增任務",
  Responsibility: "家庭責任",
  "Due date": "到期日",
  "Repeat note": "重複週期備註",
  "Example: weekly. Completing does not invent the next date.":
    "例如：每週。完成任務後，系統不會自行推算下一個日期。",
  "Add a calendar event": "新增行事曆事件",
  Event: "事件名稱",
  "Calendar event": "行事曆事件",
  "One-off": "單次",
  "Create a sharing profile": "建立分享設定檔",
  "Profile name": "設定檔名稱",
  Purpose: "用途",
  "Include open tasks": "包含未完成任務",
  "Include maintenance": "包含保養工作",
  "Include non-sensitive contacts": "包含非敏感聯絡人",
  "Include document locations": "包含文件位置",
  yes: "是",
  no: "否",
  "Profile note": "設定檔備註",
  "household handoff": "家庭交接摘要",
  "Default privacy profile ·": "預設隱私設定檔 ·",
  Generated: "產生時間",
  "· Confirm dates before sharing.": "· 分享前請再次確認日期。",
  "Nothing currently open.": "目前沒有未完成事項。",
  Responsibilities: "家庭責任",
  "Shareable contacts": "可分享聯絡人",
  "Document locations": "文件位置",
  "Location not recorded": "尚未記錄位置",
  "Intentionally excluded": "刻意排除的內容",
  "Sensitive contacts, serial numbers, document details, subscription costs, private notes and backup contents.":
    "敏感聯絡人、序號、文件細節、訂閱費用、私密備註與備份內容。",
  "Print handoff": "列印交接摘要",
  "Shared view · refreshes every minute": "共用畫面 · 每分鐘重新整理",
  "Household tasks": "家庭任務",
  Anyone: "任何成員",
  "Today’s events": "今日事件",
  "No household events today.": "今天沒有家庭事件。",
  "Coming up": "即將到期",
  "Private records and sensitive contacts are hidden from this display.":
    "這個畫面不會顯示私密紀錄與敏感聯絡人。",
  "Storage health": "儲存狀態",
  "App version:": "App 版本：",
  "Database schema:": "資料庫架構版本：",
  "Storage used:": "已用儲存空間：",
  "browser-managed quota": "由瀏覽器管理的額度",
  "Persistent storage:": "持久儲存：",
  Granted: "已授權",
  "Not guaranteed by this browser": "此瀏覽器未保證",
  "Request durable storage": "要求持久儲存",
  "No recovery backup yet. Export JSON before adding irreplaceable records.":
    "尚未建立復原備份。新增無法取代的重要紀錄前，請先匯出 JSON。",
  "Records:": "紀錄總數：",
  "Last backup:": "上次備份：",
  "No successful export recorded": "尚無成功匯出紀錄",
  "Last restore:": "上次還原：",
  "Export backup": "匯出備份",
  "Plain JSON is portable but readable. Encrypted export uses PBKDF2-SHA-256 and AES-256-GCM in your browser.":
    "一般 JSON 容易移轉，但內容可直接讀取；加密匯出會在瀏覽器內使用 PBKDF2-SHA-256 與 AES-256-GCM。",
  "Encryption password": "加密密碼",
  "Export JSON": "匯出 JSON",
  "Export encrypted": "匯出加密備份",
  "A forgotten encrypted-backup password cannot be recovered.": "加密備份密碼一旦忘記便無法復原。",
  "Household master table": "家庭資料總表",
  "Export one UTF-8 CSV for spreadsheet review and bulk editing. Import it back only after the preview is clean. CSV does not replace the complete JSON backup.":
    "匯出一份 UTF-8 CSV，方便用試算表檢查與批次編輯；預覽沒有錯誤後才能匯回。CSV 不能取代完整 JSON 備份。",
  "Export master CSV": "匯出家庭總表 CSV",
  "Download blank template": "下載空白範本",
  "Supported record types: member, asset, maintenance_task, maintenance_event, task, event, warranty, subscription, contact, document, attachment and handoff_profile. Keep the format and recordType columns unchanged.":
    "支援的紀錄類型：成員、資產、保養工作、保養完成紀錄、任務、事件、保固、訂閱、聯絡人、文件、附件索引與交接設定。請勿更改 format 與 recordType 欄位。",
  "Import master CSV for preview": "選擇家庭總表 CSV 並預覽",
  "Import preview": "匯入預覽",
  "Import behavior": "匯入方式",
  "Merge and update by stable record ID": "依穩定紀錄 ID 合併並更新",
  "Add copies with new record IDs": "用新紀錄 ID 加入副本",
  "Fix these rows before importing:": "匯入前請修正以下資料列：",
  "Download safety snapshot and import": "下載安全快照並匯入",
  "Restore backup": "還原備份",
  Mode: "模式",
  "Merge by record ID": "依紀錄 ID 合併",
  "Replace after safety snapshot": "先建立安全快照再取代",
  "Password for encrypted file": "加密檔案密碼",
  "Validate backup without restoring": "只驗證備份，不進行還原",
  "Choose backup": "選擇要還原的備份",
  "Reset local household": "清除本機家庭資料",
  "This removes all FamilyBoard data in this browser. Export a backup first.":
    "這會移除目前瀏覽器中的所有 FamilyBoard 資料。請先匯出備份。",
  "Delete local data": "刪除本機資料",
  "Type “": "輸入「",
  "” to confirm": "」以確認",
  "Backup exported. Store it somewhere durable and protected.":
    "備份已匯出。請保存至可靠且受保護的位置。",
  "Backup failed.": "備份失敗。",
  "Backup validation failed.": "備份驗證失敗。",
  "Restore failed. No changes were applied.": "還原失敗，未套用任何變更。",
  "Persistent storage is not supported by this browser.": "此瀏覽器不支援持久儲存要求。",
  "Persistent storage request failed.": "持久儲存要求失敗。",
  "Master export failed.": "家庭總表匯出失敗。",
  "Master CSV could not be read.": "無法讀取家庭總表 CSV。",
  "Fix every CSV validation error before importing.": "請先修正所有 CSV 驗證錯誤再匯入。",
  "Master import failed. Existing data was left in place.": "家庭總表匯入失敗；原有資料未被更動。",
};

function translateExact(value: string, locale: AppLocale) {
  if (locale !== "zh-TW") return value;
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match) return value;
  const [, leading, core, trailing] = match;
  const exact = zhTw[core];
  if (exact) return `${leading}${exact}${trailing}`;

  const patterns: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
    [/^Due (.+)$/, (item) => `到期日 ${item[1]}`],
    [/^Ends (.+)$/, (item) => `截止日 ${item[1]}`],
    [/^purchased (.+)$/, (item) => `購買日 ${item[1]}`],
    [/^(\d+) completions?$/, (item) => `完成 ${item[1]} 次`],
    [/^Completed (.+)$/, (item) => `完成於 ${item[1]}`],
    [/^Profile: (.+) · $/, (item) => `設定檔：${item[1]} · `],
    [/^Generated (.+) · Confirm dates before sharing\.$/, (item) => `產生時間 ${item[1]} · 分享前請再次確認日期。`],
    [/^Backup restored in (merge|replace) mode\.$/, (item) => `備份已用${item[1] === "merge" ? "合併" : "取代"}模式還原。`],
    [/^Type “(.+)” to confirm$/, (item) => `輸入「${item[1]}」以確認`],
    [/^(.+) household handoff$/, (item) => `${item[1]} 家庭交接摘要`],
    [/^(\d+) saved tool results?$/, (item) => `${item[1]} 筆已儲存的工具結果`],
    [/^Your last recovery backup is (\d+) days old\. Export a fresh JSON backup\.$/, (item) => `上次復原備份是 ${item[1]} 天前。請匯出新的 JSON 備份。`],
    [/^(.+) · (\d+) rows · (\d+) new · (\d+) updates · (\d+) household descriptor skipped$/, (item) => `${item[1]} · ${item[2]} 列 · 新增 ${item[3]} 筆 · 更新 ${item[4]} 筆 · 略過 ${item[5]} 筆家庭描述`],
    [/^Unknown column “(.+)” was ignored\.$/, (item) => `已忽略未知欄位「${item[1]}」。`],
    [/^Row (\d+): (.+)$/, (item) => `第 ${item[1]} 列：${item[2]}`],
  ];
  for (const [pattern, replacement] of patterns) {
    const found = core.match(pattern);
    if (found) return `${leading}${replacement(found)}${trailing}`;
  }
  return value;
}

function localizeNode(node: ReactNode, locale: AppLocale): ReactNode {
  if (typeof node === "string") return translateExact(node, locale);
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<Record<string, unknown>>;
  const nextProps: Record<string, unknown> = {};
  for (const attribute of ["aria-label", "placeholder", "title"] as const) {
    const current = element.props[attribute];
    if (typeof current === "string") nextProps[attribute] = translateExact(current, locale);
  }
  if (element.props.children !== undefined) {
    nextProps.children = Children.map(element.props.children as ReactNode, (child) =>
      localizeNode(child, locale),
    );
  }
  return cloneElement(element, nextProps);
}

export function AppLocaleProvider({
  locale,
  children,
}: {
  locale: AppLocale;
  children: ReactNode;
}) {
  return (
    <AppLocaleContext.Provider value={locale}>
      {children}
    </AppLocaleContext.Provider>
  );
}

export function Localize({ children }: { children: ReactNode }) {
  const locale = useContext(AppLocaleContext);
  return <>{Children.map(children, (child) => localizeNode(child, locale))}</>;
}

export function useAppLocale() {
  const locale = useContext(AppLocaleContext);
  return {
    locale,
    date(value: string) {
      return value
        ? new Intl.DateTimeFormat(locale === "zh-TW" ? "zh-TW" : "en", {
            dateStyle: "medium",
          }).format(new Date(`${value}T12:00:00`))
        : locale === "zh-TW"
          ? "未填日期"
          : "No date";
    },
    due(value: string) {
      if (!value) return locale === "zh-TW" ? "未填日期" : "No date";
      if (value < new Date().toISOString().slice(0, 10))
        return locale === "zh-TW" ? "已逾期" : "Overdue";
      if (value === new Date().toISOString().slice(0, 10))
        return locale === "zh-TW" ? "今天到期" : "Due today";
      const formatted = new Intl.DateTimeFormat(locale === "zh-TW" ? "zh-TW" : "en", {
        dateStyle: "medium",
      }).format(new Date(`${value}T12:00:00`));
      return locale === "zh-TW" ? `到期日 ${formatted}` : `Due ${formatted}`;
    },
    dateTime(value: string | Date) {
      return new Date(value).toLocaleString(locale === "zh-TW" ? "zh-TW" : "en");
    },
  };
}
