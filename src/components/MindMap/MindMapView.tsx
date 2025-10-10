import React, {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {MindMap} from "./MindMap";
import {
  generateMindMapFromList,
  generateCombinedMindMap,
  MindMapNode,
} from "@/lib/mindMapService";
import {WordWithExplanation} from "@/components/List/types";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {ArrowLeft, Network} from "lucide-react";

interface MindMapViewProps {
  showCombined?: boolean;
}

// Extract handler outside component
const handleBackAction = (navigate: ReturnType<typeof useNavigate>) => () => {
  navigate(-1);
};

const handleNodeClickAction = (
  node: MindMapNode,
  navigate: ReturnType<typeof useNavigate>,
) => {
  if (node.data.sourceType === "abc-list" && node.data.sourceId) {
    navigate(`/list/${node.data.sourceId}`);
  } else if (node.data.sourceType === "kawa" && node.data.sourceId) {
    // Navigate to KaWa - need to get the full item data
    // For now, navigate to kawas list
    navigate("/kawa");
  }
};

export function MindMapView({showCombined = false}: MindMapViewProps) {
  const navigate = useNavigate();
  const {item} = useParams<{item: string}>();
  const listName = item;
  const [mindMapData, setMindMapData] = useState<{
    nodes: MindMapNode[];
    edges: {id: string; source: string; target: string; type: string}[];
  } | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (showCombined) {
      // Load all ABC-Lists
      const listsData = localStorage.getItem("abcLists");
      const lists = listsData ? JSON.parse(listsData) : [];

      const listSources = lists.slice(0, 5).map((listName: string) => {
        const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
        const words: Record<string, WordWithExplanation[]> = {};

        alphabet.forEach((letter) => {
          const storageKey = `abcList-${listName}:${letter}`;
          const letterData = localStorage.getItem(storageKey);
          if (letterData) {
            words[letter] = JSON.parse(letterData);
          } else {
            words[letter] = [];
          }
        });

        return {name: listName, words};
      });

      const data = generateCombinedMindMap({lists: listSources});
      setMindMapData(data);
    } else if (listName) {
      // Load specific ABC-List
      const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
      const words: Record<string, WordWithExplanation[]> = {};

      alphabet.forEach((letter) => {
        const storageKey = `abcList-${listName}:${letter}`;
        const letterData = localStorage.getItem(storageKey);
        if (letterData) {
          words[letter] = JSON.parse(letterData);
        } else {
          words[letter] = [];
        }
      });

      const data = generateMindMapFromList(listName, words);
      setMindMapData(data);
    }
  }, [listName, showCombined]);

  const handleBack = handleBackAction(navigate);

  const handleNodeClick = (node: MindMapNode) => {
    handleNodeClickAction(node, navigate);
  };

  const toggleHelp = () => setShowHelp(!showHelp);

  if (!mindMapData) {
    return (
      <div className="p-4 text-center">
        <p>Mind-Map wird geladen...</p>
      </div>
    );
  }

  const title = showCombined ? "Kombinierte Mind-Map" : `Mind-Map: ${listName}`;

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6 sm:h-8 sm:w-8" />
            {title}
          </h1>
        </div>
        <Button
          onClick={toggleHelp}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
        >
          💡 Hilfe
        </Button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Interaktive Mind-Map:</strong> Klicke auf Knoten, um zur
          zugehörigen Liste oder zum Eintrag zu navigieren. Nutze die
          Export-Buttons oben rechts, um die Mind-Map als PNG, SVG oder PDF zu
          speichern.
        </p>
      </div>

      <MindMap data={mindMapData} onNodeClick={handleNodeClick} />

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mind-Map Hilfe</DialogTitle>
            <DialogDescription>
              Informationen zur Nutzung der Mind-Map-Funktion
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                🎨 Farbcodierung der Knoten
              </h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <span className="inline-block w-4 h-4 bg-blue-500 rounded mr-2"></span>
                  <strong>Blau:</strong> Wurzel-Knoten (Listen-Name)
                </li>
                <li>
                  <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                  <strong>Grün:</strong> Buchstaben
                </li>
                <li>
                  <span className="inline-block w-4 h-4 bg-amber-500 rounded mr-2"></span>
                  <strong>Orange:</strong> Wörter und Assoziationen
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">
                🖱️ Interaktionsmöglichkeiten
              </h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <strong>Klicken:</strong> Navigiere zur zugehörigen Liste oder
                  zum Eintrag
                </li>
                <li>
                  <strong>Ziehen:</strong> Verschiebe Knoten für bessere
                  Übersicht
                </li>
                <li>
                  <strong>Zoomen:</strong> Nutze das Mausrad oder die
                  Zoom-Controls
                </li>
                <li>
                  <strong>Minimap:</strong> Orientierung bei großen Mind-Maps
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">📥 Export-Optionen</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <strong>PNG:</strong> Pixelgrafik für Präsentationen und
                  Dokumente
                </li>
                <li>
                  <strong>SVG:</strong> Vektorgrafik für skalierbare Darstellung
                </li>
                <li>
                  <strong>PDF:</strong> Druckfertiges Dokument
                </li>
              </ul>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-semibold text-yellow-800 mb-1">
                💡 Birkenbihl-Tipp
              </h3>
              <p className="text-sm text-yellow-700">
                Mind-Maps aktivieren beide Gehirnhälften und fördern das
                vernetzte Denken. Nutze sie, um Zusammenhänge zwischen deinen
                ABC-Listen zu visualisieren und neue Assoziationen zu entdecken.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
