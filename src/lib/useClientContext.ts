import { useEffect, useState } from "react";
import { getClient, getClients, upsertExternalClient, type Client } from "@/lib/store";

const STORAGE_KEY = "cbm.activeClient";

/**
 * The client is handed over from the external web app, e.g.
 *   /dashboard/tabs?clientId=acme&clientName=Acme%20Bank&clientEmail=ops@acme.com
 * The selection is remembered for the session so in-app navigation keeps context.
 */
export function useClientContext() {
  const [client, setClient] = useState<Client | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("clientId") ?? params.get("client");

    if (id) {
      const resolved = upsertExternalClient({
        id,
        ...(params.get("clientName") ? { name: params.get("clientName")! } : {}),
        ...(params.get("clientUsername") ? { username: params.get("clientUsername")! } : {}),
        ...(params.get("clientEmail") ? { email: params.get("clientEmail")! } : {}),
      });
      window.sessionStorage.setItem(STORAGE_KEY, resolved.id);
      setClient(resolved);
      setReady(true);
      return;
    }

    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    const fallback = (stored ? getClient(stored) : undefined) ?? getClients()[0] ?? null;
    if (fallback) window.sessionStorage.setItem(STORAGE_KEY, fallback.id);
    setClient(fallback);
    setReady(true);
  }, []);

  return { client, clientId: client?.id ?? null, ready };
}
