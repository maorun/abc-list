import React, {useState, useEffect} from "react";
import {render} from "@testing-library/react";
import {vi} from "vitest";
import {Letter} from "./Letter";
import {WordWithExplanation} from "./SavedWord";

// Mock useGamification hook to prevent gamification tracking during testing
vi.mock("@/hooks/useGamification", () => ({
  useGamification: () => ({
    trackWordAdded: vi.fn(),
    trackListCreated: vi.fn(),
    trackKawaCreated: vi.fn(),
    trackKagaCreated: vi.fn(),
    trackStadtLandFlussGame: vi.fn(),
    trackSokratesSession: vi.fn(),
    trackBasarTrade: vi.fn(),
  }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: {[key: string]: string} = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Letter component rerender issue", () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock console to track warnings about rerender loops
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const TestWrapper = ({
    initialWords = [],
    cacheKey,
    letter,
  }: {
    initialWords?: WordWithExplanation[];
    cacheKey: string;
    letter: string;
  }) => {
    const [words, setWords] = useState(initialWords);
    const storageKey = `${cacheKey}:${letter}`;

    // Simulate the old data migration logic that was in the Letter component
    useEffect(() => {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (parsed.every((item) => typeof item === "string")) {
              const converted = parsed.map((word: string) => ({
                text: word,
                explanation: "",
                version: 1,
                imported: false,
              }));
              setWords(converted);
              localStorage.setItem(storageKey, JSON.stringify(converted));
            } else {
              setWords(parsed);
            }
          }
        } catch (error) {
          console.warn(`Failed to parse stored data for ${storageKey}:`, error);
        }
      }
    }, [storageKey]);

    return (
      <Letter
        cacheKey={cacheKey}
        letter={letter}
        words={words}
        onWordsChange={setWords}
      />
    );
  };

  it("should not cause rerender loop when converting old format data", () => {
    // Set up old format data that needs conversion
    const oldFormatData = ["Apfel", "Auto", "Ameise"];
    const storageKey = "abcList-test:a";
    localStorage.setItem(storageKey, JSON.stringify(oldFormatData));

    // Track localStorage writes using the mock
    const originalSetItem = localStorage.setItem;
    const setItemCalls: Array<[string, string]> = [];
    localStorage.setItem = (key: string, value: string) => {
      setItemCalls.push([key, value]);
      return originalSetItem.call(localStorage, key, value);
    };

    // Render the component
    const {rerender} = render(
      <TestWrapper cacheKey="abcList-test" letter="a" />,
    );

    // Wait for effects to complete - migration should happen in separate effect
    expect(setItemCalls).toHaveLength(1);
    expect(setItemCalls[0][0]).toBe(storageKey);
    const firstWriteData = JSON.parse(setItemCalls[0][1]);
    expect(firstWriteData).toEqual([
      {text: "Apfel", explanation: "", version: 1, imported: false},
      {text: "Auto", explanation: "", version: 1, imported: false},
      {text: "Ameise", explanation: "", version: 1, imported: false},
    ]);

    // Reset tracking
    setItemCalls.length = 0;

    // Multiple re-renders should not trigger additional writes
    rerender(<TestWrapper cacheKey="abcList-test" letter="a" />);
    expect(setItemCalls).toHaveLength(0);

    rerender(<TestWrapper cacheKey="abcList-test" letter="a" />);
    expect(setItemCalls).toHaveLength(0);

    rerender(<TestWrapper cacheKey="abcList-test" letter="a" />);
    expect(setItemCalls).toHaveLength(0);

    // Restore
    localStorage.setItem = originalSetItem;
  });

  it("should handle already converted data without additional writes", () => {
    // Set up already converted data
    const convertedData = [
      {text: "Apfel", explanation: "", version: 1, imported: false},
      {text: "Auto", explanation: "Fahrzeug", version: 1, imported: false},
    ];
    const storageKey = "abcList-test:b";
    localStorage.setItem(storageKey, JSON.stringify(convertedData));

    // Track localStorage writes
    const setItemSpy = vi.spyOn(localStorage, "setItem");

    // Render the component
    render(
      <TestWrapper
        cacheKey="abcList-test"
        letter="b"
        initialWords={convertedData}
      />,
    );

    // Should not write to localStorage since data is already in correct format
    expect(setItemSpy).not.toHaveBeenCalled();

    setItemSpy.mockRestore();
  });

  it("should handle empty localStorage gracefully", () => {
    // Track localStorage writes
    const setItemSpy = vi.spyOn(localStorage, "setItem");

    // Render component with no existing data
    render(<TestWrapper cacheKey="abcList-test" letter="c" />);

    // Should not write to localStorage since there's no data to convert
    expect(setItemSpy).not.toHaveBeenCalled();

    setItemSpy.mockRestore();
  });
});
