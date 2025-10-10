/**
 * Interleaved Learning Algorithm
 * Implements scientifically-backed interleaving strategy for optimal learning
 * by mixing topics/subjects to enhance retention and understanding
 */

export interface InterleavingSettings {
  enabled: boolean;
  contextSwitchFrequency: number; // How often to switch topics (1-5)
  minTopicsToInterleave: number; // Minimum topics needed to enable interleaving
  shuffleIntensity: number; // How aggressive to shuffle (1-5)
}

export interface TopicGroup {
  topic: string; // List name or subject area
  terms: unknown[];
  weight: number; // Priority/importance weight
}

export interface InterleavedSequence<T> {
  sequence: T[];
  topicDistribution: Record<string, number>;
  contextSwitches: number;
  effectiveness: number; // 0-1 score
}

// Default settings based on interleaved learning research
export const DEFAULT_INTERLEAVING_SETTINGS: InterleavingSettings = {
  enabled: true,
  contextSwitchFrequency: 3, // Moderate switching
  minTopicsToInterleave: 2, // Need at least 2 topics
  shuffleIntensity: 3, // Balanced shuffling
};

/**
 * Calculate interleaving effectiveness score based on topic distribution
 */
function calculateEffectiveness(
  topicDistribution: Record<string, number>,
  totalTerms: number,
): number {
  const topics = Object.keys(topicDistribution);
  if (topics.length < 2) return 0; // No interleaving possible

  // Calculate variance in topic distribution (lower is better for even distribution)
  const avgPerTopic = totalTerms / topics.length;
  const variance =
    topics.reduce((sum, topic) => {
      const diff = topicDistribution[topic] - avgPerTopic;
      return sum + diff * diff;
    }, 0) / topics.length;

  // Normalize to 0-1 scale (lower variance = higher effectiveness)
  const maxVariance = avgPerTopic * avgPerTopic * (topics.length - 1);
  return Math.max(0, 1 - variance / maxVariance);
}

/**
 * Generate interleaved sequence from multiple topic groups
 * Uses balanced interleaving strategy to maximize learning effectiveness
 */
export function generateInterleavedSequence<T>(
  topicGroups: TopicGroup[],
  settings: InterleavingSettings = DEFAULT_INTERLEAVING_SETTINGS,
): InterleavedSequence<T> {
  // Filter out empty topics
  const validTopics = topicGroups.filter((g) => g.terms.length > 0);

  // If not enough topics or disabled, return sequential
  if (
    !settings.enabled ||
    validTopics.length < settings.minTopicsToInterleave
  ) {
    const sequence = validTopics.flatMap((g) => g.terms) as T[];
    const topicDistribution = validTopics.reduce(
      (acc, g) => {
        acc[g.topic] = g.terms.length;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      sequence,
      topicDistribution,
      contextSwitches: 0,
      effectiveness: 0,
    };
  }

  const sequence: T[] = [];
  const topicDistribution: Record<string, number> = {};
  let contextSwitches = 0;
  let lastTopic = "";

  // Create working copy of topic queues
  const queues = validTopics.map((g) => ({
    topic: g.topic,
    terms: [...g.terms],
    weight: g.weight,
  }));

  // Initialize distribution tracking
  queues.forEach((q) => {
    topicDistribution[q.topic] = 0;
  });

  // Interleaving algorithm based on weighted round-robin with shuffling
  while (queues.some((q) => q.terms.length > 0)) {
    // Calculate available topics (non-empty queues)
    const availableTopics = queues.filter((q) => q.terms.length > 0);

    if (availableTopics.length === 0) break;

    // Calculate selection probabilities based on weights and shuffle intensity
    const totalWeight = availableTopics.reduce((sum, q) => sum + q.weight, 0);
    const probabilities = availableTopics.map((q) => ({
      topic: q,
      probability:
        (q.weight / totalWeight) * (1 + settings.shuffleIntensity * 0.1),
    }));

    // Prefer switching topics based on context switch frequency
    const shouldSwitchContext =
      lastTopic &&
      sequence.length % settings.contextSwitchFrequency === 0 &&
      availableTopics.length > 1;

    let selectedTopic = availableTopics[0];

    if (shouldSwitchContext) {
      // Select different topic than last one
      const otherTopics = availableTopics.filter((q) => q.topic !== lastTopic);
      if (otherTopics.length > 0) {
        // Weighted random selection from other topics
        const rand = Math.random();
        let cumulative = 0;
        for (const prob of probabilities) {
          if (prob.topic.topic === lastTopic) continue;
          cumulative += prob.probability;
          if (rand <= cumulative) {
            selectedTopic = prob.topic;
            break;
          }
        }
      }
    } else {
      // Weighted selection from all available topics
      const rand = Math.random() * totalWeight;
      let cumulative = 0;
      for (const prob of probabilities) {
        cumulative += prob.topic.weight;
        if (rand <= cumulative) {
          selectedTopic = prob.topic;
          break;
        }
      }
    }

    // Add term from selected topic
    const term = selectedTopic.terms.shift();
    if (term) {
      sequence.push(term as T);
      topicDistribution[selectedTopic.topic]++;

      // Track context switches
      if (lastTopic && lastTopic !== selectedTopic.topic) {
        contextSwitches++;
      }
      lastTopic = selectedTopic.topic;
    }
  }

  const effectiveness = calculateEffectiveness(
    topicDistribution,
    sequence.length,
  );

  return {
    sequence,
    topicDistribution,
    contextSwitches,
    effectiveness,
  };
}

/**
 * Analyze performance metrics for interleaved learning sessions
 */
export interface PerformanceMetrics {
  topicName: string;
  correctCount: number;
  totalCount: number;
  accuracy: number;
  avgResponseTime: number;
}

export function analyzeInterleavingPerformance(
  sessionResults: Array<{
    topic: string;
    correct: boolean;
    responseTime: number;
  }>,
): PerformanceMetrics[] {
  const topicStats: Record<
    string,
    {correct: number; total: number; totalTime: number}
  > = {};

  sessionResults.forEach((result) => {
    if (!topicStats[result.topic]) {
      topicStats[result.topic] = {correct: 0, total: 0, totalTime: 0};
    }
    topicStats[result.topic].total++;
    topicStats[result.topic].totalTime += result.responseTime;
    if (result.correct) {
      topicStats[result.topic].correct++;
    }
  });

  return Object.entries(topicStats).map(([topic, stats]) => ({
    topicName: topic,
    correctCount: stats.correct,
    totalCount: stats.total,
    accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
    avgResponseTime: stats.total > 0 ? stats.totalTime / stats.total : 0,
  }));
}

/**
 * Generate recommendations based on performance analysis
 */
export function generateInterleavingRecommendations(
  metrics: PerformanceMetrics[],
): string[] {
  const recommendations: string[] = [];

  // Analyze accuracy patterns
  const lowAccuracyTopics = metrics.filter((m) => m.accuracy < 0.6);
  if (lowAccuracyTopics.length > 0) {
    recommendations.push(
      `Fokus auf schwächere Themen: ${lowAccuracyTopics.map((t) => t.topicName).join(", ")}`,
    );
  }

  // Analyze response time
  if (metrics.length > 0) {
    const avgResponseTime =
      metrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / metrics.length;
    const slowTopics = metrics.filter(
      (m) => m.avgResponseTime > avgResponseTime * 1.5,
    );
    if (slowTopics.length > 0) {
      recommendations.push(
        `Zeitintensive Themen für vertieftes Üben: ${slowTopics.map((t) => t.topicName).join(", ")}`,
      );
    }
  }

  // Check for balanced practice
  const minCount = Math.min(...metrics.map((m) => m.totalCount));
  const maxCount = Math.max(...metrics.map((m) => m.totalCount));
  if (maxCount > minCount * 2) {
    recommendations.push(
      "Empfehlung: Gleichmäßigere Verteilung der Übungszeit über alle Themen",
    );
  }

  // Overall assessment
  const avgAccuracy =
    metrics.reduce((sum, m) => sum + m.accuracy, 0) / metrics.length;
  if (avgAccuracy >= 0.8) {
    recommendations.push(
      "Exzellente Gesamtleistung! Interleaving zeigt positive Effekte.",
    );
  } else if (avgAccuracy >= 0.6) {
    recommendations.push(
      "Gute Fortschritte. Weiter mit Interleaved Learning für optimale Retention.",
    );
  } else {
    recommendations.push(
      "Tipp: Reduzieren Sie die Anzahl paralleler Themen für besseren Fokus.",
    );
  }

  return recommendations;
}
