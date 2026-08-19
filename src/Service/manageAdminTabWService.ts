import { ClientTabsVM } from "../Model/ClientTabsVM.model";
import {
  delay,
  fileToObjectUrl,
  makeRowVersion,
  nextTabId,
  syncReportCounts,
  tabRows,
} from "@/lib/staticDb";

/**
 * Static (offline) replacements for the former ManageAdminTabW endpoints.
 * All data lives in memory, seeded from src/assets/data/tabs.json.
 */

/**
 * CreateClientTabs
 */
export async function CreateClientTabs(objClientTabsVM: ClientTabsVM, pdfFile?: File | null) {
  const name = String(objClientTabsVM.ClientTabName ?? "").trim();

  if (tabRows.some((row) => row.ClientTabName.trim().toLowerCase() === name.toLowerCase())) {
    throw new Error("Tab already exists.");
  }

  const row = {
    ClientTabsId: nextTabId(),
    ClientTabName: name,
    ReportCount: 0,
    HelpFileURL: objClientTabsVM.HelpFileURL ?? "",
    PDFURL: fileToObjectUrl(pdfFile) || (objClientTabsVM.PDFURL ?? ""),
    FileSize: objClientTabsVM.FileSize ?? "0",
    OrderLevel: tabRows.length + 1,
    RowVersion: makeRowVersion(),
  };

  tabRows.push(row);
  return delay({ ...row });
}

/**
 * UpdateClientTabs
 */
export async function UpdateClientTabs(objClientTabsVM: ClientTabsVM, pdfFile?: File | null) {
  const row = tabRows.find((item) => item.ClientTabsId === Number(objClientTabsVM.ClientTabsId));
  if (!row) {
    throw new Error("Tab not found.");
  }

  const name = String(objClientTabsVM.ClientTabName ?? "").trim();
  if (
    tabRows.some(
      (item) =>
        item.ClientTabsId !== row.ClientTabsId &&
        item.ClientTabName.trim().toLowerCase() === name.toLowerCase(),
    )
  ) {
    throw new Error("Tab already exists.");
  }

  row.ClientTabName = name;
  row.HelpFileURL = objClientTabsVM.HelpFileURL ?? row.HelpFileURL;
  row.PDFURL = fileToObjectUrl(pdfFile) || objClientTabsVM.PDFURL || row.PDFURL;
  row.FileSize = objClientTabsVM.FileSize ?? row.FileSize;
  row.RowVersion = makeRowVersion();

  return delay({ ...row });
}

/**
 * DeleteClientTabs
 */
export async function DeleteClientTabs(objClientTabsVM: ClientTabsVM) {
  const index = tabRows.findIndex(
    (item) => item.ClientTabsId === Number(objClientTabsVM.ClientTabsId),
  );
  if (index >= 0) {
    tabRows.splice(index, 1);
    tabRows.forEach((row, i) => {
      row.OrderLevel = i + 1;
    });
  }
  syncReportCounts();
  return delay({ success: true });
}

/**
 * MoveClientTabOrderUp
 */
export async function MoveClientTabOrderUp(clientTabId: number) {
  const sorted = tabRows.slice().sort((a, b) => a.OrderLevel - b.OrderLevel);
  const index = sorted.findIndex((row) => row.ClientTabsId === clientTabId);
  if (index > 0) {
    const current = sorted[index]!;
    const previous = sorted[index - 1]!;
    const order = current.OrderLevel;
    current.OrderLevel = previous.OrderLevel;
    previous.OrderLevel = order;
  }
  return delay({ success: true });
}

/**
 * MoveClientTabOrderDown
 */
export async function MoveClientTabOrderDown(clientTabId: number) {
  const sorted = tabRows.slice().sort((a, b) => a.OrderLevel - b.OrderLevel);
  const index = sorted.findIndex((row) => row.ClientTabsId === clientTabId);
  if (index >= 0 && index < sorted.length - 1) {
    const current = sorted[index]!;
    const next = sorted[index + 1]!;
    const order = current.OrderLevel;
    current.OrderLevel = next.OrderLevel;
    next.OrderLevel = order;
  }
  return delay({ success: true });
}
