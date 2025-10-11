import {Node, Edge} from "@xyflow/react";
import {WordWithExplanation} from "@/components/List/types";

export interface MindMapNode extends Node {
  data: {
    label: string;
    type: "root" | "letter" | "word" | "kawa-letter" | "kawa-word";
    sourceId?: string; // ID of the source list/kawa
    sourceType?: "abc-list" | "kawa";
    letterContext?: string;
  };
}

export interface MindMapData {
  nodes: MindMapNode[];
  edges: Edge[];
}

/**
 * Generate mind map from ABC-List data
 */
export function generateMindMapFromList(
  listName: string,
  words: Record<string, WordWithExplanation[]>,
): MindMapData {
  const nodes: MindMapNode[] = [];
  const edges: Edge[] = [];

  // Root node (list name)
  nodes.push({
    id: "root",
    position: {x: 400, y: 50},
    data: {
      label: listName,
      type: "root",
      sourceId: listName,
      sourceType: "abc-list",
    },
    type: "default",
  });

  // Calculate positions in a radial layout
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const lettersWithWords = alphabet.filter(
    (letter) => words[letter] && words[letter].length > 0,
  );

  const radius = 200;
  const angleStep = (2 * Math.PI) / Math.max(lettersWithWords.length, 1);

  lettersWithWords.forEach((letter, index) => {
    const letterWords = words[letter] || [];
    if (letterWords.length === 0) return;

    const angle = index * angleStep;
    const letterX = 400 + radius * Math.cos(angle);
    const letterY = 200 + radius * Math.sin(angle);

    // Letter node
    const letterNodeId = `letter-${letter}`;
    nodes.push({
      id: letterNodeId,
      position: {x: letterX, y: letterY},
      data: {
        label: letter.toUpperCase(),
        type: "letter",
        sourceId: listName,
        sourceType: "abc-list",
        letterContext: letter,
      },
      type: "default",
    });

    // Edge from root to letter
    edges.push({
      id: `edge-root-${letter}`,
      source: "root",
      target: letterNodeId,
      type: "smoothstep",
    });

    // Word nodes (first 3 words per letter to avoid clutter)
    const displayWords = letterWords.slice(0, 3);
    displayWords.forEach((word, wordIndex) => {
      const wordNodeId = `word-${letter}-${wordIndex}`;
      const wordAngle = angle + (wordIndex - 1) * 0.3;
      const wordRadius = radius + 100;
      const wordX = 400 + wordRadius * Math.cos(wordAngle);
      const wordY = 200 + wordRadius * Math.sin(wordAngle);

      nodes.push({
        id: wordNodeId,
        position: {x: wordX, y: wordY},
        data: {
          label: word.text,
          type: "word",
          sourceId: listName,
          sourceType: "abc-list",
          letterContext: letter,
        },
        type: "default",
      });

      edges.push({
        id: `edge-${letterNodeId}-${wordNodeId}`,
        source: letterNodeId,
        target: wordNodeId,
        type: "smoothstep",
      });
    });
  });

  return {nodes, edges};
}

/**
 * Generate mind map from KaWa data
 */
export function generateMindMapFromKawa(
  kawaWord: string,
  associations: Record<string, string>,
): MindMapData {
  const nodes: MindMapNode[] = [];
  const edges: Edge[] = [];

  // Root node (KaWa word)
  nodes.push({
    id: "root",
    position: {x: 400, y: 50},
    data: {
      label: kawaWord.toUpperCase(),
      type: "root",
      sourceId: kawaWord,
      sourceType: "kawa",
    },
    type: "default",
  });

  const letters = kawaWord.split("");
  const angleStep = (2 * Math.PI) / Math.max(letters.length, 1);
  const radius = 200;

  letters.forEach((letter, index) => {
    const association = associations[letter] || "";
    if (!association) return;

    const angle = index * angleStep;
    const letterX = 400 + radius * Math.cos(angle);
    const letterY = 200 + radius * Math.sin(angle);

    // Letter node
    const letterNodeId = `kawa-letter-${index}`;
    nodes.push({
      id: letterNodeId,
      position: {x: letterX, y: letterY},
      data: {
        label: letter.toUpperCase(),
        type: "kawa-letter",
        sourceId: kawaWord,
        sourceType: "kawa",
      },
      type: "default",
    });

    edges.push({
      id: `edge-root-${index}`,
      source: "root",
      target: letterNodeId,
      type: "smoothstep",
    });

    // Association node
    const assocNodeId = `kawa-assoc-${index}`;
    const assocX = 400 + (radius + 150) * Math.cos(angle);
    const assocY = 200 + (radius + 150) * Math.sin(angle);

    nodes.push({
      id: assocNodeId,
      position: {x: assocX, y: assocY},
      data: {
        label: association,
        type: "kawa-word",
        sourceId: kawaWord,
        sourceType: "kawa",
      },
      type: "default",
    });

    edges.push({
      id: `edge-${letterNodeId}-${assocNodeId}`,
      source: letterNodeId,
      target: assocNodeId,
      type: "smoothstep",
    });
  });

  return {nodes, edges};
}

/**
 * Generate combined mind map from multiple sources
 */
export function generateCombinedMindMap(sources: {
  lists?: Array<{name: string; words: Record<string, WordWithExplanation[]>}>;
  kawas?: Array<{word: string; associations: Record<string, string>}>;
}): MindMapData {
  const nodes: MindMapNode[] = [];
  const edges: Edge[] = [];

  // Central root node
  nodes.push({
    id: "root",
    position: {x: 500, y: 300},
    data: {
      label: "Meine Wissensbasis",
      type: "root",
    },
    type: "default",
  });

  // Add ABC-Lists
  if (sources.lists && sources.lists.length > 0) {
    sources.lists.forEach((list, listIndex) => {
      const listNodeId = `list-${listIndex}`;
      const listAngle = (listIndex * 2 * Math.PI) / sources.lists!.length;
      const listX = 500 + 250 * Math.cos(listAngle);
      const listY = 300 + 250 * Math.sin(listAngle);

      nodes.push({
        id: listNodeId,
        position: {x: listX, y: listY},
        data: {
          label: list.name,
          type: "root",
          sourceId: list.name,
          sourceType: "abc-list",
        },
        type: "default",
      });

      edges.push({
        id: `edge-root-${listNodeId}`,
        source: "root",
        target: listNodeId,
        type: "smoothstep",
      });
    });
  }

  // Add KaWas
  if (sources.kawas && sources.kawas.length > 0) {
    const offset = sources.lists?.length || 0;
    sources.kawas.forEach((kawa, kawaIndex) => {
      const kawaNodeId = `kawa-${kawaIndex}`;
      const totalItems = (sources.lists?.length || 0) + sources.kawas!.length;
      const kawaAngle = ((offset + kawaIndex) * 2 * Math.PI) / totalItems;
      const kawaX = 500 + 250 * Math.cos(kawaAngle);
      const kawaY = 300 + 250 * Math.sin(kawaAngle);

      nodes.push({
        id: kawaNodeId,
        position: {x: kawaX, y: kawaY},
        data: {
          label: kawa.word.toUpperCase(),
          type: "root",
          sourceId: kawa.word,
          sourceType: "kawa",
        },
        type: "default",
      });

      edges.push({
        id: `edge-root-${kawaNodeId}`,
        source: "root",
        target: kawaNodeId,
        type: "smoothstep",
      });
    });
  }

  return {nodes, edges};
}
