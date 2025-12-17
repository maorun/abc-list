import React, {useState, useEffect} from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, beforeEach, vi} from "vitest";
import {Letter} from "./Letter";
import {WordWithExplanation} from "./SavedWord";

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

describe("Letter", () => {
  const cacheKey = "testList";
  const letter = "a";

  beforeEach(() => {
    localStorage.clear();
  });

  const TestWrapper = ({
    initialWords = [],
  }: {
    initialWords?: WordWithExplanation[];
  }) => {
    const [words, setWords] = useState(initialWords);
    useEffect(() => {
      localStorage.setItem(
        `${cacheKey}:${letter}`,
        JSON.stringify(initialWords),
      );
      const storedWords = localStorage.getItem(`${cacheKey}:${letter}`);
      if (storedWords) {
        setWords(JSON.parse(storedWords));
      }
    }, [initialWords]);

    const handleWordsChange = (newWords: WordWithExplanation[]) => {
      setWords(newWords);
      localStorage.setItem(`${cacheKey}:${letter}`, JSON.stringify(newWords));
    };

    return (
      <Letter
        cacheKey={cacheKey}
        letter={letter}
        words={words}
        onWordsChange={handleWordsChange}
      />
    );
  };

  it("renders a button with the capitalized letter", () => {
    render(<TestWrapper />);
    expect(
      screen.getByRole("button", {name: "Wort für Buchstabe A hinzufügen"}),
    ).toBeInTheDocument();
  });

  it("loads and displays words from localStorage on initial render", () => {
    const initialWords = [
      {text: "Apple", explanation: "", version: 1, imported: false},
      {text: "Ant", explanation: "", version: 1, imported: false},
    ];
    render(<TestWrapper initialWords={initialWords} />);
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Ant")).toBeInTheDocument();
  });

  it("opens a modal when the letter button is clicked", () => {
    render(<TestWrapper />);
    fireEvent.click(
      screen.getByRole("button", {name: "Wort für Buchstabe A hinzufügen"}),
    );
    expect(
      screen.getByRole("heading", {name: 'Neues Wort für "A"'}),
    ).toBeInTheDocument();
  });

  it("adds a new word, saves to localStorage, and closes modal", () => {
    render(<TestWrapper />);
    fireEvent.click(
      screen.getByRole("button", {name: "Wort für Buchstabe A hinzufügen"}),
    );

    const input = screen.getByPlaceholderText("Wort eingeben...");
    fireEvent.change(input, {target: {value: "Airplane"}});
    fireEvent.click(screen.getByRole("button", {name: "Wort speichern"}));

    expect(screen.getByText("Airplane")).toBeInTheDocument();
    expect(localStorage.getItem(`${cacheKey}:${letter}`)).toBe(
      JSON.stringify([
        {text: "Airplane", explanation: "", version: 1, imported: false},
      ]),
    );
    expect(
      screen.queryByRole("heading", {name: 'Neues Wort für "A"'}),
    ).not.toBeInTheDocument();
  });

  it("does not add a duplicate word", () => {
    const initialWords = [
      {text: "Apple", explanation: "", version: 1, imported: false},
    ];
    render(<TestWrapper initialWords={initialWords} />);
    fireEvent.click(
      screen.getByRole("button", {name: "Wort für Buchstabe A hinzufügen"}),
    );

    const input = screen.getByPlaceholderText("Wort eingeben...");
    fireEvent.change(input, {target: {value: "Apple"}});
    fireEvent.click(screen.getByRole("button", {name: "Wort speichern"}));

    expect(screen.getAllByText("Apple")).toHaveLength(1);
    expect(localStorage.getItem(`${cacheKey}:${letter}`)).toBe(
      JSON.stringify([
        {text: "Apple", explanation: "", version: 1, imported: false},
      ]),
    );
  });

  it("deletes a word and updates localStorage", () => {
    const initialWords = [
      {text: "Apple", explanation: "", version: 1, imported: false},
      {text: "Ant", explanation: "", version: 1, imported: false},
    ];
    render(<TestWrapper initialWords={initialWords} />);

    // Find the button associated with the word 'Apple' to delete it.
    // The SavedWord component renders the text as a button.
    const appleWordButton = screen.getByRole("button", {name: "Apple 🎨📊"});
    fireEvent.click(appleWordButton); // This opens the delete confirmation

    const confirmDeleteButton = screen.getByRole("button", {name: "Ja"});
    fireEvent.click(confirmDeleteButton);

    expect(screen.queryByText("Apple")).not.toBeInTheDocument();
    expect(screen.getByText("Ant")).toBeInTheDocument();
    expect(localStorage.getItem(`${cacheKey}:${letter}`)).toBe(
      JSON.stringify([
        {text: "Ant", explanation: "", version: 1, imported: false},
      ]),
    );
  });

  it('closes the modal when "Abbrechen" is clicked', () => {
    render(<TestWrapper />);
    fireEvent.click(
      screen.getByRole("button", {name: "Wort für Buchstabe A hinzufügen"}),
    );
    fireEvent.click(screen.getByRole("button", {name: "Dialog schließen"}));
    expect(
      screen.queryByRole("heading", {name: 'Neues Wort für "A"'}),
    ).not.toBeInTheDocument();
  });
});
