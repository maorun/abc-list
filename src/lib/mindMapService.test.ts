import {describe, it, expect} from "vitest";
import {
  generateMindMapFromList,
  generateMindMapFromKawa,
  generateCombinedMindMap,
} from "@/lib/mindMapService";
import {WordWithExplanation} from "@/components/List/types";

describe("mindMapService", () => {
  describe("generateMindMapFromList", () => {
    it("should generate mind map nodes and edges from ABC-List", () => {
      const words: Record<string, WordWithExplanation[]> = {
        a: [
          {text: "Apple", explanation: "A fruit", version: 1, imported: false},
          {text: "Ant", explanation: "An insect", version: 1, imported: false},
        ],
        b: [{text: "Ball", explanation: "A toy", version: 1, imported: false}],
        c: [],
      };

      const result = generateMindMapFromList("Test List", words);

      // Should have root node
      expect(result.nodes).toHaveLength(6); // 1 root + 2 letters + 3 words (max 3 per letter)
      expect(result.nodes[0]).toMatchObject({
        id: "root",
        data: {
          label: "Test List",
          type: "root",
          sourceType: "abc-list",
        },
      });

      // Should have letter nodes
      const letterANode = result.nodes.find((n) => n.id === "letter-a");
      expect(letterANode).toBeDefined();
      expect(letterANode?.data.type).toBe("letter");

      // Should have word nodes
      const wordNodes = result.nodes.filter((n) => n.data.type === "word");
      expect(wordNodes).toHaveLength(3);

      // Should have edges connecting nodes
      expect(result.edges.length).toBeGreaterThan(0);
      const rootToLetterEdge = result.edges.find(
        (e) => e.source === "root" && e.target.startsWith("letter-"),
      );
      expect(rootToLetterEdge).toBeDefined();
    });

    it("should handle empty lists", () => {
      const words: Record<string, WordWithExplanation[]> = {};

      const result = generateMindMapFromList("Empty List", words);

      // Should only have root node
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].id).toBe("root");
      expect(result.edges).toHaveLength(0);
    });

    it("should limit words per letter to 3", () => {
      const words: Record<string, WordWithExplanation[]> = {
        a: [
          {text: "Apple", explanation: "", version: 1, imported: false},
          {text: "Ant", explanation: "", version: 1, imported: false},
          {text: "Alligator", explanation: "", version: 1, imported: false},
          {text: "Airplane", explanation: "", version: 1, imported: false},
          {text: "Arrow", explanation: "", version: 1, imported: false},
        ],
      };

      const result = generateMindMapFromList("Test List", words);

      // Should have 1 root + 1 letter + 3 words max
      const wordNodes = result.nodes.filter((n) => n.data.type === "word");
      expect(wordNodes).toHaveLength(3);
    });
  });

  describe("generateMindMapFromKawa", () => {
    it("should generate mind map from KaWa associations", () => {
      const associations = {
        L: "Lernen",
        E: "Erfolg",
        R: "Routine",
        N: "Nutzen",
      };

      const result = generateMindMapFromKawa("LERN", associations);

      // Should have root node
      expect(result.nodes[0]).toMatchObject({
        id: "root",
        data: {
          label: "LERN",
          type: "root",
          sourceType: "kawa",
        },
      });

      // Should have nodes for each letter with association
      const kawaLetterNodes = result.nodes.filter(
        (n) => n.data.type === "kawa-letter",
      );
      expect(kawaLetterNodes).toHaveLength(4);

      const kawaWordNodes = result.nodes.filter(
        (n) => n.data.type === "kawa-word",
      );
      expect(kawaWordNodes).toHaveLength(4);

      // Should have edges
      expect(result.edges.length).toBeGreaterThan(0);
    });

    it("should skip letters without associations", () => {
      const associations = {
        L: "Lernen",
        E: "", // Empty association
        R: "Routine",
      };

      const result = generateMindMapFromKawa("LER", associations);

      // Should only create nodes for letters with associations
      const kawaWordNodes = result.nodes.filter(
        (n) => n.data.type === "kawa-word",
      );
      expect(kawaWordNodes).toHaveLength(2); // Only L and R
    });
  });

  describe("generateCombinedMindMap", () => {
    it("should generate combined mind map from multiple lists", () => {
      const lists = [
        {
          name: "List 1",
          words: {
            a: [{text: "Apple", explanation: "", version: 1, imported: false}],
          },
        },
        {
          name: "List 2",
          words: {
            b: [{text: "Ball", explanation: "", version: 1, imported: false}],
          },
        },
      ];

      const result = generateCombinedMindMap({lists});

      // Should have central root node
      expect(result.nodes[0]).toMatchObject({
        id: "root",
        data: {
          label: "Meine Wissensbasis",
          type: "root",
        },
      });

      // Should have nodes for each list
      const listNodes = result.nodes.filter(
        (n) => n.id.startsWith("list-") && n.data.type === "root",
      );
      expect(listNodes).toHaveLength(2);

      // Should have edges from root to lists
      const rootToListEdges = result.edges.filter((e) => e.source === "root");
      expect(rootToListEdges).toHaveLength(2);
    });

    it("should combine lists and kawas", () => {
      const lists = [
        {
          name: "Test List",
          words: {
            a: [{text: "Apple", explanation: "", version: 1, imported: false}],
          },
        },
      ];

      const kawas = [
        {
          word: "TEST",
          associations: {
            T: "Testen",
            E: "Erfolg",
            S: "Systematisch",
            T: "Thorough",
          },
        },
      ];

      const result = generateCombinedMindMap({lists, kawas});

      // Should have both list and kawa nodes
      const listNodes = result.nodes.filter((n) => n.id.startsWith("list-"));
      const kawaNodes = result.nodes.filter((n) => n.id.startsWith("kawa-"));

      expect(listNodes).toHaveLength(1);
      expect(kawaNodes).toHaveLength(1);

      // Should have edges from root to both
      const rootEdges = result.edges.filter((e) => e.source === "root");
      expect(rootEdges).toHaveLength(2);
    });

    it("should handle empty sources", () => {
      const result = generateCombinedMindMap({});

      // Should only have root node
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].id).toBe("root");
      expect(result.edges).toHaveLength(0);
    });
  });
});
