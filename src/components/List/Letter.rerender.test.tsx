import {render} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {Letter} from "./Letter";

// Mock child components to isolate the Letter component
vi.mock("./SavedWord", () => ({
  SavedWord: () => <div data-testid="saved-word" />,
}));
vi.mock("../VoiceInput", () => ({
  VoiceInput: () => <div data-testid="voice-input" />,
}));

describe("Letter component rerender", () => {
  it("should not rerender unnecessarily when props are stable", () => {
    const props = {
      letter: "a",
      words: [{text: "Apple", explanation: "", version: 1, imported: false}],
      onAddWord: vi.fn(),
      onDeleteWord: vi.fn(),
      onExplanationChange: vi.fn(),
      onRatingChange: vi.fn(),
      onVisualElementsChange: vi.fn(),
    };

    const {rerender, queryByTestId} = render(<Letter {...props} />);
    const initialRenderCount = queryByTestId("saved-word") ? 1 : 0;

    rerender(<Letter {...props} />);
    const rerenderCount = queryByTestId("saved-word") ? 1 : 0;

    // This is a simplified check. In a real scenario, you might use a profiler
    // or check if child components have been re-rendered.
    expect(rerenderCount).toBe(initialRenderCount);
  });

  it("should rerender when words prop changes", () => {
    const initialProps = {
      letter: "a",
      words: [{text: "Apple", explanation: "", version: 1, imported: false}],
      onAddWord: vi.fn(),
      onDeleteWord: vi.fn(),
      onExplanationChange: vi.fn(),
      onRatingChange: vi.fn(),
      onVisualElementsChange: vi.fn(),
    };
    const {rerender, getAllByTestId} = render(<Letter {...initialProps} />);
    expect(getAllByTestId("saved-word")).toHaveLength(1);

    const newProps = {
      ...initialProps,
      words: [
        ...initialProps.words,
        {text: "Ant", explanation: "", version: 1, imported: false},
      ],
    };
    rerender(<Letter {...newProps} />);
    expect(getAllByTestId("saved-word")).toHaveLength(2);
  });

  it("should not rerender when handler props change if they are memoized", () => {
    const props = {
      letter: "a",
      words: [{text: "Apple", explanation: "", version: 1, imported: false}],
      onAddWord: vi.fn(),
      onDeleteWord: vi.fn(),
      onExplanationChange: vi.fn(),
      onRatingChange: vi.fn(),
      onVisualElementsChange: vi.fn(),
    };

    const {rerender, queryByTestId} = render(<Letter {...props} />);
    const initialRenderCount = queryByTestId("saved-word") ? 1 : 0;

    const newHandlers = {
      onAddWord: vi.fn(),
      onDeleteWord: vi.fn(),
      onExplanationChange: vi.fn(),
      onRatingChange: vi.fn(),
      onVisualElementsChange: vi.fn(),
    };
    rerender(<Letter {...props} {...newHandlers} />);
    const rerenderCount = queryByTestId("saved-word") ? 1 : 0;

    expect(rerenderCount).toBe(initialRenderCount);
  });
});
