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
