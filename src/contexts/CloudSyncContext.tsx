import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {User} from "@supabase/supabase-js";
import {
  CloudSyncService,
  cloudSyncService,
  CloudSyncConfig,
  SyncStats,
  SyncConflict,
  BackupMetadata,
} from "../lib/cloudSync";

interface CloudSyncContextType {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<{user: User | null; error: Error | null}>;
  signOut: () => Promise<{error: Error | null}>;

  // Sync status
  isSyncing: boolean;
  lastSyncStats: SyncStats | null;
  pendingConflicts: SyncConflict[];

  // Configuration
  config: CloudSyncConfig;
  updateConfig: (newConfig: Partial<CloudSyncConfig>) => void;

  // Sync operations
  syncData: (
    storeName: string,
    data: Record<string, unknown>,
  ) => Promise<SyncStats>;
  syncFromCloud: (storeName: string) => Promise<Record<string, unknown>>;

  // Backup operations
  createBackup: () => Promise<BackupMetadata>;
  restoreBackup: (backupId: string) => Promise<void>;
  listBackups: () => Promise<BackupMetadata[]>;

  // Privacy operations
  deleteAllData: () => Promise<void>;
  exportData: () => Promise<Record<string, unknown>>;

  // Error state
  lastError: Error | null;
  clearError: () => void;
}

const CloudSyncContext = createContext<CloudSyncContextType | undefined>(
  undefined,
);

interface CloudSyncProviderProps {
  children: ReactNode;
}

export function CloudSyncProvider({children}: CloudSyncProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStats, setLastSyncStats] = useState<SyncStats | null>(null);
  const [pendingConflicts, setPendingConflicts] = useState<SyncConflict[]>([]);

  // Handle case where cloudSyncService might not be available (e.g., during tests)
  const getDefaultConfig = (): CloudSyncConfig => ({
    autoSync: true,
    syncInterval: 30000,
    conflictResolution: "merge",
    enableBackup: true,
    enableRealtime: true,
  });

  const [config, setConfig] = useState<CloudSyncConfig>(
    cloudSyncService?.getConfig() || getDefaultConfig(),
  );
  const [lastError, setLastError] = useState<Error | null>(null);

  // Initialize event listeners
  useEffect(() => {
    if (!cloudSyncService) return;

    // Auth state listener
    cloudSyncService.addEventListener("authStateChanged", (newUser) => {
      setUser(newUser);
    });

    // Sync event listeners
    cloudSyncService.addEventListener("syncStarted", () => {
      setIsSyncing(true);
      setLastError(null);
    });

    cloudSyncService.addEventListener("syncCompleted", (stats) => {
      setIsSyncing(false);
      setLastSyncStats(stats);
    });

    cloudSyncService.addEventListener("syncError", (error) => {
      setIsSyncing(false);
      setLastError(error);
    });

    cloudSyncService.addEventListener("conflictDetected", (conflict) => {
      setPendingConflicts((prev) => [...prev, conflict]);
    });

    // Set initial user state
    setUser(cloudSyncService.getCurrentUser());

    // Cleanup function
    return () => {
      if (!cloudSyncService) return;
      cloudSyncService.removeEventListener("authStateChanged");
      cloudSyncService.removeEventListener("syncStarted");
      cloudSyncService.removeEventListener("syncCompleted");
      cloudSyncService.removeEventListener("syncError");
      cloudSyncService.removeEventListener("conflictDetected");
    };
  }, []);

  // Authentication methods
  const signInWithGoogle = useCallback(async () => {
    if (!cloudSyncService) {
      const err = new Error("Cloud sync service not available");
      setLastError(err);
      return {user: null, error: err};
    }

    try {
      setLastError(null);
      return await cloudSyncService.signInWithGoogle();
    } catch (error) {
      const err = error as Error;
      setLastError(err);
      return {user: null, error: err};
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!cloudSyncService) {
      const err = new Error("Cloud sync service not available");
      setLastError(err);
      return {error: err};
    }

    try {
      setLastError(null);
      return await cloudSyncService.signOut();
    } catch (error) {
      const err = error as Error;
      setLastError(err);
      return {error: err};
    }
  }, []);

  // Configuration management
  const updateConfig = useCallback((newConfig: Partial<CloudSyncConfig>) => {
    if (!cloudSyncService) {
      setLastError(new Error("Cloud sync service not available"));
      return;
    }

    try {
      cloudSyncService.updateConfig(newConfig);
      setConfig(cloudSyncService.getConfig());
      setLastError(null);
    } catch (error) {
      setLastError(error as Error);
    }
  }, []);

  // Sync operations
  const syncData = useCallback(
    async (
      storeName: string,
      data: Record<string, unknown>,
    ): Promise<SyncStats> => {
      if (!cloudSyncService) {
        const err = new Error("Cloud sync service not available");
        setLastError(err);
        throw err;
      }

      try {
        setLastError(null);
        return await cloudSyncService.syncDataToCloud(storeName, data);
      } catch (error) {
        const err = error as Error;
        setLastError(err);
        throw err;
      }
    },
    [],
  );

  const syncFromCloud = useCallback(
    async (storeName: string): Promise<Record<string, unknown>> => {
      if (!cloudSyncService) {
        const err = new Error("Cloud sync service not available");
        setLastError(err);
        throw err;
      }

      try {
        setLastError(null);
        return await cloudSyncService.syncDataFromCloud(storeName);
      } catch (error) {
        const err = error as Error;
        setLastError(err);
        throw err;
      }
    },
    [],
  );

  // Backup operations
  const createBackup = useCallback(async (): Promise<BackupMetadata> => {
    if (!cloudSyncService) {
      const err = new Error("Cloud sync service not available");
      setLastError(err);
      throw err;
    }

    try {
      setLastError(null);
      return await cloudSyncService.createBackup();
    } catch (error) {
      const err = error as Error;
      setLastError(err);
      throw err;
    }
  }, []);

  const restoreBackup = useCallback(async (backupId: string): Promise<void> => {
    if (!cloudSyncService) {
      const err = new Error("Cloud sync service not available");
      setLastError(err);
      throw err;
    }

    try {
      setLastError(null);
      await cloudSyncService.restoreFromBackup(backupId);
    } catch (error) {
      const err = error as Error;
      setLastError(err);
      throw err;
    }
  }, []);

  const listBackups = useCallback(async (): Promise<BackupMetadata[]> => {
    if (!cloudSyncService) {
      const err = new Error("Cloud sync service not available");
      setLastError(err);
      throw err;
    }

    try {
      setLastError(null);
      return await cloudSyncService.listBackups();
    } catch (error) {
      const err = error as Error;
      setLastError(err);
      throw err;
    }
  }, []);

  // Privacy operations
  const deleteAllData = useCallback(async (): Promise<void> => {
    if (!cloudSyncService) {
      const err = new Error("Cloud sync service not available");
      setLastError(err);
      throw err;
    }

    try {
      setLastError(null);
      await cloudSyncService.deleteAllUserData();
    } catch (error) {
      const err = error as Error;
      setLastError(err);
      throw err;
    }
  }, []);

  const exportData = useCallback(async (): Promise<Record<string, unknown>> => {
    if (!cloudSyncService) {
      const err = new Error("Cloud sync service not available");
      setLastError(err);
      throw err;
    }

    try {
      setLastError(null);
      return await cloudSyncService.exportUserData();
    } catch (error) {
      const err = error as Error;
      setLastError(err);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  const contextValue: CloudSyncContextType = {
    // Authentication
    user,
    isAuthenticated: user !== null,
    signInWithGoogle,
    signOut,

    // Sync status
    isSyncing,
    lastSyncStats,
    pendingConflicts,

    // Configuration
    config,
    updateConfig,

    // Sync operations
    syncData,
    syncFromCloud,

    // Backup operations
    createBackup,
    restoreBackup,
    listBackups,

    // Privacy operations
    deleteAllData,
    exportData,

    // Error state
    lastError,
    clearError,
  };

  return (
    <CloudSyncContext.Provider value={contextValue}>
      {children}
    </CloudSyncContext.Provider>
  );
}

export function useCloudSync(): CloudSyncContextType {
  const context = useContext(CloudSyncContext);
  if (context === undefined) {
    throw new Error("useCloudSync must be used within a CloudSyncProvider");
  }
  return context;
}

// Specialized hooks for specific cloud sync functionality

// Hook for authentication only
export function useCloudAuth() {
  const {
    user,
    isAuthenticated,
    signInWithGoogle,
    signOut,
    lastError,
    clearError,
  } = useCloudSync();

  return {
    user,
    isAuthenticated,
    signInWithGoogle,
    signOut,
    lastError,
    clearError,
  };
}

// Hook for sync status monitoring
export function useCloudSyncStatus() {
  const {isSyncing, lastSyncStats, pendingConflicts, lastError} =
    useCloudSync();

  return {
    isSyncing,
    lastSyncStats,
    pendingConflicts,
    hasConflicts: pendingConflicts.length > 0,
    lastError,
  };
}

// Hook for backup management
export function useCloudBackup() {
  const {
    isAuthenticated,
    createBackup,
    restoreBackup,
    listBackups,
    lastError,
    clearError,
  } = useCloudSync();

  return {
    isAuthenticated,
    createBackup,
    restoreBackup,
    listBackups,
    lastError,
    clearError,
  };
}

// Hook for privacy and data management
export function useCloudPrivacy() {
  const {isAuthenticated, deleteAllData, exportData, lastError, clearError} =
    useCloudSync();

  return {
    isAuthenticated,
    deleteAllData,
    exportData,
    lastError,
    clearError,
  };
}

// Hook for enhanced storage with cloud sync integration
export function useCloudEnhancedStorage<T>(
  storeName: string,
  key: string,
  defaultValue: T,
  autoSync = true,
): [T, (value: T) => Promise<void>, boolean, Error | null] {
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const {isAuthenticated, syncData, syncFromCloud} = useCloudSync();

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (isAuthenticated && autoSync) {
          // Try to load from cloud first
          const cloudData = await syncFromCloud(storeName);
          if (cloudData[key] !== undefined) {
            setData(cloudData[key] as T);
            return;
          }
        }

        // Fallback to localStorage
        const stored = localStorage.getItem(key);
        if (stored) {
          setData(JSON.parse(stored));
        }
      } catch (err) {
        console.error(`[useCloudEnhancedStorage] Failed to load ${key}:`, err);
        setError(err as Error);

        // Fallback to localStorage on error
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            setData(JSON.parse(stored));
          }
        } catch (localErr) {
          console.error(
            `[useCloudEnhancedStorage] localStorage fallback failed:`,
            localErr,
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [storeName, key, isAuthenticated, autoSync, syncFromCloud]);

  // Save data function
  const saveData = useCallback(
    async (value: T) => {
      try {
        setError(null);

        // Always save to localStorage first for immediate update
        localStorage.setItem(key, JSON.stringify(value));
        setData(value);

        // Sync to cloud if authenticated and auto-sync is enabled
        if (isAuthenticated && autoSync) {
          await syncData(storeName, {[key]: value});
        }
      } catch (err) {
        console.error(`[useCloudEnhancedStorage] Failed to save ${key}:`, err);
        setError(err as Error);

        // Even if cloud sync fails, the localStorage save should have succeeded
        // so the data state is still updated
      }
    },
    [storeName, key, isAuthenticated, autoSync, syncData],
  );

  return [data, saveData, isLoading, error];
}
