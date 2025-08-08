import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {vi} from "vitest";
import {ColumnConfigDialog} from "./ColumnConfigDialog";
import {ColumnConfig} from "./types";

describe("ColumnConfigDialog", () => {
  const mockColumns: ColumnConfig[] = [
    {
      id: "general1",
      theme: "Allgemeines Thema 1",
      color: "#3B82F6",
    },
    {
      id: "general2",
      theme: "Allgemeines Thema 2",
      color: "#10B981",
      timeLimit: 5,
    },
  ];

  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnClose.mockClear();
  });

  it("renders the column configuration dialog", () => {
    render(
      <ColumnConfigDialog
        isOpen={true}
        onClose={mockOnClose}
        columns={mockColumns}
        onSave={mockOnSave}
      />,
    );

    expect(screen.getByText("Spalten konfigurieren")).toBeInTheDocument();
    expect(
      screen.getByText(/Konfigurieren Sie bis zu 5 Spalten/),
    ).toBeInTheDocument();
    expect(screen.getByText("Spalte 1")).toBeInTheDocument();
    expect(screen.getByText("Spalte 2")).toBeInTheDocument();
  });

  it("displays existing column configurations", () => {
    render(
      <ColumnConfigDialog
        isOpen={true}
        onClose={mockOnClose}
        columns={mockColumns}
        onSave={mockOnSave}
      />,
    );

    expect(screen.getByDisplayValue("Allgemeines Thema 1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Allgemeines Thema 2")).toBeInTheDocument();
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
  });

  it("allows adding new columns up to 5", () => {
    render(
      <ColumnConfigDialog
        isOpen={true}
        onClose={mockOnClose}
        columns={mockColumns}
        onSave={mockOnSave}
      />,
    );

    const addButton = screen.getByText("+ Spalte hinzufügen");
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(screen.getByText("Spalte 3")).toBeInTheDocument();
  });

  it("prevents adding more than 5 columns", () => {
    const maxColumns: ColumnConfig[] = Array.from({length: 5}, (_, i) => ({
      id: `column-${i}`,
      theme: `Thema ${i + 1}`,
      color: "#3B82F6",
    }));

    render(
      <ColumnConfigDialog
        isOpen={true}
        onClose={mockOnClose}
        columns={maxColumns}
        onSave={mockOnSave}
      />,
    );

    // The add button should not be present when at max capacity
    expect(screen.queryByText("+ Spalte hinzufügen")).not.toBeInTheDocument();
  });

  it("allows removing columns but prevents removing the last one", () => {
    render(
      <ColumnConfigDialog
        isOpen={true}
        onClose={mockOnClose}
        columns={mockColumns}
        onSave={mockOnSave}
      />,
    );

    const removeButtons = screen.getAllByText("Entfernen");
    expect(removeButtons).toHaveLength(2);

    // Remove one column
    fireEvent.click(removeButtons[0]);
    expect(screen.queryByText("Spalte 2")).not.toBeInTheDocument();
  });

  it("prevents removing the last remaining column", () => {
    const singleColumn: ColumnConfig[] = [mockColumns[0]];

    render(
      <ColumnConfigDialog
        isOpen={true}
        onClose={mockOnClose}
        columns={singleColumn}
        onSave={mockOnSave}
      />,
    );

    // Should not show remove button when only one column exists
    expect(screen.queryByText("Entfernen")).not.toBeInTheDocument();
  });

  it("allows editing column themes", () => {
    render(
      <ColumnConfigDialog
        isOpen={true}
        onClose={mockOnClose}
        columns={mockColumns}
        onSave={mockOnSave}
      />,
    );

    const themeInput = screen.getByDisplayValue("Allgemeines Thema 1");
    fireEvent.change(themeInput, {target: {value: "Neues Thema"}});

    expect(screen.getByDisplayValue("Neues Thema")).toBeInTheDocument();
  });

  it("allows setting time limits", () => {
    render(
      <ColumnConfigDialog
        isOpen={true}
        onClose={mockOnClose}
        columns={mockColumns}
        onSave={mockOnSave}
      />,
    );

    const timeLimitInputs = screen.getAllByPlaceholderText("Optional");
    fireEvent.change(timeLimitInputs[0], {target: {value: "10"}});

    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
  });

  it("allows selecting colors", () => {
    render(
      <ColumnConfigDialog
        isOpen={true}
        onClose={mockOnClose}
        columns={mockColumns}
        onSave={mockOnSave}
      />,
    );

    // Color buttons should be present
    const colorButtons = screen
      .getAllByRole("button")
      .filter((button) => button.style.backgroundColor);
    expect(colorButtons.length).toBeGreaterThan(0);
  });

  it("allows only one specialty column", () => {
    render(
      <ColumnConfigDialog
        isOpen={true}
        onClose={mockOnClose}
        columns={mockColumns}
        onSave={mockOnSave}
      />,
    );

    const specialtyCheckboxes = screen.getAllByRole("checkbox");
    expect(specialtyCheckboxes).toHaveLength(2);

    // Select first checkbox
    fireEvent.click(specialtyCheckboxes[0]);
    expect(specialtyCheckboxes[0]).toBeChecked();

    // Select second checkbox - should deselect first
    fireEvent.click(specialtyCheckboxes[1]);
    expect(specialtyCheckboxes[0]).not.toBeChecked();
    expect(specialtyCheckboxes[1]).toBeChecked();
  });

  it("validates form before saving", () => {
    render(
      <ColumnConfigDialog
        isOpen={true}
        onClose={mockOnClose}
        columns={mockColumns}
        onSave={mockOnSave}
      />,
    );

    // Clear a theme to trigger validation error
    const themeInput = screen.getByDisplayValue("Allgemeines Thema 1");
    fireEvent.change(themeInput, {target: {value: ""}});

    const saveButton = screen.getByText("Speichern");
    fireEvent.click(saveButton);

    // Should not call onSave when validation fails
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("saves valid configuration", () => {
    render(
      <ColumnConfigDialog
        isOpen={true}
        onClose={mockOnClose}
        columns={mockColumns}
        onSave={mockOnSave}
      />,
    );

    const saveButton = screen.getByText("Speichern");
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(mockColumns);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("closes without saving when cancelled", () => {
    render(
      <ColumnConfigDialog
        isOpen={true}
        onClose={mockOnClose}
        columns={mockColumns}
        onSave={mockOnSave}
      />,
    );

    const cancelButton = screen.getByText("Abbrechen");
    fireEvent.click(cancelButton);

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});
