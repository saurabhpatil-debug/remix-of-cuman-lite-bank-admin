export interface ClientTabsVM {
  ClientTabsId: number;
  ClientTabName: string;
  ReportCount?: number;
  HelpFileURL: string;
  PDFURL: string;
  FileSize: string;
  OrderLevel?: number;
  RowVersion: string | Uint8Array | number[];
}
