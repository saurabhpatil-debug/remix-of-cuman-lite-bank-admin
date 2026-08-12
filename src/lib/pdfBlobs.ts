/**
 * PDF payloads (base64 data URLs) are far too large for localStorage (~5 MB total),
 * so they live in IndexedDB while report metadata stays in localStorage.
 * A synchronous in-memory cache keeps the existing sync store API working.
 */
const DB_NAME = "cuman-lite";
const STORE = "pdfs";
export const PDF_READY_EVENT = "cuman:pdfs-ready";

const cache = new Map<string, string>();
let hydrated = false;
let hydrating: Promise<void> | null = null;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const request = run(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function getPdfData(id: string): string {
  return cache.get(id) ?? "";
}

export async function putPdfData(id: string, dataUrl: string) {
  cache.set(id, dataUrl);
  try {
    await tx("readwrite", (s) => s.put(dataUrl, id) as IDBRequest<IDBValidKey>);
  } catch {
    // keep the in-memory copy even if persistence fails
  }
}

export async function deletePdfData(id: string) {
  cache.delete(id);
  try {
    await tx("readwrite", (s) => s.delete(id) as unknown as IDBRequest<undefined>);
  } catch {
    /* ignore */
  }
}

export function hydratePdfs(): Promise<void> {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") return Promise.resolve();
  if (hydrated) return Promise.resolve();
  if (hydrating) return hydrating;
  hydrating = (async () => {
    try {
      const db = await openDb();
      const store = db.transaction(STORE, "readonly").objectStore(STORE);
      const keys = await new Promise<IDBValidKey[]>((resolve, reject) => {
        const r = store.getAllKeys();
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      });
      const values = await new Promise<unknown[]>((resolve, reject) => {
        const r = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      });
      keys.forEach((k, i) => {
        const v = values[i];
        if (typeof v === "string") cache.set(String(k), v);
      });
    } catch {
      /* ignore */
    }
    hydrated = true;
    window.dispatchEvent(new Event(PDF_READY_EVENT));
  })();
  return hydrating;
}
