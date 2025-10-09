// Zahlen-Merk-System (Major System) - Data structures and utilities
// Based on Vera F. Birkenbihl's number memory methodology

// Storage keys
export const NUMBER_MEMORY_STORAGE_KEYS = {
  CUSTOM_ASSOCIATIONS: "numberMemory-customAssociations",
  TRAINING_HISTORY: "numberMemory-trainingHistory",
  STATISTICS: "numberMemory-statistics",
} as const;

// Major System consonant mapping (German version)
// Each digit maps to one or more consonants based on sound similarity
export const MAJOR_SYSTEM_MAPPING: Record<number, string[]> = {
  0: ["s", "z"], // soft S sound
  1: ["t", "d"], // T/D dental sounds
  2: ["n"], // N nasal
  3: ["m"], // M nasal
  4: ["r"], // R rolling sound
  5: ["l"], // L liquid
  6: ["ch", "j", "sch"], // CH/J/SCH soft sounds
  7: ["k", "g"], // K/G hard sounds
  8: ["f", "v", "w"], // F/V/W fricatives
  9: ["p", "b"], // P/B labial sounds
};

// Preset number-to-image associations (German examples)
export const DEFAULT_NUMBER_IMAGES: Record<number, string> = {
  0: "Sonne", // 0 = S
  1: "Tee", // 1 = T
  2: "Noah", // 2 = N
  3: "Mai", // 3 = M
  4: "Reh", // 4 = R
  5: "Leu (Löwe)", // 5 = L
  6: "Schuh", // 6 = SCH
  7: "Kuh", // 7 = K
  8: "Fee", // 8 = F
  9: "Bau", // 9 = B
  10: "Dose", // 1=T, 0=S
  11: "Tote", // 1=T, 1=T
  12: "Tanne", // 1=T, 2=N
  13: "Damm", // 1=T, 3=M
  14: "Tür", // 1=T, 4=R
  15: "Tal", // 1=T, 5=L
  16: "Tasche", // 1=T, 6=SCH
  17: "Tüte (Tüte)", // 1=T, 7=T (variant: Tüte/Tüte)
  18: "Teig", // 1=T, 8=F (variant: Tuff)
  19: "Tube", // 1=T, 9=B
  20: "Nase", // 2=N, 0=S
};

export interface NumberAssociation {
  number: string; // The number as string (e.g., "42", "0815")
  image: string; // The associated image/word
  story?: string; // Optional mnemonic story
  isCustom: boolean; // User-created or preset
  createdAt: string;
  lastReviewed?: string;
  reviewCount: number;
}

export interface TrainingSession {
  id: string;
  type: "phone" | "date" | "pin" | "custom";
  numberToMemorize: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  timestamp: string;
}

export interface NumberMemoryStats {
  totalTrainingSessions: number;
  successRate: number;
  averageTimePerDigit: number;
  longestNumberMemorized: number;
  favoriteNumberType: string;
  customAssociationsCount: number;
  totalReviewCount: number;
}

// Convert number to suggested word using Major System
export function numberToMajorWord(num: number | string): string {
  const digits = num.toString().split("").map(Number);
  const consonants: string[] = [];

  for (const digit of digits) {
    const options = MAJOR_SYSTEM_MAPPING[digit];
    if (options && options.length > 0) {
      // Pick first consonant for simplicity
      consonants.push(options[0]);
    }
  }

  // For now, return consonants - in full implementation, would add vowels
  return consonants.join("-");
}

// Get consonants for a number (for building custom words)
export function getConsonantsForNumber(num: number | string): string[][] {
  const digits = num.toString().split("").map(Number);
  return digits.map((digit) => MAJOR_SYSTEM_MAPPING[digit] || []);
}

// Check if a word matches the Major System for a number
export function wordMatchesMajorSystem(
  word: string,
  num: number | string,
): boolean {
  const digits = num.toString().split("").map(Number);
  const wordLower = word.toLowerCase();
  let wordPos = 0;

  for (const digit of digits) {
    const consonants = MAJOR_SYSTEM_MAPPING[digit];
    let matched = false;

    // Skip vowels (a, e, i, o, u, ä, ö, ü) in the word
    while (
      wordPos < wordLower.length &&
      /[aeiouäöü]/.test(wordLower[wordPos])
    ) {
      wordPos++;
    }

    // Try to match any of the consonants for this digit
    for (const cons of consonants) {
      if (wordLower.slice(wordPos, wordPos + cons.length) === cons) {
        wordPos += cons.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      return false;
    }
  }

  return true;
}

// Generate training number based on type
export function generateTrainingNumber(type: TrainingSession["type"]): string {
  switch (type) {
    case "phone":
      // German phone number format (without country code)
      return Array.from({length: 10}, () =>
        Math.floor(Math.random() * 10),
      ).join("");
    case "date":
      // Date in DDMMYYYY format
      const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
      const year = String(Math.floor(Math.random() * 100) + 1950);
      return day + month + year;
    case "pin":
      // 4-digit PIN
      return Array.from({length: 4}, () => Math.floor(Math.random() * 10)).join(
        "",
      );
    case "custom":
      // Random 6-8 digits
      const length = Math.floor(Math.random() * 3) + 6;
      return Array.from({length}, () => Math.floor(Math.random() * 10)).join(
        "",
      );
    default:
      return "1234";
  }
}

// Calculate statistics
export function calculateStats(
  sessions: TrainingSession[],
  associations: NumberAssociation[],
): NumberMemoryStats {
  const totalSessions = sessions.length;
  const correctSessions = sessions.filter((s) => s.isCorrect).length;
  const successRate = totalSessions > 0 ? correctSessions / totalSessions : 0;

  const totalTime = sessions.reduce((sum, s) => sum + s.timeSpent, 0);
  const totalDigits = sessions.reduce(
    (sum, s) => sum + s.numberToMemorize.length,
    0,
  );
  const avgTimePerDigit = totalDigits > 0 ? totalTime / totalDigits : 0;

  const longestNumber = sessions.reduce(
    (max, s) => Math.max(max, s.numberToMemorize.length),
    0,
  );

  const typeCounts = sessions.reduce(
    (counts, s) => {
      counts[s.type] = (counts[s.type] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>,
  );

  const favoriteType =
    Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    "custom";

  const totalReviews = associations.reduce((sum, a) => sum + a.reviewCount, 0);

  return {
    totalTrainingSessions: totalSessions,
    successRate,
    averageTimePerDigit: avgTimePerDigit,
    longestNumberMemorized: longestNumber,
    favoriteNumberType: favoriteType,
    customAssociationsCount: associations.filter((a) => a.isCustom).length,
    totalReviewCount: totalReviews,
  };
}
