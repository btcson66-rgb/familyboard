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
};

const zhTwDefinitions: Record<string, Definition> = {
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
