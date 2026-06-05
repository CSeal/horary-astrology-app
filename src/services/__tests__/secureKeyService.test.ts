// src/services/__tests__/secureKeyService.test.ts
import * as SecureStore from 'expo-secure-store';
import { secureKeyService } from '@/services/secureKeyService';
import { SECURE_STORE_KEY_API } from '@/constants/config';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'after_first_unlock',
}));

const mockGetItem = SecureStore.getItemAsync as jest.Mock;

describe('secureKeyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getKey', () => {
    it('returns the string when SecureStore resolves a value', async () => {
      mockGetItem.mockResolvedValueOnce('test-api-key');
      await expect(secureKeyService.getKey()).resolves.toBe('test-api-key');
      expect(mockGetItem).toHaveBeenCalledWith(SECURE_STORE_KEY_API);
    });

    it('returns null when SecureStore resolves null', async () => {
      mockGetItem.mockResolvedValueOnce(null);
      await expect(secureKeyService.getKey()).resolves.toBeNull();
    });

    it('returns null and calls console.warn when SecureStore throws', async () => {
      mockGetItem.mockRejectedValueOnce(new Error('read error'));
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        await expect(secureKeyService.getKey()).resolves.toBeNull();
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('[secureKeyService]')
        );
      } finally {
        warn.mockRestore();
      }
    });
  });

  describe('setKey', () => {
    it('calls setItemAsync with the correct key, value, and keychainAccessible option', async () => {
      await secureKeyService.setKey('my-key');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        SECURE_STORE_KEY_API,
        'my-key',
        { keychainAccessible: 'after_first_unlock' }
      );
    });
  });

  describe('deleteKey', () => {
    it('calls deleteItemAsync with SECURE_STORE_KEY_API', async () => {
      await secureKeyService.deleteKey();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SECURE_STORE_KEY_API);
    });
  });
});
