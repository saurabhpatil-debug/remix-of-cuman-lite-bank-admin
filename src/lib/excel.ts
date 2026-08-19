import { ROW_ID_KEY, type SheetData, type Workbook } from "./store";

export async function parseWorkbook(file: File): Promise<Workbook> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  const sheets: SheetData[] = wb.SheetNames.map((name) => {
    const ws = wb.Sheets[name];
    if (!ws) return { name, columns: [], rows: [] };
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, {
      header: 1,
      blankrows: false,
      defval: "",
      raw: false,
    });

    if (matrix.length === 0) return { name, columns: [], rows: [] };

    const headerRow = matrix[0] ?? [];
    const columns = headerRow.map((h, i) => {
      const label = String(h ?? "").trim();
      return label.length > 0 ? label : `Column ${i + 1}`;
    });

    const rows = matrix.slice(1).map((raw, index) => {
      const row: Record<string, string> = { [ROW_ID_KEY]: `r${index + 1}` };
      columns.forEach((col, i) => {
        row[col] = String(raw?.[i] ?? "").trim();
      });
      return row;
    });

    return { name, columns, rows };
  });

  return {
    fileName: file.name,
    uploadedAt: new Date().toISOString(),
    sheets,
  };
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}