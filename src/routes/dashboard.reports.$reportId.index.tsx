import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileText, Pencil } from "lucide-react";
import { useClientRecords } from "@/lib/useClientRecords";
import { Button } from "@/components/ui/button";
import { formatBytes, formatDate } from "@/lib/excel";
import {
  DetailGrid,
  DetailItem,
  NoClientNotice,
  NotFoundNotice,
  PageScaffold,
} from "@/components/dashboard/PageScaffold";

export const Route = createFileRoute("/dashboard/reports/$reportId/")({
  head: () => ({
    meta: [
      { title: "Report Details — CUMAN LITE" },
      { name: "description", content: "Review a report's details and its attached PDF." },
      { property: "og:title", content: "Report Details — CUMAN LITE" },
      { property: "og:description", content: "Review a report's details and its attached PDF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportViewPage,
});

function ReportViewPage() {
  const { reportId } = Route.useParams();
  const navigate = useNavigate();
  const { clientId, ready, tabs, reports } = useClientRecords();
  const report = reports.find((r) => r.id === reportId) ?? null;
  const tabName = report ? (tabs.find((t) => t.id === report.tabId)?.name ?? "—") : "—";

  return (
    <PageScaffold
      crumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Reports", to: "/dashboard/reports" },
        { label: report ? report.reportName : "Report" },
      ]}
      eyebrow="Report Management"
      title={report ? report.reportName : "Report Details"}
      description="Read-only view of this report and its attachment."
      action={
        report ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              navigate({
                to: "/dashboard/reports/$reportId/edit",
                params: { reportId: report.id },
              })
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
      ) : report ? (
        <DetailGrid>
          <DetailItem label="Display Name">{report.reportName}</DetailItem>
          <DetailItem label="Tab">{tabName.toUpperCase()}</DetailItem>
          <DetailItem label="Balance Sheet Date">
            {report.balanceSheetDate ? (
              formatDate(report.balanceSheetDate)
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </DetailItem>
          <DetailItem label="Updated">{formatDate(report.updatedAt)}</DetailItem>
          <DetailItem label="PDF">
            {report.pdf ? (
              <span className="flex min-w-0 flex-wrap items-center gap-2">
                <a
                  href={report.pdf.dataUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-1.5 text-primary underline-offset-4 hover:underline"
                >
                  <FileText className="size-4 shrink-0" />
                  <span className="truncate">{report.pdf.fileName}</span>
                </a>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(report.pdf.size)}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">Not uploaded</span>
            )}
          </DetailItem>
          <DetailItem label="Comments">
            {report.comments ? (
              <span className="whitespace-pre-wrap">{report.comments}</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </DetailItem>
        </DetailGrid>
      ) : ready ? (
        <NotFoundNotice>That report no longer exists for this client.</NotFoundNotice>
      ) : null}
    </PageScaffold>
  );
}
