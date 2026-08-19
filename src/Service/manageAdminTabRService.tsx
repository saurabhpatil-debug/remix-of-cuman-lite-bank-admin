import { ClientTabsReqVM } from "../Model/ClientTabsReqVM.model.tsx";
import { AuthService } from "../framework/auth.service";
import { axiosInstanceGPGGet } from "../framework/InterceptedHttp/axiosInstance";

/**
 * GetAllTabsList
 * Calls ManageAdminTabR/GetAllTabsList API
 */
export async function GetAllTabsList(objClientTabsReqVM: ClientTabsReqVM) {
	const auth = await AuthService.getAuthToken();
	const token = auth[0]?.id_token;
	const response = await axiosInstanceGPGGet.get(
		`ManageAdminTabR/GetAllTabsList`,
		{
			params: objClientTabsReqVM,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);
	return response.data;
}