// src/hooks/useStats.ts
import { useMemo } from 'react';
import { useJournal } from '@/hooks/useJournal';
import { useStreak } from '@/hooks/useStreak';
import type { VerdictType } from '@/types/horary';

export interface JournalStats {
  total: number;
  verdictCounts: Record<VerdictType, number>;
  verdictPercents: Record<VerdictType, number>;
  outcomesSet: number;
  accuracyPercent: number | null;
  avgRadicalityScore: number | null;
  topCategories: { category: string; count: number }[];
  questionsByMonth: { label: string; count: number }[];
  currentStreak: number;
  maxStreak: number;
}

const VERDICTS: VerdictType[] = ['YES', 'NO', 'UNCLEAR', 'MAYBE'];
const MONTH_ABBREV = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function useStats(): JournalStats | null {
  const { entries } = useJournal();
  const streak = useStreak();

  return useMemo(() => {
    if (entries.length === 0) return null;

    const total = entries.length;

    const verdictCounts: Record<VerdictType, number> = {
      YES: 0,
      NO: 0,
      UNCLEAR: 0,
      MAYBE: 0,
    };
    for (const entry of entries) {
      verdictCounts[entry.verdict] += 1;
    }

    const verdictPercents: Record<VerdictType, number> = {
      YES: 0,
      NO: 0,
      UNCLEAR: 0,
      MAYBE: 0,
    };
    for (const verdict of VERDICTS) {
      verdictPercents[verdict] =
        total === 0 ? 0 : round1((verdictCounts[verdict] / total) * 100);
    }

    const outcomesSet = entries.filter(
      (e) => e.outcome !== null && e.outcome !== undefined
    ).length;

    const cameTrue = entries.filter((e) => e.outcome === 'came_true').length;
    const didNotHappen = entries.filter(
      (e) => e.outcome === 'did_not_happen'
    ).length;
    const decided = cameTrue + didNotHappen;
    const accuracyPercent =
      decided < 2 ? null : round1((cameTrue / decided) * 100);

    const scored = entries.filter((e) => e.radicality_score !== undefined);
    const avgRadicalityScore =
      scored.length === 0
        ? null
        : round1(
            scored.reduce((sum, e) => sum + (e.radicality_score ?? 0), 0) /
              scored.length
          );

    const categoryCounts = new Map<string, number>();
    for (const entry of entries) {
      if (entry.category === undefined) continue;
      categoryCounts.set(
        entry.category,
        (categoryCounts.get(entry.category) ?? 0) + 1
      );
    }
    const topCategories = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const now = new Date();
    const questionsByMonth: { label: string; count: number }[] = [];
    for (let offset = 5; offset >= 0; offset--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const label = `${MONTH_ABBREV[month]} ${String(year).slice(-2)}`;
      const count = entries.filter((e) => {
        const d = new Date(e.timestamp);
        return d.getFullYear() === year && d.getMonth() === month;
      }).length;
      questionsByMonth.push({ label, count });
    }

    return {
      total,
      verdictCounts,
      verdictPercents,
      outcomesSet,
      accuracyPercent,
      avgRadicalityScore,
      topCategories,
      questionsByMonth,
      currentStreak: streak.current,
      maxStreak: streak.max,
    };
  }, [entries, streak]);
}
