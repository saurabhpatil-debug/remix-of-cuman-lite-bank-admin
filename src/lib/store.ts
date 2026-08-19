import seedUsers from "@/data/users.json";
import seedClients from "@/data/clients.json";

import seedReports from "@/data/reports.json";
import { deletePdfData, getPdfData, putPdfData } from "@/lib/pdfBlobs";

export type AdminUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: "admin";
  createdAt: string;
};

export type Client = {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
};

export type SheetData = {
  name: string;
  columns: string[];
  rows: Record<string, string>[];
};

export type Workbook = {
  fileName: string;
  uploadedAt: string;
  sheets: SheetData[];
};

export type PdfRecord = {
  fileName: string;
  size: number;
  uploadedAt: string;
  dataUrl: string;
};

export type HelpFileRecord = PdfRecord;

export type PowerBiConfig = {
  reportName: string;
  workspaceId: string;
  reportId: string;
  embedUrl: string;
  embedToken: string;
  datasetId: string;
  savedAt: string;
};

export type Session = {
  id: string;
  name: string;
  username: string;
  role: "admin" | "client";
};

export type Tab = {
  orderLevel?: number;
  id: string;
  clientId: string;
  name: string;
  reportCount?: number;
  order?: number;
  helpFile?: HelpFileRecord | null;
  createdAt: string;

};

export type Report = {
  id: string;
  clientId: string;
  tabId: string;
  reportName: string;
  balanceSheetDate?: string;
  comments?: string;
  type?: string;
  workspaceId: string;
  reportId: string;
  embedUrl: string;
  embedToken: string;
  datasetId: string;
  pdf?: PdfRecord | null;
  updatedAt: string;
};

const KEYS = {
  clients: "sad.clients.v3",
  workbooks: "sad.workbooks",
  pdfs: "sad.pdfs",
  powerbi: "sad.powerbi",
  session: "sad.session",
  tabs: "cbm.tabs.v2",
  reports: "cbm.reports.v2",
};

export const ROW_ID_KEY = "__rowId";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error("Local storage is full. Remove an existing item and try again.");
  }
}

/* ---------- clients ---------- */

export function getClients(): Client[] {
  if (typeof window === "undefined") return [];
  const existing = window.localStorage.getItem(KEYS.clients);
  if (!existing) {
    write(KEYS.clients, seedClients);
    return seedClients as Client[];
  }
  const stored = read<Client[]>(KEYS.clients, []);

  // Migration: refresh seed client display fields when stale values remain
  // in a browser that loaded the app before the seed data was updated.
  const migrated = stored.map((client) => {
    const seed = seedClients.find((s) => s.id === client.id);
    if (!seed) return client;
    const needsUpdate =
      client.name !== seed.name || client.username !== seed.username || client.email !== seed.email;
    return needsUpdate
      ? { ...client, name: seed.name, username: seed.username, email: seed.email }
      : client;
  });

  if (JSON.stringify(migrated) !== JSON.stringify(stored)) {
    write(KEYS.clients, migrated);
  }
  return migrated;
}

export function getClient(id: string): Client | undefined {
  return getClients().find((c) => c.id === id);
}

export function addClient(input: Omit<Client, "id" | "createdAt">): Client {
  const clients = getClients();
  const client: Client = {
    ...input,
    id: `client-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  write(KEYS.clients, [...clients, client]);
  return client;
}

export function isUsernameTaken(username: string): boolean {
  const value = username.trim().toLowerCase();
  return (
    getClients().some((c) => c.username.toLowerCase() === value) ||
    (seedUsers as AdminUser[]).some((u) => u.username.toLowerCase() === value)
  );
}

/** Registers / refreshes a client that was handed over from the external web app. */
export function upsertExternalClient(input: {
  id: string;
  name?: string;
  username?: string;
  email?: string;
}): Client {
  const clients = getClients();
  const existing = clients.find((c) => c.id === input.id);
  const client: Client = {
    id: input.id,
    name: input.name ?? existing?.name ?? input.id,
    username: input.username ?? existing?.username ?? input.id,
    email: input.email ?? existing?.email ?? "",
    password: existing?.password ?? "",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  write(
    KEYS.clients,
    existing ? clients.map((c) => (c.id === client.id ? client : c)) : [...clients, client],
  );
  return client;
}

export function isEmailTaken(email: string): boolean {
  const value = email.trim().toLowerCase();
  return (
    getClients().some((c) => c.email.toLowerCase() === value) ||
    (seedUsers as AdminUser[]).some((u) => u.email.toLowerCase() === value)
  );
}

/* ---------- auth ---------- */

export function authenticate(username: string, password: string): Session | null {
  const uname = username.trim().toLowerCase();
  const admin = (seedUsers as AdminUser[]).find(
    (u) => u.username.toLowerCase() === uname && u.password === password,
  );
  if (admin) {
    return { id: admin.id, name: admin.name, username: admin.username, role: "admin" };
  }
  const client = getClients().find(
    (c) => c.username.toLowerCase() === uname && c.password === password,
  );
  if (client) {
    return { id: client.id, name: client.name, username: client.username, role: "client" };
  }
  return null;
}

export function getSession(): Session | null {
  return read<Session | null>(KEYS.session, null);
}

export function setSession(session: Session) {
  write(KEYS.session, session);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEYS.session);
}

/* ---------- workbooks ---------- */

export function getWorkbook(clientId: string): Workbook | null {
  const all = read<Record<string, Workbook>>(KEYS.workbooks, {});
  return all[clientId] ?? null;
}

export function saveWorkbook(clientId: string, workbook: Workbook) {
  const all = read<Record<string, Workbook>>(KEYS.workbooks, {});
  all[clientId] = workbook;
  write(KEYS.workbooks, all);
}

/* ---------- per-row records ---------- */

function recordKey(clientId: string, sheet: string, rowId: string) {
  return `${clientId}||${sheet}||${rowId}`;
}

export function getPdf(clientId: string, sheet: string, rowId: string): PdfRecord | null {
  const all = read<Record<string, PdfRecord>>(KEYS.pdfs, {});
  return all[recordKey(clientId, sheet, rowId)] ?? null;
}

export function savePdf(clientId: string, sheet: string, rowId: string, pdf: PdfRecord) {
  const all = read<Record<string, PdfRecord>>(KEYS.pdfs, {});
  all[recordKey(clientId, sheet, rowId)] = pdf;
  write(KEYS.pdfs, all);
}

export function getPowerBi(clientId: string, sheet: string, rowId: string): PowerBiConfig | null {
  const all = read<Record<string, PowerBiConfig>>(KEYS.powerbi, {});
  return all[recordKey(clientId, sheet, rowId)] ?? null;
}

export function savePowerBi(clientId: string, sheet: string, rowId: string, config: PowerBiConfig) {
  const all = read<Record<string, PowerBiConfig>>(KEYS.powerbi, {});
  all[recordKey(clientId, sheet, rowId)] = config;
  write(KEYS.powerbi, all);
}

export function getSheetRecordFlags(clientId: string, sheet: string, rowId: string) {
  return {
    hasPdf: Boolean(getPdf(clientId, sheet, rowId)),
    hasPowerBi: Boolean(getPowerBi(clientId, sheet, rowId)),
  };
}

/* ---------- tabs ---------- */

function readSeeded<T>(key: string, seed: T[]): T[] {
  if (typeof window === "undefined") return [];
  const existing = window.localStorage.getItem(key);
  if (!existing) {
    write(key, seed);
    return seed;
  }
  return read<T[]>(key, []);
}

export function getAllTabs(): Tab[] {
  return read<Tab[]>(KEYS.tabs, []);
}
export function getTabs(clientId: string): Tab[] {
  return getAllTabs().filter((t) => t.clientId === clientId);
}

export function addTab(
  clientId: string,
  name: string,
  extra?: { order?: number; helpFile?: HelpFileRecord | null },
): Tab {
  const tab: Tab = {
    id: `tab-${Date.now().toString(36)}`,
    clientId,
    name: name.trim().toUpperCase(),
    order: extra?.order ?? getTabs(clientId).length + 1,
    helpFile: extra?.helpFile ?? null,
    createdAt: new Date().toISOString(),
  };
  write(KEYS.tabs, [...getAllTabs(), tab]);
  return tab;
}

export function updateTab(
  id: string,
  name: string,
  extra?: { order?: number; helpFile?: HelpFileRecord | null },
): Tab[] {
  const next = getAllTabs().map((t) =>
    t.id === id
      ? {
          ...t,
          name: name.trim().toUpperCase(),
          ...(extra?.order !== undefined ? { order: extra.order } : {}),
          ...(extra?.helpFile !== undefined ? { helpFile: extra.helpFile } : {}),
        }
      : t,
  );
  write(KEYS.tabs, next);
  return next;
}

export function deleteTab(id: string): Tab[] {
  const next = getAllTabs().filter((t) => t.id !== id);
  write(KEYS.tabs, next);
  return next;
}

export function isTabNameTaken(clientId: string, name: string, exceptId?: string): boolean {
  const value = name.trim().toLowerCase();
  return getTabs(clientId).some((t) => t.id !== exceptId && t.name.trim().toLowerCase() === value);
}

/* ---------- reports ---------- */

export function getAllReports(): Report[] {
  return readSeeded<Report>(KEYS.reports, seedReports as Report[]).map((r) =>
    r.pdf ? { ...r, pdf: { ...r.pdf, dataUrl: r.pdf.dataUrl || getPdfData(r.id) } } : r,
  );
}

/** Reports keep metadata in localStorage; PDF bytes go to IndexedDB (much larger quota). */
function persistReports(reports: Report[]) {
  write(
    KEYS.reports,
    reports.map((r) => (r.pdf ? { ...r, pdf: { ...r.pdf, dataUrl: "" } } : r)),
  );
}

export function getReports(clientId: string): Report[] {
  return getAllReports().filter((r) => r.clientId === clientId);
}

export function countReportsForTab(tabId: string): number {
  return getAllReports().filter((r) => r.tabId === tabId).length;
}

export type ReportInput = Omit<Report, "id" | "clientId" | "updatedAt">;

export function addReport(clientId: string, input: ReportInput): Report {
  const report: Report = {
    ...input,
    id: `rep-${Date.now().toString(36)}`,
    clientId,
    updatedAt: new Date().toISOString(),
  };
  persistReports([...getAllReports(), report]);
  if (report.pdf?.dataUrl) void putPdfData(report.id, report.pdf.dataUrl);
  return report;
}

export function updateReport(id: string, input: ReportInput): Report[] {
  const next = getAllReports().map((r) =>
    r.id === id ? { ...r, ...input, updatedAt: new Date().toISOString() } : r,
  );
  persistReports(next);
  if (input.pdf?.dataUrl) void putPdfData(id, input.pdf.dataUrl);
  else void deletePdfData(id);
  return next;
}

export function deleteReport(id: string): Report[] {
  const next = getAllReports().filter((r) => r.id !== id);
  persistReports(next);
  void deletePdfData(id);
  return next;
}
