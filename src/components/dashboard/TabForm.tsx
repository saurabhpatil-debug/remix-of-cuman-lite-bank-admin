import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBytes } from "@/lib/excel";
import type { HelpFileRecord } from "@/lib/store";

const MAX_BYTES = 4 * 1024 * 1024;

export type TabFormValues = {
  name: string;
  order: number;
  helpFile: HelpFileRecord | null;
};

export function TabForm({
  initialName,
  initialOrder,
  initialHelpFile,
  orderOptions,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialName: string;
  initialOrder?: number | undefined;
  initialHelpFile?: HelpFileRecord | null | undefined;
  orderOptions: number[];
  submitLabel: string;
  onSubmit: (values: TabFormValues) => boolean;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [order, setOrder] = useState(
    String(initialOrder ?? orderOptions[orderOptions.length - 1] ?? 1),
  );
  const [helpFile, setHelpFile] = useState<HelpFileRecord | null>(initialHelpFile ?? null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error("File too large", { description: "Please upload a file under 4 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setHelpFile({
        fileName: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        dataUrl: String(reader.result ?? ""),
      });
      toast.success("Help file attached — save the tab to keep it");
    };
    reader.onerror = () => toast.error("Could not read that file");
    reader.readAsDataURL(file);
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim().length === 0) {
          setError("Tab name is required.");
          return;
        }
        setSaving(true);
        const ok = onSubmit({ name, order: Number(order), helpFile });
        if (!ok) setSaving(false);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="tab-name">Tab Name</Label>
        <Input
          id="tab-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value.toUpperCase());
            setError("");
          }}
          placeholder="e.g. FINANCE"
          className="w-full uppercase sm:max-w-sm"
          autoFocus
        />
        {error ? <p className="text-xs break-words text-destructive">{error}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tab-order">Order</Label>
        <Select value={order} onValueChange={setOrder}>
          <SelectTrigger id="tab-order" className="w-full sm:max-w-sm">
            <SelectValue placeholder="Select order" />
          </SelectTrigger>
          <SelectContent>
            {orderOptions.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4">
        <Label className="block">Help File</Label>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
        {helpFile ? (
          <div className="flex w-full flex-wrap items-center gap-3 text-sm">
            <FileText className="size-4 shrink-0 text-primary" />
            <a
              href={helpFile.dataUrl}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 truncate font-medium text-primary underline-offset-4 hover:underline"
            >
              {helpFile.fileName}
            </a>
            <span className="text-muted-foreground">{formatBytes(helpFile.size)}</span>
            <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
              <Upload className="size-4" /> Replace
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setHelpFile(null)}>
              <X className="size-4" /> Remove
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" /> Upload Help File
          </Button>
        )}
        <p className="text-xs text-muted-foreground">Optional, up to 4 MB.</p>
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