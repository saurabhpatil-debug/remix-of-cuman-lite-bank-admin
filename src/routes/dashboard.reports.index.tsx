import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useClientRecords } from "@/lib/useClientRecords";
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
import { deleteReport, type Report } from "@/lib/store";

export const Route = createFileRoute("/dashboard/reports/")({
  head: () => ({
    meta: [
      { title: "Report Management — CUMAN LITE" },
      {
        name: "description",
        content:
          "Create and maintain Power BI reports and PDF attachments inside each client's tabs.",
      },
      { property: "og:title", content: "Report Management — CUMAN LITE" },
      {
        property: "og:description",
        content:
          "Create and maintain Power BI reports and PDF attachments inside each client's tabs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportListPage,
});

function ReportListPage() {
  const navigate = useNavigate();
  const { clientId, ready, tabs, reports, refresh } = useClientRecords();
  const [tabFilter, setTabFilter] = useState<string>("all");
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

  useEffect(() => {
    setTabFilter("all");
  }, [clientId]);

  const selectedTab = tabs.find((t) => t.id === tabFilter) ?? null;
  const visibleReports = useMemo(
    () => (tabFilter === "all" ? reports : reports.filter((r) => r.tabId === tabFilter)),
    [reports, tabFilter],
  );

  return (
    <PageScaffold
      crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Reports" }]}
      eyebrow="Report Management"
      title="Reports"
      description="Maintain the reports and PDF attachments available to this client."
    >
      <div className="flex w-full max-w-full flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-3 sm:gap-3 sm:px-4">
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
            {tabs.map((tab) => (
              <SelectItem key={tab.id} value={tab.id}>
                {tab.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {clientId ? (
        <ReportTable
          reports={visibleReports}
          selectedTab={selectedTab}
          canAdd={tabs.length > 0}
          onAdd={() =>
            navigate({
              to: "/dashboard/reports/add",
              search: tabFilter === "all" ? {} : { tab: tabFilter },
            })
          }
          onView={(report) =>
            navigate({ to: "/dashboard/reports/$reportId", params: { reportId: report.id } })
          }
          onEdit={(report) =>
            navigate({ to: "/dashboard/reports/$reportId/edit", params: { reportId: report.id } })
          }
          onDelete={(report) => setReportToDelete(report)}
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
              onClick={() => {
                if (!reportToDelete) return;
                deleteReport(reportToDelete.id);
                setReportToDelete(null);
                refresh();
                toast.success("Report deleted");
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
