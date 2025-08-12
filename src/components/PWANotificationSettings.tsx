import React, {useState, useEffect} from "react";
import {Bell, BellOff, TestTube, Check} from "lucide-react";
import {Button} from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  getPWANotificationSettings,
  savePWANotificationSettings,
  requestPWANotificationPermission,
  testPushNotification,
  scheduleDailyReminders,
  checkPWANotificationSupport,
  PWANotificationSettings,
} from "../lib/pwaNotifications";

// Extract handler functions outside component
const handlePermissionRequestAction =
  (
    setPermissions: (perms: any) => void,
    setSettings: (settings: PWANotificationSettings) => void,
  ) =>
  async () => {
    const {basicPermission, pushPermission, subscription} =
      await requestPWANotificationPermission();

    setPermissions({basicPermission, pushPermission, subscription});

    if (basicPermission || pushPermission) {
      const currentSettings = getPWANotificationSettings();
      const newSettings = {
        ...currentSettings,
        enabled: basicPermission,
        pushEnabled: pushPermission,
      };
      savePWANotificationSettings(newSettings);
      setSettings(newSettings);

      if (pushPermission) {
        scheduleDailyReminders();
      }
    }
  };

const handleTestNotificationAction =
  (setIsTestingNotification: (testing: boolean) => void) => async () => {
    setIsTestingNotification(true);
    try {
      const success = await testPushNotification();
      if (success) {
        // Show success feedback briefly
        setTimeout(() => setIsTestingNotification(false), 2000);
      } else {
        setIsTestingNotification(false);
      }
    } catch (error) {
      console.error("Test notification failed:", error);
      setIsTestingNotification(false);
    }
  };

const handleSettingChangeAction =
  (
    settings: PWANotificationSettings,
    setSettings: (settings: PWANotificationSettings) => void,
  ) =>
  (field: keyof PWANotificationSettings, value: any) => {
    const newSettings = {...settings, [field]: value};
    setSettings(newSettings);
    savePWANotificationSettings(newSettings);

    // Reschedule reminders if frequency changed
    if (field === "frequency" && newSettings.pushEnabled) {
      scheduleDailyReminders();
    }
  };

export function PWANotificationSettingsDialog() {
  const [settings, setSettings] = useState<PWANotificationSettings>(
    getPWANotificationSettings(),
  );
  const [permissions, setPermissions] = useState<{
    basicPermission: boolean;
    pushPermission: boolean;
    subscription?: PushSubscription;
  }>({
    basicPermission: false,
    pushPermission: false,
  });
  const [support] = useState(checkPWANotificationSupport());
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check current permission status
    const checkPermissions = () => {
      const basicPermission =
        "Notification" in window && Notification.permission === "granted";
      setPermissions((prev) => ({...prev, basicPermission}));
    };

    checkPermissions();
  }, []);

  // Create stable handler references
  const handlePermissionRequest = handlePermissionRequestAction(
    setPermissions,
    setSettings,
  );
  const handleTestNotification = handleTestNotificationAction(
    setIsTestingNotification,
  );
  const handleSettingChange = handleSettingChangeAction(settings, setSettings);

  const canUseNotifications =
    support.basicNotifications || support.pushNotifications;
  const hasAnyPermission =
    permissions.basicPermission || permissions.pushPermission;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={!canUseNotifications}
        >
          {hasAnyPermission ? (
            <Bell className="h-4 w-4 text-blue-600" />
          ) : (
            <BellOff className="h-4 w-4 text-gray-400" />
          )}
          Benachrichtigungen
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            PWA Benachrichtigungen
          </DialogTitle>
          <DialogDescription>
            Konfiguriere Benachrichtigungen für Lernreminder und App-Updates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Support Status */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Unterstützung</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                {support.basicNotifications ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                )}
                Browser-Benachrichtigungen
              </div>
              <div className="flex items-center gap-2">
                {support.pushNotifications ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                )}
                Push-Benachrichtigungen
              </div>
              <div className="flex items-center gap-2">
                {support.serviceWorker ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                )}
                Service Worker
              </div>
            </div>
          </div>

          {canUseNotifications && (
            <>
              {/* Permission Request */}
              {!hasAnyPermission && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Berechtigung</h4>
                  <p className="text-sm text-slate-600">
                    Erlaube Benachrichtigungen für Lernreminder.
                  </p>
                  <Button onClick={handlePermissionRequest} className="w-full">
                    <Bell className="h-4 w-4 mr-2" />
                    Benachrichtigungen erlauben
                  </Button>
                </div>
              )}

              {/* Settings */}
              {hasAnyPermission && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Einstellungen</h4>

                  {/* Basic Notifications Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm">
                      Browser-Benachrichtigungen
                    </label>
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={(e) =>
                        handleSettingChange("enabled", e.target.checked)
                      }
                      className="rounded"
                    />
                  </div>

                  {/* Push Notifications Toggle */}
                  {support.pushNotifications && (
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Push-Benachrichtigungen</label>
                      <input
                        type="checkbox"
                        checked={settings.pushEnabled}
                        onChange={(e) =>
                          handleSettingChange("pushEnabled", e.target.checked)
                        }
                        className="rounded"
                      />
                    </div>
                  )}

                  {/* Frequency */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Häufigkeit</label>
                    <select
                      value={settings.frequency}
                      onChange={(e) =>
                        handleSettingChange("frequency", e.target.value)
                      }
                      className="w-full p-2 border rounded-md text-sm"
                    >
                      <option value="daily">Täglich</option>
                      <option value="twice-daily">Zweimal täglich</option>
                      <option value="hourly">Alle 2 Stunden</option>
                    </select>
                  </div>

                  {/* Quiet Hours */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ruhezeiten</label>
                    <div className="flex gap-2 items-center">
                      <select
                        value={settings.quietHours.start}
                        onChange={(e) =>
                          handleSettingChange("quietHours", {
                            ...settings.quietHours,
                            start: parseInt(e.target.value),
                          })
                        }
                        className="flex-1 p-2 border rounded-md text-sm"
                      >
                        {Array.from({length: 24}, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, "0")}:00
                          </option>
                        ))}
                      </select>
                      <span className="text-sm">bis</span>
                      <select
                        value={settings.quietHours.end}
                        onChange={(e) =>
                          handleSettingChange("quietHours", {
                            ...settings.quietHours,
                            end: parseInt(e.target.value),
                          })
                        }
                        className="flex-1 p-2 border rounded-md text-sm"
                      >
                        {Array.from({length: 24}, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, "0")}:00
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Max Notifications */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Max. Benachrichtigungen pro Tag:{" "}
                      {settings.maxNotifications}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={settings.maxNotifications}
                      onChange={(e) =>
                        handleSettingChange(
                          "maxNotifications",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Test Button */}
                  <Button
                    onClick={handleTestNotification}
                    disabled={
                      (!settings.enabled && !settings.pushEnabled) ||
                      isTestingNotification
                    }
                    variant="outline"
                    className="w-full"
                  >
                    {isTestingNotification ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Test erfolgreich!
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test-Benachrichtigung
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}

          {!canUseNotifications && (
            <div className="text-center text-sm text-slate-600">
              <p>Dein Browser unterstützt keine Benachrichtigungen.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
