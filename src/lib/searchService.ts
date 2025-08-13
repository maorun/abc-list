import { SearchableItem, ListMetadata, WordWithExplanation } from "@/components/List/types";

export interface SearchFilters {
  query?: string;
  tags?: string[];
  type?: ('abc-list' | 'kawa' | 'kaga' | 'word')[];
  category?: string;
  rating?: number;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  isFavorite?: boolean;
  hasContent?: boolean; // Filter for items with/without content
}

export interface SearchResult {
  item: SearchableItem;
  score: number; // Relevance score 0-1
  highlights: string[]; // Highlighted text snippets
}

export interface SearchHistory {
  query: string;
  timestamp: number;
  resultCount: number;
}

class SearchService {
  private static instance: SearchService;
  private searchIndex: Map<string, SearchableItem> = new Map();
  private lastIndexUpdate = 0;
  private readonly SEARCH_HISTORY_KEY = "searchHistory";
  private readonly SEARCH_HISTORY_MAX = 50;

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Updates the search index with current data from localStorage
   */
  updateIndex(): void {
    this.searchIndex.clear();
    this.indexAbcLists();
    this.indexKawas();
    this.indexKagas();
    this.lastIndexUpdate = Date.now();
  }

  /**
   * Checks if index needs updating and updates if necessary
   */
  private ensureIndexUpdated(): void {
    // Update index if it's empty or older than 30 seconds
    if (this.searchIndex.size === 0 || Date.now() - this.lastIndexUpdate > 30000) {
      this.updateIndex();
    }
  }

  /**
   * Index ABC-Lists from localStorage
   */
  private indexAbcLists(): void {
    try {
      const abcListsStr = localStorage.getItem("abcLists");
      if (!abcListsStr) return;

      const abcLists: string[] = JSON.parse(abcListsStr);
      
      abcLists.forEach(listName => {
        // Index the list itself
        const listMetadata = this.getListMetadata(listName, 'abc-list');
        const listItem: SearchableItem = {
          id: `abc-list-${listName}`,
          type: 'abc-list',
          title: listName,
          content: listMetadata.description || '',
          tags: listMetadata.tags || [],
          metadata: listMetadata
        };
        this.searchIndex.set(listItem.id, listItem);

        // Index words in each letter
        const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));
        alphabet.forEach(letter => {
          const storageKey = `abcList-${listName}:${letter}`;
          const wordsStr = localStorage.getItem(storageKey);
          if (wordsStr) {
            try {
              const words: WordWithExplanation[] = JSON.parse(wordsStr);
              words.forEach((word, index) => {
                const wordItem: SearchableItem = {
                  id: `word-${listName}-${letter}-${index}`,
                  type: 'word',
                  title: word.text,
                  content: word.explanation || '',
                  tags: word.tags || [],
                  metadata: { ...listMetadata, type: 'abc-list' },
                  parentId: `abc-list-${listName}`,
                  letterContext: letter.toUpperCase()
                };
                this.searchIndex.set(wordItem.id, wordItem);
              });
            } catch (e) {
              console.warn(`Failed to parse words for ${storageKey}:`, e);
            }
          }
        });
      });
    } catch (e) {
      console.warn("Failed to index ABC-Lists:", e);
    }
  }

  /**
   * Index KaWa items from localStorage
   */
  private indexKawas(): void {
    try {
      const kawasStr = localStorage.getItem("Kawas");
      if (!kawasStr) return;

      const kawas = JSON.parse(kawasStr);
      if (Array.isArray(kawas)) {
        kawas.forEach(kawa => {
          const kawaMetadata = this.getListMetadata(kawa.key || kawa.text, 'kawa');
          const kawaItem: SearchableItem = {
            id: `kawa-${kawa.key}`,
            type: 'kawa',
            title: kawa.text || kawa.key,
            content: '',
            tags: kawaMetadata.tags || [],
            metadata: kawaMetadata
          };
          this.searchIndex.set(kawaItem.id, kawaItem);
        });
      }
    } catch (e) {
      console.warn("Failed to index KaWas:", e);
    }
  }

  /**
   * Index KaGa items from localStorage
   */
  private indexKagas(): void {
    try {
      const kagasStr = localStorage.getItem("Kagas");
      if (!kagasStr) return;

      const kagas = JSON.parse(kagasStr);
      if (Array.isArray(kagas)) {
        kagas.forEach(kaga => {
          const kagaMetadata = this.getListMetadata(kaga.key || kaga.text, 'kaga');
          const kagaItem: SearchableItem = {
            id: `kaga-${kaga.key}`,
            type: 'kaga',
            title: kaga.text || kaga.key,
            content: '',
            tags: kagaMetadata.tags || [],
            metadata: kagaMetadata
          };
          this.searchIndex.set(kagaItem.id, kagaItem);
        });
      }
    } catch (e) {
      console.warn("Failed to index KaGas:", e);
    }
  }

  /**
   * Get or create metadata for a list
   */
  private getListMetadata(name: string, type: 'abc-list' | 'kawa' | 'kaga'): ListMetadata {
    const metadataKey = `metadata-${type}-${name}`;
    const metadataStr = localStorage.getItem(metadataKey);
    
    if (metadataStr) {
      try {
        return JSON.parse(metadataStr);
      } catch (e) {
        console.warn(`Failed to parse metadata for ${metadataKey}:`, e);
      }
    }

    // Create default metadata
    const metadata: ListMetadata = {
      name,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      type,
      tags: [],
      isFavorite: false
    };

    localStorage.setItem(metadataKey, JSON.stringify(metadata));
    return metadata;
  }

  /**
   * Perform search with filters
   */
  search(filters: SearchFilters): SearchResult[] {
    this.ensureIndexUpdated();

    let results: SearchResult[] = [];
    
    for (const item of this.searchIndex.values()) {
      const score = this.calculateRelevanceScore(item, filters);
      if (score > 0) {
        const highlights = this.generateHighlights(item, filters.query);
        results.push({ item, score, highlights });
      }
    }

    // Sort by relevance score (descending)
    results.sort((a, b) => b.score - a.score);

    // Add to search history if query was provided
    if (filters.query && filters.query.trim()) {
      this.addToSearchHistory(filters.query, results.length);
    }

    return results;
  }

  /**
   * Calculate relevance score for an item against filters
   */
  private calculateRelevanceScore(item: SearchableItem, filters: SearchFilters): number {
    let score = 0;

    // Type filter
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(item.type)) {
        return 0;
      }
    }

    // Favorite filter
    if (filters.isFavorite !== undefined) {
      if (item.metadata.isFavorite !== filters.isFavorite) {
        return 0;
      }
    }

    // Category filter
    if (filters.category) {
      if (item.metadata.category !== filters.category) {
        return 0;
      }
    }

    // Rating filter
    if (filters.rating) {
      if (!item.metadata.rating || item.metadata.rating < filters.rating) {
        return 0;
      }
    }

    // Date range filter
    if (filters.dateRange) {
      const itemDate = new Date(item.metadata.created || item.metadata.lastModified || 0);
      if (filters.dateRange.start && itemDate < filters.dateRange.start) {
        return 0;
      }
      if (filters.dateRange.end && itemDate > filters.dateRange.end) {
        return 0;
      }
    }

    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        item.tags.some(itemTag => 
          itemTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (!hasMatchingTag) {
        return 0;
      }
      score += 0.3; // Boost for tag matches
    }

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(query);
      const contentMatch = item.content.toLowerCase().includes(query);
      const tagMatch = item.tags.some(tag => tag.toLowerCase().includes(query));

      if (!titleMatch && !contentMatch && !tagMatch) {
        return 0;
      }

      // Score based on match quality
      if (item.title.toLowerCase() === query) {
        score += 1.0; // Exact title match
      } else if (titleMatch) {
        score += 0.8; // Title contains query
      }

      if (contentMatch) {
        score += 0.5; // Content contains query
      }

      if (tagMatch) {
        score += 0.4; // Tag contains query
      }
    } else {
      // No query provided, base score
      score = 0.1;
    }

    // Boost favorites
    if (item.metadata.isFavorite) {
      score += 0.2;
    }

    // Boost recent items
    if (item.metadata.lastModified) {
      const daysSinceModified = (Date.now() - new Date(item.metadata.lastModified).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceModified < 7) {
        score += 0.1;
      }
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Generate highlighted text snippets
   */
  private generateHighlights(item: SearchableItem, query?: string): string[] {
    const highlights: string[] = [];

    if (!query) {
      if (item.content) {
        highlights.push(item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''));
      }
      return highlights;
    }

    const queryLower = query.toLowerCase();
    
    // Check title
    if (item.title.toLowerCase().includes(queryLower)) {
      highlights.push(this.highlightText(item.title, query));
    }

    // Check content
    if (item.content && item.content.toLowerCase().includes(queryLower)) {
      const snippet = this.extractSnippet(item.content, query);
      highlights.push(this.highlightText(snippet, query));
    }

    // Check tags
    const matchingTags = item.tags.filter(tag => tag.toLowerCase().includes(queryLower));
    if (matchingTags.length > 0) {
      highlights.push(`Tags: ${matchingTags.map(tag => this.highlightText(tag, query)).join(', ')}`);
    }

    return highlights;
  }

  /**
   * Extract text snippet around query match
   */
  private extractSnippet(text: string, query: string, maxLength = 150): string {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(queryLower);
    
    if (index === -1) return text.substring(0, maxLength);

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, start + maxLength);
    
    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet;
  }

  /**
   * Highlight query terms in text
   */
  private highlightText(text: string, query: string): string {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Get search history
   */
  getSearchHistory(): SearchHistory[] {
    try {
      const historyStr = localStorage.getItem(this.SEARCH_HISTORY_KEY);
      if (historyStr) {
        return JSON.parse(historyStr);
      }
    } catch (e) {
      console.warn("Failed to load search history:", e);
    }
    return [];
  }

  /**
   * Add query to search history
   */
  private addToSearchHistory(query: string, resultCount: number): void {
    try {
      let history = this.getSearchHistory();
      
      // Remove duplicate if exists
      history = history.filter(item => item.query !== query);
      
      // Add new entry at the beginning
      history.unshift({
        query,
        timestamp: Date.now(),
        resultCount
      });

      // Limit history size
      if (history.length > this.SEARCH_HISTORY_MAX) {
        history = history.slice(0, this.SEARCH_HISTORY_MAX);
      }

      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn("Failed to save search history:", e);
    }
  }

  /**
   * Clear search history
   */
  clearSearchHistory(): void {
    localStorage.removeItem(this.SEARCH_HISTORY_KEY);
  }

  /**
   * Get all unique tags
   */
  getAllTags(): string[] {
    this.ensureIndexUpdated();
    const tagsSet = new Set<string>();
    
    for (const item of this.searchIndex.values()) {
      item.tags.forEach(tag => tagsSet.add(tag));
    }

    return Array.from(tagsSet).sort();
  }

  /**
   * Get all unique categories
   */
  getAllCategories(): string[] {
    this.ensureIndexUpdated();
    const categoriesSet = new Set<string>();
    
    for (const item of this.searchIndex.values()) {
      if (item.metadata.category) {
        categoriesSet.add(item.metadata.category);
      }
    }

    return Array.from(categoriesSet).sort();
  }

  /**
   * Update item metadata
   */
  updateMetadata(itemId: string, metadata: Partial<ListMetadata>): void {
    const item = this.searchIndex.get(itemId);
    if (item) {
      item.metadata = { ...item.metadata, ...metadata, lastModified: new Date().toISOString() };
      
      // Save to localStorage
      const metadataKey = `metadata-${item.type}-${item.metadata.name}`;
      localStorage.setItem(metadataKey, JSON.stringify(item.metadata));
      
      // Update index
      this.searchIndex.set(itemId, item);
    }
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(itemId: string): boolean {
    const item = this.searchIndex.get(itemId);
    if (item) {
      const newFavoriteStatus = !item.metadata.isFavorite;
      this.updateMetadata(itemId, { isFavorite: newFavoriteStatus });
      return newFavoriteStatus;
    }
    return false;
  }

  /**
   * Add tag to item
   */
  addTag(itemId: string, tag: string): void {
    const item = this.searchIndex.get(itemId);
    if (item) {
      const currentTags = item.tags || [];
      if (!currentTags.includes(tag)) {
        const newTags = [...currentTags, tag];
        item.tags = newTags;
        this.updateMetadata(itemId, { tags: newTags });
      }
    }
  }

  /**
   * Remove tag from item
   */
  removeTag(itemId: string, tag: string): void {
    const item = this.searchIndex.get(itemId);
    if (item) {
      const newTags = (item.tags || []).filter(t => t !== tag);
      item.tags = newTags;
      this.updateMetadata(itemId, { tags: newTags });
    }
  }
}

export const searchService = SearchService.getInstance();