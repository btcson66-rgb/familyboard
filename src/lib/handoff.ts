import type { AppSnapshot, HandoffProfile } from "./db/types";

export function buildHandoffSnapshot(
  data: AppSnapshot,
  profile?: Pick<
    HandoffProfile,
    | "includeTasks"
    | "includeMaintenance"
    | "includeContacts"
    | "includeDocuments"
  >,
) {
  const rules = profile ?? {
    includeTasks: true,
    includeMaintenance: true,
    includeContacts: true,
    includeDocuments: false,
  };
  return {
    tasks: rules.includeTasks
      ? data.tasks.filter((item) => !item.completedAt)
      : [],
    maintenanceTasks: rules.includeMaintenance ? data.maintenanceTasks : [],
    contacts: rules.includeContacts
      ? data.contacts.filter((item) => !item.sensitive)
      : [],
    documents: rules.includeDocuments
      ? data.documents.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          locationReference: item.locationReference,
          relatedAssetId: item.relatedAssetId,
          reviewDate: item.reviewDate,
        }))
      : [],
  };
}
