import React, {useState, useEffect, useCallback} from "react";
import {useParams} from "react-router-dom";
import {Button} from "../ui/button";
import {
  MultiColumnListData,
  ColumnConfig,
  getMultiColumnMetaKey,
} from "./types";
import {MultiColumnLetter} from "./MultiColumnLetter";
import {ColumnConfigDialog} from "./ColumnConfigDialog";
import {MultiColumnStatistics} from "./MultiColumnStatistics";
import {MultiColumnExport} from "./MultiColumnExport";
import {PredictionDialog} from "./PredictionDialog";

export function MultiColumnListItem() {
  const {item} = useParams<{item: string}>();
  const [listData, setListData] = useState<MultiColumnListData | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [activeColumn, setActiveColumn] = useState<number>(0);

  const saveListData = useCallback(
    (data: MultiColumnListData) => {
      if (!item) return;

      const metaKey = getMultiColumnMetaKey(item);
      const updatedData = {
        ...data,
        lastModified: new Date().toISOString(),
      };

      localStorage.setItem(metaKey, JSON.stringify(updatedData));
      setListData(updatedData);
    },
    [item],
  );

  const loadListData = useCallback(() => {
    if (!item) return;

    const metaKey = getMultiColumnMetaKey(item);
    const storedData = localStorage.getItem(metaKey);

    if (storedData) {
      setListData(JSON.parse(storedData));
    } else {
      // Create new multi-column list with default configuration
      const defaultColumns: ColumnConfig[] = [
        {
          id: "general1",
          theme: "Allgemeines Thema 1",
          color: "#3B82F6",
        },
        {
          id: "general2",
          theme: "Allgemeines Thema 2",
          color: "#10B981",
        },
      ];

      const newListData: MultiColumnListData = {
        name: item,
        columns: defaultColumns,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      setListData(newListData);
      saveListData(newListData);
    }
  }, [item, saveListData]);

  useEffect(() => {
    if (item) {
      document.title = `Mehrspaltige ABC-Liste für ${item}`;
      loadListData();
    }
  }, [item, loadListData]);

  const updateColumns = (columns: ColumnConfig[]) => {
    if (!listData) return;

    const updatedData = {
      ...listData,
      columns,
    };
    saveListData(updatedData);
  };

  const specialtyColumn = listData?.columns.find((col) => col.isSpecialty);

  const alphabet = Array.from({length: 26}, (_, i) =>
    String.fromCharCode(97 + i),
  );

  if (!listData) {
    return <div className="p-4">Laden...</div>;
  }

  return (
    <div className="p-4">
      {/* Mobile-first header layout: stacked on mobile, side-by-side on desktop */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <h1 className="text-3xl font-bold">Mehrspaltige ABC-Liste: {item}</h1>
        {/* Mobile-first responsive button layout */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setShowConfig(true)}
            className="text-sm w-full sm:w-auto"
          >
            ⚙️ Spalten konfigurieren
          </Button>
          {specialtyColumn && (
            <Button
              variant="outline"
              onClick={() => setShowPrediction(true)}
              className="bg-yellow-50 hover:bg-yellow-100 text-sm w-full sm:w-auto"
            >
              🎯 Prognose starten
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowStatistics(true)}
            className="text-sm w-full sm:w-auto"
          >
            📊 Statistiken
          </Button>
          <div className="w-full sm:w-auto">
            <MultiColumnExport listData={listData} />
          </div>
        </div>
      </div>

      {/* Column Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {listData.columns.map((column, index) => (
            <Button
              key={column.id}
              variant={activeColumn === index ? "default" : "outline"}
              onClick={() => setActiveColumn(index)}
              style={{borderColor: column.color}}
              className={activeColumn === index ? "shadow-lg" : ""}
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{backgroundColor: column.color}}
              />
              {column.theme}
              {column.timeLimit && (
                <span className="ml-1 text-xs">({column.timeLimit}min)</span>
              )}
              {column.isSpecialty && <span className="ml-1">🎯</span>}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Column Display */}
      {listData.columns[activeColumn] && (
        <div
          className="mb-4 p-4 border rounded"
          style={{borderColor: listData.columns[activeColumn].color}}
        >
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{backgroundColor: listData.columns[activeColumn].color}}
            />
            {listData.columns[activeColumn].theme}
            {listData.columns[activeColumn].isSpecialty && (
              <span className="ml-2 text-sm bg-yellow-100 px-2 py-1 rounded">
                🎯 Spezialgebiet mit Prognose
              </span>
            )}
          </h2>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-13 gap-2">
            {alphabet.map((letter) => (
              <MultiColumnLetter
                key={letter}
                letter={letter}
                listName={item!}
                column={listData.columns[activeColumn]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Configuration Dialog */}
      <ColumnConfigDialog
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        columns={listData.columns}
        onSave={updateColumns}
      />

      {/* Statistics Dialog */}
      <MultiColumnStatistics
        isOpen={showStatistics}
        onClose={() => setShowStatistics(false)}
        listData={listData}
      />

      {/* Prediction Dialog */}
      {specialtyColumn && (
        <PredictionDialog
          isOpen={showPrediction}
          onClose={() => setShowPrediction(false)}
          listData={listData}
          specialtyColumn={specialtyColumn}
        />
      )}
    </div>
  );
}
