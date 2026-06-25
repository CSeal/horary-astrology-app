// src/stores/__tests__/settingsStore.test.ts
// Unit tests for settingsStore locale resolution on hydrate:
//  - a persisted (manual) locale always wins
//  - with none stored, the device language is used when we ship a translation
//  - otherwise we fall back to 'en'
//  - auto-detection is never persisted (device locale keeps following until a
//    manual pick is made)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettingsStore } from '@/stores/settingsStore';
import { ASYNC_STORAGE_KEYS } from '@/constants/config';

// Mock AsyncStorage
jest.mock(
  '@react-native-async-storage/async-storage',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mutable device-locale list driven per-test via setDeviceLocales().
const mockGetLocales = jest.fn<{ languageCode: string | null }[], []>(() => [
  { languageCode: 'en' },
]);
jest.mock('expo-localization', () => ({
  getLocales: () => mockGetLocales(),
}));

function setDeviceLocales(codes: (string | null)[]) {
  mockGetLocales.mockReturnValue(codes.map((languageCode) => ({ languageCode })));
}

// secureKeyService reads from expo-secure-store — stub it out.
jest.mock('../../services/secureKeyService', () => ({
  secureKeyService: { getKey: jest.fn().mockResolvedValue(null) },
}));

describe('settingsStore — locale resolution on hydrate', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    setDeviceLocales(['en']);
    useSettingsStore.setState({ locale: 'en' });
  });

  it('uses a persisted manual locale even when the device language differs', async () => {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.LANGUAGE, 'de');
    setDeviceLocales(['ru']);
    await useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().locale).toBe('de');
  });

  it('falls back to the device language when nothing is stored', async () => {
    setDeviceLocales(['ru']);
    await useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().locale).toBe('ru');
  });

  it('walks the preferred-language list and picks the first supported one', async () => {
    // Top preference (Japanese) is unsupported; should skip to French.
    setDeviceLocales(['ja', 'fr', 'en']);
    await useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().locale).toBe('fr');
  });

  it("defaults to 'en' when no device language is supported", async () => {
    setDeviceLocales(['ja', 'zh', 'ko']);
    await useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().locale).toBe('en');
  });

  it("defaults to 'en' when languageCode is null", async () => {
    setDeviceLocales([null]);
    await useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().locale).toBe('en');
  });

  it('does not persist the auto-detected locale', async () => {
    setDeviceLocales(['ru']);
    await useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().locale).toBe('ru');
    // No manual choice was made — storage must stay empty so the next launch
    // keeps following the device language.
    expect(await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.LANGUAGE)).toBeNull();
  });

  it('ignores an unsupported stored locale and uses the device language', async () => {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.LANGUAGE, 'ja');
    setDeviceLocales(['de']);
    await useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().locale).toBe('de');
  });
});
