import { TrustedSeller, ScamRecord, PendingReport, ScamType } from '../types';
import {
  DEFAULT_ADMIN_PASSWORDS,
  DEFAULT_TRUSTED_SELLERS,
  DEFAULT_SCAM_RECORDS,
  DEFAULT_PENDING_REPORTS,
} from '../data/defaultData';

const STORAGE_KEYS = {
  PASSWORDS: 'ff_admin_passwords',
  SELLERS: 'ff_sellers',
  SCAMS: 'ff_scams',
  PENDING: 'ff_pending',
};

// Admin Passwords
export function getAdminPasswords(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(DEFAULT_ADMIN_PASSWORDS));
      return DEFAULT_ADMIN_PASSWORDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(DEFAULT_ADMIN_PASSWORDS));
    return DEFAULT_ADMIN_PASSWORDS;
  } catch {
    return DEFAULT_ADMIN_PASSWORDS;
  }
}

export function saveAdminPasswords(passwords: string[]): boolean {
  if (!passwords || passwords.length === 0) {
    return false; // Must keep at least 1 password
  }
  const unique = Array.from(new Set(passwords.map((p) => p.trim()).filter(Boolean)));
  if (unique.length === 0) return false;
  localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(unique));
  return true;
}

export function addAdminPassword(newPassword: string): { success: boolean; message: string } {
  const trimmed = newPassword.trim();
  if (!trimmed) return { success: false, message: 'Password cannot be empty.' };
  if (trimmed.length < 4) return { success: false, message: 'Password must be at least 4 characters.' };
  
  const current = getAdminPasswords();
  if (current.includes(trimmed)) {
    return { success: false, message: 'This password already exists.' };
  }
  
  current.push(trimmed);
  saveAdminPasswords(current);
  return { success: true, message: 'Admin password added successfully.' };
}

export function deleteAdminPassword(passwordToDelete: string): { success: boolean; message: string } {
  const current = getAdminPasswords();
  if (current.length <= 1) {
    return { success: false, message: 'Cannot delete: You must keep at least 1 admin password!' };
  }
  
  const updated = current.filter((p) => p !== passwordToDelete);
  if (updated.length === current.length) {
    return { success: false, message: 'Password not found.' };
  }
  
  saveAdminPasswords(updated);
  return { success: true, message: 'Password removed successfully.' };
}

export function verifyAdminPassword(input: string): boolean {
  const passwords = getAdminPasswords();
  return passwords.includes(input.trim());
}

// Trusted Sellers
export function getTrustedSellers(): TrustedSeller[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SELLERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(DEFAULT_TRUSTED_SELLERS));
      return DEFAULT_TRUSTED_SELLERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_TRUSTED_SELLERS;
  } catch {
    return DEFAULT_TRUSTED_SELLERS;
  }
}

export function saveTrustedSellers(sellers: TrustedSeller[]): void {
  localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(sellers));
}

export function addTrustedSeller(seller: Omit<TrustedSeller, 'id'>): TrustedSeller {
  const current = getTrustedSellers();
  const newSeller: TrustedSeller = {
    ...seller,
    id: `ts-${Date.now()}`,
  };
  current.unshift(newSeller);
  saveTrustedSellers(current);
  return newSeller;
}

export function updateTrustedSeller(id: string, updated: Partial<TrustedSeller>): boolean {
  const current = getTrustedSellers();
  const index = current.findIndex((s) => s.id === id);
  if (index === -1) return false;
  current[index] = { ...current[index], ...updated };
  saveTrustedSellers(current);
  return true;
}

export function deleteTrustedSeller(id: string): boolean {
  const current = getTrustedSellers();
  const filtered = current.filter((s) => s.id !== id);
  saveTrustedSellers(filtered);
  return true;
}

// Scam Blacklist Records
export function getScamRecords(): ScamRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCAMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SCAMS, JSON.stringify(DEFAULT_SCAM_RECORDS));
      return DEFAULT_SCAM_RECORDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SCAM_RECORDS;
  } catch {
    return DEFAULT_SCAM_RECORDS;
  }
}

export function saveScamRecords(records: ScamRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.SCAMS, JSON.stringify(records));
}

export function addScamRecord(record: Omit<ScamRecord, 'id'>): ScamRecord {
  const current = getScamRecords();
  const newRecord: ScamRecord = {
    ...record,
    id: `scam-${Date.now()}`,
  };
  current.unshift(newRecord);
  saveScamRecords(current);
  return newRecord;
}

export function updateScamRecord(id: string, updated: Partial<ScamRecord>): boolean {
  const current = getScamRecords();
  const index = current.findIndex((r) => r.id === id);
  if (index === -1) return false;
  current[index] = { ...current[index], ...updated };
  saveScamRecords(current);
  return true;
}

export function deleteScamRecord(id: string): boolean {
  const current = getScamRecords();
  const filtered = current.filter((r) => r.id !== id);
  saveScamRecords(filtered);
  return true;
}

// Pending Reports
export function getPendingReports(): PendingReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(DEFAULT_PENDING_REPORTS));
      return DEFAULT_PENDING_REPORTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_PENDING_REPORTS;
  } catch {
    return DEFAULT_PENDING_REPORTS;
  }
}

export function savePendingReports(reports: PendingReport[]): void {
  localStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(reports));
}

export function addPendingReport(report: Omit<PendingReport, 'id' | 'submittedAt'>): PendingReport {
  const current = getPendingReports();
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const newReport: PendingReport = {
    ...report,
    id: `pending-${Date.now()}`,
    submittedAt: formattedDate,
  };
  current.unshift(newReport);
  savePendingReports(current);
  return newReport;
}

export function approvePendingReport(id: string): { success: boolean; newScamRecord?: ScamRecord } {
  const pending = getPendingReports();
  const target = pending.find((p) => p.id === id);
  if (!target) return { success: false };

  // Convert to ScamRecord
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const newScam: ScamRecord = {
    id: `scam-${Date.now()}`,
    name: target.scammerName,
    aliases: [],
    whatsapp: target.scammerWhatsapp,
    facebookUrl: target.scammerFacebook,
    freefireUid: target.scammerUid,
    bankDetails: target.bankDetails,
    scamAmountLkr: target.scamAmountLkr,
    scamType: target.scamType as ScamType,
    incidentDetails: target.incidentDetails,
    proofUrls: target.proofUrls || [],
    avatarUrl: target.avatarUrl,
    dateReported: dateStr,
    status: 'Confirmed Scammer',
    reporterInfo: target.reporterContact ? `Reported by: ${target.reporterContact}` : 'Community Report',
  };

  const currentScams = getScamRecords();
  currentScams.unshift(newScam);
  saveScamRecords(currentScams);

  // Remove from pending
  const filteredPending = pending.filter((p) => p.id !== id);
  savePendingReports(filteredPending);

  return { success: true, newScamRecord: newScam };
}

export function addScreenshotsToScamRecord(id: string, newImages: string[]): boolean {
  const current = getScamRecords();
  const index = current.findIndex((r) => r.id === id);
  if (index === -1) return false;
  const existing = current[index].proofUrls || [];
  current[index].proofUrls = [...existing, ...newImages];
  saveScamRecords(current);
  return true;
}

export function addScreenshotsToPendingReport(id: string, newImages: string[]): boolean {
  const current = getPendingReports();
  const index = current.findIndex((r) => r.id === id);
  if (index === -1) return false;
  const existing = current[index].proofUrls || [];
  current[index].proofUrls = [...existing, ...newImages];
  savePendingReports(current);
  return true;
}

export function deletePendingReport(id: string): boolean {
  const current = getPendingReports();
  const filtered = current.filter((p) => p.id !== id);
  savePendingReports(filtered);
  return true;
}

// Reset & Backup
export function resetAllData(): void {
  localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(DEFAULT_ADMIN_PASSWORDS));
  localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(DEFAULT_TRUSTED_SELLERS));
  localStorage.setItem(STORAGE_KEYS.SCAMS, JSON.stringify(DEFAULT_SCAM_RECORDS));
  localStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(DEFAULT_PENDING_REPORTS));
}

export function exportBackupJson(): string {
  const backup = {
    ff_sellers: getTrustedSellers(),
    ff_scams: getScamRecords(),
    ff_pending: getPendingReports(),
    ff_admin_passwords: getAdminPasswords(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackupJson(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (data.ff_sellers && Array.isArray(data.ff_sellers)) {
      saveTrustedSellers(data.ff_sellers);
    }
    if (data.ff_scams && Array.isArray(data.ff_scams)) {
      saveScamRecords(data.ff_scams);
    }
    if (data.ff_pending && Array.isArray(data.ff_pending)) {
      savePendingReports(data.ff_pending);
    }
    if (data.ff_admin_passwords && Array.isArray(data.ff_admin_passwords) && data.ff_admin_passwords.length > 0) {
      saveAdminPasswords(data.ff_admin_passwords);
    }
    return { success: true, message: 'All database records successfully restored.' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid JSON file.';
    return { success: false, message: `Import failed: ${errorMsg}` };
  }
}
