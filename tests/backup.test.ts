import Dexie, { type EntityTable } from "dexie";
import { describe, expect, it } from "vitest";
import { FamilyBoardDB, DB_SCHEMA_VERSION, snapshot } from "../src/lib/db";
import {
  createBackup,
  decryptBackup,
  encryptBackup,
  parseBackup,
  restoreBackup,
  summarizeBackup,
  type BackupPackage,
} from "../src/lib/backup";
import { buildHandoffSnapshot } from "../src/lib/handoff";

const stamp = "2026-08-19T00:00:00.000Z";
const common = {
  createdAt: stamp,
  updatedAt: stamp,
  schemaVersion: 2,
  householdId: "h1",
};
const emptyData = () => ({
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
});
const packageWith = (data: ReturnType<typeof emptyData>): BackupPackage =>
  ({
    format: "familyboard-backup",
    formatVersion: 1,
    appVersion: "1.0.2",
    exportedAt: stamp,
    schemaVersion: DB_SCHEMA_VERSION,
    data,
  }) as BackupPackage;

describe("local database and backups", () => {
  it("upgrades a version 1 database without losing records", async () => {
    const name = `migration-${crypto.randomUUID()}`;
    class LegacyDB extends Dexie {
      households!: EntityTable<Record<string, unknown>, "id">;
      settings!: EntityTable<Record<string, unknown>, "id">;
      constructor() {
        super(name);
        this.version(1).stores({
          households: "id, updatedAt",
          settings: "id, updatedAt",
        });
      }
    }
    const legacy = new LegacyDB();
    await legacy.households.put({
      id: "h1",
      name: "Kept home",
      createdAt: stamp,
      updatedAt: stamp,
      schemaVersion: 1,
    });
    await legacy.settings.put({
      id: "lastBackup",
      value: stamp,
      updatedAt: stamp,
    });
    legacy.close();

    const upgraded = new FamilyBoardDB(name);
    const data = await snapshot(upgraded);
    expect(data.households[0]).toMatchObject({
      name: "Kept home",
      schemaVersion: 2,
    });
    expect(data.settings[0]).toMatchObject({
      createdAt: stamp,
      schemaVersion: 2,
    });
    expect(data.migrations).toContainEqual(
      expect.objectContaining({ id: "schema-2", toVersion: 2 }),
    );
    await upgraded.delete();
  });

  it("creates, summarizes, merges and replaces a portable backup", async () => {
    const source = new FamilyBoardDB(`source-${crypto.randomUUID()}`);
    await source.households.add({
      id: "h1",
      name: "Source home",
      createdAt: stamp,
      updatedAt: stamp,
      schemaVersion: 2,
    });
    const backup = await createBackup(source);
    expect(summarizeBackup(backup)).toMatchObject({
      schemaVersion: 2,
      totalRecords: 1,
    });

    const target = new FamilyBoardDB(`target-${crypto.randomUUID()}`);
    await target.households.add({
      id: "old",
      name: "Old home",
      createdAt: stamp,
      updatedAt: stamp,
      schemaVersion: 2,
    });
    await restoreBackup(backup, "merge", target);
    expect(await target.households.count()).toBe(2);
    await restoreBackup(backup, "replace", target);
    expect((await target.households.toArray()).map((item) => item.id)).toEqual([
      "h1",
    ]);
    await source.delete();
    await target.delete();
  });

  it("round-trips every major table through replace restore", async () => {
    const data = emptyData();
    data.households.push({
      id: "h1",
      name: "Home",
      createdAt: stamp,
      updatedAt: stamp,
      schemaVersion: 2,
    } as never);
    for (const name of [
      "members",
      "assets",
      "maintenanceTasks",
      "maintenanceEvents",
      "tasks",
      "events",
      "warranties",
      "subscriptions",
      "contacts",
      "documents",
      "attachmentsMetadata",
      "handoffProfiles",
    ] as const) {
      data[name].push({ id: `${name}-1`, ...common } as never);
    }
    data.settings.push({
      id: "theme",
      value: "system",
      createdAt: stamp,
      updatedAt: stamp,
      schemaVersion: 2,
    } as never);
    const database = new FamilyBoardDB(`crud-${crypto.randomUUID()}`);
    await restoreBackup(packageWith(data), "replace", database);
    const restored = await snapshot(database);
    for (const [name, rows] of Object.entries(restored)) {
      if (name !== "migrations") expect(rows).toHaveLength(1);
    }
    await database.delete();
  });

  it("validates versions and encrypts with authenticated metadata", async () => {
    expect(() => parseBackup({ format: "wrong" })).toThrow();
    const newer = packageWith(emptyData());
    newer.schemaVersion = DB_SCHEMA_VERSION + 1;
    expect(() => parseBackup(newer)).toThrow(/Update FamilyBoard/);

    const backup = packageWith(emptyData());
    const encrypted = await encryptBackup(
      backup,
      "correct horse battery staple",
    );
    await expect(
      decryptBackup(encrypted, "correct horse battery staple"),
    ).resolves.toMatchObject({ format: "familyboard-backup" });
    await expect(decryptBackup(encrypted, "wrong password")).rejects.toThrow();
    await expect(
      decryptBackup(
        { ...encrypted, cipher: "AES-128-GCM" },
        "correct horse battery staple",
      ),
    ).rejects.toThrow();
  });

  it("filters sensitive handoff fields by profile", () => {
    const data = emptyData();
    data.tasks.push({ id: "open", ...common, completedAt: "" } as never);
    data.contacts.push({ id: "safe", ...common, sensitive: false } as never);
    data.contacts.push({ id: "private", ...common, sensitive: true } as never);
    data.documents.push({
      id: "doc",
      ...common,
      name: "Policy",
      notes: "secret",
    } as never);
    const handoff = buildHandoffSnapshot(data as never, {
      includeTasks: true,
      includeMaintenance: false,
      includeContacts: true,
      includeDocuments: true,
    });
    expect(handoff.contacts.map((item) => item.id)).toEqual(["safe"]);
    expect(handoff.documents[0]).not.toHaveProperty("notes");
  });
});
