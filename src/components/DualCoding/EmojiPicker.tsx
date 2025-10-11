import React, {useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  currentEmoji?: string;
}

// Categorized emoji collections for learning
const EMOJI_CATEGORIES = {
  Emotionen: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😊",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "🤗",
    "🤩",
    "🤔",
    "🧐",
    "😎",
    "🤓",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
  ],
  Natur: [
    "🌱",
    "🌿",
    "🍀",
    "🌾",
    "🌳",
    "🌲",
    "🌴",
    "🌵",
    "🌷",
    "🌸",
    "🌹",
    "🌺",
    "🌻",
    "🌼",
    "🌈",
    "⭐",
    "✨",
    "💫",
    "☀️",
    "🌙",
    "🌍",
    "🌎",
    "🌏",
    "🔥",
    "💧",
    "🌊",
    "⚡",
    "❄️",
    "☃️",
    "🌪️",
  ],
  Tiere: [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🐔",
    "🐧",
    "🐦",
    "🐤",
    "🦆",
    "🦅",
    "🦉",
    "🦇",
    "🐺",
    "🐗",
    "🐴",
    "🦄",
    "🐝",
    "🐛",
    "🦋",
  ],
  Essen: [
    "🍎",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🥑",
    "🥦",
    "🥬",
    "🥒",
    "🌶️",
    "🌽",
    "🥕",
    "🥔",
    "🍠",
    "🍞",
    "🥐",
    "🥖",
    "🥨",
    "🧀",
    "🥚",
  ],
  Objekte: [
    "📚",
    "📖",
    "📝",
    "✏️",
    "✒️",
    "🖊️",
    "🖍️",
    "📌",
    "📍",
    "🔖",
    "💼",
    "📁",
    "📂",
    "📊",
    "📈",
    "📉",
    "🗂️",
    "🗃️",
    "🗄️",
    "📋",
    "📆",
    "📅",
    "🗓️",
    "📇",
    "🗒️",
    "🗳️",
    "⏰",
    "⏱️",
    "⏲️",
    "🕐",
  ],
  Symbole: [
    "❤️",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "✅",
    "❌",
    "⭕",
    "🔴",
    "🟠",
    "🟡",
    "🟢",
    "🔵",
    "🟣",
    "🟤",
    "⚫",
    "⚪",
    "🔺",
  ],
  Wissenschaft: [
    "🔬",
    "🧪",
    "🧬",
    "⚗️",
    "🔭",
    "🌡️",
    "💉",
    "🩺",
    "⚛️",
    "🧲",
    "🔋",
    "💡",
    "🔦",
    "🕯️",
    "🗜️",
    "⚙️",
    "🔩",
    "⛓️",
    "🧰",
    "🔨",
  ],
  Transport: [
    "🚗",
    "🚕",
    "🚙",
    "🚌",
    "🚎",
    "🏎️",
    "🚓",
    "🚑",
    "🚒",
    "🚐",
    "🚚",
    "🚛",
    "🚜",
    "🚲",
    "🛴",
    "🛹",
    "🛵",
    "🏍️",
    "✈️",
    "🚀",
  ],
} as const;

type EmojiCategory = keyof typeof EMOJI_CATEGORIES;

const handleCategoryClickAction =
  (
    category: EmojiCategory | "alle",
    setSelectedCategory: (cat: EmojiCategory | "alle") => void,
  ) =>
  () => {
    setSelectedCategory(category);
  };

const handleEmojiClickAction =
  (emoji: string, onSelect: (emoji: string) => void, onClose: () => void) =>
  () => {
    onSelect(emoji);
    onClose();
  };

const handleClearAction =
  (onSelect: (emoji: string) => void, onClose: () => void) => () => {
    onSelect("");
    onClose();
  };

const handleCustomEmojiChangeAction =
  (setCustomEmoji: (emoji: string) => void) =>
  (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomEmoji(e.target.value);
  };

const handleCustomEmojiSubmitAction =
  (
    customEmoji: string,
    onSelect: (emoji: string) => void,
    onClose: () => void,
  ) =>
  () => {
    if (customEmoji.trim()) {
      onSelect(customEmoji.trim());
      onClose();
    }
  };

export function EmojiPicker({
  isOpen,
  onClose,
  onSelect,
  currentEmoji,
}: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    EmojiCategory | "alle"
  >("alle");
  const [customEmoji, setCustomEmoji] = useState("");

  const displayedEmojis = React.useMemo(() => {
    if (selectedCategory === "alle") {
      return Object.values(EMOJI_CATEGORIES).flat();
    }
    return EMOJI_CATEGORIES[selectedCategory];
  }, [selectedCategory]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Emoji wählen</DialogTitle>
          <DialogDescription>
            Wähle ein Emoji für visuelle Assoziation (Dual-Coding)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Custom Emoji Input */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Eigenes Emoji eingeben..."
              value={customEmoji}
              onChange={handleCustomEmojiChangeAction(setCustomEmoji)}
              className="flex-1"
              maxLength={2}
            />
            <Button
              onClick={handleCustomEmojiSubmitAction(
                customEmoji,
                onSelect,
                onClose,
              )}
              disabled={!customEmoji.trim()}
            >
              Verwenden
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "alle" ? "default" : "outline"}
              size="sm"
              onClick={handleCategoryClickAction("alle", setSelectedCategory)}
            >
              Alle
            </Button>
            {(Object.keys(EMOJI_CATEGORIES) as EmojiCategory[]).map(
              (category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={handleCategoryClickAction(
                    category,
                    setSelectedCategory,
                  )}
                >
                  {category}
                </Button>
              ),
            )}
          </div>

          {/* Emoji Grid */}
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 min-h-[200px]">
            {displayedEmojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                onClick={handleEmojiClickAction(emoji, onSelect, onClose)}
                className={`flex items-center justify-center p-2 rounded-lg border-2 transition-all hover:bg-blue-50 hover:border-blue-500 text-2xl ${
                  currentEmoji === emoji
                    ? "bg-blue-100 border-blue-500"
                    : "border-gray-200"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            {currentEmoji && (
              <Button
                variant="outline"
                onClick={handleClearAction(onSelect, onClose)}
              >
                Emoji entfernen
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
