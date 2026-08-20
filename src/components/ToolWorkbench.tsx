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

export default function ToolWorkbench({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const definition = definitions[slug];
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
        <p className="notice">
          This tool is unavailable because its production logic has not been
          registered.
        </p>
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
      <span className="card-tag">Private browser tool</span>
      <h2 id="tool-heading">
        Use the {title.replace(/^Free /, "").replace(/ \|.*$/, "")}
      </h2>
      <p>{definition.intro}</p>
      <div className="notice">
        Your entries stay in this browser and are not sent to FamilyBoard.
      </div>
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
          <button type="submit">Generate result</button>{" "}
          <button
            className="secondary"
            type="button"
            onClick={() => {
              setValues(initial);
              setResult("");
            }}
          >
            Reset
          </button>
        </div>
      </form>
      <div className="result" aria-live="polite">
        {result}
      </div>
      {result && (
        <div className="no-print app-actions" style={{ marginTop: "1rem" }}>
          <button className="secondary" onClick={() => window.print()}>
            Print result
          </button>
          <button
            className="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(result);
              setStatus("Copied to clipboard.");
            }}
          >
            Copy result
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
              setStatus("Downloaded as a text file.");
            }}
          >
            Download result
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
              setStatus("Saved locally for your FamilyBoard app.");
            }}
          >
            Save for app
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
