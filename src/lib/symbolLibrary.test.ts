import {describe, it, expect} from "vitest";
import {
  SYMBOL_LIBRARY,
  SYMBOL_CATEGORIES,
  getSymbolsByCategory,
  getSymbolById,
  searchSymbols,
} from "./symbolLibrary";

describe("symbolLibrary", () => {
  describe("SYMBOL_LIBRARY", () => {
    it("should have valid symbols with all required fields", () => {
      SYMBOL_LIBRARY.forEach((symbol) => {
        expect(symbol.id).toBeTruthy();
        expect(symbol.name).toBeTruthy();
        expect(symbol.emoji).toBeTruthy();
        expect(symbol.category).toBeTruthy();
        expect(symbol.description).toBeTruthy();
      });
    });

    it("should have unique symbol IDs", () => {
      const ids = SYMBOL_LIBRARY.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have categories from SYMBOL_CATEGORIES", () => {
      const validCategories = new Set(SYMBOL_CATEGORIES);
      SYMBOL_LIBRARY.forEach((symbol) => {
        expect(validCategories.has(symbol.category as never)).toBe(true);
      });
    });

    it("should have symbols in expected categories", () => {
      const wissenschaftSymbols = SYMBOL_LIBRARY.filter(
        (s) => s.category === "Wissenschaft",
      );
      expect(wissenschaftSymbols.length).toBeGreaterThan(0);

      const mathSymbols = SYMBOL_LIBRARY.filter(
        (s) => s.category === "Mathematik",
      );
      expect(mathSymbols.length).toBeGreaterThan(0);
    });
  });

  describe("getSymbolsByCategory", () => {
    it("should return symbols for valid category", () => {
      const wissenschaftSymbols = getSymbolsByCategory("Wissenschaft");
      expect(wissenschaftSymbols.length).toBeGreaterThan(0);
      wissenschaftSymbols.forEach((s) => {
        expect(s.category).toBe("Wissenschaft");
      });
    });

    it("should return empty array for invalid category", () => {
      const invalidSymbols = getSymbolsByCategory("InvalidCategory" as never);
      expect(invalidSymbols).toEqual([]);
    });

    it("should return Mathematik symbols", () => {
      const mathSymbols = getSymbolsByCategory("Mathematik");
      expect(mathSymbols.length).toBeGreaterThan(0);
      expect(mathSymbols.some((s) => s.id === "calculator")).toBe(true);
    });
  });

  describe("getSymbolById", () => {
    it("should return symbol for valid ID", () => {
      const symbol = getSymbolById("microscope");
      expect(symbol).toBeDefined();
      expect(symbol?.id).toBe("microscope");
      expect(symbol?.category).toBe("Wissenschaft");
    });

    it("should return undefined for invalid ID", () => {
      const symbol = getSymbolById("invalid-id");
      expect(symbol).toBeUndefined();
    });

    it("should return correct symbol for calculator", () => {
      const symbol = getSymbolById("calculator");
      expect(symbol).toBeDefined();
      expect(symbol?.emoji).toBe("🧮");
      expect(symbol?.category).toBe("Mathematik");
    });
  });

  describe("searchSymbols", () => {
    it("should find symbols by name", () => {
      const results = searchSymbols("Mikroskop");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((s) => s.id === "microscope")).toBe(true);
    });

    it("should find symbols by description", () => {
      const results = searchSymbols("Forschung");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((s) => s.category === "Wissenschaft")).toBe(true);
    });

    it("should find symbols by category", () => {
      const results = searchSymbols("Mathematik");
      expect(results.length).toBeGreaterThan(0);
      results.forEach((s) => {
        expect(s.category).toBe("Mathematik");
      });
    });

    it("should be case insensitive", () => {
      const lower = searchSymbols("mikroskop");
      const upper = searchSymbols("MIKROSKOP");
      const mixed = searchSymbols("MiKrOsKoP");

      expect(lower.length).toBe(upper.length);
      expect(lower.length).toBe(mixed.length);
    });

    it("should return empty array for no matches", () => {
      const results = searchSymbols("xyz123notfound");
      expect(results).toEqual([]);
    });

    it("should find partial matches", () => {
      const results = searchSymbols("Atom");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((s) => s.id === "atom")).toBe(true);
    });
  });

  describe("SYMBOL_CATEGORIES", () => {
    it("should have all expected categories", () => {
      const expectedCategories = [
        "Wissenschaft",
        "Mathematik",
        "Sprachen",
        "Natur",
        "Technik",
        "Emotion",
        "Zeit",
        "Richtung",
        "Zustand",
      ];

      expectedCategories.forEach((cat) => {
        expect(SYMBOL_CATEGORIES).toContain(cat);
      });
    });

    it("should have 9 categories", () => {
      expect(SYMBOL_CATEGORIES.length).toBe(9);
    });
  });

  describe("Symbol content validation", () => {
    it("should have educational symbols for learning", () => {
      const bookSymbol = getSymbolById("book");
      expect(bookSymbol).toBeDefined();
      expect(bookSymbol?.emoji).toBe("📚");

      const bulbSymbol = getSymbolById("bulb");
      expect(bulbSymbol).toBeDefined();
      expect(bulbSymbol?.emoji).toBe("💡");
    });

    it("should have direction symbols", () => {
      const arrowUp = getSymbolById("arrow-up");
      expect(arrowUp).toBeDefined();
      expect(arrowUp?.category).toBe("Richtung");
    });

    it("should have time-related symbols", () => {
      const clock = getSymbolById("clock");
      expect(clock).toBeDefined();
      expect(clock?.category).toBe("Zeit");
    });
  });
});
