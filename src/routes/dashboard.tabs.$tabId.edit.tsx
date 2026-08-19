import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useClientRecords } from "@/lib/useClientRecords";
import { TabForm } from "@/components/dashboard/TabForm";
import { InlineFormPanel } from "@/components/dashboard/InlineFormPanel";
import {
  NoClientNotice,
  NotFoundNotice,
  PageScaffold,
} from "@/components/dashboard/PageScaffold";
import type { ClientTabsVM } from "@/Model/ClientTabsVM.model";
import { GetAllTabsList } from "@/Service/manageAdminTabRService";
import { UpdateClientTabs } from "@/Service/manageAdminTabWService";
import { isTabNameTaken } from "@/lib/store";

function toNumericId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function idMatches(routeId: string, candidate: unknown): boolean {
  const normalizedRouteId = routeId.trim();
  if (normalizedRouteId.length === 0) {
    return false;
  }

  const routeNumericId = toNumericId(normalizedRouteId);
  const candidateNumericId = toNumericId(candidate);

  if (routeNumericId !== null && candidateNumericId !== null) {
    return routeNumericId === candidateNumericId;
  }

  return String(candidate ?? "").trim() === normalizedRouteId;
}

function normalizeHelpFileUrlForHref(helpFileUrl: string): string {
  const trimmed = helpFileUrl.trim();
  if (trimmed.length === 0 || trimmed.startsWith("data:")) {
    return trimmed;
  }

  return trimmed.replace(/ /g, "%20");
}

function resolveHelpFileName(helpFileUrl: string, fallback: string): string {
  const normalized = normalizeHelpFileUrlForHref(helpFileUrl);
  if (normalized.length === 0) {
    return fallback;
  }

  try {
    const parsed = new URL(normalized);
    const candidate = parsed.pathname.split("/").pop();
    if (!candidate) {
      return fallback;
    }

    return decodeURIComponent(candidate) || fallback;
  } catch {
    const candidate = normalized.split("/").pop();
    if (!candidate) {
      return fallback;
    }

    try {
      return decodeURIComponent(candidate) || fallback;
    } catch {
      return candidate || fallback;
    }
  }
}

export default function TabEditPage() {
  const { tabId = "" } = useParams<{ tabId: string }>();
  const navigate = useNavigate();
  const { clientId, ready, tabs } = useClientRecords();
  const tab = tabs.find((t) => idMatches(tabId, t.id)) ?? null;
  const [apiTab, setApiTab] = useState<ClientTabsVM | null>(null);
  const [isLoadingApiTab, setIsLoadingApiTab] = useState(false);
  const backToList = () => navigate("/dashboard/tabs");
  const orderOptions = Array.from({ length: Math.max(tabs.length, 1) }, (_, i) => i + 1);

  const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, {
      type: blob.type || "application/pdf",
    });
  };

  const resolveClientTabsId = (value: string): number | null => {
    const fromApiPrefix = /^api-tab-(\d+)$/i.exec(value);
    if (fromApiPrefix?.[1]) {
      return Number(fromApiPrefix[1]);
    }

    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }

    return null;
  };

  const normalizeTabRows = (result: unknown): ClientTabsVM[] => {
    if (Array.isArray(result)) return result as ClientTabsVM[];
    if (result && typeof result === "object") {
      const maybeData = (result as { data?: unknown }).data;
      if (Array.isArray(maybeData)) return maybeData as ClientTabsVM[];

      const maybeItems = (result as { items?: unknown }).items;
      if (Array.isArray(maybeItems)) return maybeItems as ClientTabsVM[];
    }
    return [];
  };

  const findTabFromApiByName = async (searchName: string): Promise<ClientTabsVM | null> => {
    const result = await GetAllTabsList({ SearchTxt: searchName.trim() });
    const rows = normalizeTabRows(result);
    if (rows.length === 0) return null;

    const normalizedName = searchName.trim().toLowerCase();
    const exact = rows.find((r) => (r.ClientTabName ?? "").trim().toLowerCase() === normalizedName);
    return exact ?? rows[0] ?? null;
  };

  const findTabFromApiById = async (clientTabsId: number): Promise<ClientTabsVM | null> => {
    const result = await GetAllTabsList({});
    const rows = normalizeTabRows(result);
    return rows.find((r) => r.ClientTabsId === clientTabsId) ?? null;
  };

  const hasRowVersion = (rowVersion: ClientTabsVM["RowVersion"] | undefined) =>
    typeof rowVersion === "string"
      ? rowVersion.trim().length > 0
      : Array.isArray(rowVersion)
        ? rowVersion.length > 0
        : rowVersion instanceof Uint8Array
          ? rowVersion.length > 0
          : false;

  const resolvedClientTabsId = useMemo(() => resolveClientTabsId(tabId), [tabId]);

  useEffect(() => {
    const loadApiTab = async () => {
      if (!clientId || tab || !resolvedClientTabsId) {
        setApiTab(null);
        setIsLoadingApiTab(false);
        return;
      }

      try {
        setIsLoadingApiTab(true);
        const row = await findTabFromApiById(resolvedClientTabsId);
        setApiTab(row);
      } catch {
        setApiTab(null);
      } finally {
        setIsLoadingApiTab(false);
      }
    };

    void loadApiTab();
  }, [clientId, resolvedClientTabsId, tab]);

  const effectiveTabName = tab?.name ?? apiTab?.ClientTabName ?? "";
  const effectiveTabId = tab?.id ?? (apiTab ? `api-tab-${apiTab.ClientTabsId}` : tabId);

  return (
    <PageScaffold>
      {!clientId ? (
        ready ? (
          <NoClientNotice />
        ) : null
      ) : tab || apiTab ? (
        <InlineFormPanel title="Edit Tab" description="Give the tab a short, unique name.">
          <TabForm
            key={effectiveTabId}
            initialName={effectiveTabName}
            initialHelpFile={tab?.helpFile ?? (
              apiTab?.HelpFileURL
                ? {
                    dataUrl: normalizeHelpFileUrlForHref(apiTab.HelpFileURL),
                    fileName: resolveHelpFileName(apiTab.HelpFileURL, `${effectiveTabName}-help.pdf`),
                    size: 0,
                    uploadedAt: "",
                  }
                : null
            )}
            orderOptions={orderOptions}
            submitLabel="Save changes"
            onCancel={backToList}
            onSubmit={async ({ name, helpFile }) => {
              if (isTabNameTaken(clientId, name, effectiveTabId)) {
                toast.error("A tab with that name already exists");
                return false;
              }

              try {
                let clientTabsId = resolveClientTabsId(effectiveTabId);
                let currentApiTab: ClientTabsVM | null = null;

                if (clientTabsId) {
                  currentApiTab = await findTabFromApiById(clientTabsId);
                }

                if (!clientTabsId || !currentApiTab) {
                  currentApiTab = await findTabFromApiByName(effectiveTabName);
                  clientTabsId = currentApiTab?.ClientTabsId ?? null;
                }

                if (!clientTabsId || !currentApiTab || !hasRowVersion(currentApiTab.RowVersion)) {
                  toast.error("Could not update the tab", {
                    description: "Unable to resolve backend tab identity for this record.",
                  });
                  return false;
                }

                const payload: ClientTabsVM = {
                  ClientTabsId: clientTabsId,
                  ClientTabName: name.trim().toUpperCase(),
                  HelpFileURL: helpFile
                    ? helpFile.dataUrl.startsWith("data:")
                      ? helpFile.fileName
                      : currentApiTab?.HelpFileURL ?? ""
                    : currentApiTab?.HelpFileURL ?? "",
                  PDFURL: currentApiTab?.PDFURL ?? "",
                  FileSize: helpFile ? String(helpFile.size) : currentApiTab?.FileSize ?? "0",
                  RowVersion: currentApiTab?.RowVersion ?? "",
                };

                const helpFileObj = helpFile && helpFile.dataUrl.startsWith("data:")
                  ? await dataUrlToFile(helpFile.dataUrl, helpFile.fileName)
                  : null;

                await UpdateClientTabs(payload, helpFileObj);
                toast.success("Tab updated");
                backToList();
                return true;
              } catch (error) {
                const status =
                  typeof (error as { response?: { status?: unknown } })?.response?.status ===
                  "number"
                    ? (error as { response: { status: number } }).response.status
                    : undefined;
                const message =
                  typeof (error as { response?: { data?: { message?: unknown } } })?.response
                    ?.data?.message === "string"
                    ? (error as { response: { data: { message: string } } }).response.data
                        .message
                    : undefined;

                if (
                  status === 400 &&
                  typeof message === "string" &&
                  message.includes("Client Tab Name already exists.")
                ) {
                  toast.error("Client Tab already exists.");
                  return false;
                }

                toast.error("Could not update the tab", {
                  description:
                    error instanceof Error ? error.message : "Please try again.",
                });
                return false;
              }
            }}
          />
        </InlineFormPanel>
      ) : ready ? (
        isLoadingApiTab ? null : <NotFoundNotice>That tab no longer exists for this client.</NotFoundNotice>
      ) : null}
    </PageScaffold>
  );
}
