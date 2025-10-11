import {describe, it, expect, beforeEach, vi} from "vitest";
import {ElaborativeInterrogationService} from "./ElaborativeInterrogationService";

describe("ElaborativeInterrogationService", () => {
  let service: ElaborativeInterrogationService;

  beforeEach(() => {
    localStorage.clear();
    ElaborativeInterrogationService.resetInstance();
    service = ElaborativeInterrogationService.getInstance();
  });

  describe("Singleton Pattern", () => {
    it("should return same instance", () => {
      const service1 = ElaborativeInterrogationService.getInstance();
      const service2 = ElaborativeInterrogationService.getInstance();
      expect(service1).toBe(service2);
    });

    it("should reset instance for testing", () => {
      const service1 = ElaborativeInterrogationService.getInstance();
      ElaborativeInterrogationService.resetInstance();
      const service2 = ElaborativeInterrogationService.getInstance();
      expect(service1).not.toBe(service2);
    });
  });

  describe("Session Management", () => {
    it("should start a new session", () => {
      const session = service.startSession(
        "Photosynthese",
        "Umwandlung von Lichtenergie",
      );

      expect(session.id).toBeTruthy();
      expect(session.word).toBe("Photosynthese");
      expect(session.explanation).toBe("Umwandlung von Lichtenergie");
      expect(session.questions).toHaveLength(5);
      expect(session.completed).toBe(false);
    });

    it("should save session to localStorage", () => {
      const session = service.startSession("Test", "Test explanation");
      const sessions = service.getAllSessions();

      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe(session.id);
    });

    it("should retrieve a specific session", () => {
      const session = service.startSession("Test", "Test explanation");
      const retrieved = service.getSession(session.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(session.id);
    });

    it("should return null for non-existent session", () => {
      const retrieved = service.getSession("non-existent");
      expect(retrieved).toBeNull();
    });

    it("should get sessions for a specific word", () => {
      service.startSession("Word1", "Explanation1");
      service.startSession("Word2", "Explanation2");
      service.startSession("Word1", "Explanation3");

      const sessions = service.getSessionsForWord("Word1");
      expect(sessions).toHaveLength(2);
    });
  });

  describe("Response Submission", () => {
    it("should submit and evaluate a response", () => {
      const session = service.startSession("Test", "Test explanation");
      const question = session.questions[0];

      const evaluation = service.submitResponse(
        session.id,
        question.id,
        "Dies ist eine ausführliche Antwort mit mindestens zwanzig Wörtern die das Konzept erklärt und praktische Beispiele nennt.",
      );

      expect(evaluation.score).toBeGreaterThan(0);
      expect(evaluation.feedback).toBeTruthy();
    });

    it("should save response to session", () => {
      const session = service.startSession("Test", "Test explanation");
      const question = session.questions[0];

      service.submitResponse(session.id, question.id, "Test response");

      const updated = service.getSession(session.id);
      expect(updated!.responses[question.id]).toBe("Test response");
    });

    it("should throw error for non-existent session", () => {
      expect(() => {
        service.submitResponse("non-existent", "q1", "response");
      }).toThrow("Session not found");
    });

    it("should throw error for non-existent question", () => {
      const session = service.startSession("Test", "Test explanation");

      expect(() => {
        service.submitResponse(session.id, "non-existent", "response");
      }).toThrow("Question not found");
    });
  });

  describe("Session Completion", () => {
    it("should complete a session", () => {
      const session = service.startSession("Test", "Test explanation");

      // Submit responses
      for (const question of session.questions) {
        service.submitResponse(
          session.id,
          question.id,
          "Dies ist eine ausführliche Testantwort mit genügend Wörtern.",
        );
      }

      const completed = service.completeSession(session.id);

      expect(completed.completed).toBe(true);
      expect(completed.endTime).toBeTruthy();
      expect(completed.overallScore).toBeGreaterThan(0);
    });

    it("should calculate overall score on completion", () => {
      const session = service.startSession("Test", "Test explanation");

      service.submitResponse(
        session.id,
        session.questions[0].id,
        "Sehr ausführliche Antwort mit vielen Details und praktischen Beispielen die zeigen dass ich das Konzept verstanden habe.",
      );

      const completed = service.completeSession(session.id);
      expect(completed.overallScore).toBeGreaterThan(0);
    });

    it("should throw error when completing non-existent session", () => {
      expect(() => {
        service.completeSession("non-existent");
      }).toThrow("Session not found");
    });
  });

  describe("Session Progress", () => {
    it("should calculate session progress", () => {
      const session = service.startSession("Test", "Test explanation");

      // Answer 2 out of 5 questions
      service.submitResponse(session.id, session.questions[0].id, "Answer 1");
      service.submitResponse(session.id, session.questions[1].id, "Answer 2");

      const progress = service.getSessionProgress(session.id);
      expect(progress).toBe(40); // 2/5 = 40%
    });

    it("should return 0 for session with no responses", () => {
      const session = service.startSession("Test", "Test explanation");
      const progress = service.getSessionProgress(session.id);
      expect(progress).toBe(0);
    });

    it("should return 0 for non-existent session", () => {
      const progress = service.getSessionProgress("non-existent");
      expect(progress).toBe(0);
    });

    it("should get next unanswered question", () => {
      const session = service.startSession("Test", "Test explanation");

      service.submitResponse(session.id, session.questions[0].id, "Answer 1");

      const nextQuestion = service.getNextUnansweredQuestion(session.id);
      expect(nextQuestion).not.toBeNull();
      expect(nextQuestion!.id).toBe(session.questions[1].id);
    });

    it("should return null when all questions are answered", () => {
      const session = service.startSession("Test", "Test explanation");

      for (const question of session.questions) {
        service.submitResponse(session.id, question.id, "Answer");
      }

      const nextQuestion = service.getNextUnansweredQuestion(session.id);
      expect(nextQuestion).toBeNull();
    });
  });

  describe("Session Deletion", () => {
    it("should delete a session", () => {
      const session = service.startSession("Test", "Test explanation");

      service.deleteSession(session.id);

      const retrieved = service.getSession(session.id);
      expect(retrieved).toBeNull();
    });

    it("should notify listeners on deletion", () => {
      const listener = vi.fn();
      service.addListener(listener);

      const session = service.startSession("Test", "Test explanation");
      listener.mockClear();

      service.deleteSession(session.id);

      expect(listener).toHaveBeenCalled();
    });
  });

  describe("Statistics", () => {
    it("should calculate statistics from completed sessions", () => {
      const session1 = service.startSession("Test1", "Explanation1");
      for (const question of session1.questions) {
        service.submitResponse(
          session1.id,
          question.id,
          "Ausführliche Antwort mit genügend Details und Beispielen.",
        );
      }
      service.completeSession(session1.id);

      const stats = service.getStatistics();

      expect(stats.totalSessions).toBe(1);
      expect(stats.averageScore).toBeGreaterThan(0);
      expect(stats.questionsAnswered).toBe(5);
    });

    it("should return zero stats for no sessions", () => {
      const stats = service.getStatistics();

      expect(stats.totalSessions).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.questionsAnswered).toBe(0);
      expect(stats.strongestQuestionType).toBe("none");
      expect(stats.weakestQuestionType).toBe("none");
    });

    it("should identify strongest and weakest question types", () => {
      const session = service.startSession("Test", "Test explanation");

      // Good response for why question
      service.submitResponse(
        session.id,
        session.questions[0].id,
        "Sehr gute Antwort weil sie Zusammenhänge erklärt und praktische Bedeutung zeigt mit vielen Details.",
      );

      // Poor response for explain question
      service.submitResponse(session.id, session.questions[1].id, "Kurz.");

      service.completeSession(session.id);

      const stats = service.getStatistics();
      expect(stats.strongestQuestionType).toBeTruthy();
      expect(stats.weakestQuestionType).toBeTruthy();
    });
  });

  describe("Event Listeners", () => {
    it("should notify listeners on session start", () => {
      const listener = vi.fn();
      service.addListener(listener);

      service.startSession("Test", "Test explanation");

      expect(listener).toHaveBeenCalled();
    });

    it("should notify listeners on response submission", () => {
      const listener = vi.fn();
      const session = service.startSession("Test", "Test explanation");

      service.addListener(listener);
      listener.mockClear();

      service.submitResponse(session.id, session.questions[0].id, "Response");

      expect(listener).toHaveBeenCalled();
    });

    it("should remove listeners", () => {
      const listener = vi.fn();
      service.addListener(listener);
      service.removeListener(listener);

      service.startSession("Test", "Test explanation");

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle corrupted localStorage data", () => {
      localStorage.setItem("elaborativeInterrogationSessions", "invalid json");

      const sessions = service.getAllSessions();
      expect(sessions).toEqual([]);
    });

    it("should handle missing localStorage", () => {
      const sessions = service.getAllSessions();
      expect(sessions).toEqual([]);
    });
  });
});
