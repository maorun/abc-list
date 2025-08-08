import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {toast} from "sonner";
import {NewStringItem} from "../NewStringItem";
import {Button} from "../ui/button";
import {ExportUtils} from "@/lib/exportUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const cacheKey = "abcLists";

export function List() {
  const [data, setData] = useState<string[]>([]);
  const [isReversed, setIsReversed] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem(cacheKey);
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  const updateStorage = (newData: string[]) => {
    localStorage.setItem(cacheKey, JSON.stringify(newData));
  };

  const deleteItem = (itemToDelete: string) => {
    const newData = data.filter((item) => item !== itemToDelete);
    setData(newData);
    updateStorage(newData);
    localStorage.removeItem("abcList-" + itemToDelete);
  };

  const clearAll = () => {
    data.forEach((item) => {
      localStorage.removeItem("abcList-" + item);
    });
    setData([]);
    updateStorage([]);
  };

  const showAbcList = (item: string) => {
    navigate(`/list/${item}`);
  };

  const createNewItem = (newItem: string) => {
    if (newItem && !data.includes(newItem)) {
      const newData = [...data, newItem];
      setData(newData);
      updateStorage(newData);
      showAbcList(newItem);
    }
  };

  const createMultiColumnList = () => {
    navigate("/multi-list");
  };

  const handleBulkImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (
        fileExtension === "csv" ||
        fileExtension === "xlsx" ||
        fileExtension === "xls"
      ) {
        setSelectedFile(file);
      } else {
        toast.error("Bitte wählen Sie eine CSV- oder Excel-Datei aus.");
        event.target.value = "";
      }
    }
  };

  const processBulkImport = async () => {
    if (!selectedFile) {
      toast.error("Bitte wählen Sie eine Datei aus.");
      return;
    }

    try {
      const csvRows = await ExportUtils.parseCSVFile(selectedFile);

      // Group rows by a "ListName" column or use filename as fallback
      const listGroups: Record<string, typeof csvRows> = {};

      csvRows.forEach((row) => {
        // Check if there's a ListName column, otherwise use filename
        const listName =
          (row as {ListName?: string}).ListName ||
          (row as {List?: string}).List ||
          selectedFile.name.replace(/\.(csv|xlsx?)$/i, "");

        if (!listGroups[listName]) {
          listGroups[listName] = [];
        }
        listGroups[listName].push(row);
      });

      // Create lists for each group
      const createdLists: string[] = [];

      for (const [listName, rows] of Object.entries(listGroups)) {
        if (rows.length === 0) continue;

        // Check if list already exists
        if (data.includes(listName)) {
          toast.warning(
            `Liste "${listName}" existiert bereits und wird übersprungen.`,
          );
          continue;
        }

        // Create the list
        const newData = [...data, listName];
        setData(newData);
        updateStorage(newData);

        // Convert CSV data to list format
        const exportedList = ExportUtils.csvToExportedList(rows, listName);

        // Save the list data
        const alphabet = Array.from({length: 26}, (_, i) =>
          String.fromCharCode(97 + i),
        );
        alphabet.forEach((letter) => {
          const wordsForLetter = exportedList.words[letter] || [];
          if (wordsForLetter.length > 0) {
            const storageKey = `abcList-${listName}:${letter}`;
            localStorage.setItem(storageKey, JSON.stringify(wordsForLetter));
          }
        });

        createdLists.push(listName);
      }

      if (createdLists.length > 0) {
        toast.success(
          `${createdLists.length} Listen erfolgreich importiert: ${createdLists.join(", ")}`,
        );
      } else {
        toast.info("Keine neuen Listen zum Importieren gefunden.");
      }

      setShowBulkImportModal(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Fehler beim Bulk-Import",
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile-first button layout */}
      <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-2 sm:gap-2">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 flex-1 sm:flex-none">
          <NewStringItem
            title={"Neue ABC-Liste"}
            onSave={(item) => createNewItem(item.text)}
          />
          <Button
            variant="default"
            onClick={createMultiColumnList}
            className="bg-purple-500 hover:bg-purple-700 text-sm"
          >
            📊 Mehrspaltige Liste
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 flex-1 sm:flex-none">
          <Button
            variant="secondary"
            onClick={() => setShowBulkImportModal(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white text-sm"
          >
            📥 Bulk-Import
          </Button>
          <Button variant="destructive" onClick={clearAll} className="text-sm">
            Alle löschen
          </Button>
        </div>
        <Button
          variant="secondary"
          onClick={() => setIsReversed(!isReversed)}
          className="text-sm sm:w-auto"
        >
          Sortierung umkehren
        </Button>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-3">
          💡 Zwei Arten von ABC-Listen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium">🔤 Einfache ABC-Liste</h4>
            <p>Eine Spalte für ein Thema - klassisches ABC-Listen Format</p>
          </div>
          <div>
            <h4 className="font-medium">📊 Mehrspaltige ABC-Liste</h4>
            <p>
              Bis zu 5 Spalten für verschiedene Themen mit Zeitlimits und
              Prognose
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-center my-4 sm:my-6">
        Einfache ABC-Listen
      </h2>
      <ul className="space-y-2 sm:space-y-3">
        {data
          .slice()
          .sort((a, b) =>
            isReversed ? b.localeCompare(a) : a.localeCompare(b),
          )
          .map((item) => (
            <li key={item} className="flex items-stretch gap-2 sm:gap-3">
              <Button
                variant="default"
                className="flex-1 text-left justify-start py-3 px-4"
                onClick={() => showAbcList(item)}
              >
                {item}
              </Button>
              <Button
                variant="destructive"
                className="w-12 sm:w-16 flex-shrink-0"
                onClick={() => deleteItem(item)}
              >
                ✕
              </Button>
            </li>
          ))}
      </ul>

      {/* Bulk Import Modal */}
      <Dialog open={showBulkImportModal} onOpenChange={setShowBulkImportModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk-Import von ABC-Listen</DialogTitle>
            <DialogDescription>
              Importieren Sie mehrere ABC-Listen gleichzeitig aus einer
              CSV/Excel-Datei.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-800 mb-2">
                💡 CSV-Format für Bulk-Import
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                Ihre CSV-Datei sollte folgende Spalten enthalten:
              </p>
              <ul className="text-xs text-blue-600 list-disc ml-4 space-y-1">
                <li>
                  <strong>Letter</strong>: Der Buchstabe (A-Z)
                </li>
                <li>
                  <strong>Word</strong>: Das Wort/der Begriff
                </li>
                <li>
                  <strong>Explanation</strong>: Erklärung (optional)
                </li>
                <li>
                  <strong>ListName</strong>: Name der Liste (optional, sonst
                  wird Dateiname verwendet)
                </li>
              </ul>
              <p className="text-xs text-blue-600 mt-2">
                Beispiel: Letter,Word,Explanation,ListName
                <br />
                A,Apfel,Rote Frucht,Obst
                <br />
                B,Banane,Gelbe Frucht,Obst
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">
                📁 CSV/Excel-Datei hochladen
              </h4>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleBulkImportFile}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Datei ausgewählt: {selectedFile.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <button
              onClick={processBulkImport}
              disabled={!selectedFile}
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              📥 Listen importieren
            </button>
            <button
              onClick={() => {
                setShowBulkImportModal(false);
                setSelectedFile(null);
              }}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Abbrechen
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
