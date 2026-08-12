import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useClientRecords } from "@/lib/useClientRecords";
import { ReportForm } from "@/components/dashboard/ReportForm";
import { InlineFormPanel } from "@/components/dashboard/InlineFormPanel";
import { NoClientNotice, PageScaffold } from "@/components/dashboard/PageScaffold";
import { addReport, type ReportInput } from "@/lib/store";

export const Route = createFileRoute("/dashboard/reports/add")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search['tab'] === "string" ? (search['tab'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "New Report — Client Reports Hub" },
      { name: "description", content: "Create a report inside one of this client's tabs." },
      { property: "og:title", content: "New Report — Client Reports Hub" },
      {
        property: "og:description",
        content: "Create a report inside one of this client's tabs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportAddPage,
});

function ReportAddPage() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const { clientId, ready, tabs } = useClientRecords();
  const backToList = () => navigate({ to: "/dashboard/reports" });

  return (
    <PageScaffold
      crumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Reports", to: "/dashboard/reports" },
        { label: "New Report" },
      ]}
      eyebrow="Report Management"
      title="New Report"
      description="Pick the tab this report belongs to, name the report and attach its PDF."
    >
      {clientId ? (
        <InlineFormPanel
          title="New Report"
          description="Pick the tab this report belongs to, name the report and attach its PDF."
        >
          {tabs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a tab first, then come back to create reports.
            </p>
          ) : (
            <ReportForm
              tabs={tabs}
              defaultTabId={tab ?? tabs[0]?.id ?? null}
              report={null}
              submitLabel="Create Report"
              onCancel={backToList}
              onSubmit={(input: ReportInput) => {
                if (!clientId) {
                  toast.error("No client selected");
                  return;
                }
                try {
                  addReport(clientId, input);
                  toast.success("Report created");
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
        <NoClientNotice />
      ) : null}
    </PageScaffold>
  );
}
