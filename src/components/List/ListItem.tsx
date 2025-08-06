import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Letter} from "./Letter";
import {WordWithExplanation} from "./SavedWord";

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
        alert(
          "Ungültige Datei-Struktur. Bitte überprüfen Sie das JSON-Format.",
        );
        return;
      }

      // Show import preview and require explanations for imported terms
      setShowImportModal(false);
      showImportPreview(parsedData);
    } catch {
      alert(
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
      alert("Keine neuen Begriffe zum Importieren gefunden.");
      return;
    }

    // Create import wizard
    showImportWizard(newTerms);
  };

  const showImportWizard = (
    terms: Array<{letter: string; word: WordWithExplanation}>,
  ) => {
    if (terms.length === 0) {
      alert("Import abgeschlossen!");
      return;
    }

    const currentTerm = terms[0];
    const remainingTerms = terms.slice(1);

    const explanation = prompt(
      `Erklären Sie den Begriff "${currentTerm.word.text}" (${currentTerm.letter.toUpperCase()}):\n\n` +
        `Hinweis: Sie müssen jeden importierten Begriff erklären können.\n` +
        `Verbleibende Begriffe: ${terms.length}`,
    );

    if (explanation === null) {
      // User cancelled
      return;
    }

    if (explanation.trim() === "") {
      alert("Eine Erklärung ist erforderlich. Bitte versuchen Sie es erneut.");
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
    navigator.clipboard.writeText(exportedData).then(() => {
      alert("Export-Daten in die Zwischenablage kopiert!");
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
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-1"
            title="Liste exportieren und teilen"
          >
            📤 Exportieren
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-1"
            title="Begriffe aus anderer Liste importieren"
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
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Liste exportieren</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Kopieren Sie die folgenden Daten oder laden Sie sie als Datei
              herunter, um Ihre ABC-Liste zu teilen:
            </p>

            <textarea
              value={exportedData}
              readOnly
              className="w-full h-32 p-2 border rounded text-xs font-mono"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={copyToClipboard}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                📋 Kopieren
              </button>
              <button
                onClick={downloadAsFile}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                💾 Download
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Begriffe importieren</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
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

            <p className="text-sm text-gray-600 mb-4">
              Fügen Sie hier die JSON-Daten einer exportierten ABC-Liste ein:
            </p>

            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="JSON-Daten hier einfügen..."
              className="w-full h-32 p-2 border rounded text-xs font-mono"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={importList}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={!importData.trim()}
              >
                📥 Importieren
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
