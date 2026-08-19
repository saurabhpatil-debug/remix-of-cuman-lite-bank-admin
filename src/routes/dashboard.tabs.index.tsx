import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useClientRecords } from "@/lib/useClientRecords";
import { TabManager } from "@/components/dashboard/TabManager";
import { NoClientNotice, PageScaffold } from "@/components/dashboard/PageScaffold";
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
import { GetAllTabsList } from "@/Service/manageAdminTabRService";
import { DeleteClientTabs, MoveClientTabOrderUp, MoveClientTabOrderDown } from "@/Service/manageAdminTabWService";
import type { ClientTabsVM } from "@/Model/ClientTabsVM.model";
import type { Tab } from "@/lib/store";

export default function TabListPage() {
  const navigate = useNavigate();
  const { clientId, ready, tabs, reports } = useClientRecords();
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
  const [searchTxt, setSearchTxt] = useState("");
  const [tabToDelete, setTabToDelete] = useState<Tab | null>(null);
  const [apiTabs, setApiTabs] = useState<Tab[]>([]);
  const [hasApiTabsLoaded, setHasApiTabsLoaded] = useState(false);
  const [isTabsLoading, setIsTabsLoading] = useState(false);
  const [isTabsError, setIsTabsError] = useState(false);
  const [isMovingTabId, setIsMovingTabId] = useState<string | null>(null);
  const tabsRef = useRef<Tab[]>(tabs);
  const loadedClientRef = useRef<string | null>(null);
  const [appliedSearch, setAppliedSearch] = useState("");
  

  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

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

  const fetchTabs = useCallback(async (options?: { force?: boolean; search?: string }) => {
    const force = options?.force ?? false;
    const search = options?.search ?? "";

    if (!ready || !clientId) {
      setApiTabs([]);
      setHasApiTabsLoaded(false);
      setIsTabsLoading(false);
      setIsTabsError(false);
      loadedClientRef.current = null;
     
      return;
    }

    if (!force && loadedClientRef.current === clientId) {
      return;
    }

    setIsTabsLoading(true);
    setIsTabsError(false);

    try {
      const trimmedSearch = search.trim();
      const result = await GetAllTabsList(
        trimmedSearch.length > 0 ? { SearchTxt: trimmedSearch } : {},
      );
      const rows: ClientTabsVM[] = Array.isArray(result)
        ? (result as ClientTabsVM[])
        : Array.isArray(result?.data)
          ? (result.data as ClientTabsVM[])
          : Array.isArray(result?.items)
            ? (result.items as ClientTabsVM[])
            : [];

      const localIdByName = new Map(
        tabsRef.current.map((tab) => [tab.name.trim().toLowerCase(), tab.id] as const),
      );

      const mappedTabs = rows.reduce((acc: Tab[], row: ClientTabsVM) => {
        const normalizedName = (row.ClientTabName ?? "").trim();
        if (!normalizedName) return acc;

        const localId = localIdByName.get(normalizedName.toLowerCase());
        acc.push({
          id: localId ?? `api-tab-${row.ClientTabsId}`,
          clientId,
          name: normalizedName,
          reportCount: row.ReportCount ?? 0,
          helpFile: null,
          createdAt: new Date().toISOString(),
        });
        return acc;
      }, []);

      setApiTabs(mappedTabs);
      setHasApiTabsLoaded(true);
      loadedClientRef.current = clientId;
    } catch (error) {
      console.error("Failed to fetch tabs:", error);
      setApiTabs([]);
      setHasApiTabsLoaded(false);
      setIsTabsError(true);
      loadedClientRef.current = null;
      toast.error("Unable to load tabs from service", {
        description: "Showing locally available tabs instead.",
      });
    } finally {
      setIsTabsLoading(false);
    }
  }, [clientId, ready]);

  useEffect(() => {
    void fetchTabs({ search: searchTxt });
  }, [fetchTabs]);

 

  useEffect(() => {
    setSearchTxt("");
   
    loadedClientRef.current = null;
  }, [fetchTabs]);

  const tabsForManager = useMemo(() => {
    if (hasApiTabsLoaded) return apiTabs;
    return tabs;
  }, [apiTabs, hasApiTabsLoaded, tabs]);

  useEffect(() => {
    if (!selectedTabId) return;
    if (tabsForManager.some((tab) => tab.id === selectedTabId)) return;
    setSelectedTabId(null);
  }, [selectedTabId, tabsForManager]);

  const handleMoveUp = useCallback(async (index: number) => {
    if (index <= 0 || index >= tabsForManager.length) return;

    const tabToMove = tabsForManager[index];
    if (!tabToMove) return;

    setIsMovingTabId(tabToMove.id);

    try {
      let clientTabsId = resolveClientTabsId(tabToMove.id);
      let currentApiTab: ClientTabsVM | null = null;

      if (clientTabsId) {
        currentApiTab = await findTabFromApiById(clientTabsId);
      }

      if (!clientTabsId || !currentApiTab) {
        currentApiTab = await findTabFromApiByName(tabToMove.name);
        clientTabsId = currentApiTab?.ClientTabsId ?? null;
      }

      if (!clientTabsId) {
        toast.error("Failed to move tab", {
          description: "Unable to resolve tab ID. Please try again.",
        });
        return;
      }

      await MoveClientTabOrderUp(clientTabsId);

      // Update local state after successful API call
      const newTabs = [...tabsForManager];
      const temp = newTabs[index - 1]!;
      newTabs[index - 1] = newTabs[index]!;
      newTabs[index] = temp;

      if (hasApiTabsLoaded) {
        setApiTabs(newTabs);
      } else {
        setApiTabs(newTabs);
        setHasApiTabsLoaded(true);
      }

      toast.success("Tab order updated");
    } catch (error) {
      toast.error("Failed to move tab", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsMovingTabId(null);
    }
  }, [tabsForManager, hasApiTabsLoaded, resolveClientTabsId, findTabFromApiById, findTabFromApiByName]);

  const handleMoveDown = useCallback(async (index: number) => {
    if (index < 0 || index >= tabsForManager.length - 1) return;

    const tabToMove = tabsForManager[index];
    if (!tabToMove) return;

    setIsMovingTabId(tabToMove.id);

    try {
      let clientTabsId = resolveClientTabsId(tabToMove.id);
      let currentApiTab: ClientTabsVM | null = null;

      if (clientTabsId) {
        currentApiTab = await findTabFromApiById(clientTabsId);
      }

      if (!clientTabsId || !currentApiTab) {
        currentApiTab = await findTabFromApiByName(tabToMove.name);
        clientTabsId = currentApiTab?.ClientTabsId ?? null;
      }

      if (!clientTabsId) {
        toast.error("Failed to move tab", {
          description: "Unable to resolve tab ID. Please try again.",
        });
        return;
      }

      await MoveClientTabOrderDown(clientTabsId);

      // Update local state after successful API call
      const newTabs = [...tabsForManager];
      const temp = newTabs[index]!;
      newTabs[index] = newTabs[index + 1]!;
      newTabs[index + 1] = temp;

      if (hasApiTabsLoaded) {
        setApiTabs(newTabs);
      } else {
        setApiTabs(newTabs);
        setHasApiTabsLoaded(true);
      }

      toast.success("Tab order updated");
    } catch (error) {
      toast.error("Failed to move tab", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsMovingTabId(null);
    }
  }, [tabsForManager, hasApiTabsLoaded, resolveClientTabsId, findTabFromApiById, findTabFromApiByName]);

  const handleSearch = useCallback((value?: string) => {
    const nextSearch = (value ?? searchTxt).trim();
    setAppliedSearch(nextSearch);
    if (value !== undefined) {
      setSearchTxt(value);
    }
    loadedClientRef.current = null;
  
    void fetchTabs({
      force: true,
      search: nextSearch,
    });
  }, [fetchTabs, searchTxt]);
  return (
    <PageScaffold>
      {clientId ? (
        <TabManager
        tabs={tabsForManager}
        reports={reports}
        canAdd={true}
        selectedTabId={selectedTabId}
        searchValue={searchTxt}
        onSearch={handleSearch}
        onSearchChange={setSearchTxt}
        onSelect={setSelectedTabId}
        onAdd={() => navigate("/dashboard/tabs/add")}
        onView={(tab) => navigate(`/dashboard/tabs/${tab.id}`)}
        onEdit={(tab) => navigate(`/dashboard/tabs/${tab.id}/edit`)}
        onDelete={(tab) => setTabToDelete(tab)}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        isMovingTabId={isMovingTabId}
        isLoading={isTabsLoading}
      />
      ) : ready ? (
        <NoClientNotice />
      ) : null}

      <AlertDialog open={Boolean(tabToDelete)} onOpenChange={(o) => !o && setTabToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{tabToDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the tab from this client. Tabs that still contain reports cannot be
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!tabToDelete) return;
                const used = reports.filter((r) => r.tabId === tabToDelete.id).length;
                if (used > 0) {
                  toast.error("Tab still has reports", {
                    description: `Move or delete its ${used} report${used === 1 ? "" : "s"} first.`,
                  });
                  setTabToDelete(null);
                  return;
                }

                try {
                  let clientTabsId = resolveClientTabsId(tabToDelete.id);
                  let currentApiTab: ClientTabsVM | null = null;

                  if (clientTabsId) {
                    currentApiTab = await findTabFromApiById(clientTabsId);
                  }

                  if (!clientTabsId || !currentApiTab) {
                    currentApiTab = await findTabFromApiByName(tabToDelete.name);
                    clientTabsId = currentApiTab?.ClientTabsId ?? null;
                  }

                  const rowVersion = currentApiTab?.RowVersion;
                  const hasRowVersion =
                    typeof rowVersion === "string"
                      ? rowVersion.trim().length > 0
                      : Array.isArray(rowVersion)
                        ? rowVersion.length > 0
                        : rowVersion instanceof Uint8Array
                          ? rowVersion.length > 0
                          : false;

                  if (!clientTabsId || !currentApiTab || !hasRowVersion) {
                    toast.error("Could not delete the tab", {
                      description: "Unable to resolve backend row version for this record.",
                    });
                    return;
                  }

                  const payload: ClientTabsVM = {
                    ClientTabsId: clientTabsId,
                    ClientTabName: currentApiTab?.ClientTabName ?? tabToDelete.name,
                    HelpFileURL: currentApiTab?.HelpFileURL ?? "",
                    PDFURL: currentApiTab?.PDFURL ?? "",
                    FileSize: currentApiTab?.FileSize ?? "0",
                    RowVersion: currentApiTab.RowVersion,
                  };

                  await DeleteClientTabs(payload);
                  setTabToDelete(null);
                  setSelectedTabId(null);
                  loadedClientRef.current = null;
                  await fetchTabs({ force: true, search: searchTxt });
                  toast.success("Tab deleted");
                } catch (error) {
                  toast.error("Could not delete the tab", {
                    description:
                      error instanceof Error ? error.message : "Please try again.",
                  });
                }
              }}
            >
              Delete tab
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isTabsLoading ? (
        <p className="px-2 pt-2 text-xs text-muted-foreground">Loading tabs from service...</p>
      ) : isTabsError ? (
        <p className="px-2 pt-2 text-xs text-destructive">
          Failed to load tabs from service. Showing local tabs. 
          <button className="ml-1 underline" onClick={() => void fetchTabs({ force: true, search: searchTxt })}>
            Retry
          </button>
        </p>
      ) : null}
    </PageScaffold>
  );
}