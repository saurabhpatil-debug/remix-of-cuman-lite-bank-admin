import { AuthService } from "../framework/auth.service";
import { axiosInstanceGPGGet } from "../framework/InterceptedHttp/axiosInstance";
import type { ClientPowerBiReportReqVM } from "../Model/ClientPowerBiReportReqVM.model";

/**
 * GetTabsListDropDown
 * Calls ManageReportR/GetTabsListDropDown API
 */
export async function GetTabsListDropDown() {
	const auth = await AuthService.getAuthToken();
	const token = auth[0]?.id_token;
	const response = await axiosInstanceGPGGet.get(
		`ManageReportR/GetTabsListDropDown`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);
	return response.data;
}

/**
 * GetArtifactListDropDown
 * Calls ManageReportR/GetArtifactListDropDown API
 */
export async function GetArtifactListDropDown() {
	const auth = await AuthService.getAuthToken();
	const token = auth[0]?.id_token;
	const response = await axiosInstanceGPGGet.get(
		`ManageReportR/GetArtifactListDropDown`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);
	return response.data;
}

/**
 * GetALLReportList
 * Calls ManageReportR/GetALLReportList API
 */
export async function GetALLReportList(objClientPowerBiReportReqVM: ClientPowerBiReportReqVM) {
	const auth = await AuthService.getAuthToken();
	const token = auth[0]?.id_token;
	const response = await axiosInstanceGPGGet.get(
		`ManageReportR/GetALLReportList`,
		{
			params: objClientPowerBiReportReqVM,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);
	return response.data;
}