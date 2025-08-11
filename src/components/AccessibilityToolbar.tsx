import React from "react";
import {Button} from "@/components/ui/button";
import {useAccessibility} from "@/contexts/AccessibilityContext";
import {Eye, EyeOff, Plus, Minus, Settings, Keyboard} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AccessibilityToolbar() {
  const {settings, toggleHighContrast, increaseFontSize, decreaseFontSize} =
    useAccessibility();

  return (
    <div
      className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-lg shadow-lg p-2"
      role="toolbar"
      aria-label="Barrierefreiheit-Einstellungen"
    >
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleHighContrast}
          aria-label={
            settings.highContrast
              ? "Hohen Kontrast deaktivieren"
              : "Hohen Kontrast aktivieren"
          }
          aria-pressed={settings.highContrast}
          title={
            settings.highContrast
              ? "Hohen Kontrast deaktivieren"
              : "Hohen Kontrast aktivieren"
          }
        >
          {settings.highContrast ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={increaseFontSize}
          aria-label="Schriftgröße vergrößern"
          title="Schriftgröße vergrößern"
          disabled={settings.fontSize === "large"}
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={decreaseFontSize}
          aria-label="Schriftgröße verkleinern"
          title="Schriftgröße verkleinern"
          disabled={settings.fontSize === "small"}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              aria-label="Barrierefreiheit-Einstellungen öffnen"
              title="Barrierefreiheit-Einstellungen"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-md"
            aria-describedby="accessibility-settings-description"
          >
            <DialogHeader>
              <DialogTitle>Barrierefreiheit-Einstellungen</DialogTitle>
            </DialogHeader>
            <div id="accessibility-settings-description" className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Aktueller Status:</h3>
                <ul className="text-sm space-y-1">
                  <li>
                    Hoher Kontrast:{" "}
                    <span className="font-medium">
                      {settings.highContrast ? "Aktiviert" : "Deaktiviert"}
                    </span>
                  </li>
                  <li>
                    Schriftgröße:{" "}
                    <span className="font-medium">
                      {getFontSizeLabel(settings.fontSize)}
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Tastaturkürzel:</h3>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-3 w-3" />
                    <span>Alt + K: Hoher Kontrast umschalten</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-3 w-3" />
                    <span>Alt + Plus: Schrift vergrößern</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-3 w-3" />
                    <span>Alt + Minus: Schrift verkleinern</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-3 w-3" />
                    <span>Tab: Navigation durch Elemente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-3 w-3" />
                    <span>Enter/Space: Element aktivieren</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function getFontSizeLabel(fontSize: "small" | "medium" | "large"): string {
  switch (fontSize) {
    case "small":
      return "Klein";
    case "medium":
      return "Normal";
    case "large":
      return "Groß";
    default:
      return "Normal";
  }
}
