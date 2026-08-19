import seedTabs from "@/assets/data/tabs.json";
import seedReports from "@/assets/data/reports.json";
import seedArtifactTypes from "@/assets/data/artifactTypes.json";

export type StaticTabRow = {
  ClientTabsId: number;
  ClientTabName: string;
  ReportCount: number;
  HelpFileURL: string;
  PDFURL: string;
  FileSize: string;
  OrderLevel: number;
  RowVersion: string;
};

export type StaticReportRow = {
  clientPowerBiReportMappingId: number;
  displayName: string;
  tab: string;
  balanceSheetDate: string;
  comments: string;
  pdf: string | null;
  fileSize: string | null;
  updated: string;
  rowVersion: string;
  artifactType: string;
  clientTabId: number;
  artifactTypeId: number;
  pageNo: number;
  pageSize: number;
  totalRecords: number;
};

export type StaticArtifactRow = {
  ArtifactTypeId: number;
  ArtifactType: string;
};

/**
 * In-memory data layer seeded from static JSON files.
 * The app runs fully offline: no HTTP requests are made anywhere.
 */
export const tabRows: StaticTabRow[] = (seedTabs as StaticTabRow[]).map((row) => ({ ...row }));
export const reportRows: StaticReportRow[] = (seedReports as StaticReportRow[]).map((row) => ({
  ...row,
}));
export const artifactRows: StaticArtifactRow[] = (seedArtifactTypes as StaticArtifactRow[]).map(
  (row) => ({ ...row }),
);

export function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function nextTabId(): number {
  return tabRows.reduce((max, row) => Math.max(max, row.ClientTabsId), 0) + 1;
}

export function nextReportId(): number {
  return (
    reportRows.reduce((max, row) => Math.max(max, row.clientPowerBiReportMappingId), 0) + 1
  );
}

export function makeRowVersion(): string {
  return btoa(`v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
}

export function fileToObjectUrl(file?: File | null): string {
  if (!file) return "";
  try {
    return URL.createObjectURL(file);
  } catch {
    return "";
  }
}

export function tabNameById(clientTabsId: number): string {
  return tabRows.find((row) => row.ClientTabsId === clientTabsId)?.ClientTabName ?? "";
}

export function syncReportCounts() {
  tabRows.forEach((tab) => {
    tab.ReportCount = reportRows.filter((r) => r.clientTabId === tab.ClientTabsId).length;
  });
}
