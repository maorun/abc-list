import React, {useState} from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {AnalyticsData} from "./useAnalyticsData";

interface ListComparisonProps {
  data: AnalyticsData;
}

export function ListComparison({data}: ListComparisonProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [comparisonMode, setComparisonMode] = useState<"topic" | "all">("all");

  // Find lists with similar topics (simple keyword matching)
  const findSimilarLists = (topic: string) => {
    if (!topic) return [];

    const keywords = topic.toLowerCase().split(" ");
    return data.abcLists.filter((list) => {
      const listName = list.name.toLowerCase();
      return keywords.some((keyword) => listName.includes(keyword));
    });
  };

  const getComparisonData = () => {
    if (comparisonMode === "topic" && selectedTopic) {
      return findSimilarLists(selectedTopic);
    }
    return data.abcLists;
  };

  const comparisonLists = getComparisonData();

  const chartData = comparisonLists.map((list) => {
    const totalWords = Object.values(list.words).reduce(
      (sum, words) => sum + words.length,
      0,
    );
    const filledLetters = Object.values(list.words).filter(
      (words) => words.length > 0,
    ).length;
    const completionRate = (filledLetters / 26) * 100;

    return {
      name:
        list.name.length > 15 ? list.name.substring(0, 15) + "..." : list.name,
      fullName: list.name,
      words: totalWords,
      completion: completionRate,
      letters: filledLetters,
    };
  });

  // Group lists by topic similarity
  const getTopicGroups = () => {
    const groups: Record<string, typeof data.abcLists> = {};

    data.abcLists.forEach((list) => {
      // Simple topic extraction - first word or full name if short
      const topic = list.name.split(" ")[0] || list.name;
      const normalizedTopic = topic.toLowerCase();

      if (!groups[normalizedTopic]) {
        groups[normalizedTopic] = [];
      }
      groups[normalizedTopic].push(list);
    });

    // Only return groups with more than one list
    return Object.entries(groups).filter(([, lists]) => lists.length > 1);
  };

  const topicGroups = getTopicGroups();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Listen Vergleich</h2>

      {/* Comparison Mode Selection */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setComparisonMode("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            comparisonMode === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Alle Listen
        </button>
        <button
          onClick={() => setComparisonMode("topic")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            comparisonMode === "topic"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Nach Thema
        </button>
      </div>

      {/* Topic Selection */}
      {comparisonMode === "topic" && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Thema auswählen</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {topicGroups.map(([topic, lists]) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedTopic === topic
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {topic} ({lists.length})
              </button>
            ))}
          </div>
          {selectedTopic && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                Vergleiche {findSimilarLists(selectedTopic).length} Listen zum
                Thema &quot;{selectedTopic}&quot;
              </p>
            </div>
          )}
        </div>
      )}

      {comparisonLists.length > 0 ? (
        <>
          {/* Word Count Comparison */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Wortanzahl Vergleich</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "words")
                      return [`${value} Wörter`, "Wortanzahl"];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? item.fullName : label;
                  }}
                />
                <Bar dataKey="words" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Completion Rate Comparison */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Vollständigkeit Vergleich
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(1)}%`,
                    "Vollständigkeit",
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? item.fullName : label;
                  }}
                />
                <Bar dataKey="completion" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Comparison Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Detaillierter Vergleich
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Liste</th>
                    <th className="text-center p-2">Wörter</th>
                    <th className="text-center p-2">Buchstaben</th>
                    <th className="text-center p-2">Vollständigkeit</th>
                    <th className="text-center p-2">Ø Wörter/Buchstabe</th>
                    <th className="text-center p-2">Bewertung</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData
                    .sort((a, b) => b.words - a.words)
                    .map((list, index) => {
                      const avgWordsPerLetter =
                        list.letters > 0 ? list.words / list.letters : 0;
                      const getRating = () => {
                        if (list.completion >= 80 && list.words >= 20)
                          return {
                            text: "Ausgezeichnet",
                            color: "text-green-600",
                          };
                        if (list.completion >= 60 && list.words >= 15)
                          return {text: "Gut", color: "text-blue-600"};
                        if (list.completion >= 40 && list.words >= 10)
                          return {
                            text: "Befriedigend",
                            color: "text-yellow-600",
                          };
                        return {
                          text: "Verbesserungsbedarf",
                          color: "text-red-600",
                        };
                      };
                      const rating = getRating();

                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{list.fullName}</td>
                          <td className="text-center p-2">{list.words}</td>
                          <td className="text-center p-2">{list.letters}/26</td>
                          <td className="text-center p-2">
                            {list.completion.toFixed(1)}%
                          </td>
                          <td className="text-center p-2">
                            {avgWordsPerLetter.toFixed(1)}
                          </td>
                          <td
                            className={`text-center p-2 font-medium ${rating.color}`}
                          >
                            {rating.text}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-yellow-800">
              💡 Verbesserungsvorschläge
            </h3>
            <div className="space-y-2 text-yellow-700">
              {chartData.length > 1 && (
                <>
                  <p>
                    🏆 Beste Liste:{" "}
                    <strong>
                      {chartData.sort((a, b) => b.words - a.words)[0]?.fullName}
                    </strong>
                    mit {chartData.sort((a, b) => b.words - a.words)[0]?.words}{" "}
                    Wörtern
                  </p>
                  <p>
                    📈 Ausbaubedarf:{" "}
                    <strong>
                      {chartData.sort((a, b) => a.words - b.words)[0]?.fullName}
                    </strong>
                    - versuchen Sie mehr Wörter zu finden!
                  </p>
                  <p>
                    🎯 Tipp: Orientieren Sie sich an Ihrer besten Liste und
                    übertragen Sie erfolgreiche Strategien auf andere Themen.
                  </p>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg mb-4">Keine Listen zum Vergleichen verfügbar</p>
          {comparisonMode === "topic" ? (
            <p>
              Wählen Sie ein Thema aus oder erstellen Sie Listen zu ähnlichen
              Themen!
            </p>
          ) : (
            <p>
              Erstellen Sie mindestens zwei ABC-Listen, um sie zu vergleichen!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
