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
