import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useClientRecords } from "@/lib/useClientRecords";
import { ReportForm } from "@/components/dashboard/ReportForm";
import { InlineFormPanel } from "@/components/dashboard/InlineFormPanel";
import {
  NoClientNotice,
  NotFoundNotice,
  PageScaffold,
} from "@/components/dashboard/PageScaffold";
import { updateReport, type ReportInput } from "@/lib/store";

export const Route = createFileRoute("/dashboard/reports/$reportId/edit")({
  head: () => ({
    meta: [
      { title: "Update Report — CUMAN LITE" },
      { name: "description", content: "Update a report's details and PDF attachment." },
      { property: "og:title", content: "Update Report — CUMAN LITE" },
      { property: "og:description", content: "Update a report's details and PDF attachment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportEditPage,
});

function ReportEditPage() {
  const { reportId } = Route.useParams();
  const navigate = useNavigate();
  const { clientId, ready, tabs, reports } = useClientRecords();
  const report = reports.find((r) => r.id === reportId) ?? null;
  const backToList = () => navigate({ to: "/dashboard/reports" });

  return (
    <PageScaffold
      crumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Reports", to: "/dashboard/reports" },
        { label: report ? report.reportName : "Report" },
        { label: "Edit" },
      ]}
      eyebrow="Report Management"
      title="Update Report"
      description="Pick the tab this report belongs to, name the report and attach its PDF."
    >
      {!clientId ? (
        ready ? (
          <NoClientNotice />
        ) : null
      ) : report ? (
        <InlineFormPanel
          title="Update Report"
          description="Pick the tab this report belongs to, name the report and attach its PDF."
        >
          {tabs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a tab first, then come back to create reports.
            </p>
          ) : (
            <ReportForm
              key={report.id}
              tabs={tabs}
              defaultTabId={report.tabId}
              report={report}
              submitLabel="Save changes"
              onCancel={backToList}
              onSubmit={(input: ReportInput) => {
                try {
                  updateReport(report.id, input);
                  toast.success("Report updated");
                  backToList();
                } catch (error) {
                  toast.error("Could not save the report", {
                    description: error instanceof Error ? error.message : "Please try again.",
                  });
                  throw error;
                }
              }}
            />
          )}
        </InlineFormPanel>
      ) : ready ? (
        <NotFoundNotice>That report no longer exists for this client.</NotFoundNotice>
      ) : null}
    </PageScaffold>
  );
}
