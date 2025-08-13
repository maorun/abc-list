import React, {useState} from "react";
import {
  Tag,
  Plus,
  TrendingUp,
  Lightbulb,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Label} from "@/components/ui/label";
import {TagSuggestion} from "@/lib/taggingService";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TagManagerProps {
  allTags: string[];
  popularTags: Array<{tag: string; count: number}>;
  _onAddTag: (itemId: string, tag: string) => void;
  _onRemoveTag: (itemId: string, tag: string) => void;
  generateSuggestions: (
    title: string,
    content?: string,
    existingTags?: string[],
  ) => TagSuggestion[];
}

export function TagManager({
  allTags,
  popularTags,
  _onAddTag,
  _onRemoveTag,
  generateSuggestions,
}: TagManagerProps) {
  const [_newTag, setNewTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [testTitle, setTestTitle] = useState("");
  const [testContent, setTestContent] = useState("");
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);

  // Filter tags based on search
  const filteredTags = allTags.filter((tag) =>
    tag.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Generate categories from tags
  const categorizeTag = (tag: string): string => {
    const lowerTag = tag.toLowerCase();

    if (
      ["mathematik", "physik", "chemie", "biologie"].some((subject) =>
        lowerTag.includes(subject),
      )
    ) {
      return "Naturwissenschaften";
    }
    if (
      ["geschichte", "geografie", "politik", "gesellschaft"].some((subject) =>
        lowerTag.includes(subject),
      )
    ) {
      return "Gesellschaftswissenschaften";
    }
    if (
      ["deutsch", "englisch", "französisch", "spanisch", "sprache"].some(
        (subject) => lowerTag.includes(subject),
      )
    ) {
      return "Sprachen";
    }
    if (
      ["kunst", "musik", "theater", "literatur"].some((subject) =>
        lowerTag.includes(subject),
      )
    ) {
      return "Kultur";
    }
    if (
      ["sport", "fitness", "gesundheit", "ernährung"].some((subject) =>
        lowerTag.includes(subject),
      )
    ) {
      return "Gesundheit & Sport";
    }
    if (
      ["computer", "programmierung", "internet", "digital", "technik"].some(
        (subject) => lowerTag.includes(subject),
      )
    ) {
      return "Technologie";
    }

    return "Allgemein";
  };

  const categorizedTags = allTags.reduce(
    (acc, tag) => {
      const category = categorizeTag(tag);
      if (!acc[category]) acc[category] = [];
      acc[category].push(tag);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const toggleTagSelection = (tag: string) => {
    const newSelection = new Set(selectedTags);
    if (newSelection.has(tag)) {
      newSelection.delete(tag);
    } else {
      newSelection.add(tag);
    }
    setSelectedTags(newSelection);
  };

  const handleBulkDelete = () => {
    if (selectedTags.size === 0) return;
    setShowDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    // In a real implementation, you would call a bulk delete function
    // For now, we'll simulate removing the tags from multiple items
    selectedTags.forEach((tag) => {
      // This would need to be implemented in the search service
      console.log(`Would delete tag: ${tag}`);
    });
    setSelectedTags(new Set());
    setShowDeleteConfirm(false);
  };

  const generateTestSuggestions = () => {
    if (!testTitle.trim()) return;

    const newSuggestions = generateSuggestions(testTitle, testContent);
    setSuggestions(newSuggestions);
  };

  const getTagUsageColor = (count: number): string => {
    if (count >= 10) return "bg-green-100 text-green-800 border-green-300";
    if (count >= 5) return "bg-blue-100 text-blue-800 border-blue-300";
    if (count >= 2) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="categories">Kategorien</TabsTrigger>
          <TabsTrigger value="popular">Beliebt</TabsTrigger>
          <TabsTrigger value="suggestions">Vorschläge</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Search and bulk actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Tags durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {selectedTags.size > 0 && (
                <>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    {selectedTags.size} ausgewählt
                  </Badge>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Löschen
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags(new Set())}
              >
                Auswahl aufheben
              </Button>
            </div>
          </div>

          {/* Tags list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Alle Tags ({filteredTags.length})
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newSelection = new Set(filteredTags);
                  setSelectedTags(newSelection);
                }}
              >
                Alle auswählen
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
              {filteredTags.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Keine Tags gefunden</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredTags.map((tag) => {
                    const usage =
                      popularTags.find((p) => p.tag === tag)?.count || 0;
                    const isSelected = selectedTags.has(tag);

                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTagSelection(tag)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          isSelected
                            ? "bg-blue-100 border-blue-300 text-blue-800"
                            : getTagUsageColor(usage)
                        }`}
                      >
                        <Tag className="h-3 w-3" />
                        <span className="text-sm font-medium">{tag}</span>
                        {usage > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {usage}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="space-y-4">
            {Object.entries(categorizedTags)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([category, tags]) => (
                <div key={category} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    {category}
                    <Badge variant="secondary">{tags.length}</Badge>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const usage =
                        popularTags.find((p) => p.tag === tag)?.count || 0;
                      return (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={`${getTagUsageColor(usage)} cursor-pointer`}
                          onClick={() => toggleTagSelection(tag)}
                        >
                          {tag}
                          {usage > 0 && <span className="ml-1">({usage})</span>}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Beliebteste Tags
            </Label>

            {popularTags.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Noch keine Tag-Statistiken verfügbar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {popularTags.map(({tag, count}, index) => (
                  <div
                    key={tag}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{tag}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{count} Verwendungen</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTagSelection(tag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="space-y-4">
            {/* Test suggestion generator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Tag-Vorschläge testen
              </h3>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="test-title" className="text-sm">
                    Titel:
                  </Label>
                  <Input
                    id="test-title"
                    type="text"
                    placeholder="z.B. Mathematik Grundlagen"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="test-content" className="text-sm">
                    Inhalt (optional):
                  </Label>
                  <Input
                    id="test-content"
                    type="text"
                    placeholder="z.B. Grundrechenarten, Algebra, Geometrie"
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                  />
                </div>

                <Button
                  onClick={generateTestSuggestions}
                  disabled={!testTitle.trim()}
                  className="w-full"
                >
                  Vorschläge generieren
                </Button>
              </div>
            </div>

            {/* Generated suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Generierte Vorschläge:
                </Label>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={
                            suggestion.confidence >= 0.8
                              ? "border-green-300 text-green-800"
                              : suggestion.confidence >= 0.6
                                ? "border-yellow-300 text-yellow-800"
                                : "border-gray-300 text-gray-800"
                          }
                        >
                          {Math.round(suggestion.confidence * 100)}%
                        </Badge>
                        <span className="font-medium">{suggestion.tag}</span>
                        <span className="text-sm text-gray-600">
                          {suggestion.reason}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewTag(suggestion.tag);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Best practices */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">
                💡 Tag-Best-Practices
              </h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>
                  • Verwende konsistente Kategorien (z.B. &quot;Mathematik&quot;
                  statt &quot;Mathe&quot;)
                </p>
                <p>
                  • Nutze Themenbereiche wie &quot;Lernen&quot;,
                  &quot;Prüfung&quot;, &quot;Grundlagen&quot;
                </p>
                <p>
                  • Schwierigkeitsgrade: &quot;Anfänger&quot;,
                  &quot;Fortgeschritten&quot;, &quot;Expert&quot;
                </p>
                <p>
                  • Vermeide zu spezifische Tags, die nur einmal verwendet
                  werden
                </p>
                <p>
                  • Kombiniere allgemeine und spezifische Tags für beste
                  Auffindbarkeit
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Tags löschen bestätigen
            </DialogTitle>
            <DialogDescription>
              Möchtest du die folgenden {selectedTags.size} Tags wirklich
              löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-32 overflow-y-auto border rounded p-2">
            <div className="flex flex-wrap gap-1">
              {Array.from(selectedTags).map((tag) => (
                <Badge key={tag} variant="destructive">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmBulkDelete}>
              Löschen bestätigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
