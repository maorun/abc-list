import React from "react";
import {RefreshCw, CloudOff, Cloud, Clock} from "lucide-react";
import {useSyncStatus} from "../hooks/useEnhancedStorage";
import {Button} from "./ui/button";

// Extract icon outside component to prevent re-renders
const RefreshIcon = <RefreshCw className="h-3 w-3 mr-1" />;

// Extract handler functions outside component
const handleForceSyncAction = (forceSync: () => Promise<void>) => async () => {
  try {
    await forceSync();
  } catch (error) {
    console.error("Force sync failed:", error);
  }
};

const handleMigrateAction = (migrateData: () => Promise<void>) => async () => {
  try {
    await migrateData();
  } catch (error) {
    console.error("Migration failed:", error);
  }
};

export function SyncStatusIndicator() {
  const {syncQueueSize, isOnline, hasPendingChanges, forceSync, migrateData} =
    useSyncStatus();

  // Create stable handler references
  const handleForceSync = handleForceSyncAction(forceSync);
  const handleMigrate = handleMigrateAction(migrateData);

  // Don't show if everything is synced and online
  if (!hasPendingChanges && isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm">
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {isOnline ? (
              hasPendingChanges ? (
                <Clock className="h-5 w-5 text-orange-600" />
              ) : (
                <Cloud className="h-5 w-5 text-green-600" />
              )
            ) : (
              <CloudOff className="h-5 w-5 text-gray-600" />
            )}
          </div>

          <div className="flex-1">
            <h4 className="text-sm font-medium text-slate-900">
              {isOnline ? "Synchronisation" : "Offline-Modus"}
            </h4>
            <p className="text-xs text-slate-600">
              {hasPendingChanges
                ? `${syncQueueSize} Änderung${syncQueueSize > 1 ? "en" : ""} ausstehend`
                : "Alle Daten synchronisiert"}
            </p>
          </div>

          {isOnline && hasPendingChanges && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleForceSync}
              className="text-xs"
            >
              {RefreshIcon}
              Sync
            </Button>
          )}
        </div>

        {/* Migration button - only show initially */}
        <div className="mt-2 pt-2 border-t border-slate-100">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleMigrate}
            className="text-xs w-full"
          >
            📦 Daten migrieren
          </Button>
        </div>
      </div>
    </div>
  );
}

// Mini sync status for navigation bar
export function SyncStatusIcon() {
  const {hasPendingChanges, isOnline} = useSyncStatus();

  if (!hasPendingChanges && isOnline) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {isOnline ? (
        hasPendingChanges ? (
          <Clock
            className="h-4 w-4 text-orange-600"
            aria-label="Synchronisation ausstehend"
          />
        ) : (
          <Cloud
            className="h-4 w-4 text-green-600"
            aria-label="Synchronisiert"
          />
        )
      ) : (
        <CloudOff className="h-4 w-4 text-gray-600" aria-label="Offline" />
      )}
    </div>
  );
}
