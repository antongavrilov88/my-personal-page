import { describe, it, expect } from 'vitest';
import {
  applySteps,
  bubbleSortSteps,
  insertionSortSteps,
  mergeSortSteps,
  quickSortSteps,
  selectionSortSteps,
  shuffledArray,
  type SortStep,
} from './sorting';

const ALGORITHMS: Record<string, (input: number[]) => SortStep[]> = {
  bubble: bubbleSortSteps,
  insertion: insertionSortSteps,
  selection: selectionSortSteps,
  quick: quickSortSteps,
  merge: mergeSortSteps,
};

const SIZES = [1, 2, 8, 33, 64];
const SEEDS = [1, 7, 42];

describe.each(Object.entries(ALGORITHMS))('%s sort', (_name, stepsOf) => {
  describe.each(SIZES)('size %i', (size) => {
    it.each(SEEDS)('seed %i: replaying steps sorts the array, input untouched', (seed) => {
      const input = shuffledArray(size, seed);
      const snapshot = [...input];
      const steps = stepsOf(input);
      expect(input).toEqual(snapshot); // no mutation
      const expected = [...input].sort((a, b) => a - b);
      expect(applySteps(input, steps)).toEqual(expected);
      expect(input).toEqual(snapshot); // applySteps does not mutate either
    });
  });
});

describe('quickSortSteps worst-case guard', () => {
  it('handles an already-sorted 64-element array within a sane step bound', () => {
    const sorted = Array.from({ length: 64 }, (_, i) => i + 1);
    const steps = quickSortSteps(sorted);
    expect(steps.length).toBeLessThan(64 * 64 * 4);
    expect(applySteps(sorted, steps)).toEqual(sorted);
  });
});

describe('shuffledArray', () => {
  it('is deterministic: same seed yields the same array', () => {
    expect(shuffledArray(33, 7)).toEqual(shuffledArray(33, 7));
  });

  it('different seeds yield different arrays', () => {
    expect(shuffledArray(33, 7)).not.toEqual(shuffledArray(33, 8));
  });

  it('contains exactly the values 1..n', () => {
    const a = shuffledArray(33, 42);
    expect([...a].sort((x, y) => x - y)).toEqual(Array.from({ length: 33 }, (_, i) => i + 1));
  });
});
