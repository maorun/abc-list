import React, {useState, useEffect, useCallback} from "react";
import {SavedWord, WordWithExplanation} from "./SavedWord";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {Button} from "../ui/button";
import {Input} from "../ui/input";

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
      setNewWord("");
      setIsModalOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newWord.trim()) {
      e.preventDefault();
      handleAddWord();
    }
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

  const handleRatingChange = (wordText: string, rating: number) => {
    const newWords = words.map((word) =>
      word.text === wordText
        ? {...word, rating, lastReviewed: new Date().toISOString()}
        : word,
    );
    setWords(newWords);
    updateStorage(newWords);
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        variant="secondary"
        size="icon"
        className="w-16 h-16 text-2xl font-bold rounded-full"
        onClick={() => setIsModalOpen(true)}
        aria-label={`Wort für Buchstabe ${letter.toUpperCase()} hinzufügen`}
      >
        {letter.toUpperCase()}
      </Button>
      <div className="mt-2 flex flex-col gap-1">
        {words.map((word) => (
          <SavedWord
            key={word.text}
            text={word.text}
            explanation={word.explanation}
            imported={word.imported}
            rating={word.rating}
            onDelete={() => handleDeleteWord(word.text)}
            onExplanationChange={(explanation) =>
              handleExplanationChange(word.text, explanation)
            }
            onRatingChange={(rating) => handleRatingChange(word.text, rating)}
          />
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Neues Wort für &quot;{letter.toUpperCase()}&quot;
            </DialogTitle>
            <DialogDescription>
              Geben Sie ein neues Wort ein, das mit dem Buchstaben{" "}
              {letter.toUpperCase()} beginnt.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Wort eingeben..."
              aria-label="Neues Wort eingeben"
            />
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button
              onClick={handleAddWord}
              disabled={!newWord.trim()}
              aria-label="Wort speichern"
            >
              Speichern
            </Button>
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="outline"
              aria-label="Dialog schließen"
            >
              Abbrechen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
