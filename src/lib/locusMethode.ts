// Loci-Methode (Method of Loci / Memory Palace) - Core data structures and utilities
// Implements spatial memory technique with virtual rooms and memory routes

export const LOCUS_STORAGE_KEYS = {
  MEMORY_PALACES: "locus-memoryPalaces",
  ACTIVE_PALACE_ID: "locus-activePalaceId",
} as const;

export interface MemoryObject {
  id: string;
  content: string; // The information to remember
  x: number; // Position in the room (percentage 0-100)
  y: number; // Position in the room (percentage 0-100)
  color: string;
  size: number; // Size in pixels
  symbol?: string; // Optional emoji/symbol
  notes?: string; // Additional notes
  createdAt: string;
  reviewCount: number;
  lastReviewed?: string;
}

export interface MemoryRoute {
  id: string;
  name: string;
  objectIds: string[]; // Ordered list of memory objects
  description?: string;
  createdAt: string;
}

export type RoomTemplateType = "haus" | "buero" | "natur" | "custom";

export interface RoomTemplate {
  type: RoomTemplateType;
  name: string;
  description: string;
  backgroundColor: string;
  landmarks: Array<{
    x: number;
    y: number;
    label: string;
    icon: string;
  }>;
}

export interface MemoryPalace {
  id: string;
  name: string;
  template: RoomTemplateType;
  objects: MemoryObject[];
  routes: MemoryRoute[];
  createdAt: string;
  lastModified: string;
  reviewCount: number;
}

export interface LocusMethodeStats {
  totalPalaces: number;
  totalObjects: number;
  totalRoutes: number;
  averageObjectsPerPalace: number;
  mostUsedTemplate: RoomTemplateType;
  totalReviewCount: number;
}

// Predefined room templates
export const ROOM_TEMPLATES: Record<RoomTemplateType, RoomTemplate> = {
  haus: {
    type: "haus",
    name: "Haus",
    description: "Ein gemütliches Haus mit verschiedenen Räumen",
    backgroundColor: "#F5F5DC",
    landmarks: [
      {x: 10, y: 10, label: "Eingang", icon: "🚪"},
      {x: 30, y: 20, label: "Wohnzimmer", icon: "🛋️"},
      {x: 60, y: 20, label: "Küche", icon: "🍳"},
      {x: 30, y: 60, label: "Schlafzimmer", icon: "🛏️"},
      {x: 70, y: 60, label: "Badezimmer", icon: "🚿"},
    ],
  },
  buero: {
    type: "buero",
    name: "Büro",
    description: "Ein professionelles Büro zum Arbeiten",
    backgroundColor: "#E8E8E8",
    landmarks: [
      {x: 20, y: 30, label: "Schreibtisch", icon: "🖥️"},
      {x: 60, y: 30, label: "Bücherregal", icon: "📚"},
      {x: 40, y: 70, label: "Besprechungstisch", icon: "📋"},
      {x: 80, y: 20, label: "Whiteboard", icon: "📊"},
      {x: 15, y: 80, label: "Aktenschrank", icon: "🗄️"},
    ],
  },
  natur: {
    type: "natur",
    name: "Natur",
    description: "Eine natürliche Umgebung im Freien",
    backgroundColor: "#90EE90",
    landmarks: [
      {x: 30, y: 40, label: "Großer Baum", icon: "🌳"},
      {x: 70, y: 30, label: "Blumenwiese", icon: "🌸"},
      {x: 50, y: 70, label: "Teich", icon: "💧"},
      {x: 15, y: 20, label: "Felsen", icon: "🪨"},
      {x: 85, y: 75, label: "Bank", icon: "🪑"},
    ],
  },
  custom: {
    type: "custom",
    name: "Eigener Raum",
    description: "Gestalte deinen eigenen Gedächtnisraum",
    backgroundColor: "#FFFFFF",
    landmarks: [],
  },
};

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// Create a new memory palace
export function createMemoryPalace(
  name: string,
  template: RoomTemplateType,
): MemoryPalace {
  return {
    id: generateId(),
    name,
    template,
    objects: [],
    routes: [],
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    reviewCount: 0,
  };
}

// Create a new memory object
export function createMemoryObject(
  content: string,
  x: number,
  y: number,
): MemoryObject {
  return {
    id: generateId(),
    content,
    x,
    y,
    color: "#3B82F6", // Default blue color
    size: 40,
    createdAt: new Date().toISOString(),
    reviewCount: 0,
  };
}

// Create a new memory route
export function createMemoryRoute(
  name: string,
  objectIds: string[],
): MemoryRoute {
  return {
    id: generateId(),
    name,
    objectIds,
    createdAt: new Date().toISOString(),
  };
}

// Calculate statistics
export function calculateLocusStats(
  palaces: MemoryPalace[],
): LocusMethodeStats {
  const totalPalaces = palaces.length;
  const totalObjects = palaces.reduce(
    (sum, palace) => sum + palace.objects.length,
    0,
  );
  const totalRoutes = palaces.reduce(
    (sum, palace) => sum + palace.routes.length,
    0,
  );
  const totalReviewCount = palaces.reduce(
    (sum, palace) => sum + palace.reviewCount,
    0,
  );

  const averageObjectsPerPalace =
    totalPalaces > 0 ? totalObjects / totalPalaces : 0;

  // Find most used template
  const templateCounts: Record<string, number> = {};
  palaces.forEach((palace) => {
    templateCounts[palace.template] =
      (templateCounts[palace.template] || 0) + 1;
  });
  const mostUsedTemplate =
    (Object.entries(templateCounts).sort(
      ([, a], [, b]) => b - a,
    )[0]?.[0] as RoomTemplateType) || "haus";

  return {
    totalPalaces,
    totalObjects,
    totalRoutes,
    averageObjectsPerPalace,
    mostUsedTemplate,
    totalReviewCount,
  };
}

// Validate memory object position (must be within canvas bounds)
export function isValidPosition(x: number, y: number): boolean {
  return x >= 0 && x <= 100 && y >= 0 && y <= 100;
}
