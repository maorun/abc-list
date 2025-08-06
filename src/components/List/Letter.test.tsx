import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, beforeEach} from "vitest";
import {Letter} from "./Letter";

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

  it("renders a button with the capitalized letter", () => {
    render(<Letter cacheKey={cacheKey} letter={letter} />);
    expect(screen.getByRole("button", {name: "A"})).toBeInTheDocument();
  });

  it("loads and displays words from localStorage on initial render", () => {
    localStorage.setItem(
      `${cacheKey}:${letter}`,
      JSON.stringify([
        {text: "Apple", explanation: "", version: 1, imported: false},
        {text: "Ant", explanation: "", version: 1, imported: false},
      ]),
    );
    render(<Letter cacheKey={cacheKey} letter={letter} />);
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Ant")).toBeInTheDocument();
  });

  it("opens a modal when the letter button is clicked", () => {
    render(<Letter cacheKey={cacheKey} letter={letter} />);
    fireEvent.click(screen.getByRole("button", {name: "A"}));
    expect(
      screen.getByRole("heading", {name: 'Neues Wort für "A"'}),
    ).toBeInTheDocument();
  });

  it("adds a new word, saves to localStorage, and closes modal", () => {
    render(<Letter cacheKey={cacheKey} letter={letter} />);
    fireEvent.click(screen.getByRole("button", {name: "A"}));

    const input = screen.getByPlaceholderText("Wort eingeben...");
    fireEvent.change(input, {target: {value: "Airplane"}});
    fireEvent.click(screen.getByRole("button", {name: "Speichern"}));

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
    localStorage.setItem(`${cacheKey}:${letter}`, JSON.stringify(["Apple"]));
    render(<Letter cacheKey={cacheKey} letter={letter} />);
    fireEvent.click(screen.getByRole("button", {name: "A"}));

    const input = screen.getByPlaceholderText("Wort eingeben...");
    fireEvent.change(input, {target: {value: "Apple"}});
    fireEvent.click(screen.getByRole("button", {name: "Speichern"}));

    expect(screen.getAllByText("Apple")).toHaveLength(1);
    expect(localStorage.getItem(`${cacheKey}:${letter}`)).toBe(
      JSON.stringify([
        {text: "Apple", explanation: "", version: 1, imported: false},
      ]),
    );
  });

  it("deletes a word and updates localStorage", () => {
    localStorage.setItem(
      `${cacheKey}:${letter}`,
      JSON.stringify([
        {text: "Apple", explanation: "", version: 1, imported: false},
        {text: "Ant", explanation: "", version: 1, imported: false},
      ]),
    );
    render(<Letter cacheKey={cacheKey} letter={letter} />);

    // Find the button associated with the word 'Apple' to delete it.
    // The SavedWord component renders the text as a button.
    const appleWordButton = screen.getByRole("button", {name: "Apple"});
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
    render(<Letter cacheKey={cacheKey} letter={letter} />);
    fireEvent.click(screen.getByRole("button", {name: "A"}));
    fireEvent.click(screen.getByRole("button", {name: "Abbrechen"}));
    expect(
      screen.queryByRole("heading", {name: 'Neues Wort für "A"'}),
    ).not.toBeInTheDocument();
  });
});
