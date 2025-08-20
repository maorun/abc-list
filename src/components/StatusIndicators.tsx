import React from "react";
import {CloudBackupManager} from "./CloudSync/CloudBackupManager";
import {CloudAuthButton} from "./CloudSync/CloudAuthButton";
import {GamificationStatusIndicator} from "./Gamification/GamificationStatusIndicator";
import {OfflineStatusIcon} from "./OfflineStatusIndicator";
import {SyncStatusIcon} from "./SyncStatusIndicator";
import {CloudSyncStatusIcon} from "./CloudSync/CloudSyncStatusIndicator";

interface StatusIndicatorsProps {
  isMobile?: boolean;
  onGamificationClick?: () => void;
}

// Extract handler to prevent recreation
const createGamificationHandler = (onClick?: () => void) => () => {
  if (onClick) onClick();
};

export function StatusIndicators({
  isMobile = false,
  onGamificationClick,
}: StatusIndicatorsProps) {
  const gamificationHandler = createGamificationHandler(onGamificationClick);

  if (isMobile) {
    // Mobile layout: Stack vertically with compact spacing for better fit
    return (
      <div className="space-y-2 py-2 border-t border-blue-700 mt-3">
        <div className="text-sm font-medium text-white/80 px-4">
          Status & Einstellungen
        </div>

        {/* Cloud & Backup Section */}
        <div className="space-y-1 px-4">
          <div className="text-xs text-white/60 font-medium">
            Cloud & Backup
          </div>
          <div className="flex flex-col gap-1">
            <CloudBackupManager />
            <CloudAuthButton />
          </div>
        </div>

        {/* Status Section */}
        <div className="space-y-1 px-4">
          <div className="text-xs text-white/60 font-medium">Status</div>
          <div className="flex items-center gap-3">
            <GamificationStatusIndicator onClick={gamificationHandler} />
            <div className="flex items-center gap-2">
              <OfflineStatusIcon />
              <SyncStatusIcon />
              <CloudSyncStatusIcon />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout: Horizontal with better spacing
  return (
    <div className="flex items-center gap-3">
      {/* Cloud & Backup Group */}
      <div className="flex items-center gap-2 pr-3 border-r border-blue-700/30">
        <CloudBackupManager />
        <CloudAuthButton />
      </div>

      {/* Gamification Group */}
      <div className="pr-3 border-r border-blue-700/30">
        <GamificationStatusIndicator onClick={gamificationHandler} />
      </div>

      {/* Status Icons Group */}
      <div className="flex items-center gap-2">
        <OfflineStatusIcon />
        <SyncStatusIcon />
        <CloudSyncStatusIcon />
      </div>
    </div>
  );
}
