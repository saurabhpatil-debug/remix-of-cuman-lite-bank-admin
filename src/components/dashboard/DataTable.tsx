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
  header: ReactNode;
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
  onPageSizeChange?: (size: number) => void;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  searchPlaceholder = "Search…",
  pageSize = 50,
  emptyMessage = "No records found.",
  getRowKey,
  minWidth,
  headerClassName,
  onPageSizeChange,
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
    

      <div className="max-h-[70vh] w-full max-w-full overflow-auto rounded-xl border border-border bg-card">
      <table
  className="w-full min-w-[850px] table-fixed text-xs sm:min-w-0 sm:text-sm"
  style={{
    width: "100%",
    minWidth: minWidth ?? undefined,
  }}
>
<colgroup>
  {columns.map((col) => (
    <col
      key={col.key}
      style={col.width ? { width: col.width } : undefined}
    />
  ))}
</colgroup>
          <thead className="sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`bg-secondary px-2.5 py-2.5 text-left align-middle shadow-[inset_0_-1px_0_0_var(--border)] sm:px-3 ${
                    headerClassName ??
                    "text-[10px] font-semibold tracking-normal text-muted-foreground uppercase sm:text-[11px]"
                  } ${col.className ?? ""}`}
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
                    className={`min-w-0 overflow-hidden px-2.5 py-2.5 align-middle break-words sm:px-3 ${
                      col.className ?? ""
                    }`}
                  >
                    {col.render
                      ? col.render(row)
                      : String(row[col.key] ?? "")}
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
          <span className="shrink-0 ">Records per page</span>
          <Select
            value={String(size)}
            onValueChange={(value) => {
              const newSize = Number(value);
              setSize(newSize);
              setPage(1);
              onPageSizeChange?.(newSize);
            }}
          >
            <SelectTrigger
              className="
              h-8 w-[72px]
              border-[#E66A3C]/50
              text-[#E66A3C]
              hover:border-[#E66A3C]
              focus:border-[#E66A3C]
              focus:outline-none
              focus:ring-0
              focus-visible:outline-none
              focus-visible:ring-0
              focus-visible:ring-offset-0
              shadow-none
            "
              aria-label="Records per page"
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