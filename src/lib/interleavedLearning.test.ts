import {describe, it, expect} from "vitest";
import {
  generateInterleavedSequence,
  analyzeInterleavingPerformance,
  generateInterleavingRecommendations,
  DEFAULT_INTERLEAVING_SETTINGS,
  TopicGroup,
  InterleavingSettings,
} from "./interleavedLearning";

describe("Interleaved Learning Algorithm", () => {
  describe("generateInterleavedSequence", () => {
    it("should return sequential order when disabled", () => {
      const topics: TopicGroup[] = [
        {topic: "Math", terms: ["1+1", "2+2"], weight: 1},
        {topic: "Science", terms: ["H2O", "CO2"], weight: 1},
      ];

      const settings: InterleavingSettings = {
        ...DEFAULT_INTERLEAVING_SETTINGS,
        enabled: false,
      };

      const result = generateInterleavedSequence(topics, settings);

      expect(result.sequence).toEqual(["1+1", "2+2", "H2O", "CO2"]);
      expect(result.contextSwitches).toBe(0);
      expect(result.effectiveness).toBe(0);
    });

    it("should return sequential order when not enough topics", () => {
      const topics: TopicGroup[] = [
        {topic: "Math", terms: ["1+1", "2+2"], weight: 1},
      ];

      const result = generateInterleavedSequence(topics);

      expect(result.sequence).toEqual(["1+1", "2+2"]);
      expect(result.contextSwitches).toBe(0);
      expect(result.effectiveness).toBe(0);
    });

    it("should interleave terms from multiple topics", () => {
      const topics: TopicGroup[] = [
        {topic: "Math", terms: ["1+1", "2+2", "3+3"], weight: 1},
        {topic: "Science", terms: ["H2O", "CO2", "O2"], weight: 1},
      ];

      const result = generateInterleavedSequence(topics);

      // Should have all terms
      expect(result.sequence).toHaveLength(6);
      expect(result.sequence).toContain("1+1");
      expect(result.sequence).toContain("H2O");

      // Should have context switches
      expect(result.contextSwitches).toBeGreaterThan(0);

      // Should have balanced distribution
      expect(result.topicDistribution["Math"]).toBe(3);
      expect(result.topicDistribution["Science"]).toBe(3);
    });

    it("should respect weighted topic priorities", () => {
      const topics: TopicGroup[] = [
        {topic: "Important", terms: Array(10).fill("A"), weight: 3},
        {topic: "Less Important", terms: Array(10).fill("B"), weight: 1},
      ];

      const result = generateInterleavedSequence(topics);

      // Both topics should be represented
      expect(result.topicDistribution["Important"]).toBe(10);
      expect(result.topicDistribution["Less Important"]).toBe(10);
    });

    it("should handle empty topic groups", () => {
      const topics: TopicGroup[] = [
        {topic: "Math", terms: ["1+1"], weight: 1},
        {topic: "Empty", terms: [], weight: 1},
        {topic: "Science", terms: ["H2O"], weight: 1},
      ];

      const result = generateInterleavedSequence(topics);

      expect(result.sequence).toHaveLength(2);
      expect(result.topicDistribution["Math"]).toBe(1);
      expect(result.topicDistribution["Science"]).toBe(1);
      expect(result.topicDistribution["Empty"]).toBeUndefined();
    });

    it("should adjust shuffling based on intensity", () => {
      const topics: TopicGroup[] = [
        {topic: "A", terms: ["A1", "A2", "A3"], weight: 1},
        {topic: "B", terms: ["B1", "B2", "B3"], weight: 1},
      ];

      const lowIntensity: InterleavingSettings = {
        ...DEFAULT_INTERLEAVING_SETTINGS,
        shuffleIntensity: 1,
      };

      const highIntensity: InterleavingSettings = {
        ...DEFAULT_INTERLEAVING_SETTINGS,
        shuffleIntensity: 5,
      };

      const resultLow = generateInterleavedSequence(topics, lowIntensity);
      const resultHigh = generateInterleavedSequence(topics, highIntensity);

      // Both should interleave
      expect(resultLow.contextSwitches).toBeGreaterThan(0);
      expect(resultHigh.contextSwitches).toBeGreaterThan(0);

      // Effectiveness should be similar for balanced topics
      expect(resultLow.effectiveness).toBeGreaterThan(0.5);
      expect(resultHigh.effectiveness).toBeGreaterThan(0.5);
    });

    it("should switch context based on frequency setting", () => {
      const topics: TopicGroup[] = [
        {topic: "A", terms: Array(10).fill("A"), weight: 1},
        {topic: "B", terms: Array(10).fill("B"), weight: 1},
      ];

      const frequentSwitching: InterleavingSettings = {
        ...DEFAULT_INTERLEAVING_SETTINGS,
        contextSwitchFrequency: 1, // Switch every term
      };

      const infrequentSwitching: InterleavingSettings = {
        ...DEFAULT_INTERLEAVING_SETTINGS,
        contextSwitchFrequency: 5, // Switch every 5 terms
      };

      // Run multiple times to account for randomness and take average
      const runs = 10;
      let totalFrequent = 0;
      let totalInfrequent = 0;

      for (let i = 0; i < runs; i++) {
        const resultFrequent = generateInterleavedSequence(
          topics,
          frequentSwitching,
        );
        const resultInfrequent = generateInterleavedSequence(
          topics,
          infrequentSwitching,
        );
        totalFrequent += resultFrequent.contextSwitches;
        totalInfrequent += resultInfrequent.contextSwitches;
      }

      const avgFrequent = totalFrequent / runs;
      const avgInfrequent = totalInfrequent / runs;

      // More frequent switching should have more context switches on average
      expect(avgFrequent).toBeGreaterThan(avgInfrequent);
    });

    it("should calculate effectiveness score correctly", () => {
      // Perfectly balanced topics
      const balanced: TopicGroup[] = [
        {topic: "A", terms: Array(5).fill("A"), weight: 1},
        {topic: "B", terms: Array(5).fill("B"), weight: 1},
      ];

      // Unbalanced topics
      const unbalanced: TopicGroup[] = [
        {topic: "A", terms: Array(9).fill("A"), weight: 1},
        {topic: "B", terms: Array(1).fill("B"), weight: 1},
      ];

      const balancedResult = generateInterleavedSequence(balanced);
      const unbalancedResult = generateInterleavedSequence(unbalanced);

      // Balanced should have higher effectiveness
      expect(balancedResult.effectiveness).toBeGreaterThan(
        unbalancedResult.effectiveness,
      );
      expect(balancedResult.effectiveness).toBeGreaterThan(0.9);
    });

    it("should handle many topics efficiently", () => {
      const topics: TopicGroup[] = Array.from({length: 10}, (_, i) => ({
        topic: `Topic${i}`,
        terms: Array(5).fill(`T${i}`),
        weight: 1,
      }));

      const result = generateInterleavedSequence(topics);

      // All terms should be included
      expect(result.sequence).toHaveLength(50);

      // All topics should be represented
      expect(Object.keys(result.topicDistribution)).toHaveLength(10);

      // Should have many context switches
      expect(result.contextSwitches).toBeGreaterThan(20);
    });
  });

  describe("analyzeInterleavingPerformance", () => {
    it("should calculate accuracy correctly", () => {
      const results = [
        {topic: "Math", correct: true, responseTime: 1000},
        {topic: "Math", correct: true, responseTime: 1200},
        {topic: "Math", correct: false, responseTime: 1500},
        {topic: "Science", correct: true, responseTime: 2000},
      ];

      const metrics = analyzeInterleavingPerformance(results);

      const mathMetrics = metrics.find((m) => m.topicName === "Math");
      const scienceMetrics = metrics.find((m) => m.topicName === "Science");

      expect(mathMetrics?.accuracy).toBeCloseTo(2 / 3);
      expect(scienceMetrics?.accuracy).toBe(1);
    });

    it("should calculate average response time", () => {
      const results = [
        {topic: "Math", correct: true, responseTime: 1000},
        {topic: "Math", correct: true, responseTime: 2000},
        {topic: "Science", correct: true, responseTime: 3000},
      ];

      const metrics = analyzeInterleavingPerformance(results);

      const mathMetrics = metrics.find((m) => m.topicName === "Math");
      expect(mathMetrics?.avgResponseTime).toBe(1500);
    });

    it("should handle empty results", () => {
      const metrics = analyzeInterleavingPerformance([]);
      expect(metrics).toEqual([]);
    });

    it("should track multiple topics", () => {
      const results = [
        {topic: "A", correct: true, responseTime: 1000},
        {topic: "B", correct: false, responseTime: 1000},
        {topic: "C", correct: true, responseTime: 1000},
      ];

      const metrics = analyzeInterleavingPerformance(results);

      expect(metrics).toHaveLength(3);
      expect(metrics.map((m) => m.topicName)).toContain("A");
      expect(metrics.map((m) => m.topicName)).toContain("B");
      expect(metrics.map((m) => m.topicName)).toContain("C");
    });
  });

  describe("generateInterleavingRecommendations", () => {
    it("should recommend focus on low accuracy topics", () => {
      const metrics = [
        {
          topicName: "Math",
          correctCount: 2,
          totalCount: 10,
          accuracy: 0.2,
          avgResponseTime: 1000,
        },
        {
          topicName: "Science",
          correctCount: 9,
          totalCount: 10,
          accuracy: 0.9,
          avgResponseTime: 1000,
        },
      ];

      const recommendations = generateInterleavingRecommendations(metrics);

      expect(recommendations.some((r) => r.includes("schwächere Themen"))).toBe(
        true,
      );
      expect(recommendations.some((r) => r.includes("Math"))).toBe(true);
    });

    it("should identify time-intensive topics", () => {
      const metrics = [
        {
          topicName: "Fast",
          correctCount: 5,
          totalCount: 5,
          accuracy: 1,
          avgResponseTime: 1000,
        },
        {
          topicName: "Slow",
          correctCount: 5,
          totalCount: 5,
          accuracy: 1,
          avgResponseTime: 4000,
        },
      ];

      const recommendations = generateInterleavingRecommendations(metrics);

      expect(
        recommendations.some((r) => r.includes("Zeitintensive Themen")),
      ).toBe(true);
      expect(recommendations.some((r) => r.includes("Slow"))).toBe(true);
    });

    it("should recommend balanced practice", () => {
      const metrics = [
        {
          topicName: "A",
          correctCount: 10,
          totalCount: 10,
          accuracy: 1,
          avgResponseTime: 1000,
        },
        {
          topicName: "B",
          correctCount: 2,
          totalCount: 2,
          accuracy: 1,
          avgResponseTime: 1000,
        },
      ];

      const recommendations = generateInterleavingRecommendations(metrics);

      expect(
        recommendations.some((r) => r.includes("Gleichmäßigere Verteilung")),
      ).toBe(true);
    });

    it("should congratulate on excellent performance", () => {
      const metrics = [
        {
          topicName: "A",
          correctCount: 9,
          totalCount: 10,
          accuracy: 0.9,
          avgResponseTime: 1000,
        },
        {
          topicName: "B",
          correctCount: 8,
          totalCount: 10,
          accuracy: 0.8,
          avgResponseTime: 1000,
        },
      ];

      const recommendations = generateInterleavingRecommendations(metrics);

      expect(
        recommendations.some((r) => r.includes("Exzellente Gesamtleistung")),
      ).toBe(true);
    });

    it("should suggest reducing topics for low performance", () => {
      const metrics = [
        {
          topicName: "A",
          correctCount: 3,
          totalCount: 10,
          accuracy: 0.3,
          avgResponseTime: 1000,
        },
        {
          topicName: "B",
          correctCount: 4,
          totalCount: 10,
          accuracy: 0.4,
          avgResponseTime: 1000,
        },
      ];

      const recommendations = generateInterleavingRecommendations(metrics);

      expect(
        recommendations.some((r) =>
          r.includes("Reduzieren Sie die Anzahl paralleler Themen"),
        ),
      ).toBe(true);
    });

    it("should provide multiple recommendations when appropriate", () => {
      const metrics = [
        {
          topicName: "A",
          correctCount: 2,
          totalCount: 10,
          accuracy: 0.2,
          avgResponseTime: 3000,
        },
        {
          topicName: "B",
          correctCount: 8,
          totalCount: 10,
          accuracy: 0.8,
          avgResponseTime: 1000,
        },
      ];

      const recommendations = generateInterleavingRecommendations(metrics);

      // Should have multiple recommendations
      expect(recommendations.length).toBeGreaterThan(1);
    });
  });
});
