// src/services/notificationService.ts
// Outcome reminder push notifications (Stage 6c).
// Schedules a local notification N days after a reading is saved, reminding the
// user to mark its outcome. The schedule queue is persisted in AsyncStorage so a
// FIFO cap (MAX_SCHEDULED) and per-entry cancellation survive app restarts.
//
// Exports both named functions and a `notificationService` aggregate object so
// callers may import either style.

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { JournalEntry } from '@/types/journal';

const MAX_SCHEDULED = 50;
const STORAGE_KEY = 'horary_notification_schedule';

interface ScheduledItem {
  entryId: string;
  notificationId: string;
  scheduledFor: string; // ISO string
}

async function loadQueue(): Promise<ScheduledItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as ScheduledItem[]) : [];
}

async function saveQueue(queue: ScheduledItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export async function requestPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function schedule(
  entry: JournalEntry,
  delayDays: number,
  questionLabel: string, // pre-translated question truncated to 80 chars by caller
  titleLabel: string // pre-translated "What happened?"
): Promise<void> {
  const granted = await requestPermission();
  if (!granted) return;

  const scheduledFor = new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000);

  const queue = await loadQueue();

  if (queue.length >= MAX_SCHEDULED) {
    // FIFO: cancel oldest scheduled (first in array, already sorted by scheduledFor)
    const oldest = queue.shift();
    /* istanbul ignore else */
    if (oldest) {
      await Notifications.cancelScheduledNotificationAsync(oldest.notificationId).catch(/* istanbul ignore next */ () => {});
    }
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: titleLabel,
      body: questionLabel,
      data: { entryId: entry.id },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: scheduledFor,
    },
  });

  queue.push({ entryId: entry.id, notificationId, scheduledFor: scheduledFor.toISOString() });
  await saveQueue(queue);
}

export async function cancel(entryId: string): Promise<void> {
  const queue = await loadQueue();
  const idx = queue.findIndex((item) => item.entryId === entryId);
  if (idx === -1) return;
  const [removed] = queue.splice(idx, 1);
  await Notifications.cancelScheduledNotificationAsync(removed.notificationId).catch(/* istanbul ignore next */ () => {});
  await saveQueue(queue);
}

export async function pruneExpired(): Promise<void> {
  const now = new Date().toISOString();
  const queue = await loadQueue();
  const active = queue.filter((item) => item.scheduledFor > now);
  if (active.length !== queue.length) await saveQueue(active);
}

export const notificationService = {
  requestPermission,
  schedule,
  cancel,
  pruneExpired,
};
