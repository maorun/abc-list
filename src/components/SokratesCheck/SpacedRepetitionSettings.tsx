import React, {useState, useEffect} from "react";
import {Button} from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  type NotificationSettings,
} from "../../lib/notifications";
import {
  DEFAULT_SETTINGS,
  type SpacedRepetitionSettings,
} from "../../lib/spacedRepetition";

interface SpacedRepetitionSettingsProps {
  onSettingsChange?: () => void;
}

const SETTINGS_STORAGE_KEY = 'spacedRepetition_settings';

function getSpacedRepetitionSettings(): SpacedRepetitionSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to load spaced repetition settings:', error);
  }
  return DEFAULT_SETTINGS;
}

function saveSpacedRepetitionSettings(settings: SpacedRepetitionSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save spaced repetition settings:', error);
  }
}

export function SpacedRepetitionSettings({onSettingsChange}: SpacedRepetitionSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [spacedSettings, setSpacedSettings] = useState<SpacedRepetitionSettings>(getSpacedRepetitionSettings);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(getNotificationSettings);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  useEffect(() => {
    // Load settings when component mounts
    setSpacedSettings(getSpacedRepetitionSettings());
    setNotificationSettings(getNotificationSettings());
  }, []);

  const handleSave = () => {
    saveSpacedRepetitionSettings(spacedSettings);
    saveNotificationSettings(notificationSettings);
    onSettingsChange?.();
    setIsOpen(false);
  };

  const handleRequestNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
  };

  const handleReset = () => {
    setSpacedSettings(DEFAULT_SETTINGS);
    setNotificationSettings({
      enabled: true,
      frequency: 'daily',
      quietHours: { start: 22, end: 8 },
      maxNotifications: 3,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          ⚙️ Einstellungen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Spaced Repetition Einstellungen</DialogTitle>
          <DialogDescription>
            Passen Sie den Algorithmus und die Benachrichtigungen an Ihre Lernpräferenzen an
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Spaced Repetition Algorithm Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Algorithmus-Einstellungen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Basis-Intervall (Tage)
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={spacedSettings.baseInterval}
                  onChange={(e) =>
                    setSpacedSettings({
                      ...spacedSettings,
                      baseInterval: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full p-2 border rounded text-sm"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Startwert für neue Begriffe
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Ease-Faktor
                </label>
                <input
                  type="number"
                  min="1.3"
                  max="3.0"
                  step="0.1"
                  value={spacedSettings.easeFactor}
                  onChange={(e) =>
                    setSpacedSettings({
                      ...spacedSettings,
                      easeFactor: parseFloat(e.target.value) || 2.5,
                    })
                  }
                  className="w-full p-2 border rounded text-sm"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Multiplikator für Intervall-Erhöhung
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Minimales Intervall (Tage)
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={spacedSettings.minInterval}
                  onChange={(e) =>
                    setSpacedSettings({
                      ...spacedSettings,
                      minInterval: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full p-2 border rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Maximales Intervall (Tage)
                </label>
                <input
                  type="number"
                  min="30"
                  max="730"
                  value={spacedSettings.maxInterval}
                  onChange={(e) =>
                    setSpacedSettings({
                      ...spacedSettings,
                      maxInterval: parseInt(e.target.value) || 365,
                    })
                  }
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Benachrichtigung-Einstellungen</h3>
            
            {/* Permission Status */}
            <div className="mb-4 p-3 rounded border bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Browser-Benachrichtigungen</p>
                  <p className="text-xs text-gray-600">
                    Status: {
                      notificationPermission === 'granted' ? '✅ Erlaubt' :
                      notificationPermission === 'denied' ? '❌ Abgelehnt' :
                      notificationPermission === 'default' ? '⚠️ Nicht entschieden' :
                      '❌ Nicht unterstützt'
                    }
                  </p>
                </div>
                {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
                  <Button
                    size="sm"
                    onClick={handleRequestNotificationPermission}
                    variant="outline"
                  >
                    Erlaubnis anfragen
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifications-enabled"
                  checked={notificationSettings.enabled}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      enabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="notifications-enabled" className="text-sm font-medium">
                  Benachrichtigungen aktivieren
                </label>
              </div>

              {notificationSettings.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Benachrichtigung-Häufigkeit
                    </label>
                    <select
                      value={notificationSettings.frequency}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          frequency: e.target.value as NotificationSettings['frequency'],
                        })
                      }
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="daily">Täglich</option>
                      <option value="twice-daily">Zweimal täglich</option>
                      <option value="hourly">Stündlich</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Ruhezeit Beginn
                      </label>
                      <select
                        value={notificationSettings.quietHours.start}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            quietHours: {
                              ...notificationSettings.quietHours,
                              start: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full p-2 border rounded text-sm"
                      >
                        {Array.from({length: 24}, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Ruhezeit Ende
                      </label>
                      <select
                        value={notificationSettings.quietHours.end}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            quietHours: {
                              ...notificationSettings.quietHours,
                              end: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full p-2 border rounded text-sm"
                      >
                        {Array.from({length: 24}, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Maximale Benachrichtigungen pro Tag
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={notificationSettings.maxNotifications}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          maxNotifications: parseInt(e.target.value) || 3,
                        })
                      }
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Preset Configurations */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Vorkonfigurationen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSpacedSettings({
                    baseInterval: 1,
                    easeFactor: 2.0,
                    maxInterval: 180,
                    minInterval: 1,
                  });
                }}
              >
                🏃 Intensiv
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSpacedSettings(DEFAULT_SETTINGS);
                }}
              >
                ⚖️ Standard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSpacedSettings({
                    baseInterval: 2,
                    easeFactor: 3.0,
                    maxInterval: 730,
                    minInterval: 1,
                  });
                }}
              >
                🐌 Entspannt
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleReset}>
            Zurücksetzen
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              Speichern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}