'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  bubbleSortSteps,
  insertionSortSteps,
  selectionSortSteps,
  quickSortSteps,
  mergeSortSteps,
  shuffledArray,
  type SortStep,
} from '@/playground/algorithms/sorting';

const ALGORITHMS = [
  { id: 'bubble', generate: bubbleSortSteps },
  { id: 'insertion', generate: insertionSortSteps },
  { id: 'selection', generate: selectionSortSteps },
  { id: 'quick', generate: quickSortSteps },
  { id: 'merge', generate: mergeSortSteps },
] as const;

const MIN_SIZE = 10;
const MAX_SIZE = 60;
const DEFAULT_SIZE = 30;
const MIN_SPEED = 1;
const MAX_SPEED = 10;
const DEFAULT_SPEED = 4;

type Runner = { array: number[]; index: number };

function activeIndices(steps: SortStep[], runner: Runner): Set<number> {
  if (runner.index >= steps.length) return new Set();
  const step = steps[runner.index];
  return step.type === 'set' ? new Set([step.i]) : new Set([step.i, step.j]);
}

export function SortingRace() {
  const t = useTranslations('playground');
  const [seed, setSeed] = useState(1);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [running, setRunning] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [, setTick] = useState(0);

  // Precomputed once per shuffle/size; the animation only replays these lists.
  const baseArray = useMemo(() => shuffledArray(size, seed), [size, seed]);
  const stepLists = useMemo(() => ALGORITHMS.map((a) => a.generate(baseArray)), [baseArray]);

  // Live array states live in a ref (mutated in place each frame) so per-frame
  // work stays proportional to the panel count — no replay-from-scratch.
  const key = `${size}:${seed}:${resetCount}`;
  const runnersRef = useRef<{ key: string; runners: Runner[] } | null>(null);
  if (runnersRef.current === null || runnersRef.current.key !== key) {
    runnersRef.current = {
      key,
      runners: ALGORITHMS.map(() => ({ array: [...baseArray], index: 0 })),
    };
  }
  const runners = runnersRef.current.runners;
  const allDone = runners.every((r, p) => r.index >= stepLists[p].length);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const frame = () => {
      const current = runnersRef.current;
      if (!current) return;
      let finished = true;
      for (let p = 0; p < current.runners.length; p++) {
        const r = current.runners[p];
        const steps = stepLists[p];
        for (let n = 0; n < speed && r.index < steps.length; n++) {
          const step = steps[r.index++];
          if (step.type === 'swap') {
            const tmp = r.array[step.i];
            r.array[step.i] = r.array[step.j];
            r.array[step.j] = tmp;
          } else if (step.type === 'set') {
            r.array[step.i] = step.value;
          }
        }
        if (r.index < steps.length) finished = false;
      }
      setTick((n) => n + 1);
      if (finished) setRunning(false);
      else raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [running, speed, stepLists]);

  const shuffle = () => {
    setRunning(false);
    setSeed((s) => s + 1);
  };
  const reset = () => {
    setRunning(false);
    setResetCount((c) => c + 1);
  };
  const toggle = () => {
    if (!running && allDone) setResetCount((c) => c + 1);
    setRunning((r) => !r);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-lg border border-line bg-panel p-4 font-mono text-xs">
        <button
          type="button"
          onClick={toggle}
          className="rounded bg-accent px-3 py-1.5 font-medium text-accent-contrast hover:opacity-90"
        >
          {running ? t('pause') : t('start')}
        </button>
        <button
          type="button"
          onClick={shuffle}
          className="rounded border border-line px-3 py-1.5 text-fg hover:border-line-strong"
        >
          {t('shuffle')}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded border border-line px-3 py-1.5 text-fg hover:border-line-strong"
        >
          {t('reset')}
        </button>
        <label className="flex items-center gap-2 text-muted">
          <span>
            {t('size')}: {size}
          </span>
          <input
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={size}
            aria-label={t('size')}
            onChange={(e) => {
              setRunning(false);
              setSize(Number(e.target.value));
            }}
            className="accent-accent"
          />
        </label>
        <label className="flex items-center gap-2 text-muted">
          <span>
            {t('speed')}: {speed}
          </span>
          <input
            type="range"
            min={MIN_SPEED}
            max={MAX_SPEED}
            value={speed}
            aria-label={t('speed')}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="accent-accent"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ALGORITHMS.map((algo, p) => {
          const runner = runners[p];
          const steps = stepLists[p];
          const done = runner.index >= steps.length;
          const active = activeIndices(steps, runner);
          return (
            <div
              key={algo.id}
              className={`rounded-lg border bg-panel p-3 ${done ? 'border-accent' : 'border-line'}`}
            >
              <div className="mb-2 flex items-baseline justify-between font-mono text-xs">
                <span className="text-fg">{algo.id}</span>
                <span className="text-muted">
                  {t('steps')}: {runner.index}
                  {done && <span className="ml-2 text-accent">{t('done')}</span>}
                </span>
              </div>
              <div className="flex h-28 items-end gap-px" aria-hidden="true">
                {runner.array.map((value, i) => (
                  <div
                    key={i}
                    className={`min-w-0 flex-1 rounded-t-[1px] ${
                      active.has(i) ? 'bg-accent' : done ? 'bg-accent/40' : 'bg-line-strong'
                    }`}
                    style={{ height: `${(value / size) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
