import {describe, it, expect} from "vitest";
import {taggingService} from "./taggingService";

describe("TaggingService", () => {
  describe("Tag Suggestions", () => {
    it("should suggest category tags based on content", () => {
      const suggestions = taggingService.generateSuggestions(
        "Mathematik Grundlagen",
        "Algebra, Geometrie, Analysis",
      );

      expect(suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tag: expect.stringMatching(/Mathematik|Lernen/),
            confidence: expect.any(Number),
            reason: expect.any(String),
          }),
        ]),
      );
    });

    it("should suggest subject tags for educational content", () => {
      const suggestions = taggingService.generateSuggestions(
        "Physik Experimente",
        "Kraft, Energie, Bewegung, Elektrizität",
      );

      const physicsTag = suggestions.find((s) => s.tag === "Physik");
      expect(physicsTag).toBeDefined();
      expect(physicsTag?.confidence).toBeGreaterThan(0);
    });

    it("should suggest difficulty level tags", () => {
      const beginnerSuggestions = taggingService.generateSuggestions(
        "Einfache Grundlagen für Anfänger",
        "Basis Einführung leicht verständlich",
      );

      const beginnerTag = beginnerSuggestions.find((s) => s.tag === "Anfänger");
      expect(beginnerTag).toBeDefined();

      const advancedSuggestions = taggingService.generateSuggestions(
        "Komplexe Algorithmen für Experten",
        "Schwierig fortgeschritten erweitert",
      );

      const advancedTag = advancedSuggestions.find(
        (s) => s.tag === "Fortgeschritten",
      );
      expect(advancedTag).toBeDefined();
    });

    it("should suggest format-specific tags", () => {
      const vocabSuggestions = taggingService.generateSuggestions(
        "Englisch Vokabeln für die Prüfung",
        "Wörter lernen",
      );

      expect(vocabSuggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tag: "Vokabeln",
            confidence: expect.any(Number),
          }),
          expect.objectContaining({
            tag: "Prüfung",
            confidence: expect.any(Number),
          }),
        ]),
      );
    });

    it("should generate word-based tags from content", () => {
      const suggestions = taggingService.generateSuggestions(
        "Computer Programming Tutorial",
        "Programming programming code code software software",
      );

      const programmingTag = suggestions.find(
        (s) =>
          s.tag.toLowerCase().includes("programming") ||
          s.tag.toLowerCase().includes("code"),
      );
      expect(programmingTag).toBeDefined();
    });

    it("should not suggest existing tags", () => {
      const existingTags = ["Mathematik", "Lernen"];
      const suggestions = taggingService.generateSuggestions(
        "Mathematik Lernen für Anfänger",
        "Algebra Geometrie",
        existingTags,
      );

      suggestions.forEach((suggestion) => {
        expect(existingTags).not.toContain(suggestion.tag);
      });
    });

    it("should handle empty content gracefully", () => {
      const suggestions = taggingService.generateSuggestions("", "");
      expect(suggestions).toHaveLength(0);
    });

    it("should handle very short content", () => {
      const suggestions = taggingService.generateSuggestions("Hi", "Ok");
      expect(suggestions).toHaveLength(0);
    });
  });

  describe("Tag Validation", () => {
    it("should validate and clean valid tags", () => {
      expect(taggingService.validateTag("Mathematik")).toBe("Mathematik");
      expect(taggingService.validateTag("  computer science  ")).toBe(
        "Computer Science",
      );
      expect(taggingService.validateTag("web-development")).toBe(
        "Web-development",
      );
    });

    it("should reject invalid tags", () => {
      expect(taggingService.validateTag("")).toBeNull();
      expect(taggingService.validateTag("a")).toBeNull();
      expect(taggingService.validateTag("a".repeat(31))).toBeNull();
      expect(taggingService.validateTag("tag@#$%")).toBe("Tag");
    });

    it("should handle non-string input", () => {
      expect(taggingService.validateTag(null as unknown as string)).toBeNull();
      expect(
        taggingService.validateTag(undefined as unknown as string),
      ).toBeNull();
      expect(taggingService.validateTag(123 as unknown as string)).toBeNull();
    });
  });

  describe("Tag Categorization", () => {
    it("should categorize science tags correctly", () => {
      const suggestions = taggingService.generateSuggestions(
        "Zellbiologie Strukturen",
        "zelle organ genetik evolution",
      );

      const biologyTag = suggestions.find((s) => s.tag === "Biologie");
      expect(biologyTag).toBeDefined();
    });

    it("should categorize technology tags correctly", () => {
      const suggestions = taggingService.generateSuggestions(
        "Computer Programming",
        "software development coding algorithm",
      );

      const techTag = suggestions.find(
        (s) => s.tag === "Technik" || s.tag.toLowerCase().includes("computer"),
      );
      expect(techTag).toBeDefined();
    });

    it("should categorize language tags correctly", () => {
      const suggestions = taggingService.generateSuggestions(
        "German Grammar",
        "deutsch sprache grammatik wort",
      );

      const languageTag = suggestions.find(
        (s) => s.tag === "Sprache" || s.tag.toLowerCase().includes("deutsch"),
      );
      expect(languageTag).toBeDefined();
    });
  });

  describe("Tag Similarity Detection", () => {
    it("should detect similar tags for cleanup suggestions", () => {
      // This would require mocking the search service to provide tag statistics
      // For now, we'll test the internal similarity logic
      expect(taggingService.areTagsSimilar("Math", "Maths")).toBe(true);
      expect(taggingService.areTagsSimilar("Computer", "Computers")).toBe(true);
      expect(taggingService.areTagsSimilar("Science", "History")).toBe(false);
    });

    it("should calculate Levenshtein distance correctly", () => {
      expect(taggingService.levenshteinDistance("cat", "bat")).toBe(1);
      expect(taggingService.levenshteinDistance("kitten", "sitting")).toBe(3);
      expect(taggingService.levenshteinDistance("hello", "hello")).toBe(0);
    });
  });

  describe("Confidence Scoring", () => {
    it("should assign higher confidence to better matches", () => {
      const suggestions = taggingService.generateSuggestions(
        "Mathematik Algebra Geometrie Analysis",
        "Mathematik ist wichtig für Algebra und Geometrie",
      );

      const mathTag = suggestions.find((s) => s.tag === "Mathematik");
      expect(mathTag?.confidence).toBeGreaterThan(0.5);
    });

    it("should assign lower confidence to weak matches", () => {
      const suggestions = taggingService.generateSuggestions(
        "Shopping List",
        "milk bread eggs",
      );

      suggestions.forEach((suggestion) => {
        expect(suggestion.confidence).toBeLessThan(0.9);
      });
    });
  });

  describe("Content Analysis", () => {
    it("should identify multiple subject areas", () => {
      const suggestions = taggingService.generateSuggestions(
        "Interdisziplinäre Studie",
        "zelle reaktion kraft formel wissenschaft forschung",
      );

      const subjectTags = suggestions.filter((s) =>
        ["Biologie", "Chemie", "Physik", "Mathematik", "Wissenschaft"].includes(
          s.tag,
        ),
      );

      expect(subjectTags.length).toBeGreaterThan(1);
    });

    it("should handle German and mixed content", () => {
      const suggestions = taggingService.generateSuggestions(
        "Deutsche Geschichte",
        "Deutschland Geschichte Kultur Tradition Kaiser König",
      );

      expect(suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tag: expect.stringMatching(/Geschichte|Kultur/),
            confidence: expect.any(Number),
          }),
        ]),
      );
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle special characters in content", () => {
      const suggestions = taggingService.generateSuggestions(
        "Spezial@Zeichen#Test!",
        "Content with special characters: @#$%^&*()",
      );

      // Should not crash and should still work
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it("should handle very long content", () => {
      const longContent = "word ".repeat(1000);
      const suggestions = taggingService.generateSuggestions(
        "Long Content Test",
        longContent,
      );

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeLessThanOrEqual(10); // Should be limited
    });

    it("should handle unicode characters", () => {
      const suggestions = taggingService.generateSuggestions(
        "Émotions et Sentiments",
        "café naïve résumé",
      );

      expect(Array.isArray(suggestions)).toBe(true);
    });
  });
});
