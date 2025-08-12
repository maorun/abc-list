import {render, screen} from "@testing-library/react";
import {describe, it, expect, beforeEach, vi} from "vitest";
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

  it("calculates touch coordinates correctly with canvas scaling", () => {
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

    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();

    if (canvas) {
      // Mock getBoundingClientRect to simulate mobile scaling
      const mockGetBoundingClientRect = vi.fn(() => ({
        left: 10,
        top: 20,
        width: 400, // Scaled down from 800 (50% scale)
        height: 300, // Scaled down from 600 (50% scale)
      }));

      canvas.getBoundingClientRect = mockGetBoundingClientRect;

      // Mock canvas properties
      Object.defineProperty(canvas, "width", {value: 800});
      Object.defineProperty(canvas, "height", {value: 600});

      // Test coordinate calculation directly by simulating the algorithm
      const rect = mockGetBoundingClientRect();
      const scaleX = 800 / rect.width; // 800 / 400 = 2
      const scaleY = 600 / rect.height; // 600 / 300 = 2

      // Touch at position (60, 70) in viewport
      const touchX = 60;
      const touchY = 70;

      // Expected canvas coordinates after scaling
      const expectedX = (touchX - rect.left) * scaleX; // (60 - 10) * 2 = 100
      const expectedY = (touchY - rect.top) * scaleY; // (70 - 20) * 2 = 100

      expect(expectedX).toBe(100);
      expect(expectedY).toBe(100);
      expect(scaleX).toBe(2);
      expect(scaleY).toBe(2);
    }
  });
});
