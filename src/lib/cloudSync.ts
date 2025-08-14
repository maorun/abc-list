// Cloud synchronization service for ABC-List application
// Provides cross-device sync, conflict resolution, and backup/restore functionality

import {
  createClient,
  SupabaseClient,
  User,
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import {SyncQueueItem, StorageItem} from "./enhancedStorage";

// Environment variables for Supabase configuration
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

export interface CloudSyncConfig {
  autoSync: boolean;
  syncInterval: number; // milliseconds
  conflictResolution: "local" | "remote" | "merge" | "ask";
  enableBackup: boolean;
  enableRealtime: boolean;
}

export interface SyncConflict {
  id: string;
  storeName: string;
  localData: StorageItem;
  remoteData: StorageItem;
  conflictType: "update_conflict" | "delete_conflict" | "schema_conflict";
  timestamp: number;
}

export interface BackupMetadata {
  id: string;
  userId: string;
  timestamp: number;
  dataSize: number;
  checksum: string;
  version: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    timestamp: number;
  };
}

export interface CloudSyncEvents {
  syncStarted: () => void;
  syncCompleted: (stats: SyncStats) => void;
  syncError: (error: Error) => void;
  conflictDetected: (conflict: SyncConflict) => void;
  backupCreated: (metadata: BackupMetadata) => void;
  authStateChanged: (user: User | null) => void;
}

export interface SyncStats {
  totalItems: number;
  syncedItems: number;
  conflictedItems: number;
  errorItems: number;
  duration: number;
  timestamp: number;
}

export class CloudSyncService {
  private static instance: CloudSyncService | null = null;
  private supabase: SupabaseClient;
  private config: CloudSyncConfig;
  private currentUser: User | null = null;
  private listeners: Partial<CloudSyncEvents> = {};
  private syncInProgress = false;
  private realtimeSubscriptions: RealtimeChannel[] = [];

  private constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.config = this.getDefaultConfig();
    this.initializeAuth();
    this.setupRealtimeSync();
  }

  public static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
    }
    return CloudSyncService.instance;
  }

  // Reset instance for testing
  public static resetInstance(): void {
    CloudSyncService.instance = null;
  }

  private getDefaultConfig(): CloudSyncConfig {
    return {
      autoSync: true,
      syncInterval: 30000, // 30 seconds
      conflictResolution: "merge",
      enableBackup: true,
      enableRealtime: true,
    };
  }

  private async initializeAuth(): Promise<void> {
    try {
      // Get initial session
      const {
        data: {session},
      } = await this.supabase.auth.getSession();
      this.currentUser = session?.user || null;

      // Listen for auth changes
      this.supabase.auth.onAuthStateChange((event, session) => {
        this.currentUser = session?.user || null;
        this.listeners.authStateChanged?.(this.currentUser);

        if (event === "SIGNED_IN") {
          this.setupRealtimeSync();
          if (this.config.autoSync) {
            this.startAutoSync();
          }
        } else if (event === "SIGNED_OUT") {
          this.stopRealtimeSync();
          this.stopAutoSync();
        }
      });
    } catch (error) {
      console.error("[CloudSync] Auth initialization failed:", error);
    }
  }

  // Authentication methods
  public async signInWithGoogle(): Promise<{
    user: User | null;
    error: Error | null;
  }> {
    try {
      const {data, error} = await this.supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/abc-list/`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        return {user: null, error};
      }

      return {user: data.user, error: null};
    } catch (error) {
      return {user: null, error: error as Error};
    }
  }

  public async signOut(): Promise<{error: Error | null}> {
    try {
      const {error} = await this.supabase.auth.signOut();
      return {error};
    } catch (error) {
      return {error: error as Error};
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Configuration management
  public updateConfig(newConfig: Partial<CloudSyncConfig>): void {
    this.config = {...this.config, ...newConfig};

    // Apply configuration changes
    if (newConfig.enableRealtime !== undefined) {
      if (newConfig.enableRealtime) {
        this.setupRealtimeSync();
      } else {
        this.stopRealtimeSync();
      }
    }

    if (newConfig.autoSync !== undefined) {
      if (newConfig.autoSync) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    }

    this.saveConfig();
  }

  public getConfig(): CloudSyncConfig {
    return {...this.config};
  }

  private saveConfig(): void {
    try {
      localStorage.setItem("cloud-sync-config", JSON.stringify(this.config));
    } catch (error) {
      console.error("[CloudSync] Failed to save config:", error);
    }
  }

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem("cloud-sync-config");
      if (stored) {
        this.config = {...this.getDefaultConfig(), ...JSON.parse(stored)};
      }
    } catch (error) {
      console.error("[CloudSync] Failed to load config:", error);
      this.config = this.getDefaultConfig();
    }
  }

  // Core sync functionality
  public async syncDataToCloud(
    storeName: string,
    items: Record<string, unknown>,
  ): Promise<SyncStats> {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    if (this.syncInProgress) {
      throw new Error("Sync already in progress");
    }

    this.syncInProgress = true;
    this.listeners.syncStarted?.();

    const startTime = Date.now();
    const stats: SyncStats = {
      totalItems: Object.keys(items).length,
      syncedItems: 0,
      conflictedItems: 0,
      errorItems: 0,
      duration: 0,
      timestamp: startTime,
    };

    try {
      for (const [key, data] of Object.entries(items)) {
        try {
          const syncResult = await this.syncSingleItem(storeName, key, data);

          if (syncResult.hasConflict) {
            stats.conflictedItems++;
          } else {
            stats.syncedItems++;
          }
        } catch (error) {
          console.error(
            `[CloudSync] Failed to sync ${storeName}/${key}:`,
            error,
          );
          stats.errorItems++;
        }
      }

      stats.duration = Date.now() - startTime;
      this.listeners.syncCompleted?.(stats);

      return stats;
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncSingleItem(
    storeName: string,
    key: string,
    localData: unknown,
  ): Promise<{hasConflict: boolean; resolvedData?: unknown}> {
    const tableName = this.getTableName(storeName);
    const userId = this.currentUser!.id;

    // Check if item exists remotely
    const {data: remoteItem, error: fetchError} = await this.supabase
      .from(tableName)
      .select("*")
      .eq("user_id", userId)
      .eq("item_key", key)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows found
      throw fetchError;
    }

    const localItem: StorageItem = {
      id: key,
      data: localData,
      timestamp: Date.now(),
      lastModified: Date.now(),
      syncStatus: "pending",
    };

    // No remote item exists, create new
    if (!remoteItem) {
      const {error: insertError} = await this.supabase.from(tableName).insert({
        user_id: userId,
        item_key: key,
        data: localData,
        created_at: new Date(localItem.timestamp).toISOString(),
        updated_at: new Date(localItem.lastModified).toISOString(),
        device_info: this.getDeviceInfo(),
      });

      if (insertError) {
        throw insertError;
      }

      return {hasConflict: false};
    }

    // Check for conflicts
    const remoteUpdated = new Date(remoteItem.updated_at).getTime();
    const localUpdated = localItem.lastModified;

    if (Math.abs(remoteUpdated - localUpdated) > 1000) {
      // 1 second tolerance
      // Conflict detected
      const conflict: SyncConflict = {
        id: `${storeName}_${key}_${Date.now()}`,
        storeName,
        localData: localItem,
        remoteData: {
          id: key,
          data: remoteItem.data,
          timestamp: new Date(remoteItem.created_at).getTime(),
          lastModified: remoteUpdated,
          syncStatus: "synced",
        },
        conflictType: "update_conflict",
        timestamp: Date.now(),
      };

      this.listeners.conflictDetected?.(conflict);

      // Apply conflict resolution strategy
      const resolvedData = await this.resolveConflict(conflict);

      if (resolvedData) {
        const {error: updateError} = await this.supabase
          .from(tableName)
          .update({
            data: resolvedData,
            updated_at: new Date().toISOString(),
            device_info: this.getDeviceInfo(),
          })
          .eq("user_id", userId)
          .eq("item_key", key);

        if (updateError) {
          throw updateError;
        }
      }

      return {hasConflict: true, resolvedData};
    }

    // No conflict, update remote
    const {error: updateError} = await this.supabase
      .from(tableName)
      .update({
        data: localData,
        updated_at: new Date(localUpdated).toISOString(),
        device_info: this.getDeviceInfo(),
      })
      .eq("user_id", userId)
      .eq("item_key", key);

    if (updateError) {
      throw updateError;
    }

    return {hasConflict: false};
  }

  public async syncDataFromCloud(
    storeName: string,
  ): Promise<Record<string, unknown>> {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    const tableName = this.getTableName(storeName);
    const userId = this.currentUser!.id;

    const {data: remoteItems, error} = await this.supabase
      .from(tableName)
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    const result: Record<string, unknown> = {};
    for (const item of remoteItems || []) {
      result[item.item_key] = item.data;
    }

    return result;
  }

  // Conflict resolution
  private async resolveConflict(conflict: SyncConflict): Promise<unknown> {
    switch (this.config.conflictResolution) {
      case "local":
        return conflict.localData.data;

      case "remote":
        return conflict.remoteData.data;

      case "merge":
        return this.mergeData(
          conflict.localData.data,
          conflict.remoteData.data,
        );

      case "ask":
        // For now, default to merge. In a real app, you'd show a UI dialog
        return this.mergeData(
          conflict.localData.data,
          conflict.remoteData.data,
        );

      default:
        return conflict.localData.data;
    }
  }

  private mergeData(localData: unknown, remoteData: unknown): unknown {
    // Simple merge strategy for ABC-List data structures
    if (Array.isArray(localData) && Array.isArray(remoteData)) {
      // Merge arrays by combining unique items
      const combined = [...localData];
      for (const item of remoteData) {
        if (
          !combined.find(
            (local) => JSON.stringify(local) === JSON.stringify(item),
          )
        ) {
          combined.push(item);
        }
      }
      return combined;
    }

    if (
      typeof localData === "object" &&
      typeof remoteData === "object" &&
      localData !== null &&
      remoteData !== null
    ) {
      // Merge objects by combining properties
      return {...remoteData, ...localData};
    }

    // For primitive types, prefer local data
    return localData;
  }

  // Backup and restore functionality
  public async createBackup(): Promise<BackupMetadata> {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    const userId = this.currentUser!.id;
    const timestamp = Date.now();

    // Collect all user data from all stores
    const allData: Record<string, Record<string, unknown>> = {};
    const storeNames = [
      "abc-lists",
      "kawas",
      "kagas",
      "stadt-land-fluss",
      "basar",
    ];

    for (const storeName of storeNames) {
      try {
        allData[storeName] = await this.syncDataFromCloud(storeName);
      } catch (error) {
        console.warn(`[CloudSync] Failed to backup ${storeName}:`, error);
        allData[storeName] = {};
      }
    }

    // Calculate checksum
    const dataString = JSON.stringify(allData);
    const checksum = await this.calculateChecksum(dataString);

    const backupMetadata: BackupMetadata = {
      id: `backup_${userId}_${timestamp}`,
      userId,
      timestamp,
      dataSize: dataString.length,
      checksum,
      version: "1.0",
      deviceInfo: this.getDeviceInfo(),
    };

    // Save backup to Supabase
    const {error: backupError} = await this.supabase
      .from("user_backups")
      .insert({
        backup_id: backupMetadata.id,
        user_id: userId,
        backup_data: allData,
        metadata: backupMetadata,
        created_at: new Date(timestamp).toISOString(),
      });

    if (backupError) {
      throw backupError;
    }

    this.listeners.backupCreated?.(backupMetadata);
    return backupMetadata;
  }

  public async restoreFromBackup(backupId: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    const userId = this.currentUser!.id;

    const {data: backup, error} = await this.supabase
      .from("user_backups")
      .select("*")
      .eq("backup_id", backupId)
      .eq("user_id", userId)
      .single();

    if (error) {
      throw error;
    }

    if (!backup) {
      throw new Error("Backup not found");
    }

    // Restore data to cloud storage
    const backupData = backup.backup_data as Record<
      string,
      Record<string, unknown>
    >;

    for (const [storeName, storeData] of Object.entries(backupData)) {
      try {
        await this.syncDataToCloud(storeName, storeData);
      } catch (error) {
        console.error(`[CloudSync] Failed to restore ${storeName}:`, error);
      }
    }
  }

  public async listBackups(): Promise<BackupMetadata[]> {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    const userId = this.currentUser!.id;

    const {data: backups, error} = await this.supabase
      .from("user_backups")
      .select("metadata, created_at")
      .eq("user_id", userId)
      .order("created_at", {ascending: false});

    if (error) {
      throw error;
    }

    return (backups || []).map((backup) => backup.metadata);
  }

  // Real-time sync
  private setupRealtimeSync(): void {
    if (!this.config.enableRealtime || !this.isAuthenticated()) {
      return;
    }

    const userId = this.currentUser!.id;
    const storeNames = [
      "abc-lists",
      "kawas",
      "kagas",
      "stadt-land-fluss",
      "basar",
    ];

    this.stopRealtimeSync(); // Clean up existing subscriptions

    for (const storeName of storeNames) {
      const tableName = this.getTableName(storeName);

      const subscription = this.supabase
        .channel(`public:${tableName}:user_id=eq.${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: tableName,
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            this.handleRealtimeUpdate(storeName, payload);
          },
        )
        .subscribe();

      this.realtimeSubscriptions.push(subscription);
    }
  }

  private stopRealtimeSync(): void {
    for (const subscription of this.realtimeSubscriptions) {
      this.supabase.removeChannel(subscription);
    }
    this.realtimeSubscriptions = [];
  }

  private handleRealtimeUpdate(
    storeName: string,
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
  ): void {
    // Handle real-time updates from other devices
    console.log(`[CloudSync] Real-time update for ${storeName}:`, payload);
    // In a full implementation, this would update the local storage
    // and notify the UI of changes
  }

  // Auto-sync functionality
  private autoSyncInterval: NodeJS.Timeout | null = null;

  private startAutoSync(): void {
    if (!this.isAuthenticated() || !this.config.autoSync) {
      return;
    }

    this.stopAutoSync();

    this.autoSyncInterval = setInterval(async () => {
      try {
        // Get all local data and sync it
        const storeNames = [
          "abc-lists",
          "kawas",
          "kagas",
          "stadt-land-fluss",
          "basar",
        ];

        for (const storeName of storeNames) {
          // This would integrate with the existing EnhancedPWAStorage
          // to get local data and sync it to cloud
        }
      } catch (error) {
        console.error("[CloudSync] Auto-sync failed:", error);
      }
    }, this.config.syncInterval);
  }

  private stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }

  // Event listeners
  public addEventListener<K extends keyof CloudSyncEvents>(
    event: K,
    listener: CloudSyncEvents[K],
  ): void {
    this.listeners[event] = listener;
  }

  public removeEventListener<K extends keyof CloudSyncEvents>(event: K): void {
    delete this.listeners[event];
  }

  // Utility methods
  private getTableName(storeName: string): string {
    const tableMap: Record<string, string> = {
      "abc-lists": "user_abc_lists",
      kawas: "user_kawas",
      kagas: "user_kagas",
      "stadt-land-fluss": "user_stadt_land_fluss",
      basar: "user_basar_items",
    };

    return tableMap[storeName] || `user_${storeName.replace("-", "_")}`;
  }

  private getDeviceInfo(): Record<string, unknown> {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      timestamp: Date.now(),
    };
  }

  private async calculateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Privacy and GDPR compliance
  public async deleteAllUserData(): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    const userId = this.currentUser!.id;
    const storeNames = [
      "abc-lists",
      "kawas",
      "kagas",
      "stadt-land-fluss",
      "basar",
    ];

    // Delete from all tables
    for (const storeName of storeNames) {
      const tableName = this.getTableName(storeName);

      const {error} = await this.supabase
        .from(tableName)
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error(`[CloudSync] Failed to delete ${tableName}:`, error);
      }
    }

    // Delete backups
    const {error: backupError} = await this.supabase
      .from("user_backups")
      .delete()
      .eq("user_id", userId);

    if (backupError) {
      console.error("[CloudSync] Failed to delete backups:", backupError);
    }
  }

  public async exportUserData(): Promise<Record<string, unknown>> {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    const allData: Record<string, unknown> = {};
    const storeNames = [
      "abc-lists",
      "kawas",
      "kagas",
      "stadt-land-fluss",
      "basar",
    ];

    for (const storeName of storeNames) {
      try {
        allData[storeName] = await this.syncDataFromCloud(storeName);
      } catch (error) {
        console.warn(`[CloudSync] Failed to export ${storeName}:`, error);
        allData[storeName] = {};
      }
    }

    // Include backups metadata
    allData.backups = await this.listBackups();

    return allData;
  }
}

// Export singleton instance (but don't create during testing)
export const cloudSyncService =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? null
    : CloudSyncService.getInstance();
