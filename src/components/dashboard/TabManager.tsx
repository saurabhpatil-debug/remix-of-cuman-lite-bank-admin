import { ChevronDown, ChevronUp, Layers, Pencil, Loader2, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Report, Tab } from "@/lib/store";
import { DataTable, type Column } from "@/components/dashboard/DataTable";


export function TabManager({
  tabs,
  reports,
  selectedTabId,
  canAdd,
  searchValue,
  onSearchChange,
  onSearch,
  onSelect,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isMovingTabId,
  isLoading = false,
}: {
  tabs: Tab[];
  reports: Report[];
  canAdd: boolean;
  selectedTabId: string | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelect: (tabId: string | null) => void;
  onSearch: (value?: string) => void;
  onAdd: () => void;
  onView: (tab: Tab) => void;
  onEdit: (tab: Tab) => void;
  onDelete: (tab: Tab) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isMovingTabId?: string | null;
  isLoading?: boolean;
}) {
  const countFor = (tab: Tab) => tab.reportCount ?? reports.filter((r) => r.tabId === tab.id).length;
  const actionsHeader = <span className="inline-block mr-10">Actions</span>;

  const columns: Column<Tab>[] = [
    {
      key: "order",
      header: "Order No.",
      width: "10%",

      render: (row) => (
        <span className="text-xs sm:text-sm  text-foreground">
          {tabs.findIndex((tab) => tab.id === row.id) + 1}
        </span>
      ),
    },

    {
      key: "name",
      header: "Tab Name",
      width: "40%",

      render: (row) => (
        <span className="block truncate text-xs sm:text-sm font-medium text-foreground uppercase">
          {row.name}
        </span>
      ),
    },

    {
      key: "reports",
      header: "Reports",
      width: "10%",

      render: (row) => (
        <span className="text-xs sm:text-sm text-foreground">
          {countFor(row)}
        </span>
      ),
    },

    {
      key: "actions",
      header: actionsHeader as unknown as string,
      width: "10%",

      className: "text-right text-xs sm:text-sm font-medium text-foreground ",
      render: (row) => {
        const index = tabs.findIndex((tab) => tab.id === row.id);

        return (
          <div className="flex items-center justify-end gap-0.5">
            <Button
              size="icon"
              variant="ghost"
              className="size-6 sm:size-7"
              aria-label={`Move ${row.name} up`}
              onClick={() => onMoveUp(index)}
              disabled={index === 0 || isMovingTabId === row.id}
            >
              <ChevronUp className="size-3 sm:size-3.5" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="size-6 sm:size-7"
              aria-label={`Move ${row.name} down`}
              onClick={() => onMoveDown(index)}
              disabled={index === tabs.length - 1 || isMovingTabId === row.id}
            >
              <ChevronDown className="size-3 sm:size-3.5" />
            </Button>

            {/*
          <Button
            size="icon"
            variant="ghost"
            className="size-6 sm:size-7"
            aria-label={`View ${row.name}`}
            onClick={() => onView(row)}
          >
            <Eye className="size-3 sm:size-3.5" />
          </Button>
          */}

            <Button
              size="icon"
              variant="ghost"
              className="size-6 sm:size-7"
              aria-label={`Edit ${row.name}`}
              onClick={() => onEdit(row)}
            >
              <Pencil className="size-3 sm:size-3.5" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="size-6 sm:size-7 text-destructive hover:text-destructive"
              aria-label={`Delete ${row.name}`}
              onClick={() => onDelete(row)}
            >
              <Trash2 className="size-3 sm:size-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];
  return (
    <section className="flex w-full min-w-0 max-w-full flex-col rounded-xl border border-border bg-card">
      <header className="flex flex-col gap-3 border-b border-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Layers className="size-4 shrink-0 text-primary" />
          <h2 className="truncate text-sm font-semibold sm:text-base lg:text-sm">Tab Management</h2>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
          {/* <div className="relative min-w-0 flex-1 sm:w-60 sm:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tabs…"
              className="w-full pl-9 text-sm"
              aria-label="Search tabs"
            />
          </div> */}
         <div className="flex min-w-0 flex-1 items-center gap-2 sm:w-auto sm:flex-none">
            {/* Search Input */}
       <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearch();
                }
              }}
              placeholder="Search Tab Name..."
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
              aria-label="Search tabs"
            />

            {/* Search Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onSearch(searchValue)}
        className="h-10 px-3 border-[#E66A3C]/50 text-[#E66A3C] hover:bg-[#E66A3C]/10 hover: text-[#E66A3C]"
              aria-label="Search"
            >
              <Search className="size-4" />
            </Button>

            {/* Clear Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onSearchChange("");
                onSearch("");
              }}
         className="h-10 px-3 border-[#E66A3C]/50 text-[#E66A3C] hover:bg-[#E66A3C]/10 hover: text-[#E66A3C]"
 
            >
              Clear
            </Button>
          </div>
        <Button  className="bg-[#E66A3C] px-6 py-2 text-white hover:bg-[#E66A3C]/90" onClick={onAdd}>
            Add
          </Button>
        </div>
      </header>
      <div className="min-w-0 max-w-full p-3 sm:p-4">
  {isLoading ? (
    <div className="flex min-h-[120px] w-full items-center justify-center rounded-lg border border-border bg-background">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-5 animate-spin text-primary" />
        <span>Loading tabs...</span>
      </div>
    </div>
  ) : (
    <DataTable
      columns={columns}
      rows={tabs}
      getRowKey={(row) => row.id}
      headerClassName="text-[12px] font-semibold tracking-normal text-primary sm:text-[13px]"
      emptyMessage={
        canAdd
          ? "No tabs available."
          : "No tabs available."
      }
    />
  )}
</div>

    </section>
  );
}