/**
 * Pure sorting-algorithm step generators.
 *
 * Each generator takes an input array, never mutates it, and returns the full
 * list of steps the algorithm would perform. Replaying the steps with
 * `applySteps` reproduces the sorted array — which is exactly what the unit
 * tests assert and what the visualizer animates.
 */

export type SortStep =
  | { type: 'compare'; i: number; j: number }
  | { type: 'swap'; i: number; j: number }
  | { type: 'set'; i: number; value: number };

type Recorder = {
  a: number[];
  steps: SortStep[];
  compare: (i: number, j: number) => void;
  swap: (i: number, j: number) => void;
  set: (i: number, value: number) => void;
};

function recorder(input: number[]): Recorder {
  const a = [...input];
  const steps: SortStep[] = [];
  return {
    a,
    steps,
    compare(i, j) {
      steps.push({ type: 'compare', i, j });
    },
    swap(i, j) {
      steps.push({ type: 'swap', i, j });
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    },
    set(i, value) {
      steps.push({ type: 'set', i, value });
      a[i] = value;
    },
  };
}

export function bubbleSortSteps(input: number[]): SortStep[] {
  const r = recorder(input);
  const { a } = r;
  for (let end = a.length - 1; end > 0; end--) {
    let swapped = false;
    for (let i = 0; i < end; i++) {
      r.compare(i, i + 1);
      if (a[i] > a[i + 1]) {
        r.swap(i, i + 1);
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return r.steps;
}

export function insertionSortSteps(input: number[]): SortStep[] {
  const r = recorder(input);
  const { a } = r;
  for (let i = 1; i < a.length; i++) {
    for (let j = i; j > 0; j--) {
      r.compare(j - 1, j);
      if (a[j - 1] <= a[j]) break;
      r.swap(j - 1, j);
    }
  }
  return r.steps;
}

export function selectionSortSteps(input: number[]): SortStep[] {
  const r = recorder(input);
  const { a } = r;
  for (let i = 0; i < a.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      r.compare(min, j);
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) r.swap(i, min);
  }
  return r.steps;
}

/**
 * Lomuto partition with a middle-element pivot, so already-sorted input stays
 * O(n log n) instead of degrading to the worst case.
 */
export function quickSortSteps(input: number[]): SortStep[] {
  const r = recorder(input);
  const { a } = r;
  const sort = (lo: number, hi: number): void => {
    if (lo >= hi) return;
    const mid = lo + ((hi - lo) >> 1);
    if (mid !== hi) r.swap(mid, hi);
    const pivot = a[hi];
    let k = lo;
    for (let j = lo; j < hi; j++) {
      r.compare(j, hi);
      if (a[j] < pivot) {
        if (j !== k) r.swap(k, j);
        k++;
      }
    }
    if (k !== hi) r.swap(k, hi);
    sort(lo, k - 1);
    sort(k + 1, hi);
  };
  sort(0, a.length - 1);
  return r.steps;
}

export function mergeSortSteps(input: number[]): SortStep[] {
  const r = recorder(input);
  const { a } = r;
  const sort = (lo: number, hi: number): void => {
    // half-open range [lo, hi)
    if (hi - lo < 2) return;
    const mid = (lo + hi) >> 1;
    sort(lo, mid);
    sort(mid, hi);
    const merged: number[] = [];
    let i = lo;
    let j = mid;
    while (i < mid && j < hi) {
      r.compare(i, j);
      if (a[i] <= a[j]) merged.push(a[i++]);
      else merged.push(a[j++]);
    }
    while (i < mid) merged.push(a[i++]);
    while (j < hi) merged.push(a[j++]);
    for (let k = 0; k < merged.length; k++) {
      r.set(lo + k, merged[k]);
    }
  };
  sort(0, a.length);
  return r.steps;
}

/** Replays a step list against a copy of the input; `compare` is a no-op. */
export function applySteps(input: number[], steps: SortStep[]): number[] {
  const a = [...input];
  for (const step of steps) {
    if (step.type === 'swap') {
      const t = a[step.i];
      a[step.i] = a[step.j];
      a[step.j] = t;
    } else if (step.type === 'set') {
      a[step.i] = step.value;
    }
  }
  return a;
}

/** mulberry32 — tiny deterministic PRNG; same seed always yields the same stream. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic Fisher–Yates shuffle of the values 1..n, driven by `seed`. */
export function shuffledArray(n: number, seed: number): number[] {
  const rand = mulberry32(seed);
  const a = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}
