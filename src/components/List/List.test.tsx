import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";
import {MemoryRouter} from "react-router-dom";
import {List, cacheKey} from "./List";

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

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("List", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedNavigate.mockClear();
  });

  it("should load and display items from localStorage", () => {
    const testData = ["Liste 1", "Liste 2"];
    localStorage.setItem(cacheKey, JSON.stringify(testData));
    render(<List />, {wrapper: MemoryRouter});
    expect(screen.getByText("Liste 1")).toBeInTheDocument();
    expect(screen.getByText("Liste 2")).toBeInTheDocument();
  });

  it("should delete an item when delete button is clicked", () => {
    const testData = ["Liste 1", "Liste 2"];
    localStorage.setItem(cacheKey, JSON.stringify(testData));
    localStorage.setItem("abcList-Liste 1", "some-data");
    render(<List />, {wrapper: MemoryRouter});

    const deleteButton = screen.getAllByRole("button", {name: "✕"})[0];
    fireEvent.click(deleteButton);

    expect(screen.queryByText("Liste 1")).not.toBeInTheDocument();
    expect(screen.getByText("Liste 2")).toBeInTheDocument();
    expect(localStorage.getItem(cacheKey)).toBe(JSON.stringify(["Liste 2"]));
    expect(localStorage.getItem("abcList-Liste 1")).toBeNull();
  });

  it("should navigate to the item page on click", () => {
    const testData = ["Liste 1"];
    localStorage.setItem(cacheKey, JSON.stringify(testData));
    render(<List />, {wrapper: MemoryRouter});

    fireEvent.click(screen.getByRole("button", {name: "Liste 1"}));
    expect(mockedNavigate).toHaveBeenCalledWith("/list/Liste 1");
  });

  it("should create a new item and navigate to it", () => {
    render(<List />, {wrapper: MemoryRouter});

    // Simulate creating a new item through NewStringItem
    fireEvent.click(screen.getByRole("button", {name: /neue abc-liste/i}));

    const input = screen.getByPlaceholderText("Enter text...");
    fireEvent.change(input, {target: {value: "Neue Liste"}});
    fireEvent.click(screen.getByRole("button", {name: /speichern/i}));

    expect(screen.getByText("Neue Liste")).toBeInTheDocument();
    expect(localStorage.getItem(cacheKey)).toBe(JSON.stringify(["Neue Liste"]));
    expect(mockedNavigate).toHaveBeenCalledWith("/list/Neue Liste");
  });

  it("should add, delete, and add another item", async () => {
    render(<List />, {wrapper: MemoryRouter});

    // Add first item
    fireEvent.click(screen.getByRole("button", {name: /neue abc-liste/i}));
    fireEvent.change(screen.getByPlaceholderText("Enter text..."), {
      target: {value: "First Item"},
    });
    fireEvent.click(screen.getByRole("button", {name: /speichern/i}));
    expect(await screen.findByText("First Item")).toBeInTheDocument();

    // Delete the item
    const deleteButton = screen.getAllByRole("button", {name: "✕"})[0];
    fireEvent.click(deleteButton);
    expect(screen.queryByText("First Item")).not.toBeInTheDocument();

    // Add second item
    fireEvent.click(screen.getByRole("button", {name: /neue abc-liste/i}));
    fireEvent.change(screen.getByPlaceholderText("Enter text..."), {
      target: {value: "Second Item"},
    });
    fireEvent.click(screen.getByRole("button", {name: /speichern/i}));
    expect(await screen.findByText("Second Item")).toBeInTheDocument();
  });

  it("should clear all items when clear button is clicked", () => {
    const testData = ["Item 1", "Item 2"];
    localStorage.setItem(cacheKey, JSON.stringify(testData));
    render(<List />, {wrapper: MemoryRouter});

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();

    const clearButton = screen.getByRole("button", {name: "Alle löschen"});
    fireEvent.click(clearButton);

    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Item 2")).not.toBeInTheDocument();
    expect(localStorage.getItem(cacheKey)).toBe(JSON.stringify([]));
  });

  it("should reverse the order of items when reverse button is clicked", () => {
    const testData = ["A", "B", "C"];
    localStorage.setItem(cacheKey, JSON.stringify(testData));
    render(<List />, {wrapper: MemoryRouter});

    const listItems = screen.getAllByRole("listitem");
    // The buttons inside the list items are what we can assert on
    expect(listItems[0].querySelector("button")).toHaveTextContent("A");
    expect(listItems[1].querySelector("button")).toHaveTextContent("B");
    expect(listItems[2].querySelector("button")).toHaveTextContent("C");

    const reverseButton = screen.getByRole("button", {
      name: "Sortierung umkehren",
    });
    fireEvent.click(reverseButton);

    const reversedListItems = screen.getAllByRole("listitem");
    expect(reversedListItems[0].querySelector("button")).toHaveTextContent("C");
    expect(reversedListItems[1].querySelector("button")).toHaveTextContent("B");
    expect(reversedListItems[2].querySelector("button")).toHaveTextContent("A");
  });
});
