import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useClientRecords } from "@/lib/useClientRecords";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/excel";
import {
  DetailGrid,
  DetailItem,
  NoClientNotice,
  NotFoundNotice,
  PageScaffold,
} from "@/components/dashboard/PageScaffold";

export const Route = createFileRoute("/dashboard/tabs/$tabId/")({
  head: () => ({
    meta: [
      { title: "Tab Details — CUMAN LITE" },
      { name: "description", content: "Review a tab and the reports assigned to it." },
      { property: "og:title", content: "Tab Details — CUMAN LITE" },
      { property: "og:description", content: "Review a tab and the reports assigned to it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TabViewPage,
});

function TabViewPage() {
  const { tabId } = Route.useParams();
  const navigate = useNavigate();
  const { clientId, ready, tabs, reports } = useClientRecords();
  const tab = tabs.find((t) => t.id === tabId) ?? null;
  const tabReports = reports.filter((r) => r.tabId === tabId);

  return (
    <PageScaffold
      crumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Tabs", to: "/dashboard/tabs" },
        { label: tab ? tab.name : "Tab" },
      ]}
      eyebrow="Tab Management"
      title={tab ? tab.name : "Tab Details"}
      description="Read-only view of the tab and the reports it currently holds."
      action={
        tab ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              navigate({ to: "/dashboard/tabs/$tabId/edit", params: { tabId: tab.id } })
            }
          >
            <Pencil className="size-4" /> Edit
          </Button>
        ) : null
      }
    >
      {!clientId ? (
        ready ? (
          <NoClientNotice />
        ) : null
      ) : tab ? (
        <>
          <DetailGrid>
            <DetailItem label="Tab Name">{tab.name}</DetailItem>
            <DetailItem label="Created">{formatDate(tab.createdAt)}</DetailItem>
            <DetailItem label="Reports">
              {tabReports.length} report{tabReports.length === 1 ? "" : "s"}
            </DetailItem>
          </DetailGrid>

          <section className="rounded-xl border border-border bg-card">
            <header className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">Reports in this tab</h2>
            </header>
            {tabReports.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No reports in this tab yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {tabReports.map((report) => (
                  <li
                    key={report.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {report.reportName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        Updated {formatDate(report.updatedAt)}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link
                        to="/dashboard/reports/$reportId"
                        params={{ reportId: report.id }}
                      >
                        View report
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : ready ? (
        <NotFoundNotice>That tab no longer exists for this client.</NotFoundNotice>
      ) : null}
    </PageScaffold>
  );
}
