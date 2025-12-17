import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {Letter} from "./Letter";

describe("Letter", () => {
  const letter = "a";
  const words = [
    {text: "Apple", explanation: "", version: 1, imported: false},
    {text: "Ant", explanation: "", version: 1, imported: false},
  ];

  it("renders a button with the capitalized letter", () => {
    render(
      <Letter
        letter={letter}
        words={[]}
        onAddWord={vi.fn()}
        onDeleteWord={vi.fn()}
        onExplanationChange={vi.fn()}
        onRatingChange={vi.fn()}
        onVisualElementsChange={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", {name: "Wort für Buchstabe A hinzufügen"}),
    ).toBeInTheDocument();
  });

  it("displays the words passed as props", () => {
    render(
      <Letter
        letter={letter}
        words={words}
        onAddWord={vi.fn()}
        onDeleteWord={vi.fn()}
        onExplanationChange={vi.fn()}
        onRatingChange={vi.fn()}
        onVisualElementsChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Ant")).toBeInTheDocument();
  });

  it("opens a modal when the letter button is clicked", () => {
    render(
      <Letter
        letter={letter}
        words={[]}
        onAddWord={vi.fn()}
        onDeleteWord={vi.fn()}
        onExplanationChange={vi.fn()}
        onRatingChange={vi.fn()}
        onVisualElementsChange={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", {name: "Wort für Buchstabe A hinzufügen"}),
    );
    expect(
      screen.getByRole("heading", {name: 'Neues Wort für "A"'}),
    ).toBeInTheDocument();
  });

  it("calls onAddWord when a new word is added", () => {
    const onAddWord = vi.fn();
    render(
      <Letter
        letter={letter}
        words={[]}
        onAddWord={onAddWord}
        onDeleteWord={vi.fn()}
        onExplanationChange={vi.fn()}
        onRatingChange={vi.fn()}
        onVisualElementsChange={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", {name: "Wort für Buchstabe A hinzufügen"}),
    );

    const input = screen.getByPlaceholderText("Wort eingeben...");
    fireEvent.change(input, {target: {value: "Airplane"}});
    fireEvent.click(screen.getByRole("button", {name: "Wort speichern"}));

    expect(onAddWord).toHaveBeenCalledWith("Airplane");
  });
});
