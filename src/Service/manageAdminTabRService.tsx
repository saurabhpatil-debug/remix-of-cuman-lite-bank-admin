import { ClientTabsReqVM } from "../Model/ClientTabsReqVM.model.tsx";
import { delay, syncReportCounts, tabRows } from "@/lib/staticDb";

/**
 * GetAllTabsList
 * Static (offline) replacement for the former ManageAdminTabR/GetAllTabsList API.
 */
export async function GetAllTabsList(objClientTabsReqVM: ClientTabsReqVM): Promise<any> {
	syncReportCounts();

	const search = String(objClientTabsReqVM?.["SearchTxt"] ?? "").trim().toLowerCase();
	const rows = tabRows
		.slice()
		.sort((a, b) => a.OrderLevel - b.OrderLevel)
		.filter((row) => (search ? row.ClientTabName.toLowerCase().includes(search) : true))
		.map((row) => ({ ...row }));

	return delay(rows);
}
