import React, {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {useAccessibility} from "@/contexts/AccessibilityContext";
import {
  Eye,
  EyeOff,
  Plus,
  Minus,
  Settings,
  Keyboard,
  GripVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Extracted drag helper functions following function extraction pattern
const clampPosition = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const getMousePosition = (e: MouseEvent): {x: number; y: number} => {
  return {
    x: e.clientX,
    y: e.clientY,
  };
};

const getTouchPosition = (e: TouchEvent): {x: number; y: number} => {
  const touch = e.touches[0];
  return {
    x: touch.clientX,
    y: touch.clientY,
  };
};

const handleMouseDownAction =
  (
    setIsDragging: (dragging: boolean) => void,
    setDragStart: (pos: {
      x: number;
      y: number;
      toolbarX: number;
      toolbarY: number;
    }) => void,
    toolbarPosition: {x: number; y: number},
  ) =>
  (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const mousePos = getMousePosition(e.nativeEvent);
    setDragStart({
      x: mousePos.x,
      y: mousePos.y,
      toolbarX: toolbarPosition.x,
      toolbarY: toolbarPosition.y,
    });
  };

const handleTouchStartAction =
  (
    setIsDragging: (dragging: boolean) => void,
    setDragStart: (pos: {
      x: number;
      y: number;
      toolbarX: number;
      toolbarY: number;
    }) => void,
    toolbarPosition: {x: number; y: number},
  ) =>
  (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const touchPos = getTouchPosition(e.nativeEvent);
    setDragStart({
      x: touchPos.x,
      y: touchPos.y,
      toolbarX: toolbarPosition.x,
      toolbarY: toolbarPosition.y,
    });
  };

const createMouseMoveHandler =
  (
    isDragging: boolean,
    dragStart: {
      x: number;
      y: number;
      toolbarX: number;
      toolbarY: number;
    } | null,
    updateToolbarPosition: (x: number, y: number) => void,
  ) =>
  (e: MouseEvent) => {
    if (!isDragging || !dragStart) return;

    const mousePos = getMousePosition(e);
    const deltaX = mousePos.x - dragStart.x;
    const deltaY = mousePos.y - dragStart.y;

    // Calculate new position from bottom-right
    const newX = clampPosition(
      dragStart.toolbarX - deltaX,
      16,
      window.innerWidth - 200,
    );
    const newY = clampPosition(
      dragStart.toolbarY + deltaY,
      16,
      window.innerHeight - 300,
    );

    updateToolbarPosition(newX, newY);
  };

const createTouchMoveHandler =
  (
    isDragging: boolean,
    dragStart: {
      x: number;
      y: number;
      toolbarX: number;
      toolbarY: number;
    } | null,
    updateToolbarPosition: (x: number, y: number) => void,
  ) =>
  (e: TouchEvent) => {
    if (!isDragging || !dragStart) return;

    e.preventDefault();
    const touchPos = getTouchPosition(e);
    const deltaX = touchPos.x - dragStart.x;
    const deltaY = touchPos.y - dragStart.y;

    // Calculate new position from bottom-right
    const newX = clampPosition(
      dragStart.toolbarX - deltaX,
      16,
      window.innerWidth - 200,
    );
    const newY = clampPosition(
      dragStart.toolbarY + deltaY,
      16,
      window.innerHeight - 300,
    );

    updateToolbarPosition(newX, newY);
  };

const createEndDragHandler =
  (
    setIsDragging: (dragging: boolean) => void,
    setDragStart: (pos: null) => void,
  ) =>
  () => {
    setIsDragging(false);
    setDragStart(null);
  };

export function AccessibilityToolbar() {
  const {
    settings,
    toggleHighContrast,
    increaseFontSize,
    decreaseFontSize,
    updateToolbarPosition,
  } = useAccessibility();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
    toolbarX: number;
    toolbarY: number;
  } | null>(null);

  // Create stable event handlers using extracted functions
  const handleMouseDown = handleMouseDownAction(
    setIsDragging,
    setDragStart,
    settings.toolbarPosition,
  );
  const handleTouchStart = handleTouchStartAction(
    setIsDragging,
    setDragStart,
    settings.toolbarPosition,
  );
  const endDrag = createEndDragHandler(setIsDragging, setDragStart);

  // Set up global event listeners for drag operations
  useEffect(() => {
    const handleMouseMove = createMouseMoveHandler(
      isDragging,
      dragStart,
      updateToolbarPosition,
    );
    const handleTouchMove = createTouchMoveHandler(
      isDragging,
      dragStart,
      updateToolbarPosition,
    );

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", endDrag);
      document.addEventListener("touchmove", handleTouchMove, {passive: false});
      document.addEventListener("touchend", endDrag);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", endDrag);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", endDrag);
      };
    }

    // Return undefined when not dragging (satisfies all code paths return value)
    return undefined;
  }, [isDragging, dragStart, updateToolbarPosition, endDrag]);

  // Calculate position styles
  const toolbarStyle = {
    position: "fixed" as const,
    right: `${settings.toolbarPosition.x}px`,
    bottom: `${settings.toolbarPosition.y}px`,
    zIndex: 50,
    cursor: isDragging ? "grabbing" : "grab",
    userSelect: "none" as const,
    touchAction: "none",
  };

  return (
    <div
      style={toolbarStyle}
      className="bg-card border border-border rounded-lg shadow-lg p-2"
      role="toolbar"
      aria-label="Barrierefreiheit-Einstellungen"
    >
      <div className="flex flex-col gap-2">
        {/* Drag handle */}
        <button
          type="button"
          className="flex justify-center cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded border-none bg-transparent"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          aria-label="Toolbar verschieben"
          title="Ziehen zum Verschieben"
        >
          <GripVertical className="h-3 w-3 text-gray-400" />
        </button>
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
