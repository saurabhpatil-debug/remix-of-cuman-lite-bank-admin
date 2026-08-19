import { ClientPowerBiReportVM } from "../Model/ClientPowerBiReportVM.model";
import { AuthService } from "../framework/auth.service";
import { axiosInstanceGPGPost } from "../framework/InterceptedHttp/axiosInstance";

const API_WRITE = "ManageReportW";

export type DeleteReportPayload = {
  ClientPowerBiReportMappingId: number;
  RowVersion: string | Uint8Array | number[];
};

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
 * CreateReport
 * Calls ManageReportW/CreateReport API
 */
export async function CreateReport(
  objClientPowerBiReportVM: ClientPowerBiReportVM,
  pdfFile?: File | null,
)
{
  const auth = await AuthService.getAuthToken();
  const token = auth[0]?.id_token;
  const formData = new FormData();

  formData.append("ClientPowerBiReportMappingId", String(objClientPowerBiReportVM.clientPowerBiReportMappingId));
  formData.append("DisplayName", objClientPowerBiReportVM.displayName);
  formData.append("ClientTabsId", String(objClientPowerBiReportVM.clientTabsId));
  formData.append("BalanceSheetDate", objClientPowerBiReportVM.balanceSheetDate);
  formData.append("Comments", objClientPowerBiReportVM.comments);
  formData.append("PDFURL", objClientPowerBiReportVM.pdfURL);
  formData.append("FileSize", objClientPowerBiReportVM.fileSize);
  formData.append("ArtifactTypeId", String(objClientPowerBiReportVM.artifactTypeId));
  if (objClientPowerBiReportVM.rowVersion !== undefined && objClientPowerBiReportVM.rowVersion !== "") {
    formData.append("RowVersion", toBase64(objClientPowerBiReportVM.rowVersion));
  }

  if (pdfFile) {
    formData.append("pdfFile", pdfFile);
  }

  const response = await axiosInstanceGPGPost.post(
    `${API_WRITE}/CreateReport`,
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
 * UpdateReport
 * Calls ManageReportW/UpdateReport API
 */
export async function UpdateReport(
  objClientPowerBiReportVM: ClientPowerBiReportVM,
  pdfFile?: File | null,
)
{
  const auth = await AuthService.getAuthToken();
  const token = auth[0]?.id_token;
  const formData = new FormData();

  formData.append("ClientPowerBiReportMappingId", String(objClientPowerBiReportVM.clientPowerBiReportMappingId));
  formData.append("DisplayName", objClientPowerBiReportVM.displayName);
  formData.append("ClientTabsId", String(objClientPowerBiReportVM.clientTabsId));
  formData.append("BalanceSheetDate", objClientPowerBiReportVM.balanceSheetDate);
  // formData.append("Comments", objClientPowerBiReportVM.comments);
  formData.append("Comments", objClientPowerBiReportVM.comments ?? "");
  formData.append("PDFURL", objClientPowerBiReportVM.pdfURL);
  formData.append("FileSize", objClientPowerBiReportVM.fileSize);
  formData.append("ArtifactTypeId", String(objClientPowerBiReportVM.artifactTypeId));
  if (objClientPowerBiReportVM.rowVersion !== undefined && objClientPowerBiReportVM.rowVersion !== "") {
    formData.append("RowVersion", toBase64(objClientPowerBiReportVM.rowVersion));
  }

  if (pdfFile) {
    formData.append("pdfFile", pdfFile);
  }

  const response = await axiosInstanceGPGPost.post(
    `${API_WRITE}/UpdateReport`,
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
 * DeleteReport
 * Calls ManageReportW/DeleteReport API
 */
export async function DeleteReport(payload: DeleteReportPayload) {
  const auth = await AuthService.getAuthToken();
  const token = auth[0]?.id_token;

  const response = await axiosInstanceGPGPost.post(
    `${API_WRITE}/DeleteReport`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}
