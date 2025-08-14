import React from "react";
import {
  Heart,
  Clock,
  Tag,
  TrendingUp,
  Star,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {SearchResult} from "@/lib/searchService";
import {SearchResults} from "./SearchResults";

interface SmartCollectionsProps {
  collections: {
    favorites: SearchResult[];
    recent: SearchResult[];
    untagged: SearchResult[];
    mostUsed: SearchResult[];
  };
  onAddTag: (itemId: string, tag: string) => void;
  onRemoveTag: (itemId: string, tag: string) => void;
  onToggleFavorite: (itemId: string) => boolean;
  onSearchQuery: (query: string) => void;
}

export function SmartCollections({
  collections,
  onAddTag,
  onRemoveTag,
  onToggleFavorite,
  onSearchQuery,
}: SmartCollectionsProps) {
  const collectionConfig = [
    {
      key: "favorites" as keyof typeof collections,
      title: "Favoriten",
      description: "Deine als Favoriten markierten Listen und Wörter",
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      emptyMessage: "Keine Favoriten vorhanden",
      emptyDescription:
        "Markiere Listen oder Wörter als Favoriten, um sie hier zu sehen",
    },
    {
      key: "recent" as keyof typeof collections,
      title: "Kürzlich erstellt",
      description: "In den letzten 7 Tagen erstellte oder bearbeitete Inhalte",
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      emptyMessage: "Keine kürzlichen Aktivitäten",
      emptyDescription: "Erstelle oder bearbeite Listen, um sie hier zu sehen",
    },
    {
      key: "untagged" as keyof typeof collections,
      title: "Ohne Tags",
      description: "Listen und Wörter ohne Kategorisierung",
      icon: Tag,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      emptyMessage: "Alle Inhalte sind getaggt",
      emptyDescription: "Super! Alle deine Inhalte haben bereits Tags",
    },
    {
      key: "mostUsed" as keyof typeof collections,
      title: "Häufig gesucht",
      description: "Basierend auf deinem Suchverlauf",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      emptyMessage: "Noch keine Suchstatistiken",
      emptyDescription: "Nutze die Suche, um hier relevante Inhalte zu sehen",
    },
  ];

  const [expandedCollection, setExpandedCollection] = React.useState<
    string | null
  >(null);

  const toggleCollection = (key: string) => {
    setExpandedCollection(expandedCollection === key ? null : key);
  };

  const CollectionPreview = ({
    items,
    maxItems = 3,
  }: {
    items: SearchResult[];
    maxItems?: number;
  }) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-2">
        {items.slice(0, maxItems).map((result) => (
          <div
            key={result.item.id}
            className="flex items-center gap-2 p-2 bg-white rounded border hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => {
              if (result.item.type !== "word") {
                onSearchQuery(result.item.title);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (result.item.type !== "word") {
                  onSearchQuery(result.item.title);
                }
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Suche nach ${result.item.title}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">
                  {result.item.title}
                </span>
                <Badge variant="outline" className="text-xs">
                  {result.item.type === "abc-list"
                    ? "Liste"
                    : result.item.type === "kawa"
                      ? "KaWa"
                      : result.item.type === "kaga"
                        ? "KaGa"
                        : "Wort"}
                </Badge>
              </div>
              {result.item.tags.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {result.item.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {result.item.tags.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{result.item.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
            {result.item.metadata.isFavorite && (
              <Heart className="h-4 w-4 text-red-500 fill-current flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Smart Collections
        </h2>
        <p className="text-sm text-gray-600">
          Automatisch organisierte Sammlungen deiner Inhalte
        </p>
      </div>

      {/* Collection cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {collectionConfig.map(
          ({
            key,
            title,
            description,
            icon: Icon,
            color,
            bgColor,
            borderColor,
            emptyMessage,
            emptyDescription,
          }) => {
            const items = collections[key];
            const isExpanded = expandedCollection === key;

            return (
              <div
                key={key}
                className={`border rounded-lg overflow-hidden ${borderColor}`}
              >
                {/* Card header */}
                <div className={`${bgColor} p-4 border-b ${borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-white rounded-lg ${color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{items.length}</Badge>
                      {items.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCollection(key)}
                        >
                          {isExpanded ? "Weniger" : "Alle"} anzeigen
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card content */}
                <div className="p-4">
                  {items.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Icon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="font-medium">{emptyMessage}</p>
                      <p className="text-sm">{emptyDescription}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {!isExpanded ? (
                        <>
                          <CollectionPreview items={items} />
                          {items.length > 3 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCollection(key)}
                              className="w-full flex items-center gap-2"
                            >
                              Alle {items.length} anzeigen
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      ) : (
                        <SearchResults
                          results={items}
                          isLoading={false}
                          onAddTag={onAddTag}
                          onRemoveTag={onRemoveTag}
                          onToggleFavorite={onToggleFavorite}
                          emptyMessage={emptyMessage}
                          emptyDescription={emptyDescription}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          },
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h3 className="font-medium text-gray-700 mb-3">🚀 Schnellaktionen</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSearchQuery("tag:")}
            className="flex items-center gap-2 justify-start"
          >
            <Tag className="h-4 w-4" />
            Nach Tags suchen
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSearchQuery("favorite:true")}
            className="flex items-center gap-2 justify-start"
          >
            <Heart className="h-4 w-4" />
            Nur Favoriten
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSearchQuery("type:abc-list")}
            className="flex items-center gap-2 justify-start"
          >
            <BookOpen className="h-4 w-4" />
            Nur ABC-Listen
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSearchQuery("")}
            className="flex items-center gap-2 justify-start"
          >
            <Star className="h-4 w-4" />
            Alle durchsuchen
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-3">
          📊 Sammlungsstatistiken
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {collectionConfig.map(({key, title, color}) => (
            <div key={key} className="text-center">
              <div className={`text-lg font-semibold ${color}`}>
                {collections[key].length}
              </div>
              <div className="text-gray-600 text-xs">{title}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-blue-200">
          <div className="text-xs text-blue-600 space-y-1">
            <p>
              💡 <strong>Tipp:</strong> Smart Collections werden automatisch
              aktualisiert
            </p>
            <p>
              🏷️ <strong>Organisation:</strong> Verwende Tags für bessere
              Kategorisierung
            </p>
            <p>
              ⭐ <strong>Favoriten:</strong> Markiere wichtige Inhalte als
              Favoriten
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
