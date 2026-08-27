import { useMemo, useState } from "react";

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea";
  help?: string;
  options?: string[];
  value?: string;
};
type Definition = {
  intro: string;
  fields: Field[];
  run: (values: Record<string, string>) => string;
};
type Locale = "en" | "zh-TW";

const date = (value: string) => {
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
};
const strictIsoDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = date(value);
  if (!parsed) return null;
  const normalized = [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getDate()).padStart(2, "0"),
  ].join("-");
  return normalized === value ? parsed : null;
};
const strictTime = (value: string) =>
  /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : null;
const localDateTime = (dateValue: string, timeValue: string) => {
  const validDate = strictIsoDate(dateValue);
  const validTime = strictTime(timeValue);
  if (!validDate || !validTime) return null;
  const [hours, minutes] = validTime.split(":").map(Number);
  const result = new Date(validDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
};
const fmt = (value: Date) =>
  new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(value);
const addMonths = (value: Date, months: number) => {
  const result = new Date(value);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  result.setDate(
    Math.min(
      day,
      new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate(),
    ),
  );
  return result;
};
const yearsMonths = (from: Date, to = new Date()) => {
  let months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    to.getMonth() -
    from.getMonth();
  if (to.getDate() < from.getDate()) months -= 1;
  return `${Math.max(0, Math.floor(months / 12))} years, ${Math.max(0, months % 12)} months`;
};
const list = (value: string) =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
const uniqueList = (value: string) => {
  const seen = new Set<string>();
  return list(value).filter((item) => {
    const key = item.toLocaleLowerCase("zh-TW");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );
const moneyFor = (value: number, currency: string) =>
  `${({ TWD: "NT$", USD: "US$", JPY: "JP¥" } as Record<string, string>)[currency] || `${currency} `}${new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(value)}`;
const lines = (heading: string, items: string[]) =>
  `${heading}\n${items.map((item) => `• ${item}`).join("\n")}`;
const text = (
  name: string,
  label: string,
  help?: string,
  value = "",
): Field => ({ name, label, help, value });
const areaItems: Record<string, string[]> = {
  Kitchen: [
    "Refrigerator",
    "Range or cooktop",
    "Oven",
    "Dishwasher",
    "Small appliances worth tracking",
  ],
  Laundry: ["Washer", "Dryer", "Utility connections", "Cleaning supplies"],
  Bedroom: [
    "Furniture",
    "Electronics",
    "Window coverings",
    "Valuable personal items",
  ],
  Bathroom: [
    "Fixtures",
    "Ventilation",
    "Water shutoff location",
    "Stored supplies",
  ],
  Garage: ["Vehicles", "Tools", "Door opener", "Seasonal equipment"],
  Utility: [
    "HVAC equipment",
    "Water heater",
    "Electrical panel",
    "Filters and shutoffs",
  ],
};

const zhTwInventoryAreas: Record<string, string[]> = {
  客廳: ["沙發、茶几與收納家具", "電視、音響與遊戲設備", "照明與智慧家居設備", "藝術品、收藏品或高單價物品"],
  廚房: ["冰箱與冷凍設備", "爐具、烤箱與微波爐", "洗碗機、濾水器與固定設備", "高單價小家電", "值得單獨識別的鍋具與餐具"],
  臥室: ["床架、床墊與收納家具", "電腦、螢幕與視聽設備", "窗飾、燈具與空調設備", "珠寶、收藏品或高單價個人物品"],
  浴室: ["熱水、通風與暖風設備", "洗面盆、水龍頭與固定配件", "電動牙刷、吹風機等電器", "無障礙或其他特殊配件"],
  洗衣區: ["洗衣機與乾衣機", "排水、進水與通風配件", "晒衣與熨燙設備", "清潔設備與高單價耗材庫存"],
  書房: ["書桌、座椅與書櫃", "電腦、螢幕、印表機與儲存設備", "相機、樂器或其他專業設備", "紙本原件、備份媒體與文件容器"],
  陽台: ["戶外桌椅與收納", "清潔、園藝與季節性設備", "排水、照明與固定配件", "戶外用電器與安全設備"],
  "車庫／儲藏室": ["車輛、自行車與相關配件", "工具、梯具與維修設備", "門機、鎖與安全設備", "季節用品與已封箱物品"],
  "機電／設備區": ["熱水器與給排水設備", "空調主機、濾網與控制器", "電盤、關閉點與識別標示", "水泵、發電或備援電力設備"],
};

const zhTwInventoryAliases: Record<string, string> = {
  living: "客廳", "living room": "客廳", 客廳: "客廳",
  kitchen: "廚房", 廚房: "廚房",
  bedroom: "臥室", 臥室: "臥室",
  bathroom: "浴室", 浴室: "浴室",
  laundry: "洗衣區", "laundry room": "洗衣區", 洗衣區: "洗衣區", 洗衣間: "洗衣區",
  office: "書房", study: "書房", 書房: "書房",
  balcony: "陽台", 陽台: "陽台",
  garage: "車庫／儲藏室", storage: "車庫／儲藏室", 車庫: "車庫／儲藏室", 儲藏室: "車庫／儲藏室",
  utility: "機電／設備區", 機電間: "機電／設備區", 設備區: "機電／設備區",
};

const zhTwAppliancePrompts: Record<string, string[]> = {
  冰箱: ["核對說明書中的溫度設定、門封與可由使用者清潔部位", "記錄門封狀態、異音、異味、漏水或溫度異常", "核對濾網、濾芯或其他耗材的真實料號與更換依據", "確認品牌服務與維修聯絡方式"],
  洗衣機: ["核對說明書中的清潔程式、進排水與可由使用者處理部位", "記錄水管、接點、門封或上蓋的可見狀態", "記錄異常振動、排水、異味、錯誤碼與發生時機", "核對原廠指定的洗劑、耗材與服務管道"],
  乾衣機: ["核對說明書中的絨屑、冷凝水或排氣系統使用者檢查項目", "記錄乾燥時間變化、異常高溫、焦味、異音或錯誤碼", "核對濾網或其他耗材的正確料號", "確認排氣、瓦斯或電氣問題的合格服務管道"],
  洗碗機: ["核對說明書中的濾網、噴臂、門封與補充品項目", "記錄漏水、排水、清潔效果變化、異味或錯誤碼", "核對洗劑、軟化鹽或其他耗材是否適用實際型號", "確認進排水與電氣異常的服務聯絡方式"],
  冷氣: ["核對說明書中可由使用者清潔的濾網與外部部位", "記錄冷房效果、滴水、異音、異味、錯誤碼與發生時機", "核對遙控器、濾網或其他配件的正確料號", "把冷媒、排水配管、電氣與室外機作業留給適當專業人員"],
  除濕機: ["核對說明書中水箱、濾網、排水與使用環境要求", "記錄異常高溫、異音、焦味、漏水或自動停機狀況", "查核實際品牌型號是否有公開召回或檢修訊息", "確認原廠服務聯絡方式，不自行拆解冷媒或電氣部位"],
  熱水器: ["核對說明書、能源類型、安裝與合格服務資料", "只記錄可見異常：水溫不穩、漏水、錯誤碼、異味或異音", "確認家人知道遇到瓦斯味、廢氣或電氣異常時的停用與對外聯絡流程", "記錄最近一次專業檢查來源，不由這份清單發明間隔"],
  抽油煙機: ["核對說明書中油網、油杯與可由使用者清潔部位", "記錄吸力變化、異音、異味、滴油或按鍵異常", "核對濾網、燈具或其他配件料號", "把風管深層處理、高處與電氣作業留給適當專業人員"],
  其他: ["在說明書中找出可由使用者執行的清潔、觀察與耗材項目", "記錄正常運作基準與現在看到的差異", "核對耗材、零件、客服與維修資料", "先標示電氣、瓦斯、冷媒、高處或其他不適合自行處理的範圍"],
};

const vehicleDocumentDefinition = (locale: Locale): Definition => {
  const zh = locale === "zh-TW";
  const statusOrder = zh
    ? [
        "已記錄車輛用途，等待確認文件分類",
        "已記錄文件分類，等待確認管轄地或負責來源",
        "已記錄負責來源，等待受保護車輛比對",
        "已記錄受保護車輛比對，等待目前文件或版本",
        "已記錄目前文件或版本，等待存取與保管核對",
        "已測試存取與保管，等待官方狀態來源",
        "已映射官方狀態來源，等待必要行動",
        "已記錄更新、驗車、投保、召回、貸款或過戶行動，等待官方結果",
        "文件、車輛比對、狀態或安全矛盾，等待負責來源審查",
        "已核對來源、車輛比對、版本、存取與狀態",
        "更新、驗車、召回改正、貸款或過戶已完成，記錄官方結果與保管",
        "不適用，已記錄原因與重新開啟事件",
      ]
    : [
        "Vehicle purpose recorded—document category pending",
        "Document category recorded—jurisdiction or responsible source pending",
        "Responsible source recorded—protected vehicle match pending",
        "Protected vehicle match recorded—current document or version pending",
        "Current document or version recorded—access and custody pending",
        "Access and custody tested—official status sources pending",
        "Official status sources mapped—required action pending",
        "Renewal, inspection, insurance, recall, lien or transfer action recorded—official result pending",
        "Document, vehicle-match, status or safety conflict—responsible review pending",
        "Source, vehicle match, version, access and status reviewed",
        "Renewal, inspection, recall remedy, lien or transfer completed—observed result and custody recorded",
        "Not applicable—reason and reopen event recorded",
      ];
  const defaultRecords = zh
    ? `REG-A | FAMILY-CAR-A 行照／車籍文件；家庭車輛紀錄角色 | 監理機關與監理服務官方來源；目前管轄地受保護簽發資料 VEH-A-REG2 | 受保護車身與目前行照資料已比對；證據 VEH-A-ID2；核對 2026-08-24 | 目前行照／車籍版本已開啟；所示版本與期間已觀察 | 受保護目前文件可開啟；原件與車上必要文件保管角色已核對 | 監理官方車籍與後續異動來源已映射；強制險、驗車與召回維持分開來源 | 目前文件保留；本次沒有更新申請；收到新通知、搬家、車主、來源或存取改變時重新檢視 | 監理機關更正入口與合格協助來源已映射；本次有日期檢視無來源差異 | 家庭車輛紀錄角色 | 2026-08-24 | 已核對來源、車輛比對、版本、存取與狀態\nRECALL-A | FAMILY-CAR-A 召回來源與改正追蹤；家庭車輛安全來源角色 | 交通部委託車安資訊網與車廠召回官方來源；受保護車輛證據 VEH-A-R2 | 受保護車身資料已依召回來源比對；證據 VEH-A-R2；核對 2026-08-24 | 目前召回公告與車廠適用觀察已保留；版本來源可追溯 | 官方來源已開啟；受保護公告與車輛比對證據可取得 | 車廠召回案件、目前安全指示與交通部委託來源已映射 | 授權改正預約已記錄；官方完成結果與改正證明仍待觀察 | 車廠召回窗口與交通部委託安全來源已映射；依目前安全指示處理 | 家庭車輛安全來源角色 | 2026-09-14 | 已記錄更新、驗車、投保、召回、貸款或過戶行動，等待官方結果`
    : `REG-A | Family-car A registration document; household vehicle-records role | State motor vehicle authority and protected issued-registration source for the current jurisdiction | Protected VIN and current registration matched; evidence VEH-A-ID2; checked 2026-08-24 | Current issued registration version opened; stated version and period observed | Protected current record opened; original and limited vehicle-copy custody roles observed | State registration status and renewal source mapped; insurance, inspection and recall remain separate | Current record retained; no renewal action open; reopen on a new notice, move, ownership, source or access change | State authority correction route and qualified-help source mapped; no source gap observed in this dated review | Household vehicle-records role | 2026-08-24 | Source, vehicle match, version, access and status reviewed\nRECALL-A | Family-car A recall-source and remedy follow-up; household vehicle-safety source role | NHTSA recall lookup and manufacturer recall source; protected vehicle evidence VEH-A-R2 | Protected VIN matched in the responsible recall process; evidence VEH-A-R2; checked 2026-08-24 | Current recall notice and manufacturer applicability observation preserved; version source attributable | Official sources opened; protected notice and vehicle-match evidence accessible | Open manufacturer recall campaign and current interim safety source observed | Authorized remedy appointment recorded; official completion result and remedy evidence pending | Manufacturer recall team and NHTSA source mapped; follow current safety instructions | Household vehicle-safety source role | 2026-09-14 | Renewal, inspection, insurance, recall, lien or transfer action recorded—official result pending`;

  return {
    intro: zh
      ? "記錄行照／車籍、強制險、驗車、召回、貸款與過戶的負責來源、受保護車輛比對、版本、存取、行動與實際結果。工具不查車籍，也不判定車能否上路。"
      : "Record responsible sources, protected vehicle match, current version, access, status, action and observed results for title, registration, insurance, inspection, recalls, liens and transfers. The tool never searches a VIN or decides whether a vehicle may be driven.",
    fields: [
      text(
        "review",
        zh ? "家庭私人車輛文件核對代號" : "Private vehicle-document review reference",
        zh
          ? "使用家庭內部代號，不要輸入姓名、地址、車牌、VIN、行照、保險、駕照、案件或交易資料。"
          : "Use a household code, not a person, address, plate, VIN, title, registration, policy, driver, case or transaction detail.",
        "VEH-DOCS-2026-A",
      ),
      {
        name: "context",
        label: zh ? "車輛文件核對情境" : "Vehicle-document review context",
        type: "select",
        options: zh
          ? [
              "第一次家庭車輛文件盤點",
              "行照、車籍或監理資料版本核對",
              "強制險或其他保險證據交接",
              "定期、臨時或變更檢驗來源核對",
              "召回公告、適用與改正結果追蹤",
              "搬家、地址或管轄來源改變",
              "買賣、贈與、繼承、停駛或報廢準備",
              "貸款、動產擔保、租賃或留置來源改變",
              "文件、車輛比對、狀態或安全來源矛盾",
            ]
          : [
              "First household vehicle-document map",
              "Title or registration source and version review",
              "Insurance evidence handoff",
              "Inspection or emissions source review",
              "Recall source, applicability and remedy follow-up",
              "Move or jurisdiction change",
              "Sale, gift, inheritance, lease return or disposal preparation",
              "Lien, lender or lease-source change",
              "Document, vehicle-match, status or safety conflict",
            ],
      },
      {
        name: "baselineDate",
        label: zh ? "車輛文件與來源地圖基準日" : "Vehicle-document and source-map baseline date",
        type: "date",
        value: "2026-08-20",
      },
      {
        name: "reviewDate",
        label: zh ? "本次車輛文件核對日" : "Current vehicle-document review date",
        type: "date",
        value: "2026-08-24",
      },
      {
        name: "nextReview",
        label: zh ? "下一次來源或行動核點" : "Next source or action checkpoint",
        type: "date",
        value: "2026-09-14",
      },
      text(
        "basis",
        zh
          ? "監理、保險、車廠、驗車、召回、貸款與受保護資料來源地圖"
          : "Motor-vehicle authority, insurer, manufacturer, inspection, recall, lender and protected-record source map",
        zh
          ? "使用安全來源／證據代號或有日期的公開網址；完整車輛、身分、帳戶與交易資料留在受保護位置。"
          : "Use safe source and evidence IDs or dated public URLs. Keep vehicle, identity, account and transaction details protected.",
        zh
          ? "MVDIS-OFFICIAL-R2；CAR-SAFETY-R1；INSURER-SOURCE-I2；PROTECTED-VEH-A"
          : "STATE-MVA-R2; NHTSA-R1; INSURER-SOURCE-I2; PROTECTED-VEH-A",
      ),
      {
        name: "records",
        label: zh ? "有版本的家庭車輛文件來源與狀態列" : "Versioned household vehicle-document source and status rows",
        type: "textarea",
        help: zh
          ? "每行：ID｜安全車輛代號、文件用途與家庭角色｜管轄地及負責來源｜受保護車輛比對與來源核對日 YYYY-MM-DD｜目前文件／版本／期間觀察｜存取與保管觀察｜官方狀態來源｜家庭或官方行動與實際結果｜差異／安全／申訴／合格審查來源｜負責角色｜目標或結果日期 YYYY-MM-DD｜十二種指定狀態之一。最多 14 行。"
          : "One line: ID | safe vehicle alias, document purpose and household role | jurisdiction and responsible source | protected vehicle-match evidence plus source checked date YYYY-MM-DD | current document, version or period observation | access and custody observation | official status source | household or official action and observed result | discrepancy, safety, complaint or qualified-review route | owner role | target or outcome date YYYY-MM-DD | one of the twelve listed statuses. Maximum 14 lines.",
        value: defaultRecords,
      },
      text(
        "storage",
        zh
          ? "受保護行照、車籍、保險、檢驗、召回、貸款、交易與核對歷程位置"
          : "Protected title, registration, insurance, inspection, recall, lien, transaction and review-history location",
        zh
          ? "只寫資料夾或流程代號；不要輸入姓名、地址、車牌、VIN、證號、帳戶、付款、簽名、案件或私人通信。"
          : "Use a folder or process label. Do not enter names, addresses, plates, VINs, document numbers, accounts, payments, signatures, cases or private messages.",
        zh
          ? "家庭紀錄／車輛／VEH-DOCS-2026-A／受保護車籍與文件證據"
          : "Household records / vehicles / VEH-DOCS-2026-A / protected issued evidence",
      ),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.review.trim())
        return zh
          ? "請輸入家庭私人車輛文件核對代號，讓匯出的版本仍能辨識。"
          : "Enter a private vehicle-document review reference so this exported version can be identified.";
      if (!baselineDate)
        return zh ? "請以 YYYY-MM-DD 輸入有效的車輛文件與來源地圖基準日。" : "Enter the real vehicle-document and source-map baseline date in YYYY-MM-DD format.";
      if (!reviewDate)
        return zh ? "請以 YYYY-MM-DD 輸入有效的本次車輛文件核對日。" : "Enter a real current vehicle-document review date in YYYY-MM-DD format.";
      const now = new Date();
      const today = strictIsoDate([
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime())
        return zh ? "本次車輛文件核對日不能在未來。" : "The current vehicle-document review date cannot be in the future.";
      if (baselineDate.getTime() > reviewDate.getTime())
        return zh ? "車輛文件與來源地圖基準日不能晚於本次核對日。" : "The vehicle-document and source-map baseline cannot be later than the current review.";
      if (!nextReview)
        return zh ? "請以 YYYY-MM-DD 輸入有效的下一次來源或行動核點。" : "Enter a real next source or action checkpoint in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime())
        return zh ? "下一次來源或行動核點不能早於本次車輛文件核對日。" : "The next source or action checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 12)
        return zh ? "請用安全指標說明監理、保險、車廠、驗車、召回、貸款與受保護資料來源地圖。" : "Identify the authority, insurer, manufacturer, inspection, recall, lender and protected-record source map with safe pointers.";
      if (!values.storage.trim())
        return zh ? "請輸入受保護車輛文件與核對歷程位置。" : "Enter the protected location for vehicle documents and review history.";

      const recordRows = values.records
        .split("\n")
        .map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        }))
        .filter((row) => row.parts.some(Boolean));
      if (recordRows.length === 0)
        return zh ? "請至少加入一筆車輛文件用途與官方狀態關係。" : "Add at least one vehicle-document purpose and official-status relationship row.";
      if (recordRows.length > 14)
        return zh ? "每一版最多 14 列；請先凍結本版，再開始下一個範圍。" : "One vehicle-document review version supports at most 14 rows; freeze this version before starting another scope.";
      const invalidRows = recordRows.filter((row) => row.parts.length !== 12 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return zh
          ? `車輛文件第 ${invalidRows.map((row) => row.line).join("、")} 行必須包含全部十二個以 | 分隔的欄位。`
          : `Vehicle-document line ${invalidRows.map((row) => row.line).join(", ")} must contain all twelve pipe-separated fields.`;
      const ids = recordRows.map((row) => row.parts[0].toLocaleUpperCase(locale));
      if (new Set(ids).size !== ids.length) return zh ? "每一列車輛文件都需要唯一 ID。" : "Every vehicle-document row needs a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return zh ? "每列 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 REG-A 或 RECALL-1。" : "Use 2 to 20 letters, numbers or hyphens for each row ID, such as REG-A or RECALL-1.";
      const statuses = new Set(statusOrder);
      const invalidStatuses = recordRows.filter((row) => !statuses.has(row.parts[11]));
      if (invalidStatuses.length)
        return zh
          ? `車輛文件第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用欄位說明中的十二種證據狀態之一。`
          : `Vehicle-document line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the twelve evidence statuses in the field instructions.`;
      const checkedDate = (value: string) => {
        const matches = value.match(/\b\d{4}-\d{2}-\d{2}\b/g) || [];
        return matches.length === 1 ? strictIsoDate(matches[0]) : null;
      };
      const invalidSourceDates = recordRows.filter((row) => {
        const sourceDate = checkedDate(row.parts[3]);
        return !sourceDate || sourceDate.getTime() < baselineDate.getTime() || sourceDate.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return zh
          ? `車輛文件第 ${invalidSourceDates.map((row) => row.line).join("、")} 行需要一個介於基準日與本次核對日的來源核對日，並保留受保護車輛比對指標。`
          : `Vehicle-document line ${invalidSourceDates.map((row) => row.line).join(", ")} needs one source-checked date from the baseline through the current review plus a protected vehicle-match pointer.`;
      const openRows = recordRows.filter((row) => statusOrder.slice(0, 9).includes(row.parts[11]));
      const closedRows = recordRows.filter((row) => statusOrder.slice(9).includes(row.parts[11]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[10]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return zh
          ? `開放的車輛文件第 ${invalidOpenDates.map((row) => row.line).join("、")} 行需要介於本次核對日與下一核點的目標日。`
          : `Open vehicle-document line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next source or action checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[10]);
        return !outcome || outcome.getTime() < baselineDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return zh
          ? `已核對、完成或不適用的車輛文件第 ${invalidClosedDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的實際結果日。`
          : `Closed reviewed, completed or not-applicable vehicle-document line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual outcome date from the baseline through this review.`;
      const missingLayers = recordRows.filter((row) =>
        row.parts[1].length < 8 || row.parts[2].length < 12 || row.parts[3].length < 18 || row.parts[4].length < 12 || row.parts[5].length < 10 || row.parts[6].length < 10 || row.parts[7].length < 12 || row.parts[8].length < 10 || row.parts[9].length < 4,
      );
      if (missingLayers.length)
        return zh
          ? `車輛文件第 ${missingLayers.map((row) => row.line).join("、")} 行需要真實的用途、負責來源、受保護比對、版本、存取／保管、狀態、行動／結果、差異來源與負責角色。`
          : `Vehicle-document line ${missingLayers.map((row) => row.line).join(", ")} needs a real purpose, responsible source, protected match, version, access/custody, status, action/result, discrepancy route and owner.`;
      const reviewedWithoutEvidence = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[9]) return false;
        const evidence = row.parts.slice(2, 9).join(" ");
        const sourceOk = zh
          ? /(?:監理|公路|保險|車廠|製造|驗車|檢驗|貸款|租賃|官方|簽發)/.test(row.parts[2])
          : /(?:state|territor|motor vehicle|dmv|authority|nhtsa|manufacturer|insurer|inspection|lender|lease|official|issued)/i.test(row.parts[2]);
        const matchOk = zh ? /(?:受保護|比對|證據)/.test(row.parts[3]) : /(?:protected|match|evidence)/i.test(row.parts[3]);
        const versionOk = zh ? /(?:目前|版本|期間|簽發|公告)/.test(row.parts[4]) : /(?:current|version|period|issued|notice)/i.test(row.parts[4]);
        const accessOk = zh ? /(?:開啟|存取|可取得|保管|原件)/.test(row.parts[5]) : /(?:opened|access|available|custody|original)/i.test(row.parts[5]);
        const statusOk = zh ? /(?:車籍|行照|保險|驗車|檢驗|召回|貸款|過戶|狀態|更新)/.test(row.parts[6]) : /(?:title|registration|insurance|inspection|emissions|recall|lien|transfer|status|renewal)/i.test(row.parts[6]);
        const actionOk = zh ? /(?:保留|重新|異動|更新|行動|沒有.*申請)/.test(row.parts[7]) : /(?:retained|reopen|change|renew|action|no .* open)/i.test(row.parts[7]);
        const routeOk = zh ? /(?:監理|車廠|保險|檢驗|貸款|更正|申訴|合格)/.test(row.parts[8]) : /(?:authority|manufacturer|insurer|inspection|lender|correction|complaint|qualified)/i.test(row.parts[8]);
        const unresolved = zh ? /(?:等待|未知|未解|未核對|矛盾|缺少)/.test(evidence) : /(?:pending|unknown|unresolved|not checked|conflict|missing)/i.test(evidence);
        return !sourceOk || !matchOk || !versionOk || !accessOk || !statusOk || !actionOk || !routeOk || unresolved;
      });
      if (reviewedWithoutEvidence.length)
        return zh
          ? `完成核對的車輛文件第 ${reviewedWithoutEvidence.map((row) => row.line).join("、")} 行必須連結負責來源、受保護車輛比對、目前版本、實際存取／保管、官方狀態、行動或重查條件及負責處理來源，且不能仍有未解差異。`
          : `Completed vehicle-document review line ${reviewedWithoutEvidence.map((row) => row.line).join(", ")} must link a responsible source, protected vehicle match, current version, actual access/custody, official status, action or reopen rule and responsible review route with no unresolved gap.`;
      const actionClaimingCompletion = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[7]) return false;
        const textValue = row.parts[7];
        return zh
          ? /(?:已完成|已更新完成|過戶完成|召回完成|驗車合格|官方結果已確認)/.test(textValue) || !/(?:已記錄|預約|送出|申請|等待|仍待|尚待)/.test(textValue)
          : /(?:confirmed complete|completed|renewed successfully|transfer complete|recall complete|inspection passed|official result observed)/i.test(textValue) || !/(?:recorded|appointment|submitted|requested|pending|awaiting)/i.test(textValue);
      });
      if (actionClaimingCompletion.length)
        return zh
          ? `已行動但等待結果的第 ${actionClaimingCompletion.map((row) => row.line).join("、")} 行必須保持開放，描述已做行動與仍待的官方結果，不能宣稱完成。`
          : `Action-recorded line ${actionClaimingCompletion.map((row) => row.line).join(", ")} must remain open and describe the action plus pending official result, not claim completion.`;
      const conflictWithoutRoute = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[8]) return false;
        const conflict = [row.parts[4], row.parts[6], row.parts[7], row.parts[8]].join(" ");
        const conflictOk = zh ? /(?:矛盾|不同|差異|安全|召回|警示|不一致|異常)/.test(conflict) : /(?:conflict|different|discrepancy|safety|recall|warning|mismatch|unexpected)/i.test(conflict);
        const routeOk = zh ? /(?:監理|車廠|保險|檢驗|貸款|租賃|交通部|合格|負責)/.test([row.parts[8], row.parts[9]].join(" ")) : /(?:authority|manufacturer|insurer|inspection|lender|lessor|nhtsa|qualified|responsible)/i.test([row.parts[8], row.parts[9]].join(" "));
        return !conflictOk || !routeOk;
      });
      if (conflictWithoutRoute.length)
        return zh
          ? `矛盾列第 ${conflictWithoutRoute.map((row) => row.line).join("、")} 行必須寫出看到的文件、車輛比對、狀態或安全差異，以及負責的監理、車廠、保險、檢驗、貸款或合格審查來源。`
          : `Conflict line ${conflictWithoutRoute.map((row) => row.line).join(", ")} must name the observed document, vehicle-match, status or safety conflict and the responsible authority, manufacturer, insurer, inspection, lender or qualified review route.`;
      const completedWithoutResult = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[10]) return false;
        const result = [row.parts[7], row.parts[8]].join(" ");
        const observed = zh ? /(?:官方結果|監理結果|檢驗結果|車廠完成|保險結果|貸款結果|過戶結果|改正證明).*(?:觀察|收到|開啟|確認|記錄)/.test(result) : /(?:(?:official|authority|inspection|manufacturer|insurer|lender|transfer|remedy) (?:result|confirmation|record|evidence)).*(?:observed|received|opened|recorded)/i.test(result);
        const custody = zh ? /(?:行照|牌照|保險|貸款|舊文件|原件|爭議|保管)/.test(result) : /(?:registration|plate|insurance|lien|prior record|original|dispute|custody)/i.test(result);
        const unresolved = zh ? /(?:等待|仍待|尚待|未解|未知)/.test(result) : /(?:pending|awaiting|unresolved|unknown)/i.test(result);
        return !observed || !custody || unresolved;
      });
      if (completedWithoutResult.length)
        return zh
          ? `完成結果的第 ${completedWithoutResult.map((row) => row.line).join("、")} 行必須記錄已觀察的官方／負責來源結果，並檢查行照、牌照、保險、貸款、舊文件、爭議與原件保管，不能仍有等待事項。`
          : `Completed result line ${completedWithoutResult.map((row) => row.line).join(", ")} must record an observed official or responsible-source result and screen registration, plates, insurance, liens, prior records, disputes and original custody without a pending claim.`;
      const notApplicableWithoutTrigger = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[11]) return false;
        const trigger = [row.parts[7], row.parts[8]].join(" ");
        return zh
          ? !/(?:重新開啟|重新檢視|如果|當.*時|車輛|車主|管轄|保險|召回|驗車|交易.*改變)/.test(trigger)
          : !/(?:reopen|review again|if |when |after |vehicle|owner|jurisdiction|insurance|recall|inspection|transaction.*change)/i.test(trigger);
      });
      if (notApplicableWithoutTrigger.length)
        return zh
          ? `不適用的第 ${notApplicableWithoutTrigger.map((row) => row.line).join("、")} 行必須記錄目前原因，以及車輛、車主、管轄地、保險、召回、驗車或交易變更時的重新開啟事件。`
          : `Not-applicable line ${notApplicableWithoutTrigger.map((row) => row.line).join(", ")} must state the current reason and vehicle, owner, jurisdiction, insurance, recall, inspection or transaction change that reopens it.`;

      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return zh
          ? "偵測到可能的完整電話、Email、車牌、證號、車身／引擎、保險、貸款、案件或其他長數字識別資料。請改用安全證據代號。"
          : "A possible full phone, email, plate, document, vehicle, insurance, lender, case or other long numeric identifier was detected. Keep it protected and use a safe evidence pointer here.";
      if (/password|passphrase|passcode|access code|recovery code|verification code|login credential|api key|full address|street address|full name|person name|owner name|driver name|driver.?s license|license number\s*[:=]|plate number|license plate\s*[:=]|full vin|complete vin|vin number|vin\s*[:=]|vehicle identification number|title number|registration number|policy number|claim number|lien account|loan account|bank account|credit card|citation number|ticket number|signature|bill of sale contents|purchase amount|sale amount|private portal|private message|correspondence|完整地址|完整姓名|車主姓名|駕駛姓名|駕照號碼|車牌號碼|完整車牌|完整車身|車身號碼\s*[:：]|引擎號碼\s*[:：]|行照號碼|車籍號碼|保險證號|保單號碼|理賠號碼|貸款帳號|銀行帳號|信用卡|罰單號碼|簽名|買賣內容|成交金額|登入密碼|驗證碼|私人入口|私人訊息|通信內容/i.test(privacyText))
        return zh
          ? "偵測到可能的地址、姓名、車牌、VIN／車身、引擎、行照、車籍、駕照、保險、貸款、付款、罰單、簽名、交易、登入或私人通信資料。請改成安全來源、流程或證據代號。"
          : "A possible address, person, plate, VIN, vehicle, title, registration, driver, insurance, lender, payment, citation, signature, transaction, credential or private correspondence detail was detected. Replace it with a safe source, process or evidence pointer.";

      const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
      const statusCounts = statusOrder
        .map((status) => ({ status, count: recordRows.filter((row) => row.parts[11] === status).length }))
        .filter((item) => item.count > 0);
      if (zh)
        return `${values.review.trim()}｜家庭車輛文件來源與狀態紀錄\n核對情境：${values.context}\n車輛文件／來源地圖基準：${formatter.format(baselineDate)}\n本次車輛文件核對：${formatter.format(reviewDate)}\n下一次來源或行動核點：${formatter.format(nextReview)}\n仍開放的文件、車輛比對、版本、存取、狀態、安全或結果列：${openRows.length} 筆\n已核對、完成或不適用列：${closedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n監理、保險、車廠、驗車、召回、貸款與受保護資料來源地圖：${values.basis.trim()}\n\n${lines("有版本的家庭車輛文件來源與狀態證據", recordRows.map((row) => `${row.parts[0]}｜車輛／文件用途：${row.parts[1]}｜管轄地／負責來源：${row.parts[2]}｜受保護車輛比對／來源核對：${row.parts[3]}｜目前文件／版本／期間：${row.parts[4]}｜存取／保管：${row.parts[5]}｜官方狀態來源：${row.parts[6]}｜行動／實際結果：${row.parts[7]}｜差異／安全／申訴／審查來源：${row.parts[8]}｜負責角色：${row.parts[9]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[10]) as Date)}｜狀態：${row.parts[11]}`))}\n\n受保護行照、車籍、保險、檢驗、召回、貸款、交易與核對歷程位置：${values.storage.trim()}\n\n這份輸出只是家庭來源與工作流程索引，不是行照、車籍、駕照、保險證、檢驗、召回、貸款、車況、交易或所有權證明。它不查詢、造訪、登入、比對、讀取、上傳、驗證或更新車牌、VIN／車身、引擎、行照、車籍、駕照、保險、驗車、召回、里程、貸款、失竊、報廢、稅費、罰鍰或車主資料，不付款、預約、送件、投保、報案、辦理異動或聯絡機關，也不計算期限、不提供交通安全、保險、稅務、買賣或法律意見。真實結果請使用目前監理機關、交通部委託安全來源、車廠、保險公司、檢驗單位、貸款／租賃機構及合格專業來源。`;
      return `${values.review.trim()} — household vehicle document source and status log\nReview context: ${values.context}\nVehicle-document/source-map baseline: ${formatter.format(baselineDate)}\nCurrent vehicle-document review: ${formatter.format(reviewDate)}\nNext source or action checkpoint: ${formatter.format(nextReview)}\nOpen document, match, version, access, status, safety or result rows: ${openRows.length}\nReviewed, completed or not-applicable rows: ${closedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nAuthority, insurer, manufacturer, inspection, recall, lender and protected-record source map: ${values.basis.trim()}\n\n${lines("Versioned household vehicle-document source and status evidence", recordRows.map((row) => `${row.parts[0]} — vehicle/document purpose: ${row.parts[1]} — jurisdiction/responsible source: ${row.parts[2]} — protected vehicle match/source check: ${row.parts[3]} — current document/version/period: ${row.parts[4]} — access/custody: ${row.parts[5]} — official status source: ${row.parts[6]} — action/observed result: ${row.parts[7]} — discrepancy/safety/complaint/review route: ${row.parts[8]} — owner: ${row.parts[9]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[10]) as Date)} — status: ${row.parts[11]}`))}\n\nProtected title, registration, insurance, inspection, recall, lien, transaction and review-history location: ${values.storage.trim()}\n\nThis output is a household source and workflow index, not proof of title, registration, licensing, insurance, inspection, recall status, liens, condition, transfer or ownership. It does not search, visit, sign in, decode, compare, read, upload, authenticate or update a plate, VIN, title, registration, driver, insurance, inspection, recall, mileage, lien, theft, salvage, tax, citation or owner record; submit a payment, appointment, form, claim, complaint or safety report; calculate a deadline; or provide driving, safety, insurance, tax, transaction or legal advice. Use the current responsible motor vehicle authority, NHTSA, manufacturer, insurer, inspection program, lender or lessor and qualified professional for every real result.`;
    },
  };
};

const petRecordDefinition = (locale: Locale): Definition => {
  const zh = locale === "zh-TW";
  const statusOrder = zh
    ? [
        "已記錄寵物照護用途，等待確認紀錄分類",
        "已記錄紀錄分類，等待確認負責來源",
        "已記錄負責來源，等待受保護寵物比對",
        "已記錄受保護寵物比對，等待目前文件或指示版本",
        "已記錄目前文件或指示版本，等待存取與保管核對",
        "已測試存取與保管，等待照護或官方狀態來源",
        "已映射照護或官方狀態來源，等待必要交接或行動",
        "已記錄登記、疫苗、旅運、寄養或照護交接行動，等待負責結果",
        "身分、照護指示、狀態或動物福利矛盾，等待獸醫或主管來源審查",
        "已核對來源、寵物比對、版本、存取與交接",
        "已收到負責來源結果，記錄保管與下次照護條件",
        "不適用，已記錄原因與重新開啟事件",
      ]
    : [
        "Pet-care purpose recorded—record category pending",
        "Record category recorded—responsible source pending",
        "Responsible source recorded—protected pet match pending",
        "Protected pet match recorded—current record or instruction version pending",
        "Current record or instruction version recorded—access and custody pending",
        "Access and custody tested—care or official status source pending",
        "Care or official status sources mapped—handoff or action pending",
        "Registration, vaccination, travel, boarding or care handoff action recorded—responsible result pending",
        "Identity, care-instruction, status or animal-welfare conflict—veterinary or authority review pending",
        "Source, pet match, version, access and handoff reviewed",
        "Responsible-source result received—custody and next-care condition recorded",
        "Not applicable—reason and reopen event recorded",
      ];
  const defaultRecords = zh
    ? `ID-A | 家庭寵物 A 登記與晶片登錄來源；家庭身分紀錄角色 | 寵物登記管理資訊網、登記機構與受保護獸醫掃描證據；犬貓及地方適用來源分開 | 受保護晶片掃描與寵物登記證明已比對；證據 PET-A-ID2；核對 2026-08-24 | 目前寵物登記證明與登錄來源已開啟；飼主聯絡內容未複製 | 受保護登記證明可取得；共用清單只保存代號 | 登記機構、寵物登記網與地方主管機關來源已映射；狂犬病、獸醫照護與旅運分開 | 本次來源與存取已核對；取得、轉讓、住居所、聯絡、遺失或寵物狀態改變時重新檢視 | 登記機構、地方動保機關與獸醫來源已映射；所有已比對來源一致 | 家庭寵物紀錄角色 | 2026-08-24 | 已核對來源、寵物比對、版本、存取與交接
CARE-A | 家庭寵物 A 目前獸醫指示交接；家庭照護角色 | 目前開立獸醫師與原標示容器／書面指示來源；急診獸醫入口分開 | 受保護寵物紀錄與標示容器已比對；證據 PET-A-CARE2；核對 2026-08-24 | 目前書面指示版本已觀察；共用列只保留版本與來源代號 | 受保護原標示容器與書面來源可取得；照護者只拿到必要入口 | 開立獸醫師目前指示與異常、漏給或多給時的聯絡來源已映射 | 照護交接演練已記錄；開立獸醫師對目前交接版本的確認結果仍待取得 | 開立獸醫師、急診獸醫與藥物錯誤／不良反應處理來源已映射 | 家庭照護角色 | 2026-09-14 | 已記錄登記、疫苗、旅運、寄養或照護交接行動，等待負責結果`
    : `ID-A | Household pet A identification and microchip-registry source; household identity-record role | Veterinary scan evidence, identified registry source and current local animal authority; each role remains separate | Protected scan and pet record matched; evidence PET-A-ID2; checked 2026-08-24 | Current registry source and contact-review screen opened; owner contact content not copied | Protected evidence is accessible; shared index retains only safe pointers | Registry contact route and local animal authority source mapped; rabies, veterinary care and travel remain separate | Current source and access reviewed; reopen after adoption, move, contact, loss, registry or pet-status change | Veterinarian, registry and local animal-services routes mapped; all compared sources agree | Household pet-record role | 2026-08-24 | Source, pet match, version, access and handoff reviewed
CARE-A | Household pet A current veterinary-instruction handoff; household care role | Current prescribing veterinarian and original labelled container or written instruction source; emergency veterinary route separate | Protected pet record and labelled container matched; evidence PET-A-CARE2; checked 2026-08-24 | Current written instruction version observed; shared row keeps only version and source pointers | Protected original labelled container and written source accessible; caregiver receives only the necessary route | Prescribing veterinarian instruction and contact route for a missed, extra or unexpected administration mapped | Caregiver handoff rehearsal recorded; prescribing-veterinarian confirmation of the current handoff version remains pending | Prescribing veterinarian, emergency veterinary and medication-error or adverse-event routes mapped | Household care role | 2026-09-14 | Registration, vaccination, travel, boarding or care handoff action recorded—responsible result pending`;

  return {
    intro: zh
      ? "分開記錄寵物登記／晶片、狂犬病或其他證明、獸醫書面來源、旅運／寄養文件與照護交接結果。工具不查晶片、不保存病歷，也不產生診斷或用藥指示。"
      : "Separate pet identification, registry, vaccination, veterinary-source, travel, boarding and care-handoff evidence. The tool never searches a microchip, stores a medical record or creates diagnosis or medication instructions.",
    fields: [
      text(
        "review",
        zh ? "家庭私人寵物紀錄核對代號" : "Private household pet-record review reference",
        zh ? "使用家庭代號，不要輸入飼主或寵物本名、地址、電話、晶片、登記、病歷、處方或旅運案件資料。" : "Use a household code, not an owner or pet name, address, phone, chip, registry, medical, prescription or travel-case detail.",
        "PET-RECORDS-2026-A",
      ),
      {
        name: "context",
        label: zh ? "寵物紀錄核對情境" : "Pet-record review context",
        type: "select",
        options: zh
          ? ["第一次家庭寵物紀錄盤點", "寵物登記或晶片來源核對", "疫苗或證明版本交接", "獸醫書面指示與照護交接", "寄養、美容、日托或到府照護準備", "國內移動、出入境或運輸文件研究", "搬家、取得、轉讓、遺失或聯絡資料改變", "身分、照護指示、狀態或動物福利矛盾"]
          : ["First household pet-record map", "Pet registry or microchip-source review", "Vaccination or certificate version handoff", "Veterinary written-instruction and care handoff", "Boarding, grooming, daycare or sitter preparation", "Domestic move, international travel or transport research", "Move, adoption, transfer, loss or contact change", "Identity, care-instruction, status or animal-welfare conflict"],
      },
      { name: "baselineDate", label: zh ? "寵物紀錄與來源地圖基準日" : "Pet-record and source-map baseline date", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: zh ? "本次寵物紀錄核對日" : "Current pet-record review date", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: zh ? "下一次來源、照護或行動核點" : "Next source, care or action checkpoint", type: "date", value: "2026-09-14" },
      text(
        "basis",
        zh ? "登記、晶片、獸醫、疫苗、旅運、寄養與緊急照護來源地圖" : "Registry, microchip, veterinary, vaccination, travel, boarding and emergency-care source map",
        zh ? "使用安全來源或證據代號；身分、聯絡、健康與案件內容留在受保護來源。" : "Use safe source or evidence IDs. Keep identity, contact, health and case content in the protected responsible source.",
        zh ? "PET-REGISTRY-R2；VET-SOURCE-V2；TRAVEL-SOURCE-T1；PROTECTED-PET-A" : "REGISTRY-R2; VET-SOURCE-V2; APHIS-TRAVEL-T1; PROTECTED-PET-A",
      ),
      {
        name: "records",
        label: zh ? "有版本的家庭寵物紀錄來源與交接狀態列" : "Versioned household pet-record source and handoff rows",
        type: "textarea",
        help: zh ? "每行：ID｜安全寵物代號、紀錄用途與家庭角色｜負責來源及適用範圍｜受保護寵物比對與來源核對日 YYYY-MM-DD｜目前文件／版本／書面指示觀察｜存取與保管觀察｜照護或官方狀態來源｜交接／行動與實際結果｜差異／緊急／不良事件／獸醫或主管來源｜負責角色｜目標或結果日期 YYYY-MM-DD｜十二種指定狀態之一。最多 14 行。" : "One line: ID | safe pet alias, record purpose and household role | responsible source and scope | protected pet-match evidence plus source checked date YYYY-MM-DD | current document, version or written-instruction observation | access and custody observation | care or official status source | handoff/action and observed result | discrepancy, emergency, adverse-event, veterinary or authority route | owner role | target or outcome date YYYY-MM-DD | one of the twelve listed statuses. Maximum 14 lines.",
        value: defaultRecords,
      },
      text(
        "storage",
        zh ? "受保護登記、晶片、疫苗、獸醫、旅運、寄養與核對歷程位置" : "Protected registry, microchip, vaccination, veterinary, travel, boarding and review-history location",
        zh ? "只寫資料夾或流程代號，不要貼身分、聯絡、晶片、病歷、處方、付款、授權或案件內容。" : "Use a folder or process label. Do not paste identity, contact, chip, medical, prescription, payment, authorization or case content.",
        zh ? "家庭紀錄／寵物／PET-RECORDS-2026-A／受保護簽發與獸醫來源" : "Household records / pets / PET-RECORDS-2026-A / protected issued and veterinary sources",
      ),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.review?.trim() || !baselineDate || !reviewDate || !nextReview)
        return zh ? "請填寫私人核對代號與三個有效日期。" : "Enter a private review reference and all three valid dates.";
      if (baselineDate.getTime() > reviewDate.getTime())
        return zh ? "寵物紀錄基準日不能晚於本次核對日。" : "The pet-record baseline cannot be later than the current review.";
      if (nextReview.getTime() < reviewDate.getTime())
        return zh ? "下一次來源、照護或行動核點不能早於本次寵物紀錄核對日。" : "The next source, care or action checkpoint cannot be earlier than the current review.";
      if (!values.basis?.trim() || !values.storage?.trim())
        return zh ? "請填寫來源地圖與受保護資料位置代號。" : "Enter the source map and protected-record location pointer.";

      const rawRows = (values.records || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
      if (!rawRows.length || rawRows.length > 14)
        return zh ? "請輸入 1 至 14 行寵物紀錄來源與交接狀態。" : "Enter 1 to 14 pet-record source and handoff rows.";
      const recordRows = rawRows.map((raw, index) => ({ line: index + 1, parts: raw.split(/\s*\|\s*/).map((part) => part.trim()) }));
      const wrongParts = recordRows.filter((row) => row.parts.length !== 12);
      if (wrongParts.length)
        return zh ? `寵物紀錄第 ${wrongParts.map((row) => row.line).join("、")} 行必須剛好有十二個欄位。` : `Pet-record line ${wrongParts.map((row) => row.line).join(", ")} must contain exactly twelve fields.`;
      const invalidIds = recordRows.filter((row) => !/^[A-Z0-9][A-Z0-9-]{1,23}$/i.test(row.parts[0]));
      const ids = recordRows.map((row) => row.parts[0].toLowerCase());
      if (invalidIds.length || new Set(ids).size !== ids.length)
        return zh ? "每行需要唯一的 2 至 24 字元安全 ID，只能使用英數與連字號。" : "Every row needs a unique 2-to-24-character safe ID using letters, numbers and hyphens.";
      const statuses = new Set(statusOrder);
      const invalidStatuses = recordRows.filter((row) => !statuses.has(row.parts[11]));
      if (invalidStatuses.length)
        return zh ? `寵物紀錄第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用欄位說明中的十二種狀態之一。` : `Pet-record line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the twelve listed statuses.`;

      const sourceDateFor = (value: string) => {
        const matches = value.match(/\b\d{4}-\d{2}-\d{2}\b/g) || [];
        return matches.length === 1 ? strictIsoDate(matches[0]) : null;
      };
      const invalidSourceDates = recordRows.filter((row) => {
        const checked = sourceDateFor(row.parts[3]);
        return !checked || checked.getTime() < baselineDate.getTime() || checked.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return zh ? `寵物紀錄第 ${invalidSourceDates.map((row) => row.line).join("、")} 行需要一個介於基準日與本次核對日的來源核對日及受保護寵物比對指標。` : `Pet-record line ${invalidSourceDates.map((row) => row.line).join(", ")} needs one source-checked date from the baseline through this review plus a protected pet-match pointer.`;

      const openRows = recordRows.filter((row) => statusOrder.slice(0, 9).includes(row.parts[11]));
      const closedRows = recordRows.filter((row) => statusOrder.slice(9).includes(row.parts[11]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[10]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return zh ? `開放的寵物紀錄第 ${invalidOpenDates.map((row) => row.line).join("、")} 行需要介於本次核對日與下一核點的目標日。` : `Open pet-record line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[10]);
        return !outcome || outcome.getTime() < baselineDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return zh ? `已核對、完成或不適用的寵物紀錄第 ${invalidClosedDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的結果日。` : `Closed pet-record line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an outcome date from the baseline through this review.`;

      const missingLayers = recordRows.filter((row) => row.parts[1].length < 8 || row.parts[2].length < 12 || row.parts[3].length < 18 || row.parts[4].length < 12 || row.parts[5].length < 10 || row.parts[6].length < 10 || row.parts[7].length < 12 || row.parts[8].length < 10 || row.parts[9].length < 4);
      if (missingLayers.length)
        return zh ? `寵物紀錄第 ${missingLayers.map((row) => row.line).join("、")} 行需要真實的用途、負責來源、受保護比對、版本、存取／保管、狀態、交接／結果、處理來源與負責角色。` : `Pet-record line ${missingLayers.map((row) => row.line).join(", ")} needs a real purpose, responsible source, protected match, version, access/custody, status, handoff/result, review route and owner.`;

      const reviewedWithoutEvidence = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[9]) return false;
        const evidence = row.parts.slice(2, 9).join(" ");
        const sourceOk = zh ? /(?:登記|獸醫|防疫|檢疫|寄養|主管|官方|簽發)/.test(row.parts[2]) : /(?:registry|veterinar|animal service|authority|official|issued|boarding|travel)/i.test(row.parts[2]);
        const matchOk = zh ? /(?:受保護|比對|證據)/.test(row.parts[3]) : /(?:protected|match|evidence)/i.test(row.parts[3]);
        const versionOk = zh ? /(?:目前|版本|證明|指示|登錄)/.test(row.parts[4]) : /(?:current|version|certificate|instruction|registry)/i.test(row.parts[4]);
        const accessOk = zh ? /(?:開啟|存取|可取得|保管|原件)/.test(row.parts[5]) : /(?:opened|access|available|custody|original)/i.test(row.parts[5]);
        const statusOk = zh ? /(?:登記|狂犬病|疫苗|獸醫|旅運|寄養|狀態|照護)/.test(row.parts[6]) : /(?:registry|rabies|vaccin|veterinar|travel|boarding|status|care)/i.test(row.parts[6]);
        const actionOk = zh ? /(?:核對|保留|重新|改變|交接|行動)/.test(row.parts[7]) : /(?:reviewed|retained|reopen|change|handoff|action)/i.test(row.parts[7]);
        const routeOk = zh ? /(?:登記|獸醫|動保|防疫|檢疫|寄養|主管|合格)/.test(row.parts[8]) : /(?:registry|veterinar|animal service|public health|travel|boarding|authority|qualified)/i.test(row.parts[8]);
        const unresolved = zh ? /(?:等待|未知|未解|未核對|矛盾|缺少)/.test(evidence) : /(?:pending|unknown|unresolved|not checked|conflict|missing)/i.test(evidence);
        return !sourceOk || !matchOk || !versionOk || !accessOk || !statusOk || !actionOk || !routeOk || unresolved;
      });
      if (reviewedWithoutEvidence.length)
        return zh ? `完成核對的第 ${reviewedWithoutEvidence.map((row) => row.line).join("、")} 行必須連結負責來源、受保護寵物比對、目前版本、實際存取、狀態、交接或重查條件及負責處理來源，且不能仍有未解差異。` : `Completed pet-record review line ${reviewedWithoutEvidence.map((row) => row.line).join(", ")} must link a responsible source, protected pet match, current version, actual access, status, handoff or reopen rule and responsible route with no unresolved gap.`;

      const actionClaimingCompletion = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[7]) return false;
        return zh ? /(?:已完成|已生效|登記完成|接種完成|檢疫完成|獸醫確認完成)/.test(row.parts[7]) || !/(?:已記錄|已送出|已預約|等待|仍待|尚待|待取得)/.test(row.parts[7]) : /(?:confirmed complete|completed|effective|registration complete|vaccination complete|travel cleared|veterinarian confirmed)/i.test(row.parts[7]) || !/(?:recorded|submitted|appointment|pending|awaiting|remains)/i.test(row.parts[7]);
      });
      if (actionClaimingCompletion.length)
        return zh ? `已交接或行動但等待結果的第 ${actionClaimingCompletion.map((row) => row.line).join("、")} 行必須保持開放，不能把送出、預約或轉述寫成完成。` : `Action-recorded line ${actionClaimingCompletion.map((row) => row.line).join(", ")} must remain open and cannot turn a submission, appointment or handoff into completion.`;

      const conflictWithoutRoute = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[8]) return false;
        const combined = [row.parts[4], row.parts[6], row.parts[7], row.parts[8], row.parts[9]].join(" ");
        const conflict = zh ? /(?:矛盾|不同|差異|錯誤|緊急|不良|福利|異常)/.test(combined) : /(?:conflict|different|discrepancy|error|emergency|adverse|welfare|unexpected)/i.test(combined);
        const route = zh ? /(?:獸醫|登記|動保|防疫|檢疫|寄養|主管|負責)/.test(combined) : /(?:veterinar|registry|animal service|public health|travel|boarding|authority|responsible)/i.test(combined);
        return !conflict || !route;
      });
      if (conflictWithoutRoute.length)
        return zh ? `矛盾列第 ${conflictWithoutRoute.map((row) => row.line).join("、")} 行必須寫出身分、照護指示、狀態或動物福利差異，以及負責獸醫、登記、動保、防疫、檢疫或寄養來源。` : `Conflict line ${conflictWithoutRoute.map((row) => row.line).join(", ")} must name the identity, care-instruction, status or animal-welfare conflict and the responsible veterinary, registry, animal-service, public-health, travel or boarding route.`;

      const completedWithoutResult = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[10]) return false;
        const result = [row.parts[7], row.parts[8]].join(" ");
        const observed = zh ? /(?:負責來源|獸醫|登記|防疫|檢疫|寄養|官方).*(?:結果|證明|確認).*(?:收到|開啟|觀察|記錄)/.test(result) : /(?:(?:responsible source|veterinary|registry|public-health|travel|boarding|official) (?:result|certificate|confirmation)).*(?:received|opened|observed|recorded)/i.test(result);
        const custody = zh ? /(?:保管|原件|容器|證明|下一次|重新開啟)/.test(result) : /(?:custody|original|container|certificate|next care|reopen)/i.test(result);
        const unresolved = zh ? /(?:等待|仍待|尚待|未解|未知)/.test(result) : /(?:pending|awaiting|unresolved|unknown)/i.test(result);
        return !observed || !custody || unresolved;
      });
      if (completedWithoutResult.length)
        return zh ? `完成結果的第 ${completedWithoutResult.map((row) => row.line).join("、")} 行必須記錄已收到或觀察的負責來源結果、證明／原件保管與下次照護或重開條件。` : `Completed result line ${completedWithoutResult.map((row) => row.line).join(", ")} must record an observed responsible-source result, certificate or original custody and the next-care or reopen condition.`;

      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[11] === statusOrder[11] && !(zh ? /(?:重新開啟|重新檢視|如果|當.*時|取得|轉讓|搬家|遺失|旅運|寄養|照護.*改變)/.test([row.parts[7], row.parts[8]].join(" ")) : /(?:reopen|review again|if |when |after |adoption|transfer|move|loss|travel|boarding|care.*change)/i.test([row.parts[7], row.parts[8]].join(" "))));
      if (notApplicableWithoutTrigger.length)
        return zh ? `不適用的第 ${notApplicableWithoutTrigger.map((row) => row.line).join("、")} 行必須記錄目前原因，以及取得、轉讓、搬家、遺失、旅運、寄養或照護改變時的重開事件。` : `Not-applicable line ${notApplicableWithoutTrigger.map((row) => row.line).join(", ")} must state the current reason and the adoption, transfer, move, loss, travel, boarding or care change that reopens it.`;

      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return zh ? "偵測到可能的完整電話、Email、晶片、登記、證明、處方、案件或其他長數字識別資料。請改用安全證據代號。" : "A possible full phone, email, chip, registry, certificate, prescription, case or other long numeric identifier was detected. Use a safe evidence pointer.";
      if (/password|passphrase|passcode|access code|recovery code|verification code|login credential|full address|street address|owner name\s*[:=]|pet name\s*[:=]|caregiver name\s*[:=]|microchip (?:number|id)\s*[:=]|chip number\s*[:=]|registry number\s*[:=]|rabies tag\s*[:=]|certificate number\s*[:=]|medical record|diagnosis\s*[:=]|lab result|prescription number|medication name\s*[:=]|drug name\s*[:=]|dose\s*[:=]|dosage\s*[:=]|\b\d+(?:\.\d+)?\s*(?:mg|mcg|ml)\b|payment card|bank account|signature|private message|correspondence|完整地址|飼主姓名|寵物本名|照護者姓名|晶片號碼\s*[:：]|寵物登記證號|狂犬病牌號\s*[:：]|證明書號碼|病歷內容|診斷\s*[:：]|檢驗數值|處方號碼|藥名\s*[:：]|劑量\s*[:：]|銀行帳號|信用卡|簽名|登入密碼|驗證碼|私人訊息|通信內容/i.test(privacyText))
        return zh ? "偵測到可能的身分、地址、晶片、登記、疫苗、健康、處方、劑量、付款、授權、登入或私人通信內容。請改成安全來源、流程或證據代號。" : "A possible identity, address, chip, registry, vaccination, health, prescription, dose, payment, authorization, credential or private correspondence detail was detected. Replace it with a safe source, process or evidence pointer.";

      const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[11] === status).length })).filter((item) => item.count > 0);
      if (zh)
        return `${values.review.trim()}｜家庭寵物紀錄來源與交接狀態
核對情境：${values.context}
寵物紀錄／來源地圖基準：${formatter.format(baselineDate)}
本次寵物紀錄核對：${formatter.format(reviewDate)}
下一次來源、照護或行動核點：${formatter.format(nextReview)}
仍開放的來源、寵物比對、版本、存取、交接或結果列：${openRows.length} 筆
已核對、完成或不適用列：${closedRows.length} 筆
狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}

登記、晶片、獸醫、疫苗、旅運、寄養與緊急照護來源地圖：${values.basis.trim()}

${lines("有版本的家庭寵物紀錄來源與交接證據", recordRows.map((row) => `${row.parts[0]}｜寵物／紀錄用途：${row.parts[1]}｜負責來源／適用範圍：${row.parts[2]}｜受保護寵物比對／來源核對：${row.parts[3]}｜目前文件／版本／書面指示：${row.parts[4]}｜存取／保管：${row.parts[5]}｜照護／官方狀態來源：${row.parts[6]}｜交接／行動／實際結果：${row.parts[7]}｜差異／緊急／不良事件／審查來源：${row.parts[8]}｜負責角色：${row.parts[9]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[10]) as Date)}｜狀態：${row.parts[11]}`))}

受保護登記、晶片、疫苗、獸醫、旅運、寄養與核對歷程位置：${values.storage.trim()}

這份輸出只是家庭來源與交接索引，不是寵物身分、登記、疫苗、健康、處方、旅運、寄養、授權或照護結果證明。它不搜尋晶片、不查飼主、不登入登記或獸醫系統、不讀取或上傳證明／病歷／檢驗／處方、不產生診斷、用藥、劑量、餵食或緊急處置建議，不預約、申報、變更登記、購藥、送件、付款或聯絡任何機構，也不計算法定、疫苗、治療、寄養或旅運期限。真實照護與緊急狀況請直接使用目前開立或照護獸醫師、急診動物醫院、寵物登記機構、地方動保／防疫機關、檢疫機關、旅運目的地及實際寄養來源。`;
      return `${values.review.trim()} — household pet-record source and handoff status
Review context: ${values.context}
Pet-record/source-map baseline: ${formatter.format(baselineDate)}
Current pet-record review: ${formatter.format(reviewDate)}
Next source, care or action checkpoint: ${formatter.format(nextReview)}
Open source, pet-match, version, access, handoff or result rows: ${openRows.length}
Reviewed, completed or not-applicable rows: ${closedRows.length}
Status count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}

Registry, microchip, veterinary, vaccination, travel, boarding and emergency-care source map: ${values.basis.trim()}

${lines("Versioned household pet-record source and handoff evidence", recordRows.map((row) => `${row.parts[0]} — pet/record purpose: ${row.parts[1]} — responsible source/scope: ${row.parts[2]} — protected pet match/source check: ${row.parts[3]} — current record/version/written instruction: ${row.parts[4]} — access/custody: ${row.parts[5]} — care/official status source: ${row.parts[6]} — handoff/action/observed result: ${row.parts[7]} — discrepancy/emergency/adverse-event/review route: ${row.parts[8]} — owner: ${row.parts[9]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[10]) as Date)} — status: ${row.parts[11]}`))}

Protected registry, microchip, vaccination, veterinary, travel, boarding and review-history location: ${values.storage.trim()}

This output is a household source and handoff index, not proof of pet identity, registry, vaccination, health, prescription, travel, boarding, authorization or care result. It does not search a microchip, identify an owner, sign in to a registry or veterinary system, read or upload a certificate, medical record, test or prescription, create diagnosis, medication, dose, feeding or emergency instructions, book care, report or update a registry, buy medicine, submit a form, pay or contact an organization, or calculate legal, vaccine, treatment, boarding or travel deadlines. Use the current prescribing or treating veterinarian, emergency animal hospital, registry, local animal or public-health authority, travel destination and actual boarding source for every real action and result.`;
    },
  };
};

const schoolRecordDefinition = (locale: Locale): Definition => {
  const zh = locale === "zh-TW";
  const statusOrder = zh
    ? [
        "已記錄家庭學校用途，等待確認紀錄分類",
        "已記錄紀錄分類，等待確認負責學校來源",
        "已記錄負責學校來源，等待受保護學生比對",
        "已記錄受保護學生比對，等待目前紀錄或通知版本",
        "已記錄目前紀錄或通知版本，等待存取與保管核對",
        "已測試存取與保管，等待學校狀態或要求來源",
        "已映射學校狀態或要求來源，等待家庭交接或行動",
        "已記錄註冊、出缺席、紀錄、支持、交通、活動或同意行動，等待學校結果",
        "身分、學籍、學習支持、安全或同意矛盾，等待學校或合格來源審查",
        "已核對來源、學生比對、版本、存取與交接",
        "已收到學校來源結果，記錄保管與下學期條件",
        "不適用，已記錄原因與重新開啟事件",
      ]
    : [
        "Household school purpose recorded—record category pending",
        "Record category recorded—responsible school source pending",
        "Responsible school source recorded—protected student match pending",
        "Protected student match recorded—current record or notice version pending",
        "Current record or notice version recorded—access and custody pending",
        "Access and custody tested—school status or requirement source pending",
        "School status or requirement sources mapped—family handoff or action pending",
        "Enrollment, attendance, record, support, transport, activity or consent action recorded—school result pending",
        "Identity, enrollment, learning-support, safety or consent conflict—school or qualified review pending",
        "Source, student match, version, access and handoff reviewed",
        "School-source result received—custody and next-term condition recorded",
        "Not applicable—reason and reopen event recorded",
      ];
  const defaultRecords = zh
    ? `REG-A | 家庭學生 A 本學年註冊與校方聯絡來源；家庭教育紀錄角色 | 目前學校辦公室與所屬主管機關註冊通知；出缺席、交通與活動來源分開 | 受保護學生資料已比對；證據 LEARNER-A-ID2；核對 2026-08-24 | 目前學年註冊與聯絡資料核對通知已開啟；個人內容未複製 | 受保護校方通知可取得；共用索引只保存安全代號 | 校方註冊、出缺席與授權交接要求已映射；學習支持與健康來源分開 | 本次來源與存取已核對；新學年、轉校、聯絡、交通、活動、支持或法定權限改變時重新檢視 | 學校辦公室與所屬主管機關來源已映射；所有已比對來源一致 | 家庭教育紀錄角色 | 2026-08-24 | 已核對來源、學生比對、版本、存取與交接
SUPPORT-A | 家庭學生 A 目前學習支持文件與會議交接；家庭支持角色 | 目前校內支持團隊與受保護計畫或通知來源；課堂與健康來源分開 | 受保護學生資料與支持來源已比對；證據 LEARNER-A-SUPPORT2；核對 2026-08-24 | 目前計畫或會議通知版本已觀察；共用列只保留版本與安全來源代號 | 受保護目前來源可取得；照顧者只拿到必要會議入口 | 校內支持團隊與程序權利來源已映射；評估、服務與課堂執行留在負責來源 | 家庭會議或紀錄存取交接已記錄；校內支持團隊對目前版本的確認結果仍待取得 | 校內支持團隊、主管機關學生事務單位與合格審查來源已映射 | 家庭支持角色 | 2026-09-08 | 已記錄註冊、出缺席、紀錄、支持、交通、活動或同意行動，等待學校結果`
    : `REG-A | Household learner A annual enrollment and school-contact source; household education-record role | Current school office and district enrollment notice; attendance, transport and activity sources remain separate | Protected learner record matched; evidence LEARNER-A-ID2; checked 2026-08-24 | Current annual enrollment and contact-review notice opened; personal details not copied | Protected official notice is accessible; shared index retains safe pointers only | School enrollment, attendance and authorized-handoff requirements mapped; support and health routes remain separate | Current source and access reviewed; reopen at a new term, school, contact, transport, activity, support or custody-authority change | Current school office and district route mapped; all compared sources agree | Household education-record role | 2026-08-24 | Source, student match, version, access and handoff reviewed
SUPPORT-A | Household learner A current learning-support document and meeting handoff; household support role | Current school support team and protected current plan or notice source; classroom and health sources separate | Protected learner and support source matched; evidence LEARNER-A-SUPPORT2; checked 2026-08-24 | Current plan or meeting-notice version observed; shared row keeps only version and safe source pointers | Protected current source accessible; caregiver receives only the necessary meeting route | School support team and procedural-safeguard source mapped; evaluation, services and class implementation remain with responsible sources | Family meeting or record-access handoff recorded; school support-team confirmation of the current version remains pending | School support team, district student-services office and qualified review routes mapped | Household support role | 2026-09-08 | Enrollment, attendance, record, support, transport, activity or consent action recorded—school result pending`;

  return {
    intro: zh
      ? "分開記錄註冊／學籍、出缺席、學習評量、支持計畫、校護或健康來源、交通、費用、活動同意與接送交接結果。工具不保存正式學生紀錄，也不替學校授權或作成決定。"
      : "Separate enrollment, attendance, assessment, learning-support, school-health, transport, fee, activity-consent and pickup-handoff sources. The tool never stores an official student record, grants school authorization or makes an education decision.",
    fields: [
      text(
        "review",
        zh ? "家庭私人學校紀錄核對代號" : "Private household school-record review reference",
        zh ? "使用家庭代號，不要輸入學生或學校本名、學號、地址、電話、成績、出缺席、診斷、支持計畫、接送人或登入資料。" : "Use a household code, not a student or school name, ID, address, phone, grade, attendance, diagnosis, support-plan, pickup-person or login detail.",
        "SCHOOL-RECORDS-2026-A",
      ),
      {
        name: "context",
        label: zh ? "家庭學校紀錄核對情境" : "Household school-record review context",
        type: "select",
        options: zh
          ? ["第一次本學年來源盤點", "註冊、學籍或轉學來源核對", "聯絡、出缺席或行事曆交接", "學習評量或正式紀錄存取", "學習支持、輔導或特教會議準備", "校護、健康或緊急資訊來源交接", "交通、接送、費用、活動或同意書核對", "身分、學籍、支持、安全或同意矛盾"]
          : ["First current-year source map", "Enrollment, student-status or transfer source review", "Contact, attendance or calendar handoff", "Assessment or official-record access", "Learning-support, counseling or special-education meeting preparation", "School-health or emergency-information source handoff", "Transport, pickup, fee, activity or consent review", "Identity, enrollment, support, safety or consent conflict"],
      },
      { name: "baselineDate", label: zh ? "學校紀錄／來源地圖基準日" : "School-record and source-map baseline date", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: zh ? "本次家庭學校紀錄核對日" : "Current household school-record review date", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: zh ? "下一次來源、交接或校方結果核點" : "Next source, handoff or school-result checkpoint", type: "date", value: "2026-09-08" },
      text(
        "basis",
        zh ? "註冊、學籍、出缺席、評量、支持、健康、交通、活動與同意來源地圖" : "Enrollment, student-status, attendance, assessment, support, health, transport, activity and consent source map",
        zh ? "使用安全來源或證據代號；學生、家庭、成績、健康、支持與授權內容留在受保護校方或家庭來源。" : "Use safe source or evidence IDs. Keep student, family, grade, health, support and authorization content in the protected school or household source.",
        "SCHOOL-OFFICE-S1; DISTRICT-NOTICE-V2; PROTECTED-LEARNER-A",
      ),
      {
        name: "records",
        label: zh ? "有版本的家庭學校紀錄來源與交接狀態列" : "Versioned household school-record source and handoff rows",
        type: "textarea",
        help: zh ? "每行：ID｜安全學生代號、紀錄用途與家庭角色｜負責學校來源及範圍｜受保護學生比對與來源核對日 YYYY-MM-DD｜目前紀錄／通知版本觀察｜存取與保管觀察｜學校狀態或要求來源｜家庭交接／行動與實際結果｜差異／安全／同意／學校或合格審查來源｜負責角色｜目標或結果日期 YYYY-MM-DD｜十二種指定狀態之一。最多 14 行。" : "One line: ID | safe learner alias, record purpose and household role | responsible school source and scope | protected student-match evidence plus source checked date YYYY-MM-DD | current record or notice version observation | access and custody observation | school status or requirement source | family handoff/action and observed result | discrepancy, safety, consent, school or qualified review route | owner role | target or outcome date YYYY-MM-DD | one of the twelve listed statuses. Maximum 14 lines.",
        value: defaultRecords,
      },
      text(
        "storage",
        zh ? "受保護學籍、評量、支持、健康、同意與核對歷程位置" : "Protected enrollment, assessment, support, health, consent and review-history location",
        zh ? "只寫資料夾或流程代號，不要貼學生身分、成績、健康、支持計畫、家庭、授權、付款或登入內容。" : "Use a folder or process label. Do not paste student identity, grade, health, support-plan, family, authorization, payment or login content.",
        zh ? "家庭紀錄／教育／SCHOOL-RECORDS-2026-A／受保護校方來源" : "Household records / education / SCHOOL-RECORDS-2026-A / protected school sources",
      ),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!baselineDate || !reviewDate || !nextReview)
        return zh ? "請輸入有效的基準日、本次核對日與下一次核點日期。" : "Enter valid baseline, review and next-checkpoint dates.";
      if (baselineDate > reviewDate)
        return zh ? "學校紀錄基準日不能晚於本次核對日。" : "The school-record baseline cannot be later than the current review.";
      if (nextReview < reviewDate)
        return zh ? "下一次來源、交接或校方結果核點不能早於本次家庭學校紀錄核對日。" : "The next source, handoff or school-result checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 12 || values.storage.trim().length < 10)
        return zh ? "請提供安全的校方來源地圖與受保護保管位置代號。" : "Provide a safe school-source map and protected storage-process label.";

      const rows = values.records.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
      if (!rows.length || rows.length > 14)
        return zh ? "請輸入 1 至 14 行家庭學校紀錄來源與交接狀態。" : "Enter 1 to 14 household school-record source and handoff rows.";
      const recordRows = rows.map((row, index) => ({ line: index + 1, parts: row.split("|").map((part) => part.trim()) }));
      const malformed = recordRows.filter((row) => row.parts.length !== 12 || row.parts.some((part) => !part));
      if (malformed.length)
        return zh ? `家庭學校紀錄第 ${malformed.map((row) => row.line).join("、")} 行必須剛好有 12 個非空白欄位。` : `School-record line ${malformed.map((row) => row.line).join(", ")} must contain exactly 12 non-empty fields.`;
      const ids = recordRows.map((row) => row.parts[0].toUpperCase());
      if (new Set(ids).size !== ids.length)
        return zh ? "每一行家庭學校紀錄都需要唯一 ID。" : "Every household school-record row needs a unique ID.";
      const invalidStatuses = recordRows.filter((row) => !statusOrder.includes(row.parts[11]));
      if (invalidStatuses.length)
        return zh ? `家庭學校紀錄第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用十二種指定狀態之一。` : `School-record line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the twelve exact statuses.`;

      const openRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) < 9);
      const closedRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) >= 9);
      const sourceDateOf = (textValue: string) => strictIsoDate(textValue.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "");
      const invalidSourceDates = recordRows.filter((row) => {
        const checked = sourceDateOf(row.parts[3]);
        return !checked || checked < baselineDate || checked > reviewDate;
      });
      if (invalidSourceDates.length)
        return zh ? `家庭學校紀錄第 ${invalidSourceDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的來源核對日。` : `School-record line ${invalidSourceDates.map((row) => row.line).join(", ")} needs a source checked date from the baseline through this review.`;
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[10]);
        return !target || target < reviewDate || target > nextReview;
      });
      if (invalidOpenDates.length)
        return zh ? `仍開放的家庭學校紀錄第 ${invalidOpenDates.map((row) => row.line).join("、")} 行需要介於本次核對日與下一核點的目標日。` : `Open school-record line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[10]);
        return !outcome || outcome < baselineDate || outcome > reviewDate;
      });
      if (invalidClosedDates.length)
        return zh ? `已核對、完成或不適用的家庭學校紀錄第 ${invalidClosedDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的結果日。` : `Closed school-record line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an outcome date from the baseline through this review.`;

      const missingLayers = recordRows.filter((row) => row.parts[1].length < 8 || row.parts[2].length < 12 || row.parts[3].length < 18 || row.parts[4].length < 12 || row.parts[5].length < 10 || row.parts[6].length < 10 || row.parts[7].length < 12 || row.parts[8].length < 10 || row.parts[9].length < 4);
      if (missingLayers.length)
        return zh ? `家庭學校紀錄第 ${missingLayers.map((row) => row.line).join("、")} 行需要真實的用途、負責來源、受保護比對、版本、存取／保管、狀態、交接／結果、審查來源與負責角色。` : `School-record line ${missingLayers.map((row) => row.line).join(", ")} needs a real purpose, responsible source, protected match, version, access/custody, status, handoff/result, review route and owner.`;

      const reviewedWithoutEvidence = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[9]) return false;
        const evidence = row.parts.slice(2, 9).join(" ");
        const sourceOk = zh ? /(?:學校|校方|主管機關|教務|學務|輔導|校護|交通|承辦)/.test(row.parts[2]) : /(?:school|district|education agency|registrar|student service|support team|health office|transport|provider)/i.test(row.parts[2]);
        const matchOk = zh ? /(?:受保護|比對|證據)/.test(row.parts[3]) : /(?:protected|match|evidence)/i.test(row.parts[3]);
        const versionOk = zh ? /(?:目前|版本|通知|紀錄|表單|計畫)/.test(row.parts[4]) : /(?:current|version|notice|record|form|plan)/i.test(row.parts[4]);
        const accessOk = zh ? /(?:開啟|存取|可取得|保管|原件)/.test(row.parts[5]) : /(?:opened|access|available|custody|original)/i.test(row.parts[5]);
        const statusOk = zh ? /(?:註冊|學籍|出缺席|評量|支持|健康|交通|活動|同意|接送)/.test(row.parts[6]) : /(?:enrollment|student status|attendance|assessment|support|health|transport|activity|consent|pickup)/i.test(row.parts[6]);
        const actionOk = zh ? /(?:核對|保留|重新|改變|交接|行動)/.test(row.parts[7]) : /(?:reviewed|retained|reopen|change|handoff|action)/i.test(row.parts[7]);
        const routeOk = zh ? /(?:學校|校方|主管機關|教務|學務|輔導|校護|交通|承辦|合格)/.test(row.parts[8]) : /(?:school|district|education agency|registrar|student service|support team|health office|transport|provider|qualified)/i.test(row.parts[8]);
        const unresolved = zh ? /(?:等待|未知|未解|未核對|矛盾|缺少)/.test(evidence) : /(?:pending|unknown|unresolved|not checked|conflict|missing)/i.test(evidence);
        return !sourceOk || !matchOk || !versionOk || !accessOk || !statusOk || !actionOk || !routeOk || unresolved;
      });
      if (reviewedWithoutEvidence.length)
        return zh ? `完成核對的第 ${reviewedWithoutEvidence.map((row) => row.line).join("、")} 行必須連結負責學校來源、受保護學生比對、目前版本、實際存取、狀態、交接或重查條件及負責審查來源，且不能仍有未解差異。` : `Completed school-record review line ${reviewedWithoutEvidence.map((row) => row.line).join(", ")} must link a responsible school source, protected student match, current version, actual access, status, handoff or reopen rule and responsible review route with no unresolved gap.`;

      const actionClaimingCompletion = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[7]) return false;
        return zh ? /(?:已完成|已生效|註冊完成|轉學完成|授權完成|學校確認完成)/.test(row.parts[7]) || !/(?:已記錄|已送出|已提出|已預約|等待|仍待|尚待|待取得)/.test(row.parts[7]) : /(?:confirmed complete|completed|effective|enrollment complete|transfer complete|authorization complete|school confirmed)/i.test(row.parts[7]) || !/(?:recorded|submitted|requested|scheduled|pending|awaiting|remains)/i.test(row.parts[7]);
      });
      if (actionClaimingCompletion.length)
        return zh ? `已交接或行動但等待校方結果的第 ${actionClaimingCompletion.map((row) => row.line).join("、")} 行必須保持開放，不能把送出、預約、付款或家庭轉述寫成完成。` : `Action-recorded line ${actionClaimingCompletion.map((row) => row.line).join(", ")} must remain open and cannot turn a submission, request, appointment, payment or family handoff into completion.`;

      const conflictWithoutRoute = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[8]) return false;
        const combined = [row.parts[4], row.parts[6], row.parts[7], row.parts[8], row.parts[9]].join(" ");
        const conflict = zh ? /(?:矛盾|不同|差異|錯誤|緊急|安全|同意|授權|支持)/.test(combined) : /(?:conflict|different|discrepancy|error|emergency|safety|consent|authorization|support)/i.test(combined);
        const route = zh ? /(?:學校|校方|主管機關|教務|學務|輔導|校護|交通|承辦|合格)/.test(combined) : /(?:school|district|education agency|registrar|student service|support team|health office|transport|provider|qualified)/i.test(combined);
        return !conflict || !route;
      });
      if (conflictWithoutRoute.length)
        return zh ? `矛盾列第 ${conflictWithoutRoute.map((row) => row.line).join("、")} 行必須寫出身分、學籍、學習支持、安全或同意差異，以及負責學校、主管機關、校護、交通或合格審查來源。` : `Conflict line ${conflictWithoutRoute.map((row) => row.line).join(", ")} must name the identity, enrollment, learning-support, safety or consent conflict and the responsible school, district, health, transport or qualified review route.`;

      const completedWithoutResult = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[10]) return false;
        const result = [row.parts[7], row.parts[8]].join(" ");
        const observed = zh ? /(?:學校來源|校方|主管機關|教務|學務|輔導|校護|交通|承辦).*(?:結果|紀錄|通知|確認).*(?:收到|開啟|觀察|記錄)/.test(result) : /(?:(?:school source|school|district|registrar|student service|support team|health office|transport|provider) (?:result|record|notice|confirmation)).*(?:received|opened|observed|recorded)/i.test(result);
        const custody = zh ? /(?:保管|原件|通知|目前版本|下學期|重新開啟)/.test(result) : /(?:custody|original|notice|current version|next term|reopen)/i.test(result);
        const unresolved = zh ? /(?:等待|仍待|尚待|未解|未知)/.test(result) : /(?:pending|awaiting|unresolved|unknown)/i.test(result);
        return !observed || !custody || unresolved;
      });
      if (completedWithoutResult.length)
        return zh ? `完成結果的第 ${completedWithoutResult.map((row) => row.line).join("、")} 行必須記錄已收到或觀察的學校來源結果、目前版本保管與下學期或重開條件。` : `Completed result line ${completedWithoutResult.map((row) => row.line).join(", ")} must record an observed school-source result, current-version custody and the next-term or reopen condition.`;

      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[11] === statusOrder[11] && !(zh ? /(?:重新開啟|重新檢視|如果|當.*時|新學年|轉校|活動|交通|支持|健康|同意.*改變)/.test([row.parts[7], row.parts[8]].join(" ")) : /(?:reopen|review again|if |when |after |new term|school change|activity|transport|support|health|consent.*change)/i.test([row.parts[7], row.parts[8]].join(" "))));
      if (notApplicableWithoutTrigger.length)
        return zh ? `不適用的第 ${notApplicableWithoutTrigger.map((row) => row.line).join("、")} 行必須記錄目前原因，以及新學年、轉校、活動、交通、支持、健康或同意改變時的重開事件。` : `Not-applicable line ${notApplicableWithoutTrigger.map((row) => row.line).join(", ")} must state the current reason and the new term, school, activity, transport, support, health or consent change that reopens it.`;

      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return zh ? "偵測到可能的完整電話、Email、學號、案件、付款或其他長數字識別資料。請改用安全證據代號。" : "A possible full phone, email, student, case, payment or other long numeric identifier was detected. Use a safe evidence pointer.";
      if (/password|passphrase|passcode|access code|recovery code|verification code|login credential|full address|street address|student name\s*[:=]|child name\s*[:=]|school name\s*[:=]|pickup person\s*[:=]|student id\s*[:=]|date of birth\s*[:=]|grade\s*[:=]|score\s*[:=]|gpa\s*[:=]|transcript content|report card content|attendance detail|discipline record|iep content|504 plan content|support plan content|counseling record|health record|diagnosis\s*[:=]|medication detail|authorization content|consent signature|payment card|bank account|private message|correspondence|完整地址|學生姓名\s*[:：]|兒童姓名\s*[:：]|學校名稱\s*[:：]|接送人姓名\s*[:：]|學號\s*[:：]|出生日期\s*[:：]|成績\s*[:：]|分數\s*[:：]|出缺席明細|獎懲紀錄內容|個別化教育計畫內容|支持計畫內容|輔導紀錄|健康紀錄|診斷\s*[:：]|用藥明細|授權內容|同意書簽名|銀行帳號|信用卡|登入密碼|驗證碼|私人訊息|通信內容/i.test(privacyText))
        return zh ? "偵測到可能的學生身分、學校、地址、成績、出缺席、學習支持、健康、接送、同意、付款、登入或私人通信內容。請改成安全來源、流程或證據代號。" : "A possible student identity, school, address, grade, attendance, learning-support, health, pickup, consent, payment, credential or private correspondence detail was detected. Replace it with a safe source, process or evidence pointer.";

      const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[11] === status).length })).filter((item) => item.count > 0);
      if (zh)
        return `${values.review.trim()}｜家庭學校紀錄來源與交接狀態
核對情境：${values.context}
學校紀錄／來源地圖基準：${formatter.format(baselineDate)}
本次家庭學校紀錄核對：${formatter.format(reviewDate)}
下一次來源、交接或校方結果核點：${formatter.format(nextReview)}
仍開放的來源、學生比對、版本、存取、交接或校方結果列：${openRows.length} 筆
已核對、完成或不適用列：${closedRows.length} 筆
狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}

註冊、學籍、出缺席、評量、支持、健康、交通、活動與同意來源地圖：${values.basis.trim()}

${lines("有版本的家庭學校紀錄來源與交接證據", recordRows.map((row) => `${row.parts[0]}｜學生／紀錄用途：${row.parts[1]}｜負責學校來源／適用範圍：${row.parts[2]}｜受保護學生比對／來源核對：${row.parts[3]}｜目前紀錄／通知版本：${row.parts[4]}｜存取／保管：${row.parts[5]}｜學校狀態／要求來源：${row.parts[6]}｜家庭交接／行動／實際結果：${row.parts[7]}｜差異／安全／同意／審查來源：${row.parts[8]}｜負責角色：${row.parts[9]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[10]) as Date)}｜狀態：${row.parts[11]}`))}

受保護學籍、評量、支持、健康、同意與核對歷程位置：${values.storage.trim()}

這份輸出只是家庭來源與交接索引，不是學生身分、學籍、出缺席、成績、學習支持、健康、交通、接送、費用、活動、同意、授權或學校決定證明。它不登入校務系統、不讀取、建立、上傳、轉移或更正正式學生紀錄，不產生成績、診斷、輔導、特教、交通或緊急處置判斷，不替任何人授權接送、活動、照片、資料揭露或服務，也不計算註冊、請假、評量、申請、付款或申訴期限。真實行動與結果請使用目前學校、主管機關、教師／行政／輔導／特教／校護／交通承辦、正式通知與合格專業來源。`;
      return `${values.review.trim()} — household school-record source and handoff status
Review context: ${values.context}
School-record/source-map baseline: ${formatter.format(baselineDate)}
Current household school-record review: ${formatter.format(reviewDate)}
Next source, handoff or school-result checkpoint: ${formatter.format(nextReview)}
Open source, student-match, version, access, handoff or school-result rows: ${openRows.length}
Reviewed, completed or not-applicable rows: ${closedRows.length}
Status count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}

Enrollment, student-status, attendance, assessment, support, health, transport, activity and consent source map: ${values.basis.trim()}

${lines("Versioned household school-record source and handoff evidence", recordRows.map((row) => `${row.parts[0]} — student/record purpose: ${row.parts[1]} — responsible school source/scope: ${row.parts[2]} — protected student match/source check: ${row.parts[3]} — current record/notice version: ${row.parts[4]} — access/custody: ${row.parts[5]} — school status/requirement source: ${row.parts[6]} — family handoff/action/observed result: ${row.parts[7]} — discrepancy/safety/consent/review route: ${row.parts[8]} — owner: ${row.parts[9]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[10]) as Date)} — status: ${row.parts[11]}`))}

Protected enrollment, assessment, support, health, consent and review-history location: ${values.storage.trim()}

This output is a household source and handoff index, not proof of student identity, enrollment, attendance, grades, learning support, health, transport, pickup, fee, activity, consent, authorization or a school decision. It does not sign in to a school system; read, create, upload, transfer or amend an official student record; make grading, diagnosis, counseling, special-education, transport or emergency decisions; authorize pickup, participation, photography, disclosure or services; or calculate enrollment, absence, assessment, application, payment or appeal deadlines. Use the current school, education agency, teacher, registrar, student-services, support, special-education, school-health, transport and qualified professional sources for every real action and result.`;
    },
  };
};

const medicalInformationDefinition = (locale: Locale): Definition => {
  const zh = locale === "zh-TW";
  const statusOrder = zh
    ? [
        "已記錄家庭醫療資訊用途，等待確認資訊分類",
        "已記錄資訊分類，等待確認負責醫療來源",
        "已記錄負責醫療來源，等待受保護本人比對",
        "已記錄受保護本人比對，等待目前病歷、清單或通知版本",
        "已記錄目前病歷、清單或通知版本，等待存取、保管與授權接收人核對",
        "已測試存取、保管與接收人，等待醫療、藥事、給付或官方狀態來源",
        "已映射醫療、藥事、給付或官方狀態來源，等待家庭交接或存取行動",
        "已記錄病歷存取、更正、轉移、用藥清單、轉診、給付或照護交接行動，等待負責結果",
        "身分、版本、存取、用藥安全或授權矛盾，等待醫療院所、藥師、保險或合格來源審查",
        "已核對來源、受保護本人比對、版本、存取與交接",
        "已收到負責來源結果，記錄保管與下次照護條件",
        "不適用，已記錄原因與重新開啟事件",
      ]
    : [
        "Household health-information purpose recorded—information category pending",
        "Information category recorded—responsible health source pending",
        "Responsible health source recorded—protected person match pending",
        "Protected person match recorded—current record, list or notice version pending",
        "Current record, list or notice version recorded—access, custody and authorized recipient pending",
        "Access, custody and recipient tested—clinical, pharmacy, coverage or official status source pending",
        "Clinical, pharmacy, coverage or official status sources mapped—household handoff or access action pending",
        "Record access, correction, transfer, medication-list, referral, coverage or caregiver handoff action recorded—responsible result pending",
        "Identity, version, access, medication-safety or authorization conflict—provider, pharmacist, plan or qualified review pending",
        "Source, protected person match, version, access and handoff reviewed",
        "Responsible-source result received—custody and next-care condition recorded",
        "Not applicable—reason and reopen event recorded",
      ];
  const defaultRecords = zh
    ? `RECORD-A | 家庭成員 A 的院所病歷來源與家庭保管交接；家庭醫療資料角色 | 目前醫療院所病歷窗口與受保護入口；健康存摺、藥局及保險來源分開 | 受保護本人資料已比對；證據 PERSON-A-MATCH2；核對 2026-08-26 | 目前可取得病歷範圍與版本已開啟；未複製診斷、檢驗或治療內容 | 受保護入口可存取；授權接收人與家庭保管位置已核對 | 醫療院所病歷窗口與正式存取程序已映射；藥事與給付來源分開 | 本次來源、實際存取與保管已核對；院所、照護、授權或所需資料範圍改變時重新開啟 | 醫療院所病歷窗口與合格審查來源已映射；比對來源一致 | 家庭醫療資料角色 | 2026-08-26 | 已核對來源、受保護本人比對、版本、存取與交接
HANDOFF-A | 家庭成員 A 目前照護轉換與用藥清單來源交接；家庭照護交接角色 | 目前照護院所、開立醫師與藥師來源；藥品內容留在受保護清單 | 受保護本人與目前交接來源已比對；證據 PERSON-A-HANDOFF2；核對 2026-08-26 | 目前照護通知與用藥清單版本已觀察；共用列只保留安全版本代號 | 受保護目前來源可取得；只有已授權接收人可取得必要內容 | 照護院所、開立醫師、藥師與給付來源已映射；檢驗影像判讀留給合格來源 | 照護交接與目前用藥清單來源已記錄；負責院所或藥師對目前版本的結果仍待取得 | 負責醫療院所、藥師、保險與合格審查來源已映射 | 家庭照護交接角色 | 2026-09-10 | 已記錄病歷存取、更正、轉移、用藥清單、轉診、給付或照護交接行動，等待負責結果`
    : `RECORD-A | Household member A provider-record source and household custody handoff; household health-information role | Current provider medical-records office and protected access route; patient portal, pharmacy and plan sources remain separate | Protected person record matched; evidence PERSON-A-MATCH2; checked 2026-08-26 | Current available record scope and version opened; diagnosis, test and treatment content not copied | Protected route is accessible; authorized recipient and household custody location reviewed | Provider medical-records office and official access process mapped; pharmacy and coverage sources remain separate | Current source, actual access and custody reviewed; reopen when provider, care, authority or requested record scope changes | Provider medical-records office and qualified review route mapped; compared sources agree | Household health-information role | 2026-08-26 | Source, protected person match, version, access and handoff reviewed
HANDOFF-A | Household member A current care-transition and medication-list source handoff; household care-handoff role | Current care provider, prescriber and pharmacist sources; medication content stays in the protected list | Protected person and current handoff source matched; evidence PERSON-A-HANDOFF2; checked 2026-08-26 | Current care notice and medication-list version observed; shared row keeps only a safe version pointer | Protected current sources accessible; only an authorized recipient gets necessary content | Treating provider, prescriber, pharmacist and coverage sources mapped; test interpretation remains with qualified sources | Care handoff and current medication-list source recorded; responsible provider or pharmacist result remains pending | Responsible provider, pharmacist, health plan and qualified review routes mapped | Household care-handoff role | 2026-09-10 | Record access, correction, transfer, medication-list, referral, coverage or caregiver handoff action recorded—responsible result pending`;

  return {
    intro: zh
      ? "分開記錄健康存摺、院所病歷、目前用藥清單、檢驗影像、轉診、給付與照護交接來源。工具只建立安全索引，不保存醫療內容，也不做診斷、判讀或用藥決定。"
      : "Separate patient-portal, provider-record, current medication-list, test, imaging, referral, coverage and care-handoff sources. This tool builds a safe index; it never stores clinical content or makes diagnostic, interpretive or medication decisions.",
    fields: [
      text(
        "review",
        zh ? "家庭私人醫療資訊核對代號" : "Private household medical-information review reference",
        zh ? "使用安全家庭代號；不要輸入姓名、出生日期、病歷號、診斷、用藥、劑量、檢驗數值、授權內容或登入資料。" : "Use a safe household code. Do not enter names, birth dates, record numbers, diagnoses, medications, doses, test values, authorization content or login details.",
        "MEDICAL-SOURCES-2026-A",
      ),
      {
        name: "context",
        label: zh ? "家庭醫療資訊核對情境" : "Household medical-information review context",
        type: "select",
        options: zh
          ? ["第一次來源地圖盤點", "醫療院所或健康存摺存取", "病歷更正或轉移", "目前用藥清單來源交接", "出院或照護轉換", "檢驗或影像來源核對", "轉診、給付或理賠來源核對", "照護者存取或授權核對", "身分、版本、存取、用藥安全或授權矛盾"]
          : ["First source map", "Provider or patient-portal access", "Record correction or transfer", "Current medication-list source handoff", "Discharge or care transition", "Test or imaging source review", "Referral, coverage or claim source review", "Caregiver access or authorization review", "Identity, version, access, medication-safety or authorization conflict"],
      },
      { name: "baselineDate", label: zh ? "醫療資訊／來源地圖基準日" : "Medical-information and source-map baseline date", type: "date", value: "2026-08-22" },
      { name: "reviewDate", label: zh ? "本次家庭醫療資訊核對日" : "Current household medical-information review date", type: "date", value: "2026-08-26" },
      { name: "nextReview", label: zh ? "下一次來源、交接或負責結果核點" : "Next source, handoff or responsible-result checkpoint", type: "date", value: "2026-09-10" },
      text(
        "basis",
        zh ? "健康存摺、院所、藥事、檢驗影像、轉診、給付與照護來源地圖" : "Patient-portal, provider, pharmacy, test, imaging, referral, coverage and care source map",
        zh ? "只放安全來源或證據代號；本人、診斷、藥品、檢驗、授權與給付內容留在受保護來源。" : "Use safe source or evidence IDs only. Keep person, diagnosis, medication, test, authorization and coverage content in protected sources.",
        "PROVIDER-RECORDS-S1; PORTAL-V2; PHARMACY-SOURCE-P1; PROTECTED-PERSON-A",
      ),
      {
        name: "records",
        label: zh ? "有版本的家庭醫療資訊來源與交接狀態列" : "Versioned household medical-information source and handoff rows",
        type: "textarea",
        help: zh ? "每行：ID｜安全本人代號、資訊用途與家庭角色｜負責醫療來源及範圍｜受保護本人比對與來源核對日 YYYY-MM-DD｜目前病歷／清單／通知版本觀察｜存取、保管與接收人觀察｜醫療／藥事／給付／官方狀態來源｜家庭交接、行動與實際結果｜矛盾、用藥安全、授權或合格審查來源｜負責角色｜目標或結果日期 YYYY-MM-DD｜十二種指定狀態之一。最多 14 行。" : "One line: ID | safe person alias, information purpose and household role | responsible health source and scope | protected person-match evidence plus source checked date YYYY-MM-DD | current record, list or notice version observation | access, custody and recipient observation | clinical, pharmacy, coverage or official status source | household handoff/action and observed result | conflict, medication-safety, authorization or qualified review route | owner role | target or outcome date YYYY-MM-DD | one of the twelve listed statuses. Maximum 14 lines.",
        value: defaultRecords,
      },
      text(
        "storage",
        zh ? "受保護院所、健保、藥事、病歷、授權與核對歷程位置" : "Protected provider, plan, pharmacy, record, authorization and review-history location",
        zh ? "只寫保管流程或容器代號，不要貼醫療內容、身分、授權、付款或登入資料。" : "Name a custody process or container, not clinical, identity, authorization, payment or login content.",
        zh ? "家庭紀錄／醫療／MEDICAL-SOURCES-2026-A／受保護來源" : "Household records / health / MEDICAL-SOURCES-2026-A / protected sources",
      ),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!baselineDate || !reviewDate || !nextReview)
        return zh ? "請輸入有效的基準日、本次核對日與下一次核點日期。" : "Enter valid baseline, review and next-checkpoint dates.";
      if (baselineDate > reviewDate)
        return zh ? "醫療資訊基準日不能晚於本次核對日。" : "The medical-information baseline cannot be later than the current review.";
      if (nextReview < reviewDate)
        return zh ? "下一次來源、交接或負責結果核點不能早於本次家庭醫療資訊核對日。" : "The next source, handoff or responsible-result checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 12 || values.storage.trim().length < 10)
        return zh ? "請提供安全的醫療來源地圖與受保護保管位置代號。" : "Provide a safe health-source map and protected storage-process label.";

      const rows = values.records.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
      if (!rows.length || rows.length > 14)
        return zh ? "請輸入 1 至 14 行家庭醫療資訊來源與交接狀態。" : "Enter 1 to 14 household medical-information source and handoff rows.";
      const recordRows = rows.map((row, index) => ({ line: index + 1, parts: row.split("|").map((part) => part.trim()) }));
      const malformed = recordRows.filter((row) => row.parts.length !== 12 || row.parts.some((part) => !part));
      if (malformed.length)
        return zh ? `家庭醫療資訊第 ${malformed.map((row) => row.line).join("、")} 行必須剛好有 12 個非空白欄位。` : `Medical-information line ${malformed.map((row) => row.line).join(", ")} must contain exactly 12 non-empty fields.`;
      const ids = recordRows.map((row) => row.parts[0].toUpperCase());
      if (new Set(ids).size !== ids.length)
        return zh ? "每一行家庭醫療資訊都需要唯一 ID。" : "Every household medical-information row needs a unique ID.";
      const invalidStatuses = recordRows.filter((row) => !statusOrder.includes(row.parts[11]));
      if (invalidStatuses.length)
        return zh ? `家庭醫療資訊第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用十二種指定狀態之一。` : `Medical-information line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the twelve exact statuses.`;

      const openRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) < 9);
      const closedRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) >= 9);
      const sourceDateOf = (textValue: string) => strictIsoDate(textValue.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "");
      const invalidSourceDates = recordRows.filter((row) => {
        const checked = sourceDateOf(row.parts[3]);
        return !checked || checked < baselineDate || checked > reviewDate;
      });
      if (invalidSourceDates.length)
        return zh ? `家庭醫療資訊第 ${invalidSourceDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的來源核對日。` : `Medical-information line ${invalidSourceDates.map((row) => row.line).join(", ")} needs a source checked date from the baseline through this review.`;
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[10]);
        return !target || target < reviewDate || target > nextReview;
      });
      if (invalidOpenDates.length)
        return zh ? `仍開放的家庭醫療資訊第 ${invalidOpenDates.map((row) => row.line).join("、")} 行需要介於本次核對日與下一核點的目標日。` : `Open medical-information line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[10]);
        return !outcome || outcome < baselineDate || outcome > reviewDate;
      });
      if (invalidClosedDates.length)
        return zh ? `已核對、完成或不適用的家庭醫療資訊第 ${invalidClosedDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的結果日。` : `Closed medical-information line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an outcome date from the baseline through this review.`;

      const missingLayers = recordRows.filter((row) => row.parts[1].length < 8 || row.parts[2].length < 12 || row.parts[3].length < 18 || row.parts[4].length < 12 || row.parts[5].length < 10 || row.parts[6].length < 10 || row.parts[7].length < 12 || row.parts[8].length < 10 || row.parts[9].length < 4);
      if (missingLayers.length)
        return zh ? `家庭醫療資訊第 ${missingLayers.map((row) => row.line).join("、")} 行需要真實的用途、負責來源、受保護比對、版本、存取／保管、狀態、交接／結果、審查來源與負責角色。` : `Medical-information line ${missingLayers.map((row) => row.line).join(", ")} needs a real purpose, responsible source, protected match, version, access/custody, status, handoff/result, review route and owner.`;

      const reviewedWithoutEvidence = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[9]) return false;
        const evidence = row.parts.slice(2, 9).join(" ");
        const sourceOk = zh ? /(?:醫療院所|院所|醫師|藥師|健保|保險|病歷窗口|官方)/.test(row.parts[2]) : /(?:provider|physician|pharmacist|health plan|medical-records office|official)/i.test(row.parts[2]);
        const matchOk = zh ? /(?:受保護|本人|比對|證據)/.test(row.parts[3]) : /(?:protected|person|match|evidence)/i.test(row.parts[3]);
        const versionOk = zh ? /(?:目前|版本|病歷|清單|通知)/.test(row.parts[4]) : /(?:current|version|record|list|notice)/i.test(row.parts[4]);
        const accessOk = zh ? /(?:開啟|存取|可取得|保管|接收人)/.test(row.parts[5]) : /(?:opened|access|available|custody|recipient)/i.test(row.parts[5]);
        const statusOk = zh ? /(?:醫療|院所|醫師|藥師|藥事|健保|給付|病歷|存取程序)/.test(row.parts[6]) : /(?:clinical|provider|prescriber|pharmac|plan|coverage|record|access process)/i.test(row.parts[6]);
        const actionOk = zh ? /(?:核對|保管|重新|改變|交接|行動)/.test(row.parts[7]) : /(?:reviewed|custody|reopen|change|handoff|action)/i.test(row.parts[7]);
        const routeOk = zh ? /(?:醫療院所|院所|醫師|藥師|健保|保險|病歷窗口|合格)/.test(row.parts[8]) : /(?:provider|physician|pharmacist|health plan|medical-records office|qualified)/i.test(row.parts[8]);
        const unresolved = zh ? /(?:等待|未知|未解|未核對|矛盾|缺少)/.test(evidence) : /(?:pending|unknown|unresolved|not checked|conflict|missing)/i.test(evidence);
        return !sourceOk || !matchOk || !versionOk || !accessOk || !statusOk || !actionOk || !routeOk || unresolved;
      });
      if (reviewedWithoutEvidence.length)
        return zh ? `完成核對的第 ${reviewedWithoutEvidence.map((row) => row.line).join("、")} 行必須連結負責醫療來源、受保護本人比對、目前版本、實際存取、狀態、交接或重查條件及負責審查來源，且不能仍有未解差異。` : `Completed medical-information line ${reviewedWithoutEvidence.map((row) => row.line).join(", ")} must link a responsible health source, protected person match, current version, actual access, status, handoff or reopen rule and responsible review route with no unresolved gap.`;

      const actionClaimingCompletion = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[7]) return false;
        return zh ? /(?:已完成|已生效|更正完成|轉移完成|授權完成|院所確認完成)/.test(row.parts[7]) || !/(?:已記錄|已送出|已提出|已預約|等待|仍待|尚待|待取得)/.test(row.parts[7]) : /(?:confirmed complete|completed|effective|correction complete|transfer complete|authorization complete|provider confirmed)/i.test(row.parts[7]) || !/(?:recorded|submitted|requested|scheduled|pending|awaiting|remains)/i.test(row.parts[7]);
      });
      if (actionClaimingCompletion.length)
        return zh ? `已交接或行動但等待負責結果的第 ${actionClaimingCompletion.map((row) => row.line).join("、")} 行必須保持開放，不能把送出、預約、付款或家庭轉述寫成完成。` : `Action-recorded line ${actionClaimingCompletion.map((row) => row.line).join(", ")} must remain open and cannot turn a submission, request, appointment, payment or household handoff into completion.`;

      const conflictWithoutRoute = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[8]) return false;
        const combined = [row.parts[4], row.parts[6], row.parts[7], row.parts[8], row.parts[9]].join(" ");
        const conflict = zh ? /(?:矛盾|不同|差異|錯誤|用藥安全|授權|存取|版本)/.test(combined) : /(?:conflict|different|discrepancy|error|medication safety|authorization|access|version)/i.test(combined);
        const route = zh ? /(?:醫療院所|院所|醫師|藥師|健保|保險|病歷窗口|合格)/.test(combined) : /(?:provider|physician|pharmacist|health plan|medical-records office|qualified)/i.test(combined);
        return !conflict || !route;
      });
      if (conflictWithoutRoute.length)
        return zh ? `矛盾列第 ${conflictWithoutRoute.map((row) => row.line).join("、")} 行必須寫出身分、版本、存取、用藥安全或授權差異，以及負責醫療院所、醫師、藥師、保險或合格審查來源。` : `Conflict line ${conflictWithoutRoute.map((row) => row.line).join(", ")} must name the identity, version, access, medication-safety or authorization conflict and the responsible provider, physician, pharmacist, health plan or qualified review route.`;

      const completedWithoutResult = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[10]) return false;
        const result = [row.parts[7], row.parts[8]].join(" ");
        const observed = zh ? /(?:負責來源|醫療院所|院所|醫師|藥師|健保|保險|病歷窗口).*(?:結果|病歷|通知|確認).*(?:收到|開啟|觀察|記錄)/.test(result) : /(?:(?:responsible source|provider|physician|pharmacist|health plan|medical-records office) (?:result|record|notice|confirmation)).*(?:received|opened|observed|recorded)/i.test(result);
        const custody = zh ? /(?:保管|原件|目前版本|下次照護|重新開啟)/.test(result) : /(?:custody|original|current version|next care|reopen)/i.test(result);
        const unresolved = zh ? /(?:等待|仍待|尚待|未解|未知)/.test(result) : /(?:pending|awaiting|unresolved|unknown)/i.test(result);
        return !observed || !custody || unresolved;
      });
      if (completedWithoutResult.length)
        return zh ? `完成結果的第 ${completedWithoutResult.map((row) => row.line).join("、")} 行必須記錄已收到或觀察的負責來源結果、目前版本保管與下次照護或重開條件。` : `Completed result line ${completedWithoutResult.map((row) => row.line).join(", ")} must record an observed responsible-source result, current-version custody and the next-care or reopen condition.`;

      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[11] === statusOrder[11] && !(zh ? /(?:重新開啟|重新檢視|如果|當.*時|院所|照護|授權|用藥|轉診|給付.*改變)/.test([row.parts[7], row.parts[8]].join(" ")) : /(?:reopen|review again|if |when |after |provider|care|authority|medication|referral|coverage.*change)/i.test([row.parts[7], row.parts[8]].join(" "))));
      if (notApplicableWithoutTrigger.length)
        return zh ? `不適用的第 ${notApplicableWithoutTrigger.map((row) => row.line).join("、")} 行必須記錄目前原因，以及院所、照護、授權、用藥、轉診或給付改變時的重開事件。` : `Not-applicable line ${notApplicableWithoutTrigger.map((row) => row.line).join(", ")} must state the current reason and the provider, care, authority, medication, referral or coverage change that reopens it.`;

      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return zh ? "偵測到可能的完整電話、Email、病歷、會員、保單、理賠、處方或其他長數字識別資料。請改用安全證據代號。" : "A possible full phone, email, medical-record, member, policy, claim, prescription or other long numeric identifier was detected. Use a safe evidence pointer.";
      if (/password|passphrase|passcode|access code|recovery code|verification code|login credential|full address|street address|patient name\s*[:=]|person name\s*[:=]|provider name\s*[:=]|date of birth\s*[:=]|(?:mrn|medical record number|member number|policy number|claim number|prescription number)\s*[:=]|social security|ssn\s*[:=]|diagnosis\s*[:=]|condition\s*[:=]|symptom\s*[:=]|allerg(?:y|ies)\s*[:=]|medication name\s*[:=]|drug name\s*[:=]|medicine name\s*[:=]|dose\s*[:=]|dosage\s*[:=]|\b\d+(?:\.\d+)?\s*(?:mg|mcg|ml)\b|lab (?:value|result content)|imaging (?:report|result) content|procedure content|treatment plan|discharge instruction content|mental health record|counseling record|reproductive health|genetic information|vaccination detail|authorization content|consent signature|payment card|bank account|private message|correspondence|完整地址|病人姓名\s*[:：]|本人姓名\s*[:：]|院所名稱\s*[:：]|出生日期\s*[:：]|病歷號\s*[:：]|會員號\s*[:：]|保單號\s*[:：]|理賠號\s*[:：]|處方號\s*[:：]|身分證號\s*[:：]|診斷\s*[:：]|病況\s*[:：]|症狀\s*[:：]|過敏\s*[:：]|藥名\s*[:：]|用藥名稱\s*[:：]|劑量\s*[:：]|檢驗數值|檢驗結果內容|影像報告內容|處置內容|治療計畫|出院指示內容|心理健康紀錄|諮商紀錄|生殖健康資料|基因資料|疫苗明細|授權內容|同意書簽名|銀行帳號|信用卡|登入密碼|驗證碼|私人訊息|通信內容/i.test(privacyText))
        return zh ? "偵測到可能的本人身分、院所、地址、診斷、用藥、劑量、檢驗、授權、付款、登入或私人通信內容。請改成安全來源、流程或證據代號。" : "A possible patient identity, provider, address, diagnosis, medication, dose, test, authorization, payment, credential or private correspondence detail was detected.";

      const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[11] === status).length })).filter((item) => item.count > 0);
      if (zh)
        return `${values.review.trim()}｜家庭醫療資訊來源與交接狀態
核對情境：${values.context}
醫療資訊／來源地圖基準：${formatter.format(baselineDate)}
本次家庭醫療資訊核對：${formatter.format(reviewDate)}
下一次來源、交接或負責結果核點：${formatter.format(nextReview)}
仍開放的來源、本人比對、版本、存取、交接或負責結果列：${openRows.length} 筆
已核對、完成或不適用列：${closedRows.length} 筆
狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}

健康存摺、院所、藥事、檢驗影像、轉診、給付與照護來源地圖：${values.basis.trim()}

${lines("有版本的家庭醫療資訊來源與交接證據", recordRows.map((row) => `${row.parts[0]}｜本人／資訊用途：${row.parts[1]}｜負責醫療來源／適用範圍：${row.parts[2]}｜受保護本人比對／來源核對：${row.parts[3]}｜目前病歷／清單／通知版本：${row.parts[4]}｜存取／保管／接收人：${row.parts[5]}｜醫療／藥事／給付／官方狀態來源：${row.parts[6]}｜家庭交接／行動／實際結果：${row.parts[7]}｜矛盾／用藥安全／授權／審查來源：${row.parts[8]}｜負責角色：${row.parts[9]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[10]) as Date)}｜狀態：${row.parts[11]}`))}

受保護院所、健保、藥事、病歷、授權與核對歷程位置：${values.storage.trim()}

這份輸出只是家庭來源與交接索引，不是本人身分、診斷、病歷、用藥、檢驗、影像、轉診、給付、授權或照護結果證明。它不登入健康存摺、院所、藥局或保險系統，不讀取、建立、上傳、更正或轉移正式病歷，不判讀檢驗影像、不做診斷或檢傷、不核對或調整藥物與劑量、不替任何人授權照護，也不預約、送件、付款、聯絡機構或計算醫療、保險、申訴或法律期限。真實行動、緊急狀況與結果請直接使用目前醫療院所、醫師、藥師、健保／保險來源、官方程序與合格專業人員。`;
      return `${values.review.trim()} — household medical-information source and handoff status
Review context: ${values.context}
Medical-information/source-map baseline: ${formatter.format(baselineDate)}
Current household medical-information review: ${formatter.format(reviewDate)}
Next source, handoff or responsible-result checkpoint: ${formatter.format(nextReview)}
Open source, person-match, version, access, handoff or responsible-result rows: ${openRows.length}
Reviewed, completed or not-applicable rows: ${closedRows.length}
Status count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}

Patient-portal, provider, pharmacy, test, imaging, referral, coverage and care source map: ${values.basis.trim()}

${lines("Versioned household medical-information source and handoff evidence", recordRows.map((row) => `${row.parts[0]} — person/information purpose: ${row.parts[1]} — responsible health source/scope: ${row.parts[2]} — protected person match/source check: ${row.parts[3]} — current record/list/notice version: ${row.parts[4]} — access/custody/recipient: ${row.parts[5]} — clinical/pharmacy/coverage/official status source: ${row.parts[6]} — household handoff/action/observed result: ${row.parts[7]} — conflict/medication-safety/authorization/review route: ${row.parts[8]} — owner: ${row.parts[9]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[10]) as Date)} — status: ${row.parts[11]}`))}

Protected provider, plan, pharmacy, record, authorization and review-history location: ${values.storage.trim()}

This output is a household source and handoff index, not proof of identity, diagnosis, medical record, medication, test, imaging, referral, coverage, authorization or a care result. It does not sign in to a patient portal, provider, pharmacy or health-plan system; read, create, upload, amend or transfer an official record; interpret a test or image; diagnose or triage; reconcile, recommend, change, stop or repeat a medication or dose; grant caregiver authority; book care, submit a form, pay, contact an organization; or calculate medical, plan, appeal or legal deadlines. Use the current provider, physician, pharmacist, health-plan or official process and qualified professional for every real action, emergency and result.`;
    },
  };
};

const caregiverHandoffDefinition = (locale: Locale): Definition => {
  const zh = locale === "zh-TW";
  const statusOrder = zh
    ? [
        "已記錄照護者交接用途，等待確認照護情境",
        "已記錄照護情境，等待確認負責照護來源",
        "已記錄負責照護來源，等待受保護本人比對",
        "已記錄受保護本人比對，等待目前作息、計畫或指示版本",
        "已記錄目前作息、計畫或指示版本，等待接收人權限與最少範圍核對",
        "已記錄接收人權限與最少範圍，等待實際存取與保管核對",
        "已測試存取與保管，等待照護、生活、服務與升級來源",
        "已映射照護、生活、服務與升級來源，等待照護者說明或接受結果",
        "身分、版本、權限、指示或安全矛盾，等待院所、服務單位或合格來源審查",
        "已核對來源、受保護本人比對、版本、權限、存取與交接",
        "已收到負責交接結果，記錄保管與下次照護條件",
        "不適用，已記錄原因與重新開啟事件",
      ]
    : [
        "Caregiver-handoff purpose recorded—care context pending",
        "Care context recorded—responsible care source pending",
        "Responsible care source recorded—protected person match pending",
        "Protected person match recorded—current routine, plan or instruction version pending",
        "Current routine, plan or instruction version recorded—recipient authority and minimum scope pending",
        "Recipient authority and minimum scope recorded—actual access and custody pending",
        "Access and custody tested—care, logistics, service and escalation sources pending",
        "Care, logistics, service and escalation sources mapped—caregiver briefing or acceptance pending",
        "Identity, version, authority, instruction or safety conflict—provider, agency or qualified review pending",
        "Source, protected person match, version, authority, access and handoff reviewed",
        "Responsible handoff result received—custody and next-care condition recorded",
        "Not applicable—reason and reopen event recorded",
      ];

  const defaultRecords = zh
    ? `CARE-A | 被照顧者 A 的目前居家照護交接；一般照護時段 | 目前服務單位協調角色、院所照顧計畫來源與家庭作息來源分開 | 受保護本人與目前服務來源已比對；證據 CARE-A-MATCH2；核對 2026-08-26 | 目前照顧計畫與家庭作息版本已於受保護來源開啟；未複製照護內容 | 接收者角色、最少資訊範圍與本人參與來源已由負責服務單位核對 | 預定照護者已開啟受保護目前版本；臨時存取、保管與歸還流程已測試 | 照顧計畫、家庭生活、目前服務與緊急升級來源已分開映射 | 本次來源、接收範圍、實際存取與交接已核對；院所、服務單位與合格審查路徑已映射；照護者、版本、權限或服務改變時重新開啟 | 家庭照護協調角色 | 2026-08-26 | 已核對來源、受保護本人比對、版本、權限、存取與交接
RELIEF-A | 被照顧者 A 的暫代或喘息交接；短期替代照護時段 | 目前服務單位、個案管理角色、院所來源與家庭生活來源分開 | 受保護本人與目前替代照護來源已比對；證據 CARE-A-RELIEF2；核對 2026-08-26 | 目前照顧計畫、服務通知與家庭作息版本已於受保護來源觀察 | 替代照護者角色與最少資訊範圍已由負責服務單位核對；本人參與留在受保護來源 | 預定接收角色可開啟必要受保護來源；保管與歸還流程已測試 | 照護、家庭生活、喘息服務、接送與緊急升級來源已映射 | 已記錄照護者說明；接受結果仍待服務單位協調角色與合格來源取得 | 家庭替代照護協調角色 | 2026-09-10 | 已映射照護、生活、服務與升級來源，等待照護者說明或接受結果`
    : `CARE-A | Care person A current home-care handoff; regular care window | Current agency coordinator, provider care-plan source and household routine source remain separate | Protected person and current service source matched; evidence CARE-A-MATCH2; checked 2026-08-26 | Current care-plan and household-routine versions opened in protected sources; care content not copied | Recipient role, minimum information scope and care-person participation source reviewed by responsible agency | Intended caregiver opened the protected current version; temporary access, custody and return route tested | Care-plan, household logistics, current service and emergency escalation sources mapped separately | Current source, recipient scope, actual access and handoff reviewed; provider, agency and qualified review routes mapped; reopen when caregiver, version, authority or service changes | Household care-coordination role | 2026-08-26 | Source, protected person match, version, authority, access and handoff reviewed
RELIEF-A | Care person A substitute or respite handoff; short-term relief window | Current service agency, case manager, provider source and household logistics source remain separate | Protected person and current relief-care source matched; evidence CARE-A-RELIEF2; checked 2026-08-26 | Current care-plan, service-notice and household-routine versions observed in protected sources | Substitute caregiver role and minimum information scope reviewed by responsible agency; participation stays in protected source | Intended recipient can open necessary protected sources; custody and return route tested | Care, household logistics, respite service, transport and emergency escalation sources mapped | Caregiver briefing recorded; acceptance result remains pending with the agency coordinator and qualified route | Household relief-care coordination role | 2026-09-10 | Care, logistics, service and escalation sources mapped—caregiver briefing or acceptance pending`;

  return {
    intro: zh
      ? "用安全代號分開被照顧者參與、負責照護來源、目前版本、接收人權限、實際存取、生活服務與接受結果。工具不保存照護內容，也不授權、申請服務或產生照護指示。"
      : "Separate care-person participation, responsible sources, current versions, recipient authority, actual access, logistics and acceptance results with safe codes. The tool never stores care content, grants authority, applies for services or generates care instructions.",
    fields: [
      text(
        "review",
        zh ? "照護者交接私人核對代號" : "Private caregiver-handoff review reference",
        zh ? "只用安全家庭代號；不要輸入姓名、地址、診斷、用藥、照護步驟、詳細時段、權限文件或登入資料。" : "Use a safe household code. Do not enter names, addresses, diagnoses, medications, care steps, detailed schedules, authority documents or login details.",
        "CAREGIVER-HANDOFF-2026-A",
      ),
      {
        name: "context",
        label: zh ? "照護者交接情境" : "Caregiver-handoff context",
        type: "select",
        options: zh
          ? ["第一次照護交接", "家人暫代或喘息安排", "出院或照護轉換", "居家服務單位或人員更換", "兒少、高齡、身心障礙或其他依賴支持交接", "回診、日照或服務接送", "作息、照顧計畫或服務改變", "身分、版本、權限、指示或安全矛盾"]
          : ["First caregiver handoff", "Temporary substitute or respite", "Discharge or care transition", "Home-care agency or worker change", "Child, older-adult, disability or other dependent-support handoff", "Appointment, day-service or care transport", "Routine, care-plan or service change", "Identity, version, authority, instruction or safety conflict"],
      },
      { name: "baselineDate", label: zh ? "照護者交接／來源地圖基準日" : "Caregiver-handoff and source-map baseline date", type: "date", value: "2026-08-22" },
      { name: "reviewDate", label: zh ? "本次照護者交接核對日" : "Current caregiver-handoff review date", type: "date", value: "2026-08-26" },
      { name: "nextReview", label: zh ? "下一次來源、交接或接受結果核點" : "Next source, handoff or acceptance-result checkpoint", type: "date", value: "2026-09-10" },
      text(
        "basis",
        zh ? "院所、長照、服務單位、家庭生活與緊急升級來源地圖" : "Provider, care-program, agency, household-logistics and emergency-escalation source map",
        zh ? "只放安全來源或證據代號；本人、照顧計畫、權限、地址、行程與照護內容留在受保護來源。" : "Use safe source or evidence IDs only. Keep identity, care plans, authority, addresses, schedules and care content in protected sources.",
        "PROVIDER-PLAN-S1; AGENCY-S2; CASE-ROUTE-C1; HOUSEHOLD-LOGISTICS-H1; PROTECTED-CARE-A",
      ),
      {
        name: "records",
        label: zh ? "有版本的照護者交接來源、授權與接受狀態列" : "Versioned caregiver-handoff source, authorization and acceptance rows",
        type: "textarea",
        help: zh ? "每行：ID｜安全本人代號、交接目的與照護情境｜負責院所、服務單位、個案管理、方案或家庭來源與範圍｜受保護本人比對與來源核對日 YYYY-MM-DD｜目前作息、計畫或指示版本｜接收者權限、最少資訊範圍與本人參與｜實際存取、保管與歸還｜生活、照護、服務與緊急升級來源｜說明、照護者接受、實際結果、矛盾與負責審查路徑｜負責角色｜目標或結果日期 YYYY-MM-DD｜十二種指定狀態之一。最多 14 行。" : "One line: ID | safe care-person alias, purpose and context | responsible provider, agency, case-manager, program or household source and scope | protected person-match evidence plus source checked date YYYY-MM-DD | current routine, plan or instruction version | recipient authority, minimum scope and participation | actual access, custody and return | care, logistics, service and escalation sources | briefing, caregiver acceptance, observed result, conflict and responsible review route | owner role | target or outcome date YYYY-MM-DD | one of the twelve listed statuses. Maximum 14 lines.",
        value: defaultRecords,
      },
      text(
        "storage",
        zh ? "受保護照顧計畫、權限、服務、存取與交接歷程位置" : "Protected care-plan, authority, service, access and handoff-history location",
        zh ? "只寫保管流程或容器代號，不要貼本人、照護、位置、權限、付款或登入內容。" : "Name a custody process or container, not identity, care, location, authority, payment or login content.",
        zh ? "家庭紀錄／照護／CAREGIVER-HANDOFF-2026-A／受保護來源" : "Household records / care / CAREGIVER-HANDOFF-2026-A / protected sources",
      ),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!baselineDate || !reviewDate || !nextReview)
        return zh ? "請輸入有效的基準日、本次核對日與下一次核點日期。" : "Enter valid baseline, review and next-checkpoint dates.";
      if (baselineDate > reviewDate)
        return zh ? "照護者交接基準日不能晚於本次核對日。" : "The caregiver-handoff baseline cannot be later than the current review.";
      if (nextReview < reviewDate)
        return zh ? "下一次來源、交接或接受結果核點不能早於本次照護者交接核對日。" : "The next source, handoff or acceptance-result checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 12 || values.storage.trim().length < 10)
        return zh ? "請提供安全的照護來源地圖與受保護保管位置代號。" : "Provide a safe care-source map and protected storage-process label.";

      const rows = values.records.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
      if (!rows.length || rows.length > 14)
        return zh ? "請輸入 1 至 14 行照護者交接來源與授權狀態。" : "Enter 1 to 14 caregiver-handoff source and authorization rows.";
      const recordRows = rows.map((row, index) => ({ line: index + 1, parts: row.split("|").map((part) => part.trim()) }));
      const malformed = recordRows.filter((row) => row.parts.length !== 12 || row.parts.some((part) => !part));
      if (malformed.length)
        return zh ? `照護者交接第 ${malformed.map((row) => row.line).join("、")} 行必須剛好有 12 個非空白欄位。` : `Caregiver-handoff line ${malformed.map((row) => row.line).join(", ")} must contain exactly 12 non-empty fields.`;
      const ids = recordRows.map((row) => row.parts[0].toUpperCase());
      if (new Set(ids).size !== ids.length)
        return zh ? "每一行照護者交接紀錄都需要唯一 ID。" : "Every caregiver-handoff row needs a unique ID.";
      const invalidStatuses = recordRows.filter((row) => !statusOrder.includes(row.parts[11]));
      if (invalidStatuses.length)
        return zh ? `照護者交接第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用十二種指定狀態之一。` : `Caregiver-handoff line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the twelve exact statuses.`;

      const openRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) < 9);
      const closedRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) >= 9);
      const sourceDateOf = (textValue: string) => strictIsoDate(textValue.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "");
      const invalidSourceDates = recordRows.filter((row) => {
        const checked = sourceDateOf(row.parts[3]);
        return !checked || checked < baselineDate || checked > reviewDate;
      });
      if (invalidSourceDates.length)
        return zh ? `照護者交接第 ${invalidSourceDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的受保護來源核對日。` : `Caregiver-handoff line ${invalidSourceDates.map((row) => row.line).join(", ")} needs a protected-source checked date from the baseline through this review.`;
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[10]);
        return !target || target < reviewDate || target > nextReview;
      });
      if (invalidOpenDates.length)
        return zh ? `仍開放的照護者交接第 ${invalidOpenDates.map((row) => row.line).join("、")} 行需要介於本次核對日與下一核點的目標日。` : `Open caregiver-handoff line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[10]);
        return !outcome || outcome < baselineDate || outcome > reviewDate;
      });
      if (invalidClosedDates.length)
        return zh ? `已核對、完成或不適用的照護者交接第 ${invalidClosedDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的結果日。` : `Closed caregiver-handoff line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an outcome date from the baseline through this review.`;

      const missingLayers = recordRows.filter((row) => row.parts[1].length < 8 || row.parts[2].length < 12 || row.parts[3].length < 18 || row.parts[4].length < 12 || row.parts[5].length < 12 || row.parts[6].length < 10 || row.parts[7].length < 12 || row.parts[8].length < 12 || row.parts[9].length < 4);
      if (missingLayers.length)
        return zh ? `照護者交接第 ${missingLayers.map((row) => row.line).join("、")} 行需要真實的目的、負責來源、受保護本人比對、版本、權限範圍、存取保管、生活服務來源、說明／接受／結果與負責角色。` : `Caregiver-handoff line ${missingLayers.map((row) => row.line).join(", ")} needs a real purpose, responsible source, protected person match, version, authority scope, access/custody, care and logistics sources, briefing/acceptance/result and owner.`;

      const reviewedWithoutEvidence = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[9]) return false;
        const evidence = row.parts.slice(2, 9).join(" ");
        const sourceOk = zh ? /(?:院所|服務單位|個案管理|長照|照顧計畫|家庭來源)/.test(row.parts[2]) : /(?:provider|agency|case manager|care program|care-plan|household source)/i.test(row.parts[2]);
        const matchOk = zh ? /(?:受保護|本人|比對|證據)/.test(row.parts[3]) : /(?:protected|person|match|evidence)/i.test(row.parts[3]);
        const versionOk = zh ? /(?:目前|版本|作息|計畫|指示)/.test(row.parts[4]) : /(?:current|version|routine|plan|instruction)/i.test(row.parts[4]);
        const authorityOk = zh ? /(?:接收|權限|範圍|本人參與|角色)/.test(row.parts[5]) : /(?:recipient|authority|scope|participation|role)/i.test(row.parts[5]);
        const accessOk = zh ? /(?:開啟|存取|保管|歸還|可取得)/.test(row.parts[6]) : /(?:opened|access|custody|return|available)/i.test(row.parts[6]);
        const sourcesOk = zh ? /(?:照護|照顧計畫|生活|服務|升級|緊急)/.test(row.parts[7]) : /(?:care|care-plan|logistics|service|escalation|emergency)/i.test(row.parts[7]);
        const handoffOk = zh ? /(?:核對|交接|重新開啟|改變)/.test(row.parts[8]) : /(?:reviewed|handoff|reopen|change)/i.test(row.parts[8]);
        const routeOk = zh ? /(?:院所|服務單位|個案管理|長照|合格)/.test(row.parts[8]) : /(?:provider|agency|case manager|care program|qualified)/i.test(row.parts[8]);
        const unresolved = zh ? /(?:等待|仍待|尚待|未解|未知|矛盾|缺少)/.test(evidence) : /(?:pending|awaiting|unresolved|unknown|conflict|missing)/i.test(evidence);
        return !sourceOk || !matchOk || !versionOk || !authorityOk || !accessOk || !sourcesOk || !handoffOk || !routeOk || unresolved;
      });
      if (reviewedWithoutEvidence.length)
        return zh ? `完成核對的第 ${reviewedWithoutEvidence.map((row) => row.line).join("、")} 行必須連結負責照護來源、受保護本人比對、目前版本、接收權限與最少範圍、實際存取、生活服務來源、交接／重開及負責審查路徑，且不能仍有未解差異。` : `Reviewed caregiver-handoff line ${reviewedWithoutEvidence.map((row) => row.line).join(", ")} must link a responsible care source, protected person match, current version, recipient authority and minimum scope, actual access, care and logistics sources, handoff or reopen rule and responsible review route with no unresolved gap.`;

      const mappedClaimingCompletion = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[7]) return false;
        const action = row.parts[8];
        const actionPresent = zh ? /(?:說明|簡報|交接|接受)/.test(action) : /(?:briefing|briefed|handoff|acceptance)/i.test(action);
        const stillOpen = zh ? /(?:等待|仍待|尚待|待取得|未接受)/.test(action) : /(?:pending|awaiting|remains|not accepted)/i.test(action);
        const completionClaim = zh ? /(?:已完成照護|已接受完成|服務完成|交接完成)/.test(action) : /(?:care completed|acceptance complete|service completed|handoff completed)/i.test(action);
        return !actionPresent || !stillOpen || completionClaim;
      });
      if (mappedClaimingCompletion.length)
        return zh ? `等待照護者說明或接受結果的第 ${mappedClaimingCompletion.map((row) => row.line).join("、")} 行必須記錄說明或接受行動並保持等待，不能把來源映射或家庭轉述寫成完成。` : `Briefing-or-acceptance-pending line ${mappedClaimingCompletion.map((row) => row.line).join(", ")} must record a briefing or acceptance action, stay pending and not turn a source map or household report into completion.`;

      const conflictWithoutRoute = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[8]) return false;
        const combined = row.parts.slice(4, 9).join(" ");
        const conflict = zh ? /(?:身分|版本|權限|指示|安全|矛盾|不同|差異|錯誤)/.test(combined) : /(?:identity|version|authority|instruction|safety|conflict|different|discrepancy|error)/i.test(combined);
        const route = zh ? /(?:院所|服務單位|個案管理|長照|合格)/.test(combined) : /(?:provider|agency|case manager|care program|qualified)/i.test(combined);
        return !conflict || !route;
      });
      if (conflictWithoutRoute.length)
        return zh ? `矛盾列第 ${conflictWithoutRoute.map((row) => row.line).join("、")} 行必須寫出身分、版本、權限、指示或安全差異，以及負責院所、服務單位、個案管理或合格審查來源。` : `Conflict line ${conflictWithoutRoute.map((row) => row.line).join(", ")} must name the identity, version, authority, instruction or safety conflict and the responsible provider, agency, case manager or qualified review route.`;

      const completedWithoutResult = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[10]) return false;
        const result = [row.parts[6], row.parts[8]].join(" ");
        const observed = zh ? /(?:負責來源|院所|服務單位|個案管理|長照).*(?:結果|回覆|確認|交接).*(?:收到|觀察|記錄|開啟)/.test(result) : /(?:(?:responsible source|provider|agency|case manager|care program) (?:result|response|confirmation|handoff)).*(?:received|observed|recorded|opened)/i.test(result);
        const custody = zh ? /(?:保管|歸還|目前版本|下次照護|重新開啟)/.test(result) : /(?:custody|return|current version|next care|reopen)/i.test(result);
        const unresolved = zh ? /(?:等待|仍待|尚待|未解|未知)/.test(result) : /(?:pending|awaiting|unresolved|unknown)/i.test(result);
        return !observed || !custody || unresolved;
      });
      if (completedWithoutResult.length)
        return zh ? `完成結果的第 ${completedWithoutResult.map((row) => row.line).join("、")} 行必須記錄已收到或觀察的負責交接結果、目前版本保管與下次照護或重開條件。` : `Completed handoff-result line ${completedWithoutResult.map((row) => row.line).join(", ")} must record an observed responsible handoff result, current-version custody and the next-care or reopen condition.`;

      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[11] === statusOrder[11] && !(zh ? /(?:重新開啟|重新檢視|如果|當.*時|照護|院所|服務|權限|家庭.*改變)/.test(row.parts[8]) : /(?:reopen|review again|if |when |after |care|provider|agency|authority|household.*change)/i.test(row.parts[8])));
      if (notApplicableWithoutTrigger.length)
        return zh ? `不適用的第 ${notApplicableWithoutTrigger.map((row) => row.line).join("、")} 行必須記錄目前原因，以及照護、院所、服務、權限或家庭改變時的重開事件。` : `Not-applicable line ${notApplicableWithoutTrigger.map((row) => row.line).join(", ")} must state the current reason and the care, provider, agency, authority or household change that reopens it.`;

      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return zh ? "偵測到可能的完整電話、Email、案件、會員、保險或其他長數字識別資料。請改用安全證據代號。" : "A possible full phone, email, case, member, insurance or other long numeric identifier was detected. Use a safe evidence pointer.";
      if (/password|passphrase|passcode|access code|door code|alarm code|security code|recovery code|verification code|login credential|full address|street address|care-recipient name\s*[:=]|patient name\s*[:=]|person name\s*[:=]|provider name\s*[:=]|agency name\s*[:=]|date of birth\s*[:=]|diagnosis\s*[:=]|condition\s*[:=]|symptom\s*[:=]|allerg(?:y|ies)\s*[:=]|medication name\s*[:=]|drug name\s*[:=]|medicine name\s*[:=]|dose\s*[:=]|dosage\s*[:=]|\b\d+(?:\.\d+)?\s*(?:mg|mcg|ml)\b|feeding (?:instruction|detail)|swallowing (?:instruction|detail)|transfer (?:instruction|step)|lifting (?:instruction|step)|mobility (?:instruction|detail)|toileting (?:instruction|detail)|bathing (?:instruction|detail)|wound (?:instruction|detail)|device instruction|behavior(?:al)? (?:plan|instruction|detail)|de-escalation instruction|mental health|care plan content|treatment plan|emergency instruction content|exact location|detailed location|location\s*[:=]|exact schedule|detailed schedule|schedule\s*[:=]|case number\s*[:=]|member number\s*[:=]|policy number\s*[:=]|insurance number\s*[:=]|authorization content|authority document|consent signature|payment card|bank account|private message|correspondence|完整地址|被照顧者姓名\s*[:：]|病人姓名\s*[:：]|本人姓名\s*[:：]|院所名稱\s*[:：]|服務單位名稱\s*[:：]|出生日期\s*[:：]|診斷\s*[:：]|病況\s*[:：]|症狀\s*[:：]|過敏\s*[:：]|藥名\s*[:：]|用藥名稱\s*[:：]|劑量\s*[:：]|餵食指示|吞嚥指示|移位步驟|攙扶步驟|行動指示|如廁細節|沐浴細節|傷口指示|管路指示|輔具指示|行為處理|降溫指示|心理健康內容|照顧計畫內容|治療計畫|緊急指示內容|精確位置|詳細地點|位置\s*[:：]|精確行程|詳細行程|行程\s*[:：]|門鎖密碼|保全密碼|案件編號\s*[:：]|會員號\s*[:：]|保單號\s*[:：]|保險號\s*[:：]|授權內容|權限文件|同意書簽名|銀行帳號|信用卡|登入密碼|驗證碼|私人訊息|通信內容/i.test(privacyText))
        return zh ? "偵測到可能的被照顧者身分、院所、地址、診斷、用藥、劑量、餵食、移位、如廁、行為、位置、行程、門禁、案件、授權、付款、登入或私人通信內容。請改成安全來源、流程或證據代號。" : "A possible care-recipient identity, provider, address, diagnosis, medication, dose, feeding, mobility, toileting, behavior, location, schedule, access, case, authority, payment, credential or private correspondence detail was detected.";

      const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[11] === status).length })).filter((item) => item.count > 0);
      if (zh)
        return `${values.review.trim()}｜照護者交接來源與授權狀態
交接情境：${values.context}
照護者交接／來源地圖基準：${formatter.format(baselineDate)}
本次照護者交接核對：${formatter.format(reviewDate)}
下一次來源、交接或接受結果核點：${formatter.format(nextReview)}
仍開放的來源、本人比對、版本、權限、存取、交接或接受結果列：${openRows.length} 筆
已核對、完成或不適用列：${closedRows.length} 筆
狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}

院所、長照、服務單位、家庭生活與緊急升級來源地圖：${values.basis.trim()}

${lines("有版本的照護者交接來源、授權與接受證據", recordRows.map((row) => `${row.parts[0]}｜本人／交接目的：${row.parts[1]}｜負責照護來源／範圍：${row.parts[2]}｜受保護本人比對／來源核對：${row.parts[3]}｜目前作息／計畫／指示版本：${row.parts[4]}｜接收者權限／最少範圍／本人參與：${row.parts[5]}｜實際存取／保管／歸還：${row.parts[6]}｜生活／照護／服務／升級來源：${row.parts[7]}｜說明／接受／結果／矛盾／審查來源：${row.parts[8]}｜負責角色：${row.parts[9]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[10]) as Date)}｜狀態：${row.parts[11]}`))}

受保護照顧計畫、權限、服務、存取與交接歷程位置：${values.storage.trim()}

這份輸出只是家庭照護交接來源、權限、存取與接受索引，不是本人身分、照顧計畫、醫療內容、照護指示、法定權限、長照資格、服務承接或照護品質證明。它不登入健康存摺或長照系統，不驗證或授權任何人，不申請、預約、付款、聯絡或追蹤服務，不產生或判讀用藥、餵食、吞嚥、移位、如廁、沐浴、傷口、管路、行為、臨床或緊急指示，也不計算院所、長照、保險、申訴或法律期限。真實決定、緊急狀況與結果請直接使用目前院所、服務單位、個案管理員、官方程序、合格專業人員與所在地緊急服務。`;
      return `${values.review.trim()} — caregiver-handoff source and authorization status
Handoff context: ${values.context}
Caregiver-handoff/source-map baseline: ${formatter.format(baselineDate)}
Current caregiver-handoff review: ${formatter.format(reviewDate)}
Next source, handoff or acceptance-result checkpoint: ${formatter.format(nextReview)}
Open source, person-match, version, authority, access, handoff or acceptance rows: ${openRows.length}
Reviewed, completed or not-applicable rows: ${closedRows.length}
Status count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}

Provider, care-program, agency, household-logistics and emergency-escalation source map: ${values.basis.trim()}

${lines("Versioned caregiver-handoff source, authorization and acceptance evidence", recordRows.map((row) => `${row.parts[0]} — person/handoff purpose: ${row.parts[1]} — responsible care source/scope: ${row.parts[2]} — protected person match/source check: ${row.parts[3]} — current routine/plan/instruction version: ${row.parts[4]} — recipient authority/minimum scope/participation: ${row.parts[5]} — actual access/custody/return: ${row.parts[6]} — care/logistics/service/escalation sources: ${row.parts[7]} — briefing/acceptance/result/conflict/review route: ${row.parts[8]} — owner: ${row.parts[9]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[10]) as Date)} — status: ${row.parts[11]}`))}

Protected care-plan, authority, service, access and handoff-history location: ${values.storage.trim()}

This output is a household caregiver-handoff source, authority, access and acceptance index, not proof of identity, a care plan, clinical content, care instructions, legal authority, program eligibility, service acceptance or care quality. It does not sign in to a patient portal or care system; verify or authorize anyone; apply for, book, pay, contact or track a service; generate or interpret medication, feeding, swallowing, transfer, mobility, toileting, bathing, wound, device, behavioral, clinical or emergency instructions; or calculate provider, program, insurance, appeal or legal deadlines. Use the current provider, agency, case manager, official process, qualified professional and local emergency service for every real decision, emergency and result.`;
    },
  };
};

const homeCareVisitDefinition = (locale: Locale): Definition => {
  const zh = locale === "zh-TW";
  const statusOrder = zh
    ? [
        "已記錄居家照護服務到訪用途，等待確認服務情境",
        "已記錄服務情境，等待確認負責服務單位或方案來源",
        "已記錄負責服務來源，等待受保護本人比對",
        "已記錄受保護本人比對，等待目前照顧計畫、契約或服務授權版本",
        "已記錄目前服務範圍版本，等待服務時段代號、工作角色與本人參與來源",
        "已記錄服務時段代號、工作角色與本人參與來源，等待正式到離場證據",
        "已記錄到離場證據，等待服務範圍與例外觀察",
        "已記錄服務範圍與例外觀察，等待負責服務單位或方案結果",
        "身分、時間、範圍、安全或計費矛盾，等待服務單位、方案或合格來源審查",
        "已核對來源、受保護本人比對、版本、到訪證據與服務結果",
        "已收到負責服務結果，記錄紀錄保管與下次到訪條件",
        "不適用，已記錄原因與重新開啟事件",
      ]
    : [
        "Home-care visit purpose recorded—service context pending",
        "Service context recorded—responsible agency or program source pending",
        "Responsible service source recorded—protected person match pending",
        "Protected person match recorded—current service-plan, contract or authorization version pending",
        "Current service scope version recorded—service window, worker role and participation pending",
        "Service window, worker role and participation recorded—official arrival and departure evidence pending",
        "Arrival and departure evidence recorded—service scope and exception observation pending",
        "Service scope and exception observation recorded—responsible agency or program result pending",
        "Identity, timing, scope, safety or billing conflict—agency, program or qualified review pending",
        "Source, protected person match, version, visit evidence and service result reviewed",
        "Responsible service result received—record custody and next-visit condition recorded",
        "Not applicable—reason and reopen event recorded",
      ];

  const defaultRecords = zh
    ? `VISIT-A | 被照顧者 A 的目前居家服務核對；已授權到訪目的 | 目前居家服務單位、照顧計畫與契約來源；給付來源與家庭觀察分開 | 受保護本人與目前服務來源已比對；證據 CARE-A-VISIT2；核對 2026-08-26 | 已開啟目前服務單位照顧計畫範圍與契約版本；照護內容留在受保護來源 | 服務時段代號 WINDOW-A、指派工作角色與本人參與來源已由負責服務單位核對 | 已觀察正式服務單位到離場證據指標 EVV-A2；時點細節留在負責系統 | 已觀察授權服務範圍結果；未複製照護內容；此版本沒有例外 | 已核對服務單位結果；方案與申訴路徑已映射；服務計畫、工作角色、時段或下次到訪改變時重新開啟 | 家庭服務協調角色 | 2026-08-26 | 已核對來源、受保護本人比對、版本、到訪證據與服務結果
EXCEPTION-A | 被照顧者 A 的居家服務更改、未到或縮短核對；例外追蹤用途 | 目前居家服務單位、長照方案與契約來源；家庭觀察保持分開 | 受保護本人與目前服務來源已比對；證據 CARE-A-EXCEPTION2；核對 2026-08-26 | 已觀察目前照顧計畫範圍、契約與服務授權版本；照護內容留在受保護來源 | 服務時段代號 WINDOW-B、工作角色與本人參與來源已由負責服務單位核對 | 已觀察正式服務單位到離場例外證據指標 EVV-B2；時點與位置細節留在負責系統 | 已用安全證據代號記錄授權範圍例外；照護與事件細節留在受保護來源 | 已向負責服務單位回報例外；服務結果仍待取得；方案、合格審查與申訴路徑已映射 | 家庭服務追蹤角色 | 2026-09-10 | 已記錄服務範圍與例外觀察，等待負責服務單位或方案結果`
    : `VISIT-A | Care person A current in-home service review; authorized visit purpose | Current home-care agency, service-plan and contract sources; payer and household sources remain separate | Protected person and current service source matched; evidence CARE-A-VISIT2; checked 2026-08-26 | Current agency service-plan scope and contract version opened; care details stay protected | Service-window code WINDOW-A, assigned worker role and care-person participation source reviewed by responsible agency | Official agency or EVV visit pointer EVV-A2 observed; timing details remain in the responsible system | Authorized service scope result observed; care details not copied; no exception in this version | Agency service result reviewed; program and complaint routes mapped; reopen when service plan, worker role, window or next visit changes | Household service-coordination role | 2026-08-26 | Source, protected person match, version, visit evidence and service result reviewed
EXCEPTION-A | Care person A changed, missed or shortened in-home service review; exception follow-up purpose | Current home-care agency, program and contract sources; household observation remains separate | Protected person and current service source matched; evidence CARE-A-EXCEPTION2; checked 2026-08-26 | Current service-plan scope, contract and authorization version observed; care details stay protected | Service-window code WINDOW-B, worker role and care-person participation source reviewed by responsible agency | Official agency or EVV arrival and departure exception pointer EVV-B2 observed; timing and location details remain in the responsible system | Authorized scope exception recorded with safe evidence pointer; care and incident details stay in protected source | Exception reported to responsible agency; service response remains pending; program, qualified and complaint routes mapped | Household service-follow-up role | 2026-09-10 | Service scope and exception observation recorded—responsible agency or program result pending`;

  return {
    intro: zh
      ? "用安全代號分開居家服務來源、本人比對、目前契約或照顧計畫版本、服務時段角色、正式到離場證據、家庭觀察、例外與負責結果。工具不是正式服務紀錄、電子到訪驗證、工時、計費、申訴或照護品質系統。"
      : "Separate home-care service sources, protected person match, current plan or contract version, visit role, official arrival/departure evidence, household observation, exceptions and responsible results with safe codes. This is not an official service record, EVV, timesheet, billing, complaint or care-quality system.",
    fields: [
      text(
        "review",
        zh ? "居家照護服務私人核對代號" : "Private home-care service review reference",
        zh ? "只用安全家庭代號；不要輸入姓名、地址、健康或照護內容、工作人員資料、精確時間位置、案件、計費或登入內容。" : "Use a safe household code. Do not enter names, addresses, health or care content, worker details, exact times or locations, case, billing or login data.",
        "HOME-CARE-VISIT-2026-A",
      ),
      {
        name: "context",
        label: zh ? "居家照護服務核對情境" : "Home-care service review context",
        type: "select",
        options: zh
          ? ["第一次服務到訪", "例行居家服務", "服務時段或工作角色改變", "未到、遲到、提早離場或服務縮短", "照顧計畫、契約或服務授權改變", "服務範圍或家庭觀察不同", "安全、事件或緊急升級", "計費、申訴或負責結果追蹤"]
          : ["First in-home service visit", "Routine home-care service", "Service window or worker-role change", "Missed, late, early-departure or shortened visit", "Service-plan, contract or authorization change", "Service-scope or household-observation difference", "Safety, incident or emergency escalation", "Billing, complaint or responsible-result follow-up"],
      },
      { name: "baselineDate", label: zh ? "居家服務來源／版本基準日" : "Home-care service source and version baseline date", type: "date", value: "2026-08-22" },
      { name: "reviewDate", label: zh ? "本次居家照護服務核對日" : "Current home-care service review date", type: "date", value: "2026-08-26" },
      { name: "nextReview", label: zh ? "下一次到訪、例外或負責結果核點" : "Next visit, exception or responsible-result checkpoint", type: "date", value: "2026-09-10" },
      text(
        "basis",
        zh ? "服務單位、方案、契約、照顧計畫、到離場與申訴來源地圖" : "Agency, program, contract, service-plan, visit-evidence and complaint source map",
        zh ? "只放安全來源或證據代號；本人、服務內容、工作人員、到離場精確資料、計費與申訴內容留在負責受保護來源。" : "Use safe source or evidence IDs only. Keep identity, service content, worker data, exact arrival/departure data, billing and complaint content in responsible protected sources.",
        "AGENCY-S1; SERVICE-PLAN-P2; CONTRACT-C2; VISIT-EVIDENCE-E2; PROGRAM-ROUTE-R1; COMPLAINT-ROUTE-Q1",
      ),
      {
        name: "records",
        label: zh ? "有版本的居家服務到離場、範圍、例外與結果狀態列" : "Versioned home-care visit, scope, exception and result rows",
        type: "textarea",
        help: zh ? "每行：ID｜安全本人代號、到訪目的與情境｜負責服務單位、方案、契約來源與範圍｜受保護本人比對與來源核對日 YYYY-MM-DD｜目前照顧計畫、契約或服務授權版本｜服務時段代號、工作角色與本人參與來源｜正式到離場證據指標與家庭觀察｜授權服務範圍結果、例外或事件指標｜溝通、行動、服務單位回覆、矛盾或申訴路徑｜負責角色｜目標或結果日期 YYYY-MM-DD｜十二種指定狀態之一。最多 14 行。" : "One line: ID | safe care-person alias, visit purpose and context | responsible agency, program, contract source and scope | protected person-match evidence plus source checked date YYYY-MM-DD | current service-plan, contract or authorization version | service-window code, worker role and care-person participation source | official arrival/departure evidence pointer and household observation | authorized service-scope result, exception or incident pointer | communication, action, agency response, conflict or complaint route | owner role | target or outcome date YYYY-MM-DD | one of the twelve exact statuses. Maximum 14 lines.",
        value: defaultRecords,
      },
      text(
        "storage",
        zh ? "受保護服務單位、照顧計畫、到離場、例外、申訴與核對歷程位置" : "Protected agency, service-plan, EVV, exception, complaint and review-history location",
        zh ? "只寫保管流程或容器代號，不要貼本人、照護、工作人員、時間位置、計費、案件、申訴、登入或私人內容。" : "Name a custody process or container, not identity, care, worker, timing, location, billing, case, complaint, login or private content.",
        zh ? "家庭紀錄／居家服務／HOME-CARE-VISIT-2026-A／受保護來源" : "Household records / home care / HOME-CARE-VISIT-2026-A / protected sources",
      ),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!baselineDate || !reviewDate || !nextReview)
        return zh ? "請輸入有效的基準日、本次核對日與下一次核點日期。" : "Enter valid baseline, review and next-checkpoint dates.";
      if (baselineDate > reviewDate)
        return zh ? "居家服務來源／版本基準日不能晚於本次核對日。" : "The home-care service baseline cannot be later than the current review.";
      if (nextReview < reviewDate)
        return zh ? "下一次到訪、例外或負責結果核點不能早於本次居家照護服務核對日。" : "The next visit, exception or responsible-result checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 12 || values.storage.trim().length < 10)
        return zh ? "請提供安全的居家服務來源地圖與受保護保管位置代號。" : "Provide a safe home-care service source map and protected storage-process label.";

      const rows = values.records.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
      if (!rows.length || rows.length > 14)
        return zh ? "請輸入 1 至 14 行居家服務到訪、例外與結果狀態。" : "Enter 1 to 14 home-care visit, exception and result rows.";
      const recordRows = rows.map((row, index) => ({ line: index + 1, parts: row.split("|").map((part) => part.trim()) }));
      const malformed = recordRows.filter((row) => row.parts.length !== 12 || row.parts.some((part) => !part));
      if (malformed.length)
        return zh ? `居家服務第 ${malformed.map((row) => row.line).join("、")} 行必須剛好有 12 個非空白欄位。` : `Home-care visit line ${malformed.map((row) => row.line).join(", ")} must contain exactly 12 non-empty fields.`;
      const ids = recordRows.map((row) => row.parts[0].toUpperCase());
      if (new Set(ids).size !== ids.length)
        return zh ? "每一行居家服務紀錄都需要唯一 ID。" : "Every home-care visit row needs a unique ID.";
      const invalidStatuses = recordRows.filter((row) => !statusOrder.includes(row.parts[11]));
      if (invalidStatuses.length)
        return zh ? `居家服務第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用十二種指定狀態之一。` : `Home-care visit line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the twelve exact statuses.`;

      const openRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) < 9);
      const closedRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) >= 9);
      const sourceDateOf = (textValue: string) => strictIsoDate(textValue.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "");
      const invalidSourceDates = recordRows.filter((row) => {
        const checked = sourceDateOf(row.parts[3]);
        return !checked || checked < baselineDate || checked > reviewDate;
      });
      if (invalidSourceDates.length)
        return zh ? `居家服務第 ${invalidSourceDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的受保護來源核對日。` : `Home-care visit line ${invalidSourceDates.map((row) => row.line).join(", ")} needs a protected-source checked date from the baseline through this review.`;
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[10]);
        return !target || target < reviewDate || target > nextReview;
      });
      if (invalidOpenDates.length)
        return zh ? `仍開放的居家服務第 ${invalidOpenDates.map((row) => row.line).join("、")} 行需要介於本次核對日與下一核點的目標日。` : `Open home-care visit line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[10]);
        return !outcome || outcome < baselineDate || outcome > reviewDate;
      });
      if (invalidClosedDates.length)
        return zh ? `已核對、完成或不適用的居家服務第 ${invalidClosedDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的結果日。` : `Closed home-care visit line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an outcome date from the baseline through this review.`;

      const missingLayers = recordRows.filter((row) => row.parts[1].length < 8 || row.parts[2].length < 12 || row.parts[3].length < 18 || row.parts[4].length < 12 || row.parts[5].length < 12 || row.parts[6].length < 12 || row.parts[7].length < 12 || row.parts[8].length < 12 || row.parts[9].length < 4);
      if (missingLayers.length)
        return zh ? `居家服務第 ${missingLayers.map((row) => row.line).join("、")} 行需要真實的到訪目的、負責來源、受保護本人比對、目前版本、服務時段與角色、到離場證據、服務範圍／例外、負責行動及角色。` : `Home-care visit line ${missingLayers.map((row) => row.line).join(", ")} needs a real visit purpose, responsible source, protected person match, current version, service window and role, arrival/departure evidence, service scope or exception, responsible action and owner.`;

      const reviewedWithoutEvidence = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[9]) return false;
        const evidence = row.parts.slice(2, 9).join(" ");
        const sourceOk = zh ? /(?:服務單位|長照|方案|契約|照顧計畫)/.test(row.parts[2]) : /(?:agency|program|provider|contract|service-plan)/i.test(row.parts[2]);
        const matchOk = zh ? /(?:受保護|本人|比對|證據)/.test(row.parts[3]) : /(?:protected|person|match|evidence)/i.test(row.parts[3]);
        const versionOk = zh ? /(?:目前|版本|照顧計畫|契約|服務授權)/.test(row.parts[4]) : /(?:current|version|service-plan|contract|authorization)/i.test(row.parts[4]);
        const visitSourceOk = zh ? /(?:服務時段|工作角色|本人參與|服務單位)/.test(row.parts[5]) : /(?:service-window|worker role|participation|agency)/i.test(row.parts[5]);
        const visitEvidenceOk = zh ? /(?:正式|服務單位|到離場|證據|觀察)/.test(row.parts[6]) : /(?:official|agency|EVV|arrival|departure|evidence|observed)/i.test(row.parts[6]);
        const scopeOk = zh ? /(?:授權|服務範圍|結果|例外|觀察)/.test(row.parts[7]) : /(?:authorized|service scope|result|exception|observed)/i.test(row.parts[7]);
        const resultOk = zh ? /(?:服務單位|方案).*(?:結果|回覆|核對)/.test(row.parts[8]) : /(?:agency|program).*(?:result|response|reviewed)/i.test(row.parts[8]);
        const routeOk = zh ? /(?:服務單位|方案|合格|申訴)/.test(row.parts[8]) : /(?:agency|program|qualified|complaint)/i.test(row.parts[8]);
        const reopenOk = zh ? /(?:重新開啟|改變|下次到訪)/.test(row.parts[8]) : /(?:reopen|change|next visit)/i.test(row.parts[8]);
        const unresolved = zh ? /(?:等待|仍待|尚待|未解|未知|矛盾|缺少)/.test(evidence) : /(?:pending|awaiting|unresolved|unknown|conflict|missing)/i.test(evidence);
        return !sourceOk || !matchOk || !versionOk || !visitSourceOk || !visitEvidenceOk || !scopeOk || !resultOk || !routeOk || !reopenOk || unresolved;
      });
      if (reviewedWithoutEvidence.length)
        return zh ? `完成核對的第 ${reviewedWithoutEvidence.map((row) => row.line).join("、")} 行必須連結負責服務來源、受保護本人比對、目前版本、服務時段與角色、正式到離場證據、服務範圍觀察、負責結果、申訴／合格路徑與重開條件，且不能仍有未解差異。` : `Reviewed home-care visit line ${reviewedWithoutEvidence.map((row) => row.line).join(", ")} must link a responsible service source, protected person match, current version, service window and role, official arrival/departure evidence, service-scope observation, responsible result, complaint or qualified route and reopen rule with no unresolved gap.`;

      const exceptionWithoutPendingResult = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[7]) return false;
        const action = [row.parts[7], row.parts[8]].join(" ");
        const exception = zh ? /(?:例外|未到|縮短|更改|事件)/.test(action) : /(?:exception|missed|shortened|changed|incident)/i.test(action);
        const reported = zh ? /(?:回報|已報告|服務單位|方案|申訴)/.test(action) : /(?:reported|agency|program|complaint)/i.test(action);
        const pending = zh ? /(?:等待|仍待|尚待|待取得)/.test(action) : /(?:pending|awaiting|remains)/i.test(action);
        const completionClaim = zh ? /(?:服務完成|問題解決|申訴完成|已全部完成)/.test(action) : /(?:service completed|issue resolved|complaint completed|fully completed)/i.test(action);
        return !exception || !reported || !pending || completionClaim;
      });
      if (exceptionWithoutPendingResult.length)
        return zh ? `等待負責服務結果的第 ${exceptionWithoutPendingResult.map((row) => row.line).join("、")} 行必須記錄例外與已回報的服務單位、方案或申訴路徑，保持等待，不能把家庭觀察寫成完成結果。` : `Responsible-result-pending line ${exceptionWithoutPendingResult.map((row) => row.line).join(", ")} must record an exception and a reported agency, program or complaint route, stay pending and not turn a household observation into a completed result.`;

      const conflictWithoutRoute = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[8]) return false;
        const combined = row.parts.slice(4, 9).join(" ");
        const conflict = zh ? /(?:身分|時間|範圍|安全|計費|矛盾|不同|差異|錯誤)/.test(combined) : /(?:identity|timing|scope|safety|billing|conflict|different|discrepancy|error)/i.test(combined);
        const route = zh ? /(?:服務單位|方案|合格|申訴)/.test(combined) : /(?:agency|program|qualified|complaint)/i.test(combined);
        return !conflict || !route;
      });
      if (conflictWithoutRoute.length)
        return zh ? `矛盾列第 ${conflictWithoutRoute.map((row) => row.line).join("、")} 行必須寫出身分、時間、範圍、安全或計費差異，以及負責服務單位、方案、合格審查或申訴路徑。` : `Conflict line ${conflictWithoutRoute.map((row) => row.line).join(", ")} must name the identity, timing, scope, safety or billing conflict and the responsible agency, program, qualified review or complaint route.`;

      const completedWithoutResult = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[10]) return false;
        const result = [row.parts[6], row.parts[7], row.parts[8]].join(" ");
        const observed = zh ? /(?:負責服務單位|方案).*(?:結果|回覆|確認).*(?:收到|觀察|記錄)/.test(result) : /(?:(?:responsible agency|program) (?:result|response|confirmation)).*(?:received|observed|recorded)/i.test(result);
        const custody = zh ? /(?:保管|目前版本|下次到訪|重新開啟)/.test(result) : /(?:custody|current version|next visit|reopen)/i.test(result);
        const unresolved = zh ? /(?:等待|仍待|尚待|未解|未知)/.test(result) : /(?:pending|awaiting|unresolved|unknown)/i.test(result);
        return !observed || !custody || unresolved;
      });
      if (completedWithoutResult.length)
        return zh ? `完成結果的第 ${completedWithoutResult.map((row) => row.line).join("、")} 行必須記錄已收到或觀察的負責服務結果、紀錄保管及下次到訪或重開條件。` : `Completed service-result line ${completedWithoutResult.map((row) => row.line).join(", ")} must record an observed responsible agency or program result, record custody and the next-visit or reopen condition.`;

      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[11] === statusOrder[11] && !(zh ? /(?:重新開啟|重新檢視|如果|當.*時|服務|契約|計畫|到訪|家庭.*改變)/.test(row.parts[8]) : /(?:reopen|review again|if |when |after |service|contract|plan|visit|household.*change)/i.test(row.parts[8])));
      if (notApplicableWithoutTrigger.length)
        return zh ? `不適用的第 ${notApplicableWithoutTrigger.map((row) => row.line).join("、")} 行必須記錄目前原因，以及服務、契約、計畫、到訪或家庭改變時的重開事件。` : `Not-applicable line ${notApplicableWithoutTrigger.map((row) => row.line).join(", ")} must state the current reason and the service, contract, plan, visit or household change that reopens it.`;

      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return zh ? "偵測到可能的完整電話、Email、案件、會員、服務對象、工作人員、計費或其他長數字識別資料。請改用安全證據代號。" : "A possible full phone, email, case, member, care-recipient, worker, billing or other long numeric identifier was detected. Use a safe evidence pointer.";
      if (/password|passphrase|passcode|access code|door code|alarm code|security code|recovery code|verification code|login credential|full address|street address|care-recipient name\s*[:=]|patient name\s*[:=]|person name\s*[:=]|provider name\s*[:=]|agency name\s*[:=]|worker name\s*[:=]|employee name\s*[:=]|date of birth\s*[:=]|diagnosis\s*[:=]|condition\s*[:=]|symptom\s*[:=]|allerg(?:y|ies)\s*[:=]|medication name\s*[:=]|drug name\s*[:=]|medicine name\s*[:=]|dose\s*[:=]|dosage\s*[:=]|\b\d+(?:\.\d+)?\s*(?:mg|mcg|ml)\b|feeding|swallowing|transfer step|lifting step|mobility detail|toileting|bathing|wound|device instruction|behavior(?:al)? detail|mental health|care note|service note content|treatment plan|exact time|arrival time\s*[:=]|departure time\s*[:=]|clock[- ]?in\s*[:=]|clock[- ]?out\s*[:=]|exact location|precise location|GPS|location\s*[:=]|case number\s*[:=]|member number\s*[:=]|patient ID\s*[:=]|provider ID\s*[:=]|worker ID\s*[:=]|employee ID\s*[:=]|billing amount\s*[:=]|claim amount\s*[:=]|invoice amount\s*[:=]|photo|audio recording|video recording|signature|private message|correspondence|完整地址|被照顧者姓名\s*[:：]|病人姓名\s*[:：]|本人姓名\s*[:：]|院所名稱\s*[:：]|服務單位名稱\s*[:：]|工作人員姓名\s*[:：]|居服員姓名\s*[:：]|出生日期\s*[:：]|診斷\s*[:：]|病況\s*[:：]|症狀\s*[:：]|過敏\s*[:：]|藥名\s*[:：]|用藥名稱\s*[:：]|劑量\s*[:：]|餵食|吞嚥|移位步驟|攙扶步驟|行動細節|如廁|沐浴|傷口|管路|輔具指示|行為處理|心理健康內容|照護紀錄內容|服務紀錄內容|精確時間|到場時間\s*[:：]|離場時間\s*[:：]|打卡時間\s*[:：]|精確位置|詳細地點|GPS|位置\s*[:：]|案件編號\s*[:：]|會員號\s*[:：]|服務對象編號\s*[:：]|服務單位編號\s*[:：]|工作人員編號\s*[:：]|計費金額\s*[:：]|請款金額\s*[:：]|照片|錄音|錄影|簽名|門鎖密碼|保全密碼|登入密碼|驗證碼|私人訊息|通信內容/i.test(privacyText))
        return zh ? "偵測到可能的被照顧者身分、服務單位、地址、診斷、用藥、劑量、餵食、移位、如廁、工作人員、精確時間或位置、案件、計費、影像、簽名、登入或私人通信內容。請改成安全來源、流程或證據代號。" : "A possible care-recipient identity, provider, address, diagnosis, medication, dose, feeding, mobility, exact time or location, worker, case, billing, media, signature, credential or private correspondence detail was detected.";

      const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[11] === status).length })).filter((item) => item.count > 0);
      if (zh)
        return `${values.review.trim()}｜居家照護服務到離場、範圍與結果狀態
核對情境：${values.context}
居家服務來源／版本基準：${formatter.format(baselineDate)}
本次居家照護服務核對：${formatter.format(reviewDate)}
下一次到訪、例外或負責結果核點：${formatter.format(nextReview)}
仍開放的來源、本人比對、版本、到訪證據、例外或服務單位結果列：${openRows.length} 筆
已核對、完成或不適用列：${closedRows.length} 筆
狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}

服務單位、方案、契約、照顧計畫、到離場與申訴來源地圖：${values.basis.trim()}

${lines("有版本的居家服務到離場、範圍、例外與結果證據", recordRows.map((row) => `${row.parts[0]}｜本人／到訪目的：${row.parts[1]}｜負責服務來源／範圍：${row.parts[2]}｜受保護本人比對／來源核對：${row.parts[3]}｜目前照顧計畫／契約／授權版本：${row.parts[4]}｜服務時段／工作角色／本人參與：${row.parts[5]}｜正式到離場證據／家庭觀察：${row.parts[6]}｜服務範圍／例外／事件：${row.parts[7]}｜行動／服務單位回覆／矛盾／申訴：${row.parts[8]}｜負責角色：${row.parts[9]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[10]) as Date)}｜狀態：${row.parts[11]}`))}

受保護服務單位、照顧計畫、到離場、例外、申訴與核對歷程位置：${values.storage.trim()}

這份輸出只是家庭居家服務來源、版本、到離場證據、範圍觀察、例外與負責結果索引，不是正式電子到訪驗證、服務紀錄、工時表、薪資、計費、請款、照顧計畫、醫療紀錄、事件報告、申訴文件或服務品質證明。它不驗證服務人員或單位，不授權進入住家，不追蹤工作人員或位置，不讀寫服務單位或長照系統，不送出到離場、工時、請款、事件或申訴資料，不聯絡任何單位，也不判斷照護是否正確、安全或完成及不計算服務、給付、申訴或法律期限。真實服務、健康安全、緊急事件與申訴結果請直接使用目前照顧計畫、契約、服務單位、長照方案、地方主管機關、合格專業來源及所在地緊急服務。`;
      return `${values.review.trim()} — home-care visit scope and service result status
Review context: ${values.context}
Home-care service source/version baseline: ${formatter.format(baselineDate)}
Current home-care service review: ${formatter.format(reviewDate)}
Next visit, exception or responsible-result checkpoint: ${formatter.format(nextReview)}
Open source, person-match, version, visit-evidence, exception or agency-result rows: ${openRows.length}
Reviewed, completed or not-applicable rows: ${closedRows.length}
Status count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}

Agency, program, contract, service-plan, visit-evidence and complaint source map: ${values.basis.trim()}

${lines("Versioned home-care visit, scope, exception and result evidence", recordRows.map((row) => `${row.parts[0]} — person/visit purpose: ${row.parts[1]} — responsible service source/scope: ${row.parts[2]} — protected person match/source check: ${row.parts[3]} — current service-plan/contract/authorization version: ${row.parts[4]} — service window/worker role/participation: ${row.parts[5]} — official arrival/departure evidence/household observation: ${row.parts[6]} — service scope/exception/incident: ${row.parts[7]} — action/agency response/conflict/complaint: ${row.parts[8]} — owner: ${row.parts[9]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[10]) as Date)} — status: ${row.parts[11]}`))}

Protected agency, service-plan, EVV, exception, complaint and review-history location: ${values.storage.trim()}

This output is a household home-care service source, version, visit-evidence, scope-observation, exception and responsible-result index, not official EVV, a service record, timesheet, payroll, billing, claim, care plan, clinical chart, incident report, complaint filing or proof of service quality. It does not verify a worker or agency; authorize home access; track a worker or location; read or write an agency, Medicaid, Medicare or program system; submit EVV, time, claim, incident or complaint data; contact anyone; decide whether care was correct, safe or complete; or calculate service, coverage, appeal, complaint or legal deadlines. Use the current care plan, contract, responsible agency, program, qualified source, official complaint process and local emergency service for every real service, health, safety, emergency and result.`;
    },
  };
};

const homeCareServiceChangeDefinition = (locale: Locale): Definition => {
  const zh = locale === "zh-TW";
  const statusOrder = zh
    ? [
        "已收到居家照護服務變更訊號，等待確認變更情境",
        "已確認變更情境，等待負責方案、服務單位或通知來源",
        "已記錄負責變更來源，等待受保護本人比對",
        "已記錄受保護本人比對，等待變更前後照顧計畫、契約、授權或通知版本",
        "已記錄變更前後版本，等待變更權限、原因類別與生效服務批次",
        "已記錄變更權限、原因與生效批次，等待正式通知、交付、可取得副本與無障礙需求",
        "已記錄正式通知與交付，等待本人參與、家庭回應或異議結果",
        "已記錄參與、回應或異議，等待銜接安排與首次新版服務結果",
        "版本、通知、生效、服務中斷、費用或權利矛盾，等待負責方案、申訴或合格審查",
        "已核對變更來源、版本、通知、回應、銜接與首次新版服務結果",
        "已收到負責變更結果，記錄保管、持續服務與重新開啟條件",
        "不適用，已記錄原因與重新開啟事件",
      ]
    : [
        "Home-care service change signal received—change context pending",
        "Change context recorded—responsible program, agency or notice source pending",
        "Responsible change source recorded—protected person match pending",
        "Protected person match recorded—before-and-after plan, contract, authorization or notice versions pending",
        "Before-and-after versions recorded—change authority, reason category and effective service batch pending",
        "Change authority, reason and effective batch recorded—formal notice, delivery, copy and accessibility pending",
        "Formal notice and delivery recorded—person participation, household response or disagreement result pending",
        "Participation, response or disagreement recorded—transition and first changed-service result pending",
        "Version, notice, effective date, service continuity, cost or rights conflict—program, complaint or qualified review pending",
        "Change source, versions, notice, response, transition and first changed-service result reviewed",
        "Responsible change result received—custody, service continuity and reopen condition recorded",
        "Not applicable—reason and reopen event recorded",
      ];

  const defaultRecords = zh
    ? `CHANGE-A | 被照顧者 A 的居家服務方案調整；目前變更通知核對 | 目前長照方案、個案管理與居家服務單位來源；各自責任分開 | 受保護本人與目前服務關係已比對；證據 CARE-A-CHANGE3；核對 2026-08-26 | 變更前照顧計畫 P2、目前核定版本 P3 與契約附件 C3 指標已開啟；內容留在受保護來源 | 變更由目前照管或個案管理流程核定；原因類別為需求重新評估；新版服務批次 BATCH-C 生效來源已觀察 | 正式通知 N3 已由負責管道交付；本人或簽約者可取得副本；無障礙或語言需求已由負責來源處理 | 本人參與來源與家庭回應已記錄；沒有把簽收寫成同意；所有記錄問題均有可歸屬結果 | 首次依新版提供的服務結果已由服務單位來源觀察；銜接、服務不中斷與申訴路徑已核對；計畫、契約、單位或服務結果改變時重新開啟 | 家庭長照協調角色 | 2026-08-26 | 已核對變更來源、版本、通知、回應、銜接與首次新版服務結果
NOTICE-A | 被照顧者 A 的服務時段或人員異動；通知與銜接追蹤 | 目前居家服務單位與契約來源；長照方案和家庭行事曆保持分開 | 受保護本人與目前服務關係已比對；證據 CARE-A-NOTICE3；核對 2026-08-26 | 目前契約附件 C3 與服務單位異動通知 N4 指標已開啟；照顧計畫是否受影響仍由負責來源確認 | 服務單位提出異動；原因類別為排班或服務人員銜接；預計生效服務批次 WINDOW-D 已記錄 | 正式通知 N4 已交付並可取得副本；通知管道與無障礙需求已記錄 | 家庭已確認收到並提出銜接問題；不代表同意；負責服務單位回應仍待取得 | 替代安排、服務不中斷及首次依新時段提供服務仍待負責服務單位結果；申訴路徑已映射 | 家庭服務追蹤角色 | 2026-09-10 | 已記錄參與、回應或異議，等待銜接安排與首次新版服務結果`
    : `CHANGE-A | Care person A home-care plan adjustment; current change-notice review | Current program, case-management and home-care agency sources; responsibilities remain separate | Protected person and current service relationship matched; evidence CARE-A-CHANGE3; checked 2026-08-26 | Before-change service plan P2, current approved version P3 and contract attachment C3 pointers opened; content stays protected | Change approved through the responsible program or ordering process; reason category is reassessment; effective service batch BATCH-C source observed | Formal notice N3 delivered through the responsible route; recipient can obtain a copy; accessibility or language need handled by responsible source | Care-person participation source and household response recorded; receipt is not treated as agreement; every recorded question has an attributable result | First changed-service result observed in responsible agency source; transition, service continuity and review route checked; reopen when plan, contract, agency or service result changes | Household care-coordination role | 2026-08-26 | Change source, versions, notice, response, transition and first changed-service result reviewed
NOTICE-A | Care person A service-window or worker-role change; notice and transition follow-up | Current home-care agency and contract sources; program authorization and household calendar remain separate | Protected person and current service relationship matched; evidence CARE-A-NOTICE3; checked 2026-08-26 | Current contract attachment C3 and agency change notice N4 pointers opened; responsible source still deciding whether plan authorization changes | Agency issued a scheduling or worker-transition change; proposed effective service batch WINDOW-D recorded | Formal notice N4 delivered and a copy is available; delivery route and accessibility need recorded | Household confirmed receipt and asked a transition question; this is not agreement; responsible agency response remains pending | Replacement arrangement, service continuity and first visit under the changed window remain pending from responsible agency; complaint route mapped | Household service follow-up role | 2026-09-10 | Participation, response or disagreement recorded—transition and first changed-service result pending`;

  return {
    intro: zh
      ? "用安全代號分開居家服務變更訊號、負責來源、本人比對、變更前後版本、變更權限與原因、正式通知、本人參與、銜接、首次新版服務及負責結果。這不是照顧計畫、契約附件、法定通知、同意書、申訴或權利期限計算器。"
      : "Separate a home-care change signal, responsible source, protected person match, before-and-after versions, authority, formal notice, participation, transition, first changed service and responsible result with safe codes. This is not a care plan, contract amendment, legal notice, consent, appeal or rights-deadline calculator.",
    fields: [
      text(
        "review",
        zh ? "居家服務變更私人核對代號" : "Private home-care change review reference",
        zh ? "只用安全家庭代號；不要輸入姓名、地址、健康照護內容、通知全文、簽名、案件、費用、精確時段或登入資料。" : "Use a safe household code. Do not enter names, addresses, health or care content, notice text, signatures, case or cost details, exact schedules or credentials.",
        "HOME-CARE-CHANGE-2026-A",
      ),
      {
        name: "context",
        label: zh ? "居家服務變更情境" : "Home-care service change context",
        type: "select",
        options: zh
          ? ["重新評估或照顧計畫調整", "契約、附件或自費服務範圍變更", "服務時段或服務人員異動", "服務項目、頻率或授權範圍減少或停止", "服務項目、頻率或授權範圍增加", "服務單位、方案或負責角色更換", "費用、給付或付款責任通知", "異議、申訴、終止或服務不中斷追蹤"]
          : ["Reassessment or plan-of-care change", "Contract, attachment or private-pay scope change", "Service-window or worker-role change", "Service item, frequency or authorization reduction or termination", "Service item, frequency or authorization increase", "Agency, program or responsible-role transition", "Cost, coverage or payment-responsibility notice", "Disagreement, complaint, termination or service-continuity follow-up"],
      },
      { name: "baselineDate", label: zh ? "變更前來源版本基準日" : "Before-change source-version baseline date", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: zh ? "本次變更通知核對日" : "Current change-notice review date", type: "date", value: "2026-08-26" },
      { name: "nextReview", label: zh ? "下一次通知、銜接或首次新版服務核點" : "Next notice, transition or first changed-service checkpoint", type: "date", value: "2026-09-10" },
      text(
        "basis",
        zh ? "方案、照管／個案管理、服務單位、照顧計畫、契約、通知與申訴來源地圖" : "Program, ordering or case-management, agency, plan, contract, notice and review-route source map",
        zh ? "只放安全來源與版本代號；本人、計畫、契約、通知、費用、簽名、服務內容及案件資料留在負責受保護來源。" : "Use safe source and version IDs only. Keep identity, plan, contract, notice, cost, signature, service and case content in responsible protected sources.",
        "PROGRAM-P1; PLAN-BEFORE-P2; PLAN-CURRENT-P3; CONTRACT-C3; NOTICE-N3; AGENCY-S1; REVIEW-ROUTE-R2",
      ),
      {
        name: "records",
        label: zh ? "有版本的服務變更、通知、回應、銜接與結果列" : "Versioned service-change, notice, response, transition and result rows",
        type: "textarea",
        help: zh ? "每行：ID｜安全本人代號與變更情境｜負責方案、服務單位、照管／個案管理或通知來源｜受保護本人比對與來源核對日 YYYY-MM-DD｜變更前後照顧計畫、契約、授權或通知版本｜變更權限、原因類別與生效服務批次｜正式通知類型、交付、可取得副本與無障礙需求｜本人參與、家庭回應、簽收或異議結果｜銜接、服務不中斷、首次新版服務或正式審查結果｜負責角色｜目標或結果日期 YYYY-MM-DD｜十二種指定狀態之一。最多 14 行。" : "One line: ID | safe care-person alias and change context | responsible program, agency, ordering, case-management or notice source | protected person-match evidence plus source checked date YYYY-MM-DD | before-and-after plan, contract, authorization or notice versions | change authority, reason category and effective service batch | formal notice type, delivery, available copy and accessibility need | person participation, household response, receipt or disagreement result | transition, service continuity, first changed service or official review result | owner role | target or outcome date YYYY-MM-DD | one of the twelve exact statuses. Maximum 14 lines.",
        value: defaultRecords,
      },
      text(
        "storage",
        zh ? "受保護照顧計畫、契約、通知、回應、服務銜接與審查歷程位置" : "Protected plan, contract, notice, response, service-transition and review-history location",
        zh ? "只寫保管流程或容器代號；不要貼本人、照護、通知、簽名、費用、申訴、精確服務時段、登入或私人內容。" : "Name a custody process or container, not identity, care, notice, signature, cost, appeal, exact schedule, login or private content.",
        zh ? "家庭紀錄／居家服務變更／HOME-CARE-CHANGE-2026-A／受保護來源" : "Household records / home-care changes / HOME-CARE-CHANGE-2026-A / protected sources",
      ),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!baselineDate || !reviewDate || !nextReview)
        return zh ? "請輸入有效的變更前基準日、本次核對日與下一核點日期。" : "Enter valid before-change baseline, current-review and next-checkpoint dates.";
      if (baselineDate > reviewDate)
        return zh ? "變更前來源版本基準日不能晚於本次變更通知核對日。" : "The before-change source baseline cannot be later than the current change review.";
      if (nextReview < reviewDate)
        return zh ? "下一次通知、銜接或首次新版服務核點不能早於本次核對日。" : "The next notice, transition or first changed-service checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 16 || values.storage.trim().length < 10)
        return zh ? "請提供安全的服務變更來源地圖與受保護保管位置代號。" : "Provide a safe service-change source map and protected storage-process label.";

      const rows = values.records.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
      if (!rows.length || rows.length > 14)
        return zh ? "請輸入 1 至 14 行服務變更、通知、銜接與結果狀態。" : "Enter 1 to 14 service-change, notice, transition and result rows.";
      const recordRows = rows.map((row, index) => ({ line: index + 1, parts: row.split("|").map((part) => part.trim()) }));
      const malformed = recordRows.filter((row) => row.parts.length !== 12 || row.parts.some((part) => !part));
      if (malformed.length)
        return zh ? `服務變更第 ${malformed.map((row) => row.line).join("、")} 行必須剛好有 12 個非空白欄位。` : `Service-change line ${malformed.map((row) => row.line).join(", ")} must contain exactly 12 non-empty fields.`;
      const ids = recordRows.map((row) => row.parts[0].toUpperCase());
      if (new Set(ids).size !== ids.length)
        return zh ? "每一行服務變更紀錄都需要唯一 ID。" : "Every service-change row needs a unique ID.";
      const invalidStatuses = recordRows.filter((row) => !statusOrder.includes(row.parts[11]));
      if (invalidStatuses.length)
        return zh ? `服務變更第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用十二種指定狀態之一。` : `Service-change line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the twelve exact statuses.`;

      const openRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) < 9);
      const closedRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) >= 9);
      const checkedDateOf = (textValue: string) => strictIsoDate(textValue.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "");
      const invalidSourceDates = recordRows.filter((row) => {
        const checked = checkedDateOf(row.parts[3]);
        return !checked || checked < baselineDate || checked > reviewDate;
      });
      if (invalidSourceDates.length)
        return zh ? `服務變更第 ${invalidSourceDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的受保護來源核對日。` : `Service-change line ${invalidSourceDates.map((row) => row.line).join(", ")} needs a protected-source checked date from the baseline through this review.`;
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[10]);
        return !target || target < reviewDate || target > nextReview;
      });
      if (invalidOpenDates.length)
        return zh ? `仍開放的服務變更第 ${invalidOpenDates.map((row) => row.line).join("、")} 行需要介於本次核對日與下一核點的目標日。` : `Open service-change line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[10]);
        return !outcome || outcome < baselineDate || outcome > reviewDate;
      });
      if (invalidClosedDates.length)
        return zh ? `已核對、完成或不適用的服務變更第 ${invalidClosedDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的結果日。` : `Closed service-change line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an outcome date from the baseline through this review.`;

      const missingLayers = recordRows.filter((row) => row.parts[1].length < 8 || row.parts[2].length < 12 || row.parts[3].length < 18 || row.parts[4].length < 14 || row.parts[5].length < 14 || row.parts[6].length < 14 || row.parts[7].length < 12 || row.parts[8].length < 14 || row.parts[9].length < 4);
      if (missingLayers.length)
        return zh ? `服務變更第 ${missingLayers.map((row) => row.line).join("、")} 行需要真實的變更情境、負責來源、本人比對、前後版本、變更權限與生效批次、通知交付、參與或異議、銜接／首次新版服務及負責角色。` : `Service-change line ${missingLayers.map((row) => row.line).join(", ")} needs a real change context, responsible source, person match, before-and-after versions, authority and effective batch, notice delivery, participation or disagreement, transition or first changed service and owner.`;

      const reviewedWithoutEvidence = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[9]) return false;
        const combined = row.parts.slice(2, 9).join(" ");
        const sourceOk = zh ? /(?:方案|照管|個案管理|服務單位|契約|通知)/.test(row.parts[2]) : /(?:program|ordering|case-management|agency|contract|notice)/i.test(row.parts[2]);
        const matchOk = zh ? /(?:受保護|本人|比對|證據)/.test(row.parts[3]) : /(?:protected|person|match|evidence)/i.test(row.parts[3]);
        const versionsOk = zh ? /(?:變更前|目前|新版|版本|照顧計畫|契約|附件)/.test(row.parts[4]) : /(?:before|current|changed|version|plan|contract|attachment)/i.test(row.parts[4]);
        const authorityOk = zh ? /(?:核定|負責|提出|變更|原因|生效|批次)/.test(row.parts[5]) : /(?:approved|responsible|issued|change|reason|effective|batch)/i.test(row.parts[5]);
        const noticeOk = zh ? /(?:正式通知|交付|副本|取得|無障礙|語言)/.test(row.parts[6]) : /(?:formal notice|delivered|copy|available|accessibility|language)/i.test(row.parts[6]);
        const responseOk = zh ? /(?:本人參與|家庭回應|收到|異議|簽收|同意)/.test(row.parts[7]) : /(?:participation|household response|received|disagreement|receipt|agreement)/i.test(row.parts[7]);
        const transitionOk = zh ? /(?:首次|新版|銜接|服務不中斷|服務結果)/.test(row.parts[8]) : /(?:first|changed service|transition|continuity|service result)/i.test(row.parts[8]);
        const routeOk = zh ? /(?:申訴|審查|服務單位|方案|負責)/.test(row.parts[8]) : /(?:complaint|review|agency|program|responsible)/i.test(row.parts[8]);
        const reopenOk = zh ? /(?:重新開啟|改變|異動)/.test(row.parts[8]) : /(?:reopen|change)/i.test(row.parts[8]);
        const unresolved = zh ? /(?:等待|仍待|尚待|未解|未知|矛盾)/.test(combined) : /(?:pending|awaiting|unresolved|unknown|conflict)/i.test(combined);
        return !sourceOk || !matchOk || !versionsOk || !authorityOk || !noticeOk || !responseOk || !transitionOk || !routeOk || !reopenOk || unresolved;
      });
      if (reviewedWithoutEvidence.length)
        return zh ? `完成核對的第 ${reviewedWithoutEvidence.map((row) => row.line).join("、")} 行必須連結負責來源、本人比對、變更前後版本、權限與生效批次、正式通知、本人參與或家庭回應、銜接、首次新版服務、申訴／審查路徑及重開條件，且不能仍有未解差異。` : `Reviewed service-change line ${reviewedWithoutEvidence.map((row) => row.line).join(", ")} must link the responsible source, person match, before-and-after versions, authority and effective batch, formal notice, participation or household response, transition, first changed service, complaint or review route and reopen rule with no unresolved gap.`;

      const responseWithoutTransition = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[7]) return false;
        const response = row.parts[7];
        const transition = row.parts[8];
        const responseOk = zh ? /(?:參與|收到|回應|提出|異議|簽收|不代表同意)/.test(response) : /(?:participation|receipt|response|asked|disagreement|not agreement)/i.test(response);
        const pending = zh ? /(?:等待|仍待|尚待|待取得)/.test(transition) : /(?:pending|awaiting|remains)/i.test(transition);
        const sourceRoute = zh ? /(?:服務單位|方案|申訴|負責)/.test(transition) : /(?:agency|program|complaint|responsible)/i.test(transition);
        return !responseOk || !pending || !sourceRoute;
      });
      if (responseWithoutTransition.length)
        return zh ? `等待銜接的第 ${responseWithoutTransition.map((row) => row.line).join("、")} 行必須記錄本人參與或家庭回應，並把替代安排、服務不中斷及首次新版服務保持為負責來源待確認。` : `Transition-pending line ${responseWithoutTransition.map((row) => row.line).join(", ")} must record person participation or household response and keep the replacement arrangement, service continuity and first changed service pending from a responsible source.`;

      const conflictWithoutRoute = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[8]) return false;
        const combined = row.parts.slice(4, 9).join(" ");
        const conflict = zh ? /(?:版本|通知|生效|中斷|費用|權利|矛盾|差異|不同)/.test(combined) : /(?:version|notice|effective|continuity|cost|rights|conflict|difference|discrepancy)/i.test(combined);
        const route = zh ? /(?:方案|服務單位|申訴|調處|合格|審查)/.test(combined) : /(?:program|agency|complaint|mediation|qualified|review)/i.test(combined);
        return !conflict || !route;
      });
      if (conflictWithoutRoute.length)
        return zh ? `矛盾列第 ${conflictWithoutRoute.map((row) => row.line).join("、")} 行必須指出版本、通知、生效、服務中斷、費用或權利差異，以及負責方案、服務單位、申訴、調處或合格審查路徑。` : `Conflict line ${conflictWithoutRoute.map((row) => row.line).join(", ")} must name the version, notice, effective-date, continuity, cost or rights conflict and the responsible program, agency, complaint, mediation or qualified review route.`;

      const completedWithoutResult = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[10]) return false;
        const result = row.parts[8];
        const responsibleResult = zh ? /(?:負責|服務單位|方案).*(?:結果|回覆|確認).*(?:收到|觀察|記錄)/.test(result) : /(?:(?:responsible|agency|program).*(?:result|response|confirmation)).*(?:received|observed|recorded)/i.test(result);
        const custody = zh ? /(?:保管|服務不中斷|持續服務|重新開啟)/.test(result) : /(?:custody|service continuity|continued service|reopen)/i.test(result);
        const unresolved = zh ? /(?:等待|仍待|尚待|未解|未知)/.test(result) : /(?:pending|awaiting|unresolved|unknown)/i.test(result);
        return !responsibleResult || !custody || unresolved;
      });
      if (completedWithoutResult.length)
        return zh ? `完成結果的第 ${completedWithoutResult.map((row) => row.line).join("、")} 行必須記錄已收到或觀察的負責變更結果、受保護保管、持續服務及重新開啟條件。` : `Completed change-result line ${completedWithoutResult.map((row) => row.line).join(", ")} must record an observed responsible change result, protected custody, service continuity and reopen condition.`;

      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[11] === statusOrder[11] && !(zh ? /(?:重新開啟|重新檢視|如果|當.*時|計畫|契約|通知|服務|方案.*改變)/.test(row.parts[8]) : /(?:reopen|review again|if |when |plan|contract|notice|service|program.*change)/i.test(row.parts[8])));
      if (notApplicableWithoutTrigger.length)
        return zh ? `不適用的第 ${notApplicableWithoutTrigger.map((row) => row.line).join("、")} 行必須記錄目前原因，以及計畫、契約、通知、服務或方案改變時的重開事件。` : `Not-applicable line ${notApplicableWithoutTrigger.map((row) => row.line).join(", ")} must state the current reason and the plan, contract, notice, service or program change that reopens it.`;

      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return zh ? "偵測到可能的完整電話、Email、案件、會員、服務對象、工作人員、費用或其他長數字識別資料。請改用安全來源與版本代號。" : "A possible full phone, email, case, member, care-recipient, worker, cost or other long numeric identifier was detected. Use a safe source and version pointer.";
      if (/password|passphrase|passcode|access code|door code|alarm code|security code|recovery code|verification code|login credential|full address|street address|care-recipient name\s*[:=]|patient name\s*[:=]|person name\s*[:=]|provider name\s*[:=]|agency name\s*[:=]|worker name\s*[:=]|employee name\s*[:=]|date of birth\s*[:=]|diagnosis\s*[:=]|condition\s*[:=]|symptom\s*[:=]|allerg(?:y|ies)\s*[:=]|medication name\s*[:=]|drug name\s*[:=]|medicine name\s*[:=]|dose\s*[:=]|dosage\s*[:=]|\b\d+(?:\.\d+)?\s*(?:mg|mcg|ml)\b|feeding|swallowing|transfer step|lifting step|mobility detail|toileting|bathing|wound|device instruction|behavior(?:al)? detail|mental health|care note|treatment plan|exact time|arrival time\s*[:=]|departure time\s*[:=]|exact location|precise location|GPS|case number\s*[:=]|member number\s*[:=]|patient ID\s*[:=]|provider ID\s*[:=]|worker ID\s*[:=]|billing amount\s*[:=]|claim amount\s*[:=]|invoice amount\s*[:=]|notice text\s*[:=]|appeal text\s*[:=]|complaint text\s*[:=]|signature|signed form|private message|correspondence|完整地址|被照顧者姓名\s*[:：]|病人姓名\s*[:：]|本人姓名\s*[:：]|服務單位名稱\s*[:：]|工作人員姓名\s*[:：]|居服員姓名\s*[:：]|出生日期\s*[:：]|診斷\s*[:：]|病況\s*[:：]|症狀\s*[:：]|過敏\s*[:：]|藥名\s*[:：]|用藥名稱\s*[:：]|劑量\s*[:：]|餵食|吞嚥|移位步驟|攙扶步驟|行動細節|如廁|沐浴|傷口|管路|輔具指示|行為處理|心理健康內容|照護紀錄內容|精確時間|到場時間\s*[:：]|離場時間\s*[:：]|精確位置|詳細地點|GPS|案件編號\s*[:：]|會員號\s*[:：]|服務對象編號\s*[:：]|工作人員編號\s*[:：]|計費金額\s*[:：]|請款金額\s*[:：]|通知全文|申訴全文|異議全文|簽名|門鎖密碼|保全密碼|登入密碼|驗證碼|私人訊息|通信內容/i.test(privacyText))
        return zh ? "偵測到可能的本人、服務單位、地址、健康照護、工作人員、精確時間位置、案件費用、通知／申訴全文、簽名、登入或私人通信內容。請改成安全來源、版本、交付或結果代號。" : "A possible identity, provider, address, health or care, worker, exact time or location, case or cost, notice or appeal text, signature, credential or private correspondence detail was detected. Use a safe source, version, delivery or result pointer.";

      const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[11] === status).length })).filter((item) => item.count > 0);
      if (zh)
        return `${values.review.trim()}｜居家服務變更、通知與銜接狀態
變更情境：${values.context}
變更前來源版本基準：${formatter.format(baselineDate)}
本次變更通知核對：${formatter.format(reviewDate)}
下一次通知、銜接或首次新版服務核點：${formatter.format(nextReview)}
仍開放的來源、版本、通知、回應、銜接或審查列：${openRows.length} 筆
已核對、完成或不適用列：${closedRows.length} 筆
狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}

方案、照管／個案管理、服務單位、照顧計畫、契約、通知與申訴來源地圖：${values.basis.trim()}

${lines("有版本的服務變更、通知、回應、銜接與結果證據", recordRows.map((row) => `${row.parts[0]}｜本人／變更情境：${row.parts[1]}｜負責變更來源：${row.parts[2]}｜受保護本人比對／來源核對：${row.parts[3]}｜變更前後版本：${row.parts[4]}｜變更權限／原因／生效批次：${row.parts[5]}｜正式通知／交付／副本／無障礙：${row.parts[6]}｜本人參與／家庭回應／簽收／異議：${row.parts[7]}｜銜接／服務不中斷／首次新版服務／審查結果：${row.parts[8]}｜負責角色：${row.parts[9]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[10]) as Date)}｜狀態：${row.parts[11]}`))}

受保護照顧計畫、契約、通知、回應、服務銜接與審查歷程位置：${values.storage.trim()}

這份輸出只是家庭居家服務變更來源、版本、通知、回應、銜接與結果索引，不是照顧計畫、契約附件、法定通知、簽收或同意書、醫療紀錄、服務中斷決定、計費／給付決定、申訴、調處或法律文件。它不重新評估、不核定或改寫服務、不簽署或送達通知、不代表任何人同意、不聯絡單位、不提交異議或申訴、不計算生效、回覆、申訴或法律期限，也不保證替代服務或服務不中斷。真實變更與權利請直接使用目前照管／個案管理、照顧計畫、契約、服務單位、地方主管機關、合格專業來源及通知指定程序。`;
      return `${values.review.trim()} — home-care service change, notice and transition status
Change context: ${values.context}
Before-change source-version baseline: ${formatter.format(baselineDate)}
Current change-notice review: ${formatter.format(reviewDate)}
Next notice, transition or first changed-service checkpoint: ${formatter.format(nextReview)}
Open source, version, notice, response, transition or review rows: ${openRows.length}
Reviewed, completed or not-applicable rows: ${closedRows.length}
Status count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}

Program, ordering or case-management, agency, plan, contract, notice and review-route source map: ${values.basis.trim()}

${lines("Versioned service-change, notice, response, transition and result evidence", recordRows.map((row) => `${row.parts[0]} — person/change context: ${row.parts[1]} — responsible change source: ${row.parts[2]} — protected person match/source check: ${row.parts[3]} — before-and-after versions: ${row.parts[4]} — change authority/reason/effective batch: ${row.parts[5]} — formal notice/delivery/copy/accessibility: ${row.parts[6]} — participation/household response/receipt/disagreement: ${row.parts[7]} — transition/service continuity/first changed service/review result: ${row.parts[8]} — owner: ${row.parts[9]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[10]) as Date)} — status: ${row.parts[11]}`))}

Protected plan, contract, notice, response, service-transition and review-history location: ${values.storage.trim()}

This output is a household home-care change-source, version, notice, response, transition and result index, not a care plan, contract amendment, legal notice, receipt or consent form, clinical record, service-termination decision, billing or coverage determination, appeal, complaint, mediation or legal filing. It does not reassess, authorize or change care; sign or deliver a notice; establish agreement; contact an agency; submit a disagreement, appeal or complaint; calculate an effective, response, appeal or legal deadline; or guarantee replacement or uninterrupted service. Use the current ordering or case-management source, care plan, contract, responsible agency, program, official notice route, qualified source and local authority for every real change, right and result.`;
    },
  };
};

const homeCareInterruptionDefinition = (locale: Locale): Definition => {
  const zh = locale === "zh-TW";
  const statusOrder = zh
    ? [
        "已收到臨時服務中斷訊號，等待安全與急迫性核對",
        "已完成安全與急迫性核對，等待負責方案、契約或服務單位來源",
        "已記錄負責服務來源，等待受保護本人與目前服務時段比對",
        "已記錄本人與服務時段比對，等待目前照顧計畫、契約或授權版本",
        "已記錄目前服務版本，等待中斷確認、原因類別與負責回覆",
        "已記錄中斷確認與負責回覆，等待合格備援或服務不中斷選項",
        "已記錄備援選項，等待本人參與、接受或啟動結果",
        "已記錄本人參與與備援啟動，等待實際替代服務或恢復結果",
        "安全、來源、服務範圍、費用或權利矛盾，等待負責申訴或合格審查",
        "已核對中斷來源、安全路徑、備援決定、替代服務與恢復結果",
        "已收到負責持續服務結果，記錄保管、未補缺口與重新開啟條件",
        "不適用，已記錄原因與重新開啟事件",
      ]
    : [
        "Temporary service-interruption signal received—safety and urgency check pending",
        "Safety and urgency check recorded—responsible program, contract or agency source pending",
        "Responsible service source recorded—protected person and current service-window match pending",
        "Person and service-window match recorded—current plan, contract or authorization version pending",
        "Current service version recorded—interruption confirmation, reason category and responsible response pending",
        "Interruption confirmation and responsible response recorded—qualified backup or continuity options pending",
        "Backup options recorded—person participation, acceptance or activation result pending",
        "Participation and backup activation recorded—actual replacement service or resumption result pending",
        "Safety, source, service-scope, cost or rights conflict—responsible complaint or qualified review pending",
        "Interruption source, safety route, backup decision, replacement service and resumption result reviewed",
        "Responsible continuity result received—custody, uncompensated gap and reopen condition recorded",
        "Not applicable—reason and reopen event recorded",
      ];

  const defaultRecords = zh
    ? `GAP-A | 被照顧者 A 的臨時居家服務中斷；本次服務連續性核對 | 目前長照方案、A 單位個案管理、居家服務契約與服務單位來源；責任保持分開 | 受保護本人與原排定服務批次 WINDOW-A 已比對；證據 CARE-A-GAP4；核對 2026-08-26 | 目前核定照顧計畫 P3、契約附件 C3 與服務批次 WINDOW-A 指標已開啟；內容留在受保護來源 | 服務單位來源已確認本次臨時異動與一般人力中斷類別；正式回覆 R4 已收到；沒有推測工作人員原因 | 家庭已先依目前照護與所在地來源完成安全核對；沒有立即危險；若狀況改變使用原有緊急路徑 | 合格替代服務選項 BACKUP-B 由負責單位提出；本人參與與接受結果已記錄；沒有把親友自動視為正式替代 | 替代服務已由負責服務單位來源觀察，後續原服務已恢復；未補服務缺口 GAP-0 與申訴路徑已核對；服務再次中斷時重新開啟 | 家庭服務連續性角色 | 2026-08-26 | 已核對中斷來源、安全路徑、備援決定、替代服務與恢復結果
RESTORE-A | 被照顧者 A 的臨時排班取消；等待實際替代或恢復 | 目前居家服務單位、契約與 A 單位個案管理來源；家庭行事曆不是正式來源 | 受保護本人與原排定服務批次 WINDOW-B 已比對；證據 CARE-A-RESTORE4；核對 2026-08-26 | 目前契約附件 C3 與服務批次 WINDOW-B 指標已開啟；照顧計畫 P3 保持不變 | 服務單位已確認臨時取消與排班中斷類別；回覆 R5 指出將提供合格替代安排；沒有推測個人原因 | 家庭依目前照護來源完成安全核對；沒有立即危險；需要升級時使用既有合格或緊急來源 | 替代選項 BACKUP-C 已由負責服務單位提出；本人參與並接受本次安排；啟動指標已記錄 | 實際替代服務或原服務恢復仍待服務單位來源觀察；未補服務缺口與後續申訴路徑已映射 | 家庭排班追蹤角色 | 2026-09-10 | 已記錄本人參與與備援啟動，等待實際替代服務或恢復結果`
    : `GAP-A | Care person A temporary home-care service interruption; current continuity review | Current program, case-management, home-care contract and agency sources; responsibilities remain separate | Protected person and scheduled service batch WINDOW-A matched; evidence CARE-A-GAP4; checked 2026-08-26 | Current approved service plan P3, contract attachment C3 and service batch WINDOW-A pointers opened; content stays protected | Responsible agency source confirmed a temporary staffing interruption category; attributable response R4 received; no worker cause inferred | Household completed a safety check through the current care and local source; no immediate danger identified; use the existing emergency route if circumstances change | Qualified replacement option BACKUP-B offered by the responsible agency; person participation and acceptance result recorded; an informal helper is not treated as authorized service | Replacement service observed in the responsible agency source and regular service resumed; uncompensated service gap GAP-0 and complaint route checked; reopen if service is interrupted again | Household service-continuity role | 2026-08-26 | Interruption source, safety route, backup decision, replacement service and resumption result reviewed
RESTORE-A | Care person A temporary scheduled-service cancellation; actual replacement or resumption pending | Current home-care agency, contract and case-management sources; household calendar is not an official source | Protected person and scheduled service batch WINDOW-B matched; evidence CARE-A-RESTORE4; checked 2026-08-26 | Current contract attachment C3 and service batch WINDOW-B pointers opened; service plan P3 remains unchanged | Responsible agency confirmed a temporary scheduling interruption; response R5 states a qualified replacement arrangement will be offered; no personal cause inferred | Household completed a safety check through the current care source; no immediate danger identified; existing qualified or emergency route remains available | Backup option BACKUP-C offered by the responsible agency; person participated and accepted this event arrangement; activation pointer recorded | Actual replacement service or regular-service resumption remains pending in the responsible agency source; uncompensated service gap and complaint route mapped | Household scheduling follow-up role | 2026-09-10 | Participation and backup activation recorded—actual replacement service or resumption result pending`;

  return {
    intro: zh
      ? "用安全代號分開臨時中斷訊號、安全與急迫性核對、負責服務來源、目前版本、中斷確認、合格備援、本人參與、實際替代或恢復及未補缺口。這不是緊急照護計畫、排班系統、正式服務紀錄、醫療建議、申訴或責任判定工具。"
      : "Separate a temporary interruption signal, safety and urgency check, responsible source, current version, interruption confirmation, qualified backup, person participation, actual replacement or resumption and uncompensated gap with safe codes. This is not an emergency care plan, scheduling system, official service record, medical advice, complaint or liability decision.",
    fields: [
      text(
        "review",
        zh ? "臨時服務中斷私人核對代號" : "Private temporary service-interruption review reference",
        zh ? "只用安全家庭代號；不要輸入姓名、健康或照護內容、地址、工作人員、原因敘述、精確時段、費用、申訴內文或登入資料。" : "Use a safe household code. Do not enter names, health or care content, addresses, worker details, cause narratives, exact schedules, costs, complaint text or credentials.",
        "HOME-CARE-CONTINUITY-2026-A",
      ),
      {
        name: "context",
        label: zh ? "臨時服務中斷情境" : "Temporary service-interruption context",
        type: "select",
        options: zh
          ? ["臨時取消或未到", "服務人員臨時無法提供服務", "服務時間臨時異動", "服務單位通訊或排班中斷", "天災、事變或不可抗力造成異動", "家庭臨時取消及後續恢復", "替代人力、喘息或其他合格資源連結", "重複中斷、未補缺口或申訴追蹤"]
          : ["Temporary cancellation or missed service", "Worker temporarily unavailable", "Temporary service-window change", "Agency communication or scheduling interruption", "Disaster, incident or force-majeure disruption", "Household cancellation and later resumption", "Replacement staff, respite or other qualified-resource linkage", "Repeated interruption, uncompensated gap or complaint follow-up"],
      },
      { name: "baselineDate", label: zh ? "原服務與來源版本基準日" : "Original service and source-version baseline date", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: zh ? "本次中斷與持續服務核對日" : "Current interruption and service-continuity review date", type: "date", value: "2026-08-26" },
      { name: "nextReview", label: zh ? "下一次替代服務、恢復或負責結果核點" : "Next replacement-service, resumption or responsible-result checkpoint", type: "date", value: "2026-09-10" },
      text(
        "basis",
        zh ? "方案、個案管理、契約、服務單位、備援、申訴與安全來源地圖" : "Program, case-management, contract, agency, backup, complaint and safety-source map",
        zh ? "只放安全來源與版本代號；真正本人、照護指示、排班、服務、事件及申訴內容留在負責受保護來源。" : "Use safe source and version IDs only. Keep identity, care instructions, schedules, services, incidents and complaint content in responsible protected sources.",
        "PROGRAM-P1; PLAN-P3; CONTRACT-C3; AGENCY-S1; BACKUP-B; SAFETY-ROUTE-E1; COMPLAINT-R2",
      ),
      {
        name: "records",
        label: zh ? "有版本的臨時中斷、備援、替代服務與恢復結果列" : "Versioned interruption, backup, replacement-service and resumption-result rows",
        type: "textarea",
        help: zh ? "每行：ID｜安全本人代號與中斷情境｜負責方案、契約、個案管理或服務單位來源｜受保護本人與目前服務時段比對及來源核對日 YYYY-MM-DD｜目前照顧計畫、契約、授權或服務批次版本｜中斷訊號、負責確認、原因類別與回覆｜安全與急迫性核對及合格升級路徑｜合格備援選項、權限、本人參與、接受與啟動｜實際替代服務、恢復、未補缺口或申訴結果｜負責角色｜目標或結果日期 YYYY-MM-DD｜十二種指定狀態之一。最多 14 行。" : "One line: ID | safe care-person alias and interruption context | responsible program, contract, case-management or agency source | protected person and current service-window match plus source checked date YYYY-MM-DD | current plan, contract, authorization or service-batch version | interruption signal, responsible confirmation, reason category and response | safety and urgency check plus qualified escalation route | qualified backup option, authority, person participation, acceptance and activation | actual replacement service, resumption, uncompensated gap or complaint result | owner role | target or outcome date YYYY-MM-DD | one of the twelve exact statuses. Maximum 14 lines.",
        value: defaultRecords,
      },
      text(
        "storage",
        zh ? "受保護排班、契約、服務回覆、備援、實際結果與申訴歷程位置" : "Protected schedule, contract, agency response, backup, actual-result and complaint-history location",
        zh ? "只寫保管流程或容器代號；不要貼本人、照護、工作人員、精確時段、事件、費用、申訴、登入或私人內容。" : "Name a custody process or container, not identity, care, worker, exact schedule, incident, cost, complaint, login or private content.",
        zh ? "家庭紀錄／居家服務連續性／HOME-CARE-CONTINUITY-2026-A／受保護來源" : "Household records / home-care continuity / HOME-CARE-CONTINUITY-2026-A / protected sources",
      ),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!baselineDate || !reviewDate || !nextReview)
        return zh ? "請輸入有效的原服務基準日、本次核對日與下一核點日期。" : "Enter valid original-service baseline, current-review and next-checkpoint dates.";
      if (baselineDate > reviewDate)
        return zh ? "原服務與來源版本基準日不能晚於本次中斷核對日。" : "The original-service source baseline cannot be later than the current interruption review.";
      if (nextReview < reviewDate)
        return zh ? "下一次替代服務、恢復或負責結果核點不能早於本次核對日。" : "The next replacement-service, resumption or responsible-result checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 16 || values.storage.trim().length < 10)
        return zh ? "請提供安全的持續服務來源地圖與受保護保管位置代號。" : "Provide a safe service-continuity source map and protected storage-process label.";

      const rows = values.records.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
      if (!rows.length || rows.length > 14)
        return zh ? "請輸入 1 至 14 行臨時中斷、備援、替代服務與恢復狀態。" : "Enter 1 to 14 interruption, backup, replacement-service and resumption rows.";
      const recordRows = rows.map((row, index) => ({ line: index + 1, parts: row.split("|").map((part) => part.trim()) }));
      const malformed = recordRows.filter((row) => row.parts.length !== 12 || row.parts.some((part) => !part));
      if (malformed.length)
        return zh ? `臨時中斷第 ${malformed.map((row) => row.line).join("、")} 行必須剛好有 12 個非空白欄位。` : `Interruption line ${malformed.map((row) => row.line).join(", ")} must contain exactly 12 non-empty fields.`;
      const ids = recordRows.map((row) => row.parts[0].toUpperCase());
      if (new Set(ids).size !== ids.length)
        return zh ? "每一行臨時中斷紀錄都需要唯一 ID。" : "Every interruption row needs a unique ID.";
      const invalidStatuses = recordRows.filter((row) => !statusOrder.includes(row.parts[11]));
      if (invalidStatuses.length)
        return zh ? `臨時中斷第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用十二種指定狀態之一。` : `Interruption line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the twelve exact statuses.`;

      const openRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) < 9);
      const closedRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) >= 9);
      const checkedDateOf = (textValue: string) => strictIsoDate(textValue.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "");
      const invalidSourceDates = recordRows.filter((row) => {
        const checked = checkedDateOf(row.parts[3]);
        return !checked || checked < baselineDate || checked > reviewDate;
      });
      if (invalidSourceDates.length)
        return zh ? `臨時中斷第 ${invalidSourceDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的受保護來源核對日。` : `Interruption line ${invalidSourceDates.map((row) => row.line).join(", ")} needs a protected-source checked date from the baseline through this review.`;
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[10]);
        return !target || target < reviewDate || target > nextReview;
      });
      if (invalidOpenDates.length)
        return zh ? `仍開放的臨時中斷第 ${invalidOpenDates.map((row) => row.line).join("、")} 行需要介於本次核對日與下一核點的目標日。` : `Open interruption line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[10]);
        return !outcome || outcome < baselineDate || outcome > reviewDate;
      });
      if (invalidClosedDates.length)
        return zh ? `已核對、完成或不適用的臨時中斷第 ${invalidClosedDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的結果日。` : `Closed interruption line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an outcome date from the baseline through this review.`;

      const missingLayers = recordRows.filter((row) => row.parts[1].length < 8 || row.parts[2].length < 12 || row.parts[3].length < 18 || row.parts[4].length < 14 || row.parts[5].length < 14 || row.parts[6].length < 14 || row.parts[7].length < 14 || row.parts[8].length < 14 || row.parts[9].length < 4);
      if (missingLayers.length)
        return zh ? `臨時中斷第 ${missingLayers.map((row) => row.line).join("、")} 行需要真實的中斷情境、負責來源、本人與時段比對、目前版本、中斷確認、安全路徑、合格備援、實際替代或恢復結果及負責角色。` : `Interruption line ${missingLayers.map((row) => row.line).join(", ")} needs a real interruption context, responsible source, person and service-window match, current version, interruption confirmation, safety route, qualified backup, actual replacement or resumption result and owner.`;

      const reviewedWithoutEvidence = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[9]) return false;
        const sourceOk = zh ? /(?:方案|個案管理|契約|服務單位)/.test(row.parts[2]) : /(?:program|case-management|contract|agency)/i.test(row.parts[2]);
        const matchOk = zh ? /(?:受保護|本人).*(?:服務批次|時段|比對|證據)/.test(row.parts[3]) : /(?:protected|person).*(?:service batch|window|match|evidence)/i.test(row.parts[3]);
        const versionOk = zh ? /(?:照顧計畫|契約|授權|服務批次|目前)/.test(row.parts[4]) : /(?:plan|contract|authorization|service batch|current)/i.test(row.parts[4]);
        const interruptionOk = zh ? /(?:服務單位|負責).*(?:確認|回覆)/.test(row.parts[5]) : /(?:agency|responsible).*(?:confirmed|response)/i.test(row.parts[5]);
        const safetyOk = zh ? /(?:安全|急迫|緊急).*(?:核對|路徑)/.test(row.parts[6]) : /(?:safety|urgency|emergency).*(?:check|route)/i.test(row.parts[6]);
        const backupOk = zh ? /(?:合格|負責).*(?:替代|備援|喘息).*(?:本人|參與|接受|啟動)/.test(row.parts[7]) : /(?:qualified|responsible).*(?:replacement|backup|respite).*(?:person|participation|accepted|activation)/i.test(row.parts[7]);
        const resultOk = zh ? /(?:替代服務|恢復).*(?:觀察|結果|收到)/.test(row.parts[8]) : /(?:replacement service|resumed|resumption).*(?:observed|result|received)/i.test(row.parts[8]);
        const gapOk = zh ? /(?:未補|缺口|申訴)/.test(row.parts[8]) : /(?:uncompensated|gap|complaint)/i.test(row.parts[8]);
        const reopenOk = zh ? /(?:重新開啟|再次中斷)/.test(row.parts[8]) : /(?:reopen|interrupted again)/i.test(row.parts[8]);
        const unresolved = zh ? /(?:等待|仍待|尚待|未解|未知)/.test(row.parts.slice(2, 9).join(" ")) : /(?:pending|awaiting|unresolved|unknown)/i.test(row.parts.slice(2, 9).join(" "));
        return !sourceOk || !matchOk || !versionOk || !interruptionOk || !safetyOk || !backupOk || !resultOk || !gapOk || !reopenOk || unresolved;
      });
      if (reviewedWithoutEvidence.length)
        return zh ? `已核對的第 ${reviewedWithoutEvidence.map((row) => row.line).join("、")} 行必須具備負責來源、本人與時段比對、目前版本、中斷確認、安全路徑、合格備援與本人參與、實際替代或恢復、未補缺口／申訴及重開條件，且沒有未解缺口。` : `Reviewed interruption line ${reviewedWithoutEvidence.map((row) => row.line).join(", ")} must include the responsible source, person and service-window match, current version, interruption confirmation, safety route, qualified backup and person participation, actual replacement or resumption, uncompensated-gap or complaint route and reopen rule with no unresolved gap.`;

      const activationWithoutResult = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[7]) return false;
        const backup = row.parts[7];
        const result = row.parts[8];
        const participation = zh ? /(?:本人|參與|接受|啟動)/.test(backup) : /(?:person|participation|accepted|activation)/i.test(backup);
        const pending = zh ? /(?:等待|仍待|尚待)/.test(result) : /(?:pending|awaiting|remains)/i.test(result);
        const responsible = zh ? /(?:服務單位|方案|負責)/.test(result) : /(?:agency|program|responsible)/i.test(result);
        const gapRoute = zh ? /(?:未補|缺口|申訴)/.test(result) : /(?:uncompensated|gap|complaint)/i.test(result);
        return !participation || !pending || !responsible || !gapRoute;
      });
      if (activationWithoutResult.length)
        return zh ? `等待實際替代或恢復的第 ${activationWithoutResult.map((row) => row.line).join("、")} 行必須記錄本人參與及備援啟動，並把實際結果保持為負責來源待確認，同時指出未補缺口或申訴路徑。` : `Replacement-pending line ${activationWithoutResult.map((row) => row.line).join(", ")} must record person participation and backup activation, keep the actual result pending from a responsible source and identify an uncompensated-gap or complaint route.`;

      const conflictWithoutRoute = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[8]) return false;
        const combined = row.parts.slice(4, 9).join(" ");
        const conflict = zh ? /(?:安全|來源|服務範圍|費用|權利|矛盾|差異)/.test(combined) : /(?:safety|source|service scope|cost|rights|conflict|difference)/i.test(combined);
        const route = zh ? /(?:服務單位|方案|申訴|調處|合格|審查)/.test(combined) : /(?:agency|program|complaint|mediation|qualified|review)/i.test(combined);
        return !conflict || !route;
      });
      if (conflictWithoutRoute.length)
        return zh ? `矛盾列第 ${conflictWithoutRoute.map((row) => row.line).join("、")} 行必須指出安全、來源、服務範圍、費用或權利差異，以及負責服務單位、方案、申訴、調處或合格審查路徑。` : `Conflict line ${conflictWithoutRoute.map((row) => row.line).join(", ")} must name the safety, source, service-scope, cost or rights conflict and the responsible agency, program, complaint, mediation or qualified review route.`;

      const completedWithoutResult = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[10]) return false;
        const result = row.parts[8];
        const responsibleResult = zh ? /(?:負責|服務單位|方案).*(?:結果|回覆|確認).*(?:收到|觀察|記錄)/.test(result) : /(?:(?:responsible|agency|program).*(?:result|response|confirmation)).*(?:received|observed|recorded)/i.test(result);
        const custodyGapReopen = zh ? /(?:保管|未補|缺口|重新開啟)/.test(result) : /(?:custody|uncompensated|gap|reopen)/i.test(result);
        const unresolved = zh ? /(?:等待|仍待|尚待|未解|未知)/.test(result) : /(?:pending|awaiting|unresolved|unknown)/i.test(result);
        return !responsibleResult || !custodyGapReopen || unresolved;
      });
      if (completedWithoutResult.length)
        return zh ? `完成結果的第 ${completedWithoutResult.map((row) => row.line).join("、")} 行必須記錄已收到或觀察的負責持續服務結果、受保護保管、未補缺口及重新開啟條件。` : `Completed continuity-result line ${completedWithoutResult.map((row) => row.line).join(", ")} must record an observed responsible continuity result, protected custody, uncompensated gap and reopen condition.`;

      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[11] === statusOrder[11] && !(zh ? /(?:重新開啟|重新檢視|如果|當.*時|服務|方案|契約.*改變|再次中斷)/.test(row.parts[8]) : /(?:reopen|review again|if |when |service|program|contract.*change|interrupted again)/i.test(row.parts[8])));
      if (notApplicableWithoutTrigger.length)
        return zh ? `不適用的第 ${notApplicableWithoutTrigger.map((row) => row.line).join("、")} 行必須記錄目前原因，以及服務、方案、契約改變或再次中斷時的重開事件。` : `Not-applicable line ${notApplicableWithoutTrigger.map((row) => row.line).join(", ")} must state the current reason and the service, program, contract change or later interruption that reopens it.`;

      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return zh ? "偵測到可能的完整電話、Email、案件、會員、服務對象、工作人員、費用或其他長數字識別資料。請改用安全來源、服務批次與結果代號。" : "A possible full phone, email, case, member, care-recipient, worker, cost or other long numeric identifier was detected. Use a safe source, service-batch and result pointer.";
      if (/password|passphrase|passcode|access code|door code|alarm code|security code|recovery code|verification code|login credential|full address|street address|care-recipient name\s*[:=]|patient name\s*[:=]|person name\s*[:=]|provider name\s*[:=]|agency name\s*[:=]|worker name\s*[:=]|employee name\s*[:=]|date of birth\s*[:=]|diagnosis\s*[:=]|condition\s*[:=]|symptom\s*[:=]|allerg(?:y|ies)\s*[:=]|medication name\s*[:=]|drug name\s*[:=]|medicine name\s*[:=]|dose\s*[:=]|dosage\s*[:=]|\b\d+(?:\.\d+)?\s*(?:mg|mcg|ml)\b|feeding|swallowing|transfer step|lifting step|mobility detail|toileting|bathing|wound|device instruction|behavior(?:al)? detail|mental health|care note|treatment plan|exact time|arrival time\s*[:=]|departure time\s*[:=]|exact location|precise location|GPS|case number\s*[:=]|member number\s*[:=]|patient ID\s*[:=]|provider ID\s*[:=]|worker ID\s*[:=]|billing amount\s*[:=]|claim amount\s*[:=]|invoice amount\s*[:=]|incident text\s*[:=]|complaint text\s*[:=]|signature|signed form|private message|correspondence|完整地址|被照顧者姓名\s*[:：]|病人姓名\s*[:：]|本人姓名\s*[:：]|服務單位名稱\s*[:：]|工作人員姓名\s*[:：]|居服員姓名\s*[:：]|出生日期\s*[:：]|診斷\s*[:：]|病況\s*[:：]|症狀\s*[:：]|過敏\s*[:：]|藥名\s*[:：]|用藥名稱\s*[:：]|劑量\s*[:：]|餵食|吞嚥|移位步驟|攙扶步驟|行動細節|如廁|沐浴|傷口|管路|輔具指示|行為處理|心理健康內容|照護紀錄內容|精確時間|到場時間\s*[:：]|離場時間\s*[:：]|精確位置|詳細地點|GPS|案件編號\s*[:：]|會員號\s*[:：]|服務對象編號\s*[:：]|工作人員編號\s*[:：]|計費金額\s*[:：]|請款金額\s*[:：]|事件全文|申訴全文|簽名|門鎖密碼|保全密碼|登入密碼|驗證碼|私人訊息|通信內容/i.test(privacyText))
        return zh ? "偵測到可能的本人、服務單位、地址、健康照護、工作人員、中斷原因、精確時間位置、案件費用、事件／申訴全文、簽名、登入或私人通信內容。請改成安全來源、類別、服務批次、備援或結果代號。" : "A possible identity, provider, address, health or care, worker, interruption-cause, exact time or location, case or cost, incident or complaint text, signature, credential or private correspondence detail was detected. Use a safe source, category, service-batch, backup or result pointer.";

      const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[11] === status).length })).filter((item) => item.count > 0);
      if (zh)
        return `${values.review.trim()}｜居家服務臨時中斷、備援與恢復狀態
中斷情境：${values.context}
原服務與來源版本基準：${formatter.format(baselineDate)}
本次中斷與持續服務核對：${formatter.format(reviewDate)}
下一次替代服務、恢復或負責結果核點：${formatter.format(nextReview)}
仍開放的安全、來源、版本、備援、替代服務或審查列：${openRows.length} 筆
已核對、完成或不適用列：${closedRows.length} 筆
狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}

方案、個案管理、契約、服務單位、備援、申訴與安全來源地圖：${values.basis.trim()}

${lines("有版本的臨時中斷、備援、替代服務與恢復結果證據", recordRows.map((row) => `${row.parts[0]}｜本人／中斷情境：${row.parts[1]}｜負責服務來源：${row.parts[2]}｜受保護本人與服務時段比對：${row.parts[3]}｜目前服務版本：${row.parts[4]}｜中斷確認／原因類別／負責回覆：${row.parts[5]}｜安全與急迫性核對／升級路徑：${row.parts[6]}｜合格備援／權限／本人參與／接受／啟動：${row.parts[7]}｜實際替代／恢復／未補缺口／申訴結果：${row.parts[8]}｜負責角色：${row.parts[9]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[10]) as Date)}｜狀態：${row.parts[11]}`))}

受保護排班、契約、服務回覆、備援、實際結果與申訴歷程位置：${values.storage.trim()}

這份輸出只是家庭居家服務臨時中斷、備援、替代與恢復來源索引，不是緊急照護計畫、醫療建議、正式排班、EVV、工時、服務、事件、契約、給付、申訴、調處或法律紀錄。它不判斷安全或責任、不提供臨時照護、不指揮親友執行照護、不聯絡或派遣人員、不保證替代服務、不計算費用或期限，也不把非正式協助寫成已授權服務。若有立即危險，先使用所在地緊急服務與目前合格照護來源；其他真實中斷、備援與權利請直接使用目前照顧計畫、契約、服務單位、A 單位個案管理、照管中心、地方主管機關及合格來源。`;
      return `${values.review.trim()} — home-care temporary interruption, backup and resumption status
Interruption context: ${values.context}
Original service and source-version baseline: ${formatter.format(baselineDate)}
Current interruption and continuity review: ${formatter.format(reviewDate)}
Next replacement-service, resumption or responsible-result checkpoint: ${formatter.format(nextReview)}
Open safety, source, version, backup, replacement-service or review rows: ${openRows.length}
Reviewed, completed or not-applicable rows: ${closedRows.length}
Status count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}

Program, case-management, contract, agency, backup, complaint and safety-source map: ${values.basis.trim()}

${lines("Versioned interruption, backup, replacement-service and resumption-result evidence", recordRows.map((row) => `${row.parts[0]} — person/interruption context: ${row.parts[1]} — responsible service source: ${row.parts[2]} — protected person and service-window match: ${row.parts[3]} — current service version: ${row.parts[4]} — interruption confirmation/reason category/responsible response: ${row.parts[5]} — safety and urgency check/escalation route: ${row.parts[6]} — qualified backup/authority/person participation/acceptance/activation: ${row.parts[7]} — actual replacement/resumption/uncompensated gap/complaint result: ${row.parts[8]} — owner: ${row.parts[9]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[10]) as Date)} — status: ${row.parts[11]}`))}

Protected schedule, contract, agency response, backup, actual-result and complaint-history location: ${values.storage.trim()}

This output is a household home-care temporary-interruption, backup, replacement and resumption source index, not an emergency care plan, medical advice, official schedule, EVV, timesheet, service, incident, contract, coverage, complaint, mediation or legal record. It does not determine safety or responsibility; provide temporary care; direct an informal helper to perform care; contact or dispatch staff; guarantee replacement service; calculate costs or deadlines; or convert informal help into authorized service. If there is immediate danger, use local emergency services and the current qualified care source first. Use the current service plan, contract, responsible agency, case manager, program, state or local authority and qualified source for every real interruption, backup arrangement and right.`;
    },
  };
};

const homeCareComplaintDefinition = (locale: Locale): Definition => {
  const zh = locale === "zh-TW";
  const statusOrder = zh
    ? [
        "已收到居家服務疑慮訊號，等待安全核對與路徑分類",
        "已完成安全與不利處分風險核對，等待負責詢問、申訴或調處來源",
        "已記錄負責處理來源，等待受保護本人與服務關係比對",
        "已記錄本人與服務關係比對，等待事件來源版本與證據保管",
        "已記錄事件來源與保管，等待受理類型、收件或案件狀態",
        "已記錄受理與案件狀態，等待調查角色、回覆範圍與下一程序",
        "已記錄調查與回覆範圍，等待本人參與及希望處理結果",
        "已記錄本人參與與希望結果，等待可歸屬回覆、改善行動與實際服務結果",
        "安全、事實、服務、給付、費用、管轄或權利矛盾，等待負責審查",
        "已核對疑慮來源、受理、調查、本人參與、回覆與實際改善結果",
        "已收到負責處理結果，記錄實際改變、保管與重新開啟條件",
        "不適用，已記錄原因與重新開啟事件",
      ]
    : [
        "Home-care concern signal received—safety check and route classification pending",
        "Safety and retaliation-risk check recorded—responsible inquiry, complaint or mediation source pending",
        "Responsible handling source recorded—protected person and service-relationship match pending",
        "Person and service-relationship match recorded—event-source version and evidence custody pending",
        "Event source and custody recorded—intake type, receipt or case status pending",
        "Intake and case status recorded—investigator, response scope and next process pending",
        "Investigation and response scope recorded—person participation and requested outcome pending",
        "Participation and requested outcome recorded—attributable response, corrective action and actual service result pending",
        "Safety, fact, service, benefit, cost, jurisdiction or rights conflict—responsible review pending",
        "Concern source, intake, investigation, participation, response and actual improvement result reviewed",
        "Responsible handling result received—actual change, custody and reopen condition recorded",
        "Not applicable—reason and reopen event recorded",
      ];

  const defaultRecords = zh
    ? `COMPLAINT-A | 被照顧者 A 的居家服務持續性疑慮；本次正式處理結果核對 | 目前服務單位內部申訴、A 單位個案管理與地方主管機關來源；詢問、申訴與調處分開 | 受保護本人與目前服務關係已比對；證據 CARE-A-COMPLAINT5；核對 2026-08-26 | 事件來源 VISIT-E4、服務單位回覆 R6 與受保護證據容器 CUSTODY-C 已開啟；敘述留在正式程序 | 受理類型為服務單位內部申訴；收件 ACK-4 與案件狀態 CASE-OPEN 已由負責來源觀察 | 調查角色為服務單位管理窗口；回覆範圍、預計下一程序與外部主管機關路徑已記錄；沒有自行判定責任 | 本人參與來源與希望處理結果已記錄；沒有把家屬不滿自動寫成本人決定；授權留在受保護來源 | 可歸屬回覆 RESULT-4 已收到；改善行動 ACTION-3 與後續實際服務結果已觀察；未解項目 GAP-0；服務、回覆或結果改變時重新開啟 | 家庭申訴來源協調角色 | 2026-08-26 | 已核對疑慮來源、受理、調查、本人參與、回覆與實際改善結果
RESPONSE-A | 被照顧者 A 的重複臨時取消疑慮；等待實際改善結果 | 目前服務單位內部申訴與地方主管機關陳情來源；給付異議與服務品質路徑保持分開 | 受保護本人與目前服務關係已比對；證據 CARE-A-RESPONSE5；核對 2026-08-26 | 中斷事件 GAP-B、契約版本 C3 與服務單位收件 ACK-5 指標已開啟；內容留在正式程序 | 受理類型為服務持續性申訴；收件 ACK-5 已觀察；案件狀態 INVESTIGATING | 負責調查角色與回覆範圍已確認；若內部結果未解，地方主管機關陳情或調處路徑已映射 | 本人參與與希望取得持續服務說明的結果已記錄；沒有要求工具判定賠償、違約或處分 | 服務單位初步回覆已收到，但改善行動後的實際服務結果仍待負責來源觀察；未解缺口與外部申訴路徑已保留 | 家庭服務結果追蹤角色 | 2026-09-10 | 已記錄本人參與與希望結果，等待可歸屬回覆、改善行動與實際服務結果`
    : `COMPLAINT-A | Care person A home-care continuity concern; current formal handling-result review | Current agency complaint, case-management and state or local authority sources; inquiry, complaint and external review remain separate | Protected person and current service relationship matched; evidence CARE-A-COMPLAINT5; checked 2026-08-26 | Event source VISIT-E4, agency response R6 and protected evidence container CUSTODY-C opened; narrative stays in the official process | Intake type is an agency complaint; receipt ACK-4 and case status CASE-OPEN observed from the responsible source | Investigator is the agency administrative route; response scope, next process and state hotline or responsible external route recorded; no liability inferred | Person participation source and requested outcome recorded; family dissatisfaction is not treated as the person's decision; authority stays protected | Attributable response RESULT-4 received; corrective action ACTION-3 and later actual service result observed; unresolved item GAP-0; reopen if service, response or result changes | Household complaint-source coordination role | 2026-08-26 | Concern source, intake, investigation, participation, response and actual improvement result reviewed
RESPONSE-A | Care person A repeated temporary-cancellation concern; actual improvement result pending | Current agency complaint and state program or authority sources; benefit appeal and service-quality routes remain separate | Protected person and current service relationship matched; evidence CARE-A-RESPONSE5; checked 2026-08-26 | Interruption event GAP-B, contract version C3 and agency receipt ACK-5 pointers opened; narrative stays in the official process | Intake type is a service-continuity complaint; receipt ACK-5 observed; case status INVESTIGATING | Responsible investigator and response scope confirmed; state complaint or program review route mapped if the internal result remains unresolved | Person participation and requested continuity explanation recorded; the tool is not asked to decide damages, breach or sanctions | Initial agency response received, but actual service result after corrective action remains pending from the responsible source; unresolved gap and external complaint route preserved | Household service-result follow-up role | 2026-09-10 | Participation and requested outcome recorded—attributable response, corrective action and actual service result pending`;

  return {
    intro: zh
      ? "用安全代號分開居家服務疑慮、安全與不利處分風險、負責處理來源、本人與服務關係、事件證據、受理類型、調查、本人參與、可歸屬回覆、改善行動與實際結果。這不是申訴書、法律意見、送件器、調查或成功率預測工具。"
      : "Separate a home-care concern, safety and retaliation risk, responsible handling source, person and service relationship, event evidence, intake type, investigation, person participation, attributable response, corrective action and actual result with safe codes. This is not a complaint form, legal advice, filing service, investigation or success prediction.",
    fields: [
      text(
        "review",
        zh ? "居家服務疑慮私人核對代號" : "Private home-care concern review reference",
        zh ? "只用安全家庭代號；不要輸入姓名、地址、健康照護內容、工作人員、指控敘述、完整申訴、案件、費用、簽名或登入資料。" : "Use a safe household code. Do not enter names, addresses, health or care content, worker details, allegation narratives, complaint text, case or cost details, signatures or credentials.",
        "HOME-CARE-COMPLAINT-2026-A",
      ),
      {
        name: "context",
        label: zh ? "居家服務疑慮與處理情境" : "Home-care concern and handling context",
        type: "select",
        options: zh
          ? ["一般詢問或說明需求", "服務單位內部抱怨或申訴", "服務品質、未提供或不一致疑慮", "持續服務、排班或溝通疑慮", "照顧計畫、給付或不利決定異議", "契約、費用或付款責任爭議", "地方主管機關陳情、申訴或調處", "安全、權利、不利處分或外部審查追蹤"]
          : ["Customer-service inquiry or explanation request", "Agency complaint or grievance", "Care quality, failure-to-furnish or inconsistency concern", "Service continuity, scheduling or communication concern", "Plan, benefit or adverse-decision appeal", "Contract, cost or payment-responsibility dispute", "State program, survey agency or external complaint", "Safety, rights, retaliation or external-review follow-up"],
      },
      { name: "baselineDate", label: zh ? "事件與來源版本基準日" : "Event and source-version baseline date", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: zh ? "本次受理、回覆與結果核對日" : "Current intake, response and result review date", type: "date", value: "2026-08-26" },
      { name: "nextReview", label: zh ? "下一次調查、回覆或實際改善結果核點" : "Next investigation, response or actual-improvement checkpoint", type: "date", value: "2026-09-10" },
      text(
        "basis",
        zh ? "服務單位、方案、個案管理、主管機關、申訴、調處與安全來源地圖" : "Agency, program, case-management, authority, complaint, mediation and safety-source map",
        zh ? "只放安全來源與版本代號；完整事件、本人、服務、契約、費用、證據、申訴及調查內容留在負責受保護程序。" : "Use safe source and version IDs only. Keep complete event, person, service, contract, cost, evidence, complaint and investigation content in responsible protected processes.",
        "AGENCY-C1; PROGRAM-P1; CASE-MGMT-A1; AUTHORITY-S1; COMPLAINT-R2; REVIEW-R3; SAFETY-E1",
      ),
      {
        name: "records",
        label: zh ? "有版本的疑慮、受理、調查、回覆、改善與實際結果列" : "Versioned concern, intake, investigation, response, correction and actual-result rows",
        type: "textarea",
        help: zh ? "每行：ID｜安全本人代號與疑慮情境｜負責服務單位、方案、個案管理或主管機關處理來源｜受保護本人與服務關係比對及來源核對日 YYYY-MM-DD｜事件來源版本與證據保管｜受理類型、收件及案件狀態｜安全、不利處分風險、調查角色、回覆範圍與下一程序｜本人參與及希望處理結果｜可歸屬回覆、改善行動、實際服務結果、未解項目與重開條件｜負責角色｜目標或結果日期 YYYY-MM-DD｜十二種指定狀態之一。最多 14 行。" : "One line: ID | safe care-person alias and concern context | responsible agency, program, case-management or authority handling source | protected person and service-relationship match plus source checked date YYYY-MM-DD | event-source version and evidence custody | intake type, receipt and case status | safety, retaliation risk, investigator, response scope and next process | person participation and requested outcome | attributable response, corrective action, actual service result, unresolved item and reopen rule | owner role | target or outcome date YYYY-MM-DD | one of the twelve exact statuses. Maximum 14 lines.",
        value: defaultRecords,
      },
      text(
        "storage",
        zh ? "受保護事件、收件、調查、回覆、改善、結果與申訴歷程位置" : "Protected event, receipt, investigation, response, correction, result and complaint-history location",
        zh ? "只寫保管流程或容器代號；不要貼本人、照護、工作人員、指控、證據全文、費用、申訴、簽名、登入或私人內容。" : "Name a custody process or container, not identity, care, worker, allegation, full evidence, cost, complaint, signature, login or private content.",
        zh ? "家庭紀錄／居家服務申訴／HOME-CARE-COMPLAINT-2026-A／受保護程序" : "Household records / home-care complaints / HOME-CARE-COMPLAINT-2026-A / protected process",
      ),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!baselineDate || !reviewDate || !nextReview)
        return zh ? "請輸入有效的事件基準日、本次核對日與下一核點日期。" : "Enter valid event baseline, current-review and next-checkpoint dates.";
      if (baselineDate > reviewDate)
        return zh ? "事件與來源版本基準日不能晚於本次受理、回覆與結果核對日。" : "The event and source-version baseline cannot be later than the current intake, response and result review.";
      if (nextReview < reviewDate)
        return zh ? "下一次調查、回覆或實際改善結果核點不能早於本次核對日。" : "The next investigation, response or actual-improvement checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 16 || values.storage.trim().length < 10)
        return zh ? "請提供安全的疑慮處理來源地圖與受保護程序位置代號。" : "Provide a safe concern-handling source map and protected-process label.";

      const rows = values.records.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
      if (!rows.length || rows.length > 14)
        return zh ? "請輸入 1 至 14 行疑慮、受理、調查、回覆、改善與實際結果狀態。" : "Enter 1 to 14 concern, intake, investigation, response, correction and actual-result rows.";
      const recordRows = rows.map((row, index) => ({ line: index + 1, parts: row.split("|").map((part) => part.trim()) }));
      const malformed = recordRows.filter((row) => row.parts.length !== 12 || row.parts.some((part) => !part));
      if (malformed.length)
        return zh ? `疑慮處理第 ${malformed.map((row) => row.line).join("、")} 行必須剛好有 12 個非空白欄位。` : `Concern-handling line ${malformed.map((row) => row.line).join(", ")} must contain exactly 12 non-empty fields.`;
      const ids = recordRows.map((row) => row.parts[0].toUpperCase());
      if (new Set(ids).size !== ids.length)
        return zh ? "每一行疑慮處理紀錄都需要唯一 ID。" : "Every concern-handling row needs a unique ID.";
      const invalidStatuses = recordRows.filter((row) => !statusOrder.includes(row.parts[11]));
      if (invalidStatuses.length)
        return zh ? `疑慮處理第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用十二種指定狀態之一。` : `Concern-handling line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the twelve exact statuses.`;

      const openRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) < 9);
      const closedRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) >= 9);
      const checkedDateOf = (textValue: string) => strictIsoDate(textValue.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "");
      const invalidSourceDates = recordRows.filter((row) => {
        const checked = checkedDateOf(row.parts[3]);
        return !checked || checked < baselineDate || checked > reviewDate;
      });
      if (invalidSourceDates.length)
        return zh ? `疑慮處理第 ${invalidSourceDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的受保護來源核對日。` : `Concern-handling line ${invalidSourceDates.map((row) => row.line).join(", ")} needs a protected-source checked date from the baseline through this review.`;
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[10]);
        return !target || target < reviewDate || target > nextReview;
      });
      if (invalidOpenDates.length)
        return zh ? `仍開放的疑慮處理第 ${invalidOpenDates.map((row) => row.line).join("、")} 行需要介於本次核對日與下一核點的目標日。` : `Open concern-handling line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[10]);
        return !outcome || outcome < baselineDate || outcome > reviewDate;
      });
      if (invalidClosedDates.length)
        return zh ? `已核對、完成或不適用的疑慮處理第 ${invalidClosedDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的結果日。` : `Closed concern-handling line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an outcome date from the baseline through this review.`;

      const missingLayers = recordRows.filter((row) => row.parts[1].length < 8 || row.parts[2].length < 12 || row.parts[3].length < 18 || row.parts[4].length < 14 || row.parts[5].length < 12 || row.parts[6].length < 14 || row.parts[7].length < 12 || row.parts[8].length < 14 || row.parts[9].length < 4);
      if (missingLayers.length)
        return zh ? `疑慮處理第 ${missingLayers.map((row) => row.line).join("、")} 行需要真實的疑慮情境、負責來源、本人與服務關係、事件與保管、受理、調查與安全路徑、本人參與、回覆／改善／實際結果及負責角色。` : `Concern-handling line ${missingLayers.map((row) => row.line).join(", ")} needs a real concern context, responsible source, person and service relationship, event and custody, intake, investigation and safety route, person participation, response or correction or actual result and owner.`;

      const reviewedWithoutEvidence = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[9]) return false;
        const sourceOk = zh ? /(?:服務單位|個案管理|主管機關|方案)/.test(row.parts[2]) : /(?:agency|case-management|authority|program)/i.test(row.parts[2]);
        const matchOk = zh ? /(?:受保護|本人).*(?:服務關係|比對|證據)/.test(row.parts[3]) : /(?:protected|person).*(?:service relationship|match|evidence)/i.test(row.parts[3]);
        const custodyOk = zh ? /(?:事件|證據|保管|容器)/.test(row.parts[4]) : /(?:event|evidence|custody|container)/i.test(row.parts[4]);
        const intakeOk = zh ? /(?:受理|收件|案件狀態|申訴)/.test(row.parts[5]) : /(?:intake|receipt|case status|complaint)/i.test(row.parts[5]);
        const investigationOk = zh ? /(?:調查|回覆範圍|下一程序|主管機關)/.test(row.parts[6]) : /(?:investigator|response scope|next process|state|authority)/i.test(row.parts[6]);
        const participationOk = zh ? /(?:本人參與|希望.*結果|授權)/.test(row.parts[7]) : /(?:person participation|requested outcome|authority)/i.test(row.parts[7]);
        const responseOk = zh ? /(?:回覆|結果).*(?:收到|觀察)/.test(row.parts[8]) : /(?:response|result).*(?:received|observed)/i.test(row.parts[8]);
        const actionOk = zh ? /(?:改善行動|實際服務結果)/.test(row.parts[8]) : /(?:corrective action|actual service result)/i.test(row.parts[8]);
        const unresolvedOk = zh ? /(?:未解|GAP-0)/.test(row.parts[8]) : /(?:unresolved|GAP-0)/i.test(row.parts[8]);
        const reopenOk = zh ? /(?:重新開啟|改變)/.test(row.parts[8]) : /(?:reopen|change)/i.test(row.parts[8]);
        const pending = zh ? /(?:等待|仍待|尚待|未知)/.test(row.parts.slice(2, 9).join(" ")) : /(?:pending|awaiting|unknown)/i.test(row.parts.slice(2, 9).join(" "));
        return !sourceOk || !matchOk || !custodyOk || !intakeOk || !investigationOk || !participationOk || !responseOk || !actionOk || !unresolvedOk || !reopenOk || pending;
      });
      if (reviewedWithoutEvidence.length)
        return zh ? `已核對的第 ${reviewedWithoutEvidence.map((row) => row.line).join("、")} 行必須具備負責來源、本人與服務關係、事件保管、受理、調查與下一程序、本人參與、可歸屬回覆、改善行動、實際服務結果、未解項目及重開條件，且沒有待確認缺口。` : `Reviewed concern line ${reviewedWithoutEvidence.map((row) => row.line).join(", ")} must include the responsible source, person and service relationship, event custody, intake, investigation and next process, person participation, attributable response, corrective action, actual service result, unresolved item and reopen rule with no pending gap.`;

      const responsePendingWithoutRoute = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[7]) return false;
        const participation = zh ? /(?:本人參與|希望.*結果)/.test(row.parts[7]) : /(?:person participation|requested outcome)/i.test(row.parts[7]);
        const pending = zh ? /(?:等待|仍待|尚待)/.test(row.parts[8]) : /(?:pending|awaiting|remains)/i.test(row.parts[8]);
        const responsible = zh ? /(?:服務單位|方案|主管機關|負責)/.test(row.parts[8]) : /(?:agency|program|authority|responsible)/i.test(row.parts[8]);
        const externalRoute = zh ? /(?:未解|申訴|主管機關|調處)/.test(row.parts[8]) : /(?:unresolved|complaint|authority|mediation)/i.test(row.parts[8]);
        return !participation || !pending || !responsible || !externalRoute;
      });
      if (responsePendingWithoutRoute.length)
        return zh ? `等待實際改善的第 ${responsePendingWithoutRoute.map((row) => row.line).join("、")} 行必須記錄本人參與與希望結果，把改善後服務結果保持為負責來源待確認，並保留未解或外部處理路徑。` : `Improvement-pending line ${responsePendingWithoutRoute.map((row) => row.line).join(", ")} must record person participation and requested outcome, keep the post-correction service result pending from a responsible source and preserve an unresolved or external handling route.`;

      const conflictWithoutRoute = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[8]) return false;
        const combined = row.parts.slice(4, 9).join(" ");
        const conflict = zh ? /(?:安全|事實|服務|給付|費用|管轄|權利|矛盾|差異)/.test(combined) : /(?:safety|fact|service|benefit|cost|jurisdiction|rights|conflict|difference)/i.test(combined);
        const route = zh ? /(?:服務單位|方案|主管機關|申訴|調處|審查)/.test(combined) : /(?:agency|program|authority|complaint|mediation|review)/i.test(combined);
        return !conflict || !route;
      });
      if (conflictWithoutRoute.length)
        return zh ? `矛盾列第 ${conflictWithoutRoute.map((row) => row.line).join("、")} 行必須指出安全、事實、服務、給付、費用、管轄或權利差異，以及負責服務單位、方案、主管機關、申訴、調處或審查路徑。` : `Conflict line ${conflictWithoutRoute.map((row) => row.line).join(", ")} must name the safety, fact, service, benefit, cost, jurisdiction or rights conflict and the responsible agency, program, authority, complaint, mediation or review route.`;

      const completedWithoutResult = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[10]) return false;
        const result = row.parts[8];
        const responsibleResult = zh ? /(?:負責|服務單位|方案|主管機關).*(?:結果|回覆).*(?:收到|觀察|記錄)/.test(result) : /(?:(?:responsible|agency|program|authority).*(?:result|response)).*(?:received|observed|recorded)/i.test(result);
        const changeCustodyReopen = zh ? /(?:實際改變|保管|重新開啟)/.test(result) : /(?:actual change|custody|reopen)/i.test(result);
        const unresolved = zh ? /(?:等待|仍待|尚待|未知)/.test(result) : /(?:pending|awaiting|unknown)/i.test(result);
        return !responsibleResult || !changeCustodyReopen || unresolved;
      });
      if (completedWithoutResult.length)
        return zh ? `完成結果的第 ${completedWithoutResult.map((row) => row.line).join("、")} 行必須記錄已收到或觀察的負責處理結果、實際改變、受保護保管及重新開啟條件。` : `Completed handling-result line ${completedWithoutResult.map((row) => row.line).join(", ")} must record an observed responsible handling result, actual change, protected custody and reopen condition.`;

      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[11] === statusOrder[11] && !(zh ? /(?:重新開啟|重新檢視|如果|當.*時|服務|回覆|結果|方案.*改變)/.test(row.parts[8]) : /(?:reopen|review again|if |when |service|response|result|program.*change)/i.test(row.parts[8])));
      if (notApplicableWithoutTrigger.length)
        return zh ? `不適用的第 ${notApplicableWithoutTrigger.map((row) => row.line).join("、")} 行必須記錄目前原因，以及服務、回覆、結果或方案改變時的重開事件。` : `Not-applicable line ${notApplicableWithoutTrigger.map((row) => row.line).join(", ")} must state the current reason and the service, response, result or program change that reopens it.`;

      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return zh ? "偵測到可能的完整電話、Email、案件、會員、服務對象、工作人員、費用或其他長數字識別資料。請改用安全事件、收件、案件狀態與結果代號。" : "A possible full phone, email, case, member, care-recipient, worker, cost or other long numeric identifier was detected. Use a safe event, receipt, case-status and result pointer.";
      if (/password|passphrase|passcode|access code|door code|alarm code|security code|recovery code|verification code|login credential|full address|street address|care-recipient name\s*[:=]|patient name\s*[:=]|person name\s*[:=]|provider name\s*[:=]|agency name\s*[:=]|worker name\s*[:=]|employee name\s*[:=]|date of birth\s*[:=]|diagnosis\s*[:=]|condition\s*[:=]|symptom\s*[:=]|allerg(?:y|ies)\s*[:=]|medication name\s*[:=]|drug name\s*[:=]|medicine name\s*[:=]|dose\s*[:=]|dosage\s*[:=]|\b\d+(?:\.\d+)?\s*(?:mg|mcg|ml)\b|feeding|swallowing|transfer step|lifting step|mobility detail|toileting|bathing|wound|device instruction|behavior(?:al)? detail|mental health|care note|treatment plan|exact time|arrival time\s*[:=]|departure time\s*[:=]|exact location|precise location|GPS|case number\s*[:=]|member number\s*[:=]|patient ID\s*[:=]|provider ID\s*[:=]|worker ID\s*[:=]|billing amount\s*[:=]|claim amount\s*[:=]|invoice amount\s*[:=]|allegation\s*[:=]|evidence text\s*[:=]|complaint text\s*[:=]|appeal text\s*[:=]|signature|signed form|private message|correspondence|完整地址|被照顧者姓名\s*[:：]|病人姓名\s*[:：]|本人姓名\s*[:：]|服務單位名稱\s*[:：]|工作人員姓名\s*[:：]|居服員姓名\s*[:：]|出生日期\s*[:：]|診斷\s*[:：]|病況\s*[:：]|症狀\s*[:：]|過敏\s*[:：]|藥名\s*[:：]|用藥名稱\s*[:：]|劑量\s*[:：]|餵食|吞嚥|移位步驟|攙扶步驟|行動細節|如廁|沐浴|傷口|管路|輔具指示|行為處理|心理健康內容|照護紀錄內容|精確時間|到場時間\s*[:：]|離場時間\s*[:：]|精確位置|詳細地點|GPS|案件編號\s*[:：]|會員號\s*[:：]|服務對象編號\s*[:：]|工作人員編號\s*[:：]|計費金額\s*[:：]|請款金額\s*[:：]|指控內容|證據全文|申訴全文|異議全文|簽名|門鎖密碼|保全密碼|登入密碼|驗證碼|私人訊息|通信內容/i.test(privacyText))
        return zh ? "偵測到可能的本人、服務單位、地址、健康照護、工作人員、精確時間位置、案件費用、指控／證據／申訴全文、簽名、登入或私人通信內容。請改成安全事件、來源、收件、案件狀態、改善或結果代號。" : "A possible identity, provider, address, health or care, worker, exact time or location, case or cost, allegation or evidence or complaint text, signature, credential or private correspondence detail was detected. Use a safe event, source, receipt, case-status, correction or result pointer.";

      const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[11] === status).length })).filter((item) => item.count > 0);
      if (zh)
        return `${values.review.trim()}｜居家服務疑慮、受理、回覆與實際改善狀態
疑慮與處理情境：${values.context}
事件與來源版本基準：${formatter.format(baselineDate)}
本次受理、回覆與結果核對：${formatter.format(reviewDate)}
下一次調查、回覆或實際改善結果核點：${formatter.format(nextReview)}
仍開放的安全、來源、受理、調查、回覆、改善或審查列：${openRows.length} 筆
已核對、完成或不適用列：${closedRows.length} 筆
狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}

服務單位、方案、個案管理、主管機關、申訴、調處與安全來源地圖：${values.basis.trim()}

${lines("有版本的疑慮、受理、調查、回覆、改善與實際結果證據", recordRows.map((row) => `${row.parts[0]}｜本人／疑慮情境：${row.parts[1]}｜負責處理來源：${row.parts[2]}｜受保護本人與服務關係：${row.parts[3]}｜事件來源／證據保管：${row.parts[4]}｜受理類型／收件／案件狀態：${row.parts[5]}｜安全／不利處分風險／調查／回覆範圍／下一程序：${row.parts[6]}｜本人參與／希望結果：${row.parts[7]}｜回覆／改善行動／實際結果／未解項目／重開：${row.parts[8]}｜負責角色：${row.parts[9]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[10]) as Date)}｜狀態：${row.parts[11]}`))}

受保護事件、收件、調查、回覆、改善、結果與申訴歷程位置：${values.storage.trim()}

這份輸出只是家庭居家服務疑慮來源、受理、回覆、改善與實際結果索引，不是申訴書、陳情、調處申請、法律意見、醫療或服務紀錄、正式案件、調查、證詞或證據。它不判斷安全、虐待、疏忽、違約、責任或處分；不代表本人授權或送件；不聯絡單位、不提交申訴、不選管轄、不計算期限、不保證結果，也不把服務單位回覆寫成實際改善。有立即危險或依法應立即通報的情況，先使用所在地緊急與正式通報來源；其他疑慮請直接使用目前服務單位、A 單位個案管理、照管中心、1966、地方主管機關、契約、方案及合格程序。`;
      return `${values.review.trim()} — home-care concern, intake, response and actual-improvement status
Concern and handling context: ${values.context}
Event and source-version baseline: ${formatter.format(baselineDate)}
Current intake, response and result review: ${formatter.format(reviewDate)}
Next investigation, response or actual-improvement checkpoint: ${formatter.format(nextReview)}
Open safety, source, intake, investigation, response, correction or review rows: ${openRows.length}
Reviewed, completed or not-applicable rows: ${closedRows.length}
Status count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}

Agency, program, case-management, authority, complaint, mediation and safety-source map: ${values.basis.trim()}

${lines("Versioned concern, intake, investigation, response, correction and actual-result evidence", recordRows.map((row) => `${row.parts[0]} — person/concern context: ${row.parts[1]} — responsible handling source: ${row.parts[2]} — protected person and service relationship: ${row.parts[3]} — event source/evidence custody: ${row.parts[4]} — intake type/receipt/case status: ${row.parts[5]} — safety/retaliation risk/investigator/response scope/next process: ${row.parts[6]} — person participation/requested outcome: ${row.parts[7]} — response/corrective action/actual result/unresolved item/reopen: ${row.parts[8]} — owner: ${row.parts[9]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[10]) as Date)} — status: ${row.parts[11]}`))}

Protected event, receipt, investigation, response, correction, result and complaint-history location: ${values.storage.trim()}

This output is a household home-care concern-source, intake, response, correction and actual-result index, not a complaint, grievance, appeal, mediation request, legal advice, clinical or service record, official case, investigation, testimony or evidence. It does not determine safety, abuse, neglect, breach, liability or sanctions; establish person authority or file anything; contact an agency; select jurisdiction; calculate a deadline; guarantee an outcome; or treat an agency response as actual improvement. If there is immediate danger or a situation requiring immediate official reporting, use local emergency and reporting sources first. Use the current agency, case manager, program, plan, state or local authority, contract, official notice and qualified process for every real concern and right.`;
    },
  };
};

const homeCareChargeDefinition = (locale: Locale): Definition => {
  const zh = locale === "zh-TW";
  const statusOrder = zh
    ? [
        "已收到居家服務費用或帳單訊號，等待安全、服務不中斷與來源分類",
        "已記錄安全與服務不中斷來源，等待負責服務、契約、方案或付款來源",
        "已記錄負責來源，等待受保護本人、服務期間與帳務關係比對",
        "已記錄本人、服務期間與帳務關係，等待目前計畫、授權、契約、費率或通知版本",
        "已記錄目前控制版本，等待實際服務證據與取消、未遇或調整類別",
        "已記錄實際服務證據，等待逐項費用、帳單或對帳單及給付狀態",
        "已記錄費用與給付狀態，等待本人或家庭核對及付款責任來源",
        "已記錄核對與付款責任來源，等待服務單位更正、給付結果、付款、退費或折抵及實際帳務結果",
        "服務、版本、費用、給付、付款或權利矛盾，等待負責審查",
        "已核對來源、版本、實際服務、費用、給付、家庭責任與實際帳務結果",
        "已收到負責帳務結果，記錄更正、付款、退費或折抵、保管與重新開啟條件",
        "不適用，已記錄原因與重新開啟事件",
      ]
    : [
        "Home-care charge or statement signal received—safety, continuity and source classification pending",
        "Safety and service-continuity source recorded—responsible service, contract, program or payment source pending",
        "Responsible sources recorded—protected person, service period and account relationship pending",
        "Person, service period and account relationship recorded—current plan, authorization, contract, fee or notice version pending",
        "Current controlling versions recorded—actual service evidence and cancellation, no-show or adjustment category pending",
        "Actual service evidence recorded—itemized charge, bill or statement and benefit status pending",
        "Charge and benefit status recorded—person or household review and payment-responsibility source pending",
        "Review and responsibility source recorded—provider correction, benefit result, payment, refund or credit and actual account result pending",
        "Service, version, charge, benefit, payment or rights conflict—responsible review pending",
        "Source, version, actual service, charge, benefit, household responsibility and actual account result reviewed",
        "Responsible account result received—correction, payment, refund or credit, custody and reopen condition recorded",
        "Not applicable—reason and reopen event recorded",
      ];

  const defaultRecords = zh
    ? `CHARGE-A | 被照顧者 A 的目前居家服務帳務版本；本次實際結果核對 | 目前服務單位、A 單位照顧計畫、契約、地方長照給付與家庭付款來源；各來源分開 | 受保護本人、服務期間 BATCH-A 與帳務關係已比對；核對 2026-08-27 | 照顧計畫 PLAN-C3、契約 FEE-C2、核定／部分負擔來源 BENEFIT-B2 與通知 N4 已開啟 | 實際服務證據 VISIT-E5 已由負責來源觀察；沒有用家庭行事曆取代；調整類別 NONE | 逐項費用 STATEMENT-B4、服務單位來源與給付狀態 BENEFIT-PAID 已核對；沒有輸入案件或帳號 | 本人或家庭已核對服務與費用；預期付款責任來源已取得；無異議；完整內容留在受保護來源 | EXP=1200; BILLED=1200; PAID=1200; ADJUSTED=0; 服務單位帳務結果已收到；給付結果已觀察；實際帳務結果已核對；未解 NONE；服務、費率或付款狀態改變時重新開啟 | 家庭帳務來源核對角色 | 2026-08-27 | 已核對來源、版本、實際服務、費用、給付、家庭責任與實際帳務結果
GAP-A | 被照顧者 A 的臨時取消後帳單差異；等待負責更正與實際帳務結果 | 目前服務單位帳務、契約、A 單位與地方長照給付來源；服務申訴與付款爭議分開 | 受保護本人、服務期間 BATCH-B 與帳務關係已比對；核對 2026-08-27 | 照顧計畫 PLAN-C3、契約 FEE-C2、部分負擔來源 BENEFIT-B2 與帳單版本 B5 已開啟 | 中斷／未提供證據 GAP-B 與服務單位確認已觀察；取消或未遇責任仍由契約來源核對 | 逐項費用 STATEMENT-B5 已觀察；服務單位費用來源與給付狀態 BENEFIT-REVIEW 已分開 | 本人或家庭已核對；預期付款責任仍待契約與給付來源；問題 Q2 已提出；申訴或外部審查路徑已保留 | EXP=800; BILLED=1200; PAID=0; ADJUSTED=0; 服務單位更正待負責來源；給付結果待確認；實際帳務結果未解；申訴、異議或外部審查路徑已保留 | 家庭費用差異追蹤角色 | 2026-09-12 | 已記錄核對與付款責任來源，等待服務單位更正、給付結果、付款、退費或折抵及實際帳務結果`
    : `CHARGE-A | Care person A current home-care account version; actual result review | Current agency, care-plan, contract, program-benefit and household payment sources remain separate | Protected person, service period BATCH-A and account relationship matched; checked 2026-08-27 | Care plan PLAN-C3, contract FEE-C2, benefit or cost-sharing source BENEFIT-B2 and notice N4 opened | Actual service evidence VISIT-E5 observed from responsible source; household calendar is not substituted; adjustment category NONE | Itemized statement STATEMENT-B4, provider source and benefit status BENEFIT-PAID reviewed; no case or account data entered | Person or household reviewed service and charge; expected payment-responsibility source obtained; no dispute; full content stays protected | EXP=120; BILLED=120; PAID=120; ADJUSTED=0; responsible provider account result received; benefit result observed; actual account result reviewed; unresolved NONE; reopen if service, rate or payment status changes | Household account-source review role | 2026-08-27 | Source, version, actual service, charge, benefit, household responsibility and actual account result reviewed
GAP-A | Care person A temporary-cancellation statement difference; responsible correction and account result pending | Current agency billing, contract, program-benefit and household sources; service complaint and payment dispute remain separate | Protected person, service period BATCH-B and account relationship matched; checked 2026-08-27 | Care plan PLAN-C3, contract FEE-C2, benefit source BENEFIT-B2 and statement version B5 opened | Interruption or unprovided-service evidence GAP-B and responsible agency confirmation observed; cancellation or no-show responsibility stays with contract source | Itemized statement STATEMENT-B5 observed; provider charge source and benefit status BENEFIT-REVIEW remain separate | Person or household reviewed; expected payment responsibility remains with contract and benefit source; question Q2 raised; complaint or external review route preserved | EXP=80; BILLED=120; PAID=0; ADJUSTED=0; provider correction pending from responsible source; benefit result pending; actual account result unresolved; complaint, appeal or external review route preserved | Household charge-difference follow-up role | 2026-09-12 | Review and responsibility source recorded—provider correction, benefit result, payment, refund or credit and actual account result pending`;

  return {
    intro: zh
      ? "用安全代號與四個金額標記分開居家服務來源、目前版本、實際服務、逐項費用、給付狀態、家庭付款責任、服務單位更正、付款、退費或折抵及實際帳務結果。只做輸入值算術，不判斷應付、給付、退費或法律責任。"
      : "Separate home-care sources, current versions, actual service, itemized charges, benefit status, household payment responsibility, provider correction, payment, refund or credit and actual account result with safe codes and four amount markers. Arithmetic uses only the values entered and does not decide coverage, liability, refund or legal responsibility.",
    fields: [
      text(
        "review",
        zh ? "居家服務費用私人核對代號" : "Private home-care charge review reference",
        zh ? "只用安全家庭代號；不要輸入姓名、地址、健康照護、工作人員、帳號、案件、帳單、付款工具或登入資料。" : "Use a safe household code. Do not enter names, addresses, health or care content, worker details, account, case, bill, payment-instrument or login data.",
        "HOME-CARE-CHARGE-2026-A",
      ),
      {
        name: "context",
        label: zh ? "居家服務費用與付款情境" : "Home-care charge and payment context",
        type: "select",
        options: zh
          ? ["長照給付與部分負擔核對", "自費居家服務契約與帳單核對", "已提供服務與逐項費用差異", "取消、未遇、中斷或補服務費用", "計畫、授權、給付或帳單版本改變", "付款、退費、折抵或餘額結果", "服務單位更正、申訴、異議或外部審查", "其他幣別或多付款來源核對"]
          : ["Medicare home health charge or notice review", "Medicaid HCBS benefit or cost-sharing review", "Private-pay home-care contract and statement review", "Delivered service and itemized-charge difference", "Cancellation, no-show, interruption or replacement charge", "Plan, authorization, benefit or statement-version change", "Payment, refund, credit or balance result", "Provider correction, complaint, appeal or external review"],
      },
      {
        name: "currency",
        label: zh ? "本版本金額幣別（不做匯率換算）" : "Currency for this version (no conversion)",
        type: "select",
        options: zh ? ["TWD", "USD", "其他幣別—請在工具外核對"] : ["USD", "TWD", "Other currency—verify outside this tool"],
      },
      { name: "baselineDate", label: zh ? "服務、契約或費率版本基準日" : "Service, contract or fee-version baseline date", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: zh ? "本次服務、費用與付款核對日" : "Current service, charge and payment review date", type: "date", value: "2026-08-27" },
      { name: "nextReview", label: zh ? "下一次更正、給付或實際帳務結果核點" : "Next correction, benefit or actual-account checkpoint", type: "date", value: "2026-09-12" },
      text(
        "basis",
        zh ? "服務、照顧計畫、契約、費率、給付、帳單、付款與爭議來源地圖" : "Service, plan, contract, fee, benefit, statement, payment and dispute-source map",
        zh ? "只放安全來源與版本代號；完整服務、給付、帳單、收據、付款與爭議內容留在負責受保護來源。" : "Use safe source and version IDs only. Keep complete service, benefit, statement, receipt, payment and dispute content in responsible protected sources.",
        "SERVICE-S1; PLAN-P1; CONTRACT-C1; FEE-F1; BENEFIT-B1; STATEMENT-T1; PAYMENT-P2; REVIEW-R1",
      ),
      {
        name: "records",
        label: zh ? "有版本的服務、費用、給付、付款與實際帳務結果列" : "Versioned service, charge, benefit, payment and actual-account rows",
        type: "textarea",
        help: zh ? "每行：ID｜安全本人代號與費用情境｜負責服務單位、方案、契約、給付或付款來源｜受保護本人、服務期間與帳務關係比對及來源核對日 YYYY-MM-DD｜目前照顧計畫、授權、契約、費率或通知版本｜實際服務證據及取消、未遇或調整類別｜逐項費用、帳單或對帳單、服務單位來源與給付狀態｜本人或家庭核對、預期付款責任來源、問題及申訴／異議路徑｜EXP=數字; BILLED=數字; PAID=數字; ADJUSTED=數字；服務單位更正、給付、付款、退費／折抵、實際帳務結果、未解與重開｜負責角色｜目標或結果日期 YYYY-MM-DD｜十二種指定狀態之一。每列幣別相同，最多 14 行。" : "One line: ID | safe person alias and charge context | responsible provider, program, contract, benefit or payment source | protected person, service-period and account-relationship match plus source checked date YYYY-MM-DD | current plan, authorization, contract, fee or notice version | actual service evidence plus cancellation, no-show or adjustment category | itemized charge, bill or statement, provider source and benefit status | person or household review, expected payment-responsibility source, question and complaint or appeal route | EXP=number; BILLED=number; PAID=number; ADJUSTED=number; provider correction, benefit, payment, refund or credit, actual account result, unresolved item and reopen rule | owner role | target or outcome date YYYY-MM-DD | one of the twelve exact statuses. Use one currency per version. Maximum 14 lines.",
        value: defaultRecords,
      },
      text(
        "storage",
        zh ? "受保護服務、契約、費率、帳單、收據、付款、給付與爭議歷程位置" : "Protected service, contract, fee, statement, receipt, payment, benefit and dispute-history location",
        zh ? "只寫保管流程或容器代號；不要貼本人、照護、帳號、卡號、銀行、案件、帳單、收據、付款或爭議全文。" : "Name a custody process or container, not identity, care, account, card, bank, case, statement, receipt, payment or dispute content.",
        zh ? "家庭紀錄／居家服務費用／HOME-CARE-CHARGE-2026-A／受保護程序" : "Household records / home-care charges / HOME-CARE-CHARGE-2026-A / protected process",
      ),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!baselineDate || !reviewDate || !nextReview)
        return zh ? "請輸入有效的版本基準日、本次核對日與下一核點日期。" : "Enter valid version-baseline, current-review and next-checkpoint dates.";
      if (baselineDate > reviewDate)
        return zh ? "服務、契約或費率版本基準日不能晚於本次核對日。" : "The service, contract or fee-version baseline cannot be later than the current review.";
      if (nextReview < reviewDate)
        return zh ? "下一次更正、給付或實際帳務結果核點不能早於本次核對日。" : "The next correction, benefit or actual-account checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 16 || values.storage.trim().length < 10)
        return zh ? "請提供安全的服務費用來源地圖與受保護程序位置代號。" : "Provide a safe service-charge source map and protected-process label.";

      const rows = values.records.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
      if (!rows.length || rows.length > 14)
        return zh ? "請輸入 1 至 14 行服務、費用、給付、付款與帳務結果。" : "Enter 1 to 14 service, charge, benefit, payment and account-result rows.";
      const recordRows = rows.map((row, index) => ({ line: index + 1, parts: row.split("|").map((part) => part.trim()) }));
      const malformed = recordRows.filter((row) => row.parts.length !== 12 || row.parts.some((part) => !part));
      if (malformed.length)
        return zh ? `費用核對第 ${malformed.map((row) => row.line).join("、")} 行必須剛好有 12 個非空白欄位。` : `Charge-review line ${malformed.map((row) => row.line).join(", ")} must contain exactly 12 non-empty fields.`;
      const ids = recordRows.map((row) => row.parts[0].toUpperCase());
      if (new Set(ids).size !== ids.length)
        return zh ? "每一行費用核對紀錄都需要唯一 ID。" : "Every charge-review row needs a unique ID.";
      const invalidStatuses = recordRows.filter((row) => !statusOrder.includes(row.parts[11]));
      if (invalidStatuses.length)
        return zh ? `費用核對第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用十二種指定狀態之一。` : `Charge-review line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the twelve exact statuses.`;

      const openRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) < 9);
      const closedRows = recordRows.filter((row) => statusOrder.indexOf(row.parts[11]) >= 9);
      const checkedDateOf = (textValue: string) => strictIsoDate(textValue.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "");
      const invalidSourceDates = recordRows.filter((row) => {
        const checked = checkedDateOf(row.parts[3]);
        return !checked || checked < baselineDate || checked > reviewDate;
      });
      if (invalidSourceDates.length)
        return zh ? `費用核對第 ${invalidSourceDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的受保護來源核對日。` : `Charge-review line ${invalidSourceDates.map((row) => row.line).join(", ")} needs a protected-source checked date from the baseline through this review.`;
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[10]);
        return !target || target < reviewDate || target > nextReview;
      });
      if (invalidOpenDates.length)
        return zh ? `仍開放的費用核對第 ${invalidOpenDates.map((row) => row.line).join("、")} 行需要介於本次核對日與下一核點的目標日。` : `Open charge-review line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[10]);
        return !outcome || outcome < baselineDate || outcome > reviewDate;
      });
      if (invalidClosedDates.length)
        return zh ? `已核對、完成或不適用的費用核對第 ${invalidClosedDates.map((row) => row.line).join("、")} 行需要介於基準日與本次核對日的結果日。` : `Closed charge-review line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an outcome date from the baseline through this review.`;

      const missingLayers = recordRows.filter((row) => row.parts[1].length < 8 || row.parts[2].length < 12 || row.parts[3].length < 18 || row.parts[4].length < 14 || row.parts[5].length < 14 || row.parts[6].length < 14 || row.parts[7].length < 12 || row.parts[8].length < 35 || row.parts[9].length < 4);
      if (missingLayers.length)
        return zh ? `費用核對第 ${missingLayers.map((row) => row.line).join("、")} 行需要真實的費用情境、負責來源、本人／期間／帳務比對、控制版本、實際服務、逐項費用／給付、家庭核對／責任來源、四個金額與負責結果及負責角色。` : `Charge-review line ${missingLayers.map((row) => row.line).join(", ")} needs a real charge context, responsible sources, person/period/account match, controlling versions, actual service, itemized charge/benefit, household review/responsibility source, four amounts and responsible result, and owner role.`;

      const amountLabels = ["EXP", "BILLED", "PAID", "ADJUSTED"];
      const amountRows = recordRows.map((row) => {
        const matches = Array.from(row.parts[8].matchAll(/\b(EXP|BILLED|PAID|ADJUSTED)=([0-9]+(?:\.[0-9]{1,2})?)\b/g));
        const amounts = new Map(matches.map((match) => [match[1], Number(match[2])]));
        return { ...row, matches, amounts };
      });
      const invalidAmounts = amountRows.filter((row) => row.matches.length !== 4 || amountLabels.some((label) => !row.amounts.has(label)) || Array.from(row.amounts.values()).some((value) => !Number.isFinite(value) || value < 0 || value > 999999.99));
      if (invalidAmounts.length)
        return zh ? `費用核對第 ${invalidAmounts.map((row) => row.line).join("、")} 行必須各有一個 EXP、BILLED、PAID、ADJUSTED 非負金額，最多兩位小數且不超過 999999.99。` : `Charge-review line ${invalidAmounts.map((row) => row.line).join(", ")} must contain exactly one non-negative EXP, BILLED, PAID and ADJUSTED amount with no more than two decimals and no value above 999999.99.`;

      const reviewedWithoutEvidence = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[9]) return false;
        const versions = zh ? /(?:計畫|授權|契約|費率|給付|通知)/.test(row.parts[4]) : /(?:plan|authorization|contract|fee|benefit|notice)/i.test(row.parts[4]);
        const service = zh ? /(?:實際服務|未提供|中斷|取消|未遇).*(?:證據|觀察|確認)/.test(row.parts[5]) : /(?:actual service|unprovided|interruption|cancellation|no-show).*(?:evidence|observed|confirmed)/i.test(row.parts[5]);
        const charge = zh ? /(?:逐項|費用|帳單|對帳單).*(?:服務單位|給付|來源|狀態)/.test(row.parts[6]) : /(?:itemized|charge|bill|statement).*(?:provider|benefit|source|status)/i.test(row.parts[6]);
        const review = zh ? /(?:本人|家庭).*(?:核對|付款責任|問題|異議)/.test(row.parts[7]) : /(?:person|household).*(?:review|payment responsibility|question|dispute)/i.test(row.parts[7]);
        const result = zh ? /(?:服務單位|負責).*(?:結果|更正).*(?:收到|觀察|核對)/.test(row.parts[8]) && /(?:實際帳務結果).*(?:觀察|核對|收到)/.test(row.parts[8]) : /(?:provider|responsible).*(?:result|correction).*(?:received|observed|reviewed)/i.test(row.parts[8]) && /actual account result.*(?:observed|reviewed|received)/i.test(row.parts[8]);
        const pending = zh ? /(?:等待|仍待|尚待|未知|未解(?!\s*NONE))/.test(row.parts.slice(4, 9).join(" ")) : /(?:pending|awaiting|unknown|unresolved(?!\s*NONE))/i.test(row.parts.slice(4, 9).join(" "));
        return !versions || !service || !charge || !review || !result || pending;
      });
      if (reviewedWithoutEvidence.length)
        return zh ? `已核對的第 ${reviewedWithoutEvidence.map((row) => row.line).join("、")} 行必須有目前版本、實際服務、逐項費用與給付、本人／家庭核對、負責帳務結果及實際帳務結果，而且不能藏有仍待確認內容。` : `Reviewed line ${reviewedWithoutEvidence.map((row) => row.line).join(", ")} must include current versions, actual service, itemized charge and benefit status, person or household review, a responsible account result and actual account result with no hidden pending item.`;

      const resultPendingWithoutRoute = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[7]) return false;
        const review = zh ? /(?:本人|家庭).*(?:核對|付款責任|問題)/.test(row.parts[7]) : /(?:person|household).*(?:review|payment responsibility|question)/i.test(row.parts[7]);
        const pending = zh ? /(?:更正|給付結果|帳務結果).*(?:等待|待|未解|確認)/.test(row.parts[8]) : /(?:correction|benefit result|account result).*(?:pending|awaiting|unresolved)/i.test(row.parts[8]);
        const route = zh ? /(?:服務單位|契約|給付|申訴|異議|外部審查)/.test(row.parts[7] + row.parts[8]) : /(?:provider|contract|benefit|complaint|appeal|external review)/i.test(row.parts[7] + row.parts[8]);
        return !review || !pending || !route;
      });
      if (resultPendingWithoutRoute.length)
        return zh ? `等待帳務結果的第 ${resultPendingWithoutRoute.map((row) => row.line).join("、")} 行必須記錄本人或家庭核對與付款責任來源，把更正、給付或帳務結果保持待確認，並保留負責申訴、異議或審查路徑。` : `Account-result-pending line ${resultPendingWithoutRoute.map((row) => row.line).join(", ")} must record person or household review and payment-responsibility source, keep correction, benefit or account result pending, and preserve a responsible complaint, appeal or review route.`;

      const conflictWithoutRoute = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[8]) return false;
        const combined = row.parts.slice(4, 9).join(" ");
        const conflict = zh ? /(?:服務|版本|費用|給付|付款|權利|矛盾|差異)/.test(combined) : /(?:service|version|charge|benefit|payment|rights|conflict|difference)/i.test(combined);
        const route = zh ? /(?:服務單位|契約|方案|給付|主管機關|申訴|異議|審查)/.test(combined) : /(?:provider|contract|program|benefit|authority|complaint|appeal|review)/i.test(combined);
        return !conflict || !route;
      });
      if (conflictWithoutRoute.length)
        return zh ? `矛盾列第 ${conflictWithoutRoute.map((row) => row.line).join("、")} 行必須指出服務、版本、費用、給付、付款或權利差異，以及負責服務單位、契約、方案、主管機關、申訴、異議或審查路徑。` : `Conflict line ${conflictWithoutRoute.map((row) => row.line).join(", ")} must name the service, version, charge, benefit, payment or rights conflict and a responsible provider, contract, program, authority, complaint, appeal or review route.`;

      const completedWithoutResult = recordRows.filter((row) => {
        if (row.parts[11] !== statusOrder[10]) return false;
        const result = row.parts[8];
        const accountable = zh ? /(?:負責|服務單位|方案|給付).*(?:帳務結果|更正|付款|退費|折抵).*(?:收到|觀察|記錄)/.test(result) : /(?:responsible|provider|program|benefit).*(?:account result|correction|payment|refund|credit).*(?:received|observed|recorded)/i.test(result);
        const custodyReopen = zh ? /(?:保管|重新開啟)/.test(result) : /(?:custody|reopen)/i.test(result);
        const pending = zh ? /(?:等待|仍待|尚待|未知|未解(?!\s*NONE))/.test(result) : /(?:pending|awaiting|unknown|unresolved(?!\s*NONE))/i.test(result);
        return !accountable || !custodyReopen || pending;
      });
      if (completedWithoutResult.length)
        return zh ? `完成帳務結果的第 ${completedWithoutResult.map((row) => row.line).join("、")} 行必須記錄已收到或觀察的負責更正、付款、退費或折抵結果、受保護保管及重新開啟條件。` : `Completed account-result line ${completedWithoutResult.map((row) => row.line).join(", ")} must record an observed responsible correction, payment, refund or credit result, protected custody and reopen condition.`;

      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[11] === statusOrder[11] && !(zh ? /(?:重新開啟|重新檢視|如果|當.*時|服務|費率|帳單|給付|付款.*改變)/.test(row.parts[8]) : /(?:reopen|review again|if |when |service|fee|statement|benefit|payment.*change)/i.test(row.parts[8])));
      if (notApplicableWithoutTrigger.length)
        return zh ? `不適用的第 ${notApplicableWithoutTrigger.map((row) => row.line).join("、")} 行必須記錄目前原因，以及服務、費率、帳單、給付或付款改變時的重開事件。` : `Not-applicable line ${notApplicableWithoutTrigger.map((row) => row.line).join(", ")} must state the current reason and the service, fee, statement, benefit or payment change that reopens it.`;

      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "").replace(/\b(?:EXP|BILLED|PAID|ADJUSTED)=[0-9]+(?:\.[0-9]{1,2})?\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return zh ? "偵測到可能的完整電話、Email、帳號、會員、案件、帳單、收據、給付、付款工具或其他長數字識別資料。請改用安全服務、帳單、付款與結果代號。" : "A possible full phone, email, account, member, case, statement, receipt, benefit, payment-instrument or other long numeric identifier was detected. Use safe service, statement, payment and result pointers.";
      if (/password|passphrase|passcode|access code|door code|alarm code|security code|recovery code|verification code|login credential|full address|street address|care-recipient name\s*[:=]|patient name\s*[:=]|person name\s*[:=]|provider name\s*[:=]|agency name\s*[:=]|worker name\s*[:=]|employee name\s*[:=]|date of birth\s*[:=]|diagnosis\s*[:=]|condition\s*[:=]|symptom\s*[:=]|allerg(?:y|ies)\s*[:=]|medication name\s*[:=]|drug name\s*[:=]|medicine name\s*[:=]|dose\s*[:=]|dosage\s*[:=]|feeding|swallowing|transfer step|lifting step|mobility detail|toileting|bathing|wound|device instruction|behavior(?:al)? detail|mental health|care note|treatment plan|exact time|arrival time\s*[:=]|departure time\s*[:=]|exact location|precise location|GPS|account number\s*[:=]|member number\s*[:=]|claim number\s*[:=]|invoice number\s*[:=]|receipt number\s*[:=]|card number\s*[:=]|bank account\s*[:=]|routing number\s*[:=]|tax number\s*[:=]|allegation\s*[:=]|evidence text\s*[:=]|complaint text\s*[:=]|appeal text\s*[:=]|signature|signed form|private message|correspondence|完整地址|被照顧者姓名\s*[:：]|病人姓名\s*[:：]|本人姓名\s*[:：]|服務單位名稱\s*[:：]|工作人員姓名\s*[:：]|居服員姓名\s*[:：]|出生日期\s*[:：]|診斷\s*[:：]|病況\s*[:：]|症狀\s*[:：]|過敏\s*[:：]|藥名\s*[:：]|用藥名稱\s*[:：]|劑量\s*[:：]|餵食|吞嚥|移位步驟|攙扶步驟|行動細節|如廁|沐浴|傷口|管路|輔具指示|行為處理|心理健康內容|照護紀錄內容|精確時間|到場時間\s*[:：]|離場時間\s*[:：]|精確位置|詳細地點|GPS|帳號\s*[:：]|會員號\s*[:：]|案件編號\s*[:：]|帳單編號\s*[:：]|收據編號\s*[:：]|卡號\s*[:：]|銀行帳戶\s*[:：]|匯款帳號\s*[:：]|稅籍編號\s*[:：]|指控內容|證據全文|申訴全文|異議全文|簽名|門鎖密碼|保全密碼|登入密碼|驗證碼|私人訊息|通信內容/i.test(privacyText))
        return zh ? "偵測到可能的本人、服務單位、地址、健康照護、工作人員、精確時間位置、帳號／案件／帳單／收據／卡片／銀行、指控證據、申訴異議、簽名、登入或私人通信內容。請改成安全服務、版本、帳單、付款與結果代號。" : "A possible identity, provider, address, health or care, worker, exact time or location, account/case/statement/receipt/card/bank, allegation or evidence, complaint or appeal, signature, credential or private correspondence detail was detected. Use safe service, version, statement, payment and result pointers.";

      const totals = amountRows.reduce((sum, row) => {
        amountLabels.forEach((label) => { sum[label] += row.amounts.get(label) ?? 0; });
        return sum;
      }, { EXP: 0, BILLED: 0, PAID: 0, ADJUSTED: 0 } as Record<string, number>);
      const formatAmount = (value: number) => `${values.currency} ${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[11] === status).length })).filter((item) => item.count > 0);
      const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });

      if (zh)
        return `${values.review.trim()}｜居家服務、費用、給付、付款與實際帳務狀態
費用與付款情境：${values.context}
本版本幣別：${values.currency}（不做匯率換算）
服務、契約或費率版本基準：${formatter.format(baselineDate)}
本次服務、費用與付款核對：${formatter.format(reviewDate)}
下一次更正、給付或實際帳務結果核點：${formatter.format(nextReview)}
仍開放的來源、版本、服務、費用、給付、付款或審查列：${openRows.length} 筆
已核對、完成或不適用列：${closedRows.length} 筆
狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}

輸入列預期家庭責任合計（僅算術）：${formatAmount(totals.EXP)}
輸入列帳單金額合計（僅算術）：${formatAmount(totals.BILLED)}
輸入列已付款合計（僅算術）：${formatAmount(totals.PAID)}
輸入列已觀察退費或折抵合計（僅算術）：${formatAmount(totals.ADJUSTED)}
帳單減預期差額（僅算術，不代表應付或可退）：${formatAmount(totals.BILLED - totals.EXP)}

服務、照顧計畫、契約、費率、給付、帳單、付款與爭議來源地圖：${values.basis.trim()}

${lines("有版本的服務、費用、給付、付款與實際帳務結果證據", recordRows.map((row) => `${row.parts[0]}｜本人／費用情境：${row.parts[1]}｜負責來源：${row.parts[2]}｜受保護本人／期間／帳務關係：${row.parts[3]}｜目前控制版本：${row.parts[4]}｜實際服務／調整類別：${row.parts[5]}｜逐項費用／帳單／給付狀態：${row.parts[6]}｜本人或家庭核對／付款責任／問題與路徑：${row.parts[7]}｜金額／更正／給付／付款／退費折抵／實際帳務結果：${row.parts[8]}｜負責角色：${row.parts[9]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[10]) as Date)}｜狀態：${row.parts[11]}`))}

受保護服務、契約、費率、帳單、收據、付款、給付與爭議歷程位置：${values.storage.trim()}

這份輸出只是家庭居家服務、費用、給付、付款與實際帳務結果索引。所有金額都是對輸入值做同幣別算術，不是正式帳單、收據、會計、稅務、給付、請款、保險、付款、退款、法律或財務建議。它不判斷服務是否提供、費用是否有效、誰應付款、給付是否成立、是否可退費或折抵；不提交請款、申訴或異議；不計算正式期限、匯率、稅或損害。先用目前照顧計畫、契約、核定或給付來源、實際服務證據、服務單位逐項帳單、收據、付款結果與官方程序核對。`;
      return `${values.review.trim()} — home-care service, charge, benefit, payment and actual-account status
Charge and payment context: ${values.context}
Currency for this version: ${values.currency} (no conversion)
Service, contract or fee-version baseline: ${formatter.format(baselineDate)}
Current service, charge and payment review: ${formatter.format(reviewDate)}
Next correction, benefit or actual-account checkpoint: ${formatter.format(nextReview)}
Open source, version, service, charge, benefit, payment or review rows: ${openRows.length}
Reviewed, completed or not-applicable rows: ${closedRows.length}
Status count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}

Entered expected household responsibility total (arithmetic only): ${formatAmount(totals.EXP)}
Entered billed total (arithmetic only): ${formatAmount(totals.BILLED)}
Entered paid total (arithmetic only): ${formatAmount(totals.PAID)}
Entered observed refund or credit total (arithmetic only): ${formatAmount(totals.ADJUSTED)}
Billed minus expected difference (arithmetic only, not an amount owed or refundable): ${formatAmount(totals.BILLED - totals.EXP)}

Service, plan, contract, fee, benefit, statement, payment and dispute-source map: ${values.basis.trim()}

${lines("Versioned service, charge, benefit, payment and actual-account evidence", recordRows.map((row) => `${row.parts[0]} — person/charge context: ${row.parts[1]} — responsible sources: ${row.parts[2]} — protected person/period/account relationship: ${row.parts[3]} — current controlling versions: ${row.parts[4]} — actual service/adjustment category: ${row.parts[5]} — itemized charge/statement/benefit status: ${row.parts[6]} — person or household review/payment responsibility/question and route: ${row.parts[7]} — amounts/correction/benefit/payment/refund or credit/actual account result: ${row.parts[8]} — owner: ${row.parts[9]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[10]) as Date)} — status: ${row.parts[11]}`))}

Protected service, contract, fee, statement, receipt, payment, benefit and dispute-history location: ${values.storage.trim()}

This output is a household home-care service, charge, benefit, payment and actual-account source index. Every amount is same-currency arithmetic on values entered, not an official bill, receipt, accounting, tax, benefit, claim, insurance, payment, refund, legal or financial determination. It does not decide whether service occurred, a charge is valid, who owes it, coverage exists, or a refund or credit is due; submit a claim, complaint or appeal; or calculate an official deadline, exchange rate, tax or damages. Verify the current care plan, contract, authorization or benefit source, actual service evidence, itemized provider statement, receipt, payment result and official process.`;
    },
  };
};

const homeCareNoticeDefinition = (locale: Locale): Definition => {
  const zh = locale === "zh-TW";
  const statusOrder = zh ? [
    "已收到通知訊號，等待安全、服務不中斷與通知分類",
    "已記錄來源角色，等待通知版本與受保護關係核對",
    "已記錄類型、版本與送達，等待服務期間及控制來源",
    "已記錄控制來源，等待要求、回覆路徑與本人參與",
    "已記錄回覆路徑，等待代表權限與正式指示原文保管",
    "已保管通知指示，等待付款、退費、催收或不利處分交接",
    "已記錄家庭回應與交接，等待負責單位受理、回覆或實際帳務結果",
    "通知、版本、送達、權利或帳務矛盾，等待申訴、異議或審查",
    "已核對來源、類型、版本、送達、控制來源、路徑與實際結果",
    "已收到負責結果，記錄付款、退費、催收或不利處分結果、保管與重開",
    "不適用，已記錄原因與重開事件",
    "已分流至緊急或安全處理，紀錄等待補齊",
  ] : [
    "Notice signal received—safety, continuity and notice class pending",
    "Issuer or source role recorded—notice version and protected relationship pending",
    "Class, version and delivery recorded—service period and controlling source pending",
    "Controlling source recorded—request, response route and person participation pending",
    "Response route recorded—representative authority and original instructions custody pending",
    "Notice instructions preserved—payment, refund, collection or adverse-action handoff pending",
    "Household response and handoff recorded—responsible intake, response or actual account result pending",
    "Notice, version, delivery, rights or account conflict—complaint, appeal or review pending",
    "Notice source, class, version, delivery, controlling source, route and actual result reviewed",
    "Responsible result received—payment, refund, collection or adverse-action result, custody and reopen recorded",
    "Not applicable—reason and reopen event recorded",
    "Routed to urgent or safety handling—record awaits completion",
  ];
  const defaults = zh
    ? "NOTICE-A | 付款通知與居家服務帳務交接；不是帳單或收據 | 服務單位帳務、目前契約與長照方案來源；原件受保護 | 受保護本人與服務期間 BATCH-A 已比對；來源核對 2026-08-27 | NOTICE-N4 付款通知版本已開啟；送達 DELIVERY-D2；簡訊不是原件 | CONTRACT-C2、BENEFIT-B2、STATEMENT-S4 與 PAYMENT-P2 分開保管 | 本人詢問角色已記錄；正式指示、期限原文與代表權限留在受保護來源 | RESPONSE-R2 已交接；服務單位受理與實際帳務結果已收到；付款、退費或催收改變時重新開啟 | 家庭通知交接角色 | 2026-08-27 | 已核對來源、類型、版本、送達、控制來源、路徑與實際結果\nOPEN-A | 退款承諾後收到催收通知；兩條路徑分開保存 | 服務單位退款窗口、付款來源、契約與正式通知來源；帳務、申訴與給付分開 | 受保護本人與服務期間 BATCH-B 已比對；來源核對 2026-08-27 | REFUND-N3 與 COLLECTION-N1 類型、版本、送達觀察已保存；原文未合併 | CONTRACT-C2、STATEMENT-S5、PAYMENT-P3 已開啟；責任待負責來源確認 | 已保留正式指示與期限原文；ROUTE-Q2、代表權限與受理方式待確認；不計算期限 | 已提出安全詢問；退款入帳、催收暫停或正式異議結果等待負責來源；未解 GAP-N2；新通知或付款改變時重新開啟 | 家庭通知異議追蹤角色 | 2026-09-12 | 已記錄家庭回應與交接，等待負責單位受理、回覆或實際帳務結果"
    : "NOTICE-A | Payment notice and home-care account handoff; not a bill or receipt | Provider account, current contract and program sources; original stays protected | Protected person and service period BATCH-A matched; source checked 2026-08-27 | NOTICE-N4 payment notice version opened; delivery DELIVERY-D2; text message is not the original | CONTRACT-C2, BENEFIT-B2, STATEMENT-S4 and PAYMENT-P2 kept separate | Person inquiry role recorded; original instructions, deadline text and representative authority remain protected | RESPONSE-R2 handed off; provider intake and actual account result received; reopen if payment, refund or collection changes | Household notice-handoff role | 2026-08-27 | Notice source, class, version, delivery, controlling source, route and actual result reviewed\nOPEN-A | Collection notice after a refund promise; preserve both paths | Provider refund desk, payment source, contract and formal notice sources; account, complaint and benefit routes stay separate | Protected person and service period BATCH-B matched; source checked 2026-08-27 | REFUND-N3 and COLLECTION-N1 classes, versions and delivery observations preserved; originals not merged | CONTRACT-C2, STATEMENT-S5 and PAYMENT-P3 opened; responsibility remains with responsible source | Original instructions and deadline text preserved; ROUTE-Q2, representative authority and intake method pending; no deadline calculation | Safe question handed off; actual refund posting, collection pause or formal appeal result pending; unresolved GAP-N2; reopen if new notice or payment changes | Household notice-appeal follow-up role | 2026-09-12 | Household response and handoff recorded—responsible intake, response or actual account result pending";
  return {
    intro: zh ? "把付款、退費、催收與不利通知拆成來源、類型版本、送達、控制契約／方案、回覆與代表權限、正式指示原文、帳務交接及實際結果；不驗證通知、不計算期限、不代表送件。" : "Separate payment, refund, collection and adverse notices into source, class/version, delivery, controlling contract or program, response and representative authority, original instructions, account handoff and actual result; no authentication, deadline calculation or filing.",
    fields: [
      text("review", zh ? "通知私人核對代號" : "Private notice review reference", zh ? "只用安全代號，不要輸入姓名、地址、帳號、案件、付款或通知全文。" : "Use a safe code; do not enter names, addresses, accounts, case, payment or notice text.", "HOME-CARE-NOTICE-2026-A"),
      { name: "context", label: zh ? "通知情境" : "Notice context", type: "select", options: zh ? ["付款或帳務通知", "退款、折抵或退款承諾", "催收或逾期付款通知", "不利給付、服務終止或減少通知", "錯誤、重複或無法辨識通知", "通知後詢問、申訴或異議", "其他通知交接"] : ["Payment or account notice", "Refund, credit or refund promise", "Collection or overdue-payment notice", "Adverse benefit, termination or reduction notice", "Unclear, duplicate or conflicting notice", "Question, complaint or appeal after notice", "Other notice handoff"] },
      { name: "baselineDate", label: zh ? "通知／來源版本基準日" : "Notice and source-version baseline date", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: zh ? "本次通知核對日" : "Current notice review date", type: "date", value: "2026-08-27" },
      { name: "nextReview", label: zh ? "下一次受理、回覆或結果核點" : "Next intake, response or result checkpoint", type: "date", value: "2026-09-12" },
      text("basis", zh ? "通知、契約、方案、給付、付款與申訴來源地圖" : "Notice, contract, program, benefit, payment and review-source map", zh ? "只放安全來源版本代號；完整通知、帳單、付款及申訴內容留在受保護來源。" : "Use safe source/version IDs; keep complete notice, statement, payment and appeal content protected.", "NOTICE-N1; CONTRACT-C1; BENEFIT-B1; STATEMENT-S1; PAYMENT-P1; ROUTE-Q1"),
      text("records", zh ? "有版本的通知與交接紀錄列" : "Versioned notice and handoff rows", zh ? "每行 11 欄：ID｜情境｜來源角色｜受保護關係及來源核對日｜通知類型版本送達｜控制來源｜回應、代表權限、正式指示原文與路徑｜付款／退款／催收／不利處分交接、受理、結果、未解與重開｜角色｜目標或結果日期｜指定狀態。最多 14 行，不自行計算期限。" : "11 fields per row: ID | context | issuer/source role | protected relationship and checked date | notice class, version and delivery | controlling source | response, representative authority, original instructions and route | payment, refund, collection or adverse-action handoff, intake, result, unresolved and reopen | owner | target/outcome date | exact status. Maximum 14 rows; do not calculate deadlines.", defaults),
      text("storage", zh ? "受保護通知、帳務、付款與申訴歷程位置" : "Protected notice, account, payment and review-history location", zh ? "只寫保管流程或容器代號，不要貼通知全文、帳號、卡號、銀行或授權資料。" : "Name a custody process or container, not notice text, account, card, bank or authority data.", zh ? "家庭紀錄／居家服務通知／HOME-CARE-NOTICE-2026-A／受保護程序" : "Household records / home-care notices / HOME-CARE-NOTICE-2026-A / protected process"),
    ],
    run: (values) => {
      const baseline = strictIsoDate(values.baselineDate), review = strictIsoDate(values.reviewDate), next = strictIsoDate(values.nextReview);
      if (!baseline || !review || !next) return zh ? "請輸入有效的通知版本基準日、本次核對日與下一核點日期。" : "Enter valid notice-baseline, current-review and next-checkpoint dates.";
      if (baseline > review) return zh ? "通知版本基準日不能晚於本次核對日。" : "The notice baseline cannot be later than the current review.";
      if (next < review) return zh ? "下一次核點不能早於本次核對日。" : "The next checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 16 || values.storage.trim().length < 10) return zh ? "請提供安全來源地圖與受保護程序代號。" : "Provide a safe source map and protected-process label.";
      const rows = values.records.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
      if (!rows.length || rows.length > 14) return zh ? "請輸入 1 至 14 行通知交接紀錄。" : "Enter 1 to 14 notice-handoff rows.";
      const parsed = rows.map((row, index) => ({ line: index + 1, parts: row.split("|").map((part) => part.trim()) }));
      const malformed = parsed.filter((row) => row.parts.length !== 11 || row.parts.some((part) => !part));
      if (malformed.length) return (zh ? "通知交接第 " : "Notice-handoff line ") + malformed.map((row) => row.line).join(zh ? "、" : ", ") + (zh ? " 行必須有 11 個非空白欄位。" : " must contain 11 non-empty fields.");
      if (new Set(parsed.map((row) => row.parts[0].toUpperCase())).size !== parsed.length) return zh ? "每行通知交接紀錄都需要唯一 ID。" : "Every notice-handoff row needs a unique ID.";
      const invalid = parsed.filter((row) => !statusOrder.includes(row.parts[10]));
      if (invalid.length) return (zh ? "通知交接第 " : "Notice-handoff line ") + invalid.map((row) => row.line).join(zh ? "、" : ", ") + (zh ? " 行狀態不在指定清單。" : " uses a status outside the exact list.");
      const checked = (v: string) => strictIsoDate(v.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] || "");
      const badSource = parsed.filter((row) => { const d = checked(row.parts[3]); return !d || d < baseline || d > review; });
      if (badSource.length) return (zh ? "通知交接第 " : "Notice-handoff line ") + badSource.map((row) => row.line).join(zh ? "、" : ", ") + (zh ? " 行來源核對日須在基準日至本次核對日。" : " needs a source-checked date from baseline through review.");
      const open = parsed.filter((row) => statusOrder.indexOf(row.parts[10]) < 8 || statusOrder.indexOf(row.parts[10]) === 11);
      const closed = parsed.filter((row) => statusOrder.indexOf(row.parts[10]) >= 8 && statusOrder.indexOf(row.parts[10]) < 11);
      const badOpen = open.filter((row) => { const d = strictIsoDate(row.parts[9]); return !d || d < review || d > next; });
      if (badOpen.length) return (zh ? "仍開放的第 " : "Open line ") + badOpen.map((row) => row.line).join(zh ? "、" : ", ") + (zh ? " 行目標日須在本次核對日至下一核點。" : " needs a target date from review through next checkpoint.");
      const badClosed = closed.filter((row) => { const d = strictIsoDate(row.parts[9]); return !d || d < baseline || d > review; });
      if (badClosed.length) return (zh ? "已核對或完成的第 " : "Reviewed or completed line ") + badClosed.map((row) => row.line).join(zh ? "、" : ", ") + (zh ? " 結果日須在基準日至本次核對日。" : " needs an outcome date from baseline through review.");
      const thin = parsed.filter((row) => row.parts[1].length < 8 || row.parts[2].length < 10 || row.parts[3].length < 18 || row.parts[4].length < 14 || row.parts[5].length < 12 || row.parts[6].length < 16 || row.parts[7].length < 28 || row.parts[8].length < 4);
      if (thin.length) return (zh ? "通知交接第 " : "Notice-handoff line ") + thin.map((row) => row.line).join(zh ? "、" : ", ") + (zh ? " 行需要完整情境、來源、關係、類型版本送達、控制來源、回應路徑、交接結果與角色。" : " needs context, source, relationship, class/version/delivery, controlling source, response route, handoff result and owner.");
      const privacy = [values.review, values.basis, values.records, values.storage].join("\n");
      const noDates = privacy.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(noDates) || /(?:\d[\s().+-]*){7,}/.test(noDates)) return zh ? "偵測到完整聯絡、帳號、案件、通知或付款識別資料；請改用安全代號。" : "A full contact, account, case, notice or payment identifier was detected; use safe codes.";
      if (/password|passcode|login credential|full address|person name\s*[:=]|provider name\s*[:=]|account number\s*[:=]|member number\s*[:=]|claim number\s*[:=]|card number\s*[:=]|bank account\s*[:=]|notice text|appeal text|complaint text|signature|private message|完整地址|本人姓名\s*[:：]|服務單位名稱\s*[:：]|帳號\s*[:：]|案件編號\s*[:：]|卡號\s*[:：]|銀行帳戶\s*[:：]|通知全文|申訴全文|異議全文|簽名|私人訊息/i.test(privacy)) return zh ? "偵測到本人、服務單位、地址、帳號、通知或申訴全文、簽名或私人通信；請改用安全代號。" : "A personal, provider, address, account, notice or appeal text, signature or private message was detected; use safe codes.";
      const fmtDate = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
      const counts = statusOrder.map((s) => ({ s, n: parsed.filter((r) => r.parts[10] === s).length })).filter((x) => x.n);
      const rowText = parsed.map((r) => r.parts[0] + (zh ? "｜情境：" : " — context: ") + r.parts[1] + (zh ? "｜來源：" : " — source: ") + r.parts[2] + (zh ? "｜受保護關係：" : " — protected relationship: ") + r.parts[3] + (zh ? "｜類型版本送達：" : " — class/version/delivery: ") + r.parts[4] + (zh ? "｜控制來源：" : " — controlling source: ") + r.parts[5] + (zh ? "｜回應權限指示路徑：" : " — response/authority/instructions/route: ") + r.parts[6] + (zh ? "｜交接結果未解重開：" : " — handoff/result/unresolved/reopen: ") + r.parts[7] + (zh ? "｜角色：" : " — owner: ") + r.parts[8] + (zh ? "｜日期：" : " — date: ") + fmtDate.format(strictIsoDate(r.parts[9]) as Date) + (zh ? "｜狀態：" : " — status: ") + r.parts[10]).join("\n");
      return [
        values.review.trim() + (zh ? "｜居家服務付款、退款、催收與不利通知交接狀態" : " — home-care payment, refund, collection and adverse-notice handoff status"),
        (zh ? "通知情境：" : "Notice context: ") + values.context,
        (zh ? "通知／來源版本基準：" : "Notice and source baseline: ") + fmtDate.format(baseline),
        (zh ? "本次通知核對：" : "Current notice review: ") + fmtDate.format(review),
        (zh ? "下一次結果核點：" : "Next result checkpoint: ") + fmtDate.format(next),
        (zh ? "仍開放列：" : "Open rows: ") + open.length,
        (zh ? "已核對、完成或不適用列：" : "Reviewed, completed or not-applicable rows: ") + closed.length,
        (zh ? "狀態統計：" : "Status count: ") + counts.map((x) => x.s + " " + x.n).join(zh ? "、" : " | "),
        (zh ? "通知、契約、方案、給付、付款與申訴來源地圖：" : "Notice, contract, program, benefit, payment and review-source map: ") + values.basis.trim(),
        (zh ? "有版本的通知、送達、回應、帳務交接與結果證據\n" : "Versioned notice, delivery, response, account handoff and result evidence\n") + rowText,
        (zh ? "受保護通知、帳務、付款、退款、催收與申訴歷程位置：" : "Protected notice, account, payment, refund, collection and review-history location: ") + values.storage.trim(),
        zh ? "這份輸出只是通知來源與交接索引，不驗證通知、不計算或保留期限、不代表授權或送件、不決定債務、退款、給付、權利或不利處分，也不把承諾、送出、改帳或暫停催收寫成實際結果。立即讀取目前通知原文，保留送達與來源，依通知指定程序及所在地緊急、申訴、異議或合格專業來源處理。" : "This output is a notice-source and handoff index. It does not authenticate a notice, calculate or preserve a deadline, establish authority or file anything, decide debt, refund, benefit, rights or adverse action, or treat a promise, submission, account edit or collection pause as an actual result. Read the current notice immediately, preserve delivery and source evidence, and use the specified process and qualified or emergency sources.",
      ].join("\n\n");
    },
  };
};


const definitions: Record<string, Definition> = {
  "home-maintenance-schedule-generator": {
    intro:
      "Create a starter schedule tied to the systems you actually have. Verify every interval against the model manual and local conditions.",
    fields: [
      text(
        "systems",
        "Systems and assets",
        "Separate items with commas.",
        "HVAC filter, refrigerator, smoke alarms",
      ),
      {
        name: "cadence",
        label: "Review cadence",
        type: "select",
        options: ["Monthly", "Quarterly", "Seasonally"],
      },
    ],
    run: (v) =>
      lines(
        `${v.cadence || "Monthly"} starter schedule`,
        list(v.systems).flatMap((item, i) => [
          `${item}: inspect condition and confirm the correct manufacturer interval${i === 0 ? " at the next review" : ""}.`,
          `${item}: record completion, observations and the next due date.`,
        ]),
      ),
  },
  "warranty-expiration-calculator": {
    intro:
      "Calculate a planning date from the purchase date and written warranty term. The manufacturer or seller terms control.",
    fields: [
      { name: "purchase", label: "Purchase date", type: "date" },
      {
        name: "months",
        label: "Warranty term in months",
        type: "number",
        value: "12",
      },
      {
        name: "reviewDays",
        label: "Review this many days before expiry",
        type: "number",
        value: "30",
      },
    ],
    run: (v) => {
      const start = date(v.purchase);
      if (!start) return "Enter a valid purchase date.";
      const end = addMonths(start, Number(v.months || 0));
      const review = new Date(end);
      review.setDate(review.getDate() - Number(v.reviewDays || 0));
      return `Estimated term end: ${fmt(end)}\nReview by: ${fmt(review)}\n\nConfirm coverage rules, registration requirements and the exact start/end convention in the written warranty.`;
    },
  },
  "appliance-age-calculator": {
    intro:
      "Calculate elapsed time from a known purchase or installation date without guessing the appliance lifespan.",
    fields: [
      { name: "start", label: "Purchase or installation date", type: "date" },
      text("name", "Appliance name", "", "Refrigerator"),
    ],
    run: (v) => {
      const start = date(v.start);
      return start
        ? `${v.name || "Appliance"} age: ${yearsMonths(start)}\nRecorded start date: ${fmt(start)}\n\nAge alone does not predict failure. Keep condition, repair and maintenance history with this result.`
        : "Enter a valid date.";
    },
  },
  "appliance-replacement-planner": {
    intro:
      "Build a watch-list signal from age, condition and recent repair cost. This is planning, not a failure forecast.",
    fields: [
      text("name", "Appliance", "", "Refrigerator"),
      { name: "purchase", label: "Purchase date", type: "date" },
      {
        name: "planningYears",
        label: "Your planning horizon in years",
        type: "number",
        value: "12",
      },
      {
        name: "condition",
        label: "Current condition",
        type: "select",
        options: [
          "Working normally",
          "Watch: performance changed",
          "Repair decision pending",
        ],
      },
      {
        name: "repair",
        label: "Recent repair estimate (optional)",
        type: "number",
        value: "0",
      },
    ],
    run: (v) => {
      const start = date(v.purchase);
      if (!start) return "Enter a valid purchase date.";
      const age = (Date.now() - start.valueOf()) / 31557600000;
      const remaining = Math.max(0, Number(v.planningYears || 0) - age);
      const status =
        v.condition === "Working normally" && remaining > 2
          ? "Monitor"
          : "Review";
      return `${v.name}: ${status}\nCurrent age: ${yearsMonths(start)}\nPlanning-horizon time remaining: ${remaining.toFixed(1)} years\nRecent repair estimate: ${money(Number(v.repair || 0))}\n\nUse model condition, energy/service evidence and a real replacement quote before deciding.`;
    },
  },
  "household-subscription-cost-calculator": {
    intro:
      "Paste one subscription per line as Name | Amount | monthly, weekly, quarterly or annual.",
    fields: [
      {
        name: "entries",
        label: "Subscriptions",
        type: "textarea",
        value: "Streaming | 15.99 | monthly\nCloud storage | 29.99 | annual",
      },
    ],
    run: (v) => {
      const factors: Record<string, number> = {
        weekly: 52,
        monthly: 12,
        quarterly: 4,
        annual: 1,
        yearly: 1,
      };
      const rows = v.entries
        .split("\n")
        .map((row) => row.split("|").map((part) => part.trim()))
        .filter((row) => row.length >= 3);
      const totals = rows.map(([name, amount, cadence]) => ({
        name,
        annual: Number(amount) * (factors[cadence.toLowerCase()] || 0),
      }));
      const total = totals.reduce((sum, item) => sum + item.annual, 0);
      return `${lines(
        "Annualized subscriptions",
        totals.map((item) => `${item.name}: ${money(item.annual)}`),
      )}\n\nMonthly equivalent: ${money(total / 12)}\nAnnual total: ${money(total)}`;
    },
  },
  "annual-subscription-cost-calculator": {
    intro:
      "Convert one recurring price into comparable monthly and annual planning amounts.",
    fields: [
      { name: "amount", label: "Price", type: "number", value: "12" },
      {
        name: "frequency",
        label: "Billing frequency",
        type: "select",
        options: ["Weekly", "Monthly", "Quarterly", "Annual"],
      },
    ],
    run: (v) => {
      const factor: Record<string, number> = {
        Weekly: 52,
        Monthly: 12,
        Quarterly: 4,
        Annual: 1,
      };
      const annual = Number(v.amount || 0) * factor[v.frequency || "Weekly"];
      return `Monthly equivalent: ${money(annual / 12)}\nAnnualized cost: ${money(annual)}\nFive-year planning total (before price changes): ${money(annual * 5)}`;
    },
  },
  "home-maintenance-cost-tracker": {
    intro:
      "Summarize planned and completed maintenance entries. Use one line per item: Task | Cost | planned or completed.",
    fields: [
      {
        name: "entries",
        label: "Maintenance costs",
        type: "textarea",
        value:
          "HVAC service | 180 | completed\nGutter inspection | 90 | planned",
      },
    ],
    run: (v) => {
      const rows = v.entries
        .split("\n")
        .map((row) => row.split("|").map((part) => part.trim()))
        .filter((row) => row.length >= 3);
      const sum = (status: string) =>
        rows
          .filter((row) => row[2].toLowerCase() === status)
          .reduce((total, row) => total + Number(row[1] || 0), 0);
      return `${lines(
        "Cost entries",
        rows.map(
          (row) => `${row[0]} — ${money(Number(row[1] || 0))} (${row[2]})`,
        ),
      )}\n\nCompleted: ${money(sum("completed"))}\nPlanned: ${money(sum("planned"))}`;
    },
  },
  "home-repair-cost-log": {
    intro:
      "Turn repair notes into a clean summary. Use Date | Item | Cost | Outcome.",
    fields: [
      {
        name: "entries",
        label: "Repair entries",
        type: "textarea",
        value: "2026-07-12 | Dishwasher | 145 | Pump replaced",
      },
    ],
    run: (v) => {
      const rows = v.entries
        .split("\n")
        .map((row) => row.split("|").map((part) => part.trim()))
        .filter((row) => row.length >= 4);
      const total = rows.reduce((sum, row) => sum + Number(row[2] || 0), 0);
      return `${lines(
        "Repair log",
        rows.map(
          (row) =>
            `${row[0]} — ${row[1]} — ${money(Number(row[2] || 0))}: ${row[3]}`,
        ),
      )}\n\nTotal recorded repair cost: ${money(total)}\nAverage per entry: ${money(rows.length ? total / rows.length : 0)}`;
    },
  },
  "emergency-binder-generator": {
    intro:
      "Generate a section checklist, not a substitute for official emergency guidance. Avoid putting sensitive values on an unsecured shared copy.",
    fields: [
      text("household", "Household label", "", "Our home"),
      {
        name: "needs",
        label: "Household needs to plan for",
        type: "textarea",
        value: "Pets\nMobility support\nPower-dependent equipment",
      },
    ],
    run: (v) =>
      lines(`${v.household || "Household"} emergency binder sections`, [
        "Local emergency contacts and official guidance",
        "Household contact tree and meeting information",
        "Utility/service contacts and safe official shutoff references",
        "Medication and care information kept in an appropriately protected section",
        "Insurance contacts and policy locations",
        "Pet/caregiver instructions",
        ...list(v.needs).map(
          (item) => `Plan and authoritative source for: ${item}`,
        ),
        "Backup copy location and review date",
      ]),
  },
  "home-inventory-checklist-generator": {
    intro:
      "Select the rooms you want to document and receive a focused starter list.",
    fields: [
      {
        name: "rooms",
        label: "Rooms or areas",
        type: "textarea",
        value: "Kitchen\nLaundry\nGarage",
      },
    ],
    run: (v) =>
      lines(
        "Room-by-room starter inventory",
        list(v.rooms).flatMap((room) => [
          `${room}:`,
          ...(
            areaItems[room] || [
              "Major furniture",
              "Electronics",
              "Items with warranties",
              "Items worth identifying",
            ]
          ).map((item) => `  ${item}`),
        ]),
      ),
  },
  "room-inventory-generator": {
    intro:
      "Generate a record checklist for one room without pretending every small possession belongs in an inventory.",
    fields: [
      text("room", "Room or area", "", "Kitchen"),
      text(
        "custom",
        "Extra item categories",
        "Separate with commas.",
        "Coffee equipment, cookware set",
      ),
    ],
    run: (v) =>
      lines(`${v.room || "Room"} inventory checklist`, [
        ...(areaItems[v.room] || [
          "Major furniture",
          "Electronics",
          "Fixed equipment",
          "Valuable items",
        ]),
        ...list(v.custom),
        "For each useful record: brand/model, serial number, purchase date, warranty, receipt location and condition",
      ]),
  },
  "recurring-chore-planner": {
    intro:
      "Pair chores with people and a repeat interval. Separate names and chores with commas.",
    fields: [
      text("members", "Household members", "", "Alex, Sam"),
      text(
        "chores",
        "Recurring responsibilities",
        "",
        "Kitchen reset, Laundry, Trash",
      ),
      {
        name: "frequency",
        label: "Frequency",
        type: "select",
        options: ["Daily", "Weekly", "Every two weeks", "Monthly"],
      },
    ],
    run: (v) => {
      const members = list(v.members);
      const chores = list(v.chores);
      return lines(
        `${v.frequency} chore rotation`,
        chores.map(
          (chore, index) =>
            `${chore} — ${members[index % Math.max(1, members.length)] || "Assign an owner"} — record completion and rotate at the next cycle`,
        ),
      );
    },
  },
  "cleaning-schedule-generator": {
    intro:
      "Create a layered routine that separates short resets from weekly and rotating work.",
    fields: [
      text("rooms", "Rooms", "", "Kitchen, Bathroom, Living room, Bedroom"),
      {
        name: "deep",
        label: "Deep-clean rotation",
        type: "select",
        options: ["One area each week", "Two areas each month", "Seasonal"],
      },
    ],
    run: (v) => {
      const rooms = list(v.rooms);
      return `${lines(
        "Daily reset",
        rooms
          .slice(0, 3)
          .map((room) => `${room}: clear surfaces and return used items`),
      )}\n\n${lines(
        "Weekly clean",
        rooms.map((room) => `${room}: complete the household-defined clean`),
      )}\n\n${lines(
        v.deep,
        rooms.map((room, i) => `Cycle ${i + 1}: ${room} detail review`),
      )}`;
    },
  },
  "home-service-reminder-generator": {
    intro: "Generate a clear reminder with context and an advance review date.",
    fields: [
      text("item", "Asset or service", "", "HVAC system"),
      text("action", "Action", "", "Schedule seasonal service"),
      { name: "due", label: "Due date", type: "date" },
      {
        name: "lead",
        label: "Advance notice in days",
        type: "number",
        value: "14",
      },
    ],
    run: (v) => {
      const due = date(v.due);
      if (!due) return "Enter a valid due date.";
      const remind = new Date(due);
      remind.setDate(remind.getDate() - Number(v.lead || 0));
      return `Reminder title: ${v.item}: ${v.action}\nReview / book by: ${fmt(remind)}\nDue: ${fmt(due)}\nCompletion record: date, provider, cost, observations and next due date.`;
    },
  },
  "household-annual-review-generator": {
    intro:
      "Create a once-a-year operations review that connects records to the next year.",
    fields: [
      {
        name: "year",
        label: "Review year",
        type: "number",
        value: String(new Date().getFullYear()),
      },
      text(
        "priorities",
        "Household priorities",
        "",
        "Reduce surprise renewals, update emergency contacts",
      ),
    ],
    run: (v) =>
      lines(`${v.year} household review`, [
        "Review maintenance completion and repeated repair patterns",
        "Review asset status, warranties and receipts",
        "Review subscriptions, annual renewals and owners",
        "Confirm emergency, utility and service contacts",
        "Test a backup export and record where it is stored",
        "Review handoff and display privacy settings",
        ...list(v.priorities).map((item) => `Priority: ${item}`),
      ]),
  },
  "move-in-checklist-generator": {
    intro:
      "Generate a phased move-in checklist focused on information that becomes harder to recover later.",
    fields: [
      {
        name: "home",
        label: "Home type",
        type: "select",
        options: ["House", "Apartment", "Condo", "Rental home"],
      },
      text(
        "needs",
        "Special needs or systems",
        "",
        "Pets, parking permit, water filter",
      ),
    ],
    run: (v) =>
      `${lines("Before arrival", ["Confirm utilities and access", "Preserve lease/closing and condition records", "List essential contacts"])}\n\n${lines("First day", ["Locate official emergency and utility information", "Photograph initial condition where appropriate", `Identify major ${v.home || "home"} systems and equipment`])}\n\n${lines("First month", ["Add high-value assets and warranties", "Create only recurring tasks that apply", "Export the first backup", ...list(v.needs).map((item) => `Set up: ${item}`)])}`,
  },
  "move-out-condition-record-generator": {
    intro:
      "Build a structured move-out inspection and handover draft without turning observations into legal conclusions. Keep signatures, identity documents, payment details and access secrets outside this tool.",
    fields: [
      text("home", "Premises label", "Use a nickname or unit label rather than a full public address.", "Rental home"),
      {
        name: "stage",
        label: "Record stage",
        type: "select",
        options: ["Pre-move self-check", "Joint handover", "Post-handover follow-up"],
      },
      { name: "inspected", label: "Inspection date", type: "date" },
      { name: "handover", label: "Planned or completed handover date", type: "date" },
      text("source", "Agreement and starting-condition reference", "Name the lease, check-in inventory, dated photo set or other source you can reopen.", "Lease and check-in inventory dated 2025-09-01"),
      {
        name: "participants",
        label: "Participants or roles",
        type: "textarea",
        help: "One per line or comma separated; 1–8 entries. This is not a signature field.",
        value: "Tenant\nProperty manager",
      },
      {
        name: "conditions",
        label: "Condition observations",
        type: "textarea",
        help: "One line per area: area | observed condition | evidence reference | next action and owner | Open, Ready to confirm, Disputed, or Confirmed. Maximum 12 lines.",
        value: "Kitchen | Sink cabinet dry during agreed check | IMG_001–003 | Both: compare with check-in record | Ready to confirm\nBedroom | Existing wall mark remains visible | IMG_004 and check-in IMG_019 | Manager: acknowledge in handover copy | Disputed\nLiving room | Personal items removed; floor visible | IMG_005–008 | Tenant: no further action recorded | Confirmed",
      },
      {
        name: "accessItems",
        label: "Keys and access items",
        type: "textarea",
        help: "One line per item: item | whole-number count | recipient or return status | evidence reference. Maximum 8 lines; never enter a code.",
        value: "Front-door key | 2 | Return to property manager at handover | KEY_001\nAccess card | 1 | Return to property manager at handover | KEY_002",
      },
      {
        name: "meters",
        label: "Meter or service readings",
        type: "textarea",
        help: "One line per service: service | observed reading or status | unit | evidence reference. Maximum 8 lines.",
        value: "Electricity | 012345 | kWh | METER_001\nWater | 00678 | local billing unit | METER_002",
      },
      { name: "followUp", label: "Next follow-up date", type: "date" },
      text("storage", "Protected record location", "Write a folder or envelope label, not a password or access code.", "Household records / move-out / final handover"),
    ],
    run: (values) => {
      const inspected = date(values.inspected);
      const handover = date(values.handover);
      const followUp = date(values.followUp);
      if (!values.home.trim()) return "Enter a premises label so the exported record can be identified.";
      if (!inspected) return "Enter a valid inspection date.";
      if (!handover) return "Enter a valid planned or completed handover date.";
      if (!followUp) return "Enter a valid next follow-up date.";
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      if (inspected.getTime() > today.getTime())
        return "The inspection date cannot be in the future. Use the handover and follow-up fields to plan future work.";
      if (handover.getTime() < inspected.getTime())
        return "The handover date cannot be earlier than the inspection date.";
      if (followUp.getTime() < handover.getTime())
        return "The follow-up date cannot be earlier than the handover date.";
      if (!values.source.trim()) return "Add the agreement and starting-condition source you will use for comparison.";
      if (!values.storage.trim()) return "Add a protected record location so the evidence can be found again.";
      const participants = uniqueList(values.participants);
      if (participants.length === 0) return "Add at least one participant or role.";
      if (participants.length > 8) return "Use no more than 8 participant or role entries in one record.";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const conditionRows = parseRows(values.conditions);
      if (conditionRows.length === 0) return "Add at least one condition observation.";
      if (conditionRows.length > 12) return "Use no more than 12 condition rows in one record.";
      const invalidConditions = conditionRows.filter((row) => row.parts.length !== 5 || row.parts.some((part) => !part));
      if (invalidConditions.length)
        return `Condition line ${invalidConditions.map((row) => row.line).join(", ")} must contain all 5 pipe-separated fields.`;
      const validStatuses = new Set(["open", "ready to confirm", "disputed", "confirmed"]);
      const invalidStatuses = conditionRows.filter((row) => !validStatuses.has(row.parts[4].toLocaleLowerCase("en")));
      if (invalidStatuses.length)
        return `Condition line ${invalidStatuses.map((row) => row.line).join(", ")} must end with Open, Ready to confirm, Disputed, or Confirmed.`;
      const areaNames = conditionRows.map((row) => row.parts[0].toLocaleLowerCase("en"));
      if (new Set(areaNames).size !== areaNames.length)
        return "Each condition area must appear only once; combine observations for the same area.";
      const accessRows = parseRows(values.accessItems);
      if (accessRows.length === 0) return "Add at least one key or access-item row, or record a Not applicable row with a count of 0.";
      if (accessRows.length > 8) return "Use no more than 8 key and access-item rows.";
      const invalidAccess = accessRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part) || !Number.isInteger(Number(row.parts[1])) || Number(row.parts[1]) < 0 || Number(row.parts[1]) > 99);
      if (invalidAccess.length)
        return `Access line ${invalidAccess.map((row) => row.line).join(", ")} needs 4 fields and a whole-number count from 0 to 99.`;
      const meterRows = parseRows(values.meters);
      if (meterRows.length === 0) return "Add at least one meter or service row, or record why it is not applicable.";
      if (meterRows.length > 8) return "Use no more than 8 meter or service rows.";
      const invalidMeters = meterRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidMeters.length)
        return `Meter line ${invalidMeters.map((row) => row.line).join(", ")} must contain all 4 pipe-separated fields.`;
      const shareable = [values.source, values.conditions, values.accessItems, values.meters, values.storage].join("\n");
      if (/password|passcode|security code|access code|full card number|bank account|social security|\bssn\b|\bpin\s*[:=]/i.test(shareable))
        return "A possible password, access code, PIN or sensitive identifier was detected. Replace it with a protected-location reference.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = ["Open", "Ready to confirm", "Disputed", "Confirmed"].map((status) => ({
        status,
        count: conditionRows.filter((row) => row.parts[4].toLocaleLowerCase("en") === status.toLocaleLowerCase("en")).length,
      })).filter((item) => item.count > 0);
      return `${values.home.trim()} — move-out condition record\nStage: ${values.stage}\nInspection: ${formatter.format(inspected)}\nHandover: ${formatter.format(handover)}\nNext follow-up: ${formatter.format(followUp)}\nCompared against: ${values.source.trim()}\nParticipants / roles: ${participants.join("; ")}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\n${lines("Condition observations", conditionRows.map((row) => `${row.parts[0]} — observed: ${row.parts[1]} — evidence: ${row.parts[2]} — next action: ${row.parts[3]} — status: ${row.parts[4]}`))}\n\n${lines("Keys and access items", accessRows.map((row) => `${row.parts[0]} — count ${row.parts[1]} — ${row.parts[2]} — evidence: ${row.parts[3]}`))}\n\n${lines("Meters and services", meterRows.map((row) => `${row.parts[0]} — ${row.parts[1]} ${row.parts[2]} — evidence: ${row.parts[3]}`))}\n\nProtected record location: ${values.storage.trim()}\n\nClose-out check: preserve the original files, record disagreements instead of overwriting them, identify who accepted each next action, and give each intended party the agreed copy. This browser output is an unsigned working record—not proof of cause, liability, payment, deposit deductions, legal notice or final agreement. Your lease, local law and qualified advice control.`;
    },
  },
  "home-emergency-drill-record-generator": {
    intro:
      "Record what a household actually practiced, where the exercise stopped, and who owns each improvement. Use a calm announced exercise based on current local official guidance; this tool does not direct a real emergency or certify that a home is safe.",
    fields: [
      text("household", "Household label", "Use a private nickname, not a full street address.", "Maple household"),
      {
        name: "drillType",
        label: "Exercise type",
        type: "select",
        options: [
          "Whole-home evacuation walk-through",
          "Home fire escape practice",
          "Earthquake response and post-shaking assembly review",
          "Communication and reunion exercise",
          "Accessibility, caregiver and pet support check",
        ],
      },
      { name: "practiced", label: "Exercise date", type: "date" },
      {
        name: "minutes",
        label: "Observed exercise duration in minutes",
        type: "number",
        value: "8",
        help: "Record elapsed time only as an observation. It is not a pass/fail score.",
      },
      text("guidance", "Official plan or guidance reference", "Name the current local authority page, building plan or household plan version used for this exercise.", "Local emergency-management guidance checked 2026-08-23; household plan v3"),
      text("scope", "Exercise goal and announced boundaries", "State what was practiced and what was intentionally simulated or excluded.", "Walk the planned exits, meet at the household meeting reference, and test the backup contact without creating a real alarm"),
      {
        name: "participants",
        label: "Participants or roles",
        type: "textarea",
        help: "One per line or comma separated; 1–12 entries. Use only the detail needed for this household record.",
        value: "Adult 1\nAdult 2\nChild participant\nPet support role",
      },
      {
        name: "observations",
        label: "Exercise observations",
        type: "textarea",
        help: "One line per phase: phase | planned check | observed result | improvement and owner | Observed as planned, Needs follow-up, Not tested, or Stopped for safety. Maximum 12 lines.",
        value: "Start and awareness | Everyone recognizes the announced start | One participant needed a second prompt | Adult 1: review the agreed signal before the next exercise | Needs follow-up\nExit walk-through | Planned exits can be reached without moving stored items | Primary path clear; alternate window not tested | Adult 2: verify alternate option with local guidance | Not tested\nMeeting and count | Everyone goes to the household meeting reference and checks in | All participants accounted for at the practice point | Adult 1: record completion | Observed as planned",
      },
      {
        name: "support",
        label: "People, caregiver and pet support checks",
        type: "textarea",
        help: "One line per need: person/pet/support scenario | primary role | backup role | observed result. Maximum 8 lines; do not enter diagnoses or medication details.",
        value: "Child participant | Adult 1 | Adult 2 | Both roles could explain the agreed support\nPet carrier | Adult 2 | Adult 1 | Carrier was retrievable without a key or code",
      },
      {
        name: "communications",
        label: "Communication and reunion checks",
        type: "textarea",
        help: "One line per scenario: scenario | primary method or meeting reference | backup | observed result. Maximum 8 lines; avoid publishing precise vulnerable-person locations.",
        value: "Household separated locally | Family group text | Out-of-area contact | Test message acknowledged by the intended participants\nHome cannot be used | Primary meeting reference | Alternate meeting reference from protected plan | Both references could be found in the offline card",
      },
      { name: "followUp", label: "Next review or repeat date", type: "date" },
      text("storage", "Protected record location", "Write a folder or envelope label, not a password, passcode or exact public location.", "Household records / emergency exercises / 2026"),
    ],
    run: (values) => {
      const practiced = date(values.practiced);
      const followUp = date(values.followUp);
      if (!values.household.trim()) return "Enter a household label so the exported record can be identified.";
      if (!practiced) return "Enter a valid exercise date.";
      if (!followUp) return "Enter a valid next review or repeat date.";
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      if (practiced.getTime() > today.getTime())
        return "The exercise date cannot be in the future. Record the exercise after it actually occurs.";
      if (followUp.getTime() <= practiced.getTime())
        return "The next review or repeat date must be later than the exercise date.";
      const minutes = Number(values.minutes);
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > 240)
        return "Enter an observed duration from 1 to 240 whole minutes.";
      if (!values.guidance.trim()) return "Add the official plan or guidance reference used for this exercise.";
      if (!values.scope.trim()) return "Describe the exercise goal and announced boundaries.";
      if (!values.storage.trim()) return "Add a protected record location so the exercise evidence can be found again.";
      const participants = uniqueList(values.participants);
      if (participants.length === 0) return "Add at least one participant or role.";
      if (participants.length > 12) return "Use no more than 12 participants or roles in one record.";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const observations = parseRows(values.observations);
      if (observations.length === 0) return "Add at least one exercise observation.";
      if (observations.length > 12) return "Use no more than 12 exercise-observation rows.";
      const invalidObservations = observations.filter((row) => row.parts.length !== 5 || row.parts.some((part) => !part));
      if (invalidObservations.length)
        return `Observation line ${invalidObservations.map((row) => row.line).join(", ")} must contain all 5 pipe-separated fields.`;
      const validStatuses = new Set(["observed as planned", "needs follow-up", "not tested", "stopped for safety"]);
      const invalidStatuses = observations.filter((row) => !validStatuses.has(row.parts[4].toLocaleLowerCase("en")));
      if (invalidStatuses.length)
        return `Observation line ${invalidStatuses.map((row) => row.line).join(", ")} must end with Observed as planned, Needs follow-up, Not tested, or Stopped for safety.`;
      const phaseNames = observations.map((row) => row.parts[0].toLocaleLowerCase("en"));
      if (new Set(phaseNames).size !== phaseNames.length)
        return "Each exercise phase must appear only once; combine observations for the same phase.";
      const supportRows = parseRows(values.support);
      if (supportRows.length > 8) return "Use no more than 8 people, caregiver or pet support rows.";
      const invalidSupport = supportRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidSupport.length)
        return `Support line ${invalidSupport.map((row) => row.line).join(", ")} must contain all 4 pipe-separated fields.`;
      const communicationRows = parseRows(values.communications);
      if (communicationRows.length === 0) return "Add at least one communication or reunion check.";
      if (communicationRows.length > 8) return "Use no more than 8 communication or reunion rows.";
      const invalidCommunications = communicationRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidCommunications.length)
        return `Communication line ${invalidCommunications.map((row) => row.line).join(", ")} must contain all 4 pipe-separated fields.`;
      const shareable = [values.guidance, values.scope, values.participants, values.observations, values.support, values.communications, values.storage].join("\n");
      if (/password|passcode|security code|access code|alarm code|door code|full card number|bank account|social security|medical record|diagnosis|medication dose|\bssn\b|\bpin\s*[:=]/i.test(shareable))
        return "A possible password, access code, financial identifier or unnecessary medical detail was detected. Replace it with a protected-location or authoritative-source reference.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = ["Observed as planned", "Needs follow-up", "Not tested", "Stopped for safety"].map((status) => ({
        status,
        count: observations.filter((row) => row.parts[4].toLocaleLowerCase("en") === status.toLocaleLowerCase("en")).length,
      })).filter((item) => item.count > 0);
      const supportOutput = supportRows.length
        ? supportRows.map((row) => `${row.parts[0]} — primary: ${row.parts[1]} — backup: ${row.parts[2]} — observed: ${row.parts[3]}`)
        : ["No separate support scenario was recorded; confirm that this reflects the household rather than an omitted need."];
      return `${values.household.trim()} — household emergency exercise record\nExercise type: ${values.drillType}\nExercise date: ${formatter.format(practiced)}\nObserved duration: ${minutes} minutes (observation only, not a pass/fail score)\nOfficial plan / guidance reference: ${values.guidance.trim()}\nGoal and announced boundaries: ${values.scope.trim()}\nParticipants / roles: ${participants.join("; ")}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\nNext review or repeat: ${formatter.format(followUp)}\n\n${lines("Exercise observations", observations.map((row) => `${row.parts[0]} — planned check: ${row.parts[1]} — observed: ${row.parts[2]} — improvement: ${row.parts[3]} — status: ${row.parts[4]}`))}\n\n${lines("People, caregiver and pet support", supportOutput)}\n\n${lines("Communication and reunion checks", communicationRows.map((row) => `${row.parts[0]} — primary: ${row.parts[1]} — backup: ${row.parts[2]} — observed: ${row.parts[3]}`))}\n\nProtected record location: ${values.storage.trim()}\n\nClose-out check: assign every Needs follow-up, Not tested or Stopped for safety row to a named owner and repeat only after the plan or environment has been corrected. This output records an announced practice; it is not a safety certification, building approval, medical plan or real-time emergency instruction. In an actual event, current official alerts, emergency services and on-scene conditions take priority.`;
    },
  },
  "emergency-supply-inventory-audit": {
    intro:
      "Audit what the household can actually find against a current official or household plan. The tool records evidence and follow-up; it does not prescribe universal quantities, approve a kit, or replace local emergency guidance.",
    fields: [
      text("household", "Household label", "Use a private nickname, not a street address.", "Maple household"),
      {
        name: "scope",
        label: "Inventory scope",
        type: "select",
        options: [
          "Portable evacuation or go-bag supplies",
          "Stay-at-home emergency supplies",
          "Power-outage support supplies",
          "Accessibility, caregiver or child support module",
          "Pet evacuation support module",
        ],
      },
      {
        name: "people",
        label: "People covered by this review",
        type: "number",
        value: "3",
        help: "Context only. The tool does not multiply or prescribe quantities.",
      },
      text("supportContext", "Additional needs included", "Use short categories such as infant care, mobility-device power, sensory support or pet transport. Do not enter diagnoses, doses or identity details.", "Pet transport; one household member uses prescription glasses"),
      { name: "reviewed", label: "Physical review date", type: "date" },
      { name: "nextReview", label: "Next inventory review date", type: "date" },
      text("authority", "Current guidance or plan reference", "Name the authority or household plan, version and date checked. Do not rely on an unattributed shopping list.", "Ready.gov emergency supply list checked 2026-08-23; county preparedness page checked the same day"),
      {
        name: "inventory",
        label: "Observed inventory rows",
        type: "textarea",
        help: "One line: ID | category | item | requirement/source note | quantity and unit actually observed | condition/date evidence | storage label | Ready and observed, Rotate or replace, Verify requirement, or Missing from chosen plan. Maximum 20 lines.",
        value: "WATER-1 | Water and food | Drinking water | Quantity follows current local guidance and household plan | 6 sealed bottles; label units recorded in protected inventory | Seals intact; printed dates checked 2026-08-23 | Hall closet go-bag | Ready and observed\nLIGHT-1 | Lighting | Headlamp and matching batteries | Ready.gov list checked 2026-08-23 | 1 headlamp and 3 matching batteries | Function tested; battery package date recorded | Hall closet go-bag | Ready and observed\nPOWER-1 | Communication and power | Charged power bank and cable | Household communication plan | 1 power bank and 1 cable | Charge indicator low during physical check | Charging shelf | Rotate or replace\nCARE-1 | Personal support | Care-plan supply pointer | Requirement must be confirmed by the person and qualified source | Protected care-plan reference present; supply amount not copied here | Review date on protected plan not confirmed | Protected support pouch | Verify requirement",
      },
      {
        name: "actions",
        label: "Follow-up for every unresolved ID",
        type: "textarea",
        help: "One line: unresolved ID | next action | owner or role | due date YYYY-MM-DD. Include exactly one row for every Rotate or replace, Verify requirement, or Missing item; due dates must fall after the physical review and no later than the next review.",
        value: "POWER-1 | Fully charge and test with the intended phone and cable, then record the observed result | Adult 1 | 2026-09-01\nCARE-1 | Ask the person and qualified source to confirm the current requirement; keep details in the protected care plan | Care-plan owner | 2026-09-05",
      },
      text("storage", "Protected inventory location", "Use a folder or envelope label, not a password, access code or public location.", "Household records / emergency supplies / 2026-08"),
    ],
    run: (values) => {
      const reviewed = date(values.reviewed);
      const nextReview = date(values.nextReview);
      if (!values.household.trim()) return "Enter a household label so the exported audit can be identified.";
      if (!reviewed) return "Enter a valid physical review date.";
      if (!nextReview) return "Enter a valid next inventory review date.";
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      if (reviewed.getTime() > today.getTime())
        return "The physical review date cannot be in the future. Record only supplies you actually inspected.";
      if (nextReview.getTime() <= reviewed.getTime())
        return "The next inventory review date must be later than the physical review date.";
      const people = Number(values.people);
      if (!Number.isInteger(people) || people < 1 || people > 20)
        return "Enter 1 to 20 people covered by this review. This is context, not a quantity formula.";
      if (!values.authority.trim()) return "Add the current guidance or household-plan reference used for this audit.";
      if (!values.storage.trim()) return "Add a protected inventory location so the evidence can be found again.";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const inventoryRows = parseRows(values.inventory);
      if (inventoryRows.length === 0) return "Add at least one supply row observed during the physical review.";
      if (inventoryRows.length > 20) return "Use no more than 20 supply rows in one audit; split a larger inventory by scope or container.";
      const invalidInventory = inventoryRows.filter((row) => row.parts.length !== 8 || row.parts.some((part) => !part));
      if (invalidInventory.length)
        return `Inventory line ${invalidInventory.map((row) => row.line).join(", ")} must contain all 8 pipe-separated fields.`;
      const statuses = new Set(["ready and observed", "rotate or replace", "verify requirement", "missing from chosen plan"]);
      const invalidStatuses = inventoryRows.filter((row) => !statuses.has(row.parts[7].toLocaleLowerCase("en")));
      if (invalidStatuses.length)
        return `Inventory line ${invalidStatuses.map((row) => row.line).join(", ")} must end with Ready and observed, Rotate or replace, Verify requirement, or Missing from chosen plan.`;
      const ids = inventoryRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length)
        return "Every supply row needs a unique ID so follow-up cannot attach to the wrong item.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Supply IDs must use 2–20 letters, numbers or hyphens, such as WATER-1.";
      const unresolved = inventoryRows.filter((row) => row.parts[7].toLocaleLowerCase("en") !== "ready and observed");
      const actionRows = parseRows(values.actions);
      if (actionRows.length > 20) return "Use no more than 20 follow-up rows in one audit.";
      const invalidActions = actionRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidActions.length)
        return `Follow-up line ${invalidActions.map((row) => row.line).join(", ")} must contain all 4 pipe-separated fields.`;
      const actionIds = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(actionIds).size !== actionIds.length)
        return "Each unresolved supply ID must have exactly one follow-up row.";
      const unresolvedIds = new Set(unresolved.map((row) => row.parts[0].toLocaleUpperCase("en")));
      const missingActions = [...unresolvedIds].filter((id) => !actionIds.includes(id));
      if (missingActions.length)
        return `Add one follow-up row for every unresolved supply ID: ${missingActions.join(", ")}.`;
      const extraActions = actionIds.filter((id) => !unresolvedIds.has(id));
      if (extraActions.length)
        return `Follow-up rows may reference only unresolved supply IDs. Remove or update: ${extraActions.join(", ")}.`;
      const invalidDueDates = actionRows.filter((row) => {
        const due = strictIsoDate(row.parts[3]);
        return !due || due.getTime() <= reviewed.getTime() || due.getTime() > nextReview.getTime();
      });
      if (invalidDueDates.length)
        return `Follow-up line ${invalidDueDates.map((row) => row.line).join(", ")} needs a real YYYY-MM-DD date after the physical review and no later than the next inventory review.`;
      const shareable = [values.authority, values.supportContext, values.inventory, values.actions, values.storage].join("\n");
      if (/password|passcode|access code|alarm code|door code|full card number|bank account|social security|medical record|diagnosis|medication dose|dosage|\bssn\b|\bpin\s*[:=]/i.test(shareable))
        return "A possible password, access code, financial identifier or unnecessary medical detail was detected. Replace it with a protected-record reference.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const displayStatuses = ["Ready and observed", "Rotate or replace", "Verify requirement", "Missing from chosen plan"];
      const statusCounts = displayStatuses.map((status) => ({
        status,
        count: inventoryRows.filter((row) => row.parts[7].toLocaleLowerCase("en") === status.toLocaleLowerCase("en")).length,
      })).filter((item) => item.count > 0);
      const supportContext = values.supportContext.trim() || "No additional support category recorded; confirm this reflects the household rather than an omitted need.";
      return `${values.household.trim()} — emergency supply inventory audit\nScope: ${values.scope}\nPhysical review: ${formatter.format(reviewed)}\nNext inventory review: ${formatter.format(nextReview)}\nPeople covered: ${people} (context only; no quantity was prescribed)\nAdditional needs included: ${supportContext}\nGuidance / plan reference: ${values.authority.trim()}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")} (not a readiness score)\n\n${lines("Observed inventory", inventoryRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — ${row.parts[2]} — requirement/source: ${row.parts[3]} — observed: ${row.parts[4]} — evidence: ${row.parts[5]} — stored: ${row.parts[6]} — status: ${row.parts[7]}`))}\n\n${lines("Required follow-up", actionRows.length ? actionRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — owner: ${row.parts[2]} — due: ${formatter.format(strictIsoDate(row.parts[3]) as Date)}`) : ["No unresolved row was recorded in this audit. Recheck the source, scope and physical evidence before treating that as complete."])}\n\nProtected inventory location: ${values.storage.trim()}\n\nClose-out check: compare this observation with the latest local authority and household-specific plan, preserve printed dates and manufacturer instructions, assign every unresolved ID, and update the source record after physical reinspection. This output does not prescribe quantities, approve a kit, guarantee availability, or replace medical, accessibility, pet-care or emergency guidance. In an actual event, follow current official alerts and instructions.`;
    },
  },
  "emergency-contact-verification-log": {
    intro:
      "Audit whether each emergency-contact record was confirmed by the intended person or an official source, whether its sharing scope is understood, and who owns every correction. Enter safe labels only—never full phone numbers, email addresses, street addresses or private care details.",
    fields: [
      text("household", "Household label", "Use a private nickname, not a street address.", "Maple household"),
      {
        name: "scope",
        label: "Verification scope",
        type: "select",
        options: [
          "Household emergency communication plan",
          "Shared caregiver or sitter contact sheet",
          "School, child-care or dependent-care contacts",
          "Building, utility and service contacts",
          "Full annual contact review",
        ],
      },
      { name: "reviewed", label: "Review completed date", type: "date" },
      { name: "nextReview", label: "Next contact review date", type: "date" },
      text("authority", "Plan and official-source reference", "Name the current local authority page and household plan version checked. Do not paste account or case numbers.", "Local emergency-management communication guidance checked 2026-08-23; household contact plan v2"),
      {
        name: "records",
        label: "Contact verification rows",
        type: "textarea",
        help: "One line: ID | role/purpose | protected source location | safe channel hint | verification method/evidence | verification date YYYY-MM-DD | sharing/consent scope | Confirmed with person or official source, Needs correction, Awaiting confirmation, or Retired; removal pending. Maximum 20. Do not enter the actual phone number or email address.",
        value: "LOCAL-1 | Trusted nearby contact for household check-in | Protected household contact record LOCAL-1 | Mobile ending 42 | Person confirmed the intended role and safe contact method directly | 2026-08-22 | May appear on the private household card; not for public posting | Confirmed with person or official source\nUTILITY-1 | Electricity outage reporting | Protected service directory UTILITY-1 | Official outage channel | Provider website and current bill source were compared | 2026-08-23 | Household reference only; account details remain protected | Confirmed with person or official source\nCARE-1 | Backup caregiver contact | Protected care-plan contact CARE-1 | Channel hint pending | Request sent to confirm role, method and permitted recipients | 2026-08-20 | Do not share until the person confirms | Awaiting confirmation",
      },
      {
        name: "actions",
        label: "Follow-up for every unresolved ID",
        type: "textarea",
        help: "One line: unresolved ID | next action | owner or role | due date YYYY-MM-DD. Include exactly one row for every Needs correction, Awaiting confirmation, or Retired row. The due date must be after this review and no later than the next review.",
        value: "CARE-1 | Ask the intended caregiver to confirm the role, safe channel and sharing scope; then update the protected source | Household coordinator | 2026-09-02",
      },
      text("storage", "Protected verification-record location", "Use a folder, envelope or backup label, not a password, access code, address or actual contact detail.", "Household records / emergency contacts / verification 2026-08"),
    ],
    run: (values) => {
      const reviewed = strictIsoDate(values.reviewed);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.household.trim()) return "Enter a household label so the exported verification record can be identified.";
      if (!reviewed) return "Enter a real review completed date in YYYY-MM-DD format.";
      if (!nextReview) return "Enter a real next contact review date in YYYY-MM-DD format.";
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      if (reviewed.getTime() > today.getTime())
        return "The completed review date cannot be in the future. Record verification only after it actually occurs.";
      if (nextReview.getTime() <= reviewed.getTime())
        return "The next contact review date must be later than the completed review date.";
      if (!values.authority.trim()) return "Add the official-source and household-plan reference used for this review.";
      if (!values.storage.trim()) return "Add a protected location where the verification record can be found again.";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const recordRows = parseRows(values.records);
      if (recordRows.length === 0) return "Add at least one contact record that was actually reviewed.";
      if (recordRows.length > 20) return "Use no more than 20 contact rows in one review; split a larger directory by purpose or audience.";
      const invalidRecords = recordRows.filter((row) => row.parts.length !== 8 || row.parts.some((part) => !part));
      if (invalidRecords.length)
        return `Contact line ${invalidRecords.map((row) => row.line).join(", ")} must contain all 8 pipe-separated fields.`;
      const statuses = new Set(["confirmed with person or official source", "needs correction", "awaiting confirmation", "retired; removal pending"]);
      const invalidStatuses = recordRows.filter((row) => !statuses.has(row.parts[7].toLocaleLowerCase("en")));
      if (invalidStatuses.length)
        return `Contact line ${invalidStatuses.map((row) => row.line).join(", ")} must end with Confirmed with person or official source, Needs correction, Awaiting confirmation, or Retired; removal pending.`;
      const ids = recordRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length)
        return "Every contact record needs a unique ID so a correction cannot attach to the wrong source.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Contact IDs must use 2–20 letters, numbers or hyphens, such as LOCAL-1.";
      const invalidVerificationDates = recordRows.filter((row) => {
        const verified = strictIsoDate(row.parts[5]);
        return !verified || verified.getTime() > reviewed.getTime() || verified.getTime() > today.getTime();
      });
      if (invalidVerificationDates.length)
        return `Contact line ${invalidVerificationDates.map((row) => row.line).join(", ")} needs a real YYYY-MM-DD verification date no later than this completed review.`;
      const unsafeChannels = recordRows.filter((row) => row.parts[3].includes("@") || (row.parts[3].match(/\d/g) || []).length > 4);
      if (unsafeChannels.length)
        return `Contact line ${unsafeChannels.map((row) => row.line).join(", ")} appears to contain a full phone number or email address. Use a safe hint such as “mobile ending 42” and keep the actual detail in the protected source.`;
      const unresolvedRows = recordRows.filter((row) => row.parts[7].toLocaleLowerCase("en") !== "confirmed with person or official source");
      const actionRows = parseRows(values.actions);
      if (actionRows.length > 20) return "Use no more than 20 follow-up rows in one review.";
      const invalidActions = actionRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidActions.length)
        return `Follow-up line ${invalidActions.map((row) => row.line).join(", ")} must contain all 4 pipe-separated fields.`;
      const actionIds = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(actionIds).size !== actionIds.length)
        return "Each unresolved contact ID must have exactly one follow-up row.";
      const unresolvedIds = new Set(unresolvedRows.map((row) => row.parts[0].toLocaleUpperCase("en")));
      const missingActions = [...unresolvedIds].filter((id) => !actionIds.includes(id));
      if (missingActions.length)
        return `Add one follow-up row for every unresolved contact ID: ${missingActions.join(", ")}.`;
      const extraActions = actionIds.filter((id) => !unresolvedIds.has(id));
      if (extraActions.length)
        return `Follow-up rows may reference only unresolved contact IDs. Remove or update: ${extraActions.join(", ")}.`;
      const invalidDueDates = actionRows.filter((row) => {
        const due = strictIsoDate(row.parts[3]);
        return !due || due.getTime() <= reviewed.getTime() || due.getTime() > nextReview.getTime();
      });
      if (invalidDueDates.length)
        return `Follow-up line ${invalidDueDates.map((row) => row.line).join(", ")} needs a real YYYY-MM-DD date after the completed review and no later than the next review.`;
      const privacyText = [
        values.authority,
        values.storage,
        ...recordRows.flatMap((row) => [row.parts[1], row.parts[2], row.parts[3], row.parts[4], row.parts[6]]),
        ...actionRows.flatMap((row) => [row.parts[1], row.parts[2]]),
      ].join("\n");
      const contactPatternText = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(contactPatternText) || /(?:\d[\s().+-]*){7,}/.test(contactPatternText))
        return "A full phone number or email address may be present. Keep actual contact details in the protected source and use only a safe channel hint here.";
      if (/password|passcode|access code|alarm code|door code|full address|policy number|account number|bank account|social security|medical record|diagnosis|medication dose|dosage|date of birth|government id|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, address, identifier or unnecessary medical detail was detected. Replace it with a protected-record pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const displayStatuses = ["Confirmed with person or official source", "Needs correction", "Awaiting confirmation", "Retired; removal pending"];
      const statusCounts = displayStatuses.map((status) => ({
        status,
        count: recordRows.filter((row) => row.parts[7].toLocaleLowerCase("en") === status.toLocaleLowerCase("en")).length,
      })).filter((item) => item.count > 0);
      return `${values.household.trim()} — emergency contact verification log\nScope: ${values.scope}\nReview completed: ${formatter.format(reviewed)}\nNext contact review: ${formatter.format(nextReview)}\nPlan / official-source reference: ${values.authority.trim()}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")} (workflow summary, not an emergency-readiness score)\n\n${lines("Verified contact records", recordRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — protected source: ${row.parts[2]} — safe channel hint: ${row.parts[3]} — evidence: ${row.parts[4]} — verified: ${formatter.format(strictIsoDate(row.parts[5]) as Date)} — sharing/consent: ${row.parts[6]} — status: ${row.parts[7]}`))}\n\n${lines("Required follow-up", actionRows.length ? actionRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — owner: ${row.parts[2]} — due: ${formatter.format(strictIsoDate(row.parts[3]) as Date)}`) : ["No unresolved contact was recorded. Confirm that every role, source and sharing scope was actually checked before closing the review."])}\n\nProtected verification-record location: ${values.storage.trim()}\n\nClose-out check: update the protected source, then replace or destroy superseded shared copies and ask an intended user to locate the current plan. This log contains labels and evidence, not the contact details themselves. It does not contact anyone, validate a phone network, replace local emergency services, or guarantee that a person or service will be available. In a real emergency, use current official channels and instructions.`;
    },
  },
  "household-power-outage-event-log": {
    intro:
      "Create a dated household record of what was actually observed during a power outage, which source was checked, and who owns every open follow-up. The tool does not identify the cause, predict restoration, judge food or medical-device safety, or decide claims.",
    fields: [
      text("household", "Household label", "Use a private nickname, not a street address or utility account number.", "Maple household"),
      {
        name: "stage",
        label: "Record stage",
        type: "select",
        options: [
          "Outage ongoing; facts still being observed",
          "Supply restoration observed; household checks open",
          "Household close-out review complete",
        ],
      },
      {
        name: "scope",
        label: "Observed outage scope",
        type: "select",
        options: [
          "Area or utility event shown by an official source",
          "Building or shared service affected",
          "One dwelling or part of the dwelling affected",
          "Scope not yet established",
        ],
      },
      { name: "startDate", label: "First observed outage date", type: "date" },
      text("startTime", "First observed time (24-hour HH:MM)", "Use the time actually observed. If approximate, say so in the source/evidence field.", "09:15"),
      { name: "restoredDate", label: "Restoration observed date (leave blank if ongoing)", type: "date" },
      text("restoredTime", "Restoration observed time (leave blank if ongoing)", "Use 24-hour HH:MM. The date and time must either both be present or both be blank.", ""),
      { name: "nextReview", label: "Next household review date", type: "date" },
      text("source", "Official source and event evidence", "Name the utility or responsible organization, channel, reference date and safe case hint. Do not enter an account number, full address or credential.", "Utility official outage page checked 2026-08-23; protected report reference OUTAGE-1"),
      {
        name: "observations",
        label: "System observation rows",
        type: "textarea",
        help: "One line: ID | area or system | first observed condition | source/evidence | household action already taken | owner/observer | Observed; monitoring, Official or qualified follow-up pending, Restored; recheck pending, or Closed after recheck. Maximum 15 lines. Record facts, not diagnoses or repair instructions.",
        value: "POWER-1 | Dwelling supply | Lights and ordinary outlets unavailable at first check | Utility official outage page showed an area event; checked 09:25 | Official page checked and event reference saved | Household coordinator | Observed; monitoring\nCOLD-1 | Refrigerator and freezer | Doors remained closed; no safety decision recorded here | Start time and any temperature evidence indexed in protected event file | Condition logged for later review against current health guidance | Food-record owner | Official or qualified follow-up pending\nROUTER-1 | Home network | Router lost power at first observation | Device status light unavailable; no equipment fault inferred | Existing backup communication method used | Communications owner | Restored; recheck pending",
      },
      {
        name: "support",
        label: "Household-specific support references",
        type: "textarea",
        help: "Optional. One line: support category | authoritative plan or instructions location | observed impact only | responsible role. Maximum 8 lines. Do not enter diagnoses, medication doses or device settings.",
        value: "Communication | Protected household communication plan COMM-1 | Home internet unavailable during first check | Communications owner\nPower-dependent support | Manufacturer/provider plan pointer in protected care record CARE-1 | Backup-status review requested; no safety conclusion recorded | Care-plan owner",
      },
      {
        name: "actions",
        label: "Follow-up for every unresolved observation ID",
        type: "textarea",
        help: "One line: unresolved ID | next evidence-based action | owner or role | due date YYYY-MM-DD. Every row not Closed after recheck needs exactly one action. Due dates may be the outage date and must be no later than the next review.",
        value: "POWER-1 | Recheck the utility official status at the household's planned interval and record any new source timestamp | Household coordinator | 2026-08-23\nCOLD-1 | Compare recorded time and temperature evidence with current responsible health-authority guidance; preserve the decision source | Food-record owner | 2026-08-23\nROUTER-1 | After stable supply is observed, test the intended connection and record the result without inferring outage cause | Communications owner | 2026-08-24",
      },
      text("storage", "Protected event-record location", "Use a folder or envelope label, not a password, account number, full address or public link.", "Household records / outage events / OUTAGE-1"),
    ],
    run: (values) => {
      const started = localDateTime(values.startDate, values.startTime);
      const restoredDatePresent = Boolean(values.restoredDate.trim());
      const restoredTimePresent = Boolean(values.restoredTime.trim());
      const restored = restoredDatePresent && restoredTimePresent
        ? localDateTime(values.restoredDate, values.restoredTime)
        : null;
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.household.trim()) return "Enter a household label so the exported event record can be identified.";
      if (!started) return "Enter a real first-observed date and a 24-hour time in HH:MM format.";
      const now = new Date();
      if (started.getTime() > now.getTime())
        return "The first-observed outage time cannot be in the future. Record only an event already observed.";
      if (restoredDatePresent !== restoredTimePresent)
        return "Enter both the restoration-observed date and time, or leave both blank while the outage is ongoing.";
      if ((restoredDatePresent || restoredTimePresent) && !restored)
        return "Enter a real restoration-observed date and a 24-hour time in HH:MM format.";
      if (restored && restored.getTime() < started.getTime())
        return "The restoration-observed time cannot be earlier than the first-observed outage time.";
      if (restored && restored.getTime() > now.getTime())
        return "The restoration-observed time cannot be in the future.";
      if (values.stage === "Outage ongoing; facts still being observed" && restored)
        return "An ongoing record must leave restoration date and time blank. Change the stage if supply restoration was actually observed.";
      if (values.stage !== "Outage ongoing; facts still being observed" && !restored)
        return "A restoration or close-out stage requires the date and time when restoration was actually observed.";
      if (!nextReview) return "Enter a real next household review date in YYYY-MM-DD format.";
      const startedDay = strictIsoDate(values.startDate) as Date;
      if (nextReview.getTime() < startedDay.getTime())
        return "The next household review date cannot be earlier than the outage date.";
      if (restored && nextReview.getTime() < (strictIsoDate(values.restoredDate) as Date).getTime())
        return "The next household review date cannot be earlier than the restoration-observed date.";
      if (!values.source.trim()) return "Add the official source and event evidence used for this record.";
      if (!values.storage.trim()) return "Add a protected location where the event record can be found again.";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const observationRows = parseRows(values.observations);
      if (observationRows.length === 0) return "Add at least one system condition that was actually observed.";
      if (observationRows.length > 15) return "Use no more than 15 observation rows in one outage event; split a complex event by location or review stage.";
      const invalidObservations = observationRows.filter((row) => row.parts.length !== 7 || row.parts.some((part) => !part));
      if (invalidObservations.length)
        return `Observation line ${invalidObservations.map((row) => row.line).join(", ")} must contain all 7 pipe-separated fields.`;
      const statuses = new Set(["observed; monitoring", "official or qualified follow-up pending", "restored; recheck pending", "closed after recheck"]);
      const invalidStatuses = observationRows.filter((row) => !statuses.has(row.parts[6].toLocaleLowerCase("en")));
      if (invalidStatuses.length)
        return `Observation line ${invalidStatuses.map((row) => row.line).join(", ")} must end with Observed; monitoring, Official or qualified follow-up pending, Restored; recheck pending, or Closed after recheck.`;
      const ids = observationRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length)
        return "Every observation needs a unique ID so follow-up cannot attach to the wrong system.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Observation IDs must use 2–20 letters, numbers or hyphens, such as POWER-1.";
      const supportRows = parseRows(values.support);
      if (supportRows.length > 8) return "Use no more than 8 household-specific support rows in one event.";
      const invalidSupport = supportRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidSupport.length)
        return `Support line ${invalidSupport.map((row) => row.line).join(", ")} must contain all 4 pipe-separated fields.`;
      const unresolvedRows = observationRows.filter((row) => row.parts[6].toLocaleLowerCase("en") !== "closed after recheck");
      if (values.stage === "Household close-out review complete" && unresolvedRows.length)
        return `A close-out record cannot contain unresolved observations. Recheck or update: ${unresolvedRows.map((row) => row.parts[0]).join(", ")}.`;
      const actionRows = parseRows(values.actions);
      if (actionRows.length > 15) return "Use no more than 15 follow-up rows in one outage event.";
      const invalidActions = actionRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidActions.length)
        return `Follow-up line ${invalidActions.map((row) => row.line).join(", ")} must contain all 4 pipe-separated fields.`;
      const actionIds = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(actionIds).size !== actionIds.length)
        return "Each unresolved observation ID must have exactly one follow-up row.";
      const unresolvedIds = new Set(unresolvedRows.map((row) => row.parts[0].toLocaleUpperCase("en")));
      const missingActions = [...unresolvedIds].filter((id) => !actionIds.includes(id));
      if (missingActions.length)
        return `Add one follow-up row for every unresolved observation ID: ${missingActions.join(", ")}.`;
      const extraActions = actionIds.filter((id) => !unresolvedIds.has(id));
      if (extraActions.length)
        return `Follow-up rows may reference only unresolved observation IDs. Remove or update: ${extraActions.join(", ")}.`;
      const invalidDueDates = actionRows.filter((row) => {
        const due = strictIsoDate(row.parts[3]);
        return !due || due.getTime() < startedDay.getTime() || due.getTime() > nextReview.getTime();
      });
      if (invalidDueDates.length)
        return `Follow-up line ${invalidDueDates.map((row) => row.line).join(", ")} needs a real YYYY-MM-DD date on or after the outage date and no later than the next review.`;
      const privacyText = [values.source, values.observations, values.support, values.actions, values.storage].join("\n");
      if (/password|passcode|access code|alarm code|door code|utility account|account number|full address|bank account|social security|medical record|diagnosis|medication dose|dosage|device setting|government id|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, account identifier, address or unnecessary care detail was detected. Replace it with a protected-record pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const formatMoment = (value: Date) => `${formatter.format(value)}, ${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
      const displayStatuses = ["Observed; monitoring", "Official or qualified follow-up pending", "Restored; recheck pending", "Closed after recheck"];
      const statusCounts = displayStatuses.map((status) => ({
        status,
        count: observationRows.filter((row) => row.parts[6].toLocaleLowerCase("en") === status.toLocaleLowerCase("en")).length,
      })).filter((item) => item.count > 0);
      return `${values.household.trim()} — household power outage event log\nRecord stage: ${values.stage}\nObserved scope: ${values.scope}\nFirst observed: ${formatMoment(started)}\nRestoration observed: ${restored ? formatMoment(restored) : "Not yet recorded; no restoration prediction made"}\nNext household review: ${formatter.format(nextReview)}\nOfficial source / event evidence: ${values.source.trim()}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")} (workflow summary, not a safety or utility-performance score)\n\n${lines("Observed systems and conditions", observationRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — observed: ${row.parts[2]} — evidence: ${row.parts[3]} — action already taken: ${row.parts[4]} — owner/observer: ${row.parts[5]} — status: ${row.parts[6]}`))}\n\n${lines("Household-specific support references", supportRows.length ? supportRows.map((row) => `${row.parts[0]} — plan/instructions: ${row.parts[1]} — observed impact: ${row.parts[2]} — responsible role: ${row.parts[3]}`) : ["No separate support reference was recorded; confirm that this reflects the household rather than an omitted power-dependent need."])}\n\n${lines("Required follow-up", actionRows.length ? actionRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — owner: ${row.parts[2]} — due: ${formatter.format(strictIsoDate(row.parts[3]) as Date)}`) : ["All observation rows were closed only after recheck; preserve the supporting evidence with this record."])}\n\nProtected event-record location: ${values.storage.trim()}\n\nThis output records household observations and dated source checks. It does not establish the outage cause or exact utility duration, predict restoration, certify wiring or appliances, decide whether food, medicine or a power-dependent device is safe, or determine liability, compensation or insurance coverage. Do not approach or touch a fallen or exposed power line. In an active event, use the responsible utility, local authority, emergency services and qualified guidance for the actual location and condition.`;
    },
  },
  "household-water-leak-event-log": {
    intro:
      "Create a dated household record of visible water, evidence, notifications and owner-linked follow-up. The tool does not diagnose the source, confirm electrical safety, certify drying, price damage or decide responsibility or coverage.",
    fields: [
      text("household", "Household label", "Use a private nickname, not a full address, utility account or policy number.", "Maple household"),
      {
        name: "stage",
        label: "Record stage",
        type: "select",
        options: [
          "Active water or spread still observed",
          "No active water observed; assessment or repair open",
          "Drying, repair or recovery checks open",
          "Household close-out review complete",
        ],
      },
      {
        name: "scope",
        label: "Observed scope",
        type: "select",
        options: [
          "One fixture, appliance or visible connection",
          "One room or material area",
          "Multiple rooms or shared building area",
          "Scope not yet established",
        ],
      },
      { name: "startDate", label: "First observed date", type: "date" },
      text("startTime", "First observed time (24-hour HH:MM)", "Use the time actually observed. Mark an estimate in the evidence text.", "08:40"),
      { name: "stoppedDate", label: "Active water last observed stopped date (blank if ongoing)", type: "date" },
      text("stoppedTime", "Active water last observed stopped time (blank if ongoing)", "This is an observation, not proof that the hidden source was repaired. Enter both date and time or leave both blank.", ""),
      { name: "nextReview", label: "Next household review date", type: "date" },
      text("authority", "Responsible source and event evidence", "Name the building contact, utility, qualified provider or official guidance, check date and a safe protected-record pointer. Do not paste contact details or case numbers.", "Building contact notified and qualified provider requested 2026-08-23; protected reference LEAK-1"),
      {
        name: "observations",
        label: "Area and material observation rows",
        type: "textarea",
        help: "One line: ID | area or material | visible or measured condition | source/evidence | action already taken | owner/observer | Observed; monitoring, Qualified assessment pending, Drying or repair in progress, or Closed after recheck. Maximum 15 lines. Record facts, not a diagnosis.",
        value: "WATER-1 | Ceiling below bathroom | Damp patch visible; edge marked at first check | Dated photo index LEAK-1-A | Belongings moved from dry accessible area; provider requested | Household coordinator | Qualified assessment pending\nFLOOR-1 | Hall flooring | Surface dampness observed beside doorway | Dated photo index LEAK-1-B | Area kept clear; no electrical equipment touched | Safety observer | Observed; monitoring\nITEM-1 | Storage box group | Outer surfaces damp; contents not assessed here | Inventory IDs linked in protected event folder | Items photographed from safe dry position | Records owner | Drying or repair in progress",
      },
      {
        name: "notifications",
        label: "Notification and source-check rows",
        type: "textarea",
        help: "Optional. One line: responsible role or organization | verified channel description | date checked/notified YYYY-MM-DD | response or protected reference | household owner. Maximum 10 lines. Do not enter a full phone number, email, address, account, claim or policy number.",
        value: "Building manager | Contact channel verified in current resident notice | 2026-08-23 | Notice sent; protected message reference LEAK-1-N1 | Household coordinator\nQualified plumbing provider | Channel verified from current provider record | 2026-08-23 | Assessment requested; appointment evidence in protected folder | Repair owner",
      },
      {
        name: "actions",
        label: "Follow-up for every unresolved observation ID",
        type: "textarea",
        help: "One line: unresolved ID | next evidence-based action | owner or role | due date YYYY-MM-DD. Every row not Closed after recheck needs exactly one action. Due dates cannot be earlier than the event or later than the next review.",
        value: "WATER-1 | Preserve the qualified assessment and link any confirmed repair to this event without rewriting the original observation | Repair owner | 2026-08-24\nFLOOR-1 | Recheck the marked boundary from the same safe position and add a dated observation | Safety observer | 2026-08-23\nITEM-1 | Follow current qualified guidance for assessment and drying; record only completed work and evidence | Records owner | 2026-08-24",
      },
      text("storage", "Protected event-record location", "Use a folder or envelope label, not a password, address, account, claim or policy number.", "Household records / water events / LEAK-1"),
    ],
    run: (values) => {
      const started = localDateTime(values.startDate, values.startTime);
      const stoppedDatePresent = Boolean(values.stoppedDate.trim());
      const stoppedTimePresent = Boolean(values.stoppedTime.trim());
      const stopped = stoppedDatePresent && stoppedTimePresent
        ? localDateTime(values.stoppedDate, values.stoppedTime)
        : null;
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.household.trim()) return "Enter a household label so the exported event record can be identified.";
      if (!started) return "Enter a real first-observed date and a 24-hour time in HH:MM format.";
      const now = new Date();
      if (started.getTime() > now.getTime())
        return "The first-observed water event time cannot be in the future.";
      if (stoppedDatePresent !== stoppedTimePresent)
        return "Enter both the date and time when active water was last observed stopped, or leave both blank while it remains active.";
      if ((stoppedDatePresent || stoppedTimePresent) && !stopped)
        return "Enter a real last-observed-stopped date and a 24-hour time in HH:MM format.";
      if (stopped && stopped.getTime() < started.getTime())
        return "The last-observed-stopped time cannot be earlier than the first observation.";
      if (stopped && stopped.getTime() > now.getTime())
        return "The last-observed-stopped time cannot be in the future.";
      if (values.stage === "Active water or spread still observed" && stopped)
        return "An active record must leave the last-observed-stopped date and time blank. Change the stage only after that observation exists.";
      if (values.stage !== "Active water or spread still observed" && !stopped)
        return "This stage requires the date and time when active water was last observed stopped. That timestamp does not prove the hidden source was repaired.";
      if (!nextReview) return "Enter a real next household review date in YYYY-MM-DD format.";
      const startedDay = strictIsoDate(values.startDate) as Date;
      if (nextReview.getTime() < startedDay.getTime())
        return "The next household review date cannot be earlier than the event date.";
      if (stopped && nextReview.getTime() < (strictIsoDate(values.stoppedDate) as Date).getTime())
        return "The next household review date cannot be earlier than the last-observed-stopped date.";
      if (!values.authority.trim()) return "Add the responsible source and event evidence used for this record.";
      if (!values.storage.trim()) return "Add a protected location where the event record can be found again.";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const observationRows = parseRows(values.observations);
      if (observationRows.length === 0) return "Add at least one area or material condition that was actually observed.";
      if (observationRows.length > 15) return "Use no more than 15 observation rows in one water event; split a complex event by location or review stage.";
      const invalidObservations = observationRows.filter((row) => row.parts.length !== 7 || row.parts.some((part) => !part));
      if (invalidObservations.length)
        return `Observation line ${invalidObservations.map((row) => row.line).join(", ")} must contain all 7 pipe-separated fields.`;
      const statuses = new Set(["observed; monitoring", "qualified assessment pending", "drying or repair in progress", "closed after recheck"]);
      const invalidStatuses = observationRows.filter((row) => !statuses.has(row.parts[6].toLocaleLowerCase("en")));
      if (invalidStatuses.length)
        return `Observation line ${invalidStatuses.map((row) => row.line).join(", ")} must end with Observed; monitoring, Qualified assessment pending, Drying or repair in progress, or Closed after recheck.`;
      const ids = observationRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length)
        return "Every observation needs a unique ID so follow-up cannot attach to the wrong area or material.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Observation IDs must use 2–20 letters, numbers or hyphens, such as WATER-1.";
      const notificationRows = parseRows(values.notifications);
      if (notificationRows.length > 10) return "Use no more than 10 notification rows in one event.";
      const invalidNotifications = notificationRows.filter((row) => row.parts.length !== 5 || row.parts.some((part) => !part));
      if (invalidNotifications.length)
        return `Notification line ${invalidNotifications.map((row) => row.line).join(", ")} must contain all 5 pipe-separated fields.`;
      const invalidNotificationDates = notificationRows.filter((row) => {
        const checked = strictIsoDate(row.parts[2]);
        return !checked || checked.getTime() < startedDay.getTime() || checked.getTime() > nextReview.getTime();
      });
      if (invalidNotificationDates.length)
        return `Notification line ${invalidNotificationDates.map((row) => row.line).join(", ")} needs a real YYYY-MM-DD date on or after the event date and no later than the next review.`;
      const unresolvedRows = observationRows.filter((row) => row.parts[6].toLocaleLowerCase("en") !== "closed after recheck");
      if (values.stage === "Household close-out review complete" && unresolvedRows.length)
        return `A close-out record cannot contain unresolved observations. Recheck or update: ${unresolvedRows.map((row) => row.parts[0]).join(", ")}.`;
      const actionRows = parseRows(values.actions);
      if (actionRows.length > 15) return "Use no more than 15 follow-up rows in one water event.";
      const invalidActions = actionRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidActions.length)
        return `Follow-up line ${invalidActions.map((row) => row.line).join(", ")} must contain all 4 pipe-separated fields.`;
      const actionIds = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(actionIds).size !== actionIds.length)
        return "Each unresolved observation ID must have exactly one follow-up row.";
      const unresolvedIds = new Set(unresolvedRows.map((row) => row.parts[0].toLocaleUpperCase("en")));
      const missingActions = [...unresolvedIds].filter((id) => !actionIds.includes(id));
      if (missingActions.length)
        return `Add one follow-up row for every unresolved observation ID: ${missingActions.join(", ")}.`;
      const extraActions = actionIds.filter((id) => !unresolvedIds.has(id));
      if (extraActions.length)
        return `Follow-up rows may reference only unresolved observation IDs. Remove or update: ${extraActions.join(", ")}.`;
      const invalidDueDates = actionRows.filter((row) => {
        const due = strictIsoDate(row.parts[3]);
        return !due || due.getTime() < startedDay.getTime() || due.getTime() > nextReview.getTime();
      });
      if (invalidDueDates.length)
        return `Follow-up line ${invalidDueDates.map((row) => row.line).join(", ")} needs a real YYYY-MM-DD date on or after the event date and no later than the next review.`;
      const privacyText = [values.authority, values.observations, values.notifications, values.actions, values.storage].join("\n");
      const contactPatternText = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(contactPatternText) || /(?:\d[\s().+-]*){7,}/.test(contactPatternText))
        return "A full phone number or email address may be present. Keep actual contact details in the protected source and use only a verified-channel description here.";
      if (/password|passcode|access code|alarm code|door code|utility account|account number|full address|policy number|claim number|bank account|social security|medical record|diagnosis|medication dose|dosage|government id|date of birth|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, account, address, claim, policy or unnecessary personal detail was detected. Replace it with a protected-record pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const formatMoment = (value: Date) => `${formatter.format(value)}, ${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
      const displayStatuses = ["Observed; monitoring", "Qualified assessment pending", "Drying or repair in progress", "Closed after recheck"];
      const statusCounts = displayStatuses.map((status) => ({
        status,
        count: observationRows.filter((row) => row.parts[6].toLocaleLowerCase("en") === status.toLocaleLowerCase("en")).length,
      })).filter((item) => item.count > 0);
      return `${values.household.trim()} — household water leak event log\nRecord stage: ${values.stage}\nObserved scope: ${values.scope}\nFirst observed: ${formatMoment(started)}\nActive water last observed stopped: ${stopped ? `${formatMoment(stopped)} (observation only; source repair not proven)` : "Not yet recorded; active water or spread remains under observation"}\nNext household review: ${formatter.format(nextReview)}\nResponsible source / event evidence: ${values.authority.trim()}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")} (workflow summary, not a damage or safety score)\n\n${lines("Observed areas and materials", observationRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — observed: ${row.parts[2]} — evidence: ${row.parts[3]} — action already taken: ${row.parts[4]} — owner/observer: ${row.parts[5]} — status: ${row.parts[6]}`))}\n\n${lines("Notifications and source checks", notificationRows.length ? notificationRows.map((row) => `${row.parts[0]} — channel: ${row.parts[1]} — checked/notified: ${formatter.format(strictIsoDate(row.parts[2]) as Date)} — response/reference: ${row.parts[3]} — household owner: ${row.parts[4]}`) : ["No notification row was recorded; confirm which building, utility, landlord, insurer or qualified provider source applies before sharing the record."])}\n\n${lines("Required follow-up", actionRows.length ? actionRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — owner: ${row.parts[2]} — due: ${formatter.format(strictIsoDate(row.parts[3]) as Date)}`) : ["All observation rows were closed only after recheck; preserve the supporting evidence with this record."])}\n\nProtected event-record location: ${values.storage.trim()}\n\nThis output records household observations, source checks and workflow. It does not diagnose where water originated, prove that a hidden leak stopped, confirm electrical or structural safety, certify mold prevention or drying, estimate damage, authorize repairs, or determine landlord, provider, insurance or legal responsibility. If water is near electricity, there is contaminated water, structural movement, fire, injury or another immediate hazard, stay clear and use the current local emergency, utility, building and qualified-professional instructions for the actual condition.`;
    },
  },
  "household-storm-readiness-review": {
    intro:
      "Create a dated storm-preparation review that links every household observation to a responsible source and every open task to one owner and due date. The tool does not fetch alerts, score risk, inspect a property or certify safety.",
    fields: [
      text("household", "Household label", "Use a private nickname, not a full address or account identifier.", "Maple household"),
      {
        name: "context",
        label: "Review context",
        type: "select",
        options: [
          "Routine seasonal planning review",
          "Official local update reviewed",
          "Pre-event household actions underway",
          "Post-event lessons incorporated",
        ],
      },
      { name: "reviewDate", label: "Review date", type: "date" },
      { name: "nextReview", label: "Next household review date", type: "date" },
      {
        name: "sources",
        label: "Authoritative source map",
        type: "textarea",
        help: "One line: ID | authority or responsible source | checked date YYYY-MM-DD | household purpose | offline access or evidence | owner. Maximum 10 lines. Use current sources for the home's actual location.",
        value: "SRC-1 | Official local weather service | 2026-08-23 | Warning, watch and forecast issue times | Official page saved on review date; alternate broadcast path checked | Source checker\nBLDG-1 | Current building resident notice | 2026-08-23 | Common-area and resident responsibilities | Dated notice stored in protected folder | Building liaison\nPLAN-1 | Household emergency plan | 2026-08-23 | Family roles, communication and protected support pointers | Current offline copy located by backup coordinator | Household coordinator",
      },
      {
        name: "tasks",
        label: "Household preparation observations",
        type: "textarea",
        help: "One line: ID | area or dependency | observable readiness fact | evidence | household owner | Physically checked for this review, Action or purchase open, Authority or building confirmation open, or Not applicable with recorded basis | source ID. Maximum 20 lines.",
        value: "EXT-1 | Movable balcony items | Chairs moved to the authorized indoor storage area | Dated photo index STORM-1-A | Household coordinator | Physically checked for this review | BLDG-1\nSUP-1 | Lighting and communication | Two flashlights powered on; correct spare batteries located; radio source checked | Dated inventory record STORM-1-B | Supply checker | Physically checked for this review | PLAN-1\nBLDG-2 | Lift and common-area plan | Current event-specific resident instruction not yet received | Request and response will be stored as BLDG-2-N1 | Building liaison | Authority or building confirmation open | BLDG-1",
      },
      {
        name: "actions",
        label: "Follow-up for every open task ID",
        type: "textarea",
        help: "One line: open task ID | next evidence-based action | owner | due date YYYY-MM-DD. Every Action or purchase open and Authority or building confirmation open row needs exactly one action.",
        value: "BLDG-2 | Obtain the current event-specific resident instruction and preserve its issue time without guessing how shared systems will operate | Building liaison | 2026-08-24",
      },
      text("storage", "Protected review-record location", "Use a folder or envelope label, not a password, full address, phone number, account, policy or medical detail.", "Household records / storm readiness / STORM-1"),
    ],
    run: (values) => {
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.household.trim()) return "Enter a household label so the exported review can be identified.";
      if (!reviewDate) return "Enter a real review date in YYYY-MM-DD format.";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The storm-readiness review date cannot be in the future.";
      if (!nextReview) return "Enter a real next household review date in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next household review cannot be earlier than this review.";
      if (!values.storage.trim()) return "Enter the protected location for the detailed review record.";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const sourceRows = parseRows(values.sources);
      if (sourceRows.length === 0) return "Add at least one current authoritative or responsible source.";
      if (sourceRows.length > 10) return "Use no more than 10 source rows in one storm-readiness review.";
      const invalidSources = sourceRows.filter((row) => row.parts.length !== 6 || row.parts.some((part) => !part));
      if (invalidSources.length)
        return `Source line ${invalidSources.map((row) => row.line).join(", ")} must contain all 6 pipe-separated fields.`;
      const sourceIds = sourceRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(sourceIds).size !== sourceIds.length) return "Each source must have a unique ID.";
      if (sourceIds.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Source IDs must use 2 to 20 letters, numbers or hyphens, such as SRC-1.";
      const invalidSourceDates = sourceRows.filter((row) => {
        const checked = strictIsoDate(row.parts[2]);
        return !checked || checked.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return `Source line ${invalidSourceDates.map((row) => row.line).join(", ")} needs a real checked date no later than the review date.`;
      const taskRows = parseRows(values.tasks);
      if (taskRows.length === 0) return "Add at least one household preparation observation.";
      if (taskRows.length > 20) return "Use no more than 20 task rows in one review; split a complex household by zone or dependency.";
      const invalidTasks = taskRows.filter((row) => row.parts.length !== 7 || row.parts.some((part) => !part));
      if (invalidTasks.length)
        return `Task line ${invalidTasks.map((row) => row.line).join(", ")} must contain all 7 pipe-separated fields.`;
      const statuses = new Set([
        "Physically checked for this review",
        "Action or purchase open",
        "Authority or building confirmation open",
        "Not applicable with recorded basis",
      ]);
      const invalidStatuses = taskRows.filter((row) => !statuses.has(row.parts[5]));
      if (invalidStatuses.length)
        return `Task line ${invalidStatuses.map((row) => row.line).join(", ")} has an unsupported status. Use one of the four labels shown in the field instructions.`;
      const taskIds = taskRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(taskIds).size !== taskIds.length) return "Each household preparation task must have a unique ID.";
      if (taskIds.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Task IDs must use 2 to 20 letters, numbers or hyphens, such as EXT-1.";
      const unknownSources = taskRows
        .filter((row) => !sourceIds.includes(row.parts[6].toLocaleUpperCase("en")))
        .map((row) => row.parts[0]);
      if (unknownSources.length)
        return `Every task must reference a source ID from the source map. Check: ${unknownSources.join(", ")}.`;
      const openRows = taskRows.filter((row) =>
        row.parts[5] === "Action or purchase open" || row.parts[5] === "Authority or building confirmation open",
      );
      const actionRows = parseRows(values.actions);
      if (actionRows.length > 20) return "Use no more than 20 follow-up rows in one review.";
      const invalidActions = actionRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidActions.length)
        return `Follow-up line ${invalidActions.map((row) => row.line).join(", ")} must contain all 4 pipe-separated fields.`;
      const actionIds = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(actionIds).size !== actionIds.length) return "Each open task ID must have exactly one follow-up row.";
      const openIds = new Set(openRows.map((row) => row.parts[0].toLocaleUpperCase("en")));
      const missingActions = [...openIds].filter((id) => !actionIds.includes(id));
      if (missingActions.length) return `Add one follow-up row for every open task ID: ${missingActions.join(", ")}.`;
      const extraActions = actionIds.filter((id) => !openIds.has(id));
      if (extraActions.length) return `Follow-up rows may reference only open task IDs. Remove or update: ${extraActions.join(", ")}.`;
      const invalidDueDates = actionRows.filter((row) => {
        const due = strictIsoDate(row.parts[3]);
        return !due || due.getTime() < reviewDate.getTime() || due.getTime() > nextReview.getTime();
      });
      if (invalidDueDates.length)
        return `Follow-up line ${invalidDueDates.map((row) => row.line).join(", ")} needs a real due date on or after the review and no later than the next review.`;
      const privacyText = [values.sources, values.tasks, values.actions, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number or email was detected. Use a verified-channel description and protected-record pointer instead.";
      if (/password|passcode|access code|alarm code|door code|full address|account number|policy number|claim number|bank account|social security|government id|diagnosis|medication|dosage|device setting|date of birth|exact shelter address|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, address, account, policy, claim or unnecessary personal or care detail was detected. Replace it with a protected-record pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusOrder = [
        "Physically checked for this review",
        "Action or purchase open",
        "Authority or building confirmation open",
        "Not applicable with recorded basis",
      ];
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: taskRows.filter((row) => row.parts[5] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.household.trim()} — household storm-readiness review\nReview context: ${values.context}\nReview completed: ${formatter.format(reviewDate)}\nNext household review: ${formatter.format(nextReview)}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")} (workflow summary only, not a risk score or safety certificate)\n\n${lines("Authoritative source map", sourceRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — checked ${formatter.format(strictIsoDate(row.parts[2]) as Date)} — purpose: ${row.parts[3]} — offline/evidence: ${row.parts[4]} — owner: ${row.parts[5]}`))}\n\n${lines("Household preparation observations", taskRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — observed: ${row.parts[2]} — evidence: ${row.parts[3]} — owner: ${row.parts[4]} — status: ${row.parts[5]} — source: ${row.parts[6]}`))}\n\n${lines("Required follow-up", actionRows.length ? actionRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — owner: ${row.parts[2]} — due: ${formatter.format(strictIsoDate(row.parts[3]) as Date)}`) : ["No open task remains in this review; refresh the sources and observations whenever official information or household conditions change."])}\n\nProtected review-record location: ${values.storage.trim()}\n\nThis output records a dated household workflow. It does not fetch or replace official alerts, forecast storm effects, certify a building, route, shelter, supply or device, approve electrical, gas, roof, tree or flood work, guarantee utility service, decide whether to stay or evacuate, or prove insurance, rental, legal or building compliance. Current instructions from responsible authorities and emergency services always take priority.`;
    },
  },
  "home-service-provider-verification-log": {
    intro:
      "Build a dated provider shortlist that ties identity, scope and open questions to the sources that actually support them. The tool does not search registries, validate credentials, compare prices, endorse providers or make a hiring decision.",
    fields: [
      text("household", "Household label", "Use a private nickname, not a full address, account or access detail.", "Maple household"),
      {
        name: "context",
        label: "Verification context",
        type: "select",
        options: [
          "Routine household provider-list refresh",
          "Active repair estimates under review",
          "Regulated or permission-sensitive work check",
          "Prior-provider record review",
        ],
      },
      { name: "reviewDate", label: "Verification review date", type: "date" },
      { name: "nextReview", label: "Next household review date", type: "date" },
      {
        name: "sources",
        label: "Verification source map",
        type: "textarea",
        help: "One line: ID | responsible source or issuer | checked date YYYY-MM-DD | exact verification question | observed result or protected evidence pointer | owner. Maximum 12 lines.",
        value: "REG-1 | Responsible official business registry | 2026-08-23 | Does the displayed business identity match the written estimate | Exact public name and partial identifier matched; snapshot REG-1 | Records owner\nQUOTE-1 | Provider written estimate version Q-1 | 2026-08-23 | What work, exclusions and change process are proposed | Dated estimate lists inspection, included labour, material assumptions and exclusions | Project owner\nBLDG-1 | Current building or property instruction | 2026-08-23 | Who can approve access and common-property work | Written response pending; request stored as BLDG-1 | Building liaison",
      },
      {
        name: "providers",
        label: "Provider verification rows",
        type: "textarea",
        help: "One line: ID | displayed provider label | requested service scope | source IDs separated by commas | written evidence summary | owner | Identity and relevant scope checked, Written scope or estimate comparison open, Credential, insurance or permission confirmation open, or Archived or not selected with recorded reason. Maximum 15 lines.",
        value: "PROV-1 | North Shore Home Service (public label) | Inspect the reported kitchen leak and provide written findings and scope | REG-1,QUOTE-1 | Estimate Q-1 states inspection, included labour, material assumptions and exclusions | Project owner | Identity and relevant scope checked\nPROV-2 | Cedar Building Repair (public label) | Assess whether the proposed repair affects common property | REG-1,BLDG-1 | Provider identity recorded; written building permission question remains open | Building liaison | Credential, insurance or permission confirmation open",
      },
      {
        name: "actions",
        label: "Follow-up for every open provider ID",
        type: "textarea",
        help: "One line: open provider ID | next evidence-based action | owner | due date YYYY-MM-DD. Every open scope/estimate or credential/insurance/permission row needs exactly one action.",
        value: "PROV-2 | Obtain the building's written decision about common-property scope and preserve the dated response before access is authorized | Building liaison | 2026-08-25",
      },
      text("storage", "Protected evidence location", "Use a folder or envelope label, not a phone, email, full address, identifier, payment detail, credential or signature.", "Household records / providers / REVIEW-1"),
    ],
    run: (values) => {
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.household.trim()) return "Enter a household label so the exported provider review can be identified.";
      if (!reviewDate) return "Enter a real verification review date in YYYY-MM-DD format.";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The verification review date cannot be in the future.";
      if (!nextReview) return "Enter a real next household review date in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next household review cannot be earlier than this verification review.";
      if (!values.storage.trim()) return "Enter the protected location for original source, estimate and contact evidence.";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const sourceRows = parseRows(values.sources);
      if (sourceRows.length === 0) return "Add at least one official, issuer or first-party verification source.";
      if (sourceRows.length > 12) return "Use no more than 12 source rows in one provider review.";
      const invalidSources = sourceRows.filter((row) => row.parts.length !== 6 || row.parts.some((part) => !part));
      if (invalidSources.length)
        return `Source line ${invalidSources.map((row) => row.line).join(", ")} must contain all 6 pipe-separated fields.`;
      const sourceIds = sourceRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(sourceIds).size !== sourceIds.length) return "Each verification source must have a unique ID.";
      if (sourceIds.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Source IDs must use 2 to 20 letters, numbers or hyphens, such as REG-1.";
      const invalidSourceDates = sourceRows.filter((row) => {
        const checked = strictIsoDate(row.parts[2]);
        return !checked || checked.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return `Source line ${invalidSourceDates.map((row) => row.line).join(", ")} needs a real checked date no later than the verification review.`;
      const providerRows = parseRows(values.providers);
      if (providerRows.length === 0) return "Add at least one provider row linked to a source.";
      if (providerRows.length > 15) return "Use no more than 15 provider rows in one review; split unrelated service needs.";
      const invalidProviders = providerRows.filter((row) => row.parts.length !== 7 || row.parts.some((part) => !part));
      if (invalidProviders.length)
        return `Provider line ${invalidProviders.map((row) => row.line).join(", ")} must contain all 7 pipe-separated fields.`;
      const statuses = new Set([
        "Identity and relevant scope checked",
        "Written scope or estimate comparison open",
        "Credential, insurance or permission confirmation open",
        "Archived or not selected with recorded reason",
      ]);
      const invalidStatuses = providerRows.filter((row) => !statuses.has(row.parts[6]));
      if (invalidStatuses.length)
        return `Provider line ${invalidStatuses.map((row) => row.line).join(", ")} has an unsupported status. Use one of the four labels shown in the field instructions.`;
      const providerIds = providerRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(providerIds).size !== providerIds.length) return "Each provider row must have a unique ID.";
      if (providerIds.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Provider IDs must use 2 to 20 letters, numbers or hyphens, such as PROV-1.";
      const unknownSources = providerRows.flatMap((row) =>
        row.parts[3].split(",").map((id) => id.trim().toLocaleUpperCase("en")).filter((id) => !sourceIds.includes(id)).map(() => row.parts[0]),
      );
      if (unknownSources.length)
        return `Every provider must reference only IDs from the source map. Check: ${[...new Set(unknownSources)].join(", ")}.`;
      const openRows = providerRows.filter((row) =>
        row.parts[6] === "Written scope or estimate comparison open" || row.parts[6] === "Credential, insurance or permission confirmation open",
      );
      const actionRows = parseRows(values.actions);
      if (actionRows.length > 15) return "Use no more than 15 follow-up rows in one provider review.";
      const invalidActions = actionRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidActions.length)
        return `Follow-up line ${invalidActions.map((row) => row.line).join(", ")} must contain all 4 pipe-separated fields.`;
      const actionIds = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(actionIds).size !== actionIds.length) return "Each open provider ID must have exactly one follow-up row.";
      const openIds = new Set(openRows.map((row) => row.parts[0].toLocaleUpperCase("en")));
      const missingActions = [...openIds].filter((id) => !actionIds.includes(id));
      if (missingActions.length) return `Add one follow-up row for every open provider ID: ${missingActions.join(", ")}.`;
      const extraActions = actionIds.filter((id) => !openIds.has(id));
      if (extraActions.length) return `Follow-up rows may reference only open provider IDs. Remove or update: ${extraActions.join(", ")}.`;
      const invalidDueDates = actionRows.filter((row) => {
        const due = strictIsoDate(row.parts[3]);
        return !due || due.getTime() < reviewDate.getTime() || due.getTime() > nextReview.getTime();
      });
      if (invalidDueDates.length)
        return `Follow-up line ${invalidDueDates.map((row) => row.line).join(", ")} needs a real due date on or after the review and no later than the next review.`;
      const privacyText = [values.sources, values.providers, values.actions, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number, email or complete numeric identifier was detected. Keep it in protected evidence and use a safe pointer here.";
      if (/password|passcode|access code|alarm code|door code|full address|account number|card number|bank account|routing number|social security|government id|personal licence number|personal license number|policy number|claim number|signature|date of birth|private reference contact|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, address, financial, identity, policy, signature or private reference detail was detected. Replace it with a protected-record pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusOrder = [
        "Identity and relevant scope checked",
        "Written scope or estimate comparison open",
        "Credential, insurance or permission confirmation open",
        "Archived or not selected with recorded reason",
      ];
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: providerRows.filter((row) => row.parts[6] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.household.trim()} — home service provider verification log\nVerification context: ${values.context}\nReview completed: ${formatter.format(reviewDate)}\nNext household review: ${formatter.format(nextReview)}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")} (workflow summary only, not a provider score or endorsement)\n\n${lines("Verification source map", sourceRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — checked ${formatter.format(strictIsoDate(row.parts[2]) as Date)} — question: ${row.parts[3]} — observed result/evidence: ${row.parts[4]} — owner: ${row.parts[5]}`))}\n\n${lines("Provider verification rows", providerRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — requested scope: ${row.parts[2]} — sources: ${row.parts[3]} — written evidence: ${row.parts[4]} — owner: ${row.parts[5]} — status: ${row.parts[6]}`))}\n\n${lines("Required follow-up", actionRows.length ? actionRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — owner: ${row.parts[2]} — due: ${formatter.format(strictIsoDate(row.parts[3]) as Date)}`) : ["No open provider row remains; recheck sources before relying on this record for another service need."])}\n\nProtected original-evidence location: ${values.storage.trim()}\n\nThis output is a dated household research record. It does not search or authenticate a provider, interpret registry or licence categories, confirm insurance, permits, inspection, landlord or building approval, compare price fairness, assess workmanship, authorize home access, endorse or rank a business, make a hiring decision, or prove contract, legal or regulatory compliance. Use current responsible sources for the actual location and scope.`;
    },
  },
  "home-repair-change-order-log": {
    intro:
      "Reconcile additions, deletions and substitutions against one preserved project baseline. The tool performs local arithmetic and workflow validation; it does not amend a contract, capture a signature, approve work or decide what is owed.",
    fields: [
      text("project", "Private project label", "Use a household nickname and work area, not a full address or private provider contact.", "Maple household kitchen repair"),
      {
        name: "context",
        label: "Record context",
        type: "select",
        options: [
          "Active project change review",
          "Before next progress payment",
          "Pre-close-out reconciliation",
          "Disputed or incomplete history preservation",
        ],
      },
      {
        name: "currency",
        label: "Currency label",
        type: "select",
        options: ["TWD", "USD", "CAD", "AUD", "GBP", "EUR", "Other currency"],
      },
      { name: "agreementDate", label: "Original agreement date", type: "date" },
      { name: "recordDate", label: "Change record date", type: "date" },
      { name: "nextReview", label: "Next household review date", type: "date" },
      text("baseline", "Original agreement evidence and scope", "Name the exact signed contract or accepted-estimate version, included work and important exclusions. Do not paste signatures or private contact details.", "Signed contract C-1; replace listed cabinet fronts; excludes electrical relocation and wall repair"),
      { name: "originalAmount", label: "Original agreed amount", type: "number", value: "120000" },
      { name: "originalDays", label: "Original planned duration in calendar days", type: "number", value: "20" },
      {
        name: "changes",
        label: "Versioned change rows",
        type: "textarea",
        help: "One line: ID | request date YYYY-MM-DD | requested by role | exact addition, deletion or substitution | reason or observed trigger | signed cost effect or pending | schedule effect days or pending | written decision or close-out evidence pointer | owner | Proposed—awaiting written scope, price or time, Approved in writing—not yet completed, Declined or withdrawn—with reason recorded, or Completed—close-out evidence linked. Maximum 15 lines.",
        value: "CHG-1 | 2026-08-23 | Household project owner | Substitute sink model A with model B including revised mounting hardware | Model A unavailable per supplier notice SUP-2 | 2500 | 2 | Written approval CHANGE-CHG-1 | Project owner | Approved in writing—not yet completed\nCHG-2 | 2026-08-23 | Contractor project lead | Add backing repair only where opened area shows damage | Observable condition PHOTO-7; written method and price not received | pending | pending | Proposal request CHANGE-CHG-2 | Project owner | Proposed—awaiting written scope, price or time",
      },
      {
        name: "actions",
        label: "Follow-up for every open change ID",
        type: "textarea",
        help: "One line: open change ID | next written or close-out evidence | owner | due date YYYY-MM-DD. Every proposed or approved-not-completed row needs exactly one action.",
        value: "CHG-1 | Complete a walkthrough of the changed sink scope and preserve dated close-out evidence | Project owner | 2026-08-28\nCHG-2 | Obtain an itemized written proposal showing method, cost and schedule effect before a decision | Project owner | 2026-08-26",
      },
      text("storage", "Protected original-document location", "Use a folder or envelope label, not an address, phone, email, signature, account, payment, identity, licence, policy or claim detail.", "Household records / repairs / PROJECT-C1"),
    ],
    run: (values) => {
      const agreementDate = strictIsoDate(values.agreementDate);
      const recordDate = strictIsoDate(values.recordDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.project.trim()) return "Enter a private project label so the exported change record can be identified.";
      if (!agreementDate) return "Enter a real original agreement date in YYYY-MM-DD format.";
      if (!recordDate) return "Enter a real change record date in YYYY-MM-DD format.";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (recordDate.getTime() > today.getTime()) return "The change record date cannot be in the future.";
      if (agreementDate.getTime() > recordDate.getTime()) return "The original agreement date cannot be later than the change record date.";
      if (!nextReview) return "Enter a real next household review date in YYYY-MM-DD format.";
      if (nextReview.getTime() < recordDate.getTime()) return "The next household review cannot be earlier than the change record date.";
      if (!values.baseline.trim()) return "Enter the exact original agreement evidence and scope baseline.";
      if (!values.storage.trim()) return "Enter the protected location for original agreements, approvals, invoices and close-out evidence.";
      const originalAmount = Number(values.originalAmount);
      const originalDays = Number(values.originalDays);
      if (!Number.isFinite(originalAmount) || originalAmount < 0 || originalAmount > 1_000_000_000_000)
        return "Enter an original agreed amount from 0 to 1,000,000,000,000 without currency symbols or separators.";
      if (!Number.isInteger(originalDays) || originalDays < 0 || originalDays > 3650)
        return "Enter an original planned duration from 0 to 3,650 whole calendar days.";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const changeRows = parseRows(values.changes);
      if (changeRows.length === 0) return "Add at least one versioned change row.";
      if (changeRows.length > 15) return "Use no more than 15 change rows in one project review; create another dated review if needed.";
      const invalidChanges = changeRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidChanges.length)
        return `Change line ${invalidChanges.map((row) => row.line).join(", ")} must contain all 10 pipe-separated fields.`;
      const changeIds = changeRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(changeIds).size !== changeIds.length) return "Each change row must have a unique ID.";
      if (changeIds.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Change IDs must use 2 to 20 letters, numbers or hyphens, such as CHG-1.";
      const invalidChangeDates = changeRows.filter((row) => {
        const requested = strictIsoDate(row.parts[1]);
        return !requested || requested.getTime() < agreementDate.getTime() || requested.getTime() > recordDate.getTime();
      });
      if (invalidChangeDates.length)
        return `Change line ${invalidChangeDates.map((row) => row.line).join(", ")} needs a real request date between the original agreement and this record.`;
      const statuses = new Set([
        "Proposed—awaiting written scope, price or time",
        "Approved in writing—not yet completed",
        "Declined or withdrawn—with reason recorded",
        "Completed—close-out evidence linked",
      ]);
      const invalidStatuses = changeRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `Change line ${invalidStatuses.map((row) => row.line).join(", ")} has an unsupported status. Use one of the four labels shown in the field instructions.`;
      const costPattern = /^(?:pending|-?(?:0|[1-9]\d*)(?:\.\d{1,2})?)$/i;
      const dayPattern = /^(?:pending|-?(?:0|[1-9]\d*))$/i;
      const invalidEffects = changeRows.filter((row) => {
        if (!costPattern.test(row.parts[5]) || !dayPattern.test(row.parts[6])) return true;
        const cost = row.parts[5].toLocaleLowerCase("en") === "pending" ? null : Number(row.parts[5]);
        const days = row.parts[6].toLocaleLowerCase("en") === "pending" ? null : Number(row.parts[6]);
        return (cost !== null && Math.abs(cost) > 1_000_000_000) || (days !== null && Math.abs(days) > 3650);
      });
      if (invalidEffects.length)
        return `Change line ${invalidEffects.map((row) => row.line).join(", ")} needs a cost effect up to two decimals and a whole-day effect; use a signed number, 0 or pending.`;
      const decidedRows = changeRows.filter((row) =>
        row.parts[9] === "Approved in writing—not yet completed" || row.parts[9] === "Completed—close-out evidence linked",
      );
      const unresolvedDecided = decidedRows.filter((row) =>
        row.parts[5].toLocaleLowerCase("en") === "pending" || row.parts[6].toLocaleLowerCase("en") === "pending" || /\b(?:pending|awaiting|none|n\/a)\b/i.test(row.parts[7]),
      );
      if (unresolvedDecided.length)
        return `Approved or completed change line ${unresolvedDecided.map((row) => row.line).join(", ")} needs numeric cost and time effects plus a specific written decision or close-out evidence pointer.`;
      const invalidDeclines = changeRows.filter((row) =>
        row.parts[9] === "Declined or withdrawn—with reason recorded" && (Number(row.parts[5]) !== 0 || Number(row.parts[6]) !== 0),
      );
      if (invalidDeclines.length)
        return `Declined or withdrawn change line ${invalidDeclines.map((row) => row.line).join(", ")} must use 0 cost and 0 days so it remains outside accepted totals.`;
      const openRows = changeRows.filter((row) =>
        row.parts[9] === "Proposed—awaiting written scope, price or time" || row.parts[9] === "Approved in writing—not yet completed",
      );
      const actionRows = parseRows(values.actions);
      if (actionRows.length > 15) return "Use no more than 15 follow-up rows in one project review.";
      const invalidActions = actionRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidActions.length)
        return `Follow-up line ${invalidActions.map((row) => row.line).join(", ")} must contain all 4 pipe-separated fields.`;
      const actionIds = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(actionIds).size !== actionIds.length) return "Each open change ID must have exactly one follow-up row.";
      const openIds = new Set(openRows.map((row) => row.parts[0].toLocaleUpperCase("en")));
      const missingActions = [...openIds].filter((id) => !actionIds.includes(id));
      if (missingActions.length) return `Add one follow-up row for every open change ID: ${missingActions.join(", ")}.`;
      const extraActions = actionIds.filter((id) => !openIds.has(id));
      if (extraActions.length) return `Follow-up rows may reference only proposed or approved-not-completed change IDs. Remove or update: ${extraActions.join(", ")}.`;
      const invalidDueDates = actionRows.filter((row) => {
        const due = strictIsoDate(row.parts[3]);
        return !due || due.getTime() < recordDate.getTime() || due.getTime() > nextReview.getTime();
      });
      if (invalidDueDates.length)
        return `Follow-up line ${invalidDueDates.map((row) => row.line).join(", ")} needs a real due date on or after this record and no later than the next review.`;
      const privacyText = [
        values.baseline,
        values.storage,
        ...changeRows.flatMap((row) => [row.parts[2], row.parts[3], row.parts[4], row.parts[7], row.parts[8]]),
        ...actionRows.flatMap((row) => [row.parts[1], row.parts[2]]),
      ].join("\n");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(privacyText) || /(?:\d[\s().+-]*){7,}/.test(privacyText))
        return "A possible full phone number, email or complete numeric identifier was detected. Keep it in protected evidence and use a safe pointer here.";
      if (/password|passcode|access code|alarm code|door code|full address|account number|card number|bank account|routing number|social security|government id|personal licence number|personal license number|policy number|claim number|signature|date of birth|private contact|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, address, financial, identity, licence, policy, signature or private contact detail was detected. Replace it with a protected-record pointer.";
      const acceptedCost = decidedRows.reduce((sum, row) => sum + Number(row.parts[5]), 0);
      const acceptedDays = decidedRows.reduce((sum, row) => sum + Number(row.parts[6]), 0);
      const reconciledAmount = originalAmount + acceptedCost;
      const reconciledDays = originalDays + acceptedDays;
      if (reconciledAmount < 0 || reconciledDays < 0)
        return "Accepted changes cannot reduce the reconciled amount or planned duration below zero. Recheck the baseline and signed effects.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const numberFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
      const statusOrder = [
        "Proposed—awaiting written scope, price or time",
        "Approved in writing—not yet completed",
        "Declined or withdrawn—with reason recorded",
        "Completed—close-out evidence linked",
      ];
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: changeRows.filter((row) => row.parts[9] === status).length,
      })).filter((item) => item.count > 0);
      const pendingCount = changeRows.filter((row) =>
        row.parts[5].toLocaleLowerCase("en") === "pending" || row.parts[6].toLocaleLowerCase("en") === "pending",
      ).length;
      return `${values.project.trim()} — home repair change order log\nRecord context: ${values.context}\nOriginal agreement: ${formatter.format(agreementDate)}\nChange record reconciled: ${formatter.format(recordDate)}\nNext household review: ${formatter.format(nextReview)}\nCurrency: ${values.currency}\nOriginal amount: ${numberFormatter.format(originalAmount)}\nAccepted change effect: ${acceptedCost >= 0 ? "+" : ""}${numberFormatter.format(acceptedCost)}\nReconciled arithmetic amount: ${numberFormatter.format(reconciledAmount)}\nOriginal planned duration: ${originalDays} calendar days\nAccepted schedule effect: ${acceptedDays >= 0 ? "+" : ""}${acceptedDays} calendar days\nReconciled arithmetic duration: ${reconciledDays} calendar days\nPending proposed effects: ${pendingCount}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nOriginal agreement evidence and scope: ${values.baseline.trim()}\n\n${lines("Versioned change rows", changeRows.map((row) => `${row.parts[0]} — requested ${formatter.format(strictIsoDate(row.parts[1]) as Date)} by ${row.parts[2]} — change: ${row.parts[3]} — reason/trigger: ${row.parts[4]} — cost effect: ${row.parts[5]} ${values.currency} — schedule effect: ${row.parts[6]} days — evidence: ${row.parts[7]} — owner: ${row.parts[8]} — status: ${row.parts[9]}`))}\n\n${lines("Required follow-up", actionRows.length ? actionRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — owner: ${row.parts[2]} — due: ${formatter.format(strictIsoDate(row.parts[3]) as Date)}`) : ["No proposed or approved-not-completed change remains; reconcile final invoices and close-out evidence without deleting declined history."])}\n\nProtected original-document location: ${values.storage.trim()}\n\nThe totals above are arithmetic reconciliation only. This output does not create or amend a contract, verify identity, authority, consent, signature or delivery, determine whether a charge is valid, reasonable, due or covered, authorize work or payment, inspect workmanship or concealed conditions, approve permits or inspections, certify completion, acceptance, safety, warranty, insurance, tax, lien or legal compliance, extend any notice or deadline, or resolve a dispute. Preserve original documents and use current responsible sources for the actual location and project.`;
    },
  },
  "home-repair-punch-list": {
    intro:
      "Create a dated queue of narrow, visible project items and keep a reported correction separate from a household recheck. This tool does not inspect work, define a defect, certify completion or acceptance, authorize payment, start a warranty or replace a qualified source.",
    fields: [
      text("project", "Private project label", "Use a household nickname and work area, not a full address or private provider contact.", "Maple household kitchen renovation"),
      {
        name: "context",
        label: "Walkthrough context",
        type: "select",
        options: [
          "Pre-completion household walkthrough",
          "Review after provider completion notice",
          "Recheck after reported correction",
          "Incomplete or disputed history preservation",
        ],
      },
      { name: "baselineDate", label: "Controlling scope date", type: "date", value: "2026-08-01" },
      { name: "reviewDate", label: "Punch-list review date", type: "date", value: "2026-08-23" },
      { name: "nextReview", label: "Next household review date", type: "date", value: "2026-08-30" },
      text("baseline", "Controlling scope and change evidence", "Name the exact signed scope plus approved change IDs. Do not overwrite the baseline or paste signatures and private contacts.", "CONTRACT-C1 plus approved CHG-1 and CHG-3; excludes dining-room paint"),
      {
        name: "items",
        label: "Versioned punch-list rows",
        type: "textarea",
        help: "One line: ID | area or element | observable condition | controlling scope or change pointer | observation date YYYY-MM-DD | photo or document pointer | next evidence, correction or closure reason | responsible role | target or recheck date YYYY-MM-DD | Observed—written response pending, Correction planned—not rechecked, Provider reports corrected—recheck pending, Closed—dated recheck evidence linked, or Archived—not pursued, reason recorded. Maximum 15 lines.",
        value: "PL-1 | Kitchen east cabinet | Door contacts adjacent panel during full opening | CONTRACT-C1 section 4 and DRAWING-A3 | 2026-08-23 | PHOTO-18 | Recheck full door travel and preserve dated evidence after reported adjustment | Project owner | 2026-08-28 | Correction planned—not rechecked\nPL-2 | Hallway floor | Three tile edges showed visible height differences under fixed hallway light | CHG-3 and TILE-SCHEDULE-T2 | 2026-08-20 | PHOTO-22 and RECHECK-24 | Rechecked after reported correction; dated evidence linked | Project owner | 2026-08-23 | Closed—dated recheck evidence linked",
      },
      text("storage", "Protected original-evidence location", "Use a folder or envelope label, not an address, phone, email, signature, account, payment, identity, licence, policy or claim detail.", "Household records / renovation / PROJECT-C1 / punch list"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.project.trim()) return "Enter a private project label so the exported punch list can be identified.";
      if (!baselineDate) return "Enter a real controlling scope date in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real punch-list review date in YYYY-MM-DD format.";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The punch-list review date cannot be in the future.";
      if (baselineDate.getTime() > reviewDate.getTime()) return "The controlling scope date cannot be later than the punch-list review date.";
      if (!nextReview) return "Enter a real next household review date in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next household review cannot be earlier than this punch-list review.";
      if (!values.baseline.trim()) return "Enter the exact controlling agreement and approved-change evidence.";
      if (!values.storage.trim()) return "Enter the protected location for original scope, photos, responses, inspections and recheck evidence.";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const itemRows = parseRows(values.items);
      if (itemRows.length === 0) return "Add at least one punch-list row.";
      if (itemRows.length > 15) return "Use no more than 15 items in one punch-list review; create another dated version if needed.";
      const invalidRows = itemRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Punch-list line ${invalidRows.map((row) => row.line).join(", ")} must contain all 10 pipe-separated fields.`;
      const ids = itemRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Each punch-list item must have a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Punch-list IDs must use 2 to 20 letters, numbers or hyphens, such as PL-1.";
      const invalidObservationDates = itemRows.filter((row) => {
        const observed = strictIsoDate(row.parts[4]);
        return !observed || observed.getTime() < baselineDate.getTime() || observed.getTime() > reviewDate.getTime();
      });
      if (invalidObservationDates.length)
        return `Punch-list line ${invalidObservationDates.map((row) => row.line).join(", ")} needs a real observation date between the controlling scope and this review.`;
      const statusOrder = [
        "Observed—written response pending",
        "Correction planned—not rechecked",
        "Provider reports corrected—recheck pending",
        "Closed—dated recheck evidence linked",
        "Archived—not pursued, reason recorded",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = itemRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `Punch-list line ${invalidStatuses.map((row) => row.line).join(", ")} has an unsupported status. Use one of the five labels shown in the field instructions.`;
      const openStatuses = new Set(statusOrder.slice(0, 3));
      const openRows = itemRows.filter((row) => openStatuses.has(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open punch-list line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target or recheck date from this review through the next household review.`;
      const closedRows = itemRows.filter((row) => !openStatuses.has(row.parts[9]));
      const invalidClosedDates = closedRows.filter((row) => {
        const observed = strictIsoDate(row.parts[4]) as Date;
        const closed = strictIsoDate(row.parts[8]);
        return !closed || closed.getTime() < observed.getTime() || closed.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Closed or archived punch-list line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual recheck or archive date between its observation and this review.`;
      const vagueActions = itemRows.filter((row) =>
        row.parts[6].length < 12 || /^(?:done|fixed|ok|none|n\/a|check|follow up)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `Punch-list line ${vagueActions.map((row) => row.line).join(", ")} needs a specific next evidence, correction or preserved closure reason—not a generic completion word.`;
      const weakPointers = itemRows.filter((row) => row.parts[3].length < 4 || row.parts[5].length < 4);
      if (weakPointers.length)
        return `Punch-list line ${weakPointers.map((row) => row.line).join(", ")} needs specific controlling-scope and dated evidence pointers.`;
      const privacyText = [values.project, values.baseline, values.items, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number, email or complete numeric identifier was detected. Keep it in protected evidence and use a safe pointer here.";
      if (/password|passcode|access code|alarm code|door code|full address|account number|card number|bank account|routing number|social security|government id|personal licence number|personal license number|policy number|claim number|signature|date of birth|private contact|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, address, financial, identity, licence, policy, signature or private contact detail was detected. Replace it with a protected-record pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: itemRows.filter((row) => row.parts[9] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.project.trim()} — home repair punch list\nWalkthrough context: ${values.context}\nControlling scope date: ${formatter.format(baselineDate)}\nPunch-list review: ${formatter.format(reviewDate)}\nNext household review: ${formatter.format(nextReview)}\nOpen items: ${openRows.length}\nClosed or archived items: ${closedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nControlling scope and approved changes: ${values.baseline.trim()}\n\n${lines("Versioned punch-list items", itemRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — observed ${formatter.format(strictIsoDate(row.parts[4]) as Date)}: ${row.parts[2]} — controlling source: ${row.parts[3]} — evidence: ${row.parts[5]} — next evidence/correction/closure reason: ${row.parts[6]} — responsible role: ${row.parts[7]} — target/recheck/archive date: ${formatter.format(strictIsoDate(row.parts[8]) as Date)} — status: ${row.parts[9]}`))}\n\nProtected original-evidence location: ${values.storage.trim()}\n\nThis output is a private household observation and follow-up record. It does not inspect work or concealed conditions, diagnose cause, define a defect, verify products, permits or inspections, certify workmanship, completion, acceptance, safety, code or legal compliance, authorize work, payment or withholding, start or change a warranty, calculate or extend any deadline, waive a right, assign responsibility or resolve a dispute. Preserve original sources and use the contract, responsible authority and qualified professionals for the actual project.`;
    },
  },
  "home-repair-closeout-checklist": {
    intro:
      "Build a versioned manifest for final scope, changes, punch-list history, invoices, payments, permits, products, warranties and unresolved gaps. This tool does not certify completion, acceptance or document sufficiency, authorize payment, start a warranty or replace a responsible source.",
    fields: [
      text("project", "Private project label", "Use a household nickname and work area, not a full address or private provider contact.", "Maple household kitchen renovation"),
      {
        name: "context",
        label: "Close-out review context",
        type: "select",
        options: [
          "Household package review before final project meeting",
          "Review after provider completion notice",
          "Post-walkthrough archive reconciliation",
          "Incomplete or disputed history preservation",
        ],
      },
      { name: "baselineDate", label: "Original agreement date", type: "date", value: "2026-08-01" },
      { name: "reviewDate", label: "Close-out package review date", type: "date", value: "2026-08-23" },
      { name: "nextReview", label: "Next household document review", type: "date", value: "2026-08-30" },
      text("baseline", "Controlling scope and project-history evidence", "Name the agreement, approved changes and final scope reconciliation. Do not paste signatures or private contacts.", "CONTRACT-C1 plus approved CHG-1 and CHG-3; final scope reconciliation SCOPE-R1"),
      {
        name: "items",
        label: "Versioned close-out package rows",
        type: "textarea",
        help: "One line: ID | package category | exact expected record | controlling scope, change or punch pointer | issuer or responsible source role | evidence date YYYY-MM-DD or MISSING | protected file or request pointer | next evidence step or closure reason | owner role | target or filing date YYYY-MM-DD | Requested—awaiting source, Received—household review pending, Filed—source date and pointer linked, Not applicable—reason and source linked, or Unresolved gap—archive note linked. Maximum 18 lines.",
        value: "CO-1 | Final scope | Final scope reconciliation including approved CHG-1 and CHG-3 | CONTRACT-C1, CHG-1 and CHG-3 | Household project archive | 2026-08-23 | SCOPE-R1 | Cross-check final invoice and punch-list IDs against unchanged scope history | Household project owner | 2026-08-23 | Filed—source date and pointer linked\nCO-2 | Final invoice | Final invoice showing approved changes and CREDIT-2 | INVOICE-03, CHG-1, CHG-3 and CREDIT-2 | Provider billing role | MISSING | REQUEST-5 | Obtain the dated final invoice and preserve the original file before household review | Household project owner | 2026-08-29 | Requested—awaiting source\nCO-3 | Installed products | Product schedule, manuals and warranty terms for installed equipment | SCOPE-R1 and PRODUCT-SCHEDULE-P2 | Provider project close-out role | 2026-08-22 | PRODUCT-PACKAGE-2 | Check models, document pages and protected asset links before filing | Household asset owner | 2026-08-28 | Received—household review pending",
      },
      text("storage", "Protected original-document location", "Use a folder or envelope label, not an address, phone, email, signature, account, payment, identity, licence, policy or claim detail.", "Household records / renovation / PROJECT-C1 / close-out package"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.project.trim()) return "Enter a private project label so the exported close-out manifest can be identified.";
      if (!baselineDate) return "Enter a real original agreement date in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real close-out package review date in YYYY-MM-DD format.";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The close-out package review date cannot be in the future.";
      if (baselineDate.getTime() > reviewDate.getTime()) return "The original agreement date cannot be later than the close-out review.";
      if (!nextReview) return "Enter a real next household document review date in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next household document review cannot be earlier than this close-out review.";
      if (!values.baseline.trim()) return "Enter the controlling agreement, approved changes and final scope-reconciliation evidence.";
      if (!values.storage.trim()) return "Enter the protected location for original close-out documents and gap notes.";
      const itemRows = values.items.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (itemRows.length === 0) return "Add at least one expected close-out package row.";
      if (itemRows.length > 18) return "Use no more than 18 items in one close-out review; create another dated version if needed.";
      const invalidRows = itemRows.filter((row) => row.parts.length !== 11 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Close-out line ${invalidRows.map((row) => row.line).join(", ")} must contain all 11 pipe-separated fields.`;
      const ids = itemRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Each close-out package item must have a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Close-out IDs must use 2 to 20 letters, numbers or hyphens, such as CO-1.";
      const statusOrder = [
        "Requested—awaiting source",
        "Received—household review pending",
        "Filed—source date and pointer linked",
        "Not applicable—reason and source linked",
        "Unresolved gap—archive note linked",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = itemRows.filter((row) => !statuses.has(row.parts[10]));
      if (invalidStatuses.length)
        return `Close-out line ${invalidStatuses.map((row) => row.line).join(", ")} has an unsupported status. Use one of the five labels shown in the field instructions.`;
      const requestedRows = itemRows.filter((row) => row.parts[10] === statusOrder[0]);
      const receivedRows = itemRows.filter((row) => row.parts[10] === statusOrder[1]);
      const filedRows = itemRows.filter((row) => row.parts[10] === statusOrder[2]);
      const notApplicableRows = itemRows.filter((row) => row.parts[10] === statusOrder[3]);
      const unresolvedRows = itemRows.filter((row) => row.parts[10] === statusOrder[4]);
      const openRows = [...requestedRows, ...receivedRows];
      const closedRows = [...filedRows, ...notApplicableRows, ...unresolvedRows];
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[9]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open close-out line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next household document review.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const filed = strictIsoDate(row.parts[9]);
        return !filed || filed.getTime() < baselineDate.getTime() || filed.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Filed, not-applicable or unresolved line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual filing or archive-decision date between the agreement and this review.`;
      const rowsRequiringEvidenceDate = [...receivedRows, ...filedRows, ...notApplicableRows];
      const invalidEvidenceDates = rowsRequiringEvidenceDate.filter((row) => {
        const evidence = strictIsoDate(row.parts[5]);
        return !evidence || evidence.getTime() < baselineDate.getTime() || evidence.getTime() > reviewDate.getTime();
      });
      if (invalidEvidenceDates.length)
        return `Close-out line ${invalidEvidenceDates.map((row) => row.line).join(", ")} needs a real source or decision date between the agreement and this review.`;
      const shouldBeMissing = [...requestedRows, ...unresolvedRows].filter((row) => row.parts[5].toLocaleUpperCase("en") !== "MISSING");
      if (shouldBeMissing.length)
        return `Requested or unresolved line ${shouldBeMissing.map((row) => row.line).join(", ")} must use MISSING in the evidence-date field until the expected source exists.`;
      const missingPointers = itemRows.filter((row) => row.parts[3].length < 4 || row.parts[4].length < 4 || row.parts[6].length < 4 || row.parts[6].toLocaleUpperCase("en") === "MISSING");
      if (missingPointers.length)
        return `Close-out line ${missingPointers.map((row) => row.line).join(", ")} needs a controlling pointer, responsible source role and protected file, request or gap-note pointer.`;
      const vagueActions = itemRows.filter((row) =>
        row.parts[7].length < 12 || /^(?:done|complete|completed|ok|none|n\/a|filed|follow up)$/i.test(row.parts[7]),
      );
      if (vagueActions.length)
        return `Close-out line ${vagueActions.map((row) => row.line).join(", ")} needs a specific next evidence step or preserved closure reason—not a generic completion word.`;
      const privacyText = [values.project, values.baseline, values.items, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number, email or complete numeric identifier was detected. Keep it in protected evidence and use a safe pointer here.";
      if (/password|passcode|access code|alarm code|door code|full address|account number|card number|bank account|routing number|social security|government id|personal licence number|personal license number|policy number|claim number|signature|date of birth|private contact|taxpayer id|invoice login|payment credential|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, address, financial, identity, licence, policy, signature, tax or private contact detail was detected. Replace it with a protected-record pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: itemRows.filter((row) => row.parts[10] === status).length,
      })).filter((item) => item.count > 0);
      const dateOrMissing = (value: string) => value.toLocaleUpperCase("en") === "MISSING" ? "MISSING" : formatter.format(strictIsoDate(value) as Date);
      return `${values.project.trim()} — home repair close-out package manifest\nReview context: ${values.context}\nOriginal agreement: ${formatter.format(baselineDate)}\nPackage review: ${formatter.format(reviewDate)}\nNext household document review: ${formatter.format(nextReview)}\nOpen requests or reviews: ${openRows.length}\nFiled, not applicable or archived gaps: ${closedRows.length}\nUnresolved gaps: ${unresolvedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nControlling scope and project history: ${values.baseline.trim()}\n\n${lines("Versioned close-out package rows", itemRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — expected record: ${row.parts[2]} — controlling source: ${row.parts[3]} — issuer/responsible source: ${row.parts[4]} — evidence date: ${dateOrMissing(row.parts[5])} — protected file/request/gap pointer: ${row.parts[6]} — next evidence step/closure reason: ${row.parts[7]} — owner: ${row.parts[8]} — target/filing/archive date: ${formatter.format(strictIsoDate(row.parts[9]) as Date)} — status: ${row.parts[10]}`))}\n\nProtected original-document location: ${values.storage.trim()}\n\nThis output is a private household document manifest. It does not inspect work, verify document authenticity or legal sufficiency, certify workmanship, completion, acceptance, safety, code or legal compliance, determine permit or inspection applicability or outcome, authorize payment or withholding, prove delivery, release a claim or lien, start or change a warranty, classify tax treatment, calculate or extend any deadline, waive a right, assign responsibility or resolve a dispute. Preserve original sources and use the contract, responsible authority and qualified professionals for the actual project.`;
    },
  },
  "warranty-claim-evidence-log": {
    intro:
      "Build a dated product-warranty request timeline that separates household observations, sent messages, delivery evidence, provider responses, follow-up and outcomes. It does not diagnose a product, decide coverage or calculate legal deadlines.",
    fields: [
      text("asset", "Private product label", "Use a household asset label, not a full serial, address, account or private contact.", "Kitchen refrigerator ASSET-A1"),
      {
        name: "context",
        label: "Current claim-review context",
        type: "select",
        options: [
          "Preparing the first written warranty request",
          "Following up after a submitted request",
          "Reviewing service, replacement or refund evidence",
          "Preserving an unresolved or disputed history",
        ],
      },
      { name: "observedDate", label: "Problem first observed", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: "Timeline review date", type: "date", value: "2026-08-23" },
      { name: "nextReview", label: "Next household follow-up review", type: "date", value: "2026-08-30" },
      text("basis", "Controlling product, purchase and written-term sources", "Use protected pointers and identify the issuer and term version. Do not paste full identifiers or contacts.", "ASSET-A1; purchase proof PURCHASE-P1; manufacturer written terms TERMS-W2 retrieved 2026-08-20"),
      text("observation", "First household observation", "Describe visible, audible or measured conditions without claiming a technical diagnosis.", "Cooling alarm appeared and display temperature rose; no panels opened; current safety and recall sources checked separately"),
      {
        name: "events",
        label: "Versioned warranty-claim timeline events",
        type: "textarea",
        help: "One line: ID | event type | exact observation, request or response | actor or source role | event date YYYY-MM-DD | protected evidence pointer | next step or closure reason | owner role | target or closure date YYYY-MM-DD | Prepared—not sent, Sent—delivery evidence linked, Response received—source linked, Follow-up due—prior evidence linked, Closed—outcome evidence linked, or Handed off—complaint pointer linked. Maximum 16 lines.",
        value: "WR-1 | Initial written request | Reported cooling alarm and requested written confirmation of the claim process | Household asset owner | 2026-08-20 | REQUEST-R1 plus DELIVERY-R1 | Ask the warranty issuer to confirm the case-reference pointer and next inspection step in writing | Household asset owner | 2026-08-26 | Sent—delivery evidence linked\nWR-2 | Provider acknowledgement | Provider opened a service workflow and proposed an appointment; no coverage position stated | Warranty-provider support role | 2026-08-21 | RESPONSE-R1 and CASE-REF-1 | Compare the proposed appointment with TERMS-W2 and confirm the access window | Household asset owner | 2026-08-25 | Response received—source linked\nWR-3 | Follow-up checkpoint | Awaiting an attributed written outcome after the service visit | Household asset owner | 2026-08-23 | FOLLOWUP-NOTE-1 linked to RESPONSE-R1 | Send a dated follow-up citing CASE-REF-1 and ask for the written service and coverage outcome | Household asset owner | 2026-08-29 | Follow-up due—prior evidence linked",
      },
      text("storage", "Protected original-evidence location", "Use a folder label, not a full address, phone, email, serial, case number, credential, signature or payment detail.", "Household records / appliances / ASSET-A1 / warranty claim WR-2026-1"),
    ],
    run: (values) => {
      const observedDate = strictIsoDate(values.observedDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.asset.trim()) return "Enter a private product label so the exported warranty timeline can be identified.";
      if (!observedDate) return "Enter a real problem-first-observed date in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real timeline review date in YYYY-MM-DD format.";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The timeline review date cannot be in the future.";
      if (observedDate.getTime() > reviewDate.getTime()) return "The problem-first-observed date cannot be later than the review date.";
      if (!nextReview) return "Enter a real next household follow-up review date in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next household follow-up review cannot be earlier than this review.";
      if (!values.basis.trim()) return "Enter protected pointers for the exact product, purchase evidence and written warranty or service-contract terms.";
      if (!values.observation.trim()) return "Enter the first household observation without inventing a technical diagnosis.";
      if (!values.storage.trim()) return "Enter the protected location for original request, response and outcome evidence.";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "Add at least one warranty-claim timeline event.";
      if (eventRows.length > 16) return "Use no more than 16 events in one review; create another dated timeline version if needed.";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Warranty event line ${invalidRows.map((row) => row.line).join(", ")} must contain all 10 pipe-separated fields.`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Each warranty-claim timeline event must have a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Warranty event IDs must use 2 to 20 letters, numbers or hyphens, such as WR-1.";
      const statusOrder = [
        "Prepared—not sent",
        "Sent—delivery evidence linked",
        "Response received—source linked",
        "Follow-up due—prior evidence linked",
        "Closed—outcome evidence linked",
        "Handed off—complaint pointer linked",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `Warranty event line ${invalidStatuses.map((row) => row.line).join(", ")} has an unsupported status. Use one of the six labels shown in the field instructions.`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[4]);
        return !eventDate || eventDate.getTime() < observedDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `Warranty event line ${invalidEventDates.map((row) => row.line).join(", ")} needs a real event date from the first observation through this review.`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 4).includes(row.parts[9]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(4).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open warranty event line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next household follow-up review.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const closed = strictIsoDate(row.parts[8]);
        return !closed || closed.getTime() < observedDate.getTime() || closed.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Closed or handed-off warranty event line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual closure or handoff date from the first observation through this review.`;
      const missingSources = eventRows.filter((row) => row.parts[3].length < 4 || row.parts[5].length < 4 || row.parts[5].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `Warranty event line ${missingSources.map((row) => row.line).join(", ")} needs an actor or source role and a protected draft, delivery, response, outcome or complaint pointer.`;
      const vagueActions = eventRows.filter((row) =>
        row.parts[6].length < 12 || /^(?:done|complete|completed|fixed|resolved|ok|none|n\/a|follow up|closed)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `Warranty event line ${vagueActions.map((row) => row.line).join(", ")} needs a specific next evidence step or preserved closure reason—not a generic completion word.`;
      const privacyText = [values.asset, values.basis, values.observation, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number, email, serial, case or complete numeric identifier was detected. Keep it in protected evidence and use a safe pointer here.";
      if (/password|passcode|access code|alarm code|door code|full address|account number|card number|bank account|routing number|social security|government id|full serial|serial number|case number|claim number|policy number|signature|date of birth|private contact|payment credential|login credential|legal strategy|complaint form|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, address, financial, identity, full serial, case, policy, signature, complaint or private contact detail was detected. Replace it with a protected-record pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: eventRows.filter((row) => row.parts[9] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.asset.trim()} — warranty claim evidence timeline\nReview context: ${values.context}\nProblem first observed: ${formatter.format(observedDate)}\nTimeline review: ${formatter.format(reviewDate)}\nNext household follow-up review: ${formatter.format(nextReview)}\nOpen events: ${openRows.length}\nClosed or handed-off events: ${closedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nControlling product, purchase and written-term sources: ${values.basis.trim()}\nFirst household observation: ${values.observation.trim()}\n\n${lines("Versioned warranty-claim timeline", eventRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — observation/request/response: ${row.parts[2]} — actor/source: ${row.parts[3]} — event date: ${formatter.format(strictIsoDate(row.parts[4]) as Date)} — protected evidence: ${row.parts[5]} — next step/closure reason: ${row.parts[6]} — owner: ${row.parts[7]} — target/closure/handoff date: ${formatter.format(strictIsoDate(row.parts[8]) as Date)} — status: ${row.parts[9]}`))}\n\nProtected original-evidence location: ${values.storage.trim()}\n\nThis output is a private household evidence index. It does not diagnose a product, determine safety or recall status, verify evidence or delivery, decide warranty or service-contract coverage, authorize service, shipping, payment, replacement or refund, calculate a contractual or legal deadline, create a consumer complaint, assign fault or liability, waive a right or resolve a dispute. Follow current manufacturer and responsible product-safety instructions, preserve original sources and use the applicable issuer, authority or qualified adviser for actual decisions.`;
    },
  },
  "product-recall-action-log": {
    intro:
      "Create a dated record of an official product-safety notice, exact identity comparison, household actions, provider responses and remedy outcome. The tool does not search recalls, inspect a product or issue safety instructions.",
    fields: [
      text("asset", "Private product label", "Use a household asset label, not a full serial, order number, address, account or private contact.", "Countertop appliance ASSET-P7"),
      {
        name: "context",
        label: "Current recall-review context",
        type: "select",
        options: [
          "Authoritative notice received—identity check not finished",
          "Exact product identity comparison underway",
          "Official remedy or company response in progress",
          "Outcome, transfer or disposal evidence under review",
        ],
      },
      { name: "noticeDate", label: "Official notice publication or update date", type: "date", value: "2026-08-22" },
      { name: "reviewDate", label: "Household recall review date", type: "date", value: "2026-08-23" },
      { name: "nextReview", label: "Next household follow-up checkpoint", type: "date", value: "2026-08-30" },
      text("noticeSources", "Controlling authority and manufacturer notice sources", "Use public URLs or safe source IDs with version dates. Do not paste private case or contact details.", "CPSC notice NOTICE-N1 published 2026-08-22; manufacturer recall page MFR-N1 reviewed 2026-08-23"),
      text("identityBasis", "Protected product-identity comparison basis", "Point to the complete label, model, batch, date-code or serial-range comparison without exposing the full identifier.", "ASSET-P7/LABEL-2 compared with NOTICE-N1 scope; exact affected status not yet concluded"),
      {
        name: "actions",
        label: "Versioned recall action rows",
        type: "textarea",
        help: "One line: ID | action type | attributable instruction, comparison, request, response or outcome | actor or source role | action date YYYY-MM-DD | protected evidence pointer | next step or closure reason | owner role | target or outcome date YYYY-MM-DD | Notice captured—identity check pending, Identity comparison underway—source linked, Affected status confirmed—official source linked, Official remedy underway—evidence linked, Official remedy completed—outcome linked, Not affected—comparison source linked, or No longer held—transfer or disposal pointer linked. Maximum 16 lines.",
        value: "RC-1 | Authoritative notice capture | Preserved the notice scope, hazard section, current consumer action and remedy wording without changing the instruction | Responsible product-safety authority notice | 2026-08-22 | NOTICE-N1 | Follow the notice's immediate instruction and complete an exact protected identity comparison | Household asset owner | 2026-08-23 | Notice captured—identity check pending\nRC-2 | Protected identity comparison | Linked the product label record to the model, batch and date-code fields named by the notice; conclusion remains pending | Household asset owner using authority and manufacturer sources | 2026-08-23 | ASSET-P7-LABEL-2 plus NOTICE-N1 | Ask the manufacturer recall role to confirm the comparison through the official channel and preserve the response | Household asset owner | 2026-08-25 | Identity comparison underway—source linked",
      },
      text("storage", "Protected original-evidence location", "Use a folder label, not a full serial, address, phone, email, case, tracking, account, credential, signature or payment detail.", "Household records / product safety / ASSET-P7 / recall NOTICE-N1"),
    ],
    run: (values) => {
      const noticeDate = strictIsoDate(values.noticeDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.asset.trim()) return "Enter a private product label so the exported recall record can be identified.";
      if (!noticeDate) return "Enter the real publication or update date from the controlling notice in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real household recall review date in YYYY-MM-DD format.";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The household recall review date cannot be in the future.";
      if (noticeDate.getTime() > reviewDate.getTime()) return "The official notice date cannot be later than the household review date.";
      if (!nextReview) return "Enter a real next household follow-up checkpoint in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next household follow-up checkpoint cannot be earlier than this review.";
      if (values.noticeSources.trim().length < 12) return "Identify the controlling authority and manufacturer notice sources with safe IDs or public URLs and version dates.";
      if (values.identityBasis.trim().length < 12) return "Enter a protected product-identity comparison basis without exposing the complete identifier.";
      if (!values.storage.trim()) return "Enter the protected location for original notice, label, contact, remedy and outcome evidence.";
      const actionRows = values.actions.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (actionRows.length === 0) return "Add at least one recall action row.";
      if (actionRows.length > 16) return "Use no more than 16 recall actions in one review; create another dated version if needed.";
      const invalidRows = actionRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Recall action line ${invalidRows.map((row) => row.line).join(", ")} must contain all 10 pipe-separated fields.`;
      const ids = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Each recall action must have a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Recall action IDs must use 2 to 20 letters, numbers or hyphens, such as RC-1.";
      const statusOrder = [
        "Notice captured—identity check pending",
        "Identity comparison underway—source linked",
        "Affected status confirmed—official source linked",
        "Official remedy underway—evidence linked",
        "Official remedy completed—outcome linked",
        "Not affected—comparison source linked",
        "No longer held—transfer or disposal pointer linked",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = actionRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `Recall action line ${invalidStatuses.map((row) => row.line).join(", ")} has an unsupported status. Use one of the seven labels shown in the field instructions.`;
      const invalidActionDates = actionRows.filter((row) => {
        const actionDate = strictIsoDate(row.parts[4]);
        return !actionDate || actionDate.getTime() < noticeDate.getTime() || actionDate.getTime() > reviewDate.getTime();
      });
      if (invalidActionDates.length)
        return `Recall action line ${invalidActionDates.map((row) => row.line).join(", ")} needs a real action date from the notice date through this review.`;
      const openRows = actionRows.filter((row) => statusOrder.slice(0, 4).includes(row.parts[9]));
      const closedRows = actionRows.filter((row) => statusOrder.slice(4).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open recall action line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next household checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < noticeDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Completed, not-affected or no-longer-held line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual outcome, comparison or exit date from the notice date through this review.`;
      const missingSources = actionRows.filter((row) => row.parts[3].length < 4 || row.parts[5].length < 4 || row.parts[5].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `Recall action line ${missingSources.map((row) => row.line).join(", ")} needs an actor or source role and a protected notice, comparison, contact, delivery or outcome pointer.`;
      const vagueActions = actionRows.filter((row) =>
        row.parts[6].length < 12 || /^(?:done|complete|completed|fixed|resolved|safe|not affected|ok|none|n\/a|follow up|closed)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `Recall action line ${vagueActions.map((row) => row.line).join(", ")} needs a specific source-based next step or preserved closure reason—not a generic safety or completion word.`;
      const privacyText = [values.asset, values.noticeSources, values.identityBasis, values.actions, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number, email, serial, case, tracking or complete numeric identifier was detected. Keep it in protected evidence and use a safe pointer here.";
      if (/password|passcode|access code|alarm code|door code|full address|account number|card number|bank account|routing number|social security|government id|full serial|serial number|case number|claim number|tracking number|order number|policy number|signature|date of birth|private contact|payment credential|login credential|complaint form|medical record|child name|remote access|one-time code|verification code|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, address, financial, identity, full serial, case, tracking, order, signature, complaint, child or private contact detail was detected. Replace it with a protected-record pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: actionRows.filter((row) => row.parts[9] === status).length,
      })).filter((item) => item.count > 0);
      const confirmedAffected = actionRows.filter((row) => [statusOrder[2], statusOrder[3]].includes(row.parts[9])).length;
      return `${values.asset.trim()} — product recall action record\nReview context: ${values.context}\nOfficial notice publication or update: ${formatter.format(noticeDate)}\nHousehold recall review: ${formatter.format(reviewDate)}\nNext household checkpoint: ${formatter.format(nextReview)}\nOpen actions: ${openRows.length}\nCompleted, not affected or no longer held: ${closedRows.length}\nAffected-confirmed or remedy-underway rows: ${confirmedAffected}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nControlling authority and manufacturer notices: ${values.noticeSources.trim()}\nProtected product-identity comparison basis: ${values.identityBasis.trim()}\n\n${lines("Versioned recall actions", actionRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — attributable instruction/comparison/request/response/outcome: ${row.parts[2]} — actor/source: ${row.parts[3]} — action date: ${formatter.format(strictIsoDate(row.parts[4]) as Date)} — protected evidence: ${row.parts[5]} — next step/closure reason: ${row.parts[6]} — owner: ${row.parts[7]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[8]) as Date)} — status: ${row.parts[9]}`))}\n\nProtected original-evidence location: ${values.storage.trim()}\n\nThis output is a private household evidence index. It does not search current recalls, inspect a product, compare or validate identifiers, decide affected or safety status, create stop-use, unplugging, movement, repair, destruction, return, shipping or disposal instructions, verify a notice or remedy, contact a company or authority, submit an incident or remedy complaint, authorize a refund or replacement, calculate a deadline, assign responsibility or certify completion. Follow the current responsible authority and manufacturer notice immediately, use emergency or medical resources for urgent conditions and preserve original sources.`;
    },
  },
  "appliance-service-visit-log": {
    intro:
      "Create a dated appliance or home-system service visit record from the original request through provider evidence and household recheck. The tool does not diagnose equipment, verify a provider, approve work or judge safety, price or workmanship.",
    fields: [
      text("asset", "Private asset label", "Use a household asset label, not a full serial, address, account, case number or private contact.", "Laundry washer ASSET-A4"),
      {
        name: "context",
        label: "Current visit context",
        type: "select",
        options: [
          "Request and appointment preparation",
          "Provider identity, estimate or authorization review",
          "On-site finding, work or part documentation",
          "Completion, household recheck or handoff review",
        ],
      },
      { name: "requestDate", label: "Original service request date", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: "Current visit-record review date", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "Next household follow-up checkpoint", type: "date", value: "2026-08-31" },
      text("baseline", "Controlling request, provider, estimate and written-term sources", "Use safe source IDs or public URLs with dates. State the provider role the source actually supports and preserve fee or scope terms without private details.", "REQUEST-R1; independent repair provider source PROVIDER-P1; estimate QUOTE-Q1; written warranty TERMS-T1"),
      text("observation", "Starting household observation", "Describe visible or audible facts and what was not attempted. Do not diagnose or paste a full identifier, address or private contact.", "Cycle stopped during rinse and displayed E7; cabinet was not opened; original observation stored as OBS-O1"),
      {
        name: "events",
        label: "Versioned service visit event rows",
        type: "textarea",
        help: "One line: ID | event type | attributable observation, estimate, finding, authorization, work, part, invoice or outcome | actor or source role | event date YYYY-MM-DD | protected evidence pointer | next step or closure reason | owner role | target or outcome date YYYY-MM-DD | Scope/request recorded—visit pending, Provider/estimate recorded—authorization pending, Visit finding recorded—decision pending, Work authorized/in progress—scope linked, Work completed—household recheck pending, Closed—service evidence and household recheck linked, Deferred/declined—reason and source linked, or Handed off—warranty, recall or complaint pointer linked. Maximum 16 lines.",
        value: "SV-1 | Original service request | Requested inspection of the observed rinse-cycle interruption and an estimate before parts or added work | Household asset owner through provider booking source | 2026-08-20 | REQUEST-R1 plus delivery acknowledgement | Confirm provider role, disclosed visit fee and appointment scope before arrival | Household asset owner | 2026-08-24 | Scope/request recorded—visit pending\nSV-2 | Provider and estimate source | Preserved the independent provider identity source, stated diagnostic fee and estimate-before-parts condition | Independent repair business booking and estimate roles | 2026-08-22 | PROVIDER-P1 plus QUOTE-Q1 | Obtain an attributable visit finding before deciding whether to authorize work | Household asset owner | 2026-08-24 | Provider/estimate recorded—authorization pending",
      },
      text("storage", "Protected original-evidence location", "Use a folder label, not a full serial, address, phone, email, case, order, tracking, account, credential, signature, access or payment detail.", "Household records / appliances / ASSET-A4 / service visit SERVICE-S2"),
    ],
    run: (values) => {
      const requestDate = strictIsoDate(values.requestDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.asset.trim()) return "Enter a private asset label so the exported service visit record can be identified.";
      if (!requestDate) return "Enter the real original service request date in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real current visit-record review date in YYYY-MM-DD format.";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The current visit-record review date cannot be in the future.";
      if (requestDate.getTime() > reviewDate.getTime()) return "The original service request date cannot be later than the current review date.";
      if (!nextReview) return "Enter a real next household follow-up checkpoint in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next household follow-up checkpoint cannot be earlier than the current review.";
      if (values.baseline.trim().length < 12) return "Identify the controlling request, provider, estimate and written-term sources with safe pointers and dates.";
      if (values.observation.trim().length < 12) return "Describe the starting household observation without diagnosing the equipment or exposing private details.";
      if (!values.storage.trim()) return "Enter the protected location for original booking, provider, estimate, approval, service, part, invoice and recheck evidence.";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "Add at least one service visit event row.";
      if (eventRows.length > 16) return "Use no more than 16 service visit events in one review; create another dated version if needed.";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Service visit event line ${invalidRows.map((row) => row.line).join(", ")} must contain all 10 pipe-separated fields.`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Each service visit event must have a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Service visit event IDs must use 2 to 20 letters, numbers or hyphens, such as SV-1.";
      const statusOrder = [
        "Scope/request recorded—visit pending",
        "Provider/estimate recorded—authorization pending",
        "Visit finding recorded—decision pending",
        "Work authorized/in progress—scope linked",
        "Work completed—household recheck pending",
        "Closed—service evidence and household recheck linked",
        "Deferred/declined—reason and source linked",
        "Handed off—warranty, recall or complaint pointer linked",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `Service visit event line ${invalidStatuses.map((row) => row.line).join(", ")} has an unsupported status. Use one of the eight labels shown in the field instructions.`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[4]);
        return !eventDate || eventDate.getTime() < requestDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `Service visit event line ${invalidEventDates.map((row) => row.line).join(", ")} needs a real event date from the original request through this review.`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 5).includes(row.parts[9]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(5).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open service visit event line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next household checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < requestDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Closed, deferred or handed-off event line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual outcome date from the original request through this review.`;
      const missingSources = eventRows.filter((row) => row.parts[3].length < 4 || row.parts[5].length < 4 || row.parts[5].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `Service visit event line ${missingSources.map((row) => row.line).join(", ")} needs an actor or source role and a protected request, estimate, finding, authorization, service, invoice or outcome pointer.`;
      const vagueActions = eventRows.filter((row) =>
        row.parts[6].length < 12 || /^(?:done|complete|completed|fixed|resolved|safe|approved|ok|none|n\/a|follow up|closed)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `Service visit event line ${vagueActions.map((row) => row.line).join(", ")} needs a specific next evidence step or preserved closure reason—not a generic approval, safety or completion word.`;
      const privacyText = [values.asset, values.baseline, values.observation, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number, email, serial, case, order, tracking or complete numeric identifier was detected. Keep it in protected evidence and use a safe pointer here.";
      if (/password|passcode|access code|alarm code|door code|gate code|lockbox code|full address|account number|card number|bank account|routing number|social security|government id|full serial|serial number|case number|claim number|tracking number|order number|policy number|signature|date of birth|private contact|payment credential|login credential|complaint form|legal strategy|medical record|child name|remote access|one-time code|verification code|technician name|customer name|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, access, address, financial, identity, full serial, case, order, tracking, signature, complaint or private contact detail was detected. Replace it with a protected-record pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: eventRows.filter((row) => row.parts[9] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.asset.trim()} — appliance service visit record\nCurrent visit context: ${values.context}\nOriginal service request: ${formatter.format(requestDate)}\nCurrent record review: ${formatter.format(reviewDate)}\nNext household follow-up checkpoint: ${formatter.format(nextReview)}\nOpen events: ${openRows.length}\nClosed, deferred or handed-off events: ${closedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nControlling request, provider, estimate and written-term sources: ${values.baseline.trim()}\nStarting household observation: ${values.observation.trim()}\n\n${lines("Versioned service visit events", eventRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — attributable observation/estimate/finding/authorization/work/part/invoice/outcome: ${row.parts[2]} — actor/source: ${row.parts[3]} — event date: ${formatter.format(strictIsoDate(row.parts[4]) as Date)} — protected evidence: ${row.parts[5]} — next step/closure reason: ${row.parts[6]} — owner: ${row.parts[7]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[8]) as Date)} — status: ${row.parts[9]}`))}\n\nProtected original-evidence location: ${values.storage.trim()}\n\nThis output is a private household evidence index. It does not inspect or diagnose equipment, verify provider identity, authorization, licensing, insurance or arrival, judge an estimate, price, part, repair value, cause, workmanship, safety, code or legal compliance, authorize work, payment or access, test a product, decide warranty, recall, contract or complaint rights, calculate a deadline, assign responsibility, waive a right or certify completion. Follow current manufacturer and responsible authority safety instructions, use emergency or qualified help for urgent or hazardous conditions and preserve original sources.`;
    },
  },
  "appliance-repair-callback-log": {
    intro:
      "Link a recurring appliance symptom to an earlier completed service event, then record the callback request, provider response, follow-up work and household recheck. The tool does not diagnose, count legal repair attempts or decide warranty, refund or replacement rights.",
    fields: [
      text("asset", "Private asset label", "Use a household asset label, not a full serial, address, account, case number or private contact.", "Kitchen refrigerator ASSET-A2"),
      {
        name: "context",
        label: "Current callback context",
        type: "select",
        options: [
          "First recurrence observation and comparison",
          "Callback request or provider response review",
          "Follow-up visit, work or household recheck",
          "Warranty, seller or complaint handoff review",
        ],
      },
      { name: "priorCompletionDate", label: "Earlier provider-reported completion date", type: "date", value: "2026-08-10" },
      { name: "recurrenceDate", label: "First current recurrence observation date", type: "date", value: "2026-08-21" },
      { name: "reviewDate", label: "Current callback-record review date", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "Next household callback checkpoint", type: "date", value: "2026-08-31" },
      text("baseline", "Controlling earlier service, work, warranty and recheck sources", "Use safe source IDs or public URLs with dates. Preserve the earlier symptom, provider finding, authorized work, completion source and household recheck behind protected pointers.", "SERVICE-S2; WORKORDER-W3; provider completion COMPLETE-C1; household recheck RECHECK-R1; written warranty TERMS-T1"),
      text("observation", "Current recurrence household observation", "Describe visible, audible or displayed facts and what was not attempted. Do not decide the cause or paste a full identifier or private contact.", "Cooling again rose above the household baseline and E4 returned; no panel opened; observation stored as OBS-R2"),
      {
        name: "events",
        label: "Versioned repair callback event rows",
        type: "textarea",
        help: "One line: ID | event type | attributable recurrence observation, request, response, scope, work or outcome | actor or source role | event date YYYY-MM-DD | linked earlier service or callback ID | protected evidence pointer | next step or closure reason | owner role | target or outcome date YYYY-MM-DD | Recurrence observed—comparison pending, Callback requested—provider response pending, Provider response recorded—scope decision pending, Follow-up visit arranged—outcome pending, Follow-up work reported complete—household recheck pending, Closed—provider outcome and dated household recheck linked, Separated—different-issue source and new record linked, Handed off—warranty, seller or complaint pointer linked, or Deferred/declined—reason and source linked. Maximum 16 lines.",
        value: "CB-1 | Recurrence observation | Cooling again rose above the household baseline and E4 returned during ordinary use; no cause inferred | Household asset owner observation role | 2026-08-21 | SERVICE-S2 | OBS-R2 plus protected photo pointer | Compare the current observation with the earlier service source before requesting a remedy | Household asset owner | 2026-08-24 | Recurrence observed—comparison pending\nCB-2 | Callback request | Requested provider review of the dated recurrence and linked the earlier service without alleging a cause | Household asset owner through provider support channel | 2026-08-22 | CB-1 | CALLBACK-C1 plus delivery acknowledgement | Preserve the attributable provider response and any proposed follow-up scope | Household asset owner | 2026-08-24 | Callback requested—provider response pending",
      },
      text("storage", "Protected original-evidence location", "Use a folder label, not a full serial, address, phone, email, case, order, tracking, account, credential, signature, access, payment, complaint or legal detail.", "Household records / appliances / ASSET-A2 / callback CALLBACK-C1"),
    ],
    run: (values) => {
      const priorCompletionDate = strictIsoDate(values.priorCompletionDate);
      const recurrenceDate = strictIsoDate(values.recurrenceDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.asset.trim()) return "Enter a private asset label so the exported callback record can be identified.";
      if (!priorCompletionDate) return "Enter the real earlier provider-reported completion date in YYYY-MM-DD format.";
      if (!recurrenceDate) return "Enter the real first current recurrence observation date in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real current callback-record review date in YYYY-MM-DD format.";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The current callback-record review date cannot be in the future.";
      if (priorCompletionDate.getTime() > recurrenceDate.getTime()) return "The earlier provider-reported completion date cannot be later than the recurrence observation.";
      if (recurrenceDate.getTime() > reviewDate.getTime()) return "The recurrence observation date cannot be later than the current review.";
      if (!nextReview) return "Enter a real next household callback checkpoint in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next household callback checkpoint cannot be earlier than the current review.";
      if (values.baseline.trim().length < 16) return "Identify the controlling earlier service, work, warranty and household-recheck sources with safe pointers and dates.";
      if (values.observation.trim().length < 12) return "Describe the current recurrence observation without diagnosing the equipment or exposing private details.";
      if (!values.storage.trim()) return "Enter the protected location for original service, recurrence, callback, response, follow-up and outcome evidence.";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "Add at least one repair callback event row.";
      if (eventRows.length > 16) return "Use no more than 16 repair callback events in one review; create another dated version if needed.";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 11 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Repair callback event line ${invalidRows.map((row) => row.line).join(", ")} must contain all 11 pipe-separated fields.`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Each repair callback event must have a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Repair callback event IDs must use 2 to 20 letters, numbers or hyphens, such as CB-1.";
      const statusOrder = [
        "Recurrence observed—comparison pending",
        "Callback requested—provider response pending",
        "Provider response recorded—scope decision pending",
        "Follow-up visit arranged—outcome pending",
        "Follow-up work reported complete—household recheck pending",
        "Closed—provider outcome and dated household recheck linked",
        "Separated—different-issue source and new record linked",
        "Handed off—warranty, seller or complaint pointer linked",
        "Deferred/declined—reason and source linked",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[10]));
      if (invalidStatuses.length)
        return `Repair callback event line ${invalidStatuses.map((row) => row.line).join(", ")} has an unsupported status. Use one of the nine labels shown in the field instructions.`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[4]);
        return !eventDate || eventDate.getTime() < recurrenceDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `Repair callback event line ${invalidEventDates.map((row) => row.line).join(", ")} needs a real event date from the recurrence observation through this review.`;
      const invalidLinks = eventRows.filter((row) => {
        const link = row.parts[5].toLocaleUpperCase("en");
        return !/^[A-Z0-9][A-Z0-9-]{1,29}$/.test(link) || (!ids.includes(link) && !values.baseline.toLocaleUpperCase("en").includes(link));
      });
      if (invalidLinks.length)
        return `Repair callback event line ${invalidLinks.map((row) => row.line).join(", ")} must link a safe earlier service ID named in the controlling sources or another callback ID in this version.`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 5).includes(row.parts[10]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(5).includes(row.parts[10]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[9]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open repair callback event line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next household callback checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[9]);
        return !outcome || outcome.getTime() < recurrenceDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Closed, separated, handed-off or deferred event line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual outcome date from the recurrence observation through this review.`;
      const missingSources = eventRows.filter((row) => row.parts[3].length < 4 || row.parts[6].length < 4 || row.parts[6].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `Repair callback event line ${missingSources.map((row) => row.line).join(", ")} needs an actor or source role and a protected recurrence, request, response, visit, work or outcome pointer.`;
      const vagueActions = eventRows.filter((row) =>
        row.parts[7].length < 12 || /^(?:done|complete|completed|fixed|failed|resolved|safe|same issue|different issue|approved|ok|none|n\/a|follow up|closed)$/i.test(row.parts[7]),
      );
      if (vagueActions.length)
        return `Repair callback event line ${vagueActions.map((row) => row.line).join(", ")} needs a specific next evidence step or preserved closure reason—not a generic diagnosis, safety or completion word.`;
      const privacyText = [values.asset, values.baseline, values.observation, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number, email, serial, case, order, tracking or complete numeric identifier was detected. Keep it in protected evidence and use a safe pointer here.";
      if (/password|passcode|access code|alarm code|door code|gate code|lockbox code|full address|account number|card number|bank account|routing number|social security|government id|full serial|serial number|case number|claim number|tracking number|order number|policy number|signature|date of birth|private contact|payment credential|login credential|complaint form|complaint letter|legal strategy|medical record|child name|remote access|one-time code|verification code|technician name|customer name|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, access, address, financial, identity, full serial, case, complaint, legal or private contact detail was detected. Replace it with a protected-record pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: eventRows.filter((row) => row.parts[10] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.asset.trim()} — appliance repair callback record\nCurrent callback context: ${values.context}\nEarlier provider-reported completion: ${formatter.format(priorCompletionDate)}\nFirst current recurrence observation: ${formatter.format(recurrenceDate)}\nCurrent callback review: ${formatter.format(reviewDate)}\nNext household callback checkpoint: ${formatter.format(nextReview)}\nOpen callback events: ${openRows.length}\nClosed, separated, handed-off or deferred events: ${closedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nControlling earlier service, work, warranty and recheck sources: ${values.baseline.trim()}\nCurrent recurrence household observation: ${values.observation.trim()}\n\n${lines("Versioned repair callback events", eventRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — attributable recurrence observation/request/response/scope/work/outcome: ${row.parts[2]} — actor/source: ${row.parts[3]} — event date: ${formatter.format(strictIsoDate(row.parts[4]) as Date)} — linked earlier service/callback: ${row.parts[5]} — protected evidence: ${row.parts[6]} — next step/closure reason: ${row.parts[7]} — owner: ${row.parts[8]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[9]) as Date)} — status: ${row.parts[10]}`))}\n\nProtected original-evidence location: ${values.storage.trim()}\n\nThis output is a private household evidence index. It does not inspect or diagnose equipment, decide that an earlier repair failed, determine whether symptoms or defects are the same, verify a provider or delivery, count legal repair attempts, interpret a warranty or service contract, decide coverage, refund, replacement, damages, complaint or other rights, calculate a deadline, authorize follow-up work, payment or access, assign responsibility, recommend repair or replacement, contact a company or authority, submit a claim or complaint, waive a right or certify completion. Follow current manufacturer and responsible authority safety instructions, use emergency or qualified help for urgent conditions and preserve original sources.`;
    },
  },
  "appliance-purchase-installation-record": {
    intro:
      "Connect an appliance's acquisition, delivery, installation or first use, written warranty start basis and household recheck without exposing full serial or transaction details. The tool does not verify a seller or installer, interpret coverage or certify activation.",
    fields: [
      text("asset", "Private household asset ID", "Use a stable household ID, not a full serial, order, invoice, account, address or private contact.", "Laundry washer ASSET-A3"),
      text("model", "Brand and public model reference", "Record the public brand and model. Keep the complete serial or label photo behind a protected pointer.", "Example brand / model WM-420"),
      {
        name: "context",
        label: "Acquisition context",
        type: "select",
        options: [
          "Retail purchase with delivery or installation",
          "Online purchase with separate delivery",
          "Contractor-supplied installed equipment",
          "Used, gifted, transferred or pre-installed appliance",
        ],
      },
      { name: "acquisitionDate", label: "Purchase, contract or household-acquisition date", type: "date", value: "2026-08-10" },
      { name: "possessionDate", label: "Delivery or household-possession date", type: "date", value: "2026-08-18" },
      { name: "activationDate", label: "Installation or first-use date", type: "date", value: "2026-08-19" },
      { name: "reviewDate", label: "Current activation-record review date", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "Next household evidence checkpoint", type: "date", value: "2026-08-31" },
      text("basis", "Controlling purchase, delivery, installation, warranty and manual sources", "Use safe source IDs or public URLs with dates. State the written warranty start method exactly or mark it unresolved; do not paste full transaction or private identifiers.", "ORDER-O1; RECEIPT-R1; DELIVERY-D1; INSTALL-I1; WRITTEN-WARRANTY-W1 start method pending; MANUAL-M1; SERIAL-PHOTO-S1 protected"),
      {
        name: "events",
        label: "Versioned purchase and activation evidence rows",
        type: "textarea",
        help: "One line: ID | evidence stage | attributable product, purchase, delivery, installation, warranty or recheck fact | actor or source role | event date YYYY-MM-DD | protected evidence pointer | next gap or closure reason | owner role | target or outcome date YYYY-MM-DD | Purchase source recorded—delivery pending, Delivery received—condition and contents review pending, Installation arranged—installer outcome pending, Installation source recorded—household recheck pending, Warranty start basis pending—written terms needed, Active record—identity, receipt, warranty basis and household recheck linked, Limited archive—missing source named and ownership assigned, Transferred or gifted—origin and coverage uncertainty preserved, or Returned, cancelled or replaced—outcome source linked. Maximum 16 lines.",
        value: "BUY-1 | Purchase | Seller order identifies the washer model, included delivery and separately stated installation scope | Seller order source role | 2026-08-10 | ORDER-O1 and RECEIPT-R1 protected copies | Preserve delivery source and compare the delivered model without implying acceptance | Household asset owner | 2026-08-24 | Purchase source recorded—delivery pending\nDELIVERY-1 | Delivery | Carrier source shows possession and household observation links the visible model and included components; no installation conclusion | Carrier source and household observation roles | 2026-08-18 | DELIVERY-D1 and OBS-D1 protected pointers | Link installer outcome, written warranty start method and dated household first-use recheck | Household asset owner | 2026-08-31 | Delivery received—condition and contents review pending",
      },
      text("storage", "Protected original-evidence location", "Use a folder label, not a full serial, invoice, order, address, phone, email, account, card, credential, signature, access or complaint detail.", "Household records / appliances / ASSET-A3 / acquisition ACQ-1"),
    ],
    run: (values) => {
      const acquisitionDate = strictIsoDate(values.acquisitionDate);
      const possessionDate = strictIsoDate(values.possessionDate);
      const activationDate = strictIsoDate(values.activationDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.asset.trim()) return "Enter a private household asset ID so the exported activation record can be identified.";
      if (values.model.trim().length < 4) return "Enter the brand and public model reference, or state that the model remains unverified.";
      if (!acquisitionDate) return "Enter the real purchase, contract or household-acquisition date in YYYY-MM-DD format.";
      if (!possessionDate) return "Enter the real delivery or household-possession date in YYYY-MM-DD format.";
      if (!activationDate) return "Enter the real installation or first-use date in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real current activation-record review date in YYYY-MM-DD format.";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The current activation-record review date cannot be in the future.";
      if (acquisitionDate.getTime() > possessionDate.getTime()) return "The purchase, contract or household-acquisition date cannot be later than possession.";
      if (possessionDate.getTime() > activationDate.getTime()) return "The delivery or possession date cannot be later than installation or first use.";
      if (activationDate.getTime() > reviewDate.getTime()) return "The installation or first-use date cannot be later than the current review.";
      if (!nextReview) return "Enter a real next household evidence checkpoint in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next household evidence checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 16) return "Identify the controlling purchase, delivery, installation, written warranty, manual and protected product-identity sources with safe pointers.";
      if (!values.storage.trim()) return "Enter the protected location for original purchase, product-label, delivery, installation, warranty and recheck evidence.";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "Add at least one purchase or activation evidence event.";
      if (eventRows.length > 16) return "One review supports at most 16 purchase and activation events; create a later dated version for more.";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Purchase and activation event line ${invalidRows.map((row) => row.line).join(", ")} must contain all ten pipe-separated fields.`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Every purchase and activation event needs a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Use 2 to 20 letters, numbers or hyphens for each event ID, such as BUY-1.";
      const statusOrder = [
        "Purchase source recorded—delivery pending",
        "Delivery received—condition and contents review pending",
        "Installation arranged—installer outcome pending",
        "Installation source recorded—household recheck pending",
        "Warranty start basis pending—written terms needed",
        "Active record—identity, receipt, warranty basis and household recheck linked",
        "Limited archive—missing source named and ownership assigned",
        "Transferred or gifted—origin and coverage uncertainty preserved",
        "Returned, cancelled or replaced—outcome source linked",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `Purchase and activation event line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the nine evidence statuses in the field instructions.`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[4]);
        return !eventDate || eventDate.getTime() < acquisitionDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `Purchase and activation event line ${invalidEventDates.map((row) => row.line).join(", ")} needs a real event date from household acquisition through the current review.`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 5).includes(row.parts[9]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(5).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open purchase and activation event line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next household checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < acquisitionDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Active, limited, transferred or returned event line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual outcome date from acquisition through this review.`;
      const missingSources = eventRows.filter((row) => row.parts[3].length < 4 || row.parts[5].length < 4 || row.parts[5].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `Purchase and activation event line ${missingSources.map((row) => row.line).join(", ")} needs an actor or source role and a protected purchase, identity, delivery, installation, warranty or recheck pointer.`;
      const vagueActions = eventRows.filter((row) =>
        row.parts[6].length < 12 || /^(?:done|complete|completed|installed|delivered|accepted|safe|approved|active|ok|none|n\/a|follow up|closed)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `Purchase and activation event line ${vagueActions.map((row) => row.line).join(", ")} needs a specific evidence gap, next step or source-based closure reason—not a generic delivery, installation, safety or completion word.`;
      const privacyText = [values.asset, values.model, values.basis, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number, email, serial, invoice, order, case, tracking or complete numeric identifier was detected. Keep it in protected evidence and use a safe pointer here.";
      if (/password|passcode|access code|alarm code|door code|gate code|lockbox code|full address|account number|card number|bank account|routing number|social security|government id|full serial|serial number|invoice number|receipt number|order number|tracking number|case number|claim number|policy number|signature|date of birth|private contact|payment credential|login credential|complaint form|legal strategy|medical record|child name|remote access|one-time code|verification code|installer name|customer name|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, access, address, financial, identity, full serial, transaction, signature, complaint or private contact detail was detected. Replace it with a protected-record pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: eventRows.filter((row) => row.parts[9] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.asset.trim()} — appliance purchase and installation record\nProduct reference: ${values.model.trim()}\nAcquisition context: ${values.context}\nPurchase, contract or household acquisition: ${formatter.format(acquisitionDate)}\nDelivery or household possession: ${formatter.format(possessionDate)}\nInstallation or first use: ${formatter.format(activationDate)}\nCurrent record review: ${formatter.format(reviewDate)}\nNext household evidence checkpoint: ${formatter.format(nextReview)}\nOpen activation events: ${openRows.length}\nActive, limited, transferred or returned events: ${closedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nControlling purchase, delivery, installation, warranty and manual sources: ${values.basis.trim()}\n\n${lines("Versioned purchase and activation evidence", eventRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — attributable product/purchase/delivery/installation/warranty/recheck fact: ${row.parts[2]} — actor/source: ${row.parts[3]} — event date: ${formatter.format(strictIsoDate(row.parts[4]) as Date)} — protected evidence: ${row.parts[5]} — next gap/closure reason: ${row.parts[6]} — owner: ${row.parts[7]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[8]) as Date)} — status: ${row.parts[9]}`))}\n\nProtected original-evidence location: ${values.storage.trim()}\n\nThis output is a private household evidence index. It does not verify a product, seller, carrier, installer, identity, delivery, authorization, licensing, insurance, workmanship, settings, connections, permits, code compliance or safety; inspect equipment; interpret a warranty, service contract, return policy or law; select a warranty start date; calculate a deadline; register a product; compare a recall; submit a claim, complaint or payment; determine ownership, acceptance, coverage, refund or replacement; assign responsibility; waive a right; or certify activation. Follow current manufacturer and responsible-authority safety instructions, use emergency or qualified help for urgent conditions and preserve original sources.`;
    },
  },
  "purchase-delivery-evidence-log": {
    intro:
      "Build a private, versioned index from a household purchase source through shipment or pickup, actual possession, condition review, notice and return, refund or replacement outcome. The tool does not decide acceptance, fault, coverage or a legal deadline.",
    fields: [
      text("purchase", "Private household purchase ID", "Use a stable household ID, not a complete order, invoice, tracking, account, address or private contact.", "PURCHASE-P4"),
      text("item", "Public item reference", "Use a general product name or public model reference. Keep full identifiers and label photos behind protected pointers.", "Countertop mixer / public model MX-20"),
      {
        name: "channel",
        label: "Purchase channel",
        type: "select",
        options: [
          "Online retailer or brand store",
          "Online marketplace seller",
          "Mail or telephone order",
          "In-person retailer or pickup purchase",
          "Contractor-supplied or custom household item",
        ],
      },
      { name: "orderDate", label: "Transaction or order date", type: "date", value: "2026-08-20" },
      { name: "possessionDate", label: "Delivery or household-possession date (optional until received)", type: "date", value: "2026-08-22" },
      { name: "reviewDate", label: "Current purchase-record review date", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "Next household evidence checkpoint", type: "date", value: "2026-08-31" },
      text("basis", "Controlling offer, order, payment, fulfillment, policy, notice, response and outcome sources", "Use safe source IDs or public URLs with dates. Preserve the exact seller or platform policy version separately; do not paste full transaction or private identifiers.", "LISTING-L1; ORDER-O1; RECEIPT-R1; DELIVERY-D1; POLICY-P1; NOTICE-N1 if needed; RESPONSE-S1 if received"),
      {
        name: "events",
        label: "Versioned purchase and delivery evidence rows",
        type: "textarea",
        help: "One line: ID | evidence stage | attributable order, fulfillment, possession, condition, notice, response or outcome fact | actor or source role | event date YYYY-MM-DD | protected evidence pointer | next gap or closure reason | owner role | target or outcome date YYYY-MM-DD | one of the nine listed statuses. Maximum 16 lines.",
        value: "PURCHASE-1 | Transaction | Retailer order confirmation identifies the item, price and seller-stated fulfillment basis without proving shipment | Seller order source role | 2026-08-20 | ORDER-O1 and RECEIPT-R1 protected | Preserve shipment or pickup source and the exact policy version; do not claim possession | Household purchaser role | 2026-08-24 | Purchase source recorded—fulfillment pending\nDELIVERY-1 | Possession | Carrier source and household photo show one package received; item identity and contents remain under review | Carrier source and household observation roles | 2026-08-22 | DELIVERY-D1 and PHOTO-P1 protected | Compare visible item and included contents to the order source without unsafe testing | Household receiving role | 2026-08-31 | Possession recorded—condition and contents check pending",
      },
      text("storage", "Protected original-evidence location", "Use a folder label, not a complete order, invoice, tracking, case, address, phone, email, account, card, credential, signature, access or complaint detail.", "Household records / purchases / PURCHASE-P4 / evidence review 2026-08"),
    ],
    run: (values) => {
      const orderDate = strictIsoDate(values.orderDate);
      const possessionDate = strictIsoDate(values.possessionDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.purchase.trim()) return "Enter a private household purchase ID so the exported evidence log can be identified.";
      if (values.item.trim().length < 4) return "Enter a public item reference, or state that the item reference remains unverified.";
      if (!orderDate) return "Enter the real transaction or order date in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real current purchase-record review date in YYYY-MM-DD format.";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The current purchase-record review date cannot be in the future.";
      if (orderDate.getTime() > reviewDate.getTime()) return "The transaction or order date cannot be later than the current review.";
      if (possessionDate && possessionDate.getTime() < orderDate.getTime()) return "The delivery or household-possession date cannot be earlier than the transaction or order date.";
      if (possessionDate && possessionDate.getTime() > reviewDate.getTime()) return "The delivery or household-possession date cannot be later than the current review.";
      if (!nextReview) return "Enter a real next household evidence checkpoint in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next household evidence checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 16) return "Identify the controlling offer, order, payment, fulfillment, policy, notice, response and outcome sources with safe pointers.";
      if (!values.storage.trim()) return "Enter the protected location for original purchase, fulfillment, condition, communication and outcome evidence.";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "Add at least one purchase or delivery evidence event.";
      if (eventRows.length > 16) return "One review supports at most 16 purchase and delivery events; create a later dated version for more.";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Purchase and delivery event line ${invalidRows.map((row) => row.line).join(", ")} must contain all ten pipe-separated fields.`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Every purchase and delivery event needs a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Use 2 to 20 letters, numbers or hyphens for each event ID, such as DELIVERY-1.";
      const statusOrder = [
        "Purchase source recorded—fulfillment pending",
        "Shipment or pickup source recorded—possession pending",
        "Possession recorded—condition and contents check pending",
        "Issue observed—notice delivery pending",
        "Notice delivered—seller, platform or carrier response pending",
        "Remedy arranged—outcome pending",
        "Kept as delivered—dated household check linked",
        "Return, refund or replacement completed—outcome source linked",
        "Limited archive or external handoff—gap and ownership preserved",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `Purchase and delivery event line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the nine evidence statuses in the field instructions.`;
      const needsPossession = eventRows.filter((row) => statusOrder.slice(2, 8).includes(row.parts[9]));
      if (!possessionDate && needsPossession.length)
        return `Purchase and delivery event line ${needsPossession.map((row) => row.line).join(", ")} uses a possession, condition, notice, remedy or outcome status, so add the real household-possession date.`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[4]);
        return !eventDate || eventDate.getTime() < orderDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `Purchase and delivery event line ${invalidEventDates.map((row) => row.line).join(", ")} needs a real event date from the transaction through the current review.`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 6).includes(row.parts[9]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(6).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open purchase and delivery event line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next household checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < orderDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Kept, completed or handed-off event line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual outcome date from the transaction through this review.`;
      const missingSources = eventRows.filter((row) => row.parts[3].length < 4 || row.parts[5].length < 4 || row.parts[5].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `Purchase and delivery event line ${missingSources.map((row) => row.line).join(", ")} needs an actor or source role and a protected order, fulfillment, possession, condition, notice, response or outcome pointer.`;
      const vagueActions = eventRows.filter((row) =>
        row.parts[6].length < 12 || /^(?:done|complete|completed|delivered|accepted|safe|refund|refunded|replaced|approved|ok|none|n\/a|follow up|closed)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `Purchase and delivery event line ${vagueActions.map((row) => row.line).join(", ")} needs a specific next evidence step or source-based closure reason—not a generic delivery, acceptance, safety, refund or completion word.`;
      const privacyText = [values.purchase, values.item, values.basis, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number, email, serial, invoice, order, case, tracking or complete numeric identifier was detected. Keep it in protected evidence and use a safe pointer here.";
      if (/password|passcode|access code|alarm code|door code|gate code|lockbox code|full address|account number|card number|bank account|routing number|social security|government id|full serial|serial number|invoice number|receipt number|complete order|order number|tracking number|case number|claim number|policy number|signature|date of birth|private contact|payment credential|login credential|complaint form|complaint letter|legal strategy|medical record|child name|remote access|one-time code|verification code|buyer name|seller name|customer name|carrier recipient name|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, access, address, financial, identity, full serial, transaction, tracking, case, complaint, legal or private contact detail was detected. Replace it with a protected-record pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: eventRows.filter((row) => row.parts[9] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.purchase.trim()} — purchase and delivery evidence log\nItem reference: ${values.item.trim()}\nPurchase channel: ${values.channel}\nTransaction or order date: ${formatter.format(orderDate)}\nDelivery or household possession: ${possessionDate ? formatter.format(possessionDate) : "Not yet recorded"}\nCurrent purchase-record review: ${formatter.format(reviewDate)}\nNext household evidence checkpoint: ${formatter.format(nextReview)}\nOpen purchase and delivery events: ${openRows.length}\nKept, completed or handed-off events: ${closedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nControlling offer, order, payment, fulfillment, policy, notice, response and outcome sources: ${values.basis.trim()}\n\n${lines("Versioned purchase and delivery evidence", eventRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — attributable order/fulfillment/possession/condition/notice/response/outcome fact: ${row.parts[2]} — actor/source: ${row.parts[3]} — event date: ${formatter.format(strictIsoDate(row.parts[4]) as Date)} — protected evidence: ${row.parts[5]} — next gap/closure reason: ${row.parts[6]} — owner: ${row.parts[7]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[8]) as Date)} — status: ${row.parts[9]}`))}\n\nProtected original-evidence location: ${values.storage.trim()}\n\nThis output is a private household evidence index. It does not verify a seller, platform, carrier, item, package, shipment, pickup, possession, delivery, condition, contents, communication or outcome; inspect or test an item; determine fault, acceptance, fraud, ownership, coverage, return, refund, replacement, chargeback, complaint or other legal rights; interpret a policy, warranty, contract or law; calculate a seller, platform, carrier, card, warranty or legal deadline; contact a company or authority; submit a return, claim, dispute, chargeback, complaint or payment; provide an address, access or credential; assign responsibility; waive a right; or certify completion. Preserve original sources, follow current manufacturer and responsible-authority safety instructions and use qualified or emergency help for urgent conditions.`;
    },
  },
  "moving-box-handover-log": {
    intro:
      "Build a private, versioned index from household packing through loading custody, destination handover, box reconciliation, missing or visibly changed items, notice and actual outcome. It does not replace mover documents or decide liability, coverage or deadlines.",
    fields: [
      text("move", "Private household move ID", "Use a stable household ID, not a name, full address, shipment, contract, storage, vehicle or account number.", "MOVE-2026-A"),
      {
        name: "context",
        label: "Move context",
        type: "select",
        options: [
          "Interstate professional household-goods move",
          "Intrastate or local professional move",
          "Self-move or rental vehicle",
          "Portable container or storage transfer",
          "Family, friend or mixed handoff",
        ],
      },
      { name: "loadingDate", label: "Planned or actual loading date", type: "date", value: "2026-08-20" },
      { name: "handoverDate", label: "Destination handover date (optional until received)", type: "date", value: "2026-08-22" },
      { name: "reviewDate", label: "Current inventory review date", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "Next box reconciliation checkpoint", type: "date", value: "2026-08-31" },
      text("basis", "Controlling estimate, contract, mover inventory, custody, handover, notice and outcome sources", "Use safe source IDs or public URLs with dates. Keep full addresses, signatures, shipment identifiers and document contents protected.", "EST-E1; CONTRACT-C1; BOL-B1 if applicable; MOVER-INV-M1; LOAD-L1; HANDOVER-H1; NOTICE-N1 if needed"),
      {
        name: "events",
        label: "Versioned moving-box and handover rows",
        type: "textarea",
        help: "One line: ID | box or item group | attributable packing, loading, custody, handover, condition, notice or outcome fact | custodian or source role | event date YYYY-MM-DD | protected evidence pointer | next gap or closure reason | owner role | target or outcome date YYYY-MM-DD | one of the nine listed statuses. Maximum 18 lines.",
        value: "BOX-14 | Kitchen box group K-014 | Household packing photo links the sealed box ID and broad contents group without proving loading | Household packing source role | 2026-08-20 | BOX-PHOTO-P14 protected | Compare the ID to the controlling loading source; do not imply custodian acceptance | Household loading lead role | 2026-08-24 | Packed and household-indexed—loading handoff pending\nHANDOFF-1 | Kitchen loading batch | Household destination count and handover photo show the batch present; individual box reconciliation remains open | Household destination observation role | 2026-08-22 | HANDOVER-H1 and PHOTO-P20 protected | Reconcile every box ID against destination zones and preserve exceptions | Household reconciliation lead role | 2026-08-31 | Destination handoff recorded—box reconciliation pending",
      },
      text("storage", "Protected original-evidence location", "Use a folder label, not a complete address, contract, shipment, claim, phone, email, account, credential, signature, access or valuable-item detail.", "Household records / moves / MOVE-2026-A / protected originals"),
    ],
    run: (values) => {
      const loadingDate = strictIsoDate(values.loadingDate);
      const handoverDate = strictIsoDate(values.handoverDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.move.trim()) return "Enter a private household move ID so the exported handover log can be identified.";
      if (!loadingDate) return "Enter the real planned or actual loading date in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real current inventory review date in YYYY-MM-DD format.";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The current inventory review date cannot be in the future.";
      if (loadingDate.getTime() > reviewDate.getTime()) return "The loading date cannot be later than the current inventory review.";
      if (handoverDate && handoverDate.getTime() < loadingDate.getTime()) return "The destination handover date cannot be earlier than loading.";
      if (handoverDate && handoverDate.getTime() > reviewDate.getTime()) return "The destination handover date cannot be later than the current inventory review.";
      if (!nextReview) return "Enter a real next box reconciliation checkpoint in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next box reconciliation checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 16) return "Identify the controlling estimate, contract, mover inventory, custody, handover, notice and outcome sources with safe pointers.";
      if (!values.storage.trim()) return "Enter the protected location for original moving, custody, condition, notice and outcome evidence.";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "Add at least one moving-box or handover event.";
      if (eventRows.length > 18) return "One review supports at most 18 moving-box events; create a later dated version for more.";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Moving-box event line ${invalidRows.map((row) => row.line).join(", ")} must contain all ten pipe-separated fields.`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Every moving-box event needs a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Use 2 to 20 letters, numbers or hyphens for each event ID, such as BOX-14.";
      const statusOrder = [
        "Packed and household-indexed—loading handoff pending",
        "Loaded or accepted by custodian—destination handoff pending",
        "Destination handoff recorded—box reconciliation pending",
        "Box or item missing—notice delivery pending",
        "Visible condition issue recorded—notice delivery pending",
        "Notice delivered—response or inspection pending",
        "Reconciled and unpacked—household outcome linked",
        "Loss or damage process completed—outcome source linked",
        "Limited archive or external handoff—gap and ownership preserved",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `Moving-box event line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the nine handover statuses in the field instructions.`;
      const needsHandover = eventRows.filter((row) => statusOrder.slice(2, 8).includes(row.parts[9]));
      if (!handoverDate && needsHandover.length)
        return `Moving-box event line ${needsHandover.map((row) => row.line).join(", ")} uses a destination, missing, condition, notice or completed-outcome status, so add the real destination handover date.`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[4]);
        return !eventDate || eventDate.getTime() < loadingDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `Moving-box event line ${invalidEventDates.map((row) => row.line).join(", ")} needs a real event date from loading through the current review.`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 6).includes(row.parts[9]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(6).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open moving-box event line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next reconciliation checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < loadingDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Reconciled, completed or handed-off event line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual outcome date from loading through this review.`;
      const missingSources = eventRows.filter((row) => row.parts[3].length < 4 || row.parts[5].length < 4 || row.parts[5].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `Moving-box event line ${missingSources.map((row) => row.line).join(", ")} needs a custodian or source role and a protected packing, loading, custody, handover, condition, notice or outcome pointer.`;
      const vagueActions = eventRows.filter((row) =>
        row.parts[6].length < 12 || /^(?:done|complete|completed|delivered|accepted|safe|lost|damaged|approved|paid|settled|ok|none|n\/a|follow up|closed)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `Moving-box event line ${vagueActions.map((row) => row.line).join(", ")} needs a specific evidence gap, next step or source-based closure reason—not a generic delivery, damage, acceptance or completion word.`;
      const privacyText = [values.move, values.basis, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number, email, address, serial, shipment, contract, claim or complete numeric identifier was detected. Keep it in protected evidence and use a safe pointer here.";
      if (/password|passcode|access code|alarm code|door code|gate code|lockbox code|full address|street address|origin address|destination address|account number|card number|bank account|routing number|social security|government id|driver license|license plate|full serial|serial number|shipment number|bill of lading number|contract number|claim number|case number|policy number|signature|date of birth|private contact|payment credential|login credential|complaint form|complaint letter|legal strategy|medical record|child name|valuable contents|mover name|driver name|customer name|resident name|remote access|one-time code|verification code|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, access, address, financial, identity, shipment, contract, signature, valuable-item, complaint, legal or private participant detail was detected. Replace it with a protected-record pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: eventRows.filter((row) => row.parts[9] === status).length })).filter((item) => item.count > 0);
      return `${values.move.trim()} — moving box handover log\nMove context: ${values.context}\nLoading date: ${formatter.format(loadingDate)}\nDestination handover: ${handoverDate ? formatter.format(handoverDate) : "Not yet recorded"}\nCurrent inventory review: ${formatter.format(reviewDate)}\nNext box reconciliation checkpoint: ${formatter.format(nextReview)}\nOpen moving-box events: ${openRows.length}\nReconciled, completed or handed-off events: ${closedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nControlling estimate, contract, mover inventory, custody, handover, notice and outcome sources: ${values.basis.trim()}\n\n${lines("Versioned moving-box and handover evidence", eventRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — attributable packing/loading/custody/handover/condition/notice/outcome fact: ${row.parts[2]} — custodian/source: ${row.parts[3]} — event date: ${formatter.format(strictIsoDate(row.parts[4]) as Date)} — protected evidence: ${row.parts[5]} — next gap/closure reason: ${row.parts[6]} — owner: ${row.parts[7]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[8]) as Date)} — status: ${row.parts[9]}`))}\n\nProtected original-evidence location: ${values.storage.trim()}\n\nThis output is a private household index. It does not replace or amend an estimate, contract, order for service, bill of lading, mover inventory, valuation selection, insurance source, declaration, delivery receipt, notice, complaint or claim; verify a mover, broker, license, vehicle, box, seal, item, packing, loading, custody, handover, condition, loss, damage, communication or outcome; determine ownership, acceptance, fault, liability, valuation, coverage, damages, waiver, claim or settlement; interpret law or calculate a deadline; contact anyone; submit or authorize a notice, claim, complaint, access or payment; or certify completion. Preserve originals and use the current contract, responsible authority, insurer, qualified professional or emergency service that applies.`;
    },
  },
  "storage-unit-access-inventory-log": {
    intro:
      "Create a private, versioned log for unit zones, placement, physical visits, relocation, removal, observable condition, notices and actual move-out outcomes. It does not verify a facility or decide contracts, insurance, liability or deadlines.",
    fields: [
      text("unit", "Private household storage reference", "Use a stable household ID, not a facility name, address, unit number, account, contract, access or lock identifier.", "STORE-2026-A"),
      {
        name: "context",
        label: "Storage context",
        type: "select",
        options: [
          "Commercial self-service storage",
          "Building or community storage locker",
          "Portable storage container",
          "Shared private outbuilding",
          "Other contract-controlled storage space",
        ],
      },
      { name: "baselineDate", label: "Occupancy or placement baseline date", type: "date", value: "2026-08-20" },
      { name: "visitDate", label: "Last physical visit date (optional until observed)", type: "date", value: "2026-08-22" },
      { name: "reviewDate", label: "Current storage-log review date", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "Next visit or inventory checkpoint", type: "date", value: "2026-08-31" },
      text("basis", "Controlling agreement, rate, rules, insurance, baseline, visit, notice and move-out sources", "Use safe source IDs or public URLs with dates. Keep complete documents, access details, account identifiers and valuable-property records protected.", "AGREE-A1; RATE-R2; RULES-F1; INS-S1; BASE-P1; VISIT-V1; NOTICE-N1 if needed; MOVEOUT-M1 if applicable"),
      {
        name: "events",
        label: "Versioned storage-zone, access and inventory rows",
        type: "textarea",
        help: "One line: ID | zone, box or item group | attributable placement, visit, transfer, condition, notice or outcome fact | observer or source role | event date YYYY-MM-DD | protected evidence pointer | next gap or closure reason | owner role | target or outcome date YYYY-MM-DD | one of the nine listed statuses. Maximum 18 lines.",
        value: "BASE-1 | Front shelf A and floor zone B | Household baseline photo links the visible zones and private box IDs without proving facility custody | Household storage reviewer role | 2026-08-20 | BASE-P1 protected | Compare every placed ID to the dated zone map and preserve unobserved areas | Household inventory owner role | 2026-08-24 | Baseline indexed—first placement reconciliation pending\nVISIT-1 | Front shelf A | Dated physical visit found BOX-D-07 label visible on shelf A; rear wrapped-furniture zone was not reviewed | Authorized household reviewer role | 2026-08-22 | VISIT-V1 protected | Reconcile the remaining zones without treating access alone as proof of contents | Household storage reviewer role | 2026-08-31 | Physical visit recorded—inventory update pending",
      },
      text("storage", "Protected original-evidence location", "Use a folder label, not a facility address, unit, account, agreement, policy, claim, access, payment, participant or valuable-item detail.", "Household records / storage / STORE-2026-A / protected originals"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const visitDate = strictIsoDate(values.visitDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.unit.trim()) return "Enter a private household storage reference so the exported log can be identified.";
      if (!baselineDate) return "Enter a real occupancy or placement baseline date in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real current storage-log review date in YYYY-MM-DD format.";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The current storage-log review date cannot be in the future.";
      if (baselineDate.getTime() > reviewDate.getTime()) return "The occupancy or placement baseline cannot be later than the current review.";
      if (visitDate && visitDate.getTime() < baselineDate.getTime()) return "The last physical visit cannot be earlier than the baseline.";
      if (visitDate && visitDate.getTime() > reviewDate.getTime()) return "The last physical visit cannot be later than the current review.";
      if (!nextReview) return "Enter a real next visit or inventory checkpoint in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next visit or inventory checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 16) return "Identify controlling agreement, rate, rules, insurance, baseline, visit, notice and move-out sources with safe pointers.";
      if (!values.storage.trim()) return "Enter the protected location for original storage, visit, condition, notice and outcome evidence.";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "Add at least one storage-zone, access or inventory event.";
      if (eventRows.length > 18) return "One review supports at most 18 storage events; create a later dated version for more.";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Storage event line ${invalidRows.map((row) => row.line).join(", ")} must contain all ten pipe-separated fields.`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Every storage event needs a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Use 2 to 20 letters, numbers or hyphens for each event ID, such as VISIT-1.";
      const statusOrder = [
        "Baseline indexed—first placement reconciliation pending",
        "Box or item placed—location/source reconciliation pending",
        "Physical visit recorded—inventory update pending",
        "Box or item removed—household destination confirmation pending",
        "Access or visible condition issue recorded—notice delivery pending",
        "Notice delivered—response or inspection pending",
        "Reviewed scope reconciled—next periodic review linked",
        "Move-out or transfer completed—final sources linked",
        "Limited archive or external handoff—gap and ownership preserved",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `Storage event line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the nine storage statuses in the field instructions.`;
      const visitStatuses = new Set([statusOrder[2], statusOrder[3], statusOrder[4], statusOrder[6], statusOrder[7]]);
      const needsVisit = eventRows.filter((row) => visitStatuses.has(row.parts[9]));
      if (!visitDate && needsVisit.length)
        return `Storage event line ${needsVisit.map((row) => row.line).join(", ")} uses a physical-visit, removal, visible-condition, reconciliation or completed move-out status, so add the real last physical visit date.`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[4]);
        return !eventDate || eventDate.getTime() < baselineDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `Storage event line ${invalidEventDates.map((row) => row.line).join(", ")} needs a real event date from the baseline through the current review.`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 6).includes(row.parts[9]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(6).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open storage event line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < baselineDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Reconciled, completed or handed-off storage event line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual outcome date from the baseline through this review.`;
      const missingSources = eventRows.filter((row) => row.parts[3].length < 4 || row.parts[5].length < 4 || row.parts[5].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `Storage event line ${missingSources.map((row) => row.line).join(", ")} needs an observer or source role and a protected placement, visit, condition, notice or outcome pointer.`;
      const vagueActions = eventRows.filter((row) =>
        row.parts[6].length < 12 || /^(?:done|complete|completed|visited|removed|empty|safe|secure|covered|insured|lost|damaged|approved|paid|settled|ok|none|n\/a|follow up|closed)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `Storage event line ${vagueActions.map((row) => row.line).join(", ")} needs a specific evidence gap, next step or source-based closure reason—not a generic access, safety, coverage or completion word.`;
      const privacyText = [values.unit, values.basis, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number, email, address, unit, account, agreement, policy, claim, serial or complete numeric identifier was detected. Keep it protected and use a safe pointer here.";
      if (/password|passcode|access code|alarm code|door code|gate code|lock combination|key number|full address|street address|facility address|business name|facility name|storage unit number|unit number|account number|card number|bank account|routing number|social security|government id|full serial|serial number|agreement number|contract number|claim number|case number|policy number|signature|date of birth|private contact|payment credential|login credential|complaint form|complaint letter|legal strategy|medical record|child name|valuable contents|valuable item details|owner name|employee name|customer name|resident name|remote access|one-time code|verification code|exact access route|exact unit location|\bssn\b|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, location, access, financial, identity, unit, contract, policy, valuable-property, complaint, legal or private participant detail was detected. Replace it with a protected-record pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: eventRows.filter((row) => row.parts[9] === status).length })).filter((item) => item.count > 0);
      return `${values.unit.trim()} — storage unit access and inventory log\nStorage context: ${values.context}\nOccupancy or placement baseline: ${formatter.format(baselineDate)}\nLast physical visit: ${visitDate ? formatter.format(visitDate) : "Not yet recorded"}\nCurrent storage-log review: ${formatter.format(reviewDate)}\nNext visit or inventory checkpoint: ${formatter.format(nextReview)}\nOpen storage events: ${openRows.length}\nReconciled, completed or handed-off events: ${closedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nControlling agreement, rate, rules, insurance, baseline, visit, notice and move-out sources: ${values.basis.trim()}\n\n${lines("Versioned storage-zone, access and inventory evidence", eventRows.map((row) => `${row.parts[0]} — ${row.parts[1]} — attributable placement/visit/transfer/condition/notice/outcome fact: ${row.parts[2]} — observer/source: ${row.parts[3]} — event date: ${formatter.format(strictIsoDate(row.parts[4]) as Date)} — protected evidence: ${row.parts[5]} — next gap/closure reason: ${row.parts[6]} — owner: ${row.parts[7]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[8]) as Date)} — status: ${row.parts[9]}`))}\n\nProtected original-evidence location: ${values.storage.trim()}\n\nThis output is a private household index. It does not replace or amend a rental agreement, rate or fee notice, facility rule, insurance policy, property inventory, ownership or value source, access record, move-out document, notice, complaint or claim; verify a facility, owner, registration, license, zoning, building or fire compliance, unit, size, lock, access, monitoring, security, environment, property, communication or outcome; inspect a site; determine custody, negligence, liability, coverage, value, damage, waiver, claim, complaint or legal rights; calculate a payment, rate, notice, lien, auction, termination, insurance, claim or legal deadline; contact anyone; submit or authorize access, notice, payment, disposal, complaint or claim; or certify a unit as safe, covered, reconciled or empty. Preserve originals and use the current agreement, facility, responsible authority, insurer, qualified professional or emergency service that applies.`;
    },
  },
  "household-record-retrieval-drill-log": {
    intro:
      "Record whether an authorized backup household role can follow the current binder index, locate a limited source, distinguish its version and preserve the intended audience boundary. This tool does not search files, validate backups or grant access.",
    fields: [
      text("drill", "Private household drill reference", "Use a stable household label, not a name, address, account, vulnerable person, valuable asset or exact document location.", "BINDER-DRILL-2026-A"),
      {
        name: "context",
        label: "Retrieval and handoff context",
        type: "select",
        options: [
          "Routine digital home binder review",
          "Temporary household handoff",
          "Move, device change or archive migration",
          "Limited emergency or offline-reference review",
          "New backup household records role",
        ],
      },
      { name: "baselineDate", label: "Binder baseline version date", type: "date", value: "2026-08-20" },
      { name: "exerciseDate", label: "First assignment or exercise date", type: "date", value: "2026-08-22" },
      { name: "reviewDate", label: "Current drill review date", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "Next correction or retest checkpoint", type: "date", value: "2026-08-31" },
      text("basis", "Controlling catalog, current-source, audience, access, backup and offline references", "Use safe IDs or dated public-source URLs. Keep documents, permissions, credentials, backup contents and sensitive audience rules protected.", "CATALOG-C3; SOURCE-LIST-S2; AUDIENCE-A2; ACCESS-PROCESS-P1; BACKUP-VERIFY-B4; OFFLINE-O2"),
      {
        name: "events",
        label: "Versioned retrieval, disclosure and retest rows",
        type: "textarea",
        help: "One line: ID | requested record and purpose | authorized tester role | attempt or assignment date YYYY-MM-DD | indexed pointer and current-source reference | observed retrieval result | disclosure, access or version gap and correction/closure reason | owner role | target or outcome date YYYY-MM-DD | one of the eight listed statuses. Maximum 16 lines.",
        value: "DOC-1 | Current manufacturer manual for asset ASSET-A2 to support maintenance planning | Backup household records role | 2026-08-22 | CATALOG-C3 to MANUAL-M4; official manufacturer source captured 2026-08-20 | Located M4 through the shared index and left the protected receipt unopened | Confirm the issuer page remains current and preserve the receipt outside routine handoff | Household records owner role | 2026-08-31 | Source located—current-source review pending\nOFFLINE-1 | Minimized power-outage contact card for the household offline reference | Backup household coordinator role | 2026-08-22 | OFFLINE-O2 and AUDIENCE-A2 | Printed card was located from the agreed cabinet label and its review date was visible | Compare the limited audience and official-source pointer without adding full contact data | Household continuity owner role | 2026-08-31 | Alternate or offline route attempted—follow-up pending",
      },
      text("storage", "Protected originals, permissions and drill-evidence location", "Use a folder or process label, not a document, password, full address, account, identity, medical, financial, access or vulnerable-person detail.", "Household records / binder drills / BINDER-DRILL-2026-A / protected evidence"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const exerciseDate = strictIsoDate(values.exerciseDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.drill.trim()) return "Enter a private household drill reference so the exported record can be identified.";
      if (!baselineDate) return "Enter the real binder baseline version date in YYYY-MM-DD format.";
      if (!exerciseDate) return "Enter the real first assignment or exercise date in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real current drill review date in YYYY-MM-DD format.";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The current drill review date cannot be in the future.";
      if (baselineDate.getTime() > exerciseDate.getTime()) return "The binder baseline version date cannot be later than the first assignment or exercise date.";
      if (exerciseDate.getTime() > reviewDate.getTime()) return "The first assignment or exercise date cannot be later than the current drill review date.";
      if (!nextReview) return "Enter a real next correction or retest checkpoint in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next correction or retest checkpoint cannot be earlier than the current drill review date.";
      if (values.basis.trim().length < 12) return "Identify the controlling catalog, current-source, audience, access, backup and offline references with safe pointers.";
      if (!values.storage.trim()) return "Enter the protected location for originals, permissions and drill evidence.";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "Add at least one retrieval prompt or observed attempt.";
      if (eventRows.length > 16) return "One drill version supports at most 16 rows; freeze this scope and create a later dated version for more.";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Retrieval drill line ${invalidRows.map((row) => row.line).join(", ")} must contain all ten pipe-separated fields.`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Every retrieval or retest row needs a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Use 2 to 20 letters, numbers or hyphens for each row ID, such as DOC-1 or RETEST-1.";
      const statusOrder = [
        "Prompt assigned—retrieval attempt pending",
        "Attempt recorded—indexed pointer not resolved",
        "Source located—current-source review pending",
        "Source located—minimum-disclosure review pending",
        "Alternate or offline route attempted—follow-up pending",
        "Gap corrected—retest pending",
        "Retest passed—current source and audience scope linked",
        "Limited archive or external handoff—gap and owner preserved",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `Retrieval drill line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the eight evidence statuses in the field instructions.`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[3]);
        return !eventDate || eventDate.getTime() < exerciseDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `Retrieval drill line ${invalidEventDates.map((row) => row.line).join(", ")} needs a real assignment or attempt date from the first exercise through the current review.`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 6).includes(row.parts[9]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(6).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open retrieval drill line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next correction or retest checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < exerciseDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Passed, archived or handed-off drill line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual outcome date from the first exercise through this review.`;
      const missingEvidence = eventRows.filter((row) => row.parts[2].length < 4 || row.parts[4].length < 8 || row.parts[5].length < 8);
      if (missingEvidence.length)
        return `Retrieval drill line ${missingEvidence.map((row) => row.line).join(", ")} needs an authorized tester role, safe indexed/current-source pointer and attributable observed result.`;
      const passedWithoutProof = eventRows.filter((row) => row.parts[9] === statusOrder[6] && !/retest/i.test(`${row.parts[1]} ${row.parts[5]} ${row.parts[6]}`));
      if (passedWithoutProof.length)
        return `Passed drill line ${passedWithoutProof.map((row) => row.line).join(", ")} must describe the separate observed retest rather than only the original attempt or correction.`;
      const passedWithoutSourceOrScope = eventRows.filter((row) => row.parts[9] === statusOrder[6] && (!/(?:current|issuer|official|controlling)\s+(?:source|version)|source\s+(?:current|version)|version\s+(?:current|checked)/i.test(`${row.parts[4]} ${row.parts[5]} ${row.parts[6]}`) || !/(?:audience|scope|minimum disclosure|withheld|not opened|not copied)/i.test(`${row.parts[4]} ${row.parts[5]} ${row.parts[6]}`)));
      if (passedWithoutSourceOrScope.length)
        return `Passed drill line ${passedWithoutSourceOrScope.map((row) => row.line).join(", ")} must link the current or controlling source and the tested audience or minimum-disclosure scope.`;
      const vagueActions = eventRows.filter((row) => row.parts[6].length < 10 || /^(?:done|fixed|safe|complete|accessible|verified|ready|passed|found|current|shared|no issue|none|n\/a|ok)$/i.test(row.parts[6]));
      if (vagueActions.length)
        return `Retrieval drill line ${vagueActions.map((row) => row.line).join(", ")} needs a specific disclosure, access or version gap and a source-based correction or closure reason—not a generic pass word.`;
      const privacyText = [values.drill, values.basis, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number, email, address, account, policy, claim, serial, identity or complete numeric identifier was detected. Keep it protected and use a safe pointer here.";
      if (/password|passphrase|passcode|access code|alarm code|door code|gate code|recovery answer|recovery code|one-time code|verification code|encryption key|private key|seed phrase|full address|street address|account number|card number|bank account|routing number|social security|government id|passport number|driver license|full serial|serial number|policy number|claim number|case number|contract number|signature|date of birth|private contact|payment credential|login credential|medical record|diagnosis|medication detail|child name|school name|care schedule|vulnerable person|valuable contents|valuable item details|exact document location|exact access route|person name|customer name|resident name|legal strategy|complaint letter|remote access|document contents|backup contents|backup password|full name|identity document|financial statement|health record|power of attorney|will contents|trust contents|biometric|security answer|authenticator secret|api key|credit card|tax id|ssn|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, recovery secret, address, financial, identity, medical, child, care, access, valuable-property, legal, backup-content or private participant detail was detected. Replace it with a protected-process or source pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: eventRows.filter((row) => row.parts[9] === status).length })).filter((item) => item.count > 0);
      return `${values.drill.trim()} — household record retrieval and handoff drill\nDrill context: ${values.context}\nBinder baseline version: ${formatter.format(baselineDate)}\nFirst assignment or exercise: ${formatter.format(exerciseDate)}\nCurrent drill review: ${formatter.format(reviewDate)}\nNext correction or retest checkpoint: ${formatter.format(nextReview)}\nOpen prompts, attempts or corrections: ${openRows.length}\nPassed, archived or handed-off rows: ${closedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nControlling catalog, current-source, audience, access, backup and offline references: ${values.basis.trim()}\n\n${lines("Versioned retrieval, disclosure and retest evidence", eventRows.map((row) => `${row.parts[0]} — requested record/purpose: ${row.parts[1]} — authorized tester role: ${row.parts[2]} — assignment/attempt date: ${formatter.format(strictIsoDate(row.parts[3]) as Date)} — indexed/current-source pointer: ${row.parts[4]} — observed result: ${row.parts[5]} — disclosure/access/version gap and correction/closure: ${row.parts[6]} — owner: ${row.parts[7]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[8]) as Date)} — status: ${row.parts[9]}`))}\n\nProtected originals, permissions and drill-evidence location: ${values.storage.trim()}\n\nThis output is a private household drill index. It does not search a browser, device, folder, cloud service or FamilyBoard database; open, copy, upload, decrypt, restore, validate, modify, delete or share any file, document, credential or backup; authenticate a source, issuer, signature, version, permission or identity; determine legal authority, consent, sufficiency, retention, coverage, ownership, access rights or emergency readiness; grant, revoke or test an account, lock, device or service; contact a household member, issuer, provider, authority or emergency service; or certify a binder, backup, handoff or household as current, secure, accessible, compliant or complete. Preserve originals, permissions and credentials in systems appropriate to them, and use current responsible sources for real decisions.`;
    },
  },
  "important-household-document-review": {
    intro:
      "Review which document classes support real household responsibilities, then link each to a current-source pointer, protected original or limited-copy state, replacement route, owner and dated next action. This tool does not open, authenticate, replace or retain a document.",
    fields: [
      text("review", "Private household review reference", "Use a stable household label, not a person, address, account, claim, vulnerable household member or exact protected location.", "DOC-COVERAGE-2026-A"),
      {
        name: "context",
        label: "Coverage review context",
        type: "select",
        options: [
          "First household binder setup",
          "Move or household-role change",
          "Annual issuer and source review",
          "Reconstruction after a lost device or folder",
          "Limited handoff or offline-view preparation",
        ],
      },
      { name: "baselineDate", label: "Source-list baseline date", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: "Current coverage review date", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "Next source or access checkpoint", type: "date", value: "2026-09-07" },
      text("basis", "Controlling issuer, current-source, access, replacement and protection references", "Use safe IDs or dated public-source URLs. Keep originals, document contents, authority evidence, credentials and sensitive access rules protected.", "ISSUER-LIST-I2; SOURCE-CURRENT-S3; ACCESS-A2; REPLACEMENT-R3; BACKUP-B4"),
      {
        name: "records",
        label: "Versioned applicability, source, protection and replacement rows",
        type: "textarea",
        help: "One line: ID | household decision or record purpose | source checked date YYYY-MM-DD | controlling issuer or current-source pointer | protected original, limited-copy and authorized-access state | official replacement or reconstruction route | specific gap, correction or closure reason | owner role | target or outcome date YYYY-MM-DD | one of the ten listed statuses. Maximum 14 lines.",
        value: "HOUSING-1 | Current occupancy source for routine household administration | 2026-08-23 | ISSUER-I2 current agreement issuer source reviewed 2026-08-23 | Protected original O1; routine index exposes only a limited location pointer and owner role | REPLACEMENT-R3 official issuer copy-request route recorded; access requirements remain protected | Confirm an authorized backup role can begin the controlled request route without viewing agreement contents | Household records owner role | 2026-09-07 | Replacement or reconstruction route recorded—follow-up pending\nOFFLINE-1 | Limited emergency household reference for the intended backup role | 2026-08-23 | SOURCE-CURRENT-S3 and official preparedness source captured 2026-08-23 | Limited offline copy O2 has an audience label and review date; master remains protected | REPLACEMENT-R4 rebuilds the limited view from the current source list | Compare minimum disclosure before the next printed version and keep private master fields withheld | Household continuity owner role | 2026-09-07 | Limited continuity reference prepared—audience review pending",
      },
      text("storage", "Protected originals, authority evidence and review-history location", "Use a folder or process label, not a document image, full address, account, identity, medical, financial, child, legal, access or private participant detail.", "Household records / coverage reviews / DOC-COVERAGE-2026-A / protected history"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.review.trim()) return "Enter a private household review reference so the exported version can be identified.";
      if (!baselineDate) return "Enter the real source-list baseline date in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real current coverage review date in YYYY-MM-DD format.";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The current coverage review date cannot be in the future.";
      if (baselineDate.getTime() > reviewDate.getTime()) return "The source-list baseline date cannot be later than the current coverage review date.";
      if (!nextReview) return "Enter a real next source or access checkpoint in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next source or access checkpoint cannot be earlier than the current coverage review date.";
      if (values.basis.trim().length < 12) return "Identify the controlling issuer, current-source, access, replacement and protection references with safe pointers.";
      if (!values.storage.trim()) return "Enter the protected location for originals, authority evidence and review history.";
      const recordRows = values.records.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (recordRows.length === 0) return "Add at least one applicable or explicitly not-applicable household responsibility.";
      if (recordRows.length > 14) return "One coverage-review version supports at most 14 rows; freeze this version and create a later dated scope for more.";
      const invalidRows = recordRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Coverage review line ${invalidRows.map((row) => row.line).join(", ")} must contain all ten pipe-separated fields.`;
      const ids = recordRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Every coverage-review row needs a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Use 2 to 20 letters, numbers or hyphens for each row ID, such as HOUSING-1 or OFFLINE-1.";
      const statusOrder = [
        "Scope recorded—issuer decision pending",
        "Applicable—controlling source not confirmed",
        "Controlling source confirmed—current version review pending",
        "Original or limited copy located—authorized-access review pending",
        "Replacement or reconstruction route recorded—follow-up pending",
        "Limited continuity reference prepared—audience review pending",
        "Gap corrected—recheck pending",
        "Current review reconciled—source, protection and retrieval route linked",
        "Not applicable—reason and review trigger recorded",
        "Limited archive or external process—gap and owner preserved",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = recordRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `Coverage review line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the ten evidence statuses in the field instructions.`;
      const invalidSourceDates = recordRows.filter((row) => {
        const sourceDate = strictIsoDate(row.parts[2]);
        return !sourceDate || sourceDate.getTime() < baselineDate.getTime() || sourceDate.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return `Coverage review line ${invalidSourceDates.map((row) => row.line).join(", ")} needs a real source-checked date from the baseline through the current review.`;
      const openRows = recordRows.filter((row) => statusOrder.slice(0, 7).includes(row.parts[9]));
      const closedRows = recordRows.filter((row) => statusOrder.slice(7).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open coverage review line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next source or access checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < baselineDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Reconciled, not-applicable or archived line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual outcome date from the baseline through this review.`;
      const missingLayers = recordRows.filter((row) => row.parts[1].length < 8 || row.parts[3].length < 8 || row.parts[4].length < 8 || row.parts[5].length < 8 || row.parts[7].length < 4);
      if (missingLayers.length)
        return `Coverage review line ${missingLayers.map((row) => row.line).join(", ")} needs a real purpose, controlling-source pointer, protection/access state, replacement route and owner role.`;
      const reconciledWithoutLayers = recordRows.filter((row) => row.parts[9] === statusOrder[7] && (!/(?:current|controlling|issuer|official).{0,12}(?:source|version)|(?:source|version).{0,12}(?:current|controlling|checked)/i.test(row.parts[3]) || !/(?:protected|limited|authorized|audience|access|withheld)/i.test(row.parts[4]) || !/(?:replacement|replace|reissue|reconstruct|retrieve|official request|issuer request)/i.test(row.parts[5])));
      if (reconciledWithoutLayers.length)
        return `Reconciled coverage line ${reconciledWithoutLayers.map((row) => row.line).join(", ")} must link a current or controlling source, protected or limited access state, and responsible replacement, reissue, reconstruction or retrieval route.`;
      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[9] === statusOrder[8] && !/(?:reopen|review again|if |when |after |purchase|lease|move|claim|dependent|role change|new responsibility)/i.test(row.parts[6]));
      if (notApplicableWithoutTrigger.length)
        return `Not-applicable coverage line ${notApplicableWithoutTrigger.map((row) => row.line).join(", ")} must state the current reason and the event that reopens the class.`;
      const vagueActions = recordRows.filter((row) => row.parts[6].length < 12 || /^(?:done|safe|valid|legal|complete|verified|ready|current|covered|accepted|accessible|no issue|none|n\/a|ok)$/i.test(row.parts[6]));
      if (vagueActions.length)
        return `Coverage review line ${vagueActions.map((row) => row.line).join(", ")} needs a specific source, protection, access or replacement gap and a source-based correction or closure reason—not a generic status word.`;
      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number, email, address, account, policy, claim, case, serial, identity or complete numeric identifier was detected. Keep it protected and use a safe pointer here.";
      if (/password|passphrase|passcode|access code|alarm code|door code|gate code|recovery answer|recovery code|one-time code|verification code|encryption key|private key|seed phrase|certificate pin|full address|street address|account number|card number|bank account|routing number|social security|government id|passport number|driver license number|full serial|serial number|policy number|claim number|case number|contract number|signature|date of birth|private contact|payment credential|login credential|medical record|diagnosis|prescription detail|medication detail|child name|school name|care schedule|vulnerable person|valuable contents|exact document location|exact access route|person name|customer name|resident name|legal strategy|complaint letter|document contents|will contents|trust contents|authorization contents|financial statement|health record|biometric|security answer|authenticator secret|api key|credit card|tax id|ssn|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, recovery secret, address, financial, identity, medical, child, care, access, valuable-property, legal-content or private participant detail was detected. Replace it with a protected-process or source pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[9] === status).length })).filter((item) => item.count > 0);
      return `${values.review.trim()} — important household document coverage review\nReview context: ${values.context}\nSource-list baseline: ${formatter.format(baselineDate)}\nCurrent coverage review: ${formatter.format(reviewDate)}\nNext source or access checkpoint: ${formatter.format(nextReview)}\nOpen source, protection or replacement gaps: ${openRows.length}\nReconciled, not-applicable or archived rows: ${closedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nControlling issuer, current-source, access, replacement and protection references: ${values.basis.trim()}\n\n${lines("Versioned household document coverage evidence", recordRows.map((row) => `${row.parts[0]} — household purpose: ${row.parts[1]} — source checked: ${formatter.format(strictIsoDate(row.parts[2]) as Date)} — issuer/current source: ${row.parts[3]} — protected original/limited copy/authorized access: ${row.parts[4]} — replacement/reconstruction route: ${row.parts[5]} — gap/correction/closure: ${row.parts[6]} — owner: ${row.parts[7]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[8]) as Date)} — status: ${row.parts[9]}`))}\n\nProtected originals, authority evidence and review-history location: ${values.storage.trim()}\n\nThis output is a private household planning index. It does not open, search, upload, copy, authenticate, validate, replace, renew, revoke, destroy, retain or share a document, credential, account or record; contact an issuer, institution, provider, authority or household member; prove identity, relationship, occupancy, ownership, authority, consent, signature, version, acceptance, coverage, value, condition, claim or legal sufficiency; determine applicability or retention; calculate any external deadline; grant access; complete a government, financial, insurance, medical, school, employment, immigration, property or legal process; or certify continuity or emergency readiness. Preserve originals and authority evidence in appropriate protected systems, and use the current issuer, receiving institution, agreement, policy, responsible authority and qualified advice for real decisions.`;
    },
  },
  "household-record-retention-decision-log": {
    intro:
      "Create a versioned household retention decision with a current source, source-defined trigger, active-use or hold screen, protected-version state, owner and observed outcome. The tool does not calculate deadlines or destroy records.",
    fields: [
      text("review", "Private retention-review reference", "Use a household code, not a person, address, taxpayer, account, claim, vulnerable person or exact protected location.", "RETENTION-2026-A"),
      {
        name: "context",
        label: "Decision-review context",
        type: "select",
        options: [
          "Annual household record review",
          "Tax-season source check",
          "Move, sale, transfer or disposal of property",
          "Warranty, policy or agreement version change",
          "Claim, complaint, audit or dispute change",
          "Controlled paper and digital cleanup",
        ],
      },
      { name: "baselineDate", label: "Source-map baseline date", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: "Current retention decision review date", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "Next policy or source checkpoint", type: "date", value: "2026-09-14" },
      text("basis", "Controlling authority, issuer, agreement, policy, hold and disposal-process references", "Use safe source/version IDs or dated public URLs. Keep returns, agreements, statements, claims, credentials and document contents protected.", "SOURCE-MAP-S2; IRS-RETENTION-R4; STATE-SOURCE-T2; WARRANTY-W3; POLICY-P2; DISPOSAL-D1"),
      {
        name: "records",
        label: "Versioned retention, archive and disposal decision rows",
        type: "textarea",
        help: "One line: ID | record class and actual household purpose | source checked date YYYY-MM-DD | controlling source, rule and jurisdiction | source-defined trigger or end event | active use, exception or hold screen | protected original and current-version state | proposed or observed action and evidence | owner role | target or outcome date YYYY-MM-DD | one of the twelve listed statuses. Maximum 14 lines.",
        value: "TAX-2025 | Support the filed household federal return and claimed items | 2026-08-23 | IRS-RETENTION-R4 federal recordkeeping source checked; state source still unmapped | Filing and payment events are indexed in protected source TAX-EVENT-E2 | Audit, amended-return, refund, state and non-tax purpose screen is not complete | Protected tax-year archive TAX-A4; household index exposes year and source only | Review the applicable IRS branch and state source, then record the real event without treating this checkpoint as disposal approval | Household tax-records role | 2026-09-14 | Source located—current rule not yet reviewed\nWARRANTY-1 | Support written appliance warranty, repair and recall history while the asset remains managed | 2026-08-23 | WARRANTY-W3 written terms and manufacturer current support source checked | Written term start method and asset transfer event are indexed in EVENT-W2 | Product remains owned and repair follow-up is open; retain while those purposes remain active | Protected receipt and terms in ASSET-A3; current support pointer in household index | Recheck repair closure, recall source and any insurance or tax purpose before creating a disposal candidate | Household asset-records role | 2026-09-14 | Active use, term, ownership, claim or dispute—retain and recheck",
      },
      text("storage", "Protected originals, approvals and decision-evidence location", "Use a folder or process label. Do not enter a return, receipt, agreement, statement, identity, medical, child, legal, account, credential or disposal-evidence content.", "Household records / retention reviews / RETENTION-2026-A / protected history"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.review.trim()) return "Enter a private retention-review reference so this exported decision version can be identified.";
      if (!baselineDate) return "Enter the real source-map baseline date in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real current retention decision review date in YYYY-MM-DD format.";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The current retention decision review date cannot be in the future.";
      if (baselineDate.getTime() > reviewDate.getTime()) return "The source-map baseline date cannot be later than the current decision review.";
      if (!nextReview) return "Enter a real next policy or source checkpoint in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next policy or source checkpoint cannot be earlier than the current decision review.";
      if (values.basis.trim().length < 12) return "Identify the controlling authority, issuer, agreement, policy, hold and disposal-process sources with safe pointers.";
      if (!values.storage.trim()) return "Enter the protected location for originals, approvals and decision evidence.";
      const recordRows = values.records.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (recordRows.length === 0) return "Add at least one household record class and actual purpose.";
      if (recordRows.length > 14) return "One retention-decision version supports at most 14 rows; freeze this version before creating another scope.";
      const invalidRows = recordRows.filter((row) => row.parts.length !== 11 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Retention decision line ${invalidRows.map((row) => row.line).join(", ")} must contain all eleven pipe-separated fields.`;
      const ids = recordRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Every retention-decision row needs a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Use 2 to 20 letters, numbers or hyphens for each row ID, such as TAX-2025 or WARRANTY-1.";
      const statusOrder = [
        "Purpose recorded—controlling source pending",
        "Source located—current rule not yet reviewed",
        "Rule reviewed—trigger event not confirmed",
        "Trigger recorded—exception and active-use screen pending",
        "Active use, term, ownership, claim or dispute—retain and recheck",
        "Responsible source requires continued retention—next review pending",
        "Disposal candidate—human approval pending",
        "Replacement or redaction plan prepared—completion pending",
        "Retention continued—source and next review linked",
        "Disposal completed—method and evidence recorded",
        "Transferred or archived—custody and next owner linked",
        "Not applicable—reason and reopen event recorded",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = recordRows.filter((row) => !statuses.has(row.parts[10]));
      if (invalidStatuses.length)
        return `Retention decision line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the twelve evidence statuses in the field instructions.`;
      const invalidSourceDates = recordRows.filter((row) => {
        const sourceDate = strictIsoDate(row.parts[2]);
        return !sourceDate || sourceDate.getTime() < baselineDate.getTime() || sourceDate.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return `Retention decision line ${invalidSourceDates.map((row) => row.line).join(", ")} needs a real source-checked date from the baseline through the current review.`;
      const openRows = recordRows.filter((row) => statusOrder.slice(0, 8).includes(row.parts[10]));
      const closedRows = recordRows.filter((row) => statusOrder.slice(8).includes(row.parts[10]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[9]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open retention decision line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next policy or source checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[9]);
        return !outcome || outcome.getTime() < baselineDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Closed retention, disposal, transfer or not-applicable line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual outcome date from the baseline through this review.`;
      const missingLayers = recordRows.filter((row) => row.parts[1].length < 10 || row.parts[3].length < 10 || row.parts[4].length < 8 || row.parts[5].length < 8 || row.parts[6].length < 8 || row.parts[7].length < 12 || row.parts[8].length < 4);
      if (missingLayers.length)
        return `Retention decision line ${missingLayers.map((row) => row.line).join(", ")} needs a real purpose, controlling source, trigger, active-use/hold screen, protected-version state, attributable action and owner.`;
      const disposalCandidatesThatClaimCompletion = recordRows.filter((row) => row.parts[10] === statusOrder[6] && /(?:completed|destroyed|shredded|deleted|erased|removed|all copies gone)/i.test(row.parts[7]));
      if (disposalCandidatesThatClaimCompletion.length)
        return `Disposal candidate line ${disposalCandidatesThatClaimCompletion.map((row) => row.line).join(", ")} must remain a proposed action; use a completed status only after an authorized observed outcome.`;
      const unsafeCompletedDisposals = recordRows.filter((row) => row.parts[10] === statusOrder[9] && (/(?:active|open|pending|hold|audit|claim|dispute|investigation|refund|appeal|complaint|litigation|not checked|unknown)/i.test(row.parts[5]) || !/(?:observed|completed|shredded|deleted|erased|destroyed|removed).{0,40}(?:method|paper|file|location|evidence|record)|(?:evidence|method).{0,40}(?:observed|completed|shredded|deleted|erased|destroyed|removed)/i.test(row.parts[7])));
      if (unsafeCompletedDisposals.length)
        return `Completed disposal line ${unsafeCompletedDisposals.map((row) => row.line).join(", ")} must show no unresolved active-use or hold in this review and record an observed limited method plus safe evidence pointer.`;
      const continuedWithoutSource = recordRows.filter((row) => row.parts[10] === statusOrder[8] && (!/(?:source|authority|issuer|agreement|policy|rule|adviser)/i.test(row.parts[3]) || !/(?:retain|keep|continue).{0,40}(?:next|review|recheck|source|checkpoint)/i.test(row.parts[7])));
      if (continuedWithoutSource.length)
        return `Continued-retention line ${continuedWithoutSource.map((row) => row.line).join(", ")} must link the responsible source and an attributable next review, not only say keep forever.`;
      const transferWithoutCustody = recordRows.filter((row) => row.parts[10] === statusOrder[10] && !/(?:transfer|archive|custody|owner|responsib)/i.test(row.parts[7]));
      if (transferWithoutCustody.length)
        return `Transferred or archived line ${transferWithoutCustody.map((row) => row.line).join(", ")} must identify the observed custody or archive action and next responsible owner.`;
      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[10] === statusOrder[11] && !/(?:reopen|review again|if |when |after |purchase|ownership|claim|agreement|role change|new responsibility)/i.test(row.parts[7]));
      if (notApplicableWithoutTrigger.length)
        return `Not-applicable line ${notApplicableWithoutTrigger.map((row) => row.line).join(", ")} must state the current reason and event that reopens the record class.`;
      const vagueActions = recordRows.filter((row) => row.parts[7].length < 12 || /^(?:done|keep|forever|delete|deleted|shred|shredded|archive|safe|valid|legal|complete|verified|ready|expired|none|n\/a|ok)$/i.test(row.parts[7]));
      if (vagueActions.length)
        return `Retention decision line ${vagueActions.map((row) => row.line).join(", ")} needs a specific proposed or observed action, source-led reason and safe evidence pointer—not a generic keep, delete or expiry word.`;
      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number, email, address, account, taxpayer, policy, claim, case, identity or complete numeric identifier was detected. Keep it protected and use a safe pointer here.";
      if (/password|passphrase|passcode|access code|alarm code|door code|gate code|recovery answer|recovery code|one-time code|verification code|encryption key|private key|seed phrase|certificate pin|full address|street address|account number|card number|bank account|routing number|social security|government id|passport number|driver license number|taxpayer number|tax id|ssn|policy number|claim number|case number|contract number|signature|date of birth|private contact|payment credential|login credential|medical record|diagnosis|prescription detail|medication detail|child name|school name|care schedule|vulnerable person|exact document location|exact access route|person name|customer name|resident name|legal strategy|complaint letter|return contents|statement contents|agreement contents|claim contents|document contents|will contents|trust contents|authorization contents|financial statement|health record|biometric|security answer|authenticator secret|api key|credit card|disposal evidence contents|full name|identity document|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, address, financial, tax, identity, medical, child, care, access, legal-content, disposal-evidence or private participant detail was detected. Replace it with a protected source, process or evidence pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[10] === status).length })).filter((item) => item.count > 0);
      return `${values.review.trim()} — household record retention decision log\nReview context: ${values.context}\nSource-map baseline: ${formatter.format(baselineDate)}\nCurrent decision review: ${formatter.format(reviewDate)}\nNext policy or source checkpoint: ${formatter.format(nextReview)}\nOpen source, trigger, screen or action rows: ${openRows.length}\nClosed continued-retention, disposal, transfer or not-applicable rows: ${closedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nControlling authority, issuer, agreement, policy, hold and disposal-process references: ${values.basis.trim()}\n\n${lines("Versioned household retention decisions", recordRows.map((row) => `${row.parts[0]} — record class/purpose: ${row.parts[1]} — source checked: ${formatter.format(strictIsoDate(row.parts[2]) as Date)} — controlling source/rule/jurisdiction: ${row.parts[3]} — source-defined trigger/end event: ${row.parts[4]} — active use/exception/hold screen: ${row.parts[5]} — protected original/current version: ${row.parts[6]} — proposed/observed action and evidence: ${row.parts[7]} — owner: ${row.parts[8]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[9]) as Date)} — status: ${row.parts[10]}`))}\n\nProtected originals, approvals and decision-evidence location: ${values.storage.trim()}\n\nThis output is a household decision index, not a retention schedule or disposal instruction. It does not calculate or extend an external deadline; determine a legal, tax, warranty, policy, contract, claim, court, benefit, employment, identity, medical or records duty; open, read, classify, upload, copy, redact, archive, transfer, shred, erase, destroy, retain or remove a record; inspect a browser, device, synchronized folder, cloud service, email, download, backup or recipient; authorize a person; release a hold; prove that every copy is gone; or make a destructive action reversible. Preserve protected originals and approvals separately, and use the current responsible source and qualified advice for the actual decision.`;
    },
  },
  "household-insurance-policy-source-version-log": {
    intro:
      "Record the legal-insurer evidence, issued document set, form and endorsement relationship, access observation, current status source and complaint route. The tool does not verify insurance, interpret coverage or calculate a deadline.",
    fields: [
      text("review", "Private insurance-source review reference", "Use a household code, not a person, address, policy, claim, account or exact protected location.", "INS-SOURCE-2026-A"),
      {
        name: "context",
        label: "Insurance document review context",
        type: "select",
        options: [
          "First household insurance inventory",
          "New issue or renewal document set",
          "Endorsement, rider or amendment received",
          "Household access or backup-role handoff",
          "Possible missing issued document",
          "Cancellation, nonrenewal or status notice",
          "Claim or complaint preparation",
          "Insurer legal-name or source research",
          "Policy replacement, end or archive",
        ],
      },
      { name: "baselineDate", label: "Insurance catalog and source-map baseline date", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: "Current insurance-source review date", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "Next source or status checkpoint", type: "date", value: "2026-09-14" },
      text("basis", "Insurer, regulator, ombudsman and protected issued-document source map", "Use safe source and evidence IDs or dated public URLs. Keep identifiers, account pages, notices, claim files and correspondence protected.", "INSURER-SERVICE-S2; STATE-DOI-D1; OMBUDSMAN-O1; ISSUED-SET-A2 protected"),
      {
        name: "records",
        label: "Versioned insurance policy source and document rows",
        type: "textarea",
        help: "One line: ID | safe policy purpose and household role | insurer legal-entity evidence state | source checked date YYYY-MM-DD | issued document set and version or effective-period clue | declarations, certificate, form, endorsement or rider relationship | current access and protected-original observation | renewal, replacement, cancellation, nonrenewal, claim or complaint source and discrepancy | owner role | target or outcome date YYYY-MM-DD | one of the eleven listed statuses. Maximum 14 lines.",
        value: "HOME-1 | Primary-home property policy record; household insurance-documents role | Example insurer legal entity shown on protected issued declarations; evidence INS-LEGAL-A2 | 2026-08-24 | Insurer-issued declarations set INS-DOC-A2; term and form-edition clues recorded in protected review | Declarations list base form and two endorsements; all three relationships recorded | Protected declarations, base form and both listed endorsements opened; titles visible | Insurer-issued renewal declarations observed; insurer complaint route and state DOI source mapped; no source discrepancy observed in this dated review | Household insurance-documents role | 2026-08-24 | Issued source, document relationship, access and status routes reviewed\nPRIOR-1 | Replaced household liability policy set; archive and unresolved-purpose screen | Prior insurer legal entity shown on protected declarations; evidence INS-LEGAL-B1 | 2026-08-23 | Prior issued set INS-DOC-B1 and replacement pointer INS-DOC-B2; supersession clue recorded | Prior declarations list an endorsement that is not present in the protected set | Prior declarations opened; missing listed endorsement prevents complete access claim | Replacement notice source recorded; missing endorsement routed to prior insurer document service before archive decision | Household insurance-documents role | 2026-09-14 | Possible missing document, status notice or term conflict—insurer or qualified review pending",
      },
      text("storage", "Protected issued policies, endorsements, notices and review-history location", "Use a folder or process label. Do not enter names, addresses, identifiers, insured assets or people, benefits, health, payment, credentials, claim details or correspondence.", "Household records / insurance sources / INS-SOURCE-2026-A / protected issued sets"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.review.trim()) return "Enter a private insurance-source review reference so this exported version can be identified.";
      if (!baselineDate) return "Enter the real insurance catalog and source-map baseline date in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real current insurance-source review date in YYYY-MM-DD format.";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The current insurance-source review date cannot be in the future.";
      if (baselineDate.getTime() > reviewDate.getTime()) return "The insurance catalog and source-map baseline cannot be later than the current review.";
      if (!nextReview) return "Enter a real next source or status checkpoint in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next source or status checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 12) return "Identify the insurer, regulator, ombudsman and protected issued-document source map with safe pointers.";
      if (!values.storage.trim()) return "Enter the protected location for issued policies, endorsements, notices and review history.";
      const recordRows = values.records.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (recordRows.length === 0) return "Add at least one insurance purpose and issued-document relationship row.";
      if (recordRows.length > 14) return "One insurance-source review version supports at most 14 rows; freeze this version before starting another scope.";
      const invalidRows = recordRows.filter((row) => row.parts.length !== 11 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Insurance-source line ${invalidRows.map((row) => row.line).join(", ")} must contain all eleven pipe-separated fields.`;
      const ids = recordRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Every insurance-source row needs a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Use 2 to 20 letters, numbers or hyphens for each row ID, such as HOME-1 or PRIOR-A.";
      const statusOrder = [
        "Purpose recorded—issued policy source pending",
        "Issued source recorded—legal insurer entity pending",
        "Legal insurer recorded—current document set pending",
        "Document set found—form and endorsement relationship pending",
        "Endorsements or riders identified—version comparison pending",
        "Version compared—current access test pending",
        "Access tested—status and complaint sources pending",
        "Possible missing document, status notice or term conflict—insurer or qualified review pending",
        "Issued source, document relationship, access and status routes reviewed",
        "Policy ended or replaced—custody and unresolved purpose recorded",
        "Not applicable—reason and reopen event recorded",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = recordRows.filter((row) => !statuses.has(row.parts[10]));
      if (invalidStatuses.length)
        return `Insurance-source line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the eleven evidence statuses in the field instructions.`;
      const invalidSourceDates = recordRows.filter((row) => {
        const sourceDate = strictIsoDate(row.parts[3]);
        return !sourceDate || sourceDate.getTime() < baselineDate.getTime() || sourceDate.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return `Insurance-source line ${invalidSourceDates.map((row) => row.line).join(", ")} needs a real source-checked date from the baseline through the current review.`;
      const openRows = recordRows.filter((row) => statusOrder.slice(0, 8).includes(row.parts[10]));
      const closedRows = recordRows.filter((row) => statusOrder.slice(8).includes(row.parts[10]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[9]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open insurance-source line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next source or status checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[9]);
        return !outcome || outcome.getTime() < baselineDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Closed reviewed, ended or not-applicable insurance-source line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual outcome date from the baseline through this review.`;
      const missingLayers = recordRows.filter((row) => row.parts[1].length < 8 || row.parts[2].length < 8 || row.parts[4].length < 10 || row.parts[5].length < 10 || row.parts[6].length < 8 || row.parts[7].length < 10 || row.parts[8].length < 4);
      if (missingLayers.length)
        return `Insurance-source line ${missingLayers.map((row) => row.line).join(", ")} needs a real purpose, legal-insurer evidence, issued set, document relationship, access observation, status or complaint source and owner role.`;
      const completedWithoutEvidence = recordRows.filter((row) => row.parts[10] === statusOrder[8] && (!/(?:insurer|carrier|underwriter|issued)/i.test([row.parts[2], row.parts[4]].join(" ")) || !/(?:declarations|certificate|policy form|contract form|endorsement|rider|amendment)/i.test(row.parts[5]) || !/(?:opened|accessed|visible|retrieved)/i.test(row.parts[6]) || !/(?:renewal|replacement|cancellation|nonrenewal|status|complaint|regulator|department of insurance|ombudsman|insurer)/i.test(row.parts[7]) || /(?:pending|unknown|unresolved|missing|not found|not checked|not opened|conflict)/i.test([row.parts[4], row.parts[5], row.parts[6], row.parts[7]].join(" "))));
      if (completedWithoutEvidence.length)
        return `Completed insurance-source line ${completedWithoutEvidence.map((row) => row.line).join(", ")} must link attributable legal-insurer evidence, the issued document relationship, an actual access observation and a current status or complaint route with no unresolved gap.`;
      const earlyRowsClaimingCompletion = recordRows.filter((row) => statusOrder.slice(0, 7).includes(row.parts[10]) && /(?:fully verified|policy valid|coverage confirmed|complete set confirmed|continuous coverage confirmed)/i.test([row.parts[2], row.parts[4], row.parts[5], row.parts[6], row.parts[7]].join(" ")));
      if (earlyRowsClaimingCompletion.length)
        return `Open insurance-source line ${earlyRowsClaimingCompletion.map((row) => row.line).join(", ")} cannot claim a fully verified or valid policy, confirmed coverage, complete set or continuous coverage.`;
      const conflictWithoutResponsibleRoute = recordRows.filter((row) => row.parts[10] === statusOrder[7] && (!/(?:missing|conflict|difference|contradiction|cancellation|nonrenewal|status notice|term)/i.test([row.parts[5], row.parts[7]].join(" ")) || !/(?:insurer|regulator|department of insurance|ombudsman|qualified|legal counsel|licensed adviser|responsible source)/i.test([row.parts[7], row.parts[8]].join(" "))));
      if (conflictWithoutResponsibleRoute.length)
        return `Conflict line ${conflictWithoutResponsibleRoute.map((row) => row.line).join(", ")} must name the observed missing document, notice or term discrepancy and the responsible insurer, regulator, ombudsman or qualified review route.`;
      const endedWithoutCustody = recordRows.filter((row) => row.parts[10] === statusOrder[9] && (!/(?:ended|replaced|cancelled|canceled|nonrenewed|superseded|expired)/i.test([row.parts[4], row.parts[7]].join(" ")) || !/(?:custody|archive|protected|retained|claim|dispute|complaint|tax|property|lender|legal|remaining purpose|unresolved purpose)/i.test([row.parts[6], row.parts[7]].join(" "))));
      if (endedWithoutCustody.length)
        return `Ended or replaced line ${endedWithoutCustody.map((row) => row.line).join(", ")} must record the attributable status event, protected custody and any remaining or screened purpose.`;
      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[10] === statusOrder[10] && !/(?:reopen|review again|if |when |after |new policy|new coverage purpose|household change|asset change|role change|purchase|move)/i.test([row.parts[5], row.parts[6], row.parts[7]].join(" ")));
      if (notApplicableWithoutTrigger.length)
        return `Not-applicable line ${notApplicableWithoutTrigger.map((row) => row.line).join(", ")} must state the current reason and event that reopens this insurance purpose.`;
      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone number, email, policy, claim, account, vehicle, payment or other complete numeric identifier was detected. Keep it protected and use a safe pointer here.";
      if (/password|passphrase|passcode|access code|recovery code|one-time code|verification code|private key|seed phrase|account number|policy number|claim number|case number|contract number|card number|bank account|routing number|social security|government id|passport number|driver license number|full address|street address|full name|policyholder name|insured person name|beneficiary name|date of birth|signature|health record|medical record|diagnosis|prescription|vehicle identification number|\bvin\b|license plate|premium amount|coverage limit|deductible amount|payment credential|login credential|private correspondence contents|claim contents|complaint contents|api key|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, address, identity, policy, claim, insured-person, beneficiary, health, vehicle, financial, signature or private-correspondence detail was detected. Replace it with a protected source, document or evidence pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[10] === status).length })).filter((item) => item.count > 0);
      return `${values.review.trim()} — household insurance policy source and version log\nReview context: ${values.context}\nInsurance catalog/source-map baseline: ${formatter.format(baselineDate)}\nCurrent insurance-source review: ${formatter.format(reviewDate)}\nNext source or status checkpoint: ${formatter.format(nextReview)}\nOpen source, insurer, document, version, access or status rows: ${openRows.length}\nReviewed, ended or not-applicable rows: ${closedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nInsurer, regulator, ombudsman and protected issued-document source map: ${values.basis.trim()}\n\n${lines("Versioned insurance source evidence", recordRows.map((row) => `${row.parts[0]} — policy purpose/household role: ${row.parts[1]} — legal-insurer evidence: ${row.parts[2]} — source checked: ${formatter.format(strictIsoDate(row.parts[3]) as Date)} — issued set/version/effective-period clue: ${row.parts[4]} — form/endorsement relationship: ${row.parts[5]} — access/protected original: ${row.parts[6]} — status/claim/complaint source and discrepancy: ${row.parts[7]} — owner: ${row.parts[8]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[9]) as Date)} — status: ${row.parts[10]}`))}\n\nProtected issued policies, endorsements, notices and review-history location: ${values.storage.trim()}\n\nThis output is a household source index, not proof of insurance, coverage, payment, validity or claim outcome. It does not search, authenticate, issue, renew, replace, cancel or change insurance; visit a portal; identify a person, insurer, agent, policy, claim or insured asset; read, compare or interpret wording, exclusions, limits, deductibles, beneficiaries, duties, notices or rights; calculate a premium, benefit, claim, appeal, complaint or legal deadline; contact an insurer, regulator or ombudsman; submit a request, claim or complaint; or provide insurance, financial or legal advice. Use the actual issued documents, current insurer, applicable regulator or dispute source and qualified advice.`;
    },
  },
  "__zh-tw-household-utility-provider-service-handoff-log": {
    intro:
      "逐筆記錄供應單位與服務地點證據、戶名或大樓責任、官方存取與帳務／服務觀察、安全入口、搬家行動及業者確認。工具不聯絡業者，也不驗證帳戶。",
    fields: [
      text("review", "家庭私人公用事業核對代號", "使用家庭內部代號，不要輸入姓名、地址、帳戶、表號、案件或精確受保護位置。", "UTILITY-HANDOFF-2026-A"),
      {
        name: "context",
        label: "公用事業服務核對情境",
        type: "select",
        options: [
          "第一次家庭水電瓦斯網路盤點",
          "家庭戶名或帳務備援交接",
          "搬入開通、過戶或移機",
          "搬出停止、結算或設備歸還",
          "供應單位、屋主或管委會責任改變",
          "目前官方 APP、網站與服務狀態核對",
          "停電、停水、瓦斯或備援來源複查",
          "帳單、繳費或服務狀態差異",
          "網路、電話或有線電視申訴準備",
        ],
      },
      { name: "baselineDate", label: "服務清單與來源地圖基準日", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: "本次公用事業服務核對日", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "下一次來源或交接核點", type: "date", value: "2026-09-14" },
      text("basis", "供應單位、房屋、障礙、安全、主管機關與受保護資料來源地圖", "使用安全來源／證據代號或有日期的公開網址；地址、帳戶、帳單、案件、憑證與通信留在受保護位置。", "TAIPOWER-OFFICIAL-P2；PROPERTY-SOURCE-B1；OUTAGE-SOURCE-E2；NCC-R1；PROTECTED-SET-U2"),
      {
        name: "records",
        label: "有版本的公用事業供應與服務交接列",
        type: "textarea",
        help: "每行：ID｜安全服務用途與家庭角色｜供應單位與服務地點適用證據｜來源核對日 YYYY-MM-DD｜用戶、住戶、屋主、房東或管委會責任狀態｜官方存取與帳單／服務狀態觀察｜停電、停水、瓦斯或其他安全來源｜開通、過戶、變更戶名、移機、停止、結算或日常交接行動與業者確認｜主管機關、申訴來源或未解差異｜負責角色｜目標或結果日期 YYYY-MM-DD｜十二種指定狀態之一。最多 14 行。",
        value: "ELEC-1 | 自住房屋電力服務；家庭公用事業紀錄角色 | 台電官方帳單來源與目前服務資料支持供應地點適用；受保護證據 UTIL-P2 | 2026-08-24 | 受保護業者資料已觀察登記用戶角色；家庭備援角色只可查找索引 | 台灣電力 APP 官方入口已開啟；本期帳單與服務狀態可見；未由扣繳設定推定付款結果 | 台電停電查詢通報、官方安全來源與 119 入口已在本次核對日映射 | 目前服務保留；沒有搬家申請；當住戶、供應、責任或存取變更時重新檢視 | 台電意見來源與適用消費爭議入口已映射；本次有日期檢視無來源差異 | 家庭公用事業紀錄角色 | 2026-08-24 | 已核對供應來源、責任、存取、狀態與交接入口\nNET-MOVE-1 | 舊住處網路服務；搬出停止與租用設備追蹤 | 電信業者官方帳單來源支持舊住處服務；受保護證據 NET-P1 | 2026-08-23 | 受保護業者資料已觀察登記用戶角色；設備保管已有負責人 | 官方帳戶來源已開啟；目前帳單可見；停止服務結果尚未觀察 | 業者障礙與服務狀態入口已映射；119 等緊急來源與網路客服保持分開 | 官方停止申請已記錄；業者確認、最後帳單與租用設備結果等待處理 | 業者申訴與 NCC／電消中心來源已映射；最後帳務或設備差異仍待結果 | 家庭通信紀錄角色 | 2026-09-14 | 已記錄開通、過戶、移機、停止或結算申請，等待業者確認",
      },
      text("storage", "受保護帳單、確認、設備與核對歷程位置", "使用資料夾或流程代號；不要輸入姓名、地址、帳戶、表號、帳單、餘額、付款、憑證、案件、私人通信或設備精確位置。", "家庭紀錄／公用事業服務／UTILITY-HANDOFF-2026-A／受保護業者證據"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.review.trim()) return "請輸入家庭私人公用事業核對代號，讓匯出版本可以辨認。";
      if (!baselineDate) return "請用 YYYY-MM-DD 輸入真實的服務清單與來源地圖基準日。";
      if (!reviewDate) return "請用 YYYY-MM-DD 輸入真實的本次公用事業服務核對日。";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "本次公用事業服務核對日不能晚於今天。";
      if (baselineDate.getTime() > reviewDate.getTime()) return "服務清單與來源地圖基準日不能晚於本次核對日。";
      if (!nextReview) return "請用 YYYY-MM-DD 輸入真實的下一次來源或交接核點。";
      if (nextReview.getTime() < reviewDate.getTime()) return "下一次來源或交接核點不能早於本次核對日。";
      if (values.basis.trim().length < 12) return "請用安全索引指出供應單位、房屋、障礙、安全、主管機關與受保護資料來源地圖。";
      if (!values.storage.trim()) return "請輸入受保護帳單、確認、設備與核對歷程位置。";
      const recordRows = values.records.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (recordRows.length === 0) return "請至少加入一筆公用事業服務用途與交接關係。";
      if (recordRows.length > 14) return "一個公用事業核對版本最多支援 14 行；請先凍結本版，再建立另一個範圍。";
      const invalidRows = recordRows.filter((row) => row.parts.length !== 12 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `公用事業服務第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整包含十二個以直線分隔的欄位。`;
      const ids = recordRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆公用事業服務列都需要不重複的 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "每個 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 ELEC-1 或 WATER-MOVE。";
      const statusOrder = [
        "已記錄服務用途，等待供應單位來源",
        "已記錄供應單位，等待服務地點適用證據",
        "已記錄地點適用證據，等待戶名與責任關係",
        "已記錄責任關係，等待目前官方存取",
        "已測試官方存取，等待帳單與服務狀態",
        "已觀察帳單或服務狀態，等待停電、停水與安全入口",
        "已映射障礙與安全入口，等待搬家或家庭交接行動",
        "已記錄開通、過戶、移機、停止或結算申請，等待業者確認",
        "供應、帳務、安全或責任資料衝突，等待負責來源處理",
        "已核對供應來源、責任、存取、狀態與交接入口",
        "服務已開通、過戶、移機、停止或結算，記錄官方結果與保管",
        "不適用，記錄理由與重新打開條件",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = recordRows.filter((row) => !statuses.has(row.parts[11]));
      if (invalidStatuses.length)
        return `公用事業服務第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用欄位說明中的十二種證據狀態之一。`;
      const invalidSourceDates = recordRows.filter((row) => {
        const sourceDate = strictIsoDate(row.parts[3]);
        return !sourceDate || sourceDate.getTime() < baselineDate.getTime() || sourceDate.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return `公用事業服務第 ${invalidSourceDates.map((row) => row.line).join("、")} 行，需要介於基準日與本次核對日之間的真實來源核對日。`;
      const openRows = recordRows.filter((row) => statusOrder.slice(0, 9).includes(row.parts[11]));
      const closedRows = recordRows.filter((row) => statusOrder.slice(9).includes(row.parts[11]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[10]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的公用事業服務第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標日必須從本次核對日起，到下一次來源或交接核點為止。`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[10]);
        return !outcome || outcome.getTime() < baselineDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已核對、完成或不適用的公用事業服務第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於基準日與本次核對日之間的實際結果日期。`;
      const missingLayers = recordRows.filter((row) => row.parts[1].length < 6 || row.parts[2].length < 8 || row.parts[4].length < 6 || row.parts[5].length < 8 || row.parts[6].length < 6 || row.parts[7].length < 8 || row.parts[8].length < 6 || row.parts[9].length < 3);
      if (missingLayers.length)
        return `公用事業服務第 ${missingLayers.map((row) => row.line).join("、")} 行需要真實服務用途、供應來源、責任、存取／狀態觀察、安全入口、交接行動、申訴來源與負責角色。`;
      const completedWithoutEvidence = recordRows.filter((row) => row.parts[11] === statusOrder[9] && (!/(?:官方|供應|台電|自來水|天然氣|業者|管委會|租約|帳單來源)/.test(row.parts[2]) || !/(?:登記用戶|住戶|承租人|屋主|房東|管委會|大樓|負責)/.test(row.parts[4]) || !/(?:開啟|存取|可見|觀察)/.test(row.parts[5]) || !/(?:帳單|繳費|付款|服務|狀態|供應)/.test(row.parts[5]) || !/(?:停電|停水|消防|119|安全|障礙|危險)/.test(row.parts[6]) || !/(?:交接|保留|重新檢視|搬家|開通|過戶|移機|停止|結算|責任|存取變更)/.test(row.parts[7]) || !/(?:申訴|主管|NCC|電消|消保|業者|台電)/i.test(row.parts[8]) || /(?:等待|未知|未解|缺少|找不到|尚未|衝突)/.test([row.parts[2], row.parts[4], row.parts[5], row.parts[6], row.parts[7], row.parts[8]].join(" "))));
      if (completedWithoutEvidence.length)
        return `已完成公用事業核對第 ${completedWithoutEvidence.map((row) => row.line).join("、")} 行必須連結可歸屬供應來源、責任、實際存取與狀態觀察、安全入口、交接或重新開啟規則及申訴來源，且不能仍有未解差異。`;
      const requestClaimingCompletion = recordRows.filter((row) => row.parts[11] === statusOrder[7] && (/(?:已完成|已結清|已停止|已過戶|已移機|餘額歸零|設備已歸還)/.test(row.parts[7]) || !/(?:申請|送出|記錄|等待|待確認|尚未)/.test(row.parts[7])));
      if (requestClaimingCompletion.length)
        return `申請已記錄第 ${requestClaimingCompletion.map((row) => row.line).join("、")} 行必須保持開放，寫出申請與等待業者確認，不能宣稱服務或結算已完成。`;
      const conflictWithoutResponsibleRoute = recordRows.filter((row) => row.parts[11] === statusOrder[8] && (!/(?:衝突|爭議|不同|不一致|危險|不安全|障礙|責任不明|異常)/.test([row.parts[5], row.parts[6], row.parts[7], row.parts[8]].join(" ")) || !/(?:供應單位|台電|自來水|天然氣|電信業者|房東|管委會|消防|119|主管機關|合格|負責)/.test([row.parts[6], row.parts[7], row.parts[8], row.parts[9]].join(" "))));
      if (conflictWithoutResponsibleRoute.length)
        return `資料衝突第 ${conflictWithoutResponsibleRoute.map((row) => row.line).join("、")} 行必須記錄供應、帳務、安全或責任差異，以及負責供應單位、房東／管委會、消防、主管機關或合格處理來源。`;
      const concludedWithoutConfirmation = recordRows.filter((row) => row.parts[11] === statusOrder[10] && (!/(?:業者確認|官方確認|官方結果|最後帳單|完成通知|已觀察確認)/.test(row.parts[7]) || !/(?:最後|帳單|押金|退款|設備|爭議|保管|紀錄)/.test([row.parts[7], row.parts[8]].join(" ")) || /(?:等待|尚未|未知|未解)/.test([row.parts[7], row.parts[8]].join(" "))));
      if (concludedWithoutConfirmation.length)
        return `服務結果已完成第 ${concludedWithoutConfirmation.map((row) => row.line).join("、")} 行必須記錄已觀察的業者確認，並檢查最後帳單、押金／退款、設備、爭議與資料保管，不能仍有等待狀態。`;
      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[11] === statusOrder[11] && !/(?:重新打開|重新檢視|若|如果|當|之後|搬家|住戶|新服務|供應改變|大樓改變|角色改變)/.test([row.parts[7], row.parts[8]].join(" ")));
      if (notApplicableWithoutTrigger.length)
        return `不適用第 ${notApplicableWithoutTrigger.map((row) => row.line).join("、")} 行必須寫目前理由，以及重新打開這項服務的住處、住戶、供應或責任變化。`;
      const earlyRowsClaimingCompletion = recordRows.filter((row) => statusOrder.slice(0, 7).includes(row.parts[11]) && /(?:全部驗證|帳戶有效|保證供應|已全額繳清|過戶完成|結清完成|沒有欠費)/.test([row.parts[2], row.parts[4], row.parts[5], row.parts[7], row.parts[8]].join(" ")));
      if (earlyRowsClaimingCompletion.length)
        return `仍開放的公用事業服務第 ${earlyRowsClaimingCompletion.map((row) => row.line).join("、")} 行不能宣稱全部驗證、帳戶有效、保證供應、已繳清、過戶或結清完成。`;
      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email、地址、公用事業帳戶、表號、帳單、案件或完整數字識別。請留在受保護原件，只在這裡放安全證據索引。";
      if (/密碼|通關密語|門禁碼|一次性代碼|驗證碼|安全答案|復原碼|完整地址|完整門牌|服務地址|電號|水號|瓦斯用戶號碼|網路客戶編號|公用事業帳號|完整帳號|客戶編號|電表編號|水表編號|瓦斯表號|設備序號|帳單條碼|帳單內容|對帳單內容|餘額金額|繳費金額|銀行帳戶|匯款帳號|卡號|信用卡|扣繳權杖|身分證字號|護照號碼|駕照號碼|身分文件|出生日期|戶名全名|客戶姓名|住戶姓名|完整姓名|私人帳戶網址|案件編號|申訴內容|私人通信|Email 內容|登入憑證|API 金鑰|設備精確位置|醫療設備明細|照護行程|簽名|password|passphrase|passcode|access code|one-time code|verification code|full address|service address|account number|customer number|meter number|bill barcode|balance amount|payment amount|bank account|card number|government id|customer name|full name|private portal|case number|complaint contents|private message|login credential|exact equipment location|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、地址、帳戶、表號、帳單、付款、身分、私人參與者、案件、通信或設備精確資料。請改寫成安全來源、流程或證據索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[11] === status).length })).filter((item) => item.count > 0);
      return `${values.review.trim()}｜家庭公用事業供應與服務交接紀錄\n核對情境：${values.context}\n服務清單／來源地圖基準：${formatter.format(baselineDate)}\n本次公用事業服務核對：${formatter.format(reviewDate)}\n下一次來源或交接核點：${formatter.format(nextReview)}\n仍開放的供應、責任、存取、狀態、安全或確認列：${openRows.length} 筆\n已核對、完成或不適用列：${closedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n供應單位、房屋、障礙、安全、主管機關與受保護資料來源地圖：${values.basis.trim()}\n\n${lines("有版本的公用事業供應與服務交接證據", recordRows.map((row) => `${row.parts[0]}｜服務／用途：${row.parts[1]}｜供應單位／地點適用：${row.parts[2]}｜來源核對日：${formatter.format(strictIsoDate(row.parts[3]) as Date)}｜戶名／責任：${row.parts[4]}｜官方存取／帳單／服務觀察：${row.parts[5]}｜障礙／安全入口：${row.parts[6]}｜開通／過戶／移機／停止／結算／交接與確認：${row.parts[7]}｜主管／申訴／差異來源：${row.parts[8]}｜負責角色：${row.parts[9]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[10]) as Date)}｜狀態：${row.parts[11]}`))}\n\n受保護帳單、確認、設備與核對歷程位置：${values.storage.trim()}\n\n這份輸出只是家庭來源與工作流程索引，不是公用事業帳戶、業者確認、帳單、付款紀錄、障礙通報或安全指示。它不搜尋、造訪、登入、讀表、下載用量，不辨識或驗證供應單位、服務範圍、地址、帳戶、戶名、授權、表號、費率、帳單、餘額、付款、押金、退款、契約、設備、開通、過戶、移機、停止、復供或結算，不送出申請、報修、申訴或歸還，不診斷公用事業狀況，不估算用量、費用、停電時間或恢復時間，不計算期限，不聯絡供應單位、房東／管委會、消防或主管機關，也不提供安全、財務、法律或監理意見。真實服務請使用實際供應單位與目前的消防、主管機關、房屋及合格專業來源。`;
    },
  },
  "appliance-manual-source-check-log": {
    intro:
      "Record exact-model evidence, the current manufacturer or authority source, document role, stated coverage, access result and a separate recall or safety-notice check. The tool does not search for or verify manuals, recalls or equipment.",
    fields: [
      text("review", "Private manual-source review reference", "Use a household code, not a person, address, account, full serial, registration, service case or exact protected location.", "MANUAL-2026-A"),
      {
        name: "context",
        label: "Manual-source review context",
        type: "select",
        options: [
          "First household appliance inventory",
          "New purchase, delivery or installation",
          "Maintenance-record setup",
          "Service, error or instruction follow-up",
          "Recall, correction or safety review",
          "Manufacturer or support-source migration",
          "Asset retirement, transfer or handoff",
        ],
      },
      { name: "baselineDate", label: "Appliance and source-map baseline date", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: "Current manual-source review date", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "Next source or access checkpoint", type: "date", value: "2026-09-14" },
      text("basis", "Manufacturer support, responsible-authority, recall and protected-evidence source map", "Use safe source/version IDs or dated public URLs. Keep full labels, serials, registrations, invoices, service messages and credentials protected.", "MFR-SUPPORT-M2; CPSC-RECALL-R1; LABEL-EVIDENCE-L2 protected; MANUAL-ARCHIVE-A1"),
      {
        name: "records",
        label: "Versioned appliance manual source and access rows",
        type: "textarea",
        help: "One line: ID | safe asset, household purpose and brand | exact-model evidence state | source checked date YYYY-MM-DD | official source, document role, language and version clue | stated model, suffix, region or configuration coverage | current access test and protected saved-copy state | recall or safety-notice source and discrepancy | owner role | target or outcome date YYYY-MM-DD | one of the eleven listed statuses. Maximum 14 lines.",
        value: "FRIDGE-1 | Kitchen refrigerator owner-operation and filter reference; example brand | Full model observed safely; complete rating-label evidence protected at LABEL-L2 | 2026-08-24 | Manufacturer product-support page SUPPORT-M2; owner manual; English; document ID OM-2026-07 | Manual states model EXAMPLE-X1 and X2; household X1 suffix compared in protected review | Product page and owner manual opened; title and coverage visible; saved-copy pointer MANUAL-A1 | CPSC recall search and manufacturer safety notices checked 2026-08-24; no discrepancy observed in this dated review | Household appliance-records role | 2026-08-24 | Source, coverage, access and notice routes reviewed\nLEGACY-1 | Legacy laundry appliance needs operating and safe-service source; example brand | Exact model observed safely; complete rating-label evidence protected at LABEL-L4 | 2026-08-23 | Current manufacturer and successor support routes checked; attributable owner manual not found | Coverage unresolved; third-party file is retained only as an unverified clue | Unofficial clue opened separately; no protected official saved copy claimed | CPSC recall search checked by brand and model on 2026-08-23; serial-range comparison remains protected and pending | Household appliance-records role | 2026-09-14 | Official source unavailable—manufacturer or authorized route pending",
      },
      text("storage", "Protected labels, full manuals, saved copies and review-history location", "Use a folder or process label. Do not enter full serials, addresses, accounts, registrations, invoices, service cases, private messages, credentials or file contents.", "Household assets / manual sources / MANUAL-2026-A / protected evidence"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.review.trim()) return "Enter a private manual-source review reference so this exported version can be identified.";
      if (!baselineDate) return "Enter the real appliance and source-map baseline date in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real current manual-source review date in YYYY-MM-DD format.";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The current manual-source review date cannot be in the future.";
      if (baselineDate.getTime() > reviewDate.getTime()) return "The appliance and source-map baseline cannot be later than the current review.";
      if (!nextReview) return "Enter a real next source or access checkpoint in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next source or access checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 12) return "Identify the manufacturer support, responsible-authority, recall and protected-evidence source map with safe pointers.";
      if (!values.storage.trim()) return "Enter the protected location for labels, full manuals, saved copies and review history.";
      const recordRows = values.records.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (recordRows.length === 0) return "Add at least one appliance and document-purpose row.";
      if (recordRows.length > 14) return "One manual-source review version supports at most 14 rows; freeze this version before starting another scope.";
      const invalidRows = recordRows.filter((row) => row.parts.length !== 11 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Manual-source line ${invalidRows.map((row) => row.line).join(", ")} must contain all eleven pipe-separated fields.`;
      const ids = recordRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Every manual-source row needs a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Use 2 to 20 letters, numbers or hyphens for each row ID, such as FRIDGE-1 or HVAC-MANUAL.";
      const statusOrder = [
        "Asset recorded—exact-model evidence pending",
        "Exact model recorded—official support source pending",
        "Official source located—document identity pending",
        "Document identified—stated model coverage pending",
        "Coverage compared—current access test pending",
        "Access tested—recall and safety sources pending",
        "Official source unavailable—manufacturer or authorized route pending",
        "Safety notice, recall or instruction conflict—responsible review pending",
        "Source, coverage, access and notice routes reviewed",
        "Asset retired or transferred—manual custody and remaining purpose recorded",
        "Not applicable—reason and reopen event recorded",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = recordRows.filter((row) => !statuses.has(row.parts[10]));
      if (invalidStatuses.length)
        return `Manual-source line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the eleven evidence statuses in the field instructions.`;
      const invalidSourceDates = recordRows.filter((row) => {
        const sourceDate = strictIsoDate(row.parts[3]);
        return !sourceDate || sourceDate.getTime() < baselineDate.getTime() || sourceDate.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return `Manual-source line ${invalidSourceDates.map((row) => row.line).join(", ")} needs a real source-checked date from the baseline through the current review.`;
      const openRows = recordRows.filter((row) => statusOrder.slice(0, 8).includes(row.parts[10]));
      const closedRows = recordRows.filter((row) => statusOrder.slice(8).includes(row.parts[10]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[9]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open manual-source line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next source or access checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[9]);
        return !outcome || outcome.getTime() < baselineDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Closed manual-source line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual outcome date from the baseline through this review.`;
      const missingLayers = recordRows.filter((row) => row.parts[1].length < 10 || row.parts[2].length < 10 || row.parts[4].length < 12 || row.parts[5].length < 8 || row.parts[6].length < 8 || row.parts[7].length < 10 || row.parts[8].length < 4);
      if (missingLayers.length)
        return `Manual-source line ${missingLayers.map((row) => row.line).join(", ")} needs a real asset purpose, model-evidence state, source/document identity, stated coverage, access result, separate notice check and owner.`;
      const completedWithoutEvidence = recordRows.filter((row) => row.parts[10] === statusOrder[8] && (!/(?:manufacturer|official|authority|regulator|support)/i.test(row.parts[4]) || /(?:pending|unknown|unresolved|not checked|not opened)/i.test([row.parts[5], row.parts[6], row.parts[7]].join(" ")) || !/(?:opened|loaded|visible|accessed)/i.test(row.parts[6]) || !/(?:recall|safety|notice|cpsc|regulator|authority)/i.test(row.parts[7])));
      if (completedWithoutEvidence.length)
        return `Completed source-review line ${completedWithoutEvidence.map((row) => row.line).join(", ")} must link an attributable source, stated coverage, observed access and a separate recall or safety-notice route with no unresolved state.`;
      const unavailableClaimingVerification = recordRows.filter((row) => row.parts[10] === statusOrder[6] && /\b(?:verified|confirmed|current official|fully applicable|complete)\b/i.test([row.parts[4], row.parts[5], row.parts[6]].join(" ")));
      if (unavailableClaimingVerification.length)
        return `Unavailable-source line ${unavailableClaimingVerification.map((row) => row.line).join(", ")} cannot claim that an unofficial clue is verified, current, fully applicable or complete.`;
      const conflictWithoutResponsibleRoute = recordRows.filter((row) => row.parts[10] === statusOrder[7] && (!/(?:recall|notice|warning|stop|conflict|contradict|correction)/i.test(row.parts[7]) || !/(?:manufacturer|authority|regulator|qualified|authorized|responsible|support)/i.test([row.parts[4], row.parts[7], row.parts[8]].join(" "))));
      if (conflictWithoutResponsibleRoute.length)
        return `Safety-conflict line ${conflictWithoutResponsibleRoute.map((row) => row.line).join(", ")} must name the observed notice or conflict and the responsible manufacturer, authority or qualified review route.`;
      const retiredWithoutCustody = recordRows.filter((row) => row.parts[10] === statusOrder[9] && !/(?:retired|transferred|handoff|custody|archive|remaining purpose|next owner)/i.test([row.parts[1], row.parts[6], row.parts[7]].join(" ")));
      if (retiredWithoutCustody.length)
        return `Retired or transferred line ${retiredWithoutCustody.map((row) => row.line).join(", ")} must record changed asset status, manual custody and any remaining purpose without exposing private evidence.`;
      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[10] === statusOrder[10] && !/(?:reopen|review again|if |when |after |new asset|new document|installation|transfer|role change)/i.test([row.parts[5], row.parts[6], row.parts[7]].join(" ")));
      if (notApplicableWithoutTrigger.length)
        return `Not-applicable line ${notApplicableWithoutTrigger.map((row) => row.line).join(", ")} must state the current reason and event that reopens this document role.`;
      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone, email, address, account, registration, serial, service case or complete numeric identifier was detected. Keep it protected and use a safe evidence pointer here.";
      if (/password|passphrase|passcode|access code|wifi password|network key|recovery code|verification code|registration token|account number|customer number|full serial|serial number\s*[:=]|production code\s*[:=]|full address|street address|service case|repair case|invoice contents|receipt contents|private message|login credential|api key|person name|customer name|resident name|exact location|label photo contents|manual file contents|full name|credit card|bank account|signature|date of birth|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, address, account, full serial, registration, service-case, invoice, private participant or protected file detail was detected. Replace it with a safe source, process or evidence pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[10] === status).length })).filter((item) => item.count > 0);
      return `${values.review.trim()} — appliance manual source check log\nReview context: ${values.context}\nAppliance/source-map baseline: ${formatter.format(baselineDate)}\nCurrent manual-source review: ${formatter.format(reviewDate)}\nNext source or access checkpoint: ${formatter.format(nextReview)}\nOpen model, source, coverage, access or safety rows: ${openRows.length}\nReviewed, retired or not-applicable rows: ${closedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nManufacturer support, responsible-authority, recall and protected-evidence source map: ${values.basis.trim()}\n\n${lines("Versioned appliance manual source evidence", recordRows.map((row) => `${row.parts[0]} — asset/purpose/brand: ${row.parts[1]} — exact-model evidence: ${row.parts[2]} — source checked: ${formatter.format(strictIsoDate(row.parts[3]) as Date)} — source/document/language/version: ${row.parts[4]} — stated coverage: ${row.parts[5]} — access/saved copy: ${row.parts[6]} — recall/safety route and discrepancy: ${row.parts[7]} — owner: ${row.parts[8]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[9]) as Date)} — status: ${row.parts[10]}`))}\n\nProtected labels, full manuals, saved copies and review-history location: ${values.storage.trim()}\n\nThis output is a household source index, not an operating, installation, maintenance, repair or safety instruction. It does not identify, move, open, disconnect or inspect equipment; visit a URL; search, open, download, upload, copy, hash, compare, update or preserve a document; read a rating label; verify a manufacturer, model, serial, production range, configuration, region, language, part, accessory, notice, recall, remedy or compatibility; contact support; authorize a task; release a stop-use instruction; or certify safety or closure. Use the current manufacturer, responsible safety authority, recall notice and qualified service source for the actual product.`;
    },
  },
  "household-utility-provider-service-handoff-log": {
    intro:
      "Record the serving-provider source, service-location fit, protected account responsibility, access and status observations, safety routes, move action and provider confirmation. The tool does not contact a utility or validate an account.",
    fields: [
      text("review", "Private utility-service review reference", "Use a household code, not a person, address, account, meter, case or exact protected location.", "UTILITY-HANDOFF-2026-A"),
      {
        name: "context",
        label: "Utility service review context",
        type: "select",
        options: [
          "First household utility map",
          "Household account-holder backup",
          "Move-in service start or transfer",
          "Move-out stop or final settlement",
          "Provider, owner or building responsibility change",
          "Current portal and service-status access check",
          "Outage, emergency or continuity-source review",
          "Billing, payment or service-status discrepancy",
          "Internet, phone or TV complaint preparation",
        ],
      },
      { name: "baselineDate", label: "Utility and source-map baseline date", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: "Current utility-service review date", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "Next source or handoff checkpoint", type: "date", value: "2026-09-14" },
      text("basis", "Provider, property, outage, emergency, regulator and protected-record source map", "Use safe source and evidence IDs or dated public URLs. Keep addresses, accounts, bills, cases, credentials and correspondence protected.", "UTILITY-OFFICIAL-P2; PROPERTY-SOURCE-B1; OUTAGE-SOURCE-E2; REGULATOR-R1; PROTECTED-SET-U2"),
      {
        name: "records",
        label: "Versioned utility provider and service handoff rows",
        type: "textarea",
        help: "One line: ID | safe service purpose and household role | serving-provider and service-location evidence | source checked date YYYY-MM-DD | account, occupant, owner or building responsibility state | official access plus billing or service-status observation | emergency, outage and safety-source route | start, transfer, stop, settlement or routine handoff action and provider confirmation | regulator, complaint or dispute source and unresolved gap | owner role | target or outcome date YYYY-MM-DD | one of the twelve listed statuses. Maximum 14 lines.",
        value: "ELEC-1 | Primary-home electricity service; household utility-records role | Official utility bill source and current service-area page support serving-provider fit; protected evidence UTIL-P2 | 2026-08-24 | Resident account-holder role observed in protected provider record; backup role has index access only | Official portal opened; current statement and service status visible; payment result not inferred from settings | Utility official outage page, provider safety source and local emergency route mapped on this review date | Existing service retained; no move request open; reopen on occupancy, provider, responsibility or access change | Provider complaint route and applicable state regulator source mapped; no source gap observed in this dated review | Household utility-records role | 2026-08-24 | Provider source, responsibility, access, status and handoff reviewed\nNET-MOVE-1 | Prior-home internet service; move-out stop and rented-equipment follow-up | Official provider statement source supports prior-location service; protected evidence NET-P1 | 2026-08-23 | Resident account-holder role observed in protected provider record; equipment custody assigned | Official account source opened; current statement visible; service stop result not yet observed | Provider outage and service-status routes mapped; local emergency route remains separate from internet support | Official stop request recorded; provider confirmation, final statement and rented-equipment result pending | Provider complaint source and FCC consumer route mapped; final billing or equipment discrepancy not yet determined | Household communications-records role | 2026-09-14 | Start, transfer, stop or settlement request recorded—provider confirmation pending",
      },
      text("storage", "Protected statements, confirmations, equipment and review-history location", "Use a folder or process label. Do not enter names, addresses, accounts, meters, bills, balances, payment data, credentials, cases, private messages or exact equipment locations.", "Household records / utility services / UTILITY-HANDOFF-2026-A / protected provider evidence"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.review.trim()) return "Enter a private utility-service review reference so this exported version can be identified.";
      if (!baselineDate) return "Enter the real utility and source-map baseline date in YYYY-MM-DD format.";
      if (!reviewDate) return "Enter a real current utility-service review date in YYYY-MM-DD format.";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "The current utility-service review date cannot be in the future.";
      if (baselineDate.getTime() > reviewDate.getTime()) return "The utility and source-map baseline cannot be later than the current review.";
      if (!nextReview) return "Enter a real next source or handoff checkpoint in YYYY-MM-DD format.";
      if (nextReview.getTime() < reviewDate.getTime()) return "The next source or handoff checkpoint cannot be earlier than the current review.";
      if (values.basis.trim().length < 12) return "Identify the provider, property, outage, emergency, regulator and protected-record source map with safe pointers.";
      if (!values.storage.trim()) return "Enter the protected location for statements, confirmations, equipment and review history.";
      const recordRows = values.records.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (recordRows.length === 0) return "Add at least one utility service purpose and handoff relationship row.";
      if (recordRows.length > 14) return "One utility-service review version supports at most 14 rows; freeze this version before starting another scope.";
      const invalidRows = recordRows.filter((row) => row.parts.length !== 12 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `Utility-service line ${invalidRows.map((row) => row.line).join(", ")} must contain all twelve pipe-separated fields.`;
      const ids = recordRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "Every utility-service row needs a unique ID.";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "Use 2 to 20 letters, numbers or hyphens for each row ID, such as ELEC-1 or WATER-MOVE.";
      const statusOrder = [
        "Service purpose recorded—serving provider pending",
        "Serving provider recorded—service-location fit pending",
        "Service-location fit recorded—account responsibility pending",
        "Account responsibility recorded—current official access pending",
        "Official access tested—billing and service status pending",
        "Billing or service status observed—emergency and outage routes pending",
        "Emergency and outage routes mapped—move or handoff action pending",
        "Start, transfer, stop or settlement request recorded—provider confirmation pending",
        "Provider, status, billing, safety or responsibility conflict—responsible source review pending",
        "Provider source, responsibility, access, status and handoff reviewed",
        "Service started, transferred, stopped or settled—observed confirmation and custody recorded",
        "Not applicable—reason and reopen event recorded",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = recordRows.filter((row) => !statuses.has(row.parts[11]));
      if (invalidStatuses.length)
        return `Utility-service line ${invalidStatuses.map((row) => row.line).join(", ")} must use one of the twelve evidence statuses in the field instructions.`;
      const invalidSourceDates = recordRows.filter((row) => {
        const sourceDate = strictIsoDate(row.parts[3]);
        return !sourceDate || sourceDate.getTime() < baselineDate.getTime() || sourceDate.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return `Utility-service line ${invalidSourceDates.map((row) => row.line).join(", ")} needs a real source-checked date from the baseline through the current review.`;
      const openRows = recordRows.filter((row) => statusOrder.slice(0, 9).includes(row.parts[11]));
      const closedRows = recordRows.filter((row) => statusOrder.slice(9).includes(row.parts[11]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[10]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `Open utility-service line ${invalidOpenDates.map((row) => row.line).join(", ")} needs a target date from this review through the next source or handoff checkpoint.`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[10]);
        return !outcome || outcome.getTime() < baselineDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `Closed reviewed, completed or not-applicable utility-service line ${invalidClosedDates.map((row) => row.line).join(", ")} needs an actual outcome date from the baseline through this review.`;
      const missingLayers = recordRows.filter((row) => row.parts[1].length < 8 || row.parts[2].length < 12 || row.parts[4].length < 10 || row.parts[5].length < 12 || row.parts[6].length < 10 || row.parts[7].length < 12 || row.parts[8].length < 10 || row.parts[9].length < 4);
      if (missingLayers.length)
        return `Utility-service line ${missingLayers.map((row) => row.line).join(", ")} needs a real service purpose, serving source, responsibility, access/status observation, safety route, handoff action, complaint source and owner.`;
      const completedWithoutEvidence = recordRows.filter((row) => row.parts[11] === statusOrder[9] && (!/(?:official|provider|utility|municipal|building|lease|statement|bill source|service-area)/i.test(row.parts[2]) || !/(?:account-holder|resident|occupant|owner|landlord|building|association|responsib)/i.test(row.parts[4]) || !/(?:opened|accessed|visible|observed)/i.test(row.parts[5]) || !/(?:statement|billing|payment|service|active|status)/i.test(row.parts[5]) || !/(?:outage|emergency|safety|911|hazard)/i.test(row.parts[6]) || !/(?:handoff|retained|reopen|move|start|transfer|stop|settlement|responsibility|access change)/i.test(row.parts[7]) || !/(?:complaint|regulator|commission|fcc|consumer|provider)/i.test(row.parts[8]) || /(?:pending|unknown|unresolved|not checked|not opened|conflict|missing)/i.test([row.parts[2], row.parts[4], row.parts[5], row.parts[6], row.parts[7], row.parts[8]].join(" "))));
      if (completedWithoutEvidence.length)
        return `Completed utility-service review line ${completedWithoutEvidence.map((row) => row.line).join(", ")} must link an attributable serving source, responsibility, actual access and status observation, safety routes, handoff or reopen rule and complaint source with no unresolved gap.`;
      const requestClaimingCompletion = recordRows.filter((row) => row.parts[11] === statusOrder[7] && (/(?:confirmed complete|completed|service ended|settled|final balance cleared|equipment returned)/i.test(row.parts[7]) || !/(?:request|submitted|recorded|pending|awaiting)/i.test(row.parts[7])));
      if (requestClaimingCompletion.length)
        return `Submitted-request line ${requestClaimingCompletion.map((row) => row.line).join(", ")} must remain open and describe the request plus pending provider confirmation, not claim the service or settlement is complete.`;
      const conflictWithoutResponsibleRoute = recordRows.filter((row) => row.parts[11] === statusOrder[8] && (!/(?:conflict|dispute|different|mismatch|hazard|unsafe|outage|unknown responsibility|unexpected)/i.test([row.parts[5], row.parts[6], row.parts[7], row.parts[8]].join(" ")) || !/(?:provider|utility|building|landlord|authority|regulator|emergency|911|qualified|responsible)/i.test([row.parts[6], row.parts[7], row.parts[8], row.parts[9]].join(" "))));
      if (conflictWithoutResponsibleRoute.length)
        return `Conflict line ${conflictWithoutResponsibleRoute.map((row) => row.line).join(", ")} must name the observed provider, status, billing, safety or responsibility conflict and the responsible review route.`;
      const concludedWithoutConfirmation = recordRows.filter((row) => row.parts[11] === statusOrder[10] && (!/(?:provider confirmation|official confirmation|official result|final statement|completion notice|observed confirmation)/i.test(row.parts[7]) || !/(?:final|statement|deposit|refund|equipment|dispute|custody|record)/i.test([row.parts[7], row.parts[8]].join(" ")) || /(?:pending|awaiting|unknown|unresolved)/i.test([row.parts[7], row.parts[8]].join(" "))));
      if (concludedWithoutConfirmation.length)
        return `Completed service-result line ${concludedWithoutConfirmation.map((row) => row.line).join(", ")} must record observed provider confirmation and screen final statement, deposit or refund, equipment, dispute and record custody without a pending claim.`;
      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[11] === statusOrder[11] && !/(?:reopen|review again|if |when |after |move|occupancy|new service|provider change|building change|role change)/i.test([row.parts[7], row.parts[8]].join(" ")));
      if (notApplicableWithoutTrigger.length)
        return `Not-applicable line ${notApplicableWithoutTrigger.map((row) => row.line).join(", ")} must state the current reason and property, occupancy, service or responsibility change that reopens it.`;
      const earlyRowsClaimingCompletion = recordRows.filter((row) => statusOrder.slice(0, 7).includes(row.parts[11]) && /(?:fully verified|account valid|service guaranteed|paid in full|transfer complete|settled|no balance)/i.test([row.parts[2], row.parts[4], row.parts[5], row.parts[7], row.parts[8]].join(" ")));
      if (earlyRowsClaimingCompletion.length)
        return `Open utility-service line ${earlyRowsClaimingCompletion.map((row) => row.line).join(", ")} cannot claim a fully verified account, guaranteed service, paid balance, completed transfer or settlement.`;
      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "A possible full phone, email, address, utility account, meter, bill, case or complete numeric identifier was detected. Keep it protected and use a safe evidence pointer here.";
      if (/password|passphrase|passcode|access code|one-time code|verification code|security answer|recovery code|full address|street address|service address|account number|customer number|utility account|meter number|device serial|bill barcode|statement contents|bill contents|balance amount|payment amount|bank account|routing number|card number|credit card|payment credential|autopay token|government id|social security|driver license|passport|identity document|date of birth|customer name|resident name|account holder name|full name|private portal|private url|case number|ticket number|complaint contents|private message|email contents|login credential|api key|exact equipment location|medical device details|care schedule|signature|ssn|\bpin\s*[:=]/i.test(privacyText))
        return "A possible credential, address, account, meter, bill, payment, identity, private participant, case, communication or exact equipment detail was detected. Replace it with a safe source, process or evidence pointer.";
      const formatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[11] === status).length })).filter((item) => item.count > 0);
      return `${values.review.trim()} — household utility provider and service handoff log\nReview context: ${values.context}\nUtility/source-map baseline: ${formatter.format(baselineDate)}\nCurrent utility-service review: ${formatter.format(reviewDate)}\nNext source or handoff checkpoint: ${formatter.format(nextReview)}\nOpen provider, responsibility, access, status, safety or confirmation rows: ${openRows.length}\nReviewed, completed or not-applicable rows: ${closedRows.length}\nStatus count: ${statusCounts.map((item) => `${item.status} ${item.count}`).join("; ")}\n\nProvider, property, outage, emergency, regulator and protected-record source map: ${values.basis.trim()}\n\n${lines("Versioned utility provider and service handoff evidence", recordRows.map((row) => `${row.parts[0]} — service/purpose: ${row.parts[1]} — serving provider/location fit: ${row.parts[2]} — source checked: ${formatter.format(strictIsoDate(row.parts[3]) as Date)} — account/responsibility: ${row.parts[4]} — official access/billing/service observation: ${row.parts[5]} — emergency/outage/safety route: ${row.parts[6]} — start/transfer/stop/settlement/handoff and confirmation: ${row.parts[7]} — regulator/complaint/dispute source: ${row.parts[8]} — owner: ${row.parts[9]} — target/outcome date: ${formatter.format(strictIsoDate(row.parts[10]) as Date)} — status: ${row.parts[11]}`))}\n\nProtected statements, confirmations, equipment and review-history location: ${values.storage.trim()}\n\nThis output is a household source and workflow index, not a utility account, provider confirmation, bill, payment record, outage report or safety instruction. It does not search, visit, sign in, read a meter, download usage, identify or validate a provider, service area, address, account, customer, authorization, meter, rate, bill, balance, payment, deposit, refund, contract, equipment, start, transfer, stop, restoration or settlement; submit a request, report, complaint or return; diagnose a utility condition; estimate usage, cost, outage duration or restoration; calculate a deadline; contact a provider, building, emergency service or regulator; or provide safety, financial, legal or regulatory advice. Use the provider actually serving the location and the current emergency, authority, building and qualified-professional sources.`;
    },
  },
  "vacation-shutdown-checklist-generator": {
    intro:
      "Create a pre-travel household list. Follow local authority, manufacturer and insurance guidance for property-specific precautions.",
    fields: [
      { name: "days", label: "Days away", type: "number", value: "7" },
      text("care", "Care responsibilities", "", "Cat, houseplants, packages"),
    ],
    run: (v) =>
      lines(`${v.days}-day trip shutdown`, [
        "Confirm doors, windows and household-defined security steps",
        "Review weather and official local alerts",
        "Assign mail, package, pet and plant responsibilities",
        "Remove time-sensitive food and waste",
        "Confirm safe settings using equipment manuals",
        "Keep utility/emergency contacts available offline",
        ...list(v.care).map((item) => `Handoff details for ${item}`),
        "On return: inspect condition and close temporary tasks",
      ]),
  },
  "house-sitter-instruction-generator": {
    intro:
      "Create a concise, printable handoff. Keep passwords and highly sensitive records elsewhere.",
    fields: [
      text("contact", "Primary contact", "", "Name and safe contact method"),
      {
        name: "routine",
        label: "Daily home and pet routine",
        type: "textarea",
        value: "Morning: feed cat\nEvening: bring in packages",
      },
      text(
        "services",
        "Useful service contacts",
        "",
        "Building manager, trusted neighbor",
      ),
    ],
    run: (v) =>
      `${lines("House-sitter instructions", [`Primary contact: ${v.contact || "Add a contact"}`, ...list(v.routine)])}\n\n${lines("If something changes", [`Useful contacts: ${v.services || "Add safe service contacts"}`, "For an emergency, use official local services first", "Do not share or photograph private household records"])}`,
  },
  "pet-sitter-instruction-generator": {
    intro:
      "Build a pet routine summary. A veterinarian remains the source for medical instructions.",
    fields: [
      text("pets", "Pet names and species", "", "Milo — cat"),
      {
        name: "routine",
        label: "Feeding and routine",
        type: "textarea",
        value: "07:00 breakfast\n19:00 dinner\nRefresh water daily",
      },
      text(
        "vet",
        "Veterinary and emergency contact",
        "",
        "Clinic name and phone",
      ),
      text(
        "meds",
        "Medication reference",
        "Use only written veterinarian instructions.",
        "",
      ),
    ],
    run: (v) =>
      `${lines(`Pet handoff: ${v.pets || "Add pets"}`, list(v.routine))}\n\nVeterinary contact: ${v.vet || "Add contact"}\nMedication reference: ${v.meds || "None listed"}\n\nFollow the veterinarian's written instructions. Contact the owner or appropriate emergency service if the pet's condition changes.`,
  },
  "warranty-checklist-generator": {
    intro:
      "Generate the record fields worth capturing while the receipt and packaging are still available.",
    fields: [
      text("item", "Item", "", "Refrigerator"),
      text("seller", "Seller", "", ""),
      { name: "date", label: "Purchase date", type: "date" },
    ],
    run: (v) =>
      lines(`${v.item || "Item"} warranty record`, [
        `Purchase date: ${v.date || "Record date"}`,
        `Seller: ${v.seller || "Record seller"}`,
        "Exact brand, model and serial number",
        "Receipt location and payment proof reference (not full card data)",
        "Written warranty term and coverage source",
        "Registration completed only if actually required",
        "Support contact and claim procedure",
        "Review date before coverage expires",
      ]),
  },
  "receipt-retention-organizer": {
    intro:
      "Sort receipts by the job they support. This tool does not provide legal or tax retention advice.",
    fields: [
      text("item", "Purchase or project", "", "Dishwasher"),
      {
        name: "purpose",
        label: "Primary purpose",
        type: "select",
        options: [
          "Warranty",
          "Return window",
          "Home inventory",
          "Repair history",
          "Tax or legal record — verify official rules",
        ],
      },
      { name: "purchase", label: "Purchase date", type: "date" },
      {
        name: "months",
        label: "Known review period in months",
        type: "number",
        value: "12",
      },
    ],
    run: (v) => {
      const start = date(v.purchase);
      const review = start ? addMonths(start, Number(v.months || 0)) : null;
      return `${v.item || "Receipt"}\nCategory: ${v.purpose}\nReview date: ${review ? fmt(review) : "Add a purchase date"}\nStore with: item record, warranty/return terms and related service history.\n\nFor tax, insurance or legal records, follow the applicable authority or professional advice.`;
    },
  },
  "household-document-index-generator": {
    intro:
      "Build an index of where records belong without uploading or exposing the records themselves.",
    fields: [
      text(
        "categories",
        "Document categories",
        "",
        "Home purchase or lease, Insurance, Appliances, Repairs, Utilities, Emergency",
      ),
      text(
        "location",
        "Primary storage label",
        "",
        "Encrypted drive / physical binder",
      ),
    ],
    run: (v) =>
      lines(
        `Household document index — ${v.location || "choose a storage location"}`,
        list(v.categories).map(
          (category) =>
            `${category}/ — owner, current version, renewal/review date and backup location`,
        ),
      ),
  },
  "emergency-contact-sheet-generator": {
    intro:
      "Generate a quick-contact sheet. Confirm current official local emergency numbers before printing.",
    fields: [
      {
        name: "contacts",
        label: "Contacts",
        type: "textarea",
        value:
          "Household contact | Name | Phone\nUtility provider | Provider | Outage number\nVeterinarian | Clinic | Phone",
      },
    ],
    run: (v) =>
      `${lines(
        "Emergency contact sheet",
        v.contacts
          .split("\n")
          .filter(Boolean)
          .map((row) =>
            row
              .split("|")
              .map((part) => part.trim())
              .join(" — "),
          ),
      )}\n\nAdd the current official emergency number and local authority guidance for your location. Review dates and keep the sheet where intended users can reach it.`,
  },
  "appliance-maintenance-checklist-generator": {
    intro:
      "Generate a conservative starter checklist that makes the model manual—not a generic webpage—the source of truth.",
    fields: [
      {
        name: "appliance",
        label: "Appliance type",
        type: "select",
        options: [
          "Refrigerator",
          "Dishwasher",
          "Washing machine",
          "Dryer",
          "Air conditioner",
          "Water heater",
          "Other",
        ],
      },
      text("model", "Brand / model reference", "", ""),
    ],
    run: (v) =>
      lines(
        `${v.appliance} maintenance starter — ${v.model || "record the exact model"}`,
        [
          "Save the official manual and support page",
          "Identify only user-serviceable cleaning/filter tasks in the manual",
          "Record the correct consumable/part identifiers",
          "Create condition and performance observations",
          "Separate qualified service from user maintenance",
          "Record completion, cost, provider and next due date",
          "Stop and use qualified help for electrical, gas, refrigerant or other hazardous work",
        ],
      ),
  },
  "home-handoff-summary-generator": {
    intro:
      "Turn recurring household responsibilities into a concise handoff. Omit passwords, sensitive documents and private notes.",
    fields: [
      text("person", "Handoff recipient", "", "Partner backup"),
      {
        name: "tasks",
        label: "Responsibilities and due dates",
        type: "textarea",
        value: "Friday | Put bins out\nAug 28 | HVAC service appointment",
      },
      text("contacts", "Safe contacts", "", "Building manager, plumber"),
      text(
        "omitted",
        "Private information intentionally omitted",
        "",
        "Passwords, medical records",
      ),
    ],
    run: (v) =>
      `${lines(`Household handoff for ${v.person || "recipient"}`, list(v.tasks))}\n\nSafe contacts: ${v.contacts || "Add contacts"}\nIntentionally omitted: ${v.omitted || "List private categories"}\nGenerated: ${new Date().toLocaleDateString()}\n\nConfirm all time-sensitive details before sharing.`,
  },
  "household-vehicle-document-source-status-log": {
    ...vehicleDocumentDefinition("en"),
  },
  "household-pet-record-source-handoff-log": {
    ...petRecordDefinition("en"),
  },
  "household-school-record-source-handoff-log": {
    ...schoolRecordDefinition("en"),
  },
  "household-medical-information-source-handoff-log": {
    ...medicalInformationDefinition("en"),
  },
  "caregiver-handoff-source-authorization-log": {
    ...caregiverHandoffDefinition("en"),
  },
  "home-care-visit-scope-service-result-log": {
    ...homeCareVisitDefinition("en"),
  },
  "home-care-service-plan-change-notice-log": {
    ...homeCareServiceChangeDefinition("en"),
  },
  "home-care-service-interruption-backup-continuity-log": {
    ...homeCareInterruptionDefinition("en"),
  },
  "home-care-complaint-response-resolution-log": {
    ...homeCareComplaintDefinition("en"),
  },
  "home-care-charge-service-payment-discrepancy-log": {
    ...homeCareChargeDefinition("en"),
  },
  "home-care-payment-refund-collection-notice-log": {
    ...homeCareNoticeDefinition("en"),
  },
};

const zhTwDefinitions: Record<string, Definition> = {
  "household-utility-provider-service-handoff-log":
    definitions["__zh-tw-household-utility-provider-service-handoff-log"],
  "household-vehicle-document-source-status-log": {
    ...vehicleDocumentDefinition("zh-TW"),
  },
  "household-pet-record-source-handoff-log": {
    ...petRecordDefinition("zh-TW"),
  },
  "household-school-record-source-handoff-log": {
    ...schoolRecordDefinition("zh-TW"),
  },
  "household-medical-information-source-handoff-log": {
    ...medicalInformationDefinition("zh-TW"),
  },
  "caregiver-handoff-source-authorization-log": {
    ...caregiverHandoffDefinition("zh-TW"),
  },
  "home-care-visit-scope-service-result-log": {
    ...homeCareVisitDefinition("zh-TW"),
  },
  "home-care-service-plan-change-notice-log": {
    ...homeCareServiceChangeDefinition("zh-TW"),
  },
  "home-care-service-interruption-backup-continuity-log": {
    ...homeCareInterruptionDefinition("zh-TW"),
  },
  "home-care-complaint-response-resolution-log": {
    ...homeCareComplaintDefinition("zh-TW"),
  },
  "home-care-charge-service-payment-discrepancy-log": {
    ...homeCareChargeDefinition("zh-TW"),
  },
  "home-care-payment-refund-collection-notice-log": {
    ...homeCareNoticeDefinition("zh-TW"),
  },
  "home-inventory-checklist-generator": {
    intro:
      "依台灣家庭常見空間產生住宅財物盤點起始表，並保留照片、型號、單據與複查欄位。這不是估價或理賠保證。",
    fields: [
      text("household", "家庭或盤點範圍", "可用住家暱稱，不必填完整地址。", "目前住家"),
      {
        name: "rooms",
        label: "要盤點的空間",
        type: "textarea",
        help: "每行或逗號分隔；支援客廳、廚房、臥室、浴室、洗衣區、書房、陽台、車庫／儲藏室及機電／設備區，也可自訂。",
        value: "客廳\n廚房\n洗衣區",
      },
      { name: "reviewed", label: "本次盤點日期", type: "date" },
    ],
    run: (values) => {
      const rooms = uniqueList(values.rooms);
      const canonicalRooms = rooms
        .map(
          (room) =>
            zhTwInventoryAliases[room.toLocaleLowerCase("zh-TW")] || room,
        )
        .filter(
          (room, index, all) =>
            all.findIndex(
              (candidate) =>
                candidate.toLocaleLowerCase("zh-TW") ===
                room.toLocaleLowerCase("zh-TW"),
            ) === index,
        );
      const reviewed = date(values.reviewed);
      if (!values.household.trim()) return "請填寫家庭或盤點範圍，讓列印後的清單仍能辨識用途。";
      if (rooms.length === 0) return "請至少輸入一個要盤點的空間。";
      if (canonicalRooms.length > 12) return "一次最多產生 12 個空間；請先完成一區，再建立下一份清單。";
      if (!reviewed) return "請輸入有效的本次盤點日期。";
      const format = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" }).format(reviewed);
      const general = ["主要家具與固定配件", "電子、電器與有型號的設備", "有保固、單據或較高價值的物品", "需要照片或特徵才能辨認的其他物品"];
      const sections = canonicalRooms.map((canonical) => {
        const items = zhTwInventoryAreas[canonical] || general;
        const custom = zhTwInventoryAreas[canonical] ? "" : "（自訂空間，使用通用分類）";
        return `【${canonical}${custom}】\n${items.map((item) => `• ${item}`).join("\n")}`;
      });
      return `${values.household.trim()}｜住宅財物盤點起始清單\n本次盤點：${format}\n空間數：${canonicalRooms.length}\n\n${sections.join("\n\n")}\n\n每一項實際物品至少補上：清楚名稱、所在空間、品牌／型號／序號（如適用）、數量、取得日期與依據、照片日期、購買或保固文件位置，以及最後複查日期。不要在公開或共享清單寫入密碼、完整證件號碼或不必要的住址細節。\n\n這份結果只協助建立盤點順序，不會估算現值、重置成本、承保範圍或可理賠金額。需要投保、報稅或災損申請時，請另依實際保單與主管機關要求準備資料。`;
    },
  },
  "household-document-index-generator": {
    intro:
      "建立紙本與數位文件的位置索引，不必上傳文件內容。產生後可逐類補上版本、負責角色、備份位置與複查狀態。",
    fields: [
      {
        name: "categories",
        label: "文件分類",
        type: "textarea",
        help: "每行或逗號分隔；分類應回答家人會找什麼，不要只寫 PDF 或年份。",
        value: "住宅與租約\n家電購買與保固\n保險聯絡與保單位置\n維修與裝修\n公用事業與帳單\n緊急與照護",
      },
      text("owner", "索引複查負責角色", "可填角色，不必填真名。", "家庭資料整理人"),
      text("primaryLocation", "原始文件主要位置", "只寫家人找得到的安全位置標籤，不要填密碼。", "紙本：書房文件櫃；數位：加密雲端／家庭文件"),
      text("backupLocation", "備份或替代取得位置", "沒有備份時請明確填『尚未建立』。", "離線加密備份／家庭文件"),
      { name: "review", label: "下次索引複查日期", type: "date" },
    ],
    run: (values) => {
      const categories = uniqueList(values.categories);
      const review = date(values.review);
      if (categories.length === 0) return "請至少輸入一個文件分類。";
      if (categories.length > 15) return "一次最多整理 15 個分類；請先完成這一批並確認位置，再建立下一份。";
      if (!values.owner.trim()) return "請填寫索引複查負責角色。";
      if (!values.primaryLocation.trim()) return "請填寫原始文件主要位置；不要在這裡輸入密碼。";
      if (!values.backupLocation.trim()) return "請填寫備份位置，或明確寫『尚未建立』。";
      if (!review) return "請輸入有效的下次索引複查日期。";
      const format = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" }).format(review);
      const sameLocation = values.primaryLocation.trim().toLocaleLowerCase("zh-TW") === values.backupLocation.trim().toLocaleLowerCase("zh-TW");
      const rows = categories.map((category) => `【${category}】\n• 負責角色：${values.owner.trim()}\n• 原始文件主要位置：${values.primaryLocation.trim()}\n• 備份或替代取得位置：${values.backupLocation.trim()}\n• 最新版本／文件日期：待逐項補上\n• 可否由備援家人取得：待確認\n• 下次複查：${format}`);
      return `家庭文件索引初稿\n分類數：${categories.length}\n\n${rows.join("\n\n")}\n\n${sameLocation ? "注意：主要位置與備份位置完全相同；這個標籤不能證明已有獨立備份，請確認是否需要不同媒體或異地副本。\n\n" : ""}這是文件地圖，不是檔案庫。請勿寫入密碼、載具驗證碼、完整身分證號、醫療內容或金融帳號；FamilyBoard 也不會讀取、同步或備份索引所指向的原始檔案。`;
    },
  },
  "appliance-maintenance-checklist-generator": {
    intro:
      "依家電種類產生不同的說明書核對與異常紀錄提示。它不會發明通用保養週期，也不會提供拆機步驟。",
    fields: [
      {
        name: "appliance",
        label: "家電種類",
        type: "select",
        options: ["冰箱", "洗衣機", "乾衣機", "洗碗機", "冷氣", "除濕機", "熱水器", "抽油煙機", "其他"],
      },
      text("identity", "家電識別名稱", "寫到家人能找到同一台設備，最好包含位置或型號。", "廚房冰箱／型號待補"),
      text("source", "實際依據位置", "填原廠說明書、官方支援頁或服務紀錄的位置，不要只寫『網路文章』。", "紙本說明書：書房家電資料夾"),
      { name: "reviewed", label: "本次複查日期", type: "date" },
    ],
    run: (values) => {
      const appliance = values.appliance || "其他";
      const reviewed = date(values.reviewed);
      if (!values.identity.trim()) return "請填寫能辨識實際設備的家電名稱。";
      if (!values.source.trim()) return "請填寫實際說明書、原廠支援頁或服務紀錄的位置。";
      if (!reviewed) return "請輸入有效的本次複查日期。";
      const format = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" }).format(reviewed);
      const prompts = zhTwAppliancePrompts[appliance] || zhTwAppliancePrompts.其他;
      return `${values.identity.trim()}｜${appliance}維護來源核對清單\n本次複查：${format}\n實際依據：${values.source.trim()}\n\n${prompts.map((item) => `• ${item}`).join("\n")}\n\n完成時記錄：看到的狀態、已執行的說明書項目、使用的零件或服務單號、處理人／業者、費用與下次核對依據。\n\n遇到焦味、冒煙、漏電、瓦斯或冷媒異常、異常高溫或其他危險徵象時，應先停止使用並尋求適當專業協助。不要把這份清單當成拆解、瓦斯、冷媒或電氣作業教程。`;
    },
  },
  "home-maintenance-schedule-generator": {
    intro:
      "把家中實際設備整理成可複查的起始排程。工具不會替原廠說明書發明保養週期，產生後仍要逐項補上真正依據。",
    fields: [
      {
        name: "systems",
        label: "設備或系統",
        type: "textarea",
        help: "每行或逗號分隔一項。",
        value: "冷氣濾網\n冰箱\n住宅用火災警報器",
      },
      text("owner", "主要複查人", "可以填姓名、角色或「全家共同」。", "全家共同"),
      {
        name: "cadence",
        label: "整份清單複查頻率",
        type: "select",
        options: ["每月複查", "每季複查", "每半年複查"],
      },
      { name: "start", label: "第一次複查日期", type: "date" },
    ],
    run: (values) => {
      const systems = list(values.systems);
      const start = date(values.start);
      if (systems.length === 0) return "請至少輸入一項家中實際存在的設備或系統。";
      if (!start) return "請輸入有效的第一次複查日期。";
      const cadenceMonths: Record<string, number> = {
        每月複查: 1,
        每季複查: 3,
        每半年複查: 6,
      };
      const cadence = values.cadence || "每月複查";
      const next = addMonths(start, cadenceMonths[cadence] || 1);
      const format = (value: Date) =>
        new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" }).format(value);
      return `${cadence}起始表\n負責人：${values.owner || "尚未指定"}\n第一次複查：${format(start)}\n下一次整表複查：${format(next)}\n\n${systems
        .flatMap((item) => [
          `• ${item}：確認型號、說明書與真正適用的檢查／保養依據。`,
          `  完成時記錄日期、狀況、費用、異常與下一個到期條件。`,
        ])
        .join("\n")}\n\n這是整份清單的複查節奏，不是每項設備的保養週期。涉及電力、瓦斯、冷媒、消防、結構或高處作業時，只記錄異常與聯絡合格專業人員，不要依通用清單自行拆修。`;
    },
  },
  "warranty-expiration-calculator": {
    intro:
      "依你確認的保固起算日與書面月數，計算預估期間終點及提前複查日；實際權利仍以保證書與適用規則為準。",
    fields: [
      { name: "purchase", label: "保固起算日", type: "date" },
      {
        name: "months",
        label: "保固月數",
        type: "number",
        value: "12",
      },
      {
        name: "reviewDays",
        label: "到期前幾天複查",
        type: "number",
        value: "30",
      },
    ],
    run: (values) => {
      const start = date(values.purchase);
      if (!start) return "請輸入有效的保固起算日。";
      const end = addMonths(start, Number(values.months || 0));
      const review = new Date(end);
      review.setDate(review.getDate() - Number(values.reviewDays || 0));
      const format = (value: Date) =>
        new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" }).format(value);
      return `預估期間終點：${format(end)}\n建議複查日：${format(review)}\n\n請以書面保證確認涵蓋範圍、起算方式、登錄要求與真正的截止規則。`;
    },
  },
  "appliance-age-calculator": {
    intro:
      "用已知的購買日或安裝日計算家電經過幾年幾個月。結果只整理時間，不會用年齡猜故障日或建議你直接汰換。",
    fields: [
      text("name", "家電名稱", "寫到家人能辨認同一台設備。", "廚房冰箱"),
      { name: "start", label: "購買或安裝日期", type: "date" },
      {
        name: "basis",
        label: "這個日期的依據",
        type: "select",
        options: ["購買日（有單據）", "安裝日（有紀錄）", "約略日期"],
      },
    ],
    run: (values) => {
      const start = date(values.start);
      if (!start) return "請輸入有效的購買或安裝日期。";
      const today = new Date();
      if (start.valueOf() > today.valueOf())
        return "購買或安裝日期不能晚於今天；若是預計安裝日期，請等實際完成後再建立年齡紀錄。";
      let months =
        (today.getFullYear() - start.getFullYear()) * 12 +
        today.getMonth() -
        start.getMonth();
      if (today.getDate() < start.getDate()) months -= 1;
      months = Math.max(0, months);
      const format = (value: Date) =>
        new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" }).format(value);
      return `${values.name || "家電"}目前年齡：${Math.floor(months / 12)} 年 ${months % 12} 個月\n起算日：${format(start)}\n日期依據：${values.basis || "尚未註明"}\n\n這是日曆經過時間，不是故障機率或剩餘壽命。請把型號、序號、保固、異常、耗能與維修歷程放在同一筆設備紀錄後再做判斷；若日期只是估計值，分享或列印時也要保留「約略」標示。`;
    },
  },
  "household-subscription-cost-calculator": {
    intro:
      "將每週、每月、每季與每年扣款換算成同一個月均與年總額。只做你輸入資料的算術整理，不會連接銀行或判斷哪一項應取消。",
    fields: [
      {
        name: "entries",
        label: "家庭訂閱清單",
        type: "textarea",
        help: "每行格式：名稱 | 每次金額 | 週、月、季或年。",
        value: "影音串流 | 320 | 月\n雲端空間 | 2990 | 年\n餐食配送 | 850 | 週",
      },
      {
        name: "currency",
        label: "幣別",
        type: "select",
        options: ["TWD", "USD", "JPY"],
      },
    ],
    run: (values) => {
      const factors: Record<string, number> = {
        週: 52,
        每週: 52,
        weekly: 52,
        月: 12,
        每月: 12,
        monthly: 12,
        季: 4,
        每季: 4,
        quarterly: 4,
        年: 1,
        每年: 1,
        annual: 1,
        yearly: 1,
      };
      const parsed = values.entries
        .split("\n")
        .map((source, index) => {
          const [name = "", rawAmount = "", cadence = ""] = source
            .split("|")
            .map((part) => part.trim());
          const amount = Number(rawAmount.replace(/[,$，\s]/g, ""));
          const factor = factors[cadence.toLowerCase()];
          return {
            line: index + 1,
            name,
            cadence,
            amount,
            factor,
            valid:
              Boolean(name) &&
              Number.isFinite(amount) &&
              amount >= 0 &&
              Boolean(factor),
          };
        })
        .filter((row) => row.name || row.cadence || Number.isFinite(row.amount));
      const valid = parsed.filter((row) => row.valid);
      const invalid = parsed.filter((row) => !row.valid);
      if (valid.length === 0)
        return "沒有可計算的項目。請使用「名稱 | 每次金額 | 週、月、季或年」格式，每行一項。";
      const currency = values.currency || "TWD";
      const rows = valid.map((row) => ({
        ...row,
        annual: row.amount * row.factor,
      }));
      const annual = rows.reduce((sum, row) => sum + row.annual, 0);
      const invalidMessage = invalid.length
        ? `\n\n未納入：第 ${invalid.map((row) => row.line).join("、")} 行。請檢查名稱、非負金額與週／月／季／年單位。`
        : "";
      return `${lines(
        "各項年化費用",
        rows.map(
          (row) =>
            `${row.name}：${moneyFor(row.annual, currency)}（每次 ${moneyFor(row.amount, currency)}／${row.cadence}）`,
        ),
      )}\n\n家庭月均：${moneyFor(annual / 12, currency)}\n家庭年總額：${moneyFor(annual, currency)}${invalidMessage}\n\n換算採每年 52 週、12 個月、4 季；尚未包含匯率、價格調整、稅費或取消條款。`;
    },
  },
  "home-maintenance-cost-tracker": {
    intro:
      "把已完成與已規劃的居家維護費用分開加總，並保留日期與設備名稱。工具不會連接銀行，也不會用通用比例判斷你花得太多或太少。",
    fields: [
      {
        name: "entries",
        label: "維護費用明細",
        type: "textarea",
        help: "每行格式：日期 | 項目 | 金額 | 已完成或已規劃。",
        value:
          "2026-08-05 | 客廳冷氣檢修 | 1800 | 已完成\n2026-09-12 | 浴室抽風機更換 | 3200 | 已規劃",
      },
      {
        name: "currency",
        label: "幣別",
        type: "select",
        options: ["TWD", "USD", "JPY"],
      },
    ],
    run: (values) => {
      const rows = values.entries
        .split("\n")
        .map((source, index) => {
          const [rawDate = "", item = "", rawAmount = "", status = ""] =
            source.split("|").map((part) => part.trim());
          const parsedDate = date(rawDate);
          const amount = Number(rawAmount.replace(/[,$，\s]/g, ""));
          const normalizedStatus: Record<string, "completed" | "planned"> = {
            已完成: "completed",
            完成: "completed",
            completed: "completed",
            已規劃: "planned",
            規劃: "planned",
            planned: "planned",
          };
          return {
            line: index + 1,
            rawDate,
            item,
            amount,
            status,
            normalized: normalizedStatus[status.toLowerCase()],
            valid:
              Boolean(parsedDate) &&
              Boolean(item) &&
              Number.isFinite(amount) &&
              amount >= 0 &&
              Boolean(normalizedStatus[status.toLowerCase()]),
          };
        })
        .filter((row) =>
          [row.rawDate, row.item, row.status].some(Boolean) ||
          Number.isFinite(row.amount),
        );
      const valid = rows.filter((row) => row.valid);
      const invalid = rows.filter((row) => !row.valid);
      if (valid.length === 0)
        return "沒有可計算的明細。請使用「日期 | 項目 | 金額 | 已完成或已規劃」格式，每行一項。";
      const currency = values.currency || "TWD";
      const completed = valid.filter((row) => row.normalized === "completed");
      const planned = valid.filter((row) => row.normalized === "planned");
      const total = (items: typeof valid) =>
        items.reduce((sum, row) => sum + row.amount, 0);
      const completedTotal = total(completed);
      const plannedTotal = total(planned);
      const invalidMessage = invalid.length
        ? `\n\n未納入：第 ${invalid.map((row) => row.line).join("、")} 行。請檢查日期、項目、非負金額及「已完成／已規劃」狀態。`
        : "";
      return `${lines(
        "居家維護費用明細",
        valid.map(
          (row) =>
            `${row.rawDate}｜${row.item}｜${moneyFor(row.amount, currency)}｜${row.normalized === "completed" ? "已完成" : "已規劃"}`,
        ),
      )}\n\n已完成：${moneyFor(completedTotal, currency)}（${completed.length} 筆）\n已規劃：${moneyFor(plannedTotal, currency)}（${planned.length} 筆）\n已完成平均每筆：${moneyFor(completed.length ? completedTotal / completed.length : 0, currency)}${invalidMessage}\n\n總額只反映你輸入的資料；沒有包含未登錄費用，也不代表稅務、保險或房屋增值成本。`;
    },
  },
  "home-repair-cost-log": {
    intro:
      "把每次修繕的日期、設備、故障現象、處理者、實付金額與結果放在同一條時間線，並找出同一設備的重複維修。這是紀錄工具，不會替你判定應維修或汰換。",
    fields: [
      {
        name: "entries",
        label: "修繕紀錄",
        type: "textarea",
        help: "每行格式：日期 | 設備／區域 | 故障現象 | 業者／處理人 | 實付金額 | 結果。自行處理也要明確填寫。",
        value:
          "2026-03-08 | 客廳冷氣 | 運轉後滴水 | 原廠服務站 | 1800 | 清潔排水管後正常\n2026-08-18 | 客廳冷氣 | 再次滴水 | 原廠服務站 | 950 | 調整排水坡度，持續觀察",
      },
      {
        name: "currency",
        label: "幣別",
        type: "select",
        options: ["TWD", "USD", "JPY"],
      },
    ],
    run: (values) => {
      const parsed = values.entries
        .split("\n")
        .map((source, index) => {
          const parts = source.split("|").map((part) => part.trim());
          const [rawDate = "", item = "", symptom = "", provider = "", rawAmount = "", outcome = ""] = parts;
          const amount = Number(rawAmount.replace(/[,$，\s]/g, ""));
          return {
            line: index + 1,
            parts,
            rawDate,
            item,
            symptom,
            provider,
            amount,
            outcome,
            valid:
              parts.length === 6 &&
              Boolean(date(rawDate)) &&
              [item, symptom, provider, outcome].every(Boolean) &&
              Number.isFinite(amount) &&
              amount >= 0,
          };
        })
        .filter((row) => row.parts.some(Boolean));
      if (parsed.length > 50)
        return "一次最多整理 50 筆修繕；請按住家、設備或年度拆成較容易複查的紀錄。";
      const valid = parsed.filter((row) => row.valid);
      const invalid = parsed.filter((row) => !row.valid);
      if (valid.length === 0)
        return "沒有可整理的紀錄。請使用「日期 | 設備／區域 | 故障現象 | 業者／處理人 | 實付金額 | 結果」格式，每行六個完整欄位。";
      const currency = values.currency || "TWD";
      const total = valid.reduce((sum, row) => sum + row.amount, 0);
      const groups = new Map<string, { label: string; count: number; total: number }>();
      valid.forEach((row) => {
        const key = row.item.toLocaleLowerCase("zh-TW");
        const current = groups.get(key) || { label: row.item, count: 0, total: 0 };
        current.count += 1;
        current.total += row.amount;
        groups.set(key, current);
      });
      const repeated = [...groups.values()].filter((group) => group.count > 1);
      const invalidMessage = invalid.length
        ? `\n\n未納入：第 ${invalid.map((row) => row.line).join("、")} 行。每行必須正好六個欄位，日期有效、文字不留白，金額為非負數。`
        : "";
      return `${lines(
        "居家修繕歷程",
        valid.map(
          (row) =>
            `${row.rawDate}｜${row.item}｜現象：${row.symptom}｜處理：${row.provider}｜${moneyFor(row.amount, currency)}｜結果：${row.outcome}`,
        ),
      )}\n\n實付總額：${moneyFor(total, currency)}（${valid.length} 筆）\n平均每筆：${moneyFor(total / valid.length, currency)}\n\n${repeated.length ? lines("同名設備的重複紀錄", repeated.map((group) => `${group.label}：${group.count} 筆，共 ${moneyFor(group.total, currency)}`)) : "目前沒有同名設備的重複紀錄。"}${invalidMessage}\n\n重複筆數只是一個回查訊號，不代表設備一定該汰換。請一併核對設備年齡、保固、實際故障原因、安全風險、書面報價與替代成本。`;
    },
  },
  "home-service-reminder-generator": {
    intro:
      "把到府檢修、清洗、換料或續約整理成「何時開始聯絡」與「何時必須完成」兩個日期。週期必須來自說明書、服務契約或你已確認的依據。",
    fields: [
      text("item", "設備或服務", "寫清楚位置與設備，例如『主臥冷氣』。", "主臥冷氣"),
      text("action", "這次要完成的動作", "使用可以驗收的動詞，不要只寫『處理一下』。", "預約原廠檢查異音"),
      text("source", "日期或週期的實際依據", "例如說明書頁碼、保固條款、服務契約或上次完工紀錄。", "使用說明書第 18 頁／異常時聯絡指定維修站"),
      text("owner", "負責聯絡的家庭角色", "可以填角色，不必填真名。", "家庭設備負責人"),
      { name: "due", label: "最晚完成日期", type: "date" },
      {
        name: "lead",
        label: "提前幾天開始聯絡／預約",
        type: "number",
        help: "請依業者排程、料件等待與家庭可配合時段決定；可填 0 到 365 的整數。",
        value: "14",
      },
    ],
    run: (values) => {
      const due = date(values.due);
      const lead = Number(values.lead);
      if (!values.item.trim()) return "請填寫設備或服務名稱。";
      if (!values.action.trim()) return "請填寫這次要完成的具體動作。";
      if (!values.source.trim()) return "請填寫日期或週期的實際依據；工具不會替你猜保養週期。";
      if (!values.owner.trim()) return "請填寫負責聯絡的家庭角色，避免提醒到了卻沒有人承接。";
      if (!due) return "請輸入有效的最晚完成日期。";
      if (!Number.isInteger(lead) || lead < 0 || lead > 365)
        return "提前天數必須是 0 到 365 之間的整數。";
      const contact = new Date(due);
      contact.setDate(contact.getDate() - lead);
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const day = 86_400_000;
      const daysUntilDue = Math.round((due.getTime() - today.getTime()) / day);
      const daysUntilContact = Math.round((contact.getTime() - today.getTime()) / day);
      const status =
        daysUntilDue < 0
          ? `已逾最晚完成日 ${Math.abs(daysUntilDue)} 天；先確認是否已完成或需要重新排程。`
          : daysUntilDue === 0
            ? "最晚完成日是今天。"
            : daysUntilContact < 0
              ? `建議聯絡日已過 ${Math.abs(daysUntilContact)} 天，距最晚完成日還有 ${daysUntilDue} 天。`
              : daysUntilContact === 0
                ? `今天開始聯絡／預約，距最晚完成日還有 ${daysUntilDue} 天。`
                : `距建議聯絡日還有 ${daysUntilContact} 天，距最晚完成日還有 ${daysUntilDue} 天。`;
      return `${values.item.trim()}｜${values.action.trim()}\n負責角色：${values.owner.trim()}\n日期依據：${values.source.trim()}\n建議聯絡／預約日：${formatter.format(contact)}\n最晚完成日：${formatter.format(due)}\n狀態：${status}\n\n預約時確認：工作範圍、到府時段、費用／估價方式、服務人員識別方式，以及取消或改期規則。\n完工後補記：實際日期、服務商、費用、處理內容、異常是否消失、單據位置，以及下一次日期的真實依據。\n\n這份結果不會發送通知或自動預約；請複製到你真正會查看的行事曆或 FamilyBoard 任務。`;
    },
  },
  "receipt-retention-organizer": {
    intro:
      "先寫明保留收據的用途與依據，再計算人工複查日。它不會提供一體適用的保存年限，也不會在日期到達時刪除任何資料。",
    fields: [
      text("item", "購買品或工程／服務", "名稱要能和設備、維修或文件索引對得起來。", "客廳冷氣排水修繕"),
      {
        name: "purpose",
        label: "主要保留用途",
        type: "select",
        options: ["退換貨或付款證明", "保固或維修", "住宅財物盤點／保險佐證", "裝修或房屋改善紀錄", "稅務或法律用途（須查主管機關）"],
      },
      { name: "purchase", label: "交易或完工日期", type: "date" },
      {
        name: "months",
        label: "已查明的複查間隔（月）",
        type: "number",
        help: "這是複查間隔，不是自動銷毀期限；可填 0 到 1200 的整數。",
        value: "12",
      },
      text("source", "期間依據", "例如業者退換貨頁面、書面保固、保單要求、主管機關規定或專業意見。", "書面保固條款／服務單"),
      text("location", "收據與相關文件位置", "只寫安全的位置標籤，不要輸入密碼或完整卡號。", "家庭文件／家電與修繕／客廳冷氣"),
    ],
    run: (values) => {
      const purchase = date(values.purchase);
      const months = Number(values.months);
      if (!values.item.trim()) return "請填寫購買品、工程或服務名稱。";
      if (!purchase) return "請輸入有效的交易或完工日期。";
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      if (purchase.getTime() > today.getTime()) return "交易或完工日期不能晚於今天；尚未發生的項目不應建立成收據紀錄。";
      if (!Number.isInteger(months) || months < 0 || months > 1200)
        return "複查間隔必須是 0 到 1200 之間的整數月。";
      if (!values.source.trim()) return "請填寫期間依據；不要只憑工具預設值決定保存多久。";
      if (!values.location.trim()) return "請填寫收據與相關文件的位置，否則日期到了仍找不到原件。";
      const review = addMonths(purchase, months);
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const reviewState = review.getTime() < today.getTime()
        ? "複查日已到，請現在核對原始依據；這不代表可以直接銷毀。"
        : review.getTime() === today.getTime()
          ? "今天是複查日；先核對原始依據，再決定延長或結案。"
          : "複查日尚未到；若保固、退換貨、保單或法規改變，仍應提早更新。";
      return `${values.item.trim()}｜收據保存索引\n用途：${values.purpose}\n交易／完工日：${formatter.format(purchase)}\n人工複查日：${formatter.format(review)}\n期間依據：${values.source.trim()}\n文件位置：${values.location.trim()}\n狀態：${reviewState}\n\n一起保存或交叉索引：可辨識交易的發票／收據、品項或工作明細、付款證明、保固／退換貨條款、服務或驗收紀錄，以及日後往來。避免保存完整信用卡號、密碼或與用途無關的身分資料。\n\n複查日不是銷毀日。稅務、保險、房屋交易或爭議案件的保存期間，應以當下適用的主管機關規定、契約與專業意見為準。`;
    },
  },
  "household-annual-review-generator": {
    intro:
      "建立一次有負責人、查核日期、完成證據與下次複查日的家庭年度總整理。這不是大掃除清單，而是檢查家庭資料與工作流程是否仍可信。",
    fields: [
      text("household", "家庭或住家名稱", "可用暱稱，不必填完整地址。", "我的家庭"),
      {
        name: "housing",
        label: "目前居住情境",
        type: "select",
        options: ["自有住宅", "承租住宅", "與親友同住／其他"],
      },
      text("owner", "本次總整理負責角色", "負責召集與關閉未完成項目，可填角色。", "家庭資料整理人"),
      { name: "reviewed", label: "本次查核日期", type: "date" },
      { name: "nextReview", label: "下次年度複查日期", type: "date" },
      {
        name: "priorities",
        label: "今年特別要處理的重點",
        type: "textarea",
        help: "每行或逗號分隔，最多 8 項；寫可查證的問題，不要只寫『整理好』。",
        value: "清掉無人負責的自動續約\n更新緊急聯絡與家庭交接\n驗證最新備份可以開啟",
      },
    ],
    run: (values) => {
      const reviewed = date(values.reviewed);
      const nextReview = date(values.nextReview);
      const priorities = uniqueList(values.priorities);
      if (!values.household.trim()) return "請填寫家庭或住家名稱，讓匯出後的清單仍能辨識。";
      if (!values.owner.trim()) return "請填寫本次總整理的負責角色。";
      if (!reviewed) return "請輸入有效的本次查核日期。";
      if (!nextReview) return "請輸入有效的下次年度複查日期。";
      if (nextReview.getTime() <= reviewed.getTime()) return "下次年度複查日期必須晚於本次查核日期。";
      if (priorities.length === 0) return "請至少輸入一項今年特別要處理的重點。";
      if (priorities.length > 8) return "一次最多設定 8 項年度重點；其餘先放入待辦池，不要讓年度總整理失去焦點。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const housingTask =
        values.housing === "承租住宅"
          ? "核對租約、現況／點交紀錄、修繕責任、費用與重要通知位置"
          : values.housing === "自有住宅"
            ? "核對房屋交付、裝修、主要設備、保險與必要服務文件位置"
            : "核對居住安排、可處理範圍、費用分工與重要聯絡方式";
      const sections = [
        "設備與文件：逐項抽查資產、型號、保固、收據與文件索引能否回到原件",
        "保養與修繕：核對已完成紀錄、逾期項目、重複故障及下一日期的實際依據",
        "費用與續約：確認有效訂閱、取消狀態、年度費用、續約日與唯一負責人",
        "聯絡與防災：實際核對緊急、管理、維修與照護聯絡方式，更新家庭防災計畫",
        `居住情境：${housingTask}`,
        "隱私與交接：抽查家庭看板、交接摘要與共享檔案沒有暴露不必要敏感資料",
        "備份與復原：匯出新備份、記錄版本與位置，開啟檔案並在不覆蓋正式資料的前提下驗證內容",
      ];
      return `${values.household.trim()}｜家庭年度總整理\n居住情境：${values.housing}\n本次查核：${formatter.format(reviewed)}\n總整理負責角色：${values.owner.trim()}\n下次年度複查：${formatter.format(nextReview)}\n\n${lines("七個固定查核區", sections.map((item) => `[ ] ${item}｜證據／位置：＿＿＿＿｜後續負責人與日期：＿＿＿＿`))}\n\n${lines("今年重點", priorities.map((item) => `[ ] ${item}｜完成定義：＿＿＿＿｜負責人與期限：＿＿＿＿`))}\n\n關閉條件：每個發現都要標示「已修正、已建立有負責人的後續任務、確認不適用」三者之一；只有看過清單不算完成。不要把密碼、完整證件號碼、醫療內容或其他不必要敏感資料複製到共用版本。`;
    },
  },
  "move-in-checklist-generator": {
    intro:
      "依搬入日、點交日、居住身分與住宅型態建立四階段清單，特別保留屋況、表計、鑰匙、契約及修繕責任的證據位置。它不判定租賃或買賣權利。",
    fields: [
      {
        name: "tenure",
        label: "居住身分",
        type: "select",
        options: ["承租人", "自有住宅入住", "與親友同住／其他"],
      },
      {
        name: "homeType",
        label: "住宅型態",
        type: "select",
        options: ["公寓大廈", "透天住宅", "其他"],
      },
      { name: "handover", label: "點交或取得使用權日期", type: "date" },
      { name: "moveIn", label: "正式搬入日期", type: "date" },
      text("owner", "搬入總負責角色", "負責追蹤跨階段事項，可填角色。", "搬家主要聯絡人"),
      {
        name: "needs",
        label: "這個家庭的額外需求",
        type: "textarea",
        help: "每行或逗號分隔，最多 10 項，例如寵物、停車位、長者動線、網路或濾水器。",
        value: "寵物入住安排\n停車位與管理規則\n網路裝機\n濾水器型號與濾芯",
      },
    ],
    run: (values) => {
      const handover = date(values.handover);
      const moveIn = date(values.moveIn);
      const needs = uniqueList(values.needs);
      if (!handover) return "請輸入有效的點交或取得使用權日期。";
      if (!moveIn) return "請輸入有效的正式搬入日期。";
      if (handover.getTime() > moveIn.getTime()) return "點交或取得使用權日期不能晚於正式搬入日期；若實際安排不同，請確認日期與用途後分開建任務。";
      if (!values.owner.trim()) return "請填寫搬入總負責角色。";
      if (needs.length > 10) return "額外需求一次最多 10 項；其餘請另外建立搬家專案待辦。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const firstWeek = new Date(moveIn);
      firstWeek.setDate(firstWeek.getDate() + 7);
      const firstMonth = addMonths(moveIn, 1);
      const tenureTasks =
        values.tenure === "承租人"
          ? ["逐條核對實際租約、租賃標的現況確認書、附屬設備與修繕責任", "和出租方／管理方共同確認屋況、表計、鑰匙與已知問題，保存雙方可辨識的紀錄"]
          : values.tenure === "自有住宅入住"
            ? ["核對交屋／交易、設備保固、裝修與管理文件位置", "記錄交付缺失、改善承諾、表計、鑰匙與公共設施交接狀態"]
            : ["和住宅管理者確認可使用範圍、費用、設備、鑰匙與修繕聯絡方式", "記錄搬入時既有屋況與家庭物品界線"];
      const buildingTasks =
        values.homeType === "公寓大廈"
          ? ["確認管理室、門禁、電梯搬運、垃圾、停車與公共設施規則", "找到不妨礙逃生的公共動線與官方緊急資訊"]
          : values.homeType === "透天住宅"
            ? ["辨識各樓層主要設備、表計與可由住戶安全操作的關閉點", "確認垃圾、郵件、停車、排水與外部維護責任"]
            : ["確認住宅管理、公共動線、垃圾、郵件、停車及緊急聯絡方式"];
      return `${values.tenure}｜${values.homeType}搬入清單\n點交／取得使用權：${formatter.format(handover)}\n正式搬入：${formatter.format(moveIn)}\n總負責角色：${values.owner.trim()}\n\n${lines("點交前完成", [
        ...tenureTasks,
        "確認水、電、瓦斯、網路與管理費的實際申辦／結算責任，不沿用前住戶假設",
        "建立搬入證據的安全存放位置與命名方式",
      ].map((item) => `[ ] ${item}`))}\n\n${lines(`點交日｜${formatter.format(handover)}`, [
        "依空間逐一拍攝屋況與附屬設備；照片保留日期、位置與問題說明",
        "拍攝並核對可辨識的水電等表計讀數，不公開用戶或住址敏感資料",
        "測試雙方同意可測的設備，記錄無法測試或待修項目，不以口頭帶過",
        "點算鑰匙、門禁、遙控器與交付文件，記錄數量及接收人",
        ...buildingTasks,
      ].map((item) => `[ ] ${item}`))}\n\n${lines(`搬入後七天內｜${formatter.format(firstWeek)}`, [
        "確認帳單、通知與必要服務已改到正確接收方式，舊住戶資料未留在共用設備",
        "把重大設備、保固、維修窗口與已知問題建立成長期紀錄",
        "檢查第一週實際使用才出現的漏水、排水、異音或門窗問題，依契約與適當管道回報",
        ...needs.map((item) => `完成需求設定：${item}｜負責人與完成證據：＿＿＿＿`),
      ].map((item) => `[ ] ${item}`))}\n\n${lines(`搬入後一個月複查｜${formatter.format(firstMonth)}`, [
        "關閉已完成的一次性搬家任務，保留仍有用途的屋況、契約、表計與設備紀錄",
        "只依實際說明書、契約與住家情況建立保養或續約任務",
        "匯出第一份 FamilyBoard 備份並開啟驗證，不把唯一副本留在同一瀏覽器",
      ].map((item) => `[ ] ${item}`))}\n\n這份清單不判定押金、修繕、費用、點交或公共設施的法律責任；請以實際契約、主管機關資料及個案專業意見為準。`;
    },
  },
  "move-out-condition-record-generator": {
    intro:
      "建立可逐欄核對的退租屋況、鑰匙／門禁、表計與後續處理紀錄。工具只整理觀察與證據索引，不會判定修繕責任、押金返還、費用或法律效果。",
    fields: [
      text("home", "租賃標的識別名稱", "可用住家暱稱或房號，不必輸入完整地址。", "目前租屋處"),
      {
        name: "stage",
        label: "紀錄階段",
        type: "select",
        options: ["退租前自主檢查", "雙方點交", "點交後補件"],
      },
      { name: "inspected", label: "實際檢查日期", type: "date" },
      { name: "handover", label: "預定或實際點交日期", type: "date" },
      text("source", "契約與搬入現況依據", "寫可重新開啟的租約、現況確認書、點交附件或照片組名稱。", "住宅租賃契約、搬入現況確認書與 2025-09-01 照片組"),
      {
        name: "participants",
        label: "參與者或角色",
        type: "textarea",
        help: "每行或逗號分隔，1 至 8 位；這裡不收身分證資料，也不是簽名欄。",
        value: "承租人\n出租人／管理方",
      },
      {
        name: "conditions",
        label: "屋況觀察",
        type: "textarea",
        help: "每行格式：空間 | 實際觀察 | 照片／檔案索引 | 後續動作與負責角色 | 待處理、待共同確認、有歧見待記錄或已共同確認；最多 12 行。",
        value: "廚房 | 雙方約定檢查時水槽櫃內乾燥，未見漏水 | IMG_001–003 | 雙方：對照搬入現況確認書 | 待共同確認\n主臥 | 搬入紀錄已有的牆面痕跡仍可見 | IMG_004、搬入 IMG_019 | 管理方：在點交副本註記 | 有歧見待記錄\n客廳 | 個人物品已移除，地板可完整檢視 | IMG_005–008 | 承租人：目前無其他動作 | 已共同確認",
      },
      {
        name: "accessItems",
        label: "鑰匙與門禁物品",
        type: "textarea",
        help: "每行格式：物品 | 整數數量 | 接收角色或返還狀態 | 照片／文件索引；最多 8 行，禁止輸入門禁密碼。",
        value: "大門鑰匙 | 2 | 點交時交還管理方 | KEY_001\n門禁磁扣 | 1 | 點交時交還管理方 | KEY_002",
      },
      {
        name: "meters",
        label: "表計或服務狀態",
        type: "textarea",
        help: "每行格式：項目 | 實際讀數或狀態 | 單位 | 照片／文件索引；最多 8 行。",
        value: "電表 | 012345 | 度 | METER_001\n水表 | 00678 | 依帳單單位 | METER_002",
      },
      { name: "followUp", label: "下次追蹤日期", type: "date" },
      text("storage", "受保護的紀錄位置", "只寫資料夾、信封或備份位置索引，不要輸入密碼或門禁碼。", "家庭文件／退租／最終點交"),
    ],
    run: (values) => {
      const inspected = date(values.inspected);
      const handover = date(values.handover);
      const followUp = date(values.followUp);
      if (!values.home.trim()) return "請填寫租賃標的識別名稱，讓匯出後的紀錄仍能辨識。";
      if (!inspected) return "請輸入有效的實際檢查日期。";
      if (!handover) return "請輸入有效的預定或實際點交日期。";
      if (!followUp) return "請輸入有效的下次追蹤日期。";
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      if (inspected.getTime() > today.getTime())
        return "實際檢查日期不能晚於今天；尚未檢查的工作請用點交日與追蹤日規劃。";
      if (handover.getTime() < inspected.getTime())
        return "點交日期不能早於實際檢查日期。";
      if (followUp.getTime() < handover.getTime())
        return "下次追蹤日期不能早於點交日期。";
      if (!values.source.trim()) return "請填寫契約與搬入現況依據，避免只用退租當下的記憶比較。";
      if (!values.storage.trim()) return "請填寫受保護的紀錄位置，否則日後無法回到原始證據。";
      const participants = uniqueList(values.participants);
      if (participants.length === 0) return "請至少輸入一位參與者或角色。";
      if (participants.length > 8) return "一份紀錄最多列 8 位參與者或角色。";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const conditionRows = parseRows(values.conditions);
      if (conditionRows.length === 0) return "請至少輸入一筆屋況觀察。";
      if (conditionRows.length > 12) return "一份紀錄最多整理 12 筆屋況；其餘空間請另開一份。";
      const invalidConditions = conditionRows.filter((row) => row.parts.length !== 5 || row.parts.some((part) => !part));
      if (invalidConditions.length)
        return `屋況第 ${invalidConditions.map((row) => row.line).join("、")} 行必須完整填寫 5 個以直線分隔的欄位。`;
      const validStatuses = new Set(["待處理", "待共同確認", "有歧見待記錄", "已共同確認"]);
      const invalidStatuses = conditionRows.filter((row) => !validStatuses.has(row.parts[4]));
      if (invalidStatuses.length)
        return `屋況第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須是「待處理、待共同確認、有歧見待記錄、已共同確認」之一。`;
      const areaNames = conditionRows.map((row) => row.parts[0].toLocaleLowerCase("zh-TW"));
      if (new Set(areaNames).size !== areaNames.length)
        return "同一空間只能出現一次；請把同空間的觀察合併後再產生紀錄。";
      const accessRows = parseRows(values.accessItems);
      if (accessRows.length === 0) return "請至少輸入一筆鑰匙或門禁物品；若確實沒有，請以 0 件的不適用項目留下紀錄。";
      if (accessRows.length > 8) return "鑰匙與門禁物品最多 8 行。";
      const invalidAccess = accessRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part) || !Number.isInteger(Number(row.parts[1])) || Number(row.parts[1]) < 0 || Number(row.parts[1]) > 99);
      if (invalidAccess.length)
        return `鑰匙／門禁第 ${invalidAccess.map((row) => row.line).join("、")} 行需有 4 個欄位，數量必須是 0 到 99 的整數。`;
      const meterRows = parseRows(values.meters);
      if (meterRows.length === 0) return "請至少輸入一筆表計或服務狀態；不適用時也要寫明原因。";
      if (meterRows.length > 8) return "表計或服務狀態最多 8 行。";
      const invalidMeters = meterRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidMeters.length)
        return `表計第 ${invalidMeters.map((row) => row.line).join("、")} 行必須完整填寫 4 個以直線分隔的欄位。`;
      const shareable = [values.source, values.conditions, values.accessItems, values.meters, values.storage].join("\n");
      if (/密碼|門禁碼|驗證碼|完整(?:身分證|信用卡|銀行帳號)|password|passcode|access code|\bpin\s*[:：=]/i.test(shareable))
        return "偵測到可能的密碼、門禁碼、驗證碼或完整敏感識別資料。請改寫成受保護位置的索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = ["待處理", "待共同確認", "有歧見待記錄", "已共同確認"].map((status) => ({
        status,
        count: conditionRows.filter((row) => row.parts[4] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.home.trim()}｜退租點交屋況紀錄\n紀錄階段：${values.stage}\n實際檢查：${formatter.format(inspected)}\n預定／實際點交：${formatter.format(handover)}\n下次追蹤：${formatter.format(followUp)}\n對照依據：${values.source.trim()}\n參與者／角色：${participants.join("、")}\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n${lines("屋況觀察", conditionRows.map((row) => `${row.parts[0]}｜觀察：${row.parts[1]}｜證據：${row.parts[2]}｜後續：${row.parts[3]}｜狀態：${row.parts[4]}`))}\n\n${lines("鑰匙與門禁物品", accessRows.map((row) => `${row.parts[0]}｜${row.parts[1]} 件｜${row.parts[2]}｜證據：${row.parts[3]}`))}\n\n${lines("表計與服務狀態", meterRows.map((row) => `${row.parts[0]}｜${row.parts[1]} ${row.parts[2]}｜證據：${row.parts[3]}`))}\n\n受保護的紀錄位置：${values.storage.trim()}\n\n結案前查核：保存原始檔、歧見另行保留而非覆寫、每個後續動作都有負責角色，並讓應取得紀錄的一方拿到雙方同意的版本。這份瀏覽器輸出不是簽名、責任認定、押金計算、付款證明、正式通知或最終合意；仍應以實際契約、主管機關現行資料與個案專業意見為準。`;
    },
  },
  "home-emergency-drill-record-generator": {
    intro:
      "記錄家庭實際演練過什麼、在哪裡卡住、哪些項目因安全停止，以及改善工作由誰負責。請依所在地最新官方資訊做事先告知的低風險演練；工具不會指揮真實災害，也不會認證住宅安全。",
    fields: [
      text("household", "家庭識別名稱", "使用家人看得懂的暱稱，不必輸入完整地址。", "我們家"),
      {
        name: "drillType",
        label: "演練類型",
        type: "select",
        options: [
          "全家避難動線走讀",
          "住宅火災逃生演練",
          "地震避難與震後集合演練",
          "失聯通訊與會合演練",
          "長者、兒少、照護與寵物支援演練",
        ],
      },
      { name: "practiced", label: "實際演練日期", type: "date" },
      {
        name: "minutes",
        label: "觀察到的演練分鐘數",
        type: "number",
        value: "8",
        help: "只記實際經過時間，不把秒數或分鐘數當成安全及格標準。",
      },
      text("guidance", "本次核對的官方資訊或計畫版本", "寫消防署、地方政府、社區／大樓計畫或家庭防災計畫的名稱與核對日期。", "消防署家庭防災計畫資料，2026-08-23 核對；家庭計畫第 3 版"),
      text("scope", "演練目標與事先告知的界線", "說明實際走讀什麼、哪些只模擬，以及哪些高風險動作不執行。", "走讀第一與替代方向、到家庭集合點代稱報到、測試備援聯絡；不製造真實火煙、不驚動鄰居、不操作危險設備"),
      {
        name: "participants",
        label: "參與者或角色",
        type: "textarea",
        help: "每行或逗號分隔，1 至 12 位；只放這次紀錄所需的最少資料。",
        value: "成人甲\n成人乙\n兒少參與者\n寵物支援角色",
      },
      {
        name: "observations",
        label: "演練觀察",
        type: "textarea",
        help: "每行格式：階段 | 原定查核 | 實際觀察 | 改善動作與負責角色 | 符合本次計畫、需要追蹤、未測試或因安全停止；最多 12 行。",
        value: "開始與辨識 | 所有人知道事先約定的開始方式 | 一位參與者需要第二次提示 | 成人甲：下次演練前再核對開始方式 | 需要追蹤\n動線走讀 | 第一與替代方向不需移動雜物即可到達 | 第一方向順利，替代方向尚未走讀 | 成人乙：依官方與大樓資料查核後再測 | 未測試\n集合與點名 | 到家庭集合點代稱後完成點名 | 本次參與者都完成報到 | 成人甲：保存本次紀錄 | 符合本次計畫",
      },
      {
        name: "support",
        label: "人員、照護與寵物支援查核",
        type: "textarea",
        help: "每行格式：人員／寵物／支援情境 | 主要角色 | 備援角色 | 實際觀察；最多 8 行，不要填診斷、藥量或完整病歷。",
        value: "兒少參與者 | 成人甲 | 成人乙 | 兩個角色都能說明本次約定支援\n寵物外出籠 | 成人乙 | 成人甲 | 外出籠置於家人可直接取用的位置",
      },
      {
        name: "communications",
        label: "失聯、通訊與會合查核",
        type: "textarea",
        help: "每行格式：情境 | 第一方法或地點代稱 | 替代方法 | 實際觀察；最多 8 行，不要把弱勢家人精確位置公開在分享稿。",
        value: "家人在住家附近分散 | 家庭群組簡訊 | 外地聯絡人 | 測試訊息由預定參與者回覆\n住家無法使用 | 第一集合點代稱 | 受保護計畫中的替代集合點代稱 | 離線防災卡可找到兩個代稱",
      },
      { name: "followUp", label: "下次複查或重做日期", type: "date" },
      text("storage", "受保護的演練紀錄位置", "只寫資料夾、信封或備份位置代稱，不要輸入密碼、門禁碼或可公開的精確位置。", "家庭文件／防災演練／2026"),
    ],
    run: (values) => {
      const practiced = date(values.practiced);
      const followUp = date(values.followUp);
      if (!values.household.trim()) return "請填寫家庭識別名稱，讓匯出後的紀錄仍能辨識。";
      if (!practiced) return "請輸入有效的實際演練日期。";
      if (!followUp) return "請輸入有效的下次複查或重做日期。";
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      if (practiced.getTime() > today.getTime())
        return "實際演練日期不能晚於今天；請在演練真正發生後再建立完成紀錄。";
      if (followUp.getTime() <= practiced.getTime())
        return "下次複查或重做日期必須晚於實際演練日期。";
      const minutes = Number(values.minutes);
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > 240)
        return "觀察時間請輸入 1 到 240 的整數分鐘。";
      if (!values.guidance.trim()) return "請填寫本次核對的官方資訊或計畫版本。";
      if (!values.scope.trim()) return "請說明演練目標與事先告知的界線。";
      if (!values.storage.trim()) return "請填寫受保護的演練紀錄位置。";
      const participants = uniqueList(values.participants);
      if (participants.length === 0) return "請至少輸入一位參與者或角色。";
      if (participants.length > 12) return "一份紀錄最多列 12 位參與者或角色。";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const observations = parseRows(values.observations);
      if (observations.length === 0) return "請至少輸入一筆演練觀察。";
      if (observations.length > 12) return "一份紀錄最多整理 12 筆演練觀察。";
      const invalidObservations = observations.filter((row) => row.parts.length !== 5 || row.parts.some((part) => !part));
      if (invalidObservations.length)
        return `演練觀察第 ${invalidObservations.map((row) => row.line).join("、")} 行必須完整填寫 5 個以直線分隔的欄位。`;
      const validStatuses = new Set(["符合本次計畫", "需要追蹤", "未測試", "因安全停止"]);
      const invalidStatuses = observations.filter((row) => !validStatuses.has(row.parts[4]));
      if (invalidStatuses.length)
        return `演練觀察第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須是「符合本次計畫、需要追蹤、未測試、因安全停止」之一。`;
      const phaseNames = observations.map((row) => row.parts[0].toLocaleLowerCase("zh-TW"));
      if (new Set(phaseNames).size !== phaseNames.length)
        return "同一演練階段只能出現一次；請合併同階段的觀察。";
      const supportRows = parseRows(values.support);
      if (supportRows.length > 8) return "人員、照護與寵物支援最多 8 行。";
      const invalidSupport = supportRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidSupport.length)
        return `支援查核第 ${invalidSupport.map((row) => row.line).join("、")} 行必須完整填寫 4 個以直線分隔的欄位。`;
      const communicationRows = parseRows(values.communications);
      if (communicationRows.length === 0) return "請至少輸入一筆失聯、通訊或會合查核。";
      if (communicationRows.length > 8) return "失聯、通訊與會合查核最多 8 行。";
      const invalidCommunications = communicationRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidCommunications.length)
        return `失聯／通訊第 ${invalidCommunications.map((row) => row.line).join("、")} 行必須完整填寫 4 個以直線分隔的欄位。`;
      const shareable = [values.guidance, values.scope, values.participants, values.observations, values.support, values.communications, values.storage].join("\n");
      if (/密碼|門禁碼|驗證碼|警報碼|完整(?:身分證|信用卡|銀行帳號|病歷)|診斷|藥物劑量|password|passcode|access code|alarm code|\bpin\s*[:：=]/i.test(shareable))
        return "偵測到可能的密碼、門禁碼、金融識別資料或不必要醫療細節。請改寫成受保護位置或權威來源的索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = ["符合本次計畫", "需要追蹤", "未測試", "因安全停止"].map((status) => ({
        status,
        count: observations.filter((row) => row.parts[4] === status).length,
      })).filter((item) => item.count > 0);
      const supportOutput = supportRows.length
        ? supportRows.map((row) => `${row.parts[0]}｜主要：${row.parts[1]}｜備援：${row.parts[2]}｜觀察：${row.parts[3]}`)
        : ["本次未另外列支援情境；請確認這是家庭實況，而不是漏掉兒少、長者、身心障礙、照護或寵物需求。"];
      return `${values.household.trim()}｜家庭緊急演練紀錄\n演練類型：${values.drillType}\n實際演練：${formatter.format(practiced)}\n觀察時間：${minutes} 分鐘（只記實況，不是安全及格分數）\n官方資訊／計畫版本：${values.guidance.trim()}\n目標與事先告知界線：${values.scope.trim()}\n參與者／角色：${participants.join("、")}\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n下次複查或重做：${formatter.format(followUp)}\n\n${lines("演練觀察", observations.map((row) => `${row.parts[0]}｜原定查核：${row.parts[1]}｜實際觀察：${row.parts[2]}｜改善：${row.parts[3]}｜狀態：${row.parts[4]}`))}\n\n${lines("人員、照護與寵物支援", supportOutput)}\n\n${lines("失聯、通訊與會合查核", communicationRows.map((row) => `${row.parts[0]}｜第一方法：${row.parts[1]}｜替代：${row.parts[2]}｜觀察：${row.parts[3]}`))}\n\n受保護的演練紀錄位置：${values.storage.trim()}\n\n結案前查核：每一筆「需要追蹤、未測試、因安全停止」都要有負責角色，先修正計畫或環境，再安排重做。這份輸出只記錄事先告知的演練，不是住宅安全認證、建築許可、醫療計畫或真實災害指令；實際事件一律以最新官方警報、緊急服務與現場安全為優先。`;
    },
  },
  "emergency-supply-inventory-audit": {
    intro:
      "依台灣最新官方資料與家庭實際需求，盤點眼前真的找得到、看得到日期與狀態的物資。工具只整理證據與追蹤，不替所有家庭開立固定數量，也不把結果當成防災合格證明。",
    fields: [
      text("household", "家庭識別名稱", "使用家人看得懂的暱稱，不必輸入完整地址。", "我們家"),
      {
        name: "scope",
        label: "本次盤點範圍",
        type: "select",
        options: [
          "個人緊急避難包",
          "日常居家防災儲備",
          "停電與通訊備援物資",
          "兒少、長者、身心障礙或照護支援模組",
          "寵物避難支援模組",
        ],
      },
      {
        name: "people",
        label: "本次涵蓋人數",
        type: "number",
        value: "3",
        help: "只作盤點脈絡，工具不會用人數自動乘出通用採購量。",
      },
      text("supportContext", "本次納入的額外需求", "只寫嬰幼兒照護、輔具電力、感官支援或寵物運送等類別，不要輸入診斷、藥量或完整身分資料。", "寵物運送；一位家人需要處方眼鏡"),
      { name: "reviewed", label: "實際逐項檢查日期", type: "date" },
      { name: "nextReview", label: "下次物資複查日期", type: "date" },
      text("authority", "本次採用的官方資料或家庭計畫", "寫來源名稱、版本與核對日期；不要只填無法追溯的網路清單。", "臺灣全民安全指引－緊急避難包，2026-08-23 核對；家庭需求清單第 2 版"),
      {
        name: "inventory",
        label: "實際盤點列",
        type: "textarea",
        help: "每行格式：識別碼 | 類別 | 品項 | 需求／來源註記 | 實際看到的數量與單位 | 狀態／日期證據 | 存放代稱 | 已確認可用、需輪替或更換、需求待查核、所選計畫缺少；最多 20 行。",
        value: "WATER-1 | 水與食物 | 飲用水 | 依全民安全指引與家庭計畫核定數量 | 實際看到 6 瓶；各瓶容量另存於受保護清冊 | 包裝完整；2026-08-23 核對標示日期 | 玄關避難包 | 已確認可用\nLIGHT-1 | 照明 | 頭燈與相符電池 | 全民安全指引，2026-08-23 核對 | 頭燈 1 具、相符電池 3 顆 | 已實際開機；電池包裝日期已記錄 | 玄關避難包 | 已確認可用\nPOWER-1 | 通訊與電力 | 行動電源與充電線 | 家庭失聯通訊計畫 | 行動電源 1 個、相符線材 1 條 | 實測時電量指示偏低 | 充電架 | 需輪替或更換\nCARE-1 | 個人支援 | 受保護照護計畫的物資索引 | 由本人與合適專業來源確認需求 | 已看到受保護計畫索引；細節不複製到分享稿 | 受保護計畫的複查日期尚未確認 | 個人支援袋 | 需求待查核",
      },
      {
        name: "actions",
        label: "每個未完成識別碼的追蹤",
        type: "textarea",
        help: "每行格式：未完成識別碼 | 下一動作 | 負責人或角色 | YYYY-MM-DD 期限。每個「需輪替或更換、需求待查核、所選計畫缺少」都要剛好一列；期限須晚於實際檢查且不晚於下次複查。",
        value: "POWER-1 | 完整充電後以預定手機和線材實測，再記錄實際結果 | 成人甲 | 2026-09-01\nCARE-1 | 由本人向合適專業來源核對現行需求，細節仍留在受保護計畫 | 照護計畫持有人 | 2026-09-05",
      },
      text("storage", "受保護的盤點紀錄位置", "只寫資料夾、信封或備份代稱，不要輸入密碼、門禁碼或公開位置。", "家庭文件／防災物資／2026-08"),
    ],
    run: (values) => {
      const reviewed = date(values.reviewed);
      const nextReview = date(values.nextReview);
      if (!values.household.trim()) return "請填寫家庭識別名稱，讓匯出後的盤點仍能辨識。";
      if (!reviewed) return "請輸入有效的實際逐項檢查日期。";
      if (!nextReview) return "請輸入有效的下次物資複查日期。";
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      if (reviewed.getTime() > today.getTime())
        return "實際逐項檢查日期不能晚於今天；只記錄真正看過的物資。";
      if (nextReview.getTime() <= reviewed.getTime())
        return "下次物資複查日期必須晚於實際逐項檢查日期。";
      const people = Number(values.people);
      if (!Number.isInteger(people) || people < 1 || people > 20)
        return "本次涵蓋人數請輸入 1 到 20 的整數；這只作脈絡，不是數量公式。";
      if (!values.authority.trim()) return "請填寫本次採用的官方資料或家庭計畫。";
      if (!values.storage.trim()) return "請填寫受保護的盤點紀錄位置。";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const inventoryRows = parseRows(values.inventory);
      if (inventoryRows.length === 0) return "請至少輸入一筆實際逐項檢查過的物資。";
      if (inventoryRows.length > 20) return "一份盤點最多 20 筆；更多物資請依背包、容器或用途拆成另一份。";
      const invalidInventory = inventoryRows.filter((row) => row.parts.length !== 8 || row.parts.some((part) => !part));
      if (invalidInventory.length)
        return `物資第 ${invalidInventory.map((row) => row.line).join("、")} 行必須完整填寫 8 個以直線分隔的欄位。`;
      const statuses = new Set(["已確認可用", "需輪替或更換", "需求待查核", "所選計畫缺少"]);
      const invalidStatuses = inventoryRows.filter((row) => !statuses.has(row.parts[7]));
      if (invalidStatuses.length)
        return `物資第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須是「已確認可用、需輪替或更換、需求待查核、所選計畫缺少」之一。`;
      const ids = inventoryRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length)
        return "每筆物資都要有唯一識別碼，避免追蹤工作連到錯誤品項。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "物資識別碼請使用 2 到 20 個英文字母、數字或連字號，例如 WATER-1。";
      const unresolved = inventoryRows.filter((row) => row.parts[7] !== "已確認可用");
      const actionRows = parseRows(values.actions);
      if (actionRows.length > 20) return "一份盤點最多 20 筆追蹤工作。";
      const invalidActions = actionRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidActions.length)
        return `追蹤第 ${invalidActions.map((row) => row.line).join("、")} 行必須完整填寫 4 個以直線分隔的欄位。`;
      const actionIds = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(actionIds).size !== actionIds.length)
        return "每個未完成物資識別碼只能有一筆追蹤；請合併同一品項的動作。";
      const unresolvedIds = new Set(unresolved.map((row) => row.parts[0].toLocaleUpperCase("en")));
      const missingActions = [...unresolvedIds].filter((id) => !actionIds.includes(id));
      if (missingActions.length)
        return `每個未完成物資都要建立一筆追蹤，尚缺：${missingActions.join("、")}。`;
      const extraActions = actionIds.filter((id) => !unresolvedIds.has(id));
      if (extraActions.length)
        return `追蹤只能連到未完成物資；請移除或更新：${extraActions.join("、")}。`;
      const invalidDueDates = actionRows.filter((row) => {
        const due = strictIsoDate(row.parts[3]);
        return !due || due.getTime() <= reviewed.getTime() || due.getTime() > nextReview.getTime();
      });
      if (invalidDueDates.length)
        return `追蹤第 ${invalidDueDates.map((row) => row.line).join("、")} 行需要真實的 YYYY-MM-DD 日期，而且須晚於實際檢查、不晚於下次複查。`;
      const shareable = [values.authority, values.supportContext, values.inventory, values.actions, values.storage].join("\n");
      if (/密碼|門禁碼|驗證碼|警報碼|完整(?:身分證|信用卡|銀行帳號|病歷)|診斷|藥物劑量|劑量|password|passcode|access code|alarm code|\bpin\s*[:：=]/i.test(shareable))
        return "偵測到可能的密碼、門禁碼、金融識別資料或不必要醫療細節。請改寫成受保護紀錄的索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const displayStatuses = ["已確認可用", "需輪替或更換", "需求待查核", "所選計畫缺少"];
      const statusCounts = displayStatuses.map((status) => ({
        status,
        count: inventoryRows.filter((row) => row.parts[7] === status).length,
      })).filter((item) => item.count > 0);
      const supportContext = values.supportContext.trim() || "本次未列額外支援類別；請再確認這是家庭實況，而不是漏掉兒少、長者、身心障礙、照護或寵物需求。";
      return `${values.household.trim()}｜家庭緊急物資盤點紀錄\n盤點範圍：${values.scope}\n實際逐項檢查：${formatter.format(reviewed)}\n下次物資複查：${formatter.format(nextReview)}\n本次涵蓋：${people} 人（只作脈絡，工具未開立數量）\n額外需求：${supportContext}\n官方資料／家庭計畫：${values.authority.trim()}\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}（不是防災準備分數）\n\n${lines("實際盤點", inventoryRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜${row.parts[2]}｜需求／來源：${row.parts[3]}｜實際看到：${row.parts[4]}｜證據：${row.parts[5]}｜存放：${row.parts[6]}｜狀態：${row.parts[7]}`))}\n\n${lines("必要追蹤", actionRows.length ? actionRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜負責：${row.parts[2]}｜期限：${formatter.format(strictIsoDate(row.parts[3]) as Date)}`) : ["本次沒有未完成列；仍應再次核對來源、範圍與實物證據，不能只憑統計宣稱完整。"])}\n\n受保護的盤點紀錄位置：${values.storage.trim()}\n\n結案前查核：把實際觀察與所在地最新官方資料、家庭個別需求、產品標示及說明書重新比對，保存日期證據，為每個未完成識別碼指定負責人，並在實際複查後更新來源紀錄。這份輸出不會開立固定數量、不代表避難包或住家已合格，也不取代醫療、無障礙、寵物照護與即時災害指引；真實事件以最新官方警報與現場指示為準。`;
    },
  },
  "emergency-contact-verification-log": {
    intro:
      "逐筆確認緊急聯絡資料是否由本人或官方來源核對、分享範圍是否清楚，以及每個失效項目由誰修正。這裡只放安全代稱，不輸入完整電話、Email、地址、帳號或照護秘密。",
    fields: [
      text("household", "家庭識別名稱", "使用家人看得懂的暱稱，不必輸入完整地址。", "我們家"),
      {
        name: "scope",
        label: "本次驗證範圍",
        type: "select",
        options: [
          "家庭防災聯絡計畫",
          "保母、看護或代管者的分享版聯絡表",
          "學校、托育或受照顧者聯絡資料",
          "社區、公用事業與居家服務聯絡資料",
          "家庭年度完整聯絡資料複查",
        ],
      },
      { name: "reviewed", label: "實際完成複查日期", type: "date" },
      { name: "nextReview", label: "下次聯絡資料複查日期", type: "date" },
      text("authority", "家庭計畫與官方來源", "寫本次核對的官方頁面、家庭計畫版本與日期；不要貼帳號、案件編號或個資。", "消防署全民防災 e 點通家庭防災卡說明，2026-08-23 核對；家庭聯絡計畫第 2 版"),
      {
        name: "records",
        label: "聯絡資料驗證列",
        type: "textarea",
        help: "每行格式：識別碼 | 角色／用途 | 受保護來源位置 | 安全聯絡管道提示 | 驗證方法／證據 | YYYY-MM-DD 驗證日期 | 分享／同意範圍 | 已由本人或官方來源確認、內容需要修正、等待確認、已停用待移除；最多 20 行。不要輸入完整電話或 Email。",
        value: "LOCAL-1 | 在地可信任聯絡人，供家庭報平安與住家確認 | 受保護家庭聯絡紀錄 LOCAL-1 | 手機末兩碼 42 | 本人直接確認角色、可用管道與允許的分享對象 | 2026-08-22 | 可放家庭私用防災卡，不公開張貼 | 已由本人或官方來源確認\nUTILITY-1 | 電力停電通報 | 受保護服務名錄 UTILITY-1 | 官方停電通報管道 | 對照業者官網與現行帳單來源 | 2026-08-23 | 家庭查詢用；帳戶資料仍留在受保護位置 | 已由本人或官方來源確認\nCARE-1 | 備援照護聯絡人 | 受保護照護計畫 CARE-1 | 聯絡提示待確認 | 已發出請求，等待本人確認角色、聯絡方式與可分享範圍 | 2026-08-20 | 本人確認前不得加入分享版 | 等待確認",
      },
      {
        name: "actions",
        label: "每個未完成識別碼的追蹤",
        type: "textarea",
        help: "每行格式：未完成識別碼 | 下一動作 | 負責人或角色 | YYYY-MM-DD 期限。每個「內容需要修正、等待確認、已停用待移除」都要剛好一列；期限須晚於本次複查且不晚於下次複查。",
        value: "CARE-1 | 請預定照護者確認角色、安全聯絡管道與可分享範圍，再更新受保護來源 | 家庭聯絡計畫負責人 | 2026-09-02",
      },
      text("storage", "受保護的驗證紀錄位置", "只寫資料夾、信封或備份代稱，不要輸入密碼、門禁碼、地址或實際聯絡資料。", "家庭文件／緊急聯絡／2026-08 驗證"),
    ],
    run: (values) => {
      const reviewed = strictIsoDate(values.reviewed);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.household.trim()) return "請填寫家庭識別名稱，讓匯出後的驗證紀錄仍能辨識。";
      if (!reviewed) return "請輸入真實有效的 YYYY-MM-DD 實際完成複查日期。";
      if (!nextReview) return "請輸入真實有效的 YYYY-MM-DD 下次聯絡資料複查日期。";
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      if (reviewed.getTime() > today.getTime())
        return "實際完成複查日期不能晚於今天；只記錄真正完成的驗證。";
      if (nextReview.getTime() <= reviewed.getTime())
        return "下次聯絡資料複查日期必須晚於實際完成複查日期。";
      if (!values.authority.trim()) return "請填寫本次採用的家庭計畫與官方來源。";
      if (!values.storage.trim()) return "請填寫受保護的驗證紀錄位置。";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const recordRows = parseRows(values.records);
      if (recordRows.length === 0) return "請至少輸入一筆實際複查過的聯絡資料。";
      if (recordRows.length > 20) return "一份紀錄最多 20 筆；更大的名錄請依用途或分享對象拆分。";
      const invalidRecords = recordRows.filter((row) => row.parts.length !== 8 || row.parts.some((part) => !part));
      if (invalidRecords.length)
        return `聯絡資料第 ${invalidRecords.map((row) => row.line).join("、")} 行必須完整填寫 8 個以直線分隔的欄位。`;
      const statuses = new Set(["已由本人或官方來源確認", "內容需要修正", "等待確認", "已停用待移除"]);
      const invalidStatuses = recordRows.filter((row) => !statuses.has(row.parts[7]));
      if (invalidStatuses.length)
        return `聯絡資料第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須是「已由本人或官方來源確認、內容需要修正、等待確認、已停用待移除」之一。`;
      const ids = recordRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length)
        return "每筆聯絡資料都要有唯一識別碼，避免修正工作連到錯誤來源。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "聯絡資料識別碼請使用 2 到 20 個英文字母、數字或連字號，例如 LOCAL-1。";
      const invalidVerificationDates = recordRows.filter((row) => {
        const verified = strictIsoDate(row.parts[5]);
        return !verified || verified.getTime() > reviewed.getTime() || verified.getTime() > today.getTime();
      });
      if (invalidVerificationDates.length)
        return `聯絡資料第 ${invalidVerificationDates.map((row) => row.line).join("、")} 行需要真實的 YYYY-MM-DD 驗證日期，而且不得晚於本次完成複查日期。`;
      const unsafeChannels = recordRows.filter((row) => row.parts[3].includes("@") || (row.parts[3].match(/\d/g) || []).length > 4);
      if (unsafeChannels.length)
        return `聯絡資料第 ${unsafeChannels.map((row) => row.line).join("、")} 行疑似含完整電話或 Email。請只寫「手機末兩碼 42」等安全提示，實際資料留在受保護來源。`;
      const unresolvedRows = recordRows.filter((row) => row.parts[7] !== "已由本人或官方來源確認");
      const actionRows = parseRows(values.actions);
      if (actionRows.length > 20) return "一份紀錄最多 20 筆追蹤工作。";
      const invalidActions = actionRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidActions.length)
        return `追蹤第 ${invalidActions.map((row) => row.line).join("、")} 行必須完整填寫 4 個以直線分隔的欄位。`;
      const actionIds = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(actionIds).size !== actionIds.length)
        return "每個未完成聯絡資料識別碼只能有一筆追蹤；請合併同一項目的動作。";
      const unresolvedIds = new Set(unresolvedRows.map((row) => row.parts[0].toLocaleUpperCase("en")));
      const missingActions = [...unresolvedIds].filter((id) => !actionIds.includes(id));
      if (missingActions.length)
        return `每個未完成聯絡資料都要建立一筆追蹤，尚缺：${missingActions.join("、")}。`;
      const extraActions = actionIds.filter((id) => !unresolvedIds.has(id));
      if (extraActions.length)
        return `追蹤只能連到未完成聯絡資料；請移除或更新：${extraActions.join("、")}。`;
      const invalidDueDates = actionRows.filter((row) => {
        const due = strictIsoDate(row.parts[3]);
        return !due || due.getTime() <= reviewed.getTime() || due.getTime() > nextReview.getTime();
      });
      if (invalidDueDates.length)
        return `追蹤第 ${invalidDueDates.map((row) => row.line).join("、")} 行需要真實的 YYYY-MM-DD 日期，而且須晚於本次複查、不晚於下次複查。`;
      const privacyText = [
        values.authority,
        values.storage,
        ...recordRows.flatMap((row) => [row.parts[1], row.parts[2], row.parts[3], row.parts[4], row.parts[6]]),
        ...actionRows.flatMap((row) => [row.parts[1], row.parts[2]]),
      ].join("\n");
      const contactPatternText = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(contactPatternText) || /(?:\d[\s().+-]*){7,}/.test(contactPatternText))
        return "偵測到可能的完整電話或 Email。請把實際聯絡資料留在受保護來源，這裡只寫安全提示。";
      if (/密碼|門禁碼|驗證碼|警報碼|完整地址|保單號碼|帳號|銀行帳戶|完整(?:身分證|病歷)|診斷|藥物劑量|劑量|出生日期|password|passcode|access code|alarm code|government id|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、地址、識別資料或不必要醫療細節。請改寫成受保護紀錄的索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const displayStatuses = ["已由本人或官方來源確認", "內容需要修正", "等待確認", "已停用待移除"];
      const statusCounts = displayStatuses.map((status) => ({
        status,
        count: recordRows.filter((row) => row.parts[7] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.household.trim()}｜家庭緊急聯絡資料驗證紀錄\n本次範圍：${values.scope}\n實際完成複查：${formatter.format(reviewed)}\n下次聯絡資料複查：${formatter.format(nextReview)}\n家庭計畫／官方來源：${values.authority.trim()}\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}（只反映工作流程，不是防災準備分數）\n\n${lines("已複查的聯絡資料", recordRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜受保護來源：${row.parts[2]}｜安全管道提示：${row.parts[3]}｜驗證證據：${row.parts[4]}｜驗證日期：${formatter.format(strictIsoDate(row.parts[5]) as Date)}｜分享／同意：${row.parts[6]}｜狀態：${row.parts[7]}`))}\n\n${lines("必要追蹤", actionRows.length ? actionRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜負責：${row.parts[2]}｜期限：${formatter.format(strictIsoDate(row.parts[3]) as Date)}`) : ["本次未記錄未完成項目；結案前仍要確認每個角色、來源與分享範圍真的逐筆查過。"])}\n\n受保護的驗證紀錄位置：${values.storage.trim()}\n\n結案前查核：先更新受保護來源，再替換或銷毀過期分享稿，並請一位預定使用者實際找到最新版。這份紀錄只含代稱與證據，不含聯絡資料本身；工具不會替你聯絡對方、驗證電信網路、取代 110、119、112 或保證任何人與服務一定可用。真實事件以所在地最新官方管道與指示為準。`;
    },
  },
  "household-power-outage-event-log": {
    intro:
      "建立有日期、來源與負責人的家庭停電事件紀錄，只寫實際觀察與待追蹤工作。工具不推測停電原因、復電時間，不判定食品、藥品或設備是否安全，也不決定責任、補償或理賠。",
    fields: [
      text("household", "家庭識別名稱", "使用家人看得懂的暱稱，不要填完整地址或台電電號。", "我們家"),
      {
        name: "stage",
        label: "目前紀錄階段",
        type: "select",
        options: [
          "仍在停電；持續記錄事實",
          "已觀察到供電恢復；家庭複查尚未完成",
          "家庭結案複查已完成",
        ],
      },
      {
        name: "scope",
        label: "實際觀察到的停電範圍",
        type: "select",
        options: [
          "官方來源顯示地區或台電供電事件",
          "大樓或共用系統受到影響",
          "單一住宅或住宅局部受到影響",
          "範圍尚未查明",
        ],
      },
      { name: "startDate", label: "第一次觀察到停電的日期", type: "date" },
      text("startTime", "第一次觀察時間（24 小時 HH:MM）", "填實際看到的時間；若是估計，請在來源／證據欄明寫。", "09:15"),
      { name: "restoredDate", label: "觀察到恢復供電的日期（仍停電請留白）", type: "date" },
      text("restoredTime", "觀察到恢復供電的時間（仍停電請留白）", "使用 24 小時 HH:MM；日期與時間必須同時填寫或同時留白。", ""),
      { name: "nextReview", label: "家庭下次複查日期", type: "date" },
      text("source", "官方來源與事件證據", "寫台電或負責單位、查詢管道、日期與安全案件提示；不要填電號、完整地址或憑證。", "台電官網停電查詢及通報，2026-08-23 核對；受保護通報索引 OUTAGE-1"),
      {
        name: "observations",
        label: "系統觀察列",
        type: "textarea",
        help: "每行格式：識別碼 | 區域／系統 | 第一次看到的狀況 | 來源／證據 | 家庭已完成動作 | 負責／觀察角色 | 已觀察持續追蹤、等待官方或合格人員查核、已復電待複查、複查後結案；最多 15 行。只寫事實，不自行診斷或下修理指令。",
        value: "POWER-1 | 住宅供電 | 第一次檢查時照明與一般插座無電 | 台電官網顯示地區事件，09:25 核對 | 已查官方頁面並保存事件索引 | 家庭協調人 | 已觀察持續追蹤\nCOLD-1 | 冰箱與冷凍庫 | 保持門扇關閉；本紀錄不判定內容物安全 | 開始時間與溫度證據存入受保護事件檔 | 已記錄狀況，待依現行衛生機關資料複查 | 食品紀錄負責人 | 等待官方或合格人員查核\nROUTER-1 | 家庭網路 | 第一次觀察時路由器因供電中斷而停止 | 指示燈無法顯示；未推測設備故障 | 已改用家庭既有的備援通訊方法 | 通訊負責人 | 已復電待複查",
      },
      {
        name: "support",
        label: "家庭個別支援來源",
        type: "textarea",
        help: "可留白。每行格式：支援類別 | 權威計畫或指示位置 | 只寫已觀察影響 | 負責角色；最多 8 行。不要填診斷、藥物劑量或設備設定。",
        value: "家庭通訊 | 受保護家庭通訊計畫 COMM-1 | 第一次檢查時家用網路無法使用 | 通訊負責人\n需電力支援事項 | 受保護照護紀錄 CARE-1 的製造商／服務提供者計畫 | 已要求複查備援狀態；本紀錄未做安全結論 | 照護計畫負責人",
      },
      {
        name: "actions",
        label: "每個未結案識別碼的追蹤",
        type: "textarea",
        help: "每行格式：未結案識別碼 | 下一個有證據的動作 | 負責人或角色 | YYYY-MM-DD 期限。每個不是「複查後結案」的項目都要剛好一列；期限可與停電日同日，且不得晚於下次複查。",
        value: "POWER-1 | 依家庭預定間隔重新查台電官方停復電狀態並記錄新的來源時間 | 家庭協調人 | 2026-08-23\nCOLD-1 | 把已記錄時間與溫度證據對照現行衛生主管機關資訊，保存個別決定的來源 | 食品紀錄負責人 | 2026-08-23\nROUTER-1 | 觀察供電穩定後測試原本連線並記錄結果，不推測停電原因 | 通訊負責人 | 2026-08-24",
      },
      text("storage", "受保護的事件紀錄位置", "只寫資料夾或信封代稱，不要填密碼、電號、完整地址或公開連結。", "家庭文件／停電事件／OUTAGE-1"),
    ],
    run: (values) => {
      const started = localDateTime(values.startDate, values.startTime);
      const restoredDatePresent = Boolean(values.restoredDate.trim());
      const restoredTimePresent = Boolean(values.restoredTime.trim());
      const restored = restoredDatePresent && restoredTimePresent
        ? localDateTime(values.restoredDate, values.restoredTime)
        : null;
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.household.trim()) return "請填寫家庭識別名稱，讓匯出後的事件紀錄仍能辨識。";
      if (!started) return "請輸入真實有效的第一次觀察日期，以及 24 小時制 HH:MM 時間。";
      const now = new Date();
      if (started.getTime() > now.getTime())
        return "第一次觀察停電的時間不能晚於現在；只記錄已實際發生的事件。";
      if (restoredDatePresent !== restoredTimePresent)
        return "觀察到恢復供電的日期與時間必須同時填寫；若仍停電，兩欄都請留白。";
      if ((restoredDatePresent || restoredTimePresent) && !restored)
        return "請輸入真實有效的恢復供電日期，以及 24 小時制 HH:MM 時間。";
      if (restored && restored.getTime() < started.getTime())
        return "觀察到恢復供電的時間不能早於第一次觀察停電的時間。";
      if (restored && restored.getTime() > now.getTime())
        return "觀察到恢復供電的時間不能晚於現在。";
      if (values.stage === "仍在停電；持續記錄事實" && restored)
        return "仍在停電的紀錄不應填恢復日期與時間；若已實際觀察到復電，請更新紀錄階段。";
      if (values.stage !== "仍在停電；持續記錄事實" && !restored)
        return "已復電或結案階段必須填寫實際觀察到恢復供電的日期與時間。";
      if (!nextReview) return "請輸入真實有效的 YYYY-MM-DD 家庭下次複查日期。";
      const startedDay = strictIsoDate(values.startDate) as Date;
      if (nextReview.getTime() < startedDay.getTime())
        return "家庭下次複查日期不能早於停電事件日期。";
      if (restored && nextReview.getTime() < (strictIsoDate(values.restoredDate) as Date).getTime())
        return "家庭下次複查日期不能早於觀察到恢復供電的日期。";
      if (!values.source.trim()) return "請填寫本次採用的官方來源與事件證據。";
      if (!values.storage.trim()) return "請填寫受保護的事件紀錄位置。";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const observationRows = parseRows(values.observations);
      if (observationRows.length === 0) return "請至少輸入一項實際看過的系統狀況。";
      if (observationRows.length > 15) return "一份事件最多 15 筆觀察；更複雜的事件請依位置或複查階段拆分。";
      const invalidObservations = observationRows.filter((row) => row.parts.length !== 7 || row.parts.some((part) => !part));
      if (invalidObservations.length)
        return `系統觀察第 ${invalidObservations.map((row) => row.line).join("、")} 行必須完整填寫 7 個以直線分隔的欄位。`;
      const statuses = new Set(["已觀察持續追蹤", "等待官方或合格人員查核", "已復電待複查", "複查後結案"]);
      const invalidStatuses = observationRows.filter((row) => !statuses.has(row.parts[6]));
      if (invalidStatuses.length)
        return `系統觀察第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須是「已觀察持續追蹤、等待官方或合格人員查核、已復電待複查、複查後結案」之一。`;
      const ids = observationRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length)
        return "每筆系統觀察都要有唯一識別碼，避免追蹤工作連到錯誤設備或區域。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "觀察識別碼請使用 2 到 20 個英文字母、數字或連字號，例如 POWER-1。";
      const supportRows = parseRows(values.support);
      if (supportRows.length > 8) return "一份事件最多 8 筆家庭個別支援來源。";
      const invalidSupport = supportRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidSupport.length)
        return `家庭支援第 ${invalidSupport.map((row) => row.line).join("、")} 行必須完整填寫 4 個以直線分隔的欄位。`;
      const unresolvedRows = observationRows.filter((row) => row.parts[6] !== "複查後結案");
      if (values.stage === "家庭結案複查已完成" && unresolvedRows.length)
        return `結案紀錄不能留有未完成觀察，請先複查或更新：${unresolvedRows.map((row) => row.parts[0]).join("、")}。`;
      const actionRows = parseRows(values.actions);
      if (actionRows.length > 15) return "一份事件最多 15 筆追蹤工作。";
      const invalidActions = actionRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidActions.length)
        return `追蹤第 ${invalidActions.map((row) => row.line).join("、")} 行必須完整填寫 4 個以直線分隔的欄位。`;
      const actionIds = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(actionIds).size !== actionIds.length)
        return "每個未結案觀察識別碼只能有一筆追蹤；請合併同一項目的動作。";
      const unresolvedIds = new Set(unresolvedRows.map((row) => row.parts[0].toLocaleUpperCase("en")));
      const missingActions = [...unresolvedIds].filter((id) => !actionIds.includes(id));
      if (missingActions.length)
        return `每個未結案觀察都要建立一筆追蹤，尚缺：${missingActions.join("、")}。`;
      const extraActions = actionIds.filter((id) => !unresolvedIds.has(id));
      if (extraActions.length)
        return `追蹤只能連到未結案觀察；請移除或更新：${extraActions.join("、")}。`;
      const invalidDueDates = actionRows.filter((row) => {
        const due = strictIsoDate(row.parts[3]);
        return !due || due.getTime() < startedDay.getTime() || due.getTime() > nextReview.getTime();
      });
      if (invalidDueDates.length)
        return `追蹤第 ${invalidDueDates.map((row) => row.line).join("、")} 行需要真實的 YYYY-MM-DD 日期，而且不得早於停電日、不得晚於下次複查。`;
      const privacyText = [values.source, values.observations, values.support, values.actions, values.storage].join("\n");
      if (/密碼|門禁碼|驗證碼|警報碼|電號|帳號|完整地址|銀行帳戶|完整(?:身分證|病歷)|診斷|藥物劑量|劑量|設備設定|password|passcode|access code|alarm code|account number|government id|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、電號、地址或不必要照護細節。請改寫成受保護紀錄的索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const formatMoment = (value: Date) => `${formatter.format(value)} ${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
      const displayStatuses = ["已觀察持續追蹤", "等待官方或合格人員查核", "已復電待複查", "複查後結案"];
      const statusCounts = displayStatuses.map((status) => ({
        status,
        count: observationRows.filter((row) => row.parts[6] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.household.trim()}｜家庭停電事件紀錄\n紀錄階段：${values.stage}\n觀察範圍：${values.scope}\n第一次觀察：${formatMoment(started)}\n觀察到恢復供電：${restored ? formatMoment(restored) : "尚未記錄；工具未預測復電時間"}\n家庭下次複查：${formatter.format(nextReview)}\n官方來源／事件證據：${values.source.trim()}\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}（只是工作摘要，不是安全或台電績效分數）\n\n${lines("系統與狀況觀察", observationRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜實際觀察：${row.parts[2]}｜證據：${row.parts[3]}｜已完成動作：${row.parts[4]}｜負責／觀察：${row.parts[5]}｜狀態：${row.parts[6]}`))}\n\n${lines("家庭個別支援來源", supportRows.length ? supportRows.map((row) => `${row.parts[0]}｜計畫／指示：${row.parts[1]}｜已觀察影響：${row.parts[2]}｜負責角色：${row.parts[3]}`) : ["本次未列獨立支援來源；請再確認這是家庭實況，而不是漏掉需要電力、通訊或照護支援的事項。"])}\n\n${lines("必要追蹤", actionRows.length ? actionRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜負責：${row.parts[2]}｜期限：${formatter.format(strictIsoDate(row.parts[3]) as Date)}`) : ["所有觀察都已在複查後結案；請將支持證據與本紀錄一起保存。"])}\n\n受保護的事件紀錄位置：${values.storage.trim()}\n\n這份輸出只記家庭觀察與有日期的來源查核。它不證明停電原因或台電計算時數、不預測復電、不認證配線或家電、不判定食品、藥品或需電力設備是否安全，也不決定責任、補償或保險理賠。看到掉落或外露電線不得靠近或碰觸；事件進行中，依台電、所在地主管機關、緊急服務與合格專業指示處理。`;
    },
  },
  "household-water-leak-event-log": {
    intro:
      "建立有日期、證據、通知與負責人的家庭漏水事件紀錄。工具不診斷漏水來源、不確認電氣或結構安全、不認證乾燥成果，也不估價或判定房東、住戶、廠商及保險責任。",
    fields: [
      text("household", "家庭代稱", "使用私密代稱，不要填完整地址、水號、保單或案件編號。", "青葉家庭"),
      {
        name: "stage",
        label: "紀錄階段",
        type: "select",
        options: [
          "仍觀察到出水或範圍擴大",
          "已未見持續出水，等待查核或修繕",
          "乾燥、修繕或復原複查中",
          "家庭結案複查已完成",
        ],
      },
      {
        name: "scope",
        label: "已觀察範圍",
        type: "select",
        options: [
          "單一衛浴、家電或可見接點",
          "單一房間或材料區域",
          "多房間或大樓共用區域",
          "範圍尚未確認",
        ],
      },
      { name: "startDate", label: "第一次觀察日期", type: "date" },
      text("startTime", "第一次觀察時間（24 小時 HH:MM）", "只填真正看到的時間；若為推估，請在證據文字註明。", "08:40"),
      { name: "stoppedDate", label: "最後觀察到持續出水停止日期（仍進行可留白）", type: "date" },
      text("stoppedTime", "最後觀察到持續出水停止時間（仍進行可留白）", "這只是觀察，不代表隱蔽來源已修好。日期與時間必須一起填或一起留白。", ""),
      { name: "nextReview", label: "家庭下次複查日期", type: "date" },
      text("authority", "負責來源與事件證據", "寫管理單位、供水單位、合格廠商或官方資料、查核日期及受保護索引；不要貼聯絡細節或案件編號。", "已通知管理單位並於 2026-08-23 聯繫合格廠商；受保護索引 LEAK-1"),
      {
        name: "observations",
        label: "區域與材料觀察",
        type: "textarea",
        help: "每行格式：ID | 區域或材料 | 可見或量測狀況 | 來源／證據 | 已完成動作 | 負責／觀察角色 | 已觀察持續追蹤、等待合格人員查核、乾燥或修繕進行中、複查後結案。最多 15 行，只寫事實，不寫自行診斷。",
        value: "WATER-1 | 浴室下方天花板 | 第一次檢查可見潮濕區，已標示邊界 | 有日期照片索引 LEAK-1-A | 移開可安全接近區域的物品並聯繫查核 | 家庭協調人 | 等待合格人員查核\nFLOOR-1 | 走道地板 | 門邊觀察到表面潮濕 | 有日期照片索引 LEAK-1-B | 保持區域淨空，未接觸任何電氣設備 | 安全觀察人 | 已觀察持續追蹤\nITEM-1 | 收納箱組 | 外部潮濕，內容物尚未由本表判定 | 物品 ID 已連到受保護事件資料夾 | 從安全乾燥位置完成拍照 | 紀錄負責人 | 乾燥或修繕進行中",
      },
      {
        name: "notifications",
        label: "通知與來源查核",
        type: "textarea",
        help: "選填。每行格式：負責角色或機構 | 已驗證管道描述 | 查核／通知日 YYYY-MM-DD | 回應或受保護索引 | 家庭負責人。最多 10 行。不要填完整電話、Email、地址、水號、案件或保單編號。",
        value: "大樓管理單位 | 依目前住戶公告核對聯絡管道 | 2026-08-23 | 已通知；受保護訊息索引 LEAK-1-N1 | 家庭協調人\n合格給排水廠商 | 依目前廠商紀錄核對管道 | 2026-08-23 | 已要求查核；預約證據存於受保護資料夾 | 修繕負責人",
      },
      {
        name: "actions",
        label: "每個未結案 ID 的追蹤",
        type: "textarea",
        help: "每行格式：未結案 ID | 下一個以證據為基礎的動作 | 負責角色 | 期限 YYYY-MM-DD。不是「複查後結案」的每筆觀察都要有且只能有一筆追蹤。",
        value: "WATER-1 | 保存合格人員查核內容，若確認修繕則連回本事件，不改寫最初觀察 | 修繕負責人 | 2026-08-24\nFLOOR-1 | 從相同安全位置複查標示邊界並新增有日期觀察 | 安全觀察人 | 2026-08-23\nITEM-1 | 依目前合格指示進行評估與乾燥，只記已完成工作與證據 | 紀錄負責人 | 2026-08-24",
      },
      text("storage", "受保護的事件紀錄位置", "只寫資料夾或信封代稱，不要填密碼、地址、水號、案件或保單編號。", "家庭文件／漏水事件／LEAK-1"),
    ],
    run: (values) => {
      const started = localDateTime(values.startDate, values.startTime);
      const stoppedDatePresent = Boolean(values.stoppedDate.trim());
      const stoppedTimePresent = Boolean(values.stoppedTime.trim());
      const stopped = stoppedDatePresent && stoppedTimePresent
        ? localDateTime(values.stoppedDate, values.stoppedTime)
        : null;
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.household.trim()) return "請填家庭代稱，讓匯出的事件紀錄可以辨識。";
      if (!started) return "請輸入真實的第一次觀察日期與 24 小時 HH:MM 時間。";
      const now = new Date();
      if (started.getTime() > now.getTime()) return "第一次觀察漏水事件的時間不能在未來。";
      if (stoppedDatePresent !== stoppedTimePresent)
        return "最後觀察到出水停止的日期與時間必須一起填；若仍在進行，兩者都留白。";
      if ((stoppedDatePresent || stoppedTimePresent) && !stopped)
        return "請輸入真實的出水停止觀察日期與 24 小時 HH:MM 時間。";
      if (stopped && stopped.getTime() < started.getTime())
        return "最後觀察到出水停止的時間不能早於第一次觀察。";
      if (stopped && stopped.getTime() > now.getTime()) return "出水停止的觀察時間不能在未來。";
      if (values.stage === "仍觀察到出水或範圍擴大" && stopped)
        return "事件仍進行時，出水停止日期與時間必須留白；只有實際觀察後才能更改階段。";
      if (values.stage !== "仍觀察到出水或範圍擴大" && !stopped)
        return "這個階段需要填最後觀察到持續出水停止的日期與時間；這個時間不代表隱蔽來源已修好。";
      if (!nextReview) return "請輸入真實的家庭下次複查日期。";
      const startedDay = strictIsoDate(values.startDate) as Date;
      if (nextReview.getTime() < startedDay.getTime()) return "家庭下次複查日期不能早於漏水事件日期。";
      if (stopped && nextReview.getTime() < (strictIsoDate(values.stoppedDate) as Date).getTime())
        return "家庭下次複查日期不能早於最後觀察到出水停止的日期。";
      if (!values.authority.trim()) return "請填寫本紀錄使用的負責來源與事件證據。";
      if (!values.storage.trim()) return "請填寫受保護的事件紀錄位置。";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const observationRows = parseRows(values.observations);
      if (observationRows.length === 0) return "請至少新增一筆真正觀察到的區域或材料狀況。";
      if (observationRows.length > 15) return "一份漏水事件最多 15 筆觀察；複雜事件請依區域或複查階段拆分。";
      const invalidObservations = observationRows.filter((row) => row.parts.length !== 7 || row.parts.some((part) => !part));
      if (invalidObservations.length)
        return `觀察第 ${invalidObservations.map((row) => row.line).join("、")} 行必須完整填寫 7 個以直線分隔的欄位。`;
      const statuses = new Set(["已觀察持續追蹤", "等待合格人員查核", "乾燥或修繕進行中", "複查後結案"]);
      const invalidStatuses = observationRows.filter((row) => !statuses.has(row.parts[6]));
      if (invalidStatuses.length)
        return `觀察第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須是已觀察持續追蹤、等待合格人員查核、乾燥或修繕進行中、複查後結案。`;
      const ids = observationRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length)
        return "每筆觀察都要有唯一 ID，避免追蹤連到錯誤區域或材料。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "觀察 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 WATER-1。";
      const notificationRows = parseRows(values.notifications);
      if (notificationRows.length > 10) return "一份事件最多 10 筆通知與來源查核。";
      const invalidNotifications = notificationRows.filter((row) => row.parts.length !== 5 || row.parts.some((part) => !part));
      if (invalidNotifications.length)
        return `通知第 ${invalidNotifications.map((row) => row.line).join("、")} 行必須完整填寫 5 個以直線分隔的欄位。`;
      const invalidNotificationDates = notificationRows.filter((row) => {
        const checked = strictIsoDate(row.parts[2]);
        return !checked || checked.getTime() < startedDay.getTime() || checked.getTime() > nextReview.getTime();
      });
      if (invalidNotificationDates.length)
        return `通知第 ${invalidNotificationDates.map((row) => row.line).join("、")} 行需要真實的 YYYY-MM-DD 日期，而且不得早於事件日、不得晚於下次複查。`;
      const unresolvedRows = observationRows.filter((row) => row.parts[6] !== "複查後結案");
      if (values.stage === "家庭結案複查已完成" && unresolvedRows.length)
        return `結案紀錄不能留有未完成觀察，請先複查或更新：${unresolvedRows.map((row) => row.parts[0]).join("、")}。`;
      const actionRows = parseRows(values.actions);
      if (actionRows.length > 15) return "一份事件最多 15 筆追蹤工作。";
      const invalidActions = actionRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidActions.length)
        return `追蹤第 ${invalidActions.map((row) => row.line).join("、")} 行必須完整填寫 4 個以直線分隔的欄位。`;
      const actionIds = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(actionIds).size !== actionIds.length)
        return "每個未結案觀察 ID 只能有一筆追蹤；請合併同一項目的動作。";
      const unresolvedIds = new Set(unresolvedRows.map((row) => row.parts[0].toLocaleUpperCase("en")));
      const missingActions = [...unresolvedIds].filter((id) => !actionIds.includes(id));
      if (missingActions.length) return `每個未結案觀察都要建立一筆追蹤，尚缺：${missingActions.join("、")}。`;
      const extraActions = actionIds.filter((id) => !unresolvedIds.has(id));
      if (extraActions.length) return `追蹤只能連到未結案觀察；請移除或更新：${extraActions.join("、")}。`;
      const invalidDueDates = actionRows.filter((row) => {
        const due = strictIsoDate(row.parts[3]);
        return !due || due.getTime() < startedDay.getTime() || due.getTime() > nextReview.getTime();
      });
      if (invalidDueDates.length)
        return `追蹤第 ${invalidDueDates.map((row) => row.line).join("、")} 行需要真實的 YYYY-MM-DD 日期，而且不得早於事件日、不得晚於下次複查。`;
      const privacyText = [values.authority, values.observations, values.notifications, values.actions, values.storage].join("\n");
      const contactPatternText = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(contactPatternText) || /(?:\d[\s().+-]*){7,}/.test(contactPatternText))
        return "偵測到可能的完整電話或 Email。請只寫已驗證管道描述，實際聯絡資料放在受保護來源。";
      if (/密碼|門禁碼|驗證碼|警報碼|水號|帳號|完整地址|保單編號|案件編號|銀行帳戶|完整(?:身分證|病歷)|診斷|藥物劑量|劑量|出生日期|password|passcode|access code|alarm code|account number|policy number|claim number|government id|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、水號、地址、案件、保單或不必要個資。請改寫成受保護紀錄索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const formatMoment = (value: Date) => `${formatter.format(value)} ${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
      const displayStatuses = ["已觀察持續追蹤", "等待合格人員查核", "乾燥或修繕進行中", "複查後結案"];
      const statusCounts = displayStatuses.map((status) => ({
        status,
        count: observationRows.filter((row) => row.parts[6] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.household.trim()}｜家庭漏水事件紀錄\n紀錄階段：${values.stage}\n觀察範圍：${values.scope}\n第一次觀察：${formatMoment(started)}\n最後觀察到持續出水停止：${stopped ? `${formatMoment(stopped)}（只是觀察，不代表隱蔽來源已修復）` : "尚未記錄；仍觀察出水或範圍變化"}\n家庭下次複查：${formatter.format(nextReview)}\n負責來源／事件證據：${values.authority.trim()}\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}（只是工作摘要，不是損害或安全分數）\n\n${lines("區域與材料觀察", observationRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜實際觀察：${row.parts[2]}｜證據：${row.parts[3]}｜已完成動作：${row.parts[4]}｜負責／觀察：${row.parts[5]}｜狀態：${row.parts[6]}`))}\n\n${lines("通知與來源查核", notificationRows.length ? notificationRows.map((row) => `${row.parts[0]}｜管道：${row.parts[1]}｜查核／通知：${formatter.format(strictIsoDate(row.parts[2]) as Date)}｜回應／索引：${row.parts[3]}｜家庭負責：${row.parts[4]}`) : ["本次未列通知；分享前請確認實際適用的管理、供水、房東、保險或合格廠商來源。"])}\n\n${lines("必要追蹤", actionRows.length ? actionRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜負責：${row.parts[2]}｜期限：${formatter.format(strictIsoDate(row.parts[3]) as Date)}`) : ["所有觀察都已在複查後結案；請將支持證據與本紀錄一起保存。"])}\n\n受保護的事件紀錄位置：${values.storage.trim()}\n\n這份輸出只整理家庭觀察、來源查核與工作流程。它不診斷水從何處來、不證明隱蔽漏水已停止、不確認電氣或結構安全、不認證防霉或乾燥成果、不估算損失、不授權修繕，也不決定房東、住戶、廠商、保險或法律責任。若水接近電氣、疑似污染水、結構變形、起火、受傷或其他立即危險，請保持距離並依所在地緊急服務、供水／供電、管理單位及合格專業人員的最新指示。`;
    },
  },
  "household-storm-readiness-review": {
    intro:
      "依台灣官方來源建立有日期、有證據及有負責人的家庭防颱複查。工具不抓取即時警報、不計算風險、不檢查住家，也不把完成清單當成安全或合格認證。",
    fields: [
      text("household", "家庭代稱", "使用私密代稱，不要填完整地址或帳號。", "青葉家庭"),
      {
        name: "context",
        label: "本次複查情境",
        type: "select",
        options: [
          "例行颱風季準備複查",
          "已查閱所在地官方更新",
          "家庭正在完成事件前工作",
          "災後經驗已納入下一版",
        ],
      },
      { name: "reviewDate", label: "本次複查日期", type: "date" },
      { name: "nextReview", label: "家庭下次複查日期", type: "date" },
      {
        name: "sources",
        label: "官方與負責來源地圖",
        type: "textarea",
        help: "每行格式：ID | 官方或負責來源 | 查核日 YYYY-MM-DD | 家庭用途 | 離線取得或證據 | 負責人。最多 10 行；要依住家實際轄區使用氣象署、地方政府、水利署、農村水保署、台電、管理單位或適用手冊。",
        value: "CWA-1 | 中央氣象署官方颱風資訊 | 2026-08-23 | 查警報、預報與發布時間 | 已保存複查日官方頁面，另核對可攜式收音來源 | 資訊查核人\nBLDG-1 | 目前大樓住戶公告 | 2026-08-23 | 共用區域與住戶責任 | 有日期公告存於受保護資料夾 | 大樓聯絡人\nPLAN-1 | 家庭防災計畫 | 2026-08-23 | 家庭角色、通訊與個別支援索引 | 備援協調人已找到目前離線版本 | 家庭協調人",
      },
      {
        name: "tasks",
        label: "家庭準備觀察",
        type: "textarea",
        help: "每行格式：ID | 區域或依賴項目 | 可觀察準備事實 | 證據 | 家庭負責人 | 本次已實物查核、行動或採購尚未完成、等待官方、管理或合格人員確認、不適用且已記依據 | 來源 ID。最多 20 行。",
        value: "EXT-1 | 陽台可移動物品 | 椅子已移到管理規約允許的室內位置 | 有日期照片索引 STORM-1-A | 家庭協調人 | 本次已實物查核 | BLDG-1\nSUP-1 | 照明與通訊 | 兩支手電筒實際亮起，正確備用電池已定位，官方收音來源已測 | 有日期物資紀錄 STORM-1-B | 物資查核人 | 本次已實物查核 | PLAN-1\nBLDG-2 | 電梯與共用區域計畫 | 尚未收到本次事件的住戶指示 | 來回訊息將存為 BLDG-2-N1 | 大樓聯絡人 | 等待官方、管理或合格人員確認 | BLDG-1",
      },
      {
        name: "actions",
        label: "每個未完成 ID 的追蹤",
        type: "textarea",
        help: "每行格式：未完成 ID | 下一個可查證動作 | 負責人 | 期限 YYYY-MM-DD。每個「行動或採購尚未完成」及「等待官方、管理或合格人員確認」都必須剛好有一筆追蹤。",
        value: "BLDG-2 | 取得本次事件的住戶指示並保存發布時間，不自行猜測共用設備如何運作 | 大樓聯絡人 | 2026-08-24",
      },
      text("storage", "受保護的複查紀錄位置", "只寫資料夾或信封代稱，不要填密碼、門牌、電話、帳號、保單或醫療細節。", "家庭文件／颱風準備／STORM-1"),
    ],
    run: (values) => {
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.household.trim()) return "請填家庭代稱，讓匯出的複查紀錄可以辨識。";
      if (!reviewDate) return "請輸入真實的本次複查日期 YYYY-MM-DD。";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "家庭颱風準備複查日期不能在未來。";
      if (!nextReview) return "請輸入真實的家庭下次複查日期 YYYY-MM-DD。";
      if (nextReview.getTime() < reviewDate.getTime()) return "家庭下次複查日期不能早於本次複查。";
      if (!values.storage.trim()) return "請填寫受保護的詳細複查紀錄位置。";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const sourceRows = parseRows(values.sources);
      if (sourceRows.length === 0) return "請至少新增一筆目前的官方或負責來源。";
      if (sourceRows.length > 10) return "一份家庭防颱複查最多整理 10 筆來源。";
      const invalidSources = sourceRows.filter((row) => row.parts.length !== 6 || row.parts.some((part) => !part));
      if (invalidSources.length)
        return `來源第 ${invalidSources.map((row) => row.line).join("、")} 行必須完整填寫 6 個以直線分隔的欄位。`;
      const sourceIds = sourceRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(sourceIds).size !== sourceIds.length) return "每筆來源都要有唯一 ID。";
      if (sourceIds.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "來源 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 CWA-1。";
      const invalidSourceDates = sourceRows.filter((row) => {
        const checked = strictIsoDate(row.parts[2]);
        return !checked || checked.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return `來源第 ${invalidSourceDates.map((row) => row.line).join("、")} 行需要真實查核日期，而且不得晚於本次複查。`;
      const taskRows = parseRows(values.tasks);
      if (taskRows.length === 0) return "請至少新增一筆真正查過的家庭準備觀察。";
      if (taskRows.length > 20) return "一份複查最多 20 筆準備觀察；複雜家庭請依區域或依賴項目拆分。";
      const invalidTasks = taskRows.filter((row) => row.parts.length !== 7 || row.parts.some((part) => !part));
      if (invalidTasks.length)
        return `準備觀察第 ${invalidTasks.map((row) => row.line).join("、")} 行必須完整填寫 7 個以直線分隔的欄位。`;
      const statuses = new Set([
        "本次已實物查核",
        "行動或採購尚未完成",
        "等待官方、管理或合格人員確認",
        "不適用且已記依據",
      ]);
      const invalidStatuses = taskRows.filter((row) => !statuses.has(row.parts[5]));
      if (invalidStatuses.length)
        return `準備觀察第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須使用欄位說明中的四種文字之一。`;
      const taskIds = taskRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(taskIds).size !== taskIds.length) return "每筆家庭準備觀察都要有唯一 ID。";
      if (taskIds.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "準備觀察 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 EXT-1。";
      const unknownSources = taskRows
        .filter((row) => !sourceIds.includes(row.parts[6].toLocaleUpperCase("en")))
        .map((row) => row.parts[0]);
      if (unknownSources.length)
        return `每筆準備觀察都要連到來源地圖中存在的來源 ID，請檢查：${unknownSources.join("、")}。`;
      const openRows = taskRows.filter((row) =>
        row.parts[5] === "行動或採購尚未完成" || row.parts[5] === "等待官方、管理或合格人員確認",
      );
      const actionRows = parseRows(values.actions);
      if (actionRows.length > 20) return "一份複查最多 20 筆追蹤工作。";
      const invalidActions = actionRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidActions.length)
        return `追蹤第 ${invalidActions.map((row) => row.line).join("、")} 行必須完整填寫 4 個以直線分隔的欄位。`;
      const actionIds = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(actionIds).size !== actionIds.length) return "每個未完成 ID 只能有一筆追蹤；請合併相同項目的下一步。";
      const openIds = new Set(openRows.map((row) => row.parts[0].toLocaleUpperCase("en")));
      const missingActions = [...openIds].filter((id) => !actionIds.includes(id));
      if (missingActions.length) return `每個未完成 ID 都要建立一筆追蹤，尚缺：${missingActions.join("、")}。`;
      const extraActions = actionIds.filter((id) => !openIds.has(id));
      if (extraActions.length) return `追蹤只能連到未完成 ID；請移除或更新：${extraActions.join("、")}。`;
      const invalidDueDates = actionRows.filter((row) => {
        const due = strictIsoDate(row.parts[3]);
        return !due || due.getTime() < reviewDate.getTime() || due.getTime() > nextReview.getTime();
      });
      if (invalidDueDates.length)
        return `追蹤第 ${invalidDueDates.map((row) => row.line).join("、")} 行需要真實期限，而且不得早於本次複查、不得晚於下次複查。`;
      const privacyText = [values.sources, values.tasks, values.actions, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話或 Email。請改寫成已驗證管道描述與受保護紀錄索引。";
      if (/密碼|門禁碼|驗證碼|警報碼|完整地址|完整門牌|帳號|保單編號|案件編號|銀行帳戶|完整(?:身分證|病歷)|診斷|藥名|藥物|劑量|設備設定|出生日期|精確避難地址|password|passcode|access code|alarm code|account number|policy number|claim number|government id|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、地址、帳號、保單、案件或不必要個人／照護細節。請改寫成受保護紀錄索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusOrder = [
        "本次已實物查核",
        "行動或採購尚未完成",
        "等待官方、管理或合格人員確認",
        "不適用且已記依據",
      ];
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: taskRows.filter((row) => row.parts[5] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.household.trim()}｜家庭颱風準備複查\n複查情境：${values.context}\n本次完成：${formatter.format(reviewDate)}\n家庭下次複查：${formatter.format(nextReview)}\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}（只表示工作流程，不是風險分數或安全認證）\n\n${lines("官方與負責來源地圖", sourceRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜查核：${formatter.format(strictIsoDate(row.parts[2]) as Date)}｜用途：${row.parts[3]}｜離線／證據：${row.parts[4]}｜負責：${row.parts[5]}`))}\n\n${lines("家庭準備觀察", taskRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜實際觀察：${row.parts[2]}｜證據：${row.parts[3]}｜負責：${row.parts[4]}｜狀態：${row.parts[5]}｜來源：${row.parts[6]}`))}\n\n${lines("必要追蹤", actionRows.length ? actionRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜負責：${row.parts[2]}｜期限：${formatter.format(strictIsoDate(row.parts[3]) as Date)}`) : ["本次沒有未完成項目；官方資訊或家庭狀況改變時，仍要立即更新來源與觀察。"])}\n\n受保護的複查紀錄位置：${values.storage.trim()}\n\n這份輸出只整理某日的家庭工作流程。它不抓取或取代官方警報、不預測颱風影響、不認證住家、路線、避難處所、物資或設備、不批准電氣、瓦斯、屋頂、樹木或積淹水作業、不保證供電供水、不決定留在家或撤離，也不證明保險、租屋、法令或建物規約合規。所在地主管機關、緊急服務與負責單位的最新指示永遠優先。`;
    },
  },
  "home-service-provider-verification-log": {
    intro:
      "把候選到府服務商的公開身分、這次工作範圍與未完成問題逐筆連回官方或第一方來源。工具不查政府資料、不驗證資格、不比較價格、不推薦業者，也不替家庭做選擇。",
    fields: [
      text("household", "家庭代稱", "使用私密代稱，不要填完整門牌、帳號或進出資訊。", "青葉家庭"),
      {
        name: "context",
        label: "本次查證情境",
        type: "select",
        options: [
          "例行更新家庭服務商名單",
          "正在比較維修或服務報價",
          "查核受專業或管理規範的工作",
          "重新檢視曾合作業者紀錄",
        ],
      },
      { name: "reviewDate", label: "本次查核日期", type: "date" },
      { name: "nextReview", label: "家庭下次複查日期", type: "date" },
      {
        name: "sources",
        label: "查證來源地圖",
        type: "textarea",
        help: "每行格式：ID | 負責來源或發證／出具者 | 查核日 YYYY-MM-DD | 精確查核問題 | 頁面顯示結果或受保護證據索引 | 負責人。最多 12 行。",
        value: "MOEA-1 | 經濟部商工登記公示資料 | 2026-08-23 | 報價抬頭是否和公開業者身分一致 | 公開名稱與安全的部分識別資料一致；截圖 MOEA-1 | 紀錄負責人\nQUOTE-1 | 業者書面估價 Q-1 | 2026-08-23 | 這次包含哪些工作、排除與變更方式 | 有日期估價列出檢查、工料假設、排除項目與變更程序 | 專案負責人\nBLDG-1 | 目前管委會或房東書面說明 | 2026-08-23 | 誰能同意進場與共用區域工作 | 已提出書面問題；回覆待存為 BLDG-1 | 管理聯絡人",
      },
      {
        name: "providers",
        label: "候選業者查證列",
        type: "textarea",
        help: "每行格式：ID | 公開業者代稱 | 這次要求的服務範圍 | 來源 ID（以逗號分開） | 書面證據摘要 | 負責人 | 身分與適用服務範圍已依來源記錄、書面範圍或報價仍待比較、資格、保險、許可或管理確認中、未選用或封存且已記理由。最多 15 行。",
        value: "PROV-1 | 青禾居家服務（公開代稱） | 檢查廚房可見漏水並提出書面發現與範圍 | MOEA-1,QUOTE-1 | 估價 Q-1 列出檢查、工料假設、排除項目與變更方式 | 專案負責人 | 身分與適用服務範圍已依來源記錄\nPROV-2 | 山林修繕（公開代稱） | 評估提案是否涉及大樓共用區域 | MOEA-1,BLDG-1 | 業者公開身分已記；大樓書面權限問題仍待確認 | 管理聯絡人 | 資格、保險、許可或管理確認中",
      },
      {
        name: "actions",
        label: "每個未完成業者 ID 的追蹤",
        type: "textarea",
        help: "每行格式：未完成業者 ID | 下一個可查證動作 | 負責人 | 期限 YYYY-MM-DD。每個報價比較未完成或資格／保險／許可／管理確認中業者，都必須剛好有一筆追蹤。",
        value: "PROV-2 | 取得管委會對共用區域範圍的書面決定並保存有日期回覆，再決定是否授權進場 | 管理聯絡人 | 2026-08-25",
      },
      text("storage", "受保護的原始證據位置", "只寫資料夾或信封代稱，不要填電話、Email、門牌、完整識別碼、付款資料、密碼或簽名。", "家庭文件／服務商／REVIEW-1"),
    ],
    run: (values) => {
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.household.trim()) return "請填家庭代稱，讓匯出的業者查證紀錄可以辨識。";
      if (!reviewDate) return "請輸入真實的本次查核日期 YYYY-MM-DD。";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "到府服務商查核日期不能在未來。";
      if (!nextReview) return "請輸入真實的家庭下次複查日期 YYYY-MM-DD。";
      if (nextReview.getTime() < reviewDate.getTime()) return "家庭下次複查日期不能早於本次查核。";
      if (!values.storage.trim()) return "請填寫原始來源、報價與聯絡資料的受保護位置。";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const sourceRows = parseRows(values.sources);
      if (sourceRows.length === 0) return "請至少新增一筆官方、發證／出具者或第一方查證來源。";
      if (sourceRows.length > 12) return "一份業者查證最多整理 12 筆來源。";
      const invalidSources = sourceRows.filter((row) => row.parts.length !== 6 || row.parts.some((part) => !part));
      if (invalidSources.length)
        return `來源第 ${invalidSources.map((row) => row.line).join("、")} 行必須完整填寫 6 個以直線分隔的欄位。`;
      const sourceIds = sourceRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(sourceIds).size !== sourceIds.length) return "每筆查證來源都要有唯一 ID。";
      if (sourceIds.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "來源 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 MOEA-1。";
      const invalidSourceDates = sourceRows.filter((row) => {
        const checked = strictIsoDate(row.parts[2]);
        return !checked || checked.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return `來源第 ${invalidSourceDates.map((row) => row.line).join("、")} 行需要真實查核日，而且不得晚於本次查核。`;
      const providerRows = parseRows(values.providers);
      if (providerRows.length === 0) return "請至少新增一筆連到來源的候選業者。";
      if (providerRows.length > 15) return "一份查證最多 15 筆候選業者；不同服務需求請拆開。";
      const invalidProviders = providerRows.filter((row) => row.parts.length !== 7 || row.parts.some((part) => !part));
      if (invalidProviders.length)
        return `候選業者第 ${invalidProviders.map((row) => row.line).join("、")} 行必須完整填寫 7 個以直線分隔的欄位。`;
      const statuses = new Set([
        "身分與適用服務範圍已依來源記錄",
        "書面範圍或報價仍待比較",
        "資格、保險、許可或管理確認中",
        "未選用或封存且已記理由",
      ]);
      const invalidStatuses = providerRows.filter((row) => !statuses.has(row.parts[6]));
      if (invalidStatuses.length)
        return `候選業者第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須使用欄位說明中的四種文字之一。`;
      const providerIds = providerRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(providerIds).size !== providerIds.length) return "每筆候選業者都要有唯一 ID。";
      if (providerIds.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "候選業者 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 PROV-1。";
      const unknownSources = providerRows.flatMap((row) =>
        row.parts[3].split(",").map((id) => id.trim().toLocaleUpperCase("en")).filter((id) => !sourceIds.includes(id)).map(() => row.parts[0]),
      );
      if (unknownSources.length)
        return `每筆候選業者只能連到來源地圖中存在的 ID，請檢查：${[...new Set(unknownSources)].join("、")}。`;
      const openRows = providerRows.filter((row) =>
        row.parts[6] === "書面範圍或報價仍待比較" || row.parts[6] === "資格、保險、許可或管理確認中",
      );
      const actionRows = parseRows(values.actions);
      if (actionRows.length > 15) return "一份業者查證最多 15 筆追蹤。";
      const invalidActions = actionRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidActions.length)
        return `追蹤第 ${invalidActions.map((row) => row.line).join("、")} 行必須完整填寫 4 個以直線分隔的欄位。`;
      const actionIds = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(actionIds).size !== actionIds.length) return "每個未完成業者 ID 只能有一筆追蹤。";
      const openIds = new Set(openRows.map((row) => row.parts[0].toLocaleUpperCase("en")));
      const missingActions = [...openIds].filter((id) => !actionIds.includes(id));
      if (missingActions.length) return `每個未完成業者 ID 都要建立一筆追蹤，尚缺：${missingActions.join("、")}。`;
      const extraActions = actionIds.filter((id) => !openIds.has(id));
      if (extraActions.length) return `追蹤只能連到未完成業者 ID；請移除或更新：${extraActions.join("、")}。`;
      const invalidDueDates = actionRows.filter((row) => {
        const due = strictIsoDate(row.parts[3]);
        return !due || due.getTime() < reviewDate.getTime() || due.getTime() > nextReview.getTime();
      });
      if (invalidDueDates.length)
        return `追蹤第 ${invalidDueDates.map((row) => row.line).join("、")} 行需要真實期限，而且不得早於本次查核、不得晚於下次複查。`;
      const privacyText = [values.sources, values.providers, values.actions, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email 或完整數字識別資料。請留在受保護原始證據，只在這裡放安全索引。";
      if (/密碼|門禁碼|驗證碼|警報碼|完整地址|完整門牌|帳號|卡號|銀行帳戶|匯款帳號|身分證|個人證照完整號碼|保單編號|案件編號|簽名|出生日期|私人推薦人聯絡|password|passcode|access code|account number|card number|government id|policy number|claim number|signature|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、地址、金融、身分、保單、簽名或私人推薦人資料。請改寫成受保護紀錄索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusOrder = [
        "身分與適用服務範圍已依來源記錄",
        "書面範圍或報價仍待比較",
        "資格、保險、許可或管理確認中",
        "未選用或封存且已記理由",
      ];
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: providerRows.filter((row) => row.parts[6] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.household.trim()}｜家庭到府服務商查證紀錄\n查證情境：${values.context}\n本次完成：${formatter.format(reviewDate)}\n家庭下次複查：${formatter.format(nextReview)}\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}（只表示工作流程，不是業者分數或背書）\n\n${lines("查證來源地圖", sourceRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜查核：${formatter.format(strictIsoDate(row.parts[2]) as Date)}｜問題：${row.parts[3]}｜顯示結果／證據：${row.parts[4]}｜負責：${row.parts[5]}`))}\n\n${lines("候選業者查證列", providerRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜要求範圍：${row.parts[2]}｜來源：${row.parts[3]}｜書面證據：${row.parts[4]}｜負責：${row.parts[5]}｜狀態：${row.parts[6]}`))}\n\n${lines("必要追蹤", actionRows.length ? actionRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜負責：${row.parts[2]}｜期限：${formatter.format(strictIsoDate(row.parts[3]) as Date)}`) : ["本次沒有未完成候選業者；下一次服務需求仍要重新查目前來源。"])}\n\n受保護的原始證據位置：${values.storage.trim()}\n\n這份輸出只是一份有日期的家庭研究紀錄。它不搜尋或驗證業者、不解讀商工、專業業別或證照範圍、不確認保險、許可、檢查、房東或大樓同意、不比較價格合理性、不評估施工品質、不授權入屋、不推薦或排名業者、不替家庭做聘用決定，也不證明契約、法律或工程合規。請依實際地點與工作範圍使用目前的負責來源。`;
    },
  },
  "home-repair-change-order-log": {
    intro:
      "把每個追加、刪減與材料替代連回不被覆寫的原契約基準。工具只在瀏覽器做算術與流程驗證，不建立契約、不收集簽名、不批准施工，也不判定費用是否應付。",
    fields: [
      text("project", "私密工程代稱", "使用家庭代稱與施工區域，不要填完整門牌或私人業者聯絡資料。", "青葉家庭廚房修繕"),
      {
        name: "context",
        label: "本次紀錄情境",
        type: "select",
        options: [
          "進行中工程變更複查",
          "下一次進度付款前核對",
          "完工結案前總整理",
          "保存爭議中或未完成的歷史",
        ],
      },
      {
        name: "currency",
        label: "幣別標籤",
        type: "select",
        options: ["TWD", "USD", "CAD", "AUD", "GBP", "EUR", "其他幣別"],
      },
      { name: "agreementDate", label: "原約定日期", type: "date" },
      { name: "recordDate", label: "本次變更紀錄日期", type: "date" },
      { name: "nextReview", label: "家庭下次複查日期", type: "date" },
      text("baseline", "原約定證據與範圍", "寫明精確契約或接受估價版本、包含工作與重要排除；不要貼簽名或私人聯絡。", "已簽契約 C-1；更換指定櫃門；不含插座移位與牆面修補"),
      { name: "originalAmount", label: "原約定總額", type: "number", value: "120000" },
      { name: "originalDays", label: "原預定工期（日曆天）", type: "number", value: "20" },
      {
        name: "changes",
        label: "有版本的追加變更列",
        type: "textarea",
        help: "每行格式：ID | 提出日期 YYYY-MM-DD | 提出角色 | 精確增加、刪減或替代內容 | 原因或觀察證據 | 費用影響數字或 pending | 工期影響天數或 pending | 書面決定或結案證據索引 | 負責人 | 提案中，等待書面範圍、價格或工期、已書面同意，尚未完成、已拒絕或撤回，且已記理由、已完成，且連結結案證據。最多 15 行。",
        value: "CHG-1 | 2026-08-23 | 家庭工程負責人 | 水槽由型號 A 改為 B，包含新固定五金 | 型號 A 缺貨，供應商通知 SUP-2 | 2500 | 2 | 書面同意 CHANGE-CHG-1 | 工程負責人 | 已書面同意，尚未完成\nCHG-2 | 2026-08-23 | 業者工程窗口 | 只在已開啟區域增加受損基底修補 | 可見狀況 PHOTO-7；尚未取得書面工法與價格 | pending | pending | 提案請求 CHANGE-CHG-2 | 工程負責人 | 提案中，等待書面範圍、價格或工期",
      },
      {
        name: "actions",
        label: "每個未結案變更 ID 的追蹤",
        type: "textarea",
        help: "每行格式：未結案變更 ID | 下一個書面或結案證據 | 負責人 | 期限 YYYY-MM-DD。每個提案中或已同意但未完成的 ID，都必須剛好一筆追蹤。",
        value: "CHG-1 | 完成變更水槽範圍走查並保存有日期結案證據 | 工程負責人 | 2026-08-28\nCHG-2 | 決定前取得逐項書面提案，列出工法、費用與工期影響 | 工程負責人 | 2026-08-26",
      },
      text("storage", "受保護的原始文件位置", "只寫資料夾或信封代稱，不要填地址、電話、Email、簽名、帳號、付款、身分、證照、保單或理賠資料。", "家庭文件／修繕／PROJECT-C1"),
    ],
    run: (values) => {
      const agreementDate = strictIsoDate(values.agreementDate);
      const recordDate = strictIsoDate(values.recordDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.project.trim()) return "請填私密工程代稱，讓匯出的變更紀錄可以辨識。";
      if (!agreementDate) return "請輸入真實的原約定日期 YYYY-MM-DD。";
      if (!recordDate) return "請輸入真實的本次變更紀錄日期 YYYY-MM-DD。";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (recordDate.getTime() > today.getTime()) return "本次變更紀錄日期不能在未來。";
      if (agreementDate.getTime() > recordDate.getTime()) return "原約定日期不能晚於本次變更紀錄日期。";
      if (!nextReview) return "請輸入真實的家庭下次複查日期 YYYY-MM-DD。";
      if (nextReview.getTime() < recordDate.getTime()) return "家庭下次複查日期不能早於本次變更紀錄。";
      if (!values.baseline.trim()) return "請填精確的原約定證據與範圍基準。";
      if (!values.storage.trim()) return "請填原契約、同意、請款與結案證據的受保護位置。";
      const originalAmount = Number(values.originalAmount);
      const originalDays = Number(values.originalDays);
      if (!Number.isFinite(originalAmount) || originalAmount < 0 || originalAmount > 1_000_000_000_000)
        return "原約定總額請填 0 到 1,000,000,000,000，不要加幣別符號或千分位。";
      if (!Number.isInteger(originalDays) || originalDays < 0 || originalDays > 3650)
        return "原預定工期請填 0 到 3,650 的整數日曆天。";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const changeRows = parseRows(values.changes);
      if (changeRows.length === 0) return "請至少新增一筆有版本的追加變更列。";
      if (changeRows.length > 15) return "一份工程複查最多 15 筆變更；更多內容請建立下一份有日期的複查。";
      const invalidChanges = changeRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidChanges.length)
        return `變更第 ${invalidChanges.map((row) => row.line).join("、")} 行必須完整填寫 10 個以直線分隔的欄位。`;
      const changeIds = changeRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(changeIds).size !== changeIds.length) return "每筆追加變更都要有唯一 ID。";
      if (changeIds.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "變更 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 CHG-1。";
      const invalidChangeDates = changeRows.filter((row) => {
        const requested = strictIsoDate(row.parts[1]);
        return !requested || requested.getTime() < agreementDate.getTime() || requested.getTime() > recordDate.getTime();
      });
      if (invalidChangeDates.length)
        return `變更第 ${invalidChangeDates.map((row) => row.line).join("、")} 行需要真實提出日，且必須介於原約定與本次紀錄之間。`;
      const statuses = new Set([
        "提案中，等待書面範圍、價格或工期",
        "已書面同意，尚未完成",
        "已拒絕或撤回，且已記理由",
        "已完成，且連結結案證據",
      ]);
      const invalidStatuses = changeRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `變更第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須使用欄位說明中的四種文字之一。`;
      const costPattern = /^(?:pending|-?(?:0|[1-9]\d*)(?:\.\d{1,2})?)$/i;
      const dayPattern = /^(?:pending|-?(?:0|[1-9]\d*))$/i;
      const invalidEffects = changeRows.filter((row) => {
        if (!costPattern.test(row.parts[5]) || !dayPattern.test(row.parts[6])) return true;
        const cost = row.parts[5].toLocaleLowerCase("en") === "pending" ? null : Number(row.parts[5]);
        const days = row.parts[6].toLocaleLowerCase("en") === "pending" ? null : Number(row.parts[6]);
        return (cost !== null && Math.abs(cost) > 1_000_000_000) || (days !== null && Math.abs(days) > 3650);
      });
      if (invalidEffects.length)
        return `變更第 ${invalidEffects.map((row) => row.line).join("、")} 行費用最多兩位小數、工期須為整數日；請用正負數字、0 或 pending。`;
      const decidedRows = changeRows.filter((row) =>
        row.parts[9] === "已書面同意，尚未完成" || row.parts[9] === "已完成，且連結結案證據",
      );
      const unresolvedDecided = decidedRows.filter((row) =>
        row.parts[5].toLocaleLowerCase("en") === "pending" || row.parts[6].toLocaleLowerCase("en") === "pending" || /(?:待補|待確認|尚未|pending|awaiting|none|n\/a)/i.test(row.parts[7]),
      );
      if (unresolvedDecided.length)
        return `已同意或已完成的變更第 ${unresolvedDecided.map((row) => row.line).join("、")} 行，需要數字費用、數字工期及明確書面決定或結案證據索引。`;
      const invalidDeclines = changeRows.filter((row) =>
        row.parts[9] === "已拒絕或撤回，且已記理由" && (Number(row.parts[5]) !== 0 || Number(row.parts[6]) !== 0),
      );
      if (invalidDeclines.length)
        return `已拒絕或撤回的變更第 ${invalidDeclines.map((row) => row.line).join("、")} 行必須使用費用 0、工期 0，才能排除在同意總額外。`;
      const openRows = changeRows.filter((row) =>
        row.parts[9] === "提案中，等待書面範圍、價格或工期" || row.parts[9] === "已書面同意，尚未完成",
      );
      const actionRows = parseRows(values.actions);
      if (actionRows.length > 15) return "一份工程複查最多 15 筆追蹤。";
      const invalidActions = actionRows.filter((row) => row.parts.length !== 4 || row.parts.some((part) => !part));
      if (invalidActions.length)
        return `追蹤第 ${invalidActions.map((row) => row.line).join("、")} 行必須完整填寫 4 個以直線分隔的欄位。`;
      const actionIds = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(actionIds).size !== actionIds.length) return "每個未結案變更 ID 只能有一筆追蹤。";
      const openIds = new Set(openRows.map((row) => row.parts[0].toLocaleUpperCase("en")));
      const missingActions = [...openIds].filter((id) => !actionIds.includes(id));
      if (missingActions.length) return `每個未結案變更 ID 都要建立一筆追蹤，尚缺：${missingActions.join("、")}。`;
      const extraActions = actionIds.filter((id) => !openIds.has(id));
      if (extraActions.length) return `追蹤只能連到提案中或已同意但未完成的變更 ID；請移除或更新：${extraActions.join("、")}。`;
      const invalidDueDates = actionRows.filter((row) => {
        const due = strictIsoDate(row.parts[3]);
        return !due || due.getTime() < recordDate.getTime() || due.getTime() > nextReview.getTime();
      });
      if (invalidDueDates.length)
        return `追蹤第 ${invalidDueDates.map((row) => row.line).join("、")} 行需要真實期限，而且不得早於本次紀錄、不得晚於下次複查。`;
      const privacyText = [
        values.baseline,
        values.storage,
        ...changeRows.flatMap((row) => [row.parts[2], row.parts[3], row.parts[4], row.parts[7], row.parts[8]]),
        ...actionRows.flatMap((row) => [row.parts[1], row.parts[2]]),
      ].join("\n");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(privacyText) || /(?:\d[\s().+-]*){7,}/.test(privacyText))
        return "偵測到可能的完整電話、Email 或完整數字識別資料。請留在受保護原始證據，只在這裡放安全索引。";
      if (/密碼|門禁碼|驗證碼|警報碼|完整地址|完整門牌|帳號|卡號|銀行帳戶|匯款帳號|身分證|個人證照完整號碼|保單編號|案件編號|簽名|出生日期|私人聯絡|password|passcode|access code|account number|card number|government id|policy number|claim number|signature|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、地址、金融、身分、證照、保單、簽名或私人聯絡資料。請改寫成受保護紀錄索引。";
      const acceptedCost = decidedRows.reduce((sum, row) => sum + Number(row.parts[5]), 0);
      const acceptedDays = decidedRows.reduce((sum, row) => sum + Number(row.parts[6]), 0);
      const reconciledAmount = originalAmount + acceptedCost;
      const reconciledDays = originalDays + acceptedDays;
      if (reconciledAmount < 0 || reconciledDays < 0)
        return "已同意變更不能讓目前算術總額或預定工期小於零，請重新核對原基準與正負效果。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const numberFormatter = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 2 });
      const statusOrder = [
        "提案中，等待書面範圍、價格或工期",
        "已書面同意，尚未完成",
        "已拒絕或撤回，且已記理由",
        "已完成，且連結結案證據",
      ];
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: changeRows.filter((row) => row.parts[9] === status).length,
      })).filter((item) => item.count > 0);
      const pendingCount = changeRows.filter((row) =>
        row.parts[5].toLocaleLowerCase("en") === "pending" || row.parts[6].toLocaleLowerCase("en") === "pending",
      ).length;
      return `${values.project.trim()}｜居家修繕追加變更紀錄\n紀錄情境：${values.context}\n原約定日期：${formatter.format(agreementDate)}\n本次變更核對：${formatter.format(recordDate)}\n家庭下次複查：${formatter.format(nextReview)}\n幣別：${values.currency}\n原約定總額：${numberFormatter.format(originalAmount)}\n已同意變更影響：${acceptedCost >= 0 ? "+" : ""}${numberFormatter.format(acceptedCost)}\n目前算術總額：${numberFormatter.format(reconciledAmount)}\n原預定工期：${originalDays} 日曆天\n已同意工期影響：${acceptedDays >= 0 ? "+" : ""}${acceptedDays} 日曆天\n目前算術工期：${reconciledDays} 日曆天\n仍為 pending 的提案效果：${pendingCount} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n原約定證據與範圍：${values.baseline.trim()}\n\n${lines("有版本的追加變更列", changeRows.map((row) => `${row.parts[0]}｜${formatter.format(strictIsoDate(row.parts[1]) as Date)} 由 ${row.parts[2]} 提出｜變更：${row.parts[3]}｜原因／觀察：${row.parts[4]}｜費用影響：${row.parts[5]} ${values.currency}｜工期影響：${row.parts[6]} 天｜證據：${row.parts[7]}｜負責：${row.parts[8]}｜狀態：${row.parts[9]}`))}\n\n${lines("必要追蹤", actionRows.length ? actionRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜負責：${row.parts[2]}｜期限：${formatter.format(strictIsoDate(row.parts[3]) as Date)}`) : ["本次沒有提案中或已同意但未完成的變更；請保留拒絕歷史，再核對最終請款與結案證據。"])}\n\n受保護的原始文件位置：${values.storage.trim()}\n\n以上總數只是算術核對。這份輸出不建立或變更契約、不驗證身分、代理權、同意、簽名或送達、不判定費用是否有效、合理、到期、應付或受保障、不授權施工或付款、不檢查施工品質與隱蔽狀況、不批准許可或檢查、不認證完工、驗收、安全、保固、保險、稅務、權利負擔或法律合規、不延長任何通知與期限，也不解決爭議。請保存原始文件，並依實際地點與工程使用目前的負責來源。`;
    },
  },
  "home-repair-punch-list": {
    intro:
      "把每個可見項目連回控制中的契約或變更範圍，並把業者回報處理和家庭再次複查分開。工具不檢查施工、不認定瑕疵、不建立正式驗收或完工、不批准付款，也不取代合格專業來源。",
    fields: [
      text("project", "私密工程代稱", "使用家庭代稱與施工區域，不要填完整門牌或私人業者聯絡資料。", "青葉家庭廚房裝潢"),
      {
        name: "context",
        label: "本次走查情境",
        type: "select",
        options: [
          "完工前家庭自行走查",
          "收到業者完工通知後複查",
          "業者回報處理後再次查看",
          "保存未完成或爭議中的歷史",
        ],
      },
      { name: "baselineDate", label: "控制範圍基準日", type: "date", value: "2026-08-01" },
      { name: "reviewDate", label: "本次缺失紀錄日", type: "date", value: "2026-08-23" },
      { name: "nextReview", label: "家庭下次複查日", type: "date", value: "2026-08-30" },
      text("baseline", "控制中的範圍與變更證據", "寫明實際契約或接受估價版本，加上已同意變更 ID；不要覆寫基準，也不要貼簽名或私人聯絡。", "CONTRACT-C1＋已同意 CHG-1、CHG-3；不含餐廳油漆"),
      {
        name: "items",
        label: "有版本的缺失複查列",
        type: "textarea",
        help: "每行格式：ID | 區域或構件 | 可見狀況 | 原範圍或變更索引 | 觀察日期 YYYY-MM-DD | 照片或文件索引 | 下一個證據、處理或結案理由 | 負責角色 | 目標或複查日期 YYYY-MM-DD | 已觀察，等待書面回覆、已規劃處理，尚未複查、業者回報已處理，等待複查、已關閉，連結有日期的複查證據、已封存，未繼續追蹤且已記理由。最多 15 行。",
        value: "PL-1 | 廚房東側櫃門 | 全開時碰到旁板 | CONTRACT-C1 第四節與 DRAWING-A3 | 2026-08-23 | PHOTO-18 | 業者回報調整後重新查看全開行程並保存日期證據 | 家庭工程負責人 | 2026-08-28 | 已規劃處理，尚未複查\nPL-2 | 走道地坪 | 固定燈光下可見三片地磚邊緣高低差 | CHG-3 與 TILE-SCHEDULE-T2 | 2026-08-20 | PHOTO-22 與 RECHECK-24 | 回報處理後已再次查看，連結有日期複查證據 | 家庭工程負責人 | 2026-08-23 | 已關閉，連結有日期的複查證據",
      },
      text("storage", "受保護的原始證據位置", "只寫資料夾或信封代稱，不要填地址、電話、Email、簽名、帳號、付款、身分、證照、保單或理賠資料。", "家庭文件／裝潢／PROJECT-C1／缺失複查"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.project.trim()) return "請填私密工程代稱，讓匯出的缺失複查表可以辨識。";
      if (!baselineDate) return "請輸入真實的控制範圍基準日 YYYY-MM-DD。";
      if (!reviewDate) return "請輸入真實的本次缺失紀錄日 YYYY-MM-DD。";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "本次缺失紀錄日不能在未來。";
      if (baselineDate.getTime() > reviewDate.getTime()) return "控制範圍基準日不能晚於本次缺失紀錄日。";
      if (!nextReview) return "請輸入真實的家庭下次複查日 YYYY-MM-DD。";
      if (nextReview.getTime() < reviewDate.getTime()) return "家庭下次複查日不能早於本次缺失紀錄。";
      if (!values.baseline.trim()) return "請填精確的控制契約、估價與已同意變更證據。";
      if (!values.storage.trim()) return "請填原範圍、照片、回覆、檢查與複查證據的受保護位置。";
      const parseRows = (source: string) =>
        source.split("\n").map((raw, index) => ({
          line: index + 1,
          parts: raw.split("|").map((part) => part.trim()),
        })).filter((row) => row.parts.some(Boolean));
      const itemRows = parseRows(values.items);
      if (itemRows.length === 0) return "請至少新增一筆缺失複查列。";
      if (itemRows.length > 15) return "一份缺失複查最多 15 筆；更多項目請建立下一份有日期的版本。";
      const invalidRows = itemRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `缺失複查第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整填寫 10 個以直線分隔的欄位。`;
      const ids = itemRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆缺失複查都要有唯一 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "缺失 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 PL-1。";
      const invalidObservationDates = itemRows.filter((row) => {
        const observed = strictIsoDate(row.parts[4]);
        return !observed || observed.getTime() < baselineDate.getTime() || observed.getTime() > reviewDate.getTime();
      });
      if (invalidObservationDates.length)
        return `缺失複查第 ${invalidObservationDates.map((row) => row.line).join("、")} 行需要真實觀察日，且必須介於控制範圍基準與本次紀錄之間。`;
      const statusOrder = [
        "已觀察，等待書面回覆",
        "已規劃處理，尚未複查",
        "業者回報已處理，等待複查",
        "已關閉，連結有日期的複查證據",
        "已封存，未繼續追蹤且已記理由",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = itemRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `缺失複查第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須使用欄位說明中的五種文字之一。`;
      const openStatuses = new Set(statusOrder.slice(0, 3));
      const openRows = itemRows.filter((row) => openStatuses.has(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的缺失第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標或複查日必須從本次紀錄日起，到家庭下次複查日為止。`;
      const closedRows = itemRows.filter((row) => !openStatuses.has(row.parts[9]));
      const invalidClosedDates = closedRows.filter((row) => {
        const observed = strictIsoDate(row.parts[4]) as Date;
        const closed = strictIsoDate(row.parts[8]);
        return !closed || closed.getTime() < observed.getTime() || closed.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已關閉或封存的缺失第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於原觀察日與本次紀錄日之間的實際複查或封存日。`;
      const vagueActions = itemRows.filter((row) =>
        row.parts[6].length < 8 || /^(?:好了|完成|已修|固定|ok|無|不用|不追)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `缺失複查第 ${vagueActions.map((row) => row.line).join("、")} 行需要具體的下一個證據、處理內容或結案理由，不能只寫通用完成詞。`;
      const weakPointers = itemRows.filter((row) => row.parts[3].length < 4 || row.parts[5].length < 4);
      if (weakPointers.length)
        return `缺失複查第 ${weakPointers.map((row) => row.line).join("、")} 行需要具體的控制範圍與日期證據索引。`;
      const privacyText = [values.project, values.baseline, values.items, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email 或完整數字識別資料。請留在受保護原始證據，只在這裡放安全索引。";
      if (/密碼|門禁碼|驗證碼|警報碼|完整地址|完整門牌|帳號|卡號|銀行帳戶|匯款帳號|身分證|個人證照完整號碼|保單編號|案件編號|簽名|出生日期|私人聯絡|password|passcode|access code|account number|card number|government id|policy number|claim number|signature|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、地址、金融、身分、證照、保單、簽名或私人聯絡資料。請改寫成受保護紀錄索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: itemRows.filter((row) => row.parts[9] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.project.trim()}｜居家修繕缺失複查表\n本次走查情境：${values.context}\n控制範圍基準日：${formatter.format(baselineDate)}\n本次缺失紀錄：${formatter.format(reviewDate)}\n家庭下次複查：${formatter.format(nextReview)}\n仍開放：${openRows.length} 筆\n已關閉或封存：${closedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n控制中的範圍與已同意變更：${values.baseline.trim()}\n\n${lines("有版本的缺失複查列", itemRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜${formatter.format(strictIsoDate(row.parts[4]) as Date)} 觀察：${row.parts[2]}｜控制來源：${row.parts[3]}｜證據：${row.parts[5]}｜下一個證據／處理／結案理由：${row.parts[6]}｜負責角色：${row.parts[7]}｜目標／複查／封存日：${formatter.format(strictIsoDate(row.parts[8]) as Date)}｜狀態：${row.parts[9]}`))}\n\n受保護的原始證據位置：${values.storage.trim()}\n\n這份輸出只是家庭可見觀察與追蹤紀錄。它不檢查施工或隱蔽工程、不診斷原因、不認定瑕疵、不驗證產品、許可或檢查、不認證施工品質、完工、驗收、安全、法規或法律合規、不授權施工、付款或扣款、不啟動或變更保固、不計算或延長任何期限、不代表放棄權利、不分配責任，也不解決爭議。請保存原始來源，並依實際工程使用契約、主管機關與合格專業人員。`;
    },
  },
  "home-repair-closeout-checklist": {
    intro:
      "整理最後範圍、變更、缺失歷史、發票、付款、許可、產品、保固與結案仍缺資料，誠實分開索取、收到、歸檔與缺件。工具不認證完工、驗收或文件效力、不批准付款、不啟動保固，也不取代負責來源。",
    fields: [
      text("project", "私密工程代稱", "使用家庭代稱與施工區域，不要填完整地址或私人業者聯絡資料。", "青葉家庭廚房裝潢"),
      {
        name: "context",
        label: "本次結案資料檢視情境",
        type: "select",
        options: [
          "最後工程會議前的家庭資料核對",
          "收到業者完工通知後檢視",
          "完成走查後的結案檔案核對",
          "保存未完成或爭議中的歷史",
        ],
      },
      { name: "baselineDate", label: "原約定日期", type: "date", value: "2026-08-01" },
      { name: "reviewDate", label: "本次資料包檢視日", type: "date", value: "2026-08-23" },
      { name: "nextReview", label: "家庭下次文件追蹤日", type: "date", value: "2026-08-30" },
      text("baseline", "控制範圍與工程歷史證據", "寫明原約定、已同意變更與最後範圍核對，不要貼簽名或私人聯絡資料。", "CONTRACT-C1＋已同意 CHG-1、CHG-3；最後範圍核對 SCOPE-R1"),
      {
        name: "items",
        label: "有版本的結案資料包列",
        type: "textarea",
        help: "每行格式：ID | 資料包類別 | 精確預期文件 | 控制範圍、變更或缺失索引 | 出具或負責來源角色 | 證據日期 YYYY-MM-DD 或 MISSING | 受保護檔案或索取紀錄索引 | 下一個證據步驟或結案理由 | 負責角色 | 目標或歸檔日期 YYYY-MM-DD | 已提出索取，等待來源、已收到，等待家庭檢視、已歸檔，連結來源日期與位置、不適用，已連結理由與來源、結案仍缺，已連結缺件說明。最多 18 行。",
        value: "CO-1 | 最後範圍 | 包含已同意 CHG-1 與 CHG-3 的最後範圍核對 | CONTRACT-C1、CHG-1、CHG-3 | 家庭工程檔案 | 2026-08-23 | SCOPE-R1 | 依未改寫的範圍歷史核對最後發票與缺失 ID | 家庭工程負責人 | 2026-08-23 | 已歸檔，連結來源日期與位置\nCO-2 | 最後發票 | 反映已同意變更與 CREDIT-2 的最後發票 | INVOICE-03、CHG-1、CHG-3、CREDIT-2 | 業者請款角色 | MISSING | REQUEST-5 | 取得有日期的最後發票並保存原檔，再由家庭逐項檢視 | 家庭工程負責人 | 2026-08-29 | 已提出索取，等待來源\nCO-3 | 安裝產品 | 安裝設備產品表、說明書與保固條款 | SCOPE-R1、PRODUCT-SCHEDULE-P2 | 業者結案資料角色 | 2026-08-22 | PRODUCT-PACKAGE-2 | 核對型號、文件頁數與受保護資產連結後再歸檔 | 家庭資產負責人 | 2026-08-28 | 已收到，等待家庭檢視",
      },
      text("storage", "受保護的原始文件位置", "只寫資料夾或信封代稱，不要填地址、電話、Email、簽名、帳號、付款、身分、證照、保單或理賠資料。", "家庭文件／裝潢／PROJECT-C1／結案資料包"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.project.trim()) return "請填私密工程代稱，讓匯出的結案資料包清單可以辨識。";
      if (!baselineDate) return "請輸入真實的原約定日期 YYYY-MM-DD。";
      if (!reviewDate) return "請輸入真實的本次資料包檢視日 YYYY-MM-DD。";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "本次資料包檢視日不能在未來。";
      if (baselineDate.getTime() > reviewDate.getTime()) return "原約定日期不能晚於本次結案資料檢視。";
      if (!nextReview) return "請輸入真實的家庭下次文件追蹤日 YYYY-MM-DD。";
      if (nextReview.getTime() < reviewDate.getTime()) return "家庭下次文件追蹤日不能早於本次資料包檢視。";
      if (!values.baseline.trim()) return "請填控制中的原約定、已同意變更與最後範圍核對證據。";
      if (!values.storage.trim()) return "請填原始結案文件與缺件說明的受保護位置。";
      const itemRows = values.items.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (itemRows.length === 0) return "請至少新增一筆預期結案資料列。";
      if (itemRows.length > 18) return "一份結案資料檢視最多 18 筆；更多項目請建立下一份有日期的版本。";
      const invalidRows = itemRows.filter((row) => row.parts.length !== 11 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `結案資料第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整填寫 11 個以直線分隔的欄位。`;
      const ids = itemRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆結案資料都要有唯一 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "結案資料 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 CO-1。";
      const statusOrder = [
        "已提出索取，等待來源",
        "已收到，等待家庭檢視",
        "已歸檔，連結來源日期與位置",
        "不適用，已連結理由與來源",
        "結案仍缺，已連結缺件說明",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = itemRows.filter((row) => !statuses.has(row.parts[10]));
      if (invalidStatuses.length)
        return `結案資料第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須使用欄位說明中的五種文字之一。`;
      const requestedRows = itemRows.filter((row) => row.parts[10] === statusOrder[0]);
      const receivedRows = itemRows.filter((row) => row.parts[10] === statusOrder[1]);
      const filedRows = itemRows.filter((row) => row.parts[10] === statusOrder[2]);
      const notApplicableRows = itemRows.filter((row) => row.parts[10] === statusOrder[3]);
      const unresolvedRows = itemRows.filter((row) => row.parts[10] === statusOrder[4]);
      const openRows = [...requestedRows, ...receivedRows];
      const closedRows = [...filedRows, ...notApplicableRows, ...unresolvedRows];
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[9]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的結案資料第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標日必須從本次檢視日起，到家庭下次文件追蹤日為止。`;
      const invalidClosedDates = closedRows.filter((row) => {
        const filed = strictIsoDate(row.parts[9]);
        return !filed || filed.getTime() < baselineDate.getTime() || filed.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已歸檔、不適用或結案仍缺的第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於原約定日與本次檢視日之間的實際歸檔或封存決定日。`;
      const rowsRequiringEvidenceDate = [...receivedRows, ...filedRows, ...notApplicableRows];
      const invalidEvidenceDates = rowsRequiringEvidenceDate.filter((row) => {
        const evidence = strictIsoDate(row.parts[5]);
        return !evidence || evidence.getTime() < baselineDate.getTime() || evidence.getTime() > reviewDate.getTime();
      });
      if (invalidEvidenceDates.length)
        return `結案資料第 ${invalidEvidenceDates.map((row) => row.line).join("、")} 行需要介於原約定日與本次檢視日之間的真實來源或決定日期。`;
      const shouldBeMissing = [...requestedRows, ...unresolvedRows].filter((row) => row.parts[5].toLocaleUpperCase("en") !== "MISSING");
      if (shouldBeMissing.length)
        return `已索取或結案仍缺的第 ${shouldBeMissing.map((row) => row.line).join("、")} 行，在預期來源尚不存在時，證據日期必須填 MISSING。`;
      const missingPointers = itemRows.filter((row) => row.parts[3].length < 4 || row.parts[4].length < 4 || row.parts[6].length < 4 || row.parts[6].toLocaleUpperCase("en") === "MISSING");
      if (missingPointers.length)
        return `結案資料第 ${missingPointers.map((row) => row.line).join("、")} 行需要控制索引、負責來源角色，以及受保護的檔案、索取紀錄或缺件說明索引。`;
      const vagueActions = itemRows.filter((row) =>
        row.parts[7].length < 8 || /^(?:完成|好了|已好|已歸檔|無|不用|不適用|待追蹤|ok)$/i.test(row.parts[7]),
      );
      if (vagueActions.length)
        return `結案資料第 ${vagueActions.map((row) => row.line).join("、")} 行需要具體的下一個證據步驟或保留的結案理由，不能只寫通用完成詞。`;
      const privacyText = [values.project, values.baseline, values.items, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email 或完整數字識別資料。請留在受保護原始證據，只在這裡放安全索引。";
      if (/密碼|門禁碼|驗證碼|警報碼|完整地址|完整門牌|帳號|卡號|銀行帳戶|匯款帳號|身分證|統一編號完整資料|個人證照完整號碼|保單編號|案件編號|簽名|出生日期|私人聯絡|發票載具登入|付款憑證完整資料|password|passcode|access code|account number|card number|government id|policy number|claim number|signature|taxpayer id|invoice login|payment credential|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、地址、金融、身分、證照、保單、簽名、稅務或私人聯絡資料。請改寫成受保護紀錄索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: itemRows.filter((row) => row.parts[10] === status).length,
      })).filter((item) => item.count > 0);
      const dateOrMissing = (value: string) => value.toLocaleUpperCase("en") === "MISSING" ? "MISSING" : formatter.format(strictIsoDate(value) as Date);
      return `${values.project.trim()}｜居家修繕結案資料包清單\n本次檢視情境：${values.context}\n原約定日期：${formatter.format(baselineDate)}\n本次資料包檢視：${formatter.format(reviewDate)}\n家庭下次文件追蹤：${formatter.format(nextReview)}\n仍在索取或檢視：${openRows.length} 筆\n已歸檔、不適用或封存缺件：${closedRows.length} 筆\n結案仍缺：${unresolvedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n控制中的範圍與工程歷史：${values.baseline.trim()}\n\n${lines("有版本的結案資料包列", itemRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜預期文件：${row.parts[2]}｜控制來源：${row.parts[3]}｜出具／負責來源：${row.parts[4]}｜證據日期：${dateOrMissing(row.parts[5])}｜受保護檔案／索取／缺件索引：${row.parts[6]}｜下一個證據步驟／結案理由：${row.parts[7]}｜負責角色：${row.parts[8]}｜目標／歸檔／封存日：${formatter.format(strictIsoDate(row.parts[9]) as Date)}｜狀態：${row.parts[10]}`))}\n\n受保護的原始文件位置：${values.storage.trim()}\n\n這份輸出只是家庭文件清單。它不檢查施工、不驗證文件真偽或法律充分性、不認證施工品質、完工、驗收、安全、法規或法律合規、不判斷許可或檢查是否適用與結果、不授權付款或扣款、不證明送達、不解除請求或權利負擔、不啟動或變更保固、不分類稅務處理、不計算或延長任何期限、不代表放棄權利、不分配責任，也不解決爭議。請保存原始來源，並依實際工程使用契約、主管機關與合格專業人員。`;
    },
  },
  "warranty-claim-evidence-log": {
    intro:
      "建立產品保固申請時間線，分開家庭觀察、送出內容、送達證據、業者回覆、追蹤與結果。工具不診斷產品、不判定保固涵蓋，也不計算法律期限。",
    fields: [
      text("asset", "私密產品代稱", "使用家庭資產代稱，不要填完整序號、地址、帳號或私人聯絡資料。", "廚房冰箱 ASSET-A1"),
      {
        name: "context",
        label: "目前申請檢視情境",
        type: "select",
        options: [
          "準備第一次書面保固申請",
          "已送出申請後追蹤",
          "檢視維修、更換或退款證據",
          "保存尚未解決或有爭議的歷史",
        ],
      },
      { name: "observedDate", label: "問題首次發現日", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: "本次時間線檢視日", type: "date", value: "2026-08-23" },
      { name: "nextReview", label: "家庭下次追蹤複查日", type: "date", value: "2026-08-30" },
      text("basis", "控制中的產品、交易與書面保證來源", "使用受保護索引，寫明提供者與條款版本，不要貼完整識別或聯絡資料。", "ASSET-A1；購買證明 PURCHASE-P1；製造商書面保證 TERMS-W2，2026-08-20 取得"),
      text("observation", "第一次家庭觀察", "描述可見、可聽或量測狀況，不要假裝有技術診斷。", "冷卻警示出現且顯示溫度上升；未拆面板；安全與召回來源另行核對"),
      {
        name: "events",
        label: "有版本的保固申請時間線事件",
        type: "textarea",
        help: "每行格式：ID | 事件類型 | 客觀觀察、請求或回覆 | 行動者或來源角色 | 事件日期 YYYY-MM-DD | 受保護證據索引 | 下一步或結案理由 | 負責角色 | 目標或結案日期 YYYY-MM-DD | 已準備，尚未送出、已送出，連結送達證據、已收到回覆，連結來源、需要追蹤，連結先前證據、已結案，連結結果證據、已移交，連結申訴案件索引。最多 16 行。",
        value: "WR-1 | 第一次書面申請 | 回報冷卻警示並要求書面確認保固申請流程 | 家庭資產負責人 | 2026-08-20 | REQUEST-R1 與 DELIVERY-R1 | 請保證提供者以書面確認案件索引與下一個檢測步驟 | 家庭資產負責人 | 2026-08-26 | 已送出，連結送達證據\nWR-2 | 業者受理回覆 | 業者開啟服務流程並提出預約，尚未表示保固涵蓋結論 | 保證提供者客服角色 | 2026-08-21 | RESPONSE-R1 與 CASE-REF-1 | 對照 TERMS-W2 核對預約安排並確認進入住家時段 | 家庭資產負責人 | 2026-08-25 | 已收到回覆，連結來源\nWR-3 | 後續追蹤節點 | 等待服務後有來源的書面結果 | 家庭資產負責人 | 2026-08-23 | FOLLOWUP-NOTE-1 連結 RESPONSE-R1 | 以有日期的訊息引用 CASE-REF-1 並索取書面服務與涵蓋結果 | 家庭資產負責人 | 2026-08-29 | 需要追蹤，連結先前證據",
      },
      text("storage", "受保護的原始證據位置", "只寫資料夾代稱，不要填地址、電話、Email、完整序號、案件編號、憑證、簽名或付款資料。", "家庭文件／家電／ASSET-A1／保固申請 WR-2026-1"),
    ],
    run: (values) => {
      const observedDate = strictIsoDate(values.observedDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.asset.trim()) return "請填私密產品代稱，讓匯出的保固申請時間線可以辨識。";
      if (!observedDate) return "請輸入真實的問題首次發現日 YYYY-MM-DD。";
      if (!reviewDate) return "請輸入真實的本次時間線檢視日 YYYY-MM-DD。";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "本次時間線檢視日不能在未來。";
      if (observedDate.getTime() > reviewDate.getTime()) return "問題首次發現日不能晚於本次檢視日。";
      if (!nextReview) return "請輸入真實的家庭下次追蹤複查日 YYYY-MM-DD。";
      if (nextReview.getTime() < reviewDate.getTime()) return "家庭下次追蹤複查日不能早於本次檢視。";
      if (!values.basis.trim()) return "請填確切產品、購買證據與書面保證或服務契約條款的受保護索引。";
      if (!values.observation.trim()) return "請填第一次家庭觀察，不要自行建立技術診斷。";
      if (!values.storage.trim()) return "請填原始申請、回覆與結果證據的受保護位置。";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "請至少新增一筆保固申請時間線事件。";
      if (eventRows.length > 16) return "一次檢視最多 16 筆事件；更多事件請建立下一份有日期的時間線版本。";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `保固事件第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整填寫 10 個以直線分隔的欄位。`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆保固申請時間線事件都要有唯一 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "保固事件 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 WR-1。";
      const statusOrder = [
        "已準備，尚未送出",
        "已送出，連結送達證據",
        "已收到回覆，連結來源",
        "需要追蹤，連結先前證據",
        "已結案，連結結果證據",
        "已移交，連結申訴案件索引",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `保固事件第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須使用欄位說明中的六種文字之一。`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[4]);
        return !eventDate || eventDate.getTime() < observedDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `保固事件第 ${invalidEventDates.map((row) => row.line).join("、")} 行需要介於問題首次發現日與本次檢視日之間的真實事件日期。`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 4).includes(row.parts[9]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(4).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的保固事件第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標日必須從本次檢視日起，到家庭下次追蹤複查日為止。`;
      const invalidClosedDates = closedRows.filter((row) => {
        const closed = strictIsoDate(row.parts[8]);
        return !closed || closed.getTime() < observedDate.getTime() || closed.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已結案或已移交的保固事件第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於問題首次發現日與本次檢視日之間的實際結案或移交日期。`;
      const missingSources = eventRows.filter((row) => row.parts[3].length < 4 || row.parts[5].length < 4 || row.parts[5].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `保固事件第 ${missingSources.map((row) => row.line).join("、")} 行需要行動者或來源角色，以及受保護的草稿、送達、回覆、結果或申訴索引。`;
      const vagueActions = eventRows.filter((row) =>
        row.parts[6].length < 8 || /^(?:完成|好了|已好|修好|已解決|無|不用|不適用|待追蹤|已結案|ok)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `保固事件第 ${vagueActions.map((row) => row.line).join("、")} 行需要具體的下一個證據步驟或保留的結案理由，不能只寫通用完成詞。`;
      const privacyText = [values.asset, values.basis, values.observation, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email、序號、案件或完整數字識別資料。請留在受保護原始證據，只在這裡放安全索引。";
      if (/密碼|門禁碼|驗證碼|警報碼|完整地址|完整門牌|帳號|卡號|銀行帳戶|匯款帳號|身分證|完整序號|案件編號|理賠編號|保單編號|簽名|出生日期|私人聯絡|付款憑證完整資料|登入憑證|法律策略|申訴表全文|password|passcode|access code|account number|card number|government id|full serial|serial number|case number|claim number|policy number|signature|payment credential|login credential|legal strategy|complaint form|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、地址、金融、身分、完整序號、案件、保單、簽名、申訴或私人聯絡資料。請改寫成受保護紀錄索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: eventRows.filter((row) => row.parts[9] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.asset.trim()}｜產品保固申請證據時間線\n目前檢視情境：${values.context}\n問題首次發現：${formatter.format(observedDate)}\n本次時間線檢視：${formatter.format(reviewDate)}\n家庭下次追蹤複查：${formatter.format(nextReview)}\n仍開放事件：${openRows.length} 筆\n已結案或移交事件：${closedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n控制中的產品、交易與書面保證來源：${values.basis.trim()}\n第一次家庭觀察：${values.observation.trim()}\n\n${lines("有版本的保固申請時間線", eventRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜觀察／請求／回覆：${row.parts[2]}｜行動者／來源：${row.parts[3]}｜事件日期：${formatter.format(strictIsoDate(row.parts[4]) as Date)}｜受保護證據：${row.parts[5]}｜下一步／結案理由：${row.parts[6]}｜負責角色：${row.parts[7]}｜目標／結案／移交日：${formatter.format(strictIsoDate(row.parts[8]) as Date)}｜狀態：${row.parts[9]}`))}\n\n受保護的原始證據位置：${values.storage.trim()}\n\n這份輸出只是家庭證據索引。它不診斷產品、不判斷安全或召回狀態、不驗證證據或送達、不決定保固或服務契約涵蓋、不授權檢修、寄送、付款、更換或退款、不計算契約或法律期限、不建立消費申訴、不分配過失或責任、不代表放棄權利，也不解決爭議。請依製造商與負責商品安全機關的現行指示處理，保存原始來源，並由實際保證提供者、主管機關或合適專業人士作成真正決定。`;
    },
  },
  "product-recall-action-log": {
    intro:
      "依主管機關與業者公告建立產品身分比對、家庭行動、業者回覆及改善結果時間線。工具不會連線查召回、不檢驗產品，也不產生停用或處理指示。",
    fields: [
      text("asset", "私密產品代稱", "使用家庭資產代號，不要填完整序號、訂單號、地址、帳號或私人聯絡資料。", "檯面家電 ASSET-P7"),
      {
        name: "context",
        label: "目前召回複查情境",
        type: "select",
        options: [
          "已收到官方公告，產品身分尚未完成比對",
          "正在比對完整產品識別與公告範圍",
          "官方改善或業者回覆正在處理",
          "正在複查結果、移轉或處理證據",
        ],
      },
      { name: "noticeDate", label: "官方公告發布或更新日", type: "date", value: "2026-08-22" },
      { name: "reviewDate", label: "家庭本次召回複查日", type: "date", value: "2026-08-23" },
      { name: "nextReview", label: "家庭下次追蹤節點", type: "date", value: "2026-08-30" },
      text("noticeSources", "控制中的主管機關與業者公告來源", "使用公開網址或安全來源 ID 並保留版本日期，不要貼私人案件或聯絡資料。", "標檢局公告 NOTICE-N1，2026-08-22 發布；業者召回頁 MFR-N1，2026-08-23 複查"),
      text("identityBasis", "受保護的產品身分比對依據", "指向完整銘牌、型號、批號、製造日期或序號區間比對，不暴露完整識別。", "ASSET-P7/LABEL-2 與 NOTICE-N1 公告範圍比對；是否受影響尚未作成結論"),
      {
        name: "actions",
        label: "有版本的召回處置行動",
        type: "textarea",
        help: "每行格式：ID | 行動類型 | 有來源的指示、比對、請求、回覆或結果 | 行動者或來源角色 | 行動日期 YYYY-MM-DD | 受保護證據索引 | 下一步或結案理由 | 負責角色 | 目標或結果日期 YYYY-MM-DD | 公告已保存，產品身分待比對、產品身分比對中，連結來源、已確認受影響，連結官方來源、官方改善處理中，連結證據、官方改善已完成，連結結果、未受影響，連結精確比對來源、家庭已不持有，連結移轉或處理紀錄。最多 16 行。",
        value: "RC-1 | 官方公告保存 | 保存公告範圍、危害說明、現行消費者行動與改善文字，未自行改寫指示 | 商品安全主管機關公告 | 2026-08-22 | NOTICE-N1 | 先遵循公告立即指示，再完成受保護產品身分精確比對 | 家庭資產負責人 | 2026-08-23 | 公告已保存，產品身分待比對\nRC-2 | 受保護身分比對 | 已連結銘牌紀錄與公告所列型號、批號及製造日期欄位，結論仍待來源確認 | 家庭資產負責人依主管機關與業者來源 | 2026-08-23 | ASSET-P7-LABEL-2 與 NOTICE-N1 | 透過公告指定管道請業者召回角色確認比對並保存回覆 | 家庭資產負責人 | 2026-08-25 | 產品身分比對中，連結來源",
      },
      text("storage", "受保護的原始證據位置", "只寫資料夾代稱，不要填完整序號、地址、電話、Email、案件、物流、帳號、憑證、簽名或付款資料。", "家庭文件／商品安全／ASSET-P7／召回 NOTICE-N1"),
    ],
    run: (values) => {
      const noticeDate = strictIsoDate(values.noticeDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.asset.trim()) return "請填私密產品代稱，讓匯出的召回處置紀錄可以辨識。";
      if (!noticeDate) return "請輸入控制公告的真實發布或更新日 YYYY-MM-DD。";
      if (!reviewDate) return "請輸入真實的家庭本次召回複查日 YYYY-MM-DD。";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "家庭本次召回複查日不能在未來。";
      if (noticeDate.getTime() > reviewDate.getTime()) return "官方公告日期不能晚於家庭本次複查日。";
      if (!nextReview) return "請輸入真實的家庭下次追蹤節點 YYYY-MM-DD。";
      if (nextReview.getTime() < reviewDate.getTime()) return "家庭下次追蹤節點不能早於本次複查。";
      if (values.noticeSources.trim().length < 8) return "請用安全 ID 或公開網址與版本日期，辨識控制中的主管機關及業者公告來源。";
      if (values.identityBasis.trim().length < 8) return "請填受保護的產品身分比對依據，不要暴露完整識別。";
      if (!values.storage.trim()) return "請填原始公告、銘牌、聯絡、改善與結果證據的受保護位置。";
      const actionRows = values.actions.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (actionRows.length === 0) return "請至少新增一筆召回處置行動。";
      if (actionRows.length > 16) return "一次複查最多 16 筆召回行動；更多內容請建立下一份有日期的版本。";
      const invalidRows = actionRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `召回行動第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整填寫 10 個以直線分隔的欄位。`;
      const ids = actionRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆召回處置行動都要有唯一 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "召回行動 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 RC-1。";
      const statusOrder = [
        "公告已保存，產品身分待比對",
        "產品身分比對中，連結來源",
        "已確認受影響，連結官方來源",
        "官方改善處理中，連結證據",
        "官方改善已完成，連結結果",
        "未受影響，連結精確比對來源",
        "家庭已不持有，連結移轉或處理紀錄",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = actionRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `召回行動第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須使用欄位說明中的七種文字之一。`;
      const invalidActionDates = actionRows.filter((row) => {
        const actionDate = strictIsoDate(row.parts[4]);
        return !actionDate || actionDate.getTime() < noticeDate.getTime() || actionDate.getTime() > reviewDate.getTime();
      });
      if (invalidActionDates.length)
        return `召回行動第 ${invalidActionDates.map((row) => row.line).join("、")} 行需要介於公告日與本次複查日之間的真實行動日期。`;
      const openRows = actionRows.filter((row) => statusOrder.slice(0, 4).includes(row.parts[9]));
      const closedRows = actionRows.filter((row) => statusOrder.slice(4).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的召回行動第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標日必須從本次複查日起，到家庭下次追蹤節點為止。`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < noticeDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已完成、未受影響或家庭已不持有的第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於公告日與本次複查日之間的實際結果、比對或離開日期。`;
      const missingSources = actionRows.filter((row) => row.parts[3].length < 4 || row.parts[5].length < 4 || row.parts[5].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `召回行動第 ${missingSources.map((row) => row.line).join("、")} 行需要行動者或來源角色，以及受保護的公告、比對、聯絡、遞送或結果索引。`;
      const vagueActions = actionRows.filter((row) =>
        row.parts[6].length < 8 || /^(?:完成|好了|已好|修好|已解決|安全|未受影響|無|不用|不適用|待追蹤|已結案|ok)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `召回行動第 ${vagueActions.map((row) => row.line).join("、")} 行需要有來源的具體下一步或保留的結案理由，不能只寫通用安全或完成詞。`;
      const privacyText = [values.asset, values.noticeSources, values.identityBasis, values.actions, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email、序號、案件、物流或完整數字識別資料。請留在受保護原始證據，只在這裡放安全索引。";
      if (/密碼|門禁碼|驗證碼|一次性代碼|警報碼|完整地址|完整門牌|帳號|卡號|銀行帳戶|匯款帳號|身分證|完整序號|案件編號|理賠編號|物流追蹤碼|訂單編號|保單編號|簽名|出生日期|私人聯絡|付款憑證完整資料|登入憑證|申訴表全文|醫療紀錄|兒童姓名|遠端控制|password|passcode|access code|account number|card number|government id|full serial|serial number|case number|claim number|tracking number|order number|policy number|signature|payment credential|login credential|complaint form|medical record|child name|remote access|one-time code|verification code|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、地址、金融、身分、完整序號、案件、物流、訂單、簽名、申訴、兒童或私人聯絡資料。請改寫成受保護紀錄索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: actionRows.filter((row) => row.parts[9] === status).length,
      })).filter((item) => item.count > 0);
      const confirmedAffected = actionRows.filter((row) => [statusOrder[2], statusOrder[3]].includes(row.parts[9])).length;
      return `${values.asset.trim()}｜產品召回處置紀錄\n目前複查情境：${values.context}\n官方公告發布或更新：${formatter.format(noticeDate)}\n家庭本次召回複查：${formatter.format(reviewDate)}\n家庭下次追蹤節點：${formatter.format(nextReview)}\n仍開放行動：${openRows.length} 筆\n已完成、未受影響或家庭已不持有：${closedRows.length} 筆\n已確認受影響或官方改善處理中：${confirmedAffected} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n控制中的主管機關與業者公告：${values.noticeSources.trim()}\n受保護的產品身分比對依據：${values.identityBasis.trim()}\n\n${lines("有版本的召回處置行動", actionRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜有來源的指示／比對／請求／回覆／結果：${row.parts[2]}｜行動者／來源：${row.parts[3]}｜行動日期：${formatter.format(strictIsoDate(row.parts[4]) as Date)}｜受保護證據：${row.parts[5]}｜下一步／結案理由：${row.parts[6]}｜負責角色：${row.parts[7]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[8]) as Date)}｜狀態：${row.parts[9]}`))}\n\n受保護的原始證據位置：${values.storage.trim()}\n\n這份輸出只是家庭證據索引。它不查詢現行召回、不檢驗產品、不比對或驗證識別資料、不判斷是否受影響或產品安全、不產生停用、拔除電源、移動、檢修、銷毀、退回、運送或廢棄指示、不驗證公告或改善、不聯絡業者或主管機關、不提交事故或改善申訴、不授權退款或更換、不計算期限、不分配責任，也不認證完成。請立即遵循主管機關與業者現行公告，緊急情況使用適當緊急或醫療資源，並保存原始來源。`;
    },
  },
  "appliance-service-visit-log": {
    intro:
      "從原始報修、業者與估價，到技師說明、家人授權、工作、零件及家庭複查，建立有日期的家電或居家設備訪視紀錄。工具不診斷、不驗證業者，也不判斷安全、價格或施工品質。",
    fields: [
      text("asset", "私密資產代稱", "使用家庭資產代號，不要填完整序號、地址、帳號、案件編號或私人聯絡資料。", "洗衣區洗衣機 ASSET-A4"),
      {
        name: "context",
        label: "目前訪視情境",
        type: "select",
        options: [
          "原始報修與到府預約準備",
          "業者身分、估價或授權複查",
          "到場發現、工作或零件紀錄",
          "完工、家庭複查或移交檢視",
        ],
      },
      { name: "requestDate", label: "第一次服務報修日", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: "本次訪視紀錄檢視日", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "家庭下次追蹤節點", type: "date", value: "2026-08-31" },
      text("baseline", "控制中的報修、業者、估價與書面條款來源", "使用安全來源 ID 或公開網址與日期；照來源實際支持的角色寫業者身分，保存費用與範圍，不貼私人資料。", "原始報修 REQUEST-R1；獨立維修業者來源 PROVIDER-P1；估價 QUOTE-Q1；書面保證 TERMS-T1"),
      text("observation", "第一次家庭觀察", "只寫可見或可聽事實及未進行事項，不自行診斷，也不要貼完整識別、地址或私人聯絡。", "清洗進入脫水前停止並顯示 E7；未拆外殼；原始觀察保存於 OBS-O1"),
      {
        name: "events",
        label: "有版本的服務訪視事件列",
        type: "textarea",
        help: "每行格式：ID | 事件類型 | 有來源的觀察、估價、發現、授權、工作、零件、發票或結果 | 行動者或來源角色 | 事件日期 YYYY-MM-DD | 受保護證據索引 | 下一步或結案理由 | 負責角色 | 目標或結果日期 YYYY-MM-DD | 範圍／報修已記錄，等待訪視、業者／估價已記錄，等待授權、訪視發現已記錄，等待決定、工作已授權或進行中，連結範圍、工作完成，等待家庭複查、已結案，連結服務證據與家庭複查、已暫緩或拒絕，連結理由與來源、已移交，連結保固／召回／申訴索引。最多 16 行。",
        value: "SV-1 | 原始服務報修 | 請業者檢查清洗中斷的可見狀況，零件或追加工作前先提供估價 | 家庭資產負責人透過業者預約來源 | 2026-08-20 | REQUEST-R1 與送達確認 | 到場前確認業者角色、已揭露費用與預約範圍 | 家庭資產負責人 | 2026-08-24 | 範圍／報修已記錄，等待訪視\nSV-2 | 業者與估價來源 | 保存獨立維修業者身分來源、檢測費與零件前估價條件 | 獨立維修業者預約與估價角色 | 2026-08-22 | PROVIDER-P1 與 QUOTE-Q1 | 取得可歸屬的訪視發現後，再決定是否授權工作 | 家庭資產負責人 | 2026-08-24 | 業者／估價已記錄，等待授權",
      },
      text("storage", "受保護的原始證據位置", "只寫資料夾代稱，不要填完整序號、地址、電話、Email、案件、訂單、物流、帳號、憑證、簽名、門禁或付款資料。", "家庭文件／家電／ASSET-A4／服務訪視 SERVICE-S2"),
    ],
    run: (values) => {
      const requestDate = strictIsoDate(values.requestDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.asset.trim()) return "請填私密資產代稱，讓匯出的服務訪視紀錄可以辨識。";
      if (!requestDate) return "請輸入真實的第一次服務報修日 YYYY-MM-DD。";
      if (!reviewDate) return "請輸入真實的本次訪視紀錄檢視日 YYYY-MM-DD。";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "本次訪視紀錄檢視日不能在未來。";
      if (requestDate.getTime() > reviewDate.getTime()) return "第一次服務報修日不能晚於本次檢視日。";
      if (!nextReview) return "請輸入真實的家庭下次追蹤節點 YYYY-MM-DD。";
      if (nextReview.getTime() < reviewDate.getTime()) return "家庭下次追蹤節點不能早於本次檢視。";
      if (values.baseline.trim().length < 8) return "請以安全索引與日期辨識控制中的報修、業者、估價與書面條款來源。";
      if (values.observation.trim().length < 8) return "請描述第一次家庭觀察，不要診斷設備或暴露私人資料。";
      if (!values.storage.trim()) return "請填原始預約、業者、估價、授權、服務、零件、發票與複查證據的受保護位置。";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "請至少新增一筆服務訪視事件。";
      if (eventRows.length > 16) return "一次複查最多 16 筆服務訪視事件；更多內容請建立下一份有日期的版本。";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `服務訪視事件第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整填寫 10 個以直線分隔的欄位。`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆服務訪視事件都要有唯一 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "服務訪視事件 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 SV-1。";
      const statusOrder = [
        "範圍／報修已記錄，等待訪視",
        "業者／估價已記錄，等待授權",
        "訪視發現已記錄，等待決定",
        "工作已授權或進行中，連結範圍",
        "工作完成，等待家庭複查",
        "已結案，連結服務證據與家庭複查",
        "已暫緩或拒絕，連結理由與來源",
        "已移交，連結保固／召回／申訴索引",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `服務訪視事件第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須使用欄位說明中的八種文字之一。`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[4]);
        return !eventDate || eventDate.getTime() < requestDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `服務訪視事件第 ${invalidEventDates.map((row) => row.line).join("、")} 行需要介於第一次報修日與本次檢視日之間的真實事件日期。`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 5).includes(row.parts[9]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(5).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的服務訪視事件第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標日必須從本次檢視日起，到家庭下次追蹤節點為止。`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < requestDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已結案、暫緩或移交的第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於第一次報修日與本次檢視日之間的實際結果日期。`;
      const missingSources = eventRows.filter((row) => row.parts[3].length < 4 || row.parts[5].length < 4 || row.parts[5].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `服務訪視事件第 ${missingSources.map((row) => row.line).join("、")} 行需要行動者或來源角色，以及受保護的報修、估價、發現、授權、服務、發票或結果索引。`;
      const vagueActions = eventRows.filter((row) =>
        row.parts[6].length < 8 || /^(?:完成|好了|已好|修好|已解決|安全|已同意|核准|無|不用|不適用|待追蹤|已結案|ok)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `服務訪視事件第 ${vagueActions.map((row) => row.line).join("、")} 行需要具體的下一個證據步驟或保留的結案理由，不能只寫通用授權、安全或完成詞。`;
      const privacyText = [values.asset, values.baseline, values.observation, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email、序號、案件、訂單、物流或完整數字識別資料。請留在受保護原始證據，只在這裡放安全索引。";
      if (/密碼|門禁碼|鑰匙盒密碼|驗證碼|一次性代碼|警報碼|完整地址|完整門牌|帳號|卡號|銀行帳戶|匯款帳號|身分證|完整序號|案件編號|理賠編號|物流追蹤碼|訂單編號|保單編號|簽名|出生日期|私人聯絡|付款憑證完整資料|登入憑證|申訴表全文|法律策略|醫療紀錄|兒童姓名|遠端控制|技師姓名|客戶姓名|password|passcode|access code|gate code|lockbox code|account number|card number|government id|full serial|serial number|case number|claim number|tracking number|order number|policy number|signature|payment credential|login credential|complaint form|legal strategy|medical record|child name|remote access|one-time code|verification code|technician name|customer name|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、門禁、地址、金融、身分、完整序號、案件、訂單、物流、簽名、申訴或私人聯絡資料。請改寫成受保護紀錄索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: eventRows.filter((row) => row.parts[9] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.asset.trim()}｜家電到府維修訪視紀錄\n目前訪視情境：${values.context}\n第一次服務報修：${formatter.format(requestDate)}\n本次紀錄檢視：${formatter.format(reviewDate)}\n家庭下次追蹤節點：${formatter.format(nextReview)}\n仍開放事件：${openRows.length} 筆\n已結案、暫緩或移交事件：${closedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n控制中的報修、業者、估價與書面條款來源：${values.baseline.trim()}\n第一次家庭觀察：${values.observation.trim()}\n\n${lines("有版本的服務訪視事件", eventRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜有來源的觀察／估價／發現／授權／工作／零件／發票／結果：${row.parts[2]}｜行動者／來源：${row.parts[3]}｜事件日期：${formatter.format(strictIsoDate(row.parts[4]) as Date)}｜受保護證據：${row.parts[5]}｜下一步／結案理由：${row.parts[6]}｜負責角色：${row.parts[7]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[8]) as Date)}｜狀態：${row.parts[9]}`))}\n\n受保護的原始證據位置：${values.storage.trim()}\n\n這份輸出只是家庭證據索引。它不檢驗或診斷設備、不驗證業者身分、授權、登記、保險或到場、不判斷估價、價格、零件、修理價值、原因、施工品質、安全、法規或法律合規、不替家人授權工作、付款或進入住宅、不測試產品、不決定保固、召回、契約或申訴權利、不計算期限、不分配責任、不代表放棄權利，也不認證完成。請遵循品牌與主管機關現行安全指示，緊急或危險情況使用合適緊急及合格專業協助，並保存原始來源。`;
    },
  },
  "appliance-repair-callback-log": {
    intro:
      "把家電維修後再次出現的狀況連回前次完成來源，再保存回訪要求、業者回覆、後續工作與家庭複查。工具不診斷、不計算法律上的送修次數，也不判定保固、退款或換貨權利。",
    fields: [
      text("asset", "私密資產代稱", "使用家庭資產代號，不要填完整序號、地址、帳號、案件編號或私人聯絡資料。", "廚房冰箱 ASSET-A2"),
      {
        name: "context",
        label: "目前 callback 情境",
        type: "select",
        options: [
          "第一次復發觀察與前次紀錄比對",
          "再次報修或業者回覆複查",
          "後續到場、工作或家庭複查",
          "保固、賣方或消費申訴移交檢視",
        ],
      },
      { name: "priorCompletionDate", label: "前次業者回報完成日", type: "date", value: "2026-08-10" },
      { name: "recurrenceDate", label: "本次第一次復發觀察日", type: "date", value: "2026-08-21" },
      { name: "reviewDate", label: "本次 callback 紀錄檢視日", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "家庭下次 callback 追蹤節點", type: "date", value: "2026-08-31" },
      text("baseline", "控制中的前次服務、工作、保固與家庭複查來源", "使用安全來源 ID 或公開網址與日期；把前次症狀、業者發現、授權工作、完成來源與家庭複查留在受保護索引。", "前次服務 SERVICE-S2；工作單 WORKORDER-W3；業者完成來源 COMPLETE-C1；家庭複查 RECHECK-R1；書面保證 TERMS-T1"),
      text("observation", "本次家庭復發觀察", "只寫可見、可聽或顯示事實及未進行事項，不自行決定原因，也不要貼完整識別或私人聯絡。", "冷藏溫度再次高於家庭基準並重新顯示 E4；未拆面板；觀察保存於 OBS-R2"),
      {
        name: "events",
        label: "有版本的維修後 callback 事件列",
        type: "textarea",
        help: "每行格式：ID | 事件類型 | 有來源的復發觀察、要求、回覆、範圍、工作或結果 | 行動者或來源角色 | 事件日期 YYYY-MM-DD | 連結的前次服務或 callback ID | 受保護證據索引 | 下一步或結案理由 | 負責角色 | 目標或結果日期 YYYY-MM-DD | 已觀察復發，等待比對、已要求回訪，等待業者回覆、已記錄業者回覆，等待範圍決定、已安排後續到場，等待結果、業者回報後續工作完成，等待家庭複查、已結案，連結業者結果與家庭複查、已分流，連結不同問題來源與新紀錄、已移交，連結保固／賣方／申訴索引、已暫緩或拒絕，連結理由與來源。最多 16 行。",
        value: "CB-1 | 復發觀察 | 一般使用時冷藏溫度再次高於家庭基準並重新顯示 E4；未推測原因 | 家庭資產負責人觀察角色 | 2026-08-21 | SERVICE-S2 | OBS-R2 與受保護照片索引 | 先與前次服務來源比對本次觀察，再提出有範圍的處理要求 | 家庭資產負責人 | 2026-08-24 | 已觀察復發，等待比對\nCB-2 | 再次報修 | 請業者複查有日期的復發觀察並連結前次服務，不自行主張原因 | 家庭資產負責人透過業者客服管道 | 2026-08-22 | CB-1 | CALLBACK-C1 與送達確認 | 保存可歸屬的業者回覆與後續範圍 | 家庭資產負責人 | 2026-08-24 | 已要求回訪，等待業者回覆",
      },
      text("storage", "受保護的原始證據位置", "只寫資料夾代稱，不要填完整序號、地址、電話、Email、案件、訂單、物流、帳號、憑證、簽名、門禁、付款、申訴或法律資料。", "家庭文件／家電／ASSET-A2／callback CALLBACK-C1"),
    ],
    run: (values) => {
      const priorCompletionDate = strictIsoDate(values.priorCompletionDate);
      const recurrenceDate = strictIsoDate(values.recurrenceDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.asset.trim()) return "請填私密資產代稱，讓匯出的 callback 紀錄可以辨識。";
      if (!priorCompletionDate) return "請輸入真實的前次業者回報完成日 YYYY-MM-DD。";
      if (!recurrenceDate) return "請輸入真實的本次第一次復發觀察日 YYYY-MM-DD。";
      if (!reviewDate) return "請輸入真實的本次 callback 紀錄檢視日 YYYY-MM-DD。";
      const today = strictIsoDate([
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
        String(new Date().getDate()).padStart(2, "0"),
      ].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "本次 callback 紀錄檢視日不能在未來。";
      if (priorCompletionDate.getTime() > recurrenceDate.getTime()) return "前次業者回報完成日不能晚於復發觀察日。";
      if (recurrenceDate.getTime() > reviewDate.getTime()) return "復發觀察日不能晚於本次檢視日。";
      if (!nextReview) return "請輸入真實的家庭下次 callback 追蹤節點 YYYY-MM-DD。";
      if (nextReview.getTime() < reviewDate.getTime()) return "家庭下次 callback 追蹤節點不能早於本次檢視。";
      if (values.baseline.trim().length < 12) return "請以安全索引與日期辨識控制中的前次服務、工作、保固與家庭複查來源。";
      if (values.observation.trim().length < 8) return "請描述本次家庭復發觀察，不要診斷設備或暴露私人資料。";
      if (!values.storage.trim()) return "請填原始服務、復發、再次報修、回覆、後續工作與結果證據的受保護位置。";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "請至少新增一筆維修後 callback 事件。";
      if (eventRows.length > 16) return "一次複查最多 16 筆維修後 callback 事件；更多內容請建立下一份有日期的版本。";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 11 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `維修後 callback 事件第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整填寫 11 個以直線分隔的欄位。`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆維修後 callback 事件都要有唯一 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "維修後 callback 事件 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 CB-1。";
      const statusOrder = [
        "已觀察復發，等待比對",
        "已要求回訪，等待業者回覆",
        "已記錄業者回覆，等待範圍決定",
        "已安排後續到場，等待結果",
        "業者回報後續工作完成，等待家庭複查",
        "已結案，連結業者結果與家庭複查",
        "已分流，連結不同問題來源與新紀錄",
        "已移交，連結保固／賣方／申訴索引",
        "已暫緩或拒絕，連結理由與來源",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[10]));
      if (invalidStatuses.length)
        return `維修後 callback 事件第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須使用欄位說明中的九種文字之一。`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[4]);
        return !eventDate || eventDate.getTime() < recurrenceDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `維修後 callback 事件第 ${invalidEventDates.map((row) => row.line).join("、")} 行需要介於復發觀察日與本次檢視日之間的真實事件日期。`;
      const invalidLinks = eventRows.filter((row) => {
        const link = row.parts[5].toLocaleUpperCase("en");
        return !/^[A-Z0-9][A-Z0-9-]{1,29}$/.test(link) || (!ids.includes(link) && !values.baseline.toLocaleUpperCase("en").includes(link));
      });
      if (invalidLinks.length)
        return `維修後 callback 事件第 ${invalidLinks.map((row) => row.line).join("、")} 行必須連結控制來源中已命名的安全前次服務 ID，或本版本另一個 callback ID。`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 5).includes(row.parts[10]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(5).includes(row.parts[10]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[9]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的維修後 callback 事件第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標日必須從本次檢視日起，到家庭下次 callback 追蹤節點為止。`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[9]);
        return !outcome || outcome.getTime() < recurrenceDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已結案、分流、移交、暫緩或拒絕的第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於復發觀察日與本次檢視日之間的實際結果日期。`;
      const missingSources = eventRows.filter((row) => row.parts[3].length < 4 || row.parts[6].length < 4 || row.parts[6].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `維修後 callback 事件第 ${missingSources.map((row) => row.line).join("、")} 行需要行動者或來源角色，以及受保護的復發、要求、回覆、到場、工作或結果索引。`;
      const vagueActions = eventRows.filter((row) =>
        row.parts[7].length < 8 || /^(?:完成|好了|已好|修好|沒修好|失敗|已解決|安全|相同問題|不同問題|已同意|核准|無|不用|不適用|待追蹤|已結案|ok)$/i.test(row.parts[7]),
      );
      if (vagueActions.length)
        return `維修後 callback 事件第 ${vagueActions.map((row) => row.line).join("、")} 行需要具體的下一個證據步驟或保留的結案理由，不能只寫通用診斷、安全或完成詞。`;
      const privacyText = [values.asset, values.baseline, values.observation, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email、序號、案件、訂單、物流或完整數字識別資料。請留在受保護原始證據，只在這裡放安全索引。";
      if (/密碼|門禁碼|鑰匙盒密碼|驗證碼|一次性代碼|警報碼|完整地址|完整門牌|帳號|卡號|銀行帳戶|匯款帳號|身分證|完整序號|案件編號|理賠編號|物流追蹤碼|訂單編號|保單編號|簽名|出生日期|私人聯絡|付款憑證完整資料|登入憑證|申訴表全文|申訴信全文|法律策略|醫療紀錄|兒童姓名|遠端控制|技師姓名|客戶姓名|password|passcode|access code|gate code|lockbox code|account number|card number|government id|full serial|serial number|case number|claim number|tracking number|order number|policy number|signature|payment credential|login credential|complaint form|complaint letter|legal strategy|medical record|child name|remote access|one-time code|verification code|technician name|customer name|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、門禁、地址、金融、身分、完整序號、案件、申訴、法律或私人聯絡資料。請改寫成受保護紀錄索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: eventRows.filter((row) => row.parts[10] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.asset.trim()}｜家電維修後 callback 紀錄\n目前 callback 情境：${values.context}\n前次業者回報完成：${formatter.format(priorCompletionDate)}\n本次第一次復發觀察：${formatter.format(recurrenceDate)}\n本次 callback 檢視：${formatter.format(reviewDate)}\n家庭下次 callback 追蹤節點：${formatter.format(nextReview)}\n仍開放 callback 事件：${openRows.length} 筆\n已結案、分流、移交、暫緩或拒絕事件：${closedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n控制中的前次服務、工作、保固與家庭複查來源：${values.baseline.trim()}\n本次家庭復發觀察：${values.observation.trim()}\n\n${lines("有版本的維修後 callback 事件", eventRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜有來源的復發觀察／要求／回覆／範圍／工作／結果：${row.parts[2]}｜行動者／來源：${row.parts[3]}｜事件日期：${formatter.format(strictIsoDate(row.parts[4]) as Date)}｜連結的前次服務／callback：${row.parts[5]}｜受保護證據：${row.parts[6]}｜下一步／結案理由：${row.parts[7]}｜負責角色：${row.parts[8]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[9]) as Date)}｜狀態：${row.parts[10]}`))}\n\n受保護的原始證據位置：${values.storage.trim()}\n\n這份輸出只是家庭證據索引。它不檢驗或診斷設備、不判定前次維修失敗、不決定症狀或瑕疵是否相同、不驗證業者或送達、不計算法律上的送修次數、不解釋保固或服務方案、不判定涵蓋、退款、換貨、賠償、申訴或其他權利、不計算期限、不授權後續工作、付款或進入住宅、不分配責任、不建議維修或汰換、不聯絡業者或主管機關、不提交保固或申訴、不代表放棄權利，也不認證完成。請遵循品牌與主管機關現行安全指示，緊急情況使用合適緊急及合格專業協助，並保存原始來源。`;
    },
  },
  "vacation-shutdown-checklist-generator": {
    intro:
      "依出發、返家日期、住宅型態與每項照護交接產生旅行前住家清單。工具不會讀取即時天氣，也不會用通用指令要求關閉水、電、瓦斯或必要設備。",
    fields: [
      { name: "departure", label: "離家日期", type: "date" },
      { name: "return", label: "預計返家日期", type: "date" },
      {
        name: "homeType",
        label: "住宅型態",
        type: "select",
        options: ["公寓大廈", "透天住宅", "其他"],
      },
      text("coordinator", "旅行前檢查負責角色", "負責完成最後巡視，可填角色。", "出發前最後離家者"),
      {
        name: "care",
        label: "需要交接的照護或收取事項",
        type: "textarea",
        help: "每行格式：事項 | 代管角色 | 頻率或觸發條件；不要填門禁密碼。",
        value: "貓咪 | 家庭照護者 | 每日早晚\n植物 | 鄰居 | 每三天一次\n包裹 | 管理室 | 收到通知時代收",
      },
      text("contact", "緊急代理聯絡角色", "填家人知道的角色與安全聯絡管道，不要放公開門禁資料。", "在地緊急聯絡人／已核對電話"),
    ],
    run: (values) => {
      const departure = date(values.departure);
      const returning = date(values.return);
      if (!departure) return "請輸入有效的離家日期。";
      if (!returning) return "請輸入有效的預計返家日期。";
      if (returning.getTime() <= departure.getTime()) return "預計返家日期必須晚於離家日期。";
      const daysAway = Math.round((returning.getTime() - departure.getTime()) / 86_400_000);
      if (daysAway > 365) return "單次清單最多規劃 365 天；更長期的空置住宅需要獨立管理計畫與專業檢查。";
      if (!values.coordinator.trim()) return "請填寫旅行前檢查負責角色。";
      if (!values.contact.trim()) return "請填寫緊急代理聯絡角色與已核對的安全聯絡管道。";
      const careRows = values.care
        .split("\n")
        .map((source, index) => ({
          line: index + 1,
          parts: source.split("|").map((part) => part.trim()),
        }))
        .filter((row) => row.parts.some(Boolean));
      if (careRows.length > 12) return "一次最多整理 12 項照護或收取事項；過多工作應另做完整交接文件。";
      const invalid = careRows.filter((row) => row.parts.length !== 3 || row.parts.some((part) => !part));
      if (invalid.length) return `第 ${invalid.map((row) => row.line).join("、")} 行格式不完整。請使用「事項 | 代管角色 | 頻率或觸發條件」，三欄都要填寫。`;
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const buildingTask =
        values.homeType === "公寓大廈"
          ? "確認管理室代收、公共設施、停車與緊急聯絡規則，交接資訊只給需要的人"
          : values.homeType === "透天住宅"
            ? "檢查外部排水、信箱、門窗與可見異常；需要定期巡視時指定在地角色"
            : "依實際住宅管理方式確認郵件、包裹、公共動線與緊急聯絡安排";
      const careOutput = careRows.length
        ? careRows.map((row) => `[ ] ${row.parts[0]}｜代管：${row.parts[1]}｜頻率／條件：${row.parts[2]}｜已確認接受：＿＿＿＿`)
        : ["[ ] 本次沒有照護或收取事項；最後巡視時再次確認沒有遺漏人、寵物、植物、包裹或必要設備。"];
      return `${values.homeType}旅行前住家清單\n離家：${formatter.format(departure)}\n返家：${formatter.format(returning)}\n離家日數：${daysAway} 天（返家日減離家日）\n最後巡視負責角色：${values.coordinator.trim()}\n緊急代理：${values.contact.trim()}\n\n${lines("出發前數日", [
        "查看中央氣象署與所在地官方警特報；有颱風、豪雨、強風、低溫或其他風險時重新評估住宅措施與行程",
        buildingTask,
        "暫停或改期不需要的配送、清潔與到府服務，保留確認紀錄",
        "依每台設備的說明書、建物規則與家中持續運作需求，決定安全設定；不要套用通用關閉指令",
      ].map((item) => `[ ] ${item}`))}\n\n${lines("照護與收取交接", careOutput)}\n\n${lines("最後一人離家前", [
        "確認所有人與寵物已離開或已有明確照護安排；清除易腐食物與垃圾",
        "依實際安全程序檢查爐火、火源、必要電器、門窗及上鎖狀態，不拆修設備",
        "確認沒有正在漏水、異味、異音或警示；發現異常先處理，不用勾選取代判斷",
        "讓離線可取得的緊急、管理、保險與維修聯絡方式保持最新",
        "只向必要代理人提供最少資訊；不要把完整旅程、門禁密碼或無人在家細節公開發布",
      ].map((item) => `[ ] ${item}`))}\n\n${lines("返家後", [
        "進屋前先查看外觀與異常；聞到瓦斯味、焦味或發現積水時不要直接操作開關，先依官方安全指引求助",
        "逐步恢復曾調整的設備與服務，依說明書確認狀態，不憑記憶一次全開",
        "關閉臨時代管與配送安排，向照護者確認事件、費用及剩餘物品",
        "把這次漏掉或臨時處理的事項加入下一次清單，但不要保留已失效的敏感交接內容",
      ].map((item) => `[ ] ${item}`))}\n\n這份清單不會查詢即時天氣、不會通知代理人，也不會替你申請警方或管理服務。遇到警特報、設備異常或長期空置時，請依所在地官方資訊、建物規則、保險條款與設備說明處理。`;
    },
  },
  "house-sitter-instruction-generator": {
    intro:
      "把看家期間真正要執行的住家工作、異常升級與禁止事項分開交接。工具不接受門禁密碼，且不會聯絡看家者或替任何人取得住宅權限。",
    fields: [
      { name: "start", label: "看家開始日期", type: "date" },
      { name: "end", label: "預計結束日期", type: "date" },
      text(
        "sitter",
        "看家照護角色",
        "可填角色或暱稱；共享版本不必放完整身分資料。",
        "受託看家者",
      ),
      text(
        "ownerContact",
        "屋主／家庭主要聯絡方式",
        "填已核對且適合交付的聯絡管道，不要填帳號密碼。",
        "家庭主要聯絡人／已核對電話",
      ),
      {
        name: "routines",
        label: "住家例行工作",
        type: "textarea",
        help: "每行格式：時機 | 工作 | 完成證據或回報條件；最多 12 行。",
        value:
          "每日早上 | 查看門窗與室內是否有異常 | 有漏水、焦味或警示立即回報\n收到通知時 | 依管理規則領取包裹 | 記錄件數與領取時間\n週二晚間 | 將垃圾依社區規則送出 | 完成後勾選",
      },
      {
        name: "escalation",
        label: "異常升級安排",
        type: "textarea",
        help: "每行格式：狀況 | 第一聯絡角色 | 無法聯絡時；最多 8 行。遇立即危險仍應先聯絡官方緊急服務。",
        value:
          "可見漏水或設備警示 | 家庭主要聯絡人 | 管理室／合格服務單位\n無法進入住家 | 家庭主要聯絡人 | 管理室或原定備援聯絡人",
      },
      {
        name: "boundaries",
        label: "禁止事項與隱私界線",
        type: "textarea",
        help: "每行一項，最多 8 項。不要把密碼、門禁碼或保全解除方式寫在這裡。",
        value:
          "不拍攝或轉傳家庭文件與螢幕內容\n不進入未交付的私人空間\n不自行拆修電氣、瓦斯、給排水或保全設備",
      },
    ],
    run: (values) => {
      const start = date(values.start);
      const end = date(values.end);
      if (!start) return "請輸入有效的看家開始日期。";
      if (!end) return "請輸入有效的預計結束日期。";
      if (end.getTime() < start.getTime())
        return "預計結束日期不能早於看家開始日期。";
      const days =
        Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
      if (days > 90)
        return "這份看家摘要一次最多涵蓋 90 天；更長期間請建立定期複查、費用、設備與保險的獨立管理計畫。";
      if (!values.sitter.trim()) return "請填寫看家照護角色。";
      if (!values.ownerContact.trim())
        return "請填寫已核對的屋主或家庭主要聯絡方式。";
      const parseRows = (source: string) =>
        source
          .split("\n")
          .map((line, index) => ({
            line: index + 1,
            parts: line.split("|").map((part) => part.trim()),
          }))
          .filter((row) => row.parts.some(Boolean));
      const routineRows = parseRows(values.routines);
      if (routineRows.length === 0)
        return "請至少輸入一項住家例行工作。";
      if (routineRows.length > 12)
        return "住家例行工作一次最多 12 項；其餘請另做完整住家操作文件。";
      const badRoutine = routineRows.filter(
        (row) => row.parts.length !== 3 || row.parts.some((part) => !part),
      );
      if (badRoutine.length)
        return `住家例行工作的第 ${badRoutine.map((row) => row.line).join("、")} 行格式不完整。請使用「時機 | 工作 | 完成證據或回報條件」。`;
      const escalationRows = parseRows(values.escalation);
      if (escalationRows.length === 0)
        return "請至少輸入一項異常升級安排，讓看家者知道何時停止自行處理。";
      if (escalationRows.length > 8)
        return "異常升級安排一次最多 8 項。";
      const badEscalation = escalationRows.filter(
        (row) => row.parts.length !== 3 || row.parts.some((part) => !part),
      );
      if (badEscalation.length)
        return `異常升級安排的第 ${badEscalation.map((row) => row.line).join("、")} 行格式不完整。請使用「狀況 | 第一聯絡角色 | 無法聯絡時」。`;
      const boundaries = uniqueList(values.boundaries);
      if (boundaries.length === 0)
        return "請至少寫一項禁止事項或隱私界線。";
      if (boundaries.length > 8)
        return "禁止事項與隱私界線一次最多 8 項。";
      const shareableText = [
        values.ownerContact,
        values.routines,
        values.escalation,
      ].join("\n");
      if (/密碼|門禁碼|驗證碼|解鎖碼|保全碼|password|pin\s*[:：]/i.test(shareableText))
        return "偵測到可能的密碼、門禁碼或驗證碼。請從可列印摘要移除，改用與看家者另行確認的安全交付方式。";
      const formatter = new Intl.DateTimeFormat("zh-TW", {
        dateStyle: "long",
      });
      return `看家照護交接摘要\n期間：${formatter.format(start)} 至 ${formatter.format(end)}（含首尾共 ${days} 天）\n看家角色：${values.sitter.trim()}\n家庭主要聯絡：${values.ownerContact.trim()}\n文件有效至：${formatter.format(end)}，返家後請收回或銷毀不再需要的副本。\n\n${lines(
        "住家例行工作",
        routineRows.map(
          (row) =>
            `[ ] ${row.parts[0]}｜${row.parts[1]}｜完成證據／回報：${row.parts[2]}`,
        ),
      )}\n\n${lines(
        "異常升級",
        escalationRows.map(
          (row) =>
            `${row.parts[0]}｜先聯絡：${row.parts[1]}｜無法聯絡時：${row.parts[2]}`,
        ),
      )}\n\n${lines(
        "禁止事項與隱私界線",
        boundaries.map((item) => `不得：${item}`),
      )}\n\n接受確認：看家者已走讀各項工作、實際看到必要位置，並知道立即危險應優先使用所在地官方緊急服務。\n接受人／日期：＿＿＿＿＿＿＿＿\n\n這份摘要不授權看家者拆修設備、處理契約或查看其他家庭資料。鑰匙、門禁與保全權限請用獨立、安全、可撤回的方法交付，不要放進這份文件。`;
    },
  },
  "pet-sitter-instruction-generator": {
    intro:
      "把每隻動物的辨識、日常照護、獸醫書面指示位置與異常聯絡流程分開。工具不計算餵食量或藥量，也不診斷症狀。",
    fields: [
      { name: "start", label: "照護開始日期", type: "date" },
      { name: "end", label: "照護結束日期", type: "date" },
      text(
        "sitter",
        "寵物照護角色",
        "填已同意照護且完成走讀的人或角色。",
        "受託寵物照護者",
      ),
      {
        name: "pets",
        label: "動物辨識資料",
        type: "textarea",
        help: "每行格式：名字 | 種類 | 可見辨識特徵；最多 6 隻。晶片號碼與飼主證件另存，不放共享摘要。",
        value: "米米 | 貓 | 虎斑、綠色項圈",
      },
      {
        name: "routine",
        label: "飼主已確認的照護工作",
        type: "textarea",
        help: "每行格式：動物 | 時間或觸發 | 飼主已確認內容；最多 16 行。不要由工具猜測份量。",
        value:
          "米米 | 每日 07:00 | 依標示容器提供早餐並更換飲水\n米米 | 每日 19:00 | 依標示容器提供晚餐並清理貓砂",
      },
      text(
        "vet",
        "常用與緊急動物醫院聯絡方式",
        "出發前核對營業／急診時段、電話、地址與交通安排。",
        "常用動物醫院／電話；非營業時間備援院所／電話",
      ),
      text(
        "medicalReference",
        "獸醫書面指示與就醫授權位置",
        "只寫文件名稱、版本日期與安全位置；不要憑記憶改寫劑量。沒有用藥也要明寫。",
        "目前無用藥；就醫聯絡與費用授權見已簽署紙本",
      ),
      {
        name: "observations",
        label: "觀察與回報條件",
        type: "textarea",
        help: "每行格式：動物 | 要觀察的改變 | 飼主要求的聯絡方式；最多 10 行。急症仍應直接諮詢獸醫師。",
        value:
          "米米 | 明顯不吃不喝、反覆嘔吐、呼吸或活動異常 | 立即聯絡飼主並致電獸醫院",
      },
    ],
    run: (values) => {
      const start = date(values.start);
      const end = date(values.end);
      if (!start) return "請輸入有效的照護開始日期。";
      if (!end) return "請輸入有效的照護結束日期。";
      if (end.getTime() < start.getTime())
        return "照護結束日期不能早於開始日期。";
      const days =
        Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
      if (days > 60)
        return "這份寵物照護摘要一次最多涵蓋 60 天；更長期間應由飼主、照護者與獸醫建立持續複查安排。";
      if (!values.sitter.trim()) return "請填寫寵物照護角色。";
      if (!values.vet.trim())
        return "請填寫出發前已核對的常用與緊急動物醫院聯絡方式。";
      if (!values.medicalReference.trim())
        return "請明確填寫獸醫書面指示與就醫授權的位置；沒有用藥也要寫明。";
      const parseRows = (source: string) =>
        source
          .split("\n")
          .map((line, index) => ({
            line: index + 1,
            parts: line.split("|").map((part) => part.trim()),
          }))
          .filter((row) => row.parts.some(Boolean));
      const petRows = parseRows(values.pets);
      if (petRows.length === 0) return "請至少輸入一隻動物的辨識資料。";
      if (petRows.length > 6)
        return "一份摘要最多整理 6 隻動物；更多動物請分開製作，避免照護內容混淆。";
      const badPets = petRows.filter(
        (row) => row.parts.length !== 3 || row.parts.some((part) => !part),
      );
      if (badPets.length)
        return `動物辨識資料的第 ${badPets.map((row) => row.line).join("、")} 行格式不完整。請使用「名字 | 種類 | 可見辨識特徵」。`;
      const petNames = new Set(petRows.map((row) => row.parts[0]));
      const routineRows = parseRows(values.routine);
      if (routineRows.length === 0)
        return "請至少輸入一項飼主已確認的照護工作。";
      if (routineRows.length > 16)
        return "飼主已確認的照護工作一次最多 16 項。";
      const badRoutine = routineRows.filter(
        (row) =>
          row.parts.length !== 3 ||
          row.parts.some((part) => !part) ||
          !petNames.has(row.parts[0]),
      );
      if (badRoutine.length)
        return `照護工作的第 ${badRoutine.map((row) => row.line).join("、")} 行格式不完整，或動物名字未出現在辨識資料。請使用「動物 | 時間或觸發 | 飼主已確認內容」。`;
      const observationRows = parseRows(values.observations);
      if (observationRows.length === 0)
        return "請至少輸入一項觀察與回報條件。";
      if (observationRows.length > 10)
        return "觀察與回報條件一次最多 10 項。";
      const badObservations = observationRows.filter(
        (row) =>
          row.parts.length !== 3 ||
          row.parts.some((part) => !part) ||
          !petNames.has(row.parts[0]),
      );
      if (badObservations.length)
        return `觀察與回報條件的第 ${badObservations.map((row) => row.line).join("、")} 行格式不完整，或動物名字未出現在辨識資料。`;
      const formatter = new Intl.DateTimeFormat("zh-TW", {
        dateStyle: "long",
      });
      return `寵物照護交接摘要\n期間：${formatter.format(start)} 至 ${formatter.format(end)}（含首尾共 ${days} 天）\n照護角色：${values.sitter.trim()}\n\n${lines(
        "動物辨識",
        petRows.map(
          (row) =>
            `${row.parts[0]}｜${row.parts[1]}｜可見辨識：${row.parts[2]}`,
        ),
      )}\n\n${lines(
        "飼主已確認的照護工作",
        routineRows.map(
          (row) => `[ ] ${row.parts[0]}｜${row.parts[1]}｜${row.parts[2]}`,
        ),
      )}\n\n動物醫院：${values.vet.trim()}\n獸醫書面指示／就醫授權位置：${values.medicalReference.trim()}\n\n${lines(
        "觀察與回報",
        observationRows.map(
          (row) =>
            `${row.parts[0]}｜觀察：${row.parts[1]}｜聯絡：${row.parts[2]}`,
        ),
      )}\n\n接受確認：照護者已實際辨識每隻動物、看過食物與用品位置、讀過獸醫書面指示，並確認可聯絡的動物醫院與交通方案。\n接受人／日期：＿＿＿＿＿＿＿＿\n\n本工具不計算食物份量、藥物劑量或治療方法。動物出現明顯飲食飲水、精神、如廁、動作或呼吸異常，或其他急症時，應立即聯絡獸醫師或動物醫院；不要等待工具判斷。`;
    },
  },
  "home-handoff-summary-generator": {
    intro:
      "為特定接手人與明確期間產生最小必要的家庭營運摘要，逐項保留完成證據、資料排除範圍與接受確認。它不會讀取 FamilyBoard App 的其他紀錄。",
    fields: [
      text(
        "recipient",
        "交接接手角色",
        "每位不同權限的接手人應各做一份。",
        "家庭行政備援人",
      ),
      {
        name: "purpose",
        label: "本次交接用途",
        type: "select",
        options: ["短期旅行代理", "工作繁忙期間代理", "主要整理人更換", "緊急備援演練", "其他明確用途"],
      },
      { name: "start", label: "交接生效日期", type: "date" },
      { name: "end", label: "交接到期日期", type: "date" },
      {
        name: "tasks",
        label: "可執行工作",
        type: "textarea",
        help: "每行格式：日期或觸發 | 工作 | 完成證據；最多 12 行。",
        value:
          "每週五 | 依社區規則處理垃圾與回收 | 完成後在家庭任務勾選\n收到到期通知時 | 核對並處理已授權的帳單 | 記錄金額、日期與單據位置",
      },
      {
        name: "contacts",
        label: "本次可使用的聯絡管道",
        type: "textarea",
        help: "每行格式：用途 | 聯絡角色 | 已核對的安全管道；最多 8 行。",
        value:
          "住宅管理 | 管理室 | 已核對電話\n設備修繕 | 原服務商 | 合約上的客服電話",
      },
      {
        name: "included",
        label: "本次明確納入的資料類別",
        type: "textarea",
        help: "每行一類，最多 8 類；只納入接手人完成工作真正需要的內容。",
        value: "近期家庭任務\n已授權帳單的到期資訊\n住宅管理與服務聯絡方式",
      },
      {
        name: "omitted",
        label: "明確排除的敏感或無關資料",
        type: "textarea",
        help: "每行一類，至少 1 項、最多 10 項。",
        value:
          "帳號密碼與驗證碼\n完整身分證件與金融資料\n與本次工作無關的醫療、法律及私人紀錄",
      },
    ],
    run: (values) => {
      const start = date(values.start);
      const end = date(values.end);
      if (!values.recipient.trim()) return "請填寫交接接手角色。";
      if (!start) return "請輸入有效的交接生效日期。";
      if (!end) return "請輸入有效的交接到期日期。";
      if (end.getTime() < start.getTime())
        return "交接到期日期不能早於生效日期。";
      const days =
        Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
      if (days > 366)
        return "一份交接摘要最多生效 366 天；更長期的角色移交應建立定期複查與正式權限管理。";
      const parseRows = (source: string) =>
        source
          .split("\n")
          .map((line, index) => ({
            line: index + 1,
            parts: line.split("|").map((part) => part.trim()),
          }))
          .filter((row) => row.parts.some(Boolean));
      const taskRows = parseRows(values.tasks);
      if (taskRows.length === 0) return "請至少輸入一項可執行工作。";
      if (taskRows.length > 12)
        return "一份摘要最多放 12 項工作；更多內容請回到完整任務系統分工。";
      const badTasks = taskRows.filter(
        (row) => row.parts.length !== 3 || row.parts.some((part) => !part),
      );
      if (badTasks.length)
        return `可執行工作的第 ${badTasks.map((row) => row.line).join("、")} 行格式不完整。請使用「日期或觸發 | 工作 | 完成證據」。`;
      const contactRows = parseRows(values.contacts);
      if (contactRows.length === 0)
        return "請至少輸入一個本次可使用的聯絡管道。";
      if (contactRows.length > 8)
        return "本次可使用的聯絡管道最多 8 項。";
      const badContacts = contactRows.filter(
        (row) => row.parts.length !== 3 || row.parts.some((part) => !part),
      );
      if (badContacts.length)
        return `聯絡管道的第 ${badContacts.map((row) => row.line).join("、")} 行格式不完整。請使用「用途 | 聯絡角色 | 已核對的安全管道」。`;
      const included = uniqueList(values.included);
      const omitted = uniqueList(values.omitted);
      if (included.length === 0)
        return "請至少列出一項本次明確納入的資料類別。";
      if (included.length > 8)
        return "本次納入的資料類別最多 8 項；範圍過大時應拆成不同角色的交接。";
      if (omitted.length === 0)
        return "請至少列出一項明確排除的敏感或無關資料。";
      if (omitted.length > 10)
        return "明確排除的資料類別最多 10 項。";
      const riskyIncluded = included.filter((item) =>
        /密碼|驗證碼|解鎖碼|保全碼|完整身分證|完整信用卡|完整病歷|password/i.test(
          item,
        ),
      );
      if (riskyIncluded.length)
        return `下列內容不應納入一般交接摘要：${riskyIncluded.join("、")}。請移到明確排除清單，並另用具權限控管的方式處理真正必要的存取。`;
      const shareableText = [values.tasks, values.contacts].join("\n");
      if (/密碼|驗證碼|解鎖碼|保全碼|password|pin\s*[:：]/i.test(shareableText))
        return "偵測到可能的密碼或驗證碼。請從工作與聯絡欄移除，不要讓可列印摘要變成存取憑證。";
      const formatter = new Intl.DateTimeFormat("zh-TW", {
        dateStyle: "long",
      });
      const transferNote =
        values.purpose === "主要整理人更換"
          ? "這是角色移交，不只是一段代班；到期前應逐項確認正式負責人、權限、文件位置與未結事項。"
          : "這是有期限的代理摘要；到期後應收回權限、關閉臨時工作並銷毀不再需要的副本。";
      return `家庭營運交接摘要\n接手角色：${values.recipient.trim()}\n用途：${values.purpose}\n生效：${formatter.format(start)}\n到期：${formatter.format(end)}（含首尾共 ${days} 天）\n${transferNote}\n\n${lines(
        "可執行工作",
        taskRows.map(
          (row) =>
            `[ ] ${row.parts[0]}｜${row.parts[1]}｜完成證據：${row.parts[2]}`,
        ),
      )}\n\n${lines(
        "本次可使用的聯絡管道",
        contactRows.map(
          (row) => `${row.parts[0]}｜${row.parts[1]}｜${row.parts[2]}`,
        ),
      )}\n\n${lines("明確納入", included)}\n\n${lines("明確排除", omitted)}\n\n接受確認：接手人已逐項走讀、能指出工作來源與完成證據位置，並知道哪些內容沒有授權。\n交接人／接手人／日期：＿＿＿＿＿＿＿＿\n\n這份結果只來自目前輸入，不會讀取 FamilyBoard App、通知聯絡人或授予任何帳號與設備權限。分享前請再次核對日期與最小必要範圍。`;
    },
  },
  "annual-subscription-cost-calculator": {
    intro:
      "把單一訂閱的每次實付、真正扣款週期、促銷與標準價分開，換算比較用月均與年化成本，再從下次扣款日倒推人工決定日。",
    fields: [
      text("service", "訂閱服務與方案", "寫到能分辨方案等級與付款管道。", "影音服務／個人標準方案"),
      {
        name: "currency",
        label: "帳單幣別",
        type: "select",
        options: ["TWD", "USD", "JPY"],
      },
      {
        name: "amount",
        label: "目前每次實際扣款金額",
        type: "number",
        help: "輸入同一帳單上不可避免的稅費後金額；免費試用可填 0。",
        value: "199",
      },
      {
        name: "frequency",
        label: "真正扣款週期",
        type: "select",
        options: ["每週", "每 4 週", "每月", "每季", "每半年", "每年"],
      },
      {
        name: "pricingStage",
        label: "目前價格階段",
        type: "select",
        options: ["已是一般／標準價", "促銷或免費試用仍有效"],
      },
      {
        name: "standardAmount",
        label: "促銷結束後每次標準扣款（非促銷可填同額）",
        type: "number",
        value: "199",
      },
      { name: "promoEnd", label: "促銷或免費試用結束日（非促銷可留空）", type: "date" },
      { name: "nextCharge", label: "已核對的下次扣款／續約日", type: "date" },
      {
        name: "noticeDays",
        label: "預留幾天做續約決定",
        type: "number",
        help: "依實際取消流程、客服時間與家庭討論決定；可填 0 到 365 的整數。",
        value: "7",
      },
      text("source", "價格、週期與取消方式來源", "寫帳單日期、方案頁或平台官方說明；不要填帳號密碼。", "最新帳單與平台訂閱管理頁"),
    ],
    run: (values) => {
      const amount = Number(values.amount);
      const standardAmount = Number(values.standardAmount);
      const promoEnd = date(values.promoEnd);
      const nextCharge = date(values.nextCharge);
      const noticeDays = Number(values.noticeDays);
      if (!values.service.trim()) return "請填寫訂閱服務與方案。";
      if (!Number.isFinite(amount) || amount < 0 || amount > 10_000_000)
        return "目前每次實際扣款必須是 0 到 10,000,000 之間的數字。";
      if (!Number.isFinite(standardAmount) || standardAmount < 0 || standardAmount > 10_000_000)
        return "標準扣款必須是 0 到 10,000,000 之間的數字。";
      if (values.pricingStage === "促銷或免費試用仍有效" && !promoEnd)
        return "促銷或免費試用仍有效時，請輸入有效的結束日。";
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      if (promoEnd && promoEnd.getTime() < today.getTime())
        return "促銷結束日已早於今天；請重新核對目前是否已轉為標準價。";
      if (!nextCharge) return "請輸入有效的下次扣款或續約日。";
      if (nextCharge.getTime() < today.getTime())
        return "下次扣款或續約日不能早於今天；請先查看最新帳單與訂閱管理頁。";
      if (!Number.isInteger(noticeDays) || noticeDays < 0 || noticeDays > 365)
        return "預留天數必須是 0 到 365 之間的整數。";
      if (!values.source.trim()) return "請填寫價格、週期與取消方式的可回查來源。";
      if (/密碼|驗證碼|完整卡號|password|pin\s*[:：]/i.test(values.source))
        return "來源欄只寫文件或頁面位置，不要輸入密碼、驗證碼或完整卡號。";
      const factors: Record<string, number> = {
        每週: 52,
        "每 4 週": 13,
        每月: 12,
        每季: 4,
        每半年: 2,
        每年: 1,
      };
      const factor = factors[values.frequency] || 0;
      const annual = amount * factor;
      const standardAnnual = standardAmount * factor;
      const difference = standardAnnual - annual;
      const differencePercent = annual > 0
        ? `${new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 1 }).format((difference / annual) * 100)}%`
        : "無法以目前 0 元價格計算百分比";
      const decision = new Date(nextCharge);
      decision.setDate(decision.getDate() - noticeDays);
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const daysUntilDecision = Math.round((decision.getTime() - today.getTime()) / 86_400_000);
      const decisionStatus =
        daysUntilDecision < 0
          ? `人工決定日已過 ${Math.abs(daysUntilDecision)} 天；現在就核對取消或續約狀態。`
          : daysUntilDecision === 0
            ? "今天是人工決定日。"
            : `距人工決定日還有 ${daysUntilDecision} 天。`;
      const stageOutput = values.pricingStage === "促銷或免費試用仍有效"
        ? `促銷／試用結束：${formatter.format(promoEnd!)}\n標準價每次扣款：${moneyFor(standardAmount, values.currency)}\n標準價比較用月均：${moneyFor(standardAnnual / 12, values.currency)}\n標準價年化：${moneyFor(standardAnnual, values.currency)}\n由目前價轉為標準價的年化差額：${moneyFor(difference, values.currency)}（${differencePercent}）`
        : `目前已標示為一般／標準價；仍應在續約前重新核對是否調價。\n依標準價欄位計算的年化：${moneyFor(standardAnnual, values.currency)}`;
      return `${values.service.trim()}｜單項訂閱年成本比較\n帳單幣別：${values.currency}\n真正扣款週期：${values.frequency}\n目前每次實付：${moneyFor(amount, values.currency)}\n目前比較用月均：${moneyFor(annual / 12, values.currency)}\n目前年化成本：${moneyFor(annual, values.currency)}\n目前價格階段：${values.pricingStage}\n${stageOutput}\n\n下次扣款／續約：${formatter.format(nextCharge)}\n預留決定天數：${noticeDays} 天\n人工決定日：${formatter.format(decision)}\n狀態：${decisionStatus}\n資料來源：${values.source.trim()}\n\n續約前核對：目前方案名稱、實際扣款金額與幣別、週期、促銷結束後價格、自動續約狀態、取消路徑、生效時間、取消完成證據，以及刪除 App 是否等於取消訂閱。\n\n這是比較用年化，不是未來帳單預測。「每週」按一年 52 次、「每 4 週」按 13 次、「每月」按 12 次計算；不處理匯率、價格調整、用量計費、退費、跨境稅務或首尾不完整週期。不同幣別不可直接相加。`;
    },
  },
  "emergency-binder-generator": {
    intro:
      "建立可分享的家庭防災卡與受保護資料索引，不把完整證件、醫療內容、保單或密碼複製到同一張紙。實際應變仍以所在地官方資訊為準。",
    fields: [
      text("household", "家庭或住家標籤", "可用暱稱，不必填完整地址。", "我的家庭"),
      {
        name: "region",
        label: "主要使用地區",
        type: "select",
        options: ["台灣", "其他地區"],
      },
      { name: "reviewed", label: "本次全家核對日期", type: "date" },
      { name: "nextReview", label: "下次全家複查日期", type: "date" },
      {
        name: "meetings",
        label: "集合與失聯安排",
        type: "textarea",
        help: "每行格式：情境 | 約定地點或聯絡方法 | 無法使用時的替代；最多 4 行。地點需另用官方資料現場核對。",
        value: "住家附近可安全移動 | 家庭已查核的第一集合點 | 依災情改用第二集合點\n白天家人分散 | 先用簡訊回報平安 | 通訊恢復後聯絡外地親友",
      },
      {
        name: "contacts",
        label: "家庭與必要服務聯絡",
        type: "textarea",
        help: "每行格式：用途 | 聯絡角色 | 已核對的安全管道；最多 10 行。不要填密碼或完整證件號碼。",
        value: "家庭主要聯絡 | 家庭成員 A | 已核對電話\n外地備援聯絡 | 親友 B | 已核對電話\n住宅管理 | 管理室 | 公開服務電話",
      },
      {
        name: "needs",
        label: "家庭特殊需求與權威來源",
        type: "textarea",
        help: "每行格式：需求 | 已核對的官方／專業來源 | 私密細節的安全位置；最多 10 行。只寫索引，不抄醫療內容。",
        value: "寵物照護 | 飼主與動物醫院確認的書面計畫 | 私人照護文件\n行動支持 | 使用者與專業人員確認的安排 | 受保護家庭文件\n需持續供電設備 | 設備說明與服務單位 | 受保護設備紀錄",
      },
      text("privateIndex", "完整敏感資料的受保護位置", "只寫家人找得到的位置標籤，不要輸入密碼。", "加密家庭文件／緊急資料索引"),
      text("offlineCopy", "停電或離線時可取得的有限副本", "說明由誰保管、放在哪個安全位置及版本日期。", "紙本防災卡／家庭避難包／版本日期見封面"),
    ],
    run: (values) => {
      const reviewed = date(values.reviewed);
      const nextReview = date(values.nextReview);
      if (!values.household.trim()) return "請填寫家庭或住家標籤。";
      if (!reviewed) return "請輸入有效的本次全家核對日期。";
      if (!nextReview) return "請輸入有效的下次全家複查日期。";
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      if (reviewed.getTime() > today.getTime()) return "本次全家核對日期不能晚於今天。";
      if (nextReview.getTime() <= reviewed.getTime()) return "下次全家複查日期必須晚於本次核對日期。";
      const parseRows = (source: string) => source
        .split("\n")
        .map((line, index) => ({ line: index + 1, parts: line.split("|").map((part) => part.trim()) }))
        .filter((row) => row.parts.some(Boolean));
      const meetingRows = parseRows(values.meetings);
      const contactRows = parseRows(values.contacts);
      const needRows = parseRows(values.needs);
      if (meetingRows.length === 0 || meetingRows.length > 4)
        return "請輸入 1 到 4 項集合與失聯安排。";
      const badMeetings = meetingRows.filter((row) => row.parts.length !== 3 || row.parts.some((part) => !part));
      if (badMeetings.length) return `集合與失聯安排的第 ${badMeetings.map((row) => row.line).join("、")} 行格式不完整。請使用三欄格式。`;
      if (contactRows.length === 0 || contactRows.length > 10)
        return "請輸入 1 到 10 個家庭或必要服務聯絡。";
      const badContacts = contactRows.filter((row) => row.parts.length !== 3 || row.parts.some((part) => !part));
      if (badContacts.length) return `家庭與服務聯絡的第 ${badContacts.map((row) => row.line).join("、")} 行格式不完整。請使用三欄格式。`;
      if (needRows.length > 10) return "家庭特殊需求一次最多整理 10 項。";
      const badNeeds = needRows.filter((row) => row.parts.length !== 3 || row.parts.some((part) => !part));
      if (badNeeds.length) return `家庭特殊需求的第 ${badNeeds.map((row) => row.line).join("、")} 行格式不完整。請使用三欄格式。`;
      if (!values.privateIndex.trim()) return "請填寫完整敏感資料的受保護位置。";
      if (!values.offlineCopy.trim()) return "請填寫停電或離線時可取得的有限副本位置。";
      const shareable = [values.household, values.meetings, values.contacts, values.offlineCopy].join("\n");
      if (/密碼|驗證碼|門禁碼|保全碼|完整身分證|完整卡號|完整病歷|password|pin\s*[:：]/i.test(shareable))
        return "偵測到不應放入可分享防災卡的敏感內容。請只保留必要聯絡與安排，把完整資料移到受保護索引。";
      if (/密碼|驗證碼|門禁碼|保全碼|password|pin\s*[:：]/i.test(values.privateIndex))
        return "受保護位置欄只能寫位置標籤，不要直接輸入密碼或驗證碼。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const official = values.region === "台灣"
        ? [
            "警察報案：110",
            "火災、救護與急難救助：119",
            "行動電話在緊急危難且 110／119 無法接通時：112，依語音轉接",
            "避難收容處所、災情與家庭防災卡：使用前重新查核全民防災 e 點通",
          ]
        : ["所在地警察、消防、救護、避難收容與災害資訊：請向當地主管機關查核並填入有限副本"];
      const protectedSections = [
        "身分、住宅、保險與契約原件的位置索引，不放進一般共享版本",
        "醫療、用藥、照護與輔具內容由本人、醫療或適當專業來源維護，防災卡只指向位置",
        "設備、公共事業與服務資料保留官方操作／聯絡來源，不自製危險關閉步驟",
        ...needRows.map((row) => `${row.parts[0]}｜來源：${row.parts[1]}｜私密細節位置：${row.parts[2]}`),
      ];
      return `${values.household.trim()}｜家庭緊急資料夾索引\n主要使用地區：${values.region}\n全家核對：${formatter.format(reviewed)}\n下次全家複查：${formatter.format(nextReview)}\n\n【可分享的家庭防災卡】\n${lines("官方緊急與防災資訊", official)}\n\n${lines("集合與失聯安排", meetingRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜替代：${row.parts[2]}`))}\n\n${lines("家庭與必要服務聯絡", contactRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜${row.parts[2]}`))}\n\n有限離線副本：${values.offlineCopy.trim()}\n\n【只放位置索引的受保護部分】\n受保護位置：${values.privateIndex.trim()}\n${protectedSections.map((item) => `• ${item}`).join("\n")}\n\n${lines("完成前實測", [
        "[ ] 每位家庭成員能說出第一與替代集合／聯絡方式",
        "[ ] 依所在地最新官方圖資查核避難收容處所與可行路線，不把舊截圖當永久答案",
        "[ ] 在不揭露敏感內容下，能從防災卡找到受保護原件與必要用品",
        "[ ] 停電、手機沒電或網路中斷時，有限紙本／離線副本仍可取得",
        "[ ] 全家知道立即危險要先聯絡官方緊急服務，行動電話報案先說明案發地點",
      ])}\n\n這是資料結構與演練清單，不是任何災害的即時指令。避難處所、路線、警報與災情會變動，使用時必須重新查詢所在地官方資訊；不要為了集中管理，把密碼、完整證件、完整病歷、金融資料或所有家庭紀錄複製到一份容易攜出的紙本。`;
    },
  },
  "cleaning-schedule-generator": {
    intro:
      "用每個空間的估計分鐘與可驗收定義，先檢查每日／每週容量，再建立角色分工和輪替查核；不替家庭猜清潔劑、消毒濃度或危險作業方法。",
    fields: [
      {
        name: "spaces",
        label: "空間、時間與完成定義",
        type: "textarea",
        help: "每行格式：空間 | 日常復位分鐘 | 每週基本清潔分鐘 | 看得見的完成定義；最多 12 行，分鐘可填 0 到 480 的整數。",
        value: "廚房 | 10 | 30 | 檯面與水槽已復位，垃圾依地方規則處理\n浴室 | 5 | 25 | 常用表面與地面完成，用品回到安全位置\n客廳 | 10 | 25 | 走道與常用表面清楚，物品回到指定位置\n臥室 | 5 | 20 | 衣物與常用物品復位，地面可安全通行",
      },
      text("owners", "可分工的家庭成員或角色", "每行或逗號分隔，最多 8 個；平均件數不代表負擔公平。", "大人 A\n大人 B"),
      { name: "dailyBudget", label: "全家每天可用分鐘", type: "number", value: "30" },
      { name: "weeklyBudget", label: "全家每週可用分鐘（不含每日復位）", type: "number", value: "120" },
      {
        name: "rotation",
        label: "深入查核輪替",
        type: "select",
        options: ["每週輪替一區", "每兩週輪替一區", "每月輪替一區"],
      },
      { name: "start", label: "第一輪開始日期", type: "date" },
      {
        name: "constraints",
        label: "安全、健康或能力限制",
        type: "textarea",
        help: "每行格式：限制或條件 | 已確認的調整／負責來源；最多 8 行。不要在此發明醫療或化學指令。",
        value: "寵物活動區 | 依產品標示完成並確認安全後再讓寵物進入\n無法高處作業 | 另指派適合角色或使用合格專業服務\n清潔劑與消毒 | 詳讀產品標示、保持通風且不混用不同產品",
      },
    ],
    run: (values) => {
      const start = date(values.start);
      const dailyBudget = Number(values.dailyBudget);
      const weeklyBudget = Number(values.weeklyBudget);
      const owners = uniqueList(values.owners);
      if (!start) return "請輸入有效的第一輪開始日期。";
      if (owners.length === 0) return "請至少輸入一位可分工的家庭成員或角色。";
      if (owners.length > 8) return "一份排程最多分配 8 個家庭成員或角色。";
      if (!Number.isInteger(dailyBudget) || dailyBudget < 0 || dailyBudget > 1440)
        return "每天可用分鐘必須是 0 到 1,440 之間的整數。";
      if (!Number.isInteger(weeklyBudget) || weeklyBudget < 0 || weeklyBudget > 10_080)
        return "每週可用分鐘必須是 0 到 10,080 之間的整數。";
      const spaceRows = values.spaces
        .split("\n")
        .map((line, index) => ({ line: index + 1, parts: line.split("|").map((part) => part.trim()) }))
        .filter((row) => row.parts.some(Boolean));
      if (spaceRows.length === 0 || spaceRows.length > 12)
        return "請輸入 1 到 12 個空間。";
      const badSpaces = spaceRows.filter((row) => {
        const daily = Number(row.parts[1]);
        const weekly = Number(row.parts[2]);
        return row.parts.length !== 4 || row.parts.some((part) => !part) || !Number.isInteger(daily) || daily < 0 || daily > 480 || !Number.isInteger(weekly) || weekly < 0 || weekly > 480;
      });
      if (badSpaces.length)
        return `空間資料的第 ${badSpaces.map((row) => row.line).join("、")} 行格式或分鐘不正確。請使用四欄格式，分鐘填 0 到 480 的整數。`;
      const names = spaceRows.map((row) => row.parts[0].toLocaleLowerCase("zh-TW"));
      if (new Set(names).size !== names.length) return "空間名稱不可重複；同一空間的工作請合併成可驗收定義。";
      const constraintRows = values.constraints
        .split("\n")
        .map((line, index) => ({ line: index + 1, parts: line.split("|").map((part) => part.trim()) }))
        .filter((row) => row.parts.some(Boolean));
      if (constraintRows.length === 0 || constraintRows.length > 8)
        return "請輸入 1 到 8 項安全、健康或能力限制。";
      const badConstraints = constraintRows.filter((row) => row.parts.length !== 2 || row.parts.some((part) => !part));
      if (badConstraints.length)
        return `限制資料的第 ${badConstraints.map((row) => row.line).join("、")} 行格式不完整。請使用「限制或條件 | 已確認的調整／負責來源」。`;
      const unsafe = constraintRows.some((row) => {
        const content = row.parts.join(" ");
        return /漂白水|含氯/i.test(content) &&
          /鹽酸|酸性|氨|阿摩尼亞|酒精/i.test(content) &&
          /混合|混用/i.test(content);
      });
      if (unsafe) return "偵測到把含氯／漂白水與酸性、含氨或酒精產品混用的危險描述。請刪除並改為依產品標示、保持通風且不混用。";
      const dailyTotal = spaceRows.reduce((sum, row) => sum + Number(row.parts[1]), 0);
      const weeklyTotal = spaceRows.reduce((sum, row) => sum + Number(row.parts[2]), 0);
      const capacity = (used: number, budget: number, unit: string) =>
        used <= budget
          ? `在目前${unit}容量內，尚餘 ${budget - used} 分鐘；仍需試行確認估時。`
          : `超出目前${unit}容量 ${used - budget} 分鐘；先刪減、拆分、降低頻率或增加可承擔角色，不要把超載排程當成承諾。`;
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const rotationDates = spaceRows.map((_, index) => {
        if (values.rotation === "每月輪替一區") return addMonths(start, index);
        const result = new Date(start);
        result.setDate(result.getDate() + index * (values.rotation === "每兩週輪替一區" ? 14 : 7));
        return result;
      });
      const dailyRows = spaceRows
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => Number(row.parts[1]) > 0)
        .map(({ row, index }) => `[ ] ${row.parts[0]}｜約 ${row.parts[1]} 分鐘｜${owners[index % owners.length]}｜完成：${row.parts[3]}`);
      const weeklyRows = spaceRows
        .map((row, index) => `[ ] ${row.parts[0]}｜約 ${row.parts[2]} 分鐘｜${owners[(index + 1) % owners.length]}｜完成：${row.parts[3]}`);
      return `家庭清潔排程試行版\n第一輪開始：${formatter.format(start)}\n參與角色：${owners.join("、")}\n\n每日復位估計：${dailyTotal} 分鐘；可用：${dailyBudget} 分鐘\n容量判讀：${capacity(dailyTotal, dailyBudget, "每日")}\n${lines("每日復位", dailyRows.length ? dailyRows : ["本次沒有設定每日復位；請確認這是家庭有意識的選擇。"])}\n\n每週基本清潔估計：${weeklyTotal} 分鐘；可用：${weeklyBudget} 分鐘\n容量判讀：${capacity(weeklyTotal, weeklyBudget, "每週")}\n${lines("每週基本清潔", weeklyRows)}\n\n${lines(values.rotation, spaceRows.map((row, index) => `[ ] ${formatter.format(rotationDates[index])}｜${row.parts[0]}｜由家庭另定本輪深入查核項目與完成證據`))}\n\n${lines("開始前確認的限制", constraintRows.map((row) => `${row.parts[0]}｜${row.parts[1]}`))}\n\n公平性提醒：平均件數不等於公平。分配只依輸入順序輪替，不知道年齡、體力、照護負擔、健康限制、技能或每項工作的真實難度。試行一輪後記錄實際分鐘、跳過原因與需要協助處，再由全家調整；不要用勾選率責怪無法安全執行的人。清潔用品應詳讀產品標示、保持通風且不混用；高處、重物、病媒、災後污染或其他風險工作應依官方指引及適合人員處理。`;
    },
  },
  "appliance-replacement-planner": {
    intro:
      "用家電身分、日期依據、目前狀況、書面估價與家庭自訂規劃年限建立查證順序。工具不內建壽命表，也不會替你判定一定要修或換。",
    fields: [
      text("name", "家電與位置", "名稱要能和維修、保固及財物紀錄對得起來。", "廚房冰箱"),
      text("brandModel", "品牌、型號與可辨識資料", "優先照機身銘牌抄錄；序號可只留在安全的私人紀錄。", "品牌／型號；序號見家庭設備紀錄"),
      { name: "purchase", label: "已知購買、交付或安裝日期", type: "date" },
      {
        name: "dateBasis",
        label: "日期依據",
        type: "select",
        options: ["購買日期（有單據）", "交付／安裝日期（有文件）", "約略日期（沒有原始文件）"],
      },
      {
        name: "planningYears",
        label: "家庭自訂規劃年限（年）",
        type: "number",
        help: "只是你設定的複查尺度，不是原廠壽命；可填 1 到 50 的整數。",
        value: "10",
      },
      {
        name: "condition",
        label: "目前查核狀況",
        type: "select",
        options: [
          "運作正常，沒有已知異常",
          "效能、耗能或運轉表現有可觀察變化",
          "已有書面維修估價待評估",
          "有安全警示、召回或應停用跡象",
        ],
      },
      {
        name: "observations",
        label: "具體觀察或待查問題",
        type: "textarea",
        help: "每行一項，最多 8 項。寫日期、現象或錯誤碼，不要自行診斷。",
        value: "近兩週冷藏溫度恢復時間變長\n上次維修單記載需追蹤門封狀態",
      },
      { name: "repair", label: "目前書面維修估價（新台幣，可填 0）", type: "number", value: "0" },
      { name: "replacement", label: "目前替代方案書面報價（新台幣，可填 0）", type: "number", value: "0" },
      text("quoteSource", "估價或價格來源", "沒有估價時請寫『尚未取得』，不要把網路廣告價當成完工總價。", "尚未取得"),
      { name: "review", label: "下次人工複查日期", type: "date" },
    ],
    run: (values) => {
      const start = date(values.purchase);
      const review = date(values.review);
      const planningYears = Number(values.planningYears);
      const repair = Number(values.repair);
      const replacement = Number(values.replacement);
      const observations = uniqueList(values.observations);
      if (!values.name.trim()) return "請填寫家電與位置。";
      if (!values.brandModel.trim()) return "請填寫品牌、型號或可辨識資料，避免把估價與保固掛到錯誤設備。";
      if (!start) return "請輸入有效的購買、交付或安裝日期。";
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      if (start.getTime() > today.getTime()) return "購買、交付或安裝日期不能晚於今天。";
      if (!Number.isInteger(planningYears) || planningYears < 1 || planningYears > 50)
        return "家庭自訂規劃年限必須是 1 到 50 之間的整數。";
      if (observations.length === 0) return "請至少寫一項具體觀察；即使目前正常，也可記錄『本次未見異常』。";
      if (observations.length > 8) return "具體觀察一次最多 8 項；其餘請放入設備維修紀錄。";
      if (!Number.isFinite(repair) || repair < 0 || repair > 10_000_000)
        return "書面維修估價必須是 0 到 10,000,000 之間的數字。";
      if (!Number.isFinite(replacement) || replacement < 0 || replacement > 10_000_000)
        return "替代方案書面報價必須是 0 到 10,000,000 之間的數字。";
      if (!values.quoteSource.trim()) return "請填寫估價或價格來源；尚未取得時也要明確標示。";
      if (!review) return "請輸入有效的下次人工複查日期。";
      const ageYears = Math.max(0, (today.getTime() - start.getTime()) / 31_557_600_000);
      const remaining = planningYears - ageYears;
      const status =
        values.condition === "有安全警示、召回或應停用跡象"
          ? "安全優先：停止把它當成一般正常設備使用，先核對實際型號、官方召回／安全資訊與合格服務指示。"
          : values.condition === "已有書面維修估價待評估"
            ? "現在查證：把故障原因、維修範圍、保固、替代方案與中斷影響放在同一張證據表比較。"
            : values.condition === "效能、耗能或運轉表現有可觀察變化"
              ? "建立比較：先記錄可重現現象、取得適當檢查，再更新維修與替代報價。"
              : remaining > 2
                ? "持續監測：目前回報正常，保留複查日與真實紀錄；規劃年限不是故障預測。"
                : "到期複查：家庭自訂的規劃年限接近或已超過，現在更新條件與報價，但不能只靠年齡決定汰換。";
      const ratio = replacement > 0
        ? `${new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 1 }).format((repair / replacement) * 100)}%`
        : "無法計算（尚無大於 0 的替代方案報價）";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      return `${values.name.trim()}｜家電汰換查證卡\n設備辨識：${values.brandModel.trim()}\n已知日期：${formatter.format(start)}\n日期依據：${values.dateBasis}\n截至本次產生時的日曆年齡：約 ${ageYears.toFixed(1)} 年\n家庭自訂規劃年限：${planningYears} 年\n距規劃年限：${remaining >= 0 ? `約剩 ${remaining.toFixed(1)} 年` : `約超過 ${Math.abs(remaining).toFixed(1)} 年`}\n目前狀況：${values.condition}\n判讀：${status}\n下次人工複查：${formatter.format(review)}\n\n${lines("本次觀察", observations)}\n\n書面維修估價：${moneyFor(repair, "TWD")}\n替代方案書面報價：${moneyFor(replacement, "TWD")}\n維修估價相對於目前替代報價：${ratio}\n來源：${values.quoteSource.trim()}\n\n${lines("決定前逐項補證", [
        "核對品牌、完整型號、批號／序號與標準檢驗局召回或商品安全資訊",
        "由說明書、合格服務或可重現觀察確認問題，不以網路症狀清單自行診斷",
        "確認維修估價包含的工作、零件、稅費、保固與未包含項目",
        "量測安裝尺寸、門向、電壓、給排水、瓦斯、排氣或其他實際連接條件",
        "比較替代方案的完整交付、拆除、安裝與必要改善成本，不只看裸機售價",
        "查核目前適用的節能標章或能源效率資料，並依家庭實際使用情況解讀",
        "記錄停機對食物保存、洗衣、冷房、熱水或照護工作的實際影響與備援",
      ].map((item) => `[ ] ${item}`))}\n\n金額比例只是把兩份目前輸入放在同一尺度，不是修或換的門檻；年齡與家庭規劃年限也都不是剩餘壽命。遇焦味、冒煙、漏電、瓦斯、異常高溫、召回或其他安全風險時，先依官方與合格人員指示停用、隔離風險或求助，不要等待下次複查。`;
    },
  },
  "room-inventory-generator": {
    intro:
      "一次完成一個實際房間：先按區帶走一遍，再按物品類別補證據。它不估價、不判定承保，也不把整個住家壓成一張通用清單。",
    fields: [
      {
        name: "roomType",
        label: "房間類型",
        type: "select",
        options: ["客廳", "廚房", "臥室", "浴室", "洗衣區", "書房", "陽台", "車庫／儲藏室", "機電／設備區", "其他"],
      },
      text("roomLabel", "這個房間的辨識名稱", "使用室內標籤即可，不必填完整地址。", "主要廚房"),
      {
        name: "purpose",
        label: "本次盤點用途",
        type: "select",
        options: ["日常資產與保固管理", "搬家或住宅點交", "保險資料準備", "災後損失佐證準備"],
      },
      { name: "reviewed", label: "本次盤點日期", type: "date" },
      {
        name: "zones",
        label: "房間內的實際區帶",
        type: "textarea",
        help: "每行一區，最多 10 區；依走動順序寫，避免重複或漏掉櫃內。",
        value: "入口與門邊\n左側檯面與上櫃\n水槽與下櫃\n主要家電區\n餐具與食品收納",
      },
      {
        name: "custom",
        label: "這個家庭才有的物品類別",
        type: "textarea",
        help: "每行或逗號分隔，最多 12 類；例如咖啡器材、縫紉設備或樂器。",
        value: "咖啡器材\n鑄鐵鍋與高單價鍋具",
      },
      text("evidenceLocation", "照片與原始文件的安全位置", "只寫位置索引，不要填密碼或公開連結。", "家庭文件／住宅財物／主要廚房"),
    ],
    run: (values) => {
      const reviewed = date(values.reviewed);
      const zones = uniqueList(values.zones);
      const custom = uniqueList(values.custom);
      if (!values.roomLabel.trim()) return "請填寫這個房間的辨識名稱。";
      if (!reviewed) return "請輸入有效的本次盤點日期。";
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      if (reviewed.getTime() > today.getTime()) return "本次盤點日期不能晚於今天。";
      if (zones.length === 0) return "請至少輸入一個房間內的實際區帶。";
      if (zones.length > 10) return "一個房間最多整理 10 個區帶；範圍太大時請拆成兩個盤點單位。";
      if (custom.length > 12) return "家庭自訂物品類別一次最多 12 類。";
      if (!values.evidenceLocation.trim()) return "請填寫照片與原始文件的安全位置索引。";
      const shareable = [values.roomLabel, values.zones, values.custom, values.evidenceLocation].join("\n");
      if (/密碼|驗證碼|門禁碼|解鎖碼|保全碼|password|pin\s*[:：]/i.test(shareable))
        return "偵測到可能的密碼或門禁資訊。房間清冊只應記錄證據位置，不要放入任何存取憑證。";
      const base = values.roomType === "其他"
        ? ["主要家具與固定配件", "電子、電器與有型號的設備", "有保固、單據或較高價值的物品", "需要照片或特徵才能辨認的其他物品"]
        : zhTwInventoryAreas[values.roomType] || [];
      const categories = [...base, ...custom].filter(
        (item, index, all) => all.findIndex((candidate) => candidate.toLocaleLowerCase("zh-TW") === item.toLocaleLowerCase("zh-TW")) === index,
      );
      const purposeEvidence: Record<string, string[]> = {
        "日常資產與保固管理": ["品牌、型號、序號或其他辨識", "購買／安裝日期及依據", "收據、保固與維修紀錄位置", "目前狀況與下次複查日"],
        "搬家或住宅點交": ["盤點前所在區帶與數量", "搬運前狀況照片及日期", "箱號或搬入後預定位置", "缺件、損傷與雙方確認紀錄"],
        "保險資料準備": ["可辨識物品、數量與所在位置", "品牌型號、取得日期及原始憑證", "能看出整體與細節的日期化照片", "實際保單要求的其他資料"],
        "災後損失佐證準備": ["先確保現場可安全進入並依官方指示保存跡證", "事故後照片、位置與可辨識物品", "損失清單及取得／修復相關憑證", "消防、保險、稅務或其他主管機關要求的個案文件"],
      };
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      return `${values.roomLabel.trim()}｜單一房間盤點工作表\n房間類型：${values.roomType}\n用途：${values.purpose}\n盤點日期：${formatter.format(reviewed)}\n證據位置索引：${values.evidenceLocation.trim()}\n\n${lines("第一輪：依實際走動順序完成區帶", zones.map((zone, index) => `[ ] ${index + 1}. ${zone}｜已拍整體照：＿＿｜發現未歸類物品：＿＿`))}\n\n${lines("第二輪：依物品類別補查", categories.map((item) => `[ ] ${item}｜實際項目數：＿＿｜需完整建檔的項目：＿＿`))}\n\n${lines(`本次「${values.purpose}」至少核對`, purposeEvidence[values.purpose].map((item) => `[ ] ${item}`))}\n\n每個值得完整建檔的實際物品補上：清楚名稱、房間與區帶、數量、品牌／型號／序號（如適用）、取得或安裝日期及依據、照片日期、單據／保固位置、目前狀況與最後複查日。先拍房間整體位置，再拍識別細節；照片不要帶入證件、信件、螢幕、鑰匙齒形或鄰居資訊。\n\n這份結果只整理一個房間，不會讀取 App 既有資產、不會估算現值或重置成本，也不會證明物品所有權、承保範圍或可理賠金額。真正投保、點交、稅務或災損用途，請依實際契約、保單與主管機關要求補件。`;
    },
  },
  "warranty-checklist-generator": {
    intro:
      "把商品身分、書面保證、起算依據、購買證明、服務窗口與人工複查串成可追溯資料鏈。它不假設登錄是保固成立要件。",
    fields: [
      text("item", "商品或設備", "名稱要能和發票、保固與維修紀錄對得起來。", "客廳冷氣"),
      text("model", "品牌、型號與序號索引", "序號可存於私人設備紀錄，這裡只需能找到。", "品牌／型號；序號見設備紀錄"),
      text("seller", "銷售者、安裝者或經銷商", "依實際交易填寫；安裝者不同時可一併註明。", "銷售門市；安裝服務商"),
      { name: "transaction", label: "交易日期", type: "date" },
      {
        name: "startBasis",
        label: "書面保固記載的起算方式",
        type: "select",
        options: ["自交易日起算", "自交付日起算", "自安裝／完工日起算", "自啟用或登錄日起算", "其他書面約定"],
      },
      { name: "start", label: "依書面內容確認的起算日", type: "date" },
      text("termSource", "保證內容、期間與來源", "寫文件名稱、版本或頁次，不要只寫『原廠保固』。", "保證書第 2 頁：零件與工資範圍；期間另見同頁"),
      text("proofLocation", "交易與保固證明位置", "索引發票／收據、付款證明、保證書、交付或安裝單；不要輸入密碼或完整卡號。", "家庭文件／家電與保固／客廳冷氣"),
      {
        name: "registration",
        label: "產品登錄要求的查核結果",
        type: "select",
        options: ["書面內容未要求登錄", "書面內容要求登錄且已完成", "書面內容要求登錄但尚未完成", "尚未查明是否需要登錄"],
      },
      text("support", "已核對的申請服務管道", "使用保證書、官方網站或契約上的聯絡資訊。", "保證書所列客服電話與線上申請頁"),
      text("owner", "家庭複查負責角色", "可填角色，不必填真名。", "家庭設備負責人"),
      { name: "review", label: "下次人工複查日期", type: "date" },
    ],
    run: (values) => {
      const transaction = date(values.transaction);
      const start = date(values.start);
      const review = date(values.review);
      if (!values.item.trim()) return "請填寫商品或設備名稱。";
      if (!values.model.trim()) return "請填寫品牌、型號與序號索引。";
      if (!values.seller.trim()) return "請填寫銷售者、安裝者或經銷商。";
      if (!transaction) return "請輸入有效的交易日期。";
      if (!start) return "請輸入依書面內容確認的有效起算日。";
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      if (transaction.getTime() > today.getTime() || start.getTime() > today.getTime())
        return "交易日期與已確認起算日都不能晚於今天；尚未發生的交付或安裝請先列為待辦。";
      if (!values.termSource.trim()) return "請填寫保證內容、期間與可回到原文的來源。";
      if (!values.proofLocation.trim()) return "請填寫交易與保固證明的位置索引。";
      if (!values.support.trim()) return "請填寫已從書面或官方來源核對的服務管道。";
      if (!values.owner.trim()) return "請填寫家庭複查負責角色。";
      if (!review) return "請輸入有效的下次人工複查日期。";
      if (review.getTime() < start.getTime()) return "下次人工複查日期不能早於已確認的保固起算日。";
      const shareable = [values.model, values.proofLocation, values.support].join("\n");
      if (/密碼|驗證碼|門禁碼|完整卡號|password|pin\s*[:：]/i.test(shareable))
        return "偵測到可能的密碼、驗證碼或完整卡號。保固索引只寫安全位置，不要複製存取憑證。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const registrationNote =
        values.registration === "書面內容要求登錄但尚未完成"
          ? "待辦：回到實際書面條款確認期限、資料範圍與官方登錄管道；不要用第三方表單代替。"
          : values.registration === "尚未查明是否需要登錄"
            ? "待查：先讀書面保證與官方說明，不要假設每項商品都必須登錄。"
            : "已記錄目前查核結果；仍保留原始書面內容與完成證據。";
      return `${values.item.trim()}｜保固資料查核卡\n設備辨識：${values.model.trim()}\n銷售／安裝來源：${values.seller.trim()}\n交易日期：${formatter.format(transaction)}\n書面起算方式：${values.startBasis}\n已確認起算日：${formatter.format(start)}\n保證內容與期間來源：${values.termSource.trim()}\n文件位置：${values.proofLocation.trim()}\n產品登錄：${values.registration}\n${registrationNote}\n服務管道：${values.support.trim()}\n負責角色：${values.owner.trim()}\n下次人工複查：${formatter.format(review)}\n\n${lines("到貨／完工時核對", [
        "商品名稱、數量、品牌、型號、序號或批號與實物一致",
        "銷售者、安裝者、交易、交付與安裝日期可由文件回查",
        "書面保證載明內容、期間、起算方法及可識別的相關業者資料",
        "外觀、配件、安裝與可安全測試項目完成驗收，異常留下日期化證據",
      ].map((item) => `[ ] ${item}`))}\n\n${lines("保存與申請時核對", [
        "保留可辨識交易的發票／收據、品項明細與必要付款證明，不保存完整卡號",
        "保存書面保證、交付／安裝／驗收、登錄完成及歷次服務紀錄",
        "申請前重讀涵蓋範圍、排除事項、通知方式與應備資料，不只看廣告標題",
        "每次聯絡記錄日期、案件編號、對方回覆、送修物品與收件證明",
        "完成後核對處理內容、返還狀況、費用、後續保證與下次複查依據",
      ].map((item) => `[ ] ${item}`))}\n\n這張卡不計算到期日，也不判定法律責任或個案一定有免費維修權利。需要日期推算時，請把已確認的起算日與書面月數另交給保固到期計算器；若業者說法與文件不一致，保存往來並查詢行政院消保會或適當專業管道。`;
    },
  },
  "recurring-chore-planner": {
    intro:
      "依名單順序輪流分配例行家事，產生一份可以試行與複查的初稿。它能平均分配項目數，不能自動判斷每件事的工時、體力或照護負擔。",
    fields: [
      text(
        "members",
        "家庭成員或角色",
        "每行或逗號分隔；公開張貼時可用角色代替真名。",
        "大人 A\n大人 B\n青少年",
      ),
      {
        name: "chores",
        label: "這一輪要分配的家事",
        type: "textarea",
        help: "每行或逗號分隔一項；不同難度的工作不要只看件數。",
        value: "晚餐後廚房復位\n倒垃圾與回收\n洗曬衣物\n公共區域整理",
      },
      {
        name: "frequency",
        label: "輪值頻率",
        type: "select",
        options: ["每天", "每週", "每兩週", "每月"],
      },
      {
        name: "startPosition",
        label: "這一輪從名單第幾位開始",
        type: "number",
        help: "下次可往後移一位，避免每次都由同一人接第一項。",
        value: "1",
      },
      { name: "review", label: "下次一起複查日期", type: "date" },
    ],
    run: (values) => {
      const members = list(values.members);
      const chores = list(values.chores);
      if (chores.length === 0) return "請至少輸入一項要分配的家事。";
      const rawPosition = Number(values.startPosition || 1);
      if (
        !Number.isInteger(rawPosition) ||
        rawPosition < 1 ||
        (members.length > 0 && rawPosition > members.length)
      )
        return members.length
          ? `起始順位必須是 1 到 ${members.length} 之間的整數。`
          : "起始順位必須是正整數。";
      const review = date(values.review);
      if (!review) return "請輸入有效的下次複查日期。";
      const assigned = chores.map((chore, index) => {
        const owner = members.length
          ? members[(index + rawPosition - 1) % members.length]
          : "尚待指派";
        return `${chore} — ${owner} — 完成後記錄實際執行者與需要調整的地方`;
      });
      const counts = members.map((member) => ({
        member,
        count: assigned.filter((_, index) =>
          members[(index + rawPosition - 1) % members.length] === member,
        ).length,
      }));
      const format = new Intl.DateTimeFormat("zh-TW", {
        dateStyle: "long",
      }).format(review);
      return `${values.frequency || "每週"}家事輪值初稿\n下次共同複查：${format}\n\n${assigned
        .map((item) => `• ${item}`)
        .join("\n")}\n\n${
        counts.length
          ? `項目數：${counts.map((item) => `${item.member} ${item.count} 項`).join("、")}`
          : "目前沒有成員名單，所有項目均標示為尚待指派。"
      }\n\n輪流分配只平衡項目數，不代表工時、體力、年齡適合度或照護負擔公平。試行到複查日後，請依實際完成情況交換、拆分或刪除工作。`;
    },
  },
  "emergency-contact-sheet-generator": {
    intro:
      "產生容易掃讀、可列印的家庭緊急聯絡表。台灣版會標示 110、119 與 112 的正確角色；若人在其他地區，必須改成所在地官方號碼。",
    fields: [
      text("household", "家庭或住家名稱", "不要填完整身分證號或其他不必要敏感資料。", "我的家庭"),
      {
        name: "region",
        label: "使用地區",
        type: "select",
        options: ["台灣", "其他地區"],
      },
      {
        name: "contacts",
        label: "自訂聯絡人",
        type: "textarea",
        help: "每行格式：類別 | 名稱 | 電話。",
        value:
          "家庭主要聯絡人 | 姓名 | 電話\n社區管理室 | 名稱 | 電話\n電力／瓦斯業者 | 業者名稱 | 緊急電話\n寵物醫院 | 院所名稱 | 電話",
      },
      { name: "reviewed", label: "本次複查日期", type: "date" },
    ],
    run: (values) => {
      const reviewed = date(values.reviewed);
      if (!reviewed) return "請輸入有效的複查日期，讓使用者知道這張表是否仍為最新版本。";
      const contacts = values.contacts
        .split("\n")
        .map((row) => row.split("|").map((part) => part.trim()))
        .filter((row) => row.some(Boolean));
      const malformed = contacts.filter(
        (row) => row.length < 3 || row.some((part) => !part),
      );
      if (contacts.length === 0 || malformed.length > 0)
        return "請把每位聯絡人寫成「類別 | 名稱 | 電話」，每行一位，且三個欄位都不能空白。";
      const official =
        values.region === "台灣"
          ? [
              "警察報案：110",
              "火災、救護與急難救助：119",
              "手機在緊急危難且 110、119 無法接通時：112（依語音選擇警察或救援）",
            ]
          : [
              "所在地警察／消防／救護：請向當地主管機關確認並填入",
            ];
      const format = new Intl.DateTimeFormat("zh-TW", {
        dateStyle: "long",
      }).format(reviewed);
      return `${values.household || "家庭"}緊急聯絡表\n複查日期：${format}\n\n官方緊急專線\n${official
        .map((item) => `• ${item}`)
        .join("\n")}\n\n家庭與服務聯絡人\n${contacts
        .map((row) => `• ${row.join(" — ")}`)
        .join("\n")}\n\n使用前再次確認所在地官方號碼。遇到立即危險時應直接聯絡緊急服務，不要先等待一般聯絡人回覆；行動電話報案時優先說明案發地點。`;
    },
  },
  "appliance-purchase-installation-record": {
    intro:
      "把家電的家庭取得、交貨、安裝或第一次使用、書面保固起算依據與家庭複查連起來，不暴露完整序號或交易資料。工具不驗證賣家或安裝者、不解釋涵蓋，也不認證啟用。",
    fields: [
      text("asset", "私密家庭資產代號", "使用穩定的家庭 ID，不要填完整序號、訂單、發票、帳號、地址或私人聯絡。", "洗衣區洗衣機 ASSET-A3"),
      text("model", "品牌與公開型號參考", "可寫公開品牌與型號；完整製造號碼或標籤照片留在受保護索引。", "範例品牌／型號 WM-420"),
      {
        name: "context",
        label: "家庭取得情境",
        type: "select",
        options: [
          "實體通路購買，含交貨或安裝",
          "網路購買，交貨另行安排",
          "由承攬或安裝業者供應設備",
          "中古、贈與、移轉或住宅既有家電",
        ],
      },
      { name: "acquisitionDate", label: "購買、契約或家庭取得日", type: "date", value: "2026-08-10" },
      { name: "possessionDate", label: "交貨或家庭實際取得日", type: "date", value: "2026-08-18" },
      { name: "activationDate", label: "安裝或第一次使用日", type: "date", value: "2026-08-19" },
      { name: "reviewDate", label: "本次啟用紀錄檢視日", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "家庭下次證據查核點", type: "date", value: "2026-08-31" },
      text("basis", "控制中的購買、交貨、安裝、保證書與說明書來源", "使用安全來源 ID 或公開網址與日期。照原文寫保固起算方法，或標示尚待確認；不要貼完整交易與私人識別。", "訂單 ORDER-O1；發票 RECEIPT-R1；交貨 DELIVERY-D1；安裝 INSTALL-I1；書面保證 WARRANTY-W1 起算方法待確認；說明書 MANUAL-M1；標籤 SERIAL-PHOTO-S1 受保護"),
      {
        name: "events",
        label: "有版本的購買與啟用證據列",
        type: "textarea",
        help: "每行格式：ID | 證據階段 | 有來源的產品、購買、交貨、安裝、保固或複查事實 | 行動者或來源角色 | 事件日期 YYYY-MM-DD | 受保護證據索引 | 下一個缺口或結案理由 | 負責角色 | 目標或結果日期 YYYY-MM-DD | 已記錄購買來源，等待交貨、已收受交貨，等待外觀與內容複查、已安排安裝，等待業者結果、已記錄安裝來源，等待家庭複查、保固起算依據待確認，需要書面條款、已啟用，產品身分、購買、保固依據與家庭複查已連結、有限歸檔，缺少來源已標示並指派責任、已移轉或受贈，來源與保固不確定性已保存、已退貨、取消或替換，連結結果來源。最多 16 行。",
        value: "BUY-1 | 購買 | 店家訂單辨識洗衣機型號、包含交貨並另列安裝範圍 | 店家訂單來源角色 | 2026-08-10 | ORDER-O1 與 RECEIPT-R1 受保護副本 | 保存交貨來源並比對實際型號，不推定已經驗收 | 家庭資產負責人 | 2026-08-24 | 已記錄購買來源，等待交貨\nDELIVERY-1 | 交貨 | 物流來源支持家庭取得，家庭觀察連結可見型號與配件，不下安裝結論 | 物流來源與家庭觀察角色 | 2026-08-18 | DELIVERY-D1 與 OBS-D1 受保護索引 | 連結安裝結果、書面保固起算方法與家庭第一次使用複查 | 家庭資產負責人 | 2026-08-31 | 已收受交貨，等待外觀與內容複查",
      },
      text("storage", "受保護的原始證據位置", "只寫資料夾代稱，不要填完整序號、發票、訂單、地址、電話、Email、帳號、卡號、憑證、簽名、門禁或申訴資料。", "家庭文件／家電／ASSET-A3／取得 ACQ-1"),
    ],
    run: (values) => {
      const acquisitionDate = strictIsoDate(values.acquisitionDate);
      const possessionDate = strictIsoDate(values.possessionDate);
      const activationDate = strictIsoDate(values.activationDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.asset.trim()) return "請填私密家庭資產代號，讓匯出的啟用紀錄可以辨識。";
      if (values.model.trim().length < 4) return "請填品牌與公開型號參考，或明確標示型號尚未核對。";
      if (!acquisitionDate) return "請輸入真實的購買、契約或家庭取得日 YYYY-MM-DD。";
      if (!possessionDate) return "請輸入真實的交貨或家庭實際取得日 YYYY-MM-DD。";
      if (!activationDate) return "請輸入真實的安裝或第一次使用日 YYYY-MM-DD。";
      if (!reviewDate) return "請輸入真實的本次啟用紀錄檢視日 YYYY-MM-DD。";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "本次啟用紀錄檢視日不能在未來。";
      if (acquisitionDate.getTime() > possessionDate.getTime()) return "購買、契約或家庭取得日不能晚於實際取得日。";
      if (possessionDate.getTime() > activationDate.getTime()) return "交貨或家庭實際取得日不能晚於安裝或第一次使用日。";
      if (activationDate.getTime() > reviewDate.getTime()) return "安裝或第一次使用日不能晚於本次檢視日。";
      if (!nextReview) return "請輸入真實的家庭下次證據查核點 YYYY-MM-DD。";
      if (nextReview.getTime() < reviewDate.getTime()) return "家庭下次證據查核點不能早於本次檢視日。";
      if (values.basis.trim().length < 16) return "請用安全索引辨識控制中的購買、交貨、安裝、書面保證、說明書與受保護產品身分來源。";
      if (!values.storage.trim()) return "請填購買、產品標籤、交貨、安裝、保證書與家庭複查原件的受保護位置。";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "請至少新增一筆購買或啟用證據事件。";
      if (eventRows.length > 16) return "一次複查最多 16 筆購買與啟用事件；更多內容請建立下一份有日期的版本。";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `購買與啟用事件第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整填寫 10 個以直線分隔的欄位。`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆購買與啟用事件都要有唯一 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "購買與啟用事件 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 BUY-1。";
      const statusOrder = [
        "已記錄購買來源，等待交貨",
        "已收受交貨，等待外觀與內容複查",
        "已安排安裝，等待業者結果",
        "已記錄安裝來源，等待家庭複查",
        "保固起算依據待確認，需要書面條款",
        "已啟用，產品身分、購買、保固依據與家庭複查已連結",
        "有限歸檔，缺少來源已標示並指派責任",
        "已移轉或受贈，來源與保固不確定性已保存",
        "已退貨、取消或替換，連結結果來源",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `購買與啟用事件第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須使用欄位說明中的九種文字之一。`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[4]);
        return !eventDate || eventDate.getTime() < acquisitionDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `購買與啟用事件第 ${invalidEventDates.map((row) => row.line).join("、")} 行需要介於家庭取得日與本次檢視日之間的真實事件日期。`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 5).includes(row.parts[9]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(5).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的購買與啟用事件第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標日必須從本次檢視日起，到家庭下次證據查核點為止。`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < acquisitionDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已啟用、有限歸檔、移轉或退貨的第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於家庭取得日與本次檢視日之間的實際結果日期。`;
      const missingSources = eventRows.filter((row) => row.parts[3].length < 4 || row.parts[5].length < 4 || row.parts[5].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `購買與啟用事件第 ${missingSources.map((row) => row.line).join("、")} 行需要行動者或來源角色，以及受保護的購買、身分、交貨、安裝、保固或複查索引。`;
      const vagueActions = eventRows.filter((row) =>
        row.parts[6].length < 8 || /^(?:完成|好了|已交貨|已安裝|已驗收|已啟用|安全|已同意|核准|無|不用|不適用|待追蹤|已結案|ok)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `購買與啟用事件第 ${vagueActions.map((row) => row.line).join("、")} 行需要具體的證據缺口、下一步或有來源的結案理由，不能只寫通用交貨、安裝、安全或完成詞。`;
      const privacyText = [values.asset, values.model, values.basis, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email、序號、發票、訂單、案件、物流或完整數字識別資料。請留在受保護原始證據，只在這裡放安全索引。";
      if (/密碼|門禁碼|鑰匙盒密碼|驗證碼|一次性代碼|警報碼|完整地址|完整門牌|帳號|卡號|銀行帳戶|匯款帳號|身分證|完整序號|發票號碼|收據號碼|訂單編號|物流追蹤碼|案件編號|理賠編號|保單編號|簽名|出生日期|私人聯絡|付款憑證完整資料|登入憑證|申訴表全文|申訴信全文|法律策略|醫療紀錄|兒童姓名|遠端控制|安裝者姓名|客戶姓名|password|passcode|access code|gate code|lockbox code|account number|card number|government id|full serial|serial number|invoice number|receipt number|order number|tracking number|case number|claim number|policy number|signature|payment credential|login credential|complaint form|legal strategy|medical record|child name|remote access|one-time code|verification code|installer name|customer name|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、門禁、地址、金融、身分、完整序號、交易、申訴、法律或私人聯絡資料。請改寫成受保護紀錄索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: eventRows.filter((row) => row.parts[9] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.asset.trim()}｜家電購買與安裝紀錄\n產品參考：${values.model.trim()}\n家庭取得情境：${values.context}\n購買、契約或家庭取得：${formatter.format(acquisitionDate)}\n交貨或家庭實際取得：${formatter.format(possessionDate)}\n安裝或第一次使用：${formatter.format(activationDate)}\n本次紀錄檢視：${formatter.format(reviewDate)}\n家庭下次證據查核點：${formatter.format(nextReview)}\n仍開放啟用事件：${openRows.length} 筆\n已啟用、有限歸檔、移轉或退貨事件：${closedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n控制中的購買、交貨、安裝、保證書與說明書來源：${values.basis.trim()}\n\n${lines("有版本的購買與啟用證據", eventRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜有來源的產品／購買／交貨／安裝／保固／複查事實：${row.parts[2]}｜行動者／來源：${row.parts[3]}｜事件日期：${formatter.format(strictIsoDate(row.parts[4]) as Date)}｜受保護證據：${row.parts[5]}｜下一個缺口／結案理由：${row.parts[6]}｜負責角色：${row.parts[7]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[8]) as Date)}｜狀態：${row.parts[9]}`))}\n\n受保護的原始證據位置：${values.storage.trim()}\n\n這份輸出只是家庭證據索引。它不驗證產品、賣家、物流、安裝者、身分、交貨、授權、證照、保險、工法、設定、連接、許可、法規或安全，不檢驗設備、不解釋保固、服務方案、退貨政策或法律、不選擇保固起算日、不計算期限、不註冊產品、不比對召回、不提交申請、申訴或付款、不判定所有權、驗收、涵蓋、退款或換貨、不分配責任、不代表放棄權利，也不認證啟用。請遵循品牌與主管機關現行安全指示，緊急情況使用合適緊急及合格專業協助，並保存原始來源。`;
    },
  },
  "purchase-delivery-evidence-log": {
    intro:
      "把家庭購買來源一路連到出貨或取貨、實際取得、狀況複查、通知與退貨、退款或換貨結果，建立私密且有版本的證據索引。工具不判定驗收、責任、涵蓋或法律期限。",
    fields: [
      text("purchase", "私密家庭購買代號", "使用穩定的家庭 ID，不要填完整訂單、發票、物流、帳號、地址或私人聯絡。", "PURCHASE-P4"),
      text("item", "公開品項參考", "使用一般品名或公開型號；完整識別資料與標籤照片留在受保護索引。", "桌上型攪拌機／公開型號 MX-20"),
      {
        name: "channel",
        label: "購買管道",
        type: "select",
        options: [
          "品牌或零售商網路商店",
          "網路平台中的賣家",
          "郵購或電話訂購",
          "實體店面購買或到店取貨",
          "由承攬業者供應或客製的家庭品項",
        ],
      },
      { name: "orderDate", label: "交易或下單日", type: "date", value: "2026-08-20" },
      { name: "possessionDate", label: "到貨或家庭實際取得日（尚未取得可留空）", type: "date", value: "2026-08-22" },
      { name: "reviewDate", label: "本次購買紀錄檢視日", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "家庭下次證據查核點", type: "date", value: "2026-08-31" },
      text("basis", "控制中的商品資訊、訂單、付款、履行、政策、通知、回覆與結果來源", "使用安全來源 ID 或有日期的公開網址。另行保存當時適用的店家或平台政策版本，不要貼完整交易或私人識別。", "商品頁 LISTING-L1；訂單 ORDER-O1；發票 RECEIPT-R1；物流 DELIVERY-D1；政策 POLICY-P1；必要時通知 NOTICE-N1；已收到則回覆 RESPONSE-S1"),
      {
        name: "events",
        label: "有版本的購買與到貨證據列",
        type: "textarea",
        help: "每行格式：ID | 證據階段 | 有來源的訂購、履行、實際取得、狀況、通知、回覆或結果事實 | 行動者或來源角色 | 事件日期 YYYY-MM-DD | 受保護證據索引 | 下一個缺口或結案理由 | 負責角色 | 目標或結果日期 YYYY-MM-DD | 欄位說明列出的九種狀態之一。最多 16 行。",
        value: "PURCHASE-1 | 交易 | 零售商訂單確認品項、價格與店家陳述的履行依據，但不代表已出貨 | 店家訂單來源角色 | 2026-08-20 | ORDER-O1 與 RECEIPT-R1 受保護 | 保存出貨或取貨來源與當時政策版本，不宣稱已實際取得 | 家庭購買負責角色 | 2026-08-24 | 已記錄購買來源，等待履行\nDELIVERY-1 | 實際取得 | 物流來源與家庭照片支持收到一件包裹，品項身分與內容仍待複查 | 物流來源與家庭觀察角色 | 2026-08-22 | DELIVERY-D1 與 PHOTO-P1 受保護 | 不進行不安全測試，依訂單來源核對可見品項與隨附內容 | 家庭收受負責角色 | 2026-08-31 | 已記錄實際取得，等待狀況與內容複查",
      },
      text("storage", "受保護的原始證據位置", "只寫資料夾代稱，不要填完整訂單、發票、物流、案件、地址、電話、Email、帳號、卡號、憑證、簽名、門禁或申訴資料。", "家庭文件／購買／PURCHASE-P4／證據複查 2026-08"),
    ],
    run: (values) => {
      const orderDate = strictIsoDate(values.orderDate);
      const possessionDate = strictIsoDate(values.possessionDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.purchase.trim()) return "請填私密家庭購買代號，讓匯出的證據紀錄可以辨識。";
      if (values.item.trim().length < 4) return "請填公開品項參考，或明確標示品項參考尚未核對。";
      if (!orderDate) return "請輸入真實的交易或下單日 YYYY-MM-DD。";
      if (!reviewDate) return "請輸入真實的本次購買紀錄檢視日 YYYY-MM-DD。";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "本次購買紀錄檢視日不能在未來。";
      if (orderDate.getTime() > reviewDate.getTime()) return "交易或下單日不能晚於本次檢視日。";
      if (possessionDate && possessionDate.getTime() < orderDate.getTime()) return "到貨或家庭實際取得日不能早於交易或下單日。";
      if (possessionDate && possessionDate.getTime() > reviewDate.getTime()) return "到貨或家庭實際取得日不能晚於本次檢視日。";
      if (!nextReview) return "請輸入真實的家庭下次證據查核點 YYYY-MM-DD。";
      if (nextReview.getTime() < reviewDate.getTime()) return "家庭下次證據查核點不能早於本次檢視日。";
      if (values.basis.trim().length < 16) return "請用安全索引辨識控制中的商品資訊、訂單、付款、履行、政策、通知、回覆與結果來源。";
      if (!values.storage.trim()) return "請填購買、履行、品項狀況、溝通與結果原件的受保護位置。";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "請至少新增一筆購買或到貨證據事件。";
      if (eventRows.length > 16) return "一次複查最多 16 筆購買與到貨事件；更多內容請建立下一份有日期的版本。";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `購買與到貨事件第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整填寫 10 個以直線分隔的欄位。`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆購買與到貨事件都要有唯一 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "購買與到貨事件 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 DELIVERY-1。";
      const statusOrder = [
        "已記錄購買來源，等待履行",
        "已記錄出貨或取貨來源，等待實際取得",
        "已記錄實際取得，等待狀況與內容複查",
        "已觀察問題，等待通知送達",
        "通知已送達，等待店家、平台或物流回覆",
        "已安排處理，等待實際結果",
        "依到貨狀態保留，已連結家庭複查",
        "退貨、退款或換貨已完成，連結結果來源",
        "有限歸檔或已移交外部流程，缺口與責任已保存",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `購買與到貨事件第 ${invalidStatuses.map((row) => row.line).join("、")} 行狀態必須使用欄位說明中的九種文字之一。`;
      const needsPossession = eventRows.filter((row) => statusOrder.slice(2, 8).includes(row.parts[9]));
      if (!possessionDate && needsPossession.length)
        return `購買與到貨事件第 ${needsPossession.map((row) => row.line).join("、")} 行使用實際取得、品項狀況、通知、處理或結果狀態，因此必須補上真實家庭取得日。`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[4]);
        return !eventDate || eventDate.getTime() < orderDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `購買與到貨事件第 ${invalidEventDates.map((row) => row.line).join("、")} 行需要介於交易日與本次檢視日之間的真實事件日期。`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 6).includes(row.parts[9]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(6).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的購買與到貨事件第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標日必須從本次檢視日起，到家庭下次證據查核點為止。`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < orderDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已保留、完成或移交的第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於交易日與本次檢視日之間的實際結果日期。`;
      const missingSources = eventRows.filter((row) => row.parts[3].length < 4 || row.parts[5].length < 4 || row.parts[5].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `購買與到貨事件第 ${missingSources.map((row) => row.line).join("、")} 行需要行動者或來源角色，以及受保護的訂購、履行、實際取得、狀況、通知、回覆或結果索引。`;
      const vagueActions = eventRows.filter((row) =>
        row.parts[6].length < 8 || /^(?:完成|好了|已交貨|已到貨|已驗收|安全|退款|已退款|已換貨|已同意|核准|無|不用|不適用|待追蹤|已結案|ok)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `購買與到貨事件第 ${vagueActions.map((row) => row.line).join("、")} 行需要具體的下一個證據步驟或有來源的結案理由，不能只寫通用交貨、驗收、安全、退款或完成詞。`;
      const privacyText = [values.purchase, values.item, values.basis, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email、序號、發票、訂單、案件、物流或完整數字識別資料。請留在受保護原始證據，只在這裡放安全索引。";
      if (/密碼|門禁碼|鑰匙盒密碼|驗證碼|一次性代碼|警報碼|完整地址|完整門牌|帳號|卡號|銀行帳戶|匯款帳號|身分證|完整序號|發票號碼|收據號碼|完整訂單|訂單編號|物流追蹤碼|案件編號|理賠編號|保單編號|簽名|出生日期|私人聯絡|完整付款資料|登入憑證|申訴表全文|申訴信全文|法律策略|醫療紀錄|兒童姓名|遠端控制|買方姓名|賣家姓名|客戶姓名|收件人姓名|password|passcode|access code|gate code|lockbox code|account number|card number|government id|full serial|serial number|invoice number|receipt number|complete order|order number|tracking number|case number|claim number|policy number|signature|payment credential|login credential|complaint form|complaint letter|legal strategy|medical record|child name|remote access|one-time code|verification code|buyer name|seller name|customer name|carrier recipient name|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、門禁、地址、金融、身分、完整序號、交易、物流、案件、申訴、法律或私人聯絡資料。請改寫成受保護紀錄索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({
        status,
        count: eventRows.filter((row) => row.parts[9] === status).length,
      })).filter((item) => item.count > 0);
      return `${values.purchase.trim()}｜購買與到貨證據紀錄\n品項參考：${values.item.trim()}\n購買管道：${values.channel}\n交易或下單日：${formatter.format(orderDate)}\n到貨或家庭實際取得：${possessionDate ? formatter.format(possessionDate) : "尚未記錄"}\n本次購買紀錄檢視：${formatter.format(reviewDate)}\n家庭下次證據查核點：${formatter.format(nextReview)}\n仍開放購買與到貨事件：${openRows.length} 筆\n已保留、完成或移交事件：${closedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n控制中的商品資訊、訂單、付款、履行、政策、通知、回覆與結果來源：${values.basis.trim()}\n\n${lines("有版本的購買與到貨證據", eventRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜有來源的訂購／履行／實際取得／狀況／通知／回覆／結果事實：${row.parts[2]}｜行動者／來源：${row.parts[3]}｜事件日期：${formatter.format(strictIsoDate(row.parts[4]) as Date)}｜受保護證據：${row.parts[5]}｜下一個缺口／結案理由：${row.parts[6]}｜負責角色：${row.parts[7]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[8]) as Date)}｜狀態：${row.parts[9]}`))}\n\n受保護的原始證據位置：${values.storage.trim()}\n\n這份輸出只是家庭證據索引。它不驗證賣家、平台、物流、品項、包裹、出貨、取貨、實際取得、到貨、狀況、內容、溝通或結果，不檢查或測試品項、不判定責任、驗收、詐欺、所有權、涵蓋、退貨、退款、換貨、刷卡爭議、申訴或其他法律權利、不解釋政策、保固、契約或法律、不計算店家、平台、物流、信用卡、保固或法律期限、不聯絡業者或主管機關、不提交退貨、申請、爭議、刷卡爭議、申訴或付款、不提供地址、門禁或憑證、不分配責任、不代表放棄權利，也不認證完成。請保存原始來源、遵循品牌與主管機關現行安全指示，緊急情況使用合適的合格專業或緊急協助。`;
    },
  },
  "moving-box-handover-log": {
    intro:
      "把家庭裝箱、裝載保管、目的地點交、箱件核對、未找到、可見狀況、通知與實際結果做成安全版本索引。工具不取代正式搬運文件，也不判定責任、賠償、涵蓋或期限。",
    fields: [
      text("move", "家庭私人搬家代號", "使用固定代號，不要輸入姓名、完整地址、車號、契約、運單、倉儲或帳號完整編號。", "MOVE-2026-A"),
      {
        name: "context",
        label: "搬家情境",
        type: "select",
        options: ["專業搬家公司搬運", "自行搬運或租車", "貨櫃／倉儲轉運", "家人朋友協助", "混合搬運與多階段交接"],
      },
      { name: "loadingDate", label: "預定或實際裝載日", type: "date", value: "2026-08-20" },
      { name: "handoverDate", label: "目的地交接日（尚未收到可留空）", type: "date", value: "2026-08-22" },
      { name: "reviewDate", label: "本次箱件清冊檢視日", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "下一個箱件核對點", type: "date", value: "2026-08-31" },
      text("basis", "控制中的估價、契約、業者清冊、保管、點交、通知與結果來源", "使用安全來源代號或附日期的官方網址；完整地址、簽名、運單識別與文件內容放受保護位置。", "EST-E1；CONTRACT-C1；MOVER-INV-M1；LOAD-L1；HANDOVER-H1；必要時 NOTICE-N1"),
      {
        name: "events",
        label: "有版本的箱件與交接事件",
        type: "textarea",
        help: "每行：ID｜箱件或物品群組｜有來源的裝箱、裝載、保管、點交、狀況、通知或結果事實｜保管或來源角色｜事件日期 YYYY-MM-DD｜受保護證據索引｜下一個缺口或結案理由｜負責角色｜目標或結果日期 YYYY-MM-DD｜九種指定狀態之一。最多 18 行。",
        value: "BOX-14 | 廚房箱件 K-014 | 家庭裝箱照片連結已封箱代號與內容大類，不證明已裝載 | 家庭裝箱來源角色 | 2026-08-20 | BOX-PHOTO-P14 受保護 | 依控制中的裝載來源核對箱號，不自行寫成保管角色已收受 | 家庭裝載負責角色 | 2026-08-24 | 已裝箱並建立家庭索引，等待裝載交接\nHANDOFF-1 | 廚房裝載批次 | 家庭目的地點數與點交照片顯示批次已到，個別箱號核對仍開放 | 家庭目的地觀察角色 | 2026-08-22 | HANDOVER-H1 與 PHOTO-P20 受保護 | 逐一比對目的區箱號並保存未找到或臨時改放事件 | 家庭核對負責角色 | 2026-08-31 | 已記錄目的地交接，等待箱件核對",
      },
      text("storage", "受保護的原始證據位置", "使用資料夾名稱，不要放完整地址、契約、運單、申訴、電話、Email、帳號、憑證、簽名、門禁或貴重物明細。", "家庭紀錄／搬家／MOVE-2026-A／受保護原件"),
    ],
    run: (values) => {
      const loadingDate = strictIsoDate(values.loadingDate);
      const handoverDate = strictIsoDate(values.handoverDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.move.trim()) return "請輸入家庭私人搬家代號，讓匯出結果可以辨認。";
      if (!loadingDate) return "請用 YYYY-MM-DD 輸入真實的預定或實際裝載日。";
      if (!reviewDate) return "請用 YYYY-MM-DD 輸入真實的本次箱件清冊檢視日。";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "本次箱件清冊檢視日不能晚於今天。";
      if (loadingDate.getTime() > reviewDate.getTime()) return "裝載日不能晚於本次箱件清冊檢視日。";
      if (handoverDate && handoverDate.getTime() < loadingDate.getTime()) return "目的地交接日不能早於裝載日。";
      if (handoverDate && handoverDate.getTime() > reviewDate.getTime()) return "目的地交接日不能晚於本次箱件清冊檢視日。";
      if (!nextReview) return "請用 YYYY-MM-DD 輸入真實的下一個箱件核對點。";
      if (nextReview.getTime() < reviewDate.getTime()) return "下一個箱件核對點不能早於本次檢視日。";
      if (values.basis.trim().length < 12) return "請用安全索引指出控制中的估價、契約、業者清冊、保管、點交、通知與結果來源。";
      if (!values.storage.trim()) return "請輸入搬運、保管、狀況、通知與結果原始證據的受保護位置。";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "請至少加入一筆箱件或交接事件。";
      if (eventRows.length > 18) return "一個版本最多支援 18 筆箱件事件；更多變化請另建下一個有日期版本。";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `箱件事件第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整包含十個以直線分隔的欄位。`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆箱件事件都需要不重複的 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "每個事件 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 BOX-14。";
      const statusOrder = [
        "已裝箱並建立家庭索引，等待裝載交接",
        "已裝載或由保管角色收受，等待目的地交接",
        "已記錄目的地交接，等待箱件核對",
        "箱件或物品未找到，等待通知送達",
        "已記錄可見狀況問題，等待通知送達",
        "通知已送達，等待回覆或檢視",
        "已核對並開箱，連結家庭結果",
        "遺失或損傷流程已完成，連結結果來源",
        "有限歸檔或已移交外部流程，缺口與責任已保存",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `箱件事件第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用欄位說明中的九種交接狀態之一。`;
      const needsHandover = eventRows.filter((row) => statusOrder.slice(2, 8).includes(row.parts[9]));
      if (!handoverDate && needsHandover.length)
        return `箱件事件第 ${needsHandover.map((row) => row.line).join("、")} 行使用目的地、未找到、狀況、通知或已完成結果狀態，因此必須填入真實目的地交接日。`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[4]);
        return !eventDate || eventDate.getTime() < loadingDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `箱件事件第 ${invalidEventDates.map((row) => row.line).join("、")} 行需要介於裝載日與本次檢視日之間的真實事件日期。`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 6).includes(row.parts[9]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(6).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的箱件事件第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標日必須從本次檢視日起，到下一個箱件核對點為止。`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < loadingDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已核對、完成或移交的第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於裝載日與本次檢視日之間的實際結果日期。`;
      const missingSources = eventRows.filter((row) => row.parts[3].length < 3 || row.parts[5].length < 4 || row.parts[5].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `箱件事件第 ${missingSources.map((row) => row.line).join("、")} 行需要保管或來源角色，以及受保護的裝箱、裝載、保管、點交、狀況、通知或結果索引。`;
      const vagueActions = eventRows.filter((row) =>
        row.parts[6].length < 8 || /^(?:完成|好了|已交貨|已到貨|已驗收|安全|遺失|損傷|已賠|已和解|核准|無|不用|不適用|待追蹤|已結案|ok)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `箱件事件第 ${vagueActions.map((row) => row.line).join("、")} 行需要具體的證據缺口、下一步或有來源的結案理由，不能只寫通用交貨、損傷、驗收或完成詞。`;
      const privacyText = [values.move, values.basis, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email、地址、序號、運單、契約、案件或完整數字識別。請留在受保護原始證據，只在這裡放安全索引。";
      if (/密碼|門禁碼|鑰匙盒密碼|驗證碼|一次性代碼|警報碼|完整地址|完整門牌|起點地址|目的地地址|帳號|卡號|銀行帳戶|匯款帳號|身分證|駕照|車牌|完整序號|運單號碼|契約編號|案件編號|理賠編號|保單編號|簽名|出生日期|私人聯絡|完整付款資料|登入憑證|申訴表全文|申訴信全文|法律策略|醫療紀錄|兒童姓名|貴重物明細|搬家公司名稱|司機姓名|客戶姓名|住戶姓名|遠端控制|password|passcode|access code|gate code|lockbox code|account number|card number|government id|driver license|license plate|full serial|serial number|shipment number|bill of lading number|contract number|claim number|case number|policy number|signature|payment credential|complaint form|legal strategy|medical record|child name|valuable contents|mover name|driver name|customer name|resident name|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、門禁、地址、金融、身分、運單、契約、簽名、貴重物、申訴、法律或私人參與者資料。請改寫成受保護紀錄索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: eventRows.filter((row) => row.parts[9] === status).length })).filter((item) => item.count > 0);
      return `${values.move.trim()}｜搬家箱件交接紀錄\n搬家情境：${values.context}\n裝載日：${formatter.format(loadingDate)}\n目的地交接：${handoverDate ? formatter.format(handoverDate) : "尚未記錄"}\n本次箱件清冊檢視：${formatter.format(reviewDate)}\n下一個箱件核對點：${formatter.format(nextReview)}\n仍開放箱件事件：${openRows.length} 筆\n已核對、完成或移交事件：${closedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n控制中的估價、契約、業者清冊、保管、點交、通知與結果來源：${values.basis.trim()}\n\n${lines("有版本的箱件與交接證據", eventRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜有來源的裝箱／裝載／保管／點交／狀況／通知／結果事實：${row.parts[2]}｜保管／來源：${row.parts[3]}｜事件日期：${formatter.format(strictIsoDate(row.parts[4]) as Date)}｜受保護證據：${row.parts[5]}｜下一個缺口／結案理由：${row.parts[6]}｜負責角色：${row.parts[7]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[8]) as Date)}｜狀態：${row.parts[9]}`))}\n\n受保護的原始證據位置：${values.storage.trim()}\n\n這份輸出只是家庭箱件索引。它不取代或修改估價單、契約、服務單、運單、業者清冊、價值選擇、保險、聲明、簽收、通知、申訴或求償，不驗證業者、營業資格、車輛、箱件、封條、物品、包裝、裝載、保管、點交、狀況、遺失、損傷、溝通或結果，不判定所有權、驗收、責任、賠償、價值、涵蓋、損害、放棄、求償或和解，不解釋法律或計算期限，不聯絡任何人、不提交或授權通知、求償、申訴、門禁或付款，也不認證完成。請保存原件，並使用實際契約、主管機關、保險、合格專業或緊急服務的現行指示。`;
    },
  },
  "storage-unit-access-inventory-log": {
    intro:
      "把迷你倉區帶、箱件放入、實際訪視、移位、取出、可見狀況、通知與退租結果做成安全版本索引。工具不驗證業者，也不判定契約、責任、保險或期限。",
    fields: [
      text("unit", "家庭私人倉位代號", "使用固定代號，不要輸入業者名稱、完整地址、倉號、帳號、契約、門禁、鑰匙或鎖具識別。", "STORE-2026-A"),
      {
        name: "context",
        label: "倉儲情境",
        type: "select",
        options: ["商用自助儲物空間", "社區或大樓附屬儲物櫃", "可移動式儲存貨櫃", "共用私人儲物空間", "其他受契約或規則控制的空間"],
      },
      { name: "baselineDate", label: "入住或箱位基線日", type: "date", value: "2026-08-20" },
      { name: "visitDate", label: "最後一次實際訪視日（尚未看見可留空）", type: "date", value: "2026-08-22" },
      { name: "reviewDate", label: "本次倉位紀錄檢視日", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "下一次訪視或物品核對點", type: "date", value: "2026-08-31" },
      text("basis", "控制中的契約、費率、規則、保險、基線、訪視、通知與退租來源", "使用安全來源代號或附日期的官方網址；完整文件、門禁、帳號與貴重物資料放受保護位置。", "CONTRACT-C1；RATE-R2；RULES-F1；INS-S1；BASE-P1；VISIT-V1；必要時 NOTICE-N1；退租時 MOVEOUT-M1"),
      {
        name: "events",
        label: "有版本的倉位、進出與物品事件",
        type: "textarea",
        help: "每行：ID｜區帶、箱件或物品群組｜有來源的放入、訪視、移位、取出、狀況、通知或結果事實｜觀察或來源角色｜事件日期 YYYY-MM-DD｜受保護證據索引｜下一個缺口或結案理由｜負責角色｜目標或結果日期 YYYY-MM-DD｜九種指定狀態之一。最多 18 行。",
        value: "BASE-1 | 前方層架 A 與地面區 B | 家庭基線照片連結可見區帶與私人箱號，不證明業者保管 | 家庭倉位複查角色 | 2026-08-20 | BASE-P1 受保護 | 依有日期區帶圖核對每個放入箱號並保留未看見範圍 | 家庭物品清單負責角色 | 2026-08-24 | 已建立基線索引，等待首次箱位核對\nVISIT-1 | 前方層架 A | 實際訪視看見 BOX-D-07 標籤位於層架 A，後方包覆家具區未檢查 | 家庭授權訪視角色 | 2026-08-22 | VISIT-V1 受保護 | 核對其餘區帶，不能把進入倉位本身寫成已看見全部物品 | 家庭倉位複查負責角色 | 2026-08-31 | 已記錄實際訪視，等待更新物品清單",
      },
      text("storage", "受保護的原始證據位置", "使用資料夾名稱，不要放業者地址、倉號、帳號、契約、保單、理賠、門禁、付款、私人參與者或貴重物明細。", "家庭紀錄／迷你倉／STORE-2026-A／受保護原件"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const visitDate = strictIsoDate(values.visitDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.unit.trim()) return "請輸入家庭私人倉位代號，讓匯出結果可以辨認。";
      if (!baselineDate) return "請用 YYYY-MM-DD 輸入真實的入住或箱位基線日。";
      if (!reviewDate) return "請用 YYYY-MM-DD 輸入真實的本次倉位紀錄檢視日。";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "本次倉位紀錄檢視日不能晚於今天。";
      if (baselineDate.getTime() > reviewDate.getTime()) return "入住或箱位基線日不能晚於本次檢視日。";
      if (visitDate && visitDate.getTime() < baselineDate.getTime()) return "最後一次實際訪視日不能早於基線日。";
      if (visitDate && visitDate.getTime() > reviewDate.getTime()) return "最後一次實際訪視日不能晚於本次檢視日。";
      if (!nextReview) return "請用 YYYY-MM-DD 輸入真實的下一次訪視或物品核對點。";
      if (nextReview.getTime() < reviewDate.getTime()) return "下一次訪視或物品核對點不能早於本次檢視日。";
      if (values.basis.trim().length < 12) return "請用安全索引指出控制中的契約、費率、規則、保險、基線、訪視、通知與退租來源。";
      if (!values.storage.trim()) return "請輸入倉位、訪視、狀況、通知與結果原始證據的受保護位置。";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "請至少加入一筆倉位、進出或物品事件。";
      if (eventRows.length > 18) return "一個版本最多支援 18 筆倉位事件；更多變化請另建下一個有日期版本。";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `倉位事件第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整包含十個以直線分隔的欄位。`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆倉位事件都需要不重複的 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "每個事件 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 VISIT-1。";
      const statusOrder = [
        "已建立基線索引，等待首次箱位核對",
        "箱件或物品已放入，等待位置與來源核對",
        "已記錄實際訪視，等待更新物品清單",
        "箱件或物品已取出，等待家庭目的地確認",
        "已記錄門禁或可見狀況問題，等待通知送達",
        "通知已送達，等待回覆或檢視",
        "本次檢視範圍已核對，連結下次定期複查",
        "退租或轉倉已完成，連結最終來源",
        "有限歸檔或已移交外部流程，缺口與責任已保存",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `倉位事件第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用欄位說明中的九種倉位狀態之一。`;
      const visitStatuses = new Set([statusOrder[2], statusOrder[3], statusOrder[4], statusOrder[6], statusOrder[7]]);
      const needsVisit = eventRows.filter((row) => visitStatuses.has(row.parts[9]));
      if (!visitDate && needsVisit.length)
        return `倉位事件第 ${needsVisit.map((row) => row.line).join("、")} 行使用實際訪視、取出、可見狀況、核對或完成退租狀態，因此必須填入真實的最後一次實際訪視日。`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[4]);
        return !eventDate || eventDate.getTime() < baselineDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `倉位事件第 ${invalidEventDates.map((row) => row.line).join("、")} 行需要介於基線日與本次檢視日之間的真實事件日期。`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 6).includes(row.parts[9]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(6).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的倉位事件第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標日必須從本次檢視日起，到下一次訪視或物品核對點為止。`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < baselineDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已核對、完成或移交的倉位事件第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於基線日與本次檢視日之間的實際結果日期。`;
      const missingSources = eventRows.filter((row) => row.parts[3].length < 3 || row.parts[5].length < 4 || row.parts[5].toLocaleUpperCase("en") === "MISSING");
      if (missingSources.length)
        return `倉位事件第 ${missingSources.map((row) => row.line).join("、")} 行需要觀察或來源角色，以及受保護的放入、訪視、狀況、通知或結果索引。`;
      const vagueActions = eventRows.filter((row) =>
        row.parts[6].length < 8 || /^(?:完成|好了|已訪視|已取出|空了|安全|有保全|已承保|遺失|損傷|已賠|已和解|核准|無|不用|不適用|待追蹤|已結案|ok)$/i.test(row.parts[6]),
      );
      if (vagueActions.length)
        return `倉位事件第 ${vagueActions.map((row) => row.line).join("、")} 行需要具體的證據缺口、下一步或有來源的結案理由，不能只寫通用門禁、安全、承保或完成詞。`;
      const privacyText = [values.unit, values.basis, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email、地址、倉號、帳號、契約、保單、理賠、序號或完整數字識別。請留在受保護原始證據，只在這裡放安全索引。";
      if (/密碼|門禁碼|鑰匙號碼|鎖具組合|鑰匙盒密碼|驗證碼|一次性代碼|警報碼|完整地址|完整門牌|業者地址|業者名稱|公司名稱|完整倉號|倉位號碼|帳號|卡號|銀行帳戶|匯款帳號|身分證|完整序號|契約編號|案件編號|理賠編號|保單編號|簽名|出生日期|私人聯絡|完整付款資料|登入憑證|申訴表全文|申訴信全文|法律策略|醫療紀錄|兒童姓名|貴重物明細|貴重品內容|業者負責人姓名|員工姓名|客戶姓名|住戶姓名|遠端控制|完整門禁路線|精確倉位位置|password|passcode|access code|gate code|lock combination|unit number|account number|card number|government id|full serial|serial number|contract number|claim number|case number|policy number|signature|payment credential|complaint form|legal strategy|medical record|child name|valuable contents|owner name|employee name|customer name|resident name|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、位置、門禁、金融、身分、倉號、契約、保單、貴重物、申訴、法律或私人參與者資料。請改寫成受保護紀錄索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: eventRows.filter((row) => row.parts[9] === status).length })).filter((item) => item.count > 0);
      return `${values.unit.trim()}｜迷你倉進出與物品紀錄\n倉儲情境：${values.context}\n入住或箱位基線日：${formatter.format(baselineDate)}\n最後一次實際訪視：${visitDate ? formatter.format(visitDate) : "尚未記錄"}\n本次倉位紀錄檢視：${formatter.format(reviewDate)}\n下一次訪視或物品核對點：${formatter.format(nextReview)}\n仍開放倉位事件：${openRows.length} 筆\n已核對、完成或移交事件：${closedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n控制中的契約、費率、規則、保險、基線、訪視、通知與退租來源：${values.basis.trim()}\n\n${lines("有版本的倉位、進出與物品證據", eventRows.map((row) => `${row.parts[0]}｜${row.parts[1]}｜有來源的放入／訪視／移位／取出／狀況／通知／結果事實：${row.parts[2]}｜觀察／來源：${row.parts[3]}｜事件日期：${formatter.format(strictIsoDate(row.parts[4]) as Date)}｜受保護證據：${row.parts[5]}｜下一個缺口／結案理由：${row.parts[6]}｜負責角色：${row.parts[7]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[8]) as Date)}｜狀態：${row.parts[9]}`))}\n\n受保護的原始證據位置：${values.storage.trim()}\n\n這份輸出只是家庭倉位索引。它不取代或修改租用契約、費率或費用通知、場地規則、保單、物品清單、所有權或價值來源、門禁紀錄、退租文件、通知、申訴或理賠，不驗證業者、負責人、登記、營業資格、土地使用、建築或消防、倉位、尺寸、門鎖、門禁、監控、保全、環境、物品、溝通或結果，不檢查現場、不判定保管、疏失、責任、承保、價值、損害、放棄、理賠、申訴或法律權利，不計算繳費、調價、通知、欠租、物品處理、拍賣、終止、保險、理賠或法律期限，不聯絡任何人、不提交或授權門禁、通知、付款、處分、申訴或理賠，也不認證倉位安全、承保、已核對或已清空。請保存原件，並使用實際契約、業者、主管機關、保險、合格專業或緊急服務的現行指示。`;
    },
  },
  "household-record-retrieval-drill-log": {
    intro:
      "記錄已有授權的備援家庭角色能否依目前資料夾索引找到有限來源、分辨版本並維持預定揭露範圍。工具不搜尋檔案、不驗證備份，也不會授予存取權。",
    fields: [
      text("drill", "家庭私人演練代號", "使用固定家庭代號，不要輸入姓名、完整地址、帳號、弱勢家人、貴重資產或精確文件位置。", "BINDER-DRILL-2026-A"),
      {
        name: "context",
        label: "查找與交接情境",
        type: "select",
        options: ["一般家庭數位資料夾複查", "臨時家庭交接", "搬家、裝置更換或封存遷移", "有限防災或離線參考複查", "新增備援家庭資料角色"],
      },
      { name: "baselineDate", label: "資料夾基準版本日", type: "date", value: "2026-08-20" },
      { name: "exerciseDate", label: "首次指派或演練日", type: "date", value: "2026-08-22" },
      { name: "reviewDate", label: "本次演練檢視日", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "下一次修正或複測點", type: "date", value: "2026-08-31" },
      text("basis", "控制中的目錄、目前來源、對象、存取、備份與離線索引", "使用安全代號或附日期的公開來源網址；完整文件、權限、憑證、備份內容與敏感對象規則放受保護位置。", "CATALOG-C3；SOURCE-LIST-S2；AUDIENCE-A2；ACCESS-PROCESS-P1；BACKUP-VERIFY-B4；OFFLINE-O2"),
      {
        name: "events",
        label: "有版本的查找、揭露與複測列",
        type: "textarea",
        help: "每行：ID｜要查找的紀錄與用途｜已授權測試角色｜嘗試或指派日期 YYYY-MM-DD｜索引位置與目前來源｜實際查找結果｜揭露、存取或版本缺口及修正／結案理由｜負責角色｜目標或結果日期 YYYY-MM-DD｜八種指定狀態之一。最多 16 行。",
        value: "DOC-1 | 找到設備 ASSET-A2 的目前原廠說明書，供保養規劃使用 | 備援家庭資料角色 | 2026-08-22 | CATALOG-C3 連到 MANUAL-M4；2026-08-20 擷取原廠官方來源 | 依共同索引找到 M4，且未開啟受保護收據 | 核對發行者頁面仍為目前控制來源，收據維持在日常交接之外 | 家庭文件負責角色 | 2026-08-31 | 已找到來源，等待最新來源核對\nOFFLINE-1 | 找到停電時使用的最小家庭離線聯絡卡 | 備援家庭協調角色 | 2026-08-22 | OFFLINE-O2 與 AUDIENCE-A2 | 依約定櫃位標籤找到紙本卡，且可看見複查日 | 核對限定對象與官方來源索引，不加入完整聯絡資料 | 家庭持續運作負責角色 | 2026-08-31 | 已嘗試替代或離線路徑，等待後續",
      },
      text("storage", "受保護的原件、權限與演練證據位置", "使用資料夾或流程代號，不要放文件、密碼、完整地址、帳號、身分、醫療、財務、門禁或弱勢家人資訊。", "家庭紀錄／資料夾演練／BINDER-DRILL-2026-A／受保護證據"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const exerciseDate = strictIsoDate(values.exerciseDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.drill.trim()) return "請輸入家庭私人演練代號，讓匯出結果可以辨認。";
      if (!baselineDate) return "請用 YYYY-MM-DD 輸入真實的資料夾基準版本日。";
      if (!exerciseDate) return "請用 YYYY-MM-DD 輸入真實的首次指派或演練日。";
      if (!reviewDate) return "請用 YYYY-MM-DD 輸入真實的本次演練檢視日。";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "本次演練檢視日不能晚於今天。";
      if (baselineDate.getTime() > exerciseDate.getTime()) return "資料夾基準版本日不能晚於首次指派或演練日。";
      if (exerciseDate.getTime() > reviewDate.getTime()) return "首次指派或演練日不能晚於本次演練檢視日。";
      if (!nextReview) return "請用 YYYY-MM-DD 輸入真實的下一次修正或複測點。";
      if (nextReview.getTime() < reviewDate.getTime()) return "下一次修正或複測點不能早於本次演練檢視日。";
      if (values.basis.trim().length < 12) return "請用安全索引指出控制中的目錄、目前來源、對象、存取、備份與離線來源。";
      if (!values.storage.trim()) return "請輸入原件、權限與演練證據的受保護位置。";
      const eventRows = values.events.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (eventRows.length === 0) return "請至少加入一個查找題目或實際嘗試。";
      if (eventRows.length > 16) return "一個演練版本最多支援 16 行；請先凍結這個範圍，再另建下一個有日期版本。";
      const invalidRows = eventRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `查找演練第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整包含十個以直線分隔的欄位。`;
      const ids = eventRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆查找或複測列都需要不重複的 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "每個 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 DOC-1 或 RETEST-1。";
      const statusOrder = [
        "已指派題目，等待實際查找",
        "已記錄嘗試，索引位置未解決",
        "已找到來源，等待最新來源核對",
        "已找到來源，等待最小揭露核對",
        "已嘗試替代或離線路徑，等待後續",
        "缺口已修正，等待另次複測",
        "複測通過，已連結目前來源與對象範圍",
        "有限封存或已移交外部流程，保留缺口與負責人",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = eventRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `查找演練第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用欄位說明中的八種證據狀態之一。`;
      const invalidEventDates = eventRows.filter((row) => {
        const eventDate = strictIsoDate(row.parts[3]);
        return !eventDate || eventDate.getTime() < exerciseDate.getTime() || eventDate.getTime() > reviewDate.getTime();
      });
      if (invalidEventDates.length)
        return `查找演練第 ${invalidEventDates.map((row) => row.line).join("、")} 行需要介於首次演練日與本次檢視日之間的真實指派或嘗試日期。`;
      const openRows = eventRows.filter((row) => statusOrder.slice(0, 6).includes(row.parts[9]));
      const closedRows = eventRows.filter((row) => statusOrder.slice(6).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的查找演練第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標日必須從本次檢視日起，到下一次修正或複測點為止。`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < exerciseDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已通過、封存或移交的演練第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於首次演練日與本次檢視日之間的實際結果日期。`;
      const missingEvidence = eventRows.filter((row) => row.parts[2].length < 3 || row.parts[4].length < 8 || row.parts[5].length < 8);
      if (missingEvidence.length)
        return `查找演練第 ${missingEvidence.map((row) => row.line).join("、")} 行需要已授權測試角色、安全的索引／目前來源位置，以及可歸屬的實際觀察結果。`;
      const passedWithoutProof = eventRows.filter((row) => row.parts[9] === statusOrder[6] && !/複測/.test(`${row.parts[1]} ${row.parts[5]} ${row.parts[6]}`));
      if (passedWithoutProof.length)
        return `通過的演練第 ${passedWithoutProof.map((row) => row.line).join("、")} 行必須描述另一次實際複測，不能只寫原本嘗試或修正。`;
      const passedWithoutSourceOrScope = eventRows.filter((row) => row.parts[9] === statusOrder[6] && (!/(?:目前|控制|發行|官方).{0,6}(?:來源|版本)|(?:來源|版本).{0,6}(?:目前|控制|核對)/.test(`${row.parts[4]} ${row.parts[5]} ${row.parts[6]}`) || !/(?:對象|範圍|最小揭露|未開啟|未複製|刻意不看)/.test(`${row.parts[4]} ${row.parts[5]} ${row.parts[6]}`)));
      if (passedWithoutSourceOrScope.length)
        return `通過的演練第 ${passedWithoutSourceOrScope.map((row) => row.line).join("、")} 行必須連結目前或控制來源，以及實測對象或最小揭露範圍。`;
      const vagueActions = eventRows.filter((row) => row.parts[6].length < 8 || /^(?:完成|修好|安全|完整|可存取|已驗證|準備好|通過|已找到|最新版|已分享|沒問題|無|不用|不適用|ok)$/i.test(row.parts[6]));
      if (vagueActions.length)
        return `查找演練第 ${vagueActions.map((row) => row.line).join("、")} 行需要具體的揭露、存取或版本缺口，以及有來源的修正或結案理由，不能只寫通用通過詞。`;
      const privacyText = [values.drill, values.basis, values.events, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email、地址、帳號、保單、案件、序號、身分或完整數字識別。請留在受保護原件，只在這裡放安全索引。";
      if (/密碼|通關密語|門禁碼|警報碼|驗證碼|一次性代碼|復原答案|復原碼|加密金鑰|私鑰|助記詞|完整地址|完整門牌|帳號|卡號|銀行帳戶|匯款帳號|身分證|護照號碼|駕照號碼|完整序號|保單編號|理賠編號|案件編號|契約編號|簽名|出生日期|私人聯絡|完整付款資料|登入憑證|醫療紀錄|診斷|用藥明細|兒童姓名|學校名稱|照護行程|弱勢家人|貴重物明細|貴重品內容|精確文件位置|完整門禁路線|姓名|客戶姓名|住戶姓名|法律策略|申訴信全文|遠端控制|文件內容|備份內容|備份密碼|完整姓名|身分文件|財務報表|健康紀錄|授權書內容|遺囑內容|信託內容|生物辨識|安全答案|驗證器秘密|API 金鑰|信用卡|統一編號|password|passphrase|passcode|access code|recovery answer|recovery code|one-time code|verification code|encryption key|private key|seed phrase|full address|account number|card number|government id|passport number|driver license|full serial|serial number|policy number|claim number|case number|contract number|signature|payment credential|medical record|diagnosis|medication detail|child name|school name|care schedule|vulnerable person|valuable contents|exact document location|person name|customer name|resident name|legal strategy|complaint letter|document contents|backup contents|backup password|full name|identity document|financial statement|health record|power of attorney|will contents|trust contents|biometric|security answer|authenticator secret|api key|credit card|tax id|ssn|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、復原秘密、地址、金融、身分、醫療、兒少、照護、門禁、貴重物、法律、備份內容或私人參與者資料。請改寫成受保護流程或來源索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: eventRows.filter((row) => row.parts[9] === status).length })).filter((item) => item.count > 0);
      return `${values.drill.trim()}｜家庭文件查找與交接演練\n演練情境：${values.context}\n資料夾基準版本：${formatter.format(baselineDate)}\n首次指派或演練：${formatter.format(exerciseDate)}\n本次演練檢視：${formatter.format(reviewDate)}\n下一次修正或複測點：${formatter.format(nextReview)}\n仍開放題目、嘗試或修正：${openRows.length} 筆\n已通過、封存或移交：${closedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n控制中的目錄、目前來源、對象、存取、備份與離線索引：${values.basis.trim()}\n\n${lines("有版本的查找、揭露與複測證據", eventRows.map((row) => `${row.parts[0]}｜要查找的紀錄／用途：${row.parts[1]}｜已授權測試角色：${row.parts[2]}｜指派／嘗試日期：${formatter.format(strictIsoDate(row.parts[3]) as Date)}｜索引／目前來源：${row.parts[4]}｜實際結果：${row.parts[5]}｜揭露／存取／版本缺口與修正／結案：${row.parts[6]}｜負責角色：${row.parts[7]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[8]) as Date)}｜狀態：${row.parts[9]}`))}\n\n受保護的原件、權限與演練證據位置：${values.storage.trim()}\n\n這份輸出只是家庭查找演練索引。它不搜尋瀏覽器、裝置、資料夾、雲端服務或 FamilyBoard 資料庫，不開啟、複製、上傳、解密、還原、驗證、修改、刪除或分享任何檔案、文件、憑證或備份，不驗證來源、發行者、簽名、版本、權限或身分，不判定法律授權、同意、充分性、保存期限、承保、所有權、存取權或防災就緒，不授予、撤銷或測試帳戶、門鎖、裝置或服務，不聯絡家人、發行者、業者、主管機關或緊急服務，也不認證資料夾、備份、交接或家庭已最新、安全、可存取、合規或完整。請把原件、權限與憑證保存在適合的系統，真實決定使用目前負責來源。`;
    },
  },
  "important-household-document-review": {
    intro:
      "盤點哪些文件類別支援真實家庭責任，逐項連結目前來源、受保護原件或有限影本、補發路徑、負責角色與日期。工具不開啟、驗證、補發或保存任何文件。",
    fields: [
      text("review", "家庭私人盤點代號", "使用固定家庭代號，不要輸入姓名、完整地址、帳號、案件、弱勢家人或精確受保護位置。", "DOC-COVERAGE-2026-A"),
      {
        name: "context",
        label: "文件適用性盤點情境",
        type: "select",
        options: ["第一次建立家庭資料夾", "搬家或家庭角色改變", "年度機關與來源複查", "裝置或資料夾遺失後重建", "準備有限交接或離線版本"],
      },
      { name: "baselineDate", label: "來源清單基準日", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: "本次適用性盤點日", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "下一次來源或存取查核點", type: "date", value: "2026-09-07" },
      text("basis", "控制中的機關、目前來源、存取、補發與保護索引", "使用安全代號或附日期的公開來源網址；原件、文件內容、授權證據、憑證與敏感存取規則放受保護位置。", "ISSUER-LIST-I2；SOURCE-CURRENT-S3；ACCESS-A2；REPLACEMENT-R3；BACKUP-B4"),
      {
        name: "records",
        label: "有版本的適用性、來源、保護與補發列",
        type: "textarea",
        help: "每行：ID｜家庭決定或文件用途｜來源核對日 YYYY-MM-DD｜控制中的機關／業者或目前來源索引｜受保護原件、有限影本與授權存取狀態｜官方補發或重建路徑｜具體缺口、修正或結案理由｜負責角色｜目標或結果日期 YYYY-MM-DD｜十種指定狀態之一。最多 14 行。",
        value: "HOUSING-1 | 目前租住來源供一般家庭行政使用 | 2026-08-23 | ISSUER-I2；2026-08-23 核對目前契約發行來源 | 受保護原件 O1；日常索引只顯示有限位置代號與負責角色 | REPLACEMENT-R3 已記錄向原發行來源申請副本的官方路徑；存取條件維持受保護 | 核對已有授權的備援角色能否從受控入口開始，不查看契約內容 | 家庭文件負責角色 | 2026-09-07 | 已記錄補發或重建路徑，等待後續\nOFFLINE-1 | 提供預定備援角色使用的有限家庭防災參考 | 2026-08-23 | SOURCE-CURRENT-S3 與 2026-08-23 擷取的官方防災來源 | 有限離線影本 O2 已標示對象與複查日；私人主檔維持受保護 | REPLACEMENT-R4 可從目前來源清單重建有限版本 | 下次列印前核對最小揭露，完整私人欄位維持不提供 | 家庭持續運作負責角色 | 2026-09-07 | 已準備有限持續運作參考，等待對象複查",
      },
      text("storage", "受保護原件、授權證據與盤點歷程位置", "使用資料夾或流程代號，不要放文件影像、完整地址、帳號、身分、醫療、財務、兒少、法律、門禁或私人參與者資料。", "家庭紀錄／文件適用性盤點／DOC-COVERAGE-2026-A／受保護歷程"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.review.trim()) return "請輸入家庭私人盤點代號，讓匯出版本可以辨認。";
      if (!baselineDate) return "請用 YYYY-MM-DD 輸入真實的來源清單基準日。";
      if (!reviewDate) return "請用 YYYY-MM-DD 輸入真實的本次適用性盤點日。";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "本次適用性盤點日不能晚於今天。";
      if (baselineDate.getTime() > reviewDate.getTime()) return "來源清單基準日不能晚於本次適用性盤點日。";
      if (!nextReview) return "請用 YYYY-MM-DD 輸入真實的下一次來源或存取查核點。";
      if (nextReview.getTime() < reviewDate.getTime()) return "下一次來源或存取查核點不能早於本次適用性盤點日。";
      if (values.basis.trim().length < 12) return "請用安全索引指出控制中的機關、目前來源、存取、補發與保護來源。";
      if (!values.storage.trim()) return "請輸入原件、授權證據與盤點歷程的受保護位置。";
      const recordRows = values.records.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (recordRows.length === 0) return "請至少加入一個適用或明確不適用的家庭責任。";
      if (recordRows.length > 14) return "一個適用性盤點版本最多支援 14 行；請先凍結本版，再建立下一個有日期範圍。";
      const invalidRows = recordRows.filter((row) => row.parts.length !== 10 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `文件適用性盤點第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整包含十個以直線分隔的欄位。`;
      const ids = recordRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆文件適用性盤點列都需要不重複的 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "每個 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 HOUSING-1 或 OFFLINE-1。";
      const statusOrder = [
        "已記錄適用範圍，等待決定控制來源",
        "確認適用，尚未核對控制來源",
        "已確認控制來源，等待版本或效期複查",
        "已找到原件或有限影本，等待授權存取複查",
        "已記錄補發或重建路徑，等待後續",
        "已準備有限持續運作參考，等待對象複查",
        "缺口已修正，等待再次核對",
        "本次盤點已核對，連結來源、保護與取用路徑",
        "不適用，已記錄理由與重新檢視條件",
        "有限封存或外部流程，保留缺口與負責人",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = recordRows.filter((row) => !statuses.has(row.parts[9]));
      if (invalidStatuses.length)
        return `文件適用性盤點第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用欄位說明中的十種證據狀態之一。`;
      const invalidSourceDates = recordRows.filter((row) => {
        const sourceDate = strictIsoDate(row.parts[2]);
        return !sourceDate || sourceDate.getTime() < baselineDate.getTime() || sourceDate.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return `文件適用性盤點第 ${invalidSourceDates.map((row) => row.line).join("、")} 行，需要介於基準日與本次盤點日之間的真實來源核對日。`;
      const openRows = recordRows.filter((row) => statusOrder.slice(0, 7).includes(row.parts[9]));
      const closedRows = recordRows.filter((row) => statusOrder.slice(7).includes(row.parts[9]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[8]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的文件適用性盤點第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標日必須從本次盤點日起，到下一次來源或存取查核點為止。`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[8]);
        return !outcome || outcome.getTime() < baselineDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已核對、不適用或封存的第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於基準日與本次盤點日之間的實際結果日期。`;
      const missingLayers = recordRows.filter((row) => row.parts[1].length < 6 || row.parts[3].length < 8 || row.parts[4].length < 8 || row.parts[5].length < 8 || row.parts[7].length < 3);
      if (missingLayers.length)
        return `文件適用性盤點第 ${missingLayers.map((row) => row.line).join("、")} 行需要真實用途、控制來源索引、保護／存取狀態、補發路徑與負責角色。`;
      const reconciledWithoutLayers = recordRows.filter((row) => row.parts[9] === statusOrder[7] && (!/(?:目前|控制|發行|機關|官方).{0,8}(?:來源|版本)|(?:來源|版本).{0,8}(?:目前|控制|核對)/.test(row.parts[3]) || !/(?:受保護|有限|授權|對象|存取|未提供)/.test(row.parts[4]) || !/(?:補發|換發|重建|重新取得|取用|官方申請|原發行)/.test(row.parts[5])));
      if (reconciledWithoutLayers.length)
        return `已核對的第 ${reconciledWithoutLayers.map((row) => row.line).join("、")} 行必須連結目前或控制來源、受保護或有限存取狀態，以及負責的補發、換發、重建或取用路徑。`;
      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[9] === statusOrder[8] && !/(?:重新檢視|重開|若|如果|當|之後|購買|租用|搬家|理賠|受照顧|角色改變|新增責任)/.test(row.parts[6]));
      if (notApplicableWithoutTrigger.length)
        return `不適用的第 ${notApplicableWithoutTrigger.map((row) => row.line).join("、")} 行必須寫目前理由，以及重新打開這個類別的事件。`;
      const vagueActions = recordRows.filter((row) => row.parts[6].length < 8 || /^(?:完成|安全|有效|合法|完整|已驗證|準備好|最新版|已承保|已接受|可存取|沒問題|無|不用|不適用|ok)$/i.test(row.parts[6]));
      if (vagueActions.length)
        return `文件適用性盤點第 ${vagueActions.map((row) => row.line).join("、")} 行需要具體的來源、保護、存取或補發缺口，以及有來源的修正／結案理由，不能只寫通用狀態詞。`;
      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email、地址、帳號、保單、理賠、案件、序號、身分或完整數字識別。請留在受保護原件，只在這裡放安全索引。";
      if (/密碼|通關密語|門禁碼|警報碼|驗證碼|一次性代碼|復原答案|復原碼|加密金鑰|私鑰|助記詞|自然人憑證 PIN|憑證 PIN|完整地址|完整門牌|帳號|卡號|銀行帳戶|匯款帳號|身分證字號|護照號碼|駕照號碼|完整序號|保單編號|理賠編號|案件編號|契約編號|簽名|出生日期|私人聯絡|完整付款資料|登入憑證|醫療紀錄|診斷|處方明細|用藥明細|兒童姓名|學校名稱|照護行程|弱勢家人|貴重物內容|精確文件位置|完整門禁路線|完整姓名|客戶姓名|住戶姓名|法律策略|申訴信全文|文件內容|遺囑內容|信託內容|授權書內容|財務報表|健康紀錄|生物辨識|安全答案|驗證器秘密|API 金鑰|信用卡|統一編號|password|passphrase|passcode|access code|recovery answer|recovery code|one-time code|verification code|encryption key|private key|seed phrase|full address|account number|card number|government id|passport number|driver license number|full serial|serial number|policy number|claim number|case number|contract number|signature|payment credential|medical record|diagnosis|prescription detail|medication detail|child name|school name|care schedule|vulnerable person|valuable contents|exact document location|person name|customer name|resident name|legal strategy|complaint letter|document contents|will contents|trust contents|authorization contents|financial statement|health record|biometric|security answer|authenticator secret|api key|credit card|tax id|ssn|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、復原秘密、地址、金融、身分、醫療、兒少、照護、門禁、貴重物、法律內容或私人參與者資料。請改寫成受保護流程或來源索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[9] === status).length })).filter((item) => item.count > 0);
      return `${values.review.trim()}｜家庭重要文件適用性與來源盤點\n盤點情境：${values.context}\n來源清單基準：${formatter.format(baselineDate)}\n本次適用性盤點：${formatter.format(reviewDate)}\n下一次來源或存取查核點：${formatter.format(nextReview)}\n仍開放的來源、保護或補發缺口：${openRows.length} 筆\n已核對、不適用或封存：${closedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n控制中的機關、目前來源、存取、補發與保護索引：${values.basis.trim()}\n\n${lines("有版本的家庭重要文件適用性證據", recordRows.map((row) => `${row.parts[0]}｜家庭用途：${row.parts[1]}｜來源核對日：${formatter.format(strictIsoDate(row.parts[2]) as Date)}｜機關／目前來源：${row.parts[3]}｜受保護原件／有限影本／授權存取：${row.parts[4]}｜補發／重建路徑：${row.parts[5]}｜缺口／修正／結案：${row.parts[6]}｜負責角色：${row.parts[7]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[8]) as Date)}｜狀態：${row.parts[9]}`))}\n\n受保護的原件、授權證據與盤點歷程位置：${values.storage.trim()}\n\n這份輸出只是家庭規劃索引。它不開啟、搜尋、上傳、複製、驗證、補發、換發、續期、撤銷、銷毀、保存或分享任何文件、憑證、帳戶或紀錄，不聯絡機關、業者、接收單位、家人或緊急服務，不證明身分、關係、租住、所有權、代理權、同意、簽章、版本、機關接受、承保、價值、狀況、理賠或法律充分性，不決定適用性或保存期限、不計算外部期限、不授予存取，也不完成政府、金融、保險、醫療、就學、就業、移民、財產或法律程序，或認證家庭持續運作與防災準備。請把原件與授權證據保存在適合的受保護系統，真實決定使用目前發行機關、接收單位、契約、保單、主管機關及合格專業來源。`;
    },
  },
  "household-record-retention-decision-log": {
    intro:
      "用目前主管來源、來源定義的起算事件、未結用途或暫停處分檢查、受保護版本、負責人與實際結果建立版本化決策。工具不計算期限，也不銷毀紀錄。",
    fields: [
      text("review", "家庭私人保存決策代號", "使用家庭內部代號，不要輸入姓名、地址、身分／稅務／帳號／案件識別、弱勢家人或精確受保護位置。", "RETENTION-2026-A"),
      {
        name: "context",
        label: "保存決策盤點情境",
        type: "select",
        options: [
          "年度家庭紀錄複查",
          "報稅季來源核對",
          "搬家、出售、移轉或物品處分",
          "保固、保單或契約換版",
          "理賠、申訴、查核或爭議變化",
          "受控的紙本與數位資料清理",
        ],
      },
      { name: "baselineDate", label: "來源地圖基準日", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: "本次保存決策檢視日", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "下一次規則或來源核點", type: "date", value: "2026-09-14" },
      text("basis", "控制中的主管機關、發行者、契約、保單、暫停處分與處理流程來源", "使用安全來源／版本代號或有日期的公開網址；申報、契約、帳單、案件、憑證與文件內容放受保護位置。", "SOURCE-MAP-S2；MOF-TAX-T4；PROPERTY-P2；WARRANTY-W3；POLICY-I2；DISPOSAL-D1"),
      {
        name: "records",
        label: "有版本的保存、封存與處分決策列",
        type: "textarea",
        help: "每行：ID｜紀錄類別與實際家庭用途｜來源核對日 YYYY-MM-DD｜控制來源、規則與適用範圍｜來源定義的起算或結束事件｜目前用途、例外或暫停處分檢查｜受保護原件與目前版本狀態｜預定或已觀察動作與證據｜負責角色｜目標或結果日期 YYYY-MM-DD｜十二種指定狀態之一。最多 14 行。",
        value: "TAX-2025 | 支援家庭該年度綜合所得稅申報項目與繳納證明 | 2026-08-23 | MOF-TAX-T4 財政部當年度申報與憑證來源已定位，個案分支仍待核對 | 申報、繳納與附件成功事件只以受保護來源 TAX-EVENT-E2 索引 | 補件、查核、退補稅、其他年度與非稅務用途尚未完成逐項檢查 | 受保護年度資料夾 TAX-A4；日常索引只顯示年度與來源代號 | 核對適用年度官方來源及個案狀態，再記錄真實事件，不把本次家庭核點寫成可銷毀日 | 家庭稅務紀錄負責角色 | 2026-09-14 | 已找到來源，尚未核對目前規則\nWARRANTY-1 | 支援仍在管理家電的書面保證、維修與召回歷程 | 2026-08-23 | WARRANTY-W3 書面保證與製造商目前支援來源已核對 | 保證起算方法與物品移轉事件存於 EVENT-W2 安全索引 | 家電仍持有且維修追蹤未結束；用途仍進行時繼續保存 | 受保護收據與保證書在 ASSET-A3；家庭索引只放目前服務入口 | 維修結案後再核對召回、保險、房屋成本、稅務或爭議用途，確認前不建立處分候選 | 家庭財物紀錄負責角色 | 2026-09-14 | 用途、期間、持有、理賠或爭議仍進行，繼續保存並複查",
      },
      text("storage", "受保護原件、核准與決策證據位置", "使用資料夾或流程代號，不要輸入申報、收據、保單、契約、帳單、身分、醫療、兒少、法律、帳號、憑證或處理證據內容。", "家庭紀錄／保存決策／RETENTION-2026-A／受保護歷程"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.review.trim()) return "請輸入家庭私人保存決策代號，讓匯出版本可以辨認。";
      if (!baselineDate) return "請用 YYYY-MM-DD 輸入真實的來源地圖基準日。";
      if (!reviewDate) return "請用 YYYY-MM-DD 輸入真實的本次保存決策檢視日。";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "本次保存決策檢視日不能晚於今天。";
      if (baselineDate.getTime() > reviewDate.getTime()) return "來源地圖基準日不能晚於本次保存決策檢視日。";
      if (!nextReview) return "請用 YYYY-MM-DD 輸入真實的下一次規則或來源核點。";
      if (nextReview.getTime() < reviewDate.getTime()) return "下一次規則或來源核點不能早於本次保存決策檢視日。";
      if (values.basis.trim().length < 12) return "請用安全索引指出主管機關、發行者、契約、保單、暫停處分與處理流程來源。";
      if (!values.storage.trim()) return "請輸入受保護原件、核准與決策證據位置。";
      const recordRows = values.records.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (recordRows.length === 0) return "請至少加入一類家庭紀錄與實際用途。";
      if (recordRows.length > 14) return "一個保存決策版本最多支援 14 行；請先凍結本版，再建立另一個範圍。";
      const invalidRows = recordRows.filter((row) => row.parts.length !== 11 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `保存決策第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整包含十一個以直線分隔的欄位。`;
      const ids = recordRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆保存決策列都需要不重複的 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "每個 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 TAX-2025 或 WARRANTY-1。";
      const statusOrder = [
        "已記錄用途，等待決定控制來源",
        "已找到來源，尚未核對目前規則",
        "已核對規則，尚未確認起算事件",
        "已記錄起算事件，等待例外與目前用途檢查",
        "用途、期間、持有、理賠或爭議仍進行，繼續保存並複查",
        "負責來源要求繼續保存，等待下一次複查",
        "處分候選，等待人工核准",
        "已準備替換或遮蔽計畫，等待完成",
        "決定繼續保存，已連結來源與下次複查",
        "已完成處分，記錄方法與有限證據",
        "已移交或封存，連結保管與下一負責人",
        "不適用，記錄理由與重新打開條件",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = recordRows.filter((row) => !statuses.has(row.parts[10]));
      if (invalidStatuses.length)
        return `保存決策第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用欄位說明中的十二種證據狀態之一。`;
      const invalidSourceDates = recordRows.filter((row) => {
        const sourceDate = strictIsoDate(row.parts[2]);
        return !sourceDate || sourceDate.getTime() < baselineDate.getTime() || sourceDate.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return `保存決策第 ${invalidSourceDates.map((row) => row.line).join("、")} 行，需要介於基準日與本次檢視日之間的真實來源核對日。`;
      const openRows = recordRows.filter((row) => statusOrder.slice(0, 8).includes(row.parts[10]));
      const closedRows = recordRows.filter((row) => statusOrder.slice(8).includes(row.parts[10]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[9]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的保存決策第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標日必須從本次檢視日起，到下一次規則或來源核點為止。`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[9]);
        return !outcome || outcome.getTime() < baselineDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已結束本版的保存、處分、移交或不適用第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於基準日與本次檢視日之間的實際結果日期。`;
      const missingLayers = recordRows.filter((row) => row.parts[1].length < 6 || row.parts[3].length < 8 || row.parts[4].length < 6 || row.parts[5].length < 6 || row.parts[6].length < 6 || row.parts[7].length < 8 || row.parts[8].length < 3);
      if (missingLayers.length)
        return `保存決策第 ${missingLayers.map((row) => row.line).join("、")} 行需要真實用途、控制來源、起算事件、目前用途／暫停處分檢查、受保護版本、可歸屬動作與負責角色。`;
      const disposalCandidatesThatClaimCompletion = recordRows.filter((row) => row.parts[10] === statusOrder[6] && /(?:已完成|已銷毀|已碎紙|已刪除|已清除|全部副本消失)/.test(row.parts[7]));
      if (disposalCandidatesThatClaimCompletion.length)
        return `處分候選第 ${disposalCandidatesThatClaimCompletion.map((row) => row.line).join("、")} 行只能寫預定動作；有權人實際完成並觀察結果後，才能改用已完成狀態。`;
      const unsafeCompletedDisposals = recordRows.filter((row) => row.parts[10] === statusOrder[9] && (/(?:未結|進行中|等待|暫停|查核|理賠|爭議|調查|退款|申訴|訴訟|尚未|未知)/.test(row.parts[5]) || !/(?:已觀察|已完成|碎紙|刪除|清除|銷毀|移除).{0,30}(?:方法|紙本|檔案|位置|證據|紀錄)|(?:證據|方法).{0,30}(?:已觀察|已完成|碎紙|刪除|清除|銷毀|移除)/.test(row.parts[7])));
      if (unsafeCompletedDisposals.length)
        return `已完成處分第 ${unsafeCompletedDisposals.map((row) => row.line).join("、")} 行必須顯示本次沒有未解的用途或暫停處分，並記錄限定的實際方法與安全證據代號。`;
      const continuedWithoutSource = recordRows.filter((row) => row.parts[10] === statusOrder[8] && (!/(?:來源|機關|發行者|契約|保單|規則|專業)/.test(row.parts[3]) || !/(?:繼續保存|保留).{0,30}(?:下次|複查|核對|來源|核點)/.test(row.parts[7])));
      if (continuedWithoutSource.length)
        return `決定繼續保存第 ${continuedWithoutSource.map((row) => row.line).join("、")} 行必須連結負責來源與下一次複查，不能只寫永久保存。`;
      const transferWithoutCustody = recordRows.filter((row) => row.parts[10] === statusOrder[10] && !/(?:移交|封存|保管|負責人|負責角色)/.test(row.parts[7]));
      if (transferWithoutCustody.length)
        return `已移交或封存第 ${transferWithoutCustody.map((row) => row.line).join("、")} 行必須記錄實際保管／封存動作與下一負責角色。`;
      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[10] === statusOrder[11] && !/(?:重新打開|重新檢視|若|如果|當|之後|購買|持有|理賠|契約|角色改變|新增責任)/.test(row.parts[7]));
      if (notApplicableWithoutTrigger.length)
        return `不適用第 ${notApplicableWithoutTrigger.map((row) => row.line).join("、")} 行必須寫目前理由，以及重新打開這個類別的事件。`;
      const vagueActions = recordRows.filter((row) => row.parts[7].length < 8 || /^(?:完成|保留|永久|刪除|已刪除|碎紙|已碎紙|封存|安全|有效|合法|完整|已驗證|準備好|過期|無|不用|不適用|ok)$/i.test(row.parts[7]));
      if (vagueActions.length)
        return `保存決策第 ${vagueActions.map((row) => row.line).join("、")} 行需要具體的預定或實際動作、來源化理由與安全證據代號，不能只寫保留、刪除或過期。`;
      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email、地址、帳號、納稅、保單、理賠、案件、身分或完整數字識別。請留在受保護原件，只在這裡放安全索引。";
      if (/密碼|通關密語|門禁碼|警報碼|驗證碼|一次性代碼|復原答案|復原碼|加密金鑰|私鑰|助記詞|自然人憑證 PIN|憑證 PIN|完整地址|完整門牌|帳號|卡號|銀行帳戶|匯款帳號|身分證字號|護照號碼|駕照號碼|納稅義務人編號|統一編號|保單編號|理賠編號|案件編號|契約編號|簽名|出生日期|私人聯絡|完整付款資料|登入憑證|醫療紀錄|診斷|處方明細|用藥明細|兒童姓名|學校名稱|照護行程|弱勢家人|精確文件位置|完整門禁路線|完整姓名|客戶姓名|住戶姓名|法律策略|申訴信全文|申報內容|帳單內容|契約內容|理賠內容|文件內容|遺囑內容|信託內容|授權書內容|財務報表|健康紀錄|生物辨識|安全答案|驗證器秘密|API 金鑰|信用卡|銷毀證據內容|password|passphrase|passcode|access code|recovery answer|recovery code|one-time code|verification code|encryption key|private key|seed phrase|full address|account number|card number|government id|taxpayer number|tax id|ssn|policy number|claim number|case number|contract number|signature|payment credential|medical record|diagnosis|child name|care schedule|exact document location|person name|legal strategy|complaint letter|return contents|statement contents|agreement contents|claim contents|document contents|financial statement|health record|disposal evidence contents|full name|identity document|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、地址、金融、稅務、身分、醫療、兒少、照護、門禁、法律內容、銷毀證據或私人參與者資料。請改寫成受保護來源、流程或證據索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[10] === status).length })).filter((item) => item.count > 0);
      return `${values.review.trim()}｜家庭紀錄保存與銷毀決策紀錄\n盤點情境：${values.context}\n來源地圖基準：${formatter.format(baselineDate)}\n本次保存決策檢視：${formatter.format(reviewDate)}\n下一次規則或來源核點：${formatter.format(nextReview)}\n仍開放的來源、事件、檢查或動作：${openRows.length} 筆\n已結束本版的保存、處分、移交或不適用：${closedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n控制中的主管機關、發行者、契約、保單、暫停處分與處理流程來源：${values.basis.trim()}\n\n${lines("有版本的家庭紀錄保存決策", recordRows.map((row) => `${row.parts[0]}｜紀錄類別／用途：${row.parts[1]}｜來源核對日：${formatter.format(strictIsoDate(row.parts[2]) as Date)}｜控制來源／規則／範圍：${row.parts[3]}｜來源定義的起算／結束事件：${row.parts[4]}｜目前用途／例外／暫停處分檢查：${row.parts[5]}｜受保護原件／目前版本：${row.parts[6]}｜預定／已觀察動作與證據：${row.parts[7]}｜負責角色：${row.parts[8]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[9]) as Date)}｜狀態：${row.parts[10]}`))}\n\n受保護原件、核准與決策證據位置：${values.storage.trim()}\n\n這份輸出只是家庭決策索引，不是保存期限表或銷毀指令。它不計算或延長外部期限，不判定法律、稅務、保固、保單、契約、理賠、法院、福利、勞動、身分、醫療或紀錄義務，不開啟、閱讀、分類、上傳、複製、遮蔽、封存、移交、碎紙、清除、銷毀、保存或移除紀錄，不檢查瀏覽器、裝置、同步資料夾、雲端服務、Email、下載、備份或收件人，不授權某人、不解除暫停處分、不證明所有副本消失，也不能讓破壞性動作復原。請分開保護原件與核准證據，並以目前負責來源及合格專業意見處理真實決定。`;
    },
  },
  "household-insurance-policy-source-version-log": {
    intro:
      "逐筆記錄承保公司證據、發行文件組、條款與批單關係、存取觀察、目前狀態及申訴來源。工具不驗證保險、不解讀保障，也不計算期限。",
    fields: [
      text("review", "家庭私人保單來源核對代號", "使用家庭內部代號，不要輸入姓名、地址、保單、理賠、帳號或精確受保護位置。", "INS-SOURCE-2026-A"),
      {
        name: "context",
        label: "保單文件核對情境",
        type: "select",
        options: [
          "第一次家庭保單盤點",
          "新契約或續保文件組",
          "收到附約、批單、批註或其他變更",
          "家庭備援取用或交接",
          "疑似缺少發行文件",
          "停效、復效、終止或不續保通知",
          "理賠或申訴準備",
          "承保公司完整名稱或來源研究",
          "保單替換、結束或封存",
        ],
      },
      { name: "baselineDate", label: "保單清單與來源地圖基準日", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: "本次保單來源核對日", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "下一次來源或狀態核點", type: "date", value: "2026-09-14" },
      text("basis", "保險公司、保險局、評議與受保護發行文件來源地圖", "使用安全來源／證據代號或有日期的公開網址；完整識別、帳戶頁、通知、理賠與通信留在受保護位置。", "INSURER-SERVICE-S2；IB-GOV-D1；FOI-O1；ISSUED-SET-A2 受保護"),
      {
        name: "records",
        label: "有版本的家庭保單來源與文件關係列",
        type: "textarea",
        help: "每行：ID｜安全保險用途與家庭角色｜承保公司完整名稱證據狀態｜來源核對日 YYYY-MM-DD｜發行文件組與版本或保險期間線索｜保單面頁、保險證、條款、附約、批單或批註關係｜目前存取與受保護原件觀察｜續保、替換、停效、復效、終止、不續保、理賠或申訴來源與差異｜負責角色｜目標或結果日期 YYYY-MM-DD｜十一種指定狀態之一。最多 14 行。",
        value: "HOME-1 | 自住房屋財產保險文件；家庭保單管理角色 | 示例承保公司完整名稱已在受保護發行面頁觀察；證據 INS-LEGAL-A2 | 2026-08-24 | 保險公司發行面頁組 INS-DOC-A2；期間與條款版次線索已留在受保護檢視 | 面頁列出主條款與兩份批單；三份文件關係均已記錄 | 受保護面頁、主條款及兩份批單已開啟；標題可見 | 已觀察保險公司發行的續保面頁；保險公司申訴與保險局／評議來源已映射；本次有日期檢視未觀察到來源差異 | 家庭保單管理角色 | 2026-08-24 | 已核對發行來源、文件關係、存取與狀態入口\nPRIOR-1 | 已替換家庭責任保險；封存與未結用途檢查 | 舊承保公司完整名稱已在受保護面頁觀察；證據 INS-LEGAL-B1 | 2026-08-23 | 舊發行文件組 INS-DOC-B1 與替換指標 INS-DOC-B2；替換線索已記錄 | 舊面頁列出一份批單，但受保護文件組目前缺少該文件 | 舊面頁已開啟；缺少列出的批單，因此不能宣稱完整存取 | 替換通知來源已記錄；缺少批單交由原承保公司文件服務處理後再做封存決定 | 家庭保單管理角色 | 2026-09-14 | 疑似缺文件、狀態通知或條款衝突，等待保險公司或合格來源處理",
      },
      text("storage", "受保護保單、條款、批單、通知與核對歷程位置", "使用資料夾或流程代號；不要輸入姓名地址、完整識別、被保險人／受益人、財產、健康、保費保額、付款、憑證、理賠或通信。", "家庭紀錄／保單來源／INS-SOURCE-2026-A／受保護發行文件組"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.review.trim()) return "請輸入家庭私人保單來源核對代號，讓匯出版本可以辨認。";
      if (!baselineDate) return "請用 YYYY-MM-DD 輸入真實的保單清單與來源地圖基準日。";
      if (!reviewDate) return "請用 YYYY-MM-DD 輸入真實的本次保單來源核對日。";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "本次保單來源核對日不能晚於今天。";
      if (baselineDate.getTime() > reviewDate.getTime()) return "保單清單與來源地圖基準日不能晚於本次核對日。";
      if (!nextReview) return "請用 YYYY-MM-DD 輸入真實的下一次來源或狀態核點。";
      if (nextReview.getTime() < reviewDate.getTime()) return "下一次來源或狀態核點不能早於本次保單來源核對日。";
      if (values.basis.trim().length < 12) return "請用安全索引指出保險公司、保險局、評議與受保護發行文件來源地圖。";
      if (!values.storage.trim()) return "請輸入受保護保單、條款、批單、通知與核對歷程位置。";
      const recordRows = values.records.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (recordRows.length === 0) return "請至少加入一筆保險用途與發行文件關係。";
      if (recordRows.length > 14) return "一個保單來源核對版本最多支援 14 行；請先凍結本版，再建立另一個範圍。";
      const invalidRows = recordRows.filter((row) => row.parts.length !== 11 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `保單來源第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整包含十一個以直線分隔的欄位。`;
      const ids = recordRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆保單來源列都需要不重複的 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "每個 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 HOME-1 或 PRIOR-A。";
      const statusOrder = [
        "已記錄保險用途，等待發行保單來源",
        "已記錄發行來源，等待承保公司完整名稱",
        "已記錄承保公司，等待目前文件組",
        "已找到文件組，等待核對條款與批單關係",
        "已辨認附約、批單或批註，等待版本比較",
        "已比較版本，等待目前存取測試",
        "已測試存取，等待狀態與申訴來源",
        "疑似缺文件、狀態通知或條款衝突，等待保險公司或合格來源處理",
        "已核對發行來源、文件關係、存取與狀態入口",
        "保單已終止或替換，記錄保管與未結用途",
        "不適用，記錄理由與重新打開條件",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = recordRows.filter((row) => !statuses.has(row.parts[10]));
      if (invalidStatuses.length)
        return `保單來源第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用欄位說明中的十一種證據狀態之一。`;
      const invalidSourceDates = recordRows.filter((row) => {
        const sourceDate = strictIsoDate(row.parts[3]);
        return !sourceDate || sourceDate.getTime() < baselineDate.getTime() || sourceDate.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return `保單來源第 ${invalidSourceDates.map((row) => row.line).join("、")} 行，需要介於基準日與本次核對日之間的真實來源核對日。`;
      const openRows = recordRows.filter((row) => statusOrder.slice(0, 8).includes(row.parts[10]));
      const closedRows = recordRows.filter((row) => statusOrder.slice(8).includes(row.parts[10]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[9]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的保單來源第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標日必須從本次核對日起，到下一次來源或狀態核點為止。`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[9]);
        return !outcome || outcome.getTime() < baselineDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已核對、終止或不適用的保單來源第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於基準日與本次核對日之間的實際結果日期。`;
      const missingLayers = recordRows.filter((row) => row.parts[1].length < 6 || row.parts[2].length < 6 || row.parts[4].length < 8 || row.parts[5].length < 8 || row.parts[6].length < 6 || row.parts[7].length < 8 || row.parts[8].length < 3);
      if (missingLayers.length)
        return `保單來源第 ${missingLayers.map((row) => row.line).join("、")} 行需要真實用途、承保公司證據、發行文件組、條款／批單關係、存取觀察、狀態／申訴來源與負責角色。`;
      const completedWithoutEvidence = recordRows.filter((row) => row.parts[10] === statusOrder[8] && (!/(?:保險公司|承保|發行)/.test([row.parts[2], row.parts[4]].join(" ")) || !/(?:面頁|保險證|條款|契約|附約|批單|批註)/.test(row.parts[5]) || !/(?:開啟|存取|可見|取用)/.test(row.parts[6]) || !/(?:續保|替換|停效|復效|終止|不續保|狀態|申訴|保險局|評議|保險公司)/.test(row.parts[7]) || /(?:等待|未知|未解|缺少|找不到|未查|未開啟|衝突)/.test([row.parts[4], row.parts[5], row.parts[6], row.parts[7]].join(" "))));
      if (completedWithoutEvidence.length)
        return `已完成保單來源核對第 ${completedWithoutEvidence.map((row) => row.line).join("、")} 行必須連結可歸屬承保公司證據、發行文件關係、實際存取及目前狀態／申訴入口，且不能仍有未解缺口。`;
      const earlyRowsClaimingCompletion = recordRows.filter((row) => statusOrder.slice(0, 7).includes(row.parts[10]) && /(?:完全驗證|保單有效|保障已確認|文件完整確認|持續有效確認)/.test([row.parts[2], row.parts[4], row.parts[5], row.parts[6], row.parts[7]].join(" ")));
      if (earlyRowsClaimingCompletion.length)
        return `仍開放的保單來源第 ${earlyRowsClaimingCompletion.map((row) => row.line).join("、")} 行不能宣稱完全驗證、保單有效、保障確認、文件完整或持續有效。`;
      const conflictWithoutResponsibleRoute = recordRows.filter((row) => row.parts[10] === statusOrder[7] && (!/(?:缺少|缺件|衝突|差異|矛盾|停效|終止|不續保|狀態通知|條款)/.test([row.parts[5], row.parts[7]].join(" ")) || !/(?:承保公司|保險公司|保險局|評議|主管機關|合格|律師|專業|負責來源)/.test([row.parts[7], row.parts[8]].join(" "))));
      if (conflictWithoutResponsibleRoute.length)
        return `文件或狀態衝突第 ${conflictWithoutResponsibleRoute.map((row) => row.line).join("、")} 行必須記錄缺件、通知或條款差異，以及負責保險公司、主管機關、評議或合格專業路徑。`;
      const endedWithoutCustody = recordRows.filter((row) => row.parts[10] === statusOrder[9] && (!/(?:終止|替換|停效|不續保|到期|失效)/.test([row.parts[4], row.parts[7]].join(" ")) || !/(?:保管|封存|受保護|保存|理賠|爭議|申訴|稅務|房屋|貸款|法律|剩餘用途|未結用途)/.test([row.parts[6], row.parts[7]].join(" "))));
      if (endedWithoutCustody.length)
        return `保單終止或替換第 ${endedWithoutCustody.map((row) => row.line).join("、")} 行必須記錄可歸屬狀態事件、受保護保管，以及剩餘或已檢查的用途。`;
      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[10] === statusOrder[10] && !/(?:重新打開|重新檢視|若|如果|當|之後|新保單|新保障用途|家庭變化|財產變化|角色改變|購買|搬家)/.test([row.parts[5], row.parts[6], row.parts[7]].join(" ")));
      if (notApplicableWithoutTrigger.length)
        return `不適用第 ${notApplicableWithoutTrigger.map((row) => row.line).join("、")} 行必須寫目前理由，以及重新打開這個保險用途的事件。`;
      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email、保單、理賠、帳號、車輛、付款或其他完整數字識別。請留在受保護原件，只在這裡放安全索引。";
      if (/密碼|通關密語|存取碼|復原碼|驗證碼|私鑰|助記詞|完整帳號|帳號號碼|完整保單號碼|保單號碼|完整理賠編號|理賠編號|案件編號|契約編號|卡號|銀行帳戶|身分證|護照號碼|駕照號碼|完整地址|完整門牌|完整姓名|要保人姓名|被保險人姓名|受益人姓名|出生日期|簽名|健康紀錄|醫療紀錄|診斷|處方|車身識別號碼|車牌號碼|完整車號|保費金額|保額|自負額金額|付款憑證|登入憑證|私人通信內容|理賠內容|申訴內容|API 金鑰|password|passphrase|passcode|access code|recovery code|verification code|account number|policy number|claim number|full address|full name|policyholder name|insured person name|beneficiary name|date of birth|vehicle identification number|\bvin\b|license plate|private correspondence contents|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、地址、身分、保單、理賠、被保險人、受益人、健康、車輛、財務、簽名或私人通信資料。請改寫成受保護來源、文件或證據索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[10] === status).length })).filter((item) => item.count > 0);
      return `${values.review.trim()}｜家庭保單來源與版本核對紀錄\n核對情境：${values.context}\n保單清單／來源地圖基準：${formatter.format(baselineDate)}\n本次保單來源核對：${formatter.format(reviewDate)}\n下一次來源或狀態核點：${formatter.format(nextReview)}\n仍開放的來源、公司、文件、版本、存取或狀態列：${openRows.length} 筆\n已核對、終止或不適用列：${closedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n保險公司、保險局、評議與受保護發行文件來源地圖：${values.basis.trim()}\n\n${lines("有版本的家庭保單來源證據", recordRows.map((row) => `${row.parts[0]}｜保險用途／家庭角色：${row.parts[1]}｜承保公司證據：${row.parts[2]}｜來源核對日：${formatter.format(strictIsoDate(row.parts[3]) as Date)}｜發行文件組／版本／期間線索：${row.parts[4]}｜面頁／條款／批單關係：${row.parts[5]}｜存取／受保護原件：${row.parts[6]}｜狀態／理賠／申訴來源與差異：${row.parts[7]}｜負責角色：${row.parts[8]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[9]) as Date)}｜狀態：${row.parts[10]}`))}\n\n受保護保單、條款、批單、通知與核對歷程位置：${values.storage.trim()}\n\n這份輸出只是家庭來源索引，不證明投保、保障、付款、效力或理賠結果。它不搜尋、驗證、投保、承保、續保、替換、停效、復效、終止或變更保險，不登入入口，不辨識個人、保險公司、業務員、保單、理賠或財產，不閱讀、比較或解讀條款、除外、保額、自負額、受益人、義務、通知與權利，不計算保費、理賠、申訴、評議或法律期限，不聯絡保險公司、保險局或評議機構，不送出申請、理賠或申訴，也不提供保險、財務或法律意見。請使用實際發行文件、目前保險公司、適用主管／爭議來源與合格專業意見。`;
    },
  },
  "appliance-manual-source-check-log": {
    intro:
      "逐筆記錄完整型號證據、目前製造商或主管來源、文件角色、自述適用範圍、存取結果，以及獨立的召回／安全公告查核。工具不搜尋或驗證說明書、召回與設備。",
    fields: [
      text("review", "家庭私人說明書來源核對代號", "使用家庭內部代號，不要輸入姓名、地址、帳號、完整序號、產品登錄、服務案件或精確受保護位置。", "MANUAL-2026-A"),
      {
        name: "context",
        label: "說明書來源核對情境",
        type: "select",
        options: [
          "第一次家庭家電盤點",
          "新購、交付或安裝",
          "建立家電保養紀錄",
          "故障、錯誤或說明追蹤",
          "召回、勘誤或安全查核",
          "製造商或支援來源轉移",
          "家電退役、移交或交接",
        ],
      },
      { name: "baselineDate", label: "家電與來源地圖基準日", type: "date", value: "2026-08-20" },
      { name: "reviewDate", label: "本次說明書來源核對日", type: "date", value: "2026-08-24" },
      { name: "nextReview", label: "下一次來源或存取核點", type: "date", value: "2026-09-14" },
      text("basis", "製造商支援、主管機關、召回與受保護證據來源地圖", "使用安全來源／版本代號或有日期的公開網址；完整銘牌、序號、登錄、發票、服務通信與憑證放受保護位置。", "MFR-SUPPORT-M2；BSMI-SAFETY-R1；LABEL-EVIDENCE-L2 受保護；MANUAL-ARCHIVE-A1"),
      {
        name: "records",
        label: "有版本的家電說明書來源與存取列",
        type: "textarea",
        help: "每行：ID｜安全物品、家庭用途與品牌｜完整型號證據狀態｜來源核對日 YYYY-MM-DD｜官方來源、文件角色、語言與版本線索｜文件自述的機型、尾碼、地區或規格範圍｜目前開啟測試與受保護離線副本狀態｜召回或安全公告來源與差異｜負責角色｜目標或結果日期 YYYY-MM-DD｜十一種指定狀態之一。最多 14 行。",
        value: "FRIDGE-1 | 廚房冰箱日常操作與濾網來源；示例品牌 | 完整型號已安全觀察；完整銘牌與序號證據留在 LABEL-L2 | 2026-08-24 | 製造商官方產品支援頁 SUPPORT-M2；使用說明；繁體中文；文件代號 OM-2026-07 | 文件列出 EXAMPLE-X1 與 X2；家庭 X1 尾碼已在受保護流程比對 | 產品頁與使用說明已開啟；標題與適用範圍可見；離線副本代號 MANUAL-A1 | 標檢局商品召回與製造商安全公告於 2026-08-24 查核；本次有日期檢視未觀察到差異 | 家庭家電紀錄負責角色 | 2026-08-24 | 已核對來源、範圍、存取與公告入口\nLEGACY-1 | 舊洗衣設備需要操作與安全服務來源；示例品牌 | 完整型號已安全觀察；完整銘牌證據留在 LABEL-L4 | 2026-08-23 | 已查目前製造商與品牌繼受支援路徑；尚未找到可歸屬使用說明 | 適用範圍未解；第三方檔案只保留為未驗證線索 | 未驗證線索另行開啟；沒有宣稱存在官方離線副本 | 標檢局商品安全入口於 2026-08-23 依品牌與型號查核；產製範圍比對仍在受保護流程等待處理 | 家庭家電紀錄負責角色 | 2026-09-14 | 官方來源找不到，等待製造商或授權路徑",
      },
      text("storage", "受保護銘牌、完整手冊、離線副本與核對歷程位置", "使用資料夾或流程代號，不要輸入完整序號、地址、帳號、登錄、發票、服務案件、私人通信、憑證或檔案內容。", "家庭物品／說明書來源／MANUAL-2026-A／受保護證據"),
    ],
    run: (values) => {
      const baselineDate = strictIsoDate(values.baselineDate);
      const reviewDate = strictIsoDate(values.reviewDate);
      const nextReview = strictIsoDate(values.nextReview);
      if (!values.review.trim()) return "請輸入家庭私人說明書來源核對代號，讓匯出版本可以辨認。";
      if (!baselineDate) return "請用 YYYY-MM-DD 輸入真實的家電與來源地圖基準日。";
      if (!reviewDate) return "請用 YYYY-MM-DD 輸入真實的本次說明書來源核對日。";
      const now = new Date();
      const today = strictIsoDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")) as Date;
      if (reviewDate.getTime() > today.getTime()) return "本次說明書來源核對日不能晚於今天。";
      if (baselineDate.getTime() > reviewDate.getTime()) return "家電與來源地圖基準日不能晚於本次核對日。";
      if (!nextReview) return "請用 YYYY-MM-DD 輸入真實的下一次來源或存取核點。";
      if (nextReview.getTime() < reviewDate.getTime()) return "下一次來源或存取核點不能早於本次核對日。";
      if (values.basis.trim().length < 12) return "請用安全索引指出製造商支援、主管機關、召回與受保護證據來源地圖。";
      if (!values.storage.trim()) return "請輸入受保護銘牌、完整手冊、離線副本與核對歷程位置。";
      const recordRows = values.records.split("\n").map((raw, index) => ({
        line: index + 1,
        parts: raw.split("|").map((part) => part.trim()),
      })).filter((row) => row.parts.some(Boolean));
      if (recordRows.length === 0) return "請至少加入一筆家電與文件用途。";
      if (recordRows.length > 14) return "一個說明書來源核對版本最多支援 14 行；請先凍結本版，再建立另一個範圍。";
      const invalidRows = recordRows.filter((row) => row.parts.length !== 11 || row.parts.some((part) => !part));
      if (invalidRows.length)
        return `說明書來源第 ${invalidRows.map((row) => row.line).join("、")} 行必須完整包含十一個以直線分隔的欄位。`;
      const ids = recordRows.map((row) => row.parts[0].toLocaleUpperCase("en"));
      if (new Set(ids).size !== ids.length) return "每筆說明書來源列都需要不重複的 ID。";
      if (ids.some((id) => !/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(id)))
        return "每個 ID 請使用 2 到 20 個英文字母、數字或連字號，例如 FRIDGE-1 或 HVAC-MANUAL。";
      const statusOrder = [
        "已記錄物品，等待完整型號證據",
        "已記錄完整型號，等待官方支援來源",
        "已找到官方來源，等待文件身分",
        "已辨認文件，等待核對自述機型範圍",
        "已比對適用範圍，等待目前存取測試",
        "已測試存取，等待召回與安全來源",
        "官方來源找不到，等待製造商或授權路徑",
        "安全公告、召回或指示衝突，等待負責來源處理",
        "已核對來源、範圍、存取與公告入口",
        "家電已退役或移交，記錄手冊保管與剩餘用途",
        "不適用，記錄理由與重新打開條件",
      ];
      const statuses = new Set(statusOrder);
      const invalidStatuses = recordRows.filter((row) => !statuses.has(row.parts[10]));
      if (invalidStatuses.length)
        return `說明書來源第 ${invalidStatuses.map((row) => row.line).join("、")} 行必須使用欄位說明中的十一種證據狀態之一。`;
      const invalidSourceDates = recordRows.filter((row) => {
        const sourceDate = strictIsoDate(row.parts[3]);
        return !sourceDate || sourceDate.getTime() < baselineDate.getTime() || sourceDate.getTime() > reviewDate.getTime();
      });
      if (invalidSourceDates.length)
        return `說明書來源第 ${invalidSourceDates.map((row) => row.line).join("、")} 行，需要介於基準日與本次核對日之間的真實來源核對日。`;
      const openRows = recordRows.filter((row) => statusOrder.slice(0, 8).includes(row.parts[10]));
      const closedRows = recordRows.filter((row) => statusOrder.slice(8).includes(row.parts[10]));
      const invalidOpenDates = openRows.filter((row) => {
        const target = strictIsoDate(row.parts[9]);
        return !target || target.getTime() < reviewDate.getTime() || target.getTime() > nextReview.getTime();
      });
      if (invalidOpenDates.length)
        return `仍開放的說明書來源第 ${invalidOpenDates.map((row) => row.line).join("、")} 行，目標日必須從本次核對日起，到下一次來源或存取核點為止。`;
      const invalidClosedDates = closedRows.filter((row) => {
        const outcome = strictIsoDate(row.parts[9]);
        return !outcome || outcome.getTime() < baselineDate.getTime() || outcome.getTime() > reviewDate.getTime();
      });
      if (invalidClosedDates.length)
        return `已結束本版的說明書來源第 ${invalidClosedDates.map((row) => row.line).join("、")} 行，需要介於基準日與本次核對日之間的實際結果日期。`;
      const missingLayers = recordRows.filter((row) => row.parts[1].length < 6 || row.parts[2].length < 6 || row.parts[4].length < 8 || row.parts[5].length < 6 || row.parts[6].length < 6 || row.parts[7].length < 8 || row.parts[8].length < 3);
      if (missingLayers.length)
        return `說明書來源第 ${missingLayers.map((row) => row.line).join("、")} 行需要真實物品用途、型號證據、來源／文件身分、自述範圍、存取結果、獨立公告查核與負責角色。`;
      const completedWithoutEvidence = recordRows.filter((row) => row.parts[10] === statusOrder[8] && (!/(?:製造商|官方|主管機關|標檢局|支援)/.test(row.parts[4]) || /(?:等待|未知|未解|未查|未開啟|尚未)/.test([row.parts[5], row.parts[6], row.parts[7]].join(" ")) || !/(?:開啟|載入|可見|存取)/.test(row.parts[6]) || !/(?:召回|安全|公告|標檢局|主管機關)/.test(row.parts[7])));
      if (completedWithoutEvidence.length)
        return `已完成來源核對第 ${completedWithoutEvidence.map((row) => row.line).join("、")} 行必須連結可歸屬來源、文件自述範圍、實際存取及獨立召回／安全入口，且不能仍有未解狀態。`;
      const unavailableClaimingVerification = recordRows.filter((row) => row.parts[10] === statusOrder[6] && /(?:已驗證|已確認官方|完全適用|完整完成)/.test([row.parts[4], row.parts[5], row.parts[6]].join(" ")));
      if (unavailableClaimingVerification.length)
        return `官方來源找不到第 ${unavailableClaimingVerification.map((row) => row.line).join("、")} 行不能宣稱第三方線索已驗證、已確認官方、完全適用或完整完成。`;
      const conflictWithoutResponsibleRoute = recordRows.filter((row) => row.parts[10] === statusOrder[7] && (!/(?:召回|公告|警告|停止|衝突|矛盾|勘誤)/.test(row.parts[7]) || !/(?:製造商|主管機關|標檢局|合格|授權|負責|支援)/.test([row.parts[4], row.parts[7], row.parts[8]].join(" "))));
      if (conflictWithoutResponsibleRoute.length)
        return `安全衝突第 ${conflictWithoutResponsibleRoute.map((row) => row.line).join("、")} 行必須記錄觀察到的公告或矛盾，以及負責製造商、主管機關或合格服務路徑。`;
      const retiredWithoutCustody = recordRows.filter((row) => row.parts[10] === statusOrder[9] && !/(?:退役|移交|交接|保管|封存|剩餘用途|下一負責)/.test([row.parts[1], row.parts[6], row.parts[7]].join(" ")));
      if (retiredWithoutCustody.length)
        return `家電退役或移交第 ${retiredWithoutCustody.map((row) => row.line).join("、")} 行必須記錄物品狀態變更、手冊保管與剩餘用途，且不能暴露私人證據。`;
      const notApplicableWithoutTrigger = recordRows.filter((row) => row.parts[10] === statusOrder[10] && !/(?:重新打開|重新檢視|若|如果|當|之後|新家電|新文件|安裝|移交|角色改變)/.test([row.parts[5], row.parts[6], row.parts[7]].join(" ")));
      if (notApplicableWithoutTrigger.length)
        return `不適用第 ${notApplicableWithoutTrigger.map((row) => row.line).join("、")} 行必須寫目前理由，以及重新打開這個文件角色的事件。`;
      const privacyText = [values.review, values.basis, values.records, values.storage].join("\n");
      const withoutDates = privacyText.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutDates) || /(?:\d[\s().+-]*){7,}/.test(withoutDates))
        return "偵測到可能的完整電話、Email、地址、帳號、登錄、序號、服務案件或完整數字識別。請留在受保護原件，只在這裡放安全證據索引。";
      if (/密碼|通關密語|Wi-Fi 密碼|網路金鑰|復原碼|驗證碼|產品登錄 token|登錄權杖|帳號|客戶編號|完整序號|序號\s*[:：=]|產製碼\s*[:：=]|完整地址|完整門牌|服務案件|維修案件|發票內容|收據內容|私人通信|登入憑證|API 金鑰|完整姓名|客戶姓名|住戶姓名|精確位置|銘牌照片內容|手冊檔案內容|信用卡|銀行帳戶|簽名|出生日期|password|passphrase|passcode|access code|wifi password|network key|recovery code|verification code|registration token|account number|full serial|serial number\s*[:=]|production code\s*[:=]|full address|service case|invoice contents|private message|login credential|api key|full name|\bpin\s*[:：=]/i.test(privacyText))
        return "偵測到可能的憑證、地址、帳號、完整序號、產品登錄、服務案件、發票、私人參與者或受保護檔案資料。請改寫成安全來源、流程或證據索引。";
      const formatter = new Intl.DateTimeFormat("zh-TW", { dateStyle: "long" });
      const statusCounts = statusOrder.map((status) => ({ status, count: recordRows.filter((row) => row.parts[10] === status).length })).filter((item) => item.count > 0);
      return `${values.review.trim()}｜家電說明書來源核對紀錄\n核對情境：${values.context}\n家電／來源地圖基準：${formatter.format(baselineDate)}\n本次說明書來源核對：${formatter.format(reviewDate)}\n下一次來源或存取核點：${formatter.format(nextReview)}\n仍開放的型號、來源、範圍、存取或安全列：${openRows.length} 筆\n已核對、退役或不適用列：${closedRows.length} 筆\n狀態統計：${statusCounts.map((item) => `${item.status} ${item.count} 筆`).join("、")}\n\n製造商支援、主管機關、召回與受保護證據來源地圖：${values.basis.trim()}\n\n${lines("有版本的家電說明書來源證據", recordRows.map((row) => `${row.parts[0]}｜物品／用途／品牌：${row.parts[1]}｜完整型號證據：${row.parts[2]}｜來源核對日：${formatter.format(strictIsoDate(row.parts[3]) as Date)}｜來源／文件／語言／版本：${row.parts[4]}｜文件自述範圍：${row.parts[5]}｜存取／離線副本：${row.parts[6]}｜召回／安全入口與差異：${row.parts[7]}｜負責角色：${row.parts[8]}｜目標／結果日期：${formatter.format(strictIsoDate(row.parts[9]) as Date)}｜狀態：${row.parts[10]}`))}\n\n受保護銘牌、完整手冊、離線副本與核對歷程位置：${values.storage.trim()}\n\n這份輸出只是家庭來源索引，不是操作、安裝、保養、維修或安全指令。它不辨識、移動、拆開、斷開或檢查設備，不造訪網址，不搜尋、開啟、下載、上傳、複製、雜湊、比較、更新或保存文件，不讀取銘牌，不驗證製造商、型號、序號、產製範圍、規格、地區、語言、零件、配件、公告、召回、補救或相容性，不聯絡支援、不授權工作、不解除停止使用指示，也不認證安全或結案。真實產品請使用目前製造商、負責安全主管機關、召回公告與合格服務來源。`;
    },
  },
};

const interfaceCopy: Record<
  Locale,
  {
    unavailable: string;
    tag: string;
    usePrefix: string;
    privacy: string;
    generate: string;
    reset: string;
    print: string;
    copy: string;
    download: string;
    save: string;
    copied: string;
    downloaded: string;
    saved: string;
  }
> = {
  en: {
    unavailable:
      "This tool is unavailable because its production logic has not been registered.",
    tag: "Private browser tool",
    usePrefix: "Use the",
    privacy:
      "Your entries stay in this browser and are not sent to FamilyBoard.",
    generate: "Generate result",
    reset: "Reset",
    print: "Print result",
    copy: "Copy result",
    download: "Download result",
    save: "Save for app",
    copied: "Copied to clipboard.",
    downloaded: "Downloaded as a text file.",
    saved: "Saved locally for your FamilyBoard app.",
  },
  "zh-TW": {
    unavailable: "這項工具尚未登錄可上線的計算邏輯，因此目前無法使用。",
    tag: "資料留在瀏覽器的免費工具",
    usePrefix: "使用",
    privacy: "你的輸入只在目前瀏覽器運算，不會傳送給 FamilyBoard。",
    generate: "產生結果",
    reset: "清除重填",
    print: "列印結果",
    copy: "複製結果",
    download: "下載結果",
    save: "儲存至 App",
    copied: "已複製到剪貼簿。",
    downloaded: "已下載文字檔。",
    saved: "已儲存到目前瀏覽器的 FamilyBoard App。",
  },
};

export default function ToolWorkbench({
  slug,
  title,
  locale = "en",
}: {
  slug: string;
  title: string;
  locale?: Locale;
}) {
  const definition =
    (locale === "zh-TW" ? zhTwDefinitions[slug] : undefined) ||
    definitions[slug];
  const copy = interfaceCopy[locale];
  const initial = useMemo(
    () =>
      Object.fromEntries(
        (definition?.fields || []).map((field) => [
          field.name,
          field.value || field.options?.[0] || "",
        ]),
      ),
    [definition],
  );
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("");
  if (!definition)
    return (
      <section className="tool-shell">
        <p className="notice">{copy.unavailable}</p>
      </section>
    );
  const run = () => {
    setResult(definition.run(values));
    window.dispatchEvent(
      new CustomEvent("familyboard:tool-completed", { detail: { slug } }),
    );
  };
  return (
    <section className="tool-shell" aria-labelledby="tool-heading">
      <span className="card-tag">{copy.tag}</span>
      <h2 id="tool-heading">
        {copy.usePrefix} {title.replace(/^Free /, "").replace(/\s*[|｜].*$/, "")}
      </h2>
      <p>{definition.intro}</p>
      <div className="notice">{copy.privacy}</div>
      <form
        className="tool-form"
        onSubmit={(event) => {
          event.preventDefault();
          run();
        }}
      >
        <div className="form-grid">
          {definition.fields.map((field) => (
            <label key={field.name}>
              {field.label}
              {field.type === "select" ? (
                <select
                  value={values[field.name]}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                >
                  {field.options?.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={values[field.name]}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                />
              ) : (
                <input
                  type={field.type || "text"}
                  value={values[field.name]}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                />
              )}
              {field.help && <span className="help">{field.help}</span>}
            </label>
          ))}
        </div>
        <div>
          <button type="submit">{copy.generate}</button>{" "}
          <button
            className="secondary"
            type="button"
            onClick={() => {
              setValues(initial);
              setResult("");
            }}
          >
            {copy.reset}
          </button>
        </div>
      </form>
      <div className="result" aria-live="polite">
        {result}
      </div>
      {result && (
        <div className="no-print app-actions" style={{ marginTop: "1rem" }}>
          <button className="secondary" onClick={() => window.print()}>
            {copy.print}
          </button>
          <button
            className="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(result);
              setStatus(copy.copied);
            }}
          >
            {copy.copy}
          </button>
          <button
            className="secondary"
            onClick={() => {
              const href = URL.createObjectURL(
                new Blob([result], { type: "text/plain" }),
              );
              const anchor = document.createElement("a");
              anchor.href = href;
              anchor.download = `${slug}-result.txt`;
              anchor.click();
              URL.revokeObjectURL(href);
              setStatus(copy.downloaded);
            }}
          >
            {copy.download}
          </button>
          <button
            className="secondary"
            onClick={() => {
              const key = "familyboard:tool-inbox";
              const current = JSON.parse(localStorage.getItem(key) || "[]");
              current.push({
                slug,
                title,
                result,
                savedAt: new Date().toISOString(),
              });
              localStorage.setItem(key, JSON.stringify(current.slice(-20)));
              setStatus(copy.saved);
            }}
          >
            {copy.save}
          </button>
        </div>
      )}
      {status && (
        <p role="status" className="app-success">
          {status}
        </p>
      )}
    </section>
  );
}
