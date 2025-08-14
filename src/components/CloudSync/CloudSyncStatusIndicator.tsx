import React, { useState } from "react";
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wifi, 
  WifiOff 
} from "lucide-react";
import { useCloudSyncStatus } from "../../contexts/CloudSyncContext";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Progress } from "../ui/progress";

// Extract icon components to prevent re-renders
const SyncIcon = <RefreshCw className="h-3 w-3 mr-1 animate-spin" />;
const CloudSyncedIcon = <Cloud className="h-3 w-3 mr-1 text-green-600" />;
const CloudErrorIcon = <CloudOff className="h-3 w-3 mr-1 text-red-600" />;
const ConflictIcon = <AlertTriangle className="h-3 w-3 mr-1 text-orange-600" />;

// Extract handler functions outside component
const handleStatusDialogAction = (
  setShowStatusDialog: (value: boolean) => void
) => () => {
  setShowStatusDialog(true);
};

const handleCloseDialogAction = (
  setShowStatusDialog: (value: boolean) => void
) => () => {
  setShowStatusDialog(false);
};

export function CloudSyncStatusIndicator() {
  const { isSyncing, lastSyncStats, pendingConflicts, hasConflicts, lastError } = useCloudSyncStatus();
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // Create stable handler references
  const handleStatusDialog = handleStatusDialogAction(setShowStatusDialog);
  const handleCloseDialog = handleCloseDialogAction(setShowStatusDialog);

  // Determine status and icon
  const getStatus = () => {
    if (isSyncing) {
      return {
        label: "Synchronisiert...",
        icon: SyncIcon,
        variant: "secondary" as const,
        description: "Daten werden synchronisiert",
      };
    }

    if (lastError) {
      return {
        label: "Sync-Fehler",
        icon: CloudErrorIcon,
        variant: "destructive" as const,
        description: lastError.message,
      };
    }

    if (hasConflicts) {
      return {
        label: `${pendingConflicts.length} Konflikt${pendingConflicts.length > 1 ? 'e' : ''}`,
        icon: ConflictIcon,
        variant: "secondary" as const,
        description: "Konflikte müssen gelöst werden",
      };
    }

    if (lastSyncStats) {
      return {
        label: "Synchronisiert",
        icon: CloudSyncedIcon,
        variant: "secondary" as const,
        description: `Letzte Sync: ${new Date(lastSyncStats.timestamp).toLocaleTimeString()}`,
      };
    }

    return {
      label: "Keine Synchronisation",
      icon: <CloudOff className="h-3 w-3 mr-1 text-gray-500" />,
      variant: "outline" as const,
      description: "Cloud-Sync nicht aktiv",
    };
  };

  const status = getStatus();

  // Don't show if no sync activity and no errors
  if (!isSyncing && !lastError && !hasConflicts && !lastSyncStats) {
    return null;
  }

  return (
    <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
      <DialogTrigger asChild>
        <Button
          variant={status.variant}
          size="sm"
          className="flex items-center gap-1 text-xs"
          onClick={handleStatusDialog}
          aria-label={`Cloud-Sync Status: ${status.label}`}
        >
          {status.icon}
          <span className="hidden sm:inline">{status.label}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Cloud-Synchronisation Status
          </DialogTitle>
          <DialogDescription>
            Übersicht über Ihre Cloud-Synchronisation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div className="space-y-2">
            <h4 className="font-medium">Aktueller Status</h4>
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-gray-50">
              {status.icon}
              <div>
                <p className="font-medium">{status.label}</p>
                <p className="text-sm text-gray-600">{status.description}</p>
              </div>
            </div>
          </div>

          {/* Sync Progress */}
          {isSyncing && (
            <div className="space-y-2">
              <h4 className="font-medium">Synchronisation läuft</h4>
              <div className="space-y-2">
                <Progress value={undefined} className="w-full" />
                <p className="text-sm text-gray-600">
                  Daten werden mit der Cloud synchronisiert...
                </p>
              </div>
            </div>
          )}

          {/* Last Sync Stats */}
          {lastSyncStats && (
            <div className="space-y-2">
              <h4 className="font-medium">Letzte Synchronisation</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-green-50 rounded border border-green-200">
                  <p className="font-medium text-green-900">Synchronisiert</p>
                  <p className="text-green-700">{lastSyncStats.syncedItems} Elemente</p>
                </div>
                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="font-medium text-blue-900">Gesamt</p>
                  <p className="text-blue-700">{lastSyncStats.totalItems} Elemente</p>
                </div>
                {lastSyncStats.conflictedItems > 0 && (
                  <div className="p-2 bg-orange-50 rounded border border-orange-200">
                    <p className="font-medium text-orange-900">Konflikte</p>
                    <p className="text-orange-700">{lastSyncStats.conflictedItems} Elemente</p>
                  </div>
                )}
                {lastSyncStats.errorItems > 0 && (
                  <div className="p-2 bg-red-50 rounded border border-red-200">
                    <p className="font-medium text-red-900">Fehler</p>
                    <p className="text-red-700">{lastSyncStats.errorItems} Elemente</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Dauer: {lastSyncStats.duration}ms • {new Date(lastSyncStats.timestamp).toLocaleString()}
              </p>
            </div>
          )}

          {/* Pending Conflicts */}
          {hasConflicts && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Ausstehende Konflikte ({pendingConflicts.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {pendingConflicts.slice(0, 3).map((conflict) => (
                  <div
                    key={conflict.id}
                    className="p-2 bg-orange-50 rounded border border-orange-200"
                  >
                    <p className="text-sm font-medium text-orange-900">
                      {conflict.storeName}: {conflict.localData.id}
                    </p>
                    <p className="text-xs text-orange-700">
                      {conflict.conflictType === 'update_conflict' ? 'Aktualisierungskonflikt' :
                       conflict.conflictType === 'delete_conflict' ? 'Löschkonflikt' :
                       'Schema-Konflikt'}
                    </p>
                  </div>
                ))}
                {pendingConflicts.length > 3 && (
                  <p className="text-xs text-gray-500">
                    ... und {pendingConflicts.length - 3} weitere
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error Details */}
          {lastError && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CloudOff className="h-4 w-4 text-red-600" />
                Letzter Fehler
              </h4>
              <div className="p-3 bg-red-50 rounded border border-red-200">
                <p className="text-sm text-red-900">{lastError.message}</p>
                <p className="text-xs text-red-700 mt-1">
                  Die Synchronisation wird automatisch wiederholt.
                </p>
              </div>
            </div>
          )}

          {/* Network Status */}
          <div className="space-y-2">
            <h4 className="font-medium">Netzwerk Status</h4>
            <div className="flex items-center gap-2">
              {navigator.onLine ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleCloseDialog}>
            Schließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Mini status indicator for navigation bar
export function CloudSyncStatusIcon() {
  const { isSyncing, hasConflicts, lastError, lastSyncStats } = useCloudSyncStatus();

  // Don't show if no sync activity
  if (!isSyncing && !hasConflicts && !lastError && !lastSyncStats) {
    return null;
  }

  let icon;
  let ariaLabel;

  if (isSyncing) {
    icon = <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
    ariaLabel = "Synchronisation läuft";
  } else if (lastError) {
    icon = <CloudOff className="h-4 w-4 text-red-600" />;
    ariaLabel = "Synchronisation fehlgeschlagen";
  } else if (hasConflicts) {
    icon = <AlertTriangle className="h-4 w-4 text-orange-600" />;
    ariaLabel = "Synchronisationskonflikte";
  } else {
    icon = <CheckCircle className="h-4 w-4 text-green-600" />;
    ariaLabel = "Synchronisiert";
  }

  return (
    <div className="flex items-center" aria-label={ariaLabel}>
      {icon}
    </div>
  );
}