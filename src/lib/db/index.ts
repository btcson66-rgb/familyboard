import Dexie, { type EntityTable } from 'dexie';
import type { AppSnapshot, Asset, Contact, DocumentRecord, HandoffProfile, Household, HouseholdEvent, HouseholdTask, MaintenanceEvent, MaintenanceTask, Member, Setting, Subscription, Warranty } from './types';

export const DB_SCHEMA_VERSION = 1;

export class FamilyBoardDB extends Dexie {
  households!: EntityTable<Household, 'id'>;
  members!: EntityTable<Member, 'id'>;
  assets!: EntityTable<Asset, 'id'>;
  maintenanceTasks!: EntityTable<MaintenanceTask, 'id'>;
  maintenanceEvents!: EntityTable<MaintenanceEvent, 'id'>;
  tasks!: EntityTable<HouseholdTask, 'id'>;
  events!: EntityTable<HouseholdEvent, 'id'>;
  warranties!: EntityTable<Warranty, 'id'>;
  subscriptions!: EntityTable<Subscription, 'id'>;
  contacts!: EntityTable<Contact, 'id'>;
  documents!: EntityTable<DocumentRecord, 'id'>;
  handoffProfiles!: EntityTable<HandoffProfile, 'id'>;
  settings!: EntityTable<Setting, 'id'>;

  constructor(name = 'familyboard') {
    super(name);
    this.version(1).stores({
      households: 'id, updatedAt',
      members: 'id, householdId, name, updatedAt',
      assets: 'id, householdId, category, location, status, updatedAt',
      maintenanceTasks: 'id, householdId, assetId, nextDue, priority, updatedAt',
      maintenanceEvents: 'id, householdId, maintenanceTaskId, completedAt',
      tasks: 'id, householdId, dueDate, ownerMemberId, completedAt, updatedAt',
      events: 'id, householdId, startsAt, updatedAt',
      warranties: 'id, householdId, assetId, endsAt, updatedAt',
      subscriptions: 'id, householdId, nextRenewal, status, updatedAt',
      contacts: 'id, householdId, category, sensitive, updatedAt',
      documents: 'id, householdId, category, relatedAssetId, reviewDate, updatedAt',
      handoffProfiles: 'id, householdId, updatedAt',
      settings: 'id, updatedAt'
    });
  }
}

export const db = new FamilyBoardDB();
export const now = () => new Date().toISOString();
export const uid = () => crypto.randomUUID();
export const base = (householdId: string) => ({ id: uid(), householdId, createdAt: now(), updatedAt: now(), schemaVersion: DB_SCHEMA_VERSION });

export async function snapshot(database = db): Promise<AppSnapshot> {
  const [households, members, assets, maintenanceTasks, maintenanceEvents, tasks, events, warranties, subscriptions, contacts, documents, handoffProfiles, settings] = await Promise.all([
    database.households.toArray(), database.members.toArray(), database.assets.toArray(), database.maintenanceTasks.toArray(), database.maintenanceEvents.toArray(), database.tasks.toArray(), database.events.toArray(), database.warranties.toArray(), database.subscriptions.toArray(), database.contacts.toArray(), database.documents.toArray(), database.handoffProfiles.toArray(), database.settings.toArray()
  ]);
  return { households, members, assets, maintenanceTasks, maintenanceEvents, tasks, events, warranties, subscriptions, contacts, documents, handoffProfiles, settings };
}

export async function clearDatabase(database = db) {
  await database.transaction('rw', database.tables, async () => Promise.all(database.tables.map((table) => table.clear())));
}

