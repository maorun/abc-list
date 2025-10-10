import {describe, it, expect, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {MindMap} from "./MindMap";
import {MindMapData} from "@/lib/mindMapService";

// Mock ReactFlow components
vi.mock("@xyflow/react", () => ({
  ReactFlow: ({children}: {children: React.ReactNode}) => (
    <div data-testid="reactflow">{children}</div>
  ),
  Background: () => <div data-testid="background" />,
  Controls: () => <div data-testid="controls" />,
  MiniMap: () => <div data-testid="minimap" />,
  Panel: ({children}: {children: React.ReactNode}) => (
    <div data-testid="panel">{children}</div>
  ),
  useNodesState: (initialNodes: unknown[]) => [initialNodes, vi.fn(), vi.fn()],
  useEdgesState: (initialEdges: unknown[]) => [initialEdges, vi.fn(), vi.fn()],
}));

// Mock html-to-image
vi.mock("html-to-image", () => ({
  toPng: vi.fn().mockResolvedValue("data:image/png;base64,mockdata"),
  toSvg: vi.fn().mockResolvedValue("data:image/svg+xml;base64,mockdata"),
}));

// Mock jsPDF
vi.mock("jspdf", () => ({
  default: vi.fn().mockImplementation(() => ({
    addImage: vi.fn(),
    save: vi.fn(),
  })),
}));

describe("MindMap", () => {
  const mockData: MindMapData = {
    nodes: [
      {
        id: "root",
        position: {x: 400, y: 50},
        data: {
          label: "Test List",
          type: "root",
          sourceId: "test-list",
          sourceType: "abc-list",
        },
        type: "default",
      },
      {
        id: "letter-a",
        position: {x: 300, y: 200},
        data: {
          label: "A",
          type: "letter",
          sourceId: "test-list",
          sourceType: "abc-list",
          letterContext: "a",
        },
        type: "default",
      },
    ],
    edges: [
      {
        id: "edge-root-a",
        source: "root",
        target: "letter-a",
        type: "smoothstep",
      },
    ],
  };

  it("should render mind map with ReactFlow", () => {
    render(<MindMap data={mockData} />);

    expect(screen.getByTestId("reactflow")).toBeInTheDocument();
    expect(screen.getByTestId("background")).toBeInTheDocument();
    expect(screen.getByTestId("controls")).toBeInTheDocument();
    expect(screen.getByTestId("minimap")).toBeInTheDocument();
  });

  it("should render export buttons", () => {
    render(<MindMap data={mockData} />);

    expect(screen.getByTitle("Als PNG exportieren")).toBeInTheDocument();
    expect(screen.getByTitle("Als SVG exportieren")).toBeInTheDocument();
    expect(screen.getByTitle("Als PDF exportieren")).toBeInTheDocument();
  });

  it("should render with correct container styling", () => {
    const {container} = render(<MindMap data={mockData} />);

    const mindMapContainer = container.querySelector("#mindmap-container");
    expect(mindMapContainer).toBeInTheDocument();
    expect(mindMapContainer).toHaveClass("w-full", "h-[600px]");
  });
});
