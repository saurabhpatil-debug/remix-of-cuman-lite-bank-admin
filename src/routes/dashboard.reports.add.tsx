import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useClientRecords } from "@/lib/useClientRecords";
import { ReportForm, type ReportFormInput } from "@/components/dashboard/ReportForm";
import { InlineFormPanel } from "@/components/dashboard/InlineFormPanel";
import { NoClientNotice, PageScaffold } from "@/components/dashboard/PageScaffold";
import type { ClientPowerBiReportVM } from "@/Model/ClientPowerBiReportVM.model";
import { GetArtifactListDropDown, GetTabsListDropDown } from "@/Service/manageReportGenerationRService";
import { CreateReport } from "@/Service/manageReportGenerationWService";

type DropdownOption = {
  id: string;
  name: string;
};

export default function ReportAddPage() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  const navigate = useNavigate();
  const { clientId, ready } = useClientRecords();
  const [tabs, setTabs] = useState<DropdownOption[]>([]);
  const [artifacts, setArtifacts] = useState<DropdownOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const backToList = () => navigate("/dashboard/reports");

  const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, {
      type: blob.type || "application/pdf",
    });
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!clientId) return;

      try {
        setIsLoading(true);
        const [tabRows, artifactRows] = await Promise.all([
          GetTabsListDropDown(),
          GetArtifactListDropDown(),
        ]);

        const nextTabs = (tabRows || []).map((row: Record<string, unknown>) => ({
          id: String(row["ClientTabsId"] ?? row["clientTabsId"] ?? ""),
          name: String(row["ClientTabName"] ?? row["clientTabName"] ?? ""),
        })).filter((row: DropdownOption) => row.id.length > 0 && row.name.length > 0);

        const nextArtifacts = (artifactRows || []).map((row: Record<string, unknown>) => ({
          id: String(row["ArtifactTypeId"] ?? row["artifactTypeId"] ?? ""),
          name: String(row["ArtifactType"] ?? row["artifactType"] ?? ""),
        })).filter((row: DropdownOption) => row.id.length > 0 && row.name.length > 0);

        setTabs(nextTabs);
        setArtifacts(nextArtifacts);
      } catch (error) {
        setTabs([]);
        setArtifacts([]);
        toast.error("Failed to load report options", {
          description: error instanceof Error ? error.message : "Please refresh and try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDropdownData();
  }, [clientId]);

  const defaultTabId = useMemo(() => {
    if (!tabs.length) return null;
    if (tab && tabs.some((item) => item.id === tab)) return tab;
    return tabs[0]?.id ?? null;
  }, [tab, tabs]);

  const defaultArtifactTypeId = useMemo(() => {
    if (!artifacts.length) return undefined;

    const pdfArtifact = artifacts.find((item) => /pdf/i.test(item.name));
    if (pdfArtifact) return Number(pdfArtifact.id);

    const staticPdfArtifact = artifacts.find((item) => item.id === "2");
    if (staticPdfArtifact) return Number(staticPdfArtifact.id);

    return Number(artifacts[0]?.id);
  }, [artifacts]);

  return (
    <PageScaffold>
      {clientId ? (
        <InlineFormPanel
          title="New Report"
          description="Pick the tab this report belongs to, name the report and attach its PDF."
        >
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading report options...</p>
          ) : tabs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a tab first, then come back to create reports.
            </p>
          ) : (
            <ReportForm
              tabs={tabs}
              artifacts={artifacts}
              defaultArtifactTypeId={defaultArtifactTypeId}
              defaultTabId={defaultTabId}
              report={null}
              submitLabel="Save"
              onCancel={backToList}
              onSubmit={async (input: ReportFormInput) => {
                if (!clientId) {
                  toast.error("No client selected");
                  return false;
                }

                if (!input.pdf) {
                  toast.error("Upload a PDF before saving");
                  return false;
                }

                try {
                  const pdfFile = await dataUrlToFile(input.pdf.dataUrl, input.pdf.fileName);
                  const payload: ClientPowerBiReportVM = {
                    clientPowerBiReportMappingId: 0,
                    displayName: input.reportName,
                    clientTabsId: Number(input.tabId),
                    balanceSheetDate: input.balanceSheetDate ?? "",
                    // comments: input.comments ?? "",
                    comments: input.comments?.trim() ?? "", 
                    pdfURL: input.pdf.fileName,
                    fileSize: String(input.pdf.size),
                    artifactTypeId: input.artifactTypeId ?? defaultArtifactTypeId ?? 2,
                  };

                  await CreateReport(payload, pdfFile);
                  toast.success("Report created");
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
                    message.includes("Report already exists.")
                  ) {
                    toast.error("Report already exists.");
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
        <NoClientNotice />
      ) : null}
    </PageScaffold>
  );
}
