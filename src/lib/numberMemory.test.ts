import {describe, it, expect} from "vitest";
import {
  numberToMajorWord,
  getConsonantsForNumber,
  wordMatchesMajorSystem,
  generateTrainingNumber,
  calculateStats,
  MAJOR_SYSTEM_MAPPING,
  DEFAULT_NUMBER_IMAGES,
} from "./numberMemory";

describe("numberMemory utilities", () => {
  describe("MAJOR_SYSTEM_MAPPING", () => {
    it("should have mappings for all digits 0-9", () => {
      for (let i = 0; i <= 9; i++) {
        expect(MAJOR_SYSTEM_MAPPING[i]).toBeDefined();
        expect(MAJOR_SYSTEM_MAPPING[i].length).toBeGreaterThan(0);
      }
    });
  });

  describe("DEFAULT_NUMBER_IMAGES", () => {
    it("should have preset associations", () => {
      expect(DEFAULT_NUMBER_IMAGES[0]).toBe("Sonne");
      expect(DEFAULT_NUMBER_IMAGES[1]).toBe("Tee");
      expect(DEFAULT_NUMBER_IMAGES[10]).toBe("Dose");
    });
  });

  describe("numberToMajorWord", () => {
    it("should convert single digits to consonants", () => {
      expect(numberToMajorWord(0)).toBe("s");
      expect(numberToMajorWord(1)).toBe("t");
      expect(numberToMajorWord(5)).toBe("l");
    });

    it("should convert multi-digit numbers", () => {
      expect(numberToMajorWord(10)).toBe("t-s");
      expect(numberToMajorWord(42)).toBe("r-n");
    });

    it("should handle string input", () => {
      expect(numberToMajorWord("123")).toBe("t-n-m");
    });
  });

  describe("getConsonantsForNumber", () => {
    it("should return consonant options for each digit", () => {
      const result = getConsonantsForNumber(10);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(["t", "d"]);
      expect(result[1]).toEqual(["s", "z"]);
    });

    it("should handle string numbers", () => {
      const result = getConsonantsForNumber("42");
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(["r"]);
      expect(result[1]).toEqual(["n"]);
    });
  });

  describe("wordMatchesMajorSystem", () => {
    it("should validate correct Major System words", () => {
      expect(wordMatchesMajorSystem("Tee", 1)).toBe(true);
      expect(wordMatchesMajorSystem("tee", 1)).toBe(true);
      expect(wordMatchesMajorSystem("Dose", 10)).toBe(true);
    });

    it("should reject words with wrong consonants", () => {
      // "Auto" starts with vowel, then "t" - might match 1, but "u" is a vowel
      // The Major System ignores vowels, so "Auto" could theoretically match 1 (t)
      // Let's use clearer examples:
      expect(wordMatchesMajorSystem("Ball", 1)).toBe(false); // B=9, not 1
      expect(wordMatchesMajorSystem("Maus", 10)).toBe(false); // M=3, not 1
    });

    it("should be case-insensitive", () => {
      expect(wordMatchesMajorSystem("TEE", 1)).toBe(true);
      expect(wordMatchesMajorSystem("DoSe", 10)).toBe(true);
    });
  });

  describe("generateTrainingNumber", () => {
    it("should generate phone numbers with 10 digits", () => {
      const phone = generateTrainingNumber("phone");
      expect(phone).toHaveLength(10);
      expect(/^\d{10}$/.test(phone)).toBe(true);
    });

    it("should generate dates in DDMMYYYY format", () => {
      const date = generateTrainingNumber("date");
      expect(date).toHaveLength(8);
      expect(/^\d{8}$/.test(date)).toBe(true);

      const day = parseInt(date.slice(0, 2));
      const month = parseInt(date.slice(2, 4));
      expect(day).toBeGreaterThanOrEqual(1);
      expect(day).toBeLessThanOrEqual(28);
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
    });

    it("should generate 4-digit PINs", () => {
      const pin = generateTrainingNumber("pin");
      expect(pin).toHaveLength(4);
      expect(/^\d{4}$/.test(pin)).toBe(true);
    });

    it("should generate custom numbers with 6-8 digits", () => {
      const custom = generateTrainingNumber("custom");
      expect(custom.length).toBeGreaterThanOrEqual(6);
      expect(custom.length).toBeLessThanOrEqual(8);
      expect(/^\d+$/.test(custom)).toBe(true);
    });
  });

  describe("calculateStats", () => {
    it("should calculate statistics from sessions", () => {
      const sessions = [
        {
          id: "1",
          type: "pin" as const,
          numberToMemorize: "1234",
          userAnswer: "1234",
          isCorrect: true,
          timeSpent: 10,
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          type: "phone" as const,
          numberToMemorize: "0123456789",
          userAnswer: "0123456789",
          isCorrect: true,
          timeSpent: 30,
          timestamp: new Date().toISOString(),
        },
        {
          id: "3",
          type: "pin" as const,
          numberToMemorize: "5678",
          userAnswer: "1234",
          isCorrect: false,
          timeSpent: 15,
          timestamp: new Date().toISOString(),
        },
      ];

      const associations = [
        {
          number: "1234",
          image: "Test",
          isCustom: true,
          createdAt: new Date().toISOString(),
          reviewCount: 5,
        },
      ];

      const stats = calculateStats(sessions, associations);

      expect(stats.totalTrainingSessions).toBe(3);
      expect(stats.successRate).toBeCloseTo(2 / 3);
      expect(stats.longestNumberMemorized).toBe(10);
      expect(stats.favoriteNumberType).toBe("pin");
      expect(stats.customAssociationsCount).toBe(1);
      expect(stats.totalReviewCount).toBe(5);
    });

    it("should handle empty data", () => {
      const stats = calculateStats([], []);

      expect(stats.totalTrainingSessions).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.averageTimePerDigit).toBe(0);
      expect(stats.longestNumberMemorized).toBe(0);
    });

    it("should calculate average time per digit correctly", () => {
      const sessions = [
        {
          id: "1",
          type: "pin" as const,
          numberToMemorize: "12",
          userAnswer: "12",
          isCorrect: true,
          timeSpent: 10,
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          type: "pin" as const,
          numberToMemorize: "34",
          userAnswer: "34",
          isCorrect: true,
          timeSpent: 20,
          timestamp: new Date().toISOString(),
        },
      ];

      const stats = calculateStats(sessions, []);
      // Total time: 30, Total digits: 4, Average: 7.5
      expect(stats.averageTimePerDigit).toBe(7.5);
    });
  });
});
