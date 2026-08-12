import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatBytes } from "@/lib/excel";
import type { PdfRecord, Report, ReportInput, Tab } from "@/lib/store";

const MAX_BYTES = 4 * 1024 * 1024;

export function ReportForm({
  tabs,
  defaultTabId,
  report,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  tabs: Tab[];
  defaultTabId: string | null;
  report: Report | null;
  submitLabel: string;
  onSubmit: (input: ReportInput) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [reportName, setReportName] = useState(report?.reportName ?? "");
  const [balanceSheetDate, setBalanceSheetDate] = useState(report?.balanceSheetDate ?? "");
  const [comments, setComments] = useState(report?.comments ?? "");
  const [tabId, setTabId] = useState(report?.tabId ?? defaultTabId ?? tabs[0]?.id ?? "");
  const [pdf, setPdf] = useState<PdfRecord | null>(report?.pdf ?? null);
  const [errors, setErrors] = useState<{ reportName?: string; tabId?: string }>({});
  const [saving, setSaving] = useState(false);

  const handleFile = (file: File) => {
    if (!/\.pdf$/i.test(file.name)) {
      toast.error("Only PDF files are allowed");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File too large", { description: "Please upload a PDF under 4 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPdf({
        fileName: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        dataUrl: String(reader.result ?? ""),
      });
      toast.success("PDF attached — save the report to keep it");
    };
    reader.onerror = () => toast.error("Could not read that file");
    reader.readAsDataURL(file);
  };

  const submit = () => {
    const next: { reportName?: string; tabId?: string } = {};
    if (!tabId) next.tabId = "Select a tab.";
    if (reportName.trim().length === 0) next.reportName = "Display Name is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSaving(true);
    try {
      onSubmit({
        tabId,
        reportName: reportName.trim(),
        balanceSheetDate,
        comments: comments.trim(),
        type: "pdf",
        workspaceId: report?.workspaceId ?? "",
        reportId: report?.reportId ?? "",
        embedUrl: report?.embedUrl ?? "",
        embedToken: report?.embedToken ?? "",
        datasetId: report?.datasetId ?? "",
        pdf,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="space-y-2">
        <Label>Select Tab</Label>
        <Select value={tabId} onValueChange={setTabId}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue placeholder="Choose a tab" />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.tabId ? (
          <p className="text-xs break-words text-destructive">{errors.tabId}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rep-reportName">Display Name</Label>
        <Input
          id="rep-reportName"
          value={reportName}
          onChange={(e) => {
            setReportName(e.target.value);
            setErrors(({ tabId: t }) => (t ? { tabId: t } : {}));
          }}
        />
        {errors.reportName ? (
          <p className="text-xs break-words text-destructive">{errors.reportName}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <Select value="pdf" disabled>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rep-bsDate">Balance Sheet Date</Label>
        <Input
          id="rep-bsDate"
          type="date"
          value={balanceSheetDate}
          onChange={(e) => setBalanceSheetDate(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rep-comments">Comments</Label>
        <Textarea
          id="rep-comments"
          rows={4}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>

      <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4">
        <Label className="block">PDF</Label>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
        {pdf ? (
          <div className="flex w-full flex-wrap items-center gap-3 text-sm">
            <FileText className="size-4 shrink-0 text-primary" />
            <a
              href={pdf.dataUrl}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 truncate font-medium text-primary underline-offset-4 hover:underline"
            >
              {pdf.fileName}
            </a>
            <span className="text-muted-foreground">{formatBytes(pdf.size)}</span>
            <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
              <Upload className="size-4" /> Replace
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setPdf(null)}>
              <X className="size-4" /> Remove
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" /> Upload PDF
          </Button>
        )}
        <p className="text-xs text-muted-foreground">PDF only, up to 4 MB.</p>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end sm:gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}