import React, {useState, useEffect} from "react";
import {cacheKey} from "../List/List";
import {WordWithExplanation} from "../List/SavedWord";

interface LinkedListData {
  name: string;
  words: Record<string, WordWithExplanation[]>;
}

export function LinkLists() {
  const [availableLists, setAvailableLists] = useState<string[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [linkedListsData, setLinkedListsData] = useState<LinkedListData[]>([]);

  const alphabet = Array.from({length: 26}, (_, i) =>
    String.fromCharCode(97 + i),
  );

  useEffect(() => {
    // Load available lists from localStorage
    const storedLists = localStorage.getItem(cacheKey);
    if (storedLists) {
      setAvailableLists(JSON.parse(storedLists));
    }
  }, []);

  const loadListData = (listName: string): LinkedListData => {
    const words: Record<string, WordWithExplanation[]> = {};

    alphabet.forEach((letter) => {
      const storageKey = `abcList-${listName}:${letter}`;
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        // Handle both old string[] format and new WordWithExplanation[] format
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof parsed[0] === 'string') {
            // Convert old format to new format
            words[letter] = parsed.map((word: string) => ({
              text: word,
              explanation: "",
              version: 1,
              imported: false
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

    return {
      name: listName,
      words,
    };
  };

  const handleListSelection = (listName: string) => {
    if (selectedLists.includes(listName)) {
      // Remove from selection
      const newSelected = selectedLists.filter((name) => name !== listName);
      setSelectedLists(newSelected);
      setLinkedListsData(
        linkedListsData.filter((data) => data.name !== listName),
      );
    } else {
      // Add to selection
      const newSelected = [...selectedLists, listName];
      setSelectedLists(newSelected);
      const listData = loadListData(listName);
      setLinkedListsData([...linkedListsData, listData]);
    }
  };

  const clearSelection = () => {
    setSelectedLists([]);
    setLinkedListsData([]);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        ABC-Listen verknüpfen
      </h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">
          Listen auswählen ({selectedLists.length} ausgewählt)
        </h2>

        {availableLists.length === 0 ? (
          <p className="text-gray-600 text-center">
            Keine ABC-Listen verfügbar. Erstellen Sie zuerst eine Liste.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {availableLists.map((listName) => (
              <button
                key={listName}
                onClick={() => handleListSelection(listName)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedLists.includes(listName)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                {listName}
              </button>
            ))}
          </div>
        )}

        {selectedLists.length > 0 && (
          <button
            onClick={clearSelection}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Auswahl zurücksetzen
          </button>
        )}
      </div>

      {linkedListsData.length > 0 && (
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">
            Verknüpfte Listen-Ansicht
          </h2>

          <div className="overflow-x-auto">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${linkedListsData.length}, minmax(250px, 1fr))`,
              }}
            >
              {linkedListsData.map((listData) => (
                <div
                  key={listData.name}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <h3 className="text-lg font-semibold mb-3 text-center text-blue-600">
                    {listData.name}
                  </h3>
                  <div className="space-y-2">
                    {alphabet.map((letter) => (
                      <div key={letter} className="flex">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-sm mr-2">
                          {letter.toUpperCase()}
                        </div>
                        <div className="flex-1 min-h-[32px] flex items-center">
                          {listData.words[letter].length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {listData.words[letter].map((wordObj, index) => (
                                <span
                                  key={index}
                                  className={`px-2 py-1 rounded text-xs border ${
                                    wordObj.imported 
                                      ? 'bg-blue-100 border-blue-300' 
                                      : 'bg-white border-gray-300'
                                  } ${
                                    wordObj.explanation 
                                      ? 'border-l-2 border-l-green-400' 
                                      : ''
                                  }`}
                                  title={
                                    wordObj.explanation 
                                      ? `${wordObj.imported ? '📥 Importiert' : ''} 💬 ${wordObj.explanation}` 
                                      : wordObj.imported ? '📥 Importiert' : ''
                                  }
                                >
                                  {wordObj.text}
                                  {wordObj.imported && " 📥"}
                                  {wordObj.explanation && " 💬"}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">
                              Keine Wörter
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {linkedListsData.length >= 2 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">
                💡 Bi-assoziative Ideen
              </h3>
              <p className="text-blue-700 text-sm">
                Betrachten Sie die Wörter in derselben Zeile (Buchstabe) über
                die verschiedenen Listen hinweg, um neue Verbindungen und
                kreative Ideen zu entdecken. Kombinieren Sie Begriffe aus
                verschiedenen Listen, um innovative Lösungsansätze zu
                entwickeln.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
