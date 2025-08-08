import React, {useState, useEffect, useCallback} from "react";
import {CheckCircle, Target, Plus, Trash2} from "lucide-react";
import {AnalyticsData} from "./analytics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Milestone {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  category: "words" | "lists" | "consistency" | "custom";
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

interface MilestoneTrackingProps {
  data: AnalyticsData;
}

export function MilestoneTracking({data}: MilestoneTrackingProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    target: 0,
    unit: "Wörter",
    category: "words" as Milestone["category"],
  });

  useEffect(() => {
    loadMilestones();
  }, [loadMilestones]);

  useEffect(() => {
    updateMilestoneProgress();
  }, [updateMilestoneProgress]);

  const loadMilestones = useCallback(() => {
    const stored = localStorage.getItem("learningMilestones");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMilestones(parsed);
      } catch {
        initializeDefaultMilestones();
      }
    } else {
      initializeDefaultMilestones();
    }
  }, [initializeDefaultMilestones]);

  const initializeDefaultMilestones = useCallback(() => {
    const defaultMilestones: Milestone[] = [
      {
        id: "first-list",
        title: "Erste ABC-Liste",
        description: "Erstellen Sie Ihre erste vollständige ABC-Liste",
        target: 1,
        current: 0,
        unit: "Liste",
        category: "lists",
        completed: false,
        createdAt: Date.now(),
      },
      {
        id: "hundred-words",
        title: "100 Wörter",
        description: "Sammeln Sie insgesamt 100 Wörter",
        target: 100,
        current: 0,
        unit: "Wörter",
        category: "words",
        completed: false,
        createdAt: Date.now(),
      },
      {
        id: "five-lists",
        title: "5 Listen Meister",
        description: "Erstellen Sie 5 verschiedene ABC-Listen",
        target: 5,
        current: 0,
        unit: "Listen",
        category: "lists",
        completed: false,
        createdAt: Date.now(),
      },
      {
        id: "complete-alphabet",
        title: "Alphabet Vollständig",
        description: "Füllen Sie alle 26 Buchstaben in einer Liste",
        target: 26,
        current: 0,
        unit: "Buchstaben",
        category: "custom",
        completed: false,
        createdAt: Date.now(),
      },
    ];

    setMilestones(defaultMilestones);
    saveMilestones(defaultMilestones);
  }, []);

  const updateMilestoneProgress = useCallback(() => {
    if (milestones.length === 0) return;

    const updatedMilestones = milestones.map((milestone) => {
      let current = milestone.current;
      let completed = milestone.completed;

      switch (milestone.category) {
        case "words":
          current = data.totalWords;
          break;
        case "lists":
          current = data.totalLists;
          break;
        case "custom":
          if (milestone.id === "complete-alphabet") {
            // Check for any list with all 26 letters filled
            current = Math.max(
              ...data.abcLists.map(
                (list) =>
                  Object.values(list.words).filter((words) => words.length > 0)
                    .length,
              ),
              0,
            );
          }
          break;
      }

      if (!completed && current >= milestone.target) {
        completed = true;
        milestone.completedAt = Date.now();
      }

      return {...milestone, current, completed};
    });

    if (JSON.stringify(updatedMilestones) !== JSON.stringify(milestones)) {
      setMilestones(updatedMilestones);
      saveMilestones(updatedMilestones);
    }
  }, [milestones, data.totalWords, data.totalLists, data.abcLists]);

  const saveMilestones = (milestonesToSave: Milestone[]) => {
    localStorage.setItem(
      "learningMilestones",
      JSON.stringify(milestonesToSave),
    );
  };

  const addMilestone = () => {
    if (!newMilestone.title || newMilestone.target <= 0) return;

    const milestone: Milestone = {
      id: `custom-${Date.now()}`,
      title: newMilestone.title,
      description: newMilestone.description,
      target: newMilestone.target,
      current: 0,
      unit: newMilestone.unit,
      category: newMilestone.category,
      completed: false,
      createdAt: Date.now(),
    };

    const updated = [...milestones, milestone];
    setMilestones(updated);
    saveMilestones(updated);

    setNewMilestone({
      title: "",
      description: "",
      target: 0,
      unit: "Wörter",
      category: "words",
    });
    setShowAddModal(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMilestone();
  };

  const deleteMilestone = (id: string) => {
    const updated = milestones.filter((m) => m.id !== id);
    setMilestones(updated);
    saveMilestones(updated);
  };

  const getProgressPercentage = (milestone: Milestone) => {
    return Math.min((milestone.current / milestone.target) * 100, 100);
  };

  const getCategoryIcon = (category: Milestone["category"]) => {
    switch (category) {
      case "words":
        return "💭";
      case "lists":
        return "📝";
      case "consistency":
        return "🔥";
      default:
        return "🎯";
    }
  };

  const completedMilestones = milestones.filter((m) => m.completed);
  const activeMilestones = milestones.filter((m) => !m.completed);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        Lernziele & Meilensteine
      </h2>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-800">
            {completedMilestones.length}
          </div>
          <div className="text-green-600">Erreichte Ziele</div>
        </div>
        <div className="bg-blue-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-800">
            {activeMilestones.length}
          </div>
          <div className="text-blue-600">Aktive Ziele</div>
        </div>
        <div className="bg-purple-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-800">
            {milestones.length > 0
              ? Math.round(
                  (completedMilestones.length / milestones.length) * 100,
                )
              : 0}
            %
          </div>
          <div className="text-purple-600">Erfolgsrate</div>
        </div>
      </div>

      {/* Add New Milestone Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Neues Lernziel hinzufügen"
        >
          <Plus size={20} />
          Neues Lernziel hinzufügen
        </button>
      </div>

      {/* Active Milestones */}
      {activeMilestones.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="text-blue-600" size={20} />
            Aktive Lernziele
          </h3>
          <div className="space-y-4">
            {activeMilestones.map((milestone) => {
              const progress = getProgressPercentage(milestone);
              return (
                <div key={milestone.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {getCategoryIcon(milestone.category)}
                        </span>
                        <h4 className="font-medium text-gray-900">
                          {milestone.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {milestone.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Fortschritt: {milestone.current} / {milestone.target}{" "}
                          {milestone.unit}
                        </span>
                        <span className="font-medium text-blue-600">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    {milestone.id.startsWith("custom-") && (
                      <button
                        onClick={() => deleteMilestone(milestone.id)}
                        className="text-red-500 hover:text-red-700 p-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                        title="Löschen"
                        aria-label={`Meilenstein ${milestone.title} löschen`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{width: `${progress}%`}}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Milestones */}
      {completedMilestones.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            Erreichte Ziele
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {getCategoryIcon(milestone.category)}
                  </span>
                  <h4 className="font-medium text-green-800">
                    {milestone.title}
                  </h4>
                  <CheckCircle className="text-green-600 ml-auto" size={20} />
                </div>
                <p className="text-sm text-green-700 mb-2">
                  {milestone.description}
                </p>
                <div className="text-xs text-green-600">
                  Erreicht: {milestone.current} {milestone.unit}
                  {milestone.completedAt && (
                    <span className="ml-2">
                      am{" "}
                      {new Date(milestone.completedAt).toLocaleDateString(
                        "de-DE",
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Neues Lernziel hinzufügen</DialogTitle>
            <DialogDescription>
              Erstellen Sie ein neues Lernziel, um Ihren Fortschritt zu
              verfolgen und motiviert zu bleiben.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="milestone-title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Titel
              </label>
              <input
                id="milestone-title"
                type="text"
                value={newMilestone.title}
                onChange={(e) =>
                  setNewMilestone({...newMilestone, title: e.target.value})
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. 500 Wörter sammeln"
                aria-label="Titel des Lernziels"
                required
              />
            </div>

            <div>
              <label
                htmlFor="milestone-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Beschreibung
              </label>
              <textarea
                id="milestone-description"
                value={newMilestone.description}
                onChange={(e) =>
                  setNewMilestone({
                    ...newMilestone,
                    description: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Beschreiben Sie Ihr Lernziel..."
                aria-label="Beschreibung des Lernziels"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="milestone-target"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Zielwert
                </label>
                <input
                  id="milestone-target"
                  type="number"
                  value={newMilestone.target}
                  onChange={(e) =>
                    setNewMilestone({
                      ...newMilestone,
                      target: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  aria-label="Zielwert"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="milestone-unit"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Einheit
                </label>
                <select
                  id="milestone-unit"
                  value={newMilestone.unit}
                  onChange={(e) =>
                    setNewMilestone({...newMilestone, unit: e.target.value})
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Einheit des Zielwerts"
                >
                  <option value="Wörter">Wörter</option>
                  <option value="Listen">Listen</option>
                  <option value="Buchstaben">Buchstaben</option>
                  <option value="Tage">Tage</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="milestone-category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kategorie
              </label>
              <select
                id="milestone-category"
                value={newMilestone.category}
                onChange={(e) =>
                  setNewMilestone({
                    ...newMilestone,
                    category: e.target.value as Milestone["category"],
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Kategorie des Lernziels"
              >
                <option value="words">Wörter</option>
                <option value="lists">Listen</option>
                <option value="consistency">Konsistenz</option>
                <option value="custom">Benutzerdefiniert</option>
              </select>
            </div>

            <DialogFooter className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={
                  !newMilestone.title.trim() || newMilestone.target <= 0
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Lernziel hinzufügen"
              >
                Hinzufügen
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Dialog schließen"
              >
                Abbrechen
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Motivation Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">🌟 Motivation & Erfolge</h3>
        <div className="space-y-2">
          {completedMilestones.length > 0 && (
            <p>
              🎉 Fantastisch! Sie haben bereits {completedMilestones.length}{" "}
              Ziele erreicht!
            </p>
          )}
          {activeMilestones.length > 0 && (
            <p>
              🎯 Sie arbeiten aktiv an {activeMilestones.length} Zielen -
              bleiben Sie dran!
            </p>
          )}
          {milestones.length === 0 && (
            <p>
              🚀 Setzen Sie sich Ihre ersten Lernziele und starten Sie Ihre
              Erfolgsreise!
            </p>
          )}
          <p>
            💡 Tipp: Kleine, erreichbare Ziele motivieren mehr als große, schwer
            erreichbare!
          </p>
        </div>
      </div>
    </div>
  );
}
