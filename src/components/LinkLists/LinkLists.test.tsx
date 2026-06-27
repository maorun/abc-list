import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, beforeEach} from "vitest";
import {LinkLists} from "./LinkLists";

// Mock localStorage
const localStorageMock = (() => {
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
  value: localStorageMock,
});

describe("LinkLists", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("renders the link lists page title", () => {
    render(<LinkLists />);
    expect(screen.getByText("ABC-Listen verknüpfen")).toBeInTheDocument();
  });

  it("shows message when no lists are available", () => {
    render(<LinkLists />);
    expect(
      screen.getByText(
        "Keine ABC-Listen verfügbar. Erstellen Sie zuerst eine Liste.",
      ),
    ).toBeInTheDocument();
  });

  it("displays available lists for selection", () => {
    // Setup some test data
    localStorageMock.setItem(
      "abcLists",
      JSON.stringify(["Test List 1", "Test List 2"]),
    );

    render(<LinkLists />);

    expect(screen.getByText("Test List 1")).toBeInTheDocument();
    expect(screen.getByText("Test List 2")).toBeInTheDocument();
  });

  it("allows selecting and deselecting lists", () => {
    localStorageMock.setItem(
      "abcLists",
      JSON.stringify(["Test List 1", "Test List 2"]),
    );

    render(<LinkLists />);

    const listButton1 = screen.getByRole("button", {name: "Test List 1"});
    const listButton2 = screen.getByRole("button", {name: "Test List 2"});

    // Initially no lists selected
    expect(
      screen.getByText("Listen auswählen (0 ausgewählt)"),
    ).toBeInTheDocument();

    // Select first list
    fireEvent.click(listButton1);
    expect(
      screen.getByText("Listen auswählen (1 ausgewählt)"),
    ).toBeInTheDocument();

    // Select second list
    fireEvent.click(listButton2);
    expect(
      screen.getByText("Listen auswählen (2 ausgewählt)"),
    ).toBeInTheDocument();

    // Deselect first list
    fireEvent.click(listButton1);
    expect(
      screen.getByText("Listen auswählen (1 ausgewählt)"),
    ).toBeInTheDocument();
  });

  it("shows clear selection button when lists are selected", () => {
    localStorageMock.setItem("abcLists", JSON.stringify(["Test List 1"]));

    render(<LinkLists />);

    const listButton = screen.getByRole("button", {name: "Test List 1"});

    // Initially no clear button
    expect(screen.queryByText("Auswahl zurücksetzen")).not.toBeInTheDocument();

    // Select list
    fireEvent.click(listButton);

    // Clear button should appear
    expect(screen.getByText("Auswahl zurücksetzen")).toBeInTheDocument();
  });

  it("clears all selections when clear button is clicked", () => {
    localStorageMock.setItem(
      "abcLists",
      JSON.stringify(["Test List 1", "Test List 2"]),
    );

    render(<LinkLists />);

    const listButton1 = screen.getByRole("button", {name: "Test List 1"});
    const listButton2 = screen.getByRole("button", {name: "Test List 2"});

    // Select both lists
    fireEvent.click(listButton1);
    fireEvent.click(listButton2);
    expect(
      screen.getByText("Listen auswählen (2 ausgewählt)"),
    ).toBeInTheDocument();

    // Clear selection
    const clearButton = screen.getByRole("button", {
      name: "Auswahl zurücksetzen",
    });
    fireEvent.click(clearButton);

    expect(
      screen.getByText("Listen auswählen (0 ausgewählt)"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Auswahl zurücksetzen")).not.toBeInTheDocument();
  });

  it("shows linked lists view when lists are selected", () => {
    localStorageMock.setItem("abcLists", JSON.stringify(["Test List 1"]));
    // Add some test words for the list
    localStorageMock.setItem(
      "abcList-Test List 1:a",
      JSON.stringify(["apple", "ant"]),
    );
    localStorageMock.setItem("abcList-Test List 1:b", JSON.stringify(["ball"]));

    render(<LinkLists />);

    const listButton = screen.getByRole("button", {name: "Test List 1"});
    fireEvent.click(listButton);

    expect(screen.getByText("Verknüpfte Listen-Ansicht")).toBeInTheDocument();
    // Use more specific text search for the header in the linked view
    expect(
      screen.getByRole("heading", {level: 3, name: "Test List 1"}),
    ).toBeInTheDocument();
    expect(screen.getByText("apple")).toBeInTheDocument();
    expect(screen.getByText("ant")).toBeInTheDocument();
    expect(screen.getByText("ball")).toBeInTheDocument();
  });

  it("shows words from BOTH lists when two lists are selected", () => {
    localStorageMock.setItem("abcLists", JSON.stringify(["Tiere", "Pflanzen"]));
    // Words for the first list
    localStorageMock.setItem(
      "abcList-Tiere:a",
      JSON.stringify([
        {text: "Affe", explanation: "", version: 1, imported: false},
      ]),
    );
    localStorageMock.setItem(
      "abcList-Tiere:b",
      JSON.stringify([
        {text: "Bär", explanation: "", version: 1, imported: false},
      ]),
    );
    // Words for the second list
    localStorageMock.setItem(
      "abcList-Pflanzen:a",
      JSON.stringify([
        {text: "Apfel", explanation: "", version: 1, imported: false},
      ]),
    );
    localStorageMock.setItem(
      "abcList-Pflanzen:b",
      JSON.stringify([
        {text: "Birne", explanation: "", version: 1, imported: false},
      ]),
    );

    render(<LinkLists />);

    // Select FIRST list
    fireEvent.click(screen.getByRole("button", {name: "Tiere"}));

    // Verify first list shows correctly
    expect(screen.getByText("Affe")).toBeInTheDocument();
    expect(screen.getByText("Bär")).toBeInTheDocument();

    // Select SECOND list
    fireEvent.click(screen.getByRole("button", {name: "Pflanzen"}));

    // Verify BOTH lists still show their words (this was the bug: first list disappeared)
    expect(screen.getByText("Affe")).toBeInTheDocument();
    expect(screen.getByText("Bär")).toBeInTheDocument();
    expect(screen.getByText("Apfel")).toBeInTheDocument();
    expect(screen.getByText("Birne")).toBeInTheDocument();
  });

  it("shows words from first list when selecting second list first", () => {
    localStorageMock.setItem(
      "abcLists",
      JSON.stringify(["Liste 1", "Liste 2"]),
    );
    localStorageMock.setItem(
      "abcList-Liste 1:c",
      JSON.stringify([
        {text: "Chaos", explanation: "", version: 1, imported: false},
      ]),
    );
    localStorageMock.setItem(
      "abcList-Liste 2:c",
      JSON.stringify([
        {text: "Computer", explanation: "", version: 1, imported: false},
      ]),
    );

    render(<LinkLists />);

    // Select second list first
    fireEvent.click(screen.getByRole("button", {name: "Liste 2"}));
    expect(screen.getByText("Computer")).toBeInTheDocument();

    // Then select first list
    fireEvent.click(screen.getByRole("button", {name: "Liste 1"}));

    // Both words must be visible
    expect(screen.getByText("Chaos")).toBeInTheDocument();
    expect(screen.getByText("Computer")).toBeInTheDocument();
  });

  it("shows bi-associative ideas hint when multiple lists are selected", () => {
    localStorageMock.setItem("abcLists", JSON.stringify(["List 1", "List 2"]));

    render(<LinkLists />);

    const listButton1 = screen.getByRole("button", {name: "List 1"});
    const listButton2 = screen.getByRole("button", {name: "List 2"});

    // Select first list - no hint yet
    fireEvent.click(listButton1);
    expect(
      screen.queryByText("💡 Bi-assoziative Ideen"),
    ).not.toBeInTheDocument();

    // Select second list - hint should appear
    fireEvent.click(listButton2);
    expect(screen.getByText("💡 Bi-assoziative Ideen")).toBeInTheDocument();
  });

  it("toggles the help section when help button is clicked", () => {
    render(<LinkLists />);

    expect(
      screen.queryByText("🔗 So funktioniert die Verknüpfung von ABC-Listen"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", {name: /Wie funktioniert das/}));
    expect(
      screen.getByText("🔗 So funktioniert die Verknüpfung von ABC-Listen"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", {name: /Hilfe schließen/}));
    expect(
      screen.queryByText("🔗 So funktioniert die Verknüpfung von ABC-Listen"),
    ).not.toBeInTheDocument();
  });
});
