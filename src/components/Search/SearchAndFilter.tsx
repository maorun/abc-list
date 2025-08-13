import React, {useState} from "react";
import {SearchIcon, X, Filter, Heart, Clock, Tag, Star} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useSearch} from "@/hooks/useSearch";
import {SearchResults} from "./SearchResults";
import {SearchFilters} from "./SearchFilters";
import {SearchHistory} from "./SearchHistory";
import {SmartCollections} from "./SmartCollections";
import {TagManager} from "./TagManager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

export function SearchAndFilter() {
  const {
    results,
    isLoading,
    hasSearched,
    totalResults,
    search,
    clearResults,
    filters,
    updateFilters,
    resetFilters,
    searchHistory,
    clearSearchHistory,
    allTags,
    allCategories,
    popularTags,
    smartCollections,
    generateTagSuggestions,
    addTag,
    removeTag,
    toggleFavorite,
  } = useSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [activeTab, setActiveTab] = useState("search");

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search(filters);
  };

  // Handle query input change
  const handleQueryChange = (value: string) => {
    updateFilters({query: value});
    if (!value.trim()) {
      clearResults();
    }
  };

  // Handle clear all
  const handleClearAll = () => {
    resetFilters();
    clearResults();
  };

  // Handle history item click
  const handleHistoryClick = (query: string) => {
    updateFilters({query});
    search({...filters, query});
  };

  return (
    <div className="space-y-4">
      {/* Header with search and quick actions */}
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          {/* Search form */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Durchsuche alle Listen, Wörter und Inhalte..."
                value={filters.query || ""}
                onChange={(e) => handleQueryChange(e.target.value)}
                className="pl-10 pr-10"
              />
              {filters.query && (
                <button
                  type="button"
                  onClick={() => handleQueryChange("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          {/* Quick action buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
              {(filters.tags?.length || 0) +
                (filters.type?.length || 0) +
                (filters.category ? 1 : 0) +
                (filters.rating ? 1 : 0) +
                (filters.isFavorite !== undefined ? 1 : 0) >
                0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(filters.tags?.length || 0) +
                    (filters.type?.length || 0) +
                    (filters.category ? 1 : 0) +
                    (filters.rating ? 1 : 0) +
                    (filters.isFavorite !== undefined ? 1 : 0)}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagManager(true)}
              className="flex items-center gap-2"
            >
              <Tag className="h-4 w-4" />
              Tags
            </Button>

            {(hasSearched ||
              Object.keys(filters).some(
                (key) =>
                  key !== "query" &&
                  filters[key as keyof typeof filters] !== undefined &&
                  filters[key as keyof typeof filters] !== "" &&
                  (Array.isArray(filters[key as keyof typeof filters])
                    ? (filters[key as keyof typeof filters] as unknown[])
                        .length > 0
                    : true),
              )) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-700"
              >
                Zurücksetzen
              </Button>
            )}
          </div>
        </div>

        {/* Search filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <SearchFilters
              filters={filters}
              updateFilters={updateFilters}
              allTags={allTags}
              allCategories={allCategories}
            />
          </div>
        )}

        {/* Results summary */}
        {hasSearched && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              {isLoading
                ? "Suche läuft..."
                : `${totalResults} Ergebnisse gefunden`}
            </span>
            {totalResults > 0 && <span>Sortiert nach Relevanz</span>}
          </div>
        )}
      </div>

      {/* Main content with tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <SearchIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Suchergebnisse</span>
            <span className="sm:hidden">Suche</span>
            {totalResults > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalResults}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="collections" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Sammlungen</span>
            <span className="sm:hidden">Smart</span>
          </TabsTrigger>

          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Verlauf</span>
            <span className="sm:hidden">Verlauf</span>
          </TabsTrigger>

          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Favoriten</span>
            <span className="sm:hidden">♥</span>
            {smartCollections.favorites.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {smartCollections.favorites.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-4">
          {hasSearched ? (
            <SearchResults
              results={results}
              isLoading={isLoading}
              onAddTag={addTag}
              onRemoveTag={removeTag}
              onToggleFavorite={toggleFavorite}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Beginne deine Suche</h3>
              <p className="text-sm">
                Suche nach ABC-Listen, KaWa, KaGa oder einzelnen Wörtern
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-xs text-gray-400">Beispielsuchen:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Tiere", "Mathematik", "Computer", "Geschichte"].map(
                    (example) => (
                      <Button
                        key={example}
                        variant="outline"
                        size="sm"
                        onClick={() => handleHistoryClick(example)}
                        className="text-xs"
                      >
                        {example}
                      </Button>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="collections" className="mt-4">
          <SmartCollections
            collections={smartCollections}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            onToggleFavorite={toggleFavorite}
            onSearchQuery={(query) => {
              updateFilters({query});
              search({...filters, query});
              setActiveTab("search");
            }}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <SearchHistory
            history={searchHistory}
            onHistoryClick={handleHistoryClick}
            onClearHistory={clearSearchHistory}
            onSwitchToSearch={() => setActiveTab("search")}
          />
        </TabsContent>

        <TabsContent value="favorites" className="mt-4">
          <SearchResults
            results={smartCollections.favorites}
            isLoading={false}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            onToggleFavorite={toggleFavorite}
            emptyMessage="Keine Favoriten gefunden"
            emptyDescription="Markiere Listen oder Wörter als Favoriten, um sie hier zu sehen"
          />
        </TabsContent>
      </Tabs>

      {/* Tag Manager Dialog */}
      <Dialog open={showTagManager} onOpenChange={setShowTagManager}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tag-Verwaltung</DialogTitle>
          </DialogHeader>
          <TagManager
            allTags={allTags}
            popularTags={popularTags}
            _onAddTag={addTag}
            _onRemoveTag={removeTag}
            generateSuggestions={generateTagSuggestions}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
