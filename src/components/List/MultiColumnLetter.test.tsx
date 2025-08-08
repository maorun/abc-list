import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {vi} from "vitest";
import {MultiColumnLetter} from "./MultiColumnLetter";
import {ColumnConfig, getMultiColumnStorageKey} from "./types";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
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
  value: mockLocalStorage,
});

describe("MultiColumnLetter", () => {
  const mockColumn: ColumnConfig = {
    id: "test-column",
    theme: "Test Theme",
    color: "#3B82F6",
  };

  const mockColumnWithTime: ColumnConfig = {
    id: "timed-column",
    theme: "Timed Theme",
    color: "#10B981",
    timeLimit: 1, // 1 minute
  };

  const listName = "Test List";
  const letter = "a";

  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders the letter button correctly", () => {
    render(
      <MultiColumnLetter
        letter={letter}
        listName={listName}
        column={mockColumn}
      />,
    );

    const letterButton = screen.getByRole("button", {name: /A/});
    expect(letterButton).toBeInTheDocument();
    expect(letterButton).toHaveTextContent("A");
  });

  it("applies column color to the letter button", () => {
    render(
      <MultiColumnLetter
        letter={letter}
        listName={listName}
        column={mockColumn}
      />,
    );

    const letterButton = screen.getByRole("button", {name: /A/});
    expect(letterButton).toHaveStyle(`border-color: ${mockColumn.color}`);
  });

  it("displays word count when words exist", () => {
    const storageKey = getMultiColumnStorageKey(
      listName,
      mockColumn.id,
      letter,
    );
    const mockWords = [
      {text: "Apple", explanation: "", version: 1, imported: false},
      {text: "Ant", explanation: "", version: 1, imported: false},
    ];
    mockLocalStorage.setItem(storageKey, JSON.stringify(mockWords));

    render(
      <MultiColumnLetter
        letter={letter}
        listName={listName}
        column={mockColumn}
      />,
    );

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("opens modal when letter button is clicked", () => {
    render(
      <MultiColumnLetter
        letter={letter}
        listName={listName}
        column={mockColumn}
      />,
    );

    const letterButton = screen.getByRole("button", {name: /A/});
    fireEvent.click(letterButton);

    expect(
      screen.getByText(`Neues Wort für "A" - ${mockColumn.theme}`),
    ).toBeInTheDocument();
  });

  it("shows time limit when column has time restriction", () => {
    render(
      <MultiColumnLetter
        letter={letter}
        listName={listName}
        column={mockColumnWithTime}
      />,
    );

    const letterButton = screen.getByRole("button", {name: /A/});
    fireEvent.click(letterButton);

    expect(screen.getByText("⏱️ 1:00")).toBeInTheDocument();
  });

  it("adds new word successfully", () => {
    render(
      <MultiColumnLetter
        letter={letter}
        listName={listName}
        column={mockColumn}
      />,
    );

    const letterButton = screen.getByRole("button", {name: /A/});
    fireEvent.click(letterButton);

    const input = screen.getByPlaceholderText("Wort eingeben...");
    fireEvent.change(input, {target: {value: "Apple"}});

    const saveButton = screen.getByText("Speichern");
    fireEvent.click(saveButton);

    // Check if word was saved to localStorage
    const storageKey = getMultiColumnStorageKey(
      listName,
      mockColumn.id,
      letter,
    );
    const savedWords = JSON.parse(mockLocalStorage.getItem(storageKey) || "[]");
    expect(savedWords).toHaveLength(1);
    expect(savedWords[0].text).toBe("Apple");
  });

  it("prevents adding duplicate words", () => {
    const storageKey = getMultiColumnStorageKey(
      listName,
      mockColumn.id,
      letter,
    );
    const existingWords = [
      {text: "Apple", explanation: "", version: 1, imported: false},
    ];
    mockLocalStorage.setItem(storageKey, JSON.stringify(existingWords));

    render(
      <MultiColumnLetter
        letter={letter}
        listName={listName}
        column={mockColumn}
      />,
    );

    const letterButton = screen.getByRole("button", {
      name: `Wort für Buchstabe ${letter.toUpperCase()} in Spalte ${mockColumn.theme} hinzufügen`,
    });
    fireEvent.click(letterButton);

    const input = screen.getByPlaceholderText("Wort eingeben...");
    fireEvent.change(input, {target: {value: "Apple"}});

    const saveButton = screen.getByText("Speichern");
    fireEvent.click(saveButton);

    // Should still have only one word
    const savedWords = JSON.parse(mockLocalStorage.getItem(storageKey) || "[]");
    expect(savedWords).toHaveLength(1);
  });

  it("allows adding word with Enter key", () => {
    render(
      <MultiColumnLetter
        letter={letter}
        listName={listName}
        column={mockColumn}
      />,
    );

    const letterButton = screen.getByRole("button", {name: /A/});
    fireEvent.click(letterButton);

    const input = screen.getByPlaceholderText("Wort eingeben...");
    fireEvent.change(input, {target: {value: "Apple"}});
    fireEvent.keyDown(input, {key: "Enter", code: "Enter"});

    // Check if word was saved
    const storageKey = getMultiColumnStorageKey(
      listName,
      mockColumn.id,
      letter,
    );
    const savedWords = JSON.parse(mockLocalStorage.getItem(storageKey) || "[]");
    expect(savedWords).toHaveLength(1);
    expect(savedWords[0].text).toBe("Apple");
  });

  it("displays saved words with truncation for many words", () => {
    const storageKey = getMultiColumnStorageKey(
      listName,
      mockColumn.id,
      letter,
    );
    const manyWords = Array.from({length: 5}, (_, i) => ({
      text: `Word${i + 1}`,
      explanation: "",
      version: 1,
      imported: false,
    }));
    mockLocalStorage.setItem(storageKey, JSON.stringify(manyWords));

    render(
      <MultiColumnLetter
        letter={letter}
        listName={listName}
        column={mockColumn}
      />,
    );

    // Should show first 3 words
    expect(screen.getByText("Word1")).toBeInTheDocument();
    expect(screen.getByText("Word2")).toBeInTheDocument();
    expect(screen.getByText("Word3")).toBeInTheDocument();

    // Should show "+2 weitere" for remaining words
    expect(screen.getByText("+2 weitere")).toBeInTheDocument();
  });

  it("closes modal when cancel button is clicked", () => {
    render(
      <MultiColumnLetter
        letter={letter}
        listName={listName}
        column={mockColumn}
      />,
    );

    const letterButton = screen.getByRole("button", {name: /A/});
    fireEvent.click(letterButton);

    const cancelButton = screen.getByText("Abbrechen");
    fireEvent.click(cancelButton);

    expect(
      screen.queryByText(`Neues Wort für "A" - ${mockColumn.theme}`),
    ).not.toBeInTheDocument();
  });
});
