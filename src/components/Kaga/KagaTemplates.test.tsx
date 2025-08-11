import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {KagaTemplates} from "./KagaTemplates";

describe("KagaTemplates", () => {
  it("renders template button and opens dialog when clicked", () => {
    const mockOnTemplateSelect = vi.fn();
    
    render(<KagaTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Check that the template button is present
    expect(screen.getByText("📋 Vorlage")).toBeInTheDocument();

    // Click the button to open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Check that the dialog is opened
    expect(screen.getByText("KaGa-Vorlagen auswählen")).toBeInTheDocument();
    expect(screen.getByText("Wählen Sie eine Vorlage, um schnell mit einer strukturierten KaGa zu beginnen.")).toBeInTheDocument();
  });

  it("displays all predefined templates", () => {
    const mockOnTemplateSelect = vi.fn();
    
    render(<KagaTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Check that all templates are displayed
    expect(screen.getByText("Mind Map")).toBeInTheDocument();
    expect(screen.getByText("Prozessablauf")).toBeInTheDocument();
    expect(screen.getByText("Vergleich")).toBeInTheDocument();
    expect(screen.getByText("Lernnotizen")).toBeInTheDocument();

    // Check template descriptions
    expect(screen.getByText("Zentrales Thema mit Ästen für Unterthemen")).toBeInTheDocument();
    expect(screen.getByText("Schrittweise Darstellung von Abläufen")).toBeInTheDocument();
  });

  it("calls onTemplateSelect when a template is selected", () => {
    const mockOnTemplateSelect = vi.fn();
    
    render(<KagaTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Click on the first template
    const templateButtons = screen.getAllByText("Vorlage verwenden");
    fireEvent.click(templateButtons[0]);

    // Check that the callback was called
    expect(mockOnTemplateSelect).toHaveBeenCalledTimes(1);
    expect(mockOnTemplateSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "mind-map",
        name: "Mind Map",
        description: "Zentrales Thema mit Ästen für Unterthemen",
      })
    );
  });
});