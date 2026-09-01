import type { ContingencyTransaction } from "@/types/contingency";

/**
 * Storage abstraction so the contingency engine never talks to IndexedDB
 * directly. This app runs in the browser only (no filesystem/SQLite access
 * from Next.js client code), so IndexedDB is the right default — but every
 * consumer goes through this interface, so a different provider (e.g. a
 * future Electron/desktop shell using SQLite) is a new implementation of
 * this same contract, not a rewrite of the contingency engine.
 */
export interface OfflineStorageInterface {
  getAll(): Promise<ContingencyTransaction[]>;
  put(transaction: ContingencyTransaction): Promise<void>;
  remove(uuid: string): Promise<void>;
}

const DB_NAME = "crm_contingency";
const DB_VERSION = 1;
const STORE_NAME = "transactions";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "uuid" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class IndexedDBOfflineStorage implements OfflineStorageInterface {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private db(): Promise<IDBDatabase> {
    if (!this.dbPromise) this.dbPromise = openDatabase();
    return this.dbPromise;
  }

  async getAll(): Promise<ContingencyTransaction[]> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result as ContingencyTransaction[]);
      request.onerror = () => reject(request.error);
    });
  }

  async put(transaction: ContingencyTransaction): Promise<void> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(transaction);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async remove(uuid: string): Promise<void> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(uuid);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

let instance: OfflineStorageInterface | null = null;

/** Lazily created singleton — IndexedDB access must stay client-side. */
export function getOfflineStorage(): OfflineStorageInterface {
  if (!instance) instance = new IndexedDBOfflineStorage();
  return instance;
}
