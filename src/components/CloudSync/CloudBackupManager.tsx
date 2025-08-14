import React, {useState} from "react";
import {
  Save,
  Download,
  Upload,
  FileArchive,
  Calendar,
  HardDrive,
  Cloud,
} from "lucide-react";
import {useCloudBackup} from "../../contexts/CloudSyncContext";
import {BackupMetadata} from "../../lib/cloudSync";
import {Button} from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {Alert, AlertDescription} from "../ui/alert";
import {Badge} from "../ui/badge";
import {toast} from "sonner";

// Extract handler functions outside component to prevent recreation
const handleCreateBackupAction =
  (
    createBackup: () => Promise<BackupMetadata>,
    setIsCreating: (value: boolean) => void,
    clearError: () => void,
  ) =>
  async () => {
    try {
      setIsCreating(true);
      clearError();
      const metadata = await createBackup();
      toast.success(`Backup erfolgreich erstellt: ${metadata.id}`);
    } catch (error) {
      console.error("Backup creation failed:", error);
      toast.error("Backup-Erstellung fehlgeschlagen");
    } finally {
      setIsCreating(false);
    }
  };

const handleRestoreBackupAction =
  (
    restoreBackup: (backupId: string) => Promise<void>,
    backupId: string,
    setIsRestoring: (value: boolean) => void,
    clearError: () => void,
    setShowDialog: (value: boolean) => void,
  ) =>
  async () => {
    try {
      setIsRestoring(true);
      clearError();
      await restoreBackup(backupId);
      toast.success("Backup erfolgreich wiederhergestellt");
      setShowDialog(false);
    } catch (error) {
      console.error("Backup restoration failed:", error);
      toast.error("Wiederherstellung fehlgeschlagen");
    } finally {
      setIsRestoring(false);
    }
  };

const handleLoadBackupsAction =
  (
    listBackups: () => Promise<BackupMetadata[]>,
    setBackups: (value: BackupMetadata[]) => void,
    setIsLoading: (value: boolean) => void,
    clearError: () => void,
  ) =>
  async () => {
    try {
      setIsLoading(true);
      clearError();
      const backupList = await listBackups();
      setBackups(backupList);
    } catch (error) {
      console.error("Failed to load backups:", error);
      toast.error("Backup-Liste konnte nicht geladen werden");
    } finally {
      setIsLoading(false);
    }
  };

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface BackupItemProps {
  backup: BackupMetadata;
  onRestore: (backupId: string) => void;
  isRestoring: boolean;
}

function BackupItem({backup, onRestore, isRestoring}: BackupItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleRestore = () => {
    onRestore(backup.id);
  };

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileArchive className="h-4 w-4 text-blue-600" />
            <span className="font-medium">
              Backup {backup.id.split("_").pop()}
            </span>
            <Badge variant="outline" className="text-xs">
              v{backup.version}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(backup.timestamp)}
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {formatFileSize(backup.dataSize)}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleDetails}>
            Details
          </Button>
          <Button size="sm" onClick={handleRestore} disabled={isRestoring}>
            {isRestoring ? (
              <>
                <Upload className="h-3 w-3 mr-1 animate-spin" />
                Wiederherstellen...
              </>
            ) : (
              <>
                <Upload className="h-3 w-3 mr-1" />
                Wiederherstellen
              </>
            )}
          </Button>
        </div>
      </div>

      {showDetails && (
        <div className="pt-3 border-t space-y-2">
          <div className="text-sm">
            <p>
              <strong>Checksum:</strong>{" "}
              <code className="text-xs">{backup.checksum}</code>
            </p>
            <p>
              <strong>Gerät:</strong> {backup.deviceInfo.platform}
            </p>
            <p>
              <strong>User Agent:</strong>{" "}
              <span className="text-xs">{backup.deviceInfo.userAgent}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function CloudBackupManager() {
  const {
    isAuthenticated,
    createBackup,
    restoreBackup,
    listBackups,
    lastError,
    clearError,
  } = useCloudBackup();
  const [showDialog, setShowDialog] = useState(false);
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Create stable handler references
  const handleCreateBackup = handleCreateBackupAction(
    createBackup,
    setIsCreating,
    clearError,
  );
  const handleLoadBackups = handleLoadBackupsAction(
    listBackups,
    setBackups,
    setIsLoading,
    clearError,
  );

  const handleRestoreBackup = (backupId: string) => {
    handleRestoreBackupAction(
      restoreBackup,
      backupId,
      setIsRestoring,
      clearError,
      setShowDialog,
    )();
  };

  const handleDialogOpen = () => {
    setShowDialog(true);
    if (isAuthenticated) {
      handleLoadBackups();
    }
  };

  if (!isAuthenticated) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Cloud className="h-4 w-4 mr-2" />
        Backup (Anmeldung erforderlich)
      </Button>
    );
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDialogOpen}
          aria-label="Cloud-Backup verwalten"
        >
          <Save className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Backup</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Cloud-Backup Management
          </DialogTitle>
          <DialogDescription>
            Erstellen und verwalten Sie Backups Ihrer ABC-Listen, KaWa und KaGa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create Backup Section */}
          <div className="space-y-3">
            <h4 className="font-medium">Neues Backup erstellen</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleCreateBackup}
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-spin" />
                    Backup wird erstellt...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Backup erstellen
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleLoadBackups}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Download className="h-4 w-4 mr-2 animate-spin" />
                    Laden...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Aktualisieren
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Ein Backup enthält alle Ihre ABC-Listen, KaWa, KaGa und
              Einstellungen.
            </p>
          </div>

          {/* Error Display */}
          {lastError && (
            <Alert variant="destructive">
              <AlertDescription>{lastError.message}</AlertDescription>
            </Alert>
          )}

          {/* Backups List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Verfügbare Backups</h4>
              <Badge variant="outline">
                {backups.length} Backup{backups.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {backups.length === 0 && !isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <FileArchive className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Keine Backups gefunden</p>
                <p className="text-sm">Erstellen Sie Ihr erstes Backup</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {backups.map((backup) => (
                  <BackupItem
                    key={backup.id}
                    backup={backup}
                    onRestore={handleRestoreBackup}
                    isRestoring={isRestoring}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Backup Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-2">
              Backup-Informationen
            </h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Backups werden verschlüsselt in der Cloud gespeichert</li>
              <li>• Automatische Integritätsprüfung durch Checksummen</li>
              <li>• Vollständige Wiederherstellung aller Daten möglich</li>
              <li>• DSGVO-konforme Datenspeicherung</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
