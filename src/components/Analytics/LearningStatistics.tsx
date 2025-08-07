import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {AnalyticsData} from "./useAnalyticsData";

interface LearningStatisticsProps {
  data: AnalyticsData;
}

export function LearningStatistics({data}: LearningStatisticsProps) {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const overviewStats = [
    {
      title: "Gesamte Listen",
      value: data.totalLists,
      icon: "📝",
      color: "bg-blue-100 text-blue-800",
    },
    {
      title: "Gesamte Wörter",
      value: data.totalWords,
      icon: "💭",
      color: "bg-green-100 text-green-800",
    },
    {
      title: "Durchschnitt/Liste",
      value: Math.round(data.averageWordsPerList),
      icon: "📊",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      title: "Lernstreak (Tage)",
      value: data.learningStreak,
      icon: "🔥",
      color: "bg-red-100 text-red-800",
    },
  ];

  const letterData = data.mostActiveLetters.slice(0, 8);

  const methodDistribution = [
    {name: "ABC-Listen", value: data.abcLists.length, color: COLORS[0]},
    {name: "KaWa", value: data.kawas.length, color: COLORS[1]},
    {name: "KaGa", value: data.kagas.length, color: COLORS[2]},
    {
      name: "Stadt-Land-Fluss",
      value: data.stadtLandFlussGames.length,
      color: COLORS[3],
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        Lernstatistiken Übersicht
      </h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active Letters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Aktivste Buchstaben</h3>
          {letterData.length > 0 ? (
            <BarChart width={400} height={300} data={letterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="letter" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Keine Daten verfügbar
            </div>
          )}
        </div>

        {/* Learning Method Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            Lernmethoden Verteilung
          </h3>
          {methodDistribution.length > 0 ? (
            <PieChart width={400} height={300}>
              <Pie
                data={methodDistribution}
                cx={200}
                cy={150}
                labelLine={false}
                label={({name, value}) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {methodDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Keine Lernaktivitäten vorhanden
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Aktuelle Aktivität</h3>
        <div className="text-gray-600">
          {data.lastActivityDate ? (
            <p>
              Letzte Aktivität:{" "}
              {data.lastActivityDate.toLocaleDateString("de-DE")} um{" "}
              {data.lastActivityDate.toLocaleTimeString("de-DE")}
            </p>
          ) : (
            <p>Noch keine Lernaktivitäten erfasst</p>
          )}
        </div>
      </div>

      {/* Ball-im-Tor-Effekt Feedback */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">
          🎯 Ball-im-Tor-Effekt Status
        </h3>
        <div className="space-y-2">
          {data.totalWords > 0 && (
            <p>
              ✅ Großartig! Sie haben bereits {data.totalWords} Wörter gelernt!
            </p>
          )}
          {data.learningStreak > 0 && (
            <p>🔥 Fantastisch! {data.learningStreak} Tage Lernstreak!</p>
          )}
          {data.totalLists > 5 && (
            <p>
              🏆 Beeindruckend! {data.totalLists} verschiedene Themenbereiche
              erforscht!
            </p>
          )}
          {data.totalWords === 0 && (
            <p>🌟 Beginnen Sie Ihre Lernreise mit Ihrer ersten ABC-Liste!</p>
          )}
        </div>
      </div>
    </div>
  );
}
