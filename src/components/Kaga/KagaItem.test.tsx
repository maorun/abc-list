import {render, screen} from "@testing-library/react";
import {describe, it, expect, beforeEach} from "vitest";
import {MemoryRouter} from "react-router-dom";
import {KagaItem} from "./KagaItem";
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

// Mock HTMLCanvasElement methods
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = () =>
    ({
      clearRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fillText: () => {},
      set fillStyle(_value: string) {},
      set strokeStyle(_value: string) {},
      set lineWidth(_value: number) {},
      set lineCap(_value: string) {},
      set lineJoin(_value: string) {},
      set font(_value: string) {},
    }) as CanvasRenderingContext2D;
});

describe("KagaItem", () => {
  const mockItem: NewItemWithSaveKey = {
    key: "test-key",
    text: "Test Topic",
  };

  beforeEach(() => {
    localStorageMock.clear();
  });

  it("renders canvas and tools when item is provided", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/kaga/test-key",
            state: {item: mockItem},
          },
        ]}
      >
        <KagaItem />
      </MemoryRouter>,
    );

    // Check for the title
    expect(screen.getByText('KaGa für "Test Topic"')).toBeInTheDocument();

    // Check for drawing tools
    expect(screen.getByText("Werkzeug:")).toBeInTheDocument();
    expect(screen.getByText("✏️ Stift")).toBeInTheDocument();
    expect(screen.getByText("📝 Text")).toBeInTheDocument();
    
    // Check for shape tools
    expect(screen.getByText("Formen:")).toBeInTheDocument();
    expect(screen.getByText("⬜ Rechteck")).toBeInTheDocument();
    expect(screen.getByText("⭕ Kreis")).toBeInTheDocument();
    expect(screen.getByText("📏 Linie")).toBeInTheDocument();
    expect(screen.getByText("➡️ Pfeil")).toBeInTheDocument();
    
    expect(screen.getByText("Farbe:")).toBeInTheDocument();
    expect(screen.getByText("Größe:")).toBeInTheDocument();

    // Check for action buttons
    expect(screen.getByText("↶ Rückgängig")).toBeInTheDocument();
    expect(screen.getByText("↷ Wiederholen")).toBeInTheDocument();
    expect(screen.getByText("📋 Vorlage")).toBeInTheDocument();
    expect(screen.getByText("💾 Speichern")).toBeInTheDocument();
    expect(screen.getByText("🗑️ Löschen")).toBeInTheDocument();

    // Check that undo/redo buttons start disabled
    expect(screen.getByText("↶ Rückgängig")).toBeDisabled();
    expect(screen.getByText("↷ Wiederholen")).toBeDisabled();

    // Check for canvas
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();

    // Check for instructions
    expect(
      screen.getByText(
        /Zeichne frei, füge Text hinzu und erstelle visuelle Assoziationen/,
      ),
    ).toBeInTheDocument();
  });

  it("shows error message when no item is provided", () => {
    render(
      <MemoryRouter initialEntries={["/kaga/test-key"]}>
        <KagaItem />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("KaGa nicht gefunden. Bitte gehe zurück zur Übersicht."),
    ).toBeInTheDocument();
  });

  it("updates document title with item text", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/kaga/test-key",
            state: {item: mockItem},
          },
        ]}
      >
        <KagaItem />
      </MemoryRouter>,
    );

    expect(document.title).toBe("KaGa für Test Topic");
  });
});
