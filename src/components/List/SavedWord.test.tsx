import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {SavedWord} from "./SavedWord";

describe("SavedWord", () => {
  const text = "Test Word";

  it("should render a button with the provided text", () => {
    render(<SavedWord text={text} />);
    expect(screen.getByRole("button", {name: text})).toBeInTheDocument();
  });

  it("should show delete confirmation on click", () => {
    render(<SavedWord text={text} />);
    fireEvent.click(screen.getByRole("button", {name: text}));
    expect(screen.getByText("Löschen bestätigen")).toBeInTheDocument();
  });

  it("should call onDelete and hide confirmation when deletion is confirmed", () => {
    const onDelete = vi.fn();
    render(<SavedWord text={text} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", {name: text}));
    fireEvent.click(screen.getByRole("button", {name: "Ja"}));
    expect(onDelete).toHaveBeenCalled();
    expect(screen.queryByText("Löschen bestätigen")).not.toBeInTheDocument();
  });

  it("should hide confirmation when deletion is aborted", () => {
    const onDelete = vi.fn();
    render(<SavedWord text={text} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", {name: text}));
    fireEvent.click(screen.getByRole("button", {name: "Nein"}));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByText("Löschen bestätigen")).not.toBeInTheDocument();
  });
});
