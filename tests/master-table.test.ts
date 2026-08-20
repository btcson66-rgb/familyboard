import { describe, expect, it } from "vitest";
import { FamilyBoardDB, base, snapshot } from "../src/lib/db";
import {
  MASTER_TABLE_FORMAT,
  emptyMasterTableTemplate,
  exportMasterTable,
  importMasterTable,
  parseMasterTable,
  previewMasterImport,
} from "../src/lib/master-table";

const stamp = "2026-08-20T00:00:00.000Z";
const household = {
  id: "home-1",
  name: "Our, Home",
  createdAt: stamp,
  updatedAt: stamp,
  schemaVersion: 2,
};

describe("FamilyBoard master CSV", () => {
  it("round-trips user records with UTF-8, quotes and spreadsheet protection", async () => {
    const source = new FamilyBoardDB(`master-source-${crypto.randomUUID()}`);
    await source.households.add(household);
    await source.assets.add({
      ...base(household.id),
      id: "asset-1",
      name: '=HYPERLINK("https://example.invalid")',
      category: "家電",
      location: "Kitchen, north",
      brand: "A \"quoted\" brand",
      model: "M1",
      serialNumber: "S1",
      purchaseDate: "2026-08-20",
      purchasePrice: 12.5,
      status: "active",
      notes: "line one\nline two",
    });
    await source.contacts.add({
      ...base(household.id),
      id: "contact-1",
      name: "  =1+1",
      category: "Test contact",
      phone: "",
      email: "",
      notes: "",
      sensitive: false,
    });
    const csv = exportMasterTable(await snapshot(source), household.id);
    expect(csv).toContain("familyboard-master-v1");
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("'  =1+1");
    const parsed = parseMasterTable(csv);
    expect(parsed.errors).toEqual([]);
    expect(parsed.counts).toMatchObject({ household: 1, asset: 1, contact: 1 });

    const target = new FamilyBoardDB(`master-target-${crypto.randomUUID()}`);
    await target.households.add({ ...household, id: "target-home" });
    const preview = previewMasterImport(
      parsed,
      "merge",
      await snapshot(target),
      "target-home",
    );
    expect(preview).toMatchObject({
      totalRows: 3,
      newRecords: 2,
      updatedRecords: 0,
      skippedHouseholds: 1,
    });
    await importMasterTable(parsed, "merge", "target-home", target);
    expect(await target.assets.get("asset-1")).toMatchObject({
      householdId: "target-home",
      name: '=HYPERLINK("https://example.invalid")',
      location: "Kitchen, north",
      notes: "line one\nline two",
    });
    await source.delete();
    await target.delete();
  });

  it("merges by stable ID and append mode remaps relationships", async () => {
    const source = new FamilyBoardDB(`master-rel-source-${crypto.randomUUID()}`);
    await source.households.add(household);
    await source.assets.add({
      ...base(household.id),
      id: "asset-1",
      name: "Boiler",
      category: "System",
      location: "Basement",
      brand: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      status: "active",
      notes: "",
    });
    await source.maintenanceTasks.add({
      ...base(household.id),
      id: "maintenance-1",
      title: "Inspect boiler",
      assetId: "asset-1",
      homeArea: "Basement",
      ownerMemberId: "",
      triggerType: "date",
      nextDue: "2026-09-01",
      intervalMonths: 12,
      priority: "high",
      instructionsSource: "Manual",
      notes: "",
    });
    const parsed = parseMasterTable(
      exportMasterTable(await snapshot(source), household.id),
    );

    const target = new FamilyBoardDB(`master-rel-target-${crypto.randomUUID()}`);
    await target.households.add({ ...household, id: "target-home" });
    await target.assets.add({
      ...(await source.assets.get("asset-1"))!,
      householdId: "target-home",
      name: "Old boiler name",
    });
    const mergePreview = previewMasterImport(
      parsed,
      "merge",
      await snapshot(target),
      "target-home",
    );
    expect(mergePreview).toMatchObject({ updatedRecords: 1, newRecords: 1 });
    await importMasterTable(parsed, "merge", "target-home", target);
    expect((await target.assets.get("asset-1"))?.name).toBe("Boiler");

    await importMasterTable(parsed, "append", "target-home", target);
    const assets = await target.assets.toArray();
    const tasks = await target.maintenanceTasks.toArray();
    expect(assets).toHaveLength(2);
    expect(tasks).toHaveLength(2);
    const appendedAsset = assets.find((item) => item.id !== "asset-1")!;
    const appendedTask = tasks.find((item) => item.id !== "maintenance-1")!;
    expect(appendedTask.assetId).toBe(appendedAsset.id);
    await source.delete();
    await target.delete();
  });

  it("reports row errors before any import", () => {
    const csv = [
      "format,recordType,id,name,status",
      `${MASTER_TABLE_FORMAT},asset,same,,invalid`,
      `${MASTER_TABLE_FORMAT},asset,same,Valid,active`,
      `${MASTER_TABLE_FORMAT},unknown,x,Nope,active`,
    ].join("\n");
    const parsed = parseMasterTable(csv);
    expect(parsed.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("asset.name is required"),
        expect.stringContaining("status must be one of"),
        expect.stringContaining("duplicates row"),
        expect.stringContaining("unsupported recordType"),
      ]),
    );
  });

  it("blocks dangling relationships during preview", async () => {
    const csv = [
      "format,recordType,id,householdId,title,assetId,triggerType,priority",
      `${MASTER_TABLE_FORMAT},maintenance_task,m1,source-home,Inspect missing asset,missing-asset,date,normal`,
    ].join("\n");
    const parsed = parseMasterTable(csv);
    const target = new FamilyBoardDB(`master-dangling-${crypto.randomUUID()}`);
    await target.households.add({ ...household, id: "target-home" });
    const preview = previewMasterImport(
      parsed,
      "merge",
      await snapshot(target),
      "target-home",
    );
    expect(preview.errors).toContainEqual(
      expect.stringContaining("assetId references a missing assets record"),
    );
    await expect(
      importMasterTable(parsed, "merge", "target-home", target),
    ).rejects.toThrow(/Fix every CSV validation error/);
    expect(await target.maintenanceTasks.count()).toBe(0);
    await target.delete();
  });

  it("provides a UTF-8 template with all required headers", () => {
    const template = emptyMasterTableTemplate();
    expect(template.startsWith("\uFEFFformat,recordType,id,householdId")).toBe(
      true,
    );
    expect(parseMasterTable(template)).toMatchObject({ rows: [], errors: [] });
  });
});
