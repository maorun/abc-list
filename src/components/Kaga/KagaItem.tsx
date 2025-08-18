import React, {useCallback, useEffect, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {NewItemWithSaveKey} from "../NewStringItem";
import {usePrompt} from "@/components/ui/prompt-dialog";
import {Button} from "../ui/button";
import {KagaTemplates, KagaTemplate} from "./KagaTemplates";

// Extract handler function for back navigation outside component
const handleBackToKagas = (navigate: ReturnType<typeof useNavigate>) => () => {
  navigate("/kaga");
};

// Define shape type for better type safety
type ShapeType = "rectangle" | "circle" | "line" | "arrow";

interface BaseShape {
  type: ShapeType;
  x: number;
  y: number;
  color: string;
  lineWidth: number;
}

interface RectangleShape extends BaseShape {
  type: "rectangle";
  width: number;
  height: number;
}

interface CircleShape extends BaseShape {
  type: "circle";
  radius: number;
}

interface LineShape extends BaseShape {
  type: "line" | "arrow";
  endX: number;
  endY: number;
}

type Shape = RectangleShape | CircleShape | LineShape;

interface DrawingData {
  paths: Array<{
    points: Array<{x: number; y: number}>;
    color: string;
    width: number;
  }>;
  texts: Array<{
    x: number;
    y: number;
    text: string;
    color: string;
    fontSize: number;
  }>;
  shapes: Array<Shape>;
}

interface DrawingHistory {
  states: DrawingData[];
  currentIndex: number;
}

export function KagaItem() {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item as NewItemWithSaveKey;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(2);
  const [tool, setTool] = useState<
    "pen" | "text" | "rectangle" | "circle" | "line" | "arrow"
  >("pen");
  const [drawingData, setDrawingData] = useState<DrawingData>({
    paths: [],
    texts: [],
    shapes: [],
  });
  const [currentPath, setCurrentPath] = useState<{x: number; y: number}[]>([]);
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStartPos, setShapeStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [history, setHistory] = useState<DrawingHistory>({
    states: [{paths: [], texts: [], shapes: []}],
    currentIndex: 0,
  });
  const {prompt, PromptComponent} = usePrompt();

  // Create stable back navigation handler reference
  const backToKagas = handleBackToKagas(navigate);

  useEffect(() => {
    if (item) {
      document.title = `KaGa für ${item.text}`;
      // Load saved canvas data
      const savedData = localStorage.getItem(`kagaCanvas-${item.key}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Ensure backwards compatibility with existing data
        const dataWithShapes = {
          paths: parsedData.paths || [],
          texts: parsedData.texts || [],
          shapes: parsedData.shapes || [],
        };
        setDrawingData(dataWithShapes);
        setHistory({
          states: [dataWithShapes],
          currentIndex: 0,
        });
        redrawCanvas(dataWithShapes);
      }
    }
  }, [item]);

  const redrawCanvas = (data: DrawingData) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw paths
    data.paths.forEach((path) => {
      if (path.points.length > 1) {
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
      }
    });

    // Redraw texts
    data.texts.forEach((textItem) => {
      ctx.fillStyle = textItem.color;
      ctx.font = `${textItem.fontSize}px Arial`;
      ctx.fillText(textItem.text, textItem.x, textItem.y);
    });

    // Redraw shapes
    data.shapes?.forEach((shape) => {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      switch (shape.type) {
        case "rectangle":
          if (shape.width && shape.height) {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          }
          break;
        case "circle":
          if (shape.radius) {
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
            ctx.stroke();
          }
          break;
        case "line":
          if (shape.endX !== undefined && shape.endY !== undefined) {
            ctx.beginPath();
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(shape.endX, shape.endY);
            ctx.stroke();
          }
          break;
        case "arrow":
          if (shape.endX !== undefined && shape.endY !== undefined) {
            // Draw line
            ctx.beginPath();
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(shape.endX, shape.endY);
            ctx.stroke();

            // Draw arrowhead
            const angle = Math.atan2(
              shape.endY - shape.y,
              shape.endX - shape.x,
            );
            const arrowLength = 15;
            const arrowAngle = Math.PI / 6;

            ctx.beginPath();
            ctx.moveTo(shape.endX, shape.endY);
            ctx.lineTo(
              shape.endX - arrowLength * Math.cos(angle - arrowAngle),
              shape.endY - arrowLength * Math.sin(angle - arrowAngle),
            );
            ctx.moveTo(shape.endX, shape.endY);
            ctx.lineTo(
              shape.endX - arrowLength * Math.cos(angle + arrowAngle),
              shape.endY - arrowLength * Math.sin(angle + arrowAngle),
            );
            ctx.stroke();
          }
          break;
      }
    });
  };

  // History management functions
  const addToHistory = (newData: DrawingData) => {
    setHistory((prev) => {
      // Remove any future states if we're not at the end
      const newStates = prev.states.slice(0, prev.currentIndex + 1);
      // Add the new state
      newStates.push(newData);
      // Limit history size to prevent memory issues
      const maxHistorySize = 50;
      if (newStates.length > maxHistorySize) {
        newStates.shift();
        return {
          states: newStates,
          currentIndex: newStates.length - 1,
        };
      }
      return {
        states: newStates,
        currentIndex: newStates.length - 1,
      };
    });
  };

  const undo = useCallback(() => {
    if (history.currentIndex > 0) {
      const newIndex = history.currentIndex - 1;
      const prevData = history.states[newIndex];
      setHistory((prev) => ({...prev, currentIndex: newIndex}));
      setDrawingData(prevData);
      redrawCanvas(prevData);
    }
  }, [history]);

  const redo = useCallback(() => {
    if (history.currentIndex < history.states.length - 1) {
      const newIndex = history.currentIndex + 1;
      const nextData = history.states[newIndex];
      setHistory((prev) => ({...prev, currentIndex: newIndex}));
      setDrawingData(nextData);
      redrawCanvas(nextData);
    }
  }, [history]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key === "y")
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const canUndo = history.currentIndex > 0;
  const canRedo = history.currentIndex < history.states.length - 1;

  // Helper function to create shape from start and end positions
  const createShape = (
    startPos: {x: number; y: number},
    endPos: {x: number; y: number},
    shapeType: ShapeType,
  ): Shape => {
    const baseProps = {
      color: currentColor,
      lineWidth: brushSize,
    };

    switch (shapeType) {
      case "rectangle": {
        return {
          type: "rectangle",
          x: Math.min(startPos.x, endPos.x),
          y: Math.min(startPos.y, endPos.y),
          width: Math.abs(endPos.x - startPos.x),
          height: Math.abs(endPos.y - startPos.y),
          ...baseProps,
        } as RectangleShape;
      }
      case "circle": {
        const radius = Math.sqrt(
          Math.pow(endPos.x - startPos.x, 2) +
            Math.pow(endPos.y - startPos.y, 2),
        );
        return {
          type: "circle",
          x: startPos.x,
          y: startPos.y,
          radius,
          ...baseProps,
        } as CircleShape;
      }
      case "line":
      case "arrow": {
        return {
          type: shapeType,
          x: startPos.x,
          y: startPos.y,
          endX: endPos.x,
          endY: endPos.y,
          ...baseProps,
        } as LineShape;
      }
      default: {
        // This should never happen with proper TypeScript typing
        throw new Error(`Unknown shape type: ${shapeType}`);
      }
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template: KagaTemplate) => {
    const newData = {
      paths: template.data.paths || [],
      texts: template.data.texts || [],
      shapes: template.data.shapes || [],
    };
    setDrawingData(newData);
    addToHistory(newData);
    redrawCanvas(newData);
  };

  const saveCanvas = () => {
    localStorage.setItem(`kagaCanvas-${item.key}`, JSON.stringify(drawingData));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const newData = {paths: [], texts: [], shapes: []};
    setDrawingData(newData);
    addToHistory(newData);
    localStorage.setItem(`kagaCanvas-${item.key}`, JSON.stringify(newData));
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return {x: 0, y: 0};

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return {x: 0, y: 0};

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "pen") {
      setIsDrawing(true);
      const pos = getMousePos(e);
      setCurrentPath([pos]);
    } else if (tool === "text") {
      const pos = getMousePos(e);
      const text = await prompt(
        "Text eingeben:",
        "Geben Sie den Text ein, der an dieser Position hinzugefügt werden soll:",
        "Text hier eingeben...",
      );
      if (text) {
        const newText = {
          x: pos.x,
          y: pos.y,
          text,
          color: currentColor,
          fontSize: 16,
        };
        const newData = {
          ...drawingData,
          texts: [...drawingData.texts, newText],
        };
        setDrawingData(newData);
        addToHistory(newData);
        redrawCanvas(newData);
      }
    } else if (["rectangle", "circle", "line", "arrow"].includes(tool)) {
      setIsDrawingShape(true);
      const pos = getMousePos(e);
      setShapeStartPos(pos);
    }
  };

  const startTouchDrawing = async (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling and other default touch behaviors
    if (tool === "pen") {
      setIsDrawing(true);
      const pos = getTouchPos(e);
      setCurrentPath([pos]);
    } else if (tool === "text") {
      const pos = getTouchPos(e);
      const text = await prompt(
        "Text eingeben:",
        "Geben Sie den Text ein, der an dieser Position hinzugefügt werden soll:",
        "Text hier eingeben...",
      );
      if (text) {
        const newText = {
          x: pos.x,
          y: pos.y,
          text,
          color: currentColor,
          fontSize: 16,
        };
        const newData = {
          ...drawingData,
          texts: [...drawingData.texts, newText],
        };
        setDrawingData(newData);
        addToHistory(newData);
        redrawCanvas(newData);
      }
    } else if (["rectangle", "circle", "line", "arrow"].includes(tool)) {
      setIsDrawingShape(true);
      const pos = getTouchPos(e);
      setShapeStartPos(pos);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== "pen") return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const pos = getMousePos(e);
    const newPath = [...currentPath, pos];
    setCurrentPath(newPath);

    // Draw current stroke
    if (newPath.length > 1) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(newPath[newPath.length - 2].x, newPath[newPath.length - 2].y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const touchDraw = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling
    if (!isDrawing || tool !== "pen") return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const pos = getTouchPos(e);
    const newPath = [...currentPath, pos];
    setCurrentPath(newPath);

    // Draw current stroke
    if (newPath.length > 1) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(newPath[newPath.length - 2].x, newPath[newPath.length - 2].y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && currentPath.length > 1) {
      const newPath = {
        points: currentPath,
        color: currentColor,
        width: brushSize,
      };
      const newData = {
        ...drawingData,
        paths: [...drawingData.paths, newPath],
      };
      setDrawingData(newData);
      addToHistory(newData);
    }

    if (isDrawingShape && shapeStartPos && e) {
      const endPos = getMousePos(e);
      const shape = createShape(shapeStartPos, endPos, tool);
      const newData = {
        ...drawingData,
        shapes: [...drawingData.shapes, shape],
      };
      setDrawingData(newData);
      addToHistory(newData);
      redrawCanvas(newData);
    }

    setIsDrawing(false);
    setIsDrawingShape(false);
    setShapeStartPos(null);
    setCurrentPath([]);
  };

  const stopTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    if (isDrawing && currentPath.length > 1) {
      const newPath = {
        points: currentPath,
        color: currentColor,
        width: brushSize,
      };
      const newData = {
        ...drawingData,
        paths: [...drawingData.paths, newPath],
      };
      setDrawingData(newData);
      addToHistory(newData);
    }

    if (isDrawingShape && shapeStartPos) {
      const endPos = getTouchPos(e);
      const shape = createShape(shapeStartPos, endPos, tool);
      const newData = {
        ...drawingData,
        shapes: [...drawingData.shapes, shape],
      };
      setDrawingData(newData);
      addToHistory(newData);
      redrawCanvas(newData);
    }

    setIsDrawing(false);
    setIsDrawingShape(false);
    setShapeStartPos(null);
    setCurrentPath([]);
  };

  if (!item) {
    return (
      <div className="p-4 text-center">
        <button
          onClick={backToKagas}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          ← Zurück zu KaGas
        </button>
        <div>KaGa nicht gefunden. Bitte gehe zurück zur Übersicht.</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-4">
        <button
          onClick={backToKagas}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 mb-2 sm:mb-0 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          title="Zurück zur KaGa-Übersicht"
          aria-label="Zurück zur KaGa Übersicht"
        >
          ← Zurück zu KaGas
        </button>
        <h1 className="text-3xl font-bold text-center sm:text-left">
          KaGa für &quot;{item.text}&quot;
        </h1>
      </div>

      {/* Tools */}
      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4 mb-4 p-3 sm:p-4 bg-gray-100 rounded">
        <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
          <span className="font-semibold text-sm sm:text-base">Werkzeug:</span>
          <Button
            variant={tool === "pen" ? "default" : "secondary"}
            size="sm"
            onClick={() => setTool("pen")}
            className="flex-1 sm:flex-initial min-h-[44px]"
          >
            ✏️ Stift
          </Button>
          <Button
            variant={tool === "text" ? "default" : "secondary"}
            size="sm"
            onClick={() => setTool("text")}
            className="flex-1 sm:flex-initial min-h-[44px]"
          >
            📝 Text
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
          <span className="font-semibold text-sm sm:text-base">Formen:</span>
          <Button
            variant={tool === "rectangle" ? "default" : "secondary"}
            size="sm"
            onClick={() => setTool("rectangle")}
            className="flex-1 sm:flex-initial min-h-[44px]"
          >
            ⬜ Rechteck
          </Button>
          <Button
            variant={tool === "circle" ? "default" : "secondary"}
            size="sm"
            onClick={() => setTool("circle")}
            className="flex-1 sm:flex-initial min-h-[44px]"
          >
            ⭕ Kreis
          </Button>
          <Button
            variant={tool === "line" ? "default" : "secondary"}
            size="sm"
            onClick={() => setTool("line")}
            className="flex-1 sm:flex-initial min-h-[44px]"
          >
            📏 Linie
          </Button>
          <Button
            variant={tool === "arrow" ? "default" : "secondary"}
            size="sm"
            onClick={() => setTool("arrow")}
            className="flex-1 sm:flex-initial min-h-[44px]"
          >
            ➡️ Pfeil
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
          <label
            htmlFor="color-picker"
            className="font-semibold text-sm sm:text-base"
          >
            Farbe:
          </label>
          <input
            id="color-picker"
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="w-10 h-10 sm:w-8 sm:h-8 rounded border min-h-[44px] sm:min-h-[32px]"
          />
        </div>

        <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
          <label
            htmlFor="brush-size"
            className="font-semibold text-sm sm:text-base"
          >
            Größe:
          </label>
          <input
            id="brush-size"
            type="range"
            min="1"
            max="10"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 sm:w-20 min-h-[44px] sm:min-h-auto"
          />
          <span className="text-sm min-w-[30px]">{brushSize}px</span>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={undo}
            disabled={!canUndo}
            variant="outline"
            className="flex-1 sm:flex-initial min-h-[44px]"
            title="Rückgängig (Ctrl+Z)"
          >
            ↶ Rückgängig
          </Button>

          <Button
            onClick={redo}
            disabled={!canRedo}
            variant="outline"
            className="flex-1 sm:flex-initial min-h-[44px]"
            title="Wiederholen (Ctrl+Y)"
          >
            ↷ Wiederholen
          </Button>

          <KagaTemplates onTemplateSelect={handleTemplateSelect} />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={saveCanvas}
            variant="default"
            className="bg-green-500 hover:bg-green-700 flex-1 sm:flex-initial min-h-[44px]"
          >
            💾 Speichern
          </Button>

          <Button
            onClick={clearCanvas}
            variant="destructive"
            className="flex-1 sm:flex-initial min-h-[44px]"
          >
            🗑️ Löschen
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex justify-center overflow-auto">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-2 border-gray-300 rounded cursor-crosshair bg-white max-w-full h-auto touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startTouchDrawing}
          onTouchMove={touchDraw}
          onTouchEnd={stopTouchDrawing}
          onTouchCancel={stopTouchDrawing}
        />
      </div>

      <p className="text-center text-gray-500 mt-4">
        Zeichne frei, füge Text hinzu und erstelle visuelle Assoziationen zu
        deinem Thema.
        <br />
        Vergiss nicht zu speichern!
      </p>
      <PromptComponent />
    </div>
  );
}
