import React, {useCallback, useState} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  type ColorMode,
} from "@xyflow/react";
import {Button} from "@/components/ui/button";
import {Download, FileImage, FileCode} from "lucide-react";
import {toPng, toSvg} from "html-to-image";
import jsPDF from "jspdf";
import "@xyflow/react/dist/style.css";
import {MindMapData, MindMapNode} from "@/lib/mindMapService";

interface MindMapProps {
  data: MindMapData;
  onNodeClick?: (node: MindMapNode) => void;
}

// Color scheme for different node types
const getNodeStyle = (type: string) => {
  switch (type) {
    case "root":
      return {
        background: "#3b82f6",
        color: "#ffffff",
        border: "2px solid #1e40af",
        borderRadius: "8px",
        padding: "12px 20px",
        fontWeight: "bold",
        fontSize: "16px",
      };
    case "letter":
    case "kawa-letter":
      return {
        background: "#10b981",
        color: "#ffffff",
        border: "2px solid #059669",
        borderRadius: "50%",
        padding: "10px",
        width: "50px",
        height: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
      };
    case "word":
    case "kawa-word":
      return {
        background: "#f59e0b",
        color: "#ffffff",
        border: "2px solid #d97706",
        borderRadius: "6px",
        padding: "8px 12px",
      };
    default:
      return {
        background: "#6b7280",
        color: "#ffffff",
        border: "2px solid #4b5563",
        borderRadius: "6px",
        padding: "8px 12px",
      };
  }
};

// Apply styles to nodes
const applyStylesToNodes = (nodes: MindMapNode[]): MindMapNode[] => {
  return nodes.map((node) => ({
    ...node,
    style: getNodeStyle(node.data.type),
  }));
};

// Extract export handlers outside component
const handleExportPNG = (elementId: string) => async () => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const dataUrl = await toPng(element, {
      backgroundColor: "#ffffff",
      quality: 1,
    });

    const link = document.createElement("a");
    link.download = "mindmap.png";
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Error exporting PNG:", error);
  }
};

const handleExportSVG = (elementId: string) => async () => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const dataUrl = await toSvg(element, {
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = "mindmap.svg";
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Error exporting SVG:", error);
  }
};

const handleExportPDF = (elementId: string) => async () => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const dataUrl = await toPng(element, {
      backgroundColor: "#ffffff",
      quality: 1,
    });

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [element.offsetWidth, element.offsetHeight],
    });

    pdf.addImage(
      dataUrl,
      "PNG",
      0,
      0,
      element.offsetWidth,
      element.offsetHeight,
    );
    pdf.save("mindmap.pdf");
  } catch (error) {
    console.error("Error exporting PDF:", error);
  }
};

export function MindMap({data, onNodeClick}: MindMapProps) {
  const [nodes, _setNodes, onNodesChange] = useNodesState(
    applyStylesToNodes(data.nodes),
  );
  const [edges, _setEdges, onEdgesChange] = useEdgesState(data.edges);
  const [colorMode] = useState<ColorMode>("light");

  // Handle node click
  const handleNodeClickInternal = useCallback(
    (event: React.MouseEvent, node: MindMapNode) => {
      if (onNodeClick) {
        onNodeClick(node);
      }
    },
    [onNodeClick],
  );

  // Create stable export handlers
  const exportPNG = handleExportPNG("mindmap-container");
  const exportSVG = handleExportSVG("mindmap-container");
  const exportPDF = handleExportPDF("mindmap-container");

  return (
    <div
      id="mindmap-container"
      className="w-full h-[600px] border border-gray-300 rounded-lg bg-white"
      style={{position: "relative"}}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClickInternal}
        colorMode={colorMode}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const mindMapNode = node as MindMapNode;
            switch (mindMapNode.data.type) {
              case "root":
                return "#3b82f6";
              case "letter":
              case "kawa-letter":
                return "#10b981";
              case "word":
              case "kawa-word":
                return "#f59e0b";
              default:
                return "#6b7280";
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        <Panel
          position="top-right"
          className="flex gap-2 bg-white/90 p-2 rounded-lg"
        >
          <Button
            onClick={exportPNG}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
            title="Als PNG exportieren"
          >
            <FileImage className="h-4 w-4" />
            PNG
          </Button>
          <Button
            onClick={exportSVG}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
            title="Als SVG exportieren"
          >
            <FileCode className="h-4 w-4" />
            SVG
          </Button>
          <Button
            onClick={exportPDF}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
            title="Als PDF exportieren"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
