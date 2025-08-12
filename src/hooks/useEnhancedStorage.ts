import {useState, useEffect, useCallback} from "react";
import {EnhancedPWAStorage} from "../lib/enhancedStorage";

// Global storage instance
let globalStorage: EnhancedPWAStorage | null = null;

function getStorageInstance(): EnhancedPWAStorage {
  if (!globalStorage) {
    globalStorage = new EnhancedPWAStorage();
  }
  return globalStorage;
}

// Enhanced localStorage hook that seamlessly works with both localStorage and IndexedDB
export function useEnhancedStorage<T>(
  storeName: string,
  key: string,
  defaultValue: T,
): [T, (value: T) => Promise<void>, boolean] {
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const storage = getStorageInstance();

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedData = await storage.getItem(storeName, key);
        if (storedData !== null) {
          setData(storedData);
        }
      } catch (error) {
        console.error(`[useEnhancedStorage] Failed to load ${key}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [storeName, key, storage]);

  // Save data function
  const saveData = useCallback(
    async (value: T) => {
      try {
        await storage.setItem(storeName, key, value);
        setData(value);
      } catch (error) {
        console.error(`[useEnhancedStorage] Failed to save ${key}:`, error);
      }
    },
    [storeName, key, storage],
  );

  return [data, saveData, isLoading];
}

// Hook for managing multiple items in a store (like ABC lists)
export function useEnhancedStorageList<T>(
  storeName: string,
): [
  Record<string, T>,
  (key: string, value: T) => Promise<void>,
  (key: string) => Promise<void>,
  boolean,
] {
  const [items, setItems] = useState<Record<string, T>>({});
  const [isLoading, setIsLoading] = useState(true);
  const storage = getStorageInstance();

  // Load all items on mount
  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true);
        const allItems = await storage.getAllItems(storeName);
        setItems(allItems);
      } catch (error) {
        console.error(
          `[useEnhancedStorageList] Failed to load ${storeName}:`,
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [storeName, storage]);

  // Save item function
  const saveItem = useCallback(
    async (key: string, value: T) => {
      try {
        await storage.setItem(storeName, key, value);
        setItems((prev) => ({...prev, [key]: value}));
      } catch (error) {
        console.error(`[useEnhancedStorageList] Failed to save ${key}:`, error);
      }
    },
    [storeName, storage],
  );

  // Delete item function
  const deleteItem = useCallback(
    async (key: string) => {
      try {
        await storage.deleteItem(storeName, key);
        setItems((prev) => {
          const newItems = {...prev};
          delete newItems[key];
          return newItems;
        });
      } catch (error) {
        console.error(
          `[useEnhancedStorageList] Failed to delete ${key}:`,
          error,
        );
      }
    },
    [storeName, storage],
  );

  return [items, saveItem, deleteItem, isLoading];
}

// Hook for sync status and management
export function useSyncStatus() {
  const [syncQueueSize, setSyncQueueSize] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const storage = getStorageInstance();

  useEffect(() => {
    const updateSyncStatus = () => {
      setSyncQueueSize(storage.getSyncQueueSize());
    };

    const handleOnline = () => {
      setIsOnline(true);
      updateSyncStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateSyncStatus();
    };

    // Initial status
    updateSyncStatus();

    // Listen for online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check sync status periodically
    const interval = setInterval(updateSyncStatus, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [storage]);

  const forceSync = useCallback(async () => {
    try {
      await storage.forcSync();
      setSyncQueueSize(storage.getSyncQueueSize());
    } catch (error) {
      console.error("[useSyncStatus] Force sync failed:", error);
    }
  }, [storage]);

  const migrateData = useCallback(async () => {
    try {
      await storage.migrateFromLocalStorage();
    } catch (error) {
      console.error("[useSyncStatus] Migration failed:", error);
    }
  }, [storage]);

  return {
    syncQueueSize,
    isOnline,
    hasPendingChanges: syncQueueSize > 0,
    forceSync,
    migrateData,
  };
}

// Backward compatibility layer for existing localStorage usage
export function createBackwardCompatibleStorage() {
  const storage = getStorageInstance();

  return {
    // Direct replacement for localStorage.getItem
    getItem: async (key: string): Promise<string | null> => {
      try {
        const value = await storage.getItem("abc-lists", key);
        return value ? JSON.stringify(value) : null;
      } catch (error) {
        console.error("[BackwardCompatibleStorage] getItem failed:", error);
        return localStorage.getItem(key);
      }
    },

    // Direct replacement for localStorage.setItem
    setItem: async (key: string, value: string): Promise<void> => {
      try {
        const parsedValue = JSON.parse(value);
        await storage.setItem("abc-lists", key, parsedValue);
      } catch (error) {
        console.error("[BackwardCompatibleStorage] setItem failed:", error);
        localStorage.setItem(key, value);
      }
    },

    // Direct replacement for localStorage.removeItem
    removeItem: async (key: string): Promise<void> => {
      try {
        await storage.deleteItem("abc-lists", key);
      } catch (error) {
        console.error("[BackwardCompatibleStorage] removeItem failed:", error);
        localStorage.removeItem(key);
      }
    },
  };
}
