import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {
  Heart,
  Tag,
  Calendar,
  Star,
  ChevronRight,
  List,
  PenTool,
  Image,
  BookOpen,
  Plus,
  X,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {SearchResult} from "@/lib/searchService";
import {Input} from "@/components/ui/input";

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  onAddTag: (itemId: string, tag: string) => void;
  onRemoveTag: (itemId: string, tag: string) => void;
  onToggleFavorite: (itemId: string) => boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function SearchResults({
  results,
  isLoading,
  onAddTag,
  onRemoveTag,
  onToggleFavorite,
  emptyMessage = "Keine Ergebnisse gefunden",
  emptyDescription = "Versuche andere Suchbegriffe oder filter",
}: SearchResultsProps) {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [newTags, setNewTags] = useState<Record<string, string>>({});

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleNavigateToItem = (result: SearchResult) => {
    const {item} = result;

    switch (item.type) {
      case "abc-list":
        navigate(`/list/${encodeURIComponent(item.metadata.name)}`);
        break;
      case "kawa":
        navigate(`/kawa/${encodeURIComponent(item.metadata.name)}`);
        break;
      case "kaga":
        navigate(`/kaga/${encodeURIComponent(item.metadata.name)}`);
        break;
      case "word":
        if (item.parentId) {
          const listName = item.parentId.replace("abc-list-", "");
          navigate(`/list/${encodeURIComponent(listName)}`);
        }
        break;
    }
  };

  const handleAddTag = (itemId: string) => {
    const tag = newTags[itemId]?.trim();
    if (tag) {
      onAddTag(itemId, tag);
      setNewTags((prev) => ({...prev, [itemId]: ""}));
    }
  };

  const handleToggleFavorite = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(itemId);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "abc-list":
        return <List className="h-4 w-4" />;
      case "kawa":
        return <PenTool className="h-4 w-4" />;
      case "kaga":
        return <Image className="h-4 w-4" />;
      case "word":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <List className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "abc-list":
        return "ABC-Liste";
      case "kawa":
        return "KaWa";
      case "kaga":
        return "KaGa";
      case "word":
        return "Wort";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "abc-list":
        return "bg-blue-100 text-blue-800";
      case "kawa":
        return "bg-green-100 text-green-800";
      case "kaga":
        return "bg-purple-100 text-purple-800";
      case "word":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <List className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">{emptyMessage}</h3>
        <p className="text-sm">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => {
        const {item} = result;
        const isExpanded = expandedItems.has(item.id);
        const isWord = item.type === "word";

        return (
          <div
            key={item.id}
            className="bg-white rounded-lg border hover:shadow-md transition-shadow duration-200"
          >
            {/* Main content */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => handleNavigateToItem(result)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNavigateToItem(result);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Navigiere zu ${item.title}`}
            >
              <div className="flex items-start gap-3">
                {/* Type icon */}
                <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                  {getTypeIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title and metadata */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.title}
                        {isWord && item.letterContext && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({item.letterContext})
                          </span>
                        )}
                      </h3>
                      {item.parentId && (
                        <p className="text-sm text-gray-500 truncate">
                          in{" "}
                          {item.parentId.replace(/^(abc-list|kawa|kaga)-/, "")}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleToggleFavorite(item.id, e)}
                        className={`p-1 rounded ${
                          item.metadata.isFavorite
                            ? "text-red-500 hover:text-red-600"
                            : "text-gray-400 hover:text-red-500"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${item.metadata.isFavorite ? "fill-current" : ""}`}
                        />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(item.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Type and score badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className={getTypeColor(item.type)}
                    >
                      {getTypeLabel(item.type)}
                    </Badge>

                    {result.score > 0.8 && (
                      <Badge variant="outline" className="text-green-600">
                        <Star className="h-3 w-3 mr-1" />
                        Hohe Relevanz
                      </Badge>
                    )}

                    {item.metadata.rating && (
                      <Badge variant="outline">
                        {"★".repeat(item.metadata.rating)}
                      </Badge>
                    )}
                  </div>

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Highlights */}
                  {result.highlights.length > 0 && (
                    <div className="space-y-1">
                      {result.highlights.slice(0, 2).map((highlight, index) => (
                        <p
                          key={index}
                          className="text-sm text-gray-600"
                          dangerouslySetInnerHTML={{__html: highlight}}
                        />
                      ))}
                    </div>
                  )}

                  {/* Created/Modified date */}
                  {(item.metadata.created || item.metadata.lastModified) && (
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {item.metadata.created && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Erstellt:{" "}
                          {new Date(item.metadata.created).toLocaleDateString(
                            "de-DE",
                          )}
                        </div>
                      )}
                      {item.metadata.lastModified &&
                        item.metadata.lastModified !==
                          item.metadata.created && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Geändert:{" "}
                            {new Date(
                              item.metadata.lastModified,
                            ).toLocaleDateString("de-DE")}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t px-4 py-3 bg-gray-50">
                <div className="space-y-3">
                  {/* Additional highlights */}
                  {result.highlights.length > 2 && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-700">
                        Weitere Treffer:
                      </h4>
                      {result.highlights.slice(2).map((highlight, index) => (
                        <p
                          key={index + 2}
                          className="text-sm text-gray-600"
                          dangerouslySetInnerHTML={{__html: highlight}}
                        />
                      ))}
                    </div>
                  )}

                  {/* Tag management */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Tags verwalten:
                    </h4>

                    {/* Existing tags */}
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveTag(item.id, tag);
                            }}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>

                    {/* Add new tag */}
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Neuen Tag hinzufügen..."
                        value={newTags[item.id] || ""}
                        onChange={(e) =>
                          setNewTags((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddTag(item.id);
                          }
                        }}
                        className="flex-1 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddTag(item.id)}
                        disabled={!newTags[item.id]?.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick action buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigateToItem(result)}
                      className="flex items-center gap-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                      Öffnen
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
