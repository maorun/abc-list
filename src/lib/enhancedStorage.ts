// Enhanced storage layer for PWA with IndexedDB and localStorage fallback
// Provides seamless offline data management and synchronization

export interface StorageItem {
  id: string;
  data: unknown;
  timestamp: number;
  lastModified: number;
  syncStatus: "synced" | "pending" | "failed";
}

export interface SyncQueueItem {
  id: string;
  storeName: string;
  action: "create" | "update" | "delete";
  data?: unknown;
  timestamp: number;
}

export class EnhancedPWAStorage {
  private dbName = "abc-list-pwa";
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private syncQueue: SyncQueueItem[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.initDB();
    this.setupEventListeners();
    this.loadSyncQueue();
  }

  private async initDB(): Promise<void> {
    if (!("indexedDB" in window)) {
      console.log(
        "[PWAStorage] IndexedDB not supported, using localStorage fallback",
      );
      return;
    }

    try {
      this.db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Create object stores for different data types
          const stores = [
            "abc-lists",
            "abc-lists-words",
            "kawas",
            "kagas",
            "stadt-land-fluss",
            "basar",
            "sync-queue",
          ];

          stores.forEach((storeName) => {
            if (!db.objectStoreNames.contains(storeName)) {
              const store = db.createObjectStore(storeName, {keyPath: "id"});

              // Add indexes for common queries
              if (storeName !== "sync-queue") {
                store.createIndex("timestamp", "timestamp");
                store.createIndex("lastModified", "lastModified");
                store.createIndex("syncStatus", "syncStatus");
              }
            }
          });
        };
      });

      console.log("[PWAStorage] IndexedDB initialized successfully");
    } catch (error) {
      console.error("[PWAStorage] IndexedDB initialization failed:", error);
    }
  }

  private setupEventListeners(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  // Enhanced get method with automatic migration from localStorage
  public async getItem(storeName: string, key: string): Promise<unknown> {
    try {
      // First try IndexedDB
      if (this.db) {
        const transaction = this.db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const result = (await new Promise((resolve, reject) => {
          const request = store.get(key);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        })) as StorageItem;

        if (result) {
          return result.data;
        }
      }

      // Fallback to localStorage and migrate if data exists
      const localData = this.getFromLocalStorage(key);
      if (localData !== null) {
        // Migrate to IndexedDB
        await this.setItem(storeName, key, localData);
        console.log(
          `[PWAStorage] Migrated ${key} from localStorage to IndexedDB`,
        );
        return localData;
      }

      return null;
    } catch (error) {
      console.error("[PWAStorage] Get failed:", error);
      return this.getFromLocalStorage(key);
    }
  }

  // Enhanced set method with offline queue support
  public async setItem(
    storeName: string,
    key: string,
    value: unknown,
  ): Promise<void> {
    const item: StorageItem = {
      id: key,
      data: value,
      timestamp: Date.now(),
      lastModified: Date.now(),
      syncStatus: this.isOnline ? "synced" : "pending",
    };

    try {
      if (this.db) {
        const transaction = this.db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        await new Promise((resolve, reject) => {
          const request = store.put(item);
          request.onsuccess = () => resolve(undefined);
          request.onerror = () => reject(request.error);
        });

        console.log(`[PWAStorage] Saved to IndexedDB: ${storeName}/${key}`);

        // Add to sync queue if offline
        if (!this.isOnline) {
          this.addToSyncQueue(storeName, key, "update", value);
        }
      } else {
        throw new Error("IndexedDB not available");
      }
    } catch (error) {
      console.error(
        "[PWAStorage] IndexedDB write failed, using localStorage:",
        error,
      );
      this.setToLocalStorage(key, value);

      // Still add to sync queue for later processing
      if (!this.isOnline) {
        this.addToSyncQueue(storeName, key, "update", value);
      }
    }
  }

  // Get all items from a store
  public async getAllItems(
    storeName: string,
  ): Promise<Record<string, unknown>> {
    try {
      if (this.db) {
        const transaction = this.db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const items = (await new Promise((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        })) as StorageItem[];

        const result: Record<string, unknown> = {};
        items.forEach((item) => {
          result[item.id] = item.data;
        });

        return result;
      }
    } catch (error) {
      console.error("[PWAStorage] GetAll failed:", error);
    }

    // Fallback: try to get from localStorage keys
    return this.getAllFromLocalStorage(storeName);
  }

  // Delete item
  public async deleteItem(storeName: string, key: string): Promise<void> {
    try {
      if (this.db) {
        const transaction = this.db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        await new Promise((resolve, reject) => {
          const request = store.delete(key);
          request.onsuccess = () => resolve(undefined);
          request.onerror = () => reject(request.error);
        });

        console.log(`[PWAStorage] Deleted from IndexedDB: ${storeName}/${key}`);

        // Add to sync queue if offline
        if (!this.isOnline) {
          this.addToSyncQueue(storeName, key, "delete");
        }
      }
    } catch (error) {
      console.error("[PWAStorage] Delete failed:", error);
    }

    // Also remove from localStorage
    this.removeFromLocalStorage(key);
  }

  // Sync queue management
  private addToSyncQueue(
    storeName: string,
    key: string,
    action: "create" | "update" | "delete",
    data?: unknown,
  ): void {
    const syncItem: SyncQueueItem = {
      id: `${storeName}_${key}_${Date.now()}`,
      storeName,
      action,
      data,
      timestamp: Date.now(),
    };

    this.syncQueue.push(syncItem);
    this.saveSyncQueue();
    console.log(
      `[PWAStorage] Added to sync queue: ${action} ${storeName}/${key}`,
    );
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0) {
      console.log("[PWAStorage] Sync queue is empty");
      return;
    }

    console.log(
      `[PWAStorage] Processing ${this.syncQueue.length} sync queue items`,
    );

    const processedItems: string[] = [];

    for (const item of this.syncQueue) {
      try {
        // Here you would implement actual sync with your backend
        // For now, just mark as synced in IndexedDB
        if (this.db && item.action !== "delete") {
          const transaction = this.db.transaction(
            [item.storeName],
            "readwrite",
          );
          const store = transaction.objectStore(item.storeName);

          const existingItem = (await new Promise((resolve) => {
            const request = store.get(item.id.split("_")[1]); // Extract original key
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
          })) as StorageItem;

          if (existingItem) {
            existingItem.syncStatus = "synced";
            existingItem.lastModified = Date.now();
            store.put(existingItem);
          }
        }

        processedItems.push(item.id);
        console.log(`[PWAStorage] Synced: ${item.action} ${item.storeName}`);
      } catch (error) {
        console.error(`[PWAStorage] Sync failed for ${item.id}:`, error);
      }
    }

    // Remove processed items from queue
    this.syncQueue = this.syncQueue.filter(
      (item) => !processedItems.includes(item.id),
    );
    this.saveSyncQueue();

    console.log(
      `[PWAStorage] Sync complete. ${processedItems.length} items processed.`,
    );
  }

  private loadSyncQueue(): void {
    try {
      const stored = localStorage.getItem("pwa-sync-queue");
      if (stored) {
        this.syncQueue = JSON.parse(stored);
        console.log(
          `[PWAStorage] Loaded ${this.syncQueue.length} items from sync queue`,
        );
      }
    } catch (error) {
      console.error("[PWAStorage] Failed to load sync queue:", error);
      this.syncQueue = [];
    }
  }

  private saveSyncQueue(): void {
    try {
      localStorage.setItem("pwa-sync-queue", JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error("[PWAStorage] Failed to save sync queue:", error);
    }
  }

  // LocalStorage fallback methods
  private getFromLocalStorage(key: string): unknown {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("[PWAStorage] localStorage read failed:", error);
      return null;
    }
  }

  private setToLocalStorage(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("[PWAStorage] localStorage write failed:", error);
    }
  }

  private removeFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("[PWAStorage] localStorage remove failed:", error);
    }
  }

  private getAllFromLocalStorage(storeName: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    try {
      // Try to find localStorage keys that might belong to this store
      // This is a best-effort fallback
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && this.belongsToStore(key, storeName)) {
          const value = this.getFromLocalStorage(key);
          if (value !== null) {
            result[key] = value;
          }
        }
      }
    } catch (error) {
      console.error("[PWAStorage] getAllFromLocalStorage failed:", error);
    }

    return result;
  }

  private belongsToStore(key: string, storeName: string): boolean {
    // Heuristic to determine if a localStorage key belongs to a store
    const storePatterns = {
      "abc-lists": /^[A-Za-z0-9\s]+$/, // Simple ABC list names
      kawas: /^kawa-/, // KaWa keys
      kagas: /^kaga-/, // KaGa keys
      "stadt-land-fluss": /^slf-/, // Stadt-Land-Fluss keys
    };

    const pattern = storePatterns[storeName as keyof typeof storePatterns];
    return pattern ? pattern.test(key) : false;
  }

  // Public API for sync management
  public async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.processSyncQueue();
    } else {
      console.log("[PWAStorage] Cannot sync while offline");
    }
  }

  public getSyncQueueSize(): number {
    return this.syncQueue.length;
  }

  public getPendingChanges(): SyncQueueItem[] {
    return [...this.syncQueue];
  }

  // Migration helper for existing localStorage data
  public async migrateFromLocalStorage(): Promise<void> {
    console.log(
      "[PWAStorage] Starting migration from localStorage to IndexedDB",
    );

    const storeMappings = {
      "abc-lists": /^[A-Za-z0-9\s]+$/,
      kawas: /^kawa-/,
      kagas: /^kaga-/,
      "stadt-land-fluss": /^slf-/,
    };

    let migratedCount = 0;

    for (const [storeName, pattern] of Object.entries(storeMappings)) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && pattern.test(key)) {
          const value = this.getFromLocalStorage(key);
          if (value !== null) {
            await this.setItem(storeName, key, value);
            migratedCount++;
          }
        }
      }
    }

    console.log(
      `[PWAStorage] Migration complete. ${migratedCount} items migrated.`,
    );
  }
}
