import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {toast} from "sonner";
import {usePrompt} from "@/components/ui/prompt-dialog";
import {Letter} from "./Letter";
import {WordWithExplanation} from "./SavedWord";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ExportedList {
  name: string;
  version: number;
  exportDate: string;
  words: Record<string, WordWithExplanation[]>;
}

export function ListItem() {
  const {item} = useParams<{item: string}>();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState("");
  const [exportedData, setExportedData] = useState("");
  const {prompt, PromptComponent} = usePrompt();

  useEffect(() => {
    if (item) {
      document.title = `ABC-Liste für ${item}`;
    }
  }, [item]);

  const getCacheKey = (): string => {
    return "abcList-" + item;
  };

  const alphabet = Array.from({length: 26}, (_, i) =>
    String.fromCharCode(97 + i),
  );

  const exportList = () => {
    const exportData: ExportedList = {
      name: item || "Unbekannt",
      version: 1,
      exportDate: new Date().toISOString(),
      words: {},
    };

    alphabet.forEach((letter) => {
      const storageKey = `${getCacheKey()}:${letter}`;
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        // Ensure we have the new format
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof parsed[0] === "string") {
            exportData.words[letter] = parsed.map((word: string) => ({
              text: word,
              explanation: "",
              version: 1,
              imported: false,
            }));
          } else {
            exportData.words[letter] = parsed;
          }
        } else {
          exportData.words[letter] = [];
        }
      } else {
        exportData.words[letter] = [];
      }
    });

    const jsonString = JSON.stringify(exportData, null, 2);
    setExportedData(jsonString);
    setShowExportModal(true);
  };

  const importList = () => {
    try {
      const parsedData: ExportedList = JSON.parse(importData);

      if (!parsedData.name || !parsedData.words) {
        toast.error(
          "Ungültige Datei-Struktur. Bitte überprüfen Sie das JSON-Format.",
        );
        return;
      }

      // Show import preview and require explanations for imported terms
      setShowImportModal(false);
      showImportPreview(parsedData);
    } catch {
      toast.error(
        "Fehler beim Lesen der Datei. Bitte überprüfen Sie das JSON-Format.",
      );
    }
  };

  const showImportPreview = (data: ExportedList) => {
    const newTerms: Array<{letter: string; word: WordWithExplanation}> = [];

    alphabet.forEach((letter) => {
      const existingStorageKey = `${getCacheKey()}:${letter}`;
      const existingData = localStorage.getItem(existingStorageKey);
      const existingWords = existingData ? JSON.parse(existingData) : [];
      const existingTexts = existingWords.map(
        (w: WordWithExplanation) => w.text,
      );

      if (data.words[letter]) {
        data.words[letter].forEach((word) => {
          if (!existingTexts.includes(word.text)) {
            newTerms.push({
              letter,
              word: {
                ...word,
                imported: true,
                explanation: "", // Reset explanation to require new one
              },
            });
          }
        });
      }
    });

    if (newTerms.length === 0) {
      toast.info("Keine neuen Begriffe zum Importieren gefunden.");
      return;
    }

    // Create import wizard
    showImportWizard(newTerms);
  };

  const showImportWizard = async (
    terms: Array<{letter: string; word: WordWithExplanation}>,
  ) => {
    if (terms.length === 0) {
      toast.success("Import abgeschlossen!");
      return;
    }

    const currentTerm = terms[0];
    const remainingTerms = terms.slice(1);

    const explanation = await prompt(
      `Begriff erklären: "${currentTerm.word.text}"`,
      `Erklären Sie den Begriff "${currentTerm.word.text}" (${currentTerm.letter.toUpperCase()})\n\nHinweis: Sie müssen jeden importierten Begriff erklären können.\nVerbleibende Begriffe: ${terms.length}`,
      "Ihre Erklärung hier eingeben...",
    );

    if (explanation === null) {
      // User cancelled
      return;
    }

    if (explanation.trim() === "") {
      toast.error(
        "Eine Erklärung ist erforderlich. Bitte versuchen Sie es erneut.",
      );
      showImportWizard(terms);
      return;
    }

    // Save the term with explanation
    const storageKey = `${getCacheKey()}:${currentTerm.letter}`;
    const existingData = localStorage.getItem(storageKey);
    const existingWords = existingData ? JSON.parse(existingData) : [];

    const newWord: WordWithExplanation = {
      ...currentTerm.word,
      explanation: explanation.trim(),
      imported: true,
      version: 1,
    };

    const updatedWords = [...existingWords, newWord];
    localStorage.setItem(storageKey, JSON.stringify(updatedWords));

    // Continue with remaining terms
    setTimeout(() => showImportWizard(remainingTerms), 100);
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
    a.download = `abc-liste-${item}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">ABC-Liste für {item}</h1>
        <div className="flex gap-2">
          <button
            onClick={exportList}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            title="Liste exportieren und teilen"
            aria-label="ABC-Liste als JSON exportieren"
          >
            📤 Exportieren
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Begriffe aus anderer Liste importieren"
            aria-label="Begriffe aus exportierter ABC-Liste importieren"
          >
            📥 Importieren
          </button>
        </div>
      </div>

      <div className="flex flex-row flex-wrap justify-around gap-4">
        {alphabet.map((char) => (
          <div key={char} className="m-2">
            <Letter letter={char} cacheKey={getCacheKey()} />
          </div>
        ))}
      </div>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Liste exportieren</DialogTitle>
            <DialogDescription>
              Kopieren Sie die JSON-Daten oder laden Sie sie als Datei herunter,
              um Ihre ABC-Liste zu teilen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <textarea
              value={exportedData}
              readOnly
              className="w-full h-32 p-2 border rounded text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Export-Daten"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Export-Daten in Zwischenablage kopieren"
            >
              📋 Kopieren
            </button>
            <button
              onClick={downloadAsFile}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Export-Daten als Datei herunterladen"
            >
              💾 Download
            </button>
            <button
              onClick={() => setShowExportModal(false)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Export-Dialog schließen"
            >
              Schließen
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Begriffe importieren</DialogTitle>
            <DialogDescription>
              Fügen Sie JSON-Daten einer exportierten ABC-Liste ein. Sie werden
              aufgefordert, jeden neuen Begriff zu erklären.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-semibold text-yellow-800 mb-2">
                ⚠️ Wichtiger Hinweis
              </h3>
              <p className="text-sm text-yellow-700">
                Beim Import werden Sie aufgefordert, jeden neuen Begriff zu
                erklären. Dies entspricht dem ABC Kumulativ-Ansatz von Vera F.
                Birkenbihl - Sie müssen jeden übernommenen Begriff verstehen und
                erklären können.
              </p>
            </div>

            <div>
              <label
                htmlFor="import-data"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                JSON-Daten einer exportierten ABC-Liste:
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
            <button
              onClick={importList}
              disabled={!importData.trim()}
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Import starten"
            >
              📥 Importieren
            </button>
            <button
              onClick={() => setShowImportModal(false)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Import-Dialog schließen"
            >
              Abbrechen
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PromptComponent />
    </div>
  );
}
