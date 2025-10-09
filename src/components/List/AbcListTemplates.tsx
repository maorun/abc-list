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
import {WordWithExplanation} from "./types";

// Template interface for ABC-Lists
export interface AbcListTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string; // Simple description or emoji representation
  data: Record<string, WordWithExplanation[]>; // Letter -> Words mapping
}

// Predefined templates for various subjects
export const abcListTemplates: AbcListTemplate[] = [
  {
    id: "mathematik-grundlagen",
    name: "Mathematik Grundlagen",
    description: "Basis-Begriffe der Mathematik für Schüler",
    category: "Mathematik",
    preview: "📐 Geometrie, Algebra, Zahlen...",
    data: {
      a: [{text: "Addition", explanation: "Grundrechenart zum Zusammenzählen"}],
      b: [{text: "Bruch", explanation: "Teil eines Ganzen (Zähler/Nenner)"}],
      d: [{text: "Division", explanation: "Grundrechenart zum Teilen"}],
      e: [{text: "Einheit", explanation: "Maßeinheit für Größen"}],
      f: [{text: "Fläche", explanation: "Zweidimensionale Ausdehnung"}],
      g: [{text: "Geometrie", explanation: "Lehre von Formen und Räumen"}],
      k: [{text: "Kreis", explanation: "Runde geometrische Form"}],
      m: [
        {text: "Multiplikation", explanation: "Grundrechenart zum Malnehmen"},
      ],
      p: [{text: "Prozent", explanation: "Anteil von Hundert"}],
      s: [{text: "Subtraktion", explanation: "Grundrechenart zum Abziehen"}],
      v: [{text: "Volumen", explanation: "Rauminhalt eines Körpers"}],
      w: [{text: "Winkel", explanation: "Neigung zwischen zwei Geraden"}],
      z: [{text: "Zahl", explanation: "Mathematische Größe zum Zählen"}],
    },
  },
  {
    id: "englisch-vokabeln",
    name: "Englisch Grundwortschatz",
    description: "Wichtige englische Vokabeln für Anfänger",
    category: "Sprachen",
    preview: "🇬🇧 Hello, Book, Cat...",
    data: {
      a: [{text: "Apple", explanation: "Apfel"}],
      b: [{text: "Book", explanation: "Buch"}],
      c: [{text: "Cat", explanation: "Katze"}],
      d: [{text: "Dog", explanation: "Hund"}],
      e: [{text: "Egg", explanation: "Ei"}],
      f: [{text: "Fish", explanation: "Fisch"}],
      h: [{text: "Hello", explanation: "Hallo"}],
      k: [{text: "Key", explanation: "Schlüssel"}],
      l: [{text: "Light", explanation: "Licht"}],
      m: [{text: "Moon", explanation: "Mond"}],
      s: [{text: "Sun", explanation: "Sonne"}],
      t: [{text: "Tree", explanation: "Baum"}],
      w: [{text: "Water", explanation: "Wasser"}],
    },
  },
  {
    id: "biologie-zelle",
    name: "Biologie: Die Zelle",
    description: "Bestandteile und Funktionen der Zelle",
    category: "Biologie",
    preview: "🔬 DNA, Mitochondrien, Zellkern...",
    data: {
      c: [{text: "Chromosom", explanation: "Träger der Erbinformation"}],
      d: [{text: "DNA", explanation: "Desoxyribonukleinsäure, Erbgut"}],
      e: [{text: "Enzym", explanation: "Biologischer Katalysator"}],
      g: [{text: "Golgi-Apparat", explanation: "Verpackungsorganell"}],
      k: [{text: "Kern", explanation: "Steuerzentrale der Zelle"}],
      m: [{text: "Mitochondrium", explanation: "Kraftwerk der Zelle"}],
      p: [{text: "Protein", explanation: "Eiweißmolekül"}],
      r: [{text: "Ribosom", explanation: "Proteinfabrik"}],
      v: [{text: "Vakuole", explanation: "Speicherorganell"}],
      z: [{text: "Zellmembran", explanation: "Äußere Hülle der Zelle"}],
    },
  },
  {
    id: "geschichte-antike",
    name: "Geschichte: Antike",
    description: "Wichtige Begriffe zur Antike",
    category: "Geschichte",
    preview: "🏛️ Rom, Griechenland, Ägypten...",
    data: {
      a: [{text: "Antike", explanation: "Zeitepoche der alten Hochkulturen"}],
      d: [
        {
          text: "Demokratie",
          explanation: "Herrschaft des Volkes (Griechenland)",
        },
      ],
      g: [{text: "Gladiator", explanation: "Kämpfer in römischer Arena"}],
      k: [{text: "Kolosseum", explanation: "Römisches Amphitheater"}],
      p: [{text: "Pharao", explanation: "Herrscher im alten Ägypten"}],
      r: [{text: "Rom", explanation: "Zentrum des Römischen Reiches"}],
      s: [{text: "Sparta", explanation: "Griechische Kriegerstadt"}],
    },
  },
  {
    id: "physik-energie",
    name: "Physik: Energie",
    description: "Energieformen und physikalische Grundlagen",
    category: "Physik",
    preview: "⚡ Kraft, Energie, Bewegung...",
    data: {
      a: [{text: "Arbeit", explanation: "Kraft mal Weg"}],
      e: [{text: "Energie", explanation: "Fähigkeit, Arbeit zu verrichten"}],
      g: [{text: "Gravitation", explanation: "Anziehungskraft"}],
      k: [{text: "Kraft", explanation: "Ursache für Bewegungsänderung"}],
      l: [{text: "Leistung", explanation: "Arbeit pro Zeit"}],
      m: [{text: "Masse", explanation: "Menge an Materie"}],
      r: [{text: "Reibung", explanation: "Widerstand bei Bewegung"}],
      t: [{text: "Temperatur", explanation: "Maß für Wärme"}],
      w: [{text: "Wärme", explanation: "Thermische Energie"}],
    },
  },
  {
    id: "deutsch-grammatik",
    name: "Deutsch: Grammatik",
    description: "Grundbegriffe der deutschen Grammatik",
    category: "Sprachen",
    preview: "📝 Verb, Nomen, Adjektiv...",
    data: {
      a: [{text: "Adjektiv", explanation: "Eigenschaftswort"}],
      d: [{text: "Deklination", explanation: "Beugung von Nomen"}],
      g: [{text: "Genus", explanation: "Grammatisches Geschlecht"}],
      k: [{text: "Konjugation", explanation: "Beugung von Verben"}],
      n: [{text: "Nomen", explanation: "Hauptwort, Substantiv"}],
      p: [{text: "Prädikat", explanation: "Satzaussage"}],
      s: [{text: "Subjekt", explanation: "Satzgegenstand"}],
      t: [{text: "Tempus", explanation: "Zeitform des Verbs"}],
      v: [{text: "Verb", explanation: "Tätigkeitswort"}],
    },
  },
  {
    id: "chemie-atome",
    name: "Chemie: Atome und Elemente",
    description: "Grundlagen der Chemie",
    category: "Chemie",
    preview: "⚗️ Atom, Molekül, Element...",
    data: {
      a: [{text: "Atom", explanation: "Kleinstes Teilchen eines Elements"}],
      e: [{text: "Element", explanation: "Reiner chemischer Grundstoff"}],
      i: [{text: "Ion", explanation: "Elektrisch geladenes Atom"}],
      k: [
        {
          text: "Katalysator",
          explanation: "Beschleuniger chemischer Reaktionen",
        },
      ],
      m: [{text: "Molekül", explanation: "Verbund aus Atomen"}],
      p: [{text: "Periodensystem", explanation: "Tabelle aller Elemente"}],
      r: [{text: "Reaktion", explanation: "Chemische Umwandlung"}],
      s: [{text: "Säure", explanation: "Protonendonator"}],
      v: [{text: "Verbindung", explanation: "Chemische Verknüpfung"}],
    },
  },
  {
    id: "pruefung-vorbereitung",
    name: "Prüfungsvorbereitung",
    description: "Struktur für effektive Klausurvorbereitung",
    category: "Lerntechnik",
    preview: "📚 Themen, Karteikarten, Zeitplan...",
    data: {
      a: [
        {
          text: "Altklausuren",
          explanation: "Übungsaufgaben aus früheren Prüfungen",
        },
      ],
      f: [
        {
          text: "Fragenkatalog",
          explanation: "Sammlung möglicher Prüfungsfragen",
        },
      ],
      g: [
        {
          text: "Gruppenlern-Session",
          explanation: "Gemeinsames Lernen mit Kommilitonen",
        },
      ],
      k: [{text: "Karteikarten", explanation: "Lernkarten für Wiederholung"}],
      l: [{text: "Lernplan", explanation: "Strukturierter Zeitplan"}],
      m: [{text: "Mind-Map", explanation: "Visuelle Wissensstruktur"}],
      p: [{text: "Pausen", explanation: "Regelmäßige Erholungszeiten"}],
      s: [{text: "Simulation", explanation: "Prüfungssituation üben"}],
      t: [{text: "Themenübersicht", explanation: "Alle relevanten Inhalte"}],
      z: [{text: "Zeitmanagement", explanation: "Effiziente Zeiteinteilung"}],
    },
  },
];

interface AbcListTemplatesProps {
  onTemplateSelect: (template: AbcListTemplate) => void;
}

// Extract handler outside component to prevent recreation on every render
const handleTemplateSelectAction =
  (
    template: AbcListTemplate,
    onTemplateSelect: (template: AbcListTemplate) => void,
    setIsOpen: (open: boolean) => void,
  ) =>
  () => {
    onTemplateSelect(template);
    setIsOpen(false);
  };

export function AbcListTemplates({onTemplateSelect}: AbcListTemplatesProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Group templates by category
  const groupedTemplates = abcListTemplates.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    },
    {} as Record<string, AbcListTemplate[]>,
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
          <DialogTitle>ABC-Listen Vorlagen auswählen</DialogTitle>
          <DialogDescription>
            Wählen Sie eine Vorlage, um schnell mit einer vorausgefüllten
            ABC-Liste für verschiedene Fachbereiche zu beginnen.
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
