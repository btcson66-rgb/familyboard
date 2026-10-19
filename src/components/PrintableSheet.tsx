import { useMemo } from "react";

const movingTasks = [
  ["6–8 weeks", "Confirm move date, key collection and handover"],
  ["6–8 weeks", "Check notice requirements and building access"],
  ["6–8 weeks", "Confirm transport, scope and arrival contacts"],
  ["6–8 weeks", "Start room inventory and label boxes"],
  ["2–4 weeks", "Confirm utility and internet stop/start dates"],
  ["2–4 weeks", "Arrange relevant address changes"],
  ["2–4 weeks", "Pack nonessentials; separate important documents"],
  ["2–4 weeks", "Arrange care for pets or children if needed"],
  ["Final week", "Reconfirm access, arrival times and keys"],
  ["Final week", "Pack medicines, chargers and first-night supplies"],
  ["Final week", "Label equipment parts and photograph connections"],
  ["Final week", "Export backup and keep a separate copy"],
  ["Moving day", "Photograph condition; note applicable meter readings"],
  ["Moving day", "Check cupboards and count boxes"],
  ["Moving day", "Record returned keys and handover confirmation"],
  ["First week", "Confirm services and check arriving items"],
  ["First week", "Save appliance records and update contacts"],
  ["First week", "Check final bills and export updated backup"],
];

const columnsByRoute: Array<[RegExp, string[]]> = [
  [
    /printable-home-inventory-template/,
    [
      "Room / 房間",
      "Item / 品項",
      "Brand / model / 品牌／型號",
      "Serial number / 序號",
      "Purchase date / 購買日期",
      "Receipt / photo reference / 收據／照片索引",
      "Notes / 備註",
    ],
  ],
  [
    /inventory/,
    [
      "Room / area",
      "Item",
      "Brand / model",
      "Serial number",
      "Purchase / notes",
    ],
  ],
  [
    /warranty/,
    ["Item", "Purchase date", "Warranty term", "Expires", "Receipt / contact"],
  ],
  [
    /repair/,
    ["Date", "Item / area", "Problem", "Service / cost", "Outcome / next step"],
  ],
  [
    /service-provider/,
    ["Service", "Provider", "Phone / website", "Last used", "Notes"],
  ],
  [
    /contact/,
    ["Person / service", "Role", "Primary number", "Backup method", "Notes"],
  ],
  [
    /subscription/,
    ["Service", "Owner", "Billing cycle", "Next renewal", "Review action"],
  ],
  [/renewal/, ["Month", "Service / policy", "Owner", "Due date", "Action"]],
  [/chore/, ["Responsibility", "Owner", "Frequency", "Next turn", "Complete"]],
  [
    /cleaning/,
    ["Area", "Daily reset", "Weekly task", "Rotating deep task", "Owner"],
  ],
  [
    /handoff/,
    [
      "Responsibility",
      "Current status",
      "Next due",
      "Contact / location",
      "Notes",
    ],
  ],
  [
    /sitter/,
    ["Time / frequency", "Task", "Location / supply", "Contact", "Complete"],
  ],
  [
    /moving|new-home/,
    [
      "When / 時程",
      "Task / 工作",
      "Owner / 負責人",
      "Contact / account / 聯絡／帳戶",
      "Complete / 完成",
    ],
  ],
  [
    /emergency-binder/,
    ["Section", "What belongs here", "Location", "Last reviewed", "Complete"],
  ],
  [
    /maintenance|seasonal|monthly/,
    ["Area / asset", "Task", "Due / season", "Source / provider", "Complete"],
  ],
];

export default function PrintableSheet({
  route,
  title,
}: {
  route: string;
  title: string;
}) {
  const columns = useMemo(
    () =>
      columnsByRoute.find(([pattern]) => pattern.test(route))?.[1] || [
        "Item",
        "Details",
        "Owner",
        "Date",
        "Complete",
      ],
    [route],
  );
  const isMovingChecklist = route === "/checklists/printable-moving-checklist/";
  const rows = isMovingChecklist
    ? [...movingTasks.map(([when, task]) => [when, task, "", "", "☐"]),
      ...Array.from({ length: 3 }, () => columns.map(() => ""))]
    : Array.from({ length: 10 }, () => columns.map(() => ""));
  return (
    <section className={isMovingChecklist ? "printable moving-checklist" : "printable"} aria-labelledby="printable-heading">
      <div className="no-print">
        <span className="card-tag">Printable worksheet</span>
        <h2 id="printable-heading">Make a clean paper or PDF copy</h2>
        <p>
          Print this page or choose “Save as PDF.” Add only the details that are
          safe for the place where you will keep the copy.
        </p>
        <button onClick={() => window.print()}>Print this worksheet</button>
      </div>
      <h2>{title.replace(/ \|.*$/, "")}</h2>
      <p>
        Household: ____________________ &nbsp; Review date: ____________________
      </p>
      {isMovingChecklist && <p>Move date: ____________________ · Adapt this suggested timeline to your agreements. Keep passwords and access codes off shared copies.</p>}
      <div className="printable-table" tabIndex={0} role="region" aria-label="Printable worksheet columns">
        <table>
          {isMovingChecklist && <colgroup><col style={{ width: "15%" }} /><col style={{ width: "37%" }} /><col style={{ width: "13%" }} /><col style={{ width: "25%" }} /><col style={{ width: "10%" }} /></colgroup>}
          <thead>
            <tr>
              {columns.map((column) => (
                <th scope="col" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells, row) => (
              <tr key={row}>
                {columns.map((column, index) => (
                  <td key={column}>
                    {cells[index] || <>&nbsp;<br />&nbsp;</>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
