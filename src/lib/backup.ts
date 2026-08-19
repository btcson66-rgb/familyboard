import { z } from 'zod';
import { DB_SCHEMA_VERSION, db, snapshot } from './db';
import type { AppSnapshot } from './db/types';

const record = z.object({ id: z.string().min(1), createdAt: z.string(), updatedAt: z.string(), schemaVersion: z.number(), householdId: z.string().min(1) }).passthrough();
const household = z.object({ id: z.string().min(1), name: z.string().min(1), createdAt: z.string(), updatedAt: z.string(), schemaVersion: z.number() }).passthrough();
const setting = z.object({ id: z.string(), value: z.string(), updatedAt: z.string() });
const payloadSchema = z.object({
  format: z.literal('familyboard-backup'), formatVersion: z.literal(1), appVersion: z.string(), exportedAt: z.string(), schemaVersion: z.number(),
  data: z.object({
    households: z.array(household), members: z.array(record), assets: z.array(record), maintenanceTasks: z.array(record), maintenanceEvents: z.array(record), tasks: z.array(record), events: z.array(record), warranties: z.array(record), subscriptions: z.array(record), contacts: z.array(record), documents: z.array(record), handoffProfiles: z.array(record), settings: z.array(setting)
  })
});

export type BackupPackage = z.infer<typeof payloadSchema>;

export async function createBackup(): Promise<BackupPackage> {
  return { format: 'familyboard-backup', formatVersion: 1, appVersion: '1.0.0', exportedAt: new Date().toISOString(), schemaVersion: DB_SCHEMA_VERSION, data: await snapshot() } as unknown as BackupPackage;
}

export function parseBackup(value: unknown): BackupPackage { return payloadSchema.parse(value); }

export async function restoreBackup(value: unknown, mode: 'replace' | 'merge' = 'merge') {
  const parsed = parseBackup(value);
  const data = parsed.data as unknown as AppSnapshot;
  await db.transaction('rw', db.tables, async () => {
    if (mode === 'replace') await Promise.all(db.tables.map((table) => table.clear()));
    await db.households.bulkPut(data.households);
    await db.members.bulkPut(data.members);
    await db.assets.bulkPut(data.assets);
    await db.maintenanceTasks.bulkPut(data.maintenanceTasks);
    await db.maintenanceEvents.bulkPut(data.maintenanceEvents);
    await db.tasks.bulkPut(data.tasks);
    await db.events.bulkPut(data.events);
    await db.warranties.bulkPut(data.warranties);
    await db.subscriptions.bulkPut(data.subscriptions);
    await db.contacts.bulkPut(data.contacts);
    await db.documents.bulkPut(data.documents);
    await db.handoffProfiles.bulkPut(data.handoffProfiles);
    await db.settings.bulkPut(data.settings);
  });
  return parsed;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

export async function encryptBackup(backup: BackupPackage, password: string) {
  if (password.length < 10) throw new Error('Use at least 10 characters for an encrypted backup password.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(backup)));
  return { format: 'familyboard-encrypted-backup', formatVersion: 1, kdf: 'PBKDF2-SHA256', iterations: 310000, cipher: 'AES-256-GCM', salt: toBase64(salt), iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ciphertext)) };
}

export async function decryptBackup(value: unknown, password: string): Promise<BackupPackage> {
  const encrypted = z.object({ format: z.literal('familyboard-encrypted-backup'), formatVersion: z.literal(1), iterations: z.number(), salt: z.string(), iv: z.string(), ciphertext: z.string() }).parse(value);
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: fromBase64(encrypted.salt), iterations: encrypted.iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(encrypted.iv) }, key, fromBase64(encrypted.ciphertext));
  return parseBackup(JSON.parse(decoder.decode(plaintext)));
}
