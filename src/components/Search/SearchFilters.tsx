import React, {useState} from "react";
import {
  Calendar,
  Star,
  Heart,
  Filter,
  X,
  Tag,
  List,
  PenTool,
  Image,
  BookOpen,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {SearchFilters as SearchFiltersType} from "@/lib/searchService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  filters: SearchFiltersType;
  updateFilters: (newFilters: Partial<SearchFiltersType>) => void;
  allTags: string[];
  allCategories: string[];
}

export function SearchFilters({
  filters,
  updateFilters,
  allTags,
  allCategories,
}: SearchFiltersProps) {
  const [newTag, setNewTag] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const typeOptions = [
    {value: "abc-list", label: "ABC-Listen", icon: List},
    {value: "kawa", label: "KaWa", icon: PenTool},
    {value: "kaga", label: "KaGa", icon: Image},
    {value: "word", label: "Wörter", icon: BookOpen},
  ];

  const ratingOptions = [
    {value: 1, label: "★ und höher"},
    {value: 2, label: "★★ und höher"},
    {value: 3, label: "★★★ und höher"},
    {value: 4, label: "★★★★ und höher"},
    {value: 5, label: "★★★★★"},
  ];

  const handleTypeToggle = (type: string) => {
    const currentTypes = filters.type || [];
    const newTypes = currentTypes.includes(type as never)
      ? currentTypes.filter((t) => t !== type)
      : ([...currentTypes, type] as ("abc-list" | "kawa" | "kaga" | "word")[]);

    updateFilters({type: newTypes});
  };

  const handleTagAdd = () => {
    const tag = newTag.trim();
    if (tag && !(filters.tags || []).includes(tag)) {
      updateFilters({tags: [...(filters.tags || []), tag]});
      setNewTag("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    updateFilters({
      tags: (filters.tags || []).filter((tag) => tag !== tagToRemove),
    });
  };

  const handleQuickTagAdd = (tag: string) => {
    if (!(filters.tags || []).includes(tag)) {
      updateFilters({tags: [...(filters.tags || []), tag]});
    }
  };

  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    const dateRange = filters.dateRange || {};
    const newDate = value ? new Date(value) : undefined;

    updateFilters({
      dateRange: {
        ...dateRange,
        [field]: newDate,
      },
    });
  };

  const clearAllFilters = () => {
    updateFilters({
      tags: [],
      type: [],
      category: undefined,
      rating: undefined,
      dateRange: undefined,
      isFavorite: undefined,
      hasContent: undefined,
    });
  };

  const hasActiveFilters = () => {
    return (
      (filters.tags && filters.tags.length > 0) ||
      (filters.type && filters.type.length > 0) ||
      filters.category ||
      filters.rating ||
      filters.dateRange ||
      filters.isFavorite !== undefined ||
      filters.hasContent !== undefined
    );
  };

  return (
    <div className="space-y-4">
      {/* Quick filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Filter</h3>
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Alle löschen
            </Button>
          )}
        </div>

        {/* Type filters */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">Typ:</Label>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map(({value, label, icon: Icon}) => (
              <Button
                key={value}
                variant={
                  filters.type?.includes(value as never) ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleTypeToggle(value)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Favorite toggle */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">Spezielle Filter:</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.isFavorite === true ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateFilters({
                  isFavorite: filters.isFavorite === true ? undefined : true,
                })
              }
              className="flex items-center gap-2"
            >
              <Heart
                className={`h-4 w-4 ${filters.isFavorite ? "fill-current" : ""}`}
              />
              Nur Favoriten
            </Button>

            <Button
              variant={filters.hasContent === true ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateFilters({
                  hasContent: filters.hasContent === true ? undefined : true,
                })
              }
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Mit Inhalt
            </Button>

            <Button
              variant={filters.hasContent === false ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateFilters({
                  hasContent: filters.hasContent === false ? undefined : false,
                })
              }
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Ohne Inhalt
            </Button>
          </div>
        </div>

        {/* Advanced filters toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 w-full justify-center border-t pt-2"
        >
          <Filter className="h-4 w-4" />
          {showAdvanced ? "Weniger Filter" : "Erweiterte Filter"}
        </Button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="space-y-4 border-t pt-4">
          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Tags:</Label>

            {/* Selected tags */}
            {filters.tags && filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {filters.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      onClick={() => handleTagRemove(tag)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add new tag */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Tag hinzufügen..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleTagAdd();
                  }
                }}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleTagAdd}
                disabled={!newTag.trim()}
              >
                Hinzufügen
              </Button>
            </div>

            {/* Popular tags */}
            {allTags.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Beliebte Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {allTags.slice(0, 8).map((tag) => (
                    <Button
                      key={tag}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickTagAdd(tag)}
                      className="text-xs h-6 px-2"
                      disabled={filters.tags?.includes(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Kategorie:</Label>
            <Select
              value={filters.category || ""}
              onValueChange={(value) =>
                updateFilters({
                  category: value || undefined,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategorie auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Kategorien</SelectItem>
                {allCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Mindestbewertung:</Label>
            <Select
              value={filters.rating?.toString() || ""}
              onValueChange={(value) =>
                updateFilters({
                  rating: value ? parseInt(value) : undefined,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Bewertung auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Bewertungen</SelectItem>
                {ratingOptions.map(({value, label}) => (
                  <SelectItem key={value} value={value.toString()}>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date range */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Zeitraum:</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="date-start" className="text-xs text-gray-500">
                  Von:
                </Label>
                <Input
                  id="date-start"
                  type="date"
                  value={
                    filters.dateRange?.start
                      ? filters.dateRange.start.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    handleDateRangeChange("start", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="date-end" className="text-xs text-gray-500">
                  Bis:
                </Label>
                <Input
                  id="date-end"
                  type="date"
                  value={
                    filters.dateRange?.end
                      ? filters.dateRange.end.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => handleDateRangeChange("end", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Quick date filters */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Schnellauswahl:</Label>
            <div className="flex flex-wrap gap-2">
              {[
                {label: "Heute", days: 0},
                {label: "Diese Woche", days: 7},
                {label: "Dieser Monat", days: 30},
                {label: "Dieses Jahr", days: 365},
              ].map(({label, days}) => (
                <Button
                  key={label}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const start = new Date();
                    start.setDate(start.getDate() - days);
                    updateFilters({
                      dateRange: {start, end: new Date()},
                    });
                  }}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">
              Aktive Filter:
            </span>
            <span className="text-xs text-blue-600">
              {[
                filters.tags?.length || 0,
                filters.type?.length || 0,
                filters.category ? 1 : 0,
                filters.rating ? 1 : 0,
                filters.dateRange ? 1 : 0,
                filters.isFavorite !== undefined ? 1 : 0,
                filters.hasContent !== undefined ? 1 : 0,
              ].reduce((a, b) => a + b, 0)}{" "}
              Filter aktiv
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {filters.type?.map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {typeOptions.find((t) => t.value === type)?.label}
              </Badge>
            ))}
            {filters.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {filters.category && (
              <Badge variant="outline" className="text-xs">
                Kategorie: {filters.category}
              </Badge>
            )}
            {filters.rating && (
              <Badge variant="outline" className="text-xs">
                ≥{filters.rating}★
              </Badge>
            )}
            {filters.isFavorite && (
              <Badge variant="outline" className="text-xs">
                Favoriten
              </Badge>
            )}
            {filters.hasContent !== undefined && (
              <Badge variant="outline" className="text-xs">
                {filters.hasContent ? "Mit Inhalt" : "Ohne Inhalt"}
              </Badge>
            )}
            {filters.dateRange && (
              <Badge variant="outline" className="text-xs">
                Zeitraum gesetzt
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
