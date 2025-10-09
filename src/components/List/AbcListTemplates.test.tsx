import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {AbcListTemplates} from "./AbcListTemplates";

describe("AbcListTemplates", () => {
  it("renders template button and opens dialog when clicked", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<AbcListTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Check that the template button is present
    expect(screen.getByText("📋 Vorlage")).toBeInTheDocument();

    // Click the button to open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Check that the dialog is opened
    expect(
      screen.getByText("ABC-Listen Vorlagen auswählen"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Wählen Sie eine Vorlage, um schnell mit einer vorausgefüllten ABC-Liste für verschiedene Fachbereiche zu beginnen.",
      ),
    ).toBeInTheDocument();
  });

  it("displays all predefined templates grouped by category", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<AbcListTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Check that templates are displayed
    expect(screen.getByText("Mathematik Grundlagen")).toBeInTheDocument();
    expect(screen.getByText("Englisch Grundwortschatz")).toBeInTheDocument();
    expect(screen.getByText("Biologie: Die Zelle")).toBeInTheDocument();
    expect(screen.getByText("Geschichte: Antike")).toBeInTheDocument();

    // Check that categories are displayed
    expect(screen.getByText("Mathematik")).toBeInTheDocument();
    expect(screen.getByText("Sprachen")).toBeInTheDocument();
    expect(screen.getByText("Biologie")).toBeInTheDocument();
  });

  it("calls onTemplateSelect when a template is selected", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<AbcListTemplates onTemplateSelect={mockOnTemplateSelect} />);

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
        data: expect.any(Object),
      }),
    );
  });

  it("closes dialog after template selection", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<AbcListTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));
    expect(
      screen.getByText("ABC-Listen Vorlagen auswählen"),
    ).toBeInTheDocument();

    // Select a template
    const templateButtons = screen.getAllByText("Vorlage verwenden");
    fireEvent.click(templateButtons[0]);

    // Dialog should be closed - title should not be visible
    expect(
      screen.queryByText("ABC-Listen Vorlagen auswählen"),
    ).not.toBeInTheDocument();
  });

  it("displays template previews and descriptions", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<AbcListTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Check for specific template descriptions
    expect(
      screen.getByText("Basis-Begriffe der Mathematik für Schüler"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Wichtige englische Vokabeln für Anfänger"),
    ).toBeInTheDocument();
  });

  it("has correct template data structure", () => {
    const mockOnTemplateSelect = vi.fn();

    render(<AbcListTemplates onTemplateSelect={mockOnTemplateSelect} />);

    // Open the dialog
    fireEvent.click(screen.getByText("📋 Vorlage"));

    // Select Mathematik template
    const buttons = screen.getAllByText("Vorlage verwenden");
    fireEvent.click(buttons[0]);

    const selectedTemplate = mockOnTemplateSelect.mock.calls[0][0];

    // Verify template structure
    expect(selectedTemplate).toHaveProperty("id");
    expect(selectedTemplate).toHaveProperty("name");
    expect(selectedTemplate).toHaveProperty("description");
    expect(selectedTemplate).toHaveProperty("category");
    expect(selectedTemplate).toHaveProperty("preview");
    expect(selectedTemplate).toHaveProperty("data");

    // Verify data contains letters and words
    expect(typeof selectedTemplate.data).toBe("object");
    const firstLetter = Object.keys(selectedTemplate.data)[0];
    expect(Array.isArray(selectedTemplate.data[firstLetter])).toBe(true);

    if (selectedTemplate.data[firstLetter].length > 0) {
      const firstWord = selectedTemplate.data[firstLetter][0];
      expect(firstWord).toHaveProperty("text");
      expect(typeof firstWord.text).toBe("string");
    }
  });
});
