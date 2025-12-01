import {describe, it, expect, beforeEach, vi} from "vitest";
import {render, screen, waitFor, fireEvent} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import {LocusMethode} from "./LocusMethode";
import {LocusMethodeService} from "@/lib/LocusMethodeService";

// Mock useGamification hook
vi.mock("@/hooks/useGamification", () => ({
  useGamification: () => ({
    trackListCreated: vi.fn(),
  }),
}));

describe("LocusMethode", () => {
  let service: LocusMethodeService;

  beforeEach(() => {
    localStorage.clear();
    LocusMethodeService.resetInstance();
    service = LocusMethodeService.getInstance();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <LocusMethode />
      </BrowserRouter>,
    );
  };

  it("should render the component title", () => {
    renderComponent();
    expect(screen.getByText("Loci-Methode")).toBeInTheDocument();
  });

  it("should show create button", () => {
    renderComponent();
    expect(screen.getByText("Neuer Gedächtnispalast")).toBeInTheDocument();
  });

  it("should show empty state when no palaces exist", () => {
    renderComponent();
    expect(
      screen.getByText("Noch keine Gedächtnispaläste vorhanden."),
    ).toBeInTheDocument();
  });

  it("should display existing palaces", async () => {
    service.createPalace("Test Palace", "haus");

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Test Palace")).toBeInTheDocument();
    });
  });

  it("should open create dialog when button is clicked", async () => {
    renderComponent();

    const createButton = screen.getByText("Neuer Gedächtnispalast");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByText("Neuen Gedächtnispalast erstellen"),
      ).toBeInTheDocument();
    });
  });

  it("should show statistics when palaces exist", async () => {
    service.createPalace("Test Palace 1", "haus");
    service.createPalace("Test Palace 2", "buero");

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Gedächtnispaläste")).toBeInTheDocument();
      expect(screen.getByText("Gespeicherte Objekte")).toBeInTheDocument();
      expect(screen.getByText("Gedächtnisrouten")).toBeInTheDocument();
    });
  });

  it("should display palace with correct template and object count", async () => {
    const palace = service.createPalace("My Palace", "natur");
    service.addObject(palace.id, "Object 1", 10, 10);
    service.addObject(palace.id, "Object 2", 20, 20);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("My Palace")).toBeInTheDocument();
      expect(
        screen.getByText(/Natur.*2 Objekte.*0 Routen/),
      ).toBeInTheDocument();
    });
  });
});
