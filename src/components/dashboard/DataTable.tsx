import { useMemo, useState, type ReactNode } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  width?: string;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  searchPlaceholder?: string;
  pageSize?: number;
  emptyMessage?: string;
  getRowKey: (row: T, index: number) => string;
  minWidth?: string;
  headerClassName?: string;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  searchPlaceholder = "Search…",
  pageSize = 10,
  emptyMessage = "No records found.",
  getRowKey,
  minWidth,
  headerClassName,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) =>
        typeof value === "string" || typeof value === "number"
          ? String(value).toLowerCase().includes(q)
          : false,
      ),
    );
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, totalPages);
  const slice = filtered.slice((current - 1) * size, current * size);
  const from = filtered.length === 0 ? 0 : (current - 1) * size + 1;
  const to = Math.min(current * size, filtered.length);

  const totalPx = columns.reduce((sum, col) => {
    const match = /^(\d+(?:\.\d+)?)px$/.exec(col.width ?? "");
    return match ? sum + Number(match[1]) : sum;
  }, 0);
  const tableMinWidth = minWidth ?? (totalPx > 0 ? `${totalPx}px` : "40rem");

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder={searchPlaceholder}
          className="w-full pl-9 text-sm"
          aria-label="Search table"
        />
      </div>

      <div className="max-h-[70vh] w-full max-w-full overflow-auto rounded-xl border border-border bg-card">
        <table
          className="w-full table-fixed text-xs sm:text-sm"
          style={{ minWidth: tableMinWidth }}
        >
          <colgroup>
            {columns.map((col) => (
              <col key={col.key} style={col.width ? { width: col.width } : undefined} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`bg-secondary px-2.5 py-2.5 text-left align-middle whitespace-nowrap shadow-[inset_0_-1px_0_0_var(--border)] sm:px-3 ${headerClassName ?? "text-[10px] font-semibold tracking-normal text-muted-foreground uppercase sm:text-[11px]"} ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-xs text-muted-foreground sm:text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              slice.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  className="border-t border-border/70 align-top transition-colors hover:bg-secondary/40"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-2.5 py-2.5 align-middle break-words sm:px-3 ${col.className ?? ""}`}
                    >
                      {col.render ? col.render(row) : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <nav
        aria-label="Pagination"
        className="flex flex-wrap items-center justify-end gap-x-4 gap-y-3 text-xs text-muted-foreground sm:text-sm"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-primary">Items per page</span>
          <Select
            value={String(size)}
            onValueChange={(value) => {
              setSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger
              className="h-9 w-[4.75rem] shrink-0 border-primary/60 text-foreground"
              aria-label="Items per page"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="whitespace-nowrap tabular-nums text-foreground">
          {from}–{to} of {filtered.length}
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-md"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-md"
            disabled={current >= totalPages}
            onClick={() => setPage(current + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </nav>
    </div>
  );
}