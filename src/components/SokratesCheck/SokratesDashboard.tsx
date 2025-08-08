import React from "react";
import {WordWithExplanation} from "../List/SavedWord";
import {Button} from "../ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface SokratesData {
  listName: string;
  letter: string;
  word: WordWithExplanation;
}

interface SokratesDashboardProps {
  allTerms: SokratesData[];
  reviewTerms: SokratesData[];
  onSwitchToReview: () => void;
}

export function SokratesDashboard({
  allTerms,
  reviewTerms,
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

  // Performance by list
  const listPerformance = allTerms
    .reduce((acc: any[], term) => {
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
    .map((list: any) => ({
      ...list,
      averageRating: list.ratedTerms > 0 ? list.totalRating / list.ratedTerms : 0,
      completionRate: (list.ratedTerms / list.totalTerms) * 100,
    }));

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Recommendations
  const getRecommendations = () => {
    const recommendations = [];

    if (unratedTerms > 0) {
      recommendations.push(
        `📝 Sie haben noch ${unratedTerms} unbewertete Begriffe. Bewerten Sie diese, um Ihren Fortschritt zu verfolgen.`,
      );
    }

    if (reviewTerms.length > 0) {
      recommendations.push(
        `🔄 ${reviewTerms.length} Begriffe benötigen eine Wiederholung. Nutzen Sie die Überprüfungsfunktion.`,
      );
    }

    const poorlyRatedTerms = allTerms.filter(
      (term) => term.word.rating && term.word.rating <= 2,
    ).length;
    if (poorlyRatedTerms > 0) {
      recommendations.push(
        `⚠️ ${poorlyRatedTerms} Begriffe haben niedrige Bewertungen (1-2 Sterne). Konzentrieren Sie sich auf diese.`,
      );
    }

    const wellKnownTerms = allTerms.filter(
      (term) => term.word.rating && term.word.rating >= 4,
    ).length;
    if (wellKnownTerms > 0) {
      recommendations.push(
        `✅ Sehr gut! Sie beherrschen bereits ${wellKnownTerms} Begriffe gut (4-5 Sterne).`,
      );
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800">Gesamt Begriffe</h3>
          <p className="text-3xl font-bold text-blue-600">{totalTerms}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800">Bewertet</h3>
          <p className="text-3xl font-bold text-green-600">{ratedTerms}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800">
            Zur Wiederholung
          </h3>
          <p className="text-3xl font-bold text-orange-600">{reviewTerms.length}</p>
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

        {/* List Performance */}
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
      </div>

      {/* Recommendations */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">
          🎯 Empfehlungen für weitere Lernaktivitäten
        </h3>
        {recommendations.length > 0 ? (
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-sm text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">
            🎉 Ausgezeichnet! Sie haben alle Begriffe bewertet und benötigen
            derzeit keine Wiederholung.
          </p>
        )}

        {reviewTerms.length > 0 && (
          <div className="mt-4">
            <Button onClick={onSwitchToReview} className="bg-blue-600 hover:bg-blue-700">
              Jetzt Begriffe überprüfen
            </Button>
          </div>
        )}
      </div>

      {/* Terms Need Review List */}
      {reviewTerms.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">
            📋 Begriffe zur Wiederholung ({reviewTerms.length})
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
                  <div className="flex items-center gap-2">
                    {term.word.rating ? (
                      <span className="text-sm text-orange-600">
                        {"★".repeat(term.word.rating)}
                        {"☆".repeat(5 - term.word.rating)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Nicht bewertet</span>
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