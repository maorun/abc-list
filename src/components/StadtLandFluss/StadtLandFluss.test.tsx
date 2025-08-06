import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";
import {MemoryRouter} from "react-router-dom";
import {StadtLandFluss, cacheKey} from "./StadtLandFluss";

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

describe("StadtLandFluss", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedNavigate.mockClear();
  });

  it("renders the main heading", () => {
    render(
      <MemoryRouter>
        <StadtLandFluss />
      </MemoryRouter>,
    );
    expect(screen.getByText("Stadt-Land-Fluss Spiele")).toBeInTheDocument();
  });

  it("renders Birkenbihl explanation", () => {
    render(
      <MemoryRouter>
        <StadtLandFluss />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(/Stadt-Land-Fluss-Effekt.*Birkenbihl/),
    ).toBeInTheDocument();
  });

  it("renders new game button", () => {
    render(
      <MemoryRouter>
        <StadtLandFluss />
      </MemoryRouter>,
    );
    expect(
      screen.getByText("Neues Stadt-Land-Fluss Spiel"),
    ).toBeInTheDocument();
  });

  it("renders control buttons", () => {
    render(
      <MemoryRouter>
        <StadtLandFluss />
      </MemoryRouter>,
    );
    expect(screen.getByText("Alle löschen")).toBeInTheDocument();
    expect(screen.getByText("Sortierung umkehren")).toBeInTheDocument();
  });

  it("loads saved games from localStorage", () => {
    const testGames = ["Test Game 1", "Test Game 2"];
    localStorage.setItem(cacheKey, JSON.stringify(testGames));

    render(
      <MemoryRouter>
        <StadtLandFluss />
      </MemoryRouter>,
    );

    expect(screen.getByText("Test Game 1")).toBeInTheDocument();
    expect(screen.getByText("Test Game 2")).toBeInTheDocument();
  });

  it("navigates to game when clicked", () => {
    const testGames = ["Test Game"];
    localStorage.setItem(cacheKey, JSON.stringify(testGames));

    render(
      <MemoryRouter>
        <StadtLandFluss />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Test Game"));
    expect(mockedNavigate).toHaveBeenCalledWith("/slf/Test Game");
  });

  it("reverses sort order when sort button is clicked", () => {
    const testGames = ["A Game", "Z Game"];
    localStorage.setItem(cacheKey, JSON.stringify(testGames));

    render(
      <MemoryRouter>
        <StadtLandFluss />
      </MemoryRouter>,
    );

    const buttons = screen.getAllByRole("button");
    const gameButtons = buttons.filter(
      (button) =>
        button.textContent === "A Game" || button.textContent === "Z Game",
    );

    // Initially A should come before Z
    expect(gameButtons[0]).toHaveTextContent("A Game");
    expect(gameButtons[1]).toHaveTextContent("Z Game");

    // Click sort reverse button
    fireEvent.click(screen.getByText("Sortierung umkehren"));

    // After reverse, Z should come before A
    const reversedButtons = screen.getAllByRole("button");
    const reversedGameButtons = reversedButtons.filter(
      (button) =>
        button.textContent === "A Game" || button.textContent === "Z Game",
    );
    expect(reversedGameButtons[0]).toHaveTextContent("Z Game");
    expect(reversedGameButtons[1]).toHaveTextContent("A Game");
  });
});
