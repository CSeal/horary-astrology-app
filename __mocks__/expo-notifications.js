// __mocks__/expo-notifications.js
// Auto-applied jest mock for the expo-notifications native module (root-level
// __mocks__ entries for node_modules are picked up automatically, no jest.mock
// call needed). Importing the real module under jest-expo triggers Expo Go
// push-token auto-registration warnings; this no-op stub keeps suites that only
// transitively import notificationService (e.g. questionsStore) clean.
//
// Tests that assert on notification calls (notificationService.test.ts) declare
// their own explicit jest.mock with jest.fn() spies, which overrides this file.

module.exports = {
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notif-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  setNotificationHandler: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
};
