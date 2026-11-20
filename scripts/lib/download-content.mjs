// Content of the generated downloads. Kept apart from the file writers so the wording is easy to review.
import { buildDocx, buildXlsx, docx } from "./office-files.mjs";

export const inventoryColumns = [
  "Room",
  "Item",
  "Brand / model",
  "Serial number",
  "Purchase date",
  "Purchase price (USD)",
  "Replacement cost estimate (USD)",
  "Receipt / photo reference",
  "Notes",
];

const exampleRows = [
  ["Kitchen", "Refrigerator, French door", "Example Brand FD-26", "Ending 4821", "2024-03-12", 1450, 1600, "ITEM-001: receipt, label photo", "Retailer extended plan, ends 2027"],
  ["Kitchen", "Dishwasher", "ExampleCo D100", "Ending 7730", "2022-08-05", 620, 700, "ITEM-002: receipt, label photo", ""],
  ["Living room", "55-inch television", "Example Vision 55", "Ending 0192", "2023-11-24", 480, 450, "ITEM-003: order email, photo", "Replacement can be lower than what you paid"],
  ["Living room", "Sofa, three-seat, gray", "Model unknown", "Not available", "2021-05", 900, 1100, "ITEM-004: room photo", "Unknown fields stay blank"],
  ["Bedroom 1", "Laptop", "Example Book 14", "Ending 5568", "2025-01-15", 1100, 1100, "ITEM-005: receipt, label photo", ""],
  ["Garage", "Cordless drill and battery set", "ExampleTool DX", "Not available", "2020-06", 180, 210, "ITEM-006: photo of tools on shelf", "Small tools grouped in one row"],
];

const howTo = [
  "How to use this workbook",
  "1. Work one room at a time. Fill one row per item that would be costly to replace: appliances, electronics, furniture, tools, jewelry, instruments, collectibles.",
  "2. Give each item a short code (ITEM-001, ITEM-002) and use the same code in the file names of its receipt and photos. Put the code in the Receipt / photo reference column.",
  "3. Purchase price is what you paid. Replacement cost estimate is what a comparable new item costs today; it is your own estimate and not an appraisal.",
  "4. Leave a cell blank when you do not know the value. Do not guess serial numbers or dates.",
  "5. The two totals in K1:L2 add up columns F and G on the Inventory sheet (rows 2 to 1000).",
  "6. Save a copy outside the home (cloud storage, an external drive kept elsewhere, or a trusted relative) and re-save after you buy something significant.",
  "This file is a blank template from FamilyBoard. It does not send anything anywhere; what you type stays in your copy of the file.",
  "The Example sheet uses an invented household with made-up brands and prices. None of it is real.",
];

export function inventoryXlsx() {
  const widths = [16, 28, 24, 18, 14, 16, 20, 30, 34, 3, 28, 16];
  return buildXlsx([
    {
      name: "Inventory",
      widths,
      currencyCols: [5, 6],
      blankRows: 60,
      rows: [
        [...inventoryColumns, "", { text: "Total purchase price", style: 5 }, { formula: "SUM(F2:F1000)", style: 2 }],
        [...inventoryColumns.map(() => ""), "", { text: "Total replacement estimate", style: 5 }, { formula: "SUM(G2:G1000)", style: 2 }],
      ],
    },
    {
      name: "Example (invented household)",
      widths: widths.slice(0, 9),
      currencyCols: [5, 6],
      rows: [
        inventoryColumns,
        ...exampleRows,
        ["", { text: "This sheet is an invented household for illustration. The brands, prices and dates are made up.", style: 5 }],
      ],
    },
    { name: "How to use", widths: [120], header: false, freeze: false, rows: howTo.map((line, i) => [i === 0 ? { text: line, style: 5 } : line]) },
  ]);
}

export function inventoryCsv(rowCount = 20) {
  const escape = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [inventoryColumns, ...Array.from({ length: rowCount }, () => inventoryColumns.map(() => ""))];
  return Buffer.from(`\uFEFF${rows.map((row) => row.map(escape).join(",")).join("\n")}\n`, "utf8");
}

const secretsNote =
  "Do not write alarm codes, lockbox or safe combinations, door codes, banking details or passport numbers on this sheet. Give access details in person or through a method you trust, and write only that it was handled.";

export function houseSitterDocx() {
  const blank = (n) => Array.from({ length: n }, () => ["", "", ""]);
  const body = [
    docx.h1("House Sitter Instructions"),
    docx.note("A fill-in template from FamilyBoard (familyboard.win). Replace the blank cells with your own details, delete rows you do not need, then print it or share it. Keep it to what the sitter needs to run the house for these days."),
    docx.p(secretsNote, { bold: true }),
    docx.h2("The stay"),
    docx.table(
      [
        ["Sitter name", ""],
        ["Dates", "From:                          To:"],
        ["Time you will be back", ""],
        ["How to reach the owner", ""],
        ["When you are hard to reach", ""],
        ["Access (key, code, alarm)", "Handled:  in person  /  other secure method (do not write codes here)"],
      ],
      [3000, 7000],
      { header: false },
    ),
    docx.h2("Daily routine"),
    docx.table(
      [["When", "What to do", "Where things are / notes"], ["Morning", "", ""], ["Midday", "", ""], ["Evening", "", ""], ["Bedtime", "", ""], ...blank(2)],
      [1700, 4300, 4000],
      { rowHeight: 420 },
    ),
    docx.h2("The house"),
    docx.table(
      [
        ["Heat / air conditioning", "Thermostat setting and anything that should not be changed:"],
        ["Lights, blinds, doors", "Which lights are on and when, which doors to lock at night:"],
        ["Plants", "Which plants, how much water, how often (leave out any that should not be watered):"],
        ["Mail and packages", "Where to put them, what not to open:"],
        ["Trash and recycling", "Collection day, which bins, where they go:"],
        ["Off-limits areas or rules", "Guests, smoking, rooms that stay closed:"],
        ["Wi-Fi", "Network name (share the password in person or in a private message):"],
      ],
      [3000, 7000],
      { header: false, rowHeight: 480 },
    ),
    docx.h2("Pets"),
    docx.p("Keep one or two lines here. For a longer routine, use the separate pet sitter instructions template."),
    docx.table([["Pet", "Feeding, water, outings", "Anything to watch for"], ...blank(3)], [2000, 4500, 3500], { rowHeight: 480 }),
    docx.h2("Scheduled days and visitors"),
    docx.table([["Day", "Who is coming or what happens", "What the sitter should do"], ...blank(3)], [2000, 4500, 3500], { rowHeight: 480 }),
    docx.h2("If something looks wrong"),
    docx.table(
      [
        ["Smoke, fire, or a carbon monoxide alarm sounding", "Get everyone out of the house and call 911 from outside, then call the owner."],
        ["Water leak", "Location of the main water shut-off:"],
        ["Power outage", "Location of the breaker panel and flashlights:"],
        ["Someone at the door or a break-in", "What the sitter should do and who to call:"],
        ["Repairs", "The sitter may arrange repairs up to $________ without asking. Above that, call the owner first."],
      ],
      [3600, 6400],
      { header: false, rowHeight: 520 },
    ),
    docx.h2("Contacts"),
    docx.table(
      [
        ["Role", "Name", "Phone", "Notes"],
        ["Owner", "", "", ""],
        ["Backup who lives nearby", "", "", ""],
        ["Neighbor", "", "", ""],
        ["Plumber", "", "", ""],
        ["Electrician or heating / cooling", "", "", ""],
        ["Building manager or landlord", "", "", ""],
        ["Veterinarian (if pets)", "", "", ""],
      ].map((row) => row),
      [2800, 2400, 2000, 2800],
      { rowHeight: 400 },
    ),
    docx.note("This template is a planning aid. It does not screen a sitter and is not an agreement about pay, liability or damage. Check your home insurance wording for any conditions on an empty or sitter-occupied home."),
  ].join("");
  return buildDocx("House Sitter Instructions Template", body);
}

export function petSitterDocx() {
  const blank = (n, c) => Array.from({ length: n }, () => Array.from({ length: c }, () => ""));
  const body = [
    docx.h1("Pet Sitter Instructions"),
    docx.note("A fill-in template from FamilyBoard (familyboard.win). Write what you know from living with your animal as steps a stranger can follow: a quantity, a place, a time. Copy one pet profile section per animal."),
    docx.p(secretsNote, { bold: true }),
    docx.h2("The stay"),
    docx.table(
      [
        ["Sitter name", ""],
        ["Dates and times of visits", ""],
        ["How to reach the owner", ""],
        ["Backup contact who lives nearby", ""],
      ],
      [3000, 7000],
      { header: false },
    ),
    docx.h2("Pet profile"),
    docx.table(
      [
        ["Name", ""],
        ["Species, breed, age", ""],
        ["Temperament (people, other animals, strangers)", ""],
        ["Fears or triggers (storms, doors, the vacuum)", ""],
        ["Health conditions the sitter must know about", ""],
        ["Identification (collar tag, microchip registered with)", ""],
      ],
      [4000, 6000],
      { header: false, rowHeight: 420 },
    ),
    docx.h2("Feeding and water"),
    docx.table(
      [["Meal", "Time", "Food and amount", "Where it is kept / notes"], ["Morning", "", "", ""], ["Evening", "", "", ""], ["Treats", "", "", ""], ["Water", "", "", ""]],
      [1500, 1500, 3500, 3500],
      { rowHeight: 420 },
    ),
    docx.h2("Medications and supplements"),
    docx.table([["Name", "Dose and time", "How to give it", "Where it is kept"], ...blank(3, 4)], [2200, 2400, 2800, 2600], { rowHeight: 420 }),
    docx.h2("Walks, play, bathroom and litter"),
    docx.table(
      [
        ["Walks or outings", "How long, where, leash and harness location:"],
        ["Bathroom or litter", "Where, how often to clean, where waste goes:"],
        ["Play and enrichment", "Favorite toys, what to avoid:"],
        ["Crate, bed or sleeping place", ""],
        ["Grooming or other care", ""],
      ],
      [3000, 7000],
      { header: false, rowHeight: 480 },
    ),
    docx.h2("Safety rules"),
    docx.table(
      [
        ["Doors, gates, fences", "Escape risks and how to keep them shut:"],
        ["Never give", "Foods or items that are harmful to this animal:"],
        ["Other animals or visitors", "Who may and may not interact:"],
      ],
      [3000, 7000],
      { header: false, rowHeight: 480 },
    ),
    docx.h2("Veterinary care and emergencies"),
    docx.table(
      [
        ["Regular veterinarian", "Clinic name, phone, address:"],
        ["Emergency or after-hours clinic", "Name, phone, address:"],
        ["Pet poison hotline", "Phone number you have checked yourself:"],
        ["Approved spending", "The sitter may authorize treatment up to $________. Above that, call the owner first."],
        ["If the pet is missing", "Where to search first, who to call, microchip and tag details:"],
      ],
      [3400, 6600],
      { header: false, rowHeight: 520 },
    ),
    docx.h2("Where things are"),
    docx.table(
      [["Item", "Location"], ["Food", ""], ["Leash, harness, carrier", ""], ["Cleaning supplies, bags, litter", ""], ["Medication", ""], ["Vet records", ""]],
      [4000, 6000],
      { rowHeight: 380 },
    ),
    docx.note("This template is a planning aid, not veterinary advice. Ask your veterinarian about medication, diet and health questions. It does not screen a sitter and is not an agreement about pay or liability."),
  ].join("");
  return buildDocx("Pet Sitter Instructions Template", body);
}
