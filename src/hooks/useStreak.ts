// src/hooks/useStreak.ts
import { useMemo } from 'react';
import { useJournal } from '@/hooks/useJournal';

export interface StreakData {
  current: number;
  max: number;
}

function dateKey(date: Date): string {
  return date.toLocaleDateString('en-CA');
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const aMs = Date.UTC(ay, am - 1, ad);
  const bMs = Date.UTC(by, bm - 1, bd);
  return Math.abs(Math.round((aMs - bMs) / 86_400_000));
}

export function useStreak(): StreakData {
  const { entries } = useJournal();

  return useMemo(() => {
    if (entries.length === 0) return { current: 0, max: 0 };

    const unique = Array.from(
      new Set(entries.map((e) => dateKey(new Date(e.timestamp))))
    ).sort((a, b) => (a > b ? -1 : 1));

    const now = new Date();
    const today = dateKey(now);
    const yesterday = dateKey(new Date(now.getTime() - 86_400_000));

    let current = 0;
    if (unique[0] === today || unique[0] === yesterday) {
      current = 1;
      for (let i = 1; i < unique.length; i++) {
        if (daysBetween(unique[i - 1], unique[i]) === 1) {
          current += 1;
        } else {
          break;
        }
      }
    }

    let max = 1;
    let run = 1;
    for (let i = 1; i < unique.length; i++) {
      if (daysBetween(unique[i - 1], unique[i]) === 1) {
        run += 1;
      } else {
        run = 1;
      }
      if (run > max) max = run;
    }

    return { current, max };
  }, [entries]);
}
