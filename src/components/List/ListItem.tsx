import React, {useState, useCallback, useEffect, useRef} from "react";
import {useParams, useNavigate} from "react-router-dom";
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
import {useGamification} from "@/hooks/useGamification";

// Extract alphabet generation outside component to prevent recreation
const alphabet = Array.from({length: 26}, (_, i) =>
  String.fromCharCode(97 + i),
);

// Extract utility functions outside component
const getCacheKey = (item: string | undefined): string | null => {
  return item ? `abcList-${item}` : null;
};

const setDocumentTitle = (item: string | undefined): void => {
  if (item) {
    document.title = `ABC-Liste für ${item}`;
  }
};

const getWordsData = (
  cacheKey: string,
): Record<string, WordWithExplanation[]> => {
  const words: Record<string, WordWithExplanation[]> = {};

  alphabet.forEach((letter) => {
    const storageKey = `${cacheKey}:${letter}`;
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
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
      } catch {
        words[letter] = [];
      }
    } else {
      words[letter] = [];
    }
  });

  return words;
};

const createExportData = (item: string, cacheKey: string): ExportedList => ({
  name: item || "Unbekannt",
  version: 1,
  exportDate: new Date().toISOString(),
  words: getWordsData(cacheKey),
});

const handleExportAsJSON = (
  item: string,
  cacheKey: string,
  setExportedData: (data: string) => void,
  setShowExportModal: (show: boolean) => void,
) => {
  const exportData = createExportData(item, cacheKey);
  const jsonString = JSON.stringify(exportData, null, 2);
  setExportedData(jsonString);
  setShowExportModal(true);
};

const handleExportAsPDF = (item: string, cacheKey: string) => {
  const words = getWordsData(cacheKey);
  ExportUtils.exportToPDF(item || "Unbekannt", words);
  toast.success("PDF-Export erfolgreich heruntergeladen!");
};

const handleExportAsCSV = (item: string, cacheKey: string) => {
  const words = getWordsData(cacheKey);
  ExportUtils.exportToCSV(item || "Unbekannt", words);
  toast.success("CSV-Export erfolgreich heruntergeladen!");
};

const handleExportAsMarkdown = (item: string, cacheKey: string) => {
  const words = getWordsData(cacheKey);
  ExportUtils.exportToMarkdown(item || "Unbekannt", words);
  toast.success("Markdown-Export erfolgreich heruntergeladen!");
};

const handleImportFromJSON = (
  importData: string,
  setShowImportModal: (show: boolean) => void,
  showImportPreview: (data: ExportedList) => void,
) => {
  try {
    const parsedData: ExportedList = JSON.parse(importData);

    if (!parsedData.name || !parsedData.words) {
      toast.error(
        "Ungültige Datei-Struktur. Bitte überprüfen Sie das JSON-Format.",
      );
      return;
    }

    setShowImportModal(false);
    showImportPreview(parsedData);
  } catch {
    toast.error(
      "Fehler beim Lesen der Datei. Bitte überprüfen Sie das JSON-Format.",
    );
  }
};

const handleImportFromCSV = async (
  selectedFile: File | null,
  setShowImportModal: (show: boolean) => void,
  showImportPreview: (data: ExportedList) => void,
  setSelectedFile: (file: File | null) => void,
) => {
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

const handleFileChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setSelectedFile: (file: File | null) => void,
  setImportData: (data: string) => void,
) => {
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

const handleCopyToClipboard = (exportedData: string) => {
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

const handleDownloadAsFile = (exportedData: string, item: string) => {
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

const createImportPreview = (
  data: ExportedList,
  cacheKey: string,
  showImportWizard: (
    terms: Array<{letter: string; word: WordWithExplanation}>,
  ) => void,
) => {
  const newTerms: Array<{letter: string; word: WordWithExplanation}> = [];

  alphabet.forEach((letter) => {
    const existingStorageKey = `${cacheKey}:${letter}`;
    const existingData = localStorage.getItem(existingStorageKey);
    const existingWords = existingData ? JSON.parse(existingData) : [];
    const existingTexts = existingWords.map((w: WordWithExplanation) => w.text);

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

  showImportWizard(newTerms);
};

const createImportWizard = async (
  terms: Array<{letter: string; word: WordWithExplanation}>,
  cacheKey: string,
  prompt: (
    title: string,
    description?: string,
    placeholder?: string,
  ) => Promise<string | null>,
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
    createImportWizard(terms, cacheKey, prompt);
    return;
  }

  // Save the term with explanation
  const storageKey = `${cacheKey}:${currentTerm.letter}`;
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
  setTimeout(() => createImportWizard(remainingTerms, cacheKey, prompt), 100);
};

// Extract handler action outside component
const handleBackToListsAction = (navigate: ReturnType<typeof useNavigate>) => {
  navigate("/");
};

// Timer utility function
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export function ListItem() {
  const {item} = useParams<{item: string}>();
  const navigate = useNavigate();
  const {trackWordAdded} = useGamification();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState("");
  const [exportedData, setExportedData] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const {prompt, PromptComponent} = usePrompt();

  // Timer state
  const [timeLeft, setTimeLeft] = useState(90); // Default 90 seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(90);
  const timerIntervalRef = useRef<number | null>(null);
  const timeUpNotifiedRef = useRef(false);

  // Create stable back navigation handler using useCallback
  const backToLists = useCallback(
    () => handleBackToListsAction(navigate),
    [navigate],
  );

  // Compute derived state directly instead of using useEffect
  const cacheKey = getCacheKey(item);

  // Set title directly without useEffect
  if (item) {
    setDocumentTitle(item);
  }

  const [allWords, setAllWords] = useState<
    Record<string, WordWithExplanation[]>
  >(() => (cacheKey ? getWordsData(cacheKey) : {}));

  const updateWordsForLetter = (
    letter: string,
    updateFn: (words: WordWithExplanation[]) => WordWithExplanation[],
  ) => {
    setAllWords((prev) => {
      const newWords = {...prev};
      const updated = updateFn(newWords[letter] || []);
      newWords[letter] = updated;
      if (cacheKey) {
        localStorage.setItem(`${cacheKey}:${letter}`, JSON.stringify(updated));
      }
      return newWords;
    });
  };

  const handleAddWord = (letter: string, word: string) => {
    updateWordsForLetter(letter, (words) => {
      if (words.some((w) => w.text === word)) {
        return words;
      }
      const newWord: WordWithExplanation = {
        text: word,
        explanation: "",
        version: 1,
        imported: false,
      };
      if (item) {
        trackWordAdded(word, item);
      }
      return [...words, newWord];
    });
  };

  const handleDeleteWord = (letter: string, word: string) => {
    updateWordsForLetter(letter, (words) =>
      words.filter((w) => w.text !== word),
    );
  };

  const handleExplanationChange = (
    letter: string,
    word: string,
    explanation: string,
  ) => {
    updateWordsForLetter(letter, (words) =>
      words.map((w) =>
        w.text === word
          ? {...w, explanation, version: (w.version || 1) + 1}
          : w,
      ),
    );
  };

  const handleRatingChange = (letter: string, word: string, rating: number) => {
    updateWordsForLetter(letter, (words) =>
      words.map((w) =>
        w.text === word
          ? {...w, rating, lastReviewed: new Date().toISOString()}
          : w,
      ),
    );
  };

  const handleVisualElementsChange = (
    letter: string,
    word: string,
    visualData: {emoji?: string; symbol?: string; imageUrl?: string},
  ) => {
    updateWordsForLetter(letter, (words) =>
      words.map((w) => (w.text === word ? {...w, ...visualData} : w)),
    );
  };

  // Timer effect - countdown
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time is up
            if (!timeUpNotifiedRef.current) {
              timeUpNotifiedRef.current = true;
              toast.info("⏰ Zeit abgelaufen! Die 90 Sekunden sind um.", {
                duration: 5000,
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      timerIntervalRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [isTimerActive, timeLeft]);

  // Reset notification flag when timer is reset or restarted
  useEffect(() => {
    if (timeLeft > 0 || !isTimerActive) {
      timeUpNotifiedRef.current = false;
    }
  }, [timeLeft, isTimerActive]);

  // Timer control handlers
  const startTimer = () => {
    setIsTimerActive(true);
    if (timeLeft === 0) {
      setTimeLeft(timerDuration);
    }
  };

  const pauseTimer = () => {
    setIsTimerActive(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeLeft(timerDuration);
    timeUpNotifiedRef.current = false;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  // Don't render Letter components until we have a valid item and cacheKey
  if (!item || !cacheKey) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-600">
              Lade ABC-Liste...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract function handlers with stable references
  const exportAsJSON = () =>
    handleExportAsJSON(item, cacheKey, setExportedData, setShowExportModal);
  const exportAsPDF = () => handleExportAsPDF(item, cacheKey);
  const exportAsCSV = () => handleExportAsCSV(item, cacheKey);
  const exportAsMarkdown = () => handleExportAsMarkdown(item, cacheKey);
  const importFromJSON = () =>
    handleImportFromJSON(importData, setShowImportModal, showImportPreview);
  const importFromCSV = () =>
    handleImportFromCSV(
      selectedFile,
      setShowImportModal,
      showImportPreview,
      setSelectedFile,
    );
  const copyToClipboard = () => handleCopyToClipboard(exportedData);
  const downloadAsFile = () => handleDownloadAsFile(exportedData, item);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    handleFileChange(event, setSelectedFile, setImportData);

  const showImportPreview = (data: ExportedList) =>
    createImportPreview(data, cacheKey, showImportWizard);

  const showImportWizard = (
    terms: Array<{letter: string; word: WordWithExplanation}>,
  ) => createImportWizard(terms, cacheKey, prompt);

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-2 md:mb-0">
          <button
            onClick={backToLists}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 mb-2 sm:mb-0 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            title="Zurück zur Listen-Übersicht"
            aria-label="Zurück zur ABC-Listen Übersicht"
          >
            <span className="flex items-center">←</span> Zurück zu Listen
          </button>
          <h1 className="text-3xl font-bold">ABC-Liste für {item}</h1>
        </div>
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
          <button
            onClick={() => navigate(`/mindmap/${item}`)}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            title="Als Mind-Map visualisieren"
            aria-label="ABC-Liste als Mind-Map visualisieren"
          >
            🧠 Mind-Map
          </button>
        </div>
      </div>

      {/* Timer Section */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-blue-600 min-w-[100px]">
              {formatTime(timeLeft)}
            </div>
            <div className="flex gap-2">
              {!isTimerActive ? (
                <button
                  onClick={startTimer}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  title="Timer starten"
                  aria-label="Timer starten"
                >
                  ▶️ Start
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  title="Timer pausieren"
                  aria-label="Timer pausieren"
                >
                  ⏸️ Pause
                </button>
              )}
              <button
                onClick={resetTimer}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                title="Timer zurücksetzen"
                aria-label="Timer zurücksetzen"
              >
                🔄 Reset
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="timer-duration" className="text-sm font-medium">
              Dauer:
            </label>
            <select
              id="timer-duration"
              value={timerDuration}
              onChange={(e) => {
                const newDuration = parseInt(e.target.value);
                setTimerDuration(newDuration);
                setTimeLeft(newDuration);
                setIsTimerActive(false);
                timeUpNotifiedRef.current = false;
              }}
              disabled={isTimerActive}
              className="border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
              aria-label="Timer-Dauer auswählen"
            >
              <option value="60">1 Minute</option>
              <option value="90">90 Sekunden</option>
              <option value="120">2 Minuten</option>
              <option value="180">3 Minuten</option>
              <option value="300">5 Minuten</option>
            </select>
          </div>
        </div>
        {timeLeft === 0 && (
          <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded text-center">
            <span className="text-lg font-semibold text-yellow-800">
              ⏰ Zeit abgelaufen! Sie können weiterarbeiten.
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-row flex-wrap justify-around gap-4">
        {cacheKey &&
          alphabet.map((char) => (
            <div key={char} className="m-2">
              <Letter
                letter={char}
                words={allWords[char] || []}
                onAddWord={(word) => handleAddWord(char, word)}
                onDeleteWord={(word) => handleDeleteWord(char, word)}
                onExplanationChange={(word, explanation) =>
                  handleExplanationChange(char, word, explanation)
                }
                onRatingChange={(word, rating) =>
                  handleRatingChange(char, word, rating)
                }
                onVisualElementsChange={(word, visualData) =>
                  handleVisualElementsChange(char, word, visualData)
                }
              />
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
                  onChange={onFileChange}
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
