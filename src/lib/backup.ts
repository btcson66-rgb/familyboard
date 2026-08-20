import { z } from "zod";
import { APP_VERSION } from "../config/app";
import { DB_SCHEMA_VERSION, db, snapshot, type FamilyBoardDB } from "./db";
import type { AppSnapshot } from "./db/types";

const record = z
  .object({
    id: z.string().min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
    schemaVersion: z.number(),
    householdId: z.string().min(1),
  })
  .passthrough();
const household = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
    schemaVersion: z.number(),
  })
  .passthrough();
const setting = z.object({
  id: z.string().min(1),
  value: z.string(),
  createdAt: z.string().default(""),
  updatedAt: z.string(),
  schemaVersion: z.number().default(1),
});
const migration = z.object({
  id: z.string().min(1),
  appliedAt: z.string(),
  fromVersion: z.number(),
  toVersion: z.number(),
});
const payloadSchema = z.object({
  format: z.literal("familyboard-backup"),
  formatVersion: z.literal(1),
  appVersion: z.string(),
  exportedAt: z.string(),
  schemaVersion: z.number(),
  data: z.object({
    households: z.array(household),
    members: z.array(record),
    assets: z.array(record),
    maintenanceTasks: z.array(record),
    maintenanceEvents: z.array(record),
    tasks: z.array(record),
    events: z.array(record),
    warranties: z.array(record),
    subscriptions: z.array(record),
    contacts: z.array(record),
    documents: z.array(record),
    attachmentsMetadata: z.array(record).default([]),
    handoffProfiles: z.array(record),
    settings: z.array(setting),
    migrations: z.array(migration).default([]),
  }),
});

export type BackupPackage = z.infer<typeof payloadSchema>;

export async function createBackup(
  database: FamilyBoardDB = db,
): Promise<BackupPackage> {
  return {
    format: "familyboard-backup",
    formatVersion: 1,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    schemaVersion: DB_SCHEMA_VERSION,
    data: (await snapshot(database)) as unknown as BackupPackage["data"],
  };
}

export function parseBackup(value: unknown): BackupPackage {
  const parsed = payloadSchema.parse(value);
  if (parsed.schemaVersion > DB_SCHEMA_VERSION) {
    throw new Error(
      `This backup uses database schema ${parsed.schemaVersion}; this app supports up to ${DB_SCHEMA_VERSION}. Update FamilyBoard before restoring it.`,
    );
  }
  return parsed;
}

export function summarizeBackup(value: unknown) {
  const parsed = parseBackup(value);
  const counts = Object.fromEntries(
    Object.entries(parsed.data).map(([name, rows]) => [name, rows.length]),
  );
  return {
    appVersion: parsed.appVersion,
    schemaVersion: parsed.schemaVersion,
    exportedAt: parsed.exportedAt,
    counts,
    totalRecords: Object.values(counts).reduce((sum, count) => sum + count, 0),
  };
}

export async function restoreBackup(
  value: unknown,
  mode: "replace" | "merge" = "merge",
  database: FamilyBoardDB = db,
) {
  const parsed = parseBackup(value);
  const data = parsed.data as unknown as AppSnapshot;
  await database.transaction("rw", database.tables, async () => {
    if (mode === "replace")
      await Promise.all(database.tables.map((table) => table.clear()));
    await database.households.bulkPut(data.households);
    await database.members.bulkPut(data.members);
    await database.assets.bulkPut(data.assets);
    await database.maintenanceTasks.bulkPut(data.maintenanceTasks);
    await database.maintenanceEvents.bulkPut(data.maintenanceEvents);
    await database.tasks.bulkPut(data.tasks);
    await database.events.bulkPut(data.events);
    await database.warranties.bulkPut(data.warranties);
    await database.subscriptions.bulkPut(data.subscriptions);
    await database.contacts.bulkPut(data.contacts);
    await database.documents.bulkPut(data.documents);
    await database.attachmentsMetadata.bulkPut(data.attachmentsMetadata);
    await database.handoffProfiles.bulkPut(data.handoffProfiles);
    await database.settings.bulkPut(data.settings);
    await database.migrations.bulkPut(data.migrations);
  });
  return parsed;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const authenticatedMetadata = encoder.encode(
  "familyboard-encrypted-backup:v1:PBKDF2-SHA256:AES-256-GCM:310000",
);
const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (value: string) =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

export async function encryptBackup(backup: BackupPackage, password: string) {
  if (password.length < 10)
    throw new Error(
      "Use at least 10 characters for an encrypted backup password.",
    );
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: authenticatedMetadata },
    key,
    encoder.encode(JSON.stringify(backup)),
  );
  return {
    format: "familyboard-encrypted-backup" as const,
    formatVersion: 1 as const,
    kdf: "PBKDF2-SHA256" as const,
    iterations: 310000 as const,
    cipher: "AES-256-GCM" as const,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  };
}

export async function decryptBackup(
  value: unknown,
  password: string,
): Promise<BackupPackage> {
  const encrypted = z
    .object({
      format: z.literal("familyboard-encrypted-backup"),
      formatVersion: z.literal(1),
      kdf: z.literal("PBKDF2-SHA256"),
      iterations: z.literal(310000),
      cipher: z.literal("AES-256-GCM"),
      salt: z.string(),
      iv: z.string(),
      ciphertext: z.string(),
    })
    .parse(value);
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: fromBase64(encrypted.salt),
      iterations: encrypted.iterations,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: fromBase64(encrypted.iv),
      additionalData: authenticatedMetadata,
    },
    key,
    fromBase64(encrypted.ciphertext),
  );
  return parseBackup(JSON.parse(decoder.decode(plaintext)));
}
