import {render, screen} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {ListItem} from "./ListItem";

// Mock the Letter component to isolate the ListItem component test
vi.mock("./Letter", () => ({
  Letter: ({letter, cacheKey}: {letter: string; cacheKey: string}) => (
    <div data-testid="letter-component">
      {letter} - {cacheKey}
    </div>
  ),
}));

describe("ListItem", () => {
  const testItem = "Themen";

  const renderComponent = (item: string) => {
    render(
      <MemoryRouter initialEntries={[`/list/${item}`]}>
        <Routes>
          <Route path="/list/:item" element={<ListItem />} />
        </Routes>
      </MemoryRouter>,
    );
  };

  it("should render the title with the item from url params", () => {
    renderComponent(testItem);
    expect(
      screen.getByRole("heading", {name: `ABC-Liste für ${testItem}`}),
    ).toBeInTheDocument();
  });

  it("should set the document title", () => {
    renderComponent(testItem);
    expect(document.title).toBe(`ABC-Liste für ${testItem}`);
  });

  it("should render a Letter component for each letter of the alphabet", () => {
    renderComponent(testItem);
    const letterComponents = screen.getAllByTestId("letter-component");
    expect(letterComponents).toHaveLength(26);
    expect(letterComponents[0]).toHaveTextContent("a - abcList-Themen");
    expect(letterComponents[25]).toHaveTextContent("z - abcList-Themen");
  });
});
