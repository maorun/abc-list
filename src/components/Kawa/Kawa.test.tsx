import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";
import {MemoryRouter} from "react-router-dom";
import {Kawa} from "./Kawa";
import {NewItemWithSaveKey} from "../NewStringItem";

// Mock localStorage
const localStorageMock = (() => {
  let store: {[key: string]: string} = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
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

describe("Kawa", () => {
  const storageKey = "Kawas";

  beforeEach(() => {
    localStorage.clear();
    mockedNavigate.mockClear();
  });

  it("loads and displays kawas from localStorage", () => {
    const testKawas: NewItemWithSaveKey[] = [{key: "1", text: "Kawa 1"}];
    localStorage.setItem(storageKey, JSON.stringify(testKawas));
    render(<Kawa />, {wrapper: MemoryRouter});
    expect(screen.getByRole("button", {name: "Kawa 1"})).toBeInTheDocument();
  });

  it("creates a new kawa, saves it, and navigates", () => {
    render(<Kawa />, {wrapper: MemoryRouter});

    fireEvent.click(screen.getByRole("button", {name: "Neues Kawa"}));

    const input = screen.getByPlaceholderText("Enter text...");
    fireEvent.change(input, {target: {value: "Neues Kawa Item"}});
    fireEvent.click(screen.getByRole("button", {name: "Speichern"}));

    expect(
      screen.getByRole("button", {name: "Neues Kawa Item"}),
    ).toBeInTheDocument();
    const stored = JSON.parse(
      localStorage.getItem(storageKey) || "[]",
    ) as NewItemWithSaveKey[];
    expect(stored).toHaveLength(1);
    expect(stored[0].text).toBe("Neues Kawa Item");
    expect(mockedNavigate).toHaveBeenCalledWith(`/kawa/${stored[0].key}`, {
      state: {item: stored[0]},
    });
  });

  it("navigates to item page on click", () => {
    const testKawas: NewItemWithSaveKey[] = [{key: "1", text: "Kawa 1"}];
    localStorage.setItem(storageKey, JSON.stringify(testKawas));
    render(<Kawa />, {wrapper: MemoryRouter});

    fireEvent.click(screen.getByRole("button", {name: "Kawa 1"}));
    expect(mockedNavigate).toHaveBeenCalledWith("/kawa/1", {
      state: {item: testKawas[0]},
    });
  });

  it("opens delete confirmation on right-click", () => {
    const testKawas: NewItemWithSaveKey[] = [{key: "1", text: "Kawa 1"}];
    localStorage.setItem(storageKey, JSON.stringify(testKawas));
    render(<Kawa />, {wrapper: MemoryRouter});

    fireEvent.contextMenu(screen.getByRole("button", {name: "Kawa 1"}));
    expect(screen.getByText("Wirklich löschen?")).toBeInTheDocument();
  });

  it("deletes a kawa when confirmed", () => {
    const testKawas: NewItemWithSaveKey[] = [{key: "1", text: "Kawa 1"}];
    localStorage.setItem(storageKey, JSON.stringify(testKawas));
    render(<Kawa />, {wrapper: MemoryRouter});

    fireEvent.contextMenu(screen.getByRole("button", {name: "Kawa 1"}));
    fireEvent.click(screen.getByRole("button", {name: "Ja"}));

    expect(
      screen.queryByRole("button", {name: "Kawa 1"}),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem(storageKey)).toBe("[]");
    expect(screen.queryByText("Wirklich löschen?")).not.toBeInTheDocument();
  });

  it('aborts deletion when "Nein" is clicked', () => {
    const testKawas: NewItemWithSaveKey[] = [{key: "1", text: "Kawa 1"}];
    localStorage.setItem(storageKey, JSON.stringify(testKawas));
    render(<Kawa />, {wrapper: MemoryRouter});

    fireEvent.contextMenu(screen.getByRole("button", {name: "Kawa 1"}));
    fireEvent.click(screen.getByRole("button", {name: "Nein"}));

    expect(screen.getByRole("button", {name: "Kawa 1"})).toBeInTheDocument();
    expect(localStorage.getItem(storageKey)).toBe(JSON.stringify(testKawas));
    expect(screen.queryByText("Wirklich löschen?")).not.toBeInTheDocument();
  });
});
