import React, {useState} from "react";
import {
  SYMBOL_LIBRARY,
  SYMBOL_CATEGORIES,
  getSymbolsByCategory,
  type Symbol,
  type SymbolCategory,
} from "@/lib/symbolLibrary";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

interface SymbolPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (symbol: Symbol) => void;
  currentSymbol?: string;
}

const handleCategoryClickAction =
  (
    category: SymbolCategory | "all",
    setSelectedCategory: (cat: SymbolCategory | "all") => void,
  ) =>
  () => {
    setSelectedCategory(category);
  };

const handleSymbolClickAction =
  (symbol: Symbol, onSelect: (symbol: Symbol) => void, onClose: () => void) =>
  () => {
    onSelect(symbol);
    onClose();
  };

const handleClearAction =
  (onSelect: (symbol: Symbol) => void, onClose: () => void) => () => {
    onSelect({id: "", name: "", emoji: "", category: "", description: ""});
    onClose();
  };

const handleSearchChangeAction =
  (setSearchQuery: (query: string) => void) =>
  (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

export function SymbolPicker({
  isOpen,
  onClose,
  onSelect,
  currentSymbol,
}: SymbolPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    SymbolCategory | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSymbols = React.useMemo(() => {
    let symbols =
      selectedCategory === "all"
        ? SYMBOL_LIBRARY
        : getSymbolsByCategory(selectedCategory);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      symbols = symbols.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query),
      );
    }

    return symbols;
  }, [selectedCategory, searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Symbol wählen</DialogTitle>
          <DialogDescription>
            Wähle ein visuelles Symbol für besseres Einprägen (Dual-Coding)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <Input
            type="text"
            placeholder="Symbol suchen..."
            value={searchQuery}
            onChange={handleSearchChangeAction(setSearchQuery)}
            className="w-full"
          />

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={handleCategoryClickAction("all", setSelectedCategory)}
            >
              Alle
            </Button>
            {SYMBOL_CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={handleCategoryClickAction(
                  category,
                  setSelectedCategory,
                )}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Symbol Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 min-h-[200px]">
            {filteredSymbols.map((symbol) => (
              <button
                key={symbol.id}
                onClick={handleSymbolClickAction(symbol, onSelect, onClose)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:bg-blue-50 hover:border-blue-500 ${
                  currentSymbol === symbol.id
                    ? "bg-blue-100 border-blue-500"
                    : "border-gray-200"
                }`}
                title={symbol.description}
              >
                <span className="text-3xl mb-1">{symbol.emoji}</span>
                <span className="text-xs text-center text-gray-600 line-clamp-2">
                  {symbol.name}
                </span>
              </button>
            ))}
          </div>

          {filteredSymbols.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Keine Symbole gefunden
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            {currentSymbol && (
              <Button
                variant="outline"
                onClick={handleClearAction(onSelect, onClose)}
              >
                Symbol entfernen
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
