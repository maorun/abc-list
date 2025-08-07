import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {AnalyticsData} from "./useAnalyticsData";

interface StrengthsWeaknessesAnalysisProps {
  data: AnalyticsData;
}

export function StrengthsWeaknessesAnalysis({
  data,
}: StrengthsWeaknessesAnalysisProps) {
  // Analyze letter performance across all lists
  const analyzeLetterPerformance = () => {
    const letterStats: Record<
      string,
      {total: number; lists: number; avgPerList: number}
    > = {};

    // Initialize all letters
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(97 + i).toUpperCase();
      letterStats[letter] = {total: 0, lists: 0, avgPerList: 0};
    }

    // Count words per letter
    data.abcLists.forEach((list) => {
      Object.entries(list.words).forEach(([letter, words]) => {
        const upperLetter = letter.toUpperCase();
        if (letterStats[upperLetter]) {
          letterStats[upperLetter].total += words.length;
          if (words.length > 0) {
            letterStats[upperLetter].lists += 1;
          }
        }
      });
    });

    // Calculate averages
    Object.keys(letterStats).forEach((letter) => {
      const stats = letterStats[letter];
      stats.avgPerList =
        data.abcLists.length > 0 ? stats.total / data.abcLists.length : 0;
    });

    return letterStats;
  };

  const letterPerformance = analyzeLetterPerformance();

  // Get strongest and weakest letters
  const sortedLetters = Object.entries(letterPerformance).sort(
    ([, a], [, b]) => b.avgPerList - a.avgPerList,
  );

  const strongestLetters = sortedLetters.slice(0, 5);
  const weakestLetters = sortedLetters.slice(-5).reverse();

  // Create radar chart data for learning methods
  const methodsAnalysis = [
    {
      method: "ABC-Listen",
      score: Math.min(data.abcLists.length * 20, 100),
      fullLabel: "ABC-Listen Nutzung",
    },
    {
      method: "KaWa",
      score: Math.min(data.kawas.length * 25, 100),
      fullLabel: "KaWa Assoziationen",
    },
    {
      method: "KaGa",
      score: Math.min(data.kagas.length * 25, 100),
      fullLabel: "KaGa Visualisierung",
    },
    {
      method: "Konsistenz",
      score: Math.min(data.learningStreak * 20, 100),
      fullLabel: "Lern-Konsistenz",
    },
    {
      method: "Vollständigkeit",
      score:
        data.abcLists.length > 0
          ? data.abcLists.reduce((sum, list) => {
              const filled = Object.values(list.words).filter(
                (words) => words.length > 0,
              ).length;
              return sum + (filled / 26) * 100;
            }, 0) / data.abcLists.length
          : 0,
      fullLabel: "Listen Vollständigkeit",
    },
    {
      method: "Effizienz",
      score: Math.min(data.averageWordsPerList * 5, 100),
      fullLabel: "Wörter pro Liste",
    },
  ];

  // Identify strengths and weaknesses
  const strengths = [];
  const weaknesses = [];

  methodsAnalysis.forEach((method) => {
    if (method.score >= 70) {
      strengths.push({...method, level: "stark"});
    } else if (method.score <= 30) {
      weaknesses.push({...method, level: "schwach"});
    }
  });

  // Letter difficulty analysis
  const letterDifficulty = Object.entries(letterPerformance)
    .map(([letter, stats]) => ({
      letter,
      difficulty:
        stats.avgPerList < 0.5
          ? "sehr schwer"
          : stats.avgPerList < 1
            ? "schwer"
            : stats.avgPerList < 2
              ? "mittel"
              : stats.avgPerList < 3
                ? "leicht"
                : "sehr leicht",
      score: stats.avgPerList,
      total: stats.total,
    }))
    .sort((a, b) => a.score - b.score);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        Stärken & Schwächen Analyse
      </h2>

      {/* Radar Chart for Learning Methods */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Lernmethoden Profil</h3>
        <div className="flex justify-center">
          <ResponsiveContainer width={500} height={400}>
            <RadarChart data={methodsAnalysis}>
              <PolarGrid />
              <PolarAngleAxis dataKey="method" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar
                name="Leistung"
                dataKey="score"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)}%`,
                  name,
                ]}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return item ? item.fullLabel : label;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strengths and Weaknesses Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-green-50 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-green-800 flex items-center">
            💪 Ihre Stärken
          </h3>
          {strengths.length > 0 ? (
            <div className="space-y-3">
              {strengths.map((strength, index) => (
                <div key={index} className="bg-white rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-800">
                      {strength.fullLabel}
                    </span>
                    <span className="text-green-600 font-bold">
                      {strength.score.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{width: `${strength.score}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-700">
              Noch keine ausgeprägten Stärken identifiziert. Arbeiten Sie
              kontinuierlich an Ihren Listen!
            </p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="bg-red-50 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-800 flex items-center">
            🎯 Verbesserungsbereiche
          </h3>
          {weaknesses.length > 0 ? (
            <div className="space-y-3">
              {weaknesses.map((weakness, index) => (
                <div key={index} className="bg-white rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-red-800">
                      {weakness.fullLabel}
                    </span>
                    <span className="text-red-600 font-bold">
                      {weakness.score.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{width: `${weakness.score}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-700">
              Großartig! Keine gravierenden Schwächen entdeckt.
            </p>
          )}
        </div>
      </div>

      {/* Letter Performance Analysis */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          Buchstaben Leistungsanalyse
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strongest Letters */}
          <div>
            <h4 className="font-medium mb-3 text-green-800">
              🏆 Stärkste Buchstaben
            </h4>
            <div className="space-y-2">
              {strongestLetters.map(([letter, stats], index) => (
                <div
                  key={letter}
                  className="flex items-center justify-between bg-green-50 p-2 rounded"
                >
                  <span className="font-bold text-green-800">{letter}</span>
                  <div className="text-right">
                    <div className="text-sm text-green-600">
                      {stats.avgPerList.toFixed(1)} Ø pro Liste
                    </div>
                    <div className="text-xs text-green-500">
                      {stats.total} Wörter gesamt
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weakest Letters */}
          <div>
            <h4 className="font-medium mb-3 text-red-800">
              🎯 Schwierigste Buchstaben
            </h4>
            <div className="space-y-2">
              {weakestLetters.map(([letter, stats], index) => (
                <div
                  key={letter}
                  className="flex items-center justify-between bg-red-50 p-2 rounded"
                >
                  <span className="font-bold text-red-800">{letter}</span>
                  <div className="text-right">
                    <div className="text-sm text-red-600">
                      {stats.avgPerList.toFixed(1)} Ø pro Liste
                    </div>
                    <div className="text-xs text-red-500">
                      {stats.total} Wörter gesamt
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Letter Difficulty Distribution */}
      {data.abcLists.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            Buchstaben Schwierigkeitsverteilung
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={letterDifficulty}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="letter" />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `${Number(value).toFixed(2)} Ø Wörter`,
                  "Durchschnitt",
                ]}
                labelFormatter={(letter, payload) => {
                  const item = payload?.[0]?.payload;
                  return item
                    ? `Buchstabe ${letter} (${item.difficulty})`
                    : letter;
                }}
              />
              <Bar
                dataKey="score"
                fill={(entry) => {
                  const score = entry?.score || 0;
                  if (score < 0.5) return "#ef4444"; // red
                  if (score < 1) return "#f97316"; // orange
                  if (score < 2) return "#eab308"; // yellow
                  if (score < 3) return "#22c55e"; // green
                  return "#059669"; // dark green
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Personalized Recommendations */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-800">
          🎯 Personalisierte Empfehlungen
        </h3>
        <div className="space-y-3 text-blue-700">
          {data.abcLists.length === 0 && (
            <p>
              🌟 Starten Sie mit Ihrer ersten ABC-Liste zu einem Thema, das Sie
              interessiert!
            </p>
          )}

          {data.abcLists.length > 0 && data.kawas.length === 0 && (
            <p>
              💡 Versuchen Sie KaWa-Assoziationen für tieferes Lernen und
              bessere Vernetzung!
            </p>
          )}

          {weakestLetters.length > 0 && (
            <p>
              📚 Fokussieren Sie sich auf die Buchstaben{" "}
              {weakestLetters
                .slice(0, 3)
                .map(([letter]) => letter)
                .join(", ")}
              - hier haben Sie das größte Verbesserungspotential!
            </p>
          )}

          {data.averageWordsPerList < 10 && data.abcLists.length > 0 && (
            <p>
              ⚡ Versuchen Sie, mehr Wörter pro Buchstabe zu finden. Ziel: 15+
              Wörter pro Liste!
            </p>
          )}

          {data.learningStreak === 0 && (
            <p>
              🔥 Bauen Sie eine Lernroutine auf - schon 10 Minuten täglich
              machen einen großen Unterschied!
            </p>
          )}

          {strengths.length > 0 && (
            <p>
              🏆 Nutzen Sie Ihre Stärke in {strengths[0].method} als Fundament
              für weitere Lernbereiche!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
