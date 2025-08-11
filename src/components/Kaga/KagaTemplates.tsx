import React from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

// Template interface
export interface KagaTemplate {
  id: string;
  name: string;
  description: string;
  preview: string; // Simple ASCII art or emoji representation
  data: {
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
    shapes: Array<{
      type: "rectangle" | "circle" | "line" | "arrow";
      x: number;
      y: number;
      width?: number;
      height?: number;
      endX?: number;
      endY?: number;
      radius?: number;
      color: string;
      lineWidth: number;
    }>;
  };
}

// Predefined templates
export const kagaTemplates: KagaTemplate[] = [
  {
    id: "mind-map",
    name: "Mind Map",
    description: "Zentrales Thema mit Ästen für Unterthemen",
    preview: "🧠 ─┬─ 💡\n  ├─ 📚\n  └─ 🎯",
    data: {
      paths: [],
      texts: [
        { x: 400, y: 300, text: "Hauptthema", color: "#000000", fontSize: 24 },
        { x: 300, y: 200, text: "Idee 1", color: "#0066cc", fontSize: 16 },
        { x: 500, y: 200, text: "Idee 2", color: "#0066cc", fontSize: 16 },
        { x: 300, y: 400, text: "Idee 3", color: "#0066cc", fontSize: 16 },
        { x: 500, y: 400, text: "Idee 4", color: "#0066cc", fontSize: 16 },
      ],
      shapes: [
        { type: "circle", x: 400, y: 300, radius: 60, color: "#0066cc", lineWidth: 2 },
        { type: "line", x: 370, y: 270, endX: 330, endY: 230, color: "#666666", lineWidth: 2 },
        { type: "line", x: 430, y: 270, endX: 470, endY: 230, color: "#666666", lineWidth: 2 },
        { type: "line", x: 370, y: 330, endX: 330, endY: 370, color: "#666666", lineWidth: 2 },
        { type: "line", x: 430, y: 330, endX: 470, endY: 370, color: "#666666", lineWidth: 2 },
      ],
    },
  },
  {
    id: "process-flow",
    name: "Prozessablauf",
    description: "Schrittweise Darstellung von Abläufen",
    preview: "📋 ➡️ ⚙️ ➡️ ✅",
    data: {
      paths: [],
      texts: [
        { x: 150, y: 300, text: "Start", color: "#000000", fontSize: 16 },
        { x: 350, y: 300, text: "Prozess", color: "#000000", fontSize: 16 },
        { x: 550, y: 300, text: "Ende", color: "#000000", fontSize: 16 },
      ],
      shapes: [
        { type: "rectangle", x: 100, y: 275, width: 100, height: 50, color: "#00aa00", lineWidth: 2 },
        { type: "rectangle", x: 300, y: 275, width: 100, height: 50, color: "#0066cc", lineWidth: 2 },
        { type: "rectangle", x: 500, y: 275, width: 100, height: 50, color: "#cc0000", lineWidth: 2 },
        { type: "arrow", x: 200, y: 300, endX: 300, endY: 300, color: "#333333", lineWidth: 2 },
        { type: "arrow", x: 400, y: 300, endX: 500, endY: 300, color: "#333333", lineWidth: 2 },
      ],
    },
  },
  {
    id: "comparison",
    name: "Vergleich",
    description: "Gegenüberstellung von zwei Konzepten",
    preview: "📊 VS 📈\n   ⚖️",
    data: {
      paths: [],
      texts: [
        { x: 250, y: 150, text: "Konzept A", color: "#0066cc", fontSize: 20 },
        { x: 550, y: 150, text: "Konzept B", color: "#cc6600", fontSize: 20 },
        { x: 400, y: 300, text: "VS", color: "#666666", fontSize: 24 },
        { x: 250, y: 400, text: "Vorteile", color: "#00aa00", fontSize: 14 },
        { x: 550, y: 400, text: "Vorteile", color: "#00aa00", fontSize: 14 },
        { x: 250, y: 450, text: "Nachteile", color: "#cc0000", fontSize: 14 },
        { x: 550, y: 450, text: "Nachteile", color: "#cc0000", fontSize: 14 },
      ],
      shapes: [
        { type: "rectangle", x: 200, y: 120, width: 200, height: 350, color: "#0066cc", lineWidth: 2 },
        { type: "rectangle", x: 500, y: 120, width: 200, height: 350, color: "#cc6600", lineWidth: 2 },
        { type: "line", x: 400, y: 120, endX: 400, endY: 470, color: "#666666", lineWidth: 3 },
      ],
    },
  },
  {
    id: "learning-notes",
    name: "Lernnotizen",
    description: "Strukturierte Notizen mit Kategorien",
    preview: "📝 ┌─ 📚\n   ├─ 💡\n   └─ ❓",
    data: {
      paths: [],
      texts: [
        { x: 400, y: 100, text: "Thema", color: "#000000", fontSize: 24 },
        { x: 200, y: 200, text: "Was ich weiß:", color: "#0066cc", fontSize: 16 },
        { x: 600, y: 200, text: "Was ich lernen will:", color: "#cc6600", fontSize: 16 },
        { x: 200, y: 400, text: "Fragen:", color: "#cc0000", fontSize: 16 },
        { x: 600, y: 400, text: "Zusammenfassung:", color: "#00aa00", fontSize: 16 },
      ],
      shapes: [
        { type: "rectangle", x: 150, y: 180, width: 250, height: 150, color: "#0066cc", lineWidth: 2 },
        { type: "rectangle", x: 550, y: 180, width: 250, height: 150, color: "#cc6600", lineWidth: 2 },
        { type: "rectangle", x: 150, y: 380, width: 250, height: 150, color: "#cc0000", lineWidth: 2 },
        { type: "rectangle", x: 550, y: 380, width: 250, height: 150, color: "#00aa00", lineWidth: 2 },
      ],
    },
  },
];

interface KagaTemplatesProps {
  onTemplateSelect: (template: KagaTemplate) => void;
}

// Extract button action handlers to prevent recreation on every render
const handleTemplateSelectAction = (
  template: KagaTemplate,
  onTemplateSelect: (template: KagaTemplate) => void,
  setIsOpen: (open: boolean) => void,
) => () => {
  onTemplateSelect(template);
  setIsOpen(false);
};

export function KagaTemplates({ onTemplateSelect }: KagaTemplatesProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex-1 sm:flex-initial min-h-[44px]"
        >
          📋 Vorlage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>KaGa-Vorlagen auswählen</DialogTitle>
          <DialogDescription>
            Wählen Sie eine Vorlage, um schnell mit einer strukturierten KaGa zu beginnen.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {kagaTemplates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono mb-3 whitespace-pre-line">
                {template.preview}
              </div>
              <p className="text-gray-600 text-sm mb-4">{template.description}</p>
              <Button
                onClick={handleTemplateSelectAction(template, onTemplateSelect, setIsOpen)}
                className="w-full"
              >
                Vorlage verwenden
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}