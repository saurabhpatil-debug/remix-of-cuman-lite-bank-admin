import { ClientTabsVM } from "../Model/ClientTabsVM.model";
import { AuthService } from "../framework/auth.service";
import { axiosInstanceGPGPost } from "../framework/InterceptedHttp/axiosInstance";

const API_WRITE = "ManageAdminTabW";

function toBase64(value: string | Uint8Array | number[]): string {
  if (typeof value === "string") {
    return value;
  }

  const bytes = value instanceof Uint8Array ? value : Uint8Array.from(value);
  let binary = "";

  for (let i = 0; i < bytes.length; i += 1) {
    const currentByte = bytes[i];
    if (currentByte === undefined) {
      continue;
    }

    binary += String.fromCharCode(currentByte);
  }

  return btoa(binary);
}

/**
 * CreateClientTabs
 * Calls ManageAdminTabW/CreateClientTabs API
 */
export async function CreateClientTabs(
  objClientTabsVM: ClientTabsVM,
  pdfFile?: File | null,
)
{
  const auth = await AuthService.getAuthToken();
  const token = auth[0]?.id_token;
  const formData = new FormData();

  formData.append("ClientTabsId", String(objClientTabsVM.ClientTabsId));
  formData.append("ClientTabName", objClientTabsVM.ClientTabName);
  formData.append("HelpFileURL", objClientTabsVM.HelpFileURL);
  formData.append("PDFURL", objClientTabsVM.PDFURL);
  formData.append("FileSize", objClientTabsVM.FileSize);
  formData.append("RowVersion", toBase64(objClientTabsVM.RowVersion));
 

  if (pdfFile) {
    formData.append("pdfFile", pdfFile);
  }

  const response = await axiosInstanceGPGPost.post(
    `${API_WRITE}/CreateClientTabs`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
}

/**
 * UpdateClientTabs
 * Calls ManageAdminTabW/UpdateClientTabs API
 */
export async function UpdateClientTabs(
  objClientTabsVM: ClientTabsVM,
  pdfFile?: File | null,
)
{
  const auth = await AuthService.getAuthToken();
  const token = auth[0]?.id_token;
  const formData = new FormData();

  formData.append("ClientTabsId", String(objClientTabsVM.ClientTabsId));
  formData.append("ClientTabName", objClientTabsVM.ClientTabName);
  formData.append("HelpFileURL", objClientTabsVM.HelpFileURL);
  formData.append("PDFURL", objClientTabsVM.PDFURL);
  formData.append("FileSize", objClientTabsVM.FileSize);
  formData.append("RowVersion", toBase64(objClientTabsVM.RowVersion));

  if (pdfFile) {
    formData.append("pdfFile", pdfFile);
  }

  const response = await axiosInstanceGPGPost.post(
    `${API_WRITE}/UpdateClientTabs`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
}

/**
 * DeleteClientTabs
 * Calls ManageAdminTabW/DeleteClientTabs API
 */
export async function DeleteClientTabs(objClientTabsVM: ClientTabsVM) {
  const auth = await AuthService.getAuthToken();
  const token = auth[0]?.id_token;

  const response = await axiosInstanceGPGPost.post(
    `${API_WRITE}/DeleteClientTabs`,
    objClientTabsVM,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

/**
 * MoveClientTabOrderUp
 * Calls ManageAdminTabW/MoveClientTabOrderUp API
 */
export async function MoveClientTabOrderUp(clientTabId: number) {
  const auth = await AuthService.getAuthToken();
  const token = auth[0]?.id_token;

  const response = await axiosInstanceGPGPost.post(
    `${API_WRITE}/MoveClientTabOrderUp`,
    { clientTabId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

/**
 * MoveClientTabOrderDown
 * Calls ManageAdminTabW/MoveClientTabOrderDown API
 */
export async function MoveClientTabOrderDown(clientTabId: number) {
  const auth = await AuthService.getAuthToken();
  const token = auth[0]?.id_token;

  const response = await axiosInstanceGPGPost.post(
    `${API_WRITE}/MoveClientTabOrderDown`,
    { clientTabId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}
