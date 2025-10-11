import {describe, it, expect, vi} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import {SymbolPicker} from "./SymbolPicker";

describe("SymbolPicker", () => {
  const mockOnClose = vi.fn();
  const mockOnSelect = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render when open", () => {
    render(
      <SymbolPicker
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByText("Symbol wählen")).toBeInTheDocument();
    expect(
      screen.getByText(/Wähle ein visuelles Symbol für besseres Einprägen/),
    ).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(
      <SymbolPicker
        isOpen={false}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.queryByText("Symbol wählen")).not.toBeInTheDocument();
  });

  it("should render category filters", () => {
    render(
      <SymbolPicker
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByText("Alle")).toBeInTheDocument();
    expect(screen.getByText("Wissenschaft")).toBeInTheDocument();
    expect(screen.getByText("Mathematik")).toBeInTheDocument();
    expect(screen.getByText("Sprachen")).toBeInTheDocument();
  });

  it("should filter symbols by category", () => {
    render(
      <SymbolPicker
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />,
    );

    const wissenschaftButton = screen.getByText("Wissenschaft");
    fireEvent.click(wissenschaftButton);

    // Should show symbols from Wissenschaft category
    const symbols = screen
      .getAllByRole("button")
      .filter((btn) => btn.getAttribute("title")?.includes("Wissenschaft"));
    expect(symbols.length).toBeGreaterThan(0);
  });

  it("should render search input", () => {
    render(
      <SymbolPicker
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />,
    );

    const searchInput = screen.getByPlaceholderText("Symbol suchen...");
    expect(searchInput).toBeInTheDocument();
  });

  it("should filter symbols by search query", () => {
    render(
      <SymbolPicker
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />,
    );

    const searchInput = screen.getByPlaceholderText("Symbol suchen...");
    fireEvent.change(searchInput, {target: {value: "Mikroskop"}});

    // Should find the microscope symbol
    expect(screen.getByText("Mikroskop")).toBeInTheDocument();
  });

  it("should call onSelect when symbol is clicked", () => {
    render(
      <SymbolPicker
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />,
    );

    const microscopeButton = screen.getByTitle(/Wissenschaftliche Forschung/);
    fireEvent.click(microscopeButton);

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "microscope",
        emoji: "🔬",
      }),
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should show 'Symbol entfernen' button when currentSymbol is set", () => {
    render(
      <SymbolPicker
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        currentSymbol="microscope"
      />,
    );

    expect(screen.getByText("Symbol entfernen")).toBeInTheDocument();
  });

  it("should highlight current symbol", () => {
    render(
      <SymbolPicker
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        currentSymbol="microscope"
      />,
    );

    const microscopeButton = screen.getByTitle(/Wissenschaftliche Forschung/);
    expect(microscopeButton.className).toContain("bg-blue-100");
  });

  it("should clear symbol when 'Symbol entfernen' is clicked", () => {
    render(
      <SymbolPicker
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        currentSymbol="microscope"
      />,
    );

    const removeButton = screen.getByText("Symbol entfernen");
    fireEvent.click(removeButton);

    expect(mockOnSelect).toHaveBeenCalledWith({
      id: "",
      name: "",
      emoji: "",
      category: "",
      description: "",
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should show 'Keine Symbole gefunden' when search has no results", () => {
    render(
      <SymbolPicker
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />,
    );

    const searchInput = screen.getByPlaceholderText("Symbol suchen...");
    fireEvent.change(searchInput, {target: {value: "xyz123notfound"}});

    expect(screen.getByText("Keine Symbole gefunden")).toBeInTheDocument();
  });

  it("should close when Abbrechen is clicked", () => {
    render(
      <SymbolPicker
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />,
    );

    const cancelButton = screen.getByText("Abbrechen");
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
