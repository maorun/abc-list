/**
 * Symbol Library for Dual-Coding Support
 * Provides predefined symbols for visual learning associations
 */

export interface Symbol {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
}

export const SYMBOL_CATEGORIES = [
  "Wissenschaft",
  "Mathematik",
  "Sprachen",
  "Natur",
  "Technik",
  "Emotion",
  "Zeit",
  "Richtung",
  "Zustand",
] as const;

export type SymbolCategory = (typeof SYMBOL_CATEGORIES)[number];

export const SYMBOL_LIBRARY: Symbol[] = [
  // Wissenschaft
  {
    id: "microscope",
    name: "Mikroskop",
    emoji: "🔬",
    category: "Wissenschaft",
    description: "Wissenschaftliche Forschung und Experimente",
  },
  {
    id: "test-tube",
    name: "Reagenzglas",
    emoji: "🧪",
    category: "Wissenschaft",
    description: "Chemische Experimente und Versuche",
  },
  {
    id: "dna",
    name: "DNA",
    emoji: "🧬",
    category: "Wissenschaft",
    description: "Biologie und Genetik",
  },
  {
    id: "atom",
    name: "Atom",
    emoji: "⚛️",
    category: "Wissenschaft",
    description: "Physik und Atomstruktur",
  },

  // Mathematik
  {
    id: "calculator",
    name: "Taschenrechner",
    emoji: "🧮",
    category: "Mathematik",
    description: "Berechnungen und Mathematik",
  },
  {
    id: "chart-up",
    name: "Aufwärtstrend",
    emoji: "📈",
    category: "Mathematik",
    description: "Wachstum und steigende Werte",
  },
  {
    id: "chart-down",
    name: "Abwärtstrend",
    emoji: "📉",
    category: "Mathematik",
    description: "Rückgang und fallende Werte",
  },
  {
    id: "infinity",
    name: "Unendlich",
    emoji: "♾️",
    category: "Mathematik",
    description: "Unendlichkeit und kontinuierliche Prozesse",
  },

  // Sprachen
  {
    id: "book",
    name: "Buch",
    emoji: "📚",
    category: "Sprachen",
    description: "Lernen und Wissen",
  },
  {
    id: "pencil",
    name: "Stift",
    emoji: "✏️",
    category: "Sprachen",
    description: "Schreiben und Notizen",
  },
  {
    id: "speech",
    name: "Sprechblase",
    emoji: "💬",
    category: "Sprachen",
    description: "Kommunikation und Dialog",
  },
  {
    id: "abc",
    name: "ABC",
    emoji: "🔤",
    category: "Sprachen",
    description: "Alphabet und Sprache",
  },

  // Natur
  {
    id: "tree",
    name: "Baum",
    emoji: "🌳",
    category: "Natur",
    description: "Natur und Umwelt",
  },
  {
    id: "sun",
    name: "Sonne",
    emoji: "☀️",
    category: "Natur",
    description: "Licht und Energie",
  },
  {
    id: "water",
    name: "Wasser",
    emoji: "💧",
    category: "Natur",
    description: "Wasser und Flüssigkeiten",
  },
  {
    id: "earth",
    name: "Erde",
    emoji: "🌍",
    category: "Natur",
    description: "Planet Erde und Geografie",
  },

  // Technik
  {
    id: "gear",
    name: "Zahnrad",
    emoji: "⚙️",
    category: "Technik",
    description: "Mechanik und Technik",
  },
  {
    id: "bulb",
    name: "Glühbirne",
    emoji: "💡",
    category: "Technik",
    description: "Ideen und Innovation",
  },
  {
    id: "computer",
    name: "Computer",
    emoji: "💻",
    category: "Technik",
    description: "Informatik und Technologie",
  },
  {
    id: "rocket",
    name: "Rakete",
    emoji: "🚀",
    category: "Technik",
    description: "Fortschritt und Entwicklung",
  },

  // Emotion
  {
    id: "star",
    name: "Stern",
    emoji: "⭐",
    category: "Emotion",
    description: "Wichtigkeit und Qualität",
  },
  {
    id: "heart",
    name: "Herz",
    emoji: "❤️",
    category: "Emotion",
    description: "Liebe und Zuneigung",
  },
  {
    id: "check",
    name: "Haken",
    emoji: "✅",
    category: "Emotion",
    description: "Erfolg und Bestätigung",
  },
  {
    id: "warning",
    name: "Warnung",
    emoji: "⚠️",
    category: "Emotion",
    description: "Achtung und Wichtigkeit",
  },

  // Zeit
  {
    id: "clock",
    name: "Uhr",
    emoji: "⏰",
    category: "Zeit",
    description: "Zeit und Termine",
  },
  {
    id: "hourglass",
    name: "Sanduhr",
    emoji: "⏳",
    category: "Zeit",
    description: "Zeitablauf und Prozesse",
  },
  {
    id: "calendar",
    name: "Kalender",
    emoji: "📅",
    category: "Zeit",
    description: "Datum und Planung",
  },

  // Richtung
  {
    id: "arrow-up",
    name: "Pfeil hoch",
    emoji: "⬆️",
    category: "Richtung",
    description: "Aufwärts und Verbesserung",
  },
  {
    id: "arrow-down",
    name: "Pfeil runter",
    emoji: "⬇️",
    category: "Richtung",
    description: "Abwärts und Verringerung",
  },
  {
    id: "arrow-right",
    name: "Pfeil rechts",
    emoji: "➡️",
    category: "Richtung",
    description: "Weiter und Fortsetzung",
  },
  {
    id: "cycle",
    name: "Kreislauf",
    emoji: "🔄",
    category: "Richtung",
    description: "Wiederholung und Zyklus",
  },

  // Zustand
  {
    id: "lock",
    name: "Schloss",
    emoji: "🔒",
    category: "Zustand",
    description: "Sicherheit und Schutz",
  },
  {
    id: "key",
    name: "Schlüssel",
    emoji: "🔑",
    category: "Zustand",
    description: "Lösung und Zugang",
  },
  {
    id: "magnet",
    name: "Magnet",
    emoji: "🧲",
    category: "Zustand",
    description: "Anziehung und Kraft",
  },
  {
    id: "target",
    name: "Zielscheibe",
    emoji: "🎯",
    category: "Zustand",
    description: "Ziel und Fokus",
  },
];

export const getSymbolsByCategory = (category: SymbolCategory): Symbol[] => {
  return SYMBOL_LIBRARY.filter((symbol) => symbol.category === category);
};

export const getSymbolById = (id: string): Symbol | undefined => {
  return SYMBOL_LIBRARY.find((symbol) => symbol.id === id);
};

export const searchSymbols = (query: string): Symbol[] => {
  const lowerQuery = query.toLowerCase();
  return SYMBOL_LIBRARY.filter(
    (symbol) =>
      symbol.name.toLowerCase().includes(lowerQuery) ||
      symbol.description.toLowerCase().includes(lowerQuery) ||
      symbol.category.toLowerCase().includes(lowerQuery),
  );
};
