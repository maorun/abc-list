// ElaborativeInterrogationService - Manages interrogation sessions and persistence
import {
  InterrogationSession,
  InterrogationQuestion,
  InterrogationEvaluation,
  InterrogationStatistics,
  generateQuestions,
  evaluateResponse,
  calculateSessionScore,
  getQuestionTypeStats,
  getImprovementRate,
  INTERROGATION_STORAGE_KEY,
} from "./elaborativeInterrogation";

type EventListener = () => void;

export class ElaborativeInterrogationService {
  private static instance: ElaborativeInterrogationService;
  private listeners: EventListener[] = [];
  private sessionCounter = 0;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): ElaborativeInterrogationService {
    if (!ElaborativeInterrogationService.instance) {
      ElaborativeInterrogationService.instance =
        new ElaborativeInterrogationService();
    }
    return ElaborativeInterrogationService.instance;
  }

  // For testing: reset the singleton instance
  public static resetInstance(): void {
    ElaborativeInterrogationService.instance =
      null as unknown as ElaborativeInterrogationService;
  }

  // Event listeners
  public addListener(listener: EventListener): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: EventListener): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  // Start a new interrogation session
  public startSession(word: string, explanation: string): InterrogationSession {
    const questions = generateQuestions(word, explanation);
    const session: InterrogationSession = {
      id: `session-${Date.now()}-${this.sessionCounter++}`,
      word,
      explanation,
      startTime: new Date().toISOString(),
      questions,
      responses: {},
      evaluations: {},
      overallScore: 0,
      completed: false,
    };

    this.saveSession(session);
    this.notifyListeners();
    return session;
  }

  // Submit response to a question
  public submitResponse(
    sessionId: string,
    questionId: string,
    response: string,
  ): InterrogationEvaluation {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const question = session.questions.find((q) => q.id === questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    // Save response
    session.responses[questionId] = response;

    // Evaluate response
    const evaluation = evaluateResponse(response, question);
    session.evaluations[questionId] = evaluation;

    // Update session
    this.saveSession(session);
    this.notifyListeners();

    return evaluation;
  }

  // Complete a session
  public completeSession(sessionId: string): InterrogationSession {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    session.endTime = new Date().toISOString();
    session.completed = true;
    session.overallScore = calculateSessionScore(session);

    this.saveSession(session);
    this.notifyListeners();

    return session;
  }

  // Get a specific session
  public getSession(sessionId: string): InterrogationSession | null {
    const sessions = this.getAllSessions();
    return sessions.find((s) => s.id === sessionId) || null;
  }

  // Get all sessions
  public getAllSessions(): InterrogationSession[] {
    try {
      const data = localStorage.getItem(INTERROGATION_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to load interrogation sessions:", error);
      return [];
    }
  }

  // Get sessions for a specific word
  public getSessionsForWord(word: string): InterrogationSession[] {
    const sessions = this.getAllSessions();
    return sessions.filter((s) => s.word.toLowerCase() === word.toLowerCase());
  }

  // Save session
  private saveSession(session: InterrogationSession): void {
    const sessions = this.getAllSessions();
    const index = sessions.findIndex((s) => s.id === session.id);

    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }

    localStorage.setItem(INTERROGATION_STORAGE_KEY, JSON.stringify(sessions));
  }

  // Delete a session
  public deleteSession(sessionId: string): void {
    const sessions = this.getAllSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    localStorage.setItem(INTERROGATION_STORAGE_KEY, JSON.stringify(filtered));
    this.notifyListeners();
  }

  // Get statistics
  public getStatistics(): InterrogationStatistics {
    const sessions = this.getAllSessions();
    const completedSessions = sessions.filter((s) => s.completed);

    if (completedSessions.length === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        questionsAnswered: 0,
        strongestQuestionType: "none",
        weakestQuestionType: "none",
        improvementRate: 0,
      };
    }

    const averageScore =
      completedSessions.reduce((sum, s) => sum + s.overallScore, 0) /
      completedSessions.length;

    const questionsAnswered = completedSessions.reduce(
      (sum, s) => sum + Object.keys(s.responses).length,
      0,
    );

    const typeStats = getQuestionTypeStats(completedSessions);
    const typeEntries = Object.entries(typeStats).filter(
      ([, stats]) => stats.count > 0,
    );

    let strongestType = "none";
    let weakestType = "none";

    if (typeEntries.length > 0) {
      typeEntries.sort((a, b) => b[1].averageScore - a[1].averageScore);
      strongestType = typeEntries[0][0];
      weakestType = typeEntries[typeEntries.length - 1][0];
    }

    const improvementRate = getImprovementRate(completedSessions);

    return {
      totalSessions: completedSessions.length,
      averageScore: Math.round(averageScore),
      questionsAnswered,
      strongestQuestionType: strongestType,
      weakestQuestionType: weakestType,
      improvementRate,
    };
  }

  // Get next question for session
  public getNextUnansweredQuestion(
    sessionId: string,
  ): InterrogationQuestion | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    return session.questions.find((q) => !session.responses[q.id]) || null;
  }

  // Get session progress (percentage of questions answered)
  public getSessionProgress(sessionId: string): number {
    const session = this.getSession(sessionId);
    if (!session || session.questions.length === 0) return 0;

    const answeredCount = Object.keys(session.responses).length;
    return Math.round((answeredCount / session.questions.length) * 100);
  }
}
