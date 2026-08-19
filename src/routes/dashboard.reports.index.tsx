import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useClientRecords } from "@/lib/useClientRecords";
import { GetTabsListDropDown, GetALLReportList } from "@/Service/manageReportGenerationRService";
import { DeleteReport } from "@/Service/manageReportGenerationWService";
import type { ClientPowerBiReportReqVM } from "@/Model/ClientPowerBiReportReqVM.model";
import type { ClientPowerBiReportResponseVM } from "@/Model/ClientPowerBiReportResponseVM.model";
import { ReportTable } from "@/components/dashboard/ReportTable";
import { NoClientNotice, PageScaffold } from "@/components/dashboard/PageScaffold";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Report } from "@/lib/store";

type ApiReport = Report & {
  clientPowerBiReportMappingId: number;
  rowVersion: string | Uint8Array | number[];
};

export default function ReportListPage() {
  const navigate = useNavigate();
  const { clientId, ready } = useClientRecords();
  const [tabFilter, setTabFilter] = useState<string>("all");
  const [reportToDelete, setReportToDelete] = useState<ApiReport | null>(null);
  const [dropdownTabs, setDropdownTabs] = useState<any[]>([]);
  const [isLoadingTabs, setIsLoadingTabs] = useState(false);
  const [apiReports, setApiReports] = useState<ApiReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTxt, setSearchTxt] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);

  // Handle page size changes and trigger API call
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageNo(1); // Reset to first page when size changes
  };

  useEffect(() => {
    setTabFilter("all");
  }, [clientId]);

  // Fetch tabs dropdown data from API
  useEffect(() => {
    const fetchTabsDropdown = async () => {
      try {
        setIsLoadingTabs(true);
        const data = await GetTabsListDropDown();
        // Transform response to match expected format
        const transformedTabs = (data || []).map((tab: any) => ({
          id: String(tab.ClientTabsId),
          name: tab.ClientTabName,
        }));
        setDropdownTabs(transformedTabs);
      } catch (error) {
        console.error("Failed to fetch tabs dropdown:", error);
        toast.error("Failed to load tabs");
      } finally {
        setIsLoadingTabs(false);
      }
    };

    if (clientId) {
      fetchTabsDropdown();
    }
  }, [clientId]);

  // Fetch reports based on selected tab
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoadingReports(true);
        const clientTabsId = tabFilter === "all" ? null : Number(tabFilter);
        const reportRequest: ClientPowerBiReportReqVM = {
          clientTabId: clientTabsId,
          pageSize: pageSize,
          pageNo: pageNo,
          searchTxt: searchTxt,
        };
        const data = await GetALLReportList(reportRequest);

        // Support both camelCase and PascalCase API field naming.
        const transformedReports = (data || []).map((item: ClientPowerBiReportResponseVM & Record<string, unknown>) => {
          const id = item.clientPowerBiReportMappingId ?? Number(item["ClientPowerBiReportMappingId"]);
          const displayName = item.displayName ?? String(item["DisplayName"] ?? "");
          const updated = item.updated ?? String(item["Updated"] ?? "");
          const balanceSheetDate = item.balanceSheetDate ?? String(item["BalanceSheetDate"] ?? "");
          const comments = item.comments ?? String(item["Comments"] ?? "");
          const pdf = item.pdf ?? (typeof item["PDF"] === "string" ? item["PDF"] : null);
          const tabId = item.clientTabId ?? Number(item["ClientTabId"]);
          const rowVersion = item.rowVersion ?? item["RowVersion"];

          return {
            id: String(id),
            clientId: String(clientId ?? ""),
            tabId: String(tabId),
            reportName: displayName,
            balanceSheetDate: balanceSheetDate || "",
            comments,
            workspaceId: "",
            reportId: "",
            embedUrl: "",
            embedToken: "",
            datasetId: "",
            pdf: pdf ? { dataUrl: pdf, fileName: `${displayName}.pdf`, size: 0, uploadedAt: updated } : null,
            updatedAt: updated,
            clientPowerBiReportMappingId: id,
            rowVersion: (rowVersion ?? "") as string | Uint8Array | number[],
          } satisfies ApiReport;
        }).filter((row: ApiReport) => row.reportName.trim().length > 0 || row.updatedAt.trim().length > 0 || (row.comments ?? "").trim().length > 0);

        setApiReports(transformedReports);
        // Get total records from first item (same for all items in response)
        if (data && data.length > 0) {
          setTotalRecords(data[0].totalRecords ?? data[0].TotalRecords ?? 0);
        } else {
          setTotalRecords(0);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        toast.error("Failed to load reports");
        setApiReports([]);
        setTotalRecords(0);
      } finally {
        setIsLoadingReports(false);
      }
    };

    if (clientId && tabFilter) {
      fetchReports();
    }
  }, [clientId, tabFilter, pageNo, pageSize, searchTxt, reloadToken]);

  const selectedTab = dropdownTabs.find((t) => t.id === tabFilter) ?? null;
  const visibleReports = useMemo(
    () => apiReports,
    [apiReports],
  );

  return (
    <PageScaffold>
      {/* <div className="flex w-full max-w-full flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-3 sm:gap-3 sm:px-4">
        <Label
          htmlFor="tab-filter"
          className="shrink-0 text-[11px] tracking-wider uppercase sm:text-xs"
        >
          Tab
        </Label>
        <Select value={tabFilter} onValueChange={setTabFilter}>
          <SelectTrigger id="tab-filter" className="w-full min-w-0 sm:w-64">
            <SelectValue placeholder="All tabs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tabs</SelectItem>
            {dropdownTabs.map((tab: any) => (
              <SelectItem key={tab.id} value={tab.id}>
                {tab.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div> */}

      {clientId ? (
        <ReportTable
        reports={visibleReports}
  selectedTab={selectedTab}
  canAdd={dropdownTabs.length > 0}
        isLoading={isLoadingTabs || isLoadingReports}
  tabFilter={tabFilter}
  dropdownTabs={dropdownTabs}
  onTabChange={setTabFilter}
  searchInput={searchInput}
  onSearchInputChange={setSearchInput}

   onSearch={(value) => {
    const nextSearch = (value ?? searchInput).trim();
    setSearchTxt(nextSearch);
    if (value !== undefined) {
      setSearchInput(value);
    }
    setPageNo(1);
    setReloadToken((prev) => prev + 1);
    
  }}
        onAdd={() => {
          const searchParams = new URLSearchParams();
      
          if (tabFilter !== "all") {
            searchParams.set("tab", tabFilter);
          }
      
          const search = searchParams.toString();
      
          navigate(
            search
              ? `/dashboard/reports/add?${search}`
              : "/dashboard/reports/add"
          );
        }}
        onView={(report) => navigate(`/dashboard/reports/${report.id}`)}
        onEdit={(report) => navigate(`/dashboard/reports/${report.id}/edit`)}
        onDelete={(report) => setReportToDelete(report as ApiReport)}
        // onPageSizeChange={handlePageSizeChange}
      />
      ) : ready ? (
        <NoClientNotice />
      ) : null}

      <AlertDialog
        open={Boolean(reportToDelete)}
        onOpenChange={(o) => !o && setReportToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{reportToDelete?.reportName}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The report and its attached PDF will be removed for this client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!reportToDelete) return;
                const rowVersion = reportToDelete.rowVersion;
                const hasRowVersion =
                  typeof rowVersion === "string"
                    ? rowVersion.trim().length > 0
                    : Array.isArray(rowVersion)
                      ? rowVersion.length > 0
                      : rowVersion instanceof Uint8Array
                        ? rowVersion.length > 0
                        : false;

                if (!reportToDelete.clientPowerBiReportMappingId || !hasRowVersion) {
                  toast.error("Could not delete the report", {
                    description: "Unable to resolve backend row version for this record.",
                  });
                  return;
                }

                try {
                  await DeleteReport({
                    ClientPowerBiReportMappingId: reportToDelete.clientPowerBiReportMappingId,
                    RowVersion: rowVersion,
                  });
                  setReportToDelete(null);
                  setReloadToken((prev) => prev + 1);
                  toast.success("Report deleted");
                } catch (error) {
                  toast.error("Could not delete the report", {
                    description:
                      error instanceof Error ? error.message : "Please try again.",
                  });
                }
              }}
            >
              Delete report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageScaffold>
  );
}
