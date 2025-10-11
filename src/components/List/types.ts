export interface WordWithExplanation {
  text: string;
  explanation?: string;
  version?: number;
  imported?: boolean;
  timestamp?: number; // For statistics tracking
  tags?: string[]; // Tags for categorization
  isFavorite?: boolean; // Favorite flag
  repetitionCount?: number; // Spaced repetition data
  easeFactor?: number;
  interval?: number;
  nextReviewDate?: string;
  // Dual-Coding Support: Visual elements for enhanced learning
  emoji?: string; // Unicode emoji for visual association
  symbol?: string; // Symbol ID from symbol library
  imageUrl?: string; // External image URL for visual learning
}

export interface ColumnConfig {
  id: string;
  theme: string;
  timeLimit?: number; // in minutes, undefined means no limit
  isSpecialty?: boolean; // true for the prediction column
  color?: string; // hex color for visual distinction
}

export interface ListMetadata {
  name: string;
  created: string;
  lastModified: string;
  tags?: string[];
  isFavorite?: boolean;
  category?: string;
  rating?: number; // 1-5 star rating
  description?: string;
  type: "abc-list" | "kawa" | "kaga" | "multi-column";
}

export interface SearchableItem {
  id: string;
  type: "abc-list" | "kawa" | "kaga" | "word";
  title: string;
  content: string;
  tags: string[];
  metadata: ListMetadata | Partial<ListMetadata>;
  parentId?: string; // For words, this is the list they belong to
  letterContext?: string; // For words, which letter they're under
}

export interface MultiColumnListData {
  name: string;
  columns: ColumnConfig[];
  created: string;
  lastModified: string;
  statistics?: ColumnStatistics[];
}

export interface ColumnStatistics {
  columnId: string;
  totalWords: number;
  averageWordsPerLetter: number;
  completionPercentage: number; // percentage of letters with at least one word
  averageTimePerWord?: number; // if time tracking is enabled
  predictions?: PredictionData[]; // for specialty columns
}

export interface PredictionData {
  letter: string;
  predictedWords: string[];
  actualWords: string[];
  accuracy: number; // percentage of correct predictions
}

// For storage keys
export const MULTI_COLUMN_CACHE_KEY = "multiColumnLists";
export const getMultiColumnStorageKey = (
  listName: string,
  columnId: string,
  letter: string,
): string => {
  return `multiColumn-${listName}-${columnId}:${letter}`;
};
export const getMultiColumnMetaKey = (listName: string): string => {
  return `multiColumnMeta-${listName}`;
};
