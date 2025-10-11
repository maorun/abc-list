// ElaborativeInterrogation - Main component for deep learning through questioning
import React, {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Button} from "../ui/button";
import {Textarea} from "../ui/textarea";
import {Progress} from "../ui/progress";
import {Card, CardContent, CardHeader, CardTitle} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {ElaborativeInterrogationService} from "@/lib/ElaborativeInterrogationService";
import {
  InterrogationSession,
  InterrogationQuestion,
  InterrogationEvaluation,
} from "@/lib/elaborativeInterrogation";
import {useGamification} from "@/hooks/useGamification";
import {toast} from "sonner";

// Extract helper functions outside component
const formatQuestionType = (type: string): string => {
  const typeLabels: Record<string, string> = {
    why: "Warum?",
    explain: "Erklären",
    connection: "Verbindungen",
    "what-if": "Was-wäre-wenn?",
    how: "Wie anwenden?",
  };
  return typeLabels[type] || type;
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
};

const handleStartSession = (
  word: string,
  explanation: string,
  service: ElaborativeInterrogationService,
  setSession: (session: InterrogationSession) => void,
  setCurrentQuestion: (question: InterrogationQuestion | null) => void,
  setShowWordSelector: (show: boolean) => void,
  trackInterrogation: () => void,
) => {
  const newSession = service.startSession(word, explanation);
  setSession(newSession);
  const firstQuestion = service.getNextUnansweredQuestion(newSession.id);
  setCurrentQuestion(firstQuestion);
  setShowWordSelector(false);
  trackInterrogation();
  toast.success("Interrogation-Session gestartet!");
};

const handleSubmitResponse = (
  response: string,
  session: InterrogationSession | null,
  currentQuestion: InterrogationQuestion | null,
  service: ElaborativeInterrogationService,
  setEvaluation: (evaluation: InterrogationEvaluation | null) => void,
  setShowEvaluation: (show: boolean) => void,
  setResponse: (response: string) => void,
) => {
  if (!session || !currentQuestion) return;

  const evaluation = service.submitResponse(
    session.id,
    currentQuestion.id,
    response,
  );
  setEvaluation(evaluation);
  setShowEvaluation(true);
  setResponse("");
};

const handleNextQuestion = (
  session: InterrogationSession | null,
  service: ElaborativeInterrogationService,
  setCurrentQuestion: (question: InterrogationQuestion | null) => void,
  setShowEvaluation: (show: boolean) => void,
  setEvaluation: (eval: InterrogationEvaluation | null) => void,
  navigate: (path: string) => void,
) => {
  if (!session) return;

  const nextQ = service.getNextUnansweredQuestion(session.id);
  if (nextQ) {
    setCurrentQuestion(nextQ);
    setShowEvaluation(false);
    setEvaluation(null);
  } else {
    // All questions answered - complete session
    const completed = service.completeSession(session.id);
    toast.success(
      `Session abgeschlossen! Gesamtpunktzahl: ${completed.overallScore}/100`,
    );
    navigate("/interrogation");
  }
};

export function ElaborativeInterrogation() {
  const {word, sessionId} = useParams<{word?: string; sessionId?: string}>();
  const navigate = useNavigate();
  const service = ElaborativeInterrogationService.getInstance();
  const {trackInterrogationSession} = useGamification();

  const [session, setSession] = useState<InterrogationSession | null>(null);
  const [currentQuestion, setCurrentQuestion] =
    useState<InterrogationQuestion | null>(null);
  const [response, setResponse] = useState("");
  const [evaluation, setEvaluation] = useState<InterrogationEvaluation | null>(
    null,
  );
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [selectedExplanation, setSelectedExplanation] = useState("");
  const [showWordSelector, setShowWordSelector] = useState(true);

  // Load existing session if sessionId is provided
  useEffect(() => {
    if (sessionId) {
      const existingSession = service.getSession(sessionId);
      if (existingSession) {
        setSession(existingSession);
        setSelectedWord(existingSession.word);
        setSelectedExplanation(existingSession.explanation);
        setShowWordSelector(false);

        // Find next unanswered question or first question if all answered
        const nextQ = service.getNextUnansweredQuestion(sessionId);
        if (nextQ) {
          setCurrentQuestion(nextQ);
        } else if (existingSession.questions.length > 0) {
          // If all questions answered, show first question for review
          setCurrentQuestion(existingSession.questions[0]);
        }
      } else {
        toast.error("Session nicht gefunden");
        navigate("/interrogation");
      }
    }
  }, [sessionId, service, navigate]);

  // Load word data if provided via URL
  useEffect(() => {
    if (word && !sessionId) {
      // Try to load word from localStorage
      const alphabet = Array.from({length: 26}, (_, i) =>
        String.fromCharCode(97 + i),
      );

      for (const letter of alphabet) {
        const storageKey = `abcList-${decodeURIComponent(word)}:${letter}`;
        const data = localStorage.getItem(storageKey);
        if (data) {
          try {
            const words = JSON.parse(data);
            if (words.length > 0) {
              setSelectedWord(words[0].text);
              setSelectedExplanation(words[0].explanation || "");
              setShowWordSelector(false);
              break;
            }
          } catch {
            // Continue to next letter
          }
        }
      }
    }
  }, [word, sessionId]);

  // Start session handler
  const startSession = () =>
    handleStartSession(
      selectedWord,
      selectedExplanation,
      service,
      setSession,
      setCurrentQuestion,
      setShowWordSelector,
      trackInterrogationSession,
    );

  // Submit response handler
  const submitResponse = () =>
    handleSubmitResponse(
      response,
      session,
      currentQuestion,
      service,
      setEvaluation,
      setShowEvaluation,
      setResponse,
    );

  // Next question handler
  const nextQuestion = () =>
    handleNextQuestion(
      session,
      service,
      setCurrentQuestion,
      setShowEvaluation,
      setEvaluation,
      navigate,
    );

  const progress = session ? service.getSessionProgress(session.id) : 0;

  if (showWordSelector) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Elaborative Interrogation</CardTitle>
            <p className="text-sm text-gray-600">
              Vertiefe dein Verständnis durch gezielte Fragen
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="word-input"
                className="block text-sm font-medium mb-2"
              >
                Wort oder Begriff
              </label>
              <input
                id="word-input"
                type="text"
                value={selectedWord}
                onChange={(e) => setSelectedWord(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Photosynthese"
              />
            </div>
            <div>
              <label
                htmlFor="explanation-input"
                className="block text-sm font-medium mb-2"
              >
                Erklärung oder Kontext
              </label>
              <Textarea
                id="explanation-input"
                value={selectedExplanation}
                onChange={(e) => setSelectedExplanation(e.target.value)}
                className="w-full min-h-32"
                placeholder="z.B. Prozess, bei dem Pflanzen Lichtenergie in chemische Energie umwandeln..."
              />
            </div>
            <Button
              onClick={startSession}
              disabled={!selectedWord || !selectedExplanation}
              className="w-full"
            >
              Session starten
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Lade Session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fortschritt</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} />
            <p className="text-xs text-gray-600">
              Frage{" "}
              {session.questions.findIndex((q) => q.id === currentQuestion.id) +
                1}{" "}
              von {session.questions.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {formatQuestionType(currentQuestion.type)}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHints(!showHints)}
            >
              {showHints ? "Hinweise verbergen" : "💡 Hinweise"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-lg font-medium text-blue-900">
              {currentQuestion.question}
            </p>
            {currentQuestion.context && (
              <p className="text-sm text-blue-700 mt-2">
                Kontext: {currentQuestion.context}
              </p>
            )}
          </div>

          {showHints && currentQuestion.hints && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="font-medium text-yellow-900 mb-2">💡 Hinweise:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                {currentQuestion.hints.map((hint, idx) => (
                  <li key={idx}>{hint}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label
              htmlFor="response-input"
              className="block text-sm font-medium mb-2"
            >
              Deine Antwort
            </label>
            <Textarea
              id="response-input"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full min-h-40"
              placeholder="Nimm dir Zeit für eine ausführliche Antwort..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Wörter:{" "}
              {
                response
                  .trim()
                  .split(/\s+/)
                  .filter((w) => w).length
              }
            </p>
          </div>

          <Button
            onClick={submitResponse}
            disabled={!response.trim()}
            className="w-full"
          >
            Antwort abschicken
          </Button>
        </CardContent>
      </Card>

      {/* Evaluation Dialog */}
      <Dialog open={showEvaluation} onOpenChange={setShowEvaluation}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bewertung deiner Antwort</DialogTitle>
            <DialogDescription>
              Hier siehst du, wie gut deine Antwort die Kriterien erfüllt
            </DialogDescription>
          </DialogHeader>

          {evaluation && (
            <div className="space-y-4">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div
                  className={`text-5xl font-bold ${getScoreColor(evaluation.score)}`}
                >
                  {evaluation.score}
                  <span className="text-2xl">/100</span>
                </div>
                <p className="text-gray-700 mt-2">{evaluation.feedback}</p>
              </div>

              {evaluation.strengths.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-900 mb-2">✅ Stärken:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                    {evaluation.strengths.map((strength, idx) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.improvements.length > 0 && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="font-medium text-orange-900 mb-2">
                    💡 Verbesserungsvorschläge:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-orange-800">
                    {evaluation.improvements.map((improvement, idx) => (
                      <li key={idx}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900 mb-2">
                  ✓ Erfüllte Kriterien ({evaluation.criteriaMatched.length}/
                  {currentQuestion.evaluationCriteria.length}):
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                  {evaluation.criteriaMatched.map((criterion, idx) => (
                    <li key={idx}>{criterion}</li>
                  ))}
                </ul>
              </div>

              <Button onClick={nextQuestion} className="w-full">
                {service.getNextUnansweredQuestion(session.id)
                  ? "Nächste Frage"
                  : "Session beenden"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
