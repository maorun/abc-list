import React, {useEffect, useRef, useState} from "react";
import {useLocation} from "react-router-dom";
import {NewItemWithSaveKey} from "../NewStringItem";
import {usePrompt} from "@/components/ui/prompt-dialog";
import {Button} from "../ui/button";

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
}

interface DrawingHistory {
  states: DrawingData[];
  currentIndex: number;
}

export function KagaItem() {
  const location = useLocation();
  const item = location.state?.item as NewItemWithSaveKey;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(2);
  const [tool, setTool] = useState<"pen" | "text">("pen");
  const [drawingData, setDrawingData] = useState<DrawingData>({
    paths: [],
    texts: [],
  });
  const [currentPath, setCurrentPath] = useState<{x: number; y: number}[]>([]);
  const [history, setHistory] = useState<DrawingHistory>({
    states: [{ paths: [], texts: [] }],
    currentIndex: 0,
  });
  const {prompt, PromptComponent} = usePrompt();

  useEffect(() => {
    if (item) {
      document.title = `KaGa für ${item.text}`;
      // Load saved canvas data
      const savedData = localStorage.getItem(`kagaCanvas-${item.key}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setDrawingData(parsedData);
        setHistory({
          states: [parsedData],
          currentIndex: 0,
        });
        redrawCanvas(parsedData);
      }
    }
  }, [item]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
                 ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history]);

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

  const undo = () => {
    if (history.currentIndex > 0) {
      const newIndex = history.currentIndex - 1;
      const prevData = history.states[newIndex];
      setHistory((prev) => ({ ...prev, currentIndex: newIndex }));
      setDrawingData(prevData);
      redrawCanvas(prevData);
    }
  };

  const redo = () => {
    if (history.currentIndex < history.states.length - 1) {
      const newIndex = history.currentIndex + 1;
      const nextData = history.states[newIndex];
      setHistory((prev) => ({ ...prev, currentIndex: newIndex }));
      setDrawingData(nextData);
      redrawCanvas(nextData);
    }
  };

  const canUndo = history.currentIndex > 0;
  const canRedo = history.currentIndex < history.states.length - 1;

  const saveCanvas = () => {
    localStorage.setItem(`kagaCanvas-${item.key}`, JSON.stringify(drawingData));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const newData = {paths: [], texts: []};
    setDrawingData(newData);
    addToHistory(newData);
    localStorage.setItem(`kagaCanvas-${item.key}`, JSON.stringify(newData));
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return {x: 0, y: 0};

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return {x: 0, y: 0};

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
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

  const stopDrawing = () => {
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
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const stopTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  if (!item) {
    return (
      <div className="p-4 text-center">
        KaGa nicht gefunden. Bitte gehe zurück zur Übersicht.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-4">
        KaGa für &quot;{item.text}&quot;
      </h1>

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
          <label htmlFor="color-picker" className="font-semibold text-sm sm:text-base">
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
          <label htmlFor="brush-size" className="font-semibold text-sm sm:text-base">
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
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={saveCanvas}
            variant="default"
            className="bg-green-500 hover:bg-green-700 flex-1 sm:flex-initial min-h-[44px]"
          >
            💾 Speichern
          </Button>

          <Button onClick={clearCanvas} variant="destructive" className="flex-1 sm:flex-initial min-h-[44px]">
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
