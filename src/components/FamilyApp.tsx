import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import "./app.css";
import {
  addMonthsClamped,
  annualizedActiveTotalsByCurrency,
  localIsoDate,
  sortByOptionalIsoDate,
  warrantyReviewDate,
} from "../lib/calculations";
import {
  DB_SCHEMA_VERSION,
  base,
  baseSetting,
  clearDatabase,
  db,
  now,
  snapshot,
  uid,
} from "../lib/db";
import { APP_VERSION } from "../config/app";
import { buildHandoffSnapshot } from "../lib/handoff";
import type {
  AppSnapshot,
  Asset,
  Contact,
  DocumentRecord,
  HandoffProfile,
  HouseholdEvent,
  HouseholdTask,
  MaintenanceTask,
  Member,
  Subscription,
  Warranty,
} from "../lib/db/types";
import {
  createBackup,
  decryptBackup,
  encryptBackup,
  restoreBackup,
  summarizeBackup,
} from "../lib/backup";
import {
  MASTER_TABLE_MAX_BYTES,
  emptyMasterTableTemplate,
  exportMasterTable,
  importMasterTable,
  parseMasterTable,
  previewMasterImport,
  type MasterImportMode,
  type ParsedMasterTable,
} from "../lib/master-table";
import {
  AppLocaleProvider,
  Localize,
  useAppLocale,
  type AppLocale,
} from "./app-i18n";

type Tab =
  | "today"
  | "members"
  | "assets"
  | "maintenance"
  | "tasks"
  | "warranties"
  | "subscriptions"
  | "emergency"
  | "documents"
  | "handoff"
  | "display"
  | "settings";
type Input = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
  optionLabels?: Record<string, string>;
  value?: string;
  help?: string;
};
type ToolDraft = {
  slug: string;
  title: string;
  result: string;
  savedAt: string;
};
const empty: AppSnapshot = {
  households: [],
  members: [],
  assets: [],
  maintenanceTasks: [],
  maintenanceEvents: [],
  tasks: [],
  events: [],
  warranties: [],
  subscriptions: [],
  contacts: [],
  documents: [],
  attachmentsMetadata: [],
  handoffProfiles: [],
  settings: [],
  migrations: [],
};
const downloadFile = (name: string, body: BlobPart, type: string) => {
  const href = URL.createObjectURL(
    new Blob([body], { type }),
  );
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
};
const download = (name: string, value: unknown) =>
  downloadFile(
    name,
    JSON.stringify(value, null, 2),
    "application/json;charset=utf-8",
  );
const safeExternalUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.toString() : "";
  } catch {
    return "";
  }
};

function FilePicker({
  label,
  accept,
  disabled = false,
  onChange,
}: {
  label: string;
  accept: string;
  disabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const labelId = useId();
  const buttonId = useId();
  const [fileName, setFileName] = useState("");
  return (
    <Localize>
      <div className="file-picker">
        <span className="file-picker-label" id={labelId}>{label}</span>
        <div className="app-actions">
          <button
            type="button"
            className="secondary"
            disabled={disabled}
            aria-labelledby={`${labelId} ${buttonId}`}
            onClick={() => input.current?.click()}
          >
            <span id={buttonId}>Choose file</span>
          </button>
          <span className="file-picker-name" role="status">
            {fileName || "No file selected"}
          </span>
        </div>
        <input
          ref={input}
          hidden
          type="file"
          disabled={disabled}
          aria-label={label}
          accept={accept}
          onChange={(event) => {
            setFileName(event.currentTarget.files?.[0]?.name || "");
            void onChange(event);
          }}
        />
      </div>
    </Localize>
  );
}

function QuickForm({
  title,
  fields,
  submitLabel = "Add record",
  onSubmit,
}: {
  title: string;
  fields: Input[];
  submitLabel?: string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  const initial = useMemo(
    () =>
      Object.fromEntries(
        fields.map((field) => [
          field.name,
          field.value || field.options?.[0] || "",
        ]),
      ),
    [fields],
  );
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [busy, setBusy] = useState(false);
  return (
    <Localize>
    <details className="app-form-shell" open>
      <summary>
        <span>{title}</span>
        <span className="form-toggle" aria-hidden="true">＋</span>
      </summary>
    <form
      className="app-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        try {
          await onSubmit(values);
          setValues(initial);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2 className="visually-hidden">{title}</h2>
      <div className="form-grid">
        {fields.map((field) => (
          <label key={field.name}>
            {field.label}
            {field.options ? (
              <select
                value={values[field.name]}
                required={field.required}
                onChange={(event) =>
                  setValues({ ...values, [field.name]: event.target.value })
                }
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option ? field.optionLabels?.[option] || option : "None"}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                value={values[field.name]}
                required={field.required}
                onChange={(event) =>
                  setValues({ ...values, [field.name]: event.target.value })
                }
              />
            ) : (
              <input
                type={field.type || "text"}
                value={values[field.name]}
                required={field.required}
                onChange={(event) =>
                  setValues({ ...values, [field.name]: event.target.value })
                }
              />
            )}
            {field.help && <span className="help">{field.help}</span>}
          </label>
        ))}
      </div>
      <button disabled={busy} type="submit">
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
    </details>
    </Localize>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <div className="app-empty">{children}</div>;
}

export default function FamilyApp({ locale = "en" }: { locale?: AppLocale }) {
  return (
    <AppLocaleProvider locale={locale}>
      <FamilyAppBody />
    </AppLocaleProvider>
  );
}

function FamilyAppBody() {
  const {
    locale,
    date: labelDate,
    due: dueStatus,
    dateTime,
  } = useAppLocale();
  const [data, setData] = useState<AppSnapshot>(empty);
  const [ready, setReady] = useState(false);
  const [fatalError, setFatalError] = useState("");
  const [tab, setTab] = useState<Tab>("today");
  const [message, setMessage] = useState("");
  const [toolDrafts, setToolDrafts] = useState<ToolDraft[]>([]);
  const household = data.households[0];
  const householdId = household?.id || "";
  const refresh = useCallback(async () => {
    try {
      setData(await snapshot());
      setReady(true);
      setFatalError("");
    } catch (caught) {
      setFatalError(
        locale === "zh-TW"
          ? caught instanceof Error
            ? `FamilyBoard 無法開啟本機資料庫：${caught.message}。請勿清除瀏覽器資料；保留既有備份，並改用受支援的瀏覽器設定檔再試一次。`
            : "FamilyBoard 無法開啟本機資料庫。請勿清除瀏覽器資料，並保留所有既有備份。"
          : caught instanceof Error
            ? `FamilyBoard could not open its local database: ${caught.message}. Do not clear browser data; keep any existing backups and try a supported browser profile.`
            : "FamilyBoard could not open its local database. Do not clear browser data; keep any existing backups.",
      );
      setReady(true);
    }
  }, [locale]);
  useEffect(() => {
    refresh();
    navigator.storage?.persist?.().catch(() => false);
    try {
      setToolDrafts(
        JSON.parse(localStorage.getItem("familyboard:tool-inbox") || "[]"),
      );
    } catch {
      localStorage.removeItem("familyboard:tool-inbox");
    }
  }, [refresh]);
  useEffect(() => {
    const sync = () => refresh();
    const timer = window.setInterval(sync, 60_000);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [refresh]);
  const names = useMemo(
    () =>
      Object.fromEntries(
        data.members.map((member) => [member.id, member.name]),
      ),
    [data.members],
  );
  const assets = useMemo(
    () =>
      Object.fromEntries(data.assets.map((asset) => [asset.id, asset.name])),
    [data.assets],
  );
  const subscriptionTotals = useMemo(
    () => annualizedActiveTotalsByCurrency(data.subscriptions),
    [data.subscriptions],
  );

  if (!ready) return <Onboarding onComplete={refresh} checking />;
  if (fatalError)
    return (
      <Localize>
      <div className="onboarding">
        <section className="onboarding-panel">
          <h1>Local storage could not be opened</h1>
          <p role="alert">{fatalError}</p>
        </section>
      </div>
      </Localize>
    );
  if (!household) return <Onboarding onComplete={refresh} />;

  const title: Record<Tab, [string, string]> = {
    today: ["Today", "What needs attention across this household."],
    members: [
      "Household members",
      "People who can own household responsibilities.",
    ],
    assets: [
      "Assets",
      "Appliances, vehicles and household systems worth remembering.",
    ],
    maintenance: ["Maintenance", "Recurring work with a completion history."],
    tasks: [
      "Tasks & calendar",
      "One-off responsibilities and lightweight household events.",
    ],
    warranties: [
      "Warranties",
      "Coverage dates, receipt references and review points.",
    ],
    subscriptions: [
      "Subscriptions",
      "Recurring household obligations and renewal dates.",
    ],
    emergency: [
      "Emergency contacts",
      "Operational contacts and instructions—kept local.",
    ],
    documents: [
      "Document index",
      "References to where household records live.",
    ],
    handoff: ["Household handoff", "A readable briefing for the next person."],
    display: ["Family display", "A large, low-sensitivity household overview."],
    settings: [
      "Settings & backups",
      "Data durability, exports and destructive actions.",
    ],
  };

  const save = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await refresh();
      setMessage("Saved locally on this device.");
    } catch (caught) {
      setMessage(
        caught instanceof DOMException && caught.name === "QuotaExceededError"
          ? "The browser storage quota is full. Export a backup, free space safely and try again."
          : "The record could not be saved. Your previous local data was left in place.",
      );
    }
    setTimeout(() => setMessage(""), 2400);
  };
  const memberOptions = [
    "",
    ...data.members
      .filter((member) => !member.archived)
      .map((member) => member.id),
  ];
  const assetOptions = [
    "",
    ...data.assets
      .filter((asset) => asset.status !== "archived")
      .map((asset) => asset.id),
  ];

  return (
    <Localize>
    <div className="app-shell">
      <header className="app-topbar">
        <a className="brand" href={locale === "zh-TW" ? "/zh-tw/" : "/"}>
          <img className="brand-logo" src="/brand/familyboard-mark.png" alt="" />
          <span>FamilyBoard</span>
        </a>
        <span className="privacy-pill">Local data · no app analytics</span>
        <a
          className="app-language"
          href={locale === "zh-TW" ? "/app/" : "/zh-tw/app/"}
          lang={locale === "zh-TW" ? "en" : "zh-TW"}
        >
          {locale === "zh-TW" ? "English" : "繁體中文"}
        </a>
        <span>{household.name}</span>
      </header>
      <div className="app-layout">
        <nav className="app-nav" aria-label="App sections">
          {(
            [
              ["today", "Today"],
              ["members", "Members"],
              ["assets", "Assets"],
              ["maintenance", "Maintenance"],
              ["tasks", "Tasks"],
              ["warranties", "Warranties"],
              ["subscriptions", "Subscriptions"],
              ["emergency", "Emergency"],
              ["documents", "Documents"],
              ["handoff", "Handoff"],
              ["display", "Display"],
              ["settings", "Settings"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              className={tab === key ? "active" : ""}
              aria-current={tab === key ? "page" : undefined}
              onClick={() => setTab(key)}
              key={key}
            >
              {label}
            </button>
          ))}
        </nav>
        <main className="app-main">
          <div className="app-context" role="note">
            <span>Saved on this device</span>
            <span>No account</span>
            <span>Offline-ready</span>
          </div>
          <div className="app-title">
            <div>
              <h1>{title[tab][0]}</h1>
              <p>{title[tab][1]}</p>
            </div>
            <button
              className="secondary no-print"
              onClick={() => setTab("today")}
            >
              Home
            </button>
          </div>
          {message && (
            <p className="app-success" role="status">
              {message}
            </p>
          )}
          {toolDrafts.length > 0 && (
            <div className="notice">
              <strong>
                {toolDrafts.length} saved tool result
                {toolDrafts.length === 1 ? "" : "s"}
              </strong>
              <p>
                Import them as local document-index notes or leave them in this
                browser for later.
              </p>
              <button
                onClick={() =>
                  save(async () => {
                    await db.documents.bulkAdd(
                      toolDrafts.map(
                        (draft) =>
                          ({
                            ...base(householdId),
                            name: draft.title.replace(/ \|.*$/, ""),
                            category: "Saved tool result",
                            locationReference:
                              "Stored in this FamilyBoard database",
                            relatedAssetId: "",
                            reviewDate: draft.savedAt.slice(0, 10),
                            notes: draft.result,
                          }) as DocumentRecord,
                      ),
                    );
                    localStorage.removeItem("familyboard:tool-inbox");
                    setToolDrafts([]);
                  })
                }
              >
                Import saved results
              </button>
            </div>
          )}
          {tab === "today" && (
            <Today data={data} names={names} assets={assets} setTab={setTab} />
          )}
          {tab === "members" && (
            <MembersView data={data} householdId={householdId} save={save} />
          )}
          {tab === "assets" && (
            <>
              <QuickForm
                title="Add an asset"
                fields={[
                  { name: "name", label: "Asset name", required: true },
                  {
                    name: "category",
                    label: "Category",
                    value: locale === "zh-TW" ? "家電" : "Appliance",
                  },
                  { name: "location", label: "Location" },
                  { name: "brand", label: "Brand" },
                  { name: "model", label: "Model" },
                  {
                    name: "serialNumber",
                    label: "Serial number",
                    help: "Shared display never shows this value.",
                  },
                  {
                    name: "purchaseDate",
                    label: "Purchase date",
                    type: "date",
                  },
                  { name: "notes", label: "Notes", type: "textarea" },
                ]}
                onSubmit={(v) =>
                  save(() =>
                    db.assets.add({
                      ...base(householdId),
                      ...v,
                      status: "active",
                    } as Asset),
                  )
                }
              />
              <div className="app-grid">
                {data.assets.map((item) => (
                  <div className="app-card" key={item.id}>
                    <header>
                      <h2>{item.name}</h2>
                      <span
                        className={`status ${item.status === "watch" ? "attention" : ""}`}
                      >
                        {item.status}
                      </span>
                    </header>
                    <p>
                      {item.category} · {item.location || "No location"}
                    </p>
                    <p className="detail">
                      {[item.brand, item.model].filter(Boolean).join(" ") ||
                        "Brand/model not recorded"}{" "}
                      {locale === "zh-TW"
                        ? `· 購買日 ${labelDate(item.purchaseDate)}`
                        : `· purchased ${labelDate(item.purchaseDate)}`}
                    </p>
                    {item.serialNumber && (
                      <p className="detail">
                        Serial number: {item.serialNumber}
                      </p>
                    )}
                    {item.notes && (
                      <p className="detail">Notes: {item.notes}</p>
                    )}
                    <div className="app-actions">
                      <button
                        className="secondary"
                        onClick={() =>
                          save(() =>
                            db.assets.update(item.id, {
                              status:
                                item.status === "watch" ? "active" : "watch",
                              updatedAt: now(),
                            }),
                          )
                        }
                      >
                        {item.status === "watch" ? "Clear watch" : "Watch"}
                      </button>
                      <button
                        className="secondary"
                        onClick={() =>
                          save(() =>
                            db.assets.update(item.id, {
                              status: "archived",
                              updatedAt: now(),
                            }),
                          )
                        }
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === "maintenance" && (
            <>
              <QuickForm
                title="Add maintenance"
                fields={[
                  { name: "title", label: "Maintenance task", required: true },
                  {
                    name: "assetId",
                    label: "Related asset",
                    options: assetOptions,
                    optionLabels: assets,
                  },
                  { name: "homeArea", label: "Home area" },
                  {
                    name: "ownerMemberId",
                    label: "Owner",
                    options: memberOptions,
                    optionLabels: names,
                  },
                  { name: "nextDue", label: "Next due", type: "date" },
                  {
                    name: "intervalMonths",
                    label: "Repeat months after completion",
                    type: "number",
                    value: "0",
                  },
                  {
                    name: "priority",
                    label: "Priority",
                    options: ["normal", "high", "low"],
                  },
                  {
                    name: "instructionsSource",
                    label: "Instructions source",
                    help: "Manual, official support page or provider.",
                  },
                  { name: "notes", label: "Notes", type: "textarea" },
                ]}
                onSubmit={(v) =>
                  save(() =>
                    db.maintenanceTasks.add({
                      ...base(householdId),
                      ...v,
                      intervalMonths: Number(v.intervalMonths || 0),
                      triggerType:
                        Number(v.intervalMonths) > 0
                          ? "interval-after-completion"
                          : "date",
                    } as MaintenanceTask),
                  )
                }
              />
              <div className="app-grid">
                {data.maintenanceTasks.map((item) => (
                  <div className="app-card" key={item.id}>
                    <header>
                      <h2>{item.title}</h2>
                      <span
                        className={`status ${item.nextDue && item.nextDue < localIsoDate() ? "overdue" : ""}`}
                      >
                        {dueStatus(item.nextDue)}
                      </span>
                    </header>
                    <p>
                      {assets[item.assetId] ||
                        item.homeArea ||
                        "Whole household"}{" "}
                      · {names[item.ownerMemberId] || "Unassigned"}
                    </p>
                    <p className="detail">
                      Source:{" "}
                      {item.instructionsSource ||
                        "Add manufacturer/provider source"}{" "}
                      ·{" "}
                      {
                        data.maintenanceEvents.filter(
                          (event) => event.maintenanceTaskId === item.id,
                        ).length
                      }{" "}
                      completions
                    </p>
                    {data.maintenanceEvents
                      .filter((event) => event.maintenanceTaskId === item.id)
                      .sort((a, b) =>
                        b.completedAt.localeCompare(a.completedAt),
                      )
                      .slice(0, 5)
                      .map((event) => (
                        <p className="detail" key={event.id}>
                          Completed{" "}
                          {dateTime(event.completedAt)}
                          {event.cost
                            ? ` · ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(event.cost)}`
                            : ""}
                        </p>
                      ))}
                    <div className="app-actions">
                      <button
                        onClick={() =>
                          save(async () => {
                            await db.maintenanceEvents.add({
                              ...base(householdId),
                              maintenanceTaskId: item.id,
                              completedAt: now(),
                              completedBy: "",
                              cost: 0,
                              notes: "",
                            });
                            const nextDue =
                              item.intervalMonths > 0
                                ? addMonthsClamped(
                                    localIsoDate(),
                                    item.intervalMonths,
                                  )
                                : "";
                            await db.maintenanceTasks.update(item.id, {
                              nextDue,
                              updatedAt: now(),
                            });
                          })
                        }
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === "tasks" && (
            <TasksView
              data={data}
              householdId={householdId}
              memberOptions={memberOptions}
              names={names}
              save={save}
            />
          )}
          {tab === "warranties" && (
            <>
              <QuickForm
                title="Add a warranty"
                fields={[
                  {
                    name: "assetId",
                    label: "Asset",
                    options: assetOptions,
                    optionLabels: assets,
                    required: true,
                  },
                  { name: "provider", label: "Provider" },
                  { name: "startsAt", label: "Starts", type: "date" },
                  {
                    name: "endsAt",
                    label: "Ends",
                    type: "date",
                    required: true,
                  },
                  {
                    name: "receiptReference",
                    label: "Receipt location/reference",
                  },
                  { name: "termsReference", label: "Terms/manual reference" },
                  { name: "notes", label: "Notes", type: "textarea" },
                ]}
                onSubmit={(v) =>
                  save(() =>
                    db.warranties.add({
                      ...base(householdId),
                      ...v,
                    } as Warranty),
                  )
                }
              />
              <div className="app-grid">
                {data.warranties.map((item) => (
                  <div className="app-card" key={item.id}>
                    <header>
                      <h2>{assets[item.assetId] || "Unlinked warranty"}</h2>
                      <span
                        className={`status ${item.endsAt < localIsoDate() ? "overdue" : ""}`}
                      >
                        {item.endsAt < localIsoDate()
                          ? "Expired"
                          : `Ends ${labelDate(item.endsAt)}`}
                      </span>
                    </header>
                    <p>{item.provider || "Provider not recorded"}</p>
                    <p className="detail">
                      <span>Receipt:</span>{" "}
                      {item.receiptReference || "Not recorded"} ·{" "}
                      <span>Written terms control exact coverage.</span>
                    </p>
                    <p className="detail">
                      Coverage: {labelDate(item.startsAt)} – {labelDate(item.endsAt)}
                    </p>
                    <p className="detail">
                      Terms: {item.termsReference || "Not recorded"}
                    </p>
                    {item.notes && <p className="detail">Notes: {item.notes}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === "subscriptions" && (
            <>
              <QuickForm
                title="Add a subscription"
                fields={[
                  { name: "name", label: "Service", required: true },
                  {
                    name: "category",
                    label: "Category",
                    value: locale === "zh-TW" ? "家庭" : "Household",
                  },
                  { name: "cost", label: "Cost", type: "number", value: "0" },
                  {
                    name: "currency",
                    label: "Currency",
                    options: ["TWD", "USD", "JPY"],
                    value: locale === "zh-TW" ? "TWD" : "USD",
                  },
                  {
                    name: "billingFrequency",
                    label: "Billing frequency",
                    options: ["monthly", "annual", "weekly", "quarterly"],
                  },
                  { name: "nextRenewal", label: "Next renewal", type: "date" },
                  {
                    name: "reviewBeforeDays",
                    label: "Review days before",
                    type: "number",
                    value: "14",
                  },
                  {
                    name: "ownerMemberId",
                    label: "Owner",
                    options: memberOptions,
                    optionLabels: names,
                  },
                  {
                    name: "managementUrl",
                    label: "Management URL",
                    type: "url",
                  },
                  {
                    name: "paymentMethodNote",
                    label: "Non-sensitive payment note",
                    help: "Never store card numbers or passwords.",
                  },
                  { name: "notes", label: "Notes", type: "textarea" },
                ]}
                onSubmit={(v) =>
                  save(() =>
                    db.subscriptions.add({
                      ...base(householdId),
                      ...v,
                      cost: Number(v.cost || 0),
                      reviewBeforeDays: Number(v.reviewBeforeDays || 0),
                      status: "active",
                    } as Subscription),
                  )
                }
              />
              <p className="notice">
                Annualized active totals by currency:{" "}
                {Object.entries(subscriptionTotals).length
                  ? Object.entries(subscriptionTotals)
                      .sort(([left], [right]) => left.localeCompare(right))
                      .map(
                        ([currency, total]) =>
                          `${currency} ${new Intl.NumberFormat(locale === "zh-TW" ? "zh-TW" : "en-US", { maximumFractionDigits: 2 }).format(total)}`,
                      )
                      .join(" · ")
                  : "No active subscriptions."}
              </p>
              <div className="app-grid">
                {data.subscriptions.map((item) => {
                  const managementUrl = safeExternalUrl(item.managementUrl);
                  const reviewDate = item.nextRenewal
                    ? warrantyReviewDate(
                        item.nextRenewal,
                        Math.max(0, item.reviewBeforeDays || 0),
                      )
                    : "";
                  return <div className="app-card" key={item.id}>
                    <header>
                      <h2>{item.name}</h2>
                      <span className="status">{item.status}</span>
                    </header>
                    <p>
                      {item.currency} {item.cost.toFixed(2)} ·{" "}
                      {item.billingFrequency}
                    </p>
                    <p className="detail">
                      Renewal {labelDate(item.nextRenewal)} ·{" "}
                      Review by {labelDate(reviewDate)} ·{" "}
                      {names[item.ownerMemberId] || "Unassigned"}
                    </p>
                    {managementUrl && (
                      <p className="detail">
                        Management: <a href={managementUrl} target="_blank" rel="noopener noreferrer">Open service page</a>
                      </p>
                    )}
                    {item.paymentMethodNote && (
                      <p className="detail">Payment note: {item.paymentMethodNote}</p>
                    )}
                    {item.notes && <p className="detail">Notes: {item.notes}</p>}
                    <div className="app-actions">
                      <button
                        className="secondary"
                        onClick={() =>
                          save(() =>
                            db.subscriptions.update(item.id, {
                              status:
                                item.status === "cancelled"
                                  ? "active"
                                  : "cancelled",
                              updatedAt: now(),
                            }),
                          )
                        }
                      >
                        {item.status === "cancelled"
                          ? "Reactivate"
                          : "Mark cancelled"}
                      </button>
                    </div>
                  </div>;
                })}
              </div>
            </>
          )}
          {tab === "emergency" && (
            <>
              <QuickForm
                title="Add a contact"
                fields={[
                  { name: "name", label: "Person or service", required: true },
                  {
                    name: "category",
                    label: "Category",
                    value: locale === "zh-TW" ? "家庭聯絡人" : "Household contact",
                  },
                  { name: "phone", label: "Phone", type: "tel" },
                  { name: "email", label: "Email", type: "email" },
                  {
                    name: "notes",
                    label: "Operational notes",
                    type: "textarea",
                  },
                  {
                    name: "sensitive",
                    label: "Visibility",
                    options: ["false", "true"],
                    help: "Sensitive contacts are excluded from shared display and handoff by default.",
                  },
                ]}
                onSubmit={(v) =>
                  save(() =>
                    db.contacts.add({
                      ...base(householdId),
                      ...v,
                      sensitive: v.sensitive === "true",
                    } as Contact),
                  )
                }
              />
              <div className="app-grid">
                {data.contacts.map((item) => (
                  <div className="app-card" key={item.id}>
                    <header>
                      <h2>{item.name}</h2>
                      <span
                        className={`status ${item.sensitive ? "attention" : ""}`}
                      >
                        {item.sensitive ? "Private" : "Shareable"}
                      </span>
                    </header>
                    <p>{item.category}</p>
                    <p>
                      {item.phone} {item.email}
                    </p>
                    <p className="detail">{item.notes}</p>
                  </div>
                ))}
              </div>
              <p className="notice">
                FamilyBoard organizes contacts; it does not replace current
                official local emergency guidance.
              </p>
            </>
          )}
          {tab === "documents" && (
            <>
              <QuickForm
                title="Add a document reference"
                fields={[
                  { name: "name", label: "Record name", required: true },
                  {
                    name: "category",
                    label: "Category",
                    value: locale === "zh-TW" ? "家庭文件" : "Home record",
                  },
                  {
                    name: "locationReference",
                    label: "Where the original is stored",
                    required: true,
                  },
                  {
                    name: "relatedAssetId",
                    label: "Related asset",
                    options: assetOptions,
                    optionLabels: assets,
                  },
                  { name: "reviewDate", label: "Review date", type: "date" },
                  { name: "notes", label: "Notes", type: "textarea" },
                ]}
                onSubmit={(v) =>
                  save(() =>
                    db.documents.add({
                      ...base(householdId),
                      ...v,
                    } as DocumentRecord),
                  )
                }
              />
              <div className="app-grid">
                {data.documents.map((item) => (
                  <div className="app-card" key={item.id}>
                    <h2>{item.name}</h2>
                    <p>
                      {item.category} · {item.locationReference}
                    </p>
                    <p className="detail">
                      {assets[item.relatedAssetId] || "No asset link"} ·{" "}
                      <span>Review:</span>{" "}
                      {labelDate(item.reviewDate)}
                    </p>
                    {item.notes && <p className="detail">Notes: {item.notes}</p>}
                  </div>
                ))}
              </div>
              <p className="notice">
                This v1 stores document references, not uploaded document files.
                Keep durable originals in storage you control.
              </p>
            </>
          )}
          {tab === "handoff" && (
            <HandoffView
              data={data}
              names={names}
              assets={assets}
              householdId={householdId}
              save={save}
            />
          )}
          {tab === "display" && <DisplayView data={data} names={names} />}
          {tab === "settings" && (
            <SettingsView
              data={data}
              refresh={refresh}
              householdName={household.name}
              setMessage={setMessage}
            />
          )}
        </main>
      </div>
    </div>
    </Localize>
  );
}

function Onboarding({
  onComplete,
  checking = false,
}: {
  onComplete: () => Promise<void>;
  checking?: boolean;
}) {
  const { locale } = useAppLocale();
  const [name, setName] = useState("");
  const [members, setMembers] = useState("");
  const [busy, setBusy] = useState(false);
  const [restorePassword, setRestorePassword] = useState("");
  const [restoreError, setRestoreError] = useState("");
  return (
    <Localize>
    <div className="onboarding">
      <div className="onboarding-toolbar">
        <a className="brand" href={locale === "zh-TW" ? "/zh-tw/" : "/"}>
          <img className="brand-logo" src="/brand/familyboard-mark.png" alt="" />
          <span>FamilyBoard</span>
        </a>
        <a
          className="app-language"
          href={locale === "zh-TW" ? "/app/" : "/zh-tw/app/"}
          lang={locale === "zh-TW" ? "en" : "zh-TW"}
        >
          {locale === "zh-TW" ? "English" : "繁體中文"}
        </a>
      </div>
      <form
        className="onboarding-panel"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          const id = uid();
          const timestamp = now();
          await db.transaction("rw", db.households, db.members, async () => {
            await db.households.add({
              id,
              name: name.trim(),
              createdAt: timestamp,
              updatedAt: timestamp,
              schemaVersion: DB_SCHEMA_VERSION,
            });
            const rows = members
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
              .map((member) => ({
                ...base(id),
                name: member,
                role: locale === "zh-TW" ? "家庭成員" : "Household member",
              }));
            if (rows.length) await db.members.bulkAdd(rows);
          });
          await onComplete();
        }}
      >
        <span className="eyebrow">No account needed</span>
        <h1>Set up your home without creating an account.</h1>
        <p>
          Your core household records stay in this browser. Start with one home
          and the people who share it. Export a backup after adding anything
          important.
        </p>
        {checking && (
          <p className="app-success" role="status">
            Opening your local household database…
          </p>
        )}
        <label>
          Home name
          <input
            required
            disabled={checking}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Our home"
          />
        </label>
        <label>
          Household members{" "}
          <span className="help">Optional, separated by commas</span>
          <input
            disabled={checking}
            value={members}
            onChange={(event) => setMembers(event.target.value)}
            placeholder="Alex, Sam"
          />
        </label>
        <p className="notice">
          Browser data can be cleared and devices can fail. FamilyBoard will
          remind you to export backups.
        </p>
        <button disabled={busy || checking}>
          {checking
            ? "Opening local data…"
            : busy
              ? "Creating local home…"
              : "Create local household"}
        </button>
      </form>
      <section className="onboarding-panel">
        <h2>Restore an existing household</h2>
        <p>
          Choose a FamilyBoard JSON backup. Validation happens before any
          records are written.
        </p>
        <label>
          Password for encrypted backup
          <input
            type="password"
            disabled={checking}
            value={restorePassword}
            onChange={(event) => setRestorePassword(event.target.value)}
          />
        </label>
        <FilePicker
          label="Backup file"
          disabled={checking}
          accept="application/json,.json"
          onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              if (!file) return;
              try {
                setRestoreError("");
                const raw = JSON.parse(await file.text());
                const parsed =
                  raw.format === "familyboard-encrypted-backup"
                    ? await decryptBackup(raw, restorePassword)
                    : raw;
                await restoreBackup(parsed, "replace");
                await onComplete();
              } catch (caught) {
                setRestoreError(
                  caught instanceof Error
                    ? caught.message
                    : locale === "zh-TW"
                      ? "還原失敗，資料未被更動。"
                      : "Restore failed. No data was changed.",
                );
              }
            }}
        />
        {restoreError && (
          <p className="app-error" role="alert">
            {restoreError}
          </p>
        )}
      </section>
    </div>
    </Localize>
  );
}

function MembersView({
  data,
  householdId,
  save,
}: {
  data: AppSnapshot;
  householdId: string;
  save: (action: () => Promise<unknown>) => Promise<void>;
}) {
  const { locale } = useAppLocale();
  return (
    <Localize>
    <>
      <QuickForm
        title="Add a household member"
        fields={[
          { name: "name", label: "Member name", required: true },
          {
            name: "role",
            label: "Household role",
            value: locale === "zh-TW" ? "家庭成員" : "Household member",
          },
        ]}
        onSubmit={(values) =>
          save(() =>
            db.members.add({
              ...base(householdId),
              name: values.name,
              role: values.role,
              archived: false,
            } as Member),
          )
        }
      />
      <div className="app-grid">
        {data.members.map((member) => (
          <section className="app-card" key={member.id}>
            <h2>{member.name}</h2>
            <p>
              {member.role} · {member.archived ? "Archived" : "Active"}
            </p>
            {!member.archived && (
              <button
                className="secondary"
                onClick={() =>
                  save(() =>
                    db.members.update(member.id, {
                      archived: true,
                      updatedAt: now(),
                    }),
                  )
                }
              >
                Archive
              </button>
            )}
          </section>
        ))}
      </div>
    </>
    </Localize>
  );
}

function Today({
  data,
  names,
  assets,
  setTab,
}: {
  data: AppSnapshot;
  names: Record<string, string>;
  assets: Record<string, string>;
  setTab: (tab: Tab) => void;
}) {
  const { due: dueStatus } = useAppLocale();
  const today = localIsoDate();
  const maintenanceCutoff = new Date();
  maintenanceCutoff.setDate(maintenanceCutoff.getDate() + 7);
  const active = sortByOptionalIsoDate(
    data.tasks.filter((item) => !item.completedAt),
    (item) => item.dueDate,
  );
  const overdue = active.filter(
    (item) =>
      item.dueDate && item.dueDate < today,
  );
  const dueMaintenance = sortByOptionalIsoDate(
    data.maintenanceTasks.filter(
      (item) =>
        item.nextDue &&
        item.nextDue <= localIsoDate(maintenanceCutoff),
    ),
    (item) => item.nextDue,
  );
  return (
    <Localize>
    <>
      <div className="metric-grid">
        <div className="metric">
          <strong>{overdue.length}</strong>
          <span>Overdue tasks</span>
        </div>
        <div className="metric">
          <strong>{dueMaintenance.length}</strong>
          <span>Maintenance due soon</span>
        </div>
        <div className="metric">
          <strong>
            {data.assets.filter((item) => item.status !== "archived").length}
          </strong>
          <span>Active assets</span>
        </div>
        <div className="metric">
          <strong>
            {
              data.subscriptions.filter((item) => item.status === "active")
                .length
            }
          </strong>
          <span>Active subscriptions</span>
        </div>
      </div>
      <div className="app-grid">
        <section className="app-card">
          <header>
            <h2>Next responsibilities</h2>
            <button className="secondary" onClick={() => setTab("tasks")}>
              View tasks
            </button>
          </header>
          {active.slice(0, 5).map((item) => (
            <p key={item.id}>
              <strong>{item.title}</strong>
              <br />
              <span className="detail">
                {dueStatus(item.dueDate)} ·{" "}
                {names[item.ownerMemberId] || "Unassigned"}
              </span>
            </p>
          ))}
          {!active.length && (
            <Empty>
              Nothing needs your attention right now. Add a responsibility when
              you have something worth remembering.
            </Empty>
          )}
        </section>
        <section className="app-card">
          <header>
            <h2>Maintenance due</h2>
            <button className="secondary" onClick={() => setTab("maintenance")}>
              View maintenance
            </button>
          </header>
          {dueMaintenance.slice(0, 5).map((item) => (
            <p key={item.id}>
              <strong>{item.title}</strong>
              <br />
              <span className="detail">
                {assets[item.assetId] || item.homeArea || "Household"} ·{" "}
                {dueStatus(item.nextDue)}
              </span>
            </p>
          ))}
          {!dueMaintenance.length && (
            <Empty>No maintenance is due in the next seven days.</Empty>
          )}
        </section>
      </div>
    </>
    </Localize>
  );
}

function TasksView({
  data,
  householdId,
  memberOptions,
  names,
  save,
}: {
  data: AppSnapshot;
  householdId: string;
  memberOptions: string[];
  names: Record<string, string>;
  save: (action: () => Promise<unknown>) => Promise<void>;
}) {
  const { due: dueStatus, dateTime } = useAppLocale();
  return (
    <Localize>
    <>
      <QuickForm
        title="Add a task"
        fields={[
          { name: "title", label: "Responsibility", required: true },
          {
            name: "ownerMemberId",
            label: "Owner",
            options: memberOptions,
            optionLabels: names,
          },
          { name: "dueDate", label: "Due date", type: "date" },
          {
            name: "recurrence",
            label: "Repeat note",
            help: "Example: weekly. Completing does not invent the next date.",
          },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        onSubmit={(v) =>
          save(() =>
            db.tasks.add({
              ...base(householdId),
              ...v,
              completedAt: "",
            } as HouseholdTask),
          )
        }
      />
      <QuickForm
        title="Add a calendar event"
        fields={[
          { name: "title", label: "Event", required: true },
          {
            name: "startsAt",
            label: "Starts",
            type: "datetime-local",
            required: true,
          },
          { name: "endsAt", label: "Ends", type: "datetime-local" },
          { name: "location", label: "Location" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        onSubmit={(v) =>
          save(() =>
            db.events.add({ ...base(householdId), ...v } as HouseholdEvent),
          )
        }
      />
      <div className="app-grid">
        {data.tasks.map((item) => (
          <div className="app-card" key={item.id}>
            <header>
              <h2>{item.title}</h2>
              <span className={`status ${item.completedAt ? "" : "attention"}`}>
                {item.completedAt ? "Complete" : dueStatus(item.dueDate)}
              </span>
            </header>
            <p>
              {names[item.ownerMemberId] || "Unassigned"} ·{" "}
              {item.recurrence || "One-off"}
            </p>
            {item.notes && <p className="detail">Notes: {item.notes}</p>}
            {!item.completedAt && (
              <div className="app-actions">
                <button
                  onClick={() =>
                    save(() =>
                      db.tasks.update(item.id, {
                        completedAt: now(),
                        updatedAt: now(),
                      }),
                    )
                  }
                >
                  Complete
                </button>
              </div>
            )}
          </div>
        ))}
        {data.events.map((item) => (
          <div className="app-card" key={item.id}>
            <span className="card-tag">Calendar event</span>
            <h2>{item.title}</h2>
            <p>
              {dateTime(item.startsAt)} ·{" "}
              {item.location || "No location"}
            </p>
            {item.endsAt && (
              <p className="detail">{`Ends ${dateTime(item.endsAt)}`}</p>
            )}
            {item.notes && <p className="detail">Notes: {item.notes}</p>}
          </div>
        ))}
      </div>
    </>
    </Localize>
  );
}

function HandoffView({
  data,
  names,
  assets,
  householdId,
  save,
}: {
  data: AppSnapshot;
  names: Record<string, string>;
  assets: Record<string, string>;
  householdId: string;
  save: (action: () => Promise<unknown>) => Promise<void>;
}) {
  const { locale, due: dueStatus, date: labelDate, dateTime } = useAppLocale();
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const profile =
    data.handoffProfiles.find((item) => item.id === selectedProfileId) ??
    data.handoffProfiles[0];
  const { tasks, contacts, maintenanceTasks, documents } = buildHandoffSnapshot(
    data,
    profile,
  );
  return (
    <Localize>
    <>
      <QuickForm
        title="Create a sharing profile"
        fields={[
          { name: "name", label: "Profile name", required: true },
          { name: "purpose", label: "Purpose", required: true },
          {
            name: "includeTasks",
            label: "Include open tasks",
            options: ["yes", "no"],
          },
          {
            name: "includeMaintenance",
            label: "Include maintenance",
            options: ["yes", "no"],
          },
          {
            name: "includeContacts",
            label: "Include non-sensitive contacts",
            options: ["yes", "no"],
          },
          {
            name: "includeDocuments",
            label: "Include document locations",
            options: ["no", "yes"],
          },
          { name: "notes", label: "Profile note", type: "textarea" },
        ]}
        onSubmit={async (values) => {
          const record = {
            ...base(householdId),
            name: values.name,
            purpose: values.purpose,
            includeTasks: values.includeTasks === "yes",
            includeMaintenance: values.includeMaintenance === "yes",
            includeContacts: values.includeContacts === "yes",
            includeDocuments: values.includeDocuments === "yes",
            notes: values.notes,
          } as HandoffProfile;
          await save(() => db.handoffProfiles.add(record));
          setSelectedProfileId(record.id);
        }}
      />
      {data.handoffProfiles.length > 0 && (
        <section className="app-card handoff-profile-picker">
          <label>
            Handoff profile
            <select
              value={profile?.id || ""}
              onChange={(event) => setSelectedProfileId(event.target.value)}
            >
              {data.handoffProfiles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {item.purpose}
                </option>
              ))}
            </select>
          </label>
          <p className="help">
            Select the profile that matches this handoff before reviewing or
            printing the sheet.
          </p>
        </section>
      )}
      <div className="handoff-sheet">
        <h2>{data.households[0]?.name} household handoff</h2>
        <p>
          {profile
            ? locale === "zh-TW"
              ? `設定檔：${profile.name} · `
              : `Profile: ${profile.name} · `
            : locale === "zh-TW"
              ? "預設隱私設定檔 · "
              : "Default privacy profile · "}
          {locale === "zh-TW"
            ? `產生時間 ${dateTime(new Date())} · 分享前請再次確認日期。`
            : `Generated ${dateTime(new Date())} · Confirm dates before sharing.`}
        </p>
        <h3>Responsibilities</h3>
        {tasks.length ? (
          tasks.map((item) => (
            <p key={item.id}>
              <strong>{item.title}</strong> — {dueStatus(item.dueDate)} —{" "}
              {names[item.ownerMemberId] || "Unassigned"}
            </p>
          ))
        ) : (
          <p>Nothing currently open.</p>
        )}
        <h3>Maintenance</h3>
        {maintenanceTasks.slice(0, 10).map((item) => (
          <p key={item.id}>
            <strong>{item.title}</strong> —{" "}
            {assets[item.assetId] || item.homeArea || "Household"} —{" "}
            {dueStatus(item.nextDue)}
          </p>
        ))}
        <h3>Shareable contacts</h3>
        {contacts.map((item) => (
          <p key={item.id}>
            <strong>{item.name}</strong> — {item.category} — {item.phone}
          </p>
        ))}
        {documents.length > 0 && <h3>Document locations</h3>}
        {documents.map((item) => (
          <p key={item.id}>
            <strong>{item.name}</strong> — {item.category} —{" "}
            {item.locationReference || "Location not recorded"} —{" "}
            {assets[item.relatedAssetId] || "No asset link"} —{" "}
            <span>Review:</span>{" "}
            {labelDate(item.reviewDate)}
          </p>
        ))}
        <h3>Intentionally excluded</h3>
        <p>
          Sensitive contacts, serial numbers, document details, subscription
          costs, private notes and backup contents.
        </p>
      </div>
      <div className="app-actions no-print">
        <button onClick={() => window.print()}>Print handoff</button>
      </div>
    </>
    </Localize>
  );
}

function DisplayView({
  data,
  names,
}: {
  data: AppSnapshot;
  names: Record<string, string>;
}) {
  const { locale, due: dueStatus } = useAppLocale();
  const today = new Date().toLocaleDateString(locale === "zh-TW" ? "zh-TW" : "en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const todayKey = localIsoDate();
  const events = data.events.filter((item) =>
    item.startsAt.startsWith(todayKey),
  );
  return (
    <Localize>
    <div className="display-mode">
      <p className="privacy-pill">Shared view · refreshes every minute</p>
      <p>{data.households[0]?.name}</p>
      <h1>{today}</h1>
      <div className="app-grid">
        <section className="app-card">
          <h2>Household tasks</h2>
          {data.tasks
            .filter((item) => !item.completedAt)
            .slice(0, 6)
            .map((item) => (
              <p key={item.id}>
                <strong>{item.title}</strong> ·{" "}
                {names[item.ownerMemberId] || "Anyone"} ·{" "}
                {dueStatus(item.dueDate)}
              </p>
            ))}
        </section>
        <section className="app-card">
          <h2>Today’s events</h2>
          {events.length ? (
            events.slice(0, 6).map((item) => (
              <p key={item.id}>
                <strong>{item.title}</strong> ·{" "}
                {new Date(item.startsAt).toLocaleTimeString(locale === "zh-TW" ? "zh-TW" : "en", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            ))
          ) : (
            <p>No household events today.</p>
          )}
        </section>
        <section className="app-card">
          <h2>Coming up</h2>
          {data.maintenanceTasks
            .slice()
            .sort((a, b) => a.nextDue.localeCompare(b.nextDue))
            .slice(0, 6)
            .map((item) => (
              <p key={item.id}>
                <strong>{item.title}</strong> · {dueStatus(item.nextDue)}
              </p>
            ))}
        </section>
      </div>
      <p>
        Private records and sensitive contacts are hidden from this display.
      </p>
    </div>
    </Localize>
  );
}

function SettingsView({
  data,
  refresh,
  householdName,
  setMessage,
}: {
  data: AppSnapshot;
  refresh: () => Promise<void>;
  householdName: string;
  setMessage: (value: string) => void;
}) {
  const { locale, dateTime } = useAppLocale();
  const [password, setPassword] = useState("");
  const [restorePassword, setRestorePassword] = useState("");
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [masterMode, setMasterMode] = useState<MasterImportMode>("merge");
  const [masterFileName, setMasterFileName] = useState("");
  const [masterTable, setMasterTable] = useState<ParsedMasterTable | null>(null);
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [validation, setValidation] = useState("");
  const [storage, setStorage] = useState({
    usage: 0,
    quota: 0,
    persisted: false,
  });
  useEffect(() => {
    Promise.all([
      navigator.storage?.estimate?.() ?? Promise.resolve({}),
      navigator.storage?.persisted?.() ?? Promise.resolve(false),
    ]).then(([estimate, persisted]) =>
      setStorage({
        usage: estimate.usage ?? 0,
        quota: estimate.quota ?? 0,
        persisted,
      }),
    );
  }, [data]);
  const lastBackup = data.settings.find(
    (item) => item.id === "lastBackup",
  )?.value;
  const householdId = data.households[0]?.id || "";
  const masterPreview = useMemo(
    () =>
      masterTable && householdId
        ? previewMasterImport(masterTable, masterMode, data, householdId)
        : null,
    [data, householdId, masterMode, masterTable],
  );
  const backupDays = lastBackup
    ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / 86400000)
    : null;
  const exportData = async (encrypted: boolean) => {
    try {
      setError("");
      const backup = await createBackup();
      const output = encrypted ? await encryptBackup(backup, password) : backup;
      download(
        `familyboard-backup-${localIsoDate()}${encrypted ? ".encrypted" : ""}.json`,
        output,
      );
      await db.settings.put(baseSetting("lastBackup", now()));
      await refresh();
      setMessage("Backup exported. Store it somewhere durable and protected.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Backup failed.");
    }
  };
  const readBackupFile = async (file: File) => {
    const raw = JSON.parse(await file.text());
    return raw.format === "familyboard-encrypted-backup"
      ? decryptBackup(raw, restorePassword)
      : raw;
  };
  const validate = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    try {
      setError("");
      const summary = summarizeBackup(await readBackupFile(file));
      setValidation(
        locale === "zh-TW"
          ? `有效備份：匯出於 ${dateTime(summary.exportedAt)} · 架構 ${summary.schemaVersion} · ${summary.totalRecords} 筆紀錄。資料未被更動。`
          : `Valid backup from ${dateTime(summary.exportedAt)} · schema ${summary.schemaVersion} · ${summary.totalRecords} records. No data was changed.`,
      );
    } catch (caught) {
      setValidation("");
      setError(
        caught instanceof Error ? caught.message : "Backup validation failed.",
      );
    }
  };
  const restore = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    try {
      setError("");
      const parsed = await readBackupFile(file);
      if (mode === "replace") {
        const safety = await createBackup();
        download(`familyboard-safety-snapshot-${Date.now()}.json`, safety);
      }
      await restoreBackup(parsed, mode);
      await db.settings.put(baseSetting("lastRestore", now()));
      await refresh();
      setMessage(
        locale === "zh-TW"
          ? `備份已用${mode === "merge" ? "合併" : "取代"}模式還原。`
          : `Backup restored in ${mode} mode.`,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Restore failed. No changes were applied.",
      );
    }
  };
  const exportMaster = async () => {
    try {
      setError("");
      const csv = exportMasterTable(data, householdId);
      downloadFile(
        `familyboard-master-${localIsoDate()}.csv`,
        csv,
        "text/csv;charset=utf-8",
      );
      await db.settings.put(baseSetting("lastMasterExport", now()));
      await refresh();
      setMessage(
        locale === "zh-TW"
          ? "家庭總表已匯出，可用試算表編輯後再匯入。JSON 備份仍是完整災難復原檔。"
          : "Master table exported. You can edit it in a spreadsheet and import it again. JSON remains the complete disaster-recovery backup.",
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Master export failed.",
      );
    }
  };
  const readMaster = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    try {
      setError("");
      setValidation("");
      setMasterFileName(file.name);
      if (file.size > MASTER_TABLE_MAX_BYTES)
        throw new Error("Master CSV is larger than the 5 MB safety limit.");
      setMasterTable(parseMasterTable(await file.text()));
    } catch (caught) {
      setMasterTable(null);
      setError(
        caught instanceof Error ? caught.message : "Master CSV could not be read.",
      );
    }
  };
  const applyMaster = async () => {
    if (!masterTable || !masterPreview || !householdId) return;
    try {
      setError("");
      if (masterPreview.errors.length)
        throw new Error("Fix every CSV validation error before importing.");
      const safety = await createBackup();
      download(`familyboard-before-master-import-${Date.now()}.json`, safety);
      const result = await importMasterTable(
        masterTable,
        masterMode,
        householdId,
      );
      await Promise.all([
        db.settings.put(baseSetting("lastBackup", now())),
        db.settings.put(baseSetting("lastMasterImport", now())),
      ]);
      setMasterTable(null);
      setMasterFileName("");
      await refresh();
      setMessage(
        locale === "zh-TW"
          ? `家庭總表匯入完成：新增 ${result.newRecords} 筆、更新 ${result.updatedRecords} 筆。匯入前安全快照已下載。`
          : `Master import complete: ${result.newRecords} added, ${result.updatedRecords} updated. A pre-import safety snapshot was downloaded.`,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Master import failed. Existing data was left in place.",
      );
    }
  };
  const requestPersistentStorage = async () => {
    try {
      setError("");
      if (!navigator.storage?.persist)
        throw new Error("Persistent storage is not supported by this browser.");
      const persisted = await navigator.storage.persist();
      setStorage((current) => ({ ...current, persisted }));
      setMessage(
        persisted
          ? locale === "zh-TW"
            ? "瀏覽器已授予持久儲存；仍請定期匯出備份。"
            : "Persistent storage granted. Keep exporting backups regularly."
          : locale === "zh-TW"
            ? "瀏覽器目前未授予持久儲存；請安裝 PWA、持續使用並定期匯出備份。"
            : "Persistent storage was not granted. Install the PWA, keep using it and export backups regularly.",
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Persistent storage request failed.",
      );
    }
  };
  return (
    <Localize>
    <div className="app-grid">
      <section className="app-card">
        <h2>Storage health</h2>
        <p>App version: {APP_VERSION}</p>
        <p>Database schema: {DB_SCHEMA_VERSION}</p>
        <p>
          Storage used: {(storage.usage / 1024).toFixed(1)} KB of{" "}
          {storage.quota
            ? (storage.quota / 1024 / 1024).toFixed(0) + " MB"
            : "browser-managed quota"}
        </p>
        <p>
          Persistent storage:{" "}
          {storage.persisted ? "Granted" : "Not guaranteed by this browser"}
        </p>
        {!storage.persisted && (
          <button className="secondary" onClick={requestPersistentStorage}>
            Request durable storage
          </button>
        )}
        <p>
          Records:{" "}
          {Object.values(data).reduce((sum, items) => sum + items.length, 0)}
        </p>
        <p>
          Last backup:{" "}
          {lastBackup
            ? dateTime(lastBackup)
            : "No successful export recorded"}
        </p>
        {(backupDays === null || backupDays >= 7) && (
          <p className="app-warning" role="status">
            {backupDays === null
              ? "No recovery backup yet. Export JSON before adding irreplaceable records."
              : `Your last recovery backup is ${backupDays} days old. Export a fresh JSON backup.`}
          </p>
        )}
        <p>
          Last restore:{" "}
          {data.settings.find((item) => item.id === "lastRestore")?.value
            ? dateTime(
                data.settings.find((item) => item.id === "lastRestore")!.value,
              )
            : "None"}
        </p>
      </section>
      <section className="app-card master-table-card">
        <h2>Household master table</h2>
        <p>
          Export one UTF-8 CSV for spreadsheet review and bulk editing. Import
          it back only after the preview is clean. CSV does not replace the
          complete JSON backup.
        </p>
        <div className="app-actions">
          <button onClick={exportMaster}>Export master CSV</button>
          <button
            className="secondary"
            onClick={() =>
              downloadFile(
                "familyboard-master-template.csv",
                emptyMasterTableTemplate(),
                "text/csv;charset=utf-8",
              )
            }
          >
            Download blank template
          </button>
        </div>
        <p className="help">
          Supported record types: member, asset, maintenance_task,
          maintenance_event, task, event, warranty, subscription, contact,
          document, attachment and handoff_profile. Keep the format and
          recordType columns unchanged.
        </p>
        <FilePicker
          label="Import master CSV for preview"
          accept="text/csv,.csv"
          onChange={readMaster}
        />
        {masterTable && masterPreview && (
          <div className="import-preview" aria-live="polite">
            <h3>Import preview</h3>
            <p>
              {locale === "zh-TW"
                ? `${masterFileName} · ${masterPreview.totalRows} 列 · 新增 ${masterPreview.newRecords} 筆 · 更新 ${masterPreview.updatedRecords} 筆 · 略過 ${masterPreview.skippedHouseholds} 筆家庭描述`
                : `${masterFileName} · ${masterPreview.totalRows} rows · ${masterPreview.newRecords} new · ${masterPreview.updatedRecords} updates · ${masterPreview.skippedHouseholds} household descriptor skipped`}
            </p>
            <label>
              Import behavior
              <select
                value={masterMode}
                onChange={(event) =>
                  setMasterMode(event.target.value as MasterImportMode)
                }
              >
                <option value="merge">Merge and update by stable record ID</option>
                <option value="append">Add copies with new record IDs</option>
              </select>
            </label>
            {masterTable.warnings.map((warning) => (
              <p className="app-warning" key={warning}>
                {warning}
              </p>
            ))}
            {masterPreview.errors.length > 0 && (
              <div className="app-error" role="alert">
                <strong>Fix these rows before importing:</strong>
                <ul>
                  {masterPreview.errors.slice(0, 12).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              disabled={
                masterPreview.totalRows === 0 || masterPreview.errors.length > 0
              }
              onClick={applyMaster}
            >
              Download safety snapshot and import
            </button>
          </div>
        )}
      </section>
      <section className="app-card">
        <h2>Export backup</h2>
        <p>
          Plain JSON is portable but readable. Encrypted export uses
          PBKDF2-SHA-256 and AES-256-GCM in your browser.
        </p>
        <label>
          Encryption password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <div className="app-actions">
          <button onClick={() => exportData(false)}>Export JSON</button>
          <button className="secondary" onClick={() => exportData(true)}>
            Export encrypted
          </button>
        </div>
        <p className="help">
          A forgotten encrypted-backup password cannot be recovered.
        </p>
      </section>
      <section className="app-card">
        <h2>Restore backup</h2>
        <label>
          Mode
          <select
            value={mode}
            onChange={(event) =>
              setMode(event.target.value as "merge" | "replace")
            }
          >
            <option value="merge">Merge by record ID</option>
            <option value="replace">Replace after safety snapshot</option>
          </select>
        </label>
        <label>
          Password for encrypted file
          <input
            type="password"
            value={restorePassword}
            onChange={(event) => setRestorePassword(event.target.value)}
          />
        </label>
        <FilePicker
          label="Validate backup without restoring"
          accept="application/json,.json"
          onChange={validate}
        />
        {validation && (
          <p className="app-success" role="status">
            {validation}
          </p>
        )}
        <FilePicker
          label="Choose backup"
          accept="application/json,.json"
          onChange={restore}
        />
      </section>
      <section className="app-card danger-zone">
        <h2>Reset local household</h2>
        <p>
          This removes all FamilyBoard data in this browser. Export a backup
          first.
        </p>
        <label>
          Type “{householdName}” to confirm
          <input
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </label>
        <div className="app-actions">
          <button
            disabled={confirm !== householdName}
            onClick={async () => {
              await clearDatabase();
              location.reload();
            }}
          >
            Delete local data
          </button>
        </div>
      </section>
      {error && (
        <p className="app-error" role="alert">
          {error}
        </p>
      )}
    </div>
    </Localize>
  );
}
