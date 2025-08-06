import React, {useState, useEffect, useCallback} from "react";
import {SavedWord, WordWithExplanation} from "./SavedWord";

interface LetterProps {
  cacheKey: string;
  letter: string;
}

export function Letter({cacheKey, letter}: LetterProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [words, setWords] = useState<WordWithExplanation[]>([]);
  const [newWord, setNewWord] = useState("");

  const getStorageKey = useCallback(
    () => `${cacheKey}:${letter}`,
    [cacheKey, letter],
  );

  useEffect(() => {
    const storedData = localStorage.getItem(getStorageKey());
    if (storedData) {
      const parsed = JSON.parse(storedData);
      // Handle both old string[] format and new WordWithExplanation[] format
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (parsed.every((item) => typeof item === "string")) {
          // Convert old format to new format
          const converted = parsed.map((word: string) => ({
            text: word,
            explanation: "",
            version: 1,
            imported: false,
          }));
          setWords(converted);
          localStorage.setItem(getStorageKey(), JSON.stringify(converted));
        } else {
          setWords(parsed);
        }
      }
    }
  }, [getStorageKey]);

  const updateStorage = useCallback(
    (newWords: WordWithExplanation[]) => {
      localStorage.setItem(getStorageKey(), JSON.stringify(newWords));
    },
    [getStorageKey],
  );

  const handleAddWord = () => {
    if (newWord && !words.some((w) => w.text === newWord)) {
      const newWordObj: WordWithExplanation = {
        text: newWord,
        explanation: "",
        version: 1,
        imported: false,
      };
      const newWords = [...words, newWordObj];
      setWords(newWords);
      updateStorage(newWords);
    }
    setNewWord("");
    setIsModalOpen(false);
  };

  const handleDeleteWord = (wordToDelete: string) => {
    const newWords = words.filter((word) => word.text !== wordToDelete);
    setWords(newWords);
    updateStorage(newWords);
  };

  const handleExplanationChange = (wordText: string, explanation: string) => {
    const newWords = words.map((word) =>
      word.text === wordText
        ? {...word, explanation, version: (word.version || 1) + 1}
        : word,
    );
    setWords(newWords);
    updateStorage(newWords);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        className="w-16 h-16 text-2xl font-bold rounded-full bg-gray-200 hover:bg-gray-300"
        onClick={() => setIsModalOpen(true)}
      >
        {letter.toUpperCase()}
      </button>
      <div className="mt-2 flex flex-col gap-1">
        {words.map((word) => (
          <SavedWord
            key={word.text}
            text={word.text}
            explanation={word.explanation}
            imported={word.imported}
            onDelete={() => handleDeleteWord(word.text)}
            onExplanationChange={(explanation) =>
              handleExplanationChange(word.text, explanation)
            }
          />
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              Neues Wort für &quot;{letter.toUpperCase()}&quot;
            </h2>
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Wort eingeben..."
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleAddWord}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Speichern
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
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
