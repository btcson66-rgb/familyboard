export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  householdId: string;
}
export interface Household {
  id: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  name: string;
}
export interface Member extends BaseRecord {
  name: string;
  role: string;
  archived?: boolean;
}
export interface Asset extends BaseRecord {
  name: string;
  category: string;
  location: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice?: number;
  seller?: string;
  installedDate?: string;
  manualReference?: string;
  status: "active" | "watch" | "archived";
  notes: string;
}
export interface MaintenanceTask extends BaseRecord {
  title: string;
  assetId: string;
  homeArea: string;
  ownerMemberId: string;
  triggerType: "date" | "interval-after-completion" | "seasonal" | "manual";
  nextDue: string;
  intervalMonths: number;
  priority: "low" | "normal" | "high";
  instructionsSource: string;
  notes: string;
}
export interface MaintenanceEvent extends BaseRecord {
  maintenanceTaskId: string;
  completedAt: string;
  completedBy: string;
  providerId?: string;
  cost: number;
  notes: string;
}
export interface HouseholdTask extends BaseRecord {
  title: string;
  ownerMemberId: string;
  dueDate: string;
  recurrence: string;
  completedAt: string;
  notes: string;
}
export interface HouseholdEvent extends BaseRecord {
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  notes: string;
}
export interface Warranty extends BaseRecord {
  assetId: string;
  provider: string;
  startsAt: string;
  endsAt: string;
  receiptReference: string;
  termsReference: string;
  notes: string;
}
export interface Subscription extends BaseRecord {
  name: string;
  category: string;
  cost: number;
  currency: string;
  billingFrequency: string;
  nextRenewal: string;
  reviewBeforeDays: number;
  ownerMemberId: string;
  managementUrl: string;
  paymentMethodNote: string;
  notes: string;
  status: "active" | "review" | "cancelled";
}
export interface Contact extends BaseRecord {
  name: string;
  category: string;
  phone: string;
  email: string;
  notes: string;
  sensitive: boolean;
}
export interface DocumentRecord extends BaseRecord {
  name: string;
  category: string;
  locationReference: string;
  relatedAssetId: string;
  reviewDate: string;
  notes: string;
}
export interface AttachmentMetadata extends BaseRecord {
  name: string;
  mimeType: string;
  size: number;
  locationReference: string;
}
export interface HandoffProfile extends BaseRecord {
  name: string;
  purpose: string;
  includeTasks: boolean;
  includeMaintenance: boolean;
  includeContacts: boolean;
  includeDocuments?: boolean;
  notes: string;
}
export interface Setting {
  id: string;
  value: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

export interface MigrationRecord {
  id: string;
  appliedAt: string;
  fromVersion: number;
  toVersion: number;
}

export interface AppSnapshot {
  households: Household[];
  members: Member[];
  assets: Asset[];
  maintenanceTasks: MaintenanceTask[];
  maintenanceEvents: MaintenanceEvent[];
  tasks: HouseholdTask[];
  events: HouseholdEvent[];
  warranties: Warranty[];
  subscriptions: Subscription[];
  contacts: Contact[];
  documents: DocumentRecord[];
  attachmentsMetadata: AttachmentMetadata[];
  handoffProfiles: HandoffProfile[];
  settings: Setting[];
  migrations: MigrationRecord[];
}
