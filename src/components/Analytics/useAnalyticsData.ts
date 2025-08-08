import {useState, useEffect, useCallback} from "react";

export interface ABCListData {
  name: string;
  words: Record<
    string,
    Array<{word: string; explanation?: string; timestamp?: number}>
  >;
  createdAt?: number;
  lastModified?: number;
}

export interface KawaData {
  key: string;
  text: string;
  createdAt?: number;
  letters?: Record<string, string>;
}

export interface KagaData {
  key: string;
  text: string;
  createdAt?: number;
  drawingData?: Record<string, unknown>;
}

export interface StadtLandFlussData {
  name: string;
  games?: Array<{
    rounds: number;
    avgScore: number;
    completionRate: number;
    timestamp: number;
  }>;
  createdAt?: number;
}

export interface AnalyticsData {
  abcLists: ABCListData[];
  kawas: KawaData[];
  kagas: KagaData[];
  stadtLandFlussGames: StadtLandFlussData[];
  totalWords: number;
  totalLists: number;
  averageWordsPerList: number;
  mostActiveLetters: Array<{letter: string; count: number}>;
  learningStreak: number;
  lastActivityDate: Date | null;
  knowledgeAreas: Array<{area: string; count: number; strength: number}>;
}

const loadABCLists = (): ABCListData[] => {
  const listsJson = localStorage.getItem("abcLists");
  if (!listsJson) return [];

  let listNames: string[];
  try {
    listNames = JSON.parse(listsJson);
  } catch {
    return [];
  }
  return listNames.map((name) => {
    const listData: ABCListData = {
      name,
      words: {},
      // Don't set a misleading creation date - leave undefined if not available
      createdAt: undefined,
    };

    // Load words for each letter
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(97 + i);
      const storageKey = `abcList-${name}:${letter}`;
      const letterData = localStorage.getItem(storageKey);

      if (letterData) {
        try {
          const parsed = JSON.parse(letterData);
          listData.words[letter] = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // Handle old format
          listData.words[letter] = [{word: letterData}];
        }
      }
    }

    return listData;
  });
};

const loadKawas = (): KawaData[] => {
  const kawasJson = localStorage.getItem("Kawas");
  if (!kawasJson) return [];

  try {
    return JSON.parse(kawasJson);
  } catch {
    return [];
  }
};

const loadKagas = (): KagaData[] => {
  // Similar implementation to Kawas
  // For now, return empty array as the exact storage format needs to be checked
  return [];
};

const loadStadtLandFlussGames = (): StadtLandFlussData[] => {
  const gamesJson = localStorage.getItem("slfGames");
  if (!gamesJson) return [];

  try {
    const gameNames: string[] = JSON.parse(gamesJson);
    return gameNames.map((name) => ({
      name,
      // Don't set a misleading creation date - leave undefined if not available
      createdAt: undefined,
      games: [], // Would need to load individual game data
    }));
  } catch {
    return [];
  }
};

const calculateTotalWords = (abcLists: ABCListData[]): number => {
  return abcLists.reduce((total, list) => {
    const wordsInList = Object.values(list.words).reduce(
      (listTotal, letterWords) => {
        return listTotal + letterWords.length;
      },
      0,
    );
    return total + wordsInList;
  }, 0);
};

const calculateMostActiveLetters = (
  abcLists: ABCListData[],
): Array<{letter: string; count: number}> => {
  const letterCounts: Record<string, number> = {};

  abcLists.forEach((list) => {
    Object.entries(list.words).forEach(([letter, words]) => {
      letterCounts[letter] = (letterCounts[letter] || 0) + words.length;
    });
  });

  return Object.entries(letterCounts)
    .map(([letter, count]) => ({letter: letter.toUpperCase(), count}))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

const identifyKnowledgeAreas = (
  abcLists: ABCListData[],
  kawas: KawaData[],
  kagas: KagaData[],
): Array<{area: string; count: number; strength: number}> => {
  const areas: Record<string, {count: number; totalWords: number}> = {};

  // Analyze ABC list topics
  abcLists.forEach((list) => {
    const area = list.name;
    const wordCount = Object.values(list.words).reduce(
      (sum, words) => sum + words.length,
      0,
    );

    if (!areas[area]) {
      areas[area] = {count: 0, totalWords: 0};
    }
    areas[area].count++;
    areas[area].totalWords += wordCount;
  });

  // Add Kawas and Kagas as areas
  kawas.forEach((kawa) => {
    const area = `KaWa: ${kawa.text}`;
    if (!areas[area]) {
      areas[area] = {count: 0, totalWords: 0};
    }
    areas[area].count++;
  });

  kagas.forEach((kaga) => {
    const area = `KaGa: ${kaga.text}`;
    if (!areas[area]) {
      areas[area] = {count: 0, totalWords: 0};
    }
    areas[area].count++;
  });

  return Object.entries(areas)
    .map(([area, data]) => ({
      area,
      count: data.count,
      strength: data.totalWords / Math.max(data.count, 1), // average words per list in this area
    }))
    .sort((a, b) => b.strength - a.strength);
};

const getLastActivityDate = (
  abcLists: ABCListData[],
  kawas: KawaData[],
  kagas: KagaData[],
  slfGames: StadtLandFlussData[],
): Date | null => {
  const dates = [
    ...abcLists.map((list) => list.lastModified || list.createdAt || 0),
    ...kawas.map((kawa) => kawa.createdAt || 0),
    ...kagas.map((kaga) => kaga.createdAt || 0),
    ...slfGames.map((game) => game.createdAt || 0),
  ].filter((date) => date > 0);

  if (dates.length === 0) return null;
  return new Date(Math.max(...dates));
};

const calculateLearningStreak = (lastActivityDate: Date | null): number => {
  if (!lastActivityDate) return 0;

  const today = new Date();
  const diffTime = today.getTime() - lastActivityDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Simple streak calculation - could be enhanced with more sophisticated logic
  return diffDays <= 1 ? 1 : 0;
};

export function useAnalyticsData(): AnalyticsData {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    abcLists: [],
    kawas: [],
    kagas: [],
    stadtLandFlussGames: [],
    totalWords: 0,
    totalLists: 0,
    averageWordsPerList: 0,
    mostActiveLetters: [],
    learningStreak: 0,
    lastActivityDate: null,
    knowledgeAreas: [],
  });

  const loadAnalyticsData = useCallback(() => {
    // Load ABC Lists
    const abcListsData = loadABCLists();

    // Load Kawas
    const kawasData = loadKawas();

    // Load Kagas
    const kagasData = loadKagas();

    // Load Stadt-Land-Fluss games
    const slfData = loadStadtLandFlussGames();

    // Calculate analytics
    const totalWords = calculateTotalWords(abcListsData);
    const totalLists =
      abcListsData.length + kawasData.length + kagasData.length;
    const averageWordsPerList = totalLists > 0 ? totalWords / totalLists : 0;
    const mostActiveLetters = calculateMostActiveLetters(abcListsData);
    const knowledgeAreas = identifyKnowledgeAreas(
      abcListsData,
      kawasData,
      kagasData,
    );
    const lastActivityDate = getLastActivityDate(
      abcListsData,
      kawasData,
      kagasData,
      slfData,
    );
    const learningStreak = calculateLearningStreak(lastActivityDate);

    setAnalyticsData({
      abcLists: abcListsData,
      kawas: kawasData,
      kagas: kagasData,
      stadtLandFlussGames: slfData,
      totalWords,
      totalLists,
      averageWordsPerList,
      mostActiveLetters,
      learningStreak,
      lastActivityDate,
      knowledgeAreas,
    });
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  return analyticsData;
}
