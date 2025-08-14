import React, { useState } from "react";
import { LogIn, LogOut, Cloud, User, Settings, Shield } from "lucide-react";
import { useCloudAuth } from "../../contexts/CloudSyncContext";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";

// Extract handler functions outside component to prevent recreation
const handleSignInAction = (
  signInWithGoogle: () => Promise<{ user: any; error: Error | null }>,
  setIsSigningIn: (value: boolean) => void,
  clearError: () => void
) => async () => {
  try {
    setIsSigningIn(true);
    clearError();
    const result = await signInWithGoogle();
    
    if (result.error) {
      console.error("Sign in failed:", result.error);
    }
  } catch (error) {
    console.error("Sign in error:", error);
  } finally {
    setIsSigningIn(false);
  }
};

const handleSignOutAction = (
  signOut: () => Promise<{ error: Error | null }>,
  setIsSigningOut: (value: boolean) => void,
  clearError: () => void
) => async () => {
  try {
    setIsSigningOut(true);
    clearError();
    const result = await signOut();
    
    if (result.error) {
      console.error("Sign out failed:", result.error);
    }
  } catch (error) {
    console.error("Sign out error:", error);
  } finally {
    setIsSigningOut(false);
  }
};

const handleDialogCloseAction = (
  setShowDialog: (value: boolean) => void,
  clearError: () => void
) => () => {
  setShowDialog(false);
  clearError();
};

export function CloudAuthButton() {
  const { user, isAuthenticated, signInWithGoogle, signOut, lastError, clearError } = useCloudAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Create stable handler references
  const handleSignIn = handleSignInAction(signInWithGoogle, setIsSigningIn, clearError);
  const handleSignOut = handleSignOutAction(signOut, setIsSigningOut, clearError);
  const handleDialogClose = handleDialogCloseAction(setShowDialog, clearError);

  if (isAuthenticated && user) {
    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            aria-label={`Angemeldet als ${user.email}`}
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">
              {user.email?.split('@')[0] || 'Cloud'}
            </span>
            <Cloud className="h-3 w-3 text-green-600" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Cloud-Synchronisation
            </DialogTitle>
            <DialogDescription>
              Verwalten Sie Ihr Cloud-Sync Konto und Ihre Daten.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Cloud className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">
                  Angemeldet als {user.email}
                </p>
                <p className="text-sm text-green-700">
                  Ihre Daten werden automatisch synchronisiert.
                </p>
              </div>
            </div>

            {lastError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {lastError.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Navigate to sync settings
                  setShowDialog(false);
                  // This would open sync settings dialog
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Sync-Einstellungen
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Navigate to privacy settings
                  setShowDialog(false);
                  // This would open privacy settings dialog
                }}
              >
                <Shield className="h-4 w-4 mr-2" />
                Datenschutz-Einstellungen
              </Button>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleDialogClose}
              className="flex-1"
            >
              Schließen
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex-1"
            >
              {isSigningOut ? (
                <>
                  <LogOut className="h-4 w-4 mr-2 animate-spin" />
                  Abmelden...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Abmelden
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          aria-label="Cloud-Synchronisation einrichten"
        >
          <Cloud className="h-4 w-4" />
          <span className="hidden sm:inline">Cloud-Sync</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Cloud-Synchronisation
          </DialogTitle>
          <DialogDescription>
            Synchronisieren Sie Ihre ABC-Listen, KaWa und KaGa geräteübergreifend.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Vorteile der Cloud-Synchronisation:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Automatische Synchronisation zwischen Geräten</li>
              <li>• Sichere Backups in der Cloud</li>
              <li>• Konfliktauflösung bei gleichzeitigen Änderungen</li>
              <li>• Offline-Nutzung mit automatischer Sync bei Verbindung</li>
              <li>• DSGVO-konforme Datenspeicherung</li>
            </ul>
          </div>

          {lastError && (
            <Alert variant="destructive">
              <AlertDescription>
                {lastError.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <Shield className="h-4 w-4 inline mr-2" />
              Ihre Daten werden verschlüsselt übertragen und gespeichert. 
              Sie behalten die volle Kontrolle über Ihre Daten.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDialogClose}
            className="flex-1"
          >
            Später
          </Button>
          <Button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="flex-1"
          >
            {isSigningIn ? (
              <>
                <LogIn className="h-4 w-4 mr-2 animate-spin" />
                Anmelden...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Mit Google anmelden
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}