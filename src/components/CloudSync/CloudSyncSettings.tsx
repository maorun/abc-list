import React from "react";
import { 
  Settings, 
  RefreshCw, 
  AlertTriangle, 
  Shield, 
  Clock,
  Smartphone,
  Laptop,
  Globe
} from "lucide-react";
import { useCloudSync } from "../../contexts/CloudSyncContext";
import { CloudSyncConfig } from "../../lib/cloudSync";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";

// Extract handler functions outside component to prevent recreation
const handleConfigUpdateAction = (
  updateConfig: (config: Partial<CloudSyncConfig>) => void,
  field: keyof CloudSyncConfig,
  value: CloudSyncConfig[keyof CloudSyncConfig]
) => () => {
  updateConfig({ [field]: value });
};

const handleIntervalChangeAction = (
  updateConfig: (config: Partial<CloudSyncConfig>) => void
) => (value: string) => {
  const interval = parseInt(value) * 1000; // Convert seconds to milliseconds
  updateConfig({ syncInterval: interval });
};

const handleConflictResolutionChangeAction = (
  updateConfig: (config: Partial<CloudSyncConfig>) => void
) => (value: string) => {
  updateConfig({ conflictResolution: value as CloudSyncConfig['conflictResolution'] });
};

export function CloudSyncSettings() {
  const { isAuthenticated, config, updateConfig } = useCloudSync();

  // Create stable handler references
  const handleAutoSyncToggle = handleConfigUpdateAction(updateConfig, 'autoSync', !config.autoSync);
  const handleRealtimeToggle = handleConfigUpdateAction(updateConfig, 'enableRealtime', !config.enableRealtime);
  const handleBackupToggle = handleConfigUpdateAction(updateConfig, 'enableBackup', !config.enableBackup);
  const handleIntervalChange = handleIntervalChangeAction(updateConfig);
  const handleConflictResolutionChange = handleConflictResolutionChangeAction(updateConfig);

  if (!isAuthenticated) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Settings className="h-4 w-4 mr-2" />
        Einstellungen (Anmeldung erforderlich)
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Sync-Einstellungen
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cloud-Sync Einstellungen
          </DialogTitle>
          <DialogDescription>
            Konfigurieren Sie Ihre Cloud-Synchronisation nach Ihren Bedürfnissen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Auto Sync */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Automatische Synchronisation
                </Label>
                <p className="text-sm text-gray-600">
                  Daten automatisch mit der Cloud synchronisieren
                </p>
              </div>
              <Switch
                checked={config.autoSync}
                onCheckedChange={handleAutoSyncToggle}
                aria-label="Automatische Synchronisation aktivieren"
              />
            </div>

            {config.autoSync && (
              <div className="pl-6 space-y-2">
                <Label className="text-sm">Sync-Intervall</Label>
                <Select
                  value={String(config.syncInterval / 1000)}
                  onValueChange={handleIntervalChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Sekunden (Sehr häufig)</SelectItem>
                    <SelectItem value="30">30 Sekunden (Standard)</SelectItem>
                    <SelectItem value="60">1 Minute</SelectItem>
                    <SelectItem value="300">5 Minuten</SelectItem>
                    <SelectItem value="900">15 Minuten</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Real-time Sync */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Echtzeit-Synchronisation
              </Label>
              <p className="text-sm text-gray-600">
                Sofortige Synchronisation bei Änderungen anderer Geräte
              </p>
            </div>
            <Switch
              checked={config.enableRealtime}
              onCheckedChange={handleRealtimeToggle}
              aria-label="Echtzeit-Synchronisation aktivieren"
            />
          </div>

          {/* Backup */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Automatische Backups
              </Label>
              <p className="text-sm text-gray-600">
                Regelmäßige Vollbackups erstellen
              </p>
            </div>
            <Switch
              checked={config.enableBackup}
              onCheckedChange={handleBackupToggle}
              aria-label="Automatische Backups aktivieren"
            />
          </div>

          {/* Conflict Resolution */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Konfliktauflösung
            </Label>
            <p className="text-sm text-gray-600">
              Strategie bei gleichzeitigen Änderungen verschiedener Geräte
            </p>
            <Select
              value={config.conflictResolution}
              onValueChange={handleConflictResolutionChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Lokale Änderungen bevorzugen</p>
                      <p className="text-xs text-gray-600">Dieses Gerät hat Vorrang</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="remote">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Remote-Änderungen bevorzugen</p>
                      <p className="text-xs text-gray-600">Andere Geräte haben Vorrang</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="merge">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Automatisch zusammenführen</p>
                      <p className="text-xs text-gray-600">Intelligente Kombination</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="ask">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Manuell entscheiden</p>
                      <p className="text-xs text-gray-600">Bei jedem Konflikt fragen</p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cross-Platform Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Cross-Platform Unterstützung
            </h5>
            <div className="flex gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                <Laptop className="h-3 w-3 mr-1" />
                Web
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Smartphone className="h-3 w-3 mr-1" />
                Mobile
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Laptop className="h-3 w-3 mr-1" />
                Desktop
              </Badge>
            </div>
            <p className="text-sm text-blue-800">
              Ihre Einstellungen werden auf allen Ihren Geräten synchronisiert.
            </p>
          </div>

          {/* Performance Info */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h5 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Offline-First Design
            </h5>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Vollständig offline nutzbar</li>
              <li>• Automatische Synchronisation bei Verbindung</li>
              <li>• Intelligente Konfliktauflösung</li>
              <li>• Optimierte Bandbreitennutzung</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}