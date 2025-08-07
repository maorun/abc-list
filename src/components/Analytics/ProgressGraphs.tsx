import React, {useState} from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import {AnalyticsData} from "./useAnalyticsData";

interface ProgressGraphsProps {
  data: AnalyticsData;
}

export function ProgressGraphs({data}: ProgressGraphsProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month",
  );

  // Generate mock progress data since we don't have timestamps
  // In a real implementation, you would track creation/modification dates
  const generateProgressData = () => {
    const now = new Date();
    const points = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;
    const progressData = [];

    for (let i = points - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Simulate progress based on existing data
      const totalLists = Math.floor((data.totalLists * (points - i)) / points);
      const totalWords = Math.floor((data.totalWords * (points - i)) / points);

      progressData.push({
        date: date.toISOString().split("T")[0],
        dateLabel:
          timeRange === "week"
            ? date.toLocaleDateString("de-DE", {weekday: "short"})
            : timeRange === "month"
              ? date.toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                })
              : date.toLocaleDateString("de-DE", {
                  month: "short",
                  year: "2-digit",
                }),
        lists: totalLists,
        words: totalWords,
        efficiency: totalLists > 0 ? totalWords / totalLists : 0,
      });
    }

    return progressData;
  };

  const progressData = generateProgressData();

  const learningGoals = [
    {
      title: "Wöchliches Ziel",
      current: data.totalWords,
      target: Math.max(50, Math.ceil(data.totalWords * 1.1)),
      unit: "Wörter",
      color: "bg-blue-500",
    },
    {
      title: "Listen pro Monat",
      current: data.totalLists,
      target: Math.max(5, Math.ceil(data.totalLists * 1.2)),
      unit: "Listen",
      color: "bg-green-500",
    },
    {
      title: "Effizienz",
      current: data.averageWordsPerList,
      target: Math.max(15, Math.ceil(data.averageWordsPerList * 1.15)),
      unit: "Wörter/Liste",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        Fortschrittsgraphen
      </h2>

      {/* Time Range Selector */}
      <div className="flex justify-center space-x-2 mb-6">
        {[
          {key: "week", label: "Woche"},
          {key: "month", label: "Monat"},
          {key: "year", label: "Jahr"},
        ].map((range) => (
          <button
            key={range.key}
            onClick={() => setTimeRange(range.key as "week" | "month" | "year")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === range.key
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Words Progress */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Wörter Fortschritt</h3>
          <AreaChart width={400} height={250} data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dateLabel" />
            <YAxis />
            <Tooltip
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return `Datum: ${payload[0].payload?.date}`;
                }
                return label;
              }}
            />
            <Area
              type="monotone"
              dataKey="words"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
            />
          </AreaChart>
        </div>

        {/* Lists Progress */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Listen Fortschritt</h3>
          <LineChart width={400} height={250} data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dateLabel" />
            <YAxis />
            <Tooltip
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return `Datum: ${payload[0].payload?.date}`;
                }
                return label;
              }}
            />
            <Line
              type="monotone"
              dataKey="lists"
              stroke="#82ca9d"
              strokeWidth={3}
              dot={{r: 4}}
            />
          </LineChart>
        </div>
      </div>

      {/* Learning Efficiency */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Lerneffizienz über Zeit</h3>
        <LineChart width={800} height={250} data={progressData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dateLabel" />
          <YAxis />
          <Tooltip
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return `Datum: ${payload[0].payload?.date}`;
              }
              return label;
            }}
            formatter={(value: number) => [
              `${Number(value).toFixed(1)} Wörter/Liste`,
              "Effizienz",
            ]}
          />
          <Line
            type="monotone"
            dataKey="efficiency"
            stroke="#ff7300"
            strokeWidth={3}
            dot={{r: 4}}
          />
        </LineChart>
      </div>

      {/* Learning Goals */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Lernziele</h3>
        <div className="space-y-4">
          {learningGoals.map((goal, index) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            const isCompleted = goal.current >= goal.target;

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{goal.title}</span>
                  <span className="text-sm text-gray-600">
                    {goal.current.toFixed(goal.unit === "Wörter/Liste" ? 1 : 0)}{" "}
                    / {goal.target} {goal.unit}
                    {isCompleted && (
                      <span className="ml-2 text-green-600">✅</span>
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isCompleted ? "bg-green-500" : goal.color
                    }`}
                    style={{width: `${progress}%`}}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {progress.toFixed(1)}% erreicht
                  {isCompleted && (
                    <span className="ml-2 text-green-600 font-medium">
                      Ziel erreicht! 🎉
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Insights */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">📈 Fortschritts-Insights</h3>
        <div className="space-y-2">
          {data.totalWords > 0 && (
            <p>
              🎯 Sie haben in den letzten{" "}
              {timeRange === "week"
                ? "7 Tagen"
                : timeRange === "month"
                  ? "30 Tagen"
                  : "365 Tagen"}{" "}
              großartige Fortschritte gemacht!
            </p>
          )}
          {data.averageWordsPerList > 10 && (
            <p>
              ⚡ Ihre Lerneffizienz ist mit{" "}
              {data.averageWordsPerList.toFixed(1)} Wörtern pro Liste excellent!
            </p>
          )}
          {data.learningStreak > 0 && (
            <p>
              🔥 Halten Sie Ihren Lernstreak aufrecht - Konsistenz ist der
              Schlüssel zum Erfolg!
            </p>
          )}
          {data.totalWords === 0 && (
            <p>
              🌟 Starten Sie heute Ihre Lernreise! Jedes große Ziel beginnt mit
              dem ersten Schritt.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
