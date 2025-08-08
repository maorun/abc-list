import React, {useState} from "react";
import {ColumnConfig} from "./types";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {toast} from "sonner";

interface ColumnConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  onSave: (columns: ColumnConfig[]) => void;
}

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
];

export function ColumnConfigDialog({
  isOpen,
  onClose,
  columns,
  onSave,
}: ColumnConfigDialogProps) {
  const [editedColumns, setEditedColumns] = useState<ColumnConfig[]>(columns);

  const handleSave = () => {
    if (editedColumns.length === 0) {
      toast.error("Mindestens eine Spalte ist erforderlich.");
      return;
    }

    if (editedColumns.some((col) => !col.theme.trim())) {
      toast.error("Alle Spalten müssen ein Thema haben.");
      return;
    }

    // Ensure at most one specialty column
    const specialtyColumns = editedColumns.filter((col) => col.isSpecialty);
    if (specialtyColumns.length > 1) {
      toast.error("Nur eine Spalte kann als Spezialgebiet markiert werden.");
      return;
    }

    onSave(editedColumns);
    onClose();
  };

  const addColumn = () => {
    if (editedColumns.length >= 5) {
      toast.error("Maximal 5 Spalten sind erlaubt.");
      return;
    }

    const newColumn: ColumnConfig = {
      id: `column-${Date.now()}`,
      theme: `Thema ${editedColumns.length + 1}`,
      color: PRESET_COLORS[editedColumns.length % PRESET_COLORS.length],
    };

    setEditedColumns([...editedColumns, newColumn]);
  };

  const removeColumn = (index: number) => {
    if (editedColumns.length <= 1) {
      toast.error("Mindestens eine Spalte ist erforderlich.");
      return;
    }

    setEditedColumns(editedColumns.filter((_, i) => i !== index));
  };

  const updateColumn = (index: number, updates: Partial<ColumnConfig>) => {
    const newColumns = editedColumns.map((col, i) =>
      i === index ? {...col, ...updates} : col,
    );
    setEditedColumns(newColumns);
  };

  const toggleSpecialty = (index: number) => {
    const newColumns = editedColumns.map((col, i) => ({
      ...col,
      isSpecialty: i === index ? !col.isSpecialty : false, // Only one specialty column allowed
    }));
    setEditedColumns(newColumns);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Spalten konfigurieren</DialogTitle>
          <DialogDescription>
            Konfigurieren Sie bis zu 5 Spalten mit verschiedenen Themen und
            Zeitlimits. Eine Spalte kann als Spezialgebiet für Prognosen
            markiert werden.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {editedColumns.map((column, index) => (
            <div
              key={column.id}
              className="p-4 border rounded"
              style={{borderColor: column.color}}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{backgroundColor: column.color}}
                />
                <h3 className="font-semibold">Spalte {index + 1}</h3>
                {editedColumns.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeColumn(index)}
                    className="ml-auto"
                  >
                    Entfernen
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor={`theme-${column.id}`}
                    className="block text-sm font-medium mb-1"
                  >
                    Thema:
                  </label>
                  <Input
                    id={`theme-${column.id}`}
                    value={column.theme}
                    onChange={(e) =>
                      updateColumn(index, {theme: e.target.value})
                    }
                    placeholder="z.B. Allgemeines Thema, Spezialgebiet"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`timeLimit-${column.id}`}
                    className="block text-sm font-medium mb-1"
                  >
                    Zeitlimit (Minuten):
                  </label>
                  <Input
                    id={`timeLimit-${column.id}`}
                    type="number"
                    min="1"
                    max="60"
                    value={column.timeLimit || ""}
                    onChange={(e) =>
                      updateColumn(index, {
                        timeLimit: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <span className="block text-sm font-medium mb-1">Farbe:</span>
                  <div className="flex gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          column.color === color
                            ? "border-gray-800"
                            : "border-gray-300"
                        }`}
                        style={{backgroundColor: color}}
                        onClick={() => updateColumn(index, {color})}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={column.isSpecialty || false}
                      onChange={() => toggleSpecialty(index)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      🎯 Spezialgebiet (mit Prognose)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}

          {editedColumns.length < 5 && (
            <Button variant="outline" onClick={addColumn} className="w-full">
              + Spalte hinzufügen
            </Button>
          )}
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Tipps</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Spalte 1-2: Allgemeine Themen</li>
            <li>
              • Spalte 3-5: Spezialgebiete (eine kann für Prognosen markiert
              werden)
            </li>
            <li>• Zeitlimits helfen bei fokussiertem Arbeiten</li>
            <li>• Verschiedene Farben erleichtern die Unterscheidung</li>
          </ul>
        </div>

        <DialogFooter className="flex gap-2">
          <Button onClick={handleSave}>Speichern</Button>
          <Button onClick={onClose} variant="outline">
            Abbrechen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
