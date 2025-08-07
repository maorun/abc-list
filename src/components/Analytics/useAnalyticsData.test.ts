import {renderHook} from "@testing-library/react";
import {vi} from "vitest";
import {useAnalyticsData} from "./useAnalyticsData";

describe("useAnalyticsData", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it("returns empty data when no storage data exists", () => {
    const {result} = renderHook(() => useAnalyticsData());

    expect(result.current.abcLists).toEqual([]);
    expect(result.current.kawas).toEqual([]);
    expect(result.current.kagas).toEqual([]);
    expect(result.current.stadtLandFlussGames).toEqual([]);
    expect(result.current.totalWords).toBe(0);
    expect(result.current.totalLists).toBe(0);
    expect(result.current.averageWordsPerList).toBe(0);
  });

  it("loads ABC lists from localStorage", () => {
    // Setup test data in localStorage
    localStorage.setItem("abcLists", JSON.stringify(["Test Liste"]));
    localStorage.setItem(
      "abcList-Test Liste:a",
      JSON.stringify([{word: "Apfel", explanation: "Fruit"}]),
    );
    localStorage.setItem(
      "abcList-Test Liste:b",
      JSON.stringify([{word: "Banane"}]),
    );

    const {result} = renderHook(() => useAnalyticsData());

    expect(result.current.abcLists).toHaveLength(1);
    expect(result.current.abcLists[0].name).toBe("Test Liste");
    expect(result.current.totalWords).toBe(2);
    expect(result.current.totalLists).toBe(1);
  });

  it("loads Kawas from localStorage", () => {
    localStorage.setItem(
      "Kawas",
      JSON.stringify([
        {key: "test1", text: "TEST", createdAt: Date.now()},
        {key: "test2", text: "DEMO", createdAt: Date.now()},
      ]),
    );

    const {result} = renderHook(() => useAnalyticsData());

    expect(result.current.kawas).toHaveLength(2);
    expect(result.current.totalLists).toBe(2);
  });

  it("calculates most active letters correctly", () => {
    localStorage.setItem("abcLists", JSON.stringify(["Test Liste"]));
    localStorage.setItem(
      "abcList-Test Liste:a",
      JSON.stringify([{word: "Apfel"}, {word: "Auto"}]),
    );
    localStorage.setItem(
      "abcList-Test Liste:b",
      JSON.stringify([{word: "Banane"}]),
    );

    const {result} = renderHook(() => useAnalyticsData());

    expect(result.current.mostActiveLetters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({letter: "A", count: 2}),
        expect.objectContaining({letter: "B", count: 1}),
      ]),
    );
  });

  it("identifies knowledge areas correctly", () => {
    localStorage.setItem("abcLists", JSON.stringify(["Tiere", "Pflanzen"]));
    localStorage.setItem(
      "abcList-Tiere:a",
      JSON.stringify([{word: "Affe"}, {word: "Ameise"}]),
    );
    localStorage.setItem(
      "abcList-Pflanzen:a",
      JSON.stringify([{word: "Apfelbaum"}]),
    );

    const {result} = renderHook(() => useAnalyticsData());

    expect(result.current.knowledgeAreas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({area: "Tiere", count: 1, strength: 2}),
        expect.objectContaining({area: "Pflanzen", count: 1, strength: 1}),
      ]),
    );
  });

  it("calculates average words per list correctly", () => {
    localStorage.setItem("abcLists", JSON.stringify(["Liste1", "Liste2"]));
    localStorage.setItem(
      "abcList-Liste1:a",
      JSON.stringify([{word: "Apfel"}, {word: "Auto"}]),
    );
    localStorage.setItem(
      "abcList-Liste2:b",
      JSON.stringify([{word: "Banane"}]),
    );

    const {result} = renderHook(() => useAnalyticsData());

    expect(result.current.averageWordsPerList).toBe(1.5); // 3 words / 2 lists
  });

  it("handles invalid JSON data gracefully", () => {
    localStorage.setItem("abcLists", "invalid json");
    localStorage.setItem("Kawas", "{broken json");

    const {result} = renderHook(() => useAnalyticsData());

    expect(result.current.abcLists).toEqual([]);
    expect(result.current.kawas).toEqual([]);
    expect(result.current.totalWords).toBe(0);
  });
});
