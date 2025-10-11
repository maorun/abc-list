// Elaborative Interrogation System
// Implements rule-based question generation and understanding evaluation
// Based on Birkenbihl's learning methodology for deeper comprehension

export interface InterrogationQuestion {
  id: string;
  type: "why" | "how" | "what-if" | "explain" | "connection";
  question: string;
  context: string;
  hints?: string[];
  evaluationCriteria: string[];
}

export interface InterrogationSession {
  id: string;
  word: string;
  explanation: string;
  startTime: string;
  endTime?: string;
  questions: InterrogationQuestion[];
  responses: Record<string, string>; // questionId -> user response
  evaluations: Record<string, InterrogationEvaluation>; // questionId -> evaluation
  overallScore: number;
  completed: boolean;
}

export interface InterrogationEvaluation {
  score: number; // 0-100
  feedback: string;
  strengths: string[];
  improvements: string[];
  criteriaMatched: string[];
}

export interface InterrogationStatistics {
  totalSessions: number;
  averageScore: number;
  questionsAnswered: number;
  strongestQuestionType: string;
  weakestQuestionType: string;
  improvementRate: number;
}

// Generate questions based on word and explanation
export function generateQuestions(
  word: string,
  explanation: string,
): InterrogationQuestion[] {
  const questions: InterrogationQuestion[] = [];

  // Why question - fundamental understanding
  questions.push({
    id: `why-${Date.now()}-1`,
    type: "why",
    question: `Warum ist "${word}" in diesem Kontext wichtig?`,
    context: explanation,
    hints: [
      "Denke an die praktische Bedeutung",
      "Welche Rolle spielt es im größeren Zusammenhang?",
      "Was wäre anders ohne dieses Konzept?",
    ],
    evaluationCriteria: [
      "Nennt praktische Bedeutung",
      "Erklärt Kontext und Zusammenhänge",
      "Zeigt Verständnis für Relevanz",
      "Mindestens 20 Wörter Länge",
    ],
  });

  // Explain question - teaching others
  questions.push({
    id: `explain-${Date.now()}-2`,
    type: "explain",
    question: `Erkläre "${word}" so, als würdest du es einem 10-Jährigen beibringen.`,
    context: explanation,
    hints: [
      "Verwende einfache Sprache",
      "Nutze Beispiele aus dem Alltag",
      "Vermeide Fachbegriffe oder erkläre sie",
    ],
    evaluationCriteria: [
      "Verwendet einfache, verständliche Sprache",
      "Enthält mindestens ein konkretes Beispiel",
      "Baut logisch aufeinander auf",
      "Vermeidet unnötige Fachbegriffe",
    ],
  });

  // Connection question - relating concepts
  questions.push({
    id: `connection-${Date.now()}-3`,
    type: "connection",
    question: `Wie hängt "${word}" mit anderen Konzepten zusammen, die du kennst?`,
    context: explanation,
    hints: [
      "Denke an ähnliche Konzepte",
      "Überlege, wo du es schon gesehen hast",
      "Finde Verbindungen zu anderen Bereichen",
    ],
    evaluationCriteria: [
      "Nennt mindestens zwei Verbindungen",
      "Erklärt die Art der Verbindung",
      "Zeigt interdisziplinäres Denken",
      "Erkennt Muster und Analogien",
    ],
  });

  // What-if question - deeper thinking
  questions.push({
    id: `what-if-${Date.now()}-4`,
    type: "what-if",
    question: `Was wäre, wenn "${word}" nicht existieren würde? Welche Auswirkungen hätte das?`,
    context: explanation,
    hints: [
      "Stelle dir verschiedene Szenarien vor",
      "Denke an direkte und indirekte Folgen",
      "Betrachte verschiedene Perspektiven",
    ],
    evaluationCriteria: [
      "Nennt mindestens zwei Auswirkungen",
      "Zeigt logisches Denken",
      "Betrachtet verschiedene Perspektiven",
      "Erkennt Zusammenhänge",
    ],
  });

  // How question - practical application
  questions.push({
    id: `how-${Date.now()}-5`,
    type: "how",
    question: `Wie kannst du "${word}" in der Praxis anwenden oder nutzen?`,
    context: explanation,
    hints: [
      "Denke an konkrete Situationen",
      "Überlege, wo es nützlich sein könnte",
      "Finde eigene Anwendungsbeispiele",
    ],
    evaluationCriteria: [
      "Nennt praktische Anwendungen",
      "Gibt konkrete Beispiele",
      "Zeigt Übertragbarkeit des Wissens",
      "Denkt kreativ über Nutzung nach",
    ],
  });

  return questions;
}

// Evaluate user response based on criteria
export function evaluateResponse(
  response: string,
  question: InterrogationQuestion,
): InterrogationEvaluation {
  const criteriaMatched: string[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Word count check
  const wordCount = response.trim().split(/\s+/).length;

  // Evaluate against each criterion
  for (const criterion of question.evaluationCriteria) {
    if (criterion.includes("Mindestens 20 Wörter") && wordCount >= 20) {
      criteriaMatched.push(criterion);
      strengths.push("Ausführliche Antwort mit ausreichender Länge");
    } else if (criterion.includes("Mindestens 20 Wörter") && wordCount < 20) {
      improvements.push(
        "Versuche, deine Antwort ausführlicher zu formulieren (mindestens 20 Wörter)",
      );
    }

    if (criterion.includes("einfache Sprache") && wordCount >= 10) {
      criteriaMatched.push(criterion);
      strengths.push("Verwendet verständliche Sprache");
    }

    if (
      criterion.includes("Beispiel") &&
      (response.match(
        /\b(zum Beispiel|beispielsweise|z\.B\.|etwa|wie|ist)\b/gi,
      ) ||
        wordCount >= 15)
    ) {
      criteriaMatched.push(criterion);
      strengths.push("Enthält konkrete Beispiele");
    } else if (
      criterion.includes("Beispiel") &&
      !response.match(/\b(zum Beispiel|beispielsweise|z\.B\.|etwa|wie)\b/gi)
    ) {
      improvements.push(
        "Versuche, deine Erklärung mit konkreten Beispielen zu unterstützen",
      );
    }

    if (
      criterion.includes("mindestens zwei") &&
      (response.match(/\b(erstens|zweitens|außerdem|zudem|auch|und)\b/gi) ||
        response.split(/[.,;]/).length >= 3)
    ) {
      criteriaMatched.push(criterion);
      strengths.push("Nennt mehrere Punkte oder Aspekte");
    } else if (
      criterion.includes("mindestens zwei") &&
      !response.match(/\b(erstens|zweitens|außerdem|zudem|auch|und)\b/gi)
    ) {
      improvements.push("Versuche, mehrere Aspekte oder Punkte zu nennen");
    }

    if (
      criterion.includes("Zusammenhänge") &&
      (response.match(
        /\b(weil|da|denn|deshalb|daher|dadurch|führt zu|bewirkt|hängt zusammen|zeigt|erklärt)\b/gi,
      ) ||
        wordCount >= 15)
    ) {
      criteriaMatched.push(criterion);
      strengths.push("Erklärt Zusammenhänge und Ursachen");
    }

    if (
      criterion.includes("praktische") &&
      (response.match(
        /\b(nutzen|verwenden|anwenden|einsetzen|praktisch|Praxis|Alltag|Beispiel)\b/gi,
      ) ||
        wordCount >= 15)
    ) {
      criteriaMatched.push(criterion);
      strengths.push("Bezieht praktische Anwendung mit ein");
    }
  }

  // Calculate score based on criteria matched
  const maxScore = question.evaluationCriteria.length;
  const score = Math.round((criteriaMatched.length / maxScore) * 100);

  // Generate feedback based on score
  let feedback = "";
  if (score >= 80) {
    feedback =
      "Ausgezeichnete Antwort! Du zeigst ein tiefes Verständnis des Konzepts.";
  } else if (score >= 60) {
    feedback =
      "Gute Antwort! Du hast die wichtigsten Punkte erfasst. Mit etwas mehr Detail wäre es perfekt.";
  } else if (score >= 40) {
    feedback =
      "Solide Basis! Versuche, deine Antwort noch ausführlicher zu gestalten und mehr Zusammenhänge zu erklären.";
  } else {
    feedback =
      "Das ist ein guter Anfang. Nimm dir mehr Zeit, über das Konzept nachzudenken und es ausführlicher zu erklären.";
  }

  // Add general improvements if score is low
  if (score < 60 && improvements.length === 0) {
    improvements.push(
      "Überlege dir mehr Zeit für die Antwort zu nehmen",
      "Versuche, tiefer in das Thema einzusteigen",
      "Nutze die Hinweise, um deine Antwort zu verbessern",
    );
  }

  return {
    score,
    feedback,
    strengths,
    improvements,
    criteriaMatched,
  };
}

// Calculate overall session score
export function calculateSessionScore(session: InterrogationSession): number {
  if (Object.keys(session.evaluations).length === 0) {
    return 0;
  }

  const scores = Object.values(session.evaluations).map((e) => e.score);
  const averageScore =
    scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(averageScore);
}

// Get question type performance statistics
export function getQuestionTypeStats(
  sessions: InterrogationSession[],
): Record<string, {averageScore: number; count: number}> {
  const typeStats: Record<string, {scores: number[]; count: number}> = {
    why: {scores: [], count: 0},
    how: {scores: [], count: 0},
    "what-if": {scores: [], count: 0},
    explain: {scores: [], count: 0},
    connection: {scores: [], count: 0},
  };

  for (const session of sessions) {
    for (const question of session.questions) {
      const evaluation = session.evaluations[question.id];
      if (evaluation) {
        typeStats[question.type].scores.push(evaluation.score);
        typeStats[question.type].count++;
      }
    }
  }

  const result: Record<string, {averageScore: number; count: number}> = {};
  for (const [type, data] of Object.entries(typeStats)) {
    result[type] = {
      averageScore:
        data.scores.length > 0
          ? Math.round(
              data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length,
            )
          : 0,
      count: data.count,
    };
  }

  return result;
}

// Get improvement rate (comparing first 5 sessions to last 5)
export function getImprovementRate(sessions: InterrogationSession[]): number {
  if (sessions.length < 2) return 0;

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  const firstCount = Math.min(5, Math.ceil(sessions.length / 2));
  const firstSessions = sortedSessions.slice(0, firstCount);
  const lastSessions = sortedSessions.slice(-firstCount);

  const firstAvg =
    firstSessions.reduce((sum, s) => sum + s.overallScore, 0) /
    firstSessions.length;
  const lastAvg =
    lastSessions.reduce((sum, s) => sum + s.overallScore, 0) /
    lastSessions.length;

  // Prevent division by zero
  if (firstAvg === 0) {
    return lastAvg > 0 ? 100 : 0;
  }

  return Math.round(((lastAvg - firstAvg) / firstAvg) * 100);
}

// Storage key
export const INTERROGATION_STORAGE_KEY = "elaborativeInterrogationSessions";
