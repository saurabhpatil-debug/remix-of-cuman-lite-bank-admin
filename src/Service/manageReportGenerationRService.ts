import type { ClientPowerBiReportReqVM } from "../Model/ClientPowerBiReportReqVM.model";
import { artifactRows, delay, reportRows, tabRows } from "@/lib/staticDb";

/**
 * GetTabsListDropDown
 * Static (offline) replacement for ManageReportR/GetTabsListDropDown.
 */
export async function GetTabsListDropDown(): Promise<any[]> {
	const rows = tabRows
		.slice()
		.sort((a, b) => a.OrderLevel - b.OrderLevel)
		.map((row) => ({
			ClientTabsId: row.ClientTabsId,
			ClientTabName: row.ClientTabName,
		}));

	return delay(rows);
}

/**
 * GetArtifactListDropDown
 * Static (offline) replacement for ManageReportR/GetArtifactListDropDown.
 */
export async function GetArtifactListDropDown(): Promise<any[]> {
	return delay(artifactRows.map((row) => ({ ...row })));
}

/**
 * GetALLReportList
 * Static (offline) replacement for ManageReportR/GetALLReportList.
 */
export async function GetALLReportList(objClientPowerBiReportReqVM: ClientPowerBiReportReqVM): Promise<any[]> {
	const { clientTabId, pageNo = 1, pageSize = 50, searchTxt = "" } = objClientPowerBiReportReqVM ?? {};
	const search = String(searchTxt ?? "").trim().toLowerCase();

	const filtered = reportRows
		.filter((row) => (clientTabId ? row.clientTabId === clientTabId : true))
		.filter((row) =>
			search
				? row.displayName.toLowerCase().includes(search) ||
					(row.comments ?? "").toLowerCase().includes(search)
				: true,
		);

	const start = (Math.max(pageNo, 1) - 1) * Math.max(pageSize, 1);
	const paged = filtered.slice(start, start + Math.max(pageSize, 1)).map((row) => ({
		...row,
		pageNo,
		pageSize,
		totalRecords: filtered.length,
	}));

	return delay(paged);
}
