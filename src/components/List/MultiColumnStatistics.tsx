import React, {useState, useEffect, useCallback} from "react";
import {
  MultiColumnListData,
  ColumnStatistics,
  getMultiColumnStorageKey,
  WordWithExplanation,
} from "./types";
import {Button} from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface MultiColumnStatisticsProps {
  isOpen: boolean;
  onClose: () => void;
  listData: MultiColumnListData;
}

export function MultiColumnStatistics({
  isOpen,
  onClose,
  listData,
}: MultiColumnStatisticsProps) {
  const [statistics, setStatistics] = useState<ColumnStatistics[]>([]);

  useEffect(() => {
    if (isOpen) {
      calculateStatistics();
    }
  }, [isOpen, listData, calculateStatistics]);

  const calculateStatistics = useCallback(() => {
    const alphabet = Array.from({length: 26}, (_, i) =>
      String.fromCharCode(97 + i),
    );
    const stats: ColumnStatistics[] = [];

    listData.columns.forEach((column) => {
      let totalWords = 0;
      let lettersWithWords = 0;
      const totalTimeSpent = 0;
      let wordCount = 0;

      alphabet.forEach((letter) => {
        const storageKey = getMultiColumnStorageKey(
          listData.name,
          column.id,
          letter,
        );
        const storedData = localStorage.getItem(storageKey);

        if (storedData) {
          const words: WordWithExplanation[] = JSON.parse(storedData);
          if (words.length > 0) {
            totalWords += words.length;
            lettersWithWords++;

            // Calculate time statistics if timestamps are available
            words.forEach((word) => {
              if (word.timestamp) {
                wordCount++;
                // This is simplified - in a real implementation, you'd track time per word
              }
            });
          }
        }
      });

      const averageWordsPerLetter =
        lettersWithWords > 0 ? totalWords / lettersWithWords : 0;
      const completionPercentage = (lettersWithWords / 26) * 100;

      stats.push({
        columnId: column.id,
        totalWords,
        averageWordsPerLetter,
        completionPercentage,
        averageTimePerWord:
          wordCount > 0 ? totalTimeSpent / wordCount : undefined,
      });
    });

    setStatistics(stats);
  }, [listData]);

  const getColumnById = (columnId: string) => {
    return listData.columns.find((col) => col.id === columnId);
  };

  const getBestPerformingColumn = () => {
    if (statistics.length === 0) return null;
    return statistics.reduce((best, current) =>
      current.totalWords > best.totalWords ? current : best,
    );
  };

  const getMostCompleteColumn = () => {
    if (statistics.length === 0) return null;
    return statistics.reduce((best, current) =>
      current.completionPercentage > best.completionPercentage ? current : best,
    );
  };

  const bestColumn = getBestPerformingColumn();
  const mostCompleteColumn = getMostCompleteColumn();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📊 Vergleichsstatistiken</DialogTitle>
          <DialogDescription>
            Statistiken und Vergleiche zwischen den Spalten Ihrer ABC-Liste
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bestColumn && (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <h3 className="font-semibold text-green-800 mb-2">
                  🏆 Produktivste Spalte
                </h3>
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{
                      backgroundColor: getColumnById(bestColumn.columnId)
                        ?.color,
                    }}
                  />
                  <span className="font-medium">
                    {getColumnById(bestColumn.columnId)?.theme}
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  {bestColumn.totalWords} Wörter insgesamt
                </p>
              </div>
            )}

            {mostCompleteColumn && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="font-semibold text-blue-800 mb-2">
                  ✅ Vollständigste Spalte
                </h3>
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{
                      backgroundColor: getColumnById(
                        mostCompleteColumn.columnId,
                      )?.color,
                    }}
                  />
                  <span className="font-medium">
                    {getColumnById(mostCompleteColumn.columnId)?.theme}
                  </span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  {mostCompleteColumn.completionPercentage.toFixed(1)}% der
                  Buchstaben haben Wörter
                </p>
              </div>
            )}
          </div>

          {/* Detailed Statistics Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Spalte
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Wörter gesamt
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Ø Wörter/Buchstabe
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Vollständigkeit
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Typ
                  </th>
                </tr>
              </thead>
              <tbody>
                {statistics.map((stat, index) => {
                  const column = getColumnById(stat.columnId);
                  if (!column) return null;

                  return (
                    <tr
                      key={stat.columnId}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{backgroundColor: column.color}}
                          />
                          <span className="font-medium">{column.theme}</span>
                          {column.timeLimit && (
                            <span className="ml-2 text-xs text-gray-500">
                              ({column.timeLimit}min)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-mono">
                        {stat.totalWords}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-mono">
                        {stat.averageWordsPerLetter.toFixed(1)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${stat.completionPercentage}%`,
                                backgroundColor: column.color,
                              }}
                            />
                          </div>
                          <span className="text-sm font-mono">
                            {stat.completionPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {column.isSpecialty ? (
                          <span className="bg-yellow-100 px-2 py-1 rounded text-xs">
                            🎯 Spezialgebiet
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">
                            Allgemein
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Comparison Insights */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded">
            <h3 className="font-semibold text-gray-800 mb-3">
              📈 Erkenntnisse
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-medium mb-2">Leistungsvergleich:</h4>
                <ul className="space-y-1">
                  <li>
                    • Gesamtwörter:{" "}
                    {statistics.reduce((sum, stat) => sum + stat.totalWords, 0)}
                  </li>
                  <li>
                    • Durchschnittliche Vollständigkeit:{" "}
                    {statistics.length > 0
                      ? (
                          statistics.reduce(
                            (sum, stat) => sum + stat.completionPercentage,
                            0,
                          ) / statistics.length
                        ).toFixed(1)
                      : 0}
                    %
                  </li>
                  <li>
                    • Aktivste Spalte:{" "}
                    {bestColumn
                      ? getColumnById(bestColumn.columnId)?.theme
                      : "N/A"}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Empfehlungen:</h4>
                <ul className="space-y-1">
                  {statistics.some(
                    (stat) => stat.completionPercentage < 50,
                  ) && <li>• Fokussieren Sie sich auf schwächere Spalten</li>}
                  {statistics.some((stat) => stat.totalWords < 10) && (
                    <li>• Erweitern Sie Spalten mit wenigen Wörtern</li>
                  )}
                  <li>
                    • Nutzen Sie die Spezialgebiet-Prognose für tiefere
                    Einsichten
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Schließen</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
