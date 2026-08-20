import type { Table } from "dexie";
import {
  DB_SCHEMA_VERSION,
  db,
  now,
  snapshot,
  uid,
  type FamilyBoardDB,
} from "./db";
import type { AppSnapshot } from "./db/types";

export const MASTER_TABLE_FORMAT = "familyboard-master-v1";
export const MASTER_TABLE_MAX_BYTES = 5 * 1024 * 1024;
export const MASTER_TABLE_MAX_ROWS = 5000;

export type MasterRecordType =
  | "household"
  | "member"
  | "asset"
  | "maintenance_task"
  | "maintenance_event"
  | "task"
  | "event"
  | "warranty"
  | "subscription"
  | "contact"
  | "document"
  | "attachment"
  | "handoff_profile";
export type MasterImportMode = "merge" | "append";

type ImportableCollection =
  | "households"
  | "members"
  | "assets"
  | "maintenanceTasks"
  | "maintenanceEvents"
  | "tasks"
  | "events"
  | "warranties"
  | "subscriptions"
  | "contacts"
  | "documents"
  | "attachmentsMetadata"
  | "handoffProfiles";

type FieldKind =
  | "string"
  | "number"
  | "boolean"
  | { enum: readonly string[] };

type RecordDefinition = {
  collection: ImportableCollection;
  fields: Record<string, FieldKind>;
  required: readonly string[];
  defaults?: Record<string, string | number | boolean>;
  references?: Record<string, ImportableCollection>;
};

const definitions: Record<MasterRecordType, RecordDefinition> = {
  household: {
    collection: "households",
    fields: { name: "string" },
    required: ["name"],
  },
  member: {
    collection: "members",
    fields: { name: "string", role: "string", archived: "boolean" },
    required: ["name"],
    defaults: { role: "Household member", archived: false },
  },
  asset: {
    collection: "assets",
    fields: {
      name: "string",
      category: "string",
      location: "string",
      brand: "string",
      model: "string",
      serialNumber: "string",
      purchaseDate: "string",
      purchasePrice: "number",
      seller: "string",
      installedDate: "string",
      manualReference: "string",
      status: { enum: ["active", "watch", "archived"] },
      notes: "string",
    },
    required: ["name"],
    defaults: { category: "Appliance", status: "active" },
  },
  maintenance_task: {
    collection: "maintenanceTasks",
    fields: {
      title: "string",
      assetId: "string",
      homeArea: "string",
      ownerMemberId: "string",
      triggerType: {
        enum: ["date", "interval-after-completion", "seasonal", "manual"],
      },
      nextDue: "string",
      intervalMonths: "number",
      priority: { enum: ["low", "normal", "high"] },
      instructionsSource: "string",
      notes: "string",
    },
    required: ["title"],
    defaults: {
      triggerType: "date",
      intervalMonths: 0,
      priority: "normal",
    },
    references: { assetId: "assets", ownerMemberId: "members" },
  },
  maintenance_event: {
    collection: "maintenanceEvents",
    fields: {
      maintenanceTaskId: "string",
      completedAt: "string",
      completedBy: "string",
      providerId: "string",
      cost: "number",
      notes: "string",
    },
    required: ["maintenanceTaskId", "completedAt"],
    defaults: { cost: 0 },
    references: {
      maintenanceTaskId: "maintenanceTasks",
      completedBy: "members",
      providerId: "contacts",
    },
  },
  task: {
    collection: "tasks",
    fields: {
      title: "string",
      ownerMemberId: "string",
      dueDate: "string",
      recurrence: "string",
      completedAt: "string",
      notes: "string",
    },
    required: ["title"],
    references: { ownerMemberId: "members" },
  },
  event: {
    collection: "events",
    fields: {
      title: "string",
      startsAt: "string",
      endsAt: "string",
      location: "string",
      notes: "string",
    },
    required: ["title"],
  },
  warranty: {
    collection: "warranties",
    fields: {
      assetId: "string",
      provider: "string",
      startsAt: "string",
      endsAt: "string",
      receiptReference: "string",
      termsReference: "string",
      notes: "string",
    },
    required: ["provider"],
    references: { assetId: "assets" },
  },
  subscription: {
    collection: "subscriptions",
    fields: {
      name: "string",
      category: "string",
      cost: "number",
      currency: "string",
      billingFrequency: "string",
      nextRenewal: "string",
      reviewBeforeDays: "number",
      ownerMemberId: "string",
      managementUrl: "string",
      paymentMethodNote: "string",
      notes: "string",
      status: { enum: ["active", "review", "cancelled"] },
    },
    required: ["name"],
    defaults: {
      category: "Household",
      cost: 0,
      currency: "USD",
      billingFrequency: "monthly",
      reviewBeforeDays: 30,
      status: "active",
    },
    references: { ownerMemberId: "members" },
  },
  contact: {
    collection: "contacts",
    fields: {
      name: "string",
      category: "string",
      phone: "string",
      email: "string",
      notes: "string",
      sensitive: "boolean",
    },
    required: ["name"],
    defaults: { category: "Household contact", sensitive: false },
  },
  document: {
    collection: "documents",
    fields: {
      name: "string",
      category: "string",
      locationReference: "string",
      relatedAssetId: "string",
      reviewDate: "string",
      notes: "string",
    },
    required: ["name"],
    defaults: { category: "Home record" },
    references: { relatedAssetId: "assets" },
  },
  attachment: {
    collection: "attachmentsMetadata",
    fields: {
      name: "string",
      mimeType: "string",
      size: "number",
      locationReference: "string",
    },
    required: ["name"],
    defaults: { size: 0 },
  },
  handoff_profile: {
    collection: "handoffProfiles",
    fields: {
      name: "string",
      purpose: "string",
      includeTasks: "boolean",
      includeMaintenance: "boolean",
      includeContacts: "boolean",
      includeDocuments: "boolean",
      notes: "string",
    },
    required: ["name"],
    defaults: {
      includeTasks: true,
      includeMaintenance: true,
      includeContacts: false,
      includeDocuments: false,
    },
  },
};

const recordTypes = Object.keys(definitions) as MasterRecordType[];
const metadataColumns = [
  "format",
  "recordType",
  "id",
  "householdId",
  "createdAt",
  "updatedAt",
  "schemaVersion",
] as const;
const fieldColumns = Array.from(
  new Set(recordTypes.flatMap((type) => Object.keys(definitions[type].fields))),
);
export const MASTER_TABLE_COLUMNS = [...metadataColumns, ...fieldColumns];

export type MasterTableRow = {
  rowNumber: number;
  recordType: MasterRecordType;
  values: Record<string, string>;
};

export type ParsedMasterTable = {
  rows: MasterTableRow[];
  counts: Partial<Record<MasterRecordType, number>>;
  errors: string[];
  warnings: string[];
};

export type MasterImportPreview = {
  totalRows: number;
  newRecords: number;
  updatedRecords: number;
  skippedHouseholds: number;
  counts: Partial<Record<MasterRecordType, number>>;
  errors: string[];
};

const stringify = (value: unknown) => {
  if (value === undefined || value === null) return "";
  return String(value);
};

const protectSpreadsheetCell = (value: string) =>
  /^[ \t\r]*[=+\-@]/.test(value) ? `'${value}` : value;
const unprotectSpreadsheetCell = (value: string) =>
  /^'[ \t\r]*[=+\-@]/.test(value) ? value.slice(1) : value;
const quoteCsv = (value: string) =>
  /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

function csvLine(values: unknown[]) {
  return values
    .map((value) => quoteCsv(protectSpreadsheetCell(stringify(value))))
    .join(",");
}

export function exportMasterTable(data: AppSnapshot, householdId: string) {
  const rows: string[] = [csvLine(MASTER_TABLE_COLUMNS)];
  for (const recordType of recordTypes) {
    const definition = definitions[recordType];
    const records = (data[definition.collection] as unknown as Record<
      string,
      unknown
    >[]).filter((record) =>
      recordType === "household"
        ? record.id === householdId
        : record.householdId === householdId,
    );
    for (const record of records) {
      const flat: Record<string, unknown> = {
        format: MASTER_TABLE_FORMAT,
        recordType,
        id: record.id,
        householdId:
          recordType === "household" ? householdId : record.householdId,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        schemaVersion: record.schemaVersion,
      };
      for (const field of Object.keys(definition.fields))
        flat[field] = record[field];
      rows.push(csvLine(MASTER_TABLE_COLUMNS.map((column) => flat[column])));
    }
  }
  return `\uFEFF${rows.join("\r\n")}\r\n`;
}

export function emptyMasterTableTemplate() {
  return `\uFEFF${csvLine(MASTER_TABLE_COLUMNS)}\r\n`;
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const input = text.replace(/^\uFEFF/, "");
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else cell += character;
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n") {
      row.push(cell.replace(/\r$/, ""));
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += character;
  }
  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  row.push(cell.replace(/\r$/, ""));
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

export function parseMasterTable(text: string): ParsedMasterTable {
  if (new TextEncoder().encode(text).byteLength > MASTER_TABLE_MAX_BYTES)
    throw new Error("Master CSV is larger than the 5 MB safety limit.");
  const csvRows = parseCsvRows(text);
  if (!csvRows.length) throw new Error("Master CSV is empty.");
  const headers = csvRows[0].map((value) => value.trim());
  const duplicateHeaders = headers.filter(
    (value, index) => value && headers.indexOf(value) !== index,
  );
  if (duplicateHeaders.length)
    throw new Error(`CSV contains duplicate columns: ${duplicateHeaders.join(", ")}`);
  for (const required of ["format", "recordType"])
    if (!headers.includes(required))
      throw new Error(`CSV is missing the required ${required} column.`);
  if (csvRows.length - 1 > MASTER_TABLE_MAX_ROWS)
    throw new Error(`Master CSV exceeds the ${MASTER_TABLE_MAX_ROWS}-row safety limit.`);

  const warnings = headers
    .filter((header) => header && !MASTER_TABLE_COLUMNS.includes(header))
    .map((header) => `Unknown column “${header}” was ignored.`);
  const errors: string[] = [];
  const rows: MasterTableRow[] = [];
  const counts: Partial<Record<MasterRecordType, number>> = {};
  const seenIds = new Map<string, number>();

  csvRows.slice(1).forEach((cells, offset) => {
    const rowNumber = offset + 2;
    const values = Object.fromEntries(
      headers.map((header, index) => [
        header,
        unprotectSpreadsheetCell(cells[index] ?? "").trim(),
      ]),
    );
    if (values.format !== MASTER_TABLE_FORMAT) {
      errors.push(
        `Row ${rowNumber}: format must be “${MASTER_TABLE_FORMAT}”.`,
      );
      return;
    }
    if (!recordTypes.includes(values.recordType as MasterRecordType)) {
      errors.push(
        `Row ${rowNumber}: unsupported recordType “${values.recordType || "(blank)"}”.`,
      );
      return;
    }
    const recordType = values.recordType as MasterRecordType;
    const definition = definitions[recordType];
    for (const field of definition.required)
      if (!values[field])
        errors.push(`Row ${rowNumber}: ${recordType}.${field} is required.`);
    const sourceId = values.id;
    if (sourceId) {
      const previousRow = seenIds.get(sourceId);
      if (previousRow)
        errors.push(
          `Row ${rowNumber}: record ID duplicates row ${previousRow}.`,
        );
      else seenIds.set(sourceId, rowNumber);
    }
    for (const [field, kind] of Object.entries(definition.fields)) {
      const value = values[field];
      if (!value) continue;
      if (kind === "number" && !Number.isFinite(Number(value)))
        errors.push(`Row ${rowNumber}: ${field} must be a number.`);
      else if (kind === "boolean" && !/^(true|false|yes|no|1|0)$/i.test(value))
        errors.push(`Row ${rowNumber}: ${field} must be true or false.`);
      else if (typeof kind === "object" && !kind.enum.includes(value))
        errors.push(
          `Row ${rowNumber}: ${field} must be one of ${kind.enum.join(", ")}.`,
        );
    }
    rows.push({ rowNumber, recordType, values });
    counts[recordType] = (counts[recordType] ?? 0) + 1;
  });
  return { rows, counts, errors, warnings };
}

const parseBoolean = (value: string | undefined, fallback = false) =>
  value ? /^(true|yes|1)$/i.test(value) : fallback;

function materialize(
  parsed: ParsedMasterTable,
  mode: MasterImportMode,
  data: AppSnapshot,
  householdId: string,
) {
  const errors = [...parsed.errors];
  const idMap = new Map<string, string>();
  const availableIds = new Map<ImportableCollection, Set<string>>();
  for (const recordType of recordTypes) {
    const collection = definitions[recordType].collection;
    if (availableIds.has(collection)) continue;
    availableIds.set(
      collection,
      new Set(
        (data[collection] as unknown as Record<string, unknown>[])
          .map((record) => record.id)
          .filter((id): id is string => typeof id === "string"),
      ),
    );
  }
  for (const row of parsed.rows) {
    const sourceId = row.values.id;
    if (row.recordType === "household") {
      if (sourceId) idMap.set(sourceId, householdId);
      continue;
    }
    const finalId = mode === "append" || !sourceId ? uid() : sourceId;
    if (sourceId) idMap.set(sourceId, finalId);
    availableIds.get(definitions[row.recordType].collection)?.add(finalId);
  }
  const records = new Map<ImportableCollection, Record<string, unknown>[]>();
  let newRecords = 0;
  let updatedRecords = 0;
  let skippedHouseholds = 0;

  for (const row of parsed.rows) {
    if (row.recordType === "household") {
      skippedHouseholds += 1;
      continue;
    }
    const definition = definitions[row.recordType];
    const id = idMap.get(row.values.id) ?? uid();
    const existing = (data[definition.collection] as unknown as Record<
      string,
      unknown
    >[]).some((record) => record.id === id);
    if (existing && mode === "merge") updatedRecords += 1;
    else newRecords += 1;
    const record: Record<string, unknown> = {
      id,
      householdId,
      createdAt: row.values.createdAt || now(),
      updatedAt: now(),
      schemaVersion: DB_SCHEMA_VERSION,
    };
    for (const [field, kind] of Object.entries(definition.fields)) {
      const fallback = definition.defaults?.[field];
      const raw = row.values[field];
      if (kind === "number")
        record[field] = raw ? Number(raw) : Number(fallback ?? 0);
      else if (kind === "boolean")
        record[field] = parseBoolean(raw, Boolean(fallback));
      else record[field] = raw || fallback || "";
    }
    for (const [reference, targetCollection] of Object.entries(
      definition.references ?? {},
    )) {
      const value = record[reference];
      if (typeof value === "string" && value) {
        const resolved = idMap.get(value) ?? value;
        record[reference] = resolved;
        if (!availableIds.get(targetCollection)?.has(resolved))
          errors.push(
            `Row ${row.rowNumber}: ${reference} references a missing ${targetCollection} record.`,
          );
      }
    }
    const collection = records.get(definition.collection) ?? [];
    collection.push(record);
    records.set(definition.collection, collection);
  }
  return {
    records,
    preview: {
      totalRows: parsed.rows.length,
      newRecords,
      updatedRecords,
      skippedHouseholds,
      counts: parsed.counts,
      errors,
    } satisfies MasterImportPreview,
  };
}

export function previewMasterImport(
  parsed: ParsedMasterTable,
  mode: MasterImportMode,
  data: AppSnapshot,
  householdId: string,
) {
  return materialize(parsed, mode, data, householdId).preview;
}

export async function importMasterTable(
  parsed: ParsedMasterTable,
  mode: MasterImportMode,
  householdId: string,
  database: FamilyBoardDB = db,
) {
  const current = await snapshot(database);
  const prepared = materialize(parsed, mode, current, householdId);
  if (prepared.preview.errors.length)
    throw new Error("Fix every CSV validation error before importing.");
  await database.transaction("rw", database.tables, async () => {
    for (const [collection, records] of prepared.records) {
      if (!records.length) continue;
      await (database[collection] as unknown as Table).bulkPut(records);
    }
  });
  return prepared.preview;
}
