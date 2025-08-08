import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {toast} from "sonner";
import {usePrompt} from "@/components/ui/prompt-dialog";
import {Letter} from "./Letter";
import {WordWithExplanation} from "./SavedWord";
import {ExportUtils, ExportedList} from "@/lib/exportUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function ListItem() {
  const {item} = useParams<{item: string}>();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState("");
  const [exportedData, setExportedData] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const {prompt, PromptComponent} = usePrompt();

  useEffect(() => {
    if (item) {
      document.title = `ABC-Liste für ${item}`;
    }
  }, [item]);

  const alphabet = Array.from({length: 26}, (_, i) =>
    String.fromCharCode(97 + i),
  );

  const cacheKey = React.useMemo(() => "abcList-" + item, [item]);

  const getWordsData = (): Record<string, WordWithExplanation[]> => {
    const words: Record<string, WordWithExplanation[]> = {};

    alphabet.forEach((letter) => {
      const storageKey = `${cacheKey}:${letter}`;
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        // Ensure we have the new format
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof parsed[0] === "string") {
            words[letter] = parsed.map((word: string) => ({
              text: word,
              explanation: "",
              version: 1,
              imported: false,
            }));
          } else {
            words[letter] = parsed;
          }
        } else {
          words[letter] = [];
        }
      } else {
        words[letter] = [];
      }
    });

    return words;
  };

  const exportAsJSON = () => {
    const exportData: ExportedList = {
      name: item || "Unbekannt",
      version: 1,
      exportDate: new Date().toISOString(),
      words: getWordsData(),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    setExportedData(jsonString);
    setShowExportModal(true);
  };

  const exportAsPDF = () => {
    const words = getWordsData();
    ExportUtils.exportToPDF(item || "Unbekannt", words);
    toast.success("PDF-Export erfolgreich heruntergeladen!");
  };

  const exportAsCSV = () => {
    const words = getWordsData();
    ExportUtils.exportToCSV(item || "Unbekannt", words);
    toast.success("CSV-Export erfolgreich heruntergeladen!");
  };

  const exportAsMarkdown = () => {
    const words = getWordsData();
    ExportUtils.exportToMarkdown(item || "Unbekannt", words);
    toast.success("Markdown-Export erfolgreich heruntergeladen!");
  };

  const importFromJSON = () => {
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

  const importFromCSV = async () => {
    if (!selectedFile) {
      toast.error("Bitte wählen Sie eine CSV-Datei aus.");
      return;
    }

    try {
      const csvRows = await ExportUtils.parseCSVFile(selectedFile);
      const listName = selectedFile.name.replace(/\.(csv|xlsx?)$/i, "");
      const exportedList = ExportUtils.csvToExportedList(csvRows, listName);

      setShowImportModal(false);
      showImportPreview(exportedList);
      setSelectedFile(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Fehler beim Lesen der CSV-Datei",
      );
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (
        fileExtension === "csv" ||
        fileExtension === "xlsx" ||
        fileExtension === "xls"
      ) {
        setSelectedFile(file);
        setImportData(""); // Clear JSON data when file is selected
      } else {
        toast.error("Bitte wählen Sie eine CSV- oder Excel-Datei aus.");
        event.target.value = "";
      }
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <h1 className="text-3xl font-bold mb-2 md:mb-0">
          ABC-Liste für {item}
        </h1>
        <div className="flex gap-2 flex-wrap">
          <div className="relative group">
            <button
              onClick={exportAsJSON}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              title="Als JSON exportieren"
              aria-label="ABC-Liste als JSON exportieren"
            >
              📤 JSON
            </button>
          </div>
          <button
            onClick={exportAsPDF}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            title="Als PDF exportieren"
            aria-label="ABC-Liste als PDF exportieren"
          >
            📄 PDF
          </button>
          <button
            onClick={exportAsCSV}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            title="Als CSV exportieren"
            aria-label="ABC-Liste als CSV exportieren"
          >
            📊 CSV
          </button>
          <button
            onClick={exportAsMarkdown}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            title="Als Markdown exportieren"
            aria-label="ABC-Liste als Markdown exportieren"
          >
            📝 MD
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Begriffe importieren"
            aria-label="Begriffe aus verschiedenen Formaten importieren"
          >
            📥 Import
          </button>
        </div>
      </div>

      <div className="flex flex-row flex-wrap justify-around gap-4">
        {alphabet.map((char) => (
          <div key={char} className="m-2">
            <Letter letter={char} cacheKey={cacheKey} />
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
              Importieren Sie Begriffe aus JSON-Daten oder CSV/Excel-Dateien.
              Sie werden aufgefordert, jeden neuen Begriff zu erklären.
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

            {/* File Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">
                📁 Datei hochladen (CSV/Excel)
              </h4>
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <p className="text-sm text-green-600">
                    ✓ Datei ausgewählt: {selectedFile.name}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Unterstützte Formate: CSV, Excel (.xlsx, .xls)
                  <br />
                  Erwartete Spalten: Letter, Word, Explanation (optional)
                </p>
              </div>
            </div>

            {/* JSON Input Section */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                📝 JSON-Daten einer exportierten ABC-Liste
              </h4>
              <textarea
                value={importData}
                onChange={(e) => {
                  setImportData(e.target.value);
                  if (e.target.value.trim()) {
                    setSelectedFile(null); // Clear file when JSON is entered
                  }
                }}
                placeholder="JSON-Daten hier einfügen..."
                className="w-full h-32 p-2 border rounded text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Import-Daten eingeben"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <button
              onClick={selectedFile ? importFromCSV : importFromJSON}
              disabled={!selectedFile && !importData.trim()}
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Import starten"
            >
              📥 {selectedFile ? "CSV/Excel importieren" : "JSON importieren"}
            </button>
            <button
              onClick={() => {
                setShowImportModal(false);
                setSelectedFile(null);
                setImportData("");
              }}
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
