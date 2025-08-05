import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {DeleteConfirm} from "./DeleteConfirm";

describe("DeleteConfirm", () => {
  const itemToDelete = {id: 1, name: "Test Item"};

  it("should not be visible when isVisible is false", () => {
    render(
      <DeleteConfirm
        itemToDelete={itemToDelete}
        onAbort={() => {}}
        isVisible={false}
      />,
    );
    expect(screen.queryByText("Wirklich löschen?")).not.toBeInTheDocument();
  });

  it("should be visible when isVisible is true", () => {
    render(
      <DeleteConfirm
        itemToDelete={itemToDelete}
        onAbort={() => {}}
        isVisible={true}
      />,
    );
    expect(screen.getByText("Wirklich löschen?")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Ja"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Nein"})).toBeInTheDocument();
  });

  it('should call onDelete when "Ja" is clicked', () => {
    const onDelete = vi.fn();
    const onAbort = vi.fn();

    render(
      <DeleteConfirm
        itemToDelete={itemToDelete}
        onDelete={onDelete}
        onAbort={onAbort}
        isVisible={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", {name: "Ja"}));
    expect(onDelete).toHaveBeenCalledWith(itemToDelete);
    expect(onAbort).not.toHaveBeenCalled();
  });

  it('should call onAbort when "Nein" is clicked', () => {
    const onDelete = vi.fn();
    const onAbort = vi.fn();

    render(
      <DeleteConfirm
        itemToDelete={itemToDelete}
        onDelete={onDelete}
        onAbort={onAbort}
        isVisible={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", {name: "Nein"}));
    expect(onAbort).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('should call onAbort when "Ja" is clicked and onDelete is not provided', () => {
    const onAbort = vi.fn();

    render(
      <DeleteConfirm
        itemToDelete={itemToDelete}
        onAbort={onAbort}
        isVisible={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", {name: "Ja"}));
    expect(onAbort).toHaveBeenCalled();
  });
});
