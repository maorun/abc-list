import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {NewStringItem} from "./NewStringItem";

describe("NewStringItem", () => {
  const title = "Neues Element hinzufügen";

  it("should initially only show the add button", () => {
    render(<NewStringItem title={title} />);
    expect(
      screen.getByRole("button", {name: /neues element hinzufügen/i}),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should open a modal when the add button is clicked", () => {
    render(<NewStringItem title={title} />);
    fireEvent.click(
      screen.getByRole("button", {name: /neues element hinzufügen/i}),
    );
    expect(screen.getByRole("heading", {name: title})).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter text...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {name: /speichern/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {name: /abbrechen/i}),
    ).toBeInTheDocument();
  });

  it("should update input value on change", () => {
    render(<NewStringItem title={title} />);
    fireEvent.click(
      screen.getByRole("button", {name: /neues element hinzufügen/i}),
    );
    const input =
      screen.getByPlaceholderText<HTMLInputElement>("Enter text...");
    fireEvent.change(input, {target: {value: "Neuer Text"}});
    expect(input.value).toBe("Neuer Text");
  });

  it('should call onAbort and close modal when "Abbrechen" is clicked', () => {
    const onAbort = vi.fn();
    render(<NewStringItem title={title} onAbort={onAbort} />);
    fireEvent.click(
      screen.getByRole("button", {name: /neues element hinzufügen/i}),
    );
    expect(screen.getByRole("heading", {name: title})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: /abbrechen/i}));
    expect(
      screen.queryByRole("heading", {name: title}),
    ).not.toBeInTheDocument();
    expect(onAbort).toHaveBeenCalled();
  });

  it('should call onSave and close modal when "Speichern" is clicked with text', () => {
    const onSave = vi.fn();
    render(<NewStringItem title={title} onSave={onSave} />);
    fireEvent.click(
      screen.getByRole("button", {name: /neues element hinzufügen/i}),
    );
    const input = screen.getByPlaceholderText("Enter text...");
    fireEvent.change(input, {target: {value: "Gespeicherter Text"}});
    fireEvent.click(screen.getByRole("button", {name: /speichern/i}));
    expect(
      screen.queryByRole("heading", {name: title}),
    ).not.toBeInTheDocument();
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({text: "Gespeicherter Text"}),
    );
  });

  it('should not call onSave but close modal when "Speichern" is clicked without text', () => {
    const onSave = vi.fn();
    render(<NewStringItem title={title} onSave={onSave} />);
    fireEvent.click(
      screen.getByRole("button", {name: /neues element hinzufügen/i}),
    );
    expect(screen.getByRole("heading", {name: title})).toBeInTheDocument();
    // Button should be disabled when no text is entered
    const saveButton = screen.getByRole("button", {name: /speichern/i});
    expect(saveButton).toBeDisabled();
    expect(onSave).not.toHaveBeenCalled();
  });
});
