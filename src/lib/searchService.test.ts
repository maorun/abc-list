import {describe, it, expect, beforeEach} from "vitest";
import {searchService, SearchService} from "./searchService";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => (store[key] = value),
    removeItem: (key: string) => delete store[key],
    clear: () => (store = {}),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("SearchService", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    // Reset singleton instance
    SearchService.resetForTesting();
  });

  describe("Index Building", () => {
    it("should build index from localStorage data", () => {
      // Setup test data
      mockLocalStorage.setItem("abcLists", JSON.stringify(["TestList"]));
      mockLocalStorage.setItem(
        "abcList-TestList:a",
        JSON.stringify([
          {text: "Apple", explanation: "Red fruit"},
          {text: "Ant", explanation: "Small insect"},
        ]),
      );
      mockLocalStorage.setItem(
        "Kawas",
        JSON.stringify([{key: "WORD", text: "WORD"}]),
      );
      mockLocalStorage.setItem(
        "Kagas",
        JSON.stringify([{key: "Drawing1", text: "Drawing1"}]),
      );

      searchService.updateIndex();

      const results = searchService.search({query: "Apple"});
      expect(results).toHaveLength(1);
      expect(results[0].item.title).toBe("Apple");
      expect(results[0].item.type).toBe("word");
    });

    it("should index ABC-Lists metadata", () => {
      mockLocalStorage.setItem("abcLists", JSON.stringify(["MathList"]));

      searchService.updateIndex();

      const results = searchService.search({query: "MathList"});
      expect(results).toHaveLength(1);
      expect(results[0].item.title).toBe("MathList");
      expect(results[0].item.type).toBe("abc-list");
    });
  });

  describe("Search Functionality", () => {
    beforeEach(() => {
      // Setup comprehensive test data
      mockLocalStorage.setItem(
        "abcLists",
        JSON.stringify(["Animals", "Science"]),
      );
      mockLocalStorage.setItem(
        "abcList-Animals:a",
        JSON.stringify([
          {
            text: "Ant",
            explanation: "Small insect",
            tags: ["insects", "nature"],
          },
          {text: "Apple", explanation: "Red fruit", tags: ["fruits"]},
        ]),
      );
      mockLocalStorage.setItem(
        "abcList-Science:b",
        JSON.stringify([
          {
            text: "Biology",
            explanation: "Study of life",
            tags: ["science", "education"],
          },
        ]),
      );

      // Create metadata
      mockLocalStorage.setItem(
        "metadata-abc-list-Animals",
        JSON.stringify({
          name: "Animals",
          created: "2024-01-01T00:00:00.000Z",
          lastModified: "2024-01-02T00:00:00.000Z",
          type: "abc-list",
          tags: ["nature", "learning"],
          isFavorite: true,
          category: "Education",
          rating: 4,
        }),
      );

      mockLocalStorage.setItem(
        "metadata-abc-list-Science",
        JSON.stringify({
          name: "Science",
          created: "2024-01-01T00:00:00.000Z",
          lastModified: "2024-01-02T00:00:00.000Z",
          type: "abc-list",
          tags: ["science", "study"],
          isFavorite: false,
          category: "Research",
          rating: 3,
        }),
      );

      searchService.updateIndex();
    });

    it("should find items by exact text match", () => {
      const results = searchService.search({query: "Ant"});
      expect(results).toHaveLength(1);
      expect(results[0].item.title).toBe("Ant");
      expect(results[0].score).toBeGreaterThan(0.8);
    });

    it("should find items by partial text match", () => {
      const results = searchService.search({query: "Bio"});
      expect(results).toHaveLength(1);
      expect(results[0].item.title).toBe("Biology");
    });

    it("should find items by explanation content", () => {
      const results = searchService.search({query: "fruit"});
      expect(results).toHaveLength(1);
      expect(results[0].item.title).toBe("Apple");
    });

    it("should find items by tags", () => {
      const results = searchService.search({query: "education"});
      expect(results).toHaveLength(1);
      expect(results[0].item.title).toBe("Biology");
    });

    it("should filter by type", () => {
      const results = searchService.search({type: ["word"]});
      expect(results).toHaveLength(3); // Ant, Apple, Biology
      results.forEach((result) => {
        expect(result.item.type).toBe("word");
      });
    });

    it("should filter by favorites", () => {
      const results = searchService.search({
        isFavorite: true,
        type: ["abc-list"],
      });
      expect(results).toHaveLength(1);
      expect(results[0].item.title).toBe("Animals");
    });

    it("should filter by tags", () => {
      const results = searchService.search({tags: ["nature"]});
      expect(results).toHaveLength(2); // Animals list and Ant word
    });

    it("should filter by category", () => {
      const results = searchService.search({
        category: "Education",
        type: ["abc-list"],
      });
      expect(results).toHaveLength(1);
      expect(results[0].item.title).toBe("Animals");
    });

    it("should filter by rating", () => {
      const results = searchService.search({rating: 4, type: ["abc-list"]});
      expect(results).toHaveLength(1);
      expect(results[0].item.title).toBe("Animals");
    });

    it("should combine multiple filters", () => {
      const results = searchService.search({
        type: ["abc-list"],
        isFavorite: true,
        category: "Education",
      });
      expect(results).toHaveLength(1);
      expect(results[0].item.title).toBe("Animals");
    });

    it("should return no results for non-matching filters", () => {
      const results = searchService.search({
        type: ["kawa"],
        isFavorite: true,
      });
      expect(results).toHaveLength(0);
    });
  });

  describe("Scoring and Ranking", () => {
    beforeEach(() => {
      mockLocalStorage.setItem("abcLists", JSON.stringify(["Test"]));
      mockLocalStorage.setItem(
        "abcList-Test:a",
        JSON.stringify([
          {text: "Apple", explanation: "A red apple fruit"},
          {text: "Green Apple", explanation: "Another type of apple"},
        ]),
      );

      mockLocalStorage.setItem(
        "metadata-abc-list-Test",
        JSON.stringify({
          name: "Test",
          created: "2024-01-01T00:00:00.000Z",
          type: "abc-list",
          isFavorite: false,
        }),
      );

      searchService.updateIndex();
    });

    it("should rank exact matches higher", () => {
      const results = searchService.search({query: "Apple"});
      expect(results).toHaveLength(2);
      expect(results[0].item.title).toBe("Apple");
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });

    it("should boost favorites", () => {
      // Make Apple a favorite
      searchService.toggleFavorite("word-Test-a-0");

      const results = searchService.search({query: "App"});
      expect(results).toHaveLength(2);

      const appleResult = results.find((r) => r.item.title === "Apple");
      const appResult = results.find((r) => r.item.title === "Application");

      expect(appleResult?.score).toBeGreaterThan(appResult?.score || 0);
    });
  });

  describe("Tag Management", () => {
    beforeEach(() => {
      mockLocalStorage.setItem("abcLists", JSON.stringify(["Test"]));
      mockLocalStorage.setItem(
        "abcList-Test:a",
        JSON.stringify([{text: "Apple", explanation: "Red fruit"}]),
      );
      searchService.updateIndex();
    });

    it("should add tags to items", () => {
      searchService.addTag("word-Test-a-0", "fruit");

      const results = searchService.search({tags: ["fruit"]});
      expect(results).toHaveLength(1);
      expect(results[0].item.title).toBe("Apple");
    });

    it("should remove tags from items", () => {
      searchService.addTag("word-Test-a-0", "fruit");
      searchService.removeTag("word-Test-a-0", "fruit");

      const results = searchService.search({tags: ["fruit"]});
      expect(results).toHaveLength(0);
    });

    it("should toggle favorite status", () => {
      const isFavorite = searchService.toggleFavorite("word-Test-a-0");
      expect(isFavorite).toBe(true);

      const isNotFavorite = searchService.toggleFavorite("word-Test-a-0");
      expect(isNotFavorite).toBe(false);
    });
  });

  describe("Search History", () => {
    it("should track search history", () => {
      searchService.search({query: "test query"});

      const history = searchService.getSearchHistory();
      expect(history).toHaveLength(1);
      expect(history[0].query).toBe("test query");
    });

    it("should limit history size", () => {
      // Add more than the max limit
      for (let i = 0; i < 55; i++) {
        searchService.search({query: `query ${i}`});
      }

      const history = searchService.getSearchHistory();
      expect(history.length).toBeLessThanOrEqual(50);
    });

    it("should clear search history", () => {
      searchService.search({query: "test"});
      searchService.clearSearchHistory();

      const history = searchService.getSearchHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe("Utility Functions", () => {
    beforeEach(() => {
      mockLocalStorage.setItem("abcLists", JSON.stringify(["Test"]));
      mockLocalStorage.setItem(
        "abcList-Test:a",
        JSON.stringify([{text: "Apple", tags: ["fruit", "red"]}]),
      );

      mockLocalStorage.setItem(
        "metadata-abc-list-Test",
        JSON.stringify({
          name: "Test",
          created: "2024-01-01T00:00:00.000Z",
          type: "abc-list",
          category: "Food",
        }),
      );

      searchService.updateIndex();
    });

    it("should get all unique tags", () => {
      const tags = searchService.getAllTags();
      expect(tags).toContain("fruit");
      expect(tags).toContain("red");
    });

    it("should get all unique categories", () => {
      const categories = searchService.getAllCategories();
      expect(categories).toContain("Food");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty localStorage gracefully", () => {
      searchService.updateIndex();
      const results = searchService.search({query: "anything"});
      expect(results).toHaveLength(0);
    });

    it("should handle malformed JSON data", () => {
      mockLocalStorage.setItem("abcLists", "invalid json");

      expect(() => {
        searchService.updateIndex();
      }).not.toThrow();
    });

    it("should handle missing word data", () => {
      mockLocalStorage.setItem("abcLists", JSON.stringify(["Test"]));
      // Don't set the word data

      searchService.updateIndex();
      const results = searchService.search({query: "Test"});
      expect(results).toHaveLength(1); // Should still find the list itself
    });

    it("should handle search with empty query", () => {
      const results = searchService.search({query: ""});
      expect(results).toHaveLength(0);
    });
  });

  describe("Date Range Filtering", () => {
    beforeEach(() => {
      const now = new Date();
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      mockLocalStorage.setItem("abcLists", JSON.stringify(["Recent", "Old"]));

      mockLocalStorage.setItem(
        "metadata-abc-list-Recent",
        JSON.stringify({
          name: "Recent",
          created: now.toISOString(),
          type: "abc-list",
        }),
      );

      mockLocalStorage.setItem(
        "metadata-abc-list-Old",
        JSON.stringify({
          name: "Old",
          created: monthAgo.toISOString(),
          type: "abc-list",
        }),
      );

      searchService.updateIndex();
    });

    it("should filter by date range", () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const results = searchService.search({
        dateRange: {start: oneWeekAgo},
      });

      expect(results).toHaveLength(1);
      expect(results[0].item.title).toBe("Recent");
    });
  });
});
