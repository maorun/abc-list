export interface WordWithExplanation {
  text: string;
  explanation?: string;
  version?: number;
  imported?: boolean;
  timestamp?: number; // For statistics tracking
}

export interface ColumnConfig {
  id: string;
  theme: string;
  timeLimit?: number; // in minutes, undefined means no limit
  isSpecialty?: boolean; // true for the prediction column
  color?: string; // hex color for visual distinction
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
