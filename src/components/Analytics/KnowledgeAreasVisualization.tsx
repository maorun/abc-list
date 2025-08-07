import React from "react";
import {AnalyticsData} from "./useAnalyticsData";

interface KnowledgeAreasVisualizationProps {
  data: AnalyticsData;
}

export function KnowledgeAreasVisualization({
  data,
}: KnowledgeAreasVisualizationProps) {
  const maxStrength = Math.max(
    ...data.knowledgeAreas.map((area) => area.strength),
    1,
  );

  const getNodeSize = (strength: number) => {
    const baseSize = 60;
    const maxSize = 120;
    return baseSize + (strength / maxStrength) * (maxSize - baseSize);
  };

  const getNodeColor = (strength: number) => {
    const intensity = strength / maxStrength;
    if (intensity > 0.8) return "bg-green-500";
    if (intensity > 0.6) return "bg-blue-500";
    if (intensity > 0.4) return "bg-yellow-500";
    if (intensity > 0.2) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStrengthLabel = (strength: number) => {
    const intensity = strength / maxStrength;
    if (intensity > 0.8) return "Sehr stark";
    if (intensity > 0.6) return "Stark";
    if (intensity > 0.4) return "Mittel";
    if (intensity > 0.2) return "Schwach";
    return "Sehr schwach";
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        Wissensbereiche Visualisierung
      </h2>

      <div className="text-center text-gray-600 mb-6">
        <p>Größe der Knoten entspricht der Wissensstärke in diesem Bereich</p>
        <p>
          Farben zeigen das relative Niveau: Grün = Stark, Rot =
          Verbesserungsbedarf
        </p>
      </div>

      {data.knowledgeAreas.length > 0 ? (
        <>
          {/* Mindmap-style visualization */}
          <div className="relative min-h-96 bg-gray-50 rounded-lg p-8 overflow-auto">
            <div className="flex flex-wrap justify-center items-center gap-8">
              {/* Central node */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  <span className="text-xs text-center">
                    Lern-
                    <br />
                    zentrum
                  </span>
                </div>
              </div>

              {/* Knowledge area nodes positioned in a circle */}
              {data.knowledgeAreas.map((area, index) => {
                const angle = (index * 360) / data.knowledgeAreas.length;
                const radius = 150;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                const size = getNodeSize(area.strength);

                return (
                  <div
                    key={area.area}
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    }}
                  >
                    {/* Connection line */}
                    <svg
                      className="absolute top-1/2 left-1/2 pointer-events-none"
                      style={{
                        width: Math.abs(x) + 50,
                        height: Math.abs(y) + 50,
                        transform: `translate(-50%, -50%)`,
                      }}
                    >
                      <line
                        x1={x > 0 ? 0 : Math.abs(x)}
                        y1={y > 0 ? 0 : Math.abs(y)}
                        x2={x > 0 ? Math.abs(x) : 0}
                        y2={y > 0 ? Math.abs(y) : 0}
                        stroke="#d1d5db"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                    </svg>

                    {/* Knowledge area node */}
                    <div
                      className={`rounded-full flex flex-col items-center justify-center text-white text-xs font-medium shadow-lg cursor-pointer transform hover:scale-110 transition-transform ${getNodeColor(area.strength)}`}
                      style={{
                        width: size,
                        height: size,
                      }}
                      title={`${area.area}\nStärke: ${area.strength.toFixed(1)}\nAnzahl: ${area.count}`}
                    >
                      <div className="text-center p-2">
                        <div className="font-bold truncate max-w-full">
                          {area.area.length > 10
                            ? area.area.substring(0, 10) + "..."
                            : area.area}
                        </div>
                        <div className="text-xs mt-1">
                          {area.count} {area.count === 1 ? "Liste" : "Listen"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Knowledge areas list */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Detaillierte Wissensgebiete
            </h3>
            <div className="space-y-3">
              {data.knowledgeAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{area.area}</h4>
                    <p className="text-sm text-gray-600">
                      {area.count} {area.count === 1 ? "Liste" : "Listen"} •
                      Stärke: {area.strength.toFixed(1)} •
                      {getStrengthLabel(area.strength)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full ${getNodeColor(area.strength)}`}
                    ></div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getNodeColor(area.strength)}`}
                        style={{
                          width: `${(area.strength / maxStrength) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning recommendations */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">
              💡 Lernempfehlungen
            </h3>
            <div className="space-y-2 text-blue-700">
              {data.knowledgeAreas.length > 0 && (
                <>
                  <p>
                    🎯 Fokussieren Sie sich auf{" "}
                    <strong>
                      {
                        data.knowledgeAreas[data.knowledgeAreas.length - 1]
                          ?.area
                      }
                    </strong>
                    - hier gibt es noch Verbesserungspotential!
                  </p>
                  <p>
                    🏆 Vertiefen Sie Ihr Wissen in{" "}
                    <strong>{data.knowledgeAreas[0]?.area}</strong>- das ist
                    bereits Ihre Stärke!
                  </p>
                  <p>
                    📈 Versuchen Sie, in schwächeren Bereichen mehr Wörter pro
                    Buchstabe zu finden.
                  </p>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg mb-4">Noch keine Wissensbereiche verfügbar</p>
          <p>
            Erstellen Sie Ihre erste ABC-Liste, um Ihre Wissensbereiche zu
            visualisieren!
          </p>
        </div>
      )}
    </div>
  );
}
