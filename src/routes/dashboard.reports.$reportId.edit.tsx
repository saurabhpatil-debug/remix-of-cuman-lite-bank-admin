import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useClientRecords } from "@/lib/useClientRecords";
import { ReportForm, type ReportFormInput } from "@/components/dashboard/ReportForm";
import { InlineFormPanel } from "@/components/dashboard/InlineFormPanel";
import {
  NoClientNotice,
  NotFoundNotice,
  PageScaffold,
} from "@/components/dashboard/PageScaffold";
import type { Report } from "@/lib/store";
import type { ClientPowerBiReportVM } from "@/Model/ClientPowerBiReportVM.model";
import type { ClientPowerBiReportResponseVM } from "@/Model/ClientPowerBiReportResponseVM.model";
import type { ClientPowerBiReportReqVM } from "@/Model/ClientPowerBiReportReqVM.model";
import {
  GetALLReportList,
  GetArtifactListDropDown,
  GetTabsListDropDown,
} from "@/Service/manageReportGenerationRService";
import { UpdateReport } from "@/Service/manageReportGenerationWService";

type DropdownOption = {
  id: string;
  name: string;
};

type ApiReportMeta = {
  clientPowerBiReportMappingId: number;
  rowVersion: string | Uint8Array | number[];
  artifactTypeId: number;
  fileSize: string;
  pdfURL: string;
  clientTabId: number;
  balanceSheetDateRaw: string;
};

type ResolvedReport = Report & ApiReportMeta;

function toNumericId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function idMatches(routeId: string, candidate: unknown): boolean {
  const normalizedRouteId = routeId.trim();
  if (normalizedRouteId.length === 0) {
    return false;
  }

  const routeNumericId = toNumericId(normalizedRouteId);
  const candidateNumericId = toNumericId(candidate);

  if (routeNumericId !== null && candidateNumericId !== null) {
    return routeNumericId === candidateNumericId;
  }

  return String(candidate ?? "").trim() === normalizedRouteId;
}

function toDateInputValue(rawValue: string): string {
  const value = rawValue.trim();
  if (value.length === 0) {
    return "";
  }

  const directInputMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (directInputMatch) {
    return `${directInputMatch[1]}-${directInputMatch[2]}-${directInputMatch[3]}`;
  }

  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const month = slashMatch[1]?.padStart(2, "0") ?? "01";
    const day = slashMatch[2]?.padStart(2, "0") ?? "01";
    const year = slashMatch[3] ?? "1970";
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toApiBalanceSheetDate(dateInputValue: string): string {
  const [year, month, day] = dateInputValue.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${Number(month)}/${Number(day)}/${year} 12:00:00 AM`;
}

function normalizePdfUrlForHref(pdfUrl: string): string {
  const trimmed = pdfUrl.trim();
  if (trimmed.length === 0 || trimmed.startsWith("data:")) {
    return trimmed;
  }

  return trimmed.replace(/ /g, "%20");
}

function resolvePdfFileName(pdfUrl: string, fallback: string): string {
  const normalized = normalizePdfUrlForHref(pdfUrl);
  if (normalized.length === 0) {
    return fallback;
  }

  try {
    const parsed = new URL(normalized);
    const candidate = parsed.pathname.split("/").pop();
    if (!candidate) {
      return fallback;
    }

    return decodeURIComponent(candidate) || fallback;
  } catch {
    const candidate = normalized.split("/").pop();
    if (!candidate) {
      return fallback;
    }

    try {
      return decodeURIComponent(candidate) || fallback;
    } catch {
      return candidate || fallback;
    }
  }
}

export default function ReportEditPage() {
  const { reportId = "" } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { clientId, ready, tabs } = useClientRecords();
  const [apiReport, setApiReport] = useState<ResolvedReport | null>(null);
  const [tabsOptions, setTabsOptions] = useState<DropdownOption[]>([]);
  const [artifactOptions, setArtifactOptions] = useState<DropdownOption[]>([]);
  const [isLoadingApiReport, setIsLoadingApiReport] = useState(false);
  const backToList = () => navigate("/dashboard/reports");

  const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, {
      type: blob.type || "application/pdf",
    });
  };

  const hasRowVersion = (rowVersion: ApiReportMeta["rowVersion"] | undefined) =>
    typeof rowVersion === "string"
      ? rowVersion.trim().length > 0
      : Array.isArray(rowVersion)
        ? rowVersion.length > 0
        : rowVersion instanceof Uint8Array
          ? rowVersion.length > 0
          : false;

  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!clientId) {
        setTabsOptions([]);
        setArtifactOptions([]);
        return;
      }

      try {
        const [tabRows, artifactRows] = await Promise.all([
          GetTabsListDropDown(),
          GetArtifactListDropDown(),
        ]);

        const nextTabs = (tabRows || [])
          .map((row: Record<string, unknown>) => ({
            id: String(row["ClientTabsId"] ?? row["clientTabsId"] ?? ""),
            name: String(row["ClientTabName"] ?? row["clientTabName"] ?? ""),
          }))
          .filter((row: DropdownOption) => row.id.length > 0 && row.name.length > 0);

        const nextArtifacts = (artifactRows || [])
          .map((row: Record<string, unknown>) => ({
            id: String(row["ArtifactTypeId"] ?? row["artifactTypeId"] ?? ""),
            name: String(row["ArtifactType"] ?? row["artifactType"] ?? ""),
          }))
          .filter((row: DropdownOption) => row.id.length > 0 && row.name.length > 0);

        setTabsOptions(nextTabs);
        setArtifactOptions(nextArtifacts);
      } catch {
        setTabsOptions([]);
        setArtifactOptions([]);
      }
    };

    void fetchDropdownData();
  }, [clientId]);

  useEffect(() => {
    const fetchReportFromApi = async () => {
      if (!clientId) {
        setApiReport(null);
        return;
      }

      try {
        setIsLoadingApiReport(true);

        const request: ClientPowerBiReportReqVM = {
          clientTabId: null,
          pageSize: 1000,
          pageNo: 1,
          searchTxt: "",
        };

        const rows = await GetALLReportList(request);
        const match = (rows || []).find((item: ClientPowerBiReportResponseVM & Record<string, unknown>) => {
          const id = item.clientPowerBiReportMappingId ?? item["ClientPowerBiReportMappingId"];
          return idMatches(reportId, id);
        });

        if (!match) {
          setApiReport(null);
          return;
        }

        const mappingId = match.clientPowerBiReportMappingId ?? Number(match["ClientPowerBiReportMappingId"]);
        const mappingIdAsNumber = Number(mappingId);
        if (!Number.isFinite(mappingIdAsNumber) || mappingIdAsNumber <= 0) {
          setApiReport(null);
          return;
        }

        const displayName = match.displayName ?? String(match["DisplayName"] ?? "");
        const updated = match.updated ?? String(match["Updated"] ?? "");
        const balanceSheetDateRaw = match.balanceSheetDate ?? String(match["BalanceSheetDate"] ?? "");
        const balanceSheetDate = toDateInputValue(balanceSheetDateRaw);
        const comments = match.comments ?? String(match["Comments"] ?? "");
        const pdf = match.pdf ?? (typeof match["PDF"] === "string" ? match["PDF"] : null);
        const rawPdfUrl = typeof pdf === "string" ? pdf : "";
        const normalizedPdfUrl = normalizePdfUrlForHref(rawPdfUrl);
        const tabId = match.clientTabId ?? Number(match["ClientTabId"]);
        const artifactTypeId = match.artifactTypeId ?? Number(match["ArtifactTypeId"] ?? 0);
        const rowVersion = match.rowVersion ?? (match["RowVersion"] as string | Uint8Array | number[]);
        const fileSize = match.fileSize ?? String(match["FileSize"] ?? "0");

        setApiReport({
          id: String(mappingIdAsNumber),
          clientId: String(clientId),
          tabId: String(tabId),
          reportName: displayName,
          balanceSheetDate,
          comments,
          workspaceId: "",
          reportId: "",
          embedUrl: "",
          embedToken: "",
          datasetId: "",
          pdf: pdf
            ? {
                dataUrl: normalizedPdfUrl,
                fileName: resolvePdfFileName(normalizedPdfUrl, `${displayName}.pdf`),
                size: Number(fileSize) || 0,
                uploadedAt: updated,
              }
            : null,
          updatedAt: updated,
          clientPowerBiReportMappingId: mappingIdAsNumber,
          rowVersion: rowVersion ?? "",
          artifactTypeId,
          fileSize,
          pdfURL: rawPdfUrl,
          clientTabId: Number(tabId),
          balanceSheetDateRaw,
        });
      } catch {
        setApiReport(null);
      } finally {
        setIsLoadingApiReport(false);
      }
    };

    void fetchReportFromApi();
  }, [clientId, reportId]);

  const report = apiReport;

  const effectiveTabs = useMemo(() => {
    if (tabsOptions.length > 0) return tabsOptions;
    return tabs;
  }, [tabs, tabsOptions]);

  const defaultArtifactTypeId = useMemo(() => {
    const fromApiReport = apiReport?.artifactTypeId;
    if (fromApiReport && fromApiReport > 0) {
      return fromApiReport;
    }
    if (!artifactOptions.length) return undefined;
    const pdfArtifact = artifactOptions.find((item) => /pdf/i.test(item.name));
    if (pdfArtifact) return Number(pdfArtifact.id);
    const staticPdfArtifact = artifactOptions.find((item) => item.id === "2");
    if (staticPdfArtifact) return Number(staticPdfArtifact.id);
    return Number(artifactOptions[0]?.id);
  }, [apiReport?.artifactTypeId, artifactOptions]);

  return (
    <PageScaffold>
      {!clientId ? (
        ready ? (
          <NoClientNotice />
        ) : null
      ) : report ? (
        <InlineFormPanel
          title="Update Report"
          description="Pick the tab this report belongs to, name the report and attach its PDF."
        >
          {effectiveTabs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a tab first, then come back to create reports.
            </p>
          ) : (
            <ReportForm
              key={report.id}
              tabs={effectiveTabs}
              artifacts={artifactOptions}
              defaultArtifactTypeId={defaultArtifactTypeId}
              defaultTabId={report.tabId}
              report={report}
              submitLabel="Save changes"
              onCancel={backToList}
              onSubmit={async (input: ReportFormInput) => {
                try {
                  const currentMeta = apiReport;
                  const mappingId = currentMeta?.clientPowerBiReportMappingId;
                  const rowVersion = currentMeta?.rowVersion;

                  if (!mappingId || !hasRowVersion(rowVersion)) {
                    toast.error("Could not save the report", {
                      description: "Unable to resolve backend report identity for this record.",
                    });
                    return false;
                  }

                  const resolvedRowVersion = rowVersion as string | Uint8Array | number[];

                  // const pdfRecord = input.pdf ?? report.pdf ?? null;
                  // const pdfFile =
                  //   pdfRecord && pdfRecord.dataUrl.startsWith("data:")
                  //     ? await dataUrlToFile(pdfRecord.dataUrl, pdfRecord.fileName)
                  //     : null;
                  const pdfRecord = input.pdf;

if (!pdfRecord) {
  toast.error("PDF is required", {
    description: "Please upload a PDF before saving the report.",
  });
  return false;
}

const pdfFile =
  pdfRecord.dataUrl.startsWith("data:")
    ? await dataUrlToFile(pdfRecord.dataUrl, pdfRecord.fileName)
    : null;

                  const payload: ClientPowerBiReportVM = {
                    clientPowerBiReportMappingId: mappingId,
                    displayName: input.reportName,
                    clientTabsId: Number(input.tabId),
                    balanceSheetDate: input.balanceSheetDate
                      ? toApiBalanceSheetDate(input.balanceSheetDate)
                      : currentMeta?.balanceSheetDateRaw ?? "",
                    comments: input.comments ?? "",
                    pdfURL: pdfRecord.dataUrl.startsWith("data:")
                    ? pdfRecord.fileName
                    : currentMeta?.pdfURL ?? "",
                    fileSize: pdfRecord ? String(pdfRecord.size) : currentMeta?.fileSize ?? "0",
                    artifactTypeId: input.artifactTypeId ?? currentMeta?.artifactTypeId ?? defaultArtifactTypeId ?? 2,
                    rowVersion: resolvedRowVersion,
                  };

                  await UpdateReport(payload, pdfFile);
                  toast.success("Report updated");
                  backToList();
                  return true;
                } catch (error) {
                  const status =
                    typeof (error as { response?: { status?: unknown } })?.response?.status ===
                    "number"
                      ? (error as { response: { status: number } }).response.status
                      : undefined;
                  const message =
                    typeof (error as { response?: { data?: { message?: unknown } } })?.response
                      ?.data?.message === "string"
                      ? (error as { response: { data: { message: string } } }).response.data
                          .message
                      : undefined;

                  if (
                    status === 400 &&
                    typeof message === "string" &&
                    message.includes("Report Display Name already exists.")
                  ) {
                    toast.error("Report Display Name already exists.");
                    return false;
                  }

                  toast.error("Could not save the report", {
                    description: error instanceof Error ? error.message : "Please try again.",
                  });
                  return false;
                }
              }}
            />
          )}
        </InlineFormPanel>
      ) : ready ? (
        isLoadingApiReport ? null : <NotFoundNotice>That report no longer exists for this client.</NotFoundNotice>
      ) : null}
    </PageScaffold>
  );
}
