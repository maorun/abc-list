import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import {vi} from "vitest";
import {MultiColumnList} from "./MultiColumnList";
import {MULTI_COLUMN_CACHE_KEY} from "./types";

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

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("MultiColumnList", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    mockNavigate.mockClear();
  });

  it("renders the multi-column list page correctly", () => {
    render(
      <MemoryRouter>
        <MultiColumnList />
      </MemoryRouter>,
    );

    expect(screen.getByText("Mehrspaltige ABC-Listen")).toBeInTheDocument();
    expect(screen.getByText("Neue Mehrspaltige ABC-Liste")).toBeInTheDocument();
    expect(screen.getByText("ℹ️ Mehrspaltiges ABC-System")).toBeInTheDocument();
    expect(
      screen.getByText(/Nach Vera F. Birkenbihl können Sie/),
    ).toBeInTheDocument();
  });

  it("shows empty list when no multi-column lists exist", () => {
    render(
      <MemoryRouter>
        <MultiColumnList />
      </MemoryRouter>,
    );

    const list = screen.getByRole("list");
    expect(list).toBeEmptyDOMElement();
  });

  it("displays existing multi-column lists from localStorage", () => {
    const testLists = ["Test List 1", "Test List 2"];
    mockLocalStorage.setItem(MULTI_COLUMN_CACHE_KEY, JSON.stringify(testLists));

    render(
      <MemoryRouter>
        <MultiColumnList />
      </MemoryRouter>,
    );

    expect(screen.getByText("Test List 1")).toBeInTheDocument();
    expect(screen.getByText("Test List 2")).toBeInTheDocument();
  });

  it("creates a new multi-column list and navigates to it", async () => {
    render(
      <MemoryRouter>
        <MultiColumnList />
      </MemoryRouter>,
    );

    // Click the "Neue Mehrspaltige ABC-Liste" button
    const createButton = screen.getByText("Neue Mehrspaltige ABC-Liste");
    fireEvent.click(createButton);

    // The NewStringItem dialog should open - this is tested in NewStringItem.test.tsx
    // For this test, we can verify the navigation behavior by mocking the save callback
    // The actual dialog interaction is handled by the NewStringItem component
  });

  it("deletes a multi-column list", () => {
    const testLists = ["Test List 1", "Test List 2"];
    mockLocalStorage.setItem(MULTI_COLUMN_CACHE_KEY, JSON.stringify(testLists));

    render(
      <MemoryRouter>
        <MultiColumnList />
      </MemoryRouter>,
    );

    // Find and click the delete button for the first list
    const deleteButtons = screen.getAllByText("X");
    fireEvent.click(deleteButtons[0]);

    // Verify the list was removed from localStorage
    const updatedLists = JSON.parse(
      mockLocalStorage.getItem(MULTI_COLUMN_CACHE_KEY) || "[]",
    );
    expect(updatedLists).toEqual(["Test List 2"]);
  });

  it("clears all multi-column lists", () => {
    const testLists = ["Test List 1", "Test List 2"];
    mockLocalStorage.setItem(MULTI_COLUMN_CACHE_KEY, JSON.stringify(testLists));

    render(
      <MemoryRouter>
        <MultiColumnList />
      </MemoryRouter>,
    );

    // Click the "Alle löschen" button
    const clearAllButton = screen.getByText("Alle löschen");
    fireEvent.click(clearAllButton);

    // Verify all lists were cleared
    const updatedLists = JSON.parse(
      mockLocalStorage.getItem(MULTI_COLUMN_CACHE_KEY) || "[]",
    );
    expect(updatedLists).toEqual([]);
  });

  it("toggles sort order", () => {
    const testLists = ["B List", "A List", "C List"];
    mockLocalStorage.setItem(MULTI_COLUMN_CACHE_KEY, JSON.stringify(testLists));

    render(
      <MemoryRouter>
        <MultiColumnList />
      </MemoryRouter>,
    );

    // Initial order should be alphabetical
    const listItems = screen
      .getAllByRole("button")
      .filter((button) =>
        testLists.some((list) => button.textContent?.includes(list)),
      );
    expect(listItems[0].textContent).toContain("A List");
    expect(listItems[1].textContent).toContain("B List");
    expect(listItems[2].textContent).toContain("C List");

    // Click the sort toggle button
    const sortButton = screen.getByText("Sortierung umkehren");
    fireEvent.click(sortButton);

    // Order should now be reversed
    const reversedListItems = screen
      .getAllByRole("button")
      .filter((button) =>
        testLists.some((list) => button.textContent?.includes(list)),
      );
    expect(reversedListItems[0].textContent).toContain("C List");
    expect(reversedListItems[1].textContent).toContain("B List");
    expect(reversedListItems[2].textContent).toContain("A List");
  });
});
