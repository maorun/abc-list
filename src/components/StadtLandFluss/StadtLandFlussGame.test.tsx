import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {MemoryRouter} from "react-router-dom";
import {StadtLandFlussGame} from "./StadtLandFlussGame";

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

// Mock useParams
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({game: "Test Game"}),
  };
});

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("StadtLandFlussGame", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders the game title", () => {
    render(
      <MemoryRouter>
        <StadtLandFlussGame />
      </MemoryRouter>,
    );
    expect(screen.getByText("Stadt-Land-Fluss: Test Game")).toBeInTheDocument();
  });

  it("shows default categories", () => {
    render(
      <MemoryRouter>
        <StadtLandFlussGame />
      </MemoryRouter>,
    );
    expect(screen.getByText("Stadt")).toBeInTheDocument();
    expect(screen.getByText("Land")).toBeInTheDocument();
    expect(screen.getByText("Fluss")).toBeInTheDocument();
  });

  it("shows game controls", () => {
    render(
      <MemoryRouter>
        <StadtLandFlussGame />
      </MemoryRouter>,
    );
    expect(screen.getByText("Spiel starten")).toBeInTheDocument();
    expect(screen.getByText("Spiel zurücksetzen")).toBeInTheDocument();
    expect(screen.getByText("Spielzeit:")).toBeInTheDocument();
  });

  it("starts a new round when start button is clicked", () => {
    render(
      <MemoryRouter>
        <StadtLandFlussGame />
      </MemoryRouter>,
    );

    const startButton = screen.getByText("Spiel starten");
    fireEvent.click(startButton);

    // After clicking start, the game should be active and show current round info
    expect(screen.getByText(/Buchstabe:/)).toBeInTheDocument();
    expect(screen.getByText(/Zeit:/)).toBeInTheDocument();
    expect(screen.getByText("Runde beenden")).toBeInTheDocument();
  });

  it("allows editing categories", () => {
    render(
      <MemoryRouter>
        <StadtLandFlussGame />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Bearbeiten"));

    const input = screen.getByPlaceholderText("Neue Kategorie...");
    fireEvent.change(input, {target: {value: "Musik"}});
    fireEvent.click(screen.getByText("Hinzufügen"));

    expect(screen.getByText("Musik")).toBeInTheDocument();
  });

  it("allows removing categories when editing", () => {
    render(
      <MemoryRouter>
        <StadtLandFlussGame />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Bearbeiten"));

    // Find the first category remove button (×)
    const removeButtons = screen.getAllByText("×");
    fireEvent.click(removeButtons[0]);

    // Stadt should be removed (assuming it was first)
    expect(screen.queryByText("Stadt")).not.toBeInTheDocument();
  });

  it("shows game time options", () => {
    render(
      <MemoryRouter>
        <StadtLandFlussGame />
      </MemoryRouter>,
    );

    const select = screen.getByDisplayValue("2 Minuten");
    expect(select).toBeInTheDocument();

    fireEvent.change(select, {target: {value: "180"}});
    expect(screen.getByDisplayValue("3 Minuten")).toBeInTheDocument();
  });

  it("displays total score", () => {
    render(
      <MemoryRouter>
        <StadtLandFlussGame />
      </MemoryRouter>,
    );
    expect(screen.getByText("Gesamtpunkte: 0")).toBeInTheDocument();
  });
});
