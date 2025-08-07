import React, {useState, useEffect} from "react";
import {LearningStatistics} from "./LearningStatistics";
import {KnowledgeAreasVisualization} from "./KnowledgeAreasVisualization";
import {ProgressGraphs} from "./ProgressGraphs";
import {ListComparison} from "./ListComparison";
import {StrengthsWeaknessesAnalysis} from "./StrengthsWeaknessesAnalysis";
import {MilestoneTracking} from "./MilestoneTracking";
import {useAnalyticsData} from "./useAnalyticsData";

type TabType =
  | "overview"
  | "knowledge-areas"
  | "progress"
  | "comparison"
  | "analysis"
  | "milestones";

export function Analytics() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const analyticsData = useAnalyticsData();

  useEffect(() => {
    document.title = "Lernanalyse - ABC-Listen App";
  }, []);

  const tabs = [
    {id: "overview", label: "Übersicht", icon: "📊"},
    {id: "knowledge-areas", label: "Wissensbereiche", icon: "🗺️"},
    {id: "progress", label: "Fortschritt", icon: "📈"},
    {id: "comparison", label: "Vergleiche", icon: "⚖️"},
    {id: "analysis", label: "Analyse", icon: "🔍"},
    {id: "milestones", label: "Meilensteine", icon: "🎯"},
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <LearningStatistics data={analyticsData} />;
      case "knowledge-areas":
        return <KnowledgeAreasVisualization data={analyticsData} />;
      case "progress":
        return <ProgressGraphs data={analyticsData} />;
      case "comparison":
        return <ListComparison data={analyticsData} />;
      case "analysis":
        return <StrengthsWeaknessesAnalysis data={analyticsData} />;
      case "milestones":
        return <MilestoneTracking data={analyticsData} />;
      default:
        return <LearningStatistics data={analyticsData} />;
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">
          Lernanalyse Dashboard
        </h1>
        <p className="text-center text-gray-600">
          Verfolgen Sie Ihren Lernfortschritt mit dem
          &quot;Ball-im-Tor-Effekt&quot;
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}
