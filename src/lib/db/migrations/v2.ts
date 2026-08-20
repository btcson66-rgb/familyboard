import type { Transaction } from "dexie";

const now = () => new Date().toISOString();

export async function upgradeToV2(transaction: Transaction) {
  const appliedAt = now();
  for (const tableName of transaction.db.tables.map((table) => table.name)) {
    if (["migrations"].includes(tableName)) continue;
    await transaction
      .table(tableName)
      .toCollection()
      .modify((record) => {
        record.createdAt ||= record.updatedAt || appliedAt;
        record.updatedAt ||= appliedAt;
        record.schemaVersion = 2;
      });
  }
  await transaction.table("migrations").put({
    id: "schema-2",
    appliedAt,
    fromVersion: 1,
    toVersion: 2,
  });
}
