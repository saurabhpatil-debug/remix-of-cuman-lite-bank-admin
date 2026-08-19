import { ClientPowerBiReportVM } from "../Model/ClientPowerBiReportVM.model";
import {
  delay,
  fileToObjectUrl,
  makeRowVersion,
  nextReportId,
  reportRows,
  syncReportCounts,
  tabNameById,
} from "@/lib/staticDb";

export type DeleteReportPayload = {
  ClientPowerBiReportMappingId: number;
  RowVersion: string | Uint8Array | number[];
};

/**
 * Static (offline) replacements for the former ManageReportW endpoints.
 * All data lives in memory, seeded from src/assets/data/reports.json.
 */

/**
 * CreateReport
 */
export async function CreateReport(
  objClientPowerBiReportVM: ClientPowerBiReportVM,
  pdfFile?: File | null,
) {
  const displayName = String(objClientPowerBiReportVM.displayName ?? "").trim();

  if (reportRows.some((row) => row.displayName.trim().toLowerCase() === displayName.toLowerCase())) {
    throw new Error("Report already exists.");
  }

  const clientTabId = Number(objClientPowerBiReportVM.clientTabsId);
  const row = {
    clientPowerBiReportMappingId: nextReportId(),
    displayName,
    tab: tabNameById(clientTabId),
    balanceSheetDate: objClientPowerBiReportVM.balanceSheetDate ?? "",
    comments: objClientPowerBiReportVM.comments ?? "",
    pdf: fileToObjectUrl(pdfFile) || objClientPowerBiReportVM.pdfURL || null,
    fileSize: objClientPowerBiReportVM.fileSize ?? "0",
    updated: new Date().toISOString(),
    rowVersion: makeRowVersion(),
    artifactType: objClientPowerBiReportVM.artifactTypeId === 1 ? "Power BI" : "PDF",
    clientTabId,
    artifactTypeId: Number(objClientPowerBiReportVM.artifactTypeId) || 2,
    pageNo: 1,
    pageSize: 50,
    totalRecords: reportRows.length + 1,
  };

  reportRows.push(row);
  syncReportCounts();
  return delay({ ...row });
}

/**
 * UpdateReport
 */
export async function UpdateReport(
  objClientPowerBiReportVM: ClientPowerBiReportVM,
  pdfFile?: File | null,
) {
  const row = reportRows.find(
    (item) =>
      item.clientPowerBiReportMappingId ===
      Number(objClientPowerBiReportVM.clientPowerBiReportMappingId),
  );

  if (!row) {
    throw new Error("Report not found.");
  }

  const displayName = String(objClientPowerBiReportVM.displayName ?? "").trim();
  if (
    reportRows.some(
      (item) =>
        item.clientPowerBiReportMappingId !== row.clientPowerBiReportMappingId &&
        item.displayName.trim().toLowerCase() === displayName.toLowerCase(),
    )
  ) {
    throw new Error("Report Display Name already exists.");
  }

  const clientTabId = Number(objClientPowerBiReportVM.clientTabsId);
  row.displayName = displayName;
  row.clientTabId = clientTabId;
  row.tab = tabNameById(clientTabId);
  row.balanceSheetDate = objClientPowerBiReportVM.balanceSheetDate ?? row.balanceSheetDate;
  row.comments = objClientPowerBiReportVM.comments ?? "";
  row.pdf = fileToObjectUrl(pdfFile) || objClientPowerBiReportVM.pdfURL || row.pdf;
  row.fileSize = objClientPowerBiReportVM.fileSize ?? row.fileSize;
  row.artifactTypeId = Number(objClientPowerBiReportVM.artifactTypeId) || row.artifactTypeId;
  row.artifactType = row.artifactTypeId === 1 ? "Power BI" : "PDF";
  row.updated = new Date().toISOString();
  row.rowVersion = makeRowVersion();

  syncReportCounts();
  return delay({ ...row });
}

/**
 * DeleteReport
 */
export async function DeleteReport(payload: DeleteReportPayload) {
  const index = reportRows.findIndex(
    (item) => item.clientPowerBiReportMappingId === Number(payload.ClientPowerBiReportMappingId),
  );
  if (index >= 0) {
    reportRows.splice(index, 1);
  }
  syncReportCounts();
  return delay({ success: true });
}
