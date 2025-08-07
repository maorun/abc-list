import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";
import {MemoryRouter} from "react-router-dom";
import {Kaga} from "./Kaga";
import {NewItemWithSaveKey} from "../NewStringItem";

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

Object.defineProperty(window, "localStorage", {value: localStorageMock});

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Kaga", () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockNavigate.mockClear();
  });

  it("renders the new KaGa button and title", () => {
    render(
      <MemoryRouter>
        <Kaga />
      </MemoryRouter>,
    );

    expect(screen.getByText("Neues KaGa")).toBeInTheDocument();
    expect(screen.getByText("Bisherige KaGas")).toBeInTheDocument();
    expect(
      screen.getByText("Tipp: Rechtsklick zum Löschen"),
    ).toBeInTheDocument();
  });

  it("loads saved KaGas from localStorage", () => {
    const testKagas: NewItemWithSaveKey[] = [
      {key: "1", text: "Test KaGa 1"},
      {key: "2", text: "Test KaGa 2"},
    ];
    localStorageMock.setItem("Kagas", JSON.stringify(testKagas));

    render(
      <MemoryRouter>
        <Kaga />
      </MemoryRouter>,
    );

    expect(screen.getByText("Test KaGa 1")).toBeInTheDocument();
    expect(screen.getByText("Test KaGa 2")).toBeInTheDocument();
  });

  it("creates a new KaGa when form is submitted", () => {
    render(
      <MemoryRouter>
        <Kaga />
      </MemoryRouter>,
    );

    // Click the "Neues KaGa" button
    fireEvent.click(screen.getByText("Neues KaGa"));

    // Fill in the form
    const input = screen.getByPlaceholderText("Enter text...");
    fireEvent.change(input, {target: {value: "Learning KaGa"}});

    // Submit the form
    fireEvent.click(screen.getByText("Speichern"));

    // Check that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringMatching(/^\/kaga\/.+$/),
      expect.objectContaining({
        state: expect.objectContaining({
          item: expect.objectContaining({
            text: "Learning KaGa",
          }),
        }),
      }),
    );
  });

  it("navigates to KaGa item when clicked", () => {
    const testKagas: NewItemWithSaveKey[] = [
      {key: "test-key", text: "Clickable KaGa"},
    ];
    localStorageMock.setItem("Kagas", JSON.stringify(testKagas));

    render(
      <MemoryRouter>
        <Kaga />
      </MemoryRouter>,
    );

    // Click on the KaGa item
    fireEvent.click(screen.getByText("Clickable KaGa"));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/kaga/test-key",
      expect.objectContaining({
        state: expect.objectContaining({
          item: testKagas[0],
        }),
      }),
    );
  });

  it("shows delete confirmation on right click", () => {
    const testKagas: NewItemWithSaveKey[] = [
      {key: "delete-key", text: "Delete Me KaGa"},
    ];
    localStorageMock.setItem("Kagas", JSON.stringify(testKagas));

    render(
      <MemoryRouter>
        <Kaga />
      </MemoryRouter>,
    );

    // Right click on the KaGa item
    fireEvent.contextMenu(screen.getByText("Delete Me KaGa"));

    // Check that delete confirmation is shown
    expect(screen.getByText("Löschen bestätigen")).toBeInTheDocument();
  });

  it("deletes KaGa and removes canvas data when confirmed", () => {
    const testKagas: NewItemWithSaveKey[] = [
      {key: "delete-key", text: "Delete Me KaGa"},
    ];
    localStorageMock.setItem("Kagas", JSON.stringify(testKagas));
    localStorageMock.setItem("kagaCanvas-delete-key", "canvas-data");

    render(
      <MemoryRouter>
        <Kaga />
      </MemoryRouter>,
    );

    // Right click to show delete confirmation
    fireEvent.contextMenu(screen.getByText("Delete Me KaGa"));

    // Confirm deletion
    fireEvent.click(screen.getByText("Ja"));

    // Check that the KaGa is removed from the list
    expect(screen.queryByText("Delete Me KaGa")).not.toBeInTheDocument();

    // Check that both the KaGas list and canvas data are removed from localStorage
    expect(localStorageMock.getItem("Kagas")).toBe("[]");
    expect(localStorageMock.getItem("kagaCanvas-delete-key")).toBe(null);
  });
});
