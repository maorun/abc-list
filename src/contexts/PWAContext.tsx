import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  PWAInstallState, 
  PWAInstallManager, 
  OfflineManager, 
  PWAStorage,
  initializePWA 
} from '../lib/pwa';
import { EnhancedPWAStorage } from '../lib/enhancedStorage';

interface PWAContextType {
  // Install state
  installState: PWAInstallState;
  showInstallPrompt: () => Promise<boolean>;
  
  // Offline state
  isOnline: boolean;
  
  // Storage
  storage: PWAStorage;
  enhancedStorage: EnhancedPWAStorage;
  
  // PWA features availability
  isServiceWorkerSupported: boolean;
  isPWACapable: boolean;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

interface PWAProviderProps {
  children: ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [installState, setInstallState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    installPrompt: null
  });
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [managers, setManagers] = useState<{
    installManager: PWAInstallManager;
    offlineManager: OfflineManager;
    storage: PWAStorage;
    enhancedStorage: EnhancedPWAStorage;
  } | null>(null);

  // PWA capabilities detection
  const isServiceWorkerSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator;
  const isPWACapable = isServiceWorkerSupported && typeof window !== 'undefined' && 'Notification' in window;

  useEffect(() => {
    // Initialize PWA functionality
    const { installManager, offlineManager, storage } = initializePWA();
    const enhancedStorage = new EnhancedPWAStorage();
    
    setManagers({ installManager, offlineManager, storage, enhancedStorage });

    // Subscribe to install state changes
    const unsubscribeInstall = installManager.onStateChange(setInstallState);

    // Subscribe to offline state changes
    const unsubscribeOffline = offlineManager.onStatusChange(setIsOnline);

    // Cleanup
    return () => {
      unsubscribeInstall();
      unsubscribeOffline();
    };
  }, []);

  const showInstallPrompt = async (): Promise<boolean> => {
    if (managers?.installManager) {
      return managers.installManager.showInstallPrompt();
    }
    return false;
  };

  const contextValue: PWAContextType = {
    installState,
    showInstallPrompt,
    isOnline,
    storage: managers?.storage || new PWAStorage(),
    enhancedStorage: managers?.enhancedStorage || new EnhancedPWAStorage(),
    isServiceWorkerSupported,
    isPWACapable
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA(): PWAContextType {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}

// Custom hook for PWA install functionality
export function usePWAInstall() {
  const { installState, showInstallPrompt, isServiceWorkerSupported } = usePWA();
  
  return {
    canInstall: installState.isInstallable && !installState.isInstalled,
    isInstalled: installState.isInstalled,
    install: showInstallPrompt,
    isSupported: isServiceWorkerSupported
  };
}

// Custom hook for offline functionality
export function useOfflineStatus() {
  const { isOnline } = usePWA();
  
  return {
    isOnline,
    isOffline: !isOnline
  };
}