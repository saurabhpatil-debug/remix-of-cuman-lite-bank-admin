import { useCallback, useEffect, useState } from "react";
import { useClientContext } from "@/lib/useClientContext";
import { PDF_READY_EVENT, hydratePdfs } from "@/lib/pdfBlobs";
import { getReports, getTabs, type Report, type Tab } from "@/lib/store";

/**
 * Shared read layer for the tab / report modules.
 * Wraps the existing store functions so every page (list, add, edit, view)
 * uses the exact same data flow that the previous single-page screens used.
 */
export function useClientRecords() {
  const { client, clientId, ready } = useClientContext();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  const refresh = useCallback(() => {
    if (!clientId) {
      setTabs([]);
      setReports([]);
      return;
    }
    setTabs(getTabs(clientId));
    setReports(getReports(clientId));
  }, [clientId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    void hydratePdfs();
    const onReady = () => refresh();
    window.addEventListener(PDF_READY_EVENT, onReady);
    return () => window.removeEventListener(PDF_READY_EVENT, onReady);
  }, [refresh]);

  return { client, clientId, ready, tabs, reports, refresh };
}
