import { useState } from "react";
import { BarChart3, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/excel";
import type { Report, Tab } from "@/lib/store";


function CommentCell({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <span className="block min-w-0" title={text}>
      <span className={expanded ? "block break-words" : "line-clamp-3 break-words"}>{text}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
        className="mt-0.5 text-primary underline-offset-4 hover:underline"
      >
        {expanded ? "Read less" : "Read more"}
      </button>
    </span>
  );
}


export function ReportTable({
  reports,
  selectedTab,
  canAdd,
  onAdd,
  onView,
  onEdit,
  onDelete,
}: {
  reports: Report[];
  selectedTab: Tab | null;
  canAdd: boolean;
  onAdd: () => void;
  onView: (report: Report) => void;
  onEdit: (report: Report) => void;
  onDelete: (report: Report) => void;
}) {


  const baseColumns: Column<Report>[] = [
    {
      key: "reportName",
      header: "Display Name",
      width: "220px",
      className: "font-medium text-foreground",
      render: (row) => (
        <span className="block truncate font-medium text-foreground" title={row.reportName}>
          {row.reportName}
        </span>
      ),
    },
    {
      key: "uploadDate",
      header: "Upload Date",
      width: "130px",
      className: "whitespace-nowrap",
      render: (row) => formatDate(row.updatedAt),
    },
    {
      key: "balanceSheetDate",
      header: "Balance Sheet Date",
      width: "160px",
      className: "whitespace-nowrap",
      render: (row) =>
        row.balanceSheetDate ? (
          formatDate(row.balanceSheetDate)
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "comments",
      header: "Comments",
      width: "320px",
      render: (row) =>
        row.comments ? (
          <CommentCell text={row.comments} />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  const columns: Column<Report>[] = [
    ...baseColumns,
    {
      key: "viewReport",
      header: "View Report",
      width: "130px",
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          className="border-[hsl(20_90%_60%)] bg-[hsl(20_90%_97%)] text-[hsl(20_90%_50%)] hover:bg-[hsl(20_90%_94%)] hover:text-[hsl(20_90%_45%)]"
          disabled={!row.pdf}
          onClick={(e) => {
            e.stopPropagation();
            if (row.pdf) window.open(row.pdf.dataUrl, "_blank", "noopener,noreferrer");
          }}
          title={row.pdf ? row.pdf.fileName : "No PDF uploaded"}
        >
          <BarChart3 className="size-3.5" /> Report
        </Button>
      ),
    },
    {
      key: "action",
      header: "Action",
      width: "250px",
      render: (row) => (
        <div className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap">
          <Button size="sm" variant="outline" onClick={() => onView(row)}>
            <Eye className="size-3.5" /> View
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
            <Pencil className="size-3.5" /> Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(row)}
          >
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="flex w-full min-w-0 max-w-full flex-col rounded-xl border border-border bg-card">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-3 py-3 sm:flex sm:flex-wrap sm:justify-between sm:px-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 truncate text-sm font-semibold sm:text-base lg:text-sm">
            Report Management
          </h2>
          <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
            {selectedTab ? selectedTab.name : "All tabs"} · {reports.length} report
            {reports.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button size="sm" className="shrink-0" onClick={onAdd} disabled={!canAdd}>
          <Plus className="size-4" /> <span className="hidden sm:inline">New Report</span>
          <span className="sm:hidden">New</span>
        </Button>
      </header>
      <div className="min-w-0 max-w-full p-3 sm:p-4">
        <DataTable
          columns={columns}
          rows={reports}
          getRowKey={(row) => row.id}
          headerClassName="text-[12px] font-semibold tracking-normal text-primary sm:text-[13px]"
          searchPlaceholder="Search reports…"
          emptyMessage={
            canAdd ? "No reports in this tab yet." : "Add a tab first, then create reports."
          }
        />
      </div>
    </section>
  );
}
