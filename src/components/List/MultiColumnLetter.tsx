import React, {useState, useEffect, useCallback} from "react";
import {
  WordWithExplanation,
  ColumnConfig,
  getMultiColumnStorageKey,
} from "./types";
import {SavedWord} from "./SavedWord";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface MultiColumnLetterProps {
  letter: string;
  listName: string;
  column: ColumnConfig;
}

export function MultiColumnLetter({
  letter,
  listName,
  column,
}: MultiColumnLetterProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [words, setWords] = useState<WordWithExplanation[]>([]);
  const [newWord, setNewWord] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const getStorageKey = useCallback(
    () => getMultiColumnStorageKey(listName, column.id, letter),
    [listName, column.id, letter],
  );

  useEffect(() => {
    const storedData = localStorage.getItem(getStorageKey());
    if (storedData) {
      const parsed = JSON.parse(storedData);
      if (Array.isArray(parsed)) {
        setWords(parsed);
      }
    }
  }, [getStorageKey]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (startTime && column.timeLimit && timeLeft !== null && isModalOpen) {
      // Use a more efficient timer that only updates when modal is open
      intervalId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = column.timeLimit! * 60 - elapsed;

        if (remaining <= 0) {
          setTimeLeft(0);
          setIsModalOpen(false);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [startTime, column.timeLimit, timeLeft, isModalOpen]);

  const updateStorage = useCallback(
    (newWords: WordWithExplanation[]) => {
      localStorage.setItem(getStorageKey(), JSON.stringify(newWords));
    },
    [getStorageKey],
  );

  const handleOpenModal = () => {
    setIsModalOpen(true);
    if (column.timeLimit) {
      setStartTime(Date.now());
      setTimeLeft(column.timeLimit * 60);
    }
  };

  const handleAddWord = () => {
    if (newWord && !words.some((w) => w.text === newWord)) {
      const newWordObj: WordWithExplanation = {
        text: newWord,
        explanation: "",
        version: 1,
        imported: false,
        timestamp: Date.now(),
      };
      const newWords = [...words, newWordObj];
      setWords(newWords);
      updateStorage(newWords);
      setNewWord("");
      setIsModalOpen(false);
      setStartTime(null);
      setTimeLeft(null);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        variant="secondary"
        size="icon"
        className="w-12 h-12 text-lg font-bold rounded-full"
        onClick={handleOpenModal}
        style={{
          borderColor: column.color,
          borderWidth: words.length > 0 ? "2px" : "1px",
        }}
        aria-label={`Wort für Buchstabe ${letter.toUpperCase()} in Spalte ${column.theme} hinzufügen`}
      >
        {letter.toUpperCase()}
      </Button>

      {words.length > 0 && (
        <div className="text-xs mt-1 text-center">
          <span
            className="px-1 py-0.5 rounded text-white text-xs"
            style={{backgroundColor: column.color}}
          >
            {words.length}
          </span>
        </div>
      )}

      <div className="mt-2 flex flex-col gap-1 w-full max-w-32">
        {words.slice(0, 3).map((word) => (
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
        {words.length > 3 && (
          <div className="text-xs text-gray-500 text-center">
            +{words.length - 3} weitere
          </div>
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setStartTime(null);
            setTimeLeft(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{backgroundColor: column.color}}
              />
              Neues Wort für &quot;{letter.toUpperCase()}&quot; - {column.theme}
            </DialogTitle>
            <DialogDescription>
              Geben Sie ein neues Wort ein, das mit dem Buchstaben{" "}
              {letter.toUpperCase()} beginnt.
              {column.timeLimit && timeLeft !== null && (
                <div
                  className={`mt-2 text-lg font-mono ${timeLeft < 30 ? "text-red-600" : "text-blue-600"}`}
                >
                  ⏱️ {formatTime(timeLeft)}
                </div>
              )}
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
