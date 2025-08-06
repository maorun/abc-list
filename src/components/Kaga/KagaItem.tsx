import React, {useEffect, useRef, useState} from "react";
import {useLocation} from "react-router-dom";
import {NewItemWithSaveKey} from "../NewStringItem";
import {usePrompt} from "@/components/ui/prompt-dialog";

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
  const {prompt, PromptComponent} = usePrompt();

  useEffect(() => {
    if (item) {
      document.title = `KaGa für ${item.text}`;
      // Load saved canvas data
      const savedData = localStorage.getItem(`kagaCanvas-${item.key}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setDrawingData(parsedData);
        redrawCanvas(parsedData);
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
  };

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
    }
    setIsDrawing(false);
    setCurrentPath([]);
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
      <div className="flex flex-wrap justify-center gap-4 mb-4 p-4 bg-gray-100 rounded">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Werkzeug:</span>
          <button
            className={`px-3 py-1 rounded ${
              tool === "pen" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
            onClick={() => setTool("pen")}
          >
            Stift
          </button>
          <button
            className={`px-3 py-1 rounded ${
              tool === "text" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
            onClick={() => setTool("text")}
          >
            Text
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="color-picker" className="font-semibold">
            Farbe:
          </label>
          <input
            id="color-picker"
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="w-8 h-8 rounded border"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="brush-size" className="font-semibold">
            Größe:
          </label>
          <input
            id="brush-size"
            type="range"
            min="1"
            max="10"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm">{brushSize}px</span>
        </div>

        <button
          onClick={saveCanvas}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Speichern
        </button>

        <button
          onClick={clearCanvas}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Löschen
        </button>
      </div>

      {/* Canvas */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-2 border-gray-300 rounded cursor-crosshair bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
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
