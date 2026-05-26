// src/services/secureKeyService.ts
// SecureStore wrapper for the API key.
// API key is NEVER stored in AsyncStorage or logged.

import * as SecureStore from 'expo-secure-store';
import { SECURE_STORE_KEY_API } from '../constants/config';

export const secureKeyService = {
  async getKey(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(SECURE_STORE_KEY_API);
    } catch {
      console.warn('[secureKeyService] Failed to read API key from SecureStore');
      return null;
    }
  },

  async setKey(key: string): Promise<void> {
    await SecureStore.setItemAsync(SECURE_STORE_KEY_API, key, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  },

  async deleteKey(): Promise<void> {
    await SecureStore.deleteItemAsync(SECURE_STORE_KEY_API);
  },
};
