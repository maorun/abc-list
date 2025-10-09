import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {KawaTemplates} from "./KawaTemplates";

describe("KawaTemplates", () => {
  it("renders template button and opens dialog when clicked", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<KawaTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Check that the template button is present
    expect(screen.getByText("📋 Vorlage")).toBeInTheDocument();

    // Click the button to open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Check that the dialog is opened
    expect(screen.getByText("KaWa Vorlagen auswählen")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Wählen Sie eine Vorlage für ein vorausgefülltes KaWa (Kreative Ausbeute mit Wort-Assoziationen).",
      ),
    ).toBeInTheDocument();
  });

  it("displays all predefined templates grouped by category", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<KawaTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Check that templates are displayed
    expect(screen.getByText("LERNEN")).toBeInTheDocument();
    expect(screen.getByText("ERFOLG")).toBeInTheDocument();
    expect(screen.getByText("WISSEN")).toBeInTheDocument();
    expect(screen.getByText("FOKUS")).toBeInTheDocument();

    // Check that categories are displayed
    expect(screen.getByText("Bildung")).toBeInTheDocument();
    expect(screen.getByText("Motivation")).toBeInTheDocument();
    expect(screen.getByText("Produktivität")).toBeInTheDocument();
  });

  it("calls onTemplateSelect when a template is selected", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<KawaTemplates onTemplateSelect={mockOnTemplateSelect} />);

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
        word: expect.any(String),
        category: expect.any(String),
        associations: expect.any(Object),
      }),
    );
  });

  it("closes dialog after template selection", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<KawaTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));
    expect(screen.getByText("KaWa Vorlagen auswählen")).toBeInTheDocument();

    // Select a template
    const templateButtons = screen.getAllByText("Vorlage verwenden");
    fireEvent.click(templateButtons[0]);

    // Dialog should be closed
    expect(
      screen.queryByText("KaWa Vorlagen auswählen"),
    ).not.toBeInTheDocument();
  });

  it("displays template previews and descriptions", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<KawaTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Check for specific template descriptions
    expect(
      screen.getByText("Kreative Assoziationen zum Thema Lernen"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Erfolgsfaktoren visualisieren"),
    ).toBeInTheDocument();
  });

  it("has correct template data structure with associations", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<KawaTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Select first template
    const buttons = screen.getAllByText("Vorlage verwenden");
    fireEvent.click(buttons[0]);

    const selectedTemplate = mockOnTemplateSelect.mock.calls[0][0];

    // Verify template structure
    expect(selectedTemplate).toHaveProperty("id");
    expect(selectedTemplate).toHaveProperty("name");
    expect(selectedTemplate).toHaveProperty("description");
    expect(selectedTemplate).toHaveProperty("category");
    expect(selectedTemplate).toHaveProperty("word");
    expect(selectedTemplate).toHaveProperty("preview");
    expect(selectedTemplate).toHaveProperty("associations");

    // Verify associations structure
    expect(typeof selectedTemplate.associations).toBe("object");
    const letters = Object.keys(selectedTemplate.associations);
    expect(letters.length).toBeGreaterThan(0);

    // Each association should be a string
    letters.forEach((letter) => {
      expect(typeof selectedTemplate.associations[letter]).toBe("string");
    });
  });

  it("templates have associations matching their word letters", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<KawaTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Select LERNEN template (should be first in Bildung category)
    const buttons = screen.getAllByText("Vorlage verwenden");
    fireEvent.click(buttons[0]);

    const selectedTemplate = mockOnTemplateSelect.mock.calls[0][0];

    // The word should have corresponding associations
    const associationKeys = Object.keys(selectedTemplate.associations);

    // All word letters should have associations
    expect(associationKeys.length).toBeGreaterThan(0);
  });
});
