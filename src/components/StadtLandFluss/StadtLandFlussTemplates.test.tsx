import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {StadtLandFlussTemplates} from "./StadtLandFlussTemplates";

describe("StadtLandFlussTemplates", () => {
  it("renders template button and opens dialog when clicked", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<StadtLandFlussTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Check that the template button is present
    expect(screen.getByText("📋 Vorlage")).toBeInTheDocument();

    // Click the button to open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Check that the dialog is opened
    expect(
      screen.getByText("Stadt-Land-Fluss Vorlagen auswählen"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Wählen Sie eine Vorlage mit vordefinierten Kategorien für Ihr Stadt-Land-Fluss Spiel.",
      ),
    ).toBeInTheDocument();
  });

  it("displays all predefined templates grouped by category", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<StadtLandFlussTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Check that templates are displayed
    expect(screen.getByText("Klassisch")).toBeInTheDocument();
    expect(screen.getByText("Erweitert")).toBeInTheDocument();
    expect(screen.getByText("Geographie")).toBeInTheDocument();
    expect(screen.getByText("Natur")).toBeInTheDocument();

    // Check that categories are displayed
    expect(screen.getByText("Standard")).toBeInTheDocument();
    expect(screen.getByText("Erdkunde")).toBeInTheDocument();
    expect(screen.getByText("Biologie")).toBeInTheDocument();
  });

  it("calls onTemplateSelect when a template is selected", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<StadtLandFlussTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Find and click on the first "Vorlage verwenden" button
    const templateButtons = screen.getAllByText("Vorlage verwenden");
    fireEvent.click(templateButtons[0]);

    // Check that the callback was called
    expect(mockOnTemplateSelect).toHaveBeenCalledTimes(1);
    expect(mockOnTemplateSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        category: expect.any(String),
        categories: expect.any(Array),
      }),
    );
  });

  it("closes dialog after template selection", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<StadtLandFlussTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));
    expect(
      screen.getByText("Stadt-Land-Fluss Vorlagen auswählen"),
    ).toBeInTheDocument();

    // Select a template
    const templateButtons = screen.getAllByText("Vorlage verwenden");
    fireEvent.click(templateButtons[0]);

    // Dialog should be closed
    expect(
      screen.queryByText("Stadt-Land-Fluss Vorlagen auswählen"),
    ).not.toBeInTheDocument();
  });

  it("displays template previews and descriptions", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<StadtLandFlussTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Check for specific template descriptions
    expect(
      screen.getByText("Die traditionelle Version mit Grundkategorien"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Fokus auf geografische Begriffe"),
    ).toBeInTheDocument();
  });

  it("displays category count for each template", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<StadtLandFlussTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Should show category counts like "8 Kategorien:"
    const categoryTexts = screen.getAllByText(/\d+ Kategorien:/);
    expect(categoryTexts.length).toBeGreaterThan(0);
  });

  it("has correct template data structure with categories array", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<StadtLandFlussTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Select first template (Klassisch)
    const buttons = screen.getAllByText("Vorlage verwenden");
    fireEvent.click(buttons[0]);

    const selectedTemplate = mockOnTemplateSelect.mock.calls[0][0];

    // Verify template structure
    expect(selectedTemplate).toHaveProperty("id");
    expect(selectedTemplate).toHaveProperty("name");
    expect(selectedTemplate).toHaveProperty("description");
    expect(selectedTemplate).toHaveProperty("category");
    expect(selectedTemplate).toHaveProperty("preview");
    expect(selectedTemplate).toHaveProperty("categories");

    // Verify categories is an array of strings
    expect(Array.isArray(selectedTemplate.categories)).toBe(true);
    expect(selectedTemplate.categories.length).toBeGreaterThan(0);
    selectedTemplate.categories.forEach((category: string) => {
      expect(typeof category).toBe("string");
    });
  });

  it("klassisch template has correct default categories", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<StadtLandFlussTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Select Klassisch template
    const buttons = screen.getAllByText("Vorlage verwenden");
    fireEvent.click(buttons[0]);

    const selectedTemplate = mockOnTemplateSelect.mock.calls[0][0];

    // Verify it has the classic categories
    expect(selectedTemplate.categories).toContain("Stadt");
    expect(selectedTemplate.categories).toContain("Land");
    expect(selectedTemplate.categories).toContain("Fluss");
    expect(selectedTemplate.categories).toContain("Tier");
  });

  it("shows preview of first categories in template card", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<StadtLandFlussTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Should show previews like "Hauptstadt, Land, Fluss/Gewässer..."
    // Check that some category names appear in the preview text
    expect(screen.getByText(/Hauptstadt, Land,/)).toBeInTheDocument();
  });
});
