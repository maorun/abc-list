import {beforeEach, describe, expect, it, vi} from "vitest";
import {
  createAbcListRound,
  createEmptyLetterMap,
  discardAbcListRound,
  getAbcListRoundCacheKey,
  getRemainingRoundTime,
  loadAbcListRounds,
  mergeRoundWordsIntoList,
} from "./abcListRounds";
import type {AbcListRound, WordWithExplanation} from "@/components/List/types";

describe("abcListRounds", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it("creates a new active round and persists metadata", () => {
    const {round, rounds} = createAbcListRound("Biologie", [], 120);

    expect(round.roundNumber).toBe(1);
    expect(round.status).toBe("active");
    expect(round.durationSeconds).toBe(120);
    expect(rounds).toHaveLength(1);
    expect(loadAbcListRounds("Biologie")).toEqual(rounds);
  });

  it("calculates remaining time for an active round", () => {
    vi.useFakeTimers();
    const startedAt = new Date("2026-01-01T10:00:00.000Z");
    vi.setSystemTime(new Date("2026-01-01T10:01:00.000Z"));

    const round: AbcListRound = {
      roundNumber: 2,
      startedAt: startedAt.toISOString(),
      durationSeconds: 120,
      status: "active",
    };

    expect(getRemainingRoundTime(round)).toBe(60);
  });

  it("merges new and repeated words into the main list", () => {
    const mainWords = createEmptyLetterMap();
    const roundWords = createEmptyLetterMap();

    mainWords.a = [
      {
        text: "Apfel",
        explanation: "Schon vorhanden",
        createdInRound: 1,
      },
    ];
    roundWords.a = [
      {text: "Apfel", explanation: "Wiederholt"},
      {text: "Anker", explanation: "Neu"},
    ];

    const {mergedWords, summary} = mergeRoundWordsIntoList(
      mainWords,
      roundWords,
      2,
    );

    const repeatedWord = mergedWords.a.find((word) => word.text === "Apfel");
    const newWord = mergedWords.a.find((word) => word.text === "Anker");

    expect(summary).toEqual({newTerms: 1, repeatedTerms: 1, totalTerms: 2});
    expect(repeatedWord?.repeatedInRounds).toEqual([2]);
    expect(newWord?.createdInRound).toBe(2);
  });

  it("does not duplicate repeated round markers", () => {
    const mainWords = createEmptyLetterMap();
    const roundWords = createEmptyLetterMap();

    mainWords.b = [
      {
        text: "Baum",
        createdInRound: 1,
        repeatedInRounds: [2],
      },
    ];
    roundWords.b = [{text: "Baum"}];

    const {mergedWords, summary} = mergeRoundWordsIntoList(
      mainWords,
      roundWords,
      2,
    );

    expect(summary).toEqual({newTerms: 0, repeatedTerms: 0, totalTerms: 0});
    expect(mergedWords.b[0].repeatedInRounds).toEqual([2]);
  });

  it("discards an unfinished round and removes round storage", () => {
    const {round} = createAbcListRound("Geschichte", [], 90);
    const roundStorageKey = `${getAbcListRoundCacheKey("Geschichte", round.roundNumber)}:a`;
    const roundWords: WordWithExplanation[] = [{text: "Antike"}];

    localStorage.setItem(roundStorageKey, JSON.stringify(roundWords));

    const updatedRounds = discardAbcListRound("Geschichte", round.roundNumber);

    expect(updatedRounds).toEqual([]);
    expect(loadAbcListRounds("Geschichte")).toEqual([]);
    expect(localStorage.getItem(roundStorageKey)).toBeNull();
  });
});
