import { useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/excel";
import type { Report, Tab } from "@/lib/store";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Pencil,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";
import { FaFilePdf } from "react-icons/fa";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function CommentCell({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  const isLongText = text.length > 120;

  return (
    <div className="w-full min-w-0">
      <div
        className={
          expanded && isLongText
            ? "w-full break-words whitespace-normal"
            : isLongText
              ? "w-full line-clamp-3 break-words whitespace-normal"
              : "w-full break-words whitespace-normal"
        }
        title={text}
      >
        {text}
      </div>

      {isLongText && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="mt-1 block whitespace-nowrap text-primary underline-offset-4 hover:underline"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}

type SortKey =
  | "reportName"
  | "uploadDate"
  | "balanceSheetDate"
  | "comments";

type SortDirection = "asc" | "desc";

export function ReportTable({
  reports,
  selectedTab,
  canAdd,
  onAdd,
  onView,
  onEdit,
  onDelete,
  tabFilter,
  dropdownTabs,
  onTabChange,
  searchInput,
  onSearchInputChange,
  onSearch,
  isLoading,
  onPageSizeChange,
}: {
  reports: Report[];
  selectedTab: Tab | null;
  canAdd: boolean;
  onAdd: () => void;
  onView: (report: Report) => void;
  onEdit: (report: Report) => void;
  onDelete: (report: Report) => void;

  tabFilter: string;
  dropdownTabs: { id: string; name: string }[];
  onTabChange: (value: string) => void;
  onSearch: (value?: string) => void;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  isLoading: boolean;
  onPageSizeChange?: (size: number) => void;
}) {
  // ------------------------------------------
  // SORTING STATE
  // ------------------------------------------

  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  } | null>(null);

  // ------------------------------------------
  // SORT HANDLER
  // ------------------------------------------

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => {
      // First click = ascending
      if (!current || current.key !== key) {
        return {
          key,
          direction: "asc",
        };
      }

      // Second click = descending
      if (current.direction === "asc") {
        return {
          key,
          direction: "desc",
        };
      }

      // Third click = ascending again
      return {
        key,
        direction: "asc",
      };
    });
  };

  // ------------------------------------------
  // SORT ICON
  // ------------------------------------------

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="size-3.5 opacity-50" />;
    }

    if (sortConfig.direction === "asc") {
      return <ArrowUp className="size-3.5" />;
    }

    return <ArrowDown className="size-3.5" />;
  };

  // ------------------------------------------
  // SORTABLE HEADER
  // ------------------------------------------

  const sortableHeader = (label: string, key: SortKey) => {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleSort(key);
        }}
        className="flex w-full items-center gap-1 text-left text-[10px] leading-none sm:text-[11px]"
      >
        <span>{label}</span>
        {getSortIcon(key)}
      </button>
    );
  };

  // ------------------------------------------
  // SORT REPORTS
  // ------------------------------------------

  const sortedReports = useMemo(() => {
    if (!sortConfig) {
      return reports;
    }

    const sorted = [...reports];

    sorted.sort((a, b) => {
      const { key, direction } = sortConfig;

      let valueA: string | number = "";
      let valueB: string | number = "";

      switch (key) {
        // --------------------------------------
        // DISPLAY NAME
        // --------------------------------------
        case "reportName":
          valueA = a.reportName?.toLowerCase() ?? "";
          valueB = b.reportName?.toLowerCase() ?? "";
          break;

        // --------------------------------------
        // UPLOAD DATE
        // --------------------------------------
        case "uploadDate":
          valueA = a.updatedAt
            ? new Date(a.updatedAt).getTime()
            : 0;

          valueB = b.updatedAt
            ? new Date(b.updatedAt).getTime()
            : 0;
          break;

        // --------------------------------------
        // BALANCE SHEET DATE
        // --------------------------------------
        case "balanceSheetDate":
          valueA = a.balanceSheetDate
            ? new Date(a.balanceSheetDate).getTime()
            : 0;

          valueB = b.balanceSheetDate
            ? new Date(b.balanceSheetDate).getTime()
            : 0;
          break;

        // --------------------------------------
        // COMMENTS
        // --------------------------------------
        case "comments":
          valueA = a.comments?.toLowerCase() ?? "";
          valueB = b.comments?.toLowerCase() ?? "";
          break;
      }

      if (valueA < valueB) {
        return direction === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return direction === "asc" ? 1 : -1;
      }

      return 0;
    });

    return sorted;
  }, [reports, sortConfig]);

  // ------------------------------------------
  // BASE COLUMNS
  // ------------------------------------------

  const baseColumns: Column<Report>[] = [
    {
      key: "reportName",
      header: sortableHeader("Display Name", "reportName"),
      width: "35%",
      className: "w-[35%] min-w-0 font-medium text-foreground",

      render: (row) => (
        <span
          className="block w-full truncate font-medium text-foreground"
          title={row.reportName}
        >
          {row.reportName}
        </span>
      ),
    },

    {
      key: "uploadDate",
      header: sortableHeader("Upload Date", "uploadDate"),
      width: "10%",
      className: "w-[10%] ",

      render: (row) => formatDate(row.updatedAt),
    },

    {
      key: "balanceSheetDate",
      header: sortableHeader("Balance Sheet Date", "balanceSheetDate"),
      width: "10%",
      className: "w-[10%] text-[10px] sm:text-[11px]",
      render: (row) =>
        row.balanceSheetDate ? (
          formatDate(row.balanceSheetDate)
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },

    {
      key: "comments",
      header: sortableHeader("Comments", "comments"),
      width: "35%",
      className: "w-[35%] min-w-0",

      render: (row) =>
        row.comments ? (
          <CommentCell text={row.comments} />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  // ------------------------------------------
  // ACTIONS HEADER
  // ------------------------------------------

  const actionsHeader = (
    <span className="inline-block mr-4">
      Actions
    </span>
  );

  // ------------------------------------------
  // ALL COLUMNS
  // ------------------------------------------

  const columns: Column<Report>[] = [
    ...baseColumns,


    // ----------------------------------------
    // ACTIONS
    // ----------------------------------------

    {
      key: "action",
      header: actionsHeader as unknown as string,

      className:
        " w-[10%] text-right text-xs sm:text-sm font-medium text-foreground",

      width: "10%",


      render: (row) => (
        <div className="flex flex-nowrap items-center justify-end gap-3 whitespace-nowrap mr-2">
          {/* EDIT */}

          <span
            className="cursor-pointer "
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
            title="Edit"
          >
            <Pencil className="size-3.5" />
          </span>

          {/* DELETE */}

          <span
            className="cursor-pointer text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row);
            }}
            title="Delete"
          >
            <Trash2 className="size-3.5" />
          </span>
        </div>
      ),
    },
  ];

  // ------------------------------------------
  // UI
  // ------------------------------------------

  return (
    <section className="flex w-full min-w-0 max-w-full flex-col rounded-xl border border-border bg-card">
      {/* HEADER */}

      <header className="flex w-full flex-col gap-3 border-b border-border px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        {/* LEFT */}

        <div className="min-w-0 shrink-0">
          <h2 className="text-sm font-semibold text-foreground">
            Report Management
          </h2>

          <p className="text-[11px] text-muted-foreground sm:text-xs">
            {selectedTab
              ? selectedTab.name
              : "All tabs"}{" "}
            · {reports.length} report
            {reports.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* RIGHT CONTROLS */}

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
          {/* TAB */}

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Select
              value={tabFilter}
              onValueChange={onTabChange}
            >
              <SelectTrigger className="h-10 w-full border-[#E66A3C]/50 text-[#E66A3C] focus:ring-[#E66A3C]/50 hover:text-[#E66A3C] sm:w-[220px] lg:w-[255px]">                <SelectValue placeholder="All tabs" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All tabs
                </SelectItem>

                {dropdownTabs.map((tab) => (
                  <SelectItem
                    key={tab.id}
                    value={tab.id}
                  >
                    {tab.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* SEARCH */}


          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative w-full sm:w-[175px] lg:w-[175px]">
              <input
                id="search-display-name"
                name="searchDisplayName"
                type="text"
                value={searchInput}
                onChange={(e) => onSearchInputChange(e.target.value)}
                placeholder="Search Display Name..."
                className="
    h-10
    w-44
    rounded-lg
    border
    border-[#E66A3C]/50
 
    px-3
    text-sm
    text-[#E66A3C]
    shadow-sm
    outline-none
    placeholder:text-[#E66A3C]
    focus:border-[#E66A3C]
    focus:ring-1
    focus:ring-[#E66A3C]/50
    focus-visible:border-[#E66A3C]
    focus-visible:ring-1
    focus-visible:ring-[#E66A3C]/50
  "
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSearch();
                  }
                }}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => onSearch()}
              className="h-10 px-3 border-[#E66A3C]/50 text-[#E66A3C] hover:bg-[#E66A3C]/10 hover:text-[#E66A3C]"
            >
              <Search className="size-4" />
              Search
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onSearchInputChange("");
                onSearch("");
              }}
              className="h-10 px-3 border-[#E66A3C]/50 text-[#E66A3C] hover:bg-[#E66A3C]/10 hover:text-[#E66A3C]"
            >
              Clear
            </Button>
          </div>

          {/* ADD */}

          <Button
            className="bg-[#E66A3C] px-6 py-2 text-white hover:bg-[#E66A3C]/90"
            onClick={onAdd}
            disabled={!canAdd}
          >
            <span className="hidden sm:inline">
              Add
            </span>

            <span className="sm:hidden">
              New
            </span>
          </Button>
        </div>
      </header>

      {/* TABLE */}

      <div className="min-w-0 max-w-full p-3 sm:p-4">
        {isLoading ? (
          <div className="flex min-h-[120px] w-full items-center justify-center rounded-lg border border-border bg-background">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span>Loading reports...</span>
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={sortedReports}
            pageSize={50}
            getRowKey={(row) => row.id}
            headerClassName="text-[12px] font-semibold tracking-normal text-primary sm:text-[13px]"
            emptyMessage={
              canAdd
                ? "No reports in this tab yet."
                : "Add a tab first, then create reports."
            }
          />
        )}
      </div>
    </section>
  );
}