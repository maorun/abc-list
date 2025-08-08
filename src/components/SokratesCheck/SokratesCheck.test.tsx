import {render, screen} from "@testing-library/react";
import {describe, it, expect, beforeEach, vi} from "vitest";
import {SokratesCheck} from "./SokratesCheck";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("SokratesCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("should render the main title and description", () => {
    render(<SokratesCheck />);
    expect(screen.getByText("Sokrates-Check")).toBeInTheDocument();
    expect(
      screen.getByText("💡 Was ist der Sokrates-Check?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Der Sokrates-Check ist ein wichtiges Birkenbihl-Tool/),
    ).toBeInTheDocument();
  });

  it("should show dashboard and review buttons", () => {
    render(<SokratesCheck />);
    expect(
      screen.getByRole("button", {name: /📊 Dashboard/}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {name: /📚 Überprüfen/}),
    ).toBeInTheDocument();
  });

  it("should load terms from localStorage when available", () => {
    // Mock localStorage data
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === "abcLists") {
        return JSON.stringify(["Test List"]);
      }
      if (key === "abcList-Test List:a") {
        return JSON.stringify([
          {
            text: "Apple",
            explanation: "A fruit",
            rating: 3,
            version: 1,
            imported: false,
          },
        ]);
      }
      return null;
    });

    render(<SokratesCheck />);

    // Check that localStorage was called correctly
    expect(localStorageMock.getItem).toHaveBeenCalledWith("abcLists");
    expect(localStorageMock.getItem).toHaveBeenCalledWith(
      "abcList-Test List:a",
    );
  });

  it("should handle empty localStorage gracefully", () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(<SokratesCheck />);

    // Should still render without errors
    expect(screen.getByText("Sokrates-Check")).toBeInTheDocument();
  });
});
