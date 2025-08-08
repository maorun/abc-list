import React, {useState} from "react";
import {
  MultiColumnListData,
  getMultiColumnStorageKey,
  WordWithExplanation,
} from "./types";
import {Button} from "../ui/button";
import {toast} from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface MultiColumnExportedData {
  name: string;
  version: number;
  exportDate: string;
  type: "multi-column";
  listData: MultiColumnListData;
  words: Record<string, Record<string, WordWithExplanation[]>>; // columnId -> letter -> words
}

interface MultiColumnExportProps {
  listData: MultiColumnListData;
}

export function MultiColumnExport({listData}: MultiColumnExportProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportedData, setExportedData] = useState("");
  const [importData, setImportData] = useState("");

  const alphabet = Array.from({length: 26}, (_, i) =>
    String.fromCharCode(97 + i),
  );

  const exportList = () => {
    const exportData: MultiColumnExportedData = {
      name: listData.name,
      version: 1,
      exportDate: new Date().toISOString(),
      type: "multi-column",
      listData: listData,
      words: {},
    };

    // Export words for each column and letter
    listData.columns.forEach((column) => {
      exportData.words[column.id] = {};

      alphabet.forEach((letter) => {
        const storageKey = getMultiColumnStorageKey(
          listData.name,
          column.id,
          letter,
        );
        const storedData = localStorage.getItem(storageKey);

        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            exportData.words[column.id][letter] = parsed;
          } else {
            exportData.words[column.id][letter] = [];
          }
        } else {
          exportData.words[column.id][letter] = [];
        }
      });
    });

    const jsonString = JSON.stringify(exportData, null, 2);
    setExportedData(jsonString);
    setShowExportModal(true);
  };

  const importList = () => {
    try {
      const parsedData: MultiColumnExportedData = JSON.parse(importData);

      if (
        !parsedData.name ||
        !parsedData.words ||
        parsedData.type !== "multi-column"
      ) {
        toast.error(
          "Ungültige Datei-Struktur. Bitte überprüfen Sie das JSON-Format für mehrspaltige Listen.",
        );
        return;
      }

      // Import words for each column
      let importedCount = 0;

      Object.entries(parsedData.words).forEach(([columnId, columnWords]) => {
        const targetColumn = listData.columns.find(
          (col) => col.id === columnId,
        );
        if (!targetColumn) return;

        Object.entries(columnWords).forEach(([letter, words]) => {
          const storageKey = getMultiColumnStorageKey(
            listData.name,
            columnId,
            letter,
          );
          const existingData = localStorage.getItem(storageKey);
          const existingWords: WordWithExplanation[] = existingData
            ? JSON.parse(existingData)
            : [];
          const existingTexts = existingWords.map((w) => w.text);

          const newWords = words.filter(
            (word) => !existingTexts.includes(word.text),
          );

          if (newWords.length > 0) {
            const mergedWords = [
              ...existingWords,
              ...newWords.map((word) => ({
                ...word,
                imported: true,
                timestamp: Date.now(),
              })),
            ];
            localStorage.setItem(storageKey, JSON.stringify(mergedWords));
            importedCount += newWords.length;
          }
        });
      });

      setShowImportModal(false);
      setImportData("");

      if (importedCount > 0) {
        toast.success(`${importedCount} neue Wörter erfolgreich importiert!`);
        window.location.reload(); // Refresh to show imported data
      } else {
        toast.info("Keine neuen Wörter zum Importieren gefunden.");
      }
    } catch {
      toast.error(
        "Fehler beim Lesen der Datei. Bitte überprüfen Sie das JSON-Format.",
      );
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(exportedData)
      .then(() => {
        toast.success("Export-Daten in die Zwischenablage kopiert!");
      })
      .catch(() => {
        toast.error(
          "Fehler beim Kopieren in die Zwischenablage. Bitte prüfen Sie die Berechtigungen oder versuchen Sie es erneut.",
        );
      });
  };

  const downloadAsFile = () => {
    const blob = new Blob([exportedData], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `multi-abc-liste-${listData.name}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={exportList}
          variant="outline"
          className="bg-green-50 hover:bg-green-100"
        >
          📤 Exportieren
        </Button>
        <Button
          onClick={() => setShowImportModal(true)}
          variant="outline"
          className="bg-blue-50 hover:bg-blue-100"
        >
          📥 Importieren
        </Button>
      </div>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mehrspaltige Liste exportieren</DialogTitle>
            <DialogDescription>
              Exportieren Sie Ihre mehrspaltige ABC-Liste mit allen Spalten,
              Konfigurationen und Wörtern.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-semibold text-yellow-800 mb-2">
                📋 Export-Details
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>
                  • Alle {listData.columns.length} Spalten mit Konfiguration
                </li>
                <li>• Zeitlimits und Spezialgebiet-Markierungen</li>
                <li>• Alle Wörter mit Erklärungen</li>
                <li>• Kompatibel mit mehrspaltigem Import</li>
              </ul>
            </div>

            <textarea
              value={exportedData}
              readOnly
              className="w-full h-32 p-2 border rounded text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Export-Daten"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              onClick={copyToClipboard}
              className="bg-blue-500 hover:bg-blue-700"
            >
              📋 Kopieren
            </Button>
            <Button
              onClick={downloadAsFile}
              className="bg-green-500 hover:bg-green-700"
            >
              💾 Download
            </Button>
            <Button onClick={() => setShowExportModal(false)} variant="outline">
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mehrspaltige Liste importieren</DialogTitle>
            <DialogDescription>
              Importieren Sie eine exportierte mehrspaltige ABC-Liste. Nur
              passende Spalten werden importiert.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-semibold text-yellow-800 mb-2">
                ⚠️ Import-Hinweise
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Nur Wörter für existierende Spalten werden importiert</li>
                <li>• Doppelte Wörter werden übersprungen</li>
                <li>• Importierte Wörter werden entsprechend markiert</li>
                <li>• Die Spalten-Konfiguration wird nicht überschrieben</li>
              </ul>
            </div>

            <div>
              <label
                htmlFor="import-data"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                JSON-Daten einer exportierten mehrspaltige ABC-Liste:
              </label>
              <textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="JSON-Daten hier einfügen..."
                className="w-full h-32 p-2 border rounded text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Import-Daten eingeben"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              onClick={importList}
              disabled={!importData.trim()}
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300"
            >
              📥 Importieren
            </Button>
            <Button onClick={() => setShowImportModal(false)} variant="outline">
              Abbrechen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
