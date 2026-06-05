// src/services/onThisDayService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { JournalEntry } from '@/types/journal';

const DISMISSED_KEY_PREFIX = 'otd_dismissed_';

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export function findOnThisDayEntries(entries: JournalEntry[]): JournalEntry[] {
  const today = new Date();
  const todayDOY = getDayOfYear(today);
  const thisYear = today.getFullYear();

  return entries
    .filter((e) => {
      const d = new Date(e.timestamp);
      if (d.getFullYear() >= thisYear) return false;
      const doy = getDayOfYear(d);
      return Math.abs(doy - todayDOY) <= 3;
    })
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

export async function isDismissedToday(): Promise<boolean> {
  const key = `${DISMISSED_KEY_PREFIX}${new Date().toLocaleDateString('en-CA')}`;
  const val = await AsyncStorage.getItem(key);
  return val === '1';
}

export async function dismissToday(): Promise<void> {
  const key = `${DISMISSED_KEY_PREFIX}${new Date().toLocaleDateString('en-CA')}`;
  await AsyncStorage.setItem(key, '1');
}
