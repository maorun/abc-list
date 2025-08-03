import React, { useState, useEffect } from 'react';
import { SavedWord } from './SavedWord';

interface LetterProps {
  cacheKey: string;
  letter: string;
}

export function Letter({ cacheKey, letter }: LetterProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState('');

  const getStorageKey = () => `${cacheKey}:${letter}`;

  useEffect(() => {
    const storedWords = localStorage.getItem(getStorageKey());
    if (storedWords) {
      setWords(JSON.parse(storedWords));
    }
  }, [cacheKey, letter]);

  const updateStorage = (newWords: string[]) => {
    localStorage.setItem(getStorageKey(), JSON.stringify(newWords));
  };

  const handleAddWord = () => {
    if (newWord && !words.includes(newWord)) {
      const newWords = [...words, newWord];
      setWords(newWords);
      updateStorage(newWords);
    }
    setNewWord('');
    setIsModalOpen(false);
  };

  const handleDeleteWord = (wordToDelete: string) => {
    const newWords = words.filter(word => word !== wordToDelete);
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
            key={word}
            text={word}
            onDelete={() => handleDeleteWord(word)}
          />
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Neues Wort für "{letter.toUpperCase()}"</h2>
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Wort eingeben..."
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={handleAddWord} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Speichern
              </button>
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
