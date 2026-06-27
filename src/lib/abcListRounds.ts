import {AbcListRound, WordWithExplanation} from "@/components/List/types";

const alphabet = Array.from({length: 26}, (_, index) =>
  String.fromCharCode(97 + index),
);

export interface RoundMergeSummary {
  newTerms: number;
  repeatedTerms: number;
  totalTerms: number;
}

export const createEmptyLetterMap = (): Record<
  string,
  WordWithExplanation[]
> => {
  return alphabet.reduce<Record<string, WordWithExplanation[]>>(
    (accumulator, letter) => {
      accumulator[letter] = [];
      return accumulator;
    },
    {},
  );
};

export const getAbcListRoundsStorageKey = (listName: string): string => {
  return `abcList-${listName}:rounds`;
};

export const getAbcListRoundCacheKey = (
  listName: string,
  roundNumber: number,
): string => {
  return `abcList-${listName}:round:${roundNumber}`;
};

const isValidRoundStatus = (
  status: string,
): status is AbcListRound["status"] => {
  return ["active", "merged", "cancelled"].includes(status);
};

const normalizeRound = (candidate: unknown): AbcListRound | null => {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const round = candidate as Partial<AbcListRound>;
  if (
    typeof round.roundNumber !== "number" ||
    typeof round.startedAt !== "string" ||
    typeof round.durationSeconds !== "number" ||
    typeof round.status !== "string" ||
    !isValidRoundStatus(round.status)
  ) {
    return null;
  }

  return {
    roundNumber: round.roundNumber,
    startedAt: round.startedAt,
    durationSeconds: round.durationSeconds,
    status: round.status,
    endedAt: round.endedAt,
    mergedAt: round.mergedAt,
    mergedWordCount: round.mergedWordCount,
  };
};

export const loadAbcListRounds = (listName: string): AbcListRound[] => {
  const stored = localStorage.getItem(getAbcListRoundsStorageKey(listName));
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((round) => normalizeRound(round))
      .filter((round): round is AbcListRound => round !== null)
      .sort((left, right) => left.roundNumber - right.roundNumber);
  } catch {
    return [];
  }
};

export const saveAbcListRounds = (
  listName: string,
  rounds: AbcListRound[],
): void => {
  localStorage.setItem(
    getAbcListRoundsStorageKey(listName),
    JSON.stringify(rounds),
  );
};

export const getActiveAbcListRound = (
  rounds: AbcListRound[],
): AbcListRound | null => {
  return rounds.find((round) => round.status === "active") ?? null;
};

export const getRemainingRoundTime = (round: AbcListRound): number => {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(round.startedAt).getTime()) / 1000),
  );

  return Math.max(0, round.durationSeconds - elapsedSeconds);
};

export const createAbcListRound = (
  listName: string,
  existingRounds: AbcListRound[],
  durationSeconds: number,
): {round: AbcListRound; rounds: AbcListRound[]} => {
  const nextRoundNumber =
    existingRounds.reduce((highestRound, round) => {
      return Math.max(highestRound, round.roundNumber);
    }, 0) + 1;

  const round: AbcListRound = {
    roundNumber: nextRoundNumber,
    startedAt: new Date().toISOString(),
    durationSeconds,
    status: "active",
  };

  const rounds = [
    ...existingRounds.filter((entry) => entry.status !== "active"),
    round,
  ];
  saveAbcListRounds(listName, rounds);

  return {round, rounds};
};

export const updateAbcListRound = (
  listName: string,
  roundNumber: number,
  updater: (round: AbcListRound) => AbcListRound,
): AbcListRound[] => {
  const updatedRounds = loadAbcListRounds(listName).map((round) => {
    if (round.roundNumber !== roundNumber) {
      return round;
    }

    return updater(round);
  });

  saveAbcListRounds(listName, updatedRounds);
  return updatedRounds;
};

export const discardAbcListRound = (
  listName: string,
  roundNumber: number,
): AbcListRound[] => {
  const remainingRounds = loadAbcListRounds(listName).filter(
    (round) => round.roundNumber !== roundNumber,
  );

  alphabet.forEach((letter) => {
    localStorage.removeItem(
      `${getAbcListRoundCacheKey(listName, roundNumber)}:${letter}`,
    );
  });

  saveAbcListRounds(listName, remainingRounds);
  return remainingRounds;
};

const createUniqueRoundList = (rounds: number[]): number[] => {
  return Array.from(new Set(rounds)).sort((left, right) => left - right);
};

export const mergeRoundWordsIntoList = (
  mainWords: Record<string, WordWithExplanation[]>,
  roundWords: Record<string, WordWithExplanation[]>,
  roundNumber: number,
): {
  mergedWords: Record<string, WordWithExplanation[]>;
  summary: RoundMergeSummary;
} => {
  const mergedWords = createEmptyLetterMap();
  const summary: RoundMergeSummary = {
    newTerms: 0,
    repeatedTerms: 0,
    totalTerms: 0,
  };

  alphabet.forEach((letter) => {
    const persistedWords = [...(mainWords[letter] ?? [])];
    const wordsFromRound = roundWords[letter] ?? [];

    wordsFromRound.forEach((roundWord) => {
      const existingIndex = persistedWords.findIndex(
        (word) => word.text === roundWord.text,
      );

      if (existingIndex === -1) {
        persistedWords.push({
          ...roundWord,
          createdInRound: roundNumber,
          repeatedInRounds: [],
        });
        summary.newTerms += 1;
        summary.totalTerms += 1;
        return;
      }

      const existingWord = persistedWords[existingIndex];
      const alreadyKnownInRound =
        existingWord.createdInRound === roundNumber ||
        (existingWord.repeatedInRounds ?? []).includes(roundNumber);

      if (alreadyKnownInRound) {
        return;
      }

      persistedWords[existingIndex] = {
        ...existingWord,
        repeatedInRounds: createUniqueRoundList([
          ...(existingWord.repeatedInRounds ?? []),
          roundNumber,
        ]),
      };
      summary.repeatedTerms += 1;
      summary.totalTerms += 1;
    });

    mergedWords[letter] = persistedWords;
  });

  return {mergedWords, summary};
};
