import React from 'react';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
import { useOfflineStatus } from '../contexts/PWAContext';

export function OfflineStatusIndicator() {
  const { isOnline, isOffline } = useOfflineStatus();

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-40 sm:left-auto sm:right-4 sm:w-auto">
      <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4 text-orange-600 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-orange-800">Offline-Modus</p>
            <p className="text-orange-700 text-xs">
              Du arbeitest offline. Änderungen werden synchronisiert, sobald du wieder online bist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini status indicator for navigation bar
export function OfflineStatusIcon() {
  const { isOnline } = useOfflineStatus();

  return (
    <div className="flex items-center">
      {isOnline ? (
        <Wifi className="h-4 w-4 text-green-600" aria-label="Online" />
      ) : (
        <WifiOff className="h-4 w-4 text-orange-600" aria-label="Offline" />
      )}
    </div>
  );
}