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

// Template interface for KaWa
export interface KawaTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  word: string; // The main word for the KaWa
  preview: string;
  associations: Record<string, string[]>; // Letter -> Associations (plural)
}

// Predefined KaWa templates
export const kawaTemplates: KawaTemplate[] = [
  {
    id: "lernen",
    name: "LERNEN",
    description: "Kreative Assoziationen zum Thema Lernen",
    category: "Bildung",
    word: "LERNEN",
    preview: "📚 Lesen, Erinnern, Notizen...",
    associations: {
      l: ["Lesen - Aufnahme von Informationen"],
      e: [
        "Erinnern - Abrufen von Wissen",
        "Experimentieren - Aktives Ausprobieren",
      ],
      r: ["Repetieren - Wiederholung festigt"],
      n: [
        "Notizen - Schriftliches Festhalten",
        "Nachdenken - Reflektieren über Gelerntes",
      ],
    },
  },
  {
    id: "erfolg",
    name: "ERFOLG",
    description: "Erfolgsfaktoren visualisieren",
    category: "Motivation",
    word: "ERFOLG",
    preview: "🎯 Energie, Fokus, Geduld...",
    associations: {
      e: ["Energie - Kraft und Motivation"],
      r: ["Routine - Regelmäßige Gewohnheiten"],
      f: ["Fokus - Konzentration auf Ziele"],
      o: ["Optimismus - Positive Einstellung"],
      l: ["Lernen - Ständige Weiterentwicklung"],
      g: ["Geduld - Beharrlichkeit zahlt sich aus"],
    },
  },
  {
    id: "wissen",
    name: "WISSEN",
    description: "Aspekte des Wissenserwerbs",
    category: "Bildung",
    word: "WISSEN",
    preview: "🧠 Wahrheit, Information, Struktur...",
    associations: {
      w: ["Wahrheit - Fundierte Erkenntnisse"],
      i: ["Information - Daten und Fakten"],
      s: [
        "Struktur - Organisierte Gedanken",
        "Synthese - Verbindung von Ideen",
      ],
      e: ["Erfahrung - Praktisches Lernen"],
      n: ["Neugier - Wissensdurst"],
    },
  },
  {
    id: "fokus",
    name: "FOKUS",
    description: "Konzentration und Aufmerksamkeit",
    category: "Produktivität",
    word: "FOKUS",
    preview: "🎯 Ziel, Klarheit, Ruhe...",
    associations: {
      f: ["Filter - Unwichtiges ausblenden"],
      o: ["Organisation - Strukturiertes Vorgehen"],
      k: ["Klarheit - Deutliche Zielsetzung"],
      u: ["Übung - Training der Konzentration"],
      s: ["Stille - Ruhige Umgebung"],
    },
  },
  {
    id: "kreativ",
    name: "KREATIV",
    description: "Kreativität und Innovation",
    category: "Kreativität",
    word: "KREATIV",
    preview: "🎨 Kunst, Ideen, Vision...",
    associations: {
      k: ["Kunst - Ausdruck von Ideen"],
      r: ["Risikobereitschaft - Mut zum Neuen"],
      e: ["Experimentieren - Ausprobieren"],
      a: ["Assoziieren - Verbindungen schaffen"],
      t: ["Träumen - Visionen entwickeln"],
      i: ["Inspiration - Kreative Impulse"],
      v: ["Variation - Unterschiedliche Ansätze"],
    },
  },
  {
    id: "freiheit",
    name: "FREIHEIT",
    description: "Facetten der Freiheit",
    category: "Philosophie",
    word: "FREIHEIT",
    preview: "🕊️ Wahl, Autonomie, Selbstbestimmung...",
    associations: {
      f: ["Freie Wahl - Entscheidungsfreiheit"],
      r: ["Respekt - Achtung der Grenzen"],
      e: [
        "Eigenverantwortung - Selbstständiges Handeln",
        "Entfaltung - Persönliches Wachstum",
      ],
      i: [
        "Individualität - Eigene Persönlichkeit",
        "Initiative - Aktives Gestalten",
      ],
      h: ["Hoffnung - Glaube an Möglichkeiten"],
      t: ["Toleranz - Akzeptanz der Vielfalt"],
    },
  },
  {
    id: "zukunft",
    name: "ZUKUNFT",
    description: "Gedanken zur Zukunft",
    category: "Philosophie",
    word: "ZUKUNFT",
    preview: "🔮 Ziele, Vision, Planung...",
    associations: {
      z: ["Ziele - Angestrebte Ergebnisse"],
      u: ["Ungewissheit - Offene Möglichkeiten", "Utopie - Ideale Vorstellung"],
      k: ["Kreativität - Gestaltungskraft"],
      n: ["Neugier - Interesse am Kommenden"],
      f: ["Fortschritt - Weiterentwicklung"],
      t: ["Träume - Visionäre Ideen"],
    },
  },
  {
    id: "energie",
    name: "ENERGIE",
    description: "Energiequellen und -formen",
    category: "Naturwissenschaft",
    word: "ENERGIE",
    preview: "⚡ Kraft, Bewegung, Wärme...",
    associations: {
      e: [
        "Elektrizität - Elektrische Energie",
        "Erneuerbar - Nachhaltige Energie",
        "Erhaltung - Energieerhaltungssatz",
      ],
      n: ["Natur - Natürliche Energiequellen"],
      r: ["Reibung - Mechanische Energie"],
      g: ["Generator - Energieerzeugung"],
      i: ["Impuls - Bewegungsenergie"],
    },
  },
  {
    id: "gesund",
    name: "GESUND",
    description: "Aspekte der Gesundheit",
    category: "Gesundheit",
    word: "GESUND",
    preview: "💪 Bewegung, Ernährung, Schlaf...",
    associations: {
      g: ["Genuss - Bewusste Ernährung"],
      e: ["Entspannung - Stressabbau"],
      s: ["Sport - Regelmäßige Bewegung"],
      u: ["Umfeld - Gesunde Umgebung"],
      n: ["Nahrung - Ausgewogene Ernährung"],
      d: ["Durchhaltevermögen - Langfristige Gewohnheiten"],
    },
  },
  {
    id: "sprache",
    name: "SPRACHE",
    description: "Elemente der Sprache",
    category: "Bildung",
    word: "SPRACHE",
    preview: "🗣️ Worte, Grammatik, Kommunikation...",
    associations: {
      s: ["Syntax - Satzbau"],
      p: ["Phonetik - Lautlehre"],
      r: ["Rhetorik - Redekunst"],
      a: ["Artikulation - Aussprache"],
      c: ["Kommunikation - Austausch"],
      h: ["Hörverstehen - Zuhören"],
      e: ["Entwicklung - Spracherwerb"],
    },
  },
];

interface KawaTemplatesProps {
  onTemplateSelect: (template: KawaTemplate) => void;
}

// Extract handler outside component to prevent recreation on every render
const handleTemplateSelectAction =
  (
    template: KawaTemplate,
    onTemplateSelect: (template: KawaTemplate) => void,
    setIsOpen: (open: boolean) => void,
  ) =>
  () => {
    onTemplateSelect(template);
    setIsOpen(false);
  };

export function KawaTemplates({onTemplateSelect}: KawaTemplatesProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Group templates by category
  const groupedTemplates = kawaTemplates.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    },
    {} as Record<string, KawaTemplate[]>,
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
          <DialogTitle>KaWa Vorlagen auswählen</DialogTitle>
          <DialogDescription>
            Wählen Sie eine Vorlage für ein vorausgefülltes KaWa (Kreative
            Ausbeute mit Wort-Assoziationen).
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
                    <p className="text-gray-600 text-sm mb-4">
                      {template.description}
                    </p>
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
