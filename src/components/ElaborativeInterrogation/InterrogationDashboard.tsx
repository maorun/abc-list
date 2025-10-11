// InterrogationDashboard - Overview of interrogation sessions and statistics
import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "../ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "../ui/card";
import {ElaborativeInterrogationService} from "@/lib/ElaborativeInterrogationService";
import {
  InterrogationSession,
  InterrogationStatistics,
} from "@/lib/elaborativeInterrogation";
import {WordWithExplanation} from "../List/types";
import {NewItemWithSaveKey} from "../NewStringItem";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getQuestionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    why: "Warum",
    explain: "Erklären",
    connection: "Verbindungen",
    "what-if": "Was-wäre-wenn",
    how: "Anwendung",
    none: "Keine",
  };
  return labels[type] || type;
};

const handleNewSession = (navigate: (path: string) => void) => {
  navigate("/interrogation/new");
};

const handleViewSession = (
  sessionId: string,
  navigate: (path: string) => void,
) => {
  navigate(`/interrogation/session/${sessionId}`);
};

const handleStartFromSuggestion = (
  word: string,
  explanation: string,
  navigate: (path: string) => void,
) => {
  // Navigate to new session with pre-filled data
  navigate("/interrogation/new", {
    state: {word, explanation},
  });
};

interface Suggestion {
  word: string;
  explanation: string;
  source: string;
  type: "abc-list" | "kawa";
}

const loadSuggestions = (): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const alphabet = Array.from({length: 26}, (_, i) =>
    String.fromCharCode(97 + i),
  );

  // Load from ABC-Lists
  const abcListsData = localStorage.getItem("abcLists");
  if (abcListsData) {
    try {
      const abcLists: string[] = JSON.parse(abcListsData);
      abcLists.forEach((listName) => {
        alphabet.forEach((letter) => {
          const storageKey = `abcList-${listName}:${letter}`;
          const data = localStorage.getItem(storageKey);
          if (data) {
            try {
              const words: WordWithExplanation[] = JSON.parse(data);
              words.forEach((word) => {
                if (word.text && word.explanation) {
                  suggestions.push({
                    word: word.text,
                    explanation: word.explanation,
                    source: listName,
                    type: "abc-list",
                  });
                }
              });
            } catch {
              // Skip invalid data
            }
          }
        });
      });
    } catch {
      // Skip if parsing fails
    }
  }

  // Load from KaWas
  const kawasData = localStorage.getItem("Kawas");
  if (kawasData) {
    try {
      const kawas: NewItemWithSaveKey[] = JSON.parse(kawasData);
      kawas.forEach((kawa) => {
        if (kawa.text && kawa.key) {
          // Get KaWa associations
          const kawaKey = `kawa-${kawa.key}`;
          const kawaData = localStorage.getItem(kawaKey);
          if (kawaData) {
            try {
              const associations: Record<string, string> = JSON.parse(kawaData);
              const associationTexts = Object.values(associations)
                .filter((a) => a)
                .join(", ");
              if (associationTexts) {
                suggestions.push({
                  word: kawa.text,
                  explanation: `Assoziationen: ${associationTexts}`,
                  source: kawa.text,
                  type: "kawa",
                });
              }
            } catch {
              // Skip invalid data
            }
          }
        }
      });
    } catch {
      // Skip if parsing fails
    }
  }

  // Remove duplicates and limit to 10 most recent
  const uniqueSuggestions = suggestions.filter(
    (suggestion, index, self) =>
      index ===
      self.findIndex(
        (s) => s.word === suggestion.word && s.source === suggestion.source,
      ),
  );

  return uniqueSuggestions.slice(0, 10);
};

export function InterrogationDashboard() {
  const navigate = useNavigate();
  const service = ElaborativeInterrogationService.getInstance();

  const [sessions, setSessions] = useState<InterrogationSession[]>([]);
  const [stats, setStats] = useState<InterrogationStatistics | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const loadData = () => {
      const allSessions = service.getAllSessions();
      setSessions(allSessions.slice().reverse()); // Most recent first
      setStats(service.getStatistics());
      setSuggestions(loadSuggestions());
    };

    loadData();

    // Listen for updates
    const listener = () => loadData();
    service.addListener(listener);
    return () => service.removeListener(listener);
  }, [service]);

  const newSession = () => handleNewSession(navigate);
  const viewSession = (sessionId: string) =>
    handleViewSession(sessionId, navigate);
  const startFromSuggestion = (word: string, explanation: string) =>
    handleStartFromSuggestion(word, explanation, navigate);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Elaborative Interrogation</h1>
          <p className="text-gray-600 mt-1">
            Vertiefe dein Wissen durch gezielte Fragen
          </p>
        </div>
        <Button onClick={newSession} className="w-full sm:w-auto">
          ➕ Neue Session
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && stats.totalSessions > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ø Punktzahl
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}/100</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Fragen beantwortet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.questionsAnswered}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Verbesserung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.improvementRate > 0 ? "+" : ""}
                {stats.improvementRate}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Insights */}
      {stats && stats.totalSessions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance-Einblicke</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">Stärkster Fragetyp</p>
                <p className="text-sm text-green-700">
                  {getQuestionTypeLabel(stats.strongestQuestionType)}
                </p>
              </div>
              <div className="text-2xl">💪</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium text-orange-900">
                  Verbesserungspotenzial
                </p>
                <p className="text-sm text-orange-700">
                  {getQuestionTypeLabel(stats.weakestQuestionType)}
                </p>
              </div>
              <div className="text-2xl">📈</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions from ABC-Lists and KaWas */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>💡 Vorschläge aus deinen Listen</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Starte eine Interrogation-Session mit Begriffen aus deinen
              ABC-Listen oder KaWas
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.source}-${suggestion.word}-${index}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 mb-2 sm:mb-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{suggestion.word}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {suggestion.type === "abc-list" ? "ABC-Liste" : "KaWa"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                      {suggestion.explanation}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Quelle: {suggestion.source}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      startFromSuggestion(
                        suggestion.word,
                        suggestion.explanation,
                      )
                    }
                    className="w-full sm:w-auto"
                  >
                    Session starten
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Deine Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">Noch keine Sessions vorhanden</p>
              <Button onClick={newSession}>Erste Session starten</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 mb-2 sm:mb-0">
                    <h3 className="font-medium">{session.word}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {session.explanation}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(session.startTime)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4">
                    {session.completed && (
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {session.overallScore}
                          <span className="text-sm">/100</span>
                        </div>
                        <div className="text-xs text-gray-500">Punktzahl</div>
                      </div>
                    )}

                    {!session.completed && (
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {Object.keys(session.responses).length}/
                          {session.questions.length}
                        </div>
                        <div className="text-xs text-gray-500">In Arbeit</div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewSession(session.id)}
                    >
                      {session.completed ? "Ansehen" : "Fortsetzen"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 Was ist Elaborative Interrogation?
          </h3>
          <p className="text-sm text-blue-800">
            Eine wissenschaftlich fundierte Lernmethode, bei der durch gezielte
            Fragen das tiefe Verständnis von Konzepten gefördert wird. Statt nur
            Fakten auswendig zu lernen, lernst du die Zusammenhänge und
            Bedeutungen zu verstehen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
