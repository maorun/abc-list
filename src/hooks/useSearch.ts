import {useState, useEffect, useCallback} from "react";
import {
  searchService,
  SearchFilters,
  SearchResult,
  SearchHistory,
} from "@/lib/searchService";
import {taggingService, TagSuggestion} from "@/lib/taggingService";

export interface UseSearchResult {
  // Search state
  results: SearchResult[];
  isLoading: boolean;
  hasSearched: boolean;
  totalResults: number;

  // Search functions
  search: (filters: SearchFilters) => void;
  clearResults: () => void;

  // Filters state
  filters: SearchFilters;
  updateFilters: (newFilters: Partial<SearchFilters>) => void;
  resetFilters: () => void;

  // History
  searchHistory: SearchHistory[];
  clearSearchHistory: () => void;

  // Tags and categories
  allTags: string[];
  allCategories: string[];
  popularTags: Array<{tag: string; count: number}>;

  // Tagging functions
  generateTagSuggestions: (
    title: string,
    content?: string,
    existingTags?: string[],
  ) => TagSuggestion[];
  addTag: (itemId: string, tag: string) => void;
  removeTag: (itemId: string, tag: string) => void;
  toggleFavorite: (itemId: string) => boolean;

  // Smart collections
  smartCollections: {
    favorites: SearchResult[];
    recent: SearchResult[];
    untagged: SearchResult[];
    mostUsed: SearchResult[];
  };
}

const defaultFilters: SearchFilters = {
  query: "",
  tags: [],
  type: [],
  category: undefined,
  rating: undefined,
  dateRange: undefined,
  isFavorite: undefined,
  hasContent: undefined,
};

export function useSearch(): UseSearchResult {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<
    Array<{tag: string; count: number}>
  >([]);
  const [smartCollections, setSmartCollections] = useState({
    favorites: [] as SearchResult[],
    recent: [] as SearchResult[],
    untagged: [] as SearchResult[],
    mostUsed: [] as SearchResult[],
  });

  const loadSearchHistory = useCallback(() => {
    setSearchHistory(searchService.getSearchHistory());
  }, []);

  const loadTagsAndCategories = useCallback(() => {
    setAllTags(searchService.getAllTags());
    setAllCategories(searchService.getAllCategories());
    setPopularTags(taggingService.getPopularTags());
  }, []);

  const loadSmartCollections = useCallback(() => {
    // Favorites
    const favoritesResults = searchService.search({isFavorite: true});

    // Recent (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentResults = searchService.search({
      dateRange: {start: sevenDaysAgo},
    });

    // Untagged
    const untaggedResults = searchService
      .search({})
      .filter((result) => !result.item.tags || result.item.tags.length === 0);

    // Most used (based on search history frequency)
    const historyQueries = searchService.getSearchHistory();
    const queryFrequency = new Map<string, number>();

    historyQueries.forEach((history) => {
      if (history.query.length > 2) {
        queryFrequency.set(
          history.query,
          (queryFrequency.get(history.query) || 0) + 1,
        );
      }
    });

    const mostUsedQueries = Array.from(queryFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([query, _]) => query);

    const mostUsedResults: SearchResult[] = [];
    mostUsedQueries.forEach((query) => {
      const queryResults = searchService.search({query});
      mostUsedResults.push(...queryResults.slice(0, 2));
    });

    setSmartCollections({
      favorites: favoritesResults.slice(0, 10),
      recent: recentResults.slice(0, 10),
      untagged: untaggedResults.slice(0, 10),
      mostUsed: mostUsedResults.slice(0, 10),
    });
  }, []);

  // Load initial data
  useEffect(() => {
    loadSearchHistory();
    loadTagsAndCategories();
    loadSmartCollections();
  }, [loadSearchHistory, loadTagsAndCategories, loadSmartCollections]);

  // Update smart collections when search index changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadSmartCollections();
    }, 1000);

    return () => clearTimeout(timer);
  }, [results, loadSmartCollections]);

  const search = useCallback(
    async (searchFilters: SearchFilters) => {
      setIsLoading(true);
      setHasSearched(true);

      try {
        // Small delay to show loading state
        await new Promise((resolve) => setTimeout(resolve, 100));

        const searchResults = searchService.search(searchFilters);
        setResults(searchResults);

        // Update search history
        loadSearchHistory();
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [loadSearchHistory],
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setHasSearched(false);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((current) => ({...current, ...newFilters}));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const clearSearchHistory = useCallback(() => {
    searchService.clearSearchHistory();
    setSearchHistory([]);
  }, []);

  const generateTagSuggestions = useCallback(
    (
      title: string,
      content: string = "",
      existingTags: string[] = [],
    ): TagSuggestion[] => {
      return taggingService.generateSuggestions(title, content, existingTags);
    },
    [],
  );

  const addTag = useCallback(
    (itemId: string, tag: string) => {
      const validTag = taggingService.validateTag(tag);
      if (validTag) {
        searchService.addTag(itemId, validTag);
        loadTagsAndCategories();

        // Refresh results if currently showing
        if (hasSearched) {
          search(filters);
        }
      }
    },
    [filters, hasSearched, search, loadTagsAndCategories],
  );

  const removeTag = useCallback(
    (itemId: string, tag: string) => {
      searchService.removeTag(itemId, tag);
      loadTagsAndCategories();

      // Refresh results if currently showing
      if (hasSearched) {
        search(filters);
      }
    },
    [filters, hasSearched, search, loadTagsAndCategories],
  );

  const toggleFavorite = useCallback(
    (itemId: string): boolean => {
      const newStatus = searchService.toggleFavorite(itemId);

      // Refresh results and smart collections
      if (hasSearched) {
        search(filters);
      }
      loadSmartCollections();

      return newStatus;
    },
    [filters, hasSearched, search, loadSmartCollections],
  );

  // Auto-search when filters change (debounced)
  useEffect(() => {
    if (hasSearched || (filters.query && filters.query.trim().length > 0)) {
      const timer = setTimeout(() => {
        search(filters);
      }, 300); // 300ms debounce

      return () => clearTimeout(timer);
    }
  }, [filters, hasSearched, search]);

  return {
    // Search state
    results,
    isLoading,
    hasSearched,
    totalResults: results.length,

    // Search functions
    search,
    clearResults,

    // Filters state
    filters,
    updateFilters,
    resetFilters,

    // History
    searchHistory,
    clearSearchHistory,

    // Tags and categories
    allTags,
    allCategories,
    popularTags,

    // Tagging functions
    generateTagSuggestions,
    addTag,
    removeTag,
    toggleFavorite,

    // Smart collections
    smartCollections,
  };
}
