import { useRef, useState } from "react";
import { CalendarIcon, FileText, Upload, X } from "lucide-react";
import { format } from "date-fns";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatBytes } from "@/lib/excel";
import { cn } from "@/lib/utils";
import type { PdfRecord, Report } from "@/lib/store";

const MAX_BYTES = 20 * 1024 * 1024;

function parseBalanceSheetDate(value?: string) {
  if (!value) return undefined;

  // Existing saved values may be yyyy-mm-dd.
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const parsed = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  // Accept mm/dd/yy or mm/dd/yyyy if present.
  const slashMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{2}|\d{4})$/);
  if (slashMatch) {
    const month = Number(slashMatch[1]);
    const day = Number(slashMatch[2]);
    const yearPart = slashMatch[3] ?? "";
    const year = yearPart.length === 2 ? 2000 + Number(yearPart) : Number(yearPart);
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  return undefined;
}

export type ReportFormInput = {
  tabId: string;
  reportName: string;
  balanceSheetDate?: string;
  comments?: string;
  type?: string;
  workspaceId: string;
  reportId: string;
  embedUrl: string;
  embedToken: string;
  datasetId: string;
  pdf?: PdfRecord | null;
  artifactTypeId?: number | undefined;
};

type DropdownOption = {
  id: string;
  name: string;
};

export function ReportForm({
  tabs,
  artifacts,
  defaultArtifactTypeId,
  defaultTabId,
  report,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  tabs: DropdownOption[];
  artifacts?: DropdownOption[];
  defaultArtifactTypeId?: number | undefined;
  defaultTabId: string | null;
  report: Report | null;
  submitLabel: string;
  onSubmit: (input: ReportFormInput) => Promise<boolean | void> | boolean | void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [reportName, setReportName] = useState(report?.reportName ?? "");
  const initialBalanceSheetDate = parseBalanceSheetDate(report?.balanceSheetDate);
  const [balanceSheetDate, setBalanceSheetDate] = useState(
    initialBalanceSheetDate ? format(initialBalanceSheetDate, "yyyy-MM-dd") : "",
  );
  const [comments, setComments] = useState(report?.comments ?? "");
  const [tabId, setTabId] = useState(report?.tabId ?? defaultTabId ?? tabs[0]?.id ?? "");
  const [artifactTypeId, setArtifactTypeId] = useState(
    defaultArtifactTypeId ? String(defaultArtifactTypeId) : artifacts?.[0]?.id ?? "",
  );
  const [pdf, setPdf] = useState<PdfRecord | null>(report?.pdf ?? null);
  const [errors, setErrors] = useState<{
    reportName?: string;
    tabId?: string;
    balanceSheetDate?: string;
    artifactTypeId?: string;
    pdf?: string;
  }>({});
  const [saving, setSaving] = useState(false);
  const [removePdfOpen, setRemovePdfOpen] = useState(false);

  const handleFile = (file: File) => {
    if (!/\.pdf$/i.test(file.name)) {
      toast.error("Only PDF files are allowed");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File too large", { description: "Please upload a PDF under 20 MB." });
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
  const [artifactType, setArtifactType] = useState("PDF");
  const handleRemovePdf = () => {
    setRemovePdfOpen(true);
  };

  const submit = async () => {
    const next: {
      reportName?: string;
      tabId?: string;
      balanceSheetDate?: string;
      artifactTypeId?: string;
      pdf?: string;
    } = {};
    const trimmedReportName = reportName.trim();
    const MAX_DISPLAY_NAME_LENGTH = 100;

   const DISPLAY_NAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9 _()\-]*$/;
    if (!tabId) next.tabId = "Select a tab.";
    if ((artifacts?.length ?? 0) > 0 && !artifactTypeId) {
      next.artifactTypeId = "Select an artifact type.";
    }
    if (!trimmedReportName) {
      next.reportName = "Display Name is required.";
    } else if (trimmedReportName.length > MAX_DISPLAY_NAME_LENGTH) {
      next.reportName = `Display Name cannot exceed ${MAX_DISPLAY_NAME_LENGTH} characters.`;
    } else if (!DISPLAY_NAME_REGEX.test(trimmedReportName)) {
      next.reportName =
        "Display Name can contain only letters, numbers, spaces, hyphens, underscores, and parentheses.";
    }
    if (!balanceSheetDate) {
      next.balanceSheetDate = "Balance Sheet Date is required.";
    }
    if (!report && !pdf) next.pdf = "Upload a PDF file.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      await onSubmit({
        tabId,
        reportName: reportName.trim(),
        balanceSheetDate,
        comments: comments.trim(),
       
        workspaceId: report?.workspaceId ?? "",
        reportId: report?.reportId ?? "",
        embedUrl: report?.embedUrl ?? "",
        embedToken: report?.embedToken ?? "",
        datasetId: report?.datasetId ?? "",
        pdf,
        artifactTypeId: artifactTypeId ? Number(artifactTypeId) : undefined,
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
        void submit();
      }}
    >
      <div className="space-y-2">
        <Label>Select Tab <span className="text-destructive">*</span></Label>
        <Select value={tabId} onValueChange={setTabId}>
          <SelectTrigger className="w-full">
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
        <Label htmlFor="rep-reportName">Display Name <span className="text-destructive">*</span></Label>
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
      <div className={cn("grid gap-4", (artifacts?.length ?? 0) > 0 ? "md:grid-cols-2" : "grid-cols-1")}>
        {(artifacts?.length ?? 0) > 0 ? (
          <div className="space-y-2">
            <Label>Artifact Type <span className="text-destructive">*</span></Label>

            <Select
              value={artifactType}
              onValueChange={setArtifactType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="PDF" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="PBI" disabled>
                  PBI
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="rep-bsDate">Balance Sheet Date <span className="text-destructive">*</span></Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-between text-left font-normal",
                  !balanceSheetDate && "text-muted-foreground",
                )}
              >
                {balanceSheetDate
                  ? format(new Date(`${balanceSheetDate}T00:00:00`), "MM/dd/yy")
                  : "MM/DD/YY"}
                <CalendarIcon className="size-4 opacity-70" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                selected={balanceSheetDate ? new Date(`${balanceSheetDate}T00:00:00`) : undefined}
                onSelect={(date) => {
                  setBalanceSheetDate(date ? format(date, "yyyy-MM-dd") : "");
                  setErrors((prev) => ({
                    ...prev,
                    balanceSheetDate: "",
                  }));
                }}
              />
            </PopoverContent>
          </Popover>
          <Input id="rep-bsDate" type="hidden" value={balanceSheetDate} readOnly />
          {errors.balanceSheetDate ? (
            <p className="text-xs break-words text-destructive">{errors.balanceSheetDate}</p>
          ) : null}
        </div>
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
        <Label className="block">PDF <span className="text-destructive">*</span></Label>
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
            {/* <span className="text-muted-foreground">{formatBytes(pdf.size)}</span> */}
            <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => inputRef.current?.click()}>
              <Upload className="size-4" /> Replace
            </Button>

            <Button type="button" size="sm" variant="outline" disabled={saving} onClick={handleRemovePdf}>
              <X className="size-4" /> Remove
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" /> Upload PDF
          </Button>
        )}
        <p className="text-xs text-muted-foreground">PDF only, up to 20 MB.</p>
        {errors.pdf ? <p className="text-xs break-words text-destructive">{errors.pdf}</p> : null}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end sm:gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </Button>
      </div>

      <AlertDialog open={removePdfOpen} onOpenChange={setRemovePdfOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove PDF?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this PDF?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={() => {
                setPdf(null);
                setRemovePdfOpen(false);
              }}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}









