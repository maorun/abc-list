import React from "react";
import {Button} from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

// Template interface for Stadt-Land-Fluss
export interface StadtLandFlussTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  categories: string[];
}

// Predefined Stadt-Land-Fluss templates
export const stadtLandFlussTemplates: StadtLandFlussTemplate[] = [
  {
    id: "klassisch",
    name: "Klassisch",
    description: "Die traditionelle Version mit Grundkategorien",
    category: "Standard",
    preview: "🏙️ Stadt, Land, Fluss...",
    categories: [
      "Stadt",
      "Land",
      "Fluss",
      "Tier",
      "Beruf",
      "Name",
      "Lebensmittel",
      "Gegenstand",
    ],
  },
  {
    id: "erweitert",
    name: "Erweitert",
    description: "Erweiterte Version mit mehr Kategorien",
    category: "Standard",
    preview: "🌍 Hauptstadt, Automarke, Prominenter...",
    categories: [
      "Hauptstadt",
      "Land",
      "Fluss/Gewässer",
      "Tier",
      "Pflanze",
      "Beruf",
      "Vorname",
      "Nachname",
      "Prominenter",
      "Automarke",
      "Farbe",
      "Sportart",
    ],
  },
  {
    id: "geographie",
    name: "Geographie",
    description: "Fokus auf geografische Begriffe",
    category: "Erdkunde",
    preview: "🗺️ Kontinent, Gebirge, Meer...",
    categories: [
      "Kontinent",
      "Land",
      "Hauptstadt",
      "Stadt",
      "Fluss",
      "See",
      "Meer",
      "Gebirge",
      "Insel",
      "Wüste",
    ],
  },
  {
    id: "natur",
    name: "Natur",
    description: "Tiere, Pflanzen und Naturphänomene",
    category: "Biologie",
    preview: "🌿 Säugetier, Blume, Baum...",
    categories: [
      "Säugetier",
      "Vogel",
      "Fisch",
      "Insekt",
      "Blume",
      "Baum",
      "Gemüse",
      "Frucht",
      "Naturphänomen",
    ],
  },
  {
    id: "wissenschaft",
    name: "Wissenschaft",
    description: "Naturwissenschaftliche Begriffe",
    category: "Naturwissenschaft",
    preview: "🔬 Element, Planet, Organ...",
    categories: [
      "Chemisches Element",
      "Planet",
      "Organ",
      "Knochen",
      "Krankheit",
      "Erfindung",
      "Wissenschaftler",
      "Einheit",
    ],
  },
  {
    id: "kultur",
    name: "Kultur",
    description: "Kunst, Musik und Literatur",
    category: "Kunst & Kultur",
    preview: "🎨 Künstler, Instrument, Buch...",
    categories: [
      "Künstler",
      "Musikinstrument",
      "Musikstil",
      "Buchtitel",
      "Film",
      "Schauspieler",
      "Maler",
      "Komponist",
    ],
  },
  {
    id: "geschichte",
    name: "Geschichte",
    description: "Historische Ereignisse und Personen",
    category: "Geschichte",
    preview: "🏛️ Epoche, Herrscher, Schlacht...",
    categories: [
      "Epoche",
      "Herrscher",
      "Schlacht",
      "Revolution",
      "Erfindung",
      "Bauwerk",
      "Historische Person",
      "Ereignis",
    ],
  },
  {
    id: "schule",
    name: "Schule",
    description: "Schulbezogene Begriffe",
    category: "Bildung",
    preview: "📚 Schulfach, Lehrmittel, Schulform...",
    categories: [
      "Schulfach",
      "Lehrmittel",
      "Schulform",
      "Schulveranstaltung",
      "Benotung",
      "Klassenraum-Objekt",
      "Schulpersonal",
    ],
  },
  {
    id: "alltag",
    name: "Alltag",
    description: "Begriffe aus dem täglichen Leben",
    category: "Alltag",
    preview: "🏠 Möbel, Kleidung, Küche...",
    categories: [
      "Möbelstück",
      "Kleidungsstück",
      "Küchengerät",
      "Werkzeug",
      "Hobby",
      "Transportmittel",
      "Haustier",
      "Getränk",
    ],
  },
  {
    id: "essen-trinken",
    name: "Essen & Trinken",
    description: "Kulinarische Kategorien",
    category: "Kulinarik",
    preview: "🍽️ Gemüse, Gewürz, Gericht...",
    categories: [
      "Gemüse",
      "Obst",
      "Fleisch",
      "Gewürz",
      "Gericht",
      "Süßigkeit",
      "Getränk",
      "Backware",
    ],
  },
  {
    id: "sport",
    name: "Sport",
    description: "Sportarten und Sportvokabular",
    category: "Sport",
    preview: "⚽ Sportart, Sportler, Verein...",
    categories: [
      "Sportart",
      "Sportler",
      "Sportverein",
      "Sportstätte",
      "Sportgerät",
      "Wettbewerb",
      "Mannschaft",
    ],
  },
  {
    id: "technik",
    name: "Technik",
    description: "Technologie und moderne Geräte",
    category: "Technologie",
    preview: "💻 Software, Gerät, Marke...",
    categories: [
      "Software",
      "Gerät",
      "Marke",
      "Programmiersprache",
      "Betriebssystem",
      "App",
      "Tech-Unternehmen",
    ],
  },
  {
    id: "sprachen",
    name: "Sprachen",
    description: "Für Fremdsprachen-Lernen",
    category: "Bildung",
    preview: "🗣️ Englisches Wort, Französisches Wort...",
    categories: [
      "Englisches Wort",
      "Französisches Wort",
      "Spanisches Wort",
      "Italienisches Wort",
      "Sprache",
      "Land (auf Englisch)",
    ],
  },
  {
    id: "mathe",
    name: "Mathematik",
    description: "Mathematische Begriffe",
    category: "Mathematik",
    preview: "📐 Geometrische Form, Rechenart, Zahl...",
    categories: [
      "Geometrische Form",
      "Rechenart",
      "Zahlenart",
      "Einheit",
      "Mathematiker",
      "Theorem",
      "Formel-Symbol",
    ],
  },
  {
    id: "kinder",
    name: "Für Kinder",
    description: "Einfache Kategorien für Kinder",
    category: "Kinder",
    preview: "🧸 Spielzeug, Märchen, Farbe...",
    categories: [
      "Spielzeug",
      "Märchenfigur",
      "Farbe",
      "Zahl",
      "Buchstabe",
      "Tier",
      "Essen",
      "Körperteil",
    ],
  },
];

interface StadtLandFlussTemplatesProps {
  onTemplateSelect: (template: StadtLandFlussTemplate) => void;
}

// Extract handler outside component to prevent recreation on every render
const handleTemplateSelectAction =
  (
    template: StadtLandFlussTemplate,
    onTemplateSelect: (template: StadtLandFlussTemplate) => void,
    setIsOpen: (open: boolean) => void,
  ) =>
  () => {
    onTemplateSelect(template);
    setIsOpen(false);
  };

export function StadtLandFlussTemplates({
  onTemplateSelect,
}: StadtLandFlussTemplatesProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Group templates by category
  const groupedTemplates = stadtLandFlussTemplates.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    },
    {} as Record<string, StadtLandFlussTemplate[]>,
  );

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
          <DialogTitle>Stadt-Land-Fluss Vorlagen auswählen</DialogTitle>
          <DialogDescription>
            Wählen Sie eine Vorlage mit vordefinierten Kategorien für Ihr
            Stadt-Land-Fluss Spiel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(groupedTemplates).map(([category, templates]) => (
            <div key={category}>
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                {category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="font-semibold text-base mb-2">
                      {template.name}
                    </h4>
                    <div className="bg-gray-100 p-2 rounded text-sm mb-3">
                      {template.preview}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {template.description}
                    </p>
                    <div className="text-xs text-gray-500 mb-4">
                      {template.categories.length} Kategorien:{" "}
                      {template.categories.slice(0, 3).join(", ")}
                      {template.categories.length > 3 && "..."}
                    </div>
                    <Button
                      onClick={handleTemplateSelectAction(
                        template,
                        onTemplateSelect,
                        setIsOpen,
                      )}
                      className="w-full"
                    >
                      Vorlage verwenden
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
