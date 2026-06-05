// src/services/__tests__/notificationService.test.ts
// Schedule queue behaviour: FIFO cap at MAX_SCHEDULED (50), per-entry
// cancellation, and pruning of already-fired reminders. expo-notifications is
// fully mocked; AsyncStorage uses the official in-memory jest mock so the
// persisted queue round-trips exactly as it does on device.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  schedule,
  cancel,
  pruneExpired,
  requestPermission,
} from '@/services/notificationService';
import type { JournalEntry } from '@/types/journal';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notif-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

jest.mock(
  '@react-native-async-storage/async-storage',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const STORAGE_KEY = 'horary_notification_schedule';

interface ScheduledItem {
  entryId: string;
  notificationId: string;
  scheduledFor: string;
}

function entry(id: string): JournalEntry {
  return {
    id,
    question: `Question ${id}?`,
    verdict: 'YES',
    confidence_band: 'high',
    summary: 'Summary.',
    significators: [],
    voc_moon: false,
    timestamp: '2026-05-28T12:00:00.000Z',
  };
}

async function readQueue(): Promise<ScheduledItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as ScheduledItem[]) : [];
}

// Seed a queue of `count` items, all scheduled in the future, oldest first.
async function seedQueue(count: number): Promise<void> {
  const items: ScheduledItem[] = Array.from({ length: count }, (_, i) => ({
    entryId: `seed-${i}`,
    notificationId: `seed-notif-${i}`,
    // Increasing future dates so index 0 is the oldest.
    scheduledFor: new Date(Date.now() + (i + 1) * 60 * 60 * 1000).toISOString(),
  }));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

describe('notificationService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
      'mock-notif-id'
    );
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
  });

  it('schedule with empty queue adds one item and schedules once', async () => {
    await schedule(entry('a'), 14, 'Question a?', 'What happened?');

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const queue = await readQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].entryId).toBe('a');
    expect(queue[0].notificationId).toBe('mock-notif-id');
  });

  it('schedule with 49 items grows the queue to 50 without eviction', async () => {
    await seedQueue(49);

    await schedule(entry('new'), 7, 'Question new?', 'What happened?');

    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
    const queue = await readQueue();
    expect(queue).toHaveLength(50);
    expect(queue[queue.length - 1].entryId).toBe('new');
  });

  it('schedule at capacity (50) evicts the oldest and stays at 50', async () => {
    await seedQueue(50);

    await schedule(entry('new'), 30, 'Question new?', 'What happened?');

    // Oldest (seed-0) cancelled, exactly once.
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'seed-notif-0'
    );
    const queue = await readQueue();
    expect(queue).toHaveLength(50);
    expect(queue.find((i) => i.entryId === 'seed-0')).toBeUndefined();
    expect(queue[queue.length - 1].entryId).toBe('new');
  });

  it('cancel with an existing entryId removes it and cancels the OS notification', async () => {
    await schedule(entry('a'), 14, 'Question a?', 'What happened?');
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
      'mock-notif-id-2'
    );
    await schedule(entry('b'), 14, 'Question b?', 'What happened?');

    await cancel('a');

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'mock-notif-id'
    );
    const queue = await readQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].entryId).toBe('b');
  });

  it('cancel with an unknown entryId is a no-op and leaves the queue intact', async () => {
    await schedule(entry('a'), 14, 'Question a?', 'What happened?');
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockClear();

    await expect(cancel('does-not-exist')).resolves.toBeUndefined();

    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
    const queue = await readQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].entryId).toBe('a');
  });

  it('pruneExpired drops past-dated items and keeps future ones', async () => {
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const seeded: ScheduledItem[] = [
      { entryId: 'old', notificationId: 'n-old', scheduledFor: past },
      { entryId: 'fresh', notificationId: 'n-fresh', scheduledFor: future },
    ];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));

    await pruneExpired();

    const queue = await readQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].entryId).toBe('fresh');
  });

  it('pruneExpired is a no-op and does not save when all items are in the future', async () => {
    // Seed 2 future items
    const future1 = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString();
    const future2 = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const seeded = [
      { entryId: 'a', notificationId: 'n-a', scheduledFor: future1 },
      { entryId: 'b', notificationId: 'n-b', scheduledFor: future2 },
    ];
    await AsyncStorage.setItem('horary_notification_schedule', JSON.stringify(seeded));

    // Spy on setItem AFTER seeding, then clear the seed call so only pruneExpired calls count
    const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
    setItemSpy.mockClear();

    await pruneExpired();

    // Queue unchanged — nothing was expired
    const raw = await AsyncStorage.getItem('horary_notification_schedule');
    const queue = raw ? JSON.parse(raw) : [];
    expect(queue).toHaveLength(2);
    // setItem should NOT have been called (the `active.length !== queue.length` condition is false)
    expect(setItemSpy).not.toHaveBeenCalled();

    setItemSpy.mockRestore();
  });

  it('schedule is a no-op when permission is denied', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    await schedule(entry('perm-denied'), 7, 'Q?', 'What happened?');
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    const queue = await readQueue();
    expect(queue).toHaveLength(0);
  });
});

describe('requestPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true immediately when permission is already granted', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });
    await expect(requestPermission()).resolves.toBe(true);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('requests permission when not already granted and returns true if user allows', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });
    await expect(requestPermission()).resolves.toBe(true);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('requests permission when not already granted and returns false if user denies', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    await expect(requestPermission()).resolves.toBe(false);
  });
});
