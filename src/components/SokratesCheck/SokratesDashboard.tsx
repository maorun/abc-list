import React, {useState} from "react";
import {WordWithExplanation} from "../List/SavedWord";
import {Button} from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import type {getSpacedRepetitionStats} from "../../lib/spacedRepetition";
import {isTermDueForReview} from "../../lib/spacedRepetition";

interface SokratesData {
  listName: string;
  letter: string;
  word: WordWithExplanation;
}

interface ListAccumulator {
  listName: string;
  totalTerms: number;
  ratedTerms: number;
  totalRating: number;
}

interface ListPerformance extends ListAccumulator {
  averageRating: number;
  completionRate: number;
}

interface SokratesDashboardProps {
  allTerms: SokratesData[];
  reviewTerms: SokratesData[];
  spacedRepetitionStats: ReturnType<typeof getSpacedRepetitionStats>;
  onSwitchToReview: () => void;
}

// Bulk Review Button Component
interface BulkReviewButtonProps {
  allTerms: SokratesData[];
  onSwitchToReview: () => void;
}

function BulkReviewButton({allTerms, onSwitchToReview}: BulkReviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());

  // Get unique list names and their review stats
  const listStats = allTerms.reduce((acc, term) => {
    if (!acc[term.listName]) {
      acc[term.listName] = {
        name: term.listName,
        totalTerms: 0,
        dueTerms: 0,
      };
    }
    acc[term.listName].totalTerms++;
    if (isTermDueForReview(term.word.lastReviewed, term.word.interval, term.word.nextReviewDate)) {
      acc[term.listName].dueTerms++;
    }
    return acc;
  }, {} as Record<string, {name: string; totalTerms: number; dueTerms: number}>);

  const availableLists = Object.values(listStats).filter(list => list.dueTerms > 0);

  const handleListToggle = (listName: string) => {
    const newSelection = new Set(selectedLists);
    if (newSelection.has(listName)) {
      newSelection.delete(listName);
    } else {
      newSelection.add(listName);
    }
    setSelectedLists(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedLists.size === availableLists.length) {
      setSelectedLists(new Set());
    } else {
      setSelectedLists(new Set(availableLists.map(list => list.name)));
    }
  };

  const handleStartBulkReview = () => {
    if (selectedLists.size > 0) {
      // Store selected lists for bulk review
      localStorage.setItem('bulkReviewLists', JSON.stringify(Array.from(selectedLists)));
      setIsOpen(false);
      onSwitchToReview();
    }
  };

  const totalSelectedDue = availableLists
    .filter(list => selectedLists.has(list.name))
    .reduce((sum, list) => sum + list.dueTerms, 0);

  if (availableLists.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          📚 Bulk-Wiederholung
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk-Wiederholung mehrerer Listen</DialogTitle>
          <DialogDescription>
            Wählen Sie die ABC-Listen aus, die Sie gemeinsam wiederholen möchten
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Listen mit fälligen Begriffen:
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectAll}
            >
              {selectedLists.size === availableLists.length ? 'Alle abwählen' : 'Alle auswählen'}
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableLists.map((list) => (
              <div
                key={list.name}
                className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`bulk-${list.name}`}
                    checked={selectedLists.has(list.name)}
                    onChange={() => handleListToggle(list.name)}
                    className="w-4 h-4"
                  />
                  <label
                    htmlFor={`bulk-${list.name}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {list.name}
                  </label>
                </div>
                <div className="text-xs text-gray-600">
                  {list.dueTerms} fällig von {list.totalTerms}
                </div>
              </div>
            ))}
          </div>

          {selectedLists.size > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-700">
                <strong>{totalSelectedDue} Begriffe</strong> aus{' '}
                <strong>{selectedLists.size} Listen</strong> zur Wiederholung ausgewählt
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleStartBulkReview}
            disabled={selectedLists.size === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Bulk-Wiederholung starten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SokratesDashboard({
  allTerms,
  reviewTerms,
  spacedRepetitionStats,
  onSwitchToReview,
}: SokratesDashboardProps) {
  // Calculate statistics
  const totalTerms = allTerms.length;
  const ratedTerms = allTerms.filter((term) => term.word.rating).length;
  const unratedTerms = totalTerms - ratedTerms;

  // Rating distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating: `${rating} Stern${rating > 1 ? "e" : ""}`,
    count: allTerms.filter((term) => term.word.rating === rating).length,
  }));

  // Interval distribution for spaced repetition visualization
  const intervalDistribution = [
    {range: "1 Tag", count: allTerms.filter(t => t.word.interval === 1).length},
    {range: "2-3 Tage", count: allTerms.filter(t => t.word.interval && t.word.interval >= 2 && t.word.interval <= 3).length},
    {range: "4-7 Tage", count: allTerms.filter(t => t.word.interval && t.word.interval >= 4 && t.word.interval <= 7).length},
    {range: "1-2 Wochen", count: allTerms.filter(t => t.word.interval && t.word.interval >= 8 && t.word.interval <= 14).length},
    {range: "3-4 Wochen", count: allTerms.filter(t => t.word.interval && t.word.interval >= 15 && t.word.interval <= 28).length},
    {range: ">1 Monat", count: allTerms.filter(t => t.word.interval && t.word.interval > 28).length},
  ];

  // Performance by list
  const listPerformance: ListPerformance[] = allTerms
    .reduce((acc: ListAccumulator[], term) => {
      const existingList = acc.find((item) => item.listName === term.listName);
      if (existingList) {
        existingList.totalTerms++;
        if (term.word.rating) {
          existingList.ratedTerms++;
          existingList.totalRating += term.word.rating;
        }
      } else {
        acc.push({
          listName: term.listName,
          totalTerms: 1,
          ratedTerms: term.word.rating ? 1 : 0,
          totalRating: term.word.rating || 0,
        });
      }
      return acc;
    }, [])
    .map(
      (list: ListAccumulator): ListPerformance => ({
        ...list,
        averageRating:
          list.ratedTerms > 0 ? list.totalRating / list.ratedTerms : 0,
        completionRate: (list.ratedTerms / list.totalTerms) * 100,
      }),
    );

  // Recommendations
  const getRecommendations = () => {
    const recommendations = [];

    if (unratedTerms > 0) {
      recommendations.push(
        `📝 Sie haben noch ${unratedTerms} unbewertete Begriffe. Bewerten Sie diese, um den Spaced Repetition Algorithmus zu aktivieren.`,
      );
    }

    const poorlyRatedTerms = allTerms.filter(
      (term) => term.word.rating && term.word.rating <= 2,
    ).length;
    if (poorlyRatedTerms > 0) {
      recommendations.push(
        `⚠️ ${poorlyRatedTerms} Begriffe haben niedrige Bewertungen (1-2 Sterne). Diese werden häufiger wiederholt für bessere Retention.`,
      );
    }

    if (spacedRepetitionStats.masteredTerms > 0) {
      recommendations.push(
        `🏆 Ausgezeichnet! Sie haben ${spacedRepetitionStats.masteredTerms} Begriffe gemeistert (Note 5, Intervall ≥ 30 Tage).`,
      );
    }

    if (spacedRepetitionStats.retentionRate > 80) {
      recommendations.push(
        `🎯 Ihre Retentionsrate von ${spacedRepetitionStats.retentionRate}% ist ausgezeichnet! Der Algorithmus optimiert automatisch Ihre Wiederholungen.`,
      );
    }

    return recommendations;
  };

  const recommendations = getRecommendations();
  const hasReviewTerms = reviewTerms.length > 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800">
            Gesamt Begriffe
          </h3>
          <p className="text-3xl font-bold text-blue-600">{totalTerms}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800">Zur Wiederholung</h3>
          <p className="text-3xl font-bold text-orange-600">
            {spacedRepetitionStats.dueTerms}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800">Retentionsrate</h3>
          <p className="text-3xl font-bold text-green-600">{spacedRepetitionStats.retentionRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800">Gemeistert</h3>
          <p className="text-3xl font-bold text-purple-600">{spacedRepetitionStats.masteredTerms}</p>
        </div>
      </div>

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-2">Spaced Repetition Statistiken</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Durchschnittliches Intervall:</span>
              <span className="font-medium">{spacedRepetitionStats.averageInterval} Tage</span>
            </div>
            <div className="flex justify-between">
              <span>Bewertete Begriffe:</span>
              <span className="font-medium">{spacedRepetitionStats.reviewedTerms}/{spacedRepetitionStats.totalTerms}</span>
            </div>
            <div className="flex justify-between">
              <span>Retentionsrate:</span>
              <span className="font-medium">{spacedRepetitionStats.retentionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Gemeisterte Begriffe:</span>
              <span className="font-medium">{spacedRepetitionStats.masteredTerms}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-2">Algorithmus-Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${spacedRepetitionStats.dueTerms > 0 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
              <span>{spacedRepetitionStats.dueTerms > 0 ? 'Wiederholungen fällig' : 'Alle Begriffe optimal terminiert'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${spacedRepetitionStats.retentionRate >= 80 ? 'bg-green-500' : spacedRepetitionStats.retentionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span>
                {spacedRepetitionStats.retentionRate >= 80 ? 'Ausgezeichnete Retention' : 
                 spacedRepetitionStats.retentionRate >= 60 ? 'Gute Retention' : 'Verbesserung nötig'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${spacedRepetitionStats.reviewedTerms/spacedRepetitionStats.totalTerms >= 0.8 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span>
                {spacedRepetitionStats.reviewedTerms/spacedRepetitionStats.totalTerms >= 0.8 ? 'Vollständig bewertet' : 'Bewertung unvollständig'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Bewertungsverteilung</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Interval Distribution */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Wiederholungsintervalle</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={intervalDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* List Performance */}
      {listPerformance.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Listen-Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={listPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="listName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="averageRating" fill="#82ca9d" name="Ø Bewertung" />
              <Bar dataKey="completionRate" fill="#8884d8" name="% Bewertet" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">
          🧠 KI-basierte Lernempfehlungen
        </h3>
        {recommendations.length > 0 || hasReviewTerms ? (
          <div>
            {recommendations.length > 0 && (
              <ul className="space-y-2">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-sm text-gray-700">
                      {recommendation}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {hasReviewTerms && (
              <div className={recommendations.length > 0 ? "mt-4" : ""}>
                <p className="text-sm text-gray-700 mb-2">
                  🔄 {reviewTerms.length} Begriffe sind optimal für eine Wiederholung terminiert.
                  Der Algorithmus hat diese basierend auf der Ebbinghaus-Vergessenskurve ausgewählt.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600">
            🎉 Perfekt! Alle Begriffe sind optimal terminiert. Der Spaced Repetition
            Algorithmus arbeitet effizient für maximale Lernretention.
          </p>
        )}

        {hasReviewTerms && (
          <div className="mt-4 flex gap-2">
            <Button
              onClick={onSwitchToReview}
              className="bg-blue-600 hover:bg-blue-700"
            >
              🧠 Wissenschaftlich optimierte Wiederholung starten
            </Button>
            <BulkReviewButton allTerms={allTerms} onSwitchToReview={onSwitchToReview} />
          </div>
        )}
      </div>

      {/* Terms Need Review List */}
      {hasReviewTerms && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">
            📋 Fällige Begriffe ({reviewTerms.length})
          </h3>
          <div className="max-h-60 overflow-y-auto">
            <div className="space-y-2">
              {reviewTerms.slice(0, 20).map((term, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium">{term.word.text}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({term.listName} - {term.letter.toUpperCase()})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {term.word.rating ? (
                      <span className="text-orange-600">
                        {"★".repeat(term.word.rating)}
                        {"☆".repeat(5 - term.word.rating)}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        Nicht bewertet
                      </span>
                    )}
                    {term.word.interval && (
                      <span className="text-blue-600">
                        {term.word.interval}d
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {reviewTerms.length > 20 && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  ... und {reviewTerms.length - 20} weitere
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
