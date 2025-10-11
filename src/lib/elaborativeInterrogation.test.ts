import {describe, it, expect} from "vitest";
import {
  generateQuestions,
  evaluateResponse,
  calculateSessionScore,
  getQuestionTypeStats,
  getImprovementRate,
  InterrogationSession,
} from "./elaborativeInterrogation";

describe("Elaborative Interrogation", () => {
  describe("generateQuestions", () => {
    it("should generate 5 questions for a word and explanation", () => {
      const questions = generateQuestions(
        "Photosynthese",
        "Prozess, bei dem Pflanzen Lichtenergie in chemische Energie umwandeln",
      );

      expect(questions).toHaveLength(5);
      expect(questions.map((q) => q.type)).toEqual([
        "why",
        "explain",
        "connection",
        "what-if",
        "how",
      ]);
    });

    it("should include word in question text", () => {
      const questions = generateQuestions("Test", "Ein Prüfungsverfahren");

      for (const question of questions) {
        expect(question.question).toContain("Test");
      }
    });

    it("should provide hints for each question", () => {
      const questions = generateQuestions("Test", "Ein Prüfungsverfahren");

      for (const question of questions) {
        expect(question.hints).toBeDefined();
        expect(question.hints!.length).toBeGreaterThan(0);
      }
    });

    it("should provide evaluation criteria for each question", () => {
      const questions = generateQuestions("Test", "Ein Prüfungsverfahren");

      for (const question of questions) {
        expect(question.evaluationCriteria).toBeDefined();
        expect(question.evaluationCriteria.length).toBeGreaterThan(0);
      }
    });
  });

  describe("evaluateResponse", () => {
    it("should score a comprehensive response highly", () => {
      const question = generateQuestions("Photosynthese", "Test")[0];
      const response =
        "Photosynthese ist wichtig, weil sie die Grundlage für das Leben auf der Erde bildet. Sie produziert Sauerstoff, den wir zum Atmen brauchen, und wandelt Lichtenergie in chemische Energie um, die in Pflanzen gespeichert wird. Zum Beispiel nutzen Bäume die Photosynthese, um zu wachsen und Früchte zu produzieren.";

      const evaluation = evaluateResponse(response, question);

      expect(evaluation.score).toBeGreaterThan(60);
      expect(evaluation.strengths.length).toBeGreaterThan(0);
      expect(evaluation.feedback).toBeTruthy();
    });

    it("should score a brief response lower", () => {
      const question = generateQuestions("Photosynthese", "Test")[0];
      const response = "Es ist wichtig.";

      const evaluation = evaluateResponse(response, question);

      expect(evaluation.score).toBeLessThan(50);
      expect(evaluation.improvements.length).toBeGreaterThan(0);
    });

    it("should recognize responses with examples", () => {
      const question = generateQuestions("Test", "Test")[1]; // explain question
      const response =
        "Ein Konzept ist wie ein Baustein. Zum Beispiel ist Addition ein mathematisches Konzept, das uns hilft, Zahlen zusammenzuzählen.";

      const evaluation = evaluateResponse(response, question);

      expect(evaluation.strengths.some((s) => s.includes("Beispiel"))).toBe(
        true,
      );
    });

    it("should recognize responses explaining connections", () => {
      const question = generateQuestions("Test", "Test")[0]; // why question
      const response =
        "Es ist wichtig, weil es die Grundlage bildet und zu besseren Ergebnissen führt, da es Zusammenhänge erklärt.";

      const evaluation = evaluateResponse(response, question);

      expect(
        evaluation.criteriaMatched.some((c) => c.includes("Zusammenhänge")),
      ).toBe(true);
    });

    it("should provide constructive feedback for all score ranges", () => {
      const question = generateQuestions("Test", "Test")[0];

      const responses = [
        "Ausführliche und detaillierte Antwort mit vielen Beispielen und Erklärungen über Zusammenhänge und praktische Bedeutung, weil es wichtig ist und zu Verbesserungen führt.",
        "Mittelmäßige Antwort mit einigen Details und einem Beispiel.",
        "Kurze Antwort ohne viel Detail.",
        "Sehr kurz.",
      ];

      for (const response of responses) {
        const evaluation = evaluateResponse(response, question);
        expect(evaluation.feedback).toBeTruthy();
        expect(evaluation.feedback.length).toBeGreaterThan(10);
      }
    });
  });

  describe("calculateSessionScore", () => {
    it("should calculate average score from evaluations", () => {
      const session: InterrogationSession = {
        id: "test-1",
        word: "Test",
        explanation: "Test explanation",
        startTime: new Date().toISOString(),
        questions: generateQuestions("Test", "Test explanation"),
        responses: {},
        evaluations: {
          q1: {
            score: 80,
            feedback: "Good",
            strengths: [],
            improvements: [],
            criteriaMatched: [],
          },
          q2: {
            score: 60,
            feedback: "OK",
            strengths: [],
            improvements: [],
            criteriaMatched: [],
          },
          q3: {
            score: 90,
            feedback: "Excellent",
            strengths: [],
            improvements: [],
            criteriaMatched: [],
          },
        },
        overallScore: 0,
        completed: false,
      };

      const score = calculateSessionScore(session);
      expect(score).toBe(77); // (80 + 60 + 90) / 3 = 76.67 rounded to 77
    });

    it("should return 0 for session with no evaluations", () => {
      const session: InterrogationSession = {
        id: "test-1",
        word: "Test",
        explanation: "Test explanation",
        startTime: new Date().toISOString(),
        questions: generateQuestions("Test", "Test explanation"),
        responses: {},
        evaluations: {},
        overallScore: 0,
        completed: false,
      };

      const score = calculateSessionScore(session);
      expect(score).toBe(0);
    });
  });

  describe("getQuestionTypeStats", () => {
    it("should calculate average scores per question type", () => {
      const sessions: InterrogationSession[] = [
        {
          id: "s1",
          word: "Test",
          explanation: "Test",
          startTime: new Date().toISOString(),
          questions: [
            {
              id: "q1",
              type: "why",
              question: "Why?",
              context: "Test",
              evaluationCriteria: [],
            },
            {
              id: "q2",
              type: "explain",
              question: "Explain",
              context: "Test",
              evaluationCriteria: [],
            },
          ],
          responses: {},
          evaluations: {
            q1: {
              score: 80,
              feedback: "Good",
              strengths: [],
              improvements: [],
              criteriaMatched: [],
            },
            q2: {
              score: 60,
              feedback: "OK",
              strengths: [],
              improvements: [],
              criteriaMatched: [],
            },
          },
          overallScore: 70,
          completed: true,
        },
      ];

      const stats = getQuestionTypeStats(sessions);

      expect(stats.why.averageScore).toBe(80);
      expect(stats.why.count).toBe(1);
      expect(stats.explain.averageScore).toBe(60);
      expect(stats.explain.count).toBe(1);
    });

    it("should handle sessions with no evaluations", () => {
      const sessions: InterrogationSession[] = [];
      const stats = getQuestionTypeStats(sessions);

      expect(stats.why.averageScore).toBe(0);
      expect(stats.why.count).toBe(0);
    });
  });

  describe("getImprovementRate", () => {
    it("should calculate improvement rate between first and last sessions", () => {
      const sessions: InterrogationSession[] = [
        {
          id: "s1",
          word: "Test1",
          explanation: "Test",
          startTime: "2024-01-01T10:00:00Z",
          questions: [],
          responses: {},
          evaluations: {},
          overallScore: 50,
          completed: true,
        },
        {
          id: "s2",
          word: "Test2",
          explanation: "Test",
          startTime: "2024-01-02T10:00:00Z",
          questions: [],
          responses: {},
          evaluations: {},
          overallScore: 60,
          completed: true,
        },
        {
          id: "s3",
          word: "Test3",
          explanation: "Test",
          startTime: "2024-01-03T10:00:00Z",
          questions: [],
          responses: {},
          evaluations: {},
          overallScore: 75,
          completed: true,
        },
      ];

      const rate = getImprovementRate(sessions);
      expect(rate).toBeGreaterThan(0); // Should show improvement
    });

    it("should return 0 for less than 2 sessions", () => {
      const sessions: InterrogationSession[] = [
        {
          id: "s1",
          word: "Test",
          explanation: "Test",
          startTime: new Date().toISOString(),
          questions: [],
          responses: {},
          evaluations: {},
          overallScore: 50,
          completed: true,
        },
      ];

      const rate = getImprovementRate(sessions);
      expect(rate).toBe(0);
    });

    it("should handle negative improvement (decline in performance)", () => {
      const sessions: InterrogationSession[] = [
        {
          id: "s1",
          word: "Test1",
          explanation: "Test",
          startTime: "2024-01-01T10:00:00Z",
          questions: [],
          responses: {},
          evaluations: {},
          overallScore: 80,
          completed: true,
        },
        {
          id: "s2",
          word: "Test2",
          explanation: "Test",
          startTime: "2024-01-02T10:00:00Z",
          questions: [],
          responses: {},
          evaluations: {},
          overallScore: 60,
          completed: true,
        },
      ];

      const rate = getImprovementRate(sessions);
      expect(rate).toBeLessThan(0); // Should show decline
    });
  });
});
