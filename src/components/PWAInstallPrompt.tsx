import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../contexts/PWAContext';
import { Button } from './ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';

// Extract handler functions outside component to prevent recreation
const handleInstallAction = (
  install: () => Promise<boolean>,
  setIsInstalling: (installing: boolean) => void,
  setShowDialog: (show: boolean) => void
) => async () => {
  setIsInstalling(true);
  try {
    const installed = await install();
    if (installed) {
      setShowDialog(false);
    }
  } catch (error) {
    console.error('PWA installation failed:', error);
  } finally {
    setIsInstalling(false);
  }
};

const handleDialogOpenAction = (setShowDialog: (show: boolean) => void) => () => {
  setShowDialog(true);
};

const handleDialogCloseAction = (setShowDialog: (show: boolean) => void) => () => {
  setShowDialog(false);
};

export function PWAInstallPrompt() {
  const { canInstall, isInstalled, install, isSupported } = usePWAInstall();
  const [showDialog, setShowDialog] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Don't show if PWA is not supported or already installed
  if (!isSupported || isInstalled || !canInstall) {
    return null;
  }

  // Create stable handler references
  const handleInstall = handleInstallAction(install, setIsInstalling, setShowDialog);
  const handleDialogOpen = handleDialogOpenAction(setShowDialog);
  const handleDialogClose = handleDialogCloseAction(setShowDialog);

  return (
    <>
      {/* Floating install button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleDialogOpen}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full p-3"
          aria-label="App installieren"
        >
          <Download className="h-5 w-5" />
        </Button>
      </div>

      {/* Install dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              App installieren
            </DialogTitle>
            <DialogDescription>
              Installiere die ABC-List App auf deinem Gerät für eine bessere Erfahrung und Offline-Nutzung.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-slate-600">
              <h4 className="font-medium mb-2">Vorteile der Installation:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Offline-Funktionalität</li>
                <li>Schnellerer App-Start</li>
                <li>Lernreminder-Benachrichtigungen</li>
                <li>Vollbild-Erfahrung ohne Browser</li>
              </ul>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleDialogClose}
                disabled={isInstalling}
              >
                Später
              </Button>
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isInstalling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Installiere...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Installieren
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Inline install banner for specific pages
export function PWAInstallBanner() {
  const { canInstall, isInstalled, install, isSupported } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Don't show if PWA is not supported, already installed, or dismissed
  if (!isSupported || isInstalled || !canInstall || isDismissed) {
    return null;
  }

  // Create stable handler references
  const handleInstall = handleInstallAction(install, setIsInstalling, () => {});
  const handleDismiss = () => setIsDismissed(true);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Smartphone className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              ABC-List App installieren
            </h3>
            <p className="text-xs text-blue-700 mt-1">
              Für Offline-Nutzung und bessere Performance
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-700"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleInstall}
            disabled={isInstalling}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isInstalling ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                ...
              </>
            ) : (
              <>
                <Download className="h-3 w-3 mr-1" />
                Installieren
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}