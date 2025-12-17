import React, {useState} from "react";
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
import {VoiceInput} from "../VoiceInput";
import {Mic} from "lucide-react";

interface LetterProps {
  letter: string;
  words: WordWithExplanation[];
  onAddWord: (word: string) => void;
  onDeleteWord: (word: string) => void;
  onExplanationChange: (word: string, explanation: string) => void;
  onRatingChange: (word: string, rating: number) => void;
  onVisualElementsChange: (
    word: string,
    visualData: {emoji?: string; symbol?: string; imageUrl?: string},
  ) => void;
}

export function Letter({
  letter,
  words,
  onAddWord,
  onDeleteWord,
  onExplanationChange,
  onRatingChange,
  onVisualElementsChange,
}: LetterProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [newWord, setNewWord] = useState("");

  const handleAddWord = () => {
    if (newWord.trim()) {
      onAddWord(newWord.trim());
      setNewWord("");
      setIsModalOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddWord();
    }
  };

  const handleVoiceInput = (word: string) => {
    onAddWord(word);
    setIsVoiceOpen(false);
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
            emoji={word.emoji}
            symbol={word.symbol}
            imageUrl={word.imageUrl}
            onDelete={() => onDeleteWord(word.text)}
            onExplanationChange={(explanation) =>
              onExplanationChange(word.text, explanation)
            }
            onRatingChange={(rating) => onRatingChange(word.text, rating)}
            onVisualElementsChange={(visualData) =>
              onVisualElementsChange(word.text, visualData)
            }
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
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setIsVoiceOpen(true)}
                className="flex items-center gap-2"
                aria-label="Spracheingabe verwenden"
              >
                <Mic className="h-4 w-4" />
                Spracheingabe
              </Button>
            </div>
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

      <VoiceInput
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onWordRecognized={handleVoiceInput}
        letter={letter.toUpperCase()}
      />
    </div>
  );
}
