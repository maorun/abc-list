import React, {useState} from "react";
import {EmojiPicker} from "./EmojiPicker";
import {SymbolPicker} from "./SymbolPicker";
import {getSymbolById, type Symbol} from "@/lib/symbolLibrary";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface VisualElementsEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmoji?: string;
  currentSymbol?: string;
  currentImageUrl?: string;
  onSave: (data: {emoji?: string; symbol?: string; imageUrl?: string}) => void;
}

const handleOpenEmojiPickerAction =
  (setShowEmojiPicker: (show: boolean) => void) => () => {
    setShowEmojiPicker(true);
  };

const handleOpenSymbolPickerAction =
  (setShowSymbolPicker: (show: boolean) => void) => () => {
    setShowSymbolPicker(true);
  };

const handleEmojiSelectAction =
  (
    setEmoji: (emoji: string) => void,
    setShowEmojiPicker: (show: boolean) => void,
  ) =>
  (emoji: string) => {
    setEmoji(emoji);
    setShowEmojiPicker(false);
  };

const handleSymbolSelectAction =
  (
    setSymbol: (symbolId: string) => void,
    setShowSymbolPicker: (show: boolean) => void,
  ) =>
  (symbol: Symbol) => {
    setSymbol(symbol.id);
    setShowSymbolPicker(false);
  };

const handleImageUrlChangeAction =
  (setImageUrl: (url: string) => void) =>
  (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

const handleSaveAction =
  (
    emoji: string,
    symbol: string,
    imageUrl: string,
    onSave: (data: {
      emoji?: string;
      symbol?: string;
      imageUrl?: string;
    }) => void,
    onClose: () => void,
  ) =>
  () => {
    onSave({
      emoji: emoji || undefined,
      symbol: symbol || undefined,
      imageUrl: imageUrl.trim() || undefined,
    });
    onClose();
  };

const handleClearAllAction =
  (
    setEmoji: (emoji: string) => void,
    setSymbol: (symbol: string) => void,
    setImageUrl: (url: string) => void,
  ) =>
  () => {
    setEmoji("");
    setSymbol("");
    setImageUrl("");
  };

export function VisualElementsEditor({
  isOpen,
  onClose,
  currentEmoji = "",
  currentSymbol = "",
  currentImageUrl = "",
  onSave,
}: VisualElementsEditorProps) {
  const [emoji, setEmoji] = useState(currentEmoji);
  const [symbol, setSymbol] = useState(currentSymbol);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);

  const selectedSymbolData = symbol ? getSymbolById(symbol) : undefined;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Visuelle Elemente hinzufügen</DialogTitle>
            <DialogDescription>
              Füge Emoji, Symbol oder Bild für besseres Einprägen hinzu
              (Dual-Coding Methode)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Emoji Selection */}
            <div>
              <label
                htmlFor="emoji-selector"
                className="text-sm font-medium mb-2 block"
              >
                Emoji
              </label>
              <div className="flex gap-2 items-center">
                <Button
                  id="emoji-selector"
                  variant="outline"
                  onClick={handleOpenEmojiPickerAction(setShowEmojiPicker)}
                  className="flex-1"
                >
                  {emoji ? (
                    <span className="text-2xl">{emoji}</span>
                  ) : (
                    "Emoji wählen"
                  )}
                </Button>
                {emoji && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEmoji("")}
                  >
                    ✕
                  </Button>
                )}
              </div>
            </div>

            {/* Symbol Selection */}
            <div>
              <label
                htmlFor="symbol-selector"
                className="text-sm font-medium mb-2 block"
              >
                Symbol aus Bibliothek
              </label>
              <div className="flex gap-2 items-center">
                <Button
                  id="symbol-selector"
                  variant="outline"
                  onClick={handleOpenSymbolPickerAction(setShowSymbolPicker)}
                  className="flex-1"
                >
                  {selectedSymbolData ? (
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">
                        {selectedSymbolData.emoji}
                      </span>
                      <span className="text-sm">{selectedSymbolData.name}</span>
                    </span>
                  ) : (
                    "Symbol wählen"
                  )}
                </Button>
                {symbol && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSymbol("")}
                  >
                    ✕
                  </Button>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label
                htmlFor="image-url-input"
                className="text-sm font-medium mb-2 block"
              >
                Bild-URL (optional)
              </label>
              <Input
                id="image-url-input"
                type="url"
                placeholder="https://example.com/bild.jpg"
                value={imageUrl}
                onChange={handleImageUrlChangeAction(setImageUrl)}
              />
              {imageUrl && (
                <p className="text-xs text-gray-500 mt-1">
                  Tipp: Nutze kostenlose Bilddatenbanken wie Unsplash oder
                  Pixabay
                </p>
              )}
            </div>

            {/* Preview */}
            {(emoji || symbol || imageUrl) && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Vorschau:</p>
                <div className="flex items-center gap-3">
                  {emoji && <span className="text-3xl">{emoji}</span>}
                  {selectedSymbolData && (
                    <span className="text-3xl">{selectedSymbolData.emoji}</span>
                  )}
                  {imageUrl && (
                    <div className="text-sm text-gray-600">
                      🖼️ Bild-URL gesetzt
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClearAllAction(setEmoji, setSymbol, setImageUrl)}
            >
              Alle löschen
            </Button>
            <Button
              onClick={handleSaveAction(
                emoji,
                symbol,
                imageUrl,
                onSave,
                onClose,
              )}
            >
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pickers */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={handleEmojiSelectAction(setEmoji, setShowEmojiPicker)}
        currentEmoji={emoji}
      />

      <SymbolPicker
        isOpen={showSymbolPicker}
        onClose={() => setShowSymbolPicker(false)}
        onSelect={handleSymbolSelectAction(setSymbol, setShowSymbolPicker)}
        currentSymbol={symbol}
      />
    </>
  );
}
